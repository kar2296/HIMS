(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ConsolidatePurchaseGSTReportController', ConsolidatePurchaseGSTReportController);

    function ConsolidatePurchaseGSTReportController($scope, $stateParams, $state, $translate, $filter, utl) {
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
                    var overallsalegst = [];
                    var zerosalegst = [];
                    var fivesalegst = [];
                    var twelvesalegst = [];
                    var eighteensalegst = [];
                    var twentyeightsalegst = [];
                    for (var gstid in SaleGst) {
                        if (parseInt(gstid) == -1) {
                            overallsalegst = SaleGst[gstid];
                        }
                        if (parseInt(gstid) == 0) {
                            zerosalegst = SaleGst[gstid];
                        }
                        if (parseInt(gstid) == 12) {
                            twelvesalegst = SaleGst[gstid];
                        }
                        if (parseInt(gstid) == 18) {
                            eighteensalegst = SaleGst[gstid];
                        }
                        if (parseInt(gstid) == 5) {
                            fivesalegst = SaleGst[gstid];
                        }
                        if (parseInt(gstid) == 28) {
                            twentyeightsalegst = SaleGst[gstid];
                        }

                    }

                    for (var idx in zerosalegst) {
                        var zero_salegst = zerosalegst[idx];
                        var Key = '';
                        var ZeroSaleNetAmountBeforeGST = 0;
                        var NetAmount = 0;
                        var ZeroSaleGSTAmount = 0;
                        var GSTPercentage = '';
                        var year = new Date(zero_salegst.GrnDate).getFullYear();
                        var month = new Date(zero_salegst.GrnDate).getMonth();
                        var date = new Date(zero_salegst.GrnDate).getDate();
                        Key = (month + 1) + '/' + date + '/' + year;
                        var GDate = zero_salegst.GrnDate;
                        ZeroSaleNetAmountBeforeGST = zero_salegst.NetAmountBeforeGST;
                        NetAmount = zero_salegst.NetAmount;
                        ZeroSaleGSTAmount = zero_salegst.GSTAmount;
                        GSTPercentage = zero_salegst.GSTPercentage;
                        let valappended = 0;
                        $scope.NetSaleGst.forEach(function (item) {
                            if (Key == item.Key) {
                                item.GDate = zero_salegst.GrnDate;
                                if (item.ZeroSaleNetAmountBeforeGST > 0) {
                                    item.ZeroSaleNetAmountBeforeGST += zero_salegst.NetAmountBeforeGST;
                                } else {
                                    item.ZeroSaleNetAmountBeforeGST = zero_salegst.NetAmountBeforeGST;
                                }
                                if (item.ZeroSaleGSTAmount > 0) {
                                    item.ZeroSaleGSTAmount += zero_salegst.GSTAmount;
                                } else {
                                    item.ZeroSaleGSTAmount = zero_salegst.GSTAmount;
                                }
                                valappended = 1;
                            }
                        });
                        if (valappended == 0)
                            $scope.NetSaleGst.push({
                                'Key': Key,
                                'ZeroSaleNetAmountBeforeGST': ZeroSaleNetAmountBeforeGST,
                                'ZeroSaleGSTAmount': ZeroSaleGSTAmount,
                                'GDate': GDate
                            })
                    }
                    for (var idx in twelvesalegst) {
                        var twelve_salegst = twelvesalegst[idx];
                        var Key = '';
                        var twelveSaleNetAmountBeforeGST = 0;
                        var NetAmount = 0;
                        var twelveSaleGSTAmount = 0;
                        var GSTPercentage = '';
                        var year = new Date(twelve_salegst.GrnDate).getFullYear();
                        var month = new Date(twelve_salegst.GrnDate).getMonth();
                        var date = new Date(twelve_salegst.GrnDate).getDate();
                        Key = (month + 1) + '/' + date + '/' + year;
                        var GDate = twelve_salegst.GrnDate;
                        twelveSaleNetAmountBeforeGST = twelve_salegst.NetAmountBeforeGST;
                        NetAmount = twelve_salegst.NetAmount;
                        twelveSaleGSTAmount = twelve_salegst.GSTAmount;
                        GSTPercentage = twelve_salegst.GSTPercentage;
                        var valappended = 0;
                        $scope.NetSaleGst.forEach(function (item) {
                            if (Key == item.Key) {
                                item.GDate = twelve_salegst.GrnDate;
                                if (item.twelveSaleNetAmountBeforeGST > 0) {
                                    item.twelveSaleNetAmountBeforeGST += twelve_salegst.NetAmountBeforeGST;
                                } else {
                                    item.twelveSaleNetAmountBeforeGST = twelve_salegst.NetAmountBeforeGST;
                                }
                                if (item.twelveSaleGSTAmount > 0) {
                                    item.twelveSaleGSTAmount += twelve_salegst.GSTAmount;
                                } else {
                                    item.twelveSaleGSTAmount = twelve_salegst.GSTAmount;
                                }
                                valappended = 1;
                            }
                        });
                        if (valappended == 0)
                            $scope.NetSaleGst.push({
                                'Key': Key,
                                'twelveSaleNetAmountBeforeGST': twelveSaleNetAmountBeforeGST,
                                'twelveSaleGSTAmount': twelveSaleGSTAmount,
                                'GDate': GDate
                            })
                    }
                    for (var idx in eighteensalegst) {
                        var eighteen_salegst = eighteensalegst[idx];
                        var Key = '';
                        var eighteenSaleNetAmountBeforeGST = 0;
                        var NetAmount = 0;
                        var eighteenSaleGSTAmount = 0;
                        var GSTPercentage = '';
                        var year = new Date(eighteen_salegst.GrnDate).getFullYear();
                        var month = new Date(eighteen_salegst.GrnDate).getMonth();
                        var date = new Date(eighteen_salegst.GrnDate).getDate();
                        Key = (month + 1) + '/' + date + '/' + year;
                        var GDate = eighteen_salegst.GrnDate;
                        eighteenSaleNetAmountBeforeGST = eighteen_salegst.NetAmountBeforeGST;
                        NetAmount = eighteen_salegst.NetAmount;
                        eighteenSaleGSTAmount = eighteen_salegst.GSTAmount;
                        GSTPercentage = eighteen_salegst.GSTPercentage;
                        var valappended = 0;
                        $scope.NetSaleGst.forEach(function (item) {
                            if (Key == item.Key) {
                                item.GDate = eighteen_salegst.GrnDate;
                                if (item.eighteenSaleNetAmountBeforeGST > 0) {
                                    item.eighteenSaleNetAmountBeforeGST += eighteen_salegst.NetAmountBeforeGST;
                                } else {
                                    item.eighteenSaleNetAmountBeforeGST = eighteen_salegst.NetAmountBeforeGST;
                                }
                                if (item.eighteenSaleGSTAmount > 0) {
                                    item.eighteenSaleGSTAmount += eighteen_salegst.GSTAmount;
                                } else {
                                    item.eighteenSaleGSTAmount = eighteen_salegst.GSTAmount;
                                }
                                valappended = 1;
                            }
                        });
                        if (valappended == 0)
                            $scope.NetSaleGst.push({
                                'Key': Key,
                                'eighteenSaleNetAmountBeforeGST': eighteenSaleNetAmountBeforeGST,
                                'eighteenSaleGSTAmount': eighteenSaleGSTAmount,
                                'GDate': GDate
                            })
                    }
                    for (var idx in fivesalegst) {
                        var five_salegst = fivesalegst[idx];
                        var Key = '';
                        var fiveSaleNetAmountBeforeGST = 0;
                        var NetAmount = 0;
                        var fiveSaleGSTAmount = 0;
                        var GSTPercentage = '';
                        var year = new Date(five_salegst.GrnDate).getFullYear();
                        var month = new Date(five_salegst.GrnDate).getMonth();
                        var date = new Date(five_salegst.GrnDate).getDate();
                        Key = (month + 1) + '/' + date + '/' + year;
                        var GDate = five_salegst.GrnDate;
                        fiveSaleNetAmountBeforeGST = five_salegst.NetAmountBeforeGST;
                        NetAmount = five_salegst.NetAmount;
                        fiveSaleGSTAmount = five_salegst.GSTAmount;
                        GSTPercentage = five_salegst.GSTPercentage;
                        var valappended = 0;
                        $scope.NetSaleGst.forEach(function (item) {
                            if (Key == item.Key) {
                                item.GDate = five_salegst.GrnDate;
                                if (item.fiveSaleNetAmountBeforeGST > 0) {
                                    item.fiveSaleNetAmountBeforeGST += five_salegst.NetAmountBeforeGST;
                                } else {
                                    item.fiveSaleNetAmountBeforeGST = five_salegst.NetAmountBeforeGST;
                                }
                                if (item.fiveSaleGSTAmount > 0) {
                                    item.fiveSaleGSTAmount += five_salegst.GSTAmount;
                                } else {
                                    item.fiveSaleGSTAmount = five_salegst.GSTAmount;
                                }
                                valappended = 1;
                            }
                        });
                        if (valappended == 0)
                            $scope.NetSaleGst.push({
                                'Key': Key,
                                'fiveSaleNetAmountBeforeGST': fiveSaleNetAmountBeforeGST,
                                'fiveSaleGSTAmount': fiveSaleGSTAmount,
                                'GDate': GDate
                            })
                    }
                    for (var idx in twentyeightsalegst) {
                        var twentyeight_salegst = twentyeightsalegst[idx];
                        var Key = '';
                        var twentyeightSaleNetAmountBeforeGST = 0;
                        var NetAmount = 0;
                        var twentyeightSaleGSTAmount = 0;
                        var GSTPercentage = '';
                        var year = new Date(twentyeight_salegst.GrnDate).getFullYear();
                        var month = new Date(twentyeight_salegst.GrnDate).getMonth();
                        var date = new Date(twentyeight_salegst.GrnDate).getDate();
                        Key = (month + 1) + '/' + date + '/' + year;
                        var GDate = twentyeight_salegst.GrnDate;
                        twentyeightSaleNetAmountBeforeGST = twentyeight_salegst.NetAmountBeforeGST;
                        NetAmount = twentyeight_salegst.NetAmount;
                        twentyeightSaleGSTAmount = twentyeight_salegst.GSTAmount;
                        GSTPercentage = twentyeight_salegst.GSTPercentage;
                        var valappended = 0;
                        $scope.NetSaleGst.forEach(function (item) {
                            if (Key == item.Key) {
                                item.GDate = twentyeight_salegst.GrnDate;
                                if (item.twentyeightSaleNetAmountBeforeGST > 0) {
                                    item.twentyeightSaleNetAmountBeforeGST += twentyeight_salegst.NetAmountBeforeGST;
                                } else {
                                    item.twentyeightSaleNetAmountBeforeGST = twentyeight_salegst.NetAmountBeforeGST;
                                }
                                if (item.twentyeightSaleGSTAmount > 0) {
                                    item.twentyeightSaleGSTAmount += twentyeight_salegst.GSTAmount;
                                } else {
                                    item.twentyeightSaleGSTAmount = twentyeight_salegst.GSTAmount;
                                }
                                valappended = 1;
                            }
                        });
                        if (valappended == 0)
                            $scope.NetSaleGst.push({
                                'Key': Key,
                                'twentyeightSaleNetAmountBeforeGST': twentyeightSaleNetAmountBeforeGST,
                                'twentyeightSaleGSTAmount': twentyeightSaleGSTAmount,
                                'GDate': GDate
                            })
                    }
                    for (var idx in overallsalegst) {
                        var overall_salegst = overallsalegst[idx];
                        var Key = '';
                        var SaleNetAmountBeforeGST = 0;
                        var SaleNetAmount = 0;
                        var SaleGSTAmount = 0;
                        var GSTPercentage = '';
                        var year = new Date(overall_salegst.GrnDate).getFullYear();
                        var month = new Date(overall_salegst.GrnDate).getMonth();
                        var date = new Date(overall_salegst.GrnDate).getDate();
                        Key = (month + 1) + '/' + date + '/' + year;
                        var GDate = overall_salegst.GrnDate;
                        SaleNetAmountBeforeGST = overall_salegst.NetAmountBeforeGST;
                        SaleNetAmount = overall_salegst.NetAmount;
                        SaleGSTAmount = overall_salegst.GSTAmount;
                        GSTPercentage = overall_salegst.GSTPercentage;
                        var valappended = 0;
                        $scope.NetSaleGst.forEach(function (item) {
                            if (Key == item.Key) {
                                item.GDate = overall_salegst.GrnDate;
                                if (item.SaleNetAmountBeforeGST > 0) {
                                    item.SaleNetAmountBeforeGST += overall_salegst.NetAmountBeforeGST;
                                } else {
                                    item.SaleNetAmountBeforeGST = overall_salegst.NetAmountBeforeGST;
                                }
                                if (item.SaleNetAmount > 0) {
                                    item.SaleNetAmount += overall_salegst.NetAmount;
                                } else {
                                    item.SaleNetAmount = overall_salegst.NetAmount;
                                }
                                if (item.SaleGSTAmount > 0) {
                                    item.SaleGSTAmount += overall_salegst.GSTAmount;
                                } else {
                                    item.SaleGSTAmount = overall_salegst.GSTAmount;
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
                                'GDate': GDate
                            })
                    }
                }
                if (SalereturnGst) {
                    var valappended = 0;
                    var overallsalereturngst = [];
                    var zerosalereturngst = [];
                    var fivesalereturngst = [];
                    var twelvesalereturngst = [];
                    var eighteensalereturngst = [];
                    var twentyeightsalereturngst = [];
                    for (var gstid in SalereturnGst) {
                        if (parseInt(gstid) == -1) {
                            overallsalereturngst = SalereturnGst[gstid];
                        }
                        if (parseInt(gstid) == 0) {
                            zerosalereturngst = SalereturnGst[gstid];
                        }
                        if (parseInt(gstid) == 12) {
                            twelvesalereturngst = SalereturnGst[gstid];
                        }
                        if (parseInt(gstid) == 18) {
                            eighteensalereturngst = SalereturnGst[gstid];
                        }
                        if (parseInt(gstid) == 5) {
                            fivesalereturngst = SalereturnGst[gstid];
                        }
                        if (parseInt(gstid) == 28) {
                            twentyeightsalereturngst = SalereturnGst[gstid];
                        }

                    }

                    for (var idx in zerosalereturngst) {
                        var zero_salereturngst = zerosalereturngst[idx];
                        var Key = '';
                        var ZeroRetNetAmountBeforeGST = 0;
                        var NetAmount = 0;
                        var ZeroRetGSTAmount = 0;
                        var GSTPercentage = '';
                        var year = new Date(zero_salereturngst.GrnDate).getFullYear();
                        var month = new Date(zero_salereturngst.GrnDate).getMonth();
                        var date = new Date(zero_salereturngst.GrnDate).getDate();
                        Key = (month + 1) + '/' + date + '/' + year;
                        var GDate = zero_salereturngst.GrnDate;
                        ZeroRetNetAmountBeforeGST = zero_salereturngst.NetAmountBeforeGST;
                        NetAmount = zero_salereturngst.NetAmount;
                        ZeroRetGSTAmount = zero_salereturngst.GSTAmount;
                        GSTPercentage = zero_salereturngst.GSTPercentage;

                        $scope.NetSaleGst.forEach(function (item) {
                            if (Key == item.Key) {
                                item.GDate = zero_salereturngst.GrnDate;
                                if (item.ZeroRetNetAmountBeforeGST > 0) {
                                    item.ZeroRetNetAmountBeforeGST += zero_salereturngst.NetAmountBeforeGST;
                                } else {
                                    item.ZeroRetNetAmountBeforeGST = zero_salereturngst.NetAmountBeforeGST;
                                }
                                if (item.ZeroRetGSTAmount > 0) {
                                    item.ZeroRetGSTAmount += zero_salereturngst.GSTAmount;
                                } else {
                                    item.ZeroRetGSTAmount = zero_salereturngst.GSTAmount;
                                }
                                valappended = 1;
                            }
                        });
                        if (valappended == 0)
                            $scope.NetSaleGst.push({
                                'Key': Key,
                                'ZeroRetNetAmountBeforeGST': ZeroRetNetAmountBeforeGST,
                                'ZeroRetGSTAmount': ZeroRetGSTAmount,
                                'GDate': GDate
                            })
                    }
                    for (var idx in twelvesalereturngst) {
                        var twelve_salereturngst = twelvesalereturngst[idx];
                        var Key = '';
                        var twelveRetNetAmountBeforeGST = 0;
                        var NetAmount = 0;
                        var twelveRetGSTAmount = 0;
                        var GSTPercentage = '';
                        var year = new Date(twelve_salereturngst.GrnDate).getFullYear();
                        var month = new Date(twelve_salereturngst.GrnDate).getMonth();
                        var date = new Date(twelve_salereturngst.GrnDate).getDate();
                        Key = (month + 1) + '/' + date + '/' + year;
                        var GDate = twelve_salereturngst.GrnDate;
                        twelveRetNetAmountBeforeGST = twelve_salereturngst.NetAmountBeforeGST;
                        NetAmount = twelve_salereturngst.NetAmount;
                        twelveRetGSTAmount = twelve_salereturngst.GSTAmount;
                        GSTPercentage = twelve_salereturngst.GSTPercentage;
                        var valappended = 0;
                        $scope.NetSaleGst.forEach(function (item) {
                            if (Key == item.Key) {
                                item.GDate = twelve_salereturngst.GrnDate;
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
                            $scope.NetSaleGst.push({
                                'Key': Key,
                                'twelveRetNetAmountBeforeGST': twelveRetNetAmountBeforeGST,
                                'twelveRetGSTAmount': twelveRetGSTAmount,
                                'GDate': GDate
                            })
                    }
                    for (var idx in eighteensalereturngst) {
                        var eighteen_salereturngst = eighteensalereturngst[idx];
                        var Key = '';
                        var eighteenRetNetAmountBeforeGST = 0;
                        var NetAmount = 0;
                        var eighteenRetGSTAmount = 0;
                        var GSTPercentage = '';
                        var year = new Date(eighteen_salereturngst.GrnDate).getFullYear();
                        var month = new Date(eighteen_salereturngst.GrnDate).getMonth();
                        var date = new Date(eighteen_salereturngst.GrnDate).getDate();
                        Key = (month + 1) + '/' + date + '/' + year;
                        var GDate = eighteen_salereturngst.GrnDate;
                        eighteenRetNetAmountBeforeGST = eighteen_salereturngst.NetAmountBeforeGST;
                        NetAmount = eighteen_salereturngst.NetAmount;
                        eighteenRetGSTAmount = eighteen_salereturngst.GSTAmount;
                        GSTPercentage = eighteen_salereturngst.GSTPercentage;
                        var valappended = 0;
                        $scope.NetSaleGst.forEach(function (item) {
                            if (Key == item.Key) {
                                item.GDate = eighteen_salereturngst.GrnDate;
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
                            $scope.NetSaleGst.push({
                                'Key': Key,
                                'eighteenRetNetAmountBeforeGST': eighteenRetNetAmountBeforeGST,
                                'eighteenRetGSTAmount': eighteenRetGSTAmount,
                                'GDate': GDate
                            })
                    }
                    for (var idx in fivesalereturngst) {
                        var five_salereturngst = fivesalereturngst[idx];
                        var Key = '';
                        var fiveRetNetAmountBeforeGST = 0;
                        var NetAmount = 0;
                        var fiveRetGSTAmount = 0;
                        var GSTPercentage = '';
                        var year = new Date(five_salereturngst.GrnDate).getFullYear();
                        var month = new Date(five_salereturngst.GrnDate).getMonth();
                        var date = new Date(five_salereturngst.GrnDate).getDate();
                        Key = (month + 1) + '/' + date + '/' + year;
                        var GDate = five_salereturngst.GrnDate;
                        fiveRetNetAmountBeforeGST = five_salereturngst.NetAmountBeforeGST;
                        NetAmount = five_salereturngst.NetAmount;
                        fiveRetGSTAmount = five_salereturngst.GSTAmount;
                        GSTPercentage = five_salereturngst.GSTPercentage;
                        var valappended = 0;
                        $scope.NetSaleGst.forEach(function (item) {
                            if (Key == item.Key) {
                                item.GDate = five_salereturngst.GrnDate;
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
                            $scope.NetSaleGst.push({
                                'Key': Key,
                                'fiveRetNetAmountBeforeGST': fiveRetNetAmountBeforeGST,
                                'fiveRetGSTAmount': fiveRetGSTAmount,
                                'GDate': GDate
                            })
                    }
                    for (var idx in twentyeightsalereturngst) {
                        var twentyeight_salereturngst = twentyeightsalereturngst[idx];
                        var Key = '';
                        var twentyeightRetNetAmountBeforeGST = 0;
                        var NetAmount = 0;
                        var twentyeightRetGSTAmount = 0;
                        var GSTPercentage = '';
                        var year = new Date(twentyeight_salereturngst.GrnDate).getFullYear();
                        var month = new Date(twentyeight_salereturngst.GrnDate).getMonth();
                        var date = new Date(twentyeight_salereturngst.GrnDate).getDate();
                        Key = (month + 1) + '/' + date + '/' + year;
                        var GDate = twentyeight_salereturngst.GrnDate;
                        twentyeightRetNetAmountBeforeGST = twentyeight_salereturngst.NetAmountBeforeGST;
                        NetAmount = twentyeight_salereturngst.NetAmount;
                        twentyeightRetGSTAmount = twentyeight_salereturngst.GSTAmount;
                        GSTPercentage = twentyeight_salereturngst.GSTPercentage;
                        var valappended = 0;
                        $scope.NetSaleGst.forEach(function (item) {
                            if (Key == item.Key) {
                                item.GDate = twentyeight_salereturngst.GrnDate;
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
                            $scope.NetSaleGst.push({
                                'Key': Key,
                                'twentyeightRetNetAmountBeforeGST': twentyeightRetNetAmountBeforeGST,
                                'twentyeightRetGSTAmount': twentyeightRetGSTAmount,
                                'GDate': GDate
                            })
                    }
                    for (var idx in overallsalereturngst) {
                        var overall_salereturngst = overallsalereturngst[idx];
                        var Key = '';
                        var RetNetAmountBeforeGST = 0;
                        var RetNetAmount = 0;
                        var RetGSTAmount = 0;
                        var GSTPercentage = '';
                        var year = new Date(overall_salereturngst.GrnDate).getFullYear();
                        var month = new Date(overall_salereturngst.GrnDate).getMonth();
                        var date = new Date(overall_salereturngst.GrnDate).getDate();
                        Key = (month + 1) + '/' + date + '/' + year;
                        var GDate = overall_salereturngst.GrnDate;
                        RetNetAmountBeforeGST = overall_salereturngst.NetAmountBeforeGST;
                        RetNetAmount = overall_salereturngst.NetAmount;
                        RetGSTAmount = overall_salereturngst.GSTAmount;
                        GSTPercentage = overall_salereturngst.GSTPercentage;
                        var valappended = 0;
                        $scope.NetSaleGst.forEach(function (item) {
                            if (Key == item.Key) {
                                item.GDate = overall_salereturngst.GrnDate;
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
                            $scope.NetSaleGst.push({
                                'Key': Key,
                                'RetNetAmountBeforeGST': RetNetAmountBeforeGST,
                                'RetNetAmount': RetNetAmount,
                                'RetGSTAmount': RetGSTAmount,
                                'GDate': GDate
                            })
                    }
                }
                $scope.NetSaleGst.sort($scope.sortdatee);
                $scope.sortdatee = function (a, b) {
                    return new Date(a.GDate).getTime() - new Date(b.GDate).getTime();
                }
                for (var idx in $scope.NetSaleGst) {
                    var allgst = $scope.NetSaleGst[idx];
                    var consolidategst = {
                        Key: allgst.Key,
                        NetAmountBeforeGST: (allgst.SaleNetAmountBeforeGST || 0) - (allgst.RetNetAmountBeforeGST || 0),
                        NetAmount: (allgst.SaleNetAmount || 0) - (allgst.RetNetAmount || 0),
                        GSTAmount: (allgst.SaleGSTAmount || 0) - (allgst.RetGSTAmount || 0),
                        ZeroNetAmountBeforeGST: (allgst.ZeroSaleNetAmountBeforeGST || 0) - (allgst.ZeroRetNetAmountBeforeGST || 0),
                        ZeroGSTAmount: (allgst.ZeroSaleGSTAmount || 0) - (allgst.ZeroRetGSTAmount || 0),
                        fiveNetAmountBeforeGST: (allgst.fiveSaleNetAmountBeforeGST || 0) - (allgst.fiveRetNetAmountBeforeGST || 0),
                        fiveGSTAmount: (allgst.fiveSaleGSTAmount || 0) - (allgst.fiveRetGSTAmount || 0),
                        twelveNetAmountBeforeGST: (allgst.twelveSaleNetAmountBeforeGST || 0) - (allgst.twelveRetNetAmountBeforeGST || 0),
                        twelveGSTAmount: (allgst.twelveSaleGSTAmount || 0) - (allgst.twelveRetGSTAmount || 0),
                        eighteenNetAmountBeforeGST: (allgst.eighteenSaleNetAmountBeforeGST || 0) - (allgst.eighteenRetNetAmountBeforeGST || 0),
                        eighteenGSTAmount: (allgst.eighteenSaleGSTAmount || 0) - (allgst.eighteenRetGSTAmount || 0),
                        twentyeightNetAmountBeforeGST: (allgst.twentyeightSaleNetAmountBeforeGST || 0) - (allgst.twentyeightRetNetAmountBeforeGST || 0),
                        twentyeightGSTAmount: (allgst.twentyeightSaleGSTAmount || 0) - (allgst.twentyeightRetGSTAmount || 0),
                    }
                    $scope.OverallGst.push(consolidategst);
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
            for (var jdx in $scope.OverallGst) {
                var netcollection = $scope.OverallGst[jdx];
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
                action: 'pharmacy/grndetail/GetConsolidatePurchaseGst',
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
                action: 'pharmacy/grndetail/PrintConsolidatePurchaseGSTReport',
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

    ConsolidatePurchaseGSTReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();