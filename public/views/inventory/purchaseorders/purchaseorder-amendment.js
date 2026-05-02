(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('purchaseOrderAmendController', purchaseOrderAmendController);

    function purchaseOrderAmendController($rootScope, $scope, $stateParams, $state, $translate, utl, $filter, $timeout) {
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

        $scope.dmprintpreferences = 0;
        $scope.printpreferences = 1;


        function pr(prdata) {
            $state.go('app.purchaserequest', {
                id: prdata.prid
            });
        }
        $scope.ispoauthorized = 0;
        $scope.ispoauthorized =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'ispoauthorized');

        function poData(data) {
            $scope.currentcontext.id = data.poId;
            $scope.getItem();
            $scope.getPurchaseOrderDetails();
        }

        function prData(data) {
            $scope.getPurchaseRequest(data.prid);
        }

        $scope.findpo = function () {
            utl.Modal.open('app.findpo-list', {
                params: {
                    id: 0
                },
                confirmCallback: poData
            });
        };

        $scope.findpr = function () {
            utl.Modal.open('app.findpr-list', {
                params: {
                    id: 0
                },
                confirmCallback: prData
            });
        };

        $scope.vendorprofiledetails = function (VendorMasterId) {
            utl.Modal.open('app.vendorprofile', {
                params: {
                    vid: VendorMasterId
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.item = {
            StoreMasterId: 0,
            DeliveryStoreMasterId: -1,
            IsGeneralPo: false,
            VendorFacilityMapId: -1,
            VendorMasterId: -1,
            VendorName: '',
            PoTypeId: 1,
            StoreTypeId: 0,
            FacilityId: utl.Session.getCurrentFacilityId(),
            TotalGrossAmount: 0,
            TotalDiscountAmount: 0,
            TotalGstAmount: 0,
            TotalInGstAmount: 0,
            TotalCGstAmount: 0,
            TotalSGstAmount: 0,
            OtherCharges: 0,
            TotalNetAmount: 0,
            TotalSaleAmount: 0,
            Comments: null,
            isDisabled: false,
            DisableComments: false,
            RBDisabled: true,
            PoNumber: null,
            RequestedBy: utl.Session.getCurrentUserId(),
            DisplayPoStatus: null,
            PurchaseRequestId: 0,
            Email: null,
            Password: null,
            EmailAddress: null,
            IsOpenPO: false,
            IsGstEditablePo: false,
        };

        $scope.currentfilter = {
            filter_potype: -1,
            filter_postatus: '',
            filter_fromstore: -1,
            filter_vendor: -1,
            filter_from: null,
            filter_to: null
        };

        $scope.currentfilter.filter_potype = $stateParams.filter_potype;
        $scope.currentfilter.filter_postatus = $stateParams.filter_postatus;
        $scope.currentfilter.filter_fromstore = $stateParams.filter_fromstore;
        $scope.currentfilter.filter_vendor = $stateParams.filter_vendor;
        $scope.currentfilter.filter_from = $stateParams.filter_from;
        $scope.currentfilter.filter_to = $stateParams.filter_to;
        $scope.currentcontext = {};
        $scope.item.WithHeader = true;
        $scope.item.WithoutHeader = false;
        $scope.currentcontext.CanPurchaseOrder_Save = utl.Privilege.hasAccess('CanPurchaseOrder_Save')
        $scope.currentcontext.CanPurchaseOrder_Authorize = utl.Privilege.hasAccess('CanPurchaseOrder_Authorize')
        $scope.currentcontext.CanPurchaseOrder_Approve = utl.Privilege.hasAccess('CanPurchaseOrder_Approve')

        $scope.Clear = function () {
            $scope.item = {};
            $scope.fillDefaultValues();
        };

        $scope.lookup = {};
        $scope.currentcontext = {
            id: -1,
            attachmentcount: 0,
        };
        $scope.OnSelectGstothercharges = function (item, selectedItem) {
            var gstitem = selectedItem;
            item.OtherChargesGstId = gstitem.Id;
            item.OtherChargesGstPercentage = gstitem.GstPercentage;
            $scope.computeOtherGstAmountCharges(item);
        };
        $scope.computeOtherGstAmountCharges = function (item) {
            $scope.OtherCharges = 0;
            $scope.OCGstAmount = 0;
            if (item.OtherChargesGstId > 0) {
                item.OtherChargesGstId = item.OtherChargesGstId;
                item.OtherChargesGstPercentage = parseFloat(item.OtherChargesGstPercentage);
            }
            if (parseFloat(item.OtherCharges) > 0)
                $scope.OtherCharges = parseFloat(item.OtherCharges || 0);
            $scope.OCGstAmount = (parseFloat(item.OtherCharges || 0) / 100) * parseFloat(item.OtherChargesGstPercentage || 0).toFixed(2);
            $scope.item.OtherChargesGstAmount = $scope.OCGstAmount;
            $scope.OtherCharges = (parseFloat($scope.item.OtherChargesGstAmount) + parseInt(item.OtherCharges));

            $scope.TotalGrossAmount = 0;
            $scope.TotalDiscountAmount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalInGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmount = 0;
            $scope.TotalSaleAmount = 0;
            $scope.TotalProfitAmount = 0;
            // $scope.RoundOff = 0;
            // $scope.item.OtherChargesGstAmount = 0
            calculatetotalAmount();
            // $scope.item.TotalNetAmount = $scope.TotalNetAmount + ($scope.OtherCharges || 0);
            // $scope.item.TotalAmount = $scope.TotalNetAmount + ($scope.OtherCharges || 0);
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

        $scope.addNew = function () {
            if ($stateParams.id > 0)
                $state.go('app.purchaseorder', {
                    id: 0,
                    poId: 0
                });
            else
                $state.reload();
        };

        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.item.PoDate = utl.Formatter.getCurrentDate();
        $scope.item.StoreName = '';
        $scope.item.DeliveryStoreName = '';
        $scope.item.VendorName = '';
        $scope.purchaseorderDetails = [];

        $scope.canShowPrintBtn = false;
        $scope.canShowDMPrintBtn = false;
        $scope.canShowSaveBtn = true;
        $scope.canShowSaveandApproveBtn = true;
        $scope.canShowAuthorizeBtn = true;
        $scope.canShowClearBtn = true;
        $scope.canShowCancelBtn = true;

        $scope.applyVisibilityRules = function () {
            // New
            if ($scope.item.PoStatusId != 1 || $scope.item.PoStatusId != 2 || $scope.item.PoStatusId != 3 || $scope.item.PoStatusId != 4 || $scope.item.PoStatusId != 5) {
                $scope.canShowPrintBtn = false;
                $scope.canShowDMPrintBtn = false;
                $scope.canShowSaveBtn = true;
                $scope.canShowSaveandApproveBtn = true;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowClearBtn = true;
                $scope.canShowCancelBtn = false;
                $scope.canShowHistoryBtn = false;
                $scope.canShowDeleteBtn = false;
                $scope.canShowCancelpoBtn = false;
            }
            // When In Draft Status
            if ($scope.item.PoStatusId == 1) {
                $scope.canShowPrintBtn = true;
                $scope.canShowDMPrintBtn = true;
                $scope.canShowSaveBtn = true;
                $scope.canShowSaveandApproveBtn = true;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowClearBtn = true;
                $scope.canShowCancelBtn = true;
                $scope.canShowDeleteBtn = true;
                $scope.canShowHistoryBtn = false;
                $scope.canShowCancelpoBtn = false;
            }
            // When In Approved Status
            if ($scope.ispoauthorized == 1) {
                if ($scope.item.PoStatusId == 2) {
                    $scope.canShowPrintBtn = false;
                    $scope.canShowDMPrintBtn = true;
                    $scope.canShowSaveBtn = false;
                    $scope.canShowSaveandApproveBtn = true;
                    $scope.canShowAuthorizeBtn = true;
                    $scope.canShowClearBtn = false;
                    $scope.canShowCancelBtn = false;
                    $scope.canShowDeleteBtn = false;
                    $scope.canShowHistoryBtn = true;
                    $scope.canShowCancelpoBtn = true;
                }
            } else {
                if ($scope.item.PoStatusId == 2) {
                    $scope.canShowPrintBtn = true;
                    $scope.canShowDMPrintBtn = true;
                    $scope.canShowSaveBtn = false;
                    $scope.canShowSaveandApproveBtn = true;
                    $scope.canShowAuthorizeBtn = true;
                    $scope.canShowClearBtn = false;
                    $scope.canShowCancelBtn = false;
                    $scope.canShowDeleteBtn = false;
                    $scope.canShowHistoryBtn = true;
                    $scope.canShowCancelpoBtn = true;
                }
            }
            // When In Authorized Status
            if ($scope.item.PoStatusId == 3) {
                $scope.canShowPrintBtn = true;
                $scope.canShowDMPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.canShowDeleteBtn = false;
                $scope.canShowHistoryBtn = true;
                $scope.canShowCancelpoBtn = true;
            }

            // When In Completed Status
            if ($scope.item.PoStatusId == 4) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.canShowHistoryBtn = true;
                $scope.canShowCancelpoBtn = false;
                $scope.canShowDeleteBtn = false;
                $scope.canShowCancelpoBtn = true;
            }
            // When In Cancelled Status
            if ($scope.item.PoStatusId == 5) {
                $scope.canShowPrintBtn = true;
                $scope.canShowDMPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.canShowDeleteBtn = false;
                $scope.canShowHistoryBtn = true;
                $scope.canShowCancelpoBtn = false;
            }
        };

        $scope.addNewLineItem = function () {
            var NotEditMrPrice = false;
            var EditMrPrice = true;
            if ($scope.ShowMrp) {
                NotEditMrPrice = true;
                EditMrPrice = false;
            }
            var purchaseorderDetail = {
                Id: 0,
                SNo: 0,
                ItemMasterId: -1,
                ItemCode: '',
                IsBillable: false,
                ItemName: '',
                GenericId: -1,
                StoreMasterId: 0,
                itemidxdesc: null,
                itemidxqty: null,
                BaseUomId: 0,
                BaseUom: {
                    Id: 0,
                    UomCode: ''
                },
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
                PurchaseRequestId: 0,
                AvailableQuantity: 0,
                PoQuantity: 0,
                FreeQty: 0,
                ConversionQuantity: 1,
                FreeQuantity: 0,
                UomPrice: 0,
                PurchasePrice: 0,
                DiscountModeId: -1,
                DiscountMode: '',
                Discount: 0,
                DiscountAmount: 0,
                UomDiscountAmount: 0,
                UnitDiscountAmount: 0,
                UomPriceAfterDiscount: 0,
                PurchasePriceAfterDiscount: 0,
                GstId: 0,
                InGstId: 0,
                CGstId: 0,
                SGstId: 0,
                GstMaster: {
                    Id: 0,
                    GstCode: '',
                    GstName: '',
                    GstPercentage: ''
                },
                InGstMaster: {
                    Id: 0,
                    GstCode: '',
                    GstName: '',
                    GstPercentage: ''
                },
                CGstMaster: {
                    Id: 0,
                    GstCode: '',
                    GstName: '',
                    GstPercentage: ''
                },
                SGstMaster: {
                    Id: 0,
                    GstCode: '',
                    GstName: '',
                    GstPercentage: ''
                },
                GstCode: '',
                InGstCode: '',
                CGstCode: '',
                SGstCode: '',
                GstPercentage: 0,
                InGstPercentage: 0,
                CGstPercentage: 0,
                SGstPercentage: 0,
                GstAmount: 0,
                InGstAmount: 0,
                CGstAmount: 0,
                SGstAmount: 0,
                UomGstAmount: 0.00,
                UomInGstAmount: 0.00,
                UomCGstAmount: 0.00,
                UomSGstAmount: 0.00,
                UnitGstAmount: 0.00,
                UnitInGstAmount: 0.00,
                UnitCGstAmount: 0.00,
                UnitSGstAmount: 0.00,
                UomCostPrice: 0.00,
                UnitCostPrice: 0.00,
                UomMrPrice: 0.00,
                UnitMrPrice: 0.00,
                GrossAmount: 0.00,
                NetAmount: 0.00,
                SaleAmount: 0.00,
                ProfitAmount: 0.00,
                ProfitPercentage: 0.00,
                Status: 1,
                IsMRPRequired: false,
                RdoItemMasterId: false,
                CanEditUomMrPrice: EditMrPrice,
                CanNotEditUomMrPrice: NotEditMrPrice,
                tabindex: $scope.tabindexmap.detailtabindex++
            };

            if ($scope.currentcontext.id > 0) {
                purchaseorderDetail.PurchaseOrderId = $scope.currentcontext.id;
            }

            $scope.purchaseorderDetails.push(purchaseorderDetail);
            $scope.setIndexforTableIndex();
        };

        $scope.add_new = function () {
            utl.Modal.open('app.purchaseorderdetail', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.onDetailSave
            });
        };

        $scope.Clear = function () {
            savehitcompleted = 0;
            $scope.purchaseorderDetails = [];
            $scope.addNewLineItem();
        };

        $scope.addnewclear = function () {
            if ($stateParams.id > 0) {
                $state.go('app.purchaseorder', {
                    id: 0
                })
            } else
                $state.reload();
        };

        $scope.vendordetails = function () {
            utl.Modal.open('app.modalvendor', {
                params: {
                    id: $scope.item.VendorMasterId
                },
                confirmCallback: $scope.onDetailSave
            });
        };

        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.id,
                Data: {
                    isprint: false,
                    withHeader: $scope.item.WithHeader,
                    withoutHeader: $scope.item.WithoutHeader,
                }
            };
            var options = {
                action: 'pharmacy/PurchaseOrder/PrintPurchaseOrder',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.alternateDetails = function (idx, item) {
            if (item.ItemMasterId > 0) {
                utl.Modal.open('app.purchasealternates', {
                    params: {
                        genericid: item.GenericId,
                        itemmasterid: item.ItemMasterId,
                        itemcode: item.ItemCode,
                        itemname: item.ItemName,
                        storemasterid: $scope.item.StoreMasterId
                    },
                    confirmCallback: $scope.getList
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.emptyrowmsg.lbl'));
            }
        };

        $scope.history = function (HistoryId) {
            utl.Modal.open('app.purchaseorderhistory', {
                params: {
                    hid: $scope.currentcontext.id
                }
            });
        };

        $scope.History = function (item, idx) {
            if (item.ItemMasterId > 0) {
                utl.Modal.open('app.pohistory', {
                    params: {
                        vendormasterid: $scope.item.VendorMasterId,
                        itemmasterid: item.ItemMasterId,
                        itemcode: item.ItemCode,
                        itemname: item.ItemName,
                        storemasterid: $scope.item.StoreMasterId,
                        item: item
                    },
                    confirmCallback: $scope.getList
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.emptyrowmsg.lbl'));
            }
        };

        $scope.Stock = function (selectedItem, idx) {
            if (selectedItem.ItemMasterId > 0) {
                utl.Modal.open('app.postockdetails', {
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

            $scope.item.OtherCharges = 0;

            $scope.item.TotalGrossAmount = 0;
            $scope.item.TotalDiscountAmount = 0;
            $scope.item.TotalGstAmount = 0;
            $scope.item.TotalInGstAmount = 0;
            $scope.item.TotalCGstAmount = 0;
            $scope.item.TotalSGstAmount = 0;
            $scope.item.TotalNetAmount = 0;
            $scope.item.TotalSaleAmount = 0;
            $scope.item.TotalProfitAmount = 0;

            $scope.TotalGrossAmount = 0;
            $scope.TotalDiscountAmount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalInGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmount = 0;
            $scope.TotalSaleAmount = 0;
            $scope.TotalProfitAmount = 0;

            calculatetotalAmount();
            $scope.setIndexforTableIndex();
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        };

        $scope.DeleteConfirmed = function (deleteId) {
            var options = {
                action: 'pharmacy/purchaseorder/DeletePurchaseOrder',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
            $scope.backToList();
        };

        $scope.draftDelete = function () {
            utl.Dialog.confirmDelete($scope.DeleteConfirmed, $scope.currentcontext.id);
        };

        $scope.deletePurchaseOrderDetail = function (idx, selectedItem) {
            if (selectedItem.ItemMasterId > 0) {
                var name = "this item" || '';
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, selectedItem, name);
            }
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.editPurchaseOrderDetail = function (item) {
            item.currenteditable = true;
            utl.Modal.open('app.purchaseorderdetail', {
                params: {
                    id: $scope.currentcontext.id,
                    current_item: item
                },
                confirmCallback: $scope.onDetailSave
            });
        };

        $scope.onDetailSave = function (itemFromModal) {
            var isaddnew = true;
            for (var idx in $scope.purchaseorderDetails) {
                var item = $scope.purchaseorderDetails[idx];
                if (item.currenteditable) {
                    item = itemFromModal;
                    item.currenteditable = false;
                    isaddnew = false;
                }
            }
            if (isaddnew) {
                itemFromModal.Status = 1;
                if ($scope.currentcontext.id > 0) {
                    itemFromModal.PurchaseOrderId = $scope.currentcontext.id;
                }
                $scope.purchaseorderDetails.push(itemFromModal);
            }
        };

        $scope.getPurchaseOrderDetailsCallback = function (scope, res, options, hasError) {
            $scope.purchaseorderDetails = res.Data || [];
            for (var idx in $scope.purchaseorderDetails) {
                var poitem = $scope.purchaseorderDetails[idx];
                if (poitem.ItemMasterId > 0) {
                    if (poitem.DiscountModeId == 1) {
                        poitem.DiscountMode = 'Rs.';
                    } else {
                        poitem.DiscountMode = '%';
                    }
                    poitem.GstCode = poitem.GstMaster.GstCode;
                    poitem.InGstCode = poitem.InGstMaster.GstCode;
                    poitem.CGstCode = poitem.CGstMaster.GstCode;
                    poitem.SGstCode = poitem.SGstMaster.GstCode;
                    poitem.ProfitPercentage = ((poitem.ProfitAmount / poitem.NetAmount) * 100).toFixed(2);
                    if ($scope.ShowMrp) {
                        poitem.CanNotEditUomMrPrice = true;
                        poitem.CanEditUomMrPrice = false;
                    } else {
                        poitem.CanNotEditUomMrPrice = false;
                        poitem.CanEditUomMrPrice = true;
                    }
                    if (poitem.ItemMaster.IsMRPRequired)
                        poitem.IsMRPRequired = true;
                }

                if ($scope.item.PoStatusId >= 2 || $scope.item.PurchaseRequestId !== 0)
                    poitem.RdoItemMasterId = true;

                if (poitem.RequestedStore) {
                    $scope.item.StoreTypeId = poitem.RequestedStore.StoreTypeId;
                }
            }

            // if ($scope.item.PoStatusId == 1 && $scope.item.PurchaseRequestId === 0) {
            $scope.addNewLineItem();
            // }

            $scope.setIndexforTableIndex();
        };

        $scope.getPurchaseOrderDetails = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [{
                            Key: 1,
                            Value: $scope.currentcontext.id
                        },
                        {
                            Key: 6,
                            Value: $scope.currentfilter.filter_fromstore
                        }
                    ],
                    PageContext: {
                        PageSize: 1000,
                        PageNumber: 1
                    }
                };

                var options = {
                    action: 'pharmacy/purchaseorderdetail/GetPurchaseOrderDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getPurchaseOrderDetailsCallback
                };
                utl.Http.doAction(options);
            }
            // else {
            //     $scope.addNewLineItem();
            // }
        };

        $scope.getPurchaseRequest = function (id) {
            $scope.item.PurchaseRequestId = id;
            $scope.getPurchaseRequestById();
            $scope.getPurchaseRequestDetails();
        };

        $scope.getPurchaseRequestById = function () {
            if ($scope.item.PurchaseRequestId && $scope.item.PurchaseRequestId > 0) {
                var options = {
                    action: 'pharmacy/purchaserequest/getPurchaseRequestById',
                    data: {
                        Id: $scope.item.PurchaseRequestId
                    },
                    type: 'post',
                    onComplete: $scope.getPurchaseRequestCallback
                };
                utl.Http.doAction(options);
            } else {}
        };

        $scope.getPurchaseRequestCallback = function (scope, data, options, hasError) {
            var result = data;
            $scope.item.DeliveryStoreMasterId = result.StoreMasterId;
            $scope.item.RequestedBy = result.RequestedBy;
            $scope.item.PrDate = result.RequestedDate;
            $scope.item.PrNumber = result.PrNumber;
            $scope.item.VendorMasterId = result.VendorMasterId;
            $scope.item.DeliveryDate = result.ExpectedDeliveryDate;
        };

        $scope.getPurchaseRequestDetails = function () {
            if ($scope.item.PurchaseRequestId && $scope.item.PurchaseRequestId > 0) {
                var inputData = {
                    Params: [{
                        Key: 1,
                        Value: $scope.item.PurchaseRequestId
                    }],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };

                var options = {
                    action: 'pharmacy/purchaserequestdetail/getPurchaseRequestDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getPurchaseRequestDetailsCallback
                };
                utl.Http.doAction(options);
            } else {}
        };

        $scope.getPurchaseRequestDetailsCallback = function (scope, res, options, hasError) {
            $scope.purchaseorderDetails = res.Data || [];
            for (var idx in $scope.purchaseorderDetails) {
                var poitem = $scope.purchaseorderDetails[idx];
                if (poitem.ItemMasterId > 0) {
                    poitem.Id = 0;
                    poitem.PoQuantity = 0;
                    if (poitem.DiscountModeId == 1) {
                        poitem.DiscountMode = 'Rs.';
                    } else {
                        poitem.DiscountMode = '%';
                    }

                    poitem.BaseUomId = poitem.BaseUom.Id;
                    poitem.BaseUom.Id = poitem.BaseUom.Id;
                    poitem.BaseUom.UomCode = poitem.BaseUom.UomCode;
                    poitem.PurchaseUomId = poitem.PurchaseUom.Id;
                    poitem.PurchaseUom.Id = poitem.PurchaseUom.Id;
                    poitem.PurchaseUom.UomCode = poitem.PurchaseUom.UomCode;
                    poitem.GstCode = poitem.GstMaster.GstCode;
                    poitem.InGstCode = poitem.InGstMaster.GstCode;
                    poitem.CGstCode = poitem.CGstMaster.GstCode;
                    poitem.SGstCode = poitem.SGstMaster.GstCode;
                }

                if ($scope.item.PurchaseRequestId !== 0)
                    poitem.RdoItemMasterId = true;
            }
        };

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            if (data.PoStatusId == 1) {
                // $scope.item.isDisabled = false;
                // $scope.item.RBDisabled = true;
                $scope.item.DisplayPoStatus = 'Draft';
            }
            if (data.PoStatusId == 2) {
                // $scope.item.isDisabled = true;
                // $scope.item.RBDisabled = true;
                $scope.item.DisplayPoStatus = 'Approved';
            }
            if (data.PoStatusId == 3) {
                // $scope.item.isDisabled = true;
                // $scope.item.RBDisabled = true;
                // $scope.item.DisableComments = true;
                $scope.item.DisplayPoStatus = 'Authorized';
            }
            if (data.PoStatusId == 4) {
                // $scope.item.isDisabled = true;
                // $scope.item.RBDisabled = true;
                // $scope.item.DisableComments = true;
                // $scope.item.DisplayPoStatus = 'Completed';
            }
            if (data.PoStatusId == 5) {
                // $scope.item.isDisabled = true;
                // $scope.item.RBDisabled = true;
                // $scope.item.DisableComments = true;
                $scope.item.DisplayPoStatus = 'Cancelled';
            }
            $scope.currentfilter.filter_fromstore = data.StoreMasterId;
            if (data.AmendedBy > 0) {
                $scope.item.IsAmended = 'Amended';
            }
            // $scope.addNewLineItem();
            $scope.applyVisibilityRules();
        };
        $scope.SaveandAmend = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'inventory.purchaseorder.amendmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandAmendConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onSaveandAmendConfirmed = function () {
            $scope.item.AmendedBy = utl.Session.getCurrentUserId();
            $scope.item.AmendedDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };
        $scope.getItem = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'pharmacy/purchaseorder/GetPurchaseOrderById',
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

        $scope.purchaseOrderNumCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            savehitcompleted = 0;
            console.log(data);
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Your Purchase Order has been Approved!.. Ref No is ' + '<br>' + '<b>' + data.PoNumber + '</b>',
                okkey: 'OK',
                // noKey: 'common.nokey.lbl',
                onSuccessMethod: function () {
                    loadData();
                }
            };

            utl.Dialog.SuccessMessage(confirmOptions);


            // $scope.backToList();
        };
        $scope.getpurchaseOrderNum = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'pharmacy/purchaseorder/GetPurchaseOrderByIdWithoutDetails',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.purchaseOrderNumCallback
                };
                utl.Http.doAction(options);
            }
            // else {
            //     $scope.applyVisibilityRules();
            // }
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            savehitcompleted = 0;
            if (data === true) {
                $scope.currentcontext.id = options.data.Data.Header.Id;
            } else {
                $scope.currentcontext.id = data;
            }
            loadData();
            // $scope.getpurchaseOrderNum();
            // $scope.backToList();
        };

        $scope.backToList = function () {
            $state.go('app.purchaseorders', {
                filter_id: $scope.currentcontext.id,
                filter_potype: $scope.currentfilter.filter_potype,
                filter_postatus: $scope.currentfilter.filter_postatus,
                filter_fromstore: $scope.currentfilter.filter_fromstore,
                filter_vendor: $scope.currentfilter.filter_vendor,
                filter_from: $scope.currentfilter.filter_from,
                filter_to: $scope.currentfilter.filter_to
            });
        };

        $scope.SaveandDraft = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'inventory.purchaseorder.savemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandDraftConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onSaveandDraftConfirmed = function () {
            $scope.item.PoStatusId = 1;
            $scope.item.PoDate = utl.Formatter.getCurrentDate();
            $scope.item.RequestedBy = utl.Session.getCurrentUserId();
            $scope.item.RequestedDate = utl.Formatter.getCurrentDate();
            savehitcompleted = 0;
            $scope.saveItem();
        };

        $scope.SaveandApprove = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'inventory.purchaseorder.approvemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandApproveConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onSaveandApproveConfirmed = function () {
            if ($scope.item.PoStatusId == 1) {} else {
                $scope.item.RequestedBy = utl.Session.getCurrentUserId();
                $scope.item.RequestedDate = utl.Formatter.getCurrentDate();
            }
            $scope.item.PoStatusId = 2;
            $scope.item.PoDate = utl.Formatter.getCurrentDate();
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
                messageKey: 'Do you want to approve PO?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandAuthorizeConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onSaveandAuthorizeConfirmed = function () {
            $scope.item.PoStatusId = 3;
            $scope.item.AuthorizedBy = utl.Session.getCurrentUserId();
            $scope.item.AuthorizedDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.onComplete = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'inventory.purchaseorder.completemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onCompleteConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onCompleteConfirmed = function () {
            $scope.item.PoStatusId = 4;
            $scope.item.CompletedBy = utl.Session.getCurrentUserId();
            $scope.item.CompletedDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.CancelPO = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'inventory.purchaseorder.cancelmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onCancelPOConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onCancelPOConfirmed = function () {
            $scope.item.PoStatusId = 5;
            $scope.item.CancelledBy = utl.Session.getCurrentUserId();
            $scope.item.CancelledDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.amountConversion = function (amount) {
            return parseFloat(amount).toFixed(2);
        };

        $scope.saveItem = function () {
            if (savehitcompleted == 1) return false;

            if ($scope.item.VendorMasterId <= 0) {
                utl.Alert.showErrorMsg($translate.instant('Please Select Purchaseorder Supplier'));
                return false;
            }
            if (!utl.Validator.validate($scope)) {
                return;
            }
            if (checkMandatoryFields()) {
                var lines = getLinesForSave();

                var actionName = 'pharmacy/purchaseorder/AddPurchaseOrder';
                if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                    actionName = 'pharmacy/purchaseorder/UpdatePurchaseOrder';
                }
                savehitcompleted = 1;
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
            }
        };

        function checkMandatoryFields() {
            if ($scope.purchaseorderDetails.length > 1 && $scope.item.PurchaseRequestId === 0) {
                for (var iddx in $scope.purchaseorderDetails) {
                    var iddxitem = $scope.purchaseorderDetails[iddx];
                    // if (iddxitem.IsBillable === true || iddxitem.ItemMaster.IsBillable === true) {
                    //     if (iddxitem.MrPrice == 0) {
                    //         utl.Alert.showErrorMsg(`${iddxitem.ItemName}: ${$translate.instant('MRP should not be 0')}`);
                    //         return false;
                    //     }
                    //     if (iddxitem.MrPrice < iddxitem.PurchasePrice) {
                    //         utl.Alert.showErrorMsg(`${iddxitem.ItemName}: ${$translate.instant('MRP should not be less than Purchase Price')}`);
                    //         return false;
                    //     }
                    // }
                    if (iddxitem.ItemMasterId > 0 && iddxitem.PoQuantity <= 0 && iddxitem.Status === 1) {
                        utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.enterqtymsg.lbl') + iddxitem.ItemName);
                        return false;
                    } else if (iddxitem.ItemMasterId > 0 && iddxitem.UomPrice <= 0 && iddxitem.Status === 1) {
                        utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.pricegreaterzeromsg.lbl') + iddxitem.ItemName);
                        return false;
                    }
                    // else if (iddxitem.IsMRPRequired) {
                    //     if (iddxitem.ItemMasterId > 0 && iddxitem.UomMrPrice < iddxitem.UomCostPrice && iddxitem.Status === 1) {
                    //         utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.mrpgraterucpmsg.lbl') + iddxitem.ItemName);
                    //         return false;
                    //     }
                    // }
                }
            } else if ($scope.item.PurchaseRequestId > 0) {
                for (var pridx in $scope.purchaseorderDetails) {
                    var pridxitem = $scope.purchaseorderDetails[pridx];
                    // if (pridxitem.IsBillable === true || pridxitem.ItemMaster.IsBillable === true) {
                    //     if (pridxitem.MrPrice == 0) {
                    //         utl.Alert.showErrorMsg(`${pridxitem.ItemName}: ${$translate.instant('MRP should not be 0')}`);
                    //         return false;
                    //     }
                    //     if (pridxitem.MrPrice < pridxitem.PurchasePrice) {
                    //         utl.Alert.showErrorMsg(`${pridxitem.ItemName}: ${$translate.instant('MRP should not be less than Purchase Price')}`);
                    //         return false;
                    //     }
                    // }
                    if (pridxitem.ItemMasterId > 0 && pridxitem.PoQuantity <= 0) {
                        utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.enterqtymsg.lbl') + pridxitem.ItemName);
                        return false;
                    } else if (pridxitem.ItemMasterId > 0 && pridxitem.UomPrice <= 0) {
                        utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.pricegreaterzeromsg.lbl') + pridxitem.ItemName);
                        return false;
                    } else if (pridxitem.IsMRPRequired) {
                        if (pridxitem.ItemMasterId > 0 && pridxitem.UomMrPrice < pridxitem.UomCostPrice) {
                            utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.mrpgraterucpmsg.lbl') + pridxitem.ItemName);
                            return false;
                        }
                    } else if ($scope.item.PurchaseRequestId > 0 && pridxitem.ItemMasterId > 0 && pridxitem.PoQuantity > pridxitem.RequestedQuantity) {
                        utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.poqtygreaterprqtymsg.lbl') + pridxitem.ItemName);
                        return false;
                    }
                }
            } else if ($scope.purchaseorderDetails.length == 1 && $scope.item.PurchaseRequestId === 0) {
                for (var idddx in $scope.purchaseorderDetails) {
                    var idddxitem = $scope.purchaseorderDetails[idddx];
                    if (idddxitem.ItemMasterId > 0) {
                        if (idddxitem.PoQuantity <= 0 && idddxitem.Status === 1) {
                            utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.enterqtymsg.lbl') + idddxitem.ItemName);
                            return false;
                        } else if (idddxitem.UomPrice <= 0 && idddxitem.Status === 1) {
                            utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.pricegreaterzeromsg.lbl') + idddxitem.ItemName);
                            return false;
                        } else if (idddxitem.IsMRPRequired) {
                            if (idddxitem.UomMrPrice < idddxitem.UomCostPrice && idddxitem.Status === 1) {
                                utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.mrpgraterucpmsg.lbl') + idddxitem.ItemName);
                                return false;
                            }
                        }
                    } else {
                        utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.atleastoneitemmsg.lbl'));
                        return false;
                    }
                }
            }

            return true;
        }

        function getLinesForSave() {
            var result = [];
            for (var idx in $scope.purchaseorderDetails) {
                var item = $scope.purchaseorderDetails[idx];
                item.VendorMasterId = $scope.item.VendorMasterId;
                item.StoreMasterId = $scope.item.StoreMasterId;
                item.DeliveryStoreMasterId = $scope.item.DeliveryStoreMasterId;
                if (item.UomMrPrice === null) {
                    // item.UomMrPrice = item.UomCostPrice;
                    // item.SaleAmount = item.UomMrPrice * item.PoQuantity;
                    item.SaleAmount = item.UomCostPrice * parseFloat(item.PoQuantity);
                }
                if (item.UomMrPrice < item.UomCostPrice) {
                    // item.UomMrPrice = item.UomCostPrice;
                    // item.SaleAmount = item.UomMrPrice * item.PoQuantity;
                    item.SaleAmount = item.UomCostPrice * parseFloat(item.PoQuantity);
                }
                if (item.Id > 0) {
                    if (item.ItemMasterId > 0) {
                        result.push(item);
                    }
                } else {
                    if (item.ItemMasterId > 0 && item.Status == 1) {
                        result.push(item);
                    }
                }
            }

            return result;
        }

        $scope.getSelectedPurchaseOrderCallback = function (scope, res, options, hasError) {
            $scope.PurchaseOrderInfo = res.Data || [];
            if ($scope.PurchaseOrderInfo && $scope.PurchaseOrderInfo.length > 0) {
                $scope.PurchaseOrderInfo.forEach(purchaseorder => {
                    if (purchaseorder.PoStatusId == 1) {
                        $scope.item.isDisabled = false;
                        $scope.item.RBDisabled = true;
                        $scope.item.DisplayPoStatus = 'Draft';
                    } else if (purchaseorder.PoStatusId == 2) {
                        $scope.item.isDisabled = true;
                        $scope.item.RBDisabled = true;
                        $scope.item.DisplayPoStatus = 'Approved';
                    } else if (purchaseorder.PoStatusId == 3) {
                        $scope.item.isDisabled = true;
                        $scope.item.RBDisabled = true;
                        $scope.item.DisableComments = true;
                        $scope.item.DisplayPoStatus = 'Authorized';
                    } else if (purchaseorder.PoStatusId == 4) {
                        $scope.item.isDisabled = true;
                        $scope.item.RBDisabled = true;
                        $scope.item.DisableComments = true;
                        $scope.item.DisplayPoStatus = 'Completed';
                    } else if (purchaseorder.PoStatusId == 5) {
                        $scope.item.isDisabled = true;
                        $scope.item.RBDisabled = true;
                        $scope.item.DisableComments = true;
                        $scope.item.DisplayPoStatus = 'Cancelled';
                    }

                    $scope.item.PurchaseOrderId = purchaseorder.Id;
                    $scope.item.PoNumber = purchaseorder.PoNumber;
                    $scope.item.PoDate = purchaseorder.PoDate;
                    $scope.item.PrNumber = purchaseorder.PrNumber;
                    $scope.item.PrDate = purchaseorder.PrDate;
                    $scope.item.VendorMasterId = purchaseorder.VendorMasterId;
                    $scope.item.VendorName = purchaseorder.VendorName;
                    $scope.item.StoreMasterId = purchaseorder.StoreMasterId;
                    $scope.item.StoreName = purchaseorder.StoreName;
                    $scope.item.DeliveryStoreMasterId = purchaseorder.DeliveryStoreMasterId;
                    $scope.item.DeliveryStoreName = purchaseorder.DeliveryStoreName;
                    $scope.item.DeliveryDate = purchaseorder.DeliveryDate;
                    $scope.item.PoTypeId = purchaseorder.PoTypeId;
                    $scope.item.PoSubTypeId = purchaseorder.PoSubTypeId;
                    $scope.item.PoStatusId = purchaseorder.PoStatusId;
                    $scope.item.VendorFacilityMapId = purchaseorder.VendorFacilityMapId;
                    $scope.item.FacilityId = purchaseorder.FacilityId;
                    $scope.item.FromFacilityId = purchaseorder.FromFacilityId;
                    $scope.item.ToFacilityId = purchaseorder.ToFacilityId;
                    $scope.item.OrganisationId = purchaseorder.OrganisationId;
                    $scope.item.PaymentTermsId = purchaseorder.PaymentTermsId;
                    $scope.item.PurchaseRequestId = purchaseorder.PurchaseRequestId;
                    $scope.item.RequestedBy = purchaseorder.RequestedBy;
                    $scope.item.RequestedDate = purchaseorder.RequestedDate;
                    $scope.item.RequesterComments = purchaseorder.RequesterComments;
                    $scope.item.AuthorizedBy = purchaseorder.AuthorizedBy;
                    $scope.item.AuthorizedDate = purchaseorder.AuthorizedDate;
                    $scope.item.AuthorizerComments = purchaseorder.AuthorizerComments;
                    $scope.item.ApprovedBy = purchaseorder.ApprovedBy;
                    $scope.item.ApprovedDate = purchaseorder.ApprovedDate;
                    $scope.item.ApproverComments = purchaseorder.ApproverComments;
                    $scope.item.AmendedBy = purchaseorder.AmendedBy;
                    $scope.item.AmendedDate = purchaseorder.AmendedDate;
                    $scope.item.AmenderComments = purchaseorder.AmenderComments;
                    $scope.item.CancelledBy = purchaseorder.CancelledBy;
                    $scope.item.CancelledDate = purchaseorder.CancelledDate;
                    $scope.item.CancelledComments = purchaseorder.CancelledComments;
                    $scope.item.TotalGrossAmount = purchaseorder.TotalGrossAmount;
                    $scope.item.TotalDiscountAmount = purchaseorder.TotalDiscountAmount;
                    $scope.item.TotalGstAmount = purchaseorder.TotalGstAmount;
                    $scope.item.TotalInGstAmount = purchaseorder.TotalInGstAmount;
                    $scope.item.TotalCGstAmount = purchaseorder.TotalCGstAmount;
                    $scope.item.TotalSGstAmount = purchaseorder.TotalSGstAmount;
                    $scope.item.OtherCharges = purchaseorder.OtherCharges;
                    $scope.item.TotalNetAmount = purchaseorder.TotalNetAmount;
                    $scope.item.TotalSaleAmount = purchaseorder.TotalSaleAmount;
                    $scope.item.ValidUntillDate = purchaseorder.ValidUntillDate;
                    $scope.item.RemarkId = purchaseorder.RemarkId;
                    $scope.item.Comments = purchaseorder.Comments;
                    $scope.item.Status = purchaseorder.Status;
                    $scope.item.Rev = purchaseorder.Rev;
                    $scope.item.CreatedBy = purchaseorder.CreatedBy;
                    $scope.item.CreatedAt = purchaseorder.CreatedAt;
                    $scope.item.UpdatedBy = purchaseorder.UpdatedBy;
                    $scope.item.UpdatedAt = purchaseorder.UpdatedAt;

                    $scope.purchaseorderDetails = purchaseorder.PurchaseOrderDetails || [];
                    for (var idx in $scope.purchaseorderDetails) {
                        var poitem = $scope.purchaseorderDetails[idx];
                        if (poitem.ItemMasterId > 0) {
                            if (poitem.DiscountModeId == 1) {
                                poitem.DiscountMode = 'Rs.';
                            } else {
                                poitem.DiscountMode = '%';
                            }
                            poitem.GstCode = poitem.GstMaster.GstCode;
                            poitem.InGstCode = poitem.InGstMaster.GstCode;
                            poitem.CGstCode = poitem.CGstMaster.GstCode;
                            poitem.SGstCode = poitem.SGstMaster.GstCode;

                            if (poitem.ItemMaster.IsMRPRequired)
                                poitem.IsMRPRequired = true;
                        }

                        if ($scope.item.PoStatusId >= 2 || $scope.item.PurchaseRequestId !== 0)
                            poitem.RdoItemMasterId = true;

                        if (poitem.RequestedStore) {
                            $scope.item.StoreTypeId = poitem.RequestedStore.StoreTypeId;
                        }
                    }

                    $scope.setIndexforTableIndex();
                    $scope.applyVisibilityRules();
                });

                if ($scope.item.PoStatusId == 1 && $scope.item.PurchaseRequestId === 0) {
                    $scope.addNewLineItem();
                }
            }
        };

        $scope.GetSelectedPurchaseOrder = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [{
                            Key: 0,
                            Value: $scope.currentcontext.id
                        },
                        {
                            Key: 5,
                            Value: $scope.currentfilter.filter_fromstore
                        }
                    ],
                    PageContext: {
                        PageSize: 1000,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'pharmacy/purchaseorder/GetSelectedPurchaseOrder',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getSelectedPurchaseOrderCallback
                };
                utl.Http.doAction(options);
            }
        };

        function loadData() {
            $scope.getItem();
            $scope.getPurchaseOrderDetails();
            $scope.getfacility();
            /*
             if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                 $scope.GetSelectedPurchaseOrder();
             }
             */
        }

        $scope.getfacilityCallback = function (scope, data, options, hasError) {
            $scope.data = data;
            $scope.ShowMrp = data.ShowMrp;
            $scope.DisablesalePrice = false;
            if ($scope.ShowMrp) {
                $scope.DisablesalePrice = true;
            }
            $scope.currentcontext.MrpPercent = data.MrpPercent;
            $scope.addNewLineItem();
        };
        $scope.getfacility = function () {
            var options = {
                action: 'SystemSettings/facility/GetFacilityById',
                data: {
                    Id: utl.Session.getCurrentFacilityId()
                },
                type: 'post',
                onComplete: $scope.getfacilityCallback
            };
            utl.Http.doAction(options);
        };
        $scope.SelectedFromStore = function (selectedItem) {
            if ($scope.item.DeliveryStoreMasterId == selectedItem.Id) {
                $scope.item.StoreMasterId = -1;
                utl.Alert.showErrorMsg($translate.instant('Store and Requested Store Should not be the same store'));
                return false;
            } else {
                $scope.item.StoreCode = selectedItem.StoreCode;
                $scope.item.StoreName = selectedItem.StoreName;
                $scope.item.StoreTypeId = selectedItem.StoreMaster.StoreTypeId;
                $scope.item.Email = selectedItem.StoreMaster.Email;
                $scope.item.Password = selectedItem.StoreMaster.Password;
                $scope.item.IsOpenPO = selectedItem.StoreMaster.CanAllowOpenPO;
                $scope.item.IsGstEditablePo = selectedItem.StoreMaster.IsGstEditablePo;
            }

        };

        $scope.SelectedDeliveryStore = function (selectedItem) {
            if ($scope.item.StoreMasterId == selectedItem.Id) {
                $scope.item.DeliveryStoreMasterId = -1;
                utl.Alert.showErrorMsg($translate.instant('Store and Requested Store Should not be the same store'));
                return false;
            } else {
                $scope.item.DeliveryStoreCode = selectedItem.StoreCode;
                $scope.item.DeliveryStoreName = selectedItem.StoreName;
                $scope.item.Email = selectedItem.Email;
                $scope.item.Password = selectedItem.Password;
            }
        };

        $scope.SelectedVendor = function (selectedItem) {
            $scope.item.VendorCode = selectedItem.VendorCode;
            $scope.item.VendorName = selectedItem.VendorName;
            $scope.item.EmailAddress = selectedItem.EmailAddress;
        };

        $scope.onVendorItemSelected = function (idx, selectedItem) {

            // var isDuplicate = utl.Common.isDuplicateRec($scope.purchaseorderDetails, {
            //     pivotkey: 'ItemVendorMapId',
            //     displaykey: 'ItemName'
            // });
            // if (isDuplicate) {
            //     item.ItemMasterId = '';
            //     item.ItemName = '';
            //     return;
            // }


            var SelectedMasterItem = selectedItem.SelectedItem;

            for (var itemexist = 0; itemexist < $scope.purchaseorderDetails.length; itemexist++) {
                var iteminlist = $scope.purchaseorderDetails[itemexist];
                if (iteminlist.ItemMasterId == SelectedMasterItem.ItemMasterId && iteminlist.Status == 1) {
                    utl.Alert.showErrorMsg(SelectedMasterItem.ItemName + ' Already in the list');
                    return false;
                }
            }

            if (SelectedMasterItem.ItemMaster.ItemFacilityMaps &&
                SelectedMasterItem.ItemMaster.ItemFacilityMaps.length > 0) {
                selectedItem.ItemFacilityMapId = SelectedMasterItem.ItemMaster.ItemFacilityMaps[0].Id;
            }
            selectedItem.ItemVendorMapId = SelectedMasterItem.Id;
            selectedItem.StoreMasterId = SelectedMasterItem.StoreMasterId;
            selectedItem.ItemMasterId = SelectedMasterItem.ItemMasterId;
            selectedItem.ItemCode = SelectedMasterItem.ItemCode;
            selectedItem.IsBillable = SelectedMasterItem.IsBillable;
            selectedItem.ItemName = SelectedMasterItem.ItemName;
            selectedItem.BaseUomId = SelectedMasterItem.UomMaster.Id;
            selectedItem.BaseUom.Id = SelectedMasterItem.UomMaster.Id;
            selectedItem.BaseUom.UomCode = SelectedMasterItem.UomMaster.UomCode;
            selectedItem.PurchaseUomId = SelectedMasterItem.PurchaseUom.Id;
            selectedItem.PurchaseUom.Id = SelectedMasterItem.PurchaseUom.Id;
            selectedItem.PurchaseUom.UomCode = SelectedMasterItem.PurchaseUom.UomCode;
            selectedItem.FreeQty = SelectedMasterItem.FreeQty || 0;
            selectedItem.DefinedFreeQty = SelectedMasterItem.FreeQty;
            selectedItem.ConversionQuantity = SelectedMasterItem.ConversionQuantity || 1;

            if (SelectedMasterItem.ItemMaster !== null) {
                selectedItem.GenericId = SelectedMasterItem.ItemMaster.GenericId || 0;
            }

            selectedItem.GstMaster.Id = SelectedMasterItem.GstMaster.Id || 1;
            selectedItem.GstId = SelectedMasterItem.GstMaster.Id || 1;
            selectedItem.GstMaster.GstCode = SelectedMasterItem.GstMaster.GstCode || '';
            selectedItem.GstCode = SelectedMasterItem.GstMaster.GstCode || '';
            selectedItem.GstMaster.GstPercentage = parseFloat(SelectedMasterItem.GstMaster.GstPercentage.toFixed(4));
            selectedItem.GstPercentage = parseFloat(SelectedMasterItem.GstMaster.GstPercentage.toFixed(4));

            selectedItem.InGstMaster.Id = SelectedMasterItem.InGstMaster.Id || 1;
            selectedItem.InGstId = SelectedMasterItem.InGstMaster.Id || 1;
            selectedItem.InGstMaster.GstCode = SelectedMasterItem.InGstMaster.GstCode || '';
            selectedItem.InGstCode = SelectedMasterItem.InGstMaster.GstCode || '';
            selectedItem.InGstMaster.GstPercentage = parseFloat(SelectedMasterItem.InGstMaster.GstPercentage.toFixed(4));
            selectedItem.InGstPercentage = parseFloat(SelectedMasterItem.InGstMaster.GstPercentage.toFixed(4));

            selectedItem.CGstMaster.Id = SelectedMasterItem.CGstMaster.Id || 1;
            selectedItem.CGstId = SelectedMasterItem.CGstMaster.Id || 1;
            selectedItem.CGstMaster.GstCode = SelectedMasterItem.CGstMaster.GstCode || '';
            selectedItem.CGstCode = SelectedMasterItem.CGstMaster.GstCode || '';
            selectedItem.CGstMaster.GstPercentage = parseFloat(SelectedMasterItem.CGstMaster.GstPercentage.toFixed(4));
            selectedItem.CGstPercentage = parseFloat(SelectedMasterItem.CGstMaster.GstPercentage.toFixed(4));

            selectedItem.SGstMaster.Id = SelectedMasterItem.SGstMaster.Id || 1;
            selectedItem.SGstId = SelectedMasterItem.SGstMaster.Id || 1;
            selectedItem.SGstMaster.GstCode = SelectedMasterItem.SGstMaster.GstCode || '';
            selectedItem.SGstCode = SelectedMasterItem.SGstMaster.GstCode || '';
            selectedItem.SGstMaster.GstPercentage = parseFloat(SelectedMasterItem.SGstMaster.GstPercentage.toFixed(4));
            selectedItem.SGstPercentage = parseFloat(SelectedMasterItem.SGstMaster.GstPercentage.toFixed(4));

            selectedItem.UomPrice = parseFloat(SelectedMasterItem.UomPrice.toFixed(4));
            selectedItem.PurchasePrice = parseFloat(SelectedMasterItem.Price.toFixed(4));
            if (SelectedMasterItem.UomMrPrice) {
                selectedItem.UomMrPrice = parseFloat(SelectedMasterItem.UomMrPrice.toFixed(4));
                selectedItem.MrPrice = parseFloat(SelectedMasterItem.MrPrice.toFixed(4));
            }

            selectedItem.DiscountModeId = SelectedMasterItem.DiscountModeId;
            if (SelectedMasterItem.DiscountModeId == 1) {
                selectedItem.DiscountMode = 'Rs.';
                selectedItem.Discount = parseFloat(SelectedMasterItem.Discount.toFixed(4));
                selectedItem.UomDiscountAmount = parseFloat(SelectedMasterItem.Discount.toFixed(4));
                selectedItem.DiscountAmount = parseFloat((SelectedMasterItem.Discount / selectedItem.ConversionQuantity).toFixed(4));
            } else if (SelectedMasterItem.DiscountModeId == 2) {
                selectedItem.DiscountMode = '%';
                selectedItem.Discount = parseFloat(SelectedMasterItem.Discount.toFixed(4));
                selectedItem.UomDiscountAmount = parseFloat(((selectedItem.UomPrice / 100) * SelectedMasterItem.Discount).toFixed(4));
                selectedItem.DiscountAmount = parseFloat(((selectedItem.PurchasePrice / 100) * SelectedMasterItem.Discount).toFixed(4));
            } else {
                selectedItem.DiscountMode = '';
                selectedItem.Discount = 0;
                selectedItem.UomDiscountAmount = 0;
                selectedItem.DiscountAmount = 0;
            }

            selectedItem.UomPriceAfterDiscount = parseFloat(selectedItem.UomPrice - selectedItem.UomDiscountAmount.toFixed(4));
            selectedItem.PurchasePriceAfterDiscount = parseFloat(selectedItem.PurchasePrice - selectedItem.DiscountAmount.toFixed(4));

            selectedItem.GstAmount = parseFloat(((selectedItem.UomPriceAfterDiscount / 100) * SelectedMasterItem.GstMaster.GstPercentage).toFixed(4));
            selectedItem.UomGstAmount = parseFloat(((selectedItem.UomPriceAfterDiscount / 100) * SelectedMasterItem.GstMaster.GstPercentage).toFixed(4));
            selectedItem.UnitGstAmount = parseFloat(((selectedItem.PurchasePriceAfterDiscount / 100) * SelectedMasterItem.GstMaster.GstPercentage).toFixed(4));

            selectedItem.InGstAmount = parseFloat(((selectedItem.UomPriceAfterDiscount / 100) * SelectedMasterItem.InGstMaster.GstPercentage).toFixed(4));
            selectedItem.UomInGstAmount = parseFloat(((selectedItem.UomPriceAfterDiscount / 100) * SelectedMasterItem.InGstMaster.GstPercentage).toFixed(4));
            selectedItem.UnitInGstAmount = parseFloat(((selectedItem.PurchasePriceAfterDiscount / 100) * SelectedMasterItem.InGstMaster.GstPercentage).toFixed(4));

            selectedItem.CGstAmount = parseFloat(((selectedItem.UomPriceAfterDiscount / 100) * SelectedMasterItem.CGstMaster.GstPercentage).toFixed(4));
            selectedItem.UomCGstAmount = parseFloat(((selectedItem.UomPriceAfterDiscount / 100) * SelectedMasterItem.CGstMaster.GstPercentage).toFixed(4));
            selectedItem.UnitCGstAmount = parseFloat(((selectedItem.PurchasePriceAfterDiscount / 100) * SelectedMasterItem.CGstMaster.GstPercentage).toFixed(4));

            selectedItem.SGstAmount = parseFloat(((selectedItem.UomPriceAfterDiscount / 100) * SelectedMasterItem.SGstMaster.GstPercentage).toFixed(4));
            selectedItem.UomSGstAmount = parseFloat(((selectedItem.UomPriceAfterDiscount / 100) * SelectedMasterItem.SGstMaster.GstPercentage).toFixed(4));
            selectedItem.UnitSGstAmount = parseFloat(((selectedItem.PurchasePriceAfterDiscount / 100) * SelectedMasterItem.SGstMaster.GstPercentage).toFixed(4));

            selectedItem.UomCostPrice = parseFloat((selectedItem.UomPriceAfterDiscount + selectedItem.UomGstAmount).toFixed(4));
            selectedItem.UnitCostPrice = parseFloat((selectedItem.PurchasePriceAfterDiscount + selectedItem.UnitGstAmount).toFixed(4));

            if (SelectedMasterItem.ItemMaster.IsMRPRequired)
                selectedItem.IsMRPRequired = true;

            if (SelectedMasterItem.ItemMaster) {
                if (SelectedMasterItem.ItemMaster.StockItem) {
                    if (SelectedMasterItem.ItemMaster.StockItem.Quantity > 0) {
                        selectedItem.AvailableQuantity = SelectedMasterItem.ItemMaster.StockItem.Quantity;
                    } else {
                        selectedItem.AvailableQuantity = 0;
                    }
                } else {
                    selectedItem.AvailableQuantity = 0;
                }
            }

            var PoLineDetails = [];
            for (var poldid = 0; poldid < $scope.purchaseorderDetails.length; poldid++) {
                var PoLineDetail = $scope.purchaseorderDetails[poldid];
                if (PoLineDetail.Status == 1) {
                    PoLineDetails.push(PoLineDetail);
                }
            }

            var lastIndex = PoLineDetails.length - 1;
            if (idx == lastIndex) {
                $scope.addNewLineItem();
            }
            $scope.getvendorItems(selectedItem.ItemMasterId);
        };

        $scope.onMasterItemSelected = function (idx, selectedItem) {
            var SelectedMasterItem = selectedItem.SelectedItem;

            selectedItem.MasterItem = SelectedMasterItem;
            if (SelectedMasterItem.ItemFacilityMaps && SelectedMasterItem.ItemFacilityMaps.length > 0) {
                selectedItem.ItemFacilityMapId = SelectedMasterItem.ItemFacilityMaps[0].Id;
            }
            // if (selectedItem.ItemMasterId > 0) {
            //     selectedItem.RdoItemMasterId = true;
            // }
            selectedItem.ItemMasterId = SelectedMasterItem.Id;
            selectedItem.ItemCode = SelectedMasterItem.ItemCode;
            selectedItem.IsBillable = SelectedMasterItem.IsBillable;
            selectedItem.ItemName = SelectedMasterItem.ItemName;
            selectedItem.UomPrice = SelectedMasterItem.ItemPrice;
            selectedItem.ConversionQuantity = SelectedMasterItem.PurConQty || 1;
            selectedItem.MrPrice = SelectedMasterItem.MrPrice;
            selectedItem.UomMrPrice = SelectedMasterItem.MrPrice;
            selectedItem.GstId = SelectedMasterItem.GstId;
            selectedItem.DiscountModeId = SelectedMasterItem.DiscountModeId;
            selectedItem.Discount = SelectedMasterItem.Discount;
            selectedItem.ManufacturerId = SelectedMasterItem.ManufacturerId || 0;
            selectedItem.GenericId = SelectedMasterItem.GenericId || 0;
            selectedItem.PoQuantity = 0;
            selectedItem.FreeQty = SelectedMasterItem.FreeQty || 0;
            selectedItem.TotalQuantityAfterConversion = 0;

            if (SelectedMasterItem.PurchaseUom) {
                selectedItem.BaseUomId = SelectedMasterItem.PurchaseUom.Id || 0;
                selectedItem.BaseUom.Id = SelectedMasterItem.PurchaseUom.Id || 0;
                selectedItem.BaseUom.UomCode = SelectedMasterItem.PurchaseUom.UomCode;

                selectedItem.PurchaseUomId = SelectedMasterItem.PurchaseUom.Id || 0;
                selectedItem.PurchaseUom.Id = SelectedMasterItem.PurchaseUom.Id || 0;
                selectedItem.PurchaseUom.UomCode = SelectedMasterItem.PurchaseUom.UomCode;
            }

            if (SelectedMasterItem.SaleUom) {
                selectedItem.SaleUomId = SelectedMasterItem.SaleUom.Id || 0;
                // selectedItem.SaleUom.Id = SelectedMasterItem.SaleUom.Id || 0;
                // selectedItem.SaleUom.UomCode = SelectedMasterItem.SaleUom.UomCode;
            }

            if (SelectedMasterItem.UomConversions) {
                if (SelectedMasterItem.UomConversions.length > 0) {
                    for (var idxUOM in SelectedMasterItem.UomConversions) {
                        var uom = SelectedMasterItem.UomConversions[idxUOM];
                        if (uom.UomTypeId == 2) {
                            selectedItem.ConversionQuantity = uom.ConversionQuantity || 1;
                        }
                        if ($scope.item.IsOpenPO && uom.UomTypeId == 2) {
                            selectedItem.UomCode = uom.UomMaster.UomName;
                            if (selectedItem.UomCode != '' && selectedItem.UomCode != null) {
                                selectedItem.PurchaseUomId = uom.UomMaster.UomId || 0;
                                selectedItem.PurchaseUom.Id = uom.UomMaster.UomId || 0;
                                selectedItem.PurchaseUom.UomCode = uom.UomMaster.UomName;
                            }
                        }
                        if ($scope.item.IsOpenPO && uom.UomTypeId == 3) {
                            selectedItem.UomCode = uom.UomMaster.UomName;
                            if (selectedItem.UomCode != '' && selectedItem.UomCode != null) {
                                selectedItem.SaleUomId = uom.UomMaster.UomId || 0;
                                selectedItem.SaleUom.Id = uom.UomMaster.UomId || 0;
                                selectedItem.SaleUom.UomCode = uom.UomMaster.UomName;
                            }
                        }
                        if ($scope.item.IsOpenPO && uom.UomTypeId == 1) {
                            selectedItem.UomCode = uom.UomMaster.UomName;
                            if (selectedItem.UomCode != '' && selectedItem.UomCode != null) {
                                selectedItem.BaseUomId = uom.UomMaster.UomId || 0;
                                selectedItem.BaseUom.Id = uom.UomMaster.UomId || 0;
                                selectedItem.BaseUom.UomCode = uom.UomMaster.UomName;
                            }
                        }
                    }
                }
            }

            if (SelectedMasterItem.GstMaster) {
                selectedItem.GstMaster.Id = SelectedMasterItem.GstMaster.Id || 1;
                selectedItem.GstId = SelectedMasterItem.GstMaster.Id || 1;
                selectedItem.GstMaster.GstCode = SelectedMasterItem.GstMaster.GstCode;
                selectedItem.GstCode = SelectedMasterItem.GstMaster.GstCode;
                selectedItem.GstMaster.GstPercentage = parseFloat(SelectedMasterItem.GstMaster.GstPercentage.toFixed(4));
                selectedItem.GstPercentage = parseFloat(SelectedMasterItem.GstMaster.GstPercentage.toFixed(4));
            } else {
                selectedItem.GstId = SelectedMasterItem.GstId || 1;
                selectedItem.GstMaster.Id = SelectedMasterItem.GstId || 1;
                selectedItem.GstMaster.GstCode = '';
                selectedItem.GstCode = '';
                selectedItem.GstMaster.GstPercentage = 0;
                selectedItem.GstPercentage = 0;
            }

            selectedItem.InGstId = 1;
            selectedItem.InGstMaster.Id = 1;
            selectedItem.InGstMaster.GstCode = '';
            selectedItem.InGstCode = '';
            selectedItem.InGstMaster.GstPercentage = 0;
            selectedItem.InGstPercentage = 0;

            if (SelectedMasterItem.CGstMaster) {
                selectedItem.CGstMaster.Id = SelectedMasterItem.CGstMaster.Id || 1;
                selectedItem.CGstId = SelectedMasterItem.CGstMaster.Id || 1;
                selectedItem.CGstMaster.GstCode = SelectedMasterItem.CGstMaster.GstCode;
                selectedItem.CGstCode = SelectedMasterItem.CGstMaster.GstCode;
                selectedItem.CGstMaster.GstPercentage = parseFloat(SelectedMasterItem.CGstMaster.GstPercentage.toFixed(4));
                selectedItem.CGstPercentage = parseFloat(SelectedMasterItem.CGstMaster.GstPercentage.toFixed(4));
            } else {
                selectedItem.CGstMaster.Id = SelectedMasterItem.CGstId || 1;
                selectedItem.CGstId = SelectedMasterItem.CGstId || 1;
                selectedItem.CGstMaster.GstCode = '';
                selectedItem.CGstCode = '';
                selectedItem.CGstMaster.GstPercentage = 0;
                selectedItem.CGstPercentage = 0;
            }

            if (SelectedMasterItem.SGstMaster) {
                selectedItem.SGstMaster.Id = SelectedMasterItem.SGstMaster.Id || 1;
                selectedItem.SGstId = SelectedMasterItem.SGstMaster.Id || 1;
                selectedItem.SGstMaster.GstCode = SelectedMasterItem.SGstMaster.GstCode;
                selectedItem.SGstCode = SelectedMasterItem.SGstMaster.GstCode;
                selectedItem.SGstMaster.GstPercentage = parseFloat(SelectedMasterItem.SGstMaster.GstPercentage.toFixed(4));
                selectedItem.SGstPercentage = parseFloat(SelectedMasterItem.SGstMaster.GstPercentage.toFixed(4));
            } else {
                selectedItem.SGstMaster.Id = SelectedMasterItem.SGstId || 1;
                selectedItem.SGstId = SelectedMasterItem.SGstId || 1;
                selectedItem.SGstMaster.GstCode = '';
                selectedItem.SGstCode = '';
                selectedItem.SGstMaster.GstPercentage = 0;
                selectedItem.SGstPercentage = 0;
            }

            if (SelectedMasterItem.ItemVendorMaps) {
                var VendorMappedItem = SelectedMasterItem.ItemVendorMaps[0];
                selectedItem.UomPrice = VendorMappedItem.UomPrice;
                selectedItem.PurchasePrice = VendorMappedItem.Price;
                selectedItem.UomMrPrice = VendorMappedItem.UomMrPrice;
                selectedItem.MrPrice = VendorMappedItem.MrPrice;
                selectedItem.DiscountModeId = VendorMappedItem.DiscountModeId;
                if (VendorMappedItem.DiscountModeId === 1) {
                    selectedItem.DiscountMode = 'SR';
                    selectedItem.Discount = VendorMappedItem.Discount;
                    selectedItem.UomDiscountAmount = parseFloat(VendorMappedItem.Discount.toFixed(4));
                    selectedItem.DiscountAmount = parseFloat((VendorMappedItem.Discount / VendorMappedItem.ConversionQuantity).toFixed(4));
                } else if (SelectedMasterItem.DiscountModeId == 2) {
                    selectedItem.DiscountMode = '%';
                    selectedItem.Discount = VendorMappedItem.Discount;
                    selectedItem.UomDiscountAmount = parseFloat(((selectedItem.UomPrice / 100) * VendorMappedItem.Discount).toFixed(4));
                    selectedItem.DiscountAmount = parseFloat(((selectedItem.PurchasePrice / 100) * VendorMappedItem.Discount).toFixed(4));
                } else {
                    selectedItem.DiscountMode = '';
                    selectedItem.Discount = 0;
                    selectedItem.UomDiscountAmount = 0;
                    selectedItem.DiscountAmount = 0;
                }

                selectedItem.UomPriceAfterDiscount = parseFloat(selectedItem.UomPrice - selectedItem.UomDiscountAmount.toFixed(4));
                selectedItem.PurchasePriceAfterDiscount = parseFloat(selectedItem.PurchasePrice - selectedItem.DiscountAmount.toFixed(4));

                selectedItem.GstAmount = parseFloat(((selectedItem.UomPriceAfterDiscount / 100) * VendorMappedItem.GstMaster.GstPercentage).toFixed(4));
                selectedItem.UomGstAmount = 0;
                selectedItem.UnitGstAmount = parseFloat(((selectedItem.PurchasePriceAfterDiscount / 100) * VendorMappedItem.GstMaster.GstPercentage).toFixed(4));

                selectedItem.InGstAmount = 0;
                selectedItem.UomInGstAmount = 0;
                selectedItem.UnitInGstAmount = 0;

                selectedItem.CGstAmount = parseFloat(((selectedItem.UomPriceAfterDiscount / 100) * VendorMappedItem.CGstMaster.GstPercentage).toFixed(4));
                selectedItem.UomCGstAmount = 0;
                selectedItem.UnitCGstAmount = parseFloat(((selectedItem.PurchasePriceAfterDiscount / 100) * VendorMappedItem.CGstMaster.GstPercentage).toFixed(4));

                selectedItem.SGstAmount = parseFloat(((selectedItem.UomPriceAfterDiscount / 100) * VendorMappedItem.SGstMaster.GstPercentage).toFixed(4));
                selectedItem.UomSGstAmount = 0;
                selectedItem.UnitSGstAmount = parseFloat(((selectedItem.PurchasePriceAfterDiscount / 100) * VendorMappedItem.SGstMaster.GstPercentage).toFixed(4));

                selectedItem.UomCostPrice = parseFloat((selectedItem.UomPriceAfterDiscount + selectedItem.GstAmount).toFixed(4));
                selectedItem.UnitCostPrice = parseFloat((selectedItem.PurchasePriceAfterDiscount + selectedItem.UnitGstAmount).toFixed(4));

                selectedItem.GrossAmount = 0;
                selectedItem.NetAmount = 0;
            } else {
                // selectedItem.UomPrice = 0;
                selectedItem.PurchasePrice = 0;
                // selectedItem.UomMrPrice = 0;
                // selectedItem.MrPrice = 0;
                // selectedItem.DiscountModeId = 2;
                // selectedItem.DiscountMode = '%';
                // selectedItem.Discount = 0;
                selectedItem.UomDiscountAmount = 0;
                selectedItem.DiscountAmount = 0;
                selectedItem.UomPriceAfterDiscount = 0;
                selectedItem.PurchasePriceAfterDiscount = 0;
                selectedItem.GstAmount = 0;
                selectedItem.UomGstAmount = 0;
                selectedItem.UnitGstAmount = 0;
                selectedItem.InGstAmount = 0;
                selectedItem.UomInGstAmount = 0;
                selectedItem.UnitInGstAmount = 0;
                selectedItem.CGstAmount = 0;
                selectedItem.UomCGstAmount = 0;
                selectedItem.UnitCGstAmount = 0;
                selectedItem.SGstAmount = 0;
                selectedItem.UomSGstAmount = 0;
                selectedItem.UnitSGstAmount = 0;
                selectedItem.UomCostPrice = 0;
                selectedItem.UnitCostPrice = 0;
                selectedItem.GrossAmount = 0;
                selectedItem.NetAmount = 0;
            }

            if (SelectedMasterItem.StockItem) {
                selectedItem.StockItemId = SelectedMasterItem.StockItem.Id;
                if (SelectedMasterItem.StockItem.Quantity > 0) {
                    selectedItem.AvailableQuantity = SelectedMasterItem.StockItem.Quantity;
                } else {
                    selectedItem.AvailableQuantity = 0;
                }
            } else {
                selectedItem.StockItemId = 0;
                selectedItem.AvailableQuantity = 0;
            }

            var PoLineDetails = [];
            for (var poldid = 0; poldid < $scope.purchaseorderDetails.length; poldid++) {
                var PoLineDetail = $scope.purchaseorderDetails[poldid];
                if (PoLineDetail.Status == 1) {
                    PoLineDetails.push(PoLineDetail);
                }
            }

            var lastIndex = PoLineDetails.length - 1;
            if (idx == lastIndex) {
                $scope.addNewLineItem();
            }
            $scope.getvendorItems(selectedItem.ItemMasterId);
            $scope.computeAmount(selectedItem);
        };

        $scope.getvendorListCallback = function (scope, res, options, hasError) {
            $scope.vendorPriceDetails = res.Data;

        };

        $scope.getvendorItems = function (itemid) {
            var inputData = {
                Params: [{
                        Key: 14,
                        Value: utl.Session.getCurrentFacilityId()
                    },
                    // {
                    //     Key: 6,
                    //     Value: [2, 3, 4]
                    // },
                    // {
                    //     Key: 10,
                    //     Value: $scope.item.VendorMasterId
                    // },
                    {
                        Key: 2,
                        Value: itemid
                    },
                ],
                PageContext: {
                    PageSize: 3,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'pharmacy/GrnDetail/GetGrnDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getvendorListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.computeTransportCharges = function (item) {
            if (item.TransportCharges === undefined || item.TransportCharges === null)
                $scope.item.TransportCharges = 0;

            $scope.TotalGrossAmount = 0;
            $scope.TotalDiscountAmount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalInGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmount = 0;
            $scope.TotalSaleAmount = 0;
            $scope.TotalProfitAmount = 0;
            calculatetotalAmount();
            // $scope.TransportCharges = 0;
            // if (parseFloat(item.TransportCharges) > 0)
            //     $scope.TransportCharges = parseFloat(item.TransportCharges);

            // $scope.item.TotalNetAmount = $scope.TotalNetAmount + $scope.TransportCharges;
            // $scope.item.TotalAmount = $scope.TotalNetAmount + $scope.TransportCharges;
        };
        $scope.computeOtherCharges = function (item) {
            // $scope.OtherCharges = 0;
            // if (parseFloat(item.OtherCharges) > 0)
            //     $scope.OtherCharges = parseFloat(item.OtherCharges);
            // $scope.item.TotalNetAmount = $scope.TotalNetAmount + $scope.OtherCharges;
            // $scope.computeOtherGstAmountCharges(item);
            if (item.OtherCharges === undefined || item.OtherCharges === null)
                $scope.item.OtherCharges = 0;

            $scope.TotalGrossAmount = 0;
            $scope.TotalDiscountAmount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalInGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmount = 0;
            $scope.TotalSaleAmount = 0;
            $scope.TotalProfitAmount = 0;
            // $scope.RoundOff = 0;
            calculatetotalAmount();
        };
        $scope.computeRoundOff = function (item) {
            if (item.RoundOff === undefined || item.RoundOff === null) {
                $scope.item.RoundOff = 0;
            }

            $scope.TotalGrossAmount = 0;
            $scope.TotalDiscountAmount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalInGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmount = 0;
            $scope.TotalSaleAmount = 0;
            $scope.TotalProfitAmount = 0;
            // $scope.RoundOff = 0;
            calculatetotalAmount();
        };
        // $scope.OnSelectGst = function (SelectedItem) {
        //     SelectedItem.GstId = SelectedItem.Id;
        //     SelectedItem.GstCode = SelectedItem.GstCode;
        //     SelectedItem.GstName = SelectedItem.Text;
        //     SelectedItem.GstPercentage = SelectedItem.GstPercentage;
        //     $scope.computeGst(SelectedItem);
        // };
        // $scope.OnSelectGst = function (selectedItem) {
        //     $scope.item.GstCode = selectedItem.GstCode;
        //     $scope.item.GstName = selectedItem.Text;
        //     $scope.item.GstPercentage = selectedItem.GstPercentage;
        // };
        $scope.OnSelectGst = function (item, selectedItem) {
            var gstitem = selectedItem;
            item.GstId = gstitem.Id;
            item.GstName = gstitem.Text;
            item.GstPercentage = gstitem.GstPercentage;
            if (gstitem.ChildGstId) {
                item.CGstId = gstitem.ChildGstId;
                item.CGstPercentage = gstitem.ChildGst.GstPercentage;
                item.SGstId = gstitem.ChildGstId;
                item.SGstPercentage = gstitem.ChildGst.GstPercentage;
            }
            $scope.computeAmount(item);
        }

        // $scope.computeGst = function (item) {
        //     item.GstId = item.GstId;
        //     item.GstCode = item.GstCode;
        //     item.GstPercentage = item.GstPercentage;
        //     $scope.computeAmount(item);
        // }
        $scope.computeforgivenDiscount = function (item) {
            if (parseFloat(item.UomPrice) === 0 || parseFloat(item.UomPrice) === 'undefined') {
                $scope.item.OtherCharges = 0;

                item.UomPrice = 0;
                item.PurchasePrice = 0;
                item.Discount = 0;
                item.UomDiscountAmount = 0;
                item.DiscountAmount = 0;
                item.UomPriceAfterDiscount = 0;
                item.PurchasePriceAfterDiscount = 0;
                item.GstAmount = 0;
                item.UnitGstAmount = 0;
                item.InGstAmount = 0;
                item.UnitInGstAmount = 0;
                item.CGstAmount = 0;
                item.UnitCGstAmount = 0;
                item.SGstAmount = 0;
                item.UnitSGstAmount = 0;
                item.UomCostPrice = 0;
                item.UnitCostPrice = 0;
                item.GrossAmount = 0;
                item.NetAmount = 0;

                utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.priceiszeromsg.lbl'));
            } else if (parseFloat(item.Discount) === 'undefined') {
                $scope.item.OtherCharges = 0;

                item.UomDiscountAmount = 0;
                item.DiscountAmount = 0;
                item.UomPriceAfterDiscount = 0;
                item.PurchasePriceAfterDiscount = 0;

                item.GstAmount = (item.UomPriceAfterDiscount / 100) * item.GstPercentage;
                item.UnitGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.GstPercentage;

                item.InGstAmount = (item.UomPriceAfterDiscount / 100) * item.InGstPercentage;
                item.UnitInGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.InGstPercentage;

                item.CGstAmount = (item.UomPriceAfterDiscount / 100) * item.CGstPercentage;
                item.UnitCGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.CGstPercentage;

                item.SGstAmount = (item.UomPriceAfterDiscount / 100) * item.SGstPercentage;
                item.UnitSGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.SGstPercentage;

                // item.UomCostPrice = parseFloat((item.UomPriceAfterDiscount + item.GstAmount).toFixed(4));
                item.UnitCostPrice = parseFloat((item.PurchasePriceAfterDiscount + item.GstAmount).toFixed(4));
            } else if (parseFloat(item.Discount) === 0) {
                $scope.item.OtherCharges = 0;

                item.UomDiscountAmount = 0;
                item.DiscountAmount = 0;
                item.UomPriceAfterDiscount = parseFloat(item.UomPrice);
                item.PurchasePriceAfterDiscount = parseFloat(item.UomPrice);

                item.GstAmount = (item.UomPriceAfterDiscount / 100) * item.GstPercentage;
                item.UnitGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.GstPercentage;

                item.InGstAmount = (item.UomPriceAfterDiscount / 100) * item.InGstPercentage;
                item.UnitInGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.InGstPercentage;

                item.CGstAmount = (item.UomPriceAfterDiscount / 100) * item.CGstPercentage;
                item.UnitCGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.CGstPercentage;

                item.SGstAmount = (item.UomPriceAfterDiscount / 100) * item.SGstPercentage;
                item.UnitSGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.SGstPercentage;

                item.UomCostPrice = parseFloat((item.UomPriceAfterDiscount + item.GstAmount).toFixed(4));
                item.UnitCostPrice = parseFloat((item.PurchasePriceAfterDiscount + item.GstAmount).toFixed(4));
            } else {
                if (item.DiscountModeId == 1) {
                    if (parseFloat(item.Discount) <= parseFloat(item.UomPrice)) {
                        $scope.item.OtherCharges = 0;

                        item.UomDiscountAmount = parseFloat(item.Discount);
                        item.DiscountAmount = parseFloat(item.Discount) / item.ConversionQuantity;
                        item.UomPriceAfterDiscount = parseFloat(item.UomPrice) - item.UomDiscountAmount;
                        item.PurchasePriceAfterDiscount = parseFloat(item.PurchasePrice) - item.DiscountAmount;

                        item.GstAmount = (item.UomPriceAfterDiscount / 100) * item.GstPercentage;
                        item.UnitGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.GstPercentage;

                        item.InGstAmount = (item.UomPriceAfterDiscount / 100) * item.InGstPercentage;
                        item.UnitInGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.InGstPercentage;

                        item.CGstAmount = (item.UomPriceAfterDiscount / 100) * item.CGstPercentage;
                        item.UnitCGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.CGstPercentage;

                        item.SGstAmount = (item.UomPriceAfterDiscount / 100) * item.SGstPercentage;
                        item.UnitSGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.SGstPercentage;

                        item.UomCostPrice = parseFloat((item.UomPriceAfterDiscount + item.GstAmount).toFixed(4));
                        item.UnitCostPrice = parseFloat((item.PurchasePriceAfterDiscount + item.UnitGstAmount).toFixed(4));
                    } else if (parseFloat(item.Discount) > parseFloat(item.UomPrice)) {
                        item.Discount = 0;
                        item.UnitDiscountAmount = 0;
                        item.DiscountAmount = 0;
                        utl.Alert.showErrorMsg($translate.instant('inventory.purchaseorder.discountmsg.lbl'));
                    }
                } else if (item.DiscountModeId == 2) {
                    if (parseFloat(item.Discount) > 100) {
                        item.Discount = 0;
                        item.UnitDiscountAmount = 0;
                        item.DiscountAmount = 0;
                        utl.Alert.showErrorMsg($translate.instant('inventory.purchaseorder.fulldiscountmsg.lbl'));
                    } else {
                        $scope.item.OtherCharges = 0;
                        item.PurchasePrice = parseFloat(item.UomPrice) / item.ConversionQuantity;

                        item.UomDiscountAmount = (parseFloat(item.UomPrice) / 100) * parseFloat(item.Discount);
                        item.DiscountAmount = (parseFloat(item.PurchasePrice) / 100) * parseFloat(item.Discount);

                        item.UomPriceAfterDiscount = parseFloat(item.UomPrice) - item.UomDiscountAmount;
                        item.PurchasePriceAfterDiscount = parseFloat(item.PurchasePrice) - item.DiscountAmount;

                        item.GstAmount = (item.UomPriceAfterDiscount / 100) * item.GstPercentage;
                        item.UnitGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.GstPercentage;

                        item.InGstAmount = (item.UomPriceAfterDiscount / 100) * item.InGstPercentage;
                        item.UnitInGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.InGstPercentage;

                        item.CGstAmount = (item.UomPriceAfterDiscount / 100) * item.CGstPercentage;
                        item.UnitCGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.CGstPercentage;

                        item.SGstAmount = (item.UomPriceAfterDiscount / 100) * item.SGstPercentage;
                        item.UnitSGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.SGstPercentage;

                        item.UomCostPrice = parseFloat((item.UomPriceAfterDiscount + item.GstAmount).toFixed(4));
                        item.UnitCostPrice = parseFloat((item.PurchasePriceAfterDiscount + item.UnitGstAmount).toFixed(4));
                    }
                } else {
                    if (parseFloat(item.Discount) > 100) {
                        item.Discount = 0;
                        item.DiscountAmount = 0;
                        utl.Alert.showErrorMsg($translate.instant('inventory.purchaseorder.fulldiscountmsg.lbl'));
                    } else {
                        $scope.item.OtherCharges = 0;
                        item.PurchasePrice = parseFloat(item.UomPrice) / item.ConversionQuantity;

                        item.UomDiscountAmount = (parseFloat(item.UomPrice) / 100) * parseFloat(item.Discount);
                        item.DiscountAmount = (parseFloat(item.PurchasePrice) / 100) * parseFloat(item.Discount);

                        item.UomPriceAfterDiscount = parseFloat(item.UomPrice) - item.UomDiscountAmount;
                        item.PurchasePriceAfterDiscount = parseFloat(item.PurchasePrice) - item.DiscountAmount;

                        item.GstAmount = (item.UomPriceAfterDiscount / 100) * item.GstPercentage;
                        item.UnitGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.GstPercentage;

                        item.InGstAmount = (item.UomPriceAfterDiscount / 100) * item.InGstPercentage;
                        item.UnitInGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.InGstPercentage;

                        item.CGstAmount = (item.UomPriceAfterDiscount / 100) * item.CGstPercentage;
                        item.UnitCGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.CGstPercentage;

                        item.SGstAmount = (item.UomPriceAfterDiscount / 100) * item.SGstPercentage;
                        item.UnitSGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.SGstPercentage;

                        item.UomCostPrice = parseFloat((item.UomPriceAfterDiscount + item.GstAmount).toFixed(4));
                        item.UnitCostPrice = parseFloat((item.PurchasePriceAfterDiscount + item.UnitGstAmount).toFixed(4));
                    }
                }
            }

            item.GrossAmount = parseFloat((parseFloat(item.UomPrice) * parseFloat(item.PoQuantity)).toFixed(4));
            item.NetAmount = parseFloat((parseFloat(item.UomCostPrice) * parseFloat(item.PoQuantity)).toFixed(4));
            if (item.IsMRPRequired) {
                item.SaleAmount = parseFloat((parseFloat(item.UomMrPrice) * parseFloat(item.PoQuantity)).toFixed(4));
            } else {
                if (parseFloat(item.UomMrPrice) > parseFloat(item.UomCostPrice)) {
                    item.SaleAmount = parseFloat((parseFloat(item.UomMrPrice) * parseFloat(item.PoQuantity)).toFixed(4));
                } else {
                    item.SaleAmount = parseFloat((parseFloat(item.UomCostPrice) * parseFloat(item.PoQuantity)).toFixed(4));
                }
            }
            item.ProfitAmount = item.SaleAmount - item.NetAmount;
            item.ProfitPercentage = ((item.ProfitAmount / item.NetAmount) * 100).toFixed(2);

            $scope.TotalGrossAmount = 0;
            $scope.TotalDiscountAmount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalInGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmount = 0;
            $scope.TotalSaleAmount = 0;
            $scope.TotalProfitAmount = 0;


            calculatetotalAmount();
        };

        $scope.computeforgivenPrice = function (item) {
            if (parseFloat(item.UomPrice) > 0) {
                $scope.item.OtherCharges = 0;
                item.PurchasePrice = parseFloat(item.UomPrice) / item.ConversionQuantity;
                if ($scope.currentcontext.MrpPercent > 0 && $scope.ShowMrp) {
                    var MrPrice = parseFloat(item.UomPrice) * parseFloat($scope.currentcontext.MrpPercent) / 100;
                    item.UomMrPrice = parseFloat(item.UomPrice) + MrPrice;
                }
                item.MrPrice = parseFloat((item.UomMrPrice) / (item.ConversionQuantity)).toFixed(4);
                if (parseFloat(item.Discount) > 0) {
                    if (item.DiscountModeId == 1) {
                        item.UomDiscountAmount = parseFloat(item.Discount);
                        item.DiscountAmount = parseFloat(item.Discount) / item.ConversionQuantity;
                    } else if (item.DiscountModeId == 2) {
                        item.UomDiscountAmount = (parseFloat(item.UomPrice) / 100) * parseFloat(item.Discount);
                        item.DiscountAmount = (parseFloat(item.PurchasePrice) / 100) * parseFloat(item.Discount);
                    } else {
                        item.UomDiscountAmount = (parseFloat(item.UomPrice) / 100) * parseFloat(item.Discount);
                        item.DiscountAmount = (parseFloat(item.PurchasePrice) / 100) * parseFloat(item.Discount);
                    }
                } else {
                    item.UomDiscountAmount = 0;
                    item.DiscountAmount = 0;
                }

                item.UomPriceAfterDiscount = parseFloat(item.UomPrice) - item.UomDiscountAmount;
                item.PurchasePriceAfterDiscount = parseFloat(item.PurchasePrice) - item.DiscountAmount;

                item.GstAmount = (item.UomPriceAfterDiscount / 100) * item.GstPercentage;
                item.UnitGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.GstPercentage;

                item.InGstAmount = (item.UomPriceAfterDiscount / 100) * item.InGstPercentage;
                item.UnitInGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.InGstPercentage;

                item.CGstAmount = (item.UomPriceAfterDiscount / 100) * item.CGstPercentage;
                item.UnitCGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.CGstPercentage;

                item.SGstAmount = (item.UomPriceAfterDiscount / 100) * item.SGstPercentage;
                item.UnitSGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.SGstPercentage;

                item.UomCostPrice = parseFloat((item.UomPriceAfterDiscount + item.GstAmount).toFixed(4));
                item.UnitCostPrice = parseFloat((item.PurchasePriceAfterDiscount + item.UnitGstAmount).toFixed(4));

                item.GrossAmount = parseFloat((parseFloat(item.UomPrice) * parseFloat(item.PoQuantity)).toFixed(4));
                item.NetAmount = parseFloat((parseFloat(item.UomCostPrice) * parseFloat(item.PoQuantity)).toFixed(4));
                if (item.IsMRPRequired) {
                    item.SaleAmount = parseFloat((parseFloat(item.UomMrPrice) * parseFloat(item.PoQuantity)).toFixed(4));
                } else {
                    if (parseFloat(item.UomMrPrice) > parseFloat(item.UomCostPrice)) {
                        item.SaleAmount = parseFloat((parseFloat(item.UomMrPrice) * parseFloat(item.PoQuantity)).toFixed(4));
                    } else {
                        item.SaleAmount = parseFloat((parseFloat(item.UomCostPrice) * parseFloat(item.PoQuantity)).toFixed(4));
                    }
                }
                item.ProfitAmount = item.SaleAmount - item.NetAmount;
                item.ProfitPercentage = ((item.ProfitAmount / item.NetAmount) * 100).toFixed(2);

                $scope.TotalGrossAmount = 0;
                $scope.TotalDiscountAmount = 0;
                $scope.TotalGstAmount = 0;
                $scope.TotalInGstAmount = 0;
                $scope.TotalCGstAmount = 0;
                $scope.TotalSGstAmount = 0;
                $scope.TotalNetAmount = 0;
                $scope.TotalSaleAmount = 0;
                $scope.TotalProfitAmount = 0;

                calculatetotalAmount();
            } else if (parseFloat(item.UomPrice) === 0 || parseFloat(item.UomPrice) === 'undefined') {
                item.UomPrice = 0;
                item.PurchasePrice = 0;
                item.Discount = 0;
                item.UomDiscountAmount = 0;
                item.DiscountAmount = 0;
                item.UomPriceAfterDiscount = 0;
                item.PurchasePriceAfterDiscount = 0;
                item.GstAmount = 0;
                item.UnitGstAmount = 0;
                item.InGstAmount = 0;
                item.UnitInGstAmount = 0;
                item.CGstAmount = 0;
                item.UnitCGstAmount = 0;
                item.SGstAmount = 0;
                item.UnitSGstAmount = 0;
                item.UomCostPrice = 0;
                item.UnitCostPrice = 0;
                item.GrossAmount = 0;
                item.NetAmount = 0;

                utl.Alert.showErrorMsg($translate.instant('inventory.purchaseorder.pricenotzeromsg.lbl'));
            }
        };

        $scope.computeforgivenMrPrice = function (item) {
            if (parseFloat(item.UomMrPrice) > 0) {
                item.MrPrice = parseFloat(item.UomMrPrice) / item.ConversionQuantity;
                if (item.IsMRPRequired) {
                    item.SaleAmount = parseFloat((parseFloat(item.UomMrPrice) * parseFloat(item.PoQuantity)).toFixed(4));
                } else {
                    if (parseFloat(item.UomMrPrice) > parseFloat(item.UomCostPrice)) {
                        item.SaleAmount = parseFloat((parseFloat(item.UomMrPrice) * parseFloat(item.PoQuantity)).toFixed(4));
                    } else {
                        item.SaleAmount = parseFloat((parseFloat(item.UomCostPrice) * parseFloat(item.PoQuantity)).toFixed(4));
                    }
                }

                item.ProfitAmount = item.SaleAmount - item.NetAmount;
                item.ProfitPercentage = ((item.ProfitAmount / item.NetAmount) * 100).toFixed(2);
                $scope.TotalGrossAmount = 0;
                $scope.TotalDiscountAmount = 0;
                $scope.TotalGstAmount = 0;
                $scope.TotalInGstAmount = 0;
                $scope.TotalCGstAmount = 0;
                $scope.TotalSGstAmount = 0;
                $scope.TotalNetAmount = 0;
                $scope.TotalSaleAmount = 0;
                $scope.TotalProfitAmount = 0;

                calculatetotalAmount();
            } else if (parseFloat(item.UomMrPrice) === 0 || parseFloat(item.UomMrPrice) === 'undefined') {
                item.SaleAmount = 0;
            }
        };

        // $scope.computeAmount = function (item) {
        //     if (checkprqty(item)) {
        //         if (parseFloat(item.PoQuantity) > 0) {
        //             item.TotalQuantity = parseFloat(item.PoQuantity) + parseInt(item.FreeQty || 0);
        //             item.TotalQuantityAfterConversion = item.TotalQuantity * item.ConversionQuantity;

        //             item.PurchasePrice = parseFloat(item.UomPrice) / item.ConversionQuantity;
        //             if (item.Discount > 0) {
        //                 if (item.DiscountModeId == 1) {
        //                     item.UomDiscountAmount = parseFloat(item.Discount);
        //                     item.DiscountAmount = parseFloat(item.Discount) / item.ConversionQuantity;
        //                 } else if (item.DiscountModeId == 2) {
        //                     item.UomDiscountAmount = (parseFloat(item.UomPrice) / 100) * parseFloat(item.Discount);
        //                     item.DiscountAmount = (parseFloat(item.PurchasePrice) / 100) * parseFloat(item.Discount);
        //                 } else {
        //                     item.UomDiscountAmount = (parseFloat(item.UomPrice) / 100) * parseFloat(item.Discount);
        //                     item.DiscountAmount = (parseFloat(item.PurchasePrice) / 100) * parseFloat(item.Discount);
        //                 }
        //             } else {
        //                 item.UomDiscountAmount = 0;
        //                 item.DiscountAmount = 0;
        //             }
        //             if (item.GstId > 0) {
        //                 item.GstId = item.GstId;
        //                 item.GstPercentage = parseFloat(item.GstPercentage);
        //             }

        //             item.UomPriceAfterDiscount = parseFloat(item.UomPrice) - item.UomDiscountAmount;
        //             item.PurchasePriceAfterDiscount = parseFloat(item.PurchasePrice) - item.DiscountAmount;

        //             item.GstAmount = (item.UomPriceAfterDiscount / 100) * item.GstPercentage;
        //             item.UnitGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.GstPercentage;
        //             if (item.InGstId > 0) {
        //                 item.InGstId = item.InGstId;
        //                 item.InGstPercentage = parseFloat(item.InGstPercentage);
        //             }
        //             item.InGstAmount = (item.UomPriceAfterDiscount / 100) * item.InGstPercentage;
        //             item.UnitInGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.InGstPercentage;
        //             if (item.CGstId > 0) {
        //                 item.CGstId = item.CGstId;
        //                 item.CGstPercentage = parseFloat(item.CGstPercentage);
        //             }
        //             item.CGstAmount = (item.UomPriceAfterDiscount / 100) * item.CGstPercentage;
        //             item.UnitCGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.CGstPercentage;
        //             if (item.SGstId > 0) {
        //                 item.SGstId = item.SGstId;
        //                 item.SGstPercentage = parseFloat(item.SGstPercentage);
        //             }
        //             item.SGstAmount = (item.UomPriceAfterDiscount / 100) * item.SGstPercentage;
        //             item.UnitSGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.SGstPercentage;

        //             item.UomCostPrice = parseFloat((item.UomPriceAfterDiscount + item.GstAmount).toFixed(4));
        //             item.UnitCostPrice = parseFloat((item.PurchasePriceAfterDiscount + item.UnitGstAmount).toFixed(4));

        //             item.GrossAmount = parseFloat((parseFloat(item.UomPrice) * parseFloat(item.PoQuantity)).toFixed(4));
        //             item.NetAmount = parseFloat((parseFloat(item.UomCostPrice) * parseFloat(item.PoQuantity)).toFixed(4));
        //             if (item.IsMRPRequired) {
        //                 item.SaleAmount = parseFloat((parseFloat(item.UomMrPrice) * parseFloat(item.PoQuantity)).toFixed(4));
        //             } else {
        //                 if (parseFloat(item.UomMrPrice) > parseFloat(item.UomCostPrice)) {
        //                     item.SaleAmount = parseFloat((parseFloat(item.UomMrPrice) * parseFloat(item.PoQuantity)).toFixed(4));
        //                 } else {
        //                     item.SaleAmount = parseFloat((parseFloat(item.UomCostPrice) * parseFloat(item.PoQuantity)).toFixed(4));
        //                 }
        //             }
        //             item.ProfitAmount = item.SaleAmount - item.NetAmount;
        //             item.ProfitPercentage = ((item.ProfitAmount / item.NetAmount) * 100).toFixed(2);

        //             item.UnitGrossAmount = parseFloat((parseFloat(item.PurchasePrice) * parseFloat(item.PoQuantity)).toFixed(4));
        //             item.UnitNetAmount = parseFloat((parseFloat(item.UnitCostPrice) * parseFloat(item.PoQuantity)).toFixed(4));

        //             $scope.item.OtherCharges = 0;
        //         } else if (parseFloat(item.PoQuantity) === 0) {
        //             item.TotalQuantity = 0;
        //             item.TotalQuantityAfterConversion = 0;
        //             item.GrossAmount = 0;
        //             item.NetAmount = 0;
        //             item.SaleAmount = 0;
        //             item.ProfitAmount = 0;
        //             item.ProfitPercentage = 0;

        //             $scope.item.OtherCharges = 0;
        //         } else if (parseFloat(item.PoQuantity) === 'undefined') {
        //             item.TotalQuantity = 0;
        //             item.TotalQuantityAfterConversion = 0;
        //             item.GrossAmount = 0;
        //             item.NetAmount = 0;
        //             item.SaleAmount = 0;
        //             item.ProfitAmount = 0;
        //             item.ProfitPercentage = 0;

        //             $scope.item.OtherCharges = 0;
        //         } else {
        //             item.TotalQuantity = 0;
        //             item.TotalQuantityAfterConversion = 0;
        //             item.GrossAmount = 0;
        //             item.NetAmount = 0;
        //             item.SaleAmount = 0;
        //             item.ProfitAmount = 0;
        //             item.ProfitPercentage = 0;

        //             $scope.item.OtherCharges = 0;
        //         }

        //         $scope.TotalGrossAmount = 0;
        //         $scope.TotalDiscountAmount = 0;
        //         $scope.TotalGstAmount = 0;
        //         $scope.TotalInGstAmount = 0;
        //         $scope.TotalCGstAmount = 0;
        //         $scope.TotalSGstAmount = 0;
        //         $scope.TotalNetAmount = 0;
        //         $scope.TotalSaleAmount = 0;
        //         $scope.TotalProfitAmount = 0;

        //         calculatetotalAmount();
        //     }
        // };
        $scope.computeAmount = function (item) {
            if (checkprqty(item)) {
                if (parseFloat(item.PoQuantity) > 0) {
                    item.TotalQuantity = parseFloat(item.PoQuantity) + parseFloat(item.FreeQty || 0);
                    item.TotalQuantityAfterConversion = item.TotalQuantity * item.ConversionQuantity;

                    // item.PurchasePrice = parseFloat(item.UomPrice);
                    item.PurchasePrice = parseFloat(item.UomPrice) / item.ConversionQuantity;
                    if (item.Discount > 0) {
                        if (item.DiscountModeId == 1) {
                            item.UomDiscountAmount = parseFloat(item.Discount);
                            // item.DiscountAmount = parseFloat(item.Discount) / item.TotalQuantityAfterConversion;
                            item.DiscountAmount = parseFloat(item.Discount) / item.ConversionQuantity;
                        } else if (item.DiscountModeId == 2) {
                            item.UomDiscountAmount = (parseFloat(item.UomPrice) / 100) * parseFloat(item.Discount);
                            item.DiscountAmount = (parseFloat(item.PurchasePrice) / 100) * parseFloat(item.Discount);
                        } else {
                            item.UomDiscountAmount = (parseFloat(item.UomPrice) / 100) * parseFloat(item.Discount);
                            item.DiscountAmount = (parseFloat(item.PurchasePrice) / 100) * parseFloat(item.Discount);
                        }
                    } else {
                        item.UomDiscountAmount = 0;
                        item.DiscountAmount = 0;
                    }
                    if (item.GstId > 0) {
                        item.GstId = item.GstId;
                        item.GstPercentage = parseFloat(item.GstPercentage);
                    }

                    item.UomPriceAfterDiscount = parseFloat(item.UomPrice) - item.UomDiscountAmount;
                    item.PurchasePriceAfterDiscount = parseFloat(item.PurchasePrice) - item.DiscountAmount;

                    item.GstAmount = (item.UomPriceAfterDiscount / 100) * item.GstPercentage;
                    item.UnitGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.GstPercentage;
                    if (item.InGstId > 0) {
                        item.InGstId = item.InGstId;
                        item.InGstPercentage = parseFloat(item.InGstPercentage);
                    }
                    item.InGstAmount = (item.UomPriceAfterDiscount / 100) * item.InGstPercentage;
                    item.UnitInGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.InGstPercentage;
                    if (item.CGstId > 0) {
                        item.CGstId = item.CGstId;
                        item.CGstPercentage = parseFloat(item.CGstPercentage);
                    }
                    item.CGstAmount = (item.UomPriceAfterDiscount / 100) * item.CGstPercentage;
                    item.UnitCGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.CGstPercentage;
                    if (item.SGstId > 0) {
                        item.SGstId = item.SGstId;
                        item.SGstPercentage = parseFloat(item.SGstPercentage);
                    }
                    item.SGstAmount = (item.UomPriceAfterDiscount / 100) * item.SGstPercentage;
                    item.UnitSGstAmount = (item.PurchasePriceAfterDiscount / 100) * item.SGstPercentage;

                    item.UomCostPrice = parseFloat((item.UomPriceAfterDiscount + item.GstAmount).toFixed(4));
                    item.UnitCostPrice = parseFloat((item.PurchasePriceAfterDiscount + item.UnitGstAmount).toFixed(4));

                    item.GrossAmount = parseFloat((parseFloat(item.UomPrice) * parseFloat(item.PoQuantity)).toFixed(4));
                    item.NetAmount = parseFloat((parseFloat(item.UomCostPrice) * parseFloat(item.PoQuantity)).toFixed(4));
                    if (item.IsMRPRequired) {
                        item.SaleAmount = parseFloat((parseFloat(item.UomMrPrice) * parseFloat(item.PoQuantity)).toFixed(4));
                    } else {
                        if (parseFloat(item.UomMrPrice) > parseFloat(item.UomCostPrice)) {
                            item.SaleAmount = parseFloat((parseFloat(item.UomMrPrice) * parseFloat(item.PoQuantity)).toFixed(4));
                        } else {
                            item.SaleAmount = parseFloat((parseFloat(item.UomCostPrice) * parseFloat(item.PoQuantity)).toFixed(4));
                        }
                    }
                    item.ProfitAmount = item.SaleAmount - item.NetAmount;
                    item.ProfitPercentage = ((item.ProfitAmount / item.NetAmount) * 100).toFixed(2);

                    item.UnitGrossAmount = parseFloat((parseFloat(item.PurchasePrice) * parseFloat(item.PoQuantity)).toFixed(4));
                    item.UnitNetAmount = parseFloat((parseFloat(item.UnitCostPrice) * parseFloat(item.PoQuantity)).toFixed(4));

                    $scope.item.OtherCharges = 0;
                } else if (parseFloat(item.PoQuantity) === 0) {
                    item.TotalQuantity = 0;
                    item.TotalQuantityAfterConversion = 0;
                    item.GrossAmount = 0;
                    item.NetAmount = 0;
                    item.SaleAmount = 0;
                    item.ProfitAmount = 0;
                    item.ProfitPercentage = 0;

                    $scope.item.OtherCharges = 0;
                } else if (parseFloat(item.PoQuantity) === 'undefined') {
                    item.TotalQuantity = 0;
                    item.TotalQuantityAfterConversion = 0;
                    item.GrossAmount = 0;
                    item.NetAmount = 0;
                    item.SaleAmount = 0;
                    item.ProfitAmount = 0;
                    item.ProfitPercentage = 0;

                    $scope.item.OtherCharges = 0;
                } else {
                    item.TotalQuantity = 0;
                    item.TotalQuantityAfterConversion = 0;
                    item.GrossAmount = 0;
                    item.NetAmount = 0;
                    item.SaleAmount = 0;
                    item.ProfitAmount = 0;
                    item.ProfitPercentage = 0;

                    $scope.item.OtherCharges = 0;
                }

                $scope.TotalGrossAmount = 0;
                $scope.TotalDiscountAmount = 0;
                $scope.TotalGstAmount = 0;
                $scope.TotalInGstAmount = 0;
                $scope.TotalCGstAmount = 0;
                $scope.TotalSGstAmount = 0;
                $scope.TotalNetAmount = 0;
                $scope.TotalSaleAmount = 0;
                $scope.TotalProfitAmount = 0;

                calculatetotalAmount();
            }
        };

        function checkprqty(item) {
            if ($scope.item.PurchaseRequestId > 0 && parseFloat(item.PoQuantity) > item.RequestedQuantity) {
                utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.poqtygreaterprqtymsg.lbl') + item.ItemName);
                item.PoQuantity = 0;
                return false;
            }

            return true;
        }

        function calculatetotalAmount() {
            if ($scope.item.OtherCharges) {
                $scope.OtherCharges = $scope.item.OtherCharges;
            } else {
                $scope.OtherCharges = 0;
            }
            if ($scope.item.TransportCharges) {
                $scope.TransportCharges = $scope.item.TransportCharges;
            } else {
                $scope.TransportCharges = 0;
            }
            if ($scope.item.OtherChargesGstAmount > 0) {
                $scope.OtherChargesGstAmount = $scope.item.OtherChargesGstAmount;
            } else {
                $scope.OtherChargesGstAmount = 0
            }
            if ($scope.item.RoundOff === '-' || $scope.item.RoundOff === '') {
                $scope.RoundOff = 0;
            } else {
                $scope.RoundOff = parseFloat($scope.item.RoundOff);
            }
            for (var idx in $scope.purchaseorderDetails) {
                var activeitem = $scope.purchaseorderDetails[idx];
                if (activeitem.ItemMasterId > 0 && parseFloat(activeitem.PoQuantity) > 0 && activeitem.Status == 1) {
                    $scope.TotalGrossAmount = parseFloat(($scope.TotalGrossAmount + activeitem.GrossAmount).toFixed(4));
                    $scope.TotalDiscountAmount = parseFloat(($scope.TotalDiscountAmount + (activeitem.UomDiscountAmount * parseFloat(activeitem.PoQuantity))).toFixed(4));
                    $scope.TotalGstAmount = parseFloat(($scope.TotalGstAmount + (activeitem.GstAmount * parseFloat(activeitem.PoQuantity))).toFixed(4));
                    $scope.TotalInGstAmount = parseFloat(($scope.TotalInGstAmount + (activeitem.InGstAmount * parseFloat(activeitem.PoQuantity))).toFixed(4));
                    $scope.TotalCGstAmount = parseFloat(($scope.TotalCGstAmount + (activeitem.CGstAmount * parseFloat(activeitem.PoQuantity))).toFixed(4));
                    $scope.TotalSGstAmount = parseFloat(($scope.TotalSGstAmount + (activeitem.SGstAmount * parseFloat(activeitem.PoQuantity))).toFixed(4));
                    $scope.TotalNetAmount = parseFloat(($scope.TotalNetAmount + activeitem.NetAmount).toFixed(4));
                    $scope.TotalNetAmounts = $scope.TotalNetAmount + ($scope.RoundOff || 0) + ($scope.OtherCharges || 0) + ($scope.OtherChargesGstAmount || 0);
                    $scope.TotalSaleAmount = parseFloat(($scope.TotalSaleAmount + activeitem.SaleAmount).toFixed(4));
                    $scope.TotalProfitAmount = $scope.TotalSaleAmount - $scope.TotalNetAmounts;
                }
            }

            $scope.item.TotalGrossAmount = $scope.TotalGrossAmount;
            $scope.item.TotalDiscountAmount = $scope.TotalDiscountAmount;
            $scope.item.TotalGstAmount = $scope.TotalGstAmount;
            $scope.item.TotalInGstAmount = $scope.TotalInGstAmount;
            $scope.item.TotalCGstAmount = $scope.TotalCGstAmount;
            $scope.item.TotalSGstAmount = $scope.TotalSGstAmount;
            $scope.item.TotalNetAmount = $scope.TotalNetAmounts;
            // $scope.item.TotalNetAmount = $scope.TotalNetAmount + ($scope.RoundOff || 0) + ($scope.OtherCharges || 0) + ($scope.OtherChargesGstAmount || 0);
            $scope.item.TotalSaleAmount = $scope.TotalSaleAmount;
            $scope.item.TotalProfitAmount = $scope.TotalProfitAmount;
        }
        vm.purchaseorderitemcontrolconfig = {
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
                    header: 'Product Type Name',
                    field: 'ProductTypeName',
                    datatype: 'string',
                    headercls: 'td-producttypename',
                    fieldcls: 'td-producttypename'
                },
                /*
                {
                    header: 'Generic Name',
                    field: 'GenericName',
                    datatype: 'string',
                    headercls: 'td-genericname',
                    fieldcls: 'td-genericname'
                },
                */
                // {
                //     header: 'Manufacturer Name',
                //     field: 'ManufacturerName',
                //     datatype: 'string',
                //     headercls: 'td-manufacturername',
                //     fieldcls: 'td-manufacturername'
                // },
                {
                    header: 'Stock-In-Hand',
                    field: 'StockInHand',
                    datatype: 'string',
                    headercls: 'td-stockinhand',
                    fieldcls: 'td-stockinhand'
                },
                // {
                //     header: 'Mrp',
                //     field: 'Mrp',
                //     datatype: 'string',
                //     headercls: 'td-mrp',
                //     fieldcls: 'td-mrp'
                // }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/itemmaster/GetItemVendorMaps',
            formatdisplay: formatselectedpoitem,
            presearch: presearchpoitem,
            postsearch: postsearchpoitem
        };

        function formatselectedpoitem() {
            var selectedItem = vm.purchaseorderitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                // result = [selectedItem.ItemName + '(' + selectedItem.ItemCode + ')'].join('    ');
                result = selectedItem.ItemName;
            } else if (vm.purchaseorderitemcontrolconfig.rowdata) {
                // result = [vm.purchaseorderitemcontrolconfig.rowdata.ItemName, vm.purchaseorderitemcontrolconfig.rowdata.ItemCode].join(' ');
                result = vm.purchaseorderitemcontrolconfig.rowdata.ItemName;
            }
            return result;
        }

        function presearchpoitem() {
            var inputData = {};
            var query = null;
            // if ($scope.item.IsOpenPO) {
            vm.purchaseorderitemcontrolconfig.api = 'pharmacy/itemmaster/GetItemsForPurchaseOrder';
            query = vm.purchaseorderitemcontrolconfig.query;
            inputData = {
                Params: [{
                        Key: 3,
                        Value: 2
                    },
                    {
                        Key: 11,
                        Value: $scope.item.StoreMasterId
                    },
                    {
                        Key: 7,
                        Value: $scope.item.StoreTypeId
                    },
                    // {
                    //     Key: 11,
                    //     Value: $scope.item.StoreMasterId
                    // },
                    // {
                    //     Key: 24,
                    //     Value: $scope.item.VendorMasterId
                    // }
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };
            if (vm.purchaseorderitemcontrolconfig.searchbyid === true) {
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
            // } 
            // else {
            //     vm.purchaseorderitemcontrolconfig.api = 'pharmacy/itemmaster/GetItemVendorMaps';
            //     query = vm.purchaseorderitemcontrolconfig.query;
            //     inputData = {
            //         Params: [
            //             {
            //                 Key: 1,
            //                 Value: $scope.item.VendorMasterId
            //             },
            //             {
            //                 Key: 4,
            //                 Value: $scope.item.StoreMasterId
            //             },
            //             {
            //                 Key: 3,
            //                 Value: 2
            //             },
            //             /* { Key: 6, Value: $scope.item.Rank }, */
            //             {
            //                 Key: 13,
            //                 Value: $scope.item.StoreTypeId
            //             }
            //         ],
            //         PageContext: {
            //             PageSize: -1,
            //             PageNumber: 1
            //         }
            //     };

            //     if (vm.purchaseorderitemcontrolconfig.searchbyid === true) {
            //         inputData.Params.push({
            //             Key: 0,
            //             Value: query
            //         });
            //     } else if (query && query.length > 2) {
            //         inputData.Params.push({
            //             Key: 3,
            //             Value: query
            //         });
            //     }
            // }

            vm.purchaseorderitemcontrolconfig.searchparams = inputData;
        }

        function postsearchpoitem() {
            for (var idx in vm.purchaseorderitemcontrolconfig.result) {
                var item = vm.purchaseorderitemcontrolconfig.result[idx];
                item.ItemCode = item.ItemCode;
                item.ItemName = item.ItemName;
                item.UomMrPrice = item.Mrp;
                item.IsBillable = item.IsBillable;
                if (item.ProductType) {
                    item.ProductTypeName = item.ProductType.ProductTypeName;
                } else {
                    if (item.ItemMaster) {
                        if (item.ItemMaster.ProductType) {
                            item.ProductTypeName = item.ItemMaster.ProductType.ProductTypeName;
                        } else {
                            item.ProductTypeName = '';
                        }
                    } else {
                        item.ProductTypeName = '';
                    }
                }
                if (item.GenericMaster) {
                    item.GenericName = item.GenericMaster.GenericName;
                } else {
                    if (item.ItemMaster) {
                        if (item.ItemMaster.GenericMaster) {
                            item.GenericName = item.ItemMaster.GenericMaster.GenericName;
                        } else {
                            item.GenericName = '';
                        }
                    } else {
                        item.GenericName = '';
                    }
                }
                if (item.Manufacturer) {
                    item.ManufacturerName = item.Manufacturer.VendorName;
                } else {
                    if (item.ItemMaster) {
                        if (item.ItemMaster.Manufacturer) {
                            item.ManufacturerName = item.ItemMaster.Manufacturer.VendorName;
                        } else {
                            item.ManufacturerName = '';
                        }
                    } else {
                        item.ManufacturerName = '';
                    }
                }
                if (item.StockItem) {
                    item.StockInHand = item.StockItem.Quantity;
                    item.Mrp = parseFloat(item.MrPrice).toFixed(2);
                } else {
                    if (item.ItemMaster) {
                        if (item.ItemMaster.StockItem) {
                            item.StockInHand = item.ItemMaster.StockItem.Quantity;
                        } else {
                            item.StockInHand = 0;
                        }
                    } else {
                        item.StockInHand = 0;
                    }
                    item.Mrp = parseFloat(item.UomMrPrice).toFixed(2);
                }
            }
        }
        // vm.purchaseorderitemcontrolconfig = {
        //     query: '',
        //     searchbyid: false,
        //     options: [{
        //             header: 'Item Code',
        //             field: 'ItemCode',
        //             datatype: 'string',
        //             headercls: 'td-code',
        //             fieldcls: 'td-code'
        //         },
        //         {
        //             header: 'Item Name',
        //             field: 'ItemName',
        //             datatype: 'string',
        //             headercls: 'td-name',
        //             fieldcls: 'td-name'
        //         },
        //         {
        //             header: 'Product Name',
        //             field: 'ProductTypeName',
        //             datatype: 'string',
        //             headercls: 'td-producttypename',
        //             fieldcls: 'td-producttypename'
        //         },
        //         {
        //             header: 'Generic',
        //             field: 'GenericName',
        //             datatype: 'string',
        //             headercls: 'td-genericname',
        //             fieldcls: 'td-genericname'
        //         },
        //         // {
        //         //     header: 'Manufacturer',
        //         //     field: 'ManufacturerName',
        //         //     datatype: 'string',
        //         //     headercls: 'td-manufacturername',
        //         //     fieldcls: 'td-manufacturername'
        //         // },
        //         {
        //             header: 'Stock-In-Hand',
        //             field: 'StockInHand',
        //             datatype: 'string',
        //             headercls: 'td-stockinhand',
        //             fieldcls: 'td-stockinhand'
        //         }
        //     ],
        //     searchparams: {},
        //     result: {},
        //     api: 'pharmacy/itemmaster/GetItemVendorMaps',
        //     formatdisplay: formatselectedpurchaseorderitem,
        //     presearch: presearchpurchaseorderitem,
        //     postsearch: postsearchpurchaseorderitem
        // };

        // function formatselectedpurchaseorderitem() {
        //     var selectedItem = vm.purchaseorderitemcontrolconfig.selected;
        //     var result = '';
        //     if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
        //         result = [selectedItem.ItemName + '(' + selectedItem.ItemCode + ')'].join('    ');
        //     } else if (vm.purchaseorderitemcontrolconfig.rowdata) {
        //         result = [vm.purchaseorderitemcontrolconfig.rowdata.ItemName, vm.purchaseorderitemcontrolconfig.rowdata.ItemCode].join(' ');
        //     }
        //     return result;
        // }

        // function presearchpurchaseorderitem() {
        //     var inputData = {};
        //     var query = null;
        //     if ($scope.item.IsOpenPO) {
        //         vm.purchaseorderitemcontrolconfig.api = 'pharmacy/itemmaster/GetItemsForPurchaseOrder';
        //         query = vm.purchaseorderitemcontrolconfig.query;
        //         inputData = {
        //             Params: [{
        //                     Key: 3,
        //                     Value: 2
        //                 },
        //                 // {
        //                 //     Key: 7,
        //                 //     Value: $scope.item.StoreTypeId
        //                 // },
        //                 {
        //                     Key: 11,
        //                     Value: $scope.item.StoreMasterId
        //                 },
        //                 // {
        //                 //     Key: 24,
        //                 //     Value: $scope.item.VendorMasterId
        //                 // }
        //             ],
        //             PageContext: {
        //                 PageSize: -1,
        //                 PageNumber: 1
        //             }
        //         };
        //         if (vm.purchaseorderitemcontrolconfig.searchbyid === true) {
        //             inputData.Params.push({
        //                 Key: 0,
        //                 Value: query
        //             });
        //         } else if (query && query.length > 2) {
        //             inputData.Params.push({
        //                 Key: 1,
        //                 Value: query
        //             });
        //         }
        //     } else {
        //         vm.purchaseorderitemcontrolconfig.api = 'pharmacy/itemmaster/GetItemVendorMaps';
        //         query = vm.purchaseorderitemcontrolconfig.query;
        //         if ($scope.item.VendorMasterId > 0) {
        //             inputData = {
        //                 Params: [
        //                     // {
        //                     //     Key: 1,
        //                     //     Value: $scope.item.VendorMasterId
        //                     // },
        //                     // {
        //                     //     Key: 4,
        //                     //     Value: $scope.item.StoreMasterId
        //                     // },
        //                     {
        //                         Key: 3,
        //                         Value: 2
        //                     },
        //                     // {
        //                     //     Key: 13,
        //                     //     Value: $scope.item.StoreTypeId
        //                     // }
        //                 ],
        //                 PageContext: {
        //                     PageSize: -1,
        //                     PageNumber: 1
        //                 }
        //             };
        //         }
        //         if (vm.purchaseorderitemcontrolconfig.searchbyid === true) {
        //             inputData.Params.push({
        //                 Key: 0,
        //                 Value: query
        //             });
        //         } else if (query && query.length > 2) {
        //             inputData.Params.push({
        //                 Key: 3,
        //                 Value: query
        //             });
        //         }
        //     }

        //     vm.purchaseorderitemcontrolconfig.searchparams = inputData;
        // }

        // function postsearchpurchaseorderitem() {
        //     for (var idx in vm.purchaseorderitemcontrolconfig.result) {
        //         var item = vm.purchaseorderitemcontrolconfig.result[idx];
        //         item.ItemCode = item.ItemCode;
        //         item.ItemName = item.ItemName;
        //         if (item.ProductType) {
        //             item.ProductTypeName = item.ProductType.ProductTypeName;
        //         } else {
        //             if (item.ItemMaster) {
        //                 if (item.ItemMaster.ProductType) {
        //                     item.ProductTypeName = item.ItemMaster.ProductType.ProductTypeName;
        //                 } else {
        //                     item.ProductTypeName = '';
        //                 }
        //             } else {
        //                 item.ProductTypeName = '';
        //             }
        //         }
        //         if (item.GenericMaster) {
        //             item.GenericName = item.GenericMaster.GenericName;
        //         } else {
        //             if (item.ItemMaster) {
        //                 if (item.ItemMaster.GenericMaster) {
        //                     item.GenericName = item.ItemMaster.GenericMaster.GenericName;
        //                 } else {
        //                     item.GenericName = '';
        //                 }
        //             } else {
        //                 item.GenericName = '';
        //             }
        //         }
        //         if (item.Manufacturer) {
        //             item.ManufacturerName = item.Manufacturer.VendorName;
        //         } else {
        //             if (item.ItemMaster) {
        //                 if (item.ItemMaster.Manufacturer) {
        //                     item.ManufacturerName = item.ItemMaster.Manufacturer.VendorName;
        //                 } else {
        //                     item.ManufacturerName = '';
        //                 }
        //             } else {
        //                 item.ManufacturerName = '';
        //             }
        //         }
        //         if (item.StockItem) {
        //             item.StockInHand = item.StockItem.Quantity;
        //             item.Mrp = parseFloat(item.MrPrice).toFixed(2);
        //         } else {
        //             if (item.ItemMaster) {
        //                 if (item.ItemMaster.StockItem) {
        //                     item.StockInHand = item.ItemMaster.StockItem.Quantity;
        //                 } else {
        //                     item.StockInHand = 0;
        //                 }
        //             } else {
        //                 item.StockInHand = 0;
        //             }
        //             item.Mrp = parseFloat(item.UomMrPrice).toFixed(2);
        //         }
        //     }
        // }

        vm.vendorcontrolconfig = {
            query: '',
            searchbyid: false,

            options: [{
                    header: 'Supplierndor Code',
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
            api: 'pharmacy/vendorfacilitymap/GetVendorFacilityMaps',
            formatdisplay: formatselectedvendor,
            presearch: presearchvendor,
            postsearch: postsearchvendor
        };

        function formatselectedvendor() {
            var selectedItem = vm.vendorcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.VendorMasterId = selectedItem.VendorMasterId;
                $scope.item.VendorCode = selectedItem.VendorCode;
                $scope.item.VendorName = selectedItem.VendorName;
                $scope.item.MobileNumber = selectedItem.VendorMaster.MobileNumber;
                $scope.item.EmailAddress = selectedItem.VendorMaster.EmailAddress;
                $scope.item.PaymentTermsId = selectedItem.VendorMaster.PaymentTermsId;
                $scope.item.PANNo = selectedItem.VendorMaster.PANNo;
                $scope.item.GSTNo = selectedItem.VendorMaster.GSTNo;
                $scope.item.TANNo = selectedItem.VendorMaster.TANNo;
                $scope.item.AddressLine1 = selectedItem.VendorMaster.AddressLine1;
                $scope.item.AddressLine2 = selectedItem.VendorMaster.AddressLine2;
                $scope.item.AddressLine3 = selectedItem.VendorMaster.AddressLine3;
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
                    PageSize: -1,
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
                item.EmailAddress = item.EmailAddress;
            }
        }

        $scope.getCreatedUserCallback = function (scope, res, options, hasError) {
            $scope.CreatedUser = res.Data[0];
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getCreatedUser = function () {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.currentcontext.id
                }]
            };

            var options = {
                action: 'pharmacy/purchaseorder/GetPurchaseOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getCreatedUserCallback
            };

            utl.Http.doAction(options);
        };

        $scope.setIndexforTableIndex = function () {
            var SNo = 1;
            for (var idx in $scope.purchaseorderDetails) {
                if ($scope.purchaseorderDetails[idx].Status == 1) {
                    $scope.purchaseorderDetails[idx].SNo = SNo;
                    $scope.purchaseorderDetails[idx].itemidxdesc = 'desc' + (SNo - 1);
                    $scope.purchaseorderDetails[idx].itemidxqty = 'qty' + (SNo - 1);
                    SNo++;
                }
            }
        };

        $scope.moveHeaderFocus = function (nextId) {
            if (event.keyCode == 13) {
                if (nextId == "vendorid") {
                    var dom2 = document.getElementById('tostoreid');
                    $scope.setCmbFocus(dom2);
                } else if (nextId == "tostoreid") {
                    $timeout(function () {
                        var idx = $scope.purchaseorderDetails.length - 1;
                        nextId = "desc" + '' + idx;
                        $('#' + nextId).focus();
                    }, 100);
                }
            }
        };

        $scope.getActiveRecord = function () {
            var activeRecords = $filter('filterArrayItems')($scope.purchaseorderDetails, [{
                search: 1,
                fields: ['Status']
            }]);

            return activeRecords;
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
                upId = upId + (index - 1);
                $('#' + upId).focus();
            } else if (event.keyCode == 40) { // Down
                downId = downId + (index + 1);
                $('#' + downId).focus();
            }

            if (event.keyCode == 13) {
                if (nextId == 'desc') {
                    var activeRecords = $scope.getActiveRecord();
                    var idx = activeRecords.length - 1;
                    nextId = "desc" + '' + idx;
                    if (idx == (index)) {
                        nextId = "approvebtnsubmit";
                        $('#' + nextId).focus();
                    } else {
                        $timeout(function () {
                            $('#' + nextId).focus();
                        }, 100);
                    }
                } else if (nextId == 'qty') {
                    nextId = nextId + index;
                    $('#' + nextId).select();
                    $('#' + nextId).focus();
                } else if (nextId == 'freeqty') {
                    nextId = nextId + index;
                    $('#' + nextId).select();
                    $('#' + nextId).focus();
                } else if (nextId == 'uomprice') {
                    nextId = nextId + index;
                    $('#' + nextId).focus();
                } else if (nextId == 'uommrprice') {
                    nextId = nextId + index;
                    $('#' + nextId).focus();
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

        $scope.numberwithdecimal = function (e) {
            if ($.inArray(e.keyCode, [8, 9, 27, 13, 110, 190]) !== -1 ||
                // Allow: Ctrl+A, Command+A
                (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                // Allow: home, end, left, right, down, up
                (e.keyCode >= 35 && e.keyCode <= 40)) {
                // Let it happen, don't do anything
                return;
            }
            // Ensure that it is a number and stop the keypress && (e.keyCode < 96 || e.keyCode > 105)
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && e.keyCode != 46) {
                e.preventDefault();
            }
        };

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

        $scope.setCmbFocus = function (dom) {
            $timeout(function () {
                var uiSelect = angular.element(dom);
                var uichild = uiSelect.controller('uiSelect');
                uichild.activate();
            }, 100);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $('#authorizebtnsubmit').text("Authorize (F2)");
            $('#approvebtnsubmit').text("Approve (F4)");
            $('#printbtnsubmit').text("Print (Alt + P)");
            $('#btndmprint').text("DMPrint (Alt + P)");
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'Facility') {
                    $scope.item.FacilityMail = value[1].Email;
                }
                if (key == 'UserStores' && $scope.item.StoreMasterId === 0) {
                    $scope.item.StoreMasterId = value[0].Id;
                    $scope.item.StoreTypeId = value[0].StoreMaster.StoreTypeId;
                    $scope.item.Email = value[0].StoreMaster.Email;
                    $scope.item.Password = value[0].StoreMaster.Password;
                    $scope.item.IsOpenPO = value[0].StoreMaster.CanAllowOpenPO;
                    $scope.item.IsGstEditablePo = value[0].StoreMaster.IsGstEditablePo;
                } else if (key == 'UserStores' && $scope.item.StoreMasterId > 0) {
                    for (var userstoreid = 0; userstoreid < $scope.lookup['UserStores'].length; userstoreid++) {
                        if ($scope.lookup['UserStores'][userstoreid].Id == $scope.item.StoreMasterId) {
                            $scope.item.StoreTypeId = $scope.lookup['UserStores'][userstoreid].StoreMaster.StoreTypeId;
                            $scope.item.Email = $scope.lookup['UserStores'][userstoreid].StoreMaster.Email;
                            $scope.item.Password = $scope.lookup['UserStores'][userstoreid].StoreMaster.Password;
                            $scope.item.IsOpenPO = $scope.lookup['UserStores'][userstoreid].StoreMaster.IsOpenPO;
                            $scope.item.IsGstEditablePo = $scope.lookup['UserStores'][userstoreid].StoreMaster.IsGstEditablePo;
                        }
                    }
                }
            });
        };

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "Organization"
                },
                {
                    "Key": "Facility"
                },
                // {
                //     "Key": "GstMaster"
                // },
                {
                    "Key": "GstMaster",
                    Request: {
                        Params: [{
                                Key: 3,
                                Value: 2
                            }, {
                                Key: 5,
                                Value: [-1, utl.Session.getCurrentFacilityId()]
                            },
                            // { Key: 8, Value: true }
                        ]
                    }
                },
                {
                    "Key": "ToStore",
                    Request: {
                        Params: [{
                                Key: 6,
                                Value: $scope.item.FacilityId
                            },
                            {
                                Key: 7,
                                Value: 2
                            }
                        ]
                    }
                },
                {
                    "Key": "PoType"
                },
                {
                    "Key": "PoStatus"
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
                                Value: $scope.item.FacilityId
                            },
                            {
                                Key: 5,
                                Value: 2
                            }
                        ]
                    },
                    Default: false
                },
                // {
                //     "Key": "User"
                // },
                {
                    "Key": "Remark",
                    Request: {
                        Params: [{
                            Key: 3,
                            Value: 7
                        }, {
                            Key: 5,
                            Value: 2
                        }],

                    }
                },
                {
                    "Key": "PaymentTerms"
                },
                {
                    "Key": "DiscountMode"
                }
            ];

            $scope.getLookUp(inputData);
            loadData();
            $timeout(function () {
                $('#vendorid').focus();
            }, 1000);
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

        /* PO dotmatrix print starts */

        $scope.dmPrint = function () {

            if ($scope.dmprintpreferences != 1) {
                utl.Alert.showSuccessMsg($translate.instant('inventory.purchaseorder.successmsg.lbl'));
                return false;
            } else {
                var inputData = {
                    Id: $scope.currentcontext.id
                };
                var options = {
                    action: 'pharmacy/PurchaseOrder/DMPrintPurchaseOrder',
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
            $scope.printPurchaseOrder(dmPrintInput);
        };

        function preparePrintData(data) {
            console.log('preparePrintData starts');

            var vVendorName = '';
            var vPODate = '';
            var vAddress1 = '';
            var vAddress2 = '';
            var vStateName = '';
            var vCountryName = '';
            var vPincode = '';
            var vPONo = '';
            var vContactPerson = '';
            var vPOType = '';
            var vFacility = '';
            var vExpDelDate = '';
            var vStatus = '';
            var vStore = '';
            var vDeliverStore = '';
            var vStoreheading1 = '';
            var vStoreheading2 = '';
            var vStoreheading3 = '';
            var vStoreheading4 = '';

            if (data.PurchaseOrder.VendorMaster) vVendorName = '' + data.PurchaseOrder.VendorMaster.VendorName;
            if (data.PurchaseOrder.PoType) vPOType = '' + data.PurchaseOrder.PoType.Description;
            if (data.PurchaseOrder.FromStore.StoreName) vStore = '' + data.PurchaseOrder.FromStore.StoreName;
            if (data.PurchaseOrder.DeliveryStoreName) vDeliverStore = '' + data.PurchaseOrder.DeliveryStoreName;
            if (data.PurchaseOrder.PoStatus) vStatus = '' + data.PurchaseOrder.PoStatus.Description;
            if (data.PurchaseOrder.VendorMaster.VendorContact.AddressLine1)
                vAddress1 = '' + data.PurchaseOrder.VendorMaster.VendorContact.AddressLine1;
            if (data.PurchaseOrder.VendorMaster.VendorContact.AddressLine2)
                vAddress2 = '' + data.PurchaseOrder.VendorMaster.VendorContact.AddressLine2;
            if (data.PurchaseOrder.VendorMaster.VendorContact.StateMaster)
                if (data.PurchaseOrder.VendorMaster.VendorContact.StateMaster.StateName)
                    vStateName = ' ' + data.PurchaseOrder.VendorMaster.VendorContact.StateMaster.StateName;
            if (data.PurchaseOrder.VendorMaster.VendorContact.CountryMaster)
                if (data.PurchaseOrder.VendorMaster.VendorContact.CountryMaster.CountryName)
                    vCountryName = ' ' + data.PurchaseOrder.VendorMaster.VendorContact.CountryMaster.CountryName;
            if (data.PurchaseOrder.VendorMaster.VendorContact.PincodeMaster)
                if (data.PurchaseOrder.VendorMaster.VendorContact.PincodeMaster.Pincode)
                    vPincode = ' ' + data.PurchaseOrder.VendorMaster.VendorContact.PincodeMaster.Pincode;
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

                vVendorName: vVendorName,
                vPODate: utl.Formatter.getDateTimeString(data.PurchaseOrder.PoDate),
                vAddress1: vAddress1,
                vAddress2: vAddress2,
                vStateName: vStateName,
                vCountryName: vCountryName,
                vPincode: vPincode,
                vPONo: data.PurchaseOrder.PoNumber,
                vContactPerson: data.PurchaseOrder.VendorMaster.VendorContact.ContactPerson,
                vPOType: vPOType,
                vFacility: data.PurchaseOrder.Facility.FacilityName,
                vExpDelDate: data.PurchaseOrder.DeliveryDate,
                vStatus: vStatus,
                vStore: vStore,
                vDeliverStore: vDeliverStore,
                vGrossAmount: data.PurchaseOrder.TotalGrossAmount,
                vDiscount: data.PurchaseOrder.TotalDiscountAmount,
                vTax: data.PurchaseOrder.TotalGstAmount,
                vOtherCost: data.PurchaseOrder.OtherCharges,
                vNetAmount: data.PurchaseOrder.TotalNetAmount,
                vStoreheading1: vStoreheading1,
                vStoreheading2: vStoreheading2,
                vStoreheading3: vStoreheading3,
                vStoreheading4: vStoreheading4,
            };
            dmPrintInput.lines = [];
            var islno = 1;
            for (var idx in data.PurchaseOrderDetail) {
                var PurchaseOrderDetail = data.PurchaseOrderDetail[idx];

                var Amt = PurchaseOrderDetail.NetAmount - (PurchaseOrderDetail.PoQuantity * PurchaseOrderDetail.GstAmount);
                var totgst = PurchaseOrderDetail.CGstAmount + PurchaseOrderDetail.SGstAmount;
                var TotalMrp = PurchaseOrderDetail.PoQuantity * PurchaseOrderDetail.UomMrPrice;


                var detail = {
                    ispace: ' ',
                    slno: islno++,
                    MatName: PurchaseOrderDetail.ItemName,
                    POqty: PurchaseOrderDetail.PoQuantity,
                    FreeQty: PurchaseOrderDetail.FreeQty,
                    PurchasePrice: PurchaseOrderDetail.UomPrice.toFixed(2),
                    GST: PurchaseOrderDetail.GstAmount.toFixed(2),
                    UCP: PurchaseOrderDetail.UomCostPrice.toFixed(2),
                    Dis: PurchaseOrderDetail.UomDiscountAmount.toFixed(2),
                    Value: Amt.toFixed(2),
                    cgstamt: PurchaseOrderDetail.CGstAmount.toFixed(2),
                    sgstamt: PurchaseOrderDetail.SGstAmount.toFixed(2),
                    totgst: totgst.toFixed(2),
                    amount: PurchaseOrderDetail.NetAmount.toFixed(2),
                    TotalMrp: TotalMrp.toFixed(2)
                };
                dmPrintInput.lines.push(detail);
            }
            console.log('preparePrintData ends');
            return dmPrintInput;
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
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        /* Purchase Orders - Shortcut Keys - Start */
        function keyupHandler(e) {
            var kCode = e.keyCode;
            if (kCode == 115 && savehitcompleted === 0 && $scope.canShowSaveandApproveBtn) { // F4  - SaveAndApprove
                $scope.SaveandApprove();
            }
            if (kCode == 113 && savehitcompleted === 0 && $scope.canShowAuthorizeBtn) { // F2  - Authorize
                $scope.SaveandAuthorize();
            }
            if (kCode == 118) { // F7  - New Page
                $scope.clear();
            }
            if (kCode == 119) { // F8  - Find PO
                $scope.findpo();
            }
            if (e.altKey && kCode == 80) { // alt + p  - DMPrint
                if ($scope.dmprintpreferences > 0) {
                    $scope.dmPrint();
                } else if ($scope.printpreferences > 0) {
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
        /* Purchase Orders - Shortcut Keys - End */

        $scope.getPharmacyPrintPreference();
        $scope.checkHeader = function (iVal) {
            if (iVal == 1) {
                $scope.item.WithoutHeader = false;
            }
            if (iVal == 2) {
                $scope.item.WithHeader = false;
            }
        };
        $scope.initLookup();
        $scope.toggle = false;
    }

    purchaseOrderAmendController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$timeout'];

})();