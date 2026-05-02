(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('admissionRequestFormController', admissionRequestFormController);

    function admissionRequestFormController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.item = {
            IsActive: true,
            AdmissionDate: utl.Formatter.getCurrentDate(),
            PatientId: -1,
            FacilityId: utl.Session.getCurrentFacilityId(),
            AdmissionRequestTypeId: 1,
            isRequested: false,
        };

        $scope.currentcontext = {};
        $scope.lookup = {};
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.selectedPatient = {};
        $scope.getPatientInfo = function (scope, data, options, hasError) {
            $scope.selectedPatient = data;
        }
        //$scope.currentfilter = { PatientId: -1 };
        $scope.patientChange = function () {
            //console.log($scope.item.PatientId);
            if ($scope.item.PatientId > 0) {
                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: { Id: $scope.item.PatientId },
                    type: 'post',
                    onComplete: $scope.getPatientInfo
                };
                utl.Http.doAction(options);
            }
        }
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            //$scope.currentfilter.PatientId = $scope.item.PatientId;
            $scope.item.AdmissionDate = new Date(data.AdmissionDate);
            if (data.AdmissionRequestStatusId == 2)
                $scope.item.isRequested = true;
            $scope.loadAdditionalLookup();
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'IPManagement/admissionrequest/GetAdmissionRequestById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.patientprofiledetails = function () {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: $scope.item.PatientId },
                confirmCallback: $scope.getItem
            });
        }

        $scope.backToList = function () {
            $state.go('app.admissionrequests');
        }

        $scope.populateEstimateDisDate = function () {
            if ($scope.item.ALOS && $scope.item.ALOS != 0 && $scope.item.AdmissionDate && $scope.item.AdmissionDate != '') {
                var AdmissionDate = new Date($scope.item.AdmissionDate);
                $scope.item.ExceptedDisDate = new Date(AdmissionDate.getFullYear(),
                    AdmissionDate.getMonth(),
                    AdmissionDate.getDate() + parseInt($scope.item.ALOS));
            }
        }

        $scope.clearItem = function () {
            $scope.item = {};
            $scope.fillDefaultValues();
        }

        $scope.save = function () {
            $scope.item.ActiveStatus = 'Draft'
            $scope.saveItem();
        };

        $scope.saveAndApprove = function () {
            $scope.item.ActiveStatus = 'Active'
            $scope.saveItem();
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.admit = function () {
            $state.go('app.admissions', { id: 0 });
        }
        $scope.openDiagnosis = function () {

        }
        $scope.changeServiceRateCategory = function (selectedItem) {
            $scope.item.ServiceRateCategoryId = selectedItem.ServiceRateCategory.Id;
        }
        $scope.saveItem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'IPManagement/admissionrequest/AddAdmissionRequest';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'IPManagement/admissionrequest/UpdateAdmissionRequest';
                if ($scope.item.AdmissionRequestStatusId == 1) {
                    $scope.item.AdmissionRequestStatusId = 2;
                }
            }
            else {
                $scope.item.AdmissionRequestStatusId = 1;
            }
            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
            });
        }

        $scope.print = function () {
            var inputData = {
                Id: $scope.item.Id
            };
            var options = {
                action: 'IPManagement/admissionrequest/PrintAdmissionRequest',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }

        $scope.lookupCall = function (inputData) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,

                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.initAllLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "Diagnosis" },
                { "Key": "AdmissionRequestType" },
                { "Key": "AdmittingReason" },
                { "Key": "Location" },
                { "Key": "ServiceRateCategory" },
                { "Key": "Remark" },
                { "Key": "Priority" },
                { "Key": "Patient" }
            ]
            $scope.lookupCall(inputData);
            $scope.getItem();
            $scope.loadAdditionalLookup();
        }

        $scope.wardLookUp = function () {
            var inputData = [
                {
                    "Key": "Ward", Request: {
                        Params: [{ Key: 2, Value: $scope.item.FacilityId || 0 },
                        { Key: 5, Value: $scope.item.LocationId || 0 }]
                    }
                },
            ];
            $scope.lookupCall(inputData);
            $scope.item.WardId = $scope.item.WardId || 0;
            $scope.item.RoomId = $scope.item.RoomId || 0;
            $scope.item.BedId = $scope.item.BedId || 0;
        }

        $scope.getRoomLookUp = function () {
            var inputData = [{
                "Key": "Room",
                Request: {
                    Params: [
                        { Key: 2, Value: $scope.item.WardId || 0 }
                    ]
                }
            }];
            $scope.lookupCall(inputData);
        }

        $scope.getBedLookUp = function () {
            var inputData = [{
                "Key": "Bed",
                Request: {
                    Params: [
                        { Key: 1, Value: $scope.item.WardId || 0 },
                        { Key: 2, Value: $scope.item.RoomId || 0 }
                    ]
                }
            }];
            $scope.lookupCall(inputData);
        }

        $scope.loadAdditionalLookup = function () {
            $scope.wardLookUp();
            $scope.getRoomLookUp();
            $scope.getBedLookUp();
        }

        $scope.initAllLookup();
    }
    admissionRequestFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();