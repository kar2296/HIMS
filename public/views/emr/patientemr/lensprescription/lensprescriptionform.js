(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('lensprescriptionControllerform', lensprescriptionControllerform);

    function lensprescriptionControllerform($scope, $interval, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.item = {
            StartDate: utl.Formatter.getCurrentDate(),
            EncounterId: utl.Session.getEncounterId(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            // LensPrescriptionStatusId: 2,
            LensPrescriptionDate: utl.Formatter.getCurrentDate()
        };
        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.LensId = parseInt($stateParams.LensIdentifier);
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        if ($stateParams.pid)
            $scope.currentcontext.pid = parseInt($stateParams.pid);
        $scope.item.PatientId = $scope.currentcontext.pid;
        $scope.item.DoctorId = $scope.currentcontext.encounter.DoctorId;
        $scope.item.DepartmentId = $scope.currentcontext.encounter.DepartmentId;


        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            // if ($scope.item.LensPrescriptionStatusId == 1 || $scope.item.LensPrescriptionStatusId == 2 || $scope.item.LensPrescriptionStatusId == 3) {
            //     $scope.IsDisabled = true;
            // }

            if (data.LensPrescriptionStatusId == 1) {
                $scope.item.DisplayLensPrecriptionStatus = 'Draft';
            }
            if (data.LensPrescriptionStatusId == 2) {
                $scope.item.DisplayLensPrecriptionStatus = 'Created';
            }
            if (data.LensPrescriptionStatusId == 3) {
                $scope.item.DisplayLensPrecriptionStatus = 'Cancelled';
            }
            // $scope.applyVisibilityRules();
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'emr/LensPrescription/GetLensPrescriptionById',
                    data: { Id: $scope.currentcontext.id, PatientId: $scope.currentcontext.pid },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.Clear = function () {
            $scope.item = {};
        };
        $scope.backToList = function () {
            $state.go('patientemr.lensprescription', { pid: $scope.currentcontext.pid });
        }
        $scope.Cancel = function () {
            $scope.item.LensPrescriptionStatusId = 3;
            $scope.saveItem();
        }
        $scope.saveAndApprove = function () {
            $scope.item.LensPrescriptionStatusId = 2;
            $scope.saveItem();
        }
        $scope.save = function () {
            $scope.item.LensPrescriptionStatusId = 1;
            $scope.saveItem();
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (typeof (data) == "number") {
                $scope.currentcontext.id = data;
            }
            else if (typeof (data) == "boolean") {
                $scope.currentcontext.id = options.data.Data.Id;
            }

            $scope.getItem();
            //$scope.backToList();
        };
        // $scope.addNew = function () {
        //     if ($scope.currentcontext.encounter.IsBillLock == false) {
        //         $state.go('patientemr.lensprescriptionform', { id: 0, pid: $scope.currentcontext.pid });
        //     } else
        //         utl.Alert.showErrorMsg(" Bill is Locked");
        // }

        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
        }

        $scope.addNew = function () {
            $stateParams.id = $scope.currentcontext.id;
            if ($stateParams.id > 0) {
                if ($scope.currentcontext.encounter.IsBillLock == false)
                    $state.go('patientemr.lensprescriptionform', { id: 0, pid: $scope.currentcontext.pid });
                else
                    utl.Alert.showErrorMsg(" Bill is Locked");
            }
        };

        $scope.saveItem = function () {

            // if (!utl.Validator.validate($scope)) {
            //     return;
            // }
            var actionName = 'emr/LensPrescription/AddLensPrescription';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'emr/LensPrescription/UpdateLensPrescription';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };
        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.id,
                PId: $scope.currentcontext.pid

            };
            var options = {
                action: 'emr/lensprescription/PrintLensPrescription',
                data: inputData,
                type: 'post'
            };
            utl.Http.doPrint(options);
        }

        //lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [
                // { "Key": "Allergy" },
                // { "Key": "AllergyType" },
                // { "Key": "AllergySeverity" },
                // { "Key": "ADRScore" },
                { "Key": "LensPrescriptionStatus" }
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }
        $scope.initLookup();
    }

    lensprescriptionControllerform.$inject = ['$scope', '$interval', '$stateParams', '$state', '$translate', 'utl'];

})();