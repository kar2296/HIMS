(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('otSurgeryController', otSurgeryController);

    function otSurgeryController($scope, $stateParams, $state, $translate, utl, $filter, $uibModalInstance, modalConfig) {
        var vm = this;

        vm.orders = [];

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false,
        };

        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.eid = parseInt($stateParams.eid);
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        if ($stateParams.context)
            $scope.currentcontext.context = $stateParams.context;

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = modalConfig.params.id;
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        //getList
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.orders = res.Data;
            $scope.otregister = vm.orders
            // prepareTestResult();
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 0, Value: $scope.currentcontext.id },
                ]
            };
            var options = {
                action: 'OtManagement/SurgeryEntry/GetSurgeryEntrys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.backToList = function () {
            if ($scope.currentcontext.context == 'dashboard')
                $state.go('patientemr.emrotregisters');
            else
            $state.go('patientemr.otregisters');
        }
        $scope.print = function () {

            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'OtManagement/OtRegister/PrintOtRegister',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
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

    otSurgeryController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$uibModalInstance', 'modalConfig'];

})();