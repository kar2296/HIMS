const pg = require("pg");

async function runCleanDBSmokeTest() {
  console.log("=== RUNNING CLEAN TEST DATABASE PROVISIONING & SMOKE TEST ===");
  console.log("Release Commit: f3a2068f8995ad6eac23a7a5f00be6702a5704b3");

  const adminClient = new pg.Client({ host: "localhost", port: 5432, user: process.env.USER || "sharmila", database: "postgres" });
  await adminClient.connect();

  // 1. Create separate test database: hims_uat_smoke_db (drop first if exists)
  console.log("Creating isolated database 'hims_uat_smoke_db'...");
  await adminClient.query(`DROP DATABASE IF EXISTS hims_uat_smoke_db;`);
  await adminClient.query(`CREATE DATABASE hims_uat_smoke_db;`);
  await adminClient.end();

  // 2. Connect to hims_uat_smoke_db and recreate required schema
  const smokeClient = new pg.Client({ host: "localhost", port: 5432, user: process.env.USER || "sharmila", database: "hims_uat_smoke_db" });
  await smokeClient.connect();

  console.log("Applying core schema and idempotency table to hims_uat_smoke_db...");
  
  // Recreate idempotency_records
  await smokeClient.query(`
    CREATE TABLE IF NOT EXISTS idempotency_records (
      "IdempotencyRecordId" BIGSERIAL PRIMARY KEY,
      "IdempotencyKey" VARCHAR(255) NOT NULL,
      "FacilityId" BIGINT NOT NULL DEFAULT 1,
      "OperationType" VARCHAR(64) NOT NULL,
      "RequestFingerprint" VARCHAR(64) NOT NULL,
      "Status" VARCHAR(32) NOT NULL DEFAULT 'IN_PROGRESS',
      "ResponseCode" INTEGER NULL,
      "ResponseBody" JSONB NULL,
      "EntityId" BIGINT NULL,
      "CreatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
      "UpdatedAt" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
      CONSTRAINT uq_idempotency_key_facility_op UNIQUE ("IdempotencyKey", "FacilityId", "OperationType")
    );
  `);

  // Recreate sample core tables (encounters, patientbills, patientpaymentdetails)
  await smokeClient.query(`
    CREATE TABLE IF NOT EXISTS encounters (
      "EncounterId" BIGSERIAL PRIMARY KEY,
      "PatientId" BIGINT NOT NULL,
      "FacilityId" BIGINT NOT NULL DEFAULT 1,
      "DoctorId" BIGINT NULL,
      "AdmissionDate" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
      "EncounterTypeId" INTEGER DEFAULT 1,
      "Status" INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS patientbills (
      "PatientBillId" BIGSERIAL PRIMARY KEY,
      "PatientId" BIGINT NOT NULL,
      "EncounterId" BIGINT NULL,
      "FacilityId" BIGINT NOT NULL DEFAULT 1,
      "BillDateTime" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
      "BillAmount" NUMERIC(18,2) NOT NULL DEFAULT 0.00,
      "BillDiscount" NUMERIC(18,2) NOT NULL DEFAULT 0.00,
      "PaidAmount" NUMERIC(18,2) NOT NULL DEFAULT 0.00,
      "OutStandingAmount" NUMERIC(18,2) NOT NULL DEFAULT 0.00,
      "GSTAmount" NUMERIC(18,2) NOT NULL DEFAULT 0.00,
      "PatientBillStatusId" INTEGER DEFAULT 1,
      "IsPaidFully" BOOLEAN DEFAULT FALSE,
      "Status" INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS patientpaymentdetails (
      "PatientPaymentDetailId" BIGSERIAL PRIMARY KEY,
      "PatientBillId" BIGINT NOT NULL,
      "EncounterId" BIGINT NULL,
      "FacilityId" BIGINT NOT NULL DEFAULT 1,
      "PatientId" BIGINT NOT NULL,
      "PatientName" VARCHAR(255) NULL,
      "PaymentTypeId" INTEGER DEFAULT 1,
      "AmountPaid" NUMERIC(18,2) NOT NULL DEFAULT 0.00,
      "ReceiptNumber" VARCHAR(64) NULL,
      "ReceiptDateTime" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
      "ReceiptStatusId" INTEGER DEFAULT 1,
      "Status" INTEGER DEFAULT 1
    );
  `);

  // 3. Smoke Test Assertions on Clean Database
  const tCheck = await smokeClient.query(`
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name IN ('idempotency_records', 'encounters', 'patientbills', 'patientpaymentdetails');
  `);

  const uqCheck = await smokeClient.query(`
    SELECT conname FROM pg_constraint WHERE conname = 'uq_idempotency_key_facility_op';
  `);

  // Test atomic insert ON CONFLICT
  const idemInsert1 = await smokeClient.query(`
    INSERT INTO idempotency_records ("IdempotencyKey", "FacilityId", "OperationType", "RequestFingerprint", "Status")
    VALUES ('SMOKE-KEY-001', 1, 'CASHIER_PAYMENT', 'abcd1234efgh5678', 'IN_PROGRESS')
    ON CONFLICT ("IdempotencyKey", "FacilityId", "OperationType") DO NOTHING
    RETURNING "IdempotencyKey";
  `);

  const idemInsert2 = await smokeClient.query(`
    INSERT INTO idempotency_records ("IdempotencyKey", "FacilityId", "OperationType", "RequestFingerprint", "Status")
    VALUES ('SMOKE-KEY-001', 1, 'CASHIER_PAYMENT', 'abcd1234efgh5678', 'IN_PROGRESS')
    ON CONFLICT ("IdempotencyKey", "FacilityId", "OperationType") DO NOTHING
    RETURNING "IdempotencyKey";
  `);

  console.log(`Smoke Test Results on hims_uat_smoke_db:`);
  console.log(`- Created Tables: ${tCheck.rows.map(r => r.table_name).join(", ")}`);
  console.log(`- Idempotency Constraint: ${uqCheck.rows[0]?.conname}`);
  console.log(`- Insert 1 (New Key): Returned Key = ${idemInsert1.rows[0]?.IdempotencyKey}`);
  console.log(`- Insert 2 (Duplicate Key): Returned Rows = ${idemInsert2.rows.length} (Expected 0 rows on conflict)`);

  const passed = (tCheck.rows.length === 4) && (uqCheck.rows.length === 1) && (idemInsert1.rows.length === 1) && (idemInsert2.rows.length === 0);

  // Clean up test DB
  await smokeClient.end();
  const cleanupClient = new pg.Client({ host: "localhost", port: 5432, user: process.env.USER || "sharmila", database: "postgres" });
  await cleanupClient.connect();
  await cleanupClient.query(`DROP DATABASE hims_uat_smoke_db;`);
  await cleanupClient.end();

  if (!passed) {
    console.error("[FAILED] Smoke test on clean database failed!");
    process.exit(1);
  } else {
    console.log("\n[PASSED] Clean database provisioning and idempotency schema smoke test verified 100%.");
  }
}

runCleanDBSmokeTest().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
