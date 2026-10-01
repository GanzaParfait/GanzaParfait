"use client";

import { useEffect, useState, type FormEvent } from "react";
import { RiLockPasswordLine } from "react-icons/ri";

type Status = { customized: boolean; storageReady: boolean };

export default function CvPdfPasswordPanel() {
  const [status, setStatus] = useState<Status | null>(null);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/cv/pdf-password", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setStatus(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/cv/pdf-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not save the password.");
      setPassword("");
      setStatus((current) => ({ storageReady: true, ...current, customized: true }));
      setMessage("Password updated. Earlier password access is revoked.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="cv-lib-lock" aria-labelledby="cv-lib-lock-title">
      <div className="cv-lib-lock-copy">
        <h2 id="cv-lib-lock-title">
          <RiLockPasswordLine size={16} aria-hidden="true" /> PDF link password
        </h2>
        <p>
          Opening a CV PDF link directly asks for this password. Visitors who entered their email on the CV page
          skip it. {status && !status.customized ? "Currently using the default password." : null}
        </p>
        {status && !status.storageReady ? (
          <p className="cv-lib-warn">
            Password storage is not set up yet. Run the <code>private_settings</code> migration to change it.
          </p>
        ) : null}
      </div>
      <form className="cv-lib-lock-form" onSubmit={(event) => void save(event)}>
        <label htmlFor="cv-pdf-password" className="sr-only">
          New password
        </label>
        <input
          id="cv-pdf-password"
          type="password"
          autoComplete="new-password"
          minLength={4}
          required
          placeholder="New password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button type="submit" className="btn btn-primary btn-sm" disabled={saving || password.trim().length < 4 || status?.storageReady === false}
        >
          {saving ? "Saving…" : "Change password"}
        </button>
      </form>
      {message ? (
        <p className="cv-lib-lock-note" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="cv-lib-lock-note is-error" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
