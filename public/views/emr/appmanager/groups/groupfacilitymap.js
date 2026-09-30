(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('groupFacilityMapController', groupFacilityMapController);

    function groupFacilityMapController($scope, $stateParams, $state, $translate, utl, $timeout) {
        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id) || 0;

        $scope.reactProps = {
            groupId: $scope.currentcontext.id
        };

        $scope.handleReactAction = function (actionName, payload) {
            $timeout(function () {
                if (actionName === 'backToForm') {
                    $state.go('app.grouptab.general', { id: $scope.currentcontext.id });
                } else if (actionName === 'saveComplete') {
                    utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
                }
            });
        };
    }

    groupFacilityMapController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];
})();