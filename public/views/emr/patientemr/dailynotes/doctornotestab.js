(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('DoctorNotesTabController', DoctorNotesTabController);

    function DoctorNotesTabController($scope, $stateParams, $state, $translate, utl) {
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
        if ($stateParams.eid)
            $scope.currentcontext.eid = $stateParams.eid;
        else
            $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());
        $scope.tabs = [{
                title: $translate.instant('patientemr.patientorder-list.currentvisit.lbl'),
                state: 'patientemr.doctornotestab.doctornotescurrentlist'
            },
            {
                title: $translate.instant('patientemr.patientorder-list.previousvisit.lbl'),
                state: 'patientemr.doctornotestab.doctornotespreviouslist'
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



    DoctorNotesTabController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();