(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('overallconsolidategstController', overallconsolidategstController);

    function overallconsolidategstController($scope, $stateParams, $state, $translate, $filter, utl) {
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
                var OutputSaleGst = [];
                var OutputSalereturnGst = [];
                var InputSaleGst = [];
                var InputSalereturnGst = [];
                var OutputGst = [];
                var InputGst = [];
                if ($scope.Gstcollection.length > 0) {
                    OutputGst = $scope.Gstcollection[0].Value;
                }
                if ($scope.Gstcollection.length > 1) {
                    InputGst = $scope.Gstcollection[1].Value;
                }
                if (OutputGst) {
                    if (OutputGst.length > 0) {
                        OutputSaleGst = OutputGst[0].Value;
                    }
                    if (OutputGst.length > 1) {
                        OutputSalereturnGst = OutputGst[1].Value;
                    }
                    if (OutputSaleGst) {
                        for (var idx in OutputSaleGst) {
                            var outputsalegst = OutputSaleGst[idx];
                            var Key = '';
                            var SaleNetAmountBeforeGST = 0;
                            var SaleNetAmount = 0;
                            var SaleGSTAmount = 0;
                            var SaleCGSTAmount = 0;
                            var SaleSGSTAmount = 0;
                            var GSTPercentage = '';
                            for (var ix in outputsalegst) {
                                var outputgstdata = outputsalegst[ix];
                                Key = outputgstdata.GSTPercentage;
                                SaleNetAmountBeforeGST = outputgstdata.NetAmountBeforeGST;
                                SaleNetAmount = outputgstdata.NetAmount;
                                SaleGSTAmount = outputgstdata.GSTAmount;
                                SaleCGSTAmount = outputgstdata.CGSTAmount;
                                SaleSGSTAmount = outputgstdata.SGSTAmount;
                            }
                            var valappended = 0;
                            $scope.NetSaleGst.forEach(function (item) {
                                if (Key == item.Key) {
                                    if (item.SaleNetAmountBeforeGST > 0) {
                                        item.SaleNetAmountBeforeGST += outputgstdata.NetAmountBeforeGST;
                                    } else {
                                        item.SaleNetAmountBeforeGST = outputgstdata.NetAmountBeforeGST;
                                    }
                                    if (item.SaleNetAmount > 0) {
                                        item.SaleNetAmount += outputgstdata.NetAmount;
                                    } else {
                                        item.SaleNetAmount = outputgstdata.NetAmount;
                                    }
                                    if (item.SaleGSTAmount > 0) {
                                        item.SaleGSTAmount += outputgstdata.GSTAmount;
                                    } else {
                                        item.SaleGSTAmount = outputgstdata.GSTAmount;
                                    }
                                    if (item.SaleCGSTAmount > 0) {
                                        item.SaleCGSTAmount += outputgstdata.CGSTAmount;
                                    } else {
                                        item.SaleCGSTAmount = outputgstdata.CGSTAmount;
                                    }
                                    if (item.SaleSGSTAmount > 0) {
                                        item.SaleSGSTAmount += outputgstdata.SGSTAmount;
                                    } else {
                                        item.SaleSGSTAmount = outputgstdata.SGSTAmount;
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
                    if (OutputSalereturnGst) {
                        for (var idx in OutputSalereturnGst) {
                            var outputsalereturngst = OutputSalereturnGst[idx];
                            var Key = '';
                            var RetNetAmountBeforeGST = 0;
                            var RetNetAmount = 0;
                            var RetGSTAmount = 0;
                            var RetCGSTAmount = 0;
                            var RetSGSTAmount = 0;
                            var GSTPercentage = '';
                            for (var ix in outputsalereturngst) {
                                var outputretgstdata = outputsalereturngst[ix];
                                Key = outputretgstdata.GSTPercentage;
                                RetNetAmountBeforeGST = outputretgstdata.NetAmountBeforeGST;
                                RetNetAmount = outputretgstdata.NetAmount;
                                RetGSTAmount = outputretgstdata.GSTAmount;
                                RetCGSTAmount = outputretgstdata.CGSTAmount;
                                RetSGSTAmount = outputretgstdata.SGSTAmount;
                            }
                            var valappended = 0;
                            $scope.NetSaleGst.forEach(function (item) {
                                if (Key == item.Key) {
                                    if (item.RetNetAmountBeforeGST > 0) {
                                        item.RetNetAmountBeforeGST += outputretgstdata.NetAmountBeforeGST;
                                    } else {
                                        item.RetNetAmountBeforeGST = outputretgstdata.NetAmountBeforeGST;
                                    }
                                    if (item.RetNetAmount > 0) {
                                        item.RetNetAmount += outputretgstdata.NetAmount;
                                    } else {
                                        item.RetNetAmount = outputretgstdata.NetAmount;
                                    }
                                    if (item.RetGSTAmount > 0) {
                                        item.RetGSTAmount += outputretgstdata.GSTAmount;
                                    } else {
                                        item.RetGSTAmount = outputretgstdata.GSTAmount;
                                    }
                                    if (item.RetCGSTAmount > 0) {
                                        item.RetCGSTAmount += outputretgstdata.CGSTAmount;
                                    } else {
                                        item.RetCGSTAmount = outputretgstdata.CGSTAmount;
                                    }
                                    if (item.RetSGSTAmount > 0) {
                                        item.RetSGSTAmount += outputretgstdata.SGSTAmount;
                                    } else {
                                        item.RetSGSTAmount = outputretgstdata.SGSTAmount;
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
                }

                if (InputGst) {
                    if (InputGst.length > 0) {
                        InputSaleGst = InputGst[0].Value;
                    }
                    if (InputGst.length > 1) {
                        InputSalereturnGst = InputGst[1].Value;
                    }
                    if (InputSaleGst) {
                        for (var idx in InputSaleGst) {
                            var gstgrpdata = InputSaleGst[idx];
                            var Key = '';
                            var IPSaleNetAmountBeforeGST = 0;
                            var IPSaleNetAmount = 0;
                            var IPSaleGSTAmount = 0;
                            var IPSaleCGSTAmount = 0;
                            var IPSaleSGSTAmount = 0;
                            for (var ix in gstgrpdata) {
                                var inputgstdata = gstgrpdata[ix];
                                Key = inputgstdata.GSTPercentage;
                                IPSaleNetAmountBeforeGST = inputgstdata.NetAmountBeforeGST;
                                IPSaleNetAmount = inputgstdata.NetAmount;
                                IPSaleGSTAmount = inputgstdata.GSTAmount;
                                IPSaleCGSTAmount = inputgstdata.CGSTAmount;
                                IPSaleSGSTAmount = inputgstdata.SGSTAmount;
                            }
                            var valappended = 0;
                            $scope.NetSaleGst.forEach(function (item) {
                                if (Key == item.Key) {
                                    if (item.IPSaleNetAmountBeforeGST > 0) {
                                        item.IPSaleNetAmountBeforeGST += inputgstdata.NetAmountBeforeGST;
                                    } else {
                                        item.IPSaleNetAmountBeforeGST = inputgstdata.NetAmountBeforeGST;
                                    }
                                    if (item.IPSaleNetAmount > 0) {
                                        item.IPSaleNetAmount += inputgstdata.NetAmount;
                                    } else {
                                        item.IPSaleNetAmount = inputgstdata.NetAmount;
                                    }
                                    if (item.IPSaleGSTAmount > 0) {
                                        item.IPSaleGSTAmount += inputgstdata.GSTAmount;
                                    } else {
                                        item.IPSaleGSTAmount = inputgstdata.GSTAmount;
                                    }
                                    if (item.IPSaleCGSTAmount > 0) {
                                        item.IPSaleCGSTAmount += inputgstdata.CGSTAmount;
                                    } else {
                                        item.IPSaleCGSTAmount = inputgstdata.CGSTAmount;
                                    }
                                    if (item.IPSaleSGSTAmount > 0) {
                                        item.IPSaleSGSTAmount += inputgstdata.SGSTAmount;
                                    } else {
                                        item.IPSaleSGSTAmount = inputgstdata.SGSTAmount;
                                    }
                                    valappended = 1;
                                }
                            });
                            if (valappended == 0)
                                $scope.NetSaleGst.push({
                                    'Key': Key,
                                    'IPSaleNetAmountBeforeGST': IPSaleNetAmountBeforeGST,
                                    'IPSaleNetAmount': IPSaleNetAmount,
                                    'IPSaleGSTAmount': IPSaleGSTAmount,
                                    'IPSaleCGSTAmount': IPSaleCGSTAmount,
                                    'IPSaleSGSTAmount': IPSaleSGSTAmount,
                                })
                        }
                    }
                    if (InputSalereturnGst) {
                        for (var idx in InputSalereturnGst) {
                            var retgstgrpdata = InputSalereturnGst[idx];
                            var Key = '';
                            var IPRetNetAmountBeforeGST = 0;
                            var IPRetNetAmount = 0;
                            var IPRetGSTAmount = 0;
                            var IPRetCGSTAmount = 0;
                            var IPRetSGSTAmount = 0;
                            for (var ix in retgstgrpdata) {
                                var inputretgstdata = retgstgrpdata[ix];
                                Key = inputretgstdata.GSTPercentage;
                                IPRetNetAmountBeforeGST = inputretgstdata.NetAmountBeforeGST;
                                IPRetNetAmount = inputretgstdata.NetAmount;
                                IPRetGSTAmount = inputretgstdata.GSTAmount;
                                IPRetCGSTAmount = inputretgstdata.CGSTAmount;
                                IPRetSGSTAmount = inputretgstdata.SGSTAmount;
                            }
                            var valappended = 0;
                            $scope.NetSaleGst.forEach(function (item) {
                                if (Key == item.Key) {
                                    if (item.IPRetNetAmountBeforeGST > 0) {
                                        item.IPRetNetAmountBeforeGST += inputretgstdata.NetAmountBeforeGST;
                                    } else {
                                        item.IPRetNetAmountBeforeGST = inputretgstdata.NetAmountBeforeGST;
                                    }
                                    if (item.IPRetNetAmount > 0) {
                                        item.IPRetNetAmount += inputretgstdata.NetAmount;
                                    } else {
                                        item.IPRetNetAmount = inputretgstdata.NetAmount;
                                    }
                                    if (item.IPRetGSTAmount > 0) {
                                        item.IPRetGSTAmount += inputretgstdata.GSTAmount;
                                    } else {
                                        item.IPRetGSTAmount = inputretgstdata.GSTAmount;
                                    }
                                    if (item.IPRetCGSTAmount > 0) {
                                        item.IPRetCGSTAmount += inputretgstdata.CGSTAmount;
                                    } else {
                                        item.IPRetCGSTAmount = inputretgstdata.CGSTAmount;
                                    }
                                    if (item.IPRetSGSTAmount > 0) {
                                        item.IPRetSGSTAmount += inputretgstdata.SGSTAmount;
                                    } else {
                                        item.IPRetSGSTAmount = inputretgstdata.SGSTAmount;
                                    }
                                    valappended = 1;
                                }
                            });
                            if (valappended == 0)
                                $scope.NetSaleGst.push({
                                    'Key': Key,
                                    'IPRetNetAmountBeforeGST': IPRetNetAmountBeforeGST,
                                    'IPRetNetAmount': IPRetNetAmount,
                                    'IPRetGSTAmount': IPRetGSTAmount,
                                    'IPRetCGSTAmount': IPRetCGSTAmount,
                                    'IPRetSGSTAmount': IPRetSGSTAmount,
                                })
                        }
                    }
                }


                for (var idx in $scope.NetSaleGst) {
                    var allgst = $scope.NetSaleGst[idx];
                    var consolidategst = {
                        Key: allgst.Key,
                        NetAmountBeforeGST: ((allgst.SaleNetAmountBeforeGST || 0) - (allgst.RetNetAmountBeforeGST || 0)) -
                            ((allgst.IPSaleNetAmountBeforeGST || 0) - (allgst.IPRetNetAmountBeforeGST || 0)),

                        NetAmount: ((allgst.SaleNetAmount || 0) - (allgst.RetNetAmount || 0)) -
                            ((allgst.IPSaleNetAmount || 0) - (allgst.IPRetNetAmount || 0)),

                        GSTAmount: ((allgst.SaleGSTAmount || 0) - (allgst.RetGSTAmount || 0)) -
                            ((allgst.IPSaleGSTAmount || 0) - (allgst.IPRetGSTAmount || 0)),

                        CGSTAmount: ((allgst.SaleCGSTAmount || 0) - (allgst.RetCGSTAmount || 0)) -
                            ((allgst.IPSaleCGSTAmount || 0) - (allgst.IPRetCGSTAmount || 0)),

                        SGSTAmount: ((allgst.SaleSGSTAmount || 0) - (allgst.RetSGSTAmount || 0)) -
                            ((allgst.IPSaleSGSTAmount || 0) - (allgst.IPRetSGSTAmount || 0)),
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
            if (!(resultInDays >= 0 && resultInDays < 90)) { // Check if difference is less than 3 months
                utl.Alert.showSuccessMsg("From and To Date Difference should be less than three months...");
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
                action: 'billing/PatientBillDetails/GetOverallConsolidateGst',
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
                action: 'billing/PatientBillDetails/PrintOverallConsolidateGSTSummary',
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

    overallconsolidategstController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();