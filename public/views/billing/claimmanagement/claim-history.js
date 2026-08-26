(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('claimhistoryController', claimhistoryController);

    function claimhistoryController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            
        };

        $scope.currentcontext = {};
        if (modalConfig && modalConfig.params) {
            $scope.item = modalConfig.params.history;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        
        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                item: $scope.item
            };
        };
        $scope.refreshReactProps();
        
    }

    claimhistoryController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();