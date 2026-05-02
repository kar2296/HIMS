(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('aepatientTabController', aepatientTabController);

    function aepatientTabController($scope, $stateParams, $state, $translate, utl) {

        var tabvm = this;
        $scope.currentcontext = {
            id: parseInt($stateParams.id)
        };
        $scope.Encounter = {};
        var canDisableTab = $scope.currentcontext.id == 0 ? true : false;

        $scope.tabs = [
            { title: $translate.instant('aeregistration.pagetitle_tab.lbl'), state: 'app.aeregistrationtab.aeregistration', canDisable: false },
            { title: $translate.instant('aeregistration.mlc.lbl'), state: 'app.aeregistrationtab.mlc', canDisable: canDisableTab }

        ];

        tabvm.currentcontext = {
            patientid: 0
        };

        $scope.openattachments = function () {
            if ($scope.item.PatientId > 0) {
                utl.Modal.open('app.patientattachments', {
                    params: { pid: $scope.item.PatientId, itemid: $scope.item.Id },
                    confirmCallback: $scope.getPatientAttachments,
                    cancelCallback: $scope.getPatientAttachments
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('appointment.appointment-form.nopatient-msg.lbl'));
            }
        }
        $scope.patientprofiledetails = function () {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: $scope.selectedPatient.Id },
                confirmCallback: $scope.getItem
            });
        }
        $scope.addNewQuick = function () {
            $state.go('app.quickregistration', { id: 0 });
        }

        $scope.switchTab = function (tab) {
            if (!canDisableTab) {
                $state.go(tab.state);
            }
        }

        var vm = this;
        $scope.currentcontext = {};
        $scope.lookup = {};
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.selectedPatient = {};

        $scope.setBannerDelegate = function (cmp) {
            $scope.bannercmp = cmp;
        };

        tabvm.refreshBanner = function () {
            if ($scope.bannercmp) {
                $scope.bannercmp.refresh();
            }
        }
        //Reload banner code ends
  //Patient picker related code starts
        function patientPickerCallback(patientdata) {
            $state.go('app.quickregistration', { id: patientdata.pid });
        }

        $scope.pickPatient = function() {
                utl.Modal.open('app.patientpicker', {
                    params: {},
                    confirmCallback: patientPickerCallback
                });
            }
            //Patient picker related code ends

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

    }

    aepatientTabController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();