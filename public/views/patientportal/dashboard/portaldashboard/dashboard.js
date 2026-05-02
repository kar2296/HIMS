(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientdashboardController', patientdashboardController);

    function patientdashboardController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.currentfilter = {};

        $scope.currentcontext = {
            paneltype: 'panel-info'
        };

        utl.Session.set('dashboard-panel-type', $scope.currentcontext.paneltype);

        $scope.currentcontext.pid = parseInt(utl.Session.getPatientPortalPatientId());
        $scope.dashboardinfo = {};

        // function getSectionPath() {
        //     return "app/views/patientportal/newdashboard/sections/";
        // }

        $scope.sections = [];

        $scope.appointments = function() {
            $state.go('patientportal.appointments');
        }
        $scope.ehealth = function() {
            $state.go('patientportal.ehealth');
        }
        $scope.labresults = function() {
            $state.go('patientportal.labresults');
        }
        $scope.radiologyresults = function() {
            $state.go('patientportal.radiologyresults');
        }
        $scope.dischargesummary = function() {
            $state.go('patientportal.dischargesummary');
        }
        $scope.document = function() {
            $state.go('patientportal.document');
        }
        $scope.prescription = function() {
            $state.go('patientportal.prescription');
        }
        $scope.surgeryrequest = function() {
            $state.go('patientportal.surgeryrequest');
        }
        $scope.payments = function() {
            $state.go('patientportal.payment');
        }
        $scope.otregister = function() {
            $state.go('patientportal.otregister');
        }
        $scope.immunization = function() {
            $state.go('patientportal.immunization');
        }
        $scope.growthchart = function() {
            $state.go('patientportal.growthchart');
        }
        $scope.labresultview = function() {
            $state.go('patientportal.patientlabresultview');
        }
    }

    patientdashboardController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();