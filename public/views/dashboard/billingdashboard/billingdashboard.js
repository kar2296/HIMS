(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('BillingsDashboardController', BillingsDashboardController);

    function BillingsDashboardController($rootScope, $scope, $timeout, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        $scope.items = [];
        $scope.LatavailbedData = [];
        $scope.LatDiscrgData = [];
        $scope.LatDisclrData = [];
        $scope.currentcontext = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            DoctorId: parseInt(utl.Session.getCurrentUserId()),
            FromDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00'),
            ToDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59')
        }

        $scope.currentcontext.CanQuickRegistration = utl.Privilege.hasAccess('CanQuickRegistration');
        $scope.currentcontext.CanBilling_OPPatients = utl.Privilege.hasAccess('CanBilling_OPPatients');
        $scope.currentcontext.CanBilling_DirectBilling = utl.Privilege.hasAccess('CanBilling_DirectBilling');
        $scope.currentcontext.CanBillingReports = utl.Privilege.hasAccess('CanBillingReports');
        $scope.currentcontext.CanBilling_LabBilling = utl.Privilege.hasAccess('CanBilling_LabBilling');
        $scope.currentcontext.Canbilling_CurrentIpBilling = utl.Privilege.hasAccess('Canbilling_CurrentIpBilling');
        $scope.currentcontext.CanDischarged_IP_Billing = utl.Privilege.hasAccess('CanDischarged_IP_Billing');
        $scope.currentcontext.CanBilling_Admissions = utl.Privilege.hasAccess('CanBilling_Admissions');
        $scope.currentcontext.CanBilling_CurrentIPPatients = utl.Privilege.hasAccess('CanBilling_CurrentIPPatients');


        $scope.Items = [];
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

        $scope.Items.TotalAdmissionCount = '0';
        $scope.Items.DischargeCount = '0';
        $scope.Items.AdmittedCount = '0';
        $scope.Items.FitforDischargeCount = '0';
        $scope.Items.ClinicalDischargeCount = '0';
        $scope.Items.FinancialDischargeCount = '0';
        $scope.Items.TotalOccupancyCount = '0';




        $scope.custom_sort = function(a, b) {
            return new Date(b.DischargeDate).getTime() - new Date(a.DischargeDate).getTime();
        };
        $scope.getdoctDashboardCountCallBack = function(scope, res, options, hasError) {
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
        $scope.getddCount = function() {
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

        $scope.registration = function() {
            $state.go('app.quickregistration', { context: 'billing' });
        }
        $scope.dischargesipbilling = function() {
            // $state.go('app.checkedinpatients');
            $state.go('app.discharged-patients', { context: 'billing' });
        }
        $scope.opbilling = function() {
            $state.go('app.opbilling-list', { tp: 'OP', context: 'billing' });
        }
        $scope.directbilling = function() {
            $state.go('app.directbilling', { tp: 'DG', context: 'billing' });
        }
        $scope.labbilling = function() {
            $state.go('app.opbilling-list', { tp: 'DG', context: 'billing' });
        }
        $scope.admissions = function() {
            $state.go('app.admissions', { context: 'billing' });
        }
        $scope.ipbilling = function() {
            $state.go('app.inpatient-billing', { context: 'billing' });
        }
        $scope.ippatients = function() {
            $state.go('app.currentinpatients', { context: 'billing' });
        }
        $scope.reports = function() {
            $state.go('app.reports', { context: 'billing' });
        }
        $scope.billingreports = function() {
                $state.go('app.billingreportstab.opinvoicebillingreport', { context: 'billing' });
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
        $timeout(function() {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        /* Side Menu close*/

        $scope.getListCallback = function(scope, data, options, hasError) {
            $scope.AdmittedData = [];
            $scope.LatAdmsnData = [];
            $scope.AdmittedData = data.Data;
            for (var idx in $scope.AdmittedData) {
                var admInfo = $scope.AdmittedData[idx];
                admInfo.patientname = '';
                if (admInfo.Patient.Title)
                    admInfo.patientname = admInfo.Patient.Title.Description + ' .';
                if (admInfo.Patient.FirstName)
                    admInfo.patientname += ' ' + admInfo.Patient.FirstName;
                if (admInfo.Patient.LastName)
                    admInfo.patientname += ' ' + admInfo.Patient.LastName;

                admInfo.doctorname = '';
                if (admInfo.Doctor.Title)
                    admInfo.doctorname = admInfo.Doctor.Title.Description + ' .';
                if (admInfo.Doctor.FirstName)
                    admInfo.doctorname += ' ' + admInfo.Doctor.FirstName;
                if (admInfo.Doctor.LastName)
                    admInfo.doctorname += ' ' + admInfo.Doctor.LastName;

                admInfo.warddetails = '';
                if (admInfo.WardMaster)
                    admInfo.warddetails = admInfo.WardMaster.WardName + ' - ';
                if (admInfo.WardRoomMaster)
                    admInfo.warddetails += admInfo.WardRoomMaster.RoomNo + ' - ';
                if (admInfo.WardRoomBedMaster)
                    admInfo.warddetails += admInfo.WardRoomBedMaster.BedNo;

                $scope.LatAdmsnData.push(admInfo);
            }
            // $scope.patientname = $scope.AdmittedData.Patient.Title.Description + ' .' + $scope.AdmittedData.Patient.FirstName + ' ' + $scope.AdmittedData.Patient.MiddleName + ' ' + $scope.AdmittedData.Patient.LastName;
            // $scope.DoctorName = $scope.AdmittedData.Doctor.Title.Description + ' .' + $scope.AdmittedData.Doctor.FirstName + ' ' + $scope.AdmittedData.Doctor.MiddleName + ' ' + $scope.AdmittedData.Doctor.LastName;
        };

        $scope.getList = function() {
            // var fromDate = $filter('date')($scope.currentfilter.AdmissionDate, 'yyyy-MM-dd 00:00:00'); //"2017-04-27 00:00:00"
            // var toDate = $filter('date')($scope.currentfilter.AdmissionDate, 'yyyy-MM-dd 23:59:59'); //"2017-04-27 23:59:59"

            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentcontext.FacilityId
                    },

                    {
                        Key: 38,
                        Value: "2, 3, 4, 5"
                    },

                    {
                        Key: 17,
                        Value: $scope.currentcontext.FromDate
                    },
                    {
                        Key: 18,
                        Value: $scope.currentcontext.ToDate
                    }
                ],
                PageContext: {
                    PageSize: 6,
                    PageNumber: 1
                }

            };

            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.gettodaydischargeCallback = function(scope, data, options, hasError) {
            $scope.DiscrgData = [];
            if (data.Data.length > 0)
                data.Data.sort($scope.custom_sort);
            $scope.DiscrgData = data.Data;
            for (var idx in $scope.DiscrgData) {
                var Discrg = $scope.DiscrgData[idx];
                Discrg.patientname = '';
                if (Discrg.Patient.Title)
                    Discrg.patientname = Discrg.Patient.Title.Description + ' .';
                if (Discrg.Patient.FirstName)
                    Discrg.patientname += ' ' + Discrg.Patient.FirstName;
                if (Discrg.Patient.LastName)
                    Discrg.patientname += ' ' + Discrg.Patient.LastName;

                Discrg.doctorname = '';
                if (Discrg.Doctor.Title)
                    Discrg.doctorname = Discrg.Doctor.Title.Description + ' .';
                if (Discrg.Doctor.FirstName)
                    Discrg.doctorname += ' ' + Discrg.Doctor.FirstName;
                if (Discrg.Doctor.LastName)
                    Discrg.doctorname += ' ' + Discrg.Doctor.LastName;

                Discrg.warddetails = '';
                if (Discrg.WardMaster)
                    Discrg.warddetails = Discrg.WardMaster.WardName + ' - ';
                if (Discrg.WardRoomMaster)
                    Discrg.warddetails += Discrg.WardRoomMaster.RoomNo;
                if (Discrg.WardRoomBedMaster) + ' - '
                Discrg.warddetails += Discrg.WardRoomBedMaster.BedNo;

                $scope.LatDiscrgData.push(Discrg);
            }
        };
        $scope.gettodaydischarge = function() {

            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentcontext.FacilityId
                    },

                    {
                        Key: 3,
                        Value: 6
                    },

                    {
                        Key: 28,
                        Value: $scope.currentcontext.FromDate
                    },
                    {
                        Key: 29,
                        Value: $scope.currentcontext.ToDate
                    }
                ],
                PageContext: {
                    PageSize: 6,
                    PageNumber: 1
                }

            };

            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.gettodaydischargeCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getavailablebedsCallback = function(scope, data, options, hasError) {

            $scope.AvailbedData = [];

            $scope.AvailbedData = data.Data;
            var availableBeds = _.groupBy($scope.AvailbedData, 'WardId');
            for (var grpid in availableBeds) {
                $scope.warddetails = '';
                var bedDatas = availableBeds[grpid];
                if (bedDatas.length > 0) {
                    for (var idx in bedDatas) {
                        var availableData = bedDatas[idx];
                        availableData.WardDatas = '';
                        availableData.WardDataName = '';
                        availableData.WardDatasRoom = '';
                        availableData.Warddetails = '';
                        if (availableData.WardMaster && availableData.WardMaster.WardName != availableData.WardDataName) {
                            availableData.WardDataName = availableData.WardMaster.WardName + ' - ';
                        }
                        if (availableData.WardRoomMaster && availableData.WardMaster.WardDatasRoom != availableData.WardDatasRoom) {
                            availableData.WardDatasRoom = availableData.WardRoomMaster.RoomNo + ' - ';
                        }
                        if (availableData.BedNo) {
                            availableData.WardDatas += availableData.BedNo;
                        }
                        if (idx != bedDatas.length - 1) {
                            availableData.WardDatas += ','
                        }
                        // $scope.LatavailbedData.push(availableData.wardDatas);
                        $scope.warddetails = $scope.warddetails.concat(availableData.WardDatas);
                        availableData.Warddetails = availableData.WardDataName + availableData.WardDatasRoom + $scope.warddetails;
                        var beddata = {
                            availablebedinfo: availableData.Warddetails
                        }
                    }
                    $scope.LatavailbedData.push(beddata);
                }

                //             // }
                //             for (var idx in $scope.AvailbedData) {
                //                 var AvailbedData = $scope.AvailbedData[idx];
                //                 AvailbedData.warddetails = '';
                //                 if (AvailbedData.WardMaster.WardName)
                //                     AvailbedData.warddetails = AvailbedData.WardMaster.WardName + ' - ';
                //                 if (AvailbedData.WardRoomMaster.RoomNo)
                //                     AvailbedData.warddetails += AvailbedData.WardRoomMaster.RoomNo;
                //                 if (AvailbedData.BedNo) + ' - '
                //                 AvailbedData.warddetails += AvailbedData.BedNo;

                //                 $scope.LatavailbedData.push(AvailbedData);
            }
        };
        $scope.getavailablebeds = function() {

            var inputData = {
                Params: [{
                        Key: 9,
                        Value: 2
                    },
                    {
                        Key: 3,
                        Value: utl.Session.getCurrentFacilityId()
                    },
                    {
                        Key: 5,
                        Value: 1
                    }
                ],

                // {
                //     Key: 28,
                //     Value: $scope.currentcontext.FromDOD
                // },
                // {
                //     Key: 29,
                //     Value: $scope.currentcontext.ToDOD
                // }],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'GeneralMaster/WardRoomBedMaster/GetWardRoomBedMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getavailablebedsCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getdisclrCallback = function(scope, data, options, hasError) {
            $scope.DisclrData = [];

            $scope.DisclrData = data.Data;
            for (var idx in $scope.DisclrData) {
                var Disclr = $scope.DisclrData[idx];
                Disclr.patientname = '';
                if (Disclr.Patient.Title)
                    Disclr.patientname = Disclr.Patient.Title.Description + ' .';
                if (Disclr.Patient.FirstName)
                    Disclr.patientname += ' ' + Disclr.Patient.FirstName;
                if (Disclr.Patient.LastName)
                    Disclr.patientname += ' ' + Disclr.Patient.LastName;

                Disclr.doctorname = '';
                if (Disclr.Doctor.Title)
                    Disclr.doctorname = Disclr.Doctor.Title.Description + ' .';
                if (Disclr.Doctor.FirstName)
                    Disclr.doctorname += ' ' + Disclr.Doctor.FirstName;
                if (Disclr.Doctor.LastName)
                    Disclr.doctorname += ' ' + Disclr.Doctor.LastName;

                Disclr.warddetails = '';
                if (Disclr.WardMaster)
                    Disclr.warddetails = Disclr.WardMaster.WardName + ' - ';
                if (Disclr.WardRoomMaster)
                    Disclr.warddetails += Disclr.WardRoomMaster.RoomNo + ' - ';
                if (Disclr.WardRoomBedMaster)
                    Disclr.warddetails += Disclr.WardRoomBedMaster.BedNo;

                $scope.LatDisclrData.push(Disclr);
            }
        };
        $scope.getdisclr = function() {

            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentcontext.FacilityId
                    },

                    {
                        Key: 3,
                        Value: 4
                    },

                    {
                        Key: 28,
                        Value: $scope.currentcontext.FromDate
                    },
                    {
                        Key: 29,
                        Value: $scope.currentcontext.ToDate
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
                onComplete: $scope.getdisclrCallback
            };

            utl.Http.doAction(options);
        };
        $scope.GetFacilityDashboardOptions = function() {
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

        $scope.GetFacilityDashboardOptionsCallBack = function(scope, res, options, hasError) {
            $scope.FacilityInfo = res;
            if ($scope.FacilityInfo.encounter) {
                $scope.IPCounts = $scope.FacilityInfo.encounter;
                if ($scope.IPCounts.TotalAdmissionCount) {
                    $scope.Items.TotalAdmissionCount = $scope.IPCounts.TotalAdmissionCount;
                } else {
                    $scope.Items.TotalAdmissionCount = '0';
                }
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
                if ($scope.IPCounts.FitfordischargeCount) {
                    $scope.Items.FitforDischargeCount = $scope.IPCounts.FitfordischargeCount;
                } else {
                    $scope.Items.FitforDischargeCount = '0';
                }
                if ($scope.IPCounts.ClinicaldischargeCount) {
                    $scope.Items.ClinicalDischargeCount = $scope.IPCounts.ClinicaldischargeCount;
                } else {
                    $scope.Items.ClinicalDischargeCount = '0';
                }
                if ($scope.IPCounts.FinancedischargeCount) {
                    $scope.Items.FinancialDischargeCount = $scope.IPCounts.FinancedischargeCount;
                } else {
                    $scope.Items.FinancialDischargeCount = '0';
                }
            }
        }

        $scope.getoccupancyCountCallback = function(scope, res, options, hasError) {
            if (res.Data.length > 0) {
                $scope.Items.TotalOccupancyCount = res.Data.length;
            } else {
                $scope.Items.TotalOccupancyCount = '0';
            }

        };

        $scope.getoccupancyCount = function() {
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

        $scope.getddCount();
        $scope.GetFacilityDashboardOptions();

        $scope.getList();
        $scope.gettodaydischarge();
        $scope.getavailablebeds();
        $scope.getdisclr();
        $scope.getoccupancyCount();


    }
    BillingsDashboardController.$inject = ['$rootScope', '$scope', '$timeout', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();