(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('RadiologyReportController', RadiologyReportController);

    function RadiologyReportController($scope, $filter, $stateParams, $state, $translate, utl) {
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
        $scope.patientlist = function () {
            $state.go('app.patientlistreports')
        }
        $scope.radiologyorderdetailreport = function () {
            $state.go('app.radiologyorderdetailreport')
        }
        $scope.radtatreport = function () {
            $state.go('app.radtatreport')
        }
        $scope.orderstatisticsradiologistreport = function () {
            $state.go('app.orderstatisticsradiologistreport')
        }
        $scope.radiologysummarybytest = function () {
            $state.go('app.radiologysummarybytest')
        }
        $scope.radiologystatisticssummaryreport = function () {
            $state.go('app.radiologystatisticssummaryreport')
        }
        $scope.radiologyrevenuereport = function () {
            $state.go('app.radiologyrevenuereport')
        }
        $scope.backtoList = function () {
            $state.go('app.ris_dashboard');
        }

        $scope.handleReactAction = function (actionName, payload) {
            if (actionName === 'back') {
                $scope.backtoList();
            } else if (actionName === 'order_detail') {
                $scope.radiologyorderdetailreport();
            } else if (actionName === 'tat_report') {
                $scope.radtatreport();
            } else if (actionName === 'summary_by_test') {
                $scope.radiologysummarybytest();
            } else if (actionName === 'statistics_summary') {
                $scope.radiologystatisticssummaryreport();
            } else if (actionName === 'radiologist_stats') {
                $scope.orderstatisticsradiologistreport();
            } else if (actionName === 'revenue_report') {
                $scope.radiologyrevenuereport();
            }
        };

        $scope.handleNavigate = function (stateName, params) {
            $state.go(stateName, params);
        };
    }
    RadiologyReportController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();