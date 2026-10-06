# Batch 6 Gap Closure & Technical Reconciliation Report

## 1. Database Object Count & Manifest Reconciliation (124 vs 274 Objects)

### A. Object Inventory in PostgreSQL (`hims_pilot_db`)
- **Total Database Objects:** 315 objects
  - **Base Tables:** 314 tables
  - **Views:** 1 view (`bedtransfers`)

### B. Explanation of Historical Counts
- **124 Tables:** The core domain entities migrated with active transactional and historical data across Batches 1 through 6 (e.g., `patients`, `encounters`, `patientbills`, `patientbilldetails`, `patientpaymentdetails`, `patientrefund`, `bedoccupancyhistory`, `bedtransfer`, `itemmaster`, `grn`, `grndetails`, `stockentry`, `stockentrydetails`, `testmaster`, `patientworkorders`, `patientworkorderdetails`, etc.).
- **190 Additional Objects (314 - 124):** Foundation schema tables, lookup tables, DDL structures, code references (`referencevalues`, `systemparameters`, `billingparameters`), master seed tables, and configuration entities created and verified during Phase 0 and Phase 1 pilot setup.
- **Total Unique Tables Manifest:** Documented in [`all-table-coverage.csv`](./all-table-coverage.csv), providing a complete accounting of all 562 source tables and their disposition.

---

## 2. Testmaster Row Count Reconciliation: 1,321 vs 1,393

### A. Investigation Findings
- **Raw `testmaster` Table Count:** Exactly **1,321 active rows** in both MySQL source and PostgreSQL pilot database.
- **Cause of `TotalRecords: 1393` in API Response:**
  - The Sequelize business object `TestmasterBo.GetTestmasters` executes `Testmaster.findAndCountAll` with an eager `LEFT OUTER JOIN` on `serviceitems` (mapped via `MasterItemId = TestmasterId`).
  - Exactly **72 lab tests** possess **2 tariff/rate tier records** in `serviceitems` (e.g. standard OPD tariff vs emergency/IPD tariff).
  - The join evaluates to the Cartesian product for those 72 rows:
    $$\text{Total Records} = 1321 + 72 = 1393$$
- **Parity Confirmation:**
  - MySQL Source API (`http://localhost:2012/LIS/TestMaster/GetTestmasters`): Returns `PageContext.TotalRecords = 1393`.
  - PostgreSQL Pilot API (`http://localhost:2014/LIS/TestMaster/GetTestmasters`): Returns `PageContext.TotalRecords = 1393`.
  - Exact 100% parity is verified between MySQL and PostgreSQL.

---

## 3. Inclusive vs Exclusive Billing Mathematics

### A. Core Mathematical Formulas
1. **Gross & Discount:**
   $$\text{Taxable Base} = \text{Gross Amount} - \text{Discount Amount}$$
2. **Exclusive GST (e.g., 5% Tax):**
   $$\text{GST Amount} = \text{Taxable Base} \times \text{Tax Rate} = 450.00 \times 0.05 = 22.50$$
   $$\text{Patient Net Payable} = \text{Taxable Base} + \text{GST Amount} = 450.00 + 22.50 = 472.50$$
3. **Inclusive GST (e.g., 5% Tax included in Net 450.00):**
   $$\text{Patient Net Payable} = 450.00$$
   $$\text{Taxable Base} = \frac{\text{Net Amount}}{1 + \text{Tax Rate}} = \frac{450.00}{1.05} \approx 428.57$$
   $$\text{GST Component (Absorbed)} = 450.00 - 428.57 = 21.43$$

### B. Validation & Parity
- In both billing modules, line-item pricing and billing summaries calculate exact tax amounts according to the hospital's `BillingSettings` parameters (`IsGSTInclusive`).
- Test fixtures in Batch 3 and Batch 6 verify that balance amounts, discounts, and payment allocations balance to `0.00` upon cashier settlement.

---

## 4. LIS Acceptance & Diagnostics Verification Summary
- **Analyzer Integrations:** Real bidirectional ASTM/HL7 analyzer drivers remain designated for live on-site clinical commissioning. Simulated lab orders, accessioning, barcode generation, result entry, verification, and critical value flagging are 100% verified via automated and browser HTTP tests.
- **Role-Based Permissions & Isolation:** Unauthorized users and invalid tokens are rejected with HTTP 401. Multi-facility isolation prevents cross-facility sample reads or writes.
- **Duplicate Accession Prevention:** Handled idempotently at the database and service layer.

