(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('modifyReceiptFormController', modifyReceiptFormController);

    function modifyReceiptFormController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {

        var vm = this;
        var savehitcompleted = 0;
        $scope.billinfo = [];
        $scope.facilityId = 0;
        $scope.PatientId = 0;

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        $scope.currentcontext.id = -1;
        if (modalConfig && modalConfig.params) {
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        if (modalConfig.params && modalConfig.params.billinfo)
            $scope.billinfo = modalConfig.params.billinfo;

        if (modalConfig.params && modalConfig.params.facilityId)
            $scope.facilityId = modalConfig.params.facilityId;

        if (modalConfig.params && modalConfig.params.billdate)
            $scope.billdate = modalConfig.params.billdate;

        if (modalConfig.params && modalConfig.params.id)
            $scope.currentcontext.id = modalConfig.params.id;
        if (modalConfig.params && modalConfig.params.EncounterId) {
            $scope.currentcontext.EncounterId = modalConfig.params.EncounterId;
            $scope.currentcontext.eid = modalConfig.params.EncounterId;
        }

        if (modalConfig.params && modalConfig.params.pid) {
            $scope.currentcontext.pid = modalConfig.params.pid;
        }
        if (modalConfig.params && modalConfig.params.GuarantorId) {
            $scope.currentcontext.GuarantorId = modalConfig.params.GuarantorId;
        }
        if (modalConfig.params && modalConfig.params.GuarantorTypeId) {
            $scope.currentcontext.GuarantorTypeId = modalConfig.params.GuarantorTypeId;
        }
        if (modalConfig.params && modalConfig.params.DoctorId) {
            $scope.currentcontext.DoctorId = modalConfig.params.DoctorId;
        }
        if (modalConfig.params && modalConfig.params.PatientBillId) {
            $scope.currentcontext.PatientBillId = modalConfig.params.PatientBillId;
        }
        if (modalConfig.params && modalConfig.params.TotNetAmount) {
            $scope.currentcontext.TotBillAmt = parseFloat(modalConfig.params.TotNetAmount);
        }
        if (modalConfig.params && modalConfig.params.TotDiscAmount) {
            $scope.currentcontext.TotBillDiscAmt = parseFloat(modalConfig.params.TotDiscAmount);
        }

        if (modalConfig.params && modalConfig.params.BillDateTime) {
            $scope.currentcontext.BillDateTime = modalConfig.params.BillDateTime;
        }
        if (modalConfig.params && modalConfig.params.DOD) {
            $scope.currentcontext.DOD = modalConfig.params.DOD;
        }
        if (modalConfig.params && modalConfig.params.DOA) {
            $scope.currentcontext.DOA = modalConfig.params.DOA;
        }


        $scope.currentcontext.TotPaidAmt = 0;

        $scope.IsCancelled = false;
        if (modalConfig.params && modalConfig.params.reason) {
            $scope.IsCancelled = true;
            $scope.currentcontext.CancelReason = modalConfig.params.reason;
        }
        $scope.currentcontext.type = modalConfig.params.type;
        $scope.closeReceipt = $scope.cancelCallback();

        $scope.item = {
            receiptdate: utl.Formatter.getCurrentDate(),
        };


        $scope.getListCallback = function (scope, data, options, hasError) {
            $scope.List = data.Data;
            for (var idx in $scope.List) {
                var item = $scope.List[idx];
                $scope.PatientId = item.Patient.Id;
                if ($scope.PatientId > 0)
                    break;
            }
            $scope.calculatePaidAmt();
        };

        $scope.getList = function (BillId) {
            var inputData = {
                Params: [
                    { Key: 9, Value: BillId },
                    { Key: 10, Value: $scope.currentcontext.EncounterId }
                ],
                PageContext: {
                    PageSize: 1000000,
                    PageNumber: 1
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

        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: patientId },
                confirmCallback: $scope.getList
            });
        }


        $scope.update = function () {
            $scope.calculatePaidAmt();
            if ($scope.checkMandatory()) {
                var list = $scope.List;
                $scope.List = [];
                for (var idx in list) {
                    var item = list[idx];
                    item.TotBillAmt = $scope.currentcontext.TotBillAmt;
                    item.TotBillDiscAmt = $scope.currentcontext.TotBillDiscAmt;
                    item.BillDateTime = $scope.currentcontext.BillDateTime;
                    item.DOA = $scope.currentcontext.DOA;
                    item.DOD = $scope.currentcontext.DOD;
                    item.GuarantorId = $scope.currentcontext.GuarantorId;
                    item.GuarantorTypeId = $scope.currentcontext.GuarantorTypeId;
                    if (item.Id >= 0 && item.Status == 1) {
                        $scope.List.push(item);
                    }
                }
                var actionName = 'billing/PatientPaymentDetails/ModifyPatientPaymentDetails';
                savehitcompleted = 1;
                var options = {
                    action: actionName,
                    data: { Data: $scope.List },
                    type: 'post',
                    onComplete: $scope.updateCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.updateCallback = function (scope, data, options, hasError) {
            $scope.confirmCallback({
                method: 'refresh'
            });
        };

        $scope.checkMandatory = function () {
            var isvalid = true;
            var totalAmountPaid = 0;
            for (var idx in $scope.List) {
                var item = $scope.List[idx];
                if (item.ReceiptTypeId < 0 && item.Status == 1) {
                    utl.Alert.showErrorMsg('Receipt type is required');
                    isvalid = false;
                    break;
                }
                if (item.PaymentTypeId < 0 && item.Status == 1) {
                    utl.Alert.showErrorMsg('Payment Type is required');
                    isvalid = false;
                    break;
                }
                if (!item.ReceiptDateTime && item.Status == 1) {
                    utl.Alert.showErrorMsg('Receipt DateTime is required');
                    isvalid = false;
                    break;
                }
                if (item.Id == 0 && item.AmountPaid <= 0 && item.Status == 1) {
                    utl.Alert.showErrorMsg('Amount should not zero');
                    isvalid = false;
                    break;
                }
                try {
                    totalAmountPaid += parseFloat(item.AmountPaid);
                } catch (ex) { totalAmountPaid += 0; }
            }

            try {
                $scope.currentcontext.TotBillAmt = parseFloat($scope.currentcontext.TotBillAmt);
            } catch (ex) { $scope.currentcontext.TotBillAmt = 0; }

            if(!$scope.currentcontext.TotBillDiscAmt) $scope.currentcontext.TotBillDiscAmt =0;

            try {
                $scope.currentcontext.TotBillDiscAmt = parseFloat($scope.currentcontext.TotBillDiscAmt);
            } catch (ex) { $scope.currentcontext.TotBillDiscAmt = 0; }

            if (totalAmountPaid > ($scope.currentcontext.TotBillAmt + $scope.currentcontext.TotBillDiscAmt)) {
                utl.Alert.showErrorMsg('Amount Paid should not greater bill amount');
                isvalid = false;
            }

            return isvalid;
        }

        $scope.calculatePaidAmt = function () {
            $scope.currentcontext.TotPaidAmt = 0;
            for (var idx in $scope.List) {
                var item = $scope.List[idx];
                if (item.ReceiptTypeId > 0 && item.PaymentTypeId > 0
                    && item.ReceiptStatusId == 1 && item.Status == 1) {
                    try {
                        $scope.currentcontext.TotPaidAmt += parseFloat(item.AmountPaid);
                    } catch (ex) { $scope.currentcontext.TotPaidAmt += 0; }

                }
            }
        }

        $scope.addNewPayment = function () {
            let newpayment = {
                Id: 0,
                PatientReceiptId: 0,
                ReceiptDateTime: new Date(),
                ReceiptNumber: null,
                FacilityId: utl.Session.getCurrentFacilityId,
                OrganizationId: utl.Session.getCurrentOrgId,
                PatientId: $scope.currentcontext.pid,
                ReceiptTypeId: -1,
                EncounterId: $scope.currentcontext.eid,
                EncounterTypeId: 2,
                PatientName: null,
                OutStandingAmount: 0,
                AmountPaid: 0,
                AmountAdjusted: 0,
                DueAmount: 0,
                DepartmentID: -1,
                PaymentcounterID: -1,
                GuarantorId: $scope.currentcontext.GuarantorId,
                GuarantorTypeId: $scope.currentcontext.GuarantorTypeId,
                PaymentTypeId: -1,
                DoctorId: $scope.currentcontext.DoctorId,
                PatientBillId: $scope.currentcontext.PatientBillId,
                BillTypeId: 2,
                IsPharmacyReceipt: 0,
                IsConsolidatePay: 0,
                IsClaimed: 0,
                PharmacyReceiptTypeId: 0,
                BankId: -1,
                CardTypeId: -1,
                TerminalNoId: -1,
                CardHolderName: null,
                AuthorizeNumber: null,
                AuthorizedCode: null,
                GurantorName: null,
                Status: 1,
            };
            $scope.List.push(newpayment);
            $scope.calculatePaidAmt();
        };

        $scope.deletePayment = function (index, payment) {
            payment.Status = 2;
            $scope.calculatePaidAmt();
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList($scope.currentcontext.id);
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "PaymentType" },
                { "Key": "Facility" },
                { "Key": "ReceiptType" },
                { "Key": "ReceiptStatus" },
                { "Key": "CardType" },
                { "Key": "Bank" }
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

    modifyReceiptFormController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();