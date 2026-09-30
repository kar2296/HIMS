(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('rolePrivilegeListController', rolePrivilegeListController);

    function rolePrivilegeListController($scope, $stateParams) {
        $scope.currentcontext = {
            id: parseInt($stateParams.id) || 0,
            code: $stateParams.code || ''
        };

        $scope.handleReactAction = function (actionName, payload) {
            // Handled internally in React
        };
    }

    rolePrivilegeListController.$inject = ['$scope', '$stateParams'];
})();