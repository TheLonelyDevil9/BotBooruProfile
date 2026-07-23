# CLAUDE.md

Guidance for working in this repository.

Follow the global AI-stack standards hub first: `G:\AI Stuff\_MDs\AI Stack Stuff\AI_STACK_STANDARDS.md`. Workspace-only routing lives in `G:\AI Stuff\AGENTS.md`.

This file is the canonical local operating guide. `AGENTS.md` is the thin compatibility entrypoint and should point here instead of duplicating detailed workflow rules.

## What This Is

Custom BotBooru creator profile for `The_Lonely_Devil` at `https://botbooru.com/profile/25826`.

`BBP` is the standing nickname for this project (registered in the global standards hub).

The project maintains a single profile bio blob:

- profile CSS (page-level restyles + bio panels)
- profile bio HTML
- all in one `<style>` + `<section class="ld-bb-a">` payload

## Source Of Truth

- Bio blob (CSS + markup): `app/profile/bio.html` (hand-edited directly; there is no template/JSON build step)
- Preview builder: `app/profile/build-preview.js`
- Generated output: `app/profile/preview.html`

Do not hand-edit `preview.html`; rebuild it.

## Commands

Use Git Bash for repo commands unless a task explicitly requires another shell.

```bash
cd "/g/AI Stuff/BotBooruProfile/app/profile"
node build-preview.js
```

The builder regenerates `preview.html` and fails if `bio.html` exceeds the 32,768-byte (32KB) bio budget.

## Git History

This repo is tracked on a private remote. After completing any code, profile, CSS, copy, generated artifact, or documentation contribution, commit and push to the current branch before final handoff unless the user explicitly asks not to.

Keep commits focused on the completed contribution. Do not include temporary screenshots, local browser artifacts, server logs, or unrelated workspace changes.

## Browser Checks

Use the `agent-browser` CLI (Chrome DevTools MCP and Playwright are banned per user instruction). Live checks: `agent-browser --state "G:/AI Stuff/Cardmaking/_Tools/.botbooru-upload/storage-state.json" open https://botbooru.com/profile/25826`, then `snapshot -i`, `screenshot`, or `eval`. Local iteration: `agent-browser open file://.../app/profile/preview.html`. For low-risk edits, start with the preview harness and escalate to the live page when rendered BotBooru behavior matters.

## BotBooru Gotchas

- The blob is injected as `#custom-profile-root` inside `div.profile-identity-right-stack`; its CSS makes the stack `display: contents` and spans the bio full-width with `flex: 0 0 100%` and `order: 10`.
- Every rule needs `!important` to beat BotBooru's Tailwind utilities.
- Keep custom classes prefixed with `ld-`.
- Page-level selectors in active use: `body`, `#profile-banner`, `.profile-avatar-wrap`, `.profile-identity-row`, `.profile-identity-info-text`, `.profile-meta-strip`, `.profile-meta-chip`, `.profile-stat-pill`, `#profile-uploads-sort-bar`, `.profile-stats-sort-row`, `.profile-followers-following`. Re-verify these against the live DOM after BotBooru updates; the site is in active beta and class names have changed before.
- External assets (wallpaper, firefly banner) are hosted on GitHub Pages (thelonelydevil9.github.io/BotBooruProfile/assets/); fonts come from Google Fonts via `@import`.

## Deploy

There is no scripted write path to BotBooru; deployment is a paste into the logged-in profile bio editor.

As of 2026-06-10 the user has authorized agent-driven deployment: the agent may open the logged-in BotBooru bio editor in the user's browser session, paste the full `app/profile/bio.html` contents, and save. This authorization covers profile bio updates only, not card uploads (those keep the dashboard gate in Cardmaking).

1. Rebuild and verify the preview (`node build-preview.js`, then check `preview.html` at 1280/900/480px).
2. Paste the full contents of `app/profile/bio.html` into the logged-in BotBooru profile bio editor and save (agent-driven per the authorization above, or manual paste by the user as fallback).
3. Reload `https://botbooru.com/profile/25826` and verify the live page (panel identity, links, bullet structure, responsive collapse). Watch for sanitizer changes on save (e.g., stripped attributes); report any mangling.

For visual tuning, the preferred loop is: patch the live BotBooru DOM with `agent-browser eval`, let the user judge the actual page, mirror approved values into `bio.html`, rebuild the preview, then hand off for the paste.

## Standing Layout Notes

- SAM HUD system (adopted 2026-07-16): ember/amber + teal Firefly aesthetic on deep brown, corner-cut panels (`clip-path`, `--ld-cut`), amber nameplate tabs with plain labels and `//` separators (Cardmaking // Method, About // Heads Up, Links // Credits; no in-universe naming), telemetry tick rule under the hero, chevron bullets, chamfered CTA buttons.
- Chakra Petch display/labels + Source Sans 3 body.
- Left command panel: "Firefly!" headliner link (to the card, above the hero), four-line hero "Detail. / Detail. / More detail. / Then some more.", Cardmaking Philosophy paragraphs (long-form, restored from the Chub era; the compact Method bullets were retired 2026-07-16), "Why do I do this?" note, equal-width Requests / Feedback + Ko-Fi CTAs with the no-guarantees note beneath, and the "Currently focusing on" readout with a blinking cursor (static under reduced motion).
- Right panel: About (heading is the "...Who?" gag link to a YouTube timestamp) + Heads Up in `--ld-warn` ember-red (NSFW warning, "Not your thing?", feet line).
- Links // Credits is a permanently expanded wide panel (plain `article`; the closed-by-default `<details>` disclosure was removed 2026-07-16). Below it, the Post-School-Fly art (`.ld-tail` figure with banner-style corner brackets and a danbooru credit caption) closes the profile section.
- Panel cut corners get their outline from `.ld-panel::before/::after` (1px rotated strokes over the clip-path notches; the border alone leaves the diagonals naked).
- Wallpaper is `background-size: cover` at `background-position: 38% 40%` (fixed attachment) so the art fills every viewport width with no side bands and Firefly's face stays in frame down to 480px. `.profile-stats-sort-row` margin-top is `100vh` at every width: one full clean frame of wallpaper between the profile tail and the cards/stats section.
- `.profile-avatar-wrap` carries `aspect-ratio: 1 / 1` + `height: auto` because the live wrap box is not square and renders the 50%-radius ring as an ellipse otherwise.
- The profile container collapses the two-column grid at 720px; the 860px viewport rule remains as a fallback and also tightens the surrounding BotBooru layout.
- Rank-pill overrides carry `[class*="rounded-full"]` so they out-rank the base pill rule (both are `!important`; the base rule sets `background`, so the cascade resolves by selector specificity).
