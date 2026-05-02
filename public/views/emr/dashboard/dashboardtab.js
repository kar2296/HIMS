(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('dashboardTabController', dashboardTabController);

    function dashboardTabController($scope, $stateParams, $state, $translate) {

        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

        $scope.tabs = [
            { title: $translate.instant('dashboard.gloomsoftdashboard.lbl'), state: 'app.dashboardtab.dashboard', canDisable: false },
            { title: $translate.instant('dashboard.inventorydashboard.lbl'), state: 'app.dashboardtab.inventorydashboard', canDisable: false },

        ];

        $scope.backToList = function () {
            $state.go('');
        }

        $scope.switchTab = function (tab) {

            $state.go(tab.state);

        }
    }

    dashboardTabController.$inject = ['$scope', '$stateParams', '$state', '$translate'];
})();