(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('StocktransferViewController', StocktransferViewController);

    function StocktransferViewController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        $scope.tabindexmap = {
            patienttabindex: 1,
            detailtabindex: 2
        };

        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            ToFacilityId: 0,
            StoreMasterId: 0,
            TransferTypeId: 3,
            ItemCategoryId: 1,
            TransferSubTypeId: 0,
            TransferStatusId: 0,
            RequestStatusId: 0,
            ToStoreMasterId: -1,
            TotalGrossAmount: 0,
            TotalNetAmount: 0,
            Comments: null,
            isDisabled: false,
            TransferNumber: null,
            RequestNumber: null,
            StockRequestId: 0,
            RequestedBy: 0,
            RequestedDate: null,
            DisplayTransferStatus: null,
            ReadOnly: true
        };
        $scope.item.WithHeader = true;
        $scope.item.WithoutHeader = false;

        $scope.lookup = {};
        $scope.currentcontext = {
            id: -1,
            stockrequestid: -1,
            stocktransferid: -1,
            transferstatusid: -1,
        };

        $scope.openAttachments = function() {
            utl.Modal.open('app.transferattachments', {
                params: { stocktransferid: 0, itemmasterid: 0 },
                confirmCallback: $scope.initLookup,
                cancelCallback: $scope.initLookup
            });
        };

        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.stockrequestid = $state.params.StockRequestId;
        $scope.currentcontext.stocktransferid = $state.params.StockTransferId;
        $scope.currentcontext.transferstatusid = $state.params.TransferStatusId;
        $scope.item.TransferDate = utl.Formatter.getCurrentDate();
        $scope.stocktransferDetails = [];

        $scope.canShowPrintBtn = true;

        $scope.addNewLineItem = function() {
            var stocktransferDetail = {
                Id: 0,
                SNo: 0,
                StockRequestDetailId: 0,
                ItemMasterId: 0,
                ItemCode: '',
                ItemName: '',
                BaseUom: { Id: 0, UomCode: '' },
                BaseUomId: 0,
                PurchaseUomId: 0,
                RequestedQuantity: 0,
                IssuedQuantity: 0,
                TransferedQuantity: 0,
                TransitQuantity: 0,
                QuantityBeforeTransfer: 0,
                TotalAvailableQuantity: 0,
                BatchQuantity: 0,
                PurchasePrice: 0,
                GstMaster: { Id: 0, GstCode: '', GstName: '', GstPercentage: '' },
                GstId: 0,
                GstPercentage: 0,
                UnitGstAmount: 0,
                GstAmount: 0,
                InGstMaster: { Id: 0, GstCode: '', GstName: '', GstPercentage: '' },
                InGstId: 0,
                InGstPercentage: 0,
                InUnitGstAmount: 0,
                InGstAmount: 0,
                CGstMaster: { Id: 0, GstCode: '', GstName: '', GstPercentage: '' },
                CGstId: 0,
                CGstPercentage: 0,
                CUnitGstAmount: 0,
                CGstAmount: 0,
                SGstMaster: { Id: 0, GstCode: '', GstName: '', GstPercentage: '' },
                SGstId: 0,
                SGstPercentage: 0,
                SUnitGstAmount: 0,
                SGstAmount: 0,
                UnitCostPrice: 0,
                MrPrice: 0,
                GrossAmount: 0.00,
                NetAmount: 0.00,
                Status: 1,
                BatchDetails: [],
                BatchDetail: { Id: 0, StockItemId: 0, ItemMasterId: 0, StoreMasterId: 0, BatchId: '', Quantity: 0, ExpiryDate: null, Ucp: 0, Mrp: 0, SerialDetails: null },
                StockSerialItemId: 0,
                StockItemId: 0,
                BatchId: '',
                Quantity: 0,
                ExpiryDate: '',
                HaveExpiry: false,
                HaveNoExpiry: false,
                Ucp: 0,
                Mrp: 0,
                tabindex: $scope.tabindexmap.detailtabindex++
            };

            if ($scope.currentcontext.id > 0) {
                stocktransferDetail.StockTransferId = $scope.currentcontext.id;
            }
            $scope.stocktransferDetails.push(stocktransferDetail);
            $scope.setIndexforTableIndex();
        };

        vm.stocktransferitemcontrolconfig = {
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
                /* { header: 'Product Name', field: 'ProductTypeName', datatype: 'string', headercls: 'td-producttypename', fieldcls: 'td-producttypename' }, */
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
                },
                {
                    header: 'My Store Qty',
                    field: 'MyStoreQty',
                    datatype: 'string',
                    headercls: 'td-mystoreqty',
                    fieldcls: 'td-mystoreqty'
                },
                {
                    header: 'To Store Qty',
                    field: 'ToStoreQty',
                    datatype: 'string',
                    headercls: 'td-tostoreqty',
                    fieldcls: 'td-tostoreqty'
                }
            ],
            searchparams: {},
            result: {},
            //api: 'pharmacy/itemmaster/GetStoreItemMaps',
            api: 'pharmacy/itemmaster/GetItemsForStockTransfer',
            formatdisplay: formatselectedstocktransferitem,
            presearch: presearchstocktransferitem,
            postsearch: postsearchstocktransferitem
        };

        function formatselectedstocktransferitem() {
            $scope.autosearchpopup = 0;
            var selectedItem = vm.stocktransferitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ItemName, '(' + selectedItem.ItemCode + ')'].join(' ');
            } else if (vm.stocktransferitemcontrolconfig.rowdata) {
                result = [vm.stocktransferitemcontrolconfig.rowdata.ItemName, vm.stocktransferitemcontrolconfig.rowdata.ItemCode].join(' ');
            }
            return result;
        }

        function presearchstocktransferitem() {
            var query = vm.stocktransferitemcontrolconfig.query;
            var inputData = {
                Params: [
                    /*
                    { Key: 1, Value: $scope.item.StoreMasterId },
                    { Key: 4, Value: 1 },
                    { Key: 8, Value: $scope.item.StoreTypeId },
                    { Key: 11, Value: $scope.item.ToStoreMasterId },
                    { Key: 13, Value: 2 }
                    */
                    {
                        Key: 23,
                        Value: $scope.item.ToStoreMasterId
                    },
                    {
                        Key: 11,
                        Value: $scope.item.StoreMasterId
                    },
                    // {
                    //     Key: 7,
                    //     Value: $scope.item.ItemCategoryId
                    // },
                    {
                        Key: 3,
                        Value: 2
                    }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.stocktransferitemcontrolconfig.searchbyid === true) {
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

            vm.stocktransferitemcontrolconfig.searchparams = inputData;
        }

        function postsearchstocktransferitem() {
            $scope.autosearchpopup = 1;
            for (var idx in vm.stocktransferitemcontrolconfig.result) {
                var item = vm.stocktransferitemcontrolconfig.result[idx];
                item.ItemCode = '(' + item.ItemCode + ')';
                item.ItemName = item.ItemName;
                item.GenericName = item.GenericName;
                item.ManufacturerName = item.ManufacturerName;
                /*
                if (item.StockItem !== null) {
                    item.MyStoreQty = item.StockItem.Quantity;
                } else {
                    item.MyStoreQty = 0;
                }
                */
                var batchitems = null;
                var batchitem = [];
                var batchid = 0;
                if (item.StockItem && item.StockItem.StockSerialItems.length > 0) {
                    var SumOfSerialQuantity = 0;
                    batchitems = item.StockItem.StockSerialItems;
                    for (batchid = 0; batchid < batchitems.length; batchid++) {
                        batchitem = batchitems[batchid];
                        if (batchitem.Quantity > 0) {
                            if (item.IsExpiryMandatory) {
                                // if (batchitem.ExpiryDate > utl.Formatter.getCurrentDate())
                                if (utl.Formatter.isFutureDate(batchitem.ExpiryDate))
                                    SumOfSerialQuantity = SumOfSerialQuantity + batchitem.Quantity;
                            } else {
                                SumOfSerialQuantity = SumOfSerialQuantity + batchitem.Quantity;
                            }

                        }
                    }
                    item.MyStoreQty = SumOfSerialQuantity;
                } else {
                    item.MyStoreQty = 0;
                }
                if (item.ToStoreStock !== null) {
                    item.ToStoreQty = item.ToStoreStock.Quantity;
                } else {
                    item.ToStoreQty = 0;
                }
            }
        }


        $scope.Clear = function() {
            $scope.stocktransferDetails = [];
            $scope.addNewLineItem();
        };

        $scope.print = function() {
            var inputData = {
                Id: $scope.currentcontext.stocktransferid,
                Data: {
                    isprint: false,
                    withHeader: $scope.item.WithHeader,
                    withoutHeader: $scope.item.WithoutHeader,
                }
            };
            var options = {
                action: 'pharmacy/StockTransfer/PrintStockTransfer',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.history = function(HistoryId) {
            utl.Modal.open('app.transferhistory', {});
        };

        $scope.History = function(item, idx) {
            utl.Modal.open('app.stocktransferhistory', {
                params: {
                    storemasterid: $scope.item.StoreMasterId,
                    itemmasterid: item.ItemMasterId,
                    itemcode: item.ItemCode,
                    itemname: item.ItemName,
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.Stock = function(selectedItem, idx) {
            utl.Modal.open('app.stockdetails', {
                params: { itemmasterid: selectedItem.ItemMasterId, itemcode: selectedItem.ItemCode, itemname: selectedItem.ItemName },
                confirmCallback: $scope.getList
            });
        };

        $scope.getStockTransferDetailsCallback = function(scope, res, options, hasError) {
            $scope.stocktransferDetails = res.Data || [];
            for (var idx in $scope.stocktransferDetails) {
                var transferitem = $scope.stocktransferDetails[idx];
                if (transferitem.ItemMasterId > 0) {
                    if (transferitem.ExpiryDate === null) {
                        transferitem.HaveNoExpiry = true;
                        transferitem.ExpiryDate = '';
                    } else {
                        transferitem.HaveExpiry = true;
                    }
                    if (transferitem.StockItem) {
                        transferitem.TotalAvailableQuantity = transferitem.StockItem.Quantity;
                    } else {
                        transferitem.TotalAvailableQuantity = 0;
                    }
                    if (transferitem.StockSerialItem) {
                        transferitem.QuantityBeforeTransfer = transferitem.StockSerialItem.Quantity;
                    } else {
                        transferitem.QuantityBeforeTransfer = 0;
                    }
                    if (transferitem.StockSerialItem) {
                        transferitem.BatchQuantity = transferitem.StockSerialItem.Quantity;
                    } else {
                        transferitem.BatchQuantity = 0;
                    }
                }
            }
            $scope.TotalGrossAmount = 0;
            $scope.TotalNetAmount = 0;
            calculatetotalAmount();
            $scope.setIndexforTableIndex();
        };

        $scope.getStockTransferDetails = function(pageNo) {
            if ($scope.currentcontext.stocktransferid && $scope.currentcontext.stocktransferid > 0) {
                var inputData = {
                    Params: [
                        { Key: 1, Value: $scope.currentcontext.stocktransferid }
                    ],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };

                var options = {
                    action: 'pharmacy/stocktransferdetail/GetStockTransferDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getStockTransferDetailsCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.setIndexforTableIndex = function() {
            var SNo = 1;
            for (var idx in $scope.stocktransferDetails) {
                if ($scope.stocktransferDetails[idx].Status == 1) {
                    if ($scope.stocktransferDetails[idx].Status == 1) {
                        $scope.stocktransferDetails[idx].SNo = SNo;
                        $scope.stocktransferDetails[idx].itemidxdesc = 'desc' + (SNo - 1);
                        $scope.stocktransferDetails[idx].itemidxqty = 'qty' + (SNo - 1);
                        SNo++;
                    }
                }
            }
        };
        $scope.getStockTransferCallback = function(scope, data, options, hasError) {
            $scope.item = data;
            if (data.TransferStatusId == 1) {
                $scope.item.ReadOnly = true;
                $scope.item.isDisabled = false;
                $scope.item.DisplayTransferStatus = 'Draft';
            }
            if (data.TransferStatusId == 2) {
                $scope.item.ReadOnly = true;
                $scope.item.isDisabled = true;
                $scope.item.DisplayTransferStatus = 'Transfered';
            }
            if (data.TransferStatusId == 3) {
                $scope.item.ReadOnly = true;
                $scope.item.isDisabled = true;
                $scope.item.DisplayTransferStatus = 'Authorized';
            }
            if (data.TransferStatusId == 4) {
                $scope.item.ReadOnly = true;
                $scope.item.isDisabled = true;
                $scope.item.DisplayTransferStatus = 'Received';
            }
            if (data.TransferStatusId == 5) {
                $scope.item.ReadOnly = true;
                $scope.item.isDisabled = true;
                $scope.item.DisplayTransferStatus = 'Rejected';
            }
        };

        $scope.getStockTransferById = function() {
            if ($scope.item.StockTransferId && $scope.item.StockTransferId > 0) {
                var options = {
                    action: 'pharmacy/stocktransfer/GetStockTransferById',
                    data: {
                        Id: $scope.currentcontext.stocktransferid
                    },
                    type: 'post',
                    onComplete: $scope.getStockTransferCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getStockTransfer = function() {
            $scope.item.StockTransferId = $scope.currentcontext.stocktransferid;
            $scope.getStockTransferById();
            $scope.getStockTransferDetails();
        };


        $scope.computeAmount = function(item) {
            if (item.TransferedQuantity === null) {
                item.GrossAmount = item.UnitCostPrice * 0;
                item.NetAmount = item.UnitCostPrice * 0;

                utl.Alert.showErrorMsg($translate.instant('inventory.stocktransferform.qtynotemptymsg.lbl'));
                return false;
            } else if (item.TransferedQuantity === 0) {
                item.GrossAmount = item.UnitCostPrice * 0;
                item.NetAmount = item.UnitCostPrice * 0;
            } else {
                if (item.TransferedQuantity > item.QuantityBeforeTransfer) {
                    item.TransferedQuantity = 0;
                    utl.Alert.showErrorMsg($translate.instant('inventory.stocktransferform.enterqtygreateravailablemsg.lbl'));
                    return false;
                } else if (item.TransferedQuantity > (item.RequestedQuantity - item.IssuedQuantity)) {
                    item.TransferedQuantity = 0;
                    utl.Alert.showErrorMsg($translate.instant('inventory.stocktransferform.enterqtygreaterreqqty.lbl'));
                    return false;
                } else {
                    item.GrossAmount = item.UnitCostPrice * item.TransferedQuantity;
                    item.NetAmount = item.UnitCostPrice * item.TransferedQuantity;
                    item.TransitQuantity = item.TransferedQuantity;
                }
            }

            $scope.TotalGrossAmount = 0;
            $scope.TotalNetAmount = 0;

            calculatetotalAmount();
        };

        function calculatetotalAmount() {
            for (var idx in $scope.stocktransferDetails) {
                if ($scope.TotalGrossAmount === null) {
                    $scope.TotalGrossAmount = 0;
                }
                $scope.TotalGrossAmount = parseFloat(($scope.TotalGrossAmount + $scope.stocktransferDetails[idx].GrossAmount).toFixed(2));

                if ($scope.TotalNetAmount === null) {
                    $scope.TotalNetAmount = 0;
                }
                $scope.TotalNetAmount = parseFloat(($scope.TotalNetAmount + $scope.stocktransferDetails[idx].NetAmount).toFixed(2));
            }

            $scope.item.TotalGrossAmount = $scope.TotalGrossAmount;
            $scope.item.TotalNetAmount = $scope.TotalNetAmount;
        }

        $scope.backToList = function() {
            $state.go('app.storeworklisttab.stocktransfers', $scope.currentcontext.id);
        };

        function loadData() {
            $scope.getStockTransfer();
        }


        $scope.lookupCallback = function(scope, data, options, hasError) {
            forEach(data, function(value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.item.StoreMasterId === 0) {
                    $scope.item.StoreMasterId = value[0].Id;
                }
            });
        };

        $scope.initLookup = function() {
            var inputData = [
                {
                    "Key": "ToStore",
                    Request: {
                        Params: [
                            {
                                Key: 6,
                                Value: utl.Session.getCurrentFacilityId(),
                            },
                            {
                                Key: 7,
                                Value: 2
                            }
                        ]
                    },
                },
                { "Key": "TransferType" },
                { "Key": "TransferStatus" },
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
        $scope.checkHeader = function (iVal) {
            if (iVal == 1) {
                $scope.item.WithoutHeader = false;
            }
            if (iVal == 2) {
                $scope.item.WithHeader = false;
            }
        };

        $scope.initLookup();
    }

    StocktransferViewController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();