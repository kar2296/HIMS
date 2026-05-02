(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('surgeryschedulecalendarController', surgeryschedulecalendarController)
        .directive('calendar', calendarDirective);

    function surgeryschedulecalendarController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout, $filter) {
        var vm = this;
        // angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));

        $scope.currentcontext = {

        };
        $scope.eventSources = [];
        $scope.calendarEvents = [];
        $scope.currentfilter = {
            FacilityId: parseInt(utl.Session.getCurrentFacilityId()),
            // fromdate: utl.Formatter.getCurrentDate(),
            // todate: utl.Formatter.getCurrentDate()
            fromdate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            todate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
        };
        $scope.statusFilters = {};
        $scope.calendarEvents = [];
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.item = res.Data || [];
            $scope.calendarEvents = $scope.item.map(function (event) {
                var color = '';
                switch (event.OTScheduleStatusId) {
                    case 2: color = '#f39c12'; break;
                    case 3: color = '#00c0ef'; break;
                    case 4: color = '#dd4b39'; break;
                    case 5: color = '#00a65a'; break;
                    default: color = '#999';
                }
                var patientFirstName = '';
                var patientLastName = '';
                var patientTitleDesc = '';
                if (event.Patient) {
                    patientFirstName = event.Patient.FirstName || '';
                    patientLastName = event.Patient.LastName || '';
                    if (event.Patient.Title) {
                        patientTitleDesc = event.Patient.Title.Description || '';
                    }
                }
                var doctorNames = '';
                var procedureNames = '';

                if (Array.isArray(event.OtScheduleDetails)) {
                    doctorNames = event.OtScheduleDetails
                        .map(function (d) { return d.ChiefSurgeonName || ''; })
                        .filter(Boolean)
                        .join(', ');

                    procedureNames = event.OtScheduleDetails
                        .map(function (d) { return d.ProcedureName || ''; })
                        .filter(Boolean)
                        .join(', ');
                }
                var statusDesc = '';
                if (event.OTScheduleStatus) {
                    statusDesc = event.OTScheduleStatus.Description || '';
                }
                var otRoomName = '';
                if (event.SurgeryRoomMaster) {
                    otRoomName = event.SurgeryRoomMaster.Name || '';
                }
                return {
                    id: event.Id,
                    title: patientFirstName + ' - ' + procedureNames,
                    start: combineDateTime(event.OTScheduledOn, event.StartTime),
                    end: combineDateTime(event.OTScheduledOn, event.EndTime),
                    status: statusDesc,
                    allDay: false,
                    backgroundColor: color,
                    borderColor: color,

                    PatientName: patientTitleDesc + ' ' + patientFirstName + ' ' + patientLastName,
                    DoctorName: doctorNames,
                    OTRoom: otRoomName,
                    Procedure: procedureNames
                };
            });
            console.log('Calendar Events:', $scope.calendarEvents);
        };
        function combineDateTime(dateStr, timeStr) {
            if (!dateStr || !timeStr) return null;
            var date = new Date(dateStr);
            var [hours, minutes, seconds] = timeStr.split(':');
            date.setHours(+hours);
            date.setMinutes(+minutes);
            date.setSeconds(+seconds || 0);
            return date;
        }
        $scope.statusOptions = [
            { id: -1, name: 'All', selected: true },
            { id: 2, name: 'Scheduled', selected: false },
            { id: 3, name: 'Confirmed', selected: false },
            { id: 4, name: 'Cancelled', selected: false },
            { id: 5, name: 'Completed', selected: false }
        ];
        $scope.updateStatusFilters = function () {
            // Collect selected ids
            var selectedStatusIds = $scope.statusOptions
                .filter(option => option.selected)
                .map(option => option.id);

            // Optional: Handle 'All' override logic
            if (selectedStatusIds.includes(-1)) {
                $scope.currentfilter.OTScheduleStatusId = -1;
            } else {
                $scope.currentfilter.OTScheduleStatusId = selectedStatusIds;
            }

            $scope.getList();
        };
        $scope.filterByStatus = function (statusId) {
            $scope.currentfilter.OTScheduleStatusId = statusId;
            $scope.getList();
        };
        $scope.currentfilter.OTRoomId = $scope.currentfilter.OTRoomId || [];

        $scope.toggleRoomSelection = function (roomId) {
            var index = $scope.currentfilter.OTRoomId.indexOf(roomId);
            if (index > -1) {
                $scope.currentfilter.OTRoomId.splice(index, 1);
            } else {
                $scope.currentfilter.OTRoomId.push(roomId);
            }
            $scope.getList();
        };
        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.fromdate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.todate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 20, Value: $scope.currentfilter.OTRoomId.join(',') },
                    { Key: 19, Value: $scope.currentfilter.DoctorId },
                    { Key: 4, Value: $scope.currentfilter.FacilityId },
                    { Key: 2, Value: $scope.currentfilter.OTScheduleStatusId },
                    { Key: 10, Value: From },
                    { Key: 11, Value: To },
                    { Key: 18, Value: false },
                ]
            };
            var options = {
                action: 'OtManagement/OtSchedule/GetOtSchedules',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            if ($scope.lookup && $scope.lookup.User && $scope.lookup.User.length > 0) {
                if ($scope.lookup.User[1].UserTypeId === 2) {
                    $scope.currentfilter.DoctorId = [utl.Session.getCurrentUserId()];
                }
            } else {
                $scope.currentfilter.DoctorId = [];
            }
            $scope.getList();
        }
        $timeout(function () {
            $("#datepicker").datepicker({
                onSelect: function (dateText) {
                    var selectedDate = new Date(dateText);
                    $('#calendar').fullCalendar('gotoDate', selectedDate);
                },
                numberOfMonths: 1,
                showButtonPanel: true
            });

            $(document).on('click', '.ui-datepicker-current', function () {
                var today = new Date();
                $('#datepicker').datepicker('setDate', today);
                $('#calendar').fullCalendar('gotoDate', today);
            });
        }, 0);

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "SurgeryRoom"
                },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: utl.Session.getCurrentFacilityId()
                        }]
                    }
                },
                {
                    "Key": "User",
                    Request: {
                        Params: [{
                            Key: 0,
                            Value: utl.Session.getCurrentUserId()
                        }]
                    }
                },
                {
                    "Key": "OTScheduleStatus"
                },
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
            $scope.$watch('eventSources', function (newVal, oldVal) {
                if (newVal !== oldVal && $scope.myCalendar && $scope.myCalendar.fullCalendar) {
                    $scope.myCalendar.fullCalendar('refetchEvents');
                }
            }, true);
        }
        $scope.onCalendarDoubleClick = function (event) {
            if (event.isEmptySlot) {
                const offsetMs = 5.5 * 60 * 60 * 1000;

                const startDate = new Date(new Date(event.start).getTime() - offsetMs);
                const endDate = new Date(new Date(event.end).getTime() - offsetMs);
                function formatTime(date) {
                    if (isNaN(date.getTime())) {
                        return '';
                    }
                    return pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':00';
                }
                function pad(n) {
                    return n < 10 ? '0' + n : n;
                }
                var OTScheduledOn = startDate.getFullYear() + '-' + pad(startDate.getMonth() + 1) + '-' + pad(startDate.getDate());

                var StartTime = pad(startDate.getHours()) + ':' + pad(startDate.getMinutes()) + ':00';
                // var EndTime = pad(endDate.getHours()) + ':' + pad(endDate.getMinutes()) + ':00';
                var EndTime = formatTime(endDate);

                event.OTScheduledOn = OTScheduledOn;
                event.StartTime = StartTime;
                event.EndTime = EndTime;
                console.log("Selected from:", event.OTScheduledOn, event.StartTime, "to:", event.EndTime);
                $scope.addNew(event);
            } else {
                console.log("Double-clicked event:", event);
                $scope.editOld(event);
            }
        };
        $scope.openModal = function (event) {
            utl.Modal.open('app.surgeryschedulecal', {
                params: {
                    id: 0,
                    event: event
                },
                confirmCallback: $scope.initLookup
            }
            );
        }
        $scope.addNew = function (event) {
            $scope.openModal(event);
        }
        $scope.openModals = function (event) {
            utl.Modal.open('app.surgeryconfirmationcal', {
                params: {
                    id: event.id
                },
                confirmCallback: $scope.initLookup
            }
            );
        }
        $scope.editOld = function (event) {
            $scope.openModals(event);
        }
        $scope.initLookup();
    }

    surgeryschedulecalendarController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout', '$filter'];
    function calendarDirective() {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                let lastDayClickTime = 0;
                let lastDayClickDate = null;
                let lastClickTime = 0;
                scope.$watch('calendarEvents', function (events) {
                    $('#calendar').fullCalendar('removeEvents');
                    $('#calendar').fullCalendar('addEventSource', events || []);
                    $('#calendar').fullCalendar('refetchEvents');
                }, true);

                $('#calendar').fullCalendar({
                    header: {
                        left: 'prev,next',
                        center: 'title',
                        right: 'month,agendaWeek,agendaDay'
                    },
                    views: {
                        month: { buttonText: 'Month' },
                        agendaWeek: { buttonText: 'Week', allDayText: 'Full day' },
                        agendaDay: { buttonText: 'Day', allDayText: 'Full day' }
                    },
                    defaultView: 'month',
                    editable: false,
                    eventLimit: true,
                    height: 600,
                    events: scope.calendarEvents,
                    selectable: true,
                    selectHelper: true,
                    select: function (start, end, jsEvent, view) {
                        if (view.name === 'month') {
                            $('#calendar').fullCalendar('unselect');
                            return;
                        }
                        const duration = end.diff(start, 'minutes');
                        if (duration > 30) {
                            scope.$apply(function () {
                                scope.onCalendarDoubleClick({
                                    start: start.toDate(),
                                    end: end.toDate(),
                                    isEmptySlot: true
                                });
                            });
                        }
                        $('#calendar').fullCalendar('unselect');
                    },
                    eventRender: function (event, element) {
                        element.on('click', function (e) {
                            const now = new Date().getTime();
                            if (now - lastClickTime < 300) {
                                scope.$apply(function () {
                                    scope.onCalendarDoubleClick(event);
                                });
                            }
                            lastClickTime = now;
                        });
                    },
                    dayClick: function (date, jsEvent, view) {
                        const now = new Date().getTime();
                        if (lastDayClickDate && date.isSame(lastDayClickDate) && (now - lastDayClickTime) < 300) {
                            scope.$apply(function () {
                                scope.onCalendarDoubleClick({
                                    start: date.toDate(),
                                    isEmptySlot: true // flag to differentiate empty slot clicks
                                });
                            });
                        }
                        lastDayClickTime = now;
                        lastDayClickDate = date;
                    },
                    eventMouseover: function (event, jsEvent) {
                        var tooltipContent =
                            '<strong>Patient:</strong> ' + (event.PatientName || '-') + '<br>' +
                            '<strong>Doctor:</strong> ' + (event.DoctorName || '-') + '<br>' +
                            '<strong>OT Room:</strong> ' + (event.OTRoom || '-') + '<br>' +
                            '<strong>Procedure:</strong> ' + (event.Procedure || '-') + '<br>' +
                            '<strong>Status:</strong> ' + (event.status || '-');

                        var $tooltip = $('<div class="fc-tooltip tooltip fade in" style="position:absolute; z-index:10001; background:#dde2f0; color:#4f576b; padding:8px; border-radius:4px;">' + tooltipContent + '</div>')
                            .appendTo('body');

                        $(this).on('mousemove.tooltip', function (e) {
                            $tooltip.css({
                                top: e.pageY + 10,
                                left: e.pageX + 10
                            });
                        });
                    },

                    eventMouseout: function (event, jsEvent) {
                        $('.fc-tooltip').remove();
                        $(this).off('mousemove.tooltip');
                    }
                    // eventClick: function (event) {
                    //     alert('Event: ' + event.title);
                    // }
                });
            }
        };
    }

})();