export const session = {
  clear: () => sessionStorage.clear(),
  
  set: (key: string, value: string) => sessionStorage.setItem(key, value),
  
  get: (key: string) => sessionStorage.getItem(key),
  
  remove: (key: string) => sessionStorage.removeItem(key),

  setObject: (key: string, value: any) => {
    const strJSON = JSON.stringify(value);
    sessionStorage.setItem(key, strJSON);
  },

  getObject: (key: string) => {
    const strJSON = sessionStorage.getItem(key);
    return strJSON ? JSON.parse(strJSON) : null;
  },

  getAuthToken: () => sessionStorage.getItem('sessionID'),

  getEMRPatientId: () => sessionStorage.getItem('EMRPatientId'),
  setEMRPatientId: (value: string) => sessionStorage.setItem('EMRPatientId', value),

  getMedblazePost: () => sessionStorage.getItem('IsMedBlazePost'),
  setMedblazePost: (value: string) => sessionStorage.setItem('IsMedBlazePost', value),

  getPatientPortalPatientId: () => sessionStorage.getItem('PatientPortalPatientId'),
  setPatientPortalPatientId: (value: string) => sessionStorage.setItem('PatientPortalPatientId', value),

  getCurrentFacilityId: () => {
    const strFacilityId = sessionStorage.getItem('Session-FacilityId');
    return strFacilityId ? parseInt(strFacilityId, 10) : -1;
  },
  setCurrentFacilityId: (value: string) => sessionStorage.setItem('Session-FacilityId', value),

  getdeptPrint: () => sessionStorage.getItem('Session-IsDeptWiseLabPrint'),
  setdeptPrint: (value: string) => sessionStorage.setItem('Session-IsDeptWiseLabPrint', value),

  getCurrentFacilityName: () => sessionStorage.getItem('Session-FacilityName'),
  setCurrentFacilityName: (value: string) => sessionStorage.setItem('Session-FacilityName', value),

  setCurrentDept: (value: string) => sessionStorage.setItem('Session-FacilityName', value), // This replicates the bug/feature in original code

  getCurrentOrgCode: () => sessionStorage.getItem('Session-OrgCode'),
  setCurrentOrgCode: (value: string) => sessionStorage.setItem('Session-OrgCode', value),

  getCurrentFacilityCode: () => sessionStorage.getItem('Session-FacilityCode'),
  setCurrentFacilityCode: (value: string) => sessionStorage.setItem('Session-FacilityCode', value),

  getCurrentItemCategoryId: () => sessionStorage.getItem('Session-ItemCategoryId'),
  setCurrentItemCategoryId: (value: string) => sessionStorage.setItem('Session-ItemCategoryId', value),

  getCurrentSubDepartmentId: () => sessionStorage.getItem('Session-SubDepartmentId'),
  setCurrentSubDepartmentId: (value: string) => sessionStorage.setItem('Session-SubDepartmentId', value),

  getCurrentItemSubCategoryId: () => sessionStorage.getItem('Session-ItemSubCategoryId'),
  setCurrentItemSubCategoryId: (value: string) => sessionStorage.setItem('Session-ItemSubCategoryId', value),

  getCurrentUserId: () => {
    const currentUserId = sessionStorage.getItem('Session-UserId');
    return currentUserId ? parseInt(currentUserId, 10) : null;
  },
  setCurrentUserId: (value: string) => sessionStorage.setItem('Session-UserId', value),

  getCurrentOrgId: () => sessionStorage.getItem('Session-OrgId'),
  setCurrentOrgId: (value: string) => sessionStorage.setItem('Session-OrgId', value),

  getCurrentUserName: () => sessionStorage.getItem('Session-UserName'),
  setCurrentUserName: (value: string) => sessionStorage.setItem('Session-UserName', value),

  getCurrentDepartmentId: () => sessionStorage.getItem('Session-DepartmentId'),
  setCurrentDepartmentId: (value: string) => sessionStorage.setItem('Session-DepartmentId', value),

  getUserDepartments: () => sessionStorage.getItem('Session-UserDepartments'),
  setUserDepartments: (value: string) => sessionStorage.setItem('Session-UserDepartments', value),

  getUserRoles: () => sessionStorage.getItem('Session-UserRoles'),
  setUserRoles: (value: string) => sessionStorage.setItem('Session-UserRoles', value),

  getUserTypeId: () => sessionStorage.getItem('Session-UserTypeId'),
  setUserTypeId: (value: string) => sessionStorage.setItem('Session-UserTypeId', value),

  getCurrentEmployeeId: () => sessionStorage.getItem('Session-EmployeeId'),
  setEmployeeId: (value: string) => sessionStorage.setItem('Session-EmployeeId', value),

  getUserGroupId: () => sessionStorage.getItem('Session-UserGroupId'),
  setUserGroupId: (value: string) => sessionStorage.setItem('Session-UserGroupId', value),

  getClinicalRoleId: () => sessionStorage.getItem('Session-ClinicalRoleId'),
  setClinicalRoleId: (value: string) => sessionStorage.setItem('Session-ClinicalRoleId', value),

  getIsPharmacyDueAllowed: () => sessionStorage.getItem('Session-IsPharmacyDueAllowed'),
  setIsPharmacyDueAllowed: (value: string) => sessionStorage.setItem('Session-IsPharmacyDueAllowed', value),

  getIsDueCheck: () => sessionStorage.getItem('Session-IsDueCheck'),
  setIsDueCheck: (value: string) => sessionStorage.setItem('Session-IsDueCheck', value),

  getPatientDashboardRecordCount: () => {
    const count = sessionStorage.getItem('dashboard-record-count');
    return count ? parseInt(count, 10) : 0;
  },

  getPatientEncounter: () => {
    const strJSON = sessionStorage.getItem('EMR-CURRENT-ENCOUNTER');
    return strJSON ? JSON.parse(strJSON) : null;
  },
  setPatientEncounter: (value: any) => {
    if (value) {
      sessionStorage.setItem('EMR-CURRENT-ENCOUNTER', JSON.stringify(value));
    }
  },

  getEncounterId: () => {
    const strJSON = sessionStorage.getItem('EMR-CURRENT-ENCOUNTER');
    if (strJSON) {
      const encounterObj = JSON.parse(strJSON);
      return encounterObj ? encounterObj.Id : null;
    }
    return null;
  },

  getPatientGender: () => sessionStorage.getItem('PATIENT-GENDER'),
  setPatientGender: (value: string) => sessionStorage.setItem('PATIENT-GENDER', value),

  getPatientDOB: () => sessionStorage.getItem('PATIENT-DOB'),
  setPatientDOB: (value: string) => sessionStorage.setItem('PATIENT-DOB', value),

  getLandingState: () => sessionStorage.getItem('LandingState'),
  setLandingState: (value: string) => sessionStorage.setItem('LandingState', value),
};
