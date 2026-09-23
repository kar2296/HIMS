(function () {
    'use strict';

    /**
     * Hollow controller shared by the React EMR admin screens
     * (src/react-components/emr-admin/): EMR Panel Selection, EMR Form Builder, EMR Panel Editor.
     * It only exposes session context and navigation; data loading lives in React.
     */
    angular
        .module('app.pages')
        .controller('emrAdminController', emrAdminController);

    function emrAdminController($scope, $state, utl) {
        $scope.reactProps = {
            userId: parseInt(utl.Session.getCurrentUserId(), 10) || 0,
            facilityId: parseInt(utl.Session.getCurrentFacilityId(), 10) || 0
        };

        // Called from React event handlers (outside a digest), hence $applyAsync.
        $scope.navigateTo = function (stateName, params) {
            $scope.$applyAsync(function () {
                $state.go(stateName, params || {});
            });
        };
    }

    emrAdminController.$inject = ['$scope', '$state', 'utl'];
})();
