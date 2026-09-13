# Prince Parfait GANZA Portfolio Repositioning

## Master implementation brief for the coding agent

**Document status:** Approved implementation direction  
**Primary objective:** Reposition the entire portfolio from a narrow developer profile into a credible, evidence-backed founder, entrepreneur, and technologist profile—without weakening or hiding Prince Parfait GANZA's software engineering capability.  
**Implementation rule:** Do not merely edit documentation or report recommendations. Inspect the full repository, implement the changes in the application, update all affected documentation and metadata, test the result, and then report exactly what changed and what remains unresolved.

---

## 1. The required outcome

The portfolio must present Prince Parfait GANZA as a multidimensional builder and leader whose technical skill supports a broader identity.

The canonical identity is:

> **Founder · Entrepreneur · Technologist**

The canonical positioning statement is:

> **Building technology, products and ventures that turn ambitious ideas into real-world impact.**

These two lines are the primary public positioning and must replace developer-only identity copy in prominent or general-purpose locations.

The finished site must communicate the following hierarchy within the first screen and first moments of scrolling:

1. **Who he is:** Prince Parfait GANZA.
2. **How he should be understood:** Founder · Entrepreneur · Technologist.
3. **What he does:** Builds technology, products, and ventures.
4. **Why it matters:** Turns ambitious ideas into real-world impact.
5. **What proves it:** Real ventures, client systems, products, leadership, technical delivery, training, and measurable project outcomes.

The site must not imply that Prince is only a software engineer, freelancer, coder, AI integrator, or service provider. Those are important capabilities and roles, but they are supporting evidence—not the ceiling of the identity.

---

## 2. Non-negotiable implementation instruction

The coding agent must follow this sequence:

1. Read this document fully before modifying code.
2. Inspect the complete repository, including application source, content/data files, configuration, public assets, generated metadata logic, and every Markdown document.
3. Create an inventory of every identity-bearing string and every component or route affected by this repositioning.
4. Implement the approved changes across the real application first.
5. Update project documentation so it describes the implemented system and no longer reintroduces outdated copy.
6. Run formatting, linting, type checking, automated tests, and a production build using the package manager already selected by the repository.
7. Review the rendered experience at desktop, tablet, and mobile widths.
8. Search again for stale wording and inconsistent metadata.
9. Report completed files, tests, decisions, and genuine blockers. Do not claim completion if any required verification failed.

Do not stop after producing a plan. Do not edit only the hero component. Do not perform blind global replacements. Context matters: “Software Engineer” may remain inside a truthful past job title, skill taxonomy, detailed biography, or project role, while it must be removed as the dominant site-wide identity.

---

## 3. Product and brand intent

This is a personal portfolio, not a generic developer template and not a disguised agency landing page.

It should feel:

- professional and established;
- ambitious without exaggeration;
- technology-led but not trapped in “software developer” language;
- founder-led and people-centred;
- editorial, precise, and credible;
- relevant to clients, partners, recruiters, investors, collaborators, event organizers, and institutions;
- distinctly connected to Prince's real work in Rwanda and beyond.

The visual system should communicate **person → ideas → systems → products → impact**.

Avoid generic visual signals such as excessive glowing gradients, decorative AI imagery, fake holograms, dense circuitry, too many floating glass cards, or a dashboard-like wall of rounded rectangles. The work and the evidence should create the attraction.

---

## 4. Canonical messaging system

### 4.1 Primary name

Use the full name in high-authority contexts:

> Prince Parfait GANZA

Do not inconsistently alternate between shortened versions in page titles, structured data, headings, and social metadata unless the compact logo itself requires it.

### 4.2 Primary role line

Use:

> Founder · Entrepreneur · Technologist

Use the middle dot consistently. Do not replace this with a rotating list that makes the identity unstable. Do not lead with “Software Engineer.”

### 4.3 Primary positioning line

Use exactly:

> Building technology, products and ventures that turn ambitious ideas into real-world impact.

This wording is broad by design:

- **technology** preserves technical depth;
- **products** communicates practical building and ownership;
- **ventures** allows Lerony and future businesses to fit naturally;
- **ambitious ideas** signals scale and imagination;
- **real-world impact** grounds the claim in practical outcomes.

Do not casually rewrite it into “Building software that creates impact,” “I build full-stack products and integrate AI,” or similar developer-only wording in another high-visibility location.

### 4.4 Short biography

Use a version close to the following, adjusting only for established facts already documented in the repository:

> Prince Parfait GANZA is a Rwandan founder, entrepreneur and technologist based in Kigali. He leads Lerony and works across technology, digital products and ventures that help organizations and ambitious ideas become reliable real-world solutions. His background combines software engineering, product delivery, data systems, client collaboration and technical training.

Do not add unsupported superlatives, inflated scale, invented awards, invented revenue, invented partnerships, or outcomes that the repository cannot substantiate.

### 4.5 Compact biography

For locations with strict space limits:

> Rwandan founder, entrepreneur and technologist building technology, products and ventures from Kigali.

### 4.6 Calls to action

Preferred primary CTA:

> View selected work

Preferred secondary CTA:

> About me

Preferred contact CTA:

> Let's talk

Avoid vague CTAs such as “Discover more” when a destination can be named precisely.

---

## 5. Context-sensitive replacement rules

The agent must classify each occurrence before editing it.

| Existing wording or pattern | Required action | Important exception |
| --- | --- | --- |
| Software Engineer as the global identity | Replace with **Founder · Entrepreneur · Technologist** | Keep it when it is an accurate employment title or technical-role label |
| Building software that creates impact | Replace with the canonical positioning statement | A case study may discuss software specifically |
| I build full-stack products and integrate AI... | Remove from prominent general positioning; rewrite using canonical messaging | Technical services and project descriptions may name full-stack and AI precisely |
| Full-stack products and AI, built from Kigali... | Rewrite so it does not define the whole identity through tools | Can remain only as a narrowly labelled technical-capability statement |
| Developer portfolio / software developer | Replace in global SEO and descriptive copy | Historical education and job facts can remain |
| Founder | Strengthen to Founder & CEO where referring specifically to Lerony, if factually correct | Do not attach CEO to unrelated ventures |
| Services in primary navigation | Prefer **Ventures** if the corresponding destination is implemented meaningfully | Keep Services as a secondary section or route if it has useful content |

The goal is not to erase software engineering. The goal is to put it in the correct layer:

- **Identity layer:** Founder · Entrepreneur · Technologist.
- **Positioning layer:** technology, products, ventures, impact.
- **Capability layer:** software engineering, product development, systems integration, data, AI, consulting, training.
- **Evidence layer:** projects, ventures, roles, case studies, outcomes.

---

## 6. Repository-wide discovery requirements

Before editing, search case-insensitively for at least:

```text
Software Engineer
Software Developer
Frontend Developer
Full-stack
full stack
integrate AI
Building software
creates impact
developer portfolio
portfolio developer
Founder
Entrepreneur
Technologist
Services
Discover more
welcome
Kigali
Prince Parfait
GANZA
description
metadata
openGraph
twitter
jsonLd
structured data
manifest
```

Inspect, where present:

- all files under `src/`, `app/`, `pages/`, `components/`, `content/`, `data/`, `lib/`, `config/`, and `public/`;
- root layouts and route-specific layouts;
- metadata objects and metadata-generation functions;
- JSON, TypeScript, JavaScript, JSX, TSX, Markdown, MDX, YAML, and environment-driven content;
- CMS seed/default content and database seed scripts;
- localization dictionaries;
- loading states, fallbacks, empty states, error pages, and no-JavaScript content;
- PWA manifests and browser/app names;
- Open Graph and Twitter/X preview data;
- JSON-LD or other schema markup;
- RSS/Atom feeds and sitemap generation;
- robots directives and canonical URLs;
- email/contact templates if they repeat the old identity;
- README and every file inside `docs/`;
- tests and snapshots that encode outdated copy;
- image alt text and accessible labels;
- hardcoded defaults used when CMS or API data is unavailable;
- local storage or theme/layout fallback logic only where it affects visible identity copy.

Do not modify dependencies, build output, `.next`, package caches, or generated lockfile content unless the actual implementation requires a dependency change.

---

## 7. Hero implementation specification

Use the third screenshot—the bright split composition with name on the left and portrait in the blue architectural frame on the right—as the approved foundation.

### 7.1 Required content hierarchy

The desktop hero should read in this order:

1. Availability/location indicator.
2. “Hi there, I'm” eyebrow.
3. **Prince Parfait GANZA** as the dominant heading.
4. **Founder · Entrepreneur · Technologist** as the primary identity line.
5. **Building technology, products and ventures that turn ambitious ideas into real-world impact.**
6. Primary CTA: **View selected work**.
7. Secondary CTA: **About me**.
8. Social links in a visually secondary position.

### 7.2 Portrait treatment

- Preserve the portrait as a strong visual anchor.
- Keep the blue architectural arch/frame, but make it feel deliberate and structural rather than decorative.
- Use at most one compact contextual card around the portrait:

  **Founder & CEO**  
  **LERONY · Kigali**

- Remove the separate “Kigali / Rwanda” floating card because location already appears in the availability indicator.
- Do not cover the face, distort the portrait, or let floating cards compete with the name.
- Preserve correct image aspect ratio and crispness on high-density displays.

### 7.3 Background treatment

Do not add a random “attractive” background. Introduce an extremely subtle technical system:

- faint grid or dot field concentrated near the portrait;
- limited blue geometry or system lines;
- gradual fade toward the text area;
- restrained opacity that never reduces text contrast;
- no animation that distracts from the name or causes performance issues;
- respect `prefers-reduced-motion` if motion is used.

The visual metaphor should be quiet: **a person shaping ideas into systems and products**.

### 7.4 Spacing and composition

- Tighten the vertical rhythm between identity, positioning, CTAs, and social links.
- Keep generous whitespace, but make it intentional rather than empty.
- Prevent the name from colliding with the portrait or overflowing at intermediate widths.
- Keep the first CTA visible without requiring scrolling on standard laptop screens where practical.
- Ensure the navigation does not consume an excessive portion of the mobile viewport.

### 7.5 Responsive behaviour

At tablet and mobile widths:

- keep the name and identity readable without awkward single-letter wrapping;
- retain the role and positioning statement above the first CTA;
- stack or reorder content logically without duplicating headings;
- place portrait after the essential identity copy unless existing user testing supports another order;
- remove or simplify floating cards before compressing them into clutter;
- keep tap targets at least comfortably usable;
- avoid horizontal scrolling and viewport-height traps;
- test both light and dark themes if both remain supported.

---

## 8. Navigation and information architecture

Preferred primary navigation:

> About · Work · Experience · Ventures · Contact

Implementation conditions:

- Replace **Services** with **Ventures** only if a real Ventures section or page is delivered in the same change.
- Ventures should introduce Lerony and any other verified founder-led products or initiatives already present in repository content.
- If Ventures cannot yet be populated credibly, retain Services temporarily and create an explicit tracked follow-up rather than linking to an empty section.
- Keep Services accessible as a secondary section/page where relevant; the site may still explain how Prince helps clients.
- Reduce header actions to a focused set such as LinkedIn, GitHub, theme, and **Let's talk**.
- Move less important social channels and share actions into an overflow menu.
- On mobile, ensure the menu exposes all destinations with keyboard-accessible controls and clear focus states.

No navigation item should point to an absent anchor or incomplete placeholder.

---

## 9. Homepage narrative beyond the hero

The homepage must prove the broader identity instead of simply declaring it.

Recommended sequence:

1. Clean light hero.
2. Dark navy **Selected Work** section.
3. Founder/ventures section.
4. Experience and capabilities.
5. About/principles or speaking/training proof.
6. Focused contact invitation.

Use a white → dark navy → white transition to create memorable contrast without making the hero visually overloaded.

### Selected Work

Avoid a generic card grid as the dominant presentation. Use large editorial case-study entries with:

- sequence number;
- project name;
- sector/category;
- Prince's role;
- year or timeframe;
- strong product visual;
- the problem;
- Prince's contribution;
- result or current status;
- explicit case-study link.

Prioritize verified, substantial work already represented in the repository, potentially including CRNIS, StockPro, AskField, Lerony, the PSTA system, and other legitimate client or product work. Do not invent metrics. If an outcome is qualitative, state it honestly.

### Ventures

The Ventures content should establish ownership and leadership, especially Lerony, without turning the personal site into the Lerony corporate website. Explain the venture, Prince's role, its focus, and link to its own destination.

### Capabilities

Capabilities may include software engineering, product strategy, digital systems, data systems, AI integration, consulting, and training where supported. Phrase them as capabilities used to deliver outcomes, not as disconnected buzzwords.

---

## 10. About page and profile strength

The About page must tell a coherent story rather than repeat a résumé.

It should cover:

- Prince as a Rwandan founder, entrepreneur, and technologist;
- his path through software engineering and practical systems work;
- founding and leading Lerony;
- experience building products and operational systems;
- collaboration with organizations and clients;
- interest in turning ideas into useful, reliable outcomes;
- technical training and knowledge-sharing where relevant;
- a forward-looking direction without inflated claims.

Keep factual job titles, technical skills, education, certifications, and dates in the Experience or résumé context. This precision strengthens the broader founder identity because it supplies evidence.

Avoid:

- presenting youth as a limitation or apology;
- vague claims such as “world-class visionary”;
- unverified “leading” or “award-winning” language;
- enormous skill lists with no evidence;
- repeating the hero statement verbatim in every paragraph;
- making every paragraph start with “I.”

---

## 11. Metadata, SEO, previews, and machine-readable identity

Update the identity consistently wherever search engines, social platforms, browsers, or AI systems consume it.

### 11.1 Suggested homepage title

> Prince Parfait GANZA | Founder, Entrepreneur & Technologist

Keep it within sensible search-display length. If the framework composes a title template, ensure it does not duplicate the name.

### 11.2 Suggested meta description

> Prince Parfait GANZA is a Rwandan founder, entrepreneur and technologist building technology, products and ventures that turn ambitious ideas into real-world impact.

Check actual rendered character length and rewrite slightly only if needed. Preserve the same meaning.

### 11.3 Open Graph and social preview

- Use the updated title and description.
- Confirm the canonical production URL.
- Confirm the preview image has the correct absolute URL, aspect ratio, file type, dimensions, and meaningful alt text.
- The preview image should visibly communicate the name and canonical identity, not “Software Engineer.”
- Provide Twitter/X card metadata consistently.
- Avoid different identity descriptions between Open Graph, X, and HTML metadata.

### 11.4 Structured data

Where `Person` schema is used:

- use the correct full name;
- use a concise, accurate description;
- include the canonical site URL and verified social profiles;
- represent Lerony affiliation/founder relationship only through valid schema properties and verified facts;
- keep job titles accurate and avoid stuffing multiple keywords into unsupported properties;
- ensure serialized JSON-LD is valid.

### 11.5 Other surfaces

Review:

- sitemap;
- canonical links;
- RSS/feed titles and descriptions;
- web manifest name and description;
- browser title fallbacks;
- favicons and icons;
- About and Contact route metadata;
- project-page titles/descriptions;
- image alternative text;
- any downloadable résumé metadata;
- 404 and error-page identity copy.

---

## 12. Documentation synchronization

Every relevant repository document must be updated after application implementation. The screenshots show documents such as:

- `docs/ASSET_STRUCTURE.md`
- `docs/BRAND_GUIDELINES.md`
- `docs/CONTENT_STRATEGY.md`
- `docs/DESIGN_SYSTEM.md`
- `docs/DIGITAL_PRESENCE.md`
- `docs/PORTFOLIO_CONTEXT.md`
- `docs/PROJECT_BRIEF.md`
- `docs/ROADMAP.md`
- `docs/SEO_AUDIT.md`
- `docs/SEO_STRATEGY.md`
- `docs/TECH_STACK.md`

Inspect the actual repository rather than assuming this list is complete.

For each relevant document:

- remove or contextualize stale developer-only identity wording;
- establish the canonical role and positioning statement;
- keep implementation details aligned with the actual code;
- distinguish completed work from recommendations and backlog items;
- update examples, screenshots, content maps, SEO examples, and acceptance criteria;
- avoid copying the same long biography into every document; link or name a canonical source when possible.

Create a single canonical content/config source in code if the architecture supports it, for example a typed profile/site configuration object. Components and metadata should reuse it where sensible so future copy does not drift. Do not force centralization where it creates awkward client/server imports or worsens the architecture.

---

## 13. Accessibility, quality, and performance requirements

The redesign is not complete unless it remains robust.

### Accessibility

- Preserve one logical page-level `h1`.
- Maintain correct heading hierarchy.
- Meet WCAG AA contrast for normal text and interactive controls.
- Ensure full keyboard navigation and visible focus treatment.
- Add useful alt text for meaningful images and empty alt text for purely decorative elements.
- Give icon-only links accessible names.
- Do not communicate availability or state by colour alone.
- Respect reduced-motion preferences.
- Make menus, dialogs, theme controls, and overflow actions screen-reader usable.

### Performance

- Optimize the hero portrait and project images with the framework's recommended image component where appropriate.
- Define image dimensions to prevent layout shift.
- Avoid heavy background assets and unnecessary client-side animation.
- Keep the hero's essential text server-rendered where supported.
- Do not introduce a large dependency for a minor visual effect.

### Reliability

- Preserve SSR/hydration consistency. Defaults used during server rendering must match the client's first render.
- Do not depend on `localStorage`, browser dimensions, or theme state during initial render without a hydration-safe pattern.
- Ensure menus and CTAs still work when animations are disabled.
- Validate internal links and anchors.
- Handle missing images or content without collapsing the layout.

---

## 14. Testing and verification checklist

Use the repository's existing package manager and scripts. The visible project uses Yarn, so prefer the checked-in Yarn workflow unless repository configuration proves otherwise.

Run every relevant existing command, typically including:

```bash
yarn format
yarn lint
yarn typecheck
yarn test
yarn build
```

Only run scripts that exist, and report missing scripts honestly. Do not silently switch package managers or regenerate lockfiles.

### Required manual verification

Verify at minimum:

- homepage desktop around 1440px;
- laptop around 1280px;
- tablet around 768px;
- mobile around 390px;
- light theme;
- dark theme, if supported;
- keyboard-only navigation;
- reduced-motion mode;
- social preview metadata in page source or a metadata test;
- no hydration, console, broken-image, or missing-key errors;
- no horizontal overflow;
- primary CTA and navigation destinations work;
- portrait and heading do not collide;
- the canonical identity appears consistently.

### Final stale-copy audit

Repeat the repository-wide search. Every remaining occurrence of narrower wording must be one of:

1. intentionally retained factual role/history;
2. a technical capability in the correct context;
3. a case-study-specific description;
4. a documented follow-up with a valid blocker.

No stale global identity phrase may remain unnoticed.

---

## 15. Acceptance criteria

The implementation is accepted only when all applicable criteria are true:

- The visible hero uses **Founder · Entrepreneur · Technologist**.
- The hero uses **Building technology, products and ventures that turn ambitious ideas into real-world impact.**
- “Software Engineer” is no longer the dominant global identity.
- Technical roles and capabilities remain available as supporting evidence.
- The hero is based on the clean third design and uses restrained technical background detail.
- Portrait-side content is reduced to no more than one purposeful context card.
- Duplicate location information is removed from the portrait area.
- The primary CTA is **View selected work** and the secondary CTA is **About me**.
- The homepage visibly proves founder, product, venture, and technical credibility.
- Selected Work uses strong case-study hierarchy rather than relying entirely on generic cards.
- Navigation is simplified and contains no dead destinations.
- Metadata, Open Graph, X cards, structured data, manifest, feeds, and fallbacks use consistent positioning.
- Relevant docs match the implemented application.
- Responsive, accessibility, hydration, and performance checks pass.
- Formatting/lint/type/test/build results are reported.
- No invented achievements or unverifiable claims were introduced.

---

## 16. Boundaries: what must not be done

- Do not rebuild the site from scratch without a demonstrated architectural need.
- Do not choose one of the other screenshots as the new foundation.
- Do not add visual decoration merely to fill whitespace.
- Do not make the site look like a generic SaaS landing page.
- Do not turn the portfolio into Lerony's corporate website.
- Do not erase the software engineering background.
- Do not fabricate metrics, clients, awards, partnerships, or impact.
- Do not add a Ventures navigation item with no meaningful destination.
- Do not replace every instance of “Software Engineer” blindly.
- Do not edit generated build directories or dependency folders.
- Do not finish with only a written recommendation—the real code must be changed and verified.
- Do not say “fully implemented” when tests, build, responsive inspection, or metadata validation remain incomplete.

---

## 17. Required completion report from the coding agent

After implementation, return a concise but evidence-based report with these sections:

### Implemented

- Summary of the new identity system.
- Key visual and content changes.
- Routes and components changed.

### Repository-wide consistency

- Metadata and machine-readable surfaces updated.
- Documentation updated.
- Old wording intentionally retained, with its exact context and reason.

### Verification

- Commands run and whether each passed.
- Viewports/themes checked.
- Accessibility and hydration checks performed.

### Outstanding items

- Only real blockers or decisions requiring Prince's input.
- Exact files or features affected.
- Recommended next action.

The report must distinguish completed work from proposed follow-up work.

---

## 18. Copy-ready instruction to start the agent

Paste the following instruction into the coding agent together with this file:

> Read `PRINCE_PARFAIT_PORTFOLIO_REPOSITIONING_IMPLEMENTATION_BRIEF.md` completely and treat it as the authoritative implementation specification. Inspect the entire repository before editing. Then implement the approved repositioning across the real application—not only the documentation and not only the homepage hero. Update every applicable content source, component, route, metadata surface, structured-data entry, social preview, fallback, test, and repository document. Preserve “Software Engineer” only where it is a truthful contextual role or capability, never as the dominant global identity. Use “Founder · Entrepreneur · Technologist” and “Building technology, products and ventures that turn ambitious ideas into real-world impact.” as the canonical public positioning. Keep the third portfolio design as the visual foundation, strengthen it using restrained technical/industrial details, simplify portrait cards, and preserve accessibility, responsiveness, performance, and hydration safety. Run the repository's formatting, linting, type-checking, tests, and production build; visually verify key responsive widths; perform a final stale-copy search; fix all issues within scope; and then return the completion report required by Section 17. Do not stop at a plan and do not claim completion without verification.

---

## 19. Final decision summary

The approved direction is not “make the Software Engineer title sound more impressive.” It is a structural repositioning:

> **Prince Parfait GANZA**  
> **Founder · Entrepreneur · Technologist**  
> **Building technology, products and ventures that turn ambitious ideas into real-world impact.**

Software engineering remains a major source of credibility. It now serves the larger story of someone who founds, leads, builds, delivers, and turns ideas into working products and ventures.
