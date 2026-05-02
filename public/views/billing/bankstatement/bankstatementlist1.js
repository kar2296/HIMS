(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('backstatementListController', backstatementListController);

    function backstatementListController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.NetCashAmt = 0;

        $scope.TotalCashInHand = 0;
        $scope.TotalCashAmount = 0;
        $scope.TotalCardAmount = 0;
        $scope.TotalAmountDiff = 0;

        $scope.lookup = {};
        $scope.currentfilter = {
            FromBillDate: $filter('date')(new Date(), 'yyyy-MM-dd 00:00:00'),
            ToBillDate: $filter('date')(new Date(), 'yyyy-MM-dd 23:59:59')
        };

        $scope.item = {};
        $scope.StatementData = []

        $scope.TotalDnmsNumbers = 0.00;
        $scope.TotalDnmsAmount = 0.00;

        $scope.DefinedDenominations = [];


        $scope.numberonly = function (e) {
            if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
                // Allow: Ctrl+A, Command+A
                (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                // Allow: home, end, left, right, down, up
                (e.keyCode >= 35 && e.keyCode <= 40)) {
                // Let it happen, don't do anything
                return;
            }
            // Ensure that it is a number and stop the keypress && (e.keyCode < 96 || e.keyCode > 105)
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57))) {
                e.preventDefault();
            }
        };


        $scope.getList = function () {
            var FrmDate = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd HH:mm:ss');
            var ToDate = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd HH:mm:ss');
            var inputData = {
                Params: [
                    { Key: 3, Value: [FrmDate, ToDate] },
                    { Key: 5, Value: 1 }
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'billing/patientpaymentdetails/GetPatientPaymentDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);
        };


        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.statementdata = {};
            if (res && res.Data) {
                for (var idx in res.Data) {
                    var patientpaymentdetail = res.Data[idx];
                    var UserName = '';
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
                    if (UserName) {
                        if (!$scope.statementdata[UserName]) {
                            $scope.statementdata[UserName] = {};
                        }

                        if (!$scope.statementdata[UserName]['users'])
                            $scope.statementdata[UserName]['users'] = '';

                        $scope.statementdata[UserName]['users'] = UserName;

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
                        if (patientpaymentdetail.PaymentTypeId != 1 && patientpaymentdetail.PaymentTypeId != 5 && patientpaymentdetail.PaymentTypeId != 6) {
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

                $scope.StatementAmt();

            }
            $scope.getVoucherList();
        };

        $scope.getVoucherList = function () {
            var FrmDate = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd HH:mm:ss');
            var ToDate = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd HH:mm:ss');
            var inputData = {
                Params: [
                    { Key: 5, Value: FrmDate },
                    { Key: 6, Value: ToDate  },
                    { Key: 4, Value: 3  } //ExpenseStatusId - Approved.
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
            if (res && res.Data) {
                for (var idx in res.Data) {
                    var voucherdetail = res.Data[idx];
                    var UserName = '';
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
                    if (UserName) {
                        if (!$scope.statementdata[UserName]) {
                            $scope.statementdata[UserName] = {};
                        }

                        if (!$scope.statementdata[UserName]['users'])
                            $scope.statementdata[UserName]['users'] = '';

                        $scope.statementdata[UserName]['users'] = UserName;

                        if (!$scope.statementdata[UserName]['voucher'])
                            $scope.statementdata[UserName]['voucher'] = voucherdetail.ExpenseAmount;

                    }
                }
                $scope.StatementAmt();
            }
        }

        $scope.StatementAmt = function () {
            $scope.StatementData = [];
            $scope.TotalCashInHand = 0;
            $scope.TotalCashAmount = 0;
            $scope.TotalCardAmount = 0;
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
                    'users': usrdata.users,
                    'cash': usrdata.cash || 0.00,
                    'card': usrdata.card || 0.00,
                    'others': usrdata.others || 0.00,
                    'lhrc': usrdata.lhrc || 0.00,
                    'voucher': usrdata.voucher || 0.00,
                    'netcash': ((usrdata.cash + usrdata.lhrc) - usrdata.voucher) || 0.00,
                    'excessshort': 0,
                };
                $scope.TotalCashInHand += ((usrdata.cash + usrdata.lhrc) - usrdata.voucher);;
                $scope.TotalCashAmount += usrdata.cash;
                $scope.TotalCardAmount += usrdata.card;
                $scope.NetCashAmt += ((usrdata.cash + usrdata.lhrc) - usrdata.voucher);
                $scope.StatementData.push(statementinfo);
            }

            $scope.getTotalAmountDiff();

        }


        $scope.DenominationAmt = function (dnms) {
            if (!dnms.Number) dnms.Number = 0.00;
            dnms.Amount = dnms.Number * dnms.AMT;
        }

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
                $scope.TotalAmountDiff = (parseFloat($scope.TotalCashAmount)) - parseFloat($scope.item.DenominationsNetTotal);
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
            $scope.TotalAmountDiff = (parseFloat($scope.TotalCashAmount)) - parseFloat($scope.item.DenominationsNetTotal);
        };


        $scope.getTotalAmountDiff = function () {
            $scope.TotalAmountDiff = $scope.TotalDnmsAmount - $scope.TotalCashInHand;
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
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
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Denomination", Default: false },
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

    backstatementListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();