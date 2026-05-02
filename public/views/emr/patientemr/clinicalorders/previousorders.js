(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('clinicalordersHistoryController', clinicalordersHistoryController);

    function clinicalordersHistoryController($scope, $stateParams, $state, $filter, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.items = [];
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        // if ($scope.currentcontext.ismodal) {
        //     $scope.currentcontext.PatientId = modalConfig.params.pid;
        //     $scope.currentcontext.EncounterId = modalConfig.params.eid;

        //     $scope.confirmCallback = $uibModalInstance.close;
        //     $scope.cancelCallback = $uibModalInstance.dismiss;
        // }
        if ($stateParams.context) {
            $scope.context = $stateParams.context;
        }
        if ($stateParams.pid)
            $scope.currentcontext.PatientId = $stateParams.pid;
        else
            $scope.currentcontext.PatientId = parseInt(utl.Session.getEMRPatientId());

        if ($stateParams.eid)
            $scope.currentcontext.EncounterId = $stateParams.eid;
        else
            $scope.currentcontext.EncounterId = parseInt(utl.Session.getEncounterId());
        $scope.currentfilter = {
            From: utl.Formatter.addMonths(utl.Formatter.getCurrentDate(), -1),
            To: utl.Formatter.getCurrentDate()
        };
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
            // var PendingOrders = res.Data;
            // for (var orderidx in PendingOrders) {
            //     var order = PendingOrders[orderidx];
            //     if (order.PatientOrderDetails) {
            //         var ApprovedCount = 0;
            //         for (var procedureorderitemidx in order.PatientOrderDetails) {
            //             var procedureorderitem = order.PatientOrderDetails[procedureorderitemidx];
            //             if (procedureorderitem.OrderDetailApprovalStatusId === 4 && procedureorderitem.PatientBillDetailId === 0) {
            //                 ApprovedCount = ApprovedCount + 1;
            //             }
            //         }
            //     }
            //     if (ApprovedCount > 0) {
            //         $scope.items.push(order);
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
            var FromDate = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.currentcontext.PatientId
                },
                {
                    Key: 12,
                    Value: FromDate
                },
                {
                    Key: 13,
                    Value: ToDate
                },
                    // {
                    //     Key: 18,
                    //     Value: $scope.currentcontext.EncounterId
                    // },
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/patientorder/GetPatientOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.loadOrderDatas = function (item) {
            $scope.confirmCallback({
                ordid: item.Id,
                pid: $scope.currentcontext.PatientId,
                eid: $scope.currentcontext.EncounterId,
            });
        };

        $scope.handleEvents = function (actionType, row) { };

        $scope.getList();
    }

    clinicalordersHistoryController.$inject = ['$scope', '$stateParams', '$state', '$filter', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();