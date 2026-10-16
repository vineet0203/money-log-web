# Money Log — UI Consistency Rules

**Status:** draft for review · **Date:** 2026-10-15 · **Applies to:** `money-log-web` (`(platform)` app screens; marketing `(root)` pages are exempt where noted)

Companion document: [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md)

This document is **rules, not code.** No component is rewritten here. Implementers apply these when building new screens and when touching old ones.

> This Next.js version has breaking changes from older conventions. Read the relevant guide in `node_modules/next/dist/docs/` before writing frontend code (see `AGENTS.md`).

---

## 0. Why this exists — the current state, measured

A survey of `src/` found:

| Finding | Count |
|---|---|
| Raw `<button>` elements | **205** |
| Uses of the shared `<Button>` component | **63** (imported in 30 files of ~190) |
| Distinct `px-_ py-_` padding pairs on buttons/controls | **15+** — most common: `px-3 py-2` (53), `px-2 py-0.5` (41), `px-3 py-1.5` (33), `px-4 py-2` (30), `px-2.5 py-1` (24) |
| Border-radius values in use | **7** — `rounded-xl` (257), `rounded-lg` (245), `rounded-full` (214), `rounded-2xl` (105), `rounded-3xl` (51), `rounded-md` (38), `rounded-sm` (7) |
| Shadow values in use | **7** — `shadow-sm` (155), `shadow-xs` (114), `shadow-md` (25), plus `lg`/`xl`/`2xl` |
| Neutral colour scales mixed | `slate-*` (~1,700 uses) **and** `gray-*` (~80 uses) |
| Brand green as a raw hex literal | **442** occurrences of `#159A1D` |
| Date formats in the same product | `12.12.2023`, `May 19,2025`, and ISO |

**The diagnosis is not chaos — it's a dominant convention plus drift.** `slate`, `rounded-xl`/`rounded-lg`, `shadow-sm`/`shadow-xs`, `gap-2`/`gap-3`/`gap-4` and `#159A1D` are already the de-facto system; they're just applied by hand each time instead of coming from a primitive.

**Notably, the shared `Button` component is itself the outlier.** Its `md` size is `py-3 px-6 text-base` and its neutrals are `gray-*`, which matches almost nothing in the app — most buttons in the codebase are `px-3/px-4 py-2 text-sm` on `slate`. That mismatch is a large part of why people write raw buttons instead: the primitive looks wrong next to everything else. **Fix the primitive to match the dominant reality, then migrate to it** — not the other way round.

---

## 1. First rule: primitives, not hand-rolled markup

If a primitive exists in `components/ui/`, use it. Never hand-roll a styled `<button>`, `<input>`, `<select>`, modal, table or tab strip in a feature file.

**Existing primitives:** `button`, `input`, `otp-input`, `Select`, `DatePicker`, `SingleDatePicker`, `DateRangePicker`, `Modal`, `Menu`, `Tabs`, `DataTable`, `Reveal`, `SubscriptionLogo`.

**Missing primitives that feature code keeps re-implementing** — build these before the next batch of screens:

| Primitive | Replaces today's |
|---|---|
| `ConfirmDialog` | ad-hoc confirm flows and `window.confirm` |
| `Skeleton` | one-off pulse divs and centred spinners |
| `EmptyState` | `p-8 text-center text-slate-500` one-liners |
| `ErrorState` | `p-8 text-center text-red-500` one-liners |
| `PageHeader` | generalise `pos/common/PosPageHeader` for the whole app |
| `StatCard` | one canonical card — `dashboardpage/StatCard`, `PosStatCard` and `DailyExpenseStatCard` are three implementations of one idea |
| `FilterBar` | generalise `pos/common/PosFilterBar` |
| `SearchInput` | generalise `pos/common/PosSearchInput` |
| `StatusBadge` | generalise `pos/common/PosStatusBadge` |
| `Card` / `CardHeader` | the repeated `bg-white border border-slate-200 rounded-xl shadow-sm` block |

**The POS subsystem already has the better pattern.** `components/pos/common/` is the most disciplined part of the codebase. The move is to promote those into `components/ui/` and have personal-finance screens use them too — not to build a parallel set.

**Rule:** a style decision belongs in a primitive. If you are writing the same class string a third time, it's a primitive.

---

## 2. Buttons

### 2.1 Size scale — four sizes, no others

| Size | Padding | Text | Height | Use for |
|---|---|---|---|---|
| `xs` | `px-2 py-1` | `text-xs` | 24px | Badges-with-action, inline table chips, tag removals |
| `sm` | `px-3 py-2` | `text-sm` | 36px | **Table row actions, filter bars, toolbars, modal footers — the workhorse** |
| `md` | `px-4 py-2.5` | `text-sm` | 40px | Page-level primary actions, form submits |
| `lg` | `px-6 py-3` | `text-base` | 48px | Marketing CTAs, auth screens, mobile full-width |

Icon-only buttons are square at the same heights: 24 / 36 / 40 / 48px, `rounded-lg` (or `rounded-full` for avatar-adjacent and close affordances).

**Minimum interactive height is 36px** anywhere a finger might land. The 41 instances of `px-2 py-0.5` are badges, not buttons — if it isn't clickable it's a badge (§6.3) and should not look like a button.

### 2.2 Variants — five, no others

| Variant | Use | Rule |
|---|---|---|
| `primary` | The one main action on the screen | **One per screen region.** Two primaries side by side means neither is primary. |
| `secondary` | Supporting actions | Filled neutral |
| `outline` | Tertiary, cancel, "Back" | |
| `ghost` | Icon buttons, menu triggers, low-emphasis repeats in tables | |
| `danger` | Destructive confirm only | **Missing today** — destructive buttons are currently hand-rolled red. Add it. |

Destructive actions appear as `ghost`/`outline` in menus and lists; the red `danger` fill is reserved for the confirm button inside `ConfirmDialog`. A page full of red buttons teaches people to ignore red.

### 2.3 Button behaviour rules

- **Loading state is part of the primitive**: `loading` prop → spinner replaces the leading icon, label stays, button disables. Never swap the label to "Loading…" (the width jumps).
- **Disabled** needs a reason the user can discover — tooltip or helper text. A dead button with no explanation reads as broken (see §1 of the plan, locked transactions).
- **Icon + label gap** is `gap-2`; icon size follows §8.
- **Full-width** only on mobile, in auth screens, and in modal footers on small viewports. Never full-width on desktop.
- **Order in footers** is the same everywhere: cancel/secondary on the left, primary on the right, `gap-3`. Destructive dialogs keep the same order — the destructive action is on the right, and it is never the default focus.
- **Hover lift** (`hover:-translate-y-0.5`) stays on marketing pages. App buttons change background only. A dashboard where every button jumps is noisy and makes dense tables feel unstable.

### 2.4 Migration

Do not stop to convert 205 buttons. **Strangler approach:** all new code uses the primitive; any screen you touch gets its buttons converted as part of that change. Convert the shared/common components first (tables, modals, headers) since they carry the most screens with them.

---

## 3. Spacing

One scale. **Allowed: `0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12`.** Anything else (`7`, `9`, `11`, arbitrary pixel values) is a mistake.

| Context | Value |
|---|---|
| Page shell padding | `p-4 md:p-6` — pick one and use it in the dashboard layout, not per page. Today pages variously use `p-2 md:p-4`, `p-6`, and nothing. |
| Gap between page sections | `space-y-6` |
| Card padding | `p-5` (compact: `p-4`) |
| Card header → body | `p-5 border-b border-slate-100` then body `p-5` |
| Grid of stat cards | `gap-4` |
| Grid of chart cards | `gap-6` |
| Form fields (vertical) | `space-y-4` |
| Label → input | `mb-1.5` |
| Input → error text | `mt-1` |
| Inline label + icon | `gap-1.5` |
| Button rows / toolbars | `gap-3` |
| Chips and tag lists | `gap-2` |
| Table cell padding | `px-4 py-3` (compact rows `px-3 py-2`) |
| Modal body | `p-6`, footer `px-6 py-4` |

**Rule:** spacing is set by the container, not by the child. No `mt-*` on a component to fix its position inside a parent — fix the parent's `gap`/`space-y`. Margin-based positioning is why spacing is inconsistent to begin with: it only works until the component is reused somewhere else.

---

## 4. Border radius

Seven values are in use; **four are allowed**, assigned by role rather than by taste:

| Role | Radius |
|---|---|
| Controls — buttons, inputs, selects, toolbar items, small icon buttons | `rounded-lg` |
| Containers — cards, panels, modals, tables, dropdowns | `rounded-xl` |
| Pills — badges, chips, avatars, toggles, status dots | `rounded-full` |
| Images and thumbnails | `rounded-lg` |

Retire `rounded-md` and `rounded-sm` entirely. `rounded-2xl` / `rounded-3xl` stay **marketing-only** (`(root)` pages), where the larger radius is part of the visual language.

Nesting rule: an inner element's radius is always smaller than its container's. A `rounded-xl` card holds `rounded-lg` controls. Equal radii at an edge look like a mistake.

---

## 5. Colour

### 5.1 Brand green must become a token

`#159A1D` appears **442 times as a raw hex literal**, while `globals.css` separately defines `--color-brand-green: #1a8f4c` — a *different* green that the app does not use. Two sources of truth, one of them wrong.

**Rule:** define the brand ramp once as CSS custom properties in `globals.css` (`brand` 50→900, with `#159A1D` as the 600/base and `#118018` as the hover step), expose it through Tailwind's `@theme`, and reference it as `bg-brand`, `text-brand`, `ring-brand`. **No new hex literals in `.tsx` files.** Reconcile or remove the unused `--color-brand-green`.

Why it matters beyond tidiness: a brand tweak, a dark mode, or a white-label store theme is currently a 442-site find-and-replace.

### 5.2 One neutral scale: `slate`

`slate-*` dominates (~1,700 uses) and `gray-*` lingers (~80, mostly inside the `Button` and `Input` primitives). **`slate` wins; `gray`, `zinc` and `neutral` are banned.** They look subtly different side by side, which is worse than looking clearly different.

| Role | Token |
|---|---|
| Page background | `bg-slate-50` |
| Surface / card | `bg-white` |
| Hairline border inside cards | `border-slate-100` |
| Border / divider | `border-slate-200` |
| Input border | `border-slate-200`, focus `border-brand` + `ring-brand/20` |
| Primary text | `text-slate-900` |
| Secondary text | `text-slate-600` |
| Muted / meta / placeholder | `text-slate-400` |
| Disabled text | `text-slate-300` |

### 5.3 Semantic colours — fixed meanings

| Meaning | Colour | Used for |
|---|---|---|
| Success / income / positive | `emerald` | Income amounts, completed, paid, in-stock |
| Danger / expense / negative | `red` | Expense amounts, failed, overdue, destructive |
| Warning | `amber` | Due soon, low stock, partial |
| Info / neutral status | `blue` | Draft, pending, informational |

Brand green is **not** the success colour. Using one green for both "this is our brand" and "this number is good" makes every screen read as positive. Keep brand for identity and navigation, `emerald` for positive values.

Status badges derive their colour from this table only, via `StatusBadge` — never a hand-picked `bg-*-50 text-*-700` per screen.

### 5.4 Chart and category colours

One palette, defined once, shared by Recharts series, category dots and account colours. Rules: a category keeps the same colour on every screen; series order is stable so a colour never shifts meaning between two charts on the same page; income/expense comparisons use the semantic pair from §5.3, not two arbitrary palette entries; keep it readable in greyscale (printed receipts and reports exist).

---

## 6. Typography

### 6.1 Scale by role

The survey shows `text-xs` (658) and `text-sm` (374) dominating — this is a dense data app, which is correct. What's missing is role discipline.

| Role | Classes |
|---|---|
| Page title | `text-xl font-bold text-slate-900` |
| Section / card title | `text-base font-semibold text-slate-900` |
| Card subtitle / helper | `text-sm text-slate-500` |
| Body | `text-sm text-slate-700` |
| Field label | `text-sm font-semibold text-slate-600` |
| Table header | `text-xs font-semibold uppercase tracking-wide text-slate-500` |
| Table cell | `text-sm text-slate-700` |
| Meta / timestamp / caption | `text-xs text-slate-400` |
| Metric (stat card number) | `text-2xl font-bold tabular-nums` |
| Large metric (hero stat) | `text-3xl font-bold tabular-nums` |

`text-4xl` and `text-5xl` are marketing-only.

### 6.2 Weights

Four only: `font-normal`, `font-medium`, `font-semibold`, `font-bold`. Labels and table headers are `font-semibold`; numbers that matter are `font-bold`; body is `normal`/`medium`. Note the current `Input` label uses `font-bold text-[#4F627A]` — another stray hex — which should become `font-semibold text-slate-600`.

### 6.3 Badges are not buttons

A badge is `px-2 py-0.5 text-xs font-medium rounded-full` with a semantic colour pair and **no shadow, no hover, no pointer cursor**. The 41 `px-2 py-0.5` instances are mostly badges; make them all use `StatusBadge` so a non-interactive label never looks pressable.

---

## 7. Elevation

| Level | Use |
|---|---|
| `shadow-xs` | Flat surfaces inside an already-elevated container; dense table cards |
| `shadow-sm` | **Default for cards and panels** |
| `shadow-md` | Dropdowns, popovers, menus, hover state of an interactive card |
| `shadow-lg` | Modals and drawers |
| `shadow-xl` / `shadow-2xl` | Marketing only |

Rule: elevation signals **layer**, not importance. A more important card does not get a bigger shadow; it gets a better position. Never stack two shadow levels on nested elements — the inner one reads as a rendering artefact.

---

## 8. Icons

Lucide only. One icon library, no inline SVG one-offs, no emoji in product UI.

| Context | Size | Stroke |
|---|---|---|
| Inside `xs`/`sm` buttons, table cells, badges | 14–16 | 2 |
| Inside `md` buttons, inputs, menu items | 16–18 | 2 |
| Section headers, empty states | 20–24 | 2 |
| Feature illustrations, empty-state hero | 32–40 | 1.5 |

Rules: icon + text gap is `gap-2`; an icon inherits its parent's text colour unless it is itself the semantic signal; `strokeWidth={3}` (currently used in places) is reserved for nothing — drop it; every icon-only button needs an `aria-label` and a tooltip.

---

## 9. Numbers, money and dates

This is the most visible inconsistency in the app today (`12.12.2023` on one screen, `May 19,2025` on another) and the easiest to fix permanently.

**Money**

- One formatter in `lib/`. Every amount on every screen goes through it. No inline `toFixed(2)`, no `'$' +`.
- Currency symbol and code come from settings (`pos_settings` for store screens, user settings for personal finance) — never a hardcoded `$`. Note the current mismatch: POS defaults to `$`/`USD` while the UPI defaults are Indian. Resolve to one default.
- Always `tabular-nums` so columns of figures align.
- Sign and colour: expenses `-₹1,240` in `red`, income `+₹1,240` in `emerald`, neutral totals in `slate-900`. Pick one convention for parentheses-vs-minus and never mix.
- Right-align money in tables, always.

**Dates**

- One formatter, one set of presets: `short` (12 Dec 2023), `long` (12 December 2023), `withTime` (12 Dec 2023, 10:00 AM), `relative` (2 days ago — lists only, never on financial records).
- Use the user's timezone (`users.timezone`) consistently; the backend already stores dates as `YYYY-MM-DD` strings for billing dates, so don't put them through `new Date()` and shift them a day.
- Never `12.12.2023` — ambiguous between day-first and month-first readings.

**Other numbers**

- Quantities use locale grouping; percentages are one decimal; stock quantities drop trailing zeros (`1.5 kg`, not `1.500 kg`).

---

## 10. The four states — mandatory

**Every data surface defines loading, empty, error and loaded.** No exceptions, and this is the single most valuable item on this list.

| State | Rule |
|---|---|
| **Loading** | `Skeleton` matching the final layout's shape and size. No centred spinner on a data page, no layout shift when data arrives. |
| **Empty** | `EmptyState`: icon, one plain sentence, and the action that resolves it. Table headers stay visible; charts keep their axes with a "No data for this period" overlay. |
| **Error** | `ErrorState`: short human message + Retry. Never a raw error object, never a bare red string. |
| **Loaded** | The real thing. **Zero is a valid value** — render a formatted `0`, never a placeholder, never last period's data, never invented rows. |

See §3 of the implementation plan — mock data is being removed precisely so these states carry the weight.

---

## 11. Forms

- Labels above inputs, `font-semibold text-sm text-slate-600`, required marked with a red asterisk (the `Input` primitive already does this — keep it as the only way).
- One error style: `text-sm text-red-500 mt-1` under the field, with `border-red-500` on the input. Never a toast for a field-level validation error.
- Helper text sits under the label, not under the error.
- Validate on blur and on submit; never on every keystroke (except availability checks, debounced).
- Server `400` responses map onto fields via `details[].path` (see plan §5.5); only non-field errors become toasts.
- Submit buttons: `loading` during the request, disabled while invalid **only after the first submit attempt** — a form that starts disabled gives the user nothing to act on.
- Field order matches reading order and never changes between create and edit modes.
- Modals: never nest a modal in a modal. A flow that needs two steps uses steps inside one modal.
- Destructive confirms always name the subject ("Delete *Grocery shopping* (₹1,240)?") and state what else changes ("This also removes the attached receipt").

---

## 12. Tables

`DataTable` only. No hand-rolled `<table>` in feature code.

- Alignment: text left, numbers and money **right**, status badges and actions centred, actions last.
- Column headers follow §6.1. Keep them visible in every state (§10).
- Row height consistent within a table; `px-4 py-3` default.
- One actions pattern: a `Menu` trigger in the last column (the `SubscriptionActionMenu` / `AccountActionMenu` shape). Not inline button rows in one table and menus in another.
- Pagination controls in one place and one style, bottom-right, with a total count. Several hand-styled `px-4 py-2 ... border border-slate-200 rounded-lg` pagination buttons exist today — these become `Button size="sm" variant="outline"`.
- Sticky header on tables taller than the viewport.
- On mobile, a wide table becomes a stacked card list — never a horizontally scrolling financial table with the amount column off-screen.
- Sort, filter and search state live in the URL so a filtered view can be shared and survives a refresh.

---

## 13. Layout patterns

Each pattern has exactly one implementation, promoted from `pos/common/` into `components/ui/`:

1. **Page header** — title, optional subtitle, actions right-aligned. Every `(dashboard)` page starts with it.
2. **Filter bar** — date range, search, selects, in that order; wraps on mobile; `gap-3`.
3. **Stat card row** — `grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4`. Label, metric, optional delta vs previous period. One `StatCard`, not three.
4. **Chart card** — card header with title + optional period selector, fixed aspect ratio body so nothing reflows when data loads.
5. **Table card** — header with title + count, filter bar, table, pagination.
6. **Detail page** — header with back affordance, summary cards, then tabs or sections.

Page composition order is the same everywhere: header → filters → stats → charts → table. Dashboard screens today vary this order; align them as they're touched.

---

## 14. Modals, menus, toasts

**Modals** — three widths only: `sm` (420px, confirms), `md` (640px, forms), `lg` (880px, detail/receipt views). Header `p-5 border-b border-slate-100`, body `p-6` scrollable, footer `px-6 py-4 border-t`. Close on backdrop click and Escape, **except** when a form is dirty, where a confirm is required. Return focus to the trigger on close. Lock background scroll.

**Menus** — `Menu` primitive only, `rounded-xl shadow-md`, items `px-3 py-2 text-sm`, destructive item in `red-600` and last, separated. Keyboard navigable.

**Toasts** (notistack) — success 3s, info 4s, error 6s with a dismiss. One line, no stack traces, sentence case, says what happened and what to do ("Couldn't save the transaction — check your connection and retry"). Never use a toast for a field error (§11) or to confirm something already visible on screen.

---

## 15. Motion

`globals.css` already has a well-built marketing motion system (`reveal`, `ml-*`, with `prefers-reduced-motion` handled). Keep it there.

- **App screens:** 150–200ms, ease-out, on colour, opacity and small transforms only.
- **No** hover lift, sheen, float, blob or gradient-pan inside `(platform)`. Those belong to `(root)`.
- Skeleton pulse is the only looping animation allowed in the app.
- Respect `prefers-reduced-motion` for anything new — the existing block in `globals.css` is the pattern to extend.

---

## 16. Responsive

Breakpoints: `sm` 640, `md` 768, `lg` 1024, `xl` 1280. Design at 1440 and verify at 375.

- Stat rows: 1 → 2 (`sm`) → 4 (`xl`) columns.
- Chart pairs: stacked → side by side at `lg`.
- Tables → stacked cards below `md` (§12).
- Sidebar: persistent at `lg`, drawer below.
- Modals: full-screen sheets below `sm`.
- Filter bars wrap; they never scroll horizontally.
- Minimum touch target 40px on mobile, 36px on desktop.

---

## 17. Accessibility minimums

Not a separate project — the floor for every screen:

- Visible focus ring on every interactive element: `focus-visible:ring-2 ring-brand ring-offset-2`. Never remove outlines without a replacement.
- Every icon-only button has an `aria-label`.
- Every input has a real `<label>` tied by `id` (the `Input` primitive does this — it's why feature code must use it).
- Body text meets 4.5:1 contrast. `text-slate-400` on white is **below** that — it is for decorative meta only, never for content a user must read.
- Colour is never the only signal: pair it with a sign, an icon or a word (red/green amounts also carry `+`/`-`).
- Modals trap focus and restore it on close.
- Full keyboard reachability for tables, menus and forms.

---

## 18. Dark mode

The app is **light-only** today, and `globals.css` says so explicitly (the `prefers-color-scheme` block deliberately keeps light values). 

**Rule:** do not scatter speculative `dark:` classes. They are untested, inconsistent, and create the impression of a half-built feature. When dark mode is actually scheduled, the §5 token work is the prerequisite — which is the main reason to do §5 properly now.

---

## 19. Enforcement

**PR checklist** (add to the pull-request template):

- [ ] No new hex colour literals in `.tsx` — brand and semantic tokens only
- [ ] No new raw `<button>` where `Button` would do
- [ ] No `gray-*` / `zinc-*` / `neutral-*` — `slate` only
- [ ] Spacing, radius and shadow values come from the allowed sets (§3, §4, §7)
- [ ] All four states handled: loading, empty, error, loaded (§10)
- [ ] Money and dates go through the shared formatters (§9)
- [ ] Icon-only buttons have `aria-label`; inputs have labels (§17)
- [ ] Any repeated class string extracted to a primitive rather than copied (§1)
- [ ] Touched screen's buttons migrated to the primitive (§2.4)

**Order of work for this document to take effect:**

1. Fix the `Button` primitive to match the dominant conventions (`slate`, `px-3 py-2 text-sm` as `sm`, add `danger`, add `loading`). Until the primitive looks right, nobody will adopt it.
2. Tokenise brand + semantic colours in `globals.css`; stop new hex literals at review.
3. Build the missing primitives from §1 (`ConfirmDialog`, `Skeleton`, `EmptyState`, `ErrorState`, `Card`), promote `pos/common/*` into `ui/`.
4. Add the shared money/date formatters.
5. From then on: new screens are compliant by construction; old screens get converted when touched.

**Do not** schedule a big-bang refactor of all 205 buttons. The strangler approach costs nothing extra and carries no regression risk.

---

## 20. Review questions for any new screen

1. Which existing screen is this most like, and am I using the same patterns it does?
2. Is every style decision here coming from a primitive or a token?
3. What does this look like with zero data? With one row? With 500 rows? With a 12-word category name? With a ₹99,99,999 amount?
4. What does it look like at 375px wide?
5. Can I complete the main action with a keyboard only?
6. Is there exactly one primary button in view?
7. If the request fails, what does the user see and what can they do next?
