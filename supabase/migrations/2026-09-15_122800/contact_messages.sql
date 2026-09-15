-- Contact form inbox for dashboard replies
CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  reason text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  reply_text text,
  replied_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS contact_messages_created_at_idx ON contact_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS contact_messages_status_idx ON contact_messages (status);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public inserts on contact_messages"
  ON contact_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow authenticated full access on contact_messages"
  ON contact_messages FOR ALL
  USING (auth.role() = 'authenticated');

-- Service role bypasses RLS; anon can insert only via the policy above.
