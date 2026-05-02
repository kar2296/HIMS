(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientProfileController', patientProfileController);

    function patientProfileController($rootScope, $scope, $timeout, $filter, $stateParams, $state, $translate, utl, Upload, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.currentcontext = {};
        $scope.item = {};
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }


        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        };
        $scope.checkedinpatients = function () {
            $state.go('app.oppatienttab.mycheckin');
        };
        $scope.cancelCallback = $uibModalInstance.dismiss;
        $scope.getLatestEncounterDetailsCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                for (let i = 0; i < data.Data.length; i++) {
                    $scope.selectedEncounter = data.Data[i];
                    $scope.item.VisitTypeId = $scope.selectedEncounter.VisitTypeId;
                    $scope.item.EncounterType = $scope.selectedEncounter.EncounterType.Description;
                    $scope.item.VisitIdentifier = $scope.selectedEncounter.VisitIdentifier;
                    $scope.item.DepartmentId = $scope.selectedEncounter.DepartmentId;
                    $scope.item.Department = $scope.selectedEncounter.Department.DepartmentName;
                    $scope.item.DoctorId = $scope.selectedEncounter.DoctorId;
                    $scope.item.DoctorName = $scope.selectedEncounter.DoctorName;
                    $scope.item.TeamId = $scope.selectedEncounter.TeamId;
                    $scope.item.Comments = $scope.selectedEncounter.Comments;
                    $scope.item.EncounterId = $scope.selectedEncounter.EncounterId;
                    $scope.item.AdmissionDate = $scope.selectedEncounter.AdmissionDate;
                    $scope.AppointmentId = $scope.selectedEncounter.AppointmentId;
                    if (!$scope.item.ApprovalNumber || $scope.item.ApprovalNumber == null || $scope.item.ApprovalNumber == '') {
                        $scope.item.ApprovalNumber = $scope.selectedEncounter.ApprovalNumber;
                    } else {
                        $scope.item.ApprovalNumber = $scope.item3.ApprovalNumber;
                    }
                }
            }
        };

        $scope.getLatestEncounterDetails = function () {
            if ($scope.currentcontext.pid > 0) {
                var inputData = {
                    Params: [{
                        Key: 4,
                        Value: $scope.currentcontext.pid
                    }
                        //{ Key: 49, Value: 1 }
                    ],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
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

        $scope.getPatientGuarantorDetailsCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                $scope.item.MemberId = data.Data[0].MemberId;
            }
        };

        $scope.getPatientProfilePicCallback = function (scope, data, options, hasError) {
            $scope.currentcontext.Photo = data.Photo;
        };

        $scope.getPatientProfilePic = function () {
            if ($scope.item.PhotoPath) {
                var inputData = {
                    Id: $scope.item.PatientId,
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
                $scope.item.PatientTypeId = $scope.selectedPatient.PatientTypeId;
                if ($scope.selectedPatient.PatientType) {
                    if ($scope.selectedPatient.PatientType.Description) {
                        $scope.item.PatientType = $scope.selectedPatient.PatientType.Description;
                    }
                }
                $scope.item.NationalityId = $scope.selectedPatient.NationalityId;
                if ($scope.selectedPatient.Nationality) {
                    if ($scope.selectedPatient.Nationality.Description) {
                        $scope.item.Nationality = $scope.selectedPatient.Nationality.Description;
                    }
                }
                if ($scope.selectedPatient.Encounters.length > 0) {
                    if ($scope.selectedPatient.Encounters[0].Guarantor) {
                        $scope.item.GuarantorName = $scope.selectedPatient.Encounters[0].Guarantor.GuarantorName;
                    }
                }
                if ($scope.selectedPatient.Encounters.length > 0) {
                    if ($scope.selectedPatient.Encounters[0].Guarantor) {
                        if ($scope.selectedPatient.Encounters[0].Guarantor.TPA) {
                            $scope.item.TPA = $scope.selectedPatient.Encounters[0].Guarantor.TPA.Description;
                        }
                    }
                }
                if ($scope.selectedPatient.Encounters.length > 0) {
                    if ($scope.selectedPatient.Encounters[0].ReferralName) {
                        $scope.item.ReferralName = $scope.selectedPatient.Encounters[0].ReferralName;
                    }
                }
                if ($scope.selectedPatient.Encounters.length > 0) {
                    if ($scope.selectedPatient.Encounters[0].ReferralType) {
                        $scope.item.ReferralType = $scope.selectedPatient.Encounters[0].ReferralType.Description;
                    }
                }
                $scope.item.NationalityIdentifier = $scope.selectedPatient.NationalityIdentifier;
                $scope.item.Mobile = $scope.selectedPatient.Mobile;
                $scope.item.MRN = $scope.selectedPatient.MRN;
                $scope.item.PhotoPath = $scope.selectedPatient.PhotoPath;
                $scope.item.InsuranceCardPhotoPath = $scope.selectedPatient.InsuranceCardPhotoPath;
                $scope.item.IQAMAPhotoPath = $scope.selectedPatient.IQAMAPhotoPath;
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
                    $scope.item.VisitTypeId = encounteritem.VisitTypeId;
                    $scope.item.ClaimNumber = encounteritem.ClaimNumber;
                    // $scope.item.DoctorName = encounteritem.DoctorName;
                    $scope.item.VisitIdentifier = encounteritem.VisitIdentifier;
                    $scope.item.Department = encounteritem.Department.DepartmentName;
                    if (encounteritem.EncounterType) {
                        if (encounteritem.EncounterType.Description) {
                            $scope.item.EncounterType = encounteritem.EncounterType.Description;
                        }
                    }
                    $scope.item.AttenderName = encounteritem.AttenderName;
                    $scope.item.AttenderPhone = encounteritem.AttenderPhone;
                    $scope.item.DepartmentId = encounteritem.DepartmentId;
                    $scope.item.DoctorId = encounteritem.DoctorId;
                    $scope.item.TeamId = encounteritem.TeamId;
                    $scope.item.Comments = encounteritem.Comments;
                    $scope.item.EncounterId = encounteritem.EncounterId;
                    $scope.item.AdmissionDate = encounteritem.AdmissionDate;
                    $scope.AppointmentId = encounteritem.AppointmentId;
                    // if (encounteritem.PromotionalScheme) {
                    //     if (encounteritem.PromotionalScheme.SchemeType)
                    //         $scope.item.SchemaType = encounteritem.PromotionalScheme.SchemeType.Description;
                    // }
                    // $scope.item.GuarantorId = encounteritem.PatientGuarantor.GuarantorId;
                    // $scope.item.GuarantorName = encounteritem.PatientGuarantor.GuarantorName;
                    // $scope.item.GuarantorTypeId = encounteritem.PatientGuarantor.GuarantorTypeId;
                    // $scope.item.GuarantorCustomerId = encounteritem.PatientGuarantor.GuarantorCustomerId;
                    // $scope.item.PolicyNo = encounteritem.PatientGuarantor.PolicyNo;
                    // $scope.item.CashDiscount = encounteritem.PatientGuarantor.CashDiscount;
                    // $scope.item.CashDiscountPercentId = encounteritem.PatientGuarantor.CashDiscountPercentId;
                    // $scope.item.ValidDate = encounteritem.PatientGuarantor.ValidDate;
                    // $scope.item.InsuranceNumber = encounteritem.PatientGuarantor.InsuranceNumber;
                    // $scope.item.InsuranceCardName = encounteritem.PatientGuarantor.ValidDate;
                    // $scope.item.IQAMAName = encounteritem.PatientGuarantor.IQAMAName;
                    // $scope.item.MemberId = encounteritem.PatientGuarantor.MemberId;
                    // $scope.item.GuarantorCustomerCardName = encounteritem.PatientGuarantor.GuarantorCustomerCardName;
                    // $scope.item.GuarantorCustomerName = encounteritem.PatientGuarantor.GuarantorCustomerName;
                    // $scope.currentcontext.claimid = encounteritem.ClaimProcessId;
                }
                $scope.getLatestEncounterDetails();
                $scope.getPatientProfilePic();

            }
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

    patientProfileController.$inject = ['$rootScope', '$scope', '$timeout', '$filter', '$stateParams', '$state', '$translate', 'utl', 'Upload', '$uibModalInstance', 'modalConfig'];

})();