# ChubProfile

Single-purpose project for maintaining the custom Chub creator profile at:

`https://chub.ai/users/The_Lonely_Devil`

The active output is one About Me paste blob with the profile HTML and CSS bundled together.

## Active Files

- `app/profile/profile-content.json` - editable profile copy, links, and image URLs
- `app/profile/deploy.css` - profile CSS
- `app/profile/profile-template.js` - turns the JSON into deployable bio HTML
- `app/profile/card-preview-css.js` - builds full-art card hover mappings from gateway-pulled `D:\AIStuff\Cardmaking\Published` JSON, using `Published/project-ids.json` as the roster
- `app/profile/blob-generator.js` - bundles CSS + bio HTML into one paste blob
- `app/profile/paste-blob.html` - generated Chub About Me blob
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

Paste or publish `app/profile/paste-blob.html` into Chub's About Me field, then verify `https://chub.ai/users/The_Lonely_Devil` live. A local rebuild alone does not update Chub.

## Chub Notes

- Chub preserves the inline `<style>` when it is inside the bio root `<div>`.
- Chub injects `<spacer>` elements into bio markup, so `deploy.css` suppresses them.
- Keep custom classes prefixed with `ld-`.
- Avoid broad Ant Design selectors unless the live page requires them.
- Desktop card hover previews use each card's live `data.avatar` URL from the gateway-pulled Published JSON, keyed by `Published/project-ids.json`.
- Keep `docs/CHUB-PROFILE-QUIRKS.md` current when live Chub behavior forces a workaround.
- For visual tuning, patch the live Chub DOM first with Chrome DevTools MCP and Playwright, let the user judge the actual shell, then mirror the approved values into source and deploy.
