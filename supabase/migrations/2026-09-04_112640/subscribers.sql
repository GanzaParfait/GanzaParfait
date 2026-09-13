CREATE TABLE IF NOT EXISTS subscribers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  location text,
  country text,
  device text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public inserts on subscribers" ON subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated full access on subscribers" ON subscribers FOR ALL USING (auth.role() = 'authenticated');
