# UI-DESIGN

> **Audience:** developers, UI designers, AI coding assistants.
> **Prerequisites:** [ARCHITECTURE.md](./ARCHITECTURE.md) · [PROJECT-RULES.md](./PROJECT-RULES.md) · [PRD.md](./PRD.md)
> **Product:** a lightweight English reading and vocabulary assistant living inside the browser, for Vietnamese beginners (A1–A2).

---

## 0. Scope & Status

**Labels used in this document**

| Label | Meaning |
|-------|---------|
| **[Existing]** | Verified in the current code |
| **[Standard]** | Rule all new UI must follow |
| **[Proposed]** | Design for a component/feature that does not exist yet |

**Existing implementation audit**
- **[Existing]** From the project tree: `src/popup/` contains `App.tsx`, `App.css`, `index.css`, `main.tsx` (Vite template files). `public/` has `favicon.svg`, `icons.svg`. No Tailwind config is visible. Styling is **plain CSS files**. ⚠️ VERIFY: source code was not inspected for this document. Confirm against the repo.
- **[Existing]** No feature UI is implemented yet (tooltip, vocabulary, flashcards, stats, AI summary). Therefore every component below is **[Standard]** (rules) or **[Proposed]** (design). Nothing here claims the current UI already complies.
- **[Existing → to replace]** Vite template CSS (`App.css`, `index.css`, `prefers-color-scheme` defaults, template colors) must be replaced by the tokens in §3 when the popup is first built.

**Theme support**
- **[Standard]** Light theme is the baseline and ships first.
- **[Proposed]** Dark theme: required by [PRD.md](./PRD.md) FR-09 (`theme: system | light | dark`). Tokens are defined in §3.2, but dark mode must be implemented only after the light theme is stable. Do not ship half-themed screens.

---

## 1. Design Principles

1. **The page being read is the product.** The tooltip must never hide the sentence it translates. Place it beside/below the selection, cap its size (§8), no overlays or dimming.
2. **Compact by default, expand on demand.** Show headword, one meaning, phonetic. Everything else (more text, examples, AI) sits behind an explicit action. Example: translation clamps at 4 lines with "Xem thêm".
3. **One primary action per surface.** Tooltip → `Lưu`. Popup → `Ôn tập`. Flashcard front → `Hiện đáp án`. Only that button is solid; everything else is secondary or ghost.
4. **Color carries meaning, never decoration.** Color is used for state only: saved word (marker yellow), due review (terracotta), AI (slate green), errors (red). Neutral UI uses ink and paper tones.
5. **Structure with space and hairlines, not boxes.** Group with spacing and 1px dividers. Do not wrap sections in cards. Cards are allowed only for the flashcard and the tooltip.
6. **Same action, same behavior everywhere.** Save is always optimistic with the same label swap. Delete always uses undo. Esc always closes the topmost layer.
7. **Never fight the host page.** All injected UI lives in Shadow DOM, uses `px` units, and does not steal focus or selection.
8. **Fast feedback beats animation.** Response within 100 ms of an interaction. Motion only for opacity, ≤ 120 ms.

---

## 2. Visual Identity

**Direction: "annotated reading".** The UI borrows from a well-set book page marked up with a highlighter and pencil: warm paper, ink-dark text, thin rules, one serif for English headwords, and a marker-yellow highlight for vocabulary.

**It should feel:** calm, precise, quiet, a little editorial, like a good dictionary margin note.

**It should NOT look like:** a SaaS dashboard, a chat app, a gradient-heavy "AI" product, or a floating widget that dominates the page.

| Generic AI-style pattern | What we do instead |
|--------------------------|--------------------|
| Blue/purple gradient primary | Near-black ink primary button, flat |
| White cards with big shadows | Rows separated by hairlines, 2 shadow levels only |
| Pill buttons and 16px+ radii | 4 / 6 / 10 px radius, pills only for toggles |
| Sans-serif everywhere | Serif for English headwords (reading feel), sans for UI |
| Emoji and illustration in empty states | One clear sentence + one action |
| Sparkle icon for AI | Plain label "Tóm tắt" with slate-green tag |

**Signature elements (keep these consistent)**
1. **Marker highlight:** vocabulary words in context sentences get a soft yellow background (`--color-vocab-bg`), like a highlighter stroke.
2. **Serif headword:** English word in tooltip and flashcard.
3. **Paper background** (`#F7F5F0`) with ink text instead of pure white/black.
4. **Interval hints:** rating buttons show the next interval ("3 ngày"), a functional detail that signals quality.

---

## 3. Color Tokens

### 3.1 Light theme **[Standard]**

```css
:root,
:host {
  /* Surfaces */
  --color-background: #F7F5F0;        /* popup/page base, warm paper reduces glare vs pure white */
  --color-surface: #FFFFFF;           /* inputs, flashcard */
  --color-surface-elevated: #FFFFFF;  /* tooltip, menus, toast (separated by border + shadow) */
  --color-surface-sunken: #EFECE5;    /* hover fill, skeleton base, disabled fill */

  /* Text */
  --color-text-primary: #1C1B19;      /* ≈ 16:1 on background */
  --color-text-secondary: #4A4741;    /* ≈ 8:1 */
  --color-text-muted: #6F6B63;        /* ≈ 4.8:1 on background. Smallest allowed text color */
  --color-text-on-primary: #F7F5F0;

  /* Borders */
  --color-border: #DDD8CE;            /* dividers, decorative separators */
  --color-border-strong: #8C867A;     /* input and button outlines (≥ 3:1 for UI boundaries) */
  --color-focus: #2B5C8A;             /* focus ring */

  /* Actions */
  --color-primary: #1C1B19;           /* ink: the single primary action color */
  --color-primary-hover: #36332E;
  --color-primary-active: #4A4741;

  /* Status (text/icon color + soft background) */
  --color-success: #286B42;   --color-success-bg: #E3F1E8;
  --color-warning: #8A5A00;   --color-warning-bg: #FBEFD2;
  --color-error:   #B3261E;   --color-error-bg:   #FBE4E1;
  --color-info:    #2B5C8A;   --color-info-bg:    #E4EDF6;

  /* Domain states */
  --color-vocab: #7A5C00;     --color-vocab-bg: #FBF1C7;   --color-vocab-mark: #F6DC6A;
  --color-review: #9A4A22;    --color-review-bg: #F8E9E0;
  --color-ai: #3F5B52;        --color-ai-bg: #E6EEEA;
}
```

> Contrast values are approximate. Re-verify every text/background pair with a contrast checker before release.

### 3.2 Dark theme **[Proposed]** (implement after light is stable)

```css
:root[data-theme='dark'] {
  --color-background: #161512;  --color-surface: #1E1D1A;  --color-surface-elevated: #26241F;  --color-surface-sunken: #2C2A25;
  --color-text-primary: #F1EEE8; --color-text-secondary: #C4BFB4; --color-text-muted: #9A958A; --color-text-on-primary: #161512;
  --color-border: #34312B;  --color-border-strong: #7A756A;  --color-focus: #7FB0E0;
  --color-primary: #F1EEE8; --color-primary-hover: #DAD6CC; --color-primary-active: #C4BFB4;
  --color-success: #6CC08B; --color-success-bg: #1B2E22;
  --color-warning: #E0B04A; --color-warning-bg: #332A14;
  --color-error:   #F08A80; --color-error-bg:   #3A1E1B;
  --color-info:    #7FB0E0; --color-info-bg:    #1B2B3A;
  --color-vocab: #F2D96B;   --color-vocab-bg: #3A3210; --color-vocab-mark: #7A6A1E;
  --color-review: #E8A07A;  --color-review-bg: #3A241A;
  --color-ai: #9CC4B2;      --color-ai-bg: #1D2B26;
}
```
- `theme: system` follows `prefers-color-scheme`; the explicit setting sets `data-theme` on the root (or the Shadow DOM host).
- The tooltip follows the **user's extension theme**, never the host page's theme (host themes cannot be detected reliably).

### 3.3 Why these colors

| Token | Functional reason |
|-------|-------------------|
| `primary` = ink | Distinct from every status color, so primary action is never confused with success/info. Looks editorial, not "SaaS blue". |
| `vocab` yellow | Mirrors a physical highlighter. Instantly means "this is a word I saved". Used for the saved state and the mark in context sentences. |
| `review` terracotta | Warm, urgent without alarm. Marks "due today". Kept away from `error` red. |
| `ai` slate green | Signals "generated content" without the clichéd purple/sparkle. Used only on AI tags and the summary block. |
| `info` blue | Used only for focus ring and informational notices. Not a brand color. |
| `border` vs `border-strong` | Decorative dividers can be faint; interactive boundaries must reach 3:1 contrast. |

### 3.4 Usage rules
- Components use **semantic tokens only**. No raw hex in component CSS.
- `vocab` and `warning` are both yellow-ish: `vocab` is used for marks/saved chips only, `warning` always comes with an icon and text.
- Never rely on color alone: pair with text or icon (e.g., "Đến hạn" label, not just a terracotta dot).
- No gradients anywhere.

---

## 4. Typography

**Fonts (system stacks, no web fonts)** **[Standard]**
```css
--font-sans: system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans', 'Helvetica Neue', Arial, sans-serif;
--font-serif: 'Iowan Old Style', Charter, Georgia, 'Times New Roman', serif;
--font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; /* keyboard hints only */
```
Reasons: zero load time, works offline, no font files to declare in `web_accessible_resources`, no CSP/privacy issue, and native fonts render Vietnamese diacritics and IPA symbols well.

**Scale** (all in `px`, see §16 for why)

| Token | Size / line | Weight | Font | Use |
|-------|-------------|--------|------|-----|
| `--text-display` | 28 / 34 | 600 | serif | Flashcard headword only |
| `--text-lead` | 18 / 26 | 600 | sans | Flashcard translation |
| `--text-title` (page title) | 16 / 24 | 600 | sans | Popup header, full-tab page titles |
| `--text-section` | 13 / 20 | 600 | sans, `text-secondary` | Section headings ("Hôm nay", "Từ gần đây") |
| `--text-body` | 14 / 21 | 400 | sans | Default text, list word, translation |
| `--text-secondary` | 13 / 20 | 400 | sans, `text-secondary` | Translation in lists, helper text |
| `--text-caption` | 12 / 18 | 400 | sans, `text-muted` | Phonetic, POS, timestamps, hints |
| `--text-tooltip` | 14 / 20 | 400 | sans | Tooltip translation |
| `--text-tooltip-word` | 15 / 22 | 600 | serif | Tooltip headword |

**Rules**
- Weights allowed: **400, 500 (buttons/labels), 600 (titles/headwords)**. No 700+.
- Minimum font size **12 px**. Nothing smaller.
- **Vietnamese needs line-height ≥ 1.4** (stacked diacritics). Never clip single-line Vietnamese with a tight `line-height` + `overflow: hidden`.
- Use `font-variant-numeric: tabular-nums` for stats and progress (`3 / 10`). Do not set numbers in the serif font.
- Letter-spacing: only `display` uses `-0.01em`. Everything else `0`.
- No uppercase text transforms, no italics except part-of-speech abbreviations (`adj.`).
- Mark languages: `lang="en"` on English words/sentences and `lang="vi"` on Vietnamese UI (screen reader pronunciation).

---

## 5. Spacing Tokens

Base unit 4 px. Use only these values.

| Token | px | Use |
|-------|----|-----|
| `--space-1` | 4 | Icon↔label gap, lines inside a text group (word + phonetic) |
| `--space-2` | 8 | Gap between related elements, tooltip offset from selection, gap between buttons |
| `--space-3` | 12 | Tooltip padding, list item vertical padding, button horizontal padding |
| `--space-4` | 16 | Popup padding, gap between sections inside a surface |
| `--space-6` | 24 | Gap between page sections (full-tab pages), flashcard content gaps |
| `--space-8` | 32 | Flashcard padding, page top padding (full-tab pages) |
| `--space-12` | 48 | Full-tab pages only: vertical rhythm around the flashcard |
| `--space-16` | 64 | Full-tab pages only: outer margins |

Rules: no `5px`, `10px`, `14px`. If a design needs a value outside the scale, adjust the layout, not the scale. Padding inside components uses tokens; no per-component spacing constants.

---

## 6. Border Radius

| Token | px | Use | Do NOT use for |
|-------|----|-----|----------------|
| `--radius-sm` | 4 | Tags, `kbd` hints, list-row hover fill, skeleton lines, marker highlight | Buttons, inputs |
| `--radius-md` | 6 | Buttons, inputs, tooltip, toast, menus | Large containers |
| `--radius-lg` | 10 | Flashcard, dialogs | Anything in the popup list |
| `--radius-full` | 999 | Toggle switch, progress bar ends, round count dot | Buttons, tags, cards |

The popup window itself has no radius (browser controls it).

---

## 7. Borders and Shadows

- **Border:** `1px solid var(--color-border)` for dividers/surfaces; `1px solid var(--color-border-strong)` for inputs and secondary buttons. Never 2px borders except the focus ring.
- **Dividers:** between list rows and between popup sections (full width, `--color-border`). No dividers inside a row.
- **Focus ring:** `outline: 2px solid var(--color-focus); outline-offset: 2px;` on `:focus-visible` only.

| Shadow | Value | Use |
|--------|-------|-----|
| none | n/a | Popup content, lists, buttons, flashcard (uses border) |
| `--shadow-1` | `0 1px 2px rgba(28,27,25,.08), 0 4px 12px rgba(28,27,25,.10)` | Selection tooltip, toast, menus (always with a 1px border) |
| `--shadow-2` | `0 8px 24px rgba(28,27,25,.16)` | Dialogs only |

The tooltip always has **border + shadow-1**. The border keeps it legible on dark host pages where the shadow disappears.

---

## 8. Layout and Dimensions

| Item | Value | Why |
|------|-------|-----|
| Popup width | **360 px** fixed | Chrome allows 25–800 px. 360 fits "word + translation" on one line and is a common comfortable width |
| Popup height | min 240, **max 560 px** (Chrome max is 600) | Content scrolls inside the list, header and CTA stay visible |
| Popup padding | 16 px (`space-4`) | |
| Section gap (popup) | 16 px; dividers between sections | |
| Full-tab page max width | 720 px (options), flashcard page centered | Readable line length |
| Full-tab page padding | 24 px sides, 32 px top | |
| Header height | **48 px** (popup) | |
| List item (popup) | min **56 px** (word + translation on 2 lines) | Scannable, fits 5 rows without scroll in 560 px |
| List item (full list) | min 64 px (adds example sentence) | |
| Button height | **sm 28 · md 32 (default) · lg 40** (only popup CTA, flashcard actions) | |
| Icon button | 32 × 32 hit area, 16 px icon | Hit area ≥ 24 px (WCAG 2.2), comfortable for mouse |
| Input height | **32 px** | Matches button for inline search + button rows |
| Tooltip | width fit-content, **min 160, max 320 px**, padding 12, internal gap 8 | Compact; 320 fits ~35 Vietnamese characters per line |
| Tooltip max height | 220 px (translation scrolls after 160) | Never cover large page areas |
| Tooltip offset | 8 px from selection rect; 8 px min from viewport edge | |
| Flashcard | width `min(560px, 100% − 32px)`, min-height 280 px, padding 32 | Large enough for a word + sentence, small enough to feel like one card |
| Toast | max 320 px, bottom of popup, 16 px from edges | |

---

## 9. Component Design

### 9.1 Selection Tooltip **[Proposed]**
- **Purpose:** instant meaning of the highlighted word without leaving the page; save in one click.
- **Layout**
```
┌──────────────────────────────┐
│ ubiquitous               [spk]│  headword (serif 15/22) + optional pronounce button (P1)
│ /juːˈbɪkwɪtəs/ · adj.         │  caption, muted
│ có mặt ở khắp nơi             │  tooltip text 14/20
│ [ Lưu ]  [ Tóm tắt ]          │  actions (Tóm tắt only if AI enabled)
└──────────────────────────────┘
```
- **Positioning:** `position: fixed` inside a Shadow DOM host. Anchor to the **last line rect** of the selection (`range.getClientRects()`), default **below-start** with 8 px gap. Flip above if there is not enough space below. Clamp horizontally 8 px from viewport edges. Recompute on scroll, resize, and tooltip size change (`ResizeObserver`). Hide when the selection leaves the viewport.
- **Appearance:** `surface-elevated`, 1px `border`, `radius-md`, `shadow-1`, padding `space-3`.
- **Open timing:** after selection ends (`mouseup`/`keyup`), debounce 120 ms. Fade in 100 ms (opacity only, no slide/scale).
- **Interaction:** the tooltip never takes focus or clears the page selection (buttons use `mousedown → preventDefault`).
- **Actions:** `Lưu` = primary (sm button). `Tóm tắt` = ghost with `ai` tag color. Saved state: button becomes non-interactive chip "Đã lưu" with check icon on `vocab-bg`.
- **Hover:** buttons per §9.5. Tooltip body has no hover effect.
- **Focus:** buttons show the focus ring. Because the tooltip is mounted at the end of the document, keyboard access uses a shortcut that moves focus into it (**[Proposed]**, PRD FR-15). Until then the tooltip is mouse-first; document this limitation.
- **Loading:** see §10 (no content for 150 ms, then 2 skeleton lines; width reserved).
- **Error:** inline replacement of the translation line (§12). Buttons for `Thử lại` only when `retryable`.
- **Long word:** headword wraps with `overflow-wrap: anywhere`, max 2 lines.
- **Long translation:** clamp to 4 lines, then `Xem thêm` (ghost, sm) expands to a scroll area (max 160 px).
- **Multiple selected words:** 1–5 words (≤ 100 chars) are shown as one phrase headword. Over the limit → hint state: "Chọn tối đa 5 từ để tra." (+ `Tóm tắt` if AI is enabled).
- **Close:** outside click, `Esc`, or new selection. Not on scroll.
- **Not shown:** inside `input`, `textarea`, `contenteditable`.

### 9.2 Extension Popup **[Proposed]**
```
┌────────────────────────────────────┐ 360 px
│ English Reading Assistant      [⚙] │ 48 px header
├────────────────────────────────────┤
│ Hôm nay                            │ section title
│ 12 tra · 5 lưu · 8 ôn · 3 ngày liên tiếp │ one-line stats (tabular nums)
│ [        Ôn tập · 8 thẻ          ] │ lg primary, full width
├────────────────────────────────────┤
│ Từ gần đây          [ Tìm từ…    ] │ search appears when ≥ 6 words
│ ubiquitous    có mặt ở khắp nơi    │ rows, 56 px
│ …                                  │ scrolls
└────────────────────────────────────┘
```
- **Header:** product name (`text-title`) left, settings icon button right. No logo block, no tabs.
- **Navigation depth:** zero. Settings opens the options page; "Xem tất cả" (ghost link) opens the full vocabulary list.
- **Primary action:** `Ôn tập · N thẻ`. When N = 0 it becomes secondary and reads "Hôm nay đã xong". Never hide it.
- **Scrolling:** only the word list scrolls. Header and the Today block stay fixed when popup height is limited.
- **Density:** 5 word rows visible without scrolling. No footer.

### 9.3 Vocabulary Item **[Proposed]**
- **Structure (row, not card):** line 1 `word` (`text-body`, 600) + caption `adj.`; line 2 translation (`text-secondary`); optional line 3 example sentence (`caption`, 1 line in popup, 2 in full list) with the word marked by `--color-vocab-mark` at `radius-sm`.
- **Review marker:** if due, show text tag "Đến hạn" in `review` colors at the right (text, not a dot only).
- **Actions:** `Xóa` icon button (ghost) and, in the full list, a pronounce button. Hidden until row hover or `:focus-within`, but **always in the DOM and focusable**.
- **Hover:** background `surface-sunken`, `radius-sm`. **Focus:** focus ring on the row's main button.
- **Delete:** immediate remove + undo toast (§15). No confirm dialog.
- **Click on row:** expands inline to show example and actions (no navigation).

### 9.4 Flashcard **[Proposed]**
```
 Thẻ 3 / 10  ─────────────  (2px progress line)
┌────────────────────────────────────┐
│            ubiquitous              │ display, serif
│  "Smartphones are [ubiquitous]."   │ context, marker on word
│                                    │
│        [   Hiện đáp án   ]         │ lg primary (Space)
└────────────────────────────────────┘
```
- **Front:** headword (`display`), context sentence (`body`, secondary) with the word marked. Single primary button `Hiện đáp án`.
- **Back:** same headword smaller (`text-title`), phonetic, translation (`text-lead`), context stays. Replace the primary button with 3 rating buttons (secondary, lg), each with a caption under the label:

| Label (vi) | Rating | Key | Hint caption |
|------------|--------|-----|--------------|
| Chưa nhớ | `again` | `1` | "1 ngày" |
| Nhớ | `good` | `2` | "3 ngày" |
| Dễ | `easy` | `3` | "7 ngày" |

  (Captions come from the SRS ladder for the card's current step. PRD "known/unknown" = `good`/`again`.)
- **Reveal:** instant, no flip animation (reduced-motion safe; faster). Focus moves to the first rating button; the answer is announced via `aria-live="polite"`.
- **Navigation:** auto-advance after rating. `Esc` or "Kết thúc" link ends the session. No back navigation (keeps the algorithm honest).
- **Progress:** text `3 / 10` (tabular nums) + 2 px line at the top of the card area (`--color-primary` on `--color-border`).
- **Keyboard:** `Space` reveal, `1/2/3` rate, `Esc` end. Hints rendered as `kbd` tags in captions.
- **Loading:** card skeleton. **Completion:** summary (cards reviewed, correct %, next due) + button `Xong` (§11).

### 9.5 Buttons **[Standard]**

| Variant | Look | Use |
|---------|------|-----|
| **Primary** | `primary` fill, `text-on-primary`, no border | The one main action per surface |
| **Secondary** | `surface` fill, `border-strong` outline, `text-primary` | Alternative actions, rating buttons |
| **Ghost** | transparent, `text-secondary`; hover `surface-sunken` | Tertiary, row actions, `Xem thêm` |
| **Destructive** | like Secondary with `error` text and `error` border; solid `error` only inside an inline confirm | Reset data, delete all |
| **Icon button** | Ghost, 32×32, 16 px icon, `aria-label` required | Settings, delete, pronounce, close |

- Sizes: sm 28 / md 32 / lg 40. Radius `md`. Weight 500. Padding-x `space-3`.
- States: hover = `primary-hover` / `surface-sunken`; active = `primary-active`; disabled = `surface-sunken` fill + `text-muted` (still readable); loading (§10).
- Do not add more variants (no "link", "outline-primary", "soft").

### 9.6 Hint Tooltip (for icon buttons) **[Standard]**
- **Use:** icon-only buttons (settings, pronounce, delete) to reveal their name and shortcut.
- **Do NOT use for:** essential information, errors, long text, anything needed to complete a task.
- **Placement:** above the element; flip below near the top edge. **Delay:** 400 ms show, 0 ms hide, show immediately on keyboard focus.
- **Style:** `primary` background, `text-on-primary`, `text-caption`, `radius-sm`, padding `space-1 space-2`, max width 220 px, wraps normally.
- `aria-label` stays on the button; the hint is `aria-hidden`.

### 9.7 Input / Search **[Standard]**
- **Height 32**, `surface`, 1px `border-strong`, `radius-md`, padding-x `space-3`, text `body`.
- **Placeholder:** `text-muted`, describes the action ("Tìm từ…"), never replaces a label.
- **Focus:** focus ring (2 px) and border color `primary`.
- **Error:** border `error`, message below in `caption` + `error` color with icon; `aria-invalid="true"` and `aria-describedby`.
- **Search specifics:** clear (×) icon button when non-empty; filter as you type with 150 ms debounce; empty result per §11.
- **Disabled:** `surface-sunken`, `text-muted`.

---

## 10. UI States

### 10.1 State matrix **[Standard]**

| State | User sees | Allowed interaction | Must NOT |
|-------|-----------|---------------------|----------|
| **Default** | Normal styles | All | n/a |
| **Hover** | `surface-sunken` fill or `primary-hover` | Click | Be the only way to reach an action (keyboard/touch parity) |
| **Focus** | 2px focus ring (`:focus-visible`) | Keyboard activation | Be removed or hidden by `outline: none` |
| **Active** | `primary-active` / pressed fill, no scale | Release to trigger | Animate size or bounce |
| **Disabled** | Muted fill + text, `cursor: not-allowed` | None (but explain why in nearby text or `title` if non-obvious) | Be invisible or low contrast; use opacity < 0.5 |
| **Loading** | See §10.2 | Cancel where it takes > 3 s | Block the whole UI or shift layout |
| **Skeleton** | Gray (`surface-sunken`) bars matching final layout | None | Animate faster than 1.2 s per cycle; stay > 5 s without an error/timeout |
| **Empty** | One headline + one action (§11) | The suggested action | Show an empty table/list frame |
| **Error** | Inline message + action (§12) | Retry / fix | Show raw error text or status codes |
| **Success** | Immediate label change ("Đã lưu"), check icon | Continue | Show a modal or a toast for routine success |
| **Offline / API unavailable** | Inline note in the affected area: "Không có kết nối. Từ đã lưu vẫn dùng được." | Everything local | Disable local features (list, flashcards, stats) |
| **Partial data** | Show what exists (e.g., translation without phonetic) | All | Show empty placeholders ("—", "N/A") for missing optional fields; hide the field instead |

### 10.2 Which loading pattern?

| Where | Pattern | Detail |
|-------|---------|--------|
| Tooltip translation | **Inline skeleton**, only after 150 ms | 2 lines, width reserved. No spinner. Cached results never show loading |
| Save button | **Button loading** | Icon swapped for a 14 px spinner, label stays, button `aria-busy="true"`. Usually < 50 ms, so use optimistic UI instead (§15) |
| Vocabulary list (first load) | **Skeleton rows** (3) | Same 56 px height as rows |
| Flashcard session start | **Card skeleton** | Same size as the card |
| Stats | **Skeleton** for numbers (fixed width) | |
| AI summary (up to 30 s) | **Inline progress**: text "Đang tóm tắt…" + indeterminate 2 px line + `Hủy` button | Spinner alone is not enough for long waits |
| Import / export | **Button loading + status text** | |

Spinner: only inside buttons and nowhere else. Never a full-screen or full-popup spinner.

---

## 11. Empty States **[Proposed]**

Format: **what happened → why it matters → next action.** Text only, no illustration. Copy below is `vi` (keys in `locales/vi.ts`, `en` mirrors).

| Situation | Headline | Explanation | Action |
|-----------|----------|-------------|--------|
| No saved vocabulary | Chưa có từ nào | Bôi đen một từ trên trang web và nhấn Lưu để bắt đầu học. | none (instruction is the action) |
| No review cards (nothing due) | Hôm nay đã xong | Thẻ tiếp theo sẽ đến hạn vào ngày mai. | `Xem danh sách từ` (secondary) |
| No review cards (no words at all) | Chưa có thẻ để ôn | Lưu một vài từ trước, rồi quay lại đây. | none |
| No statistics | Chưa có hoạt động hôm nay | Tra hoặc ôn một từ để bắt đầu chuỗi ngày học. | `Ôn tập` if cards due |
| No search results | Không tìm thấy "{query}" | Thử từ khác hoặc xóa bộ lọc. | `Xóa tìm kiếm` (ghost) |
| No AI summary | Chưa có bản tóm tắt | Bôi đen đoạn văn và nhấn Tóm tắt. | `Bật tính năng AI` if disabled |
| First-time user (popup) | Bắt đầu trong 3 bước | 1. Bôi đen một từ  2. Nhấn Lưu  3. Quay lại ôn mỗi ngày | `Thử với câu ví dụ` (opens demo page, PRD FR-12) |

Style: headline `text-body` 600, explanation `text-secondary`, left-aligned in the content area, `space-6` top padding. No icons unless the action needs one.

---

## 12. Error States **[Standard]**

**Rules**
- Pattern: **what happened + what to do**, ≤ 80 characters when possible.
- Never show raw API text, status codes, or stack traces. Map from `error.code` ([API-CONTRACTS.md](./API-CONTRACTS.md) §4) to i18n key `errors.<CODE>`.
- Show errors **where the action happened** (inline), with `role="alert"` for blocking errors and `role="status"` for soft notices.
- Style: `error-bg` background, `error` text and icon, `radius-sm`, padding `space-2 space-3`. Warnings use `warning`, info uses `info`.
- Offer `Thử lại` only if `retryable`.

| Case | Code | Message (vi) | Action |
|------|------|--------------|--------|
| Translation failure | `PROVIDER_ERROR` | Không dịch được lúc này. | Thử lại |
| Network failure | `NETWORK_ERROR` | Không có kết nối mạng. | Thử lại |
| Timeout | `TIMEOUT` | Mất quá nhiều thời gian. | Thử lại |
| Rate limit | `RATE_LIMITED` | Bạn tra quá nhanh. Chờ vài giây rồi thử lại. | Thử lại (disabled for 5 s) |
| AI not set up | `AI_NOT_CONFIGURED` | Chưa bật tính năng tóm tắt. | Mở cài đặt |
| AI key invalid | `AUTH_ERROR` | Khóa API không hợp lệ. | Mở cài đặt |
| AI failure | `PROVIDER_ERROR` | Không tóm tắt được. Phần còn lại vẫn dùng bình thường. | Thử lại |
| Storage failure | `STORAGE_ERROR` | Không lưu được. Thử lại nhé. | Thử lại |
| Storage full | `STORAGE_QUOTA_EXCEEDED` | Bộ nhớ đã đầy. | Xuất dữ liệu |
| Invalid input | `VALIDATION_ERROR` | Chọn tối đa 5 từ (100 ký tự). | none |
| Stale page | `CONTEXT_INVALIDATED` | (nothing shown) tooltip hides silently | none |

---

## 13. Responsive / Adaptive Behavior

| Situation | Behavior |
|-----------|----------|
| Popup has limited height | Max 560 px. Header and "Hôm nay" block stay fixed; only the word list scrolls. Search is sticky above the list. |
| Translation very long | Clamp 4 lines + `Xem thêm`; expanded area scrolls (max 160 px). Never grow the tooltip beyond 220 px. |
| Long sentence selected | Over 5 words / 100 chars → hint state, no API call. (Sentence translation is backlog FR-14.) |
| Browser zoom 50–200% | All sizes in `px` scale with page zoom. Tooltip `max-width: min(320px, 100vw − 16px)`. Popup content reflows without horizontal scroll at 200%. |
| Host page unusual styles | Shadow DOM + `:host { all: initial }`, explicit `font`, `color`, `line-height`, `box-sizing`. No `rem`/`em` that inherit from the host. Mount on `document.documentElement` to avoid ancestors with `transform` breaking `position: fixed`. |
| Tooltip near viewport edge | Flip above/below, clamp 8 px from left/right. If neither fits (tiny viewport), pin to the bottom, centered, full available width. |
| Selection inside iframe | Content script runs in the top frame only. ⚠️ VERIFY `all_frames` decision. |
| RTL pages | Anchor logic uses viewport coordinates, so it is direction-independent. UI text stays LTR. |

---

## 14. Accessibility **[Standard]**

- **Contrast:** text ≥ 4.5:1 (≥ 3:1 for ≥ 18 px/600 text); UI boundaries and focus ring ≥ 3:1. Placeholder and `text-muted` must still meet 4.5:1.
- **Keyboard:** every action reachable by keyboard. Logical tab order. No keyboard traps; `Esc` closes the topmost layer.
- **Focus visibility:** 2 px ring, 2 px offset, on `:focus-visible`. Never `outline: none` without replacement.
- **ARIA**
  - Tooltip result region: `role="status"` + `aria-live="polite"` (does not interrupt page reading); error: `role="alert"`.
  - Icon buttons: `aria-label`. Toggle/saved state: `aria-pressed` or disabled with a clear label.
  - Lists: real `<ul>/<li>`. Progress: `role="progressbar"` with `aria-valuenow/min/max`.
  - Flashcard reveal: announce the answer via live region and move focus to the first rating button.
- **Language attributes:** `lang="en"` on English text, `lang="vi"` on UI text.
- **Reduced motion:** honor `prefers-reduced-motion`: remove fades and the skeleton shimmer (static fill).
- **Targets:** interactive hit area ≥ 32×32 (never below 24×24). Spacing ≥ 8 px between adjacent targets.
- **Never** convey state by color alone.
- **Screen readers on host pages:** the tooltip must not announce itself aggressively; use `polite` only.

---

## 15. Interaction Patterns **[Standard]**

| Pattern | Rule |
|---------|------|
| **Hover** | Cosmetic only; reveals secondary actions that are also reachable via focus |
| **Click** | Triggers on `click` (not `mousedown`), except the tooltip, which prevents default on `mousedown` to keep the selection |
| **Focus** | Keyboard focus shows the ring. The tooltip never auto-focuses |
| **Keyboard shortcuts** | Flashcards: `Space`, `1/2/3`, `Esc`. Popup: `/` focuses search ([Proposed]). Global shortcuts via `commands` are backlog (FR-15). Show hints as `kbd` |
| **Outside click** | Closes the selection tooltip only. Popup and dialogs do not close on outside click except the popup by the browser |
| **Escape** | Closes the topmost layer: hint tooltip → expanded row → selection tooltip → flashcard session (with confirm if cards remain) |
| **Toast** | Only for outcomes whose UI is gone (delete → undo). One at a time, bottom of popup, 5 s, `role="status"`. No toast for routine success |
| **Confirmation** | Inline: the button turns into `Xóa?` `[Xóa] [Hủy]` for 4 s. Modal dialog only for "Reset all data" (requires explicit confirm) |
| **Copy** | Icon button; on click the label swaps to "Đã chép" for 1.5 s, then reverts |
| **Save** | Optimistic: button shows "Đã lưu" instantly. On failure revert and show inline error |
| **Undo** | Delete is soft: remove from the list immediately, commit after the 5 s undo window |

---

## 16. CSS Implementation Rules

**Existing convention [Existing]:** plain CSS files per entry (`App.css`, `index.css`). ⚠️ VERIFY: Tailwind not detected.

**Recommended standard [Standard]**
1. **Tokens in one file:** `src/shared/ui/tokens.css` (colors, typography, spacing, radius, shadow). Use `:root, :host` selectors so it works in pages and in Shadow DOM.
2. **Component styles:** CSS Modules (`*.module.css`), supported by Vite with no new dependency. Class names describe role (`.row`, `.title`), not appearance.
3. **Reuse primitives** from `src/shared/ui/`: `Button`, `IconButton`, `Input`, `Tag`, `Skeleton`, `Toast`, `Kbd`, `HintTooltip`. Feature-specific components stay in `features/<name>/ui|content`.
4. **No raw values:** colors, spacing, radius, shadows, font sizes must come from tokens. Arbitrary values need a comment explaining why.
5. **No one-off patterns:** if two features need the same pattern, promote it to `shared/ui` instead of copying.
6. **Units:** `px` for everything in injected UI. Pages (popup/options) may use `rem`, but only if root font-size is fixed to 16 px.
7. **No inline styles** except dynamic positioning (tooltip `top/left`).
8. **Icons:** one set, 16 px (inline) / 20 px (large), 1.5 px stroke, `currentColor`. No emoji as icons. ⚠️ VERIFY: pick the library (e.g., `lucide-react`); adding a dependency needs team approval. The current `public/icons.svg` is a Vite template sprite.

**Content script / Shadow DOM [Standard]**
```ts
// content/mount.tsx
import tokens from '@/shared/ui/tokens.css?inline'
import tooltipCss from './tooltip.module.css?inline'

const host = document.createElement('div')
host.setAttribute('data-era-root', '')
const shadow = host.attachShadow({ mode: 'open' })
shadow.innerHTML = `<style>:host{all:initial}${tokens}${tooltipCss}</style><div id="app"></div>`
document.documentElement.appendChild(host)
```
- Host element: `position: fixed; inset: 0 auto auto 0; z-index: 2147483647; pointer-events: none`. Inner tooltip sets `pointer-events: auto`.
- Do not load Google Fonts or any remote CSS.
- Use `:focus-visible`, never rely on host page focus styles.

**If Tailwind is adopted later [Proposed]:** map the tokens in the Tailwind theme (no default palette), forbid arbitrary values (`[13px]`, `#abc`) via lint, and never use rem-based utilities inside Shadow DOM (they inherit the host's root font-size).

---

## 17. Do / Don't

**DO**
- Use ink + paper neutrals; reserve color for state (saved, due, AI, error).
- Create hierarchy with type weight and spacing: title 600 → body 400 → caption muted.
- Use a 1px divider to group rows; leave space between sections.
- Keep one solid button per screen.
- Show the next-interval hint on rating buttons.
- Hide missing optional data (no phonetic → no phonetic row).
- Update UI optimistically, then reconcile.

**DON'T**
- Add gradients, blurs, glows, or glass effects.
- Put cards around every section, or nest cards.
- Round everything: no pill buttons, no radius over 10 px.
- Use emoji, mascots, or illustrations in empty/error states.
- Use more than two shadow levels or shadows on list items.
- Use spinners for page-level loading. Use skeletons.
- Auto-focus or steal selection from the host page.
- Use `rem`/`em` or inherited fonts inside the content script.
- Show "N/A", "—", or "Loading..." placeholders.
- Add a new color, radius, or spacing value without updating this document.

---

## 18. Design Decision Rationale

| Decision | Why |
|----------|-----|
| **Tooltip: small surface, 1px border, light shadow** | It must stay subordinate to the page being read. The border guarantees legibility on dark pages where shadows vanish. |
| **Tooltip never takes focus or selection** | Taking focus scrolls/clears the user's reading context and breaks reading flow. |
| **Show nothing for 150 ms before a skeleton** | Cached/fast results would otherwise flash a skeleton; this avoids flicker and layout shift. |
| **Ink-black primary button** | It cannot be confused with success/info colors and avoids the generic blue/purple look. |
| **Marker yellow for vocabulary** | Matches the real-world highlighter metaphor of vocabulary study; users learn the meaning once. |
| **Serif for English headwords only** | Gives an editorial, reading-oriented identity at almost zero cost. Kept off numbers because serif numerals are inconsistent in system fonts. |
| **System fonts, no web fonts** | Offline, instant, privacy-safe, no extension asset or CSP complications, and strong Vietnamese diacritic support. |
| **`px` units in injected UI** | `rem` inherits the host page's root font-size, which varies wildly across websites. |
| **Rows with hairlines instead of cards** | In a 360 px popup, card padding and margins waste ~30% of the width and slow scanning. |
| **360 px × max 560 px popup** | Fits 5 rows plus header and CTA; stays under Chrome's 600 px limit; scroll is limited to the list. |
| **Undo instead of confirm for delete** | Faster for the common case and recoverable for mistakes; confirm dialogs train users to click through. |
| **Optimistic save** | The write is local and nearly instant; waiting would make the main action feel slow. |
| **Rating buttons show intervals** | Makes the spaced-repetition effect visible to beginners and builds trust in the algorithm. |
| **No flip animation on flashcards** | Faster review pace, accessible, avoids motion issues. |
| **Dark theme postponed** | PRD requires it, but half-done theming is worse than none. Tokens are ready, so adding it later is a config change. |
| **Two shadow levels only** | Prevents depth inflation and keeps visual weight low. |

---

## 19. Open Questions

- [ ] Confirm the current popup/CSS implementation (replace Vite template styles).
- [ ] Confirm whether Tailwind is used; if yes, adapt §16.
- [ ] Choose the icon library and approve the dependency.
- [ ] Confirm the palette with a designer, and verify contrast with a checker.
- [ ] Decide when to ship dark mode (after Phase 2?).
- [ ] Decide the keyboard shortcut to focus the selection tooltip (FR-15).
- [ ] Confirm whether the full vocabulary list is a popup view, options tab, or its own page.
