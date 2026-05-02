(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('LisRegistrationController', LisRegistrationController);

    function LisRegistrationController($rootScope, $scope, $timeout, $stateParams, $state, $translate, utl, Upload) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getValidationCtrl({ $scope: $scope }));
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));
        angular.extend(this, utl.Ctrl.getBarcodePrintCtrl({ $scope: $scope }));

        var savehitcompleted = 0;

        $scope.ScheduledAppointment = {};
        $scope.IsMRDFileCreation = 0;
        $scope.IsMRDFileRequest = 0;
        $scope.NoofPrintPatientLabel = 1;
        $scope.NoofPrintMRDLabel = 1;
        $scope.EncounterStatus = ''
        $scope.LastVisitDate = null;
        $scope.IsLastSurgeryVisit = false;
        $scope.PatGuarantorNoofFreeVisit = 0;
        $scope.PatientGuarantor = 0;
        $scope.currentcontext = {};
        $scope.pastvisitinfo = [];
        $scope.DefaultServiceInfo = [];
        $scope.lookup = {};
        $scope.currentcontext.PatientStatusId = 1;
        $scope.currentcontext.id = 0;
        $scope.currentcontext.TotDueAmt = 0;
        $scope.currentcontext.GuarantorTypeId = 1;
        $scope.currentcontext.GrossAmount = 0;
        $scope.currentcontext.file = null;
        $scope.currentcontext.Photo = null;
        $scope.doctorid = 0;
        $scope.departmentid = 0;
        $scope.doctorid = utl.FacilitySetting.getFacilitySettingValue('general', 'doctor');
        $scope.departmentid = utl.FacilitySetting.getFacilitySettingValue('general', 'department');
        $scope.IsDiscountApproved = false;
        $scope.BillWithComeReceipt = true;
        $scope.NooFVisitFreeDisabled = false;
        $scope.currentcontext.CanLisRegCheckOut = utl.Privilege.hasPrivilege('CanLisRegCheckOut');
        $scope.currentcontext.CanLisRegOrderRequest = utl.Privilege.hasPrivilege('CanLisRegOrderRequest');
        $scope.currentcontext.CanLisRegPendingOrders = utl.Privilege.hasPrivilege('CanLisRegPendingOrders');
        $scope.currentcontext.CanLisRegOPDBill = utl.Privilege.hasPrivilege('CanLisRegOPDBill');
        $scope.currentcontext.CanLisRegDGBilling = utl.Privilege.hasPrivilege('CanLisRegDGBilling');
        $scope.currentcontext.CanLisRegB2BBilling = utl.Privilege.hasPrivilege('CanLisRegB2BBilling');
        $scope.tabindexmap = {
            patienttabindex: 1,
            detailtabindex: 2
        };

        $scope.Patientdata = [];
        $scope.item = {};
        $scope.item.NationalityId = 238; // India
        $scope.item.PreferredLanguageId = 4; //English
        $scope.item.MRNTypeId = 2; // Defaulted to MRN
        $scope.item.DoctorId = -1;
        $scope.item.Id = 0;
        $scope.item.GuarantorId = 1000;  //self
        $scope.item.AppointmentCategoryId = 5;
        $scope.item.VisitTypeId = 1;
        $scope.item.IsB2BCustomer = true;
        $scope.item.GuarantorName = '';
        $scope.item.AcutalGuarantorId = 0;
        $scope.item.IsPaidVisit = 0;
        $scope.item.FreeVisit = 0;
        $scope.item.LastFreeVisit = 0;
        $scope.item.IsEmergency = false;
        $scope.item.iswebcamphoto = false;
        $scope.item.PhotoPath = null;
        $scope.item.ScheduleApptId = null;
        $scope.item.ScheduleApptStartTime = null;
        $scope.item.ScheduleApptEndTime = null;
        $scope.item.OverrideDuplicate = false;

        if ($scope.doctorid) {
            $scope.item.DoctorId = parseInt($scope.doctorid);
        }
        if ($scope.departmentid) {
            $scope.item.DepartmentId = parseInt($scope.departmentid);
        }

        $scope.viewScheduleAppt = function () {
            if ($scope.item.PatientId > 0) {
                utl.Modal.open('app.appointmentschedule', {
                    params: {
                        id: 0,
                        pid: $scope.item.PatientId || 0,
                        apptstatusid: 2,
                        doctorId: $scope.item.DoctorId,
                        deptId: $scope.item.DepartmentId,
                        appointmentDate: utl.Formatter.getCurrentDate()
                    },
                    confirmCallback: $scope.getScheduleApptData
                });
            }
        };

        $scope.numberonly = function (e) {
            if ((e.charCode > 47 && e.charCode < 58) || (e.charCode == 0)) {
                return;
            } else
                e.preventDefault();
        };


        $scope.getScheduleApptData = function (ScheduleData) {
            if (ScheduleData.ScheduleApptId) {
                $scope.item.DoctorId = ScheduleData.ScheduleApptDoctorId;
                $scope.item.DepartmentId = ScheduleData.ScheduleApptDepartmentId;
                try {
                    $timeout(function () {
                        $scope.item.ScheduleApptId = ScheduleData.ScheduleApptId;
                        $scope.item.ScheduleApptDispTime = ScheduleData.ScheduleApptDispTime;
                        $scope.item.ScheduleApptStartTime =
                            moment(ScheduleData.ScheduleApptStartTime).format('HH:mm');
                        $scope.item.ScheduleApptEndTime =
                            moment(ScheduleData.ScheduleApptEndTime).format('HH:mm');
                    }, 1000);
                } catch (ex) { }
            }
        };

        $scope.showAppointment = function () {
            if ($scope.item.DoctorId) {
                utl.Modal.open('app.appointmentsview', {
                    params: {
                        id: 0,
                        pid: $scope.item.PatientId || 0,
                        apptstatusid: 6,
                        doctorId: $scope.item.DoctorId,
                        deptId: $scope.item.DepartmentId,
                        EncounterStatus: $scope.EncounterStatus // = 'Checked-In'
                    },
                    confirmCallback: $scope.getNewAppointment
                });
            }
        };

        $scope.getNewAppointment = function (ScheduleData) {
            if (ScheduleData.IsCheckedInAppt) {
                $scope.item.DoctorId = ScheduleData.ScheduleApptDoctorId;
                $scope.item.DepartmentId = ScheduleData.ScheduleApptDepartmentId;
                try {
                    $timeout(function () {
                        $scope.item.IsCheckedInAppt = ScheduleData.IsCheckedInAppt;
                        $scope.item.ScheduleApptId = ScheduleData.ScheduleApptId;
                        $scope.item.ScheduleApptDispTime = ScheduleData.ScheduleApptDispTime;
                        $scope.item.ScheduleApptStartTime =
                            moment(ScheduleData.ScheduleApptStartTime).format('HH:mm');
                        $scope.item.ScheduleApptEndTime =
                            moment(ScheduleData.ScheduleApptEndTime).format('HH:mm');
                        $scope.setDoctorIdFocus();
                    }, 1000);
                } catch (ex) { }
            }
        };

        $scope.getPaidVisitInfoCallback = function (scope, res, options, hasError) {
            var PaidVisitInfo = []
            if (res.Data.length > 0) {
                PaidVisitInfo = res.Data;
            }
            try {
                if (PaidVisitInfo.length > 0) {
                    var vDischargeDate = PaidVisitInfo[0].DischargeDate;
                    $scope.LastVisitDate = utl.Formatter.getDate(vDischargeDate);
                }
            } catch (ex) { $scope.LastVisitDate = null; }
            if (!$scope.LastVisitDate) {
                try {
                    if (PaidVisitInfo.length > 0) {
                        var vAdmissionDate = PaidVisitInfo[0].AdmissionDate;
                        $scope.LastVisitDate = utl.Formatter.getDate(vAdmissionDate);
                    }
                } catch (ex) { $scope.LastVisitDate = null; }
            }
            $scope.EligibleDaysforPaidVisit();
        };

        $scope.getPaidVisitInfo = function () {
            if ($scope.item && $scope.item.PatientId) {
                var inputData = {
                    Params: [
                        { Key: 4, Value: $scope.item.PatientId },
                        { Key: 15, Value: 1 },
                        { Key: 44, Value: 1 },
                    ],
                    PageContext: {
                        PageSize: 1,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'Visit/Visit/GetEncounters',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getPaidVisitInfoCallback
                };
                utl.Http.doAction(options);
            }
        };



        function onGuarantorSelected(dataFromModal) {
            if (dataFromModal && dataFromModal.GuarantorTypeId) {
                $scope.getPatientGuarantor();

                $timeout(function () {
                    $scope.currentcontext.GuarantorTypeId = dataFromModal.GuarantorTypeId;
                    $scope.item.GuarantorId = dataFromModal.gid;
                    if (dataFromModal && dataFromModal.NooFVisitFree)
                        $scope.PatGuarantorNoofFreeVisit = dataFromModal.NooFVisitFree;
                    $scope.setDefaultService();
                }, 900);

            }
        }

        $scope.GetGuarantorCallback = function (scope, data, options, hasError) {
            $scope.lookup["Guarantor"] = data["Guarantor"];
            if ($scope.lookup.Guarantor && $scope.lookup.Guarantor.length > 1) {
                $scope.item.GuarantorId = $scope.lookup.Guarantor[1].Id;
                $scope.PatGuarantorNoofFreeVisit = 0;
                $scope.setDefaultService();
            }
        };

        $scope.GetGuarantor = function () {
            $scope.DefaultServiceTotalAmt = 0;
            $scope.currentcontext.ReceiptAmt = 0;
            $scope.DefaultServiceInfo = [];
            $scope.item.GuarantorId = -1;
            if (!$scope.currentcontext.GuarantorTypeId) {
                $scope.item.GuarantorId = -1;
                // $scope.CalculateNetAmt();
            } else if ($scope.currentcontext.GuarantorTypeId <= 0) {
                $scope.item.GuarantorId = -1;
                // $scope.CalculateNetAmt();
            } else {
                $scope.item.GuarantorId = 1;
                if ($scope.PatientGuarantor == 0) {
                    var inputData = [
                        {
                            "Key": "Guarantor",
                            Request: {
                                Params: [
                                    { Key: 2, Value: $scope.currentcontext.GuarantorTypeId },
                                    { Key: 7, Value: [-1, utl.Session.getCurrentFacilityId()] }
                                ]
                            }
                        }
                    ];
                    $scope.initLookupCall(inputData, $scope.GetGuarantorCallback);
                } else {
                    $scope.getPatientGuarantor();
                }
            }

        };

        $scope.initLookupCall = function (inputData, callback) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: callback
            };
            utl.Http.doAction(options);
        };

        $scope.setDefaultServiceCallback = function (scope, data, options, hasError) {
            $scope.DefaultServiceTotalAmt = 0;
            if (data) {
                $scope.DefaultServiceInfo = data;
            }
            for (var idx in $scope.DefaultServiceInfo) {
                var item = $scope.DefaultServiceInfo[idx];

                if ($scope.item.IsEmergency)
                    $scope.DefaultServiceInfo[idx].Amount = item.EmergencyRate;

                $scope.DefaultServiceTotalAmt += item.Amount;
            }

            if (!$scope.SaveCompleted)
                $scope.currentcontext.ReceiptAmt = $scope.DefaultServiceTotalAmt;

            if ($scope.DefaultServiceTotalAmt > 0) {
                $scope.currentcontext.RdoBillDiscount = false;
                $scope.currentcontext.RdoReceiptAmt = false;
                $scope.currentcontext.RdoBillDiscountMode = false;
            } else {
                $scope.currentcontext.RdoBillDiscount = true;
                $scope.currentcontext.RdoReceiptAmt = true;
                $scope.currentcontext.RdoBillDiscountMode = true;
            }
            $scope.CalculateNetAmt();

            if ($scope.item.IsNoBill)
                $scope.NoBill();

            $scope.getPaidVisitInfo();

        };

        $scope.calculatefreevisit = function () {
            if ($scope.currentcontext.GuarantorTypeId > 1 &&
                $scope.pastvisitinfo.length > 0) {
                $scope.item.LastFreeVisit = $scope.pastvisitinfo[0].FreeVisit;
                $scope.item.LastFreeVisit++;
                $scope.item.FreeVisit = $scope.item.LastFreeVisit;
            } else {
                $scope.item.LastFreeVisit = 0;
                $scope.item.FreeVisit = 0;
            }
        }

        $scope.setDefaultService = function () {
            $scope.DefaultServiceInfo = [];
            var GuarantorId_ = 0;
            var ServiceRateCategoryId_ = 0;
            if ($scope.item.GuarantorId > 0) {
                var GuarantorId = $scope.item.GuarantorId;
                var SelectedGuarantor = utl.Lookup.getObject($scope.lookup.Guarantor, GuarantorId);
                if (SelectedGuarantor) {
                    if ($scope.PatientGuarantor == 0) {
                        GuarantorId_ = SelectedGuarantor.Id;
                        $scope.item.AcutalGuarantorId = GuarantorId_;
                        ServiceRateCategoryId_ = SelectedGuarantor.ServiceRateCategoryId;
                        $scope.item.GuarantorName = SelectedGuarantor.Text;
                    } else {
                        GuarantorId_ = SelectedGuarantor.GuarantorId;
                        $scope.item.AcutalGuarantorId = GuarantorId_;
                        $scope.currentcontext.GuarantorTypeId = SelectedGuarantor.GuarantorTypeId;
                        ServiceRateCategoryId_ = SelectedGuarantor.Guarantor.ServiceRateCategoryId;
                        $scope.item.GuarantorName = SelectedGuarantor.Text;
                    }
                    var NewVisit = 1;
                    if ($scope.pastvisitinfo.length > 0) NewVisit = 2;
                    var Data = {
                        'NewVisit': NewVisit,
                        'FacilityId': utl.Session.getCurrentFacilityId(),
                        'GuarantorTypeId': $scope.currentcontext.GuarantorTypeId,
                        'GuarantorId': GuarantorId_,
                        'GuarantorServiceRateCategoryId': ServiceRateCategoryId_,
                    };
                    var options = {
                        action: 'Visit/Visit/GetOPDefaultServices',
                        data: {
                            Data
                        },
                        type: 'post',
                        onComplete: $scope.setDefaultServiceCallback
                    };
                    utl.Http.doAction(options);
                }
            }
            $scope.calculatefreevisit();
            $scope.CalculateNetAmt();
        };


        $scope.setDoctorIdFocus = function () {
            $('#DoctorId').focus();
        };

        //Reload banner code starts
        $scope.setBannerDelegate = function (cmp) {
            $scope.bannercmp = cmp;
        };

        /* Google Address code starts */
        $scope.autocompleteModel = {};
        $scope.disablegoogleaddopt = true;
        $scope.chkgoogleaddopt = false;
        $scope.clearpreviousaddress = function () {
            $scope.item.AddressLine1 = '';
            $scope.item.AddressLine2 = '';
            $scope.item.PinCodeId = -1;
            $scope.item.Area = '';
            $scope.item.CityId = -1;
            $scope.item.StateId = -1;
            $scope.item.CountryId = -1;
        };
        // Listen to change event
        $scope.$on('gmPlacesAutocomplete::placeChanged', function () {
            var geoComponents = $scope.autocompleteModel.getPlace();
            var latitude = geoComponents.geometry.location.lat();
            var longitude = geoComponents.geometry.location.lng();
            var addressComponents = geoComponents.address_components;
            var name = geoComponents.name;
            var address1 = ''; var address2 = ''; var city = '';
            var area = ''; var state = ''; var country = ''; var pincode = '';
            for (var i = 0; i < addressComponents.length; i++) {
                if (i == 0)
                    $scope.clearpreviousaddress();

                var addressType = addressComponents[i].types[0];
                if (addressType) {
                    if ('premise' == addressType) { // Address 1
                        address1 = addressComponents[i].long_name;
                    } else if ('sublocality_level_1' == addressType) { // Address 2
                        address2 = addressComponents[i].long_name;
                    } else if ('route' == addressType) { // Area
                        city = addressComponents[i].long_name;
                    } else if ('locality' == addressType) { // city
                        area = addressComponents[i].long_name;
                    } else if ('administrative_area_level_1' == addressType) { // state
                        state = addressComponents[i].long_name;
                    } else if ('country' == addressType) { // country
                        country = addressComponents[i].long_name;
                    } else if ('postal_code' == addressType) { // pincode
                        pincode = addressComponents[i].long_name;
                    }
                }
            }
            $scope.item.AddressLine1 = name + ' ' + address1 + ' ' + address2 + ' ' + city;
            $scope.item.AddressLine2 = area + ' ' + state + ' ' + country + ' ' + pincode;
            $scope.$apply();
            if (pincode)
                $scope.getPincodeData(pincode);
        });

        // Get address from Pincode Master
        $scope.getPincodeDataCallback = function (scope, res, options, hasError) {
            if (res.Data) {
                if (res.Data.length > 0) {
                    $scope.item.PinCodeId = res.Data[0].Id;
                    $scope.item.Area = res.Data[0].Area;
                    $scope.item.CityId = res.Data[0].CityId;
                    $scope.item.StateId = res.Data[0].StateId;
                    $scope.item.CountryId = res.Data[0].CountryId;
                }
            }
        };

        $scope.getPincodeData = function (pincode) {
            var inputData = {
                Params: [{ Key: 5, Value: pincode }],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'generalmaster/PincodeMaster/GetPincodeMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPincodeDataCallback
            };
            utl.Http.doAction(options);
        };

        $scope.enablegoogleaddopt = function () {
            $scope.disablegoogleaddopt = !$scope.chkgoogleaddopt;
            $timeout(function () {
                if (!$scope.chkgoogleaddopt) {
                    $scope.autocompleteModel = '';
                    $scope.clearpreviousaddress();
                }
                $('#googleaddopt').focus();
            }, 100);
        };
        /* Google Address code ends */

        $scope.SaveCompleted = false;
        $scope.IsOpenEncounter = false;
        $scope.clear = function () {
            $state.reload();
        };

        $('#myModal').hide();

        $scope.showprocessflow = function () {
            $('#myModal').show();
        };

        $scope.hideprocessflow = function () {
            $('#myModal').hide();
        };

        $scope.addNew = function () {
            $state.reload();
        };

        $scope.backToList = function () {
            $state.go('app.patientsearch');
        };

        $scope.OPDBill = function () {
            $state.go('app.opbilling-list', { id: $scope.item.Id });
        };

        $scope.dgbilling = function () {
            $state.go('app.opbilling-list', { id: $scope.item.Id, tp: 'DG' });
        };

        $scope.b2bbilling = function () {
            $state.go('app.b2bbilling-form', { id: $scope.item.Id });
        };

        $scope.order_dashboard = function () {
            // if ($scope.currentfilter.TestTypeId == 1)
            $state.go('app.lisdashboard');
            // else if ($scope.currentfilter.TestTypeId == 2)
            //     $state.go('app.risdashboard');
        };

        //get patient profile
        $scope.getPatientProfilePicCallback = function (scope, data, options, hasError) {
            //console.log(data);
            $scope.currentcontext.Photo = data.Photo;
        };

        $scope.getPatientProfilePic = function () {
            if ($scope.item.PhotoPath) {
                var inputData = { Id: $scope.item.Id, PhotoPath: $scope.item.PhotoPath };
                var options = {
                    action: 'registration/Patient/GetPatientProfilePic',
                    data: { Data: inputData },
                    type: 'post',
                    onComplete: $scope.getPatientProfilePicCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.checkout = function () {
            if ($scope.AppointmentId && $scope.item.PatientId) {
                utl.Modal.open('app.patienttracker', {
                    params: {
                        pid: $scope.item.PatientId, aid: $scope.AppointmentId,
                        assignto: 3
                    },
                    confirmCallback: $scope.addNew
                });
            }
        };

        $scope.setTempPatDefaultValue = function () {
            $scope.currentcontext.GuarantorTypeId = 1;
            $scope.item.NoDraftBill = 1; // will not create draft bill
            $scope.item.NationalityId = 238; // India
            $scope.item.PreferredLanguageId = 4; //English
            $scope.item.MRNTypeId = 2; // Defaulted to MRN
            // $scope.item.DoctorId = -1;
            $scope.item.DiagnosisId = -1;
            $scope.item.OtherDiagnosis = '';
            // $scope.item.DepartmentId = -1;
            $scope.item.AppointmentCategoryId = 5;
            $scope.item.VisitTypeId = 1;
            $scope.item.AcutalGuarantorId = 0;
            $scope.item.IsPaidVisit = 0;
            $scope.item.FreeVisit = 0;
            $scope.item.LastFreeVisit = 0;
            $scope.item.IsNoBill = false;
            $scope.item.IsEmergency = false;
            $scope.item.iswebcamphoto = false;
            $scope.item.PhotoPath = null;
            $scope.item.ScheduleApptId = null;
            $scope.item.ScheduleApptStartTime = null;
            $scope.item.ScheduleApptEndTime = null;
        };

        $scope.getPatientCallback = function (scope, res, options, hasError) {
            if (res.Data && res.Data.length > 0) {
                $scope.Patientdata = res.Data[0];
                $scope.item = res.Data[0];

                if (!$scope.item.NooFVisitFree) {
                    $scope.item.NooFVisitFree = 0;
                    $scope.NooFVisitFreeDisabled = false;
                } else $scope.NooFVisitFreeDisabled = true;

                $scope.item.PatientId = $scope.item.Id;
                $scope.item.BannerPatientId = 0;
                $timeout(function () {
                    $scope.item.BannerPatientId = $scope.item.Id;
                }, 100);
                if ($scope.item.MRNTypeId == 1) { // TEMP to Active Patient
                    $scope.item.IsTempPatient = true;
                    $scope.item.MRN = null;
                    $scope.item.OverrideDuplicate = true;
                }
                $scope.setTempPatDefaultValue();
                $scope.getPatientProfilePic();
                if ($scope.item.Encounters && $scope.item.Encounters.length > 0) {
                    var encounteritem = $scope.item.Encounters[0];
                    $scope.item.VisitTypeId = encounteritem.VisitTypeId;
                    $scope.item.IsNoBill = encounteritem.IsNoBill;
                    $scope.item.ReferredById = encounteritem.ReferralId;
                    $scope.item.ReferralId = encounteritem.ReferralId;
                    $scope.item.DepartmentId = encounteritem.DepartmentId;
                    $scope.item.DoctorId = encounteritem.DoctorId;
                    $scope.item.DiagnosisId = encounteritem.DiagnosisId;
                    $scope.item.OtherDiagnosis = encounteritem.OtherDiagnosis;
                    $scope.item.TeamId = encounteritem.TeamId;
                    $scope.item.Comments = encounteritem.Comments;
                    $scope.item.EncounterId = encounteritem.EncounterId;
                    $scope.item.ClinicalNotes = encounteritem.ClinicalNotes;
                    $scope.item.IsB2BCustomer = encounteritem.IsB2BCustomer;
                    $scope.AppointmentId = encounteritem.AppointmentId;
                    if (encounteritem.EncounterStatusId == 1) $scope.EncounterStatus = 'Checked-In';
                    else $scope.EncounterStatus = 'Checked-Out';

                    $scope.SaveCompleted = true;
                    $scope.IsOpenEncounter = true;
                } else $scope.EncounterStatus = 'Checked-Out';
                $scope.lookup["Referral"].filter(function (item) {
                    if (item.ReferralId == $scope.item.ReferralId)
                        $scope.item.ReferralTypeId = item.ReferralTypeId;
                });
                var ageObj = utl.Formatter.getDetailedAgeFromDOB($scope.item.DOB);
                $scope.item.ApproxAgeDays = ageObj.d;
                $scope.item.ApproxAgeMonths = ageObj.m;
                $scope.item.Age = ageObj.y;

                // if (!$scope.currentcontext.TokenNo)
                //     $scope.getTokenDisplay();

                // $scope.getPatientBillInfo();
                if ($scope.currentcontext.file && $scope.item.PatientId) {
                    $scope.UploadPatientPhoto();
                }
                $scope.getPatientGuarantor();
            }
            $scope.getMRDFlowRequired();
            $scope.getPatientAttachments();
        };

        $scope.getPatient = function () {
            var inputData = {
                Params: [
                    { Key: 0, Value: $scope.item.Id },
                ],
                PageContext: {
                    PageSize: 50,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'registration/patient/GetPatients',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientCallback
            };
            utl.Http.doAction(options);
        };

        function webcamSuccess(base64String) {
            $scope.item.iswebcamphoto = true;
            $scope.item.webcamphoto = base64String;
            $scope.currentcontext.file = null;
        }

        $scope.openWebCam = function () {
            utl.Modal.open('webcam-modal', {
                params: { pid: $scope.item.PatientId || 0 },
                confirmCallback: webcamSuccess
            });
        };

        $scope.clearimage = function () {
            $scope.currentcontext.file = null;
            $scope.currentcontext.Photo = null;
            $scope.item.iswebcamphoto = false;
            $scope.item.PhotoPath = null;
        };
        $scope.getRemarkNotesCallback = function (scope, data, options, hasError) {
            $scope.RemarkNotes = data;
            if ($scope.item.ClinicalNotes == null) {
                $scope.item.ClinicalNotes = '';
                $scope.item.ClinicalNotes += $scope.RemarkNotes.ClinicalRemarks;
            } else
                var comment = ''
            if ($scope.RemarkNotes.ClinicalRemarks)
                comment = $scope.RemarkNotes.ClinicalRemarks
            $scope.item.ClinicalNotes += comment + ',';
        };

        $scope.getRemarkNotes = function () {
            if ($scope.item.RemarkId && $scope.item.RemarkId > 0) {
                var options = {
                    action: 'generalmaster/ClinicalRemark/GetClinicalRemarkById',
                    data: { Id: $scope.item.RemarkId },
                    type: 'post',
                    onComplete: $scope.getRemarkNotesCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.getAppointmentCallback = function (scope, data, options, hasError) {
            $scope.Appointment = data.Data[0];
            $scope.item.PatientId = $scope.Appointment.PatientId;
            $scope.item.Id = $scope.Appointment.PatientId;
            $scope.getPatient();
            $scope.getPastVisitInfo();
        };

        $scope.getAppointment = function () {
            if ($scope.AppointmentId && $scope.AppointmentId > 0) {
                var inputData = {
                    Params: [
                        { Key: 0, Value: $scope.AppointmentId }
                    ]
                };
                var options = {
                    action: 'Appointment/Appointment/GetAppointments',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getAppointmentCallback
                };

                utl.Http.doAction(options);
            }
        };

        /* Print Coding - Starting  */
        $scope.printOPBill = function () {
            if ($scope.BillInfo && $scope.BillInfo.length > 0) {
                var inputData = {
                    Id: $scope.BillInfo[0].BillId
                };
                var options = {
                    action: 'billing/patientbills/PrintPatientBills',
                    data: inputData,
                    type: 'post'
                };
                utl.Http.doPrint(options);
            }
        };

        $scope.printMRDLabel = function () {
            var noofprint = 1;
            try {
                if ($scope.NoofPrintMRDLabel && !isNaN($scope.NoofPrintMRDLabel))
                    noofprint = parseInt($scope.NoofPrintMRDLabel);
            } catch (ex) { noofprint = 1; }
            try {
                var vTitle = '';
                var vFirstName = '';
                var vLastName = '';
                var vMRN = '';
                var vEncoutnerType = '';
                try {
                    if ($scope.Patientdata && $scope.Patientdata.Title
                        && $scope.Patientdata.Title.Description)
                        vTitle += $scope.Patientdata.Title.Description;

                    if ($scope.Patientdata && $scope.Patientdata
                        && $scope.Patientdata.FirstName)
                        vFirstName += ' ' + $scope.Patientdata.FirstName;


                    if ($scope.Patientdata && $scope.Patientdata
                        && $scope.Patientdata.MRN)
                        vMRN = $scope.Patientdata.MRN;

                } catch (ex) { }

                var code = '';
                var printData = []
                var printCodes = {
                    new_line: '\x0A'
                };
                var code = '';
                code += 'I8,A,001' + printCodes.new_line;
                code += 'Q406,024' + printCodes.new_line;
                code += 'q831' + printCodes.new_line;
                code += 'rN' + printCodes.new_line;
                code += 'S3' + printCodes.new_line;
                code += 'D7' + printCodes.new_line;
                code += 'ZT' + printCodes.new_line;
                code += 'JF' + printCodes.new_line;
                code += 'O' + printCodes.new_line;
                code += 'R111,0' + printCodes.new_line;
                code += 'f100' + printCodes.new_line;
                code += 'N' + printCodes.new_line;
                code += 'A414,254,2,4,3,3,N,"' + vMRN + '"' + printCodes.new_line;
                code += 'A507,174,2,4,2,2,N,"' + vTitle + ' ' + vFirstName + ' ' + vLastName + '"' + printCodes.new_line;
                code += 'B437,116,2,1,4,12,66,B,"' + vMRN + '"' + printCodes.new_line;
                code += noofprint > 1 ? 'P' + noofprint + printCodes.new_line : 'P1' + printCodes.new_line;
                printData.push(code);
                $scope.printRaw(printData);
            } catch (ex) { console.log(ex); }
        };

        $scope.printPatientLabel = function () {
            var noofprint = 1;
            try {
                if ($scope.NoofPrintPatientLabel && !isNaN($scope.NoofPrintPatientLabel))
                    noofprint = parseInt($scope.NoofPrintPatientLabel);
            } catch (ex) { noofprint = 1; }
            try {
                var vTitle = '';
                var vFirstName = '';
                var vLastName = '';
                var vMRN = '';
                var vEncoutnerType = '';
                var vAddress = '';
                var vRegisteredDate = '';
                var vPhoneNumber = '';
                var vGender = '';
                var vDoctor = '';
                var vDOB = '';
                var vArea = '';
                var vCityTownName = '';
                var vGender = '';
                var vAddressLine1 = '';
                var vAddressLine2 = '';
                var vAge = '';
                try {
                    if ($scope.Patientdata && $scope.Patientdata.Title
                        && $scope.Patientdata.Title.Description)
                        vTitle += $scope.Patientdata.Title.Description;

                    if ($scope.Patientdata && $scope.Patientdata
                        && $scope.Patientdata.FirstName)
                        vFirstName += ' ' + $scope.Patientdata.FirstName;

                    if ($scope.Patientdata && $scope.Patientdata
                        && $scope.Patientdata.LastName)
                        vLastName += ' ' + $scope.Patientdata.LastName;

                    if ($scope.Patientdata && $scope.Patientdata
                        && $scope.Patientdata.MRN)
                        vMRN = $scope.Patientdata.MRN;


                    if ($scope.Patientdata && $scope.Patientdata
                        && $scope.Patientdata.DOB)
                        vDOB = $scope.Patientdata.DOB;

                    if ($scope.Patientdata && $scope.Patientdata
                        && $scope.Patientdata.RegisteredDate)
                        vRegisteredDate = $scope.Patientdata.RegisteredDate;
                    var dateString = vRegisteredDate.toString();
                    vRegisteredDate = dateString.substring(10, 0);

                    if ($scope.Patientdata && $scope.Patientdata
                        && $scope.Patientdata.Age)
                        vAge = $scope.Patientdata.Age;
                    vAge = (vAge == "") ? vAge = ((typeof $scope.Patientdata.ApproxAgeMonths != "undefined") ? $scope.Patientdata.ApproxAgeMonths + "M " : "0M ") + $scope.Patientdata.ApproxAgeDays + "D" : vAge + "Y";


                    if ($scope.Patientdata && $scope.Patientdata
                        && $scope.Patientdata.Mobile)
                        vPhoneNumber = $scope.Patientdata.Mobile;

                    if ($scope.Patientdata && $scope.Patientdata
                        && $scope.Patientdata.Gender.Description)
                        vGender = $scope.Patientdata.Gender.Description;

                    if ($scope.Patientdata && $scope.Patientdata
                        && $scope.Patientdata.Area)
                        vArea = $scope.Patientdata.Area;

                    if ($scope.Patientdata && $scope.Patientdata
                        && $scope.Patientdata.AddressLine1)
                        vAddressLine1 = $scope.Patientdata.AddressLine1;


                    if ($scope.Patientdata && $scope.Patientdata
                        && $scope.Patientdata.AddressLine2)
                        vAddressLine2 = $scope.Patientdata.AddressLine2;

                    if ($scope.Patientdata && $scope.Patientdata
                        && $scope.Patientdata.City)
                        vCityTownName = $scope.Patientdata.City;

                    if ($scope.Patientdata && $scope.Patientdata
                        && $scope.Patientdata.Age)
                        vDoctor = $scope.Patientdata.Age;



                } catch (ex) { }

                var code = '';
                var printData = []
                var printCodes = {
                    new_line: '\x0A'
                };
                var code = '';
                code += 'I8,A,001' + printCodes.new_line;
                code += 'Q406,024' + printCodes.new_line;
                code += 'q831' + printCodes.new_line;
                code += 'rN' + printCodes.new_line;
                code += 'S3' + printCodes.new_line;
                code += 'D7' + printCodes.new_line;
                code += 'ZT' + printCodes.new_line;
                code += 'JF' + printCodes.new_line;
                code += 'O' + printCodes.new_line;
                code += 'R111,0' + printCodes.new_line;
                code += 'f100' + printCodes.new_line;
                code += 'N' + printCodes.new_line;
                code += 'A582,255,2,4,1,1,N,"' + 'MRN.NO' + '"' + printCodes.new_line;
                code += 'A492,255,2,4,1,1,N,"' + '  :' + ' ' + vMRN + '"' + printCodes.new_line;
                code += 'A582,225,2,4,1,1,N,"' + 'Name' + '"' + printCodes.new_line;
                code += 'A479,226,2,4,1,1,N,"' + ' :' + ' ' + vTitle + ' ' + vFirstName + ' ' + vLastName + '"' + printCodes.new_line;
                code += 'A583,197,2,4,1,1,N,"' + 'Address' + '"' + printCodes.new_line;
                code += 'A456,198,2,4,1,1,N,"' + ':' + ' ' + vArea + '"' + printCodes.new_line;
                code += 'A581,169,2,4,1,1,N,"' + 'Phone#' + '"' + printCodes.new_line;
                code += 'A468,169,2,4,1,1,N,"' + ' :' + ' ' + vPhoneNumber + '"' + printCodes.new_line;
                code += 'A580,140,2,4,1,1,N,"' + 'Reg.Date' + '"' + printCodes.new_line;
                code += 'A453,141,2,4,1,1,N,"' + ':' + ' ' + vRegisteredDate + '"' + printCodes.new_line;
                code += 'A580,113,2,4,1,1,N,"' + 'Gender/Age' + '"' + printCodes.new_line;
                code += 'A453,113,2,4,1,1,N,"' + ':' + ' ' + vGender + ' /' + vDoctor + '"' + printCodes.new_line;
                code += 'B415,82,2,1,4,12,40,B,"' + vMRN + '"' + printCodes.new_line;
                code += noofprint > 1 ? 'P' + noofprint + printCodes.new_line : 'P1' + printCodes.new_line;
                printData.push(code);
                $scope.printRaw(printData);
            } catch (ex) { console.log(ex); }
        };

        $scope.printRegistration = function () {
            var inputData = {
                Id: $scope.item.PatientId,
                Data: {
                    EncounterId: $scope.item.EncounterId
                }
            };
            var options = {
                action: 'registration/Patient/PrintPatientWithEncounter',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.printRegistrationIdlabel = function () {
            var inputData = {
                Id: $scope.item.PatientId,
                Data: true
            };
            var options = {
                action: 'registration/Patient/PrintPatientLabel',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.downloadFileCallback = function (scope, data, options, hasError) {
            console.log('Successfully downloaded....');
        };

        $scope.printRegistrationIdCard = function () {
            var inputData = {
                Id: $scope.item.PatientId,
                Data: true
            };
            var options = {
                action: 'registration/Patient/PrintPatientLabel',
                data: inputData,
                type: 'post',
                onComplete: $scope.downloadFileCallback
            };
            utl.Http.doDownload(options);
        };

        $scope.printVisitSlip = function () {
            if ($scope.AppointmentId) {
                var inputData = {
                    Id: $scope.AppointmentId
                };
                var options = {
                    action: 'appointment/Appointment/PrintAppointment',
                    data: inputData,
                    type: 'post',
                    // onComplete:$scope.backToList
                };
                utl.Http.doDownload(options);
            }
        };
        /* Print Coding - End  */

        var sort_by = function (field, reverse, primer) {
            var key = primer ?
                function (x) { return primer(x[field]) } :
                function (x) { return x[field] };

            reverse = !reverse ? 1 : -1;

            return function (a, b) {
                return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
            }
        }

        $scope.getPatientGuarantorCallback = function (scope, data, options, hasError) {
            if (data && data.PatientGuarantor) {
                data.PatientGuarantor.sort(sort_by('Rank', false, parseInt));
                if (!$scope.item.Encounters || $scope.item.Encounters.length <= 0) { // followup always Self
                    data.PatientGuarantor.sort(sort_by('GuarantorTypeId', false, parseInt));
                }
                $scope.PatientGuarantor = 1;
                $scope.lookup['Guarantor'] = data.PatientGuarantor;
                if ($scope.lookup.Guarantor && $scope.lookup.Guarantor.length > 1) {
                    $scope.item.GuarantorId = $scope.lookup.Guarantor[1].Id;
                    if ($scope.item && $scope.item.Encounters &&
                        $scope.item.Encounters.length > 0) {
                        $scope.item.GuarantorId = $scope.item.Encounters[0].GuarantorId;
                    }
                    $scope.currentcontext.GuarantorTypeId = $scope.lookup.Guarantor[1].GuarantorTypeId;
                    $scope.PatGuarantorNoofFreeVisit = $scope.lookup.Guarantor[1].NooFVisitFree;
                }
                $timeout(function () {
                    $scope.setDefaultService();
                }, 1500);
            }
        };

        $scope.getPatientGuarantor = function () {
            if ($scope.item.PatientId && $scope.item.PatientId > 0) {
                var inputData = [
                    {
                        Key: "PatientGuarantor", Request: {
                            Params: [
                                { Key: 1, Value: 2 }, { Key: 2, Value: $scope.item.PatientId }]
                        }
                    }
                ];

                var options = {
                    action: 'General/Options/getoptions',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getPatientGuarantorCallback
                };
                utl.Http.doAction(options);
            }
        };

        function patientPickerCallback(patientdata) {
            $scope.item.PatientId = patientdata.pid;
            $scope.item.Id = patientdata.pid;
            $scope.getPastVisitInfo();
            $scope.getPatient();
            $scope.getPatientGuarantor();
        }

        $scope.pickPatient = function () {
            utl.Modal.open('app.patientpicker', {
                params: {},
                confirmCallback: patientPickerCallback
            });
        };
        $scope.orderrequest = function () {
            utl.Modal.open('patientemr.patientorder', {
                params: { pid: $scope.item.Id, eid: $scope.item.EncounterId, context: 'emr', returnurl: 'app.lisregistration' },
                // confirmCallback: patientPickerCallback
            });
        }
        $scope.pendingorders = function () {
            utl.Modal.open('app.patientorderhistory', {
                params: { pid: $scope.item.Id, eid: $scope.item.EncounterId },
                // confirmCallback: patientPickerCallback
            });
        }
        $scope.patientChange = function () {
            $scope.item.ScheduleApptId = null;
            $scope.item.ScheduleApptTime = null;
            $scope.DefaultServiceInfo = [];
            $scope.pastvisitinfo = [];
            $scope.IsOpenEncounter = false;
            if ($scope.item.PatientId > 0) {
                // $scope.getPastVisitInfo();
                $scope.item.Id = $scope.item.PatientId;
                $scope.getPatient();
            }
            if ($scope.item.MRNTypeId != 2) {
                $scope.item.MRNTypeId = 2;
                $scope.item.MRN = null;
            }
        };

        $scope.canShowApproxAge = function (vTitleId) {
            if (vTitleId && $scope.lookup) {
                for (var idx in $scope.lookup.Title) {
                    if (vTitleId == $scope.lookup.Title[idx].Id)
                        if ($scope.lookup.Title[idx].Code.toLowerCase() == "babyof")
                            return true;
                }
            }
            return false;
        };

        $scope.fillGenderInfo = function () {
            if ($scope.item.TitleId == 10 || $scope.item.TitleId == 37) { // 10-MR 37-master
                $scope.item.GenderId = 1; // 1-Male
            } else if ($scope.item.TitleId == 11 || $scope.item.TitleId == 12 || $scope.item.TitleId == 5) { //11- MRS, 12- MS, 5 - MISS
                $scope.item.GenderId = 2; // 2-FeMale
            }
        };

        $scope.calculateAge = function () {
            $scope.item.Age = utl.Formatter.getAgeFromDOB($scope.item.DOB);
        };

        $scope.calculateDOB = function (age, substractPart) {
            var options = { d: $scope.item.ApproxAgeDays, m: $scope.item.ApproxAgeMonths, y: $scope.item.Age };
            $scope.item.DOB = utl.Formatter.getDOBFromAgeConfig(options);
            $scope.item.IsBirthDateApproximate = true;
        };

        $scope.saveAndApprove = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.PatientStatus = 'Active';
            $scope.isSaveAndApprove = true;
            var msg = 'Are you Sure Do you Want Register and Create Visit For ' + $scope.item.FirstName;
            if ($scope.item.PatientId > 0)
                msg = 'registration.registrationcumvisit.savemsg.lbl', + $scope.item.FirstName;
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: msg,
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        function handlePatientExists(data) {
            var confirmOptions = {
                messageKey: 'registration.fullregistration.patient-exists-msg.lbl',
                placeholder: { patientcount: (data * -1) },
                onSuccessMethod: function () {
                    $scope.item.OverrideDuplicate = true;
                    $scope.saveItem();
                }
            };

            utl.Dialog.confirmMessage(confirmOptions);
        }

        $scope.fillDefaultValues = function () {
            var currentdate = utl.Formatter.getCurrentDate();
            $scope.pastvisitinfo = [];
            $scope.PatientGuarantor = 0;
            $scope.DefaultServiceTotalAmt = 0;
            $scope.PatientPaymentDetails = [];
            $scope.DefaultServiceInfo = [];
            $scope.lookup = {};
            $scope.currentcontext.PatientStatusId = 1;
            $scope.currentcontext.id = 0;
            $scope.tabindexmap = {
                patienttabindex: 1,
                detailtabindex: 2
            };
            $scope.item.NoDraftBill = 1; // will not create draft bill
            $scope.item.NationalityId = 238 // India
            $scope.item.PreferredLanguageId = 4; //English
            $scope.item.MRNTypeId = 2; // Defaulted to MRN
            // $scope.item.DoctorId = -1;
            $scope.item.DiagnosisId = -1;
            $scope.item.OtherDiagnosis = '';
            // $scope.item.DepartmentId = -1;
            $scope.item.Id = 0;
            $scope.currentcontext.GuarantorTypeId = 1;
            $scope.item.GuarantorId = -1;
            $scope.item.AppointmentCategoryId = 5;
            $scope.item.AcutalGuarantorId = 0;
            $scope.item.VisitTypeId = 1;
            $scope.item.RegisteredDate = utl.Formatter.getDateStringForAppointment(currentdate);
            $scope.item.NationalityId = 238 // India
            $scope.item.PreferredLanguageId = 4; //English
            $scope.item.MRNTypeId = 2; // Defaulted to MRN
            $scope.item.IsPaidVisit = 0;
            $scope.item.FreeVisit = 0;
            $scope.item.LastFreeVisit = 0;
            $scope.item.IsNoBill = false;
            $scope.item.IsEmergency = false;
            $scope.GetGuarantor();
        };

        if (!$scope.currentcontext.id || $scope.currentcontext.id == 0) {
            $scope.fillDefaultValues();
        }

        $scope.afterSave = function (data, options) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (typeof (data) == 'number') {
                $scope.AppointmentId = data;
                $scope.SaveCompleted = true;
                // $scope.getTokenDisplay();
                $scope.getAppointment();
                $scope.EnableOPD = true;
                $scope.PatientGuarantor = 1;
            }

            // $timeout(function () {
            //     $scope.printOPBill();
            //     $scope.printVisitSlip();
            // }, 1000);

        };

        $scope.UploadPatientPhoto = function () {
            var actionName = 'registration/patient/UpdatePatient';
            if ($scope.currentcontext.file && $scope.item.PatientId) {
                $scope.data = {};
                $scope.data.PatientId = $scope.item.PatientId;
                $scope.data.Id = $scope.item.PatientId;
                $scope.data.MRNTypeId = 2;
                $scope.data.MRN = $scope.item.MRN;
                $scope.data.PatientStatus = 'Active';
                var actionUrl = utl.Http.getRootPath() + actionName;
                Upload.upload({
                    url: actionUrl,
                    data: {
                        file: $scope.currentcontext.file,
                        Data: $scope.data,
                    }
                }).then(function (resp) { //upload function returns a promise
                    if (resp.data < 0) {
                        handlePatientExists(resp.data);
                    } else {
                        console.log('Uploaded...');
                    }
                },
                    function (resp) { //catch error
                        console.log('Error status: ' + resp.status);
                        utl.Alert.showErrorMsg('Error status: ' + resp.status);
                    },
                    function (evt) {
                        console.log(evt);
                    });
                return false;
            }
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            savehitcompleted = 0;
            if (data < 0) {
                handlePatientExists(data);
                $scope.currentcontext.canDisableApprove = false;
            } else {
                if (typeof (data) == 'number') {
                    $scope.currentcontext.id = data;
                    $scope.afterSave(data, options);
                }
            }
        };

        $scope.errorItemCallback = function (scope, data, options, hasError) {
            savehitcompleted = 0;
        };

        /* - Security IsValid */
        $scope.securitypisvalid = false;
        $scope.SecurityPINChkCallback = function (SecurityStatus) {
            //console.log(SecurityStatus);
            $scope.securitypisvalid = SecurityStatus.pinstatus;
            $scope.saveItem();
        };

        $scope.securitydialogopened = false;
        $scope.securitypindiagCallback = function () {
            $scope.securitydialogopened = false;
        };

        $scope.securitypincheck = function () {
            if ($scope.requiredsecuritypin) {
                if (!$scope.securitydialogopened) {
                    $scope.securitydialogopened = true;
                    utl.Modal.open('app.securitypincheck', {
                        params: {},
                        confirmCallback: $scope.SecurityPINChkCallback,
                        cancelCallback: $scope.securitypindiagCallback
                    });
                }
                return false;
            }
        };
        /* - Security IsValid */

        $scope.AlertForFreeVisit = function () {
            var msg = 'Now, Number of Free Visit is closed, can you continue Another guarantor';
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: msg,
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: null,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.saveItem = function () {

            if (savehitcompleted == 1) return;

            if (!$scope.item.DoctorId || $scope.item.DoctorId == -1 || !$scope.item.DepartmentId || $scope.item.DepartmentId == -1) {
                utl.Alert.showErrorMsg($translate.instant('registration.fullregistration.errormsgfailitydocdept.lbl'));
                return false;
            }
            if ($scope.IsOpenEncounter) {
                utl.Alert.showErrorMsg($translate.instant('registration.registrationcumvisit.exapp.lbl'));
                return false;
            }

            if (!utl.Validator.validate($scope)) {
                return;
            }

            if (utl.Formatter.isFutureDate($scope.item.DOB)) {
                utl.Alert.showErrorMsg($translate.instant('registration.quickregistration.dobdate-cant-future-msg.lbl'));
                return;
            }

            if (!$scope.item.LandLine && !$scope.item.Mobile) {
                utl.Alert.showErrorMsg($translate.instant('registration.quickregistration.atleast-one-contactno-msg.lbl'));
                return;
            }

            if ($scope.currentcontext.GuarantorTypeId > 1
                && $scope.requirefreevisitalert) {
                try {
                    var noofvisitfree = 0;
                    noofvisitfree = parseInt($scope.item.NooFVisitFree);
                    $scope.item.NooFVisitFree = noofvisitfree;
                } catch (ex) { }

                if (!$scope.item.NooFVisitFree) {
                    $scope.AlertForFreeVisit();
                    return;
                } else if ($scope.item.NooFVisitFree == 0) {
                    $scope.AlertForFreeVisit();
                    return;
                }

            }

            /* Security IsValid */
            $scope.requiredsecuritypin =
                utl.FacilitySetting.getFacilitySettingValue('billing', 'requiredsecuritypin');

            if ($scope.requiredsecuritypin && !$scope.securitypisvalid)
                if (!$scope.securitypincheck())
                    return false;

            /* Security IsValid */

            if (!$scope.currentcontext.id || $scope.currentcontext.id == 0) {
                $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
            }
            if ($scope.item.PatArchId > 0) {
                $scope.item.Id = 0;
            }
            var actionName = 'registration/patient/RegCumVisitWithLIS';
            if ($scope.isSaveAndApprove) {
                $scope.currentcontext.canDisableApprove = true;
            }

            if ($scope.item.FirstName) {
                $scope.item.FirstName = utl.Formatter.Trim($scope.item.FirstName);
            }

            $scope.item.MRNTypeId = 2;
            $scope.item.PatientStatus = 'Active';
            $scope.item.NoDraftBill = 1; // will not create draft bill
            $scope.item.IsRegCumBill = 1;
            $scope.item.GuarantorTypeId = $scope.currentcontext.GuarantorTypeId;
            $scope.item.IsPaidVisit = 0;
            if (!$scope.item.IsNoBill) {
                if ($scope.DefaultServiceTotalAmt > 0) {
                    $scope.item.IsPaidVisit = 1;
                    $scope.item.FreeVisit = 0;
                } else {
                    $scope.item.IsPaidVisit = 0;
                    $scope.item.FreeVisit = $scope.item.LastFreeVisit;
                }
            }

            if ($scope.currentcontext.GuarantorTypeId > 1
                && $scope.requirefreevisitalert) {
                if ($scope.item.NooFVisitFree) {

                    $scope.item.NooFVisitFree--;

                    if (!$scope.item.FreeVisit) $scope.item.FreeVisit++;
                    else $scope.item.FreeVisit = $scope.item.LastFreeVisit;
                }
            }
            savehitcompleted = 1;
            var options = {
                action: actionName,
                data: { Data: { Reg: { Data: $scope.item, file: null } } },
                type: 'post',
                onComplete: $scope.saveItemCallback,
                onError: $scope.errorItemCallback
            };
            utl.Http.doAction(options);
        };


        $scope.openattachments = function () {
            if ($scope.currentcontext.id > 0) {
                utl.Modal.open('app.patientattachments', {
                    params: { pid: $scope.currentcontext.id, itemid: $scope.item.Id, objecttypeid: 1 },
                    confirmCallback: $scope.getPatientAttachments,
                    cancelCallback: $scope.getPatientAttachments
                });
            }
            else {
                utl.Alert.showErrorMsg($translate.instant('registration.fullregistration.savepatient-msg.lbl'));
            }
        };

        $scope.getPatientAttachmentsCallback = function (scope, res, options, hasError) {
            $scope.currentcontext.attachmentcount = res.PageContext.TotalRecords;
        };

        $scope.getPatientAttachments = function () {
            var inputData = {
                Params: [{ Key: 2, Value: $scope.currentcontext.id }, { Key: 3, Value: 1 }],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'registration/PatientAttachment/GetPatientAttachments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientAttachmentsCallback
            };
            utl.Http.doAction(options);
        };


        $scope.getFollowupDeptwiseCallback = function (scope, res, options, hasError) {
            $scope.item.VisitTypeId = 1;
            if (res && res.Data && res.Data.length > 0 && !$scope.item.EncounterId) $scope.item.VisitTypeId = 2;
            else if (res && res.Data && res.Data.length > 1 && $scope.item.EncounterId) $scope.item.VisitTypeId = 2;
        }

        $scope.getFollowupDeptwise = function () {
            $scope.followupdeptwise =
                utl.FacilitySetting.getFacilitySettingValue('billing', 'followupdeptwise');
            if ($scope.followupdeptwise) {
                if ($scope.item && $scope.item.PatientId) {
                    var inputData = {
                        Params: [
                            { Key: 4, Value: $scope.item.PatientId },
                            { Key: 6, Value: $scope.item.DepartmentId },
                            { Key: 15, Value: 1 },
                        ],
                        PageContext: {
                            PageSize: 3,
                            PageNumber: 1
                        }
                    };
                    var options = {
                        action: 'Visit/Visit/GetEncounters',
                        data: inputData,
                        type: 'post',
                        onComplete: $scope.getFollowupDeptwiseCallback
                    };
                    utl.Http.doAction(options);
                }
            }
        }
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        /* set Focus 07-02-18 */

        $scope.moveHeaderFocus = function (nextId) {
            if (event.keyCode == 13) {
                if (nextId == "pid") {
                    if ($scope.item && $scope.item.PatientId) $('#DoctorId').focus();
                    else {
                        var titledom = document.getElementById('title');
                        $scope.setCmbFocus(titledom);
                    }
                }
            }
        };

        $scope.setCmbFocus = function (dom) {
            $timeout(function () {
                var uiSelect = angular.element(dom);
                var uichild = uiSelect.controller('uiSelect');
                uichild.activate();
            }, 100);
        };

        $scope.FooterFocus = function (nextId) {
            if (event.keyCode == 13) {
                if (nextId == "paymenttype") {
                    if ($scope.currentcontext.PaymentTypeId == 1) {
                        nextId = "receivedamt"; $('#' + nextId).focus();
                    }
                    else {
                        var banknamedom = document.getElementById('BankName');
                        $scope.setCmbFocus(banknamedom);
                    }
                }
                else if (nextId == "BankName") {
                    $timeout(function () {
                        if ($scope.currentcontext.PaymentTypeId == 2) {
                            nextId = "chequeno"; $('#' + nextId).focus();
                        }
                        else if ($scope.currentcontext.PaymentTypeId == 3) {
                            nextId = "ddno"; $('#' + nextId).focus();
                        }
                        else if ($scope.currentcontext.PaymentTypeId == 4) {
                            nextId = "transationno"; $('#' + nextId).focus();
                        }
                        else if ($scope.currentcontext.PaymentTypeId == 5 || $scope.currentcontext.PaymentTypeId == 6) {
                            nextId = "cardno"; $('#' + nextId).focus();
                        }
                    }, 500);
                }
                else if (nextId == "cardno") {
                    if ($scope.currentcontext.PaymentTypeId == 5 || $scope.currentcontext.PaymentTypeId == 6) {
                        var dom1 = document.getElementById('TerminalNoId');
                        $scope.setCmbFocus(dom1);
                    }
                }
                else if (nextId == "TerminalNoId") {
                    if ($scope.currentcontext.PaymentTypeId == 5 || $scope.currentcontext.PaymentTypeId == 6) {
                        var dom2 = document.getElementById('CardType');
                        $scope.setCmbFocus(dom2);
                    }
                }
                else if (nextId == "chequeno") {
                    if ($scope.currentcontext.PaymentTypeId == 2) {
                        nextId = "CollectedOn"; $('#' + nextId).focus();
                    }
                }
                else if (nextId == "transationno") {
                    if ($scope.currentcontext.PaymentTypeId == 4) {
                        nextId = "CollectedOn"; $('#' + nextId).focus();
                    }
                }
                else if (nextId == "ddno") {
                    if ($scope.currentcontext.PaymentTypeId == 3) {
                        nextId = "CollectedOn"; $('#' + nextId).focus();
                    }
                }
                else if (nextId == "CollectedOn") {
                    if ($scope.currentcontext.PaymentTypeId == 2) {
                        nextId = "Chequedate"; $('#' + nextId).focus();
                    }
                    if ($scope.currentcontext.PaymentTypeId == 3) {
                        nextId = "dddate"; $('#' + nextId).focus();
                    }
                    if ($scope.currentcontext.PaymentTypeId == 4) {
                        nextId = "transferredon"; $('#' + nextId).focus();
                    }
                }
                else if (nextId == "Chequedate") {
                    if ($scope.currentcontext.PaymentTypeId == 2) {
                        nextId = "saveAndApproveid"; $('#' + nextId).focus();
                    }
                }
                else if (nextId == "dddate") {
                    if ($scope.currentcontext.PaymentTypeId == 3) {
                        nextId = "saveAndApproveid"; $('#' + nextId).focus();
                    }
                }
                else if (nextId == "transferredon") {
                    if ($scope.currentcontext.PaymentTypeId == 4) {
                        nextId = "saveAndApproveid"; $('#' + nextId).focus();
                    }
                }
                else if (nextId == "CardType") {
                    if ($scope.currentcontext.PaymentTypeId == 5 || $scope.currentcontext.PaymentTypeId == 6) {
                        nextId = "saveAndApproveid";
                        $('#' + nextId).focus();
                    }
                }
                else if (nextId == "receivedamt") {
                    if ($('#' + nextId).val() <= 0) {
                        var creditapproverdom = document.getElementById('creditapprover');
                        $scope.setCmbFocus(creditapproverdom);
                    } else {
                        nextId = "saveAndApproveid";
                        $('#' + nextId).focus();
                    }
                } else if (nextId == "creditapprover") {
                    nextId = "saveAndApproveid";
                    $('#' + nextId).focus();
                }
            }
            if (event.keyCode == 39) { //right
                if (nextId == "btnsubmit") {
                    nextId = "saveAndApproveid";
                    $('#' + nextId).focus();
                }
            }
            if (event.keyCode == 37) { //left
                if (nextId == "saveAndApproveid") {
                    nextId = "btnsubmit";
                    $('#' + nextId).focus();
                }
            }
        };

        /* set Focus 07-02-18 */

        $scope.addReferral = function () {
            utl.Modal.open('app.referraltab.details', {
                params: { id: 0 },
                confirmCallback: $scope.initLookup
            });
        };

        $scope.referralChange = function () {
            var refObj = utl.Lookup.getObject($scope.lookup.Referral, $scope.item.ReferrerId);
            $scope.item.ReferTypeId = refObj.ReferralTypeId;
            $scope.item.ReferralName = refObj.Text;
        };


        $scope.getDefaultReferralCallback = function (scope, res, options, hasError) {
            if (res && res.Data && res.Data.length > 0) {
                var refObj = res.Data[0];
                $scope.item.ReferrerId = refObj.Id;
                $scope.item.ReferTypeId = refObj.ReferralTypeId;
                $scope.item.ReferralName = refObj.Text;
                $scope.item.ReferrerNumber = refObj.PhoneNo;
                $scope.item.ReferrerEmail = refObj.Email;
            }
        };


        $scope.getDefaultReferral = function () {
            var inputData = {
                Params: [
                    { Key: 5, Value: 2 },
                    { Key: 6, Value: true },
                ],
                PageContext: {
                    PageSize: 1,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'generalmaster/referral/GetReferrals',
                data: inputData,
                type: 'post',
                onComplete: $scope.getDefaultReferralCallback
            };

            utl.Http.doAction(options);
        };

        $scope.referralTypeChangeCallback = function (scope, data, options, hasError) {
            $scope.lookup.Referral = data.Referral;
        };

        $scope.referralTypeChange = function () {
            var inputData = [
                { Key: "Referral", Request: { Params: [{ Key: 3, Value: $scope.item.ReferTypeId }] } }
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.referralTypeChangeCallback
            };
            utl.Http.doAction(options);
        };

        vm.referralcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Referral Code', field: 'ReferralCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Referral Name', field: 'ReferralName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Referral Type', field: 'ReferralType', datatype: 'string', headercls: 'td-type', fieldcls: 'td-type' },
                { header: 'PhoneNo', field: 'PhoneNo', datatype: 'string', headercls: 'td-phone', fieldcls: 'td-phone' },
                { header: 'Area', field: 'Area', datatype: 'string', headercls: 'td-area', fieldcls: 'td-area' }
            ],
            searchparams: {},
            result: {},
            api: 'generalmaster/referral/GetReferrals',
            formatdisplay: formatselectedreferral,
            presearch: presearchreferral,
            postsearch: postsearchreferral
        };

        function formatselectedreferral() {
            var selectedItem = vm.referralcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.ReferrerNumber = selectedItem.PhoneNo;
                $scope.item.ReferrerEmail = selectedItem.Email;
                result = [selectedItem.ReferralName + ' (' + selectedItem.ReferralCode + ')'].join(' ');
            } else if (vm.referralcontrolconfig.rowdata) {
                result = [vm.referralcontrolconfig.rowdata.ReferralName, vm.referralcontrolconfig.rowdata.ReferralCode].join(' ');
            }
            return result;
        }

        function presearchreferral() {
            var query = vm.referralcontrolconfig.query;
            var inputData = {
                Params: [
                    { Key: 3, Value: $scope.item.ReferTypeId }
                ],
                PageContext: { PageSize: 25, PageNumber: 1 }
            };

            if (vm.referralcontrolconfig.searchbyid === true) {
                inputData.Params.push({ Key: 0, Value: $scope.item.ReferralId });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.referralcontrolconfig.searchparams = inputData;
        }

        function postsearchreferral() {
            for (var idx in vm.referralcontrolconfig.result) {
                var item = vm.referralcontrolconfig.result[idx];
                item.ReferralCode = item.ReferralCode;
                if (item.ReferralType)
                    item.ReferralType = item.ReferralType.Description;
                item.PhoneNo = item.PhoneNo;
                if (item.AddressLine1)
                    item.Area = item.AddressLine1 + ',' + item.CityName;
            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.DrTeam = $scope.lookup.Team;
            $scope.lookup.Team = [];
            $scope.lookup.Guarantor = [];
            $scope.getPrintNoOfCopies();
            var facilitydata = $scope.lookup.Facility;
            for (var idx in facilitydata) {
                if (facilitydata[idx].Id > 0) {
                    $scope.item.CityId = facilitydata[idx].CityId;
                    $scope.item.StateId = facilitydata[idx].StateId;
                    $scope.item.CountryId = facilitydata[idx].CountryId;
                }
            }
            $scope.getDefaultReferral();
        };

        $scope.getPrintNoOfCopies = function () {
            try {
                $scope.NoofPrintPatientLabel =
                    utl.FacilitySetting.getFacilitySettingValue('billing', 'patientlabel');
                $scope.NoofPrintMRDLabel =
                    utl.FacilitySetting.getFacilitySettingValue('billing', 'mrdlabel');
            } catch (ex) { }
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Title" },
                { "Key": "Gender" },
                { "Key": "VipType" },
                { "Key": "Referral" },
                { "Key": "GuardianType" },
                { "Key": "GuarantorType" },
                { "Key": "MaritalStatus" },
                { "Key": "ClinicalRemarks" },
                {
                    "Key": "Guarantor", Request: {
                        Params: [
                            { Key: 7, Value: [-1,utl.Session.getCurrentFacilityId()] }
                        ]
                    }
                },
                { "Key": "ReferralType" },
                {
                    "Key": "Remark",
                    Request: {
                        Params: [
                            { Key: 3, Value: 1 }
                        ]
                    }
                },
                { "Key": "EncounterStatus" },
                { "Key": "B2BCustomerMaster" },
                {
                    "Key": "Facility",
                    Request: {
                        Params: [
                            { Key: 0, Value: utl.Session.getCurrentFacilityId() }
                        ]
                    }
                },
            ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.initLookup();

    }

    LisRegistrationController.$inject = ['$rootScope', '$scope', '$timeout', '$stateParams', '$state', '$translate', 'utl', 'Upload'];

})();
