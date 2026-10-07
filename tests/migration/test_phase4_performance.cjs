const http = require("http");
const fs = require("fs");
const dotenv = require("dotenv");
const env = dotenv.parse(fs.readFileSync("/Users/sharmila/Rajesh/hims-pg-pilot/api/.env"));
const CryptoJS = require("crypto-js");

function getBearerToken(userName, password) {
  const secret = env.JWT_SECRET;
  const tokenPayload = { userName, password, nonce: new Date().toUTCString() };
  return CryptoJS.AES.encrypt(JSON.stringify(tokenPayload), secret).toString();
}

async function makeRequest(path, body, token) {
  const t0 = Date.now();
  return new Promise((resolve) => {
    const options = {
      host: "localhost",
      port: parseInt(process.env.API_PORT || process.env.TEST_PORT || "2018", 10),
      path: path,
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json",
        "Connection": "close"
      }
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        const duration = Date.now() - t0;
        resolve({ status: res.statusCode, duration, error: null });
      });
    });

    req.on("error", (err) => {
      resolve({ status: 500, duration: Date.now() - t0, error: err.message });
    });

    req.setTimeout(15000, () => {
      req.destroy();
      resolve({ status: 504, duration: Date.now() - t0, error: "TIMEOUT" });
    });

    req.write(JSON.stringify(body));
    req.end();
  });
}

function calculatePercentiles(latencies) {
  latencies.sort((a, b) => a - b);
  const p50 = latencies[Math.floor(latencies.length * 0.50)] || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
  const avg = (latencies.reduce((a, b) => a + b, 0) / latencies.length) || 0;
  return { min: latencies[0] || 0, p50, p95, p99, max: latencies[latencies.length - 1] || 0, avg: parseFloat(avg.toFixed(2)) };
}

async function runBenchmark() {
  console.log("=== EXECUTING REPRESENTATIVE PERFORMANCE BENCHMARK (POSTGRESQL 14 PILOT) ===\n");
  const token = getBearerToken("admin", "admin");

  const endpoints = [
    { name: "Patient Search", path: "/Registration/Patient/GetPatients", body: { Params: [], PageContext: { PageNumber: 1, PageSize: 10 } } },
    { name: "Drug Master Search", path: "/ClinicalMaster/DrugMaster/GetDrugMasters", body: { Params: [], PageContext: { PageNumber: 1, PageSize: 10 } } },
    { name: "Patient Bills List", path: "/Billing/PatientBills/GetPatientBills", body: { Params: [], PageContext: { PageNumber: 1, PageSize: 10 } } },
    { name: "Inpatient Encounters", path: "/Visit/Visit/GetEncounters", body: { Params: [{ Key: "EncounterTypeId", Value: 2 }], PageContext: { PageNumber: 1, PageSize: 10 } } }
  ];

  const results = [];

  for (const ep of endpoints) {
    console.log(`Benchmarking: ${ep.name}...`);
    const totalRequests = 30;
    const concurrency = 6;
    const latencies = [];
    let successful = 0;
    let failed = 0;

    const tStart = Date.now();

    for (let i = 0; i < totalRequests; i += concurrency) {
      const batch = Array.from({ length: Math.min(concurrency, totalRequests - i) }, () =>
        makeRequest(ep.path, ep.body, token)
      );
      const responses = await Promise.all(batch);
      for (const res of responses) {
        latencies.push(res.duration);
        if (res.status === 200) successful++;
        else failed++;
      }
    }

    const totalDurationSec = (Date.now() - tStart) / 1000;
    const throughput = parseFloat((totalRequests / totalDurationSec).toFixed(2));
    const stats = calculatePercentiles(latencies);

    results.push({
      endpoint: ep.name,
      totalRequests,
      concurrency,
      throughputReqSec: throughput,
      avgLatencyMs: stats.avg,
      p50Ms: stats.p50,
      p95Ms: stats.p95,
      p99Ms: stats.p99,
      errorRate: `${((failed / totalRequests) * 100).toFixed(1)}%`
    });
  }

  console.table(results);
}

runBenchmark().catch(console.error);
