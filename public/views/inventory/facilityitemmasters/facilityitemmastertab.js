(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('facilityitemMasterTabController', facilityitemMasterTabController);

    function facilityitemMasterTabController($scope, $stateParams, $state, $translate) {

        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;
        $scope.Iscssd = false;

        $scope.tabs = [
            { title: $translate.instant('inventory.facilityitemmastertab.tabfacilityitemmaster.lbl'), state: 'app.facilityitemmastertab.facilityitemmaster', canDisable: false },
            { title: $translate.instant('inventory.facilityitemmastertab.tabfacilityitemmasterstoremapping.lbl'), state: 'app.facilityitemmastertab.facilityitemmasterstoremapping', canDisable: canDisableTab },
            { title: $translate.instant('inventory.facilityitemmastertab.tabfacilityitemmastervendormapping.lbl'), state: 'app.facilityitemmastertab.facilityitemmastervendormappings', canDisable: canDisableTab },
            { title: $translate.instant('inventory.facilityitemmastertab.tabfacilityitemmastercustomermapping.lbl'), state: 'app.facilityitemmastertab.facilityitemmastercustomermappings', canDisable: canDisableTab },
            //{ title: $translate.instant('inventory.facilityitemmastertab.tabfacilityitemmasterimage.lbl'), state: 'app.facilityitemmastertab.facilityitemmasterimage', canDisable: canDisableTab },
            //{ title: $translate.instant('inventory.facilityitemmastertab.tabfacilityitemmastercontract.lbl'), state: 'app.facilityitemmastertab.facilityitemmastercontract', canDisable: canDisableTab },
            //{ title: $translate.instant('inventory.facilityitemmastertab.tabfacilityitemmasteraliase.lbl'), state: 'app.facilityitemmastertab.facilityitemmasteraliase', canDisable: canDisableTab },
            // { title: $translate.instant('inventory.facilityitemmastertab.tabfacilitycssdsetup.lbl'), state: 'app.facilityitemmastertab.facilitycssdsetup', canDisable: canDisableTab },
            // { title: $translate.instant('inventory.facilityitemmastertab.tabfacilitycssdgroupitems.lbl'), state: 'app.facilityitemmastertab.facilitycssdgroupitems', canDisable: canDisableTab }

        ];

        $scope.backToList = function () {
            $state.go('app.facilityitemmasters');
        }
        $scope.addNew = function () {
            $state.go('app.facilityitemmastertab.facilityitemmaster', { id: 0 });
        };
        $scope.switchTab = function (tab) {
            if (!canDisableTab) {
                $state.go(tab.state);
            }
        }
    }

    facilityitemMasterTabController.$inject = ['$scope', '$stateParams', '$state', '$translate'];
})();
