(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('appointmentsTabController', appointmentsTabController);

    function appointmentsTabController($rootScope, $scope, $stateParams, $state, $translate, $timeout) {

        // var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;
        var canDisableTab = false;

        $scope.tabs = [{
                title: $translate.instant('appointment.appointment-history.pagetitle2.lbl'),
                state: 'app.appointmentstab.details',
                canDisableTab: false
            },
            {
                title: $translate.instant('appointment.appointment-history.view.lbl'),
                state: 'app.appointmentstab.viewappoitment',
                canDisableTab: false
            },
            {
                title: $translate.instant('Appointment Calendar'),
                state: 'app.appointmentstab.appointmentcalendardoctor',
                canDisableTab: false
            },
            // {title : $translate.instant('appmanager.usertab.tabuserfacilitymap.lbl'), state : 'app.usertab.userfacilitymap', canDisableTab : canDisableTabTab},
            // {
            //     title: $translate.instant('appointment.appointment-history.app.lbl'),
            //     state: 'app.appointmentstab.viewappoitment', canDisableTab: false
            // },
        ];
        $timeout(function() {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.backtodashboard = function() {
            $state.go('app.frontdashboard');
        }
        $scope.backToList = function() {
            $state.go('app.appointmentnew');
        }
        $scope.addNew = function() {
            $state.go('app.appointmentstab.details', {
                id: 0
            });
        }

        $scope.switchTab = function(tab) {
            if (!canDisableTab) {
                $state.go(tab.state);
            }
        }
    }

    appointmentsTabController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', '$timeout'];
})();