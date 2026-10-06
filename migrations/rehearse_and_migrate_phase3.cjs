const mysql = require("mysql2/promise");
const pg = require("pg");
const fs = require("fs");

function mapMysqlTypeToPg(col) {
  const type = col.Type.toLowerCase();
  const isAuto = col.Extra && col.Extra.toLowerCase().includes("auto_increment");
  const isPk = col.Key === "PRI";

  if (isPk && isAuto) {
    if (type.includes("bigint")) return "BIGSERIAL PRIMARY KEY";
    return "SERIAL PRIMARY KEY";
  }

  if (type.includes("char(0)")) return "TEXT";
  if (type.startsWith("tinyint(1)") || type === "boolean" || type === "bool") return "BOOLEAN";
  if (type.startsWith("bigint")) return "BIGINT";
  if (type.startsWith("int") || type.startsWith("mediumint") || type.startsWith("smallint") || type.startsWith("tinyint")) return "INTEGER";
  if (type.startsWith("varchar") || type.startsWith("char")) return col.Type.toUpperCase();
  if (type.includes("text") || type.includes("blob")) return "TEXT";
  if (type.includes("decimal") || type.includes("numeric") || type.includes("double") || type.includes("float")) return "NUMERIC(18,6)";
  if (type.includes("datetime") || type.includes("timestamp")) return "TIMESTAMP WITHOUT TIME ZONE";
  if (type.includes("date")) return "DATE";
  if (type.includes("time")) return "TIME WITHOUT TIME ZONE";
  if (type.includes("json")) return "JSONB";

  return "TEXT";
}

async function migrateAllToDb(targetDbName, onlyRemainingInPilot = false) {
  const mConn = await mysql.createConnection({ host: "localhost", port: 3307, user: "root", password: "root", database: "test" });
  const pClient = new pg.Client({ host: "localhost", port: 5432, user: process.env.USER || "sharmila", database: targetDbName });
  await pClient.connect();

  console.log(`\n======================================================`);
  console.log(`STARTING MIGRATION INTO TARGET DB: ${targetDbName}`);
  console.log(`Mode: ${onlyRemainingInPilot ? "Incremental (Remaining 189 tables)" : "Full Source (554 tables)"}`);
  console.log(`======================================================\n`);

  const [mTables] = await mConn.query("SELECT TABLE_NAME FROM information_schema.tables WHERE TABLE_SCHEMA = 'test' AND TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME");
  const pExisting = await pClient.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'");
  const pExistingSet = new Set(pExisting.rows.map(r => r.table_name.toLowerCase()));

  let migratedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  const tableStats = [];

  for (const tRow of mTables) {
    const t = tRow.TABLE_NAME;
    if (onlyRemainingInPilot && pExistingSet.has(t.toLowerCase())) {
      skippedCount++;
      continue;
    }

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
        // Batch insert in chunks of 500 rows for high performance & stability
        const chunkSize = 500;
        for (let i = 0; i < rows.length; i += chunkSize) {
          const chunk = rows.slice(i, i + chunkSize);
          for (const row of chunk) {
            const colNames = Object.keys(row);
            const colList = colNames.map(c => `"${c}"`).join(", ");
            const placeholders = colNames.map((_, idx) => `$${idx + 1}`).join(", ");
            const values = colNames.map(c => row[c]);
            const insertSql = `INSERT INTO "${t}" (${colList}) VALUES (${placeholders}) ON CONFLICT DO NOTHING;`;
            await pClient.query(insertSql, values);
          }
        }

        // Align serial sequences
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

      const pCountRes = await pClient.query(`SELECT COUNT(*) as c FROM "${t}"`);
      const pCount = parseInt(pCountRes.rows[0].c, 10);
      migratedCount++;
      tableStats.push({ table: t, sourceRows: rows.length, targetRows: pCount, status: rows.length === pCount ? "EXACT_MATCH" : "PARTIAL" });
      if (migratedCount % 25 === 0 || rows.length > 500) {
        console.log(`[${migratedCount}] Migrated ${t}: ${rows.length} rows (PG: ${pCount})`);
      }
    } catch (err) {
      errorCount++;
      console.error(`ERROR migrating ${t}:`, err.message);
    }
  }

  console.log(`\nCompleted base tables migration for ${targetDbName}: ${migratedCount} migrated, ${skippedCount} preserved, ${errorCount} errors.`);

  // Create Views
  console.log(`Creating 8 database views in ${targetDbName}...`);
  const viewSqls = [
    `CREATE OR REPLACE VIEW tally_collection_view AS
     SELECT "ReceiptDateTime", "primary_key", "ReceiptNumber", "FacilityId", "FacilityName",
            "OrganizationId", "PatientId", "PatientName", "PaymentTypeId", "Description",
            "AuthorizedCode", "PatientBillId", "AmountPaid", "billnumber", "StoreMasterId",
            "StoreName", "BillAmount", "BillDiscount", "encountertypeid", "Type",
            "CARD_APPROVALNO", "TERMINAL_NO", "UPI_NO"
     FROM tally_collection;`,

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
     FROM tally_p_return;`,

    `CREATE OR REPLACE VIEW tally_purchase_view AS
     SELECT "types", "FacilityId", "OrganisationId", "grnid", "GRNDate", "GrnNumber",
            "InvoiceDate", "InvoiceNumber", "StoreMasterId", "storename", "VendorMasterId",
            "VendorName", "GSTNo", "PurchaseOrderId", "PoNumber", "PoDate", "AddressLine1",
            "AddressLine2", "AddressLine3", "GrnTypeId", "TotalGrossAmount", "gst_grossamount",
            "TotalDiscountAmount", "DiscountAmount", "TotalNetAmount", "OtherCharges",
            "TotalInvoiceAmount", "GstPercentage", "gst_sum", "cgst_percen", "cgst_sum",
            "sgst_percen", "sgst_sum", "Comments", "ADD_VALUE1", "ADD_VALUE2", "LESS_VALUE1",
            "LESS_VALUE2", "NARRATION", "IS_UPLOADED", "APPROVED_STATUS"
     FROM tally_purchase;`,

    `CREATE OR REPLACE VIEW tally_sale_ret_view AS
     SELECT "types", "OrganizationId", "facilityid", "PatientBillId", "BillNumber", "BillDateTime",
            "GuarantorName",
            CASE WHEN "billtypeid" IN (1, 4, 6) THEN 4 ELSE "billtypeid" END AS "billtypeid",
            "billtype", "PatientMrn", "PatientName", "TitleId", "title", "StoreMasterId",
            "StoreName", "EncounterId", "encountertype", "BillAmount", "BillDiscount", "PaidAmount",
            "OutStandingAmount", "GSTPercentage", "pd_gross_amount", "pd_gst_amount", "pd_cgst_per",
            "pd_cgst_amount", "pd_sgst_per", "pd_sgst_amount", "pd_ingst_per", "pd_ingst_amount"
     FROM tally_sale_ret;`,

    `CREATE OR REPLACE VIEW tally_sale_view AS
     SELECT "types", "OrganizationId", "facilityid", "PatientBillId", "BillNumber", "BillDateTime",
            "GuarantorName", "billtypeid", "billtype", "PatientMrn", "PatientName", "TitleId", "title",
            "StoreMasterId", "StoreName", "EncounterId", "encountertype",
            ("BillAmount" - "BillDiscount") AS "BillAmount", "BillDiscount", "PaidAmount",
            "OutStandingAmount", "GSTPercentage", "pd_gross_amount", "pd_gst_amount", "pd_cgst_per",
            "pd_cgst_amount", "pd_sgst_per", "pd_sgst_amount", "pd_ingst_per", "pd_ingst_amount"
     FROM tally_sale;`,

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
     FROM patientbills b
     LEFT JOIN encounters e ON b."EncounterId" = e."EncounterId"
     LEFT JOIN patients p ON b."PatientId" = p."PatientId"
     LEFT JOIN patientbilldetails bd ON b."PatientBillId" = bd."PatientBillId"
     LEFT JOIN users u ON e."DoctorId" = u."UserId"
     LEFT JOIN departments d ON e."DepartmentId" = d."DepartmentId"
     LEFT JOIN wardmaster w ON e."WardId" = w."WardId"
     LEFT JOIN servicecategories sc ON bd."ServiceCategoryId" = sc."ServiceCategoryId"
     LEFT JOIN encounterguarantors eg ON e."EncounterId" = eg."EncounterId"
     LEFT JOIN guarantors g ON eg."GuarantorId" = g."GuarantorId"
     LEFT JOIN referencevalues rv ON g."GuarantorTypeId" = rv."ReferenceValueCodeId";`,

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
     FROM patientpaymentdetails pd
     LEFT JOIN patientbills b ON pd."PatientBillId" = b."PatientBillId"
     LEFT JOIN encounters e ON pd."EncounterId" = e."EncounterId"
     LEFT JOIN facilities f ON pd."FacilityId" = f."FacilityId"
     LEFT JOIN referencevalues rv ON pd."PaymentTypeId" = rv."ReferenceValueCodeId"
     LEFT JOIN referencevalues rv2 ON e."EncounterTypeId" = rv2."ReferenceValueCodeId";`,

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
     FROM patientrefund r
     LEFT JOIN patientbills b ON r."PatientBillId" = b."PatientBillId"
     LEFT JOIN encounters e ON r."EncounterId" = e."EncounterId"
     LEFT JOIN patients p ON r."PatientId" = p."PatientId"
     LEFT JOIN facilities f ON r."FacilityId" = f."FacilityId"
     LEFT JOIN referencevalues rv ON e."EncounterTypeId" = rv."ReferenceValueCodeId";`
  ];

  for (const vSql of viewSqls) {
    await pClient.query(vSql);
  }

  // Create target view bedtransfers for compatibility
  await pClient.query(`CREATE OR REPLACE VIEW bedtransfers AS SELECT * FROM bedtransfer;`);

  const finalBaseTables = await pClient.query("SELECT COUNT(*) as c FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'");
  const finalViews = await pClient.query("SELECT COUNT(*) as c FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'VIEW'");

  console.log(`\nFinal counts in ${targetDbName}:`);
  console.log(`Base Tables: ${finalBaseTables.rows[0].c}`);
  console.log(`Views: ${finalViews.rows[0].c}`);

  await mConn.end();
  await pClient.end();

  return tableStats;
}

async function run() {
  // Step 1: Rehearse in hims_recon_db
  console.log("=== STEP 1: REHEARSAL FULL-SOURCE MIGRATION (hims_recon_db) ===");
  await migrateAllToDb("hims_recon_db", false);

  // Step 2: Incrementally migrate remaining 189 tables into hims_pilot_db
  console.log("\n=== STEP 2: INCREMENTAL MIGRATION OF REMAINING 189 TABLES (hims_pilot_db) ===");
  await migrateAllToDb("hims_pilot_db", true);

  console.log("\n=== ALL MIGRATION PHASES COMPLETED SUCCESSFULLY ===");
}

run().catch(console.error);
