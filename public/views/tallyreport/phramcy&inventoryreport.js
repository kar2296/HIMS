(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('phramcyInventoryreportController', phramcyInventoryreportController);

    function phramcyInventoryreportController($scope, $filter, $stateParams, $state, $translate, utl) {
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
        $scope.purchasereport = function () {
            $state.go('app.tally-purchase');
        }      
        $scope.purchasereturnreport = function () {
            $state.go('app.tally-purchasereturn');
        }    
        $scope.salesreport = function () {
            $state.go('app.tallysalesreport');
        }  
        $scope.salesreturnreport = function () {
            $state.go('app.tallysalesreturnreport');
        }
        $scope.collectionreport = function () {
            $state.go('app.tallycollectionreport');
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
    phramcyInventoryreportController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();