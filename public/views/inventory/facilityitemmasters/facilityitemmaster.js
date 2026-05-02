(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('facilityitemMasterFormController', facilityitemMasterFormController);

    function facilityitemMasterFormController($scope, $filter, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.lookup = {};
        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            IsActive: true,
            isDisabled: false,
            BaseUomId: 1,
            PurchaseUomId: 1,
            SaleUomId: 1,
            GstId: 1,
            InGstId: 1,
            CGstId: 1,
            SGstId: 1,
            HSNId: 0,
            IsBillable: 0,
            CategoryId: parseInt(utl.Session.getCurrentItemCategoryId()),
            SubCategoryId: parseInt(utl.Session.getCurrentItemSubCategoryId()),
            ProductTypeId: -1,
            SubProductTypeId: -1,
            Category: false,
            SubCategory: false,
            DiscountModeId: 2,
            Discount: 0
        };

        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            if (parseInt(utl.Session.getCurrentItemCategoryId()) > 0) {
                $scope.item.Category = true;
            }
            if (parseInt(utl.Session.getCurrentItemSubCategoryId()) > 0) {
                $scope.item.SubCategory = true;
            }
            $scope.enablecssd();
        };

        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'pharmacy/itemfacilitymap/GetItemFacilityMapById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $state.go('app.facilityitemmasters');
        };

        $scope.backToItemList = function () {
            $state.go('app.itemmasters', {
                filter_itemmasterid: $scope.item.ItemMasterId
            });
        };

        $scope.clear = function () {
            $scope.item = {
                IsActive: true,
                isDisabled: false,
                BaseUomId: 1,
                PurchaseUomId: 1,
                SaleUomId: 1,
                GstId: 1,
                InGstId: 1,
                CGstId: 1,
                SGstId: 1,
                CategoryId: 0,
                SubCategoryId: 0,
                ProductTypeId: 0,
                SubProductTypeId: 0,
                HSNId: 0,
                IsBillable: 0
            };
        };

        $scope.SelectedGst = function (selectedItem) {
            $scope.item.InGstId = 1;
            $scope.item.CGstId = selectedItem.ChildGstId;
            $scope.item.SGstId = selectedItem.ChildGstId;
        };

        $scope.errorItemCallback = function (data, options) {
            if (data.Error && data.Error.Code == 'CODEALREADYEXIST') {
                utl.Alert.showErrorMsg($translate.instant('inventory.itemmasters.codealreadyexist.lbl'));
            } else if (data.Error && data.Error.Code == 'NAMEALREADYEXIST') {
                utl.Alert.showErrorMsg($translate.instant('inventory.itemmasters.namealreadyexist.lbl'));
            } else if (data.Error && data.Error.Code == 'CANNOTINACTIVE') {
                utl.Alert.showErrorMsg($translate.instant('inventory.itemmasters.inactive.lbl'));
            }
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.item.ManufacturerId = 0;
            if (typeof (data) == "boolean") {
                if (options && options.data !== null && options.data.Data !== null) {
                    $scope.currentcontext.id = options.data.Data.Id;
                    $scope.getItem();
                }
            } else if (typeof (data) == "number") {
                $state.go('app.facilityitemmastertab.facilityitemmaster', {
                    id: data,
                    IsProfile: $scope.item.IsProfile,
                    FacilityId: $scope.item.FacilityId,
                    ItemMasterId: $scope.item.ItemMasterId,
                    ItemCode: $scope.item.ItemCode,
                    ItemName: $scope.item.ItemName,
                    GstId: $scope.item.GstId,
                    InGstId: $scope.item.InGstId,
                    CGstId: $scope.item.CGstId,
                    SGstId: $scope.item.SGstId,
                    CategoryId: $scope.item.CategoryId,
                    SubCategoryId: $scope.item.SubCategoryId,
                    ProductTypeId: $scope.item.ProductTypeId,
                    SubProductTypeId: $scope.item.SubProductTypeId,
                    IsBillable: $scope.item.IsBillable
                });
            } else {
                $scope.backToList();
            }
        };

        $scope.save = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'inventory.itemmaster.savemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandDraftConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onSaveandDraftConfirmed = function () {
            $scope.item.ActiveStatusId = 1;
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
            if (!utl.Validator.validate($scope)) {
                return;
            }
            if (parseInt($scope.item.Discount) > 100) {
                utl.Alert.showErrorMsg($translate.instant('inventory.itemmaster.discountalert.lbl'));
                return false;
            }
            $scope.item.HSNId = 0;
            var actionName = 'pharmacy/itemfacilitymap/AddItemFacilityMap';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'pharmacy/itemfacilitymap/UpdateItemFacilityMap';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback,
                onError: $scope.errorItemCallback
            };
            utl.Http.doAction(options);
        };

        vm.drugcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Drug Code', field: 'DrugCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Drug Name', field: 'DrugName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Drug Type', field: 'DrugType', datatype: 'string', headercls: 'td-type', fieldcls: 'td-type' },
                { header: 'Generic Name', field: 'GenericName', datatype: 'string', headercls: 'td-price', fieldcls: 'td-generic' }
            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/DrugMaster/GetDrugMasters',
            formatdisplay: formatselecteddrug,
            presearch: presearchdrug,
            postsearch: postsearchdrug
        };

        function formatselecteddrug() {
            var selectedItem = vm.drugcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.DrugId = selectedItem.Id;
                $scope.item.DrugCode = selectedItem.DrugCode;
                $scope.item.DrugName = selectedItem.DrugName;
                result = [selectedItem.DrugName + ' (' + selectedItem.DrugCode + ')'].join(' ');
            } else if (vm.drugcontrolconfig.rowdata) {
                result = [vm.drugcontrolconfig.rowdata.DrugName, vm.drugcontrolconfig.rowdata.DrugCode].join(' ');
            }
            return result;
        }

        function presearchdrug() {
            var query = vm.drugcontrolconfig.query;
            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.drugcontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: $scope.item.DrugId
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
            }

            vm.drugcontrolconfig.searchparams = inputData;
        }

        function postsearchdrug() {
            for (var idx in vm.drugcontrolconfig.result) {
                var item = vm.drugcontrolconfig.result[idx];

                item.DrugCode = item.DrugCode;
                item.DrugName = item.DrugName;
                item.DrugType = item.DrugType.Description;
                item.GenericName = item.GenericName;
            }
        }

        vm.genericcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Generic Code',
                field: 'Code',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Generic Name',
                field: 'GenericName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            {
                header: 'Allergen Type',
                field: 'AllergenType',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            }
            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/GenericMaster/GetGenericMasters',
            formatdisplay: formatselectedgeneric,
            presearch: presearchgeneric,
            postsearch: postsearchgeneric
        };

        function formatselectedgeneric() {
            var selectedItem = vm.genericcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.GenericId = selectedItem.Id;
                $scope.item.GenericCode = selectedItem.Code;
                $scope.item.GenericName = selectedItem.GenericName;
                $scope.item.ScheduleTypeId = selectedItem.ScheduleTypeId;
                result = [selectedItem.GenericName + '(' + selectedItem.Code + ')'].join('    ');
            } else if (vm.genericcontrolconfig.rowdata) {
                result = [vm.genericcontrolconfig.rowdata.GenericName, vm.genericcontrolconfig.rowdata.GenericCode].join(' ');
            }
            return result;
        }

        function presearchgeneric() {
            var query = vm.genericcontrolconfig.query;
            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };
            if (vm.genericcontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: $scope.item.GenericId
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
            }
            vm.genericcontrolconfig.searchparams = inputData;
        }

        function postsearchgeneric() {
            for (var idx in vm.genericcontrolconfig.result) {
                var item = vm.genericcontrolconfig.result[idx];
                item.Code = item.Code;
                item.GenericName = item.GenericName;
                item.AllergenType = item.AllergenType.Description;
            }
        }

        vm.manufacturercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Manufacturer Code',
                field: 'VendorCode',
                datatype: 'string',
                headercls: 'td-vendorcode',
                fieldcls: 'td-vendorcode'
            },
            {
                header: 'Manufacturer Name',
                field: 'VendorName',
                datatype: 'string',
                headercls: 'td-vendorname',
                fieldcls: 'td-vendorname'
            }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/vendormaster/GetVendorMasters',
            formatdisplay: formatselectedvendor,
            presearch: presearchvendor,
            postsearch: postsearchvendor
        };

        function formatselectedvendor() {
            var selectedItem = vm.manufacturercontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.ManufacturerId = selectedItem.VendorMasterId;
                $scope.item.ManufacturerCode = selectedItem.VendorCode;
                $scope.item.ManufacturerName = selectedItem.VendorName;
                result = [selectedItem.VendorName + '(' + selectedItem.VendorCode + ')'].join('    ');
            } else if (vm.manufacturercontrolconfig.rowdata) {
                result = [vm.manufacturercontrolconfig.rowdata.VendorName, vm.manufacturercontrolconfig.rowdata.VendorCode].join(' ');
            }
            return result;
        }

        function presearchvendor() {
            var query = vm.manufacturercontrolconfig.query;
            var inputData = {
                Params: [{ Key: 3, Value: 2 }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };
            if (vm.manufacturercontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: $scope.item.ManufacturerId
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 2,
                    Value: query
                });
            }
            vm.manufacturercontrolconfig.searchparams = inputData;
        }

        function postsearchvendor() {
            for (var idx in vm.manufacturercontrolconfig.result) {
                var item = vm.manufacturercontrolconfig.result[idx];
                item.VendorCode = item.VendorCode;
                item.VendorName = item.VendorName;
            }
        }

        vm.hsncontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'HSN No',
                field: 'HSNCode',
                datatype: 'string',
                headercls: 'td-hsncode',
                fieldcls: 'td-hsncode'
            },
            {
                header: 'Product Name',
                field: 'HSNName',
                datatype: 'string',
                headercls: 'td-hsnname',
                fieldcls: 'td-hsnname'
            },
            {
                header: 'GST(%)',
                field: 'GstPercentage',
                datatype: 'string',
                headercls: 'td-gstpercentage',
                fieldcls: 'td-gstpercentage'
            },
            {
                header: 'CGST(%)',
                field: 'CGstPercentage',
                datatype: 'string',
                headercls: 'td-cgstpercentage',
                fieldcls: 'td-cgstpercentage'
            },
            {
                header: 'SGST(%)',
                field: 'SGstPercentage',
                datatype: 'string',
                headercls: 'td-sgstpercentage',
                fieldcls: 'td-sgstpercentage'
            }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/hsnmaster/GetHsnMasters',
            formatdisplay: formatselectedhsn,
            presearch: presearchhsn,
            postsearch: postsearchhsn
        };

        function formatselectedhsn() {
            var selectedItem = vm.hsncontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                //$scope.item.HSNId = selectedItem.Id;
                //$scope.item.HSNCode = selectedItem.HSNCode;
                //$scope.item.HSNName = selectedItem.HSNName;
                $scope.item.ProductRegNo = selectedItem.HSNCode;
                $scope.item.GstId = selectedItem.GstId;
                $scope.item.InGstId = selectedItem.InGstId;
                $scope.item.CGstId = selectedItem.CGstId;
                $scope.item.SGstId = selectedItem.SGstId;

                result = [selectedItem.HSNName + '(' + selectedItem.HSNCode + ')'].join('    ');
            } else if (vm.hsncontrolconfig.rowdata) {
                result = [vm.hsncontrolconfig.rowdata.HSNName, vm.hsncontrolconfig.rowdata.HSNCode].join(' ');
            }
            return result;
        }

        function presearchhsn() {
            var query = vm.hsncontrolconfig.query;
            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };
            if (vm.hsncontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: $scope.item.HSNId
                });
            } else if (query && query.length > 3) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
            }
            vm.hsncontrolconfig.searchparams = inputData;
        }

        function postsearchhsn() {
            for (var idx in vm.hsncontrolconfig.result) {
                var item = vm.hsncontrolconfig.result[idx];
                item.HSNCode = item.HSNCode;
                item.HSNName = item.HSNName;
                item.GstPercentage = item.GstPercentage;
                item.CGstPercentage = item.CGstPercentage;
                item.SGstPercentage = item.SGstPercentage;
            }
        }

        $scope.enablecssd = function () {
            if ($scope.item.IsCssd)
                $scope.$parent.Iscssd = true;
            else
                $scope.$parent.Iscssd = false;
        };

        $scope.moveHeaderFocus = function (nextId) {
            if (event.keyCode == 13) {
                if (nextId == "codeid") {
                    nextId = "nameid";
                    $('#' + nextId).focus();
                }
                else if (nextId == "nameid") {
                    var dom = document.getElementById('categoryid');
                    $scope.setCmbFocus(dom);
                }
                else if (nextId == "categoryid") {
                    var dom = document.getElementById('subcategoryid');
                    $scope.setCmbFocus(dom);
                }
                else if (nextId == "subcategoryid") {
                    var dom = document.getElementById('producttypeid');
                    $scope.setCmbFocus(dom);
                }
                else if (nextId == "producttypeid") {
                    var dom = document.getElementById('productsubtypeid');
                    $scope.setCmbFocus(dom);
                }
                else if (nextId == "productsubtypeid") {
                    var dom = document.getElementById('baseuomid');
                    $scope.setCmbFocus(dom);
                }
                else if (nextId == "baseuomid") {
                    var dom = document.getElementById('purchaseuomid');
                    $scope.setCmbFocus(dom);
                }
                else if (nextId == "purchaseuomid") {
                    var dom = document.getElementById('salesuomid');
                    $scope.setCmbFocus(dom);
                }
                else if (nextId == "salesuomid") {
                    var dom = document.getElementById('gstid');
                    $scope.setCmbFocus(dom);
                }
                else if (nextId == "gstid") {
                    var dom = document.getElementById('intersgstid');
                    $scope.setCmbFocus(dom);
                }
                else if (nextId == "intersgstid") {
                    var dom = document.getElementById('sgstid');
                    $scope.setCmbFocus(dom);
                }
                else if (nextId == "sgstid") {
                    var dom = document.getElementById('cgstid');
                    $scope.setCmbFocus(dom);
                }
                else {
                    nextId = "saveAndApproveid";
                    $('#' + nextId).focus();
                }

            }
        };

        $scope.setCmbFocus = function (dom) {
            $timeout(function () {
                var uiSelect = angular.element(dom);
                var uichild = uiSelect.controller('uiSelect');
                uichild.activate();
                uichild.close();
            }, 100);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'ItemCategory') {
                    if ($scope.item.CategoryId > 0) {
                        $scope.item.Category = true;
                        if ($scope.item.SubCategoryId <= 0) {
                            $scope.getSubCategory();
                            $scope.item.SubCategory = false;
                        }
                    } else {
                        $scope.item.CategoryId = -1;
                    }
                }

                if (key == 'ItemSubCategory') {
                    if ($scope.item.SubCategoryId > 0) {
                        $scope.item.SubCategory = true;
                        $scope.getProductType();
                    } else {
                        $scope.item.SubCategoryId = -1;
                    }
                }
            });

            $scope.getItem();

            if ($scope.item.Activefrom === null)
                $scope.item.Activefrom = new Date();
        };

        $scope.lookupCallbackOnSelect = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
            });
        };

        $scope.initLookup = function () {
            var inputData = [
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
                { "Key": "ScheduleType" },
                { "Key": "DiscountMode" },
                { "Key": "STORAGECONDITION" },
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

        $scope.getLookUpOnSelect = function (inputData) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallbackOnSelect
            };
            utl.Http.doAction(options);
        };

        $scope.getSubCategory = function () {
            $scope.item.SubCategoryId = -1;
            if ($scope.item.CategoryId == 1) {
                $scope.item.IsBillable = true;
            } else {
                $scope.item.IsBillable = false;
            }
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
                    { Key: 5, Value: $scope.item.CategoryId || -1 }
                    ]
                }
            }];
            $scope.getLookUpOnSelect(inputData);
        };

        $scope.getProductType = function () {
            $scope.item.ProductTypeId = -1;
            var inputData = [
                // {
                //     "Key": "ProductType",
                //     Request: {
                //         Params: [
                //             { Key: 6, Value: $scope.item.SubCategoryId || -1 }
                //         ]
                //     }
                // },
                {
                    "Key": "ProductType",
                    Request: {
                        Params: [{
                            Key: 3,
                            Value: 2
                        }, {
                            Key: 4,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        },
                        { Key: 6, Value: $scope.item.SubCategoryId || -1 }]
                    }
                },];
            $scope.getLookUpOnSelect(inputData);
        };

        $scope.getProductSubType = function () {
            $scope.item.SubProductTypeId = -1;
            var inputData = [{
                "Key": "ProductSubType",
                Request: {
                    Params: [
                        {
                            Key: 3,
                            Value: 2
                        }, {
                            Key: 6,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        },
                        { Key: 5, Value: $scope.item.ProductTypeId || -1 }
                    ]
                }
            }];
            $scope.getLookUpOnSelect(inputData);
        };

        $scope.fillGenericInfo = function () {
            $scope.item.GenericId = $scope.item.SelectedItem.GenericId;
        };

        $scope.initLookup();
    }

    facilityitemMasterFormController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();