-- Table privileges; RLS alone is not enough for PostgREST.
-- anon is intentionally excluded — every public code path goes through the
-- Next.js API with the service role, which returns public columns only.

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.testimonials TO authenticated, service_role;
GRANT ALL ON TABLE public.testimonials TO service_role;

REVOKE ALL ON TABLE public.testimonials FROM anon;
