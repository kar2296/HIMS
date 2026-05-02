(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ipopreportstabController', ipopreportstabController);

    function ipopreportstabController($rootScope, $scope, $stateParams, $state, $translate, $timeout) {

        //$scope.setPageTitle($scope.i18n.appmanager.usertab.pagetitle.lbl);

        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

        $scope.tabs = [{
            title: $translate.instant('In-Patient Reports'),
            state: 'app.ipopreportstab.inpatientreport',
            canDisable: false
        },

        {
            title: $translate.instant('OUTPATIENT REPORTS'),
            state: 'app.ipopreportstab.outpatientreport',
            canDisable: canDisableTab
        },
        {
            title: $translate.instant('MRD & OT '),
            state: 'app.ipopreportstab.mrd&otreport',
            canDisable: canDisableTab
        },
        {
            title: $translate.instant('MASTER REPORT '),
            state: 'app.ipopreportstab.masterreport',
            canDisable: canDisableTab
        },

        ];
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.backtoList = function () {
            $state.go('app.frontdashboard');
        }

        $scope.switchTab = function (tab) {
            if (!canDisableTab) {
                $state.go(tab.state);
            }
        }
    }

    ipopreportstabController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', '$timeout'];
})();