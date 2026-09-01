(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('IPFundListController', IPFundListController);

    function IPFundListController($scope, $stateParams, $state, $filter, $translate, utl) {

        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));

        $scope.currentcontext.CanIPRECEIPT_ADVANCE = utl.Privilege.hasAccess('CanIPRECEIPT_ADVANCE');
        // $scope.currentcontext.CanIPRECEIPT_REFUND = utl.Privilege.hasAccess('CanIPRECEIPT_REFUND');
        // $scope.currentcontext.CanIPRECEIPT_CANCEL = utl.Privilege.hasAccess('CanIPRECEIPT_CANCEL');

        $scope.currentcontext = {};

        $scope.currentfilter = {
            // ReceiptStatusId: 1,
            ReceiptDate: utl.Formatter.getCurrentDate(),
            AdmissionDate: $scope.$parent.Data.AdmissionDate
        };

        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.item = {
            ReceiptDateTime: utl.Formatter.getCurrentDate()

        };
        $scope.IsLocked = $scope.$parent.Islocked;

        $scope.BillInfo = {};

        $scope.GetPatientBillSummaryCallback = function (scope, data, options, hasError) {
            $scope.BillFinalized = false;
            if (data.FinalBillInfo && data.FinalBillInfo.Id > 0) {
                $scope.FinalBillInfo = data.FinalBillInfo;
                $scope.currentcontext.BillId = $scope.FinalBillInfo.Id;
                $scope.currentcontext.OutStandingAmount = $scope.FinalBillInfo.OutStandingAmount;
                $scope.BillFinalized = true;
            }
            $scope.IsDisabled = $scope.BillFinalized || $scope.IsLocked ? true : false;
            $scope.getList();
        }

        $scope.GetPatientBillSummary = function () {
            var options = {
                action: 'billing/PatientBillSummary/GetPatientBillSummaryDetails',
                data: {
                    Data: {
                        EncounterId: $scope.currentcontext.id
                    }
                },
                type: 'post',
                onComplete: $scope.GetPatientBillSummaryCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getListCallback = function (scope, data, options, hasError) {
            $scope.TotalAmt = 0;
            forEach(data.Data, function (value, index) {
                if (value.ReceiptStatusId != 3 && value.ReceiptStatusId != 4) {
                    $scope.TotalAmt += value.AmountPaid;
                }
                // value.PatientName = value.Patient.FirstName + ' / ' + value.Patient.Age + ' Years / ' + value.Patient.MRN;
                value.isRefundCancel = !$scope.currentcontext.BillId ? true : false;
                // value.AmountPaid = parseFloat(value.AmountPaid).toFixed(2);
            });

            vm.gridConfig.data = data.Data;
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
            $scope.refreshReactProps();
        };

        $scope.getList = function () {
            var FrmDate = $filter('date')($scope.currentfilter.AdmissionDate, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.currentfilter.ReceiptDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentfilter.receipt
                    },
                    {
                        Key: 3,
                        Value: [FrmDate, ToDate]
                    },
                    {
                        Key: 4,
                        Value: 5
                    },
                    {
                        Key: 29,
                        Value: 2
                    },
                    {
                        Key: 10,
                        Value: $scope.currentcontext.id
                    },
                    {
                        Key: 11,
                        Value: 2
                    },
                    {
                        Key: 13,
                        Value: false
                    },
                    {
                        Key: 16,
                        Value: false
                    }, // IsConsolidatePay
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'Billing/PatientPaymentDetails/GetPatientPaymentDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.print = function (ReceiptId) {

            var inputData = {
                Id: ReceiptId
            };
            var options = {
                action: 'Billing/PatientPaymentDetails/PrintPatientPaymentDetails',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
        //Grid Actions
        $scope.addReceipt = function () {
            if (!$scope.BillFinalized) {
                $scope.openModal(0);
            } else if ($scope.BillFinalized && $scope.currentcontext.OutStandingAmount > 0) {
                $scope.openModal(0);
            } else {
                var msg = '';
                msg = 'Bill has been Finalized';
                utl.Alert.showErrorMsg($translate.instant(msg));
            }
        }

        $scope.AdjustAgainstFund = function () {
            if (!$scope.BillFinalized) {
                utl.Modal.open('app.ipadjustagainstadvance', {
                    params: {
                        id: $scope.$parent.selectedPatient.Id,
                        EncounterId: $scope.currentcontext.id,
                        ipflag: 1,
                        balanceamount: 0
                    },
                    confirmCallback: $scope.getList
                });
            } else if ($scope.BillFinalized && $scope.currentcontext.OutStandingAmount > 0) {
                utl.Modal.open('app.ipadjustagainstadvance', {
                    params: {
                        id: $scope.$parent.selectedPatient.Id,
                        EncounterId: $scope.currentcontext.id,
                        ipflag: 1,
                        balanceamount: 0
                    },
                    confirmCallback: $scope.getList
                });
            } else {
                var msg = '';
                msg = 'Bill has been Finalized';
                utl.Alert.showErrorMsg($translate.instant(msg));
            }
        };


        $scope.openModal = function (receiptId) {
            utl.Modal.openFixedDialog('app.ipfundform', {
                params: {
                    id: $scope.currentcontext.id,
                    rid: receiptId,
                    billid: $scope.currentcontext.BillId || 0,
                    osamt: $scope.currentcontext.OutStandingAmount || 0,
                    summarystatus: $scope.BillFinalized,
                    guarantorid: $scope.$parent.Data.GuarantorId,
                    patient: $scope.$parent.selectedPatient,
                    guarantortypeid: $scope.$parent.Data.GuarantorTypeId
                },
                confirmCallback: $scope.GetPatientBillSummary,
                cancelCallback: $scope.GetPatientBillSummary
            });
        }

        $scope.advanceTransfer = function () {
            if (!$scope.BillFinalized) {
                $scope.openAdvanceTransferModal();
            } else if ($scope.BillFinalized && $scope.currentcontext.OutStandingAmount > 0) {
                $scope.openAdvanceTransferModal();
            } else {
                var msg = '';
                msg = 'Bill has been Finalized';
                utl.Alert.showErrorMsg($translate.instant(msg));
            }
        }
        $scope.openAdvanceTransferModal = function () {
            utl.Modal.open('app.advance-transfer', {
                params: {
                    EncounterId: $scope.currentcontext.id,
                    isBillFinalized: $scope.BillFinalized,
                    guarantorid: $scope.$parent.Data.GuarantorId,
                    id: $scope.$parent.selectedPatient.Id,
                    guarantortypeid: $scope.$parent.Data.GuarantorTypeId
                },
                confirmCallback: $scope.onAdvanceTransfer
            });
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'Billing/PatientPaymentDetails/DeletePatientPaymentDetails',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };
        $scope.backToList = function () {
            if ($scope.item.AdmissionStatusId == 6) {
                $state.go('app.discharged-patients');
            } else {
                $state.go('app.ipbillingtab.summary');
            }
        };
        $scope.openRefund = function (refundId, receipt) {
            utl.Modal.open('app.iprefund-form', {
                params: {
                    id: refundId,
                    eid: $scope.currentcontext.id,
                    receipt: receipt,
                    IsAgainstReceipt: true
                },
                confirmCallback: $scope.getList
            });
        }

        $scope.vCancelItem = null;
        $scope.onCancelConfirmed = function (CancelItem) {
            CancelItem.ReceiptStatusId = 3;
            $scope.vCancelItem = CancelItem;

            /* Security IsValid */
            $scope.requiredsecuritypin =
                utl.FacilitySetting.getFacilitySettingValue('billing', 'requiredsecuritypin');

            if ($scope.requiredsecuritypin && !$scope.securitypisvalid)
                if (!$scope.securitypincheck())
                    return false;
            /* Security IsValid */

            var options = {
                action: 'billing/PatientPaymentDetails/UpdatePatientPaymentDetails',
                data: {
                    Data: CancelItem
                },
                type: 'post',
                onComplete: $scope.getList
            };
            utl.Http.doAction(options);

        };
        // checking Finalized bill - start 

        $scope.CheckFinalizeCallback = function (scope, res, options, hasError) {
            $scope.BillFinalized = false;
            if (res.Data.length > 0) {
                $scope.BillInfo = res.Data[0];
                $scope.BillFinalized = true;
            }
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

                action: 'billing/PatientBills/GetPatientBills',
                data: inputData,
                type: 'post',
                onComplete: $scope.CheckFinalizeCallback
            };
            utl.Http.doAction(options);
        };


        // checking Finalized bill

        // $scope.amountConversion = function (amount) {
        //     if (amount != undefined) {
        //         return parseFloat(amount).toFixed(2);
        //     }
        //     else {
        //         return 0;
        //     }
        // }

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'refund') {
                $scope.openRefund(0, entity)
            } else if (actionType == 'print') {
                $scope.print(entity.Id)
            } else if (actionType == 'edit') {
                if (entity.PaymentStatusId == 3) // payment consumed
                {
                    utl.Alert.showSuccessMsg($translate.instant('billing.ipbillingtab.paymentconsumed.lbl'));
                } else {
                    $scope.openModal(entity.Id)
                }
            } else if (actionType == 'view') {
                $scope.openModal(entity.Id)
            } else if (actionType == 'cancel') {
                if (!$scope.IsDisabled) {
                    $scope.requiredsecuritypin =
                        utl.FacilitySetting.getFacilitySettingValue('billing', 'requiredsecuritypin');

                    if ($scope.requiredsecuritypin) $scope.onCancelConfirmed(entity);
                    else utl.Dialog.confirmCancel($scope.onCancelConfirmed, entity, entity.ReceiptNumber);
                } else {
                    var msg = '';
                    msg = $scope.BillFinalized ? 'Bill has been Finalized' : 'Bill has been Locked';
                    utl.Alert.showErrorMsg($translate.instant(msg));
                }
            } else if (actionType == 'delete') {
                if (entity.PaymentStatusId == 3) // payment consumed
                {
                    utl.Alert.showSuccessMsg($translate.instant('billing.ipbillingtab.paymentconsumed.lbl'));
                } else {
                    utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id, entity.SpecialityName);
                }
            }
        }

        /* Security IsValid */
        $scope.securitypisvalid = false;
        $scope.SecurityPINChkCallback = function (SecurityStatus) {
            //console.log(SecurityStatus);
            $scope.securitypisvalid = SecurityStatus.pinstatus;
            $scope.onCancelConfirmed($scope.vCancelItem);
        };
        $scope.securitydialogopened = false;
        $scope.securitypindiagCallback = function () {
            $scope.securitydialogopened = false;
        };
        $scope.securitypincheck = function () {
            if ($scope.requiredsecuritypin) {
                if (!$scope.securitydialogopened) {
                    $scope.securitydialogopened = true;
                    utl.Modal.open('app.securitypincheck', {
                        params: {},
                        confirmCallback: $scope.SecurityPINChkCallback,
                        cancelCallback: $scope.securitypindiagCallback
                    });
                }
                return false;
            }
        };
        /* Security IsValid */


        //React bridge: the two filter <ui-select>s (Receipt Type, Receipt
        //Status) render through the shared BridgeLookupSelectScreen and
        //<custom-table config="vm.gridConfig"> through the shared
        //BridgeGridScreen. Filters write the same currentfilter fields and call
        //the same getList(), so the
        //Billing/PatientPaymentDetails/GetPatientPaymentDetails payload is
        //unchanged. Every row action dispatches into this controller's
        //existing, unchanged $scope.handleEvents, so openRefund, print
        //(PrintPatientPaymentDetails), openModal and the PaymentStatusId == 3
        //"payment consumed" guard all still run from the controller.
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

        $scope.handleReceiptTypeAction = function (actionType, payload) {
            if (actionType == 'change') { $scope.currentfilter.ReceiptTypeId = payload.id; $scope.getList(); }
        };
        $scope.handleReceiptStatusAction = function (actionType, payload) {
            if (actionType == 'change') { $scope.currentfilter.ReceiptStatusId = payload.id; $scope.getList(); }
        };

        $scope.refreshReactProps = function () {
            var defs = vm.gridConfig.columnDefs || [];
            function hdr(i) { return defs[i] ? defs[i].displayName : ''; }
            function dt(v, f) { return v ? $filter('date')(v, f) : ''; }
            var items = vm.gridConfig.data || [];
            $scope.reactPropsGridContainer = {
                reactProps: {
                    columns: [
                        { key: 'receiptno', header: hdr(0), sortable: true },
                        { key: 'receiptdate', header: hdr(1) },
                        { key: 'receipttype', header: hdr(2), sortable: true },
                        { key: 'amountpaid', header: hdr(3), align: 'right' },
                        { key: 'paymentmode', header: hdr(4), sortable: true },
                        { key: 'receiptstatus', header: hdr(5), sortable: true }
                    ],
                    actionsHeader: hdr(6) || 'Actions',
                    hasActions: true,
                    //DUPLICATE-KEY QUIRK reproduced: vm.gridConfig declares
                    //`background:` TWICE in the same object literal, so the
                    //second one wins in JavaScript -- the effective rule is
                    //ReceiptStatusId 3 -> PINK (#fff text), not the red in the
                    //first, shadowed block. Documented, not "corrected".
                    highlightStyle: { background: 'pink', color: '#fff' },
                    rows: items.map(function (entity) {
                        var acts = [];
                        //ng-show="entity.ReceiptStatusId == 1 || entity.ReceiptStatusId == 3"
                        if (entity.ReceiptStatusId == 1 || entity.ReceiptStatusId == 3) {
                            acts.push({ key: 'view', label: '', icon: 'fas fa-edit', variant: 'icon', title: 'View' });
                        }
                        //ng-show="entity.ReceiptStatusId == 2"
                        if (entity.ReceiptStatusId == 2) {
                            acts.push({ key: 'edit', label: '', icon: 'fas fa-edit', variant: 'icon', title: 'Edit' });
                        }
                        //ng-show="entity.ReceiptStatusId == 2" (no privilege call
                        //on this screen, unlike ipreceipt-list)
                        if (entity.ReceiptStatusId == 2) {
                            acts.push({ key: 'delete', label: '', icon: 'fas fa-trash', variant: 'icon', title: 'Delete' });
                        }
                        //ng-show="entity.ReceiptTypeId != 6 && entity.ReceiptStatusId == 1 && entity.isRefundCancel"
                        if (entity.ReceiptTypeId != 6 && entity.ReceiptStatusId == 1 && entity.isRefundCancel) {
                            acts.push({ key: 'refund', label: '', icon: 'fas fa-hand-holding-usd', variant: 'icon', color: '#27a727', title: 'Refund' });
                        }
                        //ng-show="entity.ReceiptStatusId != 2"
                        if (entity.ReceiptStatusId != 2) {
                            acts.push({ key: 'print', label: '', icon: 'fa fa-print', variant: 'icon', color: '#795548', title: 'Print' });
                        }
                        return {
                            id: entity.Id,
                            highlight: entity.ReceiptStatusId == 3,
                            actions: acts,
                            cells: {
                                receiptno: entity.ReceiptNumber,
                                //PRE-EXISTING QUIRK: the receipt-date column formats
                                //entity.CreatedAt, not entity.ReceiptDateTime.
                                receiptdate: dt(entity.CreatedAt, 'dd-MMM-yyyy') + ' ' + dt(entity.CreatedAt, 'HH:mm'),
                                receipttype: entity.ReceiptType && entity.ReceiptType.Description,
                                amountpaid: $filter('displaycurrency')(entity.AmountPaid),
                                paymentmode: entity.PaymentType && entity.PaymentType.Description,
                                receiptstatus: entity.ReceiptStatus && entity.ReceiptStatus.Description
                            }
                        };
                    })
                },
                onAction: $scope.handleGridAction
            };
            var lk = $scope.lookup || {};
            $scope.reactPropsReceiptTypeContainer = { reactProps: { options: lk.ReceiptType || [], value: $scope.currentfilter.ReceiptTypeId }, onAction: $scope.handleReceiptTypeAction };
            $scope.reactPropsReceiptStatusContainer = { reactProps: { options: lk.ReceiptStatus || [], value: $scope.currentfilter.ReceiptStatusId }, onAction: $scope.handleReceiptStatusAction };
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            background: {
                style: {
                    field: 'ReceiptStatusId',
                    value: {
                        3: {
                            'background': 'red',
                            'color': '#fff'
                        }
                    },
                    // field: 'ReceiptStatusId',
                    // value: {
                    //     4: {
                    //         'background': 'pink',
                    //         'color': '#fff'
                    //     }
                    // }
                }
            },
            background: {
                style: {
                    // field: 'ReceiptStatusId',
                    // value: {
                    //     3: {
                    //         'background': 'red',
                    //         'color': '#fff'
                    //     }
                    // },
                    field: 'ReceiptStatusId',
                    value: {
                        3: {
                            'background': 'pink',
                            'color': '#fff'
                        }
                    }
                }
            },
            columnDefs: [{
                    field: "ReceiptNumber",
                    displayName: $translate.instant('billing.receipt-list.receiptno.lbl')
                },
                {
                    field: "ReceiptDateTime",
                    displayName: $translate.instant('billing.receipt-list.receiptdate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.CreatedAt | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{entity.CreatedAt| date: 'HH:mm'}}</span>" + "</div>"
                },
                //{ field: "Description", displayName: $translate.instant('billing.receipt-list.description.lbl') },
                {
                    field: "ReceiptType.Description",
                    displayName: $translate.instant('billing.receipt-list.type.lbl')
                },
                {
                    field: "AmountPaid",
                    displayName: $translate.instant('billing.receipt-list.receiptamount.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{entity.AmountPaid | displaycurrency}}</span>' + '</div>'
                },
                {
                    field: "PaymentType.Description",
                    displayName: $translate.instant('billing.receipt-list.paymentmode.lbl')
                },
                {
                    field: "ReceiptStatus.Description",
                    displayName: $translate.instant('billing.receipt-list.status.lbl')
                },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    width: '20%',
                    cellTemplate: '<div class="ui-grid-cell-contents actions">\
                            <span class="grid-action " style="text-decoration: underline;font-size: 20px;" ng-click="handleEvents(\'view\',entity)"ng-show="entity.ReceiptStatusId == 1 || entity.ReceiptStatusId == 3"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                            <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"    ng-show="entity.ReceiptStatusId == 2"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                            <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ReceiptStatusId == 2"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                            <span class="grid-action"style="text-decoration: underline;color: #27a727;    font-size: 20px;" ng-click="handleEvents(\'refund\',entity)"  ng-show="entity.ReceiptTypeId != 6 && entity.ReceiptStatusId == 1 && entity.isRefundCancel"><i class="fas fa-hand-holding-usd"></i></span>\
                            <span class="grid-action" ng-show="entity.ReceiptTypeId == 6 && entity.ReceiptStatusId == 1 && entity.isRefundCancel">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>\
                            <span class="grid-action" style="text-decoration: underline;color:#795548;font-size: 20px;" ng-click="handleEvents(\'print\',entity)"ng-show="entity.ReceiptStatusId != 2"><i class="fa fa-print"></i></span>\
                            <span class="grid-action"style="text-decoration: underline;color: #F44336;font-size: 20px;"  ng-click="handleEvents(\'cancel\',entity)"ng-show="entity.ReceiptStatusId == 1 && entity.isRefundCancel"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
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
            //$scope.getList();
            //$scope.CheckFinalize(); // checking Bill Finalized or not
            $scope.GetPatientBillSummary();
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "Facility"
                },
                //{ "Key": "Status" },
                {
                    "Key": "ReceiptType"
                },
                {
                    "Key": "ReceiptStatus"
                }
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

    IPFundListController.$inject = ['$scope', '$stateParams', '$state', '$filter', '$translate', 'utl'];

})();