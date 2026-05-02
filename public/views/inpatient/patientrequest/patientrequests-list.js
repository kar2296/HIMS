(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientRequestListController', patientRequestListController);

    function patientRequestListController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));

        $scope.currentcontext = {};


        $scope.context = 'main';
        if ($stateParams && $stateParams.tp) {
            $scope.context = $stateParams.tp;
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        }
        $scope.item = {
            Id: -1,
            PatientStockRequestId: -1,
            PrescriptionId: -1,
            PatientRequestTypeId: 1
        };
        // $scope.currentcontext.CanAddNew = utl.Privilege.hasPrivilege('CanAddNew')
        $scope.doctor_dashboard = function () {
            $state.go('app.doctordashboard');
        }
        $scope.patient_dashboard = function () {
            $state.go('patientemr.emrdashboard');
        }

        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            PatientRequestPriorityId: 1,
            ToStoreId: -1,
            PatientRequestTypeId: 1,
            RequestNumber: '',
            WardId: -1,
            RoomId: -1,
            PatientRequestStatusId: 2,
            PatientRequestDateTime: utl.Formatter.getCurrentDate(),
            From: utl.Formatter.getCurrentDate(),
            To: utl.Formatter.getCurrentDate()
        };

        $scope.advancedfilter = {
            From: utl.Formatter.getCurrentDate(),
            To: utl.Formatter.getCurrentDate(),
        };

        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {
                RemarkId: -1,
                LocationId: -1,
                AdmittingReasonId: -1,
                StockPriorityId: -1,
                PatientRequestTypeId: 1,
                DiagnosisId: -1,
                DoctorId: -1,
                PatientId: -1,
                From: utl.Formatter.getCurrentDate(),
                To: utl.Formatter.getCurrentDate(),
            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [
                    { type: 'date', translate: 'patientrequests.fromdate.lbl', model: 'From', position: { r: 0, c: 0 } },
                    { type: 'date', translate: 'patientrequests.todate.lbl', model: 'To', position: { r: 0, c: 1 } },
                    { type: 'select', translate: 'patientrequests.requestby.lbl', model: 'RequestedBy', options: $scope.lookup.RequestedUser, position: { r: 1, c: 0 } },
                    { type: 'select', translate: 'patientrequests.approvedby.lbl', model: 'ApprovedBy', options: $scope.lookup.ApprovedUser, position: { r: 1, c: 1 } },
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
        };

        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = data.Data;
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {
            var FromReq = $filter('date')($scope.advancedfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var ToReq = $filter('date')($scope.advancedfilter.To, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 8, Value: $scope.currentfilter.FacilityId },
                    { Key: 9, Value: $scope.currentfilter.ToStoreId },
                    { Key: 1, Value: $scope.currentfilter.PatientRequestId },
                    { Key: 2, Value: $scope.currentfilter.PatientRequestNumber },
                    { Key: 4, Value: $scope.currentfilter.PatientRequestStatusId },
                    { Key: 5, Value: $scope.currentfilter.PatientId },
                    { Key: 11, Value: $scope.currentfilter.Patientname },
                    { Key: 6, Value: $scope.currentfilter.WardId },
                    { Key: 7, Value: $scope.currentfilter.RoomId },
                    { Key: 10, Value: $scope.currentfilter.PatientRequestPriorityId },
                    { Key: 12, Value: $scope.advancedfilter.RequestedBy },
                    { Key: 13, Value: $scope.advancedfilter.ApprovedBy },
                    { Key: 14, Value: FromReq },
                    { Key: 15, Value: ToReq },
                    { Key: 18, Value: $scope.currentfilter.PatientRequestTypeId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            if ($scope.context == 'emr') {
                var From = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
                var To = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;
                inputData.Params.push(
                    { Key: 5, Value: $scope.currentcontext.pid },
                    { Key: 4, Value: $scope.currentfilter.PatientRequestStatusId },
                    { Key: 14, Value: utl.Formatter.getFilterDate(From) },
                    { Key: 15, Value: utl.Formatter.getFilterDate(To) },
                );
            }
            var options = {
                action: 'IPManagement/PatientStockRequests/GetPatientStockRequests',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            if ($scope.context == 'main')
                $state.go('app.patientrequest', { id: 0 });
            if ($scope.context == 'emr')
                $state.go('patientemr.medicinerequestform', { id: 0 });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var inputData = { Header: $scope.item };
            var options = {
                action: 'IPManagement/PatientStockRequests/DeletePatientStockRequests',
                data: { Data: inputData },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };

            utl.Http.doAction(options);
        };

        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: patientId },
                confirmCallback: $scope.getList
            });
        };

        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'view') {
                if ($scope.context == 'main')
                    $state.go('app.patientrequest', { id: row.entity.Id, eid: row.entity.Id, pid: row.entity.PatientId });
                if ($scope.context == 'emr')
                    $state.go('patientemr.medicinerequestform', { id: row.entity.Id, pid: row.entity.PatientId });
            }
            if (actionType == 'edit') {
                if ($scope.context == 'main')
                    $state.go('app.patientrequest', { id: row.entity.Id, eid: row.entity.Id, pid: row.entity.PatientId });
                if ($scope.context == 'emr')
                    $state.go('patientemr.medicinerequestform', { id: row.entity.Id, pid: row.entity.PatientId });
            }
            else if (actionType == 'delete') {
                $scope.item.Id = row.entity.Id;
                $scope.item.PatientStockRequestId = row.entity.Id;
                $scope.item.PrescriptionId = row.entity.PrescriptionId;
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.PatientRequestNumber);
            } else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(row.entity.PatientId);
            }
        };

        var rowtpl = '<div ng-class="{\'priority\':row.entity.PatientRequestPriorityId==2 }"><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" ui-grid-cell></div></div>';

        var RequestDate = {
            field: "RequestDate",
            displayName: $translate.instant('patientrequests.requestedon.lbl'),
            cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.CreatedAt | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{row.entity.CreatedAt| date: 'HH:mm'}}</span>" + "</div>"
        }
        var PatientRequestNumber = {
            field: "PatientRequestNumber", displayName: $translate.instant('patientrequests.requestedno.lbl')

        }
        var Patient = {
            field: "Patient",
            displayName: $translate.instant('patientrequests.patient.lbl'),
            cellTemplate: "<div class='ui-grid-cell-contents'>"
                + '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)" uib-tooltip="{{row.entity.Patient.Title.Description}}&nbsp; .{{row.entity.Patient.FirstName}} / {{row.entity.Patient.MRN}}  / {{row.entity.Patient.Age}} / {{row.entity.Patient.Gender.Description}}" tooltip-placement="right" >'
                + "{{row.entity.Patient.Title.Description}}&nbsp;</span>"
                + "<span >{{row.entity.Patient.FirstName}}&nbsp;</span>"
                + "<span >{{row.entity.Patient.LastName}}</span>"
                + "<span >/</span>"
                + "<span >{{row.entity.Patient.MRN}}</span>"
                + "<span >/<span>"
                + "<span ng-if='row.entity.Patient.Title && row.entity.Patient.Title.Description' >"
                + "<span >{{row.entity.Patient.Age}}</span>"
                + "<span >/</span>"
                + "<span >{{row.entity.Patient.Gender.Description}}</span>"
                + "</a></div>"
        }
        var WardName = {
            field: "WardMaster.WardName", displayName: $translate.instant('patientrequests.ward.lbl')
        }
        var StoreName = { field: "ToStore.StoreName", displayName: $translate.instant('patientrequests.tostore.lbl') }
        var RequestedBy = {
            field: "RequestedUser",
            displayName: $translate.instant('patientrequests.requestedby.lbl'),
            cellTemplate: "<div class='ui-grid-cell-contents'>"
                + "{{row.entity.RequestedUser.Title.Description}}&nbsp;</span>"
                + "<span >{{row.entity.RequestedUser.FirstName}}&nbsp;</span>"
                + "<span >{{row.entity.RequestedUser.LastName}}</span>"
                + "</a></div>"
        }
        var PatientRequestPriority = { field: "PatientRequestPriority.Description", displayName: $translate.instant('patientrequests.priority.lbl') }
        var PatientRequestStatus = { field: "PatientRequestStatus.Description", displayName: $translate.instant('patientrequests.status.lbl') }
        var Id = {
            field: "Id",
            displayName: $translate.instant('common.actions_col.lbl'),
            cellTemplate: '<div class="ui-grid-cell-contents">\
                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'view\',row)" ng-show="row.entity.PatientRequestStatusId == 2 || row.entity.PatientRequestStatusId == 3 || row.entity.PatientRequestStatusId == 4 || row.entity.PatientRequestStatusId == 5 || row.entity.PatientRequestStatusId == 6 || row.entity.PatientRequestStatusId == 7"><i class="fas fa-eye" aria-hidden="true"></i></span>\
                                    <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)"ng-show="row.entity.PatientRequestStatusId == 1"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                                                                                   </div>',
            actions: [
                { actiontype: 'edit', display: 'common.editaction.lbl' },
                { actiontype: 'delete', display: 'common.deleteaction.lbl' },
                { actiontype: 'history', display: 'common.history.lbl' }

            ]
        }
        vm.gridConfig = {
            enableColumnResizing: true,
            rowTemplate: rowtpl,
            columnDefs: [RequestDate, PatientRequestNumber, Patient, WardName, StoreName, PatientRequestPriority, PatientRequestStatus, Id],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };
        if ($scope.context == 'emr') {
            vm.gridConfig.columnDefs = [];
            vm.gridConfig.columnDefs.push(RequestDate, PatientRequestNumber, WardName, StoreName, RequestedBy, PatientRequestPriority, PatientRequestStatus, Id);
        }

        function setDefaults() {
            var RequestedId = utl.Lookup.getDefault($scope.lookup.PatientRequestStatus, 'Requested');
            var AuthorizedId = utl.Lookup.getDefault($scope.lookup.PatientRequestStatus, 'Authorized');
            $scope.currentfilter.PatientRequestStatusId = RequestedId + "," + AuthorizedId;
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            setDefaults();
            initDynamicForm();
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "PatientRequestStatus" },
                { "Key": "ToStore" },
                { "Key": "PatientRequestPriority" },
                { "Key": "Ward" },
                { "Key": "Room" },
                { "Key": "RequestedUser" },
                { "Key": "ApprovedUser" }
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
    }

    patientRequestListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();