/**
 * sessionHelper.ts
 *
 * Pure TypeScript mirror of the AngularJS ngSessionHelper service.
 * Reads/writes the SAME sessionStorage keys so React components and
 * AngularJS controllers always see the same session values.
 *
 * No Angular dependency — safe to import in any React component.
 */

const ss = sessionStorage;

export const sessionHelper = {
  // ── Auth ────────────────────────────────────────────────────
  /** JWT / session token stored after login */
  getAuthToken: (): string | null => ss.getItem('sessionID'),

  // ── User ────────────────────────────────────────────────────
  getCurrentUserId: (): number => {
    const v = ss.getItem('Session-UserId');
    return v ? parseInt(v, 10) : -1;
  },
  getCurrentUserName: (): string | null => ss.getItem('Session-UserName'),
  getUserTypeId: (): string | null => ss.getItem('Session-UserTypeId'),
  getCurrentEmployeeId: (): string | null => ss.getItem('Session-EmployeeId'),
  getUserGroupId: (): string | null => ss.getItem('Session-UserGroupId'),
  getClinicalRoleId: (): string | null => ss.getItem('Session-ClinicalRoleId'),
  getUserRoles: (): string | null => ss.getItem('Session-UserRoles'),
  getUserDepartments: (): string | null => ss.getItem('Session-UserDepartments'),

  // ── Facility ─────────────────────────────────────────────────
  getCurrentFacilityId: (): number => {
    const v = ss.getItem('Session-FacilityId');
    return v ? parseInt(v, 10) : -1;
  },
  getCurrentFacilityName: (): string | null => ss.getItem('Session-FacilityName'),
  getCurrentFacilityCode: (): string | null => ss.getItem('Session-FacilityCode'),

  // ── Organisation ─────────────────────────────────────────────
  getCurrentOrgId: (): string | null => ss.getItem('Session-OrgId'),
  getCurrentOrgCode: (): string | null => ss.getItem('Session-OrgCode'),

  // ── Department ───────────────────────────────────────────────
  getCurrentDepartmentId: (): string | null => ss.getItem('Session-DepartmentId'),
  getCurrentDepartmentName: (): string | null => ss.getItem('Session-DepartmentName'),
  getCurrentSubDepartmentId: (): string | null => ss.getItem('Session-SubDepartmentId'),

  // ── EMR / Clinical ───────────────────────────────────────────
  getEMRPatientId: (): string | null => ss.getItem('EMRPatientId'),
  getEncounterId: (): number | null => {
    const raw = ss.getItem('EMR-CURRENT-ENCOUNTER');
    if (!raw) return null;
    try { return JSON.parse(raw)?.Id ?? null; } catch { return null; }
  },
  getPatientGender: (): string | null => ss.getItem('PATIENT-GENDER'),
  getPatientDOB: (): string | null => ss.getItem('PATIENT-DOB'),

  // ── Misc ─────────────────────────────────────────────────────
  getLandingState: (): string | null => ss.getItem('LandingState'),
  getIsPharmacyDueAllowed: (): string | null => ss.getItem('Session-IsPharmacyDueAllowed'),
  getIsDueCheck: (): string | null => ss.getItem('Session-IsDueCheck'),

  /** Generic key-value read (mirrors ngSessionHelper.get) */
  get: (key: string): string | null => ss.getItem(key),
};

export type SessionHelper = typeof sessionHelper;
