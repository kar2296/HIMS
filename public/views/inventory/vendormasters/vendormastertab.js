(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('vendorMasterTabController', vendorMasterTabController);

    function vendorMasterTabController($rootScope,$scope, $stateParams, $state, $translate,$timeout) {

        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

        $scope.tabs = [
            { title: $translate.instant('inventory.vendormastertab.tabvendormaster.lbl'), state: 'app.vendormastertab.vendormaster', canDisable: false },
            //{ title: $translate.instant('inventory.vendormastertab.tabvendormastergst.lbl'), state: 'app.vendormastertab.vendormastergst', canDisable: canDisableTab },
            //{ title: $translate.instant('inventory.vendormastertab.tabvendormastererpmapping.lbl'), state: 'app.vendormastertab.vendormastererpmappings', canDisable: canDisableTab },
            //{ title: $translate.instant('inventory.vendormastertab.tabvendormastercontacts.lbl'), state: 'app.vendormastertab.vendormastercontacts', canDisable: canDisableTab },
            { title: $translate.instant('inventory.vendormastertab.tabvendormasterfacilitymapping.lbl'), state: 'app.vendormastertab.vendormasterfacilitymapping', canDisable: canDisableTab }
        ];

        $scope.backToList = function () {
            $state.go('app.vendormasters');
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
        }
    }

    vendorMasterTabController.$inject = ['$rootScope','$scope', '$stateParams', '$state', '$translate','$timeout'];
})();
