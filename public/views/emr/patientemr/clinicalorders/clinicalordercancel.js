(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('clinicalordersCancelCurrentListController', clinicalordersCancelCurrentListController);

    function clinicalordersCancelCurrentListController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.items = [];
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if ($stateParams.context) {
            $scope.context = $stateParams.context;
        }
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.eid = parseInt(modalConfig.params.eid);
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.currentcontext.bid = parseInt(modalConfig.params.bid);
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.currentcontext.osid = parseFloat(modalConfig.params.osid);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        if ($stateParams.pid)
            $scope.currentcontext.PatientId = $stateParams.pid;
        else
            $scope.currentcontext.PatientId = parseInt(utl.Session.getEMRPatientId());

        if ($stateParams.eid)
            $scope.currentcontext.EncounterId = $stateParams.eid;
        else
            $scope.currentcontext.EncounterId = parseInt(utl.Session.getEncounterId());

        $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        if ($scope.currentcontext.encounter) {
            $scope.IsBillLocked = $scope.currentcontext.encounter.IsBillLock;
        }
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.currentcontext.CancelReason = data.CancelReason;
        };

        $scope.getItem = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'emr/patientorder/GetPatientOrderById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.CancelCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.confirmCallback();
        };

        $scope.SaveCancelled = function () {
            var inputData = {
                Header: {
                    Id: $scope.currentcontext.id,
                    OrderStatusId: $scope.currentcontext.osid,
                    PatientBillStatusId: 2,
                    BillingId: $scope.currentcontext.bid,
                    CancelReason: $scope.currentcontext.CancelReason
                },
            };
            var options = {
                action: 'emr/patientorder/UpdateCancelPatientOrder',
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.CancelCallback
            };
            utl.Http.doAction(options);
        }
        $scope.getItem();
    }

    clinicalordersCancelCurrentListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();