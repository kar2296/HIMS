# HIMS PostgreSQL Migration - UAT Account Verification & Privilege Audit

> [!IMPORTANT]
> **Release Branch**: `release/postgres-pilot-uat`
> **Target Database**: `hims_clean_prov_db` (PostgreSQL 14.18 on localhost:5432)
> **Verification Stack**: API `http://localhost:2018` | UI `http://localhost:5177` | Redis Namespace DB 5
> **Cutover Status**: Strictly Frozen (`GATE-10` LOCKED pending human clinical & financial stakeholder UAT sign-off).
> **Security Policy**: Zero plaintext passwords published in documentation or public repositories. Passwords managed via secure credential retrieval.

---

## 1. Dedicated Pilot Human UAT Accounts

To enable isolated end-to-end human validation across all 10 hospital operational domains without polluting baseline production accounts or granting excessive administrative privileges to all testers, 10 dedicated pilot accounts were configured in `hims_clean_prov_db`:

| Account Username | Hospital Role | User ID | User Group & Role | Assigned Facility | Assigned Counters / Stores / Wards |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **`uat_registration`** | Registration / Front Desk Lead | `625` | `FronOffice` (ID: 6) / `Front Office Executive` | `SHUVADARSINI HOSPITAL (ID: 1)` | Billing Counter 1 |
| **`uat_cashier`** | Billing Cashier / Cash Office | `626` | `BILLING` (ID: 96) / `Billing` | `SHUVADARSINI HOSPITAL (ID: 1)` | Billing Counter 2, Store: `OP PHARMACY (ID: 2)` |
| **`uat_doctor`** | Consulting Physician / EMR | `627` | `Doctor` (ID: 11) / `Doctor` | `SHUVADARSINI HOSPITAL (ID: 1)` | OPD Consultation Rooms, E-Prescribe |
| **`uat_nurse`** | Inpatient Nurse / Ward Admin | `628` | `Nurse + Radiology` (ID: 95) / `IP Nurse` | `SHUVADARSINI HOSPITAL (ID: 1)` | Wards: `GENERAL WARD MALE (15)`, `GENERAL WARD FEMALE (16)`, Store: `WARD (8)` |
| **`uat_lab`** | Laboratory Technologist | `629` | `Lab Technician` (ID: 94) / `Lab` | `SHUVADARSINI HOSPITAL (ID: 1)` | Pathology / Biochemistry Workstations |
| **`uat_pharmacy`** | Chief Pharmacist / Store Lead | `630` | `Pharmacy Manager` (ID: 91) / `pharmacy Manager` | `SHUVADARSINI HOSPITAL (ID: 1)` | Stores: `CENTRAL STORE (1)`, `OP PHARMACY (2)` |
| **`uat_ot`** | OT Nurse Incharge | `631` | `OPERATION THEATER` (ID: 107) / `Operation theatre` | `SHUVADARSINI HOSPITAL (ID: 1)` | Stores: `OT (9)`, `OT CONSIGNMENT (4)` |
| **`uat_insurance`** | TPA & Corporate Claims Officer | `632` | `Insurance` (ID: 116) / `Insurance` | `SHUVADARSINI HOSPITAL (ID: 1)` | Pre-Auth & Credit Ledger Workstations |
| **`uat_mrd`** | Medical Records Officer | `633` | `MRD` (ID: 89) / `MRD` | `SHUVADARSINI HOSPITAL (ID: 1)` | Store: `MRD (72)`, Discharge Summary Desk |
| **`uat_admin`** | System Administrator | `634` | `APPLICATION ADMIN` (ID: 5) / `ADMINISTRATOR` | `SHUVADARSINI HOSPITAL (ID: 1)` | All Counters, All Stores, Global Settings |

---

## 2. Account Taxonomy & Privilege Governance

To maintain traceability and auditability, accounts in the PostgreSQL environment are strictly categorized:

1. **Copied Baseline Hospital Accounts (e.g. `sdh`, `DR. ANUP DUKANIYA`, `sunil`, `SH0027`)**:
   - Migrated from the source hospital database baseline.
   - Retain original clinical and financial history for backward-compatibility verification.
2. **Dedicated Pilot Human UAT Accounts (`uat_registration` through `uat_admin`)**:
   - Provisioned specifically in `hims_clean_prov_db` with domain-specific role mappings.
   - Standardized for human UAT execution without altering historical patient transactions.
3. **Synthetic Automated Test Fixtures (`UAT_B1_ALLOWED`, `UAT_B1_DENIED`, `UAT_B1_NOGRANT`, `UAT_B1_QRONLY`)**:
   - Generated dynamically by automated test suites for negative permission and multi-tenant boundary checks.

---

## 3. Password Storage & Verification Architecture Audit

### 3.1 Mechanism Analysis
An audit of the authentication router ([`Auth.ts`](file:///Users/sharmila/Rajesh/hims-release-clean/api/src/Server/Modules/SystemSettings/Router/Auth.ts)) and user model confirms the following cryptographic design:

* **In-Flight Transport Security**: Client submissions encrypt authentication payloads using symmetric AES (`CryptoJS.AES.encrypt` with `AES_PASSWORD_KEY`).
* **Server-Side Decryption**: The server decrypts in-flight ciphertext using `process.env.AES_PASSWORD_KEY` to extract the plaintext string.
* **Database Representation**: Passwords in `users.Password` are stored as **direct plaintext strings** (or encrypted tokens), and evaluated via direct string equality (`user.dataValues.Password !== pwd`).
* **Cryptographic Classification**: Passwords are **NOT hashed** using a one-way cryptographic hash function (e.g., bcrypt, Argon2, PBKDF2). Reversible symmetric encryption is utilized for transport payload protection.

### 3.2 Security Finding & Compatibility Policy
> [!WARNING]
> **Documented Security Finding (SEC-AUTH-01)**:
> Database password storage relies on reversible plaintext comparison rather than salted cryptographic one-way hashing.
>
> **Migration Policy**: In accordance with migration constraints, authentication compatibility is strictly preserved for UAT without silently altering schema or password hashing routines. A one-way hashing upgrade (e.g. bcrypt / Argon2) is scheduled for post-migration hardening under change control.

---

## 4. Privilege & Access Control Verification Evidence

Each dedicated account was evaluated through the live HTTP API (`http://localhost:2018`) and database mappings:

1. **Authentication Verification**:
   - All 10 accounts authenticate successfully with valid credentials, generating session tokens bound to `FacilityId: 1`.
   - Invalid password attempts are rejected with `HTTP 401 Unauthorized`.
2. **Workflow Authorization**:
   - `uat_registration` is restricted to patient demographic and outpatient registration flows.
   - `uat_cashier` is mapped to Billing Counter 2 and OP Pharmacy.
   - `uat_doctor` is granted clinical EMR SOAP notes and prescription authoring rights.
   - `uat_nurse` is granted bed occupancy and ward transfer access across Male and Female General Wards.
   - `uat_pharmacy` is restricted to Central Store (1) and OP Pharmacy (2).
   - `uat_ot` is restricted to OT (9) and OT Consignment (4).
   - `uat_mrd` is restricted to MRD store (72) and discharge summary registry.
   - `uat_admin` is the sole account with global administrator and system settings privileges.
3. **Cross-Facility Tenant Isolation**:
   - Forged requests specifying `FacilityId: 99999` are constrained by session token bindings and denied cross-tenant data access.

---

## 5. Database Views Classification & Parity Scope

The 8 source database views and 1 target compatibility view are categorized as follows:

1. **Target Schema Enhancements (Functional Multi-Table Joins)**:
   - `ippatientbilldetails`, `opandippaymentdetails`, `opandiprefunddetails`, and `tally_purchase_view`.
   - These replace dummy `SELECT 1 AS ...` 1-row stubs present in the source MySQL database with complete relational queries joining patient bills, encounters, users, guarantors, facilities, and refund ledgers.
2. **Strict Translation Parity (Staging Projections)**:
   - `tally_collection_view`, `tally_p_return_view`, `tally_sale_ret_view`, and `tally_sale_view`.
   - These project columns from Tally staging tables with typed date and calculation conversions (e.g. net `BillAmount` calculation and `billtypeid` normalization).
3. **Target Compatibility View**:
   - `bedtransfers` mapping to `bedtransfer`.

*Live Tally ERP XML export verification and downstream accounting acceptance remains pending human financial tester sign-off.*

---

## 6. Standalone Restart Test Execution Note

* **Tested Component**: Pilot API on port `:2014` (`hims_pilot_db`).
* **Harness**: [`tests/migration/test_actual_process_restart_replay.cjs`](file:///Users/sharmila/Rajesh/hims-release-clean/tests/migration/test_actual_process_restart_replay.cjs).
* **Port Distinction**: The standalone physical restart replay test was executed specifically against the Pilot daemon (`:2014`). It was intentionally not executed destructively against the Release Verification daemon (`:2018`) to maintain an active, uninterrupted regression and UAT listener.

---

## 7. Human UAT Sign-off Status

* `GATE-01` to `GATE-06`: **PASSED**
* `GATE-07` (Performance & Scale Capacity): **PENDING LOAD STAGING**
* `GATE-08` (Third-Party External Integrations): **PENDING LIVE GATEWAYS (MOCK TRAPPED)**
* `GATE-09` (Human Clinical & Financial UAT): **PENDING USER SIGN-OFF**
* `GATE-10` (Production Cutover): **FROZEN (LOCKED)**
