(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('MedicalmasterDashboardController', MedicalmasterDashboardController);

    function MedicalmasterDashboardController($rootScope, $scope, $timeout, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        $scope.items = [];
        $scope.currentcontext = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            DoctorId: parseInt(utl.Session.getCurrentUserId()),
            FromDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00'),
            ToDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59'),
        }
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


        $scope.currentcontext.CanAllergies = utl.Privilege.hasAccess('CanAllergies');
        $scope.currentcontext.CanComplaints = utl.Privilege.hasAccess('CanComplaints');
        $scope.currentcontext.CanDiagnosis = utl.Privilege.hasAccess('CanDiagnosis');
        $scope.currentcontext.CanProcedures = utl.Privilege.hasAccess('CanProcedures');
        $scope.currentcontext.CanVitalParameters = utl.Privilege.hasAccess('CanVitalParameters');
        $scope.currentcontext.CanDrugFrequencies = utl.Privilege.hasAccess('CanDrugFrequencies');
        $scope.currentcontext.CanTemplates = utl.Privilege.hasAccess('CanTemplates');
        $scope.currentcontext.CanTemplate_Screens = utl.Privilege.hasAccess('CanTemplate_Screens');
        $scope.currentcontext.CanTemplate_Tabs = utl.Privilege.hasAccess('CanTemplate_Tabs');
        $scope.currentcontext.CanTemplate_Parameters = utl.Privilege.hasAccess('CanTemplate_Parameters');
        $scope.currentcontext.CanFavorites = utl.Privilege.hasAccess('CanFavorites');
        $scope.currentcontext.CanABGMaster = utl.Privilege.hasAccess('CanABGMaster');
        $scope.currentcontext.CanDischarge_Summary_Templates = utl.Privilege.hasAccess('CanDischarge_Summary_Templates');

        // $scope.getdoctDashboardCountCallBack = function (scope, res, options, hasError) {
        //     $scope.Items.appoinmentCount = res.appointment.appoinmentCount;
        //     $scope.Items.checkedincount = res.mycheckedin.checkedincount;
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


        //     if (!$scope.Items.appoinmentCount)
        //         $scope.Items.appoinmentCount = '0';
        //     if (!$scope.Items.checkedincount)
        //         $scope.Items.checkedincount = '0';
        //     if (!$scope.Items.inpatientcount)
        //         $scope.Items.inpatientcount = '0';
        //     if (!$scope.Items.otschedulecount)
        //         $scope.Items.otschedulecount = '0';
        //     if (!$scope.Items.otnotescount)
        //         $scope.Items.otnotescount = '0';
        //     if (!$scope.Items.pendingdischargescount)
        //         $scope.Items.pendingdischargescount = '0';
        //     if (!$scope.Items.labresultcount)
        //         $scope.Items.labresultcount = '0';
        //     if (!$scope.Items.imagingradiologycount)
        //         $scope.Items.imagingradiologycount = '0';
        //     if (!$scope.Items.endoscopycount)
        //         $scope.Items.endoscopycount = '0';
        //     if (!$scope.Items.abnormalcount)
        //         $scope.Items.abnormalcount = '0';
        //     if (!$scope.Items.prescriptioncount)
        //         $scope.Items.prescriptioncount = '0';
        //     if (!$scope.Items.surgeryrequestcount)
        //         $scope.Items.surgeryrequestcount = '0';
        //     if (!$scope.Items.admissionrequestcount)
        //         $scope.Items.admissionrequestcount = '0';
        //     if (!$scope.Items.physiotheraphycount)
        //         $scope.Items.physiotheraphycount = '0';
        //     if (!$scope.Items.doctormedicalauditcount)
        //         $scope.Items.doctormedicalauditcount = '0';
        // };
        $scope.getddCount = function() {
            var inputData = {
                Data: {
                    Keys: [{
                            Key: 'appointment'
                        },
                        {
                            Key: 'mycheckedin'
                        }
                        //     {
                        //         Key: 'doctormedicalauditcount'
                        //     }
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

        // $scope.appoinment = function () {
        //     $state.go('app.doctorappointment');
        // }
        // $scope.checkedinpatients = function () {
        //     // $state.go('app.checkedinpatients');
        //     $state.go('app.oppatienttab.mycheckin');
        // }
        // $scope.inpatients = function () {
        //     $state.go('app.currentinpatient');
        // }
        // $scope.otschedules = function () {
        //     $state.go('app.otdoctorschedule');
        // }
        // $scope.otnotes = function () {
        //     $state.go('app.otdoctornotes', {
        //         context: 'doctor'
        //     });
        // }
        // $scope.pendingdischarges = function () {
        //     $state.go('app.pendingdischarges');
        // }
        // $scope.labresult = function () {
        //     $state.go('app.labresultreviews', {
        //         context: 'doctor'
        //     });
        // }
        // $scope.imagingradiology = function () {
        //     $state.go('app.radiologyresults');
        // }
        // $scope.endoscopyresults = function () {
        //     $state.go('app.endoscopyresultreview');
        // }
        // $scope.upnormalresults = function () {
        //     $state.go('app.abnormallabresults');
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

        $scope.allergies = function() {
            $state.go('app.allergies');
        }
        $scope.complaints = function() {
            $state.go('app.chiefcomplaints');
        }
        $scope.diagnosis = function() {
            $state.go('app.diagnosis');
        }
        $scope.procedures = function() {
            $state.go('app.procedures');
        }
        $scope.vitalparam = function() {
            $state.go('app.vitals');
        }
        $scope.drugfrequencies = function() {
            $state.go('app.drugfrequencies');
        }
        $scope.favourites = function() {
            $state.go('app.favoritemasters');
        }
        $scope.orderfavourites = function() {
            $state.go('app.orderfavorites');
        }
        $scope.externalprovidermaster = function() {
            $state.go('app.externalprovider');
        }
        $scope.defaultnotes = function() {
            $state.go('app.defaultnoteslist');
        }
        $scope.templates = function() {
            $state.go('app.templatemasters');
        }
        $scope.templatescreen = function() {
            $state.go('app.templatescreens');
        }
        $scope.templatetabs = function() {
            $state.go('app.templatetabs');
        }
        $scope.templateparam = function() {
            $state.go('app.templateparams');
        }
        $scope.abgparameters = function() {
            $state.go('app.abgparameters');
        }
        $scope.dischargesummarytemplates = function() {
                $state.go('app.notetemplates', {
                    context: 'medical',
                    temptype: 'medical'
                });
            }
            
        $scope.pmrmaster = function() {
            $state.go('app.pmrlist', { context: 'lab' });
        }
            /* Side Menu close*/
        $timeout(function() {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        /* Side Menu close*/

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

        $scope.getOutPatientListCallBack = function(scope, res, options, hasError) {
            $scope.outpatientlist = res.Data;
        }


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
        }
        $scope.getddCount();
        $scope.GetFacilityDashboardOptions();
        $scope.getOutPatientList();
    }
    MedicalmasterDashboardController.$inject = ['$rootScope', '$scope', '$timeout', '$filter', '$stateParams', '$state', '$translate', 'utl'];
})();