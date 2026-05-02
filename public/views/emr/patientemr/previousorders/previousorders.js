(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('previousordersListController', previousordersListController);

    function previousordersListController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.PreviousOrderDetails = [];

        $scope.currentcontext = {
            isModal: (modalConfig && modalConfig.params) ? true : false
        };

        $scope.currentfilter = {
            orderno: '',
            testname: '',
            fromdate: '',
            todate: ''
        }
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.eid = modalConfig.params.eid;
            $scope.currentcontext.pid = modalConfig.params.pid;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        } else {
            $scope.currentcontext.eid = parseInt($stateParams.eid);
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        }
        $scope.currentcontext.testList = [];

        //getList
        $scope.custom_sort = function (a, b) {
            return new Date(b.BillDateTime).getTime() - new Date(a.BillDateTime).getTime();
        }
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.PreviousOrderDetails = [];
            if (res.length > 0)
                res.sort($scope.custom_sort);
            for (var idx in res) {
                var item = res[idx];
                if (!options.data.Data.isPharmacy) {
                    if (!item.IsPharmacySale && !item.IsPharmacyReturn) {
                        $scope.PreviousOrderDetails.push(item)
                    }
                } else {
                    $scope.PreviousOrderDetails.push(item)
                }
            }

        };
        $scope.getList = function (pharmacy) {
            var fromdate = $filter('date')($scope.currentfilter.fromdate, 'yyyy-MM-dd 00:00:00');
            var todate = $filter('date')($scope.currentfilter.todate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Data: {
                    isPharmacy: pharmacy,
                    // includeOrder: 1
                },
                Params: [
                    { Key: 3, Value: $scope.currentcontext.eid },
                    { Key: 11, Value: $scope.currentfilter.BillNo },
                    { Key: 8, Value: $scope.currentfilter.ServiceName },
                    // { Key: 5, Value: $scope.currentfilter.ServiceCategoryId },
                    { Key: 38, Value: pharmacy }
                ]
            };
            if (fromdate)
                inputData.Params.push({ Key: 6, Value: fromdate })
            if (todate)
                inputData.Params.push({ Key: 7, Value: todate })
            if ($scope.currentfilter.ServiceCategoryId > 0) {
                inputData.Params.push({ Key: 5, Value: $scope.currentfilter.ServiceCategoryId });
            }
            var options = {
                action: 'billing/PatientBillDetails/GetPreviousOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
        }

        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.eid
            };
            var options = {
                action: 'emr/patientorder/PrintPatientOrders',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
        $('#billno').focus();
        //Lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList(false);
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "ServiceCategory" }
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }
        $scope.initLookup();
        // $scope.getList();
    }

    previousordersListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();