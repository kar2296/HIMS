(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('StocktransferFormController', StocktransferFormController);

    function StocktransferFormController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));

        $scope.tabindexmap = {
            patienttabindex: 1,
            detailtabindex: 2
        };
        // $scope.itemexactsearch = 0;
        // $scope.itemexactsearch =
        //     (utl.FacilitySetting.getFacilitySettingValue('general', 'itemexactsearch')) ? utl.FacilitySetting.getFacilitySettingValue('general', 'itemexactsearch') : 0;
        $scope.jssgrn = 0;
        $scope.jssgrn =
            (utl.FacilitySetting.getFacilitySettingValue('billing', 'isjssgrn')) ? utl.FacilitySetting.getFacilitySettingValue('billing', 'isjssgrn') : 0;
        $scope.stockissuedirecttransfer = 0;
        $scope.stockissuedirecttransfer =
            (utl.FacilitySetting.getFacilitySettingValue('billing', 'stockissuedirecttransfer')) ? utl.FacilitySetting.getFacilitySettingValue('billing', 'stockissuedirecttransfer') : 0;
        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            ToFacilityId: 0,
            StoreMasterId: 0,
            StoreTypeId: 0,
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

        $scope.currentrequest = {
            Id: -1,
            RequestStatusId: -1
        };

        $scope.currentcontext = {
            id: -1,
            stockrequestid: -1,
            stocktransferid: -1,
            storemasterid: -1,
            attachmentcount: 0,
        };


        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.stockrequestid = $state.params.StockRequestId;
        $scope.currentcontext.stocktransferid = $state.params.StockTransferId;
        if ($scope.currentcontext.stocktransferid > 0) {
            $scope.item.StockTransferId = $scope.currentcontext.stocktransferid;
            $scope.item.Id = $scope.currentcontext.stocktransferid;
        }
        $scope.currentcontext.storemasterid = $state.params.StoreMasterId;
        $scope.currentcontext.reqstoremasterid = $state.params.tostoreid;
        $scope.item.TransferDate = utl.Formatter.getCurrentDate();
        $scope.item.StoreName = '';
        $scope.currentcontext.issueqty = $state.params.issueqty;
        $scope.stocktransferDetails = [];

        $scope.canShowPrintBtn = true;
        $scope.canShowSaveBtn = true;
        $scope.canShowTransferBtn = true;
        $scope.canShowAuthorizeBtn = true;
        $scope.canShowClearBtn = true;
        $scope.canShowCancelBtn = true;
        $scope.canShowCompleteBtn = false;
        $scope.canShowbfrTransPrint = true;

        $scope.openAttachments = function () {
            if ($scope.currentcontext.id > 0) {
                utl.Modal.open('app.patientattachments', {
                    params: {
                        pid: $scope.currentcontext.id,
                        itemid: $scope.item.Id,
                        objecttypeid: 3
                    },
                    confirmCallback: $scope.getPatientAttachments,
                    cancelCallback: $scope.getPatientAttachments
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('inventory.purchaseorder.saveguarantor.lbl'));
            }
        };

        $scope.getPatientAttachmentsCallback = function (scope, res, options, hasError) {
            $scope.currentcontext.attachmentcount = res.PageContext.TotalRecords;
        };

        $scope.getPatientAttachments = function () {
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.currentcontext.id
                }, {
                    Key: 3,
                    Value: 3
                }],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'registration/PatientAttachment/GetPatientAttachments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientAttachmentsCallback
            };
            utl.Http.doAction(options);
        };

        $scope.applyVisibilityRules = function () {
            // New
            if ($scope.item.TransferStatusId != 1 || $scope.item.TransferStatusId != 2 || $scope.item.TransferStatusId != 3 || $scope.item.TransferStatusId != 4 || $scope.item.TransferStatusId != 5) {
                $scope.canShowPrintBtn = false;
                $scope.canShowSaveBtn = true;
                $scope.canShowTransferBtn = true;
                $scope.canShowDeleteBtn = true;
                $scope.canShowClearBtn = true;
                $scope.canShowCancelBtn = true;
                $scope.canShowAuthorizeBtn = false;
            }
            // When In Draft Status
            if ($scope.item.TransferStatusId == 1) {
                $scope.canShowPrintBtn = false;
                $scope.canShowSaveBtn = true;
                $scope.canShowTransferBtn = true;
                // $scope.canShowbfrTransPrint = false;
                $scope.canShowDeleteBtn = true;
                $scope.canShowClearBtn = true;
                $scope.canShowCancelBtn = false;
                $scope.canShowAuthorizeBtn = false;
            }
            // When In Approved Status
            if ($scope.item.TransferStatusId == 2) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowTransferBtn = false;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowDeleteBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = true;
                $scope.canShowbfrTransPrint = false;
            }
            // When In Authorized Status
            if ($scope.item.TransferStatusId == 3) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowTransferBtn = false;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowDeleteBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = true;
            }
            // When In Completed Status
            if ($scope.item.TransferStatusId == 4) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowTransferBtn = false;
                $scope.canShowAuthorizeBtn = true;
                $scope.canShowDeleteBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
            }
            // When In Cancelled Status
            if ($scope.item.TransferStatusId == 5) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowTransferBtn = false;
                $scope.canShowDeleteBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
            }
        };
        console.log($scope.item.RequestStatusId, 'log');
        $scope.addNewLineItem = function () {
            var stocktransferDetail = {
                Id: 0,
                SNo: 0,
                StockRequestDetailId: 0,
                StoreMasterId: 0,
                BarCodeId: '',
                ItemMasterId: 0,
                ItemCode: '',
                ItemName: '',
                BaseUom: {
                    Id: 0,
                    UomCode: ''
                },
                BaseUomId: 0,
                PurchaseUomId: 0,
                PurchaseUom: {
                    Id: 0,
                    UomCode: ''
                },
                SaleUomId: 0,
                SaleUom: {
                    Id: 0,
                    UomCode: ''
                },
                RequestedQuantity: 0,
                IssuedQuantity: 0,
                TransferedQuantity: 0,
                TransitQuantity: 0,
                QuantityBeforeTransfer: 0,
                TotalAvailableQuantity: 0,
                BatchQuantity: 0,
                BalanceRequestedQuantity: 0,
                UomPrice: 0,
                PurchasePrice: 0,
                DiscountModeId: 0,
                Discount: 0,
                UomDiscountAmount: 0,
                DiscountAmount: 0,
                UomPriceAfterDiscount: 0,
                PurchasePriceAfterDiscount: 0,
                GstMaster: {
                    Id: 0,
                    GstCode: '',
                    GstName: '',
                    GstPercentage: ''
                },
                GstId: 0,
                GstPercentage: 0,
                UnitGstAmount: 0,
                GstAmount: 0,
                InGstMaster: {
                    Id: 0,
                    GstCode: '',
                    GstName: '',
                    GstPercentage: ''
                },
                InGstId: 0,
                InGstPercentage: 0,
                InUnitGstAmount: 0,
                InGstAmount: 0,
                CGstMaster: {
                    Id: 0,
                    GstCode: '',
                    GstName: '',
                    GstPercentage: ''
                },
                CGstId: 0,
                CGstPercentage: 0,
                CUnitGstAmount: 0,
                CGstAmount: 0,
                SGstMaster: {
                    Id: 0,
                    GstCode: '',
                    GstName: '',
                    GstPercentage: ''
                },
                SGstId: 0,
                SGstPercentage: 0,
                SUnitGstAmount: 0,
                SGstAmount: 0,
                UnitCostPrice: 0,
                MrPrice: 0,
                GrossAmount: 0.00,
                NetAmount: 0.00,
                BatchDetails: [],
                BatchDetail: {
                    Id: 0,
                    StockItemId: 0,
                    ItemMasterId: 0,
                    StoreMasterId: 0,
                    BatchId: '',
                    Quantity: 0,
                    ExpiryDate: null,
                    Ucp: 0,
                    Mrp: 0,
                    Rev: 0,
                    SerialDetails: null
                },
                StockSerialItemId: 0,
                StockSerialItemRev: 0,
                StockItemId: 0,
                StockItemRev: 0,
                BatchId: '',
                Quantity: 0,
                ExpiryDate: null,
                HaveExpiry: false,
                HaveNoExpiry: false,
                Ucp: 0,
                Mrp: 0,
                ConversionQuantity: 0,
                IsExpiry: false,
                IsSuspended: false,
                ManufacturerId: 0,
                VendorMasterId: 0,
                GrnDetailId: 0,
                GrnId: 0,
                StockEntryDetailId: 0,
                StockEntryId: 0,
                FacilityId: 0,
                OrgId: 0,
                Status: 1,
                IsFullyIssued: false,
                tabindex: $scope.tabindexmap.detailtabindex++
            };

            if ($scope.currentcontext.id > 0) {
                stocktransferDetail.StockTransferId = $scope.currentcontext.id;
            }
            $scope.stocktransferDetails.push(stocktransferDetail);
            $scope.setIndexforTableIndex();
        };

        $scope.Clear = function () {
            $scope.stocktransferDetails = [];
            $scope.addNewLineItem();
        };

        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.stocktransferid,
                Data: {
                    isprint: false,
                    withHeader: $scope.item.WithHeader,
                    withoutHeader: $scope.item.WithoutHeader,
                    issueqty: true,
                }
            };
            var options = {
                action: 'pharmacy/StockTransfer/PrintStockTransfer',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.printwithoutIssue = function () {
            var inputData = {
                Id: $scope.currentcontext.stockrequestid,
                Data: {
                    isprint: false,
                    withHeader: $scope.item.WithHeader,
                    withoutHeader: $scope.item.WithoutHeader,
                    issueqty: false,
                    storemasterid: $scope.currentcontext.storemasterid
                }
            };
            var options = {
                action: 'pharmacy/StockRequest/PrintStockReqBeforeTransfer',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.history = function (HistoryId) {
            utl.Modal.open('app.transferhistory', {});
        };

        $scope.History = function (item, idx) {
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

        $scope.Stock = function (selectedItem, idx) {
            utl.Modal.open('app.stockdetails', {
                params: {
                    itemmasterid: selectedItem.ItemMasterId,
                    itemcode: selectedItem.ItemCode,
                    itemname: selectedItem.ItemName
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;

            $scope.TotalGrossAmount = 0;
            $scope.TotalNetAmount = 0;

            calculatetotalAmount();
            $scope.setIndexforTableIndex();
        };

        $scope.deleteStockTransferDetail = function (idx, item) {
            var name = "this item" || '';
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
            $scope.setIndexforTableIndex();
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
            $scope.stocktransferDetails = res.Data || [];
            for (var idx in $scope.stocktransferDetails) {
                var transferitem = $scope.stocktransferDetails[idx];
                if (transferitem.ItemMasterId > 0) {
                    transferitem.IssuedQuantity = transferitem.TransferedQuantity;
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
                    var TransfBatchDetail = {
                        Id: 0,
                        StockItemId: 0,
                        ItemMasterId: 0,
                        StoreMasterId: 0,
                        BatchId: '',
                        Quantity: 0,
                        ExpiryDate: null,
                        HaveExpiry: false,
                        HaveNoExpiry: false,
                        Ucp: 0,
                        Mrp: 0,
                        GstId: 0,
                        GstPercentage: 0,
                        InGstId: 0,
                        InGstPercentage: 0,
                        CGstId: 0,
                        CGstPercentage: 0,
                        SGstId: 0,
                        SGstPercentage: 0,
                        SerialDetails: null
                    };
                    transferitem.BatchDetails = [];
                    TransfBatchDetail.BatchId = transferitem.BatchId;
                    transferitem.BatchDetails.push(TransfBatchDetail);
                }
            }
            // $scope.computeAmount();
            calculatetotalAmount();
            $scope.setIndexforTableIndex();
        };

        $scope.getStockTransferDetails = function (pageNo) {
            if ($scope.currentcontext.stocktransferid && $scope.currentcontext.stocktransferid > 0) {
                var inputData = {
                    Params: [{
                        Key: 1,
                        Value: $scope.currentcontext.stocktransferid
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
            }
        };

        $scope.getStockTransferCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            if (data.TransferStatusId == 1) {
                $scope.item.ReadOnly = true;
                $scope.item.isDisabled = false;
                $scope.item.DisplayTransferStatus = 'Draft';
            }
            if (data.TransferStatusId == 2) {
                $scope.item.ReadOnly = true;
                $scope.item.isDisabled = true;
                $scope.item.DisplayTransferStatus = 'Approved';
            }
            if (data.TransferStatusId == 3) {
                $scope.item.ReadOnly = true;
                $scope.item.isDisabled = true;
                $scope.item.DisplayTransferStatus = 'Authorized';
            }
            if (data.TransferStatusId == 4) {
                $scope.item.ReadOnly = true;
                $scope.item.isDisabled = true;
                $scope.item.DisplayTransferStatus = 'Completed';
            }
            if (data.TransferStatusId == 5) {
                $scope.item.ReadOnly = true;
                $scope.item.isDisabled = true;
                $scope.item.DisplayTransferStatus = 'Cancelled';
            }
            $scope.applyVisibilityRules();
        };

        $scope.getStockTransferById = function () {
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
            } else {
                $scope.applyVisibilityRules();
            }
        };

        $scope.getStockTransfer = function () {
            $scope.item.StockTransferId = $scope.currentcontext.stocktransferid;
            $scope.getStockTransferById();
            $scope.getStockTransferDetails();
        };

        $scope.getStockRequest = function () {
            $scope.item.StockRequestId = $scope.currentcontext.id;
            $scope.currentcontext.stockrequestid = $scope.currentcontext.id;
            $scope.getStockRequestById();
            $scope.getStockRequestDetails();
            $scope.applyVisibilityRules();
        };

        $scope.getStockRequestById = function () {
            if ($scope.currentcontext.stockrequestid && $scope.currentcontext.stockrequestid > 0) {
                var options = {
                    action: 'pharmacy/stockrequest/GetStockRequestById',
                    data: {
                        Id: $scope.currentcontext.stockrequestid
                    },
                    type: 'post',
                    onComplete: $scope.getStockRequestCallback
                };
                utl.Http.doAction(options);
            } else { }
        };

        $scope.getStockRequestCallback = function (scope, data, options, hasError) {
            var result = data;

            $scope.item.StockRequestId = result.StockRequestId;
            $scope.item.RequestStatusId = result.RequestStatusId;
            $scope.item.RequestNumber = result.RequestNumber;
            $scope.item.RequestedBy = result.RequestedBy;
            $scope.item.RequestedDate = result.RequestedDate;
            $scope.item.StoreMasterId = result.ToStoreMasterId;
            $scope.item.StoreName = result.ToStore.StoreName;
            $scope.RequestedBy = '';
            if (result.RequestedUser.Title.Description)
                $scope.RequestedBy = result.RequestedUser.Title.Description;
            if (result.RequestedUser.FirstName)
                $scope.RequestedBy += ' ' + result.RequestedUser.FirstName;
            if (result.RequestedUser.LastName)
                $scope.RequestedBy += ' ' + result.RequestedUser.LastName;
            // $scope.item.StoreName = result.ToStore.StoreName;
            $scope.item.ToStoreMasterId = result.StoreMasterId;
            $scope.item.ToStoreName = result.FromStore.StoreName;
            $scope.item.ToFacilityId = result.ToFacilityId;
            $scope.item.TotalGrossAmount = 0;
            $scope.item.TotalNetAmount = 0;

            if (result.RequestStatusId == 4) {
                $scope.canShowCompleteBtn = true;
                $scope.canShowPrintBtn = true;
                $scope.canShowbfrTransPrint = false;
            }
            if (result.RequestStatusId == 5) {
                $scope.canShowPrintBtn = true;
                $scope.canShowTransferBtn = false;
                $scope.canShowbfrTransPrint = false;
            }
        };

        $scope.getStockRequestDetails = function () {
            if ($scope.item.StockRequestId && $scope.item.StockRequestId > 0) {
                var inputData = {
                    Params: [{
                        Key: 1,
                        Value: $scope.currentcontext.stockrequestid
                    }, {
                        Key: 3,
                        Value: $scope.currentcontext.storemasterid
                    },
                    {
                        Key: 4,
                        Value: $scope.currentcontext.reqstoremasterid
                    }
                    ],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };

                var options = {
                    action: 'pharmacy/stockrequestdetail/GetStockRequestDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getStockRequestDetailsCallback
                };
                utl.Http.doAction(options);
            } else { }
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
        /*
        $scope.getStockRequestDetailsCallback = function(scope, res, options, hasError) {
            $scope.stocktransferDetails = res.Data || [];
            for (var idx in $scope.stocktransferDetails) {
                var sritem = $scope.stocktransferDetails[idx];
                if (sritem.ItemMasterId > 0) {
                    sritem.StockRequestDetailId = sritem.Id;
                    sritem.Id = 0;
                    sritem.IssuedQuantity = sritem.TransferedQuantity;
                    if (sritem.ItemMaster.StockItem !== null) {
                        var stockserialitems = null;
                        sritem.TotalAvailableQuantity = sritem.ItemMaster.StockItem.Quantity;
                        if (sritem.ItemMaster.StockItem.StockSerialItems.length > 0) {
                            stockserialitems = sritem.ItemMaster.StockItem.StockSerialItems;
                            for (var batid = 0; batid < stockserialitems.length; batid++) {
                                var serialitem = stockserialitems[batid];
                                serialitem.SerialDetails = [
                                    ' Batch: ', serialitem.BatchId,
                                    ' | Qty: ', serialitem.Quantity,
                                    ' | Expiry: ', serialitem.ExpiryDate,
                                    ' | UCP: ', serialitem.Ucp,
                                    ' | MRP: ', serialitem.Mrp
                                ].join(' ');
                            }

                            sritem.BatchDetails = sritem.ItemMaster.StockItem.StockSerialItems;
                            sritem.StockItemId = sritem.BatchDetails[0].StockItemId;
                            sritem.StockSerialItemId = sritem.BatchDetails[0].Id;
                            sritem.BatchId = sritem.BatchDetails[0].BatchId;
                            sritem.ExpiryDate = sritem.BatchDetails[0].ExpiryDate;
                            sritem.QuantityBeforeTransfer = sritem.BatchDetails[0].Quantity;
                            sritem.BatchQuantity = sritem.BatchDetails[0].Quantity;
                            if (sritem.BatchQuantity >= (sritem.RequestedQuantity - sritem.IssuedQuantity)) {
                                sritem.TransferedQuantity = sritem.RequestedQuantity - sritem.IssuedQuantity;
                                sritem.TransitQuantity = sritem.TransferedQuantity;
                            } else {
                                sritem.TransferedQuantity = sritem.BatchQuantity;
                                sritem.TransitQuantity = sritem.TransferedQuantity;
                            }
                            sritem.PurchasePrice = sritem.BatchDetails[0].Ucp;
                            sritem.UnitCostPrice = sritem.BatchDetails[0].Ucp;
                            sritem.MrPrice = sritem.BatchDetails[0].Mrp;

                            sritem.GstId = sritem.BatchDetails[0].GstId;
                            sritem.GstPercentage = sritem.BatchDetails[0].GstPercentage;

                            sritem.InGstId = sritem.BatchDetails[0].InGstId;
                            sritem.InGstPercentage = sritem.BatchDetails[0].InGstPercentage;

                            sritem.CGstId = sritem.BatchDetails[0].CGstId;
                            sritem.CGstPercentage = sritem.BatchDetails[0].CGstPercentage;

                            sritem.SGstId = sritem.BatchDetails[0].SGstId;
                            sritem.SGstPercentage = sritem.BatchDetails[0].SGstPercentage;

                            sritem.GrossAmount = sritem.TransferedQuantity * sritem.UnitCostPrice;
                            sritem.NetAmount = sritem.TransferedQuantity * sritem.UnitCostPrice;
                        }
                    } else {
                        sritem.TotalAvailableQuantity = 0;
                        sritem.QuantityBeforeTransfer = 0;
                    }


                    if (sritem.IssuedQuantity >= sritem.RequestedQuantity) {
                        sritem.IsFullyIssued = true;
                    }

                }
            }
            $scope.TotalGrossAmount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalNetAmount = 0;
            calculatetotalAmount();
        };
        */

        $scope.getStockRequestDetailsCallback = function (scope, res, options, hasError) {
            $scope.stockrequestDetails = res.Data || [];
            var stocktransferDetail = {};
            for (var sridx in $scope.stockrequestDetails) {
                var ReqQty = 0;
                var sritem = $scope.stockrequestDetails[sridx];
                if (sritem.ItemMasterId > 0) {
                    ReqQty = sritem.RequestedQuantity;
                    if (sritem.RequestedQuantity > 0 && (sritem.TransferedQuantity == sritem.RequestedQuantity)) {
                        // if (sritem.RequestedQuantity > 0 && (sritem.TransferedQuantity != 0)) {

                        for (var tdidx in sritem.StockTransferDetails) {
                            stocktransferDetail = sritem.StockTransferDetails[tdidx];
                            stocktransferDetail.IssuedQuantity = stocktransferDetail.TransferedQuantity;

                            if (stocktransferDetail.ExpiryDate === null) {
                                stocktransferDetail.HaveNoExpiry = true;
                                stocktransferDetail.ExpiryDate = '';
                            } else {
                                stocktransferDetail.HaveExpiry = true;
                            }
                            if (stocktransferDetail.StockItem) {
                                stocktransferDetail.TotalAvailableQuantity = stocktransferDetail.StockItem.Quantity;
                            } else {
                                stocktransferDetail.TotalAvailableQuantity = 0;
                            }
                            if (stocktransferDetail.StockSerialItem) {
                                stocktransferDetail.QuantityBeforeTransfer = stocktransferDetail.StockSerialItem.Quantity;
                            } else {
                                stocktransferDetail.QuantityBeforeTransfer = 0;
                            }
                            var TransfBatchDetail = {
                                Id: 0,
                                StockItemId: 0,
                                ItemMasterId: 0,
                                StoreMasterId: 0,
                                BatchId: '',
                                Quantity: 0,
                                ExpiryDate: null,
                                HaveExpiry: false,
                                HaveNoExpiry: false,
                                Ucp: 0,
                                Mrp: 0,
                                GstId: 0,
                                GstPercentage: 0,
                                InGstId: 0,
                                InGstPercentage: 0,
                                CGstId: 0,
                                CGstPercentage: 0,
                                SGstId: 0,
                                SGstPercentage: 0,
                                SerialDetails: null
                            };
                            stocktransferDetail.BatchDetails = [];
                            TransfBatchDetail.BatchId = stocktransferDetail.BatchId;
                            stocktransferDetail.BatchDetails.push(TransfBatchDetail);
                            $scope.stocktransferDetails.push(stocktransferDetail);
                        }

                    } else {

                        if (sritem.TransferedQuantity > 0) {
                            ReqQty = ReqQty - sritem.TransferedQuantity;
                            for (var tdidx in sritem.StockTransferDetails) {
                                stocktransferDetail = sritem.StockTransferDetails[tdidx];
                                stocktransferDetail.IssuedQuantity = stocktransferDetail.TransferedQuantity;

                                if (stocktransferDetail.ExpiryDate === null) {
                                    stocktransferDetail.HaveNoExpiry = true;
                                    stocktransferDetail.ExpiryDate = '';
                                } else {
                                    stocktransferDetail.HaveExpiry = true;
                                }
                                if (stocktransferDetail.StockItem) {
                                    stocktransferDetail.TotalAvailableQuantity = stocktransferDetail.StockItem.Quantity;
                                } else {
                                    stocktransferDetail.TotalAvailableQuantity = 0;
                                }
                                if (stocktransferDetail.StockSerialItem) {
                                    stocktransferDetail.QuantityBeforeTransfer = stocktransferDetail.StockSerialItem.Quantity;
                                } else {
                                    stocktransferDetail.QuantityBeforeTransfer = 0;
                                }
                                var TransfBatchDetail = {
                                    Id: 0,
                                    StockItemId: 0,
                                    ItemMasterId: 0,
                                    StoreMasterId: 0,
                                    BatchId: '',
                                    Quantity: 0,
                                    ExpiryDate: null,
                                    HaveExpiry: false,
                                    HaveNoExpiry: false,
                                    Ucp: 0,
                                    Mrp: 0,
                                    GstId: 0,
                                    GstPercentage: 0,
                                    InGstId: 0,
                                    InGstPercentage: 0,
                                    CGstId: 0,
                                    CGstPercentage: 0,
                                    SGstId: 0,
                                    SGstPercentage: 0,
                                    SerialDetails: null
                                };
                                stocktransferDetail.BatchDetails = [];
                                TransfBatchDetail.BatchId = stocktransferDetail.BatchId;
                                stocktransferDetail.BatchDetails.push(TransfBatchDetail);
                                $scope.stocktransferDetails.push(stocktransferDetail);
                            }
                        } else {
                            ReqQty = ReqQty;
                        }
                        sritem.BalanceRequestedQuantity = ReqQty;
                        if (ReqQty > 0) {
                            if (sritem.ItemMaster.StockItem !== null && (sritem.ItemMaster.StockItem && sritem.ItemMaster.StockItem.Quantity > 0)) {
                                var stockserialitems = null;
                                if (sritem.ItemMaster.StockItem.StockSerialItems.length > 0) {
                                    stockserialitems = sritem.ItemMaster.StockItem.StockSerialItems;
                                    stockserialitems.sort($scope.custom_multi_sort);
                                    for (var batid = 0; batid < stockserialitems.length; batid++) {
                                        sritem.TotalAvailableQuantity = sritem.ItemMaster.StockItem.Quantity;
                                        sritem.StockItemRev = sritem.ItemMaster.StockItem.Rev;
                                        var reqStockItemId = 0;
                                        if (sritem.ItemMaster.ReqStoreStock) {
                                            reqStockItemId = sritem.ItemMaster.ReqStoreStock.Id;
                                        }

                                        // if (sritem.TransferedQuantity > 0) {
                                        //     ReqQty = ReqQty - sritem.TransferedQuantity;
                                        // } else {
                                        //     ReqQty = ReqQty;
                                        // }
                                        if (ReqQty > 0)
                                            if (stockserialitems[batid].Quantity >= ReqQty) {
                                                stocktransferDetail = {
                                                    Id: 0,
                                                    StockRequestDetailId: sritem.Id,
                                                    ItemMasterId: sritem.ItemMasterId,
                                                    ItemCode: sritem.ItemCode,
                                                    ItemName: sritem.ItemName,
                                                    TotalAvailableQuantity: (sritem.ItemMaster.StockItem) ? sritem.ItemMaster.StockItem.Quantity : 0,
                                                    QuantityBeforeTransfer: stockserialitems[batid].Quantity,
                                                    BatchQuantity: stockserialitems[batid].Quantity,
                                                    RequestedQuantity: sritem.RequestedQuantity,
                                                    IssuedQuantity: sritem.TransferedQuantity,
                                                    // TransferedQuantity: 0,//for jss hospital vidya change
                                                    TransferedQuantity: ReqQty, //for jss hospital vidya change
                                                    // TransitQuantity: ReqQty - sritem.TransferedQuantity,
                                                    TransitQuantity: ReqQty,
                                                    BatchId: stockserialitems[batid].BatchId,
                                                    ExpiryDate: null,
                                                    HaveExpiry: false,
                                                    HaveNoExpiry: false,
                                                    UomPrice: stockserialitems[batid].UomPrice,
                                                    PurchasePrice: stockserialitems[batid].PurchasePrice,
                                                    UnitCostPrice: stockserialitems[batid].Ucp,
                                                    Ucp: stockserialitems[batid].Ucp,
                                                    Mrp: stockserialitems[batid].Mrp,
                                                    MrPrice: stockserialitems[batid].Mrp,
                                                    DiscountModeId: stockserialitems[batid].DiscountModeId,
                                                    Discount: stockserialitems[batid].Discount,
                                                    UomDiscountAmount: stockserialitems[batid].UomDiscountAmount,
                                                    DiscountAmount: stockserialitems[batid].DiscountAmount,
                                                    UomPriceAfterDiscount: stockserialitems[batid].UomPriceAfterDiscount,
                                                    PurchasePriceAfterDiscount: stockserialitems[batid].PurchasePriceAfterDiscount,
                                                    GrossAmount: ReqQty * stockserialitems[batid].Ucp,
                                                    NetAmount: ReqQty * stockserialitems[batid].Ucp,
                                                    BarCodeId: stockserialitems[batid].BarCodeId,
                                                    StockItemId: stockserialitems[batid].StockItemId,
                                                    StockSerialItemId: stockserialitems[batid].Id,
                                                    StockSerialItemRev: stockserialitems[batid].Rev,
                                                    GstId: stockserialitems[batid].GstId,
                                                    GstPercentage: stockserialitems[batid].GstPercentage,
                                                    GstAmount: stockserialitems[batid].GstAmount,
                                                    UnitGstAmount: stockserialitems[batid].UnitGstAmount,
                                                    InGstId: stockserialitems[batid].InGstId,
                                                    InGstPercentage: stockserialitems[batid].InGstPercentage,
                                                    InGstAmount: stockserialitems[batid].InGstAmount,
                                                    UnitInGstAmount: stockserialitems[batid].UnitInGstAmount,
                                                    CGstId: stockserialitems[batid].CGstId,
                                                    CGstPercentage: stockserialitems[batid].CGstPercentage,
                                                    CGstAmount: stockserialitems[batid].CGstAmount,
                                                    UnitCGstAmount: stockserialitems[batid].UnitCGstAmount,
                                                    SGstId: stockserialitems[batid].SGstId,
                                                    SGstPercentage: stockserialitems[batid].SGstPercentage,
                                                    SGstAmount: stockserialitems[batid].SGstAmount,
                                                    UnitSGstAmount: stockserialitems[batid].UnitSGstAmount,
                                                    BaseUomId: stockserialitems[batid].BaseUomId,
                                                    PurchaseUomId: stockserialitems[batid].PurchaseUomId,
                                                    SaleUomId: stockserialitems[batid].SaleUomId,
                                                    ConversionQuantity: stockserialitems[batid].ConversionQuantity,
                                                    IsExpiry: stockserialitems[batid].IsExpiry,
                                                    IsSuspended: stockserialitems[batid].IsSuspended,
                                                    ManufacturerId: stockserialitems[batid].ManufacturerId,
                                                    VendorMasterId: stockserialitems[batid].VendorMasterId,
                                                    GrnDetailId: stockserialitems[batid].GrnDetailId,
                                                    GrnId: stockserialitems[batid].GrnId,
                                                    StockEntryDetailId: stockserialitems[batid].StockEntryDetailId,
                                                    StockEntryId: stockserialitems[batid].StockEntryId,
                                                    FacilityId: stockserialitems[batid].FacilityId,
                                                    OrgId: stockserialitems[batid].OrgId,
                                                    RequestedStoreStockItemId: reqStockItemId,
                                                    Status: 1
                                                };

                                                if (stockserialitems[batid].ExpiryDate === null) {
                                                    stocktransferDetail.ExpiryDate = '';
                                                    stocktransferDetail.HaveNoExpiry = true;
                                                } else {
                                                    stocktransferDetail.ExpiryDate = stockserialitems[batid].ExpiryDate;
                                                    stocktransferDetail.HaveExpiry = true;
                                                }


                                                if ($scope.currentcontext.stocktransferid > 0) {
                                                    if (sritem.TransferedQuantity == 0 && sritem.StockTransferDetails && sritem.StockTransferDetails.length == 1) {
                                                        stocktransferDetail.Id = sritem.StockTransferDetails[0].Id;
                                                    }
                                                }

                                                ReqQty = 0;
                                                stocktransferDetail.BalanceRequestedQuantity = ReqQty;
                                                $scope.stocktransferDetails.push(stocktransferDetail);
                                            } else if (stockserialitems[batid].Quantity < ReqQty) {
                                                stocktransferDetail = {
                                                    Id: 0,
                                                    StockRequestDetailId: sritem.Id,
                                                    ItemMasterId: sritem.ItemMasterId,
                                                    ItemCode: sritem.ItemCode,
                                                    ItemName: sritem.ItemName,
                                                    TotalAvailableQuantity: (sritem.ItemMaster.StockItem) ? sritem.ItemMaster.StockItem.Quantity : 0,
                                                    QuantityBeforeTransfer: stockserialitems[batid].Quantity,
                                                    BatchQuantity: stockserialitems[batid].Quantity,
                                                    RequestedQuantity: sritem.RequestedQuantity,
                                                    IssuedQuantity: sritem.TransferedQuantity,
                                                    TransferedQuantity: stockserialitems[batid].Quantity,
                                                    TransitQuantity: stockserialitems[batid].Quantity,
                                                    BatchId: stockserialitems[batid].BatchId,
                                                    ExpiryDate: null,
                                                    HaveExpiry: false,
                                                    HaveNoExpiry: false,
                                                    UomPrice: stockserialitems[batid].UomPrice,
                                                    PurchasePrice: stockserialitems[batid].PurchasePrice,
                                                    UnitCostPrice: stockserialitems[batid].Ucp,
                                                    MrPrice: stockserialitems[batid].Mrp,
                                                    Ucp: stockserialitems[batid].Ucp,
                                                    Mrp: stockserialitems[batid].Mrp,
                                                    DiscountModeId: stockserialitems[batid].DiscountModeId,
                                                    Discount: stockserialitems[batid].Discount,
                                                    UomDiscountAmount: stockserialitems[batid].UomDiscountAmount,
                                                    DiscountAmount: stockserialitems[batid].DiscountAmount,
                                                    UomPriceAfterDiscount: stockserialitems[batid].UomPriceAfterDiscount,
                                                    PurchasePriceAfterDiscount: stockserialitems[batid].PurchasePriceAfterDiscount,
                                                    GrossAmount: stockserialitems[batid].Quantity * stockserialitems[batid].Ucp,
                                                    NetAmount: stockserialitems[batid].Quantity * stockserialitems[batid].Ucp,
                                                    BarCodeId: stockserialitems[batid].BarCodeId,
                                                    StockItemId: stockserialitems[batid].StockItemId,
                                                    StockSerialItemId: stockserialitems[batid].Id,
                                                    StockSerialItemRev: stockserialitems[batid].Rev,
                                                    GstId: stockserialitems[batid].GstId,
                                                    GstPercentage: stockserialitems[batid].GstPercentage,
                                                    GstAmount: stockserialitems[batid].GstAmount,
                                                    UnitGstAmount: stockserialitems[batid].UnitGstAmount,
                                                    InGstId: stockserialitems[batid].InGstId,
                                                    InGstPercentage: stockserialitems[batid].InGstPercentage,
                                                    InGstAmount: stockserialitems[batid].InGstAmount,
                                                    UnitInGstAmount: stockserialitems[batid].UnitInGstAmount,
                                                    CGstId: stockserialitems[batid].CGstId,
                                                    CGstPercentage: stockserialitems[batid].CGstPercentage,
                                                    CGstAmount: stockserialitems[batid].CGstAmount,
                                                    UnitCGstAmount: stockserialitems[batid].UnitCGstAmount,
                                                    SGstId: stockserialitems[batid].SGstId,
                                                    SGstPercentage: stockserialitems[batid].SGstPercentage,
                                                    SGstAmount: stockserialitems[batid].SGstAmount,
                                                    UnitSGstAmount: stockserialitems[batid].UnitSGstAmount,
                                                    BaseUomId: stockserialitems[batid].BaseUomId,
                                                    PurchaseUomId: stockserialitems[batid].PurchaseUomId,
                                                    SaleUomId: stockserialitems[batid].SaleUomId,
                                                    ConversionQuantity: stockserialitems[batid].ConversionQuantity,
                                                    IsExpiry: stockserialitems[batid].IsExpiry,
                                                    IsSuspended: stockserialitems[batid].IsSuspended,
                                                    ManufacturerId: stockserialitems[batid].ManufacturerId,
                                                    VendorMasterId: stockserialitems[batid].VendorMasterId,
                                                    GrnDetailId: stockserialitems[batid].GrnDetailId,
                                                    GrnId: stockserialitems[batid].GrnId,
                                                    StockEntryDetailId: stockserialitems[batid].StockEntryDetailId,
                                                    StockEntryId: stockserialitems[batid].StockEntryId,
                                                    FacilityId: stockserialitems[batid].FacilityId,
                                                    OrgId: stockserialitems[batid].OrgId,
                                                    RequestedStoreStockItemId: reqStockItemId,
                                                    Status: 1
                                                };

                                                if (stockserialitems[batid].ExpiryDate === null) {
                                                    stocktransferDetail.ExpiryDate = '';
                                                    stocktransferDetail.HaveNoExpiry = true;
                                                } else {
                                                    stocktransferDetail.ExpiryDate = stockserialitems[batid].ExpiryDate;
                                                    stocktransferDetail.HaveExpiry = true;
                                                }

                                                stocktransferDetail.BalanceRequestedQuantity = ReqQty;
                                                // if ($scope.currentcontext.stocktransferid > 0) {
                                                //     stocktransferDetail.Id = sritem.StockTransferDetail.Id;
                                                // }
                                                if ($scope.currentcontext.stocktransferid > 0) {
                                                    if (sritem.TransferedQuantity == 0 && sritem.StockTransferDetails && sritem.StockTransferDetails.length == 1) {
                                                        stocktransferDetail.Id = sritem.StockTransferDetails[0].Id;
                                                    }
                                                }
                                                $scope.stocktransferDetails.push(stocktransferDetail);
                                                ReqQty = ReqQty - stockserialitems[batid].Quantity;
                                            }

                                    }
                                }
                            } else {
                                stocktransferDetail = {
                                    Id: 0,
                                    StockRequestDetailId: sritem.Id,
                                    ItemMasterId: sritem.ItemMasterId,
                                    ItemCode: sritem.ItemCode,
                                    ItemName: sritem.ItemName,
                                    TotalAvailableQuantity: (sritem.ItemMaster.StockItem) ? sritem.ItemMaster.StockItem.Quantity : 0,
                                    StockItemRev: (sritem.ItemMaster.StockItem) ? sritem.ItemMaster.StockItem.Rev : 0,
                                    QuantityBeforeTransfer: 0,
                                    BatchQuantity: 0,
                                    RequestedQuantity: sritem.RequestedQuantity,
                                    IssuedQuantity: sritem.TransferedQuantity,
                                    TransferedQuantity: 0,
                                    TransitQuantity: 0,
                                    BatchId: '',
                                    ExpiryDate: null,
                                    HaveExpiry: false,
                                    HaveNoExpiry: false,
                                    UomPrice: 0,
                                    PurchasePrice: 0,
                                    UnitCostPrice: 0,
                                    Ucp: 0,
                                    Mrp: 0,
                                    MrPrice: 0,
                                    DiscountModeId: 2,
                                    Discount: 0,
                                    UomDiscountAmount: 0,
                                    DiscountAmount: 0,
                                    UomPriceAfterDiscount: 0,
                                    PurchasePriceAfterDiscount: 0,
                                    GrossAmount: 0,
                                    NetAmount: 0,
                                    BarCodeId: '',
                                    StockItemId: 0,
                                    StockSerialItemId: 0,
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
                                    BaseUomId: 0,
                                    PurchaseUomId: 0,
                                    SaleUomId: 0,
                                    ConversionQuantity: 0,
                                    IsExpiry: false,
                                    IsSuspended: false,
                                    ManufacturerId: 0,
                                    VendorMasterId: 0,
                                    GrnDetailId: 0,
                                    GrnId: 0,
                                    StockEntryDetailId: 0,
                                    StockEntryId: 0,
                                    FacilityId: 0,
                                    OrgId: 0,
                                    Status: 1,
                                    RequestedStoreStockItemId: reqStockItemId,
                                };
                                // if ($scope.currentcontext.stocktransferid > 0) {
                                //     stocktransferDetail.Id = sritem.StockTransferDetail.Id;
                                // }
                                $scope.stocktransferDetails.push(stocktransferDetail);
                            }
                        }
                    }
                }
            }

            $scope.TotalGrossAmount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalNetAmount = 0;
            $scope.setIndexforTableIndex();

            calculatetotalAmount();
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

            if ($scope.jssgrn == 1) {
                vm.stocktransferitemcontrolconfig.api = 'pharmacy/itemstoremap/GetItemsForStockTransfer';
                inputData = {
                    Params: [{
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
                    item.ToStoreQty = (item.ToStoreStock) ? item.ToStoreStock.Quantity : 0;
                } else {
                    item.ToStoreQty = 0;
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

        $scope.onBatchSelected = function (selectedItem, SelectedMasterItem, idx) {
            selectedItem.BatchId = SelectedMasterItem.BatchId;
            selectedItem.ExpiryDate = SelectedMasterItem.ExpiryDate;
            selectedItem.QuantityBeforeTransfer = SelectedMasterItem.Quantity;
            selectedItem.BatchQuantity = SelectedMasterItem.Quantity;
            selectedItem.PurchasePrice = SelectedMasterItem.Ucp;
            selectedItem.UnitCostPrice = SelectedMasterItem.Ucp;
            selectedItem.MrPrice = SelectedMasterItem.Mrp;
            selectedItem.StockItemId = SelectedMasterItem.StockItemId;
            selectedItem.StockSerialItemId = SelectedMasterItem.Id;
            selectedItem.TransferedQuantity = 0;
            selectedItem.TransitQuantity = 0;

            selectedItem.GstId = selectedItem.GstId;
            selectedItem.GstPercentage = selectedItem.GstPercentage;

            selectedItem.InGstId = selectedItem.InGstId;
            selectedItem.InGstPercentage = selectedItem.InGstPercentage;

            selectedItem.CGstId = selectedItem.CGstId;
            selectedItem.CGstPercentage = selectedItem.CGstPercentage;

            selectedItem.SGstId = selectedItem.SGstId;
            selectedItem.SGstPercentage = selectedItem.SGstPercentage;
        };

        $scope.computeAmount = function (item) {

            /*
            if (item.TransferedQuantity === null) {
                item.GrossAmount = item.UnitCostPrice * 0;
                item.NetAmount = item.UnitCostPrice * 0;

                utl.Alert.showErrorMsg('Qty Should not be Empty.!');
                return false;
            } else if (item.TransferedQuantity === 0) {
                item.GrossAmount = item.UnitCostPrice * 0;
                item.NetAmount = item.UnitCostPrice * 0;
            } else {
                if (item.TransferedQuantity > item.QuantityBeforeTransfer) {
                    item.TransferedQuantity = 0;
                    utl.Alert.showErrorMsg('Entered Qty is Greater Than Available Qty.!');
                    return false;
                } else if (item.TransferedQuantity > (item.RequestedQuantity - item.IssuedQuantity)) {
                    item.TransferedQuantity = 0;
                    utl.Alert.showErrorMsg('Entered Qty is Greater Than Requested Qty.!');
                    return false;
                } else {
                    item.GrossAmount = item.UnitCostPrice * item.TransferedQuantity;
                    item.NetAmount = item.UnitCostPrice * item.TransferedQuantity;
                    item.TransitQuantity = item.TransferedQuantity;
                }
            }
            */

            // if (item.TransferedQuantity === null) {
            if (!item.TransferedQuantity) {
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
                    utl.Alert.showErrorMsg('Entered Qty is Greater Than Actual Requested Qty.!');
                    return false;
                } else {
                    item.GrossAmount = item.UnitCostPrice * item.TransferedQuantity;
                    item.NetAmount = item.UnitCostPrice * item.TransferedQuantity;
                    item.TransitQuantity = item.TransferedQuantity;
                }
            }

            /*
            if (item.TransferedQuantity === null) {
                item.GrossAmount = item.UnitCostPrice * 0;
                item.NetAmount = item.UnitCostPrice * 0;

                utl.Alert.showErrorMsg('Qty Should not be Empty.!');
                return false;
            } else if (item.TransferedQuantity === 0) {
                item.GrossAmount = item.UnitCostPrice * 0;
                item.NetAmount = item.UnitCostPrice * 0;
            } else {
                if (item.TransferedQuantity == item.QuantityBeforeTransfer && item.TransferedQuantity == item.RequestedQuantity) {
                    item.GrossAmount = item.UnitCostPrice * item.TransferedQuantity;
                    item.NetAmount = item.UnitCostPrice * item.TransferedQuantity;
                    item.TransitQuantity = item.TransferedQuantity;
                } else if (item.TransferedQuantity > item.QuantityBeforeTransfer) {
                    item.TransferedQuantity = 0;
                    utl.Alert.showErrorMsg('Entered Qty is Greater Than Available Qty.!');
                    return false;
                } else if (item.TransferedQuantity < item.RequestedQuantity && item.TransferedQuantity == item.QuantityBeforeTransfer) {
                    item.TransferedQuantity = 0;
                    utl.Alert.showErrorMsg('Entered Qty is Greater Than Actual Requested Qty.!');
                    return false;
                } else {
                    item.GrossAmount = item.UnitCostPrice * item.TransferedQuantity;
                    item.NetAmount = item.UnitCostPrice * item.TransferedQuantity;
                    item.TransitQuantity = item.TransferedQuantity;
                }
            }
            */

            $scope.TotalGrossAmount = 0;
            $scope.TotalNetAmount = 0;

            calculatetotalAmount();
        };

        function calculatetotalAmount() {
            for (var idx in $scope.stocktransferDetails) {
                var activeitem = $scope.stocktransferDetails[idx];
                if (activeitem.ItemMasterId > 0 && activeitem.TransferedQuantity > 0 && activeitem.Status == 1) {
                    $scope.TotalGrossAmount = parseFloat(($scope.TotalGrossAmount + activeitem.GrossAmount).toFixed(4));
                    $scope.TotalNetAmount = parseFloat(($scope.TotalNetAmount + activeitem.NetAmount).toFixed(4));
                }
            }

            $scope.item.TotalGrossAmount = $scope.TotalGrossAmount;
            $scope.item.TotalNetAmount = $scope.TotalNetAmount;
        }

        $scope.SaveandDraft = function () {
            $scope.item.TransferStatusId = 1;
            $scope.saveItem();
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
            $scope.item.AcceptanceStatusId = 1;
            // if ($scope.stockissuedirecttransfer == 0) {
            //     $scope.item.TransferStatusId = 1;
            // }
            $scope.item.StockRequestId = $scope.currentcontext.stockrequestid;
            $scope.item.TransferedBy = utl.Session.getCurrentUserId();
            $scope.item.TransferedDate = utl.Formatter.getCurrentDate();
            $scope.item.ApprovedBy = utl.Session.getCurrentUserId();
            $scope.item.ApprovedDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.SaveandAuthorize = function () {
            $scope.item.TransferStatusId = 3;
            $scope.item.AuthorizedBy = utl.Session.getCurrentUserId();
            $scope.item.AuthorizedDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.onComplete = function () {
            $scope.item.TransferStatusId = 4;
            $scope.saveItem();
        };

        $scope.onCancelConfirmed = function () {
            $scope.item.TransferStatusId = 3;
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

        $scope.Complete = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'inventory.stockrequest.completemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onCompleteConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onCompleteConfirmed = function () {
            $scope.completeRequest();
        };

        $scope.completeRequest = function () {
            var actionName = 'pharmacy/stockrequest/CompleteStockRequest';
            $scope.currentrequest.Id = $scope.currentcontext.stockrequestid;
            $scope.currentrequest.RequestStatusId = 5;
            var lines = null;
            var inputData = {
                Header: $scope.currentrequest,
                Details: lines
            };
            var options = {
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.completeRequestCallback
            };
            utl.Http.doAction(options);
        };

        $scope.completeRequestCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
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
                            }
                            // return indexesOf12
                        });
                        // console.log(find_index);
                        // if (find_index != -1) {
                        //     $scope.PatientBillDetails[find_index].removeEntry = true;
                        // }
                    }
                    console.log($scope.stocktransferDetails); //return;
                } else if(message.includes('Stock Already Transfered') == true) {
                    $scope.backToList();
                } else {
                    console.log(message);
                }

            }
        };

        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }
            //             var batchcheck = 0;
            var AtLeatOneItem = 0;
            var RequestStatusCheck = 0;
            var RequestedQtyCheck = 0;
            var RequestedItemName = null;
            for (var reqidx in $scope.stockrequestDetails) {
                var reqitem = $scope.stockrequestDetails[reqidx];
                var BalanceOfRequestedQty = reqitem.RequestedQuantity - reqitem.TransferedQuantity;
                if (BalanceOfRequestedQty < 0)
                    BalanceOfRequestedQty = 0;
                var TrfQty = 0;
                for (var trfidx in $scope.stocktransferDetails) {
                    var trfitem = $scope.stocktransferDetails[trfidx];
                    if (trfitem.ItemMasterId > 0 && trfitem.Status == 1) {
                        //                         if (!trfitem.BatchId) {
                        //                             batchcheck = 1;
                        //                         }
                        if (Number(trfitem.TransferedQuantity) > 0) {
                            AtLeatOneItem = 1;
                        }
                    }
                    if (trfitem.ItemMasterId > 0 && trfitem.Status == 1 && trfitem.ItemMasterId == reqitem.ItemMasterId) {
                        TrfQty = TrfQty + Number(trfitem.TransferedQuantity);
                    }
                }

                if (BalanceOfRequestedQty > TrfQty) {
                    RequestStatusCheck = 1;
                }

                if (BalanceOfRequestedQty < TrfQty) {
                    RequestedQtyCheck = 1;
                    RequestedItemName = reqitem.ItemName;
                    break;
                } else {
                    continue;
                }
            }
            //             if (batchcheck === 1) {
            //                 utl.Alert.showErrorMsg($translate.instant('Stock not available for this store'));
            //                 return false;
            //             }

            if (AtLeatOneItem === 0) {
                utl.Alert.showErrorMsg($translate.instant('inventory.stocktransferform.enterqtyatleastonemsg.lbl'));
                return false;
            }

            if (RequestStatusCheck === 1) {
                $scope.item.RequestStatusId = 4;
            } else {
                $scope.item.RequestStatusId = 5;
            }

            // if (RequestedQtyCheck === 1) {
            //     utl.Alert.showErrorMsg($translate.instant('inventory.stocktransferform.qtuexceedsactualqtymsg.lbl') + RequestedItemName);
            //     return false;
            // }

            /*
            var RequestStatusCheck = 0;
            var AtLeatOneItem = 0;
            for (var idx in $scope.stocktransferDetails) {
                var item = $scope.stocktransferDetails[idx];
                if (item.ItemMasterId > 0 && item.Status == 1) {
                    var transferitem = $scope.stocktransferDetails[idx];
                    if (transferitem && transferitem.TransferedQuantity > 0) {
                        AtLeatOneItem = 1;
                    }
                    if (transferitem && transferitem.ItemMasterId > 0 && transferitem.RequestedQuantity > (transferitem.TransferedQuantity + transferitem.IssuedQuantity)) {
                        RequestStatusCheck = 1;
                    }
                }
            }

            if (AtLeatOneItem === 0) {
                utl.Alert.showErrorMsg('Please Enter Qty for Atleast One Item');
                return false;
            }

            if (RequestStatusCheck === 1) {
                $scope.item.RequestStatusId = 4;
            } else {
                $scope.item.RequestStatusId = 5;
            }
            */

            var lines = getLinesForSave();
            var details = [];
            var actionName = 'pharmacy/stocktransfer/AddStockTransfer';
            if ($scope.currentcontext.stocktransferid && $scope.currentcontext.stocktransferid > 0) {
                // details = lines;
                for (var idx in lines) {
                    var item = lines[idx];
                    if (item.Id == 0) {
                        details.push(item);
                    }
                }
                actionName = 'pharmacy/stocktransfer/UpdateStockTransfer';
            } else {
                details = lines;
            }

            if (details.length == 0) {
                utl.Alert.showErrorMsg('Please Check.. No items for Transfer');
                return false;
            }

            var inputData = {
                Header: $scope.item,
                Details: details
            };
            // console.log(inputData); return;
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
        };

        /*
        function checkMandatoryFields() {
            for (var iddx in $scope.stocktransferDetails) {
                var iddxitem = $scope.stocktransferDetails[iddx];
                if (iddxitem.ItemMasterId > 0 && iddxitem.TransferedQuantity <= 0) {
                    utl.Alert.showErrorMsg('Please Enter Qty for ' + iddxitem.ItemName);
                    return false;
                }
            }

            return true;
        }
        */

        function getLinesForSave() {
            var result = [];
            for (var idx in $scope.stocktransferDetails) {
                var item = $scope.stocktransferDetails[idx];
                if (item.ItemMasterId > 0 && item.Status == 1 && item.TransferedQuantity > 0) {
                    // if (item.ItemMasterId > 0 && item.Status == 1) {
                    if (item.ExpiryDate == '') {
                        item.ExpiryDate = null;
                    }
                    result.push(item);
                }
            }
            return result;
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (data === true) {
                $scope.currentcontext.stocktransferid = options.data.Data.Header.Id;
            } else {
                $scope.currentcontext.stocktransferid = data;
            }

            $scope.getStockTransfer();
        };

        $scope.backToList = function () {
            $state.go('app.storeworklisttab.storeworklists', $scope.currentcontext.id);
        };

        /*
        function loadData() {
            if ($scope.currentcontext.stocktransferid > 0) {
                $scope.getStockTransfer();
            } else {
                $scope.getStockRequest();
            }
        }
        */

        function loadData() {
            $scope.getStockRequest();
            // if ($scope.currentcontext.stocktransferid > 0) {
            //     $scope.getStockTransfer();
            // } else {
            //     $scope.getStockRequest();
            // }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.item.StoreMasterId === 0) {
                    $scope.item.StoreMasterId = value[0].Id;
                    $scope.item.StoreTypeId = value[0].StoreMaster.StoreTypeId;
                }
            });
        };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Facility"
            },
            {
                "Key": "ToFacility"
            },
            {
                "Key": "ToStore",
                Request: {
                    Params: [{
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
            },
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

    StocktransferFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();