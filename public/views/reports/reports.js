(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ReportController', ReportController);

    function ReportController($scope, $filter, $stateParams, $state, $translate, utl) {
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
         $scope.collectionreport = function () {
            $state.go('app.collectionreports')
        }
         $scope.dailybills = function () {
            $state.go('app.dailybillreports')
        }
        $scope.discount = function () {
            $state.go('app.discountreports')
        }
         $scope.outstanding = function () {
            $state.go('app.outstandingreports')
        }
        $scope.labsummary = function () {
            $state.go('app.labsummaryreports')
        }
        $scope.collectionreportbyuser = function () {
            $state.go('app.collectionreportbyusers')
        }
        $scope.tatrrep = function () {
            $state.go('app.tatrrep')
        }
        $scope.testmasterprice = function () {
            $state.go('app.testmasterprice')
        }
        $scope.testmasterwithparameter = function () {
            $state.go('app.testmasterwithparameter')
        }
        $scope.monthlyrevenuebytest = function () {
            $state.go('app.monthlyrevenuebytest')
        }
        $scope.cancelreport = function () {
            $state.go('app.cancelreport')
        }
        $scope.refundreport = function () {
            $state.go('app.refundreport')
        }
        $scope.usermasterreport = function () {
            $state.go('app.usermasterreport')
        }
        $scope.purchaseorderreport = function() {
            $state.go('app.purchaseorderreport')
        } 
        $scope.grnreport = function() {
            $state.go('app.grnreport')
        }
        $scope.pendingporeport = function() {
            $state.go('app.pendingporeport')
        }
        $scope.stockissuevocherreport = function() {
            $state.go('app.stockissuevocherreport')
        }
        $scope.stockindentreport = function() {
            $state.go('app.stockindentreport')
        }
        $scope.medicineexpiryreport = function() {
            $state.go('app.medicineexpiryreport')
        }
        $scope.medicineexpiredreport = function() {
            $state.go('app.medicineexpiredreport')
        }
        $scope.pharmacystockreport = function() {
            $state.go('app.pharmacystockreport')
        }
        $scope.pharmacybilldetailreport = function() {
            $state.go('app.pharmacybilldetailreport')
        }
        $scope.pharmacydiscountreport = function() {
            $state.go('app.pharmacydiscountreport')
        }
        $scope.pharmacyduereport = function() {
            $state.go('app.pharmacyduereport')
        }
        $scope.pharmacyreturnreport = function() {
            $state.go('app.pharmacyreturnreport')
        }
        $scope.pharmacyschedulereport = function() {
            $state.go('app.pharmacyschedulereport')
        }
        $scope.pharmacyschedulexreport = function() {
            $state.go('app.pharmacyschedulexreport')
        }
        $scope.pharmacycardcollectionreport = function () {
            $state.go('app.pharmacycardcollectionreport')
        }
        $scope.pharmacycollectionreport = function () {
            $state.go('app.pharmacycollectionreport')
        }
        $scope.pharmacyrefundreport = function () {
            $state.go('app.pharmacyrefundreport')
        }
        $scope.pharmacycollectionsummaryreport = function () {
            $state.go('app.pharmacycollectionsummaryreport')
        }
        $scope.backtoList = function () {
            if($scope.Context=='frontoffice'){
            $state.go('app.frontdashboard');
            }else if($scope.Context=='billing'){
                $state.go('app.billingsdashboard');
            }else if($scope.Context=='nursing'){
                $state.go('app.nursingdashboard');
            }else if($scope.Context=='pharmacy'){
                $state.go('app.pharmacydashboard');
            }else if($scope.Context=='store'){
                $state.go('app.storedashboard');
            }else if($scope.Context=='lab'){
                $state.go('app.labdashboard');
            }else if($scope.Context=='ris'){
                $state.go('app.ris_dashboard');
            }
        }

    }
    ReportController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();