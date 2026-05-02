(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('testProfileController', testProfileController);

    function testProfileController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            Name: ''
        };
        $scope.testanalyte = [];
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };
        $scope.currentcontext.tid = parseInt(modalConfig.params.tid);
        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;
        $scope.item.TestId = $scope.currentcontext.tid;

        $scope.getItemCallback = function(scope, data, options, hasError) {
            $scope.item = data;
            $scope.gettestanalytes();
        };

        $scope.getItem = function(pageNo) {

            var options = {
                action: 'lis/testmaster/GetTestmasterById',
                data: { Id: $scope.currentcontext.tid },
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.backToList = function() {
            $scope.confirmCallback();
        }
        $scope.gettestanalytesCallback = function(scope, res, options, hasError) {
            // if (data.length > 0) {
            $scope.testanalyte = res.Data;
        };

        $scope.gettestanalytes = function() {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentcontext.tid }
                ]
            };

            var options = {
                action: 'lis/testmaster/GetTestmasteranalytemaps',
                data: inputData,
                type: 'post',
                onComplete: $scope.gettestanalytesCallback
            };

            utl.Http.doAction(options);
        };

        function loadData() {
            $scope.getItem();
        }
        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function() {
            var inputData = [];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }
        $scope.initLookup();
        loadData();
    }

    testProfileController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();