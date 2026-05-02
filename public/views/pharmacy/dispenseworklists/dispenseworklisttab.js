(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('DispenseWorkListTabController', DispenseWorkListTabController);

    function DispenseWorkListTabController($scope, $stateParams, $state, $translate, utl) {

        var tabvm = this;
        var canDisableTab = false;

        $scope.tabs = [
            { title: $translate.instant('billing.dispenseworklisttab.pendingorders.lbl'), state: 'app.dispenseworklisttab.dispenseworklists', canDisable: false },
            { title: $translate.instant('billing.dispenseworklisttab.dispensedlist.lbl'), state: 'app.dispenseworklisttab.patientdispenses', canDisable: false }
        ];

        $scope.backToList = function () {
            $state.go('app.dispenseworklists');
        }

        tabvm.currentcontext = {
            id: 0
        };

        $scope.switchTab = function (tab) {
            if (!canDisableTab) {
                $state.go(tab.state);
            }
        }
    }

    DispenseWorkListTabController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();
