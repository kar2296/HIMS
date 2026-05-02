(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('doctorAppointmentsController', doctorAppointmentsController);

    function doctorAppointmentsController($rootScope, $scope, $filter, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;

        $scope.currentcontext = {
        }

        $scope.currentfilter = {
            DoctorId: utl.Session.getCurrentUserId(),
            AppointmentDate: utl.Formatter.getCurrentDate(),
            FacilityId: utl.Session.getCurrentFacilityId(),
        };

        $scope.doctorconfig = {
            DoctorId: utl.Session.getCurrentUserId(),
        };
        $scope.backToList = function () {
            $state.go('app.doctordashboard');
        }

        //schedular config starts
        $scope.getSchedulerSource = function (appointments) {
            if (!appointments) {
                appointments = [];
            }

            // prepare the data
            var source =
                {
                    dataType: "array",
                    dataFields: [
                        { name: 'id', type: 'string' },
                        { name: 'description', type: 'string' },
                        { name: 'location', type: 'string' },
                        { name: 'subject', type: 'string' },
                        { name: 'calendar', type: 'string' },
                        { name: 'start', type: 'date' },
                        { name: 'end', type: 'date' },
                        { name: 'background', type: 'string' },
                        { name: 'readonly', type: 'bool' },
                        { name: 'draggable', type: 'bool' },
                        { name: 'resizable', type: 'bool' },
                        { name: 'tooltip', type: 'string' },
                        { name: 'patientname', type: 'string' },
                        { name: 'mrn', type: 'string' },
                        { name: 'age', type: 'string' },
                        { name: 'gender', type: 'string' },
                        { name: 'appointmenttime', type: 'string' },
                        { name: 'remarks', type: 'string' },
                    ],
                    id: 'id',
                    localData: appointments
                };
            return source;
        }

        $scope.refreshScheler = function (appts) {

            var source = $scope.getSchedulerSource(appts);

            var calendarDate = new Date();
            var month = parseInt(new moment(calendarDate).format('M'));
            var day = parseInt(new moment(calendarDate).format('D'));
            var year = parseInt(new moment(calendarDate).format('YYYY'));


            $scope.settings = {
                date: new $.jqx.date(year, month, day),
                width: '98%',
                height: 370,
                source: source,
                view: 'dayView',
                showLegend: false,
                editDialog: false,
                toolbarHeight: 35,
                enableHover: true,
                columnsHeight: 30,
                rowsHeight: 27,
                touchRowsHeight: 27,
                /*created: function (args) {
                    args.instance.ensureAppointmentVisible('id1');
                },*/
                resources:
                    {
                        colorScheme: "scheme05",
                        dataField: "calendar",
                        orientation: "horizontal",
                        source: new $.jqx.dataAdapter(source)
                    },
                appointmentDataFields:
                    {
                        from: "start",
                        to: "end",
                        id: "id",
                        description: "description",
                        location: "place",
                        subject: "subject",
                        resourceId: "calendar",
                        readOnly: "readonly",
                        background: "background",
                        draggable: "draggable",
                        resizable: "resizable",
                        tooltip: "tooltip",
                        patientname: "patientname",
                        mrn: 'mrn',
                        age: 'age',
                        gender: 'gender',
                        appointmenttime: 'appointmenttime',
                        remarks: 'remarks'
                    },
                views:
                    [
                        { type: 'dayView', timeRuler: { scale: 'quarterHour', formatString: 'HH:mm' } },
                        { type: 'weekView', timeRuler: { scale: 'quarterHour', formatString: 'HH:mm' } },
                        { type: 'monthView', timeRuler: { scale: 'quarterHour', formatString: 'HH:mm' } }
                    ],
                renderAppointment: function (data) {
                    if(data.appointment.subject != 'Holiday') {
                        if (data.view == "weekView" || data.view == "dayView") {
                            var displayStr = data.appointment.patientname + " / " + data.appointment.age + " / " + data.appointment.gender;
                            data.html = displayStr;
                        } else if (data.view == "monthView") {
                            var displayStr = data.appointment.appointmenttime + " / " + data.appointment.remarks;
                            data.html = displayStr;
                        }
                    } else {
                        data.html = "Holiday";
                    }
                    return data;
                },

            };

            $('#scheduler').on('bindingComplete', apptBindingComplete);
            $('#scheduler').on('dateChange', calDateChange);
        }


        function calDateChange(event) {
            var changedDate = utl.Formatter.getDate(event.args.date.toDate());
            if (utl.Formatter.getDateString($scope.currentfilter.AppointmentDate) != utl.Formatter.getDateString(changedDate)) {
                $scope.currentfilter.AppointmentDate = changedDate;
                $scope.getList();
            }
        }

        function apptBindingComplete() {
            var calendarDate = new Date();
            var currentHour = parseInt(new moment(calendarDate).format('HH'));
            $timeout(function () {
                $("#scheduler").jqxScheduler('scrollTop', $('#scheduler').jqxScheduler('rowsHeight') * 4 * currentHour);
            }, 1000);
        }

        //Create dummy appointment to init the schedular
        $scope.createDummyAppt = function () {
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
            $scope.refreshScheler(appointments);
        }
        $scope.createDummyAppt();
        //schedular config ends

        //Appointment session
        $scope.prepareAppointmentSessions = function (apptSession) {
            $scope.appointmentSessionList = [];

            if (apptSession) {
                //$scope.currentcontext.slotType = $scope.slotMap[apptSession.SlotDuration] ? $scope.slotMap[apptSession.SlotDuration] : $scope.currentcontext.slotType;

                var slots = [];
                var isHoliday = false;
                var holidayFrom = new moment(utl.Formatter.getDateStringForAppointment(apptSession.HolidayFrom));
                var holidayTo = new moment(utl.Formatter.getDateStringForAppointment(apptSession.HolidayTo));
                var apptDate = new moment(utl.Formatter.getDateStringForAppointment($scope.currentfilter.AppointmentDate));
                if (apptDate.isSameOrAfter(holidayFrom) && apptDate.isSameOrBefore(holidayTo)) {
                    var appt = {};

                    var apptStart = utl.Formatter.getDateStringForAppointment($scope.currentfilter.AppointmentDate) + " 00:00";
                    var apptEnd = utl.Formatter.getDateStringForAppointment($scope.currentfilter.AppointmentDate) + " 23:59";

                    appt.start = moment(apptStart).toDate();
                    appt.end = moment(apptEnd).toDate();

                    appt.draggable = false;
                    appt.resizable = false;

                    appt.isholiday = true;
                    appt.description = "Holiday";
                    appt.subject = "Holiday";
                    appt.background = 'orange';
                    appt.tooltip = "Holiday";

                    $scope.appointmentSessionList.push(appt);
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

        $scope.getAppointmentSessionsCallback = function (scope, res, options, hasError) {
            var inputData = null;
            var data = res.Data;
            if (data && data.length > 0) {
                inputData = data[0];
            }
            $scope.prepareAppointmentSessions(inputData);
        };

        $scope.getAppointmentSessions = function () {

            var inputData = {
                Params: [
                    { Key: 4, Value: utl.Formatter.getFilterDate($scope.currentfilter.AppointmentDate) },
                    { Key: 2, Value: $scope.currentfilter.FacilityId },
                ],
                PageContext: {
                    PageSize: 200,
                    PageNumber: 1
                }
            };

            inputData.Params.push({ Key: 5, Value: $scope.currentfilter.DoctorId });

            var options = {
                action: 'appointment/AppointmentSession/GetAppointmentSessions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getAppointmentSessionsCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.prepareAppointments(res.Data);
            $scope.getAppointmentSessions();
        };

        $scope.getList = function (pageNo) {

            var inputData = {
                Params: [
                    { Key: 5, Value: $scope.currentfilter.DoctorId },
                    { Key: 2, Value: $scope.currentfilter.FacilityId },
                    { Key: 8, Value: utl.Formatter.getFilterDate($scope.currentfilter.AppointmentDate) }
                ],
                PageContext: {
                    PageSize: 500,
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

        // Calendar related code
        $scope.prepareAppointments = function (items) {

            var apptList = [];
            //$scope.appointmentList.splice(0, $scope.appointmentList.length);
            for (var idx in items) {
                var item = items[idx];
                var appt = {};
                //var apptDate = moment(item.AppointmentDate).toDate();

                var apptStart = utl.Formatter.getDateStringForAppointment(item.AppointmentDate) + " " + item.StartTime;
                var apptEnd = utl.Formatter.getDateStringForAppointment(item.AppointmentDate) + " " + item.EndTime;

                var remarks = "";
                if (item.Remark && item.Remark.Remarks) {
                    remarks = item.Remark.Remarks;
                }

                appt.start = moment(apptStart).toDate();
                appt.end = moment(apptEnd).toDate();
                appt.readonly = true;

                appt.background = item.AppointmentStatus.ColorCode || '#1d23ad';

                if (item.User && item.User.FirstName) {
                    appt.calendar = item.User.FirstName;
                } else if (item.ResourceMaster && item.ResourceMaster.ResourceName) {
                    appt.calendar = item.ResourceMaster.ResourceName;
                }
                appt.location = "";
                appt.id = item.Id.toString();
                appt.draggable = false;
                appt.resizable = false;

                //Other attributes
                appt.patientname = item.Patient.FirstName;
                if (item.Patient.LastName) {
                    appt.patientname += ' ' + item.Patient.LastName;
                }
                if (item.Patient.Title && item.Patient.Title.Description) {
                    appt.patientname = item.Patient.Title.Description + appt.patientname;
                }

                appt.mrn = item.Patient.MRN;
                appt.age = item.Patient.Age;
                appt.gender = '';
                if (item.Patient.Gender && item.Patient.Gender.Description) {
                    appt.gender = item.Patient.Gender.Description;
                }
                appt.appointmenttime = item.StartTime + ' - ' + item.EndTime;
                appt.remarks = remarks;

                appt.description = appt.appointmenttime + " / " + appt.remarks;
                appt.subject = appt.appointmenttime + " / " + appt.remarks;;

                appt.tooltip = appt.appointmenttime + " " + appt.remarks + " " +
                    appt.patientname + " / " + appt.age + " / " + appt.gender;

                apptList.push(appt);
            }

            $scope.appointmentList = apptList;
            // $scope.refreshScheler(apptList);
        }


        //Appointment slot computation starts
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
        //Appointment slot computation ends


        $scope.getList();
    }

    doctorAppointmentsController.$inject = ['$rootScope', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();