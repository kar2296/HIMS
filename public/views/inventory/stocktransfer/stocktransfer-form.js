(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('StockTransferFormController', StockTransferFormController);


    function StockTransferFormController($rootScope, $scope, $stateParams, $state, $translate, utl, $filter, modalConfig, $timeout) {
        var vm = this;
        var savehitcompleted = 0;

        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        angular.extend(this, utl.Ctrl.getDMPrintDataController({
            $scope: $scope
        }));

        $scope.tabindexmap = {
            patienttabindex: 1,
            detailtabindex: 2
        };

        $scope.itemexactsearch = 0;
        $scope.itemexactsearch =
            (utl.FacilitySetting.getFacilitySettingValue('general', 'itemexactsearch')) ? utl.FacilitySetting.getFacilitySettingValue('general', 'itemexactsearch') : 0;
        $scope.jssgrn = 0;
        $scope.jssgrn =
            (utl.FacilitySetting.getFacilitySettingValue('billing', 'isjssgrn')) ? utl.FacilitySetting.getFacilitySettingValue('billing', 'isjssgrn') : 0;
        $scope.stockissuedirecttransfer = 0;
        $scope.stockissuedirecttransfer =
            (utl.FacilitySetting.getFacilitySettingValue('billing', 'stockissuedirecttransfer')) ? utl.FacilitySetting.getFacilitySettingValue('billing', 'stockissuedirecttransfer') : 0;
        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            StoreId: 0,
            StoreMasterId: 0,
            StoreName: '',
            StoreTypeId: 0,
            TransferTypeId: 1,
            ToStoreMasterId: -1,
            ToStoreName: '',
            ItemCategoryId: -1,
            TotalGrossAmount: 0,
            TotalDiscountAmount: 0,
            TotalGstAmount: 0,
            TotalNetAmount: 0,
            Comments: null,
            isDisabled: false,
            TransferNumber: null,
            AcceptanceNumber: null,
            DisplayTransferStatus: null,
            WithHeader: true,
            WithoutHeader: false,
            ExpiryWarningDays: 0,
            ExpiryPriorStopDays: 0
        };

        $scope.lookup = {};
        $scope.itemUsedBatches = {};
        $scope.currentcontext = {
            id: -1
        };

        $scope.autosearchpopup = 0;
        $scope.dmprintpreferences = 0;
        $scope.printpreferences = 1;


        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.item.TransferDate = utl.Formatter.getCurrentDate();
        $scope.item.StoreName = '';
        $scope.stocktransferDetails = [];
        $scope.deletedstocktransferDetails = [];

        $scope.canShowPrintBtn = true;
        $scope.canShowSaveBtn = true;
        $scope.canShowSaveandApproveBtn = true;
        $scope.canShowAuthorizeBtn = false;
        $scope.canShowClearBtn = true;
        $scope.canShowCancelBtn = true;

        $scope.applyVisibilityRules = function () {
            // New
            if ($scope.item.TransferStatusId != 1 || $scope.item.TransferStatusId != 2 || $scope.item.TransferStatusId != 3 || $scope.item.TransferStatusId != 4 || $scope.item.TransferStatusId != 5) {
                $scope.canShowPrintBtn = false;
                $scope.canShowTransferBtn = true;
                $scope.canShowClearBtn = true;
                $scope.canShowHistoryBtn = false;
                $scope.canShowAuthorizeBtn = false;
            }
            // When In Draft Status
            if ($scope.item.TransferStatusId == 1) {
                $scope.canShowPrintBtn = true;
                $scope.canShowTransferBtn = true;
                $scope.canShowClearBtn = false;
                $scope.canShowHistoryBtn = true;
                $scope.canShowAuthorizeBtn = false;
            }
            // When In Approved Status
            if ($scope.item.TransferStatusId == 2) {
                $scope.canShowPrintBtn = true;
                $scope.canShowTransferBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowHistoryBtn = true;
                $scope.canShowAuthorizeBtn = true;
            }
            // When In Authorized Status
            if ($scope.item.TransferStatusId == 3) {
                $scope.canShowPrintBtn = true;
                $scope.canShowTransferBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowHistoryBtn = true;
                $scope.canShowAuthorizeBtn = false;
            }
            // When In Completed Status
            if ($scope.item.TransferStatusId == 4) {
                $scope.canShowPrintBtn = true;
                $scope.canShowTransferBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowHistoryBtn = true;
                $scope.canShowAuthorizeBtn = false;
            }
            // When In Cancelled Status
            if ($scope.item.TransferStatusId == 5) {
                $scope.canShowPrintBtn = true;
                $scope.canShowTransferBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowHistoryBtn = true;
                $scope.canShowAuthorizeBtn = false;
            }

            if ($scope.item.AcceptanceStatusId == 1 && $scope.item.TransferStatusId == 2) {
                if ($scope.stockissuedirecttransfer == 0) {
                    $scope.canShowAuthorizeBtn = false;
                }
            }
        };
        $scope.getfacilitystore = function () {
            $scope.item.ToStoreMasterId = -1;
            if ($scope.item.FacilityId > 0) {
                var inputData = [{
                    "Key": "ToStore",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: 2
                        }, {
                            Key: 6,
                            Value: $scope.item.FacilityId
                        },]
                    }
                }];
                $scope.getLookUp(inputData);
            }
        };

        $scope.getGrnDetailsCallback = function (scope, res, options, hasError) {
            $scope.stocktransferDetails = [];
            for (var sdx in res.Data) {
                var Gtdetail = res.Data[sdx];
                var stockserialitems = null;
                var serialitem = [];
                Gtdetail.BatchDetails = [];
                var batid = 0;
                if (Gtdetail.StockSerialItems) {
                    var SumOfSerialQuantity = 0;
                    stockserialitems = Gtdetail.StockSerialItems;
                    for (batid = 0; batid < stockserialitems.length; batid++) {
                        serialitem = stockserialitems[batid];
                        if (serialitem.Quantity > 0) {
                            SumOfSerialQuantity = SumOfSerialQuantity + serialitem.Quantity;
                            Gtdetail.BatchDetails.push(serialitem);
                        }
                    }
                    Gtdetail.QuantityBeforeTransfer = SumOfSerialQuantity;
                }
                Gtdetail.TransferedQuantity = Gtdetail.GrnQuantityAfterConversion;
                if (Gtdetail.FreeQty) {
                    Gtdetail.TransferedQuantity = Gtdetail.TransferedQuantity + Gtdetail.FreeQtyAfterConversion;
                }
                Gtdetail.GrnDetailId = Gtdetail.Id;
                Gtdetail.GrnId = Gtdetail.GrnId;
                if (Gtdetail.BatchDetails && Gtdetail.BatchDetails.length > 0) {
                    $scope.stocktransferDetails.push(Gtdetail);
                    $scope.CheckBatchQty(Gtdetail);
                    $scope.ChooseBatches(sdx, Gtdetail);
                }
            }

            // $scope.stocktransferDetails = res.Data || [];
        };

        $scope.getGrnDetails = function (pageNo) {
            if ($scope.currentcontext.Grnid && $scope.currentcontext.Grnid > 0) {
                var inputData = {
                    Params: [{
                        Key: 1,
                        Value: $scope.currentcontext.Grnid
                    }],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };

                var options = {
                    action: 'pharmacy/grndetail/GetGrnDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getGrnDetailsCallback
                };
                utl.Http.doAction(options);
            }
            // else {
            //     $scope.addNewLineItem();
            // }
        };


        $scope.getgrnInfoCallback = function (scope, data, options, hasError) {
            // $scope.item = data;
            if(data) {
                $scope.item.GrnId = data.Id;
                if(data.StoreMasterId) {
                    $scope.item.StoreMasterId = data.StoreMasterId;
                }
            }

            // if ($scope.item.AcceptanceStatusId == 1 && $scope.item.TransferStatusId == 2) {
            //     if($scope.stockissuedirecttransfer == 0) {
            //         $scope.canShowAuthorizeBtn = false;
            //     }
            // }
        };

        $scope.getgrnInfo = function () {
            if ($scope.currentcontext.Grnid && $scope.currentcontext.Grnid > 0) {
                var options = {
                    action: 'pharmacy/grn/GetGrnById',
                    data: {
                        Id: $scope.currentcontext.Grnid
                    },
                    type: 'post',
                    onComplete: $scope.getgrnInfoCallback
                };
                utl.Http.doAction(options);
            }
        };

        function grnData(data) {
            $scope.currentcontext.Grnid = data.grnId;
            $scope.item.GrnId = data.grnId;
            $scope.getgrnInfo();
            $scope.getGrnDetails();
        }
        $scope.findgrn = function () {
            utl.Modal.open('app.findgrn-list', {
                params: {
                    id: 0
                },
                confirmCallback: grnData
            });
        };

        $scope.openAttachments = function () {
            utl.Modal.open('app.patientattachments', {
                params: {
                    pid: 0,
                    itemmasterid: 0
                },
                confirmCallback: $scope.initLookup,
                cancelCallback: $scope.initLookup
            });
        };

        $scope.setIndexforTableIndex = function () {
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

        $scope.getstocktransferNumCallback = function (scope, data, options, hasError) {
            // utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            savehitcompleted = 0;
            console.log(data);
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Your Stock Transfer has been Approved!.. Ref No is ' + '<br>' + '<b>' + data.TransferNumber + '</b>',
                okkey: 'OK',
                // noKey: 'common.nokey.lbl',
                onSuccessMethod: function () {
                    loadData();
                }
            };
            utl.Dialog.SuccessMessage(confirmOptions);
        };
        $scope.getstocktransferNum = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'pharmacy/StockTransfer/GetStockTransferByIdWithoutDetails',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getstocktransferNumCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.addNewLineItem = function () {
            var lastIndex = $scope.stocktransferDetails.length - 1;
            if (lastIndex >= 0) {
                if ($scope.stocktransferDetails[lastIndex].ItemMasterId == -1)
                    return false;
            }

            var stocktransferDetail = {
                Id: 0,
                SNo: 0,
                itemidxdesc: null,
                itemidxqty: null,
                ItemMasterId: -1,
                ItemCode: '',
                ItemName: '',
                BaseUomId: 0,
                PurchaseUomId: 0,
                SaleUomId: 0,
                GenericId: 0,
                GenericName: '',
                ManufacturerId: 0,
                ManufacturerName: '',
                ScheduleTypeId: 0,
                ScheduleTypeDescription: '',
                RequestedQuantity: 0,
                TransferedQuantity: 0,
                AcceptedQuantity: 0,
                QuantityBeforeTransfer: 0,
                BatchQuantity: 0,
                PurchasePrice: 0,
                DiscountModeId: 0,
                DiscountMode: '',
                Discount: 0,
                DiscountAmount: 0,
                UomDiscountAmount: 0,
                UnitDiscountAmount: 0,
                UomPriceAfterDiscount: 0,
                PurchasePriceAfterDiscount: 0,
                GstId: 0,
                GstPercentage: 0,
                GstAmount: 0,
                UnitGstAmount: 0,
                InGstId: 0,
                InGstPercentage: 0,
                InGstAmount: 0,
                UnitInGstAmount: 0,
                CGstId: 0,
                CGstPercentage: 0,
                CGstAmount: 0,
                UnitCGstAmount: 0,
                SGstId: 0,
                SGstPercentage: 0,
                SGstAmount: 0,
                UnitSGstAmount: 0,
                UomPrice: 0,
                PurchasePrice: 0,
                UnitCostPrice: 0,
                MrPrice: 0,
                Amount: 0.00,
                GrossAmount: 0.00,
                NetAmount: 0.00,
                Status: 1,
                BatchDetails: [],
                BatchDetail: {
                    Id: 0,
                    StockItemId: 0,
                    StoreMasterId: 0,
                    BarCodeId: 0,
                    ItemMasterId: 0,
                    ItemCode: '',
                    ItemName: '',
                    BatchId: '',
                    ExpiryDate: null,
                    Quantity: 0,
                    UomPrice: 0,
                    PurchasePrice: 0,
                    DiscountModeId: 0,
                    Discount: 0,
                    UomDiscountAmount: 0,
                    DiscountAmount: 0,
                    UomPriceAfterDiscount: 0,
                    PurchasePriceAfterDiscount: 0,
                    Ucp: 0,
                    Mrp: 0,
                    GstId: 0,
                    GstPercentage: 0,
                    UnitGstAmount: 0,
                    GstAmount: 0,
                    InGstId: 0,
                    InGstPercentage: 0,
                    UnitInGstAmount: 0,
                    InGstAmount: 0,
                    CGstId: 0,
                    CGstPercentage: 0,
                    UnitCGstAmount: 0,
                    CGstAmount: 0,
                    SGstId: 0,
                    SGstPercentage: 0,
                    UnitSGstAmount: 0,
                    SGstAmount: 0,
                    PurchaseUomId: 0,
                    BaseUomId: 0,
                    SaleUomId: 0,
                    ConversionQuantity: 0,
                    IsExpiry: 0,
                    IsSuspended: 0,
                    ManufacturerId: 0,
                    VendorMasterId: 0,
                    GrnDetailId: 0,
                    GrnId: 0,
                    StockEntryDetailId: 0,
                    StockEntryId: 0,
                    FacilityId: 0,
                    OrgId: 0,
                    Rev: 0,
                    SerialDetails: null,
                    ExpiryAlert: false,
                    ExpiryStop: false,
                    ExpiryProceed: false,
                    HaveNoExpiry: false
                },
                StockSerialItemId: 0,
                StockSerialItemRev: 0,
                StockItemId: 0,
                StockItemRev: 0,
                StoreMasterId: 0,
                ToStoreMasterId: 0,
                BarCodeId: 0,
                Batch: false,
                BatchId: '',
                Quantity: 0,
                ExpiryDate: '',
                ExpiryAlert: false,
                ExpiryStop: false,
                ExpiryProceed: false,
                HaveNoExpiry: false,
                Ucp: 0,
                Mrp: 0,
                ConversionQuantity: 0,
                IsExpiry: 0,
                IsSuspended: 0,
                ManufacturerId: 0,
                VendorMasterId: 0,
                GrnDetailId: 0,
                GrnId: 0,
                StockEntryDetailId: 0,
                StockEntryId: 0,
                FacilityId: 0,
                OrgId: 0,
                MinQty: 0,
                MaxQty: 0,
                tabindex: $scope.tabindexmap.detailtabindex++
            };

            if ($scope.currentcontext.id > 0) {
                stocktransferDetail.StockTransferId = $scope.currentcontext.id;
            }
            $scope.stocktransferDetails.push(stocktransferDetail);
            $scope.SelectedIndex = $scope.stocktransferDetails.length;
            $scope.setIndexforTableIndex();
        };

        $scope.add_new = function () {
            utl.Modal.open('app.stocktransfer', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.onDetailSave
            });
        };

        $scope.addNew = function () {
            if ($stateParams.id > 0)
                $state.go('app.stocktransfer', {
                    id: 0
                });
            else
                $state.reload();
        };

        $scope.Clear = function () {
            $scope.stocktransferDetails = [];
            savehitcompleted = 0;
            $scope.autosearchpopup = 0;
            $scope.addNewLineItem();
            $scope.setCmbFocus('');
            $timeout(function () {
                var uiSelect = angular.element(document.getElementById('tostoreid'));
                var uichild = uiSelect.controller('uiSelect');
                uichild.focusser[0].focus();
                uichild.activate();
            }, 100);
        };

        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.id,
                Data: {
                    isprint: false,
                    withHeader: $scope.item.WithHeader,
                    withoutHeader: $scope.item.WithoutHeader
                }
            };
            var options = {
                action: 'pharmacy/StockTransfer/PrintStockTransfer',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.history = function (HistoryId) {
            utl.Modal.open('app.transferhistory', {});
        };

        $scope.History = function (item, idx) {
            if (item.ItemMasterId > 0) {
                utl.Modal.open('app.stocktransferhistory', {
                    params: {
                        storemasterid: $scope.item.StoreMasterId,
                        itemmasterid: item.ItemMasterId,
                        itemcode: item.ItemCode,
                        itemname: item.ItemName,
                    },
                    confirmCallback: $scope.getList
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.emptyrowmsg.lbl'));
            }
        };

        $scope.batchDetails = function (idx, item) {
            utl.Modal.open('app.itembatch-details', {
                params: {
                    current_index: idx,
                    itemmasterid: item.ItemMasterId,
                    storemasterid: item.StoreMasterId,
                    current_item: item,
                    grid_items: $scope.stocktransferDetails
                },
                confirmCallback: $scope.onBatchChange
            });
        };

        $scope.onBatchChange = function (UpdatedItemData) {
            var ExpiryDays = null;
            var item = [];
            item = UpdatedItemData.UpdatedItem;

            for (var count = 0; count < $scope.stocktransferDetails.length; count++) {
                var cllitem = $scope.stocktransferDetails[count];
                if (cllitem.ItemMasterId == UpdatedItemData.ItemMasterId) {
                    cllitem.Status = 2;
                    $scope.deletedstocktransferDetails.push(cllitem);
                    var index1 = $scope.stocktransferDetails.indexOf(cllitem);
                    $scope.stocktransferDetails.splice(index1, 1);
                    count = count - 1;
                }
            }

            for (var clsidx in $scope.stocktransferDetails) {
                var clsitem = $scope.stocktransferDetails[clsidx];
                if (clsitem.ItemMasterId == -1) {
                    clsitem.Status = 2;
                    $scope.deletedstocktransferDetails.push(clsitem);
                    var index2 = $scope.stocktransferDetails.indexOf(clsitem);
                    $scope.stocktransferDetails.splice(index2, 1);
                }
            }

            for (var batid = 0; batid < item.BatchDetails.length; batid++) {
                var stocktransferDetail = {
                    Id: 0,
                    ItemMasterId: item.ItemMasterId,
                    ItemCode: item.ItemCode,
                    ItemName: item.ItemName,
                    itemidxdesc: null,
                    ScheduleTypeId: item.ScheduleTypeId,
                    ManufacturerId: item.ManufacturerId,
                    ManufacturerName: item.ManufacturerName,
                    StockSerialItemId: item.BatchDetails[batid].Id,
                    StockSerialItemRev: item.BatchDetails[batid].Rev,
                    StockItemId: item.BatchDetails[batid].StockItemId,
                    StockItemRev: item.StockItemRev,
                    TransferedQuantity: item.BatchDetails[batid].IssueQty,
                    AcceptedQuantity: item.BatchDetails[batid].IssueQty,
                    itemidxqty: null,
                    BatchQuantity: item.BatchDetails[batid].Quantity,
                    QuantityBeforeTransfer: item.QuantityBeforeTransfer,
                    BarCodeId: item.BatchDetails[batid].BarCodeId,
                    Batch: true,
                    BatchId: item.BatchDetails[batid].BatchId,
                    ExpiryDate: null,
                    ExpiryAlert: false,
                    ExpiryStop: false,
                    ExpiryProceed: false,
                    HaveNoExpiry: false,
                    UomPrice: item.BatchDetails[batid].UomPrice,
                    PurchasePrice: item.BatchDetails[batid].PurchasePrice,
                    DiscountModeId: item.BatchDetails[batid].DiscountModeId,
                    Discount: item.BatchDetails[batid].Discount,
                    UomDiscountAmount: item.BatchDetails[batid].UomDiscountAmount,
                    UnitDiscountAmount: item.BatchDetails[batid].DiscountAmount,
                    DiscountAmount: item.BatchDetails[batid].DiscountAmount,
                    UomPriceAfterDiscount: item.BatchDetails[batid].UomPriceAfterDiscount,
                    PurchasePriceAfterDiscount: item.BatchDetails[batid].PurchasePriceAfterDiscount,
                    Ucp: item.BatchDetails[batid].Ucp,
                    Mrp: item.BatchDetails[batid].Mrp,
                    UnitCostPrice: item.BatchDetails[batid].Ucp,
                    MrPrice: item.BatchDetails[batid].Mrp,
                    GstId: item.BatchDetails[batid].GstId,
                    InGstId: item.BatchDetails[batid].InGstId,
                    CGstId: item.BatchDetails[batid].CGstId,
                    SGstId: item.BatchDetails[batid].SGstId,
                    GstPercentage: item.BatchDetails[batid].GstPercentage,
                    InGstPercentage: item.BatchDetails[batid].InGstPercentage,
                    CGstPercentage: item.BatchDetails[batid].CGstPercentage,
                    SGstPercentage: item.BatchDetails[batid].SGstPercentage,
                    UnitGstAmount: item.BatchDetails[batid].UnitGstAmount,
                    UnitInGstAmount: item.BatchDetails[batid].UnitInGstAmount,
                    UnitCGstAmount: item.BatchDetails[batid].UnitCGstAmount,
                    UnitSGstAmount: item.BatchDetails[batid].UnitSGstAmount,
                    GstAmount: 0.00,
                    InGstAmount: 0.00,
                    CGstAmount: 0.00,
                    SGstAmount: 0.00,
                    PurchaseUomId: item.BatchDetails[batid].PurchaseUomId,
                    BaseUomId: item.BatchDetails[batid].BaseUomId,
                    SaleUomId: item.BatchDetails[batid].SaleUomId,
                    ConversionQuantity: item.BatchDetails[batid].ConversionQuantity,
                    IsExpiry: item.BatchDetails[batid].IsExpiry,
                    IsSuspended: item.BatchDetails[batid].IsSuspended,
                    VendorMasterId: item.BatchDetails[batid].VendorMasterId,
                    GrnId: item.BatchDetails[batid].GrnId,
                    GrnDetailId: item.BatchDetails[batid].GrnDetailId,
                    StockEntryId: item.BatchDetails[batid].StockEntryId,
                    StockEntryDetailId: item.BatchDetails[batid].StockEntryDetailId,
                    FacilityId: item.BatchDetails[batid].FacilityId,
                    OrgId: item.BatchDetails[batid].OrgId,
                    GrossAmount: 0.00,
                    NetAmount: 0.00,
                    Status: 1
                };

                if (item.BatchDetails[batid].ExpiryDate === null) {
                    stocktransferDetail.HaveNoExpiry = true;
                    ExpiryDays = 0;
                    stocktransferDetail.ExpiryProceed = false;
                    stocktransferDetail.ExpiryAlert = false;
                    stocktransferDetail.ExpiryStop = false;
                    stocktransferDetail.ExpiryDate = '';
                } else {
                    ExpiryDays = GetExpiryDays(item.BatchDetails[batid].ExpiryDate);
                    if (ExpiryDays <= $scope.item.ExpiryPriorStopDays) {
                        stocktransferDetail.ExpiryStop = true;
                    } else if (ExpiryDays > $scope.item.ExpiryPriorStopDays && ExpiryDays <= $scope.item.ExpiryWarningDays) {
                        stocktransferDetail.ExpiryAlert = true;
                    } else {
                        stocktransferDetail.ExpiryProceed = true;
                    }

                    if (stocktransferDetail.ExpiryAlert) {
                        stocktransferDetail.ExpiryDate = null;
                        stocktransferDetail.ExpiryAlert = true;
                        stocktransferDetail.ExpiryDate = item.BatchDetails[batid].ExpiryDate;
                    } else if (stocktransferDetail.ExpiryStop) {
                        stocktransferDetail.ExpiryDate = null;
                        stocktransferDetail.ExpiryStop = true;
                        stocktransferDetail.ExpiryDate = item.BatchDetails[batid].ExpiryDate;
                    } else {
                        stocktransferDetail.ExpiryDate = null;
                        stocktransferDetail.ExpiryProceed = true;
                        stocktransferDetail.ExpiryDate = item.BatchDetails[batid].ExpiryDate;
                    }
                }

                stocktransferDetail.GstAmount = parseFloat((parseFloat(stocktransferDetail.UnitGstAmount) * parseFloat(stocktransferDetail.TransferedQuantity)).toFixed(2));
                stocktransferDetail.InGstAmount = parseFloat((parseFloat(stocktransferDetail.UnitInGstAmount) * parseFloat(stocktransferDetail.TransferedQuantity)).toFixed(2));
                stocktransferDetail.CGstAmount = parseFloat((parseFloat(stocktransferDetail.UnitCGstAmount) * parseFloat(stocktransferDetail.TransferedQuantity)).toFixed(2));
                stocktransferDetail.SGstAmount = parseFloat((parseFloat(stocktransferDetail.UnitSGstAmount) * parseFloat(stocktransferDetail.TransferedQuantity)).toFixed(2));
                // stocktransferDetail.NetAmount = parseFloat((parseFloat(stocktransferDetail.MrPrice) * parseFloat(stocktransferDetail.TransferedQuantity)).toFixed(2));
                stocktransferDetail.NetAmount = parseFloat((parseFloat(stocktransferDetail.UnitCostPrice) * parseFloat(stocktransferDetail.TransferedQuantity)).toFixed(2));
                stocktransferDetail.GrossAmount = parseFloat((parseFloat(stocktransferDetail.UnitCostPrice) * parseFloat(stocktransferDetail.TransferedQuantity)).toFixed(2));

                stocktransferDetail.BatchDetails = item.AllBatchDetails;
                $scope.stocktransferDetails.push(stocktransferDetail);
                savehitcompleted = 0;
            }

            $scope.TotalGrossAmount = 0;
            $scope.TotalDiscountAmount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalInGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmount = 0;
            calculatetotalAmount();

            $scope.addNewLineItem();
        };

        $scope.Stock = function (selectedItem, idx) {
            if (selectedItem.ItemMasterId > 0) {
                utl.Modal.open('app.stocktransferdetails', {
                    params: {
                        storemasterid: $scope.item.StoreMasterId,
                        itemmasterid: selectedItem.ItemMasterId,
                        itemcode: selectedItem.ItemCode,
                        itemname: selectedItem.ItemName
                    },
                    confirmCallback: $scope.getList
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.emptyrowmsg.lbl'));
            }
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (item) {
            if (item.ItemMasterId != -1) {
                item.Status = 2;
            } else {
                utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.emptyrowmsg.lbl'));
                return false;
            }

            $scope.TotalGrossAmount = 0;
            $scope.TotalDiscountAmount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalInGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmount = 0;

            $scope.item.TotalGrossAmount = 0;
            $scope.item.TotalDiscountAmount = 0;
            $scope.item.TotalGstAmount = 0;
            $scope.item.TotalInGstAmount = 0;
            $scope.item.TotalCGstAmount = 0;
            $scope.item.TotalSGstAmount = 0;
            $scope.item.TotalNetAmount = 0;

            $scope.setIndexforTableIndex();

            calculatetotalAmount();
        };

        $scope.deleteStockTransferDetail = function (item, idx) {
            var lastIndex = 0;
            var index = 0;
            if (item.ItemMasterId != -1) {
                lastIndex = $scope.stocktransferDetails.length - 1;
                index = $scope.stocktransferDetails.indexOf(item);
                item.Status = 2;
                $scope.deletedstocktransferDetails.push(item);
                $scope.stocktransferDetails.splice(index, 1);
                if (lastIndex < 0 || lastIndex == idx) {
                    $scope.addNewLineItem();
                }
            } else {
                utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.emptyrowmsg.lbl'));
                return false;
            }

            $scope.TotalGrossAmount = 0;
            $scope.TotalDiscountAmount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalInGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmount = 0;

            $scope.item.TotalGrossAmount = 0;
            $scope.item.TotalDiscountAmount = 0;
            $scope.item.TotalGstAmount = 0;
            $scope.item.TotalInGstAmount = 0;
            $scope.item.TotalCGstAmount = 0;
            $scope.item.TotalSGstAmount = 0;
            $scope.item.TotalNetAmount = 0;

            $scope.setIndexforTableIndex();

            calculatetotalAmount();
        };

        $scope.editStockTransferDetail = function (item) {
            item.currenteditable = true;
            utl.Modal.open('app.stocktransferdetail', {
                params: {
                    id: $scope.currentcontext.id,
                    current_item: item
                },
                confirmCallback: $scope.onDetailSave
            });
        };

        $scope.onDetailSave = function (itemFromModal) {
            var isaddnew = true;
            for (var idx in $scope.stocktransferDetails) {
                var item = $scope.stocktransferDetails[idx];
                if (item.currenteditable) {
                    item = itemFromModal;
                    item.currenteditable = false;
                    isaddnew = false;
                }
            }
            if (isaddnew) {
                itemFromModal.Status = 1;
                if ($scope.currentcontext.id > 0) {
                    itemFromModal.StockTransferId = $scope.currentcontext.id;
                }
                $scope.stocktransferDetails.push(itemFromModal);
            }
        };

        $scope.getStockTransferDetailsCallback = function (scope, res, options, hasError) {
            console.log('*******Here***********');
            $scope.stocktransferDetails = [];
            $scope.stocktransferDetails = res.Data || [];
            for (var idx in $scope.stocktransferDetails) {
                var transferitem = $scope.stocktransferDetails[idx];
                if (transferitem.ItemMasterId > 0) {

                    transferitem.ExpiryProceed = false;
                    transferitem.ExpiryAlert = false;
                    transferitem.ExpiryStop = false;
                    transferitem.HaveNoExpiry = false;

                    if (transferitem.ExpiryDate === null) {
                        transferitem.ExpiryProceed = false;
                        transferitem.ExpiryAlert = false;
                        transferitem.ExpiryStop = false;
                        transferitem.HaveNoExpiry = true;
                        transferitem.ExpiryDate = '';
                    } else {
                        transferitem.ExpiryProceed = true;
                        transferitem.ExpiryAlert = false;
                        transferitem.ExpiryStop = false;
                        transferitem.HaveNoExpiry = false;
                    }

                    if (transferitem.DiscountModeId == 1) {
                        transferitem.DiscountMode = 'Rs.';
                    } else {
                        transferitem.DiscountMode = '%';
                    }

                    if (transferitem.StockItem) {
                        transferitem.QuantityBeforeTransfer = transferitem.StockItem.Quantity;
                    } else {
                        transferitem.QuantityBeforeTransfer = 0;
                    }

                    if (transferitem.StockSerialItem) {
                        transferitem.BatchQuantity = transferitem.StockSerialItem.Quantity;
                    } else {
                        transferitem.BatchQuantity = 0;
                    }

                    // $scope.computeAmount(transferitem);

                }
            }
            calculatetotalAmount();

            // $scope.addNewLineItem();

            // $scope.setIndexforTableIndex();
            // $timeout(function () {
            //     var uiSelect = angular.element(document.getElementById('tostoreid'));
            //     var uichild = uiSelect.controller('uiSelect');
            //     uichild.focusser[0].focus();
            //     uichild.activate();
            // }, 1000);
        };

        $scope.getStockTransferDetails = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [{
                        Key: 1,
                        Value: $scope.currentcontext.id
                    }],
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
            } else {
                $scope.addNewLineItem();
                $timeout(function () {
                    var uiSelect = angular.element(document.getElementById('tostoreid'));
                    var uichild = uiSelect.controller('uiSelect');
                    uichild.focusser[0].focus();
                    uichild.activate();
                }, 2000);
            }
        };

        $scope.Storeselect = function (storetype, storeid) {
            var msg = 'FromStore and ToStore cannot be same';
            if (storetype == 1 && storeid == $scope.item.ToStoreMasterId) {
                $scope.item.StoreMasterId = 0;
                utl.Alert.showErrorMsg(msg);
            } else if (storetype == 2 && storeid == $scope.item.StoreMasterId) {
                $scope.item.ToStoreMasterId = 0;
                utl.Alert.showErrorMsg(msg);
            }
        };

        $scope.SelectedFromStore = function (selectedstore) {
            var msg = 'From Store and To Store Can not be Same';
            if (selectedstore) {
                $scope.item.ItemCategoryId = selectedstore.StoreTypeId;
                $scope.item.StoreTypeId = selectedstore.StoreTypeId;
            }
            if ($scope.stocktransferDetails.length > 0) {
                if (selectedstore.StoreMasterId == $scope.item.ToStoreMasterId) {
                    $scope.item.StoreMasterId = $scope.item.StoreId;
                    utl.Alert.showErrorMsg($translate.instant('inventory.stocktransferform.storeandstoremsg.lbl'));
                    return false;
                } else {
                    $scope.item.StoreId = $scope.item.StoreMasterId;
                    $scope.item.StoreName = selectedstore.StoreName;
                    if (selectedstore.StoreMaster) {
                        $scope.item.ItemCategoryId = selectedstore.StoreMaster.StoreTypeId;
                        $scope.item.StoreTypeId = selectedstore.StoreMaster.StoreTypeId;
                    }

                    $scope.stocktransferDetails = [];
                    $scope.addNewLineItem();
                }
            }
        };

        $scope.SelectedToStore = function (selectedstore) {
            var msg = 'From Store and To Store Can not be Same';
            if (selectedstore.StoreMasterId == $scope.item.StoreMasterId) {
                $scope.item.ToStoreMasterId = -1;
                utl.Alert.showErrorMsg($translate.instant('inventory.stocktransferform.storeandstoremsg.lbl'));
                return false;
            } else {
                if (selectedstore.StoreTypeId != $scope.item.ItemCategoryId) {
                    $scope.item.ToStoreMasterId = -1;
                    utl.Alert.showErrorMsg($translate.instant('inventory.stocktransferform.storeandcategorymsg.lbl'));
                    return false;
                } else {
                    $scope.item.ToStoreName = selectedstore.StoreName;
                }
            }
        };

        $scope.getItemCallback = function (scope, data, options, hasError) {
            // for (var idx in data.Data) {
            //     var item = data.Data[idx];

            //     item.TotalNetAmount = parseFloat(item.TotalNetAmount).toFixed(2);
            //     vm.gridConfig.data.push(item);
            // }
            $scope.item = data;
            if (data.TransferStatusId == 1) {
                $scope.item.isDisabled = false;
                $scope.item.DisplayTransferStatus = 'Draft';
            }
            if (data.TransferStatusId == 2) {
                $scope.item.isDisabled = true;
                $scope.item.DisplayTransferStatus = 'Transferred';
            }
            if (data.TransferStatusId == 3) {
                $scope.item.isDisabled = true;
                $scope.item.DisplayTransferStatus = 'Authorized';
            }
            if (data.TransferStatusId == 4) {
                $scope.item.isDisabled = true;
                $scope.item.DisplayTransferStatus = 'Completed';
            }
            if (data.TransferStatusId == 5) {
                $scope.item.isDisabled = true;
                $scope.item.DisplayTransferStatus = 'Cancelled';
            }
            $scope.item.TransferUser = '';
            if (data.TranferedUser) {
                if (data.TranferedUser.Title)
                    $scope.item.TransferUser = data.TranferedUser.Title.Description;
                if (data.TranferedUser.FirstName)
                    $scope.item.TransferUser += ' ' + data.TranferedUser.FirstName;
                if (data.TranferedUser.LastName)
                    $scope.item.TransferUser += ' ' + data.TranferedUser.LastName;
            }
            $scope.applyVisibilityRules();

        };

        $scope.getItem = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'pharmacy/stocktransfer/GetStockTransferById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.applyVisibilityRules();
            }
        };

        $scope.errorItemCallback = function (data, options) {
            console.log(data);
            if (data.Error.Message) {
                var message = data.Error.Message;


                if (message.includes('Stock Changes Happened') == true) {
                    message = message.replace("Stock Changes Happened for ", "");
                    let error_items = message.split("$,$");
                    for (var idx in error_items) {
                        let item = error_items[idx];
                        let item_det = item.split(":");
                        var itemid = Number(item_det[0]);

                        // let find_index = $scope.PatientBillDetails.findIndex(bDet => {
                        //     return bDet.ItemMasterId == itemid
                        // });
                        // $scope.PatientBillDetails.forEach((billItem, index) => billItem.ItemMasterId === itemid ? $scope.PatientBillDetails[index].removeEntry = true : $scope.PatientBillDetails[index].removeEntry = false)

                        $scope.stocktransferDetails.forEach(function (elem, index, array) {
                            if (elem.ItemMasterId === itemid) {
                                $scope.stocktransferDetails[index].removeEntry = true;
                            } else {
                                $scope.stocktransferDetails[index].removeEntry = false;
                            }
                            // return indexesOf12
                        });
                        // console.log(find_index);
                        // if (find_index != -1) {
                        //     $scope.PatientBillDetails[find_index].removeEntry = true;
                        // }
                    }
                    console.log($scope.stocktransferDetails); //return;
                } else if (message.includes('Stock Already Transfered') == true) {
                    $scope.backToList();
                } else {
                    console.log(message);
                }
            }
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            savehitcompleted = 0;
            if (data === true) {
                $scope.currentcontext.id = options.data.Data.Header.Id;
            } else {
                $scope.currentcontext.id = data;
            }
            $scope.getstocktransferNum();
            // loadData();
        };

        $scope.backToList = function () {
            $state.go('app.stocktransfers', $scope.currentcontext.id);
        };

        $scope.Transfer = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'inventory.stocktransfers.transfermsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onTransferConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onTransferConfirmed = function () {
            $scope.item.TransferStatusId = 2;
            $scope.item.AcceptanceStatusId = 2;
            if ($scope.stockissuedirecttransfer == 0) {
                // $scope.item.TransferStatusId = 1;
                $scope.item.AcceptanceStatusId = 1;
            }
            $scope.item.TransferedBy = utl.Session.getCurrentUserId();
            $scope.item.TransferedDate = utl.Formatter.getCurrentDate();
            $scope.item.ApprovedBy = utl.Session.getCurrentUserId();
            $scope.item.ApprovedDate = utl.Formatter.getCurrentDate();
            $scope.item.AcceptedBy = utl.Session.getCurrentUserId();
            $scope.item.AcceptedDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.AuthorizeTransfer = function () {
            $scope.item.TransferStatusId = 3;
            // $scope.item.AcceptanceStatusId = 3;
            $scope.item.AuthorizedBy = utl.Session.getCurrentUserId();
            $scope.item.AuthorizedDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.onComplete = function () {
            $scope.item.TransferStatusId = 4;
            // $scope.item.AcceptanceStatusId = 4;
            $scope.saveItem();
        };

        $scope.onCancelConfirmed = function () {
            $scope.item.TransferStatusId = 5;
            // $scope.item.AcceptanceStatusId = 5;
            $scope.saveItem();
        };

        $scope.CancelTransfer = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'inventory.stocktransfer.cancelmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onCancelConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            if (checkMandatoryFields()) {
                var lines = getLinesForSave();

                var actionName = 'pharmacy/stocktransfer/AddStockTransfer';
                if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                    actionName = 'pharmacy/stocktransfer/UpdateStockTransfer';
                }
                savehitcompleted = 1;

                var inputData = {
                    Header: $scope.item,
                    Details: lines
                };
                console.log(inputData);
                // return;
                var options = {
                    action: actionName,
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback,
                    onError: $scope.errorItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        /*
        function checkMandatoryFields() {
            var AnyOne = 0;
            for (var iddx in $scope.stocktransferDetails) {
                var iddxitem = $scope.stocktransferDetails[iddx];
                if (iddxitem.ItemMasterId > 0 && parseInt(iddxitem.TransferedQuantity) <= 0) {
                    utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.enterqtymsg.lbl') + iddxitem.ItemName);
                    return false;
                } else if (iddxitem.ItemMasterId > 0 && iddxitem.Status == 1) {
                    AnyOne = 1;
                }
            }

            if (AnyOne == 0) {
                utl.Alert.showErrorMsg($translate.instant('inventory.stocktransferform.enteranyoneentrymsg.lbl'));
                return false;
            }

            return true;
        }
        */

        function checkMandatoryFields() {
            var AnyOne = 0;
            for (var iddx in $scope.stocktransferDetails) {
                var iddxitem = $scope.stocktransferDetails[iddx];
                if (iddxitem.ItemMasterId > 0 &&
                    iddxitem.BatchId == "" &&
                    iddxitem.BatchQuantity == 0) {
                    utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.choosebatchmsg.lbl') + iddxitem.ItemName);
                    return false;
                }
                // else if (iddxitem.ItemMasterId > 0 &&
                //     iddxitem.BatchId != "" &&
                //     iddxitem.BatchQuantity > 0 &&
                //     parseInt(iddxitem.TransferedQuantity) <= 0) {
                //     utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.enterqtymsg.lbl') + iddxitem.ItemName);
                //     return false;
                // }
                else if (iddxitem.ItemMasterId > 0 &&
                    iddxitem.BatchId != "" &&
                    iddxitem.BatchQuantity > 0 &&
                    parseInt(iddxitem.TransferedQuantity) > 0 &&
                    iddxitem.Status == 1) {
                    AnyOne = 1;
                }
            }

            // if (AnyOne == 0) {
            //     utl.Alert.showErrorMsg($translate.instant('inventory.stocktransferform.enteranyoneentrymsg.lbl'));
            //     return false;
            // }

            return true;
        }

        function getLinesForSave() {
            var result = [];
            for (var idx in $scope.stocktransferDetails) {
                var item = $scope.stocktransferDetails[idx];
                if (item.ItemMasterId > 0 && item.Status == 1) {
                    if (item.ExpiryDate == '') {
                        item.ExpiryDate = null;
                    }
                    result.push(item);
                }
            }
            return result;
        }

        function loadData() {
            $scope.getItem();
            $scope.getStockTransferDetails();
        }

        $scope.onItemSelected = function (idx, selectedItem) {
            var SelectedMasterItem = null;
            var stockserialitems = null;
            var serialitem = [];
            var batid = 0;
            if (selectedItem.SelectedItem.MyStoreQty <= 0) {
                utl.Alert.showErrorMsg($translate.instant('inventory.stocktransferform.stocknotavailablemsg.lbl'));
                selectedItem.StockSerialItemId = 0;
                selectedItem.StockItemId = 0;
                selectedItem.BarCodeId = 0;
                selectedItem.BatchId = '';
                selectedItem.ExpiryDate = '';
                selectedItem.Quantity = 0;
                selectedItem.UomPrice = 0;
                selectedItem.PurchasePrice = 0;
                selectedItem.DiscountModeId = 0;
                selectedItem.Discount = 0;
                selectedItem.UomDiscountAmount = 0;
                selectedItem.DiscountAmount = 0;
                selectedItem.UnitDiscountAmount = 0;
                selectedItem.UomPriceAfterDiscount = 0;
                selectedItem.PurchasePriceAfterDiscount = 0;
                selectedItem.Ucp = 0;
                selectedItem.Mrp = 0;
                selectedItem.GstId = 0;
                selectedItem.GstPercentage = 0;
                selectedItem.GstAmount = 0;
                selectedItem.UnitGstAmount = 0;
                selectedItem.InGstId = 0;
                selectedItem.InGstPercentage = 0;
                selectedItem.InGstAmount = 0;
                selectedItem.UnitInGstAmount = 0;
                selectedItem.CGstId = 0;
                selectedItem.CGstPercentage = 0;
                selectedItem.CGstAmount = 0;
                selectedItem.UnitCGstAmount = 0;
                selectedItem.SGstId = 0;
                selectedItem.SGstPercentage = 0;
                selectedItem.SGstAmount = 0;
                selectedItem.UnitSGstAmount = 0;
                selectedItem.PurchaseUomId = 0;
                selectedItem.BaseUomId = 0;
                selectedItem.SaleUomId = 0;
                selectedItem.ConversionQuantity = 0;
                selectedItem.IsExpiry = 0;
                selectedItem.IsSuspended = 0;
                selectedItem.ManufacturerId = 0;
                selectedItem.VendorMasterId = 0;
                selectedItem.GrnDetailId = 0;
                selectedItem.GrnId = 0;
                selectedItem.StockEntryDetailId = 0;
                selectedItem.StockEntryId = 0;
                selectedItem.FacilityId = 0;
                selectedItem.StockSerialItemRev = 0;
                selectedItem.BatchQuantity = 0;
                selectedItem.QuantityBeforeTransfer = 0;
                selectedItem.UnitCostPrice = 0;
                selectedItem.MrPrice = 0;

                selectedItem.BatchDetails = [];
            } else {
                if ($scope.jssgrn == 1) {
                    SelectedMasterItem = selectedItem.SelectedItem.ItemMaster;
                } else {
                    SelectedMasterItem = selectedItem.SelectedItem;
                }

                selectedItem.ItemMasterId = SelectedMasterItem.Id;
                selectedItem.ItemCode = SelectedMasterItem.ItemCode;
                selectedItem.ItemName = SelectedMasterItem.ItemName;
                selectedItem.GenericId = SelectedMasterItem.GenericId;
                selectedItem.GenericName = SelectedMasterItem.GenericName;
                selectedItem.ManufacturerId = SelectedMasterItem.ManufacturerId;
                selectedItem.ManufacturerName = SelectedMasterItem.ManufacturerName;
                selectedItem.ScheduleTypeId = SelectedMasterItem.ScheduleTypeId;

                selectedItem.BatchDetails = [];
                selectedItem.BatchDetail = {};

                selectedItem.StockSerialItemId = 0;
                selectedItem.StockItemId = 0;
                selectedItem.BarCodeId = 0;
                selectedItem.BatchId = '';
                selectedItem.ExpiryDate = '';
                selectedItem.Quantity = 0;
                selectedItem.UomPrice = 0;
                selectedItem.PurchasePrice = 0;
                selectedItem.DiscountModeId = 0;
                selectedItem.Discount = 0;
                selectedItem.UomDiscountAmount = 0;
                selectedItem.DiscountAmount = 0;
                selectedItem.UnitDiscountAmount = 0;
                selectedItem.UomPriceAfterDiscount = 0;
                selectedItem.PurchasePriceAfterDiscount = 0;
                selectedItem.Ucp = 0;
                selectedItem.Mrp = 0;
                selectedItem.GstId = 0;
                selectedItem.GstPercentage = 0;
                selectedItem.GstAmount = 0;
                selectedItem.UnitGstAmount = 0;
                selectedItem.InGstId = 0;
                selectedItem.InGstPercentage = 0;
                selectedItem.InGstAmount = 0;
                selectedItem.UnitInGstAmount = 0;
                selectedItem.CGstId = 0;
                selectedItem.CGstPercentage = 0;
                selectedItem.CGstAmount = 0;
                selectedItem.UnitCGstAmount = 0;
                selectedItem.SGstId = 0;
                selectedItem.SGstPercentage = 0;
                selectedItem.SGstAmount = 0;
                selectedItem.UnitSGstAmount = 0;
                selectedItem.PurchaseUomId = 0;
                selectedItem.BaseUomId = 0;
                selectedItem.SaleUomId = 0;
                selectedItem.ConversionQuantity = 0;
                selectedItem.IsExpiry = 0;
                selectedItem.IsSuspended = 0;
                selectedItem.ManufacturerId = 0;
                selectedItem.VendorMasterId = 0;
                selectedItem.GrnDetailId = 0;
                selectedItem.GrnId = 0;
                selectedItem.StockEntryDetailId = 0;
                selectedItem.StockEntryId = 0;
                selectedItem.FacilityId = 0;
                selectedItem.StockSerialItemRev = 0;
                selectedItem.BatchQuantity = 0;
                selectedItem.QuantityBeforeTransfer = 0;
                selectedItem.UnitCostPrice = 0;
                selectedItem.MrPrice = 0;
                selectedItem.Amount = 0.00;
                selectedItem.GrossAmount = 0.00;
                selectedItem.NetAmount = 0.00;
                selectedItem.MinQty = 0;
                selectedItem.MaxQty = 0;

                if (SelectedMasterItem.StockItem &&
                    SelectedMasterItem.StockItem.StockSerialItems.length > 0) {
                    var SumOfSerialQuantity = 0;
                    stockserialitems = SelectedMasterItem.StockItem.StockSerialItems;
                    for (batid = 0; batid < stockserialitems.length; batid++) {
                        serialitem = stockserialitems[batid];
                        if (serialitem.Quantity > 0) {
                            SumOfSerialQuantity = SumOfSerialQuantity + serialitem.Quantity;
                            selectedItem.BatchDetails.push(serialitem);
                        }
                    }

                    selectedItem.QuantityBeforeTransfer = SumOfSerialQuantity;
                    selectedItem.StockItemRev = SelectedMasterItem.StockItem.Rev;
                }
            }
        };

        $scope.CleanItemBatches = function (item) {
            for (var count = 0; count < $scope.stocktransferDetails.length; count++) {
                var cllitem = $scope.stocktransferDetails[count];
                if (cllitem.ItemMasterId == item.ItemMasterId) {
                    if (cllitem.BatchId == item.BatchId) {
                        cllitem.Status = 2;
                        $scope.deletedstocktransferDetails.push(cllitem);
                        var index1 = $scope.stocktransferDetails.indexOf(cllitem);
                        $scope.stocktransferDetails.splice(index1, 1);
                        count = count - 1;
                    }
                }
            }

            for (var clsidx in $scope.stocktransferDetails) {
                var clsitem = $scope.stocktransferDetails[clsidx];
                if (clsitem.ItemMasterId == -1) {
                    clsitem.Status = 2;
                    $scope.deletedstocktransferDetails.push(clsitem);
                    var index2 = $scope.stocktransferDetails.indexOf(clsitem);
                    $scope.stocktransferDetails.splice(index2, 1);
                }
            }
        };

        $scope.ChooseBatches = function (idx, item) {
            var currentitem = item;
            var stocktransferDetail = {};
            var ExpiryDays = null;
            if (item.TransferedQuantity > item.QuantityBeforeTransfer) {
                utl.Alert.showErrorMsg($translate.instant('inventory.stocktransferform.quantitynotexceedmsg.lbl'));
                item.TransferedQuantity = 0;
            } else if (item.TransferedQuantity === null || item.TransferedQuantity === 0) {
                //utl.Alert.showErrorMsg('Quantity should be Greater Than Zero');
                //item.TransferedQuantity = 0;
            } else {
                $scope.CleanItemBatches(item);
                item.BatchDetails.sort($scope.custom_multi_sort);
                for (var batid = 0; batid < item.BatchDetails.length; batid++) {
                    if (item.TransferedQuantity > 0) {
                        if (item.BatchDetails[batid].Quantity >= item.TransferedQuantity) {
                            stocktransferDetail = {
                                Id: 0,
                                ItemMasterId: item.ItemMasterId,
                                ItemCode: item.ItemCode,
                                ItemName: item.ItemName,
                                itemidxdesc: null,
                                ScheduleTypeId: item.ScheduleTypeId,
                                ManufacturerId: item.ManufacturerId,
                                ManufacturerName: item.ManufacturerName,
                                StockSerialItemId: item.BatchDetails[batid].Id,
                                StockSerialItemRev: item.BatchDetails[batid].Rev,
                                StockItemId: item.BatchDetails[batid].StockItemId,
                                StockItemRev: item.StockItemRev,
                                TransferedQuantity: item.TransferedQuantity,
                                AcceptedQuantity: item.TransferedQuantity,
                                MinQty: item.MinQty,
                                MaxQty: item.MaxQty,
                                itemidxqty: null,
                                BatchQuantity: item.BatchDetails[batid].Quantity,
                                QuantityBeforeTransfer: item.QuantityBeforeTransfer,
                                BarCodeId: item.BatchDetails[batid].BarCodeId,
                                BarcodeNo: item.BatchDetails[batid].BarcodeNo,
                                Batch: true,
                                BatchId: item.BatchDetails[batid].BatchId,
                                ExpiryDate: null,
                                ExpiryAlert: false,
                                ExpiryStop: false,
                                ExpiryProceed: false,
                                HaveNoExpiry: false,
                                UomPrice: item.BatchDetails[batid].UomPrice,
                                PurchasePrice: item.BatchDetails[batid].PurchasePrice,
                                DiscountModeId: item.BatchDetails[batid].DiscountModeId,
                                Discount: item.BatchDetails[batid].Discount,
                                UomDiscountAmount: item.BatchDetails[batid].UomDiscountAmount,
                                UnitDiscountAmount: item.BatchDetails[batid].DiscountAmount,
                                DiscountAmount: item.BatchDetails[batid].DiscountAmount,
                                UomPriceAfterDiscount: item.BatchDetails[batid].UomPriceAfterDiscount,
                                PurchasePriceAfterDiscount: item.BatchDetails[batid].PurchasePriceAfterDiscount,
                                Ucp: item.BatchDetails[batid].Ucp,
                                Mrp: item.BatchDetails[batid].Mrp,
                                UnitCostPrice: item.BatchDetails[batid].Ucp,
                                MrPrice: item.BatchDetails[batid].Mrp,
                                GstId: item.BatchDetails[batid].GstId,
                                InGstId: item.BatchDetails[batid].InGstId,
                                CGstId: item.BatchDetails[batid].CGstId,
                                SGstId: item.BatchDetails[batid].SGstId,
                                GstPercentage: item.BatchDetails[batid].GstPercentage,
                                InGstPercentage: item.BatchDetails[batid].InGstPercentage,
                                CGstPercentage: item.BatchDetails[batid].CGstPercentage,
                                SGstPercentage: item.BatchDetails[batid].SGstPercentage,
                                UnitGstAmount: item.BatchDetails[batid].UnitGstAmount,
                                UnitInGstAmount: item.BatchDetails[batid].UnitInGstAmount,
                                UnitCGstAmount: item.BatchDetails[batid].UnitCGstAmount,
                                UnitSGstAmount: item.BatchDetails[batid].UnitSGstAmount,
                                GstAmount: 0.00,
                                InGstAmount: 0.00,
                                CGstAmount: 0.00,
                                SGstAmount: 0.00,
                                PurchaseUomId: item.BatchDetails[batid].PurchaseUomId,
                                BaseUomId: item.BatchDetails[batid].BaseUomId,
                                SaleUomId: item.BatchDetails[batid].SaleUomId,
                                ConversionQuantity: item.BatchDetails[batid].ConversionQuantity,
                                IsExpiry: item.BatchDetails[batid].IsExpiry,
                                IsSuspended: item.BatchDetails[batid].IsSuspended,
                                VendorMasterId: item.BatchDetails[batid].VendorMasterId,
                                GrnId: item.BatchDetails[batid].GrnId,
                                GrnDetailId: item.BatchDetails[batid].GrnDetailId,
                                StockEntryId: item.BatchDetails[batid].StockEntryId,
                                StockEntryDetailId: item.BatchDetails[batid].StockEntryDetailId,
                                FacilityId: item.BatchDetails[batid].FacilityId,
                                OrgId: item.BatchDetails[batid].OrgId,
                                GrossAmount: 0.00,
                                NetAmount: 0.00,
                                Status: 1
                            };

                            if (item.BatchDetails[batid].ExpiryDate === null) {
                                stocktransferDetail.HaveNoExpiry = true;
                                ExpiryDays = 0;
                                stocktransferDetail.ExpiryProceed = false;
                                stocktransferDetail.ExpiryAlert = false;
                                stocktransferDetail.ExpiryStop = false;
                                stocktransferDetail.ExpiryDate = '';
                            } else {
                                ExpiryDays = GetExpiryDays(item.BatchDetails[batid].ExpiryDate);
                                if (ExpiryDays <= $scope.item.ExpiryPriorStopDays) {
                                    stocktransferDetail.ExpiryStop = true;
                                } else if (ExpiryDays > $scope.item.ExpiryPriorStopDays && ExpiryDays <= $scope.item.ExpiryWarningDays) {
                                    stocktransferDetail.ExpiryAlert = true;
                                } else {
                                    stocktransferDetail.ExpiryProceed = true;
                                }

                                if (stocktransferDetail.ExpiryAlert) {
                                    stocktransferDetail.ExpiryDate = null;
                                    stocktransferDetail.ExpiryAlert = true;
                                    stocktransferDetail.ExpiryDate = item.BatchDetails[batid].ExpiryDate;
                                } else if (stocktransferDetail.ExpiryStop) {
                                    stocktransferDetail.ExpiryDate = null;
                                    stocktransferDetail.ExpiryStop = true;
                                    stocktransferDetail.ExpiryDate = item.BatchDetails[batid].ExpiryDate;
                                } else {
                                    stocktransferDetail.ExpiryDate = null;
                                    stocktransferDetail.ExpiryProceed = true;
                                    stocktransferDetail.ExpiryDate = item.BatchDetails[batid].ExpiryDate;
                                }
                            }

                            stocktransferDetail.GstAmount = parseFloat((parseFloat(stocktransferDetail.UnitGstAmount) * parseFloat(stocktransferDetail.TransferedQuantity)).toFixed(2));
                            stocktransferDetail.InGstAmount = parseFloat((parseFloat(stocktransferDetail.UnitInGstAmount) * parseFloat(stocktransferDetail.TransferedQuantity)).toFixed(2));
                            stocktransferDetail.CGstAmount = parseFloat((parseFloat(stocktransferDetail.UnitCGstAmount) * parseFloat(stocktransferDetail.TransferedQuantity)).toFixed(2));
                            stocktransferDetail.SGstAmount = parseFloat((parseFloat(stocktransferDetail.UnitSGstAmount) * parseFloat(stocktransferDetail.TransferedQuantity)).toFixed(2));
                            // stocktransferDetail.NetAmount = parseFloat((parseFloat(stocktransferDetail.MrPrice) * parseFloat(stocktransferDetail.TransferedQuantity)).toFixed(2));
                            stocktransferDetail.NetAmount = parseFloat((parseFloat(stocktransferDetail.UnitCostPrice) * parseFloat(stocktransferDetail.TransferedQuantity)).toFixed(2));
                            stocktransferDetail.GrossAmount = parseFloat((parseFloat(stocktransferDetail.UnitCostPrice) * parseFloat(stocktransferDetail.TransferedQuantity)).toFixed(2));

                            stocktransferDetail.BatchDetails = item.BatchDetails;
                            $scope.stocktransferDetails.push(stocktransferDetail);
                            item.TransferedQuantity = 0;
                            savehitcompleted = 0;
                        } else if (item.BatchDetails[batid].Quantity < item.TransferedQuantity) {
                            stocktransferDetail = {
                                Id: 0,
                                ItemMasterId: item.ItemMasterId,
                                ItemCode: item.ItemCode,
                                ItemName: item.ItemName,
                                itemidxdesc: null,
                                ScheduleTypeId: item.ScheduleTypeId,
                                ManufacturerId: item.ManufacturerId,
                                ManufacturerName: item.ManufacturerName,
                                StockSerialItemId: item.BatchDetails[batid].Id,
                                StockSerialItemRev: item.BatchDetails[batid].Rev,
                                StockItemId: item.BatchDetails[batid].StockItemId,
                                StockItemRev: item.StockItemRev,
                                TransferedQuantity: item.BatchDetails[batid].Quantity,
                                AcceptedQuantity: item.BatchDetails[batid].Quantity,
                                MinQty: item.MinQty,
                                MaxQty: item.MaxQty,
                                itemidxqty: null,
                                BatchQuantity: item.BatchDetails[batid].Quantity,
                                QuantityBeforeTransfer: item.QuantityBeforeTransfer,
                                BarCodeId: item.BatchDetails[batid].BarCodeId,
                                BarcodeNo: item.BatchDetails[batid].BarcodeNo,
                                Batch: true,
                                BatchId: item.BatchDetails[batid].BatchId,
                                ExpiryDate: null,
                                ExpiryAlert: false,
                                ExpiryStop: false,
                                ExpiryProceed: false,
                                HaveNoExpiry: false,
                                UomPrice: item.BatchDetails[batid].UomPrice,
                                PurchasePrice: item.BatchDetails[batid].PurchasePrice,
                                DiscountModeId: item.BatchDetails[batid].DiscountModeId,
                                Discount: item.BatchDetails[batid].Discount,
                                UomDiscountAmount: item.BatchDetails[batid].UomDiscountAmount,
                                UnitDiscountAmount: item.BatchDetails[batid].UnitDiscountAmount,
                                DiscountAmount: item.BatchDetails[batid].DiscountAmount,
                                UomPriceAfterDiscount: item.BatchDetails[batid].UomPriceAfterDiscount,
                                PurchasePriceAfterDiscount: item.BatchDetails[batid].PurchasePriceAfterDiscount,
                                Ucp: item.BatchDetails[batid].Ucp,
                                Mrp: item.BatchDetails[batid].Mrp,
                                UnitCostPrice: item.BatchDetails[batid].Ucp,
                                MrPrice: item.BatchDetails[batid].Mrp,
                                GstId: item.BatchDetails[batid].GstId,
                                InGstId: item.BatchDetails[batid].InGstId,
                                CGstId: item.BatchDetails[batid].CGstId,
                                SGstId: item.BatchDetails[batid].SGstId,
                                GstPercentage: item.BatchDetails[batid].GstPercentage,
                                InGstPercentage: item.BatchDetails[batid].InGstPercentage,
                                CGstPercentage: item.BatchDetails[batid].CGstPercentage,
                                SGstPercentage: item.BatchDetails[batid].SGstPercentage,
                                UnitGstAmount: item.BatchDetails[batid].UnitGstAmount,
                                UnitInGstAmount: item.BatchDetails[batid].UnitInGstAmount,
                                UnitCGstAmount: item.BatchDetails[batid].UnitCGstAmount,
                                UnitSGstAmount: item.BatchDetails[batid].UnitSGstAmount,
                                GstAmount: 0.00,
                                InGstAmount: 0.00,
                                CGstAmount: 0.00,
                                SGstAmount: 0.00,
                                PurchaseUomId: item.BatchDetails[batid].PurchaseUomId,
                                BaseUomId: item.BatchDetails[batid].BaseUomId,
                                SaleUomId: item.BatchDetails[batid].SaleUomId,
                                ConversionQuantity: item.BatchDetails[batid].ConversionQuantity,
                                IsExpiry: item.BatchDetails[batid].IsExpiry,
                                IsSuspended: item.BatchDetails[batid].IsSuspended,
                                VendorMasterId: item.BatchDetails[batid].VendorMasterId,
                                GrnId: item.BatchDetails[batid].GrnId,
                                GrnDetailId: item.BatchDetails[batid].GrnDetailId,
                                StockEntryId: item.BatchDetails[batid].StockEntryId,
                                StockEntryDetailId: item.BatchDetails[batid].StockEntryDetailId,
                                FacilityId: item.BatchDetails[batid].FacilityId,
                                OrgId: item.BatchDetails[batid].OrgId,
                                GrossAmount: 0.00,
                                NetAmount: 0.00,
                                Status: 1
                            };

                            if (item.BatchDetails[batid].ExpiryDate === null) {
                                stocktransferDetail.HaveNoExpiry = true;
                                ExpiryDays = 0;
                                stocktransferDetail.ExpiryProceed = false;
                                stocktransferDetail.ExpiryAlert = false;
                                stocktransferDetail.ExpiryStop = false;
                                stocktransferDetail.ExpiryDate = '';
                            } else {
                                ExpiryDays = GetExpiryDays(item.BatchDetails[batid].ExpiryDate);
                                if (ExpiryDays <= $scope.item.ExpiryPriorStopDays) {
                                    stocktransferDetail.ExpiryStop = true;
                                } else if (ExpiryDays > $scope.item.ExpiryPriorStopDays && ExpiryDays <= $scope.item.ExpiryWarningDays) {
                                    stocktransferDetail.ExpiryAlert = true;
                                } else {
                                    stocktransferDetail.ExpiryProceed = true;
                                }

                                if (stocktransferDetail.ExpiryAlert) {
                                    stocktransferDetail.ExpiryDate = null;
                                    stocktransferDetail.ExpiryAlert = true;
                                    stocktransferDetail.ExpiryDate = item.BatchDetails[batid].ExpiryDate;
                                } else if (stocktransferDetail.ExpiryStop) {
                                    stocktransferDetail.ExpiryDate = null;
                                    stocktransferDetail.ExpiryStop = true;
                                    stocktransferDetail.ExpiryDate = item.BatchDetails[batid].ExpiryDate;
                                } else {
                                    stocktransferDetail.ExpiryDate = null;
                                    stocktransferDetail.ExpiryProceed = true;
                                    stocktransferDetail.ExpiryDate = item.BatchDetails[batid].ExpiryDate;
                                }
                            }

                            stocktransferDetail.GstAmount = parseFloat((parseFloat(stocktransferDetail.UnitGstAmount) * parseFloat(stocktransferDetail.TransferedQuantity)).toFixed(2));
                            stocktransferDetail.InGstAmount = parseFloat((parseFloat(stocktransferDetail.UnitInGstAmount) * parseFloat(stocktransferDetail.TransferedQuantity)).toFixed(2));
                            stocktransferDetail.CGstAmount = parseFloat((parseFloat(stocktransferDetail.UnitCGstAmount) * parseFloat(stocktransferDetail.TransferedQuantity)).toFixed(2));
                            stocktransferDetail.SGstAmount = parseFloat((parseFloat(stocktransferDetail.UnitSGstAmount) * parseFloat(stocktransferDetail.TransferedQuantity)).toFixed(2));
                            // stocktransferDetail.NetAmount = parseFloat((parseFloat(stocktransferDetail.MrPrice) * parseFloat(stocktransferDetail.TransferedQuantity)).toFixed(2));
                            stocktransferDetail.NetAmount = parseFloat((parseFloat(stocktransferDetail.UnitCostPrice) * parseFloat(stocktransferDetail.TransferedQuantity)).toFixed(2));
                            stocktransferDetail.GrossAmount = parseFloat((parseFloat(stocktransferDetail.UnitCostPrice) * parseFloat(stocktransferDetail.TransferedQuantity)).toFixed(2));

                            stocktransferDetail.BatchDetails = item.BatchDetails;
                            $scope.stocktransferDetails.push(stocktransferDetail);
                            item.TransferedQuantity = item.TransferedQuantity - item.BatchDetails[batid].Quantity;
                            savehitcompleted = 0;
                        }
                    }
                }

                $scope.TotalGrossAmount = 0;
                $scope.TotalDiscountAmount = 0;
                $scope.TotalGstAmount = 0;
                $scope.TotalInGstAmount = 0;
                $scope.TotalCGstAmount = 0;
                $scope.TotalSGstAmount = 0;
                $scope.TotalNetAmount = 0;
                calculatetotalAmount();

                $scope.addNewLineItem();
            }
        };

        $scope.custom_multi_sort = function (a, b) {
            var aExpiryDate = a.ExpiryDate;
            var bExpiryDate = b.ExpiryDate;
            var aQuantity = a.Quantity;
            var bQuantity = b.Quantity;

            if (aExpiryDate == bExpiryDate) {
                return (aQuantity < bQuantity) ? -1 : (aQuantity > bQuantity) ? 1 : 0;
            } else {
                return (aExpiryDate < bExpiryDate) ? -1 : 1;
            }
        };

        $scope.CheckBatchQty = function (item) {
            if (item.BatchId != "") {
                // if (item.BatchQuantity > 0) {
                //     if (parseInt(item.TransferedQuantity) > item.BatchQuantity) {
                //         utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.quantityalert.lbl'));
                //         item.TransferedQuantity = item.BatchQuantity;
                //     }
                // } else {
                //     utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.quantityalert.lbl'));
                //     item.TransferedQuantity = item.BatchQuantity;
                // }
                // } else {
                if (item.QuantityBeforeTransfer > 0) {
                    if (parseFloat(item.TransferedQuantity) > item.QuantityBeforeTransfer) {
                        utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.totalquantityalert.lbl'));
                        item.TransferedQuantity = 0;
                    }
                } else {
                    utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.totalquantityalert.lbl'));
                    item.TransferedQuantity = 0;
                }

                if (item.TransferedQuantity >= 0) {
                    item.AcceptedQuantity = item.TransferedQuantity;
                    $scope.computeAmount(item);
                }
            }
        };

        function GetExpiryDays(ExpiryDate) {
            var TodayDate = new Date().toISOString().slice(0, 10);
            var CurDate = new Date(TodayDate);

            var FutureDate = ExpiryDate.slice(0, 10);
            var ExpDate = new Date(FutureDate);

            var ExpiryDays = Math.round((ExpDate - CurDate) / (1000 * 60 * 60 * 24));
            return ExpiryDays;
        }

        $scope.computeAmount = function (item) {
            if (item) {
                if (parseFloat(item.TransferedQuantity) > 0) {
                    if (parseFloat(item.TransferedQuantity) > item.QuantityBeforeTransfer) {
                        if (item.StockTransfer && item.StockTransfer.TransferStatusId == 1) {
                            item.TransferedQuantity = 0;
                            utl.Alert.showErrorMsg($translate.instant('inventory.stockadjustmentform.qtygreateravailqty.lbl'));
                            return false;
                        }
                    }
                    item.AcceptedQuantity = parseFloat(item.TransferedQuantity);
                    item.GrossAmount = item.UnitCostPrice * parseFloat(item.TransferedQuantity);
                    item.NetAmount = item.UnitCostPrice * parseFloat(item.TransferedQuantity);
                } else {
                    if (parseFloat(item.TransferedQuantity) == 0) {
                        item.AcceptedQuantity = parseFloat(item.TransferedQuantity);
                        item.GrossAmount = item.UnitCostPrice * parseFloat(item.TransferedQuantity);
                        item.NetAmount = item.UnitCostPrice * parseFloat(item.TransferedQuantity);
                    }
                }
            }
            $scope.TotalGrossAmount = 0;
            $scope.TotalDiscountAmount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalInGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmount = 0;
            calculatetotalAmount();



        };

        function calculatetotalAmount() {
            $scope.TotalGrossAmount = 0;
            $scope.TotalDiscountAmount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalInGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmount = 0;
            for (var idx in $scope.stocktransferDetails) {
                var activeitem = $scope.stocktransferDetails[idx];
                if (activeitem.ItemMasterId > 0 && parseInt(activeitem.TransferedQuantity) > 0 && activeitem.Status == 1) {
                    $scope.TotalGrossAmount = parseFloat(($scope.TotalGrossAmount + parseFloat(activeitem.GrossAmount)).toFixed(4));
                    $scope.TotalDiscountAmount = parseFloat(($scope.TotalDiscountAmount + parseFloat(activeitem.DiscountAmount)).toFixed(4));
                    $scope.TotalGstAmount = parseFloat(($scope.TotalGstAmount + parseFloat(activeitem.GstAmount)).toFixed(4));
                    $scope.TotalInGstAmount = parseFloat(($scope.TotalInGstAmount + parseFloat(activeitem.InGstAmount)).toFixed(4));
                    $scope.TotalCGstAmount = parseFloat(($scope.TotalCGstAmount + parseFloat(activeitem.CGstAmount)).toFixed(4));
                    $scope.TotalSGstAmount = parseFloat(($scope.TotalSGstAmount + parseFloat(activeitem.SGstAmount)).toFixed(4));
                    $scope.TotalNetAmount = parseFloat(($scope.TotalNetAmount + parseFloat(activeitem.NetAmount)).toFixed(4));
                }
            }

            $scope.item.TotalGrossAmount = $scope.TotalGrossAmount;
            $scope.item.TotalDiscountAmount = $scope.TotalDiscountAmount;
            $scope.item.TotalGstAmount = $scope.TotalGstAmount;
            $scope.item.TotalInGstAmount = $scope.TotalInGstAmount;
            $scope.item.TotalCGstAmount = $scope.TotalCGstAmount;
            $scope.item.TotalSGstAmount = $scope.TotalSGstAmount;
            $scope.item.TotalNetAmount = $scope.TotalNetAmount;
        }

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
            // {
            //     header: 'Generic',
            //     field: 'GenericName',
            //     datatype: 'string',
            //     headercls: 'td-genericname',
            //     fieldcls: 'td-genericname'
            // },
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

            if ($scope.jssgrn == 1) {
                vm.stocktransferitemcontrolconfig.api = 'pharmacy/itemstoremap/GetItemsForStockTransfer';
                inputData = {
                    Params: [
                        {
                            Key: 11,
                            Value: $scope.item.ToStoreMasterId
                        },
                        {
                            Key: 1,
                            Value: $scope.item.StoreMasterId
                        },
                        {
                            Key: 13,
                            Value: 2
                        }
                    ],
                    PageContext: {
                        PageSize: 25,
                        PageNumber: 1
                    }
                };
            }
            if (vm.stocktransferitemcontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                if ($scope.jssgrn == 1) {
                    inputData.Params.push({
                        Key: 24,
                        Value: query
                    });
                } else {
                    inputData.Params.push({
                        Key: 1,
                        Value: query
                    });
                }
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
                if ($scope.jssgrn == 1) {
                    item.ManufacturerName = item.ItemMaster.ManufacturerName;
                }
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
                    if ($scope.jssgrn == 1) {
                        if (item.ItemMaster.StockItem && item.ItemMaster.StockItem.StockSerialItems.length > 0) {
                            var SumOfSerialQuantity = 0;
                            batchitems = item.ItemMaster.StockItem.StockSerialItems;
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
                        }
                    } else {
                        item.MyStoreQty = 0;
                    }

                }
                if (item.ToStoreStock !== null) {
                    item.ToStoreQty = (item.ToStoreStock) ? item.ToStoreStock.Quantity : 0;
                    if ($scope.jssgrn == 1) {
                        item.ToStoreQty = (item.ItemMaster.ToStoreStock) ? item.ItemMaster.ToStoreStock.Quantity : 0;
                    }
                } else {
                    item.ToStoreQty = 0;
                    if ($scope.jssgrn == 1) {
                        item.ToStoreQty = (item.ItemMaster.ToStoreStock) ? item.ItemMaster.ToStoreStock.Quantity : 0;
                    }
                }
                /*
                if (item.ItemMaster.ProductType !== null) {
                    item.ProductTypeName = item.ItemMaster.ProductType.ProductTypeName;
                } else {
                    item.ProductTypeName = '';
                }
                */
                /*
                if (item.ItemMaster.Manufacturer !== null) {
                    item.ManufacturerName = item.ItemMaster.Manufacturer.VendorName;
                } else {
                    item.ManufacturerName = '';
                }
                */
                /*
                 if (item.ItemMaster.StockItem !== null) {
                     item.MyStoreQty = item.ItemMaster.StockItem.Quantity;
                 } else {
                     item.MyStoreQty = 0;
                 }
                 if (item.ItemMaster.ToStoreStock !== null) {
                     item.ToStoreQty = item.ItemMaster.ToStoreStock.Quantity;
                 } else {
                     item.ToStoreQty = 0;
                 }
                 */
            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $('#btnTransfer').text("Transfer (F4)");
            $('#btnprint').text("Print (Alt + P)");
            $('#btndmprint').text("DMPrint (Alt + P)");
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.item.StoreMasterId === 0) {
                    for (var usidx in $scope.lookup.UserStores) {
                        if ($scope.lookup.UserStores[usidx].IsDefault) {
                            $scope.item.StoreId = $scope.lookup.UserStores[usidx].Id;
                            $scope.item.StoreMasterId = $scope.lookup.UserStores[usidx].Id;
                            $scope.item.StoreName = $scope.lookup.UserStores[usidx].StoreName;
                            if ($scope.lookup.UserStores[usidx].StoreMaster) {
                                $scope.item.ItemCategoryId = $scope.lookup.UserStores[usidx].StoreMaster.StoreTypeId;
                                $scope.item.StoreTypeId = $scope.lookup.UserStores[usidx].StoreMaster.StoreTypeId;
                                $scope.item.ExpiryWarningDays = $scope.lookup.UserStores[usidx].StoreMaster.ExpiryWarningDays;
                                $scope.item.ExpiryPriorStopDays = $scope.lookup.UserStores[usidx].StoreMaster.ExpiryPriorStopDays;
                            }
                        }
                    }
                    if ($scope.item.StoreMasterId === 0) {
                        $scope.item.StoreId = value[0].Id;
                        $scope.item.StoreMasterId = value[0].Id;
                        $scope.item.StoreName = value[0].StoreName;
                        if (value[0].StoreMaster) {
                            $scope.item.ItemCategoryId = value[0].StoreMaster.StoreTypeId;
                            $scope.item.StoreTypeId = value[0].StoreMaster.StoreTypeId;
                            $scope.item.ExpiryWarningDays = value[0].StoreMaster.ExpiryWarningDays;
                            $scope.item.ExpiryPriorStopDays = value[0].StoreMaster.ExpiryPriorStopDays;
                        }
                    }
                }
            });
        };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Facility"
            },
            {
                "Key": "ToStore",
                Request: {
                    Params: [{
                        Key: 7,
                        Value: 2
                    }, {
                        Key: 6,
                        Value: $scope.item.FacilityId
                    }]
                }
            },
            {
                "Key": "TransferType"
            },
            {
                "Key": "TransferStatus"
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
            }
            ];

            $scope.getLookUp(inputData);
            loadData();
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

        /* Stock Transfer DOT Matrix Print - Start */

        $scope.dmPrint = function () {
            if ($scope.dmprintpreferences != 1) {
                utl.Alert.showSuccessMsg($translate.instant('inventory.purchaseorder.successmsg.lbl'));
                return false;
            } else {

                var inputData = {
                    Id: $scope.currentcontext.id
                };
                var options = {
                    action: 'pharmacy/StockTransfer/DMPrintStockTransfer',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.dmPrintCallback

                };
                utl.Http.doAction(options);
            }
        };

        $scope.dmPrintCallback = function (scope, data, options, hasError) {
            console.log(data);
            var dmPrintInput = preparePrintData(data);
            $scope.printStockTransfer(dmPrintInput);
        };

        function preparePrintData(data) {
            console.log('preparePrintData starts');

            var vRequestedBy = '';
            var vApprovedBy = '';
            var vIssuedBy = '';
            var vStockPriority = '';
            var vtotalmrpamount = '';
            var vStoreheading1 = '';
            var vStoreheading2 = '';
            var vStoreheading3 = '';
            var vStoreheading4 = '';

            if (data.StockTransfer.RequestedUser) {
                if (data.StockTransfer.RequestedUser.Title)
                    vRequestedBy += data.StockTransfer.RequestedUser.Title.Description;
                if (data.StockTransfer.RequestedUser.FirstName)
                    vRequestedBy += ' ' + data.StockTransfer.RequestedUser.FirstName;
                if (data.StockTransfer.RequestedUser.LastName)
                    vRequestedBy += ' ' + data.StockTransfer.RequestedUser.LastName;
            }

            if (data.StockTransfer.ApprovedUser) {
                if (data.StockTransfer.ApprovedUser.Title)
                    vApprovedBy += data.StockTransfer.ApprovedUser.Title.Description;
                if (data.StockTransfer.ApprovedUser.FirstName)
                    vApprovedBy += ' ' + data.StockTransfer.ApprovedUser.FirstName;
                if (data.StockTransfer.ApprovedUser.LastName)
                    vApprovedBy += ' ' + data.StockTransfer.ApprovedUser.LastName;
            }

            if (data.StockTransfer.TranferedUser) {
                if (data.StockTransfer.TranferedUser.Title)
                    vIssuedBy += data.StockTransfer.TranferedUser.Title.Description;
                if (data.StockTransfer.TranferedUser.FirstName)
                    vIssuedBy += ' ' + data.StockTransfer.TranferedUser.FirstName;
                if (data.StockTransfer.TranferedUser.LastName)
                    vIssuedBy += ' ' + data.StockTransfer.TranferedUser.LastName;
            }

            if (data.StockTransfer.StockRequest) {
                if (data.StockTransfer.StockRequest.StockPriority) {
                    vStockPriority = data.StockTransfer.StockRequest.StockPriority;
                }
            }
            if (data.PrintData.heading1)
                vStoreheading1 = data.PrintData.heading1
            if (data.PrintData.heading2)
                vStoreheading2 = data.PrintData.heading2
            if (data.PrintData.heading3)
                vStoreheading3 = data.PrintData.heading3
            if (data.PrintData.heading4)
                vStoreheading4 = data.PrintData.heading4

            var dmPrintInput = {};

            dmPrintInput.header = {
                vfromstore: data.StockTransfer.FromStore.StoreName || '',
                vissueno: data.StockTransfer.TransferNumber || '',
                vrequestedby: vRequestedBy || '',
                vtostore: data.StockTransfer.ToStore.StoreName || '',
                vissuedate: utl.Formatter.getDateTimeString(data.StockTransfer.TransferDate) || '',
                vapprovedby: vApprovedBy || '',
                vpriority: vStockPriority || '',
                vissuedby: vIssuedBy || '',
                vrequestedno: data.StockTransfer.RequestNumber,
                vtotnetamt: data.StockTransfer.TotalNetAmount.toFixed(2),
                vtotalmrpamount: 0,
                vcomments: data.StockTransfer.TransfererComments,
                vStoreheading1: vStoreheading1,
                vStoreheading2: vStoreheading2,
                vStoreheading3: vStoreheading3,
                vStoreheading4: vStoreheading4,
            };


            dmPrintInput.lines = [];
            var islno = 1;
            var totmrpamt = 0;
            for (var idx in data.StockTransferDetail) {
                var stockTransferDetail = data.StockTransferDetail[idx];

                var expiryDate = stockTransferDetail.ExpiryDate ? utl.Formatter.formatDate(stockTransferDetail.ExpiryDate, 'MM/YY') : '';

                var TotalMrp = stockTransferDetail.TransferedQuantity * stockTransferDetail.MrPrice;

                totmrpamt += TotalMrp;

                var detail = {
                    ispace: ' ',
                    slno: islno++,
                    desc: stockTransferDetail.ItemName,
                    batchid: stockTransferDetail.BatchId,
                    expirydt: expiryDate || '',
                    transferqty: stockTransferDetail.TransferedQuantity,
                    UCP: stockTransferDetail.UnitCostPrice.toFixed(2),
                    mrpprice: stockTransferDetail.MrPrice.toFixed(2),
                    netamt: stockTransferDetail.NetAmount.toFixed(2),
                    TotalMrp: TotalMrp.toFixed(2),
                    netamount: stockTransferDetail.NetAmount.toFixed(2)
                };
                dmPrintInput.lines.push(detail);
            }

            dmPrintInput.header.vtotalmrpamount = totmrpamt.toFixed(2);

            console.log('preparePrintData ends');
            return dmPrintInput;
        }

        /* Stock Transfer DOT Matrix Print - End */

        $scope.moveHeaderFocus = function (nextId) {
            if (event.keyCode == 13) {
                if (nextId == 'tostoreid') {
                    $timeout(function () {
                        var uiSelect = angular.element(document.getElementById('transfertype'));
                        var uichild = uiSelect.controller('uiSelect');
                        uichild.focusser[0].focus();
                        uichild.activate();
                    }, 100);
                } else if (nextId == 'transfertype') {
                    var idx = $scope.stocktransferDetails.length - 1;
                    nextId = "desc" + '' + idx;
                    $('#' + nextId).focus();
                }
            }
        };

        $scope.moveFocus = function (nextId, prevId, downId, upId, index, event, item) {
            if (event.keyCode == 39) { // right
                nextId = nextId + index;
                $('#' + nextId).select();
                $('#' + nextId).focus();
            } else if (event.keyCode == 37) { // left
                prevId = prevId + index;
                $('#' + prevId).focus();
            } else if (event.keyCode == 38) { // Up
                if (upId == 'qty') {
                    upId = upId + (index - 1);
                    $('#' + upId).focus();
                } else if (upId == 'desc') {
                    if ($scope.autosearchpopup == 0) {
                        upId = upId + (index - 1);
                        $('#' + upId).focus();
                    }
                }
            } else if (event.keyCode == 40) { // Down
                downId = downId + (index + 1);
                $('#' + downId).focus();
            }
            if (event.keyCode == 13) {
                if (nextId == 'desc') {
                    $scope.ChooseBatches(index, item);
                    var activeRecords = $scope.getActiveRecord();
                    var idx = activeRecords.length - 1;
                    nextId = "desc" + '' + idx;
                    if (idx == (index)) {
                        nextId = "btnTransfer";
                        $('#' + nextId).focus();
                    } else {
                        $timeout(function () {
                            $('#' + nextId).focus();
                        }, 100);
                    }
                } else if (nextId == 'qty') {
                    savehitcompleted = 0;
                    nextId = nextId + index;
                    $('#' + nextId).select();
                    $('#' + nextId).focus();
                } else if (nextId == 'batchid') {
                    $timeout(function () {
                        nextId = nextId + index;
                        var uiSelect = angular.element(document.getElementById(nextId));
                        var uichild = uiSelect.controller('uiSelect');
                        uichild.focusser[0].focus();
                        uichild.activate();
                    }, 100);
                }
            }
            if (event.key == "Delete" && event.keyCode == 46) {
                $scope.onDeleteConfirmed(item);
                $timeout(function () {
                    var activeRecords = $scope.getActiveRecord();
                    var idx = activeRecords.length - 1;
                    nextId = "desc" + '' + idx;
                    $('#' + nextId).focus();
                }, 100);
            }
        };

        $scope.getActiveRecord = function () {
            var activeRecords = $filter('filterArrayItems')($scope.stocktransferDetails, [{
                search: 1,
                fields: ['Status']
            }]);

            return activeRecords;
        };

        $scope.ValidQty = function (nextId) {
            if ($('#' + nextId).val() === '')
                $('#' + nextId).val(0);
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.getPharmacyPrintPreference = function () {
            $scope.dmprintpreferences =
                utl.FacilitySetting.getFacilitySettingValue('dmprint', 'pharmacydmprintenable');

            $scope.dmprintpreferences =
                utl.FacilitySetting.getFacilitySettingValue('print', 'laserprintenable');

            if ($scope.dmprintpreferences)
                if ($scope.dmprintpreferences <= 0)
                    $('#btndmprint').hide();


            if ($scope.printpreferences)
                if ($scope.printpreferences <= 0)
                    $('#btnprint').hide();

        };

        $scope.getPharmacyPrintPreference();
        $scope.initLookup();

        $scope.numberonly = function (e) {
            if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
                // Allow: Ctrl+A, Command+A
                (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                // Allow: home, end, left, right, down, up
                (e.keyCode >= 35 && e.keyCode <= 40)) {
                // Let it happen, don't do anything
                return;
            }
            // Ensure that it is a number and stop the keypress && (e.keyCode < 96 || e.keyCode > 105)
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57))) {
                e.preventDefault();
            }
        };

        /* Pharmacy  Sales - Shortcut Keys - Start */
        function keyupHandler(e) {
            var kCode = e.keyCode;
            if (kCode == 115 && savehitcompleted === 0 && $scope.canShowTransferBtn) { // F2  - SaveAndApprove
                $scope.Transfer();
            }
            if (kCode == 118) { // F7  - New Page
                $scope.addNew();
            }
            if (e.altKey && kCode == 65 && savehitcompleted === 0 && $scope.canShowTransferBtn) { // alt + s  - SaveAndApprove
                $scope.Transfer();
            }
            if (e.altKey && kCode == 80) { // alt + p  - DMPrint
                if ($scope.dmprintpreferences > 0) {
                    $scope.dmPrint();
                } else {
                    $scope.print();
                }
            }
            if (kCode == 27) { // Esc
                $scope.autosearchpopup = 0;
            }
        }

        angular.element(document).on('keydown', keyupHandler);

        $scope.$on('$destroy', function () {
            angular.element(document).off('keydown', keyupHandler);
        });
        $scope.checkHeader = function (iVal) {
            if (iVal == 1) {
                $scope.item.WithoutHeader = false;
            }
            if (iVal == 2) {
                $scope.item.WithHeader = false;
            }
        };
        /* Pharmacy  Sales - Shortcut Keys - End */
    }
    StockTransferFormController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', 'modalConfig', '$timeout'];
})();