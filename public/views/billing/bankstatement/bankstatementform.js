(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('bankstatementFormController', bankstatementFormController);

    function bankstatementFormController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        $scope.lookup = {};
        $scope.NetCashAmt = 0;
        $scope.TotalCashInHand = 0;
        $scope.TotalCashAmount = 0;
        $scope.TotalCardAmount = 0;
        $scope.TotalAmountDiff = 0;
        $scope.OverAllNetCash = 0;
        $scope.currentfilter = {
            FromBillDate: $filter('date')(new Date(), 'yyyy-MM-dd 00:00:00'),
            ToBillDate: $filter('date')(new Date(), 'yyyy-MM-dd 23:59:59'),
            DisableFromBillDate: false,
            DisableToBillDate: false,
        };
        $scope.StatementData = [];
        var DepartmentUserIds = Array();
        $scope.item = {
            Id: 0,
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
            BillingCounterStatusId: 3,
            UserName: '',
            CounterName: '',
            CounterStatus: '',
            OpenedStatus: false,
            ClosedStatus: false,
            SubmittedStatus: false,
            CounterStartStatus: '',
            FilterDepartmentId: -1,
            FilterUserId: -1
        };

        $scope.currentcontext = {
            id: -1
        };

        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.DefinedDenominations = [];

        $scope.TotalCashReceipt = 0;
        $scope.TotalCardReceipt = 0;
        $scope.TotalChequeReceipt = 0;

        $scope.TotalCashRefund = 0;
        $scope.TotalCardRefund = 0;
        $scope.TotalChequeRefund = 0;

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

                if ($scope.item.FetalAmount > 0) {
                    $scope.item.DifferenceAmount = parseFloat($scope.item.DenominationsNetTotal) - (parseFloat($scope.NetCashAmt) + parseFloat($scope.item.FetalAmount));
                } else {
                    $scope.item.DifferenceAmount = parseFloat($scope.item.DenominationsNetTotal) - parseFloat($scope.NetCashAmt);
                }

            } else if (parseInt(item.DenominationCount) <= 0) {
                item.DenominationTotal = 0;

                $scope.DenomCount = 0;
                $scope.DenomTotal = 0;

                $scope.CalculateNetTotal();
            }
        };

        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'billing/bankstatements/PrintUpdateBankStatements',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.CalculateNetTotal = function () {
            if (!$scope.DenomCount) $scope.DenomCount = 0;
            if (!$scope.DenomTotal) $scope.DenomTotal = 0;
            for (var idx in $scope.DefinedDenominations) {
                var denomitem = $scope.DefinedDenominations[idx];
                $scope.DenomCount = parseFloat(($scope.DenomCount + parseInt(denomitem.DenominationCount)).toFixed(2));
                $scope.DenomTotal = parseFloat(($scope.DenomTotal + denomitem.DenominationTotal).toFixed(2));
            }

            $scope.item.DenominationsNetCount = $scope.DenomCount;
            $scope.item.DenominationsNetTotal = $scope.DenomTotal;
            if ($scope.item.FetalAmount > 0) {
                $scope.item.DifferenceAmount = parseFloat($scope.item.DenominationsNetTotal) - (parseFloat($scope.NetCashAmt) + parseFloat($scope.item.FetalAmount));
            } else {
                $scope.item.DifferenceAmount = parseFloat($scope.item.DenominationsNetTotal) - parseFloat($scope.NetCashAmt);
            }

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

        $scope.getList = function () {

            if ($scope.currentcontext.id) return;

            var FrmDate = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd HH:mm:ss');
            var ToDate = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd HH:mm:ss');
            var inputData = {
                Params: [
                    { Key: 3, Value: [FrmDate, ToDate] },
                    { Key: 5, Value: 1 },
                    { Key: 26, Value: utl.Session.getCurrentFacilityId() }
                    //{ Key: 19, Value: DepartmentUserIds },
                    //{ Key: 19, Value: $scope.item.FilterUserId }
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };
            if (DepartmentUserIds && DepartmentUserIds != null &&
                DepartmentUserIds != '' && DepartmentUserIds != undefined) {
                inputData.Params.push({ Key: 19, Value: DepartmentUserIds });
            }
            if ($scope.item.FilterUserId > 0 && $scope.item.FilterUserId != null &&
                $scope.item.FilterUserId != '' && $scope.item.FilterUserId != undefined) {
                inputData.Params.push({ Key: 19, Value: $scope.item.FilterUserId });
            }
            var options = {
                action: 'billing/patientpaymentdetails/GetPatientPaymentDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);
        };

        $scope.backtoList = function () {
            $state.go('app.bankstatement');
        }

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.clearDenominations();
            $scope.statementdata = {};
            if (res && res.Data) {
                for (var idx in res.Data) {
                    var patientpaymentdetail = res.Data[idx];
                    var UserName = ''; var UserId = -1;
                    if (patientpaymentdetail.CreatedUser && patientpaymentdetail.CreatedUser.Title &&
                        patientpaymentdetail.CreatedUser.Title.Description) {
                        UserName += '' + patientpaymentdetail.CreatedUser.Title.Description;
                    }
                    if (patientpaymentdetail.CreatedUser && patientpaymentdetail.CreatedUser.FirstName) {
                        UserName += ' ' + patientpaymentdetail.CreatedUser.FirstName;
                    }
                    if (patientpaymentdetail.CreatedUser && patientpaymentdetail.CreatedUser.LastName) {
                        UserName += ' ' + patientpaymentdetail.CreatedUser.LastName;
                    }
                    if (patientpaymentdetail.CreatedBy) {
                        UserId = patientpaymentdetail.CreatedBy
                    }
                    if (UserName) {
                        if (patientpaymentdetail.ReceiptStatusId == 3) {
                            var BillNo = '';
                            if (usercounterreceipt.PatientBill) {
                                BillNo = patientpaymentdetail.PatientBill.BillNumber;
                            }
                            var CancelledReceipt = {
                                PatientReceiptId: patientpaymentdetail.Id,
                                PatientBillId: patientpaymentdetail.PatientBillId,
                                BillNumber: BillNo,
                                PatientReceiptId: patientpaymentdetail.PatientReceiptId,
                                ReceiptNumber: patientpaymentdetail.ReceiptNumber,
                                CancelledAmount: patientpaymentdetail.AmountPaid,
                                CancelledReason: patientpaymentdetail.Comments
                            };
                            $scope.UserCounterCancelledReceipts.push(CancelledReceipt);
                        } else {
                            if (patientpaymentdetail.PaymentTypeId == 1 ||
                                patientpaymentdetail.PaymentTypeId == 2 ||
                                patientpaymentdetail.PaymentTypeId == 3 ||
                                patientpaymentdetail.PaymentTypeId == 4 ||
                                patientpaymentdetail.PaymentTypeId == 5 ||
                                patientpaymentdetail.PaymentTypeId == 6) {
                                if (!$scope.statementdata[UserName]) {
                                    $scope.statementdata[UserName] = {};
                                }

                                if (!$scope.statementdata[UserName]['userid'])
                                    $scope.statementdata[UserName]['userid'] = '';


                                if (!$scope.statementdata[UserName]['users'])
                                    $scope.statementdata[UserName]['users'] = '';

                                $scope.statementdata[UserName]['users'] = UserName;
                                $scope.statementdata[UserName]['userid'] = UserId;

                                if (patientpaymentdetail.PaymentTypeId == 1) {
                                    if (!$scope.statementdata[UserName]['cash'])
                                        $scope.statementdata[UserName]['cash'] = 0;

                                    $scope.statementdata[UserName]['cash'] += patientpaymentdetail.AmountPaid;
                                }
                                if (patientpaymentdetail.PaymentTypeId == 5 || patientpaymentdetail.PaymentTypeId == 6) {
                                    if (!$scope.statementdata[UserName]['card'])
                                        $scope.statementdata[UserName]['card'] = 0;

                                    $scope.statementdata[UserName]['card'] += patientpaymentdetail.AmountPaid;
                                }
                                if (patientpaymentdetail.PaymentTypeId == 2
                                    || patientpaymentdetail.PaymentTypeId == 3
                                    || patientpaymentdetail.PaymentTypeId == 4) {

                                    if (!$scope.statementdata[UserName]['others'])
                                        $scope.statementdata[UserName]['others'] = 0;

                                    $scope.statementdata[UserName]['others'] += patientpaymentdetail.AmountPaid;
                                }

                                if (!$scope.statementdata[UserName]['lhrc'])
                                    $scope.statementdata[UserName]['lhrc'] = 0;

                                if (!$scope.statementdata[UserName]['voucher'])
                                    $scope.statementdata[UserName]['voucher'] = 0;

                                if (!$scope.statementdata[UserName]['excessshort'])
                                    $scope.statementdata[UserName]['excessshort'] = 0;
                            }
                        }
                    }
                }

                $scope.StatementAmt();

            }

            $scope.getVoucherList();
            $scope.getLHRCList();
            $scope.getRefundsInfoBy();
        };

        $scope.clearDenominations = function() {
            for (var idx in $scope.DefinedDenominations) {
                var item = $scope.DefinedDenominations[idx];
                item.DenominationCount =0;
                item.DenominationTotal =0;
                $scope.item.DenominationsNetCount=0;
                $scope.item.DenominationsNetTotal=0;
            }
        }




        $scope.getRefundsInfoBy = function () {
            var FrmDate = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd HH:mm:ss');
            var ToDate = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd HH:mm:ss');
            var inputData = {
                Params: [
                    { Key: 3, Value: [FrmDate, ToDate] },
                    { Key: 5, Value: 1 },
                    { Key: 16, Value: utl.Session.getCurrentFacilityId() }
                    //{ Key: 14, Value: DepartmentUserIds },
                    //{ Key: 14, Value: $scope.item.FilterUserId }
                ],
                PageContext: { PageSize: -1, PageNumber: 1 }
            };
            if (DepartmentUserIds && DepartmentUserIds != null &&
                DepartmentUserIds != '' && DepartmentUserIds != undefined) {
                inputData.Params.push({ Key: 18, Value: DepartmentUserIds });
            }
            if ($scope.item.FilterUserId > 0 && $scope.item.FilterUserId != null &&
                $scope.item.FilterUserId != '' && $scope.item.FilterUserId != undefined) {
                inputData.Params.push({ Key: 18, Value: $scope.item.FilterUserId });
            }
            var options = {
                action: 'billing/patientrefund/GetPatientRefund',
                data: inputData,
                type: 'post',
                onComplete: $scope.getRefundsInfoCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getRefundsInfoCallback = function (scope, res, options, hasError) {
            $scope.UserCounterRefundsInfo = res.Data || [];
            if ($scope.UserCounterRefundsInfo && $scope.UserCounterRefundsInfo.length > 0) {
                $scope.UserCounterRefundsInfo.forEach(usercounterrefund => {
                    var UserName = ''; var UserId = -1;
                    if (usercounterrefund.CreatedUser && usercounterrefund.CreatedUser.Title &&
                        usercounterrefund.CreatedUser.Title.Description) {
                        UserName += '' + usercounterrefund.CreatedUser.Title.Description;
                    }
                    if (usercounterrefund.CreatedUser && usercounterrefund.CreatedUser.FirstName) {
                        UserName += ' ' + usercounterrefund.CreatedUser.FirstName;
                    }
                    if (usercounterrefund.CreatedUser && usercounterrefund.CreatedUser.LastName) {
                        UserName += ' ' + usercounterrefund.CreatedUser.LastName;
                    }
                    if (usercounterrefund.CreatedBy) {
                        UserId = usercounterrefund.CreatedBy
                    }
                    if (!$scope.statementdata[UserName]) {
                        $scope.statementdata[UserName] = {};
                    }

                    if (!$scope.statementdata[UserName]['userid'])
                        $scope.statementdata[UserName]['userid'] = '';


                    if (!$scope.statementdata[UserName]['users'])
                        $scope.statementdata[UserName]['users'] = '';

                    $scope.statementdata[UserName]['users'] = UserName;
                    $scope.statementdata[UserName]['userid'] = UserId

                    if (usercounterrefund.PaymentTypeId == 1) {
                        if (!$scope.statementdata[UserName]['cash'])
                            $scope.statementdata[UserName]['cash'] = 0;

                        $scope.statementdata[UserName]['cash'] -= usercounterrefund.RefundAmount;
                    }
                    if (usercounterrefund.PaymentTypeId == 5 || usercounterrefund.PaymentTypeId == 6) {
                        if (!$scope.statementdata[UserName]['card'])
                            $scope.statementdata[UserName]['card'] = 0;

                        $scope.statementdata[UserName]['card'] -= usercounterrefund.RefundAmount;
                    }
                    if (usercounterrefund.PaymentTypeId == 2
                        || usercounterrefund.PaymentTypeId == 3
                        || usercounterrefund.PaymentTypeId == 4) {

                        if (!$scope.statementdata[UserName]['others'])
                            $scope.statementdata[UserName]['others'] = 0;

                        $scope.statementdata[UserName]['others'] -= usercounterrefund.RefundAmount;
                    }
                });
                $scope.StatementAmt();
            }
        };

        $scope.getVoucherList = function () {
            var FrmDate = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd HH:mm:ss');
            var ToDate = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd HH:mm:ss');
            var inputData = {
                Params: [
                    { Key: 5, Value: FrmDate },
                    { Key: 8, Value: ToDate },
                    { Key: 4, Value: 2 }, //ExpenseStatusId - Submit , Approved.
                    { Key: 7, Value: utl.Session.getCurrentFacilityId() }
                    //{ Key: 3, Value: DepartmentUserIds },
                    //{ Key: 3, Value: $scope.item.FilterUserId }
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };
            if (DepartmentUserIds && DepartmentUserIds != null &&
                DepartmentUserIds != '' && DepartmentUserIds != undefined) {
                inputData.Params.push({ Key: 3, Value: DepartmentUserIds });
            }
            if ($scope.item.FilterUserId > 0 && $scope.item.FilterUserId != null &&
                $scope.item.FilterUserId != '' && $scope.item.FilterUserId != undefined) {
                inputData.Params.push({ Key: 3, Value: $scope.item.FilterUserId });
            }
            var options = {
                action: 'billing/GeneralExpenses/GetGeneralExpensess',
                data: inputData,
                type: 'post',
                onComplete: $scope.getVoucherListCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getVoucherListCallback = function (scope, res, options, hasError) {
            if (res && res.Data) {
                for (var idx in res.Data) {
                    var voucherdetail = res.Data[idx];
                    var UserName = ''; var UserId = -1;
                    if (voucherdetail.RequestedUser && voucherdetail.RequestedUser.Title &&
                        voucherdetail.RequestedUser.Title.Description) {
                        UserName += '' + voucherdetail.RequestedUser.Title.Description;
                    }
                    if (voucherdetail.RequestedUser && voucherdetail.RequestedUser.FirstName) {
                        UserName += ' ' + voucherdetail.RequestedUser.FirstName;
                    }
                    if (voucherdetail.RequestedUser && voucherdetail.RequestedUser.LastName) {
                        UserName += ' ' + voucherdetail.RequestedUser.LastName;
                    }
                    if (voucherdetail.UserId) {
                        UserId = voucherdetail.UserId;
                    }
                    if (UserName) {
                        if (!$scope.statementdata[UserName]) {
                            $scope.statementdata[UserName] = {};
                        }

                        if (!$scope.statementdata[UserName]['userid'])
                            $scope.statementdata[UserName]['userid'] = '';


                        if (!$scope.statementdata[UserName]['users'])
                            $scope.statementdata[UserName]['users'] = '';

                        $scope.statementdata[UserName]['users'] = UserName;
                        $scope.statementdata[UserName]['userid'] = UserId;

                        if (!$scope.statementdata[UserName]['voucher'])
                            $scope.statementdata[UserName]['voucher'] = 0;

                        $scope.statementdata[UserName]['voucher'] += voucherdetail.ExpenseAmount;

                    }
                }
                $scope.StatementAmt();
            }
        }

        $scope.getLHRCList = function () {
            var FrmDate = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd HH:mm:ss');
            var ToDate = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd HH:mm:ss');
            var inputData = {
                Params: [
                    { Key: 3, Value: FrmDate },
                    { Key: 4, Value: ToDate },
                    { Key: 6, Value: 2 }, //VoucherStatusId - Submit , Approved.
                    { Key: 7, Value: utl.Session.getCurrentFacilityId() },
                    { Key: 8, Value: 1 }
                    //{ Key: 5, Value: DepartmentUserIds },
                    //{ Key: 5, Value: $scope.item.FilterUserId }
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };
            if (DepartmentUserIds && DepartmentUserIds != null &&
                DepartmentUserIds != '' && DepartmentUserIds != undefined) {
                inputData.Params.push({ Key: 5, Value: DepartmentUserIds });
            }
            if ($scope.item.FilterUserId > 0 && $scope.item.FilterUserId != null &&
                $scope.item.FilterUserId != '' && $scope.item.FilterUserId != undefined) {
                inputData.Params.push({ Key: 5, Value: $scope.item.FilterUserId });
            }
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
                for (var idx in res.Data) {
                    var lhrcdetail = res.Data[idx];
                    var UserName = ''; var UserId = -1;
                    if (lhrcdetail.CreatedUser && lhrcdetail.CreatedUser.Title &&
                        lhrcdetail.CreatedUser.Title.Description) {
                        UserName += '' + lhrcdetail.CreatedUser.Title.Description;
                    }
                    if (lhrcdetail.CreatedUser && lhrcdetail.CreatedUser.FirstName) {
                        UserName += ' ' + lhrcdetail.CreatedUser.FirstName;
                    }
                    if (lhrcdetail.CreatedUser && lhrcdetail.CreatedUser.LastName) {
                        UserName += ' ' + lhrcdetail.CreatedUser.LastName;
                    }
                    if (lhrcdetail.CreatedBy) {
                        UserId = lhrcdetail.CreatedBy;
                    }
                    if (UserName) {
                        if (!$scope.statementdata[UserName]) {
                            $scope.statementdata[UserName] = {};
                        }

                        if (!$scope.statementdata[UserName]['userid'])
                            $scope.statementdata[UserName]['userid'] = '';


                        if (!$scope.statementdata[UserName]['users'])
                            $scope.statementdata[UserName]['users'] = '';

                        $scope.statementdata[UserName]['users'] = UserName;
                        $scope.statementdata[UserName]['userid'] = UserId;

                        if (!$scope.statementdata[UserName]['lhrc'])
                            $scope.statementdata[UserName]['lhrc'] = 0;

                        $scope.statementdata[UserName]['lhrc'] += lhrcdetail.VoucherAmount;

                    }
                }
                $scope.StatementAmt();
            }
        };


        $scope.StatementAmt = function () {
            $scope.StatementData = [];
            $scope.TotalCashInHand = 0;
            $scope.OverAllNetCash = 0;
            $scope.TotalCashAmount = 0;
            $scope.TotalCardAmount = 0;
            $scope.TotalOtherAmount = 0;
            $scope.TotalAmountDiff = 0;
            $scope.NetCashAmt = 0;
            for (var usridx in $scope.statementdata) {
                var usrdata = $scope.statementdata[usridx];

                if (!usrdata.cash) usrdata.cash = 0.00;
                if (!usrdata.card) usrdata.card = 0.00;
                if (!usrdata.others) usrdata.others = 0.00;
                if (!usrdata.lhrc) usrdata.lhrc = 0.00;
                if (!usrdata.voucher) usrdata.voucher = 0.00;

                let statementinfo = {
                    'Id': usrdata.id || 0,
                    'Name': usrdata.users,
                    'UserId': usrdata.userid,
                    'Cash': usrdata.cash || 0.00,
                    'Card': usrdata.card || 0.00,
                    'Others': usrdata.others || 0.00,
                    'LHRC': usrdata.lhrc || 0.00,
                    'Voucher': usrdata.voucher || 0.00,
                    'NetCash': ((usrdata.cash + usrdata.lhrc) - usrdata.voucher) || 0.00,
                    'ExcessShort': 0,
                };
                $scope.TotalCashInHand += ((usrdata.cash + usrdata.lhrc) - usrdata.voucher);;
                $scope.TotalCashAmount += usrdata.cash;
                $scope.TotalCardAmount += usrdata.card;
                $scope.TotalOtherAmount += usrdata.others;
                $scope.NetCashAmt += ((usrdata.cash + usrdata.lhrc) - usrdata.voucher);
                $scope.StatementData.push(statementinfo);
            }

            if ($scope.item.FetalAmount > 0) {
                $scope.OverAllNetCash = parseFloat($scope.TotalCashInHand) + parseFloat($scope.item.FetalAmount);
            } else {
                $scope.OverAllNetCash = parseFloat($scope.TotalCashInHand);
            }
            /* if (!$scope.item.FetalAmount) $scope.item.FetalAmount = 0;
            if ($scope.item.FetalAmount > 0) {
                $scope.TotalCashInHand = parseFloat($scope.TotalCashInHand) +
                    parseFloat($scope.item.FetalAmount);
                $scope.TotalCashAmount = parseFloat($scope.TotalCashAmount) +
                    parseFloat($scope.item.FetalAmount);
                $scope.NetCashAmt = parseFloat($scope.NetCashAmt) +
                    parseFloat($scope.item.FetalAmount);
            } */
        }



        $scope.checkDatesAlreadyExist = function () {
            var actionName = 'billing/bankstatements/DatesAlreadyExist';
            $scope.item.OpeningDate = $scope.currentfilter.FromBillDate;
            $scope.item.ClosingDate = $scope.currentfilter.ToBillDate;
            var inputData = { Header: $scope.item };
            var options = {
                action: actionName,
                data: { Data: inputData },
                type: 'post',
                onComplete: $scope.AlreadyExistCallback,
                onError: $scope.AlreadyExistCallback
            };
            utl.Http.doAction(options);
        }
        $scope.AlreadyExistCallback = function (scope, data, options, hasError) {
            if (data) {
                utl.Alert.showErrorMsg('From Date and To Date is Already Exist');
                return;
            }
            $scope.Submit();
        };

        $scope.Submit = function () {

            if ($scope.item.DenominationsNetTotal <= 0) {
                utl.Alert.showErrorMsg('Enter the Denomination Amount');
                return false;
            }

            $scope.item.OpeningDate = $scope.currentfilter.FromBillDate;
            $scope.item.ClosingDate = $scope.currentfilter.ToBillDate;
            $scope.item.OpeningCash = $scope.TotalCashInHand;
            $scope.item.OpeningCard = $scope.TotalCardAmount;
            $scope.item.OpeningCheque = $scope.TotalOtherAmount;
            $scope.item.ClosingCash = $scope.TotalCashAmount;
            $scope.item.ClosingCard = $scope.TotalCardAmount;
            $scope.item.ClosingCheque = $scope.TotalOtherAmount;
            $scope.item.SubmittedStatus = true;
            $scope.item.SubmitedBy = utl.Session.getCurrentUserId();
            $scope.item.BillingCounterStatusId = 3;

            if ($scope.item.FilterDepartmentId && $scope.item.FilterDepartmentId > 0) {
                $scope.item.DepartmentId = $scope.item.FilterDepartmentId;
            }

            if ($scope.item.FilterUserId && $scope.item.FilterUserId > 0) {
                $scope.item.UserId = $scope.item.FilterUserId;
            }

            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'billing.billingcounters.submitmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onSubmitConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.onSubmitConfirmed = function () {
            $scope.item.BillingCounterStatusId = 3;
            $scope.saveItem();
        };

        $scope.saveItem = function () {
            var _denominations = getDenominationsForSave();
            var _cancellations = getCancellationsForSave();
            var actionName = 'billing/bankstatements/AddBankStatements';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'billing/bankstatements/UpdateBankStatements';
            }
            var inputData = { Header: $scope.item, Details: $scope.StatementData, Denominations: _denominations, Cancellations: _cancellations };
            var options = {
                action: actionName,
                data: { Data: inputData },
                type: 'post',
                onComplete: $scope.saveItemCallback,
                onError: $scope.errorItemCallback
            };
            utl.Http.doAction(options);
        };



        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.currentcontext.id = data;
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


        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'User') {
                    //$scope.item.UserName = value[0].Title.Description + ' ' + value[0].FirstName + ' ' + value[0].LastName;
                    $scope.item.UserName = value[0].FirstName + ' ' + value[0].LastName;
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
            if ($scope.currentcontext.id) {
                $scope.LoadOldData();
            }
        };

        $scope.LoadOldData = function () {
            if ($scope.currentcontext.id) {
                var inputData = {
                    Params: [
                        { Key: 0, Value: $scope.currentcontext.id },
                    ],
                    PageContext: {
                        PageSize: -1,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'billing/bankstatements/GetBankStatements',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getLoadOldDataCallback
                };
                utl.Http.doAction(options);
            }
        }

        $scope.getLoadOldDataCallback = function (scope, res, options, hasError) {
            if (res && res.Data) {
                for (var idx in res.Data) {
                    var bankstatementinfo = res.Data[idx];
                    ////console.log(bankstatementinfo);
                    $scope.DefinedDenominations = bankstatementinfo.BankStatementDenominations;
                    $scope.UserCounterCancelledReceipts = bankstatementinfo.BankStatementCancellations;
                    $scope.StatementData = bankstatementinfo.BankStatementDetails;
                    $scope.item = bankstatementinfo;
                    $scope.currentfilter.FromBillDate = $scope.item.OpeningDate;
                    $scope.currentfilter.ToBillDate = $scope.item.ClosingDate;
                    $scope.currentfilter.DisableFromBillDate = true;
                    $scope.currentfilter.DisableToBillDate = true;
                    $scope.item.FilterDepartmentId = bankstatementinfo.DepartmentId;
                    $scope.item.FilterUserId = bankstatementinfo.UserId;
                }
                $scope.CalculateLoadedData();
            }
        }

        $scope.CalculateLoadedData = function () {
            $scope.TotalCashInHand = 0;
            $scope.TotalCashAmount = 0;
            $scope.TotalCardAmount = 0;
            $scope.TotalOtherAmount = 0;
            $scope.NetCashAmt = 0;
            for (var idx in $scope.StatementData) {
                var lineitem = $scope.StatementData[idx];
                $scope.TotalCashInHand += ((lineitem.Cash + lineitem.LHRC) - lineitem.Voucher);;
                $scope.TotalCashAmount += lineitem.Cash;
                $scope.TotalCardAmount += lineitem.Card;
                $scope.TotalOtherAmount += lineitem.Others;
                $scope.NetCashAmt += ((lineitem.Cash + lineitem.LHRC) - lineitem.Voucher);
            }
            /* if($scope.item && $scope.item.FetalAmount > 0) {
                $scope.NetCashAmt = parseFloat($scope.NetCashAmt) + parseFloat($scope.item.FetalAmount);
            } */
            if ($scope.item.FetalAmount > 0) {
                $scope.OverAllNetCash = parseFloat($scope.TotalCashInHand) + parseFloat($scope.item.FetalAmount);
            } else {
                $scope.OverAllNetCash = parseFloat($scope.TotalCashInHand);
            }
            $scope.CalculateNetTotal();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Denomination", Default: false },
                {
                    "Key": "Department",
                    Request: {
                        Params: [
                            { Key: 3, Value: 2 }
                        ]
                    }
                },
                { "Key": "User" }
            ];

            /* var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options); */
            $scope.getLookUp(inputData);
        };

        $scope.getLookUp = function (inputData) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getDepartmentUsers = function () {
            var inputData = [{
                "Key": "User",
                Request: {
                    Params: [
                        { Key: 6, Value: $scope.item.FilterDepartmentId }
                    ]
                }
            }];
            $scope.getLookUp(inputData);
            $scope.getDepartmentUserIds($scope.item.FilterDepartmentId);
        };

        $scope.getDepartmentUserIdsCallBack = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                DepartmentUserIds = Array();
                for (var idx in data.Data) {
                    DepartmentUserIds.push(data.Data[idx].Id);
                }
                $scope.getList();
            }
        };

        $scope.getDepartmentUserIds = function (DepartmentId) {
            var inputData = {
                Params: [
                    { Key: 6, Value: DepartmentId }
                ],
                PageContext: { PageSize: -1, PageNumber: 1 }
            };

            var options = {
                action: 'SystemSettings/User/GetUsers',
                data: inputData,
                type: 'post',
                onComplete: $scope.getDepartmentUserIdsCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.initLookup();
    }

    bankstatementFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();