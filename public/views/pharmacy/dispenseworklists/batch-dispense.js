(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('batchdispenseController', batchdispenseController);

    function batchdispenseController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.GridItems = [];
        $scope.AvailableBatches = [];
        $scope.ItemBatchDetails = [];
        $scope.FinalSelectedBatches = [];
        $scope.AllBatchDetails = [];
        $scope.ItemBatchDetail = {};
        $scope.TotalIssueQty = 0;
        $scope.TotalIssueAmount = 0;
        $scope.item = {
            ItemDescription: '',
            StoreTypeId: 0,
            ExpiryWarningDays: 0,
            ExpiryPriorStopDays: 0
        };

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if ($scope.currentcontext.ismodal) {
            $scope.currentcontext.index = modalConfig.params.index;
            $scope.currentcontext.itemmasterid = modalConfig.params.itemmasterid;
            $scope.currentcontext.storemasterid = modalConfig.params.storemasterid;

            if (modalConfig.params.current_item) {
                $scope.item = modalConfig.params.current_item;
                $scope.item.ItemDescription = $scope.item.ItemName + ' ' + $scope.item.ItemCode;
            }

            if (modalConfig.params.grid_items) {
                $scope.GridItems = modalConfig.params.grid_items;
            }

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.numberonly = function (e) {
            if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
                (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                (e.keyCode >= 35 && e.keyCode <= 40)) {
                return;
            }

            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57))) {
                e.preventDefault();
            }
        };

        $scope.ValidateIssueQty = function (item) {
            if (parseInt(item.IssueQty) > 0) {
                if (parseInt(item.IssueQty) > parseInt(item.Quantity)) {
                    utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.quantityalert.lbl'));
                    item.IssueQty = 0;
                    $scope.TotalIssueQty = 0;
                    $scope.TotalIssueAmount = 0;
                    $scope.CalculateTotalIssueQty();
                    return false;
                } else {
                    item.TotalAmount = parseFloat((parseFloat(item.Mrp) * parseInt(item.IssueQty)).toFixed(2));
                    $scope.TotalIssueQty = 0;
                    $scope.TotalIssueAmount = 0;
                    $scope.CalculateTotalIssueQty();
                }
            } else if (parseInt(item.IssueQty) == 0) {
                item.TotalAmount = parseFloat((parseFloat(item.Mrp) * parseInt(item.IssueQty)).toFixed(2));
                $scope.TotalIssueQty = 0;
                $scope.TotalIssueAmount = 0;
                $scope.CalculateTotalIssueQty();
            } else if (item.IssueQty == "") {
                item.IssueQty = 0;
                $scope.TotalIssueQty = 0;
                $scope.TotalIssueAmount = 0;
                $scope.CalculateTotalIssueQty();
            }
        };

        $scope.CalculateTotalIssueQty = function () {
            $scope.TotalIssueQty = 0;
            if ($scope.ItemBatchDetails.length > 0) {
                for (var giid = 0; giid < $scope.ItemBatchDetails.length; giid++) {
                    $scope.TotalIssueQty = $scope.TotalIssueQty + parseInt($scope.ItemBatchDetails[giid].IssueQty);
                    $scope.TotalIssueAmount = $scope.TotalIssueAmount + parseInt($scope.ItemBatchDetails[giid].TotalAmount);
                }
            }
        };

        $scope.AvailableItemBatches = function () {
            $scope.AvailableBatches = $scope.item.BatchDetails;
            var ItemBatchDetail = {};
            var ExpiryDays = null;
            for (var batid = 0; batid < $scope.AvailableBatches.length; batid++) {
                ItemBatchDetail = {
                    BarCodeId: $scope.AvailableBatches[batid].BarCodeId,
                    BaseUomId: $scope.AvailableBatches[batid].BaseUomId,
                    BatchId: $scope.AvailableBatches[batid].BatchId,
                    CGstAmount: $scope.AvailableBatches[batid].CGstAmount,
                    CGstId: $scope.AvailableBatches[batid].CGstId,
                    CGstPercentage: $scope.AvailableBatches[batid].CGstPercentage,
                    CreatedAt: $scope.AvailableBatches[batid].CreatedAt,
                    CreatedBy: $scope.AvailableBatches[batid].CreatedBy,
                    Discount: $scope.AvailableBatches[batid].Discount,
                    DiscountAmount: $scope.AvailableBatches[batid].DiscountAmount,
                    DiscountModeId: $scope.AvailableBatches[batid].DiscountModeId,
                    ExpiryDate: $scope.AvailableBatches[batid].ExpiryDate,
                    FacilityId: $scope.AvailableBatches[batid].FacilityId,
                    GrnDetailId: $scope.AvailableBatches[batid].GrnDetailId,
                    GrnId: $scope.AvailableBatches[batid].GrnId,
                    GstAmount: $scope.AvailableBatches[batid].GstAmount,
                    GstId: $scope.AvailableBatches[batid].GstId,
                    GstPercentage: $scope.AvailableBatches[batid].GstPercentage,
                    Id: $scope.AvailableBatches[batid].Id,
                    InGstAmount: $scope.AvailableBatches[batid].InGstAmount,
                    InGstId: $scope.AvailableBatches[batid].InGstId,
                    InGstPercentage: $scope.AvailableBatches[batid].InGstPercentage,
                    IsExpiry: $scope.AvailableBatches[batid].IsExpiry,
                    IsSuspended: $scope.AvailableBatches[batid].IsSuspended,
                    IssueQty: 0,
                    TotalAmount: 0,
                    ItemCode: $scope.AvailableBatches[batid].ItemCode,
                    ItemMasterId: $scope.AvailableBatches[batid].ItemMasterId,
                    ItemName: $scope.AvailableBatches[batid].ItemName,
                    ManufacturerId: $scope.AvailableBatches[batid].ManufacturerId,
                    Mrp: $scope.AvailableBatches[batid].Mrp,
                    OrgId: $scope.AvailableBatches[batid].OrgId,
                    PurchasePrice: $scope.AvailableBatches[batid].PurchasePrice,
                    PurchasePriceAfterDiscount: $scope.AvailableBatches[batid].PurchasePriceAfterDiscount,
                    PurchaseUomId: $scope.AvailableBatches[batid].PurchaseUomId,
                    Quantity: $scope.AvailableBatches[batid].Quantity,
                    Rev: $scope.AvailableBatches[batid].Rev,
                    SGstAmount: $scope.AvailableBatches[batid].SGstAmount,
                    SGstId: $scope.AvailableBatches[batid].SGstId,
                    SGstPercentage: $scope.AvailableBatches[batid].SGstPercentage,
                    SaleUomId: $scope.AvailableBatches[batid].SaleUomId,
                    Status: $scope.AvailableBatches[batid].Status,
                    StockEntryDetailId: $scope.AvailableBatches[batid].StockEntryDetailId,
                    StockEntryId: $scope.AvailableBatches[batid].StockEntryId,
                    StockItemId: $scope.AvailableBatches[batid].StockItemId,
                    StoreMasterId: $scope.AvailableBatches[batid].StoreMasterId,
                    Ucp: $scope.AvailableBatches[batid].Ucp,
                    UnitCGstAmount: $scope.AvailableBatches[batid].UnitCGstAmount,
                    UnitGstAmount: $scope.AvailableBatches[batid].UnitGstAmount,
                    UnitInGstAmount: $scope.AvailableBatches[batid].UnitInGstAmount,
                    UnitSGstAmount: $scope.AvailableBatches[batid].UnitSGstAmount,
                    UomDiscountAmount: $scope.AvailableBatches[batid].UomDiscountAmount,
                    UomPrice: $scope.AvailableBatches[batid].UomPrice,
                    UomPriceAfterDiscount: $scope.AvailableBatches[batid].UomPriceAfterDiscount,
                    UpdatedAt: $scope.AvailableBatches[batid].UpdatedAt,
                    UpdatedBy: $scope.AvailableBatches[batid].UpdatedBy,
                    VendorMasterId: $scope.AvailableBatches[batid].VendorMasterId,
                    ExpiryAlert: false,
                    ExpiryStop: false,
                    ExpiryProceed: false
                }

                ExpiryDays = GetExpiryDays($scope.AvailableBatches[batid].ExpiryDate);
                if (ExpiryDays <= $scope.item.ExpiryPriorStopDays) {
                    ItemBatchDetail.ExpiryStop = true;
                } else if (ExpiryDays > $scope.item.ExpiryPriorStopDays && ExpiryDays <= $scope.item.ExpiryWarningDays) {
                    ItemBatchDetail.ExpiryAlert = true;
                } else {
                    ItemBatchDetail.ExpiryProceed = true;
                }

                if (ItemBatchDetail.ExpiryAlert) {
                    ItemBatchDetail.ExpiryDate = null;
                    ItemBatchDetail.ExpiryAlert = true;
                    ItemBatchDetail.ExpiryDate = $scope.AvailableBatches[batid].ExpiryDate;
                } else if (ItemBatchDetail.ExpiryStop) {
                    ItemBatchDetail.ExpiryDate = null;
                    ItemBatchDetail.ExpiryStop = true;
                    ItemBatchDetail.ExpiryDate = $scope.AvailableBatches[batid].ExpiryDate;
                } else {
                    ItemBatchDetail.ExpiryDate = null;
                    ItemBatchDetail.ExpiryProceed = true;
                    ItemBatchDetail.ExpiryDate = $scope.AvailableBatches[batid].ExpiryDate;
                }

                if ($scope.GridItems.length > 0) {
                    for (var gitemid = 0; gitemid < $scope.GridItems.length; gitemid++) {
                        if (ItemBatchDetail.ItemMasterId == $scope.GridItems[gitemid].ItemMasterId &&
                            ItemBatchDetail.Id == $scope.GridItems[gitemid].StockSerialItemId) {
                            ItemBatchDetail.IssueQty = $scope.GridItems[gitemid].Quantity;
                            ItemBatchDetail.TotalAmount = $scope.GridItems[gitemid].NetAmount;
                            $scope.TotalIssueQty = $scope.TotalIssueQty + parseInt($scope.GridItems[gitemid].Quantity);
                            $scope.TotalIssueAmount = $scope.TotalIssueAmount + parseInt($scope.GridItems[gitemid].NetAmount);
                        }
                    }
                }

                $scope.ItemBatchDetails.push(ItemBatchDetail);
            }
        };

        $scope.updateItemBatches = function () {
            var TotalReqQty = parseInt($scope.item.RequestedQuantity) - parseInt($scope.item.ReceivedQuantity);
            var TotalIssQty = 0;
            for (var idx in $scope.ItemBatchDetails) {
                if ($scope.ItemBatchDetails[idx].ItemMasterId > 0 && $scope.ItemBatchDetails[idx].IssueQty > 0) {
                    TotalIssQty = TotalIssQty + parseInt($scope.ItemBatchDetails[idx].IssueQty);
                }
            }

            if (TotalIssQty > TotalReqQty) {
                utl.Alert.showErrorMsg($translate.instant('billing.patientdispense-form.manualbatchdispense.lbl'));
                TotalIssQty = 0;
                return false;
            } else {
                for (var bidx in $scope.ItemBatchDetails) {
                    var batchdata = $scope.ItemBatchDetails[bidx];
                    if (batchdata.ItemMasterId > 0 && batchdata.IssueQty > 0) {
                        $scope.FinalSelectedBatches.push(batchdata);
                    }
                    if (batchdata.ItemMasterId > 0) {
                        $scope.AllBatchDetails.push(batchdata);
                    }
                }

                $scope.item.BatchDetails = $scope.FinalSelectedBatches;
                $scope.item.AllBatchDetails = $scope.AllBatchDetails;

                $scope.confirmCallback({
                    Index: $scope.currentcontext.index,
                    ItemMasterId: $scope.currentcontext.itemmasterid,
                    UpdatedItem: $scope.item
                });
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

        $scope.backToList = function () {
            $state.go('app.opbilling', { opbillingid: 0 });
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'StoreMaster') {
                    $scope.item.StoreTypeId = value[0].StoreTypeId;
                    $scope.item.ExpiryWarningDays = value[0].ExpiryWarningDays;
                    $scope.item.ExpiryPriorStopDays = value[0].ExpiryPriorStopDays;
                }
            });
            $scope.AvailableItemBatches();
        };

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "StoreMaster",
                    Request: {
                        Params: [
                            { Key: 0, Value: $scope.currentcontext.storemasterid }
                        ]
                    },
                    Default: false
                }
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };

            utl.Http.doAction(options);
        }

        $scope.initLookup();
    }

    batchdispenseController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];
})();