(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('CashSubmissionFormController', CashSubmissionFormController);

    function CashSubmissionFormController($scope, $stateParams, $state, $translate, utl, $filter) {
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
            ClosedStatus: false
        };

        $scope.currentcontext = {
            id: -1
        };

        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.DefinedDenominations = [];

        $scope.TotalCashAmount = 0;
        $scope.TotalCardAmount = 0;
        $scope.TotalChequeAmount = 0;

        $scope.canShowApproveBtn = false;
        $scope.canShowAuthorizeBtn = false;
        $scope.canShowPrintBtn = true;

        $scope.PaymentOPDGSales = [];
        $scope.PaymentOPDGAdvance = [];
        $scope.PaymentOPDGOutstanding = [];
        $scope.PaymentOPDGCancels = [];
        $scope.Expenses = [];
        $scope.DoctorPayments = [];
        $scope.NetCash = 0;
        $scope.NetCard = 0;
        $scope.NetChequeOther = 0;
        $scope.NetNetBanking = 0;
        $scope.NetUPI = 0;
        $scope.NetAfford = 0;
        $scope.NetSubmission = 0;
        $scope.PatientBills = false;
        $scope.PatientPaymentDetail = false;
        $scope.PatientBillOutstanding = false;
        $scope.PatientBillCancellations = false;
        $scope.PatientRefunds = false;

        $scope.TotalCashSales = 0;
        $scope.TotalCardSales = 0;
        $scope.TotalChequeOtherSales = 0;
        $scope.TotalNetBankingSales = 0;
        $scope.TotalUPISales = 0;
        $scope.TotalAffordSales = 0;
        $scope.TotalSales = 0;

        $scope.TotalCashCancels = 0;
        $scope.TotalCardCancels = 0;
        $scope.TotalChequeOtherCancels = 0;
        $scope.TotalNetBankingCancels = 0;
        $scope.TotalUPICancels = 0;
        $scope.TotalAffordCancels = 0;
        $scope.TotalCancels = 0;

        $scope.TotalExpCashSales = 0;
        $scope.TotalExpCardSales = 0;
        $scope.TotalExpChequeOtherSales = 0;
        $scope.TotalExpNetBankingSales = 0;
        $scope.TotalExpUPISales = 0;
        $scope.TotalExpAffordSales = 0;
        $scope.TotalExpense = 0;

        $scope.CalculateTotal = function (item) {
            if (parseInt(item.DenominationCount) > 0) {
                item.DenominationTotal = parseFloat((parseInt(item.DenominationCount) * parseInt(item.DenominationValue)).toFixed(2));
            } else if (parseInt(item.DenominationCount) <= 0) {
                item.DenominationTotal = 0;
            }

            $scope.DenomCount = 0;
            $scope.DenomTotal = 0;

            $scope.CalculateNetTotal();
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
            if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
                (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                (e.keyCode >= 35 && e.keyCode <= 40)) {
                return;
            }
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57))) {
                e.preventDefault();
            }
        };

        $scope.print = function () {
            var inputData = {
                Id: $scope.item.Id,
                Data: {
                    userid: $scope.item.UserId,
                    From: $scope.item.OpeningDate,
                    To: $scope.item.ClosingDate
                }
            };
            var options = {
                action: 'billing/userbillingcounters/PrintUpdateUserBillingCounters',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };
        $scope.getOPDGRefundsListCallback = function (scope, res, options, hasError) {
            $scope.PaymentOPDGRefunds = [];
            $scope.TotalCashRefunds = 0;
            $scope.TotalCardRefunds = 0;
            $scope.TotalChequeOtherRefunds = 0;
            $scope.TotalNetBankingRefunds = 0;
            $scope.TotalUPIRefunds = 0;
            $scope.TotalAffordRefunds = 0;
            $scope.TotalRefunds = 0;

            if (res && res.Data && res.Data.length > 0) {
                $scope.PatientRefunds = true;
                var SNo = 1;
                for (var idx in res.Data) {
                    var PatientRefund = res.Data[idx];
                    // if (!PatientRefund.PharmacyReturnId || PatientRefund.PharmacyReturnId == null) {
                    var refundDt = PatientRefund.RefundDateTime;
                    var refundnumber = PatientRefund.RefundIdentifier;
                    var billDt = null;
                    var billnumber = null;
                    var RecDt = null;
                    var Recnumber = null;
                    var drname = '';
                    var referralName = null;
                    if (PatientRefund.PatientPaymentDetail) {
                        RecDt = PatientRefund.PatientPaymentDetail.ReceiptDateTime;
                        Recnumber = PatientRefund.PatientPaymentDetail.ReceiptNumber;


                        // if (PatientRefund.PatientPaymentDetail.User && PatientRefund.PatientPaymentDetail.User.Title && PatientRefund.PatientPaymentDetail.User.Title.Description) {
                        //     drname += PatientRefund.PatientPaymentDetail.User.Title.Description;
                        // }
                        // if (PatientRefund.PatientPaymentDetail.User && PatientRefund.PatientPaymentDetail.User.FirstName) {
                        //     drname += ' ' + PatientRefund.PatientPaymentDetail.User.FirstName;
                        // }
                        // if (PatientRefund.PatientPaymentDetail.User && PatientRefund.PatientPaymentDetail.User.LastName) {
                        //     drname += ' ' + PatientRefund.PatientPaymentDetail.User.LastName;
                        // }
                    }
                    if (PatientRefund.PatientBill) {
                        billDt = PatientRefund.PatientBill.BillDateTime;
                        billnumber = PatientRefund.PatientBill.BillNumber;
                        // drname = PatientRefund.PatientBill.DoctorName;
                        if (PatientRefund.PatientBill.User && PatientRefund.PatientBill.User.Title && PatientRefund.PatientBill.User.Title.Description) {
                            drname += PatientRefund.PatientBill.User.Title.Description;
                        }
                        if (PatientRefund.PatientBill.User && PatientRefund.PatientBill.User.FirstName) {
                            drname += ' ' + PatientRefund.PatientBill.User.FirstName;
                        }
                        if (PatientRefund.PatientBill.User && PatientRefund.PatientBill.User.LastName) {
                            drname += ' ' + PatientRefund.PatientBill.User.LastName;
                        }
                        if (PatientRefund.PatientBill.Referral)
                            referralName = PatientRefund.PatientBill.Referral.ReferralName;
                    }

                    var PatientName = '';
                    var Mrn = '';
                    var Status = '';
                    var Cash = 0;
                    var Card = 0;
                    var ChequeOthers = 0;
                    var NetBanking = 0;
                    var UPI = 0;
                    var Afford = 0;
                    if (PatientRefund.Patient) {
                        if (PatientRefund.Patient && PatientRefund.Patient.Title && PatientRefund.Patient.Title.Description) {
                            PatientName += PatientRefund.Patient.Title.Description;
                        }
                        if (PatientRefund.Patient && PatientRefund.Patient.FirstName) {
                            PatientName += ' ' + PatientRefund.Patient.FirstName;
                        }
                        if (PatientRefund.Patient && PatientRefund.Patient.LastName) {
                            PatientName += ' ' + PatientRefund.Patient.LastName;
                        }
                        if (PatientRefund.Patient.MRN) {
                            Mrn = PatientRefund.Patient.MRN;
                        }
                    }

                    if (!PatientName) {
                        PatientName = PatientRefund.PatientName;
                    }

                    // if ($scope.item.UserId == -1) {
                    if (PatientRefund.PaymentTypeId == 1) {
                        Cash = PatientRefund.RefundAmount;
                        $scope.TotalCashRefunds += PatientRefund.RefundAmount;
                        $scope.TotalRefunds += PatientRefund.RefundAmount;
                    } else if (PatientRefund.PaymentTypeId == 5 || PatientRefund.PaymentTypeId == 6) {
                        Card = PatientRefund.RefundAmount;
                        $scope.TotalCardRefunds += PatientRefund.RefundAmount;
                        $scope.TotalRefunds += PatientRefund.RefundAmount;
                    } else if (PatientRefund.PaymentTypeId != 1 && PatientRefund.PaymentTypeId != 5 &&
                        PatientRefund.PaymentTypeId != 6 && PatientRefund.PaymentTypeId != 10
                        && PatientRefund.PaymentTypeId != 11 && PatientRefund.PaymentTypeId != 12) {
                        ChequeOthers = PatientRefund.RefundAmount;
                        $scope.TotalChequeOtherRefunds += PatientRefund.RefundAmount;
                        $scope.TotalRefunds += PatientRefund.RefundAmount;
                    } else if (PatientRefund.PaymentTypeId == 10) {
                        NetBanking = PatientRefund.RefundAmount;
                        $scope.TotalNetBankingRefunds += PatientRefund.RefundAmount;
                        $scope.TotalRefunds += PatientRefund.RefundAmount;
                    } else if (PatientRefund.PaymentTypeId == 11) {
                        UPI = PatientRefund.RefundAmount;
                        $scope.TotalUPIRefunds += PatientRefund.RefundAmount;
                        $scope.TotalRefunds += PatientRefund.RefundAmount;
                    } else if (PatientRefund.PaymentTypeId == 12) {
                        Afford = PatientRefund.RefundAmount;
                        $scope.TotalAffordRefunds += PatientRefund.RefundAmount;
                        $scope.TotalRefunds += PatientRefund.RefundAmount;
                    }

                    if (PatientRefund.RefundStatus && PatientRefund.RefundStatus.Description) {
                        Status = PatientRefund.RefundStatus.Description;
                    }

                    if (PatientRefund.PaymentTypeId == 1) { // CASH
                        Card = 0;
                        ChequeOthers = 0;
                        NetBanking = 0;
                        UPI = 0;
                        Afford = 0;
                    } else if (PatientRefund.PaymentTypeId == 5 || PatientRefund.PaymentTypeId == 6) { //CARD
                        Cash = 0;
                        ChequeOthers = 0;
                        NetBanking = 0;
                        UPI = 0;
                        Afford = 0;
                    } else if (PatientRefund.PaymentTypeId != 1 && PatientRefund.PaymentTypeId != 5 &&
                        PatientRefund.PaymentTypeId != 6 && PatientRefund.PaymentTypeId != 10
                        && PatientRefund.PaymentTypeId != 11 && PatientRefund.PaymentTypeId != 12) { // CHEQUE
                        Cash = 0;
                        Card = 0;
                        NetBanking = 0;
                        UPI = 0;
                        Afford = 0;
                    } else if (PatientRefund.PaymentTypeId == 10) { // NetBanking
                        Cash = 0;
                        Card = 0;
                        ChequeOthers = 0;
                        UPI = 0;
                        Afford = 0;
                    } else if (PatientRefund.PaymentTypeId == 11) { // UPI
                        Cash = 0;
                        Card = 0;
                        ChequeOthers = 0;
                        NetBanking = 0;
                        Afford = 0;
                    } else if (PatientRefund.PaymentTypeId == 12) { // UPI
                        Cash = 0;
                        Card = 0;
                        ChequeOthers = 0;
                        NetBanking = 0;
                        UPI = 0;
                    }

                    if (Cash > 0 || Card > 0 || ChequeOthers > 0 || NetBanking > 0 || UPI > 0 || Afford > 0) {
                        let PatientRefundModel = {
                            SNo: SNo,
                            BillDt: billDt,
                            Billnumber: billnumber,
                            RECDt: RecDt,
                            RECnumber: Recnumber,
                            RefundDt: refundDt,
                            Refundnumber: refundnumber,
                            Drname: drname,
                            ReferralName: referralName,
                            PatientName: PatientName,
                            Mrn: Mrn,
                            Cash: Cash,
                            Card: Card,
                            ChequeOthers: ChequeOthers,
                            NetBanking: NetBanking,
                            UPI: UPI,
                            Afford: Afford,
                            Status: Status
                        };
                        SNo++;
                        $scope.PaymentOPDGRefunds.push(PatientRefundModel);
                    }
                    if ($scope.PaymentOPDGRefunds.length > 0) {
                        $scope.PatientRefunds = true;
                    }
                    // }
                    // }
                }
            }

            try {
                $scope.TotalCashRefunds = ($scope.TotalCashRefunds).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotalCardRefunds = ($scope.TotalCardRefunds).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotalChequeOtherRefunds = ($scope.TotalChequeOtherRefunds).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotalNetBankingRefunds = ($scope.TotalNetBankingRefunds).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotalUPIRefunds = ($scope.TotalUPIRefunds).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotalAffordRefunds = ($scope.TotalAffordRefunds).toFixed(2);
            } catch (e) { }
            $scope.CalcNetAmt();
        };

        $scope.getOPDGRefundsList = function () {
            var inputData = {
                Params: [{
                    Key: 5,
                    Value: 1
                },
                // { Key: 11, Value: 1 },
                {
                    Key: 21,
                    Value: $scope.item.UserId
                },
                {
                    Key: 16,
                    Value: $scope.item.FacilityId
                },


                ],
                PageContext: {
                    PageSize: 1000000,
                    PageNumber: 1
                }
            };
            if ($scope.item.OpeningDate || $scope.item.ClosingDate) {
                inputData.Params.push({
                    Key: 12,
                    Value: $scope.item.OpeningDate
                })
                inputData.Params.push({
                    Key: 13,
                    Value: $scope.item.ClosingDate
                });
            }
            var options = {
                action: 'Billing/PatientRefund/GetPatientRefund',
                data: inputData,
                type: 'post',
                onComplete: $scope.getOPDGRefundsListCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getOPDGCancelsListCallback = function (scope, res, options, hasError) {
            $scope.PaymentOPDGCancels = [];
            $scope.TotalCashCancels = 0;
            $scope.TotalCardCancels = 0;
            $scope.TotalChequeOtherCancels = 0;
            $scope.TotalNetBankingCancels = 0;
            $scope.TotalUPICancels = 0;
            $scope.TotalAffordCancels = 0;
            $scope.TotalCancels = 0;

            if (res && res.Data && res.Data.length > 0) {
                $scope.PatientBillCancellations = true;
                var SNo = 1;
                for (var idx in res.Data) {
                    var PatientBill = res.Data[idx];
                    var billDt = PatientBill.BillDateTime;
                    var billnumber = PatientBill.BillNumber;
                    var receiptnumber = '';
                    var drname = PatientBill.DoctorName;
                    if (PatientBill.Referral)
                        var referralName = PatientBill.Referral.ReferralName;
                    var PatientName = '';
                    var Status = '';
                    var Mrn = '';
                    var Cash = 0;
                    var Card = 0;
                    var ChequeOthers = 0;
                    var NetBanking = 0;
                    var UPI = 0;
                    var Afford = 0;
                    if (PatientBill.Patient && PatientBill.Patient.Title && PatientBill.Patient.Title.Description) {
                        PatientName += PatientBill.Patient.Title.Description;
                    }
                    if (PatientBill.Patient && PatientBill.Patient.FirstName) {
                        PatientName += ' ' + PatientBill.Patient.FirstName;
                    }
                    if (PatientBill.Patient && PatientBill.Patient.LastName) {
                        PatientName += ' ' + PatientBill.Patient.LastName;
                    }
                    if (!PatientName) {
                        PatientName = PatientBill.PatientName;
                    }
                    if (PatientBill.Patient.MRN) {
                        Mrn = PatientBill.Patient.MRN;
                    }
                    for (var payidx in PatientBill.PatientPaymentDetails) {
                        var PatientPaymentDetail = PatientBill.PatientPaymentDetails[payidx];
                        receiptnumber = PatientPaymentDetail.ReceiptNumber;
                        // if ($scope.item.UserId == -1) {
                        if (PatientPaymentDetail.PaymentTypeId == 1 && PatientPaymentDetail.ReceiptStatusId == 3) {
                            Cash = PatientPaymentDetail.AmountPaid;
                            $scope.TotalCashCancels += PatientPaymentDetail.AmountPaid;
                            $scope.TotalCancels += PatientPaymentDetail.AmountPaid;
                        } else if (PatientPaymentDetail.PaymentTypeId == 5 || PatientPaymentDetail.PaymentTypeId == 6 && PatientPaymentDetail.ReceiptStatusId == 3) {
                            Card = PatientPaymentDetail.AmountPaid;
                            $scope.TotalCardCancels += PatientPaymentDetail.AmountPaid;
                            $scope.TotalCancels += PatientPaymentDetail.AmountPaid;
                        } else if (PatientPaymentDetail.PaymentTypeId != 1 && PatientPaymentDetail.PaymentTypeId != 5 &&
                            PatientPaymentDetail.PaymentTypeId != 6 && PatientPaymentDetail.PaymentTypeId != 10 &&
                            PatientPaymentDetail.PaymentTypeId != 11 &&
                            PatientPaymentDetail.PaymentTypeId != 12 && PatientPaymentDetail.ReceiptStatusId == 3) {
                            ChequeOthers = PatientPaymentDetail.AmountPaid;
                            $scope.TotalChequeOtherCancels += PatientPaymentDetail.AmountPaid;
                            $scope.TotalCancels += PatientPaymentDetail.AmountPaid;
                        } else if (PatientPaymentDetail.PaymentTypeId == 10 && PatientPaymentDetail.ReceiptStatusId == 3) {
                            NetBanking = PatientPaymentDetail.AmountPaid;
                            $scope.TotalNetBankingCancels += PatientPaymentDetail.AmountPaid;
                            $scope.TotalCancels += PatientPaymentDetail.AmountPaid;
                        } else if (PatientPaymentDetail.PaymentTypeId == 11 && PatientPaymentDetail.ReceiptStatusId == 3) {
                            UPI = PatientPaymentDetail.AmountPaid;
                            $scope.TotalUPICancels += PatientPaymentDetail.AmountPaid;
                            $scope.TotalCancels += PatientPaymentDetail.AmountPaid;
                        } else if (PatientPaymentDetail.PaymentTypeId == 12 && PatientPaymentDetail.ReceiptStatusId == 3) {
                            Afford = PatientPaymentDetail.AmountPaid;
                            $scope.TotalAffordCancels += PatientPaymentDetail.AmountPaid;
                            $scope.TotalCancels += PatientPaymentDetail.AmountPaid;
                        }

                        if (PatientPaymentDetail.ReceiptStatus && PatientPaymentDetail.ReceiptStatus.Description) {
                            Status = PatientPaymentDetail.ReceiptStatus.Description;
                        }

                        if (PatientPaymentDetail.PaymentTypeId == 1) { // CASH
                            Card = 0;
                            ChequeOthers = 0;
                            NetBanking = 0;
                            UPI = 0;
                            Afford = 0;
                        } else if (PatientPaymentDetail.PaymentTypeId == 5 || PatientPaymentDetail.PaymentTypeId == 6) { //CARD
                            Cash = 0;
                            ChequeOthers = 0;
                            NetBanking = 0;
                            UPI = 0;
                            Afford = 0;
                        } else if (PatientPaymentDetail.PaymentTypeId != 1 && PatientPaymentDetail.PaymentTypeId != 5 &&
                            PatientPaymentDetail.PaymentTypeId != 6 && PatientPaymentDetail.PaymentTypeId != 10 && PatientPaymentDetail.PaymentTypeId != 11) { // CHEQUE
                            Cash = 0;
                            Card = 0;
                            NetBanking = 0;
                            UPI = 0;
                            Afford = 0;
                        } else if (PatientPaymentDetail.PaymentTypeId == 10) { // NetBanking
                            Cash = 0;
                            Card = 0;
                            ChequeOthers = 0;
                            UPI = 0;
                            Afford = 0;
                        } else if (PatientPaymentDetail.PaymentTypeId == 11) { // UPI
                            Cash = 0;
                            Card = 0;
                            ChequeOthers = 0;
                            NetBanking = 0;
                            Afford = 0;
                        } else if (PatientPaymentDetail.PaymentTypeId == 12) { // Afford
                            Cash = 0;
                            Card = 0;
                            ChequeOthers = 0;
                            NetBanking = 0;
                            UPI = 0;
                        }

                        if (Cash > 0 || Card > 0 || ChequeOthers > 0 || NetBanking > 0 || UPI > 0 || Afford > 0) {
                            //$scope.TotalCancels += (Cash + Card + ChequeOthers + NetBanking);
                            let PaymentCollectionModel = {
                                SNo: SNo,
                                BillDt: billDt,
                                Billnumber: billnumber,
                                Receiptnumber: receiptnumber,
                                Drname: drname,
                                ReferralName: referralName,
                                PatientName: PatientName,
                                Mrn: Mrn,
                                Cash: Cash,
                                Card: Card,
                                ChequeOthers: ChequeOthers,
                                NetBanking: NetBanking,
                                UPI: UPI,
                                Afford: Afford,
                                Status: Status
                            };
                            SNo++;
                            $scope.PaymentOPDGCancels.push(PaymentCollectionModel);
                        }
                        if ($scope.PaymentOPDGCancels.length > 0) {
                            $scope.PatientBillCancellations = true;
                        }
                        // }

                    }
                }
            }

            try {
                $scope.TotalCashCancels = ($scope.TotalCashCancels).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotalCardCancels = ($scope.TotalCardCancels).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotalChequeOtherCancels = ($scope.TotalChequeOtherCancels).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotalNetBankingCancels = ($scope.TotalNetBankingCancels).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotalUPICancels = ($scope.TotalUPICancels).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotalAffordCancels = ($scope.TotalAffordCancels).toFixed(2);
            } catch (e) { }
            $scope.CalcNetAmt();
        };

        $scope.getOPDGCancelsList = function () {
            var inputData = {
                Params: [{
                    Key: 4,
                    Value: 2
                },
                // {
                //     Key: 33,
                //     Value: [1, 5]
                // },
                {
                    Key: 60,
                    Value: $scope.item.UserId
                },
                {
                    Key: 8,
                    Value: $scope.item.FacilityId
                },

                ],
                PageContext: {
                    PageSize: 1000000,
                    PageNumber: 1
                }
            };

            if ($scope.item.OpeningDate || $scope.item.ClosingDate) {
                inputData.Params.push({
                    Key: 17,
                    Value: $scope.item.OpeningDate
                })
                inputData.Params.push({
                    Key: 18,
                    Value: $scope.item.ClosingDate
                });
            }
            var options = {
                action: 'billing/patientbills/GetPatientBills',
                data: inputData,
                type: 'post',
                onComplete: $scope.getOPDGCancelsListCallback
            };
            utl.Http.doAction(options);
        };
        $scope.CalcNetAmt = function () {
            $scope.NetCash = 0;
            $scope.NetCard = 0;
            $scope.NetChequeOther = 0;
            $scope.NetNetBanking = 0;
            $scope.NetUPI = 0;
            $scope.NetAfford = 0;
            $scope.NetSubmission = 0;
            $scope.NetCash = (parseFloat($scope.TotalCashSales || 0) + parseFloat($scope.TotalCashAdvanceAdj || 0)) - (parseFloat($scope.TotalExpCashSales || 0) +
                parseFloat($scope.TotalCashRefunds || 0));
            $scope.NetCard = (parseFloat($scope.TotalCardSales || 0) + parseFloat($scope.TotalCardAdvanceAdj || 0)) - (parseFloat($scope.TotalExpCardSales || 0) +
                parseFloat($scope.TotalCardRefunds || 0));
            $scope.NetChequeOther = (parseFloat($scope.TotalChequeOtherSales || 0) + parseFloat($scope.TotalChequeOtherAdvanceAdj || 0)) - (parseFloat($scope.TotalExpChequeOtherSales || 0) +
                parseFloat($scope.TotalChequeOtherRefunds || 0));
            $scope.NetNetBanking = (parseFloat($scope.TotalNetBankingSales || 0) + parseFloat($scope.TotalNetBankingAdvanceAdj || 0)) - (parseFloat($scope.TotalExpNetBankingSales || 0) +
                parseFloat($scope.TotalNetBankingRefunds || 0));
            $scope.NetUPI = (parseFloat($scope.TotalUPISales || 0) + parseFloat($scope.TotalUPIAdvanceAdj || 0)) - (parseFloat($scope.TotalExpUPISales || 0) +
                parseFloat($scope.TotalUPIRefunds || 0));
            $scope.NetAfford = (parseFloat($scope.TotalAffordSales || 0) + parseFloat($scope.TotalAffordAdvanceAdj || 0)) - (parseFloat($scope.TotalExpAffordSales || 0) +
                parseFloat($scope.TotalAffordRefunds || 0));
            $scope.NetSubmission = (parseFloat($scope.TotalSales || 0) + parseFloat($scope.TotalAdvanceAdj || 0)) - (parseFloat($scope.TotalExpense || 0) +
                parseFloat($scope.TotalRefunds || 0));


        }
        $scope.getOPDGSalesListCallback = function (scope, res, options, hasError) {
            $scope.PaymentOPDGSales = [];
            $scope.TotalCashSales = 0;
            $scope.TotalCardSales = 0;
            $scope.TotalChequeOtherSales = 0;
            $scope.TotalNetBankingSales = 0;
            $scope.TotalUPISales = 0;
            $scope.TotalAffordSales = 0;
            $scope.TotalSales = 0;
            if (res && res.Data && res.Data.length > 0) {
                $scope.PatientBills = true;
                var SNo = 1;
                for (var idx in res.Data) {
                    var PatientPaymentDetail = res.Data[idx];
                    if ($scope.item.UserId > 0) {
                        if (PatientPaymentDetail.CreatedUser.Title)
                            $scope.UserName = PatientPaymentDetail.CreatedUser.Title.Description;
                        if (PatientPaymentDetail.CreatedUser.FirstName)
                            $scope.UserName += ' ' + PatientPaymentDetail.CreatedUser.FirstName;
                        if (PatientPaymentDetail.CreatedUser.LastName)
                            $scope.UserName += ' ' + PatientPaymentDetail.CreatedUser.LastName;
                    } else {
                        $scope.UserName = '';
                    }
                    var receiptDt = PatientPaymentDetail.ReceiptDateTime;
                    var receiptnumber = PatientPaymentDetail.ReceiptNumber;
                    var billnumber = '';
                    var drname = '';
                    var PatientName = '';
                    var Status = '';
                    var Mrn = '';
                    var Cash = 0;
                    var Card = 0;
                    var ChequeOthers = 0;
                    var NetBanking = 0;
                    var UPI = 0;
                    var Afford = 0;
                    var billDt = '';
                    if (PatientPaymentDetail.PatientBill && PatientPaymentDetail.PatientBill.BillNumber) {
                        billnumber = PatientPaymentDetail.PatientBill.BillNumber;
                    }
                    if (PatientPaymentDetail.PatientBill && PatientPaymentDetail.PatientBill.BillDateTime) {
                        billDt = PatientPaymentDetail.PatientBill.BillDateTime;
                    }
                    if (PatientPaymentDetail.Patient && PatientPaymentDetail.Patient.Title && PatientPaymentDetail.Patient.Title.Description) {
                        PatientName += PatientPaymentDetail.Patient.Title.Description;
                    }
                    if (PatientPaymentDetail.Patient && PatientPaymentDetail.Patient.FirstName) {
                        PatientName += ' ' + PatientPaymentDetail.Patient.FirstName;
                    }
                    if (PatientPaymentDetail.Patient && PatientPaymentDetail.Patient.LastName) {
                        PatientName += ' ' + PatientPaymentDetail.Patient.LastName;
                    }
                    if (PatientPaymentDetail) {
                        if (PatientPaymentDetail.Patient) {
                            Mrn = PatientPaymentDetail.Patient.MRN;
                        }
                    }
                    // if (!Mrn) {
                    //     Mrn = PatientPaymentDetail.Patient.MRN;
                    // }
                    if (!PatientName) {
                        PatientName = PatientPaymentDetail.PatientName;
                    }


                    if (PatientPaymentDetail.User && PatientPaymentDetail.User.Title && PatientPaymentDetail.User.Title.Description) {
                        drname += PatientPaymentDetail.User.Title.Description;
                    }
                    if (PatientPaymentDetail.User && PatientPaymentDetail.User.FirstName) {
                        drname += ' ' + PatientPaymentDetail.User.FirstName;
                    }
                    if (PatientPaymentDetail.User && PatientPaymentDetail.User.LastName) {
                        drname += ' ' + PatientPaymentDetail.User.LastName;
                    }
                    if (!drname) {
                        drname = PatientPaymentDetail.drname;
                    }

                    if ($scope.item.UserId == -1 || $scope.item.UserId == PatientPaymentDetail.CreatedBy) {
                        if (PatientPaymentDetail.PaymentTypeId == 1 && PatientPaymentDetail.ReceiptStatusId == 1) {
                            Cash = PatientPaymentDetail.AmountPaid;
                            $scope.TotalCashSales += parseFloat(PatientPaymentDetail.AmountPaid);
                            $scope.TotalSales += PatientPaymentDetail.AmountPaid;
                        } else if (PatientPaymentDetail.PaymentTypeId == 5 || PatientPaymentDetail.PaymentTypeId == 6 && PatientPaymentDetail.ReceiptStatusId == 1) {
                            Card = PatientPaymentDetail.AmountPaid;
                            $scope.TotalCardSales += PatientPaymentDetail.AmountPaid;
                            $scope.TotalSales += PatientPaymentDetail.AmountPaid;
                        } else if (PatientPaymentDetail.PaymentTypeId != 1 && PatientPaymentDetail.PaymentTypeId != 5 &&
                            PatientPaymentDetail.PaymentTypeId != 6 && PatientPaymentDetail.PaymentTypeId != 10
                            && PatientPaymentDetail.PaymentTypeId != 11
                            && PatientPaymentDetail.PaymentTypeId != 12 && PatientPaymentDetail.ReceiptStatusId == 1) {
                            ChequeOthers = PatientPaymentDetail.AmountPaid;
                            $scope.TotalChequeOtherSales += PatientPaymentDetail.AmountPaid;
                            $scope.TotalSales += PatientPaymentDetail.AmountPaid;
                        } else if (PatientPaymentDetail.PaymentTypeId == 10 && PatientPaymentDetail.ReceiptStatusId == 1) {
                            NetBanking = PatientPaymentDetail.AmountPaid;
                            $scope.TotalNetBankingSales += PatientPaymentDetail.AmountPaid;
                            $scope.TotalSales += PatientPaymentDetail.AmountPaid;
                        } else if (PatientPaymentDetail.PaymentTypeId == 11 && PatientPaymentDetail.ReceiptStatusId == 1) {
                            UPI = PatientPaymentDetail.AmountPaid;
                            $scope.TotalUPISales += PatientPaymentDetail.AmountPaid;
                            $scope.TotalSales += PatientPaymentDetail.AmountPaid;
                        } else if (PatientPaymentDetail.PaymentTypeId == 12 && PatientPaymentDetail.ReceiptStatusId == 1) {
                            Afford = PatientPaymentDetail.AmountPaid;
                            $scope.TotalAffordSales += PatientPaymentDetail.AmountPaid;
                            $scope.TotalSales += PatientPaymentDetail.AmountPaid;
                        }

                        if (PatientPaymentDetail.PaymentTypeId == 1) { // CASH
                            Card = 0;
                            ChequeOthers = 0;
                            NetBanking = 0;
                            UPI = 0;
                            Afford = 0;
                        } else if (PatientPaymentDetail.PaymentTypeId == 5 || PatientPaymentDetail.PaymentTypeId == 6) { // CARD
                            Cash = 0;
                            ChequeOthers = 0;
                            NetBanking = 0;
                            UPI = 0;
                            Afford = 0;
                        } else if (PatientPaymentDetail.PaymentTypeId != 1 && PatientPaymentDetail.PaymentTypeId != 5 &&
                            PatientPaymentDetail.PaymentTypeId != 6 && PatientPaymentDetail.PaymentTypeId != 10 &&
                            PatientPaymentDetail.PaymentTypeId != 11 && PatientPaymentDetail.PaymentTypeId != 12) { // CHEQUE & OTHERS
                            Cash = 0;
                            Card = 0;
                            NetBanking = 0;
                            UPI = 0;
                            Afford = 0;
                        } else if (PatientPaymentDetail.PaymentTypeId == 10) { // NetBanking
                            Cash = 0;
                            Card = 0;
                            ChequeOthers = 0;
                            UPI = 0;
                            Afford = 0;
                        } else if (PatientPaymentDetail.PaymentTypeId == 11) { // UPI
                            Cash = 0;
                            Card = 0;
                            ChequeOthers = 0;
                            NetBanking = 0;
                            Afford = 0;
                        } else if (PatientPaymentDetail.PaymentTypeId == 12) { // Afford
                            Cash = 0;
                            Card = 0;
                            ChequeOthers = 0;
                            NetBanking = 0;
                            UPI = 0;
                        }

                        if (Cash > 0 || Card > 0 || ChequeOthers > 0 || NetBanking > 0 || UPI > 0 || Afford > 0) {
                            let PaymentCollectionModel = {
                                SNo: SNo,
                                BillDt: billDt,
                                Billnumber: billnumber,
                                Receiptnumber: receiptnumber,
                                Drname: drname,
                                // ReferralName: referralName,
                                PatientName: PatientName,
                                Mrn: Mrn,
                                Cash: Cash,
                                Card: Card,
                                ChequeOthers: ChequeOthers,
                                NetBanking: NetBanking,
                                UPI: UPI,
                                Afford: Afford,
                                Status: Status
                            };
                            SNo++;
                            $scope.PaymentOPDGSales.push(PaymentCollectionModel);
                        }
                    }

                }
            }


            try {
                $scope.TotalCashSales = ($scope.TotalCashSales).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotalCardSales = ($scope.TotalCardSales).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotalChequeOtherSales = ($scope.TotalChequeOtherSales).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotalNetBankingSales = ($scope.TotalNetBankingSales).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotalUPISales = ($scope.TotalUPISales).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotalAffordSales = ($scope.TotalAffordSales).toFixed(2);
            } catch (e) { }
            $scope.CalcNetAmt();
        };

        $scope.getOPDGSalesList = function () {
            var inputData = {
                Params: [
                    // { Key: 4, Value: [1,2] },
                    {
                        Key: 5,
                        Value: 1
                    },
                    {
                        Key: 19,
                        Value: $scope.item.UserId
                    },
                    {
                        Key: 26,
                        Value: $scope.item.FacilityId
                    },
                    // {
                    //     Key: 13,
                    //     Value: false
                    // },
                    {
                        Key: 34,
                        Value: 7
                    },
                    {
                        Key: 4,
                        Value: [1, 2, 3, 7]
                    },
                ],
                PageContext: {
                    PageSize: 1000000,
                    PageNumber: 1
                }
            };
            // var FrmDate = $filter('date')($scope.item.OpeningDate, 'yyyy-MM-dd HH:MM:ss') || null;
            // var ToDate = $filter('date')($scope.item.ClosingDate, 'yyyy-MM-dd HH:MM:ss') || null;

            if ($scope.item.OpeningDate || $scope.item.ClosingDate) {
                inputData.Params.push({
                    Key: 27,
                    Value: $scope.item.OpeningDate
                })
                inputData.Params.push({
                    Key: 28,
                    Value: $scope.item.ClosingDate
                });
            }
            var options = {
                action: 'Billing/PatientPaymentDetails/GetPatientPaymentDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getOPDGSalesListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getOPDGAdvanceAdjustmentListCallback = function (scope, res, options, hasError) {
            $scope.PaymentOPDGAdvance = [];
            $scope.TotalCashAdvanceAdj = 0;
            $scope.TotalCardAdvanceAdj = 0;
            $scope.TotalChequeOtherAdvanceAdj = 0;
            $scope.TotalNetBankingAdvanceAdj = 0;
            $scope.TotalUPIAdvanceAdj = 0;
            $scope.TotalAffordAdvanceAdj = 0;
            $scope.TotalAdvanceAdj = 0;
            if (res && res.Data && res.Data.length > 0) {
                $scope.PatientPaymentDetail = true;
                var SNo = 1;
                for (var idx in res.Data) {
                    var PatientPaymentDetail = res.Data[idx];
                    if ($scope.item.UserId > 0) {
                        if (PatientPaymentDetail.CreatedUser.Title)
                            $scope.UserName = PatientPaymentDetail.CreatedUser.Title.Description;
                        if (PatientPaymentDetail.CreatedUser.FirstName)
                            $scope.UserName += ' ' + PatientPaymentDetail.CreatedUser.FirstName;
                        if (PatientPaymentDetail.CreatedUser.LastName)
                            $scope.UserName += ' ' + PatientPaymentDetail.CreatedUser.LastName;
                    } else {
                        $scope.UserName = '';
                    }
                    var receiptDt = PatientPaymentDetail.ReceiptDateTime;
                    var receiptnumber = PatientPaymentDetail.ReceiptNumber;
                    // var billnumber = '';
                    var drname = '';
                    var PatientName = '';
                    var Mrn = '';
                    var Status = '';
                    var AmountAdjusted = PatientPaymentDetail.AmountAdjusted;
                    var Cash = 0;
                    var Card = 0;
                    var ChequeOthers = 0;
                    var NetBanking = 0;
                    var UPI = 0;
                    var Afford = 0;
                    var billDt = '';
                    var RefundedAmt = PatientPaymentDetail.RefundAmount;
                    // if (PatientPaymentDetail.PatientBill && PatientPaymentDetail.PatientBill.BillNumber) {
                    //     billnumber = PatientPaymentDetail.PatientBill.BillNumber;
                    // }
                    // if (PatientPaymentDetail.PatientBill && PatientPaymentDetail.PatientBill.BillDateTime) {
                    //     billDt = PatientPaymentDetail.PatientBill.BillDateTime;
                    // }
                    if (PatientPaymentDetail.Patient && PatientPaymentDetail.Patient.Title && PatientPaymentDetail.Patient.Title.Description) {
                        PatientName += PatientPaymentDetail.Patient.Title.Description;
                    }
                    if (PatientPaymentDetail.Patient && PatientPaymentDetail.Patient.FirstName) {
                        PatientName += ' ' + PatientPaymentDetail.Patient.FirstName;
                    }
                    if (PatientPaymentDetail.Patient && PatientPaymentDetail.Patient.LastName) {
                        PatientName += ' ' + PatientPaymentDetail.Patient.LastName;
                    }
                    if (!PatientName) {
                        PatientName = PatientPaymentDetail.PatientName;
                    }

                    if (PatientPaymentDetail.Patient.MRN) {
                        Mrn = PatientPaymentDetail.Patient.MRN;
                    }
                    if (PatientPaymentDetail.User && PatientPaymentDetail.User.Title && PatientPaymentDetail.User.Title.Description) {
                        drname += PatientPaymentDetail.User.Title.Description;
                    }
                    if (PatientPaymentDetail.User && PatientPaymentDetail.User.FirstName) {
                        drname += ' ' + PatientPaymentDetail.User.FirstName;
                    }
                    if (PatientPaymentDetail.User && PatientPaymentDetail.User.LastName) {
                        drname += ' ' + PatientPaymentDetail.User.LastName;
                    }
                    if (!drname) {
                        drname = PatientPaymentDetail.drname;
                    }

                    if ($scope.item.UserId == -1 || $scope.item.UserId == PatientPaymentDetail.CreatedBy) {
                        if (PatientPaymentDetail.PaymentTypeId == 1) {
                            Cash = PatientPaymentDetail.AmountPaid;
                            $scope.TotalCashAdvanceAdj += parseFloat(PatientPaymentDetail.AmountPaid);
                            $scope.TotalAdvanceAdj += PatientPaymentDetail.AmountPaid;
                        } else if (PatientPaymentDetail.PaymentTypeId == 5 || PatientPaymentDetail.PaymentTypeId == 6) {
                            Card = PatientPaymentDetail.AmountPaid;
                            $scope.TotalCardAdvanceAdj += PatientPaymentDetail.AmountPaid;
                            $scope.TotalAdvanceAdj += PatientPaymentDetail.AmountPaid;
                        } else if (PatientPaymentDetail.PaymentTypeId != 1 && PatientPaymentDetail.PaymentTypeId != 5 &&
                            PatientPaymentDetail.PaymentTypeId != 6 && PatientPaymentDetail.PaymentTypeId != 7
                            && PatientPaymentDetail.PaymentTypeId != 10 && PatientPaymentDetail.PaymentTypeId != 11
                            && PatientPaymentDetail.PaymentTypeId != 12) {
                            ChequeOthers = PatientPaymentDetail.AmountPaid;
                            $scope.TotalChequeOtherAdvanceAdj += PatientPaymentDetail.AmountPaid;
                            $scope.TotalAdvanceAdj += PatientPaymentDetail.AmountPaid;
                        } else if (PatientPaymentDetail.PaymentTypeId == 10) {
                            NetBanking = PatientPaymentDetail.AmountPaid;
                            $scope.TotalNetBankingAdvanceAdj += PatientPaymentDetail.AmountPaid;
                            $scope.TotalAdvanceAdj += PatientPaymentDetail.AmountPaid;
                        } else if (PatientPaymentDetail.PaymentTypeId == 11) {
                            UPI = PatientPaymentDetail.AmountPaid;
                            $scope.TotalUPIAdvanceAdj += PatientPaymentDetail.AmountPaid;
                            $scope.TotalAdvanceAdj += PatientPaymentDetail.AmountPaid;
                        } else if (PatientPaymentDetail.PaymentTypeId == 12) {
                            Afford = PatientPaymentDetail.AmountPaid;
                            $scope.TotalAffordAdvanceAdj += PatientPaymentDetail.AmountPaid;
                            $scope.TotalAdvanceAdj += PatientPaymentDetail.AmountPaid;
                        }

                        if (PatientPaymentDetail.PaymentTypeId == 1) { // CASH
                            Card = 0;
                            ChequeOthers = 0;
                            NetBanking = 0;
                            UPI = 0;
                            Afford = 0;
                        } else if (PatientPaymentDetail.PaymentTypeId == 5 || PatientPaymentDetail.PaymentTypeId == 6) { // CARD
                            Cash = 0;
                            ChequeOthers = 0;
                            NetBanking = 0;
                            UPI = 0;
                            Afford = 0;
                        } else if (PatientPaymentDetail.PaymentTypeId != 1 && PatientPaymentDetail.PaymentTypeId != 5 &&
                            PatientPaymentDetail.PaymentTypeId != 6 && PatientPaymentDetail.PaymentTypeId != 10 &&
                            PatientPaymentDetail.PaymentTypeId != 11 &&
                            PatientPaymentDetail.PaymentTypeId != 12) { // CHEQUE & OTHERS
                            Cash = 0;
                            Card = 0;
                            NetBanking = 0;
                            UPI = 0;
                            Afford = 0;
                        } else if (PatientPaymentDetail.PaymentTypeId == 10) { // NetBanking
                            Cash = 0;
                            Card = 0;
                            ChequeOthers = 0;
                            UPI = 0;
                            Afford = 0;
                        } else if (PatientPaymentDetail.PaymentTypeId == 11) { // UPI
                            Cash = 0;
                            Card = 0;
                            ChequeOthers = 0;
                            NetBanking = 0;
                            Afford = 0;
                        } else if (PatientPaymentDetail.PaymentTypeId == 12) { // Afford
                            Cash = 0;
                            Card = 0;
                            ChequeOthers = 0;
                            NetBanking = 0;
                            UPI = 0;
                        }

                        if (Cash > 0 || Card > 0 || ChequeOthers > 0 || NetBanking > 0 || UPI > 0 || Afford > 0) {
                            let PaymentCollectionModel = {
                                SNo: SNo,
                                // BillDt: billDt,
                                // Billnumber: billnumber,
                                Receiptnumber: receiptnumber,
                                Drname: drname,
                                // ReferralName: referralName,
                                PatientName: PatientName,
                                Mrn: Mrn,
                                Cash: Cash,
                                Card: Card,
                                ChequeOthers: ChequeOthers,
                                NetBanking: NetBanking,
                                UPI: UPI,
                                Afford: Afford,
                                AmountAdjusted: AmountAdjusted,
                                Status: Status,
                                RefundedAmt: RefundedAmt
                            };
                            SNo++;
                            $scope.PaymentOPDGAdvance.push(PaymentCollectionModel);
                        }
                    }

                }
            }


            try {
                $scope.TotalCashAdvanceAdj = ($scope.TotalCashAdvanceAdj).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotalCardAdvanceAdj = ($scope.TotalCardAdvanceAdj).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotalChequeOtherAdvanceAdj = ($scope.TotalChequeOtherAdvanceAdj).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotalNetBankingAdvanceAdj = ($scope.TotalNetBankingAdvanceAdj).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotalUPIAdvanceAdj = ($scope.TotalUPIAdvanceAdj).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotalAffordAdvanceAdj = ($scope.TotalAffordAdvanceAdj).toFixed(2);
            } catch (e) { }
            $scope.CalcNetAmt();
        };

        $scope.getOPDGAdvanceAdjustmentList = function () {
            var inputData = {
                Params: [{
                    Key: 4,
                    Value: 5
                },
                {
                    Key: 15,
                    Value: [1, 4]
                },
                {
                    Key: 19,
                    Value: $scope.item.UserId
                },
                {
                    Key: 26,
                    Value: $scope.item.FacilityId
                },
                    // {
                    //     Key: 13,
                    //     Value: false
                    // },
                    // { Key: 23, Value: 7 },
                ],
                PageContext: {
                    PageSize: 1000000,
                    PageNumber: 1
                }
            };
            // var FrmDate = $filter('date')($scope.item.OpeningDate, 'yyyy-MM-dd HH:MM:ss') || null;
            // var ToDate = $filter('date')($scope.item.ClosingDate, 'yyyy-MM-dd HH:MM:ss') || null;

            if ($scope.item.OpeningDate || $scope.item.ClosingDate) {
                inputData.Params.push({
                    Key: 27,
                    Value: $scope.item.OpeningDate
                })
                inputData.Params.push({
                    Key: 28,
                    Value: $scope.item.ClosingDate
                });
            }
            var options = {
                action: 'Billing/PatientPaymentDetails/GetPatientPaymentDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getOPDGAdvanceAdjustmentListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getOPDGOutstandingListCallback = function (scope, res, options, hasError) {
            $scope.PaymentOPDGOutstanding = [];
            $scope.TotalOutstanding = 0;
            $scope.PatientBillOutstanding = false;
            if (res && res.Data && res.Data.length > 0) {
                $scope.PatientBillOutstanding = true;

                var SNo = 1;
                for (var idx in res.Data) {
                    var OutstandingInfo = res.Data[idx];

                    var billNumber = OutstandingInfo.BillNumber;
                    var billDate = OutstandingInfo.BillDateTime;
                    var drname = '';
                    var PatientName = '';
                    var Mrn = '';

                    if (OutstandingInfo.Patient && OutstandingInfo.Patient.Title && OutstandingInfo.Patient.Title.Description) {
                        PatientName += OutstandingInfo.Patient.Title.Description;
                    }
                    if (OutstandingInfo.Patient && OutstandingInfo.Patient.FirstName) {
                        PatientName += ' ' + OutstandingInfo.Patient.FirstName;
                    }
                    if (OutstandingInfo.Patient && OutstandingInfo.Patient.LastName) {
                        PatientName += ' ' + OutstandingInfo.Patient.LastName;
                    }
                    // if (OutstandingInfo.Patient && OutstandingInfo.Patient.MRN) {
                    //     PatientName += ' ' + OutstandingInfo.Patient.MRN;
                    // }

                    if (!PatientName) {
                        PatientName = OutstandingInfo.PatientName;
                    }
                    if (OutstandingInfo.Patient) {
                        if (OutstandingInfo.Patient.MRN) {
                            Mrn = OutstandingInfo.Patient.MRN;
                        }
                    }

                    if (OutstandingInfo.User && OutstandingInfo.User.Title && OutstandingInfo.User.Title.Description) {
                        drname += OutstandingInfo.User.Title.Description;
                    }
                    if (OutstandingInfo.User && OutstandingInfo.User.FirstName) {
                        drname += ' ' + OutstandingInfo.User.FirstName;
                    }
                    if (OutstandingInfo.User && OutstandingInfo.User.LastName) {
                        drname += ' ' + OutstandingInfo.User.LastName;
                    }
                    if (!drname) {
                        drname = OutstandingInfo.drname;
                    }
                    var DueAmt = OutstandingInfo.OutStandingAmount;


                    // if (Cash > 0 || Card > 0 || ChequeOthers > 0 || NetBanking > 0 || UPI > 0) {
                    let PaymentCollectionModel = {
                        SNo: SNo,
                        BillNumber: billNumber,
                        BillDate: billDate,
                        Drname: drname,
                        // ReferralName: referralName,
                        PatientName: PatientName,
                        Mrn: Mrn,
                        DueAmt: DueAmt
                    };
                    SNo++;
                    $scope.PaymentOPDGOutstanding.push(PaymentCollectionModel);
                    // }

                }
            }


            $scope.CalcNetAmt();
        };

        $scope.getOPDGOutstandingList = function () {
            var inputData = {
                Params: [{
                    Key: 4,
                    Value: 3
                },
                // {
                //     Key: 33,
                //     Value: [1, 5]
                // },
                {
                    Key: 39,
                    Value: $scope.item.UserId
                },
                {
                    Key: 45,
                    Value: '0'
                },
                // {
                //     Key: 6,
                //     Value: [1, 5]
                // },
                {
                    Key: 8,
                    Value: $scope.item.FacilityId
                },
                {
                    Key: 50,
                    Value: false
                },
                ],
                PageContext: {
                    PageSize: 1000000,
                    PageNumber: 1
                }
            };

            if ($scope.item.OpeningDate || $scope.item.ClosingDate) {
                inputData.Params.push({
                    Key: 17,
                    Value: $scope.item.OpeningDate
                })
                inputData.Params.push({
                    Key: 18,
                    Value: $scope.item.ClosingDate
                });
            }
            var options = {
                action: 'billing/patientbills/GetPatientBills',
                data: inputData,
                type: 'post',
                onComplete: $scope.getOPDGOutstandingListCallback
            };
            utl.Http.doAction(options);
        };


        $scope.getExpenseListCallback = function (scope, res, options, hasError) {
            $scope.Expenses = [];
            $scope.TotalExpense = 0;
            $scope.TotalExpCashSales = 0;
            $scope.TotalExpCardSales = 0;
            $scope.TotalExpChequeOtherSales = 0;
            $scope.TotalExpNetBankingSales = 0;
            $scope.TotalExpUPISales = 0;
            $scope.TotalExpAffordSales = 0;
            $scope.UserExpense = false;
            if (res && res.Data && res.Data.length > 0) {
                for (var edx in res.Data) {
                    var expInfo = res.Data[edx];
                    $scope.UserExpense = true;
                    if ($scope.item.UserId == -1 || $scope.item.UserId == expInfo.CreatedBy) {
                        if (expInfo.PaymentTypeId == 1) {
                            // Cash = expInfo.ExpenseAmount;
                            $scope.TotalExpCashSales += parseFloat(expInfo.ExpenseAmount);
                            $scope.TotalExpense += expInfo.ExpenseAmount;
                        } else if (expInfo.PaymentTypeId == 5 || expInfo.PaymentTypeId == 6) {
                            // Card = expInfo.ExpenseAmount;
                            $scope.TotalExpCardSales += expInfo.ExpenseAmount;
                            $scope.TotalExpense += expInfo.ExpenseAmount;
                        } else if (expInfo.PaymentTypeId != 1 && expInfo.PaymentTypeId != 5 &&
                            expInfo.PaymentTypeId != 6 && expInfo.PaymentTypeId != 10
                            && expInfo.PaymentTypeId != 11
                            && expInfo.PaymentTypeId != 12) {
                            // ChequeOthers = expInfo.ExpenseAmount;
                            $scope.TotalExpChequeOtherSales += expInfo.ExpenseAmount;
                            $scope.TotalExpense += expInfo.ExpenseAmount;
                        } else if (expInfo.PaymentTypeId == 10) {
                            // NetBanking = expInfo.ExpenseAmount;
                            $scope.TotalExpNetBankingSales += expInfo.ExpenseAmount;
                            $scope.TotalExpense += expInfo.ExpenseAmount;
                        } else if (expInfo.PaymentTypeId == 11) {
                            // UPI = expInfo.ExpenseAmount;
                            $scope.TotalExpUPISales += expInfo.ExpenseAmount;
                            $scope.TotalExpense += expInfo.ExpenseAmount;
                        } else if (expInfo.PaymentTypeId == 12) {
                            // Afford = expInfo.ExpenseAmount;
                            $scope.TotalExpAffordSales += expInfo.ExpenseAmount;
                            $scope.TotalExpense += expInfo.ExpenseAmount;
                        }

                        // if (expInfo.PaymentTypeId == 1) { // CASH
                        //     Card = 0;
                        //     ChequeOthers = 0;
                        //     NetBanking = 0;
                        //     UPI = 0;
                        //     Afford = 0;
                        // } else if (expInfo.PaymentTypeId == 5 || expInfo.PaymentTypeId == 6) { // CARD
                        //     Cash = 0;
                        //     ChequeOthers = 0;
                        //     NetBanking = 0;
                        //     UPI = 0;
                        //     Afford = 0;
                        // } else if (expInfo.PaymentTypeId != 1 && expInfo.PaymentTypeId != 5 &&
                        //     expInfo.PaymentTypeId != 6 && expInfo.PaymentTypeId != 10 &&
                        //     expInfo.PaymentTypeId != 11 && expInfo.PaymentTypeId != 12) { // CHEQUE & OTHERS
                        //     Cash = 0;
                        //     Card = 0;
                        //     NetBanking = 0;
                        //     UPI = 0;
                        //     Afford = 0;
                        // } else if (expInfo.PaymentTypeId == 10) { // NetBanking
                        //     Cash = 0;
                        //     Card = 0;
                        //     ChequeOthers = 0;
                        //     UPI = 0;
                        //     Afford = 0;
                        // } else if (expInfo.PaymentTypeId == 11) { // UPI
                        //     Cash = 0;
                        //     Card = 0;
                        //     ChequeOthers = 0;
                        //     NetBanking = 0;
                        //     Afford = 0;
                        // } else if (expInfo.PaymentTypeId == 12) { // Afford
                        //     Cash = 0;
                        //     Card = 0;
                        //     ChequeOthers = 0;
                        //     NetBanking = 0;
                        //     UPI = 0;
                        // }
                    }
                }

                try {
                    $scope.TotalExpCashSales = ($scope.TotalExpCashSales).toFixed(2);
                } catch (e) { }
                try {
                    $scope.TotalExpCardSales = ($scope.TotalExpCardSales).toFixed(2);
                } catch (e) { }
                try {
                    $scope.TotalExpChequeOtherSales = ($scope.TotalExpChequeOtherSales).toFixed(2);
                } catch (e) { }
                try {
                    $scope.TotalExpNetBankingSales = ($scope.TotalExpNetBankingSales).toFixed(2);
                } catch (e) { }
                try {
                    $scope.TotalExpUPISales = ($scope.TotalExpUPISales).toFixed(2);
                } catch (e) { }
                try {
                    $scope.TotalExpAffordSales = ($scope.TotalExpAffordSales).toFixed(2);
                } catch (e) { }
                $scope.CalcNetAmt();
            }
        };

        $scope.getExpenseList = function () {
            var FrmDate = $filter('date')($scope.item.OpeningDate, 'yyyy-MM-dd HH:mm:ss');
            var ToDate = $filter('date')($scope.item.ClosingDate, 'yyyy-MM-dd HH:mm:ss');
            var inputData = {
                Params: [
                    { Key: 3, Value: $scope.item.UserId },
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
                onComplete: $scope.getExpenseListCallback
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
                        $scope.canShowApproveBtn = false;
                        $scope.canShowAuthorizeBtn = false;
                        $scope.item.CounterStatus = 'Running';
                    } else if (usercounter.BillingCounterStatusId == 2) {
                        $scope.item.OpenedStatus = true;
                        $scope.item.ClosedStatus = true;
                        $scope.canShowApproveBtn = false;
                        $scope.canShowAuthorizeBtn = false;
                        $scope.item.CounterStatus = 'Closed';
                    } else if (usercounter.BillingCounterStatusId == 3) {
                        $scope.item.OpenedStatus = true;
                        $scope.item.ClosedStatus = true;
                        $scope.canShowApproveBtn = true;
                        $scope.canShowAuthorizeBtn = false;
                        $scope.item.CounterStatus = 'Submitted';
                    } else if (usercounter.BillingCounterStatusId == 4) {
                        $scope.item.OpenedStatus = true;
                        $scope.item.ClosedStatus = true;
                        $scope.canShowApproveBtn = false;
                        $scope.canShowAuthorizeBtn = true;
                        $scope.item.CounterStatus = 'Approved';
                    } else if (usercounter.BillingCounterStatusId == 5) {
                        $scope.item.OpenedStatus = true;
                        $scope.item.ClosedStatus = true;
                        $scope.canShowApproveBtn = false;
                        $scope.canShowAuthorizeBtn = false;
                        $scope.item.CounterStatus = 'Authorized';
                    }

                    if (usercounter.BillingCounter) {
                        $scope.item.CounterName = usercounter.BillingCounter.Description;
                    }
                    $scope.item.DocumentNumber = usercounter.DocumentNumber;
                    $scope.item.DocumentDate = usercounter.DocumentDate;
                    $scope.item.OpeningDate = usercounter.OpeningDate;
                    $scope.item.UserId = usercounter.UserId;
                    if (usercounter.CreatedUser) {
                        $scope.item.UserName = usercounter.CreatedUser.Title.Description + ' ' + usercounter.CreatedUser.FirstName + ' ' + usercounter.CreatedUser.LastName;
                    }
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
                    }
                    $scope.item.ClosingBalance = usercounter.ClosingBalance;
                    $scope.item.ClosingCash = usercounter.ClosingCash;
                    $scope.item.ClosingCard = usercounter.ClosingCard;
                    $scope.item.ClosingCheque = usercounter.ClosingCheque;
                    $scope.item.ClosingRemarks = usercounter.ClosingRemarks;

                    $scope.DefinedDenominations = [];
                    var GivenDenomination = {};
                    for (var gdidx in usercounter.UserBillingCounterDenominations) {
                        var EachDenomination = usercounter.UserBillingCounterDenominations[gdidx];
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
            $scope.getOPDGSalesList();
            $scope.getOPDGAdvanceAdjustmentList();
            $scope.getOPDGCancelsList();
            $scope.getOPDGRefundsList();
            $scope.getOPDGOutstandingList();
            $scope.getExpenseList();
        };

        $scope.getCounterInfoById = function () {
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
        };


        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (data === true) {
                $scope.currentcontext.id = options.data.Data.Header.Id;
            } else {
                $scope.currentcontext.id = data;
            }

            //$scope.backToList();
            loadData();
        };

        $scope.Approve = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'billing.cashsubmissions.approvemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onApproveConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onApproveConfirmed = function () {
            $scope.item.BillingCounterStatusId = 4;
            $scope.saveItem();
        };

        $scope.Authorize = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'billing.cashsubmissions.authorizemsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onAuthorizeConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onAuthorizeConfirmed = function () {
            $scope.item.BillingCounterStatusId = 5;
            $scope.saveItem();
        };

        $scope.saveItem = function () {
            var lines = getLinesForSave();

            var actionName = 'billing/userbillingcounters/AddUserBillingCounters';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'billing/userbillingcounters/UpdateUserBillingCounters';
            }

            var inputData = { Header: $scope.item, Details: lines };
            var options = {
                action: actionName,
                data: { Data: inputData },
                type: 'post',
                onComplete: $scope.saveItemCallback,
                onError: $scope.errorItemCallback
            };

            utl.Http.doAction(options);
        };

        function getLinesForSave() {
            var result = [];
            for (var idx in $scope.DefinedDenominations) {
                var item = $scope.DefinedDenominations[idx];
                result.push(item);
            }
            return result;
        }

        $scope.backToList = function () {
            $state.go('app.cashsubmission-list', $scope.currentcontext.id);
        };

        function loadData() {
            if ($scope.currentcontext.id > 0) {
                $scope.getCounterInfoById();
            }
            $scope.getOPDGSalesList();
            $scope.getOPDGAdvanceAdjustmentList();
            $scope.getOPDGCancelsList();
            $scope.getOPDGRefundsList();
            $scope.getOPDGOutstandingList();
            $scope.getExpenseList();
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
            });
            loadData();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Department" },
                { "Key": "BillingCounter" },
                { "Key": "BillingCounterStatus" }
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.initLookup();
    }

    CashSubmissionFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();