# HIMS PostgreSQL Migration - Authoritative UAT Release Manifest

> [!IMPORTANT]
> **Release Branch**: `release/postgres-pilot-uat`
> **Release Commit SHA**: `f3a2068f8995ad6eac23a7a5f00be6702a5704b3` (`f3a2068f`)
> **Baseline Git HEAD**: `f7d5fc213b7e50a71dab30f485904997c47d2204`
> **Cutover Status**: Strictly Frozen (`GATE-10` LOCKED pending human clinical & financial stakeholder UAT sign-off).
> **Security Policy**: No plaintext passwords or production credentials stored in documentation. Outbound SMS/WhatsApp/Email strictly mock-trapped.

---

## 1. Release Identification & Deployment Topology

| Component | Identifier / Location | Port / Host | Database / Schema | Runtime Role |
| :--- | :--- | :--- | :--- | :--- |
| **Pilot UI Application** | `/Users/sharmila/Rajesh/hims-pg-pilot` | `http://localhost:5175` | N/A (Vite Dev Server) | Active Pilot Frontend UI |
| **Pilot API Service** | `/Users/sharmila/Rajesh/hims-pg-pilot/api` | `http://localhost:2014` | Node.js Express / Sequelize | Active Pilot Backend API |
| **Pilot Primary Database** | PostgreSQL 16 (Isolated) | `localhost:5432` | `hims_pilot_db` (554 Tables, 8 Views, `idempotency_records`) | Active Pilot Database |
| **Rehearsal Baseline DB** | PostgreSQL 16 (Clean Baseline) | `localhost:5432` | `hims_recon_db` (554 Tables, 8 Views, `idempotency_records`) | Full 1:1 Rehearsal Baseline |
| **Source Reference DB** | MySQL 5.7 (Untouched Baseline) | `localhost:3307` | `test` (554 Tables, 8 Views) | Read-Only Source Reference |
| **Source Reference UI/API** | Source Application | `:5174` / `:2012` | Legacy MySQL baseline stack | Read-Only Comparison Stack |

---

## 2. Environment Baseline & Domain Scope Clarifications

### 2.1 MySQL Source Environment Status
* MySQL 5.7 on port `3307` is maintained as an **untouched read-only reference baseline**.
* No migration writes, pilot mutations, or UAT transactions are routed to MySQL `localhost:3307`.
* The running source API on port `2012` executes against MySQL from `/Users/sharmila/Rajesh/my-app/api` and is completely unaffected by PostgreSQL-specific enhancements.

### 2.2 CSSD (Central Sterile Supply Department) Scope
* The CSSD module is **absent in the legacy MySQL source codebase and database schema**.
* CSSD workflows are explicitly classified as `ABSENT_IN_SOURCE` (not verified functionality). No legacy tables, screens, or routes existed in the source MySQL application for CSSD.

---

## 3. Working Tree Modifications & Release Branch Delta

The pilot release branch `release/postgres-pilot-uat` captures the migration artifacts at commit `f3a2068f8995ad6eac23a7a5f00be6702a5704b3`:
1. **`DEF-006` Atomic Payment Idempotency Engine:**
   - Table `idempotency_records` added in PostgreSQL (`hims_pilot_db`, `hims_recon_db`) with unique index `("IdempotencyKey", "FacilityId", "OperationType")`.
   - `HimsPatientPaymentDetailsBo.ts`/`.js` updated with SHA-256 canonical payload fingerprinting and atomic PostgreSQL `INSERT ... ON CONFLICT DO NOTHING` deduplication.
   - `HimsPatientPaymentDetailsRoute.ts`/`.js` updated to parse `X-Idempotency-Key` headers.
   - Replay protection guarantees: fast double-clicks return cached receipt with 0 duplicate DB writes; payload tampering returns HTTP 409 Conflict.
2. **`DEF-007` Financial Null Safety:**
   - Null-safe fallback guards (`|| 0`) added across `TDSAmount`, `AgreementDiscountAmt`, and `Disallowed` in `HimsPatientPaymentDetailsBo`.
3. **Outbound Messaging Trap:**
   - `GetSmsProvider()` in `Base/Business/Index.ts` and `sendRefundSms()` in `HimsPatientRefundBo.ts` intercepted to return offline mock status `{ status: 'MOCKED_OUTBOUND', success: true }`. Verified via `test_outbound_guards.cjs`.
4. **HTTP Error Code Preservation:**
   - `Bootstrap.ts`/`.js` updated to preserve HTTP status codes (`e.statusCode || e.status || 500`) for RFC 7807 and 409 Conflict responses instead of hardcoding 404.
5. **Clean Database Smoke Test (`hims_uat_smoke_db`):**
   - Verified clean database provisioning and versioned migration of `idempotency_records` on a separate temporary test database via `smoke_test_clean_db.cjs`.

---

## 4. Reconciled 21-Suite Automated Test Catalog (160 Tests / 100% Pass)

All 21 test suites have been executed against the live PostgreSQL pilot API (`:2014`) and database (`hims_pilot_db`), achieving a **100% pass rate** with strict nonzero exit codes on any failure. The machine-readable catalog is exported at [`docs/migration/authoritative-test-catalog.csv`](file:///Users/sharmila/Rajesh/my-app/docs/migration/authoritative-test-catalog.csv).

| Suite ID | Suite Name | Script File | Prefix | Test Count | Execution Layer | Status |
| :--- | :--- | :--- | :---: | :---: | :--- | :---: |
| **SUITE-01** | Batch 1: Registration & Core Masters | `test_batch1.cjs` | `B1` | 10 | HTTP API / DB | `PASSED` |
| **SUITE-02** | Batch 2: Billing & Cashier | `test_batch2.cjs` | `B2` | 12 | HTTP API / DB | `PASSED` |
| **SUITE-03** | Batch 3: Pharmacy & Inventory | `test_batch3.cjs` | `B3` | 11 | HTTP API / DB | `PASSED` |
| **SUITE-04** | Batch 4: IP Management & Bed Allocation | `test_batch4.cjs` | `B4` | 10 | HTTP API / DB | `PASSED` |
| **SUITE-05** | Batch 5: EMR & Consultations | `test_batch5.cjs` | `B5` | 10 | HTTP API / DB | `PASSED` |
| **SUITE-06** | Batch 6: LIS & Diagnostics | `test_batch6.cjs` | `B6` | 11 | HTTP API / DB | `PASSED` |
| **SUITE-07** | Batch 7: OT & Surgery Scheduling | `test_batch7.cjs` | `B7` | 11 | HTTP API / DB | `PASSED` |
| **SUITE-08** | Batch 8: Insurance & Corporate Packages | `test_batch8.cjs` | `B8` | 12 | HTTP API / DB | `PASSED` |
| **SUITE-09** | Batch 9: MRD & Registries | `test_batch9.cjs` | `B9` | 11 | HTTP API / DB | `PASSED` |
| **SUITE-10** | Batch 10: MIS Reports & Ledger | `test_batch10.cjs` | `B10` | 8 | Direct DB | `PASSED` |
| **SUITE-11** | Phase 3: Schema & Full Data Parity | `test_phase3.cjs` | `P3` | 10 | Direct DB | `PASSED` |
| **SUITE-12** | Phase 4: Security & SQL Injection | `test_phase4_security.cjs` | `SEC` | 5 | HTTP API / DB | `PASSED` |
| **SUITE-13** | Deep AuthZ Multi-Facility Isolation | `test_deep_authz.cjs` | `AUTHZ` | 3 | HTTP API / DB | `PASSED` |
| **SUITE-14** | Tax Math Parity (Inclusive vs Exclusive) | `test_tax_math_parity.cjs` | `TAX-MATH` | 4 | Business Logic / DB | `PASSED` |
| **SUITE-15** | Financial Concurrency & Balances | `test_financial_concurrency.cjs` | `FIN-CONC` | 7 | HTTP API / DB | `PASSED` |
| **SUITE-16** | Payment Replay Audit | `test_payment_replay_concurrency.cjs` | `REPLAY` | 4 | HTTP API / DB | `PASSED` |
| **SUITE-17** | Refund Failure Injection | `test_refund_failure_injection.cjs` | `REF-INJ` | 3 | HTTP API / DB | `PASSED` |
| **SUITE-18** | Payment Idempotency & Replay Remediation | `test_idempotency_payment.cjs` | `IDEM` | 9 | HTTP API / DB | `PASSED` |
| **SUITE-19** | Tax API Lifecycle & Persistence | `test_tax_api_lifecycle.cjs` | `TAX-API` | 2 | HTTP API / DB | `PASSED` |
| **SUITE-20** | Physical API Process Restart Replay | `test_actual_process_restart_replay.cjs` | `RESTART` | 3 | HTTP API / DB | `PASSED` |
| **SUITE-21** | Outbound Communication Guards | `test_outbound_guards.cjs` | `GUARD` | 4 | Env / Service Adapter | `PASSED` |
| **TOTAL** | **21 Automated Test Suites** | `authoritative-test-catalog.csv` | **ALL** | **160** | **Live Stack** | **100% PASS** |

---

## 5. Complete 770-Action Verification Inventory Summary

Detailed in [`docs/migration/workflow-action-coverage.csv`](file:///Users/sharmila/Rajesh/my-app/docs/migration/workflow-action-coverage.csv):
* **`BROWSER_VERIFIED` (`STAGED_FOR_HUMAN_UAT`)**: **226 actions** (Interactive browser UI save/edit/reload, modal forms, table filters, DOM renders).
* **`API_DB_VERIFIED_ONLY` (`PENDING_HUMAN_UAT`)**: **544 actions**
  - **386 actions (`BACKEND_STREAMING_EXPORT_OR_TEMPLATE`):** Headless PDF/Excel streaming export and print format render pipelines.
  - **158 actions (`HEADLESS_API_TRANSACTION_OR_DB_RELATION`):** Relational master lookups and backend database integrity queries.
* **`PENDING / BLOCKED`**: **0 actions** in core application migration scope.

---

## 6. Verified Startup & Configuration Instructions

### Prerequisites
* PostgreSQL 16 running on `localhost:5432` with database `hims_pilot_db`.
* Node.js v20+ / v24 installed.
* Ports `2014` (Pilot API) and `5175` (Pilot UI) available.

```bash
# 1. Checkout Pilot Release Branch
cd /Users/sharmila/Rajesh/my-app
git checkout release/postgres-pilot-uat

# 2. Start Pilot API Service (Port 2014)
cd /Users/sharmila/Rajesh/hims-pg-pilot/api
npm run build
node dist/src/index.js

# 3. Start Pilot React UI (Port 5175)
cd /Users/sharmila/Rajesh/hims-pg-pilot
npx vite --port 5175

# 4. Execute Full Verification Suites (160 Tests)
node /Users/sharmila/Rajesh/hims-pg-pilot/build_full_authoritative_catalog.cjs

# 5. Execute First Human UAT Session
# Follow detailed step-by-step procedures in docs/migration/uat-session1.md
```

---

## 7. Role Account Secure Credential Access

> [!NOTE]
> Plaintext credentials are excluded from documentation. Roles access test accounts using credentials provisioned in local environment variables.

| Role Designation | UAT Username | Permitted Scope | Credential Variable |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin` | Super-User Access (System Settings, Masters, All Modules) | `UAT_ADMIN_PASSWORD` |
| **Cashier / Billing Clerk** | `cashier1` | OP Billing, Cashier Collections, Refunds, Shift Summaries | `UAT_TEST_PASSWORD` |
| **Consulting Physician** | `doctor1` | OPD EMR, Consultation Notes, Vitals, E-Prescriptions | `UAT_TEST_PASSWORD` |
| **Ward Nurse / Inpatient** | `nurse1` | IP Admissions, Bed Allocation & Transfers, Vitals | `UAT_TEST_PASSWORD` |
| **Chief Pharmacist** | `pharmacy1` | Prescription Dispense, Stock Transfers, GRN Receipts | `UAT_TEST_PASSWORD` |
| **Laboratory Technician** | `labtech1` | Test Ordering, Sample Accessioning, Result Release | `UAT_TEST_PASSWORD` |
| **OT In-Charge Nurse** | `otadmin1` | Surgery Scheduling, Pre-Op Checklist, Surgery Entry | `UAT_TEST_PASSWORD` |
| **Insurance / TPA Officer**| `insurance1`| Guarantee Letters (GL), Corporate Packages, Claim Settlement | `UAT_TEST_PASSWORD` |
| **Medical Records Officer** | `mrduser1` | Discharge Summaries, MRD Tracking, Birth/Death Registries | `UAT_TEST_PASSWORD` |
