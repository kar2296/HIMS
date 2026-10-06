# Phase 3 Source Snapshot Analysis & Baseline
**Snapshot Timestamp:** 2026-10-06T10:25:00+05:30  
**Source Database:** MySQL 5.7.44-log (`test` on `:3307`)  
**Target Environment:** PostgreSQL 14 (`hims_pilot_db` & `hims_recon_db` on `:5432`)  
**Extraction Method:** Chunked Streaming / Multi-Row Transactions (`batchSize = 200`) with NUL byte sanitization and dialect mapping.

---

## 1. Source Database Object Baseline

| Object Category | Total Count | Total Records | Data Length | Reconciliation Status |
|-----------------|:-----------:|:-------------:|:-----------:|:---------------------:|
| **Source Base Tables** | **554** | **1,682,399** | 537.39 MB | 100% Migrated (554 / 554) |
| **Source Database Views** | **8** | Dynamic | N/A | 100% Translated (8 / 8) |
| **Total Source Objects** | **562** | **1,682,399** | 537.39 MB | **100% Reconciled (562 / 562)** |
| **Target Compatibility Views** | **1** (`bedtransfers`) | Dynamic | N/A | Active Target Compatibility |

---

## 2. Source Data Distribution & Key Table Volumes

- **Billing & Inpatient Finance:**
  - `patientbilldetails`: 135,092 records
  - `patientbills`: 45,517 records
  - `patientpaymentdetails`: 7,178 records
  - `patientrefund`: 42 records
  - `serviceitemtariffdetails`: 69,692 records
- **Inventory & Pharmacy:**
  - `stockitems`: 248,209 records
  - `stockserialmovements`: 109,998 records
  - `stockmovements`: 107,338 records
  - `patientstockrequestdetails`: 67,933 records
  - `patientdispensedetails`: 67,147 records
  - `itemstoremap`: 34,722 records
- **LIS & Diagnostic Interface:**
  - `lisinterfacepatientdetails`: 45,244 records
  - `lisinterfaceresults`: 45,244 records
  - `workordersampledetails`: 17,678 records
- **EMR, Clinical & Administrative:**
  - `pincodemasters`: 154,817 records
  - `loginsessions`: 64,010 records
  - `patientworkorderdetails`: 54,105 records
  - `entityprinthistory`: 27,311 records
  - `userbillingcounterdenominations`: 30,182 records

---

## 3. Consistency, Nontransactional Tables & Concurrent DDL Controls
1. **Sanitization of NUL Bytes:** Literal `\0` bytes occurring in legacy binary/text fields (such as `mytable`) were stripped during streaming to prevent PostgreSQL UTF-8 encoding rejections.
2. **Dialect Type Adaptation:**
   - `tinyint(1)` status columns in MySQL frequently hold integer status codes (`-1, 0, 1, 2, 3...`) and were mapped to `INTEGER` / `SMALLINT`.
   - `CHAR(0)` columns in `tally_purchase` / `tally_p_return` were mapped to `TEXT`.
   - Monetary columns were mapped to `NUMERIC(18,6)`.
