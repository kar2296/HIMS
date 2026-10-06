# Phase 2 Batch 7: OT, CSSD & Surgery Scheduling Migration Log

## 1. Scope & Execution Overview
- **Batch Module:** Operation Theatre (OT), CSSD and Surgery Scheduling
- **Source Database:** MySQL 5.7 (`test` on `localhost:3307`)
- **Target Database:** PostgreSQL 14 (`hims_pilot_db` on `localhost:5432`)
- **API Runtime:** Node.js Express pilot backend on port `:2014`
- **UI Dev Server:** Vite dev server on port `:5175`

---

## 2. Table Migrations & Sequence Synchronization

| Table Name | Schema Status | Source MySQL Rows | PostgreSQL Migrated Rows | Sequence Status |
|---|---|---|---|---|
| `surgeryroommasters` | CREATED | 8 | 8 | `surgeryroommasters_SurgeryRoomId_seq` synchronized |
| `hims_surgeryschedule` | CREATED | 21 | 21 | `hims_surgeryschedule_OTScheduleId_seq` synchronized |
| `hims_surgeryscheduledetails` | CREATED | 21 | 21 | `hims_surgeryscheduledetails_OTScheduleDetailId_seq` synchronized |
| `hims_surgeryentry` | CREATED | 9 | 9 | `hims_surgeryentry_SurgeryEntryId_seq` synchronized |
| `hims_surgeryentrydetails` | CREATED | 9 | 9 | `hims_surgeryentrydetails_SurgeryEntryDetailId_seq` synchronized |
| `otrequest` | CREATED | 0 | 0 | Schema validated |
| `otdocuments` | CREATED | 0 | 0 | Schema validated |
| `otnotes` | CREATED | 0 | 0 | Schema validated |
| `preoperativechecklist` | CREATED | 0 | 0 | Schema validated |
| `preoperativechecklistdetails` | CREATED | 0 | 0 | Schema validated |
| `surgeryadvice` | CREATED | 0 | 0 | Schema validated |
| `hims_patientsurgicals` | CREATED | 3 | 3 | `hims_patientsurgicals_PatientSurgicalId_seq` synchronized |
| `checklist` | CREATED | 0 | 0 | Schema validated |
| `guarantorchecklist` | CREATED | 0 | 0 | Schema validated |
| `surgicalsiteinfection` | CREATED | 0 | 0 | Schema validated |
| `cssditemsetup` | NOT IN SOURCE DB | 0 | 0 | Unmaterialized source model documented |

---

## 3. Dialect Compatibility & Key Technical Findings
1. **Primary Key Auto-Increment:**
   - Handled via `BIGSERIAL PRIMARY KEY` / `SERIAL PRIMARY KEY` with automatic sequence binding.
   - Initialized `setval` to `COALESCE(MAX(id), 0) + 1` so application inserts do not experience key collision.
2. **Column Naming Alignments:**
   - In `hims_surgeryschedule`, foreign key to OT room is `OTRoomId`.
   - In `hims_surgeryscheduledetails`, parent foreign key is `OTScheduledId`.
   - In `hims_surgeryentry`, foreign key to schedule is `SurgeryScheduleId` and OT room is `SurgeryRoomId`.
3. **CSSD Setup Disposition:**
   - Model `CssdItemSetUp.Model.ts` exists in source code repository, but underlying table was not present in MySQL source database (`test`). Documented in manifest as an unmaterialized model.

