(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('opdFormController', opdFormController);

    function opdFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            PaymentTypeId: 1,
            BillDateTime: utl.Formatter.getCurrentDate(),
            BillPriorityId: 1,
            FacilityId: utl.Session.getCurrentFacilityId()
        };
        $scope.PatientBillDetails = [];
        $scope.PatientPaymentDetails = [];
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.eid = parseInt(modalConfig.params.id);
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
            $scope.currentcontext.bid = parseInt(modalConfig.params.bid);

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        } else {
            $scope.currentcontext.pid = parseInt($stateParams.pid);
        }

        $scope.item.PatientId = $scope.currentcontext.pid;
        $scope.getPatientInfo = function(scope, data, options, hasError) {
            $scope.selectedPatient = data;
        }

        $scope.patientChange = function() {
            var options = {
                action: 'registration/patient/GetPatientById',
                data: { Id: $scope.item.PatientId },
                type: 'post',
                onComplete: $scope.getPatientInfo
            };

            utl.Http.doAction(options);
        }
        $scope.getEncounterCallback = function(scope, res, options, hasError) {
            $scope.Encounter = res.Data[0];
        };

        $scope.getEncounters = function() {
            var inputData = {
                Params: [
                    { Key: 0, Value: $scope.currentcontext.eid }
                ]
            };

            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getEncounterCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getServiceItemCallback = function(scope, data, options, hasError) {
            var item = {}
            item.ServiceId = data.Id;
            item.Rate = data.ItemCost;
            item.Status = data.Status;
            item.DepartmentId = data.DepartmentId;
            item.OrderDateTime = utl.Formatter.getCurrentDate();
            item.RequestDate = utl.Formatter.getCurrentDate();
            item.BillDateTime = utl.Formatter.getCurrentDate();
            $scope.PatientBillDetails.push(item);
            for (var idx in $scope.DefaultServices) {
                $scope.PatientBillDetails[idx].Quantity = $scope.DefaultServices[idx].Quantity
            }
            $scope.calcAmt();
        }

        $scope.getServiceItem = function() {
            for (var idx in $scope.DefaultServices) {
                if ($scope.DefaultServices[idx].ServiceItemId > 0) {
                    var options = {
                        action: 'ClinicalMaster/ServiceItem/GetServiceItemById',
                        data: { Id: $scope.DefaultServices[idx].ServiceItemId },
                        type: 'post',
                        onComplete: $scope.getServiceItemCallback
                    };

                    utl.Http.doAction(options);
                }
            }
        }
        $scope.AddPaymentDetails = function(
            ReceiptDateTime,
            FacilityId,
            PatientId,
            ReceiptTypeId,
            EncounterId,
            EncounterTypeId,
            AmountPaid,
            DepartmentID,
            PaymentcounterID,
            GuarantorId,
            PaymentTypeId,
            DoctorId,
            ServiceRateCategoryId,
            PatientBillId,
            CardNumber,
            CardDateTime,
            CardExpiryDate,
            BankId,
            CardTypeId,
            TerminalNoId,
            CardHolderName,
            AuthorizeNumber,
            ChequeNo,
            ChequeDate,
            DDNumber,
            DDDate,
            WireTransferId,
            WireTransferDate,
            Comments,
            CancelReason,
            ReceiptStatusId,
            TDSAmount,
            Disallowance,
            RoundOffValue,
            CreditNoteId,
            PaymentStatusId,
            CurrencyTypeId,
            CollectedOn) {
            var PatientPaymentDetail = {
                    Id: 0,
                    ReceiptDateTime: ReceiptDateTime,
                    FacilityId: FacilityId,
                    PatientId: PatientId,
                    ReceiptTypeId: ReceiptTypeId,
                    EncounterId: EncounterId,
                    EncounterTypeId: EncounterTypeId,
                    AmountPaid: AmountPaid,
                    DepartmentID: DepartmentID,
                    PaymentcounterID: PaymentcounterID,
                    GuarantorId: GuarantorId,
                    PaymentTypeId: PaymentTypeId,
                    DoctorId: DoctorId,
                    ServiceRateCategoryId: ServiceRateCategoryId,
                    PatientBillId: PatientBillId,
                    CardNumber: CardNumber,
                    CardDateTime: CardDateTime,
                    CardExpiryDate: CardExpiryDate,
                    BankId: BankId,
                    CardTypeId: CardTypeId,
                    TerminalNoId: TerminalNoId,
                    CardHolderName: CardHolderName,
                    AuthorizeNumber: AuthorizeNumber,
                    ChequeNo: ChequeNo,
                    ChequeDate: ChequeDate,
                    DDNumber: DDNumber,
                    DDDate: DDDate,
                    WireTransferId: WireTransferId,
                    WireTransferDate: WireTransferDate,
                    Comments: Comments,
                    CancelReason: CancelReason,
                    ReceiptStatusId: ReceiptStatusId,
                    TDSAmount: TDSAmount,
                    Disallowance: Disallowance,
                    RoundOffValue: RoundOffValue,
                    CreditNoteId: CreditNoteId,
                    PaymentStatusId,
                    CurrencyTypeId,
                    CollectedOn: CollectedOn
                }
                // if ($scope.currentcontext.id > 0) {
                //     PatientPaymentDetail.PatientBillId = $scope.currentcontext.id;
                // }
            $scope.PatientPaymentDetails.push(PatientPaymentDetail);
        }
        $scope.RestictAmount = function(idx) {
            $scope.calcAmt();
            if ($scope.PatientBillDetails[idx].DiscountAmount > $scope.PatientBillDetails[idx].GrossAmount) {
                utl.Alert.showErrorMsg($translate.instant('Amount exceeds Gross'));
            }
        }
        $scope.calcAmt = function() {
            $scope.item.TotalNet = 0;
            var TotalDiscount = 0;
            $scope.item.BillAmount = 0;
            for (var idx in $scope.PatientBillDetails) {
                if ($scope.PatientBillDetails[idx].DiscountAmount == null) {
                    $scope.PatientBillDetails[idx].DiscountAmount = 0
                };
                TotalDiscount += parseFloat($scope.PatientBillDetails[idx].DiscountAmount);
                $scope.PatientBillDetails[idx].NetAmount = $scope.PatientBillDetails[idx].Rate *
                    $scope.PatientBillDetails[idx].Quantity -
                    $scope.PatientBillDetails[idx].DiscountAmount;

                $scope.item.TotalNet = $scope.item.TotalNet + $scope.PatientBillDetails[idx].NetAmount;
                $scope.item.OutStandingAmount = $scope.item.TotalNet - $scope.item.PaidAmount;
                $scope.PatientBillDetails[idx].GrossAmount = $scope.PatientBillDetails[idx].Rate *
                    $scope.PatientBillDetails[idx].Quantity;
                $scope.item.BillAmount += $scope.PatientBillDetails[idx].GrossAmount;
            }
            $scope.item.BillDiscount = TotalDiscount
        }
        $scope.HeaderCalc = function() {
            $scope.item.BillDiscount = 0;
            $scope.item.TotalNet = 0;
            for (var idx in $scope.PatientBillDetails) {
                $scope.PatientBillDetails[idx].DiscountAmount = 0
                $scope.PatientBillDetails[idx].NetAmount = $scope.PatientBillDetails[idx].Rate *
                    $scope.PatientBillDetails[idx].Quantity -
                    $scope.PatientBillDetails[idx].DiscountAmount;
                $scope.item.TotalNet = $scope.item.TotalNet + $scope.PatientBillDetails[idx].NetAmount;
            }
            $scope.item.BillDiscount = $scope.HeaderDiscount;
            $scope.item.TotalNet = $scope.item.TotalNet - $scope.item.BillDiscount;
            if ($scope.item.BillDiscount > $scope.item.BillAmount) {
                utl.Alert.showErrorMsg($translate.instant('Amount exceeds Gross'));
            }
        }
        $scope.getDefaultServicesCallback = function(scope, res, options, hasError) {
            $scope.DefaultServices = [];
            $scope.DefaultServices = res.Data;
            $scope.getServiceItem();
        };

        $scope.getDefaultServices = function() {

            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.item.FacilityId }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'SystemSettings/facilitydefaultservice/GetFacilityDefaultServices',
                data: inputData,
                type: 'post',
                onComplete: $scope.getDefaultServicesCallback
            };

            utl.Http.doAction(options);
        };

        $scope.backToList = function() {
            if ($scope.currentcontext.ismodal) {
                $scope.confirmCallback();
            } else {
                // $state.go('patientemr.patientallergies', {pid : $scope.currentcontext.pid});
            }
        }

        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getItem();
        };
        $scope.saveDraft = function() {
            $scope.item.BillTypeId = 1;
            $scope.item.PatientBillStatusId = 1;
            $scope.saveItem();
        }
        $scope.saveAndApprove = function() {
            $scope.item.BillTypeId = 1;
            $scope.item.PatientBillStatusId = 3;
            $scope.item.DepartmentId = $scope.Encounter.DepartmentId;
            $scope.saveItem();
        }
        $scope.saveItem = function() {

            // if(!$scope.item_form.isValid()) {
            //    utl.Alert.showErrorMsg($translate.instant('common.validationmsg.lbl'));
            //    return;
            // }
            if (!$scope.PatientPaymentDetails || $scope.PatientPaymentDetails.length == 0) {
                if ($scope.item.PaidAmount > 0) {
                    $scope.item.PaymentTypeId = $scope.item.PaymentTypeId;
                    $scope.item.ReceiptTypeId = 2;
                    $scope.item.ReceiptStatusId = 1;
                    $scope.AddPaymentDetails(
                        $scope.item.BillDateTime,
                        $scope.item.FacilityId,
                        $scope.item.PatientId,
                        $scope.item.ReceiptTypeId,
                        $scope.Encounter.Id,
                        $scope.Encounter.EncounterTypeId,
                        $scope.item.PaidAmount,
                        $scope.Encounter.DepartmentId,
                        0,
                        $scope.Encounter.GuarantorId,
                        $scope.item.PaymentTypeId,
                        $scope.Encounter.DoctorId,
                        1,
                        null,
                        $scope.item.CardNumber,
                        $scope.item.CardDateTime,
                        $scope.item.CardExpiryDate,
                        $scope.item.BankId,
                        $scope.item.CardTypeId,
                        null,
                        null,
                        null,
                        $scope.item.ChequeNo,
                        $scope.item.ChequeDate,
                        null,
                        null,
                        null,
                        $scope.item.Comments,
                        null,
                        $scope.item.ReceiptStatusId,
                        null,
                        null,
                        null,
                        null,
                        3,
                        $scope.item.CurrencyTypeId,
                        $scope.item.CollectedOn); // PaymentStatusId == 3 // payment consumed
                }
            }
            var lines = getLinesForSave();
            var paymentlines = getpaymentsLinesForSave();
            if ($scope.currentcontext.bid) {
                $scope.item.Id = $scope.currentcontext.bid;
            } else {
                $scope.item.Id = 0;
            }
            var actionName = 'billing/patientbills/AddPatientBills';
            if ($scope.currentcontext.bid && $scope.currentcontext.bid > 0) {
                actionName = 'billing/patientbills/UpdatePatientBills';
            }

            var inputData = { Header: $scope.item, Details: lines, paymentDetail: paymentlines };
            var options = {
                action: actionName,
                data: { Data: inputData },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        function getpaymentsLinesForSave() {
            var result = [];
            for (var idx in $scope.PatientPaymentDetails) {
                var item = $scope.PatientPaymentDetails[idx];
                if (item.AmountPaid > 0) {
                    result.push(item);
                }
            }
            return result;
        }

        function getLinesForSave() {
            var result = [];
            for (var idx in $scope.PatientBillDetails) {
                var item = $scope.PatientBillDetails[idx];

                if (item.Quantity > 0 && item.NetAmount > 0) {
                    item.GrossAmount = item.Amount;
                    item.DiscountAmount = item.DiscountAmount;
                    item.DepartmentId = item.DepartmentId;
                    item.DoctorDiscountAmount = 0;
                    item.GSTId = item.GSTId;
                    item.TaxId = item.GSTId;
                    item.TaxCode = item.TaxCode;
                    item.TaxCost = item.GSTAmount;
                    item.IsPackageItem = 0;
                    item.PackageId = 0;
                    item.PackageName = '';
                    item.OrderId = 0;
                    item.OrderDetailId = 0;
                    item.IsModified = 0;
                    item.IsSupplimentary = 0;
                    item.IsBillable = 0;
                    item.IsDoctorDiscount = 0;
                    item.IsGstDoctor = 0;
                    item.StartDateTime = null;
                    item.EndDateTime = null;
                    item.DiscountTypeId = item.DiscountTypeId;
                    item.DiscountAuthorizedBy = 0;
                    item.DoctorShare = item.DoctorShare;
                    item.ReferalShare = 0;
                    item.CancelReason = 0;
                    item.CancelledBy = 0;
                    item.Comments = '';

                    result.push(item);
                }
            }
            return result;
        }

        $scope.onDeleteConfirmed = function(item) {
            item.Status = 2;
        }

        $scope.deleteDetail = function(idx, item) {

                var lastindex = $scope.PatientBillDetails.length - 1;
                if (item.ServiceId != -1 || null) {
                    var name = item.ServiceId || '';
                    utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
                }
            }
            //lookup
        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            for (var i = 0, len = $scope.lookup.ServiceItem.length; i < len; i++) {
                if ($scope.lookup.ServiceItem[i].Id > 0) {
                    $scope.lookup.ServiceItem[i].Id = $scope.lookup.ServiceItem[i].Id;
                    $scope.lookup.ServiceItem[i].Text = $scope.lookup.ServiceItem[i].ItemCode + "-" + $scope.lookup.ServiceItem[i].Name;
                } else {
                    $scope.lookup.ServiceItem[i].Id = $scope.lookup.ServiceItem[i].Id;
                    $scope.lookup.ServiceItem[i].Text = $scope.lookup.ServiceItem[i].Text ? $scope.lookup.ServiceItem[i].Text : $scope.lookup.ServiceItem[i].Name;
                }
            }
            // $scope.getItem();
            $scope.patientChange();
            $scope.getEncounters();
            $scope.getDefaultServices();
        }


        $scope.initLookup = function() {
            var inputData = [
                { "Key": "Doctor" },
                {
                    "Key": "Guarantor",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "ServiceRateCategory" },
                { "Key": "Department" },
                { "Key": "ServiceItem" },
                { "Key": "PaymentType" },
                { "Key": "CardType" },
                { "Key": "Bank" },
                { "Key": "CurrencyType" },
                { "Key": "DiscountMode" },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
            ];

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

    opdFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();