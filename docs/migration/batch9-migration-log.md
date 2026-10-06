# Phase 2 Batch 9: MRD, Discharge Summaries & Registries Migration Log

## 1. Scope & Technical Overview
- **Batch Module:** Medical Records Department (MRD), Discharge Summaries, Medical Certificates & Registries (MLC, Notifiable Diseases, Referrals)
- **Source Database:** MySQL 5.7 (`test` on `localhost:3307`)
- **Target Database:** PostgreSQL 14 (`hims_pilot_db` on `localhost:5432`)
- **API Runtime:** Node.js Express pilot backend on port `:2014`

---

## 2. Table Migrations & Sequence Synchronization

| Table Name | Schema Status | Source MySQL Rows | PostgreSQL Migrated Rows | Sequence Status |
|---|---|---|---|---|
| `mrdfilerequests` | EXISTING | 2,055 | 2,055 | Synchronized |
| `mrdfilelocation` | EXISTING | 1,842 | 1,842 | Synchronized |
| `mrdipfiles` | EXISTING | 67 | 67 | Verified |
| `patientdischargeevent` | EXISTING | 1,051 | 1,053 | Synchronized |
| `referrals` | EXISTING | 44 | 44 | Verified |
| `patientcertificates` | CREATED | 835 | 835 | `patientcertificates_PatientCertificateId_seq` synchronized |
| `referralcharge` | CREATED | 2 | 2 | `referralcharge_ReferralChargeId_seq` synchronized |
| `referralusermap` | CREATED | 2 | 2 | Verified |
| `referralfeedback` | CREATED | 0 | 0 | Schema validated |
| `patientnotifydiseases` | CREATED | 0 | 0 | `patientnotifydiseases_PatientNotifiableDiseaseId_seq` bound |
| `encountermlc` | CREATED | 0 | 0 | `encountermlc_EncounterMLCId_seq` bound |
| `encountermlcofficer` | CREATED | 0 | 0 | `encountermlcofficer_EncounterMLCOfficerId_seq` bound |
| `dischargemedications` | CREATED | 0 | 0 | Schema validated |
| `patientdischargemedications`| CREATED | 0 | 0 | Schema validated |
| `patientdeath` | CREATED | 0 | 0 | Schema validated |

---

## 3. Dialect Compatibility Fixes & Model Associations
1. **BelongsTo Alias Key Binding in MRD Models:**
   - In `FileRequest.Model.ts` and `MRDLocation.Model.ts`, Sequelize defaulted foreign keys for aliases `PRIORITY`, `MRDFileStatus`, `MRDMovementStatus` to uppercase/camelcase variations without explicit foreign key mapping.
   - Updated association configurations with explicit `foreignKey: 'PriorityId'`, `foreignKey: 'MRDFileStatusId'`, and `foreignKey: 'MRDMovementStatusId'`.
2. **Clinical Content & Template Preservation:**
   - `patientcertificates` stores structured JSON clinical narratives in `DataTemplate` (diagnoses, hospital stay course, operative summaries, and discharge medications/advice). Migrated seamlessly into PostgreSQL `TEXT`/`JSONB` without truncation.
3. **Discharge Workflow Lifecycle Integration:**
   - Reused inpatient discharge events recorded in Batch 4 (`patientdischargeevent`) to link discharge summaries, bed clearance, and final medical sign-off.

