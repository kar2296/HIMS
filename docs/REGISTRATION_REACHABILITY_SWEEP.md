# Registration Module — Complete Reachability Sweep
*Aug 21, 2026*

## 0. Scope of this sweep

"Registration module" is scoped to the app's own directory structure: everything under `public/views/emr/registration/**` (25 subdirectories) plus the two `public/views/patientservices/{defaultregistration,newregistration}` entry points already treated as part of Registration in prior work. This is a much larger set than the 11 screens done so far — those 11 only covered `newregistration`, `patientregistration-form/-list`, `quickregistration`, `fullregistration` + 3 tab siblings, and `registrationcumvisit`.

**Explicitly excluded, flagged for a decision, not touched:**
- `app.feedbackquickregistration` and `app.privilegecardregistration` — despite the word "registration" in the state name, these live in `emr/generalmaster/feedback/` and `billing/promotionalschemes/` respectively. Different modules, not migrated here.
- A&E registration (`emr/accidentemergency/aepatientregistration/`) — a different top-level directory (Accident & Emergency), not Registration.
- **`ivfregistration/` and `lisregistration/`** — these two *do* live physically inside `emr/registration/`, so they're inventoried below, but they're specialized flows (IVF intake, LIS/lab registration) that may belong in a future dedicated module rather than this pass. **Flagging for your call**, not deciding unilaterally.
- **`registration.patientprofile`** (`patientprofiles/patientprofile.js`) — technically lives in this directory, but it's a cross-module modal opened from **over 200 call sites app-wide** (billing, pharmacy, inpatient, LIS, surgery, virtual services — nearly every module). Migrating it has a blast radius far beyond "one Registration screen." **Recommend treating it as its own dedicated initiative**, same as the flagship, not a routine slot in this sequence — flagging rather than deciding.

## 1. Totals

| | Count |
|---|---|
| Total controller files (screens) found in scope | 79 |
| Already migrated (validated) | 11 |
| Confirmed reachable, not yet migrated | ~45 |
| Confirmed dead / unreachable | 12 |
| Uncertain / needs manual review | 2 |
| Deferred by standing instruction (flagship + its own sub-screens) | 9 |

*(Counts below add up screen-by-screen; some screens serve more than one state name.)*

## 2. Already migrated (11) — unchanged, listed for completeness

| Screen | State | Status |
|---|---|---|
| defaultregistration | `app.defaultregistration`-equivalent | Dead code, migrated anyway |
| registeredpatients | — | Dead code, migrated anyway |
| patientregistration-self | — | Unreachable, migrated anyway (user's choice) |
| newregistration | `app.newregistration` / `self.selfnewregistration` | Reachable |
| patientregistration-form | `app.patientregistration-form` | Reachable |
| quickregistration | `app.quickregistration` | Reachable |
| fullregistration | `app.fullregistrationtab.basic` | Reachable |
| registrationcumvisit | `app.registrationcumvisit` | Unreachable + crash bug, migrated anyway |
| patientidentity-list | `app.fullregistrationtab.patientids` | Reachable |
| patientkin-list | `app.fullregistrationtab.patientkins` | Reachable |
| familylinking | `app.fullregistrationtab.familylink` | Reachable |

## 3. Confirmed reachable — NOT yet migrated

State name and real navigation path are given for each. Reference counts are how many real `ui-sref`/`$state.go`/`utl.Modal.open` call sites exist outside the state-definition files (found by scripted grep, then spot-verified).

### 3.1 `fullregistrationtab` family — natural next screens (small, high continuity with what's done)

| Screen (file) | State | Navigation path | Notes |
|---|---|---|---|
| patientkin-form | `app.fullregistrationtab.patientkin` (modal, 4 refs) | `utl.Modal.open('app.fullregistrationtab.patientkin', ...)` from **patientkin-list.js** (already-migrated screen 10) `addNew()`/`handleEvents('edit',...)` | The real Add/Edit form behind a screen you already ported. Highest-continuity pick. |
| patientidentity-form | `app.fullregistrationtab.patientidentity` (7 refs) | **Not called from patientidentity-list.js** (that screen edits inline, per the GRID/LIST-EDITOR pattern). The 7 references are elsewhere — need to re-verify exact callers before assuming relevance to this directory. Flagged uncertain, see §5. |
| patientguarantor-list | `app.patientguarantorlist` (42 refs), `app.patientguarantorbilling` (3 refs) | `utl.Modal.open('app.patientguarantorlist', ...)` from **many Billing/Pharmacy screens** (bill modification, pharmacy sales, cathlab schedule, etc.) — very high real-world traffic even though its own nested tab route (`app.fullregistrationtab.patientguarantor`) is dead/commented. | **Real bug found, to preserve faithfully**: Add/Edit both call `utl.Modal.open('app.patientguarantorform', ...)` — **that state does not exist anywhere in hims-states.js**. Add/Edit are silently broken today. GL-edit path (`app.patientguarantorglform`) is real and works. Delete is unaffected. |
| patientguarantorgl-form | `app.patientguarantorglform` (2 refs) | Opened from patientguarantor-list's "GL" action | Real, working. |
| patientdeathrecord-form | `app.patientdeathrecordform` (6 refs) | Opened from fullregistration.js / fullregistrationtab siblings | Reachable. |
| patientdemographicupdate | `app.demographicupdate` (1 ref) | Opened from fullregistration.js | Reachable, low-traffic. |
| patientid-documents | `app.patientiddocs` (1 ref) | Opened from **patientidentity-list.js**'s Upload action (already dispatched natively per screen 9) | Reachable — the real target of the Upload button you already preserved. |
| deactivateremarks | `app.deactiveremarks` (4 refs) | Opened from fullregistration/fullregistrationtab | Reachable. |
| auditlog-list | `app.fullregistrationtab.auditlog` | **DEAD** — commented out of the tab array, zero other references. Same class as `patientguarantor`'s dead tab entry. | Do not migrate. |
| visitcreateform | `app.visitcreateform` (3 refs) | Opened from fullregistration flow | Reachable. |
| opdbill | `app.opdbill` (8 refs, in `custom-states.js`) | Real — this is the OPDBill button target already dispatched natively from **registrationcumvisit** (screen 8) and referenced elsewhere | Reachable. |

### 3.2 quickregistration family

| Screen | State | Navigation path |
|---|---|---|
| deceased-form | `app.registrarion` (8 refs — real state name, contains a typo in the source) | Opened from **quickregistration.js** (already-migrated screen 6) |

### 3.3 encounterguarantors family

| Screen | State | Navigation path |
|---|---|---|
| encounterguarantor-list | `app.encounterguarantors` (1 ref) | Real ui-sref/state.go reference found |
| encounterguarantorupdate | `app.guarantorupdateform` (4 refs) | Real |
| encounterguarantorgl-form | `app.encounterguarantorgl` (1 ref) | Real |
| encounterguarantor-form | `app.encounterguarantor` (modal, **0 real refs** — its own list screen only opens `app.encounterguarantorgl`, never this) | **Orphaned modal config** — defined but never opened by anything. Candidate dead, not touched. |

### 3.4 IPManagement / checkedinpatients family (large sub-area, not yet inspected screen-by-screen)

| Screen | State | Refs |
|---|---|---|
| inpatienttab (+ myinpatient, allinpatient, patientdischarge children) | `app.inpatienttab.*` | 4–17 refs each, all real |
| oppatienttab (+ mycheckin, allcheckin, previousoppatient children) | `app.oppatienttab.*` | 1–62 refs each, all real |
| patientvisit-details, patientvisit-tracker, recommendation | modal controllers (`$uibModalInstance`) opened from checkedinpatients.js / elsewhere | Not yet traced to exact caller |
| currentinpatients | `app.currentinpatient` | 5 refs |

**Duplicate-directory finding**: `emr/registration/inpatient/*` (allinpatient.js/html, inpatienttab.js/html, myinpatient.js/html, patientdischarge.js/html) is a byte-for-byte-named duplicate of `emr/registration/IPManagement/*` with identical controller names. The live state definitions all point to `IPManagement/`. **`inpatient/` has zero references anywhere — confirmed dead, a stale duplicate directory.** Do not migrate; flag for deletion once you're ready to clean up dead AngularJS code.

### 3.5 Standalone reachable screens

| Screen | State | Refs |
|---|---|---|
| patientsearch | `app.patientsearch` | 19 |
| patientprints | `app.patientprints` | 1 |
| patienttracker | `app.patienttracker` | 32 |
| patientpickerarchive | `app.patpickarchive` | 3 |
| patientattachments | `app.patientattachments` | 133 (!) — very heavily used cross-module modal, similar in kind to patientprofile though smaller |
| payoutattachment-list | `app.payoutattachments` | 3 |
| ordertracker | `app.ordertracker` | 8 |
| qmspatients | `app.qmspatients` | 3 |
| pendingdischarges | `app.pendingdischarges` | 6 |
| prescriptions / doctorprescribe-form | `app.doctorprescription` / `app.doctorsprescription-form` | 10 / 2 |
| patientfollowup-tab (+ pending-list, followup-list, patientfollowup-form children) | `app.patientfollowuptab.*` | 1–5 refs each. **Note**: `emr-states.js` has a fully commented-out duplicate of this whole state block; the live one is in `hims-states.js`. |

### 3.6 IVF / LIS registration (flagged for scope decision, §0)

| Screen | State | Refs |
|---|---|---|
| ivfregistrationtab (+ basic, spousereg children) | `app.ivfregistrationtab.*` | 10–12 refs, real |
| lisregistration | `app.lisregistration` | 8 refs, real |

## 4. Confirmed dead / unreachable (12)

| Screen | Why |
|---|---|
| checkedinpatients.js | No state, no modal config, no reference anywhere in `public/` — not wired to the app at all (verified both by controller name and by template filename) |
| patientvisit-details.js | Same — zero references anywhere, despite being built as a `$uibModalInstance` modal controller |
| patientvisit-tracker.js | Same |
| patientguarantor-form.js | Same — and note this is a *different* file from the real `app.patientguarantorform` target that patientguarantor-list.js actually calls (which doesn't exist as a state at all — see §3.1) |
| patientmerge.js | Same |
| `emr/registration/inpatient/*` (4 files) | Stale duplicate of `IPManagement/*`, see §3.4 |
| fullregistration.js's old top-level state `app.fullregistration` | The `.state()` block itself is entirely commented out in hims-states.js (superseded by `app.fullregistrationtab.basic`, same controller/template) |
| auditlog-list.js | `app.fullregistrationtab.auditlog` — commented out of the tab array, zero other references (previously found, reconfirmed) |
| opbilllinking.js | `app.opvisitbilllink` — live `.state()` definition exists, zero references anywhere |
| patientcontrol.js | `app.patientcontrol` — live `.state()` definition, zero references |
| encounterguarantor-form.js | `app.encounterguarantor` modal — defined, zero references (its own list only opens the GL variant) |
| pharmacy-regcumvisit.js | Not a state at all — shares its controller name with regcumvisitwithbill.js, but is never loaded via any script tag or `$ocLazyLoad` resolve; an unused duplicate file |

## 5. Uncertain / needs manual review before migrating

- **patientidentity-form** (`app.fullregistrationtab.patientidentity`, 7 refs) — patientidentity-list.js (already migrated) edits inline and never navigates here, so the 7 real references come from somewhere else in the app. Need to trace the actual callers before deciding whether this belongs in the immediate next batch or is a separate, unrelated flow that happens to reuse this state name's directory.
- **patientvisit-details.js / patientvisit-tracker.js's real caller** — both are zero-reference by controller/template name, but they're built as `$uibModalInstance` controllers (meant to be opened via `$uibModal.open({...})` directly rather than a named state). It's possible — not confirmed — that some other screen opens them by templateUrl/controller reference using a construct this sweep's grep patterns don't catch (e.g., built via a shared factory). Classified as dead in §4 based on the evidence found; flagging the residual uncertainty rather than treating that as 100% certain.

## 6. Deferred (unchanged from standing instruction)

`regcumvisitwithbill/*` (10 files: the flagship itself plus appointmentlist, appointmentsview, bulkCheckout, crossconsultation, doctortransfer, opmlc, opvisitcancel, regpatientidcard, swosthapatient) — all reachable, but reached primarily as modals *from* the flagship screen itself. Staying deferred as a unit alongside `regcumvisitwithbill`, per your existing instruction not to touch it until smaller screens are done.

## 7. Recommended migration order

1. **patientguarantor-list** (42+3 refs — highest real-world traffic of anything in this sweep) — natural continuation of the fullregistrationtab-family pattern work (identity → kin → guarantor), preserving the real Add/Edit dead-link bug faithfully.
2. **patientkin-form** — the real modal behind the already-migrated patientkin-list.
3. **patientguarantorgl-form**, **patientid-documents**, **patientdeathrecord-form**, **deactivateremarks**, **patientdemographicupdate**, **visitcreateform** — the rest of the fullregistration-adjacent modal/form set.
4. **deceased-form** (quickregistration's real modal).
5. **opdbill** — the real target of the OPDBill button already dispatched natively from registrationcumvisit.
6. encounterguarantors family (list, form, GL form, update).
7. IPManagement/checkedinpatients tab family — larger, do as its own batch.
8. Remaining standalone screens (patientsearch, patienttracker, patientattachments — heavy cross-module modal, patpickarchive, payoutattachments, ordertracker, qmspatients, pendingdischarges, prescriptions, patientfollowup family).
9. **Your call needed**: IVF/LIS registration (in scope or separate module?) and `registration.patientprofile` (dedicated initiative vs. routine slot, given 200+ call sites).
10. Stays deferred: `regcumvisitwithbill/*` flagship + its 9 sub-screens.

Proceeding now with **#1, patientguarantor-list**, since it's the highest-impact, fully-unambiguous pick.
