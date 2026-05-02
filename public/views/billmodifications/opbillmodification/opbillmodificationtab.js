(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('OPBillmodificationTabController', OPBillmodificationTabController);

    function OPBillmodificationTabController($scope, $stateParams, $state, $translate, utl) {

        var tabvm = this;
        var canDisableTab = false;

        $scope.tabs = [
            { title: $translate.instant('billmodifications.opbillmodificationtab.actualbills.lbl'), state: 'app.opbillmodificationtab.opbill-list', canDisable: false },
            { title: $translate.instant('billmodifications.opbillmodificationtab.modifiedbills.lbl'), state: 'app.opbillmodificationtab.opbillmodification-list', canDisable: false }
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

    OPBillmodificationTabController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();
