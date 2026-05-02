(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('stockconsumptionhistoryController', stockconsumptionhistoryController);

    function stockconsumptionhistoryController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            // TotalPoQuantity: 0,
            // TotalReceivedQuantity: 0
        };
        $scope.currentfilter = {
            title: 'Consumption History of ',
            // vendormasterid: 0,
            itemmasterid: 0,
            itemcode: null,
            itemname: null,
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate()
        };
        $scope.cancelCallback = $uibModalInstance.dismiss;
        $scope.currentcontext = {};

        if (modalConfig && modalConfig.params) {
            // $scope.currentfilter.vendormasterid = parseInt(modalConfig.params.vendormasterid);
            $scope.currentfilter.itemmasterid = parseInt(modalConfig.params.itemmasterid);
            $scope.currentfilter.itemcode = modalConfig.params.itemcode;
            $scope.currentfilter.itemname = modalConfig.params.itemname;
        }

        $scope.getListCallback = function (scope, res, options, hasError) {
            // $scope.historyDetails = res.Data || [];
            // for (var idx in $scope.historyDetails) {
            //     var historyitem = $scope.historyDetails[idx];
            //     if (historyitem.ItemMasterId > 0) {
            //         $scope.item.TotalPrQuantity = $scope.item.TotalPrQuantity + historyitem.RequestedQuantity;
            //         //$scope.item.TotalPoQuantity = $scope.item.TotalPoQuantity + historyitem.PoQuantity;
            //     }
            // }
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.actionSearch = function () {
            $scope.getList();
        };

        $scope.getList = function () {
            var fromDate = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00');
            var toDate = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59');
            if (!$scope.currentfilter.ToDate) {
                toDate = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 23:59:59');
            }
            var inputData = {
                Params: [
                      { Key: 2, Value: $scope.currentfilter.itemmasterid },
                    // { Key: 4, Value: [fromDate, toDate] }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/stockconsumptiondetail/GetStockConsumptionDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.backToList = function () {
            $state.go('app.purchaseorder', { itemmasterid: 0 });
        };

        vm.gridConfig = {
            columnDefs: [{ field: "ConsumedStore.StoreName", displayName: $translate.instant('inventory.consumption-history.store.lbl') },
            { field: "StockConsumption.ConsumptionType.Description", displayName: $translate.instant('inventory.consumption-history.contype.lbl') },
            { field: "StockConsumption.StockConsumptionNumber", displayName: $translate.instant('inventory.consumption-history.connumber.lbl') },
            {
                field: "StockConsumption",
                displayName: $translate.instant('inventory.consumption-history.condate.lbl'),
                cellTemplate: "<ngformatdate date-val='entity.StockConsumption.ConsumptionDate'></ngformatdate>"
            },
            {
                field: "StockConsumption.TotalNetAmount", displayName: $translate.instant('inventory.stockconsumption.netamount.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{row.entity.StockConsumption.TotalNetAmount | displaycurrency}}&nbsp;</span>' + '</div>'
            },
                // { field: "MrPrice", displayName: $translate.instant('inventory.stockdetails.quantity.lbl') },
                // { field: "PurchasePrice", displayName: $translate.instant('inventory.consumption-history.purchaseprice.lbl') }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "FromStore" },
                { "Key": "ToStore" },
                { "Key": "VendorMaster" }
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.initLookup();
    }

    stockconsumptionhistoryController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();