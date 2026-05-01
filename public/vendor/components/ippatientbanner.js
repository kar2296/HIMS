(function () {
    'use strict';

    angular
        .module('common.utils')
        .controller('ippatientbannerCtrl', ['utl', '$scope', '$timeout', '$filter', '$stateParams', '$state', function (utl, $scope, $timeout, $filter, $stateParams, $state) {
            var cvm = this;
            cvm.patientinfo = {};
            cvm.currentcontext = {};
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

            cvm.delegatefn({
                cmp: cmpObj
            });
            if ($stateParams.context) {
                $scope.context = $stateParams.context;
            }
            if ($scope.context == 'emr') {
                $stateParams.context == 'emr';
            }
            if ($scope.context == 'ipemr') {
                $stateParams.context == 'ipemr';
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
            if ($stateParams.context)
                $scope.pagecontext = $stateParams.context;
            //Code to reload the banner ends
            $scope.doctor_dashboard = function () {
                if ($scope.orderid) {
                    $scope.virtual_dashboard();
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
                        eid: $stateParams.eid,
                        pid: $stateParams.pid
                    },
                });
            }
            $scope.transport = function () {
                utl.Modal.open('app.transportrequest', {
                    params: {
                        eid: $stateParams.eid,
                        pid: $stateParams.pid
                    },
                });
            }
            $scope.fitfordischarge = function () {
                var msg = '';
                if ($scope.PendingOrderTestNames) {
                    msg = "Peinding List : " + $scope.PendingOrderTestNames;
                    utl.Modal.open('app.patientpendinglisttab', {
                        params: {
                            eid: $stateParams.eid
                        },
                        confirmCallback: $scope.getEncounter
                    });
                    return false;
                } else {
                    var options = {
                        action: 'IPManagement/PatientDischargeEvent/GetPatientDischargeEventByEncounterId',
                        data: {
                            Id: $stateParams.eid,
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
                        Id: $stateParams.eid,
                        Encounter: $scope.Encounter
                    },
                    type: 'post',
                    onComplete: $scope.getPatientDischargeEventCallback
                };
                utl.Http.doAction(options);
            };
            $scope.completecallback = function (scope, data, options, hasError) {
                utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
                $scope.doctor_dashboard();
            };

            $scope.checkoutorder = function () {
                utl.Modal.open('app.patienttracker', {
                    params: {
                        pid: $stateParams.pid,
                        aid: cvm.Encounter.AppointmentId,
                        eid: $stateParams.eid,
                        did: cvm.Encounter.DoctorId,
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
            cvm.getPatientByIdCallback = function (scope, data, options, hasError) {

                cvm.patientinfo.Id = data.Id;
                cvm.patientinfo.MRN = data.MRN;
                cvm.patientinfo.Title = data.Title ? data.Title.Description : null;
                cvm.patientinfo.FirstName = data.FirstName;
                cvm.patientinfo.MiddleName = data.MiddleName;
                cvm.patientinfo.LastName = data.LastName;
                cvm.patientinfo.Age = data.Age;
                cvm.patientinfo.DOB = data.DOB;
                cvm.patientinfo.Mobile = data.Mobile;
                cvm.patientinfo.FacilityId = data.FacilityId;
                cvm.patientinfo.FacilityName = data.Facility.FacilityName;
                if (data.Guarantor) {
                    if (data.Guarantor.GuarantorName) {
                        cvm.patientinfo.Insurance = data.Guarantor.GuarantorName;
                    }
                }
                cvm.patientinfo.Gender = data.Gender ? data.Gender.Description : null;
                cvm.patientinfo.PatientName = '';
                // cvm.EncounterData = data.Encounters ? data.Encounters[0] : {};
                if (cvm.patientinfo.Title) {
                    cvm.patientinfo.PatientName = cvm.patientinfo.Title + ' ';
                }
                cvm.patientinfo.PatientName = cvm.patientinfo.PatientName + cvm.patientinfo.FirstName;
                if (cvm.patientinfo.LastName) {
                    cvm.patientinfo.PatientName = cvm.patientinfo.PatientName + ' ' + cvm.patientinfo.LastName;
                }

                if (data.Age && data.Age != null) {
                    cvm.patientinfo.Age = (data.Age > 1) ? data.Age + " Years" : data.Age + " Year";
                }
                if (data.IsVip) {
                    if (data.IsVip == true) {
                        cvm.patientinfo.VIP = "VIP";
                    } else {
                        cvm.patientinfo.VIP = "";
                    }
                }
                if (data.Encounters.length) {
                    cvm.Encounter = $filter('filter')(data.Encounters, {
                        EncounterTypeId: 2,
                        Id: cvm.currentcontext.encid
                    })[0];
                    cvm.Encounter = data.Encounters[0];
                    if (cvm.Encounter.AppointmentId) {
                        cvm.appnmntId = cvm.Encounter.AppointmentId;
                    }
                    cvm.visitno = cvm.Encounter.VisitIdentifier;
                    cvm.AdmissionDate = cvm.Encounter.AdmissionDate;
                    cvm.EstimationCost = cvm.Encounter.EstimationCost;
                    cvm.DoctorName = '';
                    if (cvm.Encounter.Doctor) {
                        if (cvm.Encounter.Doctor.Title) {
                            cvm.DoctorName = cvm.Encounter.Doctor.Title.Description;
                        }
                        if (cvm.Encounter.Doctor.FirstName) {
                            cvm.DoctorName += ' ' + cvm.Encounter.Doctor.FirstName;
                        }
                        if (cvm.Encounter.Doctor.LastName) {
                            cvm.DoctorName += ' ' + cvm.Encounter.Doctor.LastName;
                        }
                    }
                    cvm.WardDetails = '';
                    if (cvm.Encounter.WardMaster) {
                        cvm.WardDetails = cvm.Encounter.WardMaster.WardName;
                    }
                    if (cvm.Encounter.WardRoomMaster) {
                        cvm.WardDetails += '/' + cvm.Encounter.WardRoomMaster.RoomNo;
                    }
                    if (cvm.Encounter.WardRoomBedMaster) {
                        cvm.WardDetails += '/' + cvm.Encounter.WardRoomBedMaster.BedNo;
                    }
                    if (cvm.Encounter.EncounterTypeId) {
                        cvm.EncounterTypeId = cvm.Encounter.EncounterTypeId;
                    }
                    cvm.IsDay1Discharge = cvm.Encounter.IsDay1Discharge;
                    if (cvm.Encounter.AdmissionStatusId) {
                        cvm.AdmissionStatusId = cvm.Encounter.AdmissionStatusId;
                    }
                    if (cvm.Encounter.AdmissionStatus) {
                        cvm.admissionstatus = cvm.Encounter.AdmissionStatus.Description;
                    }
                    if (cvm.Encounter.AdmissionStatusId == 5) {
                        cvm.DischargeBtn = true;
                    } else {
                        cvm.DischargeBtn = false;
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

            cvm.init = function () {}

            cvm.checkout = function () {
                utl.Modal.open('app.patienttracker', {
                    params: {
                        pid: cvm.patientid,
                        aid: cvm.appnmntId,
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
        .component('ippatientbanner', {
            bindings: {
                patientid: "=",
                encounterid: "=",
                delegatefn: "&"
            },
            controller: 'ippatientbannerCtrl',
            controllerAs: 'cvm',
            templateUrl: 'vendor/components/ippatientbanner.html'
        })

})();