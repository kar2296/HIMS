(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('inpatientTabController', inpatientTabController);

    function inpatientTabController($rootScope, $scope, $stateParams, $state, $translate, $timeout,utl) {
        var tabvm = this;
        //$scope.setPageTitle($scope.i18n.appmanager.usertab.pagetitle.lbl);
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

        // $scope.tabs = [{
        //         title: $translate.instant('registration.inpatients.pagetitle1.lbl'),
        //         state: 'app.inpatienttab.myinpatient',
        //         canDisable: false
        //     },
        //     {
        //         title: $translate.instant('registration.inpatients.pagetitle2.lbl'),
        //         state: 'app.inpatienttab.allinpatient',
        //         canDisable: canDisableTab
        //     },
        //     {
        //         title: $translate.instant('registration.inpatients.pagetitle3.lbl'),
        //         state: 'app.inpatienttab.patientdischarge',
        //         canDisable: canDisableTab
        //     },
        $scope.tabs = [];
        $scope.CanAllInPatients = $scope.HasAccess('InPatients', 'AllInPatients');
        $scope.CanMyInPatients = $scope.HasAccess('InPatients', 'MyInPatients');
        $scope.CanPreviousInPatients = $scope.HasAccess('InPatients', 'PreviousInPatients');

        if ($scope.CanMyInPatients) {
            $scope.tabs.push({
                title: $translate.instant('registration.inpatients.pagetitle1.lbl'),
                state: 'app.inpatienttab.myinpatient',
                canDisable: false
            });
        }
        if ($scope.CanAllInPatients) {
            $scope.tabs.push({
                title: $translate.instant('registration.inpatients.pagetitle2.lbl'),
                state: 'app.inpatienttab.allinpatient',
                canDisable: canDisableTab
            });
        }
        if ($scope.CanPreviousInPatients) {
            $scope.tabs.push({
                title: $translate.instant('registration.inpatients.pagetitle3.lbl'),
                state: 'app.inpatienttab.patientdischarge',
                canDisable: canDisableTab
            });
        }

            // {title : $translate.instant('appmanager.usertab.tabuserfacilitymap.lbl'), state : 'app.usertab.userfacilitymap', canDisable : canDisableTab},
            // {
            //     title: $translate.instant('appmanager.usertab.tabuserspecialitymap.lbl'),
            //     state: 'app.usertab.userspecialitymap',
            //     canDisable: canDisableTab
            // },
            // {title : $translate.instant('appmanager.usertab.tabuserteams.lbl'), state : 'app.usertab.userteams', canDisable : canDisableTab},
            // {title : $translate.instant('appmanager.usertab.tabusertaxdetail.lbl'), state : 'app.usertab.usertaxdetail', canDisable : canDisableTab},
            // {
            //     title: $translate.instant('appmanager.usertab.tabconsultationservice.lbl'),
            //     state: 'app.usertab.consultationservice',
            //     canDisable: canDisableTab
            // },
            // {title : $translate.instant('appmanager.usertab.tabuserweeklyholidays.lbl'), state : 'app.usertab.userweeklyholidays', canDisable : canDisableTab}
        // ];
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.backToList = function () {
            $state.go('app.users');
        }
        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
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

        // ---------------------------------------------------------------
        // REACT BRIDGE WIRING (migrated to InpatientTabScreen.tsx). All
        // logic above is untouched -- including the real (disclosed, not
        // fixed) quirk that switchTab() gates on the outer canDisableTab
        // (fixed from $stateParams.id at load) rather than the clicked
        // tab's own canDisable, so on a "new" (id=0) shell, clicking even
        // the always-enabled "My InPatients" tab silently does nothing.
        // ---------------------------------------------------------------
        $scope.reactProps = {
            tabs: $scope.tabs
        };

        $scope.handleReactAction = function (actionName, payload) {
            switch (actionName) {
                case 'switchTab':
                    $scope.switchTab({ state: payload.state });
                    break;
                case 'doctorDashboard':
                    $scope.doctor_dashboard();
                    break;
                default:
                    break;
            }
            $scope.$applyAsync();
        };
    }

    inpatientTabController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', '$timeout','utl'];
})();