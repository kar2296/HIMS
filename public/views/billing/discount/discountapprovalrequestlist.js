(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('discountapprequestlistController', discountapprequestlistController);

    function discountapprequestlistController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.lookup = {};
        $scope.DBDate = null;
        $scope.currentcontext = {};
        $scope.currentfilter = {};
        $scope.currentfilter.DiscountApprovalStatusId = 1;
        $scope.currentfilter.BillTypeId = 1;
        $scope.currentfilter.FromBillDate = $filter('date')(new Date(), 'yyyy-MM-dd 00:00:00');
        $scope.currentfilter.ToBillDate = $filter('date')(new Date(), 'yyyy-MM-dd 23:59:59');
        $scope.currentfilter.UserId = -1;
        $scope.currentfilter.PatientId = -1;
        $scope.currentfilter.ReceiptNumber = null;
        $scope.PatientBills = null;

        $scope.getPatientBillListCallback = function(scope, res, options, hasError) {
            $scope.PatientBills = [];
            if (res && res.Data && res.Data.length > 0) {
                $scope.PatientBills = res.Data;
            }
        };

        $scope.getPatientBillList = function() {
            var FrmDate = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd HH:mm:ss');
            var ToDate = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd HH:mm:ss');
            var inputData = {
                Params: [
                    {
                        Key: 75,
                        Value: $scope.currentfilter.DiscountApprovalStatusId
                    }, // receipt completed
                    {
                        Key: 33,
                        Value: [$scope.currentfilter.BillTypeId]
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
                        Key: 17,
                        Value: FrmDate
                    }, // From
                    {
                        Key: 18,
                        Value: ToDate
                    }, // To
                    // {
                    //     Key: 17,
                    //     Value: 2
                    // },
                    {
                        Key: 8,
                        Value: utl.Session.getCurrentFacilityId()
                    },
                    {
                        Key: 55,
                        Value: utl.Session.getCurrentUserId()
                    },
                ],
                PageContext: {
                    PageSize: 1000000000,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'billing/PatientBills/GetPatientBillswithoutdetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientBillListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getSystemDBDateCallback = function(scope, data, options, hasError) {
            if (data) {
                $scope.DBDate = data;
            }
            $scope.getPatientBillList();
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

        $scope.EditBillingRequest = function(PatientBill) {
            if (PatientBill.Id) {
                utl.Modal.open('app.editdiscountapproval', {
                    params: {
                        id: PatientBill.Id,
                        pid: PatientBill.PatientId,
                        billnumber: PatientBill.BillNumber,
                        patientbillid: PatientBill.PatientBillId,
                        item: PatientBill
                    },
                    confirmCallback: $scope.getPatientBillList
                });
            }
        };



        $scope.getList = function() {
            var resultInHours = $scope.getDateDiffInHours(
                $scope.currentfilter.FromBillDate,
                $scope.currentfilter.ToBillDate
            );
            if (!(resultInHours >= 0 && resultInHours <= 360)) {
                utl.Alert.showSuccessMsg("From and To Date Difference should be less than 15 days...");
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
                {
                    "Key": "PrivateDueApprover"
                },
                {
                    "Key": "BillType"
                },
                {
                    "Key": "DiscountApprovalStatus"
                },
                // {
                //     "Key": "SettlementType"
                // },
                // {
                //     "Key": "Terminal"
                // },
                // {
                //     "Key": "BillingRequestStatus"
                // },
                // {
                //     "Key": "BillingRequestType"
                // },

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

    discountapprequestlistController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();