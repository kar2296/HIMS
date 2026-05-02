(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('doctorsharereportController', doctorsharereportController);

    function doctorsharereportController($scope, $filter, $stateParams, $state, $translate, utl) {
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
        $scope.drshareitemwisecollectionsummaryop = function () {
            $state.go('app.drshareitemwisecollectionsummaryop')
        }
        $scope.drshareitemwisecollectionsummaryip = function () {
            $state.go('app.drshareitemwisecollectionsummaryip')
        }
        $scope.drsharerevenuesummarybycategory = function () {
            $state.go('app.drsharerevenuesummarybycategory')
        }
        $scope.drsharerevenuesummarybydepartment = function () {
            $state.go('app.drsharerevenuesummarybydepartment')
        }
        $scope.drsharerevenuesummarybydoctor = function () {
            $state.go('app.drsharerevenuesummarybydoctor')
        }
        $scope.backtoList = function () {
            // if ($scope.Context == 'frontoffice') {
            //     $state.go('app.frontdashboard');
            // } else if ($scope.Context == 'billing') {
            $state.go('app.billingsdashboard');
            // } else if ($scope.Context == 'nursing') {
            //     $state.go('app.nursingdashboard');
            // } else if ($scope.Context == 'pharmacy') {
            //     $state.go('app.pharmacydashboard');
            // } else if ($scope.Context == 'store') {
            //     $state.go('app.storedashboard');
            // } else if ($scope.Context == 'lab') {
            //     $state.go('app.labdashboard');
            // } else if ($scope.Context == 'ris') {
            //     $state.go('app.ris_dashboard');
            // }
        }

    }
    doctorsharereportController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();