(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('facilityvendorMasterTabController', facilityvendorMasterTabController);

    function facilityvendorMasterTabController($scope, $stateParams, $state, $translate) {

        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

        $scope.tabs = [
            { title: $translate.instant('inventory.facilityvendormastertab.tabfacilityvendormaster.lbl'), state: 'app.facilityvendormastertab.facilityvendormaster', canDisable: false },
            { title: $translate.instant('inventory.facilityvendormastertab.tabfacilityvendormastergst.lbl'), state: 'app.facilityvendormastertab.facilityvendormastergst', canDisable: canDisableTab },
            { title: $translate.instant('inventory.facilityvendormastertab.tabfacilityvendormastererpmapping.lbl'), state: 'app.facilityvendormastertab.facilityvendormastererpmappings', canDisable: canDisableTab },
            { title: $translate.instant('inventory.facilityvendormastertab.tabfacilityvendormastercontacts.lbl'), state: 'app.facilityvendormastertab.facilityvendormastercontacts', canDisable: canDisableTab }
        ];

        $scope.backToList = function () {
            $state.go('app.facilityvendormasters');
        }

        $scope.switchTab = function (tab) {
            if (!canDisableTab) {
                $state.go(tab.state);
            }
        }
    }

    facilityvendorMasterTabController.$inject = ['$scope', '$stateParams', '$state', '$translate'];
})();
