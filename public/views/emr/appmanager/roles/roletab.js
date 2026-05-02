(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('roleTabController', roleTabController);

function roleTabController($rootScope,$scope, $stateParams, $state, $translate,$timeout) {
    
        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

    $scope.tabs = [
            { title: $translate.instant('appmanager.roletab.tabgeneral.lbl'), state: 'app.roletab.general', canDisable: false },
            { title: $translate.instant('appmanager.roletab.tabrolefacilitymap.lbl'), state: 'app.roletab.facility', canDisable: canDisableTab },
            { title: $translate.instant('appmanager.roletab.tabspecialprivilege.lbl'), state: 'app.roletab.roleprivileges', canDisable: canDisableTab },
            { title: $translate.instant('appmanager.roletab.tabmobileconfig.lbl'), state: 'app.roletab.mobileappconfig', canDisable: canDisableTab }
        ];
    $timeout(function () {
        removeFloatingNav();
    }, 100);

    function removeFloatingNav() {
        $rootScope.app.layout.isCollapsed = true;
    }

    $scope.backToList = function () {
       $state.go('app.roles');
    }
        $scope.switchTab = function (tab) {
            if (!canDisableTab) {
        $state.go(tab.state);    
    }
        }
        $scope.addNew = function () {
            $state.go('app.roletab.general', { id: 0 });
    }
     
}

roleTabController.$inject = ['$rootScope','$scope', '$stateParams', '$state', '$translate', '$timeout'];
})();