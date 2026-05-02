(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('wardmasterTabController', wardmasterTabController);

    function wardmasterTabController($rootScope, $scope, $stateParams, $state, $translate, $timeout) {

        //$scope.setPageTitle($scope.i18n.appmanager.usertab.pagetitle.lbl);

        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

        $scope.tabs = [
            { title: $translate.instant('generalmaster.wardmastertab.tabdetails.lbl'), state: 'app.wardtab.detail', canDisable: false },
            { title: $translate.instant('generalmaster.wardmastertab.tabuser.lbl'), state: 'app.wardtab.user', canDisable: canDisableTab },
            { title: $translate.instant('generalmaster.wardmastertab.tabroom.lbl'), state: 'app.wardtab.room', canDisable: canDisableTab },
            { title: $translate.instant('Ward Insurance Tariff'), state: 'app.wardtab.insurancetariff', canDisable: canDisableTab }
        ];
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.addNew = function () {
            $state.go('app.wardtab.detail', {
                id: 0
            });
        }
        $scope.switchTab = function (tab) {
            $state.go(tab.state);
        }
    }

    wardmasterTabController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', '$timeout'];
})();