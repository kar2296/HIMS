(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('EmergencyPatienttabController', EmergencyPatienttabController);

    function EmergencyPatienttabController($scope, $stateParams, $state, $translate, utl) {
        var tabvm = this;

        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        $scope.tabs = [];
        $scope.tabs.push({
            title: $translate.instant('Current Patients'),
            state: 'app.emergencypatienttab.emergencypatientlist',
            canDisable: false
        });
        $scope.tabs.push({
            title: $translate.instant('CheckedOut Patients'),
            state: 'app.emergencypatienttab.previousemergencypatientslist',
            canDisable: false
        });

        $scope.switchTab = function(tab) {
            $state.go(tab.state);
        }
        $scope.doctor_dashboard = function() {
            $state.go('app.aedashboard');
        }
    }
    EmergencyPatienttabController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();