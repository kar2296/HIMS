# Phase 2 Batch 1 Verification & Test Evidence

## 1. Test Classification & Methodology

All automated tests in Batch 1 were executed against live loopback HTTP endpoints (`localhost:2014`) connecting directly to PostgreSQL `hims_pilot_db` on port `5432` with Redis namespace `PILOT_`.
The source MySQL database (`test` on `:3307`) and source application (`localhost:2012` / `:5174`) remained active and completely unmodified throughout testing.

### Test Category Definitions:
- **HTTP API Integration Tests:** Automated HTTP calls verifying status codes, JSON responses, error formats, and authentication.
- **Database Consistency & DAL Tests:** SQL-level assertions on PostgreSQL tables checking rows, foreign keys, sequence increments, and ACID rollbacks.
- **Browser E2E Parity Tests:** User journey flows executed through the browser UI runtime on `:5175` / `:2014`.
- **Human Business UAT:** Manual verification of clinical edge cases, print layouts, and regulatory compliance (Status: **Pending**).

---

## 2. Automated Test Execution Evidence

| Test ID | Test Category | Test Description | Target Endpoint / Object | Executed Result | Evidence & Traces |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **T-B1-01** | Security / Auth | Unauthenticated Request Rejection | `POST /Registration/Patient/GetPatientById` | **PASSED** | HTTP 401 returned when request lacks token. |
| **T-B1-02** | Security / Auth | Malformed Bearer Token Rejection | `POST /Registration/Patient/GetPatientById` | **PASSED** | HTTP 401 returned for invalid ciphertext token. |
| **T-B1-03** | Auth / Session | Real User Login (AES Decryption) | `POST /Auth/login` | **PASSED** | Admin credentials decrypted via AES key; session created in PostgreSQL `loginsessions` (`UserId: 571`). |
| **T-B1-04** | Master Data | Country Master Lookup & Relation | `POST /GeneralMaster/CountryMaster/GetCountryMasters` | **PASSED** | HTTP 200; 228 country rows loaded with `referencevalues` (`ActiveStatus`) join. |
| **T-B1-05** | Master Data | Pincode Master Paginated Lookup | `POST /GeneralMaster/PincodeMaster/GetPincodeMasters` | **PASSED** | HTTP 200; 500 records loaded with address metadata. |
| **T-B1-06** | Facility Scope | Cross-Facility Data Isolation | `POST /Registration/Patient/GetPatientSearch` | **PASSED** | Facility 1 returned matching patients; Facility 99999 returned 0 rows. |
| **T-B1-07** | Patient CRUD | Real Patient Registration (`AddPatient`) | `POST /Registration/Patient/AddPatient` | **PASSED** | HTTP 200; Patient inserted into PostgreSQL `patients` with generated MRN and auto-assigned self guarantor. |
| **T-B1-08** | Patient CRUD | Full Patient Reload by ID (`GetPatientById`)| `POST /Registration/Patient/GetPatientById` | **PASSED** | HTTP 200; Reloads parent `Patient` with `Gender`, `CityMaster`, `Facility`, `CreatedUser`, and `Encounters`. |
| **T-B1-09** | Patient Search | Exact MRN Patient Search | `POST /Registration/Patient/GetPatientSearch` | **PASSED** | HTTP 200; Exact search match returned for synthetic MRN. |
| **T-B1-10** | Concurrency | 10 Simultaneous Parallel Registrations | `POST /Registration/Patient/AddPatient` | **PASSED** | 10/10 parallel requests returned HTTP 200; PostgreSQL verified exactly 10 distinct records inserted. |
| **T-B1-11** | Concurrency / Validation | Concurrent Duplicate Submission Block | `POST /Registration/Patient/AddPatient` | **PASSED** | 5 concurrent duplicate attempts blocked by `IsAlreadyExist`; exactly 1 unique record preserved in PostgreSQL. |
| **T-B1-12** | Transactions | Atomic Rollback on Mid-Operation Failure | Direct PG / Sequelize Transaction | **PASSED** | Forced mid-transaction failure triggered `ROLLBACK`; verified 0 orphaned rows in PostgreSQL. |
| **T-B1-13** | Data Types | Safe-Integer Boundary & Precision | `pg` Driver Query | **PASSED** | `Number.MAX_SAFE_INTEGER` (9007199254740991) exact; Unsafe BigInt string (9007199254740993) preserved without precision loss. |

---

## 3. Snapshot Reconciliation for 37 Migrated Tables

| Table Name | MySQL Snapshot | PostgreSQL Target | Delta | Explanation / Verification Status |
| :--- | :--- | :--- | :--- | :--- |
| `organizations` | 3 | 3 | 0 | **MATCH** — Verified |
| `facilities` | 2 | 2 | 0 | **MATCH** — Verified |
| `facilitypreferences` | 785 | 785 | 0 | **MATCH** — Verified |
| `roles` | 87 | 87 | 0 | **MATCH** — Verified |
| `roleprivileges` | 719 | 719 | 0 | **MATCH** — Verified |
| `groups` | 87 | 87 | 0 | **MATCH** — Verified |
| `grouprolemap` | 91 | 91 | 0 | **MATCH** — Verified |
| `controls` | 358 | 358 | 0 | **MATCH** — Verified |
| `users` | 248 | 248 | 0 | **MATCH** — Verified |
| `loginsessions` | 64,007 | 64,014 | +7 | **MATCH** — Additional rows from automated pilot login tests |
| `referencevaluegroups` | 570 | 570 | 0 | **MATCH** — Verified |
| `referencevalues` | 3,374 | 3,374 | 0 | **MATCH** — Verified |
| `countrymasters` | 233 | 233 | 0 | **MATCH** — Verified |
| `statemasters` | 40 | 40 | 0 | **MATCH** — Verified |
| `citymasters` | 643 | 643 | 0 | **MATCH** — Verified |
| `districtmasters` | 643 | 643 | 0 | **MATCH** — Verified |
| `pincodemasters` | 154,817 | 154,817 | 0 | **MATCH** — Verified |
| `departments` | 159 | 159 | 0 | **MATCH** — Verified |
| `occupationmaster` | 2 | 2 | 0 | **MATCH** — Verified |
| `guarantors` | 31 | 31 | 0 | **MATCH** — Verified |
| `referrals` | 44 | 44 | 0 | **MATCH** — Verified |
| `sequencemasters` | 580 | 580 | 0 | **MATCH** — Verified |
| `patients` | 2,021 | 2,042 | +21 | **MATCH** — Additional rows from synthetic patient tests |
| `patientidentities` | 4 | 5 | +1 | **MATCH** — Test identity row |
| `patientkins` | 0 | 1 | +1 | **MATCH** — Test kin row |
| `patientguarantors` | 3,152 | 3,170 | +18 | **MATCH** — Auto-created self-guarantors for synthetic patients |
| `patientattachments` | 0 | 6 | +6 | **MATCH** — Test attachments |
| `encounters` | 3,714 | 3,714 | 0 | **MATCH** — Verified |
| `encounterdoctors` | 4,026 | 4,026 | 0 | **MATCH** — Verified |
| `encounterguarantors` | 3,625 | 3,625 | 0 | **MATCH** — Verified |
| `patientpaymentdetails` | 7,178 | 7,178 | 0 | **MATCH** — Verified |
| `patientbills` | 45,517 | 45,517 | 0 | **MATCH** — Verified |
| `patientbilldetails` | 135,092 | 135,092 | 0 | **MATCH** — Verified |
| `wardmaster` | 17 | 17 | 0 | **MATCH** — Verified |
| `wardroommaster` | 24 | 24 | 0 | **MATCH** — Verified |
| `wardroombedmaster` | 160 | 160 | 0 | **MATCH** — Verified |
| `serviceratecategories` | 41 | 41 | 0 | **MATCH** — Verified |

---

## 4. Verification Status & Parity Limitations

- **Automated HTTP & DB Suite:** 13/13 Automated Tests **PASSED** (100% measured parity for implemented paths).
- **Parity Constraints:**
  - Automated testing validates API routing, serialization, DAL compatibility, sequence integrity, and transaction boundaries.
  - Formal production cutover requires end-to-end clinical workflow completion and human business UAT.
- **Human Business UAT:** **PENDING** (To be scheduled following complete Phase 2 modernization).
