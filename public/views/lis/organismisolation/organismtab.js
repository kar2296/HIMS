(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('organismTabController', organismTabController);

    function organismTabController($scope, $stateParams, $state, $translate) {

        var canDisableTab = parseInt($stateParams.id || 0) == 0 ? true : false;

        $scope.tabs = [
            { title: $translate.instant('Organism Details'), state: 'app.organismtab.orgisolted-form', canDisable: false, icon: 'fa-bacterium' },
            { title: $translate.instant('Antibiotic Mapping'), state: 'app.organismtab.antibioticorganismmap', canDisable: canDisableTab, icon: 'fa-capsules' }
        ];

        $scope.reactProps = {
            id: parseInt($stateParams.id || 0),
            organismName: $stateParams.AnalyteName || '',
            activeState: $state.current.name,
            tabs: $scope.tabs
        };

        $scope.handleAction = function (actionName, payload) {
            $scope.$evalAsync(function () {
                if (actionName === 'switchTab' && payload && payload.state) {
                    $scope.switchTab(payload.tab || { state: payload.state });
                } else if (actionName === 'addNew') {
                    $scope.addNew();
                } else if (actionName === 'backToList') {
                    $scope.backToList();
                }
            });
        };

        $scope.backToList = function () {
            $state.go('app.organismsisolations');
        };

        $scope.addNew = function () {
            $state.go('app.organismtab.orgisolted-form', { id: 0, AnalyteName: '' });
        };

        $scope.switchTab = function (tab) {
            if (!canDisableTab) {
                $state.go(tab.state);
            }
        };
    }

    organismTabController.$inject = ['$scope', '$stateParams', '$state', '$translate'];
})();