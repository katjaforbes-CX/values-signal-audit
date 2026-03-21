import { NextRequest, NextResponse } from "next/server";

const EXTRACTION_PROMPT = `You are a signal extraction assistant. The user will paste content from their business — a values statement, ESG report, sustainability page, brand guidelines, or similar document.

Your task: extract every distinct value, commitment, or principle the business claims to hold. For each one, assign:

- name: a clear, specific one-sentence statement of the value
- category: one of [Environmental/Sustainability, Human Oversight/Governance, Data Privacy/Security, Ethical Sourcing/Supply Chain, Inclusion/Equity, Quality/Safety Standards, Pricing/Commercial Ethics, Customer Protection, Other]
- strength: "hard" (never compromised) | "strong" | "moderate"
- locationGuess: your best guess where this signal lives: "schema" | "llms" | "api" | "product-page" | "human-pdf" | "human-deck" | "human-web" | "not-documented"
- corroborationGuess: "cert-strong" | "analyst" | "wikipedia" | "earned-media" | "reviews" | "industry-body" | "case-study" | "own-site" | "none"

Return ONLY a JSON array. No preamble, no explanation, no markdown fences.

Example output:
[{"name":"We prioritise ethical sourcing across our entire supply chain","category":"Ethical Sourcing / Supply Chain","strength":"hard","locationGuess":"human-web","corroborationGuess":"none"}]`;

export async function POST(req: NextRequest) {
  try {
    const { content } = await req.json();

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { error: "Please provide content to analyse." },
        { status: 400 }
      );
    }

    // Truncate very long content to ~8000 words to stay within model limits
    const words = content.split(/\s+/);
    const trimmedContent =
      words.length > 8000 ? words.slice(0, 8000).join(" ") : content;

    const apiKey = process.env.SYNTHETIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured." },
        { status: 500 }
      );
    }

    const res = await fetch(
      "https://api.synthetic.new/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "meta-llama/Llama-3.3-70B-Instruct",
          messages: [
            { role: "system", content: EXTRACTION_PROMPT },
            { role: "user", content: trimmedContent },
          ],
          temperature: 0.2,
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("Synthetic API error:", res.status, errText);
      return NextResponse.json(
        { error: "Extraction service unavailable. Please try again." },
        { status: 502 }
      );
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? "[]";

    // Parse — the model should return clean JSON but handle edge cases
    let values;
    try {
      // Strip markdown fences if present
      const cleaned = raw.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      values = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse extraction response:", raw);
      return NextResponse.json(
        { error: "Could not parse extraction results. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ values });
  } catch (err) {
    console.error("Extract route error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
