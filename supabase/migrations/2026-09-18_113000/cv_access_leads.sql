-- CV access lead capture (email gate on View / Download)
CREATE TABLE IF NOT EXISTS cv_access_leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  name text,
  cv_format text NOT NULL,
  action text NOT NULL CHECK (action IN ('view', 'download')),
  marketing_consent boolean NOT NULL DEFAULT false,
  source text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS cv_access_leads_created_at_idx ON cv_access_leads (created_at DESC);
CREATE INDEX IF NOT EXISTS cv_access_leads_email_idx ON cv_access_leads (email);
CREATE INDEX IF NOT EXISTS cv_access_leads_format_idx ON cv_access_leads (cv_format);

ALTER TABLE cv_access_leads ENABLE ROW LEVEL SECURITY;

-- Public inserts go through the Next.js API with the service role.
-- No public SELECT — admin reads via service role only.
DROP POLICY IF EXISTS "Allow public inserts on cv_access_leads" ON cv_access_leads;
DROP POLICY IF EXISTS "Allow authenticated full access on cv_access_leads" ON cv_access_leads;

CREATE POLICY "Allow authenticated full access on cv_access_leads"
  ON cv_access_leads
  FOR ALL
  USING (auth.role() = 'authenticated');

GRANT SELECT, INSERT, UPDATE, DELETE ON cv_access_leads TO service_role;
GRANT SELECT ON cv_access_leads TO authenticated;
