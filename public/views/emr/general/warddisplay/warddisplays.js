(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('warddisplayController', warddisplayController);

    function warddisplayController($scope, $stateParams, $state, $translate, $interval, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.currentcontext = {};
        $scope.Items = [];
        $scope.ListofEncounters = [];
        $scope.CurrentPage = 1;
        $scope.PageInitialzation = 1;
        $scope.totalrecord = -1;
        $scope.startinterval = null;
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.getEncounterListCallback = function (scope, res, options, hasError) {
            $scope.ListofEncounters = res;
            var listLength = $scope.ListofEncounters.length;
            var pageCount = Math.ceil(listLength / 5);
            if ($scope.totalrecord != $scope.ListofEncounters.length) {
                $scope.totalrecord = $scope.ListofEncounters.length;
                $scope.CurrentPage = 1;
                $scope.PageInitialzation = 1;
                $interval.cancel($scope.startinterval);
            }
            if ($scope.PageInitialzation == 1) {
                $scope.getList($scope.CurrentPage);
                $scope.PageInitialzation++;
                $scope.startinterval = $interval(function () {
                    $scope.getEncounterList();
                    if ($scope.CurrentPage <= pageCount) {
                        $scope.getList($scope.CurrentPage);
                        $scope.CurrentPage += 1;
                    }
                    else {
                        $scope.CurrentPage = 1;
                        $scope.getList($scope.CurrentPage);
                    }
                }, 3 * 1000);
            }
        }
        $scope.getEncounterList = function () {
            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'Visit/Visit/GetListofEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getEncounterListCallback
            };
            utl.Http.doAction(options);
        }; 
        
        $scope.getListCallback = function (scope, res, options, hasError) {
            var icurindx = $scope.CurrentPage; 
            var totaldata = res.Data;
            
            for (var i = res.Data.length; i < 5; i++) {
                var emptydata = {
                    "Id": i, "EncounterTypeId": null, "VisitIdentifier": '', "PatientId": null,
                    "PatientMrn": null, "DoctorId": null, "DoctorName": null, "SpecialityId": null, "DepartmentId": null,
                    "ReferralId": null, "ReferralName": null, "ReferralTypeId": null, "GuarantorId": null, "GuarantorTypeId": null,
                    "AdmissionDate": null, "DischargeDate": null, "OrganizationId": null, "FacilityId": null, "TokenId": null,
                    "AdmissionRequestTypeId": null, "ArrivedDate": null, "CallDate": null, "ExpectedDischargeDate": null,
                    "BookingId": null, "AdmissionRequestId": null, "PreviousEncounterId": null, "IsReadmission": null,
                    "IsLatest": null, "AppointmentId": null, "AdmittingReasonId": null, "DischargeTypeId": null,
                    "AssignId": null, "AssignedGroupId": null, "VisitReasonId": null, "MergedEncounterId": null,
                    "ALOS": null, "LocationId": null, "OtherDiagnosis": null, "WardId": null, "RoomId": null, "BedId": null,
                    "ServiceRateCategoryId": null, "DiagnosisId": null, "AdmitDiagnosis": null, "AttenderName": null,
                    "GuardianTypeId": null, "AttenderPhone": null, "IsMRDRequest": null, "IsBillLock": null, "IsWalkin": null,
                    "IsMLC": null, "PatientDietNbmTypeId": null, "IsBillFinalized": null, "PriorityId": null, "AdmissionPriorityId": null,
                    "ClinicalStaffId": null, "IsMassCasuality": null, "DischargeDepartmentId": null, "EncounterStatusId": null,
                    "AdmissionStatusId": 2, "Comments": null, "Status": 1, "Rev": 0, "CreatedBy": 1, "CreatedAt": null, "UpdatedBy": 1,
                    "UpdatedAt": null, "Facility": { "FacilityName": null }, "ServiceRateCategory": { "ServiceRateCategory": null },
                    "Diagnosis": null, "Speciality": null, "Department": { "DepartmentName": '' }, "EncounterType": { "Description": "IP" },
                    "WardRoomMaster": { "RoomNo": '', "RoomTypeMaster": { "RoomTypeName": null } }, "WardRoomBedMaster": {
                        "BedNo": '',
                        "Description": null, "ServiceRateCategoryId": null, "WardRoomMaster": { "Id": i, "RoomNo": null, "Description": null }
                    },
                    "AdmissionRequest": null, "Created": { "FirstName": null, "LastName": "User", "Title": { "Description": null } },
                    "Doctor": { "FirstName": '', "LastName": '', "Title": { "Description": '' } }, "Assignee": null, "ClinicalStaff": null,
                    "DischargeDepartment": null, "UserTeam": null, "Priority": null, "AdmissionPriority": null,
                    "AdmissionRequestType": { "Description": null }, "AdmissionStatus": { "Description": '', "ColorCode": null },
                    "AppointmentStatus": { "Description": null }, "AdmittingReason": { "Description": '' },
                    "VisitReason": null, "Patient": {
                        "Id": i, "TitleId": null, "FirstName": '', "LastName": '',
                        "MRN": '', "Age": '', "GenderId": null, "DOB": '', "AddressLine1": null, "AddressLine2": null,
                        "Pincode": null, "Area": null, "City": null, "State": null, "Mobile": null, "PhotoPath": null,
                        "MaritalStatusId": null, "Title": { "Description": '' }, "Gender": { "Description": '' },
                        "MaritalStatus": { "Description": null }
                    },
                    "PatientGuarantor": {
                        "Id": i, "GuarantorId": null, "GuarantorName": null,
                        "GuarantorTypeId": null, "TpaId": null,
                        "GuarantorType": { "Description": null, "ColorCode": null }, "Tpa": null
                    },
                    "WardMaster": { "WardName": null, "WardMasterTypeId": null }
                };

                totaldata.push(emptydata);
            }
            $scope.Encounters = totaldata;


        };

        $scope.getList = function (PageNumber) { 
            if ($uibModalInstance) {
                if ($uibModalInstance.closed) {
                    var statusclsd = $uibModalInstance.closed.$$state.status;
                    if (statusclsd == 1) {                       
                        $interval.cancel($scope.startinterval);
                    }
                }
            }

            var inputData = {
                Params: [
                    { Key: 15, Value: 2 },
                    { Key: 2, Value: $scope.currentcontext.id },
                    { Key: 3, Value: [2, 3, 4, 5] }

                ],
                PageContext: {
                    PageSize: 5,
                    PageNumber: PageNumber
                }
            };

            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getEncounterList();

    }
    warddisplayController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$interval', 'utl', '$uibModalInstance', 'modalConfig'];

})();