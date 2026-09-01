(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('daycarebillingListController', daycarebillingListController);

    function daycarebillingListController($rootScope, $scope, $stateParams, $state, $translate, utl, $filter, $timeout) {
        var vm = this;

        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            AdmissionStatusId: -1,
            WardId: -1,
            FindLockedBills: 0,
            IsEstimatedBill: 0,
            // admissiondate: utl.Formatter.getCurrentDate()
        };

        function initDynamicForm() {
            $scope.advancedfilter = {};
            $scope.advancedfilterDefault = {
                DepartmentId: -1,
                DoctorId: -1,
                GuarantorTypeId: -1,
                GuarantorId: -1
            };

            $scope.advancedFilterSchema = {
                layout: 'grid',
                title: 'common.advancedfilter-title.lbl',
                controls: [{
                        type: 'date',
                        translate: 'billing.inpatients.billfromdate.lbl',
                        model: 'BillFromDate',
                        position: {
                            r: 0,
                            c: 0
                        }
                    },
                    {
                        type: 'date',
                        translate: 'billing.inpatients.billtodate.lbl',
                        model: 'BillToDate',
                        position: {
                            r: 0,
                            c: 1
                        }
                    },
                    {
                        type: 'date',
                        translate: 'billing.inpatients.doa.lbl',
                        model: 'DOA',
                        position: {
                            r: 1,
                            c: 0
                        }
                    },
                    {
                        type: 'text',
                        translate: 'billing.inpatients.phone.lbl',
                        model: 'Phone',
                        position: {
                            r: 1,
                            c: 1
                        }
                    },
                    {
                        type: 'select',
                        translate: 'billing.inpatients.guarantor.lbl',
                        model: 'GuarantorId',
                        options: $scope.lookup.Guarantor,
                        position: {
                            r: 2,
                            c: 0
                        }
                    },
                    {
                        type: 'select',
                        translate: 'billing.inpatients.guarantortype.lbl',
                        model: 'GuarantorTypeId',
                        options: $scope.lookup.GuarantorType,
                        position: {
                            r: 2,
                            c: 1
                        }
                    },
                    {
                        type: 'select',
                        translate: 'billing.inpatients.admittingdoctors.lbl',
                        model: 'DoctorId',
                        options: $scope.lookup.Doctor,
                        position: {
                            r: 3,
                            c: 0
                        }
                    },
                    {
                        type: 'select',
                        translate: 'billing.inpatients.department.lbl',
                        model: 'DepartmentId',
                        options: $scope.lookup.Department,
                        position: {
                            r: 3,
                            c: 1
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

        $scope.openAdvancedFilter = function() {
            utl.Modal.openDynamicForm({
                modeldata: $scope.advancedfilter,
                defaultdata: $scope.advancedfilterDefault,
                schema: $scope.advancedFilterSchema,
                relativeto: '#btnadvanced',
                handleDynamicFormEvents: handleDynamicFormEvents
            });
        };
        $timeout(function() {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.custom_sort = function(a, b) {
            return new Date(b.AdmissionDate).getTime() - new Date(a.AdmissionDate).getTime();
        };
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.backtoList = function() {
            $state.go('app.billingsdashboard');
        };
        $scope.getListCallback = function(scope, data, options, hasError) {
            vm.gridConfig.data = [];
            if (data.Data.length > 0)
                data.Data.sort($scope.custom_sort);
            for (var idx in data.Data) {
                var item = data.Data[idx];
                if (item.FinalBills.length > 0) {
                    var FinalBill = item.FinalBills[0];
                }
                // } else if (item.FinalBills.length > 1) {
                //     var lastIndex = item.FinalBills.length - 1;
                //     var FinalBill = item.FinalBills[lastIndex];
                // }
                var BillDiscount = 0;
                var isFinalize = false;
                if (FinalBill) {
                    isFinalize = true;
                    BillDiscount = isNaN(parseFloat(FinalBill.BillDiscount)) ? 0 : parseFloat(FinalBill.BillDiscount);
                }
                var TotBillAmt = parseFloat(item.ActualAmount || 0) + parseFloat(item.RoundOffValue || 0);
                var Debit =
                    (isNaN(parseFloat(item.Disallowance)) ? 0 : parseFloat(item.Disallowance)) +
                    ((isNaN(parseFloat(item.TDS)) ? 0 : parseFloat(item.TDS))) +
                    (isNaN(parseFloat(item.Debit)) ? (0) : parseFloat(item.Debit));
                item.Debit = Debit;
                var Credit = (!item.IsPackageAssigned ?
                        (isNaN(parseFloat(TotBillAmt)) ? 0 : parseFloat(TotBillAmt)) :
                        (isNaN(parseFloat(item.InclusionAmount)) ? (0) : parseFloat(item.InclusionAmount)) +
                        (isNaN(parseFloat(item.ExclusionAmount)) ? (0) : parseFloat(item.ExclusionAmount))) -
                    (isFinalize ? BillDiscount :
                        (!item.IsPackageAssigned ?
                            (isNaN(parseFloat(item.DiscountAmount)) ? 0 : parseFloat(item.DiscountAmount)) :
                            (isNaN(parseFloat(item.PackageDiscountAmount)) ? 0 : parseFloat(item.PackageDiscountAmount))));

                item.Credit = (isNaN(parseFloat(Credit)) ? 0 : parseFloat(Credit));
                item.Balance = (Credit - (isNaN(parseFloat(item.Debit)) ? 0 : parseFloat(item.Debit)));
                if (item.FinalBills.length > 0)
                    item.Balance = item.Balance + (isNaN(parseFloat(item.FinalBills[0].RefundAmount)) ?
                        0 : parseFloat(item.FinalBills[0].RefundAmount));
                if (item.FinalBills.length > 0) {
                    if (item.FinalBills[0].OTRegisterId)
                        item.SurgeryEntryId = item.FinalBills[0].OTRegisterId;
                }

                const admission_array = [4, 5, 6]; //4-Clinical Discharge, 5-Financial Discharge, 6-Physical Discharge

                if (item.IsBillLock && !admission_array.includes(item.AdmissionStatusId)) {
                    item.ColorCode = 6;
                } else {
                    item.ColorCode = item.AdmissionStatusId;
                }
                vm.gridConfig.data.push(item);
            }
            $scope.getPagination();
            // vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
            $scope.refreshReactProps();
            // vm.gridConfig.pagerObj.totalItems = data.Data.length;
        };

        $scope.getList = function() {
            var FrmDate = $filter('date')($scope.advancedfilter.DOA, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.advancedfilter.DOA, 'yyyy-MM-dd 23:59:59') || null;
            var FrmDate = $filter('date')($scope.advancedfilter.BillFromDate, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.advancedfilter.BillToDate, 'yyyy-MM-dd 23:59:59') || null;
            var FromAdm = $filter('date')($scope.currentfilter.admissiondate, 'yyyy-MM-dd 00:00:00') || null;
            var ToAdm = $filter('date')($scope.currentfilter.admissiondate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                        Key: 1,
                        Value: utl.Session.getCurrentFacilityId()
                    },
                    {
                        Key: 17,
                        Value: FrmDate
                    },
                    {
                        Key: 18,
                        Value: ToDate
                    },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.WardId
                    },
                    {
                        Key: 15,
                        Value: 5
                    },
                    {
                        Key: 5,
                        Value: $scope.advancedfilter.DoctorId
                    },
                    {
                        Key: 6,
                        Value: $scope.advancedfilter.DepartmentId
                    },
                    {
                        Key: 11,
                        Value: $scope.currentfilter.PatientMRN
                    },
                    {
                        Key: 13,
                        Value: $scope.currentfilter.VisitIdentifier
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.AdmissionStatusId
                    },
                    {
                        Key: 21,
                        Value: $scope.advancedfilter.Phone
                    },
                    {
                        Key: 19,
                        Value: $scope.advancedfilter.GuarantorId
                    },
                    {
                        Key: 19,
                        Value: $scope.currentfilter.GuarantorId
                    },
                    {
                        Key: 23,
                        Value: $scope.advancedfilter.GuarantorTypeId
                    },
                    {
                        Key: 22,
                        Value: true
                    },
                    {
                        Key: 67,
                        Value: true
                    },
                    {
                        Key: 37,
                        Value: $scope.currentfilter.IsBillLock
                    },
                    {
                        Key: 58,
                        Value: $scope.currentfilter.IsPackageAssigned
                    },
                    {
                        Key: 46,
                        Value: $scope.currentfilter.IsEstimatedBill
                    },
                    {
                        Key: 17,
                        Value: FromAdm
                    },
                    {
                        Key: 18,
                        Value: ToAdm
                    },
                    {
                        Key: 60,
                        Value: $scope.currentfilter.TPAId
                    },
                    {
                        Key: 69,
                        Value: true
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            if ($scope.currentfilter.AdmissionStatusId == undefined || $scope.currentfilter.AdmissionStatusId == -1)
                inputData.Params.push({
                    Key: 31,
                    Value: [2, 3, 4, 5]
                })
            var options = {
                action: 'Visit/Visit/GetMINIPPatientsBills',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getListCallback = function(scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getPaginationCallback = function(scope, data, options, hasError) {
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
        };
        $scope.getPagination = function() {
            var FrmDate = $filter('date')($scope.advancedfilter.DOA, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.advancedfilter.DOA, 'yyyy-MM-dd 23:59:59') || null;
            var FrmDate = $filter('date')($scope.advancedfilter.BillFromDate, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.advancedfilter.BillToDate, 'yyyy-MM-dd 23:59:59') || null;
            var FromAdm = $filter('date')($scope.currentfilter.admissiondate, 'yyyy-MM-dd 00:00:00') || null;
            var ToAdm = $filter('date')($scope.currentfilter.admissiondate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                        Key: 1,
                        Value: utl.Session.getCurrentFacilityId()
                    },
                    {
                        Key: 17,
                        Value: FrmDate
                    },
                    {
                        Key: 18,
                        Value: ToDate
                    },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.WardId
                    },
                    {
                        Key: 15,
                        Value: 2
                    },
                    {
                        Key: 5,
                        Value: $scope.advancedfilter.DoctorId
                    },
                    {
                        Key: 6,
                        Value: $scope.advancedfilter.DepartmentId
                    },
                    {
                        Key: 11,
                        Value: $scope.currentfilter.PatientMRN
                    },
                    {
                        Key: 13,
                        Value: $scope.currentfilter.VisitIdentifier
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.AdmissionStatusId
                    },
                    {
                        Key: 21,
                        Value: $scope.advancedfilter.Phone
                    },
                    {
                        Key: 19,
                        Value: $scope.advancedfilter.GuarantorId
                    },
                    {
                        Key: 19,
                        Value: $scope.currentfilter.GuarantorId
                    },
                    {
                        Key: 23,
                        Value: $scope.advancedfilter.GuarantorTypeId
                    },
                    // {
                    //     Key: 22,
                    //     Value: true
                    // },
                    {
                        Key: 37,
                        Value: $scope.currentfilter.IsBillLock
                    },
                    {
                        Key: 58,
                        Value: $scope.currentfilter.IsPackageAssigned
                    },
                    {
                        Key: 46,
                        Value: $scope.currentfilter.IsEstimatedBill
                    },
                    {
                        Key: 17,
                        Value: FromAdm
                    },
                    {
                        Key: 18,
                        Value: ToAdm
                    },
                    {
                        Key: 60,
                        Value: $scope.currentfilter.TPAId
                    },
                    {
                        Key: 69,
                        Value: true
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            if ($scope.currentfilter.AdmissionStatusId == undefined || $scope.currentfilter.AdmissionStatusId == -1)
                inputData.Params.push({
                    Key: 31,
                    Value: [2, 3, 4, 5]
                })
            var options = {
                action: 'Visit/Visit/GetMINIPPatientsBills',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPaginationCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getLockedPatients = function(currentfilter) {
            if (currentfilter.FindLockedBills) {
                $scope.currentfilter.IsBillLock = 1;
                $scope.getList();
            } else {
                $scope.currentfilter.IsBillLock = 0;
                $scope.getList();
            }
        };

        $scope.getPackageassigned = function(currentfilter) {
            if (currentfilter.FindPackageAssigned) {
                $scope.currentfilter.IsPackageAssigned = 1;
                $scope.getList();
            } else {
                $scope.currentfilter.IsPackageAssigned = 0;
                $scope.getList();
            }
        };

        $scope.summaryipbilling = function() {
            $state.go('app.ipbillingtab.summary', {
                id: entity.Id
            });
        };

        $scope.patientprofiledetails = function(patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: patientId
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.handleEvents = function(actionType, entity) {
            if (actionType == 'edit') {
                $state.go('app.ipbillingtab.summary', {
                    id: entity.Id,
                    patientid: entity.PatientId,
                    isdaycare: entity.IsDayCare,
                    SurgeryEntryId: entity.SurgeryEntryId,
                    islocked: entity.IsBillLock,
                    filter_facilityid: utl.Session.getCurrentFacilityId,
                    filter_wardid: $scope.currentfilter.WardId,
                    filter_doctorid: $scope.advancedfilter.DoctorId,
                    filter_departmentid: $scope.advancedfilter.DepartmentId,
                    filter_patientmrn: $scope.currentfilter.PatientMRN,
                    filter_visitidentifier: $scope.currentfilter.VisitIdentifier,
                    filter_admissionstatusid: $scope.currentfilter.AdmissionStatusId,
                    filter_activestatusid: $scope.currentfilter.ActiveStatusId,
                    filter_phone: $scope.advancedfilter.Phone,
                    filter_guarantorid: $scope.advancedfilter.GuarantorId,
                    filter_guarantortypeid: $scope.advancedfilter.GuarantorTypeId,
                    filter_isbilllock: $scope.currentfilter.IsBillLock,
                    filter_isestimatedbill: $scope.currentfilter.IsEstimatedBill,
                    filter_billfromdate: $scope.advancedfilter.BillFromDate,
                    filter_billtodate: $scope.advancedfilter.BillToDate,
                });
            } else if (actionType == 'packages') {
                $state.go('app.packageassignment', {
                    id: entity.Id,
                    patientid: entity.PatientId,
                    gtid: entity.GuarantorTypeId,
                    gid: entity.GuarantorId,
                    islocked: entity.IsBillLock,
                });
            } else if (actionType == 'patientinfo') {
                utl.Modal.open('registration.patientprofile', {
                    params: {
                        pid: entity.PatientId
                    },
                    confirmCallback: $scope.getitem
                });
            }
        };

        // var rowtpl = '<div ng-class="{\'billlock\': entity.IsBillLock==1 } "><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" ui-grid-cell></div></div>';
        var rowtpl = '<div ng-class="{\'green\':row.entity.AdmissionStatusId==1, \'blue\':row.entity.AdmissionStatusId==2 }"><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" ui-grid-cell></div></div>';
        vm.gridConfig = {
            enableColumnResizing: true,
            background: {
                //flag: 'IsBillLock && AdmissionStatusId!=5',

                style: {
                    field: 'ColorCode',
                    value: {
                        //1:{'background':'#000000','color':'#fff'},
                        //2:{'background':'#8217a6','color':'#fff'},
                        //3:{'background':'#FFFF00','color':'#fff'},
                        //4:{'background':'#EE7700','color':'#fff'},
                        5: {
                            'background': '#4274d8ad',
                            'color': '#fff'
                        },
                        6: {
                            'background': '#ed143dad',
                            'color': '#fff'
                        },
                    }
                },

            },
            package: {
                flag: 'IsPackageAssigned',
                // style:{
                //     field:'Status',
                //     value:{
                //         1:{'background':'red','color':'#fff'}
                //     }
                // }
            },
            // background: {
            //     // flag: 'IsPackageAssigned',
            //     style: {
            //         field: 'IsPackageAssigned',
            //         value: {
            //             true: { 'background': 'green', 'color': '#fff' }
            //         }
            //     }
            // },
            columnDefs: [{
                    field: "VisitIdentifier",
                    displayName: $translate.instant('billing.inpatients.ipnumber.lbl')
                },
                {
                    field: "Patient",
                    displayName: $translate.instant('admissions.patientname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        // '<a ng-click="handleEvents(\'patientinfo\',entity)" uib-tooltip="{{entity.Patient.Title.Description}}&nbsp; .{{entity.Patient.FirstName}} / {{entity.Patient.MRN}}  / {{entity.Patient.Age}} / {{entity.Patient.Gender.Description}}" tooltip-placement="left" >' +
                        // "<b>{{entity.Patient.Title.Description}}</b>&nbsp;</span>" +
                        '<a class="grid-action" ng-click="handleEvents(\'patientinfo\',entity)"' +
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
                    handleEvent: $scope.handleEvents

                },
                {
                    field: "Patient",
                    displayName: $translate.instant('billing.inpatients.admittingdoctors.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<span ng-click="handleEvents(\'patientinfo\',entity)">' +
                        "<span >{{entity.Doctor.Title.Description}}&nbsp;</span>" +
                        "<span >{{entity.Doctor.FirstName}}&nbsp;</span>" +
                        "<span >{{entity.Doctor.LastName}}&nbsp;</span>" +
                        "</span></div>"
                },
                {
                    field: "WardRoomMaster",
                    displayName: $translate.instant('admissions.roomdetails.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        "<span  ng-if='entity.WardRoomMaster'>{{entity.WardMaster.WardName }}</span>" +
                        "<span  ng-if='entity.WardRoomMaster'>/</span>" +
                        "<span  ng-if='entity.WardRoomMaster'>{{entity.WardRoomMaster.RoomNo }}</span>" +
                        "<span  ng-if='entity.WardRoomMaster'>/</span>" +
                        "<span  ng-if='entity.WardRoomBedMaster'>{{entity.WardRoomBedMaster.BedNo}}</span>" +
                        "</div>"
                },
                {
                    field: "AdmissionDate",
                    displayName: $translate.instant('billing.inpatients.doa.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.AdmissionDate | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.AdmissionDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                // {
                //     field: "ALOS",
                //     displayName: $translate.instant('billing.inpatients.alos.lbl'),
                //     cellTemplate: "<div class='ui-grid-cell-contents'>" +
                //         "<span  ng-if='entity.WardRoomMaster && entity.ALOS'>{{entity.ALOS }}&nbsp; Days</span>" +
                //         "</div>"
                // },
                {
                    field: "Guarantor.GuarantorName",
                    displayName: $translate.instant('billing.inpatients.guarantor.lbl'),
                    width: '7%',
                },
                {
                    field: "Debit",
                    displayName: $translate.instant('billing.inpatients.debit.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.Debit | displaycurrency}}</span>" + "</div>"
                        // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{entity.Debit | displaycurrency}}</span>' + '</div>'
                },
                {
                    field: "Credit",
                    displayName: $translate.instant('billing.inpatients.credit.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.Credit | displaycurrency}}</span>" + "</div>"
                        // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{entity.Credit | displaycurrency}}</span>' + '</div>'
                },
                {
                    field: "Balance",
                    displayName: $translate.instant('billing.inpatients.balance.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.Balance | displaycurrency}}</span>" + "</div>"
                        // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{entity.Balance | displaycurrency}}</span>' + '</div>'
                },
                {
                    field: "AdmissionStatusId",
                    displayName: $translate.instant('billing.inpatients.status.lbl'),
                    width: '6%',
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
             <span>{{entity.AdmissionStatus.Description}}</span>\
                                            </div>"
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents billing-list-icon">\
                <a  ng-click="handleEvents(\'edit\',entity)"><i class="fas fa-procedures" uib-tooltip="DayCare patients"></i></a>\
                <a  ng-click="handleEvents(\'packages\',entity)"><i class="fas fa-file-invoice-dollar" uib-tooltip="Packages"></i></a>\
                  </div>',
                    handleEvent: $scope.handleEvents,
                    actions: []
                }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };


        //React bridge: the four filter <ui-select>s (Ward, Guarantor, Admission
        //Status, TPA) render through the shared BridgeLookupSelectScreen and
        //<custom-table config="vm.gridConfig"> through the shared
        //BridgeGridScreen. Each filter writes the same currentfilter field its
        //ng-model wrote and calls the same getList() its ng-change called, so
        //the request payload and paging are unchanged. Row actions dispatch
        //into this controller's existing, unchanged $scope.handleEvents.
        $scope.handleGridAction = function (actionType, payload) {
            var items = vm.gridConfig.data || [];
            var entity = null;
            for (var i = 0; i < items.length; i++) {
                if (items[i].Id === payload.id) { entity = items[i]; break; }
            }
            if (actionType == 'rowAction') {
                $scope.handleEvents(payload.key, entity);
            } else if (actionType == 'cellAction') {
                $scope.handleEvents('patientinfo', entity);
            }
        };

        function makeDaycareFilterHandler(field) {
            return function (actionType, payload) {
                if (actionType == 'change') {
                    $scope.currentfilter[field] = payload.id;
                    $scope.getList();
                }
            };
        }
        $scope.handleWardAction = makeDaycareFilterHandler('WardId');
        $scope.handleGuarantorAction = makeDaycareFilterHandler('GuarantorId');
        $scope.handleAdmissionStatusAction = makeDaycareFilterHandler('AdmissionStatusId');
        $scope.handleTPAAction = makeDaycareFilterHandler('TPAId');

        $scope.refreshReactProps = function () {
            var defs = vm.gridConfig.columnDefs || [];
            function hdr(i) { return defs[i] ? defs[i].displayName : ''; }
            function dt(v, f) { return v ? $filter('date')(v, f) : ''; }
            function cur(v) { return $filter('displaycurrency')(v); }
            function nameOf(o, withMrnAge) {
                if (!o) { return ''; }
                var s = (o.Title && o.Title.Description ? o.Title.Description + ' ' : '') + (o.FirstName || '') + ' ' + (o.LastName || '');
                if (withMrnAge) {
                    s += ' / ' + (o.MRN || '');
                    //Original wraps Age/Gender in ng-if="Patient.Title && Patient.Title.Description".
                    if (o.Title && o.Title.Description) {
                        s += ' / ' + (o.Age || '') + ' / ' + (o.Gender && o.Gender.Description ? o.Gender.Description : '');
                    }
                }
                return s.replace(/\s+/g, ' ').trim();
            }
            function roomLabel(e) {
                var out = '';
                if (e.WardRoomMaster) {
                    out += (e.WardMaster && e.WardMaster.WardName ? e.WardMaster.WardName : '') + ' / ' + (e.WardRoomMaster.RoomNo || '') + ' / ';
                }
                if (e.WardRoomBedMaster) { out += (e.WardRoomBedMaster.BedNo || ''); }
                return out;
            }
            var items = vm.gridConfig.data || [];
            $scope.reactPropsGridContainer = {
                reactProps: {
                    columns: [
                        { key: 'ipno', header: hdr(0), sortable: true },
                        { key: 'patient', header: hdr(1), link: true },
                        { key: 'doctor', header: hdr(2), link: true },
                        { key: 'roomdetails', header: hdr(3) },
                        { key: 'doa', header: hdr(4) },
                        { key: 'guarantor', header: hdr(5), sortable: true },
                        { key: 'debit', header: hdr(6), align: 'right' },
                        { key: 'credit', header: hdr(7), align: 'right' },
                        { key: 'balance', header: hdr(8), align: 'right' },
                        { key: 'status', header: hdr(9), sortable: true }
                    ],
                    actionsHeader: hdr(10) || 'Actions',
                    hasActions: true,
                    rows: items.map(function (entity) {
                        //config.background.style keys off ColorCode: 5 -> #4274d8ad,
                        //6 -> #ed143dad, both with #fff text. Reproduced per row.
                        var hs = null;
                        if (entity.ColorCode == 5) { hs = { background: '#4274d8ad', color: '#fff' }; }
                        else if (entity.ColorCode == 6) { hs = { background: '#ed143dad', color: '#fff' }; }
                        return {
                            id: entity.Id,
                            highlight: !!hs,
                            highlightStyle: hs,
                            //Both actions are unconditional in the original cellTemplate.
                            actions: [
                                { key: 'edit', label: '', icon: 'fas fa-procedures', variant: 'icon', title: 'DayCare patients' },
                                { key: 'packages', label: '', icon: 'fas fa-file-invoice-dollar', variant: 'icon', title: 'Packages' }
                            ],
                            cells: {
                                ipno: entity.VisitIdentifier,
                                patient: nameOf(entity.Patient, true),
                                doctor: nameOf(entity.Doctor, false),
                                roomdetails: roomLabel(entity),
                                doa: dt(entity.AdmissionDate, 'dd-MMM-yyyy') + ' ' + dt(entity.AdmissionDate, 'HH:mm'),
                                guarantor: entity.Guarantor && entity.Guarantor.GuarantorName,
                                debit: cur(entity.Debit),
                                credit: cur(entity.Credit),
                                balance: cur(entity.Balance),
                                status: entity.AdmissionStatus && entity.AdmissionStatus.Description
                            }
                        };
                    })
                },
                onAction: $scope.handleGridAction
            };
            var lk = $scope.lookup || {};
            $scope.reactPropsWardContainer = { reactProps: { options: lk.Ward || [], value: $scope.currentfilter.WardId }, onAction: $scope.handleWardAction };
            $scope.reactPropsGuarantorContainer = { reactProps: { options: lk.Guarantor || [], value: $scope.currentfilter.GuarantorId }, onAction: $scope.handleGuarantorAction };
            $scope.reactPropsAdmissionStatusContainer = { reactProps: { options: lk.AdmissionStatus || [], value: $scope.currentfilter.AdmissionStatusId }, onAction: $scope.handleAdmissionStatusAction };
            $scope.reactPropsTPAContainer = { reactProps: { options: lk.TPA || [], value: $scope.currentfilter.TPAId }, onAction: $scope.handleTPAAction };
        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            if ($stateParams.filter_id > 0) {
                $scope.currentfilter.FacilityId = $stateParams.filter_facilityid;
                $scope.currentfilter.WardId = $stateParams.filter_wardid;
                $scope.advancedfilter.DoctorId = $stateParams.filter_doctorid;
                $scope.advancedfilter.DepartmentId = $stateParams.filter_departmentid;
                $scope.currentfilter.PatientMRN = $stateParams.filter_patientmrn;
                $scope.currentfilter.VisitIdentifier = $stateParams.filter_visitidentifier;
                $scope.currentfilter.AdmissionStatusId = $stateParams.filter_admissionstatusid;
                $scope.currentfilter.ActiveStatusId = $stateParams.filter_activestatusid;
                $scope.advancedfilter.Phone = $stateParams.filter_phone;
                $scope.advancedfilter.GuarantorId = $stateParams.filter_guarantorid;
                $scope.advancedfilter.GuarantorTypeId = $stateParams.filter_guarantortypeid;
                $scope.currentfilter.IsBillLock = $stateParams.filter_isbilllock;
                $scope.currentfilter.IsEstimatedBill = $stateParams.filter_isestimatedbill;
                $scope.advancedfilter.BillFromDate = $stateParams.filter_isbilllock;
                $scope.advancedfilter.BillToDate = $stateParams.filter_billtodate;
                $scope.advancedfilter.DOA = $stateParams.filter_doa;
                $scope.getList();
            } else {
                $scope.getList();
            }
        };

        $scope.initLookup = function() {
            var inputData = [
                // {
                //     "Key": "Facility"
                // },
                {
                    "Key": "AdmissionStatus"
                },
                {
                    "Key": "Ward"
                },
                // {
                //     "Key": "Doctor"
                // },
                {
                    "Key": "TPA"
                },
                // {
                //     "Key": "Department"
                // },
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
                }
            ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.refreshReactProps();

        $scope.initLookup();
    }

    daycarebillingListController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$timeout'];

})();