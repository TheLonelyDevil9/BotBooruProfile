# ChubProfile

Single-purpose project for maintaining the custom Chub creator profile at:

`https://chub.ai/users/The_Lonely_Devil`

The active generated artifact is `app/profile/paste-blob.html`: one Chub About Me blob with the profile HTML and CSS bundled together. The canonical live deploy uploads that artifact through the Chub gateway helper.

## Active Files

- `app/profile/profile-content.json` - editable profile copy, links, and image URLs
- `app/profile/deploy.css` - profile CSS
- `app/profile/profile-template.js` - turns the JSON into deployable bio HTML
- `app/profile/card-preview-css.js` - builds full-art card hover mappings from gateway-pulled `D:\AIStuff\Cardmaking\Published` JSON, using `Published/project-ids.json` as the roster
- `app/profile/blob-generator.js` - bundles CSS + bio HTML into one generated deploy blob
- `app/profile/paste-blob.html` - generated Chub About Me blob
- `app/profile/push-profile.js` - gateway deploy helper for uploading the generated blob to `about_me`
- `app/profile/editor.html` and `app/profile/editor-server.js` - local editor
- `docs/CHUB-PROFILE-QUIRKS.md` - live Chub limitations, sanitizer notes, CSS cascade traps, preview geometry, and verification checklist

Generated files:

- `app/profile/deploy-bio.html`
- `app/profile/paste-blob.html`

## Use

Local editor:

```powershell
cd D:\AIStuff\ChubProfile\app\profile
node editor-server.js
```

Open:

```text
http://127.0.0.1:4312
```

CLI rebuild:

```bash
cd /d/AIStuff/ChubProfile/app/profile
node build-profile-blob.js
```

Canonical gateway deploy:

```bash
cd /d/AIStuff/ChubProfile/app/profile
node build-profile-blob.js
node push-profile.js --check
node push-profile.js --push
```

Use `node push-profile.js --dry-run` to inspect the planned update without writing. A pre-push `--check` is read-only and may report a difference when a change is pending; after `--push`, rerun `--check` if you want a separate read-only confirmation. The helper reads auth from `CHUB_TOKEN` first, then `D:/AIStuff/Cardmaking/Tools/chub-token.txt`, and uploads the generated `paste-blob.html` to Chub's `about_me` through the gateway while preserving the existing account fields. Manual About Me paste is emergency fallback only. A local rebuild alone does not update Chub, so verify `https://chub.ai/users/The_Lonely_Devil` live after the gateway push.

## Chub Notes

- Chub preserves the inline `<style>` when it is inside the bio root `<div>`.
- Chub injects `<spacer>` elements into bio markup, so `deploy.css` suppresses them.
- Keep custom classes prefixed with `ld-`.
- Avoid broad Ant Design selectors unless the live page requires them.
- Desktop card hover previews use each card's live `data.avatar` URL from the gateway-pulled Published JSON, keyed by `Published/project-ids.json`.
- Keep profile/sidebar/floating layers below Chub's own header overlays. The final `deploy.css` layer intentionally uses a small z-index ladder instead of max-int values so the top-right account dropdown and search overlays remain clickable.
- Chub/Ant can still calculate popup portals offscreen when the live page reports a viewport-sized `documentElement.scrollHeight` but a much taller `body.scrollHeight`. The final CSS includes fixed-position fallbacks for the top-right account menu and header search select dropdowns so visible popups stay onscreen.
- Desktop card hover previews are intentionally large inspection panels, currently capped around `1760px` by `940px` while still leaving top clearance for Chub's header.
- Chub inserts `<spacer>` elements into the deployed bio markup. Spacer-safe layout selectors should target real classes and element types, for example `section.ld-panel--compact:first-of-type` and sibling `.ld-profile-column` selectors, rather than relying on raw `:nth-child()` positions.
- Keep `docs/CHUB-PROFILE-QUIRKS.md` current when live Chub behavior forces a workaround.
- For visual tuning, patch the live Chub DOM first with Chrome DevTools MCP and Playwright, let the user judge the actual shell, then mirror the approved values into source and deploy.
