(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('UpdateappointmentsAppController', UpdateappointmentsAppController);

    function UpdateappointmentsAppController($scope, $stateParams, $state, $translate, utl, $timeout, $filter) {
        var vm = this;

        $scope.lookup = {};

        $scope.currentcontext = {
            isnewpatient: false,
            attachmentcount: 0,
            slotType: 'fiveMinutes',
            isScheulderInCurrentTime: false
        };
        $scope.currentcontext.Qualification = '';
        $scope.NewAppointmentSlot = [];
        $scope.currentcontext.selecteddept = [];
        $scope.patientfilterconfig = {
            isbilloutstanding: true
        };
        $scope.CanShowCheckin = false;
        $scope.CanShowConfirm = true;
        if ($stateParams.id) {
            $scope.currentcontext.id = parseInt($stateParams.id);
        }
        $scope.newPatient = {
            FirstName: '',
            Mobile: '',
            TitleId: -1,
            GenderId: -1,
        };
        $scope.item = {
            tabindex: $scope.tabindexmap,
            AppointmentTypeId: 1,
            // AppointmentCategoryId: 1,
            FacilityId: utl.Session.getCurrentFacilityId(),
            AppointmentDate: new Date(),
            AppointmentStatusId: 2
        };
        $scope.tabindexmap = {
            patienttabindex: 1,
            detailtabindex: 2
        };
        $scope.appointmentList = [];
        $scope.selectedPatient = {};
        $scope.noshown = 0;

        $scope.AppointmentStatusAlertMap = {
            2: 'appointment.appointment-form.confirm-msg-scheduled.lbl', //SCHEDULED
            3: 'appointment.appointment-form.confirm-msg-confirmed.lbl', //CONFIRMED
            4: 'appointment.appointment-form.confirm-msg-rescheduled.lbl', //RESCHEDULED
            5: 'appointment.appointment-form.confirm-msg-cancelled.lbl', //CANCELLED
            6: 'appointment.appointment-form.confirm-msg-checkedin.lbl', //CHECKEDIN
            11: 'appointment.appointment-form.confirm-msg-checkedout.lbl', //CHECKEDOUT
            12: 'appointment.appointment-form.confirm-msg-noshown.lbl' //No Shown
        };

        $scope.AppointmentStatusMap = {
            2: [2, 3, 4, 5, 6], //SCHEDULED -> CONFIRMED, RESCHEDULED, CANCELLED
            3: [3, 4, 5, 6], //CONFIRMED -> RESCHEDULED, CANCELLED, CHECKEDIN
            6: [6, 11], //CHECKEDIN -> CHECKEDOUT
            5: [5] //CANCELLED
        };

        //Defaulting
        function setDefaults() {
            if ($scope.currentcontext.id == 0) {
                $scope.item.AppointmentTypeId = 1;
                //$scope.selectedAppointmentType = utl.Lookup.getDesc($scope.lookup.AppointmentType, $scope.item.AppointmentTypeId);

                if (utl.Session.getUserTypeId() == 2) // 2=> Physician
                {
                    $scope.item.DoctorId = utl.Session.getCurrentUserId();
                    $scope.item.DepartmentId = utl.Session.getCurrentDepartmentId();
                    $scope.currentcontext.selecteddept = [];
                    $scope.getdepartment();
                }

                // $scope.item.AppointmentCategoryId = 1;
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
        }


        //Patient change
        $scope.getPatientInfo = function(scope, data, options, hasError) {
            $scope.selectedPatient = data;
            $scope.currentcontext.isnewpatient = false;
            if ($scope.selectedPatient.OutStandingAmount && $scope.selectedPatient.OutStandingAmount > 0)
                utl.Alert.showErrorMsg($translate.instant('billing.consolidate.dueamount.lbl') + $filter('displaycurrency')($scope.selectedPatient.OutStandingAmount));
            $scope.loadPatientGuarantors();
            //             $scope.getPatientAttachments();
        }
        $scope.addNew = function() {
            $state.go('app.appointmentcalendar', {
                id: 0
            });
        }

        $scope.patientChange = function() {
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

        $scope.canShowVisitType = function() {
            var result = false;
            if ($scope.lookup && $scope.lookup.AppointmentStatus) {
                var apptStatusId = utl.Lookup.getDefault($scope.lookup.AppointmentStatus, 'Checked In');
                result = ($scope.item.AppointmentStatusId == apptStatusId);
            }
            return result;
        }

        $scope.canShowPhysicianArea = function() {
            var result = false;
            if ($scope.lookup && $scope.lookup.AppointmentType) {
                var apptTypeId = utl.Lookup.getDefault($scope.lookup.AppointmentType, 'Physician');
                result = ($scope.item.AppointmentTypeId == apptTypeId);
            }
            return result;
        }

        $scope.previousappointment = function() {
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

        $scope.appointmentCategoryChanged = function(item) {
            if (item.Text.toLowerCase() == "new patient appointment" || item.Text.toLowerCase() == "new patient visit") {
                $scope.currentcontext.isnewpatient = true;
            } else {
                $scope.currentcontext.isnewpatient = false;
            }
        }

        $scope.isPreviousEncounterExistCallback = function(scope, res, options, hasError) {
            if (res.Data.length > 1)
                $scope.item.VisitTypeId = 2; //Set to "Follow Up"
        }

        $scope.isPreviousEncounterExist = function() {
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

        $scope.canDisablePatientDiv = function() {
            return $scope.item.AppointmentStatusId == 5 ||
                isAppointmentCheckedIn();
        }
        $scope.canDisableAppointmentDiv = function() {
            return $scope.item.AppointmentStatusId == 5;
        }
        $scope.canDisableRemarksDiv = function() {
            return $scope.item.AppointmentStatusId == 5;
        }
        $scope.canDisablePatientSearch = function() {
            return $scope.item.AppointmentStatusId == 5 || isAppointmentCheckedIn();
        }
        $scope.canDisableAppointmentType = function() {
            return $scope.item.AppointmentStatusId == 5 || isAppointmentCheckedIn() || $scope.currentcontext.ct == 'ris';
        }
        $scope.canDisableAppointmentDate = function() {
            return $scope.item.AppointmentStatusId == 5 || isAppointmentCheckedIn();
        }
        $scope.canDisableCategory = function() {
            return $scope.canDisablePatientDiv() || $scope.item.PatientId > 0;
        }

        $scope.canDisableGurarantor = function() {
            return $scope.item.AppointmentStatusId == 5;
        }
        $scope.canDisableProject = function() {
            return $scope.item.AppointmentStatusId == 5;
        }
        $scope.canDisableFacility = function() {
            return $scope.item.AppointmentStatusId == 5 || isAppointmentCheckedIn();
        }
        $scope.canDisableDepartment = function() {
            return $scope.item.AppointmentStatusId == 5 || isAppointmentCheckedIn();
        }
        $scope.canDisableConsultant = function() {
            return $scope.item.AppointmentStatusId == 5 || isAppointmentCheckedIn();
        }
        $scope.canDisableResource = function() {
            return $scope.item.AppointmentStatusId == 5 || isAppointmentCheckedIn();
        }
        $scope.canDisableTime = function() {
            return $scope.item.AppointmentStatusId == 5 || isAppointmentCheckedIn();
        }

        $scope.canShowApproxAge = function() {
            return $scope.currentcontext.isnewpatient &&
                $scope.lookup && $scope.lookup.Title && $scope.newPatient.TitleId == utl.Lookup.getDefault($scope.lookup.Title, 'BABY OF');
        }

        //Visibility rules ends
        $scope.getUserProfilePicCallback = function(scope, data, options, hasError) {
            $scope.currentcontext.Photo = data;
        };

        $scope.getUserProfilePic = function() {
            if ($scope.currentcontext.PhotoPath) {
                var inputData = {
                    PhotoPath: $scope.currentcontext.PhotoPath
                };
                var options = {
                    action: 'SystemSettings/User/GetUserProfilePic',
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.getUserProfilePicCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.doctorChange = function() {
            //Set selected doctor department id to appointment department id
            var doctorObj = utl.Lookup.getObject($scope.lookup.Doctor, $scope.item.DoctorId);
            $scope.currentcontext.Qualification = doctorObj.Qualification;
            if (doctorObj.Title.Description) {
                $scope.item.DoctorName = doctorObj.Title.Description;
            }
            if (doctorObj.FirstName) {
                $scope.item.DoctorName += ' ' + doctorObj.FirstName;
            }
            if (doctorObj.LastName) {
                $scope.item.DoctorName += ' ' + doctorObj.LastName;
            }
            // $scope.item.DoctorName = doctorObj.UserName;
            if (doctorObj.Department)
                $scope.item.DepartmentName = doctorObj.Department.DepartmentName;
            for (var idx in $scope.lookup.Department) {
                if ($scope.lookup.Department[idx].Id == doctorObj.DepartmentId) {
                    if ($scope.currentcontext.selecteddept.indexOf($scope.lookup.Department[idx]) == -1) {
                        $scope.currentcontext.selecteddept.push($scope.lookup.Department[idx]);
                    }
                }
            }
            if ($scope.currentcontext.selecteddept.length > 0)
                $scope.item.DepartmentId = $scope.currentcontext.selecteddept[0].Id;
            // setAssignToDetails();
            $scope.getAppointmentList();
            $scope.getUserProfilePic();
        }
        $scope.onDoctorSelected = function(data) {
            $scope.currentcontext.selecteddept = [];
            $scope.getdepartment();
            console.log(data);
        }
        $scope.getdeptCallback = function(scope, data, options, hasError) {
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
        $scope.getdepartment = function(pageNo) {
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
        $scope.getSchedulerSource = function(appointments) {
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

        $scope.refreshScheler = function(appts, skipViewCreation) {


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
            if ($scope.currentcontext.isScheulderInCurrentTime == false) {
                $scope.currentcontext.isScheulderInCurrentTime = true;

                var calendarDate = new Date();
                var currentHour = parseInt(new moment(calendarDate).format('HH'));

                console.log(currentHour);
                $timeout(function() {
                    $("#scheduler").jqxScheduler('scrollTop', $('#scheduler').jqxScheduler('rowsHeight') * 12 * currentHour);
                }, 1000);
            }
        }

        //Create dummy appointment to init the schedular
        $scope.createDummyAppt = function() {
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
        $scope.filterAppoinmentStatus = function() {
            var possibleApptStatus = $scope.AppointmentStatusMap[$scope.item.AppointmentStatusId];
            $scope.lookup.AppointmentStatus = utl.Lookup.getPossibleFilters($scope.lookup.AppointmentStatus, possibleApptStatus);
            $scope.currentcontext.iscancelled = $scope.item.AppointmentStatusId == 5 ? true : false;
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

            // setAssignToDetails();
        }

        $scope.CancelItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.CancelItem = function() {
            $scope.item.AppointmentStatusId = 5;

            var options = {
                action: 'appointment/Appointment/UpdateAppointment',
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.CancelItemCallback
            };
            utl.Http.doAction(options);
        }

        //getitem
        $scope.getItemCallback = function(scope, data, options, hasError) {
            $scope.item = data;
            $scope.currentcontext.tempApptStatusId = $scope.item.AppointmentStatusId;
            $scope.currentcontext.TempAppointmentDate = $scope.item.AppointmentDate;

            $scope.filterAppoinmentStatus();
            //             $scope.getPatientAttachments();

            $scope.patientChange();
            $scope.onDoctorSelected();
            //             overwriteCurrentItem();
            if ($scope.item.AppointmentStatusId == 2) {
                // $scope.CanShowCheckin = true;
                $scope.CanShowCancel = true;
                $scope.noshown = 1;
            }
            if ($scope.item.AppointmentStatusId == 6) {
                $scope.CanShowCheckin = false;
                $scope.CanShowConfirm = false;
            }
            if ($scope.item.AppointmentStatusId == 3) {
                $scope.CanShowCheckin = true;
                $scope.CanShowConfirm = false;
            }
            if ($scope.item.AppointmentStatusId == 5) {
                $scope.CanShowCheckin = false;
                $scope.CanShowConfirm = false;
            }
            if ($scope.item.AppointmentStatusId == 12) {
                $scope.CanShowCheckin = false;
                $scope.CanShowConfirm = false;
            }
        };

        $scope.getItem = function(pageNo) {
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

        $scope.backToList = function() {
            $state.go('app.appappointments');
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
        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            // $scope.item.orderscheduleId = data;
            // $scope.CanShowSaveBtn = false;
            // if (typeof (data) == "boolean") {
            //     if (options && options.data != null && options.data.Data != null) {
            //         $scope.currentcontext.id = options.data.Data.Id;
            //         $scope.getItem();
            //     }
            // } else if (typeof (data) == "number") {
            //     $state.go('app.updateappapnmnts', { id: data });
            // } else {
            $scope.backToList();
            // }
            // $state.go('app.appointmentstab.details', {
            //     id: 0
            // });
        };

        $scope.validateForm = function() {
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
                (!$scope.item.DepartmentId || $scope.item.DepartmentId == -1)) {
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
            if ($scope.currentcontext.isnewpatient) {
                if (!$scope.newPatient.TitleId || $scope.newPatient.TitleId == -1) {
                    isValid = false;
                    utl.Alert.showErrorMsg($translate.instant('Please Select Title'));
                }
                if ($scope.newPatient.FirstName == '') {
                    isValid = false;
                    utl.Alert.showErrorMsg($translate.instant('Please Enter Name'));
                }
                if (!$scope.newPatient.GenderId || $scope.newPatient.GenderId == -1) {
                    isValid = false;
                    utl.Alert.showErrorMsg($translate.instant('Please Select Gender'));
                }
                if (!$scope.newPatient.Age || $scope.newPatient.Age == '') {
                    isValid = false;
                    utl.Alert.showErrorMsg($translate.instant('Please Enter Age'));
                }
                if ($scope.newPatient.Mobile == '') {
                    isValid = false;
                    utl.Alert.showErrorMsg($translate.instant('Please Enter Mobile No'));
                }
            }
            if ($scope.canShowPhysicianArea() && (!$scope.item.DoctorId || $scope.item.DoctorId == -1)) {
                isValid = false;
                utl.Alert.showErrorMsg($translate.instant('appointment.appointment-form.doctor-required-msg.lbl'));
            }
            if ($scope.canShowVisitType() && (!$scope.item.VisitTypeId || $scope.item.VisitTypeId == -1)) {
                isValid = false;
                utl.Alert.showErrorMsg($translate.instant('appointment.appointment-form.visittype-required-msg.lbl'));
            }


            return isValid;
        }
        $scope.checkIn = function() {
            $scope.item.AppointmentStatusId = 6;
            $scope.saveItem();
        }

        $scope.confirm = function() {
            $scope.item.AppointmentStatusId = 3;
            $scope.saveItem();
        }

        $scope.Noshown = function() {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.AppointmentStatusId = 12;
            $scope.saveItem();
        }

        $scope.saveItem = function(validateDuplicateEncounter) {

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
                var actionName = 'appointment/Appointment/UpdateAppAppointment';

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

        $scope.addGuarantor = function() {
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
        $scope.loadPatientGuarantorsCallback = function(scope, data, options, hasError) {

            data.PatientGuarantor.sort(sort_by('Rank', false, parseInt));
            $scope.lookup.PatientGuarantor = data.PatientGuarantor;

            if (!$scope.item.PatientGuarantorId) {
                $scope.item.PatientGuarantorId = utl.Lookup.getDefault($scope.lookup.PatientGuarantor, 'SELF');
            }
        }

        $scope.loadPatientGuarantors = function() {
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


        $scope.numberonly = function(e) {
            if ((e.charCode > 47 && e.charCode < 58) || (e.charCode == 0)) {
                return;
            } else
                e.preventDefault();
        };
        //autosearch related code ends for Doctors

        vm.referralcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Referral Code',
                    field: 'ReferralCode',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Referral Name',
                    field: 'ReferralName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
                {
                    header: 'Referral Type',
                    field: 'ReferralType',
                    datatype: 'string',
                    headercls: 'td-type',
                    fieldcls: 'td-type'
                },
                {
                    header: 'PhoneNo',
                    field: 'PhoneNo',
                    datatype: 'string',
                    headercls: 'td-phone',
                    fieldcls: 'td-phone'
                },
                {
                    header: 'Area',
                    field: 'Area',
                    datatype: 'string',
                    headercls: 'td-area',
                    fieldcls: 'td-area'
                }
            ],
            searchparams: {},
            result: {},
            api: 'generalmaster/referral/GetReferrals',
            formatdisplay: formatselectedreferral,
            presearch: presearchreferral,
            postsearch: postsearchreferral
        };

        function formatselectedreferral() {
            var selectedItem = vm.referralcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.ReferralName = selectedItem.ReferralName;
                $scope.item.ReferrerNumber = selectedItem.PhoneNo;
                $scope.item.ReferrerEmail = selectedItem.Email;
                result = [selectedItem.ReferralName + ' (' + selectedItem.ReferralCode + ')'].join(' ');
            } else if (vm.referralcontrolconfig.rowdata) {
                result = [vm.referralcontrolconfig.rowdata.ReferralName, vm.referralcontrolconfig.rowdata.ReferralCode].join(' ');
            }
            return result;
        }

        function presearchreferral() {
            var query = vm.referralcontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: $scope.item.ReferralTypeId
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.referralcontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: $scope.item.ReferralId
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
            }

            vm.referralcontrolconfig.searchparams = inputData;
        }

        function postsearchreferral() {
            for (var idx in vm.referralcontrolconfig.result) {
                var item = vm.referralcontrolconfig.result[idx];
                item.ReferralCode = item.ReferralCode;
                if (item.ReferralType)
                    item.ReferralType = item.ReferralType.Description;
                item.PhoneNo = item.PhoneNo;
                if (item.AddressLine1)
                    item.Area = item.AddressLine1 + ',' + item.CityName;
            }
        }

        //Lookup
        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            setDefaults();
            $scope.getItem();
            // $scope.getList();
        }

        $scope.initLookup = function() {
            var inputData = [{
                    "Key": "AppointmentType",
                    Default: false
                },
                {
                    "Key": "AppointmentStatus"
                },
                {
                    "Key": "AppointmentCategory",
                    Default: false
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
        $scope.refreshReferrerCallback = function(scope, data, options, hasError) {
            $scope.lookup.Referral = data.Referral;
        }

        $scope.refreshReferrer = function() {
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
        $scope.getAppointmentSessionsCallback = function(scope, res, options, hasError) {
            var inputData = null;
            var data = res.Data;
            if (data && data.length > 0) {
                inputData = data[0];
            }
            $scope.prepareAppointmentSessions(inputData);
        };

        $scope.getAppointmentSessions = function() {

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
        $scope.getListCallback = function(scope, res, options, hasError) {
            $scope.prepareAppointments(res.Data, options.data.Params[0].Value);
            $scope.getAppointmentSessions();
        };

        $scope.getList = function() {

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

        $scope.prepareAppointments = function(items) {

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

        $scope.prepareAppointmentSessions = function(apptSession) {
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

        Date.prototype.addDays = function(days) {
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

        $scope.getAppointmentList = function() {
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
                        {
                            Key: 20,
                            Value: $scope.item.DoctorId
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
                    onComplete: $scope.getAppointmentListCallback
                };

                utl.Http.doAction(options);
            }
        };

        $scope.getAppointmentListCallback = function(scope, res, options, hasError) {
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

        $scope.getAppointmentRequestList = function() {
            if ($scope.item.DoctorId &&
                $scope.item.DoctorId > 0) {

                if (!$scope.item.AppointmentDate) return;

                var inputData = {
                    Params: [{
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

        $scope.getAppointmentReqListCallback = function(scope, res, options, hasError) {
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

        $scope.getDrApptSession = function() {
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
                        },
                        {
                            Key: 9,
                            Value: $scope.item.DoctorId
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
                    onComplete: $scope.getDrApptSessionCallback
                };

                utl.Http.doAction(options);
            }
        };

        $scope.getDrApptSessionCallback = function(scope, res, options, hasError) {
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
                    var appt = {};
                    var apptStart = utl.Formatter.getDateStringForAppointment($scope.item.AppointmentDate) + " " + avilableslots.start;
                    var apptEnd = utl.Formatter.getDateStringForAppointment($scope.item.AppointmentDate) + " " + avilableslots.end;
                    appt.start = moment(apptStart).toDate();
                    appt.end = moment(apptEnd).toDate();

                    // var isBookedAppt = isAppointmentExists(appt);
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

        $scope.SlotBooking = function(items) {
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

        //New Patient related functions
        $scope.fillGenderInfo = function() {
            if ($scope.newPatient.TitleId == 10 || $scope.newPatient.TitleId == 37) { // 10-MR 37-master
                $scope.newPatient.GenderId = 1; // 1-Male
            } else if ($scope.newPatient.TitleId == 11 || $scope.newPatient.TitleId == 12 || $scope.newPatient.TitleId == 5) { //11- MRS, 12- MS, 5 - MISS
                $scope.newPatient.GenderId = 2; // 2-FeMale
            }
        };

        $scope.calculateAge = function() {
            $scope.newPatient.Age = utl.Formatter.getAgeFromDOB($scope.newPatient.DOB);
        };


        $scope.calculateDOB = function(age, substractPart) {
            var options = {
                d: $scope.newPatient.ApproxAgeDays,
                m: $scope.newPatient.ApproxAgeMonths,
                y: $scope.newPatient.Age
            };
            $scope.newPatient.DOB = utl.Formatter.getDOBFromAgeConfig(options);
            $scope.newPatient.IsBirthDateApproximate = true;
        };



        //sort by
        var sort_by = function(field, reverse, primer) {
            var key = primer ?
                function(x) {
                    return primer(x[field])
                } :
                function(x) {
                    return x[field]
                };

            reverse = !reverse ? 1 : -1;

            return function(a, b) {
                return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
            }
        }

        $scope.initLookup();
    }

    UpdateappointmentsAppController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout', '$filter'];

})();