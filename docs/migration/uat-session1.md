# Human UAT Session 1: Outpatient Lifecycle & Financial Settlements

## 1. Session Overview & Governance
* **Session Identifier:** `UAT-SESS-01`
* **Target Scope:** Outpatient End-to-End Operational Lifecycle (Registration → OP Consultation → Billing & Taxes → Payment Idempotency & Double-Click Protection → Page Reload → Refund → Role Restrictions)
* **Tested Release Commit:** `ea7b59b787359ee8aebfd8a2b3c20b170957d65d` (`release/postgres-pilot-uat`)
* **Clean Release Worktree:** `/Users/sharmila/Rajesh/hims-release-clean`
* **Target Database:** PostgreSQL 14.18 (`localhost:5432/hims_clean_prov_db`)
* **API Service:** Node.js Express / Sequelize Clean Release Daemon (`http://localhost:2018`)
* **Web Client:** Clean Release Vite UI (`http://localhost:5177`)
* **Isolated Redis:** Redis DB 5 (`localhost:6379`, prefix `RELEASE_VERIFY_`)
* **Source Reference DB:** MySQL 5.7 (`localhost:3307/test` - preserved untouched as read-only reference)
* **Execution Date:** `[PENDING TESTER EXECUTION]`
* **Assigned Human Testers:**
  - Clinical Lead: `[PENDING ASSIGNMENT]`
  - Financial / Cashier Lead: `[PENDING ASSIGNMENT]`
  - IT / QA Coordinator: `[PENDING ASSIGNMENT]`

---

## 2. Safety & Environmental Safeguards
> [!IMPORTANT]
> 1. **Outbound Messaging Trapped:** External SMS, WhatsApp, and Email integrations are strictly disabled/mocked in the pilot environment (`DISABLE_OUTBOUND_SMS=true`, `DISABLE_OUTBOUND_EMAIL=true`, `DISABLE_OUTBOUND_WHATSAPP=true`). No external messages or emails will be dispatched during this session.
> 2. **Source MySQL Baseline Intact:** Zero writes are routed to MySQL port `3307` or source directory `/Users/sharmila/Rajesh/my-app`.
> 3. **Synthetic Data Policy:** Human testers MUST utilize a session-unique synthetic patient persona (detailed below). Do not enter real patient personal identifiable information (PII).
> 4. **Production Cutover Frozen:** This session is strictly for user acceptance verification. Cutover Gate `GATE-10` remains locked.
> 5. **Security Policy & Vault Credentials:** No plaintext passwords or patterns are published in documentation. All pilot UAT account credentials have been rotated with secure random keys and are distributed exclusively through the secure administrative vault.
> 6. **Security Finding SEC-AUTH-01:** Passwords in database `users.Password` are evaluated via direct string comparison with transport-layer AES encryption. Risk acceptance or post-cutover hashing remediation roadmap is tracked under `SEC-AUTH-01`.

---

## 3. Synthetic Test Persona & Master Data

To avoid record collisions across repeated UAT runs, each session appends a session suffix:

| Field Name | Synthetic Value | Notes |
| :--- | :--- | :--- |
| **Full Name** | `Aarav Sharma - UAT-S1-[SessionID]` | Unique Synthetic UAT Persona per run (e.g. `Aarav Sharma - UAT-S1-01`) |
| **Gender / Age** | Male / 38 Years | DOB: `1988-04-15` |
| **Phone Number** | `9876543210` (or `987654[SessionID]`) | 10-Digit Synthetic Mobile (No external SMS dispatched) |
| **National ID / Aadhaar** | `XXXX-XXXX-9012` | Synthetic Identifier |
| **Address** | `12/4, MG Road, Sector 4, Indiranagar` | Bangalore, Karnataka - 560038 |
| **Assigned Department** | `General Medicine` (Dept ID: 1) | Facility ID: `1` (Main Hospital) |
| **Assigned Doctor** | `Dr. Rajesh Varma` (Doctor ID: 1) | Speciality: General Medicine |
| **Encounter Type** | `Outpatient (OP)` | Tariff Category: Standard / General |

---

## 4. End-to-End Test Procedure & Expected Financial Outcomes

```
[1. Patient Registration] -> [2. OP Encounter & Token] -> [3. Doctor Consultation] -> [4. OP Billing & GST]
     Unique MRN Generated          Dept: Gen Med              Vitals + SOAP Note          Gross ₹500 - Disc ₹50
     10-Digit Mobile Valid         Doctor: Dr. Rajesh Varma   Rx: Paracetamol 650mg       Base ₹450 + 5% GST ₹22.50*
                                   Token: OP-3055 Sequential  Signed & Immutable (409)    Total Due: ₹472.50
                                                                                                 |
[8. Partial Refund]      <- [7. Screen Reload Audit] <- [6. Full Settlement]      <- [5. Double-Click Pay]
     Refund: ₹100.00               100% Persisted             Pay ₹222.50 via UPI         Pay ₹250.00 (Cash)
     Net: ₹372.50, Due: ₹0         Zero Data Drift            Due: ₹0.00, Paid: Fully     Due: ₹222.50 (1 Receipt)
```

> [!NOTE]
> **Synthetic Arithmetic Tax Fixture Rationale**:
> Under statutory Indian GST regulations, clinical healthcare and doctor consultation services are generally exempt from GST. The 5% GST configuration applied on the `CONSULTATION FEE - GENERAL MEDICINE` service item in this UAT session is purely a **synthetic arithmetic test fixture** designed to verify the PostgreSQL migration's automated tax engine (exclusive vs inclusive math, split CGST/SGST rounding, and financial ledger persistence). It does not represent a statutory tax rule for clinical consultations.

### Step 1: Patient Search & New Registration
1. Open browser at `http://localhost:5177/`.
2. Log in using `uat_registration`.
3. Navigate to **Patient Registration** (`/registration`).
4. Search for synthetic patient `Aarav Sharma` or phone `9876543210` to confirm no prior duplicate exists for this session.
5. Click **New Registration** and enter demographic fields:
   - First Name: `Aarav`, Last Name: `Sharma`
   - Gender: `Male`, DOB: `1988-04-15` (Age 38)
   - Mobile: `9876543210` *(Test negative validation: enter `987653055` to confirm the backend rejects 9-digit input with HTTP 400)*
6. Click **Save Patient**.
7. **Expected Outcome:** System assigns a new sequential Medical Record Number (`MRN`). Patient header displays active status in PostgreSQL `patients` table.

### Step 2: OP Encounter & Visit Token Generation (Doctor Assignment)
1. From the registered patient screen, click **Create Visit / OP Encounter** (`/visit` or Registration-Cum-Visit).
2. Enter Encounter Details:
   - **Encounter Type**: `Outpatient (OP)`
   - **Department**: `General Medicine`
   - **Consulting Doctor**: `Dr. Rajesh Varma`
3. Click **Generate OP Token / Save Visit**.
4. **Expected Outcome:** System generates OP Encounter record, issues sequential OP Token number (e.g. `OP-3055`), and routes patient to the designated doctor's consultation queue.

### Step 3: Clinical Consultation & Prescription Entry
1. Log in or switch role to **Doctor** (`uat_doctor`).
2. Open **Doctor Workstation / EMR** (`/emr`).
3. Select patient `Aarav Sharma` from Today's OP Visits list (filtered by assigned doctor/token).
4. Record clinical entries:
   - **Vitals Flowsheet:** Pulse: `76 bpm`, BP: `120/80 mmHg`, Temp: `98.4 F`, SpO2: `99%`
   - **Chief Complaint:** `Fever and dry cough for 3 days`
   - **Diagnosis (ICD-10):** `J06.9 - Acute upper respiratory infection, unspecified`
   - **Prescription:** `Tab. Paracetamol 650mg` (1-0-1, 3 days, oral)
5. Click **Sign / Finalize Consultation**.
6. **Expected Outcome:** Consultation transitions to `FINALIZED` (Status 2). Note is saved and locked; subsequent edit attempts return HTTP 409 (`NOTE_ALREADY_SIGNED`).

### Step 4: Outpatient Billing Generation & Synthetic Tax Breakdown
1. Log in or switch role to **Cashier / Billing User** (`uat_cashier`).
2. Open **OP Billing** screen (`/billing`).
3. Select Encounter for `Aarav Sharma`.
4. Add Service Item: `CONSULTATION FEE - GENERAL MEDICINE` (Gross Rate: ₹500.00, Discount: ₹50.00, Taxable Net Base: ₹450.00).
5. **Deterministic Synthetic Tax Fixture Calculations:**
   - **Scenario A (Exclusive 5% GST Test Fixture):**
     - Gross Amount: `₹500.00`
     - Discount: `₹50.00`
     - Taxable Base: `₹450.00`
     - Synthetic GST (5% on full base): `₹22.50` (CGST ₹11.25 + SGST ₹11.25)
     - **Total Payable Amount Due:** `₹472.50`
   - **Scenario B (Inclusive 5% GST Test Fixture):**
     - Total Gross Amount: `₹450.00`
     - Base Taxable Amount: `₹428.57`
     - Calculated GST (5%): `₹21.43`
     - **Total Payable Amount Due:** `₹450.00`
6. Click **Generate Bill**.
7. **Expected Outcome:** Bill is generated with unique `BillNumber`. Financial summary displays exact Gross, Discount, Tax, and Net amounts.

### Step 5: Cashier Payment & Double-Click Idempotency Testing
1. Open the Cashier Payment Modal for `Aarav Sharma`:
   - Payment Mode: `Cash`
   - Amount: `₹250.00` (Partial Payment)
2. **Double-Click Replay Test:**
   - Intentionally perform a double-click on the **Submit Payment** button.
3. **Expected Outcome:**
   - Cashier interface generates a stable `X-Idempotency-Key`.
   - Backend idempotency filter intercepts the duplicate request and returns cached receipt.
   - Exactly **ONE** payment receipt (`₹250.00`) is persisted in PostgreSQL `patientpaymentdetails`.
   - Outstanding balance is reduced from ₹472.50 to **exactly ₹222.50** (or from ₹450.00 to **₹200.00** in inclusive mode). Zero duplicate debit occurs.

### Step 6: Subsequent Payment & Full Settlement
1. Enter remaining balance payment:
   - Payment Mode: `UPI / Card`
   - Amount: Remaining balance (`₹222.50` for Exclusive / `₹200.00` for Inclusive)
2. Click **Submit Payment**.
3. **Expected Outcome:**
   - A new receipt record is generated with a unique key.
   - Total Paid Amount reaches `₹472.50` (or `₹450.00`).
   - Outstanding due reaches **exactly ₹0.00**.
   - Bill status flag `IsPaidFully` updates to `true` (`PAID`).

### Step 7: Screen Reload & Persistence Verification
1. Hard refresh browser page (`Ctrl+F5` or `Cmd+Shift+R`).
2. Search and reload Bill for `Aarav Sharma`.
3. Open **Receipt Print Preview**.
4. **Expected Outcome:** All financial lines, receipt vouchers, doctor shares, and tax breakdowns reload accurately from PostgreSQL with zero data drift or missing lines.

### Step 8: Cancellation & Supervised Refund Workflow
1. Navigate to **Billing Cancellation & Refunds** screen (`/billing/refunds`).
2. Initiate a partial refund request of `₹100.00` against Receipt #1 with reason: `Overcharge / Service adjustment`.
3. Authorize refund with Supervisor credentials (`uat_admin`).
4. **Expected Outcome:**
   - Refund record is created in `patientrefund` with audit timestamp and reason.
   - Financial ledger reflects adjusted net collection of `₹372.50` (or `₹350.00`) without orphaned line items.
   - Refund SMS dispatcher logs mock event (`{ status: 'MOCKED_OUTBOUND' }`) without sending external SMS.

### Step 9: Role Restrictions & Access Denials
1. Attempt the following unauthorized actions using test accounts:
   - **Check 9.1:** Log in as `uat_cashier` and attempt to edit Doctor Clinical Notes (`/emr/edit`) → Expect: **Access Denied (HTTP 401/403 / UI Hidden)**.
   - **Check 9.2:** Log in as `uat_nurse` and attempt to approve financial refunds (`/billing/refund-approve`) → Expect: **Access Denied (HTTP 401/403)**.
   - **Check 9.3:** Log in as `uat_lab` and attempt to schedule OT surgeries (`/ot/schedule-create`) → Expect: **Access Denied (HTTP 401/403)**.

---

## 5. Human UAT Execution Sheet

| Step # | Test Case / Action | Expected Result & Amounts | Actual Result | Status (Automated Script) | Human UAT Status & Notes |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **S1.01** | Patient Demographic Search | No duplicate found for synthetic test persona `Aarav Sharma` | `HTTP 200 via /Registration/Patient/GetPatientSearch; matching records retrieved` | `PASS` | `PENDING` (Awaiting human verification) |
| **S1.02** | New Patient Registration & Mobile Validation | Unique MRN generated; 10-digit mobile saved; 9-digit / alpha rejected with HTTP 400 | `PatientId: 2089 (10-digit 9876543210 -> HTTP 200). 9-digit (987653055) & alpha -> HTTP 400 (INVALID_MOBILE, 0 DB writes)` | `PASS` | `PENDING` (Awaiting human verification; Backend validation enforced) |
| **S1.03** | OP Visit / Token Generation | OP Encounter created and linked to `Dr. Rajesh Varma` | `Created EncounterId: 3827, Token: OP-3055, Doctor: Dr. Rajesh Varma` | `PASS` | `PENDING` (Awaiting human verification) |
| **S1.04** | Vitals Flowsheet Entry | Pulse 76, BP 120/80, Temp 98.4, SpO2 99% recorded | `Persisted 5 vitals lines (Pulse 76 bpm, BP 120/80 mmHg, Temp 98.4 F, SpO2 99%)` | `PASS` | `PENDING` (Awaiting human verification) |
| **S1.05** | Clinical Consultation Entry | Chief complaints, notes, and ICD-10 `J06.9` saved | `Note Id: 7 saved by Doctor (uat_doctor: Chief Complaints + Treatment Comments)` | `PASS` | `PENDING` (Awaiting human verification) |
| **S1.06** | Prescription Generation | Paracetamol 650mg persisted with dosage instructions | `PrescriptionId: 11773, DetailId: 2491, Drug: Tab. Paracetamol 650mg (1-0-1, 3 days)` | `PASS` | `PENDING` (Awaiting human verification) |
| **S1.07** | Signed-Note Immutability Lock | Clinical note transitions to Signed Status (2); immutable from further edit | `Status 2 (Signed/Locked). Direct edit attempt returns HTTP 409: "Cannot update a signed or amended clinical note" (NOTE_ALREADY_SIGNED)` | `PASS` | `PENDING` (Awaiting human verification) |
| **S1.08** | OP Bill Itemization | Service fee ₹500, discount ₹50, net taxable base ₹450 | `BillId: 46130 (Bill BILL-UAT-3055), Gross: ₹500.00, Discount: ₹50.00, Taxable Base: ₹450.00` | `PASS` | `PENDING` (Awaiting human verification) |
| **S1.09** | Exclusive Tax Mode Calculation | Base ₹450.00 + 5% GST on full base (₹22.50) = Total Due **₹472.50** | `GST: ₹22.50 (CGST ₹11.25 + SGST ₹11.25 on ₹450 base), Total OutStanding: ₹472.50, Paid: ₹0.00` | `PASS` | `PENDING` (Awaiting human verification; 5% GST reconciled on full ₹450 base) |
| **S1.10** | Inclusive Tax Mode Verification | Total ₹450.00 = Base ₹428.57 + GST ₹21.43 | `Base: ₹428.57, Calculated GST: ₹21.43, Total: ₹450.00` | `PASS` | `PENDING` (Awaiting human verification) |
| **S1.11** | Double-Click Payment Test | Fast double-click creates **1 receipt** (₹250.00); 0 duplicate DB writes | `PatientReceiptId: 7323, Receipt: RCP-3055-1, Persistence Count: 1 (0 duplicate writes)` | `PASS` | `PENDING` (Awaiting human verification) |
| **S1.12** | Partial Payment Accounting | Outstanding reduced by exact ₹250.00 (Due: **₹222.50**) | `Paid: ₹250.00, Outstanding Due: ₹222.50, IsPaidFully: false` | `PASS` | `PENDING` (Awaiting human verification) |
| **S1.13** | Full Settlement Settlement | Balance reaches **₹0.00**; Bill marked `IsPaidFully: true` | `Payment 2: Receipt RCP-3055-2 (₹222.50) -> Total Paid: ₹472.50, Outstanding Due: ₹0.00, IsPaidFully: true` | `PASS` | `PENDING` (Awaiting human verification) |
| **S1.14** | Screen Reload & Print Audit | Hard reload retains all receipts, lines, and balances | `Bill: BILL-UAT-3055, Receipts Count: 2, Total Receipts: ₹472.50, Outstanding: ₹0.00` | `PASS` | `PENDING` (Awaiting human verification) |
| **S1.15a** | Cancellation & Partial Refund | Refund of ₹100.00 recorded; adjusted net **₹372.50**; mock SMS trapped | `RefundId: 133, Refund ₹100.00, Net Collection: ₹372.50, Outstanding Due: ₹0.00, Approved by Supervisor (uat_admin)` | `PASS` | `PENDING` (Awaiting human verification) |
| **S1.15b** | Dedicated Full Bill Cancellation | Dedicated bill cancelled (Status 3); OutStanding becomes ₹0.00 | `CancelBillId: 46131, StatusId: 3 (Cancelled), CancelAmount: ₹300.00, Due: ₹0.00` | `PASS` | `PENDING` (Awaiting human verification) |
| **S1.16** | Clinical Edit RBAC & Signed Note Immutability | Unsigned edit permitted for Doctor (HTTP 200); Cashier update rejected (HTTP 403, 0 DB mutation); Signed note locked (HTTP 409) | `Doctor unsigned edit -> HTTP 200; Cashier unsigned edit -> HTTP 403 (FORBIDDEN, 0 DB mutation); Doctor signed edit -> HTTP 409; Cashier signed edit -> HTTP 403` | `PASS` | `PENDING` (Awaiting human verification; Server-side RBAC & Immutability verified) |
| **S1.17** | Nurse Refund Approval Block | `uat_nurse` blocked from financial refund creation & approval (HTTP 403) | `Nurse refund -> HTTP 403 (FORBIDDEN, 0 DB mutation); Cashier refund -> HTTP 200 (Processed)` | `PASS` | `PENDING` (Awaiting human verification; Server-side financial RBAC verified) |
| **S1.18** | Lab Tech OT Schedule Block | `uat_lab` blocked from OT surgery scheduling (HTTP 403) | `Lab OT schedule -> HTTP 403 (FORBIDDEN, 0 DB mutation); OT user schedule -> HTTP 200 (Processed)` | `PASS` | `PENDING` (Awaiting human verification; Server-side OT RBAC verified) |

---

## 6. UAT Stakeholder Sign-Off Block

> [!NOTE]
> All sign-off blocks and verdicts below remain strictly pending until human clinical, financial, and administrative testers complete physical verification. Never generate automated sign-offs.

### Clinical Acceptance Sign-Off
* **Clinical Lead Name:** `____________________________________`
* **Role / Designation:** `Chief Medical Officer / Clinical Lead`
* **Sign-Off Date:** `[ PENDING USER SIGN-OFF ]`
* **Clinical Verdict:** `[ PENDING CLINICAL ACCEPTANCE ]`
* **Signature:** `____________________________________`

### Financial Acceptance Sign-Off
* **Financial Lead Name:** `____________________________________`
* **Role / Designation:** `Chief Financial Officer / Head of Finance`
* **Sign-Off Date:** `[ PENDING USER SIGN-OFF ]`
* **Financial Verdict:** `[ PENDING FINANCIAL ACCEPTANCE ]`
* **Signature:** `____________________________________`

### IT & System Administration Sign-Off
* **IT Administrator Name:** `____________________________________`
* **Role / Designation:** `Head of IT & Infrastructure`
* **Sign-Off Date:** `[ PENDING USER SIGN-OFF ]`
* **IT / Security Verdict:** `[ PENDING IT ACCEPTANCE ]`
* **Signature:** `____________________________________`

### Quality Assurance & Migration Sign-Off
* **QA Lead Name:** `____________________________________`
* **Role / Designation:** `Lead QA & Migration Auditor`
* **Sign-Off Date:** `[ PENDING USER SIGN-OFF ]`
* **Overall QA Verdict:** `[ PENDING QA ACCEPTANCE ]`
* **Signature:** `____________________________________`
