(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientrecordslistController', patientrecordslistController);

    function patientrecordslistController($rootScope, $timeout, $scope, $filter, $stateParams, $state, $translate, utl, Upload) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBarcodePrintCtrl({
            $scope: $scope
        }));
        // Discharge advice functionality
        $scope.contextMenus = ['emr', 'ipemr', 'pastvisits', 'pmhx', 'aeemr'];

        $scope.pagecontext = 'pastvisits';
        $scope.FacilityBlockPendingOrders = false;
        $scope.currentfilter = {
            ConditionStatusId: 1
        };
        $scope.currentcontext = {};
        $scope.item = {};
        $scope.FacilityBlockPendingOrders = utl.FacilitySetting.getFacilitySettingValue('billing', 'pendingordersblock');
        $scope.PendingOrderTestNames = '';
        $scope.ipbillflowrequired = 0;
        $scope.ipbillflowrequired =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'ipbillflowrequired');
        $scope.Items = {};
        $scope.Items.ConsultCount = '0';
        $scope.Items.PrescribeCount = '0';
        $scope.Items.OrderCount = '0';
        $scope.Items.SurgeryCount = '0';
        $scope.Items.DocumentCount = '0';
        $scope.Items.AdmitCount = '0';
        $scope.Items.AllergyCount = '0';
        $scope.Items.LabCount = '0';
        $scope.Items.RadiologyCount = '0';
        $scope.Items.EndoscopyCount = '0';
        $scope.Items.LensPrescribeCount = '0';
        $scope.DischargeBtn = false;
        $scope.currentcontext = {
            paneltype: utl.Session.get('dashboard-panel-type'),
            recordcount: utl.Session.getPatientDashboardRecordCount()
        };
        $scope.showDischargeAdvBtn = true;
        if (window.printcode.toLowerCase() == 'cauvery') {
            $scope.showDischargeAdvBtn = false;
        }

        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        //         $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        //         if ($scope.currentcontext.encounter) {
        //             $scope.currentcontext.eid = $scope.currentcontext.encounter.Id;
        //             $scope.pagecontext = $scope.currentcontext.encounter.EncounterTypeId == 1 ? 'emr' : 'ipemr';
        //             $stateParams.context = $scope.pagecontext;
        //         }
        console.log($stateParams);
        if ($stateParams.pid)
            $scope.currentcontext.pid = parseInt($stateParams.pid);
        if ($stateParams.eid)
            $scope.currentcontext.eid = parseInt($stateParams.eid);
        if ($stateParams.context)
            $scope.pagecontext = $stateParams.context;
        if ($stateParams.doctor) {
            $scope.currentcontext.DoctorId = parseInt($stateParams.doctor);
            $scope.currentcontext.doctor = parseInt($stateParams.doctor);
        }
        // $scope.currentcontext.DoctorId = parseInt($stateParams.doctor);
        $scope.getEMRDashboardCountCallBack = function (scope, res, options, hasError) {
            $scope.Items.ConsultCount = res.consultbo.ConsultCount;
            $scope.Items.PrescribeCount = res.prescribebo.PrescribeCount;
            $scope.Items.OrderCount = res.orderbo.OrderCount;
            $scope.Items.SurgeryCount = res.surgeryrequestbo.SurgeryCount;
            $scope.Items.DocumentCount = res.documentbo.DocumentCount;
            $scope.Items.AdmitCount = res.admitrequestbo.AdmitCount;
            $scope.Items.AllergyCount = res.allergybo.AllergyCount;
            $scope.Items.LabCount = res.labresultbo.LabCount;
            $scope.Items.RadiologyCount = res.radiologyresultbo.RadiologyCount;
            $scope.Items.EndoscopyCount = res.endoscopyresultbo.EndoscopyCount;
            $scope.Items.LensPrescribeCount = res.lensprescribebo.LensPrescribeCount;
            if (!$scope.Items.ConsultCount)
                $scope.Items.ConsultCount = '0';
            if (!$scope.Items.PrescribeCount)
                $scope.Items.PrescribeCount = '0';
            if (!$scope.Items.OrderCount)
                $scope.Items.OrderCount = '0';
            if (!$scope.Items.SurgeryCount)
                $scope.Items.SurgeryCount = '0';
            if (!$scope.Items.DocumentCount)
                $scope.Items.DocumentCount = '0';
            if (!$scope.Items.AdmitCount)
                $scope.Items.AdmitCount = '0';
            if (!$scope.Items.AllergyCount)
                $scope.Items.AllergyCount = '0';
            if (!$scope.Items.LabCount)
                $scope.Items.LabCount = '0';
            if (!$scope.Items.RadiologyCount)
                $scope.Items.RadiologyCount = '0';
            if (!$scope.Items.EndoscopyCount)
                $scope.Items.EndoscopyCount = '0';
            if (!$scope.Items.LensPrescribeCount)
                $scope.Items.LensPrescribeCount = '0';
        };
        $scope.getCount = function () {
            var inputData = {
                Data: {
                    Keys: [{
                            Key: 'consultbo'
                        },
                        {
                            Key: 'prescribebo'
                        },
                        {
                            Key: 'orderbo'
                        },
                        {
                            Key: 'surgeryrequestbo'
                        },
                        {
                            Key: 'documentbo'
                        },
                        {
                            Key: 'admitrequestbo'
                        },
                        {
                            Key: 'allergybo'
                        },
                        {
                            Key: 'labresultbo'
                        },
                        {
                            Key: 'radiologyresultbo'
                        },
                        {
                            Key: 'endoscopyresultbo'
                        },
                        {
                            Key: 'lensprescribebo'
                        }
                    ]
                },
                Attributes: $scope.currentcontext
            };

            var options = {
                action: 'emr/PatientEMRDashboard/GetPatientEMRDashboardOptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getEMRDashboardCountCallBack
            };
            utl.Http.doAction(options);
        };

        // Discharge advice functionality



        if (!$scope.currentcontext.pid) {
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        }
        if (!$scope.currentcontext.eid) {
            $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());
        }
        $scope.CanshowVideo = false;
        if ($stateParams.context) {
            $scope.context = $stateParams.context;
        }
        if ($stateParams.oid) {
            $scope.orderid = parseInt($stateParams.oid);
        }
        if ($stateParams.aid) {
            $scope.currentcontext.AppointmentId = parseInt($stateParams.aid);
        }
        if ($stateParams.from) {
            $scope.Fromview = $stateParams.from;
        }
        $scope.doctor_dashboard = function () {
            if ($scope.orderid) {
                $state.go('app.doctordashboard');
                // $scope.virtual_dashboard();
            } else if ($scope.Fromview == 'fromward') {
                $state.go('app.bedmanagementtab.inpatient');
            } else if ($scope.Fromview == 'nursing') {
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
        // $scope.housekeeping = function () {
        //     $state.go('app.housekeeprequest');
        // };
        // $scope.transport = function () {
        //     $state.go('app.transportrequest');
        // };
        $scope.housekeeping = function () {
            utl.Modal.open('app.housekeeprequest', {
                params: {
                    eid: $scope.currentcontext.eid,
                    pid: $scope.currentcontext.pid
                },
            });
        }
        $scope.transport = function () {
            utl.Modal.open('app.transportrequest', {
                params: {
                    eid: $scope.currentcontext.eid,
                    pid: $scope.currentcontext.pid
                },
            });
        }
        $scope.bedtransfer = function (Id) {
            utl.Modal.open('app.bedtransferform', {
                params: {
                    emr: true,
                    eid: $scope.currentcontext.eid,
                    pid: $scope.currentcontext.pid
                },
                // confirmCallback: $scope.initAllLookup
            });
        }
        // $scope.videoconference = function () {
        //     window.open("https://appr.tc/r/pkvtech");
        // };

        $scope.videoconferenceCallback = function (scope, data, options, hasError) {
            $scope.moderateJoin();
        };

        $scope.videoconference = function () {
            var inputData = {
                conferenceId: $scope.conference.Id,
            };
            var options = {
                action: 'VirtualHealthcare/VirtualConference/createRoom',
                data: inputData,
                type: 'post',
                onComplete: $scope.videoconferenceCallback
            };
            utl.Http.doAction(options);
        };

        $scope.moderateJoinCallback = function (scope, data, options, hasError) {
            $scope.ModerateData = data;
            window.open(data);
        };

        $scope.moderateJoin = function () {
            var inputData = {
                conferenceId: $scope.conference.Id,
            };
            var options = {
                action: 'VirtualHealthcare/VirtualConference/getModeratorJoinUrl',
                data: inputData,
                type: 'post',
                onComplete: $scope.moderateJoinCallback
            };
            utl.Http.doAction(options);
        };

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
                    if ($scope.selectedPatient.MiddleName)
                        $scope.item.PatientName += ' ' + $scope.selectedPatient.MiddleName;
                    if ($scope.selectedPatient.LastName)
                        $scope.item.PatientName += ' ' + $scope.selectedPatient.LastName;
                }
                $scope.item.Title = $scope.selectedPatient.Title.Description;
                $scope.item.FirstName = $scope.selectedPatient.FirstName;
                $scope.item.MiddleName = $scope.selectedPatient.MiddleName;
                $scope.item.LastName = $scope.selectedPatient.LastName;
                $scope.item.Age = $scope.selectedPatient.Age;
                $scope.item.DOB = $scope.selectedPatient.DOB;
                $scope.item.GenderId = $scope.selectedPatient.GenderId;
                if ($scope.selectedPatient.Gender) {
                    if ($scope.selectedPatient.Gender.Description) {
                        $scope.item.Gender = $scope.selectedPatient.Gender.Description;
                    }
                }
                if ($scope.selectedPatient.MaritalStatus) {
                    if ($scope.selectedPatient.MaritalStatus.Description) {
                        $scope.item.MaritalStatus = $scope.selectedPatient.MaritalStatus.Description;
                    }
                }
                $scope.item.NationalityId = $scope.selectedPatient.NationalityId;
                if ($scope.selectedPatient.Nationality) {
                    if ($scope.selectedPatient.Nationality.Description) {
                        $scope.item.Nationality = $scope.selectedPatient.Nationality.Description;
                    }
                }
                if ($scope.selectedPatient.BloodGroup) {
                    $scope.item.BloodGroup = $scope.selectedPatient.BloodGroup.Description;
                }
                if ($scope.selectedPatient.Nationality) {
                    $scope.item.Nationality = $scope.selectedPatient.Nationality.Description;
                }
                if ($scope.selectedPatient.IsVip) {
                    $scope.item.IsVip = 'VIP';
                }
                $scope.item.NationalityIdentifier = $scope.selectedPatient.NationalityIdentifier;
                $scope.item.Mobile = $scope.selectedPatient.Mobile;
                $scope.item.Email = $scope.selectedPatient.Email;
                $scope.item.MRN = $scope.selectedPatient.MRN;
                $scope.item.PhotoPath = $scope.selectedPatient.PhotoPath;
                $scope.item.AddressLine1 = $scope.selectedPatient.AddressLine1;
                $scope.item.AddressLine2 = $scope.selectedPatient.AddressLine2;
                $scope.item.City = $scope.selectedPatient.City;
                $scope.item.Country = $scope.selectedPatient.Country;
                $scope.item.State = $scope.selectedPatient.State;
                $scope.item.PasspostNumber = $scope.selectedPatient.PasspostNumber;
                $scope.item.Pincode = $scope.selectedPatient.Pincode;
                $scope.item.GuardianName = $scope.selectedPatient.GuardianName;
                $scope.item.AlternateMobileNum = $scope.selectedPatient.AlternateMobileNum;
                $scope.item.RegisteredDate = $scope.selectedPatient.RegisteredDate;
                $scope.item.IsDeathConfirmed = $scope.selectedPatient.IsDeathConfirmed;
                if ($scope.selectedPatient.CityMaster) {
                    $scope.item.City = $scope.selectedPatient.CityMaster.CityName;
                }
                if ($scope.selectedPatient.CountryMaster) {
                    $scope.item.Country = $scope.selectedPatient.CountryMaster.CountryName;
                }
                if ($scope.selectedPatient.StateMaster) {
                    $scope.item.State = $scope.selectedPatient.StateMaster.StateName;
                }
                if ($scope.selectedPatient.DistrictMaster) {
                    $scope.item.District = $scope.selectedPatient.DistrictMaster.DistrictName;
                }
                if ($scope.selectedPatient.Guarantor) {
                    if ($scope.selectedPatient.Guarantor.GuarantorName)
                        $scope.item.GuarantorName = $scope.selectedPatient.Guarantor.GuarantorName;
                }
                if ($scope.selectedPatient.Encounters && $scope.selectedPatient.Encounters.length > 0) {
                    if ($scope.context == 'emr') {
                        var encounterInfo = $filter('filter')($scope.selectedPatient.Encounters, {
                            EncounterTypeId: 1,
                            Id: $scope.currentcontext.eid
                        });
                    }
                    if ($scope.context == 'ipemr') {
                        var encounterInfo = $filter('filter')($scope.selectedPatient.Encounters, {
                            EncounterTypeId: 2,
                            Id: $scope.currentcontext.eid
                        });
                    }
                    if ($scope.context == 'aeemr') {
                        var encounterInfo = $filter('filter')($scope.selectedPatient.Encounters, {
                            EncounterTypeId: 2,
                            Id: $scope.currentcontext.eid
                        });
                    }
                    if (encounterInfo && encounterInfo.length > 0) {


                        var encounteritem = encounterInfo[0];
                        if (encounteritem.Doctor) {
                            if (encounteritem.Doctor.Title) {
                                $scope.item.DoctorName = encounteritem.Doctor.Title.Description;
                                if (encounteritem.Doctor.FirstName)
                                    $scope.item.DoctorName += ' ' + encounteritem.Doctor.FirstName;
                                if (encounteritem.Doctor.LastName)
                                    $scope.item.DoctorName += ' ' + encounteritem.Doctor.LastName;
                            }
                        }
                        $scope.item.VisitIdentifier = encounteritem.VisitIdentifier;
                        $scope.item.OtherDiagnosis = encounteritem.OtherDiagnosis;
                        $scope.item.Department = encounteritem.Department.DepartmentName;
                        if (encounteritem.VisitTypeId) {
                            $scope.item.VisitTypeId = encounteritem.VisitTypeId;

                        }
                        if (encounteritem.VisitType) {
                            if (encounteritem.VisitType.Description) {
                                $scope.item.VisitType = encounteritem.VisitType.Description;
                            }
                        }
                        if (encounteritem.RemarkId) {
                            $scope.item.RemarkId = encounteritem.RemarkId;

                        }
                        if (encounteritem.Remark) {
                            if (encounteritem.Remark.Remarks) {
                                $scope.item.Remark = encounteritem.Remark.Remarks;
                            }
                        }
                        if (encounteritem.EncounterType) {
                            if (encounteritem.EncounterType.Description) {
                                $scope.item.EncounterType = encounteritem.EncounterType.Description;
                            }
                        }
                        if (encounteritem.EncounterTypeId == 1 && encounteritem.EncounterStatusId == 1) {
                            $scope.item.EncounterStatus = 'Checked In'
                        }

                        if (encounteritem.EncounterTypeId == 1 && encounteritem.EncounterStatusId == 2) {
                            $scope.item.EncounterStatus = 'Checked Out'

                        }
                        if (encounteritem.EncounterTypeId == 2) {
                            $scope.item.AdmissionStatus = encounteritem.AdmissionStatus.Description;
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
                        $scope.item.AttenderName = encounteritem.AttenderName;
                        $scope.item.AttenderPhone = encounteritem.AttenderPhone;
                        $scope.item.DepartmentId = encounteritem.DepartmentId;
                        $scope.item.DoctorId = encounteritem.DoctorId;
                        $scope.item.TeamId = encounteritem.TeamId;
                        $scope.item.Comments = encounteritem.Comments;
                        $scope.item.EncounterId = encounteritem.EncounterId;
                        $scope.item.AdmissionDate = encounteritem.AdmissionDate;
                        $scope.item.CreatedAt = encounteritem.CreatedAt;
                        // $scope.item.RegisteredDate = encounteritem.RegisteredDate;
                        $scope.AppointmentId = encounteritem.AppointmentId;
                    }
                }
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
                action: 'registration/patient/GetPatientsInfoBanner',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientInfo
            };
            utl.Http.doAction(options);
        };

        $scope.getConferenceCallback = function (scope, data, options, hasError) {
            if (data.Data && data.Data.length > 0) {
                $scope.conference = data.Data[0];
                $scope.CanshowVideo = true;
            }
        };
        $scope.getConference = function (pageNo) {
            var inputData = {
                Params: [{
                    Key: 5,
                    Value: $scope.orderid
                }]
            }
            var options = {
                action: 'VirtualHealthcare/VirtualConference/GetVirtualConferences',
                data: inputData,
                type: 'post',
                onComplete: $scope.getConferenceCallback
            };
            utl.Http.doAction(options);
        };

        $scope.virtual_dashboard = function () {
            $state.go('app.virtualdashboard');
        };

        $scope.completecallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.doctor_dashboard();
        };

        $scope.checkoutorder = function () {
            utl.Modal.open('app.patienttracker', {
                params: {
                    pid: $scope.currentcontext.pid,
                    aid: $scope.currentcontext.AppointmentId,
                    eid: $scope.currentcontext.eid,
                    did: $scope.currentcontext.DoctorId,
                    from: 'doctordashboard'
                },
                confirmCallback: $scope.completecallback
            });
            // var confirmOptions = {
            //     headingKey: 'common.confirm-modal-header.lbl',
            //     messageKey: 'Do You Want to Complete this Order?',
            //     yesKey: 'common.yeskey.lbl',
            //     noKey: 'common.nokey.lbl',
            //     onSuccessMethod: $scope.OnCompleteConfirmed,
            // };
            // utl.Dialog.confirmMessage(confirmOptions);
        }
        $scope.discharge = function (data) {
            if (data == 6) {
                $scope.candisabledischargebtn = true;
                $scope.getEncounter();

            }
        };
        $scope.getPhysicalDischargeCallback = function (scope, data, options, hasError) {
            $scope.openModal('app.physicalpatient', {
                id: data,
                EncounterId: $scope.currentcontext.eid || 0,
                Encounter: $scope.Encounter || {},
                type: 1
            }, $scope.discharge);
        };

        $scope.patientDischarge = function () {
            var options = {
                action: 'IPManagement/PatientDischargeEvent/GetPatientDischargeEventByEncounterId',
                data: {
                    Id: $scope.currentcontext.eid
                },
                type: 'post',
                onComplete: $scope.getPhysicalDischargeCallback
            };

            utl.Http.doAction(options);
        };
        $scope.billingremarkscompletecallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getEncounter();
        };

        $scope.billingremarks = function () {
            utl.Modal.open('app.billingremarks', {
                params: {
                    pid: $scope.currentcontext.pid,
                    eid: $scope.currentcontext.eid
                },
                confirmCallback: $scope.billingremarkscompletecallback
            });
        }

        $scope.OnCompleteConfirmed = function () {
            $scope.trackdata = {
                AppointmentId: $scope.vodata.AppointmentId,
                PatientId: $scope.currentcontext.pid,
                oid: $scope.orderid,
                DoctorId: $scope.vodata.DoctorId
            }
            var actionName = 'appointment/patienttracker/CheckoutPatient';
            var options = {
                action: actionName,
                data: {
                    Data: $scope.trackdata
                },
                type: 'post',
                onComplete: $scope.completecallback
            };
            utl.Http.doAction(options);

        };
        $scope.getIPClearence = function () {
            $scope.openModal('app.emripclearenceform', {
                EncounterId: $scope.currentcontext.eid || 0,
            });
        };
        $scope.day1discharge = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do You Want to day 1 discharge?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.Onday1dischargeConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }

        $scope.Onday1dischargeConfirmed = function () {
            $scope.item = {
                Id: $scope.currentcontext.eid,
                PatientId: $scope.currentcontext.pid,
                IsDay1Discharge: 1
            }
            var actionName = 'Visit/Visit/UpdateEncounter';
            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.Onday1dischargecompletecallback
            };
            utl.Http.doAction(options);

        };
        $scope.Onday1dischargecompletecallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.patientChange();
            $scope.getEncounter();
        };

        $scope.undoday1discharge = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do You Want to Undo day 1 discharge?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.Onundoday1dischargeConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }

        $scope.Onundoday1dischargeConfirmed = function () {
            $scope.item = {
                Id: $scope.currentcontext.eid,
                PatientId: $scope.currentcontext.pid,
                IsDay1Discharge: 0
            }
            var actionName = 'Visit/Visit/UpdateEncounter';
            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.undoday1dischargecompletecallback
            };
            utl.Http.doAction(options);

        };
        $scope.undoday1dischargecompletecallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.patientChange();
            $scope.getEncounter();
        };
        /* Side Menu close*/
        $scope.RefershSplitDetails = function () {
            if ($scope.currentcontext.eid) {
                var options = {
                    action: 'billing/patientbills/PopulateInpatientBills',
                    data: {
                        Id: $scope.currentcontext.eid
                    },
                    type: 'post',
                    onComplete: $scope.RefershSplitDetailsCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getOccupancyHistoryCallBack = function (scope, res, options, hasError) {
            $scope.OccupancyHistory = res.Data[0];
        }

        $scope.getOccupancyHistory = function () {
            if ($scope.Encounter && $scope.Encounter.Id) {
                var inputData = {
                    Params: [{
                            Key: 1,
                            Value: $scope.Encounter.Id
                        },
                        {
                            Key: 2,
                            Value: 1
                        },
                        // { Key: 5, Value: true },
                    ],
                    PageContext: {
                        PageSize: 25,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'IPManagement/BedOccupancyHistory/GetBedOccupancyHistorys',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getOccupancyHistoryCallBack
                };
                utl.Http.doAction(options);
            }
        }

        //get list
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.items = $filter('sortArrayItems')(res.Data, [{
                name: 'Id',
                direction: 'desc',
                priority: 1,
                type: 'int'
            }]);
        };

        $scope.getList = function () {

            var inputData = {
                Params: [{
                        Key: 7,
                        Value: $scope.currentcontext.pid
                    },
                    {
                        Key: 9,
                        Value: $scope.currentcontext.eid
                    },
                    {
                        Key: 8,
                        Value: 2
                    }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/ProgressNote/GetProgressNotes',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getPatient = function () {
            if ($scope.currentcontext.pid > 0) {
                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: {
                        Id: $scope.currentcontext.pid
                    },
                    type: 'post',
                    onComplete: $scope.getPatientCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getPatientCallback = function (scope, data, options, hasError) {
            $scope.currentcontext.TotDueAmount = data.OutStandingAmount;
        };
        $scope.getencounterCallback = function (scope, data, options, hasError) {
            $scope.Encounter = data.Data[0];
            // $scope.pagecontext = $scope.Encounter.EncounterTypeId == 1 ? 'emr' : 'ipemr';
            if (!$scope.Encounter.IsEmergencyVisit) {
                $scope.pagecontext = $scope.Encounter.EncounterTypeId == 1 ? 'emr' : 'ipemr';
            }
            if ($scope.Encounter.IsEmergencyVisit) {
                $scope.pagecontext ='aeemr';
            }
            $stateParams.context = $scope.pagecontext;
            $scope.context = $scope.pagecontext;
            $scope.item.IsDay1Discharge = $scope.Encounter.IsDay1Discharge;
            if (data.Data.length > 0)
                $scope.canShowDischargeBtn = true;
            $scope.getOccupancyHistory();
            if ($scope.Encounter.IsBillLock == true) {
                $scope.IsBillLock = 'Billing is locked'
            }
            if ($scope.Encounter.AdmissionStatusId == 5) {
                $scope.DischargeBtn = true;
            }
            if (!$scope.currentcontext.AppointmentId) {
                $scope.currentcontext.AppointmentId = $scope.Encounter.AppointmentId;
            }

            if (!$scope.currentcontext.DoctorId) {
                if ($scope.Encounter.DoctorId) {
                    $scope.currentcontext.DoctorId = $scope.Encounter.DoctorId;
                }
            }

            $scope.getPatient();
            //     $scope.RefershSplitDetails();
        };

        $scope.getEncounter = function () {
            var inputData = {
                Params: [{
                        Key: 0,
                        Value: $scope.currentcontext.eid
                    },
                    //                     { Key: 15, Value: 2 }
                ]
            };
            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getencounterCallback
            };

            utl.Http.doAction(options);
        };

        $scope.openModal = function (appKey, stateParams) {
            utl.Modal.open(appKey, {
                params: stateParams,
                confirmCallback: $scope.getEncounter
            });
        }

        $scope.getPatientDischargeCallback = function (scope, data, options, hasError) {
            $scope.openModal('app.dischargeadvicer', {
                id: data,
                EncounterId: options.data.Id,
                Encounter: options.data.Encounter
            });
        }

        $scope.getPendingOrderList = function () {
            var inputData = {
                Params: [{
                        Key: 4,
                        Value: 1
                    },
                    {
                        Key: 18,
                        Value: $scope.currentcontext.eid
                    },
                    {
                        Key: 29,
                        Value: false
                    }, // IsDirectBill is false order
                    {
                        Key: 20,
                        Value: 2
                    }, // EncountertypeId IP
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'emr/patientorder/GetPatientOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPendingOrderListCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getPendingOrderListCallback = function (scope, res, options, hasError) {
            var pendingorderitems = res.Data;
            var pendingtestname = '';
            for (var idx in pendingorderitems) {
                var pendingorderitem = pendingorderitems[idx];
                for (var idtx in pendingorderitem.PatientOrderDetails) {
                    var pendingorderdtitem = pendingorderitem.PatientOrderDetails[idtx];
                    if (!pendingtestname) pendingtestname = pendingorderdtitem.TestName;
                    else pendingtestname += ' , ' + pendingorderdtitem.TestName;
                }
            }
            if (pendingtestname)
                $scope.PendingOrderTestNames += pendingtestname;
        };

        $scope.getPendingDispensesList = function () {
            var inputData = {
                Params: [{
                        Key: 4,
                        Value: [2, 3, 4]
                    },
                    {
                        Key: 16,
                        Value: $scope.currentcontext.eid
                    }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'IPManagement/PatientStockRequests/GetPatientStockRequests',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPendingDispensesListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getPendingDispensesListCallback = function (scope, res, options, hasError) {
            var pendingorderitems = res.Data;
            var pendingtestname = '';
            for (var idx in pendingorderitems) {
                var pendingorderitem = pendingorderitems[idx];
                for (var idtx in pendingorderitem.PatientStockRequestDetails) {
                    var pendingorderdtitem = pendingorderitem.PatientStockRequestDetails[idtx];
                    if (!pendingtestname) pendingtestname = pendingorderdtitem.ItemName;
                    else pendingtestname += ' , ' + pendingorderdtitem.ItemName;
                }
            }
            if (pendingtestname)
                $scope.PendingOrderTestNames += pendingtestname;
        };

        $scope.getPendingDispensesReturnList = function (pageNo) {
            var inputData = {
                Params: [{
                        Key: 4,
                        Value: [2, 3, 4]
                    },
                    {
                        Key: 16,
                        Value: $scope.currentcontext.eid
                    }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'IPManagement/PatientStockReturns/GetPatientStockReturns',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPendingDispensesReturnListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getPendingDispensesReturnListCallback = function (scope, res, options, hasError) {
            var pendingorderitems = res.Data;
            var pendingtestname = '';
            for (var idx in pendingorderitems) {
                var pendingorderitem = pendingorderitems[idx];
                for (var idtx in pendingorderitem.PatientStockReturnDetails) {
                    var pendingorderdtitem = pendingorderitem.PatientStockReturnDetails[idtx];
                    if (!pendingtestname) pendingtestname = pendingorderdtitem.ItemName;
                    else pendingtestname += ' , ' + pendingorderdtitem.ItemName;
                }
            }
            if (pendingtestname)
                $scope.PendingOrderTestNames += pendingtestname;
        };


        $scope.fitfordischarge = function () {
            var msg = '';
            if ($scope.PendingOrderTestNames) {
                msg = "Peinding List : " + $scope.PendingOrderTestNames;
                utl.Modal.open('app.patientpendinglisttab', {
                    params: {
                        eid: $scope.currentcontext.eid
                    },
                    confirmCallback: $scope.getEncounter
                });
                return false;
            } else {
                var options = {
                    action: 'IPManagement/PatientDischargeEvent/GetPatientDischargeEventByEncounterId',
                    data: {
                        Id: $scope.currentcontext.eid,
                        Encounter: $scope.Encounter
                    },
                    type: 'post',
                    onComplete: $scope.getPatientDischargeCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getPatientDischargeEventCallback = function (scope, data, options, hasError) {
            $scope.openModal('app.discharpatient', {
                id: data,
                EncounterId: options.data.Id,
                Encounter: options.data.Encounter
            });
        }

        $scope.clinicalDischarge = function () {
            if ($scope.ipbillflowrequired == 1) {
                if ($scope.Encounter.AdmissionStatusId == 2) {
                    utl.Alert.showErrorMsg("Patient not yet fit for discharge");
                    return;
                }
            }
            var options = {
                action: 'IPManagement/PatientDischargeEvent/GetPatientDischargeEventByEncounterId',
                data: {
                    Id: $scope.currentcontext.eid,
                    Encounter: $scope.Encounter
                },
                type: 'post',
                onComplete: $scope.getPatientDischargeEventCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getPhysicalDischargeCallback = function (scope, data, options, hasError) {
            $scope.openModal('app.physicalpatient', {
                id: data,
                EncounterId: options.data.Id,
                Encounter: options.data.Encounter
            });
        }


        $scope.getPatientAlertsCallback = function (scope, res, options, hasError) {
            $scope.alertdetails = res.Data;
        };

        // $scope.print2 = function () {
        //     var inputData = {
        //         // Id: $scope.item.Id,
        //         Id: $scope.currentcontext.eid,
        //         PatientId: $scope.currentcontext.pid,
        //         Data: true
        //     };
        //     var options = {
        //         action: 'Visit/Visit/PrintEncounter',
        //         data: inputData,
        //         type: 'post'
        //     };
        //     utl.Http.doDownload(options);
        // }
        $scope.patientidcard = function () {
            var noofprint = 1;
            try {
                if ($scope.NoofPrintPatientLabel && !isNaN($scope.NoofPrintPatientLabel))
                    noofprint = parseInt($scope.NoofPrintPatientLabel);
            } catch (ex) {
                noofprint = 1;
            }
            try {

                var vPatientName = '';
                var vMRN = '';
                var vVisitIdentifier = '';
                var vDoctorName = '';
                var vPhoneNumber = '';
                var vGender = '';
                var vAge = '';
                var vAdmissionDate = '';
                try {
                    if ($scope.item && $scope.item &&
                        $scope.item.PatientName)
                        vPatientName += ' ' + $scope.item.PatientName;
                    if ($scope.item && $scope.item &&
                        $scope.item.MRN)
                        vMRN = $scope.item.MRN;
                    if ($scope.item && $scope.item &&
                        $scope.item.VisitIdentifier)
                        vVisitIdentifier = $scope.item.VisitIdentifier;
                    if ($scope.item && $scope.item &&
                        $scope.item.DoctorName)
                        vDoctorName = $scope.item.DoctorName;
                    if ($scope.item && $scope.item &&
                        $scope.item.AdmissionDate)
                        vAdmissionDate = $scope.item.AdmissionDate;


                    if ($scope.item && $scope.item &&
                        $scope.item.Age)
                        vAge = $scope.item.Age;
                    vAge = (vAge == "") ? vAge = ((typeof $scope.item.ApproxAgeMonths != "undefined") ? $scope.item.ApproxAgeMonths + "M " : "0M ") + $scope.item.ApproxAgeDays + "D" : vAge + "Y";


                    if ($scope.item && $scope.item &&
                        $scope.item.Mobile)
                        vPhoneNumber = $scope.item.Mobile;

                    if ($scope.item && $scope.item &&
                        $scope.item.Gender)
                        vGender = $scope.item.Gender;

                    if ($scope.item && $scope.item &&
                        $scope.item.Age)
                        vAge = $scope.item.Age;

                    if ($scope.item && $scope.item &&
                        $scope.item.Pincode)
                        vPincode = $scope.item.Pincode;


                } catch (ex) {}

                var code = '';
                var printData = []
                var printCodes = {
                    new_line: '\x0A'
                };
                var code = ''; {
                    code += 'I8,A,001' + printCodes.new_line;
                    code += 'Q200,024' + printCodes.new_line;
                    code += 'q831' + printCodes.new_line;
                    code += 'rN' + printCodes.new_line;
                    code += 'S2' + printCodes.new_line;
                    code += 'D15' + printCodes.new_line;
                    code += 'ZT' + printCodes.new_line;
                    code += 'JF' + printCodes.new_line;
                    code += 'O' + printCodes.new_line;
                    code += 'R215,0' + printCodes.new_line;
                    code += 'f100' + printCodes.new_line;
                    code += 'N' + printCodes.new_line;
                    // code += 'A620,256,2,4,1,1,N,"' + 'MRN' + '"' + printCodes.new_line;
                    code += 'A530,256,2,4,1,1,N,"' + ' ' + ' ' + ' PHID :' + ' ' + vMRN + '"' + printCodes.new_line;
                    // code += 'A620,225,2,4,1,1,N,"' + 'Name' + '"' + printCodes.new_line;
                    code += 'A530,225,2,4,1,1,N,"' + ' ' + ' ' + ' IP NO :' + ' ' + vVisitIdentifier + '"' + printCodes.new_line;
                    code += 'A530,194,2,4,1,1,N,"' + ' ' + ' ' + ' Pat.Name :' + ' ' + vPatientName + '"' + printCodes.new_line;
                    // code += 'A530,163,2,4,1,1,N,"' + ' ' + ' ' + ' Age :' + ' ' + vAge + '"' + printCodes.new_line;
                    // code += 'A530,163,2,4,1,1,N,"' + ' ' + ' ' + ' Mobile :' + ' ' + vPhoneNumber + '"' + printCodes.new_line;
                    code += 'A530,163,2,4,1,1,N,"' + ' ' + ' ' + ' CONSULTANT :' + ' ' + vDoctorName + '"' + printCodes.new_line;
                    code += 'A530,133,2,4,1,1,N,"' + ' ' + ' ' + ' Gender/ Age :' + ' ' + vGender + ' / ' + vAge + ' Y ' + '"' + printCodes.new_line;
                    code += 'A530,102,2,4,1,1,N,"' + ' ' + ' ' + ' Adm.Date :' + ' ' + vAdmissionDate + '"' + printCodes.new_line;
                    code += 'B520,72,2,1,4,12,40,B,"' + ' ' + ' ' + ' ' + ' ' + vMRN + '"' + printCodes.new_line;


                    console.log(printData);
                    $scope.printRaw(printData);
                }
                code += noofprint > 1 ? 'P' + noofprint + printCodes.new_line : 'P1' + printCodes.new_line;


                printData.push(code);
                $scope.printRaw(printData);
            } catch (ex) {
                console.log(ex);
            }
        };
        $scope.wristbandprint = function () {
            var noofprint = 1;
            try {
                if ($scope.NoofPrintPatientLabel && !isNaN($scope.NoofPrintPatientLabel))
                    noofprint = parseInt($scope.NoofPrintPatientLabel);
            } catch (ex) {
                noofprint = 1;
            }
            try {

                var vTitle = '';
                var vPatientName = '';
                var vGender = '';
                var vAge = '';
                var vOpno = '';
                var vWardName = '';
                var vRoomNo = '';
                var vMobile = '';
                var vAdmissionDate = '';
                var vDTitle = '';
                var vDoctorName = '';
                var vMRN = '';
                var vWardName = '';
                var vRoomNo = '';

                try {

                    if ($scope.item && $scope.item &&
                        $scope.item.PatientName) {
                        vPatientName = $scope.item.PatientName;
                    }
                    if ($scope.item && $scope.item &&
                        $scope.item.MRN) {
                        vMRN = $scope.item.MRN;
                    }
                    if ($scope.item && $scope.item &&
                        $scope.item.Age) {
                        vAge = $scope.item.Age;
                    }
                    if ($scope.item && $scope.item &&
                        $scope.item.Gender) {
                        vGender = $scope.item.Gender;
                    }
                    if ($scope.selectedPatient) {
                        vOpno = $scope.selectedPatient.Encounters[0].VisitIdentifier;
                    }
                    if ($scope.item && $scope.item &&
                        $scope.item.Mobile) {
                        vMobile = $scope.item.Mobile;
                    }
                    if ($scope.item && $scope.item &&
                        utl.Formatter.getDateTimeString($scope.selectedPatient.Encounters[0].AdmissionDate)) {
                        vAdmissionDate = utl.Formatter.getDateTimeString($scope.selectedPatient.Encounters[0].AdmissionDate);
                    }
                    if ($scope.item && $scope.item &&
                        $scope.selectedPatient.Encounters[0].Doctor.FirstName) {
                        vDoctorName = $scope.selectedPatient.Encounters[0].Doctor.FirstName;
                    }
                    if ($scope.item && $scope.item &&
                        $scope.selectedPatient.Encounters[0].Doctor.Title.Description) {
                        vDTitle = $scope.selectedPatient.Encounters[0].Doctor.Title.Description;
                    }
                    if ($scope.item && $scope.item &&
                        $scope.selectedPatient.Encounters[0].WardMaster.WardName) {
                        vWardName = $scope.selectedPatient.Encounters[0].WardMaster.WardName
                    }
                    if ($scope.item && $scope.item &&
                        $scope.selectedPatient.Encounters[0].WardRoomBedMaster.BedNo) {
                        vRoomNo = $scope.selectedPatient.Encounters[0].WardRoomBedMaster.BedNo
                    }

                } catch (ex) { }

                var code = '';
                var printData = []
                var printCodes = {
                    new_line: '\x0A'
                };
                var code = '';
                if (window.barcodeclientcode.toLowerCase() == 'prakriya') {
                    code += 'I8,A,001' + printCodes.new_line;
                    code += 'Q200,024' + printCodes.new_line;
                    code += 'q831' + printCodes.new_line;
                    code += 'rN' + printCodes.new_line;
                    code += 'S2' + printCodes.new_line;
                    code += 'D15' + printCodes.new_line;
                    code += 'ZT' + printCodes.new_line;
                    code += 'JF' + printCodes.new_line;
                    code += 'O' + printCodes.new_line;
                    code += 'R215,0' + printCodes.new_line;
                    code += 'f100' + printCodes.new_line;
                    code += 'N' + printCodes.new_line;
                    // code += 'A620,256,2,4,1,1,N,"' + 'MRN' + '"' + printCodes.new_line;
                    code += 'A530,256,2,4,1,1,N,"' + ' ' + ' ' + ' PHID :' + ' ' + vMRN + '"' + printCodes.new_line;
                    // code += 'A620,225,2,4,1,1,N,"' + 'Name' + '"' + printCodes.new_line;
                    code += 'A530,225,2,4,1,1,N,"' + ' ' + ' ' + ' IP.NO: ' + ' ' + vOpno + '"' + printCodes.new_line;
                    code += 'A530,194,2,4,1,1,N,"' + ' ' + ' ' + '  Pat.Name : ' + ' ' + vTitle + ' ' + vPatientName + '"' + printCodes.new_line;
                    code += 'A530,163,2,4,1,1,N,"' + ' ' + ' ' + 'Gender/ Age :' + ' ' + vGender + ' / ' + vAge + ' Y ' + '"' + printCodes.new_line;

                    code += 'A530,133,2,4,1,1,N,"' + ' ' + ' ' + 'CONSULTANT :' + ' ' + vDTitle + ' ' + vDoctorName + '"' + printCodes.new_line;
                    // code += 'A530,133,2,4,1,1,N,"' + ' ' + ' ' + ' Appointment Id :' + ' ' + vWardName + '"' + printCodes.new_line;
                    code += 'A530,102,2,4,1,1,N,"' + ' ' + ' ' + ' Adm.Date :' + ' ' + vAdmissionDate + '"' + printCodes.new_line;
                    code += 'B520,72,2,1,4,12,40,B,"' + ' ' + ' ' + ' ' + ' ' + vMRN + '"' + printCodes.new_line;

                    // code += 'A530,133,2,4,1,1,N,"' + ' ' + ' ' + ' Appointment Id :' + ' ' + vRoomNo + '"' + printCodes.new_line;
                    $scope.printRaw(printData);
                } else if (window.barcodeclientcode.toLowerCase() == "equitas") {
                    code += "<xpml><page quantity='0' pitch='25 mm'></xpml>SIZE 50 mm, 25 mm" + printCodes.new_line;
                    code += "DIRECTION 0,0" + printCodes.new_line;
                    code += "REFERENCE 0,0" + printCodes.new_line;
                    code += "OFFSET 0 mm" + printCodes.new_line;
                    code += "SET PEEL OFF" + printCodes.new_line;
                    code += "SET CUTTER OFF" + printCodes.new_line;
                    code += "SET PARTIAL_CUTTER OFF" + printCodes.new_line;
                    code += "<xpml></page></xpml><xpml><page quantity='1' pitch='25 mm'></xpml>SET TEAR ON" + printCodes.new_line;
                    code += "CLS" + printCodes.new_line;
                    code += "CODEPAGE 1252" + printCodes.new_line;
                    // code += 'TEXT 383,180,"0",180,8,8,"' + 'Pat.Name : ' + vTitle + vPatientName + '"' + printCodes.new_line;
                    // code += 'TEXT 383,140,"0",180,8,8,"' + 'Gender/Age : ' + vGender + ' / ' + vAge + ' Y ' + '"' + printCodes.new_line;
                    // code += 'TEXT 383,100,"0",180,8,8,"' + 'UHID : ' + vMRN + '"' + printCodes.new_line;
                    // code += 'TEXT 383,60,"0",180,8,8,"' + 'Ward / RoomNo : ' + vWardName + vRoomNo + '"' + printCodes.new_line;
                    // code += 'TEXT 383,20,"0",180,8,8,"' + 'Consult.Dr : ' + vDTitle + vDoctorName + '"' + printCodes.new_line;
                    // code += 'TEXT 383,140,"0",180,8,8,"' + 'Pat.Name : ' + vTitle + vPatientName + '"' + printCodes.new_line;
                    // code += 'TEXT 383,100,"0",180,8,8,"' + 'Age/Gender : ' + vAge + ' Y/ ' + vGender + '"' + printCodes.new_line;
                    // code += 'TEXT 383,180,"0",180,8,8,"' + 'UHID : ' + vMRN + '"' + printCodes.new_line;
                    // code += 'TEXT 383,60,"0",180,8,8,"' + 'Ward / RoomNo : ' + vWardName + vRoomNo + '"' + printCodes.new_line;
                    // code += 'TEXT 383,20,"0",180,8,8,"' + 'Consult : ' + 'Dr.' + vDTitle + vDoctorName + '"' + printCodes.new_line;
                    // code += 'TEXT 383,140,"0",180,8,8,"' + 'Pat.Name : ' + vTitle + vPatientName + '"' + printCodes.new_line;
                    // code += 'TEXT 383,100,"0",180,8,8,"' + 'Age/Gender : ' + vAge + ' Y/ ' + vGender + '"' + printCodes.new_line;
                    // code += 'TEXT 383,180,"0",180,8,8,"' + 'UHID : ' + vMRN + '"' + printCodes.new_line;
                    // code += 'TEXT 383,60,"0",180,8,8,"' + 'Ward / RoomNo : ' + vWardName + vRoomNo + '"' + printCodes.new_line;
                    // code += 'TEXT 383,20,"0",180,8,8,"' + 'Consult : ' + 'Dr.' + vDTitle + vDoctorName + '"' + printCodes.new_line;
                    code += 'TEXT 383,150,"0",180,8,8,"' + 'Pat.Name : ' + vTitle + vPatientName + '"' + printCodes.new_line;
                    code += 'TEXT 383,120,"0",180,8,8,"' + 'Age/Gender : ' + vAge + ' Y/ ' + vGender + '"' + printCodes.new_line;
                    code += 'TEXT 383,90,"0",180,8,8,"' + 'Adm.Date : ' + vAdmissionDate + '"' + printCodes.new_line;
                    code += 'TEXT 383,180,"0",180,8,8,"' + 'UHID : ' + vMRN + '"' + printCodes.new_line;
                    code += 'TEXT 383,60,"0",180,8,8,"' + 'Ward / RoomNo : ' + vWardName + '/' + vRoomNo + '"' + printCodes.new_line;
                    code += 'TEXT 383,30,"0",180,8,8,"' + 'Consultant : ' + vDTitle + '.' + vDoctorName + '"' + printCodes.new_line;
                    code += "PRINT 1,1"
                    code += "<xpml></page></xpml><xpml><end/></xpml>"
                    $scope.printRaw(printData);
                } else if (window.barcodeclientcode.toLowerCase() == 'bch') {
                    code += 'I8,A' + printCodes.new_line;
                    code += 'q799' + printCodes.new_line;
                    code += 'O' + printCodes.new_line;
                    code += 'JF' + printCodes.new_line;
                    code += 'ZT' + printCodes.new_line;
                    code += 'Q200,25' + printCodes.new_line;
                    code += 'N' + printCodes.new_line;
                    code += 'A570,205,2,2,1,1,N,"Name"' + printCodes.new_line;
                    code += 'A570,180,2,2,1,1,N,"Age/ Sex"' + printCodes.new_line;
                    code += 'A570,155,2,2,1,1,N,"BCH ID"' + printCodes.new_line;
                    code += 'A570,130,2,2,1,1,N,"IP NO"' + printCodes.new_line;
                    code += 'A570,105,2,2,1,1,N,"Doctor"' + printCodes.new_line;
                    code += 'A570,80,2,2,1,1,N,"Adm Date"' + printCodes.new_line;
                    code += 'A510,205,2,2,1,1,N,":"' + printCodes.new_line;
                    code += 'A475,180,2,2,1,1,N,":"' + printCodes.new_line;
                    code += 'A475,155,2,2,1,1,N,":"' + printCodes.new_line;
                    code += 'A475,130,2,2,1,1,N,":"' + printCodes.new_line;
                    code += 'A475,105,2,2,1,1,N,":"' + printCodes.new_line;
                    code += 'A475,80,2,2,1,1,N,":"' + printCodes.new_line;
                    code += 'A500,205,2,2,1,1,N,"' + vTitle + '' + vPatientName + '"' + printCodes.new_line;
                    code += 'A466,180,2,2,1,1,N,"' + vMRN + '"' + printCodes.new_line;
                    code += 'A466,155,2,2,1,1,N,"' + vAge + "Y /" + vGender + '"' + printCodes.new_line;
                    code += 'A466,130,2,2,1,1,N,"' + vOpno + '"' + printCodes.new_line;
                    code += 'A466,105,2,2,1,1,N,"' + vDTitle + vDoctorName + '"' + printCodes.new_line;
                    code += 'A466,80,2,2,1,1,N,"' + vAdmissionDate + '"' + printCodes.new_line;
                    code += 'B526,35,2,1C,3,3,35,N,"' + vMRN + '"' + printCodes.new_line;
                    code += noofprint > 1 ? 'P' + noofprint + printCodes.new_line : 'P1' + printCodes.new_line;
                } else if (window.barcodeclientcode.toLowerCase() == 'eastcoasta5withheader') {
                    code += "<xpml><page quantity='0' pitch='25 mm'></xpml>SIZE 50 mm, 25 mm" + printCodes.new_line;
                    code += "DIRECTION 0,0" + printCodes.new_line;
                    code += "REFERENCE 0,0" + printCodes.new_line;
                    code += "OFFSET 0 mm" + printCodes.new_line;
                    code += "SET PEEL OFF" + printCodes.new_line;
                    code += "SET CUTTER OFF" + printCodes.new_line;
                    code += "SET PARTIAL_CUTTER OFF" + printCodes.new_line;
                    code += "<xpml></page></xpml><xpml><page quantity='1' pitch='25 mm'></xpml>SET TEAR ON" + printCodes.new_line;
                    code += "CLS" + printCodes.new_line;
                    code += "CODEPAGE 1252" + printCodes.new_line;
                    code += 'TEXT 383,170,"0",180,10,10,"' + vTitle + vPatientName + '"' + printCodes.new_line;
                    code += 'TEXT 383,130,"0",180,10,10,"' + vOpno +'('+ vAge + '/' + vGender+ ')'+ '"' + printCodes.new_line;
                    code += 'BARCODE 383,90,"93",44,0,180,2,5,"' + vMRN + '"' + printCodes.new_line;
                    code += 'TEXT 383,40,"0",180,10,10,"' + vMRN +  '"' + printCodes.new_line;
                    code += "PRINT 1,1"  + printCodes.new_line;
                    code += "<xpml></page></xpml><xpml><end/></xpml>"  + printCodes.new_line;
                    $scope.printRaw(printData);

                } else {
                    code += "<xpml><page quantity='0' pitch='25.4 mm'></xpml>SIZE 48.2 mm, 25.4 mm" + printCodes.new_line;
                    code += "DIRECTION 0,0" + printCodes.new_line;
                    code += "REFERENCE 0,0" + printCodes.new_line;
                    code += "OFFSET 0 mm" + printCodes.new_line;
                    code += "SET PEEL OFF" + printCodes.new_line;
                    code += "SET CUTTER OFF" + printCodes.new_line;
                    code += "SET PARTIAL_CUTTER OFF" + printCodes.new_line;
                    code += "<xpml></page></xpml><xpml><page quantity='1' pitch='25.4 mm'></xpml>SET TEAR ON" + printCodes.new_line;
                    code += "CLS" + printCodes.new_line;
                    code += "CODEPAGE 1252" + printCodes.new_line;
                    code += 'TEXT 383,181,"0",180,8,8,"' + 'Pat.Name : ' + vTitle + vPatientName + '"' + printCodes.new_line;
                    code += 'TEXT 383,142,"0",180,8,8,"' + 'Gender/Age : ' + vGender + ' / ' + vAge + ' Y ' + '"' + printCodes.new_line;
                    code += 'TEXT 383,98,"0",180,8,8,"' + 'IP.NO/UHID : ' + vOpno + ' / ' + vMRN + '"' + printCodes.new_line;
                    code += 'TEXT 379,59,"0",180,8,8,"' + 'Consult.DR : ' + vDTitle + vDoctorName + '"' + printCodes.new_line;
                    code += "PRINT 1,1"
                    code += "<xpml></page></xpml><xpml><end/></xpml>"
                    $scope.printRaw(printData);
                }
                code += noofprint > 1 ? 'P' + noofprint + printCodes.new_line : 'P1' + printCodes.new_line;
                printData.push(code);
                $scope.printRaw(printData);
            } catch (ex) {
                console.log(ex);
            }
        };

        // get virtual order info
        $scope.getvirtulaorderinfoCallback = function (scope, data, options, hasError) {
            $scope.vodata = data.Data[0];
            if ($scope.vodata.OrderConsultTypeId == 2) {
                $scope.CanshowVideo = true;

            }
        };

        $scope.getvirtulaorderinfo = function (pageNo) {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.orderid
                }]
            }
            var options = {
                action: 'VirtualHealthcare/VirtualOrder/GetVirtualOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getvirtulaorderinfoCallback
            };
            utl.Http.doAction(options);
        };

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = false;
        }
        if ($scope.orderid) {
            $scope.getvirtulaorderinfo();
            $scope.getConference();
        }
        $scope.patientChange();

        if ($scope.currentcontext.eid) {
            $scope.getEncounter();
        }
        if ($scope.FacilityBlockPendingOrders) {
            $scope.getPendingOrderList();
            $scope.getPendingDispensesList();
            $scope.getPendingDispensesReturnList();
        }
    }

    patientrecordslistController.$inject = ['$rootScope', '$timeout', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', 'Upload'];

})();