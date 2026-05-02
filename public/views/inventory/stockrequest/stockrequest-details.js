(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('stockrequestdetailsController', stockrequestdetailsController);

    function stockrequestdetailsController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            TotalQuantity: 0
        };
        $scope.currentfilter = {
            title: 'Stock Details of ',
            itemcode: null,
            itemname: null
        };
        $scope.cancelCallback = $uibModalInstance.dismiss;
        $scope.currentcontext = {};

        if (modalConfig && modalConfig.params) {
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
                    { Key: 1, Value: $scope.currentfilter.itemmasterid }
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
            $state.go('app.purchaseorder', { itemmasterid: 0 });
        }

        $scope.deleteItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function(deleteId) {
            var options = {
                action: 'pharmacy/purchaseorder/DeleteStockSerialItem',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function(actionType, row) {

            if (actionType == 'edit') {
                $state.go('', { itemid: row.entity.Id });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id);
            }
        }

        vm.gridConfig = {
            columnDefs: [
                { field: "StoreMaster.StoreName", displayName: $translate.instant('inventory.stockdetails.store.lbl') },
                { field: "BarCodeId", displayName: $translate.instant('inventory.stockdetails.barcode.lbl') },
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
        }

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
        }

        $scope.initLookup();
    }

    stockrequestdetailsController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();