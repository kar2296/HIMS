(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ReferralFeedbackTabController', ReferralFeedbackTabController);

    function ReferralFeedbackTabController($scope, $stateParams, $state, $translate) {

        //var canDisableTab = parseInt($stateParams.id) === 0 ? true : false;

        $scope.tabs = [
            { title: $translate.instant('medicalcertificate.referralfeedback.referrallist.lbl'), state: 'app.referralfeedbacktab.referrallist', canDisable: false },
            { title: $translate.instant('medicalcertificate.referralfeedback.referralfeedback.lbl'), state: 'app.referralfeedbacktab.referralfeedbacks', canDisable: false },
        ];
        $scope.switchTab = function (tab) {
            $state.go(tab.state);
        };
    }
    ReferralFeedbackTabController.$inject = ['$scope', '$stateParams', '$state', '$translate'];
})();