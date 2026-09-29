-- PostgREST still needs table privileges. RLS does not grant them.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.admin_notifications TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.admin_notification_prefs TO service_role;
