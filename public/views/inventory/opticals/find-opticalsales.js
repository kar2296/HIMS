(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('findpharmacysalesListController', findpharmacysalesListController);

    function findpharmacysalesListController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.currentcontext = {
            StoreMasterId: 0,
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.currentcontext.id = modalConfig.params.id;

        function initDynamicForm() {
            $scope.defaultdata = {
                FromDate: utl.Formatter.getCurrentDate(),
                ToDate: utl.Formatter.getCurrentDate(),
                MRN: null,
                DoctorId: -1,
                MobileNo: null,
                BillPriorityId: -1,
                BillStatusId: -1,
                BillTypeId: -1,
                PatientBillStatusId: 3,
                PharmacySaleTypeId: -1,
                BillNumber: null,
                FacilityId: -1,
                GuarantorTypeId: -1,
                GuarantorId: -1,
                IsOutStanding: false,
                StoreMasterId: $scope.currentcontext.StoreMasterId
            };

            $scope.modeldata = JSON.parse(JSON.stringify($scope.defaultdata));

            $scope.schema = {
                layout: 'grid',
                controls: [
                    { type: 'date', translate: 'billing.findbill-list.fromdate.lbl', model: 'FromDate', position: { r: 0, c: 0 } },
                    { type: 'date', translate: 'billing.findbill-list.todate.lbl', model: 'ToDate', position: { r: 0, c: 1 } },
                    { type: 'select', translate: 'billing.findbill-list.mystore.lbl', model: 'StoreMasterId', options: $scope.lookup.UserStores, position: { r: 0, c: 2 } },
                    { type: 'text', translate: 'billing.findbill-list.mrn.lbl', model: 'MRN', position: { r: 1, c: 0 } },
                    { type: 'text', translate: 'billing.findbill-list.patientname.lbl', model: 'PatientName', position: { r: 1, c: 1 } },
                    { type: 'text', translate: 'billing.findbill-list.mobileno.lbl', model: 'MobileNo', position: { r: 1, c: 2 } },
                    { type: 'select', translate: 'billing.findbill-list.patienttype.lbl', model: 'PharmacySaleTypeId', options: $scope.lookup.PharmacySaleType, position: { r: 2, c: 0 } },
                    { type: 'select', translate: 'billing.findbill-list.guarantortype.lbl', model: 'GuarantorTypeId', options: $scope.lookup.GuarantorType, position: { r: 2, c: 1 } },
                    { type: 'select', translate: 'billing.findbill-list.guarantor.lbl', model: 'GuarantorId', options: $scope.lookup.Guarantor, position: { r: 2, c: 2 } },
                    { type: 'text', translate: 'billing.findbill-list.billnumber.lbl', model: 'BillNumber', position: { r: 3, c: 0 } },
                    { type: 'select', translate: 'billing.findbill-list.billstatus.lbl', model: 'PatientBillStatusId', options: $scope.lookup.PatientBillStatus, position: { r: 3, c: 1 } },
                    { type: 'checkbox', translate: 'billing.findbill-list.isoutstanding.lbl', model: 'IsOutStanding', position: { r: 3, c: 2 } },
                    { type: '', translate: '', model: '', position: { r: 4, c: 1 } },
                    { type: '', translate: '', model: '', position: { r: 4, c: 2 } }
                ],
                actions: [
                    { type: 'apply', translate: 'common.applyaction.lbl', cls: 'btn-primary' },
                    { type: 'reset', translate: 'common.resetaction.lbl', cls: 'btn-danger' }
                ]
            };

        }

        $scope.actionClick = function (actionType) {
            if (actionType == 'reset') {
                $scope.modeldata = JSON.parse(JSON.stringify($scope.defaultdata));
            }

            $scope.getList();
        };

        $scope.custom_sort = function (a, b) {
            return new Date(b.BillDateTime).getTime() - new Date(a.BillDateTime).getTime();
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0)
                res.Data.sort($scope.custom_sort);
            $scope.gridData = res.Data;
            var items = $scope.gridData;
            vm.gridConfig.data = items;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            $('#BillNumber').focus();
        };

        /* Pharmacy Sales Find Bills - Shortcut Keys - Start */
        function keyupHandler(e) {
            var kCode = e.keyCode;
            if (kCode == 13) { // Enter Key
                $scope.actionClick('apply');
            }
        }
        angular.element(document).on('keydown', keyupHandler);
        $scope.$on('$destroy', function () {
            angular.element(document).off('keydown', keyupHandler);
        });
        /* Pharmacy Sales Find Bills - Shortcut Keys - End */

        $scope.getList = function (pageNo) {
            var OutStandingcond = $scope.modeldata.IsOutStanding ? 1 : -1;
            if ($scope.modeldata.BillNumber || $scope.modeldata.MRN ||
                $scope.modeldata.MobileNo || $scope.modeldata.PatientName) {
                $scope.modeldata.FromDate = null;
                $scope.modeldata.ToDate = null;
            }
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.modeldata.BillNumber },
                    { Key: 4, Value: $scope.modeldata.PatientBillStatusId },
                    { Key: 5, Value: $scope.modeldata.BillPriorityId },
                    { Key: 6, Value: 4 },
                    { Key: 7, Value: $scope.modeldata.DoctorId },
                    { Key: 8, Value: $scope.modeldata.FacilityId },
                    { Key: 9, Value: $scope.modeldata.GuarantorTypeId },
                    { Key: 10, Value: $scope.modeldata.GuarantorId },
                    { Key: 11, Value: OutStandingcond },
                    { Key: 12, Value: $scope.modeldata.PatientId },
                    { Key: 13, Value: $scope.modeldata.MRN },
                    { Key: 14, Value: $scope.modeldata.MobileNo },
                    { Key: 15, Value: $scope.modeldata.PatientName },
                    { Key: 12, Value: $scope.currentcontext.id },
                    { Key: 21, Value: 1 },
                    { Key: 22, Value: $scope.modeldata.PharmacySaleTypeId },
                    { Key: 29, Value: $scope.modeldata.StoreMasterId },

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            if ($scope.modeldata.FromDate || $scope.modeldata.ToDate) {
                var FrmDate = $filter('date')($scope.modeldata.FromDate, 'yyyy-MM-dd 00:00:00');
                var ToDate = $filter('date')($scope.modeldata.ToDate, 'yyyy-MM-dd 23:59:59');
                if (FrmDate && ToDate)
                    inputData.Params.push({ Key: 1, Value: [FrmDate, ToDate] });
            }
            var options = {
                action: 'billing/patientbills/GetFindPharmacyBills',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: patientId },
                confirmCallback: $scope.getList
            });
        };

        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'edit') {
                $state.go('app.ipbillingtab.summary', { id: row.entity.Id });
            } else if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(row.entity.Patient.Id);
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "Patient.MRN", displayName: $translate.instant('billing.findbill-list.mrn.lbl') },
                { field: "BillNumber", displayName: $translate.instant('billing.findbill-list.billnumber.lbl') },
                {
                    field: "EncountertypeId",
                    displayName: $translate.instant('billing.findbill-list.ipnumber.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" ng-if="row.entity.PharmacySaleTypeId == 1"> {{"OP"}} </div><div class="ui-grid-cell-contents" ng-if="row.entity.PharmacySaleTypeId == 2"> {{"IP"}} </div><div class="ui-grid-cell-contents" ng-if="row.entity.PharmacySaleTypeId == 3"> {{"A&E"}} </div><div class="ui-grid-cell-contents" ng-if="row.entity.PharmacySaleTypeId == 4"> {{"Direct"}} </div>'
                },
                {
                    field: "PatientName",
                    displayName: $translate.instant('billing.findbill-list.patientname.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" ng-if="row.entity.PharmacySaleTypeId == 4"> {{row.entity.PatientName}} </div><div class="ui-grid-cell-contents" ng-if="row.entity.PharmacySaleTypeId != 4"> {{row.entity.Patient.Title.Description}} {{row.entity.Patient.FirstName}} {{row.entity.Patient.LastName}}</div>'
                },
                {
                    field: "Date",
                    displayName: $translate.instant('billing.findbill-list.date.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='row.entity.BillDateTime'></ngformatdate>"
                },
                {
                    field: "ConsDoctor",
                    displayName: $translate.instant('billing.findbill-list.consdoctor.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" ng-if="row.entity.PharmacySaleTypeId == 4"> {{row.entity.DoctorName}} </div><div class="ui-grid-cell-contents" ng-if="row.entity.PharmacySaleTypeId != 4"> {{row.entity.User.Title.Description}} {{row.entity.User.FirstName}} {{row.entity.User.LastName}}</div>'
                },
                { field: "PatientBillStatus.Description", displayName: $translate.instant('billing.findbill-list.status.lbl') },
                {
                    field: "OutStandingAmount",
                    displayName: $translate.instant('billing.findbill-list.dueamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{row.entity.OutStandingAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "PaidAmount",
                    displayName: $translate.instant('billing.findbill-list.paidamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{row.entity.PaidAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "BillAmount",
                    displayName: $translate.instant('billing.findbill-list.billamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{row.entity.BillAmount | displaycurrency}}</span>" + "</div>"
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 },
            enableFullRowSelection: true
        };

        vm.gridConfig.enableRowSelection = true;
        vm.gridConfig.multiSelect = false;
        vm.gridConfig.onRegisterApi = function (gridApi) {
            $scope.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                $scope.confirmCallback({ BillId: row.entity.Id, IsCashToCreditBill: row.entity.IsCashToCreditBill, PatientId: row.entity.PatientId, BillStatusId: row.entity.PatientBillStatusId, StoreId: row.entity.StoreMasterId });
            });
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.currentcontext.StoreMasterId === 0) {
                    $scope.currentcontext.StoreMasterId = value[0].Id;
                }
            });
            initDynamicForm();
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "PharmacySaleType" },
                { "Key": "BillType" },
                {
                    "Key": "UserStores",
                    Request: {
                        Params: [{
                            Key: 1,
                            Value: utl.Session.getCurrentUserId()
                        },
                        {
                            Key: 2,
                            Value: utl.Session.getCurrentFacilityId(),
                        },
                        {
                            Key: 5,
                            Value: 2
                        }
                        ]
                    },
                    Default: false
                },
                { "Key": "PatientBillStatus" },
                { "Key": "Facility" },
                { "Key": "GuarantorType" },
                {
                    "Key": "Guarantor",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
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
        };

        $scope.initLookup();
    }

    findpharmacysalesListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];
})();