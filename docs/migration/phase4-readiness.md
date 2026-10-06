# Phase 4 Production Readiness, Cutover Runbook & Operational Governance Plan
**Date:** 2026-10-06  
**Status:** **READY FOR STAKEHOLDER REVIEW & SCHEDULED CUTOVER WINDOW**  
**Target PostgreSQL Version:** PostgreSQL 14.x / 15.x / 16.x (x86_64 / arm64)  
**Strict Policy:** No premature production cutover. Source MySQL stack on `:3307`, `:2012`, `:5174` remains operational and primary until scheduled maintenance window.

---

## 1. Supported PostgreSQL Target Specification

- **Database Engine:** PostgreSQL 14 (or 15/16) with standard `plpgsql` and `btree_gist` extensions.
- **Character Set & Collation:** `UTF-8` encoding with `C` or `en_US.UTF-8` collation.
- **Server Parameter Recommendations:**
  - `shared_buffers = 2GB` (25% of total system RAM)
  - `work_mem = 64MB`
  - `maintenance_work_mem = 512MB`
  - `effective_cache_size = 6GB`
  - `checkpoint_completion_target = 0.9`
  - `wal_buffers = 16MB`
  - `default_statistics_target = 100`

---

## 2. Production Cutover Window Runbook (Scheduled Maintenance)

### Step 1: Pre-Cutover Final Write Freeze ($T - 60 \text{ min}$)
1. Set source MySQL database to read-only mode:
   ```sql
   SET GLOBAL read_only = ON;
   FLUSH TABLES WITH READ LOCK;
   ```
2. Stop source API listeners to prevent inbound web traffic.
3. Capture final consistent source snapshot and checksum manifest:
   ```bash
   mysqldump -h localhost -P 3307 -u root -p --single-transaction --routines --triggers test > final_source_snapshot.sql
   ```

### Step 2: Final Delta Migration & Sequence Sync ($T - 30 \text{ min}$)
1. Execute versioned migration engine (`fast_phase3_migration.cjs`) to ingest delta records into production PostgreSQL database.
2. Synchronize all sequences:
   ```sql
   SELECT setval(pg_get_serial_sequence('"patients"', 'PatientId'), MAX("PatientId") + 1, false) FROM patients;
   SELECT setval(pg_get_serial_sequence('"patientbills"', 'PatientBillId'), MAX("PatientBillId") + 1, false) FROM patientbills;
   ```
3. Run schema & count verification audit (`generate_phase3_reconciliation.cjs`).

### Step 3: Production Service Cutover ($T - 10 \text{ min}$)
1. Update API `.env` with production PostgreSQL connection credentials (`DB_HOST`, `DB_PORT=5432`, `DB_NAME=hims_prod_db`, `DIALECT=postgres`).
2. Start production API listeners under PM2 / systemd process management.
3. Verify Redis connection with clean namespace.

### Step 4: Smoke Testing ($T - 5 \text{ min}$)
1. Run automated smoke test suite (`test_phase4_security.cjs`, `test_phase3.cjs`).
2. Verify front desk registration, doctor consultation workspace, and cashier POS receipt generation.

### Step 5: Cutover Sign-off & DNS Switch ($T = 0$)
1. Switch load balancer / reverse proxy routing (Nginx/HAProxy) to PostgreSQL-backed API instances.
2. Open hospital front-end portal to end users.

---

## 3. Rollback Runbook & Contingency Ownership

If a critical P1 blocker occurs during the cutover window:
1. **Rollback Decision Trigger:** Any unrecoverable transaction failure or financial ledger mismatch.
2. **Rollback Procedure:**
   - Terminate PostgreSQL API listeners.
   - Switch reverse proxy back to MySQL API instance (`:2012`).
   - Disable MySQL read-only mode (`SET GLOBAL read_only = OFF;`).
   - Notify hospital clinical and operational coordinators.
3. **Data Recovery Ownership:**
   - Database Administrator (DBA): Responsible for binary snapshots and sequence verification.
   - Clinical Applications Lead: Responsible for verifying patient record integrity.
   - Financial Controller: Responsible for cashier ledger and reconciliation verification.
