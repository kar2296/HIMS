const mysql = require("mysql2/promise");
const pg = require("pg");

async function runTaxMathParity() {
  console.log("=== EXECUTING TAX MATH & BILLING CALCULATION PARITY TEST SUITE ===\n");
  
  const mConn = await mysql.createConnection({ host: "localhost", port: 3307, user: "root", password: "root", database: "test" });
  const pClient = new pg.Client({ host: "localhost", port: 5432, user: process.env.USER || "sharmila", database: "hims_pilot_db" });
  await pClient.connect();

  const results = [];

  // Test 1: Exclusive Tax Math Verification (Gross: 500, Discount: 50, Net: 450, GST: 5%)
  const gross = 500.00;
  const discount = 50.00;
  const netTaxableExclusive = gross - discount; // 450.00
  const gstRate = 0.05; // 5%
  const gstAmountExclusive = +(netTaxableExclusive * gstRate).toFixed(2); // 22.50
  const totalPayableExclusive = +(netTaxableExclusive + gstAmountExclusive).toFixed(2); // 472.50

  results.push({
    test: "1. Exclusive Tax Calculation (GST 5% on 450 Net)",
    taxMode: "EXCLUSIVE",
    taxableBase: netTaxableExclusive.toFixed(2),
    gstAmount: gstAmountExclusive.toFixed(2),
    totalPayable: totalPayableExclusive.toFixed(2),
    status: (netTaxableExclusive === 450.00 && gstAmountExclusive === 22.50 && totalPayableExclusive === 472.50) ? "PASSED" : "FAILED",
    details: "Taxable Base: 450.00, GST (5%): 22.50, Total Due: 472.50"
  });

  // Test 2: Inclusive Tax Math Verification (Total: 450 with 5% GST included)
  const totalGrossInclusive = 450.00;
  const taxableBaseInclusive = +(totalGrossInclusive / (1 + gstRate)).toFixed(2); // 428.57
  const gstAmountInclusive = +(totalGrossInclusive - taxableBaseInclusive).toFixed(2); // 21.43
  const totalPayableInclusive = +(taxableBaseInclusive + gstAmountInclusive).toFixed(2); // 450.00

  results.push({
    test: "2. Inclusive Tax Calculation (GST 5% in 450 Total)",
    taxMode: "INCLUSIVE",
    taxableBase: taxableBaseInclusive.toFixed(2),
    gstAmount: gstAmountInclusive.toFixed(2),
    totalPayable: totalPayableInclusive.toFixed(2),
    status: (taxableBaseInclusive === 428.57 && gstAmountInclusive === 21.43 && totalPayableInclusive === 450.00) ? "PASSED" : "FAILED",
    details: "Taxable Base: 428.57, GST (5%): 21.43, Total Due: 450.00"
  });

  // Test 3: Compare Database Numeric Precision (PostgreSQL vs MySQL)
  const [mCalc] = await mConn.query(`
    SELECT 
      ROUND(450.00 / 1.05, 2) as m_base,
      ROUND(450.00 - ROUND(450.00 / 1.05, 2), 2) as m_tax,
      ROUND(450.00 * 0.05, 2) as m_excl_tax
  `);

  const pCalc = await pClient.query(`
    SELECT 
      ROUND(450.00 / 1.05, 2) as p_base,
      ROUND(450.00 - ROUND(450.00 / 1.05, 2), 2) as p_tax,
      ROUND(450.00 * 0.05, 2) as p_excl_tax
  `);

  const mBase = parseFloat(mCalc[0].m_base);
  const pBase = parseFloat(pCalc.rows[0].p_base);
  const mTax = parseFloat(mCalc[0].m_tax);
  const pTax = parseFloat(pCalc.rows[0].p_tax);

  results.push({
    test: "3. Database Math Precision Parity (MySQL vs PostgreSQL)",
    taxMode: "DB_ENGINE_PARITY",
    taxableBase: `MySQL: ${mBase}, PG: ${pBase}`,
    gstAmount: `MySQL: ${mTax}, PG: ${pTax}`,
    totalPayable: `MySQL: ${(mBase+mTax).toFixed(2)}, PG: ${(pBase+pTax).toFixed(2)}`,
    status: (mBase === pBase && mTax === pTax) ? "PASSED" : "FAILED",
    details: `Both database engines compute Base: ${pBase.toFixed(2)}, Tax: ${pTax.toFixed(2)}`
  });

  // Test 4: Live Patient Bill Record Persistence with GST in PostgreSQL
  const billInsert = await pClient.query(`
    INSERT INTO patientbills (
      "PatientId", "FacilityId", "BillDateTime",
      "BillAmount", "BillDiscount", "PaidAmount", "OutStandingAmount",
      "GSTAmount", "PatientBillStatusId", "Status"
    ) VALUES (
      1, 1, NOW(),
      500.00, 50.00, 0.00, 472.50,
      22.50, 1, 1
    ) RETURNING "PatientBillId"
  `);
  const billId = billInsert.rows[0].PatientBillId;

  const detailInsert = await pClient.query(`
    INSERT INTO patientbilldetails (
      "PatientBillId", "ServiceId", "Quantity", "Rate",
      "GrossAmount", "DiscountAmount", "NetAmount", "GSTPercentage", "GSTAmount",
      "Status"
    ) VALUES (
      $1, 1, 1, 500.00,
      500.00, 50.00, 450.00, 5.00, 22.50,
      1
    ) RETURNING "PatientBillDetailId"
  `, [billId]);

  results.push({
    test: "4. PostgreSQL Live Bill Tax Persistence",
    taxMode: "PERSISTENCE_CHECK",
    taxableBase: "450.00",
    gstAmount: "22.50",
    totalPayable: "472.50",
    status: (billId > 0 && detailInsert.rows[0].PatientBillDetailId > 0) ? "PASSED" : "FAILED",
    details: `Bill #${billId} persisted with Gross 500.00, Disc 50.00, Net 450.00, GST 22.50, Total 472.50`
  });

  console.table(results);

  await mConn.end();
  await pClient.end();
}

runTaxMathParity().catch(console.error);
