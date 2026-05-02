(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('paymodeTabController', paymodeTabController);

    function paymodeTabController($rootScope,$scope, $stateParams, $state, $translate, utl,$timeout) {
        $scope.currentcontext = {};
        var tabvm = this;
        var canDisableTab = false;

        $scope.tabs = [
            { title: $translate.instant('billing.paymodetab.tabadvrept.lbl'), state: 'app.paymodechange.tabadvrept', canDisable: canDisableTab },
            { title: $translate.instant('billing.paymodetab.tabop.lbl'), state: 'app.paymodechange.tabop', canDisable: canDisableTab },
            { title: $translate.instant('billing.paymodetab.tabpharmacy.lbl'), state: 'app.paymodechange.tabpharmacy', canDisable: canDisableTab },
        ];

        tabvm.currentcontext = {
            patientid: 0
        };

        $scope.switchTab = function (tab) {
            if (!tab.canDisable) {
                $state.go(tab.state);
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

    paymodeTabController.$inject = ['$rootScope','$scope', '$stateParams', '$state', '$translate', 'utl','$timeout'];
})();