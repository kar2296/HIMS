(function () {
    'use strict';

    /**
     * Hollow controller for the React EMR Workspace (src/react-components/emr-workspace/).
     * It only maps the AngularJS session/state into reactProps and exposes host callbacks;
     * all data loading and business logic live in the React component.
     */
    angular
        .module('app.pages')
        .controller('emrWorkspaceController', emrWorkspaceController);

    function emrWorkspaceController($scope, $state, $stateParams, utl) {
        var encounter = utl.Session.getPatientEncounter() || null;
        var patientId = parseInt($stateParams.pid || utl.Session.getEMRPatientId(), 10) || 0;
        var encounterId = parseInt($stateParams.eid || (encounter && encounter.Id), 10) || 0;

        $scope.reactProps = {
            context: {
                patientId: patientId,
                encounterId: encounterId,
                consultationId: $stateParams.cid ? parseInt($stateParams.cid, 10) : null,
                userId: parseInt(utl.Session.getCurrentUserId(), 10) || 0,
                userTypeId: parseInt(utl.Session.getUserTypeId(), 10) || 0,
                facilityId: parseInt(utl.Session.getCurrentFacilityId(), 10) || 0
            },
            // Only pass the session encounter when it belongs to the visit being opened.
            encounter: encounter && (!encounterId || encounter.Id === encounterId) ? encounter : null,
            initialTab: $stateParams.tab || '',
            emrContext: $stateParams.context || ''
        };

        // Opens an existing AngularJS modal form and refreshes the React panel afterwards (on save or close).
        // Called from React event handlers (outside a digest), hence $applyAsync.
        $scope.openLegacyModal = function (modalName, params, onClosed, options) {
            $scope.$applyAsync(function () {
                var done = function () {
                    if (typeof onClosed === 'function') {
                        onClosed();
                    }
                };
                var config = {
                    params: params || {},
                    confirmCallback: done,
                    cancelCallback: done
                };
                if (options && options.fixed) {
                    utl.Modal.openFixedDialog(modalName, config);
                } else {
                    utl.Modal.open(modalName, config);
                }
            });
        };

        $scope.navigateTo = function (stateName, params) {
            $scope.$applyAsync(function () {
                $state.go(stateName, params || {});
            });
        };

        // Server-generated documents (consultation print) use the app's existing download path.
        $scope.downloadFile = function (action, data) {
            $scope.$applyAsync(function () {
                utl.Http.doDownload({
                    action: action,
                    data: data,
                    type: 'post'
                });
            });
        };

        // The patientemr parent state loads the encounter asynchronously and broadcasts it.
        var unbind = $scope.$on('patientemr-redraw-topbar', function (event, args) {
            if (args && args.encounter && (!encounterId || args.encounter.Id === encounterId)) {
                $scope.reactProps = angular.extend({}, $scope.reactProps, { encounter: args.encounter });
            }
        });
        $scope.$on('$destroy', unbind);
    }

    emrWorkspaceController.$inject = ['$scope', '$state', '$stateParams', 'utl'];
})();
