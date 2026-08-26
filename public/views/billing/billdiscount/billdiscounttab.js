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

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                tabs: $scope.tabs,
                activeState: $state.current.name
            };
        };

        $scope.handleReactAction = function (actionName, payload) {
            switch (actionName) {
                case 'switchTab':
                    var t = $scope.tabs.filter(function (x) { return x.state === payload.state; })[0];
                    if (t && !t.canDisable) {
                        $state.go(payload.state);
                    }
                    break;
            }
            $scope.$applyAsync();
        };

        $rootScope.$on('$stateChangeSuccess', function () {
            $scope.refreshReactProps();
        });
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.switchTab($scope.tabs[0]);

        $scope.refreshReactProps();

    }

    BillDiscountTabController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];
})();