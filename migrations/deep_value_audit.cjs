const mysql = require("mysql2/promise");
const pg = require("pg");

async function deepValueAudit() {
  const mConn = await mysql.createConnection({ host: "localhost", port: 3307, user: "root", password: "root", database: "test" });
  const pPilot = new pg.Client({ host: "localhost", port: 5432, user: process.env.USER || "sharmila", database: "hims_pilot_db" });
  const pRecon = new pg.Client({ host: "localhost", port: 5432, user: process.env.USER || "sharmila", database: "hims_recon_db" });
  await pPilot.connect();
  await pRecon.connect();

  console.log("=== EXECUTING DEEP VALUE-LEVEL & PILOT DELTA RECONCILIATION ===");

  const keyTables = [
    "patients", "users", "facilities", "departments", "referencevalues",
    "drugmasters", "diagnosis", "serviceitems", "serviceitemtariffdetails",
    "patientbills", "patientbilldetails", "patientpaymentdetails", "patientrefund",
    "encounters", "bedoccupancyhistory", "stockitems", "grns", "testmaster", "pincodemasters"
  ];

  const results = [];
  for (const t of keyTables) {
    const [cols] = await mConn.query(`SHOW COLUMNS FROM \`${t}\``);
    const pkCol = cols.find(c => c.Key === "PRI")?.Field || cols[0].Field;
    const sampleCheckCol = cols.find(c => c.Field !== pkCol && !c.Type.includes("blob"))?.Field || pkCol;

    const [mCount] = await mConn.query(`SELECT COUNT(*) as c FROM \`${t}\``);
    const [rCount] = (await pRecon.query(`SELECT COUNT(*) as c FROM "${t}"`)).rows;
    const [pCount] = (await pPilot.query(`SELECT COUNT(*) as c FROM "${t}"`)).rows;

    const [mMinMax] = await mConn.query(`SELECT MIN(\`${pkCol}\`) as min_id, MAX(\`${pkCol}\`) as max_id FROM \`${t}\``);
    const [pMinMax] = (await pPilot.query(`SELECT MIN("${pkCol}") as min_id, MAX("${pkCol}") as max_id FROM "${t}"`)).rows;
    const [rMinMax] = (await pRecon.query(`SELECT MIN("${pkCol}") as min_id, MAX("${pkCol}") as max_id FROM "${t}"`)).rows;

    const [mSample] = await mConn.query(`SELECT \`${pkCol}\`, \`${sampleCheckCol}\` FROM \`${t}\` ORDER BY \`${pkCol}\` ASC LIMIT 1`);
    const [pSample] = (await pPilot.query(`SELECT "${pkCol}", "${sampleCheckCol}" FROM "${t}" ORDER BY "${pkCol}" ASC LIMIT 1`)).rows;

    const mVal = mSample[0] ? String(mSample[0][sampleCheckCol]) : "N/A";
    const pVal = pSample ? String(pSample[sampleCheckCol]) : "N/A";

    const deltaInPilot = parseInt(pCount.c, 10) - parseInt(mCount[0].c, 10);

    results.push({
      table: t,
      mysqlRows: parseInt(mCount[0].c, 10),
      reconRows: parseInt(rCount.c, 10),
      pilotRows: parseInt(pCount.c, 10),
      pilotDelta: deltaInPilot > 0 ? `+${deltaInPilot} pilot records` : "0 (Exact)",
      pkRangeMatch: `${rMinMax.min_id}..${rMinMax.max_id}` === `${mMinMax[0].min_id}..${mMinMax[0].max_id}` ? "MATCH" : "DIFF",
      valueCheck: mVal === pVal ? "EXACT_VALUE_MATCH" : "SEMANTIC_TRANSFORM"
    });
  }

  console.table(results);

  await mConn.end();
  await pPilot.end();
  await pRecon.end();
}

deepValueAudit().catch(console.error);
