import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { CvPdfDocument } from "@/lib/cv-pdf";
import {
  canAccessCvTemplate,
  cvPdfFilename,
  isCvTemplateId,
  resolveCvDocument,
  type CvResolvedDocument,
} from "@/lib/cv";
import { resolveLibraryDocument } from "@/lib/cv-document-resolve";
import {
  cvDocumentFilename,
  defaultPublicCvDocument,
  findCvDocument,
  getCvLibrary,
  isCvDocumentPubliclyAccessible,
  type CvDocument,
} from "@/lib/cv-library";
import { getServerSiteSettings } from "@/lib/site-settings-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAdmin(request: NextRequest): boolean {
  return request.cookies.get("ppg_admin_auth")?.value === "true";
}

export async function GET(request: NextRequest) {
  try {
    const settings = await getServerSiteSettings();
    const admin = isAdmin(request);
    const origin = request.nextUrl.origin;
    const forceDownload = request.nextUrl.searchParams.get("download") === "1";
    const rawTemplate = request.nextUrl.searchParams.get("template");
    const docId = request.nextUrl.searchParams.get("doc");

    let resolved: CvResolvedDocument | null = null;
    let filename = "Prince-Parfait-GANZA-CV.pdf";
    let pageSize: "A4" | "LETTER" = "A4";

    // Library documents take precedence; `?template=` keeps legacy links working.
    if (docId || !rawTemplate) {
      const library = getCvLibrary(settings);
      const document: CvDocument | null = docId
        ? findCvDocument(library, docId)
        : defaultPublicCvDocument(library);

      if (docId && !document) {
        return NextResponse.json({ error: "CV document not found." }, { status: 404 });
      }
      if (document && !admin && !isCvDocumentPubliclyAccessible(library, document)) {
        return NextResponse.json({ error: "This CV is not public." }, { status: 403 });
      }

      if (document) {
        resolved = resolveLibraryDocument(document, { origin });
        filename = cvDocumentFilename(document);
        pageSize = document.pageSize === "letter" ? "LETTER" : "A4";
      }
    }

    if (!resolved) {
      const template = isCvTemplateId(rawTemplate) ? rawTemplate : undefined;
      const doc = resolveCvDocument(settings, template, { origin });
      if (!canAccessCvTemplate(settings, doc.template, admin)) {
        return NextResponse.json({ error: "This CV format is not public." }, { status: 403 });
      }
      resolved = doc;
      filename = cvPdfFilename(doc.template);
    }

    const buffer = await renderToBuffer(
      <CvPdfDocument doc={resolved} origin={origin} size={pageSize} />
    );
    const bytes = new Uint8Array(buffer);

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
