(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('itemrackmappingFormController', itemrackmappingFormController);

    function itemrackmappingFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, $filter) {
        var vm = this;

        $scope.item = {
            IsActive: true,
            StoreMasterId: 0,
            FacilityId: utl.Session.getCurrentFacilityId(),
            RackId: -1
        };

        $scope.lookup = {};
        $scope.currentcontext = {
            id: -1
        };

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.getItemCallback = function(scope, data, options, hasError) {
            $scope.item = data;
        };

        $scope.getItem = function(pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'pharmacy/itemmaster/GetStoreItems',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getList = function(pageNo) {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.currentcontext.id
                }]
            };

            var options = {
                action: 'pharmacy/itemmaster/GetStoreItems',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getListCallback = function(scope, res, options, hasError) {
            var data = res.Data[0];

            $scope.currentcontext.id = data.Id;

            $scope.item.Id = data.Id;
            $scope.item.FacilityId = data.FacilityId;
            if (data.Facility !== null) {
                $scope.item.FacilityCode = data.Facility.FacilityCode;
                $scope.item.FacilityName = data.Facility.FacilityName;
            } else {
                $scope.item.FacilityCode = '';
                $scope.item.FacilityName = '';
            }
            $scope.item.StoreMasterId = data.StoreMasterId;
            if (data.StoreMaster !== null) {
                $scope.item.StoreCode = data.StoreMaster.StoreCode;
                $scope.item.StoreName = data.StoreMaster.StoreName;
            } else {
                $scope.item.StoreCode = '';
                $scope.item.StoreName = '';
            }
            if (data.ItemMaster.ItemCategory !== null) {
                $scope.item.Category = data.ItemMaster.ItemCategory.CategoryName;
            } else {
                $scope.item.Category = '';
            }
            if (data.ItemMaster.ItemSubCategory !== null) {
                $scope.item.SubCategory = data.ItemMaster.ItemSubCategory.SubCategoryName;
            } else {
                $scope.item.SubCategory = '';
            }
            if (data.ItemMaster.ProductType !== null) {
                $scope.item.ProductType = data.ItemMaster.ProductType.ProductTypeName;
            } else {
                $scope.item.ProductType = '';
            }
            if (data.ItemMaster.ProductSubType !== null) {
                $scope.item.SubProductType = data.ItemMaster.ProductSubType.SubProductTypeName;
            } else {
                $scope.item.SubProductType = '';
            }
            $scope.item.ItemCode = data.ItemCode;
            $scope.item.ItemName = data.ItemName;
            $scope.item.RackId = data.RackId;
            $scope.item.Self = data.Self;
            $scope.item.Tray = data.Tray;

            $scope.GetStoreRacks();
        };

        $scope.SelectedRack = function(selectedItem) {
            $scope.item.RackCode = selectedItem.RackCode;
            $scope.item.RackName = selectedItem.RackName;
        };

        $scope.backToList = function() {
            $scope.confirmCallback();
        };

        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.Save = function() {
            $scope.saveItem();
        };

        $scope.SaveandApprove = function() {
            $scope.saveItem();
        };

        $scope.saveItem = function() {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'pharmacy/ItemStoreMap/AddItemStoreMap';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'pharmacy/ItemStoreMap/UpdateItemStoreMap';
            }

            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            forEach(data, function(value, key) {
                $scope.lookup[key] = value;
            });
        };

        function loadData() {
            $scope.getList();
        }

        $scope.initLookup = function() {
            var inputData = [{
                    "Key": "Facility"
                },
                {
                    "Key": "UserStores",
                    Request: {
                        Params: [{
                            Key: 1,
                            Value: utl.Session.getCurrentUserId()
                        },
                        {
                            Key: 2,
                            Value: utl.Session.getCurrentFacilityId(),
                        },
                        {
                            Key: 5,
                            Value: 2
                        }
                        ]
                    },
                    Default: false
                },
            ];

            $scope.getLookUp(inputData);
            loadData();
        };

        $scope.getLookUp = function(inputData) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.GetStoreRacks = function() {
            var inputData = [{
                "Key": "Rack",
                Request: {
                    Params: [
                        { Key: 2, Value: $scope.item.StoreMasterId },
                        { Key: 3, Value: 2 }
                    ]
                }
            }];
            $scope.getLookUp(inputData);
        };

        $scope.initLookup();
    }

    itemrackmappingFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', '$filter'];

})();