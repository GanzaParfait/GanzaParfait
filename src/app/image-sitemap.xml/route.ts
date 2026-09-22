import { siteConfig } from "@/data/site-data";
import { getPublicProjects } from "@/lib/projects";
import { PORTRAIT_PATHS } from "@/lib/identity";
import {
  OG_IMAGE_PATH,
  PORTRAIT_PATH,
  PORTRAIT_PATH_1X1,
  PORTRAIT_PATH_4X3,
  PORTRAIT_PATH_16X9,
  absoluteAssetUrl,
  canonicalUrl,
} from "@/lib/schema";

export const revalidate = 60;

function xml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function GET() {
  const projects = await getPublicProjects();
  const caption = siteConfig.portraitAlt;
  const about = canonicalUrl("/about");
  const home = canonicalUrl("/");

  const entityPortraits = [
    {
      page: about,
      loc: absoluteAssetUrl(PORTRAIT_PATH),
      title: "Prince Parfait GANZA — Software Engineer and Founder of LERONY Ltd",
      caption,
    },
    {
      page: about,
      loc: absoluteAssetUrl(PORTRAIT_PATH_1X1),
      title: "Prince Parfait GANZA — profile portrait 1:1",
      caption,
    },
    {
      page: about,
      loc: absoluteAssetUrl(PORTRAIT_PATH_4X3),
      title: "Prince Parfait GANZA — profile portrait 4:3",
      caption,
    },
    {
      page: about,
      loc: absoluteAssetUrl(PORTRAIT_PATH_16X9),
      title: "Prince Parfait GANZA — profile portrait 16:9",
      caption,
    },
    {
      page: about,
      loc: absoluteAssetUrl(PORTRAIT_PATHS.webp),
      title: "Prince Parfait GANZA — Software Engineer and Founder of LERONY Ltd",
      caption,
    },
    {
      page: home,
      loc: absoluteAssetUrl(PORTRAIT_PATH),
      title: "Prince Parfait GANZA",
      caption,
    },
    {
      page: home,
      loc: absoluteAssetUrl(OG_IMAGE_PATH),
      title: "Prince Parfait GANZA — social share image",
      caption,
    },
  ];

  const projectImages = projects.flatMap((project) => {
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
  });

  const images = [...entityPortraits, ...projectImages];

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
