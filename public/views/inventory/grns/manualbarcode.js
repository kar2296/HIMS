(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('manualbarcodeController', manualbarcodeController);

    function manualbarcodeController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            Name: ''
        };
        $scope.ordertat = [];
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };
        $scope.currentcontext.itemId = parseInt(modalConfig.params.itemId);
        $scope.item.BarCodeId = modalConfig.params.barcode;
        $scope.currentcontext.from = modalConfig.params.from;
        $scope.currentcontext.stockInfo = modalConfig.params.stockInfo;
        $scope.item.index = modalConfig.params.index;
        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;
        $scope.ShowSavebarcode = false;
        if ($scope.currentcontext.from == 'stock') {
            $scope.ShowSavebarcode = true;
        }
        if (modalConfig && modalConfig.params) {
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }


        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
        };

        $scope.savebarcode = function() {
            if ($scope.currentcontext.stockInfo) {
                $scope.item.Id = $scope.currentcontext.stockInfo.Id;
                $scope.item.GrnDetailId = $scope.currentcontext.stockInfo.GrnDetailId;
                $scope.item.StockEntryDetailId = $scope.currentcontext.stockInfo.StockEntryDetailId;
                $scope.item.BarcodeNo = $scope.item.BarCodeId;
                $scope.item.BarCodeId = $scope.currentcontext.stockInfo.BarCodeId;
                var options = {
                    action: 'pharmacy/stockserialitem/UpdateBarcodeStockItem',
                    data: {
                        Data: $scope.item
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback,
                };
                utl.Http.doAction(options);
            }
        }

        $scope.saveCode = function() {
            $scope.confirmCallback($scope.item);
        }

        $scope.backToList = function() {
            if ($scope.currentcontext.ismodal) {
                $scope.cancelCallback();
            }
        }
    }
    manualbarcodeController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();