(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('investigationtrackingtabController', investigationtrackingtabController);

    function investigationtrackingtabController($rootScope, $scope, $stateParams, $state, $translate, $timeout) {

        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

        $scope.tabs = [{
                title: $translate.instant('Pending Orders'),
                state: 'app.investigationtrackingtab.pendingorder',
                canDisable: false
            },
            {
                title: $translate.instant('Completed Orders'),
                state: 'app.investigationtrackingtab.completeorder',
                canDisable: canDisableTab
            },
            {
                title: $translate.instant('All Orders'),
                state: 'app.investigationtrackingtab.allorder',
                canDisable: canDisableTab
            },
        ];
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.home = function () {
            $state.go('patientportal.virtualhealthcare');
        }

        $scope.switchTab = function (tab) {
            if (!canDisableTab) {
                $state.go(tab.state);
            }
        };

        function updateActiveTab() {
            for (var i = 0; i < $scope.tabs.length; i++) {
                $scope.tabs[i].active = $state.includes($scope.tabs[i].state) || $state.is($scope.tabs[i].state);
            }
        }

        $scope.$on('$stateChangeSuccess', updateActiveTab);
        $timeout(updateActiveTab, 50);
    }

    investigationtrackingtabController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', '$timeout'];
})();