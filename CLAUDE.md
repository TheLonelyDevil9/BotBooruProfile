# CLAUDE.md

Guidance for working in this repository.

## External North Stars

- Project philosophy: `D:\AIStuff\_MDs\_Harness engineering leveraging Codex in an agent-first world.md`
- Prompting guidance: `D:\AIStuff\_MDs\_Claude Prompting Guide.md`

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

Prefer WSL/Bash via the `Debian-Dev` distro for Codex and OpenCode work in this repo.

```bash
cd /mnt/d/AIStuff/ChubProfile/app/profile
node build-profile-blob.js
node editor-server.js
```

PowerShell fallback:

```powershell
wsl -d Debian-Dev --cd /mnt/d/AIStuff/ChubProfile/app/profile --exec bash -lc 'node build-profile-blob.js'
```

The editor runs at `http://127.0.0.1:4312`.

## Git History

This repo is tracked on a private remote. After completing any code, profile, CSS, copy, generated artifact, or documentation contribution, commit and push to the current branch before final handoff unless the user explicitly asks not to.

Keep commits focused on the completed contribution. Do not include temporary screenshots, local browser artifacts, server logs, or unrelated workspace changes.

## Browser Checks

Use the Codex Browser plugin through the Node REPL `iab` backend as the default browser surface for this project. External Playwright/CDP, including the old `127.0.0.1:9222` endpoint, is backup-only.

Preferred bootstrap:

```js
const { setupAtlasRuntime } = await import("C:/Users/TheLonelyDevil/.codex/plugins/cache/openai-bundled/browser-use/0.1.0-alpha1/scripts/browser-client.mjs");
await setupAtlasRuntime({ globals: globalThis, backend: "iab" });
await agent.browser.nameSession("🔎 Profile check");
globalThis.tab = await agent.browser.tabs.new();
```

If the tab handle goes stale, reacquire a fresh in-app tab before falling back to any external browser endpoint.

## Chub Gotchas

- Inline `<style>` survives when nested inside the bio root `<div>`.
- Chub injects `<spacer>` elements into bio markup.
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

## Deploy

Rebuild, then paste the contents of:

```text
app/profile/paste-blob.html
```

into Chub's About Me field.
