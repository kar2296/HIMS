(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('assetreportsController', assetreportsController);

    function assetreportsController($rootScope, $scope, $filter, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        //Timeout
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.assetdetailreport = function () {
            $state.go('app.assetdetailreport')
        }
        $scope.assetwarrantyexpiredreport = function () {
            $state.go('app.assetwarrantyexpiredreport')
        }
        $scope.assetwarrantyexpiryreport = function () {
            $state.go('app.assetwarrantyexpiryreport')
        }
        $scope.assetmaintenancereport = function () {
            $state.go('app.assetmaintenancereport')
        }
        $scope.assetinsurancedetailreport = function () {
            $state.go('app.assetinsurancedetailreport')
        }
        $scope.assettransferdetailreport = function () {
            $state.go('app.assettransferdetailreport')
        }
        $scope.assetauditreport = function () {
            $state.go('app.assetauditreport')
        }
        $scope.assetreconcilereport = function () {
            $state.go('app.assetreconcilereport')
        }
        $scope.assetgatepassreport = function () {
            $state.go('app.assetgatepassreport')
        }
        $scope.newassetrequestreport = function () {
            $state.go('app.newassetrequestreport')
        }
        $scope.assetsummarybydepartmentreport = function () {
            $state.go('app.assetsummarybydepartmentreport')
        }
        $scope.assetmovementreport = function () {
            $state.go('app.assetmovementreport')
        }
        $scope.assetaccessoriesreport = function () {
            $state.go('app.assetaccessoriesreport')
        }


    }
    assetreportsController.$inject = ['$rootScope', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();