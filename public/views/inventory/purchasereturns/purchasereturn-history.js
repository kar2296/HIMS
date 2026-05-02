(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PurchaseReturnsHistoryController', PurchaseReturnsHistoryController);

    function PurchaseReturnsHistoryController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            TotalPoQuantity: 0,
            TotalReceivedQuantity: 0
        };
        $scope.currentfilter = {
            title: 'Purchase Return History of ',
            vendormasterid: 0,
            itemmasterid: 0,
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

        $scope.actionSearch = function () {
            $scope.getList();
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.item.TotalPoQuantity = 0;
            $scope.item.TotalReceivedQuantity = 0;
            $scope.historyDetails = res.Data || [];
            for (var idx in $scope.historyDetails) {
                var historyitem = $scope.historyDetails[idx];
                if (historyitem.ItemMasterId > 0) {
                    $scope.item.TotalPoQuantity = $scope.item.TotalPoQuantity + historyitem.PoQuantity;
                    $scope.item.TotalReceivedQuantity = $scope.item.TotalReceivedQuantity + historyitem.ReceivedQuantity;
                }
            }

            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };



        $scope.getList = function () {
            if ($scope.currentfilter.itemmasterid > 0) {
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
                    action: 'pharmacy/purchasereturndetail/GetPurchaseReturnDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getListCallback
                };

                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $state.go('app.purchaseorder', { itemmasterid: 0 });
        };

        vm.gridConfig = {
            columnDefs: [{ field: "PurchaseReturn[0].StoreMaster", displayName: $translate.instant('inventory.po-history.store.lbl') },
            { field: "PurchaseReturn.PrnNumber", displayName: $translate.instant('inventory.po-history.prnnumber.lbl') },
            {
                field: "PurchaseReturn[0].PrnDate",
                displayName: $translate.instant('inventory.po-history.prndate.lbl'),
                cellTemplate: "<ngformatdate date-val='row.entity.PurchaseOrder.PrnDate'></ngformatdate>"
            },
            { field: "GrnQuantity", displayName: $translate.instant('inventory.po-history.grnquantity.lbl') },
            { field: "PrnQuantity", displayName: $translate.instant('inventory.po-history.prnquantity.lbl') },
            { field: "UnitCostPrice", displayName: $translate.instant('inventory.po-history.ucp.lbl') }
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

    PurchaseReturnsHistoryController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();