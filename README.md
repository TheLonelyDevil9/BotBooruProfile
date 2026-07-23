# BotBooruProfile

Single-purpose project for maintaining the custom BotBooru creator profile at:

`https://botbooru.com/profile/25826`

The active artifact is `app/profile/bio.html`: one BotBooru profile bio blob with the profile CSS and HTML bundled together (`<style>` + `<section class="ld-bb-a">`). BotBooru injects it as `#custom-profile-root` inside the profile page. Deployment is a manual paste into the logged-in profile bio editor; there is no scripted write path.

## Active Files

- `app/profile/bio.html` - the paste-ready bio blob (CSS + markup, hand-edited directly)
- `app/profile/build-preview.js` - wraps the blob in a fake page context and checks the size budget
- `app/profile/preview.html` - generated local verification harness
- `docs/BOTBOORU-PROFILE-QUIRKS.md` - live BotBooru behavior, size budget, selector contract, and verification checklist

Generated files:

- `app/profile/preview.html`

## Use

Rebuild the preview after any `bio.html` edit:

```bash
cd "/g/AI Stuff/BotBooruProfile/app/profile"
node build-preview.js
```

Open `app/profile/preview.html` via `file://` in a browser and check 1280px, 900px, and 480px widths. The builder also enforces the 22,500-byte bio budget.

Deploy:

1. Copy the full contents of `app/profile/bio.html`.
2. Paste into the BotBooru profile bio editor (logged in) and save. The save is the manual public-write gate.
3. Reload `https://botbooru.com/profile/25826` and verify the live page.

## BotBooru Notes

- The bio blob lands inside `#custom-profile-root` within `div.profile-identity-right-stack`; the blob's own CSS re-orders the page with `flex: 0 0 100%` and `order` so the bio spans full width above the stats row.
- All rules use `!important` to beat the site's Tailwind utility classes.
- Keep custom classes prefixed with `ld-`.
- Page-level restyles (body wallpaper, banner, avatar ring, identity pills, meta chips, stats row) live in the same `<style>` block as the bio panels; treat them as part of the blob.
- Visual identity: ember/amber `#FFBF00` panel borders, orange/teal duotone on deep brown, Sora display + Source Sans 3 body, GitHub Pages (thelonelydevil9.github.io/BotBooruProfile/assets/) wallpaper and firefly banner.
- For visual tuning, patch the live BotBooru DOM first with Chrome DevTools MCP, let the user judge the actual page, then mirror the approved values into `bio.html` and rebuild the preview.
