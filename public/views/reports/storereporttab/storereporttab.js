(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('StoreTabReportController', StoreTabReportController);

    function StoreTabReportController($rootScope,$scope, $stateParams, $state, $translate,$timeout) {

        //$scope.setPageTitle($scope.i18n.appmanager.usertab.pagetitle.lbl);s

        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

        $scope.tabs = [
            {
                title: $translate.instant('reports.stockmanage.lbl'),
                state: 'app.storereporttab.stackmanagementreport',
                canDisable: canDisableTab
            },
            {
                title: $translate.instant('GST/TAX Reports'),
                state: 'app.storereporttab.taxgstreport',
                canDisable: false
            },
           {
                title: $translate.instant('reports.purchasemanage.lbl'),
                state: 'app.storereporttab.purchasemanagementreport',
                canDisable: canDisableTab
            },
            {
                title: $translate.instant('reports.billingmaster.lbl'),
                state: 'app.storereporttab.masterreport',
                canDisable: canDisableTab
            },
            {
                title: $translate.instant('General Store Report'),
                state: 'app.storereporttab.generalstorereport',
                canDisable: canDisableTab
            },
         ];
        $timeout(function () {
            removeFloatingNav();
        }, 100);
    
        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.addNew = function () {
            $state.go('app.storetabreport.stackmanagementreport', {
                id: 0
            });
        }
        $scope.backtoReport = function () {
            $state.go('app.storedashboard')
        }

        $scope.switchTab = function (tab) {
            if (!canDisableTab) {
                $state.go(tab.state);
            }
        }
    }

    StoreTabReportController.$inject = ['$rootScope','$scope', '$stateParams', '$state', '$translate', '$timeout'];
})();