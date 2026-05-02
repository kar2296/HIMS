(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('drugTabController', drugTabController);

function drugTabController($scope, $stateParams, $state, $translate) {
    
    var canShowTab = parseInt($stateParams.id) > 0 ? true : false;

    $scope.tabs = [
        {title : $translate.instant('clinicalmaster.drugtab.tabdetails.lbl'), state : 'app.drugtab.details', canShow : true },
        {title : $translate.instant('clinicalmaster.drugtab.tabdosagelimits.lbl'), state : 'app.drugtab.dosagelimits',  canShow : canShowTab},
        {title : $translate.instant('clinicalmaster.drugtab.tabdruginstructions.lbl'), state : 'app.drugtab.druginstructions', canShow : false},
        {title : $translate.instant('clinicalmaster.drugtab.tabdrugalerts.lbl'), state : 'app.drugtab.drugalerts', canShow : canShowTab },
        {title : $translate.instant('clinicalmaster.drugtab.tabdrugtallman.lbl'), state : 'app.drugtab.drugtallman',  canShow : canShowTab},
        {title : $translate.instant('clinicalmaster.drugtab.tabdrugdiagnosismap.lbl'), state : 'app.drugtab.drugdiagnosismap', canShow : canShowTab}
    ];
    
    $scope.backToList = function () {
       $state.go('app.drugs');
    }
        $scope.addNew = function () {
            $state.go('app.drugtab.details', { id: 0 });
        }
        $scope.switchTab = function (tab) {
        $state.go(tab.state);    
    }
}

drugTabController.$inject = ['$scope', '$stateParams', '$state', '$translate'];
})();