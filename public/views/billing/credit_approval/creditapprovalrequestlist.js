(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('creditapprequestlistController', creditapprequestlistController);

    function creditapprequestlistController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.lookup = {};
        $scope.DBDate = null;
        $scope.currentcontext = {};
        $scope.currentfilter = {};
        $scope.currentfilter.CreditApprovalStatusId = 1;
        $scope.currentfilter.BillTypeId = 1;
        var defaultFrom = new Date();
        defaultFrom.setDate(defaultFrom.getDate() - 30);
        $scope.currentfilter.FromBillDate = $filter('date')(defaultFrom, 'yyyy-MM-dd 00:00:00');
        $scope.currentfilter.ToBillDate = $filter('date')(new Date(), 'yyyy-MM-dd 23:59:59');
        $scope.currentfilter.BillNo = '';
        $scope.currentfilter.UserId = -1;
        $scope.currentfilter.PatientId = -1;
        $scope.currentfilter.ReceiptNumber = null;
        $scope.PatientBills = null;

        console.log($stateParams);
        if($stateParams && $stateParams.billtypeid) {
            $scope.currentfilter.BillTypeId = Number($stateParams.billtypeid);
        }
        $scope.$on('$stateChangeSuccess', function(event, toState, toParams) {
            if (toParams && toParams.billtypeid && Number(toParams.billtypeid) !== $scope.currentfilter.BillTypeId) {
                $scope.currentfilter.BillTypeId = Number(toParams.billtypeid);
                $scope.refreshReactProps();
                $scope.getPatientBillList();
            }
        });
        $scope.getPatientBillListCallback = function(scope, res, options, hasError) {
            $scope.PatientBills = [];
            if (res && res.Data && Array.isArray(res.Data)) {
                $scope.PatientBills = res.Data;
            } else if (Array.isArray(res)) {
                $scope.PatientBills = res;
            }
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.getPatientBillList = function() {
            var params = [
                {
                    Key: 50,
                    Value: false
                } // IsPaidFully: false (Due bills)
            ];

            if ($scope.currentfilter.BillTypeId && Number($scope.currentfilter.BillTypeId) > 0) {
                params.push({
                    Key: 33,
                    Value: [Number($scope.currentfilter.BillTypeId)]
                });
            }

            var FrmDate = $scope.currentfilter.FromBillDate;
            var ToDate = $scope.currentfilter.ToBillDate;
            if (FrmDate) {
                if (typeof FrmDate === 'string' && FrmDate.length === 10) {
                    FrmDate = FrmDate + ' 00:00:00';
                }
                params.push({
                    Key: 17,
                    Value: $filter('date')(FrmDate, 'yyyy-MM-dd HH:mm:ss')
                });
            }
            if (ToDate) {
                if (typeof ToDate === 'string' && ToDate.length === 10) {
                    ToDate = ToDate + ' 23:59:59';
                }
                params.push({
                    Key: 18,
                    Value: $filter('date')(ToDate, 'yyyy-MM-dd HH:mm:ss')
                });
            }

            if ($scope.currentfilter.CreditApprovalStatusId && Number($scope.currentfilter.CreditApprovalStatusId) > 0) {
                params.push({
                    Key: 82,
                    Value: Number($scope.currentfilter.CreditApprovalStatusId)
                });
            }

            var facId = utl.Session.getCurrentFacilityId();
            if (!facId || facId <= 0) {
                facId = 1;
            }
            params.push({
                Key: 8,
                Value: facId
            });

            if ($scope.currentfilter.BillNo && $scope.currentfilter.BillNo.trim()) {
                params.push({
                    Key: 2,
                    Value: $scope.currentfilter.BillNo.trim()
                });
            }

            if ($scope.currentfilter.PrivateDueId && Number($scope.currentfilter.PrivateDueId) > 0) {
                params.push({
                    Key: 30,
                    Value: Number($scope.currentfilter.PrivateDueId)
                });
            }

            var inputData = {
                Params: params,
                PageContext: {
                    PageSize: 100000,
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
        };

        $scope.EditBillingRequest = function(PatientBill) {
            var billId = PatientBill.Id || PatientBill.PatientBillId;
            if (billId) {
                utl.Modal.open('app.editcreditapproval', {
                    params: {
                        id: billId,
                        pid: PatientBill.PatientId,
                        billnumber: PatientBill.BillNumber,
                        patientbillid: billId,
                        item: PatientBill
                    },
                    confirmCallback: $scope.getPatientBillList
                });
            }
        };

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                currentfilter: $scope.currentfilter,
                lookup: $scope.lookup,
                rows: $scope.PatientBills
            };
        };

        $scope.handleReactAction = function (actionName, payload) {
            payload = payload || {};
            switch (actionName) {
                case 'fromDateChange':
                    $scope.currentfilter.FromBillDate = payload.value ? (payload.value.length === 10 ? payload.value + ' 00:00:00' : payload.value) : null;
                    $scope.refreshReactProps();
                    break;
                case 'toDateChange':
                    $scope.currentfilter.ToBillDate = payload.value ? (payload.value.length === 10 ? payload.value + ' 23:59:59' : payload.value) : null;
                    $scope.refreshReactProps();
                    break;
                case 'billNoChange':
                    $scope.currentfilter.BillNo = payload.value;
                    $scope.refreshReactProps();
                    break;
                case 'billTypeChange':
                    $scope.currentfilter.BillTypeId = Number(payload.value);
                    $scope.refreshReactProps();
                    $scope.getPatientBillList();
                    break;
                case 'statusChange':
                    $scope.currentfilter.CreditApprovalStatusId = Number(payload.value);
                    $scope.refreshReactProps();
                    $scope.getPatientBillList();
                    break;
                case 'presetDates':
                    var now = new Date();
                    if (payload.preset === 'today') {
                        $scope.currentfilter.FromBillDate = $filter('date')(now, 'yyyy-MM-dd 00:00:00');
                        $scope.currentfilter.ToBillDate = $filter('date')(now, 'yyyy-MM-dd 23:59:59');
                    } else if (payload.preset === 'yesterday') {
                        var yest = new Date();
                        yest.setDate(yest.getDate() - 1);
                        $scope.currentfilter.FromBillDate = $filter('date')(yest, 'yyyy-MM-dd 00:00:00');
                        $scope.currentfilter.ToBillDate = $filter('date')(yest, 'yyyy-MM-dd 23:59:59');
                    } else if (payload.preset === 'last7days') {
                        var d7 = new Date();
                        d7.setDate(d7.getDate() - 7);
                        $scope.currentfilter.FromBillDate = $filter('date')(d7, 'yyyy-MM-dd 00:00:00');
                        $scope.currentfilter.ToBillDate = $filter('date')(now, 'yyyy-MM-dd 23:59:59');
                    } else if (payload.preset === 'last30days') {
                        var d30 = new Date();
                        d30.setDate(d30.getDate() - 30);
                        $scope.currentfilter.FromBillDate = $filter('date')(d30, 'yyyy-MM-dd 00:00:00');
                        $scope.currentfilter.ToBillDate = $filter('date')(now, 'yyyy-MM-dd 23:59:59');
                    } else if (payload.preset === 'all') {
                        var dAll = new Date();
                        dAll.setFullYear(dAll.getFullYear() - 2);
                        $scope.currentfilter.FromBillDate = $filter('date')(dAll, 'yyyy-MM-dd 00:00:00');
                        $scope.currentfilter.ToBillDate = $filter('date')(now, 'yyyy-MM-dd 23:59:59');
                    }
                    $scope.refreshReactProps();
                    $scope.getList();
                    break;
                case 'reset':
                    var dReset = new Date();
                    dReset.setDate(dReset.getDate() - 30);
                    $scope.currentfilter.FromBillDate = $filter('date')(dReset, 'yyyy-MM-dd 00:00:00');
                    $scope.currentfilter.ToBillDate = $filter('date')(new Date(), 'yyyy-MM-dd 23:59:59');
                    $scope.currentfilter.BillNo = '';
                    $scope.currentfilter.CreditApprovalStatusId = 1;
                    $scope.refreshReactProps();
                    $scope.getList();
                    break;
                case 'fetch':
                    $scope.getList();
                    break;
                case 'edit':
                    $scope.EditBillingRequest(payload.item || payload);
                    break;
            }
            $scope.$applyAsync();
        };

        $scope.getList = function() {
            if ($scope.currentfilter.FromBillDate && $scope.currentfilter.ToBillDate) {
                var d1 = new Date($scope.currentfilter.FromBillDate).getTime();
                var d2 = new Date($scope.currentfilter.ToBillDate).getTime();
                if (d1 > d2) {
                    utl.Alert.showSuccessMsg("From Date cannot be greater than To Date");
                    return false;
                }
            }
            $scope.getPatientBillList();
        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = data || {};
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.refreshReactProps();

        $scope.initLookup = function() {
            var inputData = [{
                    "Key": "PaymentType"
                },
                {
                    "Key": "ReceiptType"
                },
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
                    "Key": "CreditApprovalStatus"
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
        $scope.getPatientBillList();


    }

    creditapprequestlistController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();