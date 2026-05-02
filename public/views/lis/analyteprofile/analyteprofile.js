(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('analyteprofileController', analyteprofileController);

    function analyteprofileController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            Name: ''
        };
        $scope.analyte = [];
        $scope.analyteref = {};
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };
        $scope.currentcontext.aid = parseInt(modalConfig.params.aid);

        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;

        $scope.item.AnalyteId = $scope.currentcontext.aid;

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.getanalyteref();
        };

        $scope.getItem = function (pageNo) {

            var options = {
                action: 'lis/analytemaster/GetAnalytemasterById',
                data: { Id: $scope.item.AnalyteId },
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        };
        $scope.getanalyterefsCallback = function (scope, data, options, hasError) {
            $scope.analyteref = data.Data[0];
        };

        $scope.getanalyteref = function () {

            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.aid },
                ]
            };

            var options = {
                action: 'lis/analytemaster/GetAnalyterefmasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getanalyterefsCallback
            };

            utl.Http.doAction(options);
        };
        $scope.backToList = function () {
            $scope.confirmCallback();
        }
        function loadData() {
            $scope.getItem();
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "OrderStatus" }
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
        loadData();
    }

    analyteprofileController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();