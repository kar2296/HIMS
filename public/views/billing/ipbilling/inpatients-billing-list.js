(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('inpatientsBillListController', inpatientsBillListController);

    function inpatientsBillListController($rootScope, $scope, $stateParams, $state, $translate, utl, $filter, $timeout) {
        var vm = this;

        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            AdmissionStatusId: -1,
            WardId: -1,
            FindLockedBills: 0,
            IsEstimatedBill: 0,
            // admissiondate: utl.Formatter.getCurrentDate()
        };

        $scope.totalOccupancy = 0;
        $scope.todayAdmission = 0;
        $scope.todayDischarge = 0;
        $scope.pendingDischarge = 0;
        $scope.activeFilter = 0;
        $scope.self = 0;
        $scope.insurance = 0;
        $scope.corporate = 0;
        $scope.government = 0;

        $scope.executeautobilllock = 0;
        $scope.executeautobilllock =
            (utl.FacilitySetting.getFacilitySettingValue('billing', 'isautobilllock')) ? utl.FacilitySetting.getFacilitySettingValue('billing', 'isautobilllock') : 0;

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

        $scope.openAdvancedFilter = function () {
            utl.Modal.openDynamicForm({
                modeldata: $scope.advancedfilter,
                defaultdata: $scope.advancedfilterDefault,
                schema: $scope.advancedFilterSchema,
                relativeto: '#btnadvanced',
                handleDynamicFormEvents: handleDynamicFormEvents
            });
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.custom_sort = function (a, b) {
            return new Date(b.AdmissionDate).getTime() - new Date(a.AdmissionDate).getTime();
        };
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }

        $scope.backtoList = function () {
            $state.go('app.billingsdashboard');
        };

        $scope.clearFilter = function () {
            $scope.currentfilter = {
                admissiondate: '',
                DischargeDate: '',
                AdmissionStatusId: -1,
                WardId: null,
                PatientMRN: null,
                VisitIdentifier: null,
                IsBillLock: null,
                IsPackageAssigned: null,
                IsEstimatedBill: null,
                TPAId: null
            };
            $scope.advancedfilter = {
                GuarantorTypeId: '',
                BillFromDate: null,
                BillToDate: null,
                DoctorId: null,
                DepartmentId: null,
                Phone: null,
                GuarantorId: null
            };
        };
        // $scope.clearFilter = function () {
        //     $scope.currentfilter.admissiondate = '';
        //     $scope.currentfilter.DischargeDate = '';
        //     $scope.advancedfilter.GuarantorTypeId = '';
        //     $scope.currentfilter.AdmissionStatusId = -1;
        // };
        $scope.applyFilter = function (type, val, index) {
            $scope.activeFilter = index; // Set the active filter index
            $scope.clearFilter();

            switch (type) {
                case 'admission':
                    $scope.currentfilter.admissiondate = utl.Formatter.getCurrentDate();
                    $scope.currentfilter.AdmissionStatusId = [2, 3, 4, 5, 6];
                    break;
                case 'today_discharge':
                    $scope.currentfilter.DischargeDate = utl.Formatter.getCurrentDate();
                    $scope.currentfilter.AdmissionStatusId = [5, 6];
                    break;
                case 'pending_discharge':
                    $scope.currentfilter.AdmissionStatusId = [3, 4];
                    break;
                case 'occupancy':
                    break;
                case 'guarantor':
                    if (val === 0) {
                        $scope.getList('listGovt');
                        return;
                    }
                    $scope.advancedfilter.GuarantorTypeId = val;
                    break;
            }
            $scope.getList();
        };
        // $scope.applyFilter = function (type, val, index) {
        //     $scope.activeFilter = index; // Set the active filter index

        //     if (type === 'admission') {
        //         $scope.clearFilter();
        //         $scope.currentfilter.admissiondate = utl.Formatter.getCurrentDate();
        //         $scope.currentfilter.AdmissionStatusId = [2, 3, 4, 5, 6];
        //         $scope.getList();
        //     } else if (type === 'today_discharge') {
        //         $scope.clearFilter();
        //         // $scope.currentfilter.admissiondate = utl.Formatter.getCurrentDate();
        //         $scope.currentfilter.DischargeDate = utl.Formatter.getCurrentDate();
        //         $scope.currentfilter.AdmissionStatusId = [5, 6];
        //         $scope.getList();
        //     } else if (type === 'pending_discharge') {
        //         $scope.clearFilter();
        //         // $scope.currentfilter.admissiondate = utl.Formatter.getCurrentDate();
        //         $scope.currentfilter.AdmissionStatusId = [3, 4];
        //         $scope.getList();
        //     }
        //     else if (type === 'occupancy') {
        //         $scope.clearFilter();
        //         $scope.getList();
        //     } else if (type === 'guarantor') {
        //         if (val === 1 || val === 2 || val === 3) {
        //             $scope.advancedfilter.GuarantorTypeId = val;
        //             $scope.getList();
        //         } else if (val === 0) {
        //             $scope.getList('listGovt');
        //         }
        //     }
        // };

        // $scope.applyFilter = function (type, val) {
        //     if (type == 'admission') {
        //         $scope.clearFilter();
        //         $scope.currentfilter.admissiondate = utl.Formatter.getCurrentDate();
        //         $scope.getList();
        //     } else if (type == 'discharge') {
        //         $scope.clearFilter();
        //         $scope.currentfilter.admissiondate = utl.Formatter.getCurrentDate();
        //         $scope.getList();
        //     } else if (type == 'occupancy') {
        //         $scope.clearFilter();
        //         $scope.getList();
        //     } else if (type == 'guarantor') {
        //         if(val == 1) {
        //             $scope.advancedfilter.GuarantorTypeId = 1;
        //             $scope.getList();
        //         } else if(val == 2) {
        //             $scope.advancedfilter.GuarantorTypeId = 2;
        //             $scope.getList();
        //         } else if(val == 3) {
        //             $scope.advancedfilter.GuarantorTypeId = 3;
        //             $scope.getList();
        //         } else if(val == 0) {
        //             $scope.getList('listGovt');
        //         }
        //     }
        //     // $scope.getList();
        // }

        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = [];
            if (data.Data.length > 0) {
                data.Data.sort($scope.custom_sort);
            }

            for (var idx in data.Data) {
                var item = data.Data[idx];
                item.NoOfDays = '';
                var admDate = new Date(item.AdmissionDate);
                var crntDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59') || null;
                var date2 = new Date(crntDate);
                var difference_ms = date2.getTime() - admDate.getTime();
                difference_ms = difference_ms / 1000;
                var seconds = Math.floor(difference_ms % 60);
                difference_ms = difference_ms / 60;
                var minutes = Math.floor(difference_ms % 60);
                difference_ms = difference_ms / 60;
                var hours = Math.floor(difference_ms % 24);
                var days = Math.floor(difference_ms / 24);
                item.NoOfDays = days + 1;
                if (item.FinalBills.length > 0) {
                    var FinalBill = item.FinalBills[0];
                    item.BillDate = FinalBill.BillDateTime;
                    item.BillNumber = FinalBill.BillNumber;
                }
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

                if (item.IsPackageAssigned == true) {
                    item.ColorCode = 7;
                }
                vm.gridConfig.data.push(item);
            }
            // $scope.getPagination();
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
            $scope.refreshIpBillGridProps();
            // $scope.totalOccupancy = data.PageContext.TotalRecords;
            // vm.gridConfig.pagerObj.totalItems = data.Data.length;
            // vm.gridConfig.pagerObj.totalItems = data.Data.length;
        };

        $scope.getList = function (val) {
            // var FrmDate = $filter('date')($scope.advancedfilter.DOA, 'yyyy-MM-dd 00:00:00') || null;
            // var ToDate = $filter('date')($scope.advancedfilter.DOA, 'yyyy-MM-dd 23:59:59') || null;
            var FrmDate = $filter('date')($scope.advancedfilter.BillFromDate, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.advancedfilter.BillToDate, 'yyyy-MM-dd 23:59:59') || null;
            var FromAdm = $filter('date')($scope.currentfilter.admissiondate, 'yyyy-MM-dd 00:00:00') || null;
            var ToAdm = $filter('date')($scope.currentfilter.admissiondate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                    Key: 1,
                    Value: utl.Session.getCurrentFacilityId()
                },
                // {
                //     Key: 17,
                //     Value: FrmDate
                // },
                // {
                //     Key: 18,
                //     Value: ToDate
                // },
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
                // {
                //     Key: 3,
                //     Value: $scope.currentfilter.AdmissionStatusId
                // },
                {
                    Key: 21,
                    Value: $scope.advancedfilter.Phone
                },
                {
                    Key: 19,
                    Value: $scope.advancedfilter.GuarantorId
                },
                // {
                //     Key: 19,
                //     Value: $scope.currentfilter.GuarantorId
                // },
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
                    Value: false
                },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            if (val == 'listGovt') {
                inputData.Params.push({
                    Key: 78,
                    Value: 3
                })
            }
            // if ($scope.currentfilter.DischargeDate)
            //     inputData.Params.push({
            //         Key: 28,
            //         Value: $filter('date')($scope.currentfilter.DischargeDate, 'yyyy-MM-dd 00:00:00') || null
            //     }, {
            //         Key: 29,
            //         Value: $filter('date')($scope.currentfilter.DischargeDate, 'yyyy-MM-dd 23:59:59') || null
            //     }
            //     )
            if ($scope.currentfilter.DischargeDate)
                inputData.Params.push({
                    Key: 80,
                    Value: $filter('date')($scope.currentfilter.DischargeDate, 'yyyy-MM-dd 00:00:00') || null
                }, {
                    Key: 81,
                    Value: $filter('date')($scope.currentfilter.DischargeDate, 'yyyy-MM-dd 23:59:59') || null
                }
                )
            if ($scope.currentfilter.AdmissionStatusId == undefined || $scope.currentfilter.AdmissionStatusId == -1) {
                inputData.Params.push({
                    Key: 31,
                    Value: [2, 3, 4, 5]
                })
            } else {
                inputData.Params.push({
                    Key: 31,
                    Value: $scope.currentfilter.AdmissionStatusId
                });
            }
            var options = {
                action: 'Visit/Visit/GetMINIPPatientsBills',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getPaginationCallback = function (scope, data, options, hasError) {
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
        };
        $scope.getPagination = function () {
            // var FrmDate = $filter('date')($scope.advancedfilter.DOA, 'yyyy-MM-dd 00:00:00') || null;
            // var ToDate = $filter('date')($scope.advancedfilter.DOA, 'yyyy-MM-dd 23:59:59') || null;
            var FrmDate = $filter('date')($scope.advancedfilter.BillFromDate, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.advancedfilter.BillToDate, 'yyyy-MM-dd 23:59:59') || null;
            var FromAdm = $filter('date')($scope.currentfilter.admissiondate, 'yyyy-MM-dd 00:00:00') || null;
            var ToAdm = $filter('date')($scope.currentfilter.admissiondate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                    Key: 1,
                    Value: utl.Session.getCurrentFacilityId()
                },
                // {
                //     Key: 17,
                //     Value: FrmDate
                // },
                // {
                //     Key: 18,
                //     Value: ToDate
                // },
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

        $scope.getLockedPatients = function (currentfilter) {
            if (currentfilter.FindLockedBills) {
                $scope.currentfilter.IsBillLock = 1;
                $scope.getList();
            } else {
                $scope.currentfilter.IsBillLock = 0;
                $scope.getList();
            }
        };

        $scope.getPackageassigned = function (currentfilter) {
            if (currentfilter.FindPackageAssigned) {
                $scope.currentfilter.IsPackageAssigned = 1;
                $scope.getList();
            } else {
                $scope.currentfilter.IsPackageAssigned = 0;
                $scope.getList();
            }
        };

        $scope.summaryipbilling = function () {
            $state.go('app.ipbillingtab.summary', {
                id: entity.Id
            });
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
                $state.go('app.ipbillingtab.summary', {
                    id: entity.Id,
                    patientid: entity.PatientId,
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
                    filter_doa: $scope.advancedfilter.DOA,
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
                        // 4: { 'background': '#EE7700', 'color': '#fff' },
                        5: {
                            'background': '#4274d8ad',
                            'color': '#fff'
                        },
                        6: {
                            'background': '#ed143dad',
                            'color': '#fff'
                        },
                        7: {
                            'background': '#EE7700',
                            'color': '#fff'
                        },
                    }
                },

            },
            package: {
                flag: 'IsPackageAssigned',
                // style: {
                //     field: 'Status',
                //     value: {
                //         1: { 'background': 'red', 'color': '#fff' }
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
                    "<span ><b>{{entity.Patient.LastName}}</b>&nbsp;</span>" +
                    "<span >/</span>" +
                    "<span >{{entity.Patient.MRN}}&nbsp;</span>" +
                    "<span >/<span>" +
                    "<span ng-if='entity.Patient.Title && entity.Patient.Title.Description' >" +
                    "<span >{{entity.Patient.Age}}&nbsp;</span>" +
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
                field: "ReferralName",
                displayName: $translate.instant('Referral Name'),
                width: '7%',
            },
            {
                field: "NoOfDays",
                displayName: $translate.instant('No.Of Days'),
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
                <a  ng-click="handleEvents(\'edit\',entity)"><i class="fas fa-procedures" uib-tooltip="In patients"></i></a>\
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

        $scope.getDashboardCallback = function (scope, data, options, hasError) {

            if (data.Data.length > 0) {
                data.Data.sort($scope.custom_sort);
                let items = [];
                let current_items = [];
                var list = data.Data;

                current_items = list.filter(function (list) {
                    return (list.AdmissionStatusId != 6)
                });
                $scope.totalOccupancy = data.Data.length;
                items = list.filter(function (list) {
                    return (list.AdmissionStatusId == 6)
                });
                var totalDischarge = items.length || 0;
                $scope.totalOccupancy = $scope.totalOccupancy - totalDischarge;


                var date = moment();
                var currentDate = date.format('DD/MM/YYYY');
                console.log(currentDate); // "17/06/2022"

                items = list.filter(function (list) {
                    var admissiondate = moment(list.AdmissionDate);
                    return (list.AdmissionStatusId != 7 && list.AdmissionStatusId != 1) && admissiondate.format('DD/MM/YYYY') == currentDate
                    // return (list.AdmissionStatusId == 2 || list.AdmissionStatusId == 3 || list.AdmissionStatusId == 4) && admissiondate.format('DD/MM/YYYY') == currentDate
                });
                $scope.todayAdmission = items.length || 0;

                // items = list.filter(function (list) {
                //     var dischargedate = moment(list.DischargeDate);

                //     return (list.AdmissionStatusId == 5 || list.AdmissionStatusId == 6) && dischargedate.format('DD/MM/YYYY') == currentDate
                // });
                var finalBills = list.filter(function (list) {
                    return (list.FinalBills.length > 0)
                });
                items = finalBills.filter(function (finalBills) {
                    // var dischargedate = moment(list.DischargeDate);

                    var dischargedate = moment(finalBills.FinalBills[0].BillDateTime);
                    return (finalBills.AdmissionStatusId == 5 || finalBills.AdmissionStatusId == 6) && dischargedate.format('DD/MM/YYYY') == currentDate
                });
                $scope.todayDischarge = items.length || 0;

                items = list.filter(function (list) {
                    // var dischargedate = moment(list.DischargeDate);

                    return (list.AdmissionStatusId == 3 || list.AdmissionStatusId == 4)
                });
                $scope.pendingDischarge = items.length || 0;

                // items = $filter('filter')(current_items, {
                //     // AdmissionStatusId: 2,
                //     GuarantorTypeId: 1
                //     // IsLatest: true
                // });
                items = list.filter(function (list) {
                    return (list.AdmissionStatusId == 2 || list.AdmissionStatusId == 3 || list.AdmissionStatusId == 4 || list.AdmissionStatusId == 5) && list.GuarantorTypeId == 1;
                });
                $scope.self = items.length || 0;
                // $scope.self = $scope.self - totalDischarge;

                items = $filter('filter')(current_items, {
                    // AdmissionStatusId: 2,
                    GuarantorTypeId: 2
                    // IsLatest: true
                });
                $scope.insurance = items.length || 0;
                // $scope.insurance = $scope.insurance - totalDischarge;

                items = $filter('filter')(current_items, {
                    // AdmissionStatusId: 2,
                    GuarantorTypeId: 3
                    // IsLatest: true
                }) || 0;
                $scope.corporate = items.length || 0;
                // $scope.corporate = $scope.corporate - totalDischarge;


                items = current_items.filter(function (current_items) {
                    return current_items.GuarantorTypeId > 3;
                });

                $scope.government = items.length || 0;
                // $scope.government = $scope.government - totalDischarge;

                console.log($scope.todayAdmission);
                console.log($scope.todayDischarge);
                console.log($scope.self);
                console.log($scope.insurance);
                console.log($scope.corporate);
                console.log($scope.government);
            }
        };

        $scope.getDashboard = function (val) {
            // var FrmDate = $filter('date')($scope.advancedfilter.DOA, 'yyyy-MM-dd 00:00:00') || null;
            // var ToDate = $filter('date')($scope.advancedfilter.DOA, 'yyyy-MM-dd 23:59:59') || null;
            var FrmDate = $filter('date')($scope.advancedfilter.BillFromDate, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.advancedfilter.BillToDate, 'yyyy-MM-dd 23:59:59') || null;
            var FromAdm = $filter('date')($scope.currentfilter.admissiondate, 'yyyy-MM-dd 00:00:00') || null;
            var ToAdm = $filter('date')($scope.currentfilter.admissiondate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                    Key: 1,
                    Value: utl.Session.getCurrentFacilityId()
                },
                // {
                //     Key: 17,
                //     Value: FrmDate
                // },
                // {
                //     Key: 18,
                //     Value: ToDate
                // },
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
                    Value: false
                },
                ],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };
            if (val == 'listGovt') {
                inputData.Params.push({
                    Key: 78,
                    Value: 3
                })
            }
            if ($scope.currentfilter.AdmissionStatusId == undefined || $scope.currentfilter.AdmissionStatusId == -1)
                inputData.Params.push({
                    Key: 31,
                    Value: [2, 3, 4, 5, 6]
                })
            var options = {
                action: 'Visit/Visit/GetMINIPPatientsBills',
                data: inputData,
                type: 'post',
                onComplete: $scope.getDashboardCallback
            };

            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
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
                $scope.getDashboard();
            } else {
                $scope.getList();
                $scope.getDashboard();
            }
        };

        $scope.executeStoredProcedureList = function () {

            console.log($scope.currentfilter);
            //$scope.setMonthDates();
            console.log($scope.currentfilter);
            var FrRegDt = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00');
            var ToRegDt = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59');
            var Facility = $scope.currentfilter.FacilityId;
            //console.log(FrRegDt);return;
            // var inputData = {
            //     From: FrRegDt,
            //     To: ToRegDt,
            //     FacilityId: Facility

            // };

            var options = {
                action: 'Visit/Visit/ExcuteStoredProcedure',
                data: {
                    // Data: inputData
                },
                type: 'post',
                onComplete: $scope.getStoredProcedureListCallback
            };
            utl.Http.doAction(options);
        };

        $scope.executeUpdateParentProcedure = function () {
            var options = {
                action: 'Visit/Visit/ExcuteStoredProcedure',
                data: {
                    Data: {
                        procedureName: 'parentbillidupdate'
                    }
                },
                type: 'post',
                onComplete: $scope.getStoredProcedureListCallback
            };
            utl.Http.doAction(options);
        };

        $scope.initLookup = function () {
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

        // ------------------------------------------------------------------
        // React bridge: four filter <ui-select> controls and the
        // <custom-table>, through the shared BridgeLookupSelectScreen and
        // BridgeGridScreen. No new React component, and no business
        // calculation or API call moves into React -- NoOfDays, Debit, Credit,
        // Balance and ColorCode are still computed in getListCallback exactly
        // as before, and the bridge only reshapes what it produced.
        //
        // The four select blocks were verified byte-identical to
        // billing-workbench's before that pattern was reused, so parity is the
        // same: models currentfilter.WardId / .GuarantorId /
        // .AdmissionStatusId / .TPAId unchanged; lookups lookup.Ward /
        // .Guarantor / .AdmissionStatus / .TPA unreshaped; numeric Id; no
        // on-select and ng-change="getList()" takes no argument, so no handler
        // has ever received the selected object; none is required and this
        // screen has no item_form, so NO validator shim is added; no name, no
        // ng-disabled, no tabindex, no allow-clear on any of them; class
        // "filter-combo" carried through on Ward, Status and TPA, and the
        // Payer control's id 'GuarantorId' preserved; none is gated by a
        // facility setting or privilege.
        //
        // PRE-EXISTING QUIRK, same as billing-workbench: currentfilter
        // .AdmissionStatusId is assigned an ARRAY by the tab initialisers and
        // read back as a single Value in the payloads, so that control already
        // renders with nothing selected in those tabs. Reproduced.
        //
        // Grid -- 12 data columns in columnDefs order plus actions:
        //   AdmissionDate keeps date:'dd-MMM-yyyy' + date:'HH:mm'; Debit,
        //   Credit and Balance keep the displaycurrency filter, called through
        //   $filter, so the rupee symbol, Indian digit grouping and toFixed(2)
        //   rounding are byte-identical to today's output.
        //   Nested-object bindings preserved exactly, including the room cell's
        //   per-span ng-if conditions: WardName/RoomNo are emitted only when
        //   entity.WardRoomMaster exists and BedNo only when
        //   entity.WardRoomBedMaster exists.
        //   Explicit column widths ('7%' on Guarantor, Referral Name and
        //   No.Of Days, '6%' on Status) are carried through.
        //   Row highlighting: config.background.style maps ColorCode 5, 6 and
        //   7 to three different colours. Reproduced per row through
        //   BridgeGridScreen's highlightStyle, using the same hex values.
        //   Row actions reproduce the inline cellTemplate exactly -- 'edit'
        //   (fas fa-procedures, "In patients") and 'packages' (fas
        //   fa-file-invoice-dollar, "Packages"), both unconditional -- and
        //   dispatch the SAME payload the template used, the entity itself,
        //   into the unchanged $scope.handleEvents. Both $state.go targets and
        //   all of their params, including the 18 filter params on
        //   app.ipbillingtab.summary, are untouched. The actions array is []
        //   and the cellTemplate is inline, so actionTemplate.html is not
        //   involved.
        //   Pagination untouched: the existing <ul uib-pagination> still binds
        //   vm.gridConfig.pagerObj and still calls getList().
        //   Sorting enabled only on the plain string columns, matching
        //   custom-table's reOrder string compare.
        //   No onRegisterApi, no row selection, no export or print behaviour
        //   exists on this grid; none was invented.
        //
        // TWO BROKEN LEGACY CELL EXPRESSIONS documented, NOT corrected:
        //   1. The Patient cellTemplate opens '<a class="grid-action"
        //      ng-click="handleEvents(...)"' and never closes that tag, so the
        //      following spans are swallowed into the anchor's attribute text.
        //      Rendered here as its plain First/Last / MRN / Age / Gender text
        //      with the same 'patientinfo' click the column's handleEvent
        //      wires up. Note the Title is absent from the live template (it
        //      is in the commented-out variant above it), so it is absent here
        //      too.
        //   2. The admitting-doctor cellTemplate calls
        //      handleEvents('patientinfo', entity) but the column sets no
        //      handleEvent, so handleEvents is undefined in that cell scope and
        //      the click has never fired. Rendered as plain text, no click.
        //
        // DEAD GRID CONFIG documented: config.package.flag adds the
        // 'pack-custom' class, whose entire CSS block in custom-table.html is
        // commented out, so it has never had a visible effect;
        // enableColumnResizing is a ui-grid option custom-table ignores.
        // Neither is reproduced.
        function ipFilterProps(field, lookupKey, extra) {
            var props = {
                options: ($scope.lookup && $scope.lookup[lookupKey]) || [],
                value: $scope.currentfilter[field]
            };
            if (extra) {
                for (var k in extra) { if (extra.hasOwnProperty(k)) { props[k] = extra[k]; } }
            }
            return props;
        }

        function ipFilterAction(field, refresh) {
            return function (actionType, payload) {
                if (actionType == 'change') {
                    $scope.currentfilter[field] = payload.id;
                    $scope.getList();
                    refresh();
                }
            };
        }

        $scope.refreshWardFilterProps = function () {
            $scope.reactPropsWardContainer = {
                reactProps: ipFilterProps('WardId', 'Ward', { className: 'filter-combo' }),
                onAction: ipFilterAction('WardId', $scope.refreshWardFilterProps)
            };
        };

        $scope.refreshGuarantorFilterProps = function () {
            $scope.reactPropsGuarantorContainer = {
                reactProps: ipFilterProps('GuarantorId', 'Guarantor', { id: 'GuarantorId' }),
                onAction: ipFilterAction('GuarantorId', $scope.refreshGuarantorFilterProps)
            };
        };

        $scope.refreshAdmissionStatusFilterProps = function () {
            $scope.reactPropsAdmissionStatusContainer = {
                reactProps: ipFilterProps('AdmissionStatusId', 'AdmissionStatus', { className: 'filter-combo' }),
                onAction: ipFilterAction('AdmissionStatusId', $scope.refreshAdmissionStatusFilterProps)
            };
        };

        $scope.refreshTPAFilterProps = function () {
            $scope.reactPropsTPAContainer = {
                reactProps: ipFilterProps('TPAId', 'TPA', { className: 'filter-combo' }),
                onAction: ipFilterAction('TPAId', $scope.refreshTPAFilterProps)
            };
        };

        // Same hex values as vm.gridConfig.background.style.value.
        var IPBILL_ROW_COLORS = {
            5: { background: '#4274d8ad', color: '#fff' },
            6: { background: '#ed143dad', color: '#fff' },
            7: { background: '#EE7700', color: '#fff' }
        };

        function ipPersonName(p) {
            p = p || {};
            var t = (p.Title && p.Title.Description) ? p.Title.Description + ' ' : '';
            return t + (p.FirstName || '') + ' ' + (p.LastName || '');
        }

        function ipRoomText(entity) {
            var out = '';
            if (entity.WardRoomMaster) {
                out += ((entity.WardMaster && entity.WardMaster.WardName) || '') + '/' +
                    (entity.WardRoomMaster.RoomNo || '') + '/';
            }
            if (entity.WardRoomBedMaster) {
                out += (entity.WardRoomBedMaster.BedNo || '');
            }
            return out;
        }

        $scope.refreshIpBillGridProps = function () {
            var defs = (vm.gridConfig && vm.gridConfig.columnDefs) || [];
            function hdr(i) { return defs[i] ? defs[i].displayName : ''; }
            var items = (vm.gridConfig && vm.gridConfig.data) || [];
            var money = $filter('displaycurrency');
            var date = $filter('date');
            $scope.reactPropsIpBillGridContainer = {
                reactProps: {
                    columns: [
                        { key: 'visitno', header: hdr(0), sortable: true },
                        { key: 'patient', header: hdr(1), link: true },
                        { key: 'doctor', header: hdr(2) },
                        { key: 'room', header: hdr(3) },
                        { key: 'admissiondate', header: hdr(4) },
                        { key: 'guarantor', header: hdr(5), sortable: true, width: '7%' },
                        { key: 'referral', header: hdr(6), sortable: true, width: '7%' },
                        { key: 'noofdays', header: hdr(7), width: '7%' },
                        { key: 'debit', header: hdr(8), align: 'right' },
                        { key: 'credit', header: hdr(9), align: 'right' },
                        { key: 'balance', header: hdr(10), align: 'right' },
                        { key: 'status', header: hdr(11), sortable: true, width: '6%' }
                    ],
                    actionsHeader: hdr(12) || 'Actions',
                    hasActions: true,
                    rows: items.map(function (entity, i) {
                        return {
                            id: (entity && entity.Id != null) ? entity.Id : i,
                            highlight: !!IPBILL_ROW_COLORS[entity.ColorCode],
                            highlightStyle: IPBILL_ROW_COLORS[entity.ColorCode],
                            actions: [
                                { key: 'edit', label: '', icon: 'fas fa-procedures', variant: 'icon', title: 'In patients' },
                                { key: 'packages', label: '', icon: 'fas fa-file-invoice-dollar', variant: 'icon', title: 'Packages' }
                            ],
                            cells: {
                                visitno: entity.VisitIdentifier,
                                patient: (entity.Patient ? (entity.Patient.FirstName || '') + ' ' + (entity.Patient.LastName || '') : '') +
                                    '/' + ((entity.Patient && entity.Patient.MRN) || '') + '/' +
                                    ((entity.Patient && entity.Patient.Age) || '') + '/' +
                                    ((entity.Patient && entity.Patient.Gender && entity.Patient.Gender.Description) || ''),
                                doctor: ipPersonName(entity.Doctor),
                                room: ipRoomText(entity),
                                admissiondate: entity.AdmissionDate
                                    ? date(entity.AdmissionDate, 'dd-MMM-yyyy') + ' ' + date(entity.AdmissionDate, 'HH:mm') : '',
                                guarantor: entity.Guarantor && entity.Guarantor.GuarantorName,
                                referral: entity.ReferralName,
                                noofdays: entity.NoOfDays,
                                debit: money(entity.Debit),
                                credit: money(entity.Credit),
                                balance: money(entity.Balance),
                                status: entity.AdmissionStatus && entity.AdmissionStatus.Description
                            }
                        };
                    })
                },
                onAction: function (actionType, payload) {
                    var list = (vm.gridConfig && vm.gridConfig.data) || [];
                    var entity = null;
                    for (var i = 0; i < list.length; i++) {
                        if (list[i].Id === payload.id) { entity = list[i]; break; }
                    }
                    if (entity === null) { return; }
                    if (actionType == 'rowAction') { $scope.handleEvents(payload.key, entity); }
                    else if (actionType == 'cellAction') { $scope.handleEvents('patientinfo', entity); }
                }
            };
        };

        $scope.refreshWardFilterProps();
        $scope.refreshGuarantorFilterProps();
        $scope.refreshAdmissionStatusFilterProps();
        $scope.refreshTPAFilterProps();
        $scope.refreshIpBillGridProps();

        $scope.$watchGroup([
            function () { return $scope.lookup && $scope.lookup.Ward; },
            function () { return $scope.currentfilter.WardId; }
        ], $scope.refreshWardFilterProps);

        $scope.$watchGroup([
            function () { return $scope.lookup && $scope.lookup.Guarantor; },
            function () { return $scope.currentfilter.GuarantorId; }
        ], $scope.refreshGuarantorFilterProps);

        $scope.$watchGroup([
            function () { return $scope.lookup && $scope.lookup.AdmissionStatus; },
            function () { return $scope.currentfilter.AdmissionStatusId; }
        ], $scope.refreshAdmissionStatusFilterProps);

        $scope.$watchGroup([
            function () { return $scope.lookup && $scope.lookup.TPA; },
            function () { return $scope.currentfilter.TPAId; }
        ], $scope.refreshTPAFilterProps);

        $scope.initLookup();
        if ($scope.executeautobilllock == 1) {
            $scope.executeStoredProcedureList();
        }
        if (window.printcode && window.printcode.toLowerCase() == 'hosmat') {
            // Disabled to prevent ER_SP_DOES_NOT_EXIST API errors
            // $scope.executeUpdateParentProcedure();
        }
    }

    inpatientsBillListController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$timeout'];

})();