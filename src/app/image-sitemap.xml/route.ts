import { projects } from "@/data/site-data";
import { OG_IMAGE_PATH, PORTRAIT_PATH, absoluteAssetUrl, canonicalUrl } from "@/lib/schema";

const images = [
  {
    page: canonicalUrl("/"),
    loc: absoluteAssetUrl(OG_IMAGE_PATH),
    title: "Prince Parfait GANZA",
    caption: "Prince Parfait GANZA, founder, entrepreneur and technologist in Kigali, Rwanda",
  },
  {
    page: canonicalUrl("/about"),
    loc: absoluteAssetUrl(PORTRAIT_PATH),
    title: "Prince Parfait GANZA",
    caption: "Portrait of Prince Parfait GANZA",
  },
  ...projects.flatMap((project) =>
    (project.screenshots || (project.image ? [project.image] : []))
      .filter((src) => src && !src.includes("placeholder"))
      .map((src) => ({
        page: canonicalUrl(`/projects/${project.id}`),
        loc: absoluteAssetUrl(src),
        title: project.title,
        caption: `${project.title}. ${project.description}`,
      })),
  ),
];

function xml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function GET() {
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${images
  .map(
    (image) => `  <url>
    <loc>${xml(image.page)}</loc>
    <image:image>
      <image:loc>${xml(image.loc)}</image:loc>
      <image:title>${xml(image.title)}</image:title>
      <image:caption>${xml(image.caption)}</image:caption>
    </image:image>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

export const dynamic = "force-static";
