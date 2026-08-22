(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('prescriptionsController', prescriptionsController);

    function prescriptionsController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.gridData = [];
        $scope.Items = [];
        $scope.currentfilter = {
            DoctorId: utl.Session.getCurrentUserId(),
            PrescriptionDate: utl.Formatter.getCurrentDate(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            DepartmentId: -1,
            PharmacyId: -1,
            PrecriptionStatusId: 3,
            patient: ''
        };
        $scope.item = {}

        $scope.currentcontext = {};
        $scope.currentcontext.context = $stateParams.context;
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.DepartmentId = parseInt(utl.Session.getCurrentDepartmentId())
        //getList
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.gridData = res.Data;
            var items = $scope.gridData;
            vm.gridConfig.data = items;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };
        $scope.getList = function (pageNo) {
            var From = $filter('date')($scope.currentfilter.PrescriptionDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.PrescriptionDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 14, Value: $scope.currentfilter.patient },
                    { Key: 3, Value: $scope.currentfilter.DoctorId },
                    { Key: 6, Value: $scope.currentfilter.PrecriptionStatusId },
                    { Key: 17, Value: $scope.currentfilter.FacilityId },
                    { Key: 8, Value: From },
                    { Key: 9, Value: To }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            var options = {
                action: 'emr/prescription/GetPrescriptionsWithoutDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);
        };
        //back
        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.bed_management = function () {
            $state.go('app.bedmanagement');
        }
        //Grid Actions
        $scope.addNew = function () {
            $state.go('app.doctorsprescription-form', {
                    id: 0, pid: $scope.currentcontext.pid, context: $scope.currentcontext.context,
                    doctid: $scope.currentfilter.DoctorId, deptid: $scope.currentcontext.DepartmentId
            });
        }
        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };
        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'edit') {
                $state.go('app.doctorsprescription-form', {
                    id: row.entity.Id, pid: row.entity.PatientId, context: $scope.currentcontext.context
                });
            }
        };
        vm.gridConfig = {
            columnDefs: [
                { field: "Id", name: 'Prescriptions', cellTemplate: 'prescriptionTemplate.html' }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };
        $scope.initLookup = function () {
            var inputData = [
                { "Key": "PrecriptionStatus" }
            ];
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };
        $scope.initLookup();

        // ---------------------------------------------------------------
        // REACT BRIDGE WIRING (migrated to PrescriptionsListScreen.tsx).
        // All logic above is untouched, including the real (disclosed, not
        // fixed) bugs: $scope.options is never defined despite the real
        // template's ng-repeat over it (so that radio-tab row silently
        // renders nothing today, not reproduced here either); getList()'s
        // pageNo parameter is dead (body reads pagerObj.currentPage
        // instead); deleteItemCallback has zero callers; item/DepartmentId
        // are dead state never surfaced in the UI.
        // ---------------------------------------------------------------
        function toIsoDateString(d) {
            if (!d) return '';
            var dt = new Date(d);
            if (isNaN(dt.getTime())) return '';
            var mm = ('0' + (dt.getMonth() + 1)).slice(-2);
            var dd = ('0' + dt.getDate()).slice(-2);
            return dt.getFullYear() + '-' + mm + '-' + dd;
        }
        function fromIsoDateString(s) {
            if (!s) return null;
            var parts = String(s).split('-');
            if (parts.length !== 3) return null;
            return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        }

        // --- React bridge: wrap the ORIGINAL getListCallback unchanged, then refresh reactProps ---
        var _origGetListCallback = $scope.getListCallback;
        $scope.getListCallback = function (scope, res, options, hasError) {
            _origGetListCallback(scope, res, options, hasError);
            updateReactProps();
        };

        // --- React bridge: wrap the ORIGINAL lookupCallback unchanged, then refresh reactProps ---
        var _origLookupCallback = $scope.lookupCallback;
        $scope.lookupCallback = function (scope, data, options, hasError) {
            _origLookupCallback(scope, data, options, hasError);
            updateReactProps();
        };

        function updateReactProps() {
            $scope.reactProps = {
                items: vm.gridConfig.data || [],
                lookup: {
                    PrecriptionStatus: ($scope.lookup && $scope.lookup.PrecriptionStatus) || []
                },
                currentfilter: {
                    patient: $scope.currentfilter.patient,
                    PrescriptionDate: toIsoDateString($scope.currentfilter.PrescriptionDate),
                    PrecriptionStatusId: $scope.currentfilter.PrecriptionStatusId
                },
                pager: {
                    totalItems: vm.gridConfig.pagerObj.totalItems,
                    currentPage: vm.gridConfig.pagerObj.currentPage,
                    pageSize: vm.gridConfig.pagerObj.pageSize
                }
            };
        }

        $scope.handleReactAction = function (actionName, payload) {
            payload = payload || {};
            switch (actionName) {
                case 'filterChange':
                    $scope.currentfilter[payload.field] = payload.value;
                    updateReactProps();
                    break;
                case 'filterChangeAndSearch':
                    if (payload.field === 'PrescriptionDate') {
                        $scope.currentfilter.PrescriptionDate = fromIsoDateString(payload.value);
                    } else {
                        $scope.currentfilter[payload.field] = payload.value;
                    }
                    updateReactProps();
                    $scope.getList();
                    break;
                case 'search':
                    $scope.getList();
                    break;
                case 'pageChange':
                    vm.gridConfig.pagerObj.currentPage = payload.page;
                    $scope.getList();
                    break;
                case 'doctor_dashboard':
                    $scope.doctor_dashboard();
                    break;
                case 'bed_management':
                    $scope.bed_management();
                    break;
                case 'addNew':
                    $scope.addNew();
                    break;
                case 'edit':
                    // Real handleEvents(actionType, row) expects a ui-grid-shaped
                    // { entity: ... } object -- payload.row here IS the entity
                    // (the React card receives the flat row directly, not wrapped).
                    $scope.handleEvents('edit', { entity: payload.row });
                    break;
                default:
                    break;
            }
            $scope.$applyAsync();
        };

        updateReactProps();
    }
    prescriptionsController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();