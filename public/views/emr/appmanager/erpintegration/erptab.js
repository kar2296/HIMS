(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('erpTabController', erpTabController);

    function erpTabController($scope, $stateParams, $state, $translate, utl) {

        $scope.tabs = [
            { title: $translate.instant('appmanager.erptab.outbound.lbl'), state: 'app.erptab.outbound', canDisable: false },
            { title: $translate.instant('appmanager.erptab.inbound.lbl'), state: 'app.erptab.inbound', canDisable: false },
            { title: $translate.instant('appmanager.eventdashboardtab.inbounderror.lbl'), state: 'app.erptab.inbounderror', canDisable: false },
            { title: $translate.instant('appmanager.eventdashboardtab.outbounderror.lbl'), state: 'app.erptab.outbounderror', canDisable: false },
             ];

        $scope.currentcontext = {
            childstate: $state.current.name
        };
        



        $scope.canActive = function (tab) {
            return tab.state == $scope.currentcontext.childstate;
        };

        $scope.switchTab = function (tab) {
            $state.go(tab.state);
        }
    }
    erpTabController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();