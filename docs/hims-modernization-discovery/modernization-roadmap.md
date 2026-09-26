# HIMS Modernization — Roadmap

**Discovery Date:** 2026-09-05
**Status:** READ-ONLY — Discovery artifact. Awaiting owner approval.

## Wave Summary

| Wave | Name | Routes | Risk | Duration (est.) |
|------|------|--------|------|----------------|
| 0 | Baseline & Freeze | 0 | None | DONE |
| 1 | Shared Foundation | 0 | LOW | 2–3 developer-days |
| 2 | Low-Risk Masters | ~30–50 | LOW–MEDIUM | 2–4 weeks |
| 3 | Operational Worklists | ~80–120 | MEDIUM | 4–8 weeks |
| 4 | High-Risk Transactions | ~400–500 | HIGH–CRITICAL | 12–20 weeks |
| 5 | HIMS-Specific Modules | ~400+ | MEDIUM–HIGH | 12–20 weeks |
| 6 | Department UAT & Rollout | All | MEDIUM | 4–8 weeks |

**Total routes to migrate: ~1,906**  
**Estimated duration: 9–18 months** (dependent on team size, UAT availability, blocker resolution)

---

## Wave 0 — Baseline & Freeze (COMPLETE)

**Goal:** Establish verifiable baseline before any implementation.

### Deliverables
- ✅ Reconciled route census: 1,906 states working denominator
- ✅ Build baseline: 32 pre-existing TS errors
- ✅ API inventory: 3,880 route declarations, 3,651 unique paths
- ✅ Privilege inventory: 435+ definitions (all stubbed in React)
- ✅ Database inventory: 1,156 models, force:false confirmed
- ✅ Security audit: no hardcoded secrets
- ✅ Orphaned state candidates: 371 (see docs/orphaned_states_candidate.csv)
- ✅ Discovery artifacts: this documentation set

### Entry Criteria
None (first wave)

### Exit Criteria
All discovery artifacts produced and owner reviewed.

### Rollback
N/A — no changes made.

---

## Wave 1 — Shared Foundation

**Goal:** Build infrastructure all subsequent screen migrations depend on.
**Routes added:** 0 (foundation only)

### Modules
- React utility layer (`src/react-components/utils/`)
- New shared component library (`src/components/common/`)
- CI/CD pipeline

### Tasks
1. Fix 7 duplicate keys in `PrivilegeHelper.ts`
2. Implement all 435+ privilege methods from sessionStorage
3. Build 8 shared components (DataTable, Input, Select, Modal, Loading, EmptyState, ErrorState, PermissionDenied)
4. Add Vitest test runner
5. Add TypeScript build CI step
6. Standardize API path decision (governance document)

### Dependencies
- Owner decisions on all 7 blockers
- Backend team: confirm Session-UserRoles format

### Entry Criteria
All blockers resolved by owner.

### Exit Criteria
- 0 TypeScript errors (after duplicate fixes)
- All 435+ privilege methods tested and correct
- 8 shared components with passing tests
- CI green

### Risk: LOW
### Rollback
Git revert React `src/` only. No Angular, backend, or DB changes.

---

## Wave 2 — Low-Risk Masters

**Goal:** Establish master data migration patterns; prove end-to-end with low-risk screens.

### Modules
- GeneralMaster: City, State, Country, District, Pincode, Occupation (List + Form already in React — verify and complete)
- BillingMaster: service categories, service items, packages (selected)
- ClinicalMaster: simple entities (drug frequency, allergy reaction, procedure alias)

### Routes (~30–50)
All master data CRUD screens in the above modules.

### Dependencies
- Wave 1 complete
- PrivilegeHelper implemented
- Shared component library available

### Entry Criteria
Wave 1 exit criteria met.

### Exit Criteria
Per screen:
- Source mapped ✓
- Angular template hollowed → React component renders ✓
- API connectivity verified (not mocked) ✓
- Privilege gates working (menu + button + backend) ✓
- Unit test green ✓
- TypeScript build ≤32 errors (target: 0)

### Risk: LOW–MEDIUM
### Rollback
Revert React component; Angular template and controller remain as fallback.

---

## Wave 3 — Operational Worklists

**Goal:** Migrate patient-facing worklists and workflow entry points.

### Modules
- Registration: `newregistration`, `patientregistration-form`, `quickregistration`, `fullregistration` (confirm reachability first)
- OP Patient lists (AllOP, MyOP, PreviousOP — already React, verify fully)
- IP Patient lists (AllIP, MyIP, CurrentInpatient — already React, verify)
- Appointment lists
- Lab specimen worklist
- Pharmacy dispense worklist
- Inpatient task worklist

### Routes (~80–120)
All confirmed-reachable worklist and list screens.

### Reachability Rule
**Every screen must be re-verified as reachable before migration begins.** Check `orphaned_states_candidate.csv`; then grep for literal state references in `public/`.

### Dependencies
- Wave 2 complete
- Server-side pagination verified per screen
- Each screen's API contract documented

### Entry Criteria
Wave 2 exit criteria met; reachability verified per screen.

### Exit Criteria
Per screen:
- All Wave 2 criteria met, PLUS:
- Runtime testing with representative roles ✓
- Department lead UAT review ✓
- Rollback verified (revert returns to Angular rendering) ✓

### Risk: MEDIUM
### Rollback
Angular fallback maintained until UAT signed per screen.

---

## Wave 4 — High-Risk Transactions

**Goal:** Migrate financial and clinical transactional screens. Highest risk wave.

### Modules
- OP Billing full flow (bill creation, discount, payment, cancel, refund)
- IP Billing full flow (bed charges, pharmacy, finalization)
- Receipt, Refund, Credit Note, Cancellation
- Claim submission and processing
- Pharmacy dispensing (with allergy/interaction/expiry checks)
- Procurement (GRN, PO)
- Discharge summary (draft, finalize, amend)
- Clinical EMR (vitals, diagnosis, prescription, procedures, notes)
- Lab result authorization

### Routes (~400–500)
All financial transaction and clinical documentation screens.

### Dependencies
- Wave 3 complete
- Billing domain expert assigned
- Clinical domain expert assigned
- Reconciliation queries prepared and reviewed
- `HimsPatientBillsBo.ts` calculation logic documented
- Contract tests for all billing API endpoints

### Entry Criteria
Wave 3 done; billing calculation documentation approved; clinical UAT resource identified.

### Exit Criteria
Per screen (in addition to Wave 3 criteria):
- Billing reconciliation report for OP and IP billing
- Financial transaction count: before vs. after matches exactly
- Clinical UAT signed by named clinician
- Finance UAT signed by named accountant
- Rollback rehearsal conducted and documented
- Monitoring dashboard active

### Risk: HIGH–CRITICAL
### Rollback
Per-screen feature flag; Angular rendering always available as fallback. Rollback must be exercised before any Wave 4 screen goes live.

---

## Wave 5 — HIMS-Specific Modules

**Goal:** Migrate specialty, operational, and patient-facing modules.

### Modules
- Patient Portal (112 states)
- Virtual Healthcare / Teleconsultation
- Quality Management
- Incident Management
- CSSD
- Dietary/Canteen
- Linen & Laundry
- Asset Management
- HR/Payroll
- Blood Bank (if applicable — Decision E required)
- Dialysis (if applicable — Decision E required)
- Tally Integration / Finance Reports
- Reports (full catalogue)

### Routes (~400+)
All remaining specialty and operational screens.

### Dependencies
- Wave 4 complete
- Specialized UAT resources identified for each specialty (QM lead, incident manager, asset manager, etc.)
- Patient Portal strategy decision (Decision D required)

### Risk: MEDIUM–HIGH
### Rollback
Same pattern: Angular fallback until UAT signed.

---

## Wave 6 — Department UAT and Rollout

**Goal:** Full production certification and staged rollout.

### Activities
- Named testers per department (clinical, billing, pharmacy, lab, admin)
- Representative role testing (all roles exercised)
- Safe test records (non-production patient data)
- Financial reconciliation
- Monitoring and alerting
- Rollback drill (simulate Angular fallback activation)
- Owner sign-off
- Staged release: 1 facility → all facilities

### Risk: MEDIUM (operational)
### Exit Criteria
- Owner sign-off
- All department UAT signed
- Rollback rehearsal documented
- Monitoring active
- Go-live approved

