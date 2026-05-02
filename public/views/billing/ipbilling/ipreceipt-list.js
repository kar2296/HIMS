(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ipreceiptListController', ipreceiptListController);

    function ipreceiptListController($scope, $stateParams, $state, $filter, $translate, utl) {

        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        $scope.currentcontext = {};
        $scope.currentcontext.CanIPRECEIPT_ADVANCE = utl.Privilege.hasAccess('CanIPRECEIPT_ADVANCE');
        // $scope.currentcontext.CanIPRECEIPT_REFUND = utl.Privilege.hasAccess('CanIPRECEIPT_REFUND');
        $scope.currentcontext.CanIPRECEIPT_CANCEL = utl.Privilege.hasAccess('CanIPRECEIPT_CANCEL');
        $scope.currentcontext.Canipbillingdeletebutton = utl.Privilege.hasAccess('Canipbillingdeletebutton');
        $scope.currentcontext.CanDelete = $scope.HasAccess('IPBILLING_DETAILS', 'CanDeletereceiptsButton');

        $scope.currentfilter = {
            // ReceiptStatusId: 1,
            ReceiptDate: utl.Formatter.getCurrentDate(),
            AdmissionDate: $scope.$parent.Data.AdmissionDate
        };

        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.isdaycare = $stateParams.isdaycare;
        $scope.item = {
            ReceiptDateTime: utl.Formatter.getCurrentDate()

        };
        $scope.IsLocked = $scope.$parent.Islocked;

        $scope.BillInfo = {};

        $scope.CheckFinalizeCallback = function (scope, res, options, hasError) {
            $scope.BillFinalized = false;
            if (res.Data.length > 0) {
                $scope.BillFinalized = true;

                $scope.FinalBillInfo = res.Data[0];
                $scope.currentcontext.BillId = $scope.FinalBillInfo.Id;
                if ($scope.FinalBillInfo.GuarantorTypeId == 1) {
                    $scope.currentcontext.OutStandingAmount = $scope.FinalBillInfo.OutStandingAmount;
                }
                if ($scope.FinalBillInfo.GuarantorTypeId > 1) {
                    $scope.currentcontext.OutStandingAmount = $scope.FinalBillInfo.PatientDue;
                }

            }
            $scope.IsDisabled = $scope.BillFinalized || $scope.IsLocked ? true : false;
            $scope.getList();
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
        // $scope.GetPatientBillSummaryCallback = function (scope, data, options, hasError) {
        //     $scope.BillFinalized = false;
        //     if (data.FinalBillInfo && data.FinalBillInfo.Id > 0) {
        //         $scope.FinalBillInfo = data.FinalBillInfo;
        //         $scope.currentcontext.BillId = $scope.FinalBillInfo.Id;
        //         if ($scope.FinalBillInfo.GuarantorTypeId == 1) {
        //             $scope.currentcontext.OutStandingAmount = $scope.FinalBillInfo.OutStandingAmount;
        //         }
        //         if ($scope.FinalBillInfo.GuarantorTypeId > 1) {
        //             $scope.currentcontext.OutStandingAmount = $scope.FinalBillInfo.PatientDue;
        //         }
        //         $scope.BillFinalized = true;
        //     }
        //     $scope.IsDisabled = $scope.BillFinalized || $scope.IsLocked ? true : false;
        //     $scope.getList();
        // }

        // $scope.GetPatientBillSummary = function () {
        //     var options = {
        //         action: 'billing/PatientBillSummary/GetPatientBillSummaryDetails',
        //         data: {
        //             Data: {
        //                 EncounterId: $scope.currentcontext.id
        //             }
        //         },
        //         type: 'post',
        //         onComplete: $scope.GetPatientBillSummaryCallback
        //     };
        //     utl.Http.doAction(options);
        // };

        $scope.getListCallback = function (scope, data, options, hasError) {
            $scope.TotalAmt = 0;
            forEach(data.Data, function (value, index) {
                if (value.ReceiptStatusId != 3 && value.ReceiptStatusId != 4) {
                    $scope.TotalAmt += value.AmountPaid;
                }
                // value.PatientName = value.Patient.FirstName + ' / ' + value.Patient.Age + ' Years / ' + value.Patient.MRN;
                value.isRefundCancel = !$scope.currentcontext.BillId ? true : false;
                value.IPRECEIPT_CANCEL = $scope.currentcontext.CanIPRECEIPT_CANCEL;
                value.showDelete = $scope.currentcontext.CanDelete ? 1 : 0;
                // value.AmountPaid = parseFloat(value.AmountPaid).toFixed(2);
            });

            vm.gridConfig.data = data.Data;
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
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
                        Key: 30,
                        Value: [1, 2, 3, 6, 7]
                    },
                    {
                        Key: 29,
                        Value: 2
                    },
                    // { Key: 8, Value: $scope.currentfilter.namemrn },
                    {
                        Key: 10,
                        Value: $scope.currentcontext.id
                    },
                    //{ Key: 11, Value: $scope.$parent.Data.EncounterId }

                    {
                        Key: 13,
                        Value: false
                    },
                    {
                        Key: 16,
                        Value: false
                    }, // IsConsolidatePay Commented after approval from gopi- 6/5/2025
                    // {
                    //     Key: 38,//IsClaimReceipt
                    //     Value: false
                    // },
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
                action: 'Billing/PatientPaymentDetails/GetPatientPaymentDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.print = function (ReceiptId) {
            var inputData = {
                Id: ReceiptId,
                Data: {
                    isprint: false,
                    withHeader: true
                }
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
            utl.Modal.openFixedDialog('app.ipreceipt-form', {
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
                confirmCallback: $scope.CheckFinalize,
                cancelCallback: $scope.CheckFinalize
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
                    IsAgainstReceipt: true,
                    from: 'advancescreen'
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




        // checking Finalized bill

        // $scope.amountConversion = function (amount) {
        //     if (amount != undefined) {
        //         return parseFloat(amount).toFixed(2);
        //     }
        //     else {
        //         return 0;
        //     }
        // }

        $scope.Fund = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do You want to Transfer this as Fund?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.OnFundConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }


        $scope.OnFundConfirmed = function () {
            $scope.item.Id = $scope.currentcontext.rptId;
            $scope.item.ReceiptTypeId = 5;
            var options = {
                action: 'billing/PatientPaymentDetails/UpdatePatientPaymentDetails',
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.getList
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'refund') {
                $scope.openRefund(0, entity)
            } else if (actionType == 'fund') {
                $scope.currentcontext.rptId = entity.Id;
                $scope.Fund(entity.Id)
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
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.AmountPaid | displaycurrency}}</span>" + "</div>"
                    // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{entity.AmountPaid | displaycurrency}}</span>' + '</div>'
                },
                {
                    field: "PaymentType.Description",
                    displayName: $translate.instant('billing.receipt-list.paymentmode.lbl')
                },
                {
                    field: "ReceiptStatus.Description",
                    displayName: $translate.instant('billing.receipt-list.status.lbl')
                },
                // {
                //     field: "Id",
                //     displayName: $translate.instant('common.actions_col.lbl'),
                //     width: '20%',
                //     cellTemplate: '<div class="ui-grid-cell-contents actions">\
                //                 <span class="grid-action " style="text-decoration: underline;font-size: 20px;" ng-click="handleEvents(\'view\',entity)"ng-show="entity.ReceiptStatusId == 1 || entity.ReceiptStatusId == 3"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                //                 <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"    ng-show="entity.ReceiptStatusId == 2"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                //                 <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ReceiptStatusId == 2"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                //                 <span class="grid-action"style="text-decoration: underline;color: #27a727;    font-size: 20px;" ng-click="handleEvents(\'refund\',entity)"  ng-show="entity.ReceiptTypeId != 6 && entity.ReceiptStatusId == 1 && entity.isRefundCancel"><i class="fas fa-hand-holding-usd"></i></span>\
                //                 <span class="grid-action" ng-show="entity.ReceiptTypeId == 6 && entity.ReceiptStatusId == 1 && entity.isRefundCancel">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>\
                //                 <span class="grid-action" style="text-decoration: underline;color:#795548;font-size: 20px;" ng-click="handleEvents(\'print\',entity)"ng-show="entity.ReceiptStatusId != 2"><i class="fa fa-print"></i></span>\
                // <span class="grid-action" style="text-decoration: underline;color:#795548;font-size: 20px;" ng-click="handleEvents(\'print\',entity)"ng-show="entity.ReceiptStatusId != 2"><i class="fa fa-print"></i></span>\

                //                 <span class="grid-action"style="text-decoration: underline;color: #F44336;font-size: 20px;"  ng-click="handleEvents(\'cancel\',entity)" ng-show="(entity.IPRECEIPT_CANCEL) && entity.ReceiptStatusId == 1 && entity.isRefundCancel"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                //            </div>',
                //     handleEvent: $scope.handleEvents,
                // }
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    width: '20%',
                    cellTemplate: '<div class="ui-grid-cell-contents actions">\
                            <span class="grid-action " style="text-decoration: underline;font-size: 20px;" ng-click="handleEvents(\'view\',entity)"ng-show="entity.ReceiptStatusId == 1 || entity.ReceiptStatusId == 3"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                            <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"    ng-show="entity.ReceiptStatusId == 2"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                            <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="Canipbillingdeletebutton() && entity.ReceiptStatusId == 2"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                            <span class="grid-action"style="text-decoration: underline;color: #27a727;    font-size: 20px;" ng-click="handleEvents(\'refund\',entity)"  ng-show="entity.ReceiptTypeId != 6 && entity.ReceiptStatusId == 1 && entity.isRefundCancel"><i class="fas fa-hand-holding-usd"></i></span>\
                            <span class="grid-action"style="text-decoration: underline;color: #27a727; font-size: 20px;" ng-click="handleEvents(\'fund\',entity)"  ng-show="entity.ReceiptTypeId ==1 && entity.ReceiptStatusId == 1 "><i class="fas fa-hand-holding-usd"></i></span>\
                            <span class="grid-action" ng-show="entity.ReceiptTypeId == 6 && entity.ReceiptStatusId == 1 && entity.isRefundCancel">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>\
                            <span class="grid-action"style="text-decoration: underline;color: #F44336;font-size: 20px;"  ng-click="handleEvents(\'cancel\',entity)" ng-if="entity.showDelete === 1" ng-show="entity.ReceiptStatusId == 1 && entity.isRefundCancel"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
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



        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            //$scope.getList();
            //$scope.CheckFinalize(); // checking Bill Finalized or not
            $scope.CheckFinalize();
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

    ipreceiptListController.$inject = ['$scope', '$stateParams', '$state', '$filter', '$translate', 'utl'];

})();