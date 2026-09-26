# HIMS Route Census Reconciliation

**Discovery Date:** 2026-09-05
**Status:** READ-ONLY — Discovery artifact

## 1. Source Files Inspected

| File | `.state()` declarations | Abstract | Notes |
|------|------------------------|----------|-------|
| `public/js/hims-states.js` | 1,371 | 4 | Main HIMS shell (~23,582 lines) |
| `public/js/custom-states.js` | 248 | 0 | Custom/facility-specific states |
| `public/js/emr-states.js` | 170 | 1 | EMR patient record states |
| `public/js/lis-states.js` | 63 | 0 | LIS/lab workflow states |
| `public/js/patientportal-states.js` | 47 | 0 | Patient self-service portal |
| `public/js/linenandlaundry-states.js` | 9 | 0 | Linen & laundry module |
| `public/js/base.js` | ~1 | 0 | App bootstrap/root |
| `public/js/app.js` | 2 | 0 | App-level config |
| `public/js/hims-states_orig.js` | 1,402 | — | Archived original (NOT active) |
| `public/js/hims-states_split_old.js` | — | — | Archived split (NOT active) |
| **ACTIVE TOTAL** | **~1,911** | **~5** | From active state files only |

## 2. Reconciled Working Denominator

**1,906** — from `docs/migration_screen_inventory.csv` (1,907 lines including header), extracted programmatically from the active state files.

## 3. Historical Count Reconciliation

| Historical Count | Source | Why It Differs |
|-----------------|--------|----------------|
| 1,589 configured source routes | Earlier analysis | Likely from hims-states.js alone (1,371) + partial other files, or an earlier version of the state files |
| 1,584 concrete routes | Same source | 1,589 minus ~5 abstract states |
| 5 abstract routes | Confirmed | 4 in hims-states.js + 1 in emr-states.js |
| 1,316 canonical active unique (AST migration denominator) | Previous AST analysis | Excluded orphaned states (371 unreachable candidates). 1,906 − 371 = ~1,535; 1,316 reflects a stricter reachability pass |
| **1,906 (current working denominator)** | This analysis | All `.state()` calls across all active state-definition files on disk |

## 4. Route Classification

| Classification | Count |
|---------------|-------|
| Total state declarations (active files) | ~1,911 |
| Reconciled working denominator | **1,906** |
| Abstract/shell states | ~5 |
| States with confirmed reachable references | ~1,335 (78%) |
| Orphaned/unreachable candidates | ~371 (22%) |
| Angular-only routes | ~1,903 |
| Hybrid (Angular shell + React render) | ~3 confirmed |
| React-only routes (no Angular) | 0 |
| Routes with no physical template | Under investigation — templateUrl extraction not fully reliable via static parse |
| Dynamic/computed routes | None detected |
| Duplicate state names | Requires per-state dedup audit |
| Aliases/redirect-only routes | `$urlRouterProvider.otherwise` configuration controls fallback; specific redirect aliases not enumerated |

## 5. State Namespace Breakdown

| Namespace | States | Domain |
|-----------|--------|--------|
| `app.*` | ~1,562 | Main HIMS shell |
| `patientemr.*` | ~178 | Clinical EMR viewer |
| `patientportal.*` | ~112 | Patient self-service portal |
| `surgeryentry.*` | ~41 | OT/surgery entry |
| `self.*` | ~8 | Login/signup/OTP |
| `page.*` / `pages.*` | ~4 | Standalone pages |
| **Total** | **~1,906** | |

## 6. Migration Status by Route

| Status | Count |
|--------|-------|
| NOT STARTED | ~1,903 |
| SOURCE MAPPED | ~1,906 (CSV exists) |
| IMPLEMENTED (React) | ~3 |
| AUTOMATED VERIFIED | 0 |
| RUNTIME VERIFIED | ~3 |
| UAT SIGNED | 0 |
| BLOCKED | 0 confirmed (371 candidates) |

**Overall migration completion: ~0.16% (3 of 1,906 routes implemented in React)**

## 7. Why 100% Complete Cannot Be Claimed

A route is NOT complete merely because a React component exists with the same name. Per §10 of the governing prompt, completion requires:
- Source mapped ✓
- Implemented (React rendering) ✓
- Automated verified (unit/integration test)
- Runtime verified (live browser testing)
- UAT signed (department user acceptance)

Zero routes currently meet all five criteria.

