(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('eventdashboardTabController', eventdashboardTabController);

    function eventdashboardTabController($scope, $stateParams, $state, $translate, utl) {

        $scope.tabs = [           
            { title: $translate.instant('appmanager.eventdashboardtab.outboundall.lbl'), state: 'app.eventdashboardtab.outboundall', canDisable: false },
            { title: $translate.instant('appmanager.eventdashboardtab.inboundall.lbl'), state: 'app.eventdashboardtab.inboundall', canDisable: false },
            { title: $translate.instant('appmanager.eventdashboardtab.outbound-ignored.lbl'), state: 'app.eventdashboardtab.outboundignored', canDisable: false },
            { title: $translate.instant('appmanager.eventdashboardtab.inbound-ignored.lbl'), state: 'app.eventdashboardtab.inboundignored', canDisable: false },
            { title: $translate.instant('appmanager.eventdashboardtab.outbounderror.lbl'), state: 'app.eventdashboardtab.outbounderror', canDisable: false },
            { title: $translate.instant('appmanager.eventdashboardtab.inbounderror.lbl'), state: 'app.eventdashboardtab.inbounderror', canDisable: false }
        ];

        $scope.currentcontext = {
            childstate: $state.current.name
        };
        $scope.openModal = function (Id) {
            utl.Modal.open('app.eventdashboardtab.outboundsall', {
                params: { id: Id }, confirmCallback: $scope.refresh
            }
            );
        }

        $scope.refresh = function () {
            $scope.$$childTail.initLookup();
        };


        //Grid Actions
        $scope.addNew = function () {
            // $state.go('app.location-form', { id: 0 });
            $scope.openModal(0);
        }


        $scope.canActive = function (tab) {
            return tab.state == $scope.currentcontext.childstate;
        };

        $scope.switchTab = function (tab) {
            $state.go(tab.state);
        }
    }
    eventdashboardTabController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();