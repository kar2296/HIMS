(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('PatientFollowupTabController', PatientFollowupTabController);

    function PatientFollowupTabController($scope, $stateParams, $state, $translate) {

        //var canDisableTab = parseInt($stateParams.id) === 0 ? true : false;

        $scope.tabs = [
            { title: $translate.instant('registration.patientfollowup.pending.lbl'), state: 'app.patientfollowuptab.pending', canDisable: false },
            { title: $translate.instant('registration.patientfollowup.followup.lbl'), state: 'app.patientfollowuptab.followup', canDisable: false },


        ];


        $scope.switchTab = function(tab) {

                $state.go(tab.state);

        };

        // ---------------------------------------------------------------
        // REACT BRIDGE WIRING (migrated to PatientFollowupTabScreen.tsx).
        // All logic above is untouched.
        // ---------------------------------------------------------------
        $scope.reactProps = {
            tabs: $scope.tabs
        };

        $scope.handleReactAction = function (actionName, payload) {
            switch (actionName) {
                case 'switchTab':
                    $scope.switchTab({ state: payload.state });
                    break;
                default:
                    break;
            }
            $scope.$applyAsync();
        };
    }

    PatientFollowupTabController.$inject = ['$scope', '$stateParams', '$state', '$translate'];
})();