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

        // ---- React bridge (UI-MODERNIZATION RETROFIT) ----
        // This controller has no async data -- $scope.tabs is a static list
        // computed once above. AngularJS ui-router remains authoritative for
        // routing/nested-view rendering (the real <div ui-view> is untouched
        // native markup in billingreportstab.html); this bridge only mirrors
        // the tab bar into reactProps and dispatches back onto the real,
        // unchanged $scope.switchTab/addNew (including switchTab's existing
        // real behavior of ignoring the click entirely whenever canDisableTab
        // is true, even for the nominally-enabled first tab -- reproduced
        // automatically since this dispatches straight through to the real
        // function rather than reimplementing its logic).
        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                tabs: $scope.tabs,
                currentState: $state.current.name
            };
        };
        $scope.refreshReactProps();

        $scope.handleReactAction = function (actionName, payload) {
            if (typeof $scope[actionName] === 'function') {
                $scope[actionName](payload);
            }
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

    }

    BillingReportTabController.$inject = ['$rootScope','$scope', '$stateParams', '$state', '$translate', '$timeout'];
})();