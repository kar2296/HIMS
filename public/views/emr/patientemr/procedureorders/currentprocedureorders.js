(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('CurrentProcedureOrderController', CurrentProcedureOrderController);

    function CurrentProcedureOrderController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.items = [];
        if ($stateParams.context) {
            $scope.context = $stateParams.context;
        }
        $scope.currentcontext.PatientId = $stateParams.pid;
        $scope.currentcontext.EncounterId = $stateParams.eid;
        $scope.currentcontext.DoctorId = $stateParams.did;

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
            // var FromDate = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            // var ToDate = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
                    Key: 2,
                    Value: $scope.currentcontext.PatientId
                },
                {
                    Key: 18,
                    Value: $scope.currentcontext.EncounterId
                },
                // {
                //     Key: 18,
                //     Value: $scope.currentcontext.EncounterId
                // },
                // {
                //     Key: 12,
                //     Value: FromDate
                // },
                // {
                //     Key: 13,
                //     Value: ToDate
                // },
            ],
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

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'repeat') {
                $state.go('patientemr.procedureordertab.procedureorders', {
                    cid: entity.Id,
                    pid: $scope.currentcontext.PatientId
                });
            } else if (actionType == 'print') {
                $scope.OrderPrint(entity);
            } else if (actionType == 'cancel') {
                $scope.SaveCancelled(entity, 2);
            }
        };

        $scope.getList();
    }

    CurrentProcedureOrderController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();