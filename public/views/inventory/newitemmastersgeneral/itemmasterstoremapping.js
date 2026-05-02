(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('newgeneralitemmasterStoreMapController', newgeneralitemmasterStoreMapController);

    function newgeneralitemmasterStoreMapController($scope, $stateParams, $state, $translate, utl) {
        $scope.currentcontext = {};
        $scope.item = {};
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.item.ItemCode = $state.params.ItemCode;
        $scope.item.ItemName = $state.params.ItemName;
        $scope.item.CategoryId = $state.params.CategoryId;
        $scope.item.SubCategoryId = $state.params.SubCategoryId;
        $scope.item.ProductTypeId = $state.params.ProductTypeId;
        $scope.item.SubProductTypeId = $state.params.SubProductTypeId;
        $scope.item.IsBillable = $state.params.IsBillable;
        $scope.item.FacilityId = utl.Session.getCurrentFacilityId();

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item.map = [];
            for (var idx in data) {
                var item = data[idx];
                if (item.FacilityId == $scope.item.FacilityId) {
                    $scope.item.map.push(item);
                }
            }
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [
                        { Key: 0, Value: $scope.currentcontext.id },
                    ]
                };

                var options = {
                    action: 'pharmacy/itemmaster/GetStores',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                $scope.$doAction(options);
            }
        };

        $scope.backToList = function () {
            $state.go('app.newitemmastertabgeneral.itemmastergeneral');
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            $scope.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        };

        $scope.saveItem = function () {
            for (var idx in $scope.item.map) {
                var item = $scope.item.map[idx];
                item.ItemCode = $scope.item.ItemCode;
                item.ItemName = $scope.item.ItemName;
                item.CategoryId = $scope.item.CategoryId;
                item.SubCategoryId = $scope.item.SubCategoryId;
                item.ProductTypeId = $scope.item.ProductTypeId;
                item.SubProductTypeId = $scope.item.SubProductTypeId;
                item.IsBillable = $scope.item.IsBillable;
                item.FacilityId = $scope.item.FacilityId;
            }

            var actionName = 'pharmacy/itemmaster/MapItemStores';

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
                // { "Key": "StoreMaster" },
                { "Key": "StoreMaster", Request: { Params: [{ Key: 7, Value: 2 }, { Key: 6, Value: [-1, utl.Session.getCurrentFacilityId()] }] } }

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

    newgeneralitemmasterStoreMapController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();