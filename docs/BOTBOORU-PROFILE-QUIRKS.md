# BotBooru Profile Quirks And Limits

This document is the scratchpad for every hard-earned limitation in this profile project. Update it whenever a live BotBooru behavior, sizing limit, sanitizer behavior, or selector change is discovered.

## Deploy Model

- The bio field accepts a full custom HTML+CSS blob: one `<style>` element followed by one `<section class="ld-bb-a">`.
- BotBooru injects the blob as `#custom-profile-root` inside `div.profile-identity-right-stack` on the profile page.
- Deployment is a manual paste into the logged-in profile bio editor. There is no scripted write path; the user's save is the public-write gate.
- `app/profile/bio.html` is the editable source and the paste artifact at the same time. `preview.html` is generated; do not hand-edit it.
- Size budget: keep the blob at or under 32,768 bytes (32KB, confirmed ceiling as of 2026-06-10; earlier 22,500-byte guidance is obsolete). `build-preview.js` enforces this.

## Page Integration Contract

- `#custom-profile-root` gets `flex: 0 0 100%; order: 10` so the bio spans full width; `.profile-identity-right-stack` is set to `display: contents` to free its children into the parent flex row.
- `.profile-followers-following` and the remaining right-stack sibling are pushed right with `order` + `margin-left: auto`.
- `.profile-stats-sort-row` is re-ordered below the bio; its `margin-top` (56px) creates the wallpaper-reveal gap between the bio panels and the cards/stats section.
- Every rule needs `!important`: the site styles with Tailwind utility classes that otherwise win.
- Page-level selectors in active use: `body`, `#profile-banner`, `.profile-avatar-wrap`, `.profile-identity-row`, `.profile-identity-info-text`, `.profile-meta-strip`, `.profile-meta-chip`, `.profile-stat-pill`, `#profile-uploads-sort-bar`, `.profile-stats-sort-row`, `.profile-followers-following`. BotBooru is in active beta; re-verify after site updates.
- Stale selector (2026-06-10): `#profile-uploads-sort-bar` no longer exists on the live page; the cards/stats tab row is `.profile-stats-sort-row` containing `#profile-stats`, `#tab-uploads`, `#tab-favorites`, `#tab-comments`.
- Hash navigation is dead on the live site: the SPA router strips `location.hash` (sync, before paint) and native `#fragment` anchor scrolling never fires, even from trusted clicks or direct URL loads. In-page jumps must use inline `onclick` with `scrollIntoView()`/`scrollTo()` and `return false`.
- Inline `onclick` handlers in the bio blob survive the sanitizer and run (CSP `script-src` includes `unsafe-inline`, confirmed 2026-06-10). The `.ld-jump` fixed pills (Cards / Top) rely on this; re-verify after site updates since a sanitizer or CSP tightening silently kills them.
- Identity pills are matched structurally (`span[class*="rounded-full"][class*="uppercase"]`, `span.rank-donator-pill`, `span[class*="bg-emerald-900"]`, `span[class*="bg-sky-900"]`); new ranks may need new rules.

## Rendering Notes

- The wallpaper is drawn by `body::before` (fixed, low opacity) with a darkening gradient in `body::after`; panels sit on top with translucent backgrounds.
- The banner replaces BotBooru's own image with the firefly GIF via `background-image` on `#profile-banner` and hides the site's gradient overlay children.
- Fonts: Sora (display) + Source Sans 3 (body) via Google Fonts `@import` at the top of the `<style>` block. file.garden hosts the wallpaper and banner GIF.
- Bullet dots are `::before` pseudo-elements on `.ld-list li` (teal 5px, `top: 0.75em`), so text-only checks miss them; verify visually.
- The two-column grid (`minmax(230px, 0.74fr) minmax(0, 1.6fr)`) tightens at 1120px and collapses to one column at 860px.

## Verification Checklist

After any change, before and after the live paste:

1. `node build-preview.js` passes the size budget.
2. `preview.html` at 1280 / 900 / 480px: bullet alignment, strong lead-ins, link styling (orange, hover underline), no phantom gaps, single-column collapse.
3. Live page after paste: wallpaper + banner load, avatar ring, identity pills, panel borders, the 56px gap above the cards/stats row, anchors open in new tabs.
4. Copy rules: no literal markdown syntax, no bare URLs, no literal backticks, no em dashes.
