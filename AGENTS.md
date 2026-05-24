# AGENTS.md

OpenCode compatibility entrypoint for this Chub profile project.

Follow the global AI-stack standards hub first: `C:\Users\TheLonelyDevil\.codex\AI_STACK_STANDARDS.md`. Workspace-only routing lives in `D:\AIStuff\AGENTS.md`.

Keep this file as the quick entrypoint. `CLAUDE.md` is the canonical local operating guide for source files, build/deploy commands, Chub quirks, live vetting, browser checks, and git expectations.

## Operating North Stars

- Before substantial project work, use the active `agent-harness-pointers` skill when the current runtime exposes it. If it is unavailable, use the same operating rule directly: keep the repo legible to agents, encode durable guidance in versioned docs/tooling, favor small verifiable feedback loops, and treat human attention as the scarce resource.
- For prompts, agent instructions, or workflow shaping, use the active `llm-prompting-guide` skill for the current runtime as the prompting guide: be clear and direct, provide context and examples where useful, structure long inputs, and ask for explicit output formats.
- Keep `D:\AIStuff\_MDs\References\Geechan's Desloppifier.md` and the active `geechan-desloppifier` skill for the current runtime in persistent mind as standing prose-quality filters: preserve the author's intent while avoiding dialogue echoing, negative parallelisms, tricolon abuse, superficial analyses, punchy fragment emphasis, em-dash overuse, thematic conclusions, verbose copulatives, inflated stakes, forced zeugmas, magic adverbs, ornate nouns, somatic cliches, poetic metaphor overuse, and crutch vocabulary.
- Keep this file as a map, not a manual. Put project-specific details in `CLAUDE.md`, `docs/`, or source-adjacent notes when they need to persist.

Before changing profile HTML, CSS, copy, deployment snippets, or visual layout, read `CLAUDE.md` and follow it as active project guidance.

## Local Priorities

- Treat `app/profile/profile-content.json` and `app/profile/deploy.css` as the main editable sources.
- Rebuild generated files with `node build-profile-blob.js` from `app/profile`.
- Keep Chub-facing selectors scoped with the `ld-` prefix where possible.
- Avoid broad Ant Design overrides unless they are already proven necessary on the live page.
- The generated deploy artifact is `app/profile/paste-blob.html`; the canonical live deploy uploads that artifact through `app/profile/push-profile.js`.
- For visual tuning, deploys, live-profile checks, and Chub sanitizer behavior, follow `CLAUDE.md` and `docs/CHUB-PROFILE-QUIRKS.md` rather than duplicating the workflow here.

## Git History

- This repo is tracked on a private remote. After completing any code, profile, CSS, copy, generated artifact, or documentation contribution, create a git commit and push it to the current branch before final handoff unless the user explicitly asks not to.
- Keep commits focused on the completed contribution. Do not include temporary screenshots, local browser artifacts, server logs, or unrelated workspace changes.

## Local Tooling Notes

- Use Git Bash for repo commands unless a task explicitly requires another shell.
- From PowerShell, run commands through `C:\Program Files\Git\bin\bash.exe`; see `CLAUDE.md` for the wrapper example.
- Treat WSL notes in older docs as historical fallback guidance. If a command must use WSL, say why in the handoff.
