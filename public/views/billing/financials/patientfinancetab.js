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

    $scope.refreshReactProps = function () {
        $scope.reactProps = {
            tabs: $scope.tabs,
            activeState: $state.current.name
        };
    };

    $scope.handleReactAction = function (actionName, payload) {
        switch (actionName) {
            case 'switchTab':
                var t = $scope.tabs.filter(function (x) { return x.state === payload.state; })[0];
                if (t) {
                    $scope.switchTab(t);
                }
                break;
        }
        $scope.$applyAsync();
    };

    $scope.$on('$stateChangeSuccess', function () {
        $scope.refreshReactProps();
    });

    $scope.refreshReactProps();
}

patientFinanceTabController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();
