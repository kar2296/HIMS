(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('pendingdischargesController', pendingdischargesController);

    function pendingdischargesController($scope, $stateParams, $state, $translate, utl, uibButtonConfig) {
        var vm = this;

        $scope.Items = [];
        uibButtonConfig.activeClass = "opt-selected";

        $scope.gridData = [];

        $scope.currentfilter = {
            facilityid: utl.Session.getCurrentFacilityId(),
            wardid: -1,
            admissionstatusid: 4,
            patientnamemrn: '',
            AdmissionRequestTypeId: -1,
            WardId: -1,
            DoctorId: utl.Session.getCurrentUserId()
        };
        $scope.currentcontext = {
            option: 'myinpatients',
            DoctorId: parseInt(utl.Session.getCurrentUserId())
        };
        $scope.options = [
            { key: 'myinpatients', name: $translate.instant('registration.inpatients.myinpatients.lbl') },
            { key: 'allinpatients', name: $translate.instant('registration.inpatients.currentinpatients.lbl') }
        ]

        $scope.InfectionControl = function () {
            $state.go('app.infectioncontrols', { id: 0 });
        };


        //Dynamic form starts
        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {
                PatientId: -1,
                DoctorId: -1,
                DepartmentId: -1,
                AdmissionTypeId: -1,
                ServiceRateCategoryId: -1,
                DiagnosisId: -1,
                From: utl.Formatter.getCurrentDate(),
                To: utl.Formatter.getCurrentDate(),


            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [
                    { type: 'date', translate: 'admissions.filter_admissiondate.lbl', model: 'From', position: { r: 0, c: 0 } },
                    { type: 'date', translate: 'admissions.filter_dischargedate.lbl', model: 'To', position: { r: 0, c: 1 } },
                    { type: 'select', translate: 'admissions.filter_patient.lbl', model: 'PatientId', options: $scope.lookup.Patient, position: { r: 1, c: 0 } },
                    { type: 'select', translate: 'admissions.filter_doctor.lbl', model: 'DoctorId', options: $scope.lookup.Doctor, position: { r: 1, c: 1 } },
                    { type: 'select', translate: 'admissions.filter_department.lbl', model: 'DepartmentId', options: $scope.lookup.Department, position: { r: 2, c: 0 } },
                    { type: 'select', translate: 'admissions.filter_admissiontype.lbl', model: 'AdmissionTypeId', options: $scope.lookup.AdmissionType, position: { r: 2, c: 1 } },
                    { type: 'select', translate: 'admissions.filter_refferal.lbl', model: 'ReferralId', options: $scope.lookup.Referral, position: { r: 3, c: 0 } },
                    { type: 'select', translate: 'admissions.filter_guarantor.lbl', model: 'GuarantorId', options: $scope.lookup.Guarantor, position: { r: 3, c: 1 } },
                    { type: 'select', translate: 'admissions.filter_serviceratecategory.lbl', model: 'ServiceRateCategoryId', options: $scope.lookup.ServiceRateCategory, position: { r: 4, c: 0 } },
                    { type: 'select', translate: 'admissions.filter_diagnosis.lbl', model: 'DiagnosisId', options: $scope.lookup.Diagnosis, position: { r: 4, c: 1 } },
                    { type: 'text', translate: 'admissions.filter_attender.lbl', model: 'AttenderName', position: { r: 5, c: 0 } },
                    { type: 'checkbox', translate: 'admissions.filter_isreadmission.lbl', model: 'IsReadmission', position: { r: 5, c: 1 } },
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

        $scope.getPatientProfilePicCallback = function (scope, data, options, hasError) {
            var patientId = data.Id;
            var photo = data.Photo;
            for (var idx in $scope.gridData) {
                var item = $scope.gridData[idx];
                if (item.Patient.Id == patientId) {
                    item.Patient.Photo = photo;
                }
            }
        };

        $scope.getPatientProfilePic = function (item) {
            if (item.PhotoPath) {
                var inputData = { Id: item.Id, PhotoPath: item.PhotoPath };
                var options = {
                    action: 'registration/Patient/GetPatientProfilePic',
                    data: { Data: inputData },
                    type: 'post',
                    onComplete: $scope.getPatientProfilePicCallback
                };
                utl.Http.doAction(options);
            }
        };

        function loadPhotos() {
            for (var idx in $scope.gridData) {
                var item = $scope.gridData[idx];
                if (item.Patient.PhotoPath) {
                    $scope.getPatientProfilePic(item.Patient);
                }
            }
        }
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.gridData = res.Data;
            var items = $scope.gridData;
            for (var idx in items) {
                var item = items[idx];

            }
            vm.gridConfig.data = items;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;

        };

        $scope.getList = function () {
            // if ($scope.advancedfilter.From || $scope.advancedfilter.To) {
            //     $scope.currentfilter.AdmissionDate = '';
            // }
            vm.gridConfig.data = [];
            if ($scope.currentcontext.option == 'allinpatients') {
                var inputData = {
                    Params: [
                        { Key: 1, Value: $scope.currentfilter.facilityid },
                        { Key: 2, Value: $scope.currentfilter.WardId },
                        { Key: 3, Value: $scope.currentfilter.admissionstatusid },
                        { Key: 4, Value: $scope.currentfilter.PatientId },
                        // { Key: 5, Value: $scope.currentfilter.DoctorId },
                        // { Key: 6, Value: $scope.advancedfilter.DepartmentId },
                        // { Key: 7, Value: $scope.advancedfilter.ServiceRateCategoryId },
                        { Key: 8, Value: $scope.currentfilter.AdmissionRequestTypeId },
                        // { Key: 9, Value: $scope.advancedfilter.DiagnosisId },
                        // { Key: 3, Value: $scope.currentfilter.ReferralId },
                        // { Key: 3, Value: $scope.currentfilter.GuarantorId },
                        // { Key: 10, Value: $scope.advancedfilter.AttenderName },
                        { Key: 11, Value: $scope.currentfilter.patientnamemrn },
                        { Key: 12, Value: $scope.currentfilter.RequestNo },
                        { Key: 13, Value: $scope.currentfilter.VisitIdentifier },
                        { Key: 15, Value: 2 },
                        { Key: 16, Value: utl.Formatter.getFilterDate($scope.currentfilter.AdmissionDate) },
                        // { Key: 17, Value: $scope.advancedfilter.From },
                        // { Key: 18, Value: $scope.advancedfilter.To },
                        { Key: 20, Value: $scope.currentfilter.AttenderPhone },

                    ],
                    PageContext: {
                        PageSize: vm.gridConfig.pagerObj.pageSize,
                        PageNumber: vm.gridConfig.pagerObj.currentPage

                    }

                };
            } else if ($scope.currentcontext.option == 'myinpatients') {
                var inputData = {
                    Params: [
                        { Key: 1, Value: $scope.currentfilter.facilityid },
                        { Key: 5, Value: $scope.currentfilter.DoctorId },
                        { Key: 2, Value: $scope.currentfilter.WardId },
                        { Key: 3, Value: $scope.currentfilter.admissionstatusid },
                        { Key: 11, Value: $scope.currentfilter.patientnamemrn },
                        { Key: 15, Value: 2 },
                        // { Key: 31, Value: [2, 3, 4, 5] },
                    ],
                    PageContext: {
                        PageSize: vm.gridConfig.pagerObj.pageSize,
                        PageNumber: vm.gridConfig.pagerObj.currentPage

                    }
                };
            }
            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);


        };
        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.bed_management = function () {
            $state.go('app.bedmanagement');
        }
        // Patient Info popup  Start  

        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: patientId },
                confirmCallback: $scope.getList
            });
        }
        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'edit') {
                $state.go('patientemr.patientdashboard', {  pid: row.entity.Patient.Id, eid: row.entity.Id });
            }
        };
        vm.gridConfig = {
            columnDefs: [
                { field: "Id", name: 'Patient Details', cellTemplate: 'currentinPatientsTemplate.html' }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };


        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                // { "Key": "Facility" },
                { "Key": "AdmissionStatus" },
                // { "Key": "PatientName" },
                { "Key": "Ward" },
                { "Key": "AdmissionRequestType" },
                // { "Key": "Patient" },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "Department" },
                // { "Key": "Diagnosis" },
                // { "Key": "AdmissionType" },
                // { "Key": "Guarantor" },
                // { "Key": "Referral" },

            ]
            /*   2/12/2016 */
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        // ---------------------------------------------------------------------
        // React bridge (pendingdischarges "hollow controller" wiring). Every
        // function above is UNCHANGED; this section only exposes state to,
        // and dispatches actions back into, the existing functions.
        // ---------------------------------------------------------------------

        function updateReactProps() {
            $scope.reactProps = {
                items: $scope.gridData || [],
                lookup: {
                    Ward: ($scope.lookup && $scope.lookup.Ward) || [],
                    AdmissionStatus: ($scope.lookup && $scope.lookup.AdmissionStatus) || []
                },
                currentfilter: {
                    patientnamemrn: $scope.currentfilter.patientnamemrn,
                    visitdate: $scope.currentfilter.visitdate,
                    WardId: $scope.currentfilter.WardId,
                    admissionstatusid: $scope.currentfilter.admissionstatusid
                },
                currentcontext: {
                    option: $scope.currentcontext.option
                },
                pager: {
                    totalItems: vm.gridConfig.pagerObj.totalItems,
                    currentPage: vm.gridConfig.pagerObj.currentPage,
                    pageSize: vm.gridConfig.pagerObj.pageSize
                }
            };
        }

        var _origGetListCallback = $scope.getListCallback;
        $scope.getListCallback = function (scope, res, options, hasError) {
            _origGetListCallback(scope, res, options, hasError);
            updateReactProps();
        };

        var _origLookupCallback = $scope.lookupCallback;
        $scope.lookupCallback = function (scope, data, options, hasError) {
            _origLookupCallback(scope, data, options, hasError);
            updateReactProps();
        };

        $scope.handleReactAction = function (actionName, payload) {
            payload = payload || {};
            switch (actionName) {
                case 'filterChange':
                    // Mirrors the real on-enter box (Name/MRN): no refetch on keystroke.
                    $scope.currentfilter[payload.field] = payload.value;
                    updateReactProps();
                    break;
                case 'filterChangeAndSearch':
                    // Mirrors the real ng-change="getList()" on visitdate/WardId/admissionstatusid.
                    $scope.currentfilter[payload.field] = payload.value;
                    updateReactProps();
                    $scope.getList();
                    break;
                case 'search':
                    // Mirrors the real on-enter="getList()" on the Name/MRN box.
                    $scope.getList();
                    break;
                case 'toggleOption':
                    // Mirrors uib-btn-radio + ng-click="getList()" on the option buttons.
                    $scope.currentcontext.option = payload.option;
                    updateReactProps();
                    $scope.getList();
                    break;
                case 'pageChange':
                    vm.gridConfig.pagerObj.currentPage = payload.page;
                    $scope.getList();
                    break;
                case 'edit':
                    // Real handleEvents expects the ui-grid "row" wrapper (row.entity...),
                    // not the bare entity -- reproduced by passing { entity: payload.entity }.
                    $scope.handleEvents('edit', { entity: payload.entity });
                    break;
                case 'doctorDashboard':
                    $scope.doctor_dashboard();
                    break;
                case 'bedManagement':
                    $scope.bed_management();
                    break;
                case 'infectionControl':
                    $scope.InfectionControl();
                    break;
                default:
                    break;
            }
        };

        $scope.initLookup();
        updateReactProps();
    }
    pendingdischargesController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', 'uibButtonConfig'];

})();