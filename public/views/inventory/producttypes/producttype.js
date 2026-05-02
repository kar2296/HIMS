(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('productTypeFormController', productTypeFormController);

    function productTypeFormController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.item = {
            IsActive: true,
            isDisabled: false,
            IsAllFacility: false
        };
        $scope.item.FacilityId = utl.Session.getCurrentFacilityId();

        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);

        // if (modalConfig && modalConfig.params) {
        //     $scope.currentcontext.id = parseInt(modalConfig.params.id);

        //     $scope.confirmCallback = $uibModalInstance.close;
        //     $scope.cancelCallback = $uibModalInstance.dismiss;
        // }

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            //         if ($scope.item.ActiveStatusId == 2) {
            //             $scope.item.isDisabled = true;
            //         }
            //          if
            //   ($scope.item.ActiveStatusId == 3) {
            //             $scope.item.isDisabled =true;
            //         }
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'pharmacy/producttype/GetProductTypeById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $state.go('app.producttypes');
        }
        $scope.addNew = function () {
            $state.go('app.producttype', {
                id: 0
            });
        }
        $scope.clear = function () {
            $scope.item = {};
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
        };

        $scope.save = function () {
            $scope.item.ActiveStatusId = 1;
            $scope.saveItem();
        }

        $scope.saveandApprove = function () {
            if ($scope.item.IsActive) {
                $scope.item.ActiveStatusId = 2;
            } else {
                $scope.item.ActiveStatusId = 3;
            }
            $scope.saveItem();
        }

        $scope.saveItem = function () {

            // if(!$scope.item_form.isValid()) {
            //    utl.Alert.showErrorMsg($translate.instant('common.validationmsg.lbl'));
            //    return;
            // }
            if (!utl.Validator.validate($scope)) {
                return;
            }
            if ($scope.item.IsAllFacility == true) {
                $scope.item.FacilityId = -1;
            }
            if ($scope.item.IsAllFacility == false) {
                $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
            }
            var actionName = 'Pharmacy/ProductType/AddProductType';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'Pharmacy/ProductType/UpdateProductType';
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
        $scope.getSubType = function () {
            $scope.item.SubTypeId = -1;
            var inputData = [{
                "Key": "ItemSubType",
                Request: {
                    Params: [{
                        Key: 7,
                        Value: $scope.item.SubCategoryId || -1
                    }, {
                        Key: 3,
                        Value: 2
                    }, {
                        Key: 4,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    }, ]
                }
            }];
            $scope.initLookup(inputData);
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [
                //{ "Key": "ItemSubCategory" },
                // { "Key": "ItemCategory" },
                {
                    "Key": "Facility"
                },
                {
                    "Key": "ItemCategory",
                    Request: {
                        Params: [{
                            Key: 3,
                            Value: 2
                        }, {
                            Key: 4,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    },
                    Default: false
                },
                {
                    "Key": "ItemSubCategory",
                    Request: {
                        Params: [{
                            Key: 3,
                            Value: 2
                        }]
                    },
                    Default: false
                },
                {
                    "Key": "ItemSubType",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: $scope.item.SubCategoryId || -1
                        }, {
                            Key: 3,
                            Value: 2
                        }, {
                            Key: 4,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }, ]
                    }
                },
            ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }
        $scope.fillMasterInfo = function (selectedItem) {
            $scope.item.SubCategoryId = selectedItem.SubCategoryId;
            $scope.item.AllergyName = selectedItem.AllergyName;
            $scope.item.Description = selectedItem.Description;
        }
        $scope.initLookup();
    }

    productTypeFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();