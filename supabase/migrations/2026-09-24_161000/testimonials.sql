-- Visitor-submitted testimonials, moderated before publication.
--
-- Privacy model: there is deliberately NO anon policy on this table.
-- Both the public submit form and the public read go through Next.js route
-- handlers that use createServerSupabase(true) (service role, which bypasses
-- RLS) — reads select only the public columns of approved rows. That keeps
-- submitter_email, moderation_notes and original_body server-side only.

CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Public-facing
  person_name text NOT NULL,
  person_title text,
  organization text,
  body text NOT NULL,
  photo_url text,
  profile_url text,
  relationship text,
  project_id text,
  testified_on date,
  featured boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',

  -- Internal only — never returned to the public API
  submitter_email text NOT NULL,
  moderation_notes text,
  original_body text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  consent_accepted boolean NOT NULL DEFAULT false
);

-- Re-runnable on an older copy of the table.
ALTER TABLE public.testimonials
  ADD COLUMN IF NOT EXISTS person_name text,
  ADD COLUMN IF NOT EXISTS person_title text,
  ADD COLUMN IF NOT EXISTS organization text,
  ADD COLUMN IF NOT EXISTS body text,
  ADD COLUMN IF NOT EXISTS photo_url text,
  ADD COLUMN IF NOT EXISTS profile_url text,
  ADD COLUMN IF NOT EXISTS relationship text,
  ADD COLUMN IF NOT EXISTS project_id text,
  ADD COLUMN IF NOT EXISTS testified_on date,
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS display_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS submitter_email text,
  ADD COLUMN IF NOT EXISTS moderation_notes text,
  ADD COLUMN IF NOT EXISTS original_body text,
  ADD COLUMN IF NOT EXISTS submitted_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS consent_accepted boolean NOT NULL DEFAULT false;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.testimonials'::regclass
      AND conname = 'testimonials_status_check'
  ) THEN
    ALTER TABLE public.testimonials
      ADD CONSTRAINT testimonials_status_check
      CHECK (status IN ('pending', 'approved', 'declined'));
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS testimonials_status_idx ON public.testimonials (status);
CREATE INDEX IF NOT EXISTS testimonials_submitted_at_idx ON public.testimonials (submitted_at DESC);
CREATE INDEX IF NOT EXISTS testimonials_project_id_idx ON public.testimonials (project_id);
-- Published ordering: featured first, then manual order.
CREATE INDEX IF NOT EXISTS testimonials_published_order_idx
  ON public.testimonials (featured DESC, display_order ASC, submitted_at DESC)
  WHERE status = 'approved';

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Signed-in Supabase users (dashboard/service tooling) get full access.
-- anon gets nothing: no SELECT (private columns) and no INSERT (spam control
-- and consent enforcement both live in POST /api/testimonials).
DROP POLICY IF EXISTS "Allow authenticated full access on testimonials" ON public.testimonials;
CREATE POLICY "Allow authenticated full access on testimonials"
  ON public.testimonials FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- No seed rows: testimonials must be real and verified.
