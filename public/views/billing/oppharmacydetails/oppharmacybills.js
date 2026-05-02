(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('OpPharmacyBillsController', OpPharmacyBillsController);

    function OpPharmacyBillsController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.PharmacyBillDetails = [];
        $scope.PharmacyRetBillDetails = [];
        $scope.TotalAmount = 0;
        $scope.RetTotalAmount = 0;


        $scope.currentcontext = {
            isModal: (modalConfig && modalConfig.params) ? true : false
        };

        $scope.currentcontext.summaryview = 0;

        $scope.currentfilter = {
            orderno: '',
            testname: '',
            fromdate: '',
            todate: ''
        };

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.eid = modalConfig.params.eid;
            $scope.currentcontext.pid = modalConfig.params.pid;
            $scope.currentcontext.summaryview = modalConfig.params.summaryview;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        } else {
            $scope.currentcontext.eid = parseInt($stateParams.eid);
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        }

        if (!$scope.currentcontext.summaryview)
            $scope.currentcontext.summaryview = 0;

        $scope.custom_sort = function (a, b) {
            return new Date(b.BillDateTime).getTime() - new Date(a.BillDateTime).getTime();
        };

        $scope.retcustom_sort = function (a, b) {
            return new Date(b.ReturnDateTime).getTime() - new Date(a.ReturnDateTime).getTime();
        };

        $scope.getReturnListCallback = function (scope, res, options, hasError) {
            if (res.length > 0)
                res.sort($scope.retcustom_sort);
            $scope.PharmacyRetBillDetails = res.Data;
            var totalamount = 0;
            for (var billidx in res.Data) {
                var retbillitem = res.Data[billidx];
                totalamount += retbillitem.ReturnAmount;
            }
            $scope.RetTotalAmount = totalamount;

            if ($scope.RetTotalAmount && $scope.RetTotalAmount > 0) {
                $scope.TotalAmount -= $scope.RetTotalAmount;
            }

        };

        $scope.getRetrunList = function () {
            var inputData = {
                Params: [
                    { Key: 6, Value: [1, 2, 3, 4] },
                    { Key: 16, Value: $scope.currentcontext.eid },
                    { Key: 4, Value: 3 }
                ]
            };
            var options = {
                action: 'billing/patientreturns/GetPatientReturns',
                data: inputData,
                type: 'post',
                onComplete: $scope.getReturnListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            if (res.length > 0)
                res.sort($scope.custom_sort);
            $scope.PharmacyBillDetails = res.Data;
            var totalamount = 0;
            for (var billidx in res.Data) {
                var billitem = res.Data[billidx];
                totalamount += billitem.BillAmount;
            }
            $scope.TotalAmount = totalamount;
            $scope.getRetrunList();
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 6, Value: 4 },
                    { Key: 16, Value: $scope.currentcontext.eid },
                    { Key: 21, Value: true }
                ]
            };
            var options = {
                action: 'billing/PatientBills/GetPatientBills',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        };

        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
        };

        $scope.oppharmacyprint = function () {
            var inputData = {
                Id: $scope.currentcontext.eid,
                Data: {
                    isprint: false,
                    BillType: 4,
                }
            };
            var options = {
                action: 'billing/patientbills/PrintOPPharmacyBillsforIP',
                data: inputData,
                type: 'post'
            };

            utl.Http.doDownload(options);
        };

        $('#billno').focus();

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [{ "Key": "ServiceCategory" }];

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

    OpPharmacyBillsController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();