(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('claimManagementTabController', claimManagementTabController);

    function claimManagementTabController($scope, $stateParams, $state, $translate, utl) {

        var tabvm = this;
        var canDisableTab = parseInt($stateParams.id) > 0 ? true : false;

        $scope.tabs = [{
                title: $translate.instant('billing.claimmanagement.receivedreceipts.lbl'),
                state: 'app.claimmanagement-listtab.receivedreceipts',
                canDisable: canDisableTab
            },
            {
                title: $translate.instant('billing.claimmanagement.newreceipts.lbl'),
                state: 'app.claimmanagement-listtab.newreceipts',
                canDisable: canDisableTab,
                args: {
                    id: 0
                }
            }
        ];

        $scope.switchTab = function (tab) {
            if (!canDisableTab) {
                if (tab.args)
                    $state.go(tab.state, tab.args);
                else
                    $state.go(tab.state);
            }
        }

        $scope.addNew = function () {
            $state.go('app.newreceipts', {
                id: 0
            });
        };
    }

    claimManagementTabController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();