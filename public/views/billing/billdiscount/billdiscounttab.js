(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('BillDiscountTabController', BillDiscountTabController);

    function BillDiscountTabController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout) {
        $scope.currentcontext = {};
        var tabvm = this;
        var canDisableTab = false;

        $scope.tabs = [{
            title: $translate.instant('OP Bills'),
            state: 'app.billdscnttab.opbills',
            canDisable: canDisableTab
        },{
            title: $translate.instant('Pharmacy Bills'),
            state: 'app.billdscnttab.pharmacybills',
            canDisable: canDisableTab
        }];

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

    BillDiscountTabController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];
})();