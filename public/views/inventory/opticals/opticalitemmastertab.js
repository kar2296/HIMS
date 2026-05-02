(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('OpticalItemMasterTabController', OpticalItemMasterTabController);

    function OpticalItemMasterTabController($scope, $stateParams, $state, $translate) {

        var canDisableTab = parseInt($stateParams.id) === 0 ? true : false;

        $scope.tabs = [
            { title: $translate.instant('inventory.opticalitemmastertab.tabitemmaster.lbl'), state: 'app.opticalitemmastertab.opticalitemmaster', canDisable: false },
            { title: $translate.instant('inventory.opticalitemmastertab.tabitemstock.lbl'), state: 'app.opticalitemmastertab.opticalitemstocklist', canDisable: canDisableTab }
        ];

        $scope.backToList = function() {
            $state.go('app.opticalitemmasterlist');
        };
        $scope.addNew = function() {
            $state.go('app.opticalitemmastertab.opticalitemmaster', { id: 0 });
        }

        $scope.switchTab = function(tab) {
            if (!canDisableTab) {
                $state.go(tab.state);
            }
        };
    }

    OpticalItemMasterTabController.$inject = ['$scope', '$stateParams', '$state', '$translate'];
})();