import { NextRequest, NextResponse } from "next/server";

// Common paths where organisations publish their values
const VALUE_PATHS = [
  "",
  "/about",
  "/about-us",
  "/our-values",
  "/values",
  "/sustainability",
  "/esg",
  "/our-story",
  "/mission",
  "/purpose",
  "/corporate-responsibility",
  "/responsibility",
];

// Strip HTML tags and extract readable text
function htmlToText(html: string): string {
  // Remove script and style blocks entirely
  let text = html.replace(/<script[\s\S]*?<\/script>/gi, "");
  text = text.replace(/<style[\s\S]*?<\/style>/gi, "");
  text = text.replace(/<noscript[\s\S]*?<\/noscript>/gi, "");

  // Remove nav, header, footer (often noise)
  text = text.replace(/<nav[\s\S]*?<\/nav>/gi, "");

  // Replace common block elements with newlines
  text = text.replace(/<\/(p|div|h[1-6]|li|tr|blockquote|section|article)>/gi, "\n");
  text = text.replace(/<br\s*\/?>/gi, "\n");

  // Strip all remaining tags
  text = text.replace(/<[^>]+>/g, " ");

  // Decode common HTML entities
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#039;/g, "'");
  text = text.replace(/&apos;/g, "'");
  text = text.replace(/&nbsp;/g, " ");
  text = text.replace(/&#\d+;/g, "");

  // Clean up whitespace
  text = text.replace(/[ \t]+/g, " ");
  text = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");

  return text.trim();
}

// Extract page title from HTML
function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? match[1].replace(/\s+/g, " ").trim() : "";
}

// Try to find meta description
function extractMetaDescription(html: string): string {
  const match = html.match(
    /<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i
  );
  return match ? match[1].trim() : "";
}

async function fetchPage(
  url: string,
  timeoutMs: number = 8000
): Promise<{ html: string; ok: boolean }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; StratosphericSignalAudit/1.0; +https://thecxevolutionist.ai)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return { html: "", ok: false };
    }

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
      return { html: "", ok: false };
    }

    const html = await res.text();
    return { html, ok: true };
  } catch {
    return { html: "", ok: false };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "Please provide a URL." },
        { status: 400 }
      );
    }

    // Normalise URL
    let baseUrl = url.trim();
    if (!baseUrl.startsWith("http://") && !baseUrl.startsWith("https://")) {
      baseUrl = "https://" + baseUrl;
    }
    // Remove trailing slash for clean path joining
    baseUrl = baseUrl.replace(/\/+$/, "");

    // Extract just the origin for path crawling
    let origin: string;
    try {
      const parsed = new URL(baseUrl);
      origin = parsed.origin;
    } catch {
      return NextResponse.json(
        { error: "Invalid URL. Please enter a valid website address." },
        { status: 400 }
      );
    }

    console.log(`Scraping ${origin} across ${VALUE_PATHS.length} paths...`);

    // Crawl the homepage and value-related paths concurrently
    const crawlPromises = VALUE_PATHS.map(async (path) => {
      const fullUrl = origin + path;
      const { html, ok } = await fetchPage(fullUrl);
      if (!ok || !html) return null;

      const text = htmlToText(html);
      const title = extractTitle(html);
      const description = extractMetaDescription(html);

      // Skip pages with very little content (likely redirects or error pages)
      if (text.length < 100) return null;

      return {
        url: fullUrl,
        path: path || "/",
        title,
        description,
        text,
        charCount: text.length,
      };
    });

    const results = await Promise.all(crawlPromises);
    const pages = results.filter(Boolean) as Array<{
      url: string;
      path: string;
      title: string;
      description: string;
      text: string;
      charCount: number;
    }>;

    if (pages.length === 0) {
      return NextResponse.json(
        {
          error:
            "We couldn't read any content from that URL. The site may block automated access. Try pasting your content directly instead.",
          fallbackToPaste: true,
        },
        { status: 422 }
      );
    }

    console.log(
      `Successfully crawled ${pages.length} pages from ${origin}`
    );

    // Combine all page text, keeping it under a reasonable token limit
    // Prioritise: homepage, then pages with "value/sustainability/esg" in the path
    const prioritised = pages.sort((a, b) => {
      const priorityPaths = [
        "values",
        "sustainability",
        "esg",
        "purpose",
        "mission",
        "responsibility",
      ];
      const aHasPriority = priorityPaths.some((p) =>
        a.path.toLowerCase().includes(p)
      );
      const bHasPriority = priorityPaths.some((p) =>
        b.path.toLowerCase().includes(p)
      );

      if (a.path === "/" && b.path !== "/") return -1;
      if (b.path === "/" && a.path !== "/") return 1;
      if (aHasPriority && !bHasPriority) return -1;
      if (bHasPriority && !aHasPriority) return 1;
      return b.charCount - a.charCount;
    });

    let combinedText = "";
    const includedPages: string[] = [];
    const maxChars = 50000; // ~12k tokens, leaves room for prompts

    for (const page of prioritised) {
      const section = `\n\n=== PAGE: ${page.title || page.path} (${page.url}) ===\n${page.description ? `Description: ${page.description}\n` : ""}${page.text}`;

      if (combinedText.length + section.length > maxChars) {
        // Include a truncated version if there's still room
        const remaining = maxChars - combinedText.length;
        if (remaining > 500) {
          combinedText += section.slice(0, remaining) + "\n[...truncated]";
          includedPages.push(page.url + " (partial)");
        }
        break;
      }

      combinedText += section;
      includedPages.push(page.url);
    }

    return NextResponse.json({
      content: combinedText.trim(),
      pagesScraped: pages.length,
      pagesIncluded: includedPages,
      origin,
    });
  } catch (err) {
    console.error("Scrape route error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while reading that website." },
      { status: 500 }
    );
  }
}
