(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientPendingTabController', patientPendingTabController);

        patientPendingTabController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', 'uibButtonConfig', '$uibModalInstance', 'modalConfig'];

    function patientPendingTabController($scope, $stateParams, $state, $translate, utl, $filter, uibButtonConfig, $uibModalInstance, modalConfig) {

        var tabvm = this;
        var canDisableTab = false;

        $scope.currentcontext = {};

        $scope.items = [];

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.eid = modalConfig.params.eid;

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;

        }

        $scope.tabs = [
            {
                title: $translate.instant('billing.pendingordertab.clinicalorder.lbl'),
                id: 0,
                canDisable: false
            },
            {
                title: $translate.instant('billing.pendingordertab.dispenseorder.lbl'),
                id: 1,
                canDisable: false
            },
            {
                title: $translate.instant('billing.pendingordertab.dispensereturn.lbl'),
                id: 2,
                canDisable: false
            }
        ];

        $scope.switchTab = function (tab) {
            if (!canDisableTab) {
                if(tab.id == 0) $scope.getPendingOrderList();
                else if(tab.id == 1) $scope.getPendingDispensesList();
                else if(tab.id == 2) $scope.getPendingDispensesReturnList();
            }
        }

        $scope.backtohome = function () {
            $scope.confirmCallback();
        }

        tabvm.currentcontext = {
            id: 0
        };


        $scope.toggleCanShowDetails = function(clickedItem) {
            for (var idx in $scope.items) {
                var item = $scope.items[idx];
                if (item.Id == clickedItem.Id) {
                    item.CanShowDetails = !item.CanShowDetails;
                } else {
                    item.CanShowDetails = false;
                }
            }
        };


        $scope.getPendingOrderList = function () {
            var inputData = {
                Params: [
                    { Key: 4, Value: 1 }, // Order Status Id = 1 --> Created State
                    { Key: 18, Value: $scope.currentcontext.eid },
                    { Key: 29, Value: false }, // IsDirectBill is false order
                    { Key: 20, Value: 2 }, // EncountertypeId IP
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
                onComplete: $scope.getPendingOrderListCallback
            };
            utl.Http.doAction(options);
        }

        $scope.getPendingOrderListCallback = function (scope, res, options, hasError) {
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

        $scope.getPendingDispensesList = function () {
            var inputData = {
                Params: [
                    { Key: 4, Value: [1, 2, 3, 4] },
                    { Key: 16, Value: $scope.currentcontext.eid }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'IPManagement/PatientStockRequests/GetPatientStockRequests',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPendingDispensesListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getPendingDispensesListCallback = function (scope, res, options, hasError) {
            console.log(res.Data);
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

        $scope.getPendingDispensesReturnList = function () {
            var inputData = {
                Params: [
                    { Key: 4, Value: [1, 2, 3, 4] },
                    { Key: 16, Value: $scope.currentcontext.eid }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'IPManagement/PatientStockReturns/GetPatientStockReturns',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPendingDispensesReturnListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getPendingDispensesReturnListCallback = function (scope, res, options, hasError) {
            console.log(res.Data);
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

        $scope.switchTab($scope.tabs[0]);

    }

})();
