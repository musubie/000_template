# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

<!-- プロジェクトの概要をここに記述 -->

This is a Google Apps Script (GAS) project managed with `clasp`. Source code lives in `src/` and is written in JavaScript with JSDoc type annotations checked by TypeScript.

## Key Commands

```bash
make install      # pnpm install
make dev          # Switch to development Apps Script project
make prod         # Switch to production Apps Script project
make version      # Show current environment (DEV/PROD)
make lint         # Run biome linter
make fmt          # Run biome formatter
make prep         # Comment out imports/exports for GAS deployment
make deps         # Uncomment imports/exports for local development
make push         # prep → clasp push → deps (full deploy cycle)
make pull         # clasp pull → deps
make test         # Run local tests with gas-fakes
```

## Architecture

<!-- プロジェクト固有のアーキテクチャをここに記述 -->

## Code Conventions

- Use `biome` for linting and formatting (`make lint`, `make fmt`)
- Use **separate export declarations** at the end of files (not inline exports)
  ```javascript
  // CORRECT
  function myFunc() { ... }
  export { myFunc };

  // WRONG - breaks blkc.pl/blkuc.pl
  export function myFunc() { ... }
  ```
- Import paths must include `.js` extension for Node ESM compatibility
- GAS global functions (called by triggers) may appear unused — this is expected

## Testing

- Local tests use [gas-fakes](https://github.com/brucemcpherson/gas-fakes) for real Google API access
- Test runner: `test/run-tests.mjs` (executed via `pnpm test` from `src/` directory)
- `[Worker Error] Failed in sxDrive` messages are non-fatal; Sheets API still works
