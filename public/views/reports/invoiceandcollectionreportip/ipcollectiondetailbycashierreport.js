(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('IPCollectionDetailByCashierReportController', IPCollectionDetailByCashierReportController);

    function IPCollectionDetailByCashierReportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.lookup = {};
        $scope.lookup.PaymentType = [];

        $scope.currentcontext = {};
        $scope.currentfilter = {};
        $scope.currentfilter.FromBillDate = $filter('date')(new Date(), 'yyyy-MM-dd 00:00:00'),
            $scope.currentfilter.ToBillDate = $filter('date')(new Date(), 'yyyy-MM-dd 23:59:59'),
            $scope.currentfilter.PaymentTypeId = -1;
        $scope.currentfilter.UserId = utl.Session.getCurrentUserId();
        $scope.currentfilter.UserName = '';
        $scope.currentfilter.FacilityName = utl.Session.getCurrentFacilityName();

        $scope.PaymentIPAdvances = [];
        $scope.PaymentIPReceipts = [];
        $scope.PaymentIPRefunds = [];

        $scope.PatientAdvances = false;
        $scope.PatientReceipts = false;
        $scope.PatientRefunds = false;

        $scope.TotalCash = 0;
        $scope.TotalCard = 0;
        $scope.TotalOthers = 0;
        $scope.TotalNetBanking = 0;
        $scope.TotalUPI = 0;

        $scope.TotalCashAdvances = 0;
        $scope.TotalCardAdvances = 0;
        $scope.TotalChequeOtherAdvances = 0;
        $scope.TotalNetBankingAdvances = 0;
        $scope.TotalUPIAdvances = 0;
        $scope.TotalAdvances = 0;

        $scope.TotalCashReceipts = 0;
        $scope.TotalCardReceipts = 0;
        $scope.TotalChequeOtherReceipts = 0;
        $scope.TotalNetBankingReceipts = 0;
        $scope.TotalUPIReceipts = 0;
        $scope.TotalReceipts = 0;

        $scope.TotCashDue = 0;
        $scope.TotCardDue = 0;
        $scope.TotChequeOthersDue = 0;
        $scope.TotNetBankingDue = 0;
        $scope.TotUPIDue = 0;
        $scope.TotDues = 0;

        $scope.TotalCashRefunds = 0;
        $scope.TotalCardRefunds = 0;
        $scope.TotalChequeOtherRefunds = 0;
        $scope.TotalNetBankingRefunds = 0;
        $scope.TotalUPIRefunds = 0;
        $scope.TotalRefunds = 0;

        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }

        $scope.getIPRefundsListCallback = function (scope, res, options, hasError) {
            $scope.PaymentIPRefunds = [];
            $scope.TotalCashRefunds = 0;
            $scope.TotalCardRefunds = 0;
            $scope.TotalChequeOtherRefunds = 0;
            $scope.TotalNetBankingRefunds = 0;
            $scope.TotalUPIRefunds = 0;
            $scope.TotalRefunds = 0;

            $scope.TotalCash = 0;
            $scope.TotalCard = 0;
            $scope.TotalOthers = 0;
            $scope.TotalNetBanking = 0;
            $scope.TotalUPI = 0;
            if (res && res.Data && res.Data.length > 0) {
                $scope.PatientRefunds = true;
                var SNo = 1;
                for (var idx in res.Data) {
                    var PatientRefund = res.Data[idx];
                    var refundDt = PatientRefund.RefundDateTime;
                    var refundnumber = PatientRefund.RefundIdentifier;
                    var refundtype = '';
                    var drname = '';
                    var PatientName = '';
                    var Status = '';
                    var Cash = 0;
                    var Card = 0;
                    var ChequeOthers = 0;
                    var NetBanking = 0;
                    var UPI = 0;

                    if (PatientRefund.RefundType && PatientRefund.RefundType.Description) {
                        refundtype = PatientRefund.RefundType.Description;
                    }

                    if (PatientRefund.Patient && PatientRefund.Patient.Title && PatientRefund.Patient.Title.Description) {
                        PatientName += PatientRefund.Patient.Title.Description;
                    }
                    if (PatientRefund.Patient && PatientRefund.Patient.FirstName) {
                        PatientName += ' ' + PatientRefund.Patient.FirstName;
                    }
                    if (PatientRefund.Patient && PatientRefund.Patient.LastName) {
                        PatientName += ' ' + PatientRefund.Patient.LastName;
                    }
                    if (PatientRefund.Patient && PatientRefund.Patient.MRN) {
                        PatientName += ' ' + PatientRefund.Patient.MRN;
                    }
                    if (!PatientName) {
                        PatientName = PatientRefund.PatientName;
                    }


                    if (PatientRefund.User && PatientRefund.User.Title && PatientRefund.User.Title.Description) {
                        drname += PatientRefund.User.Title.Description;
                    }
                    if (PatientRefund.User && PatientRefund.User.FirstName) {
                        drname += ' ' + PatientRefund.User.FirstName;
                    }
                    if (PatientRefund.User && PatientRefund.User.LastName) {
                        drname += ' ' + PatientRefund.User.LastName;
                    }
                    if (!drname) {
                        drname = PatientRefund.drname;
                    }

                    if ($scope.currentfilter.UserId == -1 || $scope.currentfilter.UserId == PatientRefund.CreatedBy) {
                        if (PatientRefund.PaymentTypeId == 1 && PatientRefund.RefundStatusId == 1) {
                            Cash = PatientRefund.RefundAmount;
                            $scope.TotalCashRefunds += PatientRefund.RefundAmount;
                            $scope.TotalRefunds += PatientRefund.RefundAmount;
                        } else if (PatientRefund.PaymentTypeId == 5 || PatientRefund.PaymentTypeId == 6 && PatientRefund.RefundStatusId == 1) {
                            Card = PatientRefund.RefundAmount;
                            $scope.TotalCardRefunds += PatientRefund.RefundAmount;
                            $scope.TotalRefunds += PatientRefund.RefundAmount;
                        } else if (PatientRefund.PaymentTypeId != 1 && PatientRefund.PaymentTypeId != 5 &&
                            PatientRefund.PaymentTypeId != 6 && PatientRefund.PaymentTypeId != 10
                            && PatientRefund.PaymentTypeId != 11 && PatientRefund.RefundStatusId == 1) {
                            ChequeOthers = PatientRefund.RefundAmount;
                            $scope.TotalChequeOtherRefunds += PatientRefund.RefundAmount;
                            $scope.TotalRefunds += PatientRefund.RefundAmount;
                        } else if (PatientRefund.PaymentTypeId == 10 && PatientRefund.RefundStatusId == 1) {
                            NetBanking = PatientRefund.RefundAmount;
                            $scope.TotalNetBankingRefunds += PatientRefund.RefundAmount;
                            $scope.TotalRefunds += PatientRefund.RefundAmount;
                        } else if (PatientRefund.PaymentTypeId == 11 && PatientRefund.RefundStatusId == 1) {
                            UPI = PatientRefund.RefundAmount;
                            $scope.TotalUPIRefunds += PatientRefund.RefundAmount;
                            $scope.TotalRefunds += PatientRefund.RefundAmount;
                        }

                        if (PatientRefund.PaymentTypeId == 1) { // CASH
                            Card = 0;
                            ChequeOthers = 0;
                            NetBanking = 0;
                            UPI = 0;
                        } else if (PatientRefund.PaymentTypeId == 5 || PatientRefund.PaymentTypeId == 6) { // CARD
                            Cash = 0;
                            ChequeOthers = 0;
                            NetBanking = 0;
                            UPI = 0;
                        } else if (PatientRefund.PaymentTypeId != 1 && PatientRefund.PaymentTypeId != 5 &&
                            PatientRefund.PaymentTypeId != 6 && PatientRefund.PaymentTypeId != 10
                            && PatientRefund.PaymentTypeId != 11) { // CHEQUE & OTHERS
                            Cash = 0;
                            Card = 0;
                            NetBanking = 0;
                            UPI = 0;
                        } else if (PatientRefund.PaymentTypeId == 10) { // NetBanking
                            Cash = 0;
                            Card = 0;
                            ChequeOthers = 0;
                            UPI = 0;
                        } else if (PatientRefund.PaymentTypeId == 11) { // UPI
                            Cash = 0;
                            Card = 0;
                            ChequeOthers = 0;
                            NetBanking = 0;
                        }

                        if (Cash > 0 || Card > 0 || ChequeOthers > 0 || NetBanking > 0 || UPI > 0) {
                            let PaymentCollectionModel = {
                                SNo: SNo,
                                RefundDt: refundDt,
                                Refundnumber: refundnumber,
                                Refundtype: refundtype,
                                Drname: drname,
                                PatientName: PatientName,
                                Cash: Cash,
                                Card: Card,
                                ChequeOthers: ChequeOthers,
                                NetBanking: NetBanking,
                                UPI: UPI,
                            };
                            SNo++;
                            $scope.PaymentIPRefunds.push(PaymentCollectionModel);
                        }
                    }
                }
            }
        };

        $scope.getIPRefundsList = function () {
            var inputData = {
                Params: [
                    { Key: 5, Value: 1 },
                    { Key: 11, Value: 2 },
                    { Key: 14, Value: $scope.currentfilter.UserId }
                ],
                PageContext: { PageSize: 1000000, PageNumber: 1 }
            };
            // var FrmDate = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd HH:MM:ss') || null;
            // var ToDate = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd HH:MM:ss') || null;

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
                onComplete: $scope.getIPRefundsListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getUserCallback = function (scope, res, options, hasError) {
            var userdata = res.Data;
            if (userdata[0].FirstName != null) {
                var firstname = userdata[0].FirstName;
            } else {
                var firstname = "";
            }
            if (userdata[0].LastName != null) {
                var lastname = userdata[0].LastName;
            } else {
                var lastname = "";
            }
            $scope.currentfilter.UserName = firstname + "" + lastname;
            console.log($scope.currentfilter.UserName, '$scope.currentfilter.UserName');
        };

        $scope.getUser = function () {

            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.currentfilter.UserId
                }
                ]
            };

            var options = {
                action: 'SystemSettings/user/GetUsers',
                data: inputData,
                type: 'post',
                onComplete: $scope.getUserCallback
            };

            utl.Http.doAction(options);
        };

        $scope.print = function () {
            // var From = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd 00:00:00') || null;
            // var To = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: $scope.currentfilter.FromBillDate,
                    ToDate: $scope.currentfilter.ToBillDate,
                    User: $scope.currentfilter.UserId,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    FacilityName: $scope.currentfilter.FacilityName,
                    // UserName: $scope.UserName
                    UserName: $scope.currentfilter.UserName
                },
                Params: [
                    { Key: 4, Value: 2 },
                    { Key: 5, Value: 1 },
                    { Key: 11, Value: 2 },
                    { Key: 19, Value: $scope.currentfilter.UserId },
                    // { Key: 20, Value: true },
                    { Key: 21, Value: 3 }
                ],
            };
            var options = {
                action: 'billing/PatientPaymentDetails/PrintIPCollectionReportByCashier',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.getIPReceiptsListCallback = function (scope, res, options, hasError) {
            $scope.PaymentIPReceipts = [];
            $scope.TotalCashReceipts = 0;
            $scope.TotalCardReceipts = 0;
            $scope.TotalChequeOtherReceipts = 0;
            $scope.TotalNetBankingReceipts = 0;
            $scope.TotalUPIReceipts = 0;
            $scope.TotalReceipts = 0;


            $scope.TotalCash = 0;
            $scope.TotalCard = 0;
            $scope.TotalOthers = 0;
            $scope.TotalNetBanking = 0;
            $scope.TotalUPI = 0;

            if (res && res.Data && res.Data.length > 0) {
                $scope.PatientReceipts = true;
                var SNo = 1;
                for (var idx in res.Data) {
                    var PatientReceipt = res.Data[idx];
                    // if ($scope.currentfilter.UserId > 0) {
                    if (PatientReceipt.CreatedUser.Title)
                        $scope.UserName = PatientReceipt.CreatedUser.Title.Description;
                    if (PatientReceipt.CreatedUser.FirstName)
                        $scope.UserName += ' ' + PatientReceipt.CreatedUser.FirstName;
                    if (PatientReceipt.CreatedUser.LastName)
                        $scope.UserName += ' ' + PatientReceipt.CreatedUser.LastName;
                    // } else {
                    //     $scope.UserName = '';
                    // }
                    var receiptDt = PatientReceipt.ReceiptDateTime;
                    var receiptnumber = PatientReceipt.ReceiptNumber;
                    var billnumber = '';
                    var drname = '';
                    var PatientName = '';
                    var Status = '';
                    var Cash = 0;
                    var Card = 0;
                    var ChequeOthers = 0;
                    var NetBanking = 0;
                    var UPI = 0;

                    if (PatientReceipt.PatientBill && PatientReceipt.PatientBill.BillNumber) {
                        billnumber = PatientReceipt.PatientBill.BillNumber;
                    }

                    if (PatientReceipt.Patient && PatientReceipt.Patient.Title && PatientReceipt.Patient.Title.Description) {
                        PatientName += PatientReceipt.Patient.Title.Description;
                    }
                    if (PatientReceipt.Patient && PatientReceipt.Patient.FirstName) {
                        PatientName += ' ' + PatientReceipt.Patient.FirstName;
                    }
                    if (PatientReceipt.Patient && PatientReceipt.Patient.LastName) {
                        PatientName += ' ' + PatientReceipt.Patient.LastName;
                    }
                    if (PatientReceipt.Patient && PatientReceipt.Patient.MRN) {
                        PatientName += ' ' + PatientReceipt.Patient.MRN;
                    }
                    if (!PatientName) {
                        PatientName = PatientReceipt.PatientName;
                    }


                    if (PatientReceipt.User && PatientReceipt.User.Title && PatientReceipt.User.Title.Description) {
                        drname += PatientReceipt.User.Title.Description;
                    }
                    if (PatientReceipt.User && PatientReceipt.User.FirstName) {
                        drname += ' ' + PatientReceipt.User.FirstName;
                    }
                    if (PatientReceipt.User && PatientReceipt.User.LastName) {
                        drname += ' ' + PatientReceipt.User.LastName;
                    }
                    if (!drname) {
                        drname = PatientReceipt.drname;
                    }

                    if ($scope.currentfilter.UserId == -1 || $scope.currentfilter.UserId == PatientReceipt.CreatedBy) {
                        if (PatientReceipt.PaymentTypeId == 1 && PatientReceipt.ReceiptStatusId == 1) {
                            Cash = PatientReceipt.AmountPaid;
                            $scope.TotalCashReceipts += parseFloat(PatientReceipt.AmountPaid);
                            $scope.TotalCash += PatientReceipt.AmountPaid;
                        } else if (PatientReceipt.PaymentTypeId == 5 || PatientReceipt.PaymentTypeId == 6 && PatientReceipt.ReceiptStatusId == 1) {
                            Card = PatientReceipt.AmountPaid;
                            $scope.TotalCardReceipts += PatientReceipt.AmountPaid;
                            $scope.TotalCard += PatientReceipt.AmountPaid;
                        } else if (PatientReceipt.PaymentTypeId != 1 && PatientReceipt.PaymentTypeId != 5 &&
                            PatientReceipt.PaymentTypeId != 6 && PatientReceipt.PaymentTypeId != 10
                            && PatientReceipt.PaymentTypeId != 11 && PatientReceipt.ReceiptStatusId == 1) {
                            ChequeOthers = PatientReceipt.AmountPaid;
                            $scope.TotalChequeOtherReceipts += PatientReceipt.AmountPaid;
                            $scope.TotalOthers += PatientReceipt.AmountPaid;
                        } else if (PatientReceipt.PaymentTypeId == 10 && PatientReceipt.ReceiptStatusId == 1) {
                            NetBanking = PatientReceipt.AmountPaid;
                            $scope.TotalNetBankingReceipts += PatientReceipt.AmountPaid;
                            $scope.TotalNetBanking += PatientReceipt.AmountPaid;
                        } else if (PatientReceipt.PaymentTypeId == 11 && PatientReceipt.ReceiptStatusId == 1) {
                            UPI = PatientReceipt.AmountPaid;
                            $scope.TotalUPIReceipts += PatientReceipt.AmountPaid;
                            $scope.TotalUPI += PatientReceipt.AmountPaid;
                        }

                        if (PatientReceipt.PaymentTypeId == 1) { // CASH
                            Card = 0;
                            ChequeOthers = 0;
                            NetBanking = 0;
                            UPI = 0;
                        } else if (PatientReceipt.PaymentTypeId == 5 || PatientReceipt.PaymentTypeId == 6) { // CARD
                            Cash = 0;
                            ChequeOthers = 0;
                            NetBanking = 0;
                            UPI = 0;
                        } else if (PatientReceipt.PaymentTypeId != 1 && PatientReceipt.PaymentTypeId != 5 &&
                            PatientReceipt.PaymentTypeId != 6 && PatientReceipt.PaymentTypeId != 10
                            && PatientReceipt.PaymentTypeId != 11) { // CHEQUE & OTHERS
                            Cash = 0;
                            Card = 0;
                            NetBanking = 0;
                            UPI = 0;
                        } else if (PatientReceipt.PaymentTypeId == 10) { // NetBanking
                            Cash = 0;
                            Card = 0;
                            ChequeOthers = 0;
                            UPI = 0;
                        } else if (PatientReceipt.PaymentTypeId == 11) { // UPI
                            Cash = 0;
                            Card = 0;
                            ChequeOthers = 0;
                            NetBanking = 0;
                        }

                        if (Cash > 0 || Card > 0 || ChequeOthers > 0 || NetBanking > 0 || UPI > 0) {
                            let PaymentCollectionModel = {
                                SNo: SNo,
                                ReceiptDt: receiptDt,
                                Receiptnumber: receiptnumber,
                                Billnumber: billnumber,
                                Drname: drname,
                                PatientName: PatientName,
                                Cash: Cash,
                                Card: Card,
                                ChequeOthers: ChequeOthers,
                                NetBanking: NetBanking,
                                UPI: UPI,
                                Status: Status
                            };
                            SNo++;
                            $scope.PaymentIPReceipts.push(PaymentCollectionModel);
                        }
                    }

                }
            }
        };

        $scope.getIPReceiptsList = function () {
            var inputData = {
                Params: [
                    { Key: 4, Value: 2 },
                    { Key: 5, Value: 1 },
                    { Key: 11, Value: 2 },
                    { Key: 19, Value: $scope.currentfilter.UserId },
                    // { Key: 20, Value: true },
                    { Key: 21, Value: 3 }
                ],
                PageContext: { PageSize: 1000000, PageNumber: 1 }
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
                onComplete: $scope.getIPReceiptsListCallback
            };

            utl.Http.doAction(options);
        };


        $scope.getIPFundList = function () {
            var inputData = {
                Params: [
                    { Key: 4, Value: 5 },
                    { Key: 5, Value: 1 },
                    { Key: 11, Value: 2 },
                    { Key: 19, Value: $scope.currentfilter.UserId }
                ],
                PageContext: { PageSize: 1000000, PageNumber: 1 }
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
                onComplete: $scope.getIPFundListCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getIPFundListCallback = function (scope, res, options, hasError) {
            $scope.PaymentIPFunds = [];
            $scope.FundCashAdvances = 0;
            $scope.FundCardAdvances = 0;
            $scope.FundChequeOtherAdvances = 0;
            $scope.FundNetBankingAdvances = 0;
            $scope.FundUPIAdvances = 0;
            $scope.FundAdvances = 0;


            $scope.TotalCash = 0;
            $scope.TotalCard = 0;
            $scope.TotalOthers = 0;
            $scope.TotalNetBanking = 0;
            $scope.TotalUPI = 0;
            if (res && res.Data && res.Data.length > 0) {
                $scope.PatientFunds = true;
                var SNo = 1;
                for (var idx in res.Data) {
                    var PatientFund = res.Data[idx];
                    var receiptDt = PatientFund.ReceiptDateTime;
                    var receiptnumber = PatientFund.ReceiptNumber;
                    var visitnumber = '';
                    var drname = '';
                    var PatientName = '';
                    var Status = '';
                    var Cash = 0;
                    var Card = 0;
                    var ChequeOthers = 0;
                    var NetBanking = 0;
                    var UPI = 0;

                    if (PatientFund.Encounter && PatientFund.Encounter.VisitIdentifier) {
                        visitnumber = PatientFund.Encounter.VisitIdentifier;
                    }

                    if (PatientFund.Patient && PatientFund.Patient.Title && PatientFund.Patient.Title.Description) {
                        PatientName += PatientFund.Patient.Title.Description;
                    }
                    if (PatientFund.Patient && PatientFund.Patient.FirstName) {
                        PatientName += ' ' + PatientFund.Patient.FirstName;
                    }
                    if (PatientFund.Patient && PatientFund.Patient.LastName) {
                        PatientName += ' ' + PatientFund.Patient.LastName;
                    }
                    if (PatientFund.Patient && PatientFund.Patient.MRN) {
                        PatientName += ' ' + PatientFund.Patient.MRN;
                    }
                    if (!PatientName) {
                        PatientName = PatientFund.PatientName;
                    }


                    if (PatientFund.User && PatientFund.User.Title && PatientFund.User.Title.Description) {
                        drname += PatientFund.User.Title.Description;
                    }
                    if (PatientFund.User && PatientFund.User.FirstName) {
                        drname += ' ' + PatientFund.User.FirstName;
                    }
                    if (PatientFund.User && PatientFund.User.LastName) {
                        drname += ' ' + PatientFund.User.LastName;
                    }
                    if (!drname) {
                        drname = PatientFund.drname;
                    }

                    if ($scope.currentfilter.UserId == -1 || $scope.currentfilter.UserId == PatientFund.CreatedBy) {
                        if (PatientFund.PaymentTypeId == 1 && PatientFund.ReceiptStatusId == 1) {
                            Cash = PatientFund.AmountPaid;
                            $scope.FundCashFunds += PatientFund.AmountPaid;
                            $scope.FundFunds += PatientFund.AmountPaid;
                        } else if (PatientFund.PaymentTypeId == 5 || PatientFund.PaymentTypeId == 6 && PatientFund.ReceiptStatusId == 1) {
                            Card = PatientFund.AmountPaid;
                            $scope.FundCardFunds += PatientFund.AmountPaid;
                            $scope.FundFunds += PatientFund.AmountPaid;
                        } else if (PatientFund.PaymentTypeId != 1 && PatientFund.PaymentTypeId != 5 &&
                            PatientFund.PaymentTypeId != 6 && PatientFund.PaymentTypeId != 10 && PatientFund.PaymentTypeId != 11 && PatientFund.ReceiptStatusId == 1) {
                            ChequeOthers = PatientFund.AmountPaid;
                            $scope.FundChequeOtherFunds += PatientFund.AmountPaid;
                            $scope.FundFunds += PatientFund.AmountPaid;
                        } else if (PatientFund.PaymentTypeId == 10 && PatientFund.ReceiptStatusId == 1) {
                            NetBanking = PatientFund.AmountPaid;
                            $scope.FundNetBankingFunds += PatientFund.AmountPaid;
                            $scope.FundFunds += PatientFund.AmountPaid;
                        } else if (PatientFund.PaymentTypeId == 11 && PatientFund.ReceiptStatusId == 1) {
                            UPI = PatientFund.AmountPaid;
                            $scope.FundUPIFunds += PatientFund.AmountPaid;
                            $scope.FundFunds += PatientFund.AmountPaid;
                        }

                        if (PatientFund.PaymentTypeId == 1) { // CASH
                            Card = 0;
                            ChequeOthers = 0;
                            NetBanking = 0;
                            UPI = 0;
                        } else if (PatientFund.PaymentTypeId == 5 || PatientFund.PaymentTypeId == 6) { // CARD
                            Cash = 0;
                            ChequeOthers = 0;
                            NetBanking = 0;
                            UPI = 0;
                        } else if (PatientFund.PaymentTypeId != 1 && PatientFund.PaymentTypeId != 5 &&
                            PatientFund.PaymentTypeId != 6 && PatientFund.PaymentTypeId != 10 && PatientFund.PaymentTypeId != 11) { // CHEQUE & OTHERS
                            Cash = 0;
                            Card = 0;
                            NetBanking = 0;
                            UPI = 0;
                        } else if (PatientFund.PaymentTypeId == 10) { // NetBanking
                            Cash = 0;
                            Card = 0;
                            ChequeOthers = 0;
                            UPI = 0;
                        } else if (PatientFund.PaymentTypeId == 11) { // UPI
                            Cash = 0;
                            Card = 0;
                            ChequeOthers = 0;
                            NetBanking = 0;
                        }

                        if (Cash > 0 || Card > 0 || ChequeOthers > 0 || NetBanking > 0 || UPI > 0) {
                            let PaymentCollectionModel = {
                                SNo: SNo,
                                ReceiptDt: receiptDt,
                                Receiptnumber: receiptnumber,
                                Visittnumber: visitnumber,
                                Drname: drname,
                                PatientName: PatientName,
                                Cash: Cash,
                                Card: Card,
                                ChequeOthers: ChequeOthers,
                                NetBanking: NetBanking,
                                UPI: UPI,
                            };
                            SNo++;
                            $scope.PaymentIPFunds.push(PaymentCollectionModel);
                        }
                    }
                }
            }
        };

        $scope.getIPDueListCallback = function (scope, res, options, hasError) {
            $scope.PaymentOPDueCollections = [];
            $scope.TotCashDue = 0;
            $scope.TotCardDue = 0;
            $scope.TotChequeOthersDue = 0;
            $scope.TotNetBankingDue = 0;
            $scope.TotUPIDue = 0;
            $scope.TotDues = 0;


            $scope.TotalCash = 0;
            $scope.TotalCard = 0;
            $scope.TotalOthers = 0;
            $scope.TotalNetBanking = 0;
            $scope.TotalUPI = 0;
            if (res && res.Data && res.Data.length > 0) {
                $scope.PatientDueCollections = true;
                var SNo = 1;
                for (var idx in res.Data) {
                    var PatientDue = res.Data[idx];
                    var receiptDt = PatientDue.ReceiptDateTime;
                    var receiptnumber = PatientDue.ReceiptNumber;
                    var billnumber = '';
                    if (PatientDue.PatientBill) {
                        billnumber = PatientDue.PatientBill.BillNumber;
                    }
                    var drname = '';
                    var PatientName = '';
                    var Status = '';
                    var Cash = 0;
                    var Card = 0;
                    var ChequeOthers = 0;
                    var NetBanking = 0;
                    var UPI = 0;

                    if (PatientDue.User && PatientDue.User.Title && PatientDue.User.Title.Description)
                        drname += PatientDue.User.Title.Description;

                    if (PatientDue.User && PatientDue.User.FirstName)
                        drname += ' ' + PatientDue.User.FirstName;

                    if (PatientDue.User && PatientDue.User.LastName)
                        drname += ' ' + PatientDue.User.LastName;


                    if (PatientDue.Patient && PatientDue.Patient.Title && PatientDue.Patient.Title.Description)
                        PatientName += PatientDue.Patient.Title.Description;

                    if (PatientDue.Patient && PatientDue.Patient.FirstName)
                        PatientName += ' ' + PatientDue.Patient.FirstName;

                    if (PatientDue.Patient && PatientDue.Patient.LastName)
                        PatientName += ' ' + PatientDue.Patient.LastName;

                    if (PatientDue.Patient && PatientDue.Patient.MRN)
                        PatientName += ' / ' + PatientDue.Patient.MRN;

                    if (!PatientName)
                        PatientName = PatientDue.PatientName;

                    if (PatientDue.ReceiptTypeId == 3 && PatientDue.PatientBill) {
                        if ($scope.currentfilter.UserId == -1 || $scope.currentfilter.UserId == PatientDue.CreatedBy) {
                            if (PatientDue.PaymentTypeId == 1 && PatientDue.ReceiptStatusId == 1) {
                                Cash = PatientDue.AmountPaid;
                                $scope.TotCashDue += parseFloat(PatientDue.AmountPaid);
                                $scope.TotalCash += PatientDue.AmountPaid;
                            } else if (PatientDue.PaymentTypeId == 5 || PatientDue.PaymentTypeId == 6 && PatientDue.ReceiptStatusId == 1) {
                                Card = PatientDue.AmountPaid;
                                $scope.TotCardDue += PatientDue.AmountPaid;
                                $scope.TotalCard += PatientDue.AmountPaid;
                            } else if (PatientDue.PaymentTypeId != 1 && PatientDue.PaymentTypeId != 5 &&
                                PatientDue.PaymentTypeId != 6 && PatientDue.PaymentTypeId != 10 && PatientDue.PaymentTypeId != 11 && PatientDue.ReceiptStatusId == 1) {
                                ChequeOthers = PatientDue.AmountPaid;
                                $scope.TotChequeOthersDue += PatientDue.AmountPaid;
                                $scope.TotalOthers += PatientDue.AmountPaid;
                            } else if (PatientDue.PaymentTypeId == 10 && PatientDue.ReceiptStatusId == 1) {
                                NetBanking = PatientDue.AmountPaid;
                                $scope.TotNetBankingDue += PatientDue.AmountPaid;
                                $scope.TotalNetBanking += PatientDue.AmountPaid;
                            } else if (PatientDue.PaymentTypeId == 11 && PatientDue.ReceiptStatusId == 1) {
                                UPI = PatientDue.AmountPaid;
                                $scope.TotUPIDue += PatientDue.AmountPaid;
                                $scope.TotalUPI += PatientDue.AmountPaid;
                            }

                            if (PatientDue.ReceiptStatus && PatientDue.ReceiptStatus.Description) {
                                Status = PatientDue.ReceiptStatus.Description;
                            }

                            if (PatientDue.PaymentTypeId == 1) { // CASH
                                Card = 0;
                                ChequeOthers = 0;
                                NetBanking = 0;
                                UPI = 0;
                                //$scope.TotCardDue = 0; 
                                //$scope.TotChequeOthersDue = 0;
                            } else if (PatientDue.PaymentTypeId == 5 || PatientDue.PaymentTypeId == 6) { //CARD
                                Cash = 0;
                                ChequeOthers = 0;
                                NetBanking = 0;
                                UPI = 0;
                                //$scope.TotCashDue = 0; 
                                //$scope.TotChequeOthersDue = 0;
                            } else if (PatientDue.PaymentTypeId != 1 && PatientDue.PaymentTypeId != 5 &&
                                PatientDue.PaymentTypeId != 6 && PatientDue.PaymentTypeId != 10 && PatientDue.PaymentTypeId != 11) { // CHEQUE
                                Cash = 0;
                                Card = 0;
                                NetBanking = 0;
                                UPI = 0;
                            } else if (PatientDue.PaymentTypeId == 10) { // NetBanking
                                Cash = 0;
                                Card = 0;
                                ChequeOthers = 0;
                                UPI = 0;
                            } else if (PatientDue.PaymentTypeId == 11) { // UPI
                                Cash = 0;
                                Card = 0;
                                ChequeOthers = 0;
                                NetBanking = 0;
                                //$scope.TotCashDue = 0; 
                                //$scope.TotCardDue = 0;
                            }

                            if (Cash > 0 || Card > 0 || ChequeOthers > 0 || NetBanking > 0 || UPI > 0) {
                                //$scope.TotDues += (Cash + Card + ChequeOthers);
                                let PaymentCollectionModel = {
                                    SNo: SNo,
                                    ReceiptDt: receiptDt,
                                    Receiptnumber: receiptnumber,
                                    Billnumber: billnumber,
                                    Drname: drname,
                                    PatientName: PatientName,
                                    Cash: Cash,
                                    Card: Card,
                                    ChequeOthers: ChequeOthers,
                                    NetBanking: NetBanking,
                                    UPI: UPI,
                                    Status: Status,
                                    MBillType: 1,
                                };
                                SNo++;
                                $scope.PaymentOPDueCollections.push(PaymentCollectionModel);
                            }
                        }
                    }
                }
            }

            try {
                $scope.TotCashDue = ($scope.TotCashDue).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotCardDue = ($scope.TotCardDue).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotChequeOthersDue = ($scope.TotChequeOthersDue).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotNetBankingDue = ($scope.TotNetBankingDue).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotUPIDue = ($scope.TotUPIDue).toFixed(2);
            } catch (e) { }

        };
        $scope.getIPDueList = function () {
            // var FrmDate = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            // var ToDate = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    // {
                    //     Key: 27,
                    //     Value: FrmDate
                    // },
                    // {
                    //     Key: 28,
                    //     Value: ToDate
                    // },
                    {
                        Key: 26,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 19,
                        Value: $scope.currentfilter.UserId
                    },
                    {
                        Key: 5,
                        Value: 1
                    },
                    {
                        Key: 4,
                        Value: 3
                    },
                    {
                        Key: 11,
                        Value: 2
                    },
                    {
                        Key: 13,
                        Value: false
                    },
                ],
                PageContext: { PageSize: 1000000, PageNumber: 1 }
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
                onComplete: $scope.getIPDueListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getIPAdvancesListCallback = function (scope, res, options, hasError) {
            $scope.PaymentIPAdvances = [];
            $scope.TotalCashAdvances = 0;
            $scope.TotalCardAdvances = 0;
            $scope.TotalChequeOtherAdvances = 0;
            $scope.TotalNetBankingAdvances = 0;
            $scope.TotalUPIAdvances = 0;
            $scope.TotalAdvances = 0;


            $scope.TotalCash = 0;
            $scope.TotalCard = 0;
            $scope.TotalOthers = 0;
            $scope.TotalNetBanking = 0;
            $scope.TotalUPI = 0;

            if (res && res.Data && res.Data.length > 0) {
                $scope.PatientAdvances = true;
                var SNo = 1;
                for (var idx in res.Data) {
                    var PatientAdvance = res.Data[idx];
                    var receiptDt = PatientAdvance.ReceiptDateTime;
                    var receiptnumber = PatientAdvance.ReceiptNumber;
                    var visitnumber = '';
                    var drname = '';
                    var PatientName = '';
                    var Status = '';
                    var Cash = 0;
                    var Card = 0;
                    var ChequeOthers = 0;
                    var NetBanking = 0;
                    var UPI = 0;

                    if (PatientAdvance.Encounter && PatientAdvance.Encounter.VisitIdentifier) {
                        visitnumber = PatientAdvance.Encounter.VisitIdentifier;
                    }

                    if (PatientAdvance.Patient && PatientAdvance.Patient.Title && PatientAdvance.Patient.Title.Description) {
                        PatientName += PatientAdvance.Patient.Title.Description;
                    }
                    if (PatientAdvance.Patient && PatientAdvance.Patient.FirstName) {
                        PatientName += ' ' + PatientAdvance.Patient.FirstName;
                    }
                    if (PatientAdvance.Patient && PatientAdvance.Patient.LastName) {
                        PatientName += ' ' + PatientAdvance.Patient.LastName;
                    }
                    if (PatientAdvance.Patient && PatientAdvance.Patient.MRN) {
                        PatientName += ' ' + PatientAdvance.Patient.MRN;
                    }
                    if (!PatientName) {
                        PatientName = PatientAdvance.PatientName;
                    }

                    if (PatientAdvance.User && PatientAdvance.User.Title && PatientAdvance.User.Title.Description) {
                        drname += PatientAdvance.User.Title.Description;
                    }
                    if (PatientAdvance.User && PatientAdvance.User.FirstName) {
                        drname += ' ' + PatientAdvance.User.FirstName;
                    }
                    if (PatientAdvance.User && PatientAdvance.User.LastName) {
                        drname += ' ' + PatientAdvance.User.LastName;
                    }
                    if (!drname) {
                        drname = PatientAdvance.drname;
                    }

                    if ($scope.currentfilter.UserId == -1 || $scope.currentfilter.UserId == PatientAdvance.CreatedBy) {
                        if (PatientAdvance.PaymentTypeId == 1 && PatientAdvance.ReceiptStatusId == 1) {
                            Cash = PatientAdvance.AmountPaid;
                            $scope.TotalCashAdvances += parseFloat(PatientAdvance.AmountPaid);
                            $scope.TotalCash += PatientAdvance.AmountPaid;
                        } else if (PatientAdvance.PaymentTypeId == 5 || PatientAdvance.PaymentTypeId == 6 && PatientAdvance.ReceiptStatusId == 1) {
                            Card = PatientAdvance.AmountPaid;
                            $scope.TotalCardAdvances += PatientAdvance.AmountPaid;
                            $scope.TotalCard += PatientAdvance.AmountPaid;
                        } else if (PatientAdvance.PaymentTypeId != 1 && PatientAdvance.PaymentTypeId != 5 && PatientAdvance.PaymentTypeId != 6
                            && PatientAdvance.PaymentTypeId != 10 && PatientAdvance.PaymentTypeId != 11 && PatientAdvance.ReceiptStatusId == 1) {
                            ChequeOthers = PatientAdvance.AmountPaid;
                            $scope.TotalChequeOtherAdvances += PatientAdvance.AmountPaid;
                            $scope.TotalOthers += PatientAdvance.AmountPaid;
                        } else if (PatientAdvance.PaymentTypeId == 10 && PatientAdvance.ReceiptStatusId == 1) {
                            NetBanking = PatientAdvance.AmountPaid;
                            $scope.TotalNetBankingAdvances += PatientAdvance.AmountPaid;
                            $scope.TotalNetBanking += PatientAdvance.AmountPaid;
                        } else if (PatientAdvance.PaymentTypeId == 11 && PatientAdvance.ReceiptStatusId == 1) {
                            UPI = PatientAdvance.AmountPaid;
                            $scope.TotalUPIAdvances += PatientAdvance.AmountPaid;
                            $scope.TotalUPI += PatientAdvance.AmountPaid;
                        }

                        if (PatientAdvance.PaymentTypeId == 1) { // CASH
                            Card = 0;
                            ChequeOthers = 0;
                            NetBanking = 0;
                            UPI = 0;
                            UPI = 0;
                        } else if (PatientAdvance.PaymentTypeId == 5 || PatientAdvance.PaymentTypeId == 6) { // CARD
                            Cash = 0;
                            ChequeOthers = 0;
                            UPI = 0;
                            NetBanking = 0;
                        } else if (PatientAdvance.PaymentTypeId != 1 && PatientAdvance.PaymentTypeId != 5
                            && PatientAdvance.PaymentTypeId != 6 && PatientAdvance.PaymentTypeId != 10 && PatientAdvance.PaymentTypeId != 11) { // CHEQUE & OTHERS
                            Cash = 0;
                            Card = 0;
                            NetBanking = 0;
                            UPI = 0;
                        } else if (PatientAdvance.PaymentTypeId == 10) { // NetBanking
                            Cash = 0;
                            Card = 0;
                            ChequeOthers = 0;
                            UPI = 0;
                        } else if (PatientAdvance.PaymentTypeId == 11) { // UPI
                            Cash = 0;
                            Card = 0;
                            ChequeOthers = 0;
                            NetBanking = 0;
                        }

                        if (Cash > 0 || Card > 0 || ChequeOthers > 0 || NetBanking > 0 || UPI > 0) {
                            let PaymentCollectionModel = {
                                SNo: SNo,
                                ReceiptDt: receiptDt,
                                Receiptnumber: receiptnumber,
                                Visittnumber: visitnumber,
                                Drname: drname,
                                PatientName: PatientName,
                                Cash: Cash,
                                Card: Card,
                                ChequeOthers: ChequeOthers,
                                NetBanking: NetBanking,
                                UPI: UPI,
                            };
                            SNo++;
                            $scope.PaymentIPAdvances.push(PaymentCollectionModel);
                        }
                    }
                }
            }
            try {
                $scope.TotalCashAdvances = ($scope.TotalCashAdvances).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotalCardAdvances = ($scope.TotalCardAdvances).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotalChequeOtherAdvances = ($scope.TotalChequeOtherAdvances).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotalNetBankingAdvances = ($scope.TotalNetBankingAdvances).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotalUPIAdvances = ($scope.TotalUPIAdvances).toFixed(2);
            } catch (e) { }
        };
        $scope.getIPAdvancesList = function () {
            var inputData = {
                Params: [
                    { Key: 4, Value: 1 },
                    { Key: 5, Value: 1 },
                    { Key: 11, Value: 2 },
                    { Key: 19, Value: $scope.currentfilter.UserId }
                ],
                PageContext: { PageSize: 1000000, PageNumber: 1 }
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
                onComplete: $scope.getIPAdvancesListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.Alltotal = function () {
            $scope.CashTotal = ($scope.TotalCashAdvances + $scope.TotalCashReceipts + $scope.TotCashDue) - ($scope.TotalCashRefunds);
        }
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

            $scope.getIPAdvancesList();
            $scope.getIPFundList();
            $scope.getIPReceiptsList();
            $scope.getIPRefundsList();
            $scope.getIPDueList();
            $scope.getUser();
            // }
        };
        $scope.onenter = function (data) {
            if (data == undefined) {
                // $scope.getList();
            }
        };
        $scope.backtoReport = function () {
            if ($scope.Context == 'ipinvoicebillingreport') {
                $state.go('app.billingreportstab.ipinvoicebillingreport');
            } if ($scope.Context == 'collectionsummary') {
                $state.go('app.financereporttab.collectionsummary');
            }

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

            return result;
        }

        function presearchuser() {
            var query = vm.usercontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [
                    // { Key: 3, Value: 2 }
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
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                item.Speciality = item.Department.DepartmentName;
            }
        }

        $scope.initLookup = function () {
            $scope.lookup.PaymentType.push({ Id: -1, Text: "Please Select" });
            $scope.lookup.PaymentType.push({ Id: 1, Text: "CASH" });
            $scope.lookup.PaymentType.push({ Id: 2, Text: "CARD" });
            $scope.lookup.PaymentType.push({ Id: 3, Text: "OTHERS" });
            // $scope.getList();
        };

        $scope.initLookup();
    }

    IPCollectionDetailByCashierReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();