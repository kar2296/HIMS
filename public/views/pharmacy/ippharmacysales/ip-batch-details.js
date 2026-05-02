(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ippharmacybatchdetailsController', ippharmacybatchdetailsController);

    function ippharmacybatchdetailsController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.GridItems = [];
        $scope.AvailableBatches = [];
        $scope.ItemBatchDetails = [];
        $scope.FinalSelectedBatches = [];
        $scope.ItemBatchDetail = {};
        $scope.TotalIssueQty = 0;
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
                    $scope.CalculateTotalIssueQty();
                    return false;
                } else {
                    $scope.CalculateTotalIssueQty();
                }
            } else if (parseInt(item.IssueQty) == 0) {
                $scope.CalculateTotalIssueQty();
            } else if (item.IssueQty == "") {
                item.IssueQty = 0;
                $scope.CalculateTotalIssueQty();
            }
        };

        $scope.CalculateTotalIssueQty = function () {
            $scope.TotalIssueQty = 0;
            if ($scope.ItemBatchDetails.length > 0) {
                for (var giid = 0; giid < $scope.ItemBatchDetails.length; giid++) {
                    $scope.TotalIssueQty = $scope.TotalIssueQty + parseInt($scope.ItemBatchDetails[giid].IssueQty);
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
                            $scope.TotalIssueQty = $scope.TotalIssueQty + parseInt($scope.GridItems[gitemid].Quantity);
                        }
                    }
                }

                $scope.ItemBatchDetails.push(ItemBatchDetail);
            }
        };

        $scope.updateItemBatches = function () {
            for (var idx in $scope.ItemBatchDetails) {
                var batchdata = $scope.ItemBatchDetails[idx];
                if (batchdata.ItemMasterId > 0 && batchdata.IssueQty > 0) {
                    $scope.FinalSelectedBatches.push(batchdata);
                }
            }

            $scope.item.Amount = 0;
            $scope.item.BaseUomId = 0;
            $scope.item.Batch = false;
            $scope.item.BatchDetail = {};
            $scope.item.BatchDetails = $scope.FinalSelectedBatches;
            $scope.item.BatchId = "";
            $scope.item.BatchQuantity = 0;
            $scope.item.BillDateTime = utl.Formatter.getCurrentDate();
            $scope.item.CGstAmount = 0;
            $scope.item.CGstId = 0;
            $scope.item.CGstPercentage = 0;
            $scope.item.CNAmount = 0;
            $scope.item.CancelReason = 0;
            $scope.item.CancelledBy = 0;
            $scope.item.Comments = "";
            $scope.item.DepartmentId = 0;
            $scope.item.DiscountAmount = 0;
            $scope.item.DiscountAuthorizedBy = 0;
            $scope.item.DiscountModeId = 0;
            $scope.item.DiscountPercentage = 0;
            $scope.item.DiscountTypeId = 0;
            $scope.item.DoctorDiscountAmount = 0;
            $scope.item.DoctorId = 0;
            $scope.item.DoctorName = "";
            $scope.item.DoctorShare = 0;
            //$scope.item.DrugId = 0;
            //$scope.item.DrugName = "";
            $scope.item.EducationCess = 0;
            $scope.item.EncounterId = 0;
            $scope.item.EndDateTime = null;
            $scope.item.ExpiryAlert = false;
            $scope.item.ExpiryDate = "";
            $scope.item.ExpiryProceed = false;
            $scope.item.ExpiryStop = false;
            $scope.item.GSTAmount = 0;
            $scope.item.GSTId = 0;
            $scope.item.GSTPercentage = 0;
            //$scope.item.GenericId = 0;
            //$scope.item.GenericName = "";
            $scope.item.GrnDetailId = 0;
            $scope.item.GrnId = 0;
            $scope.item.GrossAmount = 0;
            $scope.item.GrossGSTAmount = 0;
            $scope.item.Id = 0;
            $scope.item.InGstAmount = 0;
            $scope.item.InGstId = 0;
            $scope.item.InGstPercentage = 0;
            $scope.item.IsBillable = 0;
            $scope.item.IsDoctorDiscount = 0;
            //$scope.item.IsFallUnderMinQty = true;
            $scope.item.IsGstDoctor = 0;
            $scope.item.IsModified = 0;
            $scope.item.IsPackageItem = 0;
            $scope.item.IsPharmacySale = 1;
            $scope.item.IsPrescribed = false;
            $scope.item.IsSupplimentary = 0;
            $scope.item.IsThisPrescription = false;
            //$scope.item.ItemCode = "";
            //$scope.item.ItemMasterId = 0;
            //$scope.item.ItemName = "";
            //$scope.item.ItemStoreMapId = 0;
            //$scope.item.ItemTypeId = 0;
            //$scope.item.ManufacturerId = 0;
            //$scope.item.ManufacturerName = "";
            //$scope.item.MasterItemId = 0;
            //$scope.item.MasterName = "";
            //$scope.item.MasterTypeId = 0;
            //$scope.item.MaxQty = 0;
            //$scope.item.MinQty = 0;
            $scope.item.MrPrice = 0;
            $scope.item.Mrp = 0;
            $scope.item.NetAmount = 0;
            $scope.item.NetAmountBeforeGST = 0;
            $scope.item.OrderDateTime = null;
            $scope.item.OrderDetailId = 0;
            $scope.item.OrderId = 0;
            $scope.item.OrderTypeId = 0;
            $scope.item.PackageId = 0;
            $scope.item.PackageName = "";
            $scope.item.PatientBillStatusId = 0;
            $scope.item.PrescriptionDetailId = 0;
            $scope.item.ProportionateDiscount = 0;
            $scope.item.PurchaseUomId = 0;
            //$scope.item.Quantity = 0;
            $scope.item.Rate = 0;
            $scope.item.RdoDiscount = true;
            $scope.item.RdoDiscountMode = true;
            $scope.item.RdoItemSearch = false;
            $scope.item.ReferalShare = 0;
            $scope.item.ReturnedQuantity = 0;
            $scope.item.SGstAmount = 0;
            $scope.item.SGstId = 0;
            $scope.item.SGstPercentage = 0;
            //$scope.item.SNo = 0;
            //$scope.item.SaleUomId = 0;
            //$scope.item.ScheduleTypeDescription = "";
            //$scope.item.ScheduleTypeId = 0;
            //$scope.item.SelectedBatchId = "";
            //$scope.item.SelectedItem = null;
            //$scope.item.ServiceCategoryId = 0;
            //$scope.item.ServiceCode = null;
            //$scope.item.ServiceGroupId = 0;
            $scope.item.ServiceId = -1;
            $scope.item.ServiceName = null;
            $scope.item.ServiceRateCategoryId = 0;
            $scope.item.ServiceRateCategoryName = "";
            $scope.item.ServiceTypeId = 0;
            $scope.item.StartDateTime = null;
            $scope.item.Status = 1;
            $scope.item.StockEntryDetailId = 0;
            $scope.item.StockEntryId = 0;
            //$scope.item.StockItemId = 0;
            //$scope.item.StockItemRev = 0;
            $scope.item.StockSerialItemId = 0;
            $scope.item.StockSerialItemRev = 0;
            //$scope.item.StoreMasterId = 0;
            //$scope.item.SubCategoryId = 0;
            $scope.item.TaxCode = "";
            //$scope.item.TotalQuantity = 0;
            $scope.item.Ucp = 0;
            $scope.item.UnitCGstAmount = 0;
            $scope.item.UnitCostPrice = 0;
            $scope.item.UnitDiscountAmount = 0;
            $scope.item.UnitGSTAmount = 0;
            $scope.item.UnitInGstAmount = 0;
            $scope.item.UnitPrice = 0;
            $scope.item.UnitProportionateDiscount = 0;
            $scope.item.UnitSGstAmount = 0;
            $scope.item.VendorMasterId = 0;
            //$scope.item.itemidxdesc = "desc2";
            //$scope.item.itemidxqty = "qty2";
            //$scope.item.tabindex = 3;

            $scope.confirmCallback({
                Index: $scope.currentcontext.index,
                ItemMasterId: $scope.currentcontext.itemmasterid,
                UpdatedItem: $scope.item
            });
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

    ippharmacybatchdetailsController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];
})();