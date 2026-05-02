(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('surgeryreportsController', surgeryreportsController);

    function surgeryreportsController($scope, $filter, $stateParams, $state, $translate, utl) {
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

        $scope.otschedulereport = function () {
            $state.go('app.otschedulereport', { context: 'surgeryreport' })
        }
        $scope.surgeryentryreports = function () {
            $state.go('app.surgeryentryreports', { context: 'surgeryreport' })
        }
        $scope.surgerysummarybyprocedure = function () {
            $state.go('app.surgerysummarybyprocedure', { context: 'surgeryreport' })
        }
        $scope.surgerysummarybysurgeon = function () {
            $state.go('app.surgerysummarybysurgeon', { context: 'surgeryreport' })
        }
        $scope.surgerysummarybyanaesthetist = function () {
            $state.go('app.surgerysummarybyanaesthetist', { context: 'surgeryreport' })
        }
        $scope.backtoList = function () {
            $state.go('app.surgerydashboard');
        }

    }
    surgeryreportsController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();