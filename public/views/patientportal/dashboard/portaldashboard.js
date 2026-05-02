(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('PortalDashboardController', PortalDashboardController);

    function PortalDashboardController($scope, $stateParams, $state, $translate, utl) {
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

        $scope.myhealthrecord = function() {
            $state.go('patientportal.portalmyhealthrecord');
        }
        $scope.myhistory = function() {
            $state.go('patientportal.medicalhistory');
        }
    }

    PortalDashboardController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();