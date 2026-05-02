(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('stocktransferHistoryController', stocktransferHistoryController);

    function stocktransferHistoryController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            TotalRequestedQuantity: 0,
            //TotalPoQuantity: 0
        };

        $scope.currentcontext = {
            title: 'Stock Transfer History of ',
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
            $scope.item.TotalTransferedQuantity = 0;
            //$scope.item.TotalPoQuantity = 0;
            $scope.historyDetails = res.Data || [];
            for (var idx in $scope.historyDetails) {
                var historyitem = $scope.historyDetails[idx];
                if (historyitem.ItemMasterId > 0) {
                    $scope.item.TotalTransferedQuantity = $scope.item.TotalTransferedQuantity + historyitem.TransferedQuantity;
                    //$scope.item.TotalPoQuantity = $scope.item.TotalPoQuantity + historyitem.PoQuantity;
                }
            }

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
                    { Key: 3, Value: [fromDate, toDate] }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/StockTransferDetail/GetStockTransferDetails',
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
            columnDefs: [

                //{ field: "VendorMaster.VendorName", displayName: $translate.instant('inventory.pr-history.vendor.lbl') },
                { field: "StockTransfer.StoreName", displayName: $translate.instant('inventory.pr-history.store.lbl') },
                { field: "StockTransfer.RequestNumber", displayName: $translate.instant('inventory.pr-history.srnumber.lbl') },
                 { field: "StockTransfer.TransferNumber", displayName: $translate.instant('inventory.pr-history.stnumber.lbl') },
                {
                    field: "StockTransfer.RequestedDate",
                    displayName: $translate.instant('inventory.pr-history.srdate.lbl'),
                    cellTemplate: "<ngformatdate date-val='entity.StockTransfer.RequestedDate'></ngformatdate>"
                },
                {
                    field: "StockTransfer.TransferDate",
                    displayName: $translate.instant('inventory.pr-history.stdate.lbl'),
                    cellTemplate: "<ngformatdate date-val='entity.StockTransfer.TransferDate'></ngformatdate>"
                },
               
                { field: "TransferedQuantity", displayName: $translate.instant('inventory.pr-history.stquantity.lbl') },
                { field: "PurchasePrice", displayName: $translate.instant('inventory.pr-history.purchaseprice.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.PurchasePrice | displaycurrency}}</span>" + "</div>"
                //   cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{entity.PurchasePrice | displaycurrency}}</span>' + '</div>'   
            }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [];

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

    stocktransferHistoryController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();