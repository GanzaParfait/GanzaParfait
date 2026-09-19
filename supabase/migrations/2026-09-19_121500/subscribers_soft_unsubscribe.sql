-- Soft unsubscribe: keep the row forever; stop mail when unsubscribed_at is set.
ALTER TABLE public.subscribers
  ADD COLUMN IF NOT EXISTS unsubscribed_at timestamptz;

COMMENT ON COLUMN public.subscribers.unsubscribed_at IS
  'When set, the address opted out of updates. Row is never deleted for unsubscribe.';

CREATE INDEX IF NOT EXISTS subscribers_unsubscribed_at_idx
  ON public.subscribers (unsubscribed_at);

CREATE INDEX IF NOT EXISTS subscribers_active_mail_idx
  ON public.subscribers (confirmed)
  WHERE unsubscribed_at IS NULL;
