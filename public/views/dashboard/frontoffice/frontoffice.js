(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('frontDashboardController', frontDashboardController);

    function frontDashboardController($rootScope, $scope, $timeout, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        $scope.items = {};
        $scope.currentcontext = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            DoctorId: parseInt(utl.Session.getCurrentUserId()),
            FromDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00'),
            ToDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59'),
        }

        $scope.currentcontext.CanRegistration = utl.Privilege.hasAccess('CanRegistration');
        $scope.currentcontext.CanAppointments = utl.Privilege.hasAccess('CanAppointments');
        $scope.currentcontext.CanOPbilling = utl.Privilege.hasAccess('CanOPbilling');
        $scope.currentcontext.CanDirectBilling = utl.Privilege.hasAccess('CanDirectBilling');
        $scope.currentcontext.CanCanLabBilling = utl.Privilege.hasAccess('CanLabBilling');
        $scope.currentcontext.CanAdmissions = utl.Privilege.hasAccess('CanAdmissions');
        $scope.currentcontext.CanBedTransfer = utl.Privilege.hasAccess('CanBedTransfer');
        $scope.currentcontext.CanCurrentIpPatients = utl.Privilege.hasAccess('CanCurrentIpPatients');
        $scope.currentcontext.CanFrontOfficeReports = utl.Privilege.hasAccess('CanFrontOfficeReports');

        // For React Bridge
        $scope.permissions = {
            Registration: $scope.HasAccess('FrontOfficeDashboard', 'Registration'),
            Appointments: $scope.HasAccess('FrontOfficeDashboard', 'Appointments'),
            OPbilling: $scope.HasAccess('FrontOfficeDashboard', 'OPbilling'),
            DirectBilling: $scope.HasAccess('FrontOfficeDashboard', 'DirectBilling'),
            LabBilling: $scope.HasAccess('FrontOfficeDashboard', 'LabBilling'),
            Admissions: $scope.HasAccess('FrontOfficeDashboard', 'Admissions'),
            BedTransfer: $scope.HasAccess('FrontOfficeDashboard', 'BedTransfer'),
            CurrentIpPatients: $scope.HasAccess('FrontOfficeDashboard', 'CurrentIpPatients'),
            FrontOfficeReports: $scope.HasAccess('FrontOfficeDashboard', 'FrontOfficeReports')
        };

        $scope.handleNavigation = function(stateName, params) {
            $timeout(function() {
                $state.go(stateName, params);
            });
        };

        // --- React Bridge ---
        Object.defineProperty(vm, 'reactProps', {
            get: function() {
                return {
                    items: $scope.Items,
                    permissions: $scope.permissions,
                    onNavigate: $scope.handleNavigation
                };
            }
        });
        // --------------------


        $scope.Items = {};
        $scope.Items.TodayCheckInCount = '0';
        $scope.Items.TodayScheduledCount = '0';
        $scope.Items.appoinmentCount = '0';
        $scope.Items.checkedincount = '0';
        $scope.Items.inpatientcount = '0';
        $scope.Items.otschedulecount = '0';
        $scope.Items.otnotescount = '0';
        $scope.Items.pendingdischargescount = '0';
        $scope.Items.labresultcount = '0';
        $scope.Items.imagingradiologycount = '0';
        $scope.Items.endoscopycount = '0';
        $scope.Items.abnormalcount = '0';
        $scope.Items.prescriptioncount = '0';
        $scope.Items.surgeryrequestcount = '0';
        $scope.Items.admissionrequestcount = '0';
        $scope.Items.physiotheraphycount = '0';
        $scope.Items.AdmittedCount = '0';
        $scope.Items.DischargeCount = '0';
        $scope.Items.RegistrationCount = '0';
        $scope.Items.OPVisitCount = '0';
        $scope.Items.TotalOccupancyCount = '0';
        $scope.Items.todayDischarge = 0;
        $scope.Items.PendingdischargeCount = '0';

        $scope.getDashboardCallback = function (scope, data, options, hasError) {
            $scope.Items.todayDischarge = data.Data.length;
        };

        $scope.getDashboard = function (val) {
            var FrmDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [{
                    Key: 1,
                    Value: utl.Session.getCurrentFacilityId()
                },
                {
                    Key: 17,
                    Value: FrmDate
                },
                {
                    Key: 18,
                    Value: ToDate
                },
                {
                    Key: 3,
                    Value: [4, 5]
                },
                ],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'Visit/Visit/GetMINIPPatientsBills',
                data: inputData,
                type: 'post',
                onComplete: $scope.getDashboardCallback
            };

            utl.Http.doAction(options);
        };
        $scope.prOccCount = function () {
            $scope.Items.PresentOccupancyCount = '0';
            $scope.Items.PresentOccupancyCount = ($scope.Items.TotalOccupancyCount || 0) - ($scope.Items.PendingdischargeCount || 0);
        }
        $scope.getoccupancyCountCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                $scope.Items.TotalOccupancyCount = res.Data.length;
            } else {
                $scope.Items.TotalOccupancyCount = '0';
            }
            $scope.prOccCount();
        };

        $scope.getoccupancyCount = function () {
            // $scope.currentcontext.FromDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 00:00:00');
            // $scope.currentcontext.ToDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [

                    {
                        Key: 2,
                        Value: 1
                    },
                    {
                        Key: 6,
                        Value: [2, 3, 4, 5]
                    },
                    {
                        Key: 9,
                        Value: $scope.currentcontext.FacilityId
                    },
                ],

            };

            var options = {
                action: 'IPManagement/BedOccupancyHistory/GetBedOccupancyHistorys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getoccupancyCountCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getdoctDashboardCountCallBack = function (scope, res, options, hasError) {
            $scope.Items.TodayCheckInCount = res.appointment.TodayCheckInCount;
            $scope.Items.TodayScheduledCount = res.appointment.TodayScheduledCount;
            $scope.Items.appoinmentCount = res.appointment.appoinmentCount;
            $scope.Items.checkedincount = res.mycheckedin.checkedincount;
            // $scope.Items.inpatientcount = res.myinpatient.inpatientcount;
            // $scope.Items.otschedulecount = res.otschedule.otschedulecount;
            // $scope.Items.otnotescount = res.reviewnotes.otnotescount;
            // $scope.Items.pendingdischargescount = res.pendingdischarge.pendingdischargescount;
            // $scope.Items.labresultcount = res.resultreview.labresultcount;
            // $scope.Items.imagingradiologycount = res.radiologyresult.imagingradiologycount;
            // $scope.Items.endoscopycount = res.endoscopyresults.endoscopycount;
            // $scope.Items.abnormalcount = res.abnormalresults.abnormalcount;
            // $scope.Items.prescriptioncount = res.prescription.prescriptioncount;
            // $scope.Items.surgeryrequestcount = res.surgeryrequest.surgeryrequestcount;
            // $scope.Items.admissionrequestcount = res.admissionrequest.admissionrequestcount;
            // $scope.Items.physiotheraphycount = res.physiotheraphy.physiotheraphycount;
            // $scope.Items.doctormedicalauditcount = res.doctormedicalauditcount.doctormedicalauditcount;


            if (!$scope.Items.TodayCheckInCount)
                $scope.Items.TodayCheckInCount = '0';
            if (!$scope.Items.TodayScheduledCount)
                $scope.Items.TodayScheduledCount = '0';
            if (!$scope.Items.appoinmentCount)
                $scope.Items.appoinmentCount = '0';
            if (!$scope.Items.checkedincount)
                $scope.Items.checkedincount = '0';
            if (!$scope.Items.inpatientcount)
                $scope.Items.inpatientcount = '0';
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
            if (!$scope.Items.doctormedicalauditcount)
                $scope.Items.doctormedicalauditcount = '0';
        };
        $scope.getddCount = function () {
            var inputData = {
                Data: {
                    Keys: [{
                        Key: 'appointment'
                    },
                    {
                        Key: 'mycheckedin'
                    }
                        // {
                        //     Key: 'doctormedicalauditcount'
                        // }
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

        $scope.registraion = function () {
            $state.go('app.regcumvisitwithbill', {
                context: 'frontoffice'
            });
        }
        $scope.appoinment = function () {
            // $state.go('app.checkedinpatients');
            $state.go('app.appointmentstab.details');
        }
        $scope.opbillings = function () {
            $state.go('app.opbilling-list', {
                tp: 'OP',
                context: 'frontoffice'
            });
        }
        $scope.directbilling = function () {
            $state.go('app.directbilling', {
                tp: 'DG',
                context: 'frontoffice'
            });
        }
        $scope.labbilling = function () {
            $state.go('app.opbilling-list', {
                tp: 'DG',
                context: 'frontoffice'
            });
        }
        $scope.admissions = function () {
            $state.go('app.admissions', {
                context: 'frontoffice'
            });
        }
        $scope.bedtransfer = function () {
            $state.go('app.bedtransfer-list', {
                context: 'frontoffice'
            });
        }
        $scope.ippatient = function () {
            $state.go('app.currentinpatients', {
                context: 'frontoffice'
            });
        }
        $scope.reports = function () {
            $state.go('app.ipopreportstab.inpatientreport', {
                context: 'frontoffice'
            });
        }
        // $scope.endoscopyresults = function () {
        //     $state.go('app.endoscopyresultreview');
        // }
        // $scope.leaveform = function () {
        //     $state.go('app.patientleaveform');
        // }
        // $scope.prescription = function () {
        //     $state.go('app.doctorprescription');
        // }
        // $scope.surgeryrequest = function () {
        //     $state.go('app.otrequests');
        // }
        // $scope.admissionrequest = function () {
        //     $state.go('app.admissionrequests');
        // }
        // $scope.physiotheraphy = function () {
        //     $state.go('app.physiotheraphytab.details');
        // }
        // $scope.doctorMedicalAudit = function () {
        //     $state.go('app.medicalauditemr');
        // }
        // $scope.medicalaudit = function () {
        //     $state.go('app.medicalaudit');
        // }
        /* Side Menu close*/
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        /* Side Menu close*/

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
                    PageSize: 3,
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

        $scope.getOutPatientListCallBack = function (scope, res, options, hasError) {
            $scope.outpatientlist = res.Data;
        }




        $scope.GetFacilityDashboardOptionsCallBack = function (scope, res, options, hasError) {
            $scope.FacilityInfo = res;
            if ($scope.FacilityInfo.encounter) {
                $scope.IPCounts = $scope.FacilityInfo.encounter;
                if ($scope.IPCounts.DischargeCount) {
                    $scope.Items.DischargeCount = $scope.IPCounts.DischargeCount;
                } else {
                    $scope.Items.DischargeCount = '0';
                }
                if ($scope.IPCounts.AdmissionCount) {
                    $scope.Items.AdmittedCount = $scope.IPCounts.AdmissionCount;
                } else {
                    $scope.Items.AdmittedCount = '0';
                }
                if ($scope.IPCounts.OPVisitCount) {
                    $scope.Items.OPVisitCount = $scope.IPCounts.OPVisitCount;
                } else {
                    $scope.Items.OPVisitCount = '0';
                }
                if ($scope.IPCounts.PendingdischargeCount) {
                    $scope.Items.PendingdischargeCount = $scope.IPCounts.PendingdischargeCount;
                } else {
                    $scope.Items.PendingdischargeCount = '0';
                }
            }
            if ($scope.FacilityInfo.patient) {
                if ($scope.FacilityInfo.patient.RegistrationCount) {
                    $scope.Items.RegistrationCount = $scope.FacilityInfo.patient.RegistrationCount;
                } else {
                    $scope.Items.RegistrationCount = '0';
                }
            }
            $scope.prOccCount();
        }
        $scope.GetFacilityDashboardOptions = function () {
            var inputData = {
                Data: {
                    Keys: [{
                        Key: 'encounter'
                    }, {
                        Key: 'patient'
                    },
                    {
                        Key: 'appointment'
                    },
                        // {
                        //     Key: 'newborn'
                        // }
                    ]
                },
                Attributes: $scope.currentcontext
            };

            var options = {
                action: 'SystemSettings/facilitydashboard/GetFacilityDashboardOptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.GetFacilityDashboardOptionsCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.getddCount();
        $scope.getDashboard();
        $scope.getoccupancyCount();
        $scope.GetFacilityDashboardOptions();
        $scope.getOutPatientList();
    }
    frontDashboardController.$inject = ['$rootScope', '$scope', '$timeout', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();