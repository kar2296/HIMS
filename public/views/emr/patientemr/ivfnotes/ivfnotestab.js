(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('IVFNotesTabController', IVFNotesTabController);

    function IVFNotesTabController($scope, $stateParams, $state, $translate, utl) {
        var tabvm = this;

        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        $scope.currentcontext = {};
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.ShowReferTab = false;
        $scope.Patientdata = {};
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
        $scope.tabs = [{
                title: $translate.instant('patientemr.patientorder-list.Patient.lbl'),
                state: 'patientemr.ivfnotestab.ivfnotescurrentlist'
            },
            {
                title: $translate.instant('patientemr.patientorder-list.Spouse.lbl'),
                state: 'patientemr.ivfnotestab.ivfspousenotes'
            },
        ];
        $scope.switchTab = function (tab) {
            $state.go(tab.state);
        }
        $scope.doctor_dashboard = function () {
            if ($scope.From == 'nursing') {
                $state.go('app.nursingdashboard');
            } else {
                $state.go('app.doctordashboard');
            }
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

        $scope.getPatientInfoCallback = function (scope, res, options, hasError) {
            if (res.Data && res.Data.length > 0) {
                $scope.Patientdata = res.Data[0];
                if ($scope.Patientdata.Encounters && $scope.Patientdata.Encounters.length > 0) {
                    $scope.encounteritem = $scope.Patientdata.Encounters[0];

                    if ($scope.encounteritem.EncounterStatusId == 1) {
                        $scope.EncounterStatus = 'Checked-In';
                    } else {
                        $scope.EncounterStatus = 'Checked-Out';
                    }
                } else {
                    $scope.EncounterStatus = 'Checked-Out';
                }
                if ($scope.Patientdata.ReferrerId) {
                    $scope.ShowReferTab = true;
                }
            }

        };

        $scope.getPatientInfo = function () {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.currentcontext.pid
                }, ],
                PageContext: {
                    PageSize: 50,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'registration/patient/GetPatients',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientInfoCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getPatientLinksCallback = function (scope, data, options, hasError) {
            $scope.PatientLink = data[0];
        };

        $scope.getPatientLinks = function () {
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.currentcontext.pid
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'registration/FamilyLink/GetFamilyLinks',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientLinksCallback
            };

            utl.Http.doAction(options);
        };


        $scope.getPatientInfo();
        $scope.getPatientLinks();
    }



    IVFNotesTabController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();