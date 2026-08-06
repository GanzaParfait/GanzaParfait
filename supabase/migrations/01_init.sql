-- ============================================================
-- PRINCE PARFAIT GANZA PORTFOLIO DATABASE SCHEMA
-- ============================================================

-- 1. Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    banner_layout VARCHAR(50) DEFAULT 'split', -- 'split' or 'tony_robbins'
    site_title VARCHAR(255) DEFAULT 'Prince Parfait GANZA',
    site_subtitle VARCHAR(255) DEFAULT 'Founder • Software Engineer • AI Builder • Speaker • Entrepreneur',
    bio TEXT DEFAULT 'I build full-stack products and integrate AI to solve real-world problems across Africa and beyond.',
    location VARCHAR(100) DEFAULT 'Kigali, Rwanda',
    contact_email VARCHAR(255) DEFAULT 'ganzaparfait7@gmail.com',
    whatsapp_number VARCHAR(50) DEFAULT '250792054846',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert Default Site Settings
INSERT INTO public.site_settings (banner_layout, site_title, site_subtitle)
VALUES ('split', 'Prince Parfait GANZA', 'Founder • Software Engineer • AI Builder • Speaker • Entrepreneur')
ON CONFLICT DO NOTHING;

-- 2. Social Links Table
CREATE TABLE IF NOT EXISTS public.social_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform VARCHAR(50) NOT NULL UNIQUE,
    url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert Canonical Social Links
INSERT INTO public.social_links (platform, url, is_primary, display_order) VALUES
('whatsapp', 'https://wa.me/250792054846', true, 1),
('linkedin', 'https://www.linkedin.com/in/ganza-prince-235816269', true, 2),
('instagram', 'https://www.instagram.com/prince_parfait', true, 3),
('github', 'https://github.com/GanzaParfait', false, 4),
('twitter', 'https://x.com/prince_parfait1', false, 5),
('youtube', 'https://youtube.com/@prince_parfait', false, 6),
('tiktok', 'https://tiktok.com/@prince_parfait', false, 7),
('threads', 'https://www.threads.com/@prince_parfait', false, 8),
('luma', 'https://luma.com/user/princeparfait', false, 9),
('buymeacoffee', 'https://buymeacoffee.com/princeparfait', false, 10)
ON CONFLICT (platform) DO UPDATE SET url = EXCLUDED.url;

-- 3. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(100),
    tags TEXT[],
    image_url VARCHAR(500),
    live_url VARCHAR(500),
    github_url VARCHAR(500),
    featured BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Admin Users Table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert Initial Admin (Email: ganzaparfait7@gmail.com)
INSERT INTO public.admin_users (email, password_hash)
VALUES ('ganzaparfait7@gmail.com', '$2a$10$0000mockhashforganzaparfait0000')
ON CONFLICT DO NOTHING;
