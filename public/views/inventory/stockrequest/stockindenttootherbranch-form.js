(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('StockIndenttootherbranchFormController', StockIndenttootherbranchFormController);

    function StockIndenttootherbranchFormController($rootScope, $scope, $stateParams, $state, $translate, utl, $filter, $timeout) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        $scope.tabindexmap = {
            patienttabindex: 1,
            detailtabindex: 2
        };
        $scope.lookup = {};
        $scope.currentcontext = {
            id: -1
        };
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            ToFacilityId: -1,
            RequestedDate: utl.Formatter.getCurrentDate(),
            StockRequestTypeId: 1,
            ItemCategoryId: -1,
            StockPriorityId: 1,
            ToStoreMasterId: -1,
            StoreMasterId: 0,
            TotalGrossAmount: 0,
            TotalGstAmount: 0,
            TotalNetAmount: 0,
            isDisabled: false,
            RequestNumber: null,
            CanSeeToStoreQty: false,
            AllowOpenRequest: false
        };
        $scope.stockrequestDetails = [];
        $scope.applyVisibilityRules = function () {
            // New
            if ($scope.item.RequestStatusId != 1 || $scope.item.RequestStatusId != 2 || $scope.item.RequestStatusId != 3 || $scope.item.RequestStatusId != 4 || $scope.item.RequestStatusId != 5) {
                $scope.canShowPrintBtn = false;
                $scope.canShowSaveBtn = true;
                $scope.canShowSaveandApproveBtn = true;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowClearBtn = true;
                $scope.canShowHistoryBtn = false;
                $scope.canShowCancelBtn = false;
            }
            // When In Draft Status
            if ($scope.item.RequestStatusId == 1) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = true;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowHistoryBtn = true;
                $scope.canShowCancelBtn = true;
            }
            // When In Approved Status
            if ($scope.item.RequestStatusId == 2) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowAuthorizeBtn = true;
                $scope.canShowClearBtn = false;
                $scope.canShowHistoryBtn = true;
                $scope.canShowCancelBtn = true;
            }
            // When In Authorized Status
            if ($scope.item.RequestStatusId == 3) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowHistoryBtn = true;
                $scope.canShowCancelBtn = true;
            }
            // When In Completed Status
            if ($scope.item.RequestStatusId == 4) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowHistoryBtn = true;
                $scope.canShowCancelBtn = false;
            }
            // When In Cancelled Status
            if ($scope.item.RequestStatusId == 5) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowHistoryBtn = true;
                $scope.canShowCancelBtn = false;
            }
            if ($scope.item.RequestStatusId == 6) {
                $scope.canShowPrintBtn = true;
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowAuthorizeBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowHistoryBtn = true;
                $scope.canShowCancelBtn = false;
            }
        };
        $scope.addNewLineItem = function () {
            var stockrequestDetail = {
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
                RequestedQuantity: 0,
                QuantityOnHand: 0,
                PurchasePrice: 0,
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
                UnitCostPrice: 0.00,
                GrossAmount: 0.00,
                NetAmount: 0.00,
                Status: 1,
                tabindex: $scope.tabindexmap.detailtabindex++

            };

            if ($scope.currentcontext.id > 0) {
                stockrequestDetail.StockRequestId = $scope.currentcontext.id;
            }
            $scope.stockrequestDetails.push(stockrequestDetail);
            $scope.setIndexforTableIndex();
        };
        $scope.setIndexforTableIndex = function () {
            var SNo = 1;
            for (var idx in $scope.stockrequestDetails) {
                if ($scope.stockrequestDetails[idx].Status == 1) {
                    $scope.stockrequestDetails[idx].SNo = SNo;
                    SNo++;
                }
            }
        };
        $scope.addNew = function () {
            if ($stateParams.id > 0)
                $state.go('app.stockrequest', {
                    id: 0,
                    StockRequestId: 0
                });
            else
                $state.reload();
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.addnewclear = function () {
            $scope.stockrequestDetails = [];
            $scope.addNewLineItem();
            $scope.item = {
                FacilityId: utl.Session.getCurrentFacilityId(),
                PrTypeId: 1,
                VendorMasterId: '',
                ToStoreMasterId: -1,
                StoreMasterId: utl.Session.getCurrentUserId(),
            };
        };
        $scope.add_new = function () {
            utl.Modal.open('app.stockrequestdetail', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.onDetailSave
            });
        };
        $scope.Clear = function () {
            $scope.item = {};
        };
        $scope.History = function (item, idx) {
            if (item.ItemMasterId > 0) {
                utl.Modal.open('app.strequesthistory', {
                    params: {
                        storemasterid: $scope.item.StoreMasterId,
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
                utl.Modal.open('app.stockrequestdetails', {
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
        $scope.deleteStockRequestDetail = function (idx, item) {
            if (item.ItemMasterId > 0) {
                var name = "this item" || '';
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
            } else {
                utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.emptyrowmsg.lbl'));
            }
        };
        $scope.onDeleteConfirmed = function (item) {
            item.Status = 2;

            $scope.TotalGrossAmount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalNetAmount = 0;

            $scope.item.TotalGrossAmount = 0;
            $scope.item.TotalGstAmount = 0;
            $scope.item.TotalNetAmount = 0;
            $scope.item.TotalAmount = 0;

            calculatetotalAmount();

            $scope.setIndexforTableIndex();
        };
        $scope.onDetailSave = function (itemFromModal) {
            var isaddnew = true;
            for (var idx in $scope.stockrequestDetails) {
                var item = $scope.stockrequestDetails[idx];
                if (item.currenteditable) {
                    item = itemFromModal;
                    item.currenteditable = false;
                    isaddnew = false;
                }
            }
            if (isaddnew) {
                itemFromModal.Status = 1;
                if ($scope.currentcontext.id > 0) {
                    itemFromModal.StockRequestId = $scope.currentcontext.id;
                }
                $scope.stockrequestDetails.push(itemFromModal);
            }
        };
        $scope.getStockRequestDetailsCallback = function (scope, res, options, hasError) {
            $scope.stockrequestDetails = res.Data || [];
            for (var idx in $scope.stockrequestDetails) {
                var sritem = $scope.stockrequestDetails[idx];
                if (sritem.ItemMasterId > 0) {
                    sritem.GstCode = sritem.GstMaster.GstCode;
                }
            }

            if ($scope.item.RequestStatusId == 1) {
                $scope.addNewLineItem();
            }

            $scope.setIndexforTableIndex();
        };
        $scope.getStockRequestDetails = function (pageNo) {
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
                    action: 'pharmacy/stockrequestdetail/GetStockRequestDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getStockRequestDetailsCallback
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
                action: 'pharmacy/stockrequest/PrintStockRequest',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };
        $scope.getItemCallback = function (scope, data, options, hasError) {
            // for (var idx in data.Data) {
            //     var item = data.Data[idx];

            //     item.TotalNetAmount = parseFloat(item.TotalNetAmount).toFixed(2);
            //     vm.gridConfig.data.push(item);
            // }

            $scope.item = data;

            if (data.RequestStatusId == 1) {
                $scope.item.isDisabled = false;
                $scope.item.DisplayRequestStatus = 'Draft';
            }

            if (data.RequestStatusId == 2) {
                $scope.item.isDisabled = true;
                $scope.item.DisplayRequestStatus = 'Approved';
            }

            if (data.RequestStatusId == 3) {
                $scope.item.isDisabled = true;
                $scope.item.isDisabledComments = true;
                $scope.item.DisplayRequestStatus = 'Authorized';
            }

            if (data.RequestStatusId == 6) {
                $scope.item.isDisabled = true;
                $scope.item.DisplayRequestStatus = 'Cancelled';
            }


            $scope.applyVisibilityRules();
        };
        $scope.getItem = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'pharmacy/stockrequest/GetStockRequestById',
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
        $scope.history = function (HistoryId) {
            utl.Modal.open('app.srhistory', {});
        };
        $scope.clearItem = function () {
            $scope.item = {};
            $scope.fillDefaultValues();
        };
        $scope.SelectedFromStore = function (selectedItem) {
            if ($scope.item.ToStoreMasterId == selectedItem.Id) {
                $scope.item.StoreMasterId = -1;
                utl.Alert.showErrorMsg($translate.instant('inventory.stockrequestform.requestsamestoremsg.lbl'));
                return false;
            } else {
                $scope.stockrequestDetails = [];
                $scope.addNewLineItem();
                $scope.item.StoreMasterId = selectedItem.Id;
                $scope.item.StoreName = selectedItem.StoreName;
                $scope.item.ItemCategoryId = selectedItem.StoreMaster.StoreTypeId;
                $scope.item.CanSeeToStoreQty = selectedItem.StoreMaster.CanSeeToStoreQty;
                $scope.item.AllowOpenRequest = selectedItem.StoreMaster.AllowOpenRequest;
                $scope.SetStockReqControlConfig();
            }
        };
        $scope.SelectedToStore = function (selectedItem) {
            if ($scope.item.StoreMasterId == selectedItem.Id) {
                $scope.item.ToStoreMasterId = -1;
                utl.Alert.showErrorMsg($translate.instant('inventory.stockrequestform.requestsamestoremsg.lbl'));
                return false;
            } else {
                if (!$scope.item.AllowOpenRequest) {
                    $scope.stockrequestDetails = [];
                    $scope.addNewLineItem();
                }
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
            $state.go('app.stockindenttootherbranch', $scope.currentcontext.id);
        };
        $scope.SaveandDraft = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'inventory.stockrequest.savemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandDraftConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };
        $scope.onSaveandDraftConfirmed = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.RequestStatusId = 1;
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
                messageKey: 'inventory.stockrequest.approvemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandApproveConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };
        $scope.onSaveandApproveConfirmed = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            if ($scope.item.RequestStatusId == 1) {

            } else {
                $scope.item.RequestedBy = utl.Session.getCurrentUserId();
                $scope.item.RequestedDate = utl.Formatter.getCurrentDate();
            }
            $scope.item.RequestStatusId = 2;
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
                messageKey: 'inventory.stockrequest.authorizemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSaveandAuthorizeConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };
        $scope.onSaveandAuthorizeConfirmed = function () {
            $scope.item.RequestStatusId = 3;
            $scope.item.AuthorizedBy = utl.Session.getCurrentUserId();
            $scope.item.AuthorizedDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };
        $scope.onComplete = function () {
            $scope.item.RequestStatusId = 4;
            $scope.saveItem();
        };
        $scope.Cancel = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'inventory.stockrequest.cancelmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onCancelConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };
        $scope.onCancelConfirmed = function () {
            $scope.item.RequestStatusId = 6;
            $scope.item.CancelledBy = utl.Session.getCurrentUserId();
            $scope.item.CancelledDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };
        $scope.saveItem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            if (checkMandatoryFields()) {

                var lines = getLinesForSave();

                var actionName = 'pharmacy/stockrequest/AddStockRequest';
                if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                    actionName = 'pharmacy/stockrequest/UpdateStockRequest';
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
            if ($scope.stockrequestDetails.length > 1) {
                for (var iddx in $scope.stockrequestDetails) {
                    var iddxitem = $scope.stockrequestDetails[iddx];
                    if (iddxitem.ItemMasterId > 0 && iddxitem.Status == 1) {
                        if (iddxitem.ItemMasterId > 0 && iddxitem.RequestedQuantity <= 0) {
                            utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.enterqtymsg.lbl') + iddxitem.ItemName);
                            return false;
                        }
                        // if (iddxitem.ItemMasterId > 0 && iddxitem.PurchasePrice <= 0) {
                        //     utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.pricegreaterzeromsg.lbl') + iddxitem.ItemName);
                        //     return false;
                        // }
                    }
                }
            } else if ($scope.stockrequestDetails.length == 1) {
                for (var idddx in $scope.stockrequestDetails) {
                    var idddxitem = $scope.stockrequestDetails[idddx];
                    if (idddxitem.ItemMasterId > 0) {
                        if (idddxitem.RequestedQuantity <= 0) {
                            utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.enterqtymsg.lbl') + idddxitem.ItemName);
                            return false;
                        }
                        // if (idddxitem.PurchasePrice <= 0) {
                        //     utl.Alert.showErrorMsg($translate.instant('inventory.openingstockentry.pricegreaterzeromsg.lbl') + idddxitem.ItemName);
                        //     return false;
                        // }
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
            for (var idx in $scope.stockrequestDetails) {
                var item = $scope.stockrequestDetails[idx];
                if (item.ItemMasterId > 0 && item.Status == 1) {
                    result.push(item);
                }
            }
            return result;
        }

        function loadData() {
            $scope.getItem();
            $scope.getStockRequestDetails();
        }
        $scope.onItemSelected = function (idx, selectedItem) {
            var isDuplicate = utl.Common.isDuplicateRec($scope.stockrequestDetails, {
                pivotkey: 'ItemMasterId',
                displaykey: 'ItemName'
            });
            if (isDuplicate) {
                item.ItemMasterId = '';
                item.ItemName = '';
                return;
            }
            var SelectedMasterItem = selectedItem.SelectedItem;
            if ($scope.item.AllowOpenRequest) {
                selectedItem.ItemMasterId = SelectedMasterItem.ItemMasterId;
                selectedItem.ItemCode = SelectedMasterItem.ItemCode;
                selectedItem.ItemName = SelectedMasterItem.ItemName;
                selectedItem.StoreMasterId = SelectedMasterItem.StoreMasterId;
                selectedItem.ToStoreMasterId = SelectedMasterItem.ToStoreMasterId;
                selectedItem.StoreName = SelectedMasterItem.StoreName;
                selectedItem.QuantityOnHand = SelectedMasterItem.ToStoreQty;

                if (SelectedMasterItem.ItemMaster.StockItem !== null)
                    selectedItem.QuantityOnHand = SelectedMasterItem.ToStoreQty;
                else
                    selectedItem.QuantityOnHand = 0;
                selectedItem.BaseUom.Id = SelectedMasterItem.ItemMaster.UomMaster.Id;
                selectedItem.BaseUomId = SelectedMasterItem.ItemMaster.UomMaster.Id;
                selectedItem.PurchaseUomId = SelectedMasterItem.ItemMaster.UomMaster.Id;
                selectedItem.BaseUom.UomCode = SelectedMasterItem.ItemMaster.UomMaster.UomCode;
                selectedItem.PurchasePrice = parseFloat(SelectedMasterItem.ItemMaster.ItemPrice.toFixed(2));
                selectedItem.GstId = SelectedMasterItem.ItemMaster.GstId;
                selectedItem.GstCode = SelectedMasterItem.ItemMaster.GstMaster.GstCode;
                selectedItem.GstAmount = parseFloat(((SelectedMasterItem.ItemMaster.ItemPrice / 100) * SelectedMasterItem.ItemMaster.GstMaster.GstPercentage).toFixed(2));
                selectedItem.UnitCostPrice = parseFloat((selectedItem.PurchasePrice + selectedItem.GstAmount).toFixed(2));

                var StkReqLineDetails = [];
                for (var srqldid = 0; srqldid < $scope.stockrequestDetails.length; srqldid++) {
                    var StkReqLineDetail = $scope.stockrequestDetails[srqldid];
                    if (StkReqLineDetail.Status == 1) {
                        StkReqLineDetails.push(StkReqLineDetail);
                    }
                }

                var lastIndex = StkReqLineDetails.length - 1;
                if (idx == lastIndex) {
                    $scope.addNewLineItem();
                }
            } else {
                if (SelectedMasterItem.ItemMaster) {
                    // if (SelectedMasterItem.ItemMaster.ToStoreStock) {
                    // if (SelectedMasterItem.ItemMaster.ToStoreStock.Quantity > 0) {
                    selectedItem.ItemMasterId = SelectedMasterItem.ItemMasterId;
                    selectedItem.ItemCode = SelectedMasterItem.ItemCode;
                    selectedItem.ItemName = SelectedMasterItem.ItemName;
                    selectedItem.StoreMasterId = SelectedMasterItem.StoreMasterId;
                    selectedItem.ToStoreMasterId = SelectedMasterItem.ToStoreMasterId;
                    selectedItem.StoreName = SelectedMasterItem.StoreName;

                    if (SelectedMasterItem.ItemMaster.StockItem !== null)
                        selectedItem.QuantityOnHand = SelectedMasterItem.ItemMaster.StockItem.Quantity;
                    else
                        selectedItem.QuantityOnHand = 0;
                    selectedItem.BaseUom.Id = SelectedMasterItem.ItemMaster.UomMaster.Id;
                    selectedItem.BaseUomId = SelectedMasterItem.ItemMaster.UomMaster.Id;
                    selectedItem.PurchaseUomId = SelectedMasterItem.ItemMaster.UomMaster.Id;
                    selectedItem.BaseUom.UomCode = SelectedMasterItem.ItemMaster.UomMaster.UomCode;
                    selectedItem.PurchasePrice = parseFloat(SelectedMasterItem.ItemMaster.ItemPrice.toFixed(2));
                    selectedItem.GstId = SelectedMasterItem.ItemMaster.GstId;
                    selectedItem.GstCode = SelectedMasterItem.ItemMaster.GstMaster.GstCode;
                    selectedItem.GstAmount = parseFloat(((SelectedMasterItem.ItemMaster.ItemPrice / 100) * SelectedMasterItem.ItemMaster.GstMaster.GstPercentage).toFixed(2));
                    selectedItem.UnitCostPrice = parseFloat((selectedItem.PurchasePrice + selectedItem.GstAmount).toFixed(2));

                    var StkReqLineDetails = [];
                    for (var srqldid = 0; srqldid < $scope.stockrequestDetails.length; srqldid++) {
                        var StkReqLineDetail = $scope.stockrequestDetails[srqldid];
                        if (StkReqLineDetail.Status == 1) {
                            StkReqLineDetails.push(StkReqLineDetail);
                        }
                    }

                    var lastIndex = StkReqLineDetails.length - 1;
                    if (idx == lastIndex) {
                        $scope.addNewLineItem();
                    }
                    // } else {
                    //     selectedItem.Status = 2;
                    //     $scope.addNewLineItem();
                    //     utl.Alert.showErrorMsg($translate.instant('inventory.stockrequest.tostorestockzeroalertmsg.lbl'));
                    //     return false;
                    // }
                    // } 
                    // else {
                    //     selectedItem.Status = 2;
                    //     $scope.addNewLineItem();
                    //     utl.Alert.showErrorMsg($translate.instant('inventory.stockrequest.tostorestocknotavailablealertmsg.lbl'));
                    //     return false;
                    // }
                } else {
                    selectedItem.Status = 2;
                    $scope.addNewLineItem();
                    utl.Alert.showErrorMsg($translate.instant('inventory.stockrequest.noiteminfoalertmsg.lbl'));
                    return false;
                }
            }
        };
        $scope.computeAmount = function (item) {
            if (item.RequestedQuantity > 0) {
                // if (parseInt(item.RequestedQuantity) > item.QuantityOnHand) {
                //     item.TransferedQuantity = 0;
                //     utl.Alert.showErrorMsg($translate.instant('inventory.stockadjustmentform.qtygreateravailqty.lbl'));
                //     return false;
                // }

                item.GrossAmount = item.PurchasePrice * item.RequestedQuantity;
                item.NetAmount = item.UnitCostPrice * item.RequestedQuantity;
            }

            $scope.TotalGrossAmount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalNetAmount = 0;

            calculatetotalAmount();
        };

        function calculatetotalAmount() {
            for (var idx in $scope.stockrequestDetails) {
                if ($scope.stockrequestDetails[idx].Status == 1) {
                    if ($scope.TotalGrossAmount === null) {
                        $scope.TotalGrossAmount = 0;
                    }
                    $scope.TotalGrossAmount = parseFloat(($scope.TotalGrossAmount + $scope.stockrequestDetails[idx].GrossAmount).toFixed(2));

                    if ($scope.TotalGstAmount === null) {
                        $scope.TotalGstAmount = 0;
                    }
                    $scope.TotalGstAmount = parseFloat(($scope.TotalGstAmount + ($scope.stockrequestDetails[idx].GstAmount * $scope.stockrequestDetails[idx].RequestedQuantity)).toFixed(2));

                    if ($scope.TotalNetAmount === null) {
                        $scope.TotalNetAmount = 0;
                    }
                    $scope.TotalNetAmount = parseFloat(($scope.TotalNetAmount + $scope.stockrequestDetails[idx].NetAmount).toFixed(2));
                }
            }

            $scope.item.TotalGrossAmount = $scope.TotalGrossAmount;
            $scope.item.TotalGstAmount = $scope.TotalGstAmount;
            $scope.item.TotalNetAmount = $scope.TotalNetAmount;
            $scope.item.TotalAmount = $scope.TotalNetAmount;
        }
        $scope.amountConversion = function (amount) {
            return parseFloat(amount).toFixed(2);
        };
        $scope.SetStockReqControlConfig = function () {
            vm.stockrequestcontrolconfig = {
                query: '',
                searchbyid: false,
                options: $scope.item.CanSeeToStoreQty ? [{
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
                    },
                    // {
                    //     header: 'Product Name',
                    //     field: 'ProductTypeName',
                    //     datatype: 'string',
                    //     headercls: 'td-producttypename',
                    //     fieldcls: 'td-producttypename'
                    // },
                    { header: 'Generic', field: 'GenericName', datatype: 'string', headercls: 'td-genericname', fieldcls: 'td-genericname' },
                    // { header: 'Manufacturer', field: 'ManufacturerName', datatype: 'string', headercls: 'td-manufacturername', fieldcls: 'td-manufacturername' }
                ] : [{
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
                    },
                    // {
                    //     header: 'Product Name',
                    //     field: 'ProductTypeName',
                    //     datatype: 'string',
                    //     headercls: 'td-producttypename',
                    //     fieldcls: 'td-producttypename'
                    // },
                    {
                        header: 'Generic',
                        field: 'GenericName',
                        datatype: 'string',
                        headercls: 'td-genericname',
                        fieldcls: 'td-genericname'
                    },
                    // {
                    //     header: 'Manufacturer',
                    //     field: 'ManufacturerName',
                    //     datatype: 'string',
                    //     headercls: 'td-manufacturername',
                    //     fieldcls: 'td-manufacturername'
                    // }
                ],
                searchparams: {},
                result: {},
                api: 'pharmacy/itemmaster/GetItemStoreMaps',
                formatdisplay: formatselectedstockrequestitem,
                presearch: presearchstockrequestitem,
                postsearch: postsearchstockrequestitem
            };
        };

        function formatselectedstockrequestitem() {
            var selectedItem = vm.stockrequestcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ItemName + ' (' + selectedItem.ItemCode + ')'].join(' ');
            } else if (vm.stockrequestcontrolconfig.rowdata) {
                result = [vm.stockrequestcontrolconfig.rowdata.ItemCode, vm.stockrequestcontrolconfig.rowdata.ItemName, vm.stockrequestcontrolconfig.rowdata.ProductTypeName].join(' ');
            }
            return result;
        }

        function presearchstockrequestitem() {
            var query = vm.stockrequestcontrolconfig.query;
            var inputData = {
                Params: [{
                        Key: 11,
                        Value: $scope.item.StoreMasterId
                    },
                    {
                        Key: 4,
                        Value: 1
                    },
                    {
                        Key: 1,
                        Value: $scope.item.ToStoreMasterId
                    },
                    {
                        Key: 13,
                        Value: 2
                    }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            if (vm.stockrequestcontrolconfig.searchbyid === true) {
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

            vm.stockrequestcontrolconfig.searchparams = inputData;
        }

        function postsearchstockrequestitem() {
            for (var idx in vm.stockrequestcontrolconfig.result) {
                var item = vm.stockrequestcontrolconfig.result[idx];
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
                    item.MyStoreQty = item.ItemMaster.StockItem.Quantity;
                } else {
                    item.MyStoreQty = 0;
                }
                if (item.ItemMaster.ToStoreStock !== null) {
                    item.ToStoreQty = item.ItemMaster.ToStoreStock.Quantity;
                } else {
                    item.ToStoreQty = 0;
                }
            }
        }
        $scope.SetStockReqControlConfig();
        $scope.getfacilitystore = function () {
            $scope.item.ToStoreMasterId = -1;
            if ($scope.item.ToFacilityId > 0) {
                var inputData = [{
                    "Key": "ToStore",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: 2
                        }, {
                            Key: 6,
                            Value: $scope.item.ToFacilityId
                        }, ]
                    }
                }];
                $scope.getLookUp(inputData);
            }
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.item.StoreMasterId === 0) {
                    $scope.item.StoreMasterId = value[0].Id;
                    $scope.item.StoreName = value[0].StoreName;
                    $scope.item.ItemCategoryId = value[0].StoreMaster.StoreTypeId;
                    $scope.item.CanSeeToStoreQty = value[0].StoreMaster.CanSeeToStoreQty;
                    $scope.item.AllowOpenRequest = value[0].StoreMaster.AllowOpenRequest;
                    $scope.SetStockReqControlConfig();
                } else if (key == 'UserStores' && $scope.item.StoreMasterId > 0) {
                    for (var userstoreid = 0; userstoreid < $scope.lookup['UserStores'].length; userstoreid++) {
                        if ($scope.lookup['UserStores'][userstoreid].Id == $scope.item.StoreMasterId) {
                            $scope.item.ItemCategoryId = $scope.lookup['UserStores'][userstoreid].StoreMaster.StoreTypeId;
                        }
                    }
                }
            });
        };
        $scope.lookupCall = function (inputData) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,

                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };
        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "Facility"
                },
                {
                    "Key": "StockRequestType"
                },
                {
                    "Key": "ItemCategory"
                },
                {
                    "Key": "StockPriority"
                },
                {
                    "Key": "Remark",
                    Request: {
                        Params: [{
                                Key: 3,
                                Value: 9
                            },
                            {
                                Key: 5,
                                Value: 2
                            }
                        ]
                    }
                },
                {
                    "Key": "ToStore",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: 2
                        }, {
                            Key: 6,
                            Value: $scope.item.ToFacilityId
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

    StockIndenttootherbranchFormController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$timeout'];

})();