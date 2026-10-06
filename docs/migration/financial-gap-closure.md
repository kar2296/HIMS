# Financial Calculation, Tax Math & Payment Concurrency Closure Report
**Date:** 2026-10-06  
**Environment:** PostgreSQL 14 (`hims_pilot_db`) / Express API (`:2014`) / MySQL 5.7 (`:3307`)  
**Audit Suites:** `test_tax_math_parity.cjs`, `test_financial_concurrency.cjs`, `test_payment_replay_concurrency.cjs`, `test_refund_failure_injection.cjs`  
**Sign-Off Gate:** `GATE-05` (Marked `PENDING_INVESTIGATION`)

---

## 1. Executive Summary

This report documents the rigorous mathematical verification, concurrency testing, failure injection, and parity audit of the financial billing, tax calculation, and payment settlement subsystem in the HIMS PostgreSQL migration pilot.

---

## 2. Tax Math Verification & Engine Parity Audit

### A. Mathematical Formulation
For an item with Gross ₹500.00 and Discount ₹50.00 (Net Amount = ₹450.00) under 5% GST:

1. **Tax Exclusive Mode (Standard Healthcare Service / Pharmacy):**
   $$\text{Taxable Base} = \text{Gross} - \text{Discount} = ₹450.00$$
   $$\text{GST Amount (5\%)} = 450.00 \times 0.05 = ₹22.50$$
   $$\text{Total Payable} = 450.00 + 22.50 = ₹472.50$$

2. **Tax Inclusive Mode (All-Inclusive Package / Retail Pricing):**
   $$\text{Taxable Base} = \frac{450.00}{1 + 0.05} = \frac{450.00}{1.05} = ₹428.5714... \approx ₹428.57$$
   $$\text{GST Component (5\%)} = 450.00 - 428.57 = ₹21.43$$
   $$\text{Total Payable} = ₹450.00$$

### B. Parity Assertion Results (`test_tax_math_parity.cjs`)

| Test Case | Mode | Taxable Base | GST Amount | Total Payable | Parity Status | Details |
|:---|:---:|:---:|:---:|:---:|:---:|:---|
| **1. Exclusive Tax Verification** | EXCLUSIVE | ₹450.00 | ₹22.50 | ₹472.50 | **PASSED** | Base ₹450.00, GST ₹22.50, Total ₹472.50 |
| **2. Inclusive Tax Verification** | INCLUSIVE | ₹428.57 | ₹21.43 | ₹450.00 | **PASSED** | Base ₹428.57, GST ₹21.43, Total ₹450.00 |
| **3. MySQL vs PostgreSQL DB Parity** | PRECISION | MySQL: 428.57 / PG: 428.57 | MySQL: 21.43 / PG: 21.43 | MySQL: 450.00 / PG: 450.00 | **PASSED** | 100% rounding & decimal precision parity |
| **4. Live Bill Persistence** | PG_PERSIST | ₹450.00 | ₹22.50 | ₹472.50 | **PASSED** | Bill #46160 persisted cleanly in `patientbills` |

---

## 3. Same-Bill Concurrent Payment & Balance Integrity

### A. Test Execution & Fixture (`test_payment_replay_concurrency.cjs`)
- **Initial Bill Fixture:** Encounter created with Bill Net Amount = **₹900.00** (Paid: ₹0.00, Outstanding: ₹900.00).
- **Concurrent Payments:** Two simultaneous HTTP POST requests issued against `/Billing/PatientPaymentDetails/AddPatientPaymentDetails`:
  - **Payment 1:** Amount = **₹400.00** (Receipt #1 generated).
  - **Payment 2:** Amount = **₹500.00** (Receipt #2 generated).
- **Database Verification:**
  - Receipts Count: Exactly **2 receipts**.
  - Total Paid Sum: **₹900.00**.
  - Remaining Outstanding Balance: **₹0.00**.
  - Status: Fully settled without race conditions or deadlocks.

---

## 4. Payment Replay & Duplicate Submission Analysis

### A. Test Case & Finding
- **Payload Replay:** The exact identical JSON payload for Payment 1 (₹400.00) was re-submitted immediately following settlement.
- **Observed Behavior:** The legacy Express backend generates an additional receipt (Receipt #3).
- **Defect Classification:** **DEF-SRC-001 (Existing Source Defect)**.
  - *Root Cause:* The source Express API does not enforce idempotency key headers (`X-Idempotency-Key`) or unique transaction request hashes on cashier endpoints.
  - *Migration Principle:* Preserves 100% parity with source legacy behavior while logging the defect for subsequent middleware enhancement.

---

## 5. Refund Failure Injection & Atomic Rollback Audit

### A. Test Case (`test_refund_failure_injection.cjs`)
1. **Normal Refund Setup:** Bill with ₹500.00 paid receipt.
2. **Injected Failure:** Refund Header inserted inside transaction `BEGIN`, followed by an intentional schema constraint failure on line detail insert.
3. **Assertion:**
   - Transaction caught error and executed `ROLLBACK;`.
   - Verified count of orphaned headers in `patientrefund` with audit marker: **0 orphaned rows**.
4. **Valid API Submission:** Subsequent valid refund request succeeded via HTTP API with 100% database persistence.

---

## 6. Outbound Messaging Isolation

- **Configuration:** `.env` contains `DISABLE_OUTBOUND_SMS=true`, `ENABLE_OUTBOUND_SMS=false`, `DISABLE_OUTBOUND_WHATSAPP=true`.
- **Implementation:** `Base/Business/Index.ts` (`GetSmsProvider()`) and `HimsPatientRefundBo.ts` (`sendRefundSms()`) return mock status `{ status: 'MOCKED_OUTBOUND', success: true }`, completely preventing external network calls during testing and human UAT.

---

## 7. Sign-Off Gate Status

- **`GATE-05` Status:** Marked **`PENDING_INVESTIGATION`** in `docs/migration/readiness-gates.csv`.
- **Reason:** Formal mathematical parity and transactional safety verified; pending final Financial Controller review of source payment replay policy (DEF-SRC-001).
