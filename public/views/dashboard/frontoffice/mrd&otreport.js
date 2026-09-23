(function () {
    'use strict';

    /**
     * Hollow controller for the React MRD & OT reports menu
     * (src/react-components/legacy-screens/MrdOtReportScreen.tsx).
     * The registered name keeps the '&' because the existing state
     * 'app.ipopreportstab.mrd&otreport' refers to it; the function itself has a valid identifier.
     */
    angular
        .module('app.pages')
        .controller('mrd&otreportController', mrdOtReportController);

    function mrdOtReportController($scope, $state, $translate, utl) {
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));

        // Privileges are read from the session once, instead of on every digest from the template.
        $scope.reactProps = {
            privileges: {
                otSchedule: $scope.HasAccess('mrd&otreport', 'mrdotschedulereport'),
                surgeryEntry: $scope.HasAccess('mrd&otreport', 'mrdsurgeryentryreports')
            },
            labels: {
                otSchedule: $translate.instant('OT Schedule Report'),
                surgeryEntry: $translate.instant('OT Register Report')
            }
        };

        // Called from React event handlers (outside a digest), hence $applyAsync.
        $scope.navigateTo = function (stateName, params) {
            $scope.$applyAsync(function () {
                $state.go(stateName, params || {});
            });
        };
    }

    mrdOtReportController.$inject = ['$scope', '$state', '$translate', 'utl'];

})();
