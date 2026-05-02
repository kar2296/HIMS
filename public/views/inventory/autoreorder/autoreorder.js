(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('AutoReOrderController', AutoReOrderController);

    function AutoReOrderController($rootScope, $timeout, $scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        $scope.item = {
            FacilityId: utl.Session.getCurrentFacilityId()
        };
        $scope.currentfilter = {
            ProductTypeId: -1,
            SubProductTypeId: -1,
            StoreTypeId: -1,
            StoreMasterId: 0,
            DeliveryStoreMasterId: -1,
            StoreTypeId: -1,
            VendorFacilityMapId: -1,
            VendorMasterId: -1,
            VendorName: null,
            ItemMasterId: -1,
            ReOrderLevel: false,
            IsOpenPO: false,
            OpenAutoReOrder: false,
            Email: '',
            Password: ''
        };

        $scope.currentcontext = {};
        $scope.currentcontext.id = -1;
        $scope.currentcontext.selectallchk = false;

        $scope.lookup = {};

        $scope.ItemReOrderDetails = [];
        $scope.addNewLineItem = function () {
            var reorderitem = {
                AvailableQuantity: 0,
                BaseUomId: 0,
                CGstAmount: 0,
                CGstId: 0,
                CGstPercentage: 0,
                ConversionQuantity: 0,
                DeliveryStoreMasterId: 0,
                Discount: 0,
                DiscountAmount: 0,
                DiscountModeId: 0,
                FreeQty: 0,
                GrossAmount: 0,
                GstAmount: 0,
                GstId: 0,
                GstPercentage: 0,
                Id: 0,
                IndentQty: 0,
                InGstAmount: 0,
                InGstId: 0,
                InGstPercentage: 0,
                ItemCode: null,
                ItemName: null,
                ItemMasterId: -1,
                ItemVendorMapId: 0,
                ItemVendorMaps: [],
                MaxQty: 0,
                MinQty: 0,
                MrPrice: 0,
                NetAmount: 0,
                SaleAmount: 0,
                ProfitAmount: 0,
                OnTheWay: 0,
                Price: 0,
                PoQuantity: 0,
                ProductTypeName: null,
                PurchasePrice: 0,
                PurchasePriceAfterDiscount: 0,
                PurchaseUomId: 0,
                QuantityOnHand: 0,
                RankId: 0,
                ReOrderQty: 0,
                RequestedQuantity: 0,
                SaleUomId: 0,
                SGstAmount: 0,
                SGstId: 0,
                SGstPercentage: 0,
                Status: 1,
                StockInHand: 0,
                StoreMasterId: 0,
                ToStoreMasterId: 0,
                TotalQuantity: 0,
                TotalQuantityAfterConversion: 0,
                UnitCGstAmount: 0,
                UnitCostPrice: 0,
                UnitGstAmount: 0,
                UnitInGstAmount: 0,
                UnitSGstAmount: 0,
                UomCostPrice: 0,
                UomDiscountAmount: 0,
                UomMrPrice: 0,
                UomPrice: 0,
                UomPriceAfterDiscount: 0,
                VendorMasterId: 0
            };
            $scope.ItemReOrderDetails.push(reorderitem);
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.StoreMasterId },
                    { Key: 2, Value: $scope.currentfilter.ItemMasterId },
                    { Key: 6, Value: $scope.currentfilter.ProductTypeId },
                    { Key: 8, Value: $scope.currentfilter.StoreTypeId },
                    { Key: 10, Value: $scope.currentfilter.SubProductTypeId }
                ],
                PageContext: {
                    PageSize: 10000,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'pharmacy/itemmaster/GetStoreReorderItems',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.custom_sort = function (a, b) {
            if (a.RankId < b.RankId)
                return -1;
            if (a.RankId > b.RankId)
                return 1;
            return 0;
        };

        $scope.ChangeReOrderQty = function (item) {
            if (parseInt(item.IndentQty) > 0) {
                item.PoQuantity = parseInt(item.IndentQty);
                item.RequestedQuantity = parseInt(item.IndentQty);
                item.TotalQuantity = parseInt(item.IndentQty) + parseInt(item.FreeQty);
                item.TotalQuantityAfterConversion = parseInt(item.TotalQuantity) * parseInt(item.ConversionQuantity);
            }
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.ItemReOrderDetails = [];
            $scope.FinalItemReOrderDetails = res.Data || [];
            for (var idx in $scope.FinalItemReOrderDetails) {
                var resultitem = $scope.FinalItemReOrderDetails[idx];
                if ($scope.FinalItemReOrderDetails[idx].ItemMaster.ProductType) {
                    $scope.FinalItemReOrderDetails[idx].ProductTypeName = $scope.FinalItemReOrderDetails[idx].ItemMaster.ProductType.ProductTypeName;
                }
                if ($scope.FinalItemReOrderDetails[idx].ItemMaster.StockItem) {
                    $scope.FinalItemReOrderDetails[idx].StockInHand = parseInt($scope.FinalItemReOrderDetails[idx].ItemMaster.StockItem.Quantity);
                    $scope.FinalItemReOrderDetails[idx].QuantityOnHand = parseInt($scope.FinalItemReOrderDetails[idx].ItemMaster.StockItem.Quantity);
                    $scope.FinalItemReOrderDetails[idx].AvailableQuantity = parseInt($scope.FinalItemReOrderDetails[idx].ItemMaster.StockItem.Quantity);
                }
                $scope.FinalItemReOrderDetails[idx].ReOrderQty = parseInt($scope.FinalItemReOrderDetails[idx].ROLQty);
                var PoDetails = [];
                if ($scope.FinalItemReOrderDetails[idx].ItemMaster.PurchaseOrderDetails) {
                    PoDetails = $scope.FinalItemReOrderDetails[idx].ItemMaster.PurchaseOrderDetails;
                }
                var PoQty = 0;
                var ReceivedQty = 0;
                var BalanceQty = 0;
                for (var idx1 in PoDetails) {
                    var poitem = PoDetails[idx1];
                    PoQty = PoQty + parseInt(poitem.PoQuantity);
                    ReceivedQty = ReceivedQty + parseInt(poitem.ReceivedQuantity);
                    BalanceQty = PoQty - ReceivedQty;
                }
                $scope.FinalItemReOrderDetails[idx].OnTheWay = parseInt(BalanceQty);
                if ((parseInt($scope.FinalItemReOrderDetails[idx].StockInHand) + parseInt($scope.FinalItemReOrderDetails[idx].OnTheWay)) > parseInt($scope.FinalItemReOrderDetails[idx].ReOrderQty)) {
                    $scope.FinalItemReOrderDetails[idx].IndentQty = 0;
                } else {
                    $scope.FinalItemReOrderDetails[idx].IndentQty = parseInt($scope.FinalItemReOrderDetails[idx].ReOrderQty) - (parseInt($scope.FinalItemReOrderDetails[idx].StockInHand) + parseInt($scope.FinalItemReOrderDetails[idx].OnTheWay));
                }
                $scope.FinalItemReOrderDetails[idx].ItemVendorMaps = $scope.FinalItemReOrderDetails[idx].ItemMaster.ItemVendorMaps;
                $scope.FinalItemReOrderDetails[idx].ItemVendorMaps.sort($scope.custom_sort);
                var gstmaster = {};
                var ingstmaster = {};
                var cgstmaster = {};
                var sgstmaster = {};
                if ($scope.currentfilter.OpenAutoReOrder) {
                    if ($scope.FinalItemReOrderDetails[idx].ItemMaster.GstMaster) {
                        gstmaster = $scope.FinalItemReOrderDetails[idx].ItemMaster.GstMaster;
                    } else {
                        gstmaster = {
                            GstCode: "0%",
                            GstDescription: '0%',
                            GstName: "0%",
                            GstPercentage: 0,
                            Id: 1
                        }
                    }

                    if ($scope.FinalItemReOrderDetails[idx].ItemMaster.InGstMaster) {
                        ingstmaster = $scope.FinalItemReOrderDetails[idx].ItemMaster.InGstMaster;
                    } else {
                        ingstmaster = {
                            GstCode: "0%",
                            GstDescription: '0%',
                            GstName: "0%",
                            GstPercentage: 0,
                            Id: 1
                        }
                    }

                    if ($scope.FinalItemReOrderDetails[idx].ItemMaster.CGstMaster) {
                        cgstmaster = $scope.FinalItemReOrderDetails[idx].ItemMaster.CGstMaster;
                    } else {
                        cgstmaster = {
                            GstCode: "0%",
                            GstDescription: '0%',
                            GstName: "0%",
                            GstPercentage: 0,
                            Id: 1
                        }
                    }

                    if ($scope.FinalItemReOrderDetails[idx].ItemMaster.SGstMaster) {
                        sgstmaster = $scope.FinalItemReOrderDetails[idx].ItemMaster.SGstMaster;
                    } else {
                        sgstmaster = {
                            GstCode: "0%",
                            GstDescription: "0%",
                            GstName: "0%",
                            GstPercentage: 0,
                            Id: 1
                        }
                    }

                    $scope.FinalItemReOrderDetails[idx].Id = 0;
                    $scope.FinalItemReOrderDetails[idx].ItemVendorMapId = 0;
                    $scope.FinalItemReOrderDetails[idx].VendorMasterId = 0;
                    $scope.FinalItemReOrderDetails[idx].RankId = 0;
                    $scope.FinalItemReOrderDetails[idx].StoreMasterId = $scope.currentfilter.StoreMasterId;
                    $scope.FinalItemReOrderDetails[idx].ToStoreMasterId = $scope.currentfilter.DeliveryStoreMasterId;
                    $scope.FinalItemReOrderDetails[idx].DeliveryStoreMasterId = $scope.currentfilter.DeliveryStoreMasterId;
                    $scope.FinalItemReOrderDetails[idx].RequestedQuantity = parseInt($scope.FinalItemReOrderDetails[idx].IndentQty);
                    $scope.FinalItemReOrderDetails[idx].PoQuantity = parseInt($scope.FinalItemReOrderDetails[idx].IndentQty);
                    $scope.FinalItemReOrderDetails[idx].FreeQty = 0;
                    $scope.FinalItemReOrderDetails[idx].BaseUomId = $scope.FinalItemReOrderDetails[idx].ItemMaster.BaseUomId;
                    $scope.FinalItemReOrderDetails[idx].PurchaseUomId = $scope.FinalItemReOrderDetails[idx].ItemMaster.PurchaseUomId;
                    $scope.FinalItemReOrderDetails[idx].ConversionQuantity = 1;
                    $scope.FinalItemReOrderDetails[idx].SaleUomId = $scope.FinalItemReOrderDetails[idx].ItemMaster.SaleUomId;
                    $scope.FinalItemReOrderDetails[idx].TotalQuantity = parseInt($scope.FinalItemReOrderDetails[idx].IndentQty);
                    $scope.FinalItemReOrderDetails[idx].TotalQuantityAfterConversion = parseInt($scope.FinalItemReOrderDetails[idx].TotalQuantity) * parseInt($scope.FinalItemReOrderDetails[idx].ConversionQuantity);
                    $scope.FinalItemReOrderDetails[idx].UomPrice = 0;
                    $scope.FinalItemReOrderDetails[idx].PurchasePrice = 0;
                    $scope.FinalItemReOrderDetails[idx].Price = 0;
                    $scope.FinalItemReOrderDetails[idx].DiscountModeId = 2;
                    $scope.FinalItemReOrderDetails[idx].Discount = 0;
                    $scope.FinalItemReOrderDetails[idx].UomDiscountAmount = 0;
                    $scope.FinalItemReOrderDetails[idx].DiscountAmount = 0;
                    $scope.FinalItemReOrderDetails[idx].UomPriceAfterDiscount = 0;
                    $scope.FinalItemReOrderDetails[idx].PurchasePriceAfterDiscount = 0;
                    $scope.FinalItemReOrderDetails[idx].GstId = $scope.FinalItemReOrderDetails[idx].ItemMaster.GstId;
                    $scope.FinalItemReOrderDetails[idx].GstPercentage = parseFloat(gstmaster.GstPercentage);
                    $scope.FinalItemReOrderDetails[idx].GstAmount = 0;
                    $scope.FinalItemReOrderDetails[idx].UnitGstAmount = 0;
                    $scope.FinalItemReOrderDetails[idx].InGstId = $scope.FinalItemReOrderDetails[idx].ItemMaster.InGstId;
                    $scope.FinalItemReOrderDetails[idx].InGstPercentage = parseFloat(ingstmaster.GstPercentage);
                    $scope.FinalItemReOrderDetails[idx].InGstAmount = 0;
                    $scope.FinalItemReOrderDetails[idx].UnitInGstAmount = 0;
                    $scope.FinalItemReOrderDetails[idx].CGstId = $scope.FinalItemReOrderDetails[idx].ItemMaster.CGstId;
                    $scope.FinalItemReOrderDetails[idx].CGstPercentage = parseFloat(cgstmaster.GstPercentage);
                    $scope.FinalItemReOrderDetails[idx].CGstAmount = 0;
                    $scope.FinalItemReOrderDetails[idx].UnitCGstAmount = 0;
                    $scope.FinalItemReOrderDetails[idx].SGstId = $scope.FinalItemReOrderDetails[idx].ItemMaster.SGstId;
                    $scope.FinalItemReOrderDetails[idx].SGstPercentage = parseFloat(sgstmaster.GstPercentage);
                    $scope.FinalItemReOrderDetails[idx].SGstAmount = 0;
                    $scope.FinalItemReOrderDetails[idx].UnitSGstAmount = 0;
                    $scope.FinalItemReOrderDetails[idx].UomCostPrice = 0;
                    $scope.FinalItemReOrderDetails[idx].UnitCostPrice = 0;
                    $scope.FinalItemReOrderDetails[idx].UomMrPrice = 0;
                    $scope.FinalItemReOrderDetails[idx].MrPrice = 0;
                    $scope.FinalItemReOrderDetails[idx].GrossAmount = 0;
                    $scope.FinalItemReOrderDetails[idx].NetAmount = 0;
                    $scope.FinalItemReOrderDetails[idx].SaleAmount = 0;
                    $scope.FinalItemReOrderDetails[idx].ProfitAmount = 0;
                    $scope.FinalItemReOrderDetails[idx].ProfitPercentage = 0;
                    $scope.FinalItemReOrderDetails[idx].Status = 1;

                    if ($scope.currentfilter.ReOrderLevel) {
                        if ($scope.FinalItemReOrderDetails[idx].IndentQty > 0) {
                            $scope.ItemReOrderDetails.push($scope.FinalItemReOrderDetails[idx]);
                        }
                    } else {
                        $scope.ItemReOrderDetails.push($scope.FinalItemReOrderDetails[idx]);
                    }
                } else {
                    if ($scope.FinalItemReOrderDetails[idx].ItemVendorMaps.length > 0) {
                        var RankOneVendor = $scope.FinalItemReOrderDetails[idx].ItemVendorMaps[0];

                        if (RankOneVendor.GstMaster) {
                            gstmaster = RankOneVendor.GstMaster;
                        } else {
                            gstmaster = {
                                GstCode: "0%",
                                GstDescription: '0%',
                                GstName: "0%",
                                GstPercentage: 0,
                                Id: 1
                            }
                        }

                        if (RankOneVendor.InGstMaster) {
                            ingstmaster = RankOneVendor.InGstMaster;
                        } else {
                            ingstmaster = {
                                GstCode: "0%",
                                GstDescription: '0%',
                                GstName: "0%",
                                GstPercentage: 0,
                                Id: 1
                            }
                        }

                        if (RankOneVendor.CGstMaster) {
                            cgstmaster = RankOneVendor.CGstMaster;
                        } else {
                            cgstmaster = {
                                GstCode: "0%",
                                GstDescription: '0%',
                                GstName: "0%",
                                GstPercentage: 0,
                                Id: 1
                            }
                        }

                        if (RankOneVendor.SGstMaster) {
                            sgstmaster = RankOneVendor.SGstMaster;
                        } else {
                            sgstmaster = {
                                GstCode: "0%",
                                GstDescription: "0%",
                                GstName: "0%",
                                GstPercentage: 0,
                                Id: 1
                            }
                        }

                        $scope.FinalItemReOrderDetails[idx].Id = 0;
                        $scope.FinalItemReOrderDetails[idx].ItemVendorMapId = RankOneVendor.Id;
                        $scope.FinalItemReOrderDetails[idx].VendorMasterId = RankOneVendor.VendorMasterId;
                        $scope.FinalItemReOrderDetails[idx].RankId = RankOneVendor.RankId;
                        $scope.FinalItemReOrderDetails[idx].StoreMasterId = $scope.currentfilter.StoreMasterId;
                        $scope.FinalItemReOrderDetails[idx].ToStoreMasterId = $scope.currentfilter.DeliveryStoreMasterId;
                        $scope.FinalItemReOrderDetails[idx].DeliveryStoreMasterId = $scope.currentfilter.DeliveryStoreMasterId;
                        $scope.FinalItemReOrderDetails[idx].RequestedQuantity = parseInt($scope.FinalItemReOrderDetails[idx].IndentQty);
                        $scope.FinalItemReOrderDetails[idx].PoQuantity = parseInt($scope.FinalItemReOrderDetails[idx].IndentQty);
                        $scope.FinalItemReOrderDetails[idx].FreeQty = parseInt(RankOneVendor.FreeQty);
                        $scope.FinalItemReOrderDetails[idx].BaseUomId = RankOneVendor.PurchaseUomId;
                        $scope.FinalItemReOrderDetails[idx].PurchaseUomId = RankOneVendor.PurchaseUomId;
                        $scope.FinalItemReOrderDetails[idx].ConversionQuantity = parseInt(RankOneVendor.ConversionQuantity);
                        $scope.FinalItemReOrderDetails[idx].SaleUomId = RankOneVendor.SaleUomId;
                        $scope.FinalItemReOrderDetails[idx].TotalQuantity = parseInt($scope.FinalItemReOrderDetails[idx].IndentQty) + parseInt($scope.FinalItemReOrderDetails[idx].FreeQty);
                        $scope.FinalItemReOrderDetails[idx].TotalQuantityAfterConversion = parseInt($scope.FinalItemReOrderDetails[idx].TotalQuantity) * parseInt($scope.FinalItemReOrderDetails[idx].ConversionQuantity);
                        $scope.FinalItemReOrderDetails[idx].UomPrice = parseFloat(RankOneVendor.UomPrice);
                        $scope.FinalItemReOrderDetails[idx].PurchasePrice = parseFloat(RankOneVendor.Price);
                        $scope.FinalItemReOrderDetails[idx].Price = parseFloat(RankOneVendor.Price);
                        $scope.FinalItemReOrderDetails[idx].DiscountModeId = RankOneVendor.DiscountModeId;
                        $scope.FinalItemReOrderDetails[idx].Discount = parseFloat(RankOneVendor.Discount) || 0;
                        if (RankOneVendor.DiscountModeId == 1) {
                            $scope.FinalItemReOrderDetails[idx].DiscountAmount = parseFloat(RankOneVendor.Discount);
                        } else if (RankOneVendor.DiscountModeId == 2) {
                            $scope.FinalItemReOrderDetails[idx].UomDiscountAmount = (parseFloat(RankOneVendor.Discount) / 100) * parseFloat(RankOneVendor.UomPrice);
                            $scope.FinalItemReOrderDetails[idx].DiscountAmount = (parseFloat(RankOneVendor.Discount) / 100) * parseFloat(RankOneVendor.Price);
                        } else {
                            $scope.FinalItemReOrderDetails[idx].UomDiscountAmount = 0;
                            $scope.FinalItemReOrderDetails[idx].DiscountAmount = 0;
                        }
                        $scope.FinalItemReOrderDetails[idx].UomPriceAfterDiscount = parseFloat(RankOneVendor.UomPrice) - parseFloat($scope.FinalItemReOrderDetails[idx].UomDiscountAmount);
                        $scope.FinalItemReOrderDetails[idx].PurchasePriceAfterDiscount = parseFloat(RankOneVendor.Price) - parseFloat($scope.FinalItemReOrderDetails[idx].DiscountAmount);
                        $scope.FinalItemReOrderDetails[idx].GstId = RankOneVendor.GstId;
                        $scope.FinalItemReOrderDetails[idx].GstPercentage = parseFloat(gstmaster.GstPercentage);
                        $scope.FinalItemReOrderDetails[idx].GstAmount = (parseFloat(gstmaster.GstPercentage) / 100) * parseFloat(RankOneVendor.UomPrice);
                        $scope.FinalItemReOrderDetails[idx].UnitGstAmount = (parseFloat(gstmaster.GstPercentage) / 100) * parseFloat(RankOneVendor.Price);
                        $scope.FinalItemReOrderDetails[idx].InGstId = RankOneVendor.InGstId;
                        $scope.FinalItemReOrderDetails[idx].InGstPercentage = parseFloat(ingstmaster.GstPercentage);
                        $scope.FinalItemReOrderDetails[idx].InGstAmount = (parseFloat(ingstmaster.GstPercentage) / 100) * parseFloat(RankOneVendor.UomPrice);
                        $scope.FinalItemReOrderDetails[idx].UnitInGstAmount = (parseFloat(ingstmaster.GstPercentage) / 100) * parseFloat(RankOneVendor.Price);
                        $scope.FinalItemReOrderDetails[idx].CGstId = RankOneVendor.CGstId;
                        $scope.FinalItemReOrderDetails[idx].CGstPercentage = parseFloat(cgstmaster.GstPercentage);
                        $scope.FinalItemReOrderDetails[idx].CGstAmount = (parseFloat(cgstmaster.GstPercentage) / 100) * parseFloat(RankOneVendor.UomPrice);
                        $scope.FinalItemReOrderDetails[idx].UnitCGstAmount = (parseFloat(cgstmaster.GstPercentage) / 100) * parseFloat(RankOneVendor.Price);
                        $scope.FinalItemReOrderDetails[idx].SGstId = RankOneVendor.SGstId;
                        $scope.FinalItemReOrderDetails[idx].SGstPercentage = parseFloat(sgstmaster.GstPercentage);
                        $scope.FinalItemReOrderDetails[idx].SGstAmount = (parseFloat(sgstmaster.GstPercentage) / 100) * parseFloat(RankOneVendor.UomPrice);
                        $scope.FinalItemReOrderDetails[idx].UnitSGstAmount = (parseFloat(sgstmaster.GstPercentage) / 100) * parseFloat(RankOneVendor.Price);
                        $scope.FinalItemReOrderDetails[idx].UomCostPrice = parseFloat(RankOneVendor.UomPrice) - parseFloat($scope.FinalItemReOrderDetails[idx].GstAmount);
                        $scope.FinalItemReOrderDetails[idx].UnitCostPrice = parseFloat(RankOneVendor.Price) - parseFloat($scope.FinalItemReOrderDetails[idx].UnitGstAmount);
                        $scope.FinalItemReOrderDetails[idx].UomMrPrice = parseFloat(RankOneVendor.UomMrPrice);
                        $scope.FinalItemReOrderDetails[idx].MrPrice = parseFloat(RankOneVendor.MrPrice);
                        $scope.FinalItemReOrderDetails[idx].GrossAmount = parseInt($scope.FinalItemReOrderDetails[idx].IndentQty) * parseFloat(RankOneVendor.UomPrice);
                        $scope.FinalItemReOrderDetails[idx].NetAmount = (parseFloat($scope.FinalItemReOrderDetails[idx].GrossAmount) - parseFloat($scope.FinalItemReOrderDetails[idx].DiscountAmount)) + parseFloat($scope.FinalItemReOrderDetails[idx].GstAmount);
                        $scope.FinalItemReOrderDetails[idx].SaleAmount = parseFloat($scope.FinalItemReOrderDetails[idx].UomMrPrice) * parseInt($scope.FinalItemReOrderDetails[idx].PoQuantity);
                        $scope.FinalItemReOrderDetails[idx].ProfitAmount = parseFloat($scope.FinalItemReOrderDetails[idx].SaleAmount) - parseFloat($scope.FinalItemReOrderDetails[idx].NetAmount);
                        $scope.FinalItemReOrderDetails[idx].ProfitPercentage = (($scope.FinalItemReOrderDetails[idx].ProfitAmount / $scope.FinalItemReOrderDetails[idx].NetAmount) * 100).toFixed(2);
                        $scope.FinalItemReOrderDetails[idx].Status = 1;

                        if ($scope.currentfilter.ReOrderLevel) {
                            if ($scope.FinalItemReOrderDetails[idx].IndentQty > 0) {
                                $scope.ItemReOrderDetails.push($scope.FinalItemReOrderDetails[idx]);
                            }
                        } else {
                            $scope.ItemReOrderDetails.push($scope.FinalItemReOrderDetails[idx]);
                        }
                    }/* else {
                        utl.Alert.showErrorMsg('No Vendor Mapping for ' + $scope.FinalItemReOrderDetails[idx].ItemName);
                        return false;
                    }*/
                }
            }
        };
          $scope.excelDownloadCallbackExcel = function () {
            const JsonFields = ["Item Name", "Product Type", "Stock In Hand", "On The Way", "Min Qty", "Max Qty", "Reorder Qty", "Indent Qty", "Supplier Name"];
            let csvContent = JsonFields.join(",") + "\n";
        
            $scope.ItemReOrderDetails.forEach(function (rowArray) {
                var itemname = rowArray.ItemName || '';
                var producttype = rowArray.ProductTypeName || '';
                var stock = rowArray.StockInHand || '';
                var ontheway = rowArray.OnTheWay || '';
                var minqty = rowArray.MinQty || ''; 
                var maxqty = rowArray.MaxQty || ''; 
                var reorder = rowArray.ReOrderQty || ''; 
                var indent = rowArray.IndentQty || ''; 
                var supplier = ''; 
                if (rowArray.ItemVendorMaps.length > 0) {
                    supplier = rowArray.ItemVendorMaps[0].VendorName || '';
                }
                
                csvContent += [itemname, producttype, stock, ontheway, minqty, maxqty, reorder, indent, supplier].join(",") + "\n";
            });
        
            var encodedUri = encodeURIComponent(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'reorder-report.csv';
            hiddenElement.click();
        };

        $scope.excelDownload = function () {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.StoreMasterId },
                    { Key: 2, Value: $scope.currentfilter.ItemMasterId },
                    { Key: 6, Value: $scope.currentfilter.ProductTypeId },
                    { Key: 8, Value: $scope.currentfilter.StoreTypeId },
                    { Key: 10, Value: $scope.currentfilter.SubProductTypeId }
                ],
                PageContext: {
                    PageSize: 10000,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'pharmacy/itemmaster/GetStoreReorderItems',
                data: inputData,
                type: 'post',
                onComplete: $scope.excelDownloadCallbackExcel
            };

            utl.Http.doAction(options);
        };

        $scope.SelectAll = function (chk) {
            for (var idx in $scope.ItemReOrderDetails) {
                $scope.ItemReOrderDetails[idx].select = chk;
            }

            selectionChangedCal();
        };

        function selectionChangedCal() {
            var Selectionrow = getSelectionRows();
        }

        function getSelectionRows() {
            var currentSelection = [];
            for (var idx in $scope.ItemReOrderDetails) {
                currentSelection.push($scope.ItemReOrderDetails[idx]);
            }
            return currentSelection;
        }

        function getPRSelectionRows() {
            var currentSelection = [];
            for (var idx in $scope.ItemReOrderDetails) {
                if ($scope.ItemReOrderDetails[idx].select) {
                    if (parseInt($scope.ItemReOrderDetails[idx].IndentQty) > 0) {
                        currentSelection.push($scope.ItemReOrderDetails[idx]);
                    }
                }
            }
            return currentSelection;
        }

        function getPOSelectionRows() {
            var currentSelection = [];
            for (var idx in $scope.ItemReOrderDetails) {
                if ($scope.ItemReOrderDetails[idx].select) {
                    if (parseInt($scope.ItemReOrderDetails[idx].IndentQty) > 0) {
                        currentSelection.push($scope.ItemReOrderDetails[idx]);
                    }
                }
            }
            return currentSelection;
        }

        $scope.GeneratePR = function () {
            if ($scope.currentfilter.VendorMasterId > 0) {
                var confirmOptions = {
                    headingKey: 'common.confirm-modal-header.lbl',
                    messageKey: 'inventory.autoreorder.confirmprmsg.lbl',
                    yesKey: 'common.yeskey.lbl',
                    noKey: 'common.nokey.lbl',
                    onSuccessMethod: $scope.onPRConfirmed,
                };
                utl.Dialog.confirmMessage(confirmOptions);
            } else {
                utl.Alert.showErrorMsg($translate.instant('inventory.autoreorder.choosevendor.lbl'));
                return false;
            }
        };

        $scope.GeneratePO = function () {
            if ($scope.currentfilter.VendorMasterId > 0) {
                var confirmOptions = {
                    headingKey: 'common.confirm-modal-header.lbl',
                    messageKey: 'inventory.autoreorder.confirmpomsg.lbl',
                    yesKey: 'common.yeskey.lbl',
                    noKey: 'common.nokey.lbl',
                    onSuccessMethod: $scope.onPOConfirmed,
                };
                utl.Dialog.confirmMessage(confirmOptions);
            } else {
                utl.Alert.showErrorMsg($translate.instant('inventory.autoreorder.choosevendor.lbl'));
                return false;
            }
        };

        $scope.MyStoreChange = function (SelectedStore) {
            $scope.currentfilter.StoreTypeId = SelectedStore.StoreMaster.StoreTypeId;
            $scope.currentfilter.Email = SelectedStore.StoreMaster.Email;
            $scope.currentfilter.Password = SelectedStore.StoreMaster.Password;
            $scope.currentfilter.IsOpenPO = SelectedStore.StoreMaster.CanAllowOpenPO;
            $scope.currentfilter.OpenAutoReOrder = SelectedStore.StoreMaster.OpenAutoReOrder;
            $scope.currentfilter.ProductTypeId = -1;
            $scope.getProductType();
            if ($scope.ItemReOrderDetails.length > 1)
                $scope.ItemReOrderDetails = [];
        };

        $scope.clear = function () {
            $state.reload();
        };

        $scope.onPRConfirmed = function () {
            $scope.item.PrTypeId = 1;
            $scope.item.VendorMasterId = $scope.currentfilter.VendorMasterId;
            $scope.item.VendorName = $scope.currentfilter.VendorName;
            $scope.item.StoreMasterId = $scope.currentfilter.StoreMasterId;
            $scope.item.ToStoreMasterId = $scope.currentfilter.DeliveryStoreMasterId;
            $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
            $scope.item.OrganisationId = 1;
            $scope.item.RequestedBy = utl.Session.getCurrentUserId();
            $scope.item.RequestedDate = utl.Formatter.getCurrentDate();
            $scope.item.PrStatusId = 1;
            $scope.item.Status = 1;

            $scope.savePR();
        };

        $scope.onPOConfirmed = function () {
            $scope.item.PoDate = utl.Formatter.getCurrentDate();
            $scope.item.VendorFacilityMapId = $scope.currentfilter.VendorFacilityMapId;
            $scope.item.VendorMasterId = $scope.currentfilter.VendorMasterId;
            $scope.item.VendorName = $scope.currentfilter.VendorName;
            $scope.item.StoreMasterId = $scope.currentfilter.StoreMasterId;
            $scope.item.StoreName = '';
            $scope.item.DeliveryStoreMasterId = $scope.currentfilter.DeliveryStoreMasterId;
            $scope.item.DeliveryStoreName = '';
            $scope.item.Email = $scope.currentfilter.Email;
            $scope.item.Password = $scope.currentfilter.Password;
            $scope.item.IsOpenPO = $scope.currentfilter.IsOpenPO;
            $scope.item.OpenAutoReOrder = $scope.currentfilter.OpenAutoReOrder;
            $scope.item.PoTypeId = 1;
            $scope.item.PoStatusId = 1;
            $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
            $scope.item.FromFacilityId = utl.Session.getCurrentFacilityId();
            $scope.item.OrganisationId = 1;
            $scope.item.RequestedBy = utl.Session.getCurrentUserId();
            $scope.item.RequestedDate = utl.Formatter.getCurrentDate();
            $scope.item.Status = 1;

            $scope.savePO();
        };

        $scope.savePR = function () {
            var lines = getPRSelectionRows();

            $scope.TotalGrossAmount = 0;
            $scope.TotalDiscountAmount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalInGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmount = 0;

            for (var idx in lines) {
                if (lines[idx].Status == 1) {
                    $scope.TotalGrossAmount = parseFloat(($scope.TotalGrossAmount + lines[idx].GrossAmount).toFixed(2));
                    $scope.TotalDiscountAmount = parseFloat(($scope.TotalDiscountAmount + lines[idx].DiscountAmount).toFixed(2));
                    $scope.TotalGstAmount = parseFloat(($scope.TotalGstAmount + lines[idx].GstAmount).toFixed(2));
                    $scope.TotalInGstAmount = parseFloat(($scope.TotalInGstAmount + lines[idx].InGstAmount).toFixed(2));
                    $scope.TotalCGstAmount = parseFloat(($scope.TotalCGstAmount + lines[idx].CGstAmount).toFixed(2));
                    $scope.TotalSGstAmount = parseFloat(($scope.TotalSGstAmount + lines[idx].SGstAmount).toFixed(2));
                    $scope.TotalNetAmount = parseFloat(($scope.TotalNetAmount + lines[idx].NetAmount).toFixed(2));
                }
            }
            $scope.item.TotalGrossAmount = $scope.TotalGrossAmount || 0;
            $scope.item.TotalDiscountAmount = $scope.TotalDiscountAmount || 0;
            $scope.item.TotalGstAmount = $scope.TotalGstAmount || 0;
            $scope.item.TotalInGstAmount = $scope.TotalInGstAmount || 0;
            $scope.item.TotalCGstAmount = $scope.TotalCGstAmount || 0;
            $scope.item.TotalSGstAmount = $scope.TotalSGstAmount || 0;
            $scope.item.TotalNetAmount = $scope.TotalNetAmount || 0;

            var actionName = 'pharmacy/PurchaseRequest/AddPurchaseRequest';

            var inputData = { Header: $scope.item, Details: lines };
            var options = {
                action: actionName,
                data: { Data: inputData },
                type: 'post',
                onComplete: $scope.savePRItemCallback
            };

            utl.Http.doAction(options);
        };

        $scope.savePO = function () {
            var lines = getPOSelectionRows();

            $scope.TotalGrossAmount = 0;
            $scope.TotalDiscountAmount = 0;
            $scope.TotalGstAmount = 0;
            $scope.TotalInGstAmount = 0;
            $scope.TotalCGstAmount = 0;
            $scope.TotalSGstAmount = 0;
            $scope.TotalNetAmount = 0;

            for (var idx in lines) {
                if (lines[idx].Status == 1) {
                    $scope.TotalGrossAmount = parseFloat(($scope.TotalGrossAmount + lines[idx].GrossAmount).toFixed(2));
                    $scope.TotalDiscountAmount = parseFloat(($scope.TotalDiscountAmount + lines[idx].DiscountAmount).toFixed(2));
                    $scope.TotalGstAmount = parseFloat(($scope.TotalGstAmount + lines[idx].GstAmount).toFixed(2));
                    $scope.TotalInGstAmount = parseFloat(($scope.TotalInGstAmount + lines[idx].InGstAmount).toFixed(2));
                    $scope.TotalCGstAmount = parseFloat(($scope.TotalCGstAmount + lines[idx].CGstAmount).toFixed(2));
                    $scope.TotalSGstAmount = parseFloat(($scope.TotalSGstAmount + lines[idx].SGstAmount).toFixed(2));
                    $scope.TotalNetAmount = parseFloat(($scope.TotalNetAmount + lines[idx].NetAmount).toFixed(2));
                }
            }
            $scope.item.TotalGrossAmount = $scope.TotalGrossAmount || 0;
            $scope.item.TotalDiscountAmount = $scope.TotalDiscountAmount || 0;
            $scope.item.TotalGstAmount = $scope.TotalGstAmount || 0;
            $scope.item.TotalInGstAmount = $scope.TotalInGstAmount || 0;
            $scope.item.TotalCGstAmount = $scope.TotalCGstAmount || 0;
            $scope.item.TotalSGstAmount = $scope.TotalSGstAmount || 0;
            $scope.item.TotalNetAmount = $scope.TotalNetAmount || 0;

            var actionName = 'pharmacy/PurchaseOrder/AddPurchaseOrder';

            var inputData = { Header: $scope.item, Details: lines };
            var options = {
                action: actionName,
                data: { Data: inputData },
                type: 'post',
                onComplete: $scope.savePOItemCallback
            };

            utl.Http.doAction(options);
        };

        $scope.savePRItemCallback = function (scope, data, options, hasError) {
            if ($scope.currentcontext.id <= 0)
                $scope.currentcontext.id = data;

            $state.go('app.purchaserequest', { id: data, prnid: data });

            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        };

        $scope.savePOItemCallback = function (scope, data, options, hasError) {
            if ($scope.currentcontext.id <= 0)
                $scope.currentcontext.id = data;

            $state.go('app.purchaseorder', { id: data, prnid: data });

            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        };

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

        function formatselectedvendor() {
            var selectedItem = vm.vendorcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.currentfilter.VendorMasterId = selectedItem.VendorMasterId;
                $scope.currentfilter.VendorCode = selectedItem.VendorCode;
                $scope.currentfilter.VendorName = selectedItem.VendorName;
                $scope.currentfilter.EmailAddress = selectedItem.EmailAddress;
                result = [selectedItem.VendorName + ' (' + selectedItem.VendorCode + ')'].join(' ');
            } else if (vm.vendorcontrolconfig.rowdata) {
                result = [vm.vendorcontrolconfig.rowdata.VendorName, vm.vendorcontrolconfig.rowdata.VendorCode].join(' ');
            }
            return result;
        }

        function presearchvendor() {
            var query = vm.vendorcontrolconfig.query;

            var inputData = {
                Params: [
                    { Key: 3, Value: 1 },
                    { Key: 4, Value: 2 },
                    { Key: 13, Value: $scope.currentfilter.StoreTypeId },
                    { Key: 12, Value: $scope.item.FacilityId }
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
                item.EmailAddress = item.EmailAddress;
            }
        }

        vm.itemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Item Code', field: 'ItemCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Item Name', field: 'ItemName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Product Name', field: 'ProductTypeName', datatype: 'string', headercls: 'td-producttypename', fieldcls: 'td-producttypename' },
                { header: 'Generic', field: 'GenericName', datatype: 'string', headercls: 'td-genericname', fieldcls: 'td-genericname' },
                { header: 'Manufacturer', field: 'ManufacturerName', datatype: 'string', headercls: 'td-manufacturername', fieldcls: 'td-manufacturername' }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/itemmaster/GetItemMasters',
            formatdisplay: formatselecteditem,
            presearch: presearchitem,
            postsearch: postsearchitem
        };

        function formatselecteditem() {
            var selectedItem = vm.itemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ItemName + ' (' + selectedItem.ItemCode + ')'].join(' ');
            } else if (vm.itemcontrolconfig.rowdata) {
                result = [vm.itemcontrolconfig.rowdata.ItemCode, vm.itemcontrolconfig.rowdata.ItemName].join(' ');
            }
            return result;
        }

        function presearchitem() {
            var query = vm.itemcontrolconfig.query;
            var inputData = {
                Params: [
                    { Key: 3, Value: 2 },
                    { Key: 5, Value: $scope.currentfilter.ProductTypeId },
                    { Key: 9, Value: $scope.currentfilter.SubProductTypeId }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.itemcontrolconfig.searchbyid === true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.itemcontrolconfig.searchparams = inputData;
        }

        function postsearchitem() {
            for (var idx in vm.itemcontrolconfig.result) {
                var item = vm.itemcontrolconfig.result[idx];
                item.ItemCode = item.ItemCode;
                item.ItemName = item.ItemName;
                if (item.ProductType !== null) {
                    item.ProductTypeName = item.ProductType.ProductTypeName;
                } else {
                    item.ProductTypeName = '';
                }
                if (item.GenericMaster !== null) {
                    item.GenericName = item.GenericMaster.GenericName;
                } else {
                    item.GenericName = '';
                }
                if (item.VendorMaster !== null) {
                    item.ManufacturerName = item.VendorMaster.VendorName;
                } else {
                    item.ManufacturerName = '';
                }
            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.currentfilter.StoreMasterId === 0) {
                    $scope.currentfilter.StoreMasterId = value[0].Id;
                    $scope.currentfilter.StoreTypeId = value[0].StoreMaster.StoreTypeId;
                    $scope.currentfilter.Email = value[0].StoreMaster.Email;
                    $scope.currentfilter.Password = value[0].StoreMaster.Password;
                    $scope.currentfilter.IsOpenPO = value[0].StoreMaster.CanAllowOpenPO;
                    $scope.currentfilter.OpenAutoReOrder = value[0].StoreMaster.OpenAutoReOrder;
                } else if (key == 'UserStores' && $scope.currentfilter.StoreMasterId > 0) {
                    for (var userstoreid = 0; userstoreid < $scope.lookup['UserStores'].length; userstoreid++) {
                        if ($scope.lookup['UserStores'][userstoreid].Id == $scope.currentfilter.StoreMasterId) {
                            $scope.currentfilter.StoreTypeId = $scope.lookup['UserStores'][userstoreid].StoreMaster.StoreTypeId;
                            $scope.currentfilter.Email = $scope.lookup['UserStores'][userstoreid].StoreMaster.Email;
                            $scope.currentfilter.Password = $scope.lookup['UserStores'][userstoreid].StoreMaster.Password;
                            $scope.currentfilter.IsOpenPO = $scope.lookup['UserStores'][userstoreid].StoreMaster.IsOpenPO;
                            $scope.currentfilter.OpenAutoReOrder = $scope.lookup['UserStores'][userstoreid].StoreMaster.OpenAutoReOrder;
                        }
                    }
                }
            });

            $scope.getProductType();
        };

        $scope.lookupCallbackOnSelect = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
            });

        };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "StoreType"
            },
            {
                "Key": "ToStore",
                Request: {
                    Params: [{
                        Key: 7,
                        Value: 2
                    }]
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

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getProductType = function () {
            $scope.item.ProductTypeId = -1;
            var inputData = [
                //     {
                //     "Key": "ProductType",
                //     Request: {
                //         Params: [
                //             { Key: 5, Value: $scope.currentfilter.StoreTypeId || -1 }
                //         ]
                //     }
                // },
                {
                    "Key": "ProductType",
                    Request: {
                        Params: [{
                            Key: 3,
                            Value: 2
                        }, { Key: 5, Value: $scope.currentfilter.StoreTypeId || -1 }, {
                            Key: 4,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        },]
                    }
                },];
            $scope.getLookUpOnSelect(inputData);
        };

        $scope.getProductSubType = function () {
            $scope.item.SubProductTypeId = -1;
            var inputData = [
                {
                    "Key": "ProductSubType",
                    Request: {
                        Params: [
                            {
                                Key: 3,
                                Value: 2
                            }, {
                                Key: 6,
                                Value: [-1, utl.Session.getCurrentFacilityId()]
                            },
                            { Key: 5, Value: $scope.currentfilter.ProductTypeId || -1 }
                        ]
                    }
                }];
            $scope.getLookUpOnSelect(inputData);
        };

        $scope.getLookUpOnSelect = function (inputData) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallbackOnSelect
            };
            utl.Http.doAction(options);
        };

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.initLookup();
    }

    AutoReOrderController.$inject = ['$rootScope', '$timeout', '$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();