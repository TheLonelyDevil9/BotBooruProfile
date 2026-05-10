# AGENTS.md

OpenCode compatibility entrypoint for this Chub profile project.

## Operating North Stars

- Before substantial project work, use `C:\Users\TheLonelyDevil\.agents\skills\agent-harness-pointers\SKILL.md` as the north star: keep the repo legible to agents, encode durable guidance in versioned docs/tooling, favor small verifiable feedback loops, and treat human attention as the scarce resource.
- For prompts, agent instructions, or workflow shaping, use `C:\Users\TheLonelyDevil\.agents\skills\llm-prompting-guide\SKILL.md` as the prompting guide: be clear and direct, provide context and examples where useful, structure long inputs, and ask for explicit output formats.
- Keep `D:\AIStuff\_MDs\References\Geechan's Desloppifier.md` and `C:\Users\TheLonelyDevil\.agents\skills\geechan-desloppifier\SKILL.md` in persistent mind as standing prose-quality filters: preserve the author's intent while avoiding dialogue echoing, negative parallelisms, tricolon abuse, superficial analyses, punchy fragment emphasis, em-dash overuse, thematic conclusions, verbose copulatives, inflated stakes, forced zeugmas, magic adverbs, ornate nouns, somatic cliches, poetic metaphor overuse, and crutch vocabulary.
- Keep this file as a map, not a manual. Put project-specific details in `CLAUDE.md`, `docs/`, or source-adjacent notes when they need to persist.

Before changing profile HTML, CSS, copy, deployment snippets, or visual layout, read `CLAUDE.md` and follow it as active project guidance.

## Local Priorities

- Treat `app/profile/profile-content.json` and `app/profile/deploy.css` as the main editable sources.
- Rebuild generated files with `node build-profile-blob.js` from `app/profile`.
- Keep Chub-facing selectors scoped with the `ld-` prefix where possible.
- Avoid broad Ant Design overrides unless they are already proven necessary on the live page.
- The deploy artifact is `app/profile/paste-blob.html`.
- For visual tuning, vet changes on the real Chub profile before committing them: patch the live `https://chub.ai/users/The_Lonely_Devil` DOM temporarily, let the user judge the actual Chub shell, then mirror the approved values into `app/profile/deploy.css` and rebuild `paste-blob.html`.
- A rebuilt local blob is not a live deployment. After source changes are approved, persist `paste-blob.html` into Chub's About Me field and verify the live page. Keep the workflow and quirks in `docs/CHUB-PROFILE-QUIRKS.md` current.
- For browser checks, use Chrome DevTools MCP and Playwright together against the same live or preview URL. If the shared CDP endpoint is unavailable, report the exact blocker before using a fallback.

## Git History

- This repo is tracked on a private remote. After completing any code, profile, CSS, copy, generated artifact, or documentation contribution, create a git commit and push it to the current branch before final handoff unless the user explicitly asks not to.
- Keep commits focused on the completed contribution. Do not include temporary screenshots, local browser artifacts, server logs, or unrelated workspace changes.

## Local Tooling Notes

- Use Git Bash for repo commands unless a task explicitly requires another shell.
- From PowerShell, run commands through `C:\Program Files\Git\bin\bash.exe`, for example:
  `& 'C:\Program Files\Git\bin\bash.exe' -lc 'cd /d/AIStuff/ChubProfile && <command>'`
- Treat WSL notes in older docs as historical fallback guidance. If a command must use WSL, say why in the handoff.
