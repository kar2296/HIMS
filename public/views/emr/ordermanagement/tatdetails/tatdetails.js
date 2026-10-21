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
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.pid = modalConfig.params.pid ? parseInt(modalConfig.params.pid) : null;
            $scope.currentcontext.oid = modalConfig.params.oid ? parseInt(modalConfig.params.oid) : null;
            $scope.currentcontext.odid = modalConfig.params.odid ? parseInt(modalConfig.params.odid) : null;
            $scope.currentcontext.TestId = modalConfig.params.tid ? parseInt(modalConfig.params.tid) : null;
        }

        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;

        $scope.isLoading = false;

        function updateReactProps() {
            $scope.reactProps = {
                ordertat: $scope.ordertat || [],
                isLoading: !!$scope.isLoading,
                currentcontext: $scope.currentcontext
            };
        }

        $scope.handleReactAction = function (actionName, payload) {
            switch (actionName) {
                case 'close':
                    if ($scope.cancelCallback) {
                        $scope.cancelCallback();
                    }
                    break;
                case 'refresh':
                    $scope.getList();
                    break;
                default:
                    break;
            }
            $scope.$applyAsync();
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.ordertat = (res && res.Data) ? res.Data : [];
            $scope.isLoading = false;
            updateReactProps();
        };

        $scope.getList = function () {
            $scope.isLoading = true;
            updateReactProps();

            var params = [];
            if ($scope.currentcontext.pid) params.push({ Key: 4, Value: $scope.currentcontext.pid });
            if ($scope.currentcontext.oid) params.push({ Key: 5, Value: $scope.currentcontext.oid });
            if ($scope.currentcontext.TestId) params.push({ Key: 7, Value: $scope.currentcontext.TestId });

            var inputData = {
                Params: params,
                PageContext: {
                    PageSize: 500,
                    PageNumber: 1
                }
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
        updateReactProps();
        loadData();
    }

    tatDetailsController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();