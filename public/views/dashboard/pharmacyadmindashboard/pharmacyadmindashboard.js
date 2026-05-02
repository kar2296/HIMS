(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PharmacyadmindashboardController', PharmacyadmindashboardController);

    function PharmacyadmindashboardController($rootScope, $scope, $timeout, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        $scope.items = [];
        $scope.currentcontext = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            CurrentDate: utl.Formatter.getCurrentDate(),
            StoreMasterId: 0
        }
        $scope.lookup = {};
        /* Side Menu close*/
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        /* Side Menu close*/

        $scope.GetFacilityDashboardOptionsCallBack = function (scope, res, options, hasError) {
            $scope.PharmacyCollectionDetails = [];
            $scope.FacilityInfo = [];
            $scope.TotCash = 0;
            $scope.TotCard = 0;
            $scope.TotUPI = 0;
            $scope.AllTotal = 0;
            if (res.receipt) {
                $scope.FacilityInfo.push(res.receipt[3]);
            }
            if (res.refund) {
                $scope.FacilityInfo.push(res.refund[0]);
            }
            if ($scope.FacilityInfo.length > 0) {
                for (var pdx in $scope.FacilityInfo) {
                    var colectData = $scope.FacilityInfo[pdx];
                    if (colectData.Key == 'Pharmacy Collection') {
                        colectData.Key = 'Sales';
                    }
                    if (colectData.Key == 'Pharmacy Refund') {
                        colectData.Key = 'Return';
                        colectData.Value.BillAmount = colectData.Value.ReturnAmount;
                    }
                    $scope.PharmacyCollectionDetails.push(colectData);
                }
            }

            if ($scope.PharmacyCollectionDetails.length > 0) {
                var saleData = $scope.PharmacyCollectionDetails[0];
                var retData = $scope.PharmacyCollectionDetails[1];
                $scope.TotCash = (parseFloat(saleData.Value.CashAmount || 0) - parseFloat(retData.Value.CashAmount || 0)).toFixed(2);
                $scope.TotCard = (parseFloat(saleData.Value.CardAmount || 0) - parseFloat(retData.Value.CardAmount || 0)).toFixed(2);
                $scope.TotUPI = (parseFloat(saleData.Value.OtherAmount || 0) - parseFloat(retData.Value.OtherAmount || 0)).toFixed(2);
                $scope.AllTotal = (parseFloat(saleData.Value.BillAmount || 0) - parseFloat(retData.Value.BillAmount || 0)).toFixed(2);
            }
        }

        $scope.GetFacilityDashboardOptions = function () {

            $scope.currentcontext.FromDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 00:00:00');
            $scope.currentcontext.ToDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 23:59:59');

            var inputData = {
                Data: {
                    Keys: [{
                        Key: 'receipt'
                    },
                    {
                        Key: 'refund'
                    }
                    ]
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


        $scope.getPurchasebySupplierCallBack = function (scope, res, options, hasError) {
            $scope.Collection = res;
            $scope.suppliercollection = [];
            $scope.NetSupplierCollection = [];
            if ($scope.Collection) {
                var suppliercollection = [];
                if ($scope.Collection.length > 0) {
                    suppliercollection = $scope.Collection[0].Value;
                }
                for (var idx in suppliercollection) {
                    var suppliercoll = suppliercollection[idx];
                    var Key = '';
                    var InvoiceAmt = 0;
                    var NetAmt = 0;
                    for (var ix in suppliercoll) {
                        $scope.VendorName = '';
                        if (suppliercoll[ix].VendorName) {
                            $scope.VendorName = suppliercoll[ix].VendorName;
                        }

                        // if (suppliercoll[ix].TotalGrossAmount) {
                        //     GrossAmt = suppliercoll[ix].TotalGrossAmount;
                        // }
                        // if (suppliercoll[ix].TotalGstAmount) {
                        //     GstAmt = suppliercoll[ix].TotalGstAmount;
                        // }
                        if (suppliercoll[ix].TotalNetAmount) {
                            NetAmt = suppliercoll[ix].TotalNetAmount;
                        }
                        // if (suppliercoll[ix].TotalCreditAmount) {
                        //     CreditAmt = suppliercoll[ix].TotalCreditAmount;
                        // }
                        if (suppliercoll[ix].TotalInvoiceAmount) {
                            InvoiceAmt = suppliercoll[ix].TotalInvoiceAmount;
                        }
                        Key = $scope.VendorName;
                        NetAmt = NetAmt;
                        InvoiceAmt = InvoiceAmt;
                    }
                    $scope.NetSupplierCollection.push({
                        'Key': Key,
                        'NetAmt': NetAmt,
                        'InvoiceAmt': InvoiceAmt,
                    })
                }
            }
            $scope.TotNetAmount = 0;
            if ($scope.NetSupplierCollection.length > 0) {
                for (var sdx in $scope.NetSupplierCollection) {
                    var supplypurchase = $scope.NetSupplierCollection[sdx];
                    $scope.TotNetAmount += parseFloat(supplypurchase.NetAmt || 0);
                }
            }
        };

        $scope.getPurchasebySupplier = function () {
            var From = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId()
                },
            };

            var options = {
                action: 'pharmacy/grn/GetSupplierInvoiceSummary',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPurchasebySupplierCallBack
            };
            utl.Http.doAction(options);
        }
        $scope.getPurchaseReturnbySupplierCallBack = function (scope, res, options, hasError) {
            $scope.Collection = res;
            $scope.NetSupplierReturn = [];
            $scope.supplierreturncollection = [];
            if ($scope.Collection) {
                var supplierreturncollection = [];
                if ($scope.Collection.length > 1) {
                    supplierreturncollection = $scope.Collection[1].Value;
                }
                for (var idx in supplierreturncollection) {
                    var supplierret = supplierreturncollection[idx];
                    var Key = '';
                    var ReturnAmt = 0;
                    for (var ix in supplierret) {
                        $scope.VendorName = '';
                        if (supplierret[ix].VendorName) {
                            $scope.VendorName = supplierret[ix].VendorName;
                        }

                        if (supplierret[ix].TotalReturnAmount) {
                            ReturnAmt = supplierret[ix].TotalReturnAmount;
                        }
                        Key = $scope.VendorName;
                        ReturnAmt = ReturnAmt;
                    }
                    $scope.NetSupplierReturn.push({
                        'Key': Key,
                        'ReturnAmt': ReturnAmt,
                    })
                }
            }
            $scope.TotPurReturnAmt = 0;
            if ($scope.NetSupplierReturn.length > 0) {
                for (var sdx in $scope.NetSupplierReturn) {
                    var supplypurchase = $scope.NetSupplierReturn[sdx];
                    $scope.TotPurReturnAmt += parseFloat(supplypurchase.ReturnAmt || 0);
                }
            }
        };

        $scope.getPurchaseReturnbySupplier = function () {
            var From = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId()
                },
            };

            var options = {
                action: 'pharmacy/grn/GetSupplierInvoiceSummary',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPurchaseReturnbySupplierCallBack
            };
            utl.Http.doAction(options);
        }

        $scope.getOutstandingDetailsCallBack = function (scope, res, options, hasError) {
            $scope.PharmacyDueDetails = res.pharmacydue;
            $scope.TotDueAmount = 0;
            if (res.pharmacydue) {
                var totDue = 0;
                for (var pdx in $scope.PharmacyDueDetails) {
                    var pharDue = $scope.PharmacyDueDetails[pdx];
                    totDue = totDue + parseFloat(pharDue.Value.OutStandingAmount || 0);
                }
            }
            $scope.TotDueAmount = totDue;
        }

        $scope.getOutstandingDetails = function () {

            $scope.currentcontext.FromDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 00:00:00');
            $scope.currentcontext.ToDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 23:59:59');

            var inputData = {
                Data: {
                    Keys: [{
                        Key: 'pharmacydue'
                    }]
                },
                Attributes: $scope.currentcontext
            };

            var options = {
                action: 'SystemSettings/facilitydashboard/GetFacilityDashboardOptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getOutstandingDetailsCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.getStockValueDetailsCallback = function (scope, res, options, hasError) {
            $scope.Stockvalue = [];
            var totalFooterUcp = 0;
            var totalFooterMrp = 0;
            var totalFooterProfit = 0;
            var GroupedBatchData = _.groupBy(res.Data, 'ItemMaster.ProductTypeId')
            for (var prdtdx in GroupedBatchData) {
                var productgrouped = GroupedBatchData[prdtdx];
                var proddata = {
                    TotalUcp: 0,
                    TotalMrp: 0,
                    Profit: 0
                };
                for (var idx in productgrouped) {
                    var item = productgrouped[idx];
                    proddata.TotalUcp += parseFloat(item.Quantity) * parseFloat(item.Ucp);
                    proddata.TotalMrp += parseFloat(item.Quantity) * parseFloat(item.Mrp);
                    proddata.Profit = (proddata.TotalMrp) - (proddata.TotalUcp);
                    proddata.ProductTypeName = item.ItemMaster.ProductType.ProductTypeName;
                }
                totalFooterUcp = totalFooterUcp + (proddata.TotalUcp);
                totalFooterMrp = totalFooterMrp + (proddata.TotalMrp);
                totalFooterProfit = totalFooterProfit + (proddata.Profit);
                $scope.Stockvalue.push(proddata);
            }
            $scope.TotalFooterUcp = totalFooterUcp;
            $scope.TotalFooterMrp = totalFooterMrp;
            $scope.TotalFooterProfit = totalFooterProfit;
        };

        $scope.getStockValueDetails = function () {
            var From = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 00:00:00') || null;
            // var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: 1
                },
                {
                    Key: 11,
                    Value: '0'
                },
                {
                    Key: 7,
                    Value: From
                },
                {
                    Key: 3,
                    Value: $scope.currentcontext.FacilityId
                },
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'pharmacy/stockserialitem/GetValueStockSerialItems',
                data: inputData,
                type: 'post',
                onComplete: $scope.getStockValueDetailsCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getSecondstoreStockValueDetailsCallback = function (scope, res, options, hasError) {
            $scope.SecStockvalue = [];
            var sectotalFooterUcp = 0;
            var totalFooterMrp = 0;
            var totalFooterProfit = 0;
            var GroupedBatchData = _.groupBy(res.Data, 'ItemMaster.ProductTypeId')
            for (var prdtdx in GroupedBatchData) {
                var productgrouped = GroupedBatchData[prdtdx];
                var proddata = {
                    TotalUcp: 0,
                    TotalMrp: 0,
                    Profit: 0
                };
                for (var idx in productgrouped) {
                    var item = productgrouped[idx];
                    proddata.TotalUcp += parseFloat(item.Quantity) * parseFloat(item.Ucp);
                    proddata.TotalMrp += parseFloat(item.Quantity) * parseFloat(item.Mrp);
                    proddata.Profit = (proddata.TotalMrp) - (proddata.TotalUcp);
                    proddata.ProductTypeName = item.ItemMaster.ProductType.ProductTypeName;
                }
                sectotalFooterUcp = sectotalFooterUcp + (proddata.TotalUcp);
                totalFooterMrp = totalFooterMrp + (proddata.TotalMrp);
                totalFooterProfit = totalFooterProfit + (proddata.Profit);
                $scope.SecStockvalue.push(proddata);
            }
            $scope.SecTotalFooterUcp = sectotalFooterUcp;
            $scope.TotalFooterMrp = totalFooterMrp;
            $scope.TotalFooterProfit = totalFooterProfit;
        };

        $scope.getSecondstoreStockValueDetails = function () {
            var From = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 00:00:00') || null;
            // var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: 2
                },
                {
                    Key: 11,
                    Value: '0'
                },
                {
                    Key: 7,
                    Value: From
                },
                {
                    Key: 3,
                    Value: $scope.currentcontext.FacilityId
                },
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'pharmacy/stockserialitem/GetValueStockSerialItems',
                data: inputData,
                type: 'post',
                onComplete: $scope.getSecondstoreStockValueDetailsCallback
            };

            utl.Http.doAction(options);
        };

        $scope.GetPharmacyDetailsCallBack = function (scope, res, options, hasError) {
            $scope.PharDetails = res;
            $scope.NetPharmaDetails = [];
            $scope.AllPharmaDetails = [];
            if ($scope.PharDetails) {
                var saleDetails = [];
                var returnDetails = [];
                if ($scope.PharDetails.length > 0) {
                    saleDetails = $scope.PharDetails[0].Value;
                }
                if ($scope.PharDetails.length > 1) {
                    returnDetails = $scope.PharDetails[1].Value;
                }
                for (var idx in saleDetails) {
                    var saleData = saleDetails[idx];
                    var saleinfo = {
                        Key: '',
                        BillAmt: 0
                    };
                    if (saleData.Type == 1) {
                        saleinfo.Key = 'OP';
                        saleinfo.BillAmt = saleData.OPSale;
                        $scope.NetPharmaDetails.push(saleinfo);
                    }
                    if (saleData.Type == 2) {
                        saleinfo.Key = 'IP Cash';
                        saleinfo.BillAmt = saleData.IPSale;
                        $scope.NetPharmaDetails.push(saleinfo);
                    }
                    if (saleData.Type == 3) {
                        saleinfo.Key = 'Staff';
                        saleinfo.BillAmt = saleData.StaffCreditSale;
                        $scope.NetPharmaDetails.push(saleinfo);
                    }
                    if (saleData.Type == 4) {
                        saleinfo.Key = 'Direct';
                        saleinfo.BillAmt = saleData.DirectSale;
                        $scope.NetPharmaDetails.push(saleinfo);
                    }
                }
                for (var idx in returnDetails) {
                    var retData = returnDetails[idx];
                    var retInfo = {
                        Key: '',
                        RetAmt: 0
                    };
                    var valappended = 0;
                    if (retData.Type == 1) {
                        retInfo.Key = 'OP';
                        retInfo.RetAmt = retData.OPReturn;
                        $scope.NetPharmaDetails.forEach(function (item) {
                            if (retInfo.Key == item.Key) {
                                item.RetAmt = retInfo.RetAmt;
                                valappended = 1;
                            }
                        });
                        if (valappended == 0) {
                            $scope.NetPharmaDetails.push(retInfo);
                        }
                    }

                    if (retData.Type == 2) {
                        retInfo.Key = 'IP Cash';
                        retInfo.RetAmt = retData.IPReturn;
                        $scope.NetPharmaDetails.forEach(function (item) {
                            if (retInfo.Key == item.Key) {
                                item.RetAmt = retInfo.RetAmt;
                                valappended = 1;
                            }
                        });
                        if (valappended == 0) {
                            $scope.NetPharmaDetails.push(retInfo);
                        }
                    }
                    if (retData.Type == 3) {
                        retInfo.Key = 'Staff';
                        retInfo.RetAmt = retData.StaffCreditReturn;
                        $scope.NetPharmaDetails.forEach(function (item) {
                            if (retInfo.Key == item.Key) {
                                item.RetAmt = retInfo.RetAmt;
                                valappended = 1;
                            }
                        });
                        if (valappended == 0) {
                            $scope.NetPharmaDetails.push(retInfo);
                        }
                    }
                    if (retData.Type == 4) {
                        retInfo.Key = 'Direct';
                        retInfo.RetAmt = retData.DirectReturn;
                        $scope.NetPharmaDetails.forEach(function (item) {
                            if (retInfo.Key == item.Key) {
                                item.RetAmt = retInfo.RetAmt;
                                valappended = 1;
                            }
                        });
                        if (valappended == 0) {
                            $scope.NetPharmaDetails.push(retInfo);
                        }
                    }
                }

                for (var rdx in $scope.NetPharmaDetails) {
                    var allData = $scope.NetPharmaDetails[rdx];
                    allData.NetAmt = parseFloat(allData.BillAmt || 0) - parseFloat(allData.RetAmt || 0);
                    $scope.AllPharmaDetails.push(allData);
                }
            }
            $scope.TotBillAmt = 0;
            $scope.TotReturnAmt = 0;
            $scope.NetTotAmt = 0;
            if ($scope.AllPharmaDetails.length > 0) {
                for (var sdx in $scope.AllPharmaDetails) {
                    var pharData = $scope.AllPharmaDetails[sdx];
                    $scope.TotBillAmt += parseFloat(pharData.BillAmt || 0);
                    $scope.TotReturnAmt += parseFloat(pharData.RetAmt || 0);
                    $scope.NetTotAmt += parseFloat(pharData.NetAmt || 0);
                }
            }
        };

        $scope.GetPharmacyDetails = function () {
            var From = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId()
                },
            };

            var options = {
                action: 'billing/patientbills/GetPharmacyDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.GetPharmacyDetailsCallBack
            };
            utl.Http.doAction(options);
        }

        $scope.getSalesCollectionCallBack = function (scope, res, options, hasError) {
            $scope.SalesCollection = res
            $scope.TotSalesCash = 0;
            $scope.TotSalesCard = 0;
            $scope.TotSalesOther = 0;
            $scope.TotSalesUPI = 0;
            $scope.AllSalesTotal = 0;

            var totSalesCash = 0;
            var totSalesCard = 0;
            var totSalesOther = 0;
            var totSalesUPI = 0;
            var allSalesTotal = 0;

            for (var idx in $scope.SalesCollection) {
                var salescollect = $scope.SalesCollection[idx];
                totSalesCash = parseFloat(totSalesCash) + parseFloat(salescollect.Value.CashAmount || 0);
                totSalesCard = parseFloat(totSalesCard) + parseFloat(salescollect.Value.CardAmount || 0);
                totSalesOther = parseFloat(totSalesOther) + parseFloat(salescollect.Value.OtherAmount || 0);
                totSalesUPI = parseFloat(totSalesUPI) + parseFloat(salescollect.Value.UPIAmount || 0);
                allSalesTotal = parseFloat(allSalesTotal) + parseFloat(salescollect.Value.BillAmount || 0);
            }

            $scope.TotSalesCash = totSalesCash.toFixed(2);
            $scope.TotSalesCard = totSalesCard.toFixed(2);
            $scope.TotSalesOther = totSalesOther.toFixed(2);
            $scope.TotSalesUPI = totSalesUPI.toFixed(2);
            $scope.AllSalesTotal = allSalesTotal.toFixed(2);

        }
        $scope.getSalesCollection = function () {
            var From = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId()
                },
            };

            var options = {
                action: 'billing/PatientPaymentDetails/GetPharmacySalesCollections',
                data: inputData,
                type: 'post',
                onComplete: $scope.getSalesCollectionCallBack
            };
            utl.Http.doAction(options);
        }
        $scope.getReturnCollectionCallBack = function (scope, res, options, hasError) {
            $scope.ReturnCollection = res
            $scope.TotReturnCash = 0;
            $scope.TotReturnCard = 0;
            $scope.TotReturnOther = 0;
            $scope.TotReturnUPI = 0;
            $scope.AllReturnTotal = 0;

            var totReturnCash = 0;
            var totReturnCard = 0;
            var totReturnOther = 0;
            var totReturnUPI = 0;
            var allReturnTotal = 0;

            for (var idx in $scope.ReturnCollection) {
                var returncollect = $scope.ReturnCollection[idx];
                totReturnCash = parseFloat(totReturnCash) + parseFloat(returncollect.Value.CashAmount || 0);
                totReturnCard = parseFloat(totReturnCard) + parseFloat(returncollect.Value.CardAmount || 0);
                totReturnOther = parseFloat(totReturnOther) + parseFloat(returncollect.Value.OtherAmount || 0);
                totReturnUPI = parseFloat(totReturnUPI) + parseFloat(returncollect.Value.UPIAmount || 0);
                allReturnTotal = parseFloat(allReturnTotal) + parseFloat(returncollect.Value.BillAmount || 0);
            }

            $scope.TotReturnCash = totReturnCash.toFixed(2);
            $scope.TotReturnCard = totReturnCard.toFixed(2);
            $scope.TotReturnOther = totReturnOther.toFixed(2);
            $scope.TotReturnUPI = totReturnUPI.toFixed(2);
            $scope.AllReturnTotal = allReturnTotal.toFixed(2);

        }
        $scope.getReturnCollection = function () {
            var From = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId()
                },
            };

            var options = {
                action: 'billing/patientrefund/GetPharmacyReturnCollections',
                data: inputData,
                type: 'post',
                onComplete: $scope.getReturnCollectionCallBack
            };
            utl.Http.doAction(options);
        }
        $scope.loadData = function () {
            $scope.GetFacilityDashboardOptions();
            $scope.GetPharmacyDetails();
            $scope.getPurchasebySupplier();
            $scope.getPurchaseReturnbySupplier();
            $scope.getOutstandingDetails();
            $scope.getStockValueDetails();
            $scope.getSecondstoreStockValueDetails();
            $scope.getSalesCollection();
            $scope.getReturnCollection();
        }

        $scope.loadData();

    }
    PharmacyadmindashboardController.$inject = ['$rootScope', '$scope', '$timeout', '$filter', '$stateParams', '$state', '$translate', 'utl'];
})();