(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('CreditTabController', CreditTabController);

    function CreditTabController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout) {
        $scope.currentcontext = {};
        // var tabvm = this;
        // var canDisableTab = false;

        $scope.tabs = [
            { title: $translate.instant('OP Bills'), state: 'app.creditapprovaltab.creditapproval', billtype: 1 },
            { title: $translate.instant('IP Bills'), state: 'app.creditapprovaltab.creditapproval', billtype: 2 },
            { title: $translate.instant('Pharmacy Bills'), state: 'app.creditapprovaltab.creditapproval', billtype: 4 },
            { title: $translate.instant('Direct Bills'), state: 'app.creditapprovaltab.creditapproval', billtype: 5 },
        ];

        $scope.switchTab = function (tab, opt) {
            if ($state.current.name === tab.state && $stateParams.billtypeid == tab.billtype) {
                return;
            }
            $state.go(tab.state, {
                billtypeid: tab.billtype
            });
        };

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                tabs: $scope.tabs,
                activeBillTypeId: $stateParams && $stateParams.billtypeid ? Number($stateParams.billtypeid) : 1
            };
        };

        $scope.handleReactAction = function (actionName, payload) {
            switch (actionName) {
                case 'switchTab':
                    $scope.switchTab({ state: payload.state, billtype: payload.billtype }, 'reload');
                    break;
            }
            $scope.$applyAsync();
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
        if (!$stateParams.billtypeid || $state.current.name !== 'app.creditapprovaltab.creditapproval') {
            $scope.switchTab($scope.tabs[0]);
        }

        $scope.refreshReactProps();

    }

    CreditTabController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];
})();