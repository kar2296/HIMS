(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('PatientVitalTabController', PatientVitalTabController);

    function PatientVitalTabController($scope, $stateParams, $state, $translate, utl) {
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

        if ($scope.Context == 'emr' || $scope.Context == 'ipemr' || $scope.Context == 'aeemr') {
            $scope.tabs = [{
                    title: $translate.instant('patientemr.patientvital-form.crntvisit.lbl'),
                    state: 'patientemr.patientvitaltab.patientvital'
                },
                {
                    title: $translate.instant('patientemr.patientvital-form.pastvisit.lbl'),
                    state: 'patientemr.patientvitaltab.previousvitals'
                },
                {
                    title: $translate.instant('patientemr.patientvital-form.listview.lbl'),
                    state: 'patientemr.patientvitaltab.patientvitals'
                },
                {
                    title: $translate.instant('patientemr.patientvital-form.chartview.lbl'),
                    state: 'patientemr.patientvitaltab.patientvitalchart'
                }
            ];
        }

        if ($scope.Context == 'surgery') {
            $scope.tabs = [{
                    title: $translate.instant('patientemr.patientvital-form.crntvisit.lbl'),
                    state: 'surgeryentry.patientvitaltab.patientvital'
                },
                {
                    title: $translate.instant('patientemr.patientvital-form.pastvisit.lbl'),
                    state: 'surgeryentry.patientvitaltab.previousvitals'
                },
                {
                    title: $translate.instant('patientemr.patientvital-form.listview.lbl'),
                    state: 'surgeryentry.patientvitaltab.patientvitals'
                },
                {
                    title: $translate.instant('patientemr.patientvital-form.chartview.lbl'),
                    state: 'surgeryentry.patientvitaltab.patientvitalchart'
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



    PatientVitalTabController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();