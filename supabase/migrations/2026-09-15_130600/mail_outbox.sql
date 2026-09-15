-- Outbound system mail log (thanks, contact notify, replies, etc.)
CREATE TABLE IF NOT EXISTS mail_outbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  to_email text NOT NULL,
  from_email text,
  subject text NOT NULL,
  preview_html text,
  preview_text text,
  related_type text,
  related_id uuid,
  status text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS mail_outbox_created_at_idx ON mail_outbox (created_at DESC);
CREATE INDEX IF NOT EXISTS mail_outbox_kind_idx ON mail_outbox (kind);

ALTER TABLE mail_outbox ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated full access on mail_outbox" ON mail_outbox;
CREATE POLICY "Allow authenticated full access on mail_outbox"
  ON mail_outbox FOR ALL
  USING (auth.role() = 'authenticated');

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.mail_outbox TO authenticated, service_role;
GRANT ALL ON TABLE public.mail_outbox TO service_role;
