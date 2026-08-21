# HIMS Angular → React Migration — Prioritized Roadmap (v2)

**Companion files:** `docs/ANGULAR_REACT_MIGRATION_AUDIT.md` (structural audit, Aug 21 2026, still the architecture reference — this document does not repeat its stack/architecture sections), `docs/migration_screen_inventory.csv` (1,906-row raw state inventory), `docs/orphaned_states_candidate.csv` (new — see §2).

This document turns the audit and the governing migration spec into an actionable, sequenced plan, updated with real findings from the first three screen migrations.

---

## 1. What's changed since the audit

- **Three screens have now actually been migrated** (`defaultregistration`, `registeredpatients`, `patientregistration-self`), all in the Registration module, all validated against a steady TypeScript baseline (32 pre-existing errors, zero new). Full detail on each is in project memory / prior session reports; summarized in §4.
- **Two of those three turned out to be unreachable dead code**, discovered by grepping every `ui-router` state reference across `public/`. That 2-of-3 hit rate is not a one-off — see §2.
- **The governing spec was expanded**: beyond "zero regression," it now explicitly asks for the entire ~1,906-state application migrated, with an aggressive visual modernization pass per screen (not a 1:1 Angular-to-React visual copy) — clean modern cards/forms/tables/typography, a real shared component library, while preserving every field, validation, workflow, and API call exactly. This roadmap sequences toward that.

---

## 2. New finding: a project-wide reachability census

Because 2 of the first 3 screens picked (by size/module, the only signal available before this census existed) turned out to be orphaned, a scripted check was run across the **entire** state inventory rather than one screen at a time: for each of the 1,706 unique `ui-router` state names, search all of `public/` (excluding the state-definition files themselves) for a quoted reference to that state name (`'app.foo'`, `"app.foo"` — the form `ui-sref`/`$state.go` calls actually take).

**Result: 1,335 of 1,706 states (78%) have at least one such reference. 371 (22%) have none** — attached as `docs/orphaned_states_candidate.csv`.

**Important caveats — read before using this list:**
- This is a **heuristic triage signal, not proof of dead code**. It will not catch a state reached only via string concatenation/variable dispatch (`$state.go(someVar)`), a role/privilege-driven dynamic dashboard redirect, or a state only reachable from a deep-link/query-param flow. Some entries that intuitively should be live (e.g. a few `*dashboard*` states) show up on the orphaned list for exactly this reason — dashboards are often routed through a switch/redirect keyed on user role rather than a literal `ui-sref`.
- **Use it as a triage filter, not a verdict.** The existing per-screen rule stays in force: before migrating any screen, re-verify its specific reachability (grep + a quick look at how it's supposedly reached) — exactly as already done for the first three screens. This census just tells you where to look first and helps you avoid spending effort on the module areas most likely to be legacy accumulation.
- **Practical use for sequencing:** modules/areas where a high fraction of their states land on the orphaned list are lower migration priority (build nothing for screens no one can reach) but worth a separate, cheap cleanup conversation with the user about deleting truly-dead AngularJS code later (§30 of the governing spec: only after verification, never blind).

---

## 3. Methodology, formalized (apply to every future screen)

This is what's actually been learned doing three of these, now made explicit as the standing process (matches governing spec §23/§32 — this section operationalizes it for this specific codebase):

1. **Reachability first.** Check `docs/orphaned_states_candidate.csv`, then re-verify directly (grep the controller/state name across `public/`). If genuinely unreachable, surface it and let the user decide (skip vs. migrate-anyway) rather than assuming either way.
2. **Trace fully before writing React**: Angular controller → template → services/directives it embeds → API action strings → backend `Router`/`Service`/`Business` files (confirm each one is real, on-device, via `grep` — never assume an action string is wired up).
3. **Reuse existing shared Angular sub-widgets' real logic, don't reinvent it.** Directives like `<patientsearch>`, `<autosearch>`, and similar already wrap working, real, async search calls. When a screen embeds one, copy its real fetch/callback logic verbatim into the new hollowed controller (scoped to what that screen actually binds — don't guess unused config), and expose it to React as a Promise-returning prop. Full pattern recorded in project memory.
4. **One HTTP path only**: all real calls go through the existing `utl.Http.doAction` / `$http.post(window.appPath.apiroot + ...)` mechanism every working screen already uses. Do not use `src/services/apiService.ts`'s `callBackendApi`/`fetch('/api/...')` — it's a separate, parallel, unproven path with its own auth-token scheme that bypasses the real session mechanism entirely.
5. **Modern UI, same behavior.** Where a legacy widget's exact interaction can't be safely reproduced 1:1 in the time available (e.g. a fuzzy-highlighting `ui-select`, a calendar-popup date picker), a clean native equivalent bound to the same real data is an acceptable presentational simplification — but always disclosed as such, never silently. Business logic, API calls, and data sources never change.
6. **Validate before moving on**: scoped `tsc --noEmit -p tsconfig.app.json`, confirm the 32-error baseline hasn't grown, confirm every action/button/field against the original, then stop and report — don't chain into the next screen without a checkpoint.
7. **Don't fake it** (governing spec §25): no placeholder components, no dummy API responses, no hardcoded data, no marking a screen "done" with unconnected functionality.

---

## 4. Progress so far (Registration module)

| # | Screen | Reachable? | What it is | Status |
|---|---|---|---|---|
| 1 | `defaultregistration` | ❌ No live `ui-sref`/`$state.go` found | Old patient-services landing menu | Migrated (harmless, unreachable) |
| 2 | `registeredpatients` | ❌ No live reference found | Patient search/list screen | Migrated (harmless, unreachable) |
| 3 | `patientregistration-self` | ❌ No live reference found (user chose "migrate anyway") | Full "Patient Registered" report: search, referral autosearch, date range, MRN filter, 9-col sortable grid, pagination, Excel/print, edit-row nav | Migrated, full React rewrite (user's choice over a surgical partial option), validated |

The real, confirmed-reachable "Patient Management" landing screen is `patientservices.html` (`PatientServicesController`) — two live cards: **New Registration** (→ `self.selfnewregistration`/`app.newregistration`) and **Feedback** (→ `app.patient-feedback`). Neither has been migrated yet.

---

## 5. Recommended sequencing

### 5.1 Immediate — finish Registration with confirmed-reachable screens first

| Screen | Reachable? | Size | Notes |
|---|---|---|---|
| `newregistration` (`self.selfnewregistration` / `app.newregistration`) | ✅ Confirmed — this is where the real "New Registration" card actually goes | 36 KB / 28 KB | **Do this next.** The actual entry point users hit today; highest real-world impact of anything left in this module. |
| `patientregistration-form` (`app.patientregistration-form`) | ✅ Confirmed (linked from `patientregistration-self`'s edit-row action, which is real) | 16 KB / 28 KB | Recently modified same day as the last session (Aug 21) — check git blame/diff before assuming its current on-disk state matches what's expected. |
| `quickregistration` (`app.quickregistration`) | Not yet re-verified against the new census | 17 KB / 36 KB | Already partially bridged (`RegistrationActionBar`/`Footer` reused here) — likely the next-cheapest full migration. |
| `fullregistration` / `app.fullregistrationtab.*` | Not yet re-verified | 37 KB / 97 KB | Bigger; tabbed multi-section form. Do after the smaller ones. |
| `app.registrationcumvisit` (older, separate from the flagship) | Not yet checked | — | Check reachability before considering. |
| `regcumvisitwithbill` (flagship) | Confirmed reachable, deliberately deferred | ~304 KB / ~150 functions | **Stays deferred** until every smaller Registration screen is done, per explicit prior instruction. Its own sub-project when it starts — needs dedicated scope, not a routine screen slot. |

### 5.2 After Registration — module order

Reuses the audit's phase order (§7 of the audit doc), which was already reconciled against the governing spec's own priority list — no change to the sequencing logic, just restated here with the new reachability caveat layered in:

1. **Shared component library** (`src/components/common`: Input, Select, SearchSelect, DatePicker, Checkbox, RadioGroup, Modal, DataTable, Pagination, SearchBox, Loading/Empty/Error states) — still not built. Per the governing spec's explicit ask (§15/§18) and the audit's own Finding #5, this should be built **alongside** the next few Registration screens rather than blocking them further — every screen since `patientregistration-self` needs at least a Select/DatePicker/DataTable equivalent, and building them ad-hoc per screen (as `patientregistration-self` did) creates drift. Recommend: extract the patterns already proven in `PatientRegistrationSelfScreen.tsx` (sortable table, numbered pagination) and `PatientSearchControl.tsx` (typeahead) into real reusable `components/common/` primitives the next screen consumes, rather than a big upfront build with nothing shipping.
2. **Auth/Login, Layout/Sidebar/TopNav** — already migrated; a verification pass (confirm against current session/privilege behavior) rather than new build.
3. **Master/reference data** (`GeneralMaster` 206 files, `SystemSettings` 245 files) — simple CRUD grids, good proving ground for the new DataTable/Form primitives once built.
4. **Finish Registration** (per §5.1).
5. **Appointment** (57 backend files).
6. **Billing** (332 files — largest revenue-risk module, `HimsPatientBillsBo.ts` alone is 1.5 MB). Treat as its own sub-project with dedicated QA, not a routine sprint slot.
7. **ClinicalMaster (377) + EMR (428)** — largest by file count, clinically sensitive; verify with clinical input, not engineering alone.
8. **LIS (232)** — no separate Radiology module; those screens live inside LIS/ClinicalMaster/EMR, confirm exact ownership per screen when this phase starts.
9. **Pharmacy (402)** — second-largest module; dashboard already migrated.
10. **Remaining modules** (IPManagement 130, VirtualHealthcare 82, AssetManagement 90, CostManagement 47, and the rest) — ascending complexity, sequence by actual usage data once available.
11. **Legacy AngularJS removal** — only after every module above is verified per the checklist in §6, never before.

Scale reminder from the audit still holds: this is realistically a multi-quarter program at a sustained pace, not something to compress. The reachability census in §2 will shrink the *real* remaining scope somewhat (a meaningful fraction of the 1,906 states may be legacy accumulation), but that's only confirmed screen-by-screen, not assumed from the census.

---

## 6. Sizing tiers (for estimating what's ahead, based on what's actually been seen)

| Tier | Example | Characteristics | Rough relative effort |
|---|---|---|---|
| **Simple** | `defaultregistration` | Static menu/nav, a handful of buttons, no real form state | 1x |
| **Form/list** | `registeredpatients` | One search field, one results table, basic pagination | 2–3x |
| **Complex multi-widget** | `patientregistration-self` | Multiple typeahead/autosearch widgets, date range, dropdown filter, sortable multi-column grid, export/print, conditional navigation | 8–12x — most of the effort is in tracing and faithfully porting the *sub-widgets* (typeahead, autosearch, custom-table sort), not the screen shell itself |
| **Flagship** | `regcumvisitwithbill` | ~150-function controller, ~304 KB, deep cross-module business logic (registration + visit + billing in one screen) | Its own project — don't slot into a normal sequence |

Use this to sanity-check timeline expectations as each module's screen list is actually inspected (sizes/complexity vary a lot within a module — `Billing`'s 332 backend files does not mean 332 screens of flagship complexity, most are simpler CRUD/report screens like `patientregistration-self`).

---

## 7. Carried-over and new risk items

From the original audit (unfixed, still relevant):
- CORS wildcard `*` in `api/src/Server/Router.ts`.
- No automated test coverage on either frontend — for a zero-regression mandate at this scale, some E2E smoke coverage over the highest-traffic real screens (login, real registration entry, OP billing, pharmacy dispense) is close to a prerequisite, not optional, once real (reachable) screens start moving in volume.
- Commits land directly on `main`, no PR workflow — worth a deliberate call before 20+ modules' worth of change lands this way.
- `api/ui/docs/` contains real generated patient PDFs sitting in the repo tree — confirm excluded from git and from any AI tooling context.
- `PrivilegeHelper.ts`'s 21 pre-existing TS errors — still not determined whether they block any real screen; investigate only if/when a screen actually needs it, per standing instruction not to fix just to reduce the count.
- `src/index.ts` cron/jobs backend's production deployment process is still unconfirmed.

New, found while migrating `patientregistration-self`:
- **`RegistrationFormComponent.tsx`** (already existed/registered before this work started) is not a faithful port of anything real — invented fields (Ethnicity, Web Camera upload) and hardcoded dropdown option lists not sourced from any real screen or lookup API. Same category of problem as the earlier-flagged `RegCumVisitWithBillScreen.tsx` (disconnected/fabricated scaffolding). Not touched; flagging for a decision (rebuild faithfully when `patientregistration-form` is migrated, since that's presumably the screen it was meant to represent, or remove it).
- **The 22% orphaned-state finding itself (§2)** — worth a standalone conversation with the user about whether accumulated dead AngularJS routes should eventually be cleaned up, separate from the React migration itself.

---

## 8. Non-negotiable guardrails (restated, unchanged)

- Never touch `force: false` in either `DbConfig.ts`, never uncomment a `sequelize.sync()` call.
- Never change an API route, payload shape, or response contract to make React's life easier.
- Never introduce mock/hardcoded/random data — every dynamic value comes from a real, verified backend call.
- Never delete AngularJS code until its React replacement is verified against the per-screen checklist (audit doc §8) and the user has confirmed.
- One screen (or one well-scoped shared component) at a time, validated, before moving to the next.
