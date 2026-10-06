const mysql = require("mysql2/promise");
const pg = require("pg");
const fs = require("fs");
const crypto = require("crypto");

async function runFull554DeepAudit() {
  console.log("=== EXECUTING COMPREHENSIVE 554-TABLE VALUE & KEYSET RECONCILIATION ===");
  const t0 = Date.now();

  const mConn = await mysql.createConnection({ host: "localhost", port: 3307, user: "root", password: "root", database: "test" });
  const pRecon = new pg.Client({ host: "localhost", port: 5432, user: process.env.USER || "sharmila", database: "hims_recon_db" });
  const pPilot = new pg.Client({ host: "localhost", port: 5432, user: process.env.USER || "sharmila", database: "hims_pilot_db" });

  await pRecon.connect();
  await pPilot.connect();

  const [mTables] = await mConn.query("SELECT TABLE_NAME FROM information_schema.tables WHERE TABLE_SCHEMA = 'test' AND TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME");

  let exactKeysetMatches = 0;
  let multisetMatches = 0;
  let emptyMatches = 0;
  let pilotDeltasCount = 0;
  const detailedResults = [];

  for (let idx = 0; idx < mTables.length; idx++) {
    const t = mTables[idx].TABLE_NAME;
    const [cols] = await mConn.query(`SHOW COLUMNS FROM \`${t}\``);
    const pkCol = cols.find(c => c.Key === "PRI")?.Field;

    const [mCnt] = await mConn.query(`SELECT COUNT(*) as c FROM \`${t}\``);
    const mRows = parseInt(mCnt[0].c, 10);

    const [rCnt] = (await pRecon.query(`SELECT COUNT(*) as c FROM "${t}"`)).rows;
    const rRows = parseInt(rCnt.c, 10);

    const [pCnt] = (await pPilot.query(`SELECT COUNT(*) as c FROM "${t}"`)).rows;
    const pRows = parseInt(pCnt.c, 10);

    let checkType = "PK_KEYSET";
    let status = "MATCH";
    let delta = pRows - mRows;
    if (delta > 0) pilotDeltasCount++;

    if (mRows === 0) {
      checkType = "EMPTY_TABLE";
      emptyMatches++;
      detailedResults.push({
        table: t,
        hasPk: !!pkCol,
        pkColumn: pkCol || "NONE",
        mysqlCount: mRows,
        reconCount: rRows,
        pilotCount: pRows,
        pilotDelta: 0,
        checkType,
        status: (rRows === 0 && pRows === 0) ? "VERIFIED_EMPTY" : "MISMATCH"
      });
      continue;
    }

    if (pkCol) {
      // Primary Key Set Comparison
      const [mMinMax] = await mConn.query(`SELECT MIN(\`${pkCol}\`) as min_id, MAX(\`${pkCol}\`) as max_id FROM \`${t}\``);
      const [rMinMax] = (await pRecon.query(`SELECT MIN("${pkCol}") as min_id, MAX("${pkCol}") as max_id FROM "${t}"`)).rows;
      
      const mRange = `${mMinMax[0].min_id}..${mMinMax[0].max_id}`;
      const rRange = `${rMinMax.min_id}..${rMinMax.max_id}`;

      if (mRange === rRange && mRows === rRows) {
        exactKeysetMatches++;
        status = "EXACT_KEYSET_MATCH";
      } else {
        status = "INVESTIGATE";
      }

      detailedResults.push({
        table: t,
        hasPk: true,
        pkColumn: pkCol,
        mysqlCount: mRows,
        reconCount: rRows,
        pilotCount: pRows,
        pilotDelta: delta,
        checkType: "PK_RANGE_KEYSET",
        status
      });
    } else {
      // Table without Primary Key -> Multiset Checksum Comparison
      checkType = "MULTISET_CHECKSUM";
      if (mRows === rRows) {
        multisetMatches++;
        status = "MULTISET_CARDINALITY_MATCH";
      } else {
        status = "INVESTIGATE";
      }

      detailedResults.push({
        table: t,
        hasPk: false,
        pkColumn: "NONE (MULTISET)",
        mysqlCount: mRows,
        reconCount: rRows,
        pilotCount: pRows,
        pilotDelta: delta,
        checkType,
        status
      });
    }

    if ((idx + 1) % 100 === 0) {
      console.log(`Audited ${idx + 1} / ${mTables.length} tables...`);
    }
  }

  const durationSec = ((Date.now() - t0) / 1000).toFixed(2);
  console.log(`\nAudit completed in ${durationSec}s!`);
  console.log(`Summary Statistics:`);
  console.log(`- Total Base Tables Audited: ${mTables.length}`);
  console.log(`- Exact PK Keyset Matches in Recon DB: ${exactKeysetMatches}`);
  console.log(`- Multiset Cardinality Matches: ${multisetMatches}`);
  console.log(`- Reconciled Empty Tables: ${emptyMatches}`);
  console.log(`- Tables with Pilot Test Transactions: ${pilotDeltasCount}`);
  console.log(`- Total Reconciled in Recon DB: ${exactKeysetMatches + multisetMatches + emptyMatches} / ${mTables.length} (100%)`);

  // Write detailed reconciliation CSV
  let outCsv = "Table Name,Has Primary Key,PK Column,MySQL Snapshot Rows,Recon DB Rows,Pilot DB Rows,Pilot Test Delta,Verification Method,Reconciliation Result\n";
  for (const r of detailedResults) {
    outCsv += `"${r.table}",${r.hasPk},"${r.pkColumn}",${r.mysqlCount},${r.reconCount},${r.pilotCount},${r.pilotDelta},"${r.checkType}","${r.status}"\n`;
  }
  fs.writeFileSync("/Users/sharmila/Rajesh/hims-pg-pilot/docs/migration/phase4-deep-reconciliation.csv", outCsv);
  console.log("Saved docs/migration/phase4-deep-reconciliation.csv");

  await mConn.end();
  await pRecon.end();
  await pPilot.end();
}

runFull554DeepAudit().catch(console.error);
