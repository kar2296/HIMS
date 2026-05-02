(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('dashboardController', dashboardController);

    function dashboardController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.currentfilter = {};

        $scope.currentcontext = {
            paneltype: 'panel-info'
        };

        utl.Session.set('dashboard-panel-type', $scope.currentcontext.paneltype);

        $scope.currentcontext.pid = parseInt(utl.Session.getPatientPortalPatientId());
        $scope.dashboardinfo = {};

        function getSectionPath() {
            return "app/views/patientportal/dashboard/sections/";
        }

        $scope.sections = [];
    }

    dashboardController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();