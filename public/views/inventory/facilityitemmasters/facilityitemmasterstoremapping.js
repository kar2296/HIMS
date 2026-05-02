(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('facilityitemmasterStoreMapController', facilityitemmasterStoreMapController);

    function facilityitemmasterStoreMapController($scope, $stateParams, $state, $translate) {
        $scope.currentcontext = {};
        $scope.item = {};
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.item.FacilityId = $state.params.FacilityId;
        $scope.item.ItemMasterId = $state.params.ItemMasterId;
        $scope.item.ItemCode = $state.params.ItemCode;
        $scope.item.ItemName = $state.params.ItemName;
        $scope.item.CategoryId = $state.params.CategoryId;
        $scope.item.SubCategoryId = $state.params.SubCategoryId;
        $scope.item.ProductTypeId = $state.params.ProductTypeId;
        $scope.item.SubProductTypeId = $state.params.SubProductTypeId;
        $scope.item.IsBillable = $state.params.IsBillable;
        $scope.item.IsAllStoreAssosiation = 0;

        $scope.mappedStores = [];

        $scope.allStoreClick = function (allstorecheck) {
            var availableStores = [];
            availableStores = $scope.lookup.StoreMaster;

            var mappedStores = [];
            mappedStores = $scope.item.map;

            var mapthisstore = {};
            if (allstorecheck.IsAllStoreAssosiation) {
                for (var asidx in availableStores) {
                    var eachstore = availableStores[asidx];
                    var alreadymapped = false;
                    for (var msidx in mappedStores) {
                        var mappedstore = mappedStores[msidx];
                        if (mappedstore.StoreMasterId === eachstore.StoreMasterId) {
                            alreadymapped = true;
                        }
                    }

                    if (!alreadymapped) {
                        mapthisstore = {
                            CategoryId: $scope.item.CategoryId,
                            FacilityId: $scope.item.FacilityId,
                            IsBillable: $scope.item.IsBillable,
                            ItemCode: $scope.item.ItemCode,
                            ItemFacilityMapId: $scope.currentcontext.id,
                            ItemMasterId: $scope.item.ItemMasterId,
                            ItemName: $scope.item.ItemName,
                            ProductTypeId: $scope.item.ProductTypeId,
                            Status: 1,
                            StoreCode: eachstore.StoreCode,
                            StoreMasterId: eachstore.StoreMasterId,
                            StoreName: eachstore.StoreName,
                            SubCategoryId: $scope.item.SubCategoryId,
                            SubProductTypeId: $scope.item.SubProductTypeId
                        };
                        $scope.item.map.push(mapthisstore);
                    }
                }
            }
        };

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item.map = data;
            $scope.mappedStores = data;
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [
                        { Key: 0, Value: $scope.currentcontext.id }
                    ]
                };

                var options = {
                    action: 'pharmacy/itemmaster/GetFacilityStores',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                $scope.$doAction(options);
            }
        };

        $scope.backToList = function () {
            $state.go('app.facilityitemmastertab.facilityitemmaster');
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            $scope.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getItem();
        };

        $scope.saveItem = function () {
            for (var idx in $scope.item.map) {
                var item = $scope.item.map[idx];
                item.ItemFacilityMapId = $scope.currentcontext.id;
                item.ItemMasterId = $scope.item.ItemMasterId;
                item.ItemCode = $scope.item.ItemCode;
                item.ItemName = $scope.item.ItemName;
                item.FacilityId = $scope.item.FacilityId;
                item.CategoryId = $scope.item.CategoryId;
                item.SubCategoryId = $scope.item.SubCategoryId;
                item.ProductTypeId = $scope.item.ProductTypeId;
                item.SubProductTypeId = $scope.item.SubProductTypeId;
                item.IsBillable = $scope.item.IsBillable;
            }

            var actionName = 'pharmacy/itemmaster/MapFacilityStores';

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
                {
                    "Key": "StoreMaster",
                    Request: {
                        Params: [
                            { Key: 2, Value: $scope.item.CategoryId },
                            { Key: 6, Value: $scope.item.FacilityId },
                            { Key: 7, Value: 2 }
                        ]
                    },
                    Default: false
                }
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

    facilityitemmasterStoreMapController.$inject = ['$scope', '$stateParams', '$state', '$translate'];

})();