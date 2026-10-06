# Phase 3 Migration Log: Full Source Rehearsal & Incremental Pilot Migration
**Date:** 2026-10-06  
**Phase:** 3 (Full-Source Migration & Final Reconciliation)  
**Target Environments:**
- Pilot Database: `hims_pilot_db` (Port 5432)
- Clean Rehearsal Database: `hims_recon_db` (Port 5432)

---

## 1. Migration Execution Overview

### Step 1: Pilot Database Restorable Backup
- Generated binary archive: `backups/hims_pilot_db_pre_phase3.dump` (48 MB).
- Database verified restorable via standard `pg_restore`.

### Step 2: Clean Rehearsal Migration (`hims_recon_db`)
- Created clean target database `hims_recon_db`.
- Successfully migrated all **554 Base Tables** and **8 Database Views** from scratch.
- Reconciled row counts: 1,682,399 rows migrated with **0 data loss** and **100% table match rate (554/554)**.

### Step 3: Incremental Remaining Migration (`hims_pilot_db`)
- Ingested all **189 remaining base tables** into `hims_pilot_db` without modifying existing 365 tables or corrupting pilot transaction logs.
- Added performance indexes on join keys: `idx_pbd_patientbillid`, `idx_pbd_encounterid`, `idx_pb_encounterid`, `idx_rv_codeid`, `idx_patients_patientid`.
- Reconciled sequences for all auto-incrementing serial columns.

---

## 2. Target Database Object Breakdown

| Target Database | Base Tables Migrated | Translated Views | Total Objects | Migration Mode |
|:----------------|:--------------------:|:----------------:|:-------------:|:---------------|
| `hims_recon_db` | 554 | 8 | 562 | Full Clean Rehearsal |
| `hims_pilot_db` | 554 | 9 | 563 | Cumulative Pilot + Target View (`bedtransfers`) |
