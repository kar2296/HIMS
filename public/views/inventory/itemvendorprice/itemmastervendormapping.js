(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ItemVendorPriceFormController', ItemVendorPriceFormController);

    function ItemVendorPriceFormController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        $scope.currentcontext.ItemMasterId = modalConfig.params.ItemMasterId;
        $scope.currentcontext.Id = modalConfig.params.id;

        if (modalConfig && modalConfig.params) {
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.item = {
            IsActive: true,
            ActiveFrom: utl.Formatter.getCurrentDate(),
            PurchaseUomId: 1,
            RankId: 1,
            DiscountModeId: 2
        };

        $scope.item.ItemCode = modalConfig.params.ItemCode;
        $scope.item.ItemName = modalConfig.params.ItemName;

        $scope.item.RDODiscountMode = false;
        $scope.item.RDODiscount = true;
        $scope.item.GstDisable = true;
        $scope.item.IsMRPRequired = false;

        var IsProfile = modalConfig.params.IsProfile;
        var ItemCode = modalConfig.params.ItemCode;
        var ItemName = modalConfig.params.ItemName;

        $scope.OnSelectGst = function (selectedItem) {
            $scope.item.GstCode = selectedItem.GstCode;
            $scope.item.GstName = selectedItem.Text;
            $scope.item.GstPercentage = selectedItem.GstPercentage;
        };

        $scope.OnSelectPurchaseUOM = function (selectedItem) {
            $scope.item.PurchaseUomId = selectedItem.Id;
            $scope.item.PurchaseUomCode = selectedItem.UomCode;
            $scope.getConversionQuantity();
        };

        $scope.OnSelectSaleUOM = function (selectedItem) {
            $scope.item.SaleUomCode = selectedItem.UomCode;
        };

        $scope.CalcualteUnitPrice = function (item) {
            item.Price = (parseFloat(item.UomPrice) / parseFloat(item.ConversionQuantity)).toFixed(2);
        };

        $scope.CalcualteUnitMrPrice = function (item) {
            if (item.UomMrPrice > 0) {
                item.MrPrice = (parseFloat(item.UomMrPrice) / parseFloat(item.ConversionQuantity)).toFixed(2);
            } else {
                item.MrPrice = 0;
            }
        };

        $scope.getConversionQuantity = function () {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentcontext.itemmasterid },
                    { Key: 2, Value: 2 },
                    { Key: 3, Value: $scope.item.PurchaseUomId }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
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
            $scope.item.ConversionQuantity = cqrecord[0].ConversionQuantity;
        };

        $scope.getVendorMappedItem = function () {
            var inputData = {
                Params: [
                    { Key: 0, Value: $scope.currentcontext.Id }
                ]
            };

            var options = {
                action: 'pharmacy/itemmaster/GetItemVendorMaps',
                data: inputData,
                type: 'post',
                onComplete: $scope.getVendorMappedItemCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getVendorMappedItemCallback = function (scope, res, options, hasError) {
            $scope.item = res.Data[0];
            $scope.item.IsMRPRequired = $scope.item.ItemMaster.IsMRPRequired;
            $scope.item.GstDisable = true;
        };

        $scope.getMasterItem = function () {
            var inputData = {
                Params: [
                    { Key: 0, Value: $scope.currentcontext.ItemMasterId }
                ]
            };

            var options = {
                action: 'pharmacy/itemmaster/GetItemMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getMasterItemCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getMasterItemCallback = function (scope, res, options, hasError) {
            $scope.item = res.Data[0];
            $scope.item.ItemMasterId = $scope.item.Id;
            if ($scope.item.UomConversions) {
                for (var uomidx in $scope.item.UomConversions) {
                    var uomitem = $scope.item.UomConversions[uomidx];
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
            $scope.item.RankId = -1;
            $scope.item.LeadTime = 0;
            $scope.item.CreditDays = 0;
            $scope.item.MinQty = 0;
            $scope.item.MaxQty = 0;
            $scope.item.FreeQty = 0;
            $scope.item.UomPrice = 0;
            $scope.item.UomMrPrice = 0;
            $scope.item.Price = 0;
            $scope.item.MrPrice = 0;
            $scope.item.DiscountModeId = -1;
            $scope.item.Discount = 0;
            $scope.item.Id = 0;
            $scope.item.GstDisable = true;

            if ($scope.item.IsMRPRequired)
                $scope.item.IsMRPRequired = true;
        };

        $scope.backToList = function () {
            $scope.confirmCallback();
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

            if ($scope.item.MrPrice === null || $scope.item.MrPrice === "")
                $scope.item.MrPrice = 0;

            $scope.item.ItemMasterId = $scope.currentcontext.ItemMasterId;
            var actionName = 'pharmacy/itemmaster/AddItemVendorMap';
            if ($scope.currentcontext.Id && $scope.currentcontext.Id > 0) {
                actionName = 'pharmacy/itemmaster/UpdateItemVendorMap';
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

        vm.vendorcontrolconfig = {
            query: '',
            searchbyid: false,

            options: [
                { header: 'Vendor Code', field: 'VendorCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Vendor Name', field: 'VendorName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Vendor Contact', field: 'PhoneNumber', datatype: 'string', headercls: 'td-phoneno', fieldcls: 'td-phoneno' }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/vendormaster/GetVendorMasters',
            formatdisplay: formatselectedvendor,
            presearch: presearchvendor,
            postsearch: postsearchvendor
        };

        function formatselectedvendor() {
            var selectedItem = vm.vendorcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = selectedItem.VendorName;
                $scope.item.VendorCode = selectedItem.VendorCode;
                $scope.item.VendorName = selectedItem.VendorName;
            } else if (vm.vendorcontrolconfig.rowdata) {
                result = [vm.vendorcontrolconfig.rowdata.VendorName].join(' ');
            }
            return result;
        }

        function presearchvendor() {
            var query = vm.vendorcontrolconfig.query;
            var inputData = {
                Params: [
                    { Key: 3, Value: 1 },
                    { Key: 4, Value: 2 }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.vendorcontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 2,
                    Value: query
                });
            }

            vm.vendorcontrolconfig.searchparams = inputData;
        }

        function postsearchvendor() {
            for (var idx in vm.vendorcontrolconfig.result) {

                var item = vm.vendorcontrolconfig.result[idx];

                item.VendorCode = item.VendorCode;
                item.VendorName = item.VendorName;
                item.PhoneNumber = item.PhoneNumber;
            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.lookup.VendorMaster = IsProfile ? $scope.lookup.VendorMaster : $scope.lookup.VendorMaster;
            if ($scope.currentcontext.Id > 0) {
                $scope.getVendorMappedItem();
            } else {
                $scope.getMasterItem();
            }
        };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "UomMaster"
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
            {
                "Key": "STATUS"
            },
            {
                "Key": "Rank"
            },
            {
                "Key": "DiscountMode"
            },
            { "Key": "VendorMaster", Request: { Params: [{ Key: 3, Value: 1 }] } }
            ];
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.onVendorSelected = function (selectedItem) {
            if (IsProfile) {
                $scope.item.VendorName = selectedItem.VendorName;
                $scope.item.VendorCode = selectedItem.VendorCode;
            } else {
                $scope.item.VendorName = selectedItem.VendorName;
                $scope.item.VendorCode = selectedItem.VendorCode;
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

    ItemVendorPriceFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();