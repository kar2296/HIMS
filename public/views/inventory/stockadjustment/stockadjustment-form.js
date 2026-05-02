(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('StockAdjustmentFormController', StockAdjustmentFormController);

    function StockAdjustmentFormController($rootScope, $scope, $interval, $stateParams, $state, $translate, utl, $filter, modalConfig, $timeout) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));

        var savehitcompleted = 0;
        $scope.autosearchpopup = 0;

        $scope.tabindexmap = {
            headertabindex: 1,
            detailtabindex: 2
        };

        $scope.item = {
            IsActive: true,
            FacilityId: utl.Session.getCurrentFacilityId(),
            StoreMasterId: 0,
            StoreName: '',
            StoreTypeId: 0,
            isComments: false,
            AdjustmentTypeId: 1,
        };

        $scope.StockAdjustmentDetails = [];
        $scope.currentcontext = {};

        $scope.SelectedIndex = -1;
        $scope.lookup = {};
        $scope.itemUsedBatches = {};
        $scope.currentcontext.id = parseInt($stateParams.id);

        $scope.canShowPrintBtn = true;
        $scope.canShowSaveBtn = true;
        $scope.canShowSaveandApproveBtn = true;
        $scope.canShowAuthorizeBtn = true;
        $scope.canShowClearBtn = true;
        $scope.canShowCancelBtn = true;
        $scope.itemexactsearch = 0;
        $scope.itemexactsearch =
            (utl.FacilitySetting.getFacilitySettingValue('general', 'itemexactsearch')) ? utl.FacilitySetting.getFacilitySettingValue('general', 'itemexactsearch') : 0;

        $scope.applyVisibilityRules = function () {
            // New
            if ($scope.item.AdjustmentStatusId != 1 || $scope.item.AdjustmentStatusId != 2 || $scope.item.AdjustmentStatusId != 3 || $scope.item.AdjustmentStatusId != 4 || $scope.item.AdjustmentStatusId != 5) {
                $scope.canShowPrintBtn = false;
                $scope.canShowSaveBtn = true;
                $scope.canShowSaveandApproveBtn = true;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowClearBtn = true;
                $scope.canShowCancelBtn = false;
                $scope.canShowHistoryBtn = false;
            }
            // When In Draft Status
            if ($scope.item.AdjustmentStatusId == 1) {
                $scope.canShowPrintBtn = false;
                $scope.canShowSaveBtn = true;
                $scope.canShowSaveandApproveBtn = true;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = true;
                $scope.canShowHistoryBtn = true;
            }
            // When In Approved Status
            if ($scope.item.AdjustmentStatusId == 2) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowAuthorizeBtn = true;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.canShowHistoryBtn = true;
            }
            // When In Authorized Status
            if ($scope.item.AdjustmentStatusId == 3) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.canShowHistoryBtn = true;
            }
            // When In Completed Status
            if ($scope.item.AdjustmentStatusId == 4) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.canShowHistoryBtn = true;
            }
            // When In Cancelled Status
            if ($scope.item.AdjustmentStatusId == 5) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.canShowHistoryBtn = true;
            }
        };

        $scope.amountConversion = function (amount) {
            return parseFloat(amount).toFixed(2);
        };

        $scope.addNew = function () {
            if ($stateParams.id > 0) {
                $state.go('app.stockadjustment', { id: 0 })
            } else {
                $state.reload();
            }
        };

        $scope.setIndexforTableIndex = function () {
            var SNo = 1;
            for (var idx in $scope.StockAdjustmentDetails) {
                if ($scope.StockAdjustmentDetails[idx].Status == 1) {
                    $scope.StockAdjustmentDetails[idx].SNo = SNo;
                    $scope.StockAdjustmentDetails[idx].itemidxdesc = 'desc' + idx;
                    $scope.StockAdjustmentDetails[idx].itemidxadjtype = 'adjtype' + idx;
                    $scope.StockAdjustmentDetails[idx].itemidxqty = 'qty' + idx;
                    $scope.StockAdjustmentDetails[idx].itemidxbatch = 'batch' + idx;
                    SNo++;
                }
            }
        };

        $scope.addNewLineItem = function () {
            var lastIndex = $scope.StockAdjustmentDetails.length - 1;
            if (lastIndex >= 0) {
                if ($scope.StockAdjustmentDetails[lastIndex].ItemMasterId == -1)
                    return false;
            }
            var StockAdjustmentDetail = {
                Id: 0,
                SNo: 0,
                // AdjustedTypeId: 0,
                AdjustmentTypeId: -1,
                ItemMasterId: -1,
                ItemCode: '',
                ItemName: '',
                itemidxdesc: null,
                itemidxadjtype: null,
                itemidxqty: null,
                itemidxbatch: null,
                BaseUom: {
                    Id: 0,
                    UomCode: ''
                },
                BaseUomId: 0,
                PurchaseUomId: 0,
                StockItemId: 0,
                StockItemRev: 0,
                StockSerialItemId: 0,
                SelectedStockSerialItemId: 0,
                Rev: 0,
                TotalQty: 0,
                TotalQtyBeforeAdj: 0,
                BatchQtyBeforeAdj: 0,
                QtyAdjusted: 0,
                BatchQtyAfterAdj: 0,
                TotalQtyAfterAdj: 0,
                BatchId: '',
                SelectedBatchId: '',
                BatchDetails: [],
                BatchDetail: {
                    Id: 0,
                    SelectedStockSerialItemId: 0,
                    StockItemId: 0,
                    ItemMasterId: 0,
                    StoreMasterId: 0,
                    BatchId: '',
                    SelectedBatchId: '',
                    Quantity: 0,
                    ExpiryDate: null,
                    Ucp: 0,
                    Mrp: 0,
                    Rev: 0,
                    SerialDetails: null
                },
                ExpiryDate: null,
                PurchasePrice: 0.00,
                GstMaster: {
                    Id: 0,
                    GstCode: '',
                    GstName: '',
                    GstPercentage: ''
                },
                GstId: 0,
                GstCode: '',
                GstPercentage: 0.00,
                GstAmount: 0.00,
                UnitGstAmount: 0.00,
                UnitCostPrice: 0.00,
                MrPrice: 0.00,
                GrossAmount: 0.00,
                NetAmount: 0.00,
                tabindex: $scope.tabindexmap.detailtabindex++,
                Status: 1,
                RdoItemMasterId: false
            };
            if ($scope.currentcontext.id > 0) {
                StockAdjustmentDetail.AdjustmentStatusId = $scope.currentcontext.id;
            }
            $scope.StockAdjustmentDetails.push(StockAdjustmentDetail);

            $scope.SelectedIndex = $scope.StockAdjustmentDetails.length;

            $scope.setIndexforTableIndex();
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        };

        $scope.Print = function () {
            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'pharmacy/StockAdjustment/PrintStockAdjustment',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.history = function (HistoryId) {
            utl.Modal.open('app.adjustmenthistory', {
                params: { hid: HistoryId }
            });
        };

        $scope.History = function (item, idx) {
            if (item.ItemMasterId > 0) {
                utl.Modal.open('app.stockadjustmenthistory', {
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

        $scope.Stock = function (selectedItem, idx) {
            if (selectedItem.ItemMasterId > 0) {
                utl.Modal.open('app.adjustmentstockdetails', {
                    params: { storemasterid: $scope.item.StoreMasterId, itemmasterid: selectedItem.ItemMasterId, itemcode: selectedItem.ItemCode, itemname: selectedItem.ItemName },
                    confirmCallback: $scope.getList
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.emptyrowmsg.lbl'));
            }
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        };

        $scope.onDeleteConfirmed = function (item) {
            if (item.ItemMasterId != -1) {
                var index = $scope.StockAdjustmentDetails.indexOf(item);
                $scope.StockAdjustmentDetails.splice(index, 1);
                var lastIndex = $scope.StockAdjustmentDetails.length - 1;
                if (lastIndex < 0) {
                    $scope.addNewLineItem();
                }
            } else {
                utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.emptyrowmsg.lbl'));
                return false;
            }

            $scope.TotalGrossAmount = 0;
            $scope.TotalNetAmount = 0;
            $scope.setIndexforTableIndex();
            calculatetotalAmount();
        };

        $scope.deleteStockAdjustmentDetail = function (idx, item) {
            if (item.ItemMasterId != -1) {
                var existing = $scope.itemUsedBatches[item.ItemMasterId].indexOf(item.SelectedStockSerialItemId);
                $scope.itemUsedBatches[item.ItemMasterId].splice(existing, 1);

                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
            }
        };

        $scope.onDetailSave = function (itemFromModal) {
            var isaddnew = true;
            for (var idx in $scope.StockAdjustmentDetails) {
                var item = $scope.StockAdjustmentDetails[idx];
                if (item.currenteditable) {
                    item = itemFromModal;
                    item.currenteditable = false;
                    isaddnew = false;
                }
            }
            if (isaddnew) {
                itemFromModal.Status = 1;
                if ($scope.currentcontext.id > 0) {
                    itemFromModal.StockAdjustmentId = $scope.currentcontext.id;
                }
                $scope.StockAdjustmentDetails.push(itemFromModal);
            }
        };

        $scope.getStockAdjustmentDetailsCallback = function (scope, res, options, hasError) {
            $scope.StockAdjustmentDetails = res.Data || [];
            for (var idx in $scope.StockAdjustmentDetails) {
                var adjusteditem = $scope.StockAdjustmentDetails[idx];
                adjusteditem.AdjustmentTypeId = adjusteditem.AdjustedTypeId;
                adjusteditem.BatchDetails = [];
                if (adjusteditem.ItemMasterId > 0) {
                    adjusteditem.SelectedBatchId = adjusteditem.BatchId;
                    adjusteditem.SelectedStockSerialItemId = adjusteditem.StockSerialItemId;
                    var AdjustedBatchDetail = {
                        Id: 0,
                        SelectedStockSerialItemId: 0,
                        StockItemId: 0,
                        ItemMasterId: 0,
                        StoreMasterId: 0,
                        BatchId: '',
                        SelectedBatchId: '',
                        Quantity: 0,
                        ExpiryDate: null,
                        Ucp: 0,
                        Mrp: 0,
                        SerialDetails: null
                    };

                    AdjustedBatchDetail.Id = adjusteditem.StockSerialItemId;
                    AdjustedBatchDetail.SelectedStockSerialItemId = adjusteditem.StockSerialItemId;
                    AdjustedBatchDetail.StockItemId = adjusteditem.StockItemId;
                    AdjustedBatchDetail.ItemMasterId = adjusteditem.ItemMasterId;
                    AdjustedBatchDetail.StoreMasterId = adjusteditem.StoreMasterId;
                    AdjustedBatchDetail.BatchId = adjusteditem.BatchId;
                    AdjustedBatchDetail.SelectedBatchId = adjusteditem.BatchId;
                    AdjustedBatchDetail.Quantity = parseInt(adjusteditem.QtyAdjusted);
                    AdjustedBatchDetail.ExpiryDate = adjusteditem.ExpiryDate;
                    AdjustedBatchDetail.Ucp = adjusteditem.UnitCostPrice;
                    AdjustedBatchDetail.Mrp = adjusteditem.MrPrice;

                    AdjustedBatchDetail.SerialDetails = [
                        ' Batch: ', adjusteditem.BatchId,
                        ' | Qty: ', parseInt(adjusteditem.QtyAdjusted),
                        ' | Expiry: ', adjusteditem.ExpiryDate,
                        ' | UCP: ', adjusteditem.UnitCostPrice,
                        ' | MRP: ', adjusteditem.MrPrice
                    ].join(' ');

                    adjusteditem.BatchDetails.push(AdjustedBatchDetail);
                }

                if ($scope.item.AdjustmentStatusId >= 2)
                    adjusteditem.RdoItemMasterId = true;

                if (adjusteditem.StoreMaster) {
                    $scope.item.StoreTypeId = adjusteditem.StoreMaster.StoreTypeId;
                }
            }

            if ($scope.item.AdjustmentStatusId == 1)
                $scope.addNewLineItem();

            $scope.setIndexforTableIndex();
        };

        $scope.getStockAdjustmentDetails = function (pageNo) {
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
                    action: 'pharmacy/stockadjustmentdetail/GetStockAdjustmentDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getStockAdjustmentDetailsCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.addNewLineItem();
            }
        };

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            if (data.AdjustmentStatusId == 1) {
                $scope.item.isDisabled = false;
                $scope.item.isComments = false;
                $scope.item.DisplayAdjustmentStatus = 'Draft';
            }
            if (data.AdjustmentStatusId == 2) {
                $scope.item.isDisabled = true;
                $scope.item.isComments = false;
                $scope.item.DisplayAdjustmentStatus = 'Approved';
            }
            if (data.AdjustmentStatusId == 3) {
                $scope.item.isDisabled = true;
                $scope.item.isComments = true;
                $scope.item.DisplayAdjustmentStatus = 'Authorized';
            }
            if (data.AdjustmentStatusId == 4) {
                $scope.item.isDisabled = true;
                $scope.item.isComments = true;
                $scope.item.DisplayAdjustmentStatus = 'Completed';
            }
            if (data.AdjustmentStatusId == 5) {
                $scope.item.isDisabled = true;
                $scope.item.isComments = true;
                $scope.item.DisplayAdjustmentStatus = 'Cancelled';
            }
            $scope.applyVisibilityRules();
        };

        $scope.getItem = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'pharmacy/stockadjustment/GetStockAdjustmentById',
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
            savehitcompleted = 0;
            if (data === true) {
                $scope.currentcontext.id = options.data.Data.Header.Id;
            } else {
                $scope.currentcontext.id = data;
            }

            loadData();
        };

        $scope.backToList = function () {
            $state.go('app.stockadjustments');
        };

        $scope.SaveandDraft = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'inventory.stockadjustments.savemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandDraftConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onSaveandDraftConfirmed = function () {
            $scope.item.AdjustmentStatusId = 1;
            $scope.item.AdjustedBy = utl.Session.getCurrentUserId();
            $scope.item.AdjustedDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.SaveandAdjust = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'inventory.stockadjustments.adjustmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandAdjustConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onSaveandAdjustConfirmed = function () {
            if ($scope.item.AdjustmentStatusId == 1) { } else {
                $scope.item.AdjustedBy = utl.Session.getCurrentUserId();
                $scope.item.AdjustedDate = utl.Formatter.getCurrentDate();
            }
            $scope.item.AdjustmentStatusId = 2;
            $scope.item.ApprovedBy = utl.Session.getCurrentUserId();
            $scope.item.ApprovedDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.SaveandAuthorize = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'inventory.stockadjustments.authorizemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandAuthorizeConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onSaveandAuthorizeConfirmed = function () {
            $scope.item.AdjustmentStatusId = 3;
            $scope.item.AuthorizedBy = utl.Session.getCurrentUserId();
            $scope.item.AuthorizedDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.Cancel = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'inventory.stockadjustments.cancelmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onCancelConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onCancelConfirmed = function () {
            $scope.item.AdjustmentStatusId = 5;
            $scope.item.CancelledBy = utl.Session.getCurrentUserId();
            $scope.item.CancelledDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
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

        $scope.saveItem = function () {

            if (savehitcompleted == 1) return false;

            if (!utl.Validator.validate($scope)) {
                return;
            }

            if (checkMandatoryFields()) {
                var lines = getLinesForSave();
                var actionName = 'pharmacy/stockadjustment/AddStockAdjustment';
                if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                    actionName = 'pharmacy/stockadjustment/UpdateStockAdjustment';
                }

                savehitcompleted = 1;

                var inputData = {
                    Header: $scope.item,
                    Details: lines
                };
                // console.log(inputData);
                // return;
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

        function getLinesForSave() {
            var result = [];
            for (var idx in $scope.StockAdjustmentDetails) {
                var item = {};
                item = $scope.StockAdjustmentDetails[idx];
                if (item.ItemMasterId > 0) {
                    item.AdjustedTypeId = item.AdjustmentTypeId;
                    item.StoreMasterId = $scope.item.StoreMasterId;
                    result.push(item);
                }
                $scope.computeAmount(item);
            }
            return result;
        }

        function checkMandatoryFields() {
            if ($scope.StockAdjustmentDetails.length == 1) {
                for (var iddx in $scope.StockAdjustmentDetails) {
                    var iddxitem = $scope.StockAdjustmentDetails[iddx];
                    if (iddxitem.ItemMasterId > 0 && iddxitem.Status === 1) {
                        if (parseInt(iddxitem.QtyAdjusted) <= 0) {
                            utl.Alert.showErrorMsg($translate.instant('inventory.stockadjustmentform.qtyadjust.lbl') + iddxitem.ItemName);
                            return false;
                        }
                        if (iddxitem.SelectedBatchId === "") {
                            utl.Alert.showErrorMsg($translate.instant('inventory.stockadjustmentform.batchadjust.lbl') + iddxitem.ItemName);
                            return false;
                        }
                    } else {
                        utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.atleastoneitemmsg.lbl'));
                        return false;
                    }
                }
            } else if ($scope.StockAdjustmentDetails.length > 1) {
                for (var iddx in $scope.StockAdjustmentDetails) {
                    var iddxitem = $scope.StockAdjustmentDetails[iddx];
                    if (iddxitem.ItemMasterId > 0 && parseInt(iddxitem.QtyAdjusted) <= 0 && iddxitem.Status === 1) {
                        utl.Alert.showErrorMsg($translate.instant('inventory.stockadjustmentform.qtyadjust.lbl') + iddxitem.ItemName);
                        return false;
                    }
                    if (iddxitem.ItemMasterId > 0 && iddxitem.SelectedBatchId === "" && iddxitem.Status === 1) {
                        utl.Alert.showErrorMsg($translate.instant('inventory.stockadjustmentform.batchadjust.lbl') + iddxitem.ItemName);
                        return false;
                    }
                }
            }

            return true;
        }

        $scope.onTypeSelected = function (adjustingItem, selectedMasterItem, idx) {
            adjustingItem.QtyAdjusted = 0;
            adjustingItem.NetAmount = 0;

            $scope.TotalGrossAmount = 0;
            $scope.TotalNetAmount = 0;

            calculatetotalAmount();
        };

        $scope.StoreChange = function (SelectedStore) {
            $scope.item.StoreTypeId = SelectedStore.StoreMaster.StoreTypeId;
            $scope.item.StoreName = SelectedStore.StoreMaster.StoreName;
            if ($scope.StockAdjustmentDetails.length > 1)
                $scope.clear();
        };

        $scope.clear = function () {
            $timeout(function () {
                $state.reload();
                savehitcompleted = 0;
            }, 1000);
        };

        $scope.onItemSelected = function (idx, selectedItem) {
            var prevItem = selectedItem.PreviousItem;
            var SelectedMasterItem = selectedItem.SelectedItem;
            selectedItem.ItemMasterId = SelectedMasterItem.ItemMasterId;
            selectedItem.ItemCode = SelectedMasterItem.ItemCode;
            selectedItem.ItemName = SelectedMasterItem.ItemName;

            if (prevItem && prevItem.ItemMasterId != SelectedMasterItem.ItemMasterId) {
                selectedItem.BatchDetails = [];
                selectedItem.QtyAdjusted = 0;
                var existing = $scope.itemUsedBatches[prevItem.ItemMasterId].indexOf(prevItem.StockSerialItemId);
                if (existing > -1) {
                    $scope.itemUsedBatches[prevItem.ItemMasterId].splice(existing, 1);
                }
                $scope.computeAmount(selectedItem);
            }

            var stockserialitems = null;
            if (SelectedMasterItem.ItemMaster.ToStoreStock &&
                SelectedMasterItem.ItemMaster.ToStoreStock.StockSerialItems.length > 0) {
                selectedItem.StockItemRev = SelectedMasterItem.ItemMaster.ToStoreStock.Rev;
                stockserialitems = SelectedMasterItem.ItemMaster.ToStoreStock.StockSerialItems;
                var usedBatches = $scope.itemUsedBatches[selectedItem.ItemMasterId] || [];
                for (var batid = 0; batid < stockserialitems.length; batid++) {
                    var serialitem = stockserialitems[batid];
                    if (usedBatches.indexOf(serialitem.Id) == -1) {
                        serialitem.SerialDetails = [
                            ' Batch: ', serialitem.BatchId,
                            ' | Qty: ', serialitem.Quantity,
                            ' | Expiry: ', $filter('date')(serialitem.ExpiryDate, 'd-MMM-y'),
                            ' | UCP: ', serialitem.Ucp,
                            ' | MRP: ', serialitem.Mrp
                        ].join(' ');

                        selectedItem.BatchDetails.push(serialitem);
                    }
                }

                if (selectedItem.BatchDetails && selectedItem.BatchDetails.length > 0) {
                    selectedItem.StockSerialItemId = selectedItem.BatchDetails[0].Id;
                    selectedItem.SelectedStockSerialItemId = selectedItem.StockSerialItemId;
                    selectedItem.Rev = selectedItem.BatchDetails[0].Rev;
                    selectedItem.StockItemId = selectedItem.BatchDetails[0].StockItemId;
                    selectedItem.BatchId = selectedItem.BatchDetails[0].BatchId;
                    selectedItem.SelectedBatchId = selectedItem.BatchId;
                    selectedItem.BatchQtyBeforeAdj = selectedItem.BatchDetails[0].Quantity;
                    selectedItem.ExpiryDate = selectedItem.BatchDetails[0].ExpiryDate;
                    // selectedItem.TotalQtyBeforeAdj = SelectedMasterItem.ItemMaster.StockItem.Quantity;
                    selectedItem.UnitCostPrice = selectedItem.BatchDetails[0].Ucp;
                    selectedItem.MrPrice = selectedItem.BatchDetails[0].Mrp;
                    selectedItem.AdjustmentTypeId = $scope.item.AdjustmentTypeId;
                    var serialQty = 0;
                    for (var sdx in SelectedMasterItem.ItemMaster.ToStoreStock.StockSerialItems) {
                        var serialbatch = SelectedMasterItem.ItemMaster.ToStoreStock.StockSerialItems[sdx];
                        serialQty += serialbatch.Quantity;
                    };
                    selectedItem.TotalQtyBeforeAdj = serialQty;
                    $scope.itemUsedBatches[selectedItem.ItemMasterId] = $scope.itemUsedBatches[selectedItem.ItemMasterId] || [];
                    $scope.itemUsedBatches[selectedItem.ItemMasterId].push(selectedItem.StockSerialItemId);

                    //$scope.itemUsedBatches[selectedItem.ItemMasterId].push(selectedItem.BatchId);
                } else {
                    utl.Alert.showErrorMsg($translate.instant('inventory.purchasereturn.allbatchesmsg.lbl') + selectedItem.ItemName);
                    return false;
                }
            } else {
                utl.Alert.showErrorMsg($translate.instant('inventory.stockadjustmentform.qtyavailable.lbl') + selectedItem.ItemName);
                return false;
            }

            selectedItem.PreviousItem = {};
            //selectedItem.PreviousItem.BatchId = selectedItem.BatchId;
            selectedItem.PreviousItem.StockSerialItemId = selectedItem.StockSerialItemId;
            selectedItem.PreviousItem.ItemMasterId = selectedItem.ItemMasterId;

            var PharItemLineDetails = [];
            for (var pildid = 0; pildid < $scope.StockAdjustmentDetails.length; pildid++) {
                var PharItemLineDetail = $scope.StockAdjustmentDetails[pildid];
                if (PharItemLineDetail.Status == 1) {
                    PharItemLineDetails.push(PharItemLineDetail);
                }
            }

            var lastIndex = PharItemLineDetails.length - 1;
            if (idx == lastIndex) {
                $scope.addNewLineItem();
            }
        };

        $scope.onBatchSelected = function (adjustingItem, selectedMasterItem, idx) {
            //Check If SelectedBatchId Allowed
            var existing = $scope.itemUsedBatches[adjustingItem.ItemMasterId].indexOf(adjustingItem.StockSerialItemId);
            var modified = $scope.itemUsedBatches[adjustingItem.ItemMasterId].indexOf(selectedMasterItem.Id);
            if (modified == -1) {
                adjustingItem.StockSerialItemId = selectedMasterItem.Id;
                adjustingItem.SelectedStockSerialItemId = selectedMasterItem.Id;
                adjustingItem.Rev = selectedMasterItem.Rev;
                adjustingItem.StockItemId = selectedMasterItem.StockItemId;
                adjustingItem.BatchId = selectedMasterItem.BatchId;
                adjustingItem.SelectedBatchId = selectedMasterItem.BatchId;
                adjustingItem.ExpiryDate = selectedMasterItem.ExpiryDate;
                adjustingItem.BatchQtyBeforeAdj = selectedMasterItem.Quantity;
                adjustingItem.UnitCostPrice = selectedMasterItem.Ucp;
                adjustingItem.MrPrice = selectedMasterItem.Mrp;
                adjustingItem.QtyAdjusted = 0;
                /*
                pharmacyItem.Amount = 0.00;
                pharmacyItem.GrossAmount = 0.00;
                pharmacyItem.DiscountAmount = 0.00;
                pharmacyItem.GSTAmount = 0.00;
                pharmacyItem.InGstAmount = 0.00;
                pharmacyItem.CGstAmount = 0.00;
                pharmacyItem.SGstAmount = 0.00;
                pharmacyItem.NetAmount = 0.00;
                */
                if (existing > -1) {
                    $scope.itemUsedBatches[adjustingItem.ItemMasterId].splice(existing, 1);
                }
                $scope.itemUsedBatches[adjustingItem.ItemMasterId].push(adjustingItem.StockSerialItemId);

            } else if (modified > -1) {
                utl.Alert.showErrorMsg($translate.instant('inventory.purchasereturn.batchselectedmsg.lbl') + adjustingItem.ItemName);
                adjustingItem.SelectedStockSerialItemId = adjustingItem.StockSerialItemId;
                adjustingItem.SelectedBatchId = adjustingItem.BatchId;
            }

            $scope.TotalGrossAmount = 0;
            $scope.TotalNetAmount = 0;

            calculatetotalAmount();
        };

        $scope.computeAmount = function (item) {
            if (item.AdjustmentTypeId == 1) {
                item.TotalQtyAfterAdj = item.TotalQtyBeforeAdj + parseInt(item.QtyAdjusted);
                item.BatchQtyAfterAdj = item.BatchQtyBeforeAdj + parseInt(item.QtyAdjusted);
                item.NetAmount = item.UnitCostPrice * parseInt(item.QtyAdjusted);
            } else if (item.AdjustmentTypeId == 2) {
                if (parseInt(item.QtyAdjusted) > item.BatchQtyBeforeAdj) {
                    item.QtyAdjusted = 0;
                    utl.Alert.showErrorMsg($translate.instant('inventory.stockadjustmentform.notremovebatchqtymsg.lbl') + item.ItemName);
                } else {
                    item.TotalQtyAfterAdj = item.TotalQtyBeforeAdj - parseInt(item.QtyAdjusted);
                    item.BatchQtyAfterAdj = item.BatchQtyBeforeAdj - parseInt(item.QtyAdjusted);
                    item.NetAmount = item.UnitCostPrice * parseInt(item.QtyAdjusted);
                }
            }

            $scope.TotalGrossAmount = 0;
            $scope.TotalNetAmount = 0;

            calculatetotalAmount();
        };

        function calculatetotalAmount() {
            for (var idx in $scope.StockAdjustmentDetails) {
                if ($scope.TotalGrossAmount === null) {
                    $scope.TotalGrossAmount = 0;
                }
                $scope.TotalGrossAmount = parseFloat(($scope.TotalGrossAmount + $scope.StockAdjustmentDetails[idx].GrossAmount).toFixed(2));

                if ($scope.TotalNetAmount === null) {
                    $scope.TotalNetAmount = 0;
                }
                $scope.TotalNetAmount = parseFloat(($scope.TotalNetAmount + $scope.StockAdjustmentDetails[idx].NetAmount).toFixed(2));

            }

            $scope.item.TotalGrossAmount = $scope.TotalGrossAmount;
            $scope.item.TotalNetAmount = $scope.TotalNetAmount;
        }

        $scope.onAdjustmenttypeSelected = function (selectedItem) {
            console.log($scope.item.AdjustmentTypeId);
            for (var idx in $scope.StockAdjustmentDetails) {
                if ($scope.StockAdjustmentDetails[idx].ItemMasterId > 0)
                    if ($scope.item.AdjustmentTypeId == 2) {
                        if ($scope.StockAdjustmentDetails[idx].BatchQtyBeforeAdj > 0) {
                            $scope.StockAdjustmentDetails[idx].AdjustmentTypeId = $scope.item.AdjustmentTypeId;
                        } else {
                            utl.Alert.showErrorMsg('Zero Batch Quantity cannot be removed');
                            $scope.item.AdjustmentTypeId = -1;
                        }
                    }
                $scope.StockAdjustmentDetails[idx].AdjustmentTypeId = $scope.item.AdjustmentTypeId;
            }
        };

        function loadData() {
            $scope.getItem();
            $scope.getStockAdjustmentDetails();
        }

        vm.stockadjustmentcontrolconfig = {
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
            api: 'pharmacy/itemmaster/GetItemStoreMaps',
            formatdisplay: formatselectedadjustmentitem,
            presearch: presearchadjustmentitem,
            postsearch: postsearchadjustmentitem
        };

        function formatselectedadjustmentitem() {
            $scope.autosearchpopup = 0;
            var selectedItem = vm.stockadjustmentcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ItemName + '(' + selectedItem.ItemCode + ')'].join(' ');
            } else if (vm.stockadjustmentcontrolconfig.rowdata) {
                result = [vm.stockadjustmentcontrolconfig.rowdata.ItemName, vm.stockadjustmentcontrolconfig.rowdata.ItemCode].join(' ');
            }
            return result;
        }

        function presearchadjustmentitem() {
            var query = vm.stockadjustmentcontrolconfig.query;
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.item.StoreMasterId },
                    // { Key: 4, Value: 1 },
                    // { Key: 8, Value: $scope.item.StoreTypeId },
                    { Key: 13, Value: 2 }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.stockadjustmentcontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                if ($scope.itemexactsearch == 1) {
                    inputData.Params.push({
                        Key: 24,
                        Value: query
                    });
                } else {
                    inputData.Params.push({
                        Key: 3,
                        Value: query
                    });
                }
            }

            vm.stockadjustmentcontrolconfig.searchparams = inputData;
        }

        function postsearchadjustmentitem() {
            $scope.autosearchpopup = 1;
            for (var idx in vm.stockadjustmentcontrolconfig.result) {
                var item = vm.stockadjustmentcontrolconfig.result[idx];
                var SerialItems = null;
                var SerialQuantity = 0;
                item.ItemCode = item.ItemCode;
                item.ItemName = item.ItemName;
                if (item.ItemMaster.ProductType !== null) {
                    item.ProductTypeName = item.ItemMaster.ProductType.ProductTypeName;
                } else {
                    item.ProductTypeName = '';
                }
                // if (item.ItemMaster.StockItem !== null) {
                //     if (item.ItemMaster.StockItem &&
                //         item.ItemMaster.StockItem.StockSerialItems.length > 0) {
                //         SerialItems = item.ItemMaster.StockItem.StockSerialItems;
                //         for (var batid = 0; batid < SerialItems.length; batid++) {
                //             SerialQuantity = SerialQuantity + SerialItems[batid].Quantity;
                //         }
                //     }
                //     item.StockInHand = SerialQuantity;
                // } else {
                //     item.StockInHand = 0;
                // }
                // item.GenericName = item.GenericName;
                /*
                if (item.ItemMaster.GenericMaster !== null) {
                    item.GenericName = item.ItemMaster.GenericMaster.GenericName;
                } else {
                    item.GenericName = '';
                }
                */
                // item.ManufacturerName = item.ManufacturerName;
                /*
                if (item.ItemMaster.Manufacturer !== null) {
                    item.ManufacturerName = item.ItemMaster.Manufacturer.VendorName;
                } else {
                    item.ManufacturerName = '';
                }
                */
                // if (item.ItemMaster.StockItem !== null) {
                //     item.StockInHand = item.ItemMaster.StockItem.Quantity;
                // } else {
                //     item.StockInHand = 0;
                // }
                if (item.ItemMaster.ToStoreStock !== null) {
                    item.StockInHand = item.ItemMaster.ToStoreStock.Quantity;
                } else {
                    item.StockInHand = 0;
                }
            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $('#saveAndAdjustid').text("Adjust");
            $('#btnprint').text("Print (Alt + P)");
            $scope.lookup = hasError ? {} : data;
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.item.StoreMasterId === 0) {
                    $scope.item.StoreMasterId = value[0].Id;
                    $scope.item.StoreName = value[0].StoreMaster.StoreName;
                    $scope.item.StoreTypeId = value[0].StoreMaster.StoreTypeId;
                } else if (key == 'UserStores' && $scope.item.StoreMasterId > 0) {
                    for (var userstoreid = 0; userstoreid < $scope.lookup['UserStores'].length; userstoreid++) {
                        if ($scope.lookup['UserStores'][userstoreid].Id == $scope.item.StoreMasterId) {
                            $scope.item.StoreTypeId = $scope.lookup['UserStores'][userstoreid].StoreMaster.StoreTypeId;
                        }
                    }
                }
            });

            $timeout(function () {
                var idx = $scope.StockAdjustmentDetails.length - 1;
                var nextId = "desc" + '' + idx;
                $('#' + nextId).focus();
            }, 100);
        };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Facility"
            },
            {
                "Key": "AdjustmentType"
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

        $scope.moveHeaderFocus = function (nextId) {
            if (event.keyCode == 13) {
                if (nextId == "pid") {
                    nextId = "doctorid";
                    $('#' + nextId).focus();
                } else if (nextId == "doctorid") {
                    if ($scope.currentcontext && $scope.currentcontext.isnewpatient) {
                        nextId = "dpmobileid";
                        $('#' + nextId).focus();
                    } else {
                        var idx = $scope.PatientBillDetails.length - 1;
                        nextId = "desc" + '' + idx;
                        $('#' + nextId).focus();
                    }
                } else if (nextId == "dpmobileid") {
                    var idx = $scope.PatientBillDetails.length - 1;
                    nextId = "desc" + '' + idx;
                    $('#' + nextId).focus();
                }

            }
        };

        $scope.startinterval = null;

        $scope.moveFocus = function (nextId, prevId, downId, upId, index, event, item) {
            if (event.keyCode == 39) { // right
                nextId = nextId + index;
                $('#' + nextId).select();
                $('#' + nextId).focus();
            } else if (event.keyCode == 37) { // left
                prevId = prevId + index;
                $('#' + prevId).focus();
            } else if (event.keyCode == 38) { // Up
                if (upId == 'desc') {
                    if ($scope.autosearchpopup == 0) {
                        upId = upId + (index - 1);
                        $('#' + upId).focus();
                    }
                } else {
                    upId = upId + (index - 1);
                    $('#' + upId).focus();
                }
            } else if (event.keyCode == 40) { // Down
                downId = downId + (index + 1);
                $('#' + downId).focus();
            }
            if (event.keyCode == 13) {
                if (nextId == 'desc') {
                    var idx = $scope.StockAdjustmentDetails.length - 1;
                    nextId = "desc" + '' + idx;
                    if (idx == (index)) {
                        nextId = "comments";
                        $('#' + nextId).focus();
                    } else {
                        $timeout(function () {
                            $('#' + nextId).focus();
                        }, 100);
                    }
                } else if (nextId == 'adjtype') {
                    nextId = "adjtype" + '' + index;
                    var dom = document.getElementById(nextId);
                    $scope.setCmbFocus(dom);
                } else if (nextId == 'qty') {
                    $timeout(function () {
                        nextId = "qty" + '' + index;
                        $('#' + nextId).select();
                        $('#' + nextId).focus();
                    }, 100);
                } else if (nextId == 'batch') {
                    nextId = "batch" + '' + index;
                    var banknamedom = document.getElementById(nextId);
                    $scope.setCmbFocus(banknamedom);
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
            var activeRecords = $filter('filterArrayItems')($scope.StockAdjustmentDetails, [{
                search: 1,
                fields: ['Status']
            }]);

            return activeRecords;
        }

        $scope.ValidQty = function (nextId) {
            if ($('#' + nextId).val() === '')
                $('#' + nextId).val(0);
        };

        $scope.setCmbFocus = function (dom) {
            $timeout(function () {
                var uiSelect = angular.element(dom);
                var uichild = uiSelect.controller('uiSelect');
                uichild.activate();
            }, 100);
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.FooterFocus = function (nextId) {
            if (event.keyCode == 13) {
                if (nextId == "comments") {
                    nextId = "saveAndAdjustid";
                    $('#' + nextId).focus();
                }
            }
        };

        $scope.initLookup();

        /* Stock  Adjustments - Shortcut Keys - Start */
        function keyupHandler(e) {
            var kCode = e.keyCode;
            if (kCode == 115 && savehitcompleted === 0 && $scope.canShowSaveandApproveBtn) { // F4  - SaveAndApprove
                $scope.SaveandAdjust();
            }
            if (kCode == 118) { // F7  - New Page
                $scope.addNew();
            }
            if (e.altKey && kCode == 65 && savehitcompleted === 0 && $scope.canShowSaveandApproveBtn) { // alt + s  - SaveAndApprove
                $scope.SaveandAdjust();
            }
            if (e.altKey && kCode == 80 && $scope.canShowPrintBtn) { // alt + p  - Print
                $scope.Print();
            }
            if (kCode == 27) { // Esc
                $scope.autosearchpopup = 0;
            }
        }
        angular.element(document).on('keydown', keyupHandler);
        $scope.$on('$destroy', function () {
            angular.element(document).off('keydown', keyupHandler);
        });
        /* Stock  Adjustments - Shortcut Keys - End */
    }

    StockAdjustmentFormController.$inject = ['$rootScope', '$scope', '$interval', '$stateParams', '$state', '$translate', 'utl', '$filter', 'modalConfig', '$timeout'];

})();