(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('emrcharttabController', emrcharttabController);

    function emrcharttabController($rootScope, $scope, $stateParams, $state, $translate, $timeout) {

        //$scope.setPageTitle($scope.i18n.appmanager.usertab.pagetitle.lbl);

        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

        $scope.tabs = [{
            title: $translate.instant('EMR Charts'),
            state: 'patientemr.emrcharttab.emrcharts',
            canDisable: false
        },

        {
            title: $translate.instant('Nursing Chart'),
            state: '',
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

    emrcharttabController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', '$timeout'];
})();