(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('VirtualDashboardController', VirtualDashboardController);

    function VirtualDashboardController($rootScope, $scope, $timeout, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        $scope.currentcontext = {};
        $scope.currentfilter = {
            appointmentdate: utl.Formatter.getCurrentDate(),
            DoctorId: utl.Session.getCurrentUserId()
        }
        $scope.currentcontext.userid = utl.Session.getCurrentUserId();
        $scope.currentcontext.DoctorId = utl.Session.getCurrentUserId();
        $scope.currentcontext.FacilityId = utl.Session.getCurrentFacilityId();
        $scope.currentcontext.FromDate = utl.Formatter.getCurrentDate();
        $scope.VirtualCategory = [];
        $scope.TodayOrders = [];
        $scope.PendingOrders = [];
        $scope.CompleteOrders = [];
        $scope.CancelledOrders = [];
        $scope.appointmentList = [];
        $scope.apnmnts = [];
        $scope.Items = [];
        $scope.Items.TodayCount = '0';
        $scope.Items.PendingCount = '0';
        $scope.Items.CompletedCount = '0';
        $scope.Items.CancelledCount = '0';

        $scope.patientsecuritypin =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'patientsecuritypin');


        $scope.GetVirtualctgryimgCallback = function (scope, data, options, hasError) {
            var ctgryid = data.Id;
            var image = data.Image;
            for (var idx in $scope.VirtualCategory) {
                var item = $scope.VirtualCategory[idx];
                if (item.VirtualCategory.Id == ctgryid) {
                    item.Image = image;
                }
            }
        };

        $scope.GetVirtualctgryimg = function (item) {
            if (item.Imagepath) {
                var inputData = {
                    Id: item.Id,
                    Imagepath: item.Imagepath
                };
                var options = {
                    action: 'VirtualHealthcare/VirtualCategory/GetVirtualCategoryImage',
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.GetVirtualctgryimgCallback
                };
                utl.Http.doAction(options);
            }
        };

        function loadImages() {
            for (var idx in $scope.VirtualCategory) {
                var item = $scope.VirtualCategory[idx];
                if (item.VirtualCategory.Imagepath) {
                    var vcategory = item.VirtualCategory;
                    $scope.GetVirtualctgryimg(vcategory);
                }
            }
        }

        $scope.getUserCategoryCallback = function (scope, res, options, hasError) {
            for (var idx in res) {
                var item = res[idx];
                item.CategoryName = item.VirtualCategory.CategoryName;
                item.CategoryId = item.VirtualCategory.Id;
                item.ConsultancyTypeId = item.VirtualCategory.ConsultancyTypeId;
                $scope.VirtualCategory.push(item);
            }
            loadImages();
        };
        $scope.getUserCategory = function (pageNo) {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.currentcontext.userid
                }],
            };
            var options = {
                action: 'SystemSettings/UserCategoryMap/GetUserCategoryMaps',
                data: inputData,
                type: 'post',
                onComplete: $scope.getUserCategoryCallback
            };
            utl.Http.doAction(options);
        };


        $scope.getvOrdersCallback = function (scope, res, options, hasError) {
            for (var idx in res.Data) {
                var orderdata = res.Data[idx];
                if (orderdata.VirtualOrderStatusId == 1 || orderdata.VirtualOrderStatusId == 2 || orderdata.VirtualOrderStatusId == 3 || orderdata.VirtualOrderStatusId == 5) {
                    $scope.PendingOrders.push(orderdata);
                }
                if (orderdata.VirtualOrderStatusId == 6) {
                    $scope.CompleteOrders.push(orderdata);
                }
            }
        };

        $scope.getvOrders = function (pageNo) {
            var From = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00');
            var To = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59');

            var inputData = {
                Params: [{
                    Key: 10,
                    Value: From
                },
                {
                    Key: 11,
                    Value: To
                },
                {
                    Key: 12,
                    Value: utl.Session.getCurrentUserId()
                },
                ]
            }
            var options = {
                action: 'VirtualHealthcare/VirtualOrder/GetVirtualOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getvOrdersCallback
            };

            utl.Http.doAction(options);
        };

        $scope.doc_consultlist = function (item) {
            if (item.ConsultancyTypeId == 1) {
                $state.go('app.doctorconsultationtab.currentpatient-single', {
                    cInfoId: item.CategoryId
                })
            }
            if (item.ConsultancyTypeId == 2) {
                $state.go('app.serviceconsultationtab.currentpatient-single', {
                    cInfoId: item.CategoryId
                })
            }
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

            if ($scope.currentfilter.appointmentdate && ($scope.currentfilter.DoctorId)) {
                var inputData = {
                    Params: [{
                        Key: 4,
                        Value: utl.Formatter.getFilterDate($scope.currentfilter.appointmentdate)
                    },
                    {
                        Key: 5,
                        Value: utl.Session.getCurrentUserId()
                    }
                    ],
                    PageContext: {
                        PageSize: 200,
                        PageNumber: 1
                    }
                };


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
        $scope.getApptlistCallback = function (scope, res, options, hasError) {
            var items = res.Data;
            $scope.apnmnts = items;
            for (var adx in $scope.apnmnts) {
                var aptinfo = $scope.apnmnts[adx];
                if (aptinfo.AppointmentStatusId == 5) {
                    $scope.CancelledOrders.push(aptinfo);
                }
            }
            $scope.prepareAppointments(res.Data);
            $scope.getAppointmentSessions();
        };

        $scope.getApptlist = function () {
            if (!$scope.currentfilter.appointmentdate) return;

            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 4,
                    Value: $scope.currentfilter.AppointmentTypeId
                },
                {
                    Key: 5,
                    Value: utl.Session.getCurrentUserId()
                },
                // {
                //     Key: 7,
                //     Value: $scope.currentfilter.AppointmentStatusId
                // },
                {
                    Key: 8,
                    Value: utl.Formatter.getFilterDate($scope.currentfilter.appointmentdate)
                },
                ],
            };

            var options = {
                action: 'appointment/Appointment/GetAppointments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getApptlistCallback
            };

            utl.Http.doAction(options);
        };
        $scope.prepareAppointmentSessions = function (apptSession) {
            $scope.appointmentSessionList.splice(0, $scope.appointmentSessionList.length);
            if (apptSession) {
                //$scope.currentcontext.slotType = $scope.slotMap[apptSession.SlotDuration] ? $scope.slotMap[apptSession.SlotDuration] : $scope.currentcontext.slotType;

                var slots = [];
                var isHoliday = false;
                var isBreak = false;
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
                    appt.patientname = item.Patient.Title.Description + ' ' + appt.patientname;
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

        $scope.checkedinpatients = function () {
            $state.go('app.oppatienttab.mycheckin', {
                context: 'virtual'
            });
        }

        $scope.report = function () {
            $state.go('app.doctormisreport');
        }

        $scope.GetvirtualCount = function () {
            $scope.currentcontext.FromDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00');
            $scope.currentcontext.ToDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Data: {
                    Keys: [{
                        Key: 'virtualappointment'
                    },
                    {
                        Key: 'encdoctor'
                    }
                    ]
                },
                Attributes: $scope.currentcontext
            };

            var options = {
                action: 'SystemSettings/facilitydashboard/GetFacilityVirtualDashboards',
                data: inputData,
                type: 'post',
                onComplete: $scope.GetvirtualCountCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.GetvirtualCountCallBack = function (scope, res, options, hasError) {
            $scope.Items.TodayCount = res.virtualappointment.TodayCount || 0;
            $scope.Items.PendingCount = res.encdoctor.PendingCount || 0;
            $scope.Items.CompletedCount = res.encdoctor.CompletedCount || 0;
            $scope.Items.CancelledCount = res.virtualappointment.CancelledCount || 0;
        }

        function attentPatientCallback(scope, data, options, hasError) {
            if (options.data.Data.isvirtual == true) {
                utl.Session.setEMRPatientId(options.data.Data.PatientId);
                $state.go('patientemr.orderpatientrecords', {
                    eid: options.data.Data.eid,
                    pid: options.data.Data.PatientId,
                    oid: options.data.Data.oid
                });
            } else {
                utl.Session.setEMRPatientId(options.data.Data.PatientId);
                $state.go('patientemr.patientrecords', {
                    pid: options.data.Data.PatientId,
                    eid: options.data.Data.eid,
                    oid: options.data.Data.oid
                });
            }
        };

        function attendPatientAfterConfirm(data) {
            var actionName = 'appointment/patienttracker/AttendPatient';
            var inputData = {
                PatientId: data.PatientId,
                AppointmentId: data.AppointmentId,
                oid: data.oid,
                isvirtual: data.isvirtual,
                eid: data.Encounter.Id
            }
            var options = {
                encounter: {},
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: attentPatientCallback
            };

            utl.Http.doAction(options);
        }

        $scope.getattendPatConf = function (itemFromModal) {
            if (itemFromModal.PatData.IsPinVerified) {
                attendPatientAfterConfirm({
                    PatientId: itemFromModal.EncData.PatientId,
                    AppointmentId: itemFromModal.EncData.AppointmentId,
                    Encounter: itemFromModal.EncData.Encounter,
                    oid: itemFromModal.EncData.VirtualOrderId,
                    isvirtual: itemFromModal.EncData.IsVirtualConsultation
                });
                // var confirmOptions = {
                //     headingKey: 'common.confirm-modal-header.lbl',
                //     messageKey: 'Do You Want to attend this Patient?',
                //     yesKey: 'common.yeskey.lbl',
                //     noKey: 'common.nokey.lbl',
                //     onSuccessMethod: attendPatientAfterConfirm({
                //         PatientId: itemFromModal.EncData.PatientId,
                //         AppointmentId: itemFromModal.EncData.AppointmentId,
                //         Encounter: itemFromModal.EncData.Encounter,
                //         oid: itemFromModal.EncData.VirtualOrderId,
                //         isvirtual: itemFromModal.EncData.IsVirtualConsultation
                //     })
                // }
                // utl.Dialog.confirmMessage(confirmOptions);
            }
        }

        $scope.getSecPin = function (encdata) {
            utl.Modal.open('app.patsecuritypincheck', {
                params: { pid: encdata.PatientId, eInfo: encdata },
                confirmCallback: $scope.getattendPatConf
            });
        }

        $scope.getSecEmrPin = function (encdata) {
            utl.Modal.open('app.patsecuritypincheck', {
                params: { pid: encdata.PatientId, eInfo: encdata },
                confirmCallback: $scope.gotoEMR
            });
        }

        $scope.gotoEMR = function (itemFromModal) {
            if (itemFromModal.PatData.IsPinVerified) {
                utl.Session.setEMRPatientId(itemFromModal.EncData.PatientId);
                $state.go('patientemr.orderpatientrecords', {
                    eid: itemFromModal.EncData.EncounterId,
                    pid: itemFromModal.EncData.PatientId,
                    oid: itemFromModal.EncData.VirtualOrderId
                });
            }
        }

        $scope.callAttendconfirm = function () {
            var encInfo = $scope.EncounterData;
            attendPatientAfterConfirm({
                PatientId: encInfo.PatientId,
                AppointmentId: encInfo.AppointmentId,
                Encounter: encInfo.Encounter,
                oid: encInfo.VirtualOrderId,
                isvirtual: encInfo.IsVirtualConsultation
            })
        }

        $scope.attendPatient = function (encInfo) {
            if (encInfo.EncounterDoctorStatus == 1) {
                if ($scope.patientsecuritypin == 1) {
                    $scope.getSecPin(encInfo);
                } else {
                    $scope.EncounterData = encInfo;
                    var confirmOptions = {
                        headingKey: 'common.confirm-modal-header.lbl',
                        messageKey: 'Do You Want to attend this Patient?',
                        yesKey: 'common.yeskey.lbl',
                        noKey: 'common.nokey.lbl',
                        onSuccessMethod: $scope.callAttendconfirm
                    };
                    utl.Dialog.confirmMessage(confirmOptions);
                }
            } else if (encInfo.EncounterDoctorStatus == 2 || encInfo.EncounterDoctorStatus == 3) {
                if (encInfo.IsVirtualConsultation == true) {
                    if ($scope.patientsecuritypin == 1) {
                        $scope.getSecEmrPin(encInfo);
                    } else {
                        utl.Session.setEMRPatientId(encInfo.PatientId);
                        $state.go('patientemr.orderpatientrecords', {
                            eid: encInfo.EncounterId,
                            pid: encInfo.PatientId,
                            aid: encInfo.AppointmentId,
                            oid: encInfo.VirtualOrderId
                        });
                    }
                } else {
                    utl.Session.setEMRPatientId(encInfo.PatientId);
                    $state.go('patientemr.patientrecords', {
                        eid: encInfo.EncounterId,
                        pid: encInfo.PatientId,
                        aid: encInfo.AppointmentId
                    });
                }
            }
        }

        $scope.getPendingPatCallback = function (scope, res, options, hasError) {
            $scope.TodayOrders = [];
            $scope.PendingOrders = [];
            for (var idx in res.Data) {
                var item = res.Data[idx];
                if (item.Patient) {
                    $scope.TodayOrders.push(item);
                    if (item.EncounterDoctorStatus == 1 || item.EncounterDoctorStatus == 2) {
                        $scope.PendingOrders.push(item);
                    }
                }
            }
        };
        $scope.getPendingPat = function () {
            var FrRegDt = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00');
            var ToRegDt = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: {
                        'AppointmentStatus': 6,
                        'My': true
                    }
                },
                {
                    Key: 10,
                    Value: utl.Session.getCurrentFacilityId()
                },
                {
                    Key: 20,
                    Value: 1
                },

                {
                    Key: 22,
                    Value: [FrRegDt, ToRegDt]
                }
                ]
            }
            var options = {
                action: 'Visit/EncounterDoctor/GetEncounterDoctors',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPendingPatCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getCompletedPatCallback = function (scope, res, options, hasError) {
            $scope.CompleteOrders = [];
            for (var idx in res.Data) {
                var item = res.Data[idx];
                if (item.Patient) {
                    if (item.EncounterDoctorStatus == 3) {
                        $scope.CompleteOrders.push(item);
                    }
                }
            }
        };
        $scope.getCompletedPat = function () {
            var FrRegDt = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00');
            var ToRegDt = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: {
                        'AppointmentStatus': 11,
                        'My': true
                    }
                },
                {
                    Key: 10,
                    Value: utl.Session.getCurrentFacilityId()
                },
                {
                    Key: 20,
                    Value: 1
                },

                {
                    Key: 22,
                    Value: [FrRegDt, ToRegDt]
                }
                ]
            }
            var options = {
                action: 'Visit/EncounterDoctor/GetEncounterDoctors',
                data: inputData,
                type: 'post',
                onComplete: $scope.getCompletedPatCallback
            };
            utl.Http.doAction(options);
        };

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

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        };

        $scope.getUserCategory();
        $scope.getPendingPat();
        $scope.getCompletedPat();
        // $scope.getvOrders();
        $scope.getApptlist();
        $scope.GetvirtualCount();

    }
    VirtualDashboardController.$inject = ['$rootScope', '$scope', '$timeout', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();