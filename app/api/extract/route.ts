import { NextRequest, NextResponse } from "next/server";

const AUDIT_PROMPT = `You are a Stratospheric Signal Auditor. You assess whether a business's values are visible and verifiable to AI agents acting on behalf of human buyers.

Context: In the emerging world of agentic commerce, AI agents shop on behalf of humans. These agents carry encoded values from their principals (e.g. "only buy from ethical suppliers", "prefer carbon-neutral vendors"). When an agent evaluates a potential vendor, it looks for two things:
1. SIGNAL VISIBILITY — Can the agent find and read these values in machine-readable formats?
2. SIGNAL CORROBORATION — Can the agent find independent third-party evidence that confirms these values are real?

The Three Altitudes framework:
- FOUNDATION: Values exist but are not machine-readable. An agent cannot find them.
- TRUST: Some values are machine-readable OR have some independent corroboration, but coverage is incomplete.
- STRATOSPHERIC: 50%+ of values are both machine-readable AND independently corroborated. The agent can verify the business is who it claims to be.

The user will paste content from their business — a values statement, sustainability report, ESG document, website copy, brand guidelines, or similar.

YOUR TASK: Perform a complete Stratospheric Signal Audit. Return a JSON object with this exact structure:

{
  "organisationName": "Best guess at the organisation name from the content, or 'Your Organisation' if unclear",
  "summary": "2-3 sentence executive summary of the audit findings. Be direct and specific.",
  "values": [
    {
      "name": "Clear one-sentence statement of the value/commitment",
      "category": "One of: Environmental/Sustainability | Human Oversight/Governance | Data Privacy/Security | Ethical Sourcing/Supply Chain | Inclusion/Equity | Quality/Safety Standards | Pricing/Commercial Ethics | Customer Protection | Other",
      "strength": "hard | strong | moderate",
      "currentVisibility": {
        "format": "machine-readable | human-only | not-documented",
        "location": "Where this signal likely lives (e.g. 'Website sustainability page', 'PDF annual report', 'Schema markup on product pages')",
        "assessment": "One sentence on how visible this is to an AI agent right now"
      },
      "currentCorroboration": {
        "level": "strong-independent | some-evidence | self-declared-only | none",
        "sources": "What evidence exists or likely exists (e.g. 'B Corp certified', 'ISO 14001', 'No third-party verification found')",
        "assessment": "One sentence on how verifiable this is to an AI agent right now"
      },
      "gap": true or false,
      "gapType": "visibility | corroboration | both | none",
      "action": "If there is a gap: one specific, concrete action to close it. Not a strategy — a single action. If no gap: null"
    }
  ],
  "altitude": {
    "current": "FOUNDATION | TRUST | STRATOSPHERIC",
    "machineReadableCount": number,
    "strongCorroborationCount": number,
    "totalValues": number,
    "justification": "2 sentences explaining why this altitude was assigned"
  },
  "topThreeActions": [
    {
      "priority": 1,
      "action": "Specific, concrete action. Not vague strategy.",
      "impact": "What this achieves for agent visibility/verification",
      "effort": "Low | Medium | High"
    },
    {
      "priority": 2,
      "action": "...",
      "impact": "...",
      "effort": "..."
    },
    {
      "priority": 3,
      "action": "...",
      "impact": "...",
      "effort": "..."
    }
  ],
  "companionPromptBrief": "A pre-filled version of the signal brief that the user can paste into ChatGPT/Claude/Gemini for further analysis. Include all extracted values, their visibility status, corroboration status, gaps identified, and current altitude. Format as clean structured text, not JSON."
}

RULES:
- Be specific and direct. No hedging, no filler.
- Assess visibility and corroboration based on what is LIKELY true given the content. If they mention a PDF report, that's human-readable only. If they mention schema markup, that's machine-readable.
- When you cannot determine something, say so clearly rather than guessing optimistically.
- Actions must be singular and concrete: "Add JSON-LD schema markup for sustainability claims to your product pages" not "Consider improving your digital presence."
- Return ONLY the JSON object. No preamble, no explanation, no markdown fences.`;

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
          model: "hf:meta-llama/Llama-3.3-70B-Instruct",
          messages: [
            { role: "system", content: AUDIT_PROMPT },
            { role: "user", content: trimmedContent },
          ],
          temperature: 0.2,
          max_tokens: 4096,
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("Synthetic API error:", res.status, errText);
      return NextResponse.json(
        {
          error: `Synthetic API returned ${res.status}: ${errText.slice(0, 200)}`,
        },
        { status: 502 }
      );
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? "{}";

    let audit;
    try {
      const cleaned = raw.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      audit = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse audit response:", raw);
      return NextResponse.json(
        { error: "Could not parse audit results. Please try again." },
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
