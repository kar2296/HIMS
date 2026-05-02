(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('serviceItemTabController', serviceItemTabController);

    function serviceItemTabController($scope, $stateParams, $state, $translate, utl) {
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

        $scope.tabs = [];
            // {
        //         title: $translate.instant('clinicalmaster.serviceitemtab.tabdetails.lbl'),
        //         state: 'app.serviceitemtab.details',
        //         canDisable: false
        //     },
        //     {
        //         title: $translate.instant('clinicalmaster.serviceitemtab.performingdoctors.lbl'),
        //         state: 'app.serviceitemtab.serviceitemperformingdoctor',
        //         canDisable: canDisableTab
        //     },
            // { title: $translate.instant('clinicalmaster.serviceitemtab.tabserviceitemaliases.lbl'), state: 'app.serviceitemtab.serviceitemalias', canDisable: canDisableTab },
        //     {
        //         title: $translate.instant('clinicalmaster.serviceitemtab.tabtariffdetails.lbl'),
        //         state: 'app.serviceitemtab.serviceitemtariffdetails',
        //         canDisable: canDisableTab
        //     },
        //     {
        //         title: $translate.instant('clinicalmaster.serviceitemtab.tabpackagemap.lbl'),
        //         state: 'app.serviceitemtab.serviceitempackagemap',
        //         canDisable: canDisableTab
        //     },
        //     {
        //         title: $translate.instant('clinicalmaster.serviceitemtab.tabfacilitymapping.lbl'),
        //         state: 'app.serviceitemtab.serviceitemfacilitymap',
        //         canDisable: canDisableTab
        //     }
        // ];
        $scope.CanDetails = $scope.HasAccess('MANAGESERVICEITEM_TAB', 'Details');
        $scope.CanExternal = $scope.HasAccess('MANAGESERVICEITEM_TAB', 'External Code');
        $scope.CanPerformingDoctors = $scope.HasAccess('MANAGESERVICEITEM_TAB', 'PerformingDoctors');
        $scope.CanRate = $scope.HasAccess('MANAGESERVICEITEM_TAB', 'Rate');
        $scope.CanHealthCheckup = $scope.HasAccess('MANAGESERVICEITEM_TAB', 'HealthCheckup');
        $scope.CanHospital = $scope.HasAccess('MANAGESERVICEITEM_TAB', 'Hospital');

        if ($scope.CanDetails) {
            $scope.tabs.push({
                title: $translate.instant('clinicalmaster.serviceitemtab.tabdetails.lbl'),
                state: 'app.serviceitemtab.details',
                canDisable: false
            });
        }
        if ($scope.CanExternal) {
            $scope.tabs.push({
                title: $translate.instant('External Code'),
                state: 'app.serviceitemtab.serviceitemalias',
                canDisable: canDisableTab
            })
        }
        if ($scope.CanPerformingDoctors) {
            $scope.tabs.push({
                title: $translate.instant('clinicalmaster.serviceitemtab.performingdoctors.lbl'),
                state: 'app.serviceitemtab.serviceitemperformingdoctor',
                canDisable: canDisableTab
            })
        }
        if ($scope.CanRate) {
            $scope.tabs.push({
                title: $translate.instant('clinicalmaster.serviceitemtab.tabtariffdetails.lbl'),
                state: 'app.serviceitemtab.serviceitemtariffdetails',
                canDisable: canDisableTab
            })
        }
        if ($scope.CanHealthCheckup) {
            $scope.tabs.push({
                title: $translate.instant('clinicalmaster.serviceitemtab.tabpackagemap.lbl'),
                state: 'app.serviceitemtab.serviceitempackagemap',
                canDisable: canDisableTab
            })
        }
        if ($scope.CanHospital) {
            $scope.tabs.push({
                title: $translate.instant('clinicalmaster.serviceitemtab.tabfacilitymapping.lbl'),
                state: 'app.serviceitemtab.serviceitemfacilitymap',
                canDisable: canDisableTab
            })
        }
      
        $scope.addNew = function () {
            $state.go('app.serviceitemtab.details', {
                id: 0
            });
        }

        $scope.backToList = function () {
            $state.go('app.serviceitemtab.details');
        }
        $scope.back = function () {
            $state.go('app.serviceitems', {
                id: $scope.currentcontext.serviceitemid
            });
        }
        $scope.switchTab = function (tab) {
            if (!canDisableTab) {
                $state.go(tab.state);
            }
        }

        if ($scope.CanDetails) {
            $scope.switchTab($scope.tabs[0]);
        }
        if ($scope.CanPerformingDoctors) {
            $scope.switchTab($scope.tabs[0]);
        }
        if ($scope.CanRate) {
            $scope.switchTab($scope.tabs[0]);
        }
        if ($scope.CanHealthCheckup) {
            $scope.switchTab($scope.tabs[0]);
        }
        if ($scope.CanHospital) {
            $scope.switchTab($scope.tabs[0]);
        }
    }

    serviceItemTabController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();