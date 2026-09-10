(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('appointmentsFormController', appointmentsFormController);

    function appointmentsFormController($scope, $stateParams, $state, $translate, utl, $timeout, $filter) {
        var vm = this;

        $scope.lookup = {};
        $scope.noshown = 0;
        $scope.nopatinetsearch = 0;
        $scope.disableAppointment = 0;
        $scope.disableSlot = 0;
        $scope.currentcontext = {
            isnewpatient: false,
            attachmentcount: 0,
            slotType: 'fiveMinutes',
            isScheulderInCurrentTime: false
        };
        $scope.currentcontext.Qualification = '';
        $scope.currentcontext.isnewpatient = true;
        $scope.CanShowCancel = false;
        $scope.NewAppointmentSlot = [];
        $scope.currentcontext.selecteddept = [];
        $scope.patientfilterconfig = {
            isbilloutstanding: true
        };
        if ($stateParams.id) {
            $scope.currentcontext.id = parseInt($stateParams.id);
        }
        console.log($stateParams);
        $scope.AppointmentId = '';
        $scope.newVisit = 0;
        $scope.crossConsult = 0;

        // if ($scope.item.AppointmentCategoryId == 1) {
        //     $scope.currentcontext.isnewpatient = true;
        // }
        $scope.currentcontext.isreschedule = $stateParams.isreschedule;
        $scope.newPatient = {
            FirstName: '',
            Mobile: '',
            TitleId: -1,
            GenderId: -1,
        };
        $scope.apnmntTempPats = 0;
        $scope.apnmntTempPats = utl.FacilitySetting.getFacilitySettingValue('billing', 'apnmntTempPats');

        $scope.searchDoctorbydept = 0;
        $scope.searchDoctorbydept = utl.FacilitySetting.getFacilitySettingValue('billing', 'doctorsearchbydept');

        $scope.item = {
            tabindex: $scope.tabindexmap,
            AppointmentTypeId: 1,
            AppointmentCategoryId: 1,
            FacilityId: utl.Session.getCurrentFacilityId(),
            AppointmentDate: new Date(),
            AppointmentStatusId: 2,
            OrderConsultTypeId: 1,
            IsPaid: false,
            Details: [],
            IsForceBooking: 0,
            ReferTypeId: 9,
            ReferralTypeId: 9,
            ReferralId: '',
            PatientTrackerId: 0
        };
        $scope.CanShowCheckin = false;
        $scope.CanShowCheckout = false;
        $scope.tabindexmap = {
            patienttabindex: 1,
            detailtabindex: 2
        };
        $scope.appointmentList = [];
        $scope.selectedPatient = {};
        $scope.CanShowUpdateBtn = false;

        $scope.AppointmentStatusAlertMap = {
            2: 'appointment.appointment-form.confirm-msg-scheduled.lbl', //SCHEDULED
            3: 'appointment.appointment-form.confirm-msg-confirmed.lbl', //CONFIRMED
            4: 'appointment.appointment-form.confirm-msg-rescheduled.lbl', //RESCHEDULED
            5: 'appointment.appointment-form.confirm-msg-cancelled.lbl', //CANCELLED
            6: 'appointment.appointment-form.confirm-msg-checkedin.lbl', //CHECKEDIN
            11: 'appointment.appointment-form.confirm-msg-checkedout.lbl', //CHECKEDOUT
            12: 'appointment.appointment-form.confirm-msg-noshown.lbl' //No Shown
        };

        $scope.AppointmentStatusMap = {
            2: [2, 3, 4, 5], //SCHEDULED -> CONFIRMED, RESCHEDULED, CANCELLED
            3: [3, 4, 5, 6], //CONFIRMED -> RESCHEDULED, CANCELLED, CHECKEDIN
            6: [6, 11], //CHECKEDIN -> CHECKEDOUT
            5: [5], //CANCELLED
            12: [12] //No Shown
        };

        //Defaulting
        function setDefaults() {
            console.log('defaults');
            console.log($scope.currentcontext);
            console.log($scope.currentcontext.id);
            if ($scope.currentcontext.id == 0) {
                $scope.item.AppointmentTypeId = 1;
                //$scope.selectedAppointmentType = utl.Lookup.getDesc($scope.lookup.AppointmentType, $scope.item.AppointmentTypeId);

                if (utl.Session.getUserTypeId() == 2) // 2=> Physician
                {
                    $scope.item.DoctorId = utl.Session.getCurrentUserId();
                    // $scope.item.AssignedUserId = $scope.item.DoctorId;
                    // $scope.item.AssignedUserId = $scope.item.DoctorId;
                    $scope.item.DepartmentId = utl.Session.getCurrentDepartmentId();
                    $scope.currentcontext.selecteddept = [];
                    $scope.getdepartment();
                }

                $scope.item.AppointmentCategoryId = 2;
                $scope.item.PriorityId = utl.Lookup.getDefault($scope.lookup.Priority, 'Medium');
                $scope.item.AppointmentStatusId = utl.Lookup.getDefault($scope.lookup.AppointmentStatus, 'Scheduled');
                $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
            }

            //Select and auto fill patient details - this case works when passing patientid as params
            //Patient search screen - appointments link click
            if ($scope.currentcontext.pid > 0) {
                $scope.item.PatientId = $scope.currentcontext.pid;
                $scope.patientChange();
            }
        }
        $scope.getReferalCallback = function(scope, res, options, hasError) {
            var referalitem = res;
            $scope.item.ReferTypeId = referalitem.ReferralTypeId;
            $scope.item.ReferralName = referalitem.Text;
            console.log('ddddd');
        };
        $scope.referralChange = function(item) {
            // console.log(item);
            // var refObj = utl.Lookup.getObject($scope.lookup.Referral, $scope.item.ReferrerId);
            // console.log($scope.item.ReferrerId);
            // console.log(refObj);
            // $scope.item.ReferTypeId = refObj.ReferralTypeId;
            // $scope.item.ReferralName = refObj.Text;
            var options = {
                action: 'GeneralMaster/Referral/GetReferralById',
                data: {
                    Id: $scope.item.ReferrerId
                },
                type: 'post',
                onComplete: $scope.getReferalCallback
            };
            utl.Http.doAction(options);
            //$scope.item.ReferralId
        };
        /* Google Address code starts */
        $scope.autocompleteModel = {};
        $scope.disablegoogleaddopt = true;
        $scope.chkgoogleaddopt = false;
        $scope.clearpreviousaddress = function() {
            $scope.item.AddressLine1 = '';
            $scope.selectedPatient.AddressLine1 = '';
            $scope.newPatient.AddressLine1 = '';
            $scope.item.AddressLine2 = '';
            $scope.item.PinCodeId = -1;
            $scope.item.WardId = -1;
            $scope.item.CityId = -1;
            $scope.item.StateId = -1;
            $scope.item.CountryId = -1;
            $scope.item.DistrictId = -1;
        };
        // Listen to change event
        $scope.$on('gmPlacesAutocomplete::placeChanged', function() {
            var geoComponents = $scope.autocompleteModel.getPlace();
            var latitude = geoComponents.geometry.location.lat();
            var longitude = geoComponents.geometry.location.lng();
            var addressComponents = geoComponents.address_components;
            var name = geoComponents.name;
            var address1 = '';
            var address2 = '';
            var city = '';
            var area = '';
            var state = '';
            var country = '';
            var pincode = '';
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
            $scope.selectedPatient.AddressLine1 = name + ' ' + address1 + ' ' + address2 + ' ' + city;
            $scope.newPatient.AddressLine1 = name + ' ' + address1 + ' ' + address2 + ' ' + city;
            $scope.item.AddressLine2 = area + ' ' + state + ' ' + country + ' ' + pincode;
            $scope.$apply();
            if (pincode)
                $scope.getPincodeData(pincode);
        });

        // Get address from Pincode Master
        $scope.getPincodeDataCallback = function(scope, res, options, hasError) {
            if (res.Data) {
                if (res.Data.length > 0) {
                    // for (var idx in res.Data) {
                    //     $scope.item.PinCodeId = res.Data[idx].Id;
                    //     $scope.item.Ward = res.Data[idx].Area;
                    //     $scope.item.CityId = res.Data[idx].CityId;
                    //     $scope.item.StateId = res.Data[idx].StateId;
                    //     $scope.item.CountryId = res.Data[idx].CountryId;
                    //     $scope.item.DistrictId = res.Data[idx].DistrictId;
                    //     return true;
                    // }
                    $scope.item.PinCodeId = res.Data[0].Id;
                    $scope.item.Ward = res.Data[0].Area;
                    $scope.item.CityId = res.Data[0].CityId;
                    $scope.item.StateId = res.Data[0].StateId;
                    $scope.item.CountryId = res.Data[0].CountryId;
                    $scope.item.DistrictId = res.Data[0].DistrictId;
                }
            }
        };

        $scope.getPincodeData = function(pincode) {
            var inputData = {
                Params: [{
                    Key: 5,
                    Value: pincode
                }],
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
        $scope.referralTypeChangeCallback = function(scope, data, options, hasError) {
            $scope.lookup.Referral = data.Referral;
        };

        $scope.referralTypeChange = function() {
            var inputData = [{
                Key: "Referral",
                Request: {
                    Params: [{
                        Key: 3,
                        Value: $scope.item.ReferTypeId
                    }]
                }
            }];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.referralTypeChangeCallback
            };
            utl.Http.doAction(options);
        };
        $scope.enablegoogleaddopt = function() {
            $scope.disablegoogleaddopt = !$scope.chkgoogleaddopt;
            $timeout(function() {
                if (!$scope.chkgoogleaddopt) {
                    $scope.autocompleteModel = '';
                    $scope.clearpreviousaddress();
                }
                $('#googleaddopt').focus();
            }, 100);
        };
        /* Google Address code ends */
        //Patient change
        $scope.getPatientInfo = function(scope, data, options, hasError) {
            $scope.selectedPatient = data;
            $scope.newPatient = data;
            if ($scope.selectedPatient) {
                $scope.item.PatientName = '';
                if ($scope.selectedPatient.Title) {
                    $scope.item.PatientName = $scope.selectedPatient.Title.Description;
                }
                if ($scope.selectedPatient.FirstName) {
                    $scope.item.PatientName += ' ' + $scope.selectedPatient.FirstName;
                }
                if ($scope.selectedPatient.LastName) {
                    $scope.item.PatientName += ' ' + $scope.selectedPatient.LastName;
                }
                if ($scope.selectedPatient.AddressLine1) {
                    $scope.item.AddressLine1 = $scope.selectedPatient.AddressLine1;
                }
                if ($scope.selectedPatient.AddressLine2) {
                    $scope.item.AddressLine2 = $scope.selectedPatient.AddressLine2;
                }
                if ($scope.selectedPatient.Email) {
                    $scope.item.Email = $scope.selectedPatient.Email;
                }
                $scope.item.PatientMrn = $scope.selectedPatient.MRN;
            }
            if ($scope.selectedPatient.ReferTypeId) {
                $scope.item.ReferTypeId = $scope.selectedPatient.ReferTypeId;
            }

            if ($scope.selectedPatient.ReferrerId) {
                $scope.item.ReferrerId = $scope.selectedPatient.ReferrerId;
            }
            if ($scope.newPatient) {
                $scope.item.PatientName = '';
                if ($scope.newPatient.Title) {
                    $scope.item.PatientName = $scope.newPatient.Title.Description;
                }
                if ($scope.newPatient.FirstName) {
                    $scope.item.PatientName += ' ' + $scope.newPatient.FirstName;
                }
                if ($scope.newPatient.LastName) {
                    $scope.item.PatientName += ' ' + $scope.newPatient.LastName;
                }
                $scope.item.PatientMrn = $scope.newPatient.MRN;
                if ($scope.selectedPatient.AddressLine1) {
                    $scope.item.AddressLine1 = $scope.selectedPatient.AddressLine1;
                }
                if ($scope.selectedPatient.AddressLine2) {
                    $scope.item.AddressLine2 = $scope.selectedPatient.AddressLine2;
                }
                if ($scope.selectedPatient.Email) {
                    $scope.item.Email = $scope.selectedPatient.Email;
                }
            }
            $scope.currentcontext.isnewpatient = false;
            if ($scope.selectedPatient.OutStandingAmount && $scope.selectedPatient.OutStandingAmount > 0)
                utl.Alert.showErrorMsg($translate.instant('billing.consolidate.dueamount.lbl') + $filter('displaycurrency')($scope.selectedPatient.OutStandingAmount));
            $scope.loadPatientGuarantors();
            // $scope.getPatientAttachments();
            $scope.getPatientUsers();
        }
        $scope.addNew = function() {
            $state.go('app.appointmentcalendar', {
                id: 0
            });
        }

        $scope.patientChange = function() {
            if ($scope.item.PatientId > 0) {
                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: {
                        Id: $scope.item.PatientId
                    },
                    type: 'post',
                    onComplete: $scope.getPatientInfo
                };
                utl.Http.doAction(options);
            }
        }

        $scope.canShowVisitType = function() {
            var result = false;
            if ($scope.lookup && $scope.lookup.AppointmentStatus) {
                var apptStatusId = utl.Lookup.getDefault($scope.lookup.AppointmentStatus, 'Checked In');
                result = ($scope.item.AppointmentStatusId == apptStatusId);
            }
            return result;
        }

        $scope.canShowPhysicianArea = function() {
            var result = false;
            if ($scope.lookup && $scope.lookup.AppointmentType) {
                var apptTypeId = utl.Lookup.getDefault($scope.lookup.AppointmentType, 'Physician');
                result = ($scope.item.AppointmentTypeId == apptTypeId);
            }
            return result;
        }

        $scope.previousappointment = function() {
            if ($scope.item.PatientId > 0) {
                utl.Modal.open('app.previousappointment', {
                    params: {
                        pid: $scope.item.PatientId
                    },
                    confirmCallback: $scope.getList
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('appointment.appointment-form.previous-appt-nopatient-msg.lbl'));
            }
        }

        $scope.appointmentCategoryChanged = function(item) {
            if (item.Text.toLowerCase() == "new patient appointment" || item.Text.toLowerCase() == "new patient visit") {
                $scope.currentcontext.isnewpatient = true;
            } else {
                $scope.currentcontext.isnewpatient = false;
            }
        }

        $scope.isPreviousEncounterExistCallback = function(scope, res, options, hasError) {
            if (res.Data.length > 1)
                $scope.item.VisitTypeId = 2; //Set to "Follow Up"
        }

        $scope.isPreviousEncounterExist = function() {
            var inputData = {
                Params: [{
                        Key: 4,
                        Value: $scope.item.PatientId
                    },
                    {
                        Key: 5,
                        Value: $scope.item.DoctorId
                    }
                ],
                PageContext: {
                    PageSize: 10,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.isPreviousEncounterExistCallback
            };
            utl.Http.doAction(options);



        }

        $scope.isPreviousEncounterCheckinExistCallback = function(scope, res, options, hasError) {
            if (res.Data.length > 0)
                $scope.AppointmentId = res.Data[0].AppointmentId; //Set to "Follow Up"
            if ($scope.crossConsult == 0) {
                $scope.confirmcheckout();
            } else if ($scope.crossConsult == 1) {
                $scope.Encounter = $scope.item;
                $scope.Encounter.EncounterId = res.Data[0].Id;
                $scope.Encounter.updateAppointment = true;
                var actionName = 'Visit/EncounterDoctor/ManageEncounterDoctor';
                var options = {
                    action: actionName,
                    data: {
                        Data: $scope.Encounter
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doAction(options);
            }

        }

        $scope.isPreviousEncounterCheckinExist = function(rediect) {
            var inputData = {
                Params: [{
                        Key: 4,
                        Value: $scope.item.PatientId
                    },
                    {
                        Key: 52,
                        Value: true
                    },
                    {
                        Key: 14,
                        Value: 1
                    }
                ],
                PageContext: {
                    PageSize: 10,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.isPreviousEncounterCheckinExistCallback
            };
            utl.Http.doAction(options);



        }

        function isAppointmentCheckedIn() {
            var result = false;
            if ($scope.currentcontext.id > 0 && $scope.item.AppointmentStatusId == 6) {
                result = true;
            }
            return result;
        }

        $scope.canDisablePatientDiv = function() {
            return $scope.item.AppointmentStatusId == 5 ||
                isAppointmentCheckedIn();
        }
        $scope.canDisableAppointmentDiv = function() {
            return $scope.item.AppointmentStatusId == 5;
        }
        $scope.canDisableRemarksDiv = function() {
            return $scope.item.AppointmentStatusId == 5;
        }
        $scope.canDisablePatientSearch = function() {
            return $scope.item.AppointmentStatusId == 2 || $scope.item.AppointmentStatusId == 5 || isAppointmentCheckedIn();
        }
        $scope.canDisableAppointmentType = function() {
            return $scope.item.AppointmentStatusId == 5 || isAppointmentCheckedIn() || $scope.currentcontext.ct == 'ris';
        }
        $scope.canDisableAppointmentDate = function() {
            return $scope.item.AppointmentStatusId == 5 || isAppointmentCheckedIn();
        }
        $scope.canDisableCategory = function() {
            return $scope.canDisablePatientDiv() || $scope.item.PatientId > 0;
        }

        $scope.canDisableGurarantor = function() {
            return $scope.item.AppointmentStatusId == 5;
        }
        $scope.canDisableProject = function() {
            return $scope.item.AppointmentStatusId == 5;
        }
        $scope.canDisableFacility = function() {
            return $scope.item.AppointmentStatusId == 5 || isAppointmentCheckedIn();
        }
        $scope.canDisableDepartment = function() {
            return $scope.item.AppointmentStatusId == 5 || isAppointmentCheckedIn();
        }
        $scope.canDisableConsultant = function() {
            return $scope.item.AppointmentStatusId == 5 || isAppointmentCheckedIn();
        }
        $scope.canDisableResource = function() {
            return $scope.item.AppointmentStatusId == 5 || isAppointmentCheckedIn();
        }
        $scope.canDisableTime = function() {
            return $scope.item.AppointmentStatusId == 5 || isAppointmentCheckedIn();
        }

        $scope.canShowApproxAge = function() {
            return $scope.currentcontext.isnewpatient &&
                $scope.lookup && $scope.lookup.Title && $scope.newPatient.TitleId == utl.Lookup.getDefault($scope.lookup.Title, 'BABY OF');
        }

        //Visibility rules ends
        $scope.getUserProfilePicCallback = function(scope, data, options, hasError) {
            $scope.currentcontext.Photo = data;
        };

        $scope.getUserProfilePic = function() {
            if ($scope.currentcontext.PhotoPath) {
                var inputData = {
                    PhotoPath: $scope.currentcontext.PhotoPath
                };
                var options = {
                    action: 'appmanager/User/GetUserProfilePic',
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.getUserProfilePicCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.doctorChange = function() {
            //Set selected doctor department id to appointment department id
            var doctorObj = utl.Lookup.getObject($scope.lookup.Doctor, $scope.item.DoctorId);
            $scope.currentcontext.Qualification = doctorObj.Qualification;
            if (doctorObj.Title.Description) {
                $scope.item.DoctorName = doctorObj.Title.Description;
            }
            if (doctorObj.FirstName) {
                $scope.item.DoctorName += ' ' + doctorObj.FirstName;
            }
            if (doctorObj.LastName) {
                $scope.item.DoctorName += ' ' + doctorObj.LastName;
            }
            // $scope.item.DoctorName = doctorObj.UserName;
            if (doctorObj.Department)
                $scope.item.DepartmentName = doctorObj.Department.DepartmentName;
            for (var idx in $scope.lookup.Department) {
                if ($scope.lookup.Department[idx].Id == doctorObj.DepartmentId) {
                    if ($scope.currentcontext.selecteddept.indexOf($scope.lookup.Department[idx]) == -1) {
                        $scope.currentcontext.selecteddept.push($scope.lookup.Department[idx]);
                    }
                }
            }
            if ($scope.currentcontext.selecteddept.length > 0)
                $scope.item.DepartmentId = $scope.currentcontext.selecteddept[0].Id;
            // setAssignToDetails();
            $scope.getAppointmentList();
            $scope.getUserProfilePic();
        }

        $scope.getServiceInfoCallback = function(scope, data, options, hasError) {
            $scope.item.Details = [];
            $scope.ServiceInfo = data;
            if ($scope.ServiceInfo) {
                var servicedata = {
                    Id: 0,
                    ServiceId: $scope.ServiceInfo.Id,
                    PatientId: $scope.item.PatientId,
                    RequestDate: utl.Formatter.getCurrentDate(),
                    ServiceCode: $scope.ServiceInfo.ShortCode,
                    ServiceName: $scope.ServiceInfo.Name,
                    Quantity: 1,
                    ServiceCategoryId: $scope.ServiceInfo.BillingGroupId,
                    ServicePrice: options.data.ConsultAmt,
                    DiscountModeId: options.data.DiscountModeId,
                    Discount: options.data.Discount,
                    OrderTotal: options.data.ConsultAmt,
                    DoctorId: $scope.item.DoctorId,
                    VirtualOrderDetailStatusId: 1,
                }
                $scope.item.Details.push(servicedata);
            }
        };

        $scope.getServiceInfo = function(serviceInfo) {
            if (serviceInfo.ServiceItemId && serviceInfo.ServiceItemId > 0) {

                var options = {
                    action: 'clinicalmaster/ServiceItem/GetServiceItemById',
                    data: {
                        Id: serviceInfo.ServiceItemId,
                        DiscountModeId: serviceInfo.DiscountModeId,
                        Discount: serviceInfo.Discount,
                        Amount: serviceInfo.Amount,
                        DiscountAmt: serviceInfo.DiscountAmt,
                        ConsultAmt: serviceInfo.ConsultAmt,

                    },
                    type: 'post',
                    onComplete: $scope.getServiceInfoCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getDocTariffDetailsCallback = function(scope, data, options, hasError) {
            if (data.Data.length > 0) {
                var consultcharge = data.Data[0];
                //                 for (var idx in $scope.UserInfo) {
                var item = {};
                if ($scope.item.DoctorId == consultcharge.UserId) {
                    item.ServiceItemId = consultcharge.ServiceItemId;
                    item.DiscountModeId = consultcharge.DiscountModeId;
                    item.Discount = consultcharge.Discount;
                    item.Amount = consultcharge.Rate;
                    if (item.DiscountModeId == 1) {
                        item.DiscountAmt = item.Discount;
                    }
                    if (item.DiscountModeId == 2) {
                        item.DiscountAmt = ((item.Amount) * (item.Discount / 100));
                    }
                    item.ConsultAmt = (item.Amount) - (item.DiscountAmt || 0);
                    $scope.item.OrderTotal = item.ConsultAmt;
                    // $scope.getServiceDetails(consultcharge);
                }
                //                 }
                $scope.getServiceInfo(item);
            }
        }

        $scope.getDocTariffDetails = function(userData) {
            var inputData = {
                Params: [{
                        Key: 3,
                        Value: userData.FacilityId
                    },
                    {
                        Key: 2,
                        Value: userData.Id
                    },

                ],
            };
            var options = {
                action: 'SystemSettings/userdefaultservice/GetUserDefaultServices',
                data: inputData,
                type: 'post',
                onComplete: $scope.getDocTariffDetailsCallback
            };

            utl.Http.doAction(options);
        }

        $scope.getDocDataCallback = function(scope, data, options, hasError) {
            // $scope.item = data;
            $scope.getDocTariffDetails(data);
        };

        $scope.getDocData = function(pageNo) {
            if ($scope.item.DoctorId && $scope.item.DoctorId > 0) {

                var options = {
                    action: 'SystemSettings/user/GetUserById',
                    data: {
                        Id: $scope.item.DoctorId
                    },
                    type: 'post',
                    onComplete: $scope.getDocDataCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.appointmentStatusChanged = function() {
            if ($scope.item.AppointmentStatusId == 6) {
                $scope.getAppointmentList();
                $scope.item.IsDirectCheckIn = true;
            }

        }

        $scope.onDoctorSelected = function(data) {
            $scope.currentcontext.selecteddept = [];
            $scope.getdepartment();
            $scope.getDocTariffDetails(data);
            console.log(data);
        }
        $scope.getdeptCallback = function(scope, data, options, hasError) {
            $scope.item.map = data;
            var dept = [];
            for (var idx in data) {
                dept.push(data[idx])
                for (var iddx in $scope.lookup.Department) {
                    if ($scope.lookup.Department[iddx].Id == dept[idx].DepartmentId)
                        $scope.currentcontext.selecteddept.push($scope.lookup.Department[iddx]);
                }
                $scope.item.DepartmentId = $scope.currentcontext.selecteddept[0].Id;
            }
            $scope.doctorChange();
        };
        $scope.getdepartment = function(pageNo) {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.item.DoctorId
                }]
            };
            var options = {
                action: 'SystemSettings/User/GetDepartments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getdeptCallback
            };
            utl.Http.doAction(options);
        };
        $scope.getSchedulerSource = function(appointments) {
            if (!appointments) {
                appointments = [];
            }
            // prepare the data
            var source = {
                dataType: "array",
                dataFields: [{
                        name: 'id',
                        type: 'string'
                    },
                    {
                        name: 'description',
                        type: 'string'
                    },
                    {
                        name: 'location',
                        type: 'string'
                    },
                    {
                        name: 'subject',
                        type: 'string'
                    },
                    {
                        name: 'calendar',
                        type: 'string'
                    },
                    {
                        name: 'start',
                        type: 'date'
                    },
                    {
                        name: 'end',
                        type: 'date'
                    },
                    {
                        name: 'background',
                        type: 'string'
                    },
                    {
                        name: 'draggable',
                        type: 'bool'
                    },
                    {
                        name: 'resizable',
                        type: 'bool'
                    },
                    {
                        name: 'tooltip',
                        type: 'string'
                    },
                    {
                        name: 'isholiday',
                        type: 'bool'
                    },
                ],
                id: 'id',
                localData: appointments
            };
            return source;
        }

        $scope.refreshScheler = function(appts, skipViewCreation) {


            var source = $scope.getSchedulerSource(appts);

            var calendarDate = new Date();
            if ($scope.item.AppointmentDate) {
                calendarDate = utl.Formatter.getDate($scope.item.AppointmentDate);
            }
            var month = parseInt(new moment(calendarDate).format('M'));
            var day = parseInt(new moment(calendarDate).format('D'));
            var year = parseInt(new moment(calendarDate).format('YYYY'));

            $scope.settings = {
                date: new $.jqx.date(year, month, day),
                width: '98%',
                height: 530,
                disabled: isAppointmentCheckedIn(),
                source: source,
                view: 'dayView',
                showLegend: false,
                editDialog: false,
                toolbarHeight: 35,
                enableHover: true,
                columnsHeight: 30,
                rowsHeight: 27,
                touchRowsHeight: 27,
                localization: {
                    AM: null,
                    PM: null
                },
                resources: {
                    colorScheme: "scheme05",
                    dataField: "calendar",
                    source: new $.jqx.dataAdapter(source)
                },
                appointmentDataFields: {
                    from: "start",
                    to: "end",
                    id: "id",
                    description: "description",
                    location: "place",
                    subject: "subject",
                    resourceId: "calendar",
                    background: "background",
                    draggable: "draggable",
                    resizable: "resizable",
                    tooltip: "tooltip",
                    isholiday: "isholiday"
                },
                views: [{
                    type: 'dayView',
                    appointmentsRenderMode: "exactTime",
                    timeRuler: {
                        scale: $scope.currentcontext.slotType,
                        formatString: 'HH:mm'
                    }
                }]
            };

            $('#scheduler').on('appointmentClick', apptClick);
            $('#scheduler').on('dateChange', calDateChange);
            $('#scheduler').on('bindingComplete', apptBindingComplete);
        }

        function calDateChange(event) {
            var changedDate = utl.Formatter.getDate(event.args.date.toDate());
            if (utl.Formatter.getDateString($scope.item.AppointmentDate) != utl.Formatter.getDateString(changedDate)) {
                $scope.item.AppointmentDate = changedDate;
                $scope.item.StartTime = '';
                $scope.item.EndTime = '';
                $scope.getList();
            }
        }

        function apptClick(event) {
            var args = event.args;
            var appointment = args.appointment;
            if (appointment.isholiday) {
                return;
            }
            var start = appointment.from.toDate();
            var end = appointment.to.toDate();

            $scope.item.StartTime = utl.Formatter.getTimeString24Hour(start);
            $scope.item.EndTime = utl.Formatter.getTimeString24Hour(end);
            $scope.$apply();
        }

        function apptBindingComplete() {
            if ($scope.currentcontext.isScheulderInCurrentTime == false) {
                $scope.currentcontext.isScheulderInCurrentTime = true;

                var calendarDate = new Date();
                var currentHour = parseInt(new moment(calendarDate).format('HH'));

                console.log(currentHour);
                $timeout(function() {
                    $("#scheduler").jqxScheduler('scrollTop', $('#scheduler').jqxScheduler('rowsHeight') * 12 * currentHour);
                }, 1000);
            }
        }

        //Create dummy appointment to init the schedular
        $scope.createDummyAppt = function() {
            var appointments = new Array();
            var appointment1 = {
                id: "id-dummy",
                description: "Dummy appointment",
                location: "",
                subject: "Dummy appointment",
                calendar: "Room 2",
                start: new Date(2016, 10, 23, 9, 0, 0),
                end: new Date(2016, 10, 23, 16, 0, 0)
            }
            appointments.push(appointment1);
            $scope.refreshScheler(appointments, true);
        }
        $scope.createDummyAppt();
        //schedular config ends


        // get item
        $scope.filterAppoinmentStatus = function() {
            var possibleApptStatus = $scope.AppointmentStatusMap[$scope.item.AppointmentStatusId];
            $scope.lookup.AppointmentStatus = utl.Lookup.getPossibleFilters($scope.lookup.AppointmentStatus, possibleApptStatus);
            $scope.currentcontext.iscancelled = $scope.item.AppointmentStatusId == 5 ? true : false;
        }

        //Method call to overwrite appoinment data
        function overwriteCurrentItem() {
            if (modalConfig.params.apptstatusid) {
                $scope.item.AppointmentStatusId = modalConfig.params.apptstatusid;
            }

            if ($scope.item.AppointmentStatusId == 2) { //If scheduled -> set confirmed on edit
                $scope.item.AppointmentStatusId = 3;
            } else if ($scope.item.AppointmentStatusId == 3) { //If confirmed -> set checkedin on edit
                $scope.item.AppointmentStatusId = 6;
            }

            // setAssignToDetails();
        }

        $scope.CancelItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $state.go('app.appointmentstab.viewappoitment');
            // $scope.backToList();
        };

        $scope.CancelItem = function() {
            if (!$scope.item.CancelorRescheduleComments) {
                utl.Alert.showErrorMsg($translate.instant('Please write Cancel/Reschedule Comments'));
                return false;
            }
            $scope.item.AppointmentStatusId = 5;

            var options = {
                action: 'appointment/Appointment/UpdateAppointment',
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.CancelItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.CheckoutCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $state.go('app.viewappoitmentlist');
        };
        $scope.checkOut = function() {
                $scope.item.AppointmentStatusId = 11;
                console.log($scope.item);
                var options = {
                    action: 'appointment/patienttracker/CheckoutConsultationPatient',
                    data: {
                        Data: $scope.item
                    },
                    type: 'post',
                    onComplete: $scope.CheckoutCallback
                };
                utl.Http.doAction(options);
            }
            //getitem
        $scope.getItemCallback = function(scope, data, options, hasError) {
            $scope.item = data;
            console.log(data);
            if($scope.item.AppointmentDisplays && $scope.item.AppointmentDisplays.length > 0) {
                $scope.item.AppointmentDisplayId = $scope.item.AppointmentDisplays[0].Id;
            }
            if ($scope.item.AppointmentStatusId == 2) {
                if ($scope.item.IsVirtualAppointments == false) {
                    $scope.CanShowCheckin = true;
                    $scope.CanShowCancel = true;
                    $scope.CanShowUpdateBtn = true;
                    $scope.noshown = 1;
                }
                console.log($scope.currentcontext.isnewpatient);
                console.log(typeof($scope.currentcontext.isnewpatient));
                if ($scope.item.AppointmentCategoryId == 2) {
                    $scope.CanShowUpdateBtn = false;
                    $scope.disableAppointment = 1;
                    console.log($stateParams.isreschedule);
                    if (!$stateParams.isreschedule) {
                        $scope.disableSlot = 1;
                    }
                }
            }
            if ($scope.item.AppointmentStatusId == 4 || $scope.item.AppointmentStatusId == 3) {
                $scope.CanShowCheckin = true;
                $scope.CanShowCancel = true;
            }

            if (utl.Formatter.isGreaterDate($scope.item.AppointmentDate, new Date())) {
                $scope.CanShowCheckin = false;
                //console.log(utl.Formatter.isGreaterDate($scope.item.AppointmentDate, new Date()));
            }

            if ($scope.item.AppointmentStatusId == 6) {

                $scope.CanShowCheckout = true;
            }

            if ($scope.item.AppointmentStatusId == 2) { //Newly Included
                $scope.CanShowSaveBtn = true;
            }

            if ($scope.currentcontext.isreschedule == true) {
                $scope.CanShowCheckin = false;
                $scope.CanShowSaveBtn = false;
            }

            if ($scope.item.AppointmentStatusId == 6) {
                $scope.CanShowCancel = false;
            }
            if ($scope.item.OrderConsultTypeId == 2) {
                $scope.item.IsVideoConsultation = true;
            }
            $scope.currentcontext.tempApptStatusId = $scope.item.AppointmentStatusId;
            $scope.currentcontext.TempAppointmentDate = $scope.item.AppointmentDate;

            if ($scope.item.DoctorId) {
                var doctorObj = utl.Lookup.getObject($scope.lookup.Doctor, $scope.item.DoctorId);
                $scope.currentcontext.Qualification = doctorObj.Qualification;
                if (doctorObj.Title.Description) {
                    $scope.item.DoctorName = doctorObj.Title.Description;
                }
                if (doctorObj.FirstName) {
                    $scope.item.DoctorName += ' ' + doctorObj.FirstName;
                }
                if (doctorObj.LastName) {
                    $scope.item.DoctorName += ' ' + doctorObj.LastName;
                }
                // $scope.item.DoctorName = doctorObj.UserName;
                if (doctorObj.Department)
                    $scope.item.DepartmentName = doctorObj.Department.DepartmentName;
            }
            $scope.filterAppoinmentStatus();
            //             $scope.getPatientAttachments();

            $scope.patientChange();
            // $scope.onDoctorSelected();
            $scope.getPatientUsers();
            // overwriteCurrentItem();
            $scope.getDocData();
            $scope.doctorChange();


        };

        $scope.getItem = function(pageNo) {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'appointment/Appointment/GetAppointmentById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            } else if (!$scope.item.AppointmentDate) {
                $scope.item.AppointmentDate = utl.Formatter.getCurrentDate();
            } else {
                $scope.item.AppointmentTypeId = 1;
                $scope.item.AppointmentCategoryId = 2;
                $scope.CanShowSaveBtn = true;
            }
        };

        $scope.backToList = function() {
            $scope.confirmCallback($scope.item.orderscheduleId);
        }

        function UpdateAppointmentRequest(appointmentId) {
            var actionName = 'appointment/AppointmentRequest/UpdateAppointmentId';

            var inputData = {
                AppointmentRequestId: $scope.currentcontext.appointmentRequestId,
                AppointmentId: appointmentId
            }

            var options = {
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.backToList
            };
            utl.Http.doAction(options);
        }

        // Save item
        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.item.orderscheduleId = data;
            $scope.CanShowSaveBtn = false;
            // if (typeof (data) == "boolean") {
            //     if (options && options.data != null && options.data.Data != null) {
            //         $scope.currentcontext.id = options.data.Data.Id;
            //         $scope.getItem();
            //     }
            // } else if (typeof (data) == "number") {
            //     $state.go('app.appointmentstab.details', { id: data });
            // }
            // $state.go('app.viewappoitmentlist');
            $state.go('app.appointmentstab.viewappoitment');
        };

        $scope.validateForm = function() {
            var isValid = true;

            if ($scope.currentcontext.id == 0 && utl.Formatter.isPastDateTime($scope.item.AppointmentDate, $scope.item.StartTime)) {
                isValid = false;
                utl.Alert.showErrorMsg($translate.instant('appointment.appointment-form.apptdate-cant-past-msg.lbl'));
            } else if ($scope.item.Id > 0 &&
                !utl.Formatter.isDateEquals($scope.currentcontext.TempAppointmentDate, $scope.item.AppointmentDate) &&
                utl.Formatter.isPastDate($scope.item.AppointmentDate)) {
                isValid = false;
                utl.Alert.showErrorMsg($translate.instant('appointment.appointment-form.apptdate-cant-past-msg.lbl'));
            } else if (!$scope.currentcontext.isnewpatient && (!$scope.item.PatientId || $scope.item.PatientId == -1)) {
                isValid = false;
                utl.Alert.showErrorMsg($translate.instant('common.req-validation-msg.lbl'));
            } else if ((!$scope.item.AppointmentCategoryId || $scope.item.AppointmentCategoryId == -1) ||
                (!$scope.item.FacilityId || $scope.item.FacilityId == -1) ||
                (!$scope.item.DepartmentId || $scope.item.DepartmentId == -1)) {
                isValid = false;
                utl.Alert.showErrorMsg($translate.instant('common.req-validation-msg.lbl'));
            }
            if ($scope.selectedPatient && $scope.selectedPatient.MRNTypeId == 1 && $scope.item.AppointmentStatusId == 6) { //TEMP patient -> checkedin appt
                isValid = false;
                utl.Alert.showErrorMsg($translate.instant('appointment.appointment-form.temp-patient-valid-msg.lbl'));
            }
            // if ($scope.currentcontext.isnewpatient && $scope.item.AppointmentStatusId == 6) { //checkedin
            //     isValid = false;
            //     utl.Alert.showErrorMsg($translate.instant('appointment.appointment-form.temp-patient-valid-msg.lbl'));
            // }
            if ($scope.currentcontext.isnewpatient) {
                if (!$scope.newPatient.TitleId || $scope.newPatient.TitleId == -1) {
                    isValid = false;
                    utl.Alert.showErrorMsg($translate.instant('Please Select Title'));
                }
                if ($scope.newPatient.FirstName == '') {
                    isValid = false;
                    utl.Alert.showErrorMsg($translate.instant('Please Enter Name'));
                }
                if (!$scope.newPatient.GenderId || $scope.newPatient.GenderId == -1) {
                    isValid = false;
                    utl.Alert.showErrorMsg($translate.instant('Please Select Gender'));
                }
                // if (!$scope.newPatient.Age || $scope.newPatient.Age == '') {
                //     isValid = false;
                //     utl.Alert.showErrorMsg($translate.instant('Please Enter Age'));
                // }
                if ($scope.newPatient.Mobile == '') {
                    isValid = false;
                    utl.Alert.showErrorMsg($translate.instant('Please Enter Mobile No'));
                } else {
                    if ($scope.newPatient.Mobile.length < 10) {
                        isValid = false;
                        utl.Alert.showErrorMsg($translate.instant('Please Enter Valid Mobile No'));
                    }
                }
            }
            if ($scope.canShowPhysicianArea() && (!$scope.item.DoctorId || $scope.item.DoctorId == -1)) {
                isValid = false;
                utl.Alert.showErrorMsg($translate.instant('appointment.appointment-form.doctor-required-msg.lbl'));
            }
            // if ($scope.canShowVisitType() && (!$scope.item.VisitTypeId || $scope.item.VisitTypeId == -1)) {
            //     isValid = false;
            //     utl.Alert.showErrorMsg($translate.instant('appointment.appointment-form.visittype-required-msg.lbl'));
            // }


            return isValid;
        }

        $scope.checkIn = function() {
            $scope.item.AppointmentStatusId = 6;
            $scope.item.CheckinTime = utl.Formatter.getCurrentDate();
            $scope.saveItem();
        }

        $scope.reschedule = function() {
            if (!$scope.item.CancelorRescheduleComments) {
                utl.Alert.showErrorMsg($translate.instant('Please write Cancel/Reschedule Comments'));
                return false;
            }
            $scope.item.AppointmentStatusId = 4;
            $scope.item.IsRescheduled = true;
            $scope.saveItem();
        }

        $scope.Noshown = function() {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.AppointmentStatusId = 12;
            $scope.saveItem();
        }

        $scope.saveItem = function(validateDuplicateEncounter) {
            // if (!utl.Validator.validate($scope)) {
            //     return;
            // }
            if (!utl.Validator.validate($scope)) {
                $scope.showErrorMsg($translate.instant('common.validationmsg.lbl'));
                console.log(document.getElementsByClassName('ng-invalid'));
                return;
            }

            if (!$scope.validateForm()) {
                return;
            }
            if ($scope.item.IsVideoConsultation == true) {
                $scope.item.OrderConsultTypeId = 2;
            }

            //$scope.AppointmentStatusAlertMap
            if ($scope.currentcontext.tempApptStatusId != $scope.item.AppointmentStatusId) {

                $scope.currentcontext.tempApptStatusId = $scope.item.AppointmentStatusId;

                var msgKey = $scope.AppointmentStatusAlertMap[$scope.item.AppointmentStatusId];
                var confirmOptions = {
                    headingKey: 'common.confirm-modal-header.lbl',
                    messageKey: msgKey,
                    onSuccessMethod: $scope.saveItem,
                };
                utl.Dialog.confirmMessage(confirmOptions);
                return;
            }
            //return;
            //$scope.date = new Date();
            if ($scope.item.AppointmentStatusId == 6) {
                $scope.item.CheckinTime = new Date();
            }
            console.log($scope.currentcontext.isnewpatient);
            console.log($scope.item);
            if ($scope.currentcontext.isnewpatient == true) {
                $scope.item.VisitTypeId = 1;
            } else {
                $scope.item.VisitTypeId = 2;
            }
            $scope.item.AssignedUserId = $scope.item.DoctorId;
            $scope.item.AssignedUserName = $scope.item.DoctorName;
            $scope.item.ReferralId = $scope.item.ReferrerId;
            // $scope.selectedPatient.AddressLine1 = $scope.item.AddressLine1;
            // $scope.newPatient.AddressLine1 = $scope.item.AddressLine1;
            // $scope.item.Email = $scope.item.Email;
            if ($scope.currentcontext.isnewpatient) {
                savePatient();
            } else if ($scope.currentcontext.isnewpatient == false && $scope.item.AppointmentStatusId == 2 && $scope.item.AppointmentCategoryId == 2) {
                $scope.updatePatient();
            } else {

                var actionName = 'appointment/Appointment/AddAppointmentFromSession';
                if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                    actionName = 'appointment/Appointment/UpdateAppointment';
                }
                $scope.itemReferralTypeId = $scope.item.ReferTypeId;


                $scope.item.ValidateDuplicateEncounter = true;
                if (validateDuplicateEncounter == false) {
                    $scope.item.ValidateDuplicateEncounter = false;
                }

                var options = {
                    action: actionName,
                    data: {
                        Data: $scope.item
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback,
                    onError: saveItemErrorCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.saveItem1 = function(validateDuplicateEncounter) {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            // if (!utl.Validator.validate($scope)) {
            //     $scope.showErrorMsg($translate.instant('common.validationmsg.lbl'));
            //     console.log(document.getElementsByClassName('ng-invalid'));
            //     return;
            // }

            if (!$scope.validateForm()) {
                return;
            }
            if ($scope.item.IsVideoConsultation == true) {
                $scope.item.OrderConsultTypeId = 2;
            }

            //$scope.AppointmentStatusAlertMap
            if ($scope.currentcontext.tempApptStatusId != $scope.item.AppointmentStatusId) {

                $scope.currentcontext.tempApptStatusId = $scope.item.AppointmentStatusId;

                var msgKey = $scope.AppointmentStatusAlertMap[$scope.item.AppointmentStatusId];
                var confirmOptions = {
                    headingKey: 'common.confirm-modal-header.lbl',
                    messageKey: msgKey,
                    onSuccessMethod: $scope.saveItem,
                };
                utl.Dialog.confirmMessage(confirmOptions);
                return;
            }
            //return;
            //$scope.date = new Date();
            if ($scope.item.AppointmentStatusId == 6) {
                $scope.item.CheckinTime = new Date();
            }
            console.log($scope.currentcontext.isnewpatient);
            console.log($scope.item);
            $scope.item.AssignedUserId = $scope.item.DoctorId;
            $scope.item.AssignedUserName = $scope.item.DoctorName;
            $scope.item.ReferralId = $scope.item.ReferrerId;
            // $scope.selectedPatient.AddressLine1 = $scope.item.AddressLine1;
            // $scope.newPatient.AddressLine1 = $scope.item.AddressLine1;
            // $scope.item.Email = $scope.item.Email;
            // if ($scope.currentcontext.isnewpatient) {
            //     savePatient();
            // }
            // // else if ($scope.currentcontext.isnewpatient = false) {
            // //     $scope.updatePatient();
            // // }
            // else {

            var actionName = 'appointment/Appointment/AddAppointmentFromSession';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'appointment/Appointment/UpdateAppointment';
            }
            $scope.itemReferralTypeId = $scope.item.ReferTypeId;


            $scope.item.ValidateDuplicateEncounter = true;
            if (validateDuplicateEncounter == false) {
                $scope.item.ValidateDuplicateEncounter = false;
            }

            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.saveItemCallback,
                onError: saveItemErrorCallback
            };
            utl.Http.doAction(options);
            // }
        };

        function saveItemErrorCallback(data, options) {
            if (data.Error &&
                (data.Error.Code == 'OPEN_ENCOUNTER_EXIST')) {
                var confirmOptions = {
                    headingKey: 'common.confirm-modal-header.lbl',
                    // messageKey: 'appointment.appointment-form.op-encounter-exists-msg.lbl',
                    messageKey: 'appointment.appointment-form.op-encounter-exists-msg.lbl',
                    yesKey: 'New Visit',
                    noKey: 'Cross Consultation',
                    // onSuccessMethod: openEncounterAlertConfirm,
                    onSuccessMethod: $scope.isPreviousEncounterCheckinExist,
                    onDismissMethod: $scope.savecrossconsultation,
                };
                utl.Dialog.visitConfirmMessage(confirmOptions);
                //     var patientInfo = "";

                //     patientInfo += 'Mrs' + '. ';

                // patientInfo += 'Jothi';

                //     patientInfo += ' ' + 'RRRR';

                // patientInfo += ' / MRN: ' + '2df44sfsf';

                // var alertOptions = {
                //     messageKey: 'registration.fullregistration.patient-success-msg.lbl',
                //     patientInfo: patientInfo,
                //     pid: data.Id,
                //     onSuccessMethod: successMethod,
                //     onDismissMethod: dismissMethod
                // };

                // utl.Dialog.patientConfirmMessage(alertOptions);
            } else if (data.Error && data.Error.Code == 'APPOINTMENT_ALREADY_BOOKED') {
                utl.Alert.showErrorMsg('APPOINTMENT SLOT ALREADY BOOKED, CHOOSE ANOTHER SLOT');
            }
        }

        // function openEncounterAlertConfirm() {
        //     $scope.saveItem(false); //Skip duplicate encounter validation
        // }

        $scope.savecrossconsultation = function(encounter) {
            $scope.crossConsult = 1;
            $scope.isPreviousEncounterCheckinExist();
            // var ccdrid = [];
            // ccdrid.push($scope.item.DoctorId);
            // if (ccdrid.length > 0) {

            // }*/
        };


        $scope.confirmcheckout = function() {
            $scope.Checkout = {};
            $scope.Checkout.AssignTo = 4;
            $scope.Checkout.AppointmentId = $scope.AppointmentId;
            $scope.Checkout.PatientId = $scope.item.PatientId;
            var options = {
                action: 'appointment/patienttracker/CheckoutPatient',
                data: {
                    Data: $scope.Checkout
                },
                type: 'post',
                onComplete: $scope.confirmcheckoutCallback
            };
            utl.Http.doAction(options);
        }


        $scope.confirmcheckoutCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.saveItem();
            // var data = options.data ? options.data : null;
            // // if (options.data && options.data.Data) {
            // //     if (options.data.Data.AssignTo && options.data.Data.AssignTo == 4 && options.data.Data.Duration) {
            // //         openAppointmentForm(options.data.Data.FollowupAppointmentOn);
            // //     }
            // //     if (options.data.Data.AssignTo && options.data.Data.AssignTo == 3) {
            // //         $scope.doctor_dashboard();
            // //     }
            // // }

            //  $scope.confirmCallback();
        };

        function dismissMethod() {
            console.log('Cross consultation Success'); //Skip duplicate encounter validation
        }
        //Savepatient
        function savePatient() {
            var mrntype = 2;
            if ($scope.apnmntTempPats == 1) {
                var mrntype = 1;
            }
            var inputData = {
                FirstName: $scope.newPatient.FirstName,
                Mobile: $scope.newPatient.Mobile,
                Age: $scope.newPatient.Age,
                DOB: $scope.newPatient.DOB,
                GenderId: $scope.newPatient.GenderId,
                TitleId: $scope.newPatient.TitleId,
                AddressLine1: $scope.item.AddressLine1,
                Email: $scope.newPatient.Email,
                //MRNTypeId: 1,
                MRNTypeId: mrntype,
                PatientStatus: 'Active',
                RegisteredDate: utl.Formatter.getCurrentDateWithoutTime(),
                NationalityId: 238, //India
                FacilityId: utl.Session.getCurrentFacilityId(),
                ReferTypeId: $scope.item.ReferTypeId,
                ReferrerId: $scope.item.ReferrerId,
            };

            var actionName = 'registration/patient/AddPatient';
            var options = {
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: savePatientCallback
            };
            utl.Http.doAction(options);
        }

        function savePatientCallback(scope, data, options, hasError) {
            $scope.item.PatientId = data;
            $scope.currentcontext.isnewpatient = false;
            $scope.saveItem();
        }

        function updatePatientCallback(scope, data, options, hasError) {
            // utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            // $scope.backToList();
            // $scope.item.PatientId = data;
            // $scope.currentcontext.isnewpatient = false;
            $scope.saveItem1();
        }

        //Update Patient
        $scope.updatePatient = function() {
            var inputData = {
                FirstName: $scope.selectedPatient.FirstName,
                Mobile: $scope.selectedPatient.Mobile,
                Age: $scope.selectedPatient.Age,
                DOB: $scope.selectedPatient.DOB,
                GenderId: $scope.selectedPatient.GenderId,
                TitleId: $scope.selectedPatient.TitleId,
                AddressLine1: $scope.selectedPatient.AddressLine1,
                Email: $scope.selectedPatient.Email,
                Id: $scope.item.PatientId,
                MRN: $scope.item.PatientMrn,
                //MRNTypeId: 1,
                MRNTypeId: 2,
                PatientStatus: 'Active',
                RegisteredDate: utl.Formatter.getCurrentDateWithoutTime(),
                NationalityId: 238, //India
                FacilityId: utl.Session.getCurrentFacilityId()
            };

            var actionName = 'registration/patient/UpdatePatient';
            var options = {
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: updatePatientCallback
            };
            utl.Http.doAction(options);
        };

        //Add guarantors
        function onGuarantorSelected(dataFromModal) {
            $scope.item.PatientGuarantorId = dataFromModal.gid;
            $scope.loadPatientGuarantors();
        }

        $scope.addGuarantor = function() {
            utl.Modal.open('app.patientguarantorlist', {
                params: {
                    id: 0,
                    pid: $scope.item.PatientId,
                    parent: 'txn'
                },
                confirmCallback: onGuarantorSelected,
                cancelCallback: $scope.loadPatientGuarantors
            });
        }

        //Load patient guarantors
        $scope.loadPatientGuarantorsCallback = function(scope, data, options, hasError) {

            data.PatientGuarantor.sort(sort_by('Rank', false, parseInt));
            $scope.lookup.PatientGuarantor = data.PatientGuarantor;

            if (!$scope.item.PatientGuarantorId) {
                $scope.item.PatientGuarantorId = utl.Lookup.getDefault($scope.lookup.PatientGuarantor, 'SELF');
            }
        }

        $scope.loadPatientGuarantors = function() {
                //Get only active guarantors - 2
                var inputData = [{
                    Key: "PatientGuarantor",
                    Request: {
                        Params: [{
                            Key: 1,
                            Value: 2
                        }, {
                            Key: 2,
                            Value: $scope.item.PatientId
                        }]
                    }
                }];

                var options = {
                    action: 'General/Options/getoptions',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.loadPatientGuarantorsCallback
                };
                utl.Http.doAction(options);
            }
            //autosearch related code starts for Doctors
        vm.doctorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Doctor Id',
                    field: 'DoctorId',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Doctor Name',
                    field: 'DoctorName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
                {
                    header: 'Qualification',
                    field: 'Qualification',
                    datatype: 'string',
                    headercls: 'td-Qualification',
                    fieldcls: 'td-Qualification'
                },
                {
                    header: 'Speciality',
                    field: 'Speciality',
                    datatype: 'string',
                    headercls: 'td-dept',
                    fieldcls: 'td-dept'
                },
            ],
            searchparams: {},
            result: {},
            iteminfo: {},
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselecteddoctor,
            presearch: presearchdoctor,
            postsearch: postsearchdoctor
        };

        function formatselecteddoctor() {
            var selectedItem = vm.doctorcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.DoctorName].join('  ');
            } else if (vm.doctorcontrolconfig.rowdata) {
                result = [vm.doctorcontrolconfig.rowdata.DoctorId, vm.doctorcontrolconfig.rowdata.DoctorName,
                    vm.doctorcontrolconfig.rowdata.Qualification, vm.doctorcontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            return result;
        }

        function presearchdoctor() {
            var query = vm.doctorcontrolconfig.query;

            //Search only DoctorGroup
            var inputData = {
                Params: [{
                        Key: 3,
                        Value: 2
                    },
                    {
                        Key: 5,
                        Value: 2
                    },
                    {
                        Key: 2,
                        Value: utl.Session.getCurrentFacilityId()
                    },
                    {
                        Key: 31,
                        Value: true
                    }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };


            if (vm.doctorcontrolconfig.searchbyid == true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
            }

            vm.doctorcontrolconfig.searchparams = inputData;
        }

        function postsearchdoctor() {
            for (var idx in vm.doctorcontrolconfig.result) {
                var item = vm.doctorcontrolconfig.result[idx];
                item.DoctorId = item.Id;

                item.DoctorName = '';
                if (item.Title.Description)
                    item.DoctorName += item.Title.Description;
                if (item.FirstName)
                    item.DoctorName += ' ' + item.FirstName;
                if (item.LastName)
                    item.DoctorName += ' ' + item.LastName;

                item.Qualification = item.Qualification;
                item.Speciality = item.Department ? item.Department.DepartmentName : '';
            }
        }


        $scope.numberonly = function(e) {
            if ((e.charCode > 47 && e.charCode < 58) || (e.charCode == 0)) {
                return;
            } else
                e.preventDefault();
        };
        //autosearch related code ends for Doctors

        vm.referralcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Referral Code',
                    field: 'ReferralCode',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Referral Name',
                    field: 'ReferralName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
                {
                    header: 'Referral Type',
                    field: 'ReferralType',
                    datatype: 'string',
                    headercls: 'td-type',
                    fieldcls: 'td-type'
                },
                {
                    header: 'PhoneNo',
                    field: 'PhoneNo',
                    datatype: 'string',
                    headercls: 'td-phone',
                    fieldcls: 'td-phone'
                },
                {
                    header: 'Area',
                    field: 'Area',
                    datatype: 'string',
                    headercls: 'td-area',
                    fieldcls: 'td-area'
                }
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
                $scope.item.ReferralName = selectedItem.ReferralName;
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
                Params: [{
                    Key: 3,
                    Value: $scope.item.ReferTypeId
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.referralcontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: $scope.item.ReferralId
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
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


        $scope.getPatientUsersCallback = function(scope, data, options, hasError) {
            if(data.Data.length > 0) {
                var userpatId = data.Data[0].PatientId;
                var UserId = data.Data[0].Id
                if ($scope.item.PatientId == userpatId) {
                    $scope.item.PatUserId = UserId;
                }
            }

        };
        $scope.getPatientUsers = function() {
                if ($scope.item.PatientId > 0) {
                    var inputData = {
                        Params: [{
                                Key: 3,
                                Value: 8
                            },
                            {
                                Key: 5,
                                Value: 2
                            },
                            {
                                Key: 23,
                                Value: $scope.item.PatientId
                            },

                        ],
                    };
                    var options = {
                        action: 'SystemSettings/user/GetUsers',
                        data: inputData,
                        type: 'post',
                        onComplete: $scope.getPatientUsersCallback
                    };

                    utl.Http.doAction(options);
                }
            }
            //Lookup
        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            setDefaults();
            $scope.getItem();
            // $scope.getPatientUsers();
            $scope.getFacility();
            $scope.getList();
            if ($stateParams.pid) {
                console.log($stateParams);
                $scope.nopatinetsearch = 1;
                $scope.item.PatientId = $stateParams.pid;
                $scope.item.AppointmentDate = new Date($stateParams.date);
                $scope.item.PatientTrackerId = $stateParams.tid;
                $scope.item.DoctorId = $stateParams.doctor;
                // $scope.item.AppointmentCategoryId = 2;
                //$scope.patientChange();
            }
        }

        $scope.initLookup = function() {
            var inputData = [{
                    "Key": "AppointmentType",
                    Default: false
                },
                {
                    "Key": "AppointmentStatus"
                },
                {
                    "Key": "AppointmentCategory",
                    Default: false
                },
                {
                    "Key": "Facility"
                },
                {
                    "Key": "Department",
                    Request: {
                        Params: [{
                            Key: 3,
                            Value: 1
                        }]
                    }
                },
                {
                    "Key": "Resource"
                },
                // {
                //     "Key": "Referral"
                // },
                {
                    "Key": "ReferralType"
                },
                {
                    "Key": "Priority"
                },
                {
                    "Key": "Remark",
                    Request: {
                        Params: [{
                            Key: 3,
                            Value: 1
                        }, {
                            Key: 5,
                            Value: 2
                        }],

                    }
                },
                {
                    "Key": "VisitType"
                },
                {
                    "Key": "Gender"
                },
                {
                    "Key": "Title"
                },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [
                        //     {
                        //     Key: 2,
                        //     Value: utl.Session.getCurrentFacilityId()
                        // }
                        {
                            Key: 33,
                            Value: utl.Session.getCurrentFacilityId()
                        }
                    ]
                    }
                },
                {
                    "Key": "Group"
                },
                {
                    "Key": "ResearchProject"
                }
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        //refreshReferrer
        $scope.refreshReferrerCallback = function(scope, data, options, hasError) {
            $scope.lookup.Referral = data.Referral;
        }

        $scope.refreshReferrer = function() {
            var inputData = [{
                "Key": "Referral"
            }, ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.refreshReferrerCallback
            };
            utl.Http.doAction(options);
        }


        //get appointment sessions
        $scope.getAppointmentSessionsCallback = function(scope, res, options, hasError) {
            var inputData = null;
            var data = res.Data;
            if (data && data.length > 0) {
                inputData = data[0];
            }
            $scope.prepareAppointmentSessions(inputData);
        };

        $scope.getAppointmentSessions = function() {

            var inputData = {
                Params: [{
                    Key: 4,
                    Value: utl.Formatter.getFilterDate($scope.item.AppointmentDate)
                }, ],
                PageContext: {
                    PageSize: 200,
                    PageNumber: 1
                }
            };

            inputData.Params.push({
                Key: 2,
                Value: utl.Session.getCurrentFacilityId()
            });

            if ($scope.item.DoctorId || $scope.item.ResourceId) {
                if ($scope.canShowPhysicianArea()) {
                    inputData.Params.push({
                        Key: 5,
                        Value: $scope.item.DoctorId
                    });
                } else if ($scope.canShowResourceArea()) {
                    inputData.Params.push({
                        Key: 6,
                        Value: $scope.item.ResourceId
                    });
                }

                var options = {
                    action: 'appointment/AppointmentSession/GetAppointmentSessions',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getAppointmentSessionsCallback
                };

                utl.Http.doAction(options);
            }
        };

        //get list
        $scope.getListCallback = function(scope, res, options, hasError) {
            $scope.appointmentList = [];
            for (var idx in res.Data) {
                var item = res.Data[idx];
                if (item.StartTime) {
                    var appt = {};
                    var apptStart = utl.Formatter.getDateStringForAppointment(item.AppointmentDate) + " " + item.StartTime;
                    var apptEnd = utl.Formatter.getDateStringForAppointment(item.AppointmentDate) + " " + item.EndTime;
                    appt.actualdata = JSON.stringify(item);
                    appt.start = moment(apptStart).toDate();
                    appt.end = moment(apptEnd).toDate();
                    appt.DoctorId = item.DoctorId;
                    $scope.appointmentList.push(appt);
                }
            }
            $scope.getAppointmentRequestList();
            console.log('list call back');
            console.log($scope.appointmentList);
            // $scope.prepareAppointments(res.Data, options.data.Params[0].Value);
            // $scope.getAppointmentSessions();
        };

        $scope.getList = function() {

            var inputData = {
                Params: [{
                        Key: 2,
                        Value: utl.Session.getCurrentFacilityId()
                    },
                    {
                        Key: 5,
                        Value: $scope.item.DoctorId
                    },
                    {
                        Key: 6,
                        Value: $scope.item.ResourceId
                    },
                    {
                        Key: 8,
                        Value: utl.Formatter.getFilterDate($scope.item.AppointmentDate)
                    }
                    /*{ Key: 2, Value: $scope.currentfilter.FacilityId },
                    { Key: 3, Value: $scope.currentfilter.DepartmentId },
                    */
                ],
                PageContext: {
                    PageSize: 200,
                    PageNumber: 1
                }
            };


            var options = {
                action: 'appointment/Appointment/GetAppointments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        // $scope.getAppointmentRequestList = function () {
        //     if ($scope.item.DoctorId &&
        //         $scope.item.DoctorId > 0) {

        //         if (!$scope.item.AppointmentDate) return;

        //         var inputData = {
        //             Params: [{
        //                 Key: 2,
        //                 Value: $scope.item.DoctorId
        //             },
        //             {
        //                 Key: 3,
        //                 Value: utl.Formatter.getFilterDate($scope.item.AppointmentDate)
        //             },
        //             {
        //                 Key: 4,
        //                 Value: [1, 2, 3, 4, 6, 7, 8, 9, 10, 11]
        //             },
        //             ],
        //             PageContext: {
        //                 PageSize: 1000,
        //                 PageNumber: 1
        //             }
        //         };

        //         var options = {
        //             action: 'appointment/AppointmentRequest/GetAppointmentRequests',
        //             data: inputData,
        //             type: 'post',
        //             onComplete: $scope.getAppointmentReqListCallback
        //         };

        //         utl.Http.doAction(options);
        //     }
        // };

        // $scope.getAppointmentReqListCallback = function (scope, res, options, hasError) {
        //     console.log('request back');
        //     for (var idx in res.Data) {
        //         var item = res.Data[idx];
        //         if (item.AppointmentDate && item.StartTime) {
        //             var appt = {};
        //             var apptStart = utl.Formatter.getDateStringForAppointment(item.AppointmentDate) + " " + item.StartTime;
        //             //console.log(apptStart)
        //             var apptEnd = utl.Formatter.getDateStringForAppointment(item.AppointmentDate) + " " + item.EndTime;
        //             appt.actualdata = JSON.stringify(item);
        //             appt.start = moment(apptStart).toDate();
        //             appt.end = moment(apptEnd).toDate();
        //             $scope.appointmentList.push(appt);
        //         }
        //     }
        //     $scope.getAppointmentSessionsCallback();
        //     console.log($scope.appointmentList);
        // }

        // $scope.prepareAppointments = function(items) {
        //     if ($scope.appointmentList.length > 0) {
        //         $scope.appointmentList.splice(0, $scope.appointmentList.length);
        //         for (var idx in items) {
        //             var item = items[idx];
        //             var appt = {};
        //             //var apptDate = utl.Formatter.getDate(item.AppointmentDate);

        //             var apptStart = utl.Formatter.getDateStringForAppointment(item.AppointmentDate) + " " + item.StartTime;
        //             var apptEnd = utl.Formatter.getDateStringForAppointment(item.AppointmentDate) + " " + item.EndTime;

        //             var remarks = "";
        //             if (item.Remark && item.Remark.Remarks) {
        //                 remarks = item.Remark.Remarks;
        //             }

        //             appt.description = item.Patient.FirstName + "/" + item.Patient.MRN + remarks;
        //             appt.subject = item.Patient.FirstName + " " + remarks;

        //             if (item.AppointmentStatusId == 5) { //Cancelled
        //                 appt.description += " - Cancelled";
        //                 appt.subject += " - Cancelled";
        //             }
        //             appt.start = moment(apptStart).toDate();
        //             appt.end = moment(apptEnd).toDate();

        //             appt.background = item.AppointmentCategory.Color;
        //             if (item.User && item.User.FirstName) {
        //                 appt.calendar = item.User.FirstName;
        //             } else if (item.ResourceMaster && item.ResourceMaster.ResourceName) {
        //                 appt.calendar = item.ResourceMaster.ResourceName;
        //             }

        //             appt.location = "";
        //             appt.id = item.Id.toString();
        //             appt.draggable = false;
        //             appt.resizable = false;
        //             appt.tooltip = item.StartTime + ' - ' + item.EndTime + "/" + appt.description;


        //             $scope.appointmentList.push(appt);
        //         }
        //     }
        // }

        $scope.prepareAppointmentSessions = function(apptSession) {

            console.log('Here');
            if ($scope.appointmentSessionList.length > 0) {
                $scope.appointmentSessionList.splice(0, $scope.appointmentSessionList.length);
                if (apptSession) {
                    //$scope.currentcontext.slotType = $scope.slotMap[apptSession.SlotDuration] ? $scope.slotMap[apptSession.SlotDuration] : $scope.currentcontext.slotType;

                    var slots = [];
                    var isHoliday = false;
                    try {
                        var dateformat = "YYYY-MM-DD";
                        var holidayFrom = new moment(moment(apptSession.HolidayFrom).format(dateformat));
                        var holidayTo = new moment(moment(apptSession.HolidayTo).format(dateformat));
                        var apptDate = new moment(moment($scope.item.AppointmentDate).format(dateformat));
                        var issameoraft = apptDate.isSameOrAfter(holidayFrom);
                        var issameorbef = apptDate.isSameOrBefore(holidayTo);
                        if (issameoraft && issameorbef) {
                            isHoliday = true;
                        }
                    } catch (ex) {
                        console.log(ex);
                    }

                    // if (apptSession.BreakFrom && apptSession.BreakTo) {
                    //     var slots1 = getTimeSlots(getTimeDate(apptSession.StartTime), getTimeDate(apptSession.BreakFrom), apptSession.SlotDuration);
                    //     var slots2 = getTimeSlots(getTimeDate(apptSession.BreakTo), getTimeDate(apptSession.EndTime), apptSession.SlotDuration);
                    //     slots = slots1.concat(slots2);
                    // } else {
                    //     slots = getTimeSlots(getTimeDate(apptSession.StartTime), getTimeDate(apptSession.EndTime), apptSession.SlotDuration)
                    // }

                    try {
                        var dateformat = "YYYY-MM-DD";
                        var breakFrom = new moment(moment(apptSession.BreakStartDate).format(dateformat));
                        var breakTo = new moment(moment(apptSession.BreakEndDate).format(dateformat));
                        var apptDate = new moment(moment($scope.item.AppointmentDate).format(dateformat));
                        var issameoraft = apptDate.isSameOrAfter(breakFrom);
                        var issameorbef = apptDate.isSameOrBefore(breakTo);
                        console.log(issameoraft);
                        console.log(issameorbef);
                        if (issameoraft && issameorbef) {

                            // if (apptSession.BreakFrom && apptSession.BreakTo) {
                            //     var slots1 = getTimeSlots(getTimeDate(apptSession.StartTime), getTimeDate(apptSession.BreakFrom), apptSession.SlotDuration);
                            //     var slots2 = getTimeSlots(getTimeDate(apptSession.BreakTo), getTimeDate(apptSession.EndTime), apptSession.SlotDuration);
                            //     slots = slots1.concat(slots2);
                            // } else {
                            //     slots = getTimeSlots(getTimeDate(apptSession.StartTime), getTimeDate(apptSession.EndTime), apptSession.SlotDuration)
                            // }
                        } else {
                            slots = getTimeSlots(getTimeDate(apptSession.StartTime), getTimeDate(apptSession.EndTime), apptSession.SlotDuration)
                        }
                    } catch (ex) {
                        console.log(ex);
                    }

                    var dummySlotIndex = 0;
                    for (var idx in slots) {
                        var item = slots[idx];
                        var appt = {};
                        //var apptDate = utl.Formatter.getDate(item.AppointmentDate);

                        var apptStart = utl.Formatter.getDateStringForAppointment($scope.item.AppointmentDate) + " " + item.start;
                        var apptEnd = utl.Formatter.getDateStringForAppointment($scope.item.AppointmentDate) + " " + item.end;

                        appt.start = moment(apptStart).toDate();
                        appt.end = moment(apptEnd).toDate();

                        appt.description = "Slot available";
                        appt.subject = appt.description;

                        appt.background = 'gray';

                        appt.location = "";
                        appt.id = 'availslot-' + dummySlotIndex;
                        dummySlotIndex++;

                        appt.draggable = false;
                        appt.resizable = false;

                        if (isHoliday) {
                            appt.isholiday = true;
                            appt.description = "Holiday";
                            appt.subject = appt.description;
                            appt.background = 'orange';
                        }
                        appt.tooltip = item.start + ' - ' + item.end + " " + appt.description;

                        if (!isAppointmentExists(appt)) {
                            $scope.appointmentSessionList.push(appt);
                        }

                    }
                }
            }

            //Compute appointment array list
            var appointments = [];
            for (var idx in $scope.appointmentSessionList) {
                var item = $scope.appointmentSessionList[idx];
                appointments.push(item);
            }

            for (var idx1 in $scope.appointmentList) {
                var item = $scope.appointmentList[idx1];
                appointments.push(item);
            }

            $scope.refreshScheler(appointments);
        }

        function isAppointmentExists(apptSlot) {
            //console.log(apptSlot);
            //console.log($scope.appointmentList);
            var result = false;
            for (var idx in $scope.appointmentList) {
                var item = $scope.appointmentList[idx];
                if (item.DoctorId == $scope.item.DoctorId) {
                    //console.log(utl.Formatter.getDateTimeStringForAppointment(item.start) + ':' + utl.Formatter.getDateTimeStringForAppointment(apptSlot.start) + 'XXXXX' + utl.Formatter.getDateTimeStringForAppointment(item.end) + ':' + utl.Formatter.getDateTimeStringForAppointment(apptSlot.end));
                    if (utl.Formatter.getDateTimeStringForAppointment(item.start) == utl.Formatter.getDateTimeStringForAppointment(apptSlot.start) &&
                        utl.Formatter.getDateTimeStringForAppointment(item.end) == utl.Formatter.getDateTimeStringForAppointment(apptSlot.end)) {
                        result = true;
                    }
                }
            }
            return result;
        }

        function isAppointmentExists1(apptSlot) {
            console.log($scope.appointmentList);
            var result = false;
            for (var idx in $scope.appointmentList) {
                var item = $scope.appointmentList[idx];
                //console.log(item.start);
                //console.log(apptSlot.start);
                console.log(utl.Formatter.getDateTimeStringForAppointment(item.start) + ':' + utl.Formatter.getDateTimeStringForAppointment(apptSlot.start) + 'XXXXX' + utl.Formatter.getDateTimeStringForAppointment(item.end) + ':' + utl.Formatter.getDateTimeStringForAppointment(apptSlot.end));
                if (utl.Formatter.getDateTimeStringForAppointment(item.start) == utl.Formatter.getDateTimeStringForAppointment(apptSlot.start) &&
                    utl.Formatter.getDateTimeStringForAppointment(item.end) == utl.Formatter.getDateTimeStringForAppointment(apptSlot.end)) {
                    console.log(item.start);
                    console.log(apptSlot.start);
                    result = true;
                }
            }
            return result;
        }
        // Calendar related code ends


        //Appointment slot computation starts
        var settings = {
            timeSlotGap: 10, //in mins
            minTime: "09:00",
            maxTime: "13:00"
        };

        Date.prototype.addDays = function(days) {
            var dat = new Date(this.valueOf());
            dat.setDate(dat.getDate() + days);
            return dat;
        }

        function getTimeDate(time) {
            var timeParts = time.split(':');
            var d = new Date();
            d.setHours(timeParts[0]);
            d.setMinutes(timeParts[1]);
            d.setSeconds(timeParts[2] || 0);
            return d;
        }

        function prepareSlot(slotTime) {
            var hrs = slotTime.getHours();
            var mins = slotTime.getMinutes();

            var slot = "";
            slot += (hrs < 10) ? '0' + hrs : hrs;
            slot += ':'
            slot += (mins < 10) ? '0' + mins : mins;
            return slot;
        }

        function getTimeSlots(startDate, endDate, interval) {
            if (endDate < startDate) {
                endDate = endDate.addDays(1);
            }
            var slots = [];
            var intervalMillis = interval * 60 * 1000;

            while (startDate < endDate) {
                var slot = {};
                slot['start'] = prepareSlot(startDate);
                startDate.setTime(startDate.getTime() + intervalMillis);
                slot['end'] = prepareSlot(startDate);
                slots.push(slot);
            }
            return slots;
        }
        //Appointment slot computation ends

        $scope.getAppointmentList = function() {
            if ($scope.item.DoctorId &&
                $scope.item.DoctorId > 0) {

                if (!$scope.item.AppointmentDate) return;

                var inputData = {
                    Params: [{
                            Key: 2,
                            Value: $scope.item.FacilityId
                        },
                        {
                            Key: 4,
                            Value: 1
                        },
                        {
                            Key: 7,
                            Value: [1, 2, 3, 4, 6, 7, 8, 9, 10, 11]
                        },
                        {
                            Key: 8,
                            Value: utl.Formatter.getFilterDate($scope.item.AppointmentDate)
                        },
                        {
                            Key: 20,
                            Value: $scope.item.DoctorId
                        },
                    ],
                    PageContext: {
                        PageSize: 1000,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'appointment/Appointment/GetAppointments',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getAppointmentListCallback
                };

                utl.Http.doAction(options);
            }
        };

        $scope.getAppointmentListCallback = function(scope, res, options, hasError) {
            //console.log(res.Data);
            $scope.appointmentList = [];
            for (var idx in res.Data) {
                var item = res.Data[idx];
                // if(item.AppointmentDisplays && item.AppointmentDisplays.length > 0) {
                //     $scope.item.AppointmentDisplayId = item.AppointmentDisplays[0].Id;
                // }
                if (item.AppointmentDate && item.StartTime) {
                    var appt = {};
                    var apptStart = utl.Formatter.getDateStringForAppointment(item.AppointmentDate) + " " + item.StartTime;
                    var apptEnd = utl.Formatter.getDateStringForAppointment(item.AppointmentDate) + " " + item.EndTime;
                    appt.actualdata = JSON.stringify(item);
                    appt.start = moment(apptStart).toDate();
                    appt.end = moment(apptEnd).toDate();
                    appt.DoctorId = item.DoctorId;
                    $scope.appointmentList.push(appt);
                }
            }
            $scope.getAppointmentRequestList();
        }

        $scope.getAppointmentRequestList = function() {
            if ($scope.item.DoctorId &&
                $scope.item.DoctorId > 0) {

                if (!$scope.item.AppointmentDate) return;

                var inputData = {
                    Params: [{
                            Key: 2,
                            Value: $scope.item.DoctorId
                        },
                        {
                            Key: 3,
                            Value: utl.Formatter.getFilterDate($scope.item.AppointmentDate)
                        },
                        {
                            Key: 4,
                            Value: [1, 2, 3, 4, 6, 7, 8, 9, 10, 11]
                        },
                    ],
                    PageContext: {
                        PageSize: 1000,
                        PageNumber: 1
                    }
                };

                var options = {
                    action: 'appointment/AppointmentRequest/GetAppointmentRequests',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getAppointmentReqListCallback
                };

                utl.Http.doAction(options);
            }
        };
        $scope.getFacilityCallback = function(scope, res, options, hasError) {
            // $scope.facilityitem = res.Data;
            // $scope.item.IsAddressSearch = $scope.facilityitem[0].IsAddressSearch;
            // $scope.item.IsAlternateEmailMandatory = $scope.facilityitem[0].IsAlternateEmailMandatory;
            // $scope.item.IsAlternateMobileMandatory = $scope.facilityitem[0].IsAlternateMobileMandatory;
            $scope.facilityitem = res;
            $scope.item.IsAddressSearch = $scope.facilityitem.IsAddressSearch;
            $scope.item.IsAlternateEmailMandatory = $scope.facilityitem.IsAlternateEmailMandatory;
            $scope.item.IsAlternateMobileMandatory = $scope.facilityitem.IsAlternateMobileMandatory;
        };
        $scope.getFacility = function() {

            // var inputData = {
            //     Params: [{
            //         Key: 0,
            //         Value: utl.Session.getCurrentFacilityId()
            //     },],
            // };

            // var options = {
            //     action: 'SystemSettings/facility/GetFacilitys',
            //     data: inputData,
            //     type: 'post',
            //     onComplete: $scope.getFacilityCallback
            // };

            // utl.Http.doAction(options);
            var options = {
                action: 'SystemSettings/facility/GetMinFacilityById',
                data: {
                    Id: utl.Session.getCurrentFacilityId()
                },
                type: 'post',
                onComplete: $scope.getFacilityCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getAppointmentReqListCallback = function(scope, res, options, hasError) {
            for (var idx in res.Data) {
                var item = res.Data[idx];
                if (item.AppointmentDate && item.StartTime) {
                    var appt = {};
                    var apptStart = utl.Formatter.getDateStringForAppointment(item.AppointmentDate) + " " + item.StartTime;
                    var apptEnd = utl.Formatter.getDateStringForAppointment(item.AppointmentDate) + " " + item.EndTime;
                    appt.actualdata = JSON.stringify(item);
                    appt.start = moment(apptStart).toDate();
                    appt.end = moment(apptEnd).toDate();
                    appt.DoctorId = item.DoctorId;
                    $scope.appointmentList.push(appt);
                }
            }
            //if ($scope.appointmentList.length > 0)
            $scope.getDrApptSession();
        }

        $scope.getDrApptSession = function() {
            var dateformat = "YYYY-MM-DD";
            // var appDate = new moment(moment($scope.item.AppointmentDate).format(dateformat));
            var appDate = utl.Formatter.getFilterDate($scope.item.AppointmentDate);
            console.log(appDate);
            if ($scope.item.DoctorId &&
                $scope.item.DoctorId > 0) {
                var inputData = {
                    Params: [{
                            Key: 2,
                            Value: $scope.item.FacilityId
                        },
                        {
                            Key: 8,
                            Value: 2
                        },
                        {
                            Key: 4,
                            Value: appDate
                        },
                        {
                            Key: 9,
                            Value: $scope.item.DoctorId
                        },
                    ],
                    PageContext: {
                        PageSize: 1000,
                        PageNumber: 1
                    }
                };

                var options = {
                    action: 'appointment/AppointmentMultiSession/GetAppointmentMultiSessions',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getDrApptSessionCallback
                };

                utl.Http.doAction(options);
            }
        };
        $scope.timesort = function (a, b) {
            var aAvialSlot = a.AvialSlot;
            var bAvialSlot = b.AvialSlot;
            return (aAvialSlot < bAvialSlot) ? -1 : 1;
        };

        $scope.getDrApptSessionCallback = function(scope, res, options, hasError) {

            //Newly included
            // $scope.appointmentList = [];
            // for (var idx in res.Data) {
            //     var item = res.Data[idx];
            //     if (item.AppointmentDate && item.StartTime) {
            //         var appt = {};
            //         var apptStart = utl.Formatter.getDateStringForAppointment(item.AppointmentDate) + " " + item.StartTime;
            //         var apptEnd = utl.Formatter.getDateStringForAppointment(item.AppointmentDate) + " " + item.EndTime;
            //         appt.actualdata = JSON.stringify(item);
            //         appt.start = moment(apptStart).toDate();
            //         appt.end = moment(apptEnd).toDate();
            //         appt.DoctorId = item.DoctorId;
            //         $scope.appointmentList.push(appt);
            //     }
            // }
            console.log('here sess');
            var appt_day = moment($scope.item.AppointmentDate).format("dddd");
            console.log(appt_day);
            //avialslotconsole.log(res.Data);
            $scope.NewAppointmentSlot = [];
            var crntTime = utl.Formatter.getTimeString24Hour(utl.Formatter.getCurrentDate());
            for (var idx in res.Data) {
                var apptSession = res.Data[idx];
                var week_days = [];
                var isSlot = false;
                /**Dau slot available or not*/
                if (apptSession.IsSunday === false) {
                    week_days.push('Sunday');
                }
                if (apptSession.IsMonday == false) {
                    week_days.push('Monday');
                }
                if (apptSession.IsTuesday == false) {
                    week_days.push('Tuesday');
                }
                if (apptSession.IsWednesday == false) {
                    week_days.push('Wednesday');
                }
                if (apptSession.IsThursday == false) {
                    week_days.push('Thursday');
                }
                if (apptSession.IsFriday == false) {
                    week_days.push('Friday');
                }
                if (apptSession.IsSaturday == false) {
                    week_days.push('Saturday');
                }

                console.log(week_days);
                if (week_days.indexOf(appt_day) !== -1) {
                    isSlot = true;
                }

                var isHoliday = false;

                var isBreak = false;
                var Breakslots = [];
                var slots = [];
                var NewSlotItems = [];
                //var allowbooking = false;
                if (apptSession.IsAllowForceBooking === false) {
                    //allowbooking = apptSession.IsAllowForceBooking;
                    $scope.item.IsForceBooking = 0;
                } else {
                    $scope.item.IsForceBooking = 1;
                }
                try {
                    var dateformat = "YYYY-MM-DD";
                    var holidayFrom = new moment(moment(apptSession.HolidayFrom).format(dateformat));
                    var holidayTo = new moment(moment(apptSession.HolidayTo).format(dateformat));
                    var apptDate = new moment(moment($scope.item.AppointmentDate).format(dateformat));
                    var issameoraft = apptDate.isSameOrAfter(holidayFrom);
                    var issameorbef = apptDate.isSameOrBefore(holidayTo);
                    if (issameoraft && issameorbef) {
                        isHoliday = true;
                    }
                } catch (ex) {
                    console.log(ex);
                }
                var SoltName = '';
                if (apptSession.SessionType && apptSession.SessionType.Description)
                    SoltName = apptSession.SessionType.Description;
                var StartTime = apptSession.StartTime;
                var EndTime = apptSession.EndTime;

                // if (apptSession.BreakFrom && apptSession.BreakTo) {
                //     isBreak = true;
                //     Breakslots = getTimeSlots(getTimeDate(apptSession.BreakFrom), getTimeDate(apptSession.BreakTo), apptSession.SlotDuration);
                // }

                // if (apptSession.BreakFrom && apptSession.BreakTo) {
                //     var slots1 = getTimeSlots(getTimeDate(apptSession.StartTime), getTimeDate(apptSession.BreakFrom), apptSession.SlotDuration);
                //     var slots2 = getTimeSlots(getTimeDate(apptSession.BreakTo), getTimeDate(apptSession.EndTime), apptSession.SlotDuration);
                //     slots = slots1.concat(slots2);
                // } else {
                //     slots = getTimeSlots(getTimeDate(apptSession.StartTime), getTimeDate(apptSession.EndTime), apptSession.SlotDuration)
                // }
                console.log(isSlot);
                if (isSlot === false) {
                    try {
                        var dateformat = "YYYY-MM-DD";
                        var breakFrom = new moment(moment(apptSession.BreakStartDate).format(dateformat));
                        var breakTo = new moment(moment(apptSession.BreakEndDate).format(dateformat));
                        var apptDate = new moment(moment($scope.item.AppointmentDate).format(dateformat));
                        var issameoraft = apptDate.isSameOrAfter(breakFrom);
                        var issameorbef = apptDate.isSameOrBefore(breakTo);
                        console.log(issameoraft);
                        console.log(issameorbef);
                        if (issameoraft && issameorbef) {

                            if (apptSession.BreakFrom && apptSession.BreakTo) {
                                isBreak = true;
                                Breakslots = getTimeSlots(getTimeDate(apptSession.BreakFrom), getTimeDate(apptSession.BreakTo), apptSession.SlotDuration);
                            }
                            if (apptSession.BreakFrom && apptSession.BreakTo) {
                                var slots1 = getTimeSlots(getTimeDate(apptSession.StartTime), getTimeDate(apptSession.BreakFrom), apptSession.SlotDuration);
                                var slots2 = getTimeSlots(getTimeDate(apptSession.BreakTo), getTimeDate(apptSession.EndTime), apptSession.SlotDuration);
                                slots = slots1.concat(slots2);
                            } else {
                                slots = getTimeSlots(getTimeDate(apptSession.StartTime), getTimeDate(apptSession.EndTime), apptSession.SlotDuration)
                            }
                        } else {
                            // slots = getTimeSlots(getTimeDate(apptSession.StartTime), getTimeDate(apptSession.EndTime), apptSession.SlotDuration)
                            if (apptSession.BreakFrom && apptSession.BreakTo) {
                                isBreak = true;
                                Breakslots = getTimeSlots(getTimeDate(apptSession.BreakFrom), getTimeDate(apptSession.BreakTo), apptSession.SlotDuration);
                            }
                            if (apptSession.BreakFrom && apptSession.BreakTo) {
                                var slots1 = getTimeSlots(getTimeDate(apptSession.StartTime), getTimeDate(apptSession.BreakFrom), apptSession.SlotDuration);
                                var slots2 = getTimeSlots(getTimeDate(apptSession.BreakTo), getTimeDate(apptSession.EndTime), apptSession.SlotDuration);
                                slots = slots1.concat(slots2);
                            } else {
                                slots = getTimeSlots(getTimeDate(apptSession.StartTime), getTimeDate(apptSession.EndTime), apptSession.SlotDuration)
                            }
                        }
                    } catch (ex) {
                        console.log(ex);
                    }

                }
                for (var idx in slots) {
                    var avilableslots = slots[idx];
                    var appt = {};
                    var apptStart = utl.Formatter.getDateStringForAppointment($scope.item.AppointmentDate) + " " + avilableslots.start;
                    var apptEnd = utl.Formatter.getDateStringForAppointment($scope.item.AppointmentDate) + " " + avilableslots.end;
                    appt.start = moment(apptStart).toDate();
                    appt.end = moment(apptEnd).toDate();
                    //console.log( appt);
                    if (utl.Formatter.getDateStringForAppointment($scope.item.AppointmentDate) == utl.Formatter.getDateStringForAppointment(utl.Formatter.getCurrentDate())) {
                        if (avilableslots.start >= crntTime) {
                            if ($scope.item.AppointmentStatusId != 6) {
                                var isBookedAppt = isAppointmentExists(appt);
                            }
                            var isSelected = false;
                            if ($scope.item.StartTime == appt.start) {
                                isSelected = true;
                            }
                            var slotitem = {
                                SlotName: SoltName,
                                isHoliday: isHoliday,
                                isBreak: false,
                                isBookedAppt: isBookedAppt,
                                // isForceBooking: allowbooking,
                                isSelected: isSelected,
                                AvialSlot: avilableslots.start,
                                AvialEndSlot: avilableslots.end
                            };
                            NewSlotItems.push(slotitem);
                        }
                    } else if ($scope.item.AppointmentDate != utl.Formatter.getCurrentDate()) {

                        if ($scope.item.AppointmentStatusId != 6) {
                            var isBookedAppt = isAppointmentExists(appt);
                        }
                        // console.log('sssss');
                        // console.log($scope.item.StartTime);
                        // console.log(appt.start);
                        // console.log(isBookedAppt);
                        var isSelected = false;
                        if ($scope.item.StartTime == appt.start) {
                            isSelected = true;
                        }
                        var slotitem = {
                            SlotName: SoltName,
                            isHoliday: isHoliday,
                            isBreak: false,
                            // isForceBooking: allowbooking,
                            isBookedAppt: isBookedAppt,
                            isSelected: isSelected,
                            AvialSlot: avilableslots.start,
                            AvialEndSlot: avilableslots.end
                        };
                        NewSlotItems.push(slotitem);
                    }
                }
                for (var idx in Breakslots) {
                    var avilableslots = Breakslots[idx];
                    if ($scope.item.AppointmentStatusId != 6) {
                        var isBookedAppt = isAppointmentExists(avilableslots.start);
                    }
                    var isSelected = false;
                    if ($scope.item.StartTime == avilableslots.start) {
                        isSelected = true;
                    }
                    var slotitem = {
                        SlotName: SoltName,
                        isHoliday: isHoliday,
                        isBreak: true,
                        // isForceBooking: allowbooking,
                        isBookedAppt: isBookedAppt,
                        isSelected: isSelected,
                        AvialSlot: avilableslots.start,
                        AvialEndSlot: avilableslots.end
                    };
                    NewSlotItems.push(slotitem);
                }
                NewSlotItems.sort($scope.timesort);
                var AllSlotitem = {
                    SlotName: SoltName,
                    SlotItems: NewSlotItems
                }
                $scope.NewAppointmentSlot.push(AllSlotitem);
            }
            console.log($scope.NewAppointmentSlot);
        };


        $scope.SlotBooking = function(items) {
            for (var idx in $scope.NewAppointmentSlot) {
                var avialslot = $scope.NewAppointmentSlot[idx];
                for (var idx1 in avialslot) {
                    if (idx1 == "SlotItems") {
                        var allitems = avialslot["SlotItems"];
                        for (var idx2 in allitems) {
                            if (allitems[idx2].isSelected == false ||
                                allitems[idx2].isSelected == true) {
                                allitems[idx2].isSelected = false;
                            }
                        }
                    }
                }
            }
            $scope.item.SelectedSlot = '';
            items.isSelected = true;
            $scope.item.SelectedSlotName = items.SlotName;
            $scope.item.StartTime = items.AvialSlot;
            $scope.item.EndTime = items.AvialEndSlot;
            $scope.item.SelectedSlot = items.SlotName + ' - ' + items.AvialSlot + ' - ' + items.AvialEndSlot;
        }

        //New Patient related functions
        $scope.fillGenderInfo = function() {
            if ($scope.newPatient.TitleId == 10 || $scope.newPatient.TitleId == 37) { // 10-MR 37-master
                $scope.newPatient.GenderId = 1; // 1-Male
            } else if ($scope.newPatient.TitleId == 11 || $scope.newPatient.TitleId == 12 || $scope.newPatient.TitleId == 5) { //11- MRS, 12- MS, 5 - MISS
                $scope.newPatient.GenderId = 2; // 2-FeMale
            }
        };

        $scope.calculateAge = function() {
            $scope.newPatient.Age = utl.Formatter.getAgeFromDOB($scope.newPatient.DOB);
        };


        $scope.calculateDOB = function(age, substractPart) {
            var options = {
                d: $scope.newPatient.ApproxAgeDays,
                m: $scope.newPatient.ApproxAgeMonths,
                y: $scope.newPatient.Age
            };
            $scope.newPatient.DOB = utl.Formatter.getDOBFromAgeConfig(options);
            $scope.newPatient.IsBirthDateApproximate = true;
        };



        //sort by
        var sort_by = function(field, reverse, primer) {
            var key = primer ?
                function(x) {
                    return primer(x[field])
                } :
                function(x) {
                    return x[field]
                };

            reverse = !reverse ? 1 : -1;

            return function(a, b) {
                return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
            }
        }

        // ------------------------------------------------------------------
        // React bridge wiring for appointments-form.js (appointmentsFormController).
        // Six mounts share one reactProps/handleReactAction -- see the full
        // architecture note and dead-code disclosures in
        // src/react-components/AppointmentsFormScreen.tsx's file header.
        // No API call, validation, scheduling/slot-computation, or save logic
        // moves into React -- every dispatcher below calls the SAME unchanged
        // $scope function the original ng-model/ng-change pair called, then
        // snapshots the resulting state into reactProps.
        function refreshReactProps() {
            $scope.reactProps = {
                item: $scope.item,
                lookup: $scope.lookup,
                currentcontext: $scope.currentcontext,
                selectedPatient: $scope.selectedPatient,
                newPatient: $scope.newPatient,
                searchDoctorbydept: $scope.searchDoctorbydept,
                disableAppointment: $scope.disableAppointment,
                disableSlot: $scope.disableSlot,
                noshown: $scope.noshown,
                CanShowCancel: $scope.CanShowCancel,
                CanShowCheckin: $scope.CanShowCheckin,
                CanShowSaveBtn: $scope.CanShowSaveBtn,
                canDisablePatientDiv: $scope.canDisablePatientDiv(),
                canDisableAppointmentDiv: $scope.canDisableAppointmentDiv(),
                canShowVisitType: $scope.canShowVisitType(),
                canShowApproxAge: $scope.canShowApproxAge(),
                newAppointmentSlot: $scope.NewAppointmentSlot
            };
        }
        refreshReactProps();

        // Wrap the real async completion callbacks that mutate state the
        // React mounts render, so a fresh snapshot reaches them the moment
        // each real API response lands -- exactly the appointments-list.js/
        // appointment-form.js precedent (wrap-then-refresh, original callback
        // body untouched and called first).
        var origLookupCallback = $scope.lookupCallback;
        $scope.lookupCallback = function(scope, data, options, hasError) {
            origLookupCallback(scope, data, options, hasError);
            refreshReactProps();
        };
        var origGetItemCallback = $scope.getItemCallback;
        $scope.getItemCallback = function(scope, data, options, hasError) {
            origGetItemCallback(scope, data, options, hasError);
            refreshReactProps();
        };
        var origGetPatientInfo = $scope.getPatientInfo;
        $scope.getPatientInfo = function(scope, data, options, hasError) {
            origGetPatientInfo(scope, data, options, hasError);
            refreshReactProps();
        };
        var origGetDrApptSessionCallback = $scope.getDrApptSessionCallback;
        $scope.getDrApptSessionCallback = function(scope, res, options, hasError) {
            origGetDrApptSessionCallback(scope, res, options, hasError);
            refreshReactProps();
        };

        $scope.handleReactAction = function(actionName, payload) {
            switch (actionName) {
                case 'categorySelect':
                    $scope.item.AppointmentCategoryId = payload.value;
                    refreshReactProps();
                    break;
                case 'titleChange':
                    $scope.newPatient.TitleId = payload.value;
                    $scope.fillGenderInfo();
                    refreshReactProps();
                    break;
                case 'firstNameChange':
                    $scope.newPatient.FirstName = payload.value;
                    refreshReactProps();
                    break;
                case 'genderChange':
                    $scope.newPatient.GenderId = payload.value;
                    refreshReactProps();
                    break;
                case 'selectedPatientMobileChange':
                    $scope.selectedPatient.Mobile = payload.value;
                    refreshReactProps();
                    break;
                case 'newPatientMobileChange':
                    $scope.newPatient.Mobile = payload.value;
                    refreshReactProps();
                    break;
                case 'newPatientDobChange':
                    $scope.newPatient.DOB = payload.value ? new Date(payload.value) : null;
                    $scope.calculateAge();
                    refreshReactProps();
                    break;
                case 'newPatientAgeChange':
                    $scope.newPatient.Age = payload.value;
                    $scope.calculateDOB($scope.newPatient.Age, 'years');
                    refreshReactProps();
                    break;
                case 'selectedPatientEmailChange':
                    $scope.selectedPatient.Email = payload.value;
                    refreshReactProps();
                    break;
                case 'newPatientEmailChange':
                    $scope.newPatient.Email = payload.value;
                    refreshReactProps();
                    break;
                case 'selectedPatientAddressChange':
                    $scope.selectedPatient.AddressLine1 = payload.value;
                    refreshReactProps();
                    break;
                case 'newPatientAddressChange':
                    $scope.newPatient.AddressLine1 = payload.value;
                    refreshReactProps();
                    break;
                case 'approxAgeDaysChange':
                    $scope.newPatient.ApproxAgeDays = payload.value;
                    $scope.calculateDOB($scope.newPatient.ApproxAgeDays, 'days');
                    refreshReactProps();
                    break;
                case 'approxAgeMonthsChange':
                    $scope.newPatient.ApproxAgeMonths = payload.value;
                    $scope.calculateDOB($scope.newPatient.ApproxAgeMonths, 'months');
                    refreshReactProps();
                    break;
                case 'approxAgeYearsChange':
                    $scope.newPatient.Age = payload.value;
                    $scope.calculateDOB($scope.newPatient.Age, 'years');
                    refreshReactProps();
                    break;
                case 'appointmentDateChange':
                    $scope.item.AppointmentDate = payload.value ? new Date(payload.value) : null;
                    $scope.getList();
                    refreshReactProps();
                    break;
                case 'departmentChange':
                    // ng-change="" (empty) on the real select -- no side effect.
                    $scope.item.DepartmentId = payload.value;
                    refreshReactProps();
                    break;
                case 'doctorSelect':
                    $scope.item.DoctorId = payload.value;
                    $scope.onDoctorSelected(payload.selected);
                    refreshReactProps();
                    break;
                case 'priorityChange':
                    $scope.item.PriorityId = payload.value;
                    refreshReactProps();
                    break;
                case 'appointmentStatusSelect':
                    $scope.item.AppointmentStatusId = payload.value;
                    $scope.appointmentStatusChanged();
                    refreshReactProps();
                    break;
                case 'remarksChange':
                    $scope.item.Remarks = payload.value;
                    refreshReactProps();
                    break;
                case 'videoConsultToggle':
                    $scope.item.IsVideoConsultation = payload.value;
                    refreshReactProps();
                    break;
                case 'visitTypeChange':
                    $scope.item.VisitTypeId = payload.value;
                    refreshReactProps();
                    break;
                case 'referTypeChange':
                    $scope.item.ReferTypeId = payload.value;
                    $scope.referralTypeChange();
                    refreshReactProps();
                    break;
                case 'cancelRescheduleCommentsChange':
                    $scope.item.CancelorRescheduleComments = payload.value;
                    refreshReactProps();
                    break;
                case 'slotClick':
                    $scope.SlotBooking(payload.item);
                    refreshReactProps();
                    break;
                case 'cancelClick':
                    $scope.CancelItem();
                    refreshReactProps();
                    break;
                case 'noshownClick':
                    $scope.Noshown();
                    refreshReactProps();
                    break;
                case 'checkinClick':
                    $scope.checkIn();
                    refreshReactProps();
                    break;
                case 'rescheduleClick':
                    $scope.reschedule();
                    refreshReactProps();
                    break;
                case 'saveClick':
                    $scope.saveItem();
                    refreshReactProps();
                    break;
                default:
                    break;
            }
            $scope.$applyAsync();
        };

        $scope.initLookup();
    }

    appointmentsFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout', '$filter'];

})();