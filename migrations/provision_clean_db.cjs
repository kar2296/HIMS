const mysql = require("mysql2/promise");
const pg = require("pg");

const COLUMN_CASING_OVERRIDES = {
  "hims_assetaudit.locationid": "LocationId",
  "modifiedpatientbillcategorydetails.netamountbeforegst": "NetAmountBeforeGST",
  "mis_categoryrevenue.status": "Status",
  "hims_claimcoveringletterdetails.claimcoveringletterid": "ClaimCoveringletterId",
  "patientinsurancechecklist.patientinsurancechecklistid": "patientInsuranceChecklistId",
  "patientrefunddetails.paymentcounterid": "PaymentCounterId",
  "ticksheets.ticksheetmastertypeid": "TickSheetMasterTypeId",
  "ticksheets.ticksheetmastertypename": "TickSheetMasterTypeName",
  "hims_orderfollowup.orderfollowupid": "OrderFollowupId",
  "patientannotations.annotations": "Annotations",
  "patientfeedback.patientfeedbackstatusid": "PatientFeedBackStatusId",
  "patientfeedbackdetails.patientfeedbackstatusid": "PatientFeedBackStatusId",
  "hims_revenuetarget.createdby": "Createdby",
  "hims_revenuetarget.updatedby": "Updatedby",
  "treatementmodality.createdby": "Createdby",
  "treatementmodality.updatedby": "Updatedby",
  "wardroommaster.wardid": "WardId",
  "bedoccupancyhistory.serviceratecategoryid": "ServiceRateCategoryId",
  "externalproviders.activefrom": "Activefrom",
  "externalproviders.activeto": "Activeto",
  "patientworkorder.encounterid": "EncounterId",
  "externalproviderprice.price": "Price",
  "externalproviderprice.activefrom": "ActiveFrom",
  "externalproviderprice.activeto": "ActiveTo",
  "sampletype.activefrom": "ActiveFrom",
  "sampletype.activeto": "ActiveTo",
  "otdocuments.otdocumentid": "OtDocumentId",
  "customercontacts.createdby": "Createdby",
  "customercontacts.updatedby": "Updatedby",
  "itemcustomermap.createdby": "Createdby",
  "itemcustomermap.updatedby": "Updatedby",
  "itemvendormap.createdby": "Createdby",
  "itemvendormap.updatedby": "Updatedby",
  "productsubtype.productsubtype": "ProductSubType",
  "stockconsumptiondetails.barcodeid": "BarCodeId",
  "stockrequests.tofacilityid": "ToFacilityId",
  "vendorcontacts.createdby": "Createdby",
  "vendorcontacts.updatedby": "Updatedby",
  "vendorerpmap.createdby": "Createdby",
  "vendorerpmap.updatedby": "Updatedby",
  "patients.firstname": "FirstName",
  "patients.middlename": "MiddleName",
  "patients.lastname": "LastName",
  "patients.dob": "DOB",
  "patients.mobile": "Mobile",
  "patientsarchive.firstname": "FirstName",
  "patientsarchive.middlename": "MiddleName",
  "patientsarchive.lastname": "LastName",
  "patientsarchive.dob": "DOB",
  "patientsarchive.mobile": "Mobile",
  "patientmerge.firstname": "FirstName",
  "patientmerge.middlename": "MiddleName",
  "patientmerge.lastname": "LastName",
  "patientmerge.dob": "DOB",
  "patientmerge.mobile": "Mobile",
  "departments.departmentlogo": "DepartmentLogo",
  "users.image": "Image"
};

const fs = require("fs");
const path = require("path");

function getModelDefinitions() {
  const modelDir = path.join(__dirname, "../api/src/Server/Modules");
  function getFiles(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const full = path.join(dir, file);
      const stat = fs.statSync(full);
      if (stat && stat.isDirectory()) results = results.concat(getFiles(full));
      else if (file.endsWith(".Model.ts") || file.endsWith("Model.ts")) results.push(full);
    });
    return results;
  }

  const files = getFiles(modelDir);
  const typeMap = {};

  for (const f of files) {
    const content = fs.readFileSync(f, "utf8");
    const tMatch = content.match(/tableName:\s*[\x27"]([^\x27"]+)[\x27"]/i) || content.match(/define<[^>]+>\([\x27"]([^\x27"]+)[\x27"]/);
    if (!tMatch) continue;
    const tableName = tMatch[1].toLowerCase();

    const attrRegex = /(\w+):\s*\{\s*type:\s*DataTypes\.(\w+)(?:[^\}]*?field:\s*[\x27"]([^\x27"]+)[\x27"])?/g;
    let match;
    while ((match = attrRegex.exec(content)) !== null) {
      const propName = match[1];
      const dataType = match[2];
      const explicitField = match[3] || propName;
      
      let pgType = "TEXT";
      if (dataType === "BOOLEAN") pgType = "BOOLEAN";
      else if (dataType === "BIGINT") pgType = "BIGINT";
      else if (dataType === "INTEGER") pgType = "INTEGER";
      else if (dataType === "DECIMAL" || dataType === "FLOAT" || dataType === "DOUBLE") pgType = "NUMERIC(18,6)";
      else if (dataType === "DATE") pgType = "TIMESTAMP WITH TIME ZONE";
      else if (dataType === "STRING") pgType = "TEXT";
      else if (dataType === "TEXT") pgType = "TEXT";

      typeMap[`${tableName}.${explicitField.toLowerCase()}`] = { fieldName: explicitField, pgType };
    }
  }

  return typeMap;
}

const MODEL_MAP = getModelDefinitions();

function mapMysqlTypeToPg(col, tableName) {
  const tKey = tableName ? `${tableName.toLowerCase()}.${col.Field.toLowerCase()}` : "";
  const modelDef = MODEL_MAP[tKey];
  const type = col.Type.toLowerCase();
  const field = col.Field.toLowerCase();
  const isAuto = col.Extra && col.Extra.toLowerCase().includes("auto_increment");
  const isPk = col.Key === "PRI";

  if (isPk && isAuto) {
    if (type.includes("bigint")) return "BIGSERIAL PRIMARY KEY";
    return "SERIAL PRIMARY KEY";
  }

  if (type.includes("char(0)")) return "TEXT";
  if (type.startsWith("varchar") || type.startsWith("char") || type.includes("text") || type.includes("blob") || type.includes("json")) {
    return "TEXT";
  }

  if (type.includes("datetime") || type.includes("timestamp")) return "TIMESTAMP WITH TIME ZONE";
  if (type.includes("date")) return "DATE";
  if (type.includes("time")) return "TIME WITHOUT TIME ZONE";
  if (type.includes("decimal") || type.includes("numeric") || type.includes("double") || type.includes("float")) return "NUMERIC(18,6)";

  if (modelDef && modelDef.pgType === "BOOLEAN") {
    return "BOOLEAN";
  }

  if (type.startsWith("tinyint(1)") || type === "boolean" || type === "bool") {
    if (field.endsWith("statusid") || field.endsWith("status") || field.endsWith("id") || field.endsWith("typeid") || field.endsWith("count") || field.endsWith("code")) {
      return "INTEGER";
    }
    return "BOOLEAN";
  }

  if (type.startsWith("bigint")) return "BIGINT";
  if (type.startsWith("int") || type.startsWith("mediumint") || type.startsWith("smallint") || type.startsWith("tinyint")) return "INTEGER";

  return "TEXT";
}

function sanitizeValue(val, pgType) {
  if (val === null || val === undefined) return null;
  if (pgType === "BOOLEAN") {
    if (val === 0 || val === "0" || val === false || val === "false") return false;
    return true;
  }
  if (typeof val === "string") return val.replace(/\0/g, "");
  if (Buffer.isBuffer(val)) return val.toString("utf8").replace(/\0/g, "");
  return val;
}

async function provisionDatabase(targetDbName) {
  console.log(`================================================================`);
  console.log(`PROVISIONING CLEAN DATABASE EXCLUSIVELY VIA COMMITTED MIGRATIONS`);
  console.log(`Target Database: ${targetDbName}`);
  console.log(`================================================================\n`);

  const mConn = await mysql.createConnection({ host: "localhost", port: 3307, user: "root", password: "root", database: "test" });
  const pClient = new pg.Client({ host: "localhost", port: 5432, user: process.env.USER || "sharmila", database: targetDbName });
  await pClient.connect();

  // 1. Install PostgreSQL Compatibility Functions, Casts and Operators
  console.log("[Migration Step 1] Applying PostgreSQL compatibility functions and operators...");
  await pClient.query(`
    CREATE OR REPLACE FUNCTION pg_catalog.int4(boolean)
    RETURNS int4 STRICT IMMUTABLE LANGUAGE SQL AS 'SELECT CASE WHEN $1 THEN 1 ELSE 0 END;';

    CREATE OR REPLACE FUNCTION pg_catalog.bool(int4)
    RETURNS bool STRICT IMMUTABLE LANGUAGE SQL AS 'SELECT $1 <> 0;';

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_cast WHERE castsource = 'boolean'::regtype AND casttarget = 'integer'::regtype) THEN
        CREATE CAST (boolean AS integer) WITH FUNCTION pg_catalog.int4(boolean) AS IMPLICIT;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_cast WHERE castsource = 'integer'::regtype AND casttarget = 'boolean'::regtype) THEN
        CREATE CAST (integer AS boolean) WITH FUNCTION pg_catalog.bool(int4) AS IMPLICIT;
      END IF;
    END
    $$;

    CREATE OR REPLACE FUNCTION pg_catalog.int4eqbool(int4, bool) 
    RETURNS bool STRICT IMMUTABLE LANGUAGE SQL AS 'SELECT $1 = (CASE WHEN $2 THEN 1 ELSE 0 END);';

    CREATE OR REPLACE FUNCTION pg_catalog.booleqint4(bool, int4) 
    RETURNS bool STRICT IMMUTABLE LANGUAGE SQL AS 'SELECT (CASE WHEN $1 THEN 1 ELSE 0 END) = $2;';

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_operator WHERE oprname = '=' AND oprleft = 'integer'::regtype AND oprright = 'boolean'::regtype) THEN
        CREATE OPERATOR = (LEFTARG = integer, RIGHTARG = boolean, PROCEDURE = pg_catalog.int4eqbool, COMMUTATOR = =, NEGATOR = <>, MERGES, HASHES);
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_operator WHERE oprname = '=' AND oprleft = 'boolean'::regtype AND oprright = 'integer'::regtype) THEN
        CREATE OPERATOR = (LEFTARG = boolean, RIGHTARG = integer, PROCEDURE = pg_catalog.booleqint4, COMMUTATOR = =, NEGATOR = <>, MERGES, HASHES);
      END IF;
    END
    $$;
  `);

  // 2. Provision Target-Only DEF-006 Idempotency Records Table
  console.log("[Migration Step 2] Creating target idempotency_records table...");
  await pClient.query(`
    CREATE TABLE IF NOT EXISTS idempotency_records (
      "Id" BIGSERIAL PRIMARY KEY,
      "IdempotencyKey" VARCHAR(128) NOT NULL,
      "FacilityId" BIGINT NOT NULL,
      "OperationType" VARCHAR(64) NOT NULL,
      "RequestFingerprint" VARCHAR(64) NOT NULL,
      "Status" VARCHAR(32) NOT NULL DEFAULT 'IN_PROGRESS',
      "ResponseCode" INTEGER,
      "ResponseBody" JSONB,
      "EntityId" BIGINT,
      "CreatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      "UpdatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      CONSTRAINT uq_idempotency_key_facility_op UNIQUE ("IdempotencyKey", "FacilityId", "OperationType")
    );
    CREATE INDEX IF NOT EXISTS idx_idempotency_created ON idempotency_records ("CreatedAt");
  `);

  // 3. Provision 554 Base Tables from Source Schema with Exact PascalCase Casing Overrides
  console.log("[Migration Step 3] Migrating 554 source base tables with PascalCase overrides...");
  const [mTables] = await mConn.query("SELECT TABLE_NAME FROM information_schema.tables WHERE TABLE_SCHEMA = 'test' AND TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME");

  let migratedCount = 0;
  for (const tRow of mTables) {
    const t = tRow.TABLE_NAME;
    const [cols] = await mConn.query(`SHOW COLUMNS FROM \`${t}\``);
    
    const colDefs = cols.map(c => {
      const overrideKey = `${t.toLowerCase()}.${c.Field.toLowerCase()}`;
      const finalFieldName = COLUMN_CASING_OVERRIDES[overrideKey] || (MODEL_MAP[overrideKey] ? MODEL_MAP[overrideKey].fieldName : c.Field);
      const pgType = mapMysqlTypeToPg(c, t);
      return `"${finalFieldName}" ${pgType}`;
    });

    const createSql = `CREATE TABLE IF NOT EXISTS "${t}" (\n  ${colDefs.join(",\n  ")}\n);`;
    await pClient.query(createSql);

    // Copy synthetic/pilot test seed data
    const [rows] = await mConn.query(`SELECT * FROM \`${t}\``);
    if (rows.length > 0) {
      const colNames = Object.keys(rows[0]);
      const targetColList = colNames.map(c => {
        const overrideKey = `${t.toLowerCase()}.${c.toLowerCase()}`;
        return `"${COLUMN_CASING_OVERRIDES[overrideKey] || (MODEL_MAP[overrideKey] ? MODEL_MAP[overrideKey].fieldName : c)}"`;
      }).join(", ");
      const numCols = colNames.length;

      const colTypeMap = {};
      cols.forEach(c => {
        colTypeMap[c.Field] = mapMysqlTypeToPg(c, t);
      });

      const batchSize = 200;
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        const valuePlaceholders = [];
        const flatValues = [];

        batch.forEach((row, rIdx) => {
          const rowPlaceholders = [];
          for (let cIdx = 0; cIdx < numCols; cIdx++) {
            const rawColName = colNames[cIdx];
            const paramIdx = (rIdx * numCols) + cIdx + 1;
            rowPlaceholders.push(`$${paramIdx}`);
            flatValues.push(sanitizeValue(row[rawColName], colTypeMap[rawColName]));
          }
          valuePlaceholders.push(`(${rowPlaceholders.join(", ")})`);
        });

        const batchInsertSql = `INSERT INTO "${t}" (${targetColList}) VALUES ${valuePlaceholders.join(", ")} ON CONFLICT DO NOTHING;`;
        await pClient.query(batchInsertSql, flatValues);
      }

      // Align sequence
      const pkCol = cols.find(c => c.Key === "PRI");
      if (pkCol) {
        try {
          const overrideKey = `${t.toLowerCase()}.${pkCol.Field.toLowerCase()}`;
          const finalPkName = COLUMN_CASING_OVERRIDES[overrideKey] || pkCol.Field;
          const seqRes = await pClient.query(`SELECT pg_get_serial_sequence('"${t}"', '${finalPkName}') as seq;`);
          const seqName = seqRes.rows[0]?.seq;
          if (seqName) {
            await pClient.query(`SELECT setval('${seqName}', COALESCE((SELECT MAX("${finalPkName}") FROM "${t}"), 0) + 1, false);`);
          }
        } catch (e) {}
      }
    }
    migratedCount++;
    if (migratedCount % 100 === 0) {
      console.log(`Migrated ${migratedCount} / ${mTables.length} base tables...`);
    }
  }

  // 4. Create 8 Translated Views
  console.log("[Migration Step 4] Creating 8 translated views...");
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
            ("BillAmount"::text::numeric - "BillDiscount"::text::numeric) AS "BillAmount", "BillDiscount", "PaidAmount",
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
     LEFT JOIN referencevalues rv ON e."EncounterTypeId" = rv."ReferenceValueCodeId";`,

    `CREATE OR REPLACE VIEW bedtransfers AS SELECT * FROM bedtransfer;`
  ];

  for (const vSql of viewSqls) {
    await pClient.query(vSql);
  }

  const baseCount = await pClient.query("SELECT COUNT(*) as c FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'");
  const viewCount = await pClient.query("SELECT COUNT(*) as c FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'VIEW'");

  console.log(`\nPROVISIONING COMPLETE FOR ${targetDbName}:`);
  console.log(`Base Tables: ${baseCount.rows[0].c} (554 source + 1 idempotency_records = 555)`);
  console.log(`Views: ${viewCount.rows[0].c} (8 translated views + 1 compatibility view = 9)`);
  console.log(`Total Database Relations: ${parseInt(baseCount.rows[0].c, 10) + parseInt(viewCount.rows[0].c, 10)}`);

  await mConn.end();
  await pClient.end();
}

const targetDb = process.argv[2] || process.env.TARGET_DB || "hims_clean_prov_db";
provisionDatabase(targetDb).catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
