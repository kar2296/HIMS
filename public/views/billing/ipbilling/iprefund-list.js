(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('iprefundListController', iprefundListController);

    function iprefundListController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        vm.gridConfig = {
            columnDefs: []
        };
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        $scope.currentcontext.CanIPREF_REFUND = utl.Privilege.hasAccess('CanIPREF_REFUND');
        $scope.currentcontext.CanIPREF_PARTIAL_REFUND = utl.Privilege.hasAccess('CanIPREF_PARTIAL_REFUND');

        $scope.iprefund = 0;
        $scope.iprefund =
            (utl.FacilitySetting.getFacilitySettingValue('billing', 'iprefundapproval')) ? utl.FacilitySetting.getFacilitySettingValue('billing', 'iprefundapproval') : 0;

        $scope.currentcontext = {};
        $scope.UserCounterInfo = [];
        $scope.currentfilter = {
            RefundDateTime: utl.Formatter.getCurrentDate(),
            RefundStatusId: 1
        };

        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.IsLocked = $scope.$parent.Islocked;
        $scope.currentcontext.isdaycare = $stateParams.isdaycare;
        $scope.getListCallback = function (scope, data, options, hasError) {
            $scope.TotalAmt = 0;
            forEach(data.Data, function (value, index) {
                $scope.TotalAmt += value.RefundAmount;
                value.PatientName = value.Patient.FirstName + ' / ' + value.Patient.Age + ' Years / ' + value.Patient.MRN;
                value.IsRefundApproval = $scope.iprefund;
            });
            vm.gridConfig.data = data.Data;
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
            $scope.CheckFinalize();
            $scope.refreshReactProps();
        };

        $scope.getList = function () {
            var fromDate = $filter('date')($scope.currentfilter.RefundDateTime, 'yyyy-MM-dd 00:00:00');
            var toDate = $filter('date')($scope.currentfilter.RefundDateTime, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [{
                    Key: 1,
                    Value: $scope.currentfilter.receipt
                },
                // { Key: 3, Value: $scope.currentfilter.RefundDateTime },
                // {
                //     Key: 4,
                //     Value: $scope.currentfilter.RefundTypeId
                // },
                {
                    Key: 25,
                    Value: [1, 2, 4]//AgainstReceipt Included(2)
                },
                // {
                //     Key: 5,
                //     Value: $scope.currentfilter.RefundStatusId
                // },
                {
                    Key: 26,
                    Value: [1, 2, 3]
                },
                {
                    Key: 10,
                    Value: $scope.currentcontext.id
                },
                // {
                //     Key: 11,
                //     Value: 2
                // },
                // {
                //     Key: 12,
                //     Value: fromDate
                // },
                // {
                //     Key: 13,
                //     Value: toDate
                // },
                {
                    Key: 19,
                    Value: false
                },
                {
                    Key: 24,//Receipt Type
                    Value: [1, 2, 3, 7]//Receipt,DueCollect,ipadvance,pharmacy advance
                }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };
            if (!$scope.currentcontext.isdaycare) {
                inputData.Params.push({
                    Key: 11,
                    Value: 2
                })
            }
            if ($scope.currentcontext.isdaycare) {
                inputData.Params.push({
                    Key: 11,
                    Value: 5
                })
            }
            var options = {
                action: 'Billing/PatientRefund/GetPatientRefund',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addRefund = function () {
            if (!$scope.IsDisabled) {
                $scope.openModal(0);
            } else if ($scope.BillFinalized && $scope.BillInfo && $scope.BillInfo.ToBeRefunded > 0) {
                $scope.openModal(0);
            } else {
                var msg = '';
                msg = $scope.BillFinalized ? 'Bill has been Finalized' : 'Bill has been Locked';
                utl.Alert.showErrorMsg($translate.instant(msg));
            }
        };

        $scope.openModal = function (refundId) {
            utl.Modal.open('app.iprefund-form', {
                params: {
                    id: refundId,
                    eid: $scope.currentcontext.id,
                    refundamount: $scope.BillInfo && $scope.BillInfo.ToBeRefunded ? $scope.BillInfo.ToBeRefunded : 0,
                    billid: $scope.BillInfo && $scope.BillInfo.Id ? $scope.BillInfo.Id : 0
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.addPartialRefund = function () {
            if (!$scope.IsDisabled) {
                $scope.openPartialRefundModal(0);
            } else if (!$scope.BillFinalized) {
                $scope.openPartialRefundModal(0);
            } else {
                var msg = '';
                msg = $scope.BillFinalized ? 'Bill has been Finalized' : 'Bill has been Locked';
                utl.Alert.showErrorMsg($translate.instant(msg));
            }
        };

        $scope.openPartialRefundModal = function (refundId) {
            utl.Modal.open('app.ippartialrefund-form', {
                params: {
                    id: refundId,
                    eid: $scope.currentcontext.id,
                    refundamount: $scope.BillInfo && $scope.BillInfo.ToBeRefunded ? $scope.BillInfo.ToBeRefunded : 0,
                    billid: $scope.BillInfo && $scope.BillInfo.Id ? $scope.BillInfo.Id : 0
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'Billing/PatientRefund/DeletePatientRefund',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };
        $scope.backToList = function () {
            $state.go('app.ipbillingtab.summary');
            // if ($scope.item.AdmissionStatusId == 6) {
            //     $state.go('app.ipbilling-listtab.dischargedpatients');
            // } else {
            //     $state.go('app.ipbilling-listtab.inpatients');
            // }
        };
        $scope.CheckFinalizeCallback = function (scope, res, options, hasError) {
            $scope.BillFinalized = false;
            if (res.Data.length > 0) {
                $scope.BillFinalized = true;
                $scope.BillInfo = res.Data[0];
            }
            $scope.IsDisabled = $scope.BillFinalized || $scope.IsLocked ? true : false;
        };

        $scope.CheckFinalize = function () {
            var inputData = {
                Params: [{
                    Key: 4,
                    Value: 3
                },
                {
                    Key: 6,
                    Value: 2
                },
                {
                    Key: 16,
                    Value: $scope.currentcontext.id
                }
                ]
            };
            var options = {

                // action: 'billing/PatientBills/GetPatientBills',
                action: 'billing/PatientBills/checkBillFinalized',
                data: inputData,
                type: 'post',
                onComplete: $scope.CheckFinalizeCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                $scope.openModal(entity.Id);
            } else if (actionType == 'view') {
                $scope.openModal(entity.Id);
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.SpecialityName);
            }
        };


        vm.gridConfig = {
            columnDefs: [{
                field: "RefundIdentifier",
                displayName: $translate.instant('billing.refund-list.refundno.lbl')
            },
            {
                field: "RefundDateTime",
                displayName: $translate.instant('billing.refund-list.refunddate.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.RefundDateTime | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.RefundDateTime| date: 'HH:mm'}}</span>" + "</div>"
            },
            {
                field: "RefundType.Description",
                displayName: $translate.instant('billing.receipt-list.type.lbl')
            },
            {
                field: "RefundAmount",
                displayName: $translate.instant('billing.refund-list.refundamount.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{entity.RefundAmount | displaycurrency}}</span>' + '</div>'
            },
            {
                field: "PaymentType.Description",
                displayName: $translate.instant('billing.receipt-list.paymentmode.lbl')
            },
            {
                field: "RefundStatus.Description",
                displayName: $translate.instant('Refund Status')
            },
            // {
            //     field: "RefundApprovalStatus.Description",
            //     displayName: $translate.instant('Refund Approval')
            // },
            // {
            //     field: "RefundApprovalStatus.Description",
            //     cellTemplate: '<div class="ui-grid-cell-contents" ng-show="entity.IsRefundApproval == 1">' + '<span>{{entity.RefundApprovalStatus.Description}}</span>' + '</div>',
            //     displayName: $translate.instant('Refund Approval')
            // },
            // {
            //     field: "Id",
            //     displayName: $translate.instant('common.actions_col.lbl'),
            //     cellTemplate: '<div class="ui-grid-cell-contents actionbuttons ">\
            //         <span class="grid-action" style="text-decoration: underline;font-size:20px;" ng-click="handleEvents(\'view\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
            //         </div>',
            //     handleEvent: $scope.handleEvents,
            // }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };
        if ($scope.iprefund == 1) {
            vm.gridConfig.columnDefs.push({
                field: "RefundApprovalStatus.Description",
                cellTemplate: '<div class="ui-grid-cell-contents" ng-show="entity.IsRefundApproval == 1">' + '<span>{{entity.RefundApprovalStatus.Description}}</span>' + '</div>',
                displayName: $translate.instant('Refund Approval')
            },
            {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents actionbuttons ">\
                    <span class="grid-action" style="text-decoration: underline;font-size:20px;" ng-click="handleEvents(\'view\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                    </div>',
                handleEvent: $scope.handleEvents,
            });
        } else {
            vm.gridConfig.columnDefs.push(
            {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents actionbuttons ">\
                    <span class="grid-action" style="text-decoration: underline;font-size:20px;" ng-click="handleEvents(\'view\',entity)"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                    </div>',
                handleEvent: $scope.handleEvents,
            });
        }

        $scope.refreshReactProps();


        //React bridge for the <custom-table config="vm.gridConfig"> grid only.
        //
        //PRIVILEGE GATING IS DELIBERATELY NOT TOUCHED: the Refund and Partial
        //Refund buttons in the template are native AngularJS <button>s gated by
        //ng-if="HasAccess('IPBILLING_REFUND','IPREF_REFUND')" /
        //ng-if="HasAccess('IPBILLING_REFUND','IPREF_PARTIAL_REFUND')" (from
        //utl.Ctrl.getPrivilegeCtrl), and they stay exactly as they were, so
        //addRefund()/addPartialRefund() and their IsDisabled/BillFinalized
        //guards keep running unchanged in this controller.
        //
        //Columns are read back off vm.gridConfig.columnDefs rather than
        //hardcoded, so the facility-setting-driven composition ($scope.iprefund
        //== 1 pushes an extra "Refund Approval" column) is preserved as-is.
        $scope.handleGridAction = function (actionType, payload) {
            var items = vm.gridConfig.data || [];
            var entity = null;
            for (var i = 0; i < items.length; i++) {
                if (items[i].Id === payload.id) { entity = items[i]; break; }
            }
            if (actionType == 'rowAction') {
                $scope.handleEvents(payload.key, entity);
            }
        };

        $scope.refreshReactProps = function () {
            var defs = vm.gridConfig.columnDefs || [];
            //Same dotted-path resolution the custom-table dotParser filter does.
            function resolve(entity, path) {
                if (!path) { return ''; }
                var parts = path.split('.');
                var cur = entity;
                for (var i = 0; i < parts.length; i++) {
                    if (cur === null || cur === undefined) { return ''; }
                    cur = cur[parts[i]];
                }
                return cur === null || cur === undefined ? '' : cur;
            }
            //Reproduces each original cellTemplate for this screen's columns.
            function cellFor(entity, field) {
                if (field == 'RefundDateTime') {
                    return (entity.RefundDateTime ? $filter('date')(entity.RefundDateTime, 'dd-MMM-yyyy') : '') + ' ' + (entity.RefundDateTime ? $filter('date')(entity.RefundDateTime, 'HH:mm') : '');
                }
                if (field == 'RefundAmount') {
                    return $filter('displaycurrency')(entity.RefundAmount);
                }
                if (field == 'RefundApprovalStatus.Description') {
                    //Original cellTemplate wraps this in ng-show="entity.IsRefundApproval == 1".
                    return entity.IsRefundApproval == 1 ? resolve(entity, field) : '';
                }
                return resolve(entity, field);
            }
            //The original custom-table reOrder does a case-insensitive string
            //compare on the raw field value, so it throws for numeric/date
            //fields; sort is enabled only where it works today.
            var SORTABLE = {
                'RefundIdentifier': true,
                'RefundType.Description': true,
                'PaymentType.Description': true,
                'RefundStatus.Description': true,
                'RefundApprovalStatus.Description': true
            };
            var dataCols = [];
            var actionDef = null;
            for (var d = 0; d < defs.length; d++) {
                if (defs[d].field == 'Id') { actionDef = defs[d]; continue; }
                dataCols.push({
                    key: defs[d].field,
                    header: defs[d].displayName,
                    sortable: !!SORTABLE[defs[d].field],
                    align: defs[d].field == 'RefundAmount' ? 'right' : undefined
                });
            }
            var items = vm.gridConfig.data || [];
            $scope.reactPropsGridContainer = {
                reactProps: {
                    columns: dataCols,
                    actionsHeader: actionDef ? actionDef.displayName : 'Actions',
                    hasActions: !!actionDef,
                    rows: items.map(function (entity) {
                        var cells = {};
                        for (var c = 0; c < dataCols.length; c++) {
                            cells[dataCols[c].key] = cellFor(entity, dataCols[c].key);
                        }
                        return {
                            id: entity.Id,
                            //Single live action in the original cellTemplate: the
                            //edit.svg icon dispatching handleEvents('view', entity),
                            //which opens app.iprefund-form via openModal(entity.Id).
                            actions: [{ key: 'view', label: '', icon: 'fas fa-edit', variant: 'icon' }],
                            cells: cells
                        };
                    })
                },
                onAction: $scope.handleGridAction
            };
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Facility"
            },
            {
                "Key": "RefundType"
            },
            {
                "Key": "RefundStatus"
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

        $scope.initLookup();
    }

    iprefundListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();