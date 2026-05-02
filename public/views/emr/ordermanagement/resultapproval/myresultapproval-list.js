(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('myResultApprovalListController', myResultApprovalListController);

    function myResultApprovalListController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));
        $scope.Items = [];
        $scope.currentfilter = {
            uid: utl.Session.getCurrentUserId(),
            PatientMRN: '',
            TestTypeId: $stateParams.tp ? parseInt($stateParams.tp) : -1,
            WorkOrderStatusId: 5, //SEND FOR APPROVAL
            EncounterTypeId: -1,
            // WorkOrderDate: utl.Formatter.getCurrentDate(),
            Ordereddate:  utl.Formatter.getCurrentDate(),
            WorkOrderdid: '',
            LabAssignTypeId: 1,
            ExternalProviderId: -1,
            SubDepartmentId: parseInt(utl.Session.getCurrentSubDepartmentId()),
        };
        $scope.currentcontext = {};
        if ($scope.currentfilter.TestTypeId == 1) { //lab
            $scope.currentcontext.deptcode = 8;
        } else if ($scope.currentfilter.TestTypeId == 2) { //radiology
            $scope.currentcontext.deptcode = 62;
        } else if ($scope.currentfilter.TestTypeId == 4) { //endoscopy
            $scope.currentcontext.deptcode = 60;
        }
        $scope.SubdeptDisable = true;
        $scope.disabledept = function () {
            if ($scope.currentfilter.SubDepartmentId == -1 || ($scope.currentfilter.SubDepartmentId != parseInt(utl.Session.getCurrentSubDepartmentId())))
                $scope.SubdeptDisable = false;
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
                LabAssignTypeId: 1,
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
                    { Key: 4, Value: 'true' },
                    { Key: 5, Value: $scope.currentfilter.uid },
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
            var approvalStautsId = utl.Lookup.getDefault($scope.lookup.WorkOrderStatus, 'Send For Approval');
            var approvedStatusId = utl.Lookup.getDefault($scope.lookup.WorkOrderStatus, 'Partially Approved');
            $scope.currentfilter.WorkOrderStatusId = approvalStautsId + "," + approvedStatusId;
            //Setting default status filters ends
        }
        /* $scope.handleEvents = function(actionType, row) {

               if(actionType == 'edit') {
                    $state.go('app.resultentry', { id: row.entity.Id, pt:'myapproval' });
               } else if (actionType == 'patientinfo') {
                       utl.Modal.open('registration.patientprofile', {
                           params: { pid: row.entity.PatientId }
                       });
               }
           };   */

        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: patientId },
                confirmCallback: $scope.getList
            });
        }


        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'edit') {
                $state.go('app.resultentry', { id: row.entity.Id, pt: 'myapproval' });
            } else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(row.entity.Patient.Id);
            } else if (actionType == 'amend') {
                $state.go('app.amendresultentry', { id: row.entity.Id, pt: 'myapproval' });
            } else if (actionType == 'ordertat') {
                utl.Modal.open('app.patientorderhistory', {
                    params: { pid: row.entity.PatientId, oid: row.entity.Id },
                    confirmCallback: $scope.onDetailSave
                });
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "WorkOrderdid", displayName: $translate.instant('ordermanagement.myresultapproval-list.workordernumber.lbl') },
                { field: "PatientOrder.OrderNumber", displayName: $translate.instant('ordermanagement.myresultapproval-list.ordernumber.lbl') },
                {
                    field: "Assigndate",
                    displayName: $translate.instant('ordermanagement.myresultapproval-list.workorderdate.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='row.entity.Assigndate'></ngformatdate>"
                },
                //{ field: "OrderPriority.Description", displayName: $translate.instant('ordermanagement.myresultapproval-list.priority.lbl') },

                {
                    field: "PatientMRN",
                    displayName: $translate.instant('ordermanagement.myresultapproval-list.patientinfo.lbl'),
                    width: '20%',
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)" uib-tooltip="{{row.entity.Patient.Title.Description}}&nbsp; .{{row.entity.Patient.FirstName}} / {{row.entity.Patient.MRN}}  / {{row.entity.Patient.Age}} / {{row.entity.Patient.Gender.Description}}" tooltip-placement="right" >' +
                        "{{row.entity.Patient.Title.Description}}&nbsp;</span>" +
                        "<span >{{row.entity.Patient.FirstName}}&nbsp;</span>" +
                        "<span >{{row.entity.Patient.LastName}}</span>" +
                        "<span >/</span>" +
                        "<span >{{row.entity.Patient.MRN}}</span>" +
                        "<span >/<span>" +
                        "<span ng-if='row.entity.Patient.Title && row.entity.Patient.Title.Description' >" +
                        "<span >{{row.entity.Patient.Age}}</span>" +
                        "<span >/</span>" +
                        "<span >{{row.entity.Patient.Gender.Description}}</span>" +
                        "</a></div>"
                },
                { field: "Encounter.VisitIdentifier", displayName: $translate.instant('patientemr.patientorder-list.opipno.lbl') },
                { field: "WorkOrderStatus.DisplayName", displayName: $translate.instant('ordermanagement.myresultapproval-list.workorderstatus.lbl') },
                { field: "Department.DepartmentName", displayName: $translate.instant('ordermanagement.myresultapproval-list.department.lbl') },
                {
                    field: "AssignedUser",
                    displayName: $translate.instant('ordermanagement.myorderprocess-list.assignedto.lbl'),
                    cellTemplate: "<displayuser user='row.entity.AssignedUser'></displayuser>"
                },
                { field: "LabAssignType.Description", displayName: $translate.instant('ordermanagement.orderassignment-list.assigntype.lbl') },
                { field: "ExternalProvider.ProviderName", displayName: $translate.instant('ordermanagement.orderassignment-list.externalprovider.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                              <span class="grid-action"ng-click="grid.appScope.handleEvents(\'edit\',row)" ><i class="btn btn-success btn-rounded fa fa-pencil" aria-hidden="true" uib-tooltip="Edit"></i></span>\
                              <span class="grid-action"ng-click="grid.appScope.handleEvents(\'amend\',row)"uib-tooltip="Amend"\
                              tooltip-placement="bottom"><i class="btn btn-danger btn-rounded fa fa-refresh" aria-hidden="true"ng-show="row.entity.WorkOrderStatusId == 7"></i></span>\
                              <span class="grid-action" ng-click="grid.appScope.handleEvents(\'ordertat\',row)" ><i class="btn btn-info btn-rounded fa fa-list" aria-hidden="true"uib-tooltip="Order TAT"\
                              tooltip-placement="bottom"></i></span>\
                              </div>',
                    // cellTemplate: 'actionTemplate.html',
                    // actions: [
                    //     { actiontype: 'edit', display: 'common.editaction.lbl' }
                    // ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            setDefaults();
            initDynamicForm();
            $scope.getList();
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

    myResultApprovalListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();