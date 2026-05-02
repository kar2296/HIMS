(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('samplereviewlistController', samplereviewlistController);

    function samplereviewlistController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];

        $scope.currentfilter = {
            OrdDeptId: -1,
            ordernrbillnr: '',
            OrderRequestDate: utl.Formatter.getCurrentDate(),
            // FrmOrderReqDate: '',
            // ToOrderReqDate: '',
            orderstatusid: -1,
            patienttypeid: -1,
            samplestatusid: -1,
            SubDepartmentId: parseInt(utl.Session.getCurrentSubDepartmentId()),
        };
        $scope.SubdeptDisable = true;
        $scope.disabledept = function() {
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
                // From: utl.Formatter.getCurrentDate(),
                // To: utl.Formatter.getCurrentDate(),
            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [
                    { type: 'date', translate: 'ordermanagement.orderacknowledgement-form.from.lbl', model: 'From', position: { r: 0, c: 0 } },
                    { type: 'date', translate: 'ordermanagement.orderacknowledgement-form.to.lbl', model: 'To', position: { r: 0, c: 1 } },
                    { type: 'text', translate: 'ordermanagement.orderacknowledgement-form.workorder.lbl', model: 'ordernrbillnr', position: { r: 0, c: 2 } },
                    { type: 'select', translate: 'patientemr.patientorder-list.orderedby.lbl', model: 'DoctorId', options: $scope.lookup.Doctor, position: { r: 1, c: 0 } },
                    { type: 'select', translate: 'patientemr.patientorder-list.orderfrom.lbl', model: 'OrderFromId', options: $scope.lookup.Department, position: { r: 1, c: 1 } },
                    { type: 'select', translate: 'admissions.filter_ward.lbl', model: 'WardId', options: $scope.lookup.Ward, position: { r: 1, c: 2 } },
                    { type: 'select', translate: 'admissions.filter_guarantor.lbl', model: 'GuarantorId', options: $scope.lookup.Guarantor, position: { r: 2, c: 0 } },
                    { type: 'select', translate: 'ordermanagement.orderacknowledgement-form.gtype.lbl', model: 'GuarantorTypeId', options: $scope.lookup.GuarantorType, position: { r: 2, c: 1 } },
                    { type: 'select', translate: 'ordermanagement.orderacknowledgement-list.orderstatus.lbl', model: 'orderstatusid', options: $scope.lookup.WorkOrderStatus, position: { r: 2, c: 2 } },
                ],
                actions: [
                    { type: 'apply', translate: 'common.applyaction.lbl', cls: 'btn-primary' },
                    { type: 'reset', translate: 'common.resetaction.lbl', cls: 'btn-danger' }
                ]
            };
        }
        $scope.dashboard = function() {
            $state.go('app.lisdashboard');
        };

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
            //Dynamic form  ends
        $scope.getListCallback = function(scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            $scope.disabledept();
        };

        $scope.getList = function(pageNo) {
            if (!$scope.currentfilter.OrderRequestDate) {
                utl.Alert.showErrorMsg($translate.instant('Please select any Date'));
                return;
            } else {
                var From = $filter('date')($scope.currentfilter.OrderRequestDate, 'yyyy-MM-dd 00:00:00') || null;
                var To = $filter('date')($scope.currentfilter.OrderRequestDate, 'yyyy-MM-dd 23:59:59') || null;
                if ($scope.currentfilter.PatOrdNo) {
                    var From = null;
                    var To = null;
                    $scope.currentfilter.samplestatusid = null;
                }
                var inputData = {
                    Params: [
                        // {
                        //     Key: 2,
                        //     Value: $scope.currentfilter.ordernrbillnr
                        // },
                        {
                            Key: 4,
                            Value: $scope.currentfilter.Patient
                        },
                        {
                            Key: 3,
                            Value: $scope.currentfilter.patienttypeid
                        },
                        {
                            Key: 20,
                            Value: $scope.currentfilter.PatOrdNo
                        },
                        {
                            Key: 21,
                            Value: $scope.currentfilter.samplestatusid
                        },
                        {
                            Key: 7,
                            Value: $scope.currentfilter.orderstatusid
                        },
                        {
                            Key: 7,
                            Value: $scope.advancedfilter.orderstatusid
                        },
                        {
                            Key: 8,
                            Value: $scope.advancedfilter.DoctorId
                        },
                        {
                            Key: 10,
                            Value: From
                        },
                        {
                            Key: 11,
                            Value: To
                        },
                        {
                            Key: 16,
                            Value: $scope.currentfilter.WorkOrderdid
                        },
                        {
                            Key: 17,
                            Value: utl.Session.getCurrentFacilityId()
                        },
                        {
                            Key: 18,
                            Value: $scope.currentfilter.VisitIdentifier
                        }
                    ],
                    PageContext: {
                        PageSize: vm.gridConfig.pagerObj.pageSize,
                        PageNumber: vm.gridConfig.pagerObj.currentPage
                    }
                };

                var options = {
                    action: 'lis/workordersample/GetWorkOrderSamples',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getListCallback
                };

                utl.Http.doAction(options);
            }
        };

        $scope.deleteItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function(deleteId) {
            var options = {
                action: '',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function(actionType, entity) {
            if (actionType == 'edit' || actionType == 'view') {
                $state.go('app.samplereview', { id: entity.Id });
            } else if (actionType == 'patientinfo') {
                utl.Modal.open('registration.patientprofile', {
                    params: { pid: entity.PatientId }
                });
            } else if (actionType == 'ordertat') {
                utl.Modal.open('app.patientorderhistory', {
                    params: { pid: entity.PatientId, oid: entity.Id },
                    confirmCallback: $scope.onDetailSave
                });
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "OrderRequestDate",
                    displayName: $translate.instant('ordermanagement.samplecollection.orderreqdate.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='entity.PatientOrder.OrderRequestDate'></ngformatdate>"
                },
                {
                    field: "OrderNumber",
                    width: "10%",
                    displayName: $translate.instant('ordermanagement.samplecollection.ordernr.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" > {{entity.PatientOrder.OrderNumber}} </div>'
                },
                {
                    field: "PatientMRN",
                    displayName: $translate.instant('ordermanagement.samplecollection.patientinfo.lbl'),
                    width: '15%',
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)" uib-tooltip="{{entity.Patient.Title.Description}}&nbsp; .{{entity.Patient.FirstName}} / {{entity.Patient.MRN}}  / {{entity.Patient.Age}} / {{entity.Patient.Gender.Description}}" tooltip-placement="right" >' +
                        "{{entity.Patient.Title.Description}}&nbsp;</span>" +
                        "<span >{{entity.Patient.FirstName}}&nbsp;</span>" +
                        "<span >{{entity.Patient.LastName}}</span>" +
                        "<span >/</span>" +
                        "<span >{{entity.Patient.MRN}}</span>" +
                        "<span >/<span>" +
                        "<span ng-if='entity.Patient.Title && entity.Patient.Title.Description' >" +
                        "<span >{{entity.Patient.Age}}</span>" +
                        "<span >/</span>" +
                        "<span >{{entity.Patient.Gender.Description}}</span>" +
                        "</a></div>"
                },
                {
                    field: "OrderPriority",
                    displayName: $translate.instant('ordermanagement.samplecollection.priority.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents " > {{entity.OrderPriority.Description}} </div>'
                },
                { field: "PatientWorkorder.WorkOrderdid", displayName: $translate.instant('ordermanagement.orderacknowledgement-form.workorder.lbl') },
                {
                    field: "Encounter.VisitIdentifier",
                    displayName: $translate.instant('ordermanagement.samplecollection.visitid.lbl')
                },
                {
                    field: "SampleStatus",
                    displayName: $translate.instant('ordermanagement.samplecollection.samplestatuse.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents " >{{entity.SampleStatus.Description}}</div>'
                },
                {
                    field: "SampleStatus",
                    displayName: $translate.instant('ordermanagement.samplecollection.orderstatus.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents " >{{entity.PatientOrder.OrderStatus.DisplayName}}</div>'
                },
                {
                    field: "LabAssignType",
                    displayName: $translate.instant('ordermanagement.samplecollection.labtype.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents " >{{entity.LabAssignType.Description}}</div>'
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"   ng-hide="entity.SampleStatusId == 5"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                    <span class="grid-action" ng-click="handleEvents(\'view\',entity)" ng-show="entity.SampleStatusId == 5"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                    <span class="grid-action" ng-click="handleEvents(\'ordertat\',entity)" ><i class="btn btn-info btn-rounded fa fa-list" aria-hidden="true"uib-tooltip="Order TAT"\
                    tooltip-placement="bottom"></i></span>\
                    </div>',
                    handleEvent: $scope.handleEvents,
                    actions: []
                }

            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            $scope.getList();
        }

        $scope.initLookup = function() {
            var inputData = [
                { "Key": "OrderStatus" },
                { "Key": "SampleStatus" },
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
                {
                    "Key": "SubDepartment",
                    Request: {
                        Params: [
                            { Key: 6, Value: $scope.currentcontext.deptcode }
                        ]
                    }
                },
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

    samplereviewlistController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();