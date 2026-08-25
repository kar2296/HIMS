(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('BillingCounterFormController', BillingCounterFormController);

    function BillingCounterFormController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        $scope.lookup = {};

        $scope.item = {
            UserId: utl.Session.getCurrentUserId(),
            BillingCounterId: -1,
            DepartmentId: parseInt(utl.Session.getCurrentDepartmentId()),
            StoreMasterId: -1,
            FacilityId: utl.Session.getCurrentFacilityId(),
            DocumentNumber: null,
            DocumentDate: utl.Formatter.getCurrentDate(),
            OpeningDate: utl.Formatter.getCurrentDate(),
            OpeningBalance: 0.00,
            OpeningCash: 0.00,
            OpeningCard: 0.00,
            OpeningCheque: 0.00,
            OpeningRemarks: null,
            ClosingDate: utl.Formatter.getCurrentDate(),
            ClosingBalance: 0.00,
            ClosingCash: 0.00,
            ClosingCard: 0.00,
            ClosingCheque: 0.00,
            ClosingRemarks: null,
            DifferenceAmount: 0.00,
            DenominationsNetCount: 0.00,
            DenominationsNetTotal: 0.00,
            OtherDenominationsTotal: 0.00,
            BillingCounterStatusId: 0,
            UserName: '',
            CounterName: '',
            CounterStatus: '',
            OpenedStatus: false,
            ClosedStatus: false,
            SubmittedStatus: false,
            CounterStartStatus: ''
        };

        $scope.currentcontext = {
            id: -1
        };

        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.DefinedDenominations = [];

        $scope.TotalCashReceipt = 0;
        $scope.TotalCardReceipt = 0;
        $scope.TotalChequeReceipt = 0;

        $scope.TotalLHRCCashReceipt = 0;
        $scope.TotalLHRCCardReceipt = 0;
        $scope.TotalLHRCChequeReceipt = 0;

        $scope.TotalCashRefund = 0;
        $scope.TotalCardRefund = 0;
        $scope.TotalChequeRefund = 0;

        $scope.TotalExpCashRefund = 0;
        $scope.TotalExpCardRefund = 0;
        $scope.TotalExpChequeRefund = 0;

        $scope.canShowStartBtn = true;
        $scope.canShowCloseBtn = false;
        $scope.canShowRevertBtn = false;
        $scope.canShowSaveBtn = false;
        $scope.canShowSubmitBtn = false;
        $scope.canShowPrintBtn = false;
        $scope.CounterRunning = false;

        $scope.CalculateTotal = function (item) {
            $scope.DenomCount = 0;
            $scope.DenomTotal = 0;
            if (parseInt(item.DenominationCount) > 0) {
                item.DenominationTotal = parseFloat((parseInt(item.DenominationCount) * parseInt(item.DenominationValue)).toFixed(2));

                for (var idx in $scope.DefinedDenominations) {
                    var denomitem = $scope.DefinedDenominations[idx];
                    $scope.DenomCount = parseFloat(($scope.DenomCount + parseInt(denomitem.DenominationCount)).toFixed(2));
                    $scope.DenomTotal = parseFloat(($scope.DenomTotal + denomitem.DenominationTotal).toFixed(2));
                }

                $scope.item.DenominationsNetCount = $scope.DenomCount;
                $scope.item.DenominationsNetTotal = $scope.DenomTotal;

                $scope.item.DifferenceAmount = (parseFloat($scope.item.OpeningBalance) + parseFloat($scope.item.ClosingBalance)) - parseFloat($scope.item.DenominationsNetTotal);

                /*
                if ($scope.DenomTotal > (parseFloat($scope.item.OpeningBalance) + parseFloat($scope.item.ClosingBalance))) {
                    utl.Alert.showErrorMsg('Denominations Amount Should`t be Greater Than Sum of Opening and Closing Amount..!');
                    item.DenominationCount = 0;
                    item.DenominationTotal = 0;
                    return false;
                } else {
                    $scope.item.DenominationsNetCount = $scope.DenomCount;
                    $scope.item.DenominationsNetTotal = $scope.DenomTotal;

                    $scope.item.DifferenceAmount = (parseFloat($scope.item.OpeningBalance) + parseFloat($scope.item.ClosingBalance)) - parseFloat($scope.item.DenominationsNetTotal);
                }
                */
            } else if (parseInt(item.DenominationCount) <= 0) {
                item.DenominationTotal = 0;

                $scope.DenomCount = 0;
                $scope.DenomTotal = 0;

                $scope.CalculateNetTotal();
            }
        };

        $scope.CalculateNetTotal = function () {
            for (var idx in $scope.DefinedDenominations) {
                var denomitem = $scope.DefinedDenominations[idx];
                $scope.DenomCount = parseFloat(($scope.DenomCount + parseInt(denomitem.DenominationCount)).toFixed(2));
                $scope.DenomTotal = parseFloat(($scope.DenomTotal + denomitem.DenominationTotal).toFixed(2));
            }

            $scope.item.DenominationsNetCount = $scope.DenomCount;
            $scope.item.DenominationsNetTotal = $scope.DenomTotal;

            $scope.item.DifferenceAmount = (parseFloat($scope.item.OpeningBalance) + parseFloat($scope.item.ClosingBalance)) - parseFloat($scope.item.DenominationsNetTotal);
        };

        $scope.numberonly = function (e) {
            if ($.inArray(e.keyCode, [8, 9]) !== -1 ||
                (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                (e.keyCode >= 35 && e.keyCode <= 40)) {
                return;
            }
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57))) {
                e.preventDefault();
            }
        };

        $scope.applyVisibilityRules = function () {
            if ($scope.item.BillingCounterStatusId == 0) {
                $scope.item.OpenedStatus = false;
                $scope.item.ClosedStatus = false;
                $scope.item.SubmittedStatus = false;
                $scope.canShowStartBtn = true;
                $scope.canShowCloseBtn = false;
                $scope.canShowRevertBtn = false;
                $scope.canShowSaveBtn = false;
                $scope.canShowSubmitBtn = false;
                $scope.item.CounterStatus = 'Please Select';
            } else if ($scope.item.BillingCounterStatusId == 1) {
                $scope.item.OpenedStatus = false;
                $scope.item.ClosedStatus = true;
                $scope.item.SubmittedStatus = false;
                $scope.canShowStartBtn = false;
                $scope.canShowCloseBtn = true;
                $scope.canShowRevertBtn = false;
                $scope.canShowSaveBtn = false;
                $scope.canShowSubmitBtn = false;
                $scope.item.CounterStatus = 'Running';
            } else if ($scope.item.BillingCounterStatusId == 2) {
                $scope.item.OpenedStatus = true;
                $scope.item.ClosedStatus = true;
                $scope.item.SubmittedStatus = false;
                $scope.canShowStartBtn = false;
                $scope.canShowCloseBtn = false;
                $scope.canShowRevertBtn = true;
                $scope.canShowSaveBtn = true;
                $scope.canShowSubmitBtn = true;
                $scope.item.CounterStatus = 'Closed';
            } else if ($scope.item.BillingCounterStatusId == 3) {
                $scope.item.OpenedStatus = true;
                $scope.item.ClosedStatus = true;
                $scope.item.SubmittedStatus = true;
                $scope.canShowStartBtn = false;
                $scope.canShowCloseBtn = false;
                $scope.canShowRevertBtn = false;
                $scope.canShowSaveBtn = false;
                $scope.canShowSubmitBtn = false;
                $scope.item.CounterStatus = 'Submitted';
            } else if ($scope.item.BillingCounterStatusId == 4) {
                $scope.item.OpenedStatus = true;
                $scope.item.ClosedStatus = true;
                $scope.item.SubmittedStatus = true;
                $scope.canShowStartBtn = false;
                $scope.canShowCloseBtn = false;
                $scope.canShowRevertBtn = false;
                $scope.canShowSaveBtn = false;
                $scope.canShowSubmitBtn = false;
                $scope.item.CounterStatus = 'Approved';
            } else if ($scope.item.BillingCounterStatusId == 5) {
                $scope.item.OpenedStatus = true;
                $scope.item.ClosedStatus = true;
                $scope.item.SubmittedStatus = true;
                $scope.canShowStartBtn = false;
                $scope.canShowCloseBtn = false;
                $scope.canShowRevertBtn = false;
                $scope.canShowSaveBtn = false;
                $scope.canShowSubmitBtn = false;
                $scope.item.CounterStatus = 'Authorized';
            }
        };

        $scope.getCounterCancellationsCallback = function (scope, res, options, hasError) {
            $scope.UserCounterCancelledReceipts = [];
            var CancelledReceipt = {};
            for (var rdidx in res.Data) {
                var EachCancellation = res.Data[rdidx];
                var BillNo = '';
                if (EachCancellation.PatientBill) {
                    BillNo = EachCancellation.PatientBill.BillNumber;
                }
                CancelledReceipt = {
                    PatientReceiptId: EachCancellation.Id,
                    PatientBillId: EachCancellation.PatientBillId,
                    BillNumber: BillNo,
                    PatientReceiptId: EachCancellation.PatientReceiptId,
                    ReceiptNumber: EachCancellation.ReceiptNumber,
                    CancelledAmount: EachCancellation.AmountPaid,
                    CancelledReason: EachCancellation.Comments
                }
                $scope.UserCounterCancelledReceipts.push(CancelledReceipt);
            }
        };

        $scope.getCounterCancellations = function () {
            var OpeningDate = $filter('date')($scope.item.OpeningDate, 'yyyy-MM-dd HH:mm:ss') || null;
            var ClosingDate = $filter('date')($scope.item.ClosingDate, 'yyyy-MM-dd HH:mm:ss') || null;
            var inputData = {
                Params: [
                    { Key: 3, Value: [OpeningDate, ClosingDate] },
                    { Key: 5, Value: 3 },
                    { Key: 19, Value: utl.Session.getCurrentUserId() },
                    { Key: 26, Value: utl.Session.getCurrentFacilityId() },
                ],
                PageContext: { PageSize: 1000, PageNumber: 1 }
            };

            var options = {
                action: 'billing/patientpaymentdetails/GetPatientPaymentDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getCounterCancellationsCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getCounterInfoCallback = function (scope, res, options, hasError) {
            $scope.UserCounterInfo = res.Data || [];
            if ($scope.UserCounterInfo && $scope.UserCounterInfo.length > 0) {
                $scope.UserCounterInfo.forEach(usercounter => {
                    $scope.item.Id = usercounter.Id;
                    $scope.item.BillingCounterStatusId = usercounter.BillingCounterStatusId;
                    if (usercounter.BillingCounterStatusId == 1) {
                        $scope.item.OpenedStatus = true;
                        $scope.item.ClosedStatus = false;
                        $scope.item.SubmittedStatus = true;
                        $scope.canShowStartBtn = false;
                        $scope.canShowCloseBtn = true;
                        $scope.canShowRevertBtn = false;
                        $scope.canShowSaveBtn = false;
                        $scope.canShowSubmitBtn = false;
                        $scope.canShowPrintBtn = false;
                        $scope.item.CounterStatus = 'Running';
                    } else if (usercounter.BillingCounterStatusId == 2) {
                        $scope.item.OpenedStatus = true;
                        $scope.item.ClosedStatus = true;
                        $scope.item.SubmittedStatus = false;
                        $scope.canShowStartBtn = false;
                        $scope.canShowCloseBtn = false;
                        $scope.canShowRevertBtn = true;
                        $scope.canShowSaveBtn = true;
                        $scope.canShowSubmitBtn = true;
                        $scope.canShowPrintBtn = true;
                        $scope.item.CounterStatus = 'Closed';
                    } else if (usercounter.BillingCounterStatusId == 3) {
                        $scope.item.OpenedStatus = true;
                        $scope.item.ClosedStatus = true;
                        $scope.item.SubmittedStatus = true;
                        $scope.canShowStartBtn = false;
                        $scope.canShowCloseBtn = false;
                        $scope.canShowRevertBtn = false;
                        $scope.canShowSaveBtn = false;
                        $scope.canShowSubmitBtn = false;
                        $scope.canShowPrintBtn = true;
                        $scope.item.CounterStatus = 'Submitted';
                    } else if (usercounter.BillingCounterStatusId == 4) {
                        $scope.item.OpenedStatus = true;
                        $scope.item.ClosedStatus = true;
                        $scope.item.SubmittedStatus = true;
                        $scope.canShowStartBtn = false;
                        $scope.canShowCloseBtn = false;
                        $scope.canShowRevertBtn = false;
                        $scope.canShowSaveBtn = false;
                        $scope.canShowSubmitBtn = false;
                        $scope.canShowPrintBtn = true;
                        $scope.item.CounterStatus = 'Approved';
                    } else if (usercounter.BillingCounterStatusId == 5) {
                        $scope.item.OpenedStatus = true;
                        $scope.item.ClosedStatus = true;
                        $scope.item.SubmittedStatus = true;
                        $scope.canShowStartBtn = false;
                        $scope.canShowCloseBtn = false;
                        $scope.canShowRevertBtn = false;
                        $scope.canShowSaveBtn = false;
                        $scope.canShowSubmitBtn = false;
                        $scope.canShowPrintBtn = true;
                        $scope.item.CounterStatus = 'Authorized';
                    }

                    if (usercounter.BillingCounter) {
                        $scope.item.CounterName = usercounter.BillingCounter.Description;
                    }
                    $scope.item.DocumentNumber = usercounter.DocumentNumber;
                    $scope.item.DocumentDate = usercounter.DocumentDate;
                    $scope.item.OpeningDate = usercounter.OpeningDate;
                    $scope.item.UserId = usercounter.UserId;
                    $scope.item.BillingCounterId = usercounter.BillingCounterId;
                    $scope.item.DepartmentId = usercounter.DepartmentId;
                    $scope.item.StoreMasterId = usercounter.StoreMasterId;
                    $scope.item.FacilityId = usercounter.FacilityId;
                    $scope.item.OpeningBalance = usercounter.OpeningBalance;
                    $scope.item.OpeningCash = usercounter.OpeningCash;
                    $scope.item.OpeningCard = usercounter.OpeningCard;
                    $scope.item.OpeningCheque = usercounter.OpeningCheque;
                    $scope.item.OpeningRemarks = usercounter.OpeningRemarks;
                    if (usercounter.BillingCounterStatusId >= 2) {
                        $scope.item.ClosingDate = usercounter.ClosingDate;
                    } else {
                        $scope.item.ClosingDate = utl.Formatter.getCurrentDate();
                    }
                    $scope.item.ClosingBalance = usercounter.ClosingBalance;
                    $scope.item.ClosingCash = usercounter.ClosingCash;
                    $scope.item.ClosingCard = usercounter.ClosingCard;
                    $scope.item.ClosingCheque = usercounter.ClosingCheque;
                    $scope.item.ClosingRemarks = usercounter.ClosingRemarks;

                    $scope.DefinedDenominations = [];
                    var GivenDenomination = {};
                    for (var ucdidx in usercounter.UserBillingCounterDenominations) {
                        var EachDenomination = usercounter.UserBillingCounterDenominations[ucdidx];
                        GivenDenomination = {
                            Id: EachDenomination.Id,
                            DenominationId: EachDenomination.DenominationId,
                            DenominationCode: EachDenomination.DenominationCode,
                            DenominationName: EachDenomination.DenominationName,
                            DenominationValue: EachDenomination.DenominationValue,
                            DenominationCount: EachDenomination.DenominationCount,
                            DenominationTotal: EachDenomination.DenominationTotal,
                            CurrencyCodeId: EachDenomination.CurrencyCodeId
                        }
                        $scope.DefinedDenominations.push(GivenDenomination);
                    }

                    $scope.UserCounterCancelledReceipts = [];
                    var CancelledReceipt = {};
                    for (var uccidx in usercounter.UserBillingCounterCancellations) {
                        var EachCancellation = usercounter.UserBillingCounterCancellations[uccidx];
                        CancelledReceipt = {
                            Id: EachCancellation.Id,
                            PatientBillId: EachCancellation.PatientBillId,
                            BillNumber: EachCancellation.BillNumber,
                            PatientReceiptId: EachCancellation.PatientReceiptId,
                            ReceiptNumber: EachCancellation.ReceiptNumber,
                            CancelledAmount: EachCancellation.CancelledAmount,
                            CancelledReason: EachCancellation.CancelledReason
                        }
                        $scope.UserCounterCancelledReceipts.push(CancelledReceipt);
                    }
                });

                $scope.DenomCount = 0;
                $scope.DenomTotal = 0;

                $scope.CalculateNetTotal();
            }

            if ($scope.item.BillingCounterStatusId == 2) {
                $scope.getCounterCancellations();
            }
        };

        $scope.getCounterInfoById = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [{ Key: 0, Value: $scope.currentcontext.id }],
                    PageContext: { PageSize: 1000, PageNumber: 1 }
                };

                var options = {
                    action: 'billing/userbillingcounters/GetUserBillingCounters',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getCounterInfoCallback
                };

                utl.Http.doAction(options);
            } else {
                $scope.applyVisibilityRules();
            }
        };

        $scope.getReceiptsInfoCallback = function (scope, res, options, hasError) {
            $scope.UserCounterReceiptsInfo = res.Data || [];
            $scope.TotalCashReceipt = 0;
            $scope.TotalCardReceipt = 0;
            $scope.TotalChequeReceipt = 0;
            $scope.UserCounterCancelledReceipts = [];
            var CashReceipt = 0;
            var CardReceipt = 0;
            var ChequeReceipt = 0;
            var WireTransferReceipt = 0;
            var AdjustedReceipt = 0;
            if ($scope.UserCounterReceiptsInfo && $scope.UserCounterReceiptsInfo.length > 0) {
                $scope.UserCounterReceiptsInfo.forEach(usercounterreceipt => {
                    if (usercounterreceipt.ReceiptStatusId == 3) {
                        var BillNo = '';
                        if (usercounterreceipt.PatientBill) {
                            BillNo = usercounterreceipt.PatientBill.BillNumber;
                        }
                        var CancelledReceipt = {
                            PatientReceiptId: usercounterreceipt.Id,
                            PatientBillId: usercounterreceipt.PatientBillId,
                            BillNumber: BillNo,
                            PatientReceiptId: usercounterreceipt.PatientReceiptId,
                            ReceiptNumber: usercounterreceipt.ReceiptNumber,
                            CancelledAmount: usercounterreceipt.AmountPaid,
                            CancelledReason: usercounterreceipt.Comments
                        };
                        $scope.UserCounterCancelledReceipts.push(CancelledReceipt);
                    } else {
                        if (usercounterreceipt.PaymentTypeId == 1) {
                            CashReceipt = CashReceipt + usercounterreceipt.AmountPaid;
                        } else if (usercounterreceipt.PaymentTypeId == 2) {
                            ChequeReceipt = ChequeReceipt + usercounterreceipt.AmountPaid;
                        } else if (usercounterreceipt.PaymentTypeId == 3) {
                            ChequeReceipt = ChequeReceipt + usercounterreceipt.AmountPaid;
                        } else if (usercounterreceipt.PaymentTypeId == 4) {
                            ChequeReceipt = ChequeReceipt + usercounterreceipt.AmountPaid;
                        } else if (usercounterreceipt.PaymentTypeId == 5) {
                            CardReceipt = CardReceipt + usercounterreceipt.AmountPaid;
                        } else if (usercounterreceipt.PaymentTypeId == 6) {
                            CardReceipt = CardReceipt + usercounterreceipt.AmountPaid;
                        }

                        $scope.TotalCashReceipt = CashReceipt;
                        $scope.TotalCardReceipt = CardReceipt;
                        $scope.TotalChequeReceipt = ChequeReceipt;
                    }
                });
            }

            $scope.getLHRCList();
        };

        $scope.getReceiptsInfoByUserId = function () {
            var OpeningDate = $filter('date')($scope.item.OpeningDate, 'yyyy-MM-dd HH:mm:ss') || null;
            var ClosingDate = $filter('date')($scope.item.ClosingDate, 'yyyy-MM-dd HH:mm:ss') || null;
            //var OpeningDate = $filter('date')($scope.item.OpeningDate, 'yyyy-MM-dd 00:00:00') || null;
            //var ClosingDate = $filter('date')($scope.item.ClosingDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 3, Value: [OpeningDate, ClosingDate] },
                    /*{ Key: 5, Value: 1 },*/
                    { Key: 19, Value: utl.Session.getCurrentUserId() },
                    { Key: 26, Value: utl.Session.getCurrentFacilityId() },
                    //{ Key: 20, Value: true }
                ],
                PageContext: { PageSize: 1000, PageNumber: 1 }
            };

            var options = {
                action: 'billing/patientpaymentdetails/GetPatientPaymentDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getReceiptsInfoCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getLHRCList = function () {
            var FrmDate = $filter('date')($scope.item.OpeningDate, 'yyyy-MM-dd HH:mm:ss');
            var ToDate = $filter('date')($scope.item.ClosingDate, 'yyyy-MM-dd HH:mm:ss');
            var inputData = {
                Params: [
                    { Key: 3, Value: FrmDate },
                    { Key: 4, Value: ToDate },
                    { Key: 5, Value: utl.Session.getCurrentUserId() },
                    { Key: 6, Value: [2, 3] }, //VoucherStatusId - Submit , Approved.
                    { Key: 7, Value: utl.Session.getCurrentFacilityId() },
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'billing/LHRCVoucher/GetLHRCVouchers',
                data: inputData,
                type: 'post',
                onComplete: $scope.getLHRCListCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getLHRCListCallback = function (scope, res, options, hasError) {
            if (res && res.Data) {
                $scope.TotalLHRCCashReceipt = 0;
                $scope.TotalLHRCCardReceipt = 0;
                $scope.TotalLHRCChequeReceipt = 0;
                var CashReceipt = 0;
                var CardReceipt = 0;
                var ChequeReceipt = 0;
                for (var idx in res.Data) {
                    var usercounterreceipt = res.Data[idx];
                    if (usercounterreceipt.PaymentTypeId == 1) {
                        CashReceipt = CashReceipt + usercounterreceipt.VoucherAmount;
                    } else if (usercounterreceipt.PaymentTypeId == 2) {
                        ChequeReceipt = ChequeReceipt + usercounterreceipt.VoucherAmount;
                    } else if (usercounterreceipt.PaymentTypeId == 3) {
                        ChequeReceipt = ChequeReceipt + usercounterreceipt.VoucherAmount;
                    } else if (usercounterreceipt.PaymentTypeId == 4) {
                        ChequeReceipt = ChequeReceipt + usercounterreceipt.VoucherAmount;
                    } else if (usercounterreceipt.PaymentTypeId == 5) {
                        CardReceipt = CardReceipt + usercounterreceipt.VoucherAmount;
                    } else if (usercounterreceipt.PaymentTypeId == 6) {
                        CardReceipt = CardReceipt + usercounterreceipt.VoucherAmount;
                    }

                    $scope.TotalLHRCCashReceipt = CashReceipt;
                    $scope.TotalLHRCCardReceipt = CardReceipt;
                    $scope.TotalLHRCChequeReceipt = ChequeReceipt;

                }
            }
            $scope.getVoucherList();
        };

        $scope.getVoucherList = function () {
            var FrmDate = $filter('date')($scope.item.OpeningDate, 'yyyy-MM-dd HH:mm:ss');
            var ToDate = $filter('date')($scope.item.ClosingDate, 'yyyy-MM-dd HH:mm:ss');
            var inputData = {
                Params: [
                    { Key: 3, Value: utl.Session.getCurrentUserId() },
                    { Key: 5, Value: FrmDate },
                    { Key: 6, Value: ToDate },
                    { Key: 4, Value: [2] }, //ExpenseStatusId - Submit , 2 Approved. 3 cancelled
                    { Key: 7, Value: utl.Session.getCurrentFacilityId() },
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'billing/GeneralExpenses/GetGeneralExpensess',
                data: inputData,
                type: 'post',
                onComplete: $scope.getVoucherListCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getVoucherListCallback = function (scope, res, options, hasError) {
            $scope.TotalExpCashRefund = 0;
            $scope.TotalExpCardRefund = 0;
            $scope.TotalExpChequeRefund = 0;
            if (res && res.Data) {
                var CashRefund = 0;
                var CardRefund = 0;
                var ChequeRefund = 0;
                for (var idx in res.Data) {
                    var usercounterrefund = res.Data[idx];
                    CashRefund = CashRefund + usercounterrefund.ExpenseAmount;

                    $scope.TotalExpCashRefund = CashRefund;
                    $scope.TotalExpCardRefund = CardRefund;
                    $scope.TotalExpChequeRefund = ChequeRefund;

                }
            }
            $scope.getRefundsInfoByUserId();
        }

        $scope.getRefundsInfoCallback = function (scope, res, options, hasError) {
            $scope.TotalCashRefund = 0;
            $scope.TotalCardRefund = 0;
            $scope.TotalChequeRefund = 0;
            $scope.UserCounterRefundsInfo = res.Data || [];
            var CashRefund = 0;
            var CardRefund = 0;
            var ChequeRefund = 0;
            var WireTransferRefund = 0;
            if ($scope.UserCounterRefundsInfo && $scope.UserCounterRefundsInfo.length > 0) {
                $scope.UserCounterRefundsInfo.forEach(usercounterrefund => {
                    if (usercounterrefund.PaymentTypeId == 1) {
                        CashRefund = CashRefund + usercounterrefund.RefundAmount;
                    } else if (usercounterrefund.PaymentTypeId == 2) {
                        ChequeRefund = ChequeRefund + usercounterrefund.RefundAmount;
                    } else if (usercounterrefund.PaymentTypeId == 3) {
                        ChequeRefund = ChequeRefund + usercounterrefund.RefundAmount;
                    } else if (usercounterrefund.PaymentTypeId == 4) {
                        ChequeRefund = ChequeRefund + usercounterrefund.RefundAmount;
                    } else if (usercounterrefund.PaymentTypeId == 5) {
                        CardRefund = CardRefund + usercounterrefund.RefundAmount;
                    } else if (usercounterrefund.PaymentTypeId == 6) {
                        CardRefund = CardRefund + usercounterrefund.RefundAmount;
                    }
                });

                $scope.TotalCashRefund = CashRefund;
                $scope.TotalCardRefund = CardRefund;
                $scope.TotalChequeRefund = ChequeRefund;

                $scope.item.ClosingBalance =
                    ($scope.TotalCashReceipt + $scope.TotalLHRCCashReceipt) -
                    ($scope.TotalCashRefund + $scope.TotalExpCashRefund);

                $scope.item.ClosingCash =
                    ($scope.TotalCashReceipt + $scope.TotalLHRCCashReceipt) -
                    ($scope.TotalCashRefund + $scope.TotalExpCashRefund);

                $scope.item.ClosingCard =
                    ($scope.TotalCardReceipt + $scope.TotalLHRCCardReceipt) -
                    ($scope.TotalCardRefund + $scope.TotalExpCardRefund);

                $scope.item.ClosingCheque =
                    ($scope.TotalChequeReceipt + $scope.TotalLHRCChequeReceipt) -
                    ($scope.TotalChequeRefund + $scope.TotalExpChequeRefund);

            } else {
                $scope.item.ClosingBalance =
                    ($scope.TotalCashReceipt + $scope.TotalLHRCCashReceipt) -
                    ($scope.TotalCashRefund + $scope.TotalExpCashRefund);

                $scope.item.ClosingCash =
                    ($scope.TotalCashReceipt + $scope.TotalLHRCCashReceipt) -
                    ($scope.TotalCashRefund + $scope.TotalExpCashRefund);

                $scope.item.ClosingCard =
                    ($scope.TotalCardReceipt + $scope.TotalLHRCCardReceipt) -
                    ($scope.TotalCardRefund + $scope.TotalExpCardRefund);


                $scope.item.ClosingCheque =
                    ($scope.TotalChequeReceipt + $scope.TotalLHRCChequeReceipt) -
                    ($scope.TotalChequeRefund + $scope.TotalExpChequeRefund);
            }

            $scope.item.BillingCounterStatusId = 2;
            $scope.saveItem();
        };

        $scope.getRefundsInfoByUserId = function () {
            var OpeningDate = $filter('date')($scope.item.OpeningDate, 'yyyy-MM-dd HH:mm:ss') || null;
            var ClosingDate = $filter('date')($scope.item.ClosingDate, 'yyyy-MM-dd HH:mm:ss') || null;
            var inputData = {
                Params: [
                    { Key: 3, Value: [OpeningDate, ClosingDate] },
                    { Key: 5, Value: 1 },
                    { Key: 14, Value: utl.Session.getCurrentUserId() },
                    { Key: 16, Value: utl.Session.getCurrentFacilityId() },
                ],
                PageContext: { PageSize: 1000, PageNumber: 1 }
            };

            var options = {
                action: 'billing/patientrefund/GetPatientRefund',
                data: inputData,
                type: 'post',
                onComplete: $scope.getRefundsInfoCallback
            };

            utl.Http.doAction(options);
        };

        $scope.checkCounterStatusCallback = function (scope, res, options, hasError) {
            $scope.UserCounterInfo = res.Data || [];
            if ($scope.UserCounterInfo && $scope.UserCounterInfo.length > 0) {
                $scope.canShowStartBtn = false;
                $scope.canShowCloseBtn = false;
                $scope.canShowRevertBtn = false;
                $scope.canShowSaveBtn = false;
                $scope.canShowSubmitBtn = false;
                $scope.canShowPrintBtn = false;

                $scope.item.OpenedStatus = true;
                $scope.item.ClosedStatus = true;
                $scope.item.SubmittedStatus = true;

                $scope.CounterRunning = true;
                $scope.item.CounterStartStatus = 'Counter Already Running..!';
            }
        };

        $scope.checkCounterStatusByUserId = function () {
            var inputData = {
                Params: [
                    { Key: 1, Value: utl.Session.getCurrentUserId() },
                    { Key: 10, Value: 1 }
                ],
                PageContext: { PageSize: 1000, PageNumber: 1 }
            };

            var options = {
                action: 'billing/userbillingcounters/GetBillingCounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.checkCounterStatusCallback
            };

            utl.Http.doAction(options);
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (data === true) {
                $scope.currentcontext.id = options.data.Data.Header.Id;
            } else {
                $scope.currentcontext.id = data;
            }
            loadData();
        };

        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'billing/userbillingcounters/PrintUpdateUserBillingCounters',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.Start = function () {
            if ($scope.item.BillingCounterId <= 0) {
                utl.Alert.showErrorMsg('Please Choose the Counter Before Start.!!');
                return false;
            } else {
                var confirmOptions = {
                    headingKey: 'common.confirm-modal-header.lbl',
                    messageKey: 'billing.billingcounters.startmsg.lbl',
                    yesKey: 'common.yeskey.lbl',
                    noKey: 'common.nokey.lbl',
                    onSuccessMethod: $scope.onStartConfirmed,
                };
            }
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onStartConfirmed = function () {
            $scope.item.BillingCounterStatusId = 1;
            $scope.item.ClosingDate = null;
            $scope.saveItem();
        };

        $scope.Close = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'billing.billingcounters.closemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onCloseConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onCloseConfirmed = function () {
            $scope.getReceiptsInfoByUserId();
            //$scope.getRefundsInfoByUserId();
        };

        $scope.Revert = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'billing.billingcounters.revertmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onRevertConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onRevertConfirmed = function () {
            $scope.item.BillingCounterStatusId = 1;
            $scope.item.ClosingBalance = 0;
            $scope.item.ClosingCash = 0;
            $scope.item.ClosingCard = 0;
            $scope.item.ClosingCheque = 0;

            for (var idx in $scope.DefinedDenominations) {
                var itemdenomination = $scope.DefinedDenominations[idx];
                itemdenomination.DenominationCount = 0;
                itemdenomination.DenominationTotal = 0;
            }

            $scope.UserCounterCancelledReceipts = [];
            $scope.saveItem();
        };

        $scope.Save = function () {
            $scope.item.BillingCounterStatusId = 2;
            $scope.saveItem();
        };

        $scope.Submit = function () {
            if ($scope.item.BillingCounterId <= 0) {
                utl.Alert.showErrorMsg('Please Choose the Counter Before Start.!!');
                return false;
            } else if (parseFloat($scope.item.ClosingBalance) <= 0) {
                utl.Alert.showErrorMsg('Please Revert the Counter & Close Again..!');
                return false;
            }/* else if (parseFloat($scope.item.DifferenceAmount) > 0) {
                utl.Alert.showErrorMsg('Difference Amount Should be Zero before Submit..!');
                return false;
            }*/ else {
                var confirmOptions = {
                    headingKey: 'common.confirm-modal-header.lbl',
                    messageKey: 'billing.billingcounters.submitmsg.lbl',
                    yesKey: 'common.yeskey.lbl',
                    noKey: 'common.nokey.lbl',
                    onSuccessMethod: $scope.onSubmitConfirmed,
                };
            }
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onSubmitConfirmed = function () {
            $scope.item.BillingCounterStatusId = 3;
            $scope.saveItem();
        };

        $scope.saveItem = function () {
            var _denominations = getDenominationsForSave();
            var _cancellations = getCancellationsForSave();

            var actionName = 'billing/userbillingcounters/AddUserBillingCounters';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'billing/userbillingcounters/UpdateUserBillingCounters';
            }

            var inputData = { Header: $scope.item, Denominations: _denominations, Cancellations: _cancellations };
            var options = {
                action: actionName,
                data: { Data: inputData },
                type: 'post',
                onComplete: $scope.saveItemCallback,
                onError: $scope.errorItemCallback
            };

            utl.Http.doAction(options);
        };

        function getDenominationsForSave() {
            var result = [];
            for (var idx in $scope.DefinedDenominations) {
                var item = $scope.DefinedDenominations[idx];
                result.push(item);
            }
            return result;
        }

        function getCancellationsForSave() {
            var result = [];
            var CancelledReceipt = {};
            for (var idx in $scope.UserCounterCancelledReceipts) {
                var item = $scope.UserCounterCancelledReceipts[idx];
                CancelledReceipt = {
                    PatientBillId: item.PatientBillId || 0,
                    BillNumber: item.BillNumber,
                    PatientReceiptId: item.PatientReceiptId || 0,
                    ReceiptNumber: item.ReceiptNumber,
                    CancelledAmount: item.CancelledAmount || 0,
                    CancelledReason: item.CancelledReason
                }
                result.push(CancelledReceipt);
            }
            return result;
        }

        $scope.backToList = function () {
            $state.go('app.billingcounter-list', $scope.currentcontext.id);
        };

        function loadData() {
            if ($scope.currentcontext.id > 0) {
                $scope.getCounterInfoById();
            }
            else {
                $scope.checkCounterStatusByUserId();
            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'User') {
                    $scope.item.UserName = value[0].Title.Description + ' ' + value[0].FirstName + ' ' + value[0].LastName;
                }
                if (key == 'Denomination') {
                    var DefinedDenomination = {};
                    for (var didx in value) {
                        DefinedDenomination = {
                            Id: 0,
                            DenominationId: value[didx].Id,
                            DenominationCode: value[didx].Code,
                            DenominationName: value[didx].Text,
                            DenominationValue: parseFloat(value[didx].Code),
                            DenominationCount: 0,
                            DenominationTotal: 0,
                            CurrencyCodeId: 0
                        }
                        $scope.DefinedDenominations.push(DefinedDenomination);
                    }
                }
            });
            loadData();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Department" },
                { "Key": "BillingCounter" },
                { "Key": "BillingCounterStatus" },
                { "Key": "Denomination", Default: false },
                //{ "Key": "UserBillingCounter", Request: { Params: [{ Key: 1, Value: utl.Session.getCurrentUserId() }] }, Default: false },
                { "Key": "User", Request: { Params: [{ Key: 0, Value: utl.Session.getCurrentUserId() }] }, Default: false }
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                item: $scope.item,
                currentcontext: $scope.currentcontext,
                lookup: $scope.lookup,
                DefinedDenominations: $scope.DefinedDenominations,
                CounterRunning: $scope.CounterRunning,
                canShowStartBtn: $scope.canShowStartBtn,
                canShowCloseBtn: $scope.canShowCloseBtn,
                canShowRevertBtn: $scope.canShowRevertBtn,
                canShowSaveBtn: $scope.canShowSaveBtn,
                canShowSubmitBtn: $scope.canShowSubmitBtn,
                canShowPrintBtn: $scope.canShowPrintBtn
            };
            $scope.$applyAsync();
        };

        var _origLookupCallback = $scope.lookupCallback;
        $scope.lookupCallback = function (scope, data, options, hasError) {
            _origLookupCallback(scope, data, options, hasError);
            $scope.refreshReactProps();
        };

        var _origCheckCounterStatusCallback = $scope.checkCounterStatusCallback;
        $scope.checkCounterStatusCallback = function (scope, res, options, hasError) {
            _origCheckCounterStatusCallback(scope, res, options, hasError);
            $scope.refreshReactProps();
        };

        var _origGetCounterInfoCallback = $scope.getCounterInfoCallback;
        $scope.getCounterInfoCallback = function (scope, res, options, hasError) {
            _origGetCounterInfoCallback(scope, res, options, hasError);
            $scope.refreshReactProps();
        };

        var _origCalculateTotal = $scope.CalculateTotal;
        $scope.CalculateTotal = function (item) {
            _origCalculateTotal(item);
            $scope.refreshReactProps();
        };

        var _origCalculateNetTotal = $scope.CalculateNetTotal;
        $scope.CalculateNetTotal = function () {
            _origCalculateNetTotal();
            $scope.refreshReactProps();
        };

        var _origSaveItemCallback = $scope.saveItemCallback;
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            _origSaveItemCallback(scope, data, options, hasError);
            $scope.refreshReactProps();
        };

        $scope.handleReactAction = function (actionName, payload) {
            payload = payload || {};
            if (actionName === 'counterChange') {
                $scope.item.BillingCounterId = payload.value;
                $scope.refreshReactProps();
            } else if (actionName === 'openingBalanceChange') {
                $scope.item.OpeningBalance = payload.value;
                $scope.refreshReactProps();
            } else if (actionName === 'openingRemarksChange') {
                $scope.item.OpeningRemarks = payload.value;
                $scope.refreshReactProps();
            } else if (actionName === 'closingRemarksChange') {
                $scope.item.ClosingRemarks = payload.value;
                $scope.refreshReactProps();
            } else if (actionName === 'denominationCountChange') {
                var denomitem = $scope.DefinedDenominations[payload.index];
                if (denomitem) {
                    denomitem.DenominationCount = payload.value;
                    $scope.CalculateTotal(denomitem);
                }
            } else if (actionName === 'start') {
                $scope.Start();
            } else if (actionName === 'close') {
                $scope.Close();
            } else if (actionName === 'revert') {
                $scope.Revert();
            } else if (actionName === 'save') {
                $scope.Save();
            } else if (actionName === 'submit') {
                $scope.Submit();
            } else if (actionName === 'print') {
                $scope.print();
            } else if (actionName === 'back') {
                $scope.backToList();
            }
        };

        $scope.initLookup();
    }

    BillingCounterFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();