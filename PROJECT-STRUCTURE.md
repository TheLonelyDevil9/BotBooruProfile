# Project Structure

This repo is intentionally scoped to the BotBooru creator profile only.

```text
BotBooruProfile/
├── AGENTS.md
├── CLAUDE.md
├── PRODUCT.md
├── PROJECT-STRUCTURE.md
├── README.md
├── app/
│   └── profile/
│       ├── bio.html             # editable bio blob (CSS + markup), the paste artifact
│       ├── build-preview.js     # preview builder + size-budget check
│       └── preview.html         # generated local verification harness
└── docs/
    ├── BOTBOORU-PROFILE-QUIRKS.md
    └── PROFILE.md
```

Anything unrelated to this profile blob should stay out of the project.
