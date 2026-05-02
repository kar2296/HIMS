(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('itemmasterFacilityMapController', itemmasterFacilityMapController);

    function itemmasterFacilityMapController($scope, $stateParams, $state, $translate) {
        $scope.currentcontext = {};
        $scope.item = {};
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.item.ItemCode = $state.params.ItemCode;
        $scope.item.ItemName = $state.params.ItemName;
        $scope.item.ItemDescription = $state.params.ItemDescription;
        $scope.item.ItemShortDescription = $state.params.ItemShortDescription;
        $scope.item.CategoryId = $state.params.CategoryId;
        $scope.item.SubCategoryId = $state.params.SubCategoryId;
        $scope.item.ProductTypeId = $state.params.ProductTypeId;
        $scope.item.SubProductTypeId = $state.params.SubProductTypeId;
        $scope.item.GenericId = $state.params.GenericId;
        $scope.item.GenericCode = $state.params.GenericCode;
        $scope.item.GenericName = $state.params.GenericName;
        $scope.item.ManufacturerId = $state.params.ManufacturerId;
        $scope.item.ManufacturerCode = $state.params.ManufacturerCode;
        $scope.item.ManufacturerName = $state.params.ManufacturerName;
        $scope.item.BaseUomId = $state.params.BaseUomId;
        $scope.item.PurchaseUomId = $state.params.PurchaseUomId;
        $scope.item.SaleUomId = $state.params.SaleUomId;
        $scope.item.ScheduleTypeId = $state.params.ScheduleTypeId;
        $scope.item.GstId = $state.params.GstId;
        $scope.item.InGstId = $state.params.InGstId;
        $scope.item.CGstId = $state.params.CGstId;
        $scope.item.SGstId = $state.params.SGstId;
        $scope.item.ProductRegNo = $state.params.ProductRegNo;
        $scope.item.IsBatchMandatory = $state.params.IsBatchMandatory;
        $scope.item.IsExpiryMandatory = $state.params.IsExpiryMandatory;
        $scope.item.ItemPrice = $state.params.ItemPrice;
        $scope.item.CostPrice = $state.params.CostPrice;
        $scope.item.MrPrice = $state.params.MrPrice;
        $scope.item.DrugId = $state.params.DrugId;
        $scope.item.DrugCode = $state.params.DrugCode;
        $scope.item.DrugName = $state.params.DrugName;
        $scope.item.IsCssd = $state.params.IsCssd;
        $scope.item.HSNId = $state.params.HSNId;
        $scope.item.HSNCode = $state.params.HSNCode;
        $scope.item.HSNName = $state.params.HSNName;
        $scope.item.IsConsignment = $state.params.IsConsignment;
        $scope.item.IsGenericAllow = $state.params.IsGenericAllow;
        $scope.item.IsBillable = $state.params.IsBillable;
        $scope.item.IsManufacture = $state.params.IsManufacture;
        $scope.item.IsControlled = $state.params.IsControlled;
        $scope.item.IsColdChain = $state.params.IsColdChain;
        $scope.item.IsAsset = $state.params.IsAsset;
        $scope.item.IsDescriptionEdit = $state.params.IsDescriptionEdit;
        $scope.item.IsHighAlert = $state.params.IsHighAlert;
        $scope.item.IsNarcotic = $state.params.IsNarcotic;
        $scope.item.IsReusable = $state.params.IsReusable;
        $scope.item.IsMRPRequired = $state.params.IsMRPRequired;
        $scope.item.CanEditPriceForGrn = $state.params.CanEditPriceForGrn;
        $scope.item.IsConsumable = $state.params.IsConsumable;
        $scope.item.Min = $state.params.Min;
        $scope.item.Max = $state.params.Max;
        $scope.item.ActiveStatusId = $state.params.ActiveStatusId;
        $scope.item.IsActive = $state.params.IsActive;
        $scope.item.ActiveFrom = $state.params.ActiveFrom;
        $scope.item.ActiveTo = $state.params.ActiveTo;
        $scope.item.ImagePath = $state.params.ImagePath;

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item.map = data;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [
                        { Key: 0, Value: $scope.currentcontext.id }
                    ]
                };

                var options = {
                    action: 'pharmacy/itemmaster/GetFacilities',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                $scope.$doAction(options);
            }
        };

        $scope.backToList = function () {
            $state.go('app.itemmastertab.itemmaster');
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            $scope.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        };

        $scope.saveItem = function () {
            for (var idx in $scope.item.map) {
                var item = $scope.item.map[idx];
                item.ItemCode = $scope.item.ItemCode;
                item.ItemName = $scope.item.ItemName;
                item.ItemDescription = $scope.item.ItemDescription;
                item.ItemShortDescription = $scope.item.ItemShortDescription;
                item.CategoryId = $scope.item.CategoryId;
                item.SubCategoryId = $scope.item.SubCategoryId;
                item.ProductTypeId = $scope.item.ProductTypeId;
                item.SubProductTypeId = $scope.item.SubProductTypeId;
                item.GenericId = $scope.item.GenericId;
                item.GenericCode = $scope.item.GenericCode;
                item.GenericName = $scope.item.GenericName;
                item.ManufacturerId = $scope.item.ManufacturerId;
                item.ManufacturerCode = $scope.item.ManufacturerCode;
                item.ManufacturerName = $scope.item.ManufacturerName;
                item.BaseUomId = $scope.item.BaseUomId;
                item.PurchaseUomId = $scope.item.PurchaseUomId;
                item.SaleUomId = $scope.item.SaleUomId;
                item.ScheduleTypeId = $scope.item.ScheduleTypeId;
                item.GstId = $scope.item.GstId;
                item.InGstId = $scope.item.InGstId;
                item.CGstId = $scope.item.CGstId;
                item.SGstId = $scope.item.SGstId;
                item.ProductRegNo = $scope.item.ProductRegNo;
                item.IsBatchMandatory = $scope.item.IsBatchMandatory;
                item.IsExpiryMandatory = $scope.item.IsExpiryMandatory;
                item.ItemPrice = $scope.item.ItemPrice;
                item.CostPrice = $scope.item.CostPrice;
                item.MrPrice = $scope.item.MrPrice;
                item.DrugId = $scope.item.DrugId;
                item.DrugCode = $scope.item.DrugCode;
                item.DrugName = $scope.item.DrugName;
                item.IsCssd = $scope.item.IsCssd;
                item.HSNId = $scope.item.HSNId;
                item.HSNCode = $scope.item.HSNCode;
                item.HSNName = $scope.item.HSNName;
                item.IsConsignment = $scope.item.IsConsignment;
                item.IsGenericAllow = $scope.item.IsGenericAllow;
                item.IsBillable = $scope.item.IsBillable;
                item.IsManufacture = $scope.item.IsManufacture;
                item.IsControlled = $scope.item.IsControlled;
                item.IsColdChain = $scope.item.IsColdChain;
                item.IsAsset = $scope.item.IsAsset;
                item.IsDescriptionEdit = $scope.item.IsDescriptionEdit;
                item.IsHighAlert = $scope.item.IsHighAlert;
                item.IsNarcotic = $scope.item.IsNarcotic;
                item.IsReusable = $scope.item.IsReusable;
                item.IsMRPRequired = $scope.item.IsMRPRequired;
                item.CanEditPriceForGrn = $scope.item.CanEditPriceForGrn;
                item.IsConsumable = $scope.item.IsConsumable;
                item.Min = $scope.item.Min;
                item.Max = $scope.item.Max;
                item.ActiveStatusId = $scope.item.ActiveStatusId;
                item.IsActive = $scope.item.IsActive;
                item.ActiveFrom = $scope.item.ActiveFrom;
                item.ActiveTo = $scope.item.ActiveTo;
                item.ImagePath = $scope.item.ImagePath;
            }

            var actionName = 'pharmacy/itemmaster/MapFacilities';

            var options = {
                action: actionName,
                data: { Data: $scope.item.map },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            $scope.$doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility", Request: { Params: [{ Key: 4, Value: true }] } }
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };

            $scope.$doAction(options);
        };

        $scope.initLookup();
    }

    itemmasterFacilityMapController.$inject = ['$scope', '$stateParams', '$state', '$translate'];

})();