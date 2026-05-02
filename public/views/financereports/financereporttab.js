(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('financetabreportTabController', financetabreportTabController);

    function financetabreportTabController($rootScope,$scope, $stateParams, $state, $translate,$timeout) {

        //$scope.setPageTitle($scope.i18n.appmanager.usertab.pagetitle.lbl);

        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

        $scope.tabs = [{
                title: $translate.instant('reports.financetab1.lbl'),
                state: 'app.financereporttab.collectionsummary',
                canDisable: false
            },
            {
                title: $translate.instant('reports.financetab2.lbl'),
                state: 'app.financereporttab.revenuesummary',
                canDisable: canDisableTab
            },
            {
                title: $translate.instant('reports.financetab3.lbl'),
                state: 'app.financereporttab.pharmacyreport',
                canDisable: canDisableTab
            },
            
            {
                title: $translate.instant('reports.financetab4.lbl'),
                state: 'app.financereporttab.inventoryreport',
                canDisable: canDisableTab
            },
            {
                title: $translate.instant('reports.financetab5.lbl'),
                state: 'app.financereporttab.gsttaxreport',
                canDisable: canDisableTab
            },          
            {
                title: $translate.instant('reports.financetab6.lbl'),
                state: 'app.financereporttab.doctorinvoicereport',
                canDisable: canDisableTab
            },
            {
                title: $translate.instant('reports.financetab7.lbl'),
                state: 'app.financereporttab.doctorsharereport',
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

    financetabreportTabController.$inject = ['$rootScope','$scope', '$stateParams', '$state', '$translate', '$timeout'];
})();