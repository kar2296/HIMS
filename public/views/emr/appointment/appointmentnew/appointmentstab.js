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

        // ---------------------------------------------------------------
        // REACT BRIDGE WIRING (migrated to AppointmentsTabScreen.tsx).
        // All API calls/business logic above are untouched -- this only
        // exposes the (static, already-final) tabs array and dispatches the
        // header actions back into the existing functions above. The nested
        // <div ui-view> stays a native sibling in the .html template.
        // ---------------------------------------------------------------
        $scope.reactProps = {
            tabs: $scope.tabs
        };

        $scope.handleReactAction = function(actionName, payload) {
            switch (actionName) {
                case 'switchTab':
                    $scope.switchTab({ state: payload.state });
                    break;
                case 'addNew':
                    $scope.addNew();
                    break;
                case 'backtodashboard':
                    $scope.backtodashboard();
                    break;
                default:
                    break;
            }
            $scope.$applyAsync();
        };
    }

    appointmentsTabController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', '$timeout'];
})();
