(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('refundFormController', refundFormController);

    function refundFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
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
            RefundTypeId: 1
        };
        $scope.PatientRefundDetails = [];
        $scope.PatientRefunds = [];
        $scope.currentcontext = {};
        $scope.CanShowClearBtn = true;
        $scope.IsBillFinalized = false;

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
            $scope.item.RefundAmount = modalConfig.params.refundamount;
            $scope.Context = modalConfig.params.context;
            if ($scope.item.RefundAmount > 0)
                $scope.item.RefundTypeId = 4;

            if (modalConfig.params.billid && modalConfig.params.billid > 0) {
                $scope.item.PatientBillId = modalConfig.params.billid;
            }
        }
        if (modalConfig && modalConfig.params.receipt) {
            if (modalConfig.params.receipt.AmountAdjusted > 0) {
                $scope.item.RefundAmount = parseFloat(modalConfig.params.receipt.AmountPaid) -
                    parseFloat(modalConfig.params.receipt.AmountAdjusted);
            } else {
                $scope.item.RefundAmount = modalConfig.params.receipt.AmountPaid;
            }
            $scope.item.PatientReceiptId = modalConfig.params.receipt.Id;
            $scope.item.ReceiptNo = modalConfig.params.receipt.ReceiptNumber;
            $scope.item.RefundTypeId = 2;
            if(modalConfig.params.receipt.ReceiptTypeId == 5)
            {
                $scope.item.RefundTypeId = 6;//OP Advance Refund
            }
        }
        $scope.currentcontext.eid = parseInt(modalConfig.params.eid);
        $scope.currentcontext.rid = parseInt(modalConfig.params.rid);

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
            if ($scope.item.RefundStatusId == 1 || 3) {
                $scope.IsCompleted = true;
                $scope.canShowPrintledBtn = true;
                $scope.canHidePrintledBtn = true;
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
                Id: $scope.currentcontext.id
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
            if ($scope.Encounter) {
                $scope.item.EncounterTypeId = $scope.Encounter.EncounterTypeId;
            }
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

            $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
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
            if (typeof (data) == "number") {
                $scope.currentcontext.id = data;
                $scope.print();
            }
            $scope.backToList();


        };

        $scope.getListCallback = function (scope, data, options, hasError) {
            if ($scope.Context == 'receipt') {
                $scope.item = data.Data[0];
                $scope.currentcontext.id = $scope.item.Id;
            }
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
                    // {
                    //     Key: 11,
                    //     Value: 2
                    // } //IP
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

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
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

        $scope.initLookup();
    }

    refundFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];
})();