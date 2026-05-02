(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('facilityTabController', facilityTabController);

    function facilityTabController($rootScope, $scope, $stateParams, $state, $translate, $timeout) {

        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

        $scope.tabs = [{
            title: $translate.instant('appmanager.facilitytab.tabgeneral.lbl'),
            state: 'app.facilitytab.general',
            canDisable: false
        },
        //  {title : $translate.instant('appmanager.facilitytab.tabfacilitydeptmap.lbl'), state : 'app.facilitytab.department',  canDisable : canDisableTab},
        {
            title: $translate.instant('appmanager.facilitytab.tabdefaultservice.lbl'),
            state: 'app.facilitytab.defaultservice',
            canDisable: canDisableTab
        },
        {
            title: $translate.instant('appmanager.generalsetting.pagetitle.lbl'),
            state: 'app.facilitytab.printsetting',
            canDisable: canDisableTab
        },
        // {title: $translate.instant('appmanager.holidaysetting.pagetitle.lbl'), state : 'app.facilitytab.holidaysetting', canDisable : canDisableTab}
        {
            title: $translate.instant('SMS'),
            state: 'app.facilitytab.smssettings',
            canDisable: canDisableTab
        },
        {
            title: $translate.instant('Billing Setting'),
            state: 'app.facilitytab.billsetting',
            canDisable: canDisableTab
        },
        {
            title: $translate.instant('Auto Generation Code'),
            state: 'app.facilitytab.autogeneratecodesetting', canDisable: canDisableTab
        },

        ];
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.backToList = function () {
            $state.go('app.facilitys');
        }
        $scope.addNew = function () {
            $state.go('app.facilitytab.general', {
                id: 0
            });
        }
        $scope.switchTab = function (tab) {
            if (!canDisableTab) {
                $state.go(tab.state);
            }
        }
    }

    facilityTabController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', '$timeout'];
})();