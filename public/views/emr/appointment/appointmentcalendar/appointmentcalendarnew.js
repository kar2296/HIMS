(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('appointmentscalendarController', appointmentscalendarController)
        .directive('calendar', calendarDirective);

    function appointmentscalendarController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout, $filter) {
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
        $scope.calendarEvents = [];
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.item = res.Data || [];
            $scope.calendarEvents = $scope.item.map(function (event) {
                var color = '';
                switch (event.AppointmentStatusId) {
                    case 2: color = '#f39c12'; break; // orange
                    case 3: color = '#00c0ef'; break; // light blue
                    case 4: color = '#dd4b39'; break; // red
                    case 5: color = '#00a65a'; break; // green
                    case 6: color = '#8e44ad'; break; // purple
                    case 7: color = '#e67e22'; break; // pumpkin
                    case 8: color = '#1abc9c'; break; // turquoise
                    case 9: color = '#3498db'; break; // blue
                    case 10: color = '#c0392b'; break; // dark red
                    case 11: color = '#7f8c8d'; break; // gray
                    default: color = '#999'; // fallback
                }

                var patientFirstName = '';
                var patientLastName = '';
                var patientTitle = '';
                if (event.Patient) {
                    if (event.Patient.FirstName) patientFirstName = event.Patient.FirstName;
                    if (event.Patient.LastName) patientLastName = event.Patient.LastName;
                    if (event.Patient.Title && event.Patient.Title.Description) {
                        patientTitle = event.Patient.Title.Description;
                    }
                }
                var doctorFirstName = '';
                var doctorLastName = '';
                var doctorTitle = '';
                if (event.User) {
                    if (event.User.FirstName) doctorFirstName = event.User.FirstName;
                    if (event.User.LastName) doctorLastName = event.User.LastName;
                    if (event.User.Title && event.User.Title.Description) {
                        doctorTitle = event.User.Title.Description;
                    }
                }
                var appointmentStatus = '';
                if (event.AppointmentStatus && event.AppointmentStatus.Description) {
                    appointmentStatus = event.AppointmentStatus.Description;
                }
                var visitType = '';
                if (event.VisitType && event.VisitType.Description) {
                    visitType = event.VisitType.Description;
                }

                return {
                    id: event.Id,
                    title: patientFirstName + ' - ' + appointmentStatus,
                    start: combineDateTime(event.AppointmentDate, event.StartTime),
                    end: combineDateTime(event.AppointmentDate, event.EndTime),
                    status: appointmentStatus,
                    allDay: false,
                    backgroundColor: color,
                    borderColor: color,

                    PatientName: patientTitle + ' ' + patientFirstName + ' ' + patientLastName,
                    DoctorName: doctorTitle + ' ' + doctorFirstName + ' ' + doctorLastName,
                    VisitType: visitType,
                    AppointmentStatus: appointmentStatus,
                    Time: formatTimeRange(event.StartTime, event.EndTime)
                };
            });
            console.log('Calendar Events:', $scope.calendarEvents);
        };
        function formatTimeRange(start, end) {
            const startDate = new Date('1970-01-01T' + start);
            const endDate = new Date('1970-01-01T' + end);
            function format(date) {
                let hours = date.getHours();
                let minutes = date.getMinutes();
                let suffix = 'am';
                if (hours >= 12) {
                    suffix = 'pm';
                }
                if (hours > 12) {
                    hours -= 12;
                } else if (hours === 0) {
                    hours = 12;
                }
                const paddedMinutes = minutes < 10 ? '0' + minutes : minutes;
                return hours + ':' + paddedMinutes;
            }
            let endSuffix = 'am';
            if (endDate.getHours() >= 12) {
                endSuffix = 'pm';
            }
            return format(startDate) + ' - ' + format(endDate) + ' ' + endSuffix;
        }

        function combineDateTime(dateStr, timeStr) {
            if (!dateStr || !timeStr) return null;
            var date = new Date(dateStr);
            var [hours, minutes, seconds] = timeStr.split(':');
            date.setHours(+hours);
            date.setMinutes(+minutes);
            date.setSeconds(+seconds || 0);
            return date;
        }
        // $scope.currentfilter.AppointmentStatusId = $scope.currentfilter.AppointmentStatusId || [];

        $scope.toggleAppSelection = function (appstsId) {
            if (!$scope.currentfilter.AppointmentStatusId) {
                $scope.currentfilter.AppointmentStatusId = [];
            }
            const index = $scope.currentfilter.AppointmentStatusId.indexOf(appstsId);
            if (index > -1) {
                $scope.currentfilter.AppointmentStatusId.splice(index, 1);
                if ($scope.currentfilter.AppointmentStatusId.length === 0) {
                    $scope.currentfilter.AppointmentStatusId = null;
                }
            } else {
                $scope.currentfilter.AppointmentStatusId.push(appstsId);
            }
            $scope.getList();
        };
        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.fromdate, 'yyyy-MM-dd') || null;
            var To = $filter('date')($scope.currentfilter.todate, 'yyyy-MM-dd') || null;
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentfilter.FacilityId },
                    { Key: 4, Value: 1 },
                    { Key: 29, Value: $scope.currentfilter.DoctorId },
                    { Key: 30, Value: $scope.currentfilter.AppointmentStatusId },
                    { Key: 9, Value: From },
                    { Key: 10, Value: To },
                ]
            };
            var options = {
                action: 'appointment/Appointment/GetAppointments',
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
                { "Key": "AppointmentStatus" }
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
                function pad(n) {
                    return n < 10 ? '0' + n : n;
                }
                var AppointmentDate = startDate.getFullYear() + '-' + pad(startDate.getMonth() + 1) + '-' + pad(startDate.getDate());

                event.AppointmentDate = AppointmentDate;
                console.log("Selected from:", event.AppointmentDate);
                $scope.addNew(event);
            } else {
                console.log("Double-clicked event:", event);
                $scope.editOld(event);
            }
        };
        $scope.openModal = function (event) {
            utl.Modal.open('app.appointmentfromcal', {
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
            utl.Modal.open('app.appointmentfromcal', {
                params: {
                    id: event.id,
                    isreschedule: true
                },
                confirmCallback: $scope.initLookup
            }
            );
        }
        $scope.editOld = function (event) {
            $scope.openModals(event);
        }

        // REACT BRIDGE WIRING (migrated to AppointmentCalendarScreen.tsx).
        // All API calls/business logic above are untouched; the fullCalendar
        // widget + jQuery-UI datepicker stay fully native. See the disclosure
        // comment block at the top of AppointmentCalendarScreen.tsx for the
        // confirmed real multiselectchk read-side bug (never fixed here).
        // -------------------------------------------------------------
        $scope.reactProps = {
            currentfilter: $scope.currentfilter,
            lookup: $scope.lookup
        };

        function refreshReactProps() {
            $scope.reactProps.currentfilter = $scope.currentfilter;
            $scope.reactProps.lookup = $scope.lookup;
        }

        var origLookupCallback = $scope.lookupCallback;
        $scope.lookupCallback = function (scope, data, options, hasError) {
            origLookupCallback(scope, data, options, hasError);
            refreshReactProps();
        };

        $scope.handleReactAction = function (actionName, payload) {
            switch (actionName) {
                case 'doctorFilterChange':
                    // The real <multiselectchk> tag here has no change=
                    // attribute -- no live refetch on selection, matching
                    // the original exactly (only 'fetchClick' refetches).
                    $scope.currentfilter.DoctorId = payload.value;
                    refreshReactProps();
                    break;
                case 'fetchClick':
                    // ng-click="getList()"
                    $scope.getList();
                    refreshReactProps();
                    break;
                case 'statusToggle':
                    // ng-click="toggleAppSelection(appointment.Id)" --
                    // toggleAppSelection() itself calls getList().
                    $scope.toggleAppSelection(payload.id);
                    refreshReactProps();
                    break;
                default:
                    break;
            }
            $scope.$applyAsync();
        };
        // ==================== END REACT BRIDGE WIRING ====================

        $scope.initLookup();
    }

    appointmentscalendarController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout', '$filter'];
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
                    // for Drag and select
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
                    // for created click
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
                    // for new click
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
                            '<strong>Visit Type:</strong> ' + (event.VisitType || '-') + '<br>' +
                            '<strong>Appointment Status:</strong> ' + (event.AppointmentStatus || '-') + '<br>' +
                            '<strong>Time:</strong> ' + (event.Time || '-') + '<br>';

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