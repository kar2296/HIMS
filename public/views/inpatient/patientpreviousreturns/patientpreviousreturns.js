(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PreviousReturnsController', PreviousReturnsController);

    function PreviousReturnsController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
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
           // $scope.item.itemmasterid = modalConfig.params.itemmasterid;
            $scope.currentcontext.patientstockreturnid = modalConfig.params.patientstockreturnid;
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
            if (res.length > 0)
                res.sort($scope.custom_sort);
            $scope.previousordersDetails = res.Data;
        };
        $scope.getList = function () {
            // var fromdate = $filter('date')($scope.currentfilter.fromdate, 'yyyy-MM-dd 00:00:00');
            // var todate = $filter('date')($scope.currentfilter.todate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [
                    { Key: 5, Value: $scope.currentcontext.pid },
                    { Key: 16, Value: $scope.currentcontext.eid },
                ]
            };
            // if (fromdate)
            //     inputData.Params.push({ Key: 14, Value: From })
            // if (todate)
            //     inputData.Params.push({ Key: 15, Value: To })

            var options = {
                action: 'IPManagement/PatientStockReturns/GetPatientStockReturns',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.eid
            };
            var options = {
                action: 'emr/patientorder/PrintPatientOrders',
                data: inputData,
                type: 'post'
            };
            // utl.Http.doDownload(options);
        }
        $('#billno').focus();
        //Lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getDetails();
        }

        $scope.initLookup = function () {
            var inputData = [];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.getList();
    }

    PreviousReturnsController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();