(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('appointmentSchFormController', appointmentSchFormController);

    function appointmentSchFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, $timeout, $filter) {
        var vm = this;

        $scope.item = {
            tabindex: $scope.tabindexmap
        };
        $scope.lookup = {};

        $scope.currentcontext = {
            isnewpatient: false,
            attachmentcount: 0,
            slotType: 'fiveMinutes',
            isScheulderInCurrentTime: false
        };
        $scope.currentcontext.selecteddept = [];
        $scope.patientfilterconfig = {
            isbilloutstanding: true
        };
        /*
                $scope.slotMap = {
                    '5' : 'fiveMinutes',
                    '10' : 'tenMinutes',
                    '20' : 'tenMinutes',
                    '15' : 'fiveMinutes',
                    '30' : 'quarterHour',
                };
                */

        $scope.newPatient = {
            FirstName: '',
            Mobile: '',
            TitleId: -1,
            GenderId: -1,
        };
        $scope.tabindexmap = {
            patienttabindex: 1,
            detailtabindex: 2
        };
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.currentcontext.pid = modalConfig.params.pid ? parseInt(modalConfig.params.pid) : 0;
            $scope.currentcontext.ct = modalConfig.params.ct;

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;

            /* 06-07-2017 set the Resource type */
            $scope.item.orderscheduleId = -1;
            if (modalConfig.params.ResourceId) {
                if (modalConfig.params.ResourceId > 0) {
                    $scope.item.ResourceId = modalConfig.params.ResourceId;
                }
            }
            /* 06-07-2017 set the Resource type */
            if (modalConfig.params.appointmentDate) {
                var calendarDate = utl.Formatter.getDate(modalConfig.params.appointmentDate);
                $scope.item.AppointmentDate = calendarDate;
                var month = parseInt(new moment(calendarDate).format('M'));
                var day = parseInt(new moment(calendarDate).format('D'));
                var year = parseInt(new moment(calendarDate).format('YYYY'));

                $scope.settings = {
                    date: new $.jqx.date(year, month, day)
                }
            }

            if ($scope.currentcontext.ct == 'followup' || $scope.currentcontext.ct == 'apptreq') {
                if (utl.Session.getUserTypeId() != 2) {
                    $scope.item.DoctorId = modalConfig.params.doctorId ? modalConfig.params.doctorId : 0;
                    $scope.item.DepartmentId = modalConfig.params.deptId ? modalConfig.params.deptId : 0;
                }
            }

        }



        $scope.appointmentList = [];
        $scope.appointmentSessionList = [];
        $scope.selectedPatient = {};

        $scope.AppointmentStatusAlertMap = {
            2: 'appointment.appointment-form.confirm-msg-scheduled.lbl', //SCHEDULED
            3: 'appointment.appointment-form.confirm-msg-confirmed.lbl', //CONFIRMED
            4: 'appointment.appointment-form.confirm-msg-rescheduled.lbl', //RESCHEDULED
            5: 'appointment.appointment-form.confirm-msg-cancelled.lbl', //CANCELLED
            // 6: 'appointment.appointment-form.confirm-msg-checkedin.lbl', //CHECKEDIN
            // 11: 'appointment.appointment-form.confirm-msg-checkedout.lbl' //CHECKEDOUT
        };

        $scope.AppointmentStatusMap = {
            2: [2, 3, 4, 5], //SCHEDULED -> CONFIRMED, RESCHEDULED, CANCELLED
            3: [3, 4, 5], //CONFIRMED -> RESCHEDULED, CANCELLED

            // 2: [2, 3, 4, 5], //SCHEDULED -> CONFIRMED, RESCHEDULED, CANCELLED
            // 3: [3, 4, 5, 6], //CONFIRMED -> RESCHEDULED, CANCELLED, CHECKEDIN
            // 6: [6, 11], //CHECKEDIN -> CHECKEDOUT
            // 5: [5] //CANCELLED
        };

        //Defaulting
        function setDefaults() {
            if ($scope.currentcontext.id == 0) {
                $scope.item.AppointmentTypeId = utl.Lookup.getDefault($scope.lookup.AppointmentType, 'Physician');
                //$scope.selectedAppointmentType = utl.Lookup.getDesc($scope.lookup.AppointmentType, $scope.item.AppointmentTypeId);

                if (utl.Session.getUserTypeId() == 2) { // 2=> Physician
                    $scope.item.DoctorId = utl.Session.getCurrentUserId();
                    $scope.item.DepartmentId = utl.Session.getCurrentDepartmentId();
                    $scope.currentcontext.selecteddept = [];
                    $scope.getdepartment();
                }

                var AppointmentStatus = $scope.lookup.AppointmentStatus;
                var scheduledobj = utl.Lookup.getObject(AppointmentStatus, 2); // SCHEDULED
                var confirmedobj = utl.Lookup.getObject(AppointmentStatus, 3); // CONFIRMED
                var Rescheuledobj = utl.Lookup.getObject(AppointmentStatus, 4); // RESCHEDULED
                var Cancelledobj = utl.Lookup.getObject(AppointmentStatus, 5); // CANCELLED
                $scope.lookup.AppointmentStatus = [];
                $scope.lookup.AppointmentStatus.push(scheduledobj);
                $scope.lookup.AppointmentStatus.push(confirmedobj);
                $scope.lookup.AppointmentStatus.push(Rescheuledobj);
                $scope.lookup.AppointmentStatus.push(Cancelledobj);

                $scope.item.AppointmentCategoryId = utl.Lookup.getDefault($scope.lookup.AppointmentCategory, 'General');
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

            if (modalConfig.params.apptstatusid) {
                $scope.item.AppointmentStatusId = modalConfig.params.apptstatusid;
            }

            if ($scope.currentcontext.ct == 'ris') {
                $scope.item.AppointmentTypeId = 2;
            }

            if ($scope.currentcontext.ct == 'followup') {
                $scope.currentcontext.selecteddept = [];
                $scope.getdepartment();
            }

            if ($scope.currentcontext.ct == 'apptreq') {
                $scope.currentcontext.appointmentRequestId = modalConfig.params.reqId;
                $scope.currentcontext.selecteddept = [];
                $scope.getdepartment();
            }

            setAssignToDetails();

            /* 06-07-2017 set the Resource type */
            if ($scope.item) {
                if ($scope.item.ResourceId > 0) {
                    $scope.resourceChange();
                }
            }
            /* 06-07-2017 set the Resource type */
        }

        //tab related code starts
        var canDisableTab = parseInt($stateParams.id) == 0 ? true : false;

        $scope.tabs = [{
                title: $translate.instant('appointment.appointmenttab.tabdetails.lbl'),
                state: 'app.appointmenttab.details',
                canDisable: false
            },
            {
                title: $translate.instant('appointment.appointmenttab.taborder.lbl'),
                state: 'app.appointmenttab.order',
                canDisable: canDisableTab
            }
        ];
        $scope.switchTab = function (tab) {
            //$state.go(tab.state);
        }
        //tab related code ends

        //Patient change
        $scope.getPatientInfo = function (scope, data, options, hasError) {
            $scope.selectedPatient = data;
            if ($scope.selectedPatient.OutStandingAmount && $scope.selectedPatient.OutStandingAmount > 0)
                utl.Alert.showErrorMsg($translate.instant('admissions.dueamount.lbl') + $filter('displaycurrency')($scope.selectedPatient.OutStandingAmount));
            $scope.loadPatientGuarantors();
            $scope.getPatientAttachments();
        }


        $scope.patientChange = function () {
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

        //Visibility rules starts
        $scope.canShowResearchProject = function () {
            //Checked in status
            var result = $scope.item.AppointmentStatusId == 6 ? true : false;
            return result;
        }

        $scope.canShowVisitType = function () {
            var result = false;
            if ($scope.lookup && $scope.lookup.AppointmentStatus) {
                var apptStatusId = utl.Lookup.getDefault($scope.lookup.AppointmentStatus, 'Checked In');
                result = ($scope.item.AppointmentStatusId == apptStatusId);
            }
            return result;
        }

        $scope.canShowPhysicianArea = function () {
            var result = false;
            if ($scope.lookup && $scope.lookup.AppointmentType) {
                var apptTypeId = utl.Lookup.getDefault($scope.lookup.AppointmentType, 'Physician');
                result = ($scope.item.AppointmentTypeId == apptTypeId);
            }
            return result;
        }

        $scope.canShowResourceArea = function () {
            var result = false;
            if ($scope.lookup && $scope.lookup.AppointmentType) {
                var apptTypeId = utl.Lookup.getDefault($scope.lookup.AppointmentType, 'Resource');
                result = ($scope.item.AppointmentTypeId == apptTypeId);
            }
            return result;
        }

        $scope.IsResource = function () {
            if ($scope.item.AppointmentTypeId == 2)
                return true;
            return false;
        }

        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'appointment/Appointment/PrintAppointment',
                data: inputData,
                type: 'post',
                // onComplete:$scope.backToList
            };
            utl.Http.doDownload(options);
        }

        $scope.previousappointment = function () {
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

        $scope.openattachments = function () {
            if ($scope.item.PatientId > 0) {
                utl.Modal.open('app.patientattachments', {
                    params: {
                        pid: $scope.item.PatientId,
                        itemid: $scope.item.Id,
                        objecttypeid: 2
                    },
                    confirmCallback: $scope.getPatientAttachments,
                    cancelCallback: $scope.getPatientAttachments
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('appointment.appointment-form.nopatient-msg.lbl'));
            }
        }

        $scope.history = function () {
            if ($scope.item.PatientId) {
                utl.Modal.open('app.appointmenthistory', {
                    params: {
                        pid: $scope.item.PatientId
                    },
                    confirmCallback: $scope.getList
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('appointment.appointment-form.noappointment-msg.lbl'));
            }
        }


        $scope.isCancelled = function () {
            return $scope.currentcontext.iscancelled;
        }

        $scope.canShowAssignPanel = function () {
            //Checked in status
            var result = $scope.item.AppointmentStatusId == 6 ? true : false;
            return result;
        }

        $scope.appointmentCategoryChanged = function (item) {
            if (item.Text.toLowerCase() == "new patient appointment" || item.Text.toLowerCase() == "new patient visit") {
                $scope.currentcontext.isnewpatient = true;
            } else {
                $scope.currentcontext.isnewpatient = false;
            }
        }

        $scope.appointmentStatusChanged = function () {
            //console.log('old status=' + $scope.currentcontext.tempApptStatusId);
            //console.log('new status=' + $scope.item.AppointmentStatusId);
            setAssignToDetails();
        }

        function setAssignToDetails() {
            //Checked in status
            if ($scope.item.AppointmentStatusId == 6) {
                $scope.item.VisitTypeId = 1; //Default to "New"

                $scope.isPreviousEncounterExist();

                if ($scope.canShowPhysicianArea()) {
                    $scope.item.IsAssignedToUser = true;
                    $scope.item.AssignedUserId = $scope.item.DoctorId;

                    var doctorObj = vm.doctorcontrolconfig.iteminfo;
                    if (doctorObj) {
                        var name = doctorObj.FirstName;
                        if (doctorObj.Title && doctorObj.Title.Description) {
                            name = doctorObj.Title.Description + " " + name;
                        }
                        if (doctorObj.LastName) {
                            name += " " + doctorObj.LastName;
                        }
                        $scope.item.AssignedUserName = name;
                    }
                }
            }
        }

        $scope.isPreviousEncounterExistCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 1)
                $scope.item.VisitTypeId = 2; //Set to "Follow Up"
        }

        $scope.isPreviousEncounterExist = function () {
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

        function isAppointmentCheckedIn() {
            var result = false;
            if ($scope.currentcontext.id > 0 && $scope.item.AppointmentStatusId == 6) {
                result = true;
            }
            return result;
        }

        $scope.canDisablePatientDiv = function () {
            return $scope.item.AppointmentStatusId == 5 ||
                isAppointmentCheckedIn();
        }
        $scope.canDisableAppointmentDiv = function () {
            return $scope.item.AppointmentStatusId == 5;
        }
        $scope.canDisableRemarksDiv = function () {
            return $scope.item.AppointmentStatusId == 5;
        }
        $scope.canDisablePatientSearch = function () {
            return $scope.item.AppointmentStatusId == 5 || isAppointmentCheckedIn();
        }
        $scope.canDisableAppointmentType = function () {
            return $scope.item.AppointmentStatusId == 5 || isAppointmentCheckedIn() || $scope.currentcontext.ct == 'ris';
        }
        $scope.canDisableAppointmentDate = function () {
            return $scope.item.AppointmentStatusId == 5 || isAppointmentCheckedIn();
        }
        $scope.canDisableCategory = function () {
            return $scope.canDisablePatientDiv() || $scope.item.PatientId > 0;
        }

        $scope.canDisableGurarantor = function () {
            return $scope.item.AppointmentStatusId == 5;
        }
        $scope.canDisableProject = function () {
            return $scope.item.AppointmentStatusId == 5;
        }
        $scope.canDisableFacility = function () {
            return $scope.item.AppointmentStatusId == 5 || isAppointmentCheckedIn();
        }
        $scope.canDisableDepartment = function () {
            return $scope.item.AppointmentStatusId == 5 || isAppointmentCheckedIn();
        }
        $scope.canDisableConsultant = function () {
            return $scope.item.AppointmentStatusId == 5 || isAppointmentCheckedIn();
        }
        $scope.canDisableResource = function () {
            return $scope.item.AppointmentStatusId == 5 || isAppointmentCheckedIn();
        }
        $scope.canDisableTime = function () {
            return $scope.item.AppointmentStatusId == 5 || isAppointmentCheckedIn();
        }

        $scope.canShowApproxAge = function () {
            return $scope.currentcontext.isnewpatient &&
                $scope.lookup && $scope.lookup.Title && $scope.newPatient.TitleId == utl.Lookup.getDefault($scope.lookup.Title, 'BABY OF');
        }

        //Visibility rules ends

        //schedular config starts
        $scope.slotClick = function (event) {
            console.log(event);
            // $scope.item.StartTime = utl.Formatter.getTimeString(eventData.start);
            // $scope.item.EndTime = utl.Formatter.getTimeString(eventData.end);
        }
        $scope.doctorChange = function () {
            //Set selected doctor department id to appointment department id
            var doctorObj = utl.Lookup.getObject($scope.lookup.Doctor, $scope.item.DoctorId);
            for (var idx in $scope.lookup.Department) {
                if ($scope.lookup.Department[idx].Id == doctorObj.DepartmentId) {
                    if ($scope.currentcontext.selecteddept.indexOf($scope.lookup.Department[idx]) == -1) {
                        $scope.currentcontext.selecteddept.push($scope.lookup.Department[idx]);
                    }
                }
            }
            if ($scope.currentcontext.selecteddept.length > 0)
                $scope.item.DepartmentId = $scope.currentcontext.selecteddept[0].Id;
            setAssignToDetails();
            $scope.getList();
        }
        $scope.onDoctorSelected = function (data) {
            $scope.currentcontext.selecteddept = [];
            $scope.getdepartment();
            console.log(data);
        }
        $scope.getdeptCallback = function (scope, data, options, hasError) {
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
        $scope.getdepartment = function (pageNo) {
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
        $scope.getSchedulerSource = function (appointments) {
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

        $scope.refreshScheler = function (appts, skipViewCreation) {


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
                /*created: function (args) {
                    args.instance.ensureAppointmentVisible('id1');
                },*/
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

            /*      if(skipViewCreation != true) {
                      $("#scheduler").jqxScheduler({
                          views : [{ type: 'dayView', appointmentsRenderMode: "exactTime", timeRuler : { scale: $scope.currentcontext.slotType, formatString: 'HH:mm' } }]
                      });
                  }
                  */

            //$('#scheduler').off("appointmentClick", apptClick);
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
            // var appointments = $('#scheduler').jqxScheduler('getDataAppointments');
            // if (appointments && appointments.length > 0) {
            //     $('#scheduler').jqxScheduler('ensureAppointmentVisible', appointments[0].id);
            // }

            //console.log(appointments);

            if ($scope.currentcontext.isScheulderInCurrentTime == false) {
                $scope.currentcontext.isScheulderInCurrentTime = true;

                var calendarDate = new Date();
                var currentHour = parseInt(new moment(calendarDate).format('HH'));

                console.log(currentHour);
                $timeout(function () {
                    $("#scheduler").jqxScheduler('scrollTop', $('#scheduler').jqxScheduler('rowsHeight') * 12 * currentHour);
                }, 1000);
            }
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
            $scope.refreshScheler(appointments, true);
        }
        $scope.createDummyAppt();
        //schedular config ends


        // get item
        $scope.filterAppoinmentStatus = function () {
            //filter appointmentstatus lookup based on map $scope.AppointmentStatusMap
            // TODO : Filter lookup based on passed values
            var possibleApptStatus = $scope.AppointmentStatusMap[$scope.item.AppointmentStatusId];
            $scope.lookup.AppointmentStatus = utl.Lookup.getPossibleFilters($scope.lookup.AppointmentStatus, possibleApptStatus);

            $scope.currentcontext.iscancelled = $scope.item.AppointmentStatusId == 5 ? true : false;
        }

        //get patient appointments
        $scope.getPatientAttachmentsCallback = function (scope, res, options, hasError) {
            $scope.currentcontext.attachmentcount = res.PageContext.TotalRecords;
        }
        $scope.getPatientAttachments = function () {

            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.item.PatientId
                }],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'registration/PatientAttachment/GetPatientAttachments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientAttachmentsCallback
            };
            utl.Http.doAction(options);
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

            setAssignToDetails();
        }

        //getitem
        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.currentcontext.tempApptStatusId = $scope.item.AppointmentStatusId;
            $scope.currentcontext.TempAppointmentDate = $scope.item.AppointmentDate;

            $scope.filterAppoinmentStatus();
            $scope.getPatientAttachments();

            $scope.patientChange();
            $scope.onDoctorSelected();
            overwriteCurrentItem();
        };

        $scope.getItem = function (pageNo) {
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
            }
        };

        $scope.backToList = function () {
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
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.item.orderscheduleId = data;
            if ($scope.currentcontext.ct == 'apptreq' && data) {
                UpdateAppointmentRequest(data);
            }
            // $scope.currentcontext.id=data;
            $scope.backToList();
            // $scope.print();
        };

        $scope.validateForm = function () {
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
                (!$scope.item.DepartmentId || $scope.item.DepartmentId == -1) ||
                (!$scope.item.PriorityId || $scope.item.PriorityId == -1)) {
                isValid = false;
                utl.Alert.showErrorMsg($translate.instant('common.req-validation-msg.lbl'));
            }

            if ($scope.selectedPatient && $scope.selectedPatient.MRNTypeId == 1 && $scope.item.AppointmentStatusId == 6) { //TEMP patient -> checkedin appt
                isValid = false;
                utl.Alert.showErrorMsg($translate.instant('appointment.appointment-form.temp-patient-valid-msg.lbl'));
            }

            if ($scope.currentcontext.isnewpatient && $scope.item.AppointmentStatusId == 6) { //checkedin
                isValid = false;
                utl.Alert.showErrorMsg($translate.instant('appointment.appointment-form.temp-patient-valid-msg.lbl'));
            }

            if ($scope.canShowPhysicianArea() && (!$scope.item.DoctorId || $scope.item.DoctorId == -1)) {
                isValid = false;
                utl.Alert.showErrorMsg($translate.instant('appointment.appointment-form.doctor-required-msg.lbl'));
            }
            if ($scope.canShowResourceArea() && (!$scope.item.ResourceId || $scope.item.ResourceId == -1)) {
                isValid = false;
                utl.Alert.showErrorMsg($translate.instant('appointment.appointment-form.resource-required-msg.lbl'));
            }

            if ($scope.canShowVisitType() && (!$scope.item.VisitTypeId || $scope.item.VisitTypeId == -1)) {
                isValid = false;
                utl.Alert.showErrorMsg($translate.instant('appointment.appointment-form.visittype-required-msg.lbl'));
            }

            return isValid;
        }

        $scope.saveItem = function (validateDuplicateEncounter) {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            if (!$scope.validateForm()) {
                return;
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

            if ($scope.currentcontext.isnewpatient) {
                savePatient();
            } else {
                var actionName = 'appointment/Appointment/AddAppointment';
                if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                    actionName = 'appointment/Appointment/UpdateAppointment';
                }


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

        function saveItemErrorCallback(data, options) {
            if (data.Error &&
                (data.Error.Code == 'OPEN_ENCOUNTER_EXIST')) {
                var confirmOptions = {
                    headingKey: 'common.confirm-modal-header.lbl',
                    messageKey: 'appointment.appointment-form.ip-encounter-exists-msg.lbl',
                    onSuccessMethod: openEncounterAlertConfirm,
                };
                utl.Dialog.confirmMessage(confirmOptions);
            } else if (data.Error && data.Error.Code == 'APPOINTMENT_ALREADY_BOOKED') {
                utl.Alert.showErrorMsg('APPOINTMENT SLOT ALREADY BOOKED, CHOOSE ANOTHER SLOT');
            }
        }

        function openEncounterAlertConfirm() {
            $scope.saveItem(false); //Skip duplicate encounter validation
        }

        //Savepatient
        function savePatient() {
            var inputData = {
                FirstName: $scope.newPatient.FirstName,
                Mobile: $scope.newPatient.Mobile,
                Age: $scope.newPatient.Age,
                DOB: $scope.newPatient.DOB,
                GenderId: $scope.newPatient.GenderId,
                TitleId: $scope.newPatient.TitleId,
                MRNTypeId: 1,
                PatientStatus: 'Active',
                RegisteredDate: utl.Formatter.getCurrentDateWithoutTime(),
                NationalityId: 238, //India
                FacilityId: utl.Session.getCurrentFacilityId()
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

        //Add guarantors
        function onGuarantorSelected(dataFromModal) {
            $scope.item.PatientGuarantorId = dataFromModal.gid;
            $scope.loadPatientGuarantors();
        }

        $scope.addGuarantor = function () {
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
        $scope.loadPatientGuarantorsCallback = function (scope, data, options, hasError) {

            data.PatientGuarantor.sort(sort_by('Rank', false, parseInt));
            $scope.lookup.PatientGuarantor = data.PatientGuarantor;

            if (!$scope.item.PatientGuarantorId) {
                $scope.item.PatientGuarantorId = utl.Lookup.getDefault($scope.lookup.PatientGuarantor, 'SELF');
            }
        }

        $scope.loadPatientGuarantors = function () {
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
        //autosearch related code ends for Doctors
        //Lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            setDefaults();
            $scope.getItem();
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "AppointmentType"
                },
                {
                    "Key": "AppointmentStatus"
                },
                {
                    "Key": "AppointmentCategory"
                },
                {
                    "Key": "Facility"
                },
                {
                    "Key": "Department"
                },
                {
                    "Key": "Resource"
                },
                {
                    "Key": "Referral"
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
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
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
        $scope.refreshReferrerCallback = function (scope, data, options, hasError) {
            $scope.lookup.Referral = data.Referral;
        }

        $scope.refreshReferrer = function () {
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
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.prepareAppointments(res.Data, options.data.Params[0].Value);
            $scope.getAppointmentSessions();
        };

        $scope.getList = function () {

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

        $scope.prepareAppointments = function (items) {

            $scope.appointmentList.splice(0, $scope.appointmentList.length);
            for (var idx in items) {
                var item = items[idx];
                var appt = {};
                //var apptDate = utl.Formatter.getDate(item.AppointmentDate);

                var apptStart = utl.Formatter.getDateStringForAppointment(item.AppointmentDate) + " " + item.StartTime;
                var apptEnd = utl.Formatter.getDateStringForAppointment(item.AppointmentDate) + " " + item.EndTime;

                var remarks = "";
                if (item.Remark && item.Remark.Remarks) {
                    remarks = item.Remark.Remarks;
                }

                appt.description = item.Patient.FirstName + "/" + item.Patient.MRN + remarks;
                appt.subject = item.Patient.FirstName + " " + remarks;

                if (item.AppointmentStatusId == 5) { //Cancelled
                    appt.description += " - Cancelled";
                    appt.subject += " - Cancelled";
                }
                appt.start = moment(apptStart).toDate();
                appt.end = moment(apptEnd).toDate();

                appt.background = item.AppointmentCategory.Color;
                if (item.User && item.User.FirstName) {
                    appt.calendar = item.User.FirstName;
                } else if (item.ResourceMaster && item.ResourceMaster.ResourceName) {
                    appt.calendar = item.ResourceMaster.ResourceName;
                }

                appt.location = "";
                appt.id = item.Id.toString();
                appt.draggable = false;
                appt.resizable = false;
                appt.tooltip = item.StartTime + ' - ' + item.EndTime + "/" + appt.description;


                $scope.appointmentList.push(appt);
            }
        }

        $scope.prepareAppointmentSessions = function (apptSession) {
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

                if (apptSession.BreakFrom && apptSession.BreakTo) {
                    var slots1 = getTimeSlots(getTimeDate(apptSession.StartTime), getTimeDate(apptSession.BreakFrom), apptSession.SlotDuration);
                    var slots2 = getTimeSlots(getTimeDate(apptSession.BreakTo), getTimeDate(apptSession.EndTime), apptSession.SlotDuration);
                    slots = slots1.concat(slots2);
                } else {
                    slots = getTimeSlots(getTimeDate(apptSession.StartTime), getTimeDate(apptSession.EndTime), apptSession.SlotDuration)
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
        // Calendar related code ends


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

        //control value change methods starts
        $scope.departmentChangeCallback = function (scope, data, options, hasError) {
            if ($scope.canShowPhysicianArea()) {
                $scope.lookup.Doctor = data.Doctor;
            } else if ($scope.canShowResourceArea()) {
                $scope.lookup.Resource = data.Resource;
            }
        }
        $scope.departmentChange = function () {
            var inputData = [];

            if ($scope.canShowPhysicianArea()) {
                inputData.push({
                    Key: "Doctor",
                    Request: {
                        Params: [{
                            Key: 6,
                            Value: $scope.item.DepartmentId
                        }]
                    }
                });
            } else if ($scope.canShowResourceArea()) {
                inputData.push({
                    Key: "Resource",
                    Request: {
                        Params: [{
                            Key: 4,
                            Value: $scope.item.DepartmentId
                        }]
                    }
                });
            }

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.departmentChangeCallback
            };
            utl.Http.doAction(options);
        }

        // $scope.doctorChange = function () {
        //     //Set selected doctor department id to appointment department id
        //     $scope.item.DepartmentId = vm.doctorcontrolconfig.iteminfo.DepartmentId;

        //     setAssignToDetails();
        //     $scope.getList();
        // }

        $scope.resourceChange = function () {
            //Set selected resource department id to appointment department id
            var resourceObj = utl.Lookup.getObject($scope.lookup.Resource, $scope.item.ResourceId);
            $scope.item.DepartmentId = resourceObj.DepartmentId;

            $scope.getList();
        }

        $scope.assignedToUserChange = function () {
            if ($scope.item.IsAssignedToUser) {
                $scope.item.IsAssignedToGroup = false;
            }
        }

        $scope.assignedToGroupChange = function () {
            if ($scope.item.IsAssignedToGroup) {
                $scope.item.IsAssignedToUser = false;
            }
        }

        $scope.assignedUserChange = function (item) {
            var name = item.FirstName;

            if (item.Title && item.Title.Description) {
                name = item.Title.Description + " " + name;
            }
            if (item.LastName) {
                name += " " + item.LastName;
            }
            $scope.item.AssignedUserName = name;
        }
        $scope.referralChange = function (item) {
            $scope.item.ReferralName = item.Text;
            $scope.item.ReferralTypeId = item.ReferralTypeId;
        }
        $scope.remarkChange = function (item) {
            $scope.item.Remarks = item.Text;
        }
        //control value change methods ends

        //Add referrer
        $scope.addReferral = function () {
            utl.Modal.open('app.referraltab.details', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.refreshReferrer
            });
        };

        //New Patient related functions
        $scope.fillGenderInfo = function () {
            if ($scope.newPatient.TitleId == 10 || $scope.newPatient.TitleId == 37) { // 10-MR 37-master
                $scope.newPatient.GenderId = 1; // 1-Male
            } else if ($scope.newPatient.TitleId == 11 || $scope.newPatient.TitleId == 12 || $scope.newPatient.TitleId == 5) { //11- MRS, 12- MS, 5 - MISS
                $scope.newPatient.GenderId = 2; // 2-FeMale
            }
        };

        $scope.calculateAge = function () {
            $scope.newPatient.Age = utl.Formatter.getAgeFromDOB($scope.newPatient.DOB);
        };

        // $scope.calculateDOB = function () {
        //     $scope.newPatient.DOB = utl.Formatter.getDOBFromAge($scope.newPatient.Age);
        // };

        // $scope.calculateDOB = function (age, substractPart) {
        //     if (substractPart == 'days') {
        //         $scope.newPatient.ApproxAgeMonths = '';
        //         $scope.newPatient.Age = null;
        //     } else if (substractPart == 'months') {
        //         $scope.newPatient.ApproxAgeDays = '';
        //         $scope.newPatient.Age = null;
        //     } else if (substractPart == 'years') {
        //         $scope.newPatient.ApproxAgeDays = '';
        //         $scope.newPatient.ApproxAgeMonths = '';
        //     }

        //     $scope.newPatient.DOB = utl.Formatter.getDOBFromAge(age, substractPart);
        //     $scope.newPatient.IsBirthDateApproximate = true;
        // };

        $scope.calculateDOB = function (age, substractPart) {
            var options = {
                d: $scope.newPatient.ApproxAgeDays,
                m: $scope.newPatient.ApproxAgeMonths,
                y: $scope.newPatient.Age
            };
            $scope.newPatient.DOB = utl.Formatter.getDOBFromAgeConfig(options);
            $scope.newPatient.IsBirthDateApproximate = true;
        };



        //sort by
        var sort_by = function (field, reverse, primer) {
            var key = primer ?
                function (x) {
                    return primer(x[field])
                } :
                function (x) {
                    return x[field]
                };

            reverse = !reverse ? 1 : -1;

            return function (a, b) {
                return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
            }
        }

        $scope.initLookup();
    }

    appointmentSchFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', '$timeout', '$filter'];

})();