# CLAUDE.md

Guidance for working in this repository.

Follow the global AI-stack standards hub first: `C:\Users\TheLonelyDevil\.codex\AI_STACK_STANDARDS.md`. Workspace-only routing lives in `D:\AIStuff\AGENTS.md`.

This file is the canonical local operating guide. `AGENTS.md` is the thin compatibility entrypoint and should point here instead of duplicating detailed workflow rules.

## External North Stars

- Project philosophy: use the active `agent-harness-pointers` skill when the current runtime exposes it; otherwise apply the same repo-legibility, durable-guidance, small-feedback-loop principles directly.
- Prompting guidance: use the active `llm-prompting-guide` skill for the current runtime.

Use these as durable operating context before making project-wide changes, workflow changes, prompt changes, or repo guidance changes. Keep repository guidance concise and discoverable, then link to deeper sources instead of turning this file into a long manual.

## What This Is

Custom Chub.ai creator profile for `The_Lonely_Devil`.

The project builds a single About Me deploy blob:

- profile CSS
- profile bio HTML
- all inside `<div class="ld-bio">`

## Source Of Truth

- Copy, links, image URLs: `app/profile/profile-content.json`
- CSS: `app/profile/deploy.css`
- Markup template: `app/profile/profile-template.js`
- Generated output: `app/profile/paste-blob.html`

Do not hand-edit `deploy-bio.html` or `paste-blob.html`; rebuild them.

## Commands

Use Git Bash for repo commands unless a task explicitly requires another shell.

```bash
cd /d/AIStuff/ChubProfile/app/profile
node build-profile-blob.js
node editor-server.js
```

PowerShell wrapper:

```powershell
& 'C:\Program Files\Git\bin\bash.exe' -lc 'cd /d/AIStuff/ChubProfile/app/profile && node build-profile-blob.js'
```

The editor runs at `http://127.0.0.1:4312`.

## Git History

This repo is tracked on a private remote. After completing any code, profile, CSS, copy, generated artifact, or documentation contribution, commit and push to the current branch before final handoff unless the user explicitly asks not to.

Keep commits focused on the completed contribution. Do not include temporary screenshots, local browser artifacts, server logs, or unrelated workspace changes.

## Browser Checks

Use Chrome DevTools MCP and Playwright together against the same live or preview URL for high-risk visual, sanitizer, live-profile, or deployment checks. The usual shared Chrome endpoint is `http://127.0.0.1:9222` with stable Chrome at `C:/Program Files/Google/Chrome/Application/chrome.exe` and profile `C:/Users/TheLonelyDevil/AppData/Local/Codex/Chrome-Verification`.

For low-risk local edits, start with rebuild/static checks and escalate to the paired browser path when rendered Chub behavior matters. If a required browser tool cannot connect, report the exact failure and any fallback coverage.

## Chub Gotchas

- Inline `<style>` survives when nested inside the bio root `<div>`.
- Chub injects `<spacer>` elements into bio markup.
- Chub can strip or reshape list wrappers, leaving `<li>` elements directly under a section.
- Some visible labels may come from CSS pseudo-elements, so text-only checks can miss or falsely fail live changes.
- Styles in the bio can affect the whole Chub page.
- Keep custom classes prefixed with `ld-`.
- Avoid broad `.ant-row`, `.ant-col`, or `.ant-card` overrides unless there is no narrower live-page-safe option.

## Standing Layout Notes

- Black/orange Firefly profile aesthetic.
- Hero focus list sits under `Currently Focusing On`.
- `_7 FFSquish.gif` and `_5 Ending GIF.gif` stay paired on the right side of the hero.
- `_6 Wa Arararagi dance.gif` stays inside the Cardmaking Philosophy panel.
- The floating buttons should remain available: profile jump and cards jump.
- `...Who?` opens the YouTube link in a new tab.

## Live Vetting

For visual tuning, patch the live `https://chub.ai/users/The_Lonely_Devil` DOM first with DevTools/Playwright, let the user judge the actual Chub shell, then mirror the approved values into source CSS/content and rebuild.

When checking live output, inspect all three when relevant:

- `innerHTML` for sanitizer reshaping.
- `textContent` for real text nodes.
- `getComputedStyle(..., "::before"/"::after").content` for CSS-generated labels.

## Deploy

Canonical live deploy uses the gateway helper, not manual About Me paste by default:

```bash
cd /d/AIStuff/ChubProfile/app/profile
node build-profile-blob.js
node push-profile.js --check
node push-profile.js --push
```

Use `node push-profile.js --dry-run` for planning without writing. A pre-push `--check` is read-only and may report `DIFFER`/exit nonzero when a real change is pending; use it to confirm the local artifact does not already match live before pushing. You can run `--check` again after `--push` when you want a separate read-only verification.

The script uploads the generated artifact:

```text
app/profile/paste-blob.html
```

through `POST https://gateway.chub.ai/user/update`, preserving the existing `name`, `profile`, `email`, and `preferred_language` account fields while updating only `about_me`. Token source is `CHUB_TOKEN` first, then `D:/AIStuff/Cardmaking/Tools/chub-token.txt`; never print token values in logs, commits, or chat.

Manual About Me paste is emergency fallback only if the gateway helper is unavailable or Chub rejects the scripted route. If that fallback is used, paste the full contents of `paste-blob.html`, preserve account fields in the editor, verify the live page, and record why the fallback was necessary. See `docs/CHUB-PROFILE-QUIRKS.md` for the route, payload fields, and live verification checklist.
