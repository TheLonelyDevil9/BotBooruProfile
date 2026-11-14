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
- `.profile-stats-sort-row` is re-ordered below the bio; its `margin-top` (`100vh` at every width) creates the wallpaper-reveal gap between the bio panels and the cards/stats section: one viewport-high frame, so the whole wallpaper figure is visible at once.
- Every rule needs `!important`: the site styles with Tailwind utility classes that otherwise win.
- Page-level selectors in active use: `body`, `#profile-banner`, `.profile-avatar-wrap`, `.profile-identity-row`, `.profile-identity-info-text`, `.profile-meta-strip`, `.profile-meta-chip`, `.profile-stat-pill`, `#profile-uploads-sort-bar`, `.profile-stats-sort-row`, `.profile-followers-following`, `#sidebar.sidebar-folded`. BotBooru is in active beta; re-verify after site updates.
- Stale selector (2026-06-10): `#profile-uploads-sort-bar` no longer exists on the live page; the cards/stats tab row is `.profile-stats-sort-row` containing `#profile-stats`, `#tab-uploads`, `#tab-favorites`, `#tab-comments`.
- Hash navigation is dead on the live site: the SPA router strips `location.hash` (sync, before paint) and native `#fragment` anchor scrolling never fires, even from trusted clicks or direct URL loads. Inline `onclick` handlers also do not survive the bio save because the editor sanitizer strips event-handler attributes. The prior hidden-checkbox jump workaround was removed when the profile was compacted; retain these constraints if in-page navigation returns later.
- Identity pills are matched structurally (`span[class*="rounded-full"][class*="uppercase"]`, `span.rank-donator-pill`, `span[class*="bg-emerald-900"]`, `span[class*="bg-sky-900"]`); new ranks may need new rules. Rank overrides must append `[class*="rounded-full"]` to match the base rule's specificity: everything is `!important`, so when the base pill rule also sets `background`, the cascade falls back to selector specificity and a bare `.rank-donator-pill` override loses (dark-on-dark pill, found 2026-07-16).

## Rendering Notes

- The wallpaper uses both fixed `body` pseudo-elements; panels sit on top with translucent backgrounds. Source art since 2026-11-14: `profile-background-kuroida-kimono.webp` (2484x3726, portrait). `body::after` draws the sharp art at `background-size: auto 100%`, so the whole figure fits the viewport height. Its mask (`--ld-art-mask`: 66.667vh wide to match the art, 10% feather per side) fades the left and right edges. `body::before` draws the same art stretched to `100% 100%` under `filter: blur(40px)` as the fill beside the figure; `inset: -120px` keeps the blur's transparent fringe off-screen. Both layers carry `--ld-shade` (the darkening gradients plus a 50% `--ld-deep` wash that stands in for the old `opacity: 0.5`), so their tones match where the mask blends them.
- `cover` sizing (2026-07-16 to 2026-11-14) filled every width with no side bands, but it crops portrait art to a head-and-shoulders band on desktop. Use it again only with landscape art.
- `--ld-art-x` centres the art on the content column, not the viewport. BotBooru docks `#sidebar` (fixed, 288px) at 1280px and wider and gives `#main-content` the same left margin, so the column centre sits 144px right of the viewport centre. `#sidebar.sidebar-folded` shrinks the sidebar to 56px (28px offset). Below 1280px the sidebar is off-canvas and the offset is zero. If BotBooru renames that class or resizes the sidebar, the art sits off-centre by up to half the sidebar width.
- On viewports narrower than the art (aspect below 2:3, phones) the art overflows left and right and the feather zones fall off-screen, so it fills the screen edge to edge.
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
