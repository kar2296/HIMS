(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('appointmentsController', appointmentsController);

    function appointmentsController($scope, $filter, $stateParams, $state, $translate, utl, uibButtonConfig) {
        var vm = this;
        uibButtonConfig.activeClass = "btn-primary";

        $scope.currentcontext = {};
        $scope.currentcontext.pid = parseInt(utl.Session.getPatientPortalPatientId());

        $scope.currentcontext.Photo = null;
        $scope.currentcontext.PhotoPath = null;
        $scope.currentcontext.Qualification = '';
        $scope.currentcontext.drid = 0;

        $scope.lookup = {};

        $scope.appointmentList = [];
        $scope.NewAppointmentSlot = [];
        $scope.AppointmentRequest = [];

        $scope.item = {};

        $scope.ApptReqtOption = 1;

        $scope.clear = function () {
            $scope.item = {
                PatientId: $scope.currentcontext.pid,
                FacilityId: -1,
                FacilityName: '',
                TypeId: -1,
                TypeName: '',
                DepartmentId: -1,
                DepartmentName: '',
                DoctorId: -1,
                ResourceId: null,
                AppointmentTypeId: 1,
                DoctorName: '',
                AppointmentDate: new Date(),
                SelectedOption: -1,
                NewAppointmentpg: 1,
                PrevAppointmentpg: 1,
                DrAvilability: 1,
                SelectedSlot: '',
                SelectedSlotName: '',
                StartTime: '',
                EndTime: '',
                RequestMessage: '',
                ApptAmt: 0.00,
                ApptTypeId: 1,
                PaymentTypeId: 1,
                PaymentType: 'Cash',
                AppointmentRequestStatusId: 1,
                Status: 1,
            };
        }

        $scope.newAppointemnt = function () {
            $scope.clear();
            $scope.item.SelectedOption = 1;
            $scope.item.NewAppointmentpg = 1;
        }

        $scope.SelectedPayment = function (paytype) {
            $scope.item.PaymentTypeId = paytype.Id;
            $scope.item.PaymentType = paytype.Text;
        }

        $scope.SelectedFacility = function (Facility) {
            $scope.item.FacilityId = Facility.Id;
            $scope.item.FacilityName = Facility.Text;
        }

        $scope.SelectedType = function (Type) {
            $scope.item.TypeId = Type.Id;
            $scope.item.TypeName = Type.Text;
            $scope.item.DepartmentId = -1;
            $scope.item.DepartmentName = '';
            $scope.item.DoctorId = -1;
            $scope.item.DoctorName = '';

            $scope.lookup['SelectedDoctor'] = [];
            if ($scope.item.TypeId == 2) {
                $scope.lookup['SelectedDoctor'] = $scope.lookup['Doctor'];
            }
            if ($scope.item.TypeId == 3) {
                $scope.item.DepartmentId = 62;
                $scope.item.DepartmentName = 'Radiology';
                $scope.lookup['SelectedDoctor'] = $scope.lookup['Resource'];
            }

        }

        $scope.SelectedDept = function (Dept) {
            $scope.lookup['SelectedDoctor'] = [];
            $scope.item.DepartmentId = Dept.Id;
            $scope.item.DepartmentName = Dept.Text;

            if ($scope.item.DepartmentId && $scope.item.DepartmentId > 0) {
                for (var idx in $scope.lookup.Doctor) {
                    var doctor = $scope.lookup.Doctor[idx];
                    if (doctor.DepartmentId == $scope.item.DepartmentId) {
                        $scope.lookup['SelectedDoctor'].push(doctor);
                    }
                }
            }
        }

        $scope.SelectedDoctor = function (Doctor) {
            $scope.currentcontext.drid = 0;
            $scope.currentcontext.Photo = null;
            $scope.currentcontext.PhotoPath = null;
            $scope.currentcontext.Qualification = '';
            $scope.item.DoctorId = Doctor.Id;
            $scope.item.DoctorName = Doctor.Text;
            $scope.currentcontext.drid = Doctor.Id;
            $scope.getDrInfo();
            if (Doctor.Department && Doctor.Department.Id)
                $scope.item.DepartmentId = Doctor.Department.Id;

            if (Doctor.Department && Doctor.Department.DepartmentName)
                $scope.item.DepartmentName = Doctor.Department.DepartmentName;
        }

        $scope.getDrInfoCallback = function (scope, data, options, hasError) {
            $scope.currentcontext.PhotoPath = data.PhotoPath;
            $scope.currentcontext.Qualification = data.Qualification;
            $scope.getUserProfilePic();
        };

        $scope.getDrInfo = function () {
            if ($scope.currentcontext.drid && $scope.currentcontext.drid > 0) {
                var options = {
                    action: 'SystemSettings/User/GetUserById',
                    data: { Id: $scope.currentcontext.drid },
                    type: 'post',
                    onComplete: $scope.getDrInfoCallback
                };
                utl.Http.doAction(options);
            }
        };


        $scope.getUserProfilePicCallback = function (scope, data, options, hasError) {
            $scope.currentcontext.Photo = data;
        };

        $scope.getUserProfilePic = function () {
            if ($scope.currentcontext.PhotoPath) {
                var inputData = { PhotoPath: $scope.currentcontext.PhotoPath };
                var options = {
                    action: 'SystemSettings/User/GetUserProfilePic',
                    data: { Data: inputData },
                    type: 'post',
                    onComplete: $scope.getUserProfilePicCallback
                };
                utl.Http.doAction(options);
            }
        };




        // Slot Funcationality //
        Date.prototype.addDays = function (days) {
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
        // Slot Funcationality //

        $scope.getAppointmentList = function () {
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
                    ],
                    PageContext: {
                        PageSize: 1000,
                        PageNumber: 1
                    }
                };

                if ($scope.item.TypeId == 3) {
                    inputData.Params.push({
                        Key: 6,
                        Value: $scope.item.DoctorId
                    });
                } else {
                    inputData.Params.push({
                        Key: 5,
                        Value: $scope.item.DoctorId
                    });
                }

                var options = {
                    action: 'appointment/Appointment/GetAppointments',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getAppointmentListCallback
                };

                utl.Http.doAction(options);
            }
        };

        $scope.getAppointmentListCallback = function (scope, res, options, hasError) {
            $scope.appointmentList = [];
            for (var idx in res.Data) {
                var item = res.Data[idx];
                if (item.AppointmentDate && item.StartTime) {
                    var appt = {};
                    var apptStart = utl.Formatter.getDateStringForAppointment(item.AppointmentDate) + " " + item.StartTime;
                    var apptEnd = utl.Formatter.getDateStringForAppointment(item.AppointmentDate) + " " + item.EndTime;
                    appt.actualdata = JSON.stringify(item);
                    appt.start = moment(apptStart).toDate();
                    appt.end = moment(apptEnd).toDate();
                    $scope.appointmentList.push(appt);
                }
            }
            $scope.getAppointmentRequestList();
        }

        $scope.getAppointmentRequestList = function () {
            if ($scope.item.DoctorId &&
                $scope.item.DoctorId > 0) {

                if (!$scope.item.AppointmentDate) return;

                var inputData = {
                    Params: [
                        {
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

        $scope.getAppointmentReqListCallback = function (scope, res, options, hasError) {
            for (var idx in res.Data) {
                var item = res.Data[idx];
                if (item.AppointmentDate && item.StartTime) {
                    var appt = {};
                    var apptStart = utl.Formatter.getDateStringForAppointment(item.AppointmentDate) + " " + item.StartTime;
                    var apptEnd = utl.Formatter.getDateStringForAppointment(item.AppointmentDate) + " " + item.EndTime;
                    appt.actualdata = JSON.stringify(item);
                    appt.start = moment(apptStart).toDate();
                    appt.end = moment(apptEnd).toDate();
                    $scope.appointmentList.push(appt);
                }
            }
            $scope.getDrApptSession();
        }

        $scope.getDrApptSession = function () {
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
                    }
                    ],
                    PageContext: {
                        PageSize: 1000,
                        PageNumber: 1
                    }
                };

                if ($scope.item.TypeId == 3) {
                    inputData.Params.push({
                        Key: 3,
                        Value: 2
                    });
                    inputData.Params.push({
                        Key: 6,
                        Value: $scope.item.DoctorId
                    });
                } else {
                    inputData.Params.push({
                        Key: 3,
                        Value: 1
                    });
                    inputData.Params.push({
                        Key: 5,
                        Value: $scope.item.DoctorId
                    });
                }

                var options = {
                    action: 'appointment/AppointmentMultiSession/GetAppointmentMultiSessions',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getDrApptSessionCallback
                };

                utl.Http.doAction(options);
            }
        };

        $scope.getDrApptSessionCallback = function (scope, res, options, hasError) {
            console.log(res.Data);
            $scope.NewAppointmentSlot = [];
            for (var idx in res.Data) {
                var apptSession = res.Data[idx];
                var isHoliday = false;
                var isBreak = false;
                var Breakslots = [];
                var slots = [];
                var NewSlotItems = [];
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

                for (var idx in slots) {
                    var avilableslots = slots[idx];
                    var isBookedAppt = isAppointmentExists(avilableslots.start);
                    var isSelected = false;
                    if ($scope.item.StartTime == avilableslots.start) {
                        isSelected = true;
                    }
                    var slotitem = {
                        SlotName: SoltName,
                        isHoliday: isHoliday,
                        isBreak: false,
                        isBookedAppt: isBookedAppt,
                        isSelected: isSelected,
                        AvialSlot: avilableslots.start,
                        AvialEndSlot: avilableslots.end
                    };
                    NewSlotItems.push(slotitem);
                }

                for (var idx in Breakslots) {
                    var avilableslots = Breakslots[idx];
                    var isBookedAppt = isAppointmentExists(avilableslots.start);
                    var isSelected = false;
                    if ($scope.item.StartTime == avilableslots.start) {
                        isSelected = true;
                    }
                    var slotitem = {
                        SlotName: SoltName,
                        isHoliday: isHoliday,
                        isBreak: true,
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

        };

        function isAppointmentExists(apptSlot) {
            var result = false;
            for (var idx in $scope.appointmentList) {
                var item = $scope.appointmentList[idx];
                var bookedslot = moment(item.start).format("HH:mm");
                if (bookedslot == apptSlot) {
                    result = true;
                    break;
                }
            }
            return result;
        }

        $scope.validApptDate = function () {
            var valid = true;
            var TodayDate = new Date().toISOString().slice(0, 10);
            var CurDate = new Date(TodayDate);
            var ApptDate = moment($scope.item.AppointmentDate).toDate();
            var ApptExpiryDays = Math.round((ApptDate - CurDate) / (1000 * 60 * 60 * 24));
            if (ApptExpiryDays < 0) {
                utl.Alert.showErrorMsg($translate.instant('patientportal.newappointmentrequest.apptexpdt.lbl'));
                $scope.item.AppointmentDate = null;
                valid = false;
            }
            return valid;
        }

        $scope.timesort = function (a, b) {
            var aAvialSlot = a.AvialSlot;
            var bAvialSlot = b.AvialSlot;
            return (aAvialSlot < bAvialSlot) ? -1 : 1;
        };

        $scope.SlotBooking = function (items) {
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
        $scope.SelectedPayment = function (paytype) {
            for (var idx in $scope.lookup.PaymentType) {
                $scope.lookup.PaymentType[idx].isSelected = false;
            }
            paytype.isSelected = true;
        }

        $scope.newAppNextAction = function () {
            if (!$scope.Valid()) return;

            if ($scope.item.NewAppointmentpg == 1) {
                var valid = $scope.validApptDate();
                if (!valid) return;
            }

            if ($scope.item.NewAppointmentpg == 2) {
                if (utl.Formatter.isPastDateTime($scope.item.AppointmentDate, $scope.item.StartTime)) {
                    utl.Alert.showErrorMsg($translate.instant('patientportal.newappointmentrequest.apptexptime.lbl'));
                    return;
                }
            }

            if ($scope.item.NewAppointmentpg <= 3)
                $scope.item.NewAppointmentpg++;

            if ($scope.item.NewAppointmentpg == 2) {
                $scope.getAppointmentList();
            }

        }


        $scope.newAppPreviousAction = function () {
            // if (!$scope.Valid()) return;
            if ($scope.item.NewAppointmentpg > 1)
                $scope.item.NewAppointmentpg--;

            if ($scope.item.NewAppointmentpg == 2) {
                $scope.getAppointmentList();
            }
        }


        $scope.Valid = function () {
            var Msg = '';
            if ($scope.item.NewAppointmentpg == 1) {
                if ($scope.item.FacilityId < 0) {
                    Msg = 'Select the facility';
                    utl.Alert.showErrorMsg(Msg);
                    return false;
                } else if ($scope.item.TypeId < 0) {
                    Msg = 'Select the Type';
                    utl.Alert.showErrorMsg(Msg);
                    return false;
                } else if ($scope.item.DepartmentId < 0) {
                    Msg = 'Select the Speciality';
                    utl.Alert.showErrorMsg(Msg);
                    return false;
                } else if ($scope.item.DoctorId < 0) {
                    Msg = 'Select the Doctor';
                    utl.Alert.showErrorMsg(Msg);
                    return false;
                } else if (!$scope.item.AppointmentDate) {
                    Msg = 'Select the Appointment Date';
                    utl.Alert.showErrorMsg(Msg);
                    return false;
                }
            }
            if ($scope.item.NewAppointmentpg == 2) {
                if (!$scope.item.StartTime) {
                    Msg = 'Select any one slot';
                    utl.Alert.showErrorMsg(Msg);
                    return false;
                }
            }
            if ($scope.item.NewAppointmentpg == 3) {
                if (!$scope.item.RequestMessage) {
                    Msg = 'Enter the Reason';
                    utl.Alert.showErrorMsg(Msg);
                    return false;
                }
            }
            return true;
        }

        $scope.saveApptRequest = function () {
            if (!$scope.Valid()) return;

            if ($scope.item.TypeId == 3) { // Resource
                $scope.item.AppointmentTypeId = 2;
                $scope.item.ResourceId = $scope.item.DoctorId;
                $scope.item.DoctorId = -1;
            }

            $scope.item.AppointmentStatusId = $scope.item.AppointmentRequestStatusId;

            var actionName = 'appointment/AppointmentRequest/AddAppointmentRequest';
            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.saveItemCallback,
                onError: $scope.saveItemErrorCallback
            };
            utl.Http.doAction(options);
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.prevAppointment();
        };

        $scope.saveItemErrorCallback = function (scope, data, options, hasError) {
            $scope.newAppointemnt();
        };

        $scope.prevAppointment = function () {
            $scope.pendingDisplay();
        }

        $scope.pendingDisplay = function () {
            $scope.ApptReqtOption = 1;
            $scope.item.SelectedOption = 2;
            $scope.getApptRequest();
        };

        $scope.closedDisplay = function () {
            $scope.ApptReqtOption = 2;
            $scope.item.SelectedOption = 2;
            $scope.getApptRequest();
        };

        $scope.getApptRequest = function () {
            if ($scope.item.PatientId && $scope.item.PatientId > 0) {
                var inputData = {
                    Params: [{
                        Key: 1,
                        Value: $scope.item.PatientId
                    },],
                    PageContext: {
                        PageSize: 1000,
                        PageNumber: 1
                    }
                };

                if ($scope.ApptReqtOption == 1) {
                    inputData.Params.push({
                        Key: 5,
                        Value: true
                    });
                } else {
                    inputData.Params.push({
                        Key: 6,
                        Value: true
                    });
                }

                var options = {
                    action: 'appointment/AppointmentRequest/GetAppointmentRequests',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getApptRequestCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getApptRequestCallback = function (scope, res, options, hasError) {
            $scope.AppointmentRequest = [];
            var i = 1;
            for (var idx in res.Data) {
                var appreq = res.Data[idx];
                appreq.slno = i++;
                appreq.DoctorName = '';

                if (appreq.Doctor && appreq.Doctor.Title &&
                    appreq.Doctor.Title.Description) {
                    appreq.DoctorName = appreq.Doctor.Title.Description;
                }
                if (appreq.Doctor && appreq.Doctor.FirstName) {
                    appreq.DoctorName += ' ' + appreq.Doctor.FirstName;
                }
                if (appreq.Doctor && appreq.Doctor.LastName) {
                    appreq.DoctorName += ' ' + appreq.Doctor.LastName;
                }

                appreq.DispApptDate = $filter('date')(appreq.AppointmentDate, 'dd-MMM-yyyy') || null;
                appreq.DispApptTime = appreq.StartTime, 'HH:mm';
                appreq.ApptReqStatus = null;
                if (appreq.AppointmentRequestStatus &&
                    appreq.AppointmentRequestStatus.Description) {
                    appreq.ApptReqStatus = appreq.AppointmentRequestStatus.Description;
                }
                $scope.AppointmentRequest.push(appreq);
            }
        };

        $scope.deleteApptReqst = function (index, apptreq) {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Are you sure to cancel this appointment booking',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: function () {
                    apptreq.AppointmentRequestStatusId = 5;
                    apptreq.AppointmentStatusId = 5;
                    var actionName = 'appointment/AppointmentRequest/UpdateAppointmentRequest';
                    var options = {
                        action: actionName,
                        data: {
                            Data: apptreq
                        },
                        type: 'post',
                        onComplete: $scope.saveItemCallback
                    };
                    utl.Http.doAction(options);
                }
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }



        $scope.doctorAvilability = function () {
            $scope.item.SelectedOption = 3;
        }

        $scope.home = function () {
            $state.go('patientportal.portaldashboard');
        }


        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            for (var idx in $scope.lookup.PaymentType) {
                if ($scope.lookup.PaymentType[idx].Id == 1) $scope.lookup.PaymentType[idx].isSelected = true;
                else $scope.lookup.PaymentType[idx].isSelected = false;
            }

            for (var idx in $scope.lookup.Doctor) {
                var DrName = $scope.lookup.Doctor[idx].Text;
                var DrTitle = "";
                if ($scope.lookup.Doctor[idx].Title && $scope.lookup.Doctor[idx].Title.Description)
                    DrTitle = $scope.lookup.Doctor[idx].Title.Description + ' ';

                $scope.lookup.Doctor[idx].Text = DrTitle + '' + DrName;
            }

            var type = [{
                'Id': 1,
                'Text': "Speciality"
            },
            {
                'Id': 2,
                'Text': "Doctor"
            },
            {
                'Id': 3,
                'Text': "Radiology"
            },
            ];
            $scope.lookup['Type'] = type;
            var apptype = [{
                'Id': 1,
                'Text': "New"
            },
            {
                'Id': 2,
                'Text': "FollowUp"
            },
            ];
            $scope.lookup['ApptType'] = apptype;
            $scope.lookup['SelectedDoctor'] = [];
            $scope.getPatientInfo();
        };

        $scope.getPatientInfo = function () {
            if ($scope.currentcontext.pid && $scope.currentcontext.pid > 0) {
                $scope.item.PatientId = $scope.currentcontext.pid;
                var options = {
                    action: 'registration/Patient/GetPatientById',
                    data: {
                        Id: $scope.currentcontext.pid
                    },
                    type: 'post',
                    onComplete: $scope.getPatientInfoCallback
                };
                utl.Http.doAction(options);
            }
        }
        $scope.getPatientInfoCallback = function (scope, data, options, hasError) {
            if (data && data.Id) {
                $scope.currentcontext.PatientName = '';
                if (data.Title && data.Title.Description) {
                    $scope.currentcontext.PatientName += data.Title.Description;
                }
                if (data.FirstName) {
                    $scope.currentcontext.PatientName += ' ' + data.FirstName;
                }
                if (data.LastName) {
                    $scope.currentcontext.PatientName += ' ' + data.LastName;
                }
            }
            $scope.newAppointemnt();
        };


        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Facility",
                Request: {
                    Params: [{
                        Key: 4,
                        Value: true
                    }]
                },
                Default: false
            },
            {
                "Key": "Department",
                Request: {
                    Params: [{
                        Key: 10,
                        Value: true
                    }]
                },
                Default: false
            },
            {
                "Key": "Doctor",
                Request: {
                    Params: [{
                        Key: 17,
                        Value: true
                    }]
                },
                Default: false
            },
            {
                "Key": "Resource",
                Default: false
            },
            {
                "Key": "PaymentType",
                Default: false
            },
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

    }

    appointmentsController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', 'uibButtonConfig'];

})();