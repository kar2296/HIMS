(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ManageExpiryNonMovementController', ManageExpiryNonMovementController);

    function ManageExpiryNonMovementController($rootScope, $scope, $stateParams, $state, $translate, utl, $filter, $timeout) {
        var vm = this;

        $scope.item = {};
        $scope.currentfilter = {
            ProductTypeId: -1,
            StockReturnTypeId: 1,
            StoreMasterId: 0,
            StoreTypeId: -1,
            VendorMasterId: -1,
            ItemMasterId: -1,
            FacilityId: utl.Session.getCurrentFacilityId()
        };

        $scope.lookup = {};
        $scope.currentcontext = {
            id: -1
        };
        $scope.PurchaseReturnDetails = [];
        $scope.addNewLineItem = function () {
            var serialitem = {
                Id: 0,
                StockSerialItemId: 0,
                StockItemId: 0,
                ItemMasterId: 0,
                ItemName: null,
                BatchId: null,
                ExpiryDate: null,
                Quantity: 0,
                Ucp: 0.00,
                Mrp: 0.00,
                StoreMasterId: 0,
                VendorMasterId: 0,

            };
            $scope.PurchaseReturnDetails.push(serialitem);
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.addNew = function () {
            if ($stateParams.id > 0)
                $state.go('app.expiryandnonmovements', {
                    id: 0
                });
            else
                $state.reload();
        };

        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            // var fromDate = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00'); //"2017-04-27 00:00:00"
            // var toDate = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentfilter.ItemMasterId
                    },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.StoreMasterId
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.FacilityId
                    },
                    // { Key: 6, Value: [fromDate, toDate] },
                    {
                        Key: 7,
                        Value: utl.Formatter.getFilterDate(From)
                    },
                    {
                        Key: 8,
                        Value: utl.Formatter.getFilterDate(To)
                    },
                    {
                        Key: 9,
                        Value: $scope.currentfilter.VendorMasterId
                    },
                    {
                        Key: 10,
                        Value: $scope.currentfilter.ProductTypeId
                    },
                    {
                        Key: 11,
                        Value: 1
                    }
                ],
                PageContext: {
                    PageSize: 10000,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'pharmacy/stockserialitem/GetExpiredSerialItems',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.PurchaseReturnDetails = res.Data || [];
            for (var idx in $scope.PurchaseReturnDetails) {
                var serialitem = null;
                if ($scope.PurchaseReturnDetails[idx].Quantity > 0) {
                    serialitem = $scope.PurchaseReturnDetails[idx];
                    if (serialitem.ItemMasterId > 0) {
                        serialitem.StockSerialItemId = serialitem.Id;
                        serialitem.StockItemId = serialitem.StockItemId;
                        serialitem.ItemMasterId = serialitem.ItemMasterId;
                        serialitem.VendorMasterId = serialitem.VendorMasterId;
                        serialitem.StoreMasterId = serialitem.StoreMasterId;
                        serialitem.BarCodeId = serialitem.BarCodeId;
                        serialitem.ItemCode = serialitem.ItemCode;
                        serialitem.ItemName = serialitem.ItemName;
                        serialitem.BatchId = serialitem.BatchId;
                        serialitem.ExpiryDate = serialitem.ExpiryDate;
                        serialitem.Quantity = serialitem.Quantity;
                        serialitem.PrnQuantity = serialitem.Quantity;
                        serialitem.ReturnQty = serialitem.Quantity;
                        serialitem.TotalQuantity = serialitem.Quantity;
                        serialitem.TotalQuantity = serialitem.Quantity;
                        serialitem.PurchaseUomId = serialitem.PurchaseUomId;
                        serialitem.BaseUomId = serialitem.BaseUomId;
                        serialitem.SaleUomId = serialitem.SaleUomId;
                        serialitem.ConversionQuantity = serialitem.ConversionQuantity;
                        serialitem.UomPrice = serialitem.UomPrice;
                        serialitem.PurchasePrice = serialitem.PurchasePrice;
                        serialitem.Ucp = serialitem.Ucp;
                        serialitem.Mrp = serialitem.Mrp;
                        serialitem.UnitCostPrice = serialitem.Ucp;
                        serialitem.MrPrice = serialitem.Mrp;
                        serialitem.GrossAmount = serialitem.Quantity * serialitem.Ucp;
                        serialitem.NetAmount = serialitem.Quantity * serialitem.Ucp;
                        serialitem.Id = 0;
                        serialitem.Status = 1;
                        serialitem.ReturnReasonId = -1;
                        serialitem.IsReadOnly = false;
                        if (serialitem.ItemMaster) {
                            if (serialitem.ItemMaster.ProductType) {
                                serialitem.ProductTypeName = serialitem.ItemMaster.ProductType.ProductTypeName;
                            }
                        } else {
                            serialitem.ProductTypeName = '';
                        }
                        if (serialitem.VendorMaster) {
                            serialitem.VendorName = serialitem.VendorMaster.VendorName;
                        } else {
                            serialitem.VendorName = '';
                        }

                    }
                }
            }

            $scope.data = $scope.PurchaseReturnDetails || [];
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: []
        };

        vm.gridConfig.columnDefs.push({
            field: "ItemCode",
            displayName: $translate.instant('inventory.updateexpiryprice.itemcode.lbl')
        }, {
            field: "ItemName",
            displayName: $translate.instant('inventory.updateexpiryprice.itemname.lbl')
        }, {
            field: "ProductTypeName",
            displayName: $translate.instant('inventory.updateexpiryprice.producttype.lbl')
        }, {
            field: "BatchId",
            displayName: $translate.instant('inventory.updateexpiryprice.batchid.lbl')
        }, {
            field: "ExpiryDate",
            displayName: $translate.instant('inventory.updateexpiryprice.expirydate.lbl'),
            cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.ExpiryDate | date : 'dd-MMM-yyyy'}} </span>" + "</div>"
        }, {
            field: "Quantity",
            displayName: $translate.instant('inventory.updateexpiryprice.quantity.lbl')
        }, {
            field: "VendorName",
            displayName: $translate.instant('inventory.updateexpiryprice.vendorname.lbl')
        });

        vm.gridConfig.enableRowSelection = true;
        vm.gridConfig.multiSelect = true;
        vm.gridConfig.enableFullRowSelection = true;
        vm.gridConfig.onRegisterApi = function (gridApi) {
            $scope.gridApi = gridApi;
        };

        $scope.Return = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'inventory.updateexpiryprice.confirmreturnmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onReturnConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.StoreChange = function (SelectedStore) {
            $scope.currentfilter.StoreTypeId = SelectedStore.StoreMaster.StoreTypeId;
            if ($scope.PurchaseReturnDetails.length > 1)
                $scope.clear();
        };

        $scope.clear = function () {
            $state.reload();
        };

        $scope.onReturnConfirmed = function () {
            $scope.item.PrnTypeId = 1;
            $scope.item.ReturnTypeId = 2;
            $scope.item.PrnStatusId = 1;
            $scope.item.ReturnReasonId = -1;
            $scope.item.Status = 1;
            $scope.item.VendorMasterId = $scope.currentfilter.VendorMasterId;
            $scope.item.StoreMasterId = $scope.currentfilter.StoreMasterId;
            $scope.item.StoreTypeId = $scope.currentfilter.StoreTypeId;
            $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
            $scope.TotalGrossAmount = 0;
            $scope.TotalNetAmount = 0;
            for (var idx in $scope.PurchaseReturnDetails) {
                if ($scope.PurchaseReturnDetails[idx].Status == 1) {
                    if ($scope.PurchaseReturnDetails[idx].GrossAmount) {
                        $scope.TotalGrossAmount = parseFloat(($scope.TotalGrossAmount + $scope.PurchaseReturnDetails[idx].GrossAmount).toFixed(2));
                    }
                    if ($scope.PurchaseReturnDetails[idx].NetAmount) {
                        $scope.TotalNetAmount = parseFloat(($scope.TotalNetAmount + $scope.PurchaseReturnDetails[idx].NetAmount).toFixed(2));
                    }
                }
            }
            $scope.item.TotalGrossAmount = $scope.TotalGrossAmount;
            $scope.item.TotalNetAmount = $scope.TotalNetAmount;
            $scope.item.ReturnedBy = utl.Session.getCurrentUserId();
            $scope.item.ReturnedDate = utl.Formatter.getCurrentDate();
            $scope.item.PrnDate = utl.Formatter.getCurrentDate();
            $scope.saveReturn();
        };

        $scope.saveReturn = function () {
            //var lines = getLinesForSave();
            // var lines = getSelectionRows();
            $scope.item.Details = $scope.getSelectionRows();
            if ($scope.SelectedRows.length > 0) {
                var Details = $scope.SelectedRows;
            } else {
                utl.Alert.showErrorMsg('Please Select Any Item');
            }
            var lines = $scope.SelectedRows;
            $scope.item.Details = [];
            $scope.TotalGrossAmount = 0;
            $scope.TotalNetAmount = 0;
            for (var idx in lines) {
                $scope.BatchId = lines[idx].BatchId;
                if (lines[idx].Status == 1) {
                    $scope.TotalGrossAmount = parseFloat(($scope.TotalGrossAmount + lines[idx].GrossAmount).toFixed(2));
                    $scope.TotalNetAmount = parseFloat(($scope.TotalNetAmount + lines[idx].NetAmount).toFixed(2));
                }
            }
            $scope.item.TotalGrossAmount = $scope.TotalGrossAmount;
            $scope.item.TotalNetAmount = $scope.TotalNetAmount;

            var actionName = 'pharmacy/PurchaseReturn/AddPurchaseReturn';

            var inputData = {
                Header: $scope.item,
                Details: lines
            };
            var options = {
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getSelectionRows = function () {
            $scope.SelectedRows = [];
            for (var idx in $scope.PurchaseReturnDetails) {
                var item = $scope.PurchaseReturnDetails[idx];
                if (item.IsSelected == true) {
                    $scope.SelectedRows.push(item);
                }
            }
        }

        $scope.selectAllItems = function () {
            for (var idx in $scope.PurchaseReturnDetails) {
                var item = $scope.PurchaseReturnDetails[idx];
                if (!item.IsReadOnly) {
                    item.IsSelected = $scope.currentcontext.selectall;
                    item.IsAllSelected = $scope.currentcontext.selectall;
                }
            }
        }

        $scope.IsAllSelectedChange = function (list, item) {
            for (var idx1 in list) {
                var detail = list[idx1];
                if (detail.IsAllSelected && !detail.IsReadOnly) {
                    detail.IsSelected = true;
                } else if (!item.IsAllSelected && !detail.IsReadOnly) {
                    detail.IsSelected = false;
                }
            }
        }


        function getLinesForSave() {
            var result = [];
            for (var idx in $scope.PurchaseReturnDetails) {
                var item = $scope.PurchaseReturnDetails[idx];
                item.VendorMasterId = $scope.currentfilter.VendorMasterId;
                if (item.ItemMasterId > 0) {
                    result.push(item);
                }
            }
            return result;
        }

        // function getSelectionRows() {
        //     var currentSelection = $scope.gridApi.selection.getSelectedRows();
        //     return currentSelection;
        // }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            if ($scope.currentcontext.id <= 0)
                $scope.currentcontext.id = data;

            $state.go('app.purchasereturn', {
                id: data,
                prnid: data
            });

            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        };

        vm.vendorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Supplier Code',
                    field: 'VendorCode',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Supplier Name',
                    field: 'VendorName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
                {
                    header: 'Supplier Contact',
                    field: 'PhoneNumber',
                    datatype: 'string',
                    headercls: 'td-phoneno',
                    fieldcls: 'td-phoneno'
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
            var selectedItem = vm.vendorcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.VendorName = selectedItem.VendorName;
                result = [selectedItem.VendorName + ' (' + selectedItem.VendorCode + ')'].join(' ');
            } else if (vm.vendorcontrolconfig.rowdata) {
                result = [vm.vendorcontrolconfig.rowdata.VendorName, vm.vendorcontrolconfig.rowdata.VendorCode].join(' ');
            }
            return result;
        }

        function presearchvendor() {
            var query = vm.vendorcontrolconfig.query;

            var inputData = {
                Params: [{
                    Key: 3,
                    Value: 1
                }],
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

        vm.stockitemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Item Code',
                    field: 'ItemCode',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Item Name',
                    field: 'ItemName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
                {
                    header: 'Product Name',
                    field: 'ProductTypeName',
                    datatype: 'string',
                    headercls: 'td-producttypename',
                    fieldcls: 'td-producttypename'
                },
                {
                    header: 'Generic',
                    field: 'GenericName',
                    datatype: 'string',
                    headercls: 'td-genericname',
                    fieldcls: 'td-genericname'
                },
                {
                    header: 'Manufacturer',
                    field: 'ManufacturerName',
                    datatype: 'string',
                    headercls: 'td-manufacturername',
                    fieldcls: 'td-manufacturername'
                }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/itemmaster/GetItemMasters',
            formatdisplay: formatselectedstockitem,
            presearch: presearchstockitem,
            postsearch: postsearchstockitem
        };

        function formatselectedstockitem() {
            var selectedItem = vm.stockitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ItemName + ' (' + selectedItem.ItemCode + ')'].join(' ');
            } else if (vm.stockitemcontrolconfig.rowdata) {
                result = [vm.stockitemcontrolconfig.rowdata.ItemCode, vm.stockitemcontrolconfig.rowdata.ItemName].join(' ');
            }
            return result;
        }

        function presearchstockitem() {
            var query = vm.stockitemcontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: 2
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.stockitemcontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
            }

            vm.stockitemcontrolconfig.searchparams = inputData;
        }

        function postsearchstockitem() {
            for (var idx in vm.stockitemcontrolconfig.result) {
                var item = vm.stockitemcontrolconfig.result[idx];
                item.ItemCode = item.ItemCode;
                item.ItemName = item.ItemName;
                if (item.ProductType !== null) {
                    item.ProductTypeName = item.ProductType.ProductTypeName;
                } else {
                    item.ProductTypeName = '';
                }
                if (item.GenericMaster !== null) {
                    item.GenericName = item.GenericMaster.GenericName;
                } else {
                    item.GenericName = '';
                }
                if (item.VendorMaster !== null) {
                    item.ManufacturerName = item.VendorMaster.VendorName;
                } else {
                    item.ManufacturerName = '';
                }
            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores') {
                    $scope.currentfilter.StoreMasterId = value[0].Id;
                    $scope.currentfilter.StoreTypeId = value[0].StoreMaster.StoreTypeId;
                }
            });
        };

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "StockReturnType"
                },
                {
                    "Key": "Facility"
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
                        }, ]
                    }
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

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };

            utl.Http.doAction(options);
        };

        $scope.initLookup();
    }

    ManageExpiryNonMovementController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$timeout'];

})();