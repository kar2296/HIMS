
(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('emrdashboardFormController', emrdashboardFormController);

    function emrdashboardFormController($rootScope, $scope, $timeout, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));

        $scope.contextMenus = ['emr', 'ipemr', 'pastvisits', 'pmhx'];

        $scope.pagecontext = 'pastvisits';
        $scope.FacilityBlockPendingOrders = false;
        $scope.currentfilter = {
            ConditionStatusId: 1
        };
        $scope.Items = {};
        $scope.Items.ConsultCount = '0';
        $scope.Items.PrescribeCount = '0';
        $scope.Items.OrderCount = '0';
        $scope.Items.SurgeryCount = '0';
        $scope.Items.DocumentCount = '0';
        $scope.Items.AdmitCount = '0';
        $scope.Items.AllergyCount = '0';
        $scope.Items.LabCount = '0';
        $scope.Items.RadiologyCount = '0';
        $scope.Items.EndoscopyCount = '0';
        $scope.Items.LensPrescribeCount = '0';

        $scope.currentcontext = {
            paneltype: utl.Session.get('dashboard-panel-type'),
            recordcount: utl.Session.getPatientDashboardRecordCount()
        };


        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.encounter = utl.Session.getPatientEncounter();
        if ($scope.currentcontext.encounter) {
            $scope.currentcontext.eid = $scope.currentcontext.encounter.Id;
            $scope.pagecontext = $scope.currentcontext.encounter.EncounterTypeId == 1 ? 'emr' : 'ipemr';
            $stateParams.context = $scope.pagecontext;
        }
        if ($stateParams.pid)
            $scope.currentcontext.pid = parseInt($stateParams.pid);
        if ($stateParams.context)
            $scope.pagecontext = $stateParams.context;

        $scope.getEMRDashboardCountCallBack = function (scope, res, options, hasError) {
            $scope.Items.ConsultCount = res.consultbo.ConsultCount;
            $scope.Items.PrescribeCount = res.prescribebo.PrescribeCount;
            $scope.Items.OrderCount = res.orderbo.OrderCount;
            $scope.Items.SurgeryCount = res.surgeryrequestbo.SurgeryCount;
            $scope.Items.DocumentCount = res.documentbo.DocumentCount;
            $scope.Items.AdmitCount = res.admitrequestbo.AdmitCount;
            $scope.Items.AllergyCount = res.allergybo.AllergyCount;
            $scope.Items.LabCount = res.labresultbo.LabCount;
            $scope.Items.RadiologyCount = res.radiologyresultbo.RadiologyCount;
            $scope.Items.EndoscopyCount = res.endoscopyresultbo.EndoscopyCount;
            $scope.Items.LensPrescribeCount = res.lensprescribebo.LensPrescribeCount;
            if (!$scope.Items.ConsultCount)
                $scope.Items.ConsultCount = '0';
            if (!$scope.Items.PrescribeCount)
                $scope.Items.PrescribeCount = '0';
            if (!$scope.Items.OrderCount)
                $scope.Items.OrderCount = '0';
            if (!$scope.Items.SurgeryCount)
                $scope.Items.SurgeryCount = '0';
            if (!$scope.Items.DocumentCount)
                $scope.Items.DocumentCount = '0';
            if (!$scope.Items.AdmitCount)
                $scope.Items.AdmitCount = '0';
            if (!$scope.Items.AllergyCount)
                $scope.Items.AllergyCount = '0';
            if (!$scope.Items.LabCount)
                $scope.Items.LabCount = '0';
            if (!$scope.Items.RadiologyCount)
                $scope.Items.RadiologyCount = '0';
            if (!$scope.Items.EndoscopyCount)
                $scope.Items.EndoscopyCount = '0';
            if (!$scope.Items.LensPrescribeCount)
                $scope.Items.LensPrescribeCount = '0';
        };
        $scope.getCount = function () {
            var inputData = {
                Data: {
                    Keys: [
                        { Key: 'consultbo' },
                        { Key: 'prescribebo' },
                        { Key: 'orderbo' },
                        { Key: 'surgeryrequestbo' },
                        { Key: 'documentbo' },
                        { Key: 'admitrequestbo' },
                        { Key: 'allergybo' },
                        { Key: 'labresultbo' },
                        { Key: 'radiologyresultbo' },
                        { Key: 'endoscopyresultbo' },
                        { Key: 'lensprescribebo' }
                    ]
                },
                Attributes: $scope.currentcontext
            };

            var options = {
                action: 'emr/PatientEMRDashboard/GetPatientEMRDashboardOptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getEMRDashboardCountCallBack
            };
            utl.Http.doAction(options);
        };


        $scope.patientemr_intakeop = function () {
            $state.go('patientemr.patientintakeoutputs');
        }
        $scope.patientemr_esummary = function () {
            $state.go('patientemr.patientdashboard');
        }
        $scope.patientemr_pmhx = function () {
            $state.go('patientemr.pmhxdashboard');
        }
        $scope.patientemr_consultation = function () {
            $state.go('patientemr.consultations');
        }
        $scope.patientemr_admissionrequest = function () {
            $state.go('patientemr.admissionrequests');
        }
        $scope.patientemr_pastvisit = function () {
            $state.go('patientemr.pastvisits-list');
        }
        $scope.patientemr_feedback = function () {
            $state.go('patientemr.patientfeedback');
        }
        $scope.patientemr_requests = function () {
            $state.go('patientemr.admissionrequests');
        }
        $scope.patientemr_dietplan = function () {
            $state.go('patientemr.dietplantab.dietplan');
        }
        $scope.patientemr_labresults = function () {
            $state.go('patientemr.labresults');
        }
        $scope.patientemr_feedbacks = function () {
            $state.go('patientemr.patientfeedbacks');
        }
        $scope.patientemr_allergyies = function () {
            $state.go('patientemr.patientallergies');
        }
        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.bed_management = function () {
            $state.go('app.bedmanagement');
        }
        $scope.checkedinpatients = function () {
            $state.go('app.checkedinpatients');
        }
        $scope.orthoassesments = function () {
            $state.go('patientemr.orthoassesment');
        }
        $scope.toothchart = function () {
            $state.go('patientemr.toothcharttab');
        }
        $scope.OrderList = function () {
            $state.go('patientemr.clinicalorders', {
                pid: $scope.currentcontext.pid,
                context: $scope.currentcontext.context
            });
        }
        $scope.PrescribeList = function () {
            $state.go('patientemr.rxprescriptions', {
                pid: $scope.currentcontext.pid,
                context: $scope.pagecontext
            });
            // $state.go('patientemr.rxprescriptions', params: { pid: $scope.currentcontext.pid });
        }
        $scope.patientemr_criticalcharts = function () {
            $state.go('patientemr.criticalcarecharts');
        }
        $scope.patientemr_medicinerequest = function () {
            $state.go('patientemr.medicinerequest');
        }
        $scope.patientemr_medicinereturn = function () {
            $state.go('patientemr.medicinereturns');
        }
        $scope.patientemr_patientdietorders = function () {
            $state.go('patientemr.patientdietorders');
        }
        $scope.surgery_request = function () {
            $state.go('patientemr.otrequestlist');
        }
        $scope.ot_schedule = function () {
            $state.go('patientemr.otschedules');
        }
        $scope.Morealerts = function () {
            utl.Modal.open('app.alertview', {
                params: { pid: $scope.currentcontext.pid },
                // cancelCallback: $scope.updateCount
            });
        }
        $scope.otregisterlist = function () {
            $state.go('patientemr.emrotregisters', {
                pid: $scope.currentcontext.pid,
                context: $scope.currentcontext.context
            });
        }
        $scope.ipcasesheets = function () {
            $state.go('patientemr.ipcasesheetsummary', {
                pid: $scope.currentcontext.pid
            });
        }
        $scope.open_pronotes = function () {
            $state.go('patientemr.progressnote');
        }
        $scope.medical_equipments = function () {
            $state.go('patientemr.equipments');
        }
        $scope.patientemr_mrdfiles = function () {
            $state.go('patientemr.mrdfilesattachments');
        }
        $scope.bed_transfer = function () {
            utl.Modal.open('app.bedtransferform', {
                params: { encounterid: $scope.Encounter.Id, historyid: $scope.OccupancyHistory.Id },
            });
        }
        $scope.house_keeping = function () {
            utl.Modal.open('app.housekeeprequest', {
                params: { eid: $scope.Encounter.Id, pid: $scope.currentcontext.pid },
            });
        }
        $scope.transport_request = function () {
            utl.Modal.open('app.transportrequest', {
                params: { eid: $scope.Encounter.Id, pid: $scope.currentcontext.pid },
            });
        }
        $scope.previousorders_bills = function () {
            $state.go('patientemr.previousorders');
        }
        $scope.bill_services = function () {
            utl.Modal.open('app.ipbillingprofiledetails', {
                params: { id: $scope.Encounter.Id, pid: $scope.currentcontext.pid },
            });
        }
        $scope.ot_transfer = function () {
            utl.Modal.open('app.otbedtransferform', {
                params: { encounterid: $scope.Encounter.Id, historyid: $scope.OccupancyHistory.Id },
            });
        }
        $scope.ot_receive = function () {
            utl.Modal.open('app.otbedtransferform', {
                params: { encounterid: $scope.Encounter.Id, historyid: $scope.OccupancyHistory.Id },
            });
        }
        $scope.physiotheraphy = function () {
            $state.go('patientemr.physiotheraphy');
        }
        $scope.pending_Orders = function () {
            if ($scope.FacilityBlockPendingOrders) {
                utl.Modal.open('app.patientpendinglisttab', {
                    params: { eid: $scope.currentcontext.eid },
                    confirmCallback: $scope.RefershSplitDetailsCallback
                });
                return false;
            }
        }
        $scope.lensprescribe = function () {
            $state.go('patientemr.lensprescription');
        }
        $scope.progress_notes = function () {
            $state.go('patientemr.progressnote');
        }
        $scope.diagnosis_list = function () {
            $state.go('patientemr.patientdiagnosis');
        }
        $scope.blood_bank = function () {
            $state.go('patientemr.bloodbanks');
        }
        $scope.endoscopyresult = function () {
            $state.go('patientemr.endoscopyresults');
        };

        $scope.patientTransfer = function () {
            $state.go('patientemr.patienttransfer');
        };
        $scope.UpdateEncMlc = function () {
            utl.Modal.open('app.updateencounterdata', {
                params: { eid: $scope.Encounter.Id, pid: $scope.currentcontext.pid },
            });
        }
        $scope.RefershSplitDetailsCallback = function (scope, res, options, hasError) {
            $scope.ActiveBillsCount = 0;
            if (res) {
                $scope.FacilityBlockPendingOrders = utl.FacilitySetting.getFacilitySettingValue('billing', 'pendingordersblock');
                $scope.PendingOrderTestNames = '';
                if ($scope.FacilityBlockPendingOrders) {
                    $scope.getPendingOrderList();
                    // $scope.getPendingDispensesList();
                    // $scope.getPendingDispensesReturnList();
                }
            }
        };
        /* Side Menu close*/
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        /* Side Menu close*/
        $scope.RefershSplitDetails = function () {
            if ($scope.currentcontext.EncounterId) {
                var options = {
                    action: 'billing/patientbills/PopulateInpatientBills',
                    data: {
                        Id: $scope.currentcontext.EncounterId
                    },
                    type: 'post',
                    onComplete: $scope.RefershSplitDetailsCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getOccupancyHistoryCallBack = function (scope, res, options, hasError) {
            $scope.OccupancyHistory = res.Data[0];
        }

        $scope.getOccupancyHistory = function () {
            if ($scope.Encounter && $scope.Encounter.Id) {
                var inputData = {
                    Params: [
                        { Key: 1, Value: $scope.Encounter.Id },
                        { Key: 2, Value: 1 },
                        // { Key: 5, Value: true },
                    ],
                    PageContext: {
                        PageSize: 25,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'IPManagement/BedOccupancyHistory/GetBedOccupancyHistorys',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getOccupancyHistoryCallBack
                };
                utl.Http.doAction(options);
            }
        }

        //get list
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.items = $filter('sortArrayItems')(res.Data, [
                { name: 'Id', direction: 'desc', priority: 1, type: 'int' }
            ]);
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 7, Value: $scope.currentcontext.pid },
                    { Key: 9, Value: $scope.currentcontext.eid },
                    { Key: 8, Value: 2 }
                ],
                PageContext: { PageSize: 25, PageNumber: 1 }
            };

            var options = {
                action: 'emr/ProgressNote/GetProgressNotes',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getencounterCallback = function (scope, data, options, hasError) {
            $scope.Encounter = data.Data[0];
            if (data.Data.length > 0)
                $scope.canShowDischargeBtn = true;
            $scope.getOccupancyHistory();
            if ($scope.Encounter.IsBillLock == true)
                $scope.RefershSplitDetails();
        };

        $scope.getEncounter = function () {
            var inputData = {
                Params: [
                    { Key: 0, Value: $scope.currentcontext.eid },
                    { Key: 15, Value: 2 }
                ]
            };
            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getencounterCallback
            };

            utl.Http.doAction(options);
        };

        $scope.openModal = function (appKey, stateParams) {
            utl.Modal.open(appKey, {
                params: stateParams,
                confirmCallback: $scope.getEncounter
            });
        }

        $scope.getPatientDischargeCallback = function (scope, data, options, hasError) {
            $scope.openModal('app.dischargeadvicer', { id: data, EncounterId: options.data.Id, Encounter: options.data.Encounter });
        }

        $scope.fitfordischarge = function () {
            var options = {
                action: 'IPManagement/PatientDischargeEvent/GetPatientDischargeEventByEncounterId',
                data: { Id: $scope.currentcontext.eid, Encounter: $scope.Encounter },
                type: 'post',
                onComplete: $scope.getPatientDischargeCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getPatientDischargeEventCallback = function (scope, data, options, hasError) {
            $scope.openModal('app.discharpatient', { id: data, EncounterId: options.data.Id, Encounter: options.data.Encounter });
        }

        $scope.clinicalDischarge = function () {
            var options = {
                action: 'IPManagement/PatientDischargeEvent/GetPatientDischargeEventByEncounterId',
                data: { Id: $scope.currentcontext.eid, Encounter: $scope.Encounter },
                type: 'post',
                onComplete: $scope.getPatientDischargeEventCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getPhysicalDischargeCallback = function (scope, data, options, hasError) {
            $scope.openModal('app.physicalpatient', { id: data, EncounterId: options.data.Id, Encounter: options.data.Encounter });
        }

        $scope.getOrderListCallBack = function (scope, res, options, hasError) {
            $scope.orderdetails = res.Data;
        }
        $scope.getOrderList = function () {
            var FromDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid },
                    { Key: 10, Value: $scope.currentfilter.DoctorId },
                    { Key: 7, Value: [FromDate, ToDate] },
                ],
                PageContext: {
                    PageSize: 3,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/patientorder/GetPatientOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getOrderListCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.getPrescribeListCallBack = function (scope, res, options, hasError) {
            $scope.prescribedetails = res.Data;
        }
        $scope.getPrescribeList = function () {
            var FromDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid },
                    { Key: 3, Value: $scope.currentfilter.DoctorId },
                    { Key: 8, Value: FromDate },
                    { Key: 9, Value: ToDate }
                ],
                PageContext: {
                    PageSize: 3,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/prescription/GetPrescriptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPrescribeListCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.getPatientAlertsCallback = function (scope, res, options, hasError) {
            $scope.alertdetails = res.Data;
        };

        $scope.getPatientAlerts = function () {
            var inputData = {
                Params: [
                    { Key: 4, Value: $scope.currentcontext.pid },
                    { Key: 5, Value: utl.Session.getUserDepartments() },
                    { Key: 6, Value: utl.Session.getCurrentUserId() },
                    { Key: 8, Value: true }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'generalmaster/PatientAlert/GetPatientAlerts',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientAlertsCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getPendingOrderListCallback = function (scope, res, options, hasError) {
            $scope.pendingorders = res.Data;
        };
        $scope.getPendingOrderList = function () {
            var inputData = {
                Params: [
                    { Key: 4, Value: 1 }, // Order Status Id = 1 --> Created State
                    { Key: 18, Value: $scope.currentcontext.eid }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'emr/patientorder/GetPatientOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPendingOrderListCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getDiagnosisListCallBack = function (scope, res, options, hasError) {
            $scope.patientdiagnosis = res.Data;
        }
        $scope.getDiagnosisList = function () {
            var FromDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid },
                    // { Key: 3, Value: $scope.currentfilter.DoctorId },
                    { Key: 7, Value: false },
                    // { Key: 8, Value: FromDate },
                    // { Key: 9, Value: ToDate }
                ],
                PageContext: {
                    PageSize: 3,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/patientcondition/GetPatientConditions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getDiagnosisListCallBack
            };
            utl.Http.doAction(options);
        };

        if ($scope.currentcontext.eid)
            $scope.getEncounter();
        $scope.getList();
        $scope.getOrderList();
        $scope.getPrescribeList();
        $scope.getDiagnosisList();
        $scope.getPatientAlerts();
        $scope.getCount();
    }

    emrdashboardFormController.$inject = ['$rootScope', '$scope', '$timeout', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();