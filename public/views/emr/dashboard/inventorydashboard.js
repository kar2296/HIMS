(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('inventorydashboardFormController', inventorydashboardFormController);

    function inventorydashboardFormController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.items = [];
        $scope.currentcontext = {
            StoreMasterId: 0,
            FacilityId: utl.Session.getCurrentFacilityId(),
            FromDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00'),
            ToDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59'),
        }

        $scope.toggleCanShowDetails = function (clickedItem) {
            for (var idx in $scope.items) {
                var item = $scope.items[idx];
                if (item.Id == clickedItem.Id) {
                    item.CanShowDetails = !item.CanShowDetails;
                } else {
                    item.CanShowDetails = false;
                }
            }
        }

        $scope.custom_sort = function (a, b) {
            if (b.Value && a.Value && b.Value.DisplayOrder && a.Value.DisplayOrder)
                return a.Value.DisplayOrder - b.Value.DisplayOrder;
            else
                return 0;
        }

        /*
        $scope.GetCategoryCollection = function () {
            $scope.FacilityInfo.category = [];
            $scope.FacilityInfo.totcategory = [];
            $scope.FacilityInfo.opcategory = [];
            $scope.FacilityInfo.totopcategory = [];
            $scope.FacilityInfo.ipcategory = [];
            $scope.FacilityInfo.totipcategory = [];
            if ($scope.FacilityInfo.categorycollection) {
                var opcollection = [];
                var ipcollection = [];

                if ($scope.FacilityInfo.categorycollection.length > 0)
                    opcollection = $scope.FacilityInfo.categorycollection[0].Value;


                if ($scope.FacilityInfo.categorycollection.length > 1)
                    ipcollection = $scope.FacilityInfo.categorycollection[1].Value;

                var opTotNetAmt = 0;
                for (var idx in opcollection) {
                    var coll = opcollection[idx];
                    var NetAmt = 0;
                    var key = '';
                    for (var idx in coll) {
                        key = coll[idx].ServiceCategoryName;
                        NetAmt += coll[idx].NetAmount;
                    }
                    opTotNetAmt += NetAmt;
                    $scope.FacilityInfo.opcategory.push({ 'Key': key, 'Value': NetAmt });
                    $scope.FacilityInfo.category.push({ 'Key': key, 'Value': { 'OP': NetAmt, 'IP': 0.00 } });
                }
                $scope.FacilityInfo.totopcategory.push({ 'Key': 'Total', 'Value': opTotNetAmt });
                var ipTotNetAmt = 0;
                for (var idx in ipcollection) {
                    var coll = ipcollection[idx];
                    var NetAmt = 0;
                    var key = '';
                    for (var idx in coll) {
                        key = coll[idx].ServiceCategoryName;
                        NetAmt += coll[idx].NetAmount;
                    }
                    ipTotNetAmt += NetAmt;
                    $scope.FacilityInfo.ipcategory.push({ 'Key': key, 'Value': NetAmt });

                    var valappended = 0;
                    $scope.FacilityInfo.category.forEach(function (item) {
                        if (key === item.Key) {
                            item.Value.IP = NetAmt;
                            valappended = 1;
                        }
                    });

                    if (valappended == 0)
                        $scope.FacilityInfo.category.push({ 'Key': key, 'Value': { 'OP': 0.00, 'IP': NetAmt } });

                }
                $scope.FacilityInfo.totipcategory.push({ 'Key': 'Total', 'Value': ipTotNetAmt });

                $scope.FacilityInfo.category.push({ 'Key': 'Total', 'Value': { 'OP': opTotNetAmt, 'IP': ipTotNetAmt } });

            }
        };
        $scope.GetFacilityDashboardOptionsCallBack = function (scope, res, options, hasError) {
            $scope.FacilityInfo = res;
            if (res.ippharmacydue) {
                for (var idx in res.ippharmacydue)
                    $scope.FacilityInfo.receipt.push(res.ippharmacydue[idx]);
            }
            if (res.billrefund) {
                for (var idx in res.billrefund)
                    $scope.FacilityInfo.receipt.push(res.billrefund[idx]);
            }
            if (res.refund) {
                for (var idx in res.refund)
                    $scope.FacilityInfo.receipt.push(res.refund[idx]);
            }

            if ($scope.FacilityInfo.receipt)
                $scope.FacilityInfo.receipt.sort($scope.custom_sort);

            $scope.GetCategoryCollection();

            //console.log($scope.FacilityInfo);

        };
        $scope.GetFacilityDashboardOptions = function () {
            var inputData = {
                Data: {
                    Keys: [{ Key: 'encounter' }, { Key: 'patient' },
                    { Key: 'appointment' }, { Key: 'newborn' }, { Key: 'receipt' },
                    { Key: 'ippharmacydue' }, { Key: 'refund' }, { Key: 'billrefund' },
                    { Key: 'categorycollection' }]
                },
                Attributes: $scope.currentcontext
            };

            var options = {
                action: 'SystemSettings/facilitydashboard/GetFacilityDashboardOptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.GetFacilityDashboardOptionsCallBack
            };
            utl.Http.doAction(options);
        };
        */

        /*
        $scope.getBillInfoDashBoardCallBack = function (scope, res, options, hasError) {
            $scope.Bills = res.Data;
        };
        $scope.getBillInfoDashBoard = function () {
            var inputData = {
                Data: $scope.currentcontext
            };

            var options = {
                action: 'billing/patientbills/GetBillInfoDashBoard',
                data: inputData,
                type: 'post',
                onComplete: $scope.getBillInfoDashBoardCallBack
            };
            utl.Http.doAction(options);
        };
        */

        /*
        $scope.getWardInfoDashBoardCallBack = function (scope, res, options, hasError) {
            $scope.Wards = res.Data;
            $scope.wardtotal = { BedsCount: 0, OccupiedBeds: 0, AvailableBeds: 0, OtherBeds: 0 };
            $scope.Wards.forEach((v) => {
                $scope.wardtotal.BedsCount += parseInt(v.BedsCount);
                $scope.wardtotal.OccupiedBeds += parseInt(v.OccupiedBeds);
                $scope.wardtotal.AvailableBeds += parseInt(v.AvailableBeds);
                $scope.wardtotal.OtherBeds += parseInt(v.OtherBeds);
            });
        };
        $scope.getWardInfoDashBoard = function () {
            var inputData = {
                Data: { FacilityId: $scope.currentcontext.FacilityId }
            };

            var options = {
                action: 'generalmaster/wardmaster/GetWardInfoDashBoard',
                data: inputData,
                type: 'post',
                onComplete: $scope.getWardInfoDashBoardCallBack
            };
            utl.Http.doAction(options);
        };
        */

        /*
        $scope.getDischargeNoticedListCallBack = function (scope, res, options, hasError) {
            $scope.fitfordischarge = res.Data;
        };
        $scope.getDischargeNoticedList = function () {
            var inputData = {
                Params: [
                    { Key: 3, Value: 3 },
                    { Key: 17, Value: $scope.currentcontext.FromDate },
                    { Key: 18, Value: $scope.currentcontext.ToDate }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getDischargeNoticedListCallBack
            };
            utl.Http.doAction(options);
        };
        */

        /*
        $scope.getDischargedListCallBack = function (scope, res, options, hasError) {
            $scope.dischargedlist = res.Data;
        };
        $scope.getDischargedList = function () {
            var inputData = {
                Params: [
                    { Key: 3, Value: 6 },
                    { Key: 17, Value: $scope.currentcontext.FromDate },
                    { Key: 18, Value: $scope.currentcontext.ToDate }
                ],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getDischargedListCallBack
            };
            utl.Http.doAction(options);
        };
        */

        /*
        $scope.getAdmittedListCallBack = function (scope, res, options, hasError) {
            $scope.admissionlist = res.Data;
        };
        $scope.getAdmittedList = function () {
            var inputData = {
                Params: [
                    { Key: 3, Value: 2 },
                    { Key: 17, Value: $scope.currentcontext.FromDate },
                    { Key: 18, Value: $scope.currentcontext.ToDate }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getAdmittedListCallBack
            };
            utl.Http.doAction(options);
        };
        */

        var groupBy_Category_Vendor = function (obj, values, context) {
            if (!values.length)
                return obj;
            var byFirst = _.groupBy(obj, values[0], context),
                rest = values.slice(1);
            for (var prop in byFirst) {
                byFirst[prop] = groupBy_Category_Vendor(byFirst[prop], rest, context);
            }
            return byFirst;
        };

        $scope.getToDayGrnsCallBack = function (scope, res, options, hasError) {
            $scope.PurchaseMedicalVendors = [];
            var PurchaseDetailedItems = [];
            var PurchaseDetailedItem = {};
            for (var purchaseidx in res.Data) {
                var purchaseitem = res.Data[purchaseidx];
                for (var purchasedetailidx in purchaseitem.GrnDetails) {
                    var purchasedetailitem = purchaseitem.GrnDetails[purchasedetailidx];
                    //PurchaseDetailedItems.push(purchasedetailitem);
                    var Category_Id = 0;
                    var Category_Name = '';
                    var Vendor_Id = 0;
                    var Vendor_Name = '';
                    var Cost_Value = 0;
                    var Sale_Value = 0;
                    var Margin_Value = 0;

                    if (purchasedetailitem.ItemMaster) {
                        Category_Id = purchasedetailitem.ItemMaster.CategoryId;
                        Category_Name = '';
                    }

                    if (purchasedetailitem.VendorMaster) {
                        Vendor_Id = purchasedetailitem.VendorMasterId;
                        Vendor_Name = purchasedetailitem.VendorMaster.VendorName;
                    }

                    Cost_Value = purchasedetailitem.GrnQuantity * purchasedetailitem.UnitCostPrice;
                    Sale_Value = purchasedetailitem.GrnQuantity * purchasedetailitem.UomMrPrice;
                    Margin_Value = Sale_Value - Cost_Value;

                    PurchaseDetailedItem = {
                        CategoryId: Category_Id,
                        CategoryName: Category_Name,
                        VendorId: Vendor_Id,
                        VendorName: Vendor_Name,
                        ItemMasterId: purchasedetailitem.ItemMasterId,
                        ItemName: purchasedetailitem.ItemName,
                        CostValue: Cost_Value,
                        SaleValue: Sale_Value,
                        MarginValue: Margin_Value
                    }

                    PurchaseDetailedItems.push(PurchaseDetailedItem);
                }
            }

            var groupedPurchaseDetailedItems = groupBy_Category_Vendor(PurchaseDetailedItems, ['CategoryId', 'VendorId']);
            for (var gpdidx in groupedPurchaseDetailedItems) {
                var gpditems = groupedPurchaseDetailedItems[gpdidx];
                for (var giidx in gpditems) {
                    var groupedpt = gpditems[giidx];
                    var G_CategoryId = 0;
                    var G_CategoryName = null;
                    var G_VendorId = 0;
                    var G_VendorName = null;
                    var G_CostValue = 0;
                    var G_SaleValue = 0;
                    var G_MarginValue = 0;
                    for (var i = 0, len = groupedpt.length; i < len; i++) {
                        var itemcostvalue = 0;
                        var itemsalevalue = 0;
                        var itemmarginvalue = 0;

                        G_CategoryId = groupedpt[i].CategoryId;
                        G_CategoryName = groupedpt[i].CategoryName;
                        G_VendorId = groupedpt[i].VendorId;
                        G_VendorName = groupedpt[i].VendorName;

                        itemcostvalue = groupedpt[i].CostValue;
                        itemsalevalue = groupedpt[i].SaleValue;
                        itemmarginvalue = groupedpt[i].MarginValue;

                        G_CostValue += itemcostvalue;
                        G_SaleValue += itemsalevalue;
                        G_MarginValue += itemmarginvalue;
                    }

                    var PurchaseMedicalVendor = {
                        CategoryId: G_CategoryId,
                        CategoryName: G_CategoryName,
                        VendorId: G_VendorId,
                        VendorName: G_VendorName,
                        PurchaseValue: G_CostValue,
                        SaleValue: G_SaleValue,
                        ProfitValue: G_MarginValue,
                        Status: 1
                    }

                    $scope.PurchaseMedicalVendors.push(PurchaseMedicalVendor);
                }
            }
        };

        $scope.GetToDayGrns = function () {
            var TodayDate = new Date().toISOString().slice(0, 10);
            var From = $filter('date')(TodayDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')(TodayDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 3, Value: 1 },
                    { Key: 6, Value: [2, 3] },
                    { Key: 8, Value: From },
                    { Key: 9, Value: To }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'pharmacy/grn/GetToDayGrns',
                data: inputData,
                type: 'post',
                onComplete: $scope.getToDayGrnsCallBack
            };
            utl.Http.doAction(options);
        };

        var groupBy_Category_ProductType = function (obj, values, context) {
            if (!values.length)
                return obj;
            var byFirst = _.groupBy(obj, values[0], context),
                rest = values.slice(1);
            for (var prop in byFirst) {
                byFirst[prop] = groupBy_Category_ProductType(byFirst[prop], rest, context);
            }
            return byFirst;
        };

        $scope.getToDayStockEntrysCallBack = function (scope, res, options, hasError) {
            $scope.OpeningMedicalProductTypes = [];
            var OpenDetailedItems = [];
            var OpenDetailedItem = {};
            for (var openidx in res.Data) {
                var openitem = res.Data[openidx];
                for (var opendetailidx in openitem.StockEntryDetails) {
                    var opendetailitem = openitem.StockEntryDetails[opendetailidx];
                    //OpenDetailedItems.push(opendetailitem);
                    var Category_Id = 0;
                    var Category_Name = '';
                    var Product_Type_Id = 0;
                    var Product_Type_Name = '';
                    var Cost_Value = 0;
                    var Sale_Value = 0;
                    var Margin_Value = 0;
                    if (opendetailitem.ItemMaster) {
                        Category_Id = opendetailitem.ItemMaster.CategoryId;
                        Category_Name = '';
                        if (opendetailitem.ItemMaster.ProductType) {
                            Product_Type_Id = opendetailitem.ItemMaster.ProductTypeId;
                            Product_Type_Name = opendetailitem.ItemMaster.ProductType.ProductTypeName;
                        }
                    }
                    Cost_Value = opendetailitem.EntryQuantity * opendetailitem.UnitCostPrice;
                    Sale_Value = opendetailitem.EntryQuantity * opendetailitem.MrPrice;
                    Margin_Value = Sale_Value - Cost_Value;
                    OpenDetailedItem = {
                        CategoryId: Category_Id,
                        CategoryName: Category_Name,
                        ProductTypeId: Product_Type_Id,
                        ProductTypeName: Product_Type_Name,
                        ItemMasterId: opendetailitem.ItemMasterId,
                        ItemName: opendetailitem.ItemName,
                        CostValue: Cost_Value,
                        SaleValue: Sale_Value,
                        MarginValue: Margin_Value
                    }
                    OpenDetailedItems.push(OpenDetailedItem);
                }
            }

            var groupedOpenDetailedItems = groupBy_Category_ProductType(OpenDetailedItems, ['CategoryId', 'ProductTypeId']);
            for (var godidx in groupedOpenDetailedItems) {
                var goditems = groupedOpenDetailedItems[godidx];
                for (var giidx in goditems) {
                    var groupedpt = goditems[giidx];
                    var G_CategoryId = 0;
                    var G_CategoryName = null;
                    var G_ProductTypeId = 0;
                    var G_ProductTypeName = null;
                    var G_CostValue = 0;
                    var G_SaleValue = 0;
                    var G_MarginValue = 0;
                    for (var i = 0, len = groupedpt.length; i < len; i++) {
                        var itemcostvalue = 0;
                        var itemsalevalue = 0;
                        var itemmarginvalue = 0;

                        G_CategoryId = groupedpt[i].CategoryId;
                        G_CategoryName = groupedpt[i].CategoryName;
                        G_ProductTypeId = groupedpt[i].ProductTypeId;
                        G_ProductTypeName = groupedpt[i].ProductTypeName;

                        itemcostvalue = groupedpt[i].CostValue;
                        itemsalevalue = groupedpt[i].SaleValue;
                        itemmarginvalue = groupedpt[i].MarginValue;

                        G_CostValue += itemcostvalue;
                        G_SaleValue += itemsalevalue;
                        G_MarginValue += itemmarginvalue;
                    }

                    var OpeningMedicalProductType = {
                        OpenCategoryId: G_CategoryId,
                        OpenCategoryName: G_CategoryName,
                        OpenProductTypeId: G_ProductTypeId,
                        OpenProductTypeName: G_ProductTypeName,
                        OpenCostValue: G_CostValue,
                        OpenSaleValue: G_SaleValue,
                        OpenMarginValue: G_MarginValue,
                        Status: 1
                    }

                    $scope.OpeningMedicalProductTypes.push(OpeningMedicalProductType);
                }
            }
        };

        $scope.GetToDayStockEntrys = function () {
            var TodayDate = new Date().toISOString().slice(0, 10);
            var From = $filter('date')(TodayDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')(TodayDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 4, Value: 1 },
                    { Key: 5, Value: [2, 3] },
                    { Key: 7, Value: From },
                    { Key: 8, Value: To }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'pharmacy/stockentry/GetToDayStockEntrys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getToDayStockEntrysCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.getToDayStockItemsCallBack = function (scope, res, options, hasError) {
            $scope.OpeningMedicalProductTypes = [];
            var OpenDetailedItems = [];
            var OpenDetailedItem = {};
            for (var openidx in res.Data) {
                var openitem = res.Data[openidx];
                for (var opendetailidx in openitem.StockEntryDetails) {
                    var opendetailitem = openitem.StockEntryDetails[opendetailidx];
                    //OpenDetailedItems.push(opendetailitem);
                    var Category_Id = 0;
                    var Category_Name = '';
                    var Product_Type_Id = 0;
                    var Product_Type_Name = '';
                    var Cost_Value = 0;
                    var Sale_Value = 0;
                    var Margin_Value = 0;
                    if (opendetailitem.ItemMaster) {
                        Category_Id = opendetailitem.ItemMaster.CategoryId;
                        Category_Name = '';
                        if (opendetailitem.ItemMaster.ProductType) {
                            Product_Type_Id = opendetailitem.ItemMaster.ProductTypeId;
                            Product_Type_Name = opendetailitem.ItemMaster.ProductType.ProductTypeName;
                        }
                    }
                    Cost_Value = opendetailitem.EntryQuantity * opendetailitem.UnitCostPrice;
                    Sale_Value = opendetailitem.EntryQuantity * opendetailitem.MrPrice;
                    Margin_Value = Sale_Value - Cost_Value;
                    OpenDetailedItem = {
                        CategoryId: Category_Id,
                        CategoryName: Category_Name,
                        ProductTypeId: Product_Type_Id,
                        ProductTypeName: Product_Type_Name,
                        ItemMasterId: opendetailitem.ItemMasterId,
                        ItemName: opendetailitem.ItemName,
                        CostValue: Cost_Value,
                        SaleValue: Sale_Value,
                        MarginValue: Margin_Value
                    }
                    OpenDetailedItems.push(OpenDetailedItem);
                }
            }

            var groupedOpenDetailedItems = groupBy_Category_ProductType(OpenDetailedItems, ['CategoryId', 'ProductTypeId']);
            for (var godidx in groupedOpenDetailedItems) {
                var goditems = groupedOpenDetailedItems[godidx];
                for (var giidx in goditems) {
                    var groupedpt = goditems[giidx];
                    var G_CategoryId = 0;
                    var G_CategoryName = null;
                    var G_ProductTypeId = 0;
                    var G_ProductTypeName = null;
                    var G_CostValue = 0;
                    var G_SaleValue = 0;
                    var G_MarginValue = 0;
                    for (var i = 0, len = groupedpt.length; i < len; i++) {
                        var itemcostvalue = 0;
                        var itemsalevalue = 0;
                        var itemmarginvalue = 0;

                        G_CategoryId = groupedpt[i].CategoryId;
                        G_CategoryName = groupedpt[i].CategoryName;
                        G_ProductTypeId = groupedpt[i].ProductTypeId;
                        G_ProductTypeName = groupedpt[i].ProductTypeName;

                        itemcostvalue = groupedpt[i].CostValue;
                        itemsalevalue = groupedpt[i].SaleValue;
                        itemmarginvalue = groupedpt[i].MarginValue;

                        G_CostValue += itemcostvalue;
                        G_SaleValue += itemsalevalue;
                        G_MarginValue += itemmarginvalue;
                    }

                    var OpeningMedicalProductType = {
                        OpenCategoryId: G_CategoryId,
                        OpenCategoryName: G_CategoryName,
                        OpenProductTypeId: G_ProductTypeId,
                        OpenProductTypeName: G_ProductTypeName,
                        OpenCostValue: G_CostValue,
                        OpenSaleValue: G_SaleValue,
                        OpenMarginValue: G_MarginValue,
                        Status: 1
                    }

                    $scope.OpeningMedicalProductTypes.push(OpeningMedicalProductType);
                }
            }
        };

        $scope.GetToDayStockItems = function () {
            var inputData = {
                Params: [
                    { Key: 1, Value: 1 },
                    { Key: 6, Value: 1 },
                    { Key: 7, Value: 1 }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'pharmacy/stockitem/GetToDayStockItems',
                data: inputData,
                type: 'post',
                onComplete: $scope.getToDayStockItemsCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.LoadDashboard = function () {
            $scope.GetToDayStockItems();
            $scope.GetToDayStockEntrys();
            $scope.GetToDayGrns();

            //$scope.GetFacilityDashboardOptions();
            //$scope.getWardInfoDashBoard();
            //$scope.getDischargeNoticedList();
            //$scope.getDischargedList();
            //$scope.getAdmittedList();
        }

        $scope.LoadDashboard();
    }
    inventorydashboardFormController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();