(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ReturnGSTReportController', ReturnGSTReportController);

    function ReturnGSTReportController($scope, $stateParams, $state, $translate, $filter, utl) {
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
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.SalereturnGst = res;
            $scope.NetSalereturnGst = [];
            if ($scope.SalereturnGst) {
                var overallsalereturngst = [];
                var zerosalereturngst = [];
                var fivesalereturngst = [];
                var twelvesalereturngst = [];
                var eighteensalereturngst = [];
                var twentyeightsalereturngst = [];
                for (var gstid in $scope.SalereturnGst) {
                    if (parseInt(gstid) == -1) {
                        overallsalereturngst = $scope.SalereturnGst[gstid];
                    }
                    if (parseInt(gstid) == 0) {
                        zerosalereturngst = $scope.SalereturnGst[gstid];
                    }
                    if (parseInt(gstid) == 12) {
                        twelvesalereturngst = $scope.SalereturnGst[gstid];
                    }
                    if (parseInt(gstid) == 18) {
                        eighteensalereturngst = $scope.SalereturnGst[gstid];
                    }
                    if (parseInt(gstid) == 5) {
                        fivesalereturngst = $scope.SalereturnGst[gstid];
                    }
                    if (parseInt(gstid) == 28) {
                        twentyeightsalereturngst = $scope.SalereturnGst[gstid];
                    }

                }

                for (var idx in zerosalereturngst) {
                    var zero_salereturngst = zerosalereturngst[idx];
                    var Key = '';
                    var ZeroRetNetAmountBeforeGST = 0;
                    var NetAmount = 0;
                    var ZerRetGSTAmount = 0;
                    var GSTPercentage = '';
                    var year = new Date(zero_salereturngst.BillDate).getFullYear();
                    var month = new Date(zero_salereturngst.BillDate).getMonth();
                    var date = new Date(zero_salereturngst.BillDate).getDate();
                    Key = (month + 1) + '/' + date + '/' + year;
                    var BDate = zero_salereturngst.BillDate;
                    ZeroRetNetAmountBeforeGST = zero_salereturngst.NetAmountBeforeGST;
                    NetAmount = zero_salereturngst.NetAmount;
                    ZerRetGSTAmount = zero_salereturngst.GSTAmount;
                    GSTPercentage = zero_salereturngst.GSTPercentage;
                    var valappended = 0;
                    $scope.NetSalereturnGst.forEach(function (item) {
                        if (Key == item.Key) {
                            item.BDate = zero_salereturngst.BillDate;
                            if (item.ZeroRetNetAmountBeforeGST > 0) {
                                item.ZeroRetNetAmountBeforeGST += zero_salereturngst.NetAmountBeforeGST;
                            } else {
                                item.ZeroRetNetAmountBeforeGST = zero_salereturngst.NetAmountBeforeGST;
                            }
                            if (item.ZerRetGSTAmount > 0) {
                                item.ZerRetGSTAmount += zero_salereturngst.GSTAmount;
                            } else {
                                item.ZerRetGSTAmount = zero_salereturngst.GSTAmount;
                            }
                            valappended = 1;
                        }
                    });
                    if (valappended == 0)
                        $scope.NetSalereturnGst.push({
                            'Key': Key,
                            'ZeroRetNetAmountBeforeGST': ZeroRetNetAmountBeforeGST,
                            'ZerRetGSTAmount': ZerRetGSTAmount,
                            'BDate': BDate
                        })
                }
                for (var idx in twelvesalereturngst) {
                    var twelve_salereturngst = twelvesalereturngst[idx];
                    var Key = '';
                    var twelveRetNetAmountBeforeGST = 0;
                    var NetAmount = 0;
                    var twelveRetGSTAmount = 0;
                    var GSTPercentage = '';
                    var year = new Date(twelve_salereturngst.BillDate).getFullYear();
                    var month = new Date(twelve_salereturngst.BillDate).getMonth();
                    var date = new Date(twelve_salereturngst.BillDate).getDate();
                    Key = (month + 1) + '/' + date + '/' + year;
                    var BDate = twelve_salereturngst.BillDate;
                    twelveRetNetAmountBeforeGST = twelve_salereturngst.NetAmountBeforeGST;
                    NetAmount = twelve_salereturngst.NetAmount;
                    twelveRetGSTAmount = twelve_salereturngst.GSTAmount;
                    GSTPercentage = twelve_salereturngst.GSTPercentage;
                    var valappended = 0;
                    $scope.NetSalereturnGst.forEach(function (item) {
                        if (Key == item.Key) {
                            item.BDate = twelve_salereturngst.BillDate;
                            if (item.twelveRetNetAmountBeforeGST > 0) {
                                item.twelveRetNetAmountBeforeGST += twelve_salereturngst.NetAmountBeforeGST;
                            } else {
                                item.twelveRetNetAmountBeforeGST = twelve_salereturngst.NetAmountBeforeGST;
                            }
                            if (item.twelveRetGSTAmount > 0) {
                                item.twelveRetGSTAmount += twelve_salereturngst.GSTAmount;
                            } else {
                                item.twelveRetGSTAmount = twelve_salereturngst.GSTAmount;
                            }
                            valappended = 1;
                        }
                    });
                    if (valappended == 0)
                        $scope.NetSalereturnGst.push({
                            'Key': Key,
                            'twelveRetNetAmountBeforeGST': twelveRetNetAmountBeforeGST,
                            'twelveRetGSTAmount': twelveRetGSTAmount,
                            'BDate': BDate
                        })
                }
                for (var idx in eighteensalereturngst) {
                    var eighteen_salereturngst = eighteensalereturngst[idx];
                    var Key = '';
                    var eighteenRetNetAmountBeforeGST = 0;
                    var NetAmount = 0;
                    var eighteenRetGSTAmount = 0;
                    var GSTPercentage = '';
                    var year = new Date(eighteen_salereturngst.BillDate).getFullYear();
                    var month = new Date(eighteen_salereturngst.BillDate).getMonth();
                    var date = new Date(eighteen_salereturngst.BillDate).getDate();
                    Key = (month + 1) + '/' + date + '/' + year;
                    var BDate = eighteen_salereturngst.BillDate;
                    eighteenRetNetAmountBeforeGST = eighteen_salereturngst.NetAmountBeforeGST;
                    NetAmount = eighteen_salereturngst.NetAmount;
                    eighteenRetGSTAmount = eighteen_salereturngst.GSTAmount;
                    GSTPercentage = eighteen_salereturngst.GSTPercentage;
                    var valappended = 0;
                    $scope.NetSalereturnGst.forEach(function (item) {
                        if (Key == item.Key) {
                            item.BDate = eighteen_salereturngst.BillDate;
                            if (item.eighteenRetNetAmountBeforeGST > 0) {
                                item.eighteenRetNetAmountBeforeGST += eighteen_salereturngst.NetAmountBeforeGST;
                            } else {
                                item.eighteenRetNetAmountBeforeGST = eighteen_salereturngst.NetAmountBeforeGST;
                            }
                            if (item.eighteenRetGSTAmount > 0) {
                                item.eighteenRetGSTAmount += eighteen_salereturngst.GSTAmount;
                            } else {
                                item.eighteenRetGSTAmount = eighteen_salereturngst.GSTAmount;
                            }
                            valappended = 1;
                        }
                    });
                    if (valappended == 0)
                        $scope.NetSalereturnGst.push({
                            'Key': Key,
                            'eighteenRetNetAmountBeforeGST': eighteenRetNetAmountBeforeGST,
                            'eighteenRetGSTAmount': eighteenRetGSTAmount,
                            'BDate': BDate
                        })
                }
                for (var idx in fivesalereturngst) {
                    var five_salereturngst = fivesalereturngst[idx];
                    var Key = '';
                    var fiveRetNetAmountBeforeGST = 0;
                    var NetAmount = 0;
                    var fiveRetGSTAmount = 0;
                    var GSTPercentage = '';
                    var year = new Date(five_salereturngst.BillDate).getFullYear();
                    var month = new Date(five_salereturngst.BillDate).getMonth();
                    var date = new Date(five_salereturngst.BillDate).getDate();
                    Key = (month + 1) + '/' + date + '/' + year;
                    var BDate = five_salereturngst.BillDate;
                    fiveRetNetAmountBeforeGST = five_salereturngst.NetAmountBeforeGST;
                    NetAmount = five_salereturngst.NetAmount;
                    fiveRetGSTAmount = five_salereturngst.GSTAmount;
                    GSTPercentage = five_salereturngst.GSTPercentage;
                    var valappended = 0;
                    $scope.NetSalereturnGst.forEach(function (item) {
                        if (Key == item.Key) {
                            item.BDate = five_salereturngst.BillDate;
                            if (item.fiveRetNetAmountBeforeGST > 0) {
                                item.fiveRetNetAmountBeforeGST += five_salereturngst.NetAmountBeforeGST;
                            } else {
                                item.fiveRetNetAmountBeforeGST = five_salereturngst.NetAmountBeforeGST;
                            }
                            if (item.fiveRetGSTAmount > 0) {
                                item.fiveRetGSTAmount += five_salereturngst.GSTAmount;
                            } else {
                                item.fiveRetGSTAmount = five_salereturngst.GSTAmount;
                            }
                            valappended = 1;
                        }
                    });
                    if (valappended == 0)
                        $scope.NetSalereturnGst.push({
                            'Key': Key,
                            'fiveRetNetAmountBeforeGST': fiveRetNetAmountBeforeGST,
                            'fiveRetGSTAmount': fiveRetGSTAmount,
                            'BDate': BDate
                        })
                }
                for (var idx in twentyeightsalereturngst) {
                    var twentyeight_salereturngst = twentyeightsalereturngst[idx];
                    var Key = '';
                    var twentyeightRetNetAmountBeforeGST = 0;
                    var NetAmount = 0;
                    var twentyeightRetGSTAmount = 0;
                    var GSTPercentage = '';
                    var year = new Date(twentyeight_salereturngst.BillDate).getFullYear();
                    var month = new Date(twentyeight_salereturngst.BillDate).getMonth();
                    var date = new Date(twentyeight_salereturngst.BillDate).getDate();
                    Key = (month + 1) + '/' + date + '/' + year;
                    var BDate = twentyeight_salereturngst.BillDate;
                    twentyeightRetNetAmountBeforeGST = twentyeight_salereturngst.NetAmountBeforeGST;
                    NetAmount = twentyeight_salereturngst.NetAmount;
                    twentyeightRetGSTAmount = twentyeight_salereturngst.GSTAmount;
                    GSTPercentage = twentyeight_salereturngst.GSTPercentage;
                    var valappended = 0;
                    $scope.NetSalereturnGst.forEach(function (item) {
                        if (Key == item.Key) {
                            item.BDate = twentyeight_salereturngst.BillDate;
                            if (item.twentyeightRetNetAmountBeforeGST > 0) {
                                item.twentyeightRetNetAmountBeforeGST += twentyeight_salereturngst.NetAmountBeforeGST;
                            } else {
                                item.twentyeightRetNetAmountBeforeGST = twentyeight_salereturngst.NetAmountBeforeGST;
                            }
                            if (item.twentyeightRetGSTAmount > 0) {
                                item.twentyeightRetGSTAmount += twentyeight_salereturngst.GSTAmount;
                            } else {
                                item.twentyeightRetGSTAmount = twentyeight_salereturngst.GSTAmount;
                            }
                            valappended = 1;
                        }
                    });
                    if (valappended == 0)
                        $scope.NetSalereturnGst.push({
                            'Key': Key,
                            'twentyeightRetNetAmountBeforeGST': twentyeightRetNetAmountBeforeGST,
                            'twentyeightRetGSTAmount': twentyeightRetGSTAmount,
                            'BDate': BDate
                        })
                }
                for (var idx in overallsalereturngst) {
                    var overall_salereturngst = overallsalereturngst[idx];
                    var Key = '';
                    var RetNetAmountBeforeGST = 0;
                    var RetNetAmount = 0;
                    var RetGSTAmount = 0;
                    var GSTPercentage = '';
                    var year = new Date(overall_salereturngst.BillDate).getFullYear();
                    var month = new Date(overall_salereturngst.BillDate).getMonth();
                    var date = new Date(overall_salereturngst.BillDate).getDate();
                    Key = (month + 1) + '/' + date + '/' + year;
                    var BDate = overall_salereturngst.BillDate;
                    RetNetAmountBeforeGST = overall_salereturngst.NetAmountBeforeGST;
                    RetNetAmount = overall_salereturngst.NetAmount;
                    RetGSTAmount = overall_salereturngst.GSTAmount;
                    GSTPercentage = overall_salereturngst.GSTPercentage;
                    var valappended = 0;
                    $scope.NetSalereturnGst.forEach(function (item) {
                        if (Key == item.Key) {
                            item.BDate = overall_salereturngst.BillDate;
                            if (item.RetNetAmountBeforeGST > 0) {
                                item.RetNetAmountBeforeGST += overall_salereturngst.NetAmountBeforeGST;
                            } else {
                                item.RetNetAmountBeforeGST = overall_salereturngst.NetAmountBeforeGST;
                            }
                            if (item.RetNetAmount > 0) {
                                item.RetNetAmount += overall_salereturngst.NetAmount;
                            } else {
                                item.RetNetAmount = overall_salereturngst.NetAmount;
                            }
                            if (item.RetGSTAmount > 0) {
                                item.RetGSTAmount += overall_salereturngst.GSTAmount;
                            } else {
                                item.RetGSTAmount = overall_salereturngst.GSTAmount;
                            }
                            valappended = 1;
                        }
                    });
                    if (valappended == 0)
                        $scope.NetSalereturnGst.push({
                            'Key': Key,
                            'RetNetAmountBeforeGST': RetNetAmountBeforeGST,
                            'RetNetAmount': RetNetAmount,
                            'RetGSTAmount': RetGSTAmount,
                            'BDate': BDate
                        })
                }
            }

            $scope.NetSalereturnGst.sort($scope.sortdatee);
            $scope.sortdatee = function (a, b) {
                return new Date(a.BDate).getTime() - new Date(b.BDate).getTime();
            }
            var TotRetNetAmountBeforeGST = 0;
            var TotRetNetAmount = 0;
            var TotRetGSTAmount = 0;
            var TotZeroRetNetAmountBeforeGST = 0;
            var TotZerRetGSTAmount = 0;
            var TotfiveRetNetAmountBeforeGST = 0;
            var TotfiveRetGSTAmount = 0;
            var TottwelveRetNetAmountBeforeGST = 0;
            var TottwelveRetGSTAmount = 0;
            var ToteighteenRetNetAmountBeforeGST = 0;
            var ToteighteenRetGSTAmount = 0;
            var TottwentyeightRetNetAmountBeforeGST = 0;
            var TottwentyeightRetGSTAmount = 0;
            for (var jdx in $scope.NetSalereturnGst) {
                var netcollection = $scope.NetSalereturnGst[jdx];
                TotRetNetAmountBeforeGST = TotRetNetAmountBeforeGST + (netcollection.RetNetAmountBeforeGST || 0);
                TotRetNetAmount = TotRetNetAmount + (netcollection.RetNetAmount || 0);
                TotRetGSTAmount = TotRetGSTAmount + (netcollection.RetGSTAmount || 0);
                TotZeroRetNetAmountBeforeGST = TotZeroRetNetAmountBeforeGST + (netcollection.ZeroRetNetAmountBeforeGST || 0);
                TotZerRetGSTAmount = TotZerRetGSTAmount + (netcollection.ZerRetGSTAmount || 0);
                TotfiveRetNetAmountBeforeGST = TotfiveRetNetAmountBeforeGST + (netcollection.fiveRetNetAmountBeforeGST || 0);
                TotfiveRetGSTAmount = TotfiveRetGSTAmount + (netcollection.fiveRetGSTAmount || 0);
                TottwelveRetNetAmountBeforeGST = TottwelveRetNetAmountBeforeGST + (netcollection.twelveRetNetAmountBeforeGST || 0);
                TottwelveRetGSTAmount = TottwelveRetGSTAmount + (netcollection.twelveRetGSTAmount || 0);
                ToteighteenRetNetAmountBeforeGST = ToteighteenRetNetAmountBeforeGST + (netcollection.eighteenRetNetAmountBeforeGST || 0);
                ToteighteenRetGSTAmount = ToteighteenRetGSTAmount + (netcollection.eighteenRetGSTAmount || 0);
                TottwentyeightRetNetAmountBeforeGST = TottwentyeightRetNetAmountBeforeGST + (netcollection.twentyeightRetNetAmountBeforeGST || 0);
                TottwentyeightRetGSTAmount = TottwentyeightRetGSTAmount + (netcollection.twentyeightRetGSTAmount || 0);
            }
            $scope.TotRetNetAmountBeforeGST = TotRetNetAmountBeforeGST;
            $scope.TotRetNetAmount = TotRetNetAmount;
            $scope.TotRetGSTAmount = TotRetGSTAmount;
            $scope.TotZeroRetNetAmountBeforeGST = TotZeroRetNetAmountBeforeGST;
            $scope.TotZerRetGSTAmount = TotZerRetGSTAmount;
            $scope.TotfiveRetNetAmountBeforeGST = TotfiveRetNetAmountBeforeGST;
            $scope.TotfiveRetGSTAmount = TotfiveRetGSTAmount;
            $scope.TottwelveRetNetAmountBeforeGST = TottwelveRetNetAmountBeforeGST;
            $scope.TottwelveRetGSTAmount = TottwelveRetGSTAmount;
            $scope.ToteighteenRetNetAmountBeforeGST = ToteighteenRetNetAmountBeforeGST;
            $scope.ToteighteenRetGSTAmount = ToteighteenRetGSTAmount;
            $scope.TottwentyeightRetNetAmountBeforeGST = TottwentyeightRetNetAmountBeforeGST;
            $scope.TottwentyeightRetGSTAmount = TottwentyeightRetGSTAmount;
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
                    StoreMasterId: $scope.currentfilter.StoreMasterId || 0
                }
            };

            var options = {
                action: 'billing/patientreturndetails/SaleReturnGSTDetails',
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
                $scope.getList();
            }
        };
        $scope.backtoReport = function () {
            if ($scope.Context == 'pharmacygsttaxreport') {
                $state.go('app.pharmacytabreport.gsttaxreport');
            } if ($scope.Context == 'gsttaxreport') {
                $state.go('app.financereporttab.gsttaxreport');
            } if ($scope.Context == 'storetaxreport') {
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
                    StoreMasterId: $scope.currentfilter.StoreMasterId || 0,
                    StoreMaster: $scope.currentfilter.StoreMaster
                }

            };
            var options = {
                action: 'billing/patientreturndetails/PrintSaleReturnGST',
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

    ReturnGSTReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();