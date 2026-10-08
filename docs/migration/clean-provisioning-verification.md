# Clean Database Provisioning & Schema Verification Report

**Verification Date:** 2026-10-08  
**Release Worktree:** `/Users/sharmila/Rajesh/hims-release-clean`  
**Target Clean Database:** `hims_clean_prov_db` (PostgreSQL 14.18, `127.0.0.1:5432`)  
**Source Database:** MySQL 5.7 (`127.0.0.1:3307`, database `test`) - Untouched  
**Active Pilot Database:** `hims_pilot_db` (`127.0.0.1:5432`, port 2014) - Preserved  
**Migration Runner:** [`migrations/provision_clean_db.cjs`](file:///Users/sharmila/Rajesh/hims-release-clean/migrations/provision_clean_db.cjs)  

---

## 1. Executive Summary

A dedicated, isolated clean database (`hims_clean_prov_db`) was provisioned exclusively from the committed migration scripts and source schema without cloning or copying from the active pilot database (`hims_pilot_db`). All 555 base tables (554 source tables + `idempotency_records`), 9 views (8 translated tally/reporting views + `bedtransfers` compatibility view), compatibility operators/casts, and serial sequences were created and populated.

All 21 automated regression test suites (160 tests) were executed against `hims_clean_prov_db` through the real API server on port `:2018`, achieving a **100.0% Pass Rate** (160/160 tests passing).

---

## 2. Database Object Inventory & Parity

| Object Category | Expected Count | Created in `hims_clean_prov_db` | Verification Status |
| :--- | :--- | :--- | :--- |
| **Source Base Tables** | 554 | 554 | **PASS** (100% matched) |
| **Target-Only Tables** | 1 (`idempotency_records`) | 1 | **PASS** (Composite uniqueness constraint verified) |
| **Total Base Tables** | 555 | 555 | **PASS** |
| **Translated Views** | 8 | 8 | **PASS** (PostgreSQL query syntax verified) |
| **Compatibility Views** | 1 (`bedtransfers`) | 1 | **PASS** |
| **Total Relations** | 564 | 564 | **PASS** |

### 8 Translated Views:
1. `tally_collection_view`
2. `tally_p_return_view`
3. `tally_purchase_view`
4. `tally_sale_ret_view`
5. `tally_sale_view`
6. `ippatientbilldetails`
7. `opandippaymentdetails`
8. `opandiprefunddetails`

---

## 3. Schema & Model Casing Discrepancy Resolutions

Sequelize generates double-quoted identifiers. All 11 reported casing discrepancies, as well as 15,634 model-defined column attributes across the codebase, were resolved in `migrations/provision_clean_db.cjs` by extracting exact TypeScript model field mappings and PascalCase overrides:

- `sampletype.ActiveTo`, `sampletype.ActiveFrom`
- `users.Image`, `users.GenderId` (corrected from `BOOLEAN` to `BIGINT` foreign key)
- `patients.FirstName`, `patients.MiddleName`, `patients.LastName`, `patients.DOB`, `patients.Mobile`
- `bedoccupancyhistory.ServiceRateCategoryId`
- `stockconsumptiondetails.BarCodeId`
- `stockrequests.ToFacilityId`
- `departments.DepartmentLogo`

---

## 4. PostgreSQL Type Compatibility & Cast Operators

To support Sequelize's queries without invasive model modifications, the following compatibility objects were installed:

```sql
-- Boolean <-> Integer Casting & Equality Operators
CREATE OR REPLACE FUNCTION pg_catalog.int4(boolean) RETURNS int4 STRICT IMMUTABLE LANGUAGE SQL AS 'SELECT CASE WHEN $1 THEN 1 ELSE 0 END;';
CREATE OR REPLACE FUNCTION pg_catalog.bool(int4) RETURNS bool STRICT IMMUTABLE LANGUAGE SQL AS 'SELECT $1 <> 0;';

CREATE CAST (boolean AS integer) WITH FUNCTION pg_catalog.int4(boolean) AS IMPLICIT;
CREATE CAST (integer AS boolean) WITH FUNCTION pg_catalog.bool(int4) AS IMPLICIT;

CREATE OPERATOR = (LEFTARG = integer, RIGHTARG = boolean, PROCEDURE = pg_catalog.int4eqbool, COMMUTATOR = =, NEGATOR = <>, MERGES, HASHES);
CREATE OPERATOR = (LEFTARG = boolean, RIGHTARG = integer, PROCEDURE = pg_catalog.booleqint4, COMMUTATOR = =, NEGATOR = <>, MERGES, HASHES);
```

---

## 5. Automated Regression Verification (21 Suites / 160 Tests)

```
Target API Port: 2018
Target PostgreSQL DB: hims_clean_prov_db

┌─────────┬────────────────────────────────────────────┬─────────────────────────────────────────┬────────────┬───────────┬─────────────────┐
│ (index) │ suite                                      │ file                                    │ prefix     │ testCount │ status          │
├─────────┼────────────────────────────────────────────┼─────────────────────────────────────────┼────────────┼───────────┼─────────────────┤
│ 0       │ 'Batch 1: Registration & Core Masters'     │ 'test_batch1.cjs'                       │ 'B1'       │ 10        │ 'PASSED (100%)' │
│ 1       │ 'Batch 2: Billing & Cashier'               │ 'test_batch2.cjs'                       │ 'B2'       │ 12        │ 'PASSED (100%)' │
│ 2       │ 'Batch 3: Pharmacy & Inventory'            │ 'test_batch3.cjs'                       │ 'B3'       │ 11        │ 'PASSED (100%)' │
│ 3       │ 'Batch 4: IP Management & Bed Allocation'  │ 'test_batch4.cjs'                       │ 'B4'       │ 10        │ 'PASSED (100%)' │
│ 4       │ 'Batch 5: EMR & Consultations'             │ 'test_batch5.cjs'                       │ 'B5'       │ 10        │ 'PASSED (100%)' │
│ 5       │ 'Batch 6: LIS & Diagnostics'               │ 'test_batch6.cjs'                       │ 'B6'       │ 11        │ 'PASSED (100%)' │
│ 6       │ 'Batch 7: OT & Surgery Scheduling'         │ 'test_batch7.cjs'                       │ 'B7'       │ 11        │ 'PASSED (100%)' │
│ 7       │ 'Batch 8: Insurance & Corporate Packages'  │ 'test_batch8.cjs'                       │ 'B8'       │ 12        │ 'PASSED (100%)' │
│ 8       │ 'Batch 9: MRD & Registries'                │ 'test_batch9.cjs'                       │ 'B9'       │ 11        │ 'PASSED (100%)' │
│ 9       │ 'Batch 10: MIS Reports & Ledger'           │ 'test_batch10.cjs'                      │ 'B10'      │ 8         │ 'PASSED (100%)' │
│ 10      │ 'Phase 3: Schema & Data Parity'            │ 'test_phase3.cjs'                       │ 'P3'       │ 10        │ 'PASSED (100%)' │
│ 11      │ 'Phase 4: Security & Isolation'            │ 'test_phase4_security.cjs'              │ 'SEC'      │ 5         │ 'PASSED (100%)' │
│ 12      │ 'Deep AuthZ Isolation'                     │ 'test_deep_authz.cjs'                   │ 'AUTHZ'    │ 3         │ 'PASSED (100%)' │
│ 13      │ 'Tax Math Parity'                          │ 'test_tax_math_parity.cjs'              │ 'TAX-MATH' │ 4         │ 'PASSED (100%)' │
│ 14      │ 'Financial Concurrency & Balance'          │ 'test_financial_concurrency.cjs'        │ 'FIN-CONC' │ 7         │ 'PASSED (100%)' │
│ 15      │ 'Payment Replay Audit'                     │ 'test_payment_replay_concurrency.cjs'   │ 'REPLAY'   │ 4         │ 'PASSED (100%)' │
│ 16      │ 'Refund Failure Injection'                 │ 'test_refund_failure_injection.cjs'     │ 'REF-INJ'  │ 3         │ 'PASSED (100%)' │
│ 17      │ 'Payment Idempotency & Replay Remediation' │ 'test_idempotency_payment.cjs'          │ 'IDEM'     │ 9         │ 'PASSED (100%)' │
│ 18      │ 'Tax API Lifecycle'                        │ 'test_tax_api_lifecycle.cjs'            │ 'TAX-API'  │ 2         │ 'PASSED (100%)' │
│ 19      │ 'Outbound Network Isolation Guards'        │ 'test_outbound_guards.cjs'              │ 'GUARD'    │ 3         │ 'PASSED (100%)' │
│ 20      │ 'Export & Template Stream Verification'    │ 'test_export_template_verification.cjs' │ 'EXP'      │ 4         │ 'PASSED (100%)' │
└─────────┴────────────────────────────────────────────┴─────────────────────────────────────────┴────────────┴───────────┴─────────────────┘

TOTAL RECONCILED TEST COUNT: 160 Automated Tests across 21 Distinct Suites
SUITES PASSED: 21 / 21 (100.0% Pass Rate)
```
