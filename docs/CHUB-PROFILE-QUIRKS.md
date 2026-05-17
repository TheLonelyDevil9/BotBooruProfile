# Chub Profile Quirks And Limits

This document is the scratchpad for every hard-earned limitation in this profile project. Update it whenever a live Chub behavior, browser zoom issue, sanitizer behavior, or generation problem is discovered.

## Deploy Model

- The only artifact the user actually pastes into Chub is `app/profile/paste-blob.html`.
- `app/profile/deploy-bio.html` is generated for debugging and local inspection. It is not the intended paste target.
- Do not hand-edit generated files. Change `app/profile/profile-content.json`, `app/profile/profile-template.js`, or `app/profile/deploy.css`, then rebuild with `node build-profile-blob.js` from `app/profile`.
- A correct local blob does not mean the live Chub profile is current. The generated `paste-blob.html` must be saved back into Chub's About Me field before live verification can pass.
- Chub's custom CSS upload path has been unreliable for this profile. The working path is an inline `<style>` inserted inside the root `<div class="ld-bio">`.
- The builder injects the CSS into the first root `<div>` through `app/profile/blob-generator.js`.
- The preferred visual-tuning loop is:
  1. Patch the live Chub DOM with Chrome DevTools MCP and Playwright.
  2. Let the user judge the real Chub shell.
  3. Mirror approved values into source files.
  4. Rebuild `paste-blob.html`.
  5. Persist the blob into Chub.
  6. Verify the live page again.

## Live Chub Save Route

The Chub profile editor saves through the gateway, not through this repo.

- Account read:
  `GET https://gateway.chub.ai/api/account?nocache=<timestamp>&tokens=false`
- Profile save:
  `POST https://gateway.chub.ai/user/update`
- Auth headers used by Chub:
  - `CH-API-KEY`
  - `samwise`
- Local token source pattern:
  `D:/AIStuff/Cardmaking/Tools/chub-token.txt`

Never print, paste, commit, or summarize token values. It is acceptable to document header names and file paths.

When saving through the gateway route, preserve the existing account fields and change only the generated bio payload:

- `about_me`: full contents of `app/profile/paste-blob.html`
- `name`: existing account name
- `profile`: existing account profile, or `""` if absent
- `email`: existing account email
- `preferred_language`: existing account language, defaulting to `en-us` only when absent

After a save, reload `https://chub.ai/users/The_Lonely_Devil` and inspect the live DOM. Do not trust the local preview or the generated file as proof of deployment.

## Local Tooling

- Use Git Bash for repo commands unless a task explicitly requires another shell:
  `& 'C:\Program Files\Git\bin\bash.exe' -lc 'cd /d/AIStuff/ChubProfile && <cmd>'`
- The Windows path for the repo is `D:\AIStuff\ChubProfile`.
- The Git Bash path for the repo is `/d/AIStuff/ChubProfile`.
- `D:\AIStuff\Cardmaking\Published` is available from Git Bash as `/d/AIStuff/Cardmaking/Published`.
- Older WSL notes are historical fallback guidance. If a task uses WSL, state why in the handoff.

## CSS Generation

- `app/profile/blob-generator.js` minifies CSS before creating the paste blob.
- The minifier must preserve spaces before pseudo selectors. Removing spaces around `:` broke selectors such as `[role="tabpanel"] .ant-list-items:has(...)` by turning descendant selectors into invalid or different selectors.
- Current minifier rule intentionally does not include `:`:
  `.replace(/\s*([{};,>~])\s*/g, '$1')`
- If this changes, verify generated `paste-blob.html` still contains spaces before `:has()` and `:is()` when a descendant selector needs them.

## Chub DOM And Sanitizer

- Chub injects `<spacer>` elements into bio markup. `deploy.css` hides them.
- Chub can strip or reshape list wrappers. A `<ul class="ld-list">` in the generated blob may become direct `<li>` children under the section in the live DOM.
- The disclaimer spacing fix therefore needs both shapes:
  - `html body .ld-bio .ld-panel--disclaimers ul.ld-list > li:last-of-type`
  - `html body .ld-bio .ld-panel--disclaimers > li:last-of-type`
- Chub page text checks can false-negative. Some visible labels come from CSS pseudo-elements, and sanitizer changes can move text into a different DOM shape.
- When verifying live copy or labels, inspect `.innerHTML`, `.textContent`, and computed pseudo-element content through `getComputedStyle(element, "::before" / "::after").content`.
- Profile CSS can affect Chub's surrounding page, not only the bio. Keep selectors narrow and scoped where possible.
- Custom profile classes use the `ld-` prefix.
- Broad Ant Design selectors are risky. Prefer Chub-facing selectors scoped under `.ant-col-lg-18 [role="tabpanel"]` when touching the card browser.
- Chub-injected `<spacer>` elements count for raw child-position selectors even when hidden. Avoid important layout fixes that depend on `.ld-profile-column:nth-child(2)` or `.ld-hero-info-grid > .ld-panel:first-child` unless there is a later spacer-safe override. Prefer real element/class relationships such as `section.ld-panel--compact:first-of-type` or `.ld-profile-column ~ .ld-profile-column`.
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

## Latest Live Chrome Fixes

These were verified live on 2026-05-10 and should remain at the end of `deploy.css` unless the page is reworked.

- Pure black follower/follow pill and Follow button require high-specificity page-chrome overrides:
  - `html body .ant-col-lg-6 > .text-sm`
  - `html body .ant-col-lg-6 > .text-sm .ant-btn`
  - `html body .ant-col-lg-6 > button.ant-btn.ant-btn-default.ant-btn-color-default.ant-btn-variant-outlined`
- The pure black fix must set all of:
  - `background: rgb(0 0 0) !important`
  - `background-color: rgb(0 0 0) !important`
  - `background-image: none !important`
- The final disclaimer spacing fix must account for Chub's list sanitizer:
  - `html body .ld-bio .ld-panel--disclaimers ul.ld-list > li:last-of-type`
  - `html body .ld-bio .ld-panel--disclaimers > li:last-of-type`
- Live verification target for the feet-line spacing was `margin-top: 28px` at the inspected desktop viewport.
- The hover hint text is expected to be orange. If text search misses it, check pseudo-element content before assuming the change failed.
- The profile's floating jump bar should sit above profile/card content, but Chub's own header, dropdowns, search overlays, and mobile bottom controls must still win the interaction layer. Older recovered blocks may still contain max-int values such as `2147483000` and `2147483647`; the current final block must supersede them with a lower z-index ladder so profile layers do not compete with Chub chrome.

## Current Chrome Layer Contract

The final source block is named:
`Final Chub chrome interaction fix: keep the profile art/card layers below Chub's header overlays, and give desktop card previews more inspection room.`

Keep it after older chrome/card-browser blocks in `deploy.css`. It is intentionally not max-int based:

- Main profile/bio area: `z-index: 1`.
- Sidebar column: `z-index: 40`.
- Follower/follow controls: `z-index: 42` and `43`.
- Floating profile/cards jump bar: `z-index: 80`; individual links: `81`.
- Enlarged card preview: `z-index: 920`.
- Chub header/banner: `z-index: 1200`.
- Visible Chub dropdown, select dropdown, popover, submenu, and tooltip portal surfaces: `z-index: 2147483647`.

The goal is to keep profile content visually layered while restoring Chub's top-right account dropdown and search dropdown interaction. If either dropdown opens but cannot be clicked, inspect `elementFromPoint`, computed `z-index`, and `pointer-events` at the menu item coordinates before raising any profile layer.

## Current Ant Portal Placement Contract

Live inspection on 2026-05-14 showed that the Chub shell can report `document.documentElement.scrollHeight` as roughly the viewport height while `document.body.scrollHeight` remains the full long profile height. Ant Design popup placement then used offscreen inline geometry:

- Account dropdown: `.ant-dropdown-placement-bottomRight` existed, but had inline `inset: -9090px 16px auto auto` and rendered offscreen until a final fixed-position fallback was injected after the profile style.
- Header search dropdown: `.ant-select-dropdown-placement-bottomLeft` could keep inline `left: -19200px` / negative inset values. A generic `top` fix was not enough; the source fallback must also set `left`, `right`, and `inset`.
- Chub's header search currently exposes `rc_select_2` and `rc_select_3` controls. The source fallback targets visible dropdowns containing those IDs and pins them at `top: 60px`, `left: 74px`, `width: min(768px, calc(100vw - 96px))`.
- The account menu fallback pins visible bottom-right dropdowns at `top: 62px`, `right: 16px`, and `max-height: min(620px, calc(100vh - 78px))`. It is scoped to current account-menu links such as `/profile`, `/create_character`, `/create_lorebook`, `/my_characters`, and `/my_chats` so ordinary card/context dropdowns are not forced into the avatar menu position.

The live-proven test injected the fallback after the pasted profile style. In source, keep the final fallback after older recovered max-int blocks so it wins the cascade.

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
- If the user wants to see the real result, publish the rebuilt blob to Chub before asking them to judge it.
- Check `paste-blob.html` for valid `:has()` selectors with required descendant spaces.
- On the live page, confirm requested copy through `.textContent` and `.innerHTML`.
- On the live page, confirm generated labels or hover helper text through pseudo-element computed styles where relevant.
- On the live page, confirm follower/follow pill and Follow button backgrounds are `rgb(0, 0, 0)` when the design calls for pure black.
- On the live page, confirm disclaimer spacing in computed styles, not just source CSS. The sanitizer can change the selector path.
- Check normal card counts at browser zoom 100% and 120%.
- Check hover previews near left, middle, and right columns.
- Check that hover previews stay below the Chub header.
- Check that full-art preview sides are not blurry.
- Check that the preview does not block mouse travel to nearby cards.
- Check that normal-card tags have clean borders and are not shaved by the tag rail.
- Check that generated `--ld-card-full-art` rules exist for the expected card count.
- Check that the account menu appears onscreen near the top-right and that `elementFromPoint` over the first menu item hits the menu link, not the profile body.
- Check that the header search dropdown appears onscreen near `left:74px/top:60px` and that the visible options are clickable.
- Use Chrome DevTools MCP and Playwright together against the same live or preview URL for live visual/sanitizer/deployment checks. If a required browser tool cannot connect to the shared Chrome endpoint, report the exact blocker and any fallback coverage.

## Known Failure Signatures

- **Local preview is fixed but Chub is unchanged**: the rebuilt blob was not saved back into Chub. Persist `paste-blob.html` through the Chub editor or gateway route, then reload the live profile.
- **Live copy appears unfixed but source is correct**: Chub may still be serving the previous About Me blob, or the check is reading the wrong DOM surface. Verify account save status, then inspect `.innerHTML`, `.textContent`, and pseudo-element content.
- **Pure black pill is still tinted**: a Chub/Ant Design background or gradient is winning. Re-check the final high-specificity `html body .ant-col-lg-6` overrides and make sure `background-image:none` is included.
- **Disclaimer spacing works locally but not live**: Chub may have stripped the `<ul>` wrapper. Keep both `ul.ld-list > li:last-of-type` and direct-section `> li:last-of-type` selectors.
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
- **Account dropdown exists but is invisible**: inspect `.ant-dropdown-placement-bottomRight` for negative inline `inset` or `top` values such as `-9090px`. The final fixed-position fallback must be after the pasted profile style, scoped to the account menu links, and should compute to `position: fixed`, `top: 62px`, `right: 16px`.
- **Search dropdown focus works but options are offscreen**: inspect `.ant-select-dropdown-placement-bottomLeft` for `left: -19200px` or a negative inset. The final search fallback must set `position: fixed`, `top: 60px`, `left: 74px`, `right: auto`, and `inset: 60px auto auto 74px`.
- **Hero request card or profile columns look offset after save**: Chub's hidden `<spacer>` nodes likely shifted an old `:nth-child()` selector. Add a final spacer-safe override using real classes or sibling selectors instead of child index assumptions.

## Static Checks

Run these after rebuilding:

```bash
cd /d/AIStuff/ChubProfile
rg -n 'role="tabpanel"\]:(is|has)' app/profile/paste-blob.html
rg -n 'Card browser preview hard stop v3|Card browser enhancement|Card browser approach lanes|Final Chub chrome interaction fix|Final Chub portal and spacer-safe alignment fix|Final open-popup top layer|position: fixed|pointer-events: none|font-variant-numeric: tabular-nums|z-index: 2147483647|1760px|940px|rc_select_2|rc_select_3|62px 16px auto auto|60px auto auto 74px' app/profile/deploy.css app/profile/paste-blob.html
rg -n 'cursor: zoom|background-size: auto 132%|background-size: auto 168%|transition: background-size' app/profile/deploy.css app/profile/paste-blob.html
rg -n 'post-school-Fly' app/profile/profile-content.json app/profile/deploy-bio.html app/profile/paste-blob.html
rg -n 'Why, yes, I like feet\\.\\.\\. How could you tell\\?|Wow, I just needed some motivation|Geechan.s Universal Roleplay Prompt|Opus 4\\.7/4\\.6 Max|Hover over any card' app/profile/profile-content.json app/profile/paste-blob.html
rg -n 'html body \\.ld-bio \\.ld-panel--disclaimers|html body \\.ant-col-lg-6 > \\.text-sm|background-image: none' app/profile/deploy.css app/profile/paste-blob.html
```

Expected:

- The first command should produce no matches.
- The second command should find the final hard-stop, enhancement, approach-lane, Chub chrome/preview, and portal/alignment blocks.
- The third command should produce no matches; CSS-only art hover zoom is intentionally removed.
- The fourth command should produce no matches; the intended label is `Post-school-Fly`.
- The fifth command should find the approved live copy.
- The sixth command should find the final disclaimer-spacing and pure-black page-chrome overrides.

## Card-Map Count Nuance

- `node build-profile-blob.js` prints the generated hover preview count. That count is based only on generated per-card rules.
- A raw search for `--ld-card-full-art` in `paste-blob.html` can be higher because base CSS also references the variable in pseudo-elements.
- Treat the build output line, for example `card hover previews: 76 cards`, as the authoritative count.

## Current Hard-Stop Card Rules

- The older final card-browser block is named:
  `Card browser hard stop: viewport-safe previews and 120% zoom count pills. Keep this last.`
- The current final override is named:
  `Card browser preview hard stop v3: keep popouts screen-pinned and inside the viewport.`
- The current zoom/enlargement layer is named:
  `Card browser enhancement: larger popout without inner art zoom. Keep this after the hard stop.`
- The current approach-lane layer is named:
  `Card browser approach lanes: compact normal cards, mouse-passable popouts, and uncut tags. Keep after preview enhancement.`
- The current block must remain after all older card-browser blocks in `deploy.css`.
- It forces normal cards to a stable desktop height.
- It raises desktop grid minima to reduce cramped columns at 120% zoom, currently `500px` and `540px` for `max-width:1500px`.
- It gives normal stat pills non-shrinking width and tabular numbers.
- It turns hover previews into fixed, screen-pinned panels with top/header clearance and explicit side/bottom insets.
- The latest final chrome/preview layer increases the popout to roughly `1760px` by `940px`, constrained to the current viewport.
- The latest final chrome/preview layer shifts preview layout toward the art, currently `68% / 32%` on wide desktop.
- The enhancement layer does not add inner art zoom. It preserves one contained sharp full-art image.
- The approach-lane layer makes normal cards more compact, widens grid gaps, and makes the fixed hover panel pass pointer events through to the card grid.
- The approach-lane layer also restores enough vertical room for tag pills so their borders do not clip.
- It out-specifics the stale recovered `nth-child` column placement rules through a later selector that includes repeated `.cursor-pointer`, `:nth-child(n)`, and repeated `.char-card-class`.
- The hard-stop layer avoids `left:50%` and preview transforms because they are fragile when old column placement or transformed ancestors are present. The later enhancement layer reintroduces centered fixed geometry only after ancestor transform/contain traps are neutralized and the dimensions are viewport-clamped.
- It neutralizes transform/contain/filter/will-change on known card-list ancestors because those can trap fixed positioning.
- It disables the blurred side pseudo-element for preview art.
- It leaves generated `--ld-card-full-art` declarations after the block, which is safe because those rules only set a CSS variable per card.
- It keeps the enlarged preview below Chub header/dropdown layers so account/search chrome can still win clicks.
