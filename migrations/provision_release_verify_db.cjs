const mysql = require("mysql2/promise");
const pg = require("pg");

function mapMysqlTypeToPg(col) {
  const type = col.Type.toLowerCase();
  const isAuto = col.Extra && col.Extra.toLowerCase().includes("auto_increment");
  const isPk = col.Key === "PRI";

  if (isPk && isAuto) {
    if (type.includes("bigint")) return "BIGSERIAL PRIMARY KEY";
    return "SERIAL PRIMARY KEY";
  }

  if (type.includes("char(0)")) return "TEXT";
  if (type.startsWith("bigint")) return "BIGINT";
  if (type.startsWith("int") || type.startsWith("mediumint") || type.startsWith("smallint") || type.startsWith("tinyint")) return "INTEGER";
  if (type.startsWith("varchar") || type.startsWith("char")) return col.Type.toUpperCase();
  if (type.includes("text") || type.includes("blob") || type.includes("json")) return "TEXT";
  if (type.includes("decimal") || type.includes("numeric") || type.includes("double") || type.includes("float")) return "NUMERIC(18,6)";
  if (type.includes("datetime") || type.includes("timestamp")) return "TIMESTAMP WITHOUT TIME ZONE";
  if (type.includes("date")) return "DATE";
  if (type.includes("time")) return "TIME WITHOUT TIME ZONE";

  return "TEXT";
}

function sanitizeValue(val) {
  if (val === null || val === undefined) return null;
  if (typeof val === "string") {
    return val.replace(/\0/g, "");
  }
  if (Buffer.isBuffer(val)) {
    return val.toString("utf8").replace(/\0/g, "");
  }
  return val;
}

async function runProvisioning() {
  const targetDbName = "hims_release_verify_db";
  console.log(`=== FULL PROVISIONING OF RELEASE VERIFICATION DATABASE: ${targetDbName} ===\n`);

  // 1. Create DB
  const adminClient = new pg.Client({ host: "localhost", port: 5432, user: process.env.USER || "sharmila", database: "postgres" });
  await adminClient.connect();
  await adminClient.query(`DROP DATABASE IF EXISTS ${targetDbName};`);
  await adminClient.query(`CREATE DATABASE ${targetDbName};`);
  await adminClient.end();
  console.log(`Created clean database: ${targetDbName}`);

  // 2. Connect
  const mConn = await mysql.createConnection({ host: "localhost", port: 3307, user: "root", password: "root", database: "test" });
  const pClient = new pg.Client({ host: "localhost", port: 5432, user: process.env.USER || "sharmila", database: targetDbName });
  await pClient.connect();

  const [mTables] = await mConn.query("SELECT TABLE_NAME FROM information_schema.tables WHERE TABLE_SCHEMA = 'test' AND TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME");
  console.log(`Source MySQL base tables count: ${mTables.length}`);

  let migratedCount = 0;
  let errorCount = 0;

  for (const tRow of mTables) {
    const t = tRow.TABLE_NAME;
    try {
      const [cols] = await mConn.query(`SHOW COLUMNS FROM \`${t}\``);
      const colDefs = cols.map(c => {
        const pgType = mapMysqlTypeToPg(c);
        return `"${c.Field}" ${pgType}`;
      });

      const createSql = `CREATE TABLE IF NOT EXISTS "${t}" (\n  ${colDefs.join(",\n  ")}\n);`;
      await pClient.query(createSql);

      const [rows] = await mConn.query(`SELECT * FROM \`${t}\``);
      if (rows.length > 0) {
        const colNames = Object.keys(rows[0]);
        const colList = colNames.map(c => `"${c}"`).join(", ");
        const numCols = colNames.length;

        const batchSize = 200;
        for (let i = 0; i < rows.length; i += batchSize) {
          const batch = rows.slice(i, i + batchSize);
          const valuePlaceholders = [];
          const flatValues = [];

          batch.forEach((row, rIdx) => {
            const rowPlaceholders = [];
            for (let cIdx = 0; cIdx < numCols; cIdx++) {
              const paramIdx = (rIdx * numCols) + cIdx + 1;
              rowPlaceholders.push(`$${paramIdx}`);
              flatValues.push(sanitizeValue(row[colNames[cIdx]]));
            }
            valuePlaceholders.push(`(${rowPlaceholders.join(", ")})`);
          });

          const batchInsertSql = `INSERT INTO "${t}" (${colList}) VALUES ${valuePlaceholders.join(", ")} ON CONFLICT DO NOTHING;`;
          await pClient.query(batchInsertSql, flatValues);
        }

        const pkCol = cols.find(c => c.Key === "PRI");
        if (pkCol) {
          try {
            const seqRes = await pClient.query(`SELECT pg_get_serial_sequence('"${t}"', '${pkCol.Field}') as seq;`);
            const seqName = seqRes.rows[0]?.seq;
            if (seqName) {
              await pClient.query(`SELECT setval('${seqName}', COALESCE((SELECT MAX("${pkCol.Field}") FROM "${t}"), 0) + 1, false);`);
            }
          } catch (e) {}
        }
      }
      migratedCount++;
    } catch (err) {
      errorCount++;
      console.error(`ERROR migrating ${t}:`, err.message);
    }
  }

  console.log(`Base tables migration completed: ${migratedCount} migrated, ${errorCount} errors.`);

  // 3. Create 8 Views
  console.log("Creating 8 translated views...");
  const viewSqls = [
    `CREATE OR REPLACE VIEW tally_collection_view AS
     SELECT "ReceiptDateTime", "primary_key", "ReceiptNumber", "FacilityId", "FacilityName",
            "OrganizationId", "PatientId", "PatientName", "PaymentTypeId", "Description",
            "AuthorizedCode", "PatientBillId", "AmountPaid", "billnumber", "StoreMasterId",
            "StoreName", "BillAmount", "BillDiscount", "encountertypeid", "Type",
            "CARD_APPROVALNO", "TERMINAL_NO", "UPI_NO"
     FROM "tally_collection";`,

    `CREATE OR REPLACE VIEW tally_p_return_view AS
     SELECT "types", "FacilityId", "OrganisationId", "grnid", "GRNDate", "GrnNumber",
            CASE WHEN "InvoiceDate"::text = '' THEN "GRNDate" ELSE NULL END AS "InvoiceDate",
            CASE WHEN "InvoiceNumber"::text = '' THEN "GrnNumber" ELSE "InvoiceNumber" END AS "InvoiceNumber",
            "StoreMasterId", "storename", "VendorMasterId", "VendorName", "GSTNo",
            "PurchaseOrderId", "PoNumber", "PoDate", "AddressLine1", "AddressLine2", "AddressLine3",
            "GrnTypeId", "TotalGrossAmount", "gst_grossamount", "TotalDiscountAmount", "DiscountAmount",
            "TotalNetAmount", "OtherCharges", "TotalInvoiceAmount", "GstPercentage", "gst_sum",
            "cgst_percen", "cgst_sum", "sgst_percen", "sgst_sum", "Comments", "ADD_VALUE1", "ADD_VALUE2",
            "LESS_VALUE1", "LESS_VALUE2", "NARRATION", "IS_UPLOADED", "APPROVED_STATUS"
     FROM "tally_p_return";`,

    `CREATE OR REPLACE VIEW tally_purchase_view AS
     SELECT "types", "FacilityId", "OrganisationId", "grnid", "GRNDate", "GrnNumber",
            "InvoiceDate", "InvoiceNumber", "StoreMasterId", "storename", "VendorMasterId",
            "VendorName", "GSTNo", "PurchaseOrderId", "PoNumber", "PoDate", "AddressLine1",
            "AddressLine2", "AddressLine3", "GrnTypeId", "TotalGrossAmount", "gst_grossamount",
            "TotalDiscountAmount", "DiscountAmount", "TotalNetAmount", "OtherCharges",
            "TotalInvoiceAmount", "GstPercentage", "gst_sum", "cgst_percen", "cgst_sum",
            "sgst_percen", "sgst_sum", "Comments", "ADD_VALUE1", "ADD_VALUE2", "LESS_VALUE1",
            "LESS_VALUE2", "NARRATION", "IS_UPLOADED", "APPROVED_STATUS"
     FROM "tally_purchase";`,

    `CREATE OR REPLACE VIEW tally_sale_ret_view AS
     SELECT "types", "OrganizationId", "facilityid", "PatientBillId", "BillNumber", "BillDateTime",
            "GuarantorName",
            CASE WHEN "billtypeid"::text IN ('1', '4', '6') THEN 4::bigint ELSE 0::bigint END AS "billtypeid",
            "billtype", "PatientMrn", "PatientName", "TitleId", "title", "StoreMasterId",
            "StoreName", "EncounterId", "encountertype", "BillAmount", "BillDiscount", "PaidAmount",
            "OutStandingAmount", "GSTPercentage", "pd_gross_amount", "pd_gst_amount", "pd_cgst_per",
            "pd_cgst_amount", "pd_sgst_per", "pd_sgst_amount", "pd_ingst_per", "pd_ingst_amount"
     FROM "tally_sale_ret";`,

    `CREATE OR REPLACE VIEW tally_sale_view AS
     SELECT "types", "OrganizationId", "facilityid", "PatientBillId", "BillNumber", "BillDateTime",
            "GuarantorName", "billtypeid", "billtype", "PatientMrn", "PatientName", "TitleId", "title",
            "StoreMasterId", "StoreName", "EncounterId", "encountertype",
            (COALESCE(NULLIF("BillAmount"::text, '')::numeric, 0) - COALESCE(NULLIF("BillDiscount"::text, '')::numeric, 0)) AS "BillAmount",
            "BillDiscount", "PaidAmount", "OutStandingAmount", "GSTPercentage", "pd_gross_amount",
            "pd_gst_amount", "pd_cgst_per", "pd_cgst_amount", "pd_sgst_per", "pd_sgst_amount",
            "pd_ingst_per", "pd_ingst_amount"
     FROM "tally_sale";`,

    `CREATE OR REPLACE VIEW ippatientbilldetails AS
     SELECT e."EncounterId", e."AdmissionDate", e."DischargeDate", e."EncounterTypeId", e."AdmissionStatusId",
            TO_CHAR(e."DischargeDate", 'YYYY-MM') AS "DisMonth",
            e."EncounterId"::text AS "IPNumber", p."MRN" AS "PHID",
            b."BillNumber" AS "DischargeBillNumber",
            p."FirstName" || ' ' || COALESCE(p."LastName", '') AS "PatientName",
            u."FirstName" || ' ' || COALESCE(u."LastName", '') AS "DoctorName",
            d."DepartmentName",
            u."FirstName" || ' ' || COALESCE(u."LastName", '') AS "TreatingDoctorName",
            g."GuarantorName",
            rv."Description" AS "GuarantorType",
            w."WardName",
            b."PatientBillId" AS "HeaderBillId", b."BillTypeId" AS "HeaderBillTypeId",
            bd."PatientBillDetailId" AS "HeaderDetailBillId", bd."PatientBillId" AS "HeaderDetailBillTypeId",
            b."BillNumber" AS "DischargeDetailBillNumber",
            b."PatientBillStatusId" AS "HeaderDetailPatientBillStatusId",
            bd."ServiceId", bd."ServiceName", bd."GrossAmount", bd."DiscountAmount", bd."NetAmount",
            bd."Status" AS "DetailPatientBillStatusId",
            bd."ServiceCategoryId", 0::bigint AS "SurgeryEntryId",
            sc."ServiceCategoryName" AS "ServiceCategoryName",
            b."PatientBillStatusId",
            bd."Rev", bd."CreatedBy", bd."CreatedAt", bd."UpdatedBy", bd."UpdatedAt"
     FROM "patientbills" b
     LEFT JOIN "encounters" e ON b."EncounterId" = e."EncounterId"
     LEFT JOIN "patients" p ON b."PatientId" = p."PatientId"
     LEFT JOIN "patientbilldetails" bd ON b."PatientBillId" = bd."PatientBillId"
     LEFT JOIN "users" u ON e."DoctorId" = u."UserId"
     LEFT JOIN "departments" d ON e."DepartmentId" = d."DepartmentId"
     LEFT JOIN "wardmaster" w ON e."WardId" = w."WardId"
     LEFT JOIN "servicecategories" sc ON bd."ServiceCategoryId" = sc."ServiceCategoryId"
     LEFT JOIN "encounterguarantors" eg ON e."EncounterId" = eg."EncounterId"
     LEFT JOIN "guarantors" g ON eg."GuarantorId" = g."GuarantorId"
     LEFT JOIN "referencevalues" rv ON g."GuarantorTypeId" = rv."ReferenceValueCodeId";`,

    `CREATE OR REPLACE VIEW opandippaymentdetails AS
     SELECT pd."ReceiptDateTime", pd."ReceiptNumber", pd."FacilityId",
            f."FacilityName", 1::bigint AS "OrganizationId",
            pd."PatientId", pd."PatientName", pd."PaymentTypeId",
            rv."Description" AS "PaymentType",
            pd."PatientBillId", pd."AmountPaid",
            b."BillNumber", b."BillAmount",
            0::numeric AS "DiscountModeValue",
            e."EncounterTypeId",
            rv2."Description" AS "EncounterType",
            pd."BankId", NULL::text AS "Bank",
            pd."CardTypeId", NULL::text AS "CardType",
            pd."TerminalNoId", NULL::text AS "TerminalNo",
            pd."AuthorizedCode", pd."UPIRefNumber",
            1::bigint AS "ReceiptTypeId", 'Standard'::text AS "ReceiptType"
     FROM "patientpaymentdetails" pd
     LEFT JOIN "patientbills" b ON pd."PatientBillId" = b."PatientBillId"
     LEFT JOIN "encounters" e ON pd."EncounterId" = e."EncounterId"
     LEFT JOIN "facilities" f ON pd."FacilityId" = f."FacilityId"
     LEFT JOIN "referencevalues" rv ON pd."PaymentTypeId" = rv."ReferenceValueCodeId"
     LEFT JOIN "referencevalues" rv2 ON e."EncounterTypeId" = rv2."ReferenceValueCodeId";`,

    `CREATE OR REPLACE VIEW opandiprefunddetails AS
     SELECT r."RefundDateTime", r."RefundIdentifier", r."FacilityId",
            f."FacilityName", 1::bigint AS "OrganizationId",
            r."PatientId", p."FirstName" || ' ' || COALESCE(p."LastName", '') AS "PatientName",
            r."PaymentTypeId", 'Refund Cash'::text AS "PaymentType",
            r."PatientBillId", r."RefundAmount",
            b."BillNumber", b."BillAmount",
            0::numeric AS "DiscountModeValue",
            r."EncounterId", e."EncounterTypeId",
            rv."Description" AS "EncounterType",
            r."BankId", NULL::text AS "Bank",
            r."CardTypeId", NULL::text AS "CardType",
            r."TerminalNoId", NULL::text AS "TerminalNo",
            r."AuthorizeNumber",
            r."RefundTypeId", 'Bill Refund'::text AS "RefundType"
     FROM "patientrefund" r
     LEFT JOIN "patientbills" b ON r."PatientBillId" = b."PatientBillId"
     LEFT JOIN "encounters" e ON r."EncounterId" = e."EncounterId"
     LEFT JOIN "patients" p ON r."PatientId" = p."PatientId"
     LEFT JOIN "facilities" f ON r."FacilityId" = f."FacilityId"
     LEFT JOIN "referencevalues" rv ON e."EncounterTypeId" = rv."ReferenceValueCodeId";`
  ];

  for (const v of viewSqls) {
    await pClient.query(v);
  }
  console.log("Created all 8 views.");

  // 4. Create Target-Only Table idempotency_records
  console.log("Creating target-only idempotency_records table...");
  await pClient.query(`
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

  // 5. Verification Audit
  const baseTableCount = await pClient.query("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'");
  const viewCount = await pClient.query("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'VIEW'");
  const totalBase = parseInt(baseTableCount.rows[0].count, 10);
  const totalViews = parseInt(viewCount.rows[0].count, 10);

  console.log(`\n======================================================`);
  console.log(`VERIFICATION AUDIT FOR ${targetDbName}:`);
  console.log(`- Source Base Tables: 554`);
  console.log(`- Target-Only Tables (idempotency_records): 1`);
  console.log(`- Total Base Tables in Database: ${totalBase} (Expected: 555)`);
  console.log(`- Translated Views in Database: ${totalViews} (Expected: 8)`);
  console.log(`- Total Database Relations: ${totalBase + totalViews} (Expected: 563)`);
  console.log(`======================================================\n`);

  await mConn.end();
  await pClient.end();
}

runProvisioning().catch(err => {
  console.error("Provisioning error:", err);
  process.exit(1);
});
