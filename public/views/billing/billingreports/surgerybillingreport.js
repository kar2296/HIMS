(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('SurgeryBillingReportController', SurgeryBillingReportController);

    function SurgeryBillingReportController($scope, $filter, $stateParams, $state, $translate, utl) {
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
       
        $scope.surgeryreport = function () {
            $state.go('app.surgeryschedulereports', { context: 'surgerybillingreport' })
        }
        $scope.surgeryentry = function () {
            $state.go('app.surgeryentryreports', { context: 'surgerybillingreport' })
        }
        $scope.surgeryprocedure = function () {
            $state.go('app.surgeryschedulebyprocedure', { context: 'surgerybillingreport' })
        } 
        $scope.otschedulereport = function () {
            $state.go('app.otschedulereport', { context: 'surgerybillingreport' })
        }
        $scope.surgerysummarybyprocedure = function () {
            $state.go('app.surgerysummarybyprocedure', { context: 'surgerybillingreport' })
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

        // ---- React bridge (UI-MODERNIZATION RETROFIT) ----
        // No async data here -- visibility of each report row is privilege-
        // gated via the real HasAccess() (utl.Ctrl.getPrivilegeCtrl), called
        // here and passed through as booleans rather than reimplemented.
        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                canOtScheduleReport: $scope.HasAccess('Surgeryreports', 'otschedulereport'),
                canSurgeryEntry: $scope.HasAccess('Surgeryreports', 'surgeryentry'),
                canSurgerySummaryByProcedure: $scope.HasAccess('Surgeryreports', 'surgerysummarybyprocedure')
            };
        };
        $scope.refreshReactProps();

        $scope.handleReactAction = function (actionName) {
            if (typeof $scope[actionName] === 'function') {
                $scope[actionName]();
            }
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

    }
    SurgeryBillingReportController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();