# Human UAT Session 1: Outpatient Lifecycle & Financial Settlements

## 1. Session Overview & Governance
* **Session Identifier:** `UAT-SESS-01`
* **Target Scope:** Outpatient End-to-End Operational Lifecycle (Registration → OP Consultation → Billing & Taxes → Payment Idempotency & Double-Click Protection → Page Reload → Refund → Role Restrictions)
* **Tested Commit:** `f7d5fc213b7e50a71dab30f485904997c47d2204` (Baseline Git HEAD; see Section 7 for uncommitted working tree enhancements)
* **Target Database:** PostgreSQL 16 (`localhost:5432/hims_pilot_db`)
* **API Service:** Node.js Express / Sequelize Daemon (`localhost:2014`)
* **Web Client:** React/Vite Frontend (`localhost:5175`)
* **Source Reference DB:** MySQL 5.7 (`localhost:3307/test` - preserved as an untouched read-only reference baseline)
* **Execution Date:** `[PENDING TESTER EXECUTION]`
* **Assigned Human Testers:**
  - Clinical Lead: `[PENDING ASSIGNMENT]`
  - Financial / Cashier Lead: `[PENDING ASSIGNMENT]`
  - IT / QA Coordinator: `[PENDING ASSIGNMENT]`

---

## 2. Safety & Environmental Safeguards
> [!IMPORTANT]
> 1. **Outbound Messaging Trapped:** External SMS, WhatsApp, and Email integrations are strictly disabled/mocked in the pilot environment (`DISABLE_OUTBOUND_SMS=true`). No external patient messages or emails will be dispatched during this session.
> 2. **Source MySQL Baseline Intact:** Zero writes are routed to MySQL port `3307`.
> 3. **Synthetic Data Policy:** Human testers MUST utilize the synthetic patient persona detailed below. Do not enter real patient personal identifiable information (PII).
> 4. **Production Cutover Frozen:** This session is strictly for user acceptance verification. Cutover Gate `GATE-10` remains locked.

---

## 3. Synthetic Test Persona & Master Data
| Field Name | Synthetic Value | Notes |
| :--- | :--- | :--- |
| **Full Name** | `Aarav Sharma` | Synthetic UAT Persona |
| **Gender / Age** | Male / 38 Years | DOB: `1988-04-15` |
| **Phone Number** | `+91 98765 43210` | Mock Contact (No SMS dispatched) |
| **National ID / Aadhaar** | `XXXX-XXXX-9012` | Synthetic Identifier |
| **Address** | `12/4, MG Road, Sector 4, Indiranagar` | Bangalore, Karnataka |
| **Assigned Doctor** | `Dr. Rajesh Varma` | Speciality: General Medicine |
| **Department** | `General Medicine` | Facility ID: `1` (Main Hospital) |
| **Encounter Type** | `Outpatient (OP)` | Tariff Category: General / Standard |

---

## 4. End-to-End Test Procedure & Expected Financial Outcomes

```
[Patient Registration] -> [OP Encounter] -> [Clinical EMR] -> [OP Bill Generated]
       |                       |                   |                   |
  Unique MRN              OP Token #          Finalized Rx      ₹472.50 (Excl 5% GST)
                                                                or ₹450.00 (Incl 5% GST)
                                                                       |
[Refund / Cancellation] <- [Page Reload Audit] <- [Full Settle] <- [Double-Click Pay]
   Refund: ₹100.00          Persisted Data          Pay: ₹222.50       Pay: ₹250.00
   Net: ₹372.50             100% Retained           Due: ₹0.00         Due: ₹222.50 (1 Write)
```

### Step 1: Patient Search & New Registration
1. Navigate to **Patient Registration** screen (`/registration`).
2. Search for synthetic patient `Aarav Sharma` or phone `9876543210` to confirm no duplicate exists.
3. Click **New Registration** and enter demographic fields:
   - First Name: `Aarav`, Last Name: `Sharma`
   - Gender: `Male`, DOB: `1988-04-15`
   - Mobile: `9876543210`
4. Click **Save Patient**.
5. **Expected Outcome:** System assigns a new unique Medical Record Number (`MRN`) sequentially. Patient header displays active status in PostgreSQL `patients` table.

### Step 2: Outpatient Encounter Creation
1. From the registered patient screen, click **Create Visit / Encounter**.
2. Select:
   - Encounter Type: `Outpatient (OP)`
   - Department: `General Medicine`
   - Consulting Doctor: `Dr. Rajesh Varma`
3. Click **Generate OP Token / Visit**.
4. **Expected Outcome:** System creates OP Encounter record, issues OP Token number, and links encounter to patient `MRN`.

### Step 3: Clinical Consultation & Prescription Entry
1. Log in or switch role to **Doctor** (`doctor1`).
2. Open **Doctor Workstation / EMR** (`/emr`).
3. Select patient `Aarav Sharma` from Today's OP Visits list.
4. Record clinical entries:
   - **Vitals Flowsheet:** Pulse: `76 bpm`, BP: `120/80 mmHg`, Temp: `98.4 F`, SpO2: `99%`
   - **Chief Complaint:** `Fever and dry cough for 3 days`
   - **Diagnosis (ICD-10):** `J06.9 - Acute upper respiratory infection, unspecified`
   - **Prescription:** `Tab. Paracetamol 650mg` (1-0-1, 3 days, oral)
5. Click **Finalize Consultation**.
6. **Expected Outcome:** Consultation status transitions to `FINALIZED`. Clinical note is saved and locked from inadvertent non-physician editing.

### Step 4: Outpatient Billing Generation & Tax Breakdown
1. Log in or switch role to **Cashier / Billing User** (`cashier1`).
2. Open **OP Billing** screen (`/billing`).
3. Select Encounter for `Aarav Sharma`.
4. Add Service Item: `CONSULTATION FEE - GENERAL MEDICINE` (Gross Rate: ₹500.00, Discount: ₹50.00, Taxable Net: ₹450.00).
5. **Deterministic Tax Mode Calculations:**
   - **Scenario A (Exclusive 5% GST):**
     - Gross Amount: `₹500.00`
     - Discount: `₹50.00`
     - Taxable Base: `₹450.00`
     - GST (5%): `₹22.50`
     - **Total Payable Amount Due:** `₹472.50`
   - **Scenario B (Inclusive 5% GST):**
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
3. Authorize refund with Supervisor credentials.
4. **Expected Outcome:**
   - Refund record is created in `patientrefund` with audit timestamp and reason.
   - Financial ledger reflects adjusted net collection of `₹372.50` (or `₹350.00`) without orphaned line items.
   - Refund SMS dispatcher logs mock event (`{ status: 'MOCKED_OUTBOUND' }`) without sending external SMS.

### Step 9: Role Restrictions & Access Denials
1. Attempt the following unauthorized actions using test accounts:
   - **Check 9.1:** Log in as `cashier1` and attempt to edit Doctor Clinical Notes (`/emr/edit`) → Expect: **Access Denied (HTTP 403 / UI Hidden)**.
   - **Check 9.2:** Log in as `nurse1` and attempt to approve financial refunds (`/billing/refund-approve`) → Expect: **Access Denied (HTTP 403)**.
   - **Check 9.3:** Log in as `labtech1` and attempt to schedule OT surgeries (`/ot/schedule-create`) → Expect: **Access Denied (HTTP 403)**.

---

## 5. Human UAT Execution Sheet

| Step # | Test Case / Action | Expected Result & Amounts | Actual Result | Status (Pass / Fail) | Tester Notes & Defect ID |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **S1.01** | Patient Demographic Search | No duplicate found for synthetic test persona `Aarav Sharma` | `[PENDING]` | `[PENDING]` | |
| **S1.02** | New Patient Registration | Unique MRN generated, patient saved to PostgreSQL `patients` | `[PENDING]` | `[PENDING]` | |
| **S1.03** | OP Visit / Token Generation | OP Encounter created and linked to `Dr. Rajesh Varma` | `[PENDING]` | `[PENDING]` | |
| **S1.04** | Vitals Flowsheet Entry | Pulse 76, BP 120/80, Temp 98.4, SpO2 99% recorded | `[PENDING]` | `[PENDING]` | |
| **S1.05** | Clinical Consultation Entry | Chief complaints, notes, and ICD-10 `J06.9` saved | `[PENDING]` | `[PENDING]` | |
| **S1.06** | Prescription Generation | Paracetamol 650mg persisted with dosage instructions | `[PENDING]` | `[PENDING]` | |
| **S1.07** | EMR Finalization Lock | Record transitions to Finalized; locked from non-MD edit | `[PENDING]` | `[PENDING]` | |
| **S1.08** | OP Bill Itemization | Service fee ₹500, discount ₹50, net taxable ₹450 | `[PENDING]` | `[PENDING]` | |
| **S1.09** | Exclusive Tax Mode | Base ₹450.00 + 5% GST (₹22.50) = Total Due **₹472.50** | `[PENDING]` | `[PENDING]` | |
| **S1.10** | Inclusive Tax Mode | Total ₹450.00 = Base ₹428.57 + GST ₹21.43 | `[PENDING]` | `[PENDING]` | |
| **S1.11** | Double-Click Payment Test | Fast double-click creates **1 receipt** (₹250.00); 0 duplicate DB writes | `[PENDING]` | `[PENDING]` | |
| **S1.12** | Partial Payment Accounting | Outstanding reduced by exact ₹250.00 (Due: **₹222.50** or **₹200.00**) | `[PENDING]` | `[PENDING]` | |
| **S1.13** | Full Settlement Settlement | Balance reaches **₹0.00**; Bill marked `IsPaidFully: true` | `[PENDING]` | `[PENDING]` | |
| **S1.14** | Screen Reload & Print Audit | Hard reload retains all receipts, lines, and balances | `[PENDING]` | `[PENDING]` | |
| **S1.15** | Cancellation & Refund | Refund of ₹100.00 recorded; adjusted net **₹372.50**; mock SMS trapped | `[PENDING]` | `[PENDING]` | |
| **S1.16** | Cashier EMR Edit Block | `cashier1` blocked from clinical note modifications | `[PENDING]` | `[PENDING]` | |
| **S1.17** | Nurse Refund Approval Block | `nurse1` blocked from financial refund approvals | `[PENDING]` | `[PENDING]` | |
| **S1.18** | Lab Tech OT Schedule Block | `labtech1` blocked from OT schedule creation | `[PENDING]` | `[PENDING]` | |

---

## 6. UAT Stakeholder Sign-Off Block

> [!NOTE]
> All sign-off blocks and verdicts below remain pending until human clinical, financial, and administrative testers complete physical verification.

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

---

## 7. Working Tree Delta Context
The baseline Git HEAD commit is `f7d5fc213b7e50a71dab30f485904997c47d2204`. The following enhancements are present in the active pilot working tree:
1. `idempotency_records` table and PostgreSQL `ON CONFLICT DO NOTHING` engine in `HimsPatientPaymentDetailsBo`.
2. Outbound SMS/WhatsApp mock interception in `Base/Business/Index.ts` and `HimsPatientRefundBo.ts`.
3. Error handler status preservation in `Bootstrap.ts` (preserving HTTP 409 Conflict).
4. Reconciled automated test suite harness (`run_all_reconciled_suites.cjs` / 153 tests).
