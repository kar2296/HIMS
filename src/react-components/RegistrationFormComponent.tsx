// DEPRECATED / UNUSED -- confirmed orphaned, 2026-08-22.
//
// This component was never a faithful port of any real screen: it has
// invented fields (Ethnicity, a "Web Camera" upload action) and hardcoded
// dropdown option lists not sourced from any real lookup API, and makes no
// backend calls at all (flagged in docs/MIGRATION_ROADMAP.md section 7 as
// "not touched; flagging for a decision -- rebuild faithfully when
// patientregistration-form is migrated ... or remove it").
//
// patientregistration-form is now genuinely migrated, faithfully, as
// PatientRegistrationFormScreen.tsx (see that file + newregistration.js's
// sibling patientregistration-form.js for the real hollowed-controller
// bridge). Verified via grep that no template anywhere in public/ ever
// mounted <react-component name="RegistrationFormComponent">, so this file
// was dead on arrival -- registered in window.ReactComponents (src/main.tsx)
// but never rendered. That registration has been removed.
//
// This file is left in place only because this environment's tooling
// cannot delete files from the working tree; the file itself carries no
// runtime effect anymore. Safe to `git rm` this file whenever convenient --
// nothing imports or references it.
export {};
