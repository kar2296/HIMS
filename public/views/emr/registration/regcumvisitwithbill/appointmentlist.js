(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('regschapptListController', regschapptListController);

    function regschapptListController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, $filter, $timeout) {
        var vm = this;

        vm.appointment = {
            ShowCalendar: false
        };

        $scope.appointmentList = [];
        $scope.appointmentSessionList = [];

        $scope.currentcontext = {
            ct: ''
        };

        $scope.currentfilter = {
            FacilityId: parseInt(utl.Session.getCurrentFacilityId()),
            DepartmentId: -1,
            AppointmentTypeId: -1,
            PatientId: -1,
            DoctorId: '',
            ResourceId: '',
            AppointmentStatusId: '',
            appointmentdate: utl.Formatter.getCurrentDate(),
            MRN: '',
            orderscheduleId: -1
        };

        $scope.currentcontext.ct = $stateParams.ct;

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.currentcontext.pid = modalConfig.params.pid ? parseInt(modalConfig.params.pid) : 0;
            $scope.currentcontext.ct = modalConfig.params.ct;

            $scope.currentfilter.AppointmentStatusId =
                modalConfig.params.apptstatusid ? modalConfig.params.apptstatusid : null;

            $scope.currentfilter.DoctorId =
                modalConfig.params.doctorId ? modalConfig.params.doctorId : null;

            $scope.currentfilter.PatientId =
                modalConfig.params.pid ? parseInt(modalConfig.params.pid) : null;

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;

            /*  - 06-07-2017 set the Resource type */
            $scope.currentfilter.orderscheduleId = -1;
            if (modalConfig.params.ResourceId) {
                if (modalConfig.params.ResourceId > 0) {
                    $scope.currentfilter.ResourceId = modalConfig.params.ResourceId;
                }
            }
            /*  - 06-07-2017 set the Resource type */
            if (modalConfig.params.appointmentDate) {
                var calendarDate = utl.Formatter.getDate(modalConfig.params.appointmentDate);
                $scope.currentfilter.AppointmentDate = calendarDate;
                var month = parseInt(new moment(calendarDate).format('M'));
                var day = parseInt(new moment(calendarDate).format('D'));
                var year = parseInt(new moment(calendarDate).format('YYYY'));

                $scope.settings = {
                    date: new $.jqx.date(year, month, day)
                }
            }

            $scope.currentfilter.DoctorId = modalConfig.params.doctorId ? modalConfig.params.doctorId : 0;
            $scope.currentfilter.DepartmentId = modalConfig.params.deptId ? modalConfig.params.deptId : 0;

        }



        if (utl.Session.getUserTypeId() == 2) { // 2=> Physician
            $scope.currentfilter.DoctorId = utl.Session.getCurrentUserId().toString();
        }

        $scope.opd_dashboard = function () {
            $state.go('app.opddashboard');
        }



        function handleDynamicFormEvents(actionType, formData) {
            $scope.advancedfilter = formData;
            $scope.getList();
        }

        $scope.openAdvancedFilter = function () {

            utl.Modal.openDynamicForm({
                modeldata: $scope.advancedfilter,
                defaultdata: $scope.advancedfilterDefault,
                schema: $scope.advancedFilterSchema,
                relativeto: '#btnadvanced',
                handleDynamicFormEvents: handleDynamicFormEvents
            });
        }
        //Dynamic form  ends


        //Defaulting
        function setDefaults() {
            if ($scope.currentcontext.ct == 'ris') {
                $scope.currentfilter.AppointmentTypeId = 2;
                $scope.currentcontext.candisableappttype = true;
            } else {
                $scope.currentfilter.AppointmentTypeId = utl.Lookup.getDefault($scope.lookup.AppointmentType, 'Physician');
            }

            //Setting default status filters starts
            var scheduledStautsId = utl.Lookup.getDefault($scope.lookup.AppointmentStatus, 'Scheduled');
            var checkedInStatusId = utl.Lookup.getDefault($scope.lookup.AppointmentStatus, 'Checked In');
            $scope.currentfilter.AppointmentStatusId = scheduledStautsId;

        }


        $scope.canShowPhysicianArea = function () {
            var result = false;
            if ($scope.lookup && $scope.lookup.AppointmentType) {
                var apptTypeId = utl.Lookup.getDefault($scope.lookup.AppointmentType, 'Physician');
                result = ($scope.currentfilter.AppointmentTypeId == apptTypeId);
            }
            return result;
        }

        $scope.canShowResourceArea = function () {
            var result = false;
            if ($scope.lookup && $scope.lookup.AppointmentType) {
                var apptTypeId = utl.Lookup.getDefault($scope.lookup.AppointmentType, 'Resource');
                result = ($scope.currentfilter.AppointmentTypeId == apptTypeId);
            }
            return result;
        }

        //schedular config starts
        $scope.apptContextMenus = [
            { id: "open", label: "Edit Appointment" },
            { id: "dem", label: "Demographics" },
            { id: "estimates", label: "Estimates" },
            { id: "orschedule", label: "OR Schedule" },
            { id: "history", label: "History" },
            { id: "sendsms", label: "Send SMS" },
            { id: "emr", label: "Switch to EMR" },
            { id: "printdoc", label: "Print Document" },
            { id: "forcebook", label: "Force Book" }
        ];

        $scope.getSchedulerSource = function (appointments) {
            if (!appointments) {
                appointments = [];
            }

            // prepare the data
            var source = {
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
                    { name: 'actualdata', type: 'string' }
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
                showLegend: true,
                editDialog: false,
                toolbarHeight: 35,
                enableHover: true,
                columnsHeight: 30,
                rowsHeight: 27,
                touchRowsHeight: 27,
                /*created: function (args) {
                    args.instance.ensureAppointmentVisible('id1');
                },*/
                resources: {
                    colorScheme: "scheme05",
                    dataField: "calendar",
                    orientation: "horizontal",
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
                    remarks: 'remarks',
                    actualdata: 'actualdata'
                },
                views: [
                    { type: 'dayView', timeRuler: { scale: 'quarterHour', formatString: 'HH:mm' } },
                    { type: 'weekView', timeRuler: { scale: 'quarterHour', formatString: 'HH:mm' } },
                    { type: 'monthView', timeRuler: { scale: 'quarterHour', formatString: 'HH:mm' } }
                ],
                renderAppointment: function (data) {
                    if (data.view == "weekView" || data.view == "dayView") {
                        var displayStr = data.appointment.patientname + " / " + data.appointment.age + " / " + data.appointment.gender;
                        data.html = displayStr;
                    } else if (data.view == "monthView") {
                        var displayStr = data.appointment.appointmenttime + " / " + data.appointment.remarks;
                        data.html = displayStr;
                    }
                    return data;
                },
                contextMenuCreate: function (menu, settings) {
                    // if (menu.args) {
                    //     var source = menu.args.settings.source;
                    //     if (source) {
                    //         for (var idx in $scope.apptContextMenus) {
                    //             source.push($scope.apptContextMenus[idx]);
                    //         }
                    //     }
                    // }
                },
                contextMenuOpen: function (menu, appointment, event) {
                    // if (menu.args) {
                    //     menu.args.menu.jqxMenu('hideItem', 'editAppointment');
                    //     menu.args.menu.jqxMenu('hideItem', 'createAppointment');
                    //     var actionType = "";
                    //     if (!menu.args.appointment) {
                    //         actionType = "hideItem";
                    //     }
                    //     else {
                    //         actionType = "showItem";
                    //     }
                    //     for (var idx in $scope.apptContextMenus) {
                    //         var apptItem = $scope.apptContextMenus[idx];
                    //         menu.args.menu.jqxMenu(actionType, apptItem.id);
                    //     }
                    // }
                },
                contextMenuItemClick: function (menu, appointment, event) {
                    if (menu.args.appointment) {
                        var item = menu.args.item;
                        var appt = JSON.parse(menu.args.appointment.actualdata);
                        // switch (item.id) {
                        //     // case "open":
                        //     //     $scope.handleEvents('edit', { entity: appt })
                        //     //     return true;
                        //     // case "emr":
                        //     //     $scope.handleEvents('emr', { entity: appt })
                        //     //     return true;
                        //     // case "dem":
                        //     //     $scope.handleEvents('dem', { entity: appt })
                        //     //     return true;
                        //     // case "history":
                        //     //     $scope.handleEvents('history', { entity: appt })
                        //     //     return true;
                        // }
                    }
                }
            };

            $('#scheduler').on('bindingComplete', apptBindingComplete);
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

            if ($scope.currentfilter.appointmentdate && ($scope.currentfilter.DoctorId || $scope.currentfilter.ResourceId)) {
                var inputData = {
                    Params: [
                        { Key: 4, Value: utl.Formatter.getFilterDate($scope.currentfilter.appointmentdate) },
                    ],
                    PageContext: {
                        PageSize: 200,
                        PageNumber: 1
                    }
                };

                if ($scope.canShowPhysicianArea()) {
                    inputData.Params.push({ Key: 5, Value: $scope.currentfilter.DoctorId });
                } else if ($scope.canShowResourceArea()) {
                    inputData.Params.push({ Key: 6, Value: $scope.currentfilter.ResourceId });
                }

                var options = {
                    action: 'appointment/AppointmentSession/GetAppointmentSessions',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getAppointmentSessionsCallback
                };

                utl.Http.doAction(options);
            } else {
                $scope.refreshScheler($scope.appointmentList);
            }
        };


        //getList
        $scope.getListCallback = function (scope, res, options, hasError) {
            var items = res.Data;
            for (var idx in items) {
                var item = items[idx];
                item.Encounter = (item.Encounters && item.Encounters.length > 0) ? item.Encounters[0] : null;
                if (item.Encounter) {
                    if (item.Encounter.FinalBills && item.Encounter.FinalBills.length > 0) {
                        item.billed = 'YES';
                    } else {
                        item.billed = 'NO';
                    }
                }
            }

            vm.gridConfig.data = items;
            vm.gridConfig.pagerObj.totalItems = res.Data.length;
            $scope.prepareAppointments(res.Data);

            //$scope.getAppointmentSessions();
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentfilter.FacilityId },
                    { Key: 3, Value: $scope.currentfilter.DepartmentId },
                    { Key: 4, Value: $scope.currentfilter.AppointmentTypeId },
                    { Key: 5, Value: $scope.currentfilter.DoctorId },
                    { Key: 6, Value: $scope.currentfilter.ResourceId },
                    { Key: 7, Value: $scope.currentfilter.AppointmentStatusId },
                    { Key: 8, Value: utl.Formatter.getFilterDate($scope.currentfilter.appointmentdate) },
                    { Key: 15, Value: $scope.currentfilter.PatientId },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
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

        //Grid Actions
        $scope.addNew = function () {
            utl.Modal.open('app.appointment', {
                params: { id: 0, ct: $scope.currentcontext.ct },
                confirmCallback: $scope.getList
            });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'appointment/Appointment/DeleteAppointment',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.canShowAction = function (actionType, row) {
            if (actionType == 'emr') {
                if (row.entity.Patient.MRNTypeId == 1)
                    return false;
            }
            if (actionType == 'dem') {
                if (row.entity.Patient.MRNTypeId != 1)
                    return false;
            }
            if (actionType == 'call') {
                if (row.entity.AppointmentStatusId != 6)
                    return false;
            }
            if (actionType == 'cancel') {
                if (row.entity.AppointmentStatusId == 6 || row.entity.AppointmentStatusId == 11)
                    return false;
            }
            return true;
        }

        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'edit') {
                 var schsttime = row.entity.AppointmentDate+' '+row.entity.StartTime;
                 var schentime = row.entity.AppointmentDate+' '+row.entity.EndTime;
                $scope.confirmCallback({
                     ScheduleApptId: row.entity.Id,
                     ScheduleApptDispTime: row.entity.StartTime +' - '+row.entity.EndTime,
                     ScheduleApptStartTime: moment(schsttime).toDate(),
                     ScheduleApptEndTime: moment(schentime).toDate(),
                     ScheduleApptDoctorId: row.entity.DoctorId,
                     ScheduleApptDepartmentId: row.entity.DepartmentId
                 });
            }
        }

        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: patientId },
                confirmCallback: $scope.getList
            });
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "AppointmentDate",
                displayName: $translate.instant('appointment.appointment-list.appointmenttime.lbl'),
                cellTemplate: "<ngformatdate date-val='row.entity.AppointmentDate' time-val='row.entity.StartTime'></ngformatdate>"
            },
            {
                field: "Patient.FirstName",
                displayName: $translate.instant('appointment.appointment-list.patientname.lbl'),
                width: '20%',
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    "<span ng-if='row.entity.Patient.MRN'>{{row.entity.Patient.MRN}}&nbsp;/</span>" +
                    "<span ng-if='row.entity.Patient.Title && row.entity.Patient.Title.Description'>{{row.entity.Patient.Title.Description}}&nbsp;</span>" +
                    "<span>{{row.entity.Patient.FirstName}}</span>&nbsp;<span>{{row.entity.Patient.LastName}}</span>" +
                    "<span ng-if='row.entity.Patient.Age'>/&nbsp;{{row.entity.Patient.Age}}</span>" +
                    "</div>"
            },
            { field: "AppointmentCategory.Name", displayName: $translate.instant('appointment.appointment-list.category.lbl') },
            {
                field: "User.FirstName",
                displayName: $translate.instant('appointment.appointment-list.doctor.lbl'),
                width: '15%',
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                                                    <div ng-if='row.entity.ResourceMaster'>\
                                                        <span>{{row.entity.ResourceMaster.ResourceName}}</span>\
                                                    </div>\
                                                    <div ng-if='row.entity.User'>\
                                                        <span ng-if='row.entity.User.Title && row.entity.User.Title.Description'>{{row.entity.User.Title.Description}}&nbsp;</span>\
                                                        <span>{{row.entity.User.FirstName}}</span>&nbsp;<span>{{row.entity.User.LastName}}</span>\
                                                    </div>\
                                            </div>"
            },
            { field: "Remark.Remarks", displayName: $translate.instant('appointment.appointment-list.reason.lbl') },
            {
                field: "AppointmentStatus.Description",
                displayName: $translate.instant('appointment.appointment-list.status.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                                                    <div style='height:15px;width:20px;border-radius: 7px;margin-top: 4px;background:{{row.entity.AppointmentStatus.ColorCode}}' class='col-sm-2'></div>\
                                                &nbsp;<span>{{row.entity.AppointmentStatus.Description}}</span>\
                                            </div>"
            },
            { field: "AppointmentDisplays[0].TokenStatus.Description", displayName: $translate.instant('ordermanagement.token.status.lbl') },
            {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: 'conditionActionTemplate.html',
                actions: [
                    { actiontype: 'edit', display: 'common.editaction.lbl' },
                ]
            }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        //Code block for multirow selection starts

        vm.gridConfig.enableRowSelection = true;
        //vm.gridConfig.multiSelect = true;
        vm.gridConfig.enableFullRowSelection = true;
        vm.gridConfig.onRegisterApi = function (gridApi) {
            //set gridApi on scope
            $scope.gridApi = gridApi;
        };

        function getSelectionRows() {
            var currentSelection = $scope.gridApi.selection.getSelectedRows();
            return currentSelection;
        };

        $scope.checkoutPatientsCallback = function (scope, res, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        };

        $scope.batchCheckout = function () {
            //console.log('getSelectionRows');
            //console.log(getSelectionRows());
            var isValid = true;
            var selectedRows = getSelectionRows();
            var inputArr = [];
            for (var idx in selectedRows) {
                var item = selectedRows[idx];
                if (item.AppointmentStatusId != 6) {
                    isValid = false;
                    break;
                } else {
                    inputArr.push({ PatientId: item.PatientId, AppointmentId: item.Id });
                }
            }

            if (!isValid) {
                utl.Alert.showErrorMsg($translate.instant('appointment.appointment-list.ony-checkin-appts-msg.lbl'));
                return;
            }
            console.log(inputArr);

            var options = {
                action: 'appointment/patienttracker/CheckoutPatients',
                data: { Data: inputArr },
                type: 'post',
                onComplete: $scope.checkoutPatientsCallback
            };

            utl.Http.doAction(options);
        }

        //Appointment category area starts

        $scope.getAppointmentCategorysCallback = function (scope, res, options, hasError) {
            $scope.appointmentCategories = res.Data;
        };

        $scope.getAppointmentCategorys = function (pageNo) {

            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'appointment/AppointmentCategory/GetAppointmentCategorys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getAppointmentCategorysCallback
            };

            utl.Http.doAction(options);
        };

        $scope.appointmenttypechange = function () {
            $scope.currentfilter.DoctorId = '';
            $scope.currentfilter.ResourceId = '';
            $scope.getList();
        }

        //dept change
        $scope.deptChange = function () {
            $scope.currentfilter.DoctorId = '';
            $scope.currentfilter.ResourceId = '';

            $scope.getDoctorOrResources();
        }

        $scope.getDoctorOrResourcesCallback = function (scope, data, options, hasError) {
            if ($scope.canShowPhysicianArea()) {
                $scope.lookup.Doctor = data.Doctor;
            } else if ($scope.canShowResourceArea()) {
                $scope.lookup.Resource = data.Resource;
            }
        }
        $scope.getDoctorOrResources = function () {
            var inputData = [];

            if ($scope.canShowPhysicianArea()) {
                inputData.push({ Key: "Doctor", Request: { Params: [{ Key: 6, Value: $scope.currentfilter.DepartmentId }] } });
            } else if ($scope.canShowResourceArea()) {
                inputData.push({ Key: "Resource", Request: { Params: [{ Key: 4, Value: $scope.currentfilter.DepartmentId }] } });
            }

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getDoctorOrResourcesCallback
            };
            utl.Http.doAction(options);
        }


        //Appointment category area ends
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            setDefaults();

            $scope.getList();
            $scope.getAppointmentCategorys();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "Department" },
                { "Key": "AppointmentType" },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "Resource" },
                { "Key": "AppointmentStatus", Default: false },
                { "Key": "Referral" },
                { "Key": "VisitType" },
                { "Key": "Priority" },
                { "Key": "AppointmentCategory" }
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.initLookup();


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

        $scope.prepareAppointmentSessions = function (apptSession) {
            $scope.appointmentSessionList.splice(0, $scope.appointmentSessionList.length);
            if (apptSession) {
                //$scope.currentcontext.slotType = $scope.slotMap[apptSession.SlotDuration] ? $scope.slotMap[apptSession.SlotDuration] : $scope.currentcontext.slotType;

                var slots = [];
                var isHoliday = false;
                if (new Date(apptSession.HolidayFrom) <= new Date($scope.currentfilter.appointmentdate)
                    && new Date($scope.currentfilter.appointmentdate) <= new Date(apptSession.HolidayTo)) {
                    isHoliday = true;
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

                    var apptStart = utl.Formatter.getDateStringForAppointment($scope.currentfilter.appointmentdate) + " " + item.start;
                    var apptEnd = utl.Formatter.getDateStringForAppointment($scope.currentfilter.appointmentdate) + " " + item.end;

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

                    if (!isAppointmentExists(appt, apptSession)) {

                        if (apptSession.User && apptSession.User.FirstName) {
                            appt.calendar = apptSession.User.FirstName;
                        } else if (apptSession.ResourceMaster && apptSession.ResourceMaster.ResourceName) {
                            appt.calendar = apptSession.ResourceMaster.ResourceName;
                        }
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

        function isAppointmentExists(apptSlot, apptSession) {
            var result = false;
            for (var idx in $scope.appointmentList) {
                var item = $scope.appointmentList[idx];
                if (utl.Formatter.getDateTimeStringForAppointment(item.start) == utl.Formatter.getDateTimeStringForAppointment(apptSlot.start) &&
                    utl.Formatter.getDateTimeStringForAppointment(item.end) == utl.Formatter.getDateTimeStringForAppointment(apptSlot.end) &&
                    (($scope.canShowPhysicianArea() && apptSession.DoctorId == item.DoctorId) ||
                        ($scope.canShowResourceArea() && apptSession.ResourceId == item.ResourceId)
                    )
                ) {
                    result = true;
                }
            }
            return result;
        }

        // Calendar related code
        $scope.prepareAppointments = function (items) {
            $scope.appointmentList.splice(0, $scope.appointmentList.length);
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
                appt.actualdata = JSON.stringify(item);
                appt.start = moment(apptStart).toDate();
                appt.end = moment(apptEnd).toDate();
                //appt.readonly = true;

                //appt.background = item.AppointmentCategory.Color;
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

                $scope.appointmentList.push(appt);
            }

            $scope.refreshScheler($scope.appointmentList);
        }

    }

    regschapptListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig','$filter', '$timeout'];

})();