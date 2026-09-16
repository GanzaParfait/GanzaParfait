"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { RiCheckLine, RiErrorWarningLine, RiLoader4Line } from "react-icons/ri";

type ToastKind = "success" | "error" | "info";

interface ToastState {
  message: string;
  kind: ToastKind;
}

interface DashboardFeedback {
  notify: (message: string, kind?: ToastKind) => void;
  runSave: (work: () => void | Promise<void>, successMessage: string) => Promise<boolean>;
  saving: boolean;
}

const FeedbackContext = createContext<DashboardFeedback | null>(null);

export function useDashboardFeedback() {
  const value = useContext(FeedbackContext);
  if (!value) {
    return {
      notify: () => {},
      runSave: async (work: () => void | Promise<void>) => {
        await work();
        return true;
      },
      saving: false,
    };
  }
  return value;
}

export function DashboardFeedbackProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const [saving, setSaving] = useState(false);

  const notify = useCallback((message: string, kind: ToastKind = "success") => {
    setToast({ message, kind });
    window.setTimeout(() => setToast(null), 2800);
  }, []);

  const runSave = useCallback(
    async (work: () => void | Promise<void>, successMessage: string) => {
      setSaving(true);
      try {
        await new Promise((resolve) => window.setTimeout(resolve, 450));
        await work();
        notify(successMessage, "success");
        return true;
      } catch (error) {
        const message = error instanceof Error && error.message
          ? error.message
          : "Could not save. Try again.";
        notify(message, "error");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [notify],
  );

  const value = useMemo(() => ({ notify, runSave, saving }), [notify, runSave, saving]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      {saving && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 400,
            background: "rgba(11, 25, 44, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "1rem",
              padding: "1.25rem 1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              fontWeight: 700,
              color: "#0b192c",
            }}
          >
            <RiLoader4Line size={22} className="animate-spin" color="#0e52a8" />
            Saving changes…
          </div>
        </div>
      )}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            bottom: "1.5rem",
            right: "1.5rem",
            zIndex: 450,
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            padding: "0.85rem 1.1rem",
            borderRadius: "0.85rem",
            background: toast.kind === "error" ? "#fef2f2" : "#ecfdf5",
            color: toast.kind === "error" ? "#b91c1c" : "#166534",
            border: `1px solid ${toast.kind === "error" ? "#fecaca" : "#bbf7d0"}`,
            boxShadow: "0 12px 30px rgba(15,23,42,0.16)",
            fontWeight: 700,
            fontSize: "0.875rem",
            maxWidth: "22rem",
          }}
        >
          {toast.kind === "error" ? <RiErrorWarningLine size={18} /> : <RiCheckLine size={18} />}
          {toast.message}
        </div>
      )}
    </FeedbackContext.Provider>
  );
}
