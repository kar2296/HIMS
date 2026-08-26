(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('opPaymodeChangeFormController', opPaymodeChangeFormController);

    function opPaymodeChangeFormController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.lookup = {};
        $scope.DBDate = null;
        $scope.currentcontext = {};
        $scope.currentfilter = {};
        $scope.currentfilter.FromBillDate = $filter('date')(new Date(), 'yyyy-MM-dd 00:00:00');
        $scope.currentfilter.ToBillDate = $filter('date')(new Date(), 'yyyy-MM-dd 23:59:59');
        $scope.currentfilter.UserId = -1;
        $scope.currentfilter.PatientId = -1;
        $scope.currentfilter.ReceiptNumber = null;
        $scope.PaymentDetails = null;

        $scope.getPaymentDetailListCallback = function (scope, res, options, hasError) {
            $scope.PaymentDetails = [];
            if (res && res.Data && res.Data.length > 0) {
                $scope.PaymentDetails = res.Data;
            }
            $scope.refreshReactProps();
        };

        $scope.getPaymentDetailList = function () {

            var inputData = {
                Params: [{
                    Key: 30,
                    Value: [2, 3]
                }, // Receipt
                {
                    Key: 5,
                    Value: 1
                }, // receipt completed
                {
                    Key: 11,
                    Value: [1, 4]
                }, // OP
                {
                    Key: 13,
                    Value: false
                }, // IsPharmacyReceipt
                {
                    Key: 19,
                    Value: $scope.currentfilter.UserId
                },
                {
                    Key: 22,
                    Value: $scope.currentfilter.BillNo
                },
                { Key: 26, Value: utl.Session.getCurrentFacilityId() } // with patient info
                ],
                PageContext: {
                    PageSize: 1000000000,
                    PageNumber: 1
                }
            };
            if ($scope.currentfilter.ReceiptNumber) {
                inputData.Params.push({
                    Key: 1,
                    Value: $scope.currentfilter.ReceiptNumber
                });
            }
            if ($scope.currentfilter.PatientId) {
                inputData.Params.push({
                    Key: 2,
                    Value: $scope.currentfilter.PatientId
                });
            }

            var FrmDate = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd HH:mm:ss');
            var ToDate = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd HH:mm:ss');
            if (FrmDate || ToDate) {
                inputData.Params.push({
                    Key: 3,
                    Value: [FrmDate, ToDate]
                });
            }

            var options = {
                action: 'billing/patientpaymentdetails/GetPatientPaymentDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPaymentDetailListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getSystemDBDateCallback = function (scope, data, options, hasError) {
            if (data) {
                $scope.DBDate = data;
            }
            $scope.getPaymentDetailList();
        };

        $scope.getSystemDBDate = function () {
            var options = {
                action: 'billing/patientpaymentdetails/GetSystemDatetime',
                data: null,
                type: 'post',
                onComplete: $scope.getSystemDBDateCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getDateDiffInHours = function (Date1, Date2) {
            var startTime = new Date(Date1);
            var endTime = new Date(Date2);
            var difference = endTime.getTime() - startTime.getTime();
            var resultInHours = Math.round(difference / (1000 * 60 * 60));
            return resultInHours;
        }

        $scope.showPaymentChanger = function (item) {
            utl.Modal.open('app.paychanger', {
                params: {
                    items: item
                },
                confirmCallback: $scope.getPaymentDetailList
            });
        };

        $scope.paymodechange = function (PaymentDetail) {
            var resultInHours = $scope.getDateDiffInHours(
                PaymentDetail.ReceiptDateTime,
                $scope.DBDate
            );
            var paymodechangehours = 24;
            var strpaymodechangehours =
                utl.FacilitySetting.getFacilitySettingValue('billing', 'paymodechangehours');
            try {
                paymodechangehours = parseInt(strpaymodechangehours);
            } catch (ex) {
                paymodechangehours = 24;
            }
            if (resultInHours >= 0 && resultInHours <= paymodechangehours) {
                $scope.showPaymentChanger(PaymentDetail);
            } else {
                utl.Alert.showErrorMsg("Above 24 Hours we cannot change the paymode");
                return false;
            }
        }

        $scope.paymodechangeprint = function (PaymentDetail) {
            if (PaymentDetail && PaymentDetail.PatientBillId) {
                var inputData = {
                    Id: PaymentDetail.PatientBillId,
                    Data: {
                        withHeader: true,
                    }
                };
                var options = {
                    action: 'billing/patientbills/PrintPatientBills',
                    data: inputData,
                    type: 'post'
                };
                utl.Http.doDownload(options);
            }
        }

        $scope.getList = function () {
            var resultInHours = $scope.getDateDiffInHours(
                $scope.currentfilter.FromBillDate,
                $scope.currentfilter.ToBillDate
            );
            if (!(resultInHours >= 0 && resultInHours < 72)) {
                utl.Alert.showSuccessMsg("From and To Date Difference should be less than 3 days...");
                $scope.currentfilter.FromBillDate = $filter('date')(new Date(), 'yyyy-MM-dd 00:00:00');
                $scope.currentfilter.ToBillDate = $filter('date')(new Date(), 'yyyy-MM-dd 23:59:59');
                return false;
            } else {
                $scope.getSystemDBDate();
            }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "PaymentType"
            },
            {
                "Key": "ReceiptType"
            },
            // {
            //     "Key": "User"
            // },
            {
                "Key": "PaymentType"
            },
            {
                "Key": "Bank"
            },
            {
                "Key": "CardType"
            },
            {
                "Key": "PrivateDueApprover"
            },
            {
                "Key": "SettlementType"
            },
            {
                "Key": "Terminal"
            }
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
                currentfilter: $scope.currentfilter,
                PaymentDetails: $scope.PaymentDetails
            };
        };

        $scope.handleReactAction = function (actionName, payload) {
            switch (actionName) {
                case 'fromBillDateChange':
                    $scope.currentfilter.FromBillDate = payload.value ? new Date(payload.value) : null;
                    $scope.refreshReactProps();
                    break;
                case 'toBillDateChange':
                    $scope.currentfilter.ToBillDate = payload.value ? new Date(payload.value) : null;
                    $scope.refreshReactProps();
                    break;
                case 'filterFieldChange':
                    $scope.currentfilter[payload.key] = payload.value;
                    $scope.refreshReactProps();
                    if (payload.autoRefetch) {
                        $scope.getPaymentDetailList();
                    }
                    break;
                case 'fetch':
                    $scope.getList();
                    break;
                case 'edit':
                    $scope.paymodechange(payload.item);
                    break;
                case 'print':
                    $scope.paymodechangeprint(payload.item);
                    break;
            }
            $scope.$applyAsync();
        };

        $scope.refreshReactProps();
        $scope.initLookup();


    }

    opPaymodeChangeFormController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();