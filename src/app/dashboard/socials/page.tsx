"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SocialsRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/settings#socials");
  }, [router]);
  return <p style={{ color: "#64748b" }}>Social links now live in Site Settings.</p>;
}
