(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('facilityitemmasterCustomerMapFormController', facilityitemmasterCustomerMapFormController);

    function facilityitemmasterCustomerMapFormController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        $scope.currentcontext.ItemFacilityMapId = modalConfig.params.ItemFacilityMapId;
        $scope.currentcontext.Id = modalConfig.params.id;

        if (modalConfig && modalConfig.params) {
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.item = {
            IsActive: true,
            ActiveFrom: utl.Formatter.getCurrentDate(),
            PurchaseUomId: 1,
            DiscountModeId: 2
        };

        $scope.item.FacilityId = modalConfig.params.FacilityId;
        $scope.item.ItemMasterId = modalConfig.params.ItemMasterId;
        $scope.item.ItemCode = modalConfig.params.ItemCode;
        $scope.item.ItemName = modalConfig.params.ItemName;

        $scope.item.RDODiscountMode = false;
        $scope.item.RDODiscount = true;
        $scope.item.GstDisable = true;
        $scope.item.IsMRPRequired = false;

        var IsProfile = modalConfig.params.IsProfile;
        var FacilityId = modalConfig.params.FacilityId;
        var ItemMasterId = modalConfig.params.ItemMasterId;
        var ItemCode = modalConfig.params.ItemCode;
        var ItemName = modalConfig.params.ItemName;

        $scope.OnSelectPurchaseUOM = function (selectedItem) {
            $scope.item.PurchaseUomId = selectedItem.Id;
            $scope.item.PurchaseUomCode = selectedItem.UomCode;
            $scope.getConversionQuantity();
        };

        $scope.OnSelectSaleUOM = function (selectedItem) {
            $scope.item.SaleUomId = selectedItem.Id;
            $scope.item.SaleUomCode = selectedItem.UomCode;
        };

        $scope.CalcualteUnitPrice = function (item) {
            item.Price = (parseFloat(item.UomPrice) / parseFloat(item.ConversionQuantity)).toFixed(2);
        };

        $scope.CalcualteUnitCrPrice = function (item) {
            if (item.UomCrPrice > 0) {
                item.CrPrice = (parseFloat(item.UomCrPrice) / parseFloat(item.ConversionQuantity)).toFixed(2);
            } else {
                item.CrPrice = 0;
            }
        };

        $scope.CalcualteUnitMrPrice = function (item) {
            if (item.UomMrPrice > 0) {
                item.MrPrice = (parseFloat(item.UomMrPrice) / parseFloat(item.ConversionQuantity)).toFixed(2);
            } else {
                item.MrPrice = 0;
            }
        };

        $scope.CalcualteCrPrice = function (item) {
            if (item.Discount > 0) {
                if (item.DiscountModeId == 2) {
                    var discountamount = parseFloat((parseFloat(item.Discount) / 100) * parseFloat(item.UomMrPrice)).toFixed(2);
                    item.UomCrPrice = parseFloat(parseFloat(item.UomMrPrice) - parseFloat(discountamount)).toFixed(2);
                    item.CrPrice = parseFloat(parseFloat(item.UomCrPrice) / parseFloat(item.ConversionQuantity)).toFixed(2);
                } else {
                    item.UomCrPrice = parseFloat(parseFloat(item.UomMrPrice) - parseFloat(item.Discount)).toFixed(2);
                    item.CrPrice = parseFloat(parseFloat(item.UomCrPrice) / parseFloat(item.ConversionQuantity)).toFixed(2);
                }
            }
        };

        $scope.getConversionQuantity = function () {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentcontext.ItemMasterId },
                    { Key: 2, Value: 2 },
                    { Key: 3, Value: $scope.item.PurchaseUomId }
                ],
                PageContext: { PageSize: 25, PageNumber: 1 }
            };

            var options = {
                action: 'pharmacy/uomconversion/GetUomConversions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getConversionQuantityCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getConversionQuantityCallback = function (scope, res, options, hasError) {
            var cqrecord = res.Data;
            if (cqrecord.length > 0) {
                $scope.item.ConversionQuantity = cqrecord[0].ConversionQuantity;

                if (parseFloat($scope.item.UomPrice) > 0) {
                    $scope.item.Price = (parseFloat($scope.item.UomPrice) / parseFloat($scope.item.ConversionQuantity)).toFixed(2);
                } else {
                    $scope.item.Price = 0;
                }

                if (parseFloat($scope.item.UomCrPrice) > 0) {
                    $scope.item.CrPrice = (parseFloat($scope.item.UomCrPrice) / parseFloat($scope.item.ConversionQuantity)).toFixed(2);
                } else {
                    $scope.item.CrPrice = 0;
                }

                if (parseFloat($scope.item.UomMrPrice) > 0) {
                    $scope.item.MrPrice = (parseFloat($scope.item.UomMrPrice) / parseFloat($scope.item.ConversionQuantity)).toFixed(2);
                } else {
                    $scope.item.MrPrice = 0;
                }
            } else {
                $scope.item.ConversionQuantity = 1;

                if (parseFloat($scope.item.UomPrice) > 0) {
                    $scope.item.Price = parseFloat($scope.item.UomPrice);
                } else {
                    $scope.item.Price = 0;
                }

                if (parseFloat($scope.item.UomCrPrice) > 0) {
                    $scope.item.CrPrice = parseFloat($scope.item.UomCrPrice);
                } else {
                    $scope.item.CrPrice = 0;
                }

                if (parseFloat($scope.item.UomMrPrice) > 0) {
                    $scope.item.MrPrice = parseFloat($scope.item.UomMrPrice);
                } else {
                    $scope.item.MrPrice = 0;
                }
            }
        };

        $scope.getCustomerMappedItem = function () {
            var inputData = {
                Params: [{ Key: 0, Value: $scope.currentcontext.Id }]
            };

            var options = {
                action: 'pharmacy/itemmaster/GetItemCustomerMaps',
                data: inputData,
                type: 'post',
                onComplete: $scope.getCustomerMappedItemCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getCustomerMappedItemCallback = function (scope, res, options, hasError) {
            $scope.item = res.Data[0];
            $scope.item.IsMRPRequired = $scope.item.ItemMaster.IsMRPRequired;
            $scope.item.GstDisable = true;
        };

        $scope.getMasterItem = function () {
            var inputData = {
                Params: [{ Key: 0, Value: $scope.currentcontext.ItemFacilityMapId }]
            };

            var options = {
                action: 'pharmacy/itemfacilitymap/GetFacilityMasterItem',
                data: inputData,
                type: 'post',
                onComplete: $scope.getMasterItemCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getMasterItemCallback = function (scope, res, options, hasError) {
            $scope.item = res.Data[0];
            $scope.item.ItemFacilityMapId = $scope.item.Id;
            if ($scope.item.ItemMaster.UomConversions) {
                for (var uomidx in $scope.item.ItemMaster.UomConversions) {
                    var uomitem = $scope.item.ItemMaster.UomConversions[uomidx];
                    if (uomitem.UomTypeId == 2) {
                        $scope.item.PurchaseUomId = uomitem.UomId;
                        $scope.item.ConversionQuantity = uomitem.ConversionQuantity;
                    }
                    if (uomitem.UomTypeId == 3) {
                        $scope.item.SaleUomId = uomitem.UomId;
                    }
                }
            } else if ($scope.item.UomMaster) {
                $scope.item.PurchaseUomId = $scope.item.PurchaseUomId;
                $scope.item.SaleUomId = $scope.item.SaleUomId;
                $scope.item.ConversionQuantity = 1;
            } else {
                $scope.item.PurchaseUomId = 1;
                $scope.item.SaleUomId = 1;
                $scope.item.ConversionQuantity = 1;
            }
            $scope.item.FreeQty = 0;
            $scope.item.UomPrice = 0;
            $scope.item.UomCrPrice = 0;
            $scope.item.UomMrPrice = 0;
            $scope.item.Price = 0;
            $scope.item.CrPrice = 0;
            $scope.item.MrPrice = 0;
            $scope.item.DiscountModeId = -1;
            $scope.item.Discount = 0;
            $scope.item.Id = 0;
            $scope.item.GstDisable = true;

            if ($scope.item.IsMRPRequired)
                $scope.item.IsMRPRequired = true;
        };

        $scope.backToList = function () {
            $state.go('app.facilityitemmastertab.facilityitemmastercustomermappings');
        };

        $scope.save = function () {
            $scope.item.ActiveStatusId = 1;
            $scope.saveItem();
        };

        $scope.saveandApprove = function () {
            if ($scope.item.IsActive) {
                $scope.item.ActiveStatusId = 2;
            } else {
                $scope.item.ActiveStatusId = 3;
            }
            $scope.saveItem();
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
        };

        $scope.errorItemCallback = function (data, options) {
            if (data.Error && data.Error.Code == 'THIS_ITEM_ALREADY_MAPPED') {
                utl.Alert.showErrorMsg($translate.instant('inventory.facilitymaster.customermapping.lbl'));
            }
        };

        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            if ($scope.item.IsMRPRequired) {
                if ($scope.item.ItemMasterId > 0 && parseFloat($scope.item.UomMrPrice) <= 0) {
                    utl.Alert.showErrorMsg($translate.instant('inventory.facilitymaster.mrp.lbl') + $scope.item.ItemName);
                    return false;
                } else if ($scope.item.ItemMasterId > 0 && ($scope.item.UomMrPrice === null || $scope.item.UomMrPrice === "")) {
                    utl.Alert.showErrorMsg($translate.instant('inventory.facilitymaster.mrp.lbl') + $scope.item.ItemName);
                    return false;
                } else if ($scope.item.ItemMasterId > 0 && parseFloat($scope.item.UomMrPrice) < parseFloat($scope.item.UomPrice)) {
                    utl.Alert.showErrorMsg($translate.instant('inventory.facilitymaster.ucp.lbl') + $scope.item.ItemName);
                    return false;
                }
            }

            if ($scope.item.UomMrPrice === null || $scope.item.UomMrPrice === "")
                $scope.item.UomMrPrice = 0;

            if ($scope.item.UomCrPrice === null || $scope.item.UomCrPrice === "")
                $scope.item.UomCrPrice = 0;

            if ($scope.item.MrPrice === null || $scope.item.MrPrice === "")
                $scope.item.MrPrice = 0;

            $scope.item.ItemFacilityMapId = $scope.currentcontext.ItemFacilityMapId;
            var actionName = 'pharmacy/itemmaster/AddItemCustomerMap';
            if ($scope.currentcontext.Id && $scope.currentcontext.Id > 0) {
                actionName = 'pharmacy/itemmaster/UpdateItemCustomerMap';
            }

            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.saveItemCallback,
                onError: $scope.errorItemCallback
            };

            utl.Http.doAction(options);
        };

        vm.customercontrolconfig = {
            query: '',
            searchbyid: false,

            options: [
                { header: 'Customer Code', field: 'CustomerCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Customer Name', field: 'CustomerName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Customer Contact', field: 'PhoneNumber', datatype: 'string', headercls: 'td-phoneno', fieldcls: 'td-phoneno' }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/customermaster/GetCustomerMasters',
            formatdisplay: formatselectedcustomer,
            presearch: presearchcustomer,
            postsearch: postsearchcustomer
        };

        function formatselectedcustomer() {
            var selectedItem = vm.customercontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = selectedItem.CustomerName;
                $scope.item.CustomerCode = selectedItem.CustomerCode;
                $scope.item.CustomerName = selectedItem.CustomerName;
            } else if (vm.customercontrolconfig.rowdata) {
                result = [vm.customercontrolconfig.rowdata.CustomerName].join(' ');
            }
            return result;
        }

        function presearchcustomer() {
            var query = vm.customercontrolconfig.query;
            var inputData = {
                Params: [{ Key: 4, Value: 2 }],
                PageContext: { PageSize: 25, PageNumber: 1 }
            };

            if (vm.customercontrolconfig.searchbyid === true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 2, Value: query });
            }

            vm.customercontrolconfig.searchparams = inputData;
        }

        function postsearchcustomer() {
            for (var idx in vm.customercontrolconfig.result) {

                var item = vm.customercontrolconfig.result[idx];

                item.CustomerCode = item.CustomerCode;
                item.CustomerName = item.CustomerName;
                item.PhoneNumber = item.PhoneNumber;
            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.lookup.CustomerMaster = IsProfile ? $scope.lookup.CustomerMaster : $scope.lookup.CustomerMaster;
            if ($scope.currentcontext.Id > 0) {
                $scope.getCustomerMappedItem();
            } else {
                $scope.getMasterItem();
            }
        };

        $scope.initLookup = function () {
            var inputData = [
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
                { "Key": "DiscountMode" }
            ];
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.onCustomerSelected = function (selectedItem) {
            if (IsProfile) {
                $scope.item.CustomerName = selectedItem.CustomerName;
                $scope.item.CustomerCode = selectedItem.CustomerCode;
            } else {
                $scope.item.CustomerName = selectedItem.CustomerName;
                $scope.item.CustomerCode = selectedItem.CustomerCode;
            }
        };

        $scope.OnSelectDiscountMode = function (selecteditem) {
            if (selecteditem.Id > 0) {
                $scope.item.DiscountModeCode = selecteditem.Text;
                $scope.item.RDODiscount = false;
                selecteditem.RDODiscountMode = true;
            } else {
                $scope.item.DiscountModeCode = selecteditem.Text;
                $scope.item.RDODiscount = true;
                selecteditem.RDODiscountMode = false;
            }
        };

        $scope.initLookup();
    }

    facilityitemmasterCustomerMapFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();