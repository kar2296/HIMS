(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('stockadjustmenthistoryController', stockadjustmenthistoryController);

    function stockadjustmenthistoryController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            TotalRequestedQuantity: 0,
            //TotalPoQuantity: 0
        };

        $scope.currentcontext = {
            title: 'Stock Adjustment History of ',
            //vendormasterid: 0,
            storemasterid: 0,
            itemmasterid: 0,
            itemcode: null,
            itemname: null,
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate()
        };
        

        if (modalConfig && modalConfig.params) {
            //$scope.currentcontext.vendormasterid = parseInt(modalConfig.params.vendormasterid);
            $scope.currentcontext.storemasterid = parseInt(modalConfig.params.storemasterid);
            $scope.currentcontext.itemmasterid = parseInt(modalConfig.params.itemmasterid);
            $scope.currentcontext.itemcode = modalConfig.params.itemcode;
            $scope.currentcontext.itemname = modalConfig.params.itemname;

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        // $scope.getListCallback = function (scope, res, options, hasError) {
        //     vm.gridConfig.data = res.Data;
        //     vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        // };

        $scope.getListCallback = function (scope, res, options, hasError) {
            // $scope.item.TotalTransferedQuantity = 0;
            // //$scope.item.TotalPoQuantity = 0;
            // $scope.historyDetails = res.Data || [];
            // for (var idx in $scope.historyDetails) {
            //     var historyitem = $scope.historyDetails[idx];
            //     if (historyitem.ItemMasterId > 0) {
            //         $scope.item.TotalTransferedQuantity = $scope.item.TotalTransferedQuantity + historyitem.TransferedQuantity;
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
              if ($scope.currentcontext.itemmasterid > 0) {
            var fromDate = $filter('date')($scope.currentcontext.FromDate, 'yyyy-MM-dd 00:00:00');
            var toDate = $filter('date')($scope.currentcontext.ToDate, 'yyyy-MM-dd 23:59:59');
            if (!$scope.currentcontext.ToDate) {
                toDate = $filter('date')($scope.currentcontext.FromDate, 'yyyy-MM-dd 23:59:59');
            }
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.itemmasterid },
                    // { Key: 3, Value: [fromDate, toDate] }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/stockadjustmentdetail/GetStockAdjustmentDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
             }else {
                utl.Alert.showErrorMsg('Please Select Item...!');
                return false;
            }
        };

        vm.gridConfig = {
            columnDefs: [{ field: "StockAdjustment.StoreName", displayName: $translate.instant('inventory.stockadjustmenthistory.storename.lbl') },
            // { field: "AdjustmentType.Description", displayName: $translate.instant('inventory.consumption-history.contype.lbl') },
            { field: "StockAdjustment.StockAdjustmentNumber", displayName: $translate.instant('inventory.stockadjustmenthistory.adjno.lbl') },
            {
                field: "ExpiryDate",
                displayName: $translate.instant('inventory.stockadjustmenthistory.expdate.lbl'),
                cellTemplate: "<ngformatdate date-val='entity.ExpiryDate'></ngformatdate>"
            },
            {
                field: "UnitCostPrice", displayName: $translate.instant('inventory.stockadjustmenthistory.UnitCostPrice.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.UnitCostPrice | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.UnitCostPrice | displaycurrency}}&nbsp;</span>' + '</div>'
            },
               {
                field: "MrPrice", displayName: $translate.instant('inventory.stockadjustmenthistory.MrPrice.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.MrPrice | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.MrPrice | displaycurrency}}&nbsp;</span>' + '</div>'
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
                { "Key": "StoreMaster" },
                // { "Key": "VendorMaster" }
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

    stockadjustmenthistoryController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();