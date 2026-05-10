# AGENTS.md

OpenCode compatibility entrypoint for this Chub profile project.

## Operating North Stars

- Before substantial project work, use `D:\AIStuff\_MDs\_Harness engineering leveraging Codex in an agent-first world.md` as the north star: keep the repo legible to agents, encode durable guidance in versioned docs/tooling, favor small verifiable feedback loops, and treat human attention as the scarce resource.
- For prompts, agent instructions, or workflow shaping, use `D:\AIStuff\_MDs\_Claude Prompting Guide.md` as the prompting guide: be clear and direct, provide context and examples where useful, structure long inputs, and ask for explicit output formats.
- Keep `D:\AIStuff\_MDs\Geechan's Desloppifier.md` in persistent mind as a standing prose-quality filter: preserve the author's intent while avoiding dialogue echoing, negative parallelisms, tricolon abuse, superficial analyses, punchy fragment emphasis, em-dash overuse, thematic conclusions, verbose copulatives, inflated stakes, forced zeugmas, magic adverbs, ornate nouns, somatic cliches, poetic metaphor overuse, and crutch vocabulary.
- Keep this file as a map, not a manual. Put project-specific details in `CLAUDE.md`, `docs/`, or source-adjacent notes when they need to persist.

Before changing profile HTML, CSS, copy, deployment snippets, or visual layout, read `CLAUDE.md` and follow it as active project guidance.

## Local Priorities

- Treat `app/profile/profile-content.json` and `app/profile/deploy.css` as the main editable sources.
- Rebuild generated files with `node build-profile-blob.js` from `app/profile`.
- Keep Chub-facing selectors scoped with the `ld-` prefix where possible.
- Avoid broad Ant Design overrides unless they are already proven necessary on the live page.
- The deploy artifact is `app/profile/paste-blob.html`.
- For browser checks, use the Codex Browser plugin with the Node REPL `iab` backend first. Treat external Playwright/CDP, including `127.0.0.1:9222`, as a fallback only when the in-app browser path is unavailable.

## Git History

- This repo is tracked on a private remote. After completing any code, profile, CSS, copy, generated artifact, or documentation contribution, create a git commit and push it to the current branch before final handoff unless the user explicitly asks not to.
- Keep commits focused on the completed contribution. Do not include temporary screenshots, local browser artifacts, server logs, or unrelated workspace changes.

## Local Tooling Notes

- WSL is now the preferred execution path for Codex and OpenCode in this repo. Use the verified `Debian-Dev` distro by default.
- From a Windows shell, run repo commands through WSL with `wsl -d Debian-Dev --cd /mnt/d/AIStuff/ChubProfile --exec bash -lc '<command>'`.
- Use PowerShell only as a fallback if `wsl -d Debian-Dev --exec true` fails. If falling back, avoid unescaped shell metacharacters; for `rg`, prefer repeated `-e` patterns over pipes.
