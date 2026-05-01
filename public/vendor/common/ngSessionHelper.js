(function () {
    'use strict';

    angular
        .module('common.utils')
        .factory('ngSessionHelper', function (toastr) {

            var clear = function () {
                sessionStorage.clear();
            }

            var setValue = function (key, value) {
                sessionStorage.setItem(key, value);
            }

            var removeValue = function (key) {
                return sessionStorage.removeItem(key);
            }

            var getValue = function (key) {
                return sessionStorage.getItem(key);
            }

            var setObject = function (key, value) {
                var strJSON = JSON.stringify(value);
                sessionStorage.setItem(key, strJSON);
            }

            var getObject = function (key) {
                var strJSON = sessionStorage.getItem(key);
                var resultObj = JSON.parse(strJSON);
                return resultObj;
            }

            var getAuthToken = function () {
                return sessionStorage.getItem('sessionID');
            }

            var getEMRPatientId = function () {
                return sessionStorage.getItem('EMRPatientId');
            }

            var setEMRPatientId = function (value) {
                return sessionStorage.setItem('EMRPatientId', value);
            }

            var getMedblazePost = function () {
                return sessionStorage.getItem('IsMedBlazePost');
            }

            var setMedblazePost = function (value) {
                return sessionStorage.setItem('IsMedBlazePost', value);
            }

            var getPatientPortalPatientId = function () {
                return sessionStorage.getItem('PatientPortalPatientId');
            }

            var setPatientPortalPatientId = function (value) {
                return sessionStorage.setItem('PatientPortalPatientId', value);
            }

            var getCurrentFacilityId = function () {
                var strFacilityId = sessionStorage.getItem('Session-FacilityId');
                return strFacilityId ? parseInt(strFacilityId) : -1;
            }

            var setCurrentFacilityId = function (value) {
                return sessionStorage.setItem('Session-FacilityId', value);
            }

            var getdeptPrint = function () {
                var strdeptPrint = sessionStorage.getItem('Session-IsDeptWiseLabPrint');
                return strdeptPrint;
            }

            var setdeptPrint = function (value) {
                return sessionStorage.setItem('Session-IsDeptWiseLabPrint', value);
            }

            var getCurrentFacilityName = function () {
                var strFacilityName = sessionStorage.getItem('Session-FacilityName');
                return strFacilityName;
            }

            var setCurrentFacilityName = function (value) {
                return sessionStorage.setItem('Session-FacilityName', value);
            }
            var setCurrentDept = function (value) {
                return sessionStorage.setItem('Session-FacilityName', value);
            }
            var getCurrentOrgCode = function () {
                return sessionStorage.getItem('Session-OrgCode');
            }
            var setCurrentOrgCode = function (value) {
                return sessionStorage.setItem('Session-OrgCode', value);
            }
            var getCurrentFacilityCode = function () {
                return sessionStorage.getItem('Session-FacilityCode');
            }
            var setCurrentFacilityCode = function (value) {
                return sessionStorage.setItem('Session-FacilityCode', value);
            }
            var getCurrentItemCategoryId = function () {
                return sessionStorage.getItem('Session-ItemCategoryId');
            }

            var setCurrentItemCategoryId = function (value) {
                return sessionStorage.setItem('Session-ItemCategoryId', value);
            }

            var getCurrentSubDepartmentId = function () {
                return sessionStorage.getItem('Session-SubDepartmentId');
            }

            var setCurrentSubDepartmentId = function (value) {
                return sessionStorage.setItem('Session-SubDepartmentId', value);
            }

            var getCurrentItemSubCategoryId = function () {
                return sessionStorage.getItem('Session-ItemSubCategoryId');
            }

            var setCurrentItemSubCategoryId = function (value) {
                return sessionStorage.setItem('Session-ItemSubCategoryId', value);
            }

            var getCurrentUserId = function () {
                var currentUserId = sessionStorage.getItem('Session-UserId');
                return parseInt(currentUserId);
            }

            var setCurrentUserId = function (value) {
                return sessionStorage.setItem('Session-UserId', value);
            }

            var getCurrentOrgId = function () {
                return sessionStorage.getItem('Session-OrgId');
            }

            var setCurrentOrgId = function (value) {
                return sessionStorage.setItem('Session-OrgId', value);
            }

            var getCurrentUserName = function () {
                return sessionStorage.getItem('Session-UserName');
            }

            var setCurrentUserName = function (value) {
                return sessionStorage.setItem('Session-UserName', value);
            }

            var getCurrentDepartmentId = function () {
                return sessionStorage.getItem('Session-DepartmentId');
            }

            var setCurrentDepartmentId = function (value) {
                return sessionStorage.setItem('Session-DepartmentId', value);
            }

            var getUserDepartments = function () {
                return sessionStorage.getItem('Session-UserDepartments');
            }

            var setUserDepartments = function (value) {
                return sessionStorage.setItem('Session-UserDepartments', value);
            }

            var getUserRoles = function () {
                return sessionStorage.getItem('Session-UserRoles');
            }

            var setUserRoles = function (value) {
                return sessionStorage.setItem('Session-UserRoles', value);
            }

            var getUserTypeId = function () {
                return sessionStorage.getItem('Session-UserTypeId');
            }

            var setUserTypeId = function (value) {
                return sessionStorage.setItem('Session-UserTypeId', value);
            }

            var getCurrentEmployeeId = function () {
                return sessionStorage.getItem('Session-EmployeeId');
            }

            var setEmployeeId = function (value) {
                return sessionStorage.setItem('Session-EmployeeId', value);
            }

            var getUserGroupId = function () {
                return sessionStorage.getItem('Session-UserGroupId');
            }

            var setUserGroupId = function (value) {
                return sessionStorage.setItem('Session-UserGroupId', value);
            }

            var getClinicalRoleId = function () {
                return sessionStorage.getItem('Session-ClinicalRoleId');
            }

            var setClinicalRoleId = function (value) {
                return sessionStorage.setItem('Session-ClinicalRoleId', value);
            }

            var getIsPharmacyDueAllowed = function () {
                return sessionStorage.getItem('Session-IsPharmacyDueAllowed');
            }

            var setIsPharmacyDueAllowed = function (value) {
                return sessionStorage.setItem('Session-IsPharmacyDueAllowed', value);
            }

            var getIsDueCheck = function () {
                return sessionStorage.getItem('Session-IsDueCheck');
            }

            var setIsDueCheck = function (value) {
                return sessionStorage.setItem('Session-IsDueCheck', value);
            }

            var getPatientDashboardRecordCount = function () {
                return parseInt(sessionStorage.getItem('dashboard-record-count'));
            }

            function getEncounter() {
                var strJSON = sessionStorage.getItem('EMR-CURRENT-ENCOUNTER');
                if (strJSON) {
                    return JSON.parse(strJSON);
                }
                return;
            }

            var getPatientEncounter = function () {
                return getEncounter();
            }

            var setPatientEncounter = function (value) {
                if (value) {
                    var strJSON = JSON.stringify(value);
                    sessionStorage.setItem("EMR-CURRENT-ENCOUNTER", strJSON);
                }
            }

            var getEncounterId = function () {
                var encounterObj = getEncounter();
                if (encounterObj) {
                    return encounterObj.Id;
                }
                return null;
            }

            var getPatientGender = function () {
                return sessionStorage.getItem("PATIENT-GENDER");
            }

            var setPatientGender = function (value) {
                sessionStorage.setItem("PATIENT-GENDER", value);
            }

            var getPatientDOB = function () {
                return sessionStorage.getItem("PATIENT-DOB");
            }

            var setPatientDOB = function (value) {
                sessionStorage.setItem("PATIENT-DOB", value);
            }

            var getLandingState = function () {
                return sessionStorage.getItem("LandingState");
            }

            var setLandingState = function (value) {
                sessionStorage.setItem("LandingState", value);
            }



            return {
                get: getValue,
                set: setValue,
                remove: removeValue,
                setObject: setObject,
                getObject: getObject,
                clear: clear,
                getAuthToken: getAuthToken,
                getEMRPatientId: getEMRPatientId,
                setEMRPatientId: setEMRPatientId,
                setCurrentFacilityId: setCurrentFacilityId,
                getCurrentFacilityId: getCurrentFacilityId,
                setCurrentFacilityName: setCurrentFacilityName,
                getCurrentFacilityName: getCurrentFacilityName,
                setdeptPrint: setdeptPrint,
                getdeptPrint: getdeptPrint,
                setCurrentItemCategoryId: setCurrentItemCategoryId,
                setCurrentItemSubCategoryId: setCurrentItemSubCategoryId,
                getCurrentItemCategoryId: getCurrentItemCategoryId,
                getCurrentItemSubCategoryId: getCurrentItemSubCategoryId,
                setCurrentUserId: setCurrentUserId,
                getCurrentUserId: getCurrentUserId,
                setCurrentOrgId: setCurrentOrgId,
                getCurrentOrgId: getCurrentOrgId,
                setCurrentOrgCode: setCurrentOrgCode,
                getCurrentOrgCode: getCurrentOrgCode,
                getCurrentFacilityCode: getCurrentFacilityCode,
                setCurrentFacilityCode: setCurrentFacilityCode,
                setCurrentFacilityId: setCurrentFacilityId,
                setCurrentUserName: setCurrentUserName,
                getCurrentUserName: getCurrentUserName,
                getPatientPortalPatientId: getPatientPortalPatientId,
                setPatientPortalPatientId: setPatientPortalPatientId,
                getUserTypeId: getUserTypeId,
                getCurrentEmployeeId: getCurrentEmployeeId,
                setUserTypeId: setUserTypeId,
                setEmployeeId: setEmployeeId,
                getUserGroupId: getUserGroupId,
                setUserGroupId: setUserGroupId,
                getClinicalRoleId: getClinicalRoleId,
                setClinicalRoleId: setClinicalRoleId,
                getIsPharmacyDueAllowed: getIsPharmacyDueAllowed,
                setIsPharmacyDueAllowed: setIsPharmacyDueAllowed,
                getIsDueCheck: getIsDueCheck,
                setIsDueCheck: setIsDueCheck,
                getCurrentDepartmentId: getCurrentDepartmentId,
                setCurrentDepartmentId: setCurrentDepartmentId,
                getPatientDashboardRecordCount: getPatientDashboardRecordCount,
                getUserDepartments: getUserDepartments,
                setUserDepartments: setUserDepartments,
                getPatientEncounter: getPatientEncounter,
                setPatientEncounter: setPatientEncounter,
                getUserRoles: getUserRoles,
                setUserRoles: setUserRoles,
                getEncounterId: getEncounterId,
                setPatientGender: setPatientGender,
                getPatientGender: getPatientGender,
                setPatientDOB: setPatientDOB,
                getPatientDOB: getPatientDOB,
                getCurrentSubDepartmentId: getCurrentSubDepartmentId,
                setCurrentSubDepartmentId: setCurrentSubDepartmentId,
                getLandingState: getLandingState,
                setLandingState: setLandingState,
                setMedblazePost: setMedblazePost,
                getMedblazePost: getMedblazePost
            };
        });

})();