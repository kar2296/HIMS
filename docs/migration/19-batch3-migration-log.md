# Phase 2 Batch 3: OP Billing & Cashier Migration Log

## 1. Executive Summary
- **Domain:** Outpatient Billing, Invoicing, Multi-Item Pricing, GST/Tax Computations, Cashier Receipts & Payments, Refunds/Cancellations, and Counter Closures.
- **Source Database:** MySQL 8.x (`localhost:3307`, DB: `test`)
- **Target Database:** PostgreSQL 14 (`localhost:5432`, DB: `hims_pilot_db`)
- **API Runtime:** Node.js/TypeScript Express daemon on `http://localhost:2014`
- **UI Runtime:** React 19 / Vite frontend on `http://localhost:5175`

---

## 2. Migrated Schema & Data Volume Reconciliation

| Table Name | MySQL Rows | PostgreSQL Rows | Status | DDL / Dialect Conversions |
|---|---|---|---|---|
| `patientbills` | 45,517 | 45,517 | **MATCH** | Replaced backticks, converted TINYINT(1) booleans, set SERIAL sequence default |
| `patientbilldetails` | 135,092 | 135,092 | **MATCH** | Numeric precision NUMERIC(18,4), TIMESTAMPTZ timestamps, foreign key alignments |
| `patientpaymentdetails` | 7,178 | 7,178 | **MATCH** | Primary key `PatientReceiptId` sequence bound, numeric decimal mapping |
| `patientaccounts` | 7,010 | 7,010 | **MATCH** | Patient deposit ledger records, status constraints preserved |
| `userbillingcounters` | 1,605 | 1,605 | **MATCH** | Cashier shift sessions & active counter statuses |
| `userbillingcounterdenominations` | 30,182 | 30,182 | **MATCH** | Physical currency denomination cash-in/cash-out records |
| `patientbillsummary` | 8,611 | 8,611 | **MATCH** | Header summary aggregations |
| `patientbillpackagesummary` | 6,215 | 6,215 | **MATCH** | Package breakdown allocations |
| `patientbilllock` | 1,732 | 1,732 | **MATCH** | Billing concurrency locks |
| `billingrequest` | 87 | 87 | **MATCH** | Inter-departmental billing authorization requests |
| `patientrefund` | 132 | 132 | **MATCH** | Cashier refunds & credit note vouchers |
| `patientrefunddetails` | 96 | 96 | **MATCH** | Item-level refund line details |
| `patientcreditnote` | 41 | 41 | **MATCH** | Credit note headers |
| `patientcreditnotedetails` | 81 | 81 | **MATCH** | Item-level credit note lines |
| `patientreturns` | 1,194 | 1,194 | **MATCH** | Pharmacy / service return tracking |
| `patientreturndetails` | 5,559 | 5,559 | **MATCH** | Return line item details |
| `patientdispensedetails` | 67,147 | 67,147 | **MATCH** | Dispense inventory allocation |
| `patientdispensereturndetails` | 5,429 | 5,429 | **MATCH** | Dispense return details |
| `patientdoctorsharedetails` | 8 | 8 | **MATCH** | Doctor revenue commission breakdown |
| `stockserialitems` | 13,510 | 13,510 | **MATCH** | Batch serial inventory items |
| `producttype` | 134 | 134 | **MATCH** | Product type master classifications |

---

## 3. Key Technical & Dialect Adaptations

1. **Custom Binary Operators for Mixed-Type Joins:**
   - In legacy code paths, string-based identifiers were compared directly with `BIGINT` foreign keys (e.g. `WHERE "DoctorId" = '1'`).
   - Implemented PostgreSQL custom operators `text = bigint` (`text_eq_bigint`) and `bigint = text` (`bigint_eq_text`) in `hims_pilot_db` to maintain 100% backward compatibility without degrading query execution plans.

2. **Column Names & Sequence Auto-Increments:**
   - Converted all auto-incrementing primary keys (`PatientBillId`, `PatientBillDetailId`, `PatientReceiptId`, `PatientRefundId`, `PatientAccountId`, `UserBillingCounterId`) to explicit PostgreSQL sequences and bound them with `DEFAULT nextval(...)` and `setval(..., MAX(...))`.

3. **Multi-Model Association Completeness:**
   - Populated and linked dependent Sequelize models including `patientreturns`, `patientdoctorsharedetails`, `stockserialitems`, and `producttype` to eliminate Sequelize eager-loading failures during complex nested invoice queries.
