(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('facilityTabController', facilityTabController);

    function facilityTabController($rootScope, $scope, $stateParams, $state, $translate, $timeout) {

        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

        $scope.tabs = [{
            title: $translate.instant('appmanager.facilitytab.tabgeneral.lbl') || 'General',
            state: 'app.facilitytab.general',
            canDisable: false,
            icon: 'fa-hospital'
        },
        {
            title: $translate.instant('appmanager.facilitytab.tabdefaultservice.lbl') || 'Default Service',
            state: 'app.facilitytab.defaultservice',
            canDisable: canDisableTab,
            icon: 'fa-concierge-bell'
        },
        {
            title: $translate.instant('appmanager.generalsetting.pagetitle.lbl') || 'General Setting',
            state: 'app.facilitytab.printsetting',
            canDisable: canDisableTab,
            icon: 'fa-cog'
        },
        {
            title: $translate.instant('SMS') || 'SMS',
            state: 'app.facilitytab.smssettings',
            canDisable: canDisableTab,
            icon: 'fa-comment-alt'
        },
        {
            title: $translate.instant('Billing Setting') || 'Billing Setting',
            state: 'app.facilitytab.billsetting',
            canDisable: canDisableTab,
            icon: 'fa-file-invoice-dollar'
        },
        {
            title: $translate.instant('Auto Generation Code') || 'Auto Generation Code',
            state: 'app.facilitytab.autogeneratecodesetting',
            canDisable: canDisableTab,
            icon: 'fa-barcode'
        },
        {
            title: $translate.instant('Barcode Master Setting') || 'Barcode Master Setting',
            state: 'app.facilitytab.barcodesetting',
            canDisable: canDisableTab,
            icon: 'fa-qrcode'
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
            $state.go('app.facilitys');
        };

        $scope.addNew = function () {
            $state.go('app.facilitytab.general', {
                id: 0
            });
        };

        $scope.switchTab = function (tab) {
            if (!canDisableTab && tab && tab.state) {
                $state.go(tab.state);
            }
        };

        // React bridge
        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                facilityId: parseInt($stateParams.id) || 0,
                facilityName: $stateParams.FacilityName || '',
                activeState: $state.current.name,
                tabs: $scope.tabs
            };
        };

        $scope.handleReactAction = function (actionName, payload) {
            if (actionName === 'addNew') {
                $scope.addNew();
            } else if (actionName === 'backToList') {
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

    facilityTabController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', '$timeout'];
})();