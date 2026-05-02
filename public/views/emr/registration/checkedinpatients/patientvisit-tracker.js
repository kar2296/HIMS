(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientvisitTrackerController', patientvisitTrackerController);

    function patientvisitTrackerController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            StartDate: utl.Formatter.getCurrentDate(),
            AssignTo: 1,
            FacilityId: 0,
            DepartmentId: -1,
            AssignedUserId: -1,
            AssignedRoomId: -1,
            EncounterId: -1,
            IsNewConsultationReq: false
        };

        $scope.lookup = {};

        $scope.currentcontext = {
            id: -1,
            DoctorName: '',
            DepartmentId: -1
        };

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.currentcontext.aid = parseInt(modalConfig.params.aid);

            if (modalConfig.params.assignto)
                $scope.item.AssignTo = modalConfig.params.assignto;

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        vm.AssignToOptions = [
            { Id: 1, Text: $translate.instant('registration.patienttracker.myself.lbl') },
            { Id: 2, Text: $translate.instant('registration.patienttracker.referto.lbl') }
        ]

        $scope.item.PatientId = $scope.currentcontext.pid;
        $scope.item.AppointmentId = $scope.currentcontext.aid;

        $scope.currentcontext.CurrentConsultationNotesCount = 0;

        $scope.canShowDoctor = function () {
            return $scope.item.AssignTo == 2;
        };

        $scope.canShowDepartment = function () {
            return $scope.item.AssignTo == 2;
        };

        $scope.canShowRoom = function () {
            return $scope.item.AssignTo == 2;
        };

        $scope.onUserChange = function (item) {
            var name = item.FirstName;
            if (item.Title && item.Title.Description) {
                name = item.Title.Description + " " + name;
            }
            if (item.LastName) {
                name += " " + item.LastName;
            }
            $scope.item.AssignedUserName = name;
            $scope.item.DepartmentId = item.DepartmentId;
            $scope.item.AssignedUserDepartmentId = item.DepartmentId;
        }

        $scope.onRoomChange = function (item) {
            $scope.item.AssignedRoomName = item.Text;
        };

        $scope.backToList = function () {
            if ($scope.currentcontext.ismodal) {
                $scope.cancelCallback();
            }
        };

        $scope.getConsultationNotesCountCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                $scope.ConsultationNotes = data.Data;
                var ConsultationNotesCount = 0;
                for (var idx in $scope.ConsultationNotes) {
                    ConsultationNotesCount++;
                }
                $scope.currentcontext.CurrentConsultationNotesCount = ConsultationNotesCount;
            }
        };

        $scope.getConsultationNotesCount = function (LatestEncounterId) {
            if (LatestEncounterId && LatestEncounterId > 0) {
                var inputData = {
                    Params: [
                        { Key: 2, Value: LatestEncounterId },
                        { Key: 3, Value: $scope.currentcontext.pid }
                    ],
                    PageContext: { PageSize: 100, PageNumber: 1 }
                };
                var options = {
                    action: 'emr/Consultation/GetConsultations',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getConsultationNotesCountCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getLatestEncounterDetailsCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                $scope.LatestEncounterDetails = data.Data[0];
                $scope.item.LatestEncounterId = data.Data[0].Id;
            }
            if ($scope.item.LatestEncounterId && $scope.item.LatestEncounterId > 0) {
                $scope.getConsultationNotesCount($scope.item.LatestEncounterId);
            }
        };

        $scope.getLatestEncounterDetails = function () {
            if ($scope.currentcontext.pid && $scope.currentcontext.pid > 0) {
                var inputData = {
                    Params: [
                        { Key: 4, Value: $scope.currentcontext.pid }
                    ],
                    PageContext: { PageSize: 100, PageNumber: 1 }
                };
                var options = {
                    action: 'Visit/Visit/GetEncounters',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getLatestEncounterDetailsCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getpatientsCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                var Patient = data.Data[0];
                $scope.item.EncounterId = Patient.Encounters[0].EncounterId;
                $scope.currentcontext.DoctorName = Patient.Encounters[0].DoctorName;
                if (Patient.Encounters[0].EncounterDoctors.length > 0) {
                    var encounter = Patient.Encounters[0].EncounterDoctors[0];
                    $scope.item.DoctorId = encounter.DoctorId;
                    /*
                    $scope.item.DepartmentId = encounter.DepartmentId;
                    $scope.item.AssignedUserDepartmentId = encounter.DepartmentId;
                    */
                    $scope.currentcontext.DoctorId = encounter.DoctorId;
                    $scope.currentcontext.DepartmentId = encounter.DepartmentId;
                }
                $scope.getLatestEncounterDetails();
            }
        };

        $scope.getPatientById = function () {
            var inputData = {
                Params: [
                    { Key: 0, Value: $scope.currentcontext.pid },
                ]
            };

            var options = {
                action: 'registration/patient/GetPatients',
                data: inputData,
                type: 'post',
                onComplete: $scope.getpatientsCallback
            };

            utl.Http.doAction(options);
        };

        $scope.doctor_dashboard = function () {
            $state.go('app.checkedinpatients');
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            var data = options.data ? options.data : null;
            if (options.data && options.data.Data) {
                if (options.data.Data.AssignTo) {
                    $scope.doctor_dashboard();
                }
            }

            $scope.confirmCallback({ ReferredNewConsultation: options.data.Data });
        };

        $scope.saveItem = function () {
            $scope.item.IsNewConsultationReq = true;
            var actionName = '';
            if ($scope.item.AssignTo == 1) {
                //$scope.item.AssignedUserId = $scope.currentcontext.DoctorId;
                //$scope.item.AssignedUserName = $scope.currentcontext.DoctorName;
                //$scope.item.AssignedUserDepartmentId = $scope.currentcontext.DepartmentId;
                actionName = 'appointment/patienttracker/AssignPatient';
            } else if ($scope.item.AssignTo == 2) {
                actionName = 'appointment/patienttracker/AssignPatient';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };

            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'Facility') {
                    $scope.item.FacilityId = value[0].Id;
                }
            });
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility",
                    Request: {
                        Params: [{
                            Key: 4,
                            Value: true
                        }]
                    }, Default: false },
                { "Key": "Department" },
                { "Key": "User" },
                { "Key": "Room" }
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };

            utl.Http.doAction(options);
        };

        $scope.initLookup();
        $scope.getPatientById();
    }


    patientvisitTrackerController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();