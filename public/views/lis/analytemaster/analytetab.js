(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('analyteTabController', analyteTabController);

    function analyteTabController($scope, $stateParams, $state, $translate) {

        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

        $scope.tabs = [{
                title: $translate.instant('lis.analytetab.tabanalyte.lbl'),
                state: 'app.analytetab.analytemaster',
                canDisable: false
            },
            // {
            //     title: $translate.instant('lis.analytetab.tabanalytealiases.lbl'),
            //     state: 'app.analytetab.analytealiasesmasters',
            //     canDisable: canDisableTab
            // },
            {
                title: $translate.instant('lis.analytetab.tabanalyterefs.lbl'),
                state: 'app.analytetab.analyterefmasters',
                canDisable: canDisableTab
            },
            // {title : $translate.instant('lis.analytetab.analysernormaltemplate.lbl'), state : 'app.analytetab.analysertemplate', canDisable : canDisableTab }
        ];

        $scope.backToList = function () {
            $state.go('app.analytemasters');
        }
        $scope.addNew = function () {
            $state.go('app.analytetab.analytemaster', {
                id: 0,
                AnalyteName: ''
            });

        }
        $scope.switchTab = function (tab) {
            if (!canDisableTab) {
                $state.go(tab.state);
            }
        }
    }

    analyteTabController.$inject = ['$scope', '$stateParams', '$state', '$translate'];
})();