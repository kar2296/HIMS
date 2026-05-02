(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('frequencyTabController', frequencyTabController);

function frequencyTabController($scope, $stateParams, $state, $translate) {
    
    var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

    $scope.tabs = [
        {title : $translate.instant('clinicalmaster.frequencytab.tabdetails.lbl'), state : 'app.frequencytab.details', canDisable : false },
        {title : $translate.instant('clinicalmaster.frequencytab.tabcategory.lbl'), state : 'app.frequencytab.frequencycategories',  canDisable : false},
    ];
    
    $scope.backToList = function () {
       $state.go('app.frequencytab.details');
    }

    $scope.switchTab = function(tab) {
        $state.go(tab.state);
     }
}

frequencyTabController.$inject = ['$scope', '$stateParams', '$state', '$translate'];
})();