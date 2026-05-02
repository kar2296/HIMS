(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patcancelreasonController', patcancelreasonController);

    function patcancelreasonController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            Name: ''
        };
        $scope.ordertat = [];
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };
        $scope.currentcontext.oid = parseInt(modalConfig.params.oid);
        $scope.currentcontext.item = modalConfig.params.item;
        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;

        $scope.savereason = function () {
            $scope.currentcontext.item.CancelReason = $scope.item.CancelReason;
            $scope.confirmCallback($scope.currentcontext.item);
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
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
        $scope.initLookup();
        // loadData();
    }

    patcancelreasonController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();