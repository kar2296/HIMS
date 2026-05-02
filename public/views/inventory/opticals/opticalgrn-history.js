(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('grnhistoryController', grnhistoryController);

    function grnhistoryController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            TotalPoQuantity: 0,
            TotalGrnQuantity: 0
        };
        $scope.currentfilter = {
            title: 'GRN History of ',
            itemcode: null,
            itemname: null,
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate()
        };
        $scope.cancelCallback = $uibModalInstance.dismiss;
        $scope.currentcontext = {};

        if (modalConfig && modalConfig.params) {
            $scope.currentfilter.vendormasterid = parseInt(modalConfig.params.vendormasterid);
            $scope.currentfilter.itemmasterid = parseInt(modalConfig.params.itemmasterid);
            $scope.currentfilter.itemcode = modalConfig.params.itemcode;
            $scope.currentfilter.itemname = modalConfig.params.itemname;
        }

        $scope.getListCallback = function(scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getListCallback = function(scope, res, options, hasError) {
            $scope.item.TotalPoQuantity = 0;
            $scope.item.TotalGrnQuantity = 0;
            $scope.historyDetails = res.Data || [];
            for (var idx in $scope.historyDetails) {
                var historyitem = $scope.historyDetails[idx];
                if (historyitem.ItemMasterId > 0) {
                    $scope.item.TotalPoQuantity = $scope.item.TotalPoQuantity + historyitem.PoQuantity;
                    $scope.item.TotalGrnQuantity = $scope.item.TotalGrnQuantity + historyitem.GrnQuantity;
                }
            }

            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.actionSearch = function() {
            $scope.getList();
        };

        $scope.getList = function() {
            var fromDate = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00');
            var toDate = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59');
            if (!$scope.currentfilter.ToDate) {
                toDate = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 23:59:59');
            }
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentfilter.itemmasterid },
                    { Key: 3, Value: [fromDate, toDate] }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/grndetail/GetGrnDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };


        $scope.backToList = function() {
            $state.go('app.grn', { itemmasterid: 0 });
        };

        vm.gridConfig = {
            columnDefs: [
                { field: "VendorMaster.VendorName", displayName: $translate.instant('inventory.grn-history.vendor.lbl') },
                { field: "StoreMaster.StoreName", displayName: $translate.instant('inventory.grn-history.store.lbl') },
                { field: "Grn.GrnNumber", displayName: $translate.instant('inventory.grn-history.grnnumber.lbl') },
                {
                    field: "Grn.InvoiceDate",
                    displayName: $translate.instant('inventory.grn-history.grndate.lbl'),
                    cellTemplate: "<ngformatdate date-val='row.entity.Grn.InvoiceDate'></ngformatdate>"
                },
                { field: "PoQuantity", displayName: $translate.instant('inventory.grn-history.poquantity.lbl') },
                { field: "GrnQuantity", displayName: $translate.instant('inventory.grn-history.grnquantity.lbl') },
                { field: "FreeQty", displayName: $translate.instant('inventory.grn-history.freequantity.lbl') },
                { field: "PurchasePrice", displayName: $translate.instant('inventory.grn-history.purchaseprice.lbl') }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };

        $scope.initLookup = function() {
            var inputData = [
                // { "Key": "StoreMaster" },
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

    grnhistoryController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();