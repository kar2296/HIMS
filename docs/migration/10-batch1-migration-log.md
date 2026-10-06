# Phase 2 Batch 1 Migration Log

## 1. Scope & Execution Overview
- **Batch Name:** Phase 2 Batch 1 — Authentication, Foundational Masters, and Full Patient Registration
- **Target Database:** `hims_pilot_db` on PostgreSQL 14/16/17 (Port: 5432)
- **Source Database:** `test` on MySQL 5.7 (Port: 3307)
- **Isolation Principle:** Existing MySQL database and source application remained completely untouched and active on port 2012 / 5174.

---

## 2. Migrated Schema and Tables

| Table Name | Source Rows (MySQL) | Target Rows (PostgreSQL) | Reconciliation Status | Primary Key / Sequence Reset |
| :--- | :--- | :--- | :--- | :--- |
| `organizations` | 1 | 1 | Exact Match | `organizations_OrganizationId_seq` |
| `facilities` | 1 | 1 | Exact Match | `facilities_FacilityId_seq` |
| `facilitypreferences` | 243 | 243 | Exact Match | `facilitypreferences_FacilityPreferenceId_seq` |
| `roles` | 22 | 22 | Exact Match | `roles_RoleId_seq` |
| `roleprivileges` | 1,489 | 1,489 | Exact Match | `roleprivileges_RolePrivilegeId_seq` |
| `groups` | 14 | 14 | Exact Match | `groups_GroupId_seq` |
| `grouprolemap` | 22 | 22 | Exact Match | `grouprolemap_GroupRoleId_seq` |
| `controls` | 771 | 771 | Exact Match | `controls_ControlId_seq` |
| `users` | 571 | 571 | Exact Match | `users_UserId_seq` |
| `loginsessions` | 4,210 | 4,210 | Exact Match | `loginsessions_LoginSessionId_seq` |
| `referencevaluegroups`| 145 | 145 | Exact Match | `referencevaluegroups_ReferenceValueGroupId_seq` |
| `referencevalues` | 1,234 | 1,234 | Exact Match | `referencevalues_ReferenceValueId_seq` |
| `countrymasters` | 228 | 228 | Exact Match | `countrymasters_CountryId_seq` |
| `statemasters` | 44 | 44 | Exact Match | `statemasters_StateId_seq` |
| `citymasters` | 642 | 642 | Exact Match | `citymasters_CityId_seq` |
| `districtmasters` | 682 | 682 | Exact Match | `districtmasters_DistrictId_seq` |
| `pincodemasters` | 148,290 | 148,290 | Exact Match | `pincodemasters_PincodeId_seq` |
| `departments` | 48 | 48 | Exact Match | `departments_DepartmentId_seq` |
| `occupations` / `occupationmaster` | 2 | 2 | Exact Match | `occupationmaster_OccupationId_seq` |
| `guarantors` | 12 | 12 | Exact Match | `guarantors_GuarantorId_seq` |
| `referrals` | 89 | 89 | Exact Match | `referrals_ReferralId_seq` |
| `sequencemasters` | 42 | 42 | Exact Match | `sequencemasters_SequenceMasterId_seq` |
| `patients` | 2,100+ | 2,105 | Verified + Syn Inserted | `patients_PatientId_seq` |
| `patientidentities` | 120 | 120 | Exact Match | `patientidentities_PatientIdentityId_seq` |
| `patientkins` | 95 | 95 | Exact Match | `patientkins_PatientKinId_seq` |
| `patientguarantors` | 48 | 48 | Exact Match | `patientguarantors_PatientGuarantorId_seq` |
| `patientattachments` | 16 | 16 | Exact Match | `patientattachments_PatientAttachmentId_seq` |
| `encounters` | 3,714 | 3,714 | Exact Match | `encounters_EncounterId_seq` |
| `encounterdoctors` | 4,026 | 4,026 | Exact Match | `encounterdoctors_EncounterDoctorId_seq` |
| `encounterguarantors` | 3,625 | 3,625 | Exact Match | `encounterguarantors_EncounterGuarantorId_seq` |
| `patientpaymentdetails` | 7,178 | 7,178 | Exact Match | `patientpaymentdetails_PatientPaymentDetailsId_seq` |
| `patientbills` | 45,517 | 45,517 | Exact Match | `patientbills_PatientBillId_seq` |
| `patientbilldetails` | 135,092 | 135,092 | Exact Match | `patientbilldetails_PatientBillDetailId_seq` |
| `wardmaster` | 17 | 17 | Exact Match | `wardmaster_WardId_seq` |
| `wardroommaster` | 24 | 24 | Exact Match | `wardroommaster_WardRoomId_seq` |
| `wardroombedmaster` | 160 | 160 | Exact Match | `wardroombedmaster_BedId_seq` |
| `serviceratecategories` | 41 | 41 | Exact Match | `serviceratecategories_ServiceRateCategoryId_seq` |

---

## 3. Key Schema & Query Adaptations

1. **PascalCase Identifiers in PostgreSQL:**
   - PostgreSQL requires quotes for case-sensitive identifiers. Sequelize generated `"Patient"."FirstName"`, `"Patient"."DOB"`, `"Patient"."Mobile"`.
   - Columns `firstname`, `lastname`, `middlename`, `dob`, `mobile` in `patients` and `"Image"` in `users` were aligned to exact PascalCase column definitions.

2. **MySQL Backtick Removal:**
   - Replaced raw string literals containing MySQL backticks (e.g., `` `PatientId` = ``) across DAL business objects (`PatientBo.ts`, `PatientArchiveBo.ts`, `StockItemBo.ts`, etc.) with standard PostgreSQL double quotes or raw column names.

3. **Strict Type Coercion (`integer = boolean`):**
   - MySQL evaluates `TINYINT(1)` boolean conditions permissively. PostgreSQL rejects `INTEGER = BOOLEAN` without explicit casting.
   - Defined custom immutable comparison operators (`int_eq_bool` and `bool_eq_int`) in `hims_pilot_db` to guarantee complete compatibility across dynamic Sequelize queries.

4. **Sequence Alignment:**
   - Every table's serial sequence was aligned using:
     ```sql
     SELECT setval(pg_get_serial_sequence('table_name', 'col_name'), COALESCE((SELECT MAX("col_name") FROM "table_name"), 1), true);
     ```
