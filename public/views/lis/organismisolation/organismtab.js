(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('organismTabController', organismTabController);

    function organismTabController($scope, $stateParams, $state, $translate) {

        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

        $scope.tabs = [
            { title: $translate.instant('Organism Details'), state: 'app.organismtab.orgisolted-form', canDisable: false },
            { title: $translate.instant('Antibiotic Mapping'), state: 'app.organismtab.antibioticorganismmap', canDisable: canDisableTab }
        ];

        $scope.backToList = function() {
            $state.go('app.analytemasters');
        }
        $scope.addNew = function() {
            $state.go('app.organismtab.orgisolted-form', { id: 0, AnalyteName: '' });

        }
        $scope.switchTab = function(tab) {
            if (!canDisableTab) {
                $state.go(tab.state);
            }
        }
    }

    organismTabController.$inject = ['$scope', '$stateParams', '$state', '$translate'];
})();