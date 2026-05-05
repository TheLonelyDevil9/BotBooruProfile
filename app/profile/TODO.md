# Creator Profile TODO

## Active Checks

- Rebuild `paste-blob.html` after every content or CSS change.
- Verify the latest paste on the live Chub profile after deployment.
- Watch for mobile overflow in the hero action buttons and floating nav.
- Keep generated files out of manual editing.

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
