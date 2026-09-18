# Project Rules

## Verification

- Run `npm run typecheck`, `npm test`, and `npm run build` before completing an implementation task.
- Keep the game engine deterministic. Route randomness through `src/game/random.ts`.
- Preserve unrelated working-tree changes and never discard files to make a check pass.

## Git commits

- Use Conventional Commits 1.0.0: `type(scope): summary`. The scope is optional.
- Use `feat` for user-visible capability, `fix` for a defect, `refactor` for behavior-preserving code changes, `test` for test-only work, `docs` for documentation, `build` for build or dependency changes, `ci` for automation, and `chore` for repository maintenance.
- Keep each commit to one logical, independently revertible change. Do not mix unrelated cleanup into feature commits.
- Write the summary in imperative mood, lowercase after the colon, without a trailing period. Keep it concise, preferably no more than 50 characters.
- Add a body after a blank line when the reason, tradeoff, migration, or non-obvious behavior needs explanation. Wrap body lines at roughly 72 characters.
- Mark breaking changes with `!` after the type or scope and explain them with a `BREAKING CHANGE:` footer.
- Use standard Git trailers only when they are factually required. Do not add AI attribution or synthetic co-author trailers.
- Before committing, inspect `git diff --cached` and ensure ignored local tooling directories are not staged.

Examples:

```text
feat(debt): add payday installments

fix(statuses): expire timed effects on month change

docs: explain the consequences engine
```

## Repository hygiene

- Never commit local AI-agent or editor state, including `.agents`, `.claude`, `.codex`, `.cursor`, `.impeccable`, and similar tool directories.
- Do not commit build output, dependency folders, logs, local environment files, or generated artifacts.
