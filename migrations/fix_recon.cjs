const mysql = require("mysql2/promise");
const pg = require("pg");

async function fixReconDb() {
  const mConn = await mysql.createConnection({ host: "localhost", port: 3307, user: "root", password: "root", database: "test" });
  const pClient = new pg.Client({ host: "localhost", port: 5432, user: process.env.USER || "sharmila", database: "hims_recon_db" });
  await pClient.connect();

  const tablesToFix = ["my_programming", "patientbills", "patienttrackers", "servicegroupratemapping", "serviceratecategories", "mytable"];

  for (const t of tablesToFix) {
    console.log(`Patching ${t} in hims_recon_db...`);
    await pClient.query(`DROP TABLE IF EXISTS "${t}" CASCADE;`);
    const [cols] = await mConn.query(`SHOW COLUMNS FROM \`${t}\``);
    const colDefs = cols.map(c => {
      const type = c.Type.toLowerCase();
      let pgType = "TEXT";
      if (c.Key === "PRI" && c.Extra?.includes("auto_increment")) {
        pgType = type.includes("bigint") ? "BIGSERIAL PRIMARY KEY" : "SERIAL PRIMARY KEY";
      } else if (type.startsWith("bigint")) pgType = "BIGINT";
      else if (type.startsWith("int") || type.startsWith("mediumint") || type.startsWith("smallint") || type.startsWith("tinyint")) pgType = "INTEGER";
      else if (type.startsWith("varchar") || type.startsWith("char")) pgType = c.Type.toUpperCase();
      else if (type.includes("decimal") || type.includes("numeric") || type.includes("double") || type.includes("float")) pgType = "NUMERIC(18,6)";
      else if (type.includes("datetime") || type.includes("timestamp")) pgType = "TIMESTAMP WITHOUT TIME ZONE";
      else if (type.includes("date")) pgType = "DATE";
      else if (type.includes("time")) pgType = "TIME WITHOUT TIME ZONE";
      return `"${c.Field}" ${pgType}`;
    });

    await pClient.query(`CREATE TABLE "${t}" (\n  ${colDefs.join(",\n  ")}\n);`);

    const [rows] = await mConn.query(`SELECT * FROM \`${t}\``);
    if (rows.length > 0) {
      const colNames = Object.keys(rows[0]);
      const colList = colNames.map(c => `"${c}"`).join(", ");
      const numCols = colNames.length;
      const batchSize = 200;
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        const placeholders = [];
        const values = [];
        batch.forEach((r, rIdx) => {
          const rowPl = [];
          for (let cIdx = 0; cIdx < numCols; cIdx++) {
            rowPl.push(`$${(rIdx * numCols) + cIdx + 1}`);
            let val = r[colNames[cIdx]];
            if (typeof val === "string") val = val.replace(/\0/g, "");
            if (Buffer.isBuffer(val)) val = val.toString("utf8").replace(/\0/g, "");
            values.push(val);
          }
          placeholders.push(`(${rowPl.join(", ")})`);
        });
        await pClient.query(`INSERT INTO "${t}" (${colList}) VALUES ${placeholders.join(", ")};`, values);
      }
    }
    const [pCnt] = (await pClient.query(`SELECT COUNT(*) as c FROM "${t}"`)).rows;
    console.log(`Patched ${t}: MySQL = ${rows.length}, PG = ${pCnt.c}`);
  }

  // Also recreate the 2 views in hims_recon_db
  await pClient.query(`
    CREATE OR REPLACE VIEW opandiprefunddetails AS
    SELECT r."RefundDateTime", r."RefundIdentifier", r."FacilityId",
           f."FacilityName", 1::bigint AS "OrganizationId",
           r."PatientId", r."PatientName",
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
    LEFT JOIN facilities f ON r."FacilityId" = f."FacilityId"
    LEFT JOIN referencevalues rv ON e."EncounterTypeId" = rv."ReferenceValueCodeId";
  `);

  await pClient.query(`
    CREATE OR REPLACE VIEW ippatientbilldetails AS
    SELECT e."EncounterId", e."AdmissionDate", e."DischargeDate", e."EncounterTypeId", e."AdmissionStatusId",
           TO_CHAR(e."DischargeDate", 'YYYY-MM') AS "DisMonth",
           e."EncounterId"::text AS "IPNumber", b."PatientMrn" AS "PHID",
           b."BillNumber" AS "DischargeBillNumber",
           b."PatientName",
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
    LEFT JOIN patientbilldetails bd ON b."PatientBillId" = bd."PatientBillId"
    LEFT JOIN users u ON e."DoctorId" = u."UserId"
    LEFT JOIN departments d ON e."DepartmentId" = d."DepartmentId"
    LEFT JOIN wardmaster w ON e."WardId" = w."WardId"
    LEFT JOIN servicecategories sc ON bd."ServiceCategoryId" = sc."ServiceCategoryId"
    LEFT JOIN encounterguarantors eg ON e."EncounterId" = eg."EncounterId"
    LEFT JOIN guarantors g ON eg."GuarantorId" = g."GuarantorId"
    LEFT JOIN referencevalues rv ON g."GuarantorTypeId" = rv."ReferenceValueCodeId";
  `);

  const [finalTables] = (await pClient.query("SELECT COUNT(*) as c FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE'")).rows;
  const [finalViews] = (await pClient.query("SELECT COUNT(*) as c FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'VIEW'")).rows;
  console.log(`\nRehearsal DB (hims_recon_db) final verified counts: Base Tables = ${finalTables.c}, Views = ${finalViews.c}`);

  await mConn.end();
  await pClient.end();
}

fixReconDb().catch(console.error);
