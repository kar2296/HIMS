(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('InventoryMasterDashboardController', InventoryMasterDashboardController);

    function InventoryMasterDashboardController($rootScope, $scope, $timeout, $filter, $stateParams, $state, $translate, utl) {
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
 
        $scope.currentcontext.CanProductType = utl.Privilege.hasAccess('CanProductType');
        $scope.currentcontext.CanUnitofMeasurements = utl.Privilege.hasAccess('CanUnitofMeasurements');
        $scope.currentcontext.CanTaxMasters = utl.Privilege.hasAccess('CanTaxMasters');
        $scope.currentcontext.CanStores = utl.Privilege.hasAccess('Stores');
        $scope.currentcontext.CanInventoryItems = utl.Privilege.hasAccess('CanInventoryItems');
        $scope.currentcontext.CanSuplliers = utl.Privilege.hasAccess('CanSuplliers');
        $scope.currentcontext.CanItemSupplierPrices = utl.Privilege.hasAccess('CanItemSupplierPrices');
        $scope.currentcontext.CanRackSelfTray = utl.Privilege.hasAccess('CanRack/Self/Tray');
        $scope.currentcontext.CanReorderSetup = utl.Privilege.hasAccess('CanReorderSetup');


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




        $scope.getdoctDashboardCountCallBack = function (scope, res, options, hasError) {
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

        $scope.producttype = function () {
            $state.go('app.producttypes',{ context: 'inventory'});
        }
        $scope.unitofmeasurement = function () {
            // $state.go('app.checkedinpatients');
            $state.go('app.uommasters',{ context: 'inventory'});
        }
        $scope.taxmaster = function () {
            $state.go('app.gstmasters',{ context: 'inventory'});
        }
        $scope.store = function () {
            $state.go('app.storemasters',{ context: 'inventory'});
        }
        $scope.itemmaster = function () {
            $state.go('app.itemmasters',{ context: 'inventory'});
        }
        $scope.suppliers = function () {
            $state.go('app.vendormasters',{ context: 'inventory'});
        }
        $scope.generic = function () {
            $state.go('app.generics',{ context: 'inventory'});
        }
        $scope.category = function () {
            $state.go('app.itemcategorys',{ context: 'inventory'});
        }
        $scope.subcategory = function () {
            $state.go('app.itemsubcategorys',{ context: 'inventory'});
        }
        $scope.itemsupplierprices = function () {
            $state.go('app.itemvendorprice',{ context: 'inventory'}); 
        }
        $scope.rack = function () {
            $state.go('app.itemrackmapping',{ context: 'inventory'});
        }
        $scope.reordersetup = function () {
            $state.go('app.reordersetuplist',{ context: 'inventory'});
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
    InventoryMasterDashboardController.$inject = ['$rootScope', '$scope', '$timeout', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();