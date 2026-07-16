# Revamp Mockups (2026-07)

Three divergent revamp directions for the profile blob, each a deployable-shaped `<style>` + `<section class="ld-bb-a">` payload under the 32,768-byte budget. Content is carried over verbatim from `../bio.html`; only the visual system changes.

| Variant | File | Idea |
| --- | --- | --- |
| A | `a-ember-poster.html` | Amber-drenched poster slab hero, ink CTAs, borderless hairline sections |
| B | `b-sam-hud.html` | CHOSEN 2026-07-16. Firefly/SAM cockpit: corner-cut panels, nameplate tabs (plain labels with `//` separators, no in-universe naming), telemetry ticks, Chakra Petch display. Promoted to `../bio.html` with live-profile copy as source of truth |
| C | `c-gallery-wing.html` | Art-led: wallpaper promoted, hero type over exposed art band, glass caption panels |

## Preview

```bash
cd "/g/AI Stuff/BotBooruProfile/app/profile/mockups"
node harness.js            # regenerates preview-*.html + byte check
```

Open `index.html` for a side-by-side chooser, or any `preview-*.html` directly. The harness fakes BotBooru page chrome (nav, banner, avatar, identity pills, meta chips, stats row, card grid) around `#custom-profile-root` so page-level restyles can be judged; it is a mockup aid, not the deploy harness (`../build-preview.js` stays canonical for `bio.html`).

## Notes

- Variant blobs keep the page-integration contract: full-width `#custom-profile-root`, `display: contents` right-stack, re-ordered `.profile-stats-sort-row`, wallpaper-reveal gap (A/B keep it below the bio; C moves the art moment above the content and shrinks the bottom gap).
- Rank-pill overrides carry an extra `[class*="rounded-full"]` attribute so they out-rank the base pill rule; keep that if backgrounds are set in the base rule.
- Winner flow: copy the chosen variant over `../bio.html`, run `node ../build-preview.js`, verify at 1280/900/480, then paste live per `../../../docs/PROFILE.md`.
