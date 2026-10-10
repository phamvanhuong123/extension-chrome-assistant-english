# PROJECT-RULES

> **Audience:** developers (new members + AI coding assistants). Follow these rules for every change.
> **Prerequisite:** read [ARCHITECTURE.md](./ARCHITECTURE.md) first.
> **Structure:** feature-based (`src/features/*`), see ARCHITECTURE §6–7.
> **Legend:** ✅ enforced by tooling · 👀 enforced by code review · ⚠️ VERIFY = inferred, confirm with team.

---

## 1. Quick Rules (TL;DR)

- ✅ No semicolons, single quotes, 2 spaces, max 120 chars per line.
- 👀 UI and content scripts **never** call `chrome.*` storage or external APIs directly. Go through the feature's `api.ts` → service worker.
- 👀 Every cross-runtime message is defined in its feature's `messages.ts` and called via the feature's `api.ts`.
- ✅ Import boundaries: features talk only via public API (`@/features/x`), never deep imports; `content/` and `ui/` never import `background/` (see §7.4).
- 👀 New code goes into `src/features/<name>/`. Do not add to legacy locations.
- 👀 No hard-coded user-facing text. Use `t('feature.area.key')` with `vi` + `en` entries (see §6.1).
- ✅ No `any`. Use `unknown` + type guards.
- 👀 One PR = one purpose. Update docs/CHANGELOG in the same PR when behavior changes.
- 👀 Never log or commit API keys.

---

## 2. Code Style (Prettier)

Source of truth: `.prettierrc`.

| Option | Value | Example |
|--------|-------|---------|
| `semi` | `false` | `const a = 1` |
| `singleQuote` | `true` | `'hello'` |
| `jsxSingleQuote` | `true` | `<Tooltip className='box' />` |
| `trailingComma` | `none` | `[1, 2, 3]` |
| `arrowParens` | `always` | `(x) => x + 1` |
| `tabWidth` / `useTabs` | `2` / `false` | spaces only |
| `printWidth` | `120` | |
| `endOfLine` | `auto` | |

- Prettier runs through ESLint (`prettier/prettier`), currently as **warn**.
- Do not hand-format. Run `npm run lint -- --fix` before committing.
- `.editorconfig` standardizes indent/EOL in IDEs; `.prettierignore` excludes generated files (`dist/`). Keep them consistent with `.prettierrc`.
- ⚠️ VERIFY: Prettier options are duplicated in `.prettierrc` and `eslint.config.js`. Keep both identical until consolidated (see §12).

---

## 3. Linting (ESLint)

Active presets (`eslint.config.js`):
- `@eslint/js` recommended
- `typescript-eslint` recommended
- `eslint-plugin-react-hooks` recommended
- `eslint-plugin-react-refresh` (Vite)
- `eslint-plugin-prettier`

Rules for the team:
- **Zero warnings policy:** do not merge PRs with new lint warnings.
- Do not use `// eslint-disable` without a reason comment.
  ```ts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- 3rd-party typing is missing (issue #123)
  ```
- `react-hooks/rules-of-hooks` and `exhaustive-deps` must be respected. Fix the dependency, don't silence the rule.
- `react-refresh/only-export-components`: a component file exports components only. Put hooks/constants in separate files.

---

## 4. Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| React component file | `PascalCase.tsx` | `FlashcardItem.tsx` |
| Hook | `useXxx.ts` | `useDueCards.ts` |
| Feature folder | `kebab-case`, singular domain noun | `features/vocabulary/` |
| Non-component module | `kebab-case` + role suffix | `vocabulary.repo.ts` |
| Role suffixes | `.handler` `.service` `.repo` `.client` `.test` | `translate.client.ts` |
| Feature root files | fixed names | `messages.ts`, `api.ts`, `types.ts`, `index.ts` |
| Variables / functions | `camelCase` | `saveWord()` |
| Types / interfaces | `PascalCase` | `Word`, `DailyStat` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_RETRY = 2` |
| Message types | `UPPER_SNAKE_CASE` verb-first | `TRANSLATE_WORD`, `SAVE_WORD` |
| Storage keys | `namespace:id` lowercase | `vocab:{id}`, `stats:2026-10-08` |
| Booleans | `is/has/should` prefix | `isLoading`, `hasApiKey` |
| Event handlers | `handleXxx` (internal), `onXxx` (props) | `handleSave`, `onSave` |

---

## 5. TypeScript Rules

- `strict` mode on. ⚠️ VERIFY in `tsconfig.json`.
- ✅ No `any`. Prefer `unknown` and narrow.
- Prefer `type` for unions/utility types, `interface` for object shapes that may be extended.
- Use `import type { ... }` for type-only imports.
- Use discriminated unions for messages and results.
- Prefer explicit return types on exported functions.
- Avoid `enum`. Use string literal unions.

```ts
// ✅ Good
type Rating = 'again' | 'good' | 'easy'

// ❌ Bad
enum Rating { Again, Good, Easy }
```

---

## 6. React Rules

- Function components + hooks only. No class components.
- Component stays small. Extract logic into hooks inside the feature; extract generic pure logic into `shared/utils`.
- Props typed explicitly; no inline `any` props.
- Side effects (messaging, storage) go in hooks via the feature's `api.ts`, never inline in JSX.
- Always handle 3 states in data-driven UI: **loading / error / empty**.
- Keys in lists must be stable IDs (not array index) when items can reorder.

```tsx
// ✅ Good
const { cards, isLoading, error } = useDueCards()

// ❌ Bad
useEffect(() => {
  chrome.storage.local.get('vocab').then(setCards) // UI touching chrome.* directly
}, [])
```

### 6.1 Internationalization (i18n)

**Decision:** use our own lightweight i18n layer, **not** `chrome.i18n`, for UI text.
- Why: `chrome.i18n` follows the browser language and cannot be switched at runtime, but users can choose `uiLanguage` (`vi` default, `en`) in settings (FR-09).
- `chrome.i18n` + `public/_locales/{vi,en}/messages.json` is used **only** for `extName` and `extDescription` (`manifest.json` → `__MSG_extName__`, `default_locale: "vi"`).

**Structure**
```
shared/i18n/                 # createI18n(), useT() hook, t() for non-React code, types
features/<name>/locales/     # vi.ts, en.ts (owned by the feature)
```
- Each feature exports its dictionaries from its root `index.ts` (`export { vi as translateVi, en as translateEn } from './locales'`).
- Entries compose them (shared must not import features):
```ts
// src/content/i18n.ts
export const i18n = createI18n({
  vi: { ...translateVi, ...vocabularyVi },
  en: { ...translateEn, ...vocabularyEn }
})
```

**Rules**
- Key format: `feature.area.name`, e.g. `vocabulary.saveButton.label`, `flashcards.session.done`. Error messages: `errors.<CODE>` (see [API-CONTRACTS.md](./API-CONTRACTS.md) §4).
- Dictionaries are typed. `vi` is the source; `en` must have the same keys (enforced by TypeScript: `const en: typeof vi = {...}`).
- No string concatenation. Use placeholders: `t('stats.streak', { count: 3 })` → `'Chuỗi {count} ngày'`.
- Fallback order: selected language → `en` → the key itself (never show an empty string).
- Do **not** translate dictionary results (`translation`, `phonetic`). They are data, not UI text.
- Use `Intl.DateTimeFormat` / `Intl.NumberFormat` with the selected language for dates and numbers.
- Read `uiLanguage` through the `settings` feature `api.ts`. Content scripts re-read it each time the tooltip opens. ⚠️ VERIFY
- Keep content-script dictionaries small (only tooltip strings) to protect the bundle size (NFR-01).

---

## 7. Feature Structure & Runtime Rules

### 7.1 Where does my code go?

| Code | Location |
|------|----------|
| Anything tied to one feature | `src/features/<feature>/…` |
| Entry wiring (mount, register handlers) | `src/background`, `src/content`, `src/popup`, `src/options`, `src/flashcards` |
| Feature-agnostic UI primitive | `src/shared/ui/` |
| Feature-agnostic pure helper | `src/shared/utils/` |
| Messaging envelope / router helpers | `src/shared/messaging/` |
| Storage helpers + migrations | `src/shared/storage/` |
| User-facing text | `src/features/<feature>/locales/{vi,en}.ts` (generic: `src/shared/i18n/`) |

Feature layout (create only what you need):
```
features/vocabulary/
├── background/   (index.ts, vocabulary.handler.ts, vocabulary.repo.ts)
├── content/      (SaveButton.tsx)
├── ui/           (WordList.tsx)
├── locales/      (vi.ts, en.ts)
├── messages.ts   api.ts   types.ts   index.ts
```

### 7.2 Content Script (`features/*/content/`, `src/content/`)
- Render UI inside Shadow DOM. Never rely on page CSS.
- No `fetch` to external APIs, no storage access. Call the feature's `api.ts`.
- Never use `innerHTML` / `dangerouslySetInnerHTML` with page or API text.
- Clean up listeners on unmount; handle "extension context invalidated".

### 7.3 Service Worker (`features/*/background/`, `src/background/`)
- One handler per message type, exported from the feature's `background/index.ts`, registered once in `src/background/index.ts`.
- Handlers return `Response<T>`; never throw across runtimes.
- No global mutable state. Persist what must survive a restart.
- External API calls live in `*.client.ts` only (timeout + retry + error mapping).
- Storage access lives in `*.repo.ts` only.
- Calling another feature's logic: import from `@/features/<other>/background` only.

### 7.4 Import boundaries

| From → To | Allowed? |
|-----------|----------|
| entry → `features/*` public API | ✅ |
| feature → `shared/*` | ✅ |
| feature → other feature via `@/features/x`, `@/features/x/background` | ✅ |
| feature → other feature deep path (`@/features/x/background/x.repo`) | ❌ |
| `content/` or `ui/` → `background/` | ❌ |
| `shared/*` → `features/*` | ❌ |
| circular feature dependencies | ❌ |

Conventions:
- **Inside a feature: relative imports.** **Across features: `@/features/...` alias.** This makes boundary rules lintable.
- Features must not reach into another feature's `types.ts` directly. Import types from its root `index.ts`.

Suggested ESLint rules (add to `eslint.config.js`) ⚠️ VERIFY pattern syntax:
```js
{
  files: ['src/content/**', 'src/popup/**', 'src/options/**', 'src/flashcards/**', 'src/features/*/content/**', 'src/features/*/ui/**'],
  rules: {
    'no-restricted-imports': ['error', { patterns: [
      { group: ['@/features/*/background', '@/features/*/background/**', '**/background/**'],
        message: 'UI/content must call background via messages (api.ts).' }
    ] }]
  }
},
{
  files: ['src/**/*.{ts,tsx}'],
  ignores: ['src/features/**'],
  rules: {
    'no-restricted-imports': ['error', { patterns: [
      { group: ['@/features/*/*/**'], message: 'No deep imports into a feature. Use its public API.' }
    ] }]
  }
},
{
  files: ['src/shared/**'],
  rules: {
    'no-restricted-imports': ['error', { patterns: [
      { group: ['@/features/**'], message: 'shared must not depend on features.' }
    ] }]
  }
}
```
Alternative: `eslint-plugin-boundaries` for richer rules.

### 7.5 Entries (popup / options / flashcards)
- Entry files only compose: providers, routing, layout, feature UIs.
- Popup is short-lived: don't hold unsaved state there.
- Each page has its own `index.html` + `main.tsx`. ⚠️ VERIFY (root `index.html` currently)

---

## 8. Messaging & Data Rules

- Add a message in this order: feature `messages.ts` → handler → export in `background/index.ts` → register in `src/background/index.ts` → feature `api.ts` wrapper → [API-CONTRACTS.md](./API-CONTRACTS.md).
- Changing a stored entity requires: update the owning feature's `types.ts` + write a **migration** (`shared/storage/migrations/`) + update [DATA-SCHEMA.md](./DATA-SCHEMA.md).
- Never rename or remove a storage key without a migration (user vocabulary must not be lost on extension update).
- Dates stored as ISO strings or epoch ms. Pick one and document it in DATA-SCHEMA. ⚠️ VERIFY

---

## 9. Error Handling & Logging

- Use stable error codes: `NETWORK_ERROR`, `RATE_LIMITED`, `AI_NOT_CONFIGURED`, `VALIDATION_ERROR`.
- User-facing messages are friendly; technical details go to the console in dev only.
- Remove `console.log` before merging. `console.warn` / `console.error` are allowed for real problems.
- ❌ Never log: API keys, full selected passages, user vocabulary dumps.

---

## 10. Security & Privacy

- API key stored in `chrome.storage.local` only. Never synced, never in source, never in `.env` committed to Git.
- Request only the permissions required. New permission = PR description must justify it.
- No remote code, no `eval`, no inline scripts (MV3 CSP).
- AI features are **opt-in**; selected text is sent to external services only after a user action.

---

## 11. Git & PR Workflow ⚠️ VERIFY with team

**Branches:** `main` (stable) ← `feat/…`, `fix/…`, `docs/…`, `chore/…`
- Example: `feat/flashcard-streak`, `fix/tooltip-position`

**Commits:** Conventional Commits
```
feat(content): show phonetic in tooltip
fix(background): retry translation on 429
docs: add ARCHITECTURE.md
```

**PR rules**
- Small and focused; target < 400 changed lines when possible.
- At least **1 approval** before merge. ⚠️ VERIFY
- CI must pass (lint + typecheck + build + tests).
- Squash merge to keep history clean.

**PR checklist** (put in PR template)
- [ ] Lint passes, no new warnings
- [ ] Types pass (`tsc -b`)
- [ ] Manually tested in Chrome (loaded unpacked `dist/`)
- [ ] Docs updated if architecture / schema / contract changed
- [ ] `CHANGELOG.md` updated under `[Unreleased]`
- [ ] No hard-coded user-facing text (`vi` and `en` provided)
- [ ] No secrets or debug logs

---

## 12. Tooling Notes & Known Gaps

Observed in current config. Consider fixing in separate PRs:

| # | Observation | Suggested improvement |
|---|-------------|-----------------------|
| 1 | `globals.browser` only, so `chrome` is not typed as a global at lint level | Add `@types/chrome` and rely on TS types; add a `globals.serviceworker` override for `src/background/**` |
| 2 | Prettier options duplicated in `.prettierrc` and ESLint rule | Remove inline options from ESLint; let the plugin read `.prettierrc` |
| 3 | `prettier/prettier` is `warn` | Switch to `error` in CI to block unformatted code |
| 4 | `ignores: ['vite.config.ts']` sits inside a config object with `files`, so it only excludes that file from this block | Move to `globalIgnores([...])` if you want it fully ignored |
| 5 | No import-type or import-order rule | Add `@typescript-eslint/consistent-type-imports` (and optionally `eslint-plugin-import`) |
| 6 | No pre-commit hook | Add `husky` + `lint-staged` ⚠️ VERIFY |
| 7 | No import-boundary lint | Add rules from §7.4 (or `eslint-plugin-boundaries`) |
| 8 | `@/` alias not confirmed | Add `paths` in `tsconfig.app.json` and `resolve.alias` in `vite.config.ts` |
| 9 | `eslint.config.js` has `globals.browser` only | Override per area: `serviceworker` for `src/**/background/**` |

---

## 13. Do / Don't for AI Coding Assistants

**Do**
- Read `docs/ARCHITECTURE.md` and this file before coding.
- Put new code in `src/features/<name>/`, in the correct runtime folder (`background/`, `content/`, `ui/`).
- Match existing patterns and role suffixes (`.handler`, `.repo`, `.client`).
- Define messages in the feature's `messages.ts`; call them through `api.ts`.
- Put user-facing text in the feature's `locales/vi.ts` + `en.ts` and render it with `t()`.
- Use relative imports inside a feature, `@/features/...` across features, `@/shared/...` for shared.
- Keep changes minimal and scoped to the task.
- Format with the repo's Prettier settings (no semicolons, single quotes).

**Don't**
- Don't add dependencies without asking.
- Don't call external APIs or `chrome.storage` from UI/content code.
- Don't import `background/` from `content/` or `ui/`.
- Don't deep-import into another feature or import features from `shared/`.
- Don't use `any`, `enum`, class components, or `innerHTML`.
- Don't change storage keys or schema without a migration.
- Don't put business logic in entry files.
- Don't hard-code user-facing strings or concatenate translated fragments.
- Don't rewrite unrelated files or reformat whole files.
- Don't invent APIs. If a type/contract is missing, say so and propose it.

---

## 14. Open Questions

- [x] File naming: `kebab-case` + role suffix (decided in this doc, confirm with team).
- [ ] Confirm `strict` mode in `tsconfig.app.json` and the `@/` alias.
- [ ] Required approvals per PR and CI pipeline definition.
- [ ] Test framework and minimum coverage target.
- [ ] Date format standard in storage (ISO vs epoch).
- [ ] Feature ownership: one primary owner per feature (suggested for 5 devs).
- [ ] i18n implementation: small custom `t()` or a library (e.g. `react-i18next`)? Custom is lighter for the content script.
