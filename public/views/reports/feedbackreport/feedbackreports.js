(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('FeedbackReportController', FeedbackReportController);

    function FeedbackReportController($scope, $filter, $stateParams, $state, $translate, utl) {
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

        $scope.feedbackdetailforopreport = function () {
            $state.go('app.feedbackdetailforopreport')
        }
        $scope.feedbacksummaryforopreport = function () {
            $state.go('app.feedbacksummaryforopreport')
        }
        $scope.feedbacksummaryforipreport = function () {
            $state.go('app.feedbacksummaryforipreport')
        }

        $scope.backtoList = function () {
            $state.go('app.feedbackreports');
        }

    }
    FeedbackReportController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();