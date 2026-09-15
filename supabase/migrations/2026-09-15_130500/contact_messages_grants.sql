-- Table privileges were missing; RLS alone is not enough for PostgREST.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.contact_messages TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.contact_messages TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.subscribers TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.subscribers TO service_role;
