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
            $state.go('app.radiologydashboard');
        }

    }
    RadiologyReportController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();