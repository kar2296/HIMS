

(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('customersalesController', customersalesController);


    function customersalesController($scope, $interval, $stateParams, $state, $translate, utl, $filter, modalConfig, $timeout) {
        var vm = this;
        var savehitcompleted = 0; // to avoid duplication save option
        $scope.autosearchpopup = 0;

        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));
        angular.extend(this, utl.Ctrl.getDMPrintDataController({ $scope: $scope }));

        $scope.SelectedIndex = -1;
        $scope.dmprintpreferences = 0;
        $scope.printpreferences = 1;
        $scope.CustomerBillInfo = [];
        $scope.DeletedCustomerBills = [];
        $scope.CustomerBillDetails = [];

        $scope.selectedCustomer = {};
        $scope.itemUsedBatches = {};

        $scope.SaveImdDMPrint = 0;

        $scope.tabindexmap = {
            customertabindex: 1,
            detailtabindex: 2
        };
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.item = {
            CustomerMasterId: -1,
            CustomerName: '',
            GSTNumber: '',
            BillDate: utl.Formatter.getCurrentDate(),
            BillNumber: '',
            StoreMasterId: 0,
            StoreName: '',
            StoreTypeId: 0,
            DepartmentId: -1,
            DepartmentName: '',
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: '',
            CustomerBillStatusId: 1,
            CustomerBillStatus: null,
            GrossAmount: 0,
            DiscountTypeId: 0,
            DiscountModeId: 0,
            DiscountValue: 0,
            DiscountAmount: 0,
            DiscountApprovedBy: 0,
            LineTotalDiscount: 0,
            GstAmount: 0,
            NetAmount: 0,
            ProfitAmount: 0,
            NetAmountBeforeGst: 0,
            ExpiryWarningDays: 0,
            ExpiryPriorStopDays: 0,
            RdoCustomerMasterId: false,
            RdoStoreMasterId: false,
        };

        $scope.currentcontext = {
            id: 0,
            ApprovedById: -1,
            CustomerBillStatusId: 1,
            StatusId: 1
        };

        if ($stateParams.id && $stateParams.id > 0) {
            $scope.item.CustomerMasterId = parseInt($stateParams.id);
        }

        $scope.StoreChange = function (SelectedStore) {
            $scope.item.StoreTypeId = SelectedStore.StoreMaster.StoreTypeId;
            if ($scope.CustomerBillDetails.length > 1)
                $scope.clear();
        };

        $scope.applyVisibilityRules = function () {
            if ($scope.item.CustomerBillStatusId == 1) {
                $scope.canShowSaveBtn = true;
                $scope.canShowSaveapproveBtn = true;
                $scope.canShowClearBtn = true;
                $scope.canShowCancelBtn = false;
                $scope.HidePrintBtn = true;
            }
            if ($scope.item.CustomerBillStatusId == 2) {
                $scope.canShowSaveBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowSaveapproveBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.HidePrintBtn = false;
            }
            if ($scope.item.CustomerBillStatusId == 3) {
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveapproveBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = true;
                $scope.HidePrintBtn = false;
            }
        };

        $scope.alternateDetails = function (idx, item) {
            utl.Modal.open('app.pharmacyalternates', {
                params: {
                    genericid: item.GenericId,
                    itemmasterid: item.ItemMasterId,
                    storemasterid: item.StoreMasterId,
                    itemcode: item.ItemCode,
                    itemname: item.ItemName
                },
                confirmCallback: $scope.getList
            });
        };
        $scope.backtoList = function () {
            $state.go('app.storedashboard');
        }
        $scope.setIndexforTableIndex = function () {
            var SNo = 1;
            for (var idx in $scope.CustomerBillDetails) {
                if ($scope.CustomerBillDetails[idx].Status == 1) {
                    $scope.CustomerBillDetails[idx].SNo = SNo;
                    $scope.CustomerBillDetails[idx].itemidxdesc = 'desc' + (SNo - 1);
                    $scope.CustomerBillDetails[idx].itemidxqty = 'qty' + (SNo - 1);
                    SNo++;
                }
            }
        };

        $scope.addNewLineItem = function () {
            var lastIndex = $scope.CustomerBillDetails.length - 1;
            if (lastIndex >= 0) {
                if ($scope.CustomerBillDetails[lastIndex].ItemMasterId == -1)
                    return false;
            }
            var CustomerBillDetail = {
                Id: 0,
                SNo: 0,
                BillDateTime: utl.Formatter.getCurrentDate(),
                CustomerBillStatusId: 0,
                ItemMasterId: -1,
                ItemCode: '',
                ItemName: '',
                DrugId: 0,
                DrugCode: '',
                DrugName: '',
                CategoryId: 0,
                SubCategoryId: 0,
                ProductTypeId: 0,
                SubProductTypeId: 0,
                BaseUomId: 0,
                PurchaseUomId: 0,
                ConversionQuantity: 0,
                SaleUomId: 0,
                ConversionQty: 0,
                GenericId: 0,
                GenericName: '',
                ManufacturerId: 0,
                ManufacturerName: '',
                ScheduleTypeId: 0,
                ScheduleTypeDescription: '',
                OrganizationId: 0,
                FacilityId: 0,
                DepartmentId: 0,
                StoreMasterId: 0,
                StockItemId: 0,
                StockSerialItemId: 0,
                Quantity: 0,
                QuantityAfterConversion: 0,
                FreeQty: 0,
                FreeQtyAfterConversion: 0,
                ReturnedQuantity: 0,
                BatchId: '',
                ExpiryDate: null,
                Rate: 0,
                UnitRate: 0,
                Amount: 0,
                UnitAmount: 0,
                GrossAmount: 0,
                DiscountModeId: 0,
                DiscountModeCode: '',
                DiscountValue: 0,
                Discount: 0,
                DiscountAmount: 0,
                UnitDiscountAmount: 0,
                RateAfterDiscount: 0,
                UnitRateAfterDiscount: 0,
                AmountAfterDiscount: 0,
                UnitAmountAfterDiscount: 0,
                NetAmountBeforeGst: 0,
                GstMaster: {},
                GstId: 0,
                GstPercentage: 0,
                GstAmount: 0,
                UnitGstAmount: 0,
                CGstMaster: {},
                CGstId: 0,
                CGstPercentage: 0,
                CGstAmount: 0,
                UnitCGstAmount: 0,
                SGstMaster: {},
                SGstId: 0,
                SGstPercentage: 0,
                SGstAmount: 0,
                UnitSGstAmount: 0,
                NetAmount: 0,
                ProfitAmount: 0,
                Comments: '',
                Status: 1,
                /* Other Temp Attributes */
                itemidxdesc: null,
                itemidxqty: null,
                BatchQuantity: 0,
                TotalQuantity: 0,
                StockItemRev: 0,
                StockSerialItemRev: 0,
                Ucp: 0,
                Mrp: 0,
                UnitCostPrice: 0,
                MrPrice: 0,
                GrnId: 0,
                GrnDetailId: 0,
                StockEntryId: 0,
                StockEntryDetailId: 0,
                RdoDiscountMode: true,
                RdoDiscount: true,
                IsPrescribed: false,
                RdoItemMasterId: false,
                FreeQtyAlert: false,
                ExpiryAlert: false,
                ExpiryStop: false,
                ExpiryProceed: false,
                SelectedBatchId: '',
                BatchDetails: [],
                BatchDetail: {
                    Id: 0,
                    StockItemId: 0,
                    StoreMasterId: 0,
                    BarCodeId: '',
                    ItemMasterId: 0,
                    ItemCode: '',
                    ItemName: '',
                    BatchId: '',
                    ExpiryDate: null,
                    Quantity: 0,
                    UomPrice: 0,
                    UnitPrice: 0,
                    DiscountModeId: 0,
                    Discount: 0,
                    UomDiscount: 0,
                    UnitDiscount: 0,
                    UomPriceAfterDiscount: 0,
                    UnitPriceAfterDiscount: 0,
                    GstId: 0,
                    GstPercentage: 0,
                    GstAmount: 0,
                    UnitGstAmount: 0,
                    ConversionQuantity: 0,
                    BaseUomId: 0,
                    BasePrice: 0,
                    BasePriceAfterDiscount: 0,
                    BaseQuantity: 0,
                    BaseValue: 0,
                    PurchaseUomId: 0,
                    PurchasePrice: 0,
                    PurchasePriceAfterDiscount: 0,
                    PurchaseQuantity: 0,
                    PurchaseValue: 0,
                    SaleUomId: 0,
                    SalePrice: 0,
                    SalePriceAfterDiscount: 0,
                    SaleQuantity: 0,
                    SaleValue: 0,
                    FreeQuantity: 0,
                    FreeValue: 0,
                    ProfitValue: 0,
                    Ucp: 0,
                    Mrp: 0,
                    StockEntryId: 0,
                    StockEntryDetailId: 0,
                    GrnId: 0,
                    GrnDetailId: 0,
                    VendorMasterId: 0,
                    ManufacturerId: 0,
                    Rev: 0,
                    SelectedBatchId: '',
                    DiscountModeCode: null,
                    SerialDetails: null,
                    ExpiryAlert: false,
                    ExpiryStop: false,
                    ExpiryProceed: false
                },
                tabindex: $scope.tabindexmap.detailtabindex++

            };

            if ($scope.currentcontext.id > 0) {
                CustomerBillDetail.CustomerBillId = $scope.currentcontext.id;
            }

            $scope.CustomerBillDetails.push(CustomerBillDetail);

            $scope.SelectedIndex = $scope.CustomerBillDetails.length;

            $scope.setIndexforTableIndex();
        };

        $scope.ServiceItemChanged = function (idx, selectedItem) {
            var SelectedMasterItem = selectedItem.SelectedItem;
            selectedItem.ItemMasterId = SelectedMasterItem.ItemMasterId;
            selectedItem.ItemCode = SelectedMasterItem.ItemCode;
            selectedItem.ItemName = SelectedMasterItem.ItemName;
            if (SelectedMasterItem.ItemMaster) {
                selectedItem.GenericId = SelectedMasterItem.ItemMaster.GenericId;
                selectedItem.GenericName = SelectedMasterItem.ItemMaster.GenericName;
                selectedItem.ManufacturerId = SelectedMasterItem.ItemMaster.ManufacturerId;
                selectedItem.ManufacturerName = SelectedMasterItem.ItemMaster.ManufacturerName;
                selectedItem.ScheduleTypeId = SelectedMasterItem.ItemMaster.ScheduleTypeId;
                if (SelectedMasterItem.ItemMaster.ScheduleType) {
                    selectedItem.ScheduleTypeDescription = SelectedMasterItem.ItemMaster.ScheduleType.Description;
                }
                selectedItem.DrugId = SelectedMasterItem.ItemMaster.DrugId;
                selectedItem.DrugCode = SelectedMasterItem.ItemMaster.DrugCode;
                selectedItem.DrugName = SelectedMasterItem.ItemMaster.DrugName;
                selectedItem.CategoryId = SelectedMasterItem.ItemMaster.CategoryId;
                selectedItem.SubCategoryId = SelectedMasterItem.ItemMaster.SubCategoryId;
                selectedItem.ProductTypeId = SelectedMasterItem.ItemMaster.ProductTypeId;
                selectedItem.SubProductTypeId = SelectedMasterItem.ItemMaster.SubProductTypeId;
            }

            selectedItem.ConversionQuantity = SelectedMasterItem.ConversionQuantity;
            selectedItem.PurchaseUomId = SelectedMasterItem.PurchaseUomId;
            selectedItem.SaleUomId = SelectedMasterItem.SaleUomId;
            selectedItem.FreeQty = SelectedMasterItem.FreeQty;
            selectedItem.DiscountModeId = SelectedMasterItem.DiscountModeId;
            selectedItem.DiscountModeCode = SelectedMasterItem.DiscountModeCode;
            selectedItem.DiscountValue = SelectedMasterItem.Discount;
            selectedItem.Discount = SelectedMasterItem.Discount;
            selectedItem.GstId = SelectedMasterItem.GstId;
            selectedItem.GstMaster = SelectedMasterItem.GstMaster;
            selectedItem.CGstId = SelectedMasterItem.CGstId;
            selectedItem.CGstMaster = SelectedMasterItem.CGstMaster;
            selectedItem.SGstId = SelectedMasterItem.SGstId;
            selectedItem.SGstMaster = SelectedMasterItem.SGstMaster;
            selectedItem.UomPrice = SelectedMasterItem.UomPrice;
            selectedItem.UomMrPrice = SelectedMasterItem.UomMrPrice;
            selectedItem.UnitCostPrice = SelectedMasterItem.Price;
            selectedItem.MrPrice = SelectedMasterItem.MrPrice;
            selectedItem.Ucp = SelectedMasterItem.Price;
            selectedItem.Mrp = SelectedMasterItem.MrPrice;
            selectedItem.Rate = SelectedMasterItem.MrPrice;

            var stockserialitems = null;
            var SelectedStockItem = null;
            var SelectedStockSerialItems = null;
            var SumOfSerialQuantity = 0;
            SelectedStockItem = SelectedMasterItem.ItemMaster.StockItem;
            SelectedStockSerialItems = SelectedMasterItem.ItemMaster.StockItem.StockSerialItems;
            if (SelectedStockItem && SelectedStockSerialItems.length > 0) {
                stockserialitems = SelectedStockSerialItems;
                for (var batid = 0; batid < stockserialitems.length; batid++) {
                    var serialitem = stockserialitems[batid];
                    if (serialitem.Quantity > 0) {
                        SumOfSerialQuantity = SumOfSerialQuantity + serialitem.Quantity;
                        selectedItem.BatchDetails.push(serialitem);
                    }
                }
                selectedItem.TotalQuantity = SumOfSerialQuantity;
                selectedItem.StockItemRev = SelectedStockItem.Rev;
            }
        };

        $scope.CleanItemBatches = function (item) {
            for (var count = 0; count < $scope.CustomerBillDetails.length; count++) {
                var cllitem = $scope.CustomerBillDetails[count];
                if (cllitem.ItemMasterId == item.ItemMasterId) {
                    cllitem.Status = 2;
                    $scope.DeletedCustomerBills.push(cllitem);
                    var index1 = $scope.CustomerBillDetails.indexOf(cllitem);
                    $scope.CustomerBillDetails.splice(index1, 1);
                    count = count - 1;
                }
            }

            for (var clsidx in $scope.CustomerBillDetails) {
                var clsitem = $scope.CustomerBillDetails[clsidx];
                if (clsitem.ItemMasterId == -1) {
                    clsitem.Status = 2;
                    $scope.DeletedCustomerBills.push(clsitem);
                    var index2 = $scope.CustomerBillDetails.indexOf(clsitem);
                    $scope.CustomerBillDetails.splice(index2, 1);
                }
            }
        };

        $scope.ChooseBatches = function (idx, item) {
            var currentitem = item;
            var CustomerBillDetail = {};
            var ExpiryDays = null;
            if (item.Quantity > item.TotalQuantity) {
                utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.availqty.lbl'));
                item.Quantity = 0;
            } else if (item.Quantity === null || item.Quantity === 0) {
                //utl.Alert.showErrorMsg('Quantity should be Greater Than Zero');
                //item.Quantity = 0;
            } else {
                $scope.CleanItemBatches(item);
                for (var batid = 0; batid < item.BatchDetails.length; batid++) {
                    if (item.Quantity > 0) {
                        if (item.BatchDetails[batid].Quantity >= item.Quantity) {
                            CustomerBillDetail = {
                                Id: 0,
                                BillDateTime: utl.Formatter.getCurrentDate(),
                                CustomerBillStatusId: 0,
                                ItemMasterId: item.ItemMasterId || 0,
                                ItemCode: item.ItemCode,
                                ItemName: item.ItemName,
                                DrugId: item.DrugId || 0,
                                DrugCode: item.DrugCode,
                                DrugName: item.DrugName,
                                CategoryId: item.CategoryId || 0,
                                SubCategoryId: item.SubCategoryId || 0,
                                ProductTypeId: item.ProductTypeId || 0,
                                SubProductTypeId: item.SubProductTypeId || 0,
                                BaseUomId: item.BatchDetails[batid].BaseUomId || 0,
                                PurchaseUomId: item.BatchDetails[batid].PurchaseUomId || 0,
                                ConversionQuantity: item.BatchDetails[batid].ConversionQuantity || 1,
                                SaleUomId: item.BatchDetails[batid].SaleUomId || 0,
                                ConversionQty: item.BatchDetails[batid].ConversionQuantity || 1,
                                GenericId: item.GenericId || 0,
                                GenericName: item.GenericName,
                                ManufacturerId: item.ManufacturerId || 0,
                                ManufacturerName: item.ManufacturerName,
                                ScheduleTypeId: item.ScheduleTypeId || 0,
                                ScheduleTypeDescription: item.ScheduleTypeDescription,
                                OrganizationId: 1,
                                FacilityId: utl.Session.getCurrentFacilityId(),
                                DepartmentId: 0,
                                StoreMasterId: $scope.item.StoreMasterId || 0,
                                StockItemId: item.BatchDetails[batid].StockItemId || 0,
                                StockSerialItemId: item.BatchDetails[batid].Id || 0,
                                Quantity: item.Quantity,
                                QuantityAfterConversion: item.Quantity * (item.BatchDetails[batid].ConversionQuantity || 1),
                                FreeQty: 0,
                                FreeQtyAfterConversion: 0,
                                ReturnedQuantity: 0,
                                BatchId: item.BatchDetails[batid].BatchId,
                                ExpiryDate: null,
                                Rate: item.Mrp,
                                UnitRate: item.Mrp,
                                Amount: 0.00,
                                UnitAmount: 0.00,
                                GrossAmount: 0.00,
                                DiscountModeId: item.DiscountModeId || 2,
                                DiscountModeCode: '%',
                                DiscountValue: item.Discount || 0,
                                Discount: item.Discount || 0,
                                ItemDiscountAmount: 0.00,
                                UnitItemDiscountAmount: 0.00,
                                DiscountAmount: 0.00,
                                UnitDiscountAmount: 0.00,
                                RateAfterDiscount: 0.00,
                                UnitRateAfterDiscount: 0.00,
                                AmountAfterDiscount: 0.00,
                                UnitAmountAfterDiscount: 0.00,
                                CostPriceAfterDiscount: 0.00,
                                UnitCostPriceAfterDiscount: 0.00,
                                NetAmountBeforeGst: 0.00,
                                GstId: item.GstId || 1,
                                GstPercentage: item.GstMaster.GstPercentage || 0,
                                CostPriceGstAmount: 0.00,
                                UnitCostPriceGstAmount: 0.00,
                                GstAmount: 0.00,
                                UnitGstAmount: 0.00,
                                CGstId: item.CGstId || 1,
                                CGstPercentage: item.CGstMaster.GstPercentage || 0,
                                CGstAmount: 0.00,
                                UnitCGstAmount: 0.00,
                                SGstId: item.SGstId || 1,
                                SGstPercentage: item.SGstMaster.GstPercentage || 0,
                                SGstAmount: 0.00,
                                UnitSGstAmount: 0.00,
                                CostPriceAfterGst: 0.00,
                                UnitCostPriceAfterGst: 0.00,
                                NetAmount: 0.00,
                                ProfitAmount: 0.00,
                                Comments: '',
                                ActualPurchasePerUnit: 0,
                                SelectedBatchId: item.BatchDetails[batid].BatchId,
                                BatchQuantity: item.BatchDetails[batid].Quantity,
                                TotalQuantity: item.TotalQuantity,
                                StockSerialItemRev: item.BatchDetails[batid].Rev,
                                StockItemRev: item.StockItemRev,
                                RdoDiscountMode: true,
                                RdoDiscount: true,
                                IsPrescribed: false,
                                ExpiryAlert: false,
                                ExpiryStop: false,
                                ExpiryProceed: false,
                                itemidxdesc: null,
                                itemidxqty: null,
                                Status: 1
                            };

                            ExpiryDays = GetExpiryDays(item.BatchDetails[batid].ExpiryDate);
                            if (ExpiryDays <= $scope.item.ExpiryPriorStopDays) {
                                CustomerBillDetail.ExpiryStop = true;
                            } else if (ExpiryDays > $scope.item.ExpiryPriorStopDays && ExpiryDays <= $scope.item.ExpiryWarningDays) {
                                CustomerBillDetail.ExpiryAlert = true;
                            } else {
                                CustomerBillDetail.ExpiryProceed = true;
                            }

                            if (CustomerBillDetail.ExpiryAlert) {
                                CustomerBillDetail.ExpiryDate = null;
                                CustomerBillDetail.ExpiryAlert = true;
                                CustomerBillDetail.ExpiryDate = item.BatchDetails[batid].ExpiryDate;
                            } else if (CustomerBillDetail.ExpiryStop) {
                                CustomerBillDetail.ExpiryDate = null;
                                CustomerBillDetail.ExpiryStop = true;
                                CustomerBillDetail.ExpiryDate = item.BatchDetails[batid].ExpiryDate;
                            } else {
                                CustomerBillDetail.ExpiryDate = null;
                                CustomerBillDetail.ExpiryProceed = true;
                                CustomerBillDetail.ExpiryDate = item.BatchDetails[batid].ExpiryDate;
                            }

                            CustomerBillDetail.Amount = parseFloat((CustomerBillDetail.Rate * CustomerBillDetail.Quantity)).toFixed(2);
                            CustomerBillDetail.UnitAmount = parseFloat((CustomerBillDetail.UnitRate * CustomerBillDetail.Quantity)).toFixed(2);
                            CustomerBillDetail.GrossAmount = parseFloat(parseFloat(CustomerBillDetail.UnitRate) * parseInt(CustomerBillDetail.Quantity)).toFixed(2);


                            if (CustomerBillDetail.DiscountModeId > 0 && CustomerBillDetail.DiscountModeId == 2) {
                                CustomerBillDetail.UnitDiscountAmount = parseFloat(parseFloat(CustomerBillDetail.DiscountValue) / 100 * parseFloat(CustomerBillDetail.UnitRate)).toFixed(2);
                                CustomerBillDetail.DiscountAmount = parseFloat(parseFloat(CustomerBillDetail.UnitDiscountAmount) * parseInt(CustomerBillDetail.Quantity)).toFixed(2);
                            } else if (CustomerBillDetail.DiscountModeId > 0 && CustomerBillDetail.DiscountModeId == 1) {
                                CustomerBillDetail.UnitDiscountAmount = parseFloat(CustomerBillDetail.DiscountValue).toFixed(2);
                                CustomerBillDetail.DiscountAmount = parseFloat(parseFloat(CustomerBillDetail.UnitDiscountAmount) * parseInt(CustomerBillDetail.Quantity)).toFixed(2);
                            }

                            CustomerBillDetail.RateAfterDiscount = parseFloat(CustomerBillDetail.Rate - parseFloat(CustomerBillDetail.UnitDiscountAmount)).toFixed(2);
                            CustomerBillDetail.UnitRateAfterDiscount = parseFloat(CustomerBillDetail.UnitRate - parseFloat(CustomerBillDetail.UnitDiscountAmount)).toFixed(2);

                            CustomerBillDetail.AmountAfterDiscount = parseFloat(parseFloat(CustomerBillDetail.UnitRateAfterDiscount) * parseInt(CustomerBillDetail.Quantity)).toFixed(2);
                            CustomerBillDetail.UnitAmountAfterDiscount = parseFloat(parseFloat(CustomerBillDetail.UnitRateAfterDiscount) * parseInt(CustomerBillDetail.Quantity)).toFixed(2);

                            CustomerBillDetail.NetAmountBeforeGst = CustomerBillDetail.AmountAfterDiscount;

                            CustomerBillDetail.UnitGstAmount = parseFloat((parseFloat(CustomerBillDetail.UnitRateAfterDiscount) / 100) * item.GstMaster.GstPercentage).toFixed(2);
                            CustomerBillDetail.GstAmount = parseFloat(parseFloat(CustomerBillDetail.UnitGstAmount) * parseInt(CustomerBillDetail.Quantity)).toFixed(2);


                            CustomerBillDetail.UnitCGstAmount = parseFloat((parseFloat(CustomerBillDetail.UnitRateAfterDiscount) / 100) * item.CGstMaster.GstPercentage).toFixed(2);
                            CustomerBillDetail.CGstAmount = parseFloat(parseFloat(CustomerBillDetail.UnitCGstAmount) * parseInt(CustomerBillDetail.Quantity)).toFixed(2);


                            CustomerBillDetail.UnitSGstAmount = parseFloat((parseFloat(CustomerBillDetail.UnitRateAfterDiscount) / 100) * item.SGstMaster.GstPercentage).toFixed(2);
                            CustomerBillDetail.SGstAmount = parseFloat(parseFloat(CustomerBillDetail.UnitSGstAmount) * parseInt(CustomerBillDetail.Quantity)).toFixed(2);

                            CustomerBillDetail.RateAfterGst = parseFloat(parseFloat(CustomerBillDetail.RateAfterDiscount) + parseFloat(CustomerBillDetail.UnitGstAmount)).toFixed(2);
                            CustomerBillDetail.UnitRateAfterGst = parseFloat(parseFloat(CustomerBillDetail.UnitRateAfterDiscount) + parseFloat(CustomerBillDetail.UnitGstAmount)).toFixed(2);

                            CustomerBillDetail.NetAmount = parseFloat(parseFloat(CustomerBillDetail.UnitRateAfterGst) * parseInt(CustomerBillDetail.Quantity)).toFixed(2);

                            CustomerBillDetail.BatchDetails = item.BatchDetails;
                            $scope.CustomerBillDetails.push(CustomerBillDetail);
                            item.Quantity = 0;

                            /*
                            if (item.BatchDetails[batid].FreeQuantity > 0) {
                                var TotalProfitOnBatch = item.BatchDetails[batid].FreeQuantity * item.BatchDetails[batid].SalePrice;
                                var KeepingProfit = (TotalProfitOnBatch / 100) * 15;
                                var ProfitCanShare = TotalProfitOnBatch - KeepingProfit;
                                var QtyCanGiveFree = ProfitCanShare / item.BatchDetails[batid].SalePrice;
                                CustomerBillDetail.ActualPurchasePerUnit = item.BatchDetails[batid].PurchaseValue / (item.BatchDetails[batid].PurchaseQuantity + item.BatchDetails[batid].FreeQuantity);
                                CustomerBillDetail.FreeQty = Math.round((QtyCanGiveFree / item.BatchDetails[batid].PurchaseQuantity) * parseInt(CustomerBillDetail.Quantity));
                                if (CustomerBillDetail.FreeQty > item.BatchDetails[batid].FreeQuantity) {
                                    CustomerBillDetail.FreeQty = item.BatchDetails[batid].FreeQuantity;
                                    CustomerBillDetail.CalculatedFreeQty = CustomerBillDetail.FreeQty;
                                } else {
                                    CustomerBillDetail.CalculatedFreeQty = CustomerBillDetail.FreeQty;
                                }
                                CustomerBillDetail.FreeQtyAfterConversion = CustomerBillDetail.FreeQty * CustomerBillDetail.ConversionQty;
                                if ((parseInt(CustomerBillDetail.Quantity) + CustomerBillDetail.FreeQty) > item.BatchDetails[batid].Quantity) {
                                    CustomerBillDetail.Quantity = item.BatchDetails[batid].Quantity - CustomerBillDetail.FreeQty;
                                    CustomerBillDetail.FreeQty = Math.round((QtyCanGiveFree / item.BatchDetails[batid].PurchaseQuantity) * parseInt(CustomerBillDetail.Quantity));
                                    CustomerBillDetail.CalculatedFreeQty = CustomerBillDetail.FreeQty;
                                    CustomerBillDetail.FreeQtyAfterConversion = CustomerBillDetail.FreeQty * CustomerBillDetail.ConversionQty;
                                }
                            } else {
                                CustomerBillDetail.ActualPurchasePerUnit = parseFloat(item.BatchDetails[batid].PurchasePriceAfterDiscount).toFixed(2);
                            }
                            */

                            /*
                            CustomerBillDetail.Amount = parseFloat((CustomerBillDetail.Rate * CustomerBillDetail.Quantity)).toFixed(2);
                            CustomerBillDetail.UnitAmount = parseFloat((CustomerBillDetail.UnitRate * CustomerBillDetail.Quantity)).toFixed(2);
                            CustomerBillDetail.GrossAmount = parseFloat(parseFloat(CustomerBillDetail.UnitRate) * parseInt(CustomerBillDetail.Quantity)).toFixed(2);

                            var itemDiscount = 0;
                            var unititemDiscount = 0;
                            var lineDiscount = 0;
                            var unitlineDiscount = 0;
                            var uomDiscount = 0;
                            var unitDiscount = 0;
                            if (CustomerBillDetail.DiscountModeId > 0 && CustomerBillDetail.DiscountModeId == 2) {
                                itemDiscount = parseFloat(parseFloat(CustomerBillDetail.DiscountValue) / 100 * parseFloat(CustomerBillDetail.Rate)).toFixed(2);
                                unititemDiscount = parseFloat(parseFloat(CustomerBillDetail.DiscountValue) / 100 * parseFloat(CustomerBillDetail.UnitRate)).toFixed(2);
                                CustomerBillDetail.ItemDiscountAmount = itemDiscount;
                                CustomerBillDetail.UnitItemDiscountAmount = unititemDiscount;

                                lineDiscount = parseFloat(parseFloat(CustomerBillDetail.DiscountValue) / 100 * parseFloat(CustomerBillDetail.Amount)).toFixed(2);
                                unitlineDiscount = parseFloat(parseFloat(CustomerBillDetail.DiscountValue) / 100 * parseFloat(CustomerBillDetail.UnitAmount)).toFixed(2);
                                uomDiscount = parseFloat(lineDiscount) / parseInt(CustomerBillDetail.Quantity);
                                unitDiscount = parseFloat(unitlineDiscount) / parseInt(CustomerBillDetail.Quantity);
                                CustomerBillDetail.DiscountAmount = uomDiscount;
                                CustomerBillDetail.UnitDiscountAmount = unitDiscount;
                            } else if (CustomerBillDetail.DiscountModeId > 0 && CustomerBillDetail.DiscountModeId == 1) {
                                itemDiscount = parseFloat(CustomerBillDetail.DiscountValue).toFixed(2);
                                unititemDiscount = parseFloat(CustomerBillDetail.DiscountValue).toFixed(2);
                                CustomerBillDetail.ItemDiscountAmount = itemDiscount;
                                CustomerBillDetail.UnitItemDiscountAmount = unititemDiscount;

                                uomDiscount = parseFloat(CustomerBillDetail.DiscountValue).toFixed(2);
                                unitDiscount = parseFloat(CustomerBillDetail.DiscountValue).toFixed(2);
                                lineDiscount = parseFloat(unitDiscount) * parseInt(CustomerBillDetail.Quantity);
                                CustomerBillDetail.DiscountAmount = lineDiscount;
                                CustomerBillDetail.UnitDiscountAmount = unitDiscount;
                            }

                            CustomerBillDetail.CostPriceAfterDiscount = parseFloat(parseFloat(CustomerBillDetail.Rate) - CustomerBillDetail.ItemDiscountAmount).toFixed(2);
                            CustomerBillDetail.UnitCostPriceAfterDiscount = parseFloat(parseFloat(CustomerBillDetail.UnitRate) - CustomerBillDetail.UnitItemDiscountAmount).toFixed(2);

                            CustomerBillDetail.AmountAfterDiscount = parseFloat(parseFloat(CustomerBillDetail.Amount) - CustomerBillDetail.DiscountAmount).toFixed(2);
                            CustomerBillDetail.UnitAmountAfterDiscount = parseFloat(parseFloat(CustomerBillDetail.UnitAmount) - CustomerBillDetail.UnitDiscountAmount).toFixed(2);
                            CustomerBillDetail.NetAmountBeforeGst = CustomerBillDetail.UnitAmountAfterDiscount;

                            CustomerBillDetail.CostPriceGstAmount = parseFloat((parseFloat(CustomerBillDetail.CostPriceAfterDiscount) / 100) * item.GstMaster.GstPercentage).toFixed(2);
                            CustomerBillDetail.UnitCostPriceGstAmount = parseFloat((parseFloat(CustomerBillDetail.UnitCostPriceAfterDiscount) / 100) * item.GstMaster.GstPercentage).toFixed(2);

                            CustomerBillDetail.GstAmount = parseFloat((parseFloat(CustomerBillDetail.AmountAfterDiscount) / 100) * item.GstMaster.GstPercentage).toFixed(2);
                            CustomerBillDetail.UnitGstAmount = parseFloat((parseFloat(CustomerBillDetail.UnitAmountAfterDiscount) / 100) * item.GstMaster.GstPercentage).toFixed(2);

                            CustomerBillDetail.CGstAmount = parseFloat((parseFloat(CustomerBillDetail.AmountAfterDiscount) / 100) * item.CGstMaster.GstPercentage).toFixed(2);
                            CustomerBillDetail.UnitCGstAmount = parseFloat((parseFloat(CustomerBillDetail.UnitAmountAfterDiscount) / 100) * item.CGstMaster.GstPercentage).toFixed(2);

                            CustomerBillDetail.SGstAmount = parseFloat((parseFloat(CustomerBillDetail.AmountAfterDiscount) / 100) * item.SGstMaster.GstPercentage).toFixed(2);
                            CustomerBillDetail.UnitSGstAmount = parseFloat((parseFloat(CustomerBillDetail.UnitAmountAfterDiscount) / 100) * item.SGstMaster.GstPercentage).toFixed(2);

                            CustomerBillDetail.CostPriceAfterGst = parseFloat(parseFloat(CustomerBillDetail.CostPriceAfterDiscount) + parseFloat(CustomerBillDetail.CostPriceGstAmount)).toFixed(2);
                            CustomerBillDetail.UnitCostPriceAfterGst = parseFloat(parseFloat(CustomerBillDetail.UnitCostPriceAfterDiscount) + parseFloat(CustomerBillDetail.UnitCostPriceGstAmount)).toFixed(2);

                            CustomerBillDetail.RateAfterGst = parseFloat(parseFloat(CustomerBillDetail.AmountAfterDiscount) + parseFloat(CustomerBillDetail.GstAmount)).toFixed(2);
                            CustomerBillDetail.UnitRateAfterGst = parseFloat(parseFloat(CustomerBillDetail.UnitAmountAfterDiscount) + parseFloat(CustomerBillDetail.UnitGstAmount)).toFixed(2);

                            CustomerBillDetail.NetAmount = CustomerBillDetail.UnitRateAfterGst;

                            CustomerBillDetail.BatchDetails = item.BatchDetails;
                            $scope.CustomerBillDetails.push(CustomerBillDetail);
                            item.Quantity = 0;
                            */
                        } else if (item.BatchDetails[batid].Quantity < item.Quantity) {
                            CustomerBillDetail = {
                                Id: 0,
                                BillDateTime: utl.Formatter.getCurrentDate(),
                                CustomerBillStatusId: 0,
                                ItemMasterId: item.ItemMasterId || 0,
                                ItemCode: item.ItemCode,
                                ItemName: item.ItemName,
                                DrugId: item.DrugId || 0,
                                DrugCode: item.DrugCode,
                                DrugName: item.DrugName,
                                CategoryId: item.CategoryId || 0,
                                SubCategoryId: item.SubCategoryId || 0,
                                ProductTypeId: item.ProductTypeId || 0,
                                SubProductTypeId: item.SubProductTypeId || 0,
                                BaseUomId: item.BatchDetails[batid].BaseUomId || 0,
                                PurchaseUomId: item.BatchDetails[batid].PurchaseUomId || 0,
                                ConversionQuantity: item.BatchDetails[batid].ConversionQuantity || 1,
                                SaleUomId: item.BatchDetails[batid].SaleUomId || 0,
                                ConversionQty: item.BatchDetails[batid].ConversionQuantity || 1,
                                GenericId: item.GenericId || 0,
                                GenericName: item.GenericName,
                                ManufacturerId: item.ManufacturerId || 0,
                                ManufacturerName: item.ManufacturerName,
                                ScheduleTypeId: item.ScheduleTypeId || 0,
                                ScheduleTypeDescription: item.ScheduleTypeDescription,
                                OrganizationId: 1,
                                FacilityId: utl.Session.getCurrentFacilityId(),
                                DepartmentId: 0,
                                StoreMasterId: $scope.item.StoreMasterId || 0,
                                StockItemId: item.BatchDetails[batid].StockItemId || 0,
                                StockSerialItemId: item.BatchDetails[batid].Id || 0,
                                Quantity: item.BatchDetails[batid].Quantity,
                                QuantityAfterConversion: item.BatchDetails[batid].Quantity * (item.BatchDetails[batid].ConversionQuantity || 1),
                                FreeQty: 0,
                                FreeQtyAfterConversion: 0,
                                ReturnedQuantity: 0,
                                BatchId: item.BatchDetails[batid].BatchId,
                                ExpiryDate: null,
                                Rate: item.Mrp,
                                UnitRate: item.Mrp,
                                Amount: 0.00,
                                UnitAmount: 0.00,
                                GrossAmount: 0.00,
                                DiscountModeId: item.DiscountModeId || 2,
                                DiscountModeCode: '%',
                                DiscountValue: item.Discount || 0,
                                Discount: item.Discount || 0,
                                ItemDiscountAmount: 0.00,
                                UnitItemDiscountAmount: 0.00,
                                DiscountAmount: 0.00,
                                UnitDiscountAmount: 0.00,
                                RateAfterDiscount: 0.00,
                                UnitRateAfterDiscount: 0.00,
                                AmountAfterDiscount: 0.00,
                                UnitAmountAfterDiscount: 0.00,
                                CostPriceAfterDiscount: 0.00,
                                UnitCostPriceAfterDiscount: 0.00,
                                NetAmountBeforeGst: 0.00,
                                GstId: item.GstId || 1,
                                GstPercentage: item.GstMaster.GstPercentage || 0,
                                CostPriceGstAmount: 0.00,
                                UnitCostPriceGstAmount: 0.00,
                                GstAmount: 0.00,
                                UnitGstAmount: 0.00,
                                CGstId: item.CGstId || 1,
                                CGstPercentage: item.CGstMaster.GstPercentage || 0,
                                CGstAmount: 0.00,
                                UnitCGstAmount: 0.00,
                                SGstId: item.SGstId || 1,
                                SGstPercentage: item.SGstMaster.GstPercentage || 0,
                                SGstAmount: 0.00,
                                UnitSGstAmount: 0.00,
                                CostPriceAfterGst: 0.00,
                                UnitCostPriceAfterGst: 0.00,
                                NetAmount: 0.00,
                                ProfitAmount: 0.00,
                                Comments: '',
                                ActualPurchasePerUnit: 0,
                                SelectedBatchId: item.BatchDetails[batid].BatchId,
                                BatchQuantity: item.BatchDetails[batid].Quantity,
                                TotalQuantity: item.TotalQuantity,
                                StockSerialItemRev: item.BatchDetails[batid].Rev,
                                StockItemRev: item.StockItemRev,
                                RdoDiscountMode: true,
                                RdoDiscount: true,
                                IsPrescribed: false,
                                ExpiryAlert: false,
                                ExpiryStop: false,
                                ExpiryProceed: false,
                                itemidxdesc: null,
                                itemidxqty: null,
                                Status: 1
                            };

                            ExpiryDays = GetExpiryDays(item.BatchDetails[batid].ExpiryDate);
                            if (ExpiryDays <= $scope.item.ExpiryPriorStopDays) {
                                CustomerBillDetail.ExpiryStop = true;
                            } else if (ExpiryDays > $scope.item.ExpiryPriorStopDays && ExpiryDays <= $scope.item.ExpiryWarningDays) {
                                CustomerBillDetail.ExpiryAlert = true;
                            } else {
                                CustomerBillDetail.ExpiryProceed = true;
                            }

                            if (CustomerBillDetail.ExpiryAlert) {
                                CustomerBillDetail.ExpiryDate = null;
                                CustomerBillDetail.ExpiryAlert = true;
                                CustomerBillDetail.ExpiryDate = item.BatchDetails[batid].ExpiryDate;
                            } else if (CustomerBillDetail.ExpiryStop) {
                                CustomerBillDetail.ExpiryDate = null;
                                CustomerBillDetail.ExpiryStop = true;
                                CustomerBillDetail.ExpiryDate = item.BatchDetails[batid].ExpiryDate;
                            } else {
                                CustomerBillDetail.ExpiryDate = null;
                                CustomerBillDetail.ExpiryProceed = true;
                                CustomerBillDetail.ExpiryDate = item.BatchDetails[batid].ExpiryDate;
                            }

                            CustomerBillDetail.Amount = parseFloat((CustomerBillDetail.Rate * CustomerBillDetail.Quantity)).toFixed(2);
                            CustomerBillDetail.UnitAmount = parseFloat((CustomerBillDetail.UnitRate * CustomerBillDetail.Quantity)).toFixed(2);
                            CustomerBillDetail.GrossAmount = parseFloat(parseFloat(CustomerBillDetail.UnitRate) * parseInt(CustomerBillDetail.Quantity)).toFixed(2);


                            if (CustomerBillDetail.DiscountModeId > 0 && CustomerBillDetail.DiscountModeId == 2) {
                                CustomerBillDetail.UnitDiscountAmount = parseFloat(parseFloat(CustomerBillDetail.DiscountValue) / 100 * parseFloat(CustomerBillDetail.UnitRate)).toFixed(2);
                                CustomerBillDetail.DiscountAmount = parseFloat(parseFloat(CustomerBillDetail.UnitDiscountAmount) * parseInt(CustomerBillDetail.Quantity)).toFixed(2);
                            } else if (CustomerBillDetail.DiscountModeId > 0 && CustomerBillDetail.DiscountModeId == 1) {
                                CustomerBillDetail.UnitDiscountAmount = parseFloat(CustomerBillDetail.DiscountValue).toFixed(2);
                                CustomerBillDetail.DiscountAmount = parseFloat(parseFloat(CustomerBillDetail.UnitDiscountAmount) * parseInt(CustomerBillDetail.Quantity)).toFixed(2);
                            }

                            CustomerBillDetail.RateAfterDiscount = parseFloat(CustomerBillDetail.Rate - parseFloat(CustomerBillDetail.UnitDiscountAmount)).toFixed(2);
                            CustomerBillDetail.UnitRateAfterDiscount = parseFloat(CustomerBillDetail.UnitRate - parseFloat(CustomerBillDetail.UnitDiscountAmount)).toFixed(2);

                            CustomerBillDetail.AmountAfterDiscount = parseFloat(parseFloat(CustomerBillDetail.UnitRateAfterDiscount) * parseInt(CustomerBillDetail.Quantity)).toFixed(2);
                            CustomerBillDetail.UnitAmountAfterDiscount = parseFloat(parseFloat(CustomerBillDetail.UnitRateAfterDiscount) * parseInt(CustomerBillDetail.Quantity)).toFixed(2);

                            CustomerBillDetail.NetAmountBeforeGst = CustomerBillDetail.AmountAfterDiscount;

                            CustomerBillDetail.UnitGstAmount = parseFloat((parseFloat(CustomerBillDetail.UnitRateAfterDiscount) / 100) * item.GstMaster.GstPercentage).toFixed(2);
                            CustomerBillDetail.GstAmount = parseFloat(parseFloat(CustomerBillDetail.UnitGstAmount) * parseInt(CustomerBillDetail.Quantity)).toFixed(2);


                            CustomerBillDetail.UnitCGstAmount = parseFloat((parseFloat(CustomerBillDetail.UnitRateAfterDiscount) / 100) * item.CGstMaster.GstPercentage).toFixed(2);
                            CustomerBillDetail.CGstAmount = parseFloat(parseFloat(CustomerBillDetail.UnitCGstAmount) * parseInt(CustomerBillDetail.Quantity)).toFixed(2);


                            CustomerBillDetail.UnitSGstAmount = parseFloat((parseFloat(CustomerBillDetail.UnitRateAfterDiscount) / 100) * item.SGstMaster.GstPercentage).toFixed(2);
                            CustomerBillDetail.SGstAmount = parseFloat(parseFloat(CustomerBillDetail.UnitSGstAmount) * parseInt(CustomerBillDetail.Quantity)).toFixed(2);

                            CustomerBillDetail.RateAfterGst = parseFloat(parseFloat(CustomerBillDetail.RateAfterDiscount) + parseFloat(CustomerBillDetail.UnitGstAmount)).toFixed(2);
                            CustomerBillDetail.UnitRateAfterGst = parseFloat(parseFloat(CustomerBillDetail.UnitRateAfterDiscount) + parseFloat(CustomerBillDetail.UnitGstAmount)).toFixed(2);

                            CustomerBillDetail.NetAmount = parseFloat(parseFloat(CustomerBillDetail.UnitRateAfterGst) * parseInt(CustomerBillDetail.Quantity)).toFixed(2);

                            CustomerBillDetail.BatchDetails = item.BatchDetails;
                            $scope.CustomerBillDetails.push(CustomerBillDetail);
                            item.Quantity = item.Quantity - item.BatchDetails[batid].Quantity;

                            /*
                            if (item.BatchDetails[batid].FreeQuantity > 0) {
                                var TotalProfitOnBatch = item.BatchDetails[batid].FreeQuantity * item.BatchDetails[batid].SalePrice;
                                var KeepingProfit = (TotalProfitOnBatch / 100) * 15;
                                var ProfitCanShare = TotalProfitOnBatch - KeepingProfit;
                                var QtyCanGiveFree = ProfitCanShare / item.BatchDetails[batid].SalePrice;
                                CustomerBillDetail.ActualPurchasePerUnit = parseFloat((item.BatchDetails[batid].PurchaseValue / (item.BatchDetails[batid].PurchaseQuantity + item.BatchDetails[batid].FreeQuantity))).toFixed(2);
                                CustomerBillDetail.FreeQty = Math.round((QtyCanGiveFree / item.BatchDetails[batid].PurchaseQuantity) * parseInt(CustomerBillDetail.Quantity));
                                if (CustomerBillDetail.FreeQty > item.BatchDetails[batid].FreeQuantity) {
                                    CustomerBillDetail.FreeQty = item.BatchDetails[batid].FreeQuantity;
                                    CustomerBillDetail.CalculatedFreeQty = CustomerBillDetail.FreeQty;
                                } else {
                                    CustomerBillDetail.CalculatedFreeQty = CustomerBillDetail.FreeQty;
                                }

                                CustomerBillDetail.FreeQtyAfterConversion = CustomerBillDetail.FreeQty * CustomerBillDetail.ConversionQty;
                                if ((parseInt(CustomerBillDetail.Quantity) + CustomerBillDetail.FreeQty) > item.BatchDetails[batid].Quantity) {
                                    CustomerBillDetail.Quantity = item.BatchDetails[batid].Quantity - CustomerBillDetail.FreeQty;
                                    CustomerBillDetail.FreeQty = Math.round((QtyCanGiveFree / item.BatchDetails[batid].PurchaseQuantity) * parseInt(CustomerBillDetail.Quantity));
                                    CustomerBillDetail.CalculatedFreeQty = CustomerBillDetail.FreeQty;
                                    CustomerBillDetail.FreeQtyAfterConversion = CustomerBillDetail.FreeQty * CustomerBillDetail.ConversionQty;
                                }
                            } else {
                                CustomerBillDetail.ActualPurchasePerUnit = parseFloat(item.BatchDetails[batid].PurchasePriceAfterDiscount).toFixed(2);
                            }
                            */

                            /*
                            CustomerBillDetail.Amount = parseFloat((CustomerBillDetail.Rate * CustomerBillDetail.Quantity)).toFixed(2);
                            CustomerBillDetail.UnitAmount = parseFloat((CustomerBillDetail.UnitRate * CustomerBillDetail.Quantity)).toFixed(2);
                            CustomerBillDetail.GrossAmount = parseFloat(parseFloat(CustomerBillDetail.UnitRate) * parseInt(CustomerBillDetail.Quantity)).toFixed(2);

                            var itemDiscount = 0;
                            var unititemDiscount = 0;
                            var lineDiscount = 0;
                            var unitlineDiscount = 0;
                            var uomDiscount = 0;
                            var unitDiscount = 0;
                            if (CustomerBillDetail.DiscountModeId > 0 && CustomerBillDetail.DiscountModeId == 2) {
                                itemDiscount = parseFloat(parseFloat(CustomerBillDetail.DiscountValue) / 100 * parseFloat(CustomerBillDetail.Rate)).toFixed(2);
                                unititemDiscount = parseFloat(parseFloat(CustomerBillDetail.DiscountValue) / 100 * parseFloat(CustomerBillDetail.UnitRate)).toFixed(2);
                                CustomerBillDetail.ItemDiscountAmount = itemDiscount;
                                CustomerBillDetail.UnitItemDiscountAmount = unititemDiscount;

                                lineDiscount = parseFloat(parseFloat(CustomerBillDetail.DiscountValue) / 100 * parseFloat(CustomerBillDetail.Amount)).toFixed(2);
                                unitlineDiscount = parseFloat(parseFloat(CustomerBillDetail.DiscountValue) / 100 * parseFloat(CustomerBillDetail.UnitAmount)).toFixed(2);
                                uomDiscount = parseFloat(lineDiscount) / parseInt(CustomerBillDetail.Quantity);
                                unitDiscount = parseFloat(unitlineDiscount) / parseInt(CustomerBillDetail.Quantity);
                                CustomerBillDetail.DiscountAmount = uomDiscount;
                                CustomerBillDetail.UnitDiscountAmount = unitDiscount;
                            } else if (CustomerBillDetail.DiscountModeId > 0 && CustomerBillDetail.DiscountModeId == 1) {
                                itemDiscount = parseFloat(CustomerBillDetail.DiscountValue).toFixed(2);
                                unititemDiscount = parseFloat(CustomerBillDetail.DiscountValue).toFixed(2);
                                CustomerBillDetail.ItemDiscountAmount = itemDiscount;
                                CustomerBillDetail.UnitItemDiscountAmount = unititemDiscount;

                                uomDiscount = parseFloat(CustomerBillDetail.DiscountValue).toFixed(2);
                                unitDiscount = parseFloat(CustomerBillDetail.DiscountValue).toFixed(2);
                                lineDiscount = parseFloat(unitDiscount) * parseInt(CustomerBillDetail.Quantity);
                                CustomerBillDetail.DiscountAmount = lineDiscount;
                                CustomerBillDetail.UnitDiscountAmount = unitDiscount;
                            }

                            CustomerBillDetail.CostPriceAfterDiscount = parseFloat(parseFloat(CustomerBillDetail.Rate) - CustomerBillDetail.ItemDiscountAmount).toFixed(2);
                            CustomerBillDetail.UnitCostPriceAfterDiscount = parseFloat(parseFloat(CustomerBillDetail.UnitRate) - CustomerBillDetail.UnitItemDiscountAmount).toFixed(2);

                            CustomerBillDetail.AmountAfterDiscount = parseFloat(parseFloat(CustomerBillDetail.Amount) - CustomerBillDetail.DiscountAmount).toFixed(2);
                            CustomerBillDetail.UnitAmountAfterDiscount = parseFloat(parseFloat(CustomerBillDetail.UnitAmount) - CustomerBillDetail.UnitDiscountAmount).toFixed(2);
                            CustomerBillDetail.NetAmountBeforeGst = CustomerBillDetail.UnitAmountAfterDiscount;

                            CustomerBillDetail.CostPriceGstAmount = parseFloat((parseFloat(CustomerBillDetail.CostPriceAfterDiscount) / 100) * item.GstMaster.GstPercentage).toFixed(2);
                            CustomerBillDetail.UnitCostPriceGstAmount = parseFloat((parseFloat(CustomerBillDetail.UnitCostPriceAfterDiscount) / 100) * item.GstMaster.GstPercentage).toFixed(2);

                            CustomerBillDetail.GstAmount = parseFloat((parseFloat(CustomerBillDetail.AmountAfterDiscount) / 100) * item.GstMaster.GstPercentage).toFixed(2);
                            CustomerBillDetail.UnitGstAmount = parseFloat((parseFloat(CustomerBillDetail.UnitAmountAfterDiscount) / 100) * item.GstMaster.GstPercentage).toFixed(2);

                            CustomerBillDetail.CGstAmount = parseFloat((parseFloat(CustomerBillDetail.AmountAfterDiscount) / 100) * item.CGstMaster.GstPercentage).toFixed(2);
                            CustomerBillDetail.UnitCGstAmount = parseFloat((parseFloat(CustomerBillDetail.UnitAmountAfterDiscount) / 100) * item.CGstMaster.GstPercentage).toFixed(2);

                            CustomerBillDetail.SGstAmount = parseFloat((parseFloat(CustomerBillDetail.AmountAfterDiscount) / 100) * item.SGstMaster.GstPercentage).toFixed(2);
                            CustomerBillDetail.UnitSGstAmount = parseFloat((parseFloat(CustomerBillDetail.UnitAmountAfterDiscount) / 100) * item.SGstMaster.GstPercentage).toFixed(2);

                            CustomerBillDetail.CostPriceAfterGst = parseFloat(parseFloat(CustomerBillDetail.CostPriceAfterDiscount) + parseFloat(CustomerBillDetail.CostPriceGstAmount)).toFixed(2);
                            CustomerBillDetail.UnitCostPriceAfterGst = parseFloat(parseFloat(CustomerBillDetail.UnitCostPriceAfterDiscount) + parseFloat(CustomerBillDetail.UnitCostPriceGstAmount)).toFixed(2);

                            CustomerBillDetail.RateAfterGst = parseFloat(parseFloat(CustomerBillDetail.AmountAfterDiscount) + parseFloat(CustomerBillDetail.GstAmount)).toFixed(2);
                            CustomerBillDetail.UnitRateAfterGst = parseFloat(parseFloat(CustomerBillDetail.UnitAmountAfterDiscount) + parseFloat(CustomerBillDetail.UnitGstAmount)).toFixed(2);

                            CustomerBillDetail.NetAmount = CustomerBillDetail.UnitRateAfterGst;

                            CustomerBillDetail.BatchDetails = item.BatchDetails;
                            $scope.CustomerBillDetails.push(CustomerBillDetail);
                            item.Quantity = item.Quantity - item.BatchDetails[batid].Quantity;
                            */
                        }
                    }
                }

                $scope.CalculateNetAmt();
                $scope.addNewLineItem();
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

        $scope.CheckBatchQty = function (item) {
            if (item.BatchQuantity > 0) {
                if (item.Quantity > item.BatchQuantity) {
                    utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.quantityalert.lbl'));
                    item.Quantity = 0;
                    item.Amount = 0;
                    item.UnitAmount = 0;
                    item.GrossAmount = 0;
                    item.AmountAfterDiscount = 0;
                    item.UnitAmountAfterDiscount = 0;
                    item.NetAmountBeforeGst = 0;
                    item.GstAmount = 0;
                    item.UnitGstAmount = 0;
                    item.CGstAmount = 0;
                    item.UnitCGstAmount = 0;
                    item.SGstAmount = 0;
                    item.UnitSGstAmount = 0;
                    item.RateAfterGst = 0;
                    item.UnitRateAfterGst = 0;
                    item.NetAmount = 0;
                } else if (item.Quantity === null) {
                    item.Quantity = 0;
                    item.Amount = 0;
                    item.UnitAmount = 0;
                    item.GrossAmount = 0;
                    item.AmountAfterDiscount = 0;
                    item.UnitAmountAfterDiscount = 0;
                    item.NetAmountBeforeGst = 0;
                    item.GstAmount = 0;
                    item.UnitGstAmount = 0;
                    item.CGstAmount = 0;
                    item.UnitCGstAmount = 0;
                    item.SGstAmount = 0;
                    item.UnitSGstAmount = 0;
                    item.RateAfterGst = 0;
                    item.UnitRateAfterGst = 0;
                    item.NetAmount = 0;
                } else {
                    item.QuantityAfterConversion = parseInt(item.Quantity) * parseInt(item.ConversionQty);
                    item.Amount = item.Quantity * item.Rate;
                    item.UnitAmount = item.Quantity * item.UnitRate;
                    item.GrossAmount = item.Quantity * item.UnitRate;

                    item.DiscountAmount = parseFloat(parseFloat(item.UnitDiscountAmount) * parseInt(item.Quantity)).toFixed(2);

                    item.RateAfterDiscount = parseFloat(item.Rate - parseFloat(item.UnitDiscountAmount)).toFixed(2);
                    item.UnitRateAfterDiscount = parseFloat(item.UnitRate - parseFloat(item.UnitDiscountAmount)).toFixed(2);

                    item.AmountAfterDiscount = parseFloat(parseFloat(item.UnitRateAfterDiscount) * parseInt(item.Quantity)).toFixed(2);
                    item.UnitAmountAfterDiscount = parseFloat(parseFloat(item.UnitRateAfterDiscount) * parseInt(item.Quantity)).toFixed(2);

                    item.NetAmountBeforeGst = item.AmountAfterDiscount;

                    item.UnitGstAmount = parseFloat((parseFloat(item.UnitRateAfterDiscount) / 100) * item.GstPercentage).toFixed(2);
                    item.GstAmount = parseFloat(parseFloat(item.UnitGstAmount) * parseInt(item.Quantity)).toFixed(2);

                    item.UnitCGstAmount = parseFloat((parseFloat(item.UnitRateAfterDiscount) / 100) * item.CGstPercentage).toFixed(2);
                    item.CGstAmount = parseFloat(parseFloat(item.UnitCGstAmount) * parseInt(item.Quantity)).toFixed(2);

                    item.UnitSGstAmount = parseFloat((parseFloat(item.UnitRateAfterDiscount) / 100) * item.SGstPercentage).toFixed(2);
                    item.SGstAmount = parseFloat(parseFloat(item.UnitSGstAmount) * parseInt(item.Quantity)).toFixed(2);

                    item.RateAfterGst = parseFloat(parseFloat(item.RateAfterDiscount) + parseFloat(item.UnitGstAmount)).toFixed(2);
                    item.UnitRateAfterGst = parseFloat(parseFloat(item.UnitRateAfterDiscount) + parseFloat(item.UnitGstAmount)).toFixed(2);

                    item.NetAmount = parseFloat(parseFloat(item.UnitRateAfterGst) * parseInt(item.Quantity)).toFixed(2);

                    /*
                    item.AmountAfterDiscount = parseFloat(parseFloat(item.Amount) - item.DiscountAmount).toFixed(2);
                    item.UnitAmountAfterDiscount = parseFloat(parseFloat(item.UnitAmount) - item.UnitDiscountAmount).toFixed(2);
                    item.NetAmountBeforeGst = item.UnitAmountAfterDiscount;

                    item.GstAmount = parseFloat((parseFloat(item.AmountAfterDiscount) / 100) * item.GstPercentage).toFixed(2);
                    item.UnitGstAmount = parseFloat((parseFloat(item.UnitAmountAfterDiscount) / 100) * item.GstPercentage).toFixed(2);

                    item.CGstAmount = parseFloat((parseFloat(item.AmountAfterDiscount) / 100) * item.CGstPercentage).toFixed(2);
                    item.UnitCGstAmount = parseFloat((parseFloat(item.UnitAmountAfterDiscount) / 100) * item.CGstPercentage).toFixed(2);

                    item.SGstAmount = parseFloat((parseFloat(item.AmountAfterDiscount) / 100) * item.SGstPercentage).toFixed(2);
                    item.UnitSGstAmount = parseFloat((parseFloat(item.UnitAmountAfterDiscount) / 100) * item.SGstPercentage).toFixed(2);

                    item.RateAfterGst = parseFloat(parseFloat(item.AmountAfterDiscount) + parseFloat(item.GstAmount)).toFixed(2);
                    item.UnitRateAfterGst = parseFloat(parseFloat(item.UnitAmountAfterDiscount) + parseFloat(item.UnitGstAmount)).toFixed(2);

                    item.NetAmount = item.UnitRateAfterGst;
                    */
                }

                $scope.CalculateNetAmt();
            }
        };

        $scope.CheckFreeQty = function (item) {
            if (parseInt(item.FreeQty) >= 0) {
                if (parseInt(item.FreeQty) > item.CalculatedFreeQty) {
                    utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.freequantityalert.lbl'));
                    item.FreeQty = item.CalculatedFreeQty;
                    item.PurchaseAmount = item.ActualPurchasePerUnit * (parseInt(item.Quantity) + parseInt(item.FreeQty));
                    item.ProfitAmount = (item.NetAmount - item.PurchaseAmount).toFixed(2);
                } else if ((parseInt(item.Quantity) + parseInt(item.FreeQty)) > item.BatchQuantity) {
                    utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.freequantityalert.lbl'));
                    item.FreeQty = item.CalculatedFreeQty;
                } else if ((parseInt(item.Quantity) + parseInt(item.FreeQty)) <= item.BatchQuantity) {
                    item.PurchaseAmount = item.ActualPurchasePerUnit * (parseInt(item.Quantity) + parseInt(item.FreeQty));
                    item.ProfitAmount = (item.NetAmount - item.PurchaseAmount).toFixed(2);
                }
            }
            /*
            else if (parseInt(item.FreeQty) = 0) {
                if ((parseInt(item.Quantity) + parseInt(item.FreeQty)) <= item.BatchQuantity) {
                    item.FreeQtyAlert = false;
                }
            }
            */
        };

        $scope.CalcualteAmt = function (item) {
            if (item.Quantity > item.BatchQuantity) {
                utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.availqty.lbl'));
                item.Quantity = 0;
            } else if (item.Quantity === null) { } else {
                item.Amount = item.Quantity * item.Rate;
                item.UnitAmount = item.Quantity * item.UnitRate;
                item.GrossAmount = item.Quantity * item.UnitRate;

                var lineDiscount = 0;
                var unitlineDiscount = 0;
                var uomDiscount = 0;
                var unitDiscount = 0;
                if (item.DiscountModeId > 0 && item.DiscountModeId == 2) {
                    lineDiscount = parseFloat(parseFloat(item.DiscountValue) / 100 * parseFloat(item.Amount)).toFixed(2);
                    unitlineDiscount = parseFloat(parseFloat(item.DiscountValue) / 100 * parseFloat(item.UnitAmount)).toFixed(2);
                    uomDiscount = parseFloat(lineDiscount) / parseInt(item.Quantity);
                    unitDiscount = parseFloat(unitlineDiscount) / parseInt(item.Quantity);
                    item.DiscountAmount = uomDiscount;
                    item.UnitDiscountAmount = unitDiscount;
                } else if (item.DiscountModeId > 0 && item.DiscountModeId == 1) {
                    uomDiscount = parseFloat(item.DiscountValue).toFixed(2);
                    unitDiscount = parseFloat(item.DiscountValue).toFixed(2);
                    lineDiscount = parseFloat(unitDiscount) * parseInt(item.Quantity);
                    item.DiscountAmount = lineDiscount;
                    item.UnitDiscountAmount = unitDiscount;
                }

                item.AmountAfterDiscount = parseFloat(parseFloat(item.Amount) - item.DiscountAmount).toFixed(2);
                item.UnitAmountAfterDiscount = parseFloat(parseFloat(item.UnitAmount) - item.UnitDiscountAmount).toFixed(2);
                item.NetAmountBeforeGst = item.UnitAmountAfterDiscount;

                item.GstAmount = parseFloat((parseFloat(item.AmountAfterDiscount) / 100) * item.GstPercentage).toFixed(2);
                item.UnitGstAmount = parseFloat((parseFloat(item.UnitAmountAfterDiscount) / 100) * item.GstPercentage).toFixed(2);

                item.CGstAmount = parseFloat((parseFloat(item.AmountAfterDiscount) / 100) * item.CGstPercentage).toFixed(2);
                item.UnitCGstAmount = parseFloat((parseFloat(item.UnitAmountAfterDiscount) / 100) * item.CGstPercentage).toFixed(2);

                item.SGstAmount = parseFloat((parseFloat(item.AmountAfterDiscount) / 100) * item.SGstPercentage).toFixed(2);
                item.UnitSGstAmount = parseFloat((parseFloat(item.UnitAmountAfterDiscount) / 100) * item.SGstPercentage).toFixed(2);

                item.RateAfterGst = parseFloat(parseFloat(item.AmountAfterDiscount) + parseFloat(item.GstAmount)).toFixed(2);
                item.UnitRateAfterGst = parseFloat(parseFloat(item.UnitAmountAfterDiscount) + parseFloat(item.UnitGstAmount)).toFixed(2);

                item.NetAmount = item.UnitRateAfterGst;

                $scope.CalculateNetAmt();
            }
        };

        $scope.CalculateNetAmt = function () {
            var itemwisegrossamount = 0;
            var itemwisediscountamount = 0;
            var itemwisegstamount = 0;
            var itemwisecgstamount = 0;
            var itemwisesgstamount = 0;
            var itemwisenetamount = 0;

            for (var i = 0, len = $scope.CustomerBillDetails.length; i < len; i++) {
                if ($scope.CustomerBillDetails[i].Status == 1) {
                    var itemgrossamount = 0;
                    var itemdiscountamount = 0;
                    var itemgstamount = 0;
                    var itemcgstamount = 0;
                    var itemsgstamount = 0;
                    var itemnetamount = 0;

                    itemgrossamount = isNaN(parseFloat($scope.CustomerBillDetails[i].Amount)) ? 0 : parseFloat($scope.CustomerBillDetails[i].Amount);
                    itemdiscountamount = isNaN(parseFloat($scope.CustomerBillDetails[i].DiscountAmount)) ? 0 : parseFloat($scope.CustomerBillDetails[i].DiscountAmount);
                    itemgstamount = isNaN(parseFloat($scope.CustomerBillDetails[i].GstAmount)) ? 0 : parseFloat($scope.CustomerBillDetails[i].GstAmount);
                    itemcgstamount = isNaN(parseFloat($scope.CustomerBillDetails[i].CGstAmount)) ? 0 : parseFloat($scope.CustomerBillDetails[i].CGstAmount);
                    itemsgstamount = isNaN(parseFloat($scope.CustomerBillDetails[i].SGstAmount)) ? 0 : parseFloat($scope.CustomerBillDetails[i].SGstAmount);
                    itemnetamount = isNaN(parseFloat($scope.CustomerBillDetails[i].NetAmount)) ? 0 : parseFloat($scope.CustomerBillDetails[i].NetAmount);

                    itemwisegrossamount += itemgrossamount;
                    itemwisediscountamount += itemdiscountamount;
                    itemwisegstamount += itemgstamount;
                    itemwisecgstamount += itemcgstamount;
                    itemwisesgstamount += itemsgstamount;
                    itemwisenetamount += itemnetamount;
                }
            }

            $scope.item.BillAmount = itemwisegrossamount;
            $scope.item.GrossAmount = itemwisegrossamount;
            $scope.item.LineTotalDiscount = itemwisediscountamount;
            $scope.item.GstAmount = itemwisegstamount;
            $scope.item.CGstAmount = itemwisecgstamount;
            $scope.item.SGstAmount = itemwisesgstamount;
            $scope.item.NetAmountBeforeGst = itemwisenetamount - itemwisegstamount;
            $scope.item.NetAmount = itemwisenetamount;
        };

        $scope.clear = function () {
            $scope.SaveImdDMPrint = 0;
            $state.reload();
            savehitcompleted = 0;
            $('#pid').focus();
        };

        $scope.numberonly = function (e) {
            if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
                // Allow: Ctrl+A, Command+A
                (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                // Allow: home, end, left, right, down, up
                (e.keyCode >= 35 && e.keyCode <= 40)) {
                // let it happen, don't do anything
                return;
            }
            // Ensure that it is a number and stop the keypress
            //&& (e.keyCode < 96 || e.keyCode > 105)
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57))) {
                e.preventDefault();
            }
        };

        $scope.amountConversion = function (amount) {
            if (amount !== undefined) {
                return parseFloat(amount).toFixed(2);
            } else {
                return '0.00';
            }
        };

        function CustomerBillPickerCallback(customerbilldata) {
            $scope.currentcontext.id = customerbilldata.CustomerBillId;
            $scope.currentcontext.CustomerBillStatusId = customerbilldata.CustomerBillStatusId;
            $scope.getBillInfoByBillId();
        }

        $scope.findBill = function () {
            $scope.SaveImdDMPrint = 0;
            utl.Modal.open('app.find-customer-sales', {
                params: {
                    customermasterid: $scope.item.CustomerMasterId,
                    storemasterid: $scope.item.StoreMasterId
                },
                confirmCallback: CustomerBillPickerCallback
            });
        };

        $scope.customerprofiledetails = function () {
            utl.Modal.open('billing.customerprofile', {
                params: {
                    pid: $scope.item.CustomerMasterId
                },
                confirmCallback: $scope.getItem
            });
        };

        $scope.add_new = function () {
            $scope.SaveImdDMPrint = 0;
            $state.go('app.customer-sales', {
                id: 0,
                pid: $scope.currentcontext.pid
            });
        };

        $scope.openAttachments = function () {
            $scope.SaveImdDMPrint = 0;
            utl.Modal.open('app.customerattachments', {
                params: {
                    pid: 0,
                    itemid: 0
                },
                confirmCallback: $scope.initLookup,
                cancelCallback: $scope.initLookup
            });
        };

        $scope.originalprint = function () {
            if ($scope.printpreferences != 1) {
                utl.Alert.showSuccessMsg($translate.instant('billing.pharmacy.preferencesetting.lbl'));
                return false;
            } else {
                var inputData = {
                    Id: $scope.currentcontext.id,
                    Data: {
                        Reason: $scope.currentcontext.printreason
                    }
                };
                var options = {
                    action: 'billing/customerbills/PrintCustomerBills',
                    data: inputData,
                    type: 'post'
                };
                utl.Http.doDownload(options);
            }
        };

        $scope.print = function () {
            if ($scope.printpreferences != 1) {
                utl.Alert.showSuccessMsg($translate.instant('billing.pharmacy.preferencesetting.lbl'));
                return false;
            } else {
                var inputData = {
                    Id: $scope.currentcontext.id,
                    Data: {
                        isprint: false
                    }
                };
                var options = {
                    action: 'billing/customerbills/PrintCustomerBills',
                    data: inputData,
                    type: 'post'
                };
                utl.Http.doDownload(options);
            }
        };

        $scope.print1 = function () {
            var inputData = {
                Id: $scope.currentcontext.id,
                Data: {
                    isprint: true,
                    Reason: $scope.currentcontext.printreason
                }
            };
            var options = {
                action: 'billing/customerbills/PrintCustomerBills',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.deleteCustomerBillDetails = function (idx, item) {
            if (item.ItemMasterId != -1) {
                /*
                var existing = $scope.itemUsedBatches[item.ItemMasterId].indexOf(item.SelectedBatchId);
                $scope.itemUsedBatches[item.ItemMasterId].splice(existing, 1);
                */
                var index = $scope.CustomerBillDetails.indexOf(item);
                item.Status = 2;
                $scope.DeletedCustomerBills.push(item);
                $scope.CustomerBillDetails.splice(index, 1);
                var lastIndex = $scope.CustomerBillDetails.length - 1;
                if (lastIndex < 0) {
                    $scope.addNewLineItem();
                }
                $scope.CalculateNetAmt();
            }
            $scope.setIndexforTableIndex();
        };

        $scope.getBillInfoCallback = function (scope, res, options, hasError) {
            $scope.CustomerBillInfo = res.Data || [];
            if ($scope.CustomerBillInfo && $scope.CustomerBillInfo.length > 0) {
                $scope.CustomerBillInfo.forEach(customerbills => {
                    $scope.item.CustomerMasterId = customerbills.CustomerMasterId;
                    $scope.item.CustomerName = customerbills.CustomerName;
                    $scope.item.GSTNumber = customerbills.GSTNumber;
                    $scope.item.BillDate = customerbills.BillDateTime;
                    $scope.item.BillDateTime = customerbills.BillDateTime;
                    $scope.item.BillNumber = customerbills.BillNumber;
                    $scope.item.StoreMasterId = customerbills.StoreMasterId;
                    $scope.item.StoreName = customerbills.StoreName;
                    $scope.item.DepartmentId = customerbills.DepartmentId;
                    $scope.item.FacilityId = customerbills.FacilityId;
                    $scope.item.FacilityName = customerbills.FacilityName;
                    $scope.item.CustomerBillStatusId = customerbills.CustomerBillStatusId;
                    $scope.item.CustomerBillStatus = customerbills.CustomerBillStatus.Description;
                    $scope.item.BillTypeId = customerbills.BillTypeId;
                    $scope.item.BillPriorityId = customerbills.BillPriorityId;
                    $scope.item.BillAmount = customerbills.BillAmount;
                    $scope.item.GrossAmount = customerbills.GrossAmount;
                    $scope.item.DiscountTypeId = customerbills.DiscountTypeId;
                    $scope.item.DiscountModeId = customerbills.DiscountModeId;
                    $scope.item.DiscountValue = customerbills.DiscountValue;
                    $scope.item.Discount = customerbills.DiscountValue;
                    $scope.item.DiscountAmount = customerbills.DiscountAmount;
                    $scope.item.DiscountApprovedBy = customerbills.DiscountApprovedBy;
                    $scope.item.LineTotalDiscount = customerbills.LineTotalDiscount;
                    $scope.item.GstAmount = customerbills.GstAmount;
                    $scope.item.RoundOffValue = customerbills.RoundOffValue;
                    $scope.item.NetAmountBeforeGst = customerbills.NetAmountBeforeGst;
                    $scope.item.NetAmount = customerbills.NetAmount;
                    $scope.item.ProfitAmount = customerbills.ProfitAmount || 0;
                    $scope.item.AddressLine1 = customerbills.CustomerMaster.AddressLine1;
                    if ($scope.item.CustomerBillStatusId == 3) {
                        $scope.item.RdoCustomerMasterId = true;
                        $scope.item.RdoStoreMasterId = true;
                    }

                    $scope.currentcontext.id = customerbills.Id;
                    $scope.currentcontext.CustomerBillStatusId = customerbills.CustomerBillStatusId;
                    $scope.currentcontext.ApprovedById = customerbills.BillApprovedBy;

                    $scope.CustomerBillDetails = [];
                    $scope.CustomerBillDetails = customerbills.CustomerBillDetails;
                    for (var saledidx in $scope.CustomerBillDetails) {
                        var saleditem = $scope.CustomerBillDetails[saledidx];
                        saleditem.BatchDetails = [];
                        if (saleditem.ItemMasterId > 0) {
                            saleditem.ExpiryProceed = true;
                            saleditem.SelectedBatchId = saleditem.BatchId;
                            if (saleditem.DiscountModeId == 1) {
                                saleditem.DiscountModeCode = 'Rs.';
                            } else if (saleditem.DiscountModeId == 2) {
                                saleditem.DiscountModeCode = '%';
                            }
                            saleditem.Discount = saleditem.DiscountValue;
                            if (saleditem.ItemMaster.StockItem) {
                                if (saleditem.ItemMaster.StockItem.StockSerialItems) {
                                    saleditem.BatchDetails = saleditem.ItemMaster.StockItem.StockSerialItems;
                                    saleditem.TotalQuantity = saleditem.ItemMaster.StockItem.Quantity;
                                    saleditem.StockItemRev = saleditem.ItemMaster.StockItem.Rev;

                                    var serialitems = saleditem.BatchDetails;
                                    for (var sbid = 0; sbid < serialitems.length; sbid++) {
                                        var sbitem = serialitems[sbid];
                                        if (saleditem.BatchId == sbitem.BatchId) {
                                            saleditem.BatchQuantity = sbitem.Quantity;
                                            saleditem.StockSerialItemRev = sbitem.Rev;
                                        }
                                    }
                                } else {
                                    saleditem.BatchDetails = null;
                                }
                            } else {
                                saleditem.BatchDetails = null;
                            }
                        }

                        if ($scope.item.CustomerBillStatusId == 3) {
                            saleditem.RdoItemMasterId = true;
                        }
                    }
                    $scope.setIndexforTableIndex();
                    $scope.applyVisibilityRules();
                    $scope.CalculateNetAmt();
                });
            }
            if ($scope.SaveImdDMPrint == 1) {
                $scope.SaveImdDMPrint = 0;
                if ($scope.dmprintpreferences == 1) {
                    $scope.dmPrint();
                }
            }
        };

        $scope.getBillInfoByBillId = function () {
            var SearchBillId = $scope.currentcontext.id;
            if (SearchBillId && SearchBillId > 0) {
                var inputData = {
                    Params: [
                        { Key: 0, Value: SearchBillId },
                        { Key: 15, Value: $scope.item.StoreMasterId }
                    ],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'billing/customerbills/GetCustomerBills',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getBillInfoCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.clear();
            }
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            if ($scope.currentcontext.id <= 0)
                $scope.currentcontext.id = data;

            $scope.getBillInfoByBillId();
            $scope.applyVisibilityRules();

            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.SaveImdDMPrint = 1;

        };

        $scope.completeBill = function (action) {
            if (!utl.Validator.validate($scope)) {
                $scope.isSaveandApprove = true;
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'billing.billing-details.confirm.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: action,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.saveDraft = function () {
            $scope.item.BillDateTime = utl.Formatter.getCurrentDate();
            $scope.saveItem(1);
        };

        $scope.saveAndApprove = function () {
            $scope.isSaveandApprove = false;
            if ($scope.item.BillNumber === null) {
                //$scope.item.BillDateTime = utl.Formatter.getCurrentDate();
            }
            $scope.saveItem(3);
        };

        $scope.onCancelConfirmed = function (reason) {
            $scope.item.CancelReason = reason;
            $scope.saveItem(2);
        };

        $scope.saveBillCancelled = function () {
            $scope.saveItem(3);
        };

        $scope.saveCancelled = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'billing.opbilling-list.cancelmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.CancelReceipt,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.saveItem = function (StatusId) {

            if (savehitcompleted == 1) return false;

            $scope.item.CustomerBillStatusId = StatusId;

            if (!$scope.CustomerBillDetails || $scope.CustomerBillDetails.length === 0) {
                utl.Alert.showSuccessMsg($translate.instant('Please Select Atleast One Item.!!'));
                return false;
            } else {
                var ItemCount = 0;
                var ItemCheck = 0;
                var QtyCheck = 0;
                var CheckExpiry = 0;
                var ItemName = null;
                if ($scope.CustomerBillDetails.length === 1) {
                    for (var idx1 in $scope.CustomerBillDetails) {
                        var item1 = $scope.CustomerBillDetails[idx1];
                        if (item1 && item1.ItemMasterId < 0) {
                            ItemCount = 1;
                            break;
                        } else if (item1 && item1.ItemMasterId >= 0 && parseInt(item1.Quantity) <= 0) {
                            ItemCheck = 1;
                            ItemName = item1.ItemName;
                            break;
                        } else if (item1 && item1.ItemMasterId >= 0 && (parseInt(item1.Quantity) + parseInt(item1.FreeQty)) > parseInt(item1.BatchQuantity)) {
                            QtyCheck = 1;
                            ItemName = item1.ItemName;
                            break;
                        } else if (item1.ExpiryStop) {
                            CheckExpiry = 1;
                            ItemName = item1.ItemName;
                            break;
                        } else {
                            continue;
                        }
                    }
                } else {
                    for (var idx in $scope.CustomerBillDetails) {
                        var item = $scope.CustomerBillDetails[idx];
                        if (item && item.ItemMasterId >= 0 && parseInt(item.Quantity) <= 0) {
                            ItemCheck = 1;
                            ItemName = item.ItemName;
                            break;
                        } else if (item && item.ItemMasterId >= 0 && (parseInt(item.Quantity) + parseInt(item.FreeQty)) > parseInt(item.BatchQuantity)) {
                            QtyCheck = 1;
                            ItemName = item.ItemName;
                            break;
                        } else if (item.ExpiryStop) {
                            CheckExpiry = 1;
                            ItemName = item.ItemName;
                            break;
                        } else {
                            continue;
                        }
                    }
                }

                if (ItemCount == 1) {
                    utl.Alert.showSuccessMsg($translate.instant('Please Select Atleast One Item.!!'));
                    return false;
                }

                if (ItemCheck == 1) {
                    utl.Alert.showErrorMsg($translate.instant('Expiry Alert for ' + ItemName));
                    return false;
                }

                if (QtyCheck == 1) {
                    utl.Alert.showErrorMsg('Sale & Free Qty Should Not Exceed Actual Batch Qty for ' + ItemName);
                    return false;
                }

                if (CheckExpiry == 1) {
                    utl.Alert.showErrorMsg('Expiry Alert for ' + ItemName);
                    return false;
                }
            }

            $scope.item.Id = $scope.currentcontext.id;
            $scope.item.BillTypeId = 0;
            $scope.item.BillPriorityId = 1;
            $scope.item.BillGeneratedBy = utl.Session.getCurrentUserId();
            $scope.item.BillApprovedBy = utl.Session.getCurrentUserId();
            $scope.item.CustomerTypeId = 0;

            if (checkMandatoryFields()) {
                var pharmacyitemlines = getLinesForSave();
                var actionName = 'billing/customerbills/AddCustomerBills';
                if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                    actionName = 'billing/customerbills/UpdateCustomerBills';
                }

                savehitcompleted = 1;

                var inputData = {
                    Header: $scope.item,
                    Details: pharmacyitemlines
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
            var activeRecords = $filter('filterArrayItems')($scope.CustomerBillDetails, [{
                search: 1,
                fields: ['Status']
            }]);
            for (var idx in activeRecords) {
                var item = activeRecords[idx];
                if (item.ItemMasterId) {
                    if (item.ItemMasterId != -1 && (item.Quantity <= 0 || !item.BatchId)) {
                        utl.Alert.showErrorMsg($translate.instant('common.req-validation-msg.lbl'));
                        return false;
                    }
                }
            }
            return true;
        }

        function getLinesForSave() {
            var result = [];
            for (var piidx in $scope.CustomerBillDetails) {
                var pharmacyitem = $scope.CustomerBillDetails[piidx];
                if (pharmacyitem.ItemMasterId > 0 && parseInt(pharmacyitem.Quantity) > 0) {
                    pharmacyitem.CustomerBillStatusId = $scope.item.CustomerBillStatusId;
                    pharmacyitem.Quantity = parseInt(pharmacyitem.Quantity);
                    pharmacyitem.StockItemId = pharmacyitem.StockItemId;
                    pharmacyitem.StockSerialItemId = pharmacyitem.StockSerialItemId;
                    pharmacyitem.BatchId = pharmacyitem.BatchId;
                    pharmacyitem.ExpiryDate = pharmacyitem.ExpiryDate;
                    pharmacyitem.Amount = pharmacyitem.Amount;
                    pharmacyitem.GrossAmount = pharmacyitem.Amount;
                    pharmacyitem.NetAmount = pharmacyitem.NetAmount;
                    pharmacyitem.ItemMasterId = pharmacyitem.ItemMasterId;
                    pharmacyitem.GenericName = pharmacyitem.GenericName;
                    pharmacyitem.ItemCode = pharmacyitem.ItemCode;
                    pharmacyitem.ItemName = pharmacyitem.ItemName;
                    pharmacyitem.ScheduleTypeId = pharmacyitem.ScheduleTypeId;
                    pharmacyitem.ScheduleTypeDescription = pharmacyitem.ScheduleTypeDescription;
                    pharmacyitem.StoreMasterId = $scope.item.StoreMasterId;
                    pharmacyitem.Comments = '';
                    pharmacyitem.DepartmentId = $scope.item.DepartmentId;

                    result.push(pharmacyitem);
                }
            }
            for (var idx in $scope.DeletedCustomerBills) {
                var item = $scope.DeletedCustomerBills[idx];
                if (item.Id > 0) {
                    result.push(item);
                }
            }
            return result;
        }

        vm.customercontrolconfig = {
            query: '',
            searchbyid: false,

            options: [{
                header: 'Customer Code',
                field: 'CustomerCode',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Customer Name',
                field: 'CustomerName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            {
                header: 'Customer Contact',
                field: 'PhoneNumber',
                datatype: 'string',
                headercls: 'td-phoneno',
                fieldcls: 'td-phoneno'
            }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/customermaster/GetCustomerMasters',
            formatdisplay: formatselectedcustomer,
            presearch: presearchcustomer,
            postsearch: postsearchcustomer
        };

        function formatselectedcustomer() {
            var selectedItem = vm.customercontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.CustomerName = selectedItem.CustomerName;
                $scope.item.GSTNumber = selectedItem.GSTNumber;
                result = [selectedItem.CustomerName + ' (' + selectedItem.CustomerCode + ')'].join(' ');
            } else if (vm.customercontrolconfig.rowdata) {
                result = [vm.customercontrolconfig.rowdata.CustomerName, vm.customercontrolconfig.rowdata.CustomerCode].join(' ');
            }

            $scope.addNewLineItem();

            return result;
        }

        function presearchcustomer() {
            var query = vm.customercontrolconfig.query;

            var inputData = {
                Params: [{
                    Key: 4,
                    Value: 2
                },
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.customercontrolconfig.searchbyid === true) {
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

            vm.customercontrolconfig.searchparams = inputData;
        }

        function postsearchcustomer() {
            for (var idx in vm.customercontrolconfig.result) {

                var item = vm.customercontrolconfig.result[idx];

                item.CustomerCode = item.CustomerCode;
                item.CustomerName = item.CustomerName;
                item.PhoneNumber = item.PhoneNumber;
            }
        }

        vm.customeritemcontrolconfig = {
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
            {
                header: 'Manufacturer Name',
                field: 'ManufacturerName',
                datatype: 'string',
                headercls: 'td-manufacturername',
                fieldcls: 'td-manufacturername'
            },
            {
                header: 'Stock-In-Hand',
                field: 'StockInHand',
                datatype: 'string',
                headercls: 'td-stockinhand',
                fieldcls: 'td-stockinhand'
            },
            {
                header: 'Mrp',
                field: 'Mrp',
                datatype: 'string',
                headercls: 'td-mrp',
                fieldcls: 'td-mrp'
            }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/itemmaster/GetItemCustomerMaps',
            formatdisplay: formatselectedcustomeritem,
            presearch: presearchcustomeritem,
            postsearch: postsearchcustomeritem
        };

        function formatselectedcustomeritem() {
            var selectedItem = vm.customeritemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ItemName + '(' + selectedItem.ItemCode + ')'].join('    ');
            } else if (vm.customeritemcontrolconfig.rowdata) {
                result = [vm.customeritemcontrolconfig.rowdata.ItemName, vm.customeritemcontrolconfig.rowdata.ItemCode].join(' ');
            }
            return result;
        }

        function presearchcustomeritem() {
            var query = vm.customeritemcontrolconfig.query;
            var inputData = {
                Params: [
                    {
                        Key: 5,
                        Value: $scope.item.ActiveStatusId
                    },
                    {
                        Key: 4,
                        Value: $scope.item.StoreMasterId
                    },
                    {
                        Key: 1,
                        Value: $scope.item.CustomerMasterId
                    }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.customeritemcontrolconfig.searchbyid === true) {
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

            vm.customeritemcontrolconfig.searchparams = inputData;
        }

        function postsearchcustomeritem() {
            for (var idx in vm.customeritemcontrolconfig.result) {
                var item = vm.customeritemcontrolconfig.result[idx];
                item.ItemCode = item.ItemCode;
                item.ItemName = item.ItemName;
                if (item.ItemMaster.ProductType !== null) {
                    item.ProductTypeName = item.ItemMaster.ProductType.ProductTypeName;
                } else {
                    item.ProductTypeName = '';
                }
                if (item.ItemMaster.GenericName !== null) {
                    item.GenericName = item.ItemMaster.GenericName;
                } else {
                    item.GenericName = '';
                }
                if (item.ItemMaster.ManufacturerName !== null) {
                    item.ManufacturerName = item.ItemMaster.ManufacturerName;
                } else {
                    item.ManufacturerName = '';
                }
                if (item.ItemMaster.StockItem !== null) {
                    item.StockInHand = item.ItemMaster.StockItem.Quantity;
                } else {
                    item.StockInHand = 0;
                }
                item.Mrp = parseFloat(item.UomMrPrice).toFixed(2);
            }
        }

        function loadData() {
            $scope.applyVisibilityRules();
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $('#btnsubmit').text("Save (F2)");
            $('#saveAndApproveid').text("Save & Approve (F4)");
            $('#btnprint').text("Print (Alt + P)");
            $('#btndmprint').text("DMPrint (Alt + P)");
            $scope.lookup = hasError ? {} : data;
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.item.StoreMasterId === 0) {
                    $scope.item.StoreMasterId = value[0].Id;
                    $scope.item.StoreName = value[0].StoreMaster.StoreName;
                    $scope.item.StoreTypeId = value[0].StoreMaster.StoreTypeId;
                    $scope.item.ExpiryWarningDays = value[0].StoreMaster.ExpiryWarningDays;
                    $scope.item.ExpiryPriorStopDays = value[0].StoreMaster.ExpiryPriorStopDays;
                }
            });
            loadData();
            $('#pid').focus();
        };

        $scope.initLookup = function () {
            var inputData = [ {
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

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        /* DotMatrix Print Start */


        $scope.dmPrint = function () {
            /*
                        if ($scope.dmprintpreferences != 1) {
                            utl.Alert.showSuccessMsg($translate.instant('billing.pharmacy.preferencesetting.lbl'));
                            return false;
                        } else {
            */
            var dmPrintInput = preparePrintData();
            $scope.printCustomerSales(dmPrintInput);
            //if ($scope.FindOldBillFlag != 1)
            //    $scope.clear();
            //}
        };

        function preparePrintData() {
            console.log('preparePrintData starts');
            var currentBill = $scope.CustomerBillInfo[0];
            var vTinNo = '';
            var vGST = '';
            var vCFirstName = '';
            var vCLastName = '';
            var vCTitle = '';
            var vCustomerAddress = '';
            var vCustomerAddress1 = '';
            var vCustomerAddress1 = '';
            var vCustomerCode = '';
            var vCustomerMobile = '';
            var vCustomerPhone = '';
            var vCustomerEmail = '';

            if (currentBill.CustomerMaster) vGST = '' + currentBill.CustomerMaster.GSTNumber;
            if (currentBill.CustomerMaster) vCustomerCode = '' + currentBill.CustomerMaster.CustomerCode;
            if (currentBill.CustomerMaster) vCustomerMobile = '' + currentBill.CustomerMaster.MobileNumber;
            if (currentBill.CustomerMaster) vCustomerPhone = '' + currentBill.CustomerMaster.PhoneNumber;
            if (currentBill.CustomerMaster) vCustomerEmail = '' + currentBill.CustomerMaster.EmailAddress;
            if (currentBill.CustomerMaster.CustomerContact) vCustomerAddress1 = '' + currentBill.CustomerMaster.CustomerContact.AddressLine1;
            if (currentBill.CustomerMaster.CustomerContact) vCustomerAddress2 = '' + currentBill.CustomerMaster.CustomerContact.AddressLine2;
            vCustomerAddress = vCustomerAddress1 + ' ' + vCustomerAddress1;

            if (currentBill.User) {
                if (currentBill.User.Title) vUTitle = currentBill.User.Title.Description;
                if (currentBill.User.FirstName) vUFirstName = currentBill.User.FirstName;
                if (currentBill.User.LastName) vULastName = currentBill.User.LastName;
            }
            if (currentBill.CreatedUser) {
                if (currentBill.CreatedUser.Title) vCTitle = currentBill.CreatedUser.Title.Description;
                if (currentBill.CreatedUser.FirstName) vCFirstName = currentBill.CreatedUser.FirstName;
                if (currentBill.CreatedUser.LastName) vCLastName = currentBill.CreatedUser.LastName;
            }

            if (currentBill.StoreMaster) vTinNo = currentBill.StoreMaster.TinNo;

            var dmPrintInput = {};
            dmPrintInput.header = {
                billno: '' + currentBill.BillNumber,
                CustomerAddress: vCustomerAddress,
                CustomerCode: vCustomerCode,
                GSTNumber: '' + currentBill.GSTNumber,
                CustomerName: '' + currentBill.CustomerName,
                GstNo: vGST,
                TinNo: vTinNo,
                billdate: utl.Formatter.getDateTimeString(currentBill.BillDateTime),
                TotalAmount: currentBill.GrossAmount,
                TotalDiscont: currentBill.LineTotalDiscount,
                TotalRoundoff: currentBill.RoundOffValue,
                GSTAmount: currentBill.GstAmount,
                TotalAmountBeforeGST: currentBill.NetAmountBeforeGst,
                NetAmount: currentBill.NetAmount,
                billedby: vCTitle + '.' + vCFirstName + ' ' + vCLastName,
                CustomerMobile: vCustomerMobile,
                CustomerPhone: vCustomerPhone,
                CustomerEmail: vCustomerEmail
            };

            dmPrintInput.lines = [];
            var islno = 1;
            for (var idx in currentBill.CustomerBillDetails) {
                var billDetail = currentBill.CustomerBillDetails[idx];
                if (billDetail.ItemMasterId > 0) {
                    var expiryDate = billDetail.ExpiryDate ? utl.Formatter.formatDate(billDetail.ExpiryDate, 'MM/YY') : '';
                    var manu = billDetail.ManufacturerName;
                    if (manu && manu.length > 3) {
                        manu = manu.substring(0, 3);
                    }

                    var batchid = billDetail.BatchId;
                    if (batchid && batchid.length > 4) {
                        batchid = batchid.substring(0, 4);
                    }

                    //   var cgstamt = billDetail.CGstAmount.toFixed(2);
                    //   var sgstamt = billDetail.SGstAmount.toFixed(2);

                    var vHSN = '';
                    if (billDetail.ItemMaster)
                        if (billDetail.ItemMaster.ProductRegNo)
                            vHSN = '' + billDetail.ItemMaster.ProductRegNo;

                    var vSCH = '';
                    if (billDetail.ScheduleTypeDescription)
                        vSCH = billDetail.ScheduleTypeDescription;

                    var detail = {
                        ispace: ' ',
                        slno: islno++,
                        desc: billDetail.ItemName,
                        generic: billDetail.GenericName,
                        hsn: vHSN,
                        sch: vSCH,
                        batch: batchid,
                        exp: expiryDate,
                        qty: billDetail.Quantity,
                        freeqty: billDetail.FreeQty,
                        mrp: billDetail.Rate.toFixed(1),
                        Discount: billDetail.DiscountAmount.toFixed(1),
                        DiscountValue: billDetail.DiscountValue.toFixed(1),
                        // value: billDetail.NetAmountBeforeGST.toFixed(2),
                        vatper: billDetail.GstPercentage,
                        vatamt: billDetail.GstAmount.toFixed(1),
                        netamount: billDetail.NetAmount.toFixed(1),
                        profit: billDetail.ProfitAmount.toFixed(1),
                        //   cgstper: billDetail.CGstPercentage,
                        //  cgstamt: cgstamt,
                        //   sgstper: billDetail.SGstPercentage,
                        //  sgstamt: sgstamt,
                        //    totgst: GstAmount,
                        grossamount: billDetail.GrossAmount.toFixed(1),
                        amount: billDetail.Amount.toFixed(1),
                        mfr: billDetail.ManufacturerName,
                        netamount: billDetail.NetAmount.toFixed(1)
                    };

                    dmPrintInput.lines.push(detail);
                }
            }

            console.log('preparePrintData ends');
            return dmPrintInput;
        }

        /* Pharmacy dotmatrix print ends */

        $scope.moveHeaderFocus = function (nextId) {
            if (event.keyCode == 13) {
                if (nextId == "pid") {
                    var idx = $scope.CustomerBillDetails.length - 1;
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
                if (upId == 'qty') {
                    upId = upId + (index - 1);
                    $('#' + upId).focus();
                }
                else if (upId == 'desc') {
                    if ($scope.autosearchpopup == 0) {
                        upId = upId + (index - 1);
                        $('#' + upId).focus();
                    }
                }
            } else if (event.keyCode == 40) { // Down
                downId = downId + (index + 1);
                $('#' + downId).focus();
            }
            if (event.keyCode == 13) {
                if (nextId == 'desc') {
                    $scope.ValidQty(downId + index);
                    $scope.ChooseBatches(index, item);
                    var idx = $scope.CustomerBillDetails.length - 1;
                    nextId = "desc" + '' + idx;
                    if (idx == (index)) {
                        nextId = "saveAndApproveid";
                        $('#' + nextId).focus();
                    } else {
                        //$('#' + nextId).focus();
                        $scope.startinterval = $interval(function () {
                            $('#' + nextId).focus();
                            $interval.cancel($scope.startinterval);
                        }, 100);
                    }
                } else if (nextId == 'qty') {
                    nextId = nextId + index;
                    $('#' + nextId).select();
                    $('#' + nextId).focus();
                }
            }
            if (event.keyCode == 9) {
                if (nextId == 'desc') {
                    $scope.ValidQty(downId + index);
                }
            }
            if (event.key == "Delete" && event.keyCode == 46) {
                $scope.deleteCustomerBillDetails(index, item);
                $scope.startinterval = $interval(function () {
                    var idx = $scope.CustomerBillDetails.length - 1;
                    nextId = "desc" + '' + idx;
                    $('#' + nextId).focus();
                    $interval.cancel($scope.startinterval);
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
            if ($('#' + nextId).val() == '')
                $('#' + nextId).val(0);
        };

        $scope.setCmbFocus = function (dom) {
            $scope.startinterval = $interval(function () {
                $scope.callCmbFocus(dom);
            }, 10);
        };

        $scope.callCmbFocus = function (dom) {
            var uiSelect = angular.element(dom);
            var uichild = uiSelect.controller('uiSelect');
            uichild.focusser[0].focus();
            uichild.activate();
            $interval.cancel($scope.startinterval);
        };

        $scope.FooterFocus = function (nextId) {
            if (event.keyCode == 13) {

            }
            if (event.keyCode == 39) { //right
                if (nextId == "btnsubmit") {
                    nextId = "saveAndApproveid";
                    $('#' + nextId).focus();
                }
            }
            if (event.keyCode == 37) { //left
                if (nextId == "saveAndApproveid") {
                    nextId = "btnsubmit";
                    $('#' + nextId).focus();
                }
            }
        };

        $scope.getLastBillDataCallback = function (scope, res, options, hasError) {
            if (res) {
                $scope.canLastdata = true;
                var billnumber = '';
                billnumber = res.BillNumber;

                if (billnumber === null)
                    billnumber = '--------';

                var billamt = res.BillAmount;
                if (billamt) billamt = billamt.toFixed(2);
                $scope.LastTransactionDatetime = 'Last Bill Number : ' + billnumber + ' Bill Amt : ';
                $scope.LastBillAmt = billamt;
            }
        };

        $scope.getLastBillData = function (pageNo) {
            var vFromDate = utl.Formatter.getCurrentDate();
            var vToDate = utl.Formatter.getCurrentDate();
            var vfFromDate = '';
            var vfToDate = '';
            if (vFromDate || vToDate) {
                vfFromDate = $filter('date')(vFromDate, 'yyyy-MM-dd 00:00:00');
                vfToDate = $filter('date')(vToDate, 'yyyy-MM-dd 23:59:59');
            }
            var inputData = {
                FromDate: vfFromDate,
                ToDate: vfToDate
            };
            var options = {
                action: 'billing/customerbills/GetLastBillInfo',
                data: { Data: inputData },
                type: 'post',
                onComplete: $scope.getLastBillDataCallback
            };
            utl.Http.doAction(options);
        };

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

        $scope.getPharmacyPrintPreference();
        $scope.initLookup();

        /* Customer  Sales - Shortcut Keys - Start */
        function keyupHandler(e) {
            var kCode = e.keyCode;
            if (kCode == 113 && savehitcompleted === 0 && $scope.canShowSaveBtn) { // F2  - SaveDraft
                $scope.saveDraft();
            }
            if (kCode == 115 && savehitcompleted === 0 && $scope.canShowSaveapproveBtn) { // F2  - SaveAndApprove
                $scope.saveAndApprove();
            }
            if (kCode == 118) { // F7  - New Page
                $scope.clear();
            }
            if (kCode == 119) { // F8  - Find Bills
                $scope.findBill();
            }
            if (e.altKey && kCode == 83 && savehitcompleted === 0 && $scope.canShowSaveBtn) { // alt + s  - SaveDraft
                $scope.saveDraft();
            }
            if (e.altKey && kCode == 65 && savehitcompleted === 0 && $scope.canShowSaveapproveBtn) { // alt + s  - SaveAndApprove
                $scope.saveAndApprove();
            }
            if (e.altKey && kCode == 80) { // alt + p  - DMPrint
                if ($scope.dmprintpreferences > 0) {
                    $scope.dmPrint();
                } else {
                    $scope.print();
                }
            }
            if (kCode == 27) {// Esc
                $scope.autosearchpopup = 0;
            }
        }

        angular.element(document).on('keydown', keyupHandler);
        $scope.$on('$destroy', function () {
            angular.element(document).off('keydown', keyupHandler);
        });
        /* Customer Sales - Shortcut Keys - End */
    }

    customersalesController.$inject = ['$scope', '$interval', '$stateParams', '$state', '$translate', 'utl', '$filter', 'modalConfig', '$timeout'];

})();