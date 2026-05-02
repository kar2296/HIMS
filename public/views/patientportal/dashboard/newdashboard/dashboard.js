(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientPortalDashboardController', patientPortalDashboardController);

    function patientPortalDashboardController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.currentfilter = {};

        $scope.currentcontext = {
            paneltype: 'panel-info'
        };

        utl.Session.set('dashboard-panel-type', $scope.currentcontext.paneltype);

        $scope.currentcontext.pid = parseInt(utl.Session.getPatientPortalPatientId());
        $scope.dashboardinfo = {};

        function getSectionPath() {
            return "app/views/patientportal/newdashboard/sections/";
        }

        $scope.sections = [];

        $scope.openGrowthChart = function() {
            $state.go('patientportal.growthchart');
        }
    }

    patientPortalDashboardController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();