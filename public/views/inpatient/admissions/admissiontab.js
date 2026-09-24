(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('admissionTabController', admissionTabController);

    function admissionTabController($scope, $stateParams, $state, $translate, utl) {
        var tabvm = this;

        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;
        //$scope.selectedPatient = { MRN: '' };
        $scope.tabs = [
            // { title: $translate.instant('admissiontab.tabadmission.lbl'), state: 'app.admissiontab.admission', canDisable: false },
            // { title: $translate.instant('admissiontab.tabmlc.lbl'), state: 'app.admissiontab.mlcs', canDisable: canDisableTab },
            // { title: $translate.instant('admissiontab.tabadmissionlog.lbl'), state: 'app.admissiontab.admissionlogs', canDisable: canDisableTab }
        ];


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
                params: { pid: $scope.selectedPatient.Id },
                confirmCallback: $scope.getItem
            });
        }
        $scope.alertviewclick = function () {
            utl.Modal.open('app.alertview', {
                params: { pid: $scope.selectedPatient.Id },
                cancelCallback: $scope.updateCount
            });
        }

        $scope.updateCount = function () {
            $scope.getPatientAlertsCount();
        }

        $scope.getPatientAlertsCallback = function (scope, res, options, hasError) {
            $scope.currentcontext.patientAlertsCount = res.Data.length;
        };

        $scope.getPatientAlertsCount = function () {
            var inputData = {
                Params: [
                    { Key: 4, Value: $scope.selectedPatient.Id },
                    { Key: 5, Value: utl.Session.getUserDepartments() },
                    { Key: 6, Value: utl.Session.getCurrentUserId() }
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
        // $scope.getPatientInfo = function (scope, data, options, hasError) {
        //     $scope.selectedPatient = data;
        // }

        // $scope.patientChange = function () {
        //     if ($scope.Data.PatientId > 0) {
        //         var options = {
        //             action: 'registration/patient/GetPatientById',
        //             data: { Id: $scope.Data.PatientId },
        //             type: 'post',
        //             onComplete: $scope.getPatientInfo
        //         };

        //         utl.Http.doAction(options);
        //     }
        // }
        // // For Displaying Created User - Start 
        // $scope.getCreatedUserCallback = function (scope, res, options, hasError) {
        //     $scope.CreatedUser = res.Data[0];
        //     //vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        // };

        // $scope.getCreatedUser = function () {
        //     var inputData = {
        //         Params: [
        //             { Key: 0, Value: $scope.currentcontext.id }
        //         ]
        //     };

        //     var options = {
        //         action: 'Visit/Visit/GetEncounters',
        //         data: inputData,
        //         type: 'post',
        //         onComplete: $scope.getCreatedUserCallback
        //     };

        //     utl.Http.doAction(options);
        // };
        // function admissionPickerCallback(admissiondata) {
        //     $state.go('app.admissiontab.admission', { id: admissiondata.aid });
        // }

        // $scope.pickPatient = function () {
        //     utl.Modal.open('app.admissionpicker', {
        //         params: {},
        //         confirmCallback: admissionPickerCallback
        //     });
        // }
        // For Displaying Created User - End 

        // function patientPickerCallback(patientdata) {
        //     $state.go('app.admissiontab.admission', { id: patientdata.pid });
        // }
        $scope.addNew = function () {
            $state.go('app.admissiontab.admission', { id: 0 });
        }


        // $scope.getpatientdata = function (scope, data, options, hasError) {

        //     if (data.Data.length > 0) {
        //         $scope.Patients = data.Data[0];
        //         $scope.item.PatientId = $scope.Patients.Id
        //         $scope.item.FirstName = $scope.Patients.FirstName
        //         $scope.item.MRN = $scope.Patients.MRN
        //         $scope.item.Age = $scope.Patients.Age

        //     }
        // };
        // $scope.patientPicker = function (patientdata) {
        //     if (patientdata.pid && patientdata.pid > 0) {
        //         var options = {
        //             action: 'registration/patient/GetPatientById',
        //             data: { Id: patientdata.pid },
        //             type: 'post',
        //             onComplete: $scope.getpatientdata
        //         };
        //         utl.Http.doAction(options);
        //     }

        // }
        // $scope.pickPatient = function () {
        //     utl.Modal.open('app.admissionpicker', {
        //         params: {},
        //         confirmCallback: $scope.patientPicker
        //     });
        // }
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

        // $scope.getinfoCallback = function (scope, data, options, hasError) {
        //     $scope.Data = data;
        //     $scope.patientChange();
        //     $scope.getCreatedUser();
        //     // for admissionstatus//
        //     if (data.AdmissionStatusId == 1) {
        //         $scope.Data.AdmissionStatus = 'Draft';
        //     }
        //     if (data.AdmissionStatusId == 2) {
        //         $scope.Data.AdmissionStatus = 'Admitted';
        //     }

        //     if (data.AdmissionStatusId == 3) {
        //         $scope.Data.AdmissionStatus = 'Fit for Discharge';

        //     }
        //     if (data.AdmissionStatusId == 4) {
        //         $scope.Data.AdmissionStatus = 'Clinically Discharged';
        //     }
        //     if (data.AdmissionStatusId == 6) {
        //         $scope.Data.AdmissionStatus = 'Physically Discharged';
        //     }
        //     // for admissionstatus//
        // };

        // $scope.getinfo = function (pageNo) {

        //     if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
        //         var options = {
        //             action: 'Visit/Visit/GetEncounterById',
        //             data: { Id: $scope.currentcontext.id },
        //             type: 'post',
        //             onComplete: $scope.getinfoCallback
        //         };
        //         // utl.Http.doAction(options);
        //     }
        // };

        // $scope.getinfo();
        // $scope.setBannerDelegate = function (cmp) {
        //     $scope.bannercmp = cmp;
        // };

        tabvm.refreshBanner = function () {
            if ($scope.bannercmp) {
                $scope.bannercmp.refresh();
            }
        }
    }
    // $scope.getPatientInfo = function (scope, data, options, hasError) {
    //     $scope.selectedPatient = data;
    // }

    // $scope.patientChange = function () {
    //     if ($scope.item.PatientId > 0) {
    //         var options = {
    //             action: 'registration/patient/GetPatientById',
    //             data: { Id: $scope.item.PatientId },
    //             type: 'post',
    //             onComplete: $scope.getPatientInfo
    //         };
    //         utl.Http.doAction(options);
    //     }
    // }

    // $scope.saveItem = function () {

    //     if (!utl.Validator.validate($scope)) {
    //         return;
    //     }
    //     $scope.item.PatientMrn = $scope.selectedPatient.PatientMrn;
    //     $scope.item.Id = $scope.currentcontext.id;
    //     $scope.item.Status = 1;
    //     $scope.item.EncounterTypeId = 2;
    //     var actionName = 'Visit/Visit/ManageAdmissionEncounter';
    //     // if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
    //     //     actionName = 'Visit/Visit/Updateadmission';
    //     // }

    //     var options = {
    //         action: actionName,
    //         data: { Data: $scope.item },
    //         type: 'post',
    //         onComplete: $scope.saveItemCallback
    //     };
    //     utl.Http.doAction(options);
    // };


    admissionTabController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];
})();