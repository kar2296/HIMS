(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('OpticalStockItemFormController', OpticalStockItemFormController);

    function OpticalStockItemFormController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        $scope.currentcontext.OpticalItemMasterId = modalConfig.params.OpticalItemMasterId;
        $scope.currentcontext.Id = modalConfig.params.id;

        if (modalConfig && modalConfig.params) {
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.item = {
            IsActive: true,
            FacilityId: utl.Session.getCurrentFacilityId(),
            StoreMasterId: -1,
            BaseUomId: 1,
            PurchaseUomId: 1,
            SaleUomId: 1,
            Quantity: 0,
            ReOrderQuantity: 0
        };

        $scope.item.Id = $scope.currentcontext.Id;
        $scope.item.OpticalItemMasterId = $scope.currentcontext.OpticalItemMasterId;
        $scope.item.OpticalProductTypeId = modalConfig.params.OpticalProductTypeId;
        $scope.item.ItemCode = modalConfig.params.ItemCode;
        $scope.item.ItemName = modalConfig.params.ItemName;

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item.Id = data.Id;
            $scope.item.StoreMasterId = data.StoreMasterId;
            $scope.item.Quantity = data.Quantity;
            $scope.item.ReOrderQuantity = data.ReOrderQuantity;
            $scope.item.PurchaseUomId = data.PurchaseUomId;
            $scope.item.BaseUomId = data.BaseUomId;
            $scope.item.SaleUomId = data.SaleUomId;
        };

        $scope.getItem = function () {
            if ($scope.currentcontext.Id && $scope.currentcontext.Id > 0) {
                var options = {
                    action: 'pharmacy/OpticalStockItem/GetOpticalStockItemById',
                    data: { Id: $scope.currentcontext.Id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getOpticalItemMasterCallback = function (scope, data, options, hasError) {
            $scope.item.ItemCode = data.ItemCode;
            $scope.item.ItemName = data.ItemName;
            $scope.item.OpticalProductTypeId = data.OpticalProductTypeId;
            $scope.item.Rate = data.Rate;
            $scope.item.GSTPercentage = data.GSTPercentage;
            $scope.item.HikePercentage = data.HikePercentage;
            $scope.item.SalesPrice = data.SalesPrice;
            if ($scope.currentcontext.Id && $scope.currentcontext.Id > 0) {
                $scope.getItem();
            }
        };

        $scope.getOpticalItemMaster = function () {
            if ($scope.item.OpticalItemMasterId && $scope.item.OpticalItemMasterId > 0) {
                var options = {
                    action: 'pharmacy/OpticalItemMaster/GetOpticalItemMasterById',
                    data: { Id: $scope.item.OpticalItemMasterId },
                    type: 'post',
                    onComplete: $scope.getOpticalItemMasterCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $state.go('app.opticalitemstock');
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
        };

        $scope.errorItemCallback = function (data, options) {
            if (data.Error && data.Error.Code == 'THIS_STORE_ALREADY_MAPPED') {
                utl.Alert.showErrorMsg('Store Already Mapped With This Item');
            }
        };

        $scope.saveItem = function () {
            var actionName = 'pharmacy/OpticalStockItem/AddOpticalStockItem';
            if ($scope.currentcontext.Id && $scope.currentcontext.Id > 0) {
                actionName = 'pharmacy/OpticalStockItem/UpdateOpticalStockItem';
            }
            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback,
                onError: $scope.errorItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            if ($scope.item.OpticalItemMasterId && $scope.item.OpticalItemMasterId > 0) {
                $scope.getOpticalItemMaster();
            }
        };

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "StoreMaster",
                    Request: {
                        Params: [
                            { Key: 8, Value: 1 }
                        ]
                    }
                },
                {
                    "Key": "UomMaster",
                    Request: { Params: [{ Key: 3, Value: 2 }] }
                },
                { "Key": "Facility" },
                { "Key": "OpticalProductType" }
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

    OpticalStockItemFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();