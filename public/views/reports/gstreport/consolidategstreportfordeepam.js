(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('consolidategstreportfordeepamController', consolidategstreportfordeepamController);

    function consolidategstreportfordeepamController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            StoreMasterId: 0
        };
        $scope.lookup = {};
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }

        $scope.custom_sort = function (a, b) {
            return parseInt(a.GST_TYPE) - parseInt(b.GST_TYPE);
        };
        											
        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["FromDate", "ToDate", "Gst Type","SaleAmount", "SaleTaxable", "Sale Gst", "ReturnAmount","ReturnTaxable", "Return Gst", "Net Amt", "Net Taxable","Final Gst"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var fromDate = '';
                var toDate = '';
                var gst = '';
                var saleAmt = '';
                var saleTax = '';
                var saleGst = '';
                var returnAmt = '';
                var returnTax = '';
                var returnGst = '';
                var netAmt = '';
                var netTax = '';
                var finalGst = '';

                if (rowArray.FROMDATE) {
                    fromDate = rowArray.FROMDATE;
                }
                if (rowArray.TODATE) {
                    toDate = rowArray.TODATE;
                }
                if (rowArray.GST_TYPE) {
                    gst = rowArray.GST_TYPE;
                }
                if (rowArray.SALE_TOTAL_AMOUNT) {
                    saleAmt = rowArray.SALE_TOTAL_AMOUNT;
                }
                if (rowArray.SALE_TAXABLE) {
                    saleTax = rowArray.SALE_TAXABLE;
                }
                if (rowArray.SALE_NEW_GST) {
                    saleGst = rowArray.SALE_NEW_GST;
                }
                if (rowArray.RETURN_TOTAL_AMOUNT) {
                    returnAmt = rowArray.RETURN_TOTAL_AMOUNT;
                }
                if (rowArray.RETURN_TAXABLE) {
                    returnTax = rowArray.RETURN_TAXABLE;
                }
                if (rowArray.RETURN_NEW_GST) {
                    returnGst = rowArray.RETURN_NEW_GST;
                }
                if (rowArray.SALEmRETURN) {
                    netAmt = rowArray.SALEmRETURN;
                }
                if (rowArray.SALEmRETURN_TAX) {
                    netTax = rowArray.SALEmRETURN_TAX;
                }
                if (rowArray.FINAL_GST) {
                    finalGst = rowArray.FINAL_GST;
                }
             
                csvContent += fromDate + ',' + toDate + ',' + gst + ',' + saleAmt + ',' + saleTax + ',' + saleGst + ',' + returnAmt + ',' + returnTax + ',' + returnGst + ',' + netAmt + ',' + netTax + ',' + finalGst + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'consolidategstreport-report.csv';
            hiddenElement.click();
        
        };
        
        $scope.excelDownload = function () {
               var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd') || null;
            var inputData = {
                Params: [

                    {
                        Key: 1,
                        Value: From
                    },
                    {
                        Key: 2,
                        Value: To
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.StoreMasterId
                    }
                ],
        
            };
            var options = {
                action: "billing/GstReport/GetGstReports",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            var totalSALE_TOTAL_AMOUNT = 0;
            var totalSALE_TAXABLE = 0;
            var totalSALE_NEW_GST = 0;
            var totalRETURN_TOTAL_AMOUNT = 0;
            var totalRETURN_TAXABLE = 0;
            var totalRETURN_NEW_GST = 0;
            var totalNetAmt = 0;
            var totalNetGst = 0;
            var totalFINAL_GST = 0;
            var gstList = res.Data.sort($scope.custom_sort);
            vm.gridConfig.data = gstList;

            $scope.TotSALE_TOTAL_AMOUNT = 0;
            $scope.TotSALE_TAXABLE = 0;
            $scope.TotSALE_NEW_GST = 0;
            $scope.TotRETURN_TOTAL_AMOUNT = 0;
            $scope.TotRETURN_TAXABLE = 0;
            $scope.TotRETURN_NEW_GST = 0;
            $scope.TotNetAmt = 0;
            $scope.TotNetGst = 0;
            $scope.TotFINAL_GST = 0;

            for (var gdx in vm.gridConfig.data) {
                var gstData = vm.gridConfig.data[gdx];
                totalSALE_TOTAL_AMOUNT = totalSALE_TOTAL_AMOUNT + gstData.SALE_TOTAL_AMOUNT;
                totalSALE_TAXABLE = totalSALE_TAXABLE + gstData.SALE_TAXABLE;
                totalSALE_NEW_GST = totalSALE_NEW_GST + gstData.SALE_NEW_GST;
                totalRETURN_TOTAL_AMOUNT = totalRETURN_TOTAL_AMOUNT + gstData.RETURN_TOTAL_AMOUNT;
                totalRETURN_TAXABLE = totalRETURN_TAXABLE + gstData.RETURN_TAXABLE;
                totalRETURN_NEW_GST = totalRETURN_NEW_GST + gstData.RETURN_NEW_GST;
                totalNetAmt = totalNetAmt + gstData.SALEmRETURN;
                totalNetGst = totalNetGst + gstData.SALEmRETURN_TAX;
                totalFINAL_GST = totalFINAL_GST + gstData.FINAL_GST;
            }

            $scope.TotSALE_TOTAL_AMOUNT = totalSALE_TOTAL_AMOUNT;
            $scope.TotSALE_TAXABLE = totalSALE_TAXABLE;
            $scope.TotSALE_NEW_GST = totalSALE_NEW_GST;
            $scope.TotRETURN_TOTAL_AMOUNT = totalRETURN_TOTAL_AMOUNT;
            $scope.TotRETURN_TAXABLE = totalRETURN_TAXABLE;
            $scope.TotRETURN_NEW_GST = totalRETURN_NEW_GST;
            $scope.TotNetAmt = totalNetAmt;
            $scope.TotNetGst = totalNetGst;
            $scope.TotFINAL_GST = totalFINAL_GST;

            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
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
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd') || null;
            var inputData = {
                Params: [

                    {
                        Key: 1,
                        Value: From
                    },
                    {
                        Key: 2,
                        Value: To
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.StoreMasterId
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'billing/GstReport/GetGstReports',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.SelectedFromStore = function (selectedItem) {
            $scope.currentfilter.StoreMaster = selectedItem.StoreName;
        };
        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.currentfilter.CreatedBy = -1
                // $scope.getList();
            }
        };
        $scope.backtoReport = function () {
            if ($scope.Context == 'pharmacygsttaxreport') {
                $state.go('app.pharmacytabreport.gsttaxreport');
            }

        };

        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    StoreMasterId: $scope.currentfilter.StoreMasterId || 0,
                    StoreMaster: $scope.currentfilter.StoreMaster
                },

                Params: [

                    {
                        Key: 1,
                        Value: From
                    },
                    {
                        Key: 2,
                        Value: To
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.StoreMasterId
                    },
                ],
            };
            var options = {
                action: 'billing/GstReport/PrintConsolidateGSTSummaryforDeepam',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };
        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "idx", displayName: $translate.instant('S.No'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}} </span> </div>"
            },
            {
                field: "FROMDATE",
                displayName: $translate.instant('FromDate')
            },
            {
                field: "TODATE",
                displayName: $translate.instant('ToDate')
            },
            {
                field: "GST_TYPE",
                displayName: $translate.instant('Gst Type')

            },
            {
                field: "SALE_TOTAL_AMOUNT",
                displayName: $translate.instant('SaleAmount')
            },

            {
                field: "SALE_TAXABLE",
                displayName: $translate.instant('SaleTaxable')
            },
            {
                field: "SALE_NEW_GST",
                displayName: $translate.instant('Sale Gst')
            },
            {
                field: "RETURN_TOTAL_AMOUNT",
                displayName: $translate.instant('ReturnAmount')
            },
            {
                field: "RETURN_TAXABLE",
                displayName: $translate.instant('ReturnTaxable')
            },
            {
                field: "RETURN_NEW_GST",
                displayName: $translate.instant('Return Gst')
            },
            {
                field: "SALEmRETURN",
                displayName: $translate.instant('Net Amt')
            },
            {
                field: "SALEmRETURN_TAX",
                displayName: $translate.instant('Net Taxable')
            },
            {
                field: "FINAL_GST",
                displayName: $translate.instant('Final Gst')
            },

            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
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
            },]
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

    consolidategstreportfordeepamController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();