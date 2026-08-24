"use client";

import ShareActions from "@/components/ui/ShareActions";

export default function ShareButton({
  title,
  excerpt,
  campaign = "blog",
  content,
}: {
  title: string;
  excerpt: string;
  campaign?: string;
  content?: string;
}) {
  return (
    <ShareActions
      title={title}
      excerpt={excerpt}
      campaign={campaign}
      content={content}
      compact
    />
  );
}
