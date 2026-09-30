(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('roleFormController', roleFormController);

    function roleFormController($scope, $stateParams, $state, $translate, utl) {
        $scope.currentcontext = {
            id: parseInt($stateParams.id) || 0
        };

        $scope.reactProps = {
            roleId: $scope.currentcontext.id,
            code: $stateParams.code || ''
        };

        $scope.handleReactAction = function (actionName, payload) {
            if (actionName === 'back') {
                $state.go('app.roles');
            } else if (actionName === 'saveComplete') {
                if (payload && payload.id) {
                    $state.go('app.roletab.general', { id: payload.id });
                } else {
                    $state.go('app.roles');
                }
            }
        };
    }

    roleFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();