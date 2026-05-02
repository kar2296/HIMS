(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('PatientDiagnosisTabController', PatientDiagnosisTabController);

    function PatientDiagnosisTabController($scope, $stateParams, $state, $translate, utl) {
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
        if ($stateParams.pid) {
            $scope.currentcontext.pid = $stateParams.pid;
        } else {
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        }
        if ($stateParams.eid) {
            $scope.currentcontext.eid = $stateParams.eid;
        } else {
            $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());
        }

        if ($scope.Context == 'emr' || $scope.Context == 'ipemr') {
            $scope.tabs = [{
                    title: $translate.instant('patientemr.patientorder-list.currentlist.lbl'),
                    state: 'patientemr.diagnosistab.patientdiagnosiscurrentlist'
                },
                {
                    title: $translate.instant('patientemr.patientorder-list.diagnosis.lbl'),
                    state: 'patientemr.diagnosistab.diagnosishistory'
                }
            ];
        }
        if ($scope.Context == 'surgery') {
            $scope.tabs = [{
                    title: $translate.instant('patientemr.patientorder-list.currentlist.lbl'),
                    state: 'surgeryentry.diagnosistab.patientdiagnosiscurrentlist'
                },
                {
                    title: $translate.instant('patientemr.patientorder-list.diagnosis.lbl'),
                    state: 'surgeryentry.diagnosistab.diagnosishistory'
                }
            ];
        }

        $scope.switchTab = function(tab) {
            $state.go(tab.state);
        }
        $scope.doctor_dashboard = function() {
            if ($scope.Context == 'emr' || $scope.Context == 'ipemr') {
                if ($scope.From == 'nursing') {
                    $state.go('app.nursingdashboard');
                } else {
                    $state.go('app.doctordashboard');
                }
            }
            if ($scope.Context == 'surgery') {
                $state.go('app.surgerydashboard');
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



    PatientDiagnosisTabController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();