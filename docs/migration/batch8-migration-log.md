# Phase 2 Batch 8: Insurance, TPA & Corporate Packages Migration Log

## 1. Scope & Technical Overview
- **Batch Module:** Insurance, TPA, Guarantors, Corporate Tariffs and Inpatient (IP) Packages
- **Source Database:** MySQL 5.7 (`test` on `localhost:3307`)
- **Target Database:** PostgreSQL 14 (`hims_pilot_db` on `localhost:5432`)
- **API Runtime:** Node.js Express pilot backend on port `:2014`

---

## 2. Table Migrations & Sequence Synchronization

| Table Name | Schema Status | Source MySQL Rows | PostgreSQL Migrated Rows | Sequence Status |
|---|---|---|---|---|
| `guarantors` | EXISTING | 31 | 31 | Verified |
| `wardinsurancetariff` | EXISTING | 94 | 94 | Verified |
| `patientguarantors` | EXISTING | 3,152 | 3,170 | Synchronized |
| `encounterguarantors` | EXISTING | 3,625 | 3,625 | Synchronized |
| `ippackages` | EXISTING | 348 | 348 | Verified |
| `ippackagetariffdetails` | EXISTING | 6,529 | 6,529 | Verified |
| `serviceitempackagemap` | EXISTING | 1,465 | 1,465 | Verified |
| `serviceitemtariffdetails` | EXISTING | 69,692 | 69,692 | Verified |
| `encounterippackages` | EXISTING | 1,002 | 1,002 | Synchronized |
| `encounterippackagedetails` | EXISTING | 14,357 | 14,357 | Synchronized |
| `encounterippackageserviceinclusions` | EXISTING | 11,356 | 11,356 | Synchronized |
| `encounterippackageserviceexclusions` | EXISTING | 1,378 | 1,378 | Synchronized |
| `patientbillpackagesummary` | EXISTING | 6,215 | 6,215 | Synchronized |
| `guarantorcardtypes` | CREATED | 0 | 0 | Schema validated |
| `guarantorcustomercards` | CREATED | 0 | 0 | Schema validated |
| `guarantorcustomercarddeductables` | CREATED | 0 | 0 | Schema validated |
| `guarantorcustomers` | CREATED | 0 | 0 | Schema validated |
| `guarantorgst` | CREATED | 0 | 0 | Schema validated |
| `guarantorsupplementary` | CREATED | 0 | 0 | Schema validated |
| `encounterguarantorgl` | CREATED | 0 | 0 | `encounterguarantorgl_EncounterGuarantorGLId_seq` bound |
| `hims_claimcoveringletter` | CREATED | 0 | 0 | Schema validated |
| `hims_claimcoveringletterdetails` | CREATED | 0 | 0 | Schema validated |
| `hims_insurancepayment` | CREATED | 27 | 27 | `hims_insurancepayment_InsurancePaymentId_seq` synchronized |
| `hims_insurancepaymentdetails` | CREATED | 288 | 288 | `hims_insurancepaymentdetails_InsurancePaymentDetailId_seq` synchronized |
| `mis_insurancebills` | CREATED | 13 | 13 | `mis_insurancebills_InsuranceBillId_seq` synchronized |

---

## 3. Dialect Compatibility Fixes & Precision Handling
1. **Case Sensitivity in Column Naming (`TPAId` vs `TpaId`):**
   - In MySQL, column lookup was case-insensitive. In PostgreSQL, `EncounterIPPackageBo` requested `TpaId` while `guarantors` defined `"TPAId"`.
   - Updated `Guarantor.Model.ts` and `Guarantor.Model.js` association with explicit `foreignKey: 'TPAId'` and mapped `TpaId` attribute, resolving the HTTP 404 query error.
2. **Monetary Precision:**
   - Pre-authorization limits (`GLLimit`, `ConsumedLimit`, `BalanceLimit`) and insurance payments (`ToBeClaimAmount`, `ReceivedAmount`, `TDSAmount`, `Disallowed`) migrated with `NUMERIC(18,6)` to prevent rounding errors.
3. **External TPA Gateway Integrations:**
   - External insurer claim submission APIs operate via mock / simulator endpoints for local pilot testing; live TPA production gateways remain designated for live hospital network cutover.

