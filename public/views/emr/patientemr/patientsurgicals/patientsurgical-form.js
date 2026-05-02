(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientSurgicalFormController', patientSurgicalFormController);

    function patientSurgicalFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            PatientSurgicalStatusId: 1,
            PerformedDate: utl.Formatter.getCurrentDate(),
            EncounterId: utl.Session.getEncounterId(),
            PatientSurgicalStatusId: 1
        };

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.item.ConsultationId = modalConfig.params.cid ? parseInt(modalConfig.params.cid) : null;

            if (modalConfig.params.itemid) {
                $scope.item.ProcedureId = parseInt(modalConfig.params.itemid);
            }

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        } else {
            $scope.currentcontext.id = parseInt($stateParams.id);
            $scope.currentcontext.pid = parseInt($stateParams.pid);
        }

        $scope.item.PatientId = $scope.currentcontext.pid;

        $scope.item.PerformedDate = utl.Formatter.getCurrentDate();

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'emr/patientsurgical/GetPatientSurgicalById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {

            if ($scope.currentcontext.ismodal) {
                $scope.confirmCallback();
            } else {
                $state.go('patientemr.patientsurgicals', {
                    pid: $scope.currentcontext.pid
                });
            }
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function () {

            // if(!$scope.item_form.isValid()) {
            //    utl.Alert.showErrorMsg($translate.instant('common.validationmsg.lbl'));
            //    return;
            // }

            var actionName = 'emr/patientsurgical/AddPatientSurgical';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'emr/patientsurgical/UpdatePatientSurgical';
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

        //setDefaults
        function setDefaults() {
            if ($scope.item.ProcedureId > 0) {
                var procedure = utl.Lookup.getObject($scope.lookup.Procedure, $scope.item.ProcedureId);
                $scope.fillMasterInfo(procedure);
            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            setDefaults();
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "Procedure"
                },
                {
                    "Key": "ProcedureType"
                },
                {
                    "Key": "PatientSurgicalStatus"
                },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }


        $scope.fillMasterInfo = function (selectedItem) {
            $scope.item.ProcedureName = selectedItem.ProcedureName;
            $scope.item.Code = selectedItem.Code;
            $scope.item.Description = selectedItem.Description;
        }

        $scope.initLookup();
    }

    patientSurgicalFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();