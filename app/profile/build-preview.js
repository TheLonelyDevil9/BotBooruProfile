// Wraps app/profile/bio.html in a minimal fake of BotBooru's profile page context
// so the blob can be verified in a plain file:// browser tab before pasting live.
// The harness mimics .profile-identity-row flex wrapping, the ~966px content width, and the
// 288px sidebar BotBooru docks at 1280px and wider, because the blob sizes its wallpaper to the
// area beside that sidebar; everything else comes from the blob's own CSS.
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const here = __dirname;
const bioPath = path.join(here, "bio.html");
const outPath = path.join(here, "preview.html");

const bio = fs.readFileSync(bioPath, "utf8");

const head = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>BotBooru bio preview harness</title>
<style>
html, body { margin: 0; }
*, ::before, ::after { box-sizing: border-box; }
.profile-identity-row { display: flex; flex-wrap: wrap; width: min(100% - 24px, 966px); margin-inline: auto; }
#sidebar { display: none; position: fixed; inset: 0 auto 0 0; width: 288px; z-index: 30; background: #17171a; }
@media (min-width: 1280px) {
  #sidebar { display: block; }
  #main-content { margin-left: 288px; }
}
</style>
</head>
<body>
<aside id="sidebar"></aside>
<div id="main-content">
<div class="profile-identity-row">
<div class="profile-identity-right-stack">
<div id="custom-profile-root">
`;

const foot = `</div>
</div>
</div>
<div class="profile-stats-sort-row" style="width: min(100% - 24px, 966px); margin: 0 auto; padding: 24px 0 480px; color: #888; font: 14px sans-serif;">
<span id="profile-stats">[cards/stats row stub]</span>
</div>
</div>
</body>
</html>
`;

fs.writeFileSync(outPath, head + bio + foot);

const bioBytes = Buffer.byteLength(bio);
const budget = 32768;
console.log(`bio.html: ${bioBytes} bytes (budget ${budget}, ${budget - bioBytes} free)`);
console.log(`wrote ${outPath}`);
if (bioBytes > budget) {
  console.error("ERROR: bio.html exceeds the BotBooru bio size budget");
  process.exit(1);
}
