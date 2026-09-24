"use client";

import { useEffect, useId, useRef, useState, type ClipboardEvent } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import {
  RiArrowLeftLine,
  RiArrowRightLine,
  RiChat1Line,
  RiCloseLine,
  RiImageAddLine,
  RiLoader4Line,
  RiMailSendLine,
  RiUserLine,
} from "react-icons/ri";
import { useHistoryBackClose } from "@/hooks/useHistoryBackClose";
import { plainTextFromClipboard } from "@/lib/paste-plain-text";
import {
  TESTIMONIAL_BODY_MAX,
  TESTIMONIAL_BODY_MIN,
  TESTIMONIAL_SUCCESS_MESSAGE,
  isValidTestimonialEmail,
} from "@/lib/testimonials";

export type TestimonialProjectOption = { id: string; title: string };

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmitted: (message: string) => void;
  projects?: TestimonialProjectOption[];
  lockedProjectId?: string;
};

type Step = 1 | 2 | 3 | 4;

const STEPS: { id: Step; label: string }[] = [
  { id: 1, label: "About you" },
  { id: 2, label: "Context" },
  { id: 3, label: "Message" },
  { id: 4, label: "Review" },
];

export default function TestimonialFormDialog({
  open,
  onClose,
  onSubmitted,
  projects = [],
  lockedProjectId,
}: Props) {
  const titleId = useId();
  const descId = useId();
  const fieldId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [personTitle, setPersonTitle] = useState("");
  const [organization, setOrganization] = useState("");
  const [location, setLocation] = useState("");
  const [relationship, setRelationship] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [projectId, setProjectId] = useState(lockedProjectId || "");
  const [projectTitleOther, setProjectTitleOther] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [body, setBody] = useState("");
  const [consent, setConsent] = useState(true);
  const [notifyOnPublish, setNotifyOnPublish] = useState(true);
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [phase, setPhase] = useState<"form" | "success">("form");
  const [successMessage, setSuccessMessage] = useState(TESTIMONIAL_SUCCESS_MESSAGE);
  const [subscribeOffer, setSubscribeOffer] = useState(false);
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [subscribeState, setSubscribeState] = useState<"idle" | "loading" | "done" | "error" | "done-no-mail">("idle");

  const isOtherProject = projectId === "other";

  useHistoryBackClose(open && phase === "form", onClose);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 720px)");
    const sync = () => setIsMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!open) {
      setStep(1);
      setPhase("form");
      setError("");
      setSubscribeOffer(false);
      setSubscribeState("idle");
      return;
    }
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const previous = document.body.style.overflow;
    if (phase === "form") document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => nameRef.current?.focus(), 40);
    return () => {
      document.body.style.overflow = previous;
      window.clearTimeout(t);
      restoreFocusRef.current?.focus?.();
    };
  }, [open, phase]);

  useEffect(() => {
    return () => {
      if (photoPreview.startsWith("blob:")) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  useEffect(() => {
    if (!open || phase !== "form" || !panelRef.current) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step, phase]);

  if (!open || typeof document === "undefined") return null;

  const finish = (message: string) => {
    onSubmitted(message);
    onClose();
  };

  const onPhotoFile = async (file: File | null) => {
    if (photoPreview.startsWith("blob:")) URL.revokeObjectURL(photoPreview);
    if (!file || !file.type.startsWith("image/")) {
      setPhotoPreview("");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Keep the photo under 2 MB.");
      return;
    }
    const local = URL.createObjectURL(file);
    setPhotoPreview(local);
    setError("");
    setPhotoUploading(true);
    try {
      const payload = new FormData();
      payload.append("file", file);
      const res = await fetch("/api/testimonials/photo", { method: "POST", body: payload });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Could not upload the photo. You can paste a public image URL instead.",
        );
        return;
      }
      setPhotoUrl(String(data.url));
    } catch {
      setError("Could not upload the photo. You can paste a public image URL instead.");
    } finally {
      setPhotoUploading(false);
    }
  };

  const validateStep = (current: Step): boolean => {
    setError("");
    if (current === 1) {
      if (name.trim().length < 2) {
        setError("Please enter your full name.");
        return false;
      }
      if (!isValidTestimonialEmail(email)) {
        setError("Enter a valid email address so your testimonial can be verified.");
        return false;
      }
    }
    if (current === 2 && isOtherProject && !projectTitleOther.trim()) {
      setError("Enter a short title for the related work.");
      return false;
    }
    if (current === 3) {
      if (body.trim().length < TESTIMONIAL_BODY_MIN) {
        setError(`Please write at least ${TESTIMONIAL_BODY_MIN} characters about what we worked on.`);
        return false;
      }
    }
    if (current === 4 && !consent) {
      setError("Please confirm you agree to have this published with your name.");
      return false;
    }
    return true;
  };

  const goToStep = (target: Step) => {
    if (target === step) return;
    if (target < step) {
      setError("");
      setStep(target);
      return;
    }
    for (let cursor = step; cursor < target; cursor += 1) {
      if (!validateStep(cursor as Step)) return;
    }
    setStep(target);
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep((prev) => Math.min(4, prev + 1) as Step);
  };

  const goBack = () => setStep((prev) => Math.max(1, prev - 1) as Step);

  const confirmSubscribe = async () => {
    if (!subscribeEmail.includes("@")) return;
    setSubscribeState("loading");
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: subscribeEmail, name, confirm: true }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Could not subscribe");
      setSubscribeOffer(false);
      setSubscribeState(payload.mailSent === false ? "done-no-mail" : "done");
    } catch {
      setSubscribeState("error");
    }
  };

  const submit = async () => {
    if (!validateStep(4)) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          person_name: name.trim(),
          email: email.trim().toLowerCase(),
          person_title: personTitle.trim() || undefined,
          organization: organization.trim() || undefined,
          location: location.trim() || undefined,
          relationship: relationship.trim() || undefined,
          profile_url: profileUrl.trim() || undefined,
          photo_url: photoUrl.trim() || undefined,
          project_id: lockedProjectId || (isOtherProject ? "other" : projectId) || undefined,
          project_title_other: isOtherProject ? projectTitleOther.trim() : undefined,
          body: body.trim(),
          consent: true,
          notify_on_publish: notifyOnPublish,
          company: honeypot,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not save your testimonial.");
      const message = String(data.message || TESTIMONIAL_SUCCESS_MESSAGE);
      setSuccessMessage(message);
      setSubscribeEmail(String(data.email || email.trim().toLowerCase()));
      setSubscribeOffer(Boolean(data.subscribeOffer));
      setPhase("success");
      document.body.style.overflow = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your testimonial.");
    } finally {
      setSubmitting(false);
    }
  };

  const onBodyPaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const plain = plainTextFromClipboard(event.clipboardData);
    if (!plain) return;
    event.preventDefault();
    const el = event.currentTarget;
    const start = el.selectionStart ?? body.length;
    const end = el.selectionEnd ?? body.length;
    const next = `${body.slice(0, start)}${plain}${body.slice(end)}`.slice(0, TESTIMONIAL_BODY_MAX);
    setBody(next);
  };

  const remaining = TESTIMONIAL_BODY_MAX - body.trim().length;
  const previewSrc = photoUrl.trim() || photoPreview;
  const displayName = name.trim() || "Profile photo";
  const projectLabel = lockedProjectId
    ? projects.find((p) => p.id === lockedProjectId)?.title || lockedProjectId
    : isOtherProject
      ? projectTitleOther.trim() || "Other"
      : projects.find((p) => p.id === projectId)?.title || (projectId ? projectId : "Not tied to one project");
  const navCount = step > 1 ? 2 : 1;

  if (phase === "success") {
    return createPortal(
      <div className="tm-thanks-layer is-open" role="presentation">
        <aside className="tm-thanks-card" role="status" aria-live="polite" aria-labelledby={titleId}>
          <button type="button" className="tm-thanks-close" onClick={() => finish(successMessage)} aria-label="Close">
            <RiCloseLine size={20} />
          </button>
          <div className="tm-thanks-head">
            <span className="tm-thanks-icon" aria-hidden="true">
              <RiMailSendLine size={20} />
            </span>
            <h4 id={titleId}>Thank you</h4>
          </div>
          <p id={descId}>{successMessage}</p>
          {subscribeOffer ? (
            <div className="tm-subscribe-offer">
              <p>
                Also get occasional updates at <strong>{subscribeEmail}</strong>?
              </p>
              <div className="tm-form-nav is-double">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => void confirmSubscribe()}
                  disabled={subscribeState === "loading"}
                >
                  {subscribeState === "loading" ? "Subscribing…" : "Yes, subscribe"}
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setSubscribeOffer(false)}>
                  No thanks
                </button>
              </div>
              {subscribeState === "error" ? <small>Could not confirm subscription. Try again.</small> : null}
            </div>
          ) : null}
          {subscribeState === "done" ? (
            <p className="tm-subscribe-done">You&apos;re subscribed. Welcome — check your inbox for a note.</p>
          ) : null}
          {subscribeState === "done-no-mail" ? (
            <p className="tm-subscribe-done">
              You&apos;re on the list. The welcome email couldn&apos;t send just now — you&apos;ll still hear from me when
              there&apos;s an update.
            </p>
          ) : null}
          <button type="button" className="btn btn-outline tm-thanks-dismiss" onClick={() => finish(successMessage)}>
            Close
          </button>
        </aside>
      </div>,
      document.body,
    );
  }

  return createPortal(
    <div
      className={`tm-dialog-layer ${isMobile ? "is-sheet" : "is-drawer"}`}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        className="tm-dialog-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
      >
        {isMobile ? <div className="tm-dialog-handle" aria-hidden="true" /> : null}
        <button type="button" className="tm-dialog-close" onClick={onClose} aria-label="Close">
          <RiCloseLine size={20} />
        </button>

        <form
          className="tm-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (step < 4) goNext();
            else void submit();
          }}
          noValidate
        >
          <div className="tm-form-head">
            <h2 id={titleId}>Share your experience</h2>
            <p id={descId}>A short note about what we built together. Reviewed before it appears on the site.</p>
          </div>

          <ol className="tm-steps" aria-label="Form steps">
            {STEPS.map((item) => {
              const state = step === item.id ? "is-active" : step > item.id ? "is-done" : "";
              return (
                <li key={item.id} className={state}>
                  <button
                    type="button"
                    className="tm-step-btn"
                    onClick={() => goToStep(item.id)}
                    aria-current={step === item.id ? "step" : undefined}
                  >
                    <span>{item.id}</span>
                    <em>{item.label}</em>
                  </button>
                </li>
              );
            })}
          </ol>

          <label className="tm-form-hp" htmlFor={`${fieldId}-hp`} aria-hidden="true">
            Company
            <input
              id={`${fieldId}-hp`}
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(event) => setHoneypot(event.target.value)}
            />
          </label>

          <div className="tm-form-main">
            {step === 1 ? (
              <div className="tm-step-body">
                <div className="tm-photo-block">
                  <button
                    type="button"
                    className="tm-photo-pick"
                    onClick={() => fileRef.current?.click()}
                    aria-label="Choose profile photo"
                  >
                    {previewSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previewSrc} alt="" />
                    ) : (
                      <RiImageAddLine size={22} />
                    )}
                  </button>
                  <strong className="tm-photo-name">{displayName}</strong>
                  <p className="tm-photo-hint">
                    {photoUploading
                      ? "Uploading preview…"
                      : "Optional. Choose a photo or paste a public image URL below."}
                  </p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(event) => onPhotoFile(event.target.files?.[0] || null)}
                  />
                  <input
                    className="tm-photo-url"
                    type="url"
                    inputMode="url"
                    placeholder="https://… (public photo URL)"
                    value={photoUrl}
                    onChange={(event) => setPhotoUrl(event.target.value)}
                    disabled={submitting}
                  />
                </div>

                <label className="tm-field" htmlFor={`${fieldId}-name`}>
                  <span>
                    Full name <em>required</em>
                  </span>
                  <input
                    ref={nameRef}
                    id={`${fieldId}-name`}
                    type="text"
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    disabled={submitting}
                    required
                  />
                </label>

                <label className="tm-field" htmlFor={`${fieldId}-email`}>
                  <span>
                    Email <em>required</em>
                  </span>
                  <input
                    id={`${fieldId}-email`}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={submitting}
                    required
                  />
                </label>

                <div className="tm-form-row">
                  <label className="tm-field" htmlFor={`${fieldId}-title`}>
                    <span>Role or title</span>
                    <input
                      id={`${fieldId}-title`}
                      type="text"
                      autoComplete="organization-title"
                      value={personTitle}
                      onChange={(event) => setPersonTitle(event.target.value)}
                      disabled={submitting}
                    />
                  </label>
                  <label className="tm-field" htmlFor={`${fieldId}-org`}>
                    <span>Organization</span>
                    <input
                      id={`${fieldId}-org`}
                      type="text"
                      autoComplete="organization"
                      value={organization}
                      onChange={(event) => setOrganization(event.target.value)}
                      disabled={submitting}
                    />
                  </label>
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="tm-step-body">
                <label className="tm-field" htmlFor={`${fieldId}-relationship`}>
                  <span>How we worked together</span>
                  <input
                    id={`${fieldId}-relationship`}
                    type="text"
                    placeholder="Client, teammate, mentor…"
                    value={relationship}
                    onChange={(event) => setRelationship(event.target.value)}
                    disabled={submitting}
                  />
                </label>

                <label className="tm-field" htmlFor={`${fieldId}-location`}>
                  <span>Location</span>
                  <input
                    id={`${fieldId}-location`}
                    type="text"
                    placeholder="City, country"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    disabled={submitting}
                  />
                </label>

                <label className="tm-field" htmlFor={`${fieldId}-profile`}>
                  <span>LinkedIn or website</span>
                  <input
                    id={`${fieldId}-profile`}
                    type="url"
                    inputMode="url"
                    placeholder="https://"
                    value={profileUrl}
                    onChange={(event) => setProfileUrl(event.target.value)}
                    disabled={submitting}
                  />
                </label>

                {!lockedProjectId ? (
                  <>
                    <label className="tm-field" htmlFor={`${fieldId}-project`}>
                      <span>Related project</span>
                      <select
                        id={`${fieldId}-project`}
                        value={projectId}
                        onChange={(event) => setProjectId(event.target.value)}
                        disabled={submitting}
                      >
                        <option value="">Not tied to one project</option>
                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.title}
                          </option>
                        ))}
                        <option value="other">Other</option>
                      </select>
                    </label>
                    {isOtherProject ? (
                      <label className="tm-field" htmlFor={`${fieldId}-other`}>
                        <span>
                          Project title <em>required</em>
                        </span>
                        <input
                          id={`${fieldId}-other`}
                          type="text"
                          value={projectTitleOther}
                          onChange={(event) => setProjectTitleOther(event.target.value)}
                          disabled={submitting}
                          placeholder="Short title only"
                        />
                      </label>
                    ) : null}
                  </>
                ) : (
                  <p className="tm-locked-project">
                    Related to <strong>{projectLabel}</strong>
                  </p>
                )}
              </div>
            ) : null}

            {step === 3 ? (
              <div className="tm-step-body">
                <div className={`tm-float is-area${body ? " has-value" : ""}`}>
                  <span className="tm-float-icon" aria-hidden="true">
                    <RiChat1Line size={16} />
                  </span>
                  <textarea
                    id={`${fieldId}-body`}
                    rows={7}
                    value={body}
                    maxLength={TESTIMONIAL_BODY_MAX}
                    onChange={(event) => setBody(event.target.value)}
                    onPaste={onBodyPaste}
                    placeholder=" "
                    disabled={submitting}
                    required
                    style={{ whiteSpace: "pre-wrap" }}
                  />
                  <label htmlFor={`${fieldId}-body`} className="tm-float-label">
                    Your testimonial <em>*</em>
                  </label>
                </div>
                <small className="tm-field-hint">
                  {body.trim().length < TESTIMONIAL_BODY_MIN
                    ? `${TESTIMONIAL_BODY_MIN - body.trim().length} more characters needed`
                    : `${remaining} characters left`}
                </small>
              </div>
            ) : null}

            {step === 4 ? (
              <div className="tm-step-body tm-review">
                <div className="tm-review-card">
                  <div className="tm-review-person">
                    {previewSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={previewSrc} alt="" className="tm-review-avatar" />
                    ) : (
                      <span className="tm-review-avatar is-initial" aria-hidden="true">
                        <RiUserLine size={18} />
                      </span>
                    )}
                    <div>
                      <strong>{name.trim() || "Your name"}</strong>
                      <span>
                        {[personTitle, organization].filter(Boolean).join(" · ") || "Role / organization"}
                      </span>
                    </div>
                  </div>
                  <blockquote style={{ whiteSpace: "pre-wrap" }}>{body.trim() || "Your message…"}</blockquote>
                  <dl>
                    <div>
                      <dt>Project</dt>
                      <dd>{projectLabel}</dd>
                    </div>
                    {relationship ? (
                      <div>
                        <dt>Relationship</dt>
                        <dd>{relationship}</dd>
                      </div>
                    ) : null}
                    {location ? (
                      <div>
                        <dt>Location</dt>
                        <dd>{location}</dd>
                      </div>
                    ) : null}
                  </dl>
                </div>

                <label className="tm-check" htmlFor={`${fieldId}-consent`}>
                  <input
                    id={`${fieldId}-consent`}
                    type="checkbox"
                    checked={consent}
                    onChange={(event) => setConsent(event.target.checked)}
                    disabled={submitting}
                  />
                  <span>
                    I confirm this testimonial reflects my genuine experience and may be displayed publicly on
                    princeparfait.com after review.
                  </span>
                </label>

                <label className="tm-check" htmlFor={`${fieldId}-notify`}>
                  <input
                    id={`${fieldId}-notify`}
                    type="checkbox"
                    checked={notifyOnPublish}
                    onChange={(event) => setNotifyOnPublish(event.target.checked)}
                    disabled={submitting}
                  />
                  <span>Email me a share link if this is published.</span>
                </label>
              </div>
            ) : null}

            {error ? (
              <p className="tm-form-error" role="alert">
                {error}
              </p>
            ) : null}
          </div>

          <div className={`tm-form-nav ${navCount === 1 ? "is-single" : "is-double"}`}>
            {step > 1 ? (
              <button type="button" className="btn btn-outline" onClick={goBack} disabled={submitting}>
                <RiArrowLeftLine size={16} /> Back
              </button>
            ) : null}
            {step < 4 ? (
              <button type="submit" className="btn btn-primary">
                Continue <RiArrowRightLine size={16} />
              </button>
            ) : (
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? <RiLoader4Line size={16} className="cv-spin" /> : null}
                {submitting ? "Sending…" : "Submit testimonial"}
              </button>
            )}
          </div>

          <p className="tm-form-privacy">
            Your email stays private and is only used to verify the testimonial. <Link href="/privacy">Privacy</Link>
          </p>
        </form>
      </div>
    </div>,
    document.body,
  );
}
