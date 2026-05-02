(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('otdetailsController', otdetailsController);

    function otdetailsController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        vm.orders = [];

        $scope.currentcontext = {
        };
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.pid = parseInt(utl.Session.getPatientPortalPatientId());
        //getList
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.orders = res.Data;
            $scope.otregister = vm.orders
            // prepareTestResult();
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid },
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
            $state.go('patientportal.otregister');
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

    otdetailsController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();