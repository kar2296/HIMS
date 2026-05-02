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
    }

    PatientFollowupTabController.$inject = ['$scope', '$stateParams', '$state', '$translate'];
})();