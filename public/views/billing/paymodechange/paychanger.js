(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('paychangerController', paychangerController);

    function paychangerController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.items = [];
        $scope.item = {};
        $scope.currentcontext = {};
        $scope.carddetailsmandatory = 0;
        $scope.carddetailsmandatory = utl.FacilitySetting.getFacilitySettingValue('billing', 'carddetailsmandatory');
        if (modalConfig && modalConfig.params) {
            if (modalConfig.params.items &&
                modalConfig.params.items.PaymentTypeId) {
                $scope.items.push(modalConfig.params.items);
                $scope.item.PaymentTypeId = modalConfig.params.items.PaymentTypeId;
                $scope.currentcontext.PaymentTypeId = modalConfig.params.items.PaymentTypeId;
                if (modalConfig.params.items.Id) {
                    $scope.item.PatientReceiptId = modalConfig.params.items.Id;
                    $scope.item.Id = modalConfig.params.items.Id;
                }
                if (modalConfig.params.items.ReceiptNumber) {
                    $scope.item.ReceiptNumber = modalConfig.params.items.ReceiptNumber;
                }
                if (modalConfig.params.items.PatientBillId) {
                    $scope.item.PatientBillId = modalConfig.params.items.PatientBillId;
                }
                if (modalConfig.params.items.BankId) {
                    $scope.item.BankId = modalConfig.params.items.BankId;
                }
                if (modalConfig.params.items.ChequeNo) {
                    $scope.item.ChequeNo = modalConfig.params.items.ChequeNo;
                }
                if (modalConfig.params.items.DDNumber) {
                    $scope.item.DDNumber = modalConfig.params.items.DDNumber;
                }
                if (modalConfig.params.items.UPIRefNumber) {
                    $scope.item.UPIRefNumber = modalConfig.params.items.UPIRefNumber;
                }
                if (modalConfig.params.items.CollectedOn) {
                    $scope.item.CollectedOn = modalConfig.params.items.CollectedOn;
                }
                if (modalConfig.params.items.ChequeDate) {
                    $scope.item.ChequeDate = modalConfig.params.items.ChequeDate;
                }
                if (modalConfig.params.items.DDDate) {
                    $scope.item.DDDate = modalConfig.params.items.DDDate;
                }
                if (modalConfig.params.items.WireTransferId) {
                    $scope.item.WireTransferId = modalConfig.params.items.WireTransferId;
                }
                if (modalConfig.params.items.WireTransferDate) {
                    $scope.item.WireTransferDate = modalConfig.params.items.WireTransferDate;
                }
                if (modalConfig.params.items.CardTypeId) {
                    $scope.item.CardTypeId = modalConfig.params.items.CardTypeId;
                }
                if (modalConfig.params.items.TerminalNoId) {
                    $scope.item.TerminalNoId = modalConfig.params.items.TerminalNoId;
                    if ($scope.item.TerminalNoId) {
                        try {
                            $scope.item.TerminalNoId = parseInt($scope.item.TerminalNoId);
                        } catch (e) { console.log(e) }
                    }
                }
                if (modalConfig.params.items.CardNumber) {
                    $scope.item.CardNumber = modalConfig.params.items.CardNumber;
                }
                if (modalConfig.params.items.AuthorizedCode) {
                    $scope.item.AuthorizedCode = modalConfig.params.items.AuthorizedCode;
                }
                if (modalConfig.params.items.PayModeHistory) {
                    $scope.item.PayModeHistory = modalConfig.params.items.PayModeHistory;
                } else {
                    $scope.item.PayModeHistory = '';
                }


            }
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.paymodevarchange = function (item) {
            $scope.item.BankId = null;
            $scope.item.ChequeNo = null;
            $scope.item.DDNumber = null;
            $scope.item.UPIRefNumber = null;
            $scope.item.CollectedOn = null;
            $scope.item.ChequeDate = null;
            $scope.item.DDDate = null;
            $scope.item.WireTransferId = null;
            $scope.item.WireTransferDate = null;
            $scope.item.CardTypeId = null;
            $scope.item.TerminalNoId = null;
            $scope.item.CardNumber = null;
            $scope.item.AuthorizedCode = null;
            ////if (item.PaymentTypeId == 1) {
            //// }  if (item.PaymentTypeId == 5 || item.PaymentTypeId == 6) {
            //// } if (item.PaymentTypeId != 1 &&
            ////      item.PaymentTypeId != 5 && item.PaymentTypeId != 6) {
            //// }
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            $scope.confirmCallback();
        }

        $scope.saveitem = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            if ($scope.carddetailsmandatory == 1) {
                if ($scope.item.PaymentTypeId == 5 || $scope.item.PaymentTypeId == 6 ) {
                    if (!$scope.item.BankId) {
                        utl.Alert.showErrorMsg($translate.instant('Please Select Bank!...'));
                        return;
                    }
                    if (!$scope.item.CardTypeId) {
                        utl.Alert.showErrorMsg($translate.instant('Please Select CardType!...'));
                        return;
                    }
                    // if (!$scope.item.TerminalNoId) {
                    //     utl.Alert.showErrorMsg($translate.instant('Please Select TerminalNo!...'));
                    //     return;
                    // }
                }
                
                if ($scope.item.PaymentTypeId == 5 || $scope.item.PaymentTypeId == 6) {
                    if (!$scope.item.AuthorizedCode) {
                        utl.Alert.showErrorMsg($translate.instant('Please Enter AuthCode!...'));
                        return;
                    }
                }
                if ($scope.item.PaymentTypeId == 11) {
                    if (!$scope.item.UPIRefNumber || $scope.item.UPIRefNumber == '') {
                        utl.Alert.showErrorMsg($translate.instant('Please Enter UPIRef#!...'));
                        return;
                    }
                }
            }
            $scope.item.PayModeHistory += "\r\n Modified Dt :" + new Date();

            $scope.item.PayModeHistory += "\r\n Modified Pay Mode :" +
                utl.Lookup.getDesc($scope.lookup.PaymentType, $scope.item.PaymentTypeId);

            $scope.item.PayModeHistory += "\r\n Modified Updated User :" +
                utl.Lookup.getDesc($scope.lookup.User, utl.Session.getCurrentUserId());

            var actionName = 'billing/PatientPaymentDetails/ManagePaymodeChange';
            var inputData = {
                Id: $scope.item.Id,
                PatientReceiptId: $scope.item.PatientReceiptId,
                ReceiptStatusId: $scope.item.ReceiptStatusId,
                ReceiptNumber: $scope.item.ReceiptNumber,
                PatientBillId: $scope.item.PatientBillId,
                PaymentTypeId: $scope.item.PaymentTypeId,
                BankId: $scope.item.BankId,
                ChequeNo: $scope.item.ChequeNo,
                DDNumber: $scope.item.DDNumber,
                UPIRefNumber: $scope.item.UPIRefNumber,
                CollectedOn: $scope.item.CollectedOn,
                ChequeDate: $scope.item.ChequeDate,
                DDDate: $scope.item.DDDate,
                WireTransferId: $scope.item.WireTransferId,
                WireTransferDate: $scope.item.WireTransferDate,
                CardTypeId: $scope.item.CardTypeId,
                TerminalNoId: $scope.item.TerminalNoId,
                CardNumber: $scope.item.CardNumber,
                AuthorizedCode: $scope.item.AuthorizedCode,
                PayModeHistory: $scope.item.PayModeHistory,
            };
            var options = {
                action: actionName,
                data: { Data: inputData },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        }



        //React bridge: the three <ui-select> controls (Payment Type, Bank,
        //Card Type) render through the shared BridgeLookupSelectScreen. Each
        //dispatch writes the same $scope.item field the original ng-model
        //wrote and then calls the screen's own unchanged handler, so
        //paymodevarchange(item) -- which clears Bank/Cheque/DD/UPI/Card/
        //Terminal fields when the payment mode changes -- still runs exactly
        //as before. Every other control on this form stays native.
        $scope.handlePaymentTypeAction = function (actionType, payload) {
            if (actionType == 'change') {
                $scope.item.PaymentTypeId = payload.id;
                $scope.paymodevarchange($scope.item);
                $scope.refreshReactProps();
            }
        };
        $scope.handleBankAction = function (actionType, payload) {
            if (actionType == 'change') {
                $scope.item.BankId = payload.id;
                $scope.refreshReactProps();
            }
        };
        $scope.handleCardTypeAction = function (actionType, payload) {
            if (actionType == 'change') {
                $scope.item.CardTypeId = payload.id;
                $scope.refreshReactProps();
            }
        };

        $scope.refreshReactProps = function () {
            var lk = $scope.lookup || {};
            $scope.reactPropsPaymentTypeContainer = {
                reactProps: { options: lk.PaymentType || [], value: $scope.item.PaymentTypeId, name: 'payments' },
                onAction: $scope.handlePaymentTypeAction
            };
            $scope.reactPropsBankContainer = {
                reactProps: { options: lk.Bank || [], value: $scope.item.BankId, name: 'bankname' },
                onAction: $scope.handleBankAction
            };
            $scope.reactPropsCardTypeContainer = {
                reactProps: { options: lk.CardType || [], value: $scope.item.CardTypeId, name: 'cardtype' },
                onAction: $scope.handleCardTypeAction
            };
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;

            $scope.item.PayModeHistory += "\r\n Current Pay Mode :" +
                utl.Lookup.getDesc($scope.lookup.PaymentType, $scope.currentcontext.PaymentTypeId);
            $scope.item.PayModeHistory += "\r\n Current Updated User :" +
                utl.Lookup.getDesc($scope.lookup.User, utl.Session.getCurrentUserId());
            $scope.refreshReactProps();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "PaymentType" },
                { 'Key': 'Bank' },
                { 'Key': 'AdvanceNo' },
                { 'Key': 'CardType' },
                { 'Key': 'CurrencyType' },
                { "Key": "Terminal" },
                // { "Key": "User" },
            ]
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

    paychangerController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();