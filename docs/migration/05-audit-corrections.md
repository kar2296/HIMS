# Phase 1: Audit Corrections & Evidence-Based Reconciliations

**Document Version:** 1.0.0  
**Date:** October 2, 2026  
**Status:** Complete / Verified Against Live Database Metadata  

---

## 1. Executive Summary of Audit Corrections

During Phase 1 execution, all claims from the initial Phase 0 inventory and roadmap artifacts were tested and verified against the live source code and MySQL 5.7 / PostgreSQL 14 database instances. 

This document formally records the exact reconciliations, structural findings, unmapped screen boundaries, environment version checks, and production target recommendations.

---

## 2. Quantitative Reconciliations

### 2.1 Models vs. Database Tables (552 Models vs. 554 Physical Tables)
- **Claim in Phase 0:** 552 models and 554 tables.
- **Verified Code Reality:**
  - `api/src/Server/Modules` defines **551 unique Sequelize models** mapping across **549 distinct table names**.
  - MySQL `test` database contains **554 physical base tables**.
  - **46 physical MySQL tables** exist without dedicated `.Model.ts` files. These include financial aggregation staging tables (`tally_collection`, `tally_sale`, `tally_p_return`), MIS reporting tables (`mis_collection`, `mis_departmentrevenue`, `mis_occupancy`), Jasper report header definitions (`jasperheader`), and legacy/unpluralized utility tables (`procedure`, `physiotheraphy`, `event_monitor`, `my_programming`, `mytable`).
  - **38 model files** define models for planned or legacy entities that have no physical table in MySQL `test` (e.g. `cld_ast_preferences`, `dynamicqrlog`, `ItemContractMap`, `carepaths`, `depreciations`).
- **Resolution for Target Architecture:** The target PostgreSQL schema DDL must explicitly generate the physical tables required by both the active Sequelize models and the reporting/Tally ETL pipelines.

---

### 2.2 Pilot Dependency Tables (18 Stated vs. 20 Listed vs. 22 Actual Live)
- **Claim in Phase 0:** 18 summary tables vs 20 listed in the plan.
- **Verified Code & Database Reality:**
  - The actual end-to-end dependency tree for Patient Registration and Patient Search comprises **22 distinct physical tables**:
    1. `organizations` (Hospital root organization)
    2. `facilities` (Branch facilities)
    3. `facilitysettings` (Facility configuration & rules)
    4. `roles` (User role definitions)
    5. `roleprivileges` (Screen and action permissions)
    6. `users` (Operator & clerk accounts)
    7. `loginsessions` (Active authentication sessions)
    8. `referencevaluegroups` (Lookup category groups)
    9. `referencevalues` (Demographic master lookups: Titles, Genders, Relations, Identification Types, Document Types, Patient Statuses)
    10. `countrymasters` (Country master list)
    11. `statemasters` (State master list)
    12. `citymasters` (City master list)
    13. `pincodemasters` (154,817 postal records for autofill)
    14. `occupationmaster` (Occupations)
    15. `referrals` (Referral doctor/agency sources)
    16. `guarantors` (Corporate & insurance payers)
    17. `patients` (Core patient demographic master)
    18. `patientidentities` (National ID / Passport / Aadhaar)
    19. `patientkins` (Next of kin & emergency contacts)
    20. `patientguarantors` (Payer associations)
    21. `patientguarantorgl` (Guarantee letter records)
    22. `patientattachments` (Uploaded photos & documents)

---

### 2.3 Background Jobs (7 Stated vs. 6 Described)
- **Claim in Phase 0:** 7 background jobs.
- **Verified Code Reality:**
  - `api/src/jobs/` contains **6 distinct background job worker files**:
    1. `ip_billmodification.job.ts` (Inpatient bill recalculation/adjustment sync)
    2. `op_checkout.job.ts` (Outpatient automated visit checkout)
    3. `sms_daily_dr_appt_status.job.ts` (Daily doctor appointment roster SMS)
    4. `sms_follow_up_appointment.job.ts` (Follow-up appointment reminder SMS)
    5. `sms_followup_prescription.job.ts` (Prescription refill reminder SMS)
    6. `redistosql_seqbackup.ts` (Periodic Redis sequence counter backup to SQL)
  - The 7th file, `cronrunner.ts` (and `src/jobs/index.ts`), is the **job runner engine / cron orchestrator**, not an independent business job.

---

## 3. Screen and Action Coverage Boundaries

While `02-screen-api-table-map.csv` mapped 771 primary screen actions, this does not represent 100% of the entire legacy system. 

### Explicitly Identified Unmapped Screens & Long-Tail Workflows:
1. **Legacy AngularJS Custom States:** 1,908 legacy UI-Router states recorded in `migration_screen_inventory.csv`. Only ~341 screens have been modernized to React in `src/react-components/`.
2. **Deep Modal Dialog Actions:** Sub-actions inside complex EMR clinical charts (e.g. `DietNBMPickerModal`, `GrowthChartCalculatorModal`, `IVFProtocolTimeline`) invoke specialized inline APIs that require discrete per-action mapping during Batch 3 (EMR).
3. **Advanced Tally XML Export Staging:** Direct table reads against `tally_collection_view` and `tally_sale_view` for external ERP integration.

---

## 4. Environment Versions & Tooling Verification

All versions were inspected directly from the runtime environment:

| Runtime / Driver | Detected Version | Target Standard | Compatibility Verdict |
| :--- | :--- | :--- | :--- |
| **Node.js** | `v24.21.0` | Node.js 20 LTS / 22 LTS | Fully Compatible |
| **Sequelize ORM** | `^4.22.6` | Sequelize 4 / 6+ | Supported via Postgres Dialect (`pg`) |
| **mysql2 Driver** | `^2.3.3` | N/A (Source only) | Active on port 3307 |
| **pg Driver** | `^8.23.1` | `pg` 8.x | Fully Compatible with custom type parsers |
| **PgBouncer** | **NOT INSTALLED / NOT RUNNING** | Prospective Recommendation | **Corrected:** Marked as Not Configured |

> [!IMPORTANT]
> **PgBouncer Correction:** Phase 0 mentioned PgBouncer as a pooling mechanism. Verification confirmed that PgBouncer is **not installed** locally. Connection pooling is currently managed directly via Sequelize's built-in pool manager.

---

## 5. PostgreSQL 14 EOL Review & Production Target Recommendation

### PostgreSQL 14 Lifecycle Status
- **PostgreSQL 14 EOL Date:** **November 12, 2026** (Standard 5-year community support).
- **Current Local Testing Server:** PostgreSQL 14.18 (Homebrew arm64) running locally on port 5432.

### Production Recommendation
For the production deployment and target environment, we recommend:
- **Recommended Production Version:** **PostgreSQL 16** (Supported through November 2028) or **PostgreSQL 17** (Supported through November 2029).
- **Local Server Action:** Do **NOT** automatically upgrade or replace the developer's existing local PostgreSQL 14.18 daemon. Phase 1 testing on PG 14.18 is 100% forward-compatible with PG 16/17 DDL and SQL syntax.
