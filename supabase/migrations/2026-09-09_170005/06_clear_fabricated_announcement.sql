-- Clear fabricated default announcement copy from earlier drafts.

ALTER TABLE public.site_settings
  ALTER COLUMN announcement_text SET DEFAULT '';

UPDATE public.site_settings
SET announcement_text = ''
WHERE announcement_text ILIKE '%TUT Labs%';
