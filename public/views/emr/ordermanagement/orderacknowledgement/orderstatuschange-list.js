(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('orderstatuschangeController', orderstatuschangeController);

    function orderstatuschangeController($rootScope, $scope, $filter, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));

        $scope.Items = [];
        $scope.canOrderableSubDeptSplit = false;
        $scope.currentfilter = {
            OrderNumber: '',
            BillNumber: '',
            PatientMRN: '',
            OrderPriorityId: -1,
            OrderStatusId: '1',
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            TestTypeId: $stateParams.tp ? parseInt($stateParams.tp) : -1,
            VisitIdentifier: '',
            EncounterTypeId: -1
        };
        $scope.currentfilter.SubDepartmentId = -1;
        $scope.ParentDepartmentId = -1;
        if ($scope.currentfilter.TestTypeId == 1)
            $scope.ParentDepartmentId = 8; // LIS
        if ($scope.currentfilter.TestTypeId == 2)
            $scope.ParentDepartmentId = 62; // RIS
        if ($scope.currentfilter.TestTypeId == 4)
            $scope.ParentDepartmentId = 60; // Endoscopy

        var orderablesplit =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'orderableseparatebysubdept');
        $scope.showsubdept = 0;
        $scope.showsubdept =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'showsubdept');
        if (orderablesplit > 0) {
            $scope.canOrderableSubDeptSplit = true;
        }

        $scope.currentcontext = {};
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
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
                        model: 'OrderNumber',
                        position: {
                            r: 0,
                            c: 2
                        }
                    },
                    {
                        type: 'select',
                        translate: 'patientemr.patientorder-list.orderedby.lbl',
                        model: 'DoctorId',
                        options: $scope.lookup.Doctor,
                        position: {
                            r: 1,
                            c: 0
                        }
                    },
                    {
                        type: 'select',
                        translate: 'patientemr.patientorder-list.orderfrom.lbl',
                        model: 'OrderFromId',
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
                        model: 'OrderStatusId',
                        options: $scope.lookup.OrderStatus,
                        position: {
                            r: 2,
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

        $scope.dashboard = function () {
            if ($scope.currentfilter.TestTypeId == 1)
                $state.go('app.lisdashboard');
            else if ($scope.currentfilter.TestTypeId == 2)
                $state.go('app.risdashboard');
        };

        function handleDynamicFormEvents(actionType, formData) {
            $scope.advancedfilter = formData;
            $scope.getList();
        }
        $scope.backtoList = function () {
            $state.go('app.labdashboard');
        };
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
            vm.gridConfig.data = [];
            for (var idx in res.Data) {
                var item = res.Data[idx];
                item.IsExternal = '';
                if (item.IsExternalLab) {
                    item.IsExternal = 'Yes';
                }
                if (!item.IsExternalLab) {
                    item.IsExternal = 'No';
                }


                if (item.EncounterTypeId == 1) {
                    if (item.BillingId && item.BillingId > 0)
                        vm.gridConfig.data.push(item);

                } else {
                    vm.gridConfig.data.push(item);
                }

            }

            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            if (!$scope.currentfilter.FromDate || !$scope.currentfilter.ToDate) {
                utl.Alert.showErrorMsg($translate.instant('Please select any Date'));
                return;
            } else {
                var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
                var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
                if ($scope.currentfilter.BillOrderNumber || $scope.currentfilter.PatName) {
                    var From = null;
                    var To = null;
                }

                var inputData = {
                    Params: [{
                            Key: 3,
                            Value: $scope.currentfilter.OrderPriorityId
                        },
                        {
                            Key: 4,
                            Value: $scope.currentfilter.OrderStatusId
                        },
                        {
                            Key: 32,
                            Value: $scope.currentfilter.BillOrderNumber
                        },
                        {
                            Key: 8,
                            Value: $scope.currentfilter.PatName
                        },
                        {
                            Key: 9,
                            Value: $scope.currentfilter.TestTypeId
                        },
                        {
                            Key: 20,
                            Value: $scope.currentfilter.VisitTypeId
                        },
                        {
                            Key: 24,
                            Value: $scope.currentfilter.BillNumber
                        },
                        {
                            Key: 10,
                            Value: $scope.currentfilter.DoctorId
                        },
                        {
                            Key: 20,
                            Value: $scope.currentfilter.EncounterTypeId
                        },
                        {
                            Key: 12,
                            Value: From
                        },
                        {
                            Key: 13,
                            Value: To
                        },
                        // {
                        //     Key: 44,
                        //     Value: '0'
                        // },
                        // {
                        //     Key: 19,
                        //     Value: 2
                        // },

                        {
                            Key: 27,
                            Value: utl.Session.getCurrentFacilityId()
                        },
                        {
                            Key: 30,
                            Value: $scope.currentfilter.VisitIdentifier
                        }
                    ],
                    PageContext: {
                        PageSize: vm.gridConfig.pagerObj.pageSize,
                        PageNumber: vm.gridConfig.pagerObj.currentPage
                    }
                };

                if ($scope.canOrderableSubDeptSplit &&
                    $scope.currentfilter.SubDepartmentId) {
                    inputData.Params.push({
                        Key: 28,
                        Value: $scope.currentfilter.SubDepartmentId
                    });
                }

                if ($scope.currentfilter.PatientMRN && From && To) { // skip other coditions
                    inputData.Params = [];
                    var FRMDate = new Date(From);
                    ////FRMDate.setDate(FRMDate.getDate() - 10);
                    From = $filter('date')(FRMDate, 'yyyy-MM-dd 00:00:00') || null;
                    inputData.Params.push({
                        Key: 8,
                        Value: $scope.currentfilter.PatientMRN
                    });
                    inputData.Params.push({
                        Key: 12,
                        Value: From
                    });
                    inputData.Params.push({
                        Key: 13,
                        Value: To
                    });
                    if ($scope.canOrderableSubDeptSplit &&
                        $scope.currentfilter.SubDepartmentId) {
                        inputData.Params.push({
                            Key: 28,
                            Value: $scope.currentfilter.SubDepartmentId
                        });
                    }
                    inputData.Params.push({
                        Key: 9,
                        Value: $scope.currentfilter.TestTypeId
                    });
                }

                var options = {
                    action: 'emr/patientorder/GetPatientOrderWithoutDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getListCallback
                };

                utl.Http.doAction(options);
            }
        };

        $scope.getDateDiff = function () {
            var resultInHours = $scope.getDateDiffInHours(
                $scope.currentfilter.FromDate,
                $scope.currentfilter.ToDate
            );
            if (!(resultInHours >= 0 && resultInHours <= 72)) {
                utl.Alert.showSuccessMsg("From and To Date Difference should be less than 3 days...");
                $scope.currentfilter.FromDate = $filter('date')(new Date(), 'yyyy-MM-dd 00:00:00');
                $scope.currentfilter.ToDate = $filter('date')(new Date(), 'yyyy-MM-dd 23:59:59');
                return false;
            } else {
                $scope.getList();
            }
        }
        $scope.getDateDiffInHours = function (Date1, Date2) {
            var startTime = new Date(Date1);
            var endTime = new Date(Date2);
            var difference = endTime.getTime() - startTime.getTime();
            var resultInHours = Math.round(difference / (1000 * 60 * 60));
            return resultInHours;
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'emr/patientorder/DeletePatientOrder',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: patientId
                },
                confirmCallback: $scope.getList
            });
        }
        $scope.openModal = function (appKey, stateParams) {
            utl.Modal.open(appKey, {
                params: stateParams,
                confirmCallback: $scope.getList
            });
        }

        $scope.handleEvents = function (actionType, entity) {

            if (actionType == 'edit') {
                $state.go('app.orderstatuschangeform', {
                    id: entity.Id,
                    pid: entity.PatientId,
                    tp: entity.TestTypeId,
                    filter_fromdate: $scope.currentfilter.FromDate,
                    filter_billordernum: $scope.currentfilter.BillOrderNumber,
                    filter_todate: $scope.currentfilter.ToDate,
                    filter_encType: $scope.currentfilter.EncounterTypeId,
                    filter_OrdStatus: $scope.currentfilter.OrderStatusId,
                })
            } else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(entity.PatientId);
            } else if (actionType == 'token') {
                // $scope.openModal('app.token', { id: entity.Id, eid: entity.EncounterId, pid: entity.PatientId });
                utl.Modal.open('app.token', {
                    params: {
                        id: entity.Id,
                        eid: entity.EncounterId,
                        pid: entity.PatientId
                    },
                    confirmCallback: $scope.initLookup
                });
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
        //

        var sno = {
            field: "S.No",
            displayName: $translate.instant('inventory.purchaseorders.sno.lbl'),
            cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
        };

        var OrderDate = {
            field: "OrderRequestDate",
            displayName: $translate.instant('ordermanagement.orderacknowledgement-list.orderdate.lbl'),
            cellTemplate: "<div class='ui-grid-cell-contents'><span > {{entity.OrderRequestDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.OrderRequestDate| date: 'HH:mm'}}</span>" + "</div>"
        };

        var OrderNumber = {
            field: "OrderNumber",
            displayName: $translate.instant('Order No/Bill No'),
            cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.OrderNumber}}&nbsp;/</span>" + "<span >{{entity.BillNumber}}&nbsp;</span>" + "</div>"
        };

        var mrn = {
            field: "MRN",
            displayName: $translate.instant('Patient ID'),
            cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.Patient.MRN}}</span>" + "</div>"
        };

        var patName = {
            field: "Patient.FirstName",
            displayName: $translate.instant('ordermanagement.orderacknowledgement-list.patientinfo.lbl'),
            width: '20%',
            cellTemplate: "<div class='ui-grid-cell-contents'>" +
                '<a ng-click="handleEvents(\'patientinfo\',entity)" uib-tooltip="{{entity.Patient.Title.Description}}&nbsp; .{{entity.Patient.FirstName}} / {{entity.Patient.MRN}}  / {{entity.Patient.Age}} / {{entity.Patient.Gender.Description}}" tooltip-placement="right" >' +
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

        var encType = {
            field: "EncounterType",
            displayName: $translate.instant('Visit Type'),
            cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.EncounterType.Description}}</span>" + "</div>"
        };

        var subDept = {
            field: "SubDeparement.DepartmentName",
            displayName: $translate.instant('Sub Department')
        }

        var OrdPriority = {
            field: "OrderPriority.Description",
            displayName: $translate.instant('ordermanagement.orderacknowledgement-list.priority.lbl')
        };
        var OrderStatus = {
            field: "OrderStatus.DisplayName",
            displayName: $translate.instant('Order Status')
        };
        var isExternal = {
            field: "IsExternal",
            displayName: $translate.instant('Is External Orders')
        };

        var actions = {
            field: "Id",
            displayName: $translate.instant('common.actions_col.lbl'),
            cellTemplate: '<div ng-if="entity.PatientBillStatusId != 2" class="ui-grid-cell-contents">\
              <span class="grid-action"ng-click="handleEvents(\'edit\',entity)" ><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
             </div>',
            handleEvent: $scope.handleEvents,
        };

        if ($scope.showsubdept == 1) {
            var ColDefs = [sno, OrderDate, OrderNumber, mrn, patName, encType, subDept, OrdPriority, OrderStatus, isExternal, actions];
        } else {
            var ColDefs = [sno, OrderDate, OrderNumber, mrn, patName, encType, OrdPriority, OrderStatus, isExternal, actions];
        }


        var rowtpl =
            '<div ng-class="{\'priority\':entity.OrderPriorityId==2 , \'billcancelled\':entity.PatientBillStatusId == 2 , \'isadditionalvisit\':entity.IsAdditionalVisit == true}  "> \
        <div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" ui-grid-cell></div></div>';
        vm.gridConfig = {
            enableColumnResizing: true,
            background: {
                style: {
                    field: 'OrderPriorityId',
                    value: {
                        2: {
                            'background': 'red',
                            'color': '#fff'
                        },

                    }
                },
            },
            rowTemplate: rowtpl,
            columnDefs: ColDefs,
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
            if ($scope.canOrderableSubDeptSplit) {
                try {
                    $scope.currentfilter.SubDepartmentId =
                        parseInt(utl.Session.getCurrentSubDepartmentId());
                } catch (ex) {
                    $scope.currentfilter.SubDepartmentId = -1;
                }
            }
            initDynamicForm();
            if ($stateParams.filter_id > 0) {
                $scope.currentfilter.FromDate = $stateParams.filter_fromdate;
                $scope.currentfilter.ToDate = $stateParams.filter_todate;
                $scope.currentfilter.BillOrderNumber = $stateParams.filter_billordernum;
                $scope.currentfilter.EncounterTypeId = $stateParams.filter_encType;
                $scope.currentfilter.OrderStatusId = $stateParams.filter_OrdStatus;
                $scope.getList();
            } else {
                $scope.getList();
            }
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "OrderStatus",
                    Default: false
                },

                {
                    "Key": "EncounterType"
                },
                // {
                //     "Key": "OrderPriority"
                // },
                // {
                //     "Key": "EncounterType"
                // },
                // {
                //     "Key": "Doctor"
                // },
                // {
                //     "Key": "Department"
                // },
                // {
                //     "Key": "Ward"
                // },
                // {
                //     "Key": "Guarantor",
                //     Request: {
                //         Params: [{
                //             Key: 7,
                //             Value: utl.Session.getCurrentFacilityId()
                //         }]
                //     }
                // },
                // {
                //     "Key": "GuarantorType"
                // },
                // {
                //     "Key": "SubDepartment",
                //     Request: {
                //         Params: [{
                //             Key: 6,
                //             Value: $scope.ParentDepartmentId
                //         }]
                //     }
                // },

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

    orderstatuschangeController.$inject = ['$rootScope', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();