(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('purchasereturnAmendFormController', purchasereturnAmendFormController);

    function purchasereturnAmendFormController($rootScope, $scope, $stateParams, $state, $translate, utl, $filter, $timeout) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        $scope.currentfilter = {};
        $scope.tabindexmap = {
            patienttabindex: 1,
            detailtabindex: 2
        };

        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            PrnTypeId: -1,
            PrnStatusId: -1,
            PrnDate: utl.Formatter.getCurrentDate(),
            VendorMasterId: -1,
            StoreTypeId: 1,
            ReturnReasonId: -1,
            StoreMasterId: 0,
            GrnId: 0,
            TotalGrossAmount: 0,
            TotalDiscountAmount: 0,
            TotalGstAmount: 0,
            TotalInGstAmount: 0,
            TotalCGstAmount: 0,
            TotalSGstAmount: 0,
            ShippingCharges: 0,
            OtherCharges: 0,
            RoundOff: 0,
            TotalNetAmount: 0,
            TotalInvoiceAmount: 0,
            TotalAmount: 0,
            Comments: null,
            IsDisabled: false,
            IsGrnReturn: false,
            IsVendorReturn: false,
            RdoPrnTypeId: false,
            RdoFacilityId: false,
            RdoStoreTypeId: false,
            RdoStoreMasterId: false,
            RdoVendorMasterId: false,
            RdoReturnReasonId: false,
            RdoPrnStatusId: false
        };

        $scope.SelectedIndex = -1;
        $scope.lookup = {};
        $scope.reasonlookup = {};
        $scope.itemUsedBatches = {};
        $scope.currentcontext = {
            id: -1
        };

        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.PurchaseReturnDetails = [];

        $scope.applyVisibilityRules = function () {
            if ($scope.item.PrnStatusId != 1 || $scope.item.PrnStatusId != 2 || $scope.item.PrnStatusId != 3 || $scope.item.PrnStatusId != 4 || $scope.item.PrnStatusId != 5) {
                $scope.canShowPrintBtn = false;
                $scope.canShowSaveBtn = true;
                $scope.canShowSaveandApproveBtn = true;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowClearBtn = true;
                $scope.canShowCancelBtn = false;
                $scope.canShowCancelPrnBtn = false;
                $scope.canShowHistoryBtn = false;
            }
            // When In Draft Status
            if ($scope.item.PrnStatusId == 1) {
                $scope.canShowPrintBtn = false;
                $scope.canShowSaveBtn = true;
                $scope.canShowSaveandApproveBtn = true;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowClearBtn = true;
                $scope.canShowCancelBtn = true;
                $scope.canShowCancelPrnBtn = true;
                $scope.canShowHistoryBtn = true;
            }
            // When In Approved Status
            if ($scope.item.PrnStatusId == 2) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowAuthorizeBtn = true;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.canShowCancelPrnBtn = false;
                $scope.canShowHistoryBtn = true;
            }
            // When In Authorized Status
            if ($scope.item.PrnStatusId == 3) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.canShowCancelPrnBtn = false;
                $scope.canShowHistoryBtn = true;
            }
            // When In Complete Status
            if ($scope.item.PrnStatusId == 4) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.canShowCancelPrnBtn = false;
                $scope.canShowHistoryBtn = true;
            }
            // When In Cancelled Status
            if ($scope.item.PrnStatusId == 5) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.canShowCancelPrnBtn = false;
                $scope.canShowHistoryBtn = true;
            }
        };

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

        $scope.addNewLineItem = function () {
            var lastIndex = $scope.PurchaseReturnDetails.length - 1;
            if (lastIndex >= 0) {
                if ($scope.PurchaseReturnDetails[lastIndex].ItemMasterId == -1)
                    return false;
            }
            var PurchaseReturnDetail = {
                Id: 0,
                SNo: 0,
                PurchaseReturnId: 0,
                PrnTypeId: -1,
                ReturnReasonId: -1,
                VendorMasterId: 0,
                BarCodeId: null,
                ItemMasterId: -1,
                ItemCode: null,
                ItemName: null,
                BatchId: '',
                SelectedBatchId: '',
                BatchDetails: [],
                BatchDetail: {
                    Id: 0,
                    StockItemId: 0,
                    ItemMasterId: 0,
                    StoreMasterId: 0,
                    BatchId: '',
                    SelectedBatchId: '',
                    Quantity: 0,
                    ExpiryDate: null,
                    Ucp: 0,
                    Mrp: 0,
                    GSTId: 0,
                    GSTPercentage: 0,
                    InGstId: 0,
                    InGstPercentage: 0,
                    CGstId: 0,
                    CGstPercentage: 0,
                    SGstId: 0,
                    SGstPercentage: 0,
                    SerialDetails: null
                },
                GrnQuantity: 0,
                FreeQty: 0,
                PrnQuantity: 0,
                ExpiryDate: null,
                ManufacturedDate: null,
                PurchaseOrderDetailId: 0,
                GrnDetailId: 0,
                PurchaseUomId: 0,
                BaseUomId: 0,
                UomCode: '',
                ConversionQuantity: 0,
                CurrencyId: 0,
                PurchasePrice: 0,
                GrossAmount: 0.00,
                DiscountMode: 0,
                DiscountAmount: 0,
                DiscountInAmount: 0,
                DiscountInPercentage: 0,
                GstId: 0,
                GstPercentage: 0,
                GstAmount: 0,
                InGstId: 0,
                InGstPercentage: 0,
                InGstAmount: 0,
                CGstId: 0,
                CGstPercentage: 0,
                CGstAmount: 0,
                SGstId: 0,
                SGstPercentage: 0,
                SGstAmount: 0,
                UnitCostPrice: 0.00,
                MrPrice: 0.00,
                NetAmountBeforeGst: 0.00,
                NetAmount: 0.00,
                OtherCharges: 0.00,
                QtyBeforeReturn: 0,
                QtyAfterReturn: 0,
                Comments: null,
                Status: 1,
                RdoItemMasterId: false,
                tabindex: $scope.tabindexmap.detailtabindex++
            };

            if ($scope.currentcontext.id > 0) {
                PurchaseReturnDetail.PurchaseReturnId = $scope.currentcontext.id;
            }

            $scope.PurchaseReturnDetails.push(PurchaseReturnDetail);

            $scope.SelectedIndex = $scope.PurchaseReturnDetails.length;
            $scope.setIndexforTableIndex();
        };


        $scope.prnTypeChange = function () {
            if ($scope.item.PrnTypeId == 1) {
                if ($scope.PurchaseReturnDetails.length > 0) {
                    if ($scope.PurchaseReturnDetails[0].ItemMasterId > 0)
                        $state.reload();
                }
            }
            if ($scope.item.PrnTypeId == 2) {
                if ($scope.item.VendorMasterId > 0) {
                    $state.reload();
                }
                if ($scope.PurchaseReturnDetails.length > 1) {
                    $state.reload();
                }
            }
        }

        $scope.addNew = function () {
            if ($stateParams.id > 0)
                $state.go('app.purchasereturn', {
                    id: 0,
                    poid: $scope.currentcontext.poid
                });
            else
                $state.reload();
        };

        $scope.history = function (HistoryId) {
            utl.Modal.open('app.purchasereturnhistory', {});
        };

        $scope.History = function (item, idx) {
            if (item.ItemMasterId > 0) {
                utl.Modal.open('app.purchasereturnshistory', {
                    params: {
                        vendormasterid: $scope.item.VendorMasterId,
                        itemmasterid: item.ItemMasterId,
                        itemcode: item.ItemCode,
                        itemname: item.ItemName
                    },
                    confirmCallback: $scope.getList
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.emptyrowmsg.lbl'));
            }
        };

        $scope.Stock = function (selectedItem, idx) {
            if (selectedItem.ItemMasterId > 0) {
                utl.Modal.open('app.stockdetails', {
                    params: {
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
        $scope.setIndexforTableIndex = function () {
            var SNo = 1;
            for (var idx in $scope.PurchaseReturnDetails) {
                if ($scope.PurchaseReturnDetails[idx].Status == 1) {
                    $scope.PurchaseReturnDetails[idx].SNo = SNo;
                    // $scope.purchasereturnDetails[idx].itemidxdesc = 'desc' + (SNo - 1);
                    // $scope.purchasereturnDetails[idx].itemidxqty = 'qty' + (SNo - 1);
                    SNo++;
                }
            }
        };
        function returnData(data) {
            $scope.currentcontext.id = data.Id;
            //$scope.getItem();
            //$scope.getPurchaseReturnInfo();
            $scope.getpurchasereturnsDetails();
        }

        $scope.findreturn = function () {
            utl.Modal.open('app.findreturn-list', {
                params: {
                    id: 0
                },
                confirmCallback: returnData
            });
        };

        $scope.getpurchasereturnsDetailsCallback = function (scope, res, options, hasError) {
            $scope.purchasereturnsDetails = res.Data || [];
            for (var idx in $scope.purchasereturnDetails) {
                var returnitem = $scope.purchasereturnDetails[idx];
                if (returnitem.ItemMasterId > 0) {
                    if (returnitem.VendorItem) {
                        returnitem.VendorCode = returnitem.VendorItem.VendorCode;
                    }
                    returnitem.ReturnReasonCode = returnitem.ReturnReason.ReturnReasonCode;
                }

                $scope.addNewLineItem();
                $scope.setIndexforTableIndex();
            };

        };

        $scope.getpurchasereturnsDetails = function (pageNo) {
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
                    action: 'pharmacy/PurchaseReturnDetail/GetPurchaseReturnDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getpurchasereturnsDetailsCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.addNewLineItem();
            }
        };

        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'pharmacy/PurchaseReturn/PrintPurchaseReturn',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.deletePurchaseReturnDetail = function (idx, item) {
            if (item.ItemMasterId > 0) {
                if (item.ItemMasterId != -1) {
                    var existing = $scope.itemUsedBatches[item.ItemMasterId].indexOf(item.SelectedBatchId);
                    $scope.itemUsedBatches[item.ItemMasterId].splice(existing, 1);

                    //find all items with item.ItemMasterId and add the removed Batch
                    //$scope.PBDs[idx].BatchDetails.push(item.BatchDetails[bdx]);

                    utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
                }
            } else {
                utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.emptyrowmsg.lbl'));
            }
        };

        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;
            var index = $scope.PurchaseReturnDetails.indexOf(item);
            $scope.PurchaseReturnDetails.splice(index, 1);
            var lastIndex = $scope.PurchaseReturnDetails.length - 1;
            if (lastIndex < 0) {
                $scope.addNewLineItem();
            }
            calculatetotalAmount();
            $scope.setIndexforTableIndex();
        };

        $scope.getPurchaseReturnInfoCallback = function (scope, res, options, hasError) {
            $scope.PurchaseReturnInfo = res.Data || [];
            if ($scope.PurchaseReturnInfo && $scope.PurchaseReturnInfo.length > 0) {
                $scope.PurchaseReturnInfo.forEach(purchasereturn => {
                    $scope.currentcontext.id = purchasereturn.Id;
                    $scope.item.Id = purchasereturn.Id;
                    $scope.item.PrnNumber = purchasereturn.PrnNumber;
                    $scope.item.PrnDate = purchasereturn.PrnDate;
                    $scope.item.PrnTypeId = purchasereturn.PrnTypeId;
                    $scope.item.ReturnReasonId = purchasereturn.ReturnReasonId;
                    $scope.item.PrnStatusId = purchasereturn.PrnStatusId;
                    $scope.item.PrnStatus = purchasereturn.PrnStatus.Description;
                    $scope.item.VendorMasterId = purchasereturn.VendorMasterId;
                    $scope.item.StoreTypeId = purchasereturn.StoreTypeId;
                    $scope.item.StoreMasterId = purchasereturn.StoreMasterId;
                    $scope.item.DepartmentId = purchasereturn.DepartmentId;
                    $scope.item.LocationId = purchasereturn.LocationId;
                    $scope.item.FacilityId = purchasereturn.FacilityId;
                    $scope.item.OrganisationId = purchasereturn.OrganisationId;
                    $scope.item.ReturnedBy = purchasereturn.ReturnedBy;
                    $scope.item.ReturnedDate = purchasereturn.ReturnedDate;
                    $scope.item.ReturnerComments = purchasereturn.ReturnerComments;
                    $scope.item.ApprovedBy = purchasereturn.ApprovedBy;
                    $scope.item.ApprovedDate = purchasereturn.ApprovedDate;
                    $scope.item.ApproverComments = purchasereturn.ApproverComments;
                    $scope.item.AuthorizedBy = purchasereturn.AuthorizedBy;
                    $scope.item.AuthorizedDate = purchasereturn.AuthorizedDate;
                    $scope.item.AuthorizerComments = purchasereturn.AuthorizerComments;
                    $scope.item.IsCancelled = purchasereturn.IsCancelled;
                    $scope.item.CancelReasonId = purchasereturn.CancelReasonId;
                    $scope.item.TotalGrossAmount = purchasereturn.TotalGrossAmount;
                    $scope.item.TotalDiscountAmount = purchasereturn.TotalDiscountAmount;
                    $scope.item.TotalGstAmount = purchasereturn.TotalGstAmount;
                    $scope.item.TotalInGstAmount = purchasereturn.TotalInGstAmount;
                    $scope.item.TotalCGstAmount = purchasereturn.TotalCGstAmount;
                    $scope.item.TotalSGstAmount = purchasereturn.TotalSGstAmount;
                    $scope.item.ShippingCharges = purchasereturn.ShippingCharges;
                    $scope.item.OtherCharges = purchasereturn.OtherCharges;
                    $scope.item.RoundOff = purchasereturn.RoundOff;
                    $scope.item.TotalNetAmount = purchasereturn.TotalNetAmount;
                    $scope.item.TotalReturnAmount = purchasereturn.TotalReturnAmount;
                    if (purchasereturn.Grn) {
                        $scope.item.GrnDate = purchasereturn.Grn.GrnDate;
                        $scope.item.InvoiceNumber = purchasereturn.Grn.InvoiceNumber;
                        $scope.item.InvoiceDate = purchasereturn.Grn.InvoiceDate;
                    }
                    if (purchasereturn.PrnType) {
                        $scope.item.PrnType = purchasereturn.PrnType.Description;
                    }
                    $scope.item.ReturnedUser = '';
                    if (purchasereturn.ReturnedUser.Title.Description)
                        $scope.item.ReturnedUser = purchasereturn.ReturnedUser.Title.Description;
                    if (purchasereturn.ReturnedUser.FirstName)
                        $scope.item.ReturnedUser += ' ' + purchasereturn.ReturnedUser.FirstName;
                    if (purchasereturn.ReturnedUser.LastName)
                        $scope.item.ReturnedUser += ' ' + purchasereturn.ReturnedUser.LastName;
                    $scope.item.ApprovedUser = '';
                    if (purchasereturn.ApprovedUser.Title.Description)
                        $scope.item.ApprovedUser = purchasereturn.ApprovedUser.Title.Description;
                    if (purchasereturn.ApprovedUser.FirstName)
                        $scope.item.ApprovedUser += ' ' + purchasereturn.ApprovedUser.FirstName;
                    if (purchasereturn.ApprovedUser.LastName)
                        $scope.item.ApprovedUser += ' ' + purchasereturn.ApprovedUser.LastName;
                    if ($scope.item.PrnTypeId == 1) {
                        if (purchasereturn.VendorMaster) {
                            $scope.item.VendorCode = purchasereturn.VendorMaster.VendorCode;
                        } else {
                            $scope.item.VendorCode = '';
                        }
                        $scope.item.IsVendorReturn = true;
                    }

                    if ($scope.item.PrnTypeId == 2) {
                        $scope.item.PurchaseOrderId = purchasereturn.PurchaseOrderId;
                        $scope.item.GrnId = purchasereturn.GrnId;
                        if (purchasereturn.Grn) {
                            $scope.item.GrnNumber = purchasereturn.Grn.GrnNumber;
                        } else {
                            $scope.item.GrnNumber = '';
                        }
                        if (purchasereturn.VendorMaster) {
                            $scope.item.VendorName = purchasereturn.VendorMaster.VendorName;
                        } else {
                            $scope.item.VendorName = '';
                        }
                        $scope.item.IsGrnReturn = true;
                    }

                    if ($scope.item.PrnStatusId == 1) {
                        $scope.item.RdoPrnTypeId = true;
                        $scope.item.RdoFacilityId = true;
                        $scope.item.RdoStoreTypeId = true;
                        $scope.item.RdoStoreMasterId = true;
                    } else if ($scope.item.PrnStatusId >= 2) {
                        $scope.item.RdoPrnTypeId = true;
                        $scope.item.RdoFacilityId = true;
                        $scope.item.RdoStoreTypeId = true;
                        $scope.item.RdoStoreMasterId = true;
                        $scope.item.RdoVendorMasterId = true;
                        $scope.item.RdoReturnReasonId = true;
                        $scope.item.RdoPrnStatusId = true;
                    }

                    $scope.PurchaseReturnDetails = [];
                    $scope.PurchaseReturnDetails = purchasereturn.PurchaseReturnDetails;
                    for (var pridx in $scope.PurchaseReturnDetails) {
                        var pritem = $scope.PurchaseReturnDetails[pridx];
                        pritem.BatchDetails = [];
                        if (pritem.ItemMasterId > 0) {
                            if ($scope.item.PrnTypeId >= 2) {
                                if (pritem.PurchaseUom) {
                                    pritem.UomCode = pritem.PurchaseUom.UomCode;
                                } else {
                                    pritem.UomCode = '';
                                }
                                if (pritem.StockItem !== null) {
                                    pritem.TotalQuantity = pritem.StockItem.Quantity;
                                } else {
                                    pritem.TotalQuantity = 0;
                                }
                                if (pritem.StockSerialItem !== null) {
                                    pritem.AvailableQuantity = pritem.StockSerialItem.Quantity;
                                    pritem.BatchQuantity = pritem.StockSerialItem.Quantity;
                                } else {
                                    pritem.AvailableQuantity = 0;
                                    pritem.BatchQuantity = 0;
                                }
                                if (pritem.DiscountModeId == 1) {
                                    pritem.DiscountMode = 'Rs.';
                                } else {
                                    pritem.DiscountMode = '%';
                                }
                                pritem.RdoItemMasterId = true;
                            } else {
                                pritem.SelectedBatchId = pritem.BatchId;
                                if ($scope.item.PrnTypeId == 2) {
                                    pritem.BatchId = pritem.BatchId;
                                    pritem.StockSerialItemId = pritem.StockSerialItemId;
                                    pritem.StockItemId = pritem.StockItemId;
                                } else {
                                    var BatchDetail = {
                                        Id: 0,
                                        StockItemId: 0,
                                        ItemMasterId: 0,
                                        StoreMasterId: 0,
                                        BatchId: '',
                                        SelectedBatchId: '',
                                        Quantity: 0,
                                        ExpiryDate: null,
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

                                    BatchDetail.Id = pritem.StockSerialItemId;
                                    BatchDetail.StockItemId = pritem.StockItemId;
                                    BatchDetail.ItemMasterId = pritem.ItemMasterId;
                                    BatchDetail.StoreMasterId = pritem.StoreMasterId;
                                    BatchDetail.BatchId = pritem.BatchId;
                                    BatchDetail.SelectedBatchId = pritem.BatchId;
                                    BatchDetail.Quantity = pritem.PrnQuantity;
                                    BatchDetail.ExpiryDate = pritem.ExpiryDate;
                                    BatchDetail.Ucp = pritem.UnitCostPrice;
                                    BatchDetail.Mrp = pritem.MrPrice;
                                    BatchDetail.GstId = pritem.GstId;
                                    BatchDetail.GstPercentage = pritem.GstPercentage;
                                    BatchDetail.InGstId = pritem.InGstId;
                                    BatchDetail.InGstPercentage = pritem.InGstPercentage;
                                    BatchDetail.CGstId = pritem.CGstId;
                                    BatchDetail.CGstPercentage = pritem.CGstPercentage;
                                    BatchDetail.SGstId = pritem.SGstId;
                                    BatchDetail.SGstPercentage = pritem.SGstPercentage;

                                    BatchDetail.SerialDetails = [
                                        ' Batch: ', pritem.BatchId,
                                        ' | Qty: ', pritem.PrnQuantity,
                                        ' | Expiry: ', pritem.ExpiryDate,
                                        ' | UCP: ', pritem.UnitCostPrice,
                                        ' | MRP: ', pritem.MrPrice
                                    ].join(' ');
                                }

                                if (pritem.StockItem !== null) {
                                    pritem.TotalQuantity = pritem.StockItem.Quantity;
                                } else {
                                    pritem.TotalQuantity = 0;
                                }
                                if (pritem.StockSerialItem !== null) {
                                    pritem.AvailableQuantity = pritem.StockSerialItem.Quantity;
                                    pritem.BatchQuantity = pritem.StockSerialItem.Quantity;
                                } else {
                                    pritem.AvailableQuantity = 0;
                                    pritem.BatchQuantity = 0;
                                }

                                pritem.BatchDetails.push(BatchDetail);
                                pritem.RdoItemMasterId = true;
                            }
                        }
                    }

                    $scope.applyVisibilityRules();
                    $scope.setIndexforTableIndex();
                });
                // $scope.setIndexforTableIndex();
            }
        };

        function returnData(data) {
            $scope.currentcontext.id = data.Id;
            //$scope.getItem();
            //$scope.getPurchaseReturnInfo();
            $scope.getpurchasereturnsDetails();
        }

        $scope.findreturn = function () {
            utl.Modal.open('app.findreturn-list', {
                params: {
                    id: 0
                },
                confirmCallback: returnData
            });
        };

        $scope.getpurchasereturnsDetailsCallback = function (scope, res, options, hasError) {
            $scope.PurchaseReturnDetails = res.Data || [];
            for (var idx in $scope.PurchaseReturnDetails) {
                var returnitem = $scope.PurchaseReturnDetails[idx];
                if (returnitem.ItemMasterId > 0) {
                    returnitem.VendorCode = returnitem.VendorMaster.VendorCode;
                    returnitem.ReturnReasonCode = returnitem.ReturnReason.ReturnReasonCode;
                }

                $scope.addNewLineItem();
                $scope.setIndexforTableIndex();
            };
            // $scope.setIndexforTableIndex();
        };

        $scope.getpurchasereturnsDetails = function (pageNo) {
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
                    action: 'pharmacy/PurchaseReturnDetail/GetPurchaseReturnDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getpurchasereturnsDetailsCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.addNewLineItem();
            }
        };

        $scope.getPurchaseReturnInfoById = function () {
            var SearchReturnId = $scope.currentcontext.id;
            if (SearchReturnId && SearchReturnId > 0) {
                var inputData = {
                    Params: [{
                        Key: 0,
                        Value: SearchReturnId
                    }],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'pharmacy/PurchaseReturn/GetPurchaseReturns',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getPurchaseReturnInfoCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.clear();
            }
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (data === true) {
                $scope.currentcontext.id = options.data.Data.Header.Id;
            } else {
                $scope.currentcontext.id = data;
            }

            $scope.getPurchaseReturnInfoById();
        };

        // $scope.saveItem = function () {
        //     var actionName = 'pharmacy/PurchaseReturn/AddPurchaseReturn';
        //     if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
        //         actionName = 'pharmacy/PurchaseReturn/UpdatePurchaseReturn';
        //     }

        //     var options = {
        //         action: actionName,
        //         data: {
        //             Data: $scope.item
        //         },
        //         type: 'post',
        //         onComplete: $scope.saveItemCallback
        //     };
        //     utl.Http.doAction(options);
        // };

        $scope.backToList = function () {
            $state.go('app.purchasereturns', $scope.currentcontext.id);
        };

        $scope.SaveandDraft = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'inventory.purchasereturn.savemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandDraftConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onSaveandDraftConfirmed = function () {
            $scope.item.PrnStatusId = 1;
            $scope.item.ReturnedBy = utl.Session.getCurrentUserId();
            $scope.item.ReturnedDate = utl.Formatter.getCurrentDate();
            $scope.item.PrnDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.SaveandApprove = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'inventory.purchasereturn.approvemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandApproveConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onSaveandApproveConfirmed = function () {
            if ($scope.item.PrnStatusId == 1) { } else {
                $scope.item.ReturnedBy = utl.Session.getCurrentUserId();
                $scope.item.ReturnedDate = utl.Formatter.getCurrentDate();
                $scope.item.PrnDate = utl.Formatter.getCurrentDate();
            }
            $scope.item.PrnStatusId = 2;
            $scope.item.ApprovedBy = utl.Session.getCurrentUserId();
            $scope.item.ApprovedDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.SaveandAuthorize = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'inventory.purchasereturn.authorizemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandAuthorizeConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onSaveandAuthorizeConfirmed = function () {
            $scope.item.PrnStatusId = 3;
            $scope.item.AuthorizedBy = utl.Session.getCurrentUserId();
            $scope.item.AuthorizedDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.saveCancelled = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'patientemr.prescription-form.cancelmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onCancelConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onCancelConfirmed = function () {
            $scope.item.PrnStatusId = 2;
            $scope.saveItem();
        };

        $scope.onComplete = function () {
            $scope.item.PrnStatusId = 4;
            $scope.item.CompletedBy = utl.Session.getCurrentUserId();
            $scope.item.CompletedDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }
            var ItemMovementCheck = 0;
            var ItemName = null;
            if ($scope.item.PrnTypeId == 2 && $scope.item.PrnStatusId == 2) {
                for (var prnidx in $scope.PurchaseReturnDetails) {
                    var prnitem = $scope.PurchaseReturnDetails[prnidx];
                    if (prnitem && prnitem.ItemMasterId > 0 && prnitem.AvailableQuantity < prnitem.TotalQuantityAfterConversion) {
                        ItemMovementCheck = 1;
                        ItemName = prnitem.ItemName;
                        break;
                    } else {
                        continue;
                    }
                }
            }

            if (ItemMovementCheck == 1) {
                utl.Alert.showErrorMsg($translate.instant('inventory.purchasereturn.movementhappendmsg.lbl') + ItemName);
                return false;
            }

            var LineItemReasonCheck = 0;
            var LineQtyCheck = 0;
            if ($scope.item.PrnTypeId == 1) {
                if ($scope.item.VendorMasterId <= 0) {
                    utl.Alert.showErrorMsg($translate.instant('inventory.purchasereturn.selectvendormsg.lbl'));
                    return false;
                }
                for (var prnidx in $scope.PurchaseReturnDetails) {
                    var prnitem = $scope.PurchaseReturnDetails[prnidx];
                    if (prnitem && prnitem.ItemMasterId > 0 && prnitem.ReturnReasonId <= 0) {
                        LineItemReasonCheck = 1;
                        ItemName = prnitem.ItemName;
                        break;
                    } else if (prnitem && prnitem.ItemMasterId > 0 && prnitem.PrnQuantity <= 0) {
                        LineQtyCheck = 1;
                        ItemName = prnitem.ItemName;
                        break;
                    } else {
                        continue;
                    }
                }
            }

            if (LineItemReasonCheck == 1) {
                utl.Alert.showErrorMsg($translate.instant('inventory.purchasereturn.selectreturnreasonmsg.lbl') + ItemName);
                return false;
            }

            if (LineQtyCheck == 1) {
                utl.Alert.showErrorMsg($translate.instant('inventory.purchasereturn.enterreturnqtymsg.lbl') + ItemName);
                return false;
            }

            var lines = getLinesForSave();

            var actionName = 'pharmacy/PurchaseReturn/AddPurchaseReturn';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'pharmacy/PurchaseReturn/UpdatePurchaseReturn';
            }

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

        function getLinesForSave() {
            var result = [];
            for (var idx in $scope.PurchaseReturnDetails) {
                var item = $scope.PurchaseReturnDetails[idx];
                item.VendorMasterId = $scope.item.VendorMasterId;
                item.PrnTypeId = $scope.item.PrnTypeId;
                item.ReturnReasonId = $scope.item.ReturnReasonId;
                if (item.ItemMasterId > 0 && item.PrnTypeId == 2 && item.PrnQuantity > 0 && item.Status == 1) {
                    item.PrnQuantity = item.TotalQuantityAfterConversion;
                    result.push(item);
                }
                if (item.ItemMasterId > 0 && item.PrnTypeId == 1 && item.PrnQuantity > 0 && item.Status == 1) {
                    item.PrnQuantity = item.PrnQuantity;
                    result.push(item);
                }
            }
            return result;
        }

        $scope.onBatchSelected = function (prnItem, selectedMasterItem, idx) {
            var existing = $scope.itemUsedBatches[prnItem.ItemMasterId].indexOf(prnItem.BatchId);
            var modified = $scope.itemUsedBatches[prnItem.ItemMasterId].indexOf(prnItem.SelectedBatchId);
            if (modified == -1) {
                prnItem.StockSerialItemId = selectedMasterItem.Id;
                prnItem.StockItemId = selectedMasterItem.StockItemId;
                prnItem.BatchId = selectedMasterItem.BatchId;
                prnItem.ExpiryDate = selectedMasterItem.ExpiryDate;
                prnItem.SelectedBatchId = selectedMasterItem.BatchId;
                prnItem.BatchQuantity = selectedMasterItem.Quantity;
                prnItem.UnitCostPrice = selectedMasterItem.Ucp;
                prnItem.PurchasePrice = selectedMasterItem.PurchasePrice;
                prnItem.MrPrice = selectedMasterItem.Mrp;
                prnItem.ManufacturerId = selectedMasterItem.ManufacturerId;
                prnItem.VendorMasterId = selectedMasterItem.VendorMasterId;
                prnItem.GrnId = selectedMasterItem.GrnId;
                prnItem.GrnDetailId = selectedMasterItem.GrnDetailId;
                prnItem.PrnQuantity = 0.00;
                prnItem.GrossAmount = 0.00;
                prnItem.NetAmount = 0.00;

                prnItem.GstId = selectedMasterItem.GstId;
                prnItem.GstPercentage = selectedMasterItem.GstPercentage;
                prnItem.UnitGstAmount = parseFloat(((prnItem.UnitCostPrice / 100) * selectedMasterItem.GstPercentage).toFixed(4));

                prnItem.InGstId = selectedMasterItem.InGstId;
                prnItem.InGstPercentage = selectedMasterItem.InGstPercentage;
                prnItem.UnitInGstAmount = parseFloat(((prnItem.UnitInGstAmount / 100) * selectedMasterItem.InGstPercentage).toFixed(4));

                prnItem.CGstId = selectedMasterItem.CGstId;
                prnItem.CGstPercentage = selectedMasterItem.CGstPercentage;
                prnItem.UnitCGstAmount = parseFloat(((prnItem.UnitCGstAmount / 100) * selectedMasterItem.CGstPercentage).toFixed(4));

                prnItem.SGstId = selectedMasterItem.SGstId;
                prnItem.SGstPercentage = selectedMasterItem.SGstPercentage;
                prnItem.UnitSGstAmount = parseFloat(((prnItem.UnitSGstAmount / 100) * selectedMasterItem.SGstPercentage).toFixed(4));

                if (existing > -1) {
                    $scope.itemUsedBatches[prnItem.ItemMasterId].splice(existing, 1);
                }
                $scope.itemUsedBatches[prnItem.ItemMasterId].push(prnItem.BatchId);
            } else if (modified > -1) {
                utl.Alert.showErrorMsg($translate.instant('inventory.purchasereturn.batchselectedmsg.lbl') + prnItem.ItemName);
                prnItem.SelectedBatchId = prnItem.BatchId;
            }
            $scope.computeAmount(prnItem);
            //             $scope.CalculateNetAmt();
        };

        $scope.onItemSelected = function (idx, selectedItem) {
            var prevItem = null;
            if (selectedItem.SelectedItem.ItemMaster.StockItem) {
                if (selectedItem.SelectedItem.ItemMaster.StockItem.StockSerialItems.length > 0) {
                    prevItem = selectedItem.PreviousItem;
                    var SelectedMasterItem = selectedItem.SelectedItem;
                    selectedItem.ItemMasterId = SelectedMasterItem.ItemMasterId;
                    selectedItem.BarCodeId = SelectedMasterItem.BarCodeId;
                    selectedItem.ItemCode = SelectedMasterItem.ItemCode;
                    selectedItem.ItemName = SelectedMasterItem.ItemName;
                    selectedItem.StoreMasterId = SelectedMasterItem.StoreMasterId;
                    selectedItem.GenericId = SelectedMasterItem.ItemMaster.GenericId;
                    selectedItem.GenericName = SelectedMasterItem.ItemMaster.GenericName;
                    selectedItem.ManufacturerId = SelectedMasterItem.ItemMaster.ManufacturerId;
                    selectedItem.ManufacturerName = SelectedMasterItem.ItemMaster.VendorName;
                    selectedItem.ScheduleTypeId = SelectedMasterItem.ItemMaster.ScheduleTypeId;
                    if (SelectedMasterItem.ItemMaster.ScheduleType) {
                        selectedItem.ScheduleTypeDescription = SelectedMasterItem.ItemMaster.ScheduleType.Description;
                    }

                    if (prevItem && prevItem.ItemMasterId != SelectedMasterItem.ItemMasterId) {
                        selectedItem.BatchDetails = [];
                        selectedItem.PrnQuantity = 0;
                        var existing = $scope.itemUsedBatches[prevItem.ItemMasterId].indexOf(prevItem.BatchId);
                        if (existing > -1) {
                            $scope.itemUsedBatches[prevItem.ItemMasterId].splice(existing, 1);
                        }
                        // $scope.computeAmount(selectedItem);
                    }

                    if (SelectedMasterItem.ItemMaster.StockItem &&
                        SelectedMasterItem.ItemMaster.StockItem.StockSerialItems.length > 0) {
                        selectedItem.TotalQuantity = SelectedMasterItem.ItemMaster.StockItem.Quantity;
                        var stockserialitems = SelectedMasterItem.ItemMaster.StockItem.StockSerialItems;
                        var usedBatches = $scope.itemUsedBatches[selectedItem.ItemMasterId] || [];
                        for (var batid = 0; batid < stockserialitems.length; batid++) {
                            var serialitem = stockserialitems[batid];
                            if (serialitem.Quantity > 0 && usedBatches.indexOf(serialitem.BatchId) == -1) {
                                serialitem.SerialDetails = [
                                    ' Batch: ', serialitem.BatchId,
                                    ' | Qty: ', serialitem.Quantity,
                                    ' | Expiry: ', $filter('date')(serialitem.ExpiryDate, 'd-MMM-y'),
                                    ' | UCP: ', serialitem.Ucp,
                                    ' | MRP: ', serialitem.Mrp,
                                    ' | PurchasePrice: ', serialitem.PurchasePrice
                                ].join(' ');

                                selectedItem.BatchDetails.push(serialitem);
                            }
                        }

                        if (selectedItem.BatchDetails && selectedItem.BatchDetails.length > 0) {
                            selectedItem.StockSerialItemId = selectedItem.BatchDetails[0].Id;
                            selectedItem.StockItemId = selectedItem.BatchDetails[0].StockItemId;
                            selectedItem.BatchId = selectedItem.BatchDetails[0].BatchId;
                            selectedItem.SelectedBatchId = selectedItem.BatchId;
                            selectedItem.ExpiryDate = selectedItem.BatchDetails[0].ExpiryDate;
                            selectedItem.BatchQuantity = selectedItem.BatchDetails[0].Quantity;
                            selectedItem.UnitCostPrice = selectedItem.BatchDetails[0].Ucp;
                            selectedItem.MrPrice = selectedItem.BatchDetails[0].Mrp;
                            selectedItem.PurchasePrice = selectedItem.BatchDetails[0].PurchasePrice;
                            selectedItem.ManufacturerId = selectedItem.BatchDetails[0].ManufacturerId;
                            selectedItem.VendorMasterId = selectedItem.BatchDetails[0].VendorMasterId;
                            selectedItem.GrnId = selectedItem.BatchDetails[0].GrnId;
                            selectedItem.GrnDetailId = selectedItem.BatchDetails[0].GrnDetailId;
                            selectedItem.ReturnReasonId = $scope.item.ReturnReasonId;

                            selectedItem.GstId = selectedItem.BatchDetails[0].GstId;
                            selectedItem.GstPercentage = selectedItem.BatchDetails[0].GstPercentage;
                            selectedItem.UnitGstAmount = parseFloat(((selectedItem.PurchasePrice / 100) * selectedItem.GstPercentage).toFixed(4));

                            selectedItem.InGstId = selectedItem.BatchDetails[0].InGstId;
                            selectedItem.InGstPercentage = selectedItem.BatchDetails[0].InGstPercentage;
                            selectedItem.UnitInGstAmount = parseFloat(((selectedItem.PurchasePrice / 100) * selectedItem.InGstPercentage).toFixed(4));

                            selectedItem.CGstId = selectedItem.BatchDetails[0].CGstId;
                            selectedItem.CGstPercentage = selectedItem.BatchDetails[0].CGstPercentage;
                            selectedItem.UnitCGstAmount = parseFloat(((selectedItem.PurchasePrice / 100) * selectedItem.CGstPercentage).toFixed(4));

                            selectedItem.SGstId = selectedItem.BatchDetails[0].SGstId;
                            selectedItem.SGstPercentage = selectedItem.BatchDetails[0].SGstPercentage;
                            selectedItem.UnitSGstAmount = parseFloat(((selectedItem.PurchasePrice / 100) * selectedItem.SGstPercentage).toFixed(4));

                            $scope.itemUsedBatches[selectedItem.ItemMasterId] = $scope.itemUsedBatches[selectedItem.ItemMasterId] || [];
                            $scope.itemUsedBatches[selectedItem.ItemMasterId].push(selectedItem.BatchId);
                        } else {
                            utl.Alert.showErrorMsg($translate.instant('inventory.purchasereturn.allbatchesmsg.lbl') + selectedItem.ItemName);
                            return false;
                        }
                    }

                    selectedItem.PreviousItem = {};
                    selectedItem.PreviousItem.BatchId = selectedItem.BatchId;
                    selectedItem.PreviousItem.ItemMasterId = selectedItem.ItemMasterId;
                    $scope.computeAmount(selectedItem);
                    var PharItemLineDetails = [];
                    for (var pildid = 0; pildid < $scope.PurchaseReturnDetails.length; pildid++) {
                        var PharItemLineDetail = $scope.PurchaseReturnDetails[pildid];
                        if (PharItemLineDetail.Status == 1) {
                            PharItemLineDetails.push(PharItemLineDetail);
                        }
                    }

                    var lastIndex = PharItemLineDetails.length - 1;
                    if (idx == lastIndex) {
                        $scope.addNewLineItem();
                    }
                }
            } else {
                prevItem = selectedItem.PreviousItem;

                selectedItem.BatchDetails = [];
                selectedItem.PrnQuantity = 0;
                selectedItem.TotalQuantity = 0;
                selectedItem.StockSerialItemId = 0;
                selectedItem.StockItemId = 0;
                selectedItem.BatchId = '';
                selectedItem.SelectedBatchId = '';
                selectedItem.ExpiryDate = '';
                selectedItem.BatchQuantity = 0;
                selectedItem.UnitCostPrice = 0.00;
                selectedItem.MrPrice = 0.00;
                selectedItem.ManufacturerId = 0;
                selectedItem.VendorMasterId = 0;
                selectedItem.GrnId = 0;
                selectedItem.GrnDetailId = 0;
                selectedItem.ReturnReasonId = -1;

                var existing = $scope.itemUsedBatches[prevItem.ItemMasterId].indexOf(prevItem.BatchId);
                if (existing > -1) {
                    $scope.itemUsedBatches[prevItem.ItemMasterId].splice(existing, 1);
                }
                $scope.computeAmount(selectedItem);
                utl.Alert.showErrorMsg($translate.instant('inventory.purchasereturn.allbatchesselectmsg.lbl') + selectedItem.SelectedItem.ItemName + ' (or) No Stock available to Return');
                return false;
            }
        };

        $scope.computeOtherCharges = function (item) {
            if (item.OtherCharges === undefined || item.OtherCharges === null)
                $scope.item.OtherCharges = 0;

            $scope.TotalGrossAmount = 0;
            // $scope.TotalDiscountAmount = 0;
            // $scope.TotalGstAmount = 0;
            // $scope.TotalCGstAmount = 0;
            // $scope.TotalSGstAmount = 0;
            // $scope.TotalNetAmount = 0;
            // $scope.GrnDiscount = 0;
            $scope.OtherCharges = 0;
            $scope.TotalNetAmount = 0;
            // $scope.TotalCreditAmount = 0;

            // $scope.item.RoundOff = 0;
            // $scope.item.TotalCreditAmount = 0;

            calculatetotalAmount();
        };


        $scope.computeAmount = function (item) {
            if (item.ReturnQty > item.BatchQuantity || item.ReturnQty === null) {
                utl.Alert.showErrorMsg($translate.instant('inventory.purchasereturn.qtynotexceed.lbl'));
                item.ReturnQty = 0;
            } else if (item.ReturnQty === null) { } else {
                item.GrossAmount = (item.UnitCostPrice * item.ReturnQty);
                item.GstAmount = (item.GstPercentage * item.UnitCostPrice) / 100 * (item.ReturnQty);
                if (item.GstAmount) {
                    item.NetAmount = (item.UnitCostPrice * item.ReturnQty) + (item.GstAmount);
                } else {
                    item.NetAmount = (item.UnitCostPrice * item.ReturnQty);
                }
                if (item.DiscountModeId == 1) {
                    item.NetAmount = (item.GrossAmount + item.GstAmount) - item.DiscountAmount;
                }
                if (item.DiscountModeId == 2) {
                    item.Discount = (item.UnitCostPrice * item.DiscountAmount) / 100 * (item.ReturnQty);
                    item.NetAmount = (item.GrossAmount + item.GstAmount) - item.Discount;
                }
            }

            $scope.TotalGrossAmount = 0;
            $scope.TotalNetAmount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalDiscountAmount = 0;

            calculatetotalAmount();
            $scope.calculatetotalQty(item);
        };
        $scope.calculatetotalQty = function (item) {
            if (item.ReturnQty) {
                item.PrnQuantity = item.ReturnQty + item.FreeQty;
            }
            if (item.PrnQuantity > item.BatchQuantity) {
                utl.Alert.showErrorMsg($translate.instant('inventory.purchasereturn.qtynotexceed.lbl'));
                item.ReturnQty = 0;
                item.FreeQty = 0;
            }
        }

        function calculatetotalAmount() {
            // $scope.TotalGrossAmount = $scope.item.TotalGrossAmount;
            $scope.OtherCharges = $scope.item.OtherCharges;
            $scope.Totalgstamt = 0;


            for (var idx in $scope.PurchaseReturnDetails) {
                var activeData = $scope.PurchaseReturnDetails[idx];
                if (activeData.ItemMasterId > 0 && activeData.Status == 1) {
                    $scope.TotalGrossAmount = parseFloat(($scope.TotalGrossAmount + activeData.GrossAmount).toFixed(2));
                    $scope.TotalNetAmount = parseFloat(($scope.TotalNetAmount + activeData.NetAmount).toFixed(2));
                    if (activeData.DiscountModeId == 1) {
                        $scope.TotalDiscountAmount = parseFloat(($scope.TotalDiscountAmount + activeData.DiscountAmount).toFixed(2));
                    }
                    if (activeData.DiscountModeId == 2) {
                        $scope.TotalDiscountAmount = parseFloat(($scope.TotalDiscountAmount + activeData.Discount).toFixed(2));

                    }
                    $scope.Totalgstamt = parseFloat(($scope.Totalgstamt + activeData.GstAmount).toFixed(2));
                }
            }

            $scope.item.TotalGrossAmount = $scope.TotalGrossAmount;
            $scope.item.TotalGrossAmount = $scope.TotalGrossAmount;
            $scope.item.TotalNetAmount = ($scope.TotalNetAmount) + ($scope.OtherCharges);
            $scope.item.TotalDiscountAmount = $scope.TotalDiscountAmount;
            $scope.item.TotalGstAmount = $scope.Totalgstamt;
        }

        vm.purchasereturncontrolconfig = {
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
            /*
            {
                header: 'Product Type Name',
                field: 'ProductTypeName',
                datatype: 'string',
                headercls: 'td-producttypename',
                fieldcls: 'td-producttypename'
            },
            */
            // {
            //     header: 'Generic Name',
            //     field: 'GenericName',
            //     datatype: 'string',
            //     headercls: 'td-genericname',
            //     fieldcls: 'td-genericname'
            // },
            /*
            {
                header: 'Manufacturer Name',
                field: 'ManufacturerName',
                datatype: 'string',
                headercls: 'td-manufacturername',
                fieldcls: 'td-manufacturername'
            },
            */
            // {
            //     header: 'Rack Name',
            //     field: 'RackName',
            //     datatype: 'string',
            //     headercls: 'td-rackname',
            //     fieldcls: 'td-rackname'
            // },
            {
                header: 'Stock-In-Hand',
                field: 'StockInHand',
                datatype: 'string',
                headercls: 'td-stockinhand',
                fieldcls: 'td-stockinhand'
            },
            {
                header: 'Sales Price',
                field: 'MrPrice',
                datatype: 'string',
                headercls: 'td-mrprice',
                fieldcls: 'td-mrprice'
            }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/itemmaster/GetPharmacyStoreItemForVendorReturn',
            formatdisplay: formatselectedprnitem,
            presearch: presearchprnitem,
            postsearch: postsearchprnitem
        };

        function formatselectedprnitem() {
            var selectedItem = vm.purchasereturncontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ItemName, selectedItem.ItemCode].join(' ');
            } else if (vm.purchasereturncontrolconfig.rowdata) {
                result = [vm.purchasereturncontrolconfig.rowdata.ItemName, vm.purchasereturncontrolconfig.rowdata.ItemCode].join(' ');
            }
            return result;
        }

        function presearchprnitem() {
            var query = vm.purchasereturncontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 1,
                    Value: $scope.item.StoreMasterId
                },
                {
                    Key: 13,
                    Value: 1
                }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };
            if ($scope.item.VendorMasterId > 0) {
                inputData.Params.push({
                    Key: 14,
                    Value: $scope.item.VendorMasterId
                });
            }
            if (vm.purchasereturncontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 3,
                    Value: query
                });
            }

            vm.purchasereturncontrolconfig.searchparams = inputData;
        }

        function postsearchprnitem() {
            for (var idx in vm.purchasereturncontrolconfig.result) {
                var item = vm.purchasereturncontrolconfig.result[idx];
                var SerialItems = null;
                var SerialQuantity = 0;
                item.ItemCode = '(' + item.ItemCode + ')';
                item.ItemName = item.ItemName;
                /*
                if (item.ItemMaster.ProductType !== null) {
                    item.ProductTypeName = item.ItemMaster.ProductType.ProductTypeName;
                } else {
                    item.ProductTypeName = '';
                }
                */
                item.GenericName = item.GenericName;
                /*
                if (item.ItemMaster.GenericMaster !== null) {
                    item.GenericName = item.ItemMaster.GenericMaster.GenericName;
                } else {
                    item.GenericName = '';
                }
                */
                /*
                item.ManufacturerName = item.ManufacturerName;
                */
                /*
                if (item.ItemMaster.Manufacturer !== null) {
                    item.ManufacturerName = item.ItemMaster.Manufacturer.VendorName;
                } else {
                    item.ManufacturerName = '';
                }
                */
                item.RackName = item.RackName;
                if (item.ItemMaster.StockItem !== null) {
                    if (item.ItemMaster.StockItem &&
                        item.ItemMaster.StockItem.StockSerialItems.length > 0) {
                        SerialItems = item.ItemMaster.StockItem.StockSerialItems;
                        for (var batid = 0; batid < SerialItems.length; batid++) {
                            SerialQuantity = SerialQuantity + SerialItems[batid].Quantity;
                        }
                    }
                    item.StockInHand = SerialQuantity;
                } else {
                    item.StockInHand = 0;
                }
                item.MrPrice = item.ItemMaster.MrPrice;
            }
        }

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
                field: 'MobileNumber',
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
                $scope.item.VendorCode = selectedItem.VendorCode;
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
                Params: [],
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

        // $scope.findgrn = function () {
        //     utl.Modal.open('app.findgrn-list', {
        //         params: {
        //             id: 0
        //         },
        //         confirmCallback: $scope.GrnCallback
        //     });
        // };


        $scope.GrnCallback = function (data) {
            if (data.grnId > 0) {
                $scope.item.GrnId = data.grnId;
                $scope.item.PrnTypeId = 2;
            }
            $scope.getGrnInfoById();
        };

        $scope.getGrnInfoById = function (currentfilter) {

            var inputData = {
                Params: [{
                    Key: 5,
                    Value: currentfilter.SelectedItem.InvoiceNumber
                },
                {
                    Key: 18,
                    Value: currentfilter.SelectedItem.GrnNumber
                },
                {
                    Key: 6,
                    Value: currentfilter.SelectedItem.GrnStatusId
                },],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'pharmacy/grn/GetGrns',
                data: inputData,
                type: 'post',
                onComplete: $scope.getGrnInfoCallback
            };
            utl.Http.doAction(options);

        };

        $scope.getGrnInfoCallback = function (scope, res, options, hasError) {
            $scope.PurchaseReturnInfo = res.Data || [];
            if ($scope.PurchaseReturnInfo && $scope.PurchaseReturnInfo.length > 0) {
                $scope.PurchaseReturnInfo.forEach(grn => {
                    $scope.item.PrnTypeId = 2;
                    $scope.item.StoreMasterId = grn.StoreMasterId;
                    $scope.item.VendorMasterId = grn.VendorMasterId;
                    $scope.item.VendorName = grn.VendorMaster.VendorName;
                    $scope.item.PurchaseOrderId = grn.PurchaseOrderId;
                    $scope.item.GrnId = grn.Id;
                    $scope.item.GrnDate = grn.GrnDate;
                    $scope.item.GrnNumber = grn.GrnNumber;
                    $scope.item.InvoiceNumber = grn.InvoiceNumber;
                    $scope.item.InvoiceDate = grn.InvoiceDate;
                    $scope.item.PoNumber = grn.PoNumber;
                    $scope.item.TotalGrossAmount = grn.TotalGrossAmount;
                    $scope.item.TotalDiscountAmount = grn.TotalDiscountAmount;
                    $scope.item.TotalGstAmount = grn.TotalGstAmount;
                    $scope.item.TotalInGstAmount = grn.TotalInGstAmount;
                    $scope.item.TotalCGstAmount = grn.TotalCGstAmount;
                    $scope.item.TotalSGstAmount = grn.TotalSGstAmount;
                    $scope.item.ShippingCharges = grn.ShippingCharges;
                    $scope.item.OtherCharges = grn.OtherCharges;
                    $scope.item.RoundOff = grn.RoundOff;
                    $scope.item.TotalNetAmount = grn.TotalNetAmount;
                    $scope.item.TotalReturnAmount = grn.TotalInvoiceAmount;
                    $scope.item.IsGrnReturn = true;
                    $scope.item.RdoPrnTypeId = true;
                    $scope.item.RdoFacilityId = true;
                    $scope.item.RdoStoreTypeId = true;
                    $scope.item.RdoStoreMasterId = true;
                    $scope.item.RdoVendorMasterId = true;

                    $scope.PurchaseReturnDetails = [];
                    $scope.PurchaseReturnDetails = grn.GrnDetails;
                    for (var pridx in $scope.PurchaseReturnDetails) {
                        var pritem = $scope.PurchaseReturnDetails[pridx];
                        if (pritem.ItemMasterId > 0) {
                            pritem.GrnDetailId = pritem.Id;
                            pritem.Id = 0;
                            if (pritem.PurchaseUom) {
                                pritem.UomCode = pritem.PurchaseUom.UomCode;
                            } else {
                                pritem.UomCode = '';
                            }
                            pritem.PoQuantity = pritem.PoQuantity;
                            pritem.GrnQuantity = pritem.GrnQuantity;
                            pritem.FreeQty = pritem.FreeQty;
                            pritem.PrnQuantity = pritem.GrnQuantity;
                            pritem.ConversionQuantity = pritem.ConversionQuantity;
                            pritem.TotalQuantity = pritem.TotalQuantity;
                            pritem.TotalQuantityAfterConversion = pritem.TotalQuantityAfterConversion;
                            if (pritem.StockSerialItems) {
                                pritem.StockItemId = pritem.StockSerialItems[0].StockItemId;
                                pritem.StockSerialItemId = pritem.StockSerialItems[0].Id;
                                pritem.AvailableQuantity = pritem.StockSerialItems[0].Quantity;
                            } else {
                                pritem.StockItemId = 0;
                                pritem.StockSerialItemId = 0;
                                pritem.AvailableQuantity = 0;
                            }
                            pritem.BarCodeId = pritem.BarCodeId;
                            pritem.BatchId = pritem.BatchId;
                            pritem.ExpiryDate = pritem.ExpiryDate;
                            pritem.UomPrice = pritem.UomPrice;
                            if (pritem.DiscountModeId == 1) {
                                pritem.DiscountMode = 'Rs.';
                            } else {
                                pritem.DiscountMode = '%';
                            }
                            pritem.Discount = pritem.Discount;
                            pritem.GstPercentage = pritem.GstPercentage;
                            pritem.InGstPercentage = pritem.InGstPercentage;
                            pritem.CGstPercentage = pritem.CGstPercentage;
                            pritem.SGstPercentage = pritem.SGstPercentage;
                            pritem.UomCostPrice = pritem.UomCostPrice;
                            pritem.UomMrPrice = pritem.UomMrPrice;
                            pritem.NetAmount = pritem.NetAmount;
                            pritem.RdoItemMasterId = true;
                        }
                    }

                    $scope.applyVisibilityRules();
                    $scope.setIndexforTableIndex();
                });
            }
        };


        vm.grncontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Grn No',
                field: 'GrnNumber',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Invoice No',
                field: 'InvoiceNumber',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            {
                header: 'Vendor Name',
                field: 'VendorName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/grn/GetGrnList',
            formatdisplay: formatselecteduser,
            presearch: presearchuser,
            postsearch: postsearchuser
        };

        function formatselecteduser() {
            var selectedItem = vm.grncontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.GrnNumber].join('  ');
            } else if (vm.grncontrolconfig.rowdata) {
                result = [vm.grncontrolconfig.rowdata.GrnId, vm.grncontrolconfig.rowdata.GrnNumber].join(' ');
            }

            if (selectedItem && selectedItem.Id)
                $scope.currentfilter.GrnId = selectedItem.Id;

            return result;
        }

        function presearchuser() {
            var query = vm.grncontrolconfig.query;
            var inputData = {
                Params: [
                    {
                        Key: 4,
                        Value: $scope.currentfilter.VendorMasterId
                    },
                    {
                        Key: 6,
                        Value: '2,3,4'
                    },
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.grncontrolconfig.searchbyid == true) {
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

            vm.grncontrolconfig.searchparams = inputData;
        }

        function postsearchuser() {
            for (var idx in vm.grncontrolconfig.result) {
                var item = vm.grncontrolconfig.result[idx];
                item.GrnId = item.Id;
            }
        }

        $scope.onReasonSelected = function (selectedItem) {
            for (var idx in $scope.PurchaseReturnDetails) {
                if ($scope.PurchaseReturnDetails[idx].ItemMasterId > 0)
                    $scope.PurchaseReturnDetails[idx].ReturnReasonId = $scope.item.ReturnReasonId;
            }
        };

        $scope.SelectedReturnStore = function (selectedItem) {
            $scope.item.StoreCode = selectedItem.StoreCode;
            $scope.item.StoreName = selectedItem.StoreName;
        };

        $scope.onVendorSelected = function (selectedItem) {
            $scope.item.VendorMasterId = selectedItem.VendorMasterId;
            $scope.item.VendorName = selectedItem.VendorName;
            $scope.item.IsGrnReturn = false;
        };

        $scope.OnPrntypeSelect = function (selectedItem) {
            $scope.item.PrnType = selectedItem.Text;
        };

        function loadData() {
            if ($scope.currentcontext.id > 0) {
                $scope.getPurchaseReturnInfoById();
            } else {
                if ($scope.item.PrnTypeId == 1) {
                    $scope.addNewLineItem();
                }

            }
            //$scope.getItem();
            $scope.getpurchasereturnsDetails();
            $scope.applyVisibilityRules();
        }

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.item.StoreMasterId === 0) {
                    $scope.item.StoreMasterId = value[0].Id;
                }
            });

            loadData();
        };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Organization"
            },
            {
                "Key": "Facility"
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
            {
                "Key": "StoreType"
            },
            {
                "Key": "PrnType"
                // Default: false
            },
            {
                "Key": "ReturnReason"
            },
            {
                "Key": "DiscountMode"
            }
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

    purchasereturnAmendFormController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$timeout'];

})();