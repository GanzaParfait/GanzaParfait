"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { RiCheckDoubleLine, RiMailCloseLine } from "react-icons/ri";

type State = "loading" | "done" | "already" | "error" | "invalid";

export default function UnsubscribeClient() {
  const params = useSearchParams();
  const email = (params.get("email") || "").trim().toLowerCase();
  const token = (params.get("token") || "").trim();
  const [state, setState] = useState<State>("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!email || !token || !email.includes("@")) {
      setState("invalid");
      setMessage("This unsubscribe link is incomplete. Use the link from a recent email.");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, token }),
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setState("error");
          setMessage(data.error || "Could not update your preference.");
          return;
        }
        setState(data.alreadyUnsubscribed ? "already" : "done");
        setMessage(
          data.alreadyUnsubscribed
            ? "You were already unsubscribed. You will not receive update emails."
            : "You are unsubscribed. You will not receive update emails from this list.",
        );
      } catch {
        if (!cancelled) {
          setState("error");
          setMessage("Something went wrong. Please try again or email hello@princeparfait.com.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [email, token]);

  const ok = state === "done" || state === "already";

  return (
    <section className="unsubscribe-page" aria-label="Unsubscribe">
      <div className="container unsubscribe-card">
        <span className={`unsubscribe-icon ${ok ? "is-ok" : ""}`} aria-hidden="true">
          {ok ? <RiCheckDoubleLine size={40} /> : <RiMailCloseLine size={40} />}
        </span>
        <p className="section-label">Email preferences</p>
        <h1>{ok ? "Unsubscribed" : state === "loading" ? "Updating…" : "Unsubscribe"}</h1>
        <p className="unsubscribe-copy">
          {state === "loading"
            ? "One moment while we update your preference."
            : message || "Manage whether you receive occasional updates."}
        </p>
        {email ? (
          <p className="unsubscribe-email">
            Address: <strong>{email}</strong>
          </p>
        ) : null}
        <p className="unsubscribe-note">
          Your record is kept for audit and so you are not emailed again by mistake — it is not deleted.
        </p>
        <div className="unsubscribe-actions">
          <Link href="/" className="btn btn-primary">
            Back to home
          </Link>
          <Link href="/contact" className="btn btn-outline">
            Contact
          </Link>
        </div>
      </div>
    </section>
  );
}
