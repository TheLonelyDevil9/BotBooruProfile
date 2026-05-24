# Project Structure

This repo is intentionally scoped to the Chub creator profile only.

```text
ChubProfile/
├── AGENTS.md
├── CLAUDE.md
├── PROJECT-STRUCTURE.md
├── README.md
├── app/
│   └── profile/
│       ├── blob-generator.js
│       ├── build-profile-blob.js
│       ├── card-preview-css.js       # generated full-art hover map source
│       ├── deploy-bio.html          # generated
│       ├── deploy.css               # editable CSS source
│       ├── editor.html
│       ├── editor-server.js
│       ├── paste-blob.html          # generated Chub About Me deploy artifact
│       ├── profile-content.json     # editable content source
│       ├── profile-template.js
│       └── push-profile.js          # gateway About Me deploy helper
└── docs/
    └── PROFILE.md
```

Anything unrelated to this profile generator should stay out of the project.
