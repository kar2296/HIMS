(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('pharmacycollectionallcashierController', pharmacycollectionallcashierController);

    function pharmacycollectionallcashierController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.lookup = {};
        $scope.lookup.PaymentType = [];

        $scope.currentcontext = {};
        $scope.currentfilter = {
            StoreMasterId: -1
        };
        $scope.currentfilter.FromBillDate = $filter('date')(new Date(), 'yyyy-MM-dd 00:00:00');
        $scope.currentfilter.ToBillDate = $filter('date')(new Date(), 'yyyy-MM-dd 23:59:59');
        $scope.currentfilter.PaymentTypeId = -1;
        $scope.currentfilter.UserId = -1;
        // $scope.currentfilter.UserId = utl.Session.getCurrentUserId();
        $scope.lookup = {};
        $scope.PaymentOPSales = [];
        $scope.PaymentOPDueCollections = [];
        $scope.PaymentOPAdvanceCollections = [];
        $scope.PaymentOPReturn = [];

        $scope.PatientBills = false;
        $scope.PatientDueCollections = false;
        $scope.PatientAdvanceCollections = false;
        $scope.PatientReturns = false;

        $scope.TotCash = 0;
        $scope.TotCard = 0;
        $scope.TotChequeOthers = 0;
        $scope.TotUPI = 0;
        $scope.TotSales = 0;

        $scope.TotCashDue = 0;
        $scope.TotCardDue = 0;
        $scope.TotChequeOthersDue = 0;
        $scope.TotUPIDue = 0;
        $scope.TotDues = 0;

        $scope.TotCashAdvance = 0;
        $scope.TotCardAdvance = 0;
        $scope.TotChequeOthersAdvance = 0;
        $scope.TotUPIAdvance = 0;
        $scope.TotAdvances = 0;

        $scope.TotCashReturn = 0;
        $scope.TotCardReturn = 0;
        $scope.TotChequeOthersReturn = 0;
        $scope.TotUPIReturn = 0;
        $scope.TotReturn = 0;

        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }

        $scope.getOPReturnListCallback = function (scope, res, options, hasError) {
            $scope.PaymentOPReturn = [];
            $scope.TotCashReturn = 0;
            $scope.TotCardReturn = 0;
            $scope.TotChequeOthersReturn = 0;
            $scope.TotUPIReturn = 0;
            $scope.TotReturn = 0;
            if (res && res.Data && res.Data.length > 0) {
                $scope.PatientReturns = true;
                var SNo = 1;
                for (var idx in res.Data) {
                    var PatientReturnBill = res.Data[idx];
                    if ($scope.currentfilter.UserId == -1 || $scope.currentfilter.UserId == PatientReturnBill.CreatedBy) {
                        var returnDt = PatientReturnBill.ReturnDateTime;
                        var returnnumber = PatientReturnBill.ReturnNumber;
                        var billDt = null;
                        var billnumber = '';
                        var drname = '';
                        if (PatientReturnBill.PatientBill) {
                            billDt = PatientReturnBill.PatientBill.BillDateTime;
                            billnumber = PatientReturnBill.PatientBill.BillNumber;
                        }
                        var PatientName = '';
                        var billedby = '';
                        var Status = '';
                        var Cash = 0;
                        var Card = 0;
                        var UPI = 0;
                        var ChequeOthers = 0;

                        if (PatientReturnBill.CreatedUser && PatientReturnBill.CreatedUser.Title && PatientReturnBill.CreatedUser.Title.Description)
                            billedby += PatientReturnBill.CreatedUser.Title.Description;

                        if (PatientReturnBill.CreatedUser && PatientReturnBill.CreatedUser.FirstName)
                            billedby += ' ' + PatientReturnBill.CreatedUser.FirstName;

                        if (PatientReturnBill.CreatedUser && PatientReturnBill.CreatedUser.LastName)
                            billedby += ' ' + PatientReturnBill.CreatedUser.LastName;

                        if (PatientReturnBill.PatientReturnStatus && PatientReturnBill.PatientReturnStatus.Description) {
                            Status = PatientReturnBill.PatientReturnStatus.Description;
                        }

                        if (PatientReturnBill.Patient && PatientReturnBill.Patient.Title && PatientReturnBill.Patient.Title.Description)
                            PatientName += PatientReturnBill.Patient.Title.Description;

                        if (PatientReturnBill.Patient && PatientReturnBill.Patient.FirstName)
                            PatientName += ' ' + PatientReturnBill.Patient.FirstName;

                        if (PatientReturnBill.Patient && PatientReturnBill.Patient.LastName)
                            PatientName += ' ' + PatientReturnBill.Patient.LastName;

                        if (PatientReturnBill.Patient && PatientReturnBill.Patient.MRN)
                            PatientName += ' ' + PatientReturnBill.Patient.MRN;

                        if (!PatientName)
                            PatientName = PatientReturnBill.PatientName;

                        if (PatientReturnBill.User && PatientReturnBill.User.Title && PatientReturnBill.User.Title.Description)
                            drname += PatientReturnBill.User.Title.Description;

                        if (PatientReturnBill.User && PatientReturnBill.User.FirstName)
                            drname += ' ' + PatientReturnBill.User.FirstName;

                        if (PatientReturnBill.User && PatientReturnBill.User.LastName)
                            drname += ' ' + PatientReturnBill.User.LastName;

                        var refnumber = '';
                        if (PatientReturnBill.PatientRefunds && PatientReturnBill.PatientRefunds.length > 0) {
                            for (var rfdx in PatientReturnBill.PatientRefunds) {
                                var refundDetail = PatientReturnBill.PatientRefunds[rfdx];
                                refnumber = refundDetail.RefundNumber;
                                if ($scope.currentfilter.UserId == -1 || $scope.currentfilter.UserId == refundDetail.CreatedBy) {
                                    if (refundDetail.PaymentTypeId == 1 && refundDetail.RefundStatusId == 1) {
                                        Cash = refundDetail.RefundAmount;
                                        $scope.TotCashReturn += refundDetail.RefundAmount;
                                        $scope.TotReturn += refundDetail.RefundAmount;
                                    } else if ((refundDetail.PaymentTypeId == 5 || refundDetail.PaymentTypeId == 6) && refundDetail.RefundStatusId == 1) {
                                        Card = refundDetail.RefundAmount;
                                        $scope.TotCardReturn += refundDetail.RefundAmount;
                                        $scope.TotReturn += refundDetail.RefundAmount;
                                    } else if ((refundDetail.PaymentTypeId == 11) && refundDetail.RefundStatusId == 1) {
                                        UPI = refundDetail.RefundAmount;
                                        $scope.TotUPIReturn += refundDetail.RefundAmount;
                                        $scope.TotReturn += refundDetail.RefundAmount;
                                    } else if ((refundDetail.PaymentTypeId != 1 || refundDetail.PaymentTypeId != 5 || refundDetail.PaymentTypeId != 6 || refundDetail.PaymentTypeId != 11) && refundDetail.RefundStatusId == 1) {
                                        ChequeOthers = refundDetail.RefundAmount;
                                        $scope.TotChequeOthersReturn += refundDetail.RefundAmount;
                                        $scope.TotReturn += refundDetail.RefundAmount;
                                    }
                                }
                            }
                            // Cash = PatientReturnBill.ReturnAmount;
                            // $scope.TotCashReturn += PatientReturnBill.ReturnAmount;
                            // $scope.TotReturn += PatientReturnBill.ReturnAmount;

                            if (refundDetail.PaymentTypeId == 1) { // CASH
                                Card = 0;
                                UPI = 0;
                                ChequeOthers = 0;
                                //$scope.TotCard = 0; 
                                //$scope.TotChequeOthers = 0;
                            } else if (refundDetail.PaymentTypeId == 5 || refundDetail.PaymentTypeId == 6) { //CARD
                                Cash = 0;
                                UPI = 0;
                                ChequeOthers = 0;
                                //$scope.TotCash = 0; 
                                //$scope.TotChequeOthers = 0;
                            } else if (refundDetail.PaymentTypeId == 11) { // CHEQUE
                                Cash = 0;
                                Card = 0;
                                ChequeOthers = 0;
                                //$scope.TotCash = 0; 
                                //$scope.TotCard = 0;
                            } else if (refundDetail.PaymentTypeId != 1 || refundDetail.PaymentTypeId != 5 || refundDetail.PaymentTypeId != 6 || refundDetail.PaymentTypeId != 11) { // CHEQUE
                                Cash = 0;
                                Card = 0;
                                UPI = 0;
                            }
                            if (Cash > 0 || Card > 0 || UPI > 0 || ChequeOthers > 0) {
                                let PaymentCollectionModel = {
                                    SNo: SNo,
                                    ReturnDt: returnDt,
                                    Returnnumber: returnnumber,
                                    BillNumber: billnumber,
                                    Drname: drname,
                                    Billedby: billedby,
                                    PatientName: PatientName,
                                    Cash: Cash,
                                    Card: Card,
                                    ChequeOthers: ChequeOthers,
                                    UPI: UPI,
                                    Status: Status,
                                    MBillType: 2
                                };
                                SNo++;
                                $scope.PaymentOPReturn.push(PaymentCollectionModel);
                            }
                        }
                    }
                }
            }
            try {
                $scope.TotCashReturn = ($scope.TotCashReturn).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotCardReturn = ($scope.TotCardReturn).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotChequeOthersReturn = ($scope.TotChequeOthersReturn).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotUPIReturn = ($scope.TotUPIReturn).toFixed(2);
            } catch (e) { }
            $scope.TotCashReturn = parseInt($scope.TotCashReturn);
            $scope.TotCardReturn = parseInt($scope.TotCardReturn);
            $scope.TotUPIReturn = parseInt($scope.TotUPIReturn);
            $scope.TotChequeOthersReturn = parseInt($scope.TotChequeOthersReturn);
        };
        $scope.getOPReturnList = function () {
            var inputData = {
                Params: [{
                    Key: 23,
                    Value: [1, 2, 3, 4, 5]
                },
                {
                    Key: 4,
                    Value: 3
                },
                {
                    Key: 22,
                    Value: $scope.currentfilter.UserId
                },
                {
                    Key: 20,
                    Value: $scope.currentfilter.StoreMasterId
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
                    Key: 24,
                    Value: $scope.currentfilter.FromBillDate
                })
                inputData.Params.push({
                    Key: 25,
                    Value: $scope.currentfilter.ToBillDate
                });
            }

            var options = {
                action: 'billing/patientreturns/GetPatientReturns',
                data: inputData,
                type: 'post',
                onComplete: $scope.getOPReturnListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getOPSalesDueCollectionListCallback = function (scope, res, options, hasError) {
            $scope.PaymentOPDueCollections = [];
            $scope.TotCashDue = 0;
            $scope.TotCardDue = 0;
            $scope.TotChequeOthersDue = 0;
            $scope.TotUPIDue = 0;
            $scope.TotDues = 0;
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
                    var billedby = '';
                    var PatientName = '';
                    var Status = '';
                    var Cash = 0;
                    var Card = 0;
                    var UPI = 0;
                    var ChequeOthers = 0;

                    if (PatientDue.CreatedUser && PatientDue.CreatedUser.Title && PatientDue.CreatedUser.Title.Description)
                        billedby += PatientDue.CreatedUser.Title.Description;

                    if (PatientDue.CreatedUser && PatientDue.CreatedUser.FirstName)
                        billedby += ' ' + PatientDue.CreatedUser.FirstName;

                    if (PatientDue.CreatedUser && PatientDue.CreatedUser.LastName)
                        billedby += ' ' + PatientDue.CreatedUser.LastName;

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
                        PatientName += ' ' + PatientDue.Patient.MRN;

                    if (!PatientName)
                        PatientName = PatientDue.PatientName;

                    if (PatientDue.ReceiptTypeId == 3 && PatientDue.PatientBill) {
                        if ($scope.currentfilter.UserId == -1 || $scope.currentfilter.UserId == PatientDue.CreatedBy) {
                            if (PatientDue.PaymentTypeId == 1 && PatientDue.ReceiptStatusId == 1) {
                                Cash = PatientDue.AmountPaid;
                                $scope.TotCashDue += PatientDue.AmountPaid;
                                $scope.TotDues += PatientDue.AmountPaid;
                            } else if (PatientDue.PaymentTypeId == 5 || PatientDue.PaymentTypeId == 6 && PatientDue.ReceiptStatusId == 1) {
                                Card = PatientDue.AmountPaid;
                                $scope.TotCardDue += PatientDue.AmountPaid;
                                $scope.TotDues += PatientDue.AmountPaid;
                            } else if (PatientDue.PaymentTypeId == 11 && PatientDue.ReceiptStatusId == 1) {
                                UPI = PatientDue.AmountPaid;
                                $scope.TotUPIDue += PatientDue.AmountPaid;
                                $scope.TotDues += PatientDue.AmountPaid;
                            } else if (PatientDue.PaymentTypeId != 1 || PatientDue.PaymentTypeId != 5 || PatientDue.PaymentTypeId != 6 ||
                                PatientDue.PaymentTypeId != 11 && PatientDue.ReceiptStatusId == 1) {
                                ChequeOthers = PatientDue.AmountPaid;
                                $scope.TotChequeOthersDue += PatientDue.AmountPaid;
                                $scope.TotDues += PatientDue.AmountPaid;
                            }

                            if (PatientDue.ReceiptStatus && PatientDue.ReceiptStatus.Description) {
                                Status = PatientDue.ReceiptStatus.Description;
                            }

                            if (PatientDue.PaymentTypeId == 1) { // CASH
                                Card = 0;
                                UPI = 0;
                                ChequeOthers = 0;
                                //$scope.TotCardDue = 0; 
                                //$scope.TotChequeOthersDue = 0;
                            } else if (PatientDue.PaymentTypeId == 5 || PatientDue.PaymentTypeId == 6) { //CARD
                                Cash = 0;
                                UPI = 0;
                                ChequeOthers = 0;
                                //$scope.TotCashDue = 0; 
                                //$scope.TotChequeOthersDue = 0;
                            } else if (PatientDue.PaymentTypeId == 11) { //UPI
                                Cash = 0;
                                Card = 0;
                                ChequeOthers = 0;
                                //$scope.TotCashDue = 0; 
                                //$scope.TotChequeOthersDue = 0;
                            } else if (PatientDue.PaymentTypeId != 1 || PatientDue.PaymentTypeId != 5 ||
                                PatientDue.PaymentTypeId != 6 || PatientDue.PaymentTypeId != 11) { // CHEQUE
                                Cash = 0;
                                Card = 0;
                                UPI = 0;
                                //$scope.TotCashDue = 0; 
                                //$scope.TotCardDue = 0;
                            }

                            if (Cash > 0 || Card > 0 || UPI > 0 || ChequeOthers > 0) {
                                //$scope.TotDues += (Cash + Card + ChequeOthers);
                                let PaymentCollectionModel = {
                                    SNo: SNo,
                                    ReceiptDt: receiptDt,
                                    Receiptnumber: receiptnumber,
                                    Billnumber: billnumber,
                                    Drname: drname,
                                    Billedby: billedby,
                                    PatientName: PatientName,
                                    Cash: Cash,
                                    Card: Card,
                                    UPI: UPI,
                                    ChequeOthers: ChequeOthers,
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
                $scope.TotUPIDue = ($scope.TotUPIDue).toFixed(2);
            } catch (e) { }
        };
        $scope.getOPSalesDueCollectionList = function () {
            var inputData = {
                Params: [{
                    Key: 4,
                    Value: 3
                },
                {
                    Key: 5,
                    Value: 1
                },
                {
                    Key: 33,
                    Value: [4, 6]
                },
                {
                    Key: 23,
                    Value: $scope.currentfilter.PaymentTypeId
                },
                {
                    Key: 31,
                    Value: $scope.currentfilter.StoreMasterId
                },
                {
                    Key: 19,
                    Value: $scope.currentfilter.UserId
                },
                    // { Key: 20, Value: 1 }
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
                onComplete: $scope.getOPSalesDueCollectionListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getOPSalesAdvanceCollectionListCallback = function (scope, res, options, hasError) {
            $scope.PaymentOPAdvanceCollections = [];
            $scope.TotCashAdvance = 0;
            $scope.TotCardAdvance = 0;
            $scope.TotChequeOthersAdvance = 0;
            $scope.TotUPIAdvance = 0;
            $scope.TotAdvances = 0;
            if (res && res.Data && res.Data.length > 0) {
                $scope.PatientAdvanceCollections = true;
                var SNo = 1;
                for (var idx in res.Data) {
                    var PatientAdvance = res.Data[idx];
                    var receiptDt = PatientAdvance.ReceiptDateTime;
                    var receiptnumber = PatientAdvance.ReceiptNumber;
                    // var billnumber = '';
                    // if (PatientAdvance.PatientBill) {
                    //     billnumber = PatientAdvance.PatientBill.BillNumber;
                    // }
                    var drname = '';
                    var billedby = '';
                    var PatientName = '';
                    var Status = '';
                    var Cash = 0;
                    var Card = 0;
                    var ChequeOthers = 0;
                    var UPI = 0;

                    if (PatientAdvance.CreatedUser && PatientAdvance.CreatedUser.Title && PatientAdvance.CreatedUser.Title.Description)
                        billedby += PatientAdvance.CreatedUser.Title.Description;

                    if (PatientAdvance.CreatedUser && PatientAdvance.CreatedUser.FirstName)
                        billedby += ' ' + PatientAdvance.CreatedUser.FirstName;

                    if (PatientAdvance.CreatedUser && PatientAdvance.CreatedUser.LastName)
                        billedby += ' ' + PatientAdvance.CreatedUser.LastName;

                    if (PatientAdvance.User && PatientAdvance.User.Title && PatientAdvance.User.Title.Description)
                        drname += PatientAdvance.User.Title.Description;

                    if (PatientAdvance.User && PatientAdvance.User.FirstName)
                        drname += ' ' + PatientAdvance.User.FirstName;

                    if (PatientAdvance.User && PatientAdvance.User.LastName)
                        drname += ' ' + PatientAdvance.User.LastName;


                    if (PatientAdvance.Patient && PatientAdvance.Patient.Title && PatientAdvance.Patient.Title.Description)
                        PatientName += PatientAdvance.Patient.Title.Description;

                    if (PatientAdvance.Patient && PatientAdvance.Patient.FirstName)
                        PatientName += ' ' + PatientAdvance.Patient.FirstName;

                    if (PatientAdvance.Patient && PatientAdvance.Patient.LastName)
                        PatientName += ' ' + PatientAdvance.Patient.LastName;

                    if (PatientAdvance.Patient && PatientAdvance.Patient.MRN)
                        PatientName += ' ' + PatientAdvance.Patient.MRN;

                    if (!PatientName)
                        PatientName = PatientAdvance.PatientName;

                    if (PatientAdvance.ReceiptTypeId == 7) {
                        if ($scope.currentfilter.UserId == -1 || $scope.currentfilter.UserId == PatientAdvance.CreatedBy) {
                            if (PatientAdvance.PaymentTypeId == 1 && PatientAdvance.ReceiptStatusId == 1) {
                                Cash = PatientAdvance.AmountPaid;
                                $scope.TotCashAdvance += PatientAdvance.AmountPaid;
                                $scope.TotAdvances += PatientAdvance.AmountPaid;
                            } else if (PatientAdvance.PaymentTypeId == 5 || PatientAdvance.PaymentTypeId == 6 && PatientAdvance.ReceiptStatusId == 1) {
                                Card = PatientAdvance.AmountPaid;
                                $scope.TotCardAdvance += PatientAdvance.AmountPaid;
                                $scope.TotAdvances += PatientAdvance.AmountPaid;
                            } else if (PatientAdvance.PaymentTypeId == 11 && PatientAdvance.ReceiptStatusId == 1) {
                                UPI = PatientAdvance.AmountPaid;
                                $scope.TotUPIAdvance += PatientAdvance.AmountPaid;
                                $scope.TotAdvances += PatientAdvance.AmountPaid;
                            } else if (PatientAdvance.PaymentTypeId != 1 || PatientAdvance.PaymentTypeId != 5 || PatientAdvance.PaymentTypeId != 6 ||
                                PatientAdvance.PaymentTypeId != 11 && PatientAdvance.ReceiptStatusId == 1) {
                                ChequeOthers = PatientAdvance.AmountPaid;
                                $scope.TotChequeOthersAdvance += PatientAdvance.AmountPaid;
                                $scope.TotAdvances += PatientAdvance.AmountPaid;
                            }

                            if (PatientAdvance.ReceiptStatus && PatientAdvance.ReceiptStatus.Description) {
                                Status = PatientAdvance.ReceiptStatus.Description;
                            }

                            if (PatientAdvance.PaymentTypeId == 1) { // CASH
                                Card = 0;
                                UPI = 0;
                                ChequeOthers = 0;
                                //$scope.TotCardAdvance = 0; 
                                //$scope.TotChequeOthersAdvance = 0;
                            } else if (PatientAdvance.PaymentTypeId == 5 || PatientAdvance.PaymentTypeId == 6) { //CARD
                                Cash = 0;
                                UPI = 0;
                                ChequeOthers = 0;
                                //$scope.TotCashAdvance = 0; 
                                //$scope.TotChequeOthersAdvance = 0;
                            } else if (PatientAdvance.PaymentTypeId == 11) { // UPI
                                Cash = 0;
                                Card = 0;
                                ChequeOthers = 0;
                                //$scope.TotCashAdvance = 0; 
                                //$scope.TotCardAdvance = 0;
                            } else if (PatientAdvance.PaymentTypeId != 1 || PatientAdvance.PaymentTypeId != 5 || PatientAdvance.PaymentTypeId != 6 || PatientAdvance.PaymentTypeId != 11) { // CHEQUE
                                Cash = 0;
                                Card = 0;
                                UPI = 0;
                                //$scope.TotCashAdvance = 0; 
                                //$scope.TotCardAdvance = 0;
                            }

                            if (Cash > 0 || Card > 0 || UPI > 0 || ChequeOthers > 0) {
                                //$scope.TotAdvances += (Cash + Card + ChequeOthers);
                                let PaymentCollectionModel = {
                                    SNo: SNo,
                                    ReceiptDt: receiptDt,
                                    Receiptnumber: receiptnumber,
                                    // Billnumber: billnumber,
                                    Drname: drname,
                                    Billedby: billedby,
                                    PatientName: PatientName,
                                    Cash: Cash,
                                    Card: Card,
                                    ChequeOthers: ChequeOthers,
                                    UPI: UPI,
                                    Status: Status,
                                    MBillType: 1,
                                };
                                SNo++;
                                $scope.PaymentOPAdvanceCollections.push(PaymentCollectionModel);
                            }
                        }
                    }
                }
            }

            try {
                $scope.TotCashAdvance = ($scope.TotCashAdvance).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotCardAdvance = ($scope.TotCardAdvance).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotChequeOthersAdvance = ($scope.TotChequeOthersAdvance).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotUPIAdvance = ($scope.TotUPIAdvance).toFixed(2);
            } catch (e) { }
        };
        $scope.getOPSalesAdvanceCollectionList = function () {
            var inputData = {
                Params: [{
                    Key: 4,
                    Value: 7
                },
                {
                    Key: 5,
                    Value: 1
                },
                // {
                //     Key: 33,
                //     Value: 4
                // },
                {
                    Key: 23,
                    Value: $scope.currentfilter.PaymentTypeId
                },
                // {
                //     Key: 31,
                //     Value: $scope.currentfilter.StoreMasterId
                // },
                {
                    Key: 19,
                    Value: $scope.currentfilter.UserId
                },
                    // { Key: 20, Value: 1 }
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
                onComplete: $scope.getOPSalesAdvanceCollectionListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getOPSalesListCallback = function (scope, res, options, hasError) {
            $scope.PaymentOPSales = [];
            $scope.TotCash = 0;
            $scope.TotCard = 0;
            $scope.TotChequeOthers = 0;
            $scope.TotUPI = 0;
            $scope.TotSales = 0;
            if (res && res.Data && res.Data.length > 0) {
                $scope.PatientBills = true;
                var SNo = 1;
                for (var idx in res.Data) {
                    var PatientBill = res.Data[idx];
                    var billDt = PatientBill.BillDateTime;
                    var billnumber = PatientBill.BillNumber;
                    var receiptnumber = '';
                    var doctorid = PatientBill.DoctorId;
                    var drname = '';
                    var PatientName = '';
                    var billedby = '';
                    var Status = '';
                    var Cash = 0;
                    var Card = 0;
                    var UPI = 0;
                    var ChequeOthers = 0;

                    var ChequeOthers = 0;
                    if (!PatientBill.IsDirectDGBill) {
                        if (PatientBill.User && PatientBill.User.Title && PatientBill.User.Title.Description)
                            drname += PatientBill.User.Title.Description;

                        if (PatientBill.User && PatientBill.User.FirstName)
                            drname += ' ' + PatientBill.User.FirstName;

                        if (PatientBill.User && PatientBill.User.LastName)
                            drname += ' ' + PatientBill.User.LastName;
                    }
                    if (PatientBill.IsDirectDGBill) {
                        if (PatientBill.Referral)
                            drname = PatientBill.Referral.ReferralName;
                    }
                    if (PatientBill.Patient && PatientBill.Patient.Title && PatientBill.Patient.Title.Description)
                        PatientName += PatientBill.Patient.Title.Description;

                    if (PatientBill.Patient && PatientBill.Patient.FirstName)
                        PatientName += ' ' + PatientBill.Patient.FirstName;

                    if (PatientBill.Patient && PatientBill.Patient.LastName)
                        PatientName += ' ' + PatientBill.Patient.LastName;

                    if (PatientBill.Patient && PatientBill.Patient.MRN)
                        PatientName += ' ' + PatientBill.Patient.MRN;

                    if (!PatientName)
                        PatientName = PatientBill.PatientName;

                    for (var payidx in PatientBill.PatientPaymentDetails) {
                        var PatientPaymentDetail = PatientBill.PatientPaymentDetails[payidx];
                        receiptnumber = PatientPaymentDetail.ReceiptNumber;

                        if (PatientPaymentDetail.CreatedUser && PatientPaymentDetail.CreatedUser.Title && PatientPaymentDetail.CreatedUser.Title.Description)
                            billedby += PatientPaymentDetail.CreatedUser.Title.Description;

                        if (PatientPaymentDetail.CreatedUser && PatientPaymentDetail.CreatedUser.FirstName)
                            billedby += ' ' + PatientPaymentDetail.CreatedUser.FirstName;

                        if (PatientPaymentDetail.CreatedUser && PatientPaymentDetail.CreatedUser.LastName)
                            billedby += ' ' + PatientPaymentDetail.CreatedUser.LastName;


                        if (PatientPaymentDetail.ReceiptTypeId == 2) {
                            if ($scope.currentfilter.UserId == -1 || $scope.currentfilter.UserId == PatientPaymentDetail.CreatedBy) {
                                if (PatientPaymentDetail.PaymentTypeId == 1 && PatientPaymentDetail.ReceiptStatusId == 1) {
                                    Cash = PatientPaymentDetail.AmountPaid;
                                    $scope.TotCash += PatientPaymentDetail.AmountPaid;
                                    $scope.TotSales += PatientPaymentDetail.AmountPaid;
                                } else if ((PatientPaymentDetail.PaymentTypeId == 5 || PatientPaymentDetail.PaymentTypeId == 6) && PatientPaymentDetail.ReceiptStatusId == 1) {
                                    Card = PatientPaymentDetail.AmountPaid;
                                    $scope.TotCard += PatientPaymentDetail.AmountPaid;
                                    $scope.TotSales += PatientPaymentDetail.AmountPaid;
                                } else if ((PatientPaymentDetail.PaymentTypeId == 11) && PatientPaymentDetail.ReceiptStatusId == 1) {
                                    UPI = PatientPaymentDetail.AmountPaid;
                                    $scope.TotUPI += PatientPaymentDetail.AmountPaid;
                                    $scope.TotSales += PatientPaymentDetail.AmountPaid;
                                } else if ((PatientPaymentDetail.PaymentTypeId != 1 || PatientPaymentDetail.PaymentTypeId != 5 || PatientPaymentDetail.PaymentTypeId != 6 ||
                                    PatientPaymentDetail.PaymentTypeId != 11) && PatientPaymentDetail.ReceiptStatusId == 1) {
                                    ChequeOthers = PatientPaymentDetail.AmountPaid;
                                    $scope.TotChequeOthers += PatientPaymentDetail.AmountPaid;
                                    $scope.TotSales += PatientPaymentDetail.AmountPaid;
                                }

                                if (PatientPaymentDetail.ReceiptStatus && PatientPaymentDetail.ReceiptStatus.Description) {
                                    Status = PatientPaymentDetail.ReceiptStatus.Description;
                                }

                                if (PatientPaymentDetail.PaymentTypeId == 1) { // CASH
                                    Card = 0;
                                    ChequeOthers = 0;
                                    UPI = 0;
                                    //$scope.TotCard = 0; 
                                    //$scope.TotChequeOthers = 0;
                                } else if (PatientPaymentDetail.PaymentTypeId == 5 || PatientPaymentDetail.PaymentTypeId == 6) { //CARD
                                    Cash = 0;
                                    ChequeOthers = 0;
                                    UPI = 0;
                                    //$scope.TotCash = 0; 
                                    //$scope.TotChequeOthers = 0;
                                } else if (PatientPaymentDetail.PaymentTypeId == 11) { //UPI
                                    Cash = 0;
                                    ChequeOthers = 0;
                                    Card = 0;
                                    //$scope.TotCash = 0; 
                                    //$scope.TotChequeOthers = 0;
                                } else if (PatientPaymentDetail.PaymentTypeId != 1 || PatientPaymentDetail.PaymentTypeId != 5 ||
                                    PatientPaymentDetail.PaymentTypeId != 6 || PatientPaymentDetail.PaymentTypeId != 11) { // CHEQUE
                                    Cash = 0;
                                    Card = 0;
                                    UPI = 0;
                                    //$scope.TotCash = 0; 
                                    //$scope.TotCard = 0;
                                }

                                if (Cash > 0 || Card > 0 || UPI > 0 || ChequeOthers > 0) {
                                    //$scope.TotSales += (Cash + Card + ChequeOthers);
                                    let PaymentCollectionModel = {
                                        SNo: SNo,
                                        BillDt: billDt,
                                        Billnumber: billnumber,
                                        Receiptnumber: receiptnumber,
                                        Drname: drname,
                                        Billedby: billedby,
                                        PatientName: PatientName,
                                        Cash: Cash,
                                        Card: Card,
                                        UPI: UPI,
                                        ChequeOthers: ChequeOthers,
                                        Status: Status,
                                        MBillType: 1,
                                    };
                                    SNo++;
                                    $scope.PaymentOPSales.push(PaymentCollectionModel);
                                }
                            }
                        }
                    }
                }
            }

            try {
                $scope.TotCash = ($scope.TotCash).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotCard = ($scope.TotCard).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotChequeOthers = ($scope.TotChequeOthers).toFixed(2);
            } catch (e) { }
            try {
                $scope.TotUPI = ($scope.TotUPI).toFixed(2);
            } catch (e) { }
            $scope.NetCash = ((parseInt($scope.TotCash) + parseInt($scope.TotCashAdvance) + parseInt($scope.TotCashDue)) - parseInt($scope.TotCashReturn));
            $scope.NetCard = ((parseInt($scope.TotCard) + parseInt($scope.TotCardAdvance) + parseInt($scope.TotCardDue)) - parseInt($scope.TotCardReturn));
            $scope.NetCheque = ((parseInt($scope.TotChequeOthers) + parseInt($scope.TotChequeOthersAdvance) + parseInt($scope.TotChequeOthersDue)) - parseInt($scope.TotChequeOthersReturn));
            $scope.NetUPI = ((parseInt($scope.TotUPI) + parseInt($scope.TotUPIAdvance) + parseInt($scope.TotUPIDue)) - parseInt($scope.TotUPIReturn));

        };

        $scope.getOPSalesList = function () {
            var inputData = {
                Params: [{
                    Key: 6,
                    Value: [4, 6]
                }, {
                    Key: 4,
                    Value: 3
                },
                {
                    Key: 21,
                    Value: true
                },
                {
                    Key: 39,
                    Value: $scope.currentfilter.UserId
                },
                {
                    Key: 29,
                    Value: $scope.currentfilter.StoreMasterId
                },
                {
                    Key: 41,
                    Value: $scope.currentfilter.PaymentTypeId
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
                    Key: 68,
                    Value: $scope.currentfilter.FromBillDate
                })
                inputData.Params.push({
                    Key: 69,
                    Value: $scope.currentfilter.ToBillDate
                });
            }

            var options = {
                action: 'billing/patientbills/GetPharmacyPatientBills',
                data: inputData,
                type: 'post',
                onComplete: $scope.getOPSalesListCallback
            };

            utl.Http.doAction(options);
        };

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
            $scope.getOPSalesList();
            $scope.getOPSalesDueCollectionList();
            $scope.getOPSalesAdvanceCollectionList();
            $scope.getOPReturnList();
            // }
        };

        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.currentfilter.UserId = -1;
                // $scope.getList();
            }
        };
        $scope.backtoReport = function () {
            if ($scope.Context == 'invoicecollectionreport') {
                $state.go('app.pharmacytabreport.invoicecollectionreport');
            }
            if ($scope.Context == 'pharmacyreport') {
                $state.go('app.financereporttab.pharmacyreport');
            }

        };
        $scope.SelectedFromStore = function (selectedItem) {
            $scope.currentfilter.StoreMaster = selectedItem.StoreName;
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
            $scope.currentfilter.UserName = result;
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
                    PageSize: 25,
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
                if (item.Department)
                    item.Speciality = item.Department.DepartmentName;
            }
        }
        $scope.print = function () {
            // var FrmDate = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd HH:MM:ss') || null;
            // var ToDate = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd HH:MM:ss') || null;
            var inputData = {
                Data: {
                    FromDate: $scope.currentfilter.FromBillDate,
                    ToDate: $scope.currentfilter.ToBillDate,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    StoreMasterId: $scope.currentfilter.StoreMasterId,
                    UserId: $scope.currentfilter.UserId,
                    StoreMaster: $scope.currentfilter.StoreMaster,
                    UserName: $scope.currentfilter.UserName,
                },
                Params: [{
                    Key: 4,
                    Value: 3
                },
                {
                    Key: 33,
                    Value: 4
                },
                {
                    Key: 39,
                    Value: $scope.currentfilter.UserId
                },
                {
                    Key: 29,
                    Value: $scope.currentfilter.StoreMasterId
                },
                ],
            };
            var options = {
                action: 'billing/patientbills/PrintPharmacyCollectionAllCashier',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };


        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.currentfilter.StoreMasterId === -1) {
                    for (var usidx in $scope.lookup.UserStores) {
                        if ($scope.lookup.UserStores[usidx].IsDefault) {
                            $scope.currentfilter.StoreMasterId = $scope.lookup.UserStores[usidx].Id;
                            $scope.currentfilter.StoreMaster = $scope.lookup.UserStores[usidx].Text;
                        }
                    }
                    if ($scope.currentfilter.StoreMasterId === -1) {
                        $scope.currentfilter.StoreMasterId = value[0].Id;
                        $scope.currentfilter.StoreMaster = value[0].Text;
                    }
                }
            });
            // $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "ScheduleType"
            },
            {
                "Key": "UserStores",
                Request: {
                    Params: [{
                        Key: 1,
                        Value: utl.Session.getCurrentUserId()
                    },
                    {
                        Key: 2,
                        Value: utl.Session.getCurrentFacilityId(),
                    },
                    {
                        Key: 5,
                        Value: 2
                    }
                    ]
                },
                Default: false
            },
            ];
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        // $scope.initLookup = function () {
        //     $scope.lookup.PaymentType.push({ Id: -1, Text: "Please Select" });
        //     $scope.lookup.PaymentType.push({ Id: 1, Text: "CASH" });
        //     $scope.lookup.PaymentType.push({ Id: 2, Text: "CARD" });
        //     $scope.lookup.PaymentType.push({ Id: 3, Text: "OTHERS" });
        //     $scope.getList();
        // };

        $scope.initLookup();
    }

    pharmacycollectionallcashierController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();