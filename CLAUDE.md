# CLAUDE.md

Guidance for working in this repository.

## External North Stars

- Project philosophy skill: `C:\Users\TheLonelyDevil\.agents\skills\agent-harness-pointers\SKILL.md`
- Prompting guidance skill: `C:\Users\TheLonelyDevil\.agents\skills\llm-prompting-guide\SKILL.md`

Use these as durable operating context before making project-wide changes, workflow changes, prompt changes, or repo guidance changes. Keep repository guidance concise and discoverable, then link to deeper sources instead of turning this file into a long manual.

## What This Is

Custom Chub.ai creator profile for `The_Lonely_Devil`.

The project builds a single About Me paste blob:

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

Use Chrome DevTools MCP and Playwright together against the same live or preview URL. The usual shared Chrome endpoint is `http://127.0.0.1:9222` with stable Chrome at `C:/Program Files/Google/Chrome/Application/chrome.exe` and profile `C:/Users/TheLonelyDevil/AppData/Local/Codex/Chrome-Verification`.

If either browser MCP cannot connect to the shared Chrome endpoint, treat that as a verification blocker unless the user explicitly accepts a fallback. Report the exact failure.

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

Rebuild, then publish the contents of:

```text
app/profile/paste-blob.html
```

into Chub's About Me field. Do not stop at local rebuild when the user asks to patch the live profile.

If deploying through Chub's gateway route, preserve existing account fields while changing only `about_me`. Use the existing local token file pattern from `D:/AIStuff/Cardmaking/Tools/chub-token.txt`, but never print token values in logs, commits, or chat. See `docs/CHUB-PROFILE-QUIRKS.md` for the route, payload fields, and live verification checklist.
