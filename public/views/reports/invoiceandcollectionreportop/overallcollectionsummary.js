(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('OverallCollectionSummaryController', OverallCollectionSummaryController);

    function OverallCollectionSummaryController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.items = [];
        $scope.currentcontext = {};
        $scope.currentfilter = {
            From: $filter('date')(new Date(), 'yyyy-MM-dd 00:00:00'),
            To: $filter('date')(new Date(), 'yyyy-MM-dd 23:59:59'),
        }
        $scope.currentcontext = {
            FacilityId: utl.Session.getCurrentFacilityId(),
        }

        $scope.GetBillingCollectionOptionsCallBack = function (scope, res, options, hasError) {
            $scope.OverallCollection = res;
            $scope.UserCollection = [];
            $scope.NetUserCollection = [];
            $scope.OverallCollectSummary = [];
            if ($scope.OverallCollection) {
                var opbillcollection1 = [];
                var opbillcollection2 = [];
                var opbillcollection3 = [];
                var ipbillcollection1 = [];
                var ipbillcollection2 = [];
                var ipbillcollection3 = [];
                var phabillcollection1 = [];
                var phabillcollection2 = [];
                var phabillcollection3 = [];
                var phabillcollection4 = [];
                var doctorshare = [];
                var advancefund = [];
                if ($scope.OverallCollection.length > 0) {
                    opbillcollection1 = $scope.OverallCollection[0];
                }
                if ($scope.OverallCollection.length > 1) {
                    opbillcollection2 = $scope.OverallCollection[1];
                }
                if ($scope.OverallCollection.length > 2) {
                    opbillcollection3 = $scope.OverallCollection[2];
                }
                if ($scope.OverallCollection.length > 0) {
                    ipbillcollection1 = $scope.OverallCollection[3];
                }
                if ($scope.OverallCollection.length > 1) {
                    ipbillcollection2 = $scope.OverallCollection[4];
                }
                if ($scope.OverallCollection.length > 2) {
                    ipbillcollection3 = $scope.OverallCollection[5];
                }
                if ($scope.OverallCollection.length > 0) {
                    phabillcollection1 = $scope.OverallCollection[6];
                }
                if ($scope.OverallCollection.length > 1) {
                    phabillcollection2 = $scope.OverallCollection[7];
                }
                if ($scope.OverallCollection.length > 2) {
                    phabillcollection3 = $scope.OverallCollection[8];
                }
                if ($scope.OverallCollection.length > 2) {
                    phabillcollection4 = $scope.OverallCollection[9];
                }
                if ($scope.OverallCollection.length > 3) {
                    doctorshare = $scope.OverallCollection[10];
                }
                if ($scope.OverallCollection.length > 4) {
                    advancefund = $scope.OverallCollection[11];
                }


                if (opbillcollection1) {
                    var Key = '';
                    var CashAmt = 0;
                    var CardAmt = 0;
                    var OtherAmt = 0;
                    var UPIAmt = 0;
                    Key = opbillcollection1.Key;
                    CashAmt = opbillcollection1.Value.CashAmount;
                    CardAmt = opbillcollection1.Value.CardAmount;
                    OtherAmt = opbillcollection1.Value.OtherAmount;
                    UPIAmt = opbillcollection1.Value.UPIAmount;
                    $scope.NetUserCollection.push({
                        'Key': Key,
                        'CashAmt': CashAmt,
                        'CardAmt': CardAmt,
                        'OtherAmt': OtherAmt,
                        'UPIAmt': UPIAmt,
                    })
                }
                if (opbillcollection2) {
                    var Key = '';
                    var BillAmt = 0;
                    var BillDis = 0;
                    var DueAmt = 0;
                    Key = opbillcollection2.Key;
                    BillAmt = opbillcollection2.Value.BillAmount;
                    BillDis = opbillcollection2.Value.BillDiscount;
                    DueAmt = opbillcollection2.Value.OutStandingAmount;
                    var valappended = 0;
                    $scope.NetUserCollection.forEach(function (item) {
                        if (Key === item.Key) {
                            item.BillAmt = BillAmt;
                            item.BillDis = BillDis;
                            item.DueAmt = DueAmt;
                            valappended = 1;
                        }
                    });
                    if (valappended == 0) {
                        $scope.NetUserCollection.push({
                            'Key': Key,
                            'BillAmt': BillAmt,
                            'BillDis': BillDis,
                            'DueAmt': DueAmt,
                        })
                    }
                }
                if (opbillcollection3) {
                    var Key = '';
                    var RefCashAmt = 0;
                    var RefCardAmt = 0;
                    var RefOtherAmt = 0;
                    var RefUPIAmt = 0;
                    var RefAmt = 0;
                    Key = opbillcollection3.Key;
                    RefCashAmt = opbillcollection3.Value.CashAmount;
                    RefCardAmt = opbillcollection3.Value.CardAmount;
                    RefOtherAmt = opbillcollection3.Value.OtherAmount;
                    RefUPIAmt = opbillcollection3.Value.UPIAmount;
                    RefAmt = opbillcollection3.Value.RefundAmount;
                    var valappended = 0;
                    $scope.NetUserCollection.forEach(function (item) {
                        if (Key === item.Key) {
                            item.RefCashAmt = RefCashAmt;
                            item.RefCardAmt = RefCardAmt;
                            item.RefOtherAmt = RefOtherAmt;
                            item.RefUPIAmt = RefUPIAmt;
                            item.RefAmt = RefAmt;
                            valappended = 1;
                        }
                    });
                }

                if (ipbillcollection1) {
                    var Key = '';
                    var CashAmt = 0;
                    var CardAmt = 0;
                    var OtherAmt = 0;
                    var UPIAmt = 0;
                    Key = ipbillcollection1.Key;
                    CashAmt = ipbillcollection1.Value.CashAmount;
                    CardAmt = ipbillcollection1.Value.CardAmount;
                    OtherAmt = ipbillcollection1.Value.OtherAmount;
                    UPIAmt = ipbillcollection1.Value.UPIAmount;
                    $scope.NetUserCollection.push({
                        'Key': Key,
                        'CashAmt': CashAmt,
                        'CardAmt': CardAmt,
                        'OtherAmt': OtherAmt,
                        'UPIAmt': UPIAmt,
                    })
                }
                if (ipbillcollection2) {
                    var Key = '';
                    var BillAmt = 0;
                    var BillDis = 0;
                    var DueAmt = 0;
                    Key = ipbillcollection2.Key;
                    BillAmt = ipbillcollection2.Value.BillAmount;
                    BillDis = ipbillcollection2.Value.BillDiscount;
                    DueAmt = ipbillcollection2.Value.OutStandingAmount;
                    var valappended = 0;
                    $scope.NetUserCollection.forEach(function (item) {
                        if (Key === item.Key) {
                            item.BillAmt = BillAmt;
                            item.BillDis = BillDis;
                            item.DueAmt = DueAmt;
                            valappended = 1;
                        }
                    });
                }
                if (ipbillcollection3) {
                    var Key = '';
                    var RefCashAmt = 0;
                    var RefCardAmt = 0;
                    var RefOtherAmt = 0;
                    var RefUPIAmt = 0;
                    var RefAmt = 0;
                    Key = ipbillcollection3.Key;
                    RefCashAmt = ipbillcollection3.Value.CashAmount;
                    RefCardAmt = ipbillcollection3.Value.CardAmount;
                    RefOtherAmt = ipbillcollection3.Value.OtherAmount;
                    RefUPIAmt = ipbillcollection3.Value.UPIAmount;
                    RefAmt = ipbillcollection3.Value.RefundAmount;
                    var valappended = 0;
                    $scope.NetUserCollection.forEach(function (item) {
                        if (Key === item.Key) {
                            item.RefCashAmt = RefCashAmt;
                            item.RefCardAmt = RefCardAmt;
                            item.RefOtherAmt = RefOtherAmt;
                            item.RefUPIAmt = RefUPIAmt;
                            item.RefAmt = RefAmt;
                            valappended = 1;
                        }
                    });
                }

                if (phabillcollection1) {
                    var Key = '';
                    var CashAmt = 0;
                    var CardAmt = 0;
                    var OtherAmt = 0;
                    var UPIAmt = 0;
                    Key = phabillcollection1.Key;
                    CashAmt = phabillcollection1.Value.CashAmount;
                    CardAmt = phabillcollection1.Value.CardAmount;
                    OtherAmt = phabillcollection1.Value.OtherAmount;
                    UPIAmt = phabillcollection1.Value.UPIAmount;
                    $scope.NetUserCollection.push({
                        'Key': Key,
                        'CashAmt': CashAmt,
                        'CardAmt': CardAmt,
                        'OtherAmt': OtherAmt,
                        'UPIAmt': UPIAmt,
                    })
                }
                if (phabillcollection2) {
                    var Key = '';
                    var BillAmt = 0;
                    var BillDis = 0;
                    var DueAmt = 0;
                    var IPBill = 0;
                    Key = phabillcollection2.Key;
                    BillAmt = phabillcollection2.Value.BillAmount;
                    BillDis = phabillcollection2.Value.BillDiscount;
                    DueAmt = phabillcollection2.Value.OutStandingAmount;
                    IPBill = phabillcollection2.Value.IPBillAmount;
                    var valappended = 0;
                    $scope.NetUserCollection.forEach(function (item) {
                        if (Key === item.Key) {
                            item.BillAmt = BillAmt;
                            item.BillDis = BillDis;
                            item.DueAmt = DueAmt;
                            item.IPBill = IPBill;
                            valappended = 1;
                        }
                    });
                }
                if (phabillcollection3) {
                    var Key = '';
                    var RefCashAmt = 0;
                    var RefCardAmt = 0;
                    var RefOtherAmt = 0;
                    var RefUPIAmt = 0;
                    var RefAmt = 0;
                    Key = phabillcollection3.Key;
                    RefCashAmt = phabillcollection3.Value.CashAmount;
                    RefCardAmt = phabillcollection3.Value.CardAmount;
                    RefOtherAmt = phabillcollection3.Value.OtherAmount;
                    RefUPIAmt = phabillcollection3.Value.UPIAmount;
                    RefAmt = phabillcollection3.Value.RefundAmount;
                    var valappended = 0;
                    $scope.NetUserCollection.forEach(function (item) {
                        if (Key === item.Key) {
                            item.RefCashAmt = RefCashAmt;
                            item.RefCardAmt = RefCardAmt;
                            item.RefOtherAmt = RefOtherAmt;
                            item.RefUPIAmt = RefUPIAmt;
                            item.RefAmt = RefAmt;
                            valappended = 1;
                        }
                    });
                }
                if (phabillcollection4) {
                    var Key = '';
                    var IPRetAmt = 0;
                    Key = phabillcollection4.Key;
                    IPRetAmt = phabillcollection4.Value.IPReturnAmount;
                    var valappended = 0;
                    $scope.NetUserCollection.forEach(function (item) {
                        if (Key === item.Key) {
                            item.IPRetAmt = IPRetAmt;
                            valappended = 1;
                        }
                    });
                }
                if (doctorshare) {
                    var Key = '';
                    var DocCashAmt = 0;
                    var DocCardAmt = 0;
                    var DocOtherAmt = 0;
                    var DocUPIAmt = 0;
                    var DocAmt = 0;
                    Key = doctorshare.Key;
                    DocCashAmt = doctorshare.Value.CashAmount;
                    DocCardAmt = doctorshare.Value.CardAmount;
                    DocOtherAmt = doctorshare.Value.OtherAmount;
                    DocUPIAmt = doctorshare.Value.UPIAmount;
                    DocAmt = doctorshare.Value.DoctorShare;
                    var valappended = 0;
                    $scope.NetUserCollection.forEach(function (item) {
                        if (Key === item.Key) {
                            item.DocCashAmt = DocCashAmt;
                            item.DocCardAmt = DocCardAmt;
                            item.DocOtherAmt = DocOtherAmt;
                            item.DocUPIAmt = DocUPIAmt;
                            item.DocAmt = DocAmt;
                            valappended = 1;
                        }
                    });
                    if (valappended == 0) {
                        $scope.NetUserCollection.push({
                            'Key': Key,
                            'DocCashAmt': DocCashAmt,
                            'DocCardAmt': DocCardAmt,
                            'DocOtherAmt': DocOtherAmt,
                            'DocUPIAmt': DocUPIAmt,
                            'DocAmt': DocAmt,
                        })
                    }
                }
                if (advancefund) {
                    var Key = '';
                    var CashAmt = 0;
                    var CardAmt = 0;
                    var OtherAmt = 0;
                    var UPIAmt = 0;
                    Key = advancefund.Key;
                    CashAmt = advancefund.Value.CashAmount;
                    CardAmt = advancefund.Value.CardAmount;
                    OtherAmt = advancefund.Value.OtherAmount;
                    UPIAmt = advancefund.Value.UPIAmount;
                    // Amt = advancefund.Value.TotalAmountPaid;
                    var valappended = 0;
                    $scope.NetUserCollection.forEach(function (item) {
                        if (Key === item.Key) {
                            item.CashAmt = CashAmt;
                            item.CardAmt = CardAmt;
                            item.OtherAmt = OtherAmt;
                            item.UPIAmt = UPIAmt;
                            // item.Amt = Amt;
                            valappended = 1;
                        }
                    });
                    if (valappended == 0) {
                        $scope.NetUserCollection.push({
                            'Key': Key,
                            'CashAmt': CashAmt,
                            'CardAmt': CardAmt,
                            'OtherAmt': OtherAmt,
                            'UPIAmt': UPIAmt,
                            // 'Amt': Amt,
                        })
                    }
                }
                for (var idx in $scope.NetUserCollection) {
                    var usercollectdata = $scope.NetUserCollection[idx];
                    if (usercollectdata.IPRetAmt) {
                        var returnamt = usercollectdata.IPRetAmt;
                    } else {
                        var returnamt = 0;
                    }
                    if (usercollectdata.IPBill) {
                        var ipbillamt = usercollectdata.IPBill;
                    } else {
                        var ipbillamt = 0;
                    }
                    var overallcollection = {
                        Key: usercollectdata.Key,
                        BillAmount: usercollectdata.BillAmt,
                        BillDiscount: usercollectdata.BillDis,
                        NetAmount: parseInt(usercollectdata.BillAmt || 0).toFixed(2) - parseInt(usercollectdata.BillDis || 0).toFixed(2),
                        DueAmount: usercollectdata.DueAmt,
                        Cash: usercollectdata.CashAmt,
                        RefundCash: usercollectdata.RefCashAmt,
                        DocCash: usercollectdata.DocCashAmt,
                        NetCash: parseInt(usercollectdata.CashAmt || 0).toFixed(2) - parseInt(usercollectdata.RefCashAmt || 0).toFixed(2),
                        Card: usercollectdata.CardAmt,
                        RefundCard: usercollectdata.RefCardAmt,
                        DocCard: usercollectdata.DocCardAmt,
                        NetCard: (usercollectdata.CardAmt || 0) - (usercollectdata.RefCardAmt || 0),
                        Others: usercollectdata.OtherAmt,
                        RefundOthers: usercollectdata.RefOtherAmt,
                        DocOthers: usercollectdata.DocOtherAmt,
                        NetOthers: (usercollectdata.OtherAmt || 0) - (usercollectdata.RefOtherAmt || 0),
                        UPI: usercollectdata.UPIAmt,
                        RefundUPI: usercollectdata.RefUPIAmt,
                        DocUPI: usercollectdata.DocUPIAmt,
                        NetUPI: (usercollectdata.UPIAmt || 0) - (usercollectdata.RefUPIAmt || 0),
                        DocTotal: usercollectdata.DocAmt,
                        NetRef: usercollectdata.RefAmt,
                        NetIPRet: usercollectdata.IPRetAmt,
                        TotalCollect: (parseInt(usercollectdata.CashAmt || 0).toFixed(2) - parseInt(usercollectdata.RefCashAmt || 0).toFixed(2)) +
                            (parseInt(usercollectdata.CardAmt || 0).toFixed(2) - parseInt(usercollectdata.RefCardAmt || 0).toFixed(2)) +
                            (parseInt(usercollectdata.OtherAmt || 0).toFixed(2) - parseInt(usercollectdata.RefOtherAmt || 0).toFixed(2)) +
                            (parseInt(usercollectdata.UPIAmt || 0).toFixed(2) - parseInt(usercollectdata.RefUPIAmt || 0).toFixed(2)) -
                            parseInt(usercollectdata.DocAmt || 0).toFixed(2),
                    }
                    $scope.OverallCollectSummary.push(overallcollection);
                }
            }
            var TotBillAmt = 0;
            var TotBillDis = 0;
            var TotNetAmt = 0;
            var TotDueAmt = 0;
            var TotCashAmt = 0;
            var TotCardAmt = 0;
            var TotOtherAmt = 0;
            var TotUPIAmt = 0;
            var TotCollectionAmt = 0;
            var DocCashAmt = 0;
            var DocCardAmt = 0;
            var DocOtherAmt = 0;
            var DocUPIAmt = 0;
            var TotalDocAmt = 0;
            var TotalRefAmt = 0;
            var TotalIPRetAmt = 0;

            for (var jdx in $scope.OverallCollectSummary) {
                var netcollection = $scope.OverallCollectSummary[jdx];
                TotBillAmt = TotBillAmt + (netcollection.BillAmount || 0);
                TotBillDis = TotBillDis + (netcollection.BillDiscount || 0);
                TotNetAmt = TotNetAmt + (netcollection.NetAmount || 0);
                TotDueAmt = TotDueAmt + (netcollection.DueAmount || 0);
                TotCashAmt = TotCashAmt + (netcollection.NetCash || 0);
                TotCardAmt = TotCardAmt + (netcollection.NetCard || 0);
                TotOtherAmt = TotOtherAmt + (netcollection.NetOthers || 0);
                TotUPIAmt = TotUPIAmt + (netcollection.NetUPI || 0);
                TotCollectionAmt = TotCollectionAmt + (netcollection.TotalCollect || 0);
                DocCashAmt = DocCashAmt + (netcollection.DocCash || 0);
                DocCardAmt = DocCardAmt + (netcollection.DocCard || 0);
                DocOtherAmt = DocOtherAmt + (netcollection.DocOthers || 0);
                DocUPIAmt = DocUPIAmt + (netcollection.DocUPI || 0);
                TotalDocAmt = TotalDocAmt + (netcollection.DocTotal || 0);
                TotalRefAmt = TotalRefAmt + (netcollection.NetRef || 0);
                TotalIPRetAmt = TotalIPRetAmt + (netcollection.NetIPRet || 0);
            }
            $scope.TotBillAmt = (TotBillAmt).toFixed(2);
            $scope.TotBillDis = (TotBillDis).toFixed(2);
            $scope.TotNetAmt = (TotNetAmt).toFixed(2);
            $scope.TotDueAmt = (TotDueAmt).toFixed(2);
            $scope.TotCashAmt = (TotCashAmt).toFixed(2);
            $scope.TotCardAmt = (TotCardAmt).toFixed(2);
            $scope.TotOtherAmt = (TotOtherAmt).toFixed(2);
            $scope.TotUPIAmt = (TotUPIAmt).toFixed(2);
            $scope.TotCollectionAmt = (TotCollectionAmt).toFixed(2);
            $scope.DocCashAmt = (DocCashAmt).toFixed(2);
            $scope.DocCardAmt = (DocCardAmt).toFixed(2);
            $scope.DocOtherAmt = (DocOtherAmt).toFixed(2);
            $scope.DocUPIAmt = (DocUPIAmt).toFixed(2);
            $scope.TotalDocAmt = (TotalDocAmt).toFixed(2);
            $scope.TotalRefAmt = (TotalRefAmt).toFixed(2);
            $scope.TotalIPRetAmt = (TotalIPRetAmt).toFixed(2);
            $scope.OverallCollection = ($scope.TotCollectionAmt - $scope.TotalDocAmt);


        }

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

            // var From = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            // var To = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Data: {
                    FromDate: $scope.currentfilter.From,
                    ToDate: $scope.currentfilter.To,
                    FacilityId: utl.Session.getCurrentFacilityId()
                },
            };

            var options = {
                action: 'Billing/PatientPaymentDetails/GetOverallCollectionSummary',
                data: inputData,
                type: 'post',
                onComplete: $scope.GetBillingCollectionOptionsCallBack
            };
            utl.Http.doAction(options);
        };
        $scope.print = function () {
            // var From = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            // var To = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: $scope.currentfilter.From,
                    ToDate: $scope.currentfilter.To,
                    FacilityId: utl.Session.getCurrentFacilityId()
                }
            };
            var options = {
                action: 'billing/PatientPaymentDetails/PrintOverallCollectionSummary',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };
        $scope.onenter = function (data) {
            if (data == undefined) {
                // $scope.getList();
            }
        };
        $scope.backtoReport = function () {
            $state.go('app.billingreportstab.opinvoicebillingreport')
        };


        // $scope.LoadDashboard = function () {
        //     $scope.GetPharmacyOptions();
        // }

        // $scope.LoadDashboard();
    }
    OverallCollectionSummaryController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();