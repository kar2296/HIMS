# HIMS Modernization — Proposed Batch 01

**Batch:** 01 — Shared Foundation  
**Wave:** 1  
**Status:** PROPOSED — Awaiting owner approval  
**Estimated effort:** 2–3 developer-days  
**Risk level:** LOW  

---

## Scope

Batch 01 is entirely infrastructure — it contains zero new screen migrations. It builds the foundation that all subsequent batches depend on.

**Do not begin Batch 01 until all 7 blockers in `blockers-and-decisions.md` have received explicit owner decisions.**

---

## Tasks

### Task 01.1 — Fix Duplicate Keys in PrivilegeHelper.ts
**File:** `src/react-components/utils/PrivilegeHelper.ts`  
**Change:** Remove 7 duplicate key definitions from the `privileges` Record:
- Remove duplicate `CanAppointments` at line ~371 (keep line 19)
- Remove duplicate `CanSurgerySchedule` at line ~372 (keep line 362)
- Remove duplicate `CanReports` at line ~373 (keep line 35)
- Remove duplicate `Cansendforapproval` at line ~417 (keep line 416)
- Remove duplicate `CanCredit_Approver` at line ~418 (keep line 332)
- Remove duplicate `CanDiagnosis` at line ~379 (keep line 301)
- Remove duplicate `CanStockIndent` at line ~365 (keep line 52)

**Risk:** LOW — Fixing TypeScript errors only, no behavioral change (all currently return `false`)  
**Acceptance:** `tsc -b tsconfig.app.json --noEmit` → ≤25 errors (from 32, reduced by duplicate-key fixes)

### Task 01.2 — Implement PrivilegeHelper from SessionStorage
**File:** `src/react-components/utils/PrivilegeHelper.ts`  
**Change:** Replace all `// TODO` stub implementations with real checks reading from `sessionStorage` keys that AngularJS already populates.

Session keys available (confirmed in `session.ts`):
- `Session-UserId` → `getCurrentUserId()`
- `Session-UserTypeId` → `getUserTypeId()`
- `Session-UserGroupId` → `getUserGroupId()`
- `Session-ClinicalRoleId` → `getClinicalRoleId()`
- `Session-DepartmentId` → `getCurrentDepartmentId()`
- `Session-FacilityId` → `getCurrentFacilityId()`
- `Session-UserDepartments` → `getUserDepartments()` (JSON array)
- `Session-UserRoles` → `getUserRoles()` (JSON string)

The Angular privilege check pattern to replicate: `Session-UserRoles` contains a JSON string of role/privilege mappings set at login by the backend. Each `CanXxx` method should parse this string and return whether the current user has the named privilege.

**DECISION REQUIRED before this task:** Owner must confirm the exact format of `Session-UserRoles` (what the backend writes) so the implementation can be validated against real data.

**Risk:** MEDIUM — Privilege logic change affects all React-rendered UI elements  
**Acceptance:** All 435+ privilege methods return the correct boolean for a test user; matches what the AngularJS controller computed for the same session.

### Task 01.3 — Create Shared Component Library Skeleton
**Files:** New `src/components/common/` directory  
**Components to create:**
1. `DataTable.tsx` — Sortable, paginated table with loading, empty, error states; accessible headers
2. `Input.tsx` — Labelled text input with validation message and aria-describedby
3. `Select.tsx` — Controlled select with options array prop
4. `Modal.tsx` — Overlay modal with focus trap, keyboard dismiss (Esc), accessible role="dialog"
5. `Loading.tsx` — Spinner with message
6. `EmptyState.tsx` — Empty list placeholder with icon and call-to-action
7. `ErrorState.tsx` — Error display with retry action
8. `PermissionDenied.tsx` — Standard access-denied message

**Note:** Extract patterns from existing `PatientRegistrationSelfScreen.tsx` (table/pagination) and `PatientSearchControl.tsx` (typeahead) as references.

**Risk:** LOW — Additive new files; no existing component changed  
**Acceptance:** Each component: renders correctly, passes TypeScript, has at least one Vitest render test

### Task 01.4 — Add Vitest Test Runner
**Files:** `package.json`, `vite.config.ts`  
**Change:** Add Vitest + @testing-library/react to devDependencies; configure test script  
**Risk:** LOW — Dev dependency only  
**Acceptance:** `npm test` runs without error and finds the new component tests

### Task 01.5 — Add TypeScript Build CI Step
**Files:** `.github/workflows/typescript.yml` (new)  
**Change:** Add GitHub Actions workflow: on PR and push to main, run `tsc -b tsconfig.app.json --noEmit` and fail if error count exceeds 32  
**Risk:** LOW  
**Acceptance:** CI runs green; CI fails if a new TS error is introduced

### Task 01.6 — Standardize API Path (Documentation)
**Files:** `REACT_MIGRATION_GUIDE.md` (update)  
**Change:** Document the decision that `apiFetch()` is the single approved API path for all new React components. Document that `APIHelper.doAction()` (standalone fetch) is for designated outside-Angular contexts only.  
**No code change in this task — only governance documentation update.**

---

## Dependencies
- None (Batch 01 is the foundation — no prior migration required)
- Requires: Owner decision on all 7 blockers before starting

## Entry Criteria
- [ ] All 7 blockers in `blockers-and-decisions.md` have explicit owner decisions
- [ ] `Session-UserRoles` format confirmed by backend team (for Task 01.2)
- [ ] Shared component library choice confirmed (for Task 01.3)

## Exit Criteria
- [ ] `tsc -b tsconfig.app.json --noEmit` → 0 errors (all duplicates removed, PrivilegeHelper implemented)
- [ ] All 435+ privilege methods return correct boolean for test user session
- [ ] 8 shared components built, each with passing Vitest test
- [ ] `npm test` runs without error
- [ ] GitHub Actions TypeScript CI step green
- [ ] `REACT_MIGRATION_GUIDE.md` updated with API path decision

## Rollback
- No Angular templates modified
- No backend files modified
- No database changes
- Rollback = `git revert` of React `src/` changes only

## Not In Batch 01
- New screen migrations (Wave 2+)
- Database migrations
- Backend changes
- Angular template modifications
- Dependency version upgrades

