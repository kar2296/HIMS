(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientFinanceTabController', patientFinanceTabController);

function patientFinanceTabController($scope, $stateParams, $state, $translate, utl) {
    
    var tabvm = this;
	var canDisableTab = false;

    $scope.tabs = [
        {title : $translate.instant('billing.patientfinancetab.patientadjustmentinfo.lbl'), state : 'app.patientfinancetab.patientadjustmentinfo', canDisable : false },
        {title : $translate.instant('billing.patientfinancetab.patientrevenueinfo.lbl'), state : 'app.patientfinancetab.patientrevenueinfo', canDisable : false }               
    ];
	
	tabvm.currentcontext = {
            id: 0
        };

    $scope.switchTab = function(tab) {
        if(!canDisableTab){
        $state.go(tab.state);
        } 
    }
}

patientFinanceTabController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();
