/** Project id encoded in a share link (`utm_content` or `utm_campaign=project-{id}`). */
export function projectIdFromShareQuery(
  params: { utm_content?: string | null; utm_campaign?: string | null },
  projectIds: Iterable<string>,
): string | null {
  const ids = new Set(projectIds);
  const content = (params.utm_content || "").trim();
  if (content && ids.has(content)) return content;
  const campaign = (params.utm_campaign || "").trim();
  if (campaign.startsWith("project-")) {
    const id = campaign.slice("project-".length);
    if (ids.has(id)) return id;
  }
  return null;
}
