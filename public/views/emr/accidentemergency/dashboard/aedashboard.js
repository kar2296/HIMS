(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('AEDashboardController', AEDashboardController);

    function AEDashboardController($rootScope, $scope, $timeout, $filter, $stateParams, $state, $translate, utl) {
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

        $scope.currentcontext.CanOP_Patients = utl.Privilege.hasAccess('CanOP_Patients');
        $scope.currentcontext.CanIP_Patients = utl.Privilege.hasAccess('CanIP_Patients');
        $scope.currentcontext.CanAppointments = utl.Privilege.hasAccess('CanAppointments');
        $scope.currentcontext.CanSurgerySchedule = utl.Privilege.hasAccess('CanSurgerySchedule');
        $scope.currentcontext.CanReports = utl.Privilege.hasAccess('CanReports');

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




        $scope.getdoctDashboardCountCallBack = function(scope, res, options, hasError) {
            $scope.Items.appoinmentCount = res.appointment.appoinmentCount;
            $scope.Items.checkedincount = res.mycheckedin.checkedincount;
            $scope.Items.inpatientcount = res.myinpatient.inpatientcount;
            $scope.Items.dischargedcount = res.myinpatient.dischargedcount;
            $scope.Items.otschedulecount = res.otschedule.otschedulecount;
            $scope.Items.otnotescount = res.reviewnotes.otnotescount;
            $scope.Items.pendingdischargescount = res.pendingdischarge.pendingdischargescount;
            $scope.Items.labresultcount = res.resultreview.labresultcount;
            $scope.Items.imagingradiologycount = res.radiologyresult.imagingradiologycount;
            $scope.Items.endoscopycount = res.endoscopyresults.endoscopycount;
            $scope.Items.abnormalcount = res.abnormalresults.abnormalcount;
            $scope.Items.prescriptioncount = res.prescription.prescriptioncount;
            $scope.Items.surgeryrequestcount = res.surgeryrequest.surgeryrequestcount;
            $scope.Items.admissionrequestcount = res.admissionrequest.admissionrequestcount;
            $scope.Items.physiotheraphycount = res.physiotheraphy.physiotheraphycount;


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
        $scope.getddCount = function() {
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

        $scope.emergencypatients = function() {
            $state.go('app.emergencypatienttab.emergencypatientlist');
        }
        $scope.daycarepatients = function() {
            $state.go('app.daycarepatienttab.daycarepatients');
        }
        $scope.reports = function() {
            $state.go('app.emergencypatientreport');
        }
        $timeout(function() {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        /* Side Menu close*/

        $scope.getDischargeNoticedListCallBack = function(scope, res, options, hasError) {
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

        $scope.getDischargeNoticedList = function() {
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
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getDischargeNoticedListCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.getAdmissionNoticedListCallBack = function(scope, res, options, hasError) {
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

        $scope.getAdmissionNoticedList = function() {
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

        $scope.getOutPatientListCallBack = function(scope, res, options, hasError) {
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

        $scope.getOutPatientList = function() {
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

        $scope.tdyPendingPatListCallBack = function(scope, res, options, hasError) {
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

        $scope.tdyPendingPatList = function() {
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
                    }
                ],
                PageContext: {
                    PageSize: 5,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'Visit/EncounterDoctor/GetEncounterDoctors',
                data: inputData,
                type: 'post',
                onComplete: $scope.tdyPendingPatListCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.tdyCompletedPatListCallBack = function(scope, res, options, hasError) {
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

        $scope.tdyCompletedPatList = function() {
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
                data: inputData,
                type: 'post',
                onComplete: $scope.tdyCompletedPatListCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.getSurgeryScheduleListCallback = function(scope, res, options, hasError) {
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
        $scope.getSurgeryScheduleList = function() {
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

        // $scope.getddCount();
        // $scope.tdyPendingPatList();
        // $scope.tdyCompletedPatList();
        // $scope.getOutPatientList();
        // $scope.getAdmissionNoticedList();
        // $scope.getDischargeNoticedList();
        // $scope.getSurgeryScheduleList();
        // $scope.getapnmntList();
        // $scope.getApptlist();
    }
    AEDashboardController.$inject = ['$rootScope', '$scope', '$timeout', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();