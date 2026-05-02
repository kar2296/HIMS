(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('storeWorkListTabController', storeWorkListTabController);

    function storeWorkListTabController($rootScope,$scope, $stateParams, $state, $translate, utl,$timeout) {

        var tabvm = this;
        var canDisableTab = false;

        $scope.tabs = [
            { title: $translate.instant('inventory.storeworklisttab.storeworklists.lbl'), state: 'app.storeworklisttab.storeworklists', canDisable: false },
            { title: $translate.instant('inventory.storeworklisttab.stocktransfers.lbl'), state: 'app.storeworklisttab.stocktransfers', canDisable: false }
        ];

        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }

        tabvm.currentcontext = {
            id: 0
        };

        $scope.switchTab = function (tab) {
            if (!canDisableTab) {
                $state.go(tab.state);
            }
        }
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.backtoList = function () {
            $state.go('app.storedashboard');
        }
    }

    storeWorkListTabController.$inject = ['$rootScope','$scope', '$stateParams', '$state', '$translate', 'utl','$timeout'];
})();
