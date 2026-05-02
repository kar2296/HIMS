(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('tallytabreportTabController', tallytabreportTabController);

    function tallytabreportTabController($rootScope,$scope, $stateParams, $state, $translate,$timeout) {

        //$scope.setPageTitle($scope.i18n.appmanager.usertab.pagetitle.lbl);

        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

        $scope.tabs = [{
                title: $translate.instant('Phramcy & Inventoryreport'),
                state: 'app.tallyreporttab.phramcy&inventoryreport',
                canDisable: false
            },
            {
                title: $translate.instant('OP'),
                state: 'app.tallyreporttab.opreport',
                canDisable: canDisableTab
            },
            {
                title: $translate.instant('IP'),
                state: 'app.tallyreporttab.ipreport',
                canDisable: canDisableTab
            },           
               ];
        $timeout(function () {
            removeFloatingNav();
        }, 100);
    
        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.backToList = function () {
            $state.go('app.users');
        }
        $scope.addNew = function () {
            $state.go('app.usertab.general', {
                id: 0
            });
        }

        $scope.switchTab = function (tab) {
            if (!canDisableTab) {
                $state.go(tab.state);
            }
        }
    }

    tallytabreportTabController.$inject = ['$rootScope','$scope', '$stateParams', '$state', '$translate', '$timeout'];
})();