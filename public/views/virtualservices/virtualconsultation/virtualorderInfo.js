(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('VirtualOrderInfoController', VirtualOrderInfoController);

    function VirtualOrderInfoController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {};
        $scope.VirtualOrderDetails = [];
        $scope.currentcontext = {};
        $scope.currentcontext.oid = parseInt(modalConfig.params.id);
        $scope.Context = modalConfig.params.context;
        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;


        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data.Data[0];
            $scope.VirtualOrderDetails = $scope.item.VirtualOrderDetails;
        };

        $scope.getItem = function (pageNo) {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.currentcontext.oid
                }]
            }
            var options = {
                action: 'VirtualHealthcare/VirtualOrder/GetVirtualOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.backToList = function () {
            if ($scope.Context == 'order') {
                $scope.confirmCallback();
                $state.go('app.createorderdashboard');
            } else {
                $scope.confirmCallback();
            }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        };

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "VirtualOrderStatus"
                },
                {
                    "Key": "Department"
                }
            ]
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

    VirtualOrderInfoController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();