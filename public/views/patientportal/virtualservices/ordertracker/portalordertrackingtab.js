(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('portalordertrackingtabController', portalordertrackingtabController);

    function portalordertrackingtabController($rootScope, $scope, $stateParams, $state, $translate, $timeout) {

        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

        $scope.tabs = [{
                title: $translate.instant('Pending Orders'),
                state: 'patientportal.portalordertrackingtab.portalpendingorder',
                canDisable: false
            },
            {
                title: $translate.instant('Completed Orders'),
                state: 'patientportal.portalordertrackingtab.portalcompleteorder',
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
        }
    }

    portalordertrackingtabController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', '$timeout'];
})();