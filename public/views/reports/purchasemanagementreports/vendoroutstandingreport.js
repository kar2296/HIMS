(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('vendoroutstandingreportController', vendoroutstandingreportController);

    function vendoroutstandingreportController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.items = [];
        $scope.currentcontext = {};
        $scope.currentfilter = {
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
        }
        $scope.currentcontext = {
            FacilityId: utl.Session.getCurrentFacilityId(),
        }

        $scope.getListCallBack = function (scope, res, options, hasError) {
            $scope.VendorOutstandings = res;
            $scope.NetVendorDetails = [];
            if ($scope.VendorOutstandings) {
                var grndetails = [];
                var prndetails = [];
                var voucherdetails = [];
                if ($scope.VendorOutstandings.length > 0) {
                    grndetails = $scope.VendorOutstandings[0];
                }
                if ($scope.VendorOutstandings.length > 1) {
                    prndetails = $scope.VendorOutstandings[1];
                }
                if ($scope.VendorOutstandings.length > 2) {
                    voucherdetails = $scope.VendorOutstandings[2];
                }
                if (grndetails) {
                    var Key = '';
                    var GrnDate = '';
                    var InvoiceNumber = '';
                    var GrnNumber = '';
                    var TotalInvoiceAmount = 0;
                    var TotalCreditAmount = 0;
                    var TotalNetAmount = 0;
                    Key = grndetails.Key;
                    for (var idx in grndetails.Value) {
                        var grnData = grndetails.Value[idx];
                        GrnDate = grnData.GrnDate;
                        InvoiceNumber = grnData.InvoiceNumber;
                        GrnNumber = grnData.GrnNumber;
                        TotalInvoiceAmount = grnData.TotalInvoiceAmount;
                        TotalCreditAmount = grnData.TotalCreditAmount;
                        TotalNetAmount = grnData.TotalNetAmount;
                        $scope.NetVendorDetails.push({
                            'Key': Key,
                            'GrnDate': GrnDate,
                            'InvoiceNumber': InvoiceNumber,
                            'GrnNumber': GrnNumber,
                            'TotalInvoiceAmount': TotalInvoiceAmount,
                            'TotalCreditAmount': TotalCreditAmount,
                            'TotalNetAmount': TotalNetAmount,
                        })
                    }
                }
                if (prndetails) {
                    var Key = '';
                    var GrnDate = '';
                    var GrnNumber = '';
                    var TotalReturnAmount = 0;
                    Key = prndetails.Key;
                    for (var idx in prndetails.Value) {
                        var prnData = prndetails.Value[idx];
                        GrnDate = prnData.GrnDate;
                        GrnNumber = prnData.GrnNumber;
                        TotalReturnAmount = prnData.TotalReturnAmount;
                        $scope.NetVendorDetails.push({
                            'Key': Key,
                            'GrnDate': GrnDate,
                            'GrnNumber': GrnNumber,
                            'TotalReturnAmount': TotalReturnAmount,
                        });
                    }
                }
                if (voucherdetails) {
                    var Key = '';
                    var GrnDate = '';
                    var GrnNumber = '';
                    var VoucherAmount = 0;
                    Key = voucherdetails.Key;
                    for (var idx in voucherdetails.Value) {
                        var voucherData = voucherdetails.Value[idx];
                        GrnDate = voucherData.GrnDate;
                        GrnNumber = voucherData.GrnNumber;
                        VoucherAmount = voucherData.VoucherAmount;
                        $scope.NetVendorDetails.push({
                            'Key': Key,
                            'GrnDate': GrnDate,
                            'GrnNumber': GrnNumber,
                            'VoucherAmount': VoucherAmount,
                        });
                    }
                }
            }
            var TotInvoiceAmount = 0;
            var TotCNAmount = 0;
            var TotNetAmt = 0;
            var TotRetAmount = 0;
            var TotVoucherAmount = 0;

            for (var jdx in $scope.NetVendorDetails) {
                var netcollection = $scope.NetVendorDetails[jdx];
                TotInvoiceAmount = TotInvoiceAmount + (netcollection.TotalInvoiceAmount || 0);
                TotCNAmount = TotCNAmount + (netcollection.TotalCreditAmount || 0);
                TotNetAmt = TotNetAmt + (netcollection.TotalNetAmount || 0);
                TotRetAmount = TotRetAmount + (netcollection.TotalReturnAmount || 0);
                TotVoucherAmount = TotVoucherAmount + (netcollection.VoucherAmount || 0);
            }
            $scope.TotInvoiceAmount = TotInvoiceAmount;
            $scope.TotCNAmount = TotCNAmount;
            $scope.TotNetAmt = TotNetAmt;
            $scope.TotRetAmount = TotRetAmount;
            $scope.TotVoucherAmount = TotVoucherAmount;
            $scope.FinalOutstanding = ($scope.TotNetAmt - $scope.TotRetAmount - $scope.TotVoucherAmount);

        }

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
            $scope.NetVendorDetails = [];
            $scope.TotInvoiceAmount = 0;
            $scope.TotCNAmount = 0;
            $scope.TotNetAmt = 0;
            $scope.TotRetAmount = 0;
            $scope.TotVoucherAmount = 0;
            $scope.FinalOutstanding = 0;
            if ($scope.currentfilter.VendorMasterId > 0) {
                var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
                var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
                var inputData = {
                    Data: {
                        FromDate: From,
                        ToDate: To,
                        FacilityId: utl.Session.getCurrentFacilityId(),
                        VendorMasterId: $scope.currentfilter.VendorMasterId || 0
                    },
                };
                var options = {
                    action: 'pharmacy/grn/GetVendorOutstandings',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getListCallBack
                };
                utl.Http.doAction(options);
            } else {
                utl.Alert.showErrorMsg('Please Select Any Supplier');
                $scope.NetVendorDetails = [];
            }
        };
        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    VendorMasterId: $scope.currentfilter.VendorMasterId || 0
                }
            };
            var options = {
                action: 'pharmacy/grn/PrintVendorOutstandingReport',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };
        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.currentfilter.VendorMasterId = -1;
                // $scope.getList();
            }
        };
        $scope.backtoReport = function () {
            $state.go('app.storereporttab.purchasemanagementreport')
        };
        vm.vendorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Supplier Code', field: 'VendorCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Supplier Name', field: 'VendorName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Supplier Contact', field: 'PhoneNumber', datatype: 'string', headercls: 'td-phoneno', fieldcls: 'td-phoneno' }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/vendormaster/GetVendorMasters',
            formatdisplay: formatselectedvendor,
            presearch: presearchvendor,
            postsearch: postsearchvendor
        };

        function formatselectedvendor() {
            var selectedItem = vm.vendorcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.currentfilter.VendorMasterId = selectedItem.VendorMasterId;
                result = [selectedItem.VendorName + ' (' + selectedItem.VendorCode + ')'].join(' ');
            } else if (vm.vendorcontrolconfig.rowdata) {
                result = [vm.vendorcontrolconfig.rowdata.VendorName, vm.vendorcontrolconfig.rowdata.VendorCode].join(' ');
            }

            return result;

            if ($scope.currentfilter.VendorMasterId > 0) {
                // $scope.getList();
            }
        }

        function presearchvendor() {
            var query = vm.vendorcontrolconfig.query;
            var inputData = {
                Params: [],
                PageContext: { PageSize: 25, PageNumber: 1 }
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
            }
        }


        // $scope.getList();
    }
    vendoroutstandingreportController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();