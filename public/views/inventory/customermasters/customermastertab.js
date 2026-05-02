(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('customerMasterTabController', customerMasterTabController);

    function customerMasterTabController($scope, $stateParams, $state, $translate) {

        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

        $scope.tabs = [
            { title: $translate.instant('inventory.customermastertab.tabcustomermaster.lbl'), state: 'app.customermastertab.customermaster', canDisable: false },
            /* { title: $translate.instant('inventory.customermastertab.tabcustomermasterfacilitymapping.lbl'), state: 'app.customermastertab.customermasterfacilitymapping', canDisable: canDisableTab } */
            { title: $translate.instant('inventory.customermastertab.tabcustomermastercontacts.lbl'), state: 'app.customermastertab.customermastercontacts', canDisable: canDisableTab },
            { title: $translate.instant('facilityitemmastercustomermap'), state: 'app.customermastertab.facilityitemmastercustomermap', canDisable: canDisableTab }
        ];

        $scope.backToList = function () {
            $state.go('app.customermasters');
        };

        $scope.switchTab = function (tab) {
            if (!canDisableTab) {
                $state.go(tab.state);
            }
        };
    }

    customerMasterTabController.$inject = ['$scope', '$stateParams', '$state', '$translate'];
})();
