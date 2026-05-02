(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ResultapproveAmendmentController', ResultapproveAmendmentController);

    function ResultapproveAmendmentController($rootScope, $timeout, $scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            TestTypeId: $stateParams.tp ? parseInt($stateParams.tp) : -1,
            Ordereddate: utl.Formatter.getCurrentDate(),
            SubDepartmentId: parseInt(utl.Session.getCurrentSubDepartmentId()),
            WorkOrderStatusId: 7
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

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            $scope.disabledept();
        };

        $scope.getList = function () {
                var From = $filter('date')($scope.currentfilter.Ordereddate, 'yyyy-MM-dd 00:00:00') || null;
                var To = $filter('date')($scope.currentfilter.Ordereddate, 'yyyy-MM-dd 23:59:59') || null;
                if ($scope.currentfilter.OrderBillNo || $scope.currentfilter.PatWoNum || $scope.currentfilter.PatNum) {
                    var From = null;
                    var To = null;
                    $scope.currentfilter.WorkOrderStatusId = null
                }

                var inputData = {
                    Params: [{
                        Key: 3,
                        Value: $scope.currentfilter.WorkOrderStatusId
                    },
                    {
                        Key: 28,
                        Value: $scope.currentfilter.OrderBillNo
                    },
                    {
                        Key: 32,
                        Value: $scope.currentfilter.PatWoNum
                    },
                    {
                        Key: 8,
                        Value: $scope.currentfilter.PatNum
                    },
                    {
                        Key: 6,
                        Value: $scope.currentfilter.TestTypeId
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
                        Key: 29,
                        Value: utl.Session.getCurrentFacilityId()
                    },
                    {
                        Key: 30,
                        Value: $scope.currentfilter.VisitIdentifier
                    },
                    {
                        Key: 13,
                        Value: $scope.currentfilter.DoctorId
                    },
                    {
                        Key: 16,
                        Value: $scope.currentfilter.EncounterTypeId
                    },
                    {
                        Key: 23,
                        Value: $scope.currentfilter.SubDepartmentId
                    },
                    {
                        Key: 35,
                        Value: $scope.currentfilter.SampleIdentifier
                    },
                    {
                        Key: 34,
                        Value: false
                    },                    ],
                    PageContext: {
                        PageSize: vm.gridConfig.pagerObj.pageSize,
                        PageNumber: vm.gridConfig.pagerObj.currentPage
                    }
                };
                var options = {
                    action: 'lis/patientworkorder/GetPatientWorkorders',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getListCallback
                };

                utl.Http.doAction(options);
        };

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        function setDefaults() {
            //Setting default status filters starts
            var approvedStatusId = utl.Lookup.getDefault($scope.lookup.WorkOrderStatus, 'APPROVED');
            var assignedStatusId = utl.Lookup.getDefault($scope.lookup.WorkOrderStatus, 'Assigned & In-progress');
            var partiallycompletedStautsId = utl.Lookup.getDefault($scope.lookup.WorkOrderStatus, 'Partially Completed');
            var rejectedStautsId = utl.Lookup.getDefault($scope.lookup.WorkOrderStatus, 'Rejected');
            $scope.currentfilter.WorkOrderStatusId = approvedStatusId;
            //Setting default status filters ends
        }
        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: patientId
                },
                confirmCallback: $scope.getList
            });
        }

        $scope.AssignOrderByIdCallback = function () {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $state.go('app.resultentry', {
                id: $scope.currentcontext.WorkOrderId
            });
        };
        $scope.assignOrder = function (workorderId) {
            $scope.currentcontext.WorkOrderId = workorderId;

            var options = {
                action: 'lis/patientworkorder/AssignOrderById',
                data: {
                    Id: workorderId
                },
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
                itemId: entity.Id
            };
            utl.Dialog.confirmMessage(confirmOptions);

        }
        $scope.backtoList = function () {
            $state.go('app.labdashboard');
        }

        $scope.canShowAction = function (actionType, row) {
            if (actionType == 'edit') {
                if (entity.UserId == utl.Session.getCurrentUserId()) {
                    return true;
                }
                return false;
            }
            if (actionType == 'attend') {
                if (entity.UserId == utl.Session.getCurrentUserId()) {
                    return false;
                }
                return true;
            }
            return true;
        }


        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                $state.go('app.resultentry', {
                    id: entity.Id,
                    testtypeid: entity.TestTypeId,
                    filter_orderdate: $scope.currentfilter.Ordereddate,
                    filter_patientname: $scope.currentfilter.PatWoNum,
                    filter_wostatus: $scope.currentfilter.WorkOrderStatusId,
                    filter_subdept: $scope.currentfilter.SubDepartmentId,
                    filter_encType: $scope.currentfilter.EncounterTypeId,
                    context: $scope.context
                });
            } else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(entity.Patient.Id);
            } else if (actionType == 'attend') {
                $scope.attendOrder(entity);
            }

            if (actionType == 'patientinfo') {
                utl.Modal.open('registration.patientprofile', {
                    params: {
                        pid: entity.PatientId
                    }
                });
            } else if (actionType == 'amend') {
                $state.go('app.resultamendform', {
                    id: entity.Id,
                    pt: 'myapproval'
                });
            } else if (actionType == 'ordertat') {
                utl.Modal.open('app.patientorderhistory', {
                    params: {
                        pid: entity.PatientId,
                        oid: entity.Id
                    },
                    confirmCallback: $scope.onDetailSave
                });
            } else if (actionType == 'worksheet') {
                $scope.printWorkSheet(entity.PatientId, entity.Id);
            }

        }

        $scope.printWorkSheet = function (PatientId, WorkOrderId) {
            var inputData = {
                Id: WorkOrderId
            };
            var options = {
                action: 'lis/patientworkorder/printWorkSheet',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }



        var sno = {
            field: "S.No",
            displayName: $translate.instant('inventory.purchaseorders.sno.lbl'),
            cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
        };
        var wonum = {
            field: "WorkOrderdid",
            displayName: $translate.instant('ordermanagement.myorderprocess-list.workordernumber.lbl'),
            cellTemplate: "<div class='ui-grid-cell-contents'>\<div style='color: #4407ff;' class='col-sm-2'><span>{{entity.WorkOrderdid || entity.WorkOrderId}}</span></div>\
                       &nbsp;\</div>"
        };
        var ordnum = {
            field: "OrderNumber",
            displayName: $translate.instant('Order No/Bill No'),
            cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.PatientOrder.OrderNumber}}&nbsp;/</span>" + "<span >{{entity.PatientOrder.BillNumber}}&nbsp;</span>" + "</div>"
        };
        var Sampleid = {
            field: "SampleIdentifier",
            displayName: $translate.instant('SampleId'),
            cellTemplate: '<div class="ui-grid-cell-contents " > {{entity.SampleIdentifier}} </div>'
        };
        var encType = {
            field: "Encounter.EncounterType.Description",
            displayName: $translate.instant('Patient Type')
        };
        var orderDate = {
            field: "Ordereddate",
            displayName: $translate.instant('ordermanagement.myorderprocess-list.workorderdate.lbl'),
            cellTemplate: "<ngformatdate datetime-val='entity.Ordereddate'></ngformatdate>"
        };
        var OrderPriority = {
            field: "OrderPriority.Description",
            displayName: $translate.instant('ordermanagement.myorderprocess-list.priority.lbl')
        };
        var PatientMRN = {
            field: "Patient.MRN",
            displayName: $translate.instant('Patient ID')
        };
        var PatInfo = {
            field: "PatientMRN",
            displayName: $translate.instant('ordermanagement.orderassignment-list.patientinfo.lbl'),
            width: '20%',
            cellTemplate: "<div class='ui-grid-cell-contents'>" +
                '<a ng-click="handleEvents(\'patientinfo\',entity)">' +
                "<b>{{entity.Patient.Title.Description}}</b>&nbsp;</span>" +
                "<span ><b>{{entity.Patient.FirstName}}</b>&nbsp;</span>" +
                "<span ><b>{{entity.Patient.LastName}}</b></span>" +
                "<span >/<span>" +
                "<span ng-if='entity.Patient.Title && entity.Patient.Title.Description' >" +
                "<span >{{entity.Patient.Age}}</span>" +
                "<span >/</span>" +
                "<span >{{entity.Patient.Gender.Description}}</span>" +
                "</a></div>",
            handleEvent: $scope.handleEvents
        };
        var OrderBy = {
            field: "Orderedbyname",
            displayName: $translate.instant('patientemr.patientorder-form.orderedby.lbl')
        };
        var WorderStatus = {
            field: "WorkOrderStatus.DisplayName",
            displayName: $translate.instant('ordermanagement.myorderprocess-list.workorderstatus.lbl')
        };
        var actions = {
            field: "Id",
            displayName: $translate.instant('common.actions_col.lbl'),
            // cellTemplate: 'conditionActionTemplate.html',
            cellTemplate: '<div class="ui-grid-cell-contents">\
                 <span class="grid-action" title="Edit" ng-click="handleEvents(\'amend\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                 </div>',
            handleEvent: $scope.handleEvents,
        };

        var colDefs = [sno, wonum,
            ordnum, Sampleid, encType, orderDate,
            OrderPriority, PatientMRN, PatInfo, OrderBy, WorderStatus, actions
        ];
        if ($scope.currentfilter.TestTypeId == 2) {
            var colDefs = [sno, wonum,
                ordnum, encType, orderDate,
                OrderPriority, PatientMRN, PatInfo, OrderBy, WorderStatus, actions
            ];
        }
        vm.gridConfig = {
            enableColumnResizing: true,
            background: {
                // flag: 'IsPackageAssigned',
                style: {
                    field: 'WorkOrderStatusId',
                    value: {
                        6: {
                            'background': 'red',
                            'color': '#fff'
                        }
                    }
                }
            },
            columnDefs: colDefs,
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };
        // {
        //     field: "S.No",
        //     displayName: $translate.instant('inventory.purchaseorders.sno.lbl'),
        //     cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
        // },
        // {
        //     field: "WorkOrderdid",
        //     displayName: $translate.instant('ordermanagement.myorderprocess-list.workordernumber.lbl'),
        //     cellTemplate: "<div class='ui-grid-cell-contents'>\<div style='color: #4407ff;class='col-sm-2'><span>{{entity.WorkOrderdid}}</span></div>\
        //        &nbsp;\</div>"
        // },
        // {
        //     field: "OrderNumber",
        //     displayName: $translate.instant('Order No/Bill No'),
        //     cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.PatientOrder.OrderNumber}}&nbsp;/</span>" + "<span >{{entity.PatientOrder.BillNumber}}&nbsp;</span>" + "</div>"
        // },
        // {
        //     field: "SampleIdentifier",
        //     displayName: $translate.instant('SampleId'),
        //     cellTemplate: '<div class="ui-grid-cell-contents " > {{entity.SampleIdentifier}} </div>'
        // },
        // // {
        // //     field: "PatientOrder.OrderNumber",
        // //     displayName: $translate.instant('ordermanagement.myorderprocess-list.ordernumber.lbl')
        // // },
        // {
        //     field: "Ordereddate",
        //     displayName: $translate.instant('ordermanagement.myorderprocess-list.workorderdate.lbl'),
        //     cellTemplate: "<ngformatdate datetime-val='entity.Ordereddate'></ngformatdate>"
        // },
        // {
        //     field: "OrderPriority.Description",
        //     displayName: $translate.instant('ordermanagement.myorderprocess-list.priority.lbl')
        // },
        // {
        //     field: "PatientMRN",
        //     displayName: $translate.instant('ordermanagement.orderassignment-list.patientinfo.lbl'),
        //     width: '20%',
        //     cellTemplate: "<div class='ui-grid-cell-contents'>" +
        //         '<a ng-click="handleEvents(\'patientinfo\',entity)">' +
        //         "<b>{{entity.Patient.Title.Description}}</b>&nbsp;</span>" +
        //         "<span ><b>{{entity.Patient.FirstName}}</b>&nbsp;</span>" +
        //         "<span ><b>{{entity.Patient.LastName}}</b></span>" +
        //         "<span >/</span>" +
        //         "<span >{{entity.Patient.MRN}}</span>" +
        //         "<span >/<span>" +
        //         "<span ng-if='entity.Patient.Title && entity.Patient.Title.Description' >" +
        //         "<span >{{entity.Patient.Age}}</span>" +
        //         "<span >/</span>" +
        //         "<span >{{entity.Patient.Gender.Description}}</span>" +
        //         "</a></div>",
        //     handleEvent: $scope.handleEvents
        // },
        // {
        //     field: "Orderedbyname",
        //     displayName: $translate.instant('patientemr.patientorder-form.orderedby.lbl')
        // },
        // {
        //     field: "Encounter.VisitIdentifier",
        //     displayName: $translate.instant('patientemr.patientorder-list.opipno.lbl')
        // },
        // {
        //     field: "WorkOrderStatus.DisplayName",
        //     displayName: $translate.instant('ordermanagement.myorderprocess-list.workorderstatus.lbl')
        // },
        // {
        //     field: "AssignedUser", displayName: $translate.instant('ordermanagement.myorderprocess-list.assignedto.lbl'),
        //     cellTemplate: "<displayuser user='entity.AssignedUser'></displayuser>"
        // },
        // { field: "LabAssignType.Description", displayName: $translate.instant('ordermanagement.orderassignment-list.assigntype.lbl') },
        // { field: "ExternalProvider.ProviderName", displayName: $translate.instant('ordermanagement.orderassignment-list.externalprovider.lbl') },
        // {
        //     field: "Id",
        //     displayName: $translate.instant('common.actions_col.lbl'),
        //     // cellTemplate: 'conditionActionTemplate.html',
        //     cellTemplate: '<div class="ui-grid-cell-contents">\
        //     <span class="grid-action" title="Edit" ng-click="handleEvents(\'edit\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
        //     </div>',
        //     handleEvent: $scope.handleEvents,
        // }





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
                $scope.currentfilter.Ordereddate = $stateParams.filter_orderdate;
                $scope.currentfilter.PatWoNum = $stateParams.filter_patientname;
                $scope.currentfilter.WorkOrderStatusId = $stateParams.filter_wostatus;
                $scope.currentfilter.SubDepartmentId = $stateParams.filter_subdept;
                $scope.currentfilter.EncounterTypeId = $stateParams.filter_encType;
                $scope.getList();
            } else {
                $scope.getList();
            }
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
                        type: 'text',
                        translate: 'ordermanagement.resultentry-form.refno.lbl',
                        model: 'ReferenceNo',
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

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "WorkOrderStatus",
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
                "Key": "EncounterType"
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
    }
    ResultapproveAmendmentController.$inject = ['$rootScope', '$timeout', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();