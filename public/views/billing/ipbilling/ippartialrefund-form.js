(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('addpartialrefundListController', addpartialrefundListController);

    function addpartialrefundListController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));

        $scope.item = {
            PaymentTypeId: 1,
            RefundDateTime: utl.Formatter.getCurrentDate(),
            RefundTypeId: 1,
            CurrencyTypeId: 1,
            AdvanceAmount: 0,
            RefundedAmount: 0,
            FacilityId: utl.Session.getCurrentFacilityId(),
            RefundApprovalStatusId: 1
        };

        $scope.PatientRefundDetails = [];
        $scope.PatientRefunds = [];
        $scope.currentcontext = {};
        $scope.UserCounterInfo = [];
        $scope.maxcashrefund = 0;
        $scope.maxcashrefund =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'maxcashrefund');

        $scope.cashcountermandatory = 0;
        $scope.cashcountermandatory =
            (utl.FacilitySetting.getFacilitySettingValue('billing', 'cashcounter')) ? utl.FacilitySetting.getFacilitySettingValue('billing', 'cashcounter') : 0;
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
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
            $scope.item.RefundAmount = modalConfig.params.refundamount;
            if ($scope.item.RefundAmount > 0) {
                $scope.item.RefundTypeId = 4;
            }
            if (modalConfig.params.billid && modalConfig.params.billid > 0) {
                $scope.item.PatientBillId = modalConfig.params.billid;
            }
        }

        if (modalConfig && modalConfig.params.receipt) {
            $scope.item.RefundAmount = modalConfig.params.receipt.AmountPaid;
            $scope.item.PatientReceiptId = modalConfig.params.receipt.Id;
            $scope.item.ReceiptNo = modalConfig.params.receipt.ReceiptNumber;
            $scope.item.RefundTypeId = 2;
            // $scope.item.RefundApprovalStatusId = 1;
        }

        $scope.currentcontext.eid = parseInt(modalConfig.params.eid);
        $scope.currentcontext.rid = parseInt(modalConfig.params.rid);

        $scope.getEncounterCallback = function (scope, res, options, hasError) {
            $scope.Encounter = res.Data[0];
            $scope.item.PatientId = $scope.Encounter.PatientId;
            $scope.item.EncounterId = $scope.Encounter.Id;
            var advamount = 0;
            var adjamount = 0;
            var refamount = 0;
            if ($scope.Encounter.PatientPaymentDetails) {
                for (var pidx in $scope.Encounter.PatientPaymentDetails) {
                    var payitem = $scope.Encounter.PatientPaymentDetails[pidx];
                    advamount = advamount + payitem.AmountPaid;
                }
                $scope.item.AdvanceAmount = advamount;
            }
            if ($scope.Encounter.PatientRefunds) {
                for (var ridx in $scope.Encounter.PatientRefunds) {
                    var refitem = $scope.Encounter.PatientRefunds[ridx];
                    refamount = refamount + refitem.RefundAmount;
                }
                $scope.item.RefundedAmount = refamount;
            }

            $scope.item.AdvanceAmount = $scope.item.AdvanceAmount - $scope.item.RefundedAmount;
        };

        // $scope.getEncounter = function() {
        //     var options = {
        //         action: 'Visit/Visit/GetEncounterById',
        //         data: { Id: $scope.currentcontext.eid },
        //         type: 'post',
        //         onComplete: $scope.getEncounterCallback
        //     };
        //     utl.Http.doAction(options);
        // };

        $scope.getEncounterAdvances = function () {
            var inputData = {
                Params: [
                    { Key: 0, Value: $scope.currentcontext.eid }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'Visit/Visit/GetEncounterAdvances',
                data: inputData,
                type: 'post',
                onComplete: $scope.getEncounterCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.IsCompleted = false;
            $scope.refreshReactProps();
            $scope.canShowPrintledBtn = false;
            $scope.canShowCancelledBtn = false;
            $scope.canHidePrintledBtn = false;
            if ($scope.item.RefundStatusId == 1) {
                $scope.canShowCancelledBtn = true;
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
                    }
                }
            }
        };

        $scope.getItem = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'billing/PatientRefund/GetPatientRefundById',
                    data: { Id: $scope.currentcontext.id },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $scope.confirmCallback();
        };

        $scope.ReceiptPicker = function () {
            utl.Modal.open('app.receiptpicker', {
                params: { id: $scope.item.PatientId, eid: $scope.currentcontext.id, },
                confirmCallback: $scope.getReceiptData
            });
        };

        $scope.onCancelConfirmed = function () {
            $scope.item.RefundStatusId = 3;
            $scope.saveItem();
        };

        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'Billing/PatientRefund/PrintPatientRefund',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };
        $scope.clear = function () {
            $scope.item = {};
            $scope.refreshReactProps();
        }
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
            if ($scope.item.RefundAmount == 0) {
                utl.Alert.showErrorMsg('Refund Amount Should Greater Than Zero.');
                return false;
            } else if ($scope.item.RefundAmount > $scope.item.AdvanceAmount) {
                utl.Alert.showErrorMsg('Refund Amount Should Not Greater Than Advance Amount.');
                return false;
            }
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

            var inputData = { Header: $scope.item, Details: $scope.PatientRefundDetails };
            var options = {
                action: actionName,
                data: { Data: inputData },
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
                Params: [
                    { Key: 9, Value: $scope.item.PatientReceiptId },
                    { Key: 10, Value: $scope.currentcontext.eid }
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
            $scope.getEncounterAdvances();
            $scope.getItem();
            $scope.getList();
            // if ($scope.UserCounterInfo && $scope.UserCounterInfo.length > 0) {
            //     $scope.getEncounterAdvances();
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

        //React bridge: renders the two NON-VALIDATING <ui-select>s (Currency
        //Type and Refund Type) through the shared BridgeLookupSelectScreen.
        //
        //The Payment Mode, Bank and Card Type selects are DELIBERATELY LEFT
        //NATIVE: each carries `required`, and Angular core's requiredDirective
        //(restrict 'A', require '?ngModel') registers a real
        //$validators.required on them. Those feed item_form.$valid, which
        //utl.Validator.validate($scope) returns and saveItem() checks before
        //every Add/UpdatePatientRefund call. Moving them into React would
        //silently remove save-blocking validators from a refund form.
        //The two converted selects carry no validator, so form validity is
        //bit-for-bit unchanged.
        //
        //Neither converted select has ng-change or on-select in the original,
        //so each dispatch only writes the same $scope.item field its ng-model
        //wrote. No calculation, guard, privilege, payload or API call moves.
        $scope.handleCurrencyTypeAction = function (actionType, payload) {
            if (actionType == 'change') {
                $scope.item.CurrencyTypeId = payload.id;
                $scope.refreshReactProps();
            }
        };
        $scope.handleRefundTypeAction = function (actionType, payload) {
            if (actionType == 'change') {
                $scope.item.RefundTypeId = payload.id;
                $scope.refreshReactProps();
            }
        };

        $scope.refreshReactProps = function () {
            var lk = $scope.lookup || {};
            var it = $scope.item || {};
            $scope.reactPropsCurrencyTypeContainer = {
                //ng-disabled="IsCompleted"
                reactProps: { options: lk.CurrencyType || [], value: it.CurrencyTypeId, disabled: !!$scope.IsCompleted },
                onAction: $scope.handleCurrencyTypeAction
            };
            $scope.reactPropsRefundTypeContainer = {
                //ng-disabled="true" in the original -- permanently read-only.
                reactProps: { options: lk.RefundType || [], value: it.RefundTypeId, disabled: true },
                onAction: $scope.handleRefundTypeAction
            };
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.refreshReactProps();
            //$scope.getEncounter();
            if ($scope.cashcountermandatory == 1) {
                $scope.checkCounterStatusByUserId();
            } else {
                $scope.getEncounterAdvances();
                $scope.getItem();
                $scope.getList();
            }
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "PaymentType" },
                { "Key": "CurrencyType" },
                { "Key": "PackageName" },
                { "Key": "Bank" },
                { "Key": "CardType" },
                { "Key": "RefundType" },
                { "Key": "Terminal" }
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };

            utl.Http.doAction(options);
        }

        $scope.refreshReactProps();

        $scope.initLookup();
    }

    addpartialrefundListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];
})();