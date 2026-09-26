# HIMS Modernization — Risk Register

**Discovery Date:** 2026-09-05
**Status:** READ-ONLY — Discovery artifact

## CRITICAL RISK Items

| ID | Risk | Evidence | Impact | Mitigation |
|----|------|----------|--------|-----------|
| CR-01 | PrivilegeHelper all-false stubs | `PrivilegeHelper.ts` lines 438–2624 | All React permission gates non-functional | Implement from sessionStorage before Wave 2 deployment |
| CR-02 | No automated tests | `find -name "*.spec.ts"` → 0 results | No regression protection | Add Vitest + GitHub Actions CI before Wave 2 |
| CR-03 | Billing calculation complexity | `HimsPatientBillsBo.ts` ~1.5MB | Financial calculation error → incorrect billing | Assign billing domain expert; prepare reconciliation queries before Wave 4 |
| CR-04 | Orphaned-state migration waste | 371 candidates in CSV | Migrating dead screens wastes effort | Classify all orphaned states before Wave 3 |

## HIGH RISK Items

| ID | Risk | Evidence | Impact | Mitigation |
|----|------|----------|--------|-----------|
| HR-01 | Two API paths — inconsistent auth/error handling | `api.ts` vs `APIHelper.ts` | React components may bypass session error handling | Standardize to `apiFetch()` only; deprecate standalone path |
| HR-02 | No shared component library | No `src/components/common/` | UI drift across migrated screens | Build library in Wave 1 before new screen migrations |
| HR-03 | 32 pre-existing TS errors | `migration_fixes_log.md` | New errors masked by baseline noise | Track exact error list; resolve to 0 before Wave 3 |
| HR-04 | Clinical finalization without UAT | EMR module (428 files) | Patient safety if clinical logic differs | Clinical domain expert required; no release without clinician UAT |
| HR-05 | Discharge summary finalization | DischargeSummary module | Finalized DS cannot be undone | Full permission parity verification + immutability test |
| HR-06 | Laboratory result authorization chain | LIS module (232 files) | Wrong result authorized → patient harm | Mandatory runtime verification + chain-of-custody audit |
| HR-07 | Medication dispensing rules | Pharmacy module — allergy, interaction, batch, expiry | Wrong drug dispensed | Pharmacist UAT mandatory before pharmacy screen release |

## MEDIUM RISK Items

| ID | Risk | Evidence | Impact | Mitigation |
|----|------|----------|--------|-----------|
| MR-01 | CORS wildcard `Allow-Origin: *` | `Router.ts` line 36 | XSS/CSRF exposure if internet-facing | Restrict to known origins before public deployment |
| MR-02 | Bearer token in `localStorage` | `APIHelper.ts` line ~38 | XSS token theft | Use `httpOnly` cookie or session storage only |
| MR-03 | Express 5.0.0-alpha.6 in production | `api/package.json` | Alpha stability/security risk | Evaluate upgrade to stable Express 5 or Express 4.x |
| MR-04 | Sequelize v4 (EOL) | `api/package.json` | No security patches | Plan Sequelize 6 upgrade as separate workstream |
| MR-05 | Duplicate TS keys in PrivilegeHelper | Lines 332, 362, 371, etc. | Silently wrong privilege checks | Fix all 7 duplicates in Wave 1 |
| MR-06 | `apiFetch` uses Angular injector | `api.ts` line 18 | Fails outside Angular bootstrap context | Needed for patient portal standalone React; resolve with Blocker 4 decision |
| MR-07 | PM2 process manager in API dependencies | `api/package.json` | Production restart and monitoring gap | Confirm PM2 is configured for production; `process.yml` present |

## LOW RISK Items

| ID | Risk | Evidence | Impact | Mitigation |
|----|------|----------|--------|-----------|
| LR-01 | `hims-states_orig.js` and `hims-states_split_old.js` in `public/js/` | Directory listing | Stale files may confuse tooling | Archive to `_to_delete/` folder; do not serve |
| LR-02 | AngularJS 1.x end-of-life (Dec 2021) | Framework version | No upstream security fixes | Accelerate migration; freeze Angular version |
| LR-03 | Karma + PhantomJS test runner in API | `karma.conf.js` | Legacy test tooling | Replace with Vitest/Jest during Wave 1 |
| LR-04 | `fix_multiple.cjs`, `fix_tslint.cjs` etc. in root | Root directory | Leftover migration scripts | Clean up; archive to `_to_delete/` |
| LR-05 | `scratch.ts` and `script.sql` in root | Root directory | Accidental inclusion in builds | Add to `.gitignore`; remove from tracking |

