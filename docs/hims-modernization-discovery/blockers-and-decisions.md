# HIMS Modernization — Blockers and Decisions Required

**Discovery Date:** 2026-09-05
**Status:** READ-ONLY — Awaiting owner decisions before implementation begins

---

## BLOCKER 1 — PrivilegeHelper All-False Stubs (CRITICAL)

**File:** `src/react-components/utils/PrivilegeHelper.ts`
**Evidence:** All 435+ static methods contain `// TODO: Implement actual session checks when SessionHelper is available` and return `false`
**Impact:** Every React component that uses `PrivilegeHelper` to control button visibility, menu items, or action gating shows NO permissions to any user. Deploying React screens with this stub active means all privilege-gated features appear disabled for all roles.

**Decision required:** Approve implementation of all 435+ privilege checks reading from `sessionStorage` keys (`Session-UserId`, `Session-UserTypeId`, `Session-UserGroupId`, `Session-ClinicalRoleId`, `Session-DepartmentId`, `Session-FacilityId`, `Session-UserDepartments`, `Session-UserRoles`) to match what the AngularJS controllers already compute from the same source.

**Also required:** Fix 7 duplicate keys in the `privileges` Record:
- `CanAppointments` — defined at lines 19 and 371
- `CanSurgerySchedule` — defined at lines 362 and 372
- `CanReports` — defined at lines 35 and 373
- `Cansendforapproval` — defined at lines 416 and 417
- `CanCredit_Approver` — defined at lines 332 and 418
- `CanDiagnosis` — defined at lines 301 and 379
- `CanStockIndent` — defined at lines 52 and 365

---

## BLOCKER 2 — No Automated Tests (HIGH)

**Evidence:** `find ... -name "*.spec.ts" -o -name "*.test.ts"` → 0 files in React src. Backend jasmine-node: 0 spec files found.
**Impact:** No regression protection for any React migration. A TypeScript error introduced during migration cannot be automatically caught.

**Decision required:** Approve adding Vitest + React Testing Library to the React dev stack. Confirm whether backend Jasmine/protractor tests should be maintained or replaced.

---

## BLOCKER 3 — 32 Pre-existing TypeScript Errors (HIGH)

**Evidence:** Documented in `migration_fixes_log.md` (May 2–3, 2026) — 32 pre-existing TypeScript diagnostics established as the immovable baseline.
**Impact:** Any new migration that introduces new TS errors cannot be distinguished from baseline noise without tracking the exact error list.

**Decision required:** Owner approves the 32-error baseline as acceptable. Team commits to not exceeding 32 errors; target of 0 errors before Wave 3 begins.

---

## BLOCKER 4 — Two Competing API Paths (HIGH)

**Path A (Canonical):** `src/react-components/utils/api.ts` → `apiFetch()` → Angular injector → `utl.Http.doAction` → existing bearer, spinner, error toast
**Path B (Standalone):** `src/react-components/utils/APIHelper.ts` → `APIHelper.doAction()` → native `fetch()` + `localStorage.getItem('token')`

**Evidence:** Only ~7 React component lines use Path A. Most React components receive data via AngularJS `reactProps` (no direct API call from React). Path B exists and is registered but its production usage is unclear.

**Decision required:** Confirm that Path A (`apiFetch`) is the ONLY approved path for all new React components. Decide whether Path B is: (a) deprecated immediately, (b) allowed only for outside-Angular contexts (patient portal, standalone React), or (c) both maintained in parallel.

---

## BLOCKER 5 — No Shared Component Library (HIGH)

**Evidence:** No `src/components/common/` directory exists. Each React screen builds its own `<table>`, `<input>`, `<select>`, and dialog inline.
**Impact:** UI inconsistency across screens is guaranteed. Every new migrated screen duplicates component logic. Re-used patterns (sorting, pagination, loading state) diverge per screen.

**Decision required:** Choose between:
1. Build custom library in `src/components/common/` (starting from existing `Button.tsx`, `ConfirmModal.tsx`, `AutosearchSelect.tsx` patterns)
2. Adopt Ant Design (antd)
3. Adopt MUI (Material UI)
4. Adopt another named library

Note: The `REACT_MIGRATION_GUIDE.md` and `MIGRATION_ROADMAP.md` both recommend option 1 (custom, extract from proven patterns). Reference libraries (Ant Design, MUI) are only recommended if the existing shared library cannot meet a requirement.

---

## BLOCKER 6 — 371 Orphaned States Not Formally Classified (MEDIUM)

**File:** `docs/orphaned_states_candidate.csv`
**Evidence:** 371 of 1,706 unique state names (22%) have no confirmed `ui-sref` or `$state.go` reference in `public/` (excluding state-definition files themselves).
**Caveat:** Heuristic only. States reachable via dynamic dispatch, role-based redirects, or query-param flows may be falsely listed as orphaned.

**Decision required:** Owner reviews `docs/orphaned_states_candidate.csv` and decides:
1. Which states to formally retire (delete from Angular, do not migrate to React)
2. Which states to verify as reachable via non-literal dispatch (dashboard role redirects, etc.)
3. Which states to migrate anyway for completeness regardless of reachability

---

## BLOCKER 7 — No CI Build/Test Verification (MEDIUM)

**Evidence:** `.github/workflows/sonarqube.yml` — SonarQube scan only. No `tsc --noEmit` step. No `npm test` step. No build verification.
**Impact:** A broken TypeScript build could be merged to main without automated detection.

**Decision required:** Approve adding TypeScript build check (`tsc -b tsconfig.app.json --noEmit`) and test runner (`npm test`) to GitHub Actions on PRs and main branch pushes.

---

## Additional Decisions (Non-Blocking but Required Before Wave 3+)

### Decision A — Billing Calculation Parity Verification
Before any OP/IP billing React screen is released, the calculation logic in `HimsPatientBillsBo.ts` (~1.5MB) must be documented and reconciliation queries prepared. **Owner must assign a billing domain expert to participate in Wave 4 verification.**

### Decision B — Orphaned Migrated Screens
Three screens were migrated to React but are orphaned (not reachable from live navigation): `defaultregistration`, `registeredpatients`, `patientregistration-self`. **Owner must decide:** keep them (maintenance burden), remove them, or designate reachable entry points.

### Decision C — Clinical UAT Resource
Wave 4 includes clinical documentation (EMR, vitals, prescriptions, discharge). **A clinical user must be identified to participate in UAT before any clinical screen is released to production.**

### Decision D — Patient Portal Strategy
The 112 patient portal states are Angular-only. The VirtualHealthcare backend module exists. **Owner must decide: include patient portal in this modernization scope or treat as a separate project.**

### Decision E — Blood Bank and Dialysis
No React components exist. Backend modules not found. **Owner must confirm:** Are Blood Bank and Dialysis active in this HIMS deployment? If yes, they require backend module discovery. If no, document as "Not applicable for this deployment."

