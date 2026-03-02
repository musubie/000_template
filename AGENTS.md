# AGENTS.md

Guidelines for AI agents working with this repository.

## General Rules

- Read `CLAUDE.md` first for project-specific commands and conventions.
- Always run `make deps` after `make pull` or `clasp pull` to restore imports/exports.
- Never run `clasp push` directly — use `make push` which handles prep/deps automatically.
- Do not modify `blkc.pl` or `blkuc.pl` unless explicitly asked.

## Code Style

- Follow existing patterns in `src/`.
- Use separate `export { ... }` declarations at the end of files.
- Run `make lint` and `make fmt` before proposing changes.

## Testing

- Run `make test` to execute local tests with gas-fakes.
- Verify with `tsc` (or `pnpm t`) that type checking passes.
