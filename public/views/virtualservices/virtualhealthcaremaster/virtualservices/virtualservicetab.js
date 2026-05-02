(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('VirtualServiceTabController', VirtualServiceTabController);

    function VirtualServiceTabController($rootScope, $scope, $stateParams, $state, $translate, $timeout) {


        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

        $scope.tabs = [{
                title: $translate.instant('clinicalmaster.serviceitemtab.tabdetails.lbl'),
                state: 'app.virtualtab.virtualserviceform',
                canDisable: false
            },
            {
                title: $translate.instant('clinicalmaster.serviceitemtab.tabtariffdetails.lbl'),
                state: 'app.virtualtab.ratedetails',
                canDisable: canDisableTab
            },
            // {
            //     title: $translate.instant('clinicalmaster.serviceitemtab.tabpackagemap.lbl'),
            //     state: 'app.serviceitemtab.serviceitempackagemap',
            //     canDisable: canDisableTab
            // },
        ];
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.backToList = function () {
            $state.go('app.virtualserviceitems');
        }
        $scope.addNew = function () {
            $state.go('app.virtualtab.virtualserviceform', {
                id: 0
            });
        }

        $scope.switchTab = function (tab) {
            if (!canDisableTab) {
                $state.go(tab.state);
            }
        }
    }

    VirtualServiceTabController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', '$timeout'];
})();