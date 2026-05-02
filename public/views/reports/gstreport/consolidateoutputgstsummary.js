(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('consolidateoutputgstsummaryController', consolidateoutputgstsummaryController);

    function consolidateoutputgstsummaryController($scope, $stateParams, $state, $translate, $filter, utl) {
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
            $scope.Gstcollection = res;
            $scope.NetSaleGst = [];
            $scope.OverallGst = [];
            if ($scope.Gstcollection) {
                var SaleGst = [];
                var SalereturnGst = [];
                if ($scope.Gstcollection.length > 0) {
                    SaleGst = $scope.Gstcollection[0].Value;
                }
                if ($scope.Gstcollection.length > 1) {
                    SalereturnGst = $scope.Gstcollection[1].Value;
                }
                if (SaleGst) {

                    for (var idx in SaleGst) {
                        var salegst = SaleGst[idx];
                        var Key = '';
                        var SaleNetAmountBeforeGST = 0;
                        var SaleNetAmount = 0;
                        var SaleGSTAmount = 0;
                        var SaleCGSTAmount = 0;
                        var SaleSGSTAmount = 0;
                        var GSTPercentage = '';
                        for (var ix in salegst) {
                            var gstdata = salegst[ix];
                            Key = gstdata.GSTPercentage;
                            SaleNetAmountBeforeGST = gstdata.NetAmountBeforeGST;
                            SaleNetAmount = gstdata.NetAmount;
                            SaleGSTAmount = gstdata.GSTAmount;
                            SaleCGSTAmount = gstdata.CGSTAmount;
                            SaleSGSTAmount = gstdata.SGSTAmount;
                        }
                        var valappended = 0;
                        $scope.NetSaleGst.forEach(function (item) {
                            if (Key == item.Key) {
                                if (item.SaleNetAmountBeforeGST > 0) {
                                    item.SaleNetAmountBeforeGST += gstdata.NetAmountBeforeGST;
                                } else {
                                    item.SaleNetAmountBeforeGST = gstdata.NetAmountBeforeGST;
                                }
                                if (item.SaleNetAmount > 0) {
                                    item.SaleNetAmount += gstdata.NetAmount;
                                } else {
                                    item.SaleNetAmount = gstdata.NetAmount;
                                }
                                if (item.SaleGSTAmount > 0) {
                                    item.SaleGSTAmount += gstdata.GSTAmount;
                                } else {
                                    item.SaleGSTAmount = gstdata.GSTAmount;
                                }
                                if (item.SaleCGSTAmount > 0) {
                                    item.SaleCGSTAmount += gstdata.CGSTAmount;
                                } else {
                                    item.SaleCGSTAmount = gstdata.CGSTAmount;
                                }
                                if (item.SaleSGSTAmount > 0) {
                                    item.SaleSGSTAmount += gstdata.SGSTAmount;
                                } else {
                                    item.SaleSGSTAmount = gstdata.SGSTAmount;
                                }
                                valappended = 1;
                            }
                        });
                        if (valappended == 0)
                            $scope.NetSaleGst.push({
                                'Key': Key,
                                'SaleNetAmountBeforeGST': SaleNetAmountBeforeGST,
                                'SaleNetAmount': SaleNetAmount,
                                'SaleGSTAmount': SaleGSTAmount,
                                'SaleCGSTAmount': SaleCGSTAmount,
                                'SaleSGSTAmount': SaleSGSTAmount,
                            })
                    }
                }
                if (SalereturnGst) {
                    for (var idx in SalereturnGst) {
                        var salereturngst = SalereturnGst[idx];
                        var Key = '';
                        var RetNetAmountBeforeGST = 0;
                        var RetNetAmount = 0;
                        var RetGSTAmount = 0;
                        var RetCGSTAmount = 0;
                        var RetSGSTAmount = 0;
                        var GSTPercentage = '';
                        for (var ix in salereturngst) {
                            var retgstdata = salereturngst[ix];
                            Key = retgstdata.GSTPercentage;
                            RetNetAmountBeforeGST = retgstdata.NetAmountBeforeGST;
                            RetNetAmount = retgstdata.NetAmount;
                            RetGSTAmount = retgstdata.GSTAmount;
                            RetCGSTAmount = retgstdata.CGSTAmount;
                            RetSGSTAmount = retgstdata.SGSTAmount;
                        }
                        var valappended = 0;
                        $scope.NetSaleGst.forEach(function (item) {
                            if (Key == item.Key) {
                                if (item.RetNetAmountBeforeGST > 0) {
                                    item.RetNetAmountBeforeGST += retgstdata.NetAmountBeforeGST;
                                } else {
                                    item.RetNetAmountBeforeGST = retgstdata.NetAmountBeforeGST;
                                }
                                if (item.RetNetAmount > 0) {
                                    item.RetNetAmount += retgstdata.NetAmount;
                                } else {
                                    item.RetNetAmount = retgstdata.NetAmount;
                                }
                                if (item.RetGSTAmount > 0) {
                                    item.RetGSTAmount += retgstdata.GSTAmount;
                                } else {
                                    item.RetGSTAmount = retgstdata.GSTAmount;
                                }
                                if (item.RetCGSTAmount > 0) {
                                    item.RetCGSTAmount += retgstdata.CGSTAmount;
                                } else {
                                    item.RetCGSTAmount = retgstdata.CGSTAmount;
                                }
                                if (item.RetSGSTAmount > 0) {
                                    item.RetSGSTAmount += retgstdata.SGSTAmount;
                                } else {
                                    item.RetSGSTAmount = retgstdata.SGSTAmount;
                                }
                                valappended = 1;
                            }
                        });
                        if (valappended == 0)
                            $scope.NetSaleGst.push({
                                'Key': Key,
                                'RetNetAmountBeforeGST': RetNetAmountBeforeGST,
                                'RetNetAmount': RetNetAmount,
                                'RetGSTAmount': RetGSTAmount,
                                'RetCGSTAmount': RetCGSTAmount,
                                'RetSGSTAmount': RetSGSTAmount,
                            })
                    }
                }

                for (var idx in $scope.NetSaleGst) {
                    var allgst = $scope.NetSaleGst[idx];
                    var consolidategst = {
                        Key: allgst.Key,
                        NetAmountBeforeGST: (allgst.SaleNetAmountBeforeGST || 0) - (allgst.RetNetAmountBeforeGST || 0),
                        NetAmount: (allgst.SaleNetAmount || 0) - (allgst.RetNetAmount || 0),
                        GSTAmount: (allgst.SaleGSTAmount || 0) - (allgst.RetGSTAmount || 0),
                        CGSTAmount: (allgst.SaleCGSTAmount || 0) - (allgst.RetCGSTAmount || 0),
                        SGSTAmount: (allgst.SaleSGSTAmount || 0) - (allgst.RetSGSTAmount || 0),
                    }
                    $scope.OverallGst.push(consolidategst);
                }

            }
            var TotNetAmountBeforeGST = 0;
            var TotNetAmount = 0;
            var TotGSTAmount = 0;
            var TotCGSTAmount = 0;
            var TotSGSTAmount = 0;
            for (var jdx in $scope.OverallGst) {
                var netcollection = $scope.OverallGst[jdx];
                TotNetAmountBeforeGST = TotNetAmountBeforeGST + (netcollection.NetAmountBeforeGST || 0);
                TotNetAmount = TotNetAmount + (netcollection.NetAmount || 0);
                TotGSTAmount = TotGSTAmount + (netcollection.GSTAmount || 0);
                TotCGSTAmount = TotCGSTAmount + (netcollection.CGSTAmount || 0);
                TotSGSTAmount = TotSGSTAmount + (netcollection.SGSTAmount || 0);
            }
            $scope.TotNetAmountBeforeGST = TotNetAmountBeforeGST;
            $scope.TotNetAmount = TotNetAmount;
            $scope.TotGSTAmount = TotGSTAmount;
            $scope.TotCGSTAmount = TotCGSTAmount;
            $scope.TotSGSTAmount = TotSGSTAmount;
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
                action: 'billing/PatientBillDetails/GetConsolidateOutputGst',
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
                    StoreMasterId: $scope.currentfilter.StoreMasterId || 0,
                    StoreMaster: $scope.currentfilter.StoreMaster
                }

            };
            var options = {
                action: 'billing/PatientBillDetails/PrintConsolidateOuputGSTSummary',
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

    consolidateoutputgstsummaryController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();