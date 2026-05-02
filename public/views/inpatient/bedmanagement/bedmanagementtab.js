(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('BedmanagementTabController', BedmanagementTabController);

    function BedmanagementTabController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout) {

        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        var tabvm = this;

        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;
        $scope.tabs = [];
        $scope.CanInPatient = $scope.HasAccess('WARDMANAGEMENT_TAB', 'InPatient');
        $scope.CanFloorView = $scope.HasAccess('WARDMANAGEMENT_TAB', 'FloorView');
        $scope.CanDischargedPatients = $scope.HasAccess('WARDMANAGEMENT_TAB', 'Discharged Patients');

        if ($scope.CanInPatient) {
            $scope.tabs.push({
                title: $translate.instant('admissiontab.inpatient.lbl'),
                state: 'app.bedmanagementtab.inpatient',
                canDisable: false
            })
        }
        // if ($scope.CanFloorView) {
        //     $scope.tabs.push({
        //         title: $translate.instant('admissiontab.floorview.lbl'),
        //         state: 'app.bedmanagementtab.floorview',
        //         canDisable: canDisableTab
        //     })
        // }
        if ($scope.CanDischargedPatients) {
            $scope.tabs.push({
                title: $translate.instant('admissiontab.dischargedpatients.lbl'),
                state: 'app.bedmanagementtab.dischargedpatients',
                canDisable: canDisableTab
            })
        }
        tabvm.currentcontext = {
            patientid: 0
        };

        $scope.switchTab = function (tab) {
            $state.go(tab.state);
        }
        var vm = this;
        $scope.currentcontext = {
            patientAlertsCount: 0
        };
        $scope.lookup = {};
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.selectedPatient = {};

        $scope.patientprofiledetails = function () {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: $scope.selectedPatient.Id
                },
                confirmCallback: $scope.getItem
            });
        }
        $scope.alertviewclick = function () {
            utl.Modal.open('app.alertview', {
                params: {
                    pid: $scope.selectedPatient.Id
                },
                cancelCallback: $scope.updateCount
            });
        }

        $scope.bedstatus = function () {
            utl.Modal.open('app.bedstatus', {
                params: {},
                cancelCallback: $scope.getItem
            });
        }

        $scope.updateCount = function () {
            $scope.getPatientAlertsCount();
        }

        $scope.getPatientAlertsCallback = function (scope, res, options, hasError) {
            $scope.currentcontext.patientAlertsCount = res.Data.length;
        };
        $scope.backtoList = function () {
            $state.go('app.nursingdashboard');
        }
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.getPatientAlertsCount = function () {
            var inputData = {
                Params: [{
                    Key: 4,
                    Value: $scope.selectedPatient.Id
                },
                {
                    Key: 5,
                    Value: utl.Session.getUserDepartments()
                },
                {
                    Key: 6,
                    Value: utl.Session.getCurrentUserId()
                }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'generalmaster/PatientAlert/GetPatientAlerts',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientAlertsCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            $state.go('app.admissiontab.admission', {
                id: 0
            });
        }

        $scope.populateData = function (data) {
            $scope.Data = data;
            if (data.AdmissionStatusId == 1) {
                $scope.Data.AdmissionStatus = 'Draft';
            }
            if (data.AdmissionStatusId == 2) {
                $scope.Data.AdmissionStatus = 'Admitted';
            }

            if (data.AdmissionStatusId == 3) {
                $scope.Data.AdmissionStatus = 'Fit for Discharge';

            }
            if (data.AdmissionStatusId == 4) {
                $scope.Data.AdmissionStatus = 'Clinically Discharged';
            }
            if (data.AdmissionStatusId == 6) {
                $scope.Data.AdmissionStatus = 'Physically Discharged';
            }
        }

        tabvm.refreshBanner = function () {
            if ($scope.bannercmp) {
                $scope.bannercmp.refresh();
            }
        }


        if ($scope.CanInPatient) {
            $scope.switchTab($scope.tabs[0]);
        }
        if ($scope.CanFloorView) {
            $scope.switchTab($scope.tabs[0]);
        }
    }


    BedmanagementTabController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];
})();