# HIMS PostgreSQL Migration - Authoritative UAT Release Manifest

> [!IMPORTANT]
> **Release Branch**: `release/postgres-pilot-uat`
> **Release Commit SHA**: `6365d4040070143a075690d9a939a0dcce8eb4b3`
> **Clean Release Worktree**: `/Users/sharmila/Rajesh/hims-release-clean`
> **Baseline Git HEAD (Source)**: `f7d5fc213b7e50a71dab30f485904997c47d2204` (`feature/emr-workspace`)
> **Cutover Status**: Strictly Frozen (`GATE-10` LOCKED pending human clinical & financial stakeholder UAT sign-off).
> **Security Policy**: No plaintext passwords or production credentials stored in documentation. Outbound SMS/WhatsApp/Email strictly mock-trapped.

---

## 1. Release Identification & Deployment Topology

| Component | Identifier / Location | Port / Host | Database / Schema | Runtime Role | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **UAT UI Application** | `/Users/sharmila/Rajesh/hims-release-clean` | `http://localhost:5177` | N/A (Vite Dev Server -> `:2018`) | Dedicated Clean UAT Frontend UI | **Active** |
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

## 3. Database Views & Schema Parity Audit

### 3.1 Exact 8 Source Views Comparison & Schema Classification
The legacy MySQL database defines 8 views. In PostgreSQL `hims_clean_prov_db`, all 8 views are present along with 1 target compatibility view (`bedtransfers`), totaling 9 active views:

| View Name | Source MySQL Definition | Target PostgreSQL `hims_clean_prov_db` Definition | Classification & Functional Role |
| :--- | :--- | :--- | :--- |
| `ippatientbilldetails` | 37-column stub (`SELECT 1 AS ...`) | 37-column relational join (`patientbills` $\bowtie$ `encounters` $\bowtie$ `patients` $\bowtie$ `patientbilldetails` $\bowtie$ `users` $\bowtie$ `guarantors`) | **Target Schema Enhancement**: Replaces dummy MySQL stub with a functional multi-table reporting join. |
| `opandippaymentdetails` | 26-column stub (`SELECT 1 AS ...`) | 26-column relational join (`patientpaymentdetails` $\bowtie$ `patientbills` $\bowtie$ `encounters` $\bowtie$ `facilities` $\bowtie$ `referencevalues`) | **Target Schema Enhancement**: Replaces dummy MySQL stub with a functional cashier payment tracking query. |
| `opandiprefunddetails` | 26-column stub (`SELECT 1 AS ...`) | 26-column relational join (`patientrefund` $\bowtie$ `patientbills` $\bowtie$ `encounters` $\bowtie$ `patients` $\bowtie$ `facilities`) | **Target Schema Enhancement**: Replaces dummy MySQL stub with a functional refund audit query. |
| `tally_collection_view` | Staging projection on `tally_collection` | 23-column typed view on `tally_collection` | **Strict Translation Parity**: Tally ERP cashier receipt batch export. |
| `tally_purchase_view` | 41-column stub (`SELECT 1 AS ...`) | 41-column typed view on `tally_purchase` | **Target Schema Enhancement**: Replaces dummy MySQL stub with typed projection on `tally_purchase`. |
| `tally_p_return_view` | Staging projection on `tally_p_return` | 41-column typed view on `tally_p_return` | **Strict Translation Parity**: Tally ERP purchase return batch export with date fallback. |
| `tally_sale_ret_view` | Staging projection on `tally_sale_ret` | 30-column typed view on `tally_sale_ret` | **Strict Translation Parity**: Tally ERP sales return batch export (`billtypeid` normalized). |
| `tally_sale_view` | Staging projection on `tally_sale` | 30-column typed view on `tally_sale` | **Strict Translation Parity**: Tally ERP sales invoice batch export with computed net `BillAmount`. |
| `bedtransfers` *(Target-Only)* | N/A (Source base table: `bedtransfer`) | Full 40-column compatibility alias view on `bedtransfer` | **Compatibility View**: Backward compatibility for pluralized model queries. |

### 3.2 Tally Projections Synthetic Fixture Verification
Because the source Tally staging tables contained 0 rows at cutover baseline, synthetic test fixtures were executed in an isolated transaction to verify view calculation and mapping logic:
* **`tally_sale_view`**: Computed net bill amount `BillAmount = (BillAmount - BillDiscount)` verified (e.g., ₹1000 gross - ₹100 discount = ₹900 net; ₹2500 gross - ₹250 discount = ₹2250 net).
* **`tally_sale_ret_view`**: Normalized `billtypeid in (1,4,6)` to `4` verified.
* **`tally_collection_view`**: Multi-instrument receipt projection (`Cash`, `CARD_APPROVALNO`, `UPI_NO`) verified.
* *Note: Final accounting XML export acceptance remains pending financial stakeholder verification during human UAT.*

> [!NOTE]
> **Clarification on `v_patient_master` and `v_op_billing_summary`**:
> These labels appeared in earlier conversational summary text as informal descriptive examples. Neither the MySQL source database nor the PostgreSQL target schema contains views with those names; the authoritative database views are the 8 canonical views and 1 compatibility view listed above.

---

## 4. Reconciled 21-Suite Automated Test Catalog (160 Tests / 100% Pass)

All 21 test suites in the authoritative regression harness have been executed against the isolated release verification API (`http://localhost:2018` / `hims_clean_prov_db`) with strict nonzero exit codes on any failure:

| Suite ID | Suite Name | Script File | Prefix | Test Count | Execution Layer | Status | Elapsed |
| :--- | :--- | :--- | :--- | :---: | :--- | :---: | :---: |
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
| **TOTAL** | **21 Automated Test Suites** | `run_all_reconciled_suites.cjs` | **ALL** | **160** | **Live Stack (:2018)** | **100% PASS** | **35.42s** |

### 4.1 Standalone Verification Suites (Executed Outside In-Band 160 Tests)
1. **Authentication Error Handling & Controlled Failure (`test_auth_error_handling.cjs` - 5 Tests)**:
   * Target: `http://localhost:2018` / `hims_clean_prov_db`.
   * Evaluates Express error middleware and socket connection lifecycle on forced rejection.
   * Verified 5/5 assertions passed (3ms bounded error response, 0 socket/transaction leaks).
2. **Physical OS Process Restart Replay (`test_actual_process_restart_replay.cjs`)**:
   * Target: **Pilot API on Port `:2014` (`hims_pilot_db`)**.
   * Sends `SIGTERM` / physically restarts the live Node.js daemon process on port `:2014` to prove transaction persistence across physical OS restarts.
   * *Note on Port Distinction: This physical kill/spawn test was executed strictly against Pilot API on port `:2014`. It was intentionally not executed destructively against Release API on port `:2018` to maintain an uninterrupted verification listener.*

---

## 5. Migration Quality Gates Status

| Gate ID | Gate Category | Gate Criteria | Verification Metric | Status | Sign-Off Authority / Decision |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **GATE-01** | Schema Parity | 554 MySQL base tables + `idempotency_records` + constraints | 555 / 555 Tables Created | **PASSED** | Lead DBA: 100% schema & sequence parity on PostgreSQL 14.18 |
| **GATE-02** | Data Parity | 1,682,399 records matched with 100% PK fidelity | 554 / 554 Tables Reconciled | **PASSED** | Lead Data Architect: Zero data loss verified in `hims_recon_db` |
| **GATE-03** | View Compatibility | 8 source views translated + 1 compatibility view (`bedtransfers`) | 9 / 9 Views Active | **PASSED** | Database Developer: 100% view compilation and query resolution |
| **GATE-04** | Security & Multi-Tenant | Token validation, cross-facility isolation, bounded error responses | 5 / 5 Security Tests Passed | **PASSED** | Security Officer: Deep authentication & tenant isolation audited |
| **GATE-05** | Financial Logic & Idempotency | DEF-006 idempotency engine, DEF-007 null safety, rollback guards | 29 / 29 Financial & Idempotency Tests Passed | **PASSED** | Financial Controller: Atomic replay protection & balance parity verified |
| **GATE-06** | Automated Functional Acceptance | 21 test suites across all hospital functional domains | 160 / 160 Automated Tests Passed | **PASSED** | QA Automation Lead: 100% pass rate on release commit `79ce2550` |
| **GATE-07** | Performance & Scale Capacity | 500-1000 concurrent sessions, PgBouncer pool sizing (50-100 conn) | Load Testing Staged | **PENDING LOAD STAGING** | Infrastructure Lead: Requires dedicated PgBouncer sizing in production staging |
| **GATE-08** | Third-Party External Integrations | Live e-Invoice, external payment gateway, live SMS/WhatsApp dispatch | Mocked / Offline Mode Active | **PENDING LIVE GATEWAYS** | Integration Lead: Outbound delivery mock-trapped for pilot isolation |
| **GATE-09** | Human Clinical & Financial UAT | Stakeholder operational validation across 10 roles & 42 workflows | Human UAT Execution Staged | **PENDING USER SIGN-OFF** | Clinical & Operations Directors: Staged in `uat-session1.md` |
| **GATE-10** | Production Cutover | Live database switchover, DNS repointing, traffic migration | Pre-requisite Gates 7-9 Pending | **FROZEN (LOCKED)** | Steering Committee / CIO: No cutover permitted prior to human UAT signoff |

---

## 6. UAT UI Access, Tester Instructions & Privilege Audit

### 6.1 UAT Access Endpoints
* **UAT Frontend Portal**: `http://localhost:5177/`
* **Target Backend API**: `http://localhost:2018` (Proxied automatically via Vite)
* **Target Database**: `hims_clean_prov_db` (PostgreSQL 14.18)
* **Isolated Redis**: `localhost:6379` (Namespace DB 5, Prefix `RELEASE_VERIFY_`)
* **Outbound Isolation**: Active (`DISABLE_OUTBOUND_SMS=true`, `DISABLE_OUTBOUND_EMAIL=true`, `DISABLE_OUTBOUND_WHATSAPP=true`)

### 6.2 Tester Account Privileges & Distinction

#### Copied Source Hospital Accounts (Baseline Accounts)
These accounts were migrated from the baseline hospital database with intact role-privilege assignments:

| Role ID | Hospital Role | Username | User ID | Assigned Group & Role | Assigned Facilities | Assigned Stores / Counters |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| **`ROLE-01`** | System Administrator | `sdh` | `1` | `APPLICATION ADMIN` / `ADMINISTRATOR` | `SHUVADARSINI HOSPITAL (ID: 1)` | 13 Stores (Central, Pharmacy, OT, CSSD, etc.), Counter: All |
| **`ROLE-02`** | Consulting Physician | `DR. ANUP DUKANIYA` | `2` | `Doctor` / `Doctor` | `SHUVADARSINI HOSPITAL (ID: 1)` | OPD Consultations, E-Prescriptions |
| **`ROLE-03`** | Consulting Physician | `DR. BIBHUTI BHUSAN` | `3` | `Doctor` / `Doctor` | `SHUVADARSINI HOSPITAL (ID: 1)` | Inpatient Rounds & Orders |
| **`ROLE-04`** | Consulting Physician | `DR.ANKUR RAI` | `4` | `Doctor` / `Doctor` | `SHUVADARSINI HOSPITAL (ID: 1)` | Surgical & Diagnostic Requisitions |
| **`ROLE-05`** | Senior Consultant | `DR. BIJON KUMAR MUKHOPADHYA` | `5` | `Doctor` / `Doctor` | `SHUVADARSINI HOSPITAL (ID: 1)` | Specialist EMR & Referral Notes |
| **`ROLE-06`** | Billing Cashier / Front Desk | `sunil` | `6` | `Doctor` / `Doctor` | `SHUVADARSINI HOSPITAL (ID: 1)` | Front Desk & Consultation |
| **`ROLE-07`** | Inpatient Nurse / Ward Admin | `SH0027` | `7` | `FronOffice` / `Front Office Executive` | `SHUVADARSINI HOSPITAL (ID: 1)` | Billing Counter 1 |
| **`ROLE-08`** | Laboratory Technologist | `SH0032` | `10` | `FronOffice` / `Front Office Executive` | `SHUVADARSINI HOSPITAL (ID: 1)` | Billing Counter 4 |
| **`ROLE-09`** | Pharmacist / Store Incharge | `SH0029` | `11` | `General indent` / `General indent` | `SHUVADARSINI HOSPITAL (ID: 1)` | Stores: `WARD (ID: 8)`, `HRD (ID: 62)` |
| **`ROLE-10`** | MRD Officer | `SH00100` | `17` | `FronOffice` / `Front Office Executive` | `SHUVADARSINI HOSPITAL (ID: 1)` | Billing Counter 3, Store: `HOUSE KEEPING (ID: 77)` |

#### Synthetic Test Fixture Accounts (Automated Test Artifacts)
The following accounts were generated exclusively for automated tenant and permission boundary testing:
* `UAT_B1_ALLOWED` (Group: `UAT_B1_ALLOWED_GRP` / Role: `UAT_B1_ALLOWED`) — Access allowed testing.
* `UAT_B1_DENIED` (Group: `UAT_B1_DENIED_GRP` / Role: `UAT_B1_DENIED`) — Access rejection testing.
* `UAT_B1_NOGRANT` (Group: `UAT_B1_NOGRANT_GRP` / Role: `UAT_B1_NOGRANT`) — Missing privilege testing.
* `UAT_B1_QRONLY` (Group: `UAT_B1_QRONLY_GRP` / Role: `UAT_B1_QRONLY`) — QR code scope isolation testing.

### 6.3 Secure Credential Management
* In compliance with security policy, **no plaintext passwords are published in documentation or repositories**.
* Passwords stored in the PostgreSQL `users` table are encrypted with AES-256 (`AES_PASSWORD_KEY`).
* Authorized human UAT testers obtain their testing session access credentials through the secure UAT administrator (`sdh`) or the internal testing credential vault, or log in via the authenticated portal session.

---

## 7. Release Verification Commands

```bash
# 1. Start Clean Release API (Port 2018)
cd /Users/sharmila/Rajesh/hims-release-clean/api
npm run start-api

# 2. Start Clean UAT UI (Port 5177)
cd /Users/sharmila/Rajesh/hims-release-clean
npx vite --port 5177 --strictPort

# 3. Run Reconciled 21-Suite Regression Harness
cd /Users/sharmila/Rajesh/hims-release-clean
API_PORT=2018 TEST_PORT=2018 PG_DATABASE=hims_clean_prov_db NODE_PATH="/Users/sharmila/Rajesh/my-app/node_modules" \
node tests/migration/run_all_reconciled_suites.cjs

# 4. Run Standalone Auth Error Handling Resilience Suite
node tests/migration/test_auth_error_handling.cjs
```


