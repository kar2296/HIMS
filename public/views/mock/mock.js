(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('mockController', mockController);

    function mockController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        var fileBasePath = window.appPath.apiroot + "mock/";
        $scope.codeScreenMap = {
            BED_BOARD: fileBasePath + 'bed_board.html',
            DOCTOR_DASHBOARD: fileBasePath + 'Doctor dashboard.html',
            IMMUNIZATION_CHART: fileBasePath + 'Immunization_chart.htm',
            VITALS_CHART: fileBasePath + 'vital_chart.htm',
            EMR_DASHBOARD_TIMELINE: fileBasePath + 'EHR_timeline.html',
            DISCHARGE_SUMMARY: fileBasePath + 'patient_dischargeSummary.html',
            CONSULTATION_NOTES: fileBasePath + 'progressnotes.html',
            IVF_SUMMARY: fileBasePath + 'patient_ivf_calendar.html',
            IP_SUMMARY: fileBasePath + 'patient_summary.html',
            EPISODE_SUMMARY: fileBasePath + 'patient_episodes_list.html',
            PATIENT_TIMELINE: fileBasePath + 'timeline.html',
            RHEUMATOLOGY_SUMMARY: fileBasePath + 'Rheumatology.html',
            INVENTORY_DBM: fileBasePath + 'pharmacyStockStatus.html',
            FLOW_SHEET: fileBasePath + 'patient_flowsheet.html',
            GYNEC_NOTES: fileBasePath + 'progressnotes_gynec.html',
			 BCGVACCINE: fileBasePath + 'BCGvaccine.html',
            HEPATITIS_B_VACCINE: fileBasePath + 'Hepatitis_B_Vaccine.html',
            IPV: fileBasePath + 'IPV.html',
            DTPVACCINE: fileBasePath + 'DTPVaccine.html',
            CHICKENPOX: fileBasePath + 'Chickenpox.html',
            HIB_VACCINE: fileBasePath + 'Hib_Vaccine.html',
            MMR_VACCINE: fileBasePath + 'MMR_Vaccine.html',
            TYPHOID_CONJUGATE_VACCINE: fileBasePath + 'Typhoid_Conjugate_Vaccine.html',
            INFLUENZA_VIRUS_VACCINE: fileBasePath + 'Influenza_Virus_Vaccine.html',
            ROTAVIRUS_VACCINE: fileBasePath + 'Rotavirus_Vaccine.html',
            TDAP_VACCINE: fileBasePath + 'Tdap_Vaccine.html',
            HEPATITIS_A_VACCINE: fileBasePath + 'Hepatitis_A_Vaccine.html',
            PNEUMOCOCCAL_VACCINE: fileBasePath + 'Pneumococcal_Vaccine.html',
            HRMS: fileBasePath + 'hrms.html', //http://localhost:8080/jasperserver/login.html
            REPORTS: fileBasePath + 'reports.html', //http://localhost:8080/jasperserver/login.html
            DASHBOARD: fileBasePath + 'dashboard.html', //http://123.136.162.220:8082/dashbuilder
            MISDASHBOARD: fileBasePath + 'mis-report.html'
        }
        $scope.backToList = function() {
            $state.go('patientemr.patientdashboard');
        }

        $scope.currentcontext = {};
        $scope.currentcontext.code = $stateParams.code;
        $scope.currentcontext.targetUrl = getTargetUrl($scope.currentcontext.code);

        function getTargetUrl(code) {
            var result = "";
            if (code) {
                result = $scope.codeScreenMap[code];
            }
            return result;
        }
    }

    mockController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();