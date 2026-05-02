(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('referralTabController', referralTabController);

    function referralTabController($scope, $stateParams, $state, $translate) {

        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

        $scope.tabs = [
            { title: $translate.instant('generalmaster.referraltab.tabdetails.lbl'), state: 'app.referraltab.details', canDisable: false },
            { title: $translate.instant('generalmaster.referraltab.tabreferralusermap.lbl'), state: 'app.referraltab.user', canDisable: canDisableTab },
            { title: $translate.instant('generalmaster.referraltab.tabreferralcharge.lbl'), state: 'app.referraltab.referralcharge', canDisable: canDisableTab }
        ];

        $scope.backToList = function () {
            $state.go('app.referrals');
        }

       $scope.switchTab = function(tab) {
        if(!canDisableTab){
            $state.go(tab.state);
        }    
    }
    }

    referralTabController.$inject = ['$scope', '$stateParams', '$state', '$translate'];
})();