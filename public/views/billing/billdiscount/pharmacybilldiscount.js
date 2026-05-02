(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PharmacybillDiscountController', PharmacybillDiscountController);

    function PharmacybillDiscountController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.lookup = {};
        $scope.OPBills = [];
        $scope.currentcontext = {};
        $scope.currentfilter = {};
        $scope.currentfilter.FacilityId = utl.Session.getCurrentFacilityId();
        $scope.currentfilter.FromBillDate = $filter('date')(new Date(), 'yyyy-MM-dd 00:00:00');
        $scope.currentfilter.ToBillDate = $filter('date')(new Date(), 'yyyy-MM-dd 23:59:59');

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.OPBills = res.Data;
        };

        $scope.getList = function (pageNo) {
            // var FrmDate = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00');
            // var ToDate = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [{
                        Key: 49,
                        Value: $scope.currentfilter.PatBillNum
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
                        Value: 4
                    },
                    {
                        Key: 8,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 11,
                        Value: true
                    }
                ]
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
                utl.Modal.open('app.pharmacybilldiscount-form', {
                    params: {
                        id: billinfo.Id,
                        billnumber: billinfo.BillNumber,
                        patientid: billinfo.PatientId
                    },
                    confirmCallback: $scope.getList
                });
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

    PharmacybillDiscountController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();