(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('purchaseRequestFormController', purchaseRequestFormController);

    function purchaseRequestFormController($rootScope, $scope, $stateParams, $state, $translate, utl, $filter, $timeout) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));

        $scope.tabindexmap = {
            patienttabindex: 1,
            detailtabindex: 2
        };

        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            PrTypeId: 1,
            PrStatusId: 0,
            VendorFacilityMapId: -1,
            VendorMasterId: -1,
            ToStoreMasterId: -1,
            StoreMasterId: 0,
            StoreTypeId: -1,
            TotalGrossAmount: 0,
            TotalDiscountAmount: 0,
            TotalGstAmount: 0,
            TotalNetAmount: 0,
            isDisabled: false,
            DisplayPrStatus: null,
            RBDisabled: true,
            PrNumber: null,
            isStoreorVendor: null,
            RequestedDate: utl.Formatter.getCurrentDate(),
            StoreName: '',
            DepartmentId: -1
        };

        $scope.lookup = {};

        $scope.currentcontext = {
            id: -1
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.currentcontext.id = parseInt($stateParams.id);

        $scope.purchaserequestDetails = [];

        $scope.applyVisibilityRules = function () {
            // New
            if ($scope.item.PrStatusId != 1 || $scope.item.PrStatusId != 2 || $scope.item.PrStatusId != 3 || $scope.item.PrStatusId != 4 || $scope.item.PrStatusId != 5) {
                $scope.canShowPrintBtn = false;
                $scope.canShowSaveBtn = true;
                $scope.canShowSaveandApproveBtn = true;
                $scope.canShowClearBtn = true;
                $scope.canShowCancelBtn = false;
                $scope.canShowCancelPrBtn = false;
                $scope.canShowDeleteBtn = false;
                $scope.canShowHistoryBtn = false;
            }
            // When In Draft Status
            if ($scope.item.PrStatusId == 1) {
                $scope.canShowSaveandApproveBtn = true;
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.canShowCancelPrBtn = false;
                $scope.canShowDeleteBtn = true;
                $scope.canShowHistoryBtn = true;
            }
            // When In Approved Status
            if ($scope.item.PrStatusId == 2) {
                $scope.canShowAuthorizeBtn = true;
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.canShowCancelPrBtn = true;
                $scope.canShowDeleteBtn = false;
                $scope.canShowHistoryBtn = true;
            }
            // When In Authorized Status
            if ($scope.item.PrStatusId == 3) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowDeleteBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.canShowCancelPrBtn = true;
                $scope.canShowDeleteBtn = false;
                $scope.canShowHistoryBtn = true;
            }
            // When In Complete Status
            if ($scope.item.PrStatusId == 4) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowDeleteBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.canShowCancelPrBtn = false;
                $scope.canShowDeleteBtn = false;
            }
            // When In Cancelled Status
            if ($scope.item.PrStatusId == 5) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowDeleteBtn = false;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.canShowCancelPrBtn = false;
                $scope.canShowDeleteBtn = false;
                $scope.canShowHistoryBtn = true;
            }
        };

        $scope.addNewLineItem = function () {
            var purchaserequestDetail = {
                Id: 0,
                SNo: 0,
                ItemMasterId: 0,
                ItemCode: '',
                ItemName: '',
                BaseUom: {
                    Id: 0,
                    UomCode: ''
                },
                BaseUomId: 0,
                PurchaseUomId: 0,
                QuantityOnHand: 0,
                RequestedQuantity: 0,
                ConversionQuantity: 1,
                PurchasePrice: 0,
                MrPrice: 0,
                DiscountModeId: 0,
                DiscountMode: '',
                DiscountAmount: 0,
                UnitDiscountAmount: 0,
                PurchasePriceAfterDiscount: 0,
                GstMaster: {
                    Id: 0,
                    GstCode: '',
                    GstName: '',
                    GstPercentage: ''
                },
                GstId: 0,
                GstCode: '',
                GstPercentage: 0,
                StoreMasterId: 0,
                GstAmount: 0,
                UnitGstAmount: 0,
                UnitCostPrice: 0,
                GrossAmount: 0.00,
                NetAmount: 0.00,
                Status: 1,
                RdoItemMasterId: false,
                tabindex: $scope.tabindexmap.detailtabindex++
            };

            if ($scope.currentcontext.id > 0) {
                purchaserequestDetail.PurchaseRequestId = $scope.currentcontext.id;
            }
            $scope.purchaserequestDetails.push(purchaserequestDetail);
            $scope.setIndexforTableIndex();
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        };

        $scope.DeleteConfirmed = function (deleteId) {
            var options = {
                action: 'pharmacy/purchaserequest/DeletePurchaseRequest',
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

        $scope.addNew = function () {
            if ($stateParams.id > 0)
                $state.go('app.purchaserequest', {
                    id: 0,
                    prid: 0
                });
            else
                $state.reload();
        };

        $scope.add_new = function () {
            utl.Modal.open('app.purchaserequestdetail', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.onDetailSave
            });
        };

        $scope.Clear = function () {
            $scope.item = {};
        };

        $scope.addnewclear = function () {
            $state.reload();
        };

        $scope.history = function (HistoryId) {
            utl.Modal.open('app.srhistory', {});
        };

        $scope.History = function (idx, item) {
            if (item.ItemMasterId > 0) {
                utl.Modal.open('app.prhistory', {
                    params: {
                        vendormasterid: $scope.item.VendorMasterId,
                        storemasterid: $scope.item.StoreMasterId,
                        itemmasterid: item.ItemMasterId,
                        itemcode: item.ItemCode,
                        itemname: item.ItemName
                    },
                    confirmCallback: $scope.getList
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('inventory.purchaserequest.showerrormsg.lbl'));
            }
        };

        $scope.Stock = function (idx, selectedItem) {
            if (selectedItem.ItemMasterId > 0) {
                utl.Modal.open('app.prstockdetails', {
                    params: {
                        itemmasterid: selectedItem.ItemMasterId,
                        itemcode: selectedItem.ItemCode,
                        itemname: selectedItem.ItemName
                    },
                    confirmCallback: $scope.getList
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('inventory.purchaserequest.showerrormsg.lbl'));
            }
        };

        // $scope.addNew = function () {
        //     $state.go('app.purchaserequest', {
        //         id: 0
        //     });
        // };

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

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;
        };

        $scope.deletePurchaseRequestDetail = function (idx, selectedItem) {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var name = "this item" || '';
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, selectedItem, name);
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;
        };

        $scope.deletePRDetail = function (idx, selectedItem) {
            if (selectedItem.ItemMasterId > 0) {
                var name = "this item" || '';
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, selectedItem, name);
            } else {
                utl.Alert.showErrorMsg($translate.instant('inventory.purchaserequest.showerrormsg.lbl'));
            }
        };

        $scope.editPurchaseRequestDetail = function (item) {
            item.currenteditable = true;
            utl.Modal.open('app.purchaserequestdetail', {
                params: {
                    id: $scope.currentcontext.id,
                    current_item: item
                },
                confirmCallback: $scope.onDetailSave
            });
        };

        $scope.onDetailSave = function (itemFromModal) {
            var isaddnew = true;
            for (var idx in $scope.purchaserequestDetails) {
                var item = $scope.purchaserequestDetails[idx];
                if (item.currenteditable) {
                    item = itemFromModal;
                    item.currenteditable = false;
                    isaddnew = false;
                }
            }
            if (isaddnew) {
                itemFromModal.Status = 1;
                if ($scope.currentcontext.id > 0) {
                    itemFromModal.PurchaseRequestId = $scope.currentcontext.id;
                }
                $scope.purchaserequestDetails.push(itemFromModal);
            }
        };

        $scope.getPurchaseRequestDetailsCallback = function (scope, res, options, hasError) {
            $scope.purchaserequestDetails = res.Data || [];
            for (var idx in $scope.purchaserequestDetails) {
                var pritem = $scope.purchaserequestDetails[idx];
                if (pritem.ItemMasterId > 0) {
                    if (pritem.DiscountModeId == 1) {
                        pritem.DiscountMode = 'Rs.';
                    } else {
                        pritem.DiscountMode = '%';
                    }
                    pritem.GstCode = pritem.GstMaster.GstCode;

                    if ($scope.item.PrStatusId >= 2)
                        pritem.RdoItemMasterId = true;
                }

                if (pritem.FromStore) {
                    $scope.item.StoreTypeId = pritem.FromStore.StoreTypeId;
                }
            }

            $scope.addNewLineItem();
        };

        $scope.getPurchaseRequestDetails = function (pageNo) {
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
                    action: 'pharmacy/purchaserequestdetail/GetPurchaseRequestDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getPurchaseRequestDetailsCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.addNewLineItem();
            }
        };

        $scope.amountConversion = function (amount) {
            return parseFloat(amount).toFixed(2);
        };

        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'pharmacy/PurchaseRequest/PrintPurchaseRequest',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.getItemCallback = function (scope, data, options, hasError) {
            for (var idx in data.Data) {
                var item = data.Data[idx];
                item.TotalNetAmount = parseFloat(item.TotalNetAmount).toFixed(2);
                vm.gridConfig.data.push(item);
            }

            $scope.item = data;

            if (data.PrStatusId == 1) {
                $scope.item.PrStatusId = 1;
                $scope.item.isDisabled = false;
                $scope.item.RBDisabled = true;
                $scope.item.DisplayPrStatus = 'Draft';
            }
            if (data.PrStatusId == 2) {
                $scope.item.PrStatusId = 2;
                $scope.item.isDisabled = true;
                $scope.item.RBDisabled = true;
                $scope.item.DisplayPrStatus = 'Approved';
            }
            if (data.PrStatusId == 3) {
                $scope.item.PrStatusId = 3;
                $scope.item.isDisabled = true;
                $scope.item.RBDisabled = true;
                $scope.item.DisplayPrStatus = 'Authorized';
            }
            if (data.PrStatusId == 4) {
                $scope.item.PrStatusId = 4;
                $scope.item.isDisabled = true;
                $scope.item.RBDisabled = true;
                $scope.item.DisplayPrStatus = 'Completed';
            }
            if (data.PrStatusId == 5) {
                $scope.item.PrStatusId = 5;
                $scope.item.isDisabled = true;
                $scope.item.RBDisabled = true;
                $scope.item.DisplayPrStatus = 'Cancelled';
            }

            $scope.applyVisibilityRules();
        };

        $scope.getItem = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'pharmacy/purchaserequest/GetPurchaseRequestById',
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

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (data === true) {
                $scope.currentcontext.id = options.data.Data.Header.Id;
            } else {
                $scope.currentcontext.id = data;
            }

            loadData();
        };

        $scope.backToList = function () {
            $state.go('app.purchaserequests', $scope.currentcontext.id);
        };

        $scope.SaveandDraft = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'inventory.purchaserequest.savemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandDraftConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onSaveandDraftConfirmed = function () {
            $scope.item.PrStatusId = 1;
            $scope.item.RequestedBy = utl.Session.getCurrentUserId();
            $scope.item.RequestedDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.SaveandApprove = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'inventory.purchaserequest.approvemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandApproveConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onSaveandApproveConfirmed = function () {
            if ($scope.item.PrStatusId == 1) {} else {
                $scope.item.RequestedBy = utl.Session.getCurrentUserId();
                $scope.item.RequestedDate = utl.Formatter.getCurrentDate();
            }
            $scope.item.PrStatusId = 2;
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
                messageKey: 'inventory.purchaserequest.authorizemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandAuthorizeConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onSaveandAuthorizeConfirmed = function () {
            $scope.item.PrStatusId = 3;
            $scope.item.AuthorizedBy = utl.Session.getCurrentUserId();
            $scope.item.AuthorizedDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.onComplete = function () {
            $scope.item.PrStatusId = 4;
            $scope.item.CompletedBy = utl.Session.getCurrentUserId();
            $scope.item.CompletedDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.onCancelConfirmed = function () {
            $scope.item.PrStatusId = 5;
            $scope.item.CancelledBy = utl.Session.getCurrentUserId();
            $scope.item.CancelledDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.CancelPR = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'inventory.purchaserequest.cancelmsg.lbl',
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

                var actionName = 'pharmacy/purchaserequest/AddPurchaseRequest';
                if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                    actionName = 'pharmacy/purchaserequest/UpdatePurchaseRequest';
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
            }
        };

        function checkMandatoryFields() {
            for (var iddx in $scope.purchaserequestDetails) {
                var iddxitem = $scope.purchaserequestDetails[iddx];
                if (iddxitem.ItemMasterId > 0) {
                    if (iddxitem.ItemMasterId > 0 && iddxitem.RequestedQuantity <= 0) {
                        utl.Alert.showErrorMsg($translate.instant('inventory.purchaserequest.requestedquantity.lbl') + iddxitem.ItemName);
                        return false;
                    }
                    // else if (iddxitem.ItemMasterId > 0 && iddxitem.PurchasePrice <= 0) {
                    //     utl.Alert.showErrorMsg($translate.instant('inventory.purchaserequest.purchaseprice.lbl') + iddxitem.ItemName);
                    //     return false;
                    // }

                } else {
                    utl.Alert.showErrorMsg($translate.instant('inventory.purchaserequest.purchasepriceatleastone.lbl'));
                    return false;
                }

                return true;
            }
        }

        function getLinesForSave() {
            var result = [];
            for (var idx in $scope.purchaserequestDetails) {
                var item = $scope.purchaserequestDetails[idx];
                item.VendorMasterId = $scope.item.VendorMasterId;
                item.StoreMasterId = $scope.item.StoreMasterId;
                item.ToStoreMasterId = $scope.item.ToStoreMasterId;
                if (item.ItemMasterId > 0) {
                    result.push(item);
                }
            }
            return result;
        }

        function loadData() {
            $scope.getItem();
            $scope.getPurchaseRequestDetails();
        }

        $scope.onItemSelected = function (idx, selectedItem) {
            var isDuplicate = utl.Common.isDuplicateRec($scope.purchaserequestDetails, {
                pivotkey: 'ItemMasterId',
                displaykey: 'ItemName'
            });
            if (isDuplicate) {
                item.ItemMasterId = '';
                item.ItemName = '';
                return;
            }

            var SelectedMasterItem = selectedItem.SelectedItem;
            selectedItem.ItemMasterId = SelectedMasterItem.ItemMasterId;
            selectedItem.ItemCode = SelectedMasterItem.ItemCode;
            selectedItem.ItemName = SelectedMasterItem.ItemName;
            if (SelectedMasterItem.Quantity > 0)
                selectedItem.QuantityOnHand = SelectedMasterItem.Quantity;
            else
                selectedItem.QuantityOnHand = 0;
            selectedItem.ConversionQuantity = SelectedMasterItem.PurConQty || 1;
            selectedItem.BaseUom.Id = SelectedMasterItem.ItemMaster.UomMaster.Id;
            selectedItem.BaseUomId = SelectedMasterItem.ItemMaster.UomMaster.Id;
            selectedItem.PurchaseUomId = SelectedMasterItem.ItemMaster.UomMaster.Id;
            selectedItem.BaseUom.UomCode = SelectedMasterItem.ItemMaster.UomMaster.UomCode;
            selectedItem.GstMaster.Id = SelectedMasterItem.ItemMaster.GstMaster.Id;
            selectedItem.GstId = SelectedMasterItem.ItemMaster.GstMaster.Id;
            selectedItem.GstMaster.GstCode = SelectedMasterItem.ItemMaster.GstMaster.GstCode;
            selectedItem.GstCode = SelectedMasterItem.ItemMaster.GstMaster.GstCode;
            selectedItem.GstMaster.GstPercentage = parseFloat(SelectedMasterItem.ItemMaster.GstMaster.GstPercentage.toFixed(2));
            selectedItem.GstPercentage = parseFloat(SelectedMasterItem.ItemMaster.GstMaster.GstPercentage.toFixed(2));
            selectedItem.PurchasePrice = parseFloat(SelectedMasterItem.ItemMaster.ItemPrice.toFixed(2));
            selectedItem.MrPrice = parseFloat(SelectedMasterItem.ItemMaster.MrPrice.toFixed(2));
            selectedItem.DiscountModeId = SelectedMasterItem.ItemMaster.DiscountModeId;
            if (selectedItem.DiscountModeId == 1) {
                selectedItem.DiscountMode = 'Rs.';
                selectedItem.DiscountAmount = parseFloat(SelectedMasterItem.ItemMaster.ItemVendorMaps[0].Discount.toFixed(2));
                selectedItem.UnitDiscountAmount = parseFloat(SelectedMasterItem.ItemMaster.ItemVendorMaps[0].Discount.toFixed(2));
            } else {
                selectedItem.DiscountMode = '%';
                selectedItem.DiscountAmount = parseFloat(((SelectedMasterItem.ItemMaster.MrPrice / 100) * SelectedMasterItem.ItemMaster.Discount).toFixed(2));
                selectedItem.UnitDiscountAmount = parseFloat(((SelectedMasterItem.ItemMaster.MrPrice / 100) * SelectedMasterItem.ItemMaster.Discount).toFixed(2));
            }
            selectedItem.PurchasePriceAfterDiscount = parseFloat(selectedItem.PurchasePrice - selectedItem.DiscountAmount.toFixed(2));
            // selectedItem.GstAmount = parseFloat(((SelectedMasterItem.ItemMaster.MrPrice / 100) * SelectedMasterItem.ItemMaster.ItemVendorMaps[0].GstPercentage).toFixed(2));
            // selectedItem.UnitGstAmount = parseFloat(((SelectedMasterItem.ItemMaster.MrPrice / 100) * SelectedMasterItem.ItemMaster.ItemVendorMaps[0].GstPercentage).toFixed(2));
            selectedItem.UnitCostPrice = parseFloat(((SelectedMasterItem.ItemMaster.ItemPrice - selectedItem.UnitDiscountAmount) + selectedItem.UnitGstAmount).toFixed(2));

            var lastIndex = $scope.purchaserequestDetails.length - 1;
            if (idx == lastIndex) {
                $scope.addNewLineItem();
            }
        };

        $scope.computeforgivenDiscount = function (item) {
            if (item.DiscountModeId == 1) {
                if (item.Discount <= item.PurchasePrice) {
                    $scope.item.OtherCharges = 0;

                    item.DiscountAmount = item.Discount;
                    item.PurchasePriceAfterDiscount = item.PurchasePrice - item.DiscountAmount;
                    item.GstAmount = (item.PurchasePrice / 100) * item.GstPercentage;
                    item.UnitGstAmount = (item.PurchasePrice / 100) * item.GstPercentage;
                    item.UnitCostPrice = (item.PurchasePrice - item.DiscountAmount) + item.GstAmount;

                    $scope.computeAmount(item);
                } else if (item.Discount > item.PurchasePrice) {
                    item.Discount = 0;
                    item.DiscountAmount = 0;
                    utl.Alert.showErrorMsg($translate.instant('inventory.purchaserequest.purchasepricefirstalert.lbl'));
                } else {}
            } else {
                if (item.Discount > 100) {
                    item.Discount = 0;
                    item.DiscountAmount = 0;
                    utl.Alert.showErrorMsg($translate.instant('inventory.purchaserequest.purchasepriceseconddalert'));
                } else {
                    $scope.item.OtherCharges = 0;

                    item.DiscountAmount = (item.PurchasePrice / 100) * item.Discount;
                    item.PurchasePriceAfterDiscount = item.PurchasePrice - item.DiscountAmount;
                    item.GstAmount = (item.PurchasePrice / 100) * item.GstPercentage;
                    item.UnitGstAmount = (item.PurchasePrice / 100) * item.GstPercentage;
                    item.UnitCostPrice = (item.PurchasePrice - item.DiscountAmount) + item.GstAmount;

                    $scope.computeAmount(item);
                }
            }
        };

        $scope.computeforgivenPrice = function (item) {
            if (item.DiscountModeId == 1) {
                if (item.DiscountAmount <= item.PurchasePrice) {
                    item.PurchasePriceAfterDiscount = item.PurchasePrice - item.DiscountAmount;
                    item.GstAmount = (item.PurchasePrice / 100) * item.GstPercentage;
                    item.UnitGstAmount = (item.PurchasePrice / 100) * item.GstPercentage;
                    item.UnitCostPrice = (item.PurchasePrice - item.DiscountAmount) + item.GstAmount;

                    $scope.computeAmount(item);
                } else {
                    utl.Alert.showErrorMsg($translate.instant('inventory.purchaserequest.purchasepricelastdalert'));
                }
            } else {
                $scope.item.OtherCharges = 0;

                item.DiscountAmount = (item.PurchasePrice / 100) * item.Discount;
                item.PurchasePriceAfterDiscount = item.PurchasePrice - item.DiscountAmount;
                item.GstAmount = (item.PurchasePrice / 100) * item.GstPercentage;
                item.UnitGstAmount = (item.PurchasePrice / 100) * item.GstPercentage;
                item.UnitCostPrice = (item.PurchasePrice - item.DiscountAmount) + item.GstAmount;

                $scope.computeAmount(item);
            }

        };

        $scope.computeAmount = function (item) {
            if (item.RequestedQuantity > 0) {
                item.GrossAmount = item.PurchasePrice * item.RequestedQuantity;
                item.NetAmount = item.UnitCostPrice * item.RequestedQuantity;
            } else if (item.RequestedQuantity === 0) {
                item.NetAmount = 0;
                item.TotalNetAmount = 0;
            } else if (item.RequestedQuantity === 'undefined') {
                item.NetAmount = 0;
                item.TotalNetAmount = 0;
            } else {
                item.NetAmount = 0;
                item.TotalNetAmount = 0;
            }
            $scope.TotalGrossAmount = 0;
            $scope.TotalDiscountAmount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalNetAmount = 0;

            calculatetotalAmount();
        };

        function calculatetotalAmount() {
            for (var idx in $scope.purchaserequestDetails) {
                if ($scope.TotalGrossAmount === null) {
                    $scope.TotalGrossAmount = 0;
                }
                $scope.TotalGrossAmount = parseFloat(($scope.TotalGrossAmount + $scope.purchaserequestDetails[idx].GrossAmount).toFixed(2));

                if ($scope.TotalDiscountAmount === null) {
                    $scope.TotalDiscountAmount = 0;
                }
                $scope.TotalDiscountAmount = parseFloat(($scope.TotalDiscountAmount + ($scope.purchaserequestDetails[idx].DiscountAmount * $scope.purchaserequestDetails[idx].RequestedQuantity)).toFixed(2));

                if ($scope.TotalGstAmount === null) {
                    $scope.TotalGstAmount = 0;
                }
                $scope.TotalGstAmount = parseFloat(($scope.TotalGstAmount + ($scope.purchaserequestDetails[idx].GstAmount * $scope.purchaserequestDetails[idx].RequestedQuantity)).toFixed(2));

                if ($scope.TotalNetAmount === null) {
                    $scope.TotalNetAmount = 0;
                }
                $scope.TotalNetAmount = parseFloat(($scope.TotalNetAmount + $scope.purchaserequestDetails[idx].NetAmount).toFixed(2));
            }

            $scope.item.TotalGrossAmount = $scope.TotalGrossAmount;
            $scope.item.TotalDiscountAmount = $scope.TotalDiscountAmount;
            $scope.item.TotalGstAmount = $scope.TotalGstAmount;
            $scope.item.TotalNetAmount = $scope.TotalNetAmount;
            $scope.item.TotalAmount = $scope.TotalNetAmount;
        }


        $scope.setIndexforTableIndex = function () {
            var SNo = 1;
            for (var idx in $scope.purchaserequestDetails) {
                if ($scope.purchaserequestDetails[idx].Status == 1) {
                    $scope.purchaserequestDetails[idx].SNo = SNo;
                    $scope.purchaserequestDetails[idx].itemidxdesc = 'desc' + (SNo - 1);
                    $scope.purchaserequestDetails[idx].itemidxqty = 'qty' + (SNo - 1);
                    SNo++;
                }
            }
        };

        vm.purchaserequestcontrolconfig = {
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
                    header: 'Stock-In-Hand',
                    field: 'StockInHand',
                    datatype: 'string',
                    headercls: 'td-stockinhand',
                    fieldcls: 'td-stockinhand'
                }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/StockItem/GetStockItemsforPR',
            formatdisplay: formatselectedpurchaserequest,
            presearch: presearchpurchaserequest,
            postsearch: postsearchpurchaserequest
        };

        function formatselectedpurchaserequest() {
            $scope.autosearchpopup = 0;
            var selectedItem = vm.purchaserequestcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ItemName, selectedItem.ItemCode].join(' ');
            } else if (vm.purchaserequestcontrolconfig.rowdata) {
                result = [vm.purchaserequestcontrolconfig.rowdata.ItemName, vm.purchaserequestcontrolconfig.rowdata.ItemCode].join(' ');
            }
            return result;
        }

        function presearchpurchaserequest() {
            var query = vm.purchaserequestcontrolconfig.query;
            var TodayDate = new Date().toISOString().slice(0, 10);
            var inputData = {
                Params: [{
                    Key: 1,
                    Value: $scope.item.StoreMasterId
                }],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };

            if (vm.purchaserequestcontrolconfig.searchbyid === true) {
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

            vm.purchaserequestcontrolconfig.searchparams = inputData;
        }

        function postsearchpurchaserequest() {
            $scope.autosearchpopup = 1;
            for (var idx in vm.purchaserequestcontrolconfig.result) {
                var item = vm.purchaserequestcontrolconfig.result[idx];
                item.ItemCode = '(' + item.ItemCode + ')';
                item.ItemName = item.ItemName;
                item.StockInHand = item.Quantity;

            }
        }
        vm.purchaseitemcontrolconfig = {
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
                // {
                //     header: 'Generic',
                //     field: 'GenericName',
                //     datatype: 'string',
                //     headercls: 'td-genericname',
                //     fieldcls: 'td-genericname'
                // },
                // {
                //     header: 'Manufacturer',
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
                }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/itemmaster/GetItemVendorMaps',
            formatdisplay: formatselectedpurchaseitem,
            presearch: presearchpurchaseitem,
            postsearch: postsearchpurchaseitem
        };

        function formatselectedpurchaseitem() {
            var selectedItem = vm.purchaseitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ItemName + ' (' + selectedItem.ItemCode + ')'].join(' ');
            } else if (vm.purchaseitemcontrolconfig.rowdata) {
                result = [vm.purchaseitemcontrolconfig.rowdata.ItemCode, vm.purchaseitemcontrolconfig.rowdata.ItemName].join(' ');
            }
            return result;
        }

        function presearchpurchaseitem() {
            var inputData = {};
            var query = null;
            if ($scope.item.VendorMasterId > 0) {
                vm.purchaseitemcontrolconfig.api = 'pharmacy/itemmaster/GetItemVendorMaps';
                query = vm.purchaseitemcontrolconfig.query;
                inputData = {
                    Params: [{
                            Key: 1,
                            Value: $scope.item.VendorMasterId
                        },
                        {
                            Key: 4,
                            Value: $scope.item.StoreMasterId
                        },
                        {
                            Key: 5,
                            Value: 2
                        }
                    ],
                    PageContext: {
                        PageSize: 25,
                        PageNumber: 1
                    }
                };

                if (vm.purchaseitemcontrolconfig.searchbyid === true) {
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
            } else {
                vm.purchaseitemcontrolconfig.api = 'pharmacy/itemmaster/GetItemStoreMaps';
                query = vm.purchaseitemcontrolconfig.query;
                inputData = {
                    Params: [{
                            Key: 1,
                            Value: $scope.item.StoreMasterId
                        },
                        {
                            Key: 4,
                            Value: 1
                        }
                    ],
                    PageContext: {
                        PageSize: 25,
                        PageNumber: 1
                    }
                };

                if (vm.purchaseitemcontrolconfig.searchbyid === true) {
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
            }

            vm.purchaseitemcontrolconfig.searchparams = inputData;
        }

        function postsearchpurchaseitem() {
            for (var idx in vm.purchaseitemcontrolconfig.result) {
                var item = vm.purchaseitemcontrolconfig.result[idx];
                item.ItemCode = item.ItemCode;
                item.ItemName = item.ItemName;
                if (item.ItemMaster.ProductType !== null) {
                    item.ProductTypeName = item.ItemMaster.ProductType.ProductTypeName;
                } else {
                    item.ProductTypeName = '';
                }
                if (item.ItemMaster.GenericMaster !== null) {
                    item.GenericName = item.ItemMaster.GenericMaster.GenericName;
                } else {
                    item.GenericName = '';
                }
                if (item.ItemMaster.Manufacturer !== null) {
                    item.ManufacturerName = item.ItemMaster.Manufacturer.VendorName;
                } else {
                    item.ManufacturerName = '';
                }
                if (item.ItemMaster.StockItem !== null) {
                    item.StockInHand = item.ItemMaster.StockItem.Quantity;
                } else {
                    item.StockInHand = 0;
                }
            }
        }

        vm.vendorcontrolconfig = {
            query: '',
            searchbyid: false,

            options: [{
                    header: 'Vendor Code',
                    field: 'VendorCode',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Vendor Name',
                    field: 'VendorName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
                {
                    header: 'Vendor Contact',
                    field: 'PhoneNumber',
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

        // function formatselectedvendor() {
        //     var result = '';
        //     var selectedItem = '';
        //     if ($scope.purchaserequestDetails.length > 1 && $scope.item.PrStatusId === 0) {
        //         $scope.purchaserequestDetails = [];
        //         selectedItem = vm.vendorcontrolconfig.selected;
        //         $scope.item.VendorMasterId = selectedItem.VendorMasterId;
        //         if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
        //             result = [selectedItem.VendorName + ' (' + selectedItem.VendorCode + ')'].join(' ');
        //         } else if (vm.vendorcontrolconfig.rowdata) {
        //             result = [vm.vendorcontrolconfig.rowdata.VendorName, vm.vendorcontrolconfig.rowdata.VendorCode].join(' ');
        //         }
        //         $scope.addNewLineItem();
        //     } else {
        //         selectedItem = vm.vendorcontrolconfig.selected;
        //         if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
        //             $scope.item.VendorMasterId = selectedItem.VendorMasterId;
        //             result = [selectedItem.VendorName + ' (' + selectedItem.VendorCode + ')'].join(' ');
        //         } else if (vm.vendorcontrolconfig.rowdata) {
        //             result = [vm.vendorcontrolconfig.rowdata.VendorName, vm.vendorcontrolconfig.rowdata.VendorCode].join(' ');
        //         }
        //     }
        //     return result;
        // }
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
                Params: [{
                        Key: 3,
                        Value: 1
                    },
                    {
                        Key: 4,
                        Value: 2
                    },
                    {
                        Key: 12,
                        Value: $scope.item.FacilityId
                    }
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
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.item.StoreMasterId === 0) {
                    $scope.item.StoreMasterId = value[0].Id;
                    $scope.item.StoreTypeId = value[0].StoreMaster.StoreTypeId;
                } else if (key == 'UserStores' && $scope.item.StoreMasterId > 0) {
                    for (var userstoreid = 0; userstoreid < $scope.lookup['UserStores'].length; userstoreid++) {
                        if ($scope.lookup['UserStores'][userstoreid].Id == $scope.item.StoreMasterId) {
                            $scope.item.StoreTypeId = $scope.lookup['UserStores'][userstoreid].StoreMaster.StoreTypeId;
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
                    "Key": "PrType"
                },
                {
                    "Key": "PrStatus"
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
                {
                    "Key": "Department"
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

        $scope.initLookup();
    }

    purchaseRequestFormController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$timeout'];

})();