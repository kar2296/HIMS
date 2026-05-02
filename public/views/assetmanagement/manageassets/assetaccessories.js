(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('assetAccessoriesListController', assetAccessoriesListController);

    function assetAccessoriesListController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId(),
        };
        $scope.currentcontext = {};
        $scope.currentcontext.assetid = parseInt($stateParams.id);
        var assetid = parseInt($stateParams.id);
        var IsProfile = $state.params.IsProfile;
        var AssetCode = $state.params.AssetCode;
        var AssetName = $state.params.AssetName;

        $scope.addNewLineItem = function () {
            var lineItem = {
                Id: 0,
                AccessoriesName: '',
                SerialNO: '',
                WarrentyFrom: utl.Formatter.getCurrentDate(),
                WarrentyTo: '',
                PO: utl.Formatter.getCurrentDate(),
                Cost: '',
                Description: '',
                Status: 1,
                StatusId: true
            };
            vm.items.push(lineItem);
        }
        //getlist
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.items = res.Data;
            // $scope.addNewLineItem();
        };

        $scope.getList = function () {

            var inputData = {
                Params: [{
                    Key: 1,
                    Value: $scope.currentcontext.assetid
                }],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'AssetManagement/AssetAccessories/GetAssetAccessoriess',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.clear = function () {
            vm.items = [];
            $scope.addNewLineItem();
        }
        $scope.backToList = function () {
            $state.go('app.assettab.assetmaintanance', {
                id: $scope.currentcontext.assetid
            });
        }
        $scope.back = function () {
            $state.go('app.assettab.details', {
                id: $scope.currentcontext.assetid
            });
        }
        $scope.addNew = function () {
            $scope.addNewLineItem();
        }
        $scope.getassetsCallback = function (scope, data, options, hasError) {

            if (data.Data.length > 0) {
                $scope.Assets = data.Data[0];
                $scope.item.AssetId = $scope.Assets.Id
                $scope.item.AssetName = $scope.Assets.AssetName
            }
        };

        $scope.getAssets = function () {
            var inputData = {
                Params: [{
                        Key: 0,
                        Value: $scope.item.AssetId
                    },

                ]
            };
            var options = {
                action: 'AssetManagement/Asset/GetAssets',
                data: inputData,
                type: 'post',
                onComplete: $scope.getassetsCallback
            };

            utl.Http.doAction(options);
        };

        $scope.serviceChanged = function (idx) {
            var lastIndex = vm.items.length - 1;
            if (idx == lastIndex) {
                $scope.addNewLineItem();
            }
        }

        //deleteLineItem
        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;
            $scope.saveItem();
        }

        $scope.deleteItem = function (idx, item) {
            var name = item.SerialNO || '';
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
        }

        //Save Item
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        };

        $scope.saveItem = function () {
            if (validateGrid()) {
                var lines = getLinesForSave();
                var options = {
                    action: 'AssetManagement/AssetAccessories/ManageAssetAccessoriess',
                    data: {
                        Data: lines
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        function validateGrid() {
            var activeRecords = $filter('filterArrayItems')(vm.items, [{
                search: 1,
                fields: ['Status']
            }]);

            var lastIndex = activeRecords.length - 1;
            for (var idx in activeRecords) {
                var item = activeRecords[idx];
                if (idx == lastIndex && !item.AccessoriesName && !item.WarrentyFrom && !item.WarrentyTo) {
                    continue;
                } else if (item.AccessoriesName == '' || item.WarrentyFrom == '' || item.WarrentyTo == '') {
                    utl.Alert.showErrorMsg($translate.instant('common.req-validation-msg.lbl'));
                    return false;
                }
            }
            return true;
        }

        function getLinesForSave() {
            var result = [];
            var lastIndex = vm.items.length - 1;

            for (var idx in vm.items) {
                var item = vm.items[idx];
                if (item.AccessoriesName) {
                    item.AssetId = $scope.currentcontext.assetid;
                    result.push(item);
                }
            }
            return result;
        }

        $scope.computeNetAmount = function (item) {
            if (item.Quantity && item.Amount) {
                item.NetAmount = item.Quantity * item.Amount;
            }
        }
        //lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
            $scope.getAssets();
        }

        $scope.initLookup = function () {
            var inputData = [
                // { "Key": "TestMaster" },
                // { "Key": "ServiceItemDiscountType"}
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

    assetAccessoriesListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();