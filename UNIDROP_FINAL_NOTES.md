# UNIDROP FINAL

Merged baseline: UNIDROP_VN_THEO_PROMPT.txt_FIXED

Decisions:
- Keep the FIXED version as the functional/UX baseline.
- Keep the catalog intentionally empty so products are created from Admin.
- Keep Admin product image upload, image ordering/primary image, and rich description sections.
- Keep advanced local search from FIXED: aliases, budget queries, compact terms such as `tainghe`, relevance scoring.
- Keep the FIXED desktop navigation and 3-step checkout flow.
- Keep the FIXED mobile navigation with category/search access.
- Keep the Indigo visual identity from FIXED.

Validation commands:
- npm ci
- npm run typecheck
- npm run build
- npm run lint
