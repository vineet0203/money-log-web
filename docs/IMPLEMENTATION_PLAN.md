# Money Log — Implementation Plan

**Status:** draft for review · **Date:** 2026-10-15 · **Scope:** web app + backend only (mobile later)

This is the shared plan for both repos:

- `money-log-web` — Next.js 16 App Router, React 19, TS, Tailwind 4, TanStack Query, RHF + Zod, Recharts
- `money-log-be` — Express 5, MySQL (raw `mysql2`), JWT (cookie for web + Bearer for mobile), Twilio, SendGrid, Expo push, node-cron

Companion document: [`UI_GUIDELINES.md`](./UI_GUIDELINES.md) — UI consistency rules.

> Implementers: this Next.js version has breaking changes from older conventions. Read the relevant guide in `node_modules/next/dist/docs/` before writing frontend code (see `AGENTS.md`).

---

## 0. Locked decisions

These are settled — do not reopen them while executing this plan.

| # | Decision | Consequence |
|---|---|---|
| 1 | **POS and personal finance stay separate.** A sale does not create income; a supplier payment does not create an expense. | No cross-posting code. No `source` discriminator on `transactions`. The two subsystems only share `users` and auth. |
| 2 | **No bank-account linking to transactions, no transfers.** | `transactions` gets no `account_id`. The transfer screen is parked (§3). Account balances stay Plaid-only and informational. |
| 3 | **Single-user tenancy.** One user = one account = their own data = their own store. | Everything stays keyed on `user_id` (§6). No store entity, no staff logins. |
| 4 | **Uploads stay on local disk** for now; S3/GCS later. | Keep all file access behind one boundary so the swap is cheap (§7). |
| 5 | **Deferred:** Plaid token encryption at rest, DB migrations, automated tests. | Tracked in `money-log-be/docs/TASKS.md`, not in this plan. |

---

## 1. Transaction edit & delete

**Problem.** `transactionRoutes.js` exposes `GET /stats`, `GET /`, `POST /`, `GET /:id` only. There is no update and no delete, so a user cannot correct a typo or remove a wrong entry. The UI has no affordance for either.

### 1.1 The subscription-link complication (decide first)

`POST /api/transactions` does double duty: when `subscription_id` is present it also advances `subscriptions.next_billing_date` by one cycle. So editing or deleting such a transaction has side effects on the recurring record.

**Recommendation — split the two concerns:**

- A transaction that has `subscription_id` set is **not freely editable or deletable** through the generic endpoints. Its amount, date, type and subscription link are locked; only `description`, `category_id` and `receipt` may be edited.
- Undoing a recurring payment gets its own explicit action (`POST /api/subscriptions/:id/undo-payment`, see §2.5), which deletes the linked transaction and rolls the schedule back by one cycle inside one DB transaction.
- Manual transactions (no `subscription_id`) are fully editable and deletable.

Rationale: a silent schedule rollback hidden inside a generic DELETE is the kind of thing that corrupts data six months later. Make it explicit in both API and UI.

### 1.2 Backend

**New endpoints**

| Method | Path | Body / notes |
|---|---|---|
| `PUT` | `/api/transactions/:id` | multipart (same `multer` single `receipt` field as POST) or JSON. Partial update allowed. |
| `DELETE` | `/api/transactions/:id` | Hard delete. Returns `204` or `{ message }`. |

**Rules for both**

1. **Ownership.** Load the row with `WHERE id = ? AND user_id = ?` before anything else. Missing row → `404` (never `403`, don't leak existence).
2. **Locked-field guard.** If `subscription_id IS NOT NULL`, reject changes to `amount`, `date`, `type`, `subscription_id` with `409` and a message pointing at the undo-payment action. Reject DELETE the same way.
3. **Editable fields (manual transactions):** `title`, `subtitle`, `amount`, `type`, `date`, `category_id`, `description`, `icon_name`, `icon_bg_color`, `receipt`.
4. **Category ownership.** If `category_id` changes, verify that category belongs to the same user.
5. **Validation.** Same Zod schema as create, in partial mode (§5). Amount > 0, max 2 decimals, `type` in enum, `date` a valid ISO date, string lengths matching DB column widths.
6. **Receipt lifecycle.**
   - New file uploaded on PUT → write new file, update `receipt_url`, **delete the old file from disk** after the DB commit succeeds.
   - Explicit `remove_receipt=true` flag → null the column and delete the file.
   - DELETE transaction → delete the file after commit.
   - File deletion failures must be logged but must not fail the request (the DB is the source of truth). A later sweep job can collect orphans.
7. **Transactionality.** Wrap DB work in `beginTransaction`/`commit`/`rollback` like `createTransaction` already does; do all filesystem mutation *after* commit.
8. **Response shape.** Return the full updated row with the absolute `receipt_url` built the same way create does, so the client can replace its cache entry without a refetch.

**Also fix while in here:** `createTransaction` returns only `{ id, message, receipt_url }`. Make create, update and get-by-id all return the same transaction object shape. Inconsistent response shapes are why frontends end up refetching everything.

### 1.3 Frontend

**Where the UI goes**

| Surface | File / area | Change |
|---|---|---|
| Transactions list | `app/(platform)/(dashboard)/transactions/page.tsx` | Add a row action column with an action menu |
| Row action menu | new `components/transactions/TransactionActionMenu.tsx` | Mirror the existing `SubscriptionActionMenu` / `AccountActionMenu` pattern — do not invent a third pattern |
| Edit form | `components/balance/AddTransactionForm.tsx` | Extend to accept an optional `transaction` prop → edit mode. One form, two modes. Do not fork a second form. |
| Edit modal | new `components/transactions/EditTransactionModal.tsx` | Wraps the form in the shared `ui/Modal` |
| Delete confirm | new `components/ui/ConfirmDialog.tsx` | **Shared primitive** — there is no confirm dialog today and several screens will need one (delete category, cancel subscription, delete supplier). Build it once here. |
| Detail view | transaction detail / receipt detail | Edit + Delete buttons in the header |

**Hooks** — `hooks/queries/transactions.ts`: add `useUpdateTransaction`, `useDeleteTransaction`.

**Cache invalidation on success** (both mutations): `transactions` list, `transactions` stats, `dashboard` overview, `reports` monthly, and the single `transaction` detail key. Get this list right once and reuse it — stale stat cards after an edit is the most likely bug here.

**Interaction rules**

- No optimistic update for delete; wait for the server, then invalidate. The list is cheap to refetch and a reappearing row is worse than a 300 ms wait.
- Optimistic update is acceptable for edit of `description`/`category` only. Not for amount — stat cards would flicker wrong numbers.
- Destructive confirm copy names the thing: "Delete *Grocery shopping* (₹1,240)?" not "Are you sure?".
- For locked (subscription-linked) transactions, the menu shows Edit/Delete **disabled with a tooltip** explaining to undo the payment from the subscription instead. Don't hide them — invisible affordances read as bugs.
- Error from `409` surfaces as a toast with the server message (notistack).

### 1.4 Acceptance criteria

- A manual transaction can be edited and deleted from the list and from its detail view.
- Editing a transaction updates every stat card, chart and report on screen without a manual refresh.
- Replacing a receipt leaves no orphaned file on disk.
- A subscription-linked transaction cannot be edited into an inconsistent state, and the UI explains why.
- Another user's transaction ID returns `404` on both endpoints.

---

## 2. Recurring transactions engine

**Problem.** Recurrence is currently just the `subscriptions` table: `billing_cycle` is `monthly|yearly` only, there is one `next_billing_date` pointer, nothing posts automatically, and a missed cycle is simply lost — there is no catch-up and no history of what was due when. This is a headline feature of the product and it's about 30% built.

### 2.1 Core architectural change: materialize occurrences

Replace the single `next_billing_date` pointer with **generated occurrence rows**. One row per due date.

This one change buys: real history, missed-payment detection, skip-this-month, variable amounts, idempotent reminders (§4), and an audit trail of what was paid against what was due. A single pointer cannot express any of that.

**New table — `recurring_occurrences`**

| Column | Purpose |
|---|---|
| `id` | PK |
| `user_id` | tenancy (§6) |
| `recurring_id` | FK → the rule row |
| `due_date` | DATE, the date this instalment is due (user-local date) |
| `amount` | DECIMAL snapshot of the rule's amount at generation time |
| `status` | ENUM `due`, `paid`, `skipped`, `missed`, `cancelled` |
| `transaction_id` | FK → `transactions`, null until paid |
| `paid_at` | timestamp |
| `created_at` / `updated_at` | |

Unique key on `(recurring_id, due_date)` — this is the idempotency guarantee for both the generator and the notification seeder.

**Changes to `subscriptions` (the rule table)**

| Add | Purpose |
|---|---|
| `frequency` | ENUM `daily`, `weekly`, `biweekly`, `monthly`, `quarterly`, `half_yearly`, `yearly`, `custom` |
| `interval_count` | INT, default 1 — "every 2 weeks", "every 3 months" |
| `by_month_day` | INT null — for monthly+: 1–31, with end-of-month clamping (31st in February → 28th/29th) |
| `by_weekday` | TINYINT null — for weekly/biweekly: 0–6 |
| `end_mode` | ENUM `never`, `on_date`, `after_n` |
| `end_date` | DATE null |
| `occurrences_total` | INT null — for `after_n` |
| `auto_post` | TINYINT — generate the transaction automatically on the due date, or wait for user confirmation |
| `generated_through` | DATE — how far the generator has materialized |
| `is_push_enabled` | TINYINT — parity with the existing `is_sms_enabled` / `is_email_enabled` |

`status` ENUM gains `paused` alongside `active`/`cancelled`.

Keep `billing_cycle` and `next_billing_date` as **derived/compat columns** during the transition (§2.6): `next_billing_date` = earliest `due` occurrence. Existing dashboard and reminder queries keep working while the new engine lands.

**Naming note:** "subscription" is a poor name for a salary or a rent payment, and the table already carries `type = income|expense`. Recommend the user-facing noun becomes **"Recurring"** while the table name stays `subscriptions` for now (renaming tables without a migration tool is not worth it). Route alias: keep `/subscriptions`, add `/recurring` later.

### 2.2 Generator job

A cron job (alongside the existing seeder/worker in `server.js`) that keeps a rolling horizon materialized.

- **Horizon:** materialize occurrences up to the later of *90 days ahead* or *the next 3 occurrences*. Advance `generated_through`.
- **Date arithmetic:** compute in the **user's timezone** (`users.timezone` — the existing seeder already does this correctly with dayjs + tz; reuse that approach). End-of-month clamping and DST are the two things that will bite; write the date-stepping in one helper used by both the generator and the preview endpoint so the UI preview can never disagree with what gets generated.
- **Idempotent:** insert-ignore on `(recurring_id, due_date)`. Safe to run every hour, safe to re-run after a crash.
- **Respects:** `status != 'active'` → skip; `end_mode` → stop at the boundary.
- **Runs:** hourly, and on-demand right after a rule is created or edited so the UI shows upcoming dates immediately.

### 2.3 Auto-post and catch-up

**`auto_post = true`** — on the due date (in user TZ) the job creates the `transactions` row, links it to the occurrence, marks it `paid`, and emits `recurring.auto_posted` (§4). This is the right default for salary, rent, EMI — things that happen whether or not you confirm them.

**`auto_post = false`** — the occurrence sits at `due`. The user confirms it from the UI, which creates the transaction.

**Catch-up** — any occurrence with `due_date < today` still at `due` becomes `missed`, and emits `recurring.missed` once. The user is then offered, per occurrence: **Mark paid** (optionally with a different actual amount and date), **Skip**, or **Edit then pay**. A "Catch up" panel groups all missed occurrences so a user returning after three weeks can clear them in one pass rather than hunting through a list.

This replaces today's behaviour, where a missed cycle just silently rolls forward and the money never gets recorded.

### 2.4 Edit semantics

These rules need to be stated explicitly or the data drifts:

| Change | Effect |
|---|---|
| Amount changed | Future `due` occurrences get the new amount. `paid` occurrences keep their snapshot. |
| Frequency / interval / anchor day changed | Delete all future `due` occurrences, regenerate from today. `paid`/`skipped` history is untouched. |
| `end_mode` tightened | Cancel future occurrences beyond the new boundary. |
| Paused | Stop generating; existing future `due` rows become `cancelled`. Resume regenerates. |
| Rule deleted / cancelled | Keep `paid` occurrences and their transactions (that money really moved). Cancel future ones. |
| Category changed | Applies to future only; past transactions keep their category. |

### 2.5 Endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/subscriptions/:id/occurrences` | Timeline, filterable by status and date range, paginated |
| `POST` | `/api/subscriptions/:id/occurrences/:occId/pay` | Confirm → creates transaction, marks `paid`. Accepts override `amount`, `date`, `category_id` |
| `POST` | `/api/subscriptions/:id/occurrences/:occId/skip` | Mark `skipped` with optional reason |
| `POST` | `/api/subscriptions/:id/undo-payment` | Reverses the most recent paid occurrence: deletes the transaction, reverts occurrence to `due`. One DB transaction. (Referenced from §1.1) |
| `GET` | `/api/subscriptions/preview` | Given rule params, return the next N dates. Used live by the create/edit form. No persistence. |
| `GET` | `/api/subscriptions/catch-up` | All `missed` occurrences across all rules for the user |
| `POST` | `/api/subscriptions/catch-up/bulk` | Bulk mark-paid / skip by occurrence IDs |

Changed: `POST /api/subscriptions` and `PUT /:id` accept the new recurrence fields and trigger generation. The existing `POST /:id/pay` becomes an alias for paying the earliest `due` occurrence (keeps the current frontend working through the transition).

**Retire** the "too early" guard in its current form (`createTransaction` rejects payment more than 15/30 days before the due date). With occurrences, the natural rule is: you may pay any occurrence that exists, and the UI only shows the ones in range. Keep a configurable look-ahead window on the rule if an explicit guard is still wanted.

### 2.6 Backfill of existing data

1. For every existing active subscription: set `frequency` from `billing_cycle` (`monthly`→`monthly`, `yearly`→`yearly`), `interval_count = 1`, `by_month_day` from `start_date`, `end_mode = 'never'`, `auto_post = false` (don't surprise anyone with sudden auto-posting).
2. Generate occurrences forward from `next_billing_date` only — **do not** backfill history, and do not retroactively mark old cycles missed. Existing `transactions` rows with a `subscription_id` can optionally be matched to synthesized `paid` occurrences by date, but treat that as a nice-to-have, not a blocker.
3. Keep `next_billing_date` updated as a derived value until every consumer reads occurrences.

### 2.7 Frontend

| Surface | Change |
|---|---|
| `subscriptions/page.tsx` | List shows next due date, frequency label ("Every 2 weeks"), auto-post badge, and a missed-count chip. Add a **Catch up (N)** banner at the top when missed occurrences exist. |
| `AddSubscriptionModal.tsx` | Becomes a recurrence builder: type (income/expense), amount, category, **frequency + interval**, anchor (day-of-month / weekday), start date, **end condition** (never / on date / after N), **auto-post toggle**, reminder settings. Show a live **"Next 3 dates"** preview from `/preview` — this is what makes a recurrence builder usable. |
| `subscriptions/[id]/page.tsx` | Occurrence timeline: past (paid/skipped/missed) and upcoming, each row with its action. Replaces the current payment-history-only view. |
| `subscriptions/[id]/pay/page.tsx` | Becomes "confirm occurrence" — pre-filled from the occurrence, allows amount/date override. |
| new `components/subscriptionpage/CatchUpPanel.tsx` | Grouped missed occurrences, multi-select, bulk mark-paid / skip. |
| new `components/subscriptionpage/RecurrencePreview.tsx` | The next-dates preview, reused in create and edit. |
| `hooks/queries/subscriptions.ts` | Add occurrence queries + pay/skip/undo/bulk mutations with the invalidation set from §1.3. |

**Copy rules:** always render a human frequency string ("Every month on the 5th", "Every 2 weeks on Tuesday", "Every year on 1 April"), never raw enum values. One formatter, shared.

### 2.8 Acceptance criteria

- A user can create a rule with any supported frequency and interval, with an end condition, and see the next three dates before saving.
- An `auto_post` rule creates its transaction on the due date in the user's own timezone, exactly once, even if the job runs repeatedly.
- A user who ignores the app for a month sees their missed occurrences and can clear them in one pass.
- Editing an amount never changes what was already recorded as paid.
- Cancelling a rule preserves its paid history.
- Running the generator twice produces no duplicate occurrences.

---

## 3. Remove mock data — real data with zero-value initial states

**Rule:** no hardcoded sample numbers anywhere in product UI. A screen with no data renders **zeros, empty axes and an empty state** — never invented rows. Fake data in a shipped screen is indistinguishable from a bug and destroys trust in every other number on the page.

Marketing pages under `(root)` are exempt — illustrative figures in a hero or feature section are fine there.

### 3.1 Inventory

| File | Currently shows | Action | Source |
|---|---|---|---|
| `overview/balance/page.tsx` | 6 hardcoded transaction rows, 3 stat cards | Wire | `/api/transactions` + `/api/transactions/stats` |
| `balancepage/BalanceOverviewChart.tsx` | `mockData` series | Wire | new series endpoint (§3.2) |
| `balancepage/BalanceSummaryList.tsx` | `summaryData` | Wire | category breakdown from `/api/reports/monthly` |
| `overview/expenses/page.tsx` | hardcoded rows, 4 stat cards | Wire | transactions filtered `type=expense` |
| `dailyexpensepage/ExpenseTrendChart.tsx` | `mockData` | Wire | series endpoint |
| `dailyexpensepage/RecentExpenseList.tsx` | `expenseCategories` | Wire | category breakdown |
| `transactions/income/page.tsx` | 5 hardcoded rows, 3 stat cards | Wire | transactions filtered `type=income` |
| `incomepage/IncomeOverviewChart.tsx` | `mockData` | Wire | series endpoint |
| `incomepage/IncomeBySourceChart.tsx` | `data` | Wire | **needs a decision** — see §3.4 |
| `transactions/transfer/page.tsx` + `TransferOverviewChart` + `TopTransferRoutesChart` | fully invented | **Park** | Transfers need account linking, which is out of scope (§0.2). Remove from the sidebar and leave the route behind a flag, or delete the route and keep the components. Do not ship a screen of fake transfers. |
| `transactions/receipts/*` (3 files) | `mockReceipts` | Wire | `/api/transactions?has_receipt=true` |
| `dashboardpage/GoalsTrackingCard.tsx` | hardcoded `goals` | **Hide** | There is no goals table and goals are not in scope. Remove the card from the dashboard rather than shipping decoration. Note as a future feature. |
| `dashboardpage/BudgetOverviewCard.tsx` | verify | Audit | `categories.budget_limit` is already returned by `dashboardController` / `reportController` — confirm it's wired, not partly mocked |
| `pos/reports/reportsData.ts` | `MOCK_*` exports now unused (only `exportTableToCsv` is imported) | Clean up | Delete the dead `MOCK_*` exports, move `exportTableToCsv` to `lib/` |

### 3.2 Backend work

**One generic time-series endpoint** instead of three bespoke ones:

`GET /api/reports/series?metric=expense|income|net&from=&to=&granularity=day|week|month&category_id=`

Returns `{ points: [{ period, amount }], total, previous_total }`. The balance, expense-trend and income-overview charts are the same query with different parameters — build it once. `previous_total` lets every stat card show a comparison without a second request.

**Extend `/api/transactions`** with: `type`, `from`/`to`, `category_id`, `search` (title/description), `has_receipt`, `sort`, and capped pagination. Several of these may already exist — audit `getTransactions` first and fill gaps rather than adding parallel params.

**Extend `/api/transactions/stats`** to accept the same `from`/`to`/`type` filters so the stat cards above each table reflect the active filter. Today the stat cards and the table can disagree.

Every one of these endpoints must be `user_id`-scoped (§6) and validated (§5).

### 3.3 Frontend rules for the empty/zero state

Three shared primitives are missing and should be built before wiring these screens, because all four pages need them:

1. **`ui/Skeleton.tsx`** — layout-matched placeholders. Loading must occupy the same box as the loaded content, so nothing jumps. No centred spinners on data pages.
2. **`ui/EmptyState.tsx`** — icon, one-line explanation, and the primary action that fixes it ("Add your first expense"). Used by tables, charts and lists.
3. **`ui/ErrorState.tsx`** — short message plus Retry. The current `p-8 text-center text-red-500` one-offs scattered through pages get replaced by this.

**Zero-value conventions**

- Stat cards render formatted `0` (not `—`, not blank) with their comparison hidden when there's no prior period.
- Charts render their axes and grid with an empty series and an overlaid "No data for this period" — not a collapsed empty box. The chart frame appearing tells the user the feature works and the period is just empty.
- Tables render the `EmptyState` inside the table body, keeping the header visible.
- Never substitute a previous period's data when the current one is empty.

**Every data surface must define all four states: loading, empty, error, loaded.** Add this to the PR checklist.

### 3.4 Open decision: income "source"

`IncomeBySourceChart` wants a "source" dimension (Salary, Freelance, Business, Investment, Other). The schema has no such field — income rows only have `category_id`, and `subscriptions.source` is an unrelated provenance string ("Manual Added").

Two options:

- **(a) Use category as source** — zero schema change, works immediately, and categories are already user-editable. The chart becomes "Income by category".
- **(b) Add `income_source` to `transactions`** — a separate taxonomy from expense categories. More faithful to the mockup, more to build (CRUD, picker, backfill).

**Recommended: (a) now**, revisit if users ask for a second dimension. Needs your call before this page is wired.

### 3.5 Acceptance criteria

- `grep -rn "mock\|MOCK_" src/` returns nothing outside `(root)` marketing components.
- A brand-new account with zero transactions can visit every dashboard screen and sees zeros and empty states, no fake rows, no console errors, no layout jump.
- Stat cards, charts and tables on the same page always agree, including under an active date filter.

---

## 4. Reminders and notifications — email, SMS, push

**Problem.** The reminder pipeline works for the happy path but has a live bug, no retry, no dedupe, and no user-facing control beyond three global booleans.

### 4.1 Bugs to fix first

| Bug | Location | Fix |
|---|---|---|
| **The 10 AM local-time guard is commented out** with `[DISABLED FOR TESTING]`, so reminders fire **every hour** | `jobs/queue_seeder.js` | Re-enable. Make the hour a user preference (`notify_hour`, default 10). This ships as spam if missed. |
| Cancelled jobs are marked `failed`, polluting failure signal | `jobs/queue_worker.js` | Add `cancelled` and `skipped` to the status enum |
| Push with no registered token marks the job `failed` **after** the in-app notification succeeded | `queue_worker.js` push branch | Treat in-app and remote push as independent outcomes; no token is `skipped`, not `failed` |
| Currency hardcoded as `$` in the email template | `queue_worker.js` HTML | Take the symbol from user/settings |
| Claim is non-atomic: `SELECT ... WHERE pending LIMIT 500` then a separate `UPDATE` | `queue_worker.js` | Atomic claim (§4.4) |
| Expo **tickets** are checked but **receipts** never are, so dead tokens are never pruned | `queue_worker.js` | Receipt pass (§4.4) |

### 4.2 Data model

**`notification_queue` — add:**

| Column | Purpose |
|---|---|
| `event_key` | What happened (§4.3), e.g. `recurring.reminder` |
| `dedupe_key` | UNIQUE. `event_key : entity_id : due_date : channel`. The single most important addition — makes the seeder safe to run at any frequency. |
| `scheduled_for` | DATETIME UTC. The worker sends when due, instead of "send whatever is pending". Decouples scheduling from sending. |
| `occurrence_id` | FK → `recurring_occurrences` (§2.1), replacing the direct `subscription_id` dependency |
| `template_key` | Which template to render |
| `payload` | JSON snapshot of the render variables, so a retry sends the same message even if the source row changed |
| `attempts` | INT, default 0 |
| `last_error` | TEXT |
| `sent_at` | timestamp |

`status` enum → `pending`, `processing`, `sent`, `failed`, `cancelled`, `skipped`.

**New `user_notification_preferences`** — one row per user per event key:

`user_id`, `event_key`, `email_enabled`, `sms_enabled`, `push_enabled`, `inapp_enabled`, plus user-level `notify_hour`, `quiet_hours_start`, `quiet_hours_end`, `timezone` (already on `users`).

The current three global booleans on `users` become the fallback when no per-event row exists. Keep per-subscription overrides (`is_sms_enabled`, `is_email_enabled`, and new `is_push_enabled`) as the most specific layer.

**Resolution order:** per-entity override → per-event preference → user global → system default.

**`user_push_tokens` — add:** `platform` (`ios`/`android`/`web`), `last_seen_at`, `is_valid`. Needed for pruning.

**Optional `notification_log`** — append-only record of what was actually sent (user, event, channel, rendered subject, provider message id, outcome). Worth it for "did I get a reminder?" support questions and for not double-sending after a crash.

### 4.3 Event catalogue

Notifications stop being subscription-only. One registry, one place to add events:

| Event key | Trigger | Default channels | Notes |
|---|---|---|---|
| `recurring.reminder` | T-minus `reminder_days` from an occurrence's due date | in-app + email | The existing behaviour |
| `recurring.due_today` | Due date, 10:00 local | in-app + push | Only when `auto_post = false` |
| `recurring.missed` | Occurrence flips to `missed` (§2.3) | in-app + email | Links to the catch-up panel |
| `recurring.auto_posted` | Auto-post created a transaction | in-app | Receipt-style confirmation, low noise |
| `budget.threshold` | Category spend crosses 80% / 100% of `budget_limit` | in-app + push | `budget_limit` already exists and is already returned by the dashboard — the data is there, only the trigger is missing |
| `pos.low_stock` | Variant stock ≤ `min_stock_alert` | in-app | Daily digest, not per-sale, or it becomes unusable |
| `pos.purchase_due` | Purchase bill due date approaching | in-app + email | |
| `account.sync_failed` | Plaid item → `login_required` | in-app + email | Reconnect flow already exists; this surfaces it |
| `security.new_login` | New device OTP verification | in-app | |

SMS is **off by default for every event.** It costs money per message and the OTP flow already justifies the Twilio dependency. Offer it as opt-in on `recurring.reminder` and `recurring.missed` only.

### 4.4 Scheduling and delivery

**Seeder (hourly)**

1. Walk occurrences inside the reminder horizon, plus other event triggers.
2. Resolve the channel set per the preference order in §4.2.
3. Compute `scheduled_for`: the user's `notify_hour` on the target local date, converted to UTC. Shift out of quiet hours to the next allowed slot.
4. Insert with `dedupe_key`, ignoring duplicates.

Because the send time is now stored, the seeder no longer needs to run at exactly the right hour — the current design's fragility (and the reason the hour guard existed at all) disappears.

**Worker (every 5 minutes)**

1. **Atomic claim:** a single `UPDATE ... SET status='processing', claimed_at=NOW() WHERE status='pending' AND scheduled_for <= NOW() ... LIMIT n`, then select the claimed rows. Alternatively `SELECT ... FOR UPDATE SKIP LOCKED` inside a transaction. Never select-then-update as two statements.
2. **Re-validate before sending** (keep the existing just-in-time check, improved): if the occurrence is now `paid`, `skipped` or `cancelled`, mark the job `cancelled`. With `occurrence_id` this is a cheap status lookup rather than today's brittle date-recomputation.
3. **Render** from `template_key` + `payload`.
4. **Send per channel, independently.** One channel failing must not affect the others.
5. **Classify failures:** permanent (no email on file, invalid number, unregistered token) → `failed` immediately, no retry. Transient (provider 5xx, timeout, rate limit) → back to `pending`, `attempts + 1`, exponential backoff (5 min, 30 min, 2 h), `failed` after 3 attempts with `last_error` recorded.
6. **Reset stuck jobs:** anything `processing` for more than 15 minutes goes back to `pending` (crash recovery).

**Expo receipt pass (new job, every 15 min)** — read receipts for recent push tickets; on `DeviceNotRegistered`, mark the token `is_valid = false` and stop using it. Without this, dead tokens accumulate forever and push failure rates climb silently.

**SMS guard** — hard cap per user per day; log every send with its event key for cost attribution.

**Known constraint:** cron runs in-process in `server.js`, so **only one backend instance may run** or every notification doubles. This is acceptable now. Document it next to the deploy config, and when a second instance is needed, either move the jobs to a separate worker process or add a DB advisory-lock table. Do not scale horizontally before that.

### 4.5 Templates

Move the inline HTML out of `queue_worker.js` into a templates directory, one per event × channel.

- **Email:** shared layout (logo, footer, "Manage notification preferences" link), per-event body, and a plain-text alternative for every HTML mail — HTML-only mail hurts deliverability.
- **SMS:** single segment where possible (≤160 chars), no tracking links, identify the app in the first few words.
- **Push:** short title + body, plus a `data` payload carrying `event_key` and the entity id so the mobile app can deep-link. Agree the deep-link path scheme now, with mobile in mind, even though mobile is out of scope.
- **In-app:** title + message + `type` (maps to the existing `warning|success|alert|info` enum) + a link target.

All money in templates uses the shared formatter and the user's currency, never a hardcoded symbol. All dates use the user's timezone and locale format.

### 4.6 Frontend

| Surface | Change |
|---|---|
| `settings/NotificationSettings.tsx` | Becomes a **matrix**: event rows × channel columns (in-app, email, SMS, push) with toggles, plus user-level preferred hour, quiet hours, and default reminder lead time. SMS columns show a "charges may apply" note. |
| `subscriptionpage/RemindersSettings.tsx` | Stays as the per-recurring override; add the push toggle for parity; make clear it overrides the global setting |
| `notifications/page.tsx` | Group by day, per-event icon and colour, deep-link each item to its entity, add the missing empty state, keep existing unread count and mark-all-read |
| Header bell | Unread badge already exists — confirm it invalidates after mark-as-read |

**Backend endpoints:** `GET`/`PUT /api/users/notification-preferences`. Keep `PUT /api/users/push-token` as is; add a de-register call for logout so a shared device stops receiving another user's reminders.

### 4.7 Acceptance criteria

- A reminder for one occurrence on one channel is delivered exactly once, no matter how often the seeder or worker runs.
- Reminders arrive at the user's chosen local hour, never during quiet hours.
- Paying a subscription after a reminder is queued but before it is sent cancels the notification, and the job is recorded as `cancelled`, not `failed`.
- A transient provider failure is retried with backoff; a permanent one is not retried.
- An uninstalled app's push token stops being used within a day.
- Turning off email for `recurring.reminder` in settings stops exactly those emails and nothing else.
- SMS is off until explicitly enabled.

---

## 5. Validation, error handling and rate limiting

**Problem.** The `validate(schema)` middleware exists and is good, but it's applied to auth and POS only. The entire personal-finance surface — transactions, accounts, subscriptions, categories, users, reports — is unvalidated and relies on ad-hoc `if (!title || !amount)` checks. Rate limiting exists on OTP send only. There is no global error handler.

### 5.1 Consolidate the schema convention

There are two conventions today: `src/schemaValidation/authSchemas.js` and `src/validations/pos/*Validation.js`. Pick one — **`src/validations/<domain>/<name>Validation.js`** — and move auth schemas into it. Two conventions means new code picks randomly.

Each schema validates `body`, `query` and `params` together (the middleware already passes all three).

### 5.2 Coverage

| Route group | Schemas needed | Key rules |
|---|---|---|
| `transactions` | create, **update (§1)**, list query, stats query, id param | amount > 0 and ≤ 2 decimals; `type` enum; `date` ISO and not absurdly far future; `title` ≤ 255 matching the column; `category_id` must belong to the user; pagination capped |
| `subscriptions` | create, update, **recurrence fields (§2)**, occurrence actions, id params | `frequency`/`interval_count` combination validity; `end_date` after `start_date`; `reminder_days` 0–30; `by_month_day` 1–31; `by_weekday` 0–6 |
| `accounts` | create, update, bulk-delete, list, id param | `type` enum; bulk-delete array length capped; no negative credit limits |
| `categories` | create, update, id param | name 1–100 and unique per user; `budget_limit` ≥ 0 or null; colour as hex |
| `users` | profile update, push-token | email format; phone E.164; timezone must be a valid IANA zone (the seeder already falls back on invalid ones — reject at the door instead) |
| `reports` / `dashboard` | query schemas | date range required and **capped** (e.g. ≤ 2 years) — these are the expensive queries; `granularity` enum |
| `plaid` | body schemas | item/account ids owned by the caller |
| `notifications` | list query, id param, preferences (§4) | |
| `pos/*` | already covered | audit for gaps in brands, suppliers, purchase, dashboard, report routes |

**Cross-cutting rules**

1. **Money** — accept as string or number, validate ≤ 2 decimal places, reject negatives except where explicitly allowed, store as `DECIMAL`. Never let a float round-trip through JS arithmetic before it hits the DB.
2. **IDs** — coerce to positive integers; reject anything else before it reaches SQL.
3. **Ownership** — every `:id` route must filter by `user_id` in the query itself, not check afterwards. Audit all existing `:id` handlers as part of this work (§6).
4. **Pagination** — every list endpoint takes `page`/`limit` with `limit` capped (default 20, max 100) and returns a total.
5. **String lengths** — mirror the DB column widths so MySQL truncation errors never surface as 500s.
6. **Enums** — validate against the exact DB enum values; keep them in one shared constants module so backend and frontend can't drift.
7. **Unknown keys** — strip rather than reject, except on auth endpoints where strict is safer.

### 5.3 Error handling

- Add a **global error handler** at the end of `app.js`. There is none today, so any unhandled async rejection in a controller becomes a hung request or a stack trace in the response.
- Add an **async wrapper** (or consistent try/catch discipline) around every controller.
- **One error shape everywhere:** `{ error: string, details?: [{ path, message }] }` — the validate middleware already produces this; make the rest match.
- **Status discipline:** `400` validation, `401` unauthenticated, `403` authenticated but not permitted, `404` not found *or not yours*, `409` state conflict (locked transaction, duplicate), `429` rate limited, `500` unexpected only.
- Never leak SQL errors, stack traces or driver messages to the client; log them server-side with a request id.

### 5.4 File upload validation

`multer` currently accepts any file of any size and keeps the original extension. Add: MIME whitelist (JPEG, PNG, WebP, PDF), max size (e.g. 5 MB), extension derived from the validated MIME and not from user input, generated filename (already random — keep), and per-user directory (§7).

### 5.5 Rate limiting

| Scope | Limit | Key |
|---|---|---|
| OTP send | exists — keep | phone + IP |
| **OTP verify** | 5 / 15 min | phone + IP — **missing today, this is a brute-force hole on a 6-digit code** |
| `refresh-token` | 30 / 15 min | user / IP |
| Global authenticated API | 300 / 15 min | user id |
| Write endpoints (POST/PUT/DELETE) | 120 / 15 min | user id |
| Reports / dashboard / POS reports | 60 / 15 min | user id — these run heavy aggregates |
| Uploads | 20 / hour | user id |
| Plaid sync endpoints | keep the existing per-item cooldown | item id |
| POS barcode scan | 600 / 15 min | user id — deliberately generous, it's a scanner loop |

Keyed by `req.user.id` where authenticated, IP otherwise. `trust proxy` is already set, which `express-rate-limit` needs. Return standard rate-limit headers and the standard error shape.

**Frontend:** the axios interceptor maps `400` → field errors on the form (using `details[].path`), `401` → refresh then logout, `409` → toast with the server message, `429` → toast honouring `Retry-After` with retries disabled in TanStack Query for that case, `5xx` → generic toast. Audit `lib/axios.ts` for what's already there.

**Frontend validation stays** in the existing RHF + Zod forms, with messages worded the same as the backend's. The backend is the authority; the frontend is for immediacy.

### 5.6 Acceptance criteria

- Every route has a schema; a malformed body returns `400` with field paths, never a `500`.
- No endpoint returns another user's data for a guessed id.
- OTP verification cannot be brute-forced.
- An unhandled controller exception returns a clean `500` and logs a stack trace server-side with a request id.
- Uploading a 50 MB `.exe` is rejected before it touches disk.

---

## 6. Tenancy — user-scoped accounts

Confirming the model (§0.3): **one user owns their personal finance data and their own store.** No store entity, no staff accounts, no sharing.

**Standing rules**

1. Every domain table carries `user_id` with a FK to `users` and `ON DELETE CASCADE`. The current 33-table schema already does this consistently — keep it that way.
2. Every query — read or write — filters by `user_id`. Never trust an id from the client on its own.
3. Every `:id` route scopes in the `WHERE` clause rather than fetching and comparing afterwards.
4. Composite indexes lead with `user_id` (the schema already does this for POS: `idx_pos_order_user_date`, `uniq_pos_variant_sku` on `(user_id, sku)`). Follow the same shape for new tables, including `recurring_occurrences` and `notification_queue`.
5. Uniqueness is **per user**, never global — order numbers, SKUs, category names.
6. `pos_shifts` and `show_cashier_name` refer to the account owner for now. Leave the columns; don't build staff UI.
7. New tables from this plan (`recurring_occurrences`, `user_notification_preferences`) follow all of the above.

**Audit task:** walk every existing `:id` handler in both the personal-finance and POS controllers and confirm rule 3. This pairs naturally with the §5 validation pass.

Multi-store and staff logins are explicitly out of scope and would need a `stores` table plus a membership/role table. Not now.

---

## 7. File uploads — local now, cloud later

Uploads stay on local disk (`multer` diskStorage → `uploads/`, served statically). The goal is to make the eventual S3/GCS swap a one-file change rather than a hunt through controllers.

**Conventions to adopt now**

1. **One storage boundary.** All writes, deletes and URL building go through a single storage module. No controller touches `fs` or builds a path by hand. This is the whole reason the later swap is cheap.
2. **Store relative keys, never absolute URLs.** The DB holds `uploads/<user_id>/receipts/<uuid>.jpg`; the absolute URL is built at response time (the transaction controller already does this with `req.protocol` + host — standardize on it). A DB full of `http://localhost:5001/...` is the single worst outcome here.
3. **Path layout:** `uploads/<user_id>/<entity>/<uuid>.<ext>` — per-user folders mean cheap per-user cleanup and no cross-user collisions. Today everything lands flat in `uploads/`.
4. **Never trust the original filename.** Generate the name; derive the extension from the validated MIME (§5.4).
5. **Lifecycle.** Deleting an entity deletes its files (§1.2). A weekly sweep removes files with no DB reference and DB references with no file.
6. **Private by default mindset.** Receipts are financial documents. Today `/uploads` is public static with a guessable-free UUID. Before cloud storage lands, plan to serve them through an authenticated API route that checks ownership and streams the file — switch to signed URLs when the provider does.
7. **Operational notes to write down next to the deploy config:** local disk does not survive a container rebuild and is not shared between instances, so uploads must be on a mounted volume and the backend stays single-instance (same constraint as the cron jobs in §4.4). Include `uploads/` in backups.

**What not to do now,** because it makes migration painful: scattering path construction, storing absolute URLs, letting the frontend build file paths, or mixing uploads with application code in the same directory tree.

---

## 8. Sequencing

Ordered by dependency, not by appetite.

| Phase | Work | Why here |
|---|---|---|
| **0** | Re-enable the reminder hour guard (§4.1). | One-line live bug; reminders are currently hourly spam. Do it today. |
| **1** | §5 validation, error handler, ownership audit, rate limits. Build `ConfirmDialog`, `Skeleton`, `EmptyState`, `ErrorState` (§1.3, §3.3). | Everything later writes against these. Doing it first means not retrofitting. |
| **2** | §1 transaction edit + delete, including the shared response shape. | Small, self-contained, immediately visible to users. |
| **3** | §3 mock-data removal, series endpoint, park the transfer page, drop the goals card. | Depends on phase 1 primitives and phase 2's response contract. Big credibility win. |
| **4** | §2 recurring engine: schema, generator, occurrences, backfill, then UI. | The largest piece. Needs the `transactions` contract from phase 2 to be settled first. |
| **5** | §4 notification rework, built on occurrences from phase 4. | The dedupe key depends on occurrence ids, so this follows phase 4. |
| **6** | §7 storage boundary refactor. | Independent; slot in wherever there's room, but before any cloud migration. |

Phase 4 and 5 are the two that materially change the product. Phases 1–3 are what make it trustworthy.

---

## 9. Decisions needed from you

1. **Income source (§3.4)** — use category as the source dimension, or add a separate `income_source` field?
2. **Transfer screen (§3.1)** — delete the route, or keep it hidden behind a flag until account linking happens?
3. **Goals card (§3.1)** — confirm removing it from the dashboard for now.
4. **Auto-post default (§2.3)** — off for all existing and new rules, with the user opting in per rule? (Recommended.)
5. **Recurring naming (§2.1)** — keep "Subscriptions" in the UI, or rename to "Recurring"?
6. **SMS policy (§4.3)** — confirm SMS stays off by default for all reminder events.
7. **Notification hour (§4.1)** — fixed 10:00 local, or user-configurable? (Configurable recommended; it's one column.)
