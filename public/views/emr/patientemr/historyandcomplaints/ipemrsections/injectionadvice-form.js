(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('InjectionAdviceFormController', InjectionAdviceFormController);

    function InjectionAdviceFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            AppointmentDate: utl.Formatter.getCurrentDate(),
        };
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.currentcontext.eid = parseInt(modalConfig.params.eid);
            $scope.currentcontext.cid = parseInt(modalConfig.params.cid);
            $scope.currentcontext.injid = parseInt(modalConfig.params.injid);
            $scope.currentcontext.injname = modalConfig.params.injname;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        if ($scope.currentcontext.encounter) {
            $scope.currentcontext.eid = $scope.currentcontext.encounter.Id;
            $scope.currentcontext.enctypeid = $scope.currentcontext.encounter.EncounterTypeId;
        }
        $scope.item.PatientId = $scope.currentcontext.pid;
        $scope.item.EncounterId = $scope.currentcontext.eid;
        $scope.item.ConsultationId = $scope.currentcontext.cid;
        $scope.item.InjectionNameId = $scope.currentcontext.injid;
        $scope.item.InjectionName = $scope.currentcontext.injname;


        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'emr/PatientInjectionAdvice/GetPatientInjectionAdviceById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $scope.confirmCallback();
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.saveItem = function () {
            var actionName = 'emr/PatientInjectionAdvice/AddPatientInjectionAdvice';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'emr/PatientInjectionAdvice/UpdatePatientInjectionAdvice';
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
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "EyeSide", "Default": false },
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

    InjectionAdviceFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();