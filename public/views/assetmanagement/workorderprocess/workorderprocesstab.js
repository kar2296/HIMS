(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('workorderProcessTabController', workorderProcessTabController);

    function workorderProcessTabController($scope, $stateParams, $state, $translate, utl) {

        $scope.tabs = [
            { title: $translate.instant('assetmanagement.workorderprocesstab.tabmyorders.lbl'), state: 'app.workorderprocesstab.processmyorders', canDisable: false },
            { title: $translate.instant('assetmanagement.workorderprocesstab.taballorders.lbl'), state: 'app.workorderprocesstab.processallorders', canDisable: false }
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
    workorderProcessTabController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();