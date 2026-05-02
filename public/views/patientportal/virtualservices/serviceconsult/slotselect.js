(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('SlotSelectionController', SlotSelectionController);

    function SlotSelectionController($scope, $stateParams, $state, $translate, utl, Upload, $filter) {

        $scope.currentcontext = {};
        $scope.item = {};
        $scope.ctgryInfo = $stateParams.ctgryInfo;
        $scope.vDetails = $stateParams.details;
        $scope.item = $stateParams.iteminfo;
        $scope.currentcontext.islab = $stateParams.islab;
        $scope.currentcontext.isvaccines = $stateParams.isvaccines;
        $scope.currentcontext.vcategoryid = $scope.ctgryInfo.VirtualCategory.Id;
        $scope.currentcontext.vsubcategoryid = $scope.ctgryInfo.Id;
        $scope.currentcontext.ctypeId = $scope.ctgryInfo.VirtualCategory.ConsultancyTypeId;
        $scope.item.VirtualCategoryId = $scope.currentcontext.vcategoryid;
        $scope.item.VirtualSubCategoryId = $scope.currentcontext.vsubcategoryid;
        if ($stateParams.ctgryInfo.SelectedFacilityId) {
            $scope.item.FacilityId = $stateParams.ctgryInfo.SelectedFacilityId;
        };
        var today = new Date();
        var firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        var lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        var MonthNo = firstDay.getMonth() + 1;
        var Year = firstDay.getFullYear();
        var DaysCount = new Date(Year, MonthNo, 0).getDate();
        $scope.currentcontext.MonthDays = [];
        $scope.item.AppointmentDate = utl.Formatter.getCurrentDate();

        $scope.setDates = function () {
            for (var i = 0; i < 15; i++) {
                var FirstDay = new Date(today);
                var day = FirstDay.setDate(FirstDay.getDate() + i);
                // var Datefrom = $filter('date')(day, 'yyyy-MM-dd 00:00:00');
                var Datefrom = new Date(new Date(day).setHours(0, 0, 0, 0));
                var todaydate = new Date(Datefrom);
                var incDate = {
                    date: todaydate
                };
                $scope.currentcontext.MonthDays.push(incDate);
                $scope.activeMenu = $scope.currentcontext.MonthDays[0];
            }
        };

        $scope.selectdate = function (item) {
            $scope.item.AppointmentDate = item.date;
            $scope.getOrderBookList();
        }

        $scope.setActive = function (menuItem) {
            $scope.activeMenu = menuItem
        }
        $scope.home = function () {
            $state.go('patientportal.virtualhealthcare');
        };
        $scope.backToList = function () {
            $state.go('patientportal.virtualdoctorselection', {
                ctgryInfo: $scope.ctgryInfo,
            });
        };
        $scope.getOrderBookList = function () {
            if (!$scope.item.AppointmentDate) return;
            var From = $filter('date')($scope.item.AppointmentDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.item.AppointmentDate, 'yyyy-MM-dd 23:59:59') || null;
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
                    Key: 23,
                    Value: $scope.currentcontext.vsubcategoryid
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
                onComplete: $scope.getOrderBookListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getOrderBookListCallback = function (scope, res, options, hasError) {
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
                    $scope.appointmentList.push(appt);
                }
            }
            $scope.getAppointmentRequestList();
        };
        $scope.getAppointmentRequestList = function () {
            if (!$scope.item.AppointmentDate) return;
            var inputData = {
                Params: [{
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
            $scope.getApptSession();
        };
        $scope.getApptSession = function () {
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
                    Key: 10,
                    Value: $scope.currentcontext.vsubcategoryid
                },
                {
                    Key: 11,
                    Value: '0'
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
                onComplete: $scope.getApptSessionCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getApptSessionCallback = function (scope, res, options, hasError) {
            console.log(res.Data);
            $scope.NewAppointmentSlot = [];
            var crntTime = utl.Formatter.getTimeString24Hour(utl.Formatter.getCurrentDate());
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

        };
        $scope.SlotBooking = function (items) {
            if (!$scope.item.AppointmentDate) {
                utl.Alert.showErrorMsg('Select any Date for Appointment....');
                return
            };
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
            // if ($scope.currentcontext.vsubcategoryid == 9 || $scope.currentcontext.vsubcategoryid == 11) {
            $state.go('patientportal.otherpersondetails', {
                details: $scope.vDetails,
                slotinfo: $scope.item,
                ctgryInfo: $scope.ctgryInfo,
                ctgryid: $scope.currentcontext.vcategoryid,
                isvaccines: $scope.currentcontext.isvaccines,
                islab: $scope.currentcontext.islab,
                subctgryid: $scope.currentcontext.vsubcategoryid,
                ctypeId: $scope.currentcontext.ctypeId,
            });
            // } else if ($scope.currentcontext.vsubcategoryid == 10) {
            //     $state.go('patientportal.homeaddressdetails', {
            //         details: $scope.vDetails,
            //         slotinfo: $scope.item,
            //         ctgryInfo: $scope.ctgryInfo,
            //         ctgryid: $scope.currentcontext.vcategoryid,
            //         isvaccines: $scope.currentcontext.isvaccines,
            //         islab: $scope.currentcontext.islab,
            //         subctgryid: $scope.currentcontext.vsubcategoryid,
            //         ctypeId: $scope.currentcontext.ctypeId,
            //     });
            // }
        };

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
        };
        var settings = {
            timeSlotGap: 10, //in mins
            minTime: "09:00",
            maxTime: "13:00"
        };
        Date.prototype.addDays = function (days) {
            var dat = new Date(this.valueOf());
            dat.setDate(dat.getDate() + days);
            return dat;
        };

        function getTimeDate(time) {
            var timeParts = time.split(':');
            var d = new Date();
            d.setHours(timeParts[0]);
            d.setMinutes(timeParts[1]);
            d.setSeconds(timeParts[2] || 0);
            return d;
        };

        function prepareSlot(slotTime) {
            var hrs = slotTime.getHours();
            var mins = slotTime.getMinutes();

            var slot = "";
            slot += (hrs < 10) ? '0' + hrs : hrs;
            slot += ':'
            slot += (mins < 10) ? '0' + mins : mins;
            return slot;
        };

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
        };
        $scope.getApptSession();
        $scope.setDates();
        $scope.getOrderBookList();
    }

    SlotSelectionController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'Upload', '$filter'];

})();