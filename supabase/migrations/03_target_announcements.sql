-- ============================================================
-- ADD ANNOUNCEMENT SETTINGS TO SITE_SETTINGS
-- ============================================================

ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS announcement_text VARCHAR(255) DEFAULT 'Exciting news! The TUT Labs Platform is now live.',
ADD COLUMN IF NOT EXISTS announcement_link VARCHAR(500) DEFAULT '/projects',
ADD COLUMN IF NOT EXISTS announcement_is_active BOOLEAN DEFAULT false;

-- Create an optional dedicated table for multiple announcements if needed in the future
CREATE TABLE IF NOT EXISTS public.target_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    text VARCHAR(255) NOT NULL,
    link_url VARCHAR(500),
    is_active BOOLEAN DEFAULT false,
    bg_color VARCHAR(50) DEFAULT 'var(--color-primary)',
    text_color VARCHAR(50) DEFAULT '#ffffff',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
