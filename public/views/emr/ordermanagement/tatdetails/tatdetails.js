(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('tatDetailsController', tatDetailsController);

    function tatDetailsController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            Name: ''
        };
        $scope.ordertat = [];
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };
        $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
        $scope.currentcontext.oid = parseInt(modalConfig.params.oid);
        $scope.currentcontext.odid = parseInt(modalConfig.params.odid);
        $scope.currentcontext.TestId = parseInt(modalConfig.params.tid);
        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.ordertat = res.Data;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 4, Value: $scope.currentcontext.pid },
                    { Key: 5, Value: $scope.currentcontext.oid },
                    { Key: 6, Value: $scope.currentcontext.odid },
                    // { Key: 7, Value: $scope.currentcontext.TestId }
                ],
            };

            var options = {
                action: 'lis/ordertat/GetOrderTATs',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.backToList = function () {
            $scope.confirmCallback();
        }

        function loadData() {
            $scope.getList();
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                // { "Key": "OrderStatus" }
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

    tatDetailsController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();