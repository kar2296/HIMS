(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('LabReportController', LabReportController);

    function LabReportController($scope, $filter, $stateParams, $state, $translate, utl) {
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
        $scope.laborderdetailreport = function () {
            $state.go('app.laborderdetailreport')
        }
        $scope.labtatreport = function () {
            $state.go('app.labtatreport')
        }
        $scope.labstatisticssummaryreport = function () {
            $state.go('app.labstatisticssummaryreport')
        }
        $scope.orderstatisticspathologistreport = function () {
            $state.go('app.orderstatisticspathologistreport')
        }
        $scope.labsummarybytest = function () {
            $state.go('app.labsummarybytest')
        }
        $scope.labsummarybysample = function () {
            $state.go('app.labsummarybysample')
        }
        $scope.labredoreport = function () {
            $state.go('app.labredoreport')
        }
        $scope.labrevenuereport = function () {
            $state.go('app.labrevenuereport')
        }
        $scope.backtoList = function () {
            $state.go('app.labdashboard');
        }

    }
    LabReportController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();