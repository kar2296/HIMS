(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('newgeneralitemMasterTabController', newgeneralitemMasterTabController);

    function newgeneralitemMasterTabController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout) {

        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));
        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;
        $scope.Iscssd = false;

        $scope.tabs = []

        //   if ($scope.CanItemDetails) {
        $scope.tabs.push({ title: $translate.instant('Item Details(General)'), state: 'app.newitemmastertabgeneral.itemmastergeneral', canDisable: false });
        // }
        // if ($scope.CanUomConversion) {
        $scope.tabs.push({ title: $translate.instant('inventory.itemmastertab.tabitemmasteruomconversion.lbl'), state: 'app.newitemmastertabgeneral.itemmasteruomconversiongeneral', canDisable: false });
        // }
        // if ($scope.CanStoreAssociation) {inventory.itemmastertab.tabitemmasteruomconversion.lbl'), state: 'app.newitemmastertab.itemmasteruomconversion', canDisable: false });
        // }
        // if ($scope.CanStoreAssociation) {
        $scope.tabs.push({ title: $translate.instant('Store Mapping'), state: 'app.newitemmastertabgeneral.itemmasterstoremappinggeneral', canDisable: false });
        // }
        // if ($scope.CanHospitalMapping) {
        $scope.tabs.push({ title: $translate.instant('inventory.itemmastertab.tabitemmasterfacilitymapping.lbl'), state: 'app.newitemmastertabgeneral.itemmasterfacilitymappinggeneral', canDisable: false });
        // }
        // if ($scope.CanSupplierMapping) {
        $scope.tabs.push({ title: $translate.instant('inventory.itemmastertab.tabitemmastervendormapping.lbl'), state: 'app.newitemmastertabgeneral.itemmastervendormappingsgeneral', canDisable: false });
        // }
        // if ($scope.CanContract) {
        //     $scope.tabs.push({ title: $translate.instant('inventory.itemmastertab.tabitemmastercontract.lbl'), state: 'app.newitemmastertab.itemmastercontract', canDisable: false });
        // }

        $scope.backToList = function () {
            $state.go('app.itemmasters');
        }
        $scope.backtoList = function () {
            $state.go('app.Inventorymastermanagement');
        }
        $scope.addNew = function () {
            $state.go('app.itemmastertab.itemmaster', {
                id: 0
            });
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.switchTab = function (tab) {
            if (!canDisableTab) {
                $state.go(tab.state);
            }
        }
    }

    newgeneralitemMasterTabController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];
})();
