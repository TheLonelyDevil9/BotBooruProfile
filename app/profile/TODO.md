# Creator Profile TODO

## Active Checks

- Rebuild `paste-blob.html` after every content or CSS change; it is the generated deploy artifact uploaded by `push-profile.js`.
- Verify the latest gateway push on the live Chub profile after deployment.
- Watch for mobile overflow in the hero action buttons and floating nav.
- Keep generated files out of manual editing.
- Manual About Me paste is emergency fallback only if the gateway helper is unavailable or Chub rejects the scripted route.

## Workflow

```powershell
cd D:\AIStuff\ChubProfile\app\profile
node editor-server.js
```

Open:

```text
http://127.0.0.1:4312
```

CLI rebuild:

```powershell
node build-profile-blob.js
```

Canonical gateway deploy:

```bash
cd /d/AIStuff/ChubProfile/app/profile
node build-profile-blob.js
node push-profile.js --check
node push-profile.js --push
```

Use `node push-profile.js --dry-run` for planning. Token source is `CHUB_TOKEN` first, then `D:/AIStuff/Cardmaking/Tools/chub-token.txt`; never print token values. The gateway helper preserves existing account fields and updates only `about_me`.
