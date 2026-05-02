(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ProcedureordersHistoryController', ProcedureordersHistoryController);

    function ProcedureordersHistoryController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.items = [];
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if ($scope.currentcontext.ismodal) {
            $scope.currentcontext.PatientId = modalConfig.params.pid;
            $scope.currentcontext.EncounterId = modalConfig.params.eid;
            $scope.currentcontext.DoctorId = modalConfig.params.did;

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.currentcontext.PatientId = modalConfig.params.pid;
        $scope.currentcontext.EncounterId = modalConfig.params.eid;
        $scope.currentcontext.DoctorId = modalConfig.params.did;

        $scope.toggleCanShowDetails = function (clickedItem) {
            for (var idx in $scope.items) {
                var item = $scope.items[idx];
                if (item.Id == clickedItem.Id) {
                    item.CanShowDetails = !item.CanShowDetails;
                } else {
                    item.CanShowDetails = false;
                }
            }
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.items = res.Data;
            // var PendingProcedureOrders = res.Data;
            // for (var procedureorderidx in PendingProcedureOrders) {
            //     var procedureorder = PendingProcedureOrders[procedureorderidx];
            //     if (procedureorder.ProcedureOrderDetails) {
            //         var ApprovedCount = 0;
            //         for (var procedureorderitemidx in procedureorder.ProcedureOrderDetails) {
            //             var procedureorderitem = procedureorder.ProcedureOrderDetails[procedureorderitemidx];
            //             if (procedureorderitem.OrderDetailApprovalStatusId === 4 && procedureorderitem.PatientBillDetailId === 0) {
            //                 ApprovedCount = ApprovedCount + 1;
            //             }
            //         }
            //     }
            //     if (ApprovedCount > 0) {
            //         $scope.items.push(procedureorder);
            //     }
            // }

            /* $scope.items = res.Data; */

            for (var idx in $scope.items) {
                var item = $scope.items[idx];
                if (idx === 0) {
                    item.CanShowDetails = true;
                } else {
                    item.CanShowDetails = false;
                }
            }
        };

        $scope.getList = function () {
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.currentcontext.PatientId
                }, ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/procedureorder/GetProcedureOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.loadProcedureOrderDetails = function (item) {
            $scope.confirmCallback({
                ordid: item.Id,
                pid: $scope.currentcontext.PatientId,
                eid: $scope.currentcontext.EncounterId,
            });
        };

        $scope.handleEvents = function (actionType, row) {};

        $scope.getList();
    }

    ProcedureordersHistoryController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();