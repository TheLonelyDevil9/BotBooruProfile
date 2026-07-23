# Profile Maintenance

This project only maintains the BotBooru creator profile for `The_Lonely_Devil` at `https://botbooru.com/profile/25826`.

## Edit Flow

1. Edit `app/profile/bio.html` directly (one blob: `<style>` + `<section class="ld-bb-a">`).
2. Rebuild the verification harness from `app/profile`:

   ```bash
   cd "/g/AI Stuff/BotBooruProfile/app/profile"
   node build-preview.js
   ```

   The builder fails if the blob exceeds the 32,768-byte (32KB) bio budget.

3. Open `preview.html` via `file://` and check 1280px, 900px, and 480px widths: bullet alignment, lead-in hierarchy, link styling, panel identity, single-column collapse at 860px.
4. Vet visual changes on the real BotBooru page before treating them as done. For tuning, patch the live DOM with Chrome DevTools MCP, let the user judge, then mirror approved values into `bio.html`.
5. Deploy by manual paste: the user copies the full `bio.html` contents into the logged-in BotBooru profile bio editor and saves. Verify the live page after the save.

The local preview is useful for layout iteration, but it is not authoritative. BotBooru wraps the blob in its own page chrome, Tailwind utilities, and flex layout around `#custom-profile-root`.

## Current Profile Shape

- Root: `section.ld-bb-a` inside `#custom-profile-root` (SAM HUD system, 2026-07-16)
- Page level: cover-fit fixed wallpaper (38% 40%), firefly banner with amber corner brackets, teal-ringed avatar with dashed amber outline, squared HUD identity pills and meta chips
- Left: command panel (nameplate "Cardmaking // Method", "Firefly!" headliner link, four-line hero, philosophy paragraphs, "Why do I do this?" note, equal-width CTA buttons + no-guarantees note, "Currently focusing on" readout)
- Right: "About // Heads Up" panel ("...Who?" linked heading; Heads Up in warn red)
- Below: permanently expanded "Links // Credits" panel, the Post-School-Fly tail figure, then a 100vh wallpaper-reveal frame before the cards/stats section

## Styling Rules

- Keep new classes prefixed with `ld-`.
- Keep `!important` on rules that must beat BotBooru's Tailwind utilities.
- Keep the whole payload in one `<style>` + one `<section>`; BotBooru accepts the blob as-is.
- Page-level selectors are part of the blob; re-verify them against the live DOM after site updates (BotBooru is in active beta).
- Record live BotBooru quirks and limitations in `docs/BOTBOORU-PROFILE-QUIRKS.md`.

## Live Deployment Notes

- There is no scripted write path; the manual paste in the profile editor is the deploy and the public-write gate.
- A rebuilt preview does not change the live profile. Verify `https://botbooru.com/profile/25826` after every paste.
- External assets load from GitHub Pages (thelonelydevil9.github.io/BotBooruProfile/assets/); fonts from Google Fonts. If either host has issues, the blob degrades to system fonts on the deep-brown base.
