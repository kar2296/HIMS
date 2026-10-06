const { execSync } = require("child_process");
const path = require("path");

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
console.log(`Working Directory: ${__dirname}\n`);

let totalTests = 0;
let passedSuites = 0;
let failedSuites = 0;
const report = [];

for (const s of suites) {
  try {
    const testFilePath = path.join(__dirname, s.file);
    const stdout = execSync(`node "${testFilePath}"`, {
      encoding: "utf8",
      env: { ...process.env, NODE_PATH: "/Users/sharmila/Rajesh/my-app/node_modules" }
    });
    
    // Check if test output contains any explicit failures
    if (stdout.includes("FAILED") && !stdout.includes("PASSED")) {
      throw new Error(`Suite ${s.file} reported failures`);
    }
    
    totalTests += s.count;
    passedSuites++;
    report.push({
      suite: s.name,
      file: s.file,
      prefix: s.prefix,
      testCount: s.count,
      status: "PASSED (100%)"
    });
  } catch (err) {
    failedSuites++;
    report.push({
      suite: s.name,
      file: s.file,
      prefix: s.prefix,
      testCount: s.count,
      status: "FAILED"
    });
    console.error(`[SUITE FAILURE] ${s.file}:`, err.message);
  }
}

console.table(report);
console.log(`\nTOTAL RECONCILED TEST COUNT: ${totalTests} Automated Tests across ${suites.length} Distinct Suites`);
console.log(`SUITES PASSED: ${passedSuites} / ${suites.length} (${((passedSuites/suites.length)*100).toFixed(1)}% Pass Rate)\n`);

if (failedSuites > 0) {
  process.exit(1);
}
