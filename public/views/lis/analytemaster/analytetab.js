(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('analyteTabController', analyteTabController);

    function analyteTabController($scope, $stateParams, $state, $translate, $rootScope) {

        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

        $scope.tabs = [{
                title: $translate.instant('lis.analytetab.tabanalyte.lbl') || 'Analyte Master',
                state: 'app.analytetab.analytemaster',
                canDisable: false,
                icon: 'fa-vial-virus'
            },
            {
                title: $translate.instant('lis.analytetab.tabanalyterefs.lbl') || 'Analyte Reference Ranges',
                state: 'app.analytetab.analyterefmasters',
                canDisable: canDisableTab,
                icon: 'fa-table-list'
            }
        ];

        $scope.backToList = function () {
            $state.go('app.analytemasters');
        };

        $scope.addNew = function () {
            $state.go('app.analytetab.analytemaster', {
                id: 0,
                AnalyteName: ''
            }, { reload: true });
        };

        $scope.switchTab = function (tab) {
            if (!canDisableTab && tab && tab.state) {
                $state.go(tab.state);
            }
        };

        // React bridge
        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                id: parseInt($stateParams.id) || 0,
                analyteName: $stateParams.AnalyteName || '',
                activeState: $state.current.name,
                tabs: $scope.tabs
            };
        };

        $scope.handleReactAction = function (actionName, payload) {
            if (actionName === 'addNew') {
                $scope.addNew();
            } else if (actionName === 'backToList') {
                $scope.backToList();
            } else if (actionName === 'switchTab') {
                if (payload && payload.tab) {
                    $scope.switchTab(payload.tab);
                } else if (payload && payload.state) {
                    $state.go(payload.state);
                }
            }
        };

        $scope.refreshReactProps();

        var stateWatcher = $rootScope.$on('$stateChangeSuccess', function () {
            $scope.refreshReactProps();
        });
        $scope.$on('$destroy', function () {
            if (stateWatcher) stateWatcher();
        });
    }

    analyteTabController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$rootScope'];
})();