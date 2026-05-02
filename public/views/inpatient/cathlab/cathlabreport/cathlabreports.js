(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('cathlabreportsController', cathlabreportsController);

    function cathlabreportsController($scope, $filter, $stateParams, $state, $translate, utl) {
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

        $scope.cathlabschedulereport = function () {
            $state.go('app.cathlabschedulereport', { context: 'cathlabreport' })
        }
        $scope.cathlabentryreports = function () {
            $state.go('app.cathlabentryreports', { context: 'cathlabreport' })
        }
        $scope.cathlabsummarybyprocedure = function () {
            $state.go('app.cathlabsummarybyprocedure', { context: 'cathlabreport' })
        }
        $scope.cathlabsummarybysurgeon = function () {
            $state.go('app.cathlabsummarybysurgeon', { context: 'cathlabreport' })
        }
        $scope.cathlabsummarybyanaesthetist = function () {
            $state.go('app.cathlabsummarybyanaesthetist', { context: 'cathlabreport' })
        }
        $scope.backtoList = function () {
            $state.go('app.cathlabdashboard');
        }

    }
    cathlabreportsController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();