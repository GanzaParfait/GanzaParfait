-- Fill announcement defaults into site_settings.settings_json
-- (idempotent merge of announcement keys)

update public.site_settings
set
  settings_json = coalesce(settings_json, '{}'::jsonb) || jsonb_build_object(
    'announcementIsActive', true,
    'announcementText', 'New Achievement... Event to be held at Kigali Marriott Hotel.!',
    'announcementLink', '/contact',
    'announcementCtaLabel', 'View Event Details',
    'announcementEyebrow', 'Announcement',
    'announcementHeadline', 'New Achievement... Event to be held at Kigali Marriott Hotel.!',
    'announcementDetail', 'Join leaders, innovators, and change-makers for an evening focused on technology and impact across Africa.',
    'announcementDate', 'Saturday, Sep 20, 2026',
    'announcementTime', '2:00 PM (GMT+2)',
    'announcementPlace', 'Kigali Marriott Hotel, Kigali, Rwanda',
    'announcementLayout', 'side',
    'announcementSecondaryLabel', 'Add to Calendar',
    'announcementSecondaryHref', '',
    'announcementShare', true,
    'announcementSharePlatforms', jsonb_build_array('linkedin', 'twitter', 'facebook', 'whatsapp', 'link'),
    'announcementClosing', 'See you there! 👋',
    'announcementInterval', 5,
    'announcementBarPosition', 'top',
    'announcementMediaKicker', 'Speak · Learn · Connect',
    'announcementMediaTitle', 'Building Impact Together',
    'announcementAudience', 'Leaders · Innovators · Change-makers'
  ),
  announcement_text = 'New Achievement... Event to be held at Kigali Marriott Hotel.!',
  announcement_link = '/contact',
  announcement_is_active = true,
  updated_at = now()
where true;
