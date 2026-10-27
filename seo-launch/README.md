# HERITZ TAILOR — Production SEO launch kit

These files are **deployment templates only**. They are intentionally stored under `seo-launch/` and are not the active root-level `robots.txt` or sitemap.

The redesign preview remains at GitHub Pages and must stay `noindex, nofollow`. The existing official website at `https://heritztailor.com/` remains live on Sixshop until the owner approves the redesign and the domain migration plan.

## Prepared assets

- `robots.txt`: production robots rules with a sitemap reference.
- `sitemap.xml`: proposed sitemap for the redesigned site's planned public routes.
- `canonical-map.md`: intended canonical URLs and legacy URL migration notes.
- `business-facts.md`: source-checked business facts and items that must be confirmed before publishing local-business structured data.

## Before deployment

1. Confirm the redesign is approved and the production host will serve the routes listed in the sitemap.
2. Confirm whether the new routes `/archive/`, `/event/`, and `/store/` are final.
3. The owner has confirmed the main tailoring store address as 서울특별시 강남구 압구정로72길 21, 2층. Confirm opening hours and which other branches are currently operating before publishing those details; see `business-facts.md`.
4. Configure one-hop permanent redirects from retained legacy URLs where the new page is an equivalent replacement. Do not redirect unrelated pages to the homepage.
5. Add one self-referencing canonical URL per production page and update Open Graph URLs/images to the production domain.
6. Copy the production `robots.txt` and `sitemap.xml` to the **root of the production website**, not this folder.
7. Remove the preview-only `noindex, nofollow` directive from production pages only. Keep it in the preview.
8. Verify HTTP status, canonical targets, robots rules, sitemap URLs, redirects, structured data, booking links, mobile layout, and images on the live domain.
9. Submit the sitemap in Google Search Console and Naver Search Advisor after the production domain is verified.

## Safety boundary

No live DNS, Sixshop configuration, official website, or production robots settings were changed by preparing these files. Do not deploy the templates until the route and business-information checks above are complete.
