(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('PatientReturnsListController', PatientReturnsListController);

    function PatientReturnsListController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.context = 'main';
        if ($stateParams && $stateParams.tp) {
            $scope.context = $stateParams.tp;
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        }

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            PatientReturnPriorityId: -1,
            ToStoreId: -1,
            PatientReturnNumber: '',
            WardId: -1,
            RoomId: -1,
            PatientReturnStatusId: 2,
            PatientReturnDateTime: utl.Formatter.getCurrentDate(),
        };

        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        if ($stateParams.from) {
            $scope.From = $stateParams.from;
        }
        if ($stateParams.pid) {
            $scope.currentcontext.pid = $stateParams.pid;
        } else {
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        }
        if ($stateParams.eid) {
            $scope.currentcontext.eid = $stateParams.eid;
        } else {
            $scope.currentcontext.eid = parseInt(utl.Session.getEncounterId());
        }

        $scope.advancedfilter = {
            From: utl.Formatter.getCurrentDate(),
            To: utl.Formatter.getCurrentDate(),
        };

        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {
                RemarkId: -1,
                LocationId: -1,
                PatientReturnTypeId: -1,
                DoctorId: -1,
                PatientId: -1,
                From: utl.Formatter.getCurrentDate(),
                To: utl.Formatter.getCurrentDate(),
            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [
                    { type: 'date', translate: 'patientreturns.fromdate.lbl', model: 'From', position: { r: 0, c: 0 } },
                    { type: 'date', translate: 'patientreturns.todate.lbl', model: 'To', position: { r: 0, c: 1 } },
                    { type: 'select', translate: 'patientreturns.returnedby.lbl', model: 'ReturnedBy', options: $scope.lookup.ReturnedUser, position: { r: 1, c: 0 } },
                    { type: 'select', translate: 'patientreturns.approvedby.lbl', model: 'ApprovedBy', options: $scope.lookup.ApprovedUser, position: { r: 1, c: 1 } },
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

        $scope.openAdvancedFilter = function() {
            utl.Modal.openDynamicForm({
                modeldata: $scope.advancedfilter,
                defaultdata: $scope.advancedfilterDefault,
                schema: $scope.advancedFilterSchema,
                relativeto: '#btnadvanced',
                handleDynamicFormEvents: handleDynamicFormEvents
            });
        }

        $scope.doctor_dashboard = function() {
            if ($scope.From == 'nursing') {
                $state.go('app.nursingdashboard');
            } else {
                $state.go('app.doctordashboard');
            }
        }
        $scope.patient_dashboard = function() {
            $state.go('patientemr.emrdashboard');
        }


        $scope.getListCallback = function(scope, data, options, hasError) {
            $scope.PatientStockReturn = data.Data;
            vm.gridConfig.data = data.Data;
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
        };

        $scope.getList = function(pageNo) {
            // if ($scope.advancedfilter.FromDate !== null || $scope.advancedfilter.ToDate !== null) {
            //     $scope.currentfilter.PatientReturnDateTime = '';
            // }

            var FromReq = $filter('date')($scope.advancedfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var ToReq = $filter('date')($scope.advancedfilter.To, 'yyyy-MM-dd 23:59:59') || null;

            var From = $filter('date')($scope.currentfilter.PatientReturnDateTime, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.PatientReturnDateTime, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [
                    { Key: 8, Value: $scope.currentfilter.FacilityId },
                    { Key: 9, Value: $scope.currentfilter.ToStoreId },
                    { Key: 2, Value: $scope.currentfilter.PatientReturnNumber },
                    { Key: 5, Value: $scope.currentfilter.PatientId },
                    //{ Key: 17, Value: $scope.currentfilter.PatientReturnDateTime },
                    { Key: 4, Value: $scope.currentfilter.PatientReturnStatusId },
                    { Key: 11, Value: $scope.currentfilter.PatientName },
                    { Key: 6, Value: $scope.currentfilter.WardId },
                    { Key: 7, Value: $scope.currentfilter.RoomId },
                    { Key: 10, Value: $scope.currentfilter.PatientReturnPriorityId },
                    { Key: 14, Value: From },
                    { Key: 15, Value: To },
                    { Key: 14, Value: FromReq },
                    { Key: 15, Value: ToReq },
                    { Key: 12, Value: $scope.advancedfilter.RequestedBy },
                    { Key: 13, Value: $scope.advancedfilter.ApprovedBy },


                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            if ($scope.context == 'emr' || $scope.context == 'surgery')
                inputData.Params.push({ Key: 5, Value: $scope.currentcontext.pid });

            var options = {
                action: 'IPManagement/PatientStockReturns/GetPatientStockReturns',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function() {
            // if ($scope.context == 'main')
            //     $state.go('app.ipreturn', { id: 0 });
            // else if ($scope.context == 'emr')
            $state.go('patientemr.medicinereturn', { id: 0 });
        };

        $scope.deleteItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function(deleteId) {
            var options = {
                action: 'IPManagement/PatientStockReturns/DeletePatientStockReturns',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.patientprofiledetails = function(patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: patientId },
                confirmCallback: $scope.getList
            });
        };

        $scope.handleEvents = function(actionType, entity) {
            if (actionType == 'edit') {
                if ($scope.context == 'main')
                    $state.go('app.patientreturn', { id: entity.Id, pid: entity.PatientId });
                if ($scope.context == 'emr')
                    $state.go('patientemr.medicinereturn', { id: entity.Id, pid: entity.PatientId });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.PatientStockRequestsIdentifier);
            } else if (actionType == 'view') {
                if ($scope.context == 'main')
                    $state.go('app.patientreturn', { id: entity.Id, pid: entity.PatientId });
                if ($scope.context == 'emr')
                    $state.go('patientemr.medicinereturn', { id: entity.Id, pid: entity.PatientId });
            } else if (actionType == 'patientinfo') {
                if ($scope.context == 'emr')
                    $scope.patientprofiledetails(entity.PatientId);
            }
        };

        var rowtpl = '<div ng-class="{\'priority\':entity.PatientReturnPriorityId==2 }"><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" ui-grid-cell></div></div>';
        var PatientReturnDateTime = {
            field: "PatientReturnDateTime",
            displayName: $translate.instant('patientreturns.returndate.lbl'),
            cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.PatientReturnDateTime | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.PatientReturnDateTime| date: 'HH:mm'}}</span>" + "</div>"
        }
        var PatientReturnNumber = { field: "PatientReturnNumber", displayName: $translate.instant('patientreturns.returnno.lbl') }
        var Patient = {
                field: "Patient",
                displayName: $translate.instant('patientreturns.patient.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    '<a ng-click="handleEvents(\'patientinfo\',row)" uib-tooltip="{{entity.Patient.Title.Description}}&nbsp; .{{entity.Patient.FirstName}} / {{entity.Patient.MRN}}  / {{entity.Patient.Age}} / {{entity.Patient.Gender.Description}}" tooltip-placement="right" >' +
                    "<b>{{entity.Patient.Title.Description}}</b>&nbsp;</span>" +
                    "<span ><b>{{entity.Patient.FirstName}}</b>&nbsp;</span>" +
                    "<span ><b>{{entity.Patient.LastName}}</b></span>" +
                    "<span >/</span>" +
                    "<span >{{entity.Patient.MRN}}</span>" +
                    "<span >/<span>" +
                    "<span ng-if='entity.Patient.Title && entity.Patient.Title.Description' >" +
                    "<span >{{entity.Patient.Age}}</span>" +
                    "<span >/</span>" +
                    "<span >{{entity.Patient.Gender.Description}}</span>" +
                    "</a></div>"
            }
            // var WardName = { field: "WardMaster.WardName", displayName: $translate.instant('patientreturns.ward.lbl') }
            // var RoomNo = {

        //     field: "WardRoomMaster.RoomNo",
        //     displayName: $translate.instant('patientreturns.roomdetail.lbl')
        // }
        var StoreName = { field: "ToStore.StoreName", displayName: $translate.instant('patientreturns.tostore.lbl') }
        var PatientReturnPriority = { field: "PatientReturnPriority.Description", displayName: $translate.instant('patientreturns.priority.lbl') }
        var PatientReturnStatus = { field: "PatientReturnStatus.Description", displayName: $translate.instant('patientreturns.status.lbl') }
        var ReturnBy = {
            field: "ReturnedUser",
            displayName: $translate.instant('Return By'),
            cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.ReturnedUser.Title.Description}}</span>" + "<span >{{entity.ReturnedUser.FirstName}}</span>" + "<span >{{entity.ReturnedUser.LastName}}</span>" + "</div>"
        }
        var Id = {
            field: "Id",
            displayName: $translate.instant('common.actions_col.lbl'),
            cellTemplate: '<div class="ui-grid-cell-contents">\
                                                <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.PatientReturnStatusId==2||entity.PatientReturnStatusId==3||entity.PatientReturnStatusId==4||entity.PatientReturnStatusId==5||entity.PatientReturnStatusId==7"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                                                <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.PatientReturnStatusId==1"><i class="fa fa-pencil" aria-hidden="true"></i></span>\
                                                <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.PatientReturnStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                                            </div>',
            handleEvent: $scope.handleEvents,
            actions: [
                { actiontype: 'edit', display: 'common.editaction.lbl' },
                { actiontype: 'delete', display: 'common.deleteaction.lbl' },
                { actiontype: 'history', display: 'common.history.lbl' }
            ]
        }
        vm.gridConfig = {
            enableColumnResizing: true,
            rowTemplate: rowtpl,
            columnDefs: [PatientReturnDateTime, PatientReturnNumber, Patient, StoreName, PatientReturnPriority, ReturnBy, PatientReturnStatus, Id],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };
        if ($scope.context == 'emr') {
            vm.gridConfig.columnDefs = [];
            vm.gridConfig.columnDefs.push(PatientReturnDateTime, PatientReturnNumber, StoreName, PatientReturnPriority, ReturnBy, PatientReturnStatus, Id);
        }

        function setDefaults() {
            var DraftId = utl.Lookup.getDefault($scope.lookup.PatientReturnStatus, 'Draft');
            var ApprovedId = utl.Lookup.getDefault($scope.lookup.PatientReturnStatus, 'Returned');
            var AuthorizedId = utl.Lookup.getDefault($scope.lookup.PatientReturnStatus, 'Authorized');
            $scope.currentfilter.PatientReturnStatusId = DraftId + "," + ApprovedId + "," + AuthorizedId;
        }

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            setDefaults();
            initDynamicForm();
            $scope.getList();
        };

        $scope.initLookup = function() {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "PatientReturnStatus",
                    Default: false },
                { "Key": "ToStore" },
                { "Key": "PatientReturnPriority" },
                { "Key": "Ward" },
                { "Key": "Room" },
                { "Key": "ReturnedUser" },
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

    PatientReturnsListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();