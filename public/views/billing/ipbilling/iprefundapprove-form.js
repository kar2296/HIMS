(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('iprefundApproveFormController', iprefundApproveFormController);

    function iprefundApproveFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
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
            WithoutHeader: false
        };
        $scope.PatientRefundDetails = [];
        $scope.PatientRefunds = [];
        $scope.currentcontext = {};
        $scope.CanShowClearBtn = true;
        $scope.IsBillFinalized = false;
        $scope.carddetailsmandatory = 0;
        $scope.carddetailsmandatory = utl.FacilitySetting.getFacilitySettingValue('billing', 'carddetailsmandatory');
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
            $scope.item.PatientReceiptId = modalConfig.params.receipt.Id;
            $scope.item.ReceiptNo = modalConfig.params.receipt.ReceiptNumber;
            $scope.item.RefundTypeId = 2;
        }
        $scope.currentcontext.eid = parseInt(modalConfig.params.eid);
        $scope.currentcontext.rid = parseInt(modalConfig.params.rid);
        $scope.maxcashrefund = 0;
        $scope.maxcashrefund =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'maxcashrefund');

        $scope.IsAgainstReceipt = false;
        if (modalConfig && modalConfig.params && modalConfig.params.IsAgainstReceipt)
            $scope.IsAgainstReceipt = modalConfig.params.IsAgainstReceipt;

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
            // $scope.IsCompleted = false;
            $scope.canShowPrintledBtn = false;
            // $scope.canShowCancelledBtn = false;
            $scope.canHidePrintledBtn = true;
            // if ($scope.item.RefundStatusId == 1) {
            //     if ($scope.IsBillFinalized) {
            //         $scope.canShowCancelledBtn = false;
            //     } else {
            //         $scope.canShowCancelledBtn = true;
            //     }
            //     $scope.CanShowClearBtn = false;
            // }
            if ($scope.item.RefundStatusId == 1 || 3) {
                $scope.IsCompleted = true;
                $scope.canShowPrintledBtn = true;
                $scope.canHidePrintledBtn = false;
            }
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

        $scope.checkHeader = function(iVal) {
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
            $scope.item.RefundApprovalStatusId = 3;
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
                messageKey: 'Are u Sure.. you want to Reject this Refund?',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                placeholder: $scope.item.RefundIdentifier,
                onSuccessMethod: $scope.onCancelConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions, $scope.item.RefundIdentifier);
        };

        $scope.save = function () {
            $scope.item.EncounterTypeId = $scope.Encounter.EncounterTypeId;
            $scope.item.RefundStatusId = 1;
            $scope.item.EncounterId = $scope.currentcontext.eid;
            $scope.saveItem();
        };

        $scope.saveandApprove = function () {
            // $scope.item.EncounterTypeId = $scope.Encounter.EncounterTypeId;
            $scope.item.RefundApprovalStatusId = 2;
            $scope.item.RefundApprovedById = utl.Session.getCurrentUserId()
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
                messageKey: 'Are u Sure.. you want to Approve this Refund?',
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
            var actionName = 'billing/PatientRefund/AddPatientRefund';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'billing/PatientRefund/UpdatePatientRefund';
            }
            if (!$scope.PatientRefundDetails || $scope.PatientRefundDetails.length == 0) {
                $scope.PatientRefundDetails = $scope.GetPatientRefundDetails();
            }

            if ($scope.item.RefundStatusId == 2) {
                $scope.item.RefundGeneratedById = utl.Session.getCurrentUserId();
            }

            var inputData = {
                Header: $scope.item,
                Details: $scope.PatientRefundDetails
            };
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
                if (item.RefundStatusId == 2) {
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
                } //IP
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
            $scope.getEncounter();
            $scope.getItem();
            $scope.getList();
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

    iprefundApproveFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];
})();