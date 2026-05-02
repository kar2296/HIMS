(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('StockAcceptenceFormforotherbranchController', StockAcceptenceFormforotherbranchController);

    function StockAcceptenceFormforotherbranchController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));
        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            ToFacilityId: -1,
            StoreMasterId: 0,
            // ToStoreMasterId: -1,
            StoreName: '',
            TransferTypeId: 1,
            FromStoreMasterId: -1,
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
            DisplayAcceptanceStatus: null
        };

        $scope.lookup = {};

        $scope.currentcontext = {
            id: -1
        };

        $scope.openAttachments = function () {
            utl.Modal.open('app.transferattachments', {
                params: { stocktransferid: 0, itemmasterid: 0 },
                confirmCallback: $scope.initLookup,
                cancelCallback: $scope.initLookup
            });
        };

        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.item.TransferDate = utl.Formatter.getCurrentDate();
        $scope.item.AcceptedDate = utl.Formatter.getCurrentDate();
        $scope.item.StoreName = '';
        $scope.stocktransferDetails = [];

        $scope.canShowPrintBtn = true;
        $scope.canShowCancelBtn = true;
        $scope.canShowAcceptBtn = true;

        $scope.applyVisibilityRules = function () {
            // Transferred, But Not yet Accepted
            if ($scope.item.TransferStatusId == 2 || $scope.item.TransferStatusId == 3) {
                if ($scope.item.AcceptanceStatusId == 1) {
                    $scope.canShowPrintBtn = false;
                    $scope.canShowCancelBtn = true;
                    $scope.canShowAcceptBtn = true;
                }
            }
            // Transferred and Either Accepted (or) Cancelled
            if ($scope.item.TransferStatusId == 2 || $scope.item.TransferStatusId == 3) {
                if ($scope.item.AcceptanceStatusId != 1) {
                    $scope.canShowPrintBtn = true;
                    $scope.canShowCancelBtn = false;
                    $scope.canShowAcceptBtn = false;
                }
            }
        };

        $scope.addNewLineItem = function () {
            var stocktransferDetail = {
                Id: 0,
                ItemMasterId: 0,
                ItemCode: '',
                ItemName: '',
                BaseUom: { Id: 0, UomCode: '' },
                BaseUomId: 0,
                PurchaseUomId: 0,
                RequestedQuantity: 0,
                TransferedQuantity: 0,
                AcceptedQuantity: 0,
                QuantityBeforeTransfer: 0,
                PurchasePrice: 0,
                DiscountModeId: 0,
                DiscountMode: '',
                ManufacturerName: '',
                DiscountAmount: 0,
                UnitDiscountAmount: 0,
                PurchasePriceAfterDiscount: 0,
                GstMaster: { Id: 0, GstCode: '', GstName: '', GstPercentage: '' },
                GstId: 0,
                GstPercentage: 0,
                GstAmount: 0,
                UnitGstAmount: 0,
                UnitCostPrice: 0,
                MrPrice: 0,
                GrossAmount: 0.00,
                NetAmount: 0.00,
                Status: 1,
                BatchDetails: [],
                BatchDetail: { Id: 0, StockItemId: 0, ItemMasterId: 0, StoreMasterId: 0, BatchId: '', Quantity: 0, ExpiryDate: null, Ucp: 0, Mrp: 0, SerialDetails: null },
                StockSerialItemId: 0,
                StockItemId: 0,
                StoreMasterId: 0,
                BatchId: '',
                Quantity: 0,
                ExpiryDate: '',
                Ucp: 0,
                Mrp: 0
            };

            if ($scope.currentcontext.id > 0) {
                stocktransferDetail.StockTransferId = $scope.currentcontext.id;
            }
            $scope.stocktransferDetails.push(stocktransferDetail);
        };

        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'pharmacy/StockTransfer/PrintStockTransfer',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.acceptanceprint = function () {
            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'pharmacy/StockTransfer/PrintStockAcceptance',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.backToList = function () {
            $state.go('app.stockacceptanceforotherbranch', $scope.currentcontext.id);
        };

        $scope.Stock = function (idx, selectedItem) {
            utl.Modal.open('app.acceptencestockdetails', {
                params: {
                    itemmasterid: selectedItem.ItemMasterId,
                    itemcode: selectedItem.ItemCode,
                    itemname: selectedItem.ItemName
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.History = function (idx, item) {
            utl.Modal.open('app.acceptencehistory', {
                params: {
                    vendormasterid: $scope.item.VendorMasterId,
                    storemasterid: $scope.item.StoreMasterId,
                    itemmasterid: item.ItemMasterId,
                    itemcode: item.ItemCode,
                    itemname: item.ItemName
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.getItem = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'pharmacy/stocktransfer/GetStockTransferById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.applyVisibilityRules();
            }
        };

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.item.StoreMasterId = $scope.item.StoreMasterId;
            $scope.item.ToStoreMasterId = $scope.item.ToStoreMasterId;
            $scope.item.StoreName = $scope.item.StoreName;
            if (data.TransferStatusId == 1) {
                $scope.item.isDisabled = false;
                $scope.item.DisplayTransferStatus = 'Draft';
            }
            if (data.TransferStatusId == 2) {
                $scope.item.isDisabled = true;
                $scope.item.DisplayTransferStatus = 'Approved';
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
            if (data.AcceptanceStatusId == 1) {
                $scope.item.DisplayAcceptanceStatus = 'Pending';
            }
            if (data.AcceptanceStatusId == 2) {
                $scope.item.DisplayAcceptanceStatus = 'Accepted';
            }
            if (data.AcceptanceStatusId == 3) {
                $scope.item.DisplayAcceptanceStatus = 'Cancelled';
            }

            $scope.applyVisibilityRules();
        };

        $scope.getStockTransferDetails = function (pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [
                        { Key: 1, Value: $scope.currentcontext.id }
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
            } else {
                $scope.addNewLineItem();
            }
        };

        $scope.getStockTransferDetailsCallback = function (scope, res, options, hasError) {
            $scope.stocktransferDetails = res.Data || [];
            for (var idx in $scope.stocktransferDetails) {
                var transferitem = $scope.stocktransferDetails[idx];
                if (transferitem.ItemMasterId > 0) {
                    var TransfBatchDetail = {
                        Id: 0,
                        StockItemId: 0,
                        ItemMasterId: 0,
                        StoreMasterId: 0,
                        BatchId: '',
                        Quantity: 0,
                        ExpiryDate: null,
                        Ucp: 0,
                        Mrp: 0,
                        SerialDetails: null
                    };
                    transferitem.BatchDetails = [];
                    TransfBatchDetail.BatchId = transferitem.BatchId;
                    transferitem.Ucp = transferitem.UnitCostPrice;
                    transferitem.Mrp = transferitem.MrPrice;
                    transferitem.BatchDetails.push(TransfBatchDetail);
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

            $scope.backToList();
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

        $scope.onCancelConfirmed = function () {
            $scope.item.TransferStatusId = 3;
            $scope.saveItem();
        };

        $scope.AcceptTransfer = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'inventory.stocktransfer.acceptmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onAcceptConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onAcceptConfirmed = function () {
            $scope.item.AcceptanceStatusId = 2;
            $scope.item.AcceptedBy = utl.Session.getCurrentUserId();
            $scope.item.AcceptedDate = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        };

        $scope.saveItem = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            if (checkMandatoryFields()) {
                var lines = getLinesForSave();
                var actionName = 'pharmacy/stocktransfer/AcceptStockTransfer';

                var inputData = { Header: $scope.item, Details: lines };
                var options = {
                    action: actionName,
                    data: { Data: inputData },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }
        };

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

        function getLinesForSave() {
            var result = [];
            for (var idx in $scope.stocktransferDetails) {
                var item = $scope.stocktransferDetails[idx];
                if (item.ItemMasterId > 0 && item.Status == 1) {
                    item.AcceptedQuantity = item.TransferedQuantity;
                    result.push(item);
                }
            }
            return result;
        }

        function loadData() {
            $scope.getItem();
            $scope.getStockTransferDetails();
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.item.StoreMasterId === 0) {
                    $scope.item.StoreMasterId = value[0].Id;
                }
            });
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "FromStore", Request: { Params: [{ Key: 7, Value: 2 }] } },
                { "Key": "TransferType" },
                { "Key": "TransferStatus" },
                { "Key": "ItemCategory" },
                {
                    "Key": "ToStore",
                    Request: {
                        Params: [
                            {
                                Key: 6,
                                Value: $scope.item.ToFacilityId,
                            },
                            {
                                Key: 7,
                                Value: 2
                            }
                        ]
                    },
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

    StockAcceptenceFormforotherbranchController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();