-- Subscribers: confirmation + source metadata
ALTER TABLE public.subscribers
  ADD COLUMN IF NOT EXISTS confirmed boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS source text,
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

COMMENT ON COLUMN public.subscribers.confirmed IS 'true = opted in / confirmed; false = captured from contact but not confirmed';
COMMENT ON COLUMN public.subscribers.source IS 'widget | contact | import | dashboard';

CREATE INDEX IF NOT EXISTS subscribers_confirmed_idx ON public.subscribers (confirmed);
CREATE INDEX IF NOT EXISTS subscribers_email_lower_idx ON public.subscribers (lower(email));

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'subscribers_email_key'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'subscribers_email_unique'
  ) THEN
    BEGIN
      ALTER TABLE public.subscribers ADD CONSTRAINT subscribers_email_key UNIQUE (email);
    EXCEPTION WHEN others THEN
      NULL;
    END;
  END IF;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscribers TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.subscribers TO authenticated;

-- Mail outbox: store last error for diagnostics
ALTER TABLE public.mail_outbox
  ADD COLUMN IF NOT EXISTS error_message text;
