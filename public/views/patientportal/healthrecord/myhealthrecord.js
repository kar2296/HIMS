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

        $scope.dashboard = function () {
            $state.go('patientportal.virtualhealthcare');
         }

        $scope.medicalhistory = function () {
            $state.go('patientportal.medicalhistory');
        }
        $scope.labresult = function () {
            $state.go('patientportal.labresults');
        }
        $scope.radiologylistview = function () {
            $state.go('patientportal.portalradiologylistview');
        }
        $scope.immunization = function () {
            $state.go('patientportal.immunization');
        }
        $scope.laborders = function () {
            $state.go('patientportal.laborders');
        }
        $scope.dischargesummary = function () {
            $state.go('patientportal.dischargesummary');
        }
        $scope.dischargesummary = function () {
            $state.go('patientportal.dischargesummary');
        }
        $scope.home = function () {
            $state.go('patientportal.virtualhealthcare');
        }
        $scope.labresultlist = function () {
            $state.go('patientportal.labresults');
        }
        $scope.prescriptionlist = function () {
            $state.go('patientportal.prescription');
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
           $state.go('patientportal.virtualhealthcare');
        }
        $scope.Home = function () {
            $state.go('patientportal.virtualhealthcare');
         }
      
       
    }

    portalmyhealthrecordController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();