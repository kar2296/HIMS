(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('roleTabController', roleTabController);

    function roleTabController($rootScope, $scope, $stateParams, $state, $translate, $timeout) {
        var canDisableTab = parseInt($stateParams.id) === 0;

        $scope.tabs = [
            {
                title: $translate.instant('appmanager.roletab.tabgeneral.lbl') || 'General',
                state: 'app.roletab.general',
                canDisable: false,
                icon: 'fa-id-card'
            },
            {
                title: $translate.instant('appmanager.roletab.tabrolefacilitymap.lbl') || 'Facilities',
                state: 'app.roletab.facility',
                canDisable: canDisableTab,
                icon: 'fa-hospital'
            },
            {
                title: $translate.instant('appmanager.roletab.tabspecialprivilege.lbl') || 'Special Privileges',
                state: 'app.roletab.roleprivileges',
                canDisable: canDisableTab,
                icon: 'fa-key'
            },
            {
                title: $translate.instant('appmanager.roletab.tabmobileconfig.lbl') || 'Mobile Config',
                state: 'app.roletab.mobileappconfig',
                canDisable: canDisableTab,
                icon: 'fa-mobile-alt'
            }
        ];

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            if ($rootScope.app && $rootScope.app.layout) {
                $rootScope.app.layout.isCollapsed = true;
            }
        }

        $scope.backToList = function () {
            $state.go('app.roles');
        };

        $scope.switchTab = function (tab) {
            if (!canDisableTab && tab && tab.state) {
                $state.go(tab.state);
            }
        };

        $scope.addNew = function () {
            $state.go('app.roletab.general', { id: 0 });
        };

        // React bridge
        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                roleId: parseInt($stateParams.id) || 0,
                roleCode: $stateParams.code || '',
                activeState: $state.current.name,
                tabs: $scope.tabs
            };
        };

        $scope.handleReactAction = function (actionName, payload) {
            if (actionName === 'addNew') {
                $scope.addNew();
            } else if (actionName === 'backToList' || actionName === 'back') {
                $scope.backToList();
            } else if (actionName === 'switchTab') {
                if (payload && payload.tab) {
                    $scope.switchTab(payload.tab);
                } else if (payload && payload.state) {
                    $state.go(payload.state);
                }
            }
        };

        $scope.refreshReactProps();

        var stateWatcher = $rootScope.$on('$stateChangeSuccess', function () {
            $scope.refreshReactProps();
        });
        $scope.$on('$destroy', function () {
            if (stateWatcher) stateWatcher();
        });
    }

    roleTabController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', '$timeout'];
})();