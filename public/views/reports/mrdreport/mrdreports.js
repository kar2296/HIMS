(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('mrdreportsController', mrdreportsController);

    function mrdreportsController($rootScope,$timeout,$scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        $scope.SelectedAssetManageId = 1
        $scope.items = [];
        $scope.currentcontext = {};
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        } 
        $scope.ipadmissionreport = function () {
            $state.go('app.ipadmissionreport', { context: 'mrdreports' })
        }
        $scope.mlcpatientlistreport = function () {
            $state.go('app.mlcpatientlistreport', { context: 'mrdreports' })
        }
        $scope.ipdischargereport = function () {
            $state.go('app.ipdischargereport', { context: 'mrdreports' })
        } 
        $scope.ipadmissionsummarybydoctor = function () {
            $state.go('app.ipadmissionsummarybydoctor', { context: 'mrdreports' })
        }
        $scope.ipoccupancyreport = function () {
            $state.go('app.ipoccupancyreport', { context: 'mrdreports' })
        }
        $scope.ipoccupancybyward = function () {
            $state.go('app.ipoccupancybyward', { context: 'mrdreports' })
        }
        $scope.bedtransferreport = function () {
            $state.go('app.bedtransferreport', { context: 'mrdreports' })
        }
        $scope.ipadmissioninsurancereport = function () {
            $state.go('app.ipadmissioninsurancereport', { context: 'mrdreports' })
        }
        $scope.ipadmissionsummarybyinsurance = function () {
            $state.go('app.ipadmissionsummarybyinsurance', { context: 'mrdreports' })
        }
        $scope.ipreferraldoctorreport = function () {
            $state.go('app.ipreferraldoctorreport', { context: 'mrdreports' })
        }
        $scope.diagnosissummaryforippatient = function () {
            $state.go('app.diagnosissummaryforippatient', { context: 'mrdreports' })
        }
        $scope.patientlistbydiagnosis = function () {
            $state.go('app.patientlistbydiagnosis', { context: 'mrdreports' })
        }
        $scope.covidstatisticsreport = function () {
            $state.go('app.covidstatisticsreport', { context: 'mrdreports' })
        }
        $scope.ipstatisticsreport = function () {
            $state.go('app.ipstatisticsreport', { context: 'mrdreports' })
        }
        $scope.dailywiseipstatisticsreport = function () {
            $state.go('app.dailywiseipstatisticsreport', { context: 'mrdreports' })
        }
        $scope.patientlistreports = function () {
            $state.go('app.patientlistreports', { context: 'mrdreports' })
        }
        $scope.outpatientreport = function () {
            $state.go('app.outpatientreport', { context: 'mrdreports' })
        }
        $scope.outpatientsummaryreport = function () {
            $state.go('app.outpatientsummaryreport', { context: 'mrdreports' })
        }
        $scope.inactivepatientreport = function () {
            $state.go('app.inactivepatientreport', { context: 'mrdreports' })
        }
        $scope.opreferraldoctorreport = function () {
            $state.go('app.opreferraldoctorreport', { context: 'mrdreports' })
        }
        $scope.outpatientsummarybydoctor = function () {
            $state.go('app.outpatientsummarybydoctor', { context: 'mrdreports' })
        }
        $scope.outpatientsummarybyinsurance = function () {
            $state.go('app.outpatientsummarybyinsurance', { context: 'mrdreports' })
        }
        $scope.otschedulereport = function () {
            $state.go('app.otschedulereport', { context: 'mrdreports' })
        }
        $scope.surgeryentryreports = function () {
            $state.go('app.surgeryentryreports', { context: 'mrdreports' })
        }
        $scope.surgerysummarybyprocedure = function () {
            $state.go('app.surgerysummarybyprocedure', { context: 'mrdreports' })
        }
        $scope.surgerysummarybysurgeon = function () {
            $state.go('app.surgerysummarybysurgeon', { context: 'mrdreports' })
        }
        $scope.surgerysummarybyanaesthetist = function () {
            $state.go('app.surgerysummarybyanaesthetist', { context: 'mrdreports' })
        }
        $scope.ipstatisticsbyward = function () {
            $state.go('app.ipstatisticsbyward', { context: 'mrdreports' })
        }
        $scope.departmentwisestatisticsreport = function () {
            $state.go('app.departmentwisestatisticsreport', { context: 'mrdreports' })
        }
        $scope.notifyincompletefilereport = function () {
            $state.go('app.notifyincompletefilereport', { context: 'mrdreports' })
        }
        $scope.mrdfilesubmitdetailsreport = function () {
            $state.go('app.mrdfilesubmitdetailsreport', { context: 'mrdreports' })
        }


        
        $scope.backtoList = function () {
            $state.go('app.frontdashboard');
        }
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
    }
    mrdreportsController.$inject = ['$rootScope','$timeout','$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();