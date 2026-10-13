# Changelog

All notable changes to this project will be documented in this file.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning: [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added

- Feature-based architecture skeleton in `src/` (translate, vocabulary, flashcards, stats, summarize, settings)
- Configured TS path alias `@/` for `src/` in `tsconfig.app.json`

---

## [0.1.0] — YYYY-MM-DD

### Added

- Initial project scaffold: Vite + React + TypeScript + `@crxjs/vite-plugin` (MV3)
- `docs/`: ARCHITECTURE, PROJECT-RULES, API-CONTRACTS, DATA-SCHEMA, PRD, UI-DESIGN
- `.agents/`: Routing rules (`gemeni.md`) and three AI skills (build-feature, explain-code, write-test)
- Workspace alias `@` → `src/` confirmed in `vite.config.ts` and `tsconfig.json`
- TypeScript `strict: true` enabled in `tsconfig.app.json`
