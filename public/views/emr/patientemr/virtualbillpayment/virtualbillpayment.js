(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('VirtualBillPaymentController', VirtualBillPaymentController);

    function VirtualBillPaymentController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        $scope.PendingBills = [];
        $scope.currentfilter = {
            BillDate: utl.Formatter.getCurrentDate()
        };
        $scope.currentcontext = {};
        if ($stateParams.pid)
            $scope.currentcontext.pid = $stateParams.pid;
        else {
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        }

        $scope.getPendingBillsCallback = function (scope, res, options, hasError) {
            $scope.PendingBills = res.Data;
        };

        $scope.getPendingBills = function () {
            var From = $filter('date')($scope.currentfilter.BillDate, 'yyyy-MM-dd 00:00:00');
            var To = $filter('date')($scope.currentfilter.BillDate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [{
                        Key: 3,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 1,
                        Value: 2
                    },
                    {
                        Key: 5,
                        Value: From
                    },
                    {
                        Key: 6,
                        Value: To
                    },
                    {
                        Key: 7,
                        Value: false
                    },
                ],
            };

            var options = {
                action: 'VirtualHealthcare/VirtualBill/GetVirtualBills',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPendingBillsCallback
            };

            utl.Http.doAction(options);
        };

        $scope.viewinfo = function (item) {
            utl.Modal.open('patientemr.virtualbillinfo', {
                params: {
                    id: item.Id,
                    pid: item.PatientId,
                    context: 'info'
                },
                confirmCallback: $scope.getPendingBills
            });
        };

        $scope.paymentcollect = function (item) {
            utl.Modal.open('patientemr.virtualbillpaymentform', {
                params: {
                    id: item.Id,
                    pid: item.PatientId
                },
                confirmCallback: $scope.getPendingBills
            });
        }


        $scope.doctor_dashboard = function () {
            $state.go('app.virtualdashboard');
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getPendingBills();
        };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Title"
            }, ]
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

    VirtualBillPaymentController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();