# EMR Module — Complete Development Specification

**Project:** HIMS — Hospital Information Management System
**Module:** Electronic Medical Records (EMR)
**Spec Version:** 1.0 — Discovery & Planning Phase
**Date:** 2026-09-21
**Status:** READ-ONLY DISCOVERY — No code has been changed.

---

> [!IMPORTANT]
> The referenced documents `healthcare-platform-full-blueprint.pdf`,
> `main-application-comparison-and-change-plan.pdf`, and
> `main-application-comparison-and-change-plan.md` were **not found** at
> `/Users/sharmila/Rajesh/my-app/` (directory is empty) or anywhere else on
> the filesystem. All findings below are derived exclusively from direct
> source-code inspection of the live HIMS repository at
> `hims_modernization_discovery_plan/`. Analysis against those reference
> documents must be completed separately once located. → **Open Question OQ-01**

> [!NOTE]
> This document distinguishes **verified facts** (directly observed in source)
> from **proposals** (design decisions not yet confirmed). All proposals are
> explicitly marked `[PROPOSAL]`.

---

## 1. Module Identity and Scope

### 1.1 Confirmed Module Name

**Module Name:** `EMR` (Electronic Medical Records)

| Item | Value |
|------|-------|
| Backend URL prefix | `POST /EMR/{endpoint}` |
| Angular root state | `patientemr` |
| State file | `public/js/emr-states.js` |
| Backend source | `api/src/Server/Modules/EMR/` |
| Router registration | `Router.ts` line 68 — `route.use('/EMR', EMR)` |
| Authentication | All routes require Bearer token via global `AuthMiddleware` |
| API route count | **540 POST endpoints** (verified) |
| Angular UI states | **162 states** under `patientemr.*` (verified) |
| Database models | **79 Sequelize models → 79 DB tables** (verified) |
| React components | **8 components** registered in `main.tsx` (verified) |

### 1.2 Scope Boundaries

The EMR module is the clinical encounter workspace. It **initiates** orders and **reads** results from downstream modules. It does not own:

| Excluded domain | Owned by |
|----------------|---------|
| Patient registration / demographics | Registration |
| Admission / bed / ward management | IPManagement |
| Lab order execution / result entry | LIS |
| Radiology execution | ⚠️ No dedicated module found — OQ-02 |
| Pharmacy dispensing | Pharmacy |
| Billing and payments | Billing |
| Discharge documentation (final) | DischargeSummary |
| OT scheduling | OtManagement |
| Appointment scheduling | Appointment |

---

## 2. Verified Facts vs Proposals

| # | Claim | Status | Evidence |
|---|-------|--------|----------|
| F-01 | EMR has 540 POST API routes | **VERIFIED** | `grep -c "router.post"` on all EMR Router/*.ts |
| F-02 | EMR has 79 Sequelize models | **VERIFIED** | File count in `Model/` directory |
| F-03 | EMR has 162 Angular UI states | **VERIFIED** | Parsed from `emr-states.js` |
| F-04 | 8 React components registered for EMR-adjacent screens | **VERIFIED** | `main.tsx` imports |
| F-05 | Zero React screens mounted inside the clinical encounter shell | **VERIFIED** | All 8 components are dashboard/list level |
| F-06 | `ConsultationBo.AddConsultation` also updates parent Encounter record | **VERIFIED** | `ConsultationBo.ts` lines 36–38 |
| F-07 | All models use soft-delete (`Status: 1` in `defaultScope`) | **VERIFIED** | 4 sampled models confirmed |
| F-08 | All models track `CreatedBy/At`, `UpdatedBy/At` | **VERIFIED** | 4 sampled models confirmed |
| F-09 | Prescription linked to Encounter, Doctor, PharmacyId, Department | **VERIFIED** | `Prescription.associate()` |
| F-10 | `ProgressNoteStatusId = 2` triggers finalization in ConsultationBo | **VERIFIED** | Sets `ReferenceNo = null`, `generateRefNo = 1` |
| F-11 | Reference blueprint PDFs missing from specified path | **VERIFIED** | `ls /Users/sharmila/Rajesh/my-app/` = empty |
| F-12 | `DoctorPrescribeFormScreen.tsx` = React migration of prescription form | **VERIFIED** | File exists with AngularJS bridge props |
| F-13 | `PatientVital.tableName = 'hims_patientvitals'` | **VERIFIED** | Model file read |
| F-14 | `PatientDiagnosis.tableName = 'patientdiagnosis'` | **VERIFIED** | Model file read |
| P-01 | `ProgressNoteStatusId = 2` means "Signed/Finalized" | **[PROPOSAL]** | Inferred; no enum definition found |
| P-02 | `Rev` column is optimistic-lock row version | **[PROPOSAL]** | Consistent pattern; BaseBo not yet read |
| P-03 | CORS wildcard is a deployment oversight, not intentional design | **[PROPOSAL]** | `Router.ts:36` — `Access-Control-Allow-Origin: *` |

---

## 3. Screen Inventory (162 Angular States)

### Classification Key

| Symbol | Meaning |
|--------|---------|
| ✅ | Existing AngularJS — likely functional |
| ⚛️ | Migrated to React (partial or full) |
| ⚠️ | Partial / suspected defective |
| ❌ | Missing UI — backend exists |
| 🚫 | Unreachable — orphaned route |
| ❓ | Unverified — state exists, template/controller not confirmed |

---

### Group A — EMR Shell & Dashboard

| State | Description | Status |
|-------|-------------|--------|
| `patientemr` | Root shell: patient banner, tab navigation | ✅ |
| `patientemr.emrdashboard` | EMR summary dashboard | ✅ |
| `patientemr.pmhxdashboard` | Past Medical History dashboard | ✅ |
| `patientemr.patientrecords` | Patient records overview | ✅ |
| `patientemr.pastvisits-list` | Past visit history | ✅ |
| `patientemr.summarynotetab.patientdashboard` | Summary note view | ✅ |

---

### Group B — Consultation / Progress Notes

| State | Description | Status | Notes |
|-------|-------------|--------|-------|
| `patientemr.consultation` | Consultation note write/edit | ✅ | Core clinical workflow; saves also update Encounter |
| `patientemr.consultationcompare` | Compare multiple notes | ✅ | |
| `patientemr.consultationtab.consultationcurrentlist` | Current visit notes | ✅ | |
| `patientemr.consultationtab.consultationpreviouslist` | Historical notes | ✅ | |
| `patientemr.reviewnotes` | Review notes screen | ✅ | |
| `patientemr.notefavorate` | Favourite note templates | ✅ | |

**DB Table:** `consultations` | **PK:** `ConsultationId`
**Key fields:** `EncounterId`, `PatientId`, `DoctorId`, `ProgressNoteStatusId`, `ReferenceNo`, `DischargeDate`, `SurgeryDate`, `DischargeTypeId`
**Finalization:** `ProgressNoteStatusId = 2` → `ReferenceNo` generated (see F-10)

---

### Group C — Doctor / Nursing / IVF Notes

| State | Description | Status |
|-------|-------------|--------|
| `patientemr.doctornotestab.doctornotescurrentlist` | Today's doctor notes | ✅ |
| `patientemr.doctornotestab.doctornotespreviouslist` | Historical doctor notes | ✅ |
| `patientemr.nursingnotestab.nursingnotescurrentlist` | Current nursing notes | ✅ |
| `patientemr.nursingnotestab.nursingnotespreviouslist` | Historical nursing notes | ✅ |
| `patientemr.symptomnotestab.symptomnotes` | Active symptom notes | ✅ |
| `patientemr.symptomnotestab.symptomnotehistory` | Past symptom notes | ✅ |
| `patientemr.ivfnotestab.ivfnotescurrentlist` | IVF notes current | ✅ |
| `patientemr.ivfnotestab.ivfnotespreviouslist` | IVF notes historical | ✅ |
| `patientemr.ivfnotestab.ivfspousenotes` | IVF spouse notes | ✅ |
| `patientemr.ivfconsultationnotescurrentlist` | IVF consultation notes | ✅ |

**DB Tables:** `hims_dailynotes`, `hims_patientclinicalnotes`

---

### Group D — Vital Signs

| State | Description | Status |
|-------|-------------|--------|
| `patientemr.patientvitaltab.patientvital` | Vital entry form | ✅ |
| `patientemr.patientvitaltab.patientvitals` | Current vitals list | ✅ |
| `patientemr.patientvitaltab.patientvitalchart` | Trend chart | ✅ |
| `patientemr.patientvitaltab.previousvitals` | Previous encounter vitals | ✅ |

**DB Table:** `hims_patientvitals` | **PK:** `PatientVitalId`
**Key fields:** `VitalId`, `VitalValue`, `UOM`, `LoincCode`, `ReferenceRangeFrom`, `ReferenceRangeTo`, `PerformedDate`, `PerformedBy`, `PatientVitalStatusId`, `VitalQualifier`

---

### Group E — Diagnosis

| State | Description | Status |
|-------|-------------|--------|
| `patientemr.diagnosistab.patientdiagnosiscurrentlist` | Active diagnoses | ✅ |
| `patientemr.diagnosistab.diagnosishistory` | Historical diagnoses | ✅ |
| `patientemr.diagnosistab.favoritediagnosis` | Favourite shortcuts | ✅ |

**DB Table:** `patientdiagnosis` | **PK:** `PatientDiagnosisId`
**Key fields:** `DiagnosisId`, `DiagnosisName`, `Code` (ICD-10), `DiagnosisTypeId`, `DiagnosisStatusId`, `ConditionTypeId`, `ConditionStatusId`, `DOA`, `DOD`

---

### Group F — Allergies

| State | Description | Status |
|-------|-------------|--------|
| `patientemr.patientallergy` | Allergy list + entry form | ✅ |

**DB Table:** `patientallergies` | **PK:** `PatientAllergyId`
**Key fields:** `AllergyId`, `AllergyName`, `AllergyTypeId`, `AllergySeverityId`, `ADRStatus`, `ADRScoreId`, `StartDate`, `EndDate`, `Symptom`, `PerformedDate`, `PerformedBy`

> [!CAUTION]
> Allergy data is clinically critical. Soft-delete via `Status=0` exists but no
> dedicated audit-log model was found. All allergy deletions must be auditable.
> → OQ-03

---

### Group G — Prescriptions & Medications

| State | Description | Status |
|-------|-------------|--------|
| `patientemr.prescribetab.currentprescription` | Active prescriptions | ✅ |
| `patientemr.prescribetab.pastprescription` | Past prescriptions | ✅ |
| `patientemr.prescribetab.favprecriptions` | Favourite templates | ✅ |
| `patientemr.prescribetab.rxprescriptions` | RX-style view | ✅ |
| `patientemr.prescriptionp1` | Prescription pad style 1 | ✅ |
| `patientemr.prescriptionpadform` | Prescription pad form | ✅ |
| `patientemr.prescriptionpadlist` | Prescription pad list | ✅ |
| `patientemr.medicinerequest` | IP pharmacy indent request | ✅ |
| `patientemr.medicinerequestform` | Indent form | ✅ |
| `patientemr.medicinereturn` | Medicine return | ✅ |
| `patientemr.medicinereturns` | Returns list | ✅ |

**React migration:** `DoctorPrescribeFormScreen.tsx` ⚛️ — prescription header form migrated. Drug line items remain AngularJS.
**DB Tables:** `hims_prescriptions`, `hims_prescriptiondetails`, `hims_prescriptionpad`, `patientadvicemedications`, `patientdischargemedications`

---

### Group H — Clinical Orders (Lab / Radiology)

| State | Description | Status |
|-------|-------------|--------|
| `patientemr.clinicalordertab.clinicalorders` | Order entry panel | ✅ |
| `patientemr.clinicalordertab.currentlist` | Pending orders | ✅ |
| `patientemr.clinicalordertab.history` | Completed orders | ✅ |
| `patientemr.clinicalordertab.favorders` | Favourite order sets | ✅ |
| `patientemr.labresults` | Lab result viewer (from LIS) | ✅ |
| `patientemr.labresultview` | Individual result detail | ✅ |
| `patientemr.radiologyresults` | Radiology result viewer | ✅ |

**React migration:** `ClinicalPendingOrdersListScreen.tsx` ⚛️ — pending orders list migrated.
**DB Tables:** `patientorders`, `patientorderdetails`, `hims_orderfollowup`
**Key fields on PatientOrder:** `OrderTypeId`, `IsDirectBill`, `OrderNumber`, `OrderRequestDate`, `OrderStatusId`, `OrderPriorityId`, `BillingId`, `BillAmount`, `AccessionNumber`, `HisOrderId`, `ExternalLabId`

---

### Group I — Procedure Orders

| State | Description | Status |
|-------|-------------|--------|
| `patientemr.procedureordertab.procedureorders` | Procedure entry | ✅ |
| `patientemr.procedureordertab.currentlist` | Current orders | ✅ |
| `patientemr.procedureordertab.history` | Historical | ✅ |
| `patientemr.procedureordertab.favoriteorders` | Favourites | ✅ |

**DB Tables:** `procedureorders`, `procedureorderdetails`
**Review workflow:** `UpdateProcedureOrderReview` endpoint — review status tracking in API.

---

### Group J — EMAR (Electronic Medication Administration Record)

| State | Description | Status | Notes |
|-------|-------------|--------|-------|
| `patientemr.emartab.emar` | EMAR administration entry | ✅ | |
| `patientemr.emartab.emarview` | EMAR read-only viewer | ✅ | |

**⚠️ Two EMAR tables exist:**

| Table | Route | PK |
|-------|-------|----|
| `hims_emar` | `EmarRoute` | `EmarId` |
| `patientemar` | `PatientEmarRoute` | `PatientEmarId` |

Purpose distinction is **unverified** → OQ-04

---

### Group K — Nursing Charts

| State | Description | Status |
|-------|-------------|--------|
| `patientemr.positionbpcharttab.positionbpchart` | Position BP chart | ✅ |
| `patientemr.diabetescharttab.currentlist` | Diabetes monitoring | ✅ |
| `patientemr.cdcharttab.cdchartcurrentlist` | CD4 chart | ✅ |
| `patientemr.nursingcharts` | Nursing charts container | ✅ |
| `patientemr.emrcharttab.emrcharts` | Charts list | ✅ |

**DB Tables:** `hims_bpcharts`, `hims_positionbpchart`, `hims_diabetescharts`, `hims_cdchart`, `hims_monitorcharts`, `hims_ventilatorcharts`, `hims_abgcharts`, `hims_intakeoutputchart`, `hims_dialysischarts`

---

### Group L — Patient History

| State | Description | Status |
|-------|-------------|--------|
| `patientemr.familysocialhistory` | Social + family history form | ✅ |
| `patientemr.familyconditions` | Family medical conditions | ✅ |
| `patientemr.patientconditions` | Patient conditions | ✅ |
| `patientemr.patientimmunizations` | Immunization schedule | ✅ |

**DB Tables:** `familysocialhistory`, `familyconditions`, `patientconditions`, `patientgeneralhistory`, `patientimmunizations`, `patientimmunizationschedules`, `hims_patientsurgicals`

---

### Group M — Consent & Clinical Documents

| State | Description | Status |
|-------|-------------|--------|
| `patientemr.clinicaldocumenttab.clinicaldocumentcurrentlist` | Current documents | ✅ |
| `patientemr.clinicaldocumenttab.clinicaldocumentpreviouslist` | Past documents | ✅ |
| `patientemr.clinicalimages` | Clinical image viewer | ✅ |
| `patientemr.preoperativechecklist` | Pre-op safety checklist | ✅ |
| `patientemr.mrdfilesattachments` | MRD file attachments | ✅ |

**DB Tables:** `hims_clinicaldocuments`, `patient_documents`, `preoperativechecklist`, `preoperativechecklistdetails`

---

### Group N — Discharge Workflow (within EMR shell)

| State | Description | Status |
|-------|-------------|--------|
| `patientemr.dischargesummarytab.dischargesummarycurrentvisit` | Active DS | ✅ |
| `patientemr.dischargesummarytab.dischargesummaryhistory` | DS history | ✅ |
| `patientemr.dischargesummarytab.dischargesummarymodify` | Amend DS | ✅ |
| `patientemr.dischargesummarytab.dischargesummaryview` | Read-only DS | ✅ |
| `patientemr.dischargecasesheet` | Discharge case sheet | ✅ |
| `patientemr.ipcasesheetsummary` | IP case sheet summary | ✅ |
| `patientemr.sickleaveform` | Sick leave certificate | ✅ |

---

### Group O — Specialty Workflows

| State | Description | Status | Specialty |
|-------|-------------|--------|-----------|
| `patientemr.toothcharttab.toothchart` | Adult tooth chart | ✅ | Dentistry |
| `patientemr.toothcharttab.childtoothchart` | Paediatric tooth chart | ✅ | Dentistry |
| `patientemr.lensprescription` | Lens prescription | ✅ | Ophthalmology |
| `patientemr.orthoassesment` | Shoulder/ortho assessment | ✅ | Orthopaedics |
| `patientemr.physiotheraphytab.physiotheraphycurrentlist` | Current physio | ✅ | Physiotherapy |
| `patientemr.physiotheraphytab.physiotheraphypreviouslist` | Past physio | ✅ | Physiotherapy |
| `patientemr.newbornform` | Newborn assessment | ✅ | Obstetrics |
| `patientemr.patientlabourform` | Labour detail form | ✅ | Obstetrics |
| `patientemr.ivftreatmentplan` | IVF treatment plan | ✅ | IVF |
| `patientemr.abgparameters` | ABG chart | ✅ | ICU/Critical Care |
| `patientemr.patientdietorderform` | Diet order form | ✅ | Dietetics |
| `patientemr.dietplantab.dietplan` | Diet plan | ✅ | Dietetics |
| `patientemr.patientrheumatology` | Rheumatology assessment | ❓ | Rheumatology |
| `patientemr.localwellmedicineorderform` | Telemedicine order | ✅ | Virtual Care |

---

### Group P — Blood Bank (within EMR)

| State | Description | Status |
|-------|-------------|--------|
| `patientemr.bloodbanktab.bloodrequest` | Blood request form | ✅ |
| `patientemr.bloodbanktab.blooddonor` | Donor information | ✅ |
| `patientemr.bloodbanktab.bloodtransfusion` | Transfusion record | ✅ |

**DB Table:** `bloodrequest` | **PK:** `BloodRequestId`

---

### Group Q — Referral & Follow-up

| State | Description | Status |
|-------|-------------|--------|
| `patientemr.referralfollowuptab.referralfollowup` | Referral entry | ✅ |
| `patientemr.referralfollowuptab.currentreferrallist` | Current referrals | ✅ |
| `patientemr.referralfollowuptab.prevreferrallist` | Past referrals | ✅ |
| `app.patientfollowuptab.followup` | Follow-up form | ✅ |
| `app.patientfollowuptab.pending` | Pending follow-ups | ✅ |

---

### Group R — Financial Views (read-only, from Billing)

| State | Description | Status |
|-------|-------------|--------|
| `patientemr.ipbilldetails` | IP bill detail (read-only) | ✅ |
| `patientemr.constab.opconsolidatedbills` | OP consolidated bills | ✅ |
| `patientemr.constab.pharmacyconsolidatedbills` | Pharmacy bills | ✅ |

---

### Group S — Task & Incident Management

| State | Description | Status |
|-------|-------------|--------|
| `patientemr.emrincidentmanagementlist` | Incident list | ✅ |
| `patientemr.incidentmanagement` | Incident report form | ✅ |
| `patientemr.emrtaskmanagementlist` | Task management list | ✅ |

---

### Group T — Treatment Plans

| State | Description | Status |
|-------|-------------|--------|
| `patientemr.treatmentplan` | Treatment plan list | ✅ |
| `patientemr.treatmentplanupdate` | Treatment plan edit | ✅ |

**DB Tables:** `hims_treatmentplan`, `hims_treatmentplandetails`, `hims_treatmentplanfollowup`

---

## 4. Complete Database Model Reference (79 Tables)

### 4.1 Universal Audit Fields (all 79 models confirmed)

```
Status     INTEGER    Soft-delete: 1=active, 0=deleted
Rev        INTEGER    Row version [PROPOSAL: optimistic concurrency — OQ-06]
CreatedBy  INTEGER    FK → User.UserId
CreatedAt  DATE       Sequelize-managed
UpdatedBy  INTEGER    FK → User.UserId
UpdatedAt  DATE       Sequelize-managed
```

### 4.2 Standard Encounter Context Fields

Most EMR records carry:
```
EncounterId    BIGINT    FK → Visit.Encounter
ConsultationId BIGINT    FK → EMR.Consultation (nullable for nursing records)
PatientId      BIGINT    FK → Registration.Patient
```

### 4.3 Full Table List

| # | Model | DB Table | PK Column | Specialty / Notes |
|---|-------|---------|-----------|-------|
| 1 | AdverseDrugReaction | patientadversedrugreaction | PatientADRId | |
| 2 | BloodRequest | bloodrequest | BloodRequestId | Blood bank |
| 3 | CategorySectionEntry | categorysectionentries | CategorySectionEntryId | |
| 4 | CdChart | hims_cdchart | CdChartId | HIV/CD4 monitoring |
| 5 | ClinicalDocument | hims_clinicaldocuments | ClinicalDocumentId | |
| 6 | **Consultation** | **consultations** | **ConsultationId** | **Core clinical record** |
| 7 | DailyNote | hims_dailynotes | DailyNoteId | |
| 8 | Document | patient_documents | DocumentId | |
| 9 | Emar | hims_emar | EmarId | MAR — see OQ-04 |
| 10 | ExtravasationProforma | patientextravasationproforma | ExtravasationProformaId | Nursing specialty |
| 11 | FamilyCondition | familyconditions | FamilyConditionId | |
| 12 | FamilySocialHistory | familysocialhistory | FamilySocialHistoryId | |
| 13 | IncidentReporting | patientincidentreporting | IncidentReportingId | |
| 14 | IntakeOutputChart | hims_intakeoutputchart | IntakeOutputChartId | |
| 15 | LensPrescription | lensprescription | LensPrescriptionId | Ophthalmology |
| 16 | NewBornDetail | newborndetails | NewBornDetailId | Obstetrics |
| 17 | OrderFollowup | hims_orderfollowup | OrderFollowupId | |
| 18 | PastLabResult | patientpastresults | PastLabResultId | |
| 19 | PastLabResultDetail | pastlabresultdetails | PastLabResultDetailId | |
| 20 | PastOcularHistory | pastocularhistory | PastOcularHistoryId | Ophthalmology |
| 21 | PatientABGChart | hims_abgcharts | PatientABGChartId | ICU |
| 22 | PatientAdviceMedication | patientadvicemedications | PatientAdviceMedicationId | |
| 23 | **PatientAllergy** | **patientallergies** | **PatientAllergyId** | **Clinically critical** |
| 24 | PatientAnnotation | patientannotations | PatientAnnotationId | |
| 25 | PatientBPChart | hims_bpcharts | PatientBPChartId | |
| 26 | PatientChiefComplaint | patientchiefcomplaints | PatientChiefComplaintId | |
| 27 | PatientClinicalNotes | hims_patientclinicalnotes | PatientClinicalNotesId | |
| 28 | PatientComplaints | patientcomplaints | PatientComplaintsId | |
| 29 | PatientCondition | patientconditions | PatientConditionId | |
| 30 | PatientDiabetesChart | hims_diabetescharts | PatientDiabetesChartId | Endocrinology |
| 31 | **PatientDiagnosis** | **patientdiagnosis** | **PatientDiagnosisId** | ICD-10 via `Code` field |
| 32 | PatientDialysisChart | hims_dialysischarts | PatientDialysisChartId | Nephrology |
| 33 | PatientDietNbm | patientdietnbm | PatientDietNbmId | Nil-by-mouth tracking |
| 34 | PatientDietOrder | patientdietorders | PatientDietOrderId | Dietetics |
| 35 | PatientDietOrderDetail | patientdietorderdetails | PatientDietOrderDetailId | |
| 36 | PatientDietPlan | patientdietplan | PatientDietPlanId | |
| 37 | PatientDietPlanLog | patientdietplanlog | PatientDietPlanLogId | |
| 38 | PatientDischargeMedication | patientdischargemedications | PatientDischargeMedicationId | |
| 39 | PatientEmar | patientemar | PatientEmarId | Alt EMAR — OQ-04 |
| 40 | PatientEmarDetails | — | PatientEmarDetailsId | |
| 41 | PatientExaminationSystem | examinationsystems | PatientExaminationSystemId | |
| 42 | PatientFeedback | patientfeedback | PatientFeedbackId | |
| 43 | PatientFeedbackDetails | patientfeedbackdetails | PatientFeedbackDetailsId | |
| 44 | PatientGeneralHistory | patientgeneralhistory | PatientGeneralHistoryId | |
| 45 | PatientImmunization | patientimmunizations | PatientImmunizationId | |
| 46 | PatientImmunizationSchedule | patientimmunizationschedules | PatientImmunizationScheduleId | |
| 47 | PatientInjectionAdvice | injectionadvice | PatientInjectionAdviceId | |
| 48 | PatientIntakeOutput | patientintakeoutputs | PatientIntakeOutputId | |
| 49 | PatientLabourDetail | patientlabourdetails | PatientLabourDetailId | Obstetrics |
| 50 | PatientLaserAdvice | laseradvice | PatientLaserAdviceId | Ophthalmology |
| 51 | PatientMedication | hims_patientmedications | PatientMedicationId | |
| 52 | PatientMonitorChart | hims_monitorcharts | PatientMonitorChartId | ICU |
| 53 | PatientNotifiableDisease | patientnotifydiseases | PatientNotifiableDiseaseId | |
| 54 | **PatientOrder** | **patientorders** | **PatientOrderId** | Lab/Radiology orders |
| 55 | PatientOrderDetail | patientorderdetails | PatientOrderDetailId | |
| 56 | PatientProcedure | patientprocedures | PatientProcedureId | |
| 57 | PatientRheumatology | patientrheumatology | PatientRheumatologyId | Rheumatology |
| 58 | PatientSocialHistory | patientsocialhistory | PatientSocialHistoryId | |
| 59 | PatientSurgeryAdvice | surgeryadvice | PatientSurgeryAdviceId | |
| 60 | PatientSurgical | hims_patientsurgicals | PatientSurgicalId | |
| 61 | PatientToothChart | toothcharts | PatientToothChartId | Dentistry |
| 62 | PatientTransfer | patienttransfer | PatientTransferId | |
| 63 | PatientVentilatorChart | hims_ventilatorcharts | PatientVentilatorChartId | ICU |
| 64 | **PatientVital** | **hims_patientvitals** | **PatientVitalId** | LOINC codes present |
| 65 | PhysiotheraphyTreatement | physiotheraphytreatment | PhysiotheraphyTreatementId | ⚠️ Typo in name — OQ-05 |
| 66 | PositionBpChart | hims_positionbpchart | PositionBpChartId | |
| 67 | PreOperativeChecklist | preoperativechecklist | PreOperativeChecklistId | |
| 68 | PreOperativeChecklistDetails | preoperativechecklistdetails | PreOperativeChecklistDetailsId | |
| 69 | **Prescription** | **hims_prescriptions** | **PrescriptionId** | |
| 70 | PrescriptionDetail | hims_prescriptiondetails | PrescriptionDetailId | Drug line items |
| 71 | PrescriptionPad | hims_prescriptionpad | PrescriptionPadId | |
| 72 | ProcedureOrder | procedureorders | ProcedureOrderId | |
| 73 | ProcedureOrderDetail | procedureorderdetails | ProcedureOrderDetailId | |
| 74 | RevenueTarget | hims_revenuetarget | RevenueTargetId | ⚠️ Misplaced in EMR |
| 75 | ShoulderAssessment | shoulderassessments | ShoulderAssessmentId | Orthopaedics |
| 76 | TreatementModality | treatementmodality | TreatementModalityId | Physiotherapy |
| 77 | TreatmentPlan | hims_treatmentplan | TreatmentPlanId | |
| 78 | TreatmentPlanDetail | hims_treatmentplandetails | TreatmentPlanDetailId | |
| 79 | TreatmentPlanFollowup | hims_treatmentplanfollowup | TreatmentPlanFollowupId | |

---

## 5. API / Function Coverage Matrix

### 5.1 Route → Model → React Status

| Route File | Endpoints | DB Table | React Status |
|-----------|-----------|---------|--------------|
| ConsultationRoute | 10 | consultations | AngularJS |
| PrescriptionRoute | 11 | hims_prescriptions | ⚛️ Header only |
| PrescriptionDetailRoute | 6 | hims_prescriptiondetails | AngularJS |
| PatientOrderRoute | 7 | patientorders | ⚛️ List only |
| PatientOrderDetailRoute | 5 | patientorderdetails | AngularJS |
| PatientVitalRoute | 8 | hims_patientvitals | AngularJS |
| PatientDiagnosisRoute | 5 | patientdiagnosis | AngularJS |
| PatientAllergyRoute | 5 | patientallergies | AngularJS |
| EmarRoute | 5 | hims_emar | AngularJS |
| PatientEmarRoute | 5 | patientemar | AngularJS |
| DailyNoteRoute | 5 | hims_dailynotes | AngularJS |
| PatientClinicalNotesRoute | 4 | hims_patientclinicalnotes | AngularJS |
| PatientChiefComplaintRoute | 5 | patientchiefcomplaints | AngularJS |
| TreatmentPlanRoute | 6 | hims_treatmentplan | AngularJS |
| ProcedureOrderRoute | 10 | procedureorders | AngularJS |
| BloodRequestRoute | 5 | bloodrequest | AngularJS |
| PatientVentilatorChartRoute | 7 | hims_ventilatorcharts | AngularJS |
| IntakeOutputChartRoute | 5 | hims_intakeoutputchart | AngularJS |
| PatientDialysisChartRoute | 5 | hims_dialysischarts | AngularJS |
| PatientDiabetesChartRoute | 5 | hims_diabetescharts | AngularJS |
| ShoulderAssessmentRoute | 6 | shoulderassessments | AngularJS |
| PhysiotheraphyTreatementRoute | 6 | physiotheraphytreatment | AngularJS |
| LensPrescriptionRoute | 5 | lensprescription | AngularJS |
| PatientToothChartRoute | 5 | toothcharts | AngularJS |
| NewBornDetailRoute | 5 | newborndetails | AngularJS |
| PatientLabourDetailRoute | 5 | patientlabourdetails | AngularJS |
| … (remaining 53 route files) | ~362 | — | AngularJS |

---

## 6. React Migration — Approved Pattern

All React migration **must** follow the bridge pattern confirmed in `DoctorPrescribeFormScreen.tsx`:

```typescript
// AngularJS controller passes data and receives callbacks
interface ScreenProps {
  reactProps?: {
    item?: { ... };           // Data from AngularJS scope
    lookup?: { ... };         // Dropdown options
    currentcontext?: { ... }; // UI state flags
    isDisabled?: boolean;
  };
  onAction?: (actionName: string, payload?: any) => void;
  // React fires this → AngularJS controller handles API call
}
```

**Rules:**
1. AngularJS controller retains full state management and all API calls
2. React renders the UI, fires `onAction()` for interactions
3. No direct `fetch()` or `apiFetch()` calls from within React components
4. All data reaches React via `reactProps` — no Angular service injection from React

---

## 7. Module Dependencies

```
EMR (hub module)
 ├── Registration     reads: Patient demographics, PatientArchive, MRN
 ├── Visit            reads: Encounter; ConsultationBo WRITES Encounter on save
 ├── Appointment      reads: appointment context; PatientTracker data
 ├── LIS              writes: PatientOrder (lab); reads: LabResult (viewer only)
 ├── Pharmacy         writes: Prescription; reads: dispensing status
 ├── Billing          reads: bill details (read-only views in EMR shell)
 ├── IPManagement     reads: admission request, bed, MRD file data
 ├── DischargeSummary DS tabs show data from DischargeSummary module
 ├── OtManagement     OT registers link; PreOperativeChecklist feeds OT scheduling
 ├── VirtualHealthcare video conference; LocalWell medicine orders
 └── TaskManagement   incident and task management within EMR context
```

---

## 8. Error, Concurrency, and Audit Behaviour

### 8.1 Soft Delete
All models use `defaultScope: { where: { Status: 1 } }`. Delete = `Status = 0`. Records are never physically removed. Appropriate for clinical data.

### 8.2 Optimistic Concurrency [PROPOSAL]
`Rev` column present in all models. Likely incremented on update. **Not confirmed by BaseBo source read** → OQ-06.

### 8.3 Signed Record Amendments
`ConsultationBo.UpdateProgressNoteStatus` with `ProgressNoteStatusId = 2` generates `ReferenceNo` (finalization). Amendment workflow for signed records is **unconfirmed** → OQ-07.

### 8.4 Privilege Enforcement — CRITICAL GAP
`PrivilegeHelper.ts` has 435+ methods. **All return `false`** (verified in discovery). Screen-level access control is **currently non-functional** — P0 blocker.

### 8.5 Audit Gaps
- No separate audit log model found for allergy / diagnosis / prescription changes
- Soft-delete tracks `UpdatedBy` but not the reason for deletion
- Amendment history for finalized notes not confirmed → OQ-07

---

## 9. Prioritised Change Backlog

### P0 — Blockers (must fix before any clinical use)

| ID | Issue | File | Action |
|----|-------|------|--------|
| P0-01 | PrivilegeHelper returns false for all methods | `src/react-components/utils/PrivilegeHelper.ts` | Implement real privilege lookup |
| P0-02 | `api/.env` does not exist | `api/` root | Create from template |
| P0-03 | CORS wildcard in production | `Router.ts:36` | Restrict to known origins |
| P0-04 | Bearer token in localStorage | `APIHelper.ts` | Move to httpOnly cookie |

### P1 — High Priority

| ID | Issue | Action |
|----|-------|--------|
| P1-01 | No audit trail for allergy/diagnosis deletion | Add audit log or use existing Rev mechanism |
| P1-02 | Two EMAR tables — unclear purpose | Clarify OQ-04; consolidate if duplicate |
| P1-03 | ProgressNoteStatusId enum undocumented | Document in ReferenceValue master |
| P1-04 | RevenueTarget model misplaced in EMR | Move to Billing or SystemSettings |
| P1-05 | PhysiotheraphyTreatement typo in model name | Fix with DB migration |

### P2 — React Migration (Core Clinical)

| ID | Screen | Effort |
|----|--------|--------|
| P2-01 | Consultation / Progress Note form | High |
| P2-02 | Vital entry form + chart | Medium |
| P2-03 | Diagnosis entry with ICD-10 search | Medium |
| P2-04 | Allergy entry form + alert banner | Low |
| P2-05 | Prescription drug line items | High |
| P2-06 | Lab / radiology order entry | High |

### P3 — React Migration (Specialty & Nursing)

| ID | Screen Group |
|----|-------------|
| P3-01 | Nursing charts (Ventilator, Dialysis, BP, I/O) |
| P3-02 | EMAR administration |
| P3-03 | Dental tooth chart |
| P3-04 | Ophthalmology (lens prescription, laser advice) |
| P3-05 | Physiotherapy treatment + modality |
| P3-06 | Orthopaedic shoulder assessment |
| P3-07 | Obstetric forms (labour, newborn) |
| P3-08 | IVF notes and treatment plan |
| P3-09 | Diet orders and plan |

---

## 10. Developer Handoff Prompts

### H-01: Vital Signs React Migration

```
CONTEXT : HIMS EMR — Angular→React migration, read-only discovery complete
SCREEN  : patientemr.patientvitaltab (Vital Signs)
API     : POST /EMR/AddPatientVital
          POST /EMR/GetPatientVitals
          POST /EMR/ManagePatientVitals
          POST /EMR/PrintPatientVital
DB TABLE: hims_patientvitals (PK: PatientVitalId)
KEY FIELDS:
  VitalId              FK→ClinicalMaster.VitalMaster
  VitalValue           STRING — the measured value
  UOM                  STRING — unit of measure
  LoincCode            STRING — LOINC code (informational, do not validate)
  ReferenceRangeFrom   STRING — normal low (display-only, no clinical alert logic)
  ReferenceRangeTo     STRING — normal high (display-only)
  PerformedDate        DATE
  PerformedBy          FK→User
  PatientVitalStatusId FK→ReferenceValue
  VitalQualifier       STRING — qualifier text
PATTERN : Follow DoctorPrescribeFormScreen.tsx bridge.
          Angular controller owns all API calls.
          React fires onAction() only.
SCOPE   :
  1. Tabular vital entry — multiple vitals at once (one row per vital type)
  2. Current vitals list for this encounter
  3. Line chart — last 7 readings per vital type
  4. Previous encounter vitals — read-only
DO NOT  : Change backend, DB, or controller. No direct fetch() from React.
          Do NOT add clinical threshold alerts or normal-range enforcement.
ACCEPT  : Entry saves via AddPatientVital. Out-of-range values visually flagged
          using ReferenceRangeFrom/To only. Chart renders without page reload.
```

### H-02: Diagnosis Entry React Migration

```
CONTEXT : HIMS EMR — Diagnosis entry
SCREEN  : patientemr.diagnosistab
API     : POST /EMR/AddPatientDiagnosis
          POST /EMR/GetPatientDiagnosis
          POST /EMR/UpdatePatientDiagnosis
DB TABLE: patientdiagnosis (PK: PatientDiagnosisId)
KEY FIELDS:
  DiagnosisId         FK→ClinicalMaster.Diagnosis master
  DiagnosisName       STRING — display name
  Code                STRING — ICD-10 code (informational only)
  DiagnosisTypeId     FK→ReferenceValue (Primary/Secondary/Complication)
  DiagnosisStatusId   FK→ReferenceValue (Active/Resolved/Chronic)
  ConditionTypeId     FK→ReferenceValue
  ConditionStatusId   FK→ReferenceValue
  DOA                 DATE — date of admission
  DOD                 DATE — date of discharge
SCOPE   :
  1. Diagnosis typeahead search against ClinicalMaster.Diagnosis + manual entry
  2. Add/edit form with type, status, condition fields
  3. Current encounter diagnosis list
  4. History — all patient diagnoses across encounters (filter PatientId only)
CONSTRAINTS:
  ICD-10 Code = display only. Do NOT invent or validate clinical rules.
```

### H-03: Allergy Entry + Alert Banner

```
CONTEXT : HIMS EMR — Allergy recording
SCREEN  : patientemr.patientallergy
API     : POST /EMR/AddPatientAllergy
          POST /EMR/GetPatientAllergys
          POST /EMR/UpdatePatientAllergy
          POST /EMR/DeletePatientAllergy   (sets Status=0, requires confirmation)
DB TABLE: patientallergies (PK: PatientAllergyId)
KEY FIELDS:
  AllergyId             FK→master allergy list
  AllergyName           STRING
  AllergyTypeId         FK→ReferenceValue (Drug/Food/Environmental/Other)
  AllergySeverityId     FK→ReferenceValue (Mild/Moderate/Severe/Life-threatening)
  ADRStatus             STRING
  StartDate / EndDate   DATE
  Symptom               STRING
  PerformedDate/By      DATE / FK→User
CRITICAL:
  1. Allergy banner must be VISIBLE on all EMR tabs when patient has known
     allergies. isPatientHasAllergy flag already in DoctorPrescribeFormScreen
     props — wire this flag to a shared alert banner component.
  2. Delete requires explicit confirmation dialog (soft-delete only, Status=0).
  3. Severity must be colour-coded: Severe/Life-threatening = red.
  4. Do NOT compute drug-allergy interactions — only show the alert.
```

### H-04: Prescription Drug Line Items

```
CONTEXT : HIMS EMR — Prescription detail rows (drug line items)
SCREEN  : patientemr.prescribetab.currentprescription (detail section)
API     : POST /EMR/AddPrescriptionDetail
          POST /EMR/GetPrescriptionDetails
          POST /EMR/UpdatePrescriptionDetail
          POST /EMR/DeletePrescriptionDetail
          POST /EMR/PrintPrescription
DB TABLE: hims_prescriptiondetails (PK: PrescriptionDetailId)
PARENT  : hims_prescriptions (header — already in DoctorPrescribeFormScreen.tsx)
SCOPE   :
  1. Drug name typeahead from ClinicalMaster.DrugMaster + GenericMaster
  2. Fields per row: DrugName, Dosage, Frequency, Duration, Route, Instructions
  3. Inline add/edit/remove rows (no full-page reload)
  4. If selected drug matches any known patient allergy name → show warning banner
     (text only, do NOT block saving, do NOT calculate interactions)
  5. Print prescription via PrintPrescription endpoint
CONSTRAINTS:
  Print must include doctor name + registration number from User profile.
  No drug substitution, no CPOE logic, no interaction checking.
```

---

## 11. Test Plan and Acceptance Criteria

### 11.1 Test Types

| Type | Scope | Tool |
|------|-------|------|
| Unit | Business Object (Bo) methods | Jest / Mocha |
| Integration | API route → Bo → DB | Supertest with test DB |
| Component | React components with mock props | React Testing Library |
| E2E | Register → Encounter → EMR → Discharge | Manual / Playwright |
| Regression | All 540 EMR endpoints non-500 for valid input | Supertest suite |

### 11.2 Explicit Completion Criteria (per batch)

A batch is **complete** when ALL of the following are verified:

- [ ] All in-scope API endpoints return HTTP 200 (or correct 4xx) for valid/invalid inputs
- [ ] No previously passing tests regress
- [ ] React component renders without console errors in bridge context
- [ ] Soft-delete verified: deleted records absent from all `Get*` responses
- [ ] Audit fields (`CreatedBy`, `CreatedAt`, `UpdatedBy`, `UpdatedAt`) populated on every create/update
- [ ] Screen gated by correct privilege method (after P0-01 is fixed)
- [ ] No direct API calls from React — all via AngularJS controller callbacks
- [ ] Allergy alert banner visible on prescription/order screens when allergies exist

### 11.3 Clinical Data Requirements (India)

| Area | Requirement |
|------|-------------|
| ICD-10 | Stored as entered; no code validation by system |
| Drug names | Accept brand and generic; no substitution logic |
| Vital ranges | Display only; no threshold enforcement |
| Consent | Document upload only; no e-signature yet |
| Prescription print | Must include doctor name + medical registration number |

---

## 12. Open Questions

| ID | Question | Impact | Owner |
|----|---------|--------|-------|
| **OQ-01** | Where are the three reference PDF/MD documents? `/Users/sharmila/Rajesh/my-app/` is empty. | 🔴 Critical — cannot compare against blueprint | Project owner |
| **OQ-02** | No Radiology module exists in backend. Are radiology orders fulfilled through LIS? Is a Radiology module planned? | 🔴 High | Project owner |
| **OQ-03** | Is there a clinical audit log table for allergy/diagnosis/prescription changes, separate from soft-delete? | 🟠 High — compliance | DBA |
| **OQ-04** | Why are there two EMAR tables: `hims_emar` (EmarRoute) and `patientemar` (PatientEmarRoute)? Different encounter types? | 🟡 Medium | Original developer |
| **OQ-05** | `PhysiotheraphyTreatement` model has a typo ("Treatement"). Is this intentionally left to avoid a migration? | 🟡 Low | DBA |
| **OQ-06** | Does `BaseBo.Update()` check and increment the `Rev` column for optimistic concurrency? | 🟡 Medium | Developer (read BaseBo source) |
| **OQ-07** | What is the exact amendment workflow for finalized consultation notes (`ProgressNoteStatusId = 2`)? Can finalized notes be amended, and is there a separate amendment record? | 🟠 High — clinical governance | Clinical lead |
| **OQ-08** | Does `PatientOrder.IsDirectBill = true` automatically create a Billing record? Which endpoint triggers this? | 🟠 High — financial integrity | Developer |
| **OQ-09** | Is `LoincCode` on PatientVital populated from a master table or entered manually? | 🟡 Medium — interoperability | Developer |
| **OQ-10** | Scope of international expansion: which fields need i18n? Which coding standards (SNOMED, ICD-11, HL7 FHIR) are planned? | 🟠 High — architecture | Project owner |

---

## 13. International Expansion Design Notes [PROPOSAL]

> No implementation decisions have been made. These are proposals only.

| Area | India (current state) | International (proposed path) |
|------|----------------------|-------------------------------|
| ICD version | ICD-10 (`Code` field is free-text) | ICD-10-CM / ICD-11 — field is generic, code system configurable |
| Drug coding | Brand + generic name, free text | Add optional SNOMED / RxNorm code fields |
| Vital standards | Metric with `UOM` field | Imperial/metric toggle via FacilityPreference |
| Notifiable diseases | India Disease Surveillance schedule | Country-configurable list via master table |
| Prescription format | Doctor name + reg. no. | Country-specific legal requirement via FacilityPreference |
| Language | English UI | i18n strings required in all React components |
| Consent | Document upload | Country-specific e-consent workflow |

The existing `FacilityPreference` system in `SystemSettings` is the correct configuration point for country/locale settings.

---

## 14. Unresolved Gaps Summary

| Gap | Severity |
|-----|---------|
| Reference blueprint documents missing | 🔴 Critical |
| PrivilegeHelper non-functional (all return false) | 🔴 Critical |
| CORS wildcard (`*`) in production | 🔴 Critical |
| Bearer token in localStorage (XSS) | 🔴 Critical |
| No clinical audit log for allergy/diagnosis changes | 🟠 High |
| Radiology module missing — order path unclear | 🟠 High |
| Signed-note amendment workflow unconfirmed | 🟠 High |
| Dual EMAR tables with unclear separation | 🟡 Medium |
| `RevenueTarget` model misplaced in EMR | 🟡 Medium |
| `Rev` concurrency control unconfirmed | 🟡 Medium |

---

*This specification was produced from direct source-code inspection only.
No application code was modified during this analysis.
All claims marked [PROPOSAL] require confirmation before implementation begins.
Do not start implementation until OQ-01 is resolved and this document is approved.*
