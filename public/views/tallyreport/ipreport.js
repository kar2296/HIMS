(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ipreportController', ipreportController);

    function ipreportController($scope, $filter, $stateParams, $state, $translate, utl) {
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
        $scope.ipsales = function () {
            $state.go('app.ipsalesreport')
        }
        $scope.ipcollectionreport = function () {
            $state.go('app.ipcollectionsreport')
        }
        $scope.ipcreditreport = function () {
            $state.go('app.ipcreditreport')
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
    ipreportController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();