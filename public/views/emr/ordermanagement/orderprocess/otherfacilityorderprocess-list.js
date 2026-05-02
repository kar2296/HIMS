(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('otherOrderProcessListController', otherOrderProcessListController);

    function otherOrderProcessListController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            uid: utl.Session.getCurrentUserId(),
            PatientMRN: '',
            TestTypeId: $stateParams.tp ? parseInt($stateParams.tp) : -1,
            WorkOrderStatusId: -1,
            EncounterTypeId: -1,
            Ordereddate: utl.Formatter.getCurrentDate(),
            WorkOrderdid: '',
            LabAssignTypeId: 3,
            ExternalProviderId: -1,
            SubDepartmentId: parseInt(utl.Session.getCurrentSubDepartmentId()),
        };
        $scope.context = $stateParams.context
        $scope.SubdeptDisable = true;
        $scope.disabledept = function () {
            if ($scope.currentfilter.SubDepartmentId == -1 || ($scope.currentfilter.SubDepartmentId != parseInt(utl.Session.getCurrentSubDepartmentId())))
                $scope.SubdeptDisable = false;
        }
        $scope.currentcontext = {};
        if ($scope.currentfilter.TestTypeId == 1) { //lab
            $scope.currentcontext.deptcode = 8;
        } else if ($scope.currentfilter.TestTypeId == 2) { //radiology
            $scope.currentcontext.deptcode = 62;
        } else if ($scope.currentfilter.TestTypeId == 4) { //endoscopy
            $scope.currentcontext.deptcode = 60;
        }
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
                LabAssignTypeId: 3,
                // From: utl.Formatter.getCurrentDate(),
                // To: utl.Formatter.getCurrentDate(),
            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [
                    { type: 'date', translate: 'ordermanagement.orderacknowledgement-form.from.lbl', model: 'From', position: { r: 0, c: 0 } },
                    { type: 'date', translate: 'ordermanagement.orderacknowledgement-form.to.lbl', model: 'To', position: { r: 0, c: 1 } },
                    { type: 'text', translate: 'ordermanagement.orderacknowledgement-form.workorder.lbl', model: 'WorkOrderdid', position: { r: 0, c: 2 } },
                    { type: 'select', translate: 'patientemr.patientorder-list.orderedby.lbl', model: 'Orderedbyid', options: $scope.lookup.Doctor, position: { r: 1, c: 0 } },
                    { type: 'select', translate: 'patientemr.patientorder-list.orderfrom.lbl', model: 'Departmentid', options: $scope.lookup.Department, position: { r: 1, c: 1 } },
                    { type: 'select', translate: 'admissions.filter_ward.lbl', model: 'WardId', options: $scope.lookup.Ward, position: { r: 1, c: 2 } },
                    { type: 'select', translate: 'admissions.filter_guarantor.lbl', model: 'GuarantorId', options: $scope.lookup.Guarantor, position: { r: 2, c: 0 } },
                    { type: 'select', translate: 'ordermanagement.orderacknowledgement-form.gtype.lbl', model: 'GuarantorTypeId', options: $scope.lookup.GuarantorType, position: { r: 2, c: 1 } },
                    { type: 'select', translate: 'ordermanagement.orderacknowledgement-list.orderstatus.lbl', model: 'WorkOrderStatusId', options: $scope.lookup.WorkOrderStatus, position: { r: 2, c: 2 } },
                    { type: 'select', translate: 'ordermanagement.orderassignment-list.assigntype.lbl', model: 'LabAssignTypeId', options: $scope.lookup.LabAssignType, position: { r: 3, c: 0 } },
                    { type: 'text', translate: 'ordermanagement.resultentry-form.refno.lbl', model: 'ReferenceNo', position: { r: 3, c: 1 } },
                    { position: { r: 3, c: 2 } },
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
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            $scope.disabledept();
        };

        $scope.getList = function () {
            var FromOrd = $filter('date')($scope.advancedfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var ToOrd = $filter('date')($scope.advancedfilter.To, 'yyyy-MM-dd 23:59:59') || null;

            var From = $filter('date')($scope.currentfilter.Ordereddate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.Ordereddate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 3, Value: $scope.currentfilter.WorkOrderStatusId },
                    { Key: 6, Value: $scope.currentfilter.TestTypeId },
                    { Key: 8, Value: $scope.currentfilter.PatientMRN },
                    { Key: 9, Value: $scope.currentfilter.WorkOrderdid },
                    // { Key: 10, Value: utl.Formatter.getFilterDate($scope.currentfilter.WorkOrderDate) },
                    { Key: 16, Value: $scope.currentfilter.EncounterTypeId },
                    { Key: 11, Value: From },
                    { Key: 12, Value: To },
                    { Key: 11, Value: FromOrd },
                    { Key: 12, Value: ToOrd },
                    { Key: 9, Value: $scope.advancedfilter.WorkOrderdid },
                    { Key: 3, Value: $scope.advancedfilter.WorkOrderStatusId },
                    { Key: 13, Value: $scope.advancedfilter.Orderedbyid },
                    { Key: 14, Value: $scope.advancedfilter.Departmentid },
                    { Key: 17, Value: $scope.advancedfilter.LabAssignTypeId },
                    { Key: 18, Value: $scope.currentfilter.ExternalProviderId },
                    { Key: 23, Value: $scope.currentfilter.SubDepartmentId },
                    { Key: 29, Value: utl.Session.getCurrentFacilityId() },
                    { Key: 30, Value: $scope.currentfilter.VisitIdentifier },
                    { Key: 31, Value: $scope.advancedfilter.ReferenceNo }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            if ($scope.currentfilter.PatientMRN && From && To) { // skip other coditions
                inputData.Params = [];
                inputData.Params.push({ Key: 8, Value: $scope.currentfilter.PatientMRN });
                inputData.Params.push({ Key: 6, Value: $scope.currentfilter.TestTypeId });
                inputData.Params.push({ Key: 11, Value: From });
                inputData.Params.push({ Key: 12, Value: To });
                if ($scope.currentfilter.SubDepartmentId) {
                    inputData.Params.push({ Key: 23, Value: $scope.currentfilter.SubDepartmentId });
                }
            }
            var options = {
                action: 'lis/patientworkorder/GetPatientWorkorders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        function setDefaults() {
            //Setting default status filters starts
            var assignedStatusId = utl.Lookup.getDefault($scope.lookup.WorkOrderStatus, 'Assigned & In-progress');
            var partiallycompletedStautsId = utl.Lookup.getDefault($scope.lookup.WorkOrderStatus, 'Partially Completed');
            var rejectedStautsId = utl.Lookup.getDefault($scope.lookup.WorkOrderStatus, 'Rejected');
            $scope.currentfilter.WorkOrderStatusId = assignedStatusId + "," + partiallycompletedStautsId + "," + rejectedStautsId;
            //Setting default status filters ends
        }
        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: patientId },
                confirmCallback: $scope.getList
            });
        }

        $scope.AssignOrderByIdCallback = function () {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $state.go('app.resultentry', { id: $scope.currentcontext.WorkOrderId });
        };
        $scope.assignOrder = function (workorderId) {
            $scope.currentcontext.WorkOrderId = workorderId;

            var options = {
                action: 'lis/patientworkorder/AssignOrderById',
                data: { Id: workorderId },
                type: 'post',
                onComplete: $scope.AssignOrderByIdCallback
            };
            utl.Http.doAction(options);
        };

        $scope.attendOrder = function (row) {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'patientemr.patientorder-form.confirmmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.assignOrder,
                itemId: row.entity.Id
            };
            utl.Dialog.confirmMessage(confirmOptions);

        }

        $scope.canShowAction = function (actionType, row) {
            if (actionType == 'edit') {
                if (row.entity.UserId == utl.Session.getCurrentUserId()) {
                    return true;
                }
                return false;
            }
            if (actionType == 'attend') {
                if (row.entity.UserId == utl.Session.getCurrentUserId()) {
                    return false;
                }
                return true;
            }
            return true;
        }


        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'edit') {
                $state.go('app.resultentry', {
                    id: row.entity.Id,
                    filter_from: $scope.advancedfilter.From,
                    filter_to: $scope.advancedfilter.To,
                    filter_workorderid: $scope.advancedfilter.WorkOrderdid,
                    filter_orderbyid: $scope.advancedfilter.Orderedbyid,
                    filter_dept: $scope.advancedfilter.Departmentid,
                    filter_ward: $scope.advancedfilter.WardId,
                    filter_guarantor: $scope.advancedfilter.GuarantorId,
                    filter_guarantortype: $scope.advancedfilter.GuarantorTypeId,
                    filter_workorderstatus: $scope.advancedfilter.WorkOrderStatusId,
                    filter_labassigntype: $scope.advancedfilter.LabAssignTypeId,
                    filter_orderdate: $scope.currentfilter.Ordereddate,
                    filter_patientname: $scope.currentfilter.PatientMRN,
                    filter_wostatus: $scope.currentfilter.WorkOrderStatusId,
                    context: $scope.context
                });
            } else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(row.entity.Patient.Id);
            } else if (actionType == 'attend') {
                // $scope.attendOrder(row);
                $state.go('app.resultentry', { id: row.entity.Id });
            } else if (actionType == 'amend') {
                $state.go('app.amendresultentry', { id: row.entity.Id, pt: 'myapproval' });
            }
            if (actionType == 'patientinfo') {
                utl.Modal.open('registration.patientprofile', {
                    params: { pid: row.entity.PatientId }
                });
            }

        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "WorkOrderdid", displayName: $translate.instant('ordermanagement.myorderprocess-list.workordernumber.lbl') },
                { field: "PatientOrder.OrderNumber", displayName: $translate.instant('ordermanagement.myorderprocess-list.ordernumber.lbl') },
                {
                    field: "Ordereddate", displayName: $translate.instant('ordermanagement.myorderprocess-list.workorderdate.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='row.entity.Ordereddate'></ngformatdate>"
                },
                //{ field: "OrderPriority.Description", displayName: $translate.instant('ordermanagement.myorderprocess-list.priority.lbl') },
                {
                    field: "PatientMRN", displayName: $translate.instant('ordermanagement.orderassignment-list.patientinfo.lbl'),
                    width: '20%',
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
                },
                { field: "Encounter.EncounterType.Description", displayName: $translate.instant('ordermanagement.myorderprocess-list.visittype.lbl') },
                { field: "Encounter.VisitIdentifier", displayName: $translate.instant('patientemr.patientorder-list.opipno.lbl') },
                { field: "WorkOrderStatus.DisplayName", displayName: $translate.instant('ordermanagement.myorderprocess-list.workorderstatus.lbl') },
                {
                    field: "AssignedUser", displayName: $translate.instant('ordermanagement.myorderprocess-list.assignedto.lbl'),
                    cellTemplate: "<span ng-if='row.entity.LabAssignTypeId != 3'> <displayuser user='row.entity.AssignedUser'></displayuser> </span> "
                        + "<span ng-if='row.entity.LabAssignTypeId == 3'> {{row.entity.OtherFacility.FacilityName}} </span> "
                },
                { field: "LabAssignType.Description", displayName: $translate.instant('ordermanagement.orderassignment-list.assigntype.lbl') },
                { field: "ExternalProvider.ProviderName", displayName: $translate.instant('ordermanagement.orderassignment-list.externalprovider.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    // cellTemplate: 'conditionActionTemplate.html',
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" title="Edit" ng-click="grid.appScope.handleEvents(\'edit\',row)"><i class="fa fa-pencil btn btn-success btn-rounded" aria-hidden="true"></i></span>\
                    <span class="grid-action" title="Order TAT" ng-click="grid.appScope.handleEvents(\'ordertat\',row)"><i class="fa fa-list btn btn-info btn-rounded" aria-hidden="true"></i></span>\
                    <span class="grid-action" title="Amend" ng-click="grid.appScope.handleEvents(\'amend\',row)"><i class="btn btn-danger btn-rounded fa fa-refresh" aria-hidden="true"></i></span>\
                    <span class="grid-action" title="Attend" ng-click="grid.appScope.handleEvents(\'attend\',row)"><i class="btn btn-warning btn-rounded fa fa-check-square" aria-hidden="true"></i></span>\
                </div>',
                    actions: [
                        // { actiontype: 'edit', display: 'common.editaction.lbl' },
                        // { actiontype: 'ordertat', display: 'OrderTAT' },
                        // { actiontype: 'amend', display: 'Amend'},
                        // { actiontype: 'attend', display: 'common.attend-action.lbl' }
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };



        /*$scope.lookupCallback = function (scope, data, options, hasError) {
                $scope.lookup = hasError ? {} : data;
                $scope.getList();
            }

            $scope.initLookup = function () {
                var inputData = [
                                ];

                var options = {
                    action: '',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.lookupCallback
                };
                utl.Http.doAction(options);
            }

            $scope.initLookup();*/
        $('#patientname').focus();
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            setDefaults();
            initDynamicForm();
            if ($stateParams.filter_id > 0) {
                $scope.advancedfilter.From = $stateParams.filter_from,
                    $scope.advancedfilter.To = $stateParams.filter_to,
                    $scope.advancedfilter.WorkOrderdid = $stateParams.filter_workorderid,
                    $scope.advancedfilter.Orderedbyid = $stateParams.filter_orderbyid,
                    $scope.advancedfilter.Departmentid = $stateParams.filter_dept,
                    $scope.advancedfilter.WardId = $stateParams.filter_ward,
                    $scope.advancedfilter.GuarantorId = $stateParams.filter_guarantor,
                    $scope.advancedfilter.GuarantorTypeId = $stateParams.filter_guarantortype,
                    $scope.advancedfilter.WorkOrderStatusId = $stateParams.filter_workorderstatus,
                    $scope.advancedfilter.LabAssignTypeId = $stateParams.filter_labassigntype,
                    $scope.currentfilter.Ordereddate = $stateParams.filter_orderdate,
                    $scope.currentfilter.PatientMRN = $stateParams.filter_patientname,
                    $scope.currentfilter.WorkOrderStatusId = $stateParams.filter_wostatus,
                    $scope.getList();
            }
            else {
                $scope.getList();
            }
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "WorkOrderStatus", Default: false },
                { "Key": "EncounterType" },
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
                { "Key": "Ward" },
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
                { "Key": "OrderStatus" },
                { "Key": "LabAssignType" },
                { "Key": "ExternalProvider" },
                {
                    "Key": "SubDepartment",
                    Request: {
                        Params: [
                            { Key: 6, Value: $scope.currentcontext.deptcode }
                        ]
                    }
                },
            ];

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
    otherOrderProcessListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();