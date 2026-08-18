(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('doctorDashboardController', doctorDashboardController);

    function doctorDashboardController($rootScope, $scope, $timeout, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));
        $scope.items = [];
        $scope.currentfilter = { showFilterTab: false, }
        $scope.currentcontext = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            DoctorId: parseInt(utl.Session.getCurrentUserId()),
            FromDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00'),
            ToDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59'),
        }
        $scope.appointmentList = [];
        $scope.openFilterTab = function () {
            if ($scope.currentfilter.showFilterTab === true) {
                $scope.currentfilter.showFilterTab = false;
            } else {
                $scope.currentfilter.showFilterTab = true;
            }
        }
        /*doctor dashboard privileges*/

        $scope.currentcontext.CanOP_Patients = utl.Privilege.hasAccess('CanOP_Patients');
        $scope.currentcontext.CanIP_Patients = utl.Privilege.hasAccess('CanIP_Patients');
        $scope.currentcontext.CanAppointments = utl.Privilege.hasAccess('CanAppointments');
        $scope.currentcontext.CanSurgerySchedule = utl.Privilege.hasAccess('CanSurgerySchedule');
        $scope.currentcontext.CanReports = utl.Privilege.hasAccess('CanReports');

        // For React Bridge
        $scope.permissions = {
            OP_Patients: $scope.currentcontext.CanOP_Patients,
            IP_Patients: $scope.currentcontext.CanIP_Patients,
            Appointments: $scope.currentcontext.CanAppointments,
            SurgerySchedule: $scope.currentcontext.CanSurgerySchedule,
            Reports: $scope.currentcontext.CanReports
        };

        $scope.handleNavigation = function(stateName, params) {
            if(params) {
                $state.go(stateName, params);
            } else {
                $state.go(stateName);
            }
        };

        $scope.refreshTablesData = function() {
            $scope.tablesData = {
                TodayPendingList: $scope.TodayPendingList || [],
                TodayCompletedList: $scope.TodayCompletedList || [],
                outpatientlist: $scope.outpatientlist || [],
                admissionlist: $scope.admissionlist || [],
                dischargedlist: $scope.dischargedlist || [],
                ScheduleList: $scope.ScheduleList || [],
                ApnmntList: $scope.ApnmntList || [],
                LabCriticals: $scope.LabCriticals || [],
                RadCriticals: $scope.RadCriticals || []
            };
        };
        $scope.refreshTablesData();

        $scope.$watchGroup([
            'TodayPendingList',
            'TodayCompletedList',
            'outpatientlist',
            'admissionlist',
            'dischargedlist',
            'ScheduleList',
            'ApnmntList',
            'LabCriticals',
            'RadCriticals'
        ], function() {
            $scope.refreshTablesData();
        });

        $scope.Items = [];
        $scope.Items.appoinmentCount = '0';
        $scope.Items.checkedincount = '0';
        $scope.Items.inpatientcount = '0';
        $scope.Items.otschedulecount = '0';
        $scope.Items.otnotescount = '0';
        $scope.Items.dischargedcount = '0';
        $scope.Items.pendingdischargescount = '0';
        $scope.Items.labresultcount = '0';
        $scope.Items.imagingradiologycount = '0';
        $scope.Items.endoscopycount = '0';
        $scope.Items.abnormalcount = '0';
        $scope.Items.prescriptioncount = '0';
        $scope.Items.surgeryrequestcount = '0';
        $scope.Items.admissionrequestcount = '0';
        $scope.Items.physiotheraphycount = '0';
        // $scope.Items = [];
        $scope.Items.TodayCount = '0';
        $scope.Items.PendingCount = '0';
        $scope.Items.CompletedCount = '0';
        $scope.Items.CancelledCount = '0';




        $scope.getdoctDashboardCountCallBack = function (scope, res, options, hasError) {
            $scope.Items.appoinmentCount = res.appointment ? res.appointment.appoinmentCount : '0';
            $scope.Items.checkedincount = res.mycheckedin ? res.mycheckedin.checkedincount : '0';
            $scope.Items.inpatientcount = res.myinpatient ? res.myinpatient.inpatientcount : '0';
            $scope.Items.dischargedcount = res.myinpatient ? res.myinpatient.dischargedcount : '0';
            $scope.Items.otschedulecount = res.otschedule ? res.otschedule.otschedulecount : '0';
            $scope.Items.otnotescount = res.reviewnotes ? res.reviewnotes.otnotescount : '0';
            $scope.Items.pendingdischargescount = res.pendingdischarge ? res.pendingdischarge.pendingdischargescount : '0';
            $scope.Items.labresultcount = res.resultreview ? res.resultreview.labresultcount : '0';
            $scope.Items.imagingradiologycount = res.radiologyresult ? res.radiologyresult.imagingradiologycount : '0';
            $scope.Items.endoscopycount = res.endoscopyresults ? res.endoscopyresults.endoscopycount : '0';
            $scope.Items.abnormalcount = res.abnormalresults ? res.abnormalresults.abnormalcount : '0';
            $scope.Items.prescriptioncount = res.prescription ? res.prescription.prescriptioncount : '0';
            $scope.Items.surgeryrequestcount = res.surgeryrequest ? res.surgeryrequest.surgeryrequestcount : '0';
            $scope.Items.admissionrequestcount = res.admissionrequest ? res.admissionrequest.admissionrequestcount : '0';
            $scope.Items.physiotheraphycount = res.physiotheraphy ? res.physiotheraphy.physiotheraphycount : '0';


            if (!$scope.Items.appoinmentCount)
                $scope.Items.appoinmentCount = '0';
            if (!$scope.Items.checkedincount)
                $scope.Items.checkedincount = '0';
            if (!$scope.Items.inpatientcount)
                $scope.Items.inpatientcount = '0';
            if (!$scope.Items.dischargedcount)
                $scope.Items.dischargedcount = '0';
            if (!$scope.Items.otschedulecount)
                $scope.Items.otschedulecount = '0';
            if (!$scope.Items.otnotescount)
                $scope.Items.otnotescount = '0';
            if (!$scope.Items.pendingdischargescount)
                $scope.Items.pendingdischargescount = '0';
            if (!$scope.Items.labresultcount)
                $scope.Items.labresultcount = '0';
            if (!$scope.Items.imagingradiologycount)
                $scope.Items.imagingradiologycount = '0';
            if (!$scope.Items.endoscopycount)
                $scope.Items.endoscopycount = '0';
            if (!$scope.Items.abnormalcount)
                $scope.Items.abnormalcount = '0';
            if (!$scope.Items.prescriptioncount)
                $scope.Items.prescriptioncount = '0';
            if (!$scope.Items.surgeryrequestcount)
                $scope.Items.surgeryrequestcount = '0';
            if (!$scope.Items.admissionrequestcount)
                $scope.Items.admissionrequestcount = '0';
            if (!$scope.Items.physiotheraphycount)
                $scope.Items.physiotheraphycount = '0';
        };
        $scope.getddCount = function () {
            var inputData = {
                Data: {
                    Keys: [{
                        Key: 'appointment'
                    },
                    {
                        Key: 'mycheckedin'
                    },
                    {
                        Key: 'myinpatient'
                    },
                    {
                        Key: 'otschedule'
                    },
                        // {
                        //     Key: 'reviewnotes'
                        // },
                        // {
                        //     Key: 'pendingdischarge'
                        // },
                        // {
                        //     Key: 'resultreview'
                        // },
                        // {
                        //     Key: 'radiologyresult'
                        // },
                        // {
                        //     Key: 'endoscopyresults'
                        // },
                        // {
                        //     Key: 'abnormalresults'
                        // },
                        // {
                        //     Key: 'prescription'
                        // },
                        // {
                        //     Key: 'surgeryrequest'
                        // },
                        // {
                        //     Key: 'admissionrequest'
                        // },
                        // {
                        //     Key: 'physiotheraphy'
                        // },
                    ]
                },
                Attributes: $scope.currentcontext
            };

            var options = {
                action: 'Visit/DoctorDashboard/GetDashboardOptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getdoctDashboardCountCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.appoinment = function () {
            $state.go('app.appointmentstab.viewappoitment', {
                iShowCalendar: 1
            });
        }
        $scope.checkedinpatients = function () {
            $state.go('app.oppatienttab.mycheckin');
        }
        $scope.inpatients = function () {
            $state.go('app.inpatienttab.myinpatient');
        }
        $scope.surgeryschedules = function () {
            $state.go('app.surgerydoctorchedules');
        }
        $scope.reports = function () {
            $state.go('app.doctorreport');
        }
        $scope.dischargepatients = function () {
            $state.go('app.docdischargedpatient');
        }
        $scope.taskassignment = function () {
            $state.go('app.taskmanagementlist');
        }

        /* Side Menu close*/
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        /* Side Menu close*/

        $scope.getDischargeNoticedListCallBack = function (scope, res, options, hasError) {
            $scope.dischargedlist = [];
            for (var pdx in res.Data) {
                var dislist = res.Data[pdx];
                dislist.PatientName = '';
                if (dislist.Patient) {
                    dislist.PatientMrn = dislist.Patient.MRN;
                    if (dislist.Patient.Title) {
                        dislist.PatientName = dislist.Patient.Title.Description;
                    }
                    if (dislist.Patient.FirstName) {
                        dislist.PatientName += ' ' + dislist.Patient.FirstName;
                    }
                    if (dislist.Patient.LastName) {
                        dislist.PatientName += ' ' + dislist.Patient.LastName;
                    }
                }
                $scope.dischargedlist.push(dislist);
            }
        }

        $scope.getDischargeNoticedList = function () {
            var FromDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: 6
                },
                {
                    Key: 5,
                    Value: $scope.currentcontext.DoctorId
                },
                {
                    Key: 28,
                    Value: FromDate
                },
                {
                    Key: 29,
                    Value: ToDate
                }
                ],
                PageContext: {
                    PageSize: 3,
                    PageNumber: 1
                }
            };

            var options = {
                // action: 'Visit/Visit/GetEncounters',
                action: 'Visit/Visit/GetMinEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getDischargeNoticedListCallBack
            };
            utl.Http.doAction(options);
        };



        $scope.getAdmissionNoticedListCallBack = function (scope, res, options, hasError) {
            $scope.admissionlist = [];
            for (var pdx in res.Data) {
                var admlist = res.Data[pdx];
                admlist.PatientName = '';
                if (admlist.Patient) {
                    admlist.PatientMrn = admlist.Patient.MRN;
                    if (admlist.Patient.Title) {
                        admlist.PatientName = admlist.Patient.Title.Description;
                    }
                    if (admlist.Patient.FirstName) {
                        admlist.PatientName += ' ' + admlist.Patient.FirstName;
                    }
                    if (admlist.Patient.LastName) {
                        admlist.PatientName += ' ' + admlist.Patient.LastName;
                    }
                }
                $scope.admissionlist.push(admlist);
            }
        }

        $scope.getAdmissionNoticedList = function () {
            var FromDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: 2
                }, {
                    Key: 15,
                    Value: 2
                },
                {
                    Key: 5,
                    Value: $scope.currentcontext.DoctorId
                },
                {
                    Key: 17,
                    Value: FromDate
                },
                {
                    Key: 18,
                    Value: ToDate
                }
                ],
                PageContext: {
                    PageSize: 5,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getAdmissionNoticedListCallBack
            };
            utl.Http.doAction(options);
        };



        // $scope.getOTRegisterList = function() {
        //     var FromDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00');
        //     var ToDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59');
        //     var inputData = {
        //         Params: [{
        //                 Key: 5,
        //                 Value: $scope.currentcontext.DoctorId
        //             },
        //             {
        //                 Key: 16,
        //                 Value: FromDate
        //             },
        //             {
        //                 Key: 17,
        //                 Value: ToDate
        //             }

        //         ],
        //         PageContext: {
        //             PageSize: 3,
        //             PageNumber: 1
        //         }
        //     };

        //     var options = {
        //         action: 'OtManagement/SurgeryEntry/GetSurgeryEntrys',
        //         data: inputData,
        //         type: 'post',
        //         onComplete: $scope.getOTRegisterListCallback
        //     };

        //     utl.Http.doAction(options);
        // };

        // $scope.getOTRegisterListCallback = function(scope, res, options, hasError) {
        //     $scope.otregisterlist = res.Data;
        // };

        $scope.getOutPatientListCallBack = function (scope, res, options, hasError) {
            $scope.outpatientlist = [];
            for (var pdx in res.Data) {
                var oplist = res.Data[pdx];
                oplist.PatientName = '';
                if (oplist.Patient) {
                    oplist.PatientMrn = oplist.Patient.MRN;
                    if (oplist.Patient.Title) {
                        oplist.PatientName = oplist.Patient.Title.Description;
                    }
                    if (oplist.Patient.FirstName) {
                        oplist.PatientName += ' ' + oplist.Patient.FirstName;
                    }
                    if (oplist.Patient.LastName) {
                        oplist.PatientName += ' ' + oplist.Patient.LastName;
                    }
                }
                $scope.outpatientlist.push(oplist);
            }
        }

        $scope.getOutPatientList = function () {
            var FromDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [{
                    Key: 15,
                    Value: 1
                },
                {
                    Key: 5,
                    Value: $scope.currentcontext.DoctorId
                },
                {
                    Key: 17,
                    Value: FromDate
                },
                {
                    Key: 18,
                    Value: ToDate
                }
                ],
                PageContext: {
                    PageSize: 5,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getOutPatientListCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.tdyPendingPatListCallBack = function (scope, res, options, hasError) {
            $scope.TodayPendingList = [];
            for (var pdx in res.Data) {
                var pendinglist = res.Data[pdx];
                pendinglist.PatientName = '';
                if (pendinglist.Patient) {
                    pendinglist.PatientMrn = pendinglist.Patient.MRN;
                    if (pendinglist.Patient.Title) {
                        pendinglist.PatientName = pendinglist.Patient.Title.Description;
                    }
                    if (pendinglist.Patient.FirstName) {
                        pendinglist.PatientName += ' ' + pendinglist.Patient.FirstName;
                    }
                    if (pendinglist.Patient.LastName) {
                        pendinglist.PatientName += ' ' + pendinglist.Patient.LastName;
                    }
                }
                $scope.TodayPendingList.push(pendinglist);
            }

        }

        $scope.tdyPendingPatList = function () {
            var FromDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59');
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
                    Key: 21,
                    Value: 1
                },
                {
                    Key: 20,
                    Value: 1
                },
                {
                    Key: 22,
                    Value: [FromDate, ToDate]
                },
                {
                    Key: 32,//IsEmergencyVisit
                    Value: false
                },
                ],
                PageContext: {
                    PageSize: 5,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'Visit/EncounterDoctor/GetEncounterDoctors',
                // action: 'Visit/EncounterDoctor/GetMinEncounterDoctors',
                data: inputData,
                type: 'post',
                onComplete: $scope.tdyPendingPatListCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.tdyCompletedPatListCallBack = function (scope, res, options, hasError) {
            $scope.TodayCompletedList = [];
            for (var pdx in res.Data) {
                var completedlist = res.Data[pdx];
                completedlist.PatientName = '';
                if (completedlist.Patient) {
                    completedlist.PatientMrn = completedlist.Patient.MRN;
                    if (completedlist.Patient.Title) {
                        completedlist.PatientName = completedlist.Patient.Title.Description;
                    }
                    if (completedlist.Patient.FirstName) {
                        completedlist.PatientName += ' ' + completedlist.Patient.FirstName;
                    }
                    if (completedlist.Patient.LastName) {
                        completedlist.PatientName += ' ' + completedlist.Patient.LastName;
                    }
                }
                $scope.TodayCompletedList.push(completedlist);
            }
        }

        $scope.tdyCompletedPatList = function () {
            var FromDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59');
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
                    Key: 21,
                    Value: 2
                },
                {
                    Key: 20,
                    Value: 1
                },
                {
                    Key: 22,
                    Value: [FromDate, ToDate]
                }
                ],
                PageContext: {
                    PageSize: 5,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'Visit/EncounterDoctor/GetEncounterDoctors',
                // action: 'Visit/EncounterDoctor/GetMinEncounterDoctors',
                data: inputData,
                type: 'post',
                onComplete: $scope.tdyCompletedPatListCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.getSurgeryScheduleListCallback = function (scope, res, options, hasError) {
            $scope.ScheduleList = [];
            for (var pdx in res.Data) {
                var schedule = res.Data[pdx];
                schedule.PatientName = '';
                if (schedule.Patient) {
                    schedule.PatientMrn = schedule.Patient.MRN;
                    if (schedule.Patient.Title) {
                        schedule.PatientName = schedule.Patient.Title.Description;
                    }
                    if (schedule.Patient.FirstName) {
                        schedule.PatientName += ' ' + schedule.Patient.FirstName;
                    }
                    if (schedule.Patient.LastName) {
                        schedule.PatientName += ' ' + schedule.Patient.LastName;
                    }
                }
                $scope.ScheduleList.push(schedule);
            }
        };
        $scope.getSurgeryScheduleList = function () {
            var FromDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [
                    { Key: 7, Value: $scope.currentfilter.DoctorId },
                    { Key: 10, Value: FromDate },
                    { Key: 11, Value: ToDate },
                    { Key: 2, Value: 2 },

                ],
                PageContext: {
                    PageSize: 5,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'OtManagement/OtSchedule/GetOtSchedules',
                data: inputData,
                type: 'post',
                onComplete: $scope.getSurgeryScheduleListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getapnmntListCallback = function (scope, res, options, hasError) {
            $scope.ApnmntList = [];
            for (var pdx in res.Data) {
                var apnmnt = res.Data[pdx];
                apnmnt.PatientName = '';
                if (apnmnt.Patient) {
                    apnmnt.PatientMrn = apnmnt.Patient.MRN;
                    if (apnmnt.Patient.Title) {
                        apnmnt.PatientName = apnmnt.Patient.Title.Description;
                    }
                    if (apnmnt.Patient.FirstName) {
                        apnmnt.PatientName += ' ' + apnmnt.Patient.FirstName;
                    }
                    if (apnmnt.Patient.LastName) {
                        apnmnt.PatientName += ' ' + apnmnt.Patient.LastName;
                    }
                }
                $scope.ApnmntList.push(apnmnt);
            }
        };
        $scope.getapnmntList = function () {
            var FromDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [
                    { Key: 5, Value: utl.Session.getCurrentUserId() },
                    { Key: 2, Value: utl.Session.getCurrentFacilityId() },
                    { Key: 9, Value: FromDate },
                    { Key: 10, Value: ToDate },
                    { Key: 7, Value: 2 },

                ],
                PageContext: {
                    PageSize: 5,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'appointment/Appointment/GetAppointments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getapnmntListCallback
            };

            utl.Http.doAction(options);
        };

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
            var FromDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59');

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
                { Key: 9, Value: FromDate },
                { Key: 10, Value: ToDate },
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

        $scope.getLabcriticalslistCallback = function (scope, res, options, hasError) {
            $scope.LabCriticals = [];
            for (var pdx in res.Data) {
                var labcritics = res.Data[pdx];
                labcritics.PatientName = '';
                if (labcritics.Patient) {
                    labcritics.PatientMrn = labcritics.Patient.MRN;
                    if (labcritics.Patient.Title) {
                        labcritics.PatientName = labcritics.Patient.Title.Description;
                    }
                    if (labcritics.Patient.FirstName) {
                        labcritics.PatientName += ' ' + labcritics.Patient.FirstName;
                    }
                    if (labcritics.Patient.LastName) {
                        labcritics.PatientName += ' ' + labcritics.Patient.LastName;
                    }
                }
                $scope.LabCriticals.push(labcritics);
            }
        };
        $scope.getLabcriticalslist = function () {
            var FromDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [
                    { Key: 10, Value: utl.Session.getCurrentUserId() },
                    { Key: 11, Value: FromDate },
                    { Key: 12, Value: ToDate },
                    { Key: 6, Value: 1 },

                ],
                PageContext: {
                    PageSize: 5,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'lis/PatientCriticalOrder/GetPatientCriticalOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getLabcriticalslistCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getRadcriticalslistCallback = function (scope, res, options, hasError) {
            $scope.RadCriticals = [];
            for (var pdx in res.Data) {
                var radcritics = res.Data[pdx];
                radcritics.PatientName = '';
                if (radcritics.Patient) {
                    radcritics.PatientMrn = radcritics.Patient.MRN;
                    if (radcritics.Patient.Title) {
                        radcritics.PatientName = radcritics.Patient.Title.Description;
                    }
                    if (radcritics.Patient.FirstName) {
                        radcritics.PatientName += ' ' + radcritics.Patient.FirstName;
                    }
                    if (radcritics.Patient.LastName) {
                        radcritics.PatientName += ' ' + radcritics.Patient.LastName;
                    }
                }
                $scope.RadCriticals.push(radcritics);
            }
        };
        $scope.getRadcriticalslist = function () {
            var FromDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [
                    { Key: 10, Value: utl.Session.getCurrentUserId() },
                    { Key: 11, Value: FromDate },
                    { Key: 12, Value: ToDate },
                    { Key: 6, Value: 2 },

                ],
                PageContext: {
                    PageSize: 5,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'lis/PatientCriticalOrder/GetPatientCriticalOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getRadcriticalslistCallback
            };

            utl.Http.doAction(options);
        };

        $scope.createDummyAppt();
        $scope.getddCount();
        $scope.tdyPendingPatList();
        $scope.tdyCompletedPatList();
        $scope.getOutPatientList();
        $scope.getAdmissionNoticedList();
        $scope.getDischargeNoticedList();
        $scope.getSurgeryScheduleList();
        $scope.getapnmntList();
        $scope.getApptlist();
        $scope.GetvirtualCount();
        $scope.getLabcriticalslist();
        $scope.getRadcriticalslist();
        // $scope.getOTRegisterList();
        // $scope.GetFacilityDashboardOptions();
        // $scope.getTotalOTRegisterCount();
    }
    doctorDashboardController.$inject = ['$rootScope', '$scope', '$timeout', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();