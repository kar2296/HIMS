(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('clinicalpatientController', clinicalpatientController);

    function clinicalpatientController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            PatientName: '',
            AdmissionStatusId: 4,
            isCompleted: true,
            DischargeorderstatusId: 2
        };

        $scope.currentcontext = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.currentcontext.encounterid = parseInt(modalConfig.params.EncounterId);
            $scope.Patient = modalConfig.params.Encounter.Patient;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        // $scope.item.PatientId = $scope.currentcontext.pid;
        console.log('clinicaldischarge.js');
        //get patient profile


        $scope.getItemCallback = function(scope, data, options, hasError) {
            $scope.item = data;
            $scope.item.ClinicalDischargeDate = utl.Formatter.getCurrentDate();
            $scope.item.EncounterId = $scope.currentcontext.id;
            $scope.item.DischargeorderstatusId = 2;
            $scope.item.isCompleted = true;
            $scope.item.AdmissionStatusId = $scope.item.AdmissionStatusId + 1;
            var doctorObj = utl.Lookup.getObject($scope.lookup.Doctor, $scope.item.DoctorId);
            $scope.item.DepartmentId = doctorObj.DepartmentId;
        };
        $scope.getItem = function() {

            // $scope.getEncounters()
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'IPManagement/PatientDischargeEvent/GetPatientDischargeEventById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.populateEstimateDisDate = function() {
            if ($scope.item.ALOS && $scope.item.ALOS != 0 && $scope.item.ClinicalDischargeDate && $scope.item.ClinicalDischargeDate != '') {
                var ClinicalDischargeDate = new Date($scope.item.ClinicalDischargeDate);
                $scope.item.ExpectedDischargeDate = new Date(ClinicalDischargeDate.getFullYear(),
                    ClinicalDischargeDate.getMonth(),
                    ClinicalDischargeDate.getDate() + parseInt($scope.item.ALOS));
            }
        }
        $scope.doctorChange = function(selectedItem) {
            var doctorObj = utl.Lookup.getObject($scope.lookup.Doctor, $scope.item.DoctorId);
            $scope.item.DepartmentId = doctorObj.DepartmentId;
            $scope.item.DoctorName = selectedItem.Text;
        }
        $scope.save = function() {
            $scope.item.AdmissionStatusId = 4;
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'currentinpatient.clinicalconfirmmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);
            // $scope.saveItem();
        };
        $scope.Reverse = function() {


            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'currentinpatient.previousconfirmmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.reverse,

            };
            utl.Dialog.confirmMessage(confirmOptions);

        }

        $scope.reverse = function() {
            $scope.item.AdmissionStatusId = 3;
            $scope.saveItem();

        };


        $scope.patientprofiledetails = function() {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: $scope.item.PatientId },
                confirmCallback: $scope.getItem
            });
        }
        $scope.backToList = function() {
            $scope.confirmCallback();
        }
        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function() {

            // if(!$scope.item_form.isValid()) {
            //    utl.Alert.showErrorMsg($translate.instant('common.validationmsg.lbl'));
            //    return;
            // }

            var actionName = 'IPManagement/PatientDischargeEvent/AddPatientDischargeEvent';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'IPManagement/PatientDischargeEvent/UpdatePatientDischargeEvent';
            }
            $scope.item.EncounterId = $scope.currentcontext.encounterid;

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);

        };




        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function() {
            var inputData = [
                { "Key": "DischargeType" },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "Department" },
                { "Key": "Outcome" },
                { "Key": "ModeOfTransport" },
                { "Key": "Period" },
                { "Key": "DischargeOrderStatus" },
                { "Key": "ClinicalStatus" },
                { "Key": "InfectionType" },
                { "Key": "AdmissionStatus" },
                { "Key": "Encounter" }
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

    clinicalpatientController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();