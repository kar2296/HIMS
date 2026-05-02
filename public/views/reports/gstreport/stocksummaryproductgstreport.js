(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('StockSummaryProductGstreportController', StockSummaryProductGstreportController);

    function StockSummaryProductGstreportController($scope, $stateParams, $state, $translate, $filter, utl) {
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
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.SaleGst = res;
            $scope.NetSaleGst = [];
            if ($scope.SaleGst) {
                var overallsalegst = [];
                var zerosalegst = [];
                var fivesalegst = [];
                var twelvesalegst = [];
                var eighteensalegst = [];
                var twentyeightsalegst = [];
                for (var gstid in $scope.SaleGst) {
                    if (parseInt(gstid) == -1) {
                        overallsalegst = $scope.SaleGst[gstid];
                    }
                    if (parseInt(gstid) == 1) {
                        zerosalegst = $scope.SaleGst[gstid];
                    }
                    if (parseInt(gstid) == 7) {
                        twelvesalegst = $scope.SaleGst[gstid];
                    }
                    if (parseInt(gstid) == 8) {
                        eighteensalegst = $scope.SaleGst[gstid];
                    }
                    if (parseInt(gstid) == 11) {
                        fivesalegst = $scope.SaleGst[gstid];
                    }
                    if (parseInt(gstid) == 12) {
                        twentyeightsalegst = $scope.SaleGst[gstid];
                    }

                }

                for (var idx in zerosalegst) {
                    var zero_salegst = zerosalegst[idx];
                    var Key = '';
                    var ZeroNetAmountBeforeGST = 0;
                    var NetAmount = 0;
                    var ZerGSTAmount = 0;
                    var GSTPercentage = '';
                    Key = zero_salegst.ProductName;
                    ZeroNetAmountBeforeGST = zero_salegst.NetAmountBeforeGST;
                    NetAmount = zero_salegst.NetAmount;
                    ZerGSTAmount = zero_salegst.GSTAmount;
                    GSTPercentage = zero_salegst.GSTPercentage;

                    $scope.NetSaleGst.push({
                        'Key': Key,
                        'ZeroNetAmountBeforeGST': ZeroNetAmountBeforeGST,
                        'ZerGSTAmount': ZerGSTAmount,
                    })
                }
                for (var idx in twelvesalegst) {
                    var twelve_salegst = twelvesalegst[idx];
                    var Key = '';
                    var twelveNetAmountBeforeGST = 0;
                    var NetAmount = 0;
                    var twelveGSTAmount = 0;
                    var GSTPercentage = '';
                    Key = twelve_salegst.ProductName;
                    twelveNetAmountBeforeGST = twelve_salegst.NetAmountBeforeGST;
                    NetAmount = twelve_salegst.NetAmount;
                    twelveGSTAmount = twelve_salegst.GSTAmount;
                    GSTPercentage = twelve_salegst.GSTPercentage;
                    var valappended = 0;
                    $scope.NetSaleGst.forEach(function (item) {
                        if (Key == item.Key) {
                            if (item.twelveNetAmountBeforeGST > 0) {
                                item.twelveNetAmountBeforeGST += twelve_salegst.NetAmountBeforeGST;
                            } else {
                                item.twelveNetAmountBeforeGST = twelve_salegst.NetAmountBeforeGST;
                            }
                            if (item.twelveGSTAmount > 0) {
                                item.twelveGSTAmount += twelve_salegst.GSTAmount;
                            } else {
                                item.twelveGSTAmount = twelve_salegst.GSTAmount;
                            }
                            valappended = 1;
                        }
                    });
                    if (valappended == 0)
                        $scope.NetSaleGst.push({
                            'Key': Key,
                            'twelveNetAmountBeforeGST': twelveNetAmountBeforeGST,
                            'twelveGSTAmount': twelveGSTAmount,
                        })
                }
                for (var idx in eighteensalegst) {
                    var eighteen_salegst = eighteensalegst[idx];
                    var Key = '';
                    var eighteenNetAmountBeforeGST = 0;
                    var NetAmount = 0;
                    var eighteenGSTAmount = 0;
                    var GSTPercentage = '';
                    Key = eighteen_salegst.ProductName;
                    eighteenNetAmountBeforeGST = eighteen_salegst.NetAmountBeforeGST;
                    NetAmount = eighteen_salegst.NetAmount;
                    eighteenGSTAmount = eighteen_salegst.GSTAmount;
                    GSTPercentage = eighteen_salegst.GSTPercentage;
                    var valappended = 0;
                    $scope.NetSaleGst.forEach(function (item) {
                        if (Key == item.Key) {
                            if (item.eighteenNetAmountBeforeGST > 0) {
                                item.eighteenNetAmountBeforeGST += eighteen_salegst.NetAmountBeforeGST;
                            } else {
                                item.eighteenNetAmountBeforeGST = eighteen_salegst.NetAmountBeforeGST;
                            }
                            if (item.eighteenGSTAmount > 0) {
                                item.eighteenGSTAmount += eighteen_salegst.GSTAmount;
                            } else {
                                item.eighteenGSTAmount = eighteen_salegst.GSTAmount;
                            }
                            valappended = 1;
                        }
                    });
                    if (valappended == 0)
                        $scope.NetSaleGst.push({
                            'Key': Key,
                            'eighteenNetAmountBeforeGST': eighteenNetAmountBeforeGST,
                            'eighteenGSTAmount': eighteenGSTAmount,
                        })
                }
                for (var idx in fivesalegst) {
                    var five_salegst = fivesalegst[idx];
                    var Key = '';
                    var fiveNetAmountBeforeGST = 0;
                    var NetAmount = 0;
                    var fiveGSTAmount = 0;
                    var GSTPercentage = '';
                    Key = five_salegst.ProductName;
                    fiveNetAmountBeforeGST = five_salegst.NetAmountBeforeGST;
                    NetAmount = five_salegst.NetAmount;
                    fiveGSTAmount = five_salegst.GSTAmount;
                    GSTPercentage = five_salegst.GSTPercentage;
                    var valappended = 0;
                    $scope.NetSaleGst.forEach(function (item) {
                        if (Key == item.Key) {
                            if (item.fiveNetAmountBeforeGST > 0) {
                                item.fiveNetAmountBeforeGST += five_salegst.NetAmountBeforeGST;
                            } else {
                                item.fiveNetAmountBeforeGST = five_salegst.NetAmountBeforeGST;
                            }
                            if (item.fiveGSTAmount > 0) {
                                item.fiveGSTAmount += five_salegst.GSTAmount;
                            } else {
                                item.fiveGSTAmount = five_salegst.GSTAmount;
                            }
                            valappended = 1;
                        }
                    });
                    if (valappended == 0)
                        $scope.NetSaleGst.push({
                            'Key': Key,
                            'fiveNetAmountBeforeGST': fiveNetAmountBeforeGST,
                            'fiveGSTAmount': fiveGSTAmount,
                        })
                }
                for (var idx in twentyeightsalegst) {
                    var twentyeight_salegst = twentyeightsalegst[idx];
                    var Key = '';
                    var twentyeightNetAmountBeforeGST = 0;
                    var NetAmount = 0;
                    var twentyeightGSTAmount = 0;
                    var GSTPercentage = '';
                    Key = twentyeight_salegst.ProductName;
                    twentyeightNetAmountBeforeGST = twentyeight_salegst.NetAmountBeforeGST;
                    NetAmount = twentyeight_salegst.NetAmount;
                    twentyeightGSTAmount = twentyeight_salegst.GSTAmount;
                    GSTPercentage = twentyeight_salegst.GSTPercentage;
                    var valappended = 0;
                    $scope.NetSaleGst.forEach(function (item) {
                        if (Key == item.Key) {
                            if (item.twentyeightNetAmountBeforeGST > 0) {
                                item.twentyeightNetAmountBeforeGST += twentyeight_salegst.NetAmountBeforeGST;
                            } else {
                                item.twentyeightNetAmountBeforeGST = twentyeight_salegst.NetAmountBeforeGST;
                            }
                            if (item.twentyeightGSTAmount > 0) {
                                item.twentyeightGSTAmount += twentyeight_salegst.GSTAmount;
                            } else {
                                item.twentyeightGSTAmount = twentyeight_salegst.GSTAmount;
                            }
                            valappended = 1;
                        }
                    });
                    if (valappended == 0)
                        $scope.NetSaleGst.push({
                            'Key': Key,
                            'twentyeightNetAmountBeforeGST': twentyeightNetAmountBeforeGST,
                            'twentyeightGSTAmount': twentyeightGSTAmount,
                        })
                }
                for (var idx in overallsalegst) {
                    var overall_salegst = overallsalegst[idx];
                    var Key = '';
                    var NetAmountBeforeGST = 0;
                    var NetAmount = 0;
                    var GSTAmount = 0;
                    var GSTPercentage = '';
                    Key = overall_salegst.ProductName;
                    NetAmountBeforeGST = overall_salegst.NetAmountBeforeGST;
                    NetAmount = overall_salegst.NetAmount;
                    GSTAmount = overall_salegst.GSTAmount;
                    GSTPercentage = overall_salegst.GSTPercentage;
                    var valappended = 0;
                    $scope.NetSaleGst.forEach(function (item) {
                        if (Key == item.Key) {
                            if (item.NetAmountBeforeGST > 0) {
                                item.NetAmountBeforeGST += overall_salegst.NetAmountBeforeGST;
                            } else {
                                item.NetAmountBeforeGST = overall_salegst.NetAmountBeforeGST;
                            }
                            if (item.NetAmount > 0) {
                                item.NetAmount += overall_salegst.NetAmount;
                            } else {
                                item.NetAmount = overall_salegst.NetAmount;
                            }
                            if (item.GSTAmount > 0) {
                                item.GSTAmount += overall_salegst.GSTAmount;
                            } else {
                                item.GSTAmount = overall_salegst.GSTAmount;
                            }
                            valappended = 1;
                        }
                    });
                    if (valappended == 0)
                        $scope.NetSaleGst.push({
                            'Key': Key,
                            'NetAmountBeforeGST': NetAmountBeforeGST,
                            'NetAmount': NetAmount,
                            'GSTAmount': GSTAmount,
                        })
                }
            }

            var TotNetAmountBeforeGST = 0;
            var TotNetAmount = 0;
            var TotGSTAmount = 0;
            var TotZeroNetAmountBeforeGST = 0;
            var TotZerGSTAmount = 0;
            var TotfiveNetAmountBeforeGST = 0;
            var TotfiveGSTAmount = 0;
            var TottwelveNetAmountBeforeGST = 0;
            var TottwelveGSTAmount = 0;
            var ToteighteenNetAmountBeforeGST = 0;
            var ToteighteenGSTAmount = 0;
            var TottwentyeightNetAmountBeforeGST = 0;
            var TottwentyeightGSTAmount = 0;
            for (var jdx in $scope.NetSaleGst) {
                var netcollection = $scope.NetSaleGst[jdx];
                TotNetAmountBeforeGST = TotNetAmountBeforeGST + (netcollection.NetAmountBeforeGST || 0);
                TotNetAmount = TotNetAmount + (netcollection.NetAmount || 0);
                TotGSTAmount = TotGSTAmount + (netcollection.GSTAmount || 0);
                TotZeroNetAmountBeforeGST = TotZeroNetAmountBeforeGST + (netcollection.ZeroNetAmountBeforeGST || 0);
                TotZerGSTAmount = TotZerGSTAmount + (netcollection.ZerGSTAmount || 0);
                TotfiveNetAmountBeforeGST = TotfiveNetAmountBeforeGST + (netcollection.fiveNetAmountBeforeGST || 0);
                TotfiveGSTAmount = TotfiveGSTAmount + (netcollection.fiveGSTAmount || 0);
                TottwelveNetAmountBeforeGST = TottwelveNetAmountBeforeGST + (netcollection.twelveNetAmountBeforeGST || 0);
                TottwelveGSTAmount = TottwelveGSTAmount + (netcollection.twelveGSTAmount || 0);
                ToteighteenNetAmountBeforeGST = ToteighteenNetAmountBeforeGST + (netcollection.eighteenNetAmountBeforeGST || 0);
                ToteighteenGSTAmount = ToteighteenGSTAmount + (netcollection.eighteenGSTAmount || 0);
                TottwentyeightNetAmountBeforeGST = TottwentyeightNetAmountBeforeGST + (netcollection.twentyeightNetAmountBeforeGST || 0);
                TottwentyeightGSTAmount = TottwentyeightGSTAmount + (netcollection.twentyeightGSTAmount || 0);
            }
            $scope.TotNetAmountBeforeGST = TotNetAmountBeforeGST;
            $scope.TotNetAmount = TotNetAmount;
            $scope.TotGSTAmount = TotGSTAmount;
            $scope.TotZeroNetAmountBeforeGST = TotZeroNetAmountBeforeGST;
            $scope.TotZerGSTAmount = TotZerGSTAmount;
            $scope.TotfiveNetAmountBeforeGST = TotfiveNetAmountBeforeGST;
            $scope.TotfiveGSTAmount = TotfiveGSTAmount;
            $scope.TottwelveNetAmountBeforeGST = TottwelveNetAmountBeforeGST;
            $scope.TottwelveGSTAmount = TottwelveGSTAmount;
            $scope.ToteighteenNetAmountBeforeGST = ToteighteenNetAmountBeforeGST;
            $scope.ToteighteenGSTAmount = ToteighteenGSTAmount;
            $scope.TottwentyeightNetAmountBeforeGST = TottwentyeightNetAmountBeforeGST;
            $scope.TottwentyeightGSTAmount = TottwentyeightGSTAmount;
        };

        $scope.getList = function () { 
            var startTime = new Date($scope.currentfilter.FromDate);
            var endTime = new Date($scope.currentfilter.ToDate);
            var difference = endTime.getTime() - startTime.getTime();
            var resultInDays = Math.round(difference / (1000 * 60 * 60 * 24)); // Calculate difference in days
            if (!(resultInDays >= 0 && resultInDays < 15)) { // Check if difference is less than 15 days
                utl.Alert.showSuccessMsg("From and To Date Difference should be less than 15 days...");
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
                }
            };

            var options = {
                action: 'pharmacy/stockserialitem/GetStockSummaryByProductGst',
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
            if ($scope.Context == 'pharmacygsttaxreport') {
                $state.go('app.pharmacytabreport.gsttaxreport');
            } if ($scope.Context == 'gsttaxreport') {
                $state.go('app.financereporttab.gsttaxreport');
            }if ($scope.Context == 'storetaxreport') {
                $state.go('app.storereporttab.taxgstreport');
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
                }

            };
            var options = {
                action: 'pharmacy/stockserialitem/PrintStockSummaryByProductGst',
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
                }
            });
            $scope.getList();
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

    StockSummaryProductGstreportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();