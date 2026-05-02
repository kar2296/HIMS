(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ConsolidateTabController', ConsolidateTabController);

    function ConsolidateTabController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout) {
        $scope.currentcontext = {};
        var tabvm = this;
        var canDisableTab = false;

        $scope.tabs = [
            { title: $translate.instant('OP Bills'), state: 'app.consolidatetab.opconsolidatedbills' },
            { title: $translate.instant('Pharmacy Bills'), state: 'app.consolidatetab.pharmacyconsolidatedbills' },
            { title: $translate.instant('All Bills'), state: 'app.consolidatetab.allconsolidatedbills' },
        ];

        $scope.switchTab = function (tab) {
            $state.go(tab.state);
        };
        $scope.doctor_dashboard = function () {
            if ($scope.From == 'nursing') {
                $state.go('app.nursingdashboard');
            } else {
                $state.go('app.doctordashboard');
            }
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.switchTab($scope.tabs[0]);

    }

    ConsolidateTabController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];
})();