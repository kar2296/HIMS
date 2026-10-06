# Phase 2 Batch 5 Migration Log: Pharmacy, Stock & GRN Management

## 1. Migration Overview
- **Execution Date:** 2026-10-06
- **Database Target:** `hims_pilot_db` (PostgreSQL 14)
- **Source Database:** `test` (MySQL 5.7 on port 3307)
- **Domain Scope:** Pharmacy Procurement, Goods Receipt Note (GRN), Inventory Stock Tracking, Batch/Expiry Management, Ward Indents, Inter-Store Transfers, Physical Adjustments, and Patient Dispensing.

---

## 2. Table Reconciliation & Row Count Summary

| Table Name | Source Rows (MySQL) | Target Rows (PostgreSQL) | Status | Key Parity Notes |
|:---|:---:|:---:|:---:|:---|
| `vendorfacilitymap` | 452 | 452 | **MATCH** | 100% migrated |
| `itemsubcategory` | 15 | 15 | **MATCH** | 100% migrated |
| `itemsubtype` | 106 | 106 | **MATCH** | 100% migrated |
| `itemstoremap` | 34,722 | 34,722 | **MATCH** | 100% migrated |
| `itemfacilitymap` | 4,732 | 4,732 | **MATCH** | 100% migrated |
| `itemvendormap` | 4,980 | 4,980 | **MATCH** | 100% migrated |
| `purchaseorders` | 1,108 | 1,108 | **MATCH** | 100% migrated |
| `purchaseorderdetails` | 8,574 | 8,574 | **MATCH** | 100% migrated |
| `purchasereturns` | 27 | 27 | **MATCH** | 100% migrated |
| `purchasereturndetails` | 290 | 290 | **MATCH** | 100% migrated |
| `grns` | 1,253 | 1,253 | **MATCH** | 100% migrated |
| `grndetails` | 7,438 | 7,438 | **MATCH** | 100% migrated |
| `stockitems` | 248,209 | 248,209 | **MATCH** | Preserved existing pilot rows |
| `stockserialitems` | 13,510 | 13,510 | **MATCH** | Preserved existing pilot rows |
| `stockmovements` | 107,338 | 107,338 | **MATCH** | 100% migrated |
| `stockserialmovements` | 109,998 | 109,998 | **MATCH** | 100% migrated |
| `stockadjustments` | 4 | 4 | **MATCH** | 100% migrated |
| `stockadjustmentdetails` | 4 | 4 | **MATCH** | 100% migrated |
| `stockconsumptions` | 258 | 258 | **MATCH** | 100% migrated |
| `stockconsumptiondetails` | 717 | 717 | **MATCH** | 100% migrated |
| `stocktransfers` | 1,460 | 1,460 | **MATCH** | 100% migrated |
| `stocktransferdetails` | 6,997 | 6,997 | **MATCH** | 100% migrated |
| `stockrequests` | 1,353 | 1,353 | **MATCH** | 100% migrated |
| `stockrequestdetails` | 6,102 | 6,102 | **MATCH** | 100% migrated |
| `storeusermap` | 181 | 181 | **MATCH** | 100% migrated |
| `patientdispenses` | 11,458 | 11,458 | **MATCH** | 100% migrated |
| `patientdispensedetails` | 67,147 | 67,147 | **MATCH** | Preserved existing pilot rows |
| `patientdispensereturns` | 1,111 | 1,111 | **MATCH** | 100% migrated |
| `patientdispensereturndetails` | 5,429 | 5,429 | **MATCH** | Preserved existing pilot rows |

---

## 3. Key Schema & Model Alignments
1. **Explicit ForeignKey Associations:**
   - Added explicit `foreignKey` properties in Sequelize associations for `PurchaseOrder.hasMany(PurchaseOrderDetail, { foreignKey: 'PurchaseOrderId' })`, `Grn.hasMany(GrnDetail, { foreignKey: 'GrnId' })`, `StockTransfer.hasMany(StockTransferDetail, { foreignKey: 'StockTransferId' })`, `StockRequest.hasMany(StockRequestDetail, { foreignKey: 'StockRequestId' })`, and `StockConsumption.hasMany(StockConsumptionDetail, { foreignKey: 'StockConsumptionId' })`.
2. **Column Casing Alignments:**
   - Standardized `"ToFacilityId"` in `stockrequests` and `"BarCodeId"` in `stockconsumptiondetails`.
3. **Sequence Configuration:**
   - Created and attached dedicated PostgreSQL sequence generators (`nextval`) for primary keys on all migrated inventory transaction tables.
