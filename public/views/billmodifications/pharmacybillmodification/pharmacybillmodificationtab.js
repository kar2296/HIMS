(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PharmacyBillmodificationTabController', PharmacyBillmodificationTabController);

    function PharmacyBillmodificationTabController($scope, $stateParams, $state, $translate, utl) {

        var tabvm = this;
        var canDisableTab = false;

        $scope.tabs = [
            { title: $translate.instant('billmodifications.opbillmodificationtab.actualbills.lbl'), state: 'app.pharmacybillmodificationtab.pharmacybill-list', canDisable: false },
            { title: $translate.instant('billmodifications.opbillmodificationtab.modifiedbills.lbl'), state: 'app.pharmacybillmodificationtab.pharmacybillmodification-list', canDisable: false }
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

    PharmacyBillmodificationTabController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();
