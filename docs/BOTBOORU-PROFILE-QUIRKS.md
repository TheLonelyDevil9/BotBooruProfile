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
- `.profile-stats-sort-row` is re-ordered below the bio; its `margin-top` (`100vh` at every width) creates the wallpaper-reveal gap between the bio panels and the cards/stats section: one viewport-high frame of clear wallpaper.
- Every rule needs `!important`: the site styles with Tailwind utility classes that otherwise win.
- Page-level selectors in active use: `body`, `#profile-banner`, `.profile-avatar-wrap`, `.profile-identity-row`, `.profile-identity-info-text`, `.profile-meta-strip`, `.profile-meta-chip`, `.profile-stat-pill`, `#profile-uploads-sort-bar`, `.profile-stats-sort-row`, `.profile-followers-following`, `#sidebar.sidebar-folded`. BotBooru is in active beta; re-verify after site updates.
- Stale selector (2026-06-10): `#profile-uploads-sort-bar` no longer exists on the live page; the cards/stats tab row is `.profile-stats-sort-row` containing `#profile-stats`, `#tab-uploads`, `#tab-favorites`, `#tab-comments`.
- Hash navigation is dead on the live site: the SPA router strips `location.hash` (sync, before paint) and native `#fragment` anchor scrolling never fires, even from trusted clicks or direct URL loads. Inline `onclick` handlers also do not survive the bio save because the editor sanitizer strips event-handler attributes. The prior hidden-checkbox jump workaround was removed when the profile was compacted; retain these constraints if in-page navigation returns later.
- Identity pills are matched structurally (`span[class*="rounded-full"][class*="uppercase"]`, `span.rank-donator-pill`, `span[class*="bg-emerald-900"]`, `span[class*="bg-sky-900"]`); new ranks may need new rules. Rank overrides must append `[class*="rounded-full"]` to match the base rule's specificity: everything is `!important`, so when the base pill rule also sets `background`, the cascade falls back to selector specificity and a bare `.rank-donator-pill` override loses (dark-on-dark pill, found 2026-07-16).

## Rendering Notes

- The wallpaper is the portrait art `profile-background-kuroida-kimono.webp` (2484x3726, since 2026-11-14) on the fixed `body::before` (`background-size: cover`, top-anchored, `opacity: 0.5`). `body::after` holds the darkening gradients, and panels sit on top with translucent backgrounds.
- On landscape viewports `body::before` is turned 90 degrees counter-clockwise (`rotate(-90deg)`, head on the left). Before the turn its box is `100vh` wide and `100vw - var(--ld-side)` tall, so after it the art covers the area beside the sidebar. The subject is lying down, so the sideways art reads naturally, and at 1920x1080 it fits that area almost exactly. `cover` pins the art's top edge (her head, the screen's left side after the turn) and crops the far end of her legs on narrower landscape shapes. Portrait viewports keep the art upright.
- `--ld-side` is the width of BotBooru's docked sidebar: 288px at 1280px and wider (`#sidebar` is fixed there and `#main-content` takes the same left margin), 56px when `#sidebar.sidebar-folded` is set, and 0px below 1280px, where the sidebar is off-canvas. If BotBooru renames that class or resizes the sidebar, a strip of the art hides behind the sidebar or a dark strip shows beside it.
- Rejected for this art on 2026-11-14: upright `cover` on desktop (crops to a head-and-shoulders band), and an upright figure with a blurred copy of the art filling the sides (the blurred bands distract at any figure size).
- The fixed layers size against the viewport, and full-page screenshots only paint them in the first viewport-height region; that black band below is a capture artifact, not a live bug.
- The banner replaces BotBooru's own image with the animated `top-firefly.webp` (1280x720) via `background-image` on `#profile-banner` and hides the site's gradient overlay children. Since 2026-07-31 the banner box is `aspect-ratio: 16 / 9` with `height: auto` (old `min-height` clamp removed) so the animation renders full-frame with no crop; `cover` on a matching-ratio box is a clean fit. Since 2026-09-24: `#profile-banner`, `.profile-identity-row`, and `.ld-bb-a` are capped at `min(100%, 966px)` with `margin-inline: auto` — 966px is the site's own wide-screen column width (`.profile-main-col` caps at 966px at 1920), so the cap only binds at mid viewport widths (measured 1264x569: banner 1131x636 → 966x543) and never below ~1030px.
- Fonts: Sora (display) + Source Sans 3 (body) via Google Fonts `@import` at the top of the `<style>` block. GitHub Pages (thelonelydevil9.github.io/BotBooruProfile/assets/) hosts the wallpaper and banner GIF.
- Bullet dots are `::before` pseudo-elements on `.ld-list li` (teal 5px, `top: 0.75em`), so text-only checks miss them; verify visually.
- The two-column grid (`minmax(0, 1.6fr) minmax(230px, 0.74fr)`) tightens at 1120px and collapses when the profile container reaches 720px; the 860px viewport rule remains as a fallback.

## Verification Checklist

After any change, before and after the live paste:

1. `node build-preview.js` passes the size budget.
2. `preview.html` at 1280 / 900 / 480px: bullet alignment, strong lead-ins, link styling (orange, hover underline), disclosure expansion, no phantom gaps, single-column collapse.
3. Live page after paste: wallpaper + banner load, avatar ring, identity pills, panel borders, the `100vh` gap above the cards/stats row, anchors open in new tabs.
4. Copy rules: no literal markdown syntax, no bare URLs, no literal backticks, no em dashes.
