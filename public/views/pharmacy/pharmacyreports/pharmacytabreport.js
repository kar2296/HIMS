(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PharmacyTabReportController', PharmacyTabReportController);

    function PharmacyTabReportController($rootScope,$scope, $stateParams, $state, $translate,$timeout) {

        //$scope.setPageTitle($scope.i18n.appmanager.usertab.pagetitle.lbl);s

        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

        $scope.tabs = [
            {
                title: $translate.instant('Invoice & Collection Reports'),
                state: 'app.pharmacytabreport.invoicecollectionreport',
                canDisable: canDisableTab
            },
            {
                title: $translate.instant('GST/TAX Reports'),
                state: 'app.pharmacytabreport.gsttaxreport',
                canDisable: false
            },
           {
                title: $translate.instant('reports.masterreport.lbl '),
                state: 'app.pharmacytabreport.masterreport',
                canDisable: canDisableTab
            },
            {
                title: $translate.instant('reports.stockmanage.lbl'),
                state: 'app.pharmacytabreport.stockmanagementreport',
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
            $state.go('app.pharmacytabreport.invoicecollectionreport', {
                id: 0
            });
        }
        $scope.backtoReport = function () {
            $state.go('app.pharmacydashboard', {
                id: 0
            });
        }

        $scope.switchTab = function (tab) {
            if (!canDisableTab) {
                $state.go(tab.state);
            }
        }
    }

    PharmacyTabReportController.$inject = ['$rootScope','$scope', '$stateParams', '$state', '$translate', '$timeout'];
})();