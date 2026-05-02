(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('orderAssignmentListController', orderAssignmentListController);

    function orderAssignmentListController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            PatientMRN: '',
            TestTypeId: $stateParams.tp ? parseInt($stateParams.tp) : -1,
            WorkOrderStatusId: '1', //CREATED
            EncounterTypeId: -1,
            WorkOrderDate: '',
            WorkOrderdid: '',
            Ordereddate: utl.Formatter.getCurrentDate(),
            PendingAssignment: true,
            LabAssignTypeId: -1,
            ExternalProviderId: -1,
            SubDepartmentId: parseInt(utl.Session.getCurrentSubDepartmentId()),
        };
        $scope.currentcontext = {};
        $scope.SubdeptDisable = true;
        $scope.disabledept = function () {
            if ($scope.currentfilter.SubDepartmentId == -1 || ($scope.currentfilter.SubDepartmentId != parseInt(utl.Session.getCurrentSubDepartmentId())))
                $scope.SubdeptDisable = false;
        }
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
                controls: [{
                        type: 'date',
                        translate: 'ordermanagement.orderacknowledgement-form.from.lbl',
                        model: 'From',
                        position: {
                            r: 0,
                            c: 0
                        }
                    },
                    {
                        type: 'date',
                        translate: 'ordermanagement.orderacknowledgement-form.to.lbl',
                        model: 'To',
                        position: {
                            r: 0,
                            c: 1
                        }
                    },
                    {
                        type: 'text',
                        translate: 'ordermanagement.orderacknowledgement-form.workorder.lbl',
                        model: 'WorkOrderdid',
                        position: {
                            r: 0,
                            c: 2
                        }
                    },
                    {
                        type: 'select',
                        translate: 'patientemr.patientorder-list.orderedby.lbl',
                        model: 'Orderedbyid',
                        options: $scope.lookup.Doctor,
                        position: {
                            r: 1,
                            c: 0
                        }
                    },
                    {
                        type: 'select',
                        translate: 'patientemr.patientorder-list.orderfrom.lbl',
                        model: 'Departmentid',
                        options: $scope.lookup.Department,
                        position: {
                            r: 1,
                            c: 1
                        }
                    },
                    {
                        type: 'select',
                        translate: 'admissions.filter_ward.lbl',
                        model: 'WardId',
                        options: $scope.lookup.Ward,
                        position: {
                            r: 1,
                            c: 2
                        }
                    },
                    {
                        type: 'select',
                        translate: 'admissions.filter_guarantor.lbl',
                        model: 'GuarantorId',
                        options: $scope.lookup.Guarantor,
                        position: {
                            r: 2,
                            c: 0
                        }
                    },
                    {
                        type: 'select',
                        translate: 'ordermanagement.orderacknowledgement-form.gtype.lbl',
                        model: 'GuarantorTypeId',
                        options: $scope.lookup.GuarantorType,
                        position: {
                            r: 2,
                            c: 1
                        }
                    },
                    {
                        type: 'select',
                        translate: 'ordermanagement.orderacknowledgement-list.orderstatus.lbl',
                        model: 'WorkOrderStatusId',
                        options: $scope.lookup.WorkOrderStatus,
                        position: {
                            r: 2,
                            c: 2
                        }
                    },
                    {
                        type: 'select',
                        translate: 'ordermanagement.orderassignment-list.assigntype.lbl',
                        model: 'LabAssignTypeId',
                        options: $scope.lookup.LabAssignType,
                        position: {
                            r: 3,
                            c: 0
                        }
                    },
                    {
                        position: {
                            r: 3,
                            c: 1
                        }
                    },
                    {
                        position: {
                            r: 3,
                            c: 2
                        }
                    },

                ],
                actions: [{
                        type: 'apply',
                        translate: 'common.applyaction.lbl',
                        cls: 'btn-primary'
                    },
                    {
                        type: 'reset',
                        translate: 'common.resetaction.lbl',
                        cls: 'btn-danger'
                    }
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
                Params: [{
                        Key: 2,
                        Value: $scope.currentfilter.PendingAssignment
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.WorkOrderStatusId
                    },
                    {
                        Key: 6,
                        Value: $scope.currentfilter.TestTypeId
                    },
                    {
                        Key: 16,
                        Value: $scope.currentfilter.EncounterTypeId
                    },
                    {
                        Key: 8,
                        Value: $scope.currentfilter.PatientMRN
                    },
                    {
                        Key: 9,
                        Value: $scope.currentfilter.WorkOrderdid
                    },
                    {
                        Key: 11,
                        Value: From
                    },
                    {
                        Key: 12,
                        Value: To
                    },
                    {
                        Key: 11,
                        Value: FromOrd
                    },
                    {
                        Key: 12,
                        Value: ToOrd
                    },
                    {
                        Key: 9,
                        Value: $scope.advancedfilter.WorkOrderdid
                    },
                    {
                        Key: 3,
                        Value: $scope.advancedfilter.WorkOrderStatusId
                    },
                    {
                        Key: 13,
                        Value: $scope.advancedfilter.Orderedbyid
                    },
                    {
                        Key: 19,
                        Value: $scope.advancedfilter.WardId
                    },
                    {
                        Key: 14,
                        Value: $scope.advancedfilter.Departmentid
                    },
                    {
                        Key: 17,
                        Value: $scope.advancedfilter.LabAssignTypeId
                    },
                    {
                        Key: 18,
                        Value: $scope.currentfilter.ExternalProviderId
                    },
                    {
                        Key: 23,
                        Value: $scope.currentfilter.SubDepartmentId
                    },
                    {
                        Key: 29,
                        Value: utl.Session.getCurrentFacilityId()
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            if ($scope.currentfilter.PatientMRN) { // skip other coditions
                inputData.Params = [];
                inputData.Params.push({
                    Key: 8,
                    Value: $scope.currentfilter.PatientMRN
                });
                inputData.Params.push({
                    Key: 6,
                    Value: $scope.currentfilter.TestTypeId
                });
                if ($scope.currentfilter.SubDepartmentId > 0) {
                    inputData.Params.push({
                        Key: 23,
                        Value: $scope.currentfilter.SubDepartmentId
                    });
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

        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: patientId
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                utl.Modal.open('app.orderassignmentform', {
                    params: {
                        id: entity.Id,
                        pid: entity.PatientId,
                        ttid: $scope.currentfilter.TestTypeId,
                        subdeptid: $scope.currentfilter.SubDepartmentId
                    },
                    confirmCallback: $scope.getList
                });
            } else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(entity.PatientId);
            } else if (actionType == 'ordertat') {
                utl.Modal.open('app.patientorderhistory', {
                    params: {
                        pid: entity.PatientId,
                        oid: entity.Id
                    },
                    confirmCallback: $scope.onDetailSave
                });
            }
        }
        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "PatientOrder.OrderNumber",
                    displayName: $translate.instant('ordermanagement.orderassignment-list.ordernumber.lbl')
                },
                {
                    field: "WorkOrderdid",
                    displayName: $translate.instant('ordermanagement.orderacknowledgement-form.workorder.lbl')
                },
                {
                    field: "PatientOrder.OrderRequestDate",
                    displayName: $translate.instant('ordermanagement.orderassignment-list.orderdate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3>{{entity.PatientOrder.OrderRequestDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.PatientOrder.OrderRequestDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "OrderPriority.Description",
                    displayName: $translate.instant('ordermanagement.orderassignment-list.priority.lbl')
                },
                {
                    field: "Orderedby.FirstName",
                    displayName: $translate.instant('ordermanagement.orderacknowledgement-list.orderedby.lbl'),
                    cellTemplate: "<displayuser user='entity.Orderedby'></displayuser>"
                },
                {
                    field: "PatientMRN",
                    displayName: $translate.instant('ordermanagement.orderassignment-list.patientinfo.lbl'),
                    width: '20%',
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<a ng-click="handleEvents(\'patientinfo\',entity)" uib-tooltip="{{entity.Patient.Title.Description}}&nbsp; .{{entity.Patient.FirstName}} / {{entity.Patient.MRN}}  / {{entity.Patient.Age}} / {{entity.Patient.Gender.Description}}" tooltip-placement="right" >' +
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
                        "</a></div>",
                        handleEvent: $scope.handleEvents,
                },
                {
                    field: "WorkOrderStatus.DisplayName",
                    displayName: $translate.instant('ordermanagement.orderassignment-list.workorderstatus.lbl')
                },
                // {
                //     field: "AssignedUser",
                //     displayName: $translate.instant('ordermanagement.orderassignment-list.assignedto.lbl'),
                //     cellTemplate: "<span ng-if='entity.LabAssignTypeId != 3'> <displayuser user='entity.AssignedUser'></displayuser> </span> " +
                //         "<span ng-if='entity.LabAssignTypeId == 3'> {{entity.OtherFacility.FacilityName}} </span> "
                // },
                // {
                //     field: "LabAssignType.Description",
                //     displayName: $translate.instant('ordermanagement.orderassignment-list.assigntype.lbl')
                // },

                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                    <span class="grid-action"ng-click="handleEvents(\'edit\',entity)" ><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                              </div>',
                    handleEvent: $scope.handleEvents,
                }
                // {
                //     field: "ExternalProvider.ProviderName",
                //     displayName: $translate.instant('ordermanagement.orderassignment-list.externalprovider.lbl')
                // },
                // {
                //     field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                //     cellTemplate: 'actionTemplate.html',
                //     actions: [
                //         { actiontype: 'edit', display: 'common.editaction.lbl' }
                //     ]
                // }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };
        $('#patientname').focus();
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "EncounterType"
                },
                {
                    "Key": "WorkOrderStatus",
                    Default: false
                },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                {
                    "Key": "Department"
                },
                {
                    "Key": "Ward"
                },
                {
                    "Key": "Guarantor",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                {
                    "Key": "GuarantorType"
                },
                {
                    "Key": "OrderStatus"
                },
                {
                    "Key": "LabAssignType"
                },
                {
                    "Key": "ExternalProvider"
                },
                {
                    "Key": "SubDepartment",
                    Request: {
                        Params: [{
                            Key: 6,
                            Value: $scope.currentcontext.deptcode
                        }]
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
        // $scope.getList();
    }

    orderAssignmentListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();