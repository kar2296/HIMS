(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientmergeListController', patientmergeListController);

    function patientmergeListController($scope, $stateParams, $state, $translate, utl, Upload) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getValidationCtrl({ $scope: $scope }));
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));
        $scope.item = {};
        $scope.item.AddressMergeId = 1;
        $scope.item.PhoneMergeId = 1;
        $scope.item.EmailMergeId = 1;
        $scope.item.SexMergeId = 1;
        $scope.item.PhotoMergeId = 1;

        $scope.currentcontext = {};
        $scope.currentcontext.CanUserManual = utl.Privilege.hasPrivilege('CanUserManual')
        $scope.currentcontext.CanProcessFlow = utl.Privilege.hasPrivilege('CanProcessFlow')
        $scope.currentcontext.id = parseInt($stateParams.id) || 0;

        $scope.getPatientProfilePicCallback = function (scope, data, options, hasError) {
            $scope.currentcontext.Photo = data.Photo;
        };

        $scope.getPatientProfilePic = function () {
            if ($scope.item.PhotoPath) {
                var inputData = { Id: $scope.item.PatientId, PhotoPath: $scope.item.PhotoPath };
                var options = {
                    action: 'registration/Patient/GetPatientProfilePic',
                    data: { Data: inputData },
                    type: 'post',
                    onComplete: $scope.getPatientProfilePicCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getPatientInfo = function (scope, res, options, hasError) {
            if (res && res.Data &&
                res.Data.length > 0) {
                $scope.selectedPatient = res.Data[0];
                $scope.item.PhotoPath = $scope.selectedPatient.PhotoPath;
                $scope.getPatientProfilePic();
                if ($scope.selectedPatient.Encounters
                    && $scope.selectedPatient.Encounters.length > 0) {
                    var encinfo = $scope.selectedPatient.Encounters[0];
                    $scope.selectedPatient.VisitIdentifier = encinfo.VisitIdentifier;

                    if (encinfo.EncounterTypeId == 1)
                        $scope.selectedPatient.VisitTypeId = 'OP';
                    if (encinfo.EncounterTypeId == 2)
                        $scope.selectedPatient.VisitTypeId = 'IP';
                    if (encinfo.EncounterTypeId == 4)
                        $scope.selectedPatient.VisitTypeId = 'DG';


                    $scope.selectedPatient.DoctorName = encinfo.DoctorName;
                    if (encinfo.EncounterDoctors
                        && encinfo.EncounterDoctors.length > 0) {
                        var encdocinfo = encinfo.EncounterDoctors[0];
                        $scope.selectedPatient.DepartmentName = encdocinfo.Department.DepartmentName;
                    }

                    $scope.selectedPatient.GuarantorName = '';
                    if (encinfo.PatientGuarantor &&
                        encinfo.PatientGuarantor.GuarantorName)
                        $scope.selectedPatient.GuarantorName = encinfo.PatientGuarantor.GuarantorName;

                    $scope.selectedPatient.VisitCompletedTime = encinfo.AdmissionDate;
                }
            }
        }

        $scope.patientChange = function () {
            if ($scope.item.PatientId &&
                $scope.item.PatientId1 &&
                $scope.item.PatientId > 0 &&
                $scope.item.PatientId1 > 0 &&
                $scope.item.PatientId == $scope.item.PatientId1) {
                utl.Alert.showErrorMsg('both should not be same patient....');
                return;
            }
            if ($scope.item.PatientId > 0) {
                $scope.getUnMergedPatList($scope.item.PatientId);
                var inputData = {
                    Params: [
                        { Key: 0, Value: $scope.item.PatientId },
                    ]
                };
                var options = {
                    action: 'registration/patient/GetPatients',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getPatientInfo
                };
                utl.Http.doAction(options);
            }
        }

        $scope.getPatientProfilePicCallback1 = function (scope, data, options, hasError) {
            $scope.currentcontext.Photo1 = data.Photo;
        };

        $scope.getPatientProfilePic1 = function () {
            if ($scope.item.PhotoPath1) {
                var inputData = { Id: $scope.item.PatientId1, PhotoPath: $scope.item.PhotoPath1 };
                var options = {
                    action: 'registration/Patient/GetPatientProfilePic',
                    data: { Data: inputData },
                    type: 'post',
                    onComplete: $scope.getPatientProfilePicCallback1
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getPatientInfo1 = function (scope, res, options, hasError) {
            if (res && res.Data &&
                res.Data.length > 0) {
                $scope.selectedPatient1 = res.Data[0];
                $scope.item.PhotoPath1 = $scope.selectedPatient1.PhotoPath;
                $scope.getPatientProfilePic1();
                if ($scope.selectedPatient1.Encounters
                    && $scope.selectedPatient1.Encounters.length > 0) {
                    var encinfo = $scope.selectedPatient1.Encounters[0];
                    $scope.selectedPatient1.VisitIdentifier = encinfo.VisitIdentifier;

                    if (encinfo.EncounterTypeId == 1)
                        $scope.selectedPatient1.VisitTypeId = 'OP';
                    if (encinfo.EncounterTypeId == 2)
                        $scope.selectedPatient1.VisitTypeId = 'IP';
                    if (encinfo.EncounterTypeId == 4)
                        $scope.selectedPatient1.VisitTypeId = 'DG';


                    $scope.selectedPatient1.DoctorName = encinfo.DoctorName;
                    if (encinfo.EncounterDoctors
                        && encinfo.EncounterDoctors.length > 0) {
                        var encdocinfo = encinfo.EncounterDoctors[0];
                        $scope.selectedPatient1.DepartmentName = encdocinfo.Department.DepartmentName;
                    }

                    $scope.selectedPatient1.GuarantorName = '';
                    if (encinfo.PatientGuarantor &&
                        encinfo.PatientGuarantor.GuarantorName)
                        $scope.selectedPatient1.GuarantorName = encinfo.PatientGuarantor.GuarantorName;

                    $scope.selectedPatient1.VisitCompletedTime = encinfo.AdmissionDate;
                }
            }
        }

        $scope.patientChange1 = function () {
            if ($scope.item.PatientId &&
                $scope.item.PatientId1 &&
                $scope.item.PatientId > 0 &&
                $scope.item.PatientId1 > 0 &&
                $scope.item.PatientId == $scope.item.PatientId1) {
                utl.Alert.showErrorMsg('both should not be same patient....');
                return;
            }
            if ($scope.item.PatientId1 > 0) {
                var inputData = {
                    Params: [
                        { Key: 0, Value: $scope.item.PatientId1 },
                    ]
                };
                var options = {
                    action: 'registration/patient/GetPatients',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getPatientInfo1
                };
                utl.Http.doAction(options);
            }
        }

        $scope.getUnMergedPatList = function (PatientId) {
            if (PatientId > 0) {
                var inputData = {
                    Params: [
                        { Key: 25, Value: PatientId },
                    ]
                };
                var options = {
                    action: 'registration/patientmerge/GetPatientMerge',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getUnMergedPatListCallback
                };
                utl.Http.doAction(options);
            }
        }

       $scope.getUnMergedPatListCallback = function (scope, res, options, hasError) {
           var objtransids = {};
           $scope.TransactionIds = [];
            if (res && res.Data &&
                res.Data.length > 0) {
                for(var idx in res.Data) {
                    var patmerge = res.Data[idx];
                    if(patmerge.TransactionId) {
                        if(!objtransids[patmerge.TransactionId]) {
                            objtransids[patmerge.TransactionId] = patmerge.TransactionId;
                            $scope.TransactionIds.push(patmerge.TransactionId);
                        }
                    }
                }
            }
        }

        $scope.getUnMergedActPatList = function () {
            if ($scope.TransactionIds.length > 0) {
                var inputData = {
                    Params: [
                        { Key: 24, Value: $scope.TransactionIds },
                    ]
                };
                var options = {
                    action: 'registration/patientmerge/GetPatientMerge',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getUnMergedActPatListCallback
                };
                utl.Http.doAction(options);
            }
        }

        $scope.getUnMergedPatListCallback = function (scope, res, options, hasError) {
             console.log(res);
        }

        $scope.backToList = function () {
            $state.go('app.patientsearch');
        };

        $scope.patientMerge = function () {
            if ($scope.item.PatientId &&
                $scope.item.PatientId1 &&
                $scope.item.PatientId > 0 &&
                $scope.item.PatientId1 > 0 &&
                $scope.item.PatientId == $scope.item.PatientId1) {
                utl.Alert.showErrorMsg('both should not be same patient....');
                return;
            }
            if (
                $scope.item.AddressMergeId == 1 &&
                $scope.item.PhoneMergeId == 1 &&
                $scope.item.EmailMergeId == 1 &&
                $scope.item.SexMergeId == 1 &&
                $scope.item.PhotoMergeId == 1

            ) {
                utl.Alert.showErrorMsg('Any changes in primary patient information');
                return;
            }

            var PrimaryPatient = {
                Id: 0,
                PatientId: $scope.selectedPatient.Id,
                TitleId: $scope.selectedPatient.TitleId,
                FirstName: $scope.selectedPatient.FirstName,
                MiddleName: $scope.selectedPatient.MiddleName,
                LastName: $scope.selectedPatient.LastName,
                Age: $scope.selectedPatient.Age,
                DOB: $scope.selectedPatient.DOB,
                MaritalStatusId: $scope.selectedPatient.MaritalStatusId,
                GuardianTypeId: $scope.selectedPatient.GuardianTypeId,
                GuardianName: $scope.selectedPatient.GuardianName,
                ReligionId: $scope.selectedPatient.ReligionId,
                PreferredLanguageId: $scope.selectedPatient.PreferredLanguageId,
                Qualification: $scope.selectedPatient.Qualification,
                NationalityId: $scope.selectedPatient.NationalityId,
                NationalityIdentifier: $scope.selectedPatient.NationalityIdentifier,
                Passpost: $scope.selectedPatient.Passpost,
                VisaTypeId: $scope.selectedPatient.VisaTypeId,
                Visa: $scope.selectedPatient.Visa,
                VisaExpiry: $scope.selectedPatient.VisaExpiry,
                IsVip: $scope.selectedPatient.IsVip,
                IsRecipient: $scope.selectedPatient.IsRecipient,
                IsCouple: $scope.selectedPatient.IsCouple,
                PatientAssociate: $scope.selectedPatient.PatientAssociate,
                VipTypeId: $scope.selectedPatient.VipTypeId,
                PatientTypeId: $scope.selectedPatient.PatientTypeId,
                OccupationId: $scope.selectedPatient.OccupationId,
                BloodGroupId: $scope.selectedPatient.BloodGroupId,
                ReferTypeId: $scope.selectedPatient.ReferTypeId,
                ReferrerId: $scope.selectedPatient.ReferrerId,
                AddressLine1: $scope.selectedPatient.AddressLine1,
                AddressLine2: $scope.selectedPatient.AddressLine2,
                Pincode: $scope.selectedPatient.Pincode,
                Area: $scope.selectedPatient.Area,
                City: $scope.selectedPatient.City,
                State: $scope.selectedPatient.State,
                Country: $scope.selectedPatient.Country,
                LandLine: $scope.selectedPatient.LandLine,
                Mobile: $scope.selectedPatient.Mobile,
                Email: $scope.selectedPatient.Email,
                IsSmsCommunicationPreference: $scope.selectedPatient.IsSmsCommunicationPreference,
                IsEmailCommunicationPreference: $scope.selectedPatient.IsEmailCommunicationPreference,
                IsMRDRequest: $scope.selectedPatient.IsMRDRequest,
                GenderId: $scope.selectedPatient.GenderId,
                MRN: $scope.selectedPatient.MRN,
                PinCodeId: $scope.selectedPatient.PinCodeId,
                CityId: $scope.selectedPatient.CityId,
                StateId: $scope.selectedPatient.StateId,
                CountryId: $scope.selectedPatient.CountryId,
                AliasName: $scope.selectedPatient.AliasName,
                GuarantorId: $scope.selectedPatient.GuarantorId,
                RegisteredDate: $scope.selectedPatient.RegisteredDate,
                PatientStatusId: $scope.selectedPatient.PatientStatusId,
                MRNTypeId: $scope.selectedPatient.MRNTypeId,
                PhotoPath: $scope.selectedPatient.PhotoPath,
                IsBirthDateApproximate: $scope.selectedPatient.IsBirthDateApproximate,
                DeathDate: $scope.selectedPatient.DeathDate,
                DeathTypeId: $scope.selectedPatient.DeathTypeId,
                DeathPlaceId: $scope.selectedPatient.DeathPlaceId,
                IsDeathConfirmed: $scope.selectedPatient.IsDeathConfirmed,
                DeathConfirmedBy: $scope.selectedPatient.DeathConfirmedBy,
                DeathComents: $scope.selectedPatient.DeathComents,
                DeathUpdatedBy: $scope.selectedPatient.DeathUpdatedBy,
                DeathUpdatedDate: $scope.selectedPatient.DeathUpdatedDate,
                DeathApprovedBy: $scope.selectedPatient.DeathApprovedBy,
                FacilityId: $scope.selectedPatient.FacilityId,
                RemarkId: $scope.selectedPatient.RemarkId,
                MRNShortCode: $scope.selectedPatient.MRNShortCode,
                ICENo: $scope.selectedPatient.ICENo,
                Income: $scope.selectedPatient.Income,
                IsInsurance: $scope.selectedPatient.IsInsurance,
                ReferralName: $scope.selectedPatient.ReferralName,
                NooFVisitFree: $scope.selectedPatient.NooFVisitFree,
                IsAdditionalVisit: $scope.selectedPatient.IsAdditionalVisit,
                NewVisitFree: $scope.selectedPatient.NewVisitFree,
                IsMerged: $scope.selectedPatient.IsMerged,
                MergePatientId: $scope.selectedPatient.MergePatientId,
                MergeMRN: $scope.selectedPatient.MergeMRN,
                Status: $scope.selectedPatient.Status,
            };
            var SecondaryPatient = {
                Id: 0,
                PatientId: $scope.selectedPatient1.Id,
                TitleId: $scope.selectedPatient1.TitleId,
                FirstName: $scope.selectedPatient1.FirstName,
                MiddleName: $scope.selectedPatient1.MiddleName,
                LastName: $scope.selectedPatient1.LastName,
                Age: $scope.selectedPatient1.Age,
                DOB: $scope.selectedPatient1.DOB,
                MaritalStatusId: $scope.selectedPatient1.MaritalStatusId,
                GuardianTypeId: $scope.selectedPatient1.GuardianTypeId,
                GuardianName: $scope.selectedPatient1.GuardianName,
                ReligionId: $scope.selectedPatient1.ReligionId,
                PreferredLanguageId: $scope.selectedPatient1.PreferredLanguageId,
                Qualification: $scope.selectedPatient1.Qualification,
                NationalityId: $scope.selectedPatient1.NationalityId,
                NationalityIdentifier: $scope.selectedPatient1.NationalityIdentifier,
                Passpost: $scope.selectedPatient1.Passpost,
                VisaTypeId: $scope.selectedPatient1.VisaTypeId,
                Visa: $scope.selectedPatient1.Visa,
                VisaExpiry: $scope.selectedPatient1.VisaExpiry,
                IsVip: $scope.selectedPatient1.IsVip,
                IsRecipient: $scope.selectedPatient1.IsRecipient,
                IsCouple: $scope.selectedPatient1.IsCouple,
                PatientAssociate: $scope.selectedPatient1.PatientAssociate,
                VipTypeId: $scope.selectedPatient1.VipTypeId,
                PatientTypeId: $scope.selectedPatient1.PatientTypeId,
                OccupationId: $scope.selectedPatient1.OccupationId,
                BloodGroupId: $scope.selectedPatient1.BloodGroupId,
                ReferTypeId: $scope.selectedPatient1.ReferTypeId,
                ReferrerId: $scope.selectedPatient1.ReferrerId,
                AddressLine1: $scope.selectedPatient1.AddressLine1,
                AddressLine2: $scope.selectedPatient1.AddressLine2,
                Pincode: $scope.selectedPatient1.Pincode,
                Area: $scope.selectedPatient1.Area,
                City: $scope.selectedPatient1.City,
                State: $scope.selectedPatient1.State,
                Country: $scope.selectedPatient1.Country,
                LandLine: $scope.selectedPatient1.LandLine,
                Mobile: $scope.selectedPatient1.Mobile,
                Email: $scope.selectedPatient1.Email,
                IsSmsCommunicationPreference: $scope.selectedPatient1.IsSmsCommunicationPreference,
                IsEmailCommunicationPreference: $scope.selectedPatient1.IsEmailCommunicationPreference,
                IsMRDRequest: $scope.selectedPatient1.IsMRDRequest,
                GenderId: $scope.selectedPatient1.GenderId,
                MRN: $scope.selectedPatient1.MRN,
                PinCodeId: $scope.selectedPatient1.PinCodeId,
                CityId: $scope.selectedPatient1.CityId,
                StateId: $scope.selectedPatient1.StateId,
                CountryId: $scope.selectedPatient1.CountryId,
                AliasName: $scope.selectedPatient1.AliasName,
                GuarantorId: $scope.selectedPatient1.GuarantorId,
                RegisteredDate: $scope.selectedPatient1.RegisteredDate,
                PatientStatusId: $scope.selectedPatient1.PatientStatusId,
                MRNTypeId: $scope.selectedPatient1.MRNTypeId,
                PhotoPath: $scope.selectedPatient1.PhotoPath,
                IsBirthDateApproximate: $scope.selectedPatient1.IsBirthDateApproximate,
                DeathDate: $scope.selectedPatient1.DeathDate,
                DeathTypeId: $scope.selectedPatient1.DeathTypeId,
                DeathPlaceId: $scope.selectedPatient1.DeathPlaceId,
                IsDeathConfirmed: $scope.selectedPatient1.IsDeathConfirmed,
                DeathConfirmedBy: $scope.selectedPatient1.DeathConfirmedBy,
                DeathComents: $scope.selectedPatient1.DeathComents,
                DeathUpdatedBy: $scope.selectedPatient1.DeathUpdatedBy,
                DeathUpdatedDate: $scope.selectedPatient1.DeathUpdatedDate,
                DeathApprovedBy: $scope.selectedPatient1.DeathApprovedBy,
                FacilityId: $scope.selectedPatient1.FacilityId,
                RemarkId: $scope.selectedPatient1.RemarkId,
                MRNShortCode: $scope.selectedPatient1.MRNShortCode,
                ICENo: $scope.selectedPatient1.ICENo,
                Income: $scope.selectedPatient1.Income,
                IsInsurance: $scope.selectedPatient1.IsInsurance,
                ReferralName: $scope.selectedPatient1.ReferralName,
                NooFVisitFree: $scope.selectedPatient1.NooFVisitFree,
                IsAdditionalVisit: $scope.selectedPatient1.IsAdditionalVisit,
                NewVisitFree: $scope.selectedPatient1.NewVisitFree,
                IsMerged: $scope.selectedPatient1.IsMerged,
                MergePatientId: $scope.selectedPatient1.MergePatientId,
                MergeMRN: $scope.selectedPatient1.MergeMRN,
                Status: $scope.selectedPatient1.Status,
            };
            var PrimaryPatientAfterChange = {
                Id: $scope.selectedPatient.Id,
                PatientId: $scope.selectedPatient.Id,
                TitleId: $scope.selectedPatient.TitleId,
                FirstName: $scope.selectedPatient.FirstName,
                MiddleName: $scope.selectedPatient.MiddleName,
                LastName: $scope.selectedPatient.LastName,
                Age: $scope.selectedPatient.Age,
                DOB: $scope.selectedPatient.DOB,
                MaritalStatusId: $scope.selectedPatient.MaritalStatusId,
                GuardianTypeId: $scope.selectedPatient.GuardianTypeId,
                GuardianName: $scope.selectedPatient.GuardianName,
                ReligionId: $scope.selectedPatient.ReligionId,
                PreferredLanguageId: $scope.selectedPatient.PreferredLanguageId,
                Qualification: $scope.selectedPatient.Qualification,
                NationalityId: $scope.selectedPatient.NationalityId,
                NationalityIdentifier: $scope.selectedPatient.NationalityIdentifier,
                Passpost: $scope.selectedPatient.Passpost,
                VisaTypeId: $scope.selectedPatient.VisaTypeId,
                Visa: $scope.selectedPatient.Visa,
                VisaExpiry: $scope.selectedPatient.VisaExpiry,
                IsVip: $scope.selectedPatient.IsVip,
                IsRecipient: $scope.selectedPatient.IsRecipient,
                IsCouple: $scope.selectedPatient.IsCouple,
                PatientAssociate: $scope.selectedPatient.PatientAssociate,
                VipTypeId: $scope.selectedPatient.VipTypeId,
                PatientTypeId: $scope.selectedPatient.PatientTypeId,
                OccupationId: $scope.selectedPatient.OccupationId,
                BloodGroupId: $scope.selectedPatient.BloodGroupId,
                ReferTypeId: $scope.selectedPatient.ReferTypeId,
                ReferrerId: $scope.selectedPatient.ReferrerId,
                AddressLine1: $scope.selectedPatient.AddressLine1,
                AddressLine2: $scope.selectedPatient.AddressLine2,
                Pincode: $scope.selectedPatient.Pincode,
                Area: $scope.selectedPatient.Area,
                City: $scope.selectedPatient.City,
                State: $scope.selectedPatient.State,
                Country: $scope.selectedPatient.Country,
                LandLine: $scope.selectedPatient.LandLine,
                Mobile: $scope.selectedPatient.Mobile,
                Email: $scope.selectedPatient.Email,
                IsSmsCommunicationPreference: $scope.selectedPatient.IsSmsCommunicationPreference,
                IsEmailCommunicationPreference: $scope.selectedPatient.IsEmailCommunicationPreference,
                IsMRDRequest: $scope.selectedPatient.IsMRDRequest,
                GenderId: $scope.selectedPatient.GenderId,
                MRN: $scope.selectedPatient.MRN,
                PinCodeId: $scope.selectedPatient.PinCodeId,
                CityId: $scope.selectedPatient.CityId,
                StateId: $scope.selectedPatient.StateId,
                CountryId: $scope.selectedPatient.CountryId,
                AliasName: $scope.selectedPatient.AliasName,
                GuarantorId: $scope.selectedPatient.GuarantorId,
                RegisteredDate: $scope.selectedPatient.RegisteredDate,
                PatientStatusId: $scope.selectedPatient.PatientStatusId,
                MRNTypeId: $scope.selectedPatient.MRNTypeId,
                PhotoPath: $scope.selectedPatient.PhotoPath,
                IsBirthDateApproximate: $scope.selectedPatient.IsBirthDateApproximate,
                DeathDate: $scope.selectedPatient.DeathDate,
                DeathTypeId: $scope.selectedPatient.DeathTypeId,
                DeathPlaceId: $scope.selectedPatient.DeathPlaceId,
                IsDeathConfirmed: $scope.selectedPatient.IsDeathConfirmed,
                DeathConfirmedBy: $scope.selectedPatient.DeathConfirmedBy,
                DeathComents: $scope.selectedPatient.DeathComents,
                DeathUpdatedBy: $scope.selectedPatient.DeathUpdatedBy,
                DeathUpdatedDate: $scope.selectedPatient.DeathUpdatedDate,
                DeathApprovedBy: $scope.selectedPatient.DeathApprovedBy,
                FacilityId: $scope.selectedPatient.FacilityId,
                RemarkId: $scope.selectedPatient.RemarkId,
                MRNShortCode: $scope.selectedPatient.MRNShortCode,
                ICENo: $scope.selectedPatient.ICENo,
                Income: $scope.selectedPatient.Income,
                IsInsurance: $scope.selectedPatient.IsInsurance,
                ReferralName: $scope.selectedPatient.ReferralName,
                NooFVisitFree: $scope.selectedPatient.NooFVisitFree,
                IsAdditionalVisit: $scope.selectedPatient.IsAdditionalVisit,
                NewVisitFree: $scope.selectedPatient.NewVisitFree,
                IsMerged: $scope.selectedPatient.IsMerged,
                MergePatientId: $scope.selectedPatient.Id,
                MergeMRN: $scope.selectedPatient.MergeMRN,
                Status: $scope.selectedPatient.Status,
            };
            var SecondaryPatientAfterChange = {
                Id: $scope.selectedPatient1.Id,
                PatientId: $scope.selectedPatient1.Id,
                TitleId: $scope.selectedPatient1.TitleId,
                FirstName: $scope.selectedPatient1.FirstName,
                MiddleName: $scope.selectedPatient1.MiddleName,
                LastName: $scope.selectedPatient1.LastName,
                Age: $scope.selectedPatient1.Age,
                DOB: $scope.selectedPatient1.DOB,
                MaritalStatusId: $scope.selectedPatient1.MaritalStatusId,
                GuardianTypeId: $scope.selectedPatient1.GuardianTypeId,
                GuardianName: $scope.selectedPatient1.GuardianName,
                ReligionId: $scope.selectedPatient1.ReligionId,
                PreferredLanguageId: $scope.selectedPatient1.PreferredLanguageId,
                Qualification: $scope.selectedPatient1.Qualification,
                NationalityId: $scope.selectedPatient1.NationalityId,
                NationalityIdentifier: $scope.selectedPatient1.NationalityIdentifier,
                Passpost: $scope.selectedPatient1.Passpost,
                VisaTypeId: $scope.selectedPatient1.VisaTypeId,
                Visa: $scope.selectedPatient1.Visa,
                VisaExpiry: $scope.selectedPatient1.VisaExpiry,
                IsVip: $scope.selectedPatient1.IsVip,
                IsRecipient: $scope.selectedPatient1.IsRecipient,
                IsCouple: $scope.selectedPatient1.IsCouple,
                PatientAssociate: $scope.selectedPatient1.PatientAssociate,
                VipTypeId: $scope.selectedPatient1.VipTypeId,
                PatientTypeId: $scope.selectedPatient1.PatientTypeId,
                OccupationId: $scope.selectedPatient1.OccupationId,
                BloodGroupId: $scope.selectedPatient1.BloodGroupId,
                ReferTypeId: $scope.selectedPatient1.ReferTypeId,
                ReferrerId: $scope.selectedPatient1.ReferrerId,
                AddressLine1: $scope.selectedPatient1.AddressLine1,
                AddressLine2: $scope.selectedPatient1.AddressLine2,
                Pincode: $scope.selectedPatient1.Pincode,
                Area: $scope.selectedPatient1.Area,
                City: $scope.selectedPatient1.City,
                State: $scope.selectedPatient1.State,
                Country: $scope.selectedPatient1.Country,
                LandLine: $scope.selectedPatient1.LandLine,
                Mobile: $scope.selectedPatient1.Mobile,
                Email: $scope.selectedPatient1.Email,
                IsSmsCommunicationPreference: $scope.selectedPatient1.IsSmsCommunicationPreference,
                IsEmailCommunicationPreference: $scope.selectedPatient1.IsEmailCommunicationPreference,
                IsMRDRequest: $scope.selectedPatient1.IsMRDRequest,
                GenderId: $scope.selectedPatient1.GenderId,
                MRN: $scope.selectedPatient1.MRN,
                PinCodeId: $scope.selectedPatient1.PinCodeId,
                CityId: $scope.selectedPatient1.CityId,
                StateId: $scope.selectedPatient1.StateId,
                CountryId: $scope.selectedPatient1.CountryId,
                AliasName: $scope.selectedPatient1.AliasName,
                GuarantorId: $scope.selectedPatient1.GuarantorId,
                RegisteredDate: $scope.selectedPatient1.RegisteredDate,
                PatientStatusId: $scope.selectedPatient1.PatientStatusId,
                MRNTypeId: $scope.selectedPatient1.MRNTypeId,
                PhotoPath: $scope.selectedPatient1.PhotoPath,
                IsBirthDateApproximate: $scope.selectedPatient1.IsBirthDateApproximate,
                DeathDate: $scope.selectedPatient1.DeathDate,
                DeathTypeId: $scope.selectedPatient1.DeathTypeId,
                DeathPlaceId: $scope.selectedPatient1.DeathPlaceId,
                IsDeathConfirmed: $scope.selectedPatient1.IsDeathConfirmed,
                DeathConfirmedBy: $scope.selectedPatient1.DeathConfirmedBy,
                DeathComents: $scope.selectedPatient1.DeathComents,
                DeathUpdatedBy: $scope.selectedPatient1.DeathUpdatedBy,
                DeathUpdatedDate: $scope.selectedPatient1.DeathUpdatedDate,
                DeathApprovedBy: $scope.selectedPatient1.DeathApprovedBy,
                FacilityId: $scope.selectedPatient1.FacilityId,
                RemarkId: $scope.selectedPatient1.RemarkId,
                MRNShortCode: $scope.selectedPatient1.MRNShortCode,
                ICENo: $scope.selectedPatient1.ICENo,
                Income: $scope.selectedPatient1.Income,
                IsInsurance: $scope.selectedPatient1.IsInsurance,
                ReferralName: $scope.selectedPatient1.ReferralName,
                NooFVisitFree: $scope.selectedPatient1.NooFVisitFree,
                IsAdditionalVisit: $scope.selectedPatient1.IsAdditionalVisit,
                NewVisitFree: $scope.selectedPatient1.NewVisitFree,
                IsMerged: $scope.selectedPatient1.IsMerged,
                MergePatientId: $scope.selectedPatient1.MergePatientId,
                MergeMRN: $scope.selectedPatient1.MergeMRN,
                Status: $scope.selectedPatient1.Status,
            };

            if ($scope.item.AddressMergeId == 2) {
                PrimaryPatientAfterChange.AddressLine1 = SecondaryPatientAfterChange.AddressLine1;
                PrimaryPatientAfterChange.AddressLine2 = SecondaryPatientAfterChange.AddressLine2;
            }

            if ($scope.item.PhoneMergeId == 2) {
                PrimaryPatientAfterChange.Mobile = SecondaryPatientAfterChange.Mobile;
            }

            if ($scope.item.EmailMergeId == 2) {
                PrimaryPatientAfterChange.Email = SecondaryPatientAfterChange.Email;
            }

            if ($scope.item.SexMergeId == 2) {
                PrimaryPatientAfterChange.GenderId = SecondaryPatientAfterChange.GenderId;
            }

            if ($scope.item.PhotoMergeId == 2) {
                PrimaryPatientAfterChange.PhotoPath = SecondaryPatientAfterChange.PhotoPath;
            }

            PrimaryPatientAfterChange.IsMerged = true;
            PrimaryPatientAfterChange.MergePatientId = SecondaryPatientAfterChange.Id;
            PrimaryPatientAfterChange.MergeMRN = SecondaryPatientAfterChange.MRN;

            SecondaryPatientAfterChange.IsMerged = true;
            SecondaryPatientAfterChange.Status = 100;

            var actionName = 'registration/patientmerge/ManagePatientMerge';
            var inputData = {
                PrimaryPatient: PrimaryPatient,
                SecondaryPatient: SecondaryPatient,
                PrimaryPatientAfterChange: PrimaryPatientAfterChange,
                SecondaryPatientAfterChange: SecondaryPatientAfterChange,
            };
            var options = {
                action: actionName,
                data: { Data: inputData },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);

        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.clear();
        };

        $scope.clear = function () {
            $scope.item = {};
            $scope.selectedPatient = null;
            $scope.selectedPatient1 = null;
            $scope.item.AddressMergeId = 1;
            $scope.item.PhoneMergeId = 1;
            $scope.item.EmailMergeId = 1;
            $scope.item.SexMergeId = 1;
            $scope.item.PhotoMergeId = 1;
            $scope.currentcontext = {};
            $scope.currentcontext.id = 0;
            $('#pid').val('');
            $('#pid1').val('');
            $('#pid').focus();
        };

        $scope.patientUnMerge = function () {

        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Title" },
                { "Key": "YesNo", Default: false },
                { "Key": "Merge", "Default": false },
                { "Key": "MRNType", "Default": false }
            ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.initLookup();
    }

    patientmergeListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'Upload'];

})();