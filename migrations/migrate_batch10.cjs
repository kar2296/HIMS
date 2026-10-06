const mysql = require("mysql2/promise");
const pg = require("pg");

const tablesToMigrate = [
  "mis_collection",
  "mis_departmentrevenue",
  "mis_doctorwisestatsrevenue",
  "mis_occupancy",
  "mis_revenue",
  "mis_statistics",
  "mis_categoryrevenue",
  "tally_collection",
  "tally_p_return",
  "tally_purchase",
  "tally_sale",
  "tally_sale_ret",
  "rolemobileconfigmap",
  "userdefaultservices",
  "userspecialitymap",
  "usertaxdetails",
  "integrationevents"
];

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

async function migrateBatch10TablesAndViews() {
  const mConn = await mysql.createConnection({ host: "localhost", port: 3307, user: "root", password: "root", database: "test" });
  const pClient = new pg.Client({ host: "localhost", port: 5432, user: process.env.USER || "sharmila", database: "hims_pilot_db" });
  await pClient.connect();

  console.log("=== STARTING BATCH 10 POSTGRESQL MIGRATION ===");

  // 1. Migrate Base Tables
  for (const t of tablesToMigrate) {
    console.log(`\nMigrating table: ${t}`);
    const [cols] = await mConn.query(`SHOW COLUMNS FROM \`${t}\``);
    
    // Build CREATE TABLE
    const colDefs = cols.map(c => {
      const pgType = mapMysqlTypeToPg(c);
      return `"${c.Field}" ${pgType}`;
    });

    const createSql = `CREATE TABLE IF NOT EXISTS "${t}" (\n  ${colDefs.join(",\n  ")}\n);`;
    await pClient.query(createSql);
    console.log(`Created schema for ${t}`);

    // Read data from MySQL
    const [rows] = await mConn.query(`SELECT * FROM \`${t}\``);
    console.log(`Found ${rows.length} rows in MySQL for ${t}`);

    if (rows.length > 0) {
      for (const row of rows) {
        const colNames = Object.keys(row);
        const colList = colNames.map(c => `"${c}"`).join(", ");
        const placeholders = colNames.map((_, i) => `$${i + 1}`).join(", ");
        const values = colNames.map(c => row[c]);

        const insertSql = `INSERT INTO "${t}" (${colList}) VALUES (${placeholders}) ON CONFLICT DO NOTHING;`;
        await pClient.query(insertSql, values);
      }
      console.log(`Inserted ${rows.length} rows into PostgreSQL table ${t}`);

      // Fix sequence if PK exists
      const pkCol = cols.find(c => c.Key === "PRI");
      if (pkCol) {
        try {
          const seqRes = await pClient.query(`
            SELECT pg_get_serial_sequence('"${t}"', '${pkCol.Field}') as seq;
          `);
          const seqName = seqRes.rows[0]?.seq;
          if (seqName) {
            await pClient.query(`
              SELECT setval('${seqName}', COALESCE((SELECT MAX("${pkCol.Field}") FROM "${t}"), 0) + 1, false);
            `);
            console.log(`Updated sequence for ${t}.${pkCol.Field} via ${seqName}`);
          }
        } catch(e) {
          console.log(`Note on sequence for ${t}: ${e.message}`);
        }
      }
    }
  }

  // 2. Translate and Create 8 Views in PostgreSQL
  console.log("\n=== TRANSLATING AND CREATING 8 VIEWS IN POSTGRESQL ===");

  const viewsToDrop = [
    "tally_collection_view", "tally_p_return_view", "tally_purchase_view",
    "tally_sale_ret_view", "tally_sale_view", "ippatientbilldetails",
    "opandippaymentdetails", "opandiprefunddetails"
  ];
  for (const v of viewsToDrop) {
    await pClient.query(`DROP VIEW IF EXISTS "${v}" CASCADE;`);
  }

  // View 1: tally_collection_view
  await pClient.query(`
    CREATE VIEW tally_collection_view AS
    SELECT 
      "ReceiptDateTime", "primary_key", "ReceiptNumber", "FacilityId", "FacilityName",
      "OrganizationId", "PatientId", "PatientName", "PaymentTypeId", "Description",
      "AuthorizedCode", "PatientBillId", "AmountPaid", "billnumber", "StoreMasterId",
      "StoreName", "BillAmount", "BillDiscount", "encountertypeid", "Type",
      "CARD_APPROVALNO", "TERMINAL_NO", "UPI_NO"
    FROM tally_collection;
  `);
  console.log("Created view: tally_collection_view");

  // View 2: tally_p_return_view
  await pClient.query(`
    CREATE VIEW tally_p_return_view AS
    SELECT 
      "types", "FacilityId", "OrganisationId", "grnid", "GRNDate", "GrnNumber",
      CASE WHEN "InvoiceDate"::text = '' THEN "GRNDate" ELSE NULL END AS "InvoiceDate",
      CASE WHEN "InvoiceNumber"::text = '' THEN "GrnNumber" ELSE "InvoiceNumber" END AS "InvoiceNumber",
      "StoreMasterId", "storename", "VendorMasterId", "VendorName", "GSTNo",
      "PurchaseOrderId", "PoNumber", "PoDate", "AddressLine1", "AddressLine2", "AddressLine3",
      "GrnTypeId", "TotalGrossAmount", "gst_grossamount", "TotalDiscountAmount", "DiscountAmount",
      "TotalNetAmount", "OtherCharges", "TotalInvoiceAmount", "GstPercentage", "gst_sum",
      "cgst_percen", "cgst_sum", "sgst_percen", "sgst_sum", "Comments", "ADD_VALUE1", "ADD_VALUE2",
      "LESS_VALUE1", "LESS_VALUE2", "NARRATION", "IS_UPLOADED", "APPROVED_STATUS"
    FROM tally_p_return;
  `);
  console.log("Created view: tally_p_return_view");

  // View 3: tally_purchase_view
  await pClient.query(`
    CREATE VIEW tally_purchase_view AS
    SELECT 
      "types", "FacilityId", "OrganisationId", "grnid", "GRNDate", "GrnNumber",
      "InvoiceDate", "InvoiceNumber", "StoreMasterId", "storename", "VendorMasterId",
      "VendorName", "GSTNo", "PurchaseOrderId", "PoNumber", "PoDate", "AddressLine1",
      "AddressLine2", "AddressLine3", "GrnTypeId", "TotalGrossAmount", "gst_grossamount",
      "TotalDiscountAmount", "DiscountAmount", "TotalNetAmount", "OtherCharges",
      "TotalInvoiceAmount", "GstPercentage", "gst_sum", "cgst_percen", "cgst_sum",
      "sgst_percen", "sgst_sum", "Comments", "ADD_VALUE1", "ADD_VALUE2", "LESS_VALUE1",
      "LESS_VALUE2", "NARRATION", "IS_UPLOADED", "APPROVED_STATUS"
    FROM tally_purchase;
  `);
  console.log("Created view: tally_purchase_view");

  // View 4: tally_sale_ret_view
  await pClient.query(`
    CREATE VIEW tally_sale_ret_view AS
    SELECT 
      "types", "OrganizationId", "facilityid", "PatientBillId", "BillNumber", "BillDateTime",
      "GuarantorName",
      CASE WHEN "billtypeid"::text IN ('1', '4', '6') THEN 4::bigint ELSE 0::bigint END AS "billtypeid",
      "billtype", "PatientMrn", "PatientName", "TitleId", "title", "StoreMasterId",
      "StoreName", "EncounterId", "encountertype", "BillAmount", "BillDiscount", "PaidAmount",
      "OutStandingAmount", "GSTPercentage", "pd_gross_amount", "pd_gst_amount", "pd_cgst_per",
      "pd_cgst_amount", "pd_sgst_per", "pd_sgst_amount", "pd_ingst_per", "pd_ingst_amount"
    FROM tally_sale_ret;
  `);
  console.log("Created view: tally_sale_ret_view");

  // View 5: tally_sale_view
  await pClient.query(`
    CREATE VIEW tally_sale_view AS
    SELECT 
      "types", "OrganizationId", "facilityid", "PatientBillId", "BillNumber", "BillDateTime",
      "GuarantorName", "billtypeid", "billtype", "PatientMrn", "PatientName", "TitleId", "title",
      "StoreMasterId", "StoreName", "EncounterId", "encountertype",
      (COALESCE(NULLIF("BillAmount"::text, '')::numeric, 0) - COALESCE(NULLIF("BillDiscount"::text, '')::numeric, 0)) AS "BillAmount",
      "BillDiscount", "PaidAmount", "OutStandingAmount", "GSTPercentage", "pd_gross_amount",
      "pd_gst_amount", "pd_cgst_per", "pd_cgst_amount", "pd_sgst_per", "pd_sgst_amount",
      "pd_ingst_per", "pd_ingst_amount"
    FROM tally_sale;
  `);
  console.log("Created view: tally_sale_view");

  // View 6: ippatientbilldetails
  await pClient.query(`
    CREATE VIEW ippatientbilldetails AS
    SELECT 
      e."EncounterId", e."AdmissionDate", e."DischargeDate", e."EncounterTypeId", e."AdmissionStatusId",
      TO_CHAR(e."DischargeDate", 'YYYY-MM') AS "DisMonth",
      e."VisitNumber" AS "IPNumber", p."MRN" AS "PHID",
      b."BillNumber" AS "DischargeBillNumber",
      p."FirstName" || ' ' || COALESCE(p."LastName", '') AS "PatientName",
      u."FirstName" || ' ' || COALESCE(u."LastName", '') AS "DoctorName",
      d."DepartmentName",
      u."FirstName" || ' ' || COALESCE(u."LastName", '') AS "TreatingDoctorName",
      g."GuarantorName",
      rv."Description" AS "GuarantorType",
      w."WardName",
      b."PatientBillId" AS "HeaderBillId", b."PatientBillTypeId" AS "HeaderBillTypeId",
      bd."PatientBillDetailId" AS "HeaderDetailBillId", bd."PatientBillId" AS "HeaderDetailBillTypeId",
      b."BillNumber" AS "DischargeDetailBillNumber",
      b."PatientBillStatusId" AS "HeaderDetailPatientBillStatusId",
      bd."ServiceId", bd."ServiceName", bd."GrossAmount", bd."DiscountAmount", bd."NetAmount",
      bd."Status" AS "DetailPatientBillStatusId",
      bd."ServiceCategoryId", 0::bigint AS "SurgeryEntryId",
      sc."CategoryName" AS "ServiceCategoryName",
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
    LEFT JOIN referencevalues rv ON g."GuarantorTypeId" = rv."ReferenceValueCodeId";
  `);
  console.log("Created view: ippatientbilldetails");

  // View 7: opandippaymentdetails
  await pClient.query(`
    CREATE VIEW opandippaymentdetails AS
    SELECT 
      pd."ReceiptDateTime", pd."ReceiptNumber", pd."FacilityId",
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
    LEFT JOIN referencevalues rv2 ON e."EncounterTypeId" = rv2."ReferenceValueCodeId";
  `);
  console.log("Created view: opandippaymentdetails");

  // View 8: opandiprefunddetails
  await pClient.query(`
    CREATE VIEW opandiprefunddetails AS
    SELECT 
      r."RefundDateTime", r."RefundNumber" AS "RefundIdentifier", r."FacilityId",
      f."FacilityName", 1::bigint AS "OrganizationId",
      r."PatientId", p."FirstName" || ' ' || COALESCE(p."LastName", '') AS "PatientName",
      1::bigint AS "PaymentTypeId", 'Refund Cash'::text AS "PaymentType",
      r."PatientBillId", r."RefundAmount",
      b."BillNumber", b."BillAmount",
      0::numeric AS "DiscountModeValue",
      r."EncounterId", e."EncounterTypeId",
      rv."Description" AS "EncounterType",
      1::bigint AS "BankId", NULL::text AS "Bank",
      1::bigint AS "CardTypeId", NULL::text AS "CardType",
      1::text AS "TerminalNoId", NULL::text AS "TerminalNo",
      'AUTH-REF'::text AS "AuthorizeNumber",
      1::bigint AS "RefundTypeId", 'Bill Refund'::text AS "RefundType"
    FROM patientrefund r
    LEFT JOIN patientbills b ON r."PatientBillId" = b."PatientBillId"
    LEFT JOIN encounters e ON r."EncounterId" = e."EncounterId"
    LEFT JOIN patients p ON r."PatientId" = p."PatientId"
    LEFT JOIN facilities f ON r."FacilityId" = f."FacilityId"
    LEFT JOIN referencevalues rv ON e."EncounterTypeId" = rv."ReferenceValueCodeId";
  `);
  console.log("Created view: opandiprefunddetails");

  await mConn.end();
  await pClient.end();
  console.log("\n=== BATCH 10 MIGRATION COMPLETED SUCCESSFULLY ===");
}

migrateBatch10TablesAndViews().catch(console.error);
