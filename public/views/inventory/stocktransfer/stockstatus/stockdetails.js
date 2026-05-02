(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('stockdetailsController', stockdetailsController);

    function stockdetailsController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            TotalQuantity: 0
        };
        $scope.currentfilter = {
            title: 'Stock Details of ',
            storemasterid: -1,
            itemmasterid: -1,
            itemcode: null,
            itemname: null
        };
        $scope.closeCallback = $uibModalInstance.dismiss;
        $scope.currentcontext = {};

        if (modalConfig && modalConfig.params) {
            $scope.currentfilter.storemasterid = parseInt(modalConfig.params.storemasterid);
            $scope.currentfilter.itemmasterid = parseInt(modalConfig.params.itemmasterid);
            $scope.currentfilter.itemcode = modalConfig.params.itemcode;
            $scope.currentfilter.itemname = modalConfig.params.itemname;
        }

        $scope.getListCallback = function(scope, res, options, hasError) {
            $scope.stockDetails = res.Data || [];
            for (var idx in $scope.stockDetails) {
                var stockitem = $scope.stockDetails[idx];
                if (stockitem.ItemMasterId > 0) {
                    $scope.item.TotalQuantity = $scope.item.TotalQuantity + stockitem.Quantity;
                }
            }

            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function() {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.itemmasterid },
                    { Key: 2, Value: $scope.currentfilter.storemasterid }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/stockserialitem/GetStockSerialItems',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };


        $scope.backToList = function() {
            $state.go('app.stockrequest', { itemmasterid: 0 });
        };

        vm.gridConfig = {
            columnDefs: [
                { field: "StoreMaster.StoreName", displayName: $translate.instant('inventory.stockdetails.store.lbl') },
                //{ field: "BarCodeId", displayName: $translate.instant('inventory.stockdetails.barcode.lbl') },
                { field: "BatchId", displayName: $translate.instant('inventory.stockdetails.batch.lbl') },
                {
                    field: "ExpiryDate",
                    displayName: $translate.instant('inventory.stockdetails.expiry.lbl'),
                    cellTemplate: "<ngformatdate date-val='row.entity.ExpiryDate'></ngformatdate>"
                },
                { field: "Quantity", displayName: $translate.instant('inventory.stockdetails.quantity.lbl') }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };

        $scope.initLookup = function() {
            var inputData = [
                { "Key": "StoreMaster" },
                { "Key": "Facility" }
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

    stockdetailsController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();