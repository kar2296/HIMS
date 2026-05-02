(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ExcelUploadsController', ExcelUploadsController);

    function ExcelUploadsController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        $scope.SelectedAssetManageId = 1
        $scope.items = [];
        $scope.currentcontext = {};
        $scope.itemmasterexcelupload = function () {
            $state.go('app.itemmasterexcelupload')
        }
        $scope.serviceexcelupload = function () {
            $state.go('app.servicemasterexcelupload')
        }
        $scope.userdoctorexcelupload = function () {
            $state.go('app.userdoctormasterexcelupload')
        }
        $scope.servicetariffexcelupload = function () {
            $state.go('app.servicetariffmasterexcelupload')
        }
        $scope.testmasterexcelupload = function () {
            $state.go('app.testmasterexcelupload')
        }
        $scope.labparameterexcelupload = function () {
            $state.go('app.labparametermasterexcelupload')
        }
        $scope.insurancemasterexcelupload = function () {
            $state.go('app.insurancemasterexcelupload')
        }
        $scope.patientmasterexcelupload = function () {
            $state.go('app.patientsmasterexcelupload')
        }
        $scope.stockmasterexcelupload = function () {
            $state.go('app.stockmasterexcelupload')
        }
        $scope.vendormasterexcelupload = function () {
            $state.go('app.vendormasterexcelupload')
        }
        $scope.itempricemasterexcelupload = function () {
            $state.go('app.itempricemasterexcelupload')
        }
    }
    ExcelUploadsController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();