(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('IPBillmodificationTabController', IPBillmodificationTabController);

    function IPBillmodificationTabController($scope, $stateParams, $state, $translate, utl) {

        var tabvm = this;
        var canDisableTab = false;

        $scope.tabs = [
            { title: $translate.instant('billmodifications.ipbillmodificationtab.actualbills.lbl'), state: 'app.ipbillmodificationtab.ipbill-list', canDisable: false },
            { title: $translate.instant('billmodifications.ipbillmodificationtab.modifiedbills.lbl'), state: 'app.ipbillmodificationtab.ipbillmodification-list', canDisable: false }
        ];

        $scope.backToList = function () {
            $state.go('app.ipbill-list');
        }

        tabvm.currentcontext = {
            id: 0
        };

        $scope.switchTab = function (tab) {
            if (!canDisableTab) {
                $state.go(tab.state);
            }
        }

        if (!$stateParams.id)
            $scope.switchTab($scope.tabs[0]);
    }

    IPBillmodificationTabController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();
