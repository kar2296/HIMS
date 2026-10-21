# Role-Specific Human UAT Execution Guide & Synthetic Fixtures

> [!IMPORTANT]
> **Clean Release UAT Application Portal**: `http://localhost:5177` (Proxied to API `http://localhost:2018`)
> **Target Database**: PostgreSQL 14 (`hims_clean_prov_db`).
> **Scope**: Validation of all 10 Hospital Roles across 42 Core Workflows.
> **Security Policy**: No plaintext credentials or password patterns are published in documentation. Pilot UAT credentials have been rotated with secure random keys and are managed via the secure administrative vault.
> **Execution Rule**: All tests must be executed by designated clinical, financial, and administrative hospital stakeholders using the dedicated `uat_*` accounts. Record actual observations, defect tickets, and results in `uat-execution-tracker.csv`.

---

## 1. Registration & Front Desk (Role: `uat_registration`)

### Synthetic Test Fixture
- **Patient Name**: `Ananya Sharma - UAT-REG-[SessionID]` (e.g. `Ananya Sharma - UAT-REG-01`) | **Gender**: Female | **DOB**: `1992-05-14` (Age: 34)
- **Mobile**: `9876543210` | **Address**: `42 MG Road, Indiranagar, Bangalore - 560038`
- **Guardian Name**: `Vikram Sharma` (Spouse) | **Govt ID (Aadhaar)**: `XXXX-XXXX-9012`

### Step-by-Step Test Scenarios
1. **New Patient Registration (Save & MRN Generation)**:
   - Navigate to `Registration -> New Patient` (`/registration`).
   - Fill in demographic details using synthetic fixture above. Click **Save**.
   - **Assertion**: System generates unique MRN (e.g., `MRN-2026-XXXX`). Record persisted in PostgreSQL `patients` table.
2. **Patient Search & Reopen (Edit & Update)**:
   - Navigate to `Registration -> Patient Search`.
   - Search by Mobile `9876543210` and MRN. Select the patient record.
   - Edit Address to `Flat 4B, Palm Grove, Bangalore`. Click **Update**.
   - **Assertion**: Modal confirms update; reload verifies persisted change.
3. **Print Registration Slip**:
   - Click **Print Registration Card / Slip**.
   - **Assertion**: Print preview dialogue opens with accurate barcode and patient demographics.

---

## 2. Consulting Physician / OPD EMR (Role: `uat_doctor`)

### Synthetic Test Fixture
- **Doctor**: `Dr. Rajesh Kumar (Cardiology)` | **Department**: Cardiology (Dept ID: 1)
- **Chief Complaints**: `Chest tightness on exertion for 3 days, mild shortness of breath`
- **Vitals**: BP `130/85 mmHg`, Pulse `78 bpm`, Temp `98.4 F`, SpO2 `99%`
- **ICD-10 Diagnosis**: `I20.9 - Angina pectoris, unspecified`
- **Prescription**: `Tab. Aspirin 75mg (1-0-0) x 30 days`, `Tab. Atorvastatin 20mg (0-0-1) x 30 days`

### Step-by-Step Test Scenarios
1. **Book Appointment & Open Consultation**:
   - Navigate to `OPD -> Appointment Roster` (`/emr`). Select Dr. Rajesh Kumar and book patient `Ananya Sharma`.
   - Open patient clinical encounter.
2. **Record Vitals & SOAP Notes**:
   - Enter Vitals: BP `130/85`, Pulse `78`, SpO2 `99%`. Save Vitals.
   - Enter Chief Complaints and Doctor Clinical SOAP Note. Click **Save Notes**.
   - **Assertion**: Data persists in `hims_patientvitals` and `hims_patientclinicalnotes`.
3. **Add ICD-10 Diagnosis & E-Prescription**:
   - Search ICD-10 code `I20.9` and attach to encounter.
   - Add drugs `Aspirin 75mg` and `Atorvastatin 20mg` with dosage frequency.
   - Click **Finalize & Sign Prescription**.
   - **Assertion**: Prescription persisted in `hims_prescriptions` and `hims_prescriptiondetails`.
4. **Print E-Prescription**:
   - Click **Print Prescription**. Verify doctor digital signature stamp and formatting.

---

## 3. Cashier & OP Billing (Role: `uat_cashier`)

> [!NOTE]
> **Synthetic Arithmetic Tax Fixture**: Under Indian GST law, clinical healthcare services are generally exempt from GST. The 5% GST configuration below is a synthetic arithmetic test fixture used to verify the PostgreSQL tax calculation engine and ledger accounting.

### Synthetic Test Fixture
- **Service Items**:
  - `Cardiology Specialist Consultation` (Rate: ₹500.00, Qty: 1)
  - `ECG 12-Lead Investigation` (Rate: ₹300.00, Qty: 1)
- **Gross Amount**: ₹800.00 | **Concession / Discount**: ₹50.00 (Doctor Concession)
- **Tax Mode**: Exclusive 5% GST Synthetic Test Fixture (on Net Base ₹750.00 = ₹37.50 GST) | **Net Payable**: ₹787.50

### Step-by-Step Test Scenarios
1. **Generate Outpatient Service Bill**:
   - Navigate to `Billing -> OP Billing` (`/billing`). Select patient `Ananya Sharma`.
   - Add Consultation (₹500) and ECG (₹300). Apply Discount (₹50).
   - Click **Generate Bill**.
   - **Assertion**: Bill generated with Net ₹750.00 (+ Synthetic GST ₹37.50). Status = Unpaid (1).
2. **Collect Multi-Mode Payment**:
   - Navigate to `Cashier Counter`. Select generated bill.
   - Tender Payment: Cash ₹400.00 + UPI / Card ₹387.50. Click **Submit Payment**.
   - **Assertion**: Receipt generated in `patientpaymentdetails`; Outstanding balance becomes ₹0.00; Status = Settled (2).
3. **Bill Cancellation & Audit-Logged Refund**:
   - Select bill, navigate to `Billing -> Refund / Cancellation` (`/billing/refunds`).
   - Enter Refund Amount: ₹300.00 (ECG Cancelled). Select Reason: `Patient opted for external ECG`.
   - Click **Process Refund**.
   - **Assertion**: Refund recorded in `patientrefund` with audit user timestamp; Bill balance adjusted.
4. **Cashier Shift End Reconcile**:
   - Navigate to `Billing -> Shift Summary`.
   - Enter physical cash denomination breakdown. Click **Close Shift**.
   - **Assertion**: Denominations persisted in `userbillingcounterdenominations`.

---

## 4. Inpatient & Nursing Bed Management (Role: `uat_nurse`)

### Synthetic Test Fixture
- **Admission Type**: Inpatient (Emergency/Elective) | **Admitting Doctor**: Dr. Rajesh Kumar
- **Ward**: `Male / Female Medical Ward` (Ward 1) | **Room**: Room 102 | **Bed**: Bed B-102-1
- **Transfer Target**: `ICU Stepdown` (Ward 2) | **Bed**: Bed ICU-04

### Step-by-Step Test Scenarios
1. **Inpatient Admission & Bed Allocation**:
   - Navigate to `IP Management -> IP Admission`.
   - Admit patient `Ananya Sharma`, select Ward 1 / Room 102 / Bed B-102-1.
   - Click **Save Admission**.
   - **Assertion**: Encounter created (TypeId: 2); Bed occupancy active in `bedoccupancyhistory`.
2. **Bed Transfer Workflow**:
   - Navigate to `IP Management -> Bed Transfer`.
   - Select patient; choose Target Ward 2 / Bed ICU-04. Enter Reason: `Post-op observation`.
   - Click **Transfer Patient**.
   - **Assertion**: Previous bed occupancy closed with DischargeDate; new bed occupancy active in `bedtransfer`.
3. **Nursing Vitals & Medication Administration Chart (eMAR)**:
   - Enter 4-hourly vitals and mark morning dose of `Aspirin` administered.
   - **Assertion**: eMAR timestamp recorded in `hims_prescriptiondetails`.
4. **Clinical Discharge & Clearance Event**:
   - Navigate to `IP Management -> Discharge Clearance`.
   - Initiate discharge request; verify pharmacy and billing clearance flags.
   - Click **Finalize Discharge**.
   - **Assertion**: Discharge event recorded in `patientdischargeevent` and bed freed.

---

## 5. Pharmacy & Stock Management (Role: `uat_pharmacy`)

### Synthetic Test Fixture
- **Store**: `Central Main Pharmacy` (Store ID: 1)
- **Item**: `Paracetamol 500mg Tablets` | **Batch**: `PCM-2026-09` | **Expiry**: `2028-12-31`
- **GRN Quantity**: 500 Strips | **Purchase Price**: ₹12.50 / Strip | **MRP**: ₹25.00 / Strip

### Step-by-Step Test Scenarios
1. **Inward Goods Received Note (GRN)**:
   - Navigate to `Pharmacy -> Goods Received Note (GRN)`.
   - Select Vendor `Apex Pharma Ltd`. Add Paracetamol (500 Strips, Batch `PCM-2026-09`).
   - Click **Save & Approve GRN**.
   - **Assertion**: GRN saved in `grns` / `grndetails`; Stock quantity incremented in `stockitems`.
2. **Dispense Prescription Stock**:
   - Navigate to `Pharmacy -> Prescription Dispense`.
   - Search Patient `Ananya Sharma`. Select active prescription.
   - Verify auto-selected batch `PCM-2026-09` based on FIFO/FEFO.
   - Click **Dispense Medication & Issue Bill**.
   - **Assertion**: Stock deducted from `stockitems`; Dispense record in `patientdispenses`.
3. **Inter-Store Stock Transfer**:
   - Navigate to `Pharmacy -> Stock Transfer`.
   - Transfer 50 strips from `Central Pharmacy` to `Emergency Pharmacy (Store 2)`.
   - **Assertion**: Outward & inward transfer records logged in `stocktransfers`.

---

## 6. Laboratory Information System - LIS (Role: `uat_lab`)

### Synthetic Test Fixture
- **Test Ordered**: `Complete Blood Count (CBC) with Differential`
- **Sample Type**: `Whole Blood EDTA (Lavender Top Tube)`
- **Analyte Results**:
  - `Hemoglobin (Hb)`: `13.8 g/dL` (Ref: `12.0 - 15.5 g/dL`)
  - `WBC Count`: `7,200 /uL` (Ref: `4,000 - 11,000 /uL`)
  - `Platelet Count`: `240,000 /uL` (Ref: `150,000 - 450,000 /uL`)

### Step-by-Step Test Scenarios
1. **Order Lab Test & Accessioning**:
   - Navigate to `LIS -> Lab Orders`. Requisition CBC for patient `Ananya Sharma`.
   - Navigate to `LIS -> Phlebotomy & Sample Collection`. Click **Collect Sample**.
   - **Assertion**: Unique Accession / Barcode number generated in `workordersamples`.
2. **Result Entry & Technical Verification**:
   - Navigate to `LIS -> Result Entry`. Enter Hb `13.8`, WBC `7200`, Platelets `240000`.
   - Click **Save & Technologist Verify**.
   - **Assertion**: Results persisted in `patientworkorderdetails`.
3. **Pathologist Approval & Release Report**:
   - Pathologist reviews results, adds comment: `Normal hemogram`. Click **Release Report**.
   - Click **Print Lab Report**.
   - **Assertion**: Formatted diagnostic report rendered with institutional header, NABL format, and reference ranges.

---

## 7. Operation Theatre - OT (Role: `uat_ot`)

### Synthetic Test Fixture
- **Procedure**: `Diagnostic Coronary Angiography`
- **OT Room**: `Cath Lab / OT Room 1` | **Scheduled Time**: `10:00 AM - 11:30 AM`
- **Surgical Team**: Lead Surgeon: `Dr. Rajesh Kumar`, Anesthetist: `Dr. Ramesh Rao`, Scrub Nurse: `Sister Mary`

### Step-by-Step Test Scenarios
1. **Book OT Slot & Pre-Op Safety Checklist**:
   - Navigate to `OT Management -> Surgery Scheduling`. Book Room 1 for `Ananya Sharma`.
   - Navigate to `OT Management -> Pre-Op Checklist`. Complete WHO Surgical Safety Checklist (Patient identity, PAC clearance, consent verified).
   - **Assertion**: Schedule recorded in `hims_surgeryschedule`; Checklist in `preoperativechecklist`.
2. **Record Surgery Execution & Team Assignments**:
   - Navigate to `OT Management -> Surgery Entry`.
   - Record actual incision time `10:15 AM` and closure time `11:10 AM`. Assign surgical team members.
   - Enter OT Clinical Findings. Click **Save Entry**.
   - **Assertion**: Record persisted in `hims_surgeryentry` and `hims_surgeryentrydetails`.

---

## 8. Insurance & TPA Desk (Role: `uat_insurance`)

### Synthetic Test Fixture
- **TPA / Payer**: `Star Health Insurance Corp` | **Policy No**: `SH-2026-88990`
- **Guarantee Letter (GL) Pre-Auth Limit**: ₹50,000.00
- **Package Tariff**: `Angiography Package` (Total: ₹25,000.00 | Copay: 10% Patient, 90% TPA)

### Step-by-Step Test Scenarios
1. **Issue Guarantee Letter (GL) Pre-Authorization**:
   - Navigate to `Insurance -> TPA Pre-Authorization`.
   - Enter GL Number `GL-STAR-001` with Limit ₹50,000.00. Attach to encounter.
   - **Assertion**: GL persisted in `encounterguarantorgl` with active balance ₹50,000.00.
2. **Corporate Package Billing & Split**:
   - Assign `Angiography Package` (₹25,000).
   - **Assertion**: System computes Patient Liability = ₹2,500.00, TPA Liability = ₹22,500.00 in `patientbillpackagesummary`.
3. **Insurance Claim Settlement & TDS Accounting**:
   - Navigate to `Insurance -> Claim Settlement`.
   - Receive TPA Payment: Claimed ₹22,500.00, Received ₹21,375.00, TDS Deducted ₹1,125.00 (5%).
   - Click **Settle Claim**.
   - **Assertion**: Settlement and TDS accounting logged in `hims_insurancepayment`.

---

## 9. Medical Records Department - MRD (Role: `uat_mrd`)

### Synthetic Test Fixture
- **Discharge Summary Type**: `Cardiology Inpatient Summary`
- **Clinical Sections**: History of Present Illness, Course in Hospital, Discharge Medications, Follow-up Advice
- **MRD File Location**: `Rack C, Shelf 4, Box 12`

### Step-by-Step Test Scenarios
1. **Draft, Finalize & Print Discharge Summary**:
   - Navigate to `MRD -> Discharge Summary`. Select discharged patient `Ananya Sharma`.
   - Populate clinical summary sections and follow-up advice (Review after 2 weeks).
   - Click **Finalize & Sign Summary**.
   - **Assertion**: Summary locked in `dischargesummary`; Print preview renders clean clinical format.
2. **Physical File Movement Tracking**:
   - Navigate to `MRD -> File Movement Tracking`.
   - Log file inward from Ward 1 to MRD Rack `C-4-12`.
   - **Assertion**: Physical movement history logged in `hims_mrdtrackings`.

---

## 10. Hospital Administration & MIS (Role: `uat_admin`)

### Synthetic Test Scenarios
1. **Generate Revenue MIS Reports**:
   - Navigate to `MIS Reports -> Department Revenue`. Select current date range.
   - **Assertion**: Aggregates Cardiology, Pharmacy, and LIS revenue correctly matching billing tables.
2. **Tally Accounting Export**:
   - Navigate to `MIS Reports -> Tally Export`. Export Sales and Collection Ledger.
   - **Assertion**: Export parses views (`tally_sale_view`, `tally_collection_view`) and generates valid data structure.
3. **User Security & Role Privilege Management**:
   - Create new test user, map to `Billing Clerk` role.
   - Login as new user; assert restricted access to clinical EMR and admin configurations.
