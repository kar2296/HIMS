(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('EmrConsolidateTabController', EmrConsolidateTabController);

    function EmrConsolidateTabController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout) {
        $scope.currentcontext = {};

        $scope.tabs = [
            { title: $translate.instant('OP Bills'), state: 'patientemr.constab.opconsolidatedbills' },
            { title: $translate.instant('Pharmacy Bills'), state: 'patientemr.constab.pharmacyconsolidatedbills' },
        ];

        $scope.switchTab = function(tab) {
            $state.go(tab.state);
        };
        $scope.doctor_dashboard = function () {
            if ($scope.From == 'nursing') {
                $state.go('app.nursingdashboard');
            } else {
                $state.go('app.doctordashboard');
            }
        };

        $timeout(function() {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.switchTab($scope.tabs[0]);

    }

    EmrConsolidateTabController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];
})();