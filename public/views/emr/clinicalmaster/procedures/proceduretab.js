(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('procedureTabController', procedureTabController);

function procedureTabController($scope, $stateParams, $state, $translate) {
    
    var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;
    
    $scope.tabs = [
        {title : $translate.instant('clinicalmaster.proceduretab.tabdetails.lbl'), state : 'app.proceduretab.details', canDisable : true },
        {title : $translate.instant('clinicalmaster.proceduretab.tabprocedurealiases.lbl'), state : 'app.proceduretab.procedurealiases',  canDisable : canDisableTab},
        {title : $translate.instant('clinicalmaster.proceduretab.proceduretemplates.lbl'), state : 'app.proceduretab.proceduretemplates',  canDisable : canDisableTab}
    ];
    
    $scope.backToList = function () {
       $state.go('app.procedures');
    }
  $scope.addNew = function() {
        $state.go('app.proceduretab.details', { id:0 });
    }
    $scope.switchTab = function(tab) {
        $state.go(tab.state);
               
    }
}

procedureTabController.$inject = ['$scope', '$stateParams', '$state', '$translate'];
})();