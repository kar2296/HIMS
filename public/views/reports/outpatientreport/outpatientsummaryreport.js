(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('OutPatientSummaryReportController', OutPatientSummaryReportController);

    function OutPatientSummaryReportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.items = [];
        $scope.currentcontext = {};
        $scope.currentfilter = {
            From: utl.Formatter.getCurrentDate(),
            To: utl.Formatter.getCurrentDate(),
        }
        $scope.currentcontext = {
            FacilityId: utl.Session.getCurrentFacilityId(),
        };
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.GetFacilityDashboardOptionsCallBack = function (scope, res, options, hasError) {
            $scope.FacilityInfo = res;
        }
        $scope.GetFacilityDashboardOptions = function () {
            var startTime = new Date($scope.currentfilter.From);
            var endTime = new Date($scope.currentfilter.To);
            var difference = endTime.getTime() - startTime.getTime();
            var resultInDays = Math.round(difference / (1000 * 60 * 60 * 24)); // Calculate difference in days
            if (!(resultInDays >= 0 && resultInDays <= 31)) { // Check if difference is less than 15 days
                utl.Alert.showSuccessMsg("From and To Date Difference should be less than one month...");
                $scope.currentfilter.From = new Date();
                $scope.currentfilter.To = new Date();
                return false;
            }
            $scope.currentcontext.FromDate = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            $scope.currentcontext.ToDate = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    Keys: [{ Key: 'encounter' }
                    ]
                },
                Attributes: $scope.currentcontext
            };

            var options = {
                action: 'SystemSettings/facilitydashboard/GetFacilityDashboardOptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.GetFacilityDashboardOptionsCallBack
            };
            utl.Http.doAction(options);
        };
        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId()
                }
            };
            var options = {
                action: 'Visit/Visit/PrintOutpatientSummary',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };
        $scope.onenter = function (data) {
            if (data == undefined) {
                // $scope.getList();
            }
        };
        $scope.backtoReport = function () {
            if ($scope.Context == 'outpatientreport') {
                $state.go('app.ipopreportstab.outpatientreport');
            } if ($scope.Context == 'mrdreports') {
                $state.go('app.mrdreports');
            }
        };

    }

    OutPatientSummaryReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();