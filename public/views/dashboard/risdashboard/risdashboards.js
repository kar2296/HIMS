(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('RisDashBoardController', RisDashBoardController);

    function RisDashBoardController($rootScope, $scope, $timeout, $filter, $stateParams, $state, $translate, utl) {
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


        $scope.currentcontext.CanRis_OrderAcceptances = utl.Privilege.hasAccess('CanRis_OrderAcceptances');
        $scope.currentcontext.CanRis_ResultEntries = utl.Privilege.hasAccess('CanRis_ResultEntries');
        $scope.currentcontext.CanRis_ResultApprovals = utl.Privilege.hasAccess('CanRis_ResultApprovals');
        $scope.currentcontext.CanRis_ResultReleases = utl.Privilege.hasAccess('CanRis_ResultReleases');
        $scope.currentcontext.CanRis_ResultTemplates = utl.Privilege.hasAccess('CanRis_ResultTemplates');
        $scope.currentcontext.CanRis_RateEnquiry = utl.Privilege.hasAccess('CanRis_RateEnquiry');
        $scope.currentcontext.CanRis_ManageTests = utl.Privilege.hasAccess('CanRis_ManageTests');
        $scope.currentcontext.CanRis_ManageParameter = utl.Privilege.hasAccess('CanRis_ManageParameter');
        $scope.currentcontext.CanRis_Reports = utl.Privilege.hasAccess('CanRis_Reports');



        // $scope.getdoctDashboardCountCallBack = function (scope, res, options, hasError) {
        //     $scope.Items.appoinmentCount = res.appointment.appoinmentCount;
        //     $scope.Items.checkedincount = res.mycheckedin.checkedincount;
        //     // $scope.Items.inpatientcount = res.myinpatient.inpatientcount;
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


            // if (!$scope.Items.appoinmentCount)
            //     $scope.Items.appoinmentCount = '0';
            // if (!$scope.Items.checkedincount)
            //     $scope.Items.checkedincount = '0';
            // if (!$scope.Items.inpatientcount)
            //     $scope.Items.inpatientcount = '0';
            // if (!$scope.Items.otschedulecount)
            //     $scope.Items.otschedulecount = '0';
            // if (!$scope.Items.otnotescount)
            //     $scope.Items.otnotescount = '0';
            // if (!$scope.Items.pendingdischargescount)
            //     $scope.Items.pendingdischargescount = '0';
            // if (!$scope.Items.labresultcount)
            //     $scope.Items.labresultcount = '0';
            // if (!$scope.Items.imagingradiologycount)
            //     $scope.Items.imagingradiologycount = '0';
            // if (!$scope.Items.endoscopycount)
            //     $scope.Items.endoscopycount = '0';
            // if (!$scope.Items.abnormalcount)
            //     $scope.Items.abnormalcount = '0';
            // if (!$scope.Items.prescriptioncount)
            //     $scope.Items.prescriptioncount = '0';
            // if (!$scope.Items.surgeryrequestcount)
            //     $scope.Items.surgeryrequestcount = '0';
            // if (!$scope.Items.admissionrequestcount)
            //     $scope.Items.admissionrequestcount = '0';
            // if (!$scope.Items.physiotheraphycount)
            //     $scope.Items.physiotheraphycount = '0';
            // if (!$scope.Items.doctormedicalauditcount)
            //     $scope.Items.doctormedicalauditcount = '0';
        // };
        $scope.getddCount = function () {
            var inputData = {
                Data: {
                    Keys: [{
                        Key: 'appointment'
                    },
                    {
                        Key: 'mycheckedin'
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

        $scope.appoinment = function () {
            $state.go('app.doctorappointment');
        }
        $scope.checkedinpatients = function () {
            // $state.go('app.checkedinpatients');
            $state.go('app.oppatienttab.mycheckin');
        }
        $scope.inpatients = function () {
            $state.go('app.currentinpatient');
        }
        $scope.otschedules = function () {
            $state.go('app.otdoctorschedule');
        }
        $scope.otnotes = function () {
            $state.go('app.otdoctornotes', {
                context: 'doctor'
            });
        }
        $scope.pendingdischarges = function () {
            $state.go('app.pendingdischarges');
        }
        $scope.labresult = function () {
            $state.go('app.labresultreviews', {
                context: 'doctor'
            });
        }
        $scope.imagingradiology = function () {
            $state.go('app.radiologyresults');
        }
        $scope.endoscopyresults = function () {
            $state.go('app.endoscopyresultreview');
        }
        $scope.upnormalresults = function () {
            $state.go('app.abnormallabresults');
        }
        $scope.prescription = function () {
            $state.go('app.doctorprescription');
        }
        $scope.surgeryrequest = function () {
            $state.go('app.otrequests');
        }
        $scope.admissionrequest = function () {
            $state.go('app.admissionrequests');
        }
        $scope.physiotheraphy = function () {
            $state.go('app.physiotheraphytab.details');
        }
        $scope.doctorMedicalAudit = function () {
            $state.go('app.medicalauditemr');
        }

        $scope.acceptances = function () {
            $state.go('app.orderacknowledgements', { tp: 2 });
        }
        $scope.rateenquiry = function () {
            $state.go('#');
        }
        $scope.resultentries = function () {
            $state.go('app.processallorders', { tp: 2});
        }
        $scope.resultapprovals = function () {
            $state.go('app.approvalallorders', { tp: 2});
        }
        $scope.resultreleases = function () {
            $state.go('app.resultdispatches', { tp: 2});
        }
        $scope.resulttemplates = function () {
            $state.go('app.notetemplates',{ context: 'lab'});
        }
        $scope.managetests = function () {
            $state.go('app.testmasters');
        }
        $scope.manageparam = function () {
            $state.go('app.analytemasters');
        }
        $scope.radiologyreports = function () {
            $state.go('app.radiologyreports',{ context: 'lab' });
        }
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

        $scope.GetFacilityDashboardOptionsCallBack = function (scope, res, options, hasError) {
            $scope.FacilityInfo = res;
        }





        $scope.getddCount();
        $scope.GetFacilityDashboardOptions();
        $scope.getOutPatientList();
    }
    RisDashBoardController.$inject = ['$rootScope', '$scope', '$timeout', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();