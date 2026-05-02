(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('productSubTypeFormController', productSubTypeFormController);

    function productSubTypeFormController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.item = {
            IsActive: true,
            isDisabled: false,
            CategoryId: -1,
            SubCategoryId: -1,
            ProductTypeId: -1,
            FacilityId: utl.Session.getCurrentFacilityId()
        };

        $scope.lookup = {};

        $scope.currentcontext = {};

        $scope.currentcontext.id = parseInt($stateParams.id);

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;

            if ($scope.item.CategoryId > 0) {
                $scope.filterSubCategory();
                $scope.item.SubCategoryId = data.SubCategoryId;
            } else {
                $scope.item.SubCategoryId = -1;
            }

            if ($scope.item.SubCategoryId > 0) {
                $scope.filterProductType();
                $scope.item.ProductTypeId = data.ProductTypeId;
            } else {
                $scope.item.ProductTypeId = -1;
            }
        };

        $scope.getItem = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'pharmacy/productsubtype/GetProductSubTypeById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $state.go('app.productsubtypes');
        };

        $scope.clear = function () {
            $scope.item = {};
        };

        $scope.addNew = function () {
            $state.go('app.productsubtype', { id: 0 });
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.save = function () {
            $scope.item.ActiveStatusId = 1;
            $scope.saveItem();
        };

        $scope.saveandApprove = function () {
            if ($scope.item.IsActive == true) { $scope.item.ActiveStatusId = 2; }
            else { $scope.item.ActiveStatusId = 3; }
            $scope.saveItem();
        };

        $scope.saveItem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var actionName = 'pharmacy/productsubtype/AddProductSubType';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'pharmacy/productsubtype/UpdateProductSubType';
            }
            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.lookupCallbackOnSelect = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
            });
        };

        $scope.getLookUpOnSelect = function (inputData) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallbackOnSelect
            };
            utl.Http.doAction(options);
        };

        $scope.getProductType = function () {
            var inputData = [
                //     {
                //     "Key": "ProductType",
                //     Request: { Params: [{ Key: 6, Value: $scope.item.SubCategoryId || -1 }] }
                // }
                {
                    "Key": "ProductType",
                    Request: {
                        Params: [{
                            Key: 3,
                            Value: 2
                        }, { Key: 6, Value: $scope.item.SubCategoryId || -1 }, {
                            Key: 4,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        },]
                    }
                },];
            $scope.getLookUpOnSelect(inputData);
            $scope.item.ProductTypeId = -1;
        };

        $scope.getSubCategory = function () {
            var inputData = [{
                "Key": "ItemSubCategory",
                Request: {
                    Params: [{
                        Key: 3,
                        Value: 2
                    }, {
                        Key: 4,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    }, { Key: 5, Value: $scope.item.CategoryId || -1 }]
                }
            }];
            $scope.getLookUpOnSelect(inputData);
            $scope.item.SubCategoryId = -1;
        };

        $scope.filterProductType = function () {
            var inputData = [
                {
                    "Key": "ProductType",
                    Request: {
                        Params: [{
                            Key: 3,
                            Value: 2
                        }, {
                            Key: 4,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }, { Key: 6, Value: $scope.item.SubCategoryId || -1 }]
                    }
                }];
            $scope.getLookUpOnSelect(inputData);
        };

        $scope.filterSubCategory = function () {
            var inputData = [{
                "Key": "ItemSubCategory",
                Request: {
                    Params: [{
                        Key: 3,
                        Value: 2
                    }, {
                        Key: 4,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    }, { Key: 5, Value: $scope.item.CategoryId || -1 }]
                }
            }];
            $scope.getLookUpOnSelect(inputData);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                {
                    "Key": "ItemCategory",
                    Request: {
                        Params: [{
                            Key: 3,
                            Value: 2
                        }, {
                            Key: 4,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        },]
                    }
                },
                {
                    "Key": "ItemSubCategory",
                    Request: {
                        Params: [{
                            Key: 3,
                            Value: 2
                        }, {
                            Key: 4,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        },]
                    }
                },
                // { "Key": "ProductType", Request: { Params: [{ Key: 3, Value: 2 }] } }
                {
                    "Key": "ProductType",
                    Request: {
                        Params: [{
                            Key: 3,
                            Value: 2
                        }, {
                            Key: 4,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        },]
                    }
                },
            ]
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

    productSubTypeFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();