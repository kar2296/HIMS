(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ipbillingcollectionsController', ipbillingcollectionsController);

    function ipbillingcollectionsController($rootScope, $scope, $filter, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;

        $scope.lookup = {};
        $scope.lookup.PaymentType = [];

        $scope.currentcontext = {};
        $scope.currentfilter = {};
        $scope.currentfilter.FromBillDate = $filter('date')(new Date(), 'yyyy-MM-dd 00:00:00');
        $scope.currentfilter.ToBillDate = $filter('date')(new Date(), 'yyyy-MM-dd 23:59:59');
        $scope.currentfilter.PaymentTypeId = -1;
        $scope.currentfilter.UserId = utl.Session.getCurrentUserId();

        $scope.PaymentIPAdvances = [];
        $scope.PaymentIPReceipts = [];
        $scope.PaymentIPRefunds = [];
        $scope.PaymentIPFunds = [];

        $scope.PatientAdvances = false;
        $scope.PatientReceipts = false;
        $scope.PatientRefunds = false;

        $scope.TotalCashAdvances = 0;
        $scope.TotalCardAdvances = 0;
        $scope.TotalChequeOtherAdvances = 0;
        $scope.TotalAdvances = 0;

        $scope.TotalCashReceipts = 0;
        $scope.TotalCardReceipts = 0;
        $scope.TotalChequeOtherReceipts = 0;
        $scope.TotalReceipts = 0;

        $scope.TotalCashRefunds = 0;
        $scope.TotalCardRefunds = 0;
        $scope.TotalChequeOtherRefunds = 0;
        $scope.TotalRefunds = 0;
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.getIPRefundsListCallback = function (scope, res, options, hasError) {
            $scope.PaymentIPRefunds = [];
            $scope.TotalCashRefunds = 0;
            $scope.TotalCardRefunds = 0;
            $scope.TotalChequeOtherRefunds = 0;
            $scope.TotalRefunds = 0;

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
                        } else if (PatientRefund.PaymentTypeId == 2 || PatientRefund.PaymentTypeId == 3 || PatientRefund.PaymentTypeId == 4 && PatientRefund.RefundStatusId == 1) {
                            ChequeOthers = PatientRefund.RefundAmount;
                            $scope.TotalChequeOtherRefunds += PatientRefund.RefundAmount;
                            $scope.TotalRefunds += PatientRefund.RefundAmount;
                        }

                        if (PatientRefund.PaymentTypeId == 1) { // CASH
                            Card = 0;
                            ChequeOthers = 0;
                        } else if (PatientRefund.PaymentTypeId == 5 || PatientRefund.PaymentTypeId == 6) { // CARD
                            Cash = 0;
                            ChequeOthers = 0;
                        } else if (PatientRefund.PaymentTypeId == 2 || PatientRefund.PaymentTypeId == 3 || PatientRefund.PaymentTypeId == 4) { // CHEQUE & OTHERS
                            Cash = 0;
                            Card = 0;
                        }

                        if (Cash > 0 || Card > 0 || ChequeOthers > 0) {
                            let PaymentCollectionModel = {
                                SNo: SNo,
                                RefundDt: refundDt,
                                Refundnumber: refundnumber,
                                Refundtype: refundtype,
                                Drname: drname,
                                PatientName: PatientName,
                                Cash: Cash,
                                Card: Card,
                                ChequeOthers: ChequeOthers
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

        $scope.getIPReceiptsListCallback = function (scope, res, options, hasError) {
            $scope.PaymentIPReceipts = [];
            $scope.TotalCashReceipts = 0;
            $scope.TotalCardReceipts = 0;
            $scope.TotalChequeOtherReceipts = 0;
            $scope.TotalReceipts = 0;

            if (res && res.Data && res.Data.length > 0) {
                $scope.PatientReceipts = true;
                var SNo = 1;
                for (var idx in res.Data) {
                    var PatientReceipt = res.Data[idx];
                    if ($scope.currentfilter.UserId > 0) {
                        if (PatientReceipt.CreatedUser.Title)
                            $scope.UserName = PatientReceipt.CreatedUser.Title.Description;
                        if (PatientReceipt.CreatedUser.FirstName)
                            $scope.UserName += ' ' + PatientReceipt.CreatedUser.FirstName;
                        if (PatientReceipt.CreatedUser.LastName)
                            $scope.UserName += ' ' + PatientReceipt.CreatedUser.LastName;
                    } else {
                        $scope.UserName = '';
                    }
                    var receiptDt = PatientReceipt.ReceiptDateTime;
                    var receiptnumber = PatientReceipt.ReceiptNumber;
                    var billnumber = '';
                    var drname = '';
                    var PatientName = '';
                    var Status = '';
                    var Cash = 0;
                    var Card = 0;
                    var ChequeOthers = 0;

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
                            $scope.TotalCashReceipts += PatientReceipt.AmountPaid;
                            $scope.TotalReceipts += PatientReceipt.AmountPaid;
                        } else if (PatientReceipt.PaymentTypeId == 5 || PatientReceipt.PaymentTypeId == 6 && PatientReceipt.ReceiptStatusId == 1) {
                            Card = PatientReceipt.AmountPaid;
                            $scope.TotalCardReceipts += PatientReceipt.AmountPaid;
                            $scope.TotalReceipts += PatientReceipt.AmountPaid;
                        } else if (PatientReceipt.PaymentTypeId == 2 || PatientReceipt.PaymentTypeId == 3 || PatientReceipt.PaymentTypeId == 4 && PatientReceipt.ReceiptStatusId == 1) {
                            ChequeOthers = PatientReceipt.AmountPaid;
                            $scope.TotalChequeOtherReceipts += PatientReceipt.AmountPaid;
                            $scope.TotalReceipts += PatientReceipt.AmountPaid;
                        }

                        if (PatientReceipt.PaymentTypeId == 1) { // CASH
                            Card = 0;
                            ChequeOthers = 0;
                        } else if (PatientReceipt.PaymentTypeId == 5 || PatientReceipt.PaymentTypeId == 6) { // CARD
                            Cash = 0;
                            ChequeOthers = 0;
                        } else if (PatientReceipt.PaymentTypeId == 2 || PatientReceipt.PaymentTypeId == 3 || PatientReceipt.PaymentTypeId == 4) { // CHEQUE & OTHERS
                            Cash = 0;
                            Card = 0;
                        }

                        if (Cash > 0 || Card > 0 || ChequeOthers > 0) {
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
            $scope.FundAdvances = 0;
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
                        } else if (PatientFund.PaymentTypeId == 2 || PatientFund.PaymentTypeId == 3 || PatientFund.PaymentTypeId == 4 && PatientFund.ReceiptStatusId == 1) {
                            ChequeOthers = PatientFund.AmountPaid;
                            $scope.FundChequeOtherFunds += PatientFund.AmountPaid;
                            $scope.FundFunds += PatientFund.AmountPaid;
                        }

                        if (PatientFund.PaymentTypeId == 1) { // CASH
                            Card = 0;
                            ChequeOthers = 0;
                        } else if (PatientFund.PaymentTypeId == 5 || PatientFund.PaymentTypeId == 6) { // CARD
                            Cash = 0;
                            ChequeOthers = 0;
                        } else if (PatientFund.PaymentTypeId == 2 || PatientFund.PaymentTypeId == 3 || PatientFund.PaymentTypeId == 4) { // CHEQUE & OTHERS
                            Cash = 0;
                            Card = 0;
                        }

                        if (Cash > 0 || Card > 0 || ChequeOthers > 0) {
                            let PaymentCollectionModel = {
                                SNo: SNo,
                                ReceiptDt: receiptDt,
                                Receiptnumber: receiptnumber,
                                Visittnumber: visitnumber,
                                Drname: drname,
                                PatientName: PatientName,
                                Cash: Cash,
                                Card: Card,
                                ChequeOthers: ChequeOthers
                            };
                            SNo++;
                            $scope.PaymentIPFunds.push(PaymentCollectionModel);
                        }
                    }
                }
            }
        };



        $scope.getIPAdvancesListCallback = function (scope, res, options, hasError) {
            $scope.PaymentIPAdvances = [];
            $scope.TotalCashAdvances = 0;
            $scope.TotalCardAdvances = 0;
            $scope.TotalChequeOtherAdvances = 0;
            $scope.TotalAdvances = 0;

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
                            $scope.TotalCashAdvances += PatientAdvance.AmountPaid;
                            $scope.TotalAdvances += PatientAdvance.AmountPaid;
                        } else if (PatientAdvance.PaymentTypeId == 5 || PatientAdvance.PaymentTypeId == 6 && PatientAdvance.ReceiptStatusId == 1) {
                            Card = PatientAdvance.AmountPaid;
                            $scope.TotalCardAdvances += PatientAdvance.AmountPaid;
                            $scope.TotalAdvances += PatientAdvance.AmountPaid;
                        } else if (PatientAdvance.PaymentTypeId == 2 || PatientAdvance.PaymentTypeId == 3 || PatientAdvance.PaymentTypeId == 4 && PatientAdvance.ReceiptStatusId == 1) {
                            ChequeOthers = PatientAdvance.AmountPaid;
                            $scope.TotalChequeOtherAdvances += PatientAdvance.AmountPaid;
                            $scope.TotalAdvances += PatientAdvance.AmountPaid;
                        }

                        if (PatientAdvance.PaymentTypeId == 1) { // CASH
                            Card = 0;
                            ChequeOthers = 0;
                        } else if (PatientAdvance.PaymentTypeId == 5 || PatientAdvance.PaymentTypeId == 6) { // CARD
                            Cash = 0;
                            ChequeOthers = 0;
                        } else if (PatientAdvance.PaymentTypeId == 2 || PatientAdvance.PaymentTypeId == 3 || PatientAdvance.PaymentTypeId == 4) { // CHEQUE & OTHERS
                            Cash = 0;
                            Card = 0;
                        }

                        if (Cash > 0 || Card > 0 || ChequeOthers > 0) {
                            let PaymentCollectionModel = {
                                SNo: SNo,
                                ReceiptDt: receiptDt,
                                Receiptnumber: receiptnumber,
                                Visittnumber: visitnumber,
                                Drname: drname,
                                PatientName: PatientName,
                                Cash: Cash,
                                Card: Card,
                                ChequeOthers: ChequeOthers
                            };
                            SNo++;
                            $scope.PaymentIPAdvances.push(PaymentCollectionModel);
                        }
                    }
                }
            }
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

        $scope.getList = function () {
            var startTime = new Date($scope.currentfilter.FromBillDate);
            var endTime = new Date($scope.currentfilter.ToBillDate);
            var difference = endTime.getTime() - startTime.getTime();
            var resultInHours = Math.round(difference / (1000 * 60 * 60));
            if (!(resultInHours >= 0 && resultInHours < 72)) {
                utl.Alert.showSuccessMsg("From and To Date Difference should be less than 3 days...");
                $scope.currentfilter.FromBillDate = new Date();
                $scope.currentfilter.ToBillDate = new Date();
                return false;
            } else {
                $scope.getIPAdvancesList();
                $scope.getIPFundList();
                $scope.getIPReceiptsList();
                $scope.getIPRefundsList();
            }
        };

        $scope.initLookup = function () {
            $scope.lookup.PaymentType.push({
                Id: -1,
                Text: "Please Select"
            });
            $scope.lookup.PaymentType.push({
                Id: 1,
                Text: "CASH"
            });
            $scope.lookup.PaymentType.push({
                Id: 2,
                Text: "CARD"
            });
            $scope.lookup.PaymentType.push({
                Id: 3,
                Text: "OTHERS"
            });
            $scope.getList();
        };

        function toIsoDate(d) {
            if (!d) return null;
            var dt = (d instanceof Date) ? d : new Date(d);
            if (isNaN(dt.getTime())) return null;
            var mm = ('0' + (dt.getMonth() + 1)).slice(-2);
            var dd = ('0' + dt.getDate()).slice(-2);
            return dt.getFullYear() + '-' + mm + '-' + dd;
        }

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                currentfilter: angular.extend({}, $scope.currentfilter, {
                    FromBillDate: toIsoDate($scope.currentfilter.FromBillDate),
                    ToBillDate: toIsoDate($scope.currentfilter.ToBillDate)
                }),
                lookup: $scope.lookup,
                flags: {
                    PatientAdvances: $scope.PatientAdvances,
                    PatientReceipts: $scope.PatientReceipts,
                    PatientRefunds: $scope.PatientRefunds
                },
                totals: {
                    TotalCashAdvances: $scope.TotalCashAdvances,
                    TotalCardAdvances: $scope.TotalCardAdvances,
                    TotalChequeOtherAdvances: $scope.TotalChequeOtherAdvances,
                    TotalAdvances: $scope.TotalAdvances,
                    TotalCashReceipts: $scope.TotalCashReceipts,
                    TotalCardReceipts: $scope.TotalCardReceipts,
                    TotalChequeOtherReceipts: $scope.TotalChequeOtherReceipts,
                    TotalReceipts: $scope.TotalReceipts,
                    TotalCashRefunds: $scope.TotalCashRefunds,
                    TotalCardRefunds: $scope.TotalCardRefunds,
                    TotalChequeOtherRefunds: $scope.TotalChequeOtherRefunds,
                    TotalRefunds: $scope.TotalRefunds
                },
                advances: $scope.PaymentIPAdvances,
                receipts: $scope.PaymentIPReceipts,
                refunds: $scope.PaymentIPRefunds
            };
            $scope.$applyAsync();
        };

        var _origGetIPAdvancesListCallback = $scope.getIPAdvancesListCallback;
        $scope.getIPAdvancesListCallback = function (scope, res, options, hasError) {
            _origGetIPAdvancesListCallback(scope, res, options, hasError);
            $scope.refreshReactProps();
        };

        var _origGetIPReceiptsListCallback = $scope.getIPReceiptsListCallback;
        $scope.getIPReceiptsListCallback = function (scope, res, options, hasError) {
            _origGetIPReceiptsListCallback(scope, res, options, hasError);
            $scope.refreshReactProps();
        };

        var _origGetIPRefundsListCallback = $scope.getIPRefundsListCallback;
        $scope.getIPRefundsListCallback = function (scope, res, options, hasError) {
            _origGetIPRefundsListCallback(scope, res, options, hasError);
            $scope.refreshReactProps();
        };

        // getIPFundListCallback intentionally NOT wrapped/mirrored into
        // reactProps: the real ipbillingcollections.html never renders
        // PaymentIPFunds (no ng-repeat, no summary row references any
        // Fund* total anywhere in the 364-line template) even though
        // getIPFundList() is still called on every getList(). This is a
        // confirmed dead feature (API call + computation with zero live
        // UI), not something this migration should surface. The real
        // getIPFundList()/getIPFundListCallback are left completely
        // unmodified and keep firing exactly as before -- React never
        // observes their results, matching current (non-)behavior exactly.

        $scope.handleReactAction = function (actionName, payload) {
            payload = payload || {};
            if (actionName === 'fromDateChange') {
                $scope.currentfilter.FromBillDate = payload.value ? new Date(payload.value) : null;
                $scope.refreshReactProps();
            } else if (actionName === 'toDateChange') {
                $scope.currentfilter.ToBillDate = payload.value ? new Date(payload.value) : null;
                $scope.refreshReactProps();
            } else if (actionName === 'paymentTypeFilterChange') {
                // Mirrors the real ui-select bound to currentfilter.PaymentTypeId.
                // Confirmed dead: no getIPAdvancesList/getIPReceiptsList/
                // getIPRefundsList/getIPFundList ever reads PaymentTypeId --
                // preserved as a functional-looking but no-op filter, exactly
                // like the real screen.
                $scope.currentfilter.PaymentTypeId = payload.value;
                $scope.refreshReactProps();
            } else if (actionName === 'getList') {
                $scope.getList();
            } else if (actionName === 'backToList') {
                // Confirmed dead in the real template too: ng-click="backToList()"
                // has no matching $scope.backToList definition anywhere in this
                // controller (unlike OP's billingcollections, which has no Back
                // button at all). Clicking the real button today throws an
                // uncaught TypeError swallowed by Angular's $exceptionHandler --
                // reproduced here as a no-op, not wired to a real navigation.
            }
        };

        $scope.initLookup();
    }

    ipbillingcollectionsController.$inject = ['$rootScope', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();