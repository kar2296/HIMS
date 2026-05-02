(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PositionBpChartTabController', PositionBpChartTabController);

    function PositionBpChartTabController($scope, $stateParams, $state, $translate, utl) {
        var tabvm = this;

        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        $scope.currentcontext = {};
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        if ($stateParams.pid)
            $scope.currentcontext.pid = $stateParams.pid;
        else
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.tabs = [
            {
                title: $translate.instant('Current List'),
                state: 'patientemr.positionbpcharttab.positionbpchart'
            },
            {
                title: $translate.instant('Previous List'),
                state: 'patientemr.positionbpcharttab.positionbpchartPrelist'
            },
        ];
        $scope.switchTab = function (tab) {
            $state.go(tab.state);
        }
        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        };
        $scope.checkedinpatients = function () {
            $state.go('app.oppatienttab.mycheckin');
        };
        $scope.currentpatient = function () {
            $state.go('app.bedmanagementtab.inpatient');
        };

        // if ($scope.CanAllOutPatients) {
        //     $scope.switchTab($scope.tabs[0]);
        // }
    }



    PositionBpChartTabController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();