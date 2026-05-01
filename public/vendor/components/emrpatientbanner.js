(function () {
    'use strict';

    angular
        .module('common.utils')
        .controller('emrpatientbannerCtrl', ['utl', '$scope', '$timeout', '$filter', '$stateParams', '$state', '$translate', function (utl, $scope, $timeout, $filter, $stateParams, $state, $translate) {
            var cvm = this;
            cvm.patientinfo = {};
            cvm.agedata = {};
            cvm.currentcontext = {};
            cvm.showvipinfo = utl.FacilitySetting.getFacilitySettingValue('billing', 'showvipinfo');
            if ($scope.cvm.encounterid)
                cvm.currentcontext.encid = $scope.cvm.encounterid;
            $scope.$watch('cvm.patientid',
                function (newValue) {
                    cvm.getPatientById();
                });

            //Code to reload the banner starts
            var cmpObj = {
                refresh: function () {
                    cvm.getPatientById();
                }
            }
            $scope.currentcontext = {};
            // $scope.pagecontext = {};
            cvm.delegatefn({
                cmp: cmpObj
            });
            if ($stateParams.context) {
                $scope.context = $stateParams.context;
            }
            if ($scope.context == 'emr') {
                $stateParams.context == 'emr';
            }
            if ($scope.context == 'vorders') {
                $stateParams.context == 'vorders';
            }
            if ($scope.context == 'ipemr') {
                $stateParams.context == 'ipemr';
            }

            if ($stateParams.pid)
                $scope.currentcontext.pid = parseInt($stateParams.pid);
            if ($stateParams.eid)
                $scope.currentcontext.eid = parseInt($stateParams.eid);
            // if ($stateParams.edid)
            // 	$scope.currentcontext.edid = parseInt($stateParams.edid);
            if ($stateParams.context)
                $scope.pagecontext = $stateParams.context;
            if ($stateParams.doctor)
                $scope.currentcontext.DoctorId = parseInt($stateParams.doctor);
            if ($stateParams.oid) {
                $scope.orderid = parseInt($stateParams.oid);
            }
            if ($stateParams.aid) {
                $scope.currentcontext.AppointmentId = parseInt($stateParams.aid);
            }
            if ($stateParams.from) {
                $scope.Fromview = $stateParams.from;
            }
            if ($stateParams.context)
                $scope.currentcontext.context = $stateParams.context;
            //Code to reload the banner ends
            $scope.doctor_dashboard = function () {
                if ($scope.orderid) {
                    // $scope.virtual_dashboard();
                    $state.go('app.doctordashboard');
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
                        edid: $scope.currentcontext.DoctorId,
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
                $scope.pagecontext = $scope.Encounter.EncounterTypeId == 1 ? 'emr' : 'ipemr';
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
            cvm.getPatientByIdCallback = function (scope, data, options, hasError) {

                cvm.patientinfo.Id = data.Id;
                cvm.patientinfo.MRN = data.MRN;
                cvm.patientinfo.Title = data.Title ? data.Title.Description : null;
                cvm.patientinfo.FirstName = data.FirstName;
                cvm.patientinfo.MiddleName = data.MiddleName;
                cvm.patientinfo.LastName = data.LastName;
                if (cvm.showvipinfo == 1) {
                    if (data.IsVip) {
                        if (data.IsVip == true) {
                            cvm.patientinfo.VIP = "VIP";
                        } else {
                            cvm.patientinfo.VIP = "";
                        }
                    }
                    if (data.VipType) {
                        cvm.VipType = data.VipType.Description;
                    }

                    cvm.patientinfo.IsVip = data.IsVip;
                }
                cvm.patientinfo.Age = data.Age;
                cvm.patientinfo.DOB = data.DOB;
                cvm.patientinfo.FamilyUniqueId = data.FamilyUniqueId;
                cvm.patientinfo.Mobile = data.Mobile;
                cvm.patientinfo.FacilityId = data.FacilityId;
                cvm.patientinfo.FacilityName = data.Facility.FacilityName;
                cvm.patientinfo.Insurance = data.Guarantor ? data.Guarantor.GuarantorName : null;
                cvm.patientinfo.Gender = data.Gender ? data.Gender.Description : null;
                cvm.patientinfo.PatientName = '';
                cvm.EncounterData = data.Encounters ? data.Encounters[0] : {};
                if (cvm.patientinfo.Title) {
                    cvm.patientinfo.PatientName = cvm.patientinfo.Title + ' ';
                }
                cvm.patientinfo.PatientName = cvm.patientinfo.PatientName + cvm.patientinfo.FirstName;
                if (cvm.patientinfo.LastName) {
                    cvm.patientinfo.PatientName = cvm.patientinfo.PatientName + ' ' + cvm.patientinfo.LastName;
                }
                var ageObj = utl.Formatter.getDetailedAgeFromDOB(cvm.patientinfo.DOB);
                cvm.patientinfo.ApproxAgeDays = ageObj.d;
                cvm.patientinfo.ApproxAgeMonths = ageObj.m || 0;
                cvm.patientinfo.Age = ageObj.y;
                if (cvm.patientinfo.Age == null) {
                    cvm.patientinfo.Age = 0;
                }
                if (cvm.patientinfo.Age == 0 || !cvm.patientinfo.Age) {
                    cvm.agedata.Age = cvm.patientinfo.ApproxAgeDays + ' ' +
                        'D' + '/' + cvm.patientinfo.ApproxAgeMonths + 'M';
                } else {
                    cvm.agedata.Age = cvm.patientinfo.Age;
                }

                // if (data.Age && data.Age != null) {
                // 	cvm.patientinfo.Age = (data.Age > 1) ? data.Age + " Years" : data.Age + " Year";
                // }
                if (data.Encounters && data.Encounters.length > 0) {
                    cvm.Encounter = $filter('filter')(data.Encounters, {
                        EncounterTypeId: 1,
                        // Id: cvm.currentcontext.encid
                        Id: $scope.currentcontext.eid
                    })[0];
                    // cvm.Encounter = data.Encounters[0];
                    cvm.remarkid = cvm.Encounter.RemarkId;
                    if (cvm.Encounter.Remark) {
                        cvm.remark = cvm.Encounter.Remark.Remarks;
                    }
                    if (cvm.Encounter.EncounterTypeId) {
                        cvm.EncounterTypeId = cvm.Encounter.EncounterTypeId;
                    }
                    cvm.IsDay1Discharge = cvm.Encounter.IsDay1Discharge;
                    if (cvm.Encounter.AdmissionStatusId) {
                        cvm.AdmissionStatusId = cvm.Encounter.AdmissionStatusId;
                    }
                    if (cvm.Encounter.Doctor) {
                        cvm.drfname = cvm.Encounter.Doctor.FirstName;
                    }
                    if (cvm.Encounter.Doctor) {
                        cvm.drlname = cvm.Encounter.Doctor.LastName;
                    }
                    if (cvm.Encounter.Doctor) {
                        cvm.drtitlename = cvm.Encounter.Doctor.Title.Description;
                    }
                    if (cvm.Encounter.AdmissionStatus) {
                        cvm.admissionstatus = cvm.Encounter.AdmissionStatus.Description;
                    }
                    if (cvm.Encounter.AdmissionStatusId == 5) {
                        cvm.DischargeBtn = true;
                    } else {
                        cvm.DischargeBtn = false;
                    }
                    cvm.appnmntId = cvm.Encounter.AppointmentId;
                    if (cvm.Encounter.AppointmentId) {
                        $scope.currentcontext.AppointmentId = parseInt(cvm.Encounter.AppointmentId);
                    }
                    cvm.visitno = cvm.Encounter.VisitIdentifier;
                    cvm.encstatusId = cvm.Encounter.EncounterStatusId;

                    if (cvm.encstatusId == 1) {
                        cvm.encstatus = 'Checked In'
                    }
                    if (cvm.encstatusId == 2) {
                        cvm.encstatus = 'Checked Out'
                    }
                }
                cvm.patientinfo.PatientStatus = data.PatientStatus.Description;
                cvm.patientinfo.PhotoPath = data.PhotoPath;
                // cvm.getGeneralAlertsCount();
                // cvm.getPatientAlertsCount();
                cvm.getPatientProfilePic();
            }

            cvm.getPatientById = function () {
                if (cvm.patientid > 0) {
                    var options = {
                        action: 'registration/patient/GetPatientBannerInfoById',
                        data: {
                            Id: cvm.patientid
                        },
                        type: 'post',
                        onComplete: cvm.getPatientByIdCallback
                    };

                    utl.Http.doAction(options);
                }
            }

            cvm.getPatientProfilePicCallback = function (scope, data, options, hasError) {
                cvm.currentcontext.Photo = data.Photo;
            };

            cvm.getPatientProfilePic = function () {
                if (cvm.patientinfo.PhotoPath) {
                    var inputData = {
                        Id: cvm.patientinfo.Id,
                        PhotoPath: cvm.patientinfo.PhotoPath
                    };
                    var options = {
                        action: 'registration/Patient/GetPatientProfilePic',
                        data: {
                            Data: inputData
                        },
                        type: 'post',
                        onComplete: cvm.getPatientProfilePicCallback
                    };
                    utl.Http.doAction(options);
                }
            };

            cvm.patcmnts = function () {
                utl.Modal.open('app.patcomments', {
                    params: {
                        pid: cvm.patientid
                    },
                });
            }

            // Patient Alert
            cvm.patientalerts = function () {
                utl.Modal.open('app.alertview', {
                    params: {
                        pid: cvm.patientid
                    },
                    cancelCallback: cvm.updateCount
                });
            }

            cvm.updateCount = function () {
                cvm.getGeneralAlertsCount();
                cvm.getPatientAlertsCount();
            }

            cvm.getPatientAlertsCallback = function (scope, res, options, hasError) {
                cvm.patientAlertsCount = res.Data.length;
            };

            cvm.getPatientAlertsCount = function () {
                var inputData = {
                    Params: [{
                        Key: 4,
                        Value: cvm.patientid
                    },
                    {
                        Key: 5,
                        Value: utl.Session.getUserDepartments()
                    },
                    {
                        Key: 6,
                        Value: utl.Session.getCurrentUserId()
                    },
                    {
                        Key: 8,
                        Value: true
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
                    onComplete: cvm.getPatientAlertsCallback
                };

                utl.Http.doAction(options);
            };

            cvm.getGeneralAlertsCallback = function (scope, res, options, hasError) {
                cvm.generalAlertsCount = res.Data.length;
            };

            cvm.getGeneralAlertsCount = function () {
                var inputData = {
                    Params: [{
                        Key: 5,
                        Value: utl.Session.getUserDepartments()
                    },
                    {
                        Key: 6,
                        Value: utl.Session.getCurrentUserId()
                    },
                    {
                        Key: 7,
                        Value: true
                    },
                    {
                        Key: 8,
                        Value: true
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
                    onComplete: cvm.getGeneralAlertsCallback
                };

                utl.Http.doAction(options);
            };

            cvm.init = function () { }

            cvm.checkout = function () {
                utl.Modal.open('app.patienttracker', {
                    params: {
                        pid: cvm.patientid,
                        aid: cvm.appnmntId,
                        context: 'emr'
                    },
                });
            }

            // cvm.checkout = function () {
            // 	utl.Modal.open('registration.patientprofile', {
            // 		params: { pid: cvm.patientid }
            // 	}
            // 	);
            // }

            //caution : base method, please don't modifiy
            cvm.$onInit = function () {
                $timeout(cvm.init, 100);
            }
        }])
        .component('emrpatientbanner', {
            bindings: {
                patientid: "=",
                encounterid: "=",
                encounterdoctorid: "=",
                delegatefn: "&"
            },
            controller: 'emrpatientbannerCtrl',
            controllerAs: 'cvm',
            templateUrl: 'vendor/components/emrpatientbanner.html'
        })

})();