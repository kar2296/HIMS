# Phase 2 Batch 6 Migration Log: LIS & Diagnostics

## 1. Migration Overview
- **Execution Date:** 2026-10-06
- **Database Target:** `hims_pilot_db` (PostgreSQL 14)
- **Source Database:** `test` (MySQL 5.7 on port 3307)
- **Domain Scope:** Laboratory Information System (LIS), Pathology, Lab Test & Analyte Masters, Sample Collection & Accessioning, Work Order Generation, Result Entry, Pathologist Technical/Medical Validation, ASTM Machine Interface, and Diagnostic Report Generation.

---

## 2. Table Reconciliation & Row Count Summary

| Table Name | Source Rows (MySQL) | Target Rows (PostgreSQL) | Status | Key Parity Notes |
|:---|:---:|:---:|:---:|:---|
| `testmaster` | 1,321 | 1,321 | **MATCH** | 100% migrated |
| `analytemaster` | 4,373 | 4,373 | **MATCH** | 100% migrated |
| `analyterefmaster` | 442 | 442 | **MATCH** | 100% migrated |
| `sampletype` | 131 | 131 | **MATCH** | 100% migrated |
| `testmasteranalytemap` | 693 | 693 | **MATCH** | 100% migrated |
| `analyzeranalytemap` | 13 | 13 | **MATCH** | 100% migrated |
| `analysertestmaster` | 103 | 103 | **MATCH** | 100% migrated |
| `antibioticmaster` | 41 | 41 | **MATCH** | 100% migrated |
| `antibioticorganismmap` | 2,221 | 2,221 | **MATCH** | 100% migrated |
| `investigationsettings` | 7 | 7 | **MATCH** | 100% migrated |
| `workordersamples` | 6,611 | 6,611 | **MATCH** | 100% migrated |
| `workordersampledetails` | 17,678 | 17,678 | **MATCH** | 100% migrated |
| `patientworkorder` | 8,693 | 8,693 | **MATCH** | 100% migrated |
| `patientworkorderdetails` | 54,105 | 54,105 | **MATCH** | 100% migrated |
| `patientworkorderantibiotics` | 1,681 | 1,681 | **MATCH** | 100% migrated |
| `lisinterfacepatientdetails` | 45,244 | 45,244 | **MATCH** | 100% migrated |
| `lisinterfaceresults` | 45,244 | 45,244 | **MATCH** | 100% migrated |
| `testmasterbom` | 1 | 1 | **MATCH** | 100% migrated |
| `ordertat` | 13,130 | 13,130 | **MATCH** | 100% migrated |
| `resultstatus` | 6 | 6 | **MATCH** | 100% migrated |
| `hims_templateparameters` | 157 | 157 | **MATCH** | 100% migrated |
| `hims_templateparametervalues` | 724 | 724 | **MATCH** | 100% migrated |
| `organismisolation` | 58 | 58 | **MATCH** | 100% migrated |
| `workorderstatus` | 9 | 9 | **MATCH** | 100% migrated |
| `workorderobservations` | 82 | 82 | **MATCH** | 100% migrated |

---

## 3. Key Schema & Association Fixes
1. **Explicit ForeignKey Associations:**
   - In `PatientWorkorder.Model.ts`: Added explicit `foreignKey: 'Patientid'`, `foreignKey: 'Departmentid'`, and `foreignKey: 'WorkOrderStatusId'`.
2. **Column Casing Alignment:**
   - Standardized `ActiveFrom` / `ActiveTo` in `sampletype`.
   - Standardized `Workorderid`, `Orderid`, `Orderdetailid`, `Patientid`, `Encounterid`, `Orderedbyname`, `Approvedbyname`, `Ordereddate`, `Receiveddate`, and `Reporteddate` in `patientworkorder`.
3. **Sequences:**
   - Attached dedicated auto-increment sequences across primary keys in `workordersamples`, `workordersampledetails`, `patientworkorder`, `patientworkorderdetails`, and `lisinterfaceresults`.
