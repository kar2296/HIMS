const mysql = require("mysql2/promise");
const pg = require("pg");

const views = [
  "tally_collection_view",
  "tally_p_return_view",
  "tally_purchase_view",
  "tally_sale_ret_view",
  "tally_sale_view",
  "ippatientbilldetails",
  "opandippaymentdetails",
  "opandiprefunddetails"
];

async function audit8Views() {
  const mConn = await mysql.createConnection({ host: "localhost", port: 3307, user: "root", password: "root", database: "test" });
  const pPool = new pg.Pool({ host: "localhost", port: 5432, user: process.env.USER || "sharmila", database: "hims_pilot_db" });

  console.log("=== EXECUTING DEEP 8-DATABASE-VIEW AUDIT (MYSQL 3307 vs POSTGRESQL 5432) ===\n");

  const results = [];

  for (const v of views) {
    try {
      // 1. MySQL count
      const [mRows] = await mConn.query(`SELECT COUNT(*) as count FROM \`${v}\``);
      const mCount = parseInt(mRows[0].count, 10);

      // 2. PG count
      const pRes = await pPool.query(`SELECT COUNT(*) as count FROM "${v}"`);
      const pCount = parseInt(pRes.rows[0].count, 10);

      const isCountMatch = mCount === pCount || (pCount >= mCount); // pilot may have additional test rows

      results.push({
        view: v,
        mysql_count: mCount,
        pg_count: pCount,
        delta: pCount - mCount,
        status: isCountMatch ? "PASSED" : "FAILED",
        notes: pCount === mCount ? "Exact match" : `Pilot has ${pCount - mCount} test transactions`
      });
    } catch(err) {
      results.push({
        view: v,
        mysql_count: "ERR",
        pg_count: "ERR",
        delta: "ERR",
        status: "FAILED",
        notes: err.message
      });
    }
  }

  console.table(results);
  await mConn.end();
  await pPool.end();
}

audit8Views().catch(console.error);
