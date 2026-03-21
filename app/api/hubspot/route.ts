import { NextRequest, NextResponse } from "next/server";

const PORTAL_ID = "244677595";
const FORM_GUID = "f658e497-1ea4-4baa-b621-826c7b1247b8";

export async function POST(req: NextRequest) {
  try {
    const { email, firstName, lastName, company, websiteUrl } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    const fields: Array<{ objectTypeId: string; name: string; value: string }> = [
      { objectTypeId: "0-1", name: "email", value: email },
    ];

    if (firstName) {
      fields.push({ objectTypeId: "0-1", name: "firstname", value: firstName });
    }
    if (lastName) {
      fields.push({ objectTypeId: "0-1", name: "lastname", value: lastName });
    }
    // Company name maps to the Company object (0-2), not Contact (0-1)
    fields.push({ objectTypeId: "0-2", name: "name", value: company || "Unknown" });
    if (websiteUrl) {
      fields.push({ objectTypeId: "0-1", name: "audited_url", value: websiteUrl });
    }
    // HubSpot doesn't apply hidden field defaults via API — must send explicitly
    fields.push({ objectTypeId: "0-1", name: "lead_origin_name", value: "Values Signal Audit" });

    const res = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${PORTAL_ID}/${FORM_GUID}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fields,
          context: {
            pageName: "Stratospheric Signal Audit",
            pageUri: "https://values-signal.thecxevolutionist.ai",
          },
          legalConsentOptions: {
            consent: {
              consentToProcess: true,
              text: "By running this audit, you agree to receive occasional insights from The CX Evolutionist. You can unsubscribe anytime.",
            },
          },
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("HubSpot form error:", res.status, errText);
      // Don't block the audit if HubSpot fails — log and continue
      return NextResponse.json({ status: "error", detail: errText }, { status: 200 });
    }

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("HubSpot route error:", err);
    // Don't block the audit
    return NextResponse.json({ status: "error" }, { status: 200 });
  }
}
