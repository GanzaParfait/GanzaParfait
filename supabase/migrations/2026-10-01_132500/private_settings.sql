-- Server-only key/value settings (e.g. the hashed CV PDF link password).
-- Unlike site_settings, nothing here is ever sent to the browser.
CREATE TABLE IF NOT EXISTS private_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE private_settings ENABLE ROW LEVEL SECURITY;

-- No policies: anon and authenticated roles cannot read or write.
-- The Next.js API reads and writes with the service role only.
REVOKE ALL ON private_settings FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON private_settings TO service_role;
