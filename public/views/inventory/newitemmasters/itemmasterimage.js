(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('newitemmasterImageController', newitemmasterImageController);

    function newitemmasterImageController($scope, $filter, $stateParams, $state, $translate, utl, Upload) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.lookup = {};
        $scope.item = {
            IsActive: true,
            isDisabled: false,
            BaseUomId: 1,
            SaleUomId: 1
        };

        $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.getItemProfilePic();

        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'pharmacy/itemmaster/GetItemMasterById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.getItemProfilePicCallback = function (scope, data, options, hasError) {
            //console.log(data);
            $scope.currentcontext.Photo = data;
        };


        $scope.getItemProfilePic = function () {
            if ($scope.item.ImagePath) {
                var inputData = { ImagePath: $scope.item.ImagePath };
                var options = {
                    action: 'pharmacy/itemmaster/GetItemLogo',
                    data: { Data: inputData },
                    type: 'post',
                    onComplete: $scope.getItemProfilePicCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $state.go('app.itemmastertab.itemmaster');
        };

        $scope.clear = function () {
            $scope.item = {
                IsActive: true,
                isDisabled: false,
                BaseUomId: 1,
                SaleUomId: 1
            };
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.item.ManufacturerId = 0;
            if (typeof (data) == "boolean") {
                if (options && options.data !== null && options.data.Data != null) {
                    $scope.currentcontext.id = options.data.Data.Id;
                    $scope.getItem();
                }
            } else if (typeof (data) == "number") {
                $state.go('app.itemmastertab.itemmaster', { id: data, IsProfile: null, ItemCode: options.data.Data.ItemCode, ItemName: options.data.Data.ItemName });
            } else {
                $scope.backToList();
            }
        };



        $scope.save = function () {
            $scope.item.ActiveStatusId = 2;
            $scope.saveItem();
        };

        $scope.SaveandApprove = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'inventory.itemmaster.approvemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandApproveConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onSaveandApproveConfirmed = function () {
            if ($scope.item.IsActive) {
                $scope.item.ActiveStatusId = 2;
            } else {
                $scope.item.ActiveStatusId = 3;
            }
            $scope.saveItem();
        };

        $scope.saveItem = function () {
            // if (!utl.Validator.validate($scope)) {
            //     return;
            // }

            var actionName = 'pharmacy/itemmaster/AddItemMaster';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'pharmacy/itemmaster/UpdateItemMaster';
            }


            if ($scope.currentcontext.file) {
                var actionUrl = utl.Http.getRootPath() + actionName;

                Upload.upload({
                    url: actionUrl,
                    data: {
                        file: $scope.currentcontext.file,
                        Data: $scope.item
                    }
                }).then(function (resp) { //upload function returns a promise
                    utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
                    //  $scope.currentcontext.file = null;
                    $scope.backToList();
                },
                    function (resp) { //catch error
                        console.log('Error status: ' + resp.status);
                        utl.Alert.showErrorMsg('Error status: ' + resp.status);
                    },
                    function (evt) {
                        console.log(evt);
                    });
                return false;
            } else {
                var options = {
                    action: actionName,
                    data: {
                        Data: $scope.item,
                        file: $scope.currentcontext.file
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            // $scope.lookup = hasError ? {} : data;
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
            });

            $scope.getItem();

            if ($scope.item.Activefrom === null)
                $scope.item.Activefrom = new Date();
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
                {
                    "Key": "ProductSubType",
                    Request: {
                        Params: [{
                            Key: 3,
                            Value: 2
                        }, {
                            Key: 6,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        },]
                    }
                },
                { "Key": "Generic" },
                {
                    "Key": "UomMaster",
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
                    "Key": "GstMaster",
                    Request: {
                        Params: [{
                            Key: 3,
                            Value: 2
                        }, {
                            Key: 5,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        },]
                    }
                },
                { "Key": "ScheduleType" },
                { "Key": "STORAGECONDITION" },
                { "Key": "VendorMaster", Request: { Params: [{ Key: 3, Value: 2 }] } }
            ];
            $scope.getLookUp(inputData);
        };

        $scope.getLookUp = function (inputData) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.initLookup();

        $scope.getProductType = function () {
            $scope.item.SubProductTypeId = -1;
            var inputData = [{
                "Key": "ProductSubType",
                Request: {
                    Params: [{
                        Key: 3,
                        Value: 2
                    }, {
                        Key: 6,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    },
                    { Key: 5, Value: $scope.item.ProductTypeId || -1 },
                    ]
                }
            }];
            $scope.getLookUp(inputData);
        }

        $scope.getCategory = function () {
            $scope.item.SubCategoryId = -1;
            var inputData = [{
                "Key": "ItemSubCategory",
                Request: {
                    Params: [{
                        Key: 3,
                        Value: 2
                    }, {
                        Key: 4,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    },
                    { Key: 5, Value: $scope.item.CategoryId || -1 },

                    ]
                }
            }];
            $scope.getLookUp(inputData);
        }



        $scope.getVendorMapping = function () {
            var inputData = [{
                "Key": "VendorMaster",
                Request: {
                    Params: [{ Key: 2, Value: 1 }]
                }
            }];

            $scope.getLookUp(inputData);
        };

        $scope.getVendorMapping();
    }

    newitemmasterImageController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', 'Upload'];

})();