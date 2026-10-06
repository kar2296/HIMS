# Batch 10 Migration Log: MIS Reports, Financial Ledger / Tally Export & System Administration
**Date:** 2026-10-06  
**Phase:** 2 (Batch 10)  
**Target Database:** PostgreSQL 14 (`hims_pilot_db`) on Port 5432  
**Source Database:** MySQL 5.7 (`test`) on Port 3307  

---

## 1. Migrated Base Tables & Views

### A. Base Tables Migrated in Batch 10 (17 Base Tables)
| Table Name | Source Rows | Target Rows | Primary Key / Indexing | Migration Status |
|------------|-------------|-------------|------------------------|------------------|
| `mis_collection` | 73 | 73 | `PRIMARY KEY ("Id")` | Reconciled & Data Loaded |
| `mis_departmentrevenue` | 127 | 127 | `SERIAL` added | Reconciled & Data Loaded |
| `mis_doctorwisestatsrevenue` | 133 | 133 | `SERIAL` added | Reconciled & Data Loaded |
| `mis_occupancy` | 25 | 25 | `PRIMARY KEY ("Id")` | Reconciled & Data Loaded |
| `mis_revenue` | 47 | 47 | `PRIMARY KEY ("Id")` | Reconciled & Data Loaded |
| `mis_statistics` | 96 | 96 | `PRIMARY KEY ("Id")` | Reconciled & Data Loaded |
| `mis_categoryrevenue` | 0 | 0 | Schema Created | Reconciled Empty (0 rows) |
| `tally_collection` | 0 | 0 | Schema Created | Reconciled Empty (0 rows) |
| `tally_p_return` | 0 | 0 | Schema Created | Reconciled Empty (0 rows) |
| `tally_purchase` | 0 | 0 | Schema Created | Reconciled Empty (0 rows) |
| `tally_sale` | 0 | 0 | Schema Created | Reconciled Empty (0 rows) |
| `tally_sale_ret` | 0 | 0 | Schema Created | Reconciled Empty (0 rows) |
| `rolemobileconfigmap` | 34 | 34 | `PRIMARY KEY ("RoleId", "MobileConfigId")` | Reconciled & Data Loaded |
| `userdefaultservices` | 13 | 13 | `PRIMARY KEY ("UserDefaultServiceId")` | Reconciled & Data Loaded |
| `userspecialitymap` | 0 | 0 | Schema Created | Reconciled Empty (0 rows) |
| `usertaxdetails` | 0 | 0 | Schema Created | Reconciled Empty (0 rows) |
| `integrationevents` | 934 | 934 | `PRIMARY KEY ("IntegrationEventId")` | Reconciled & Data Loaded |

### B. Translated PostgreSQL Database Views (8 Source Views + 1 Target View)
1. `tally_collection_view`: Reconciled against `tally_collection`.
2. `tally_p_return_view`: Date cast handling and text columns mapped.
3. `tally_purchase_view`: Reconciled purchase export view.
4. `tally_sale_ret_view`: Case-mapped bill types for credit notes.
5. `tally_sale_view`: Numeric difference cast `("BillAmount" - "BillDiscount")`.
6. `ippatientbilldetails`: Inpatient billing view mapping `encounters`, `wardmaster`, `patientbills`, `patientbilldetails`, `servicecategories`, `guarantors`.
7. `opandippaymentdetails`: Cashier receipt aggregation mapping `patientpaymentdetails`, `patientbills`, `encounters`, `facilities`, `referencevalues`.
8. `opandiprefunddetails`: Refund ledger view mapping `patientrefund`, `patientbills`, `encounters`, `patients`, `facilities`, `referencevalues`.
9. `bedtransfers` (Target view for legacy bedtransfer mapping).

---

## 2. PostgreSQL Dialect Adaptations & Schema Fixes
1. **`CHAR(0)` Handling:** MySQL tables `tally_purchase` and `tally_p_return` declared several columns as `CHAR(0)`. In PostgreSQL, `CHAR(n)` requires $n \ge 1$; these columns were successfully mapped to `TEXT`.
2. **Missing Foreign Key Indexes:** Created composite and single-column indexes on `patientbilldetails("PatientBillId")`, `patientbilldetails("EncounterId")`, `patientbills("EncounterId")`, `patientbills("PatientId")`, and `patientpaymentdetails("PatientBillId")`, resolving query latency on views.
3. **Sequence Alignment:** All serial primary keys (`userdefaultservices_UserDefaultServiceId_seq`, `integrationevents_IntegrationEventId_seq`) were set to `MAX(id) + 1`.
