# HIMS PostgreSQL Migration - Authoritative UAT Release Manifest

> [!IMPORTANT]
> **Release Branch**: `release/postgres-pilot-uat`
> **Release Commit SHA**: `61645ba51fd1a97c0183080a5650ad9d890c577f`
> **Clean Release Worktree**: `/Users/sharmila/Rajesh/hims-release-clean`
> **Baseline Git HEAD (Source)**: `f7d5fc213b7e50a71dab30f485904997c47d2204` (`feature/emr-workspace`)
> **Cutover Status**: Strictly Frozen (`GATE-10` LOCKED pending human clinical & financial stakeholder UAT sign-off).
> **Security Policy**: No plaintext passwords or production credentials stored in documentation. Outbound SMS/WhatsApp/Email strictly mock-trapped.

---

## 1. Release Identification & Deployment Topology

| Component | Identifier / Location | Port / Host | Database / Schema | Runtime Role | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Clean Release API** | `/Users/sharmila/Rajesh/hims-release-clean/api` | `http://localhost:2018` | `hims_clean_prov_db` (Redis DB 5) | Isolated Verification Daemon | **Active (100% Passed)** |
| **Clean Release Worktree** | `/Users/sharmila/Rajesh/hims-release-clean` | N/A | Branch `release/postgres-pilot-uat` | Isolated Clean Release Package | **Verified** |
| **Pilot UI Application** | `/Users/sharmila/Rajesh/hims-pg-pilot` | `http://localhost:5175` | N/A (Vite Dev Server) | Active Pilot Frontend UI | **Running** |
| **Pilot API Service** | `/Users/sharmila/Rajesh/hims-pg-pilot/api` | `http://localhost:2014` | Node.js Express / Sequelize | Active Pilot Backend API | **Running** |
| **Pilot Primary Database** | PostgreSQL 14.18 (Isolated) | `localhost:5432` | `hims_pilot_db` (555 Tables, 9 Views, `idempotency_records`) | Active Pilot Database | **Active** |
| **Clean Provisioned DB** | PostgreSQL 14.18 (Isolated) | `localhost:5432` | `hims_clean_prov_db` (555 Tables, 9 Views, `idempotency_records`) | Clean Provisioned DB via Migrations | **100% Schema Parity (160/160 Tests Pass)** |
| **Release Verification DB** | PostgreSQL 14.18 (Isolated) | `localhost:5432` | `hims_release_verify_db` (555 Tables, 9 Views, `idempotency_records`) | Isolated Verification DB | **100% Schema Parity** |
| **Rehearsal Baseline DB** | PostgreSQL 14.18 (Clean Baseline) | `localhost:5432` | `hims_recon_db` (555 Tables, 9 Views, `idempotency_records`) | Full 1:1 Rehearsal Baseline | **Active** |
| **Source Reference DB** | MySQL 5.7 (Untouched Baseline) | `localhost:3307` | `test` (554 Tables, 8 Views) | Read-Only Source Reference | **Untouched** |
| **Source Reference UI/API** | `/Users/sharmila/Rajesh/my-app` | `:5174` / `:2012` | Legacy MySQL baseline stack | Read-Only Comparison Stack | **Untouched** |

---

## 2. Environment Baseline & PostgreSQL Engine Version

### 2.1 PostgreSQL Engine Version Verification (PostgreSQL 14.18)
* Direct query assertion via `SELECT version();`:
  ```
  PostgreSQL 14.18 (Homebrew) on aarch64-apple-darwin24.4.0, compiled by Apple clang version 17.0.0 (clang-1700.0.13.3), 64-bit
  ```
* All schema definitions, sequences, BIGSERIAL PKs, JSONB fields, NUMERIC(18,2) monetary fields, and composite unique constraints (`uq_idempotency_key_facility_op`) run natively on PostgreSQL 14.18.

### 2.2 MySQL Source Environment Status
* MySQL 5.7 on port `3307` is maintained as an **untouched read-only reference baseline**.
* No migration writes, pilot mutations, or UAT transactions are routed to MySQL `localhost:3307`.
* The running source API on port `2012` executes against MySQL from `/Users/sharmila/Rajesh/my-app/api` and is completely unaffected by PostgreSQL-specific enhancements.
* The source repository `/Users/sharmila/Rajesh/my-app` remains safely on its active feature branch (`feature/emr-workspace`).

### 2.3 CSSD (Central Sterile Supply Department) Scope
* The CSSD module is **absent in the legacy MySQL source codebase and database schema**.
* CSSD workflows are explicitly classified as `ABSENT_IN_SOURCE` (not verified functionality). No legacy tables, screens, or routes existed in the source MySQL application for CSSD.

---

## 3. Working Tree Modifications & Release Branch Delta

The pilot release branch `release/postgres-pilot-uat` captures the migration artifacts at commit `61645ba51fd1a97c0183080a5650ad9d890c577f`:
1. **`DEF-006` Atomic Payment Idempotency Engine:**
   - Table `idempotency_records` added in PostgreSQL (`hims_release_verify_db`, `hims_pilot_db`, `hims_recon_db`) with unique index `("IdempotencyKey", "FacilityId", "OperationType")`.
   - `HimsPatientPaymentDetailsBo.ts`/`.js` updated with SHA-256 canonical payload fingerprinting and atomic PostgreSQL `INSERT ... ON CONFLICT DO NOTHING` deduplication with explicit `COMPLETED` status lifecycle update.
   - `HimsPatientPaymentDetailsRoute.ts`/`.js` updated to parse `X-Idempotency-Key` headers.
   - Replay protection guarantees: fast double-clicks return cached receipt with 0 duplicate DB writes; payload tampering returns HTTP 409 Conflict.
2. **`DEF-007` Financial Null Safety:**
   - Null-safe fallback guards (`|| 0`) added across `TDSAmount`, `AgreementDiscountAmt`, and `Disallowed` in `HimsPatientPaymentDetailsBo`.
3. **Outbound Messaging Isolation Trap:**
   - `GetSmsProvider()` in `Base/Business/Index.ts` and `sendRefundSms()` in `HimsPatientRefundBo.ts` intercepted to return offline mock status `{ status: 'MOCKED_OUTBOUND', success: true }`.
   - Outbound WhatsApp and Email integrations verified with 0 active external gateways. Verified via `test_outbound_guards.cjs`.
4. **HTTP Error Code Preservation:**
   - `Bootstrap.ts`/`.js` updated to preserve HTTP status codes (`e.statusCode || e.status || 500`) for RFC 7807 and 409 Conflict responses instead of hardcoding 404.
5. **Clean Worktree & Database Smoke Test:**
   - Clean worktree provisioned at `/Users/sharmila/Rajesh/hims-release-clean` without touching the running source checkout.
   - Complete 21-suite test harness verified against port `:2018` and `hims_release_verify_db` with 100% pass rate.

---

## 4. Reconciled 21-Suite Automated Test Catalog (160 Tests / 100% Pass)

All 21 test suites have been executed against the isolated release verification API (`http://localhost:2018` / `hims_release_verify_db`) with strict nonzero exit codes on any failure. The machine-readable catalog is exported at [`tests/migration/test-execution-results.json`](file:///Users/sharmila/Rajesh/hims-release-clean/tests/migration/test-execution-results.json).

| Suite ID | Suite Name | Script File | Prefix | Test Count | Execution Layer | Status | Elapsed |
| :--- | :--- | :--- | :---: | :---: | :--- | :---: | :---: |
| **SUITE-01** | Batch 1: Registration & Core Masters | `test_batch1.cjs` | `B1` | 10 | HTTP API / DB | `PASSED` | 391ms |
| **SUITE-02** | Batch 2: Billing & Cashier | `test_batch2.cjs` | `B2` | 12 | HTTP API / DB | `PASSED` | 290ms |
| **SUITE-03** | Batch 3: Pharmacy & Inventory | `test_batch3.cjs` | `B3` | 11 | HTTP API / DB | `PASSED` | 688ms |
| **SUITE-04** | Batch 4: IP Management & Bed Allocation | `test_batch4.cjs` | `B4` | 10 | HTTP API / DB | `PASSED` | 174ms |
| **SUITE-05** | Batch 5: EMR & Consultations | `test_batch5.cjs` | `B5` | 10 | HTTP API / DB | `PASSED` | 403ms |
| **SUITE-06** | Batch 6: LIS & Diagnostics | `test_batch6.cjs` | `B6` | 11 | HTTP API / DB | `PASSED` | 158ms |
| **SUITE-07** | Batch 7: OT & Surgery Scheduling | `test_batch7.cjs` | `B7` | 11 | HTTP API / DB | `PASSED` | 317ms |
| **SUITE-08** | Batch 8: Insurance & Corporate Packages | `test_batch8.cjs` | `B8` | 12 | HTTP API / DB | `PASSED` | 1067ms |
| **SUITE-09** | Batch 9: MRD & Registries | `test_batch9.cjs` | `B9` | 11 | HTTP API / DB | `PASSED` | 318ms |
| **SUITE-10** | Batch 10: MIS Reports & Ledger | `test_batch10.cjs` | `B10` | 8 | Direct DB | `PASSED` | 308ms |
| **SUITE-11** | Phase 3: Schema & Full Data Parity | `test_phase3.cjs` | `P3` | 10 | Direct DB | `PASSED` | 285ms |
| **SUITE-12** | Phase 4: Security & SQL Injection | `test_phase4_security.cjs` | `SEC` | 5 | HTTP API / DB | `PASSED` | 107ms |
| **SUITE-13** | Deep AuthZ Multi-Facility Isolation | `test_deep_authz.cjs` | `AUTHZ` | 3 | HTTP API / DB | `PASSED` | 175ms |
| **SUITE-14** | Tax Math Parity (Inclusive vs Exclusive) | `test_tax_math_parity.cjs` | `TAX-MATH` | 4 | Business Logic / DB | `PASSED` | 173ms |
| **SUITE-15** | Financial Concurrency & Balances | `test_financial_concurrency.cjs` | `FIN-CONC` | 7 | HTTP API / DB | `PASSED` | 204ms |
| **SUITE-16** | Payment Replay Audit | `test_payment_replay_concurrency.cjs` | `REPLAY` | 4 | HTTP API / DB | `PASSED` | 275ms |
| **SUITE-17** | Refund Failure Injection | `test_refund_failure_injection.cjs` | `REF-INJ` | 3 | HTTP API / DB | `PASSED` | 126ms |
| **SUITE-18** | Payment Idempotency & Replay Remediation | `test_idempotency_payment.cjs` | `IDEM` | 9 | HTTP API / DB | `PASSED` | 760ms |
| **SUITE-19** | Tax API Lifecycle & Persistence | `test_tax_api_lifecycle.cjs` | `TAX-API` | 2 | HTTP API / DB | `PASSED` | 287ms |
| **SUITE-20** | Outbound Network Isolation Guards | `test_outbound_guards.cjs` | `GUARD` | 3 | Env / Mock Adapter | `PASSED` | 49ms |
| **SUITE-21** | Export & Template Stream Verification | `test_export_template_verification.cjs` | `EXP` | 4 | Stream / Template | `PASSED` | 295ms |
| **TOTAL** | **21 Automated Test Suites** | `run_all_reconciled_suites.cjs` | **ALL** | **160** | **Live Stack (:2018)** | **100% PASS** | **6.75s** |

---

## 5. Idempotency Key Replay & Process Restart Proof (DEF-006)

* Verified through `test_idempotency_payment.cjs` and `test_actual_process_restart_replay.cjs`:
  - **IDEM-01**: Initial ₹400.00 payment generates Receipt #7604 (Outstanding due drops from ₹900.00 to ₹500.00).
  - **IDEM-02**: Fast double-click submission with same key & payload returns cached Receipt #7604 with **zero extra financial writes** (Paid stays ₹400.00, Due stays ₹500.00).
  - **IDEM-03**: Tampered payload reuse returns **HTTP 409 Conflict** without altering balance.
  - **IDEM-04**: 3 concurrent parallel requests produce **exactly 1 receipt write** (+₹200.00) (Paid: ₹600.00, Due: ₹300.00).
  - **IDEM-05**: Cold cache / database persistent query retrieves valid completed receipt across process boundaries without mutation.
  - **IDEM-06**: Client retry after simulated dropped connection safely retrieves existing receipt.
  - **IDEM-07**: Transaction rollback on invalid bill produces 0 orphaned payment records.
  - **IDEM-08**: Legitimate final settlement of ₹200.00 correctly brings final outstanding balance to ₹0.00 (`IsPaidFully: true`).
  - **IDEM-09**: Persistent database audit verifies all 4 distinct payment keys stored with unique SHA-256 fingerprints.

---

## 6. Migration Quality Gates Status

| Gate ID | Gate Description | Target Criteria | Verified Status | Sign-off Note |
| :--- | :--- | :--- | :---: | :--- |
| **GATE-01** | Database Schema Parity | 554 Base Tables + 8 Views | **PASSED** | 100% schema & sequence parity on PostgreSQL 14.18 |
| **GATE-02** | Master Data Fidelity | Exact PK ranges & row counts | **PASSED** | Zero row count loss across all foundational masters |
| **GATE-03** | Core Workflow CRUD | OPD, IP, Pharmacy, LIS, Billing | **PASSED** | Batches 1–10 fully executed & passed on port `:2018` |
| **GATE-04** | Payment Idempotency | DEF-006 replay protection | **PASSED** | IDEM-01 through IDEM-09 passed with 0 balance drift |
| **GATE-05** | Financial Null Safety | DEF-007 fallback arithmetic | **PASSED** | TDS, agreement discounts, and disallowances safe |
| **GATE-06** | Outbound Delivery Isolation | Mock guards active | **PASSED** | SMS, WhatsApp, Email trapped with 0 network egress |
| **GATE-07** | Export & Template Streams | CSV / PDF / XLSX generation | **PASSED** | Verified non-empty buffer generation & headers |
| **GATE-08** | Full Automated Regression | 21 Suites / 160 Tests | **PASSED** | 160 / 160 tests passed (100% pass rate) |
| **GATE-09** | Human Clinical & Billing UAT | Stakeholder verification | **PENDING** | Session 1 script prepared in `uat-session1.md` |
| **GATE-10** | Production Cutover | Live DNS & traffic switch | **FROZEN** | Strictly locked pending Gate 09 stakeholder sign-off |

---

## 7. Verified Release Startup Instructions

To start the verified clean release package independently:

```bash
# 1. Navigate to clean release worktree
cd /Users/sharmila/Rajesh/hims-release-clean/api

# 2. Start release API daemon on port 2018 (PostgreSQL 14.18 / hims_release_verify_db)
API_PORT=2018 PG_DATABASE=hims_release_verify_db node -e '
process.chdir("/Users/sharmila/Rajesh/hims-release-clean/api");
require("dotenv").config({ path: "/Users/sharmila/Rajesh/hims-release-clean/api/.env" });
require("/Users/sharmila/Rajesh/hims-release-clean/api/dist/dev/index.js");
'

# 3. Execute 21-suite test harness against port 2018
API_PORT=2018 TEST_PORT=2018 PG_DATABASE=hims_release_verify_db NODE_PATH="/Users/sharmila/Rajesh/my-app/node_modules" \
node /Users/sharmila/Rajesh/hims-release-clean/tests/migration/run_all_reconciled_suites.cjs
```
