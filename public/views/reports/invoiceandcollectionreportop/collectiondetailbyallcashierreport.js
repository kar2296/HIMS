(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('collectiondetailbyallcashierreportController', collectiondetailbyallcashierreportController);

    function collectiondetailbyallcashierreportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.lookup = {};
        $scope.lookup.PaymentType = [];

        $scope.currentcontext = {};
        $scope.currentfilter = {};
        $scope.currentfilter.FromBillDate = $filter('date')(new Date(), 'yyyy-MM-dd 00:00:00');
        $scope.currentfilter.ToBillDate = $filter('date')(new Date(), 'yyyy-MM-dd 23:59:59');
        $scope.currentfilter.PaymentTypeId = -1;
        $scope.currentfilter.UserId = -1;
        $scope.currentfilter.FacilityName = utl.Session.getCurrentFacilityName();
        $scope.currentfilter.FacilityId = utl.Session.getCurrentFacilityId();

        $scope.PaymentOPDGSales = [];
        $scope.PaymentOPDGAdvance = [];
        $scope.PaymentOPDGOutstanding = [];
        $scope.PaymentOPDGCancels = [];
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

        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
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
                    if (!PatientRefund.PharmacyReturnId || PatientRefund.PharmacyReturnId == null) {
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

                        // if ($scope.currentfilter.UserId == -1) {
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
                    }
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
                    Value: $scope.currentfilter.UserId
                },
                {
                    Key: 16,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 20,
                    Value: $scope.currentfilter.PaymentTypeId
                },

                ],
                PageContext: {
                    PageSize: 1000000,
                    PageNumber: 1
                }
            };
            if ($scope.currentfilter.FromBillDate || $scope.currentfilter.ToBillDate) {
                inputData.Params.push({
                    Key: 12,
                    Value: $scope.currentfilter.FromBillDate
                })
                inputData.Params.push({
                    Key: 13,
                    Value: $scope.currentfilter.ToBillDate
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
                        // if ($scope.currentfilter.UserId == -1) {
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
                    Value: $scope.currentfilter.UserId
                },
                {
                    Key: 8,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 41,
                    Value: $scope.currentfilter.PaymentTypeId
                }
                ],
                PageContext: {
                    PageSize: 1000000,
                    PageNumber: 1
                }
            };

            if ($scope.currentfilter.FromBillDate || $scope.currentfilter.ToBillDate) {
                inputData.Params.push({
                    Key: 17,
                    Value: $scope.currentfilter.FromBillDate
                })
                inputData.Params.push({
                    Key: 18,
                    Value: $scope.currentfilter.ToBillDate
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
            $scope.NetCash = (parseFloat($scope.TotalCashSales || 0) + parseFloat($scope.TotalCashAdvanceAdj || 0)) -
                parseFloat($scope.TotalCashRefunds || 0);
            $scope.NetCard = (parseFloat($scope.TotalCardSales || 0) + parseFloat($scope.TotalCardAdvanceAdj || 0)) -
                parseFloat($scope.TotalCardRefunds || 0);
            $scope.NetChequeOther = (parseFloat($scope.TotalChequeOtherSales || 0) + parseFloat($scope.TotalChequeOtherAdvanceAdj || 0)) -
                parseFloat($scope.TotalChequeOtherRefunds || 0);
            $scope.NetNetBanking = (parseFloat($scope.TotalNetBankingSales || 0) + parseFloat($scope.TotalNetBankingAdvanceAdj || 0)) -
                parseFloat($scope.TotalNetBankingRefunds || 0);
            $scope.NetUPI = (parseFloat($scope.TotalUPISales || 0) + parseFloat($scope.TotalUPIAdvanceAdj || 0)) -
                parseFloat($scope.TotalUPIRefunds || 0);
            $scope.NetAfford = (parseFloat($scope.TotalAffordSales || 0) + parseFloat($scope.TotalAffordAdvanceAdj || 0)) -
                parseFloat($scope.TotalAffordRefunds || 0);
            $scope.NetSubmission = (parseFloat($scope.TotalSales || 0) + parseFloat($scope.TotalAdvanceAdj || 0)) -
                parseFloat($scope.TotalRefunds || 0);


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
                    if ($scope.currentfilter.UserId > 0) {
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
                    if (PatientPaymentDetail.Patient.MRN) {
                        Mrn = PatientPaymentDetail.Patient.MRN;
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

                    if ($scope.currentfilter.UserId == -1 || $scope.currentfilter.UserId == PatientPaymentDetail.CreatedBy) {
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
                        Key: 39,
                        Value: $scope.currentfilter.UserId
                    },
                    {
                        Key: 26,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 13,
                        Value: false
                    },
                    {
                        Key: 34,
                        Value: 7
                    },
                    {
                        Key: 4,
                        Value: [1, 2, 3, 8]
                    },
                    {
                        Key: 36,
                        Value: false
                    },
                ],
                PageContext: {
                    PageSize: 1000000,
                    PageNumber: 1
                }
            };
            // var FrmDate = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd HH:MM:ss') || null;
            // var ToDate = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd HH:MM:ss') || null;

            if ($scope.currentfilter.FromBillDate || $scope.currentfilter.ToBillDate) {
                inputData.Params.push({
                    Key: 27,
                    Value: $scope.currentfilter.FromBillDate
                })
                inputData.Params.push({
                    Key: 28,
                    Value: $scope.currentfilter.ToBillDate
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
                    if ($scope.currentfilter.UserId > 0) {
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

                    if ($scope.currentfilter.UserId == -1 || $scope.currentfilter.UserId == PatientPaymentDetail.CreatedBy) {
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
                    Value: $scope.currentfilter.UserId
                },
                {
                    Key: 26,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 13,
                    Value: false
                },
                    // { Key: 23, Value: 7 },
                ],
                PageContext: {
                    PageSize: 1000000,
                    PageNumber: 1
                }
            };
            // var FrmDate = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd HH:MM:ss') || null;
            // var ToDate = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd HH:MM:ss') || null;

            if ($scope.currentfilter.FromBillDate || $scope.currentfilter.ToBillDate) {
                inputData.Params.push({
                    Key: 27,
                    Value: $scope.currentfilter.FromBillDate
                })
                inputData.Params.push({
                    Key: 28,
                    Value: $scope.currentfilter.ToBillDate
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
                    Value: $scope.currentfilter.UserId
                },
                {
                    Key: 41,
                    Value: $scope.currentfilter.PaymentTypeId
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
                    Value: $scope.currentfilter.FacilityId
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

            if ($scope.currentfilter.FromBillDate || $scope.currentfilter.ToBillDate) {
                inputData.Params.push({
                    Key: 17,
                    Value: $scope.currentfilter.FromBillDate
                })
                inputData.Params.push({
                    Key: 18,
                    Value: $scope.currentfilter.ToBillDate
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
        // $scope.getOPDocInvPaymentListCallback = function (scope, res, options, hasError) {
        //     $scope.DoctorPayments = [];
        //     $scope.TotalCashInvPay = 0;
        //     $scope.TotalCardInvPay = 0;
        //     $scope.TotChequeOtherInvPay = 0;
        //     $scope.TotalInvPay = 0;

        //     if (res && res.Data && res.Data.length > 0) {

        //         var SNo = 1;
        //         for (var idx in res.Data) {
        //             var DocPayment = res.Data[idx];
        //             if ($scope.currentfilter.UserId > 0) {
        //                 if (DocPayment.CreatedUser.Title)
        //                     $scope.UserName = DocPayment.CreatedUser.Title.Description;
        //                 if (DocPayment.CreatedUser.FirstName)
        //                     $scope.UserName += ' ' + DocPayment.CreatedUser.FirstName;
        //                 if (DocPayment.CreatedUser.LastName)
        //                     $scope.UserName += ' ' + DocPayment.CreatedUser.LastName;
        //             } else {
        //                 $scope.UserName = '';
        //             }
        //             if ($scope.currentfilter.PaymentTypeId > 0) {
        //                 $scope.PaymentType = DocPayment.PaymentType.Description;
        //             }
        //             var paymentno = DocPayment.DoctorPaymentIdentifier;
        //             var paymentdate = DocPayment.PaymentDateTime;
        //             var DoctorName = '';
        //             var Cash = 0;
        //             var Card = 0;
        //             var ChequeOthers = 0;
        //             if (DocPayment.Doctor && DocPayment.Doctor.Title && DocPayment.Doctor.Title.Description) {
        //                 DoctorName += DocPayment.Doctor.Title.Description;
        //             }
        //             if (DocPayment.Doctor && DocPayment.Doctor.FirstName) {
        //                 DoctorName += ' ' + DocPayment.Doctor.FirstName;
        //             }
        //             if (DocPayment.Doctor && DocPayment.Doctor.LastName) {
        //                 DoctorName += ' ' + DocPayment.Doctor.LastName;
        //             }
        //             if (!DoctorName) {
        //                 DoctorName = DocPayment.DoctorName;
        //             }


        //             if (DocPayment.PaymentTypeId == 1) {
        //                 Cash = DocPayment.DoctorPaymentAmount;
        //                 $scope.TotalCashInvPay += DocPayment.DoctorPaymentAmount;
        //                 $scope.TotalInvPay += DocPayment.DoctorPaymentAmount;
        //             } else if (DocPayment.PaymentTypeId == 5 || DocPayment.PaymentTypeId == 6) {
        //                 Card = DocPayment.DoctorPaymentAmount;
        //                 $scope.TotalCardInvPay += DocPayment.DoctorPaymentAmount;
        //                 $scope.TotalInvPay += DocPayment.DoctorPaymentAmount;
        //             } else if (DocPayment.PaymentTypeId == 2 || DocPayment.PaymentTypeId == 3 || DocPayment.PaymentTypeId == 4) {
        //                 ChequeOthers = DocPayment.DoctorPaymentAmount;
        //                 $scope.TotChequeOtherInvPay += DocPayment.DoctorPaymentAmount;
        //                 $scope.TotalInvPay += DocPayment.DoctorPaymentAmount;
        //             }

        //             if (DocPayment.PaymentTypeId == 1) { // CASH
        //                 Card = 0;
        //                 ChequeOthers = 0;
        //             } else if (DocPayment.PaymentTypeId == 5 || DocPayment.PaymentTypeId == 6) { //CARD
        //                 Cash = 0;
        //                 ChequeOthers = 0;
        //             } else if (DocPayment.PaymentTypeId == 2 || DocPayment.PaymentTypeId == 3 || DocPayment.PaymentTypeId == 4) { // CHEQUE
        //                 Cash = 0;
        //                 Card = 0;
        //             }

        //             if (Cash > 0 || Card > 0 || ChequeOthers > 0) {
        //                 //$scope.TotalSales += (Cash + Card + ChequeOthers);
        //                 let DrPaymentCollectionModel = {
        //                     SNo: SNo,
        //                     PaymentDate: paymentdate,
        //                     PaymentNo: paymentno,
        //                     DoctorName: DoctorName,
        //                     Cash: Cash,
        //                     Card: Card,
        //                     ChequeOthers: ChequeOthers
        //                 };
        //                 SNo++;
        //                 $scope.DoctorPayments.push(DrPaymentCollectionModel);
        //             }
        //             if ($scope.DoctorPayments.length > 0) {
        //                 $scope.DocPayment = true;
        //             }
        //             // }
        //             // }
        //         }
        //     }

        //     try {
        //         $scope.TotalCashSales = ($scope.TotalCashSales).toFixed(2);
        //     } catch (e) { }
        //     try {
        //         $scope.TotalCardSales = ($scope.TotalCardSales).toFixed(2);
        //     } catch (e) { }
        //     try {
        //         $scope.TotalChequeOtherSales = ($scope.TotalChequeOtherSales).toFixed(2);
        //     } catch (e) { }

        // };

        // $scope.getOPDocInvPaymentList = function () {
        //     var inputData = {
        //         Params: [
        //             { Key: 1, Value: $scope.currentfilter.FacilityId },
        //             { Key: 6, Value: 3 },
        //             {
        //                 Key: 11,
        //                 Value: $scope.currentfilter.UserId
        //             },
        //             {
        //                 Key: 9,
        //                 Value: $scope.currentfilter.PaymentTypeId
        //             }
        //         ],
        //         PageContext: {
        //             PageSize: 1000000,
        //             PageNumber: 1
        //         }
        //     };

        //     if ($scope.currentfilter.FromBillDate || $scope.currentfilter.ToBillDate) {
        //         inputData.Params.push({
        //             Key: 7,
        //             Value: $scope.currentfilter.FromBillDate
        //         })
        //         inputData.Params.push({
        //             Key: 8,
        //             Value: $scope.currentfilter.ToBillDate
        //         });
        //     }
        //     var options = {
        //         action: 'doctorInvoice/DoctorPayment/GetDoctorPayments',
        //         data: inputData,
        //         type: 'post',
        //         onComplete: $scope.getOPDocInvPaymentListCallback
        //     };

        //     utl.Http.doAction(options);
        // };

        $scope.getList = function () {
            var startTime = new Date($scope.currentfilter.FromBillDate);
            var endTime = new Date($scope.currentfilter.ToBillDate);
            var difference = endTime.getTime() - startTime.getTime();
            var resultInDays = Math.round(difference / (1000 * 60 * 60 * 24)); // Calculate difference in days
            if (!(resultInDays >= 0 && resultInDays <= 31)) { // Check if difference is less than 15 days
                utl.Alert.showSuccessMsg("From and To Date Difference should be less than one month...");
                $scope.currentfilter.FromBillDate = new Date();
                $scope.currentfilter.ToBillDate = new Date();
                return false;
            }
            $scope.getOPDGSalesList();
            $scope.getOPDGAdvanceAdjustmentList();
            $scope.getOPDGCancelsList();
            $scope.getOPDGRefundsList();
            $scope.getOPDGOutstandingList();
            // $scope.getOPDocInvPaymentList();
        };
        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.currentfilter.UserId = -1;
                $scope.getList();
            }
        };
        $scope.backtoReport = function () {
            if ($scope.Context == 'opinvoicebillingreport') {
                $state.go('app.billingreportstab.opinvoicebillingreport');
            }
            if ($scope.Context == 'collectionsummary') {
                $state.go('app.financereporttab.collectionsummary');
            }
        };
        $scope.print = function () {
            var inputData = {
                Data: {
                    FromDate: $scope.currentfilter.FromBillDate,
                    ToDate: $scope.currentfilter.ToBillDate,
                    FacilityName: $scope.currentfilter.FacilityName,
                    UserId: $scope.currentfilter.UserId,
                    UserName: $scope.UserName,
                    FacilityId: utl.Session.getCurrentFacilityId()
                },
                Params: [
                    //     {
                    //     Key: 4,
                    //     Value: 3
                    // },
                    // {
                    //     Key: 33,
                    //     Value: [1, 5]
                    // },
                    // {
                    //     Key: 60,
                    //     Value: $scope.currentfilter.UserId
                    // },
                    // {
                    //     Key: 41,
                    //     Value: $scope.currentfilter.PaymentTypeId
                    // }
                ],
            };
            var options = {
                action: 'billing/patientbills/PrintCollectionReportByCashier',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };
        vm.usercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Doctor Id',
                field: 'DoctorId',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Doctor Name',
                field: 'DoctorName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            {
                header: 'Qualification',
                field: 'Qualification',
                datatype: 'string',
                headercls: 'td-Qualification',
                fieldcls: 'td-Qualification'
            },
            {
                header: 'Speciality',
                field: 'Speciality',
                datatype: 'string',
                headercls: 'td-dept',
                fieldcls: 'td-dept'
            },
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselecteduser,
            presearch: presearchuser,
            postsearch: postsearchuser
        };

        function formatselecteduser() {
            var selectedItem = vm.usercontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.DoctorName].join('  ');
            } else if (vm.usercontrolconfig.rowdata) {
                result = [vm.usercontrolconfig.rowdata.DoctorId, vm.usercontrolconfig.rowdata.DoctorName,
                vm.usercontrolconfig.rowdata.Qualification, vm.usercontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            // $scope.currentfilter.UserId = result;
            $scope.UserName = result;
            return result;
        }

        function presearchuser() {
            var query = vm.usercontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [
                    { Key: 5, Value: 2 }
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };

            if (vm.usercontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
            }

            vm.usercontrolconfig.searchparams = inputData;
        }

        function postsearchuser() {
            for (var idx in vm.usercontrolconfig.result) {
                var item = vm.usercontrolconfig.result[idx];
                item.DoctorId = item.Id;
                item.DoctorName = item.FirstName;
                item.Qualification = item.Qualification;
                // item.Speciality = item.Department.DepartmentName;
            }
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            // $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "PaymentType"
            },
            {
                "Key": "Facility",
                Request: {
                    Params: [{
                        Key: 4,
                        Value: true
                    }]
                }
            }
            ]
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

    collectiondetailbyallcashierreportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();