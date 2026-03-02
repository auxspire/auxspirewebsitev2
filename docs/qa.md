# Auxspire website – QA checklist

Use this checklist before release or after major changes.

## Theme and design system

- [ ] All pages use `body.theme-dark` and load the same CSS stack (design-system, components, animations, textures, abstract-elements where applicable).
- [ ] No inline styles overriding design tokens except where necessary (e.g. dynamic values).
- [ ] Buttons, cards, and containers use shared classes (`.btn`, `.card`, `.container`, `.section-header`).
- [ ] Subpages (about-us, contact, case-studies, client-portal, stories) match homepage visual theme.

## Mobile responsiveness

- [ ] No horizontal scroll at 360px, 375px, 768px widths.
- [ ] Containers use `padding-left/right: var(--space-md)` at 480px.
- [ ] Hero buttons wrap and are full-width on small screens where implemented.
- [ ] Cards grid stacks to one column at 768px.
- [ ] Footer links wrap; capabilities icon row wraps.
- [ ] Form inputs have minimum 44px tap target (min-height); buttons have min-height 44px.
- [ ] Sticky CTA is full-width at bottom on viewports ≤768px.
- [ ] Test key pages at 360px width (Chrome DevTools or real device).

## SEO

- [ ] Every page has a unique `<title>` and `<meta name="description">`.
- [ ] Canonical URL set on every page.
- [ ] OG and Twitter meta tags present (og:title, og:description, og:url, og:image, twitter:card, etc.).
- [ ] One H1 per page; heading hierarchy is correct (H1 → H2 → H3, no skips).
- [ ] JSON-LD present where required: Organization + WebSite on index; Service/ContactPage on about and contact as appropriate.
- [ ] `sitemap.xml` exists and lists all public URLs.
- [ ] `robots.txt` exists and allows crawling; references sitemap.

## AI-search (llms.txt)

- [ ] `/llms.txt` is reachable and contains: company summary, main pages list, services, industries, regions, proof metrics, how to cite, contact URL.

## Animations

- [ ] Section/scroll animations use IntersectionObserver and only run when element is in view (or when reduced-motion is off).
- [ ] Animations use only `transform` and `opacity` where possible (no layout thrash).
- [ ] `prefers-reduced-motion: reduce` is respected: animations disabled or simplified.
- [ ] No animation runs before DOM/assets are ready (scripts run on DOMContentLoaded or after).
- [ ] Homepage canvas/particle scripts do not throw errors on mobile; particle count is reduced on small screens if applicable.

## Performance and Lighthouse

- [ ] Fonts use `display=swap` in the Google Fonts URL.
- [ ] Images below the fold use `loading="lazy"` where appropriate (logo above fold can stay eager).
- [ ] No unnecessary render-blocking scripts; non-critical JS can be deferred if added later.
- [ ] Run Lighthouse (Performance, Accessibility, Best Practices, SEO) and address obvious failures or quick wins.

## Accessibility

- [ ] Color contrast meets WCAG AA for text (4.5:1 normal, 3:1 large).
- [ ] Focus-visible states are visible (e.g. outline or box-shadow on buttons and links).
- [ ] Decorative SVGs have `aria-hidden="true"`.
- [ ] Skip link “Skip to main content” works and is visible on focus.
- [ ] Form labels are associated with inputs; required fields are indicated.

## Routes and links

- [ ] All internal links work (no 404s).
- [ ] Navigation is consistent across pages (same nav links and order).
- [ ] Footer links match main nav where applicable.

## Remaining TODOs (if any)

- [ ] Document any known limitations or future improvements here.
