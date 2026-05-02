(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('SurgeryEntrypatientrecordsController', SurgeryEntrypatientrecordsController);

    function SurgeryEntrypatientrecordsController($rootScope, $scope, $timeout, $filter, $stateParams, $state, $translate, utl, Upload) {
        var vm = this;

        $scope.currentcontext = {};
        $scope.item = {};
        $scope.currentcontext = {
            pid: $stateParams.pid
        }

        $scope.getPatientProfilePicCallback = function (scope, data, options, hasError) {
            $scope.currentcontext.Photo = data.Photo;
        };

        $scope.getPatientProfilePic = function () {
            if ($scope.item.PhotoPath) {
                var inputData = {
                    Id: $scope.currentcontext.pid,
                    PhotoPath: $scope.item.PhotoPath
                };
                var options = {
                    action: 'registration/Patient/GetPatientProfilePic',
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.getPatientProfilePicCallback
                };
                utl.Http.doAction(options);
            }
        };


        $scope.getPatientInfo = function (scope, data, options, hasError) {
            if (data.Data && data.Data.length > 0) {
                $scope.selectedPatient = data.Data[0];
                if ($scope.selectedPatient.Title) {
                    $scope.item.PatientName = $scope.selectedPatient.Title.Description;
                    if ($scope.selectedPatient.FirstName)
                        $scope.item.PatientName += ' ' + $scope.selectedPatient.FirstName;
                    if ($scope.selectedPatient.LastName)
                        $scope.item.PatientName += ' ' + $scope.selectedPatient.LastName;
                }
                $scope.item.Age = $scope.selectedPatient.Age;
                $scope.item.DOB = $scope.selectedPatient.DOB;
                $scope.item.GenderId = $scope.selectedPatient.GenderId;
                if ($scope.selectedPatient.Gender) {
                    if ($scope.selectedPatient.Gender.Description) {
                        $scope.item.Gender = $scope.selectedPatient.Gender.Description;
                    }
                }
                $scope.item.NationalityId = $scope.selectedPatient.NationalityId;
                if ($scope.selectedPatient.Nationality) {
                    if ($scope.selectedPatient.Nationality.Description) {
                        $scope.item.Nationality = $scope.selectedPatient.Nationality.Description;
                    }
                }
                $scope.item.NationalityIdentifier = $scope.selectedPatient.NationalityIdentifier;
                $scope.item.Mobile = $scope.selectedPatient.Mobile;
                $scope.item.MRN = $scope.selectedPatient.MRN;
                $scope.item.PhotoPath = $scope.selectedPatient.PhotoPath;
                $scope.item.AddressLine1 = $scope.selectedPatient.AddressLine1;
                $scope.item.AddressLine2 = $scope.selectedPatient.AddressLine2;
                $scope.item.City = $scope.selectedPatient.City;
                $scope.item.Country = $scope.selectedPatient.Country;
                $scope.item.State = $scope.selectedPatient.State;
                $scope.item.PasspostNumber = $scope.selectedPatient.PasspostNumber;
                if ($scope.selectedPatient.Guarantor) {
                    if ($scope.selectedPatient.Guarantor.GuarantorName)
                        $scope.item.GuarantorName = $scope.selectedPatient.Guarantor.GuarantorName;
                }
                if ($scope.selectedPatient.Encounters && $scope.selectedPatient.Encounters.length > 0) {
                    var encounteritem = $scope.selectedPatient.Encounters[0];
                    if (encounteritem.Doctor.Title) {
                        $scope.item.DoctorName = encounteritem.Doctor.Title.Description;
                        if (encounteritem.Doctor.FirstName)
                            $scope.item.DoctorName += ' ' + encounteritem.Doctor.FirstName;
                        if (encounteritem.Doctor.LastName)
                            $scope.item.DoctorName += ' ' + encounteritem.Doctor.LastName;
                    }
                    $scope.item.VisitTypeId = encounteritem.VisitTypeId;
                    $scope.item.VisitIdentifier = encounteritem.VisitIdentifier;
                    $scope.item.Department = encounteritem.Department.DepartmentName;
                    if (encounteritem.EncounterType) {
                        if (encounteritem.EncounterType.Description) {
                            $scope.item.EncounterType = encounteritem.EncounterType.Description;
                        }
                    }
                    if (encounteritem.EncounterTypeId) {
                        $scope.item.EncounterTypeId = encounteritem.EncounterTypeId;
                    }
                    if (encounteritem.WardMaster) {
                        $scope.item.WardName = encounteritem.WardMaster.WardName;
                    }
                    if (encounteritem.WardRoomMaster) {
                        $scope.item.WardName += '/' + encounteritem.WardRoomMaster.RoomNo;
                    }
                    if (encounteritem.WardRoomBedMaster) {
                        $scope.item.WardName += '/' + encounteritem.WardRoomBedMaster.BedNo;
                    }
                    $scope.item.DepartmentId = encounteritem.DepartmentId;
                    $scope.item.DoctorId = encounteritem.DoctorId;
                    $scope.item.TeamId = encounteritem.TeamId;
                    $scope.item.Comments = encounteritem.Comments;
                    $scope.item.EncounterId = encounteritem.EncounterId;
                    $scope.item.AdmissionDate = encounteritem.AdmissionDate;
                    $scope.AppointmentId = encounteritem.AppointmentId;
                }
                $scope.getPatientProfilePic();

            }
        };
        $scope.surgerydashboard = function () {
            $state.go('app.surgerydashboard');
        }; 
        $scope.checkedinpatients = function () {
            $state.go('app.surgeryentries');
        };
        $scope.patientChange = function () {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.currentcontext.pid
                }],
                PageContext: {
                    PageSize: 50,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'registration/patient/GetPatients',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientInfo
            };
            utl.Http.doAction(options);
        };

        $scope.patientChange();

    }

    SurgeryEntrypatientrecordsController.$inject = ['$rootScope', '$scope', '$timeout', '$filter', '$stateParams', '$state', '$translate', 'utl', 'Upload'];

})();