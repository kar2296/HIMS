(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('portalipDashboardController', portalipDashboardController);

    function portalipDashboardController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.currentfilter = {
        };

        $scope.currentcontext = {
            paneltype: 'panel-info',
            recordcount: 3
        };
        $scope.canShowDischargeBtn = false;
        if ($stateParams.eid)
            $scope.currentcontext.eid = parseInt($stateParams.eid);
        utl.Session.set('dashboard-panel-type', $scope.currentcontext.paneltype);
        utl.Session.set('dashboard-record-count', $scope.currentcontext.recordcount);

        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.dashboardinfo = {};

        function getSectionPath() {
            return "app/views/patientportal/ipdashboard/sections/";
        }
        $scope.sections = [
            { key: 'vitals', tmpl: getSectionPath() + 'vital-section.html' },
            { key: 'prescription', tmpl: getSectionPath() + 'prescription-section.html' },
            { key: 'diagnosis', tmpl: getSectionPath() + 'diagnosis-section.html' },
            { key: 'clinicalorders', tmpl: getSectionPath() + 'clinicalorders-section.html' },
            { key: 'intakeoutput', tmpl: getSectionPath() + 'intakeoutput-section.html' },
            { key: 'dietorder', tmpl: getSectionPath() + 'diet-section.html' },
            { key: 'labresult', tmpl: getSectionPath() + 'labresult-section.html' },
            { key: 'radiology', tmpl: getSectionPath() + 'radiology-section.html' },
            { key: 'progressnotes', tmpl: getSectionPath() + 'progressnote-section.html' },
            { key: 'documents', tmpl: getSectionPath() + 'document-section.html' }
        ];
        if ($scope.currentcontext.eid)
            $scope.getEncounter();
    }

    portalipDashboardController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();