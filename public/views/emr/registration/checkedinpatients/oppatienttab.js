(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('OPPatientTabController', OPPatientTabController);

    function OPPatientTabController($scope, $stateParams, $state, $translate, utl) {
        var tabvm = this;

        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        console.log($stateParams.context);
        $scope.tabs = [];
        $scope.CanAllOutPatients = $scope.HasAccess('OutPatients', 'AllOutPatients');
        $scope.CanMyOutPatients = $scope.HasAccess('OutPatients', 'MyOutPatients');
        $scope.CanPreviousOutPatients = $scope.HasAccess('OutPatients', 'PreviousOutPatients');

        if ($scope.CanMyOutPatients) {
            if($stateParams.context != 'nursing') {
                $scope.tabs.push({
                    title: $translate.instant('registration.checkedinpatients.mycheckedin-patients.lbl'),
                    state: 'app.oppatienttab.mycheckin',
                    canDisable: false
                });
            }
        }
        if ($scope.CanAllOutPatients) {
            $scope.tabs.push({
                title: $translate.instant('registration.checkedinpatients.allcheckedin-patients.lbl'),
                state: 'app.oppatienttab.allcheckin',
                canDisable: false
            });
        }
        if ($scope.CanPreviousOutPatients) {
            $scope.tabs.push({
                title: $translate.instant('registration.checkedinpatients.previous-patients.lbl'),
                state: 'app.oppatienttab.previousoppatient',
                canDisable: false
            });
        }

        $scope.switchTab = function (tab) {
            $state.go(tab.state);
        }
        $scope.backToList = function () {
            $state.go('app.doctordashboard');
        }
        $scope.doctor_dashboard = function () {
            if ($scope.Context == 'virtual') {
                $state.go('app.virtualdashboard');
            } else {
                $state.go('app.doctordashboard');
            }
        }
        $scope.bed_management = function () {
            $state.go('app.bedmanagement');
        }

        if ($scope.CanAllOutPatients) {
            $scope.switchTab($scope.tabs[0]);
        }

        // ---------------------------------------------------------------
        // REACT BRIDGE WIRING (migrated to OppatientTabScreen.tsx). All
        // logic above is untouched.
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



    OPPatientTabController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();