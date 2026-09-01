(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('addrefundListController', addrefundListController);

    function addrefundListController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        $scope.item = {
            PaymentTypeId: 1,
            RefundDateTime: utl.Formatter.getCurrentDate(),
            RefundTypeId: 1,
            WithHeader: true,
            WithoutHeader: false,
            RefundApprovalStatusId: 1
        };
        $scope.PatientRefundDetails = [];
        $scope.PatientRefunds = [];
        $scope.currentcontext = {};
        $scope.CanShowClearBtn = true;
        $scope.IsBillFinalized = false;
        $scope.UserCounterInfo = [];
        $scope.carddetailsmandatory = 0;
        $scope.carddetailsmandatory = utl.FacilitySetting.getFacilitySettingValue('billing', 'carddetailsmandatory');
        $scope.cashcountermandatory = 0;
        $scope.cashcountermandatory =
            (utl.FacilitySetting.getFacilitySettingValue('billing', 'cashcounter')) ? utl.FacilitySetting.getFacilitySettingValue('billing', 'cashcounter') : 0;
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
            $scope.item.RefundAmount = modalConfig.params.refundamount;
            if ($scope.item.RefundAmount > 0)
                $scope.item.RefundTypeId = 4;

            if (modalConfig.params.billid && modalConfig.params.billid > 0) {
                $scope.item.PatientBillId = modalConfig.params.billid;
            }
        }
        if (modalConfig && modalConfig.params.receipt) {
            $scope.item.RefundAmount = modalConfig.params.receipt.AmountPaid;
            if (modalConfig.params.receipt.RefundAmount && parseFloat(modalConfig.params.receipt.RefundAmount) > 0) {
                $scope.item.RefundAmount = $scope.item.RefundAmount - modalConfig.params.receipt.RefundAmount;
            }
            $scope.item.PatientReceiptId = modalConfig.params.receipt.Id;
            $scope.item.ReceiptNo = modalConfig.params.receipt.ReceiptNumber;
            $scope.item.RefundTypeId = 2;
        }
        $scope.currentcontext.eid = parseInt(modalConfig.params.eid);
        $scope.currentcontext.rid = parseInt(modalConfig.params.rid);
        $scope.maxcashrefund = 0;
        $scope.maxcashrefund =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'maxcashrefund');

        $scope.iprefund = 0;
        $scope.iprefund =
            (utl.FacilitySetting.getFacilitySettingValue('billing', 'iprefundapproval')) ? utl.FacilitySetting.getFacilitySettingValue('billing', 'iprefundapproval') : 0;
        $scope.canHidePrintledBtn = false;
        $scope.canHideRefundBtn = false;
        $scope.canShowReqRefundBtn = false;
        if ($scope.iprefund == 1) {

            $scope.canShowReqRefundBtn = true;
            $scope.canHideRefundBtn = true;
        }

        $scope.IsAgainstReceipt = false;
        if (modalConfig && modalConfig.params && modalConfig.params.IsAgainstReceipt)
            $scope.IsAgainstReceipt = modalConfig.params.IsAgainstReceipt;


        //React bridge: renders TWO of this form's three <ui-select> controls
        //(Refund Type and Bank) through the shared BridgeLookupSelectScreen.
        //
        //THE PAYMENT MODE SELECT IS DELIBERATELY LEFT NATIVE. It carries
        //`required`, and Angular core's requiredDirective (restrict 'A',
        //require '?ngModel' -- "force truthy in case we are on non input
        //element") registers a real $validators.required on it. That feeds
        //item_form.$valid, which utl.Validator.validate($scope) reads and
        //saveItem() checks before every AddPatientRefund/UpdatePatientRefund
        //call. Moving it into React would silently remove a save-blocking
        //validator from a refund form, so it stays in the Angular form.
        //(The other two selects carry no validator, so their form validity
        //contribution is unconditionally valid either way.)
        //
        //Neither converted select has ng-change or on-select in the original,
        //so each dispatch only writes the same $scope.item field its ng-model
        //wrote. No calculation, validation, privilege check, payload or API
        //call is touched: save(), saveandApprove(), completeRefund(), Cancel(),
        //print(), saveItem() and every guard inside them are unchanged.
        $scope.handleRefundTypeAction = function (actionType, payload) {
            if (actionType == 'change') {
                $scope.item.RefundTypeId = payload.id;
                $scope.refreshReactProps();
            }
        };
        $scope.handleBankAction = function (actionType, payload) {
            if (actionType == 'change') {
                $scope.item.BankId = payload.id;
                $scope.refreshReactProps();
            }
        };

        $scope.refreshReactProps = function () {
            var lk = $scope.lookup || {};
            var it = $scope.item || {};
            $scope.reactPropsRefundTypeContainer = {
                reactProps: {
                    options: lk.RefundType || [],
                    value: it.RefundTypeId,
                    //ng-disabled="IsCompleted || IsAgainstReceipt"
                    disabled: !!($scope.IsCompleted || $scope.IsAgainstReceipt)
                },
                onAction: $scope.handleRefundTypeAction
            };
            $scope.reactPropsBankContainer = {
                reactProps: {
                    options: lk.Bank || [],
                    value: it.BankId,
                    //ng-disabled="IsCompleted"
                    disabled: !!$scope.IsCompleted
                },
                onAction: $scope.handleBankAction
            };
        };

        $scope.getEncounterCallback = function (scope, data, options, hasError) {
            $scope.Encounter = data;
            $scope.item.PatientId = $scope.Encounter.PatientId;
            $scope.item.EncounterId = $scope.Encounter.Id;
            if ($scope.Encounter.AdmissionStatusId > 4)
                $scope.IsBillFinalized = true;
        };

        $scope.getEncounter = function () {
            var options = {
                action: 'Visit/Visit/GetEncounterById',
                data: {
                    Id: $scope.currentcontext.eid
                },
                type: 'post',
                onComplete: $scope.getEncounterCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.refreshReactProps();
            $scope.IsCompleted = false;
            $scope.canShowPrintledBtn = false;
            $scope.canShowCancelledBtn = false;
            $scope.canHidePrintledBtn = false;
            if ($scope.item.RefundStatusId == 1) {
                if ($scope.IsBillFinalized) {
                    $scope.canShowCancelledBtn = false;
                } else {
                    $scope.canShowCancelledBtn = true;
                }
                $scope.CanShowClearBtn = false;
            }
            if ($scope.item.RefundStatusId == 1 || $scope.item.RefundStatusId == 3) {
                $scope.IsCompleted = true;
                $scope.canShowPrintledBtn = true;
                $scope.canHidePrintledBtn = true;
            }

            if ($scope.item.RefundApprovalStatusId == 2) {

                $scope.canHideRefundBtn = true;
                $scope.canShowReqRefundBtn = false;
                $scope.canHidePrintledBtn = true;
                $scope.IsCompleted = true;
                if ($scope.item.RefundStatusId == 2) {
                    $scope.canHideRefundBtn = false;

                }

            } else if ($scope.item.RefundApprovalStatusId == 3) {

                $scope.canHideRefundBtn = true;
                $scope.canHidePrintledBtn = true;
                $scope.canShowPrintledBtn = true;
                $scope.canShowReqRefundBtn = false;

            } else {
                if ($scope.item.RefundStatusId == 1) {
                    $scope.canHideRefundBtn = false;
                    if ($scope.item.RefundApprovalStatusId == 1) {

                    }
                }
                if ($scope.item.RefundStatusId == 2) {
                    $scope.canHideRefundBtn = true;
                    $scope.canHidePrintledBtn = true;
                    $scope.canShowPrintledBtn = true;
                    if ($scope.item.RefundApprovalStatusId == 1) {
                        $scope.canShowReqRefundBtn = false;
                        $scope.canShowPrintledBtn = false;
                    }
                }
            }
            $scope.refreshReactProps();
        };

        $scope.getItem = function () {

            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {

                var options = {
                    action: 'billing/PatientRefund/GetPatientRefundById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.checkHeader = function (iVal) {
            if (iVal == 1) {
                $scope.item.WithoutHeader = false;
            }
            if (iVal == 2) {
                $scope.item.WithHeader = false;
            }
        };

        $scope.backToList = function () {
            $scope.confirmCallback();
        };

        $scope.ReceiptPicker = function () {
            utl.Modal.open('app.receiptpicker', {
                params: {
                    id: $scope.item.PatientId,
                    eid: $scope.currentcontext.id,
                },
                confirmCallback: $scope.getReceiptData
            });
        };

        $scope.onCancelConfirmed = function () {
            $scope.item.RefundStatusId = 3;
            $scope.saveItem();
        };

        $scope.print = function () {

            var inputData = {
                Id: $scope.currentcontext.id,
                Data: {
                    withHeader: $scope.item.WithHeader,
                    withoutHeader: $scope.item.WithoutHeader,
                }
            };
            var options = {
                action: 'Billing/PatientRefund/PrintPatientRefund',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.Cancel = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'billing.refund-form.cancelmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                placeholder: $scope.item.RefundIdentifier,
                onSuccessMethod: $scope.onCancelConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions, $scope.item.RefundIdentifier);
        };

        $scope.save = function () {
            $scope.item.EncounterTypeId = $scope.Encounter.EncounterTypeId;
            $scope.item.RefundStatusId = 2;
            $scope.item.EncounterId = $scope.currentcontext.eid;
            $scope.saveItem();
        };

        $scope.saveandApprove = function () {
            $scope.item.EncounterTypeId = $scope.Encounter.EncounterTypeId;
            $scope.item.RefundStatusId = 1;
            $scope.item.EncounterId = $scope.currentcontext.eid;
            $scope.saveItem();
        };

        $scope.GetPatientRefundDetails = function () {
            return [{
                Id: 0,
                RefundDetailsDateTime: new Date(),
                FacilityId: utl.Session.getCurrentFacilityId(),
                PatientId: $scope.item.PatientId,
                EncounterId: $scope.item.EncounterId,
                EncounerTypeId: 2,
                RefundAmount: $scope.item.RefundAmount,
                DepartmentID: $scope.item.DepartmentID,
                DoctorId: $scope.item.DoctorId,
            }];
        };
        $scope.clear = function () {
            $scope.item = {};
            $scope.refreshReactProps();
        }
        $scope.completeRefund = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'billing.refund-form.confirm.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveandApprove
            };

            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.saveItem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }

            if ($scope.item.PaymentTypeId == 1) {
                if (parseInt($scope.item.RefundAmount) > parseInt($scope.maxcashrefund)) {
                    utl.Alert.showErrorMsg('Reached limit of Max.Cash Refund...');
                    return;
                }
            }

            if ($scope.IsAgainstReceipt == true) {
                if ($scope.item.RefundTypeId == 2) {
                    var refund = modalConfig.params.receipt.AmountPaid - modalConfig.params.receipt.RefundAmount;
                    if (parseFloat(refund) <= 0) {
                        utl.Alert.showErrorMsg($translate.instant('Please Check Amount!...Not able to Return AgainstReceipt'));
                        return;
                    }
                }
            }
            if ($scope.carddetailsmandatory == 1) {
                if ($scope.currentcontext.PaymentTypeId == 5 || $scope.currentcontext.PaymentTypeId == 6 ||
                    $scope.currentcontext.PaymentTypeId == 11) {
                    if (!$scope.item.BankId) {
                        utl.Alert.showErrorMsg($translate.instant('Please Select Bank!...'));
                        return;
                    }
                    // if (!$scope.item.CardTypeId) {
                    //     utl.Alert.showErrorMsg($translate.instant('Please Select CardType!...'));
                    //     return;
                    // }
                    // if (!$scope.item.TerminalNoId) {
                    //     utl.Alert.showErrorMsg($translate.instant('Please Select TerminalNo!...'));
                    //     return;
                    // }
                }
                if ($scope.currentcontext.PaymentTypeId == 5 || $scope.currentcontext.PaymentTypeId == 6) {
                    if (!$scope.item.AuthorizeNumber || $scope.item.AuthorizeNumber == '') {
                        utl.Alert.showErrorMsg($translate.instant('Please Enter AuthCode!...'));
                        return;
                    }
                }
                // if ($scope.currentcontext.PaymentTypeId == 11) {
                //     if (!$scope.item.UPIRefNumber || $scope.item.UPIRefNumber == '') {
                //         utl.Alert.showErrorMsg($translate.instant('Please Enter AuthCode!...'));
                //         return;
                //     }
                // }
            }

            $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
            $scope.item.IsRefundApprove == false;
            if ($scope.iprefund == 1) {
                $scope.item.IsRefundApprove = true;
            }
            if ($scope.cashcountermandatory == 1) {
                if ($scope.UserCounterInfo.length == 0) {
                    utl.Alert.showErrorMsg($translate.instant('Please Start Cash Counter'));
                    return false;
                    // $scope.clear();
                }
            }

            if (modalConfig && modalConfig.params && modalConfig.params.from && modalConfig.params.from == 'advancescreen')
                $scope.item.fromIPBilling = true;

            var actionName = 'billing/PatientRefund/AddPatientRefund';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'billing/PatientRefund/UpdatePatientRefund';
            }
            if (!$scope.PatientRefundDetails || $scope.PatientRefundDetails.length == 0) {
                $scope.PatientRefundDetails = $scope.GetPatientRefundDetails();
            }

            if ($scope.item.RefundStatusId == 1) {
                $scope.item.RefundGeneratedById = utl.Session.getCurrentUserId();
            }

            var inputData = {
                Header: $scope.item,
                Details: $scope.PatientRefundDetails
            };
            // console.log($scope.item);return;
            var options = {
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        $scope.getListCallback = function (scope, data, options, hasError) {
            $scope.PatientRefunds = [];
            for (var idx in data.Data) {
                var item = data.Data[idx];
                if (item.RefundStatusId == 1) {
                    $scope.PatientRefunds.push(item);
                }
            }
        };

        $scope.getList = function () {
            var inputData = {
                Params: [{
                    Key: 5,
                    Value: 1
                }, //Completed
                {
                    Key: 9,
                    Value: $scope.item.PatientReceiptId
                },
                {
                    Key: 10,
                    Value: $scope.currentcontext.eid
                },
                {
                    Key: 11,
                    Value: 2
                }, //IP
                    // {
                    //     Key: 24,//Receipt Type
                    //     Value: [1, 2, 3, 7]//Receipt,DueCollect,ipadvance,pharmacy advance
                    // }
                ]
            };

            var options = {
                action: 'Billing/PatientRefund/GetPatientRefund',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.checkCounterStatusCallback = function (scope, res, options, hasError) {
            $scope.UserCounterInfo = res.Data || [];
            $scope.getEncounter();
            $scope.getItem();
            $scope.getList();
            // if ($scope.UserCounterInfo && $scope.UserCounterInfo.length > 0) {
            //     $scope.getEncounter();
            //     $scope.getItem();
            //     $scope.getList();
            // } else {
            //     utl.Alert.showErrorMsg($translate.instant('Please Start Cash Counter'));
            //     $scope.confirmCallback();
            // }
        };

        $scope.checkCounterStatusByUserId = function () {
            var inputData = {
                Params: [
                    { Key: 1, Value: utl.Session.getCurrentUserId() },
                    { Key: 10, Value: 1 }
                ],
                PageContext: { PageSize: 1000, PageNumber: 1 }
            };

            var options = {
                action: 'billing/userbillingcounters/GetBillingCounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.checkCounterStatusCallback
            };

            utl.Http.doAction(options);
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.refreshReactProps();
            if ($scope.cashcountermandatory == 1) {
                $scope.checkCounterStatusByUserId();
            } else {
                $scope.getEncounter();
                $scope.getItem();
                $scope.getList();
            }
        };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "PaymentType"
            },
            {
                "Key": "CurrencyType"
            },
            {
                "Key": "PackageName"
            },
            {
                "Key": "Bank"
            },
            {
                "Key": "CardType"
            },
            {
                "Key": "RefundType"
            },
            {
                "Key": "Terminal"
            }
            ];

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

    addrefundListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];
})();