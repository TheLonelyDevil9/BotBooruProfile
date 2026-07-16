// Mockup preview harness: wraps each mockup blob in a richer fake of the
// BotBooru profile page (nav strip, banner, avatar, identity pills, meta
// chips, followers, stats row, fake card grid) so a variant can be judged
// holistically before any live paste. Extends the idea of ../build-preview.js;
// does not replace it. Base CSS here deliberately avoids !important so the
// blob's own rules win, mirroring how the blob beats BotBooru's utilities.
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const here = __dirname;
const BUDGET = 32768;

const AVATAR = "https://botbooru.com/avatars/a6e3a4f3e20047ee83c6e8e2a0af1014.gif";

const baseCss = `
html, body { margin: 0; }
body { background: #121212; color: #d6d3d1; font-family: system-ui, "Segoe UI", sans-serif; }
.bb-nav { display: flex; align-items: center; gap: 18px; padding: 10px 18px; background: #1c1210; font-size: 13px; color: #a8a29e; }
.bb-nav .bb-logo { font-weight: 800; font-size: 17px; color: #f5f5f4; }
.bb-nav .bb-logo b { color: #ef4444; }
.bb-nav .bb-right { margin-left: auto; display: flex; gap: 8px; }
.bb-nav .bb-tag { padding: 3px 8px; border-radius: 4px; background: #7f1d1d; color: #fecaca; font-size: 11px; font-weight: 700; }
.bb-main { width: min(100% - 24px, 966px); margin-inline: auto; padding-top: 14px; }
#profile-banner { height: 300px; border-radius: 12px; background: #292524; }
.profile-avatar-wrap { width: 104px; height: 104px; border-radius: 50%; flex: 0 0 auto; }
.profile-avatar-wrap img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }
.profile-identity-row { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 14px; padding: 14px 4px; }
.profile-identity-info-text h1 { margin: 0 0 6px; font-size: 26px; color: #fafaf9; }
.profile-identity-info-text .bb-pill-row { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
.bb-pill-row span { display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 999px; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; line-height: 1; }
.bb-pill-row .rank-donator-pill { background: #493511; color: #fde68a; }
.bb-pill-row .bb-emerald { background: rgba(6,78,59,0.8); color: #d1fae5; }
.bb-pill-row .bb-sky { background: rgba(12,74,110,0.8); color: #e0f2fe; }
.profile-meta-strip { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
.profile-meta-chip { display: inline-flex; align-items: center; padding: 6px 12px; border-radius: 999px; background: #292524; font-size: 12px; font-weight: 600; }
.profile-followers-following { font-size: 13px; color: #a8a29e; padding-top: 6px; }
.profile-followers-following b { color: #fafaf9; }
.profile-stats-sort-row { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; padding: 10px 4px; }
.profile-stat-pill { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 999px; background: #292524; font-size: 13px; font-weight: 700; }
.bb-sort { margin-left: auto; font-size: 12px; color: #78716c; }
.bb-cards { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; padding: 12px 4px 80px; }
.bb-card { aspect-ratio: 2 / 3; border-radius: 8px; background: linear-gradient(180deg, #1f2430, #171b24); border: 1px solid #2b3040; position: relative; }
.bb-card::after { content: ""; position: absolute; left: 8px; right: 8px; bottom: 8px; height: 12px; border-radius: 3px; background: #2b3040; }
@media (max-width: 700px) { .bb-cards { grid-template-columns: repeat(2, 1fr); } #profile-banner { height: 180px; } }
`;

function page(blob, title) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>${baseCss}</style>
</head>
<body>
<div class="bb-nav"><span class="bb-logo"><b>&#10084;</b> BotBooru</span><span>Posts</span><span>Lorebooks</span><span>Community</span><span>Tags</span><div class="bb-right"><span class="bb-tag">NSFW: ON</span></div></div>
<main class="bb-main">
<div id="profile-banner"></div>
<div class="profile-identity-row">
<div class="profile-avatar-wrap"><img src="${AVATAR}" alt="avatar"></div>
<div class="profile-identity-info-text">
<h1>The_Lonely_Devil</h1>
<div class="bb-pill-row flex flex-wrap items-center gap-1.5">
<span class="inline-flex items-center rounded-full uppercase rank-donator-pill">&lt;3 Donator</span>
<span class="inline-flex items-center rounded-full uppercase bb-emerald bg-emerald-900/80">OC creator</span>
<span class="inline-flex items-center rounded-full uppercase bb-sky bg-sky-900/80">Verified creator</span>
</div>
<div class="profile-meta-strip">
<span class="profile-meta-chip">&#9670; Diamond 932%</span>
<span class="profile-meta-chip">Joined May 30, 2026</span>
</div>
</div>
<div class="profile-followers-following"><b>203</b> Followers &nbsp; <b>6</b> Following</div>
<div class="profile-identity-right-stack">
<div id="custom-profile-root">
${blob}
</div>
</div>
</div>
<div class="profile-stats-sort-row">
<span id="profile-stats" class="profile-stat-pill is-active">102 Cards</span>
<span class="profile-stat-pill">1 Favorites</span>
<span class="profile-stat-pill">22 Comments</span>
<span class="bb-sort">SORT: Latest &middot; Downloads &middot; Favs &middot; Tagme</span>
</div>
<div class="bb-cards">${'<div class="bb-card"></div>'.repeat(10)}</div>
</main>
</body>
</html>
`;
}

const variants = process.argv.slice(2);
const files = variants.length
  ? variants
  : fs.readdirSync(here).filter((f) => /^[a-z]-.*\.html$/.test(f) && !f.startsWith("preview-"));

if (!files.length) {
  console.error("no mockup variant files found (expected e.g. a-ember-poster.html)");
  process.exit(1);
}

let failed = false;
for (const f of files) {
  const src = path.join(here, f);
  const blob = fs.readFileSync(src, "utf8");
  const bytes = Buffer.byteLength(blob);
  const out = path.join(here, `preview-${f}`);
  fs.writeFileSync(out, page(blob, `Mockup preview: ${f}`));
  const status = bytes > BUDGET ? "OVER BUDGET" : "ok";
  console.log(`${f}: ${bytes} bytes (budget ${BUDGET}, ${BUDGET - bytes} free) ${status} -> ${path.basename(out)}`);
  if (bytes > BUDGET) failed = true;
}
if (failed) process.exit(1);
