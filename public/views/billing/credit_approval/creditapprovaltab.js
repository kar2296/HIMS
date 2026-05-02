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
        ];

        $scope.switchTab = function (tab, opt) {
            if(opt && opt == 'reload') {
                $state.go(tab.state, {
                    billtypeid: tab.billtype
                });
            } else {
                $state.go(tab.state, {
                    billtypeid: tab.billtype
                });
            }

            // $state.reload(tab.state, {
            //     billtypeid: tab.billtype
            // });
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

    CreditTabController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];
})();