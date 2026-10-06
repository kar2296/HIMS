# Phase 2 Batch 2 Migration Log

## 1. Scope & Execution Overview
- **Batch Name:** Phase 2 Batch 2 — Clinical Masters, Appointments, and Full OPD Clinical Workflow
- **Target Database:** `hims_pilot_db` on PostgreSQL 14/16/17 (Port: 5432)
- **Source Database:** `test` on MySQL 5.7 (Port: 3307)
- **Isolation Principle:** The source MySQL application (`localhost:2012`, `localhost:5174`) and database remained completely untouched and operational. All migrations and tests executed strictly against the isolated PostgreSQL pilot environment (`/Users/sharmila/Rajesh/hims-pg-pilot` on `localhost:2014` / `localhost:5175`).

---

## 2. Migrated Schema and Tables Reconciliation

| Table Name | Source Rows (MySQL) | Target Rows (PostgreSQL) | Reconciliation Status | Primary Key / Sequence Reset |
| :--- | :--- | :--- | :--- | :--- |
| **Sub-Batch 2A: Clinical Masters** | | | | |
| `diagnosis` | 10,238 | 10,238 | Exact Match | `diagnosis_DiagnosisId_seq` |
| `drugmasters` | 4,492 | 4,492 | Exact Match | `drugmasters_DrugId_seq` |
| `genericmasters` | 1,457 | 1,457 | Exact Match | `genericmasters_GenericId_seq` |
| `serviceitems` | 1,923 | 1,923 | Exact Match | `serviceitems_ServiceItemId_seq` |
| `servicecategories` | 93 | 93 | Exact Match | `servicecategories_ServiceCategoryId_seq` |
| `servicegroups` | 13 | 13 | Exact Match | `servicegroups_ServiceGroupId_seq` |
| `serviceitemtariffdetails` | 69,692 | 69,692 | Exact Match | `serviceitemtariffdetails_ServiceItemTariffDetailId_seq` |
| `serviceitempackagemap` | 1,465 | 1,465 | Exact Match | `serviceitempackagemap_ServiceItemPackageMapId_seq` |
| `serviceitemfacilitymap` | 1,923 | 1,923 | Exact Match | `serviceitemfacilitymap_ServiceItemFacilityMapId_seq` |
| `serviceitemalias` | 1,799 | 1,799 | Exact Match | `serviceitemalias_ServiceItemAliasId_seq` |
| `serviceratecategories` | 41 | 41 | Exact Match | `serviceratecategories_ServiceRateCategoryId_seq` |
| `vitalmasters` | 13 | 13 | Exact Match | `vitalmasters_VitalId_seq` |
| `notetemplate` | 5 | 5 | Exact Match | `notetemplate_NoteTemplateId_seq` |
| `allergymasters` | 2 | 2 | Exact Match | `allergymasters_AllergyId_seq` |
| `patientallergies` | 3 | 3 | Exact Match | `patientallergies_PatientAllergyId_seq` |
| `hims_templatemasters` | 49 | 49 | Exact Match | `hims_templatemasters_TemplateMasterId_seq` |
| `hims_templatemasterdetails` | 156 | 156 | Exact Match | `hims_templatemasterdetails_TemplateMasterDetailId_seq` |
| `gstmaster` | 11 | 11 | Exact Match | `gstmaster_GstId_seq` |
| `hims_virtualcategory` | 11 | 11 | Exact Match | `hims_virtualcategory_CategoryId_seq` |
| `ippackages` | 348 | 348 | Exact Match | `ippackages_IPPackageId_seq` |
| `ippackagetariffdetails` | 6,529 | 6,529 | Exact Match | `ippackagetariffdetails_IPPackageTariffDetailId_seq` |
| `remarks` | 76 | 76 | Exact Match | `remarks_RemarkId_seq` |
| **Sub-Batch 2B: Appointments** | | | | |
| `appointments` | 2,688 | 2,688 | Exact Match | `appointments_AppointmentId_seq` |
| `appointmentdisplay` | 2,492 | 2,492 | Exact Match | `appointmentdisplay_AppointmentDisplayId_seq` |
| `patienttrackers` | 4,731 | 4,731 | Exact Match | `patienttrackers_PatientTrackerId_seq` |
| `appointmentcategories` | 2 | 2 | Exact Match | `appointmentcategories_AppointmentCategoryId_seq` |
| `appointmentsessions` | 1 | 1 | Exact Match | `appointmentsessions_AppointmentSessionId_seq` |
| `appointmentmultisessions` | 1 | 1 | Exact Match | `appointmentmultisessions_AppointmentMultiSessionId_seq` |
| **Sub-Batch 2C: Full OPD Workflow** | | | | |
| `encounters` | 3,714 | 3,714 | Exact Match | `encounters_EncounterId_seq` |
| `encounterdoctors` | 4,026 | 4,026 | Exact Match | `encounterdoctors_EncounterDoctorId_seq` |
| `consultations` | 23 | 23 | Exact Match | `consultations_ConsultationId_seq` |
| `hims_patientvitals` | 5,161 | 5,161 | Exact Match | `hims_patientvitals_PatientVitalId_seq` |
| `hims_patientclinicalnotes` | 4 | 4 | Exact Match | `hims_patientclinicalnotes_PatientClinicalNoteId_seq` |
| `patientdiagnosis` | 0 | 0 | Exact Match | `patientdiagnosis_PatientDiagnosisId_seq` |
| `hims_prescriptions` | 11,736 | 11,736 | Exact Match | `hims_prescriptions_PrescriptionId_seq` |
| `hims_prescriptiondetails` | 2,348 | 2,348 | Exact Match | `hims_prescriptiondetails_PrescriptionDetailId_seq` |
| `patientorders` | 5,360 | 5,360 | Exact Match | `patientorders_PatientOrderId_seq` |
| `patientorderdetails` | 13,130 | 13,130 | Exact Match | `patientorderdetails_PatientOrderDetailId_seq` |
| `hims_treatmentplan` | 17 | 17 | Exact Match | `hims_treatmentplan_TreatmentPlanId_seq` |
| `hims_treatmentplandetails` | 157 | 157 | Exact Match | `hims_treatmentplandetails_TreatmentPlanDetailId_seq` |
| `hims_treatmentplanfollowup` | 15 | 15 | Exact Match | `hims_treatmentplanfollowup_TreatmentPlanFollowUpId_seq` |
| `hims_clinicaldocuments` | 219 | 219 | Exact Match | `hims_clinicaldocuments_ClinicalDocumentId_seq` |
| `hims_dailynotes` | 1 | 1 | Exact Match | `hims_dailynotes_DailyNoteId_seq` |
| `hims_doctorcategorymap` | 185 | 185 | Exact Match | `hims_doctorcategorymap_DoctorCategoryMapId_seq` |
| `hims_orderfavorites` | 6 | 6 | Exact Match | `hims_orderfavorites_TickSheetMasterId_seq` |
| `hims_orderfavoritedetails` | 71 | 71 | Exact Match | `hims_orderfavoritedetails_TickSheetDetailId_seq` |
| `hims_orderfollowup` | 1 | 1 | Exact Match | `hims_orderfollowup_OrderFollowUpId_seq` |
| `hims_patientcriticalorders` | 86 | 86 | Exact Match | `hims_patientcriticalorders_PatientCriticalOrderId_seq` |

---

## 3. Key DDL Translations & PostgreSQL Adaptations

1. **Identifier Case & Sequelize Mapping:**
   - Double-quoted column identifiers (`"ServiceItemId"`, `"PrescriptionId"`, `"EncounterId"`) preserve casing required by Sequelize model queries.
2. **Numeric Precision:**
   - Financial and clinical measurement fields (`Rate`, `"ItemCost"`, `"Amount"`, `"OrderTotal"`, `"EstimationCost"`) mapped to PostgreSQL `NUMERIC(18,4)` to prevent floating point drift.
3. **Temporal Standardization:**
   - MySQL `DATETIME` and `TIMESTAMP` columns converted to PostgreSQL `TIMESTAMPTZ` with timezone preservation.
4. **Sequence Initialization:**
   - All auto-increment primary key sequences synchronized with `setval(pg_get_serial_sequence('table', 'Column'), MAX("Column"), true)` preventing primary key collisions on new record generation.
