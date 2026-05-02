(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PrescriptionPadFormController', PrescriptionPadFormController);

    function PrescriptionPadFormController($scope, $stateParams, $state, $translate, Upload, utl) {
        var vm = this;

        $scope.item = {
            EncounterId: utl.Session.getEncounterId(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            CreatedBy: utl.Session.getCurrentUserId(),
            PrescribedOn: utl.Formatter.getCurrentDate(),
        };
        angular.extend(this, utl.Ctrl.getEMRBaseCtrl({
            $scope: $scope
        }));

        $scope.currentcontext = {
            file: null
        };

        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        if ($scope.currentcontext.encounter) {
            $scope.item.DoctorId = $scope.currentcontext.encounter.DoctorId;
        }
        $scope.item.PatientId = $scope.currentcontext.pid;


        $scope.getPrescribedInfoCallback = function (scope, data, options, hasError) {
            $scope.currentcontext.PrescriptionPhoto = data;
        };

        $scope.getPrescribedInfo = function () {
            if ($scope.item.PrescriptionSheet) {
                var inputData = {
                    PrescriptionSheet: $scope.item.PrescriptionSheet
                };
                var options = {
                    action: 'emr/PrescriptionPad/GetPrescriptionPadInfo',
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.getPrescribedInfoCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.getPrescribedInfo();
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'emr/PrescriptionPad/GetPrescriptionPadById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.openprescribepad = function () {
            // $state.go('patientemr.prescribepad');
            // refreshSign();
            utl.Modal.open('prescribe-pad', {
                params: {},
                confirmCallback: refreshSign
            });
        }

        function refreshSign(prescribeData) {
            $scope.item.PrescriptionData = prescribeData;
            if (prescribeData) {
                $scope.item.prescData = prescribeData.split(',')[1];
            }
        }

        //Document attachment code starts
        $scope.fileSelected = function () {
            if ($scope.currentcontext.file && $scope.currentcontext.file.name) {
                $scope.item.Name = $scope.currentcontext.file.name;
            }
        }
        //Document attachment code ends
        $scope.backToList = function () {
            $state.go('patientemr.prescriptionpadlist');
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function () {

            var actionName = 'emr/PrescriptionPad/AddPrescriptionPad';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'emr/PrescriptionPad/UpdatePrescriptionPad';
            }

            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "PrescriptionType"
            }, ];

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

    PrescriptionPadFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'Upload', 'utl'];

})();