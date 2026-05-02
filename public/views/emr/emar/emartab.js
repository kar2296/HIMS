(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('emarTabController', emarTabController);

    function emarTabController($scope, $stateParams, $state, $translate, utl) {
        var tabvm = this;

        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        $scope.currentcontext = {};
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        if ($stateParams.from) {
            $scope.From = $stateParams.from;
        }
        if ($stateParams.pid)
            $scope.currentcontext.pid = $stateParams.pid;
        else
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.tabs = [{
                title: $translate.instant('patientemr.patientorder-list.currentvisit.lbl'),
                state: 'patientemr.emartab.emar'
            },
            {
                title: $translate.instant('patientemr.patientorder-list.previousvisit.lbl'),
                state: 'patientemr.emartab.emar'
            },
        ];
        $scope.switchTab = function(tab) {
            $state.go(tab.state);
        }
        $scope.doctor_dashboard = function() {
            if ($scope.From == 'nursing') {
                $state.go('app.nursingdashboard');
            } else {
                $state.go('app.doctordashboard');
            }
        };
        $scope.checkedinpatients = function() {
            $state.go('app.oppatienttab.mycheckin');
        };
        $scope.currentpatient = function() {
            $state.go('app.bedmanagementtab.inpatient');
        };

        // if ($scope.CanAllOutPatients) {
        //     $scope.switchTab($scope.tabs[0]);
        // }
    }



    emarTabController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();