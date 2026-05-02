(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('BillingReportTabController', BillingReportTabController);

    function BillingReportTabController($rootScope,$scope, $stateParams, $state, $translate,$timeout) {

        //$scope.setPageTitle($scope.i18n.appmanager.usertab.pagetitle.lbl);s

        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

        $scope.tabs = [{
                title: $translate.instant('reports.billingivoice.lbl '),
                state: 'app.billingreportstab.opinvoicebillingreport',
                canDisable: false
            },
            {
                title: $translate.instant('reports.billingip.lbl'),
                state: 'app.billingreportstab.ipinvoicebillingreport',
                canDisable: canDisableTab
            },
           {
                title: $translate.instant('reports.billingmaster.lbl'),
                state: 'app.billingreportstab.masterbillingreport',
                canDisable: canDisableTab
            },
            {
                title: $translate.instant('reports.billingrevenue.lbl'),
                state: 'app.billingreportstab.revenuereport',
                canDisable: canDisableTab
            },
            {
                title: $translate.instant('reports.surgeryreports.lbl'),
                state: 'app.billingreportstab.surgerybillingreport',
                canDisable: canDisableTab
            },
        ];
        $timeout(function () {
            removeFloatingNav();
        }, 100);
    
        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        // $scope.backToList = function () {
        //     $state.go('app.billingsdashboard');
        // }
        $scope.addNew = function () {
            $state.go('app.billingsdashboard', {
                id: 0
            });
        }

        $scope.switchTab = function (tab) {
            if (!canDisableTab) {
                $state.go(tab.state);
            }
        }
    }

    BillingReportTabController.$inject = ['$rootScope','$scope', '$stateParams', '$state', '$translate', '$timeout'];
})();