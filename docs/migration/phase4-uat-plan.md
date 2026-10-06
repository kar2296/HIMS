# Phase 4 Human Clinical & Financial UAT Plan
**Date:** 2026-10-06  
**Status:** Prepared for Hospital Stakeholders | **Human Sign-off PENDING**  
**Target Environment:** Pilot UI (`http://localhost:5175`) / API (`:2014`) / PostgreSQL 14  

---

## 1. UAT Roles & Stakeholder Assignments

| Role Identifier | Designated Hospital User Role | Primary Scope & Test Modules | Required Sign-Off |
|:---|:---|:---|:---:|
| `ROLE_REG` | Front Desk / Registration Staff | Patient Registration, Quick Registration, Search, MRN generation | Pending |
| `ROLE_DOC` | Outpatient Doctor / Specialist | Appointments, Vitals, EMR Notes, ICD-10 Diagnosis, E-Prescription | Pending |
| `ROLE_CASH` | Cashier / Billing Executive | Bill Generation, Payments (Cash/Card/UPI), Receipts, Refunds, Shift Closing | Pending |
| `ROLE_NURSE` | Inpatient Ward Nurse | Inpatient Admission, Bed Allocation, Bed Transfers, Nursing Notes | Pending |
| `ROLE_PHARM` | Pharmacist / Store In-charge | Prescription Dispense, Stock Decrement, GRN Inwarding, Expiry Checks | Pending |
| `ROLE_LAB` | Lab Technician / Biochemist | Lab Orders, Specimen Accessioning, Result Entry, Verification & Release | Pending |
| `ROLE_OT` | OT In-charge / Lead Surgeon | OT Room Booking, Surgery Execution, Team Assignment, Pre-Op Checklist | Pending |
| `ROLE_TPA` | Insurance / TPA Desk Executive | Guarantor Attachment, GL Pre-Auth Limits, Corporate Packages, Copay | Pending |
| `ROLE_MRD` | Medical Records (MRD) Officer | Discharge Summary Finalization, Medical Certificates, Physical File Archive | Pending |
| `ROLE_ADMIN` | Hospital Administrator / IT Lead | Role Privileges, User-Facility Mapping, Tally XML Export, MIS Reports | Pending |

---

## 2. Module-by-Module UAT Test Script

### UAT Script 1: Outpatient Patient Registration & Doctor Consultation
1. **Action:** Log in as `ROLE_REG`, register new patient with phone number and address.
2. **Expected:** Patient saved, unique MRN generated, visible in search list.
3. **Action:** Log in as `ROLE_DOC`, open patient clinical workspace, add Vitals (BP 120/80, Pulse 72), add Diagnosis (ICD-10 `J06.9`), add Prescription (Paracetamol 500mg, 1-0-1 for 3 days).
4. **Expected:** Clinical notes persisted, prescription formatted, available for dispense.

### UAT Script 2: OP Billing & Cashier Settlement
1. **Action:** Log in as `ROLE_CASH`, open patient bill queue.
2. **Expected:** Consultation & medication charges appear with correct rates and GST.
3. **Action:** Collect payment via UPI / Cash; click "Print Receipt".
4. **Expected:** Receipt number generated, paid amount updated, outstanding balance zeroed.

### UAT Script 3: Inpatient Admission, Bed Transfer & Discharge
1. **Action:** Log in as `ROLE_NURSE`, admit patient to Ward 1 (General), allocate Bed #1.
2. **Action:** Transfer patient to Ward 2 (Semi-Private), Bed #2 with reason "Patient Upgrade".
3. **Expected:** Visual bed map updates; Bed #1 becomes vacant; Bed #2 becomes occupied; transfer history logged.
4. **Action:** Doctor finalizes Discharge Summary; cashier runs IP financial clearance.
5. **Expected:** Discharge summary locked; bed marked vacant; discharge event archived.

### UAT Script 4: LIS Order, Result Entry & Release
1. **Action:** Doctor orders "Complete Blood Count (CBC)" panel.
2. **Action:** Log in as `ROLE_LAB`, generate barcode, enter test values (Hb, WBC, Platelets).
3. **Expected:** Abnormal flags highlight in red/amber; validation status changes to "Released".

### UAT Script 5: Financial Reconciliation & Tally Ledger Export
1. **Action:** Log in as `ROLE_ADMIN`, run Daily Collection MIS and Department Revenue MIS.
2. **Expected:** Totals match cashier receipts exactly.
3. **Action:** Generate Tally Sales / Cashier XML Export.
4. **Expected:** XML format matches Tally ERP 9 schema for automated ledger import.

---

## 3. UAT Execution Tracker & Sign-Off Criteria

- **Pass Criteria:** 100% of P1/Critical clinical and financial workflows pass with 0 data discrepancies.
- **Defect Classification:** Any observed discrepancy must be logged in `docs/migration/phase4-defects.csv`.
