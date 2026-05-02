(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('billingrequestlistController', billingrequestlistController);

    function billingrequestlistController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.lookup = {};
        $scope.DBDate = null;
        $scope.currentcontext = {};
        $scope.currentfilter = {};
        $scope.currentfilter.BillingRequestStatusId = 1;
        $scope.currentfilter.BillingRequestTypeId = 1;
        const today = new Date();
        $scope.currentfilter.FromBillDate = $filter('date')(new Date(today.setDate(today.getDate() - 6)), 'yyyy-MM-dd 00:00:00');
        $scope.currentfilter.ToBillDate = $filter('date')(new Date(), 'yyyy-MM-dd 23:59:59');
        $scope.currentfilter.UserId = -1;
        $scope.currentfilter.PatientId = -1;
        $scope.currentfilter.ReceiptNumber = null;
        $scope.PaymentDetails = null;

        $scope.getPaymentDetailListCallback = function(scope, res, options, hasError) {
            $scope.PaymentDetails = [];
            if (res && res.Data && res.Data.length > 0) {
                $scope.PaymentDetails = res.Data;
            }
        };

        $scope.getPaymentDetailList = function() {
            var FrmDate = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd HH:mm:ss');
            var ToDate = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd HH:mm:ss');
            var inputData = {
                Params: [{
                        Key: 8,
                        Value: $scope.currentfilter.BillingRequestTypeId
                    }, // receipt completed
                    {
                        Key: 9,
                        Value: $scope.currentfilter.BillingRequestStatusId
                    }, // OP
                    // {
                    //     Key: 1,
                    //     Value: FrmDate
                    // }, // From
                    // {
                    //     Key: 2,
                    //     Value: ToDate
                    // }, // To
                    {
                        Key: 18,
                        Value: FrmDate
                    }, // From
                    {
                        Key: 19,
                        Value: ToDate
                    }, // To
                    {
                        Key: 17,
                        Value: 1
                    },
                    {
                        Key: 6,
                        Value: utl.Session.getCurrentFacilityId()
                    },
                    {
                        Key: 20,
                        Value: false
                    },
                ],
                PageContext: {
                    PageSize: 1000000000,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'billing/BillingRequest/GetBillingRequests',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPaymentDetailListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getSystemDBDateCallback = function(scope, data, options, hasError) {
            if (data) {
                $scope.DBDate = data;
            }
            $scope.getPaymentDetailList();
        };

        $scope.getSystemDBDate = function() {
            var options = {
                action: 'billing/patientpaymentdetails/GetSystemDatetime',
                data: null,
                type: 'post',
                onComplete: $scope.getSystemDBDateCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getDateDiffInHours = function(Date1, Date2) {
            var startTime = new Date(Date1);
            var endTime = new Date(Date2);
            var difference = endTime.getTime() - startTime.getTime();
            var resultInHours = Math.round(difference / (1000 * 60 * 60));
            return resultInHours;
        }

        $scope.showPaymentChanger = function(item) {
            utl.Modal.open('app.paychanger', {
                params: {
                    items: item
                },
                confirmCallback: $scope.getPaymentDetailList
            });
        };
        $scope.EditBillingRequest = function(PaymentDetail) {
            if (PaymentDetail.Id) {
                utl.Modal.open('app.editbillingrequest', {
                    params: {
                        id: PaymentDetail.Id,
                        billnumber: PaymentDetail.BillNumber,
                        patientbillid: PaymentDetail.PatientBillId,
                        IsPartialCancel: PaymentDetail.IsPartialCancel
                    },
                    confirmCallback: $scope.getPaymentDetailList
                });
            }
        };

        $scope.paymodechange = function(PaymentDetail) {
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

        $scope.paymodechangeprint = function(PaymentDetail) {
            if (PaymentDetail && PaymentDetail.PatientBillId) {
                var inputData = {
                    Id: PaymentDetail.PatientBillId
                };
                var options = {
                    action: 'billing/patientbills/PrintPatientBills',
                    data: inputData,
                    type: 'post'
                };
                utl.Http.doDownload(options);
            }
        }

        $scope.getList = function() {
            var resultInHours = $scope.getDateDiffInHours(
                $scope.currentfilter.FromBillDate,
                $scope.currentfilter.ToBillDate
            );
            if (!(resultInHours >= 0 && resultInHours <= 168)) {
                utl.Alert.showSuccessMsg("From and To Date Difference should be less than 7 days...");
                $scope.currentfilter.FromBillDate = $filter('date')(new Date(), 'yyyy-MM-dd 00:00:00');
                $scope.currentfilter.ToBillDate = $filter('date')(new Date(), 'yyyy-MM-dd 23:59:59');
                return false;
            } else {
                $scope.getSystemDBDate();
            }
        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = data;
            $scope.getList();
        }

        $scope.initLookup = function() {
            var inputData = [{
                    "Key": "PaymentType"
                },
                {
                    "Key": "ReceiptType"
                },
                // {
                //     "Key": "User"
                // },
                // {
                //     "Key": "PaymentType"
                // },
                // {
                //     "Key": "Bank"
                // },
                {
                    "Key": "CardType"
                },
                // {
                //     "Key": "PrivateDueApprover"
                // },
                {
                    "Key": "SettlementType"
                },
                {
                    "Key": "Terminal"
                },
                {
                    "Key": "BillingRequestStatus"
                },
                {
                    "Key": "BillingRequestType"
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

        $scope.initLookup();


    }

    billingrequestlistController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();