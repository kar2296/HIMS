(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('ReturnWorkListTabController', ReturnWorkListTabController);

function ReturnWorkListTabController($scope, $stateParams, $state, $translate, utl) {
    
    var tabvm = this;
	var canDisableTab = false;

    $scope.tabs = [
        {title : $translate.instant('billing.returnworklisttab.pendingreturns.lbl'), state : 'app.returnworklisttab.returnworklists', canDisable : false },
        {title : $translate.instant('billing.returnworklisttab.returnedlist.lbl'), state : 'app.returnworklisttab.patientreturns', canDisable : false }               
    ];
    
    $scope.backToList = function () {
       $state.go('app.dispenseworklists');
    }
	
	tabvm.currentcontext = {
            id: 0
        };

    $scope.switchTab = function(tab) {
        if(!canDisableTab){
        $state.go(tab.state);
        } 
    }
}

ReturnWorkListTabController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();
