(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('mobileappconfigListController', mobileappconfigListController);

    function mobileappconfigListController($scope, $stateParams, $state) {
        $scope.currentcontext = {
            id: parseInt($stateParams.id) || 0
        };

        $scope.handleReactAction = function (actionName, payload) {
            if (actionName === 'back') {
                $state.go('app.roletab.general', { id: $scope.currentcontext.id });
            }
        };
    }

    mobileappconfigListController.$inject = ['$scope', '$stateParams', '$state'];
})();