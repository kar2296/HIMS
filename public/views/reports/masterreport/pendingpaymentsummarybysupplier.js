(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PendingPaymentSummaryBySupplierController', PendingPaymentSummaryBySupplierController);

    function PendingPaymentSummaryBySupplierController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.items = [];
        $scope.currentcontext = {};
        $scope.currentfilter = {
            From: utl.Formatter.getCurrentDate(),
            To: utl.Formatter.getCurrentDate(),
        }
        $scope.currentcontext = {
            FacilityId: utl.Session.getCurrentFacilityId(),
        }

        $scope.GetBillingCollectionOptionsCallBack = function (scope, res, options, hasError) {
            $scope.Collection = res;
            $scope.suppliercollection = [];
            $scope.supplierreturncollection = [];
            $scope.NetSupplierCollection = [];
            if ($scope.Collection) {
                var suppliercollection = [];
                var supplierreturncollection = [];
                if ($scope.Collection.length > 0) {
                    suppliercollection = $scope.Collection[0].Value;
                }
                if ($scope.Collection.length > 1) {
                    supplierreturncollection = $scope.Collection[1].Value;
                }
                for (var idx in suppliercollection) {
                    var suppliercoll = suppliercollection[idx];
                    var Key = '';
                    var InvoiceAmt = 0;
                    var TDSAmt = 0;
                    var Outstanding = 0;
                    var Writeoff = 0;
                    var PaidAmt = 0;
                    var NetAmt = 0;
                    for (var ix in suppliercoll) {
                        $scope.VendorName = '';
                        if (suppliercoll[ix].VendorName) {
                            $scope.VendorName = suppliercoll[ix].VendorName;
                        }

                        if (suppliercoll[ix].TotalInvoiceAmount) {
                            InvoiceAmt = suppliercoll[ix].TotalInvoiceAmount;
                        }
                        if (suppliercoll[ix].TotalTDSAmount) {
                            TDSAmt = suppliercoll[ix].TotalTDSAmount;
                        }
                        if (suppliercoll[ix].TotalOutstandingAmount) {
                            Outstanding = suppliercoll[ix].TotalOutstandingAmount;
                        }
                        if (suppliercoll[ix].TotalNetAmount) {
                            NetAmt = suppliercoll[ix].TotalNetAmount;
                        }
                        if (suppliercoll[ix].WriteOff) {
                            Writeoff = suppliercoll[ix].WriteOff;
                        }
                        if (suppliercoll[ix].TotalPaidAmount) {
                            PaidAmt = suppliercoll[ix].TotalPaidAmount;
                        }
                        Key = $scope.VendorName;
                        InvoiceAmt = InvoiceAmt;
                        TDSAmt = TDSAmt;
                        Outstanding = Outstanding;
                        NetAmt = NetAmt;
                        Writeoff = Writeoff;
                        PaidAmt = PaidAmt;
                    }
                    $scope.NetSupplierCollection.push({
                        'Key': Key,
                        'Value': {
                            'InvoiceAmt': InvoiceAmt,
                            'TDSAmt': TDSAmt,
                            'Outstanding': Outstanding,
                            'NetAmt': NetAmt,
                            'Writeoff': Writeoff,
                            'PaidAmt': PaidAmt,
                        }
                    })
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
                    var valappended = 0;
                    $scope.NetSupplierCollection.forEach(function (item) {
                        if (Key == item.Key) {
                            item.Value.ReturnAmt = ReturnAmt;
                            valappended = 1;
                        }
                    });
                    if (valappended == 0)
                        $scope.NetSupplierCollection.push({
                            'Key': Key,
                            'Value': {
                                'ReturnAmt': ReturnAmt,
                            }
                        })
                }
            }
        };

        $scope.GetPharmacyOptions = function () {
            var startTime = new Date($scope.currentfilter.From);
            var endTime = new Date($scope.currentfilter.To);
            var difference = endTime.getTime() - startTime.getTime();
            var resultInDays = Math.round(difference / (1000 * 60 * 60 * 24)); // Calculate difference in days
            if (!(resultInDays >= 0 && resultInDays <= 31)) { // Check if difference is less than 15 days
                utl.Alert.showSuccessMsg("From and To Date Difference should be less than one month...");
                $scope.currentfilter.From = new Date();
                $scope.currentfilter.To = new Date();
                return false;
            }

            var From = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId()
                },
            };

            var options = {
                action: 'pharmacy/VendorPayment/GetSupplierPendingSummary',
                data: inputData,
                type: 'post',
                onComplete: $scope.GetBillingCollectionOptionsCallBack
            };
            utl.Http.doAction(options);
        };
        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId()
                }
            };
            var options = {
                action: 'pharmacy/VendorPayment/PrintSupplierPendingSummaryReport',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };
        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.getList();
            }
        };
        $scope.backtoReport = function () {
            $state.go('app.storereporttab.masterreport')
        };


        $scope.LoadDashboard = function () {
            $scope.GetPharmacyOptions();
        }

        $scope.LoadDashboard();
    }
    PendingPaymentSummaryBySupplierController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();