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

Use Chrome DevTools MCP against `https://botbooru.com/profile/25826` for live visual checks and against `file://.../app/profile/preview.html` for local iteration. For low-risk edits, start with the preview harness and escalate to the live page when rendered BotBooru behavior matters.

## BotBooru Gotchas

- The blob is injected as `#custom-profile-root` inside `div.profile-identity-right-stack`; its CSS makes the stack `display: contents` and spans the bio full-width with `flex: 0 0 100%` and `order: 10`.
- Every rule needs `!important` to beat BotBooru's Tailwind utilities.
- Keep custom classes prefixed with `ld-`.
- Page-level selectors in active use: `body`, `#profile-banner`, `.profile-avatar-wrap`, `.profile-identity-row`, `.profile-identity-info-text`, `.profile-meta-strip`, `.profile-meta-chip`, `.profile-stat-pill`, `#profile-uploads-sort-bar`, `.profile-stats-sort-row`, `.profile-followers-following`. Re-verify these against the live DOM after BotBooru updates; the site is in active beta and class names have changed before.
- External assets (wallpaper, firefly banner) are hosted on file.garden; fonts come from Google Fonts via `@import`.

## Deploy

Deployment is a manual paste; there is no scripted write path to BotBooru.

1. Rebuild and verify the preview (`node build-preview.js`, then check `preview.html` at 1280/900/480px).
2. Copy the full contents of `app/profile/bio.html`.
3. The user pastes into the logged-in BotBooru profile bio editor and saves. The save is the manual public-write gate; agents do not perform it.
4. Reload `https://botbooru.com/profile/25826` and verify the live page (panel identity, links, bullet structure, responsive collapse).

For visual tuning, the preferred loop is: patch the live BotBooru DOM with DevTools, let the user judge the actual page, mirror approved values into `bio.html`, rebuild the preview, then hand off for the paste.

## Standing Layout Notes

- Ember/amber + teal Firefly aesthetic on deep brown; `--ld-line: #FFBF00` panel borders.
- Sora display + Source Sans 3 body.
- Left command panel: "Detail. Detail. Detail. More detail." hero, Cardmaking Method bullets, request/Ko-Fi pills, "Currently Focusing On" signal block.
- Right stack: About, Heads Up, Inspiration, Links / Credits panels.
- `.profile-stats-sort-row` margin-top (56px) keeps a wallpaper-reveal gap between the bio panels and the cards/stats section.
- Two-column grid collapses to one column at 860px; the hero h2 width loosens at the same breakpoint.
