(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('newgeneralvendorMasterTabController', newgeneralvendorMasterTabController);

    function newgeneralvendorMasterTabController($rootScope,$scope, $stateParams, $state, $translate,$timeout) {

        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

        $scope.tabs = [
            { title: $translate.instant('Supplier Detail(General)'), state: 'app.newvendormastertabgeneral.vendormastergeneral', canDisable: false },
            { title: $translate.instant('inventory.vendormastertab.tabvendormasterfacilitymapping.lbl'), state: 'app.newvendormastertabgeneral.vendormasterfacilitymappinggeneral', canDisable: canDisableTab }
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

    newgeneralvendorMasterTabController.$inject = ['$rootScope','$scope', '$stateParams', '$state', '$translate','$timeout'];
})();
