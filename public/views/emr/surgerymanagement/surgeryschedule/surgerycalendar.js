(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('surgeryCalendarController', surgeryCalendarController);

    function surgeryCalendarController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout, $filter) {
        var vm = this;
        // angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));

        vm.appointment = {
            ShowCalendar: false
        };

        $scope.appointmentList = [];
        $scope.appointmentSessionList = [];

        $scope.toggleView = function () {
            vm.appointment.ShowCalendar = !vm.appointment.ShowCalendar;
        }

        if ($stateParams.iShowCalendar) {
            $scope.toggleView();
        }

        $scope.currentcontext = {
            ct: ''
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.currentfilter = {
            FacilityId: parseInt(utl.Session.getCurrentFacilityId()),
            DepartmentId: -1,
            AppointmentTypeId: -1,
            DoctorId: '',
            AppointmentStatusId: 2,
            appointmentdate: utl.Formatter.getCurrentDate(),
            fromdate: utl.Formatter.getCurrentDate(),
            todate: utl.Formatter.getCurrentDate(),
            MRN: ''
        };

        $scope.currentcontext.ct = $stateParams.ct;

        if (utl.Session.getUserTypeId() == 2) // 2=> Physician
        {
            $scope.currentfilter.DoctorId = utl.Session.getCurrentUserId().toString();
        }

        $scope.opd_dashboard = function () {
            $state.go('app.opddashboard');
        }

        $('#myModal').hide();
        $scope.showprocessflow = function () {
            $('#myModal').show();
        }

        $scope.hideprocessflow = function () {
            $('#myModal').hide();
        }
        //Dynamic form starts
        function initDynamicForm() {
            $scope.advancedfilterDefault = {
                From: '',
                To: '',
                AppointmentCategoryId: -1,
                VisitTypeId: -1,
                PriorityId: -1,
                ReferralId: -1
            };
            $scope.backtoList = function () {
                $state.go('app.frontdashboard');
            }
            $scope.advancedfilter = JSON.parse(JSON.stringify($scope.advancedfilterDefault));

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [{
                    type: 'date',
                    translate: 'appointment.appointment-list.filter_apptfrom.lbl',
                    model: 'From',
                    position: {
                        r: 0,
                        c: 0
                    }
                },
                {
                    type: 'date',
                    translate: 'appointment.appointment-list.filter_apptto.lbl',
                    model: 'To',
                    position: {
                        r: 0,
                        c: 1
                    }
                },
                {
                    type: 'select',
                    translate: 'appointment.appointment-list.filter_category.lbl',
                    model: 'AppointmentCategoryId',
                    options: $scope.lookup.AppointmentCategory,
                    position: {
                        r: 1,
                        c: 0
                    }
                },
                {
                    type: 'select',
                    translate: 'appointment.appointment-list.filter_visittype.lbl',
                    model: 'VisitTypeId',
                    options: $scope.lookup.VisitType,
                    position: {
                        r: 1,
                        c: 1
                    }
                },
                {
                    type: 'select',
                    translate: 'appointment.appointment-list.filter_priority.lbl',
                    model: 'PriorityId',
                    options: $scope.lookup.Priority,
                    position: {
                        r: 2,
                        c: 0
                    }
                },
                {
                    type: 'select',
                    translate: 'appointment.appointment-list.filter_referredby.lbl',
                    model: 'ReferralId',
                    options: $scope.lookup.Referral,
                    position: {
                        r: 2,
                        c: 1
                    }
                }
                ],
                actions: [{
                    type: 'apply',
                    translate: 'common.applyaction.lbl',
                    cls: 'btn-primary'
                },
                {
                    type: 'reset',
                    translate: 'common.resetaction.lbl',
                    cls: 'btn-danger'
                }
                ]
            };
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
            // var scheduledStautsId = utl.Lookup.getDefault($scope.lookup.AppointmentStatus, 'Scheduled');
            // var checkedInStatusId = utl.Lookup.getDefault($scope.lookup.AppointmentStatus, 'Checked In');
            // $scope.currentfilter.AppointmentStatusId = scheduledStautsId + "," + checkedInStatusId;
            //Setting default status filters ends
            $scope.doctorFilterChange();
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
        $scope.apptContextMenus = [{
            id: "open",
            label: "Edit Appointment"
        },
        {
            id: "dem",
            label: "Demographics"
        },
        {
            id: "estimates",
            label: "Estimates"
        },
        {
            id: "orschedule",
            label: "OR Schedule"
        },
        {
            id: "history",
            label: "History"
        },
        {
            id: "sendsms",
            label: "Send SMS"
        },
        {
            id: "emr",
            label: "Switch to EMR"
        },
        {
            id: "printdoc",
            label: "Print Document"
        },
        {
            id: "forcebook",
            label: "Force Book"
        }
        ];

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
                    name: 'readonly',
                    type: 'bool'
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
                {
                    name: 'patientname',
                    type: 'string'
                },
                {
                    name: 'mrn',
                    type: 'string'
                },
                {
                    name: 'age',
                    type: 'string'
                },
                {
                    name: 'gender',
                    type: 'string'
                },
                {
                    name: 'appointmenttime',
                    type: 'string'
                },
                {
                    name: 'remarks',
                    type: 'string'
                },
                {
                    name: 'actualdata',
                    type: 'string'
                }
                ],
                id: 'id',
                localData: appointments
            };
            return source;
        }

        $scope.refreshScheler = function (appts) {

            var source = $scope.getSchedulerSource(appts);

            var calendarDate = new Date();
            if ($scope.currentfilter.appointmentdate) {
                calendarDate = utl.Formatter.getDate($scope.currentfilter.appointmentdate);
            }
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
                    isholiday: "isholiday",
                    patientname: "patientname",
                    mrn: 'mrn',
                    age: 'age',
                    gender: 'gender',
                    appointmenttime: 'appointmenttime',
                    remarks: 'remarks',
                    actualdata: 'actualdata'
                },
                views: [{
                    type: 'dayView',
                    timeRuler: {
                        scale: 'quarterHour',
                        formatString: 'HH:mm'
                    }
                },
                {
                    type: 'weekView',
                    timeRuler: {
                        scale: 'quarterHour',
                        formatString: 'HH:mm'
                    }
                },
                {
                    type: 'monthView',
                    timeRuler: {
                        scale: 'quarterHour',
                        formatString: 'HH:mm'
                    }
                }
                ],
                renderAppointment: function (data) {
                    if (data.view == "weekView" || data.view == "dayView") {
                        if (data.appointment.patientname) {
                            var displayStr = data.appointment.patientname + " / " + data.appointment.age + " / " + data.appointment.gender;
                            data.html = displayStr;
                        }
                    } else if (data.view == "monthView") {
                        if (data.appointment.appointmenttime) {
                            var displayStr = data.appointment.appointmenttime + " / " + data.appointment.remarks;
                            data.html = displayStr;
                        }
                    }
                    return data;
                },
                contextMenuCreate: function (menu, settings) {
                    if (menu.args) {
                        var source = menu.args.settings.source;
                        if (source) {
                            for (var idx in $scope.apptContextMenus) {
                                source.push($scope.apptContextMenus[idx]);
                            }

                        }
                    }
                },
                contextMenuOpen: function (menu, appointment, event) {
                    if (menu.args) {
                        menu.args.menu.jqxMenu('hideItem', 'editAppointment');
                        menu.args.menu.jqxMenu('hideItem', 'createAppointment');

                        var actionType = "";
                        if (!menu.args.appointment) {
                            actionType = "hideItem";
                        } else {
                            actionType = "showItem";
                        }

                        for (var idx in $scope.apptContextMenus) {
                            var apptItem = $scope.apptContextMenus[idx];
                            menu.args.menu.jqxMenu(actionType, apptItem.id);
                        }
                    }
                },
                contextMenuItemClick: function (menu, appointment, event) {
                    if (menu.args.appointment) {
                        var item = menu.args.item;
                        var appt = JSON.parse(menu.args.appointment.actualdata);
                        switch (item.id) {
                            case "open":
                                $scope.handleEvents('edit', {
                                    entity: appt
                                })
                                return true;
                            case "emr":
                                $scope.handleEvents('emr', {
                                    entity: appt
                                })
                                return true;
                            case "dem":
                                $scope.handleEvents('dem', {
                                    entity: appt
                                })
                                return true;
                            case "history":
                                $scope.handleEvents('history', {
                                    entity: appt
                                })
                                return true;
                        }
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
                    Params: [{
                        Key: 4,
                        Value: utl.Formatter.getFilterDate($scope.currentfilter.appointmentdate)
                    },],
                    PageContext: {
                        PageSize: 200,
                        PageNumber: 1
                    }
                };

                if ($scope.canShowPhysicianArea()) {
                    inputData.Params.push({
                        Key: 5,
                        Value: $scope.currentfilter.DoctorId
                    });
                } else if ($scope.canShowResourceArea()) {
                    inputData.Params.push({
                        Key: 6,
                        Value: $scope.currentfilter.ResourceId
                    });
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
                    if (item.Encounter.IsBillCompleted) {
                        item.billed = 'YES';
                    } else {
                        item.billed = 'NO';
                    }
                }
            }

            vm.gridConfig.data = items;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            // $scope.prepareAppointments(res.Data);

            // $scope.getAppointmentSessions();
        };

        $scope.getList = function () {
            if ($scope.advancedfilter.From || $scope.advancedfilter.To) {
                $scope.currentfilter.appointmentdate = '';
            }

            if (!$scope.currentfilter.appointmentdate) return;
            var From = $filter('date')($scope.currentfilter.fromdate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.todate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 3,
                    Value: $scope.currentfilter.DepartmentId
                },
                {
                    Key: 4,
                    Value: $scope.currentfilter.AppointmentTypeId
                },
                {
                    Key: 5,
                    Value: $scope.currentfilter.DoctorId
                },
                {
                    Key: 15,
                    Value: $scope.currentfilter.PatientId
                },
                {
                    Key: 6,
                    Value: $scope.currentfilter.ResourceId
                },
                {
                    Key: 7,
                    Value: $scope.currentfilter.AppointmentStatusId
                },
                // {
                //     Key: 8,
                //     Value: utl.Formatter.getFilterDate($scope.currentfilter.appointmentdate)
                // },
                {
                    Key: 9,
                    Value: From
                },
                {
                    Key: 10,
                    Value: To
                },
                {
                    Key: 11,
                    Value: $scope.advancedfilter.AppointmentCategoryId
                },
                {
                    Key: 12,
                    Value: $scope.advancedfilter.VisitTypeId
                },
                {
                    Key: 13,
                    Value: $scope.advancedfilter.PriorityId
                },
                {
                    Key: 14,
                    Value: $scope.advancedfilter.ReferralId
                },
                {
                    Key: 17,
                    Value: $scope.currentfilter.Mobile
                },
                {
                    Key: 16,
                    Value: $scope.currentfilter.MRN
                }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'appointment/Appointment/GetAppointmentswithoutDetail',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions
        // $scope.addNew = function () {
        //     utl.Modal.open('app.usertab.general', {
        //         params: { id: 0, ct: $scope.currentcontext.ct },
        //         confirmCallback: $scope.getList
        //     });
        // }
        $scope.addNew = function () {
            $state.go('app.appointmentstab.details', {
                id: 0
            });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'appointment/Appointment/DeleteAppointment',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.canShowAction = function (actionType, row) {
            if (actionType == 'emr') {
                if (entity.Patient.MRNTypeId == 1)
                    return false;
            }
            if (actionType == 'dem') {
                if (entity.Patient.MRNTypeId != 1)
                    return false;
            }
            if (actionType == 'call') {
                if (entity.AppointmentStatusId != 6)
                    return false;
            }
            if (actionType == 'cancel') {
                if (entity.AppointmentStatusId == 6 || entity.AppointmentStatusId == 11)
                    return false;
            }
            return true;
        }

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                $state.go('app.appointmentstab.details', {
                    id: entity.Id
                });
                // utl.Modal.open('app.appointment', {
                //     params: {
                //         id: entity.Id,
                //         ct: $scope.currentcontext.ct
                //     },
                //     confirmCallback: $scope.getList
                // });
            } else if (actionType == 'reschedule') {
                $state.go('app.appointmentstab.details', {
                    id: entity.Id,
                    isreschedule: true
                });
            } else if (actionType == 'cancel') {
                utl.Modal.open('app.appointment', {
                    params: {
                        id: entity.Id,
                        apptstatusid: 5,
                        ct: $scope.currentcontext.ct
                    },
                    confirmCallback: $scope.getList
                });
            } else if (actionType == 'emr') {
                utl.Session.setEMRPatientId(entity.PatientId);

                var patientEMRParams = {};
                if (entity.Encounter) {
                    patientEMRParams.eid = entity.Encounter.EncounterId;
                }
                $state.go('patientemr.patientdashboard', patientEMRParams);
            } else if (actionType == 'dem') {
                $state.go('app.fullregistrationtab.basic', {
                    id: entity.PatientId,
                    pt: 'appt'
                });
            } else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(entity.PatientId);
            } else if (actionType == 'history') {
                utl.Modal.open('app.appointmenthistory', {
                    params: {
                        appointmentId: entity.Id,
                        ct: $scope.currentcontext.ct
                    },
                    confirmCallback: $scope.getList
                });
            } else if (actionType == 'viewhistory') {
                utl.Modal.open('app.viewhistory', {
                    params: {
                        appointmentId: entity.Id,
                        ct: $scope.currentcontext.ct,
                        pid: entity.PatientId,
                    },
                    confirmCallback: $scope.getList
                });
            } else if (actionType == 'call') {
                utl.Modal.open('app.appnmttoken', {
                    params: {
                        id: entity.Id,
                        pid: entity.PatientId,
                        eid: entity.Encounter.EncounterId,
                        doctid: entity.DoctorId,
                        room: entity.User.OPDRoomId,
                        locid: entity.User.QmsLocationId,
                        ct: $scope.currentcontext.ct
                    },
                    confirmCallback: $scope.getList
                });
            }
        }

        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: patientId
                },
                confirmCallback: $scope.getList
            });
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "AppointmentDate",
                displayName: $translate.instant('appointment.appointment-list.appointmenttime.lbl'),
                cellTemplate: "<ngformatdate date-val='entity.AppointmentDate' time-val='entity.StartTime'></ngformatdate>"
            },
            {
                field: "Patient.FirstName",
                displayName: $translate.instant('appointment.appointment-list.patientname.lbl'),
                width: '20%',
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    '<a ng-click="handleEvents(\'patientinfo\',entity)" uib-tooltip="{{entity.Patient.Title.Description}}&nbsp; .{{entity.Patient.FirstName}} / {{entity.Patient.MRN}}  / {{entity.Patient.Age}} / {{entity.Patient.Gender.Description}}" tooltip-placement="right" >' +
                    "<span ng-if='entity.Patient.MRN'>{{entity.Patient.MRN}}&nbsp;/</span>" +
                    "<span ng-if='entity.Patient.Title && entity.Patient.Title.Description'><b>{{entity.Patient.Title.Description}}</b>&nbsp;</span>" +
                    "<span>{{entity.Patient.FirstName}}</span>&nbsp;<span>{{entity.Patient.LastName}}</span>" +
                    "<span ng-if='entity.Patient.Age'>/&nbsp;{{entity.Patient.Age}}&nbsp;-Yrs</span>" +
                    "<span ng-if='entity.Patient.ApproxAgeDays'>/&nbsp;{{entity.Patient.ApproxAgeDays}}&nbsp;-Days</span>" +
                    "<span ng-if='entity.Patient.ApproxAgeMonths'>/&nbsp;{{entity.Patient.ApproxAgeMonths}}&nbsp;-Months</span>" +
                    "</a></div>"
            },
            {
                field: "Patient.Mobile",
                displayName: $translate.instant('Mobile')
            },
            {
                field: "AppointmentCategory.Name",
                displayName: $translate.instant('appointment.appointment-list.category.lbl')
            },
            {
                field: "Slot Time",
                displayName: $translate.instant('appointment.appointment-list.scheduleslot.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                             <span>{{entity.StartTime}}&nbsp;</span>\
                             <span>-&nbsp;</span>\
                             <span>{{entity.EndTime}}</span>\
                            </div>\</div>"
            },
            {
                field: "User.FirstName",
                displayName: $translate.instant('appointment.appointment-list.doctor.lbl'),
                width: '15%',
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                              <div ng-if='entity.User'>\
                               <span ng-if='entity.User.Title && entity.User.Title.Description'>{{entity.User.Title.Description}}&nbsp;</span>\
                               <span>{{entity.User.FirstName}}</span>&nbsp;<span>{{entity.User.LastName}}</span>\
                            </div>\</div>"
            },
            {
                field: "AppointmentStatus.Description",
                displayName: $translate.instant('appointment.appointment-list.status.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                                                    <div style='height:15px;width:20px;border-radius: 7px;margin-top: 1px;background:{{entity.AppointmentStatus.ColorCode}}' class='col-sm-2'></div>\
                                                &nbsp;<span>{{entity.AppointmentStatus.Description}}</span>\
                                            </div>"
            },
            {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                             <span class="grid-action" ng-click="handleEvents(\'edit\',entity)" ><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                              <span class="grid-action" ng-click="handleEvents(\'reschedule\',entity)" ng-show="entity.AppointmentStatusId==2 || entity.AppointmentStatusId==3 || entity.AppointmentStatusId==4"  uib-tooltip="Reschedule"tooltip-placement="bottom"><i class="fas fa-history"></i></span>\
                              <!--<span class="grid-action" ng-click="handleEvents(\'viewhistory\',entity)" ng-show="entity.AppointmentStatusId > = 1"  uib-tooltip="History" tooltip-placement="bottom"><i class="fas fa-history"></i></span>-->\
                       </div>',
                handleEvent: $scope.handleEvents,
                actions: []
            }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };
        // {
        //     field: "Remark.Remarks",
        //     displayName: $translate.instant('appointment.appointment-list.reason.lbl')
        // },
        // {
        //     field: "Encounter.AdmissionDate",
        //     displayName: $translate.instant('appointment.appointment-list.admissiondate.lbl'),
        //     cellTemplate: "<ngformatdate datetime-val='entity.Encounter.AdmissionDate'></ngformatdate>"
        // },
        // {
        //     field: "Encounter.VisitIdentifier",
        //     displayName: $translate.instant('appointment.appointment-list.visitid.lbl')
        // },
        // {
        //     field: "AppointmentDisplay[0].TokenNo",
        //     displayName: $translate.instant('ordermanagement.token.token.lbl'),
        //     cellTemplate: "<div class='ui-grid-cell-contents'>\
        //                                     <div style='color: #ff7508;font-size: medium;font-weight: 700;class='col-sm-2'><span>{{entity.AppointmentDisplays[0].TokenNo}}</span></div>\
        //                                 &nbsp;\
        //                             </div>"
        // },
        // {
        //     field: "Encounter.DischargeDate",
        //     displayName: $translate.instant('appointment.appointment-list.dischargedate.lbl'),
        //     cellTemplate: "<ngformatdate datetime-val='entity.Encounter.DischargeDate'></ngformatdate>"
        // },
        // {
        //     field: "billed",
        //     displayName: $translate.instant('appointment.appointment-list.billed.lbl')
        // },
        // {
        //     field: "AppointmentDisplays[0].TokenStatus.Description",
        //     displayName: $translate.instant('ordermanagement.token.status.lbl')
        // },

        // {
        //     field: "Id",
        //     displayName: $translate.instant('common.actions_col.lbl'),
        //     cellTemplate: 'conditionActionTemplate.html',
        //     handleEvent: $scope.handleEvents,
        //     actions: [
        //         { actiontype: 'edit', display: 'common.editaction.lbl' },
        //         { actiontype: 'call', display: 'ordermanagement.token.pagetitle.lbl' },
        //         { actiontype: 'cancel', display: 'common.cancelaction.lbl' },
        //         { actiontype: 'emr', display: 'appointment.appointment-list.emraction.lbl' },
        //         { actiontype: 'dem', display: 'appointment.appointment-list.demaction.lbl' }
        //     ]
        // }


        //Code block for multientity selection starts

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
                    inputArr.push({
                        PatientId: item.PatientId,
                        AppointmentId: item.Id
                    });
                }
            }

            if (!isValid) {
                utl.Alert.showErrorMsg($translate.instant('appointment.appointments-list.ony-checkin-appts-msg.lbl'));
                return;
            }
            console.log(inputArr);

            var options = {
                action: 'appointment/patienttracker/CheckoutPatients',
                data: {
                    Data: inputArr
                },
                type: 'post',
                onComplete: $scope.checkoutPatientsCallback
            };

            utl.Http.doAction(options);
        }
        //Code block for multirow selection ends

        $scope.doctorFilterChange = function () {
            var selectedDoctor = [];
            var doctorList = $scope.currentfilter.DoctorId.split(",");
            for (var idx in doctorList) {
                var doctorObj = utl.Lookup.getObject($scope.lookup.Doctor, doctorList[idx]);
                if (doctorObj) {
                    selectedDoctor.push(doctorObj.Text);
                }
            }
            $scope.currentcontext.selectedDoctor = selectedDoctor.toString();
            $scope.getList();
        };

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
                inputData.push({
                    Key: "Doctor",
                    Request: {
                        Params: [{
                            Key: 6,
                            Value: $scope.currentfilter.DepartmentId
                        }]
                    }
                });
            } else if ($scope.canShowResourceArea()) {
                inputData.push({
                    Key: "Resource",
                    Request: {
                        Params: [{
                            Key: 4,
                            Value: $scope.currentfilter.DepartmentId
                        }]
                    }
                });
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
            initDynamicForm();
            setDefaults();

            $scope.getList();
            // $scope.getAppointmentCategorys();
        }

        $scope.initLookup = function () {
            var inputData = [
            //     {
            //     "Key": "Facility"
            // },
            // {
            //     "Key": "Department"
            // },
            {
                "Key": "AppointmentType"
            },
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
                "Key": "Resource"
            },
            {
                "Key": "AppointmentStatus",
                // Default: false
            },
            // {
            //     "Key": "Referral"
            // },
            {
                "Key": "VisitType"
            },
            // {
            //     "Key": "Priority"
            // },
            {
                "Key": "AppointmentCategory"
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
                var isBreak = false;
                // if (new Date(apptSession.HolidayFrom) <= new Date($scope.currentfilter.appointmentdate)
                //     && new Date($scope.currentfilter.appointmentdate) <= new Date(apptSession.HolidayTo)) {
                //     isHoliday = true;
                // }
                try {
                    var dateformat = "YYYY-MM-DD";
                    var holidayFrom = new moment(moment(apptSession.HolidayFrom).format(dateformat));
                    var holidayTo = new moment(moment(apptSession.HolidayTo).format(dateformat));
                    var apptDate = new moment(moment($scope.currentfilter.appointmentdate).format(dateformat));
                    var issameoraft = apptDate.isSameOrAfter(holidayFrom);
                    var issameorbef = apptDate.isSameOrBefore(holidayTo);
                    if (issameoraft && issameorbef) {
                        isHoliday = true;
                    }
                } catch (ex) {
                    console.log(ex);
                }

                var Breakslots = [];
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



                if (isBreak) {
                    var dummySlotIndex = 0;
                    for (var idx in Breakslots) {
                        var item = Breakslots[idx];

                        var appt = {};

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

                        if (isBreak) {
                            appt.isholiday = true;
                            appt.description = "Break Time";
                            appt.subject = appt.description;
                            appt.background = 'blue';
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

                if (isHoliday) {
                    var dummySlotIndex = 0;
                    for (var idx in slots) {
                        var item = slots[idx];

                        var appt = {};

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

    surgeryCalendarController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout', '$filter'];

})();