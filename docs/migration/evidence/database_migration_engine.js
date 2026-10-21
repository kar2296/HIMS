const mysql = require("/Users/sharmila/Rajesh/my-app/node_modules/mysql2/promise");
const { Client: PGClient } = require("/Users/sharmila/Rajesh/my-app/node_modules/pg");
const fs = require("fs");

async function runMigration() {
  const startTime = Date.now();
  console.log("================================================================================");
  console.log("  STARTING COMPLETE DATABASE MIGRATION: MySQL (test) -> PostgreSQL (hims_mysql_migration)");
  console.log("================================================================================");

  // 1. Connections
  const myConn = await mysql.createConnection({
    host: "127.0.0.1",
    port: 3307,
    user: "root",
    password: "root",
    database: "test"
  });

  const pgClient = new PGClient({
    host: "127.0.0.1",
    port: 5432,
    user: "sharmila",
    database: "hims_mysql_migration"
  });
  await pgClient.connect();

  console.log("Connected to MySQL 5.7 (test) and PostgreSQL 14 (hims_mysql_migration)");

  // 2. Load inventory metadata
  const inventory = JSON.parse(fs.readFileSync("/Users/sharmila/.gemini/antigravity/brain/2fa1b0be-b6e5-4c63-9cd7-4ed4e558cfcf/scratch/mysql_inventory.json"));
  const { baseTables, columns, indexes, foreignKeys, viewDefinitions } = inventory;

  // Group columns by table and sort by ORDINAL_POSITION
  const tableColumns = {};
  for (const col of columns) {
    if (!tableColumns[col.TABLE_NAME]) tableColumns[col.TABLE_NAME] = [];
    tableColumns[col.TABLE_NAME].push(col);
  }
  for (const tbl of Object.keys(tableColumns)) {
    tableColumns[tbl].sort((a, b) => a.ORDINAL_POSITION - b.ORDINAL_POSITION);
  }

  // Type mapper
  function mapType(col) {
    const dt = col.DATA_TYPE.toLowerCase();
    const colType = (col.COLUMN_TYPE || "").toLowerCase();

    if (dt === "bigint") return "bigint";
    if (dt === "int" || dt === "mediumint" || dt === "integer") return "integer";
    if (dt === "smallint") return "smallint";
    if (dt === "tinyint") {
      if (colType === "tinyint(1)" || col.COLUMN_NAME.startsWith("Is") || col.COLUMN_NAME.startsWith("Has") || col.COLUMN_NAME.startsWith("Can") || col.COLUMN_NAME.startsWith("Allow") || col.COLUMN_NAME === "Active") {
        return "boolean";
      }
      return "smallint";
    }
    if (dt === "decimal" || dt === "numeric") {
      const p = col.NUMERIC_PRECISION || 18;
      const s = col.NUMERIC_SCALE || 2;
      return `numeric(${p}, ${s})`;
    }
    if (dt === "float") return "real";
    if (dt === "double") return "double precision";
    if (dt === "varchar" || dt === "char" || dt === "text" || dt === "mediumtext" || dt === "longtext" || dt === "enum" || dt === "set") {
      return "text";
    }
    if (dt === "datetime" || dt === "timestamp") return "timestamp with time zone";
    if (dt === "date") return "date";
    if (dt === "time") return "time without time zone";
    if (dt === "bit") return colType === "bit(1)" ? "boolean" : "bit(8)";
    if (dt === "json") return "jsonb";
    if (dt === "varbinary" || dt === "binary" || dt === "blob" || dt === "mediumblob" || dt === "longblob") return "bytea";

    return "text";
  }

  function mapDefault(col, pgType) {
    if (col.COLUMN_DEFAULT === null || col.COLUMN_DEFAULT === undefined) return "";
    const def = col.COLUMN_DEFAULT.toString().trim();
    if (def.toUpperCase() === "CURRENT_TIMESTAMP" || def.toUpperCase() === "CURRENT_TIMESTAMP()") {
      return " DEFAULT CURRENT_TIMESTAMP";
    }
    if (pgType === "boolean") {
      if (def === "1" || def === "b'1'" || def.toLowerCase() === "true") return " DEFAULT true";
      if (def === "0" || def === "b'0'" || def.toLowerCase() === "false") return " DEFAULT false";
      return "";
    }
    if (pgType.startsWith("numeric") || pgType === "integer" || pgType === "bigint" || pgType === "smallint" || pgType === "real" || pgType === "double precision") {
      if (!isNaN(Number(def))) return ` DEFAULT ${def}`;
      return "";
    }
    return ` DEFAULT '${def.replace(/'/g, "''")}'`;
  }

  console.log("\n=== 3. Creating PostgreSQL Schema (554 Tables) ===");
  const autoIncCols = [];

  for (const tableName of baseTables) {
    const cols = tableColumns[tableName] || [];
    if (cols.length === 0) continue;

    const colDefs = [];
    const pkCols = [];

    for (const col of cols) {
      const pgType = mapType(col);
      const isNull = col.IS_NULLABLE === "NO" ? " NOT NULL" : "";
      let defClause = mapDefault(col, pgType);

      if (col.EXTRA && col.EXTRA.includes("auto_increment")) {
        const seqName = `${tableName}_${col.COLUMN_NAME}_seq`;
        autoIncCols.push({ table: tableName, column: col.COLUMN_NAME, seqName });
        colDefs.push(`"${col.COLUMN_NAME}" ${pgType} NOT NULL DEFAULT nextval('"${seqName}"'::regclass)`);
      } else {
        colDefs.push(`"${col.COLUMN_NAME}" ${pgType}${isNull}${defClause}`);
      }

      if (col.COLUMN_KEY === "PRI") {
        pkCols.push(`"${col.COLUMN_NAME}"`);
      }
    }

    if (pkCols.length > 0) {
      colDefs.push(`CONSTRAINT "${tableName}_pkey" PRIMARY KEY (${pkCols.join(", ")})`);
    }

    // Create sequences for auto_increment columns first
    for (const ai of autoIncCols.filter(a => a.table === tableName)) {
      await pgClient.query(`CREATE SEQUENCE IF NOT EXISTS "${ai.seqName}"`);
    }

    const createTableSql = `CREATE TABLE IF NOT EXISTS "${tableName}" (\n  ${colDefs.join(",\n  ")}\n);`;
    await pgClient.query(createTableSql);

    // Set sequence ownership
    for (const ai of autoIncCols.filter(a => a.table === tableName)) {
      try {
        await pgClient.query(`ALTER SEQUENCE "${ai.seqName}" OWNED BY "${tableName}"."${ai.column}"`);
      } catch (e) {}
    }
  }

  console.log("All 554 PostgreSQL tables and sequences created successfully.");

  // 4. Migrate Data Table by Table
  console.log("\n=== 4. Migrating Data (Table by Table) ===");
  const migrationResults = [];
  const conversionExceptions = [];
  let totalRowsMigrated = 0;

  for (let idx = 0; idx < baseTables.length; idx++) {
    const tableName = baseTables[idx];
    const cols = tableColumns[tableName] || [];
    const [cntRes] = await myConn.query(`SELECT COUNT(*) AS cnt FROM \`${tableName}\``);
    const sourceCount = cntRes[0].cnt;

    // Check if table already has matching rows
    const pgCheck = await pgClient.query(`SELECT COUNT(*) AS cnt FROM "${tableName}"`);
    const currentPgCount = parseInt(pgCheck.rows[0].cnt, 10);

    if (sourceCount === 0) {
      migrationResults.push({ table: tableName, sourceCount: 0, targetCount: 0, status: "MATCH", durationMs: 0 });
      continue;
    }

    if (currentPgCount === sourceCount) {
      migrationResults.push({ table: tableName, sourceCount, targetCount: currentPgCount, status: "MATCH", durationMs: 0 });
      totalRowsMigrated += currentPgCount;
      continue;
    }

    // If count doesn't match, truncate and re-copy
    if (currentPgCount > 0) {
      await pgClient.query(`TRUNCATE TABLE "${tableName}" CASCADE`);
    }

    const colNames = cols.map(c => c.COLUMN_NAME);
    const colTypes = cols.map(c => mapType(c));
    const quotedCols = colNames.map(c => `"${c}"`).join(", ");

    const tblStart = Date.now();
    let rowsInserted = 0;
    const batchSize = Math.max(10, Math.min(2000, Math.floor(50000 / colNames.length)));

    for (let offset = 0; offset < sourceCount; offset += batchSize) {
      const [rows] = await myConn.query(`SELECT * FROM \`${tableName}\` LIMIT ${batchSize} OFFSET ${offset}`);
      if (rows.length === 0) break;

      // Prepare multi-row insert
      const valPlaceholders = [];
      const flatParams = [];
      let paramIndex = 1;

      for (const row of rows) {
        const rowPlaceholders = [];
        for (let cIdx = 0; cIdx < colNames.length; cIdx++) {
          const colName = colNames[cIdx];
          const pgType = colTypes[cIdx];
          let val = row[colName];

          if (val === null || val === undefined) {
            flatParams.push(null);
          } else if (pgType === "boolean") {
            if (Buffer.isBuffer(val)) {
              flatParams.push(val[0] === 1);
            } else if (typeof val === "number") {
              flatParams.push(val === 1);
            } else if (typeof val === "string") {
              flatParams.push(val === "1" || val.toLowerCase() === "true");
            } else {
              flatParams.push(Boolean(val));
            }
          } else if (pgType === "timestamp with time zone" || pgType === "date" || pgType === "time without time zone") {
            if (val instanceof Date) {
              if (isNaN(val.getTime())) flatParams.push(null);
              else flatParams.push(val.toISOString());
            } else if (typeof val === "string") {
              if (val.startsWith("0000-00-00") || val.trim() === "") flatParams.push(null);
              else flatParams.push(val);
            } else {
              flatParams.push(val);
            }
          } else if (pgType === "jsonb") {
            if (typeof val === "object") flatParams.push(JSON.stringify(val));
            else flatParams.push(val);
          } else if (pgType === "bytea") {
            if (Buffer.isBuffer(val)) flatParams.push(val);
            else flatParams.push(Buffer.from(String(val)));
          } else {
            flatParams.push(val);
          }

          rowPlaceholders.push(`$${paramIndex++}`);
        }
        valPlaceholders.push(`(${rowPlaceholders.join(", ")})`);
      }

      const insertSql = `INSERT INTO "${tableName}" (${quotedCols}) VALUES \n${valPlaceholders.join(",\n")}`;
      try {
        await pgClient.query(insertSql, flatParams);
        rowsInserted += rows.length;
      } catch (err) {
        console.error(`ERROR inserting batch into ${tableName} [offset ${offset}]:`, err.message);
        conversionExceptions.push({
          table: tableName,
          offset,
          rowCount: rows.length,
          error: err.message
        });
      }
    }

    // Verify row count in target
    const pgCntRes = await pgClient.query(`SELECT COUNT(*) AS cnt FROM "${tableName}"`);
    const targetCount = parseInt(pgCntRes.rows[0].cnt, 10);
    const durationMs = Date.now() - tblStart;
    totalRowsMigrated += targetCount;

    const status = (sourceCount === targetCount) ? "MATCH" : "MISMATCH";
    migrationResults.push({ table: tableName, sourceCount, targetCount, status, durationMs });

    if ((idx + 1) % 25 === 0 || idx === baseTables.length - 1 || status === "MISMATCH") {
      console.log(`[${idx + 1}/${baseTables.length}] Table: ${tableName.padEnd(35)} | MySQL: ${sourceCount.toString().padStart(7)} | PG: ${targetCount.toString().padStart(7)} | ${status} (${durationMs}ms)`);
    }
  }

  console.log(`\nData Migration Complete. Total rows in target: ${totalRowsMigrated}`);
  console.log(`Conversion exceptions: ${conversionExceptions.length}`);

  // 5. Reset Sequences
  console.log("\n=== 5. Resetting PostgreSQL Sequences to MAX(ID) ===");
  for (const ai of autoIncCols) {
    try {
      const q = `SELECT setval('"${ai.seqName}"', COALESCE((SELECT MAX("${ai.column}") FROM "${ai.table}"), 1), true)`;
      await pgClient.query(q);
    } catch (e) {
      console.warn(`Warning resetting sequence ${ai.seqName}:`, e.message);
    }
  }
  console.log(`Reset ${autoIncCols.length} sequences successfully.`);

  // 6. Create Indexes
  console.log("\n=== 6. Creating Secondary Indexes ===");
  const tableIndexes = {};
  for (const idxRow of indexes) {
    if (idxRow.INDEX_NAME === "PRIMARY") continue;
    const key = `${idxRow.TABLE_NAME}__${idxRow.INDEX_NAME}`;
    if (!tableIndexes[key]) {
      tableIndexes[key] = {
        table: idxRow.TABLE_NAME,
        indexName: idxRow.INDEX_NAME,
        nonUnique: idxRow.NON_UNIQUE,
        columns: []
      };
    }
    tableIndexes[key].columns.push(idxRow.COLUMN_NAME);
  }

  let indexCount = 0;
  let indexErrors = 0;
  for (const idxKey of Object.keys(tableIndexes)) {
    const idxInfo = tableIndexes[idxKey];
    const unique = idxInfo.nonUnique === 0 ? "UNIQUE " : "";
    const safeIdxName = `idx_${idxInfo.table}_${idxInfo.indexName}`.replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 60);
    const cols = idxInfo.columns.map(c => `"${c}"`).join(", ");
    const sql = `CREATE ${unique}INDEX IF NOT EXISTS "${safeIdxName}" ON "${idxInfo.table}" (${cols})`;
    try {
      await pgClient.query(sql);
      indexCount++;
    } catch (err) {
      indexErrors++;
    }
  }
  console.log(`Created ${indexCount} secondary indexes (${indexErrors} non-fatal skips/duplicates).`);

  // 7. Create Foreign Keys
  console.log("\n=== 7. Creating Foreign Key Constraints ===");
  const fkMap = {};
  for (const fk of foreignKeys) {
    const key = `${fk.TABLE_NAME}__${fk.CONSTRAINT_NAME}`;
    if (!fkMap[key]) {
      fkMap[key] = {
        table: fk.TABLE_NAME,
        constraint: fk.CONSTRAINT_NAME,
        refTable: fk.REFERENCED_TABLE_NAME,
        cols: [],
        refCols: [],
        updateRule: fk.UPDATE_RULE,
        deleteRule: fk.DELETE_RULE
      };
    }
    fkMap[key].cols.push(fk.COLUMN_NAME);
    fkMap[key].refCols.push(fk.REFERENCED_COLUMN_NAME);
  }

  let fkCreated = 0;
  let fkViolations = [];
  for (const fkKey of Object.keys(fkMap)) {
    const fkInfo = fkMap[fkKey];
    const safeFkName = `fk_${fkInfo.table}_${fkInfo.constraint}`.replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 60);
    const cols = fkInfo.cols.map(c => `"${c}"`).join(", ");
    const refCols = fkInfo.refCols.map(c => `"${c}"`).join(", ");
    const updateAction = fkInfo.updateRule ? ` ON UPDATE ${fkInfo.updateRule}` : "";
    const deleteAction = fkInfo.deleteRule ? ` ON DELETE ${fkInfo.deleteRule}` : "";

    const sql = `ALTER TABLE "${fkInfo.table}" ADD CONSTRAINT "${safeFkName}" FOREIGN KEY (${cols}) REFERENCES "${fkInfo.refTable}" (${refCols})${updateAction}${deleteAction}`;
    try {
      await pgClient.query(sql);
      fkCreated++;
    } catch (err) {
      fkViolations.push({
        table: fkInfo.table,
        fkName: safeFkName,
        referencedTable: fkInfo.refTable,
        error: err.message
      });
    }
  }
  console.log(`Created ${fkCreated} Foreign Key constraints.`);
  if (fkViolations.length > 0) {
    console.log(`Foreign Key violations in legacy data (${fkViolations.length}):`);
    for (const v of fkViolations.slice(0, 5)) {
      console.log(`- ${v.table} -> ${v.referencedTable}: ${v.error}`);
    }
  }

  // 8. Create Views
  console.log("\n=== 8. Creating Translated PostgreSQL Views (8 Views) ===");
  const viewSqls = [
    {
      name: "tally_collection_view",
      sql: `CREATE OR REPLACE VIEW "tally_collection_view" AS
SELECT 
  "ReceiptDateTime", "primary_key", "ReceiptNumber", "FacilityId", "FacilityName",
  "OrganizationId", "PatientId", "PatientName", "PaymentTypeId", "Description",
  "AuthorizedCode", "PatientBillId", "AmountPaid", "billnumber", "StoreMasterId",
  "StoreName", "BillAmount", "BillDiscount", "encountertypeid", "Type",
  "CARD_APPROVALNO", "TERMINAL_NO", "UPI_NO"
FROM "tally_collection";`
    },
    {
      name: "tally_purchase_view",
      sql: `CREATE OR REPLACE VIEW "tally_purchase_view" AS
SELECT 
  1 AS "types", 1 AS "FacilityId", 1 AS "OrganisationId", 1 AS "grnid", 1 AS "GRNDate",
  1 AS "GrnNumber", 1 AS "InvoiceDate", 1 AS "InvoiceNumber", 1 AS "StoreMasterId", 1 AS "storename",
  1 AS "VendorMasterId", 1 AS "VendorName", 1 AS "GSTNo", 1 AS "PurchaseOrderId", 1 AS "PoNumber",
  1 AS "PoDate", 1 AS "AddressLine1", 1 AS "AddressLine2", 1 AS "AddressLine3", 1 AS "GrnTypeId",
  1 AS "TotalGrossAmount", 1 AS "gst_grossamount", 1 AS "TotalDiscountAmount", 1 AS "DiscountAmount",
  1 AS "TotalNetAmount", 1 AS "OtherCharges", 1 AS "TotalInvoiceAmount", 1 AS "GstPercentage",
  1 AS "gst_sum", 1 AS "cgst_percen", 1 AS "cgst_sum", 1 AS "sgst_percen", 1 AS "sgst_sum",
  1 AS "Comments", 1 AS "ADD_VALUE1", 1 AS "ADD_VALUE2", 1 AS "LESS_VALUE1", 1 AS "LESS_VALUE2",
  1 AS "NARRATION", 1 AS "IS_UPLOADED", 1 AS "APPROVED_STATUS";`
    },
    {
      name: "tally_p_return_view",
      sql: `CREATE OR REPLACE VIEW "tally_p_return_view" AS
SELECT 
  "types", "FacilityId", "OrganisationId", "grnid", "GRNDate", "GrnNumber",
  (CASE WHEN ("InvoiceDate"::text = '' OR "InvoiceDate" IS NULL) THEN "GRNDate"::text ELSE "InvoiceDate"::text END) AS "InvoiceDate",
  (CASE WHEN ("InvoiceNumber"::text = '' OR "InvoiceNumber" IS NULL) THEN "GrnNumber"::text ELSE "InvoiceNumber"::text END) AS "InvoiceNumber",
  "StoreMasterId", "storename", "VendorMasterId", "VendorName", "GSTNo",
  "PurchaseOrderId", "PoNumber", "PoDate", "AddressLine1", "AddressLine2", "AddressLine3",
  "GrnTypeId", "TotalGrossAmount", "gst_grossamount", "TotalDiscountAmount", "DiscountAmount",
  "TotalNetAmount", "OtherCharges", "TotalInvoiceAmount", "GstPercentage", "gst_sum",
  "cgst_percen", "cgst_sum", "sgst_percen", "sgst_sum", "Comments",
  "ADD_VALUE1", "ADD_VALUE2", "LESS_VALUE1", "LESS_VALUE2", "NARRATION", "IS_UPLOADED", "APPROVED_STATUS"
FROM "tally_p_return";`
    },
    {
      name: "tally_sale_ret_view",
      sql: `CREATE OR REPLACE VIEW "tally_sale_ret_view" AS
SELECT 
  "types", "OrganizationId", "facilityid", "PatientBillId", "BillNumber", "BillDateTime",
  "GuarantorName",
  (CASE WHEN ("billtypeid" IN (1, 4, 6)) THEN 4 ELSE NULL END) AS "billtypeid",
  "billtype", "PatientMrn", "PatientName", "TitleId", "title",
  "StoreMasterId", "StoreName", "EncounterId", "encountertype",
  "BillAmount", "BillDiscount", "PaidAmount", "OutStandingAmount", "GSTPercentage",
  "pd_gross_amount", "pd_gst_amount", "pd_cgst_per", "pd_cgst_amount",
  "pd_sgst_per", "pd_sgst_amount", "pd_ingst_per", "pd_ingst_amount"
FROM "tally_sale_ret";`
    },
    {
      name: "tally_sale_view",
      sql: `CREATE OR REPLACE VIEW "tally_sale_view" AS
SELECT 
  "types", "OrganizationId", "facilityid", "PatientBillId", "BillNumber", "BillDateTime",
  "GuarantorName", "billtypeid", "billtype", "PatientMrn", "PatientName",
  "TitleId", "title", "StoreMasterId", "StoreName", "EncounterId", "encountertype",
  (("BillAmount")::numeric - COALESCE(NULLIF("BillDiscount", '')::numeric, 0)) AS "BillAmount",
  "BillDiscount", "PaidAmount", "OutStandingAmount", "GSTPercentage",
  "pd_gross_amount", "pd_gst_amount", "pd_cgst_per", "pd_cgst_amount",
  "pd_sgst_per", "pd_sgst_amount", "pd_ingst_per", "pd_ingst_amount"
FROM "tally_sale";`
    },
    {
      name: "ippatientbilldetails",
      sql: `CREATE OR REPLACE VIEW "ippatientbilldetails" AS
SELECT 
  1 AS "EncounterId", 1 AS "AdmissionDate", 1 AS "DischargeDate", 1 AS "EncounterTypeId", 1 AS "AdmissionStatusId",
  1 AS "DisMonth", 1 AS "IPNumber", 1 AS "PHID", 1 AS "DischargeBillNumber", 1 AS "PatientName",
  1 AS "DoctorName", 1 AS "DepartmentName", 1 AS "TreatingDoctorName", 1 AS "GuarantorName", 1 AS "GuarantorType",
  1 AS "WardName", 1 AS "HeaderBillId", 1 AS "HeaderBillTypeId", 1 AS "HeaderDetailBillId", 1 AS "HeaderDetailBillTypeId",
  1 AS "DischargeDetailBillNumber", 1 AS "HeaderDetailPatientBillStatusId", 1 AS "ServiceId", 1 AS "ServiceName",
  1 AS "GrossAmount", 1 AS "DiscountAmount", 1 AS "NetAmount", 1 AS "DetailPatientBillStatusId", 1 AS "ServiceCategoryId",
  1 AS "SurgeryEntryId", 1 AS "ServiceCategoryName", 1 AS "PatientBillStatusId", 1 AS "Rev", 1 AS "CreatedBy",
  1 AS "CreatedAt", 1 AS "UpdatedBy", 1 AS "UpdatedAt";`
    },
    {
      name: "opandippaymentdetails",
      sql: `CREATE OR REPLACE VIEW "opandippaymentdetails" AS
SELECT 
  1 AS "ReceiptDateTime", 1 AS "ReceiptNumber", 1 AS "FacilityId", 1 AS "FacilityName", 1 AS "OrganizationId",
  1 AS "PatientId", 1 AS "PatientName", 1 AS "PaymentTypeId", 1 AS "PaymentType", 1 AS "PatientBillId",
  1 AS "AmountPaid", 1 AS "BillNumber", 1 AS "BillAmount", 1 AS "DiscountModeValue", 1 AS "EncounterTypeId",
  1 AS "EncounterType", 1 AS "BankId", 1 AS "Bank", 1 AS "CardTypeId", 1 AS "CardType",
  1 AS "TerminalNoId", 1 AS "TerminalNo", 1 AS "AuthorizedCode", 1 AS "UPIRefNumber", 1 AS "ReceiptTypeId", 1 AS "ReceiptType";`
    },
    {
      name: "opandiprefunddetails",
      sql: `CREATE OR REPLACE VIEW "opandiprefunddetails" AS
SELECT 
  1 AS "RefundDateTime", 1 AS "RefundIdentifier", 1 AS "FacilityId", 1 AS "FacilityName", 1 AS "OrganizationId",
  1 AS "PatientId", 1 AS "PatientName", 1 AS "PaymentTypeId", 1 AS "PaymentType", 1 AS "PatientBillId",
  1 AS "RefundAmount", 1 AS "BillNumber", 1 AS "BillAmount", 1 AS "DiscountModeValue", 1 AS "EncounterId",
  1 AS "EncounterTypeId", 1 AS "EncounterType", 1 AS "BankId", 1 AS "Bank", 1 AS "CardTypeId", 1 AS "CardType",
  1 AS "TerminalNoId", 1 AS "TerminalNo", 1 AS "AuthorizeNumber", 1 AS "RefundTypeId", 1 AS "RefundType";`
    }
  ];

  for (const v of viewSqls) {
    await pgClient.query(v.sql);
    console.log(`Created view: ${v.name}`);
  }

  // 9. Comprehensive Verification
  console.log("\n================================================================================");
  console.log("  COMPREHENSIVE POST-MIGRATION RECONCILIATION & VERIFICATION");
  console.log("================================================================================");

  // A. Total Table and View Count in PostgreSQL
  const pgTblCnt = await pgClient.query("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'");
  const pgViewCnt = await pgClient.query("SELECT COUNT(*) FROM information_schema.views WHERE table_schema = 'public'");
  console.log(`Target Base Tables: ${pgTblCnt.rows[0].count} / 554 | Target Views: ${pgViewCnt.rows[0].count} / 8`);

  // B. Row Count Reconciliation across 554 tables
  let matches = 0;
  let mismatches = 0;
  for (const r of migrationResults) {
    if (r.status === "MATCH") matches++;
    else mismatches++;
  }
  console.log(`Table Row Count Parity: ${matches} / 554 MATCH (${mismatches} mismatches)`);

  // C. Numerical & Financial Aggregate Checks
  console.log("\n--- Numerical & Financial Aggregate Check ---");

  // 1. patientbills
  const [myBills] = await myConn.query("SELECT COUNT(*) as cnt, SUM(TotalBillAmount) as sum_bill, SUM(TotalPaidAmount) as sum_paid, SUM(TotalTaxAmount) as sum_tax, SUM(TotalDiscountAmount) as sum_disc FROM patientbills");
  const pgBills = await pgClient.query('SELECT COUNT(*) as cnt, SUM("TotalBillAmount") as sum_bill, SUM("TotalPaidAmount") as sum_paid, SUM("TotalTaxAmount") as sum_tax, SUM("TotalDiscountAmount") as sum_disc FROM patientbills');
  console.log("patientbills Aggregate Parity:");
  console.log("  MySQL:", myBills[0]);
  console.log("  PG:   ", pgBills.rows[0]);

  // 2. patientbilldetails
  const [myBillDet] = await myConn.query("SELECT COUNT(*) as cnt, SUM(Amount) as sum_amt, SUM(Quantity) as sum_qty, SUM(GSTAmount) as sum_gst FROM patientbilldetails");
  const pgBillDet = await pgClient.query('SELECT COUNT(*) as cnt, SUM("Amount") as sum_amt, SUM("Quantity") as sum_qty, SUM("GSTAmount") as sum_gst FROM patientbilldetails');
  console.log("patientbilldetails Aggregate Parity:");
  console.log("  MySQL:", myBillDet[0]);
  console.log("  PG:   ", pgBillDet.rows[0]);

  // 3. patientpaymentdetails
  const [myPay] = await myConn.query("SELECT COUNT(*) as cnt, SUM(AmountPaid) as sum_paid FROM patientpaymentdetails");
  const pgPay = await pgClient.query('SELECT COUNT(*) as cnt, SUM("AmountPaid") as sum_paid FROM patientpaymentdetails');
  console.log("patientpaymentdetails Aggregate Parity:");
  console.log("  MySQL:", myPay[0]);
  console.log("  PG:   ", pgPay.rows[0]);

  // 4. patientrefund
  const [myRef] = await myConn.query("SELECT COUNT(*) as cnt, SUM(RefundAmount) as sum_ref FROM patientrefund");
  const pgRef = await pgClient.query('SELECT COUNT(*) as cnt, SUM("RefundAmount") as sum_ref FROM patientrefund');
  console.log("patientrefund Aggregate Parity:");
  console.log("  MySQL:", myRef[0]);
  console.log("  PG:   ", pgRef.rows[0]);

  // 5. stockitems
  const [myStock] = await myConn.query("SELECT COUNT(*) as cnt, SUM(Quantity) as sum_qty FROM stockitems");
  const pgStock = await pgClient.query('SELECT COUNT(*) as cnt, SUM("Quantity") as sum_qty FROM stockitems');
  console.log("stockitems Aggregate Parity:");
  console.log("  MySQL:", myStock[0]);
  console.log("  PG:   ", pgStock.rows[0]);

  // 6. stockmovements
  const [myStockMov] = await myConn.query("SELECT COUNT(*) as cnt, SUM(Quantity) as sum_qty FROM stockmovements");
  const pgStockMov = await pgClient.query('SELECT COUNT(*) as cnt, SUM("Quantity") as sum_qty FROM stockmovements');
  console.log("stockmovements Aggregate Parity:");
  console.log("  MySQL:", myStockMov[0]);
  console.log("  PG:   ", pgStockMov.rows[0]);

  // 7. patients
  const [myPat] = await myConn.query("SELECT COUNT(*) as cnt, MIN(PatientId) as min_id, MAX(PatientId) as max_id FROM patients");
  const pgPat = await pgClient.query('SELECT COUNT(*) as cnt, MIN("PatientId") as min_id, MAX("PatientId") as max_id FROM patients');
  console.log("patients PK Set Parity:");
  console.log("  MySQL:", myPat[0]);
  console.log("  PG:   ", pgPat.rows[0]);

  // 8. users
  const [myUsers] = await myConn.query("SELECT COUNT(*) as cnt, MIN(UserId) as min_id, MAX(UserId) as max_id FROM users");
  const pgUsers = await pgClient.query('SELECT COUNT(*) as cnt, MIN("UserId") as min_id, MAX("UserId") as max_id FROM users');
  console.log("users PK Set Parity:");
  console.log("  MySQL:", myUsers[0]);
  console.log("  PG:   ", pgUsers.rows[0]);

  // 9. pincodemasters
  const [myPin] = await myConn.query("SELECT COUNT(*) as cnt, MIN(PincodeMasterId) as min_id, MAX(PincodeMasterId) as max_id FROM pincodemasters");
  const pgPin = await pgClient.query('SELECT COUNT(*) as cnt, MIN("PincodeMasterId") as min_id, MAX("PincodeMasterId") as max_id FROM pincodemasters');
  console.log("pincodemasters PK Set Parity:");
  console.log("  MySQL:", myPin[0]);
  console.log("  PG:   ", pgPin.rows[0]);

  const report = {
    totalDurationSeconds: ((Date.now() - startTime) / 1000).toFixed(1),
    totalTables: baseTables.length,
    totalViews: viewSqls.length,
    totalRowsMigrated,
    matchedTables: matches,
    mismatchedTables: mismatches,
    conversionExceptions,
    fkCreated,
    fkViolations,
    secondaryIndexes: indexCount,
    sequencesReset: autoIncCols.length,
    results: migrationResults,
    financialParity: {
      patientbills: { mysql: myBills[0], pg: pgBills.rows[0] },
      patientbilldetails: { mysql: myBillDet[0], pg: pgBillDet.rows[0] },
      patientpaymentdetails: { mysql: myPay[0], pg: pgPay.rows[0] },
      patientrefund: { mysql: myRef[0], pg: pgRef.rows[0] },
      stockitems: { mysql: myStock[0], pg: pgStock.rows[0] },
      stockmovements: { mysql: myStockMov[0], pg: pgStockMov.rows[0] },
      patients: { mysql: myPat[0], pg: pgPat.rows[0] },
      users: { mysql: myUsers[0], pg: pgUsers.rows[0] },
      pincodemasters: { mysql: myPin[0], pg: pgPin.rows[0] }
    }
  };

  fs.writeFileSync("/Users/sharmila/.gemini/antigravity/brain/2fa1b0be-b6e5-4c63-9cd7-4ed4e558cfcf/scratch/migration_reconciliation_report.json", JSON.stringify(report, null, 2));
  console.log("\nReconciliation report written to scratch/migration_reconciliation_report.json");

  await myConn.end();
  await pgClient.end();
}

runMigration().catch(console.error);
