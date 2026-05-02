(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('OpeningStockEntryFormController', OpeningStockEntryFormController);

    function OpeningStockEntryFormController($rootScope, $scope, $stateParams, $state, $translate, utl, $filter, $timeout) {
        var vm = this;
        var savehitcompleted = 0;
        $scope.autosearchpopup = 0;

        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));

        angular.extend(this, utl.Ctrl.getBarcodePrintCtrl({
            $scope: $scope
        }));

        $scope.tabindexmap = {
            patienttabindex: 1,
            detailtabindex: 2
        };

        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            StoreMasterId: 0,
            StoreName: '',
            StockEntryTypeId: -1,
            ToStoreMasterId: -1,
            TotalGrossAmount: 0,
            TotalGstAmount: 0,
            TotalInGstAmount: 0,
            TotalCGstAmount: 0,
            TotalSGstAmount: 0,
            TotalNetAmount: 0,
            Comments: null,
            isDisabled: false,
            StockEntryNumber: null,
            DisplayStockEntryStatus: null
        };
        $scope.itemexactsearch = 0;
        $scope.itemexactsearch =
            (utl.FacilitySetting.getFacilitySettingValue('general', 'itemexactsearch')) ? utl.FacilitySetting.getFacilitySettingValue('general', 'itemexactsearch') : 0;


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

        $scope.lookup = {};

        $scope.currentcontext = {
            id: -1
        };


        $scope.openAttachments = function () {
            utl.Modal.open('app.stockentryattachments', {
                params: {
                    stockentryid: 0,
                    itemmasterid: 0
                },
                confirmCallback: $scope.initLookup,
                cancelCallback: $scope.initLookup
            });
        };

        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.item.StockEntryDate = utl.Formatter.getCurrentDate();
        $scope.item.StoreName = '';
        $scope.stockentryDetails = [];
        $scope.stockentryDetailConv = [];
        $scope.item.WithHeader = true;
        $scope.item.WithoutHeader = false;
        $scope.canShowPrintBtn = true;
        $scope.canShowSaveBtn = true;
        $scope.canShowSaveandApproveBtn = true;
        $scope.canShowAuthorizeBtn = true;
        $scope.canShowClearBtn = true;
        $scope.canShowCancelBtn = true;

        $scope.applyVisibilityRules = function () {
            // New
            if ($scope.item.StockEntryStatusId != 1 || $scope.item.StockEntryStatusId != 2 || $scope.item.StockEntryStatusId != 3 || $scope.item.StockEntryStatusId != 4 || $scope.item.StockEntryStatusId != 5) {
                $scope.canShowPrintBtn = false;
                $scope.canShowSaveBtn = true;
                $scope.canShowSaveandApproveBtn = true;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowClearBtn = true;
                $scope.canShowCancelBtn = true;
                $scope.canShowDeleteBtn = false;
                $scope.canShowHistoryBtn = false;
                $scope.canShowCancelentityBtn = false;
            }
            // When In Draft Status
            if ($scope.item.StockEntryStatusId == 1) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = true;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowClearBtn = true;
                $scope.canShowCancelBtn = false;
                $scope.canShowHistoryBtn = true;
                $scope.canShowDeleteBtn = true;
                $scope.canShowCancelentityBtn = false;
            }
            // When In Approved Status
            if ($scope.item.StockEntryStatusId == 2) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowAuthorizeBtn = true;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.canShowHistoryBtn = true;
                $scope.canShowDeleteBtn = false;
                $scope.canShowCancelentityBtn = true;
            }
            // When In Authorized Status
            if ($scope.item.StockEntryStatusId == 3) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.canShowHistoryBtn = true;
                $scope.canShowDeleteBtn = false;
                $scope.canShowCancelentityBtn = true;
            }
            // When In Completed Status
            if ($scope.item.StockEntryStatusId == 4) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.canShowHistoryBtn = true;
                $scope.canShowDeleteBtn = false;
                $scope.canShowCancelpoBtn = false;
                $scope.canShowCancelentityBtn = true;
            }
            // When In Cancelled Status
            if ($scope.item.StockEntryStatusId == 5) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.canShowHistoryBtn = true;
                $scope.canShowDeleteBtn = false;
                $scope.canShowCancelentityBtn = false;
            }
        };
        $scope.SelectedFromStore = function (selectedstore) {
            if ($scope.stockentryDetails.length > 0) {
                $scope.item.StoreId = $scope.item.StoreMasterId;
                $scope.item.StoreName = selectedstore.StoreName;
                $scope.stockentryDetails = [];
                $scope.addNewLineItem();
            }
        };
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
        $scope.amountConversion = function (amount) {
            return parseFloat(amount).toFixed(2);
        };

        $scope.setIndexforTableIndex = function () {
            var SNo = 1;
            for (var idx in $scope.stockentryDetails) {
                if ($scope.stockentryDetails[idx].Status == 1) {
                    $scope.stockentryDetails[idx].SNo = SNo;
                    $scope.stockentryDetails[idx].itemidxdesc = 'desc' + idx;
                    SNo++;
                }
            }
        };

        $scope.addNewLineItem = function () {
            $scope.autosearchpopup = 0;
            var stockentryDetail = {
                Id: 0,
                SNo: 0,
                ItemMasterId: -1,
                StockItemId: 0,
                StockSerialItemId: 0,
                ItemCode: '',
                ItemName: '',
                CostPrice: 0,
                itemidxdesc: null,
                BaseUom: {
                    Id: 0,
                    UomCode: ''
                },
                BaseUomId: 0,
                PurchaseUom: {
                    Id: 0,
                    UomCode: ''
                },
                PurchaseUomId: 0,
                SaleUom: {
                    Id: 0,
                    UomCode: ''
                },
                SaleUomId: 0,
                EntryQuantity: 0,
                BatchId: '',
                PurchasePrice: 0,
                ManufacturerId: 0,
                ManufacturerName: '',
                GstMaster: {
                    Id: 0,
                    GstCode: '',
                    GstName: '',
                    GstPercentage: ''
                },
                GstId: 0,
                GstCode: '',
                GstPercentage: 0,
                GstAmount: 0,
                UnitGstAmount: 0,
                InGstMaster: {
                    Id: 0,
                    GstCode: '',
                    GstName: '',
                    GstPercentage: ''
                },
                InGstId: 0,
                InGstCode: '',
                InGstPercentage: 0,
                InGstAmount: 0,
                UnitInGstAmount: 0,
                CGstMaster: {
                    Id: 0,
                    GstCode: '',
                    GstName: '',
                    GstPercentage: ''
                },
                CGstId: 0,
                CGstCode: '',
                CGstPercentage: 0,
                CGstAmount: 0,
                UnitCGstAmount: 0,
                SGstMaster: {
                    Id: 0,
                    GstCode: '',
                    GstName: '',
                    GstPercentage: ''
                },
                SGstId: 0,
                SGstCode: '',
                SGstPercentage: 0,
                SGstAmount: 0,
                UnitSGstAmount: 0,
                UnitCostPrice: 0,
                MrPrice: 0,
                GrossAmount: 0,
                NetAmountBeforeGst: 0,
                NetAmount: 0,
                Status: 1,
                RdoItemMasterId: false,
                IsBatchRequired: false,
                IsExpiryRequired: false,
                tabindex: $scope.tabindexmap.detailtabindex++
            };

            if ($scope.currentcontext.id > 0) {
                stockentryDetail.StockEntryId = $scope.currentcontext.id;
            }
            $scope.stockentryDetails.push(stockentryDetail);
            $scope.setIndexforTableIndex();
        };

        $scope.Clear = function () {
            $scope.stockentryDetails = [];
            $scope.addNewLineItem();
        };

        $scope.addNew = function () {
            if ($stateParams.id > 0)
                $state.go('app.openingstockentry', {
                    id: 0,
                    grnid: $scope.currentcontext.stockentryid
                });
            else
                $state.reload();
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
        };

        $scope.deleteOpeningStockEntryDetail = function (idx, selectedItem) {
            if (selectedItem.ItemMasterId > 0) {
                var name = "this item" || '';
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, selectedItem, name);
            }
        };
        // $scope.deleteItemCallback = function (scope, data, options, hasError) {
        //     utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        //     $scope.getList();
        // };

        // $scope.DeleteConfirmed = function (deleteId) {
        //     var options = {
        //         action: 'pharmacy/stockentry/DeleteStockEntry',
        //         data: {
        //             Id: deleteId
        //         },
        //         type: 'post',
        //         onComplete: $scope.deleteItemCallback
        //     };
        //     utl.Http.doAction(options);
        // };

        // $scope.deleteOSEDetail = function () {
        //     utl.Dialog.confirmDelete($scope.DeleteConfirmed, $scope.currentcontext.id);
        // };

        $scope.Print = function () {
            var inputData = {
                Id: $scope.currentcontext.id,
                Data: {
                    isprint: false,
                    withHeader: $scope.item.WithHeader,
                    withoutHeader: $scope.item.WithoutHeader,
                }
            };
            var options = {
                action: 'pharmacy/StockEntry/PrintStockEntry',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.History = function (idx, selectedItem) {
            utl.Modal.open('app.openingstockentryhistory', {
                params: {
                    itemmasterid: selectedItem.ItemMasterId,
                    itemcode: selectedItem.ItemCode,
                    itemname: selectedItem.ItemName
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.history = function (HistoryId) {
            utl.Modal.open('app.openingstockhistory', {});
        };

        $scope.Stock = function (idx, selectedItem) {
            utl.Modal.open('app.stockdetails', {
                params: {
                    itemmasterid: selectedItem.ItemMasterId,
                    itemcode: selectedItem.ItemCode,
                    itemname: selectedItem.ItemName
                },
                confirmCallback: $scope.getList
            });
        };

        // $scope.deleteItemCallback = function (scope, data, options, hasError) {
        //     utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        //     $scope.getList();
        // };

        // $scope.onDeleteConfirmed = function (item) {
        //     if (item.ItemMasterId != -1) {
        //         item.Status = 2;
        //     } else {
        //         utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.emptyrowmsg.lbl'));
        //         return false;
        //     }
        //     // $scope.item.OtherCharges = 0;
        //     // $scope.item.RoundOff = 0;
        //     $scope.item.TotalGrossAmount = 0;
        //     // $scope.item.TotalDiscountAmount = 0;
        //     $scope.item.TotalGstAmount = 0;
        //     $scope.item.TotalCGstAmount = 0;
        //     $scope.item.TotalSGstAmount = 0;
        //     $scope.item.TotalNetAmount = 0;
        //     // $scope.item.TotalInvoiceAmount = 0;
        //     // $scope.item.TotalBeforeRoundOff = 0;

        //     $scope.TotalGrossAmount = 0;
        //     // $scope.TotalDiscountAmount = 0;
        //     $scope.TotalGstAmount = 0;
        //     $scope.TotalCGstAmount = 0;
        //     $scope.TotalSGstAmount = 0;
        //     $scope.TotalNetAmount = 0;

        //     calculatetotalAmount();

        //     $scope.setIndexforTableIndex();
        // };

        // $scope.deleteOpeningStockEntryDetail = function (idx, selectedItem) {
        //     if (selectedItem.ItemMasterId > 0) {
        //         var name = "this item" || '';
        //         utl.Dialog.confirmDelete($scope.onDeleteConfirmed, selectedItem, name);
        //     }
        // };

        $scope.editOpeningStockEntryDetail = function (item) {
            item.currenteditable = true;
            utl.Modal.open('app.openingstockentrydetail', {
                params: {
                    id: $scope.currentcontext.id,
                    current_item: item
                },
                confirmCallback: $scope.onDetailSave
            });
        };

        $scope.onDetailSave = function (itemFromModal) {
            var isaddnew = true;
            for (var idx in $scope.stockentryDetails) {
                var item = $scope.stockentryDetails[idx];
                if (item.currenteditable) {
                    item = itemFromModal;
                    item.currenteditable = false;
                    isaddnew = false;
                }
            }
            if (isaddnew) {
                itemFromModal.Status = 1;
                if ($scope.currentcontext.id > 0) {
                    itemFromModal.StockEntryId = $scope.currentcontext.id;
                }
                $scope.stockentryDetails.push(itemFromModal);
            }
        };

        $scope.getStockEntryDetailsCallback = function (scope, res, options, hasError) {
            $scope.stockentryDetails = [];
            $scope.stockentryDetailConv = res.Data || [];
            for (var idx in $scope.stockentryDetailConv) {
                var entryitem = $scope.stockentryDetailConv[idx];
                if (entryitem.ItemMasterId > 0) {
                    if (entryitem.ItemMaster.IsBatchMandatory)
                        entryitem.IsBatchRequired = true;

                    if (entryitem.ItemMaster.IsExpiryMandatory)
                        entryitem.IsExpiryRequired = true;
                }

                if ($scope.item.StockEntryStatusId >= 2 || $scope.item.StockEntryStatusId !== 0)
                    entryitem.RdoItemMasterId = true;
                // if (entryitem.EntryQuantity) {
                //     entryitem.EntryQuantity = (entryitem.EntryQuantity) / (entryitem.ConversionQuantity);
                // }
                $scope.setDispExpiry(entryitem);
                $scope.stockentryDetails.push(entryitem);
            }

            if ($scope.item.StockEntryStatusId <= 1) {
                $scope.addNewLineItem();
            }
            $scope.setIndexforTableIndex();
        };

        $scope.getStockEntryDetails = function (pageNo) {
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
                    action: 'pharmacy/stockentrydetail/GetStockEntryDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getStockEntryDetailsCallback
                };
                utl.Http.doAction(options);
            } else {
                // $scope.addNewLineItem();
                $timeout(function () {
                    var idx = $scope.stockentryDetails.length - 1;
                    var nextId = "desc" + '' + idx;
                    $('#' + nextId).focus();
                }, 100);
            }
        };

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            if (data.StockEntryStatusId == 1) {
                $scope.item.isDisabled = false;
                $scope.item.DisplayStockEntryStatus = 'Draft';
            }
            if (data.StockEntryStatusId == 2) {
                $scope.item.isDisabled = true;
                $scope.item.DisplayStockEntryStatus = 'Approved';
            }
            if (data.StockEntryStatusId == 3) {
                $scope.item.isDisabled = true;
                $scope.item.DisplayStockEntryStatus = 'Authorized';
            }
            if (data.StockEntryStatusId == 4) {
                $scope.item.isDisabled = true;
                $scope.item.DisplayStockEntryStatus = 'Completed';
            }
            if (data.StockEntryStatusId == 5) {
                $scope.item.isDisabled = true;
                $scope.item.DisplayStockEntryStatus = 'Cancelled';
            }
            $scope.applyVisibilityRules();
        };

        $scope.getItem = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'pharmacy/stockentry/GetStockEntryById',
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
            $state.go('app.openingstockentrys');
        };

        $scope.SaveandDraft = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'inventory.openingstockentry.savemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandDraftConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onSaveandDraftConfirmed = function () {
            $scope.item.StockEntryStatusId = 1;
            $scope.item.EnteredBy = utl.Session.getCurrentUserId();
            $scope.item.EnteredDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        /*
        $scope.SaveandApprove = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'inventory.openingstockentry.approvemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandApproveConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onSaveandApproveConfirmed = function () {
            if ($scope.item.StockEntryStatusId == 1) { } else {
                $scope.item.EnteredBy = utl.Session.getCurrentUserId();
                $scope.item.EnteredDate = utl.Formatter.getCurrentDate();
            }
            $scope.item.StockEntryStatusId = 2;
            $scope.item.ApprovedBy = utl.Session.getCurrentUserId();
            $scope.item.ApprovedDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };
        */

        $scope.SaveandApprove = function () {
            if ($scope.item.StockEntryStatusId == 1) {} else {
                $scope.item.EnteredBy = utl.Session.getCurrentUserId();
                $scope.item.EnteredDate = utl.Formatter.getCurrentDate();
            }
            $scope.item.StockEntryStatusId = 2;
            $scope.item.ApprovedBy = utl.Session.getCurrentUserId();
            $scope.item.ApprovedDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        // $scope.SaveandAuthorize = function () {
        //     var confirmOptions = {
        //         headingKey: 'common.confirm-modal-header.lbl',
        //         messageKey: 'inventory.openingstockentry.authorizemsg.lbl',
        //         yesKey: 'common.yeskey.lbl',
        //         noKey: 'common.nokey.lbl',
        //         onSuccessMethod: $scope.onSaveandAuthorizeConfirmed,
        //     };
        //     utl.Dialog.confirmMessage(confirmOptions);
        // };

        $scope.SaveandAuthorize = function () {
            savehitcompleted = 0;
            $scope.item.StockEntryStatusId = 3;
            $scope.item.AuthorizedBy = utl.Session.getCurrentUserId();
            $scope.item.AuthorizedDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.onCancelConfirmed = function () {
            $scope.item.StockEntryStatusId = 5;
            $scope.item.CancelledBy = utl.Session.getCurrentUserId();
            $scope.item.CancelledDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.Cancel = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'inventory.openingstockentry.cancelmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onCancelConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.barcodemanual = function (idx, item) {
            utl.Modal.openFixedDialog('app.manualbarcode', {
                params: {
                    itemId: item.ItemMasterId,
                    index: idx,
                    barcode: item.BarCodeId
                },
                confirmCallback: $scope.BarcodeSave
            });
        };

        $scope.BarcodeSave = function (itemFromModal) {
            $scope.stockentryDetails[itemFromModal.index].BarCodeId = itemFromModal.BarCodeId;
        };

        $scope.saveItem = function () {

            if (savehitcompleted == 1) return false;

            if (!utl.Validator.validate($scope)) {
                return;
            }

            if (checkMandatoryFields()) {
                var lines = getLinesForSave();

                var actionName = 'pharmacy/stockentry/AddStockEntry';
                if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                    actionName = 'pharmacy/stockentry/UpdateStockEntry';
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
            for (var iddx in $scope.stockentryDetails) {
                var iddxitem = $scope.stockentryDetails[iddx];
                if (iddxitem.ItemMasterId > 0 && iddxitem.EntryQuantity <= 0 && iddxitem.Status === 1) {
                    utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.enterqtymsg.lbl') + iddxitem.ItemName);
                    return false;
                } else if (iddxitem.ItemMasterId > 0 && iddxitem.PurchasePrice <= 0 && iddxitem.Status === 1) {
                    utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.entercostpricemsg.lbl') + iddxitem.ItemName);
                    return false;
                } else if (iddxitem.ItemMasterId > 0 && iddxitem.MrPrice <= 0 && iddxitem.Status === 1) {
                    utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.entermrpmsg.lbl') + iddxitem.ItemName);
                    return false;
                }
                // else if (iddxitem.ItemMasterId > 0 && iddxitem.MrPrice >= iddxitem.PurchasePrice && iddxitem.Status === 1) {
                //     utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.entermrpgreaterucpmsg.lbl') + iddxitem.ItemName);
                //     return false;
                // }
            }

            return true;
        }

        $scope.duplicateBatchCheck = function (item) {
            var cnt = 0;
            for (var idx in $scope.stockentryDetails) {
                var batchitem = $scope.stockentryDetails[idx];
                if (batchitem.ItemMasterId == item.ItemMasterId && batchitem.BatchId == item.BatchId) {
                    cnt = cnt + 1;
                }
            }

            if (cnt > 1) {
                alert($translate.instant('inventory.openingstockentry.enterbatchmsg.lbl') + item.ItemName);
            }
        };

        function getLinesForSave() {
            var result = [];
            for (var idx in $scope.stockentryDetails) {
                var item = $scope.stockentryDetails[idx];
                item.BaseUomId = item.BaseUom.Id;
                if (item.ItemMasterId > 0 && item.Status == 1) {
                    item.EntryQuantity = parseInt(item.EntryQuantity);
                    $scope.duplicateBatchCheck(item);
                    if (!item.BarCodeId) {
                        var digits = item.BatchId + utl.Formatter.getExpDateString(item.ExpiryDate);
                        item.BarCodeId = '';
                        for (let i = 0; i < 8; i++) {
                            item.BarCodeId += digits[Math.floor(Math.random() * 10)];
                        }
                    }
                    result.push(item);
                }
            }
            return result;
        }

        $scope.printbarcode = function (idx, item) {
            var vExpiryDate = "";
            var vBatchNo = "";
            var vItemName = "";
            var vItemCode = "";
            var vBarcode = "";
            for (var idx in $scope.stockentryDetails) {
                var item = $scope.stockentryDetails[idx];
                if (item.ItemMasterId) {
                    if (item.ItemMaster && item.ItemMaster.ItemName)
                        vItemName = item.ItemMaster.ItemName;
                    vItemCode = item.ItemMaster.ItemCode;
                    if (item.BatchId)
                        vBatchNo = item.BatchId;
                    if (item.ExpiryDate)
                        vExpiryDate = item.ExpiryDate;
                    if (item.BarCodeId)
                        vBarcode = item.BarCodeId;
                    $scope.printbarcodeScript(vItemName, vItemCode, vBarcode, vBatchNo, vExpiryDate, $scope.stockentryDetails);
                }
            }
        };


        $scope.printbarcodeScript = function (itemName, itemCode, barcodenr, batchno, expDate, items) {
            for (var idx1 in items) {
                var item = items[idx1];
                if (item.BarCodeId == barcodenr) {
                    var vItemName = '';
                    var vItemCode = '';
                    var vBatchInfo = '';
                    var vBarcode = '';
                    var vexpDate = '';

                    try {
                        if (itemName) {
                            vItemName = itemName;
                        }
                        if (itemCode) {
                            vItemCode = itemCode;
                        }
                        if (barcodenr) {
                            vBarcode = barcodenr;
                        }
                        if (batchno) {
                            vBatchInfo = batchno;
                        }
                        if (expDate) {
                            vexpDate = utl.Formatter.getExpDateString(expDate);
                        }

                    } catch (ex) {}

                    var code = '';
                    var printData = []
                    var printCodes = {
                        new_line: '\x0A'
                    };

                    var code = '';
                    code += 'I8,A' + printCodes.new_line;
                    code += 'q799' + printCodes.new_line;
                    code += 'O' + printCodes.new_line;
                    code += 'JF' + printCodes.new_line;
                    code += 'ZT' + printCodes.new_line;
                    code += 'Q120,25' + printCodes.new_line;
                    code += 'N' + printCodes.new_line;
                    code += 'A783,99,2,3,1,1,N,"' + vItemName + '"' + printCodes.new_line;
                    code += 'A583,99,2,3,1,1,N,"' + vItemName + '"' + printCodes.new_line;
                    code += 'A390,99,2,3,1,1,N,"' + vItemName + '"' + printCodes.new_line;
                    code += 'A194,99,2,3,1,1,N,"' + vItemName + '"' + printCodes.new_line;

                    code += 'B758,69,2,9,1,2,27,N,"' + vBarcode + '"' + printCodes.new_line;
                    code += 'A768,35,2,3,1,1,N,"' + vBatchInfo + '"' + printCodes.new_line;
                    code += 'B549,69,2,9,1,2,27,N,"' + vBarcode + '"' + printCodes.new_line;
                    code += 'A559,35,2,3,1,1,N,"' + vBatchInfo + '"' + printCodes.new_line;
                    code += 'B365,69,2,9,1,2,27,N,"' + vBarcode + '"' + printCodes.new_line;
                    code += 'A374,35,2,3,1,1,N,"' + vBatchInfo + '"' + printCodes.new_line;
                    code += 'B175,69,2,9,1,2,27,N,"' + vBarcode + '"' + printCodes.new_line;
                    code += 'A184,35,2,3,1,1,N,"' + vBatchInfo + '"' + printCodes.new_line;

                    code += 'A778,15,2,3,1,1,N,"' + vexpDate + '"' + printCodes.new_line;
                    code += 'A583,15,2,3,1,1,N,"' + vexpDate + '"' + printCodes.new_line;
                    code += 'A390,15,2,3,1,1,N,"' + vexpDate + '"' + printCodes.new_line;
                    code += 'A194,15,2,3,1,1,N,"' + vexpDate + '"' + printCodes.new_line;


                    code += 'P1,1' + printCodes.new_line;
                    printData.push(code);
                    console.log(printData);
                    $scope.printRaw(printData);


                    // var code = '';
                    // code += 'I8,A,001' + printCodes.new_line;
                    // code += 'Q200,024' + printCodes.new_line;
                    // code += 'q831' + printCodes.new_line;
                    // code += 'rN' + printCodes.new_line;
                    // code += 'S2' + printCodes.new_line;
                    // code += 'D15' + printCodes.new_line;
                    // code += 'ZT' + printCodes.new_line;
                    // code += 'JF' + printCodes.new_line;
                    // code += 'O' + printCodes.new_line;
                    // code += 'R215,0' + printCodes.new_line;
                    // code += 'f100' + printCodes.new_line;
                    // code += 'N' + printCodes.new_line;
                    // code += 'B373,120,2,1,3,9,61,B,"' + barcodenr + '"' + printCodes.new_line;
                    // // code += 'A373,170,2,2,1,1,N,"' + printCodes.new_line;
                    // // code += 'A373,150,2,2,1,1,N,"' + printCodes.new_line;
                    // code += 'A374,185,2,2,1,1,N,"' + vItemName + '(' + vItemCode + ')' + '"' + printCodes.new_line;
                    // code += 'A374,155,2,2,1,1,N,"' + vexpDate + '"' + printCodes.new_line;
                    // code += 'A165,155,2,2,1,1,N,"' + vBatchInfo + '"' + printCodes.new_line;
                    // code += 'P1,1' + printCodes.new_line;
                    // printData.push(code);
                    // console.log(printData);
                    // $scope.printRaw(printData);
                }
            }
        };

        $scope.generatebarCode = function (idx, item) {
            var vExpiryDate = "";
            var vBatchNo = "";
            var vItemName = "";
            var vItemCode = "";
            var vBarcode = "";
            if (item.ItemMasterId) {
                if (item.ItemMaster && item.ItemMaster.ItemName)
                    vItemName = item.ItemMaster.ItemName;
                vItemCode = item.ItemMaster.ItemCode;
                if (item.BatchId)
                    vBatchNo = item.BatchId;
                if (item.ExpiryDate)
                    vExpiryDate = item.ExpiryDate;
                if (item.BarCodeId)
                    vBarcode = item.BarCodeId;
                $scope.generateBarcodeScript(vItemName, vItemCode, vBarcode, vBatchNo, vExpiryDate, item);
            }
        };

        $scope.generateBarcodeScript = function (itemName, itemCode, barcodenr, batchno, expDate, items) {

            var vItemName = '';
            var vItemCode = '';
            var vBatchInfo = '';
            var vexpDate = '';
            var vBarcode = '';
            try {
                if (itemName) {
                    vItemName = itemName;
                }
                if (itemCode) {
                    vItemCode = itemCode;
                }
                if (batchno) {
                    vBatchInfo = batchno;
                }
                if (barcodenr) {
                    vBarcode = barcodenr;
                }
                if (expDate) {
                    vexpDate = utl.Formatter.getExpDateString(expDate);
                }

            } catch (ex) {}

            var code = '';
            var printData = []
            var printCodes = {
                new_line: '\x0A'
            };

            var code = '';
            code += 'I8,A' + printCodes.new_line;
            code += 'q799' + printCodes.new_line;
            code += 'O' + printCodes.new_line;
            code += 'JF' + printCodes.new_line;
            code += 'ZT' + printCodes.new_line;
            code += 'Q120,25' + printCodes.new_line;
            code += 'N' + printCodes.new_line;
            code += 'A783,99,2,3,1,1,N,"' + vItemName + '"' + printCodes.new_line;
            code += 'A583,99,2,3,1,1,N,"' + vItemName + '"' + printCodes.new_line;
            code += 'A390,99,2,3,1,1,N,"' + vItemName + '"' + printCodes.new_line;
            code += 'A194,99,2,3,1,1,N,"' + vItemName + '"' + printCodes.new_line;

            code += 'B758,69,2,9,1,2,27,N,"' + vBarcode + '"' + printCodes.new_line;
            code += 'A768,35,2,3,1,1,N,"' + vBatchInfo + '"' + printCodes.new_line;
            code += 'B549,69,2,9,1,2,27,N,"' + vBarcode + '"' + printCodes.new_line;
            code += 'A559,35,2,3,1,1,N,"' + vBatchInfo + '"' + printCodes.new_line;
            code += 'B365,69,2,9,1,2,27,N,"' + vBarcode + '"' + printCodes.new_line;
            code += 'A374,35,2,3,1,1,N,"' + vBatchInfo + '"' + printCodes.new_line;
            code += 'B175,69,2,9,1,2,27,N,"' + vBarcode + '"' + printCodes.new_line;
            code += 'A184,35,2,3,1,1,N,"' + vBatchInfo + '"' + printCodes.new_line;

            code += 'A778,15,2,3,1,1,N,"' + vexpDate + '"' + printCodes.new_line;
            code += 'A583,15,2,3,1,1,N,"' + vexpDate + '"' + printCodes.new_line;
            code += 'A390,15,2,3,1,1,N,"' + vexpDate + '"' + printCodes.new_line;
            code += 'A194,15,2,3,1,1,N,"' + vexpDate + '"' + printCodes.new_line;


            code += 'P1,1' + printCodes.new_line;
            printData.push(code);
            console.log(printData);
            $scope.printRaw(printData);
            // var code = '';
            // code += 'I8,A,001' + printCodes.new_line;
            // code += 'Q200,024' + printCodes.new_line;
            // code += 'q831' + printCodes.new_line;
            // code += 'rN' + printCodes.new_line;
            // code += 'S2' + printCodes.new_line;
            // code += 'D15' + printCodes.new_line;
            // code += 'ZT' + printCodes.new_line;
            // code += 'JF' + printCodes.new_line;
            // code += 'O' + printCodes.new_line;
            // code += 'R215,0' + printCodes.new_line;
            // code += 'f100' + printCodes.new_line;
            // code += 'N' + printCodes.new_line;
            // code += 'B373,120,2,1,3,9,61,B,"' + barcodenr + '"' + printCodes.new_line;
            // // code += 'A373,155,2,2,1,1,N,"' + printCodes.new_line;
            // // code += 'A373,135,2,2,1,1,N,"' + printCodes.new_line;
            // code += 'A374,185,2,2,1,1,N,"' + vItemName + '(' + vItemCode + ')' + '"' + printCodes.new_line;
            // code += 'A374,155,2,2,1,1,N,"' + vexpDate + '"' + printCodes.new_line;
            // code += 'A165,155,2,2,1,1,N,"' + vBatchInfo + '"' + printCodes.new_line;
            // code += 'P1,1' + printCodes.new_line;
            // printData.push(code);
            // console.log(printData);
            // $scope.printRaw(printData);

        };

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

        function loadData() {
            $scope.getItem();
            $scope.getStockEntryDetails();
            $scope.getfacility();
        }

        $scope.onItemSelected = function (idx, selectedItem) {

            var SelectedMasterItem = selectedItem.SelectedItem.ItemMaster;

            selectedItem.ItemMasterId = SelectedMasterItem.Id;
            selectedItem.ItemCode = SelectedMasterItem.ItemCode;
            selectedItem.ItemName = SelectedMasterItem.ItemName;
            selectedItem.ManufacturerId = SelectedMasterItem.ManufacturerId;

            selectedItem.BaseUom.Id = SelectedMasterItem.BaseUomId;
            selectedItem.BaseUom.UomCode = SelectedMasterItem.UomMaster.UomName;

            selectedItem.PurchaseUom.Id = SelectedMasterItem.BaseUomId;
            selectedItem.PurchaseUom.UomCode = SelectedMasterItem.PurchaseUom.UomName;

            selectedItem.SaleUom.Id = SelectedMasterItem.SaleUomId;
            selectedItem.SaleUom.UomCode = SelectedMasterItem.SaleUom.UomName;
            if (SelectedMasterItem.CostPrice && SelectedMasterItem.CostPrice > 0) {
                selectedItem.PurchasePrice = SelectedMasterItem.CostPrice;
            } else {
                selectedItem.PurchasePrice = SelectedMasterItem.ItemPrice;
            }


            selectedItem.MrPrice = SelectedMasterItem.MrPrice;
            selectedItem.Mrp = SelectedMasterItem.Mrp;
            selectedItem.IsMultiUse = SelectedMasterItem.IsMultiUse;
            selectedItem.NoOfTransactions = SelectedMasterItem.NoOfTransactions;

            if (SelectedMasterItem.StockItem) {
                selectedItem.StockItemId = SelectedMasterItem.StockItem.Id;
            } else {
                selectedItem.StockItemId = 0;
            }
            if (SelectedMasterItem.UomConversions) {
                if (SelectedMasterItem.UomConversions.length > 0) {
                    for (var idxUOM in SelectedMasterItem.UomConversions) {
                        var uom = SelectedMasterItem.UomConversions[idxUOM];
                        if (uom.UomTypeId == 2) {
                            selectedItem.ConversionQuantity = uom.ConversionQuantity || 1;
                        }
                    }
                }
            }
            selectedItem.GstId = SelectedMasterItem.GstId;
            if (selectedItem.GstId > 0) {
                selectedItem.GstCode = SelectedMasterItem.GstMaster.GstCode;
                selectedItem.GstPercentage = parseFloat(SelectedMasterItem.GstMaster.GstPercentage.toFixed(2));
            } else {
                selectedItem.GstCode = '';
                selectedItem.GstPercentage = 0;
            }
            selectedItem.InGstId = SelectedMasterItem.InGstId;
            if (selectedItem.InGstId > 0) {
                selectedItem.InGstCode = SelectedMasterItem.InGstMaster.GstCode;
                selectedItem.InGstPercentage = parseFloat(SelectedMasterItem.InGstMaster.GstPercentage.toFixed(2));
            } else {
                selectedItem.InGstCode = '';
                selectedItem.InGstPercentage = 0;
            }
            selectedItem.CGstId = SelectedMasterItem.CGstId;
            if (selectedItem.CGstId > 0) {
                selectedItem.CGstCode = SelectedMasterItem.CGstMaster.GstCode;
                selectedItem.CGstPercentage = parseFloat(SelectedMasterItem.CGstMaster.GstPercentage.toFixed(2));
            } else {
                selectedItem.CGstCode = '';
                selectedItem.CGstPercentage = 0;
            }
            selectedItem.SGstId = SelectedMasterItem.SGstId;
            if (selectedItem.SGstId > 0) {
                selectedItem.SGstCode = SelectedMasterItem.SGstMaster.GstCode;
                selectedItem.SGstPercentage = parseFloat(SelectedMasterItem.SGstMaster.GstPercentage.toFixed(2));
            } else {
                selectedItem.SGstCode = '';
                selectedItem.SGstPercentage = 0;
            }

            if (SelectedMasterItem.IsBatchMandatory)
                selectedItem.IsBatchRequired = true;

            if (SelectedMasterItem.IsExpiryMandatory)
                selectedItem.IsExpiryRequired = true;

            var SeLineDetails = [];
            for (var seldid = 0; seldid < $scope.stockentryDetails.length; seldid++) {
                var SeLineDetail = $scope.stockentryDetails[seldid];
                if (SeLineDetail.Status == 1) {
                    SeLineDetails.push(SeLineDetail);
                }
            }

            var lastIndex = SeLineDetails.length - 1;
            if (idx == lastIndex) {
                $scope.addNewLineItem();
            }
        };

        $scope.setDispExpiry = function (item) {
            // item.dispExpiryDate = moment(item.ExpiryDate).format("MMYYYY");
            item.dispExpiryDate = moment(item.ExpiryDate).format("MMYY");
        };

        $scope.setExpiryFocus = function (item, idx) {
            item.dispExpiryDate = null;
            item.ExpiryDate = null;
            utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.enterexpirymsg.lbl'));
            $("#dispExpiryDate" + idx).focus();
        };

        $scope.CheckExpiryDate = function (item, idx) {
            try {
                if (item.dispExpiryDate) {
                    if (item.dispExpiryDate.length > 3) {
                        var TodayDate = new Date().toISOString().slice(0, 10);
                        var CurDate = new Date(TodayDate);
                        item.dispExpiryDate = item.dispExpiryDate.replace('/', '');
                        item.dispExpiryDate = item.dispExpiryDate.replace('-', '');
                        var date = "01"; // Starting date of month
                        var month = item.dispExpiryDate.slice(0, 2);
                        if (month > 12) {
                            $scope.setExpiryFocus(item, idx);
                        } else {
                            month -= 1;
                            var year1 = new Date().getFullYear();
                            year1 = year1.toString().substr(0, 2);

                            var year = year1 + item.dispExpiryDate.slice(2, 4);
                            var ExpDate = new Date(year, month, date);
                            var ExpiryDays = Math.round((ExpDate - CurDate) / (1000 * 60 * 60 * 24));
                            if (ExpiryDays <= 0) {
                                item.dispExpiryDate = null;
                                item.ExpiryDate = null;
                                utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.enterexpirymsg.lbl'));
                                $("#dispExpiryDate" + idx).focus();
                            } else {
                                item.ExpiryDate = ExpDate;
                            }
                        }
                    } else {
                        $scope.setExpiryFocus(item, idx);
                    }
                } else {
                    item.dispExpiryDate = null;
                    item.ExpiryDate = null;
                }

            } catch (e) {
                $scope.setExpiryFocus(item, idx);
            }
        };

        $scope.computeforgivenPrice = function (item) {
            item.GstAmount = (parseFloat(item.PurchasePrice) / 100) * parseFloat(item.GstPercentage).toFixed(2);
            item.UnitGstAmount = (parseFloat(item.PurchasePrice) / 100) * parseFloat(item.GstPercentage).toFixed(2);

            item.InGstAmount = (parseFloat(item.PurchasePrice) / 100) * parseFloat(item.InGstPercentage).toFixed(2);
            item.UnitInGstAmount = (parseFloat(item.PurchasePrice) / 100) * parseFloat(item.InGstPercentage).toFixed(2);

            item.CGstAmount = (parseFloat(item.PurchasePrice) / 100) * parseFloat(item.CGstPercentage).toFixed(2);
            item.UnitCGstAmount = (parseFloat(item.PurchasePrice) / 100) * parseFloat(item.CGstPercentage).toFixed(2);

            item.SGstAmount = (parseFloat(item.PurchasePrice) / 100) * parseFloat(item.SGstPercentage).toFixed(2);
            item.UnitSGstAmount = (parseFloat(item.PurchasePrice) / 100) * parseFloat(item.SGstPercentage).toFixed(2);

            item.UnitCostPrice = parseFloat(item.PurchasePrice) + item.GstAmount;

            $scope.computeAmount(item);
        };

        $scope.computeAmount = function (item) {
            if (item.EntryQuantity > 0) {
                item.GrossAmount = parseFloat(item.PurchasePrice) * parseInt(item.EntryQuantity);
                item.GstAmount = (parseFloat(item.PurchasePrice) / 100) * parseFloat(item.GstPercentage).toFixed(2);
                item.InGstAmount = (parseFloat(item.PurchasePrice) / 100) * parseFloat(item.InGstPercentage).toFixed(2);
                item.CGstAmount = (parseFloat(item.PurchasePrice) / 100) * parseFloat(item.CGstPercentage).toFixed(2);
                item.SGstAmount = (parseFloat(item.PurchasePrice) / 100) * parseFloat(item.SGstPercentage).toFixed(2);
                item.UnitCostPrice = parseFloat(item.PurchasePrice) + item.GstAmount;
                // item.NetAmount = parseFloat(item.UnitCostPrice) * parseInt(item.EntryQuantity);
                item.NetAmount = parseFloat(item.PurchasePrice) * parseInt(item.EntryQuantity);
                item.NetAmountBeforeGst = parseFloat(item.NetAmount) - parseFloat(item.GstAmount);
                item.TotalConversionQuantity = parseInt(item.EntryQuantity) * parseInt(item.ConversionQuantity);
                item.GrossAmount = parseFloat(item.PurchasePrice) * parseInt(item.TotalConversionQuantity);
                item.gstamt = parseFloat(item.GstAmount) * parseInt(item.TotalConversionQuantity);
                item.NetAmount = parseFloat(item.GrossAmount) + parseInt(item.gstamt);
            }

            $scope.TotalGrossAmount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalInGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmount = 0;

            calculatetotalAmount();
        };

        $scope.computeConversionAmount = function (item) {
            // if (item.EntryQuantity > 0) {
            // item.GrossAmount = parseFloat(item.PurchasePrice) * parseInt(item.EntryQuantity);
            item.GstAmount = (parseFloat(item.PurchasePrice) / 100) * parseFloat(item.GstPercentage).toFixed(2);
            item.InGstAmount = (parseFloat(item.PurchasePrice) / 100) * parseFloat(item.InGstPercentage).toFixed(2);
            item.CGstAmount = (parseFloat(item.PurchasePrice) / 100) * parseFloat(item.CGstPercentage).toFixed(2);
            item.SGstAmount = (parseFloat(item.PurchasePrice) / 100) * parseFloat(item.SGstPercentage).toFixed(2);
            item.UnitCostPrice = parseFloat(item.PurchasePrice) + item.GstAmount;
            // item.NetAmount = parseFloat(item.UnitCostPrice) * parseInt(item.EntryQuantity);
            // item.NetAmount = parseFloat(item.PurchasePrice) * parseInt(item.EntryQuantity);
            item.NetAmountBeforeGst = parseFloat(item.NetAmount) - parseFloat(item.GstAmount);
            if (item.TotalConversionQuantity === null) {
                item.TotalConversionQuantity = 0
            }
            // item.TotalConversionQuantity = parseInt(item.EntryQuantity) * parseInt(item.ConversionQuantity);
            item.GrossAmount = parseFloat(item.PurchasePrice) * parseInt(item.TotalConversionQuantity);
            item.NetAmount = parseFloat(item.PurchasePrice) * parseInt(item.TotalConversionQuantity);
            // }

            $scope.TotalGrossAmount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalInGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmount = 0;

            calculatetotalAmount();
        };

        function calculatetotalAmount() {
            for (var idx in $scope.stockentryDetails) {
                if ($scope.TotalGrossAmount === null) {
                    $scope.TotalGrossAmount = 0;
                }
                $scope.TotalGrossAmount = parseFloat(($scope.TotalGrossAmount + $scope.stockentryDetails[idx].GrossAmount).toFixed(2));

                if ($scope.TotalGstAmount === null) {
                    $scope.TotalGstAmount = 0;
                }
                $scope.TotalGstAmount = parseFloat(($scope.TotalGstAmount + ($scope.stockentryDetails[idx].GstAmount * $scope.stockentryDetails[idx].EntryQuantity)).toFixed(2));

                if ($scope.TotalInGstAmount === null) {
                    $scope.TotalInGstAmount = 0;
                }
                $scope.TotalInGstAmount = parseFloat(($scope.TotalInGstAmount + ($scope.stockentryDetails[idx].InGstAmount * $scope.stockentryDetails[idx].EntryQuantity)).toFixed(2));

                if ($scope.TotalCGstAmount === null) {
                    $scope.TotalCGstAmount = 0;
                }
                $scope.TotalCGstAmount = parseFloat(($scope.TotalCGstAmount + ($scope.stockentryDetails[idx].CGstAmount * $scope.stockentryDetails[idx].EntryQuantity)).toFixed(2));

                if ($scope.TotalSGstAmount === null) {
                    $scope.TotalSGstAmount = 0;
                }
                $scope.TotalSGstAmount = parseFloat(($scope.TotalSGstAmount + ($scope.stockentryDetails[idx].SGstAmount * $scope.stockentryDetails[idx].EntryQuantity)).toFixed(2));

                if ($scope.TotalNetAmount === null) {
                    $scope.TotalNetAmount = 0;
                }
                $scope.TotalNetAmount = parseFloat(($scope.TotalNetAmount + $scope.stockentryDetails[idx].NetAmount).toFixed(2));
            }

            $scope.item.TotalGrossAmount = $scope.TotalGrossAmount;
            $scope.item.TotalGstAmount = $scope.TotalGstAmount;
            $scope.item.TotalInGstAmount = $scope.TotalInGstAmount;
            $scope.item.TotalCGstAmount = $scope.TotalCGstAmount;
            $scope.item.TotalSGstAmount = $scope.TotalSGstAmount;
            $scope.item.TotalNetAmount = $scope.TotalNetAmount;
        }

        $scope.SelectedStore = function (selectedItem) {
            $scope.item.StoreName = selectedItem.Text;
            $scope.item.StockEntryTypeId = selectedItem.StoreMaster.StoreTypeId;
        };

        // $scope.deleteItemCallback = function (scope, data, options, hasError) {
        //     utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        // };

        // $scope.DeleteConfirmed = function (deleteId) {
        //     var options = {
        //         action: 'pharmacy/stockentry/GetStockEntrys',
        //         data: {
        //             Id: deleteId
        //         },
        //         type: 'post',
        //         onComplete: $scope.deleteItemCallback
        //     };
        //     utl.Http.doAction(options);
        //     $scope.backToList();
        // };

        // $scope.draftDelete = function () {
        //     utl.Dialog.confirmDelete($scope.DeleteConfirmed, $scope.currentcontext.id);
        // };

        vm.initialstockitemcontrolconfig = {
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
                // { header: 'Generic', field: 'GenericName', datatype: 'string', headercls: 'td-genericname', fieldcls: 'td-genericname' },
                // { header: 'Manufacturer', field: 'ManufacturerName', datatype: 'string', headercls: 'td-manufacturername', fieldcls: 'td-manufacturername' },
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
            // api: 'pharmacy/itemmaster/GetItemsForOpeningStock',
            api: 'pharmacy/itemmaster/GetStoreItemsForOpeningStockEntry',
            formatdisplay: formatselectedinitialstockitem,
            presearch: presearchinitialstockitem,
            postsearch: postsearchinitialstockitem
        };

        function formatselectedinitialstockitem() {
            $scope.autosearchpopup = 0;
            var selectedItem = vm.initialstockitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ItemName + ' (' + selectedItem.ItemCode + ')'].join('    ');
            } else if (vm.initialstockitemcontrolconfig.rowdata) {
                var StockEntryItemCode = vm.initialstockitemcontrolconfig.rowdata.ItemCode;
                if (vm.initialstockitemcontrolconfig.rowdata.ItemCode === "") {
                    StockEntryItemCode = vm.initialstockitemcontrolconfig.rowdata.ItemCode;
                } else {
                    StockEntryItemCode = ' (' + vm.initialstockitemcontrolconfig.rowdata.ItemCode + ')';
                }
                result = [vm.initialstockitemcontrolconfig.rowdata.ItemName, StockEntryItemCode].join(' ');
            }
            return result;
        }

        function presearchinitialstockitem() {

            var query = vm.initialstockitemcontrolconfig.query;
            // var inputData = {
            //     Params: [
            //         { Key: 11, Value: $scope.item.StoreMasterId },
            //         // { Key: 26, Value: [-1, utl.Session.getCurrentFacilityId()] },
            //         {
            //             Key: 3,
            //             Value: 2
            //         },
            //         // { Key: 8, Value: $scope.item.StockEntryTypeId }
            //     ],
            //     PageContext: {
            //         PageSize: 500,
            //         PageNumber: 1
            //     }
            // };

            // if (vm.initialstockitemcontrolconfig.searchbyid === true) {
            //     inputData.Params.push({
            //         Key: 0,
            //         Value: query
            //     });
            // } else if (query && query.length > 2) {
            //     inputData.Params.push({
            //         Key: 1,
            //         Value: query
            //     });
            // }
            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.item.StoreMasterId
                    },
                    // { Key: 26, Value: [-1, utl.Session.getCurrentFacilityId()] },
                    {
                        Key: 13, //ActiveStatus
                        Value: 2
                    },
                    // { Key: 8, Value: $scope.item.StockEntryTypeId }
                ],
                PageContext: {
                    PageSize: 500,
                    PageNumber: 1
                }
            };

            if (vm.initialstockitemcontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                if ($scope.itemexactsearch == true) {
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

            vm.initialstockitemcontrolconfig.searchparams = inputData;
        }

        function postsearchinitialstockitem() {
            $scope.autosearchpopup = 1;
            for (var idx in vm.initialstockitemcontrolconfig.result) {
                var item = vm.initialstockitemcontrolconfig.result[idx];
                item.ItemCode = item.ItemCode;
                item.ItemName = item.ItemName;
                // item.ItemPrice = item.ItemPrice;
                // if (item.ProductType !== null) {
                //     item.ProductTypeName = item.ProductType.ProductTypeName;
                // } else {
                //     item.ProductTypeName = '';
                // }
                // if (item.GenericName !== null) {
                //     item.GenericName = item.GenericName;
                // } else {
                //     item.GenericName = '';
                // }
                // if (item.ManufacturerName !== null) {
                //     item.ManufacturerName = item.ManufacturerName;
                // } else {
                //     item.ManufacturerName = '';
                // }
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
                // if (item.StockItem !== null) {
                //     item.StockInHand = item.StockItem.Quantity;
                // } else {
                //     item.StockInHand = 0;
                // }
                if (item.StockItem) {
                    item.StockInHand = item.StockItem.Quantity;
                } else {
                    if (item.ItemMaster) {
                        if (item.ItemMaster.StockItem) {
                            item.StockInHand = item.ItemMaster.StockItem.Quantity;
                        } else {
                            item.StockInHand = 0;
                        }
                    } else {
                        item.ManufacturerName = 0;
                    }
                }
            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.item.StoreMasterId === 0) {
                    $scope.item.StoreMasterId = value[0].Id;
                    $scope.item.StoreName = value[0].StoreMaster.StoreName;
                    $scope.item.StockEntryTypeId = value[0].StoreMaster.StoreTypeId;
                } else if (key == 'UserStores' && $scope.item.StoreMasterId > 0) {
                    for (var userstoreid = 0; userstoreid < $scope.lookup['UserStores'].length; userstoreid++) {
                        if ($scope.lookup['UserStores'][userstoreid].Id == $scope.item.StoreMasterId) {
                            $scope.item.StockEntryTypeId = $scope.lookup['UserStores'][userstoreid].StoreMaster.StoreTypeId;
                        }
                    }
                }
            });
        };

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "StockEntryType"
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
                            },
                            // { Key: 8, Value:? true }
                        ]
                    }
                },
                {
                    "Key": "StockEntryStatus"
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
                    var idx = $scope.stockentryDetails.length - 1;
                    nextId = "desc" + '' + idx;
                    if (idx == (index)) {
                        $('#comments').focus();
                    } else {
                        $timeout(function () {
                            $('#' + nextId).focus();
                        }, 100);
                    }
                } else if (nextId == 'qty') {
                    savehitcompleted = 0;
                    $scope.autosearchpopup = 0;
                    nextId = nextId + index;
                    $('#' + nextId).focus();
                } else if (nextId == 'batchid') {
                    nextId = nextId + index;
                    $('#' + nextId).focus();
                } else if (nextId == 'dispExpiryDate') {
                    nextId = nextId + index;
                    $('#' + nextId).focus();
                } else if (nextId == 'purprice') {
                    nextId = nextId + index;
                    $('#' + nextId).focus();
                } else if (nextId == 'mrp') {
                    nextId = nextId + index;
                    $('#' + nextId).focus();
                } else if (nextId == 'gst') {
                    nextId = nextId + index;
                    $('#' + nextId).focus();
                } else if (nextId == 'ingst') {
                    nextId = nextId + index;
                    $('#' + nextId).focus();
                } else if (nextId == 'cgst') {
                    nextId = nextId + index;
                    $('#' + nextId).focus();
                } else if (nextId == 'sgst') {
                    nextId = nextId + index;
                    $('#' + nextId).focus();
                }
            }
            if (event.key == "Delete" && event.keyCode == 46) {
                $scope.onDeleteConfirmed(item);
                $timeout(function () {
                    var idx = $scope.stockentryDetails.length - 1;
                    nextId = "desc" + '' + idx;
                    $('#' + nextId).focus();
                }, 10);
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

        $scope.ValidQty = function (nextId) {
            if ($('#' + nextId).val() === '')
                $('#' + nextId).val(0);
        };

        $scope.setCmbFocus = function (dom) {
            $timeout(function () {
                var uiSelect = angular.element(dom);
                var uichild = uiSelect.controller('uiSelect');
                uichild.activate();
                uichild.close();
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
                if (nextId == 'comments') {
                    $('#btnSaveandApprove').focus();
                }
            }
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

    OpeningStockEntryFormController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$timeout'];

})();