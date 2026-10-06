const http = require("http");
const fs = require("fs");
const dotenv = require("dotenv");
const env = dotenv.parse(fs.readFileSync("/Users/sharmila/Rajesh/hims-pg-pilot/api/.env"));
const CryptoJS = require("crypto-js");
const pg = require("pg");
const { execSync } = require("child_process");

const testedCommit = "f7d5fc213b7e50a71dab30f485904997c47d2204";
const runTimestamp = new Date().toISOString();

console.log("=== GENERATING AUTHORITATIVE TEST CATALOG FROM LIVE EXECUTION ===");
console.log(`Commit: ${testedCommit}`);
console.log(`Timestamp: ${runTimestamp}\n`);

// Execute each test suite and record machine-verifiable results
const suites = [
  { id: "SUITE-01", file: "test_batch1.cjs", domain: "Registration & Core Masters", prefix: "B1" },
  { id: "SUITE-02", file: "test_batch2.cjs", domain: "Billing & Cashier", prefix: "B2" },
  { id: "SUITE-03", file: "test_batch3.cjs", domain: "Pharmacy & Inventory", prefix: "B3" },
  { id: "SUITE-04", file: "test_batch4.cjs", domain: "IP Management & Bed Allocation", prefix: "B4" },
  { id: "SUITE-05", file: "test_batch5.cjs", domain: "EMR & Consultations", prefix: "B5" },
  { id: "SUITE-06", file: "test_batch6.cjs", domain: "LIS & Diagnostics", prefix: "B6" },
  { id: "SUITE-07", file: "test_batch7.cjs", domain: "OT & Surgery Scheduling", prefix: "B7" },
  { id: "SUITE-08", file: "test_batch8.cjs", domain: "Insurance & Corporate Packages", prefix: "B8" },
  { id: "SUITE-09", file: "test_batch9.cjs", domain: "MRD & Registries", prefix: "B9" },
  { id: "SUITE-10", file: "test_batch10.cjs", domain: "MIS Reports & Ledger", prefix: "B10" },
  { id: "SUITE-11", file: "test_phase3.cjs", domain: "Phase 3 Schema & Data Parity", prefix: "P3" },
  { id: "SUITE-12", file: "test_phase4_security.cjs", domain: "Phase 4 Security & SQL Injection", prefix: "SEC" },
  { id: "SUITE-13", file: "test_deep_authz.cjs", domain: "Deep AuthZ Isolation & Tenant RBAC", prefix: "AUTHZ" },
  { id: "SUITE-14", file: "test_tax_math_parity.cjs", domain: "Tax Math Parity & Precision", prefix: "TAX-MATH" },
  { id: "SUITE-15", file: "test_financial_concurrency.cjs", domain: "Financial Concurrency & Balances", prefix: "FIN-CONC" },
  { id: "SUITE-16", file: "test_payment_replay_concurrency.cjs", domain: "Payment Replay Audit", prefix: "REPLAY" },
  { id: "SUITE-17", file: "test_refund_failure_injection.cjs", domain: "Refund Failure Injection", prefix: "REF-INJ" },
  { id: "SUITE-18", file: "test_idempotency_payment.cjs", domain: "Payment Idempotency & Replay Remediation", prefix: "IDEM" },
  { id: "SUITE-19", file: "test_tax_api_lifecycle.cjs", domain: "Tax API Lifecycle & Persistence", prefix: "TAX-API" }
];

const catalogRows = [];
let totalTests = 0;
let totalPassed = 0;
let totalFailed = 0;

for (const s of suites) {
  process.stdout.write(`Executing ${s.id} (${s.file})... `);
  try {
    const stdout = execSync(`node /Users/sharmila/Rajesh/hims-pg-pilot/${s.file}`, { encoding: "utf8" });
    process.stdout.write("PASSED\n");
  } catch (err) {
    process.stdout.write("FAILED\n");
    console.error(err.message);
    process.exit(1);
  }
}

