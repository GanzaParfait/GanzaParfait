import { getPublicProjects } from "@/lib/projects";
import { OG_IMAGE_PATH, PORTRAIT_PATH, absoluteAssetUrl, canonicalUrl } from "@/lib/schema";

export const revalidate = 60;

function xml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function GET() {
  const projects = await getPublicProjects();
  const images = [
    {
      page: canonicalUrl("/"),
      loc: absoluteAssetUrl(OG_IMAGE_PATH),
      title: "Prince Parfait GANZA",
      caption: "Prince Parfait GANZA, founder, entrepreneur and technologist in Kigali, Rwanda",
    },
    {
      page: canonicalUrl("/"),
      loc: absoluteAssetUrl("/images/og/prince-parfait-ganza.jpg"),
      title: "Prince Parfait GANZA",
      caption: "Prince Parfait GANZA portrait share image",
    },
    {
      page: canonicalUrl("/"),
      loc: absoluteAssetUrl(PORTRAIT_PATH),
      title: "Prince Parfait GANZA",
      caption: "Official portrait of Prince Parfait GANZA in Kigali, Rwanda",
    },
    {
      page: canonicalUrl("/about"),
      loc: absoluteAssetUrl(PORTRAIT_PATH),
      title: "Prince Parfait GANZA",
      caption: "Portrait of Prince Parfait GANZA",
    },
    ...projects.flatMap((project) => {
      const media = [
        ...(project.logo ? [project.logo] : []),
        ...(project.screenshots?.length ? project.screenshots : project.image ? [project.image] : []),
      ].filter((src) => src && !src.includes("placeholder"));
      const unique = [...new Set(media)];
      return unique.map((src) => ({
        page: canonicalUrl(`/projects/${project.id}`),
        loc: absoluteAssetUrl(src),
        title: project.title,
        caption: `${project.title}. ${project.description}`,
      }));
    }),
  ];

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
  </url>`,
  )
  .join("\n")}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}
