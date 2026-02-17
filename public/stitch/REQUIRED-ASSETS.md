# Stitch theme – required assets

All image references in the Stitch theme use the `/stitch/<filename>` URL. These files must exist in `public/stitch/` for zero broken images.

| Filename | Use |
|----------|-----|
| logo.png | Header logo (`<img>` on all pages) |
| favicon.png | Tab icon (`<link rel="icon">`) |
| hero-bg.png | Optional: hero background (e.g. 1920×800). Add class `hero-bg-image` to hero section when using. |
| cta-bg.png | Optional: CTA section background. Dark overlay applied. |
| stitch-hero-screenshot.png | Optional: legacy hero background (Auxspire Homepage Design) |
| stitch-brand-aligned.png | Optional: CTA section background (Brand Aligned Design) |
| og-image.png | Optional: Social sharing image 1200×630 (fallback: logo.png) |

No remote or next/image references. Paths are absolute (`/stitch/...`) so they work from any page depth.
