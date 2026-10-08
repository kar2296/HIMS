const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const API_PORT = process.env.API_PORT || process.env.TEST_PORT || "2018";
const PG_DATABASE = process.env.PG_DATABASE || process.env.TEST_DB || process.env.DATABASE_NAME || "hims_release_verify_db";

const suites = [
  { name: "Batch 1: Registration & Core Masters", file: "test_batch1.cjs", prefix: "B1", count: 10 },
  { name: "Batch 2: Billing & Cashier", file: "test_batch2.cjs", prefix: "B2", count: 12 },
  { name: "Batch 3: Pharmacy & Inventory", file: "test_batch3.cjs", prefix: "B3", count: 11 },
  { name: "Batch 4: IP Management & Bed Allocation", file: "test_batch4.cjs", prefix: "B4", count: 10 },
  { name: "Batch 5: EMR & Consultations", file: "test_batch5.cjs", prefix: "B5", count: 10 },
  { name: "Batch 6: LIS & Diagnostics", file: "test_batch6.cjs", prefix: "B6", count: 11 },
  { name: "Batch 7: OT & Surgery Scheduling", file: "test_batch7.cjs", prefix: "B7", count: 11 },
  { name: "Batch 8: Insurance & Corporate Packages", file: "test_batch8.cjs", prefix: "B8", count: 12 },
  { name: "Batch 9: MRD & Registries", file: "test_batch9.cjs", prefix: "B9", count: 11 },
  { name: "Batch 10: MIS Reports & Ledger", file: "test_batch10.cjs", prefix: "B10", count: 8 },
  { name: "Phase 3: Schema & Data Parity", file: "test_phase3.cjs", prefix: "P3", count: 10 },
  { name: "Phase 4: Security & Isolation", file: "test_phase4_security.cjs", prefix: "SEC", count: 5 },
  { name: "Deep AuthZ Isolation", file: "test_deep_authz.cjs", prefix: "AUTHZ", count: 3 },
  { name: "Tax Math Parity", file: "test_tax_math_parity.cjs", prefix: "TAX-MATH", count: 4 },
  { name: "Financial Concurrency & Balance", file: "test_financial_concurrency.cjs", prefix: "FIN-CONC", count: 7 },
  { name: "Payment Replay Audit", file: "test_payment_replay_concurrency.cjs", prefix: "REPLAY", count: 4 },
  { name: "Refund Failure Injection", file: "test_refund_failure_injection.cjs", prefix: "REF-INJ", count: 3 },
  { name: "Payment Idempotency & Replay Remediation", file: "test_idempotency_payment.cjs", prefix: "IDEM", count: 9 },
  { name: "Tax API Lifecycle", file: "test_tax_api_lifecycle.cjs", prefix: "TAX-API", count: 2 },
  { name: "Outbound Network Isolation Guards", file: "test_outbound_guards.cjs", prefix: "GUARD", count: 3 },
  { name: "Export & Template Stream Verification", file: "test_export_template_verification.cjs", prefix: "EXP", count: 4 }
];

console.log("=== EXECUTING COMPLETE RECONCILED AUTOMATED TEST SUITE HARNESS ===");
console.log(`Target API Port: ${API_PORT}`);
console.log(`Target PostgreSQL DB: ${PG_DATABASE}`);
console.log(`Working Directory: ${__dirname}\n`);

const startTime = new Date().toISOString();
let totalTests = 0;
let passedSuites = 0;
let failedSuites = 0;
const report = [];
const suiteResults = [];

for (const s of suites) {
  const suiteStart = Date.now();
  const testFilePath = path.join(__dirname, s.file);
  try {
    const stdout = execSync(`node "${testFilePath}"`, {
      encoding: "utf8",
      timeout: 30000,
      env: {
        ...process.env,
        API_PORT: API_PORT,
        TEST_PORT: API_PORT,
        PG_DATABASE: PG_DATABASE,
        TEST_DB: PG_DATABASE,
        DATABASE_NAME: PG_DATABASE,
        NODE_PATH: "/Users/sharmila/Rajesh/my-app/node_modules"
      }
    });

    const elapsedMs = Date.now() - suiteStart;
    totalTests += s.count;
    passedSuites++;
    report.push({
      suite: s.name,
      file: s.file,
      prefix: s.prefix,
      testCount: s.count,
      status: "PASSED",
      elapsedMs: `${elapsedMs}ms`
    });
    suiteResults.push({
      suite: s.name,
      file: s.file,
      prefix: s.prefix,
      testCount: s.count,
      status: "PASSED",
      exitCode: 0,
      elapsedMs,
      logOutput: stdout.slice(0, 1000)
    });
  } catch (err) {
    const elapsedMs = Date.now() - suiteStart;
    failedSuites++;
    const isTimeout = err.code === "ETIMEDOUT" || err.signal === "SIGTERM";
    const status = isTimeout ? "TIMEOUT" : "FAILED";
    report.push({
      suite: s.name,
      file: s.file,
      prefix: s.prefix,
      testCount: s.count,
      status: status,
      elapsedMs: `${elapsedMs}ms`
    });
    suiteResults.push({
      suite: s.name,
      file: s.file,
      prefix: s.prefix,
      testCount: s.count,
      status: status,
      exitCode: err.status || (isTimeout ? 124 : 1),
      elapsedMs,
      error: err.message,
      logOutput: (err.stdout || err.stderr || err.message || "").slice(0, 1000)
    });
    console.error(`[SUITE FAILURE] ${s.file}:`, err.message);
  }
}

const endTime = new Date().toISOString();
console.table(report);
console.log(`\nTOTAL RECONCILED TEST COUNT: ${totalTests} Automated Tests across ${suites.length} Distinct Suites`);
console.log(`SUITES PASSED: ${passedSuites} / ${suites.length} (${((passedSuites/suites.length)*100).toFixed(1)}% Pass Rate)\n`);

const machineReadableOutput = {
  testedCommit: "61645ba51fd1a97c0183080a5650ad9d890c577f",
  targetApi: `http://localhost:${API_PORT}`,
  targetDatabase: PG_DATABASE,
  startTime,
  endTime,
  totalSuites: suites.length,
  passedSuites,
  failedSuites,
  totalTests,
  passRate: `${((passedSuites/suites.length)*100).toFixed(1)}%`,
  suites: suiteResults
};

try {
  fs.writeFileSync(
    path.join(__dirname, "test-execution-results.json"),
    JSON.stringify(machineReadableOutput, null, 2)
  );
  console.log(`Machine-readable results written to: ${path.join(__dirname, "test-execution-results.json")}`);
} catch (e) {
  console.error("Failed to write JSON results:", e.message);
}

if (failedSuites > 0) {
  process.exit(1);
}
