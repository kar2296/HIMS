(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('itemMasterTabController', itemMasterTabController);

    function itemMasterTabController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout) {

        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));
        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;
        $scope.Iscssd = false;
        $scope.PrevItem = '';
        // $scope.tabs = [
        //     { title: $translate.instant('inventory.itemmastertab.tabitemmaster.lbl'), state: 'app.itemmastertab.itemmaster', canDisable: false },
        //     { title: $translate.instant('inventory.itemmastertab.tabitemmasteruomconversion.lbl'), state: 'app.itemmastertab.itemmasteruomconversion', canDisable: canDisableTab },
        //     { title: $translate.instant('inventory.itemmastertab.tabitemmasterstoremapping.lbl'), state: 'app.itemmastertab.itemmasterstoremapping', canDisable: canDisableTab },
        //     { title: $translate.instant('inventory.itemmastertab.tabitemmasterfacilitymapping.lbl'), state: 'app.itemmastertab.itemmasterfacilitymapping', canDisable: canDisableTab },
        //     { title: $translate.instant('inventory.itemmastertab.tabitemmastervendormapping.lbl'), state: 'app.itemmastertab.itemmastervendormappings', canDisable: canDisableTab },
        //     //{ title: $translate.instant('inventory.itemmastertab.tabitemmastercustomermapping.lbl'), state: 'app.itemmastertab.itemmastercustomermappings', canDisable: canDisableTab },
        //     // { title: $translate.instant('inventory.itemmastertab.tabitemmasterimage.lbl'), state: 'app.itemmastertab.itemmasterimage', canDisable: canDisableTab },
        //     { title: $translate.instant('inventory.itemmastertab.tabitemmastercontract.lbl'), state: 'app.itemmastertab.itemmastercontract', canDisable: canDisableTab },
        //     // { title: $translate.instant('inventory.itemmastertab.tabitemmasterprice.lbl'), state: 'app.itemmastertab.itemmasterprice', canDisable: canDisableTab },
        //     // { title: $translate.instant('inventory.itemmastertab.tabitemmasteraliase.lbl'), state: 'app.itemmastertab.itemmasteraliase', canDisable: canDisableTab },
        //     //{ title: $translate.instant('inventory.itemmastertab.tabcssdsetup.lbl'), state: 'app.itemmastertab.cssdsetup', canDisable: canDisableTab },
        //     //{ title: $translate.instant('inventory.itemmastertab.tabcssdgroupitems.lbl'), state: 'app.itemmastertab.cssdgroupitems', canDisable: canDisableTab }

        // ];

        $scope.tabs = []

        //   if ($scope.CanItemDetails) {
        $scope.tabs.push({ title: $translate.instant('inventory.itemmastertab.tabitemmaster.lbl'), state: 'app.itemmastertab.itemmaster', canDisable: false });
        // }
        // if ($scope.CanUomConversion) {
        $scope.tabs.push({ title: $translate.instant('inventory.itemmastertab.tabitemmasteruomconversion.lbl'), state: 'app.itemmastertab.itemmasteruomconversion', canDisable: false });
        // }
        // if ($scope.CanStoreAssociation) {inventory.itemmastertab.tabitemmasteruomconversion.lbl'), state: 'app.itemmastertab.itemmasteruomconversion', canDisable: false });
        // }
        // if ($scope.CanStoreAssociation) {
        $scope.tabs.push({ title: $translate.instant('Store Mapping'), state: 'app.itemmastertab.itemmasterstoremapping', canDisable: false });
        // }
        // if ($scope.CanHospitalMapping) {
        $scope.tabs.push({ title: $translate.instant('inventory.itemmastertab.tabitemmasterfacilitymapping.lbl'), state: 'app.itemmastertab.itemmasterfacilitymapping', canDisable: false });
        // }
        // if ($scope.CanSupplierMapping) {
        $scope.tabs.push({ title: $translate.instant('inventory.itemmastertab.tabitemmastervendormapping.lbl'), state: 'app.itemmastertab.itemmastervendormappings', canDisable: false });
        // }
        // if ($scope.CanContract) {
        //     $scope.tabs.push({ title: $translate.instant('inventory.itemmastertab.tabitemmastercontract.lbl'), state: 'app.itemmastertab.itemmastercontract', canDisable: false });
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
        $scope.getMaxItemCallback = function (scope, data, options, hasError) {
            console.log(data);
            $scope.PrevItem = data;
        };

        $scope.getMaxItem = function () {

                var options = {
                    action: 'pharmacy/itemmaster/GetMaxItem',
                    data: {
                        Data: {
                            CategoryId: 1,
                            FacilityId: utl.Session.getCurrentFacilityId()
                        }
                    },
                    type: 'post',
                    onComplete: $scope.getMaxItemCallback
                };
                utl.Http.doAction(options);

        }

        $scope.getMaxItem();
    }

    itemMasterTabController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];
})();
