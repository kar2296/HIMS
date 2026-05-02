(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('portalmyhealthrecordController', portalmyhealthrecordController);

    function portalmyhealthrecordController($scope, $stateParams, $state, $translate, utl) {
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

        $scope.sections = [
            { key: 'allergy', tmpl: getSectionPath() + 'allergy-section.html' },
            { key: 'conditions', tmpl: getSectionPath() + 'condition-section.html' },
            { key: 'immunizations', tmpl: getSectionPath() + 'immunization-section.html' },
            { key: 'medications', tmpl: getSectionPath() + 'medication-section.html' },
            { key: 'procedures', tmpl: getSectionPath() + 'procedure-section.html' },
            { key: 'socialhistory', tmpl: getSectionPath() + 'socialhistory-section.html' },
            { key: 'vitals', tmpl: getSectionPath() + 'vital-section.html' },
            { key: 'familyconditions', tmpl: getSectionPath() + 'familycondition-section.html' },
            { key: 'familysocialhistory', tmpl: getSectionPath() + 'familysocialhistory-section.html' },
            { key: 'surgicals', tmpl: getSectionPath() + 'surgical-section.html' },
            { key: 'appointments', tmpl: getSectionPath() + 'appointment-section.html' }
        ];

        $scope.medicalhistory = function () {
            $state.go('patientportal.medicalhistory');
        }
        $scope.Consultation = function () {
            $state.go('patientportal.docappointment');
        }
        $scope.labresult = function () {
            $state.go('patientemr.labresultview');
        }
        $scope.radiologyresults = function () {
            $state.go('patientportal.radiologyresults');
        }
        $scope.immunization = function () {
            $state.go('patientportal.immunization');
        }
        $scope.dischargesummary = function () {
            $state.go('patientportal.dischargesummary');
        }
        $scope.dischargesummary = function () {
            $state.go('patientportal.dischargesummary');
        }
        // $scope.home = function () {
        //     $state.go('patientportal.portaldashboard');
        // }
        $scope.labresultlist = function () {
            $state.go('patientportal.portalresultlistview');
        }
        $scope.radiology = function () {
            $state.go('patientportal.radiologyresults');
        }
        $scope.immunzation = function () {
            $state.go('patientportal.immunization');
        }
        $scope.dischargesummary = function () {
            $state.go('patientportal.dischargesummary');
        }
        $scope.document = function () {
            $state.go('patientportal.document');
        }
        $scope.home = function () {
           $state.go('patientportal.portaldashboard');
        }
      
       
    }

    portalmyhealthrecordController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();