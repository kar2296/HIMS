(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('RejectReasonController', RejectReasonController);

    function RejectReasonController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
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

        $scope.savereason = function () {
            $scope.confirmCallback($scope.item);
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
        }

        $scope.initLookup = function () {
            var inputData = [
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
        // loadData();
    }

    RejectReasonController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();