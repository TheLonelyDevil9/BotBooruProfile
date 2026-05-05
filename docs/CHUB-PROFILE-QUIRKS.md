# Chub Profile Quirks And Limits

This document is the scratchpad for every hard-earned limitation in this profile project. Update it whenever a live Chub behavior, browser zoom issue, sanitizer behavior, or generation problem is discovered.

## Deploy Model

- The only artifact the user actually pastes into Chub is `app/profile/paste-blob.html`.
- `app/profile/deploy-bio.html` is generated for debugging and local inspection. It is not the intended paste target.
- Do not hand-edit generated files. Change `app/profile/profile-content.json`, `app/profile/profile-template.js`, or `app/profile/deploy.css`, then rebuild with `node build-profile-blob.js` from `app/profile`.
- Chub's custom CSS upload path has been unreliable for this profile. The working path is an inline `<style>` inserted inside the root `<div class="ld-bio">`.
- The builder injects the CSS into the first root `<div>` through `app/profile/blob-generator.js`.

## Local Tooling

- Prefer WSL Debian for this repo:
  `wsl -d Debian-Dev --cd /mnt/d/AIStuff/ChubProfile --exec bash -lc '<cmd>'`
- The Windows path for the repo is `D:\AIStuff\ChubProfile`.
- The WSL path for the repo is `/mnt/d/AIStuff/ChubProfile`.
- `D:\AIStuff\Cardmaking\Published` is available from WSL as `/mnt/d/AIStuff/Cardmaking/Published`.
- `git` may not be installed inside the WSL distro. Use Windows-side Git only if needed, and remember this folder may not itself be a Git repo.

## CSS Generation

- `app/profile/blob-generator.js` minifies CSS before creating the paste blob.
- The minifier must preserve spaces before pseudo selectors. Removing spaces around `:` broke selectors such as `[role="tabpanel"] .ant-list-items:has(...)` by turning descendant selectors into invalid or different selectors.
- Current minifier rule intentionally does not include `:`:
  `.replace(/\s*([{};,>~])\s*/g, '$1')`
- If this changes, verify generated `paste-blob.html` still contains spaces before `:has()` and `:is()` when a descendant selector needs them.

## Chub DOM And Sanitizer

- Chub injects `<spacer>` elements into bio markup. `deploy.css` hides them.
- Profile CSS can affect Chub's surrounding page, not only the bio. Keep selectors narrow and scoped where possible.
- Custom profile classes use the `ld-` prefix.
- Broad Ant Design selectors are risky. Prefer Chub-facing selectors scoped under `.ant-col-lg-18 [role="tabpanel"]` when touching the card browser.
- Chub card markup is Ant Design based and can shift. The profile currently targets:
  - `.ant-col-lg-18 [role="tabpanel"]`
  - `.ant-list-items`
  - `#chara-list`
  - `.character-list-container`
  - `.ant-row`
  - `a.cursor-pointer[href*="/characters/"]`
  - `.char-card-class`
  - `.card-main-body`
  - `.stats .fake-ribbon`
- The card stat row lives inside the image side of the card in Chub's DOM. It is therefore easy to squash the count pills if the image column becomes too narrow.

## Current CSS Source Trap

- `app/profile/deploy.css` currently begins with a recovered/minified chunk of older CSS followed by readable appended patches.
- Because of that history, cascade order is extremely important. A final fix must live after the stale blocks or it can be silently undone.
- Stale rules seen in the recovered chunk include old hover anchoring, old preview nth-child placement, and `display:none` for normal card `.stats`.
- The safest pattern for urgent live fixes is an explicitly named final block at the end of `deploy.css`.
- Long-term cleanup should normalize `deploy.css` into readable source and remove the recovered minified chunk only after checking the full profile visually.

## Card Browser Grid

- Browser zoom at 120% reduces practical space enough that layouts that look fine at 100% can become cramped.
- The normal card grid must use fewer, wider columns at desktop zoom. The current final block raises desktop card minima and raises the <=1500px minimum further.
- The 120% zoom failure mode is not just text size. Browser zoom effectively lowers the CSS pixel width available to each card, and Chub's card stats live in the image column. Three count pills can therefore become wider than the visible image area even when the rest of the card still looks acceptable.
- The current hard-stop minimum is intentionally large: `500px` normally and `540px` up to `1500px` viewport width. This prefers fewer columns over clipped counts.
- A later approach-lane override can intentionally lower the minimum again when it also shrinks normal card height/image width and increases grid gaps. The live goal is not maximum density; it is leaving enough mouse path between cards so large previews do not feel like a hover minefield.
- Avoid assuming a fixed number of card columns. Chub tabs, side panels, zoom, and browser viewport all change the available width.
- `nth-child(3n)`, `nth-child(4n)`, and `nth-child(5n)` placement logic is fragile. It failed when the live column count differed from the assumed count.
- Old `nth-child(3n/4n/5n)` rules still exist in the recovered CSS chunk. They are more specific than a generic hover rule, so new hard-stop selectors must either remove that old chunk or deliberately out-specific it.

## Card Counts

- The favorites/download/token counts are Chub's `.stats .fake-ribbon` children.
- They need to remain visible in the non-preview state. If they disappear, search for `display:none` on `.stats`.
- At 120% zoom, the pills need `flex: 0 0 auto`, `width: max-content`, `min-width: max-content`, and `font-variant-numeric: tabular-nums`.
- Do not let a parent stat rail use `overflow:hidden` unless each pill has enough width. That is what creates clipped or fused-looking counts.
- The normal-state image column needs enough width for three count pills. If counts become cramped again, first raise the card grid minimum before shrinking the pills further.
- Clean count pills use:
  - 999px radius
  - subtle orange border
  - dark tinted background
  - no black rectangular rail behind the whole row
  - small fixed icon width
- Do not put the stat rail back inside an overflow-clipped strip. The parent `.stats` should be transparent, with only each `.fake-ribbon > div` painted as a pill.
- If the count numbers clip but icons remain visible, inspect child text spans too. Chub may wrap the number inside a nested element, so the hard-stop block also forces stat descendants to non-shrinking inline/flex behavior.

## Card Tags

- Normal-card tags are Ant Design `.ant-tag` elements inside Chub's `.custom-scroll` rail.
- Chub's stock rail and the recovered CSS both tend to use `overflow:hidden`, tight `line-height`, and very small tag heights. This can shave the tag border or text at the top and bottom even when the tag is not logically truncated.
- The final tag fix gives tags a real inline-flex box, at least `21px` height, slightly more vertical padding, and visible overflow on the tag rail. Keep this after older card-browser rules.
- Tags and creator metadata should stay in the bottom metadata group, not directly under the tagline. If the tags climb upward again, inspect the right card column flex layout and the `justify-content:flex-end` lower group.
- Do not solve tag clipping by making the tagline eat the bottom area. Long taglines are allowed to clamp in the normal card, while tags and creator name must remain clean and readable.

## Hover Preview

- Hover previews must not cover Chub's top header. Leave a fixed top clearance.
- Hover previews must not rely on the card's grid column or `nth-child` placement. That caused previews to open partly off-screen.
- Large previews can make it hard to move the mouse toward another card if the fixed preview captures pointer events. The preview card should use `pointer-events:none` in the hover state so the mouse can pass through to the underlying grid.
- The hover trigger remains the original card anchor. If the cursor leaves that anchor, the preview should disappear or hand off to the newly hovered card rather than trapping the cursor over the enlarged panel.
- `position: fixed` is only viewport-fixed when no ancestor creates a containing block. Transforms, filters, perspective, and some containment values on ancestors can make a fixed child behave like it is fixed to that ancestor instead of the browser viewport.
- Chub and Ant Design wrappers may change over time. For card-list ancestors, the hard-stop block neutralizes `transform`, `translate`, `rotate`, `scale`, `perspective`, `contain`, `filter`, and `will-change` to reduce fixed-position containing-block traps.
- The safer model is screen-pinned fixed geometry on `.char-card-class` during hover/focus:
  - set `top`, `right`, `bottom`, and `left`
  - use `width:auto` and `height:auto`
  - avoid centering with `left:50%` plus `transform`
- The previous viewport-centered model still failed live because stale column rules and/or containing-block behavior could shift the center origin.
- Once the containing-block trap was neutralized and live behavior was confirmed, a later enhancement can safely use centered fixed geometry again as long as it also clamps `max-width` and `max-height` to the viewport. That is why the current zoom enhancement uses `left:50%` plus `translateX(-50%)` only after the hard-stop transform/contain neutralization block.
- Use viewport clamping:
  - width: `min(<cap>, calc(100vw - side margins))`
  - height: `min(<cap>, calc(100vh - top clearance - bottom margin))`
  - dynamic viewport units through `100dvw` and `100dvh` when supported
- For the current edge-pinned model, the equivalent clamp is the inset itself:
  - `top: var(--ld-card-preview-top-safe)`
  - `right: var(--ld-card-preview-edge-safe)`
  - `bottom: var(--ld-card-preview-bottom-safe)`
  - `left: var(--ld-card-preview-edge-safe)`
- The hover full-art image comes from `--ld-card-full-art`.
- Disable blurred background pseudo-elements for the main art pane. The large preview should use one sharp contained image, not blurred side fill.
- If a preview appears offscreen again, inspect later rules that set:
  - `.char-card-class { left: ... }`
  - `.char-card-class { right: ... }`
  - `--ld-card-preview-x`
  - `transform: translate(...)`
  - any `nth-child(...):hover .char-card-class`
- If there is no later rule and the preview still uses the wrong viewport, inspect every ancestor between `.char-card-class` and `body` for computed `transform`, `filter`, `perspective`, `contain`, and `will-change`.
- CSS cannot portal a hovered card to `body`. If Chub adds an untouchable transformed ancestor above the profile area, a perfect viewport overlay may require JavaScript, but Chub may strip inline script, so that is a last resort and must be live-tested before relying on it.

## Preview Zoom

- Vencord-style image zoom uses JavaScript state for wheel zoom, cursor-centered pan, and per-image scale. Chub bio markup should not assume inline JavaScript survives sanitization.
- A CSS-only art-pane zoom was tested and removed. It made the already-large popout feel grabby and added another hover state inside the preview.
- The durable Chub-safe version is currently just a larger popout, a wider art column, and one sharp contained full-art image.
- CSS-only zoom cannot follow the cursor precisely. Without script, it is only an inspect affordance, not a full pan/zoom viewer.
- If true wheel/pan zoom becomes necessary, first verify live that Chub allows the required script. Without script, do not promise cursor-position zoom.

## Full-Art Card Image Mapping

- `app/profile/card-preview-css.js` reads gateway-pulled JSON from `D:\AIStuff\Cardmaking\Published`.
- `Published/project-ids.json` is treated as the roster.
- For each slug, the script reads `Published/<slug>.json`.
- It validates `data.extensions.chub.full_path` against `The_Lonely_Devil/<slug>`.
- It validates `project-ids.json` IDs against `data.extensions.chub.id` when both are present.
- It uses `data.avatar` as the image URL when available.
- The fallback URL is:
  `https://avatars.charhub.io/avatars/The_Lonely_Devil/<slug>/chara_card_v2.png`
- Rebuild output should include the card hover preview count, currently expected around `76 cards`.

## Profile Images And External Links

- Profile media links are generated with `target="_blank" rel="noopener noreferrer"`.
- If Chub still opens a profile image in the same tab after deployment, likely causes include sanitizer changes, SPA link interception, or an old paste still being live.
- Inline JavaScript click handlers may be stripped by Chub and should not be assumed reliable without live verification.

## Verification Checklist

- Rebuild from `app/profile` after every source edit.
- Check `paste-blob.html` for valid `:has()` selectors with required descendant spaces.
- Check normal card counts at browser zoom 100% and 120%.
- Check hover previews near left, middle, and right columns.
- Check that hover previews stay below the Chub header.
- Check that full-art preview sides are not blurry.
- Check that the preview does not block mouse travel to nearby cards.
- Check that normal-card tags have clean borders and are not shaved by the tag rail.
- Check that generated `--ld-card-full-art` rules exist for the expected card count.
- Use the Codex Browser plugin with the Node REPL `iab` backend first for browser checks. External Playwright/CDP is fallback-only for this project.

## Known Failure Signatures

- **Hover preview opens off the right side of the browser**: old `nth-child(...):hover .char-card-class` placement is winning, or the preview is still anchored to the card/grid instead of the viewport.
- **Hover preview is the right size but starts from the wrong origin**: a transformed/contained ancestor is trapping `position: fixed`, or a stale centering transform is still winning.
- **Hover preview covers the Chub header**: top clearance is too low, or a later rule reset `top: var(--ld-card-preview-top-safe)`.
- **Hover preview feels like a minefield**: the fixed preview is capturing pointer events, normal cards are too large/dense, or grid gutters are too small. Keep hover preview `pointer-events:none` and prefer compact normal cards with wider gaps.
- **Hover art has blurry side fill**: a `::before` blurred background pseudo-element is still active. The sharp pass disables that pseudo-element and uses one contained `::after` image.
- **Normal card stats vanish**: search for `.stats{display:none !important}` or a more specific normal-state `.stats` rule. There are stale copies in the old recovered CSS chunk, so the final block must override them.
- **Normal card stats look like one black strip**: the parent stat rail background/border is visible, or individual children are not styled as separate pills.
- **Normal stat numbers clip at 120% zoom**: the image column is too narrow or `.fake-ribbon` children can shrink. Raise grid/card minima before shrinking type.
- **Normal tags have shaved borders/text**: `.custom-scroll`, `.custom-scroll > .mt-2`, or `.ant-tag` are clipping with too-small line-height. Restore the final tag anti-clip rules.
- **Tags sit directly under the tagline**: the right card data column lost its bottom-aligned flex layout. The tags and creator line should live in the lower metadata group, visually aligned near the bottom of the normal card.
- **Profile images open in the same tab**: confirm the live pasted markup contains `target="_blank"`. If it does, Chub may be intercepting anchor clicks at the SPA layer.

## Static Checks

Run these after rebuilding:

```bash
cd /mnt/d/AIStuff/ChubProfile
rg -n 'role="tabpanel"\]:(is|has)' app/profile/paste-blob.html
rg -n 'Card browser hard stop v2|Card browser enhancement|Card browser approach lanes|position: fixed|pointer-events: none|font-variant-numeric: tabular-nums|--ld-card-preview-zoom-width' app/profile/deploy.css app/profile/paste-blob.html
rg -n 'cursor: zoom|background-size: auto 132%|background-size: auto 168%|transition: background-size' app/profile/deploy.css app/profile/paste-blob.html
rg -n 'post-school-Fly' app/profile/profile-content.json app/profile/deploy-bio.html app/profile/paste-blob.html
```

Expected:

- The first command should produce no matches.
- The second command should find the final hard-stop, enhancement, and approach-lane card blocks.
- The third command should produce no matches; CSS-only art hover zoom is intentionally removed.
- The fourth command should produce no matches; the intended label is `Post-school-Fly`.

## Card-Map Count Nuance

- `node build-profile-blob.js` prints the generated hover preview count. That count is based only on generated per-card rules.
- A raw search for `--ld-card-full-art` in `paste-blob.html` can be higher because base CSS also references the variable in pseudo-elements.
- Treat the build output line, for example `card hover previews: 76 cards`, as the authoritative count.

## Current Hard-Stop Card Rules

- The older final card-browser block is named:
  `Card browser hard stop: viewport-safe previews and 120% zoom count pills. Keep this last.`
- The current final override is named:
  `Card browser hard stop v2: screen-pinned previews and unsquashable 120% zoom count pills. Keep this last.`
- The current zoom/enlargement layer is named:
  `Card browser enhancement: larger popout without inner art zoom. Keep this after the hard stop.`
- The current approach-lane layer is named:
  `Card browser approach lanes: compact normal cards, mouse-passable popouts, and uncut tags. Keep after preview enhancement.`
- The current block must remain after all older card-browser blocks in `deploy.css`.
- It forces normal cards to a stable desktop height.
- It raises desktop grid minima to reduce cramped columns at 120% zoom, currently `500px` and `540px` for `max-width:1500px`.
- It gives normal stat pills non-shrinking width and tabular numbers.
- It turns hover previews into fixed, screen-pinned panels with top/header clearance and explicit side/bottom insets.
- The enhancement layer increases the popout to roughly `1760px` by `920px`, constrained to the current viewport.
- The enhancement layer shifts preview layout toward the art, currently `70% / 30%` on wide desktop.
- The enhancement layer does not add inner art zoom. It preserves one contained sharp full-art image.
- The approach-lane layer makes normal cards more compact, widens grid gaps, and makes the fixed hover panel pass pointer events through to the card grid.
- The approach-lane layer also restores enough vertical room for tag pills so their borders do not clip.
- It out-specifics the stale recovered `nth-child` column placement rules through a later selector that includes repeated `.cursor-pointer`, `:nth-child(n)`, and repeated `.char-card-class`.
- The hard-stop layer avoids `left:50%` and preview transforms because they are fragile when old column placement or transformed ancestors are present. The later enhancement layer reintroduces centered fixed geometry only after ancestor transform/contain traps are neutralized and the dimensions are viewport-clamped.
- It neutralizes transform/contain/filter/will-change on known card-list ancestors because those can trap fixed positioning.
- It disables the blurred side pseudo-element for preview art.
- It leaves generated `--ld-card-full-art` declarations after the block, which is safe because those rules only set a CSS variable per card.
