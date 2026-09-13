-- ============================================================
-- MIGRATION 02: ADMIN DASHBOARD & ANALYTICS SCHEMA
-- ============================================================

-- 1. Update site_settings for dynamic social limits & banner layout
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS header_social_limit INT DEFAULT 3;

-- 2. Banners Table (Supporting split_portrait, featured_overlay, interactive_stack)
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    image_url VARCHAR(500),
    button_text VARCHAR(100) DEFAULT 'Explore Now',
    button_link VARCHAR(500) DEFAULT '/projects',
    page_location VARCHAR(100) DEFAULT 'main_hero',
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    layout_style VARCHAR(50) DEFAULT 'split_portrait', -- 'split_portrait', 'featured_overlay', 'interactive_stack'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert Default Hero Banner
INSERT INTO public.banners (title, subtitle, image_url, button_text, button_link, layout_style, is_active)
VALUES (
  'Prince Parfait GANZA',
  'Founder • Software Engineer • AI Builder • Speaker • Entrepreneur',
  '/images/profile/hero-photo.png',
  'View My Work',
  '/projects',
  'split_portrait',
  true
)
ON CONFLICT DO NOTHING;

-- 3. Blog Posts Table
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT,
    cover_image VARCHAR(500),
    author VARCHAR(100) DEFAULT 'Prince Parfait GANZA',
    tags TEXT[],
    featured BOOLEAN DEFAULT false,
    published BOOLEAN DEFAULT true,
    views_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Page Views & Live Analytics Table
CREATE TABLE IF NOT EXISTS public.page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_path VARCHAR(255) NOT NULL,
    referrer VARCHAR(500),
    country_code VARCHAR(10) DEFAULT 'RW',
    country_name VARCHAR(100) DEFAULT 'Rwanda',
    country_flag VARCHAR(10) DEFAULT '🇷🇼',
    device VARCHAR(100) DEFAULT 'Desktop',
    ip_address VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Media Assets Table
CREATE TABLE IF NOT EXISTS public.media_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    url VARCHAR(500) NOT NULL,
    asset_type VARCHAR(50) DEFAULT 'image',
    size_bytes BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Update Admin Users Table with Profile fields
ALTER TABLE public.admin_users 
ADD COLUMN IF NOT EXISTS name VARCHAR(255) DEFAULT 'Prince Parfait GANZA',
ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500) DEFAULT '/images/profile/hero-photo.png',
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'Super Admin';
