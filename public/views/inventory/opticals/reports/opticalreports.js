(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('OpticalReportsController', OpticalReportsController);

    function OpticalReportsController($rootScope,$timeout,$scope, $filter, $stateParams, $state, $translate, utl) {
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
        $scope.dailycollect = function () {
            $state.go('app.opticalcollectionreport')
        }
        $scope.dailybilldetails = function () {
            $state.go('app.opticaldailybillreport')
        }
        $scope.optitems = function () {
            $state.go('app.opticalitemdetailsreport')
        }
        $scope.purchasedetails = function () {
            $state.go('app.opticalpurchasedetailreport')
        }
        $scope.currentstock = function () {
            $state.go('app.opticalstockreport')
        }
        
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

    }
    OpticalReportsController.$inject = ['$rootScope','$timeout','$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();