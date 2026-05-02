(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('drugFrequencyTabController', drugFrequencyTabController);

function drugFrequencyTabController($scope, $stateParams, $state, $translate) {
    
    var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

    $scope.tabs = [
        {title : $translate.instant('clinicalmaster.drugfrequencytab.tabdetails.lbl'), state : 'app.drugfrequencytab.details', canDisable : false },
        {title : $translate.instant('clinicalmaster.drugfrequencytab.tabcategory.lbl'), state : 'app.drugfrequencytab.frequencycategories',  canDisable : false },
    ];
    
    $scope.backToList = function () {
       $state.go('app.drugfrequencytab.details');
    }

    $scope.switchTab = function(tab) {
        
        $state.go(tab.state);
            
    }
}

drugFrequencyTabController.$inject = ['$scope', '$stateParams', '$state', '$translate'];
})();