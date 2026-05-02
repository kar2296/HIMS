(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('PrescribeTabController', PrescribeTabController);

    function PrescribeTabController($scope, $stateParams, $state, $translate, utl) {
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
                    title: $translate.instant('patientemr.prescription-form.newmedicine.lbl'),
                    state: 'patientemr.prescribetab.rxprescriptions'
                },
                {
                    title: $translate.instant('patientemr.prescription-form.crntlist.lbl'),
                    state: 'patientemr.prescribetab.currentprescription'
                },
                {
                    title: $translate.instant('patientemr.prescription-form.pastlist.lbl'),
                    state: 'patientemr.prescribetab.pastprescription'
                }
            ];
        }
        if ($scope.Context == 'surgery') {
            $scope.tabs = [{
                    title: $translate.instant('patientemr.prescription-form.newmedicine.lbl'),
                    state: 'surgeryentry.prescribetab.rxprescriptions'
                },
                {
                    title: $translate.instant('patientemr.prescription-form.crntlist.lbl'),
                    state: 'surgeryentry.prescribetab.currentprescription'
                },
                {
                    title: $translate.instant('patientemr.prescription-form.pastlist.lbl'),
                    state: 'surgeryentry.prescribetab.pastprescription'
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



    PrescribeTabController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();