-- Testimonials lifecycle: draft → submitted → confirmed → published | declined
--
-- Placeholders are admin-only writing templates. They must never satisfy the
-- public visibility filter (published + is_public + verified + source <> placeholder).

ALTER TABLE public.testimonials
  ADD COLUMN IF NOT EXISTS is_public boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'visitor',
  ADD COLUMN IF NOT EXISTS verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS verification_method text,
  ADD COLUMN IF NOT EXISTS share_token uuid UNIQUE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS project_title_other text,
  ADD COLUMN IF NOT EXISTS short_body text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS notify_on_publish boolean NOT NULL DEFAULT false;

-- Visitor submitter emails stay required for public form rows; admin/placeholder
-- drafts may omit an address.
ALTER TABLE public.testimonials
  ALTER COLUMN submitter_email DROP NOT NULL;

-- Map legacy statuses before replacing the check constraint.
UPDATE public.testimonials SET status = 'submitted' WHERE status = 'pending';
UPDATE public.testimonials SET status = 'published' WHERE status = 'approved';

-- Rows that were previously "approved" become publicly visible + verified once
-- migrated (they already passed moderation under the old model).
UPDATE public.testimonials
SET
  is_public = true,
  verified = true,
  share_token = COALESCE(share_token, gen_random_uuid())
WHERE status = 'published'
  AND COALESCE(source, 'visitor') <> 'placeholder';

ALTER TABLE public.testimonials DROP CONSTRAINT IF EXISTS testimonials_status_check;
ALTER TABLE public.testimonials
  ADD CONSTRAINT testimonials_status_check
  CHECK (status IN ('draft', 'submitted', 'confirmed', 'published', 'declined'));

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.testimonials'::regclass
      AND conname = 'testimonials_source_check'
  ) THEN
    ALTER TABLE public.testimonials
      ADD CONSTRAINT testimonials_source_check
      CHECK (source IN ('visitor', 'placeholder', 'admin'));
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS testimonials_public_visible_idx
  ON public.testimonials (featured DESC, display_order ASC, submitted_at DESC)
  WHERE status = 'published' AND is_public = true AND verified = true AND source <> 'placeholder';

CREATE INDEX IF NOT EXISTS testimonials_share_token_idx
  ON public.testimonials (share_token)
  WHERE share_token IS NOT NULL;

CREATE INDEX IF NOT EXISTS testimonials_source_idx ON public.testimonials (source);

-- Drop the old approved-only ordering index if present; replaced above.
DROP INDEX IF EXISTS public.testimonials_published_order_idx;

-- ---------------------------------------------------------------------------
-- Seed: 9 draft placeholders (NOT for public display)
-- ---------------------------------------------------------------------------

INSERT INTO public.testimonials (
  person_name,
  person_title,
  organization,
  location,
  relationship,
  project_id,
  project_title_other,
  body,
  short_body,
  status,
  source,
  is_public,
  verified,
  submitter_email,
  consent_accepted,
  featured,
  display_order,
  moderation_notes
)
SELECT * FROM (VALUES
  (
    'Grace M.'::text,
    'Business Owner'::text,
    'APN African Marketplace'::text,
    'Des Moines, Iowa, USA'::text,
    'Client'::text,
    'apn-african-marketplace'::text,
    NULL::text,
    $b$What I liked most was how easy the website felt to use. The design is clean, customers can move around without getting confused, and the overall experience feels professional and international. It gave the business the kind of online presence we were looking for.$b$::text,
    $s$The website is clean, easy to navigate and feels professional. It gave our business a much stronger online presence.$s$::text,
    'draft'::text,
    'placeholder'::text,
    false,
    false,
    'placeholder+apn@internal.invalid'::text,
    false,
    false,
    10,
    'DRAFT PLACEHOLDER — replace attribution and verify before publishing. Evidence themes: Ease of use · Navigation · Professional design · International presentation.'::text
  ),
  (
    'Jean P.',
    'Monitoring & Data Officer',
    'Caritas Rwanda',
    'Kigali, Rwanda',
    'Organizational stakeholder',
    'caritas-systems',
    NULL,
    $b$The system brought our indicator information into a much clearer structure. Reporting, reviewing data and following information across different areas became easier to manage. Prince was responsive throughout the implementation and worked closely with us when adjustments were needed.$b$,
    $s$We needed a better way to organize and follow our indicators, and the system made that process much clearer.$s$,
    'draft',
    'placeholder',
    false,
    false,
    'placeholder+caritas-systems@internal.invalid',
    false,
    false,
    20,
    'DRAFT PLACEHOLDER — replace attribution and verify before publishing. Do not invent percentages or paper-reduction claims. Evidence themes: Indicator management · Reporting · Structured information · Responsiveness.'
  ),
  (
    'Marie C.',
    'Communications Officer',
    'Caritas Rwanda',
    'Kigali, Rwanda',
    'Client/stakeholder',
    'caritas-website',
    NULL,
    $b$The new website presents our work in a much clearer and more modern way. Information is easier to find, the pages are better organized, and the overall presentation reflects the organization more professionally. The project was handled with attention to both the content and the technical side.$b$,
    NULL,
    'draft',
    'placeholder',
    false,
    false,
    'placeholder+caritas-website@internal.invalid',
    false,
    false,
    30,
    'DRAFT PLACEHOLDER — replace attribution and verify before publishing. Evidence themes: Information architecture · Modernization · Usability · Organizational presentation.'
  ),
  (
    'Eric N.',
    'Founder',
    'WAKOW General Ltd',
    'Kigali, Rwanda',
    'Client',
    'wakow-general',
    NULL,
    $b$I came with a business that needed a stronger digital identity, not just a website. Prince helped us work through the branding, website and online presence as one complete process. It was useful having someone who could understand both the technical work and how the business needed to present itself.$b$,
    $s$It wasn't treated as just a website. The branding, website and online presence were approached as one complete project.$s$,
    'draft',
    'placeholder',
    false,
    false,
    'placeholder+wakow@internal.invalid',
    false,
    false,
    40,
    'DRAFT PLACEHOLDER — replace attribution and verify before publishing. Evidence themes: End-to-end delivery · Branding · Website · SEO · Digital presence.'
  ),
  (
    'Diane U.',
    'Founder / Program Lead',
    'Julia Foundation',
    'Rwanda',
    'Client',
    'julia-foundation',
    NULL,
    $b$As we were building the foundation, we needed a website that could clearly explain our work and also make it easier for people to support what we're doing. Prince understood that from the beginning and helped turn it into a platform that feels simple, trustworthy and practical for our organization.$b$,
    NULL,
    'draft',
    'placeholder',
    false,
    false,
    'placeholder+julia@internal.invalid',
    false,
    false,
    50,
    'DRAFT PLACEHOLDER — replace attribution and verify before publishing. Do not mention banking details or unsupported payment claims. Evidence themes: NGO presence · Communication · Donation journey · Trust.'
  ),
  (
    'Patrick K.',
    'Operations Manager',
    'Example Trading Company',
    'Kigali, Rwanda',
    'Product user',
    'stockpro',
    NULL,
    $b$Before using the system, keeping track of stock, sales and customer balances required checking information in different places. StockPro made those day-to-day operations easier to follow from one system. We can see what is happening with inventory and sales without going through the same manual process every time.$b$,
    $s$The biggest improvement for us is having stock, sales, invoices and customer balances in one place. It makes everyday follow-up much easier.$s$,
    'draft',
    'placeholder',
    false,
    false,
    'placeholder+stockpro@internal.invalid',
    false,
    false,
    60,
    'DRAFT PLACEHOLDER — only publish after a real user confirms. Do not claim hours saved or transaction volumes. Evidence themes: Inventory visibility · Operational consolidation · Sales tracking.'
  ),
  (
    'Samuel T.',
    'Product / Research Technology Lead',
    'Ethical Research Solutions',
    'Rwanda',
    'Colleague / supervisor',
    'askfield',
    NULL,
    $b$Prince adapted quickly from frontend integration into the wider research technology workflow. He became comfortable working with survey logic, data collection processes and the technical details needed to support field research. He was also willing to learn unfamiliar parts of the platform and follow problems through until they were resolved.$b$,
    NULL,
    'draft',
    'placeholder',
    false,
    false,
    'placeholder+askfield@internal.invalid',
    false,
    false,
    70,
    'DRAFT PLACEHOLDER — colleague/supervisor feedback only after confirmation. Do not imply a promotion or invented title. Evidence themes: Engineering growth · Research technology · Survey workflows.'
  ),
  (
    'Emmanuel R.',
    'Operations Manager',
    'PSTA Travel Agency',
    'Kigali, Rwanda',
    'Client / operational stakeholder',
    'psta-accounting',
    NULL,
    $b$The system gave us a more organized way to manage ticket records, invoices and the information needed for reporting. Prince understood the workflow because he had experience with the day-to-day ticketing process, which helped make the system practical for how the agency actually operated.$b$,
    NULL,
    'draft',
    'placeholder',
    false,
    false,
    'placeholder+psta@internal.invalid',
    false,
    false,
    80,
    'DRAFT PLACEHOLDER — only publish after PSTA stakeholder confirmation. Evidence themes: Domain understanding · Ticket accounting · Invoicing · Operational workflow.'
  ),
  (
    'Alice M.',
    'Training Coordinator',
    'Eshuri Learning',
    'Kigali, Rwanda',
    'Colleague / training stakeholder',
    NULL,
    NULL,
    $b$Prince has a practical way of explaining technical topics. During training, he focused on making sure people could actually follow the process and try things themselves instead of only listening to theory. That made the sessions easier for participants to engage with.$b$,
    NULL,
    'draft',
    'placeholder',
    false,
    false,
    'placeholder+eshuri@internal.invalid',
    false,
    false,
    90,
    'DRAFT PLACEHOLDER — training context (not a product case study). project_id left NULL; organization is Eshuri Learning. Evidence themes: Training · Communication · Practical teaching.'
  )
) AS seed(
  person_name, person_title, organization, location, relationship, project_id,
  project_title_other, body, short_body, status, source, is_public, verified,
  submitter_email, consent_accepted, featured, display_order, moderation_notes
)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.testimonials t
  WHERE t.source = 'placeholder'
    AND t.submitter_email = seed.submitter_email
);
