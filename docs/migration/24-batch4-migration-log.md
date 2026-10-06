# Phase 2 Batch 4: IP Management & Bed Allocation Migration Log

## 1. Domain Overview
- **Domain:** Inpatient Management, Patient Admission, Bed Allocation, Ward/Bed Transfers, Housekeeping Statuses, Inpatient Discharge Events, and MRD File Movements.
- **Source Database:** MySQL 8.x (`localhost:3307`, DB: `test`)
- **Target Database:** PostgreSQL 14 (`localhost:5432`, DB: `hims_pilot_db`)
- **API Runtime:** Node.js/Express on `http://localhost:2014`
- **UI Runtime:** React 19 / Vite on `http://localhost:5175`

---

## 2. Migrated Schema & Data Volume Reconciliation

| Table Name | MySQL Rows | PostgreSQL Rows | Migration Status | DDL / Dialect Notes |
|---|---|---|---|---|
| `bedtransfer` | 306 | 306 | **MATCH** | Aliased view `bedtransfers` created; Primary Key `AdmissionTransferId` sequence mapped |
| `bedoccupancyhistory` | 1,403 | 1,403 | **MATCH** | Casing normalized for `ServiceRateCategoryId`; TIMESTAMPTZ timestamps |
| `bedhousekeeping` | 16 | 16 | **MATCH** | Explicit `TransactionId` column added; Housekeeping workflow status mapped |
| `bedtransportation` | 4 | 4 | **MATCH** | Patient internal porterage/transportation records |
| `patientadmissionlog` | 5,526 | 5,526 | **MATCH** | Historical audit trail of admission transitions |
| `patientdischargeevent` | 1,051 | 1,051 | **MATCH** | Discharge orders, clinical clearances and departure timestamps |
| `dietitemmaster` | 71 | 71 | **MATCH** | Nutritional and diet item masters |
| `patientdietorders` | 8 | 8 | **MATCH** | Inpatient diet prescription orders |
| `patientdietorderdetails` | 12 | 12 | **MATCH** | Diet item details |
| `mrdfilerequests` | 2,055 | 2,055 | **MATCH** | Medical Records Department file tracking requests |
| `mrdfilelocation` | 1,842 | 1,842 | **MATCH** | MRD shelf/rack physical archive location index |
| `mrdipfiles` | 67 | 67 | **MATCH** | Inpatient paper case-sheet file bindings |
| `hims_ipclearence` | 6,708 | 6,708 | **MATCH** | Departmental discharge clearances (Pharmacy, Nursing, Billing) |
| `encounterippackages` | 1,002 | 1,002 | **MATCH** | Inpatient surgical package allocations |
| `encounterippackagedetails` | 14,357 | 14,357 | **MATCH** | Package breakdown line details |
| `encounterippackageserviceexclusions` | 1,378 | 1,378 | **MATCH** | Non-package chargeable service exclusions |
| `encounterippackageserviceinclusions` | 11,356 | 11,356 | **MATCH** | Package covered service inclusions |
| `ippackages` | 348 | 348 | **MATCH** | Inpatient procedure package masters |
| `ippackagetariffdetails` | 6,529 | 6,529 | **MATCH** | Package room-category rate matrices |
| `wardroomservicemap` | 46 | 46 | **MATCH** | Room-to-service default charge mappings |
| `wardusermap` | 12 | 12 | **MATCH** | Nurse/staff ward station access controls |
| `wardinsurancetariff` | 94 | 94 | **MATCH** | TPA / Insurance specific ward tariff slabs |
| `patientstockrequests` | 11,208 | 11,208 | **MATCH** | Ward-to-Pharmacy stock indents |
| `patientstockrequestdetails` | 67,933 | 67,933 | **MATCH** | Ward indent line item details |
| `patientstockreturns` | 1,124 | 1,124 | **MATCH** | Ward medicine/consumable return vouchers |
| `patientstockreturndetails` | 5,580 | 5,580 | **MATCH** | Itemized return lines |
| `encounterguarantors` | 3,625 | 3,625 | **MATCH** | Inpatient insurance guarantor bindings |
| `encounterdoctors` | 4,026 | 4,026 | **MATCH** | Inpatient attending / consulting doctors |
| `specialities` | 0 | 0 | **MATCH** | Doctor specialty taxonomy table |
| `locationmaster` | 8 | 8 | **MATCH** | Campus hospital physical block/building locations |
| `procedures` | 5,471 | 5,471 | **MATCH** | Surgical & clinical procedure catalog |
| `b2bcustomermaster` | 0 | 0 | **MATCH** | Corporate / institutional billing accounts |

---

## 3. Dialect Adaptations & PostgreSQL Schema Fixes

1. **Sequelize Alias Pluralization vs Singular Table Names:**
   - The MySQL table is named `bedtransfer`, while certain Sequelize includes query `bedtransfers`. Created a PostgreSQL view `CREATE OR REPLACE VIEW "bedtransfers" AS SELECT * FROM "bedtransfer"` to ensure dual-compatibility across legacy and modern services.

2. **Column Casing Alignment:**
   - In `bedoccupancyhistory`, adjusted `ServiceRatecategoryId` to `ServiceRateCategoryId` to strictly match Sequelize model attribute mapping.
   - In `bedhousekeeping`, added `TransactionId` column to support housekeeping workflow audit logging.
