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
            { title: $translate.instant('OP Bills') || 'OP Bills', state: 'app.consolidatetab.opconsolidatedbills', icon: 'fa-solid fa-stethoscope' },
            { title: $translate.instant('Pharmacy Bills') || 'Pharmacy Bills', state: 'app.consolidatetab.pharmacyconsolidatedbills', icon: 'fa-solid fa-prescription-bottle-medical' },
            { title: $translate.instant('All Bills') || 'All Bills', state: 'app.consolidatetab.allconsolidatedbills', icon: 'fa-solid fa-layer-group' }
        ];

        $scope.isTabActive = function (tab) {
            return $state.is(tab.state) || $state.includes(tab.state) || $state.current.name === tab.state;
        };

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
            if ($rootScope.app && $rootScope.app.layout) {
                $rootScope.app.layout.isCollapsed = true;
            }
        }

        if (!$state.current.name || $state.current.name === 'app.consolidatetab') {
            $scope.switchTab($scope.tabs[0]);
        }
    }

    ConsolidateTabController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];
})();