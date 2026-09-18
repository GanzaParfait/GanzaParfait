import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { CvPdfDocument } from "@/lib/cv-pdf";
import {
  canAccessCvTemplate,
  cvPdfFilename,
  isCvTemplateId,
  resolveCvDocument,
} from "@/lib/cv";
import { getServerSiteSettings } from "@/lib/site-settings-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAdmin(request: NextRequest): boolean {
  return request.cookies.get("ppg_admin_auth")?.value === "true";
}

export async function GET(request: NextRequest) {
  try {
    const settings = await getServerSiteSettings();
    const raw = request.nextUrl.searchParams.get("template");
    const template = isCvTemplateId(raw) ? raw : undefined;
    const doc = resolveCvDocument(settings, template);
    const admin = isAdmin(request);

    if (!canAccessCvTemplate(settings, doc.template, admin)) {
      return NextResponse.json({ error: "This CV format is not public." }, { status: 403 });
    }

    const buffer = await renderToBuffer(<CvPdfDocument doc={doc} />);
    const filename = cvPdfFilename(doc.template);
    const bytes = new Uint8Array(buffer);
    const forceDownload = request.nextUrl.searchParams.get("download") === "1";

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${forceDownload ? "attachment" : "inline"}; filename="${filename}"`,
        "Cache-Control": "private, no-store, max-age=0, must-revalidate",
      },
    });
  } catch (error) {
    console.error("CV PDF generation failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate PDF." },
      { status: 500 }
    );
  }
}
