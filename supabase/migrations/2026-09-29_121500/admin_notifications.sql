-- Admin inbox for new subscribers, contact messages, and testimonials.
-- Service role bypasses RLS. No anon policies.

CREATE TABLE IF NOT EXISTS admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('subscriber', 'message', 'testimonial')),
  title text NOT NULL,
  body text,
  href text,
  related_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz,
  emailed_at timestamptz,
  UNIQUE (kind, related_id)
);

CREATE INDEX IF NOT EXISTS admin_notifications_unread_idx
  ON admin_notifications (kind, created_at DESC)
  WHERE read_at IS NULL;

CREATE INDEX IF NOT EXISTS admin_notifications_created_idx
  ON admin_notifications (created_at DESC);

ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS admin_notification_prefs (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  email text NOT NULL DEFAULT 'ganzaparfait7@gmail.com',
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO admin_notification_prefs (id, email, enabled)
VALUES (1, 'ganzaparfait7@gmail.com', true)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE admin_notification_prefs ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.admin_notifications TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.admin_notification_prefs TO service_role;
