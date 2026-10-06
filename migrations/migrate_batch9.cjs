const mysql = require("mysql2/promise");
const pg = require("pg");

const tablesToMigrate = [
  "patientcertificates",
  "referralfeedback",
  "patientnotifydiseases",
  "encountermlc",
  "encountermlcofficer",
  "referralcharge",
  "referralusermap"
];

function mapMysqlTypeToPg(col) {
  const type = col.Type.toLowerCase();
  const isAuto = col.Extra && col.Extra.toLowerCase().includes("auto_increment");
  const isPk = col.Key === "PRI";

  if (isPk && isAuto) {
    if (type.includes("bigint")) return "BIGSERIAL PRIMARY KEY";
    return "SERIAL PRIMARY KEY";
  }

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

async function migrateBatch9Tables() {
  const mConn = await mysql.createConnection({ host: "localhost", port: 3307, user: "root", password: "root", database: "test" });
  const pClient = new pg.Client({ host: "localhost", port: 5432, user: process.env.USER || "sharmila", database: "hims_pilot_db" });
  await pClient.connect();

  console.log("=== STARTING BATCH 9 POSTGRESQL MIGRATION ===");

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

  await mConn.end();
  await pClient.end();
  console.log("\n=== BATCH 9 MIGRATION COMPLETED SUCCESSFULLY ===");
}

migrateBatch9Tables().catch(console.error);
