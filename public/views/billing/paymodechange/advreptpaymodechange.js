(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('advreptPaymodeChangeFormController', advreptPaymodeChangeFormController);

    function advreptPaymodeChangeFormController($scope, $filter, $stateParams, $state, $translate, utl) {
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

        $scope.getPaymentDetailListCallback = function(scope, res, options, hasError) {
            $scope.PaymentDetails = [];
            if (res && res.Data && res.Data.length > 0) {
                $scope.PaymentDetails = res.Data;
            }
            $scope.refreshReactProps();
        };

        $scope.getPaymentDetailList = function() {

            var inputData = {
                Params: [{
                        Key: 4,
                        Value: [1, 2]
                    }, // Advance / Receipt
                    {
                        Key: 5,
                        Value: 1
                    }, // receipt completed
                    {
                        Key: 11,
                        Value: 2
                    }, // IP
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
                    { Key: 26, Value: utl.Session.getCurrentFacilityId() }
                    // { Key: 20, Value: true } // with patient info
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

        $scope.showPaymentChanger = function(item) {
            utl.Modal.open('app.paychanger', {
                params: {
                    items: item
                },
                confirmCallback: $scope.getPaymentDetailList
            });
        };

        $scope.getEncounterCallback = function(scope, data, options, hasError) {
            var Encounter = data;
            if (Encounter.EncounterTypeId == 2) { // IP
                if (!Encounter.IsBillLock && !Encounter.IsBillFinalized) {
                    $scope.showPaymentChanger(options.data.PaymentDetail);
                } else {
                    var IPErrorMSG = "IP Bill is Locked or Finalized, So We Cannnot change the paymode";
                    utl.Alert.showErrorMsg(IPErrorMSG);
                    return false;
                }
            } else { // OP

            }
        };

        $scope.getEncounterInfo = function(PaymentDetail) {
            if (PaymentDetail && PaymentDetail.EncounterId > 0) {
                var options = {
                    action: 'Visit/Visit/GetEncounterById',
                    data: {
                        Id: PaymentDetail.EncounterId,
                        PaymentDetail: PaymentDetail
                    },
                    type: 'post',
                    onComplete: $scope.getEncounterCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getDateDiffInHours = function(Date1, Date2) {
            if (!Date1 || !Date2) return 0;
            var startTime = new Date(Date1);
            var endTime = new Date(Date2);
            if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) return 0;
            var difference = endTime.getTime() - startTime.getTime();
            var resultInHours = Math.round(difference / (1000 * 60 * 60));
            return resultInHours;
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
                $scope.getEncounterInfo(PaymentDetail);
            } else {
                utl.Alert.showErrorMsg("Above 24 Hours we cannot change the paymode");
                return false;
            }
        }

        $scope.paymodechangeprint = function(PaymentDetail) {
            if (PaymentDetail && PaymentDetail.Id) {
                var inputData = {
                    Id: PaymentDetail.Id
                };
                var options = {
                    action: 'Billing/PatientPaymentDetails/PrintPatientPaymentDetails',
                    data: inputData,
                    type: 'post'
                };
                utl.Http.doDownload(options);
            }
        }

        $scope.getList = function() {
            if (!$scope.currentfilter.FromBillDate || !$scope.currentfilter.ToBillDate) {
                utl.Alert.showErrorMsg("Please select From Date and To Date");
                return false;
            }
            var resultInHours = $scope.getDateDiffInHours(
                $scope.currentfilter.FromBillDate,
                $scope.currentfilter.ToBillDate
            );
            if (resultInHours < 0) {
                utl.Alert.showErrorMsg("From Date cannot be greater than To Date");
                return false;
            }
            var hasSpecificFilter = Boolean(
                $scope.currentfilter.ReceiptNumber ||
                $scope.currentfilter.BillNo ||
                ($scope.currentfilter.PatientId && $scope.currentfilter.PatientId > 0)
            );
            if (resultInHours > 72 && !hasSpecificFilter) {
                utl.Alert.showErrorMsg("From and To Date Difference should be less than or equal to 3 days");
                return false;
            }
            $scope.getSystemDBDate();
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
                    if (payload && payload.value) {
                        var dateStr = typeof payload.value === 'string' ? payload.value.slice(0, 10) : $filter('date')(payload.value, 'yyyy-MM-dd');
                        $scope.currentfilter.FromBillDate = dateStr + ' 00:00:00';
                    } else {
                        $scope.currentfilter.FromBillDate = null;
                    }
                    $scope.refreshReactProps();
                    break;
                case 'toBillDateChange':
                    if (payload && payload.value) {
                        var dateStr = typeof payload.value === 'string' ? payload.value.slice(0, 10) : $filter('date')(payload.value, 'yyyy-MM-dd');
                        $scope.currentfilter.ToBillDate = dateStr + ' 23:59:59';
                    } else {
                        $scope.currentfilter.ToBillDate = null;
                    }
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

    advreptPaymodeChangeFormController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();