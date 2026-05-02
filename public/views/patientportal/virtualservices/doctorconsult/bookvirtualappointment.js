(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('BookVirtualAppointmentController', BookVirtualAppointmentController);

    function BookVirtualAppointmentController($scope, $stateParams, $state, $translate, utl, Upload, $filter) {

        $scope.currentcontext = {};
        $scope.docInfo = $stateParams.docData;
        $scope.ctgryInfo = $stateParams.ctgryInfo;
        $scope.currentcontext.vcategoryid = parseInt($stateParams.ctgryid);
        $scope.currentcontext.vsubcategoryid = parseInt($stateParams.subctgryid);
        $scope.currentcontext.ctypeId = parseInt($stateParams.ctypeId);
        $scope.item = {
            AppointmentDate: utl.Formatter.getCurrentDate()
        };
        $scope.home = function () {
            $state.go('patientportal.virtualhealthcare');
        }

        $scope.CheckApnmntDate = function(item) {
            var apnmntDate = new Date(item.AppointmentDate);
            var crntdate = new Date(utl.Formatter.getDateStringForAppointment(utl.Formatter.getCurrentDate()));
            if (apnmntDate < crntdate) {
                utl.Alert.showErrorMsg($translate.instant('Appointment Date Should Be a Future Date'));
                $scope.item.AppointmentDate = utl.Formatter.getCurrentDate();
            } else {
                $scope.getOrderBookList()
            }
        }
        
        $scope.getOrderBookList = function () {
            if ($scope.docInfo.Id &&
                $scope.docInfo.Id > 0) {
                if (!$scope.item.AppointmentDate) return;
                var From = $filter('date')($scope.item.AppointmentDate, 'yyyy-MM-dd 00:00:00') || null;
                var To = $filter('date')($scope.item.AppointmentDate, 'yyyy-MM-dd 23:59:59') || null;
                var inputData = {
                    Params: [{
                        Key: 13,
                        Value: utl.Session.getCurrentFacilityId()
                    },
                    // {
                    //     Key: 4,
                    //     Value: 1
                    // },
                    // {
                    //     Key: 7,
                    //     Value: [1, 2, 3, 4, 6, 7, 8, 9, 10, 11]
                    // },
                    {
                        Key: 10,
                        Value: From
                    },
                    {
                        Key: 11,
                        Value: To
                    },
                    {
                        Key: 12,
                        Value: $scope.docInfo.Id
                    }
                    ],
                    PageContext: {
                        PageSize: 1000,
                        PageNumber: 1
                    }
                };

                var options = {
                    action: 'VirtualHealthcare/VirtualOrder/GetVirtualOrders',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getOrderBookListCallback
                };

                utl.Http.doAction(options);
            }
        };
        $scope.backToList = function () {
            $state.go('patientportal.virtualdoctorselection', {
                ctgryInfo: $scope.ctgryInfo,
            });
        }
        $scope.getOrderBookListCallback = function (scope, res, options, hasError) {
            $scope.appointmentList = [];
            for (var idx in res.Data) {
                var item = res.Data[idx];
                if (item.OrderScheduleDate && item.StartTime) {
                    var appt = {};
                    var apptStart = utl.Formatter.getDateStringForAppointment(item.OrderScheduleDate) + " " + item.StartTime;
                    var apptEnd = utl.Formatter.getDateStringForAppointment(item.OrderScheduleDate) + " " + item.EndTime;
                    appt.actualdata = JSON.stringify(item);
                    appt.start = moment(apptStart).toDate();
                    appt.end = moment(apptEnd).toDate();
                    $scope.appointmentList.push(appt);
                }
            }
            $scope.getAppointmentRequestList();
        }

        $scope.getAppointmentRequestList = function () {
            if ($scope.docInfo.Id &&
                $scope.docInfo.Id > 0) {

                if (!$scope.item.AppointmentDate) return;

                var inputData = {
                    Params: [{
                        Key: 2,
                        Value: $scope.docInfo.Id
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
            if ($scope.docInfo.Id &&
                $scope.docInfo.Id > 0) {
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
                        Value: $scope.docInfo.Id
                    });
                } else {
                    inputData.Params.push({
                        Key: 3,
                        Value: 1
                    });
                    inputData.Params.push({
                        Key: 5,
                        Value: $scope.docInfo.Id
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
            $scope.currentcontext.DayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            $scope.NewAppointmentSlot = [];
            var crntTime = utl.Formatter.getTimeString24Hour(utl.Formatter.getCurrentDate());
            var Crntday = $scope.currentcontext.DayNames[new Date($scope.item.AppointmentDate).getDay()];
            for (var idx in res.Data) {
                var apptSession = res.Data[idx];
                var isHoliday = false;
                var isBreak = false;
                var isallday = apptSession.IsAll;
                var availabledays = [];

                if (isallday == false) {
                    if (apptSession.IsSunday == true) {
                        var days = 'Sunday';
                        availabledays.push(days);
                    }
                    if (apptSession.IsMonday == true) {
                        var days = 'Monday';
                        availabledays.push(days);
                    }
                    if (apptSession.IsTuesday == true) {
                        var days = 'Tuesday';
                        availabledays.push(days);
                    }
                    if (apptSession.IsWednesday == true) {
                        var days = 'Wednesday';
                        availabledays.push(days);
                    }
                    if (apptSession.IsThursday == true) {
                        var days = 'Thursday';
                        availabledays.push(days);
                    }
                    if (apptSession.IsFriday == true) {
                        var days = 'Friday';
                        availabledays.push(days);
                    }
                    if (apptSession.IsSaturday == true) {
                        var days = 'Saturday';
                        availabledays.push(days);
                    }
                    for (var ax in availabledays) {
                        var avails = availabledays[ax];
                        if (Crntday == avails) {
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
                                var appt = {};
                                var apptStart = utl.Formatter.getDateStringForAppointment($scope.item.AppointmentDate) + " " + avilableslots.start;
                                var apptEnd = utl.Formatter.getDateStringForAppointment($scope.item.AppointmentDate) + " " + avilableslots.end;
                                appt.start = moment(apptStart).toDate();
                                appt.end = moment(apptEnd).toDate();
                                if (utl.Formatter.getDateStringForAppointment($scope.item.AppointmentDate) == utl.Formatter.getDateStringForAppointment(utl.Formatter.getCurrentDate())) {
                                    if (avilableslots.start >= crntTime) {
                                        var isBookedAppt = isAppointmentExists(appt);
                                        var isSelected = false;
                                        if ($scope.item.StartTime == appt.start) {
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
                                } else if ($scope.item.AppointmentDate != utl.Formatter.getCurrentDate()) {
                                    var isBookedAppt = isAppointmentExists(appt);
                                    var isSelected = false;
                                    if ($scope.item.StartTime == appt.start) {
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
                    }
                }
                if (isallday == true) {
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
                        var appt = {};
                        var apptStart = utl.Formatter.getDateStringForAppointment($scope.item.AppointmentDate) + " " + avilableslots.start;
                        var apptEnd = utl.Formatter.getDateStringForAppointment($scope.item.AppointmentDate) + " " + avilableslots.end;
                        appt.start = moment(apptStart).toDate();
                        appt.end = moment(apptEnd).toDate();
                        if (utl.Formatter.getDateStringForAppointment($scope.item.AppointmentDate) == utl.Formatter.getDateStringForAppointment(utl.Formatter.getCurrentDate())) {
                            if (avilableslots.start >= crntTime) {
                                var isBookedAppt = isAppointmentExists(appt);
                                var isSelected = false;
                                if ($scope.item.StartTime == appt.start) {
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
                        } else if ($scope.item.AppointmentDate != utl.Formatter.getCurrentDate()) {
                            var isBookedAppt = isAppointmentExists(appt);
                            var isSelected = false;
                            if ($scope.item.StartTime == appt.start) {
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
            }
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
            $state.go('patientportal.doctorconfirmorder', {
                drData: $scope.docInfo,
                slotinfo: $scope.item,
                ctgryInfo: $scope.ctgryInfo,
                ctgryid: $scope.currentcontext.vcategoryid,
                subctgryid: $scope.currentcontext.vsubcategoryid,
                ctypeId: $scope.currentcontext.ctypeId,
            });
        }

        function isAppointmentExists(apptSlot) {
            var result = false;
            for (var idx in $scope.appointmentList) {
                var item = $scope.appointmentList[idx];
                if (utl.Formatter.getDateTimeStringForAppointment(item.start) == utl.Formatter.getDateTimeStringForAppointment(apptSlot.start) &&
                    utl.Formatter.getDateTimeStringForAppointment(item.end) == utl.Formatter.getDateTimeStringForAppointment(apptSlot.end)) {
                    result = true;
                }
            }
            return result;
        }

        var settings = {
            timeSlotGap: 10, //in mins
            minTime: "09:00",
            maxTime: "13:00"
        };

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

        // $scope.slotclick = function () {
        //     $state.go('app.slotschedule', {
        //         id: 0
        //     });
        // }

        $scope.getOrderBookList();
    }

    BookVirtualAppointmentController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'Upload', '$filter'];

})();