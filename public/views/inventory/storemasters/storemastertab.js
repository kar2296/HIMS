(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('storeMasterTabController', storeMasterTabController);

    function storeMasterTabController($rootScope, $scope, $stateParams, $state, $translate, $timeout) {

        var canDisableTab = parseInt($stateParams.id) === 0 ? true : false;

        $scope.tabs = [{
                title: $translate.instant('inventory.storemastertab.tabstoremaster.lbl'),
                state: 'app.storemastertab.storemaster',
                canDisable: false
            },
            {
                title: $translate.instant('inventory.storemastertab.tabstoremasterusers.lbl'),
                state: 'app.storemastertab.storemasterusers',
                canDisable: canDisableTab
            },
            // { title: $translate.instant('inventory.storemastertab.tabstoremasterstaffdiscounts.lbl'), state: 'app.storemastertab.storemasterstaffdiscounts', canDisable: canDisableTab },
            // { title: $translate.instant('inventory.storemastertab.tabstoremastersettings.lbl'), state: 'app.storemastertab.storemastersettings', canDisable: canDisableTab },
            // { title: $translate.instant('inventory.storemastertab.tabstoremasterapprovalmatrix.lbl'), state: 'app.storemastertab.storemasterapprovalmatrixlist', canDisable: canDisableTab },
            {
                title: $translate.instant('inventory.storemastertab.tabstoreracks.lbl'),
                state: 'app.storemastertab.storeracklist',
                canDisable: canDisableTab
            },
            {
                title: $translate.instant('appmanager.generalsetting.pagetitle.lbl'),
                state: 'app.storemastertab.storepreference',
                canDisable: canDisableTab
            }
        ];

        $scope.backToList = function () {
            $state.go('app.storemasters');
        };
        $scope.addNew = function () {
            $state.go('app.storemastertab.storemaster', {
                id: 0
            });
        }
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.switchTab = function (tab) {
            if (!canDisableTab) {
                $state.go(tab.state);
            }
        };
    }

    storeMasterTabController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', '$timeout'];
})();