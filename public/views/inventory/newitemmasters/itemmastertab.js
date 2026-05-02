(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('newitemMasterTabController', newitemMasterTabController);

    function newitemMasterTabController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout) {

        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));
        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;
        $scope.Iscssd = false;
        $scope.PrevItem = '';
        // $scope.tabs = [
        //     { title: $translate.instant('inventory.itemmastertab.tabitemmaster.lbl'), state: 'app.itemmasterformtab.itemmaster', canDisable: false },
        //     { title: $translate.instant('inventory.itemmastertab.tabitemmasteruomconversion.lbl'), state: 'app.itemmasterformtab.itemmasteruomconversion', canDisable: canDisableTab },
        //     { title: $translate.instant('inventory.itemmastertab.tabitemmasterstoremapping.lbl'), state: 'app.itemmasterformtab.itemmasterstoremapping', canDisable: canDisableTab },
        //     { title: $translate.instant('inventory.itemmastertab.tabitemmasterfacilitymapping.lbl'), state: 'app.itemmasterformtab.itemmasterfacilitymapping', canDisable: canDisableTab },
        //     { title: $translate.instant('inventory.itemmastertab.tabitemmastervendormapping.lbl'), state: 'app.itemmasterformtab.itemmastervendormappings', canDisable: canDisableTab },
        //     //{ title: $translate.instant('inventory.itemmastertab.tabitemmastercustomermapping.lbl'), state: 'app.itemmasterformtab.itemmastercustomermappings', canDisable: canDisableTab },
        //     // { title: $translate.instant('inventory.itemmastertab.tabitemmasterimage.lbl'), state: 'app.itemmasterformtab.itemmasterimage', canDisable: canDisableTab },
        //     { title: $translate.instant('inventory.itemmastertab.tabitemmastercontract.lbl'), state: 'app.itemmasterformtab.itemmastercontract', canDisable: canDisableTab },
        //     // { title: $translate.instant('inventory.itemmastertab.tabitemmasterprice.lbl'), state: 'app.itemmasterformtab.itemmasterprice', canDisable: canDisableTab },
        //     // { title: $translate.instant('inventory.itemmastertab.tabitemmasteraliase.lbl'), state: 'app.itemmasterformtab.itemmasteraliase', canDisable: canDisableTab },
        //     //{ title: $translate.instant('inventory.itemmasterformtab.tabcssdsetup.lbl'), state: 'app.itemmasterformtab.cssdsetup', canDisable: canDisableTab },
        //     //{ title: $translate.instant('inventory.itemmasterformtab.tabcssdgroupitems.lbl'), state: 'app.itemmasterformtab.cssdgroupitems', canDisable: canDisableTab }

        // ];

        $scope.tabs = []

        //   if ($scope.CanItemDetails) {
        $scope.tabs.push({ title: $translate.instant('inventory.itemmastertab.tabitemmaster.lbl'), state: 'app.itemmasterformtab.itemmasterform', canDisable: false });
        // }
        // if ($scope.CanUomConversion) {
        $scope.tabs.push({ title: $translate.instant('inventory.itemmastertab.tabitemmasteruomconversion.lbl'), state: 'app.itemmasterformtab.itemmasterformuomconversion', canDisable: false });
        // }
        // if ($scope.CanStoreAssociation) {inventory.itemmastertab.tabitemmasteruomconversion.lbl'), state: 'app.itemmasterformtab.itemmasteruomconversion', canDisable: false });
        // }
        // if ($scope.CanStoreAssociation) {
        $scope.tabs.push({ title: $translate.instant('Store Mapping'), state: 'app.itemmasterformtab.itemmasterformstoremapping', canDisable: false });
        // }
        // if ($scope.CanHospitalMapping) {
        $scope.tabs.push({ title: $translate.instant('inventory.itemmastertab.tabitemmasterfacilitymapping.lbl'), state: 'app.itemmasterformtab.itemmasterformfacilitymapping', canDisable: false });
        // }
        // if ($scope.CanSupplierMapping) {
        $scope.tabs.push({ title: $translate.instant('inventory.itemmastertab.tabitemmastervendormapping.lbl'), state: 'app.itemmasterformtab.itemmasterformvendormappings', canDisable: false });
        // }
        // if ($scope.CanContract) {
        //     $scope.tabs.push({ title: $translate.instant('inventory.itemmastertab.tabitemmastercontract.lbl'), state: 'app.itemmasterformtab.itemmastercontract', canDisable: false });
        // }

        $scope.backToList = function () {
            $state.go('app.itemmasters');
        }
        $scope.backtoList = function () {
            $state.go('app.Inventorymastermanagement');
        }
        $scope.addNew = function () {
            $state.go('app.itemmasterformtab.itemmaster', {
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

    newitemMasterTabController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];
})();
