# Canonical URL and legacy route plan

**Status: prepared for the redesigned site; not active on the live domain.**

## Proposed canonical URLs

| Page | Proposed canonical | Launch condition |
|---|---|---|
| Main | `https://heritztailor.com/` | Redesigned homepage is live at this URL |
| Customer gallery | `https://heritztailor.com/archive/` | The gallery route is published and returns HTTP 200 |
| Events and packages | `https://heritztailor.com/event/` | The redesigned event route is published and returns HTTP 200 |
| Store information | `https://heritztailor.com/store/` | The store route is published and returns HTTP 200 |

Each production page should have exactly one self-referencing canonical URL. Open Graph `og:url` should agree with that page's canonical URL.

## Preview policy

The GitHub Pages preview uses `noindex, nofollow`. Do not add production canonical tags to preview pages: the preview is not the current official website and its pages are not yet the live production equivalents. Keep the preview out of the production sitemap.

## Legacy paths to review at migration

| Existing official URL | Suggested action | Notes |
|---|---|---|
| `/gallery` | Consider 301 redirect to `/archive/` | Confirm the new archive contains the important gallery categories first |
| `/shop_info` | Consider 301 redirect to `/store/` | Confirm all current branch information is preserved |
| `/event` | Preserve or normalize to the approved event URL | The current site already uses this path; avoid a redirect loop |
| `/rental` and its branch pages | Keep equivalent landing pages or map to dedicated replacements | Do not redirect the whole rental section to an unrelated page |
| `/notice`, `/review`, `/qna`, franchise and policy pages | Preserve, replace with equivalent pages, or intentionally retire | Review existing backlinks and search traffic before removing |

These are migration recommendations, not redirects already configured. Confirm the final route structure and hosting capabilities before implementing them.
