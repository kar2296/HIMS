(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('checklistController', checklistController);

    function checklistController($rootScope, $timeout, $scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        $scope.currentfilter = {
            VisitTypeId: 2,
            ChecklistStatusId: 1
        };
        //Dynamic form starts
        function initDynamicForm() {
            $scope.advancedfilter = {
                // From: '',
                // To: ''
            };
            $scope.advancedfilterDefault = {


            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [
                    { type: 'date', translate: 'billing.claim-checklist.doa.lbl', model: 'From', position: { r: 0, c: 0 } },
                    { type: 'date', translate: 'billing.claim-checklist.dod.lbl', model: 'To', position: { r: 0, c: 1 } },
                    //{ type: 'select', translate: 'admissions.filter_patient.lbl', model: 'PatientId', options: $scope.lookup.Patient, position: { r: 1, c: 0 } },
                    // { type: 'select', translate: 'admissions.filter_doctor.lbl', model: 'DoctorId', options: $scope.lookup.Doctor, position: { r: 1, c: 1 } },
                    { type: 'date', translate: 'ordermanagement.orderacknowledgement-form.from.lbl', model: 'FromDate', position: { r: 1, c: 1 } },
                    { type: 'date', translate: 'ordermanagement.orderacknowledgement-form.to.lbl', model: 'ToDate', position: { r: 1, c: 2 } },
                    { type: 'select', translate: 'billing.claim-checklist.guarantor.lbl', model: 'GuarantorTypeId', options: $scope.lookup.GuarantorType, position: { r: 2, c: 2 } },
                    { type: 'number', translate: 'billing.dischargedpatients.billno.lbl', model: 'BillNumber', position: { r: 2, c: 1 } },

                ],
                actions: [
                    { type: 'apply', translate: 'common.applyaction.lbl', cls: 'btn-primary' },
                    { type: 'reset', translate: 'common.resetaction.lbl', cls: 'btn-danger' }
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
        $scope.custom_sort = function (a, b) {
            return new Date(b.BillDateTime).getTime() - new Date(a.BillDateTime).getTime();
        }

        $scope.getListCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0)
                data.Data.sort($scope.custom_sort);
            vm.gridConfig.data = [];
            vm.gridConfig.data = data.Data;
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var FromReq = $filter('date')($scope.advancedfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var ToReq = $filter('date')($scope.advancedfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;

            var FromDate = $filter('date')($scope.currentfilter.BillDate, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.currentfilter.BillDate, 'yyyy-MM-dd 23:59:59') || null;

            var Fromadm = $filter('date')($scope.advancedfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var Toadm = $filter('date')($scope.advancedfilter.To, 'yyyy-MM-dd 23:59:59') || null;

            var From = $filter('date')($scope.currentfilter.AdmissionDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.AdmissionDate, 'yyyy-MM-dd 23:59:59') || null;
            var fromdis = $filter('date')($scope.advancedfilter.dodfrom, 'yyyy-MM-dd 00:00:00') || null;
            var todis = $filter('date')($scope.advancedfilter.dodto, 'yyyy-MM-dd 23:59:59') || null;

            var dodfrom = $filter('date')($scope.currentfilter.DischargeDate, 'yyyy-MM-dd 00:00:00') || null;
            var dodto = $filter('date')($scope.currentfilter.DischargeDate, 'yyyy-MM-dd 23:59:59') || null;


            var inputData = {
                Params: [
                    { Key: 10, Value: $scope.currentfilter.GuarantorId },
                    { Key: 9, Value: $scope.advancedfilter.GuarantorTypeId },

                    { Key: 19, Value: $scope.currentfilter.VisitTypeId },
                    { Key: 13, Value: $scope.currentfilter.PatientMRN },
                    { Key: 2, Value: $scope.currentfilter.BillNo },
                    { Key: 28, Value: $scope.currentfilter.ChecklistStatusId },
                    { Key: 20, Value: [1, 2] },
                    { Key: 27, Value: [1] },
                    { Key: 17, Value: FromDate },
                    { Key: 18, Value: ToDate },
                    { Key: 17, Value: FromReq },
                    { Key: 18, Value: ToReq },
                    { Key: 35, Value: From },
                    { Key: 36, Value: To },
                    { Key: 35, Value: Fromadm },
                    { Key: 36, Value: Toadm },
                    { Key: 39, Value: fromdis },
                    { Key: 40, Value: todis },
                    { Key: 39, Value: dodfrom },
                    { Key: 40, Value: dodto },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'billing/patientbills/GetPatientBills',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: patientId },
                confirmCallback: $scope.getList
            });
        }

        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'claim') {
                $state.go('app.checklist-form', { id: row.entity.EncounterId, gmid: row.entity.Guarantor.GuarantorId, billid: row.entity.Id })
            } else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(row.entity.PatientId);
            }
        }
        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "Patient",
                    displayName: $translate.instant('billing.claim-checklist.patientinfo.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)" uib-tooltip="{{row.entity.Patient.Title.Description}}&nbsp; .{{row.entity.Patient.FirstName}} / {{row.entity.Patient.MRN}}  / {{row.entity.Patient.Age}} / {{row.entity.Patient.Gender.Description}}" tooltip-placement="bottom" >' +
                        "{{row.entity.Patient.Title.Description}}&nbsp;</span>" +
                        "<span >{{row.entity.Patient.FirstName}}&nbsp;</span>" +
                        "<span >{{row.entity.Patient.LastName}}&nbsp;</span>" +
                        "<span >/</span>" +
                        "<span >{{row.entity.Patient.MRN}}&nbsp;</span>" +
                        "<span >/<span>" +
                        "<span ng-if='row.entity.Patient.Title && row.entity.Patient.Title.Description' >" +
                        "<span >{{row.entity.Patient.Age}}&nbsp;</span>" +
                        "<span >/</span>" +
                        "<span >{{row.entity.Patient.Gender.Description}}</span>" +
                        "</a></div>"
                },
                {
                    field: "BillNumber", displayName: $translate.instant('billing.dischargedpatients.billno.lbl')
                },
                {
                    field: "BillDate", displayName: $translate.instant('billing.claim-checklist.billdate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.BillDateTime | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{row.entity.BillDateTime| date: 'HH:mm'}}</span>" + "</div>"
                },
                { field: "Encounter.VisitIdentifier", displayName: $translate.instant('billing.claim-checklist.visitno.lbl') },
                { field: "Guarantor.GuarantorName", displayName: $translate.instant('billing.claim-checklist.guarantor.lbl') },
                {
                    field: "AdmissionDate",
                    displayName: $translate.instant('billing.claim-checklist.doa.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.Encounter.AdmissionDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{row.entity.Encounter.AdmissionDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "DischargeDate",
                    displayName: $translate.instant('billing.claim-checklist.dod.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.Encounter.DischargeDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{row.entity.Encounter.DischargeDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                { field: "ChecklistStatus.Description", displayName: $translate.instant('billing.claim-checklist.status.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                                <a class="grid-action btn btn-warning btn-xs" ng-click="grid.appScope.handleEvents(\'claim\',row)"><i class="fa fa-usd" aria-hidden="true"></i></a>\
                                                </div>',
                    actions: [

                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }

        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                {
                    "Key": "Guarantor",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "GuarantorType" },
                { "Key": "EncounterType", Default: false },
                { "Key": "ChecklistStatus" }
            ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.initLookup();
    }
    checklistController.$inject = ['$rootScope', '$timeout', '$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();