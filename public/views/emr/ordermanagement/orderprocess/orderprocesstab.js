(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('orderProcessTabController', orderProcessTabController);

    function orderProcessTabController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        $scope.currentcontext = {};
        // $scope.currentcontext.CanDashboard = utl.Privilege.hasPrivilege('CanDashboard')
        $scope.backtoList = function () {
            $state.go('app.labdashboard');
        };
        $scope.tabs = [{
                title: $translate.instant('ordermanagement.orderprocesstasb.tabmyorders.lbl'),
                state: 'app.orderprocesstab.processmyorders',
                canDisable: false
            },
            {
                title: $translate.instant('ordermanagement.orderprocesstasb.taballorders.lbl'),
                state: 'app.orderprocesstab.processallorders',
                canDisable: false
            },
            {
                title: $translate.instant('ordermanagement.orderprocesstasb.otherfacility.lbl'),
                state: 'app.orderprocesstab.processotherfacilityorders',
                canDisable: false
            }
        ];

        $scope.currentcontext = {
            childstate: $state.current.name,
            TestTypeId: $stateParams.tp ? parseInt($stateParams.tp) : -1,
        };

        $scope.canActive = function (tab) {
            return tab.state == $scope.currentcontext.childstate;
        };
        $scope.dashboard = function () {
            if ($scope.currentcontext.TestTypeId == 1)
                $state.go('app.lisdashboard');
            else if ($scope.currentcontext.TestTypeId == 2)
                $state.go('app.risdashboard');
        };

        $scope.switchTab = function (tab) {
            $state.go(tab.state);
        }
    }

    orderProcessTabController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();