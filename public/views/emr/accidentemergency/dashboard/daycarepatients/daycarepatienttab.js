(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('daycarepatienttabController', daycarepatienttabController);

    function daycarepatienttabController($rootScope, $scope, $stateParams, $state, $translate, $timeout, utl) {
        var tabvm = this;
        //$scope.setPageTitle($scope.i18n.appmanager.usertab.pagetitle.lbl);
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;
        $scope.tabs = [];

        $scope.tabs.push({
            title: $translate.instant('A&E Patients'),
            state: 'app.daycarepatienttab.daycarepatients',
            canDisable: canDisableTab
        });
        $scope.tabs.push({
            title: $translate.instant('A&E Discharges'),
            state: 'app.daycarepatienttab.daycarepatientdischarge',
            canDisable: canDisableTab
        });

        $scope.doctor_dashboard = function() {
            $state.go('app.aedashboard');
        }
        $timeout(function() {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.switchTab = function(tab) {
            if (!canDisableTab) {
                $state.go(tab.state);
            }
        }
    }

    daycarepatienttabController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', '$timeout', 'utl'];
})();