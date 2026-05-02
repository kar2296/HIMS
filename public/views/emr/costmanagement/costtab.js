(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('costTabController', costTabController);

    function costTabController($scope, $stateParams, $state, $translate) {

        //$scope.setPageTitle($scope.i18n.appmanager.usertab.pagetitle.lbl);
        // var tabvm = this;
        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

        $scope.tabs = [
            { title: $translate.instant('costmanagement.costtab.tabdetails.lbl'), state: 'app.costtab.details', canDisable: false },
            { title: $translate.instant('costmanagement.costtab.tablabourcost.lbl'), state: 'app.costtab.labourcosts', canDisable: canDisableTab },
            { title: $translate.instant('costmanagement.costtab.tabpowercost.lbl'), state: 'app.costtab.powercosts', canDisable: canDisableTab },
            { title: $translate.instant('costmanagement.costtab.tabnationalrent.lbl'), state: 'app.costtab.notionalrents', canDisable: canDisableTab },
            { title: $translate.instant('costmanagement.costtab.tabconsumables.lbl'), state: 'app.costtab.consumables', canDisable: canDisableTab },
            // { title: $translate.instant('costmanagement.costtab.tabradiationbatches.lbl'), state: 'app.costtab.radiationbatches', canDisable: canDisableTab },
            // { title: $translate.instant('costmanagement.costtab.tabdepreciation.lbl'), state: 'app.costtab.depreciation', canDisable: canDisableTab },
            // { title: $translate.instant('costmanagement.costtab.tabstatistics.lbl'), state: 'app.costtab.statistics', canDisable: canDisableTab },

        ];

        $scope.backToList = function () {
            $state.go('app.costs');
        }
        $scope.addNew = function () {
            $state.go('app.costtab.details', { id: 0 });
        }

      $scope.switchTab = function(tab) {
        if(!canDisableTab){
            $state.go(tab.state);
        }    
    }
    }

    costTabController.$inject = ['$scope', '$stateParams', '$state', '$translate'];
})();