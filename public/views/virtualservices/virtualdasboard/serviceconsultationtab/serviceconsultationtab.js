(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ServiceConsultationTabController', ServiceConsultationTabController);

    function ServiceConsultationTabController($scope, $stateParams, $state, $translate, utl) {
        var tabvm = this;

        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.tabs = [];
        $scope.CanAllOutPatients = $scope.HasAccess('OutPatients', 'AllOutPatients');
        $scope.CanMyOutPatients = $scope.HasAccess('OutPatients', 'MyOutPatients');
        $scope.CanPreviousOutPatients = $scope.HasAccess('OutPatients', 'PreviousOutPatients');

        if ($scope.CanMyOutPatients) {
            $scope.tabs.push({
                title: $translate.instant('appointment.homecaremanagement.singlepatients.lbl'),
                state: 'app.serviceconsultationtab.currentpatient-single',
                canDisable: false
            });
        }
        if ($scope.CanAllOutPatients) {
            $scope.tabs.push({
                title: $translate.instant('appointment.homecaremanagement.multipatients.lbl'),
                state: 'app.serviceconsultationtab.currentpatient-multi',
                canDisable: false
            });
        }
        if ($scope.CanPreviousOutPatients) {
            $scope.tabs.push({
                title: $translate.instant('appointment.homecaremanagement.previouspatients.lbl'),
                state: 'app.serviceconsultationtab.currentpatient-previous',
                canDisable: false
            });
        }

        $scope.switchTab = function (tab) {
            $state.go(tab.state);
        }
        $scope.backToList = function () {
            $state.go('app.homecaredashboard');
        }
        $scope.doctor_dashboard = function () {
            $state.go('app.homecaredashboard');
        }
        $scope.bed_management = function () {
            $state.go('app.bedmanagement');
        }

        if ($scope.CanAllOutPatients) {
            $scope.switchTab($scope.tabs[0]);
        }
    }



    ServiceConsultationTabController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();