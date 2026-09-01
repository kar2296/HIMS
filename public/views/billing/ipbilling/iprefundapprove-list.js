(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('iprefundApproveListController', iprefundApproveListController);

    function iprefundApproveListController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        // $scope.currentcontext.CanIPREF_REFUND = utl.Privilege.hasAccess('CanIPREF_REFUND');
        // $scope.currentcontext.CanIPREF_PARTIAL_REFUND = utl.Privilege.hasAccess('CanIPREF_PARTIAL_REFUND');
        $scope.currentcontext = {};

        $scope.currentfilter = {
            RefundDateTime: utl.Formatter.getCurrentDate(),
            FromBillDate: utl.Formatter.getCurrentDate(),
            ToBillDate: utl.Formatter.getCurrentDate(),
            RefundStatusId: 1,
            RefundApprovalStatusId: 1
        };

        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.IsLocked = $scope.$parent.Islocked;
        $scope.currentcontext.isdaycare = $stateParams.isdaycare;
        $scope.getListCallback = function (scope, data, options, hasError) {
            $scope.TotalAmt = 0;
            forEach(data.Data, function (value, index) {
                $scope.TotalAmt += value.RefundAmount;
                value.PatientName = value.Patient.FirstName + ' / ' + value.Patient.Age + ' Years / ' + value.Patient.MRN;
            });
            vm.gridConfig.data = data.Data;
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
            $scope.CheckFinalize();
            $scope.refreshReactProps();
        };

        $scope.getList = function () {
            var fromDate = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd 00:00:00');
            var toDate = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentfilter.receipt
                    },
                    // { Key: 3, Value: $scope.currentfilter.RefundDateTime },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.RefundTypeId
                    },
                    // {
                    //     Key: 5,
                    //     Value: $scope.currentfilter.RefundStatusId
                    // },
                    {
                        Key: 26,
                        Value: [$scope.currentfilter.RefundApprovalStatusId]
                    },
                    {
                        Key: 10,
                        Value: $scope.currentcontext.id
                    },
                    // {
                    //     Key: 11,
                    //     Value: 2
                    // },
                    {
                        Key: 12,
                        Value: fromDate
                    },
                    {
                        Key: 13,
                        Value: toDate
                    },
                    {
                        Key: 19,
                        Value: false
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
            utl.Modal.open('app.iprefundapprove-form', {
                params: {
                    id: refundId,
                    eid: $scope.BillInfo.EncounterId,
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


        //React bridge: this screen's Refund Approval Status filter renders via
        //the shared BridgeLookupSelectScreen and its
        //<custom-table config="vm.gridConfig"> via the shared BridgeGridScreen.
        //Amounts and dates are formatted here with the same
        //$filter('displaycurrency') / $filter('date', ...) calls the original
        //cellTemplates used. Row actions dispatch back into this controller's
        //existing, unchanged $scope.handleEvents.
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

        $scope.handleFilterAction = function (actionType, payload) {
            if (actionType == 'change') {
                $scope.currentfilter.RefundApprovalStatusId = payload.id;
                $scope.getList();
            }
        };

        $scope.refreshReactProps = function () {
            var defs = vm.gridConfig.columnDefs || [];
            function hdr(i) { return defs[i] ? defs[i].displayName : ''; }
            function patientLabel(p) {
                if (!p) { return ''; }
                var title = p.Title && p.Title.Description ? p.Title.Description + ' ' : '';
                return (title + (p.FirstName || '') + ' ' + (p.LastName || '') + ' / ' + (p.Age || '') + ' / ' + (p.Gender && p.Gender.Description ? p.Gender.Description : '')).trim();
            }
            var items = vm.gridConfig.data || [];
            $scope.reactPropsGridContainer = {
                reactProps: {
                    columns: [
                        { key: 'refundno', header: hdr(0), sortable: true },
                        { key: 'refunddate', header: hdr(1), sortable: true },
                        { key: 'patient', header: hdr(2), link: true },
                        { key: 'refundtype', header: hdr(3), sortable: true },
                        { key: 'refundamount', header: hdr(4), align: 'right' },
                        { key: 'paymentmode', header: hdr(5), sortable: true },
                        { key: 'refundstatus', header: hdr(6), sortable: true },
                        { key: 'approvalstatus', header: hdr(7), sortable: true }
                    ],
                    actionsHeader: defs.length ? defs[defs.length - 1].displayName : 'Actions',
                    hasActions: true,
                    rows: items.map(function (entity) {
                        //Same ng-show conditions the original action cellTemplate used:
                        //the edit/view icon for RefundStatusId 1 or 2, delete only for 1.
                        var acts = [];
                        if (entity.RefundStatusId == 1 || entity.RefundStatusId == 2) {
                            acts.push({ key: 'view', label: '', icon: 'fas fa-edit', variant: 'icon' });
                        }
                        if (entity.RefundStatusId == 1) {
                            acts.push({ key: 'delete', label: $translate.instant('common.deleteaction.lbl'), variant: 'link' });
                        }
                        return {
                            id: entity.Id,
                            actions: acts,
                            cells: {
                                refundno: entity.RefundIdentifier,
                                refunddate: (entity.RefundDateTime ? $filter('date')(entity.RefundDateTime, 'dd-MMM-yyyy') : '') + ' ' + (entity.RefundDateTime ? $filter('date')(entity.RefundDateTime, 'HH:mm') : ''),
                                patient: patientLabel(entity.Patient),
                                refundtype: entity.RefundType && entity.RefundType.Description,
                                refundamount: $filter('displaycurrency')(entity.RefundAmount),
                                paymentmode: entity.PaymentType && entity.PaymentType.Description,
                                refundstatus: entity.RefundStatus && entity.RefundStatus.Description,
                                approvalstatus: entity.RefundApprovalStatus && entity.RefundApprovalStatus.Description
                            }
                        };
                    })
                },
                onAction: $scope.handleGridAction
            };
            $scope.reactPropsFilterContainer = {
                reactProps: {
                    options: ($scope.lookup && $scope.lookup.RefundApprovalStatus) || [],
                    value: $scope.currentfilter.RefundApprovalStatusId
                },
                onAction: $scope.handleFilterAction
            };
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
                    field: "Patient",
                    displayName: $translate.instant('admissions.patientname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>"
                        // '<a ng-click="handleEvents(\'patientinfo\',entity)" uib-tooltip="{{entity.Patient.Title.Description}} ' + '{{entity.Patient.FirstName }} ' +
                        // '{{entity.Patient.LastName}} | ' + '{{entity.Patient.MRN}} | ' + '{{entity.Patient.Age}} | ' + '{{entity.Patient.Gender.Description}}" tooltip-placement="bottom">'
                        +
                        '<a ng-click="handleEvents(\'patientinfo\',entity)">' +
                        "<span ng-if='entity.Patient.Title && entity.Patient.Title.Description' >" +
                        "<b>{{entity.Patient.Title.Description}}</b>&nbsp;</span>" +
                        "<span ><b>{{entity.Patient.FirstName}}</b>&nbsp;</span>" +
                        "<span >{{entity.Patient.LastName}}&nbsp;</span>" +
                        "<span >/<span>" +
                        "<span >{{entity.Patient.Age}}&nbsp;</span>" +
                        "<span >/</span>" +
                        "<span >{{entity.Patient.Gender.Description}}&nbsp;</span>" +
                        "</a></div>",
                    handleEvent: $scope.handleEvents
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
                {
                    field: "RefundApprovalStatus.Description",
                    displayName: $translate.instant('Refund Approval Status')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents actionbuttons ">\
                    <span class="grid-action" style="text-decoration: underline;font-size:20px;" ng-click="handleEvents(\'view\',entity)"  ng-show="entity.RefundStatusId == 1||entity.RefundStatusId == 2"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                    <a class="grid-action" style="text-decoration: underline;color: blue;"    ng-click="handleEvents(\'delete\',entity)"   translate="common.deleteaction.lbl" ng-show="entity.RefundStatusId == 1"></a>\
                    </div>',
                    handleEvent: $scope.handleEvents,
                }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };

        $scope.refreshReactProps();

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
                },
                {
                    "Key": "RefundApprovalStatus"
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

    iprefundApproveListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();