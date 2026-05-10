# Profile Maintenance

This project only maintains the Chub creator profile for `The_Lonely_Devil`.

## Edit Flow

1. Edit content in `app/profile/profile-content.json`.
2. Edit styling in `app/profile/deploy.css`.
3. Rebuild from `app/profile`:

   ```bash
   cd /d/AIStuff/ChubProfile/app/profile
   node build-profile-blob.js
   ```

4. Vet visual changes on the real Chub page before treating them as done. Use Chrome DevTools MCP and Playwright together against `https://chub.ai/users/The_Lonely_Devil`.
5. Publish `app/profile/paste-blob.html` into Chub's About Me field and verify the live page again.

Local preview is useful for layout iteration, but it is not authoritative. Chub wraps the profile in Ant Design markup, injects sanitizer output, and applies its own cascade around the bio.

## Current Profile Shape

- Root: `.ld-bio`
- Top: profile card + Firefly hero
- Middle: two-column content grid
- Bottom: floating profile/cards jump buttons

## Styling Rules

- Keep new classes prefixed with `ld-`.
- Prefer narrow selectors over global Ant Design overrides.
- Keep the inline `<style>` nested inside the bio root.
- Suppress Chub-injected `<spacer>` elements with CSS.
- Record live Chub quirks and limitations in `docs/CHUB-PROFILE-QUIRKS.md`.

## Live Deployment Notes

- A rebuilt `paste-blob.html` can still leave the live profile stale until it is saved through Chub.
- If using Chub's gateway route, preserve the existing `name`, `profile`, `email`, and `preferred_language` account fields while updating `about_me`.
- Verify live copy and CSS after save. Chub can reshape lists, inject `<spacer>`, and expose some visual labels through CSS pseudo-elements rather than normal text nodes.
- For visual tuning, the preferred loop is live DOM patch, user judgment, source edit, rebuild, live deploy, live verification.

## Card Hover Previews

`app/profile/card-preview-css.js` reads gateway-pulled files from `D:\AIStuff\Cardmaking\Published`, using `Published/project-ids.json` as the roster. For each slug, it reads the matching `Published/<slug>.json` and uses the live `data.avatar` URL returned by the gateway pull:

```css
--ld-card-full-art: url("https://avatars.charhub.io/avatars/The_Lonely_Devil/<slug>/chara_card_v2.png")
```

The desktop hover rules in `deploy.css` use that image as the large preview art while preserving Chub's native title, chat count, tags, author/date, and visible stat ribbon.
