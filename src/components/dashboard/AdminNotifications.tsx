"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { RiNotification3Line } from "react-icons/ri";

export type NoticeCounts = {
  subscriber: number;
  message: number;
  testimonial: number;
  total: number;
};

export type NoticeItem = {
  id: string;
  kind: "subscriber" | "message" | "testimonial";
  title: string;
  body: string;
  href: string;
  createdAt: string;
  readAt: string | null;
};

const EMPTY: NoticeCounts = { subscriber: 0, message: 0, testimonial: 0, total: 0 };

function kindForPath(pathname: string) {
  if (pathname.startsWith("/dashboard/messages")) return "message";
  if (pathname.startsWith("/dashboard/testimonials")) return "testimonial";
  if (pathname.startsWith("/dashboard/subscribers")) return "subscriber";
  return "";
}

export function useAdminNotices() {
  const pathname = usePathname();
  const [counts, setCounts] = useState<NoticeCounts>(EMPTY);
  const [items, setItems] = useState<NoticeItem[]>([]);
  const [open, setOpen] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications?view=summary");
      if (!res.ok) return;
      const data = await res.json();
      if (data.counts) setCounts(data.counts);
      if (Array.isArray(data.items)) setItems(data.items);
    } catch {
      /* dashboard stays usable if the table is not migrated yet */
    }
  }, []);

  useEffect(() => {
    const kind = kindForPath(pathname);
    let cancel = false;
    (async () => {
      if (kind) {
        await fetch("/api/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind }),
        }).catch(() => undefined);
      }
      if (!cancel) await refresh();
    })();
    return () => {
      cancel = true;
    };
  }, [pathname, refresh]);

  return { counts, items, open, setOpen, refresh };
}

export function AdminNoticeBell({
  counts,
  items,
  open,
  setOpen,
}: {
  counts: NoticeCounts;
  items: NoticeItem[];
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen]);

  return (
    <div className="dash-notice" ref={ref}>
      <button
        type="button"
        className="btn btn-outline btn-sm dash-notice-btn"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={counts.total ? `${counts.total} unread notifications` : "Notifications"}
        onClick={() => setOpen(!open)}
      >
        <RiNotification3Line size={16} />
        {counts.total ? <span className="dash-notice-badge">{counts.total > 99 ? "99+" : counts.total}</span> : null}
      </button>
      {open ? (
        <div className="dash-notice-menu" role="menu">
          <div className="dash-notice-menu-head">
            <strong>Notifications</strong>
            <span>{counts.total ? `${counts.total} unread` : "All caught up"}</span>
          </div>
          {items.length ? (
            <ul>
              {items.map((item) => (
                <li key={item.id}>
                  <Link href={item.href} onClick={() => setOpen(false)} className={item.readAt ? "" : "is-unread"}>
                    <em>{item.kind}</em>
                    <strong>{item.title}</strong>
                    {item.body ? <span>{item.body}</span> : null}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="dash-notice-empty">No notifications yet.</p>
          )}
          <Link href="/dashboard/notifications" className="dash-notice-all" onClick={() => setOpen(false)}>
            View all
          </Link>
        </div>
      ) : null}
    </div>
  );
}
