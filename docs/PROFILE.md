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

4. Vet visual changes on the real Chub page before treating them as done. Use Chrome DevTools MCP and Playwright together against `https://chub.ai/users/The_Lonely_Devil` for live visual/sanitizer/deployment checks.
5. Deploy through the gateway helper from `app/profile`, then verify the live page again:

   ```bash
   cd /d/AIStuff/ChubProfile/app/profile
   node build-profile-blob.js
   node push-profile.js --check
   node push-profile.js --push
   ```

   Use `node push-profile.js --dry-run` for planning. A pre-push `--check` is read-only and can exit nonzero when it finds the expected pending difference; after `--push`, rerun `--check` if you want separate read-only confirmation.

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
- Keep Chub chrome overlays above profile layers. The final CSS should leave `.ld-bio`/main profile content low, keep the floating jump bar below the header, and only raise Chub dropdown/select/popover surfaces enough to win interaction.
- Use spacer-safe selectors for layout targeting. Chub-injected `<spacer>` nodes can break raw `:nth-child()` assumptions, so final alignment rules should target real section classes, `:first-of-type`, or sibling `.ld-profile-column` relationships.
- Record live Chub quirks and limitations in `docs/CHUB-PROFILE-QUIRKS.md`.

## Live Deployment Notes

- A rebuilt `paste-blob.html` can still leave the live profile stale until `push-profile.js` uploads it through Chub's gateway route.
- The gateway helper preserves the existing `name`, `profile`, `email`, and `preferred_language` account fields while updating only `about_me`.
- Token source is `CHUB_TOKEN` first, then `D:/AIStuff/Cardmaking/Tools/chub-token.txt`; never print or commit token values.
- Manual About Me paste is emergency fallback only if the gateway helper is unavailable or Chub rejects the scripted route.
- Verify live copy and CSS after save. Chub can reshape lists, inject `<spacer>`, and expose some visual labels through CSS pseudo-elements rather than normal text nodes.
- The account dropdown and header search dropdown rely on final fixed-position fallbacks because Ant Design may compute portal geometry from a broken live height model. Re-check both after every About Me save.
- For visual tuning, the preferred loop is live DOM patch, user judgment, source edit, rebuild, live deploy, live verification.

## Card Hover Previews

`app/profile/card-preview-css.js` reads gateway-pulled files from `D:\AIStuff\Cardmaking\Published`, using `Published/project-ids.json` as the roster. For each slug, it reads the matching `Published/<slug>.json` and uses the live `data.avatar` URL returned by the gateway pull:

```css
--ld-card-full-art: url("https://avatars.charhub.io/avatars/The_Lonely_Devil/<slug>/chara_card_v2.png")
```

The desktop hover rules in `deploy.css` use that image as the large preview art while preserving Chub's native title, chat count, tags, author/date, and visible stat ribbon.

Current desktop previews are screen-pinned, pointer-passable inspection panels. The final source layer caps them at `min(1760px, calc(100vw - 32px))` by `min(940px, calc(100vh - 88px))`, reserves header clearance, and uses a wider art/details split of `68% / 32%`.

## Current Header Popup Contract

The final `deploy.css` layer keeps Chub's own portal surfaces above the profile without returning to max-int profile z-index values:

- Account dropdowns matching `.ant-dropdown-placement-bottomRight` and containing current account menu links such as `/profile`, `/create_character`, `/create_lorebook`, `/my_characters`, or `/my_chats` are fixed at `top: 62px`, `right: 16px`, with a viewport-capped max height.
- Header search dropdowns for `rc_select_2` and `rc_select_3` are fixed at `top: 60px`, `left: 74px`, with width capped to the viewport.
- Visible dropdown/select/popover/submenu/tooltip portal surfaces use `z-index: 2147483647`; the header uses `1200`; card previews stay below at `920`.
- Header descendant `z-index` values are reset to `auto` so old max-int profile overrides do not leak into Chub's controls.
