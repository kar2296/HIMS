(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('dailysalessummarybyitemController', dailysalessummarybyitemController);

    function dailysalessummarybyitemController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
            // UserId: utl.Session.getCurrentUserId(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            StoreMasterId: 0
        };
        $scope.lookup = {};
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Item Name", "Product Name", "Opening Qty", "InQty", "OutQty", "Closing Qty", "UCP", "MRP", "TotalUCP", "TotalMRP"]
            let csvContent = JsonFields.join(",") + "\n";

            $scope.ConSaledataSummary = data;
            $scope.NetdataSummary = [];
            $scope.OveralldataSummary = [];
            if ($scope.ConSaledataSummary) {
                var SaleSummary = [];
                var ReturnSummary = [];
                if ($scope.ConSaledataSummary.length > 0) {
                    SaleSummary = $scope.ConSaleSummary[0].Value;
                }
                if ($scope.ConSaledataSummary.length > 1) {
                    ReturnSummary = $scope.ConSaleSummary[1].Value;
                }
                if (SaleSummary) {
                    for (var idx in SaleSummary) {
                        var ItemName = '';
                        var ItemCode = '';
                        var Quantity = 0;
                        var Mrp = 0;
                        var Ucp = 0;
                        var PurchasePrice = 0;
                        var Profit = 0;
                        var SaleAmount = 0;
                        var Discount = 0;
                        var TotalSales = 0;
                        var salesummary = SaleSummary[idx];
                        for (var sdx in salesummary) {
                            var itemsale = salesummary[sdx];
                            ItemName = itemsale.ItemName
                            ItemCode = itemsale.ItemCode;
                            Quantity = itemsale.Quantity;
                            Mrp = itemsale.AvgMrp;
                            Ucp = itemsale.AvgUcp;
                            PurchasePrice = (Ucp * Quantity).toFixed(2);
                            SaleAmount = parseFloat(itemsale.SaleAmount).toFixed(2);
                            Discount = parseFloat(itemsale.Discount).toFixed(2);
                            TotalSales = parseFloat(itemsale.TotalSales).toFixed(2);
                            Profit = (TotalSales - PurchasePrice).toFixed(2);
                            var valappended = 0;
                            $scope.NetdataSummary.forEach(function (item) {
                                if (ItemName == item.ItemName) {
                                    item.ItemName = itemsale.ItemName;
                                    item.ItemCode = itemsale.ItemCode;
                                    item.Quantity = itemsale.Quantity;
                                    item.Mrp = parseFloat(itemsale.AvgMrp).toFixed(2) || 0;
                                    item.Ucp = parseFloat(itemsale.AvgUcp).toFixed(2) || 0;
                                    item.PurchasePrice = (parseFloat(itemsale.AvgUcp) * itemsale.Quantity).toFixed(2) || 0;
                                    item.SaleAmount = parseFloat(itemsale.SaleAmount).toFixed(2) || 0;
                                    item.Discount = parseFloat(itemsale.Discount).toFixed(2) || 0;
                                    item.TotalSales = parseFloat(itemsale.TotalSales).toFixed(2) || 0;
                                    item.Profit = (item.TotalSales - item.PurchasePrice).toFixed(2);
                                    valappended = 1;
                                }
                            });
                            if (valappended == 0)
                                $scope.NetdataSummary.push({
                                    'ItemName': ItemName,
                                    'ItemCode': ItemCode,
                                    'Quantity': Quantity,
                                    'Mrp': Mrp,
                                    'Ucp': Ucp,
                                    'PurchasePrice': PurchasePrice,
                                    'SaleAmount': SaleAmount,
                                    'Discount': Discount,
                                    'TotalSales': TotalSales,
                                    'Profit': Profit
                                })
                        }
                    }
                }
                if (ReturnSummary) {
                    for (var idx in ReturnSummary) {
                        var ItemName = '';
                        var ItemCode = '';
                        var ReturnQuantity = 0;
                        var ReturnMrp = 0;
                        var ReturnAmount = 0;
                        var ReturnDiscount = 0;
                        var TotalReturns = 0;
                        var retsummary = ReturnSummary[idx];
                        for (var sdx in retsummary) {
                            var itemreturn = retsummary[sdx];
                            ItemName = itemreturn.ItemName
                            ItemCode = itemreturn.ItemCode;
                            ReturnQuantity = itemreturn.ReturnQuantity;
                            ReturnMrp = parseFloat(itemreturn.ReturnMrp).toFixed(2);
                            ReturnAmount = parseFloat(itemreturn.ReturnAmount).toFixed(2);
                            ReturnDiscount = parseFloat(itemreturn.ReturnDiscount).toFixed(2);
                            TotalReturns = parseFloat(itemreturn.TotalReturns).toFixed(2);
                            var valappended = 0;
                            $scope.NetdataSummary.forEach(function (item) {
                                if (ItemName == item.ItemName) {
                                    item.ItemName = itemreturn.ItemName;
                                    item.ItemCode = itemreturn.ItemCode;
                                    item.ReturnQuantity = itemreturn.ReturnQuantity;
                                    item.ReturnMrp = parseFloat(itemreturn.ReturnMrp).toFixed(2) || 0;
                                    item.ReturnAmount = parseFloat(itemreturn.ReturnAmount).toFixed(2) || 0;
                                    item.ReturnDiscount = parseFloat(itemreturn.ReturnDiscount).toFixed(2) || 0;
                                    item.TotalReturns = parseFloat(itemreturn.TotalReturns).toFixed(2) || 0;
                                    valappended = 1;
                                }
                            });
                            if (valappended == 0)
                                $scope.NetdataSummary.push({
                                    'ItemName': ItemName,
                                    'ItemCode': ItemCode,
                                    'ReturnQuantity': ReturnQuantity,
                                    'ReturnMrp': ReturnMrp,
                                    'ReturnAmount': ReturnAmount,
                                    'ReturnDiscount': ReturnDiscount,
                                    'TotalReturns': TotalReturns
                                })
                        }
                    }
                }

                for (var idx in $scope.NetdataSummary) {
                    var allsale = $scope.NetdataSummary[idx];
                    allsale.NetSales = parseFloat((allsale.TotalSales || 0) - (allsale.TotalReturns || 0)).toFixed(2);
                    $scope.OveralldataSummary.push(allsale);
                }

            }
            var TotSalesQty = 0;
            var TotPurchasePrice = 0;
            var TotMrp = 0;
            var TotSalesAmount = 0;
            var TotDiscount = 0;
            var FooterSalesAmount = 0;
            var TotProfit = 0;
            var TotReturnQty = 0;
            var TotReturnAmount = 0;
            var TotReturnDiscount = 0;
            var FooterReturnAmount = 0;
            var FooterNetAmount = 0;
            for (var jdx in $scope.OveralldataSummary) {
                var netsalessummary = $scope.OveralldataSummary[jdx];
                TotSalesQty = TotSalesQty + (netsalessummary.Quantity || 0);
                TotMrp = TotMrp + parseFloat(netsalessummary.Mrp || 0);
                TotPurchasePrice = TotPurchasePrice + parseFloat(netsalessummary.PurchasePrice || 0);
                TotSalesAmount = TotSalesAmount + parseFloat(netsalessummary.SaleAmount || 0);
                TotDiscount = TotDiscount + parseFloat(netsalessummary.Discount || 0);
                TotProfit = TotProfit + parseFloat(netsalessummary.Profit || 0);
                FooterSalesAmount = FooterSalesAmount + parseFloat(netsalessummary.TotalSales || 0);
                TotReturnQty = TotReturnQty + (netsalessummary.ReturnQuantity || 0);
                TotReturnAmount = TotReturnAmount + parseFloat(netsalessummary.ReturnAmount || 0);
                TotReturnDiscount = TotReturnDiscount + parseFloat(netsalessummary.ReturnDiscount || 0);
                FooterReturnAmount = FooterReturnAmount + parseFloat(netsalessummary.TotalReturns || 0);
                FooterNetAmount = FooterNetAmount + parseFloat(netsalessummary.NetSales || 0);
            }
            $scope.TotPurchasePrice = TotPurchasePrice;
            $scope.TotSalesQty = TotSalesQty;
            $scope.TotMrp = TotMrp;
            $scope.TotSalesAmount = parseFloat(TotSalesAmount).toFixed(2);
            $scope.TotDiscount = parseFloat(TotDiscount).toFixed(2);
            $scope.TotProfit = parseFloat(TotProfit).toFixed(2);
            $scope.FooterSalesAmount = parseFloat(FooterSalesAmount).toFixed(2);
            $scope.TotReturnQty = TotReturnQty;
            $scope.TotReturnAmount = parseFloat(TotReturnAmount).toFixed(2);
            $scope.TotReturnDiscount = parseFloat(TotReturnDiscount).toFixed(2);
            $scope.FooterReturnAmount = parseFloat(FooterReturnAmount).toFixed(2);
            $scope.FooterNetAmount = parseFloat(FooterNetAmount).toFixed(2);



            $scope.OveralldataSummary.forEach(function (rowArray) {

                var itemname = '';
                var itemcode = '';
                var saleqty = '';
                var purchaseprice = '';
                var mrp = '';
                var saleamt = '';
                var discount = '';
                var totalsaleamt = '';
                var profit = '';
                var retqty = '';
                var retamt = '';
                var retdis = '';
                var totalretamt = '';
                var netsale = '';

                if (rowArray.ItemName) {
                    itemname = rowArray.ItemName;
                    // returnDate = utl.Formatter.getDateTimeString(rowArray.ReturnDateTime);
                }
                if (rowArray.ItemCode) {
                    itemcode = rowArray.ItemCode;
                }
                if (rowArray.Quantity) {
                    saleqty = rowArray.Quantity;
                }
                if (rowArray.PurchasePrice) {
                    purchaseprice = rowArray.PurchasePrice;
                }
                if (rowArray.Mrp) {
                    mrp = rowArray.Mrp;
                }
                if (rowArray.SaleAmount) {
                    saleamt = rowArray.SaleAmount;
                }
                if (rowArray.Discount) {
                    discount = rowArray.Discount;
                }
                if (rowArray.TotalSales) {
                    totalsaleamt = rowArray.TotalSales;
                }
                if (rowArray.Profit) {
                    profit = rowArray.Profit;
                }
                if (rowArray.ReturnQuantity) {
                    retqty = rowArray.ReturnQuantity;
                }
                if (rowArray.ReturnAmount) {
                    retamt = rowArray.ReturnAmount;
                }
                if (rowArray.ReturnDiscount) {
                    retdis = rowArray.ReturnDiscount;
                }
                if (rowArray.TotalReturns) {
                    totalretamt = rowArray.TotalReturns;
                }
                if (rowArray.NetSales) {
                    netsale = rowArray.NetSales;
                }


                csvContent += itemname + ',' + productname + ',' + Openingqty + ',' + inqty + ',' + outqty + ',' + closingqty + ',' + ucp + ',' + mrp + ',' + totalucp + ',' + totalmrp + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'dailysalessummarybyitem-report.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    StoreMasterId: $scope.currentfilter.StoreMasterId || 0,
                    ItemMasterId: $scope.currentfilter.ItemMasterId || 0
                }
            };

            var options = {
                action: 'billing/PatientBillDetails/GetDailySalesSummarybyItem',
                data: inputData,
                type: 'post',
                onComplete: $scope.excelDownloadCallbackExcel
            };

            utl.Http.doAction(options);
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.ConSaleSummary = res;
            $scope.NetSummary = [];
            $scope.OverallSummary = [];
            if ($scope.ConSaleSummary) {
                var SaleSummary = [];
                var ReturnSummary = [];
                if ($scope.ConSaleSummary.length > 0) {
                    SaleSummary = $scope.ConSaleSummary[0].Value;
                }
                if ($scope.ConSaleSummary.length > 1) {
                    ReturnSummary = $scope.ConSaleSummary[1].Value;
                }
                if (SaleSummary) {
                    for (var idx in SaleSummary) {
                        var ItemName = '';
                        var ItemCode = '';
                        var Quantity = 0;
                        var Mrp = 0;
                        var Ucp = 0;
                        var PurchasePrice = 0;
                        var Profit = 0;
                        var SaleAmount = 0;
                        var Discount = 0;
                        var TotalSales = 0;
                        var salesummary = SaleSummary[idx];
                        for (var sdx in salesummary) {
                            var itemsale = salesummary[sdx];
                            ItemName = itemsale.ItemName
                            ItemCode = itemsale.ItemCode;
                            Quantity = itemsale.Quantity;
                            Mrp = itemsale.AvgMrp;
                            Ucp = itemsale.AvgUcp;
                            PurchasePrice = (Ucp * Quantity).toFixed(2);
                            SaleAmount = parseFloat(itemsale.SaleAmount).toFixed(2);
                            Discount = parseFloat(itemsale.Discount).toFixed(2);
                            TotalSales = parseFloat(itemsale.TotalSales).toFixed(2);
                            Profit = (TotalSales - PurchasePrice).toFixed(2);
                            var valappended = 0;
                            $scope.NetSummary.forEach(function (item) {
                                if (ItemName == item.ItemName) {
                                    item.ItemName = itemsale.ItemName;
                                    item.ItemCode = itemsale.ItemCode;
                                    item.Quantity = itemsale.Quantity;
                                    item.Mrp = parseFloat(itemsale.AvgMrp).toFixed(2) || 0;
                                    item.Ucp = parseFloat(itemsale.AvgUcp).toFixed(2) || 0;
                                    item.PurchasePrice = (parseFloat(itemsale.AvgUcp) * itemsale.Quantity).toFixed(2) || 0;
                                    item.SaleAmount = parseFloat(itemsale.SaleAmount).toFixed(2) || 0;
                                    item.Discount = parseFloat(itemsale.Discount).toFixed(2) || 0;
                                    item.TotalSales = parseFloat(itemsale.TotalSales).toFixed(2) || 0;
                                    item.Profit = (item.TotalSales - item.PurchasePrice).toFixed(2);
                                    valappended = 1;
                                }
                            });
                            if (valappended == 0)
                                $scope.NetSummary.push({
                                    'ItemName': ItemName,
                                    'ItemCode': ItemCode,
                                    'Quantity': Quantity,
                                    'Mrp': Mrp,
                                    'Ucp': Ucp,
                                    'PurchasePrice': PurchasePrice,
                                    'SaleAmount': SaleAmount,
                                    'Discount': Discount,
                                    'TotalSales': TotalSales,
                                    'Profit': Profit
                                })
                        }
                    }
                }
                if (ReturnSummary) {
                    for (var idx in ReturnSummary) {
                        var ItemName = '';
                        var ItemCode = '';
                        var ReturnQuantity = 0;
                        var ReturnMrp = 0;
                        var ReturnAmount = 0;
                        var ReturnDiscount = 0;
                        var TotalReturns = 0;
                        var retsummary = ReturnSummary[idx];
                        for (var sdx in retsummary) {
                            var itemreturn = retsummary[sdx];
                            ItemName = itemreturn.ItemName
                            ItemCode = itemreturn.ItemCode;
                            ReturnQuantity = itemreturn.ReturnQuantity;
                            ReturnMrp = parseFloat(itemreturn.ReturnMrp).toFixed(2);
                            ReturnAmount = parseFloat(itemreturn.ReturnAmount).toFixed(2);
                            ReturnDiscount = parseFloat(itemreturn.ReturnDiscount).toFixed(2);
                            TotalReturns = parseFloat(itemreturn.TotalReturns).toFixed(2);
                            var valappended = 0;
                            $scope.NetSummary.forEach(function (item) {
                                if (ItemName == item.ItemName) {
                                    item.ItemName = itemreturn.ItemName;
                                    item.ItemCode = itemreturn.ItemCode;
                                    item.ReturnQuantity = itemreturn.ReturnQuantity;
                                    item.ReturnMrp = parseFloat(itemreturn.ReturnMrp).toFixed(2) || 0;
                                    item.ReturnAmount = parseFloat(itemreturn.ReturnAmount).toFixed(2) || 0;
                                    item.ReturnDiscount = parseFloat(itemreturn.ReturnDiscount).toFixed(2) || 0;
                                    item.TotalReturns = parseFloat(itemreturn.TotalReturns).toFixed(2) || 0;
                                    valappended = 1;
                                }
                            });
                            if (valappended == 0)
                                $scope.NetSummary.push({
                                    'ItemName': ItemName,
                                    'ItemCode': ItemCode,
                                    'ReturnQuantity': ReturnQuantity,
                                    'ReturnMrp': ReturnMrp,
                                    'ReturnAmount': ReturnAmount,
                                    'ReturnDiscount': ReturnDiscount,
                                    'TotalReturns': TotalReturns
                                })
                        }
                    }
                }

                for (var idx in $scope.NetSummary) {
                    var allsale = $scope.NetSummary[idx];
                    allsale.NetSales = parseFloat((allsale.TotalSales || 0) - (allsale.TotalReturns || 0)).toFixed(2);
                    $scope.OverallSummary.push(allsale);
                }

            }
            var TotSalesQty = 0;
            var TotPurchasePrice = 0;
            var TotMrp = 0;
            var TotSalesAmount = 0;
            var TotDiscount = 0;
            var FooterSalesAmount = 0;
            var TotProfit = 0;
            var TotReturnQty = 0;
            var TotReturnAmount = 0;
            var TotReturnDiscount = 0;
            var FooterReturnAmount = 0;
            var FooterNetAmount = 0;
            for (var jdx in $scope.OverallSummary) {
                var netsalessummary = $scope.OverallSummary[jdx];
                TotSalesQty = TotSalesQty + (netsalessummary.Quantity || 0);
                TotMrp = TotMrp + parseFloat(netsalessummary.Mrp || 0);
                TotPurchasePrice = TotPurchasePrice + parseFloat(netsalessummary.PurchasePrice || 0);
                TotSalesAmount = TotSalesAmount + parseFloat(netsalessummary.SaleAmount || 0);
                TotDiscount = TotDiscount + parseFloat(netsalessummary.Discount || 0);
                TotProfit = TotProfit + parseFloat(netsalessummary.Profit || 0);
                FooterSalesAmount = FooterSalesAmount + parseFloat(netsalessummary.TotalSales || 0);
                TotReturnQty = TotReturnQty + (netsalessummary.ReturnQuantity || 0);
                TotReturnAmount = TotReturnAmount + parseFloat(netsalessummary.ReturnAmount || 0);
                TotReturnDiscount = TotReturnDiscount + parseFloat(netsalessummary.ReturnDiscount || 0);
                FooterReturnAmount = FooterReturnAmount + parseFloat(netsalessummary.TotalReturns || 0);
                FooterNetAmount = FooterNetAmount + parseFloat(netsalessummary.NetSales || 0);
            }
            $scope.TotPurchasePrice = TotPurchasePrice;
            $scope.TotSalesQty = TotSalesQty;
            $scope.TotMrp = TotMrp;
            $scope.TotSalesAmount = parseFloat(TotSalesAmount).toFixed(2);
            $scope.TotDiscount = parseFloat(TotDiscount).toFixed(2);
            $scope.TotProfit = parseFloat(TotProfit).toFixed(2);
            $scope.FooterSalesAmount = parseFloat(FooterSalesAmount).toFixed(2);
            $scope.TotReturnQty = TotReturnQty;
            $scope.TotReturnAmount = parseFloat(TotReturnAmount).toFixed(2);
            $scope.TotReturnDiscount = parseFloat(TotReturnDiscount).toFixed(2);
            $scope.FooterReturnAmount = parseFloat(FooterReturnAmount).toFixed(2);
            $scope.FooterNetAmount = parseFloat(FooterNetAmount).toFixed(2);


        };

        $scope.getList = function () {
            var startTime = new Date($scope.currentfilter.FromDate);
            var endTime = new Date($scope.currentfilter.ToDate);
            var difference = endTime.getTime() - startTime.getTime();
            var resultInDays = Math.round(difference / (1000 * 60 * 60 * 24)); // Calculate difference in days
            if (!(resultInDays >= 0 && resultInDays <= 31)) { // Check if difference is less than 15 days
                utl.Alert.showSuccessMsg("From and To Date Difference should be less than one month...");
                $scope.currentfilter.FromDate = new Date();
                $scope.currentfilter.ToDate = new Date();
                return false;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    StoreMasterId: $scope.currentfilter.StoreMasterId || 0,
                    ItemMasterId: $scope.currentfilter.ItemMasterId || 0
                }
            };

            var options = {
                action: 'billing/PatientBillDetails/GetDailySalesSummarybyItem',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.currentfilter.CreatedBy = -1
                $scope.getList();
            }
        };
        $scope.backtoReport = function () {
            $state.go('app.pharmacytabreport.invoicecollectionreport')
        };

        $scope.SelectedFromStore = function (selectedItem) {
            $scope.currentfilter.StoreMaster = selectedItem.StoreName;
        };

        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    StoreMasterId: $scope.currentfilter.StoreMasterId || 0,
                    StoreMaster: $scope.currentfilter.StoreMaster || 0,
                    ItemMasterId: $scope.currentfilter.ItemMasterId || 0
                }

            };
            var options = {
                action: 'billing/PatientBillDetails/PrintDailySalesSummaryReport',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.currentfilter.StoreMasterId === 0) {
                    $scope.currentfilter.StoreMasterId = value[0].Id;
                    $scope.currentfilter.StoreMaster = value[0].Text;
                }
            });
            // $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Facility",
                Request: {
                    Params: [{
                        Key: 4,
                        Value: true
                    }]
                }
            },
            {
                "Key": "UserStores",
                Default: false,
                Request: {
                    Params: [{
                        Key: 1,
                        Value: utl.Session.getCurrentUserId()
                    },
                    {
                        Key: 2,
                        Value: utl.Session.getCurrentFacilityId()
                    },
                    {
                        Key: 5,
                        Value: 2
                    }
                    ]
                }
            },
            ]
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

    dailysalessummarybyitemController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();