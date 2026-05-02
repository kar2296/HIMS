(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('inpatientsListController', inpatientsListController);

    function inpatientsListController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));

        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            AdmissionStatusId: -1,
            WardId: -1,
            FindLockedBills: 0,
            IsEstimatedBill: 0
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
                controls: [
                    { type: 'date', translate: 'billing.inpatients.billfromdate.lbl', model: 'BillFromDate', position: { r: 0, c: 0 } },
                    { type: 'date', translate: 'billing.inpatients.billtodate.lbl', model: 'BillToDate', position: { r: 0, c: 1 } },
                    { type: 'date', translate: 'billing.inpatients.doa.lbl', model: 'DOA', position: { r: 1, c: 0 } },
                    { type: 'text', translate: 'billing.inpatients.phone.lbl', model: 'Phone', position: { r: 1, c: 1 } },
                    { type: 'select', translate: 'billing.inpatients.guarantor.lbl', model: 'GuarantorId', options: $scope.lookup.Guarantor, position: { r: 2, c: 0 } },
                    { type: 'select', translate: 'billing.inpatients.guarantortype.lbl', model: 'GuarantorTypeId', options: $scope.lookup.GuarantorType, position: { r: 2, c: 1 } },
                    { type: 'select', translate: 'billing.inpatients.admittingdoctors.lbl', model: 'DoctorId', options: $scope.lookup.Doctor, position: { r: 3, c: 0 } },
                    { type: 'select', translate: 'billing.inpatients.department.lbl', model: 'DepartmentId', options: $scope.lookup.Department, position: { r: 3, c: 1 } },
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

        $scope.custom_sort = function (a, b) {
            return new Date(b.AdmissionDate).getTime() - new Date(a.AdmissionDate).getTime();
        };

        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = [];
            if (data.Data.length > 0)
                data.Data.sort($scope.custom_sort);
            for (var idx in data.Data) {
                var item = data.Data[idx];
                var FinalBill = item.FinalBills[0];
                var BillDiscount = 0;
                var isFinalize = false;
                if (FinalBill) {
                    isFinalize = true;
                    BillDiscount = isNaN(parseFloat(FinalBill.BillDiscount)) ? 0 : parseFloat(FinalBill.BillDiscount);
                }
                var Debit =
                    (isNaN(parseFloat(item.Disallowance)) ? 0 : parseFloat(item.Disallowance))
                    + ((isNaN(parseFloat(item.TDS)) ? 0 : parseFloat(item.TDS)))
                    + (isNaN(parseFloat(item.Debit)) ? (0) : parseFloat(item.Debit));
                item.Debit = Debit;
                var Credit = (!item.IsPackageAssigned ?
                    (isNaN(parseFloat(item.BillAmount)) ? 0 : parseFloat(item.BillAmount))
                    : (isNaN(parseFloat(item.InclusionAmount)) ? (0) : parseFloat(item.InclusionAmount))
                    + (isNaN(parseFloat(item.ExclusionAmount)) ? (0) : parseFloat(item.ExclusionAmount)))
                    - (isFinalize ? BillDiscount :
                        (!item.IsPackageAssigned ?
                            (isNaN(parseFloat(item.DiscountAmount)) ? 0 : parseFloat(item.DiscountAmount)) :
                            (isNaN(parseFloat(item.PackageDiscountAmount)) ? 0 : parseFloat(item.PackageDiscountAmount))));

                item.Credit = (isNaN(parseFloat(Credit)) ? 0 : parseFloat(Credit));
                item.Balance = (Credit - (isNaN(parseFloat(item.Debit)) ? 0 : parseFloat(item.Debit)));
                if (item.FinalBills.length > 0)
                    item.Balance = item.Balance + (isNaN(parseFloat(item.FinalBills[0].RefundAmount)) ?
                        0 : parseFloat(item.FinalBills[0].RefundAmount));
                vm.gridConfig.data.push(item);
            }
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var FrmDate = $filter('date')($scope.advancedfilter.DOA, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.advancedfilter.DOA, 'yyyy-MM-dd 23:59:59') || null;
            var FrmDate = $filter('date')($scope.advancedfilter.BillFromDate, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.advancedfilter.BillToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 1, Value: utl.Session.getCurrentFacilityId() },
                    { Key: 17, Value: FrmDate },
                    { Key: 18, Value: ToDate },
                    { Key: 2, Value: $scope.currentfilter.WardId },
                    { Key: 15, Value: 2 },
                    { Key: 5, Value: $scope.advancedfilter.DoctorId },
                    { Key: 6, Value: $scope.advancedfilter.DepartmentId },
                    { Key: 11, Value: $scope.currentfilter.PatientMRN },
                    { Key: 13, Value: $scope.currentfilter.VisitIdentifier },
                    { Key: 3, Value: $scope.currentfilter.AdmissionStatusId },
                    { Key: 21, Value: $scope.advancedfilter.Phone },
                    { Key: 19, Value: $scope.advancedfilter.GuarantorId },
                    { Key: 23, Value: $scope.advancedfilter.GuarantorTypeId },
                    { Key: 22, Value: true },
                    { Key: 37, Value: $scope.currentfilter.IsBillLock },
                    { Key: 46, Value: $scope.currentfilter.IsEstimatedBill },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            if ($scope.currentfilter.AdmissionStatusId == undefined || $scope.currentfilter.AdmissionStatusId == -1)
                inputData.Params.push({ Key: 31, Value: [2, 3, 4, 5] })
            var options = {
                action: 'Visit/Visit/GetIPPatientsBills',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
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

        $scope.summaryipbilling = function () {
            $state.go('app.ipbillingtab.summary', { id: entity.Id });
        };

        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: patientId },
                confirmCallback: $scope.getList
            });
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                $state.go('app.ipbillingtab.summary',
                    {
                        id: entity.Id,
                        patientid: entity.PatientId,
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
            } else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(entity.Patient.Id);
            }
        };

        //var rowtpl = '<div ng-class="{\'billlock\': entity.IsEstimatedBill==1 || entity.IsBillLock==1 && entity.AdmissionStatusId!==6&&entity.AdmissionStatusId!==5} "><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" ui-grid-cell></div></div>';
        var rowtpl='<div ng-class="{\'green\':row.entity.AdmissionStatusId==1, \'blue\':row.entity.AdmissionStatusId==2 }"><div ng-repeat="(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name" class="ui-grid-cell" ng-class="{ \'ui-grid-row-header-cell\': col.isRowHeader }" ui-grid-cell></div></div>';
        vm.gridConfig = {
            enableColumnResizing: true,
            rowTemplate: rowtpl,
            columnDefs: [
            { field: "VisitIdentifier", displayName: $translate.instant('billing.inpatients.ipnumber.lbl') },
            {
                field: "Patient",
                displayName: $translate.instant('admissions.patientname.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    '<a ng-click="handleEvents(\'patientinfo\',entity)" uib-tooltip="{{entity.Patient.Title.Description}}&nbsp; .{{entity.Patient.FirstName}} / {{entity.Patient.MRN}}  / {{entity.Patient.Age}} / {{entity.Patient.Gender.Description}}" tooltip-placement="left" >' +
                    "<b>{{entity.Patient.Title.Description}}</b>&nbsp;</span>" +
                    "<span ><b>{{entity.Patient.FirstName}}</b>&nbsp;</span>" +
                    "<span ><b>{{entity.Patient.LastName}}</b>&nbsp;</span>" +
                    "<span >/</span>" +
                    "<span >{{entity.Patient.MRN}}&nbsp;</span>" +
                    "<span >/<span>" +
                    "<span ng-if='entity.Patient.Title && entity.Patient.Title.Description' >" +
                    "<span >{{entity.Patient.Age}}&nbsp;</span>" +
                    "<span >/</span>" +
                    "<span >{{entity.Patient.Gender.Description}}</span>" +
                    "</a></div>"
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
                field: "PatientGuarantor.GuarantorName", displayName: $translate.instant('billing.inpatients.guarantor.lbl'),
                width: '7%',
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                <span>{{entity.PatientGuarantor.GuarantorName}}</span>\
                                            </div>"
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
                                            </div>",
                                            cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
                                                if (row.entity.AdmissionStatusId == 1) {
                                                  return 'blue';
                                                }
                                                if (row.entity.AdmissionStatusId == 2) {
                                                    return 'red';
                                                  }
                                                return 'green';
                                              }
            },
            {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                                                <a ng-click="handleEvents(\'edit\',entity)"><img class="imgsrc" src="app/img/main/pay.png" style="margin-top:1px; width:25px;    margin: 1px 2px;"></a>\
                                                </div>',
                                                handleEvent: $scope.handleEvents,
                actions: []
            }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            if ($stateParams.filter_id > 0) {
                $scope.currentfilter.FacilityId = $stateParams.filter_facilityid;
                $scope.currentfilter.WardId=$stateParams.filter_wardid;
                $scope.advancedfilter.DoctorId=$stateParams.filter_doctorid;
                $scope.advancedfilter.DepartmentId=$stateParams.filter_departmentid;
                $scope.currentfilter.PatientMRN=$stateParams.filter_patientmrn;
                $scope.currentfilter.VisitIdentifier=$stateParams.filter_visitidentifier;
                $scope.currentfilter.AdmissionStatusId=$stateParams. filter_admissionstatusid;
                $scope.currentfilter.ActiveStatusId=$stateParams.filter_activestatusid;
                $scope.advancedfilter.Phone=$stateParams.filter_phone;
                $scope.advancedfilter.GuarantorId=$stateParams.filter_guarantorid;
                $scope.advancedfilter.GuarantorTypeId=$stateParams.filter_guarantortypeid;
                $scope.currentfilter.IsBillLock=$stateParams.filter_isbilllock;
                $scope.currentfilter.IsEstimatedBill=$stateParams.filter_isestimatedbill;
                $scope.advancedfilter.BillFromDate=$stateParams.filter_isbilllock;
                $scope.advancedfilter.BillToDate=$stateParams.filter_billtodate;
                $scope.advancedfilter.DOA=$stateParams.filter_doa;
                $scope.getList();
            } else {
                $scope.getList();
            }
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "AdmissionStatus" },
                { "Key": "Ward" },
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
                {
                    "Key": "Guarantor", Request: {
                        Params: [
                            { Key: 7, Value: utl.Session.getCurrentFacilityId() }
                        ]
                    }
                },
                { "Key": "GuarantorType" }
            ]
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

    inpatientsListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();