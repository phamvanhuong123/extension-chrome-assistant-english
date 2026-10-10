# PRD: English Reading Assistant

> **Audience:** developers (new members + AI coding assistants), plus the product owner who confirms scope.
> **Status:** v0.1 draft. **No feature is implemented yet.** All requirements below are `Planned`. Scope was *suggested* from the project description and must be confirmed by the product owner.
> **Related docs:** [ARCHITECTURE.md](./ARCHITECTURE.md) · [DATA-SCHEMA.md](./DATA-SCHEMA.md) · [API-CONTRACTS.md](./API-CONTRACTS.md) · [PROJECT-RULES.md](./PROJECT-RULES.md)
> **How to use IDs:** reference requirement IDs (`FR-03`, `NFR-02`) in branches, PR titles, commits, and CHANGELOG. Example: `feat(vocabulary): save word with context (FR-03)`.

---

## 1. Product Summary

**One-liner:** A Chrome extension that lets beginner English learners highlight any word while reading, instantly see its Vietnamese meaning, save it, and remember it through flashcards.

**Problem**
- Beginners stop reading when they meet unknown words, and switching to a dictionary tab breaks focus.
- Looked-up words are forgotten because nothing brings them back for review.
- Long paragraphs are intimidating at this level.

**Solution**
- Translate in place (tooltip), no tab switching.
- Save the word **with the sentence it came from** (context helps memory).
- Review saved words with short daily flashcards and simple stats.
- Optional AI summary to make a hard passage easier to approach.

---

## 2. Target Users

**Primary persona: "Lan", beginner English learner (CEFR A1–A2)**
- Vietnamese native speaker, student or young professional.
- Reads news, blogs, and learning sites in English, but knows only basic vocabulary.
- Wants quick help without a complicated tool. Has ~5–10 minutes a day for review.
- Is not comfortable with technical settings (API keys, languages).

**Design implications for beginners**
- Show **Vietnamese** meaning first. Keep the tooltip short (1 main meaning, phonetic, part of speech).
- Extension UI is in **Vietnamese by default** (English optional).
- Small daily goals (default **10 cards/day**) to avoid overwhelm.
- Defaults must work with **zero setup**. Only AI needs configuration.
- Encouraging, simple wording. No jargon.

---

## 3. Goals & Non-goals

### Goals
- G1: Look up a word in under ~1 second without leaving the page.
- G2: Make saving a word a one-click action.
- G3: Build a daily review habit with a short, simple flashcard session.
- G4: Work offline for everything already saved (review, vocabulary list).
- G5: Keep user data private and local.

### Non-goals (v1)
- ❌ User accounts, cloud sync, or any own backend (only settings may sync via `chrome.storage.sync`).
- ❌ Browsers other than Chrome (Edge works if Chromium-compatible, but is not a target).
- ❌ Mobile apps.
- ❌ Full dictionary entries (multiple senses, etymology, long example lists).
- ❌ Auto-translating whole pages.
- ❌ Gamification with social features (leaderboards, friends).
- ❌ PDF reader, video subtitles, or speech recognition.
- ❌ Languages other than **English → Vietnamese** in the first release (architecture stays language-agnostic, see `sourceLang` / `targetLang`).

---

## 4. Scope & Release Plan

| Phase | Theme | Requirements | Outcome |
|-------|-------|--------------|---------|
| **1. MVP** | Look up & save | FR-01, FR-02, FR-03, FR-04, FR-05, FR-09 (basic) | A user can translate and save words |
| **2. Learning loop** | Review & progress | FR-06, FR-07, FR-08 | A user can build a daily habit |
| **3. Polish & AI** | Trust & extras | FR-10, FR-11, FR-12, FR-13 | Safe data, onboarding, optional AI |
| **4. Backlog** | Later | FR-14, FR-15, FR-16 | Nice-to-haves |

Priority: **P0** must-have for its phase · **P1** should-have · **P2** nice-to-have.

---

## 5. Functional Requirements

### 5.1 Translate (feature: `translate`)

#### FR-01: Translate highlighted text (P0, Phase 1)
User highlights a word or short phrase on a web page and sees a tooltip with the translation.
- **Acceptance criteria**
  - Highlighting 1–5 words (max 100 chars) shows a tooltip near the selection within 1 s (p95, cached < 200 ms).
  - Tooltip shows: original text, Vietnamese translation, loading state, error state with "Try again".
  - Tooltip closes on click outside, `Esc`, or new selection.
  - Works on dynamic pages and does not break page layout or styles (Shadow DOM).
  - Not triggered inside `input`, `textarea`, or `contenteditable` fields.
- **Contract:** `TRANSLATE_WORD` ([API-CONTRACTS.md](./API-CONTRACTS.md) §3.1)

#### FR-02: Pronunciation info (P0 phonetic · P1 audio, Phase 1)
- **Acceptance criteria**
  - Tooltip shows phonetic (IPA) and part of speech when available.
  - (P1) A speaker button plays pronunciation using the browser's built-in speech synthesis (`speechSynthesis`, no external API).
  - If phonetic is unavailable, the section is hidden (no empty placeholder).

### 5.2 Vocabulary (feature: `vocabulary`)

#### FR-03: Save a word with context (P0, Phase 1)
- **Acceptance criteria**
  - Tooltip has a "Save" button. One click saves the word, translation, phonetic, source sentence (`context`, max 500 chars), and page URL (without query/hash).
  - Button changes to "Saved ✓" immediately (optimistic), reverts with an error if saving fails.
  - Storage-full errors show a clear message and suggest export/cleanup.
- **Contract:** `SAVE_WORD`

#### FR-04: Duplicate handling (P0, Phase 1)
- **Acceptance criteria**
  - Saving the same word again (case-insensitive) does not create a second entry; it updates the context/time.
  - When the user highlights an already-saved word, the tooltip shows "Saved ✓".
- **Contract:** `GET_WORD_STATUS`, `SAVE_WORD` (`created: false`)

#### FR-05: Vocabulary list (P0, Phase 1)
Available in the popup (recent words) and in a full list view. ⚠️ VERIFY placement
- **Acceptance criteria**
  - Shows saved words, newest first, with translation and context.
  - Search by word or translation.
  - Delete a word (with undo or confirmation).
  - Handles empty state with a friendly hint ("Highlight a word on any page to start").
  - Works offline.
- **Contract:** `LIST_WORDS`, `DELETE_WORD`

### 5.3 Flashcards (feature: `flashcards`)

#### FR-06: Daily flashcard review (P0, Phase 2)
- **Acceptance criteria**
  - A full-tab page shows today's due cards, one at a time: front = English word (+ context sentence), back = Vietnamese meaning + phonetic.
  - User flips the card, then rates: **Again / Good / Easy** (keyboard: `Space` flip, `1/2/3` rate).
  - Session ends with a summary (cards reviewed, correct rate) and a clear "Done for today" state.
  - Session size is limited by the daily goal (default **10**).
  - Works offline.
- **Contract:** `GET_DUE_CARDS`, `SUBMIT_REVIEW`

#### FR-07: Spaced repetition (P0, Phase 2)
- **Acceptance criteria**
  - New words are due immediately. After a review, the next due date follows a simple, predictable ladder (suggested for beginners): **Again → 1 day · Good → 3 → 7 → 14 → 30 days · Easy → skip one step**. Stored as `srsStep` ([DATA-SCHEMA.md](./DATA-SCHEMA.md) §4.1). Needs product-owner confirmation.
  - Algorithm is a pure, unit-tested function (`features/flashcards/srs.ts`).
  - The popup badge/count shows the number of cards due today.

### 5.4 Stats (feature: `stats`)

#### FR-08: Daily stats & streak (P1 → P0 for basic counts, Phase 2)
- **Acceptance criteria**
  - Popup shows today's: words looked up, words saved, cards reviewed, correct rate.
  - Streak = consecutive days with at least 1 reviewed card. Shown with a simple "N-day streak".
  - A 7-day mini chart (P1).
  - Days with no activity show zero (no gaps or errors).
- **Contract:** `GET_TODAY_STATS`, `GET_STATS_RANGE`

### 5.5 Settings (feature: `settings`)

#### FR-09: Basic settings (P0 minimal in Phase 1, expanded in Phase 2)
- **Acceptance criteria**
  - Defaults require no setup: English → Vietnamese, tooltip shows on selection.
  - User can change: tooltip trigger (auto on select / only when clicking a small icon), daily goal, theme (system/light/dark), UI language (Vi/En).
  - Settings apply without reloading pages (content script reads updates).
  - Changing the UI language applies immediately (own i18n layer, see [PROJECT-RULES.md](./PROJECT-RULES.md) §6.1).
- **Contract:** `GET_SETTINGS`, `UPDATE_SETTINGS`

#### FR-11: Export / import / reset data (P1, Phase 3)
- **Acceptance criteria**
  - Export vocabulary + stats + settings as a JSON file. API key is never exported.
  - Import merges by word (keeps newer). Invalid or newer-version files are rejected with a clear message.
  - Reset requires explicit confirmation.
- **Contract:** `EXPORT_DATA`, `IMPORT_DATA`, `RESET_DATA`

#### FR-12: First-run onboarding (P1, Phase 3)
- **Acceptance criteria**
  - On install, open a short welcome page (3 steps max): highlight → save → review. Skippable.
  - Shows a demo sentence the user can highlight to try the tooltip.

#### FR-13: Disable on specific sites (P2, Phase 3)
- **Acceptance criteria**
  - User can turn the extension off for the current site from the popup. Setting persists.

### 5.6 AI Summarization (feature: `summarize`, optional)

#### FR-10: Passage summarization (P1, Phase 3)
Opt-in. For beginners, summaries should be **simple English** or Vietnamese.
- **Acceptance criteria**
  - Disabled by default. Enabling requires the user to enter their own API key and acknowledge that selected text is sent to the AI provider.
  - User highlights a passage (up to the max length) and clicks "Summarize" in the tooltip/panel.
  - Output language selectable: Vietnamese or simple English (A2 level). ⚠️ VERIFY
  - Clear messages for: not configured, invalid key, rate limited, too long (shows "truncated").
  - If AI is off or fails, all other features remain fully usable.
- **Contract:** `SUMMARIZE_TEXT`, `SET_API_KEY`, `HAS_API_KEY`, `TEST_API_KEY`

### 5.7 Backlog (P2, Phase 4)

| ID | Requirement | Notes |
|----|-------------|-------|
| FR-14 | Translate a full sentence (≤ 500 chars) | Needs larger input limit in `translate` contract and DATA-SCHEMA |
| FR-15 | Context menu + keyboard shortcut to translate selection | Useful where tooltips are blocked |
| FR-16 | Export words to Anki / CSV | Format TBD |
| FR-17 | Daily review reminder (notification via `chrome.alarms`) | Needs `notifications` permission; opt-in |
| FR-18 | Example sentences for a saved word | Provider/AI dependent |

---

## 6. Non-functional Requirements

| ID | Category | Requirement |
|----|----------|-------------|
| NFR-01 | Performance | Tooltip appears ≤ 1 s p95 (≤ 200 ms when cached). Content script bundle kept small (target < 100 KB gzipped ⚠️ VERIFY). No measurable slowdown on page load. |
| NFR-02 | Privacy | All user data stays local. Selected text leaves the device only to the translation provider (on selection) and to the AI provider (on explicit action, opt-in). No tracking or ad SDKs. |
| NFR-03 | Security | API key in `storage.local` only; never logged/synced/exported. No remote code, no `innerHTML` with external text. Minimal permissions ([ARCHITECTURE.md](./ARCHITECTURE.md) §10). |
| NFR-04 | Offline | Vocabulary list, flashcards, and stats work fully offline. Translation/AI show a friendly "offline" message. |
| NFR-05 | Reliability | No data loss on update (migrations, [DATA-SCHEMA.md](./DATA-SCHEMA.md) §8). Service worker restarts must not break flows. |
| NFR-06 | Accessibility | Keyboard-operable (flashcards, tooltip close), visible focus, WCAG AA contrast, `aria-live` for tooltip results. |
| NFR-07 | Localization | UI strings via the project's own i18n layer (`shared/i18n`, `vi` default, `en`) so users can switch language at runtime. `chrome.i18n` / `_locales` is used only for the extension name and description. No hard-coded user-facing text. |
| NFR-08 | Compatibility | Latest 2 stable Chrome versions, Manifest V3. Works on typical sites incl. SPAs. |
| NFR-09 | Maintainability | Follows [PROJECT-RULES.md](./PROJECT-RULES.md). Pure logic unit-tested. |
| NFR-10 | Store compliance | Meets Chrome Web Store policies: single purpose, privacy policy page, justified permissions. |

---

## 7. Key User Journeys

**J1: First lookup and save (Phase 1)**
1. Lan reads an article and highlights "ubiquitous".
2. Tooltip shows "có mặt ở khắp nơi", `/juːˈbɪkwɪtəs/`, adjective.
3. She clicks **Save** → sees "Saved ✓".

**J2: Daily review (Phase 2)**
1. Popup shows "8 cards due" and a 3-day streak.
2. She clicks **Review** → flashcard page opens.
3. She flips, rates Good/Again for 8 cards → sees "Done for today 🎉" with her correct rate.

**J3: Understand a hard paragraph (Phase 3, optional)**
1. She enables AI in settings, pastes her API key, tests it.
2. She highlights a paragraph → **Summarize** → reads a simple Vietnamese summary.

---

## 8. Success Metrics

> ⚠️ VERIFY: the extension has no analytics by design (NFR-02). Use Chrome Web Store dashboard data, optional opt-in local counters, or user feedback until a privacy-respecting approach is agreed.

| Metric | Target (initial) | Source |
|--------|------------------|--------|
| Activation: users who save ≥ 3 words on day 1 | ≥ 40% | opt-in / estimate |
| Habit: users who review cards on ≥ 3 of first 7 days | ≥ 25% | opt-in / estimate |
| Tooltip latency p95 | ≤ 1 s | local perf logs in dev |
| Crash/error rate of message handlers | < 1% | dev logging |
| Chrome Web Store rating | ≥ 4.3 | store |

---

## 9. Assumptions, Dependencies & Risks

| # | Type | Item | Mitigation |
|---|------|------|------------|
| 1 | Dependency | Translation provider availability, quota, cost | Provider interface, cache, client-side rate limit, fallback provider |
| 2 | Dependency | AI provider and user-supplied API key | Opt-in; all core features work without AI |
| 3 | Risk | Sites with strict CSP or odd DOM break tooltip | Shadow DOM, test on top sites, per-site disable (FR-13) |
| 4 | Risk | Chrome Web Store review rejects broad host permissions | Justify `<all_urls>` or use `activeTab`/optional permissions ⚠️ VERIFY |
| 5 | Risk | Storage quota for large vocabularies | Export, monitor size, option to move to IndexedDB |
| 6 | Risk | Beginners abandon after the first week | Small daily goal, streak, encouraging copy, optional reminders (FR-17) |
| 7 | Assumption | Users are Vietnamese speakers; target language is `vi` | Keep `sourceLang`/`targetLang` configurable in data model |

---

## 10. Traceability (Requirement → Feature → Contract)

| Requirement | Feature folder | Main messages |
|-------------|----------------|---------------|
| FR-01, FR-02 | `features/translate` | `TRANSLATE_WORD` |
| FR-03, FR-04, FR-05 | `features/vocabulary` | `SAVE_WORD`, `GET_WORD_STATUS`, `LIST_WORDS`, `DELETE_WORD` |
| FR-06, FR-07 | `features/flashcards` | `GET_DUE_CARDS`, `SUBMIT_REVIEW` |
| FR-08 | `features/stats` | `GET_TODAY_STATS`, `GET_STATS_RANGE` |
| FR-09, FR-11, FR-12, FR-13 | `features/settings` | `GET_SETTINGS`, `UPDATE_SETTINGS`, `EXPORT_DATA`, `IMPORT_DATA`, `RESET_DATA` |
| FR-10 | `features/summarize` | `SUMMARIZE_TEXT`, `SET_API_KEY`, `HAS_API_KEY`, `TEST_API_KEY` |

---

## 11. Definition of Done (per requirement)

- [ ] Acceptance criteria met and manually tested in Chrome (unpacked `dist/`)
- [ ] Unit tests for pure logic and handlers
- [ ] Loading / error / empty states implemented
- [ ] No new lint warnings; boundaries respected ([PROJECT-RULES.md](./PROJECT-RULES.md) §7.4)
- [ ] Docs updated if contract/schema/architecture changed
- [ ] `CHANGELOG.md` updated under `[Unreleased]` with the requirement ID

---

## 12. Open Questions (for the product owner)

- [ ] Confirm the scope and phase split in §4, and the non-goals in §3.
- [ ] Confirm UI language default (Vietnamese) and whether English UI is needed in v1.
- [ ] Confirm default daily goal (10) and the review ladder in FR-07.
- [ ] Confirm whether the full vocabulary list lives in the popup, options page, or its own page.
- [ ] Should sentence translation (FR-14) move into Phase 1 for beginners?
- [ ] Confirm AI output languages (Vietnamese / simple English) and provider list.
- [ ] Decide how to measure success without analytics (§8).
- [ ] Confirm monetization (none assumed).
