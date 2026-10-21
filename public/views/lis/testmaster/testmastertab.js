(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('testmasterTabController', testmasterTabController);

    function testmasterTabController($scope, $stateParams, $state, $translate, $rootScope) {

        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

        $scope.tabs = [{
                title: $translate.instant('lis.testmastertab.tabtestmaster.lbl') || 'General Test Master',
                state: 'app.testmastertab.testmaster',
                canDisable: false,
                icon: 'fa-flask-vial'
            },
            {
                title: $translate.instant('lis.testmastertab.tabtestanalyte.lbl') || 'Test Analyte Mapping',
                state: 'app.testmastertab.testmasteranalytemaps',
                canDisable: canDisableTab,
                icon: 'fa-sitemap'
            },
            {
                title: $translate.instant('lis.testmastertab.tabbom.lbl') || 'Bill of Materials (BOM)',
                state: 'app.testmastertab.testbommasters',
                canDisable: canDisableTab,
                icon: 'fa-boxes-stacked'
            }
        ];

        $scope.backToList = function () {
            $state.go('app.testmasters');
        };

        $scope.addNew = function () {
            $state.go('app.testmastertab.testmaster', { id: 0, TestName: '', TestCode: '' }, { reload: true });
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
                testName: $stateParams.TestName || '',
                testCode: $stateParams.TestCode || '',
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

    testmasterTabController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$rootScope'];
})();