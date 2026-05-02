(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ordertrackingtabController', ordertrackingtabController);

    function ordertrackingtabController($scope, $stateParams, $state, $translate, utl) {
        var tabvm = this;

        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.tabs = [];
        $scope.CanAllOutPatients = $scope.HasAccess('OutPatients', 'AllOutPatients');
        $scope.CanMyOutPatients = $scope.HasAccess('OutPatients', 'MyOutPatients');
        $scope.CanPreviousOutPatients = $scope.HasAccess('OutPatients', 'PreviousOutPatients');

        if ($scope.CanMyOutPatients) {
            $scope.tabs.push({
                title: $translate.instant('billing.opbilling-list.pendingorder.lbl'),
                state: 'app.ordertrackingtab.pendingorder',
                canDisable: false
            });
        }
        if ($scope.CanAllOutPatients) {
            $scope.tabs.push({
                title: $translate.instant('Completed Orders'),
                state: 'app.ordertrackingtab.completeorder',
                canDisable: false
            });
        }

        $scope.switchTab = function (tab) {
            $state.go(tab.state);
        }
        $scope.backToList = function () {
            $state.go('app.doctordashboard');
        }
        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.bed_management = function () {
            $state.go('app.bedmanagement');
        }

        if ($scope.CanAllOutPatients) {
            $scope.switchTab($scope.tabs[0]);
        }
    }



    ordertrackingtabController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();