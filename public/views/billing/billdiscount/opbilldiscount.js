(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('OPBillDiscountController', OPBillDiscountController);

    function OPBillDiscountController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.lookup = {};
        $scope.OPBills = [];
        $scope.currentcontext = {};
        $scope.currentfilter = {};
        $scope.currentfilter.FacilityId = utl.Session.getCurrentFacilityId();
        $scope.currentfilter.FromBillDate = $filter('date')(new Date(), 'yyyy-MM-dd 00:00:00');
        $scope.currentfilter.ToBillDate = $filter('date')(new Date(), 'yyyy-MM-dd 23:59:59');

        $scope.isLoading = false;

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.isLoading = false;
            $scope.OPBills = (res && res.Data) ? res.Data : [];
            $scope.refreshReactProps();
        };

        $scope.getList = function (pageNo) {
            $scope.isLoading = true;
            $scope.refreshReactProps();

            var billNumVal = $scope.currentfilter.BillNo || $scope.currentfilter.PatBillNum || null;

            var params = [{
                    Key: 49,
                    Value: billNumVal
                },
                {
                    Key: 4,
                    Value: 3
                },
                {
                    Key: 17,
                    Value: $scope.currentfilter.FromBillDate
                },
                {
                    Key: 18,
                    Value: $scope.currentfilter.ToBillDate
                },
                {
                    Key: 6,
                    Value: 1
                },
                {
                    Key: 8,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 11,
                    Value: true
                }
            ];

            if ($scope.currentfilter.PatientId) {
                params.push({
                    Key: 0,
                    Value: $scope.currentfilter.PatientId
                });
            }

            var inputData = {
                Params: params
            };

            var options = {
                action: 'billing/patientbills/GetPatientBills',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.editPatBills = function (billinfo) {
            if (billinfo.Id) {
                utl.Modal.open('app.opbilldiscount-form', {
                    params: {
                        id: billinfo.Id,
                        billnumber: billinfo.BillNumber
                    },
                    confirmCallback: $scope.getList
                });
            }
        };

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                currentfilter: $scope.currentfilter,
                rows: $scope.OPBills,
                isLoading: $scope.isLoading,
                facilityName: utl.Session.getCurrentFacilityName()
            };
        };

        $scope.handleReactAction = function (actionName, payload) {
            switch (actionName) {
                case 'fromDateChange':
                    $scope.currentfilter.FromBillDate = payload.value || null;
                    $scope.refreshReactProps();
                    break;
                case 'toDateChange':
                    $scope.currentfilter.ToBillDate = payload.value || null;
                    $scope.refreshReactProps();
                    break;
                case 'billNoChange':
                    $scope.currentfilter.BillNo = payload.value || '';
                    $scope.currentfilter.PatBillNum = payload.value || '';
                    $scope.refreshReactProps();
                    break;
                case 'patientChange':
                    $scope.currentfilter.PatientId = payload.patientId || null;
                    $scope.selectedPatient = payload.patient || null;
                    $scope.refreshReactProps();
                    break;
                case 'fetch':
                    $scope.getList();
                    break;
                case 'reset':
                    $scope.currentfilter.FromBillDate = $filter('date')(new Date(), 'yyyy-MM-dd 00:00:00');
                    $scope.currentfilter.ToBillDate = $filter('date')(new Date(), 'yyyy-MM-dd 23:59:59');
                    $scope.currentfilter.BillNo = '';
                    $scope.currentfilter.PatBillNum = '';
                    $scope.currentfilter.PatientId = null;
                    $scope.selectedPatient = null;
                    $scope.getList();
                    break;
                case 'edit':
                    $scope.editPatBills(payload);
                    break;
            }
            $scope.$applyAsync();
        };

        $scope.refreshReactProps();


        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "PaymentType"
                },
                {
                    "Key": "CardType"
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

        $scope.initLookup();


    }

    OPBillDiscountController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();