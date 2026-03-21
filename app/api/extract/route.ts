import { NextRequest, NextResponse } from "next/server";

// ─── Step 1: Extract values and org name from pasted content ───

const EXTRACT_PROMPT = `You are a signal extraction assistant. The user will paste content from their business.

Extract:
1. The organisation name (best guess from the content, or "Unknown Organisation")
2. Every distinct value, commitment, or principle the business claims to hold

For each value, provide:
- name: clear one-sentence statement
- category: one of [Environmental/Sustainability, Human Oversight/Governance, Data Privacy/Security, Ethical Sourcing/Supply Chain, Inclusion/Equity, Quality/Safety Standards, Pricing/Commercial Ethics, Customer Protection, Other]
- strength: "hard" | "strong" | "moderate"
- searchQueries: array of 2-3 specific web search queries that would find independent evidence for this value (e.g. "CompanyName B Corp certification", "CompanyName ISO 14001", "CompanyName sustainability report third party audit")

Return ONLY a JSON object:
{"organisationName": "...", "values": [{"name": "...", "category": "...", "strength": "...", "searchQueries": ["...", "..."]}]}

No preamble, no explanation, no markdown fences.`;

// ─── Step 2: Full audit with web research context ───

const AUDIT_PROMPT = `You are a Stratospheric Signal Auditor. You assess whether a business's values are visible and verifiable to AI agents acting on behalf of human buyers.

Context: In agentic commerce, AI agents shop on behalf of humans. These agents carry encoded values from their principals. When evaluating a vendor, agents look for:
1. SIGNAL VISIBILITY — Can the agent find and read these values in machine-readable formats?
2. SIGNAL CORROBORATION — Can the agent find independent third-party evidence that confirms these values are real?

The Three Altitudes:
- FOUNDATION: Values exist but are not machine-readable. An agent cannot find them.
- TRUST: Some values are machine-readable OR have some independent corroboration, but coverage is incomplete.
- STRATOSPHERIC: 50%+ of values are both machine-readable AND independently corroborated.

You have been given:
1. The organisation's own content (what they claim)
2. Web search results for each value (what the internet says about them)

YOUR TASK: Using BOTH the organisation's content AND the web research results, perform a complete audit. The web results are real — use them to determine actual corroboration status. If a search found a B Corp listing, that's real corroboration. If it found nothing, that's a real gap.

Return a JSON object:

{
  "organisationName": "...",
  "summary": "2-3 sentence executive summary. Be direct. Reference specific findings from the web research.",
  "values": [
    {
      "name": "Clear one-sentence statement of the value",
      "category": "...",
      "strength": "hard | strong | moderate",
      "currentVisibility": {
        "format": "machine-readable | human-only | not-documented",
        "location": "Where this signal actually lives based on what we found",
        "assessment": "One sentence on how visible this is to an AI agent. Reference specific findings."
      },
      "currentCorroboration": {
        "level": "strong-independent | some-evidence | self-declared-only | none",
        "sources": "Specific sources found (or not found) in the web research. Name them.",
        "assessment": "One sentence on verifiability. Be specific about what evidence exists or is missing."
      },
      "gap": true or false,
      "gapType": "visibility | corroboration | both | none",
      "action": "If gap: one specific action. Reference what was found/not found. If no gap: null"
    }
  ],
  "altitude": {
    "current": "FOUNDATION | TRUST | STRATOSPHERIC",
    "machineReadableCount": 0,
    "strongCorroborationCount": 0,
    "totalValues": 0,
    "justification": "2 sentences. Reference the web research findings."
  },
  "topThreeActions": [
    {"priority": 1, "action": "Specific action based on gaps found", "impact": "What this achieves", "effort": "Low | Medium | High"},
    {"priority": 2, "action": "...", "impact": "...", "effort": "..."},
    {"priority": 3, "action": "...", "impact": "...", "effort": "..."}
  ],
  "webResearchSummary": "3-5 sentence summary of what the web research revealed about this organisation's public presence and third-party verification. What did we find? What was missing?",
  "companionPromptBrief": "Pre-filled signal brief for the user to paste into ChatGPT/Claude/Gemini. Include all values, visibility, corroboration, gaps, altitude, and key web findings. Structured text, not JSON."
}

RULES:
- Use the web research results to make EVIDENCE-BASED assessments, not guesses.
- If a search found a certification, name it. If it found nothing, say so.
- Actions must be singular and concrete.
- Return ONLY the JSON object. No preamble, no markdown fences.`;

// ─── Brave Search helper ───

async function braveSearch(
  query: string,
  apiKey: string
): Promise<string> {
  try {
    const res = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`,
      {
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip",
          "X-Subscription-Token": apiKey,
        },
      }
    );

    if (!res.ok) {
      console.error("Brave search error:", res.status);
      return `[Search failed for: ${query}]`;
    }

    const data = await res.json();
    const results = data.web?.results || [];

    if (results.length === 0) {
      return `[No results found for: ${query}]`;
    }

    return results
      .slice(0, 5)
      .map(
        (r: { title: string; url: string; description: string }) =>
          `- ${r.title}\n  ${r.url}\n  ${r.description}`
      )
      .join("\n\n");
  } catch (err) {
    console.error("Brave search exception:", err);
    return `[Search error for: ${query}]`;
  }
}

// ─── JSON parse helper ───

function parseJSON(raw: string) {
  let cleaned = raw.replace(/```json?\n?/g, "").replace(/```/g, "").trim();

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  // Try direct parse first
  try {
    return JSON.parse(cleaned);
  } catch {
    // Fallback: join lines and clean trailing commas
    const fallback = cleaned
      .split("\n")
      .map((line: string) => line.trimEnd())
      .join("")
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]");
    return JSON.parse(fallback);
  }
}

// ─── LLM call helper ───

async function callLLM(
  systemPrompt: string,
  userContent: string,
  apiKey: string
): Promise<{ parsed: unknown; finishReason: string }> {
  const res = await fetch(
    "https://api.synthetic.new/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "hf:meta-llama/Llama-3.3-70B-Instruct",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        temperature: 0.2,
        max_tokens: 8192,
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    if (res.status === 429) {
      throw new Error("RATE_LIMITED");
    }
    throw new Error(`Synthetic API ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content ?? "{}";
  const finishReason = data.choices?.[0]?.finish_reason ?? "unknown";

  return { parsed: parseJSON(raw), finishReason };
}

// ─── Main handler ───

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Please provide content to analyse." },
        { status: 400 }
      );
    }

    const words = content.split(/\s+/);
    const trimmedContent =
      words.length > 8000 ? words.slice(0, 8000).join(" ") : content;

    const syntheticKey = process.env.SYNTHETIC_API_KEY;
    const braveKey = process.env.BRAVE_API_KEY;

    if (!syntheticKey) {
      return NextResponse.json({ error: "Synthetic API key not configured." }, { status: 500 });
    }
    if (!braveKey) {
      return NextResponse.json({ error: "Brave Search API key not configured." }, { status: 500 });
    }

    // ── Step 1: Extract values and search queries ──
    console.log("Step 1: Extracting values...");
    let extraction: { organisationName: string; values: Array<{ name: string; category: string; strength: string; searchQueries: string[] }> };
    try {
      const result = await callLLM(EXTRACT_PROMPT, trimmedContent, syntheticKey);
      extraction = result.parsed as typeof extraction;
    } catch (err) {
      console.error("Step 1 failed:", err);
      if (err instanceof Error && err.message === "RATE_LIMITED") {
        return NextResponse.json(
          { error: "This tool is experiencing high demand right now. Please try again in a few minutes." },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: "Failed to extract values from your content. Please try again." },
        { status: 500 }
      );
    }

    if (!extraction.values || extraction.values.length === 0) {
      return NextResponse.json(
        { error: "No values or commitments found in the content. Try pasting a values statement, sustainability report, or ESG document." },
        { status: 400 }
      );
    }

    // ── Step 2: Web research for each value ──
    console.log(`Step 2: Researching ${extraction.values.length} values with Brave Search...`);
    const researchResults: string[] = [];

    for (const value of extraction.values) {
      const queries = value.searchQueries || [
        `${extraction.organisationName} ${value.name}`,
        `${extraction.organisationName} ${value.category} certification`,
      ];

      const searchPromises = queries.slice(0, 3).map((q) => braveSearch(q, braveKey));
      const results = await Promise.all(searchPromises);

      researchResults.push(
        `VALUE: "${value.name}"\n` +
          queries
            .slice(0, 3)
            .map((q, i) => `Search: "${q}"\nResults:\n${results[i]}`)
            .join("\n\n")
      );
    }

    // Also search for the org's general digital presence
    const generalSearches = await Promise.all([
      braveSearch(`${extraction.organisationName} schema.org structured data`, braveKey),
      braveSearch(`${extraction.organisationName} llms.txt OR robots.txt`, braveKey),
      braveSearch(`site:${extraction.organisationName.toLowerCase().replace(/\s+/g, "")}.com sustainability OR values OR ESG`, braveKey),
    ]);

    const webResearchContext =
      `ORGANISATION: ${extraction.organisationName}\n\n` +
      `=== GENERAL DIGITAL PRESENCE ===\n` +
      `Schema/Structured Data Search:\n${generalSearches[0]}\n\n` +
      `Machine-Readable Files Search:\n${generalSearches[1]}\n\n` +
      `Site Content Search:\n${generalSearches[2]}\n\n` +
      `=== VALUE-BY-VALUE RESEARCH ===\n\n` +
      researchResults.join("\n\n---\n\n");

    // ── Step 3: Full audit with web context ──
    console.log("Step 3: Generating audit with web research context...");
    const auditInput =
      `ORGANISATION'S OWN CONTENT:\n${trimmedContent}\n\n` +
      `WEB RESEARCH RESULTS:\n${webResearchContext}`;

    let audit;
    try {
      const result = await callLLM(AUDIT_PROMPT, auditInput, syntheticKey);
      audit = result.parsed;
    } catch (err) {
      console.error("Step 3 failed:", err);
      if (err instanceof Error && err.message === "RATE_LIMITED") {
        return NextResponse.json(
          { error: "This tool is experiencing high demand right now. Please try again in a few minutes." },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: "Failed to generate audit report. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ audit });
  } catch (err) {
    console.error("Extract route error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
