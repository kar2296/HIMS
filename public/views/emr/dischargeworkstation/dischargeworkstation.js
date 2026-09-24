(function () {
    'use strict';

    /**
     * Hollow controller for the React Discharge Summary Workstation
     * (src/react-components/discharge-workstation/). It only maps the AngularJS session/state into
     * reactProps and exposes host callbacks; all data loading and business logic live in React.
     *
     * app.emrdischargesummary            -> in-patient worklist (no patient preselected)
     * patientemr.dischargeworkstation    -> the current patient's admission
     */
    angular
        .module('app.pages')
        .controller('dischargeWorkstationController', dischargeWorkstationController);

    function dischargeWorkstationController($scope, $state, $stateParams, utl) {
        var inPatientEmr = ($state.current.name || '').indexOf('patientemr.') === 0;
        var encounterId = 0;
        if (inPatientEmr) {
            var encounter = utl.Session.getPatientEncounter() || null;
            encounterId = parseInt($stateParams.eid || (encounter && encounter.Id), 10) || 0;
        }

        $scope.reactProps = {
            context: {
                patientEmr: inPatientEmr,
                encounterId: encounterId,
                userId: parseInt(utl.Session.getCurrentUserId(), 10) || 0,
                facilityId: parseInt(utl.Session.getCurrentFacilityId(), 10) || 0
            }
        };

        // Called from React event handlers (outside a digest), hence $applyAsync.
        $scope.navigateTo = function (stateName, params) {
            $scope.$applyAsync(function () {
                $state.go(stateName, params || {});
            });
        };

        // Existing server-generated PDFs (PrintPatientCertificate) use the app's download path.
        $scope.downloadFile = function (action, data) {
            $scope.$applyAsync(function () {
                utl.Http.doDownload({
                    action: action,
                    data: data,
                    type: 'post'
                });
            });
        };

        // Inside the patient EMR the encounter can arrive after this controller starts.
        if (inPatientEmr && !encounterId) {
            var unbind = $scope.$on('patientemr-redraw-topbar', function (event, args) {
                if (args && args.encounter && args.encounter.Id) {
                    $scope.reactProps = angular.extend({}, $scope.reactProps, {
                        context: angular.extend({}, $scope.reactProps.context, { encounterId: args.encounter.Id })
                    });
                    unbind();
                }
            });
            $scope.$on('$destroy', unbind);
        }
    }

    dischargeWorkstationController.$inject = ['$scope', '$state', '$stateParams', 'utl'];
})();
