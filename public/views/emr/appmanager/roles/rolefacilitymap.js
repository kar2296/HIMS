(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('roleFacilityMapController', roleFacilityMapController);

    function roleFacilityMapController($scope, $stateParams, $state) {
        $scope.currentcontext = {
            id: parseInt($stateParams.id) || 0
        };

        $scope.handleReactAction = function (actionName, payload) {
            if (actionName === 'back') {
                $state.go('app.roletab.general', { id: $scope.currentcontext.id });
            }
        };
    }

    roleFacilityMapController.$inject = ['$scope', '$stateParams', '$state'];
})();