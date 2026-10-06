# HIMS PostgreSQL Migration - Authoritative UAT Release Manifest

> [!IMPORTANT]
> **Environment Status**: Isolated Pilot Environment (PostgreSQL 16, Node.js API `:2014`, React UI `:5175`, Databases `hims_pilot_db` & `hims_recon_db`).
> **Baseline Codebase Commit**: `f7d5fc213b7e50a71dab30f485904997c47d2204` (Main Repository).
> **Cutover Status**: Strictly Frozen (`GATE-10` LOCKED pending human clinical & financial stakeholder UAT sign-off).
> **Security Policy**: No plaintext passwords or production credentials stored in documentation. Outbound SMS/WhatsApp/Email mock-trapped.

---

## 1. Release Identification & Deployment Topology

| Component | Identifier / Location | Port / Host | Database / Schema | Runtime Mode & Role |
| :--- | :--- | :--- | :--- | :--- |
| **Pilot UI Application** | `/Users/sharmila/Rajesh/hims-pg-pilot` | `http://localhost:5175` | N/A (Vite Dev Server) | Isolated Pilot UI |
| **Pilot API Service** | `/Users/sharmila/Rajesh/hims-pg-pilot/api` | `http://localhost:2014` | Node.js Express / Sequelize | Active Pilot API |
| **Pilot Primary Database** | PostgreSQL 16 (Isolated) | `localhost:5432` | `hims_pilot_db` (554 Tables, 8 Views, `idempotency_records`) | Active Pilot Data Store |
| **Rehearsal Baseline DB** | PostgreSQL 16 (Clean Baseline) | `localhost:5432` | `hims_recon_db` (554 Tables, 8 Views, `idempotency_records`) | Full 1:1 Rehearsal Baseline |
| **Source Reference DB** | MySQL 5.7 (Untouched Baseline) | `localhost:3307` | `test` (554 Tables, 8 Views) | Read-Only Source Reference |
| **Source Reference UI/API** | Source Application | `:5174` / `:2012` | Legacy MySQL baseline stack | Read-Only Comparison Stack |

---

## 2. Environment Baseline & Domain Scope Clarifications

### 2.1 MySQL Source Environment Status
* MySQL 5.7 on port `3307` is maintained as an **untouched read-only reference baseline**.
* No migration writes, pilot mutations, or UAT transactions are routed to MySQL `localhost:3307`.
* All write operations and state transitions are executed exclusively against PostgreSQL `hims_pilot_db` on port `5432`.

### 2.2 CSSD (Central Sterile Supply Department) Scope
* The CSSD module is **absent in the legacy MySQL source codebase and database schema**.
* CSSD workflows are explicitly classified as `ABSENT_IN_SOURCE` (not verified functionality). No legacy tables, screens, or routes existed in the source MySQL application for CSSD.

---

## 3. Working Tree Modifications & Uncommitted Changes Catalog

The tested commit is `f7d5fc213b7e50a71dab30f485904997c47d2204`. The following architectural enhancements and defect remediations are implemented in the pilot working tree:

1. **`DEF-006` Atomic Payment Idempotency Engine:**
   - Table `idempotency_records` added in PostgreSQL (`hims_pilot_db` and `hims_recon_db`) with unique index `("IdempotencyKey", "FacilityId", "OperationType")`.
   - `HimsPatientPaymentDetailsBo.ts`/`.js` updated with SHA-256 canonical payload fingerprinting and atomic PostgreSQL `INSERT ... ON CONFLICT DO NOTHING` deduplication.
   - `HimsPatientPaymentDetailsRoute.ts`/`.js` updated to parse `X-Idempotency-Key` headers.
   - Replay protection guarantees: fast double-clicks return cached receipt with 0 duplicate DB writes; payload tampering returns HTTP 409 Conflict.
2. **`DEF-007` Financial Null Safety:**
   - Null-safe fallback guards (`|| 0`) added across `TDSAmount`, `AgreementDiscountAmt`, and `Disallowed` in `HimsPatientPaymentDetailsBo`.
3. **Outbound Messaging Trap:**
   - `GetSmsProvider()` in `Base/Business/Index.ts` and `sendRefundSms()` in `HimsPatientRefundBo.ts` intercepted to return offline mock status `{ status: 'MOCKED_OUTBOUND', success: true }`.
4. **HTTP Error Code Preservation:**
   - `Bootstrap.ts`/`.js` updated to preserve HTTP status codes (`e.statusCode || e.status || 500`) for RFC 7807 and 409 Conflict responses instead of hardcoding 404.
5. **UI Adapters & List Bridges:**
   - React bridge helpers and appointment/session form screen adapters added to support seamless browser navigation.

---

## 4. Reconciled 19-Suite Automated Test Catalog (153 Tests / 100% Pass)

All 19 test suites have been executed against the live PostgreSQL pilot API (`:2014`) and database (`hims_pilot_db`), achieving a **100% pass rate** with strict nonzero exit codes on any failure. The machine-readable catalog is exported at [`docs/migration/authoritative-test-catalog.csv`](file:///Users/sharmila/Rajesh/my-app/docs/migration/authoritative-test-catalog.csv).

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
| **TOTAL** | **19 Automated Test Suites** | `run_all_reconciled_suites.cjs` | **ALL** | **153** | **Live Stack** | **100% PASS** |

---

## 5. Complete 770-Action Verification Inventory Summary

Detailed in [`docs/migration/workflow-action-coverage.csv`](file:///Users/sharmila/Rajesh/my-app/docs/migration/workflow-action-coverage.csv):
* **`BROWSER_VERIFIED`**: **226 actions** (Interactive browser UI save/edit/reload, modal forms, table filters, DOM renders).
* **`API_DB_VERIFIED_ONLY`**: **544 actions** (158 API endpoint/DB queries + 386 streaming export / template render queries verified against PostgreSQL).
* **`PENDING / BLOCKED`**: **0 actions** in core application migration scope.

---

## 6. Readiness Gates Assessment Summary

Detailed in [`docs/migration/readiness-gates.csv`](file:///Users/sharmila/Rajesh/my-app/docs/migration/readiness-gates.csv):

| Gate ID | Gate Category | Status | Verified Evidence & Status Notes |
| :--- | :--- | :---: | :--- |
| **`GATE-01`** | Schema Parity | `PASSED` | 554 / 554 base tables created in PostgreSQL with valid types & constraints. |
| **`GATE-02`** | Data Parity | `PASSED` | 1,682,399 / 1,682,399 records reconciled (0 data loss, multiset hash verified). |
| **`GATE-03`** | View Compatibility | `PASSED` | 8 / 8 views translated and operational (<100ms latency). |
| **`GATE-04`** | Security & Multi-Tenant | `PASSED` | 100% token rejection, header sanitization, Facility 99999 isolated. |
| **`GATE-05`** | Financial Logic & Idempotency | `PASSED (AUTOMATED)` | 26 / 26 financial & idempotency tests passed (inclusive/exclusive tax, DEF-006 replay protection). Staged for human UAT. |
| **`GATE-06`** | Automated Functional Acceptance | `PASSED` | 153 / 153 automated tests passing across 19 suites on live pilot stack. |
| **`GATE-07`** | Performance & Capacity | `PENDING LOAD STAGING` | Local baseline verified (~50 req/s); 500-user UI concurrency & PgBouncer staging pending. |
| **`GATE-08`** | Third-Party Integrations | `MOCK_VERIFIED` | SMS/WhatsApp/e-Invoice mock-trapped; pending live gateway keys post-cutover. |
| **`GATE-09`** | Human Clinical & Financial UAT | `PENDING USER SIGN-OFF` | Test instructions and execution guides staged in `uat-session1.md` for hospital testers. |
| **`GATE-10`** | Production Cutover | `FROZEN (NOT STARTED)` | Strictly locked pending completion and sign-off of Gates 07–09. |

---

## 7. Verified Startup & Execution Instructions

```bash
# 1. Start PostgreSQL 16 Daemon (if not running)
# Ensure port 5432 is accessible and database 'hims_pilot_db' is active

# 2. Build and Start Pilot API Service (Port 2014)
cd /Users/sharmila/Rajesh/hims-pg-pilot/api
npm run build
node dist/src/index.js

# 3. Start Pilot React UI (Port 5175)
cd /Users/sharmila/Rajesh/hims-pg-pilot
npx vite --port 5175

# 4. Execute Full 19-Suite Automated Verification (153 Tests)
node /Users/sharmila/Rajesh/hims-pg-pilot/run_all_reconciled_suites.cjs

# 5. Launch First Human UAT Session
# Follow step-by-step instructions in docs/migration/uat-session1.md
```

---

## 8. Role Account Secure Credential Access

> [!NOTE]
> All plaintext credentials have been excluded from documentation. Roles access test accounts using credentials provisioned in local environment variables.

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
