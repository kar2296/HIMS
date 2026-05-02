(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('inpatientreportController', inpatientreportController);

    function inpatientreportController($scope, $filter, $stateParams, $state, $translate, utl) {
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
            $state.go('app.ipadmissionreport', {
                context: 'ipopreport'
            })
        }
        $scope.ipdischargereport = function () {
            $state.go('app.ipdischargereport', {
                context: 'ipopreport'
            })
        }
        $scope.ipadmissionsummarybydoctor = function () {
            $state.go('app.ipadmissionsummarybydoctor', {
                context: 'ipopreport'
            })
        }
        $scope.ipoccupancyreport = function () {
            $state.go('app.ipoccupancyreport', {
                context: 'ipopreport'
            })
        }
        $scope.ipoccupancybyward = function () {
            $state.go('app.ipoccupancybyward', {
                context: 'ipopreport'
            })
        }
        $scope.bedtransferreport = function () {
            $state.go('app.bedtransferreport', {
                context: 'ipopreport'
            })
        }
        $scope.ipadmissioninsurancereport = function () {
            $state.go('app.ipadmissioninsurancereport', {
                context: 'ipopreport'
            })
        }
        $scope.ipadmissionsummarybyinsurance = function () {
            $state.go('app.ipadmissionsummarybyinsurance', {
                context: 'ipopreport'
            })
        }
        $scope.ipreferraldoctorreport = function () {
            $state.go('app.ipreferraldoctorreport', {
                context: 'ipopreport'
            })
        }
        $scope.diagnosissummaryforippatient = function () {
            $state.go('app.diagnosissummaryforippatient', {
                context: 'ipopreport'
            })
        }
        $scope.patientlistbydiagnosis = function () {
            $state.go('app.patientlistbydiagnosis', {
                context: 'ipopreport'
            })
        }
        $scope.covidstatisticsreport = function () {
            $state.go('app.covidstatisticsreport', {
                context: 'ipopreport'
            })
        }
        $scope.ipstatisticsreport = function () {
            $state.go('app.ipstatisticsreport', {
                context: 'ipopreport'
            })
        }
        $scope.dailywiseipstatisticsreport = function () {
            $state.go('app.dailywiseipstatisticsreport', {
                context: 'ipopreport'
            })
        }
        // $scope.bedtransferreport = function () {
        //     $state.go('app.bedtransferreport')
        // }
        // $scope.backtoList = function () {
        //     if ($scope.Context == 'frontoffice') {
        //         $state.go('app.frontdashboard');
        //     } else if ($scope.Context == 'billing') {
        //         $state.go('app.billingsdashboard');
        //     } else if ($scope.Context == 'nursing') {
        //         $state.go('app.nursingdashboard');
        //     } else if ($scope.Context == 'pharmacy') {
        //         $state.go('app.pharmacydashboard');
        //     } else if ($scope.Context == 'store') {
        //         $state.go('app.storedashboard');
        //     } else if ($scope.Context == 'lab') {
        //         $state.go('app.labdashboard');
        //     } else if ($scope.Context == 'ris') {
        //         $state.go('app.ris_dashboard');
        //     }
        // }
        $scope.backtoList = function () {
            $state.go('app.frontdashboard');
        }
    }
    inpatientreportController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();