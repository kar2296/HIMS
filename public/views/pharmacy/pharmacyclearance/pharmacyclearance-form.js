(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('pharmacyclearanceFormController', pharmacyclearanceFormController);

    function pharmacyclearanceFormController($rootScope, $timeout,
        $scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        angular.extend(this, utl.Ctrl.getDMPrintDataController({
            $scope: $scope
        }));

        $scope.dmprintpreferences = 0;
        $scope.printpreferences = 1;
        $scope.currentcontext = {
            // PaymentTypeId: 1,
        };
        $scope.maxadvancecash = 0;
        $scope.maxadvancecash =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'maxadvancecash');
        $scope.canShowDMPrintBtn = false;
        $scope.ShowPrintBtn = false;
        $scope.ShowHeaderDisc = true;

        $scope.currentfilter = {
            ToBillDate: utl.Formatter.getCurrentDate(),
            DueApprovedById: -1,
            PharmacySaleTypeId: -1,
            TotalAmount: 0,
            TotalSalesAmount: 0,
            TotalReturnAmount: 0,
            IsOutStanding: false,
            NotOutStanding: false,
            TotalAvailableAmount: 0,
            PatientId: 0
        };
        $scope.Details = [];
        $scope.PatientBillsWithReturn = [];
        $scope.PatientPharmacyBills = [];
        $scope.PatientPharmacyReturns = [];
        $scope.PatientRefundData = [];
        $scope.SalesSerialNo = 0;
        $scope.ReturnSerialNo = 0;
        var PatientBillIds = Array();
        var PatientReturnIds = Array();
        //$scope.currentcontext.selectallchk = true;
        //$scope.currentcontext.selectallchk1 = true;
        console.log($stateParams);
        $scope.selectedPatient = {};
        $scope.Encounter = [];
        // $scope.currentcontext.EncounterId = parseInt($stateParams.id);
        // $scope.currentcontext.PatientId = parseInt($stateParams.patientid);
        // $scope.currentfilter.PatientId = parseInt($stateParams.patientid);
        $scope.currentcontext.TotalReceiptAmount = 0;
        $scope.currentcontext.TotBalanceAmt = 0;
        $scope.currentcontext.FSTypeId = 1;

        $scope.item = {
            TerminalNoId: -1,
            BankId: -1,
            CardTypeId: -1,
            ChequeNo: '',
            ChequeDate: null,
            DDNumber: null,
            DDDate: null,
            WireTransferId: null,
            WireTransferDate: null,
            ReceiptGeneratedById: utl.Session.getCurrentUserId(),
            ReceiptApprovedById: utl.Session.getCurrentUserId(),
            PaymentTypeId: 1,
            AuthorizedCode: null,
            Comments: '',
            Received: 0.00,
            OutStandingAmt: 0.00,
            Discount: 0.00,
            GrossAmount: 0.00,
            BillAmount: 0.00,
            PaidAmount: 0.00,
            InsuranceAmount: 0.00,
            TotalDueAmount: 0.00
        };

        $scope.item1 = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            OrganizationId: utl.Session.getCurrentOrgId(),
            Id: 0,
            BillTypeId: 4,
            BillPriorityId: 1,
            BillAmount: 0,
            BillDiscount: 0,
            DiscountPercentage: 0,
            // DiscountApprovedBy: ,
            DiscountApprovalStatusId: 1,
            BillDiscountTypeId: -1,
            BillDiscountModeId: $scope.currentfilter.DiscountModeId,
            // DiscountModeValue: $scope.currentcontext.DiscountModeValue,
            // RoundOffValue: { type: DataTypes.DECIMAL, field: 'RoundOffValue' },
            // BilledCounter: { type: DataTypes.INTEGER, field: 'BilledCounter' },
            PaidAmount: $scope.currentfilter.TotalPaidAmount,
            IsPaidFully: 1,
            // ReturnedAmount: { type: DataTypes.DECIMAL, field: 'ReturnedAmount' },
            OutStandingAmount: 0,
            // ServiceTax: ,
            // EducationCess: ,
            // GSTAmount: ,
            // InGstAmount: ,
            // CGstAmount: ,
            // SGstAmount: ,
            // BillGeneratedBy: { type: DataTypes.BIGINT, field: 'BillGeneratedBy' },
            // BillApprovedBy: { type: DataTypes.BIGINT, field: 'BillApprovedBy' },
            // IsIntermediateBill: { type: DataTypes.BOOLEAN, field: 'IsIntermediateBill' },
            // ParentBillId: { type: DataTypes.BIGINT, field: 'ParentBillId' },
            // ParentReturnId: { type: DataTypes.BIGINT, field: 'ParentReturnId' },
            // IsPackageBill: { type: DataTypes.BOOLEAN, field: 'IsPackageBill' },
            // PackageDiscount: { type: DataTypes.DECIMAL, field: 'PackageDiscount' },
            // StaffCheck: { type: DataTypes.BOOLEAN, field: 'StaffCheck' },
            // StaffDiscountId: { type: DataTypes.BIGINT, field: 'StaffDiscountId' },
            // StaffId: { type: DataTypes.BIGINT, field: 'StaffId' },
            // StaffDiscountTypeId: { type: DataTypes.BIGINT, field: 'StaffDiscountTypeId' },
            // StaffDiscountPercentage: { type: DataTypes.DECIMAL, field: 'StaffDiscountPercentage' },
            // DepartmentId: $scope.item.DepartmentId,
            // StoreMasterId: { type: DataTypes.BIGINT, field: 'StoreMasterId' },
            // PatientId: { type: DataTypes.BIGINT, field: 'PatientId' },
            // TitleId: { type: DataTypes.BIGINT, field: 'TitleId' },
            // Age: { type: DataTypes.INTEGER, field: 'Age' },
            // DOB: { type: DataTypes.DATE, field: 'DOB' },
            // GenderId: { type: DataTypes.BIGINT, field: 'GenderId' },
            // Mobile: { type: DataTypes.STRING, field: 'Mobile' },
            PatientName: '',
            PatientMrn: '',
            // PatientTypeId: $scope.item.PatientTypeId,
            // OTIdentifier: { type: DataTypes.STRING, field: 'OTIdentifier' },
            PatientId: '',
            EncounterId: '',
            EncounterTypeId: 2,
            // OTRegisterId: { type: DataTypes.BIGINT, field: 'OTRegisterId' },
            // ProcedureId: { type: DataTypes.BIGINT, field: 'ProcedureId' },
            // GuarantorId: { type: DataTypes.BIGINT, field: 'GuarantorId' },
            // GuarantorTypeId: { type: DataTypes.BIGINT, field: 'GuarantorTypeId' },
            // PrivateDueId: $scope.item.PrivateDueId,
            // GuarantorDueId: { type: DataTypes.BIGINT, field: 'GuarantorDueId' },
            // GuarantorName: { type: DataTypes.STRING, field: 'GuarantorName' },
            // FamilyLinkId: { type: DataTypes.BIGINT, field: 'FamilyLinkId' },
            // TransferEncounterId: { type: DataTypes.BIGINT, field: 'TransferEncounterId' },
            // TransferPatientId: { type: DataTypes.BIGINT, field: 'TransferPatientId' },
            // TransferAmount: { type: DataTypes.DECIMAL, field: 'TransferAmount' },
            // ServiceRateCategoryId: { type: DataTypes.BIGINT, field: 'ServiceRateCategoryId' },
            // ServiceRateCategoryName: { type: DataTypes.STRING, field: 'ServiceRateCategoryName' },
            // TpaId: { type: DataTypes.BIGINT, field: 'TpaId' },
            // RateCategoryId: { type: DataTypes.BIGINT, field: 'RateCategoryId' },
            DoctorId: '',
            DoctorName: '',
            // ReferralId: { type: DataTypes.BIGINT, field: 'ReferralId' },
            // RoomId: { type: DataTypes.BIGINT, field: 'RoomId' },
            // BedId: { type: DataTypes.BIGINT, field: 'BedId' },
            // WardId: { type: DataTypes.BIGINT, field: 'WardId' },
            // OTRoomId: { type: DataTypes.BIGINT, field: 'OTRoomId' },
            // ReferralName: { type: DataTypes.STRING, field: 'ReferralName' },
            // CancelAmount: { type: DataTypes.DECIMAL, field: 'CancelAmount' },
            // CancelReason: { type: DataTypes.STRING, field: 'CancelReason' },
            // CancelledBy: { type: DataTypes.BIGINT, field: 'CancelledBy' },
            // Comments: { type: DataTypes.STRING, field: 'Comments' },
            // IsManualBill: { type: DataTypes.BOOLEAN, field: 'IsManualBill' },
            // ManualBillNumber: { type: DataTypes.STRING, field: 'ManualBillNumber' },
            // ManualBillDate: { type: DataTypes.DATE, field: 'ManualBillDate' },
            // ManualBillComments: { type: DataTypes.STRING, field: 'ManualBillComments' },
            PatientBillStatusId: 3,
            // CreditVocher: { type: DataTypes.DECIMAL, field: 'CreditVocher' },
            // ToBeRefunded: { type: DataTypes.DECIMAL, field: 'ToBeRefunded' },
            // RefundAmount: { type: DataTypes.DECIMAL, field: 'RefundAmount' },
            FSTypeId: $scope.item.SettlementTypeId,
            // PatientOrderId: { type: DataTypes.INTEGER, field: 'PatientOrderId' },
            // PatientDietOrderId: { type: DataTypes.INTEGER, field: 'PatientDietOrderId' },
            // IsThisPrescription: { type: DataTypes.BOOLEAN, field: 'IsThisPrescription' },
            // PrescriptionId: { type: DataTypes.BIGINT, field: 'PrescriptionId' },
            // IsPharmacyBill: { type: DataTypes.BOOLEAN, field: 'IsPharmacyBill' },
            // IsOpticalBill: { type: DataTypes.BOOLEAN, field: 'IsOpticalBill' },
            // IsPharmacyReturn: { type: DataTypes.BOOLEAN, field: 'IsPharmacyReturn' },
            // IsClaimed: { type: DataTypes.BOOLEAN, field: 'IsClaimed' },
            // IsRegCumBill: { type: DataTypes.BOOLEAN, field: 'IsRegCumBill' },
            // IsFromIPBill: { type: DataTypes.BOOLEAN, field: 'IsFromIPBill' },
            // IsDirectBill: { type: DataTypes.BOOLEAN, field: 'IsDirectBill' },
            // IsFromWard: { type: DataTypes.BOOLEAN, field: 'IsFromWard' },
            // IsFromOT: { type: DataTypes.BOOLEAN, field: 'IsFromOT' },
            IsConsolidatePay: 1,
            // ChecklistStatusId: { type: DataTypes.INTEGER, field: 'ChecklistStatusId' },
            PharmacySaleTypeId: 3,
            // PharmacyReturnTypeId: ,
            // CNAmount: { type: DataTypes.DECIMAL, field: 'CNAmount' },
            // TDSAmount: { type: DataTypes.DECIMAL, field: 'TDSAmount' },
            // Disallowed: { type: DataTypes.DECIMAL, field: 'Disallowed' },
            // CreditNote: { type: DataTypes.DECIMAL, field: 'CreditNote' },
            // Secondarygurantor: { type: DataTypes.DECIMAL, field: 'Secondarygurantor' },
            // FinalDueAmount: { type: DataTypes.DECIMAL, field: 'FinalDueAmount' },
            // IsModified: { type: DataTypes.BOOLEAN, field: 'IsModified' },
            // IsEmergency: { type: DataTypes.BOOLEAN, field: 'IsEmergency' },
            // IsCashToCreditBill: { type: DataTypes.BOOLEAN, field: 'IsCashToCreditBill' },
            // CashToCreditRef: { type: DataTypes.BIGINT, field: 'CashToCreditRef' },
            // FreeBillAmount: { type: DataTypes.DECIMAL, field: 'FreeBillAmount' },
            // IsDirectDGBill: { type: DataTypes.BOOLEAN, field: 'IsDirectDGBill' },
            // IsMultiplePayment: { type: DataTypes.BOOLEAN, field: 'IsMultiplePayment' },
            // IsVirtualOrders: { type: DataTypes.BOOLEAN, field: 'IsVirtualOrders' },
            // IsClinicalBills: { type: DataTypes.BOOLEAN, field: 'IsClinicalBills' },
            // AppointmentId: { type: DataTypes.BIGINT, field: 'AppointmentId' },
            // Staff: { type: DataTypes.BOOLEAN, field: 'Staff' },
            // IsInserted: { type: DataTypes.BOOLEAN, field: 'IsInserted' },
            // CancelReqRaisedBy: { type: DataTypes.BIGINT, field: 'CancelReqRaisedBy' },
            // IsCancelReqApproved: { type: DataTypes.BOOLEAN, field: 'IsCancelReqApproved' },
            // IsDietBill: { type: DataTypes.BOOLEAN, field: 'IsDietBill' },
            Status: 1,
            // CancelReqRaisedStatusId: { type: DataTypes.BIGINT, field: 'CancelReqRaisedStatusId' },
            // IsInsAgreementDiscount: { type: DataTypes.BOOLEAN, field: 'IsInsAgreementDiscount' },
            // IsDayCare: { type: DataTypes.BOOLEAN, field: 'IsDayCare' },
            // AgreementDiscountAmt: { type: DataTypes.DECIMAL, field: 'AgreementDiscountAmt' },
            NetPatientAmount: 0,
            NetInsuranceAmount: 0,
            // PatientDue: { type: DataTypes.DECIMAL, field: 'PatientDue' },
            // CreditApproved: { type: DataTypes.DECIMAL, field: 'CreditApproved' },
            // changeCreditVoucher: { type: DataTypes.BOOLEAN, field: 'changeCreditVoucher' },
        };

        $scope.calculateTotalDue = function () {
            $scope.currentfilter.TotalSalesAmount = 0;
            $scope.currentfilter.TotalGrossAmount = 0;
            $scope.currentfilter.TotalDiscountAmount = 0;
            $scope.currentfilter.TotalOutStandingAmount = 0;
            $scope.currentfilter.TotalDueAmount = 0;
            $scope.currentfilter.TotalPaidAmount = 0;
            for (var i = 0; i < $scope.PatientPharmacyBills.length; i++) {
                var item = $scope.PatientPharmacyBills[i];
                if (item.select == true) {
                    item.DueAmount = (parseFloat(item.BillAmount) - parseFloat(item.ReturnAmount)) - (parseFloat(item.PaidAmount) - parseFloat(item.RefundAmount));
                    // $scope.currentfilter.TotalGrossAmount = $scope.currentfilter.TotalGrossAmount + item.NetAmount;
                    // $scope.currentfilter.TotalSalesAmount = $scope.currentfilter.TotalSalesAmount + item.BillAmount;
                    $scope.currentfilter.TotalSalesAmount = $scope.currentfilter.TotalSalesAmount + item.NetAmount;
                    $scope.currentfilter.TotalGrossAmount = $scope.currentfilter.TotalGrossAmount + item.BillAmount;
                    $scope.currentfilter.TotalDiscountAmount = $scope.currentfilter.TotalDiscountAmount + item.BillDiscount;
                    $scope.currentfilter.TotalOutStandingAmount = $scope.currentfilter.TotalOutStandingAmount + item.OutStandingAmount;
                    $scope.currentfilter.TotalDueAmount = $scope.currentfilter.TotalDueAmount + item.DueAmount;
                    $scope.currentfilter.TotalPaidAmount = $scope.currentfilter.TotalPaidAmount + item.PaidAmount;
                }
            }
            if ($scope.currentfilter.TotalDueAmount > 0) {
                $scope.currentfilter.TotalDueAmount = $scope.currentfilter.TotalDueAmount - $scope.currentfilter.TotalReturnAmount;
            }

            $scope.currentfilter.TotalDueAmount = parseFloat($scope.currentfilter.TotalDueAmount).toFixed(2);
            var NetNaturalValue = getNatural(Number($scope.currentfilter.TotalDueAmount).toFixed(2));
            var NetDecimalValue = getDecimal(Number($scope.currentfilter.TotalDueAmount).toFixed(2));
            var RoundOffValue = 0;

            if (NetDecimalValue > 0 && NetDecimalValue < 50) {
                $scope.currentfilter.TotalDueAmount = NetNaturalValue;
                RoundOffValue = -1 * (NetDecimalValue / 100);
                $scope.currentcontext.RoundOffValue = parseFloat(RoundOffValue);
            } else if (NetDecimalValue >= 50 && NetDecimalValue <= 99) {
                $scope.currentfilter.TotalDueAmount = NetNaturalValue + 1;
                RoundOffValue = (100 - NetDecimalValue) / 100;
                $scope.currentcontext.RoundOffValue = parseFloat(RoundOffValue);
            } else {
                RoundOffValue = 0;
                $scope.currentcontext.RoundOffValue = parseFloat(RoundOffValue);
            }
            $scope.currentcontext.ReceiptAmt = $scope.currentfilter.TotalDueAmount;
            $scope.currentcontext.TotBalanceAmt = $scope.currentfilter.TotalDueAmount;
            $scope.item.TotalDueAmount = $scope.currentfilter.TotalDueAmount;
            if ($scope.currentfilter.TotalPaidAmount > 0) {
                var NetNaturalValue = getNatural(Number($scope.currentfilter.TotalPaidAmount).toFixed(2));
                var NetDecimalValue = getDecimal(Number($scope.currentfilter.TotalPaidAmount).toFixed(2));
                var RoundOffValue = 0;

                if (NetDecimalValue > 0 && NetDecimalValue < 50) {
                    $scope.currentfilter.TotalPaidAmount = NetNaturalValue;
                    RoundOffValue = -1 * (NetDecimalValue / 100);

                } else if (NetDecimalValue >= 50 && NetDecimalValue <= 99) {
                    $scope.currentfilter.TotalPaidAmount = NetNaturalValue + 1;
                    RoundOffValue = (100 - NetDecimalValue) / 100;

                }
            }
        }

        $scope.SelectAll = function (chk) {
            for (var idx in $scope.PatientPharmacyBills) {
                $scope.PatientPharmacyBills[idx].select = chk;
            }
            $scope.calculateTotalDue();
        };

        $scope.SelectAll1 = function (chk) {
            for (var idx in $scope.PatientPharmacyReturns) {
                $scope.PatientPharmacyReturns[idx].select1 = chk;
            }
        };

        $scope.UncheckCash = function () {
            $scope.currentfilter.NotOutStanding = false;
            $scope.getPharmacyBills();
        };

        $scope.UncheckCredit = function () {
            $scope.currentfilter.IsOutStanding = false;
            $scope.getPharmacyBills();
        };

        $scope.savePharmacyBillCallback = function (scope, data, options, hasError) {

            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getEncounters();

        };

        $scope.openAdanace = function () {
            //$scope.item.PatientReceiptId = 7;
            var advcomments = '';
            for (var idx in $scope.details) {
                var item = $scope.details[idx];
                if (item && item.Status == 1 && item.TestName) {
                    if (!advcomments) advcomments = item.TestName;
                    else advcomments += ' ,  ' + item.TestName;
                }
            }

            if (advcomments) {
                advcomments += ' , Total Amt:  ' + $scope.item.OrderTotal;
            }
            console.log($scope.Encounter);
            //return;
            utl.Modal.open('app.ipreceipt-form', {
                params: {
                    id: $scope.Encounter.Id,
                    rid: 0,
                    rtypeid: 7,
                    billid: 0,
                    //osamt: $scope.item.OrderTotal,
                    patientorderreq: true,
                    //advcomments: advcomments,
                    //summarystatus: $scope.Encounter.IsBillFinalized,
                    guarantorid: $scope.Encounter.GuarantorId,
                    patient: $scope.Encounter.Patient,
                    guarantortypeid: $scope.Encounter.GuarantorTypeId
                },
                confirmCallback: $scope.getEncounters,
                cancelCallback: $scope.saveItem,
            });
        }

        $scope.refund_pharmacybills = function () {

            // console.log(parseFloat($scope.currentfilter.TotalAvailableAmount).toFixed(2));
            $scope.item1.FSTypeId = $scope.currentcontext.FSTypeId;
            // if($scope.item1.FSTypeId != 2) {
            //     utl.Alert.showErrorMsg('Please Select Settlement Type as Refund');return;
            // }
            $scope.item1.PaidAmount = $scope.currentcontext.ReceiptAmt;
            $scope.item1.RefundAmount = $scope.currentcontext.ReceiptAmt;
            $scope.item1.BillDiscountModeId = $scope.currentfilter.DiscountModeId;
            console.log($scope.item);
            console.log($scope.item1);
            // if($scope.item1.RefundAmount <= 0) {
            //     utl.Alert.showErrorMsg('Refund Amount should not be less than 0');return;
            // }
            $scope.currentcontext.FSTypeId = 2;

            $scope.currentcontext.ReceiptAmt = parseFloat($scope.currentfilter.TotalAvailableAmount).toFixed(2);
            var msg = 'Do You want to Refund the Available Balance?';
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: msg,
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.refundBills,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }
        $scope.refundBills = function () {
            // console.log(adjustments);
            $scope.item1.FSTypeId = $scope.currentcontext.FSTypeId;
            $scope.item1.PaidAmount = $scope.currentcontext.ReceiptAmt;
            $scope.item1.RefundAmount = $scope.currentcontext.ReceiptAmt;
            $scope.item1.BillDiscountModeId = $scope.currentfilter.DiscountModeId;

            var inputData = {
                Header: $scope.item1,
                PaymentDetail: $scope.item,
                // Bills: getbills,
                // ReturnBills: returnbills,
                // adjustmentDetail: adjustments
            };
            console.log(inputData);
            // return;
            // var actionName = 'billing/PatientBills/ConsolidatePayment';
            var actionName = 'billing/PatientBills/ConsolidatePharmacyPayment';
            var options = {
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.savePharmacyBillCallback
            };
            utl.Http.doAction(options);
        };

        $scope.pay_pharmacybills = function () {
            var getbills = getSelectionRows();
            var returnbills = getSelectionRowsForReturn();
            // console.log($scope.item);
            // console.log(returnbills);
            console.log(getbills); //return;
            var adjustments = [];
            adjustments = $scope.PaymentAdjustmentDetails;
            if (!adjustments) {
                if ($scope.item.PaymentTypeId == 7) {
                    utl.Alert.showErrorMsg($translate.instant('Please do the Adjustments'));
                    return false;
                }

            } else {
                if (adjustments.length == 0 && $scope.item.PaymentTypeId == 7) {
                    utl.Alert.showErrorMsg($translate.instant('Please do the Adjustments'));
                    return false;
                }

            }

            // if(adjustments && adjustments.length == 0)
            // {
            //     utl.Alert.showErrorMsg($translate.instant('Please do the Adjustments'));
            //     return false;
            // }
            // console.log(adjustments); //return;

            $scope.item1.FSTypeId = $scope.currentcontext.FSTypeId;
            $scope.item1.PaidAmount = $scope.currentcontext.ReceiptAmt;
            $scope.item1.BillAmount = $scope.item1.PaidAmount;
            $scope.item1.BillDiscountModeId = $scope.currentfilter.DiscountModeId;
            console.log($scope.item);
            console.log($scope.item1);
            // console.log(adjustments);
            if($scope.currentcontext.ReceiptAmt < $scope.currentfilter.TotalDueAmount) {
                utl.Alert.showErrorMsg('Receipt Amount should not be less than TotalDueAmount');return;
            }

            if($scope.currentcontext.ReceiptAmt > $scope.currentfilter.TotalDueAmount) {
                utl.Alert.showErrorMsg('Receipt Amount should not be greater than TotalDueAmount');return;
            }
            var inputData = {
                Header: $scope.item1,
                PaymentDetail: $scope.item,
                Bills: getbills,
                ReturnBills: returnbills,
                adjustmentDetail: adjustments
            };
            console.log(inputData);
            // return;
            // var actionName = 'billing/PatientBills/ConsolidatePayment';
            var actionName = 'billing/PatientBills/ConsolidatePharmacyPayment';
            var options = {
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.savePharmacyBillCallback
            };
            utl.Http.doAction(options);
        };

        $scope.approveBillCallback = function () {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getEncounters();
        };

        $scope.approve_pharmacybills = function () {
            $scope.SelectAll($scope.currentcontext.selectallchk);
            var msg = 'Do You Confirm Pharmacy Clearance?';
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: msg,
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.approveBills,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }
        $scope.approveBills = function () {
            var actionName = 'Visit/Visit/UpdateEncounter';
            //return;
            var inputData = {
                Id: $scope.currentcontext.EncounterId,
                IsPharmacyClearance: 1,
            }
            var options = {
                encounter: {},
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.approveBillCallback
            };

            utl.Http.doAction(options);
        };

        $scope.AdjustAgainstAdvance = function () {
            if ($scope.currentcontext.TotBalanceAmt == 0) {
                $scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.ReceiptAmt) + parseFloat($scope.currentcontext.TotBalanceAmt);
                $scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.TotBalanceAmt).toFixed(2);
            }
            $scope.openAdvanceModal($scope.currentfilter.PatientId)
        };

        $scope.openAdvanceModal = function (patientid) {
            utl.Modal.open('app.pharmacyadjustagainstadvance', {
                params: {
                    id: patientid,
                    balanceamount: $scope.currentcontext.TotBalanceAmt
                },
                confirmCallback: $scope.onAdjustConfirmed
            });
        };

        $scope.onAdjustConfirmed = function (AdjRecData) {
            var AdjAmount = 0;
            var PaymentAdjustmentDetail = {};
            $scope.PaymentAdjustmentDetails = [];

            for (var idx in AdjRecData.AdjustedData) {
                var adjdata = AdjRecData.AdjustedData[idx];
                if (parseFloat(adjdata.AdjustAmount) > 0) {
                    AdjAmount = AdjAmount + parseFloat(adjdata.AdjustAmount);

                    PaymentAdjustmentDetail = {
                        Id: 0,
                        ParentReceiptId: adjdata.Id,
                        PaymentAdjustNumber: null,
                        //AvailedAdvance: parseFloat(adjdata.AdjustAmount),
                        //AmountAdjusted: parseFloat(adjdata.AmountAdjusted) + parseFloat(adjdata.AdjustAmount),
                        AvailedAdvance: parseFloat(adjdata.AmountPaid) - parseFloat(adjdata.AmountAdjusted),
                        AdvanceAdjusted: parseFloat(adjdata.AdjustAmount),
                        BalanceAdvance: (parseFloat(adjdata.AmountPaid) - parseFloat(adjdata.AmountAdjusted)) - parseFloat(adjdata.AdjustAmount),
                        RoundOffValue: 0,
                        PatientId: $scope.currentfilter.PatientId,
                        PatientName: $scope.item.PatientName,
                        EncounterId: $scope.currentcontext.EncounterId,
                        //EncounterTypeId: vm.Context == 'OP' ? 1 : 4,
                        PatientBillId: 0,
                        BillTypeId: 0,
                        DepartmentId: 0,
                        LocationId: 0,
                        FacilityId: 1,
                        OrganizationId: 0,
                        AdjustedById: utl.Session.getCurrentUserId(),
                        ApprovedById: utl.Session.getCurrentUserId()
                    }

                    $scope.PaymentAdjustmentDetails.push(PaymentAdjustmentDetail);
                }
            }
            console.log(AdjAmount);
            console.log($scope.currentcontext.TotBalanceAmt);//return;
            if (AdjAmount > $scope.currentcontext.TotBalanceAmt) {
                utl.Alert.showErrorMsg('Adjusting Amount Should Not Greater Than Actual Bill/Due Amount.');
                AdjAmount = 0;
                PaymentAdjustmentDetail = {};
                $scope.PaymentAdjustmentDetails = [];
                return false;
            } else {
                if (AdjAmount < $scope.currentcontext.TotBalanceAmt) {
                    utl.Alert.showErrorMsg('Adjusting Amount Should Not Less Than Actual Bill/Due Amount.');
                    AdjAmount = 0;
                    PaymentAdjustmentDetail = {};
                    $scope.PaymentAdjustmentDetails = [];
                    return false;
                }
                else if (AdjAmount == $scope.currentcontext.TotBalanceAmt) {
                    $scope.currentcontext.ReceiptAmt = AdjAmount;
                    $scope.item.Received = AdjAmount;
                    $scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.TotNetAmount) - parseFloat($scope.currentcontext.PaidAmt) - AdjAmount;
                    $scope.currentcontext.PaymentTypeId = 7;
                    $scope.currentcontext.IsAdjustAgainstAdvance = true;
                }

            }
        };

        $scope.getPatPaymentDetailscallback = function (scope, data, options, hasError) {
            $scope.PaymentInfoDetails = [];
            for (var pdx in data.Data) {
                var payData = data.Data[pdx];
                var TransDetails = '';
                if (payData.PaymentTypeId == 1) {
                    TransDetails = payData.PaymentType.Description;
                }
                if (payData.PaymentTypeId == 2) {
                    TransDetails = payData.PaymentType.Description;
                    TransDetails += '/' + payData.Bank.Description;
                    TransDetails += '/' + payData.ChequeNo;
                    var ChequeDate = $filter('date')(payData.ChequeDate, 'yyyy-MM-dd');
                    TransDetails += '/' + ChequeDate;
                }
                if (payData.PaymentTypeId == 3) {
                    TransDetails = payData.PaymentType.Description;
                    TransDetails += '/' + payData.Bank.Description;
                    TransDetails += '/' + payData.DDNumber;
                    var DDDate = $filter('date')(payData.DDDate, 'yyyy-MM-dd');
                    TransDetails += '/' + DDDate;
                }
                if (payData.PaymentTypeId == 4) {
                    TransDetails = payData.PaymentType.Description;
                    TransDetails += '/' + payData.Bank.Description;
                    TransDetails += '/' + payData.WireTransferId;
                    var WireTransferDate = $filter('date')(payData.WireTransferDate, 'yyyy-MM-dd');
                    TransDetails += '/' + WireTransferDate;
                }
                if (payData.PaymentTypeId == 5) {
                    TransDetails = payData.PaymentType.Description;
                    TransDetails += '/' + payData.Bank.Description;
                    // TransDetails += '/' + payData.CardType.Description;
                    TransDetails += '/' + payData.AuthorizedCode;
                }
                if (payData.PaymentTypeId == 6) {
                    TransDetails = payData.PaymentType.Description;
                    TransDetails += '/' + payData.Bank.Description;
                    // TransDetails += '/' + payData.CardType.Description;
                    TransDetails += '/' + payData.AuthorizedCode;
                }
                var payDetaildata = {
                    PaymentInfo: TransDetails,
                    ReceiptType: payData.ReceiptType.Description,
                    ReceiptNumber: payData.ReceiptNumber,
                    ReceiptDateTime: payData.ReceiptDateTime,
                    AmountPaid: payData.AmountPaid,
                };
                $scope.PaymentInfoDetails.push(payDetaildata);
            }
            if (data.Data.length > 0) {
                var PaymentDatas = data.Data[0];
                $scope.currentcontext.PaymentTypeId = PaymentDatas.PaymentTypeId;
                $scope.item.BankId = PaymentDatas.BankId;
                $scope.item.ChequeNo = PaymentDatas.ChequeNo;
                $scope.item.UPIRefNumber = PaymentDatas.UPIRefNumber;
                $scope.item.DDNumber = PaymentDatas.DDNumber;
                $scope.item.WireTransferId = PaymentDatas.WireTransferId;
                $scope.item.AuthorizeNumber = PaymentDatas.AuthorizedCode;
                $scope.item.ChequeDate = PaymentDatas.ChequeDate;
                $scope.item.DDDate = PaymentDatas.DDDate;
                $scope.item.WireTransferDate = PaymentDatas.WireTransferDate;
                $scope.item.CardTypeId = PaymentDatas.CardTypeId;
                $scope.item.CollectedOn = PaymentDatas.CollectedOn;
            }
        };

        $scope.PatPaymentDetails = function (billid) {
            if (billid && billid > 0) {
                var inputData = {
                    Params: [{
                        Key: 9,
                        Value: billid
                    }]
                };
                var options = {
                    action: 'Billing/PatientPaymentDetails/GetPatientPaymentDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getPatPaymentDetailscallback
                };
                utl.Http.doAction(options);
            }
        };

        // $scope.getPrevAdvancesCallback = function (scope, data, options, hasError) {
        //     var prevpaidamt = 0;
        //     if (data.Data.length > 0) {
        //         for (var pdx in data.Data) {
        //             var preadv = data.Data[pdx];
        //             prevpaidamt += preadv.AmountPaid;
        //         }
        //     }
        //     $scope.totalpaidamt = prevpaidamt;

        // };

        $scope.getAvailableAmount = function () {
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.currentfilter.PatientId
                },
                {
                    Key: 4,
                    Value: 7
                },
                {
                    Key: 5,
                    Value: 1
                },
                {
                    Key: 10,
                    Value: $scope.currentcontext.EncounterId
                }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'Billing/PatientPaymentDetails/GetPatientPaymentDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getAvailableAmountCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getAvailableAmountCallback = function (scope, data, options, hasError) {
            $scope.advanceDetails = [];
            for (var idx in data.Data) {
                var recdata = data.Data[idx];
                recdata.AmountPaid = parseFloat(recdata.AmountPaid).toFixed(2);
                recdata.AmountAdjusted = parseFloat(recdata.AmountAdjusted).toFixed(2);
                var advbalance = recdata.AmountPaid - recdata.AmountAdjusted;
                if (advbalance <= 0) {
                    recdata.FullAmountAdjusted = true;
                    recdata.AmountAvailable = 0;
                    recdata.AdjustAmount = 0;
                } else {
                    recdata.FullAmountAdjusted = false;
                    recdata.AmountAvailable = advbalance;
                    recdata.AdjustAmount = 0;
                }
                $scope.advanceDetails.push(recdata);
            }
            var TotalAvailableAmt = 0;
            $scope.currentfilter.TotalAvailableAmount = 0;
            for (var idx in $scope.advanceDetails) {
                var item = $scope.advanceDetails[idx];
                TotalAvailableAmt = TotalAvailableAmt + item.AmountAvailable;
            }
            $scope.currentfilter.TotalAvailableAmount = TotalAvailableAmt;
            var refundAmount = 0;
            if ($scope.PatientRefundData.length > 0) {
                for (var idx in $scope.PatientRefundData) {
                    var item = $scope.PatientRefundData[idx];
                    refundAmount = refundAmount + item.RefundAmount;
                }
            }

            if (refundAmount > 0) {
                $scope.currentfilter.TotalAvailableAmount = $scope.currentfilter.TotalAvailableAmount - refundAmount;
                $scope.currentfilter.TotalAdvanceReturned = refundAmount;
            }
            $scope.currentfilter.TotalAvailableAmount = parseFloat($scope.currentfilter.TotalAvailableAmount).toFixed(2);
        };

        // $scope.getPrevAdvances = function () {
        //     var inputData = {
        //         Params: [{
        //                 Key: 4,//ReceiptType
        //                 Value: 7
        //             },
        //             {
        //                 Key: 5,//ReceiptStatus
        //                 Value: 1
        //             },
        //             // {
        //             //     Key: 23,
        //             //     Value: 1
        //             // },
        //             {
        //                 Key: 10,
        //                 Value: $scope.currentcontext.EncounterId
        //             },
        //             {
        //                 Key: 11,
        //                 Value: 2
        //             },
        //             {
        //                 Key: 13,
        //                 Value: false
        //             },
        //             {
        //                 Key: 16,
        //                 Value: false
        //             },
        //         ],
        //     };

        //     var options = {
        //         action: 'Billing/PatientPaymentDetails/GetPatientPaymentDetails',
        //         data: inputData,
        //         type: 'post',
        //         onComplete: $scope.getPrevAdvancesCallback
        //     };

        //     utl.Http.doAction(options);
        // };
        $scope.getPharmacyBillsCallback = function (scope, data, options, hasError) {
            $scope.SalesSerialNo = 0;
            $scope.ReturnSerialNo = 0;
            $scope.PatientPharmacyBills = [];
            $scope.PatientPharmacyReturns = [];
            $scope.PatientBillsWithReturn = data.BillswithReturn;
            $scope.PatientRefundData = data.RefundData.Data;
            $scope.currentfilter.TotalAmount = 0;
            $scope.currentfilter.TotalSalesAmount = 0;
            $scope.currentfilter.TotalReturnAmount = 0;
            $scope.currentfilter.TotalRefundAmount = 0;
            $scope.currentfilter.TotalOutStandingAmount = 0;
            $scope.currentfilter.TotalGrossAmount = 0;
            $scope.currentfilter.TotalPatientAmount = 0;
            $scope.currentfilter.TotalPaidAmount = 0;
            $scope.currentfilter.TotalInsuranceAmount = 0;
            $scope.currentfilter.TotalDiscountAmount = 0;
            $scope.currentfilter.TotalDueAmount = 0;
            for (var i = 0; i < $scope.PatientBillsWithReturn.length; i++) {
                var item = $scope.PatientBillsWithReturn[i];
                if (item.ReturnNumber && item.ReturnNumber != undefined &&
                    item.ReturnNumber != null && item.ReturnNumber != '') {
                    item.ReturnSerialNo = $scope.ReturnSerialNo + 1;
                    if (item.ReturnAmount == 0 && item.GrossAmount > 0) {
                        item.ReturnAmount = item.GrossAmount;
                    }
                    item.NetReturnAmount = item.ReturnAmount - item.DiscountAmount;
                    // item.NetReturnAmount = Math.round(item.NetReturnAmount);
                    if (item.IsReturnUsed == 0) {
                        $scope.currentfilter.TotalReturnAmount = $scope.currentfilter.TotalReturnAmount + item.NetReturnAmount;
                        item.select1 = true;
                        item.IsReturnUsed = 1;
                    }
                    //$scope.currentfilter.TotalRefundAmount = $scope.currentfilter.TotalRefundAmount + item.NetReturnAmount;
                    $scope.currentfilter.TotalReturnAmount = $scope.currentfilter.TotalReturnAmount + item.NetReturnAmount;
                    $scope.currentfilter.TotalRefundAmount = $scope.currentfilter.TotalRefundAmount + item.RefundedAmount;
                    $scope.PatientPharmacyReturns.push(item);
                    $scope.ReturnSerialNo++;
                } else if (item.PharmacyReturnTypeId != 6) {
                    item.SalesSerialNo = $scope.SalesSerialNo + 1;
                    item.NetAmount = item.BillAmount - item.BillDiscount;
                    item.ReturnAmount = 0;
                    item.RefundedAmount = 0;
                    // if (item.BillTypeId != 3) {
                    //     item.NetAmount = Math.round(item.NetAmount);
                    // }
                    for (var j = 0; j < item.PatientReturns.length; j++) {
                        var returnitem = item.PatientReturns[j];
                        item.ReturnAmount = item.ReturnAmount + returnitem.GrossAmount;
                        item.RefundedAmount = item.RefundedAmount + returnitem.RefundedAmount;
                    }
                    if (!item.BillDiscount) {
                        item.BillDiscount = 0;
                    }
                    // if (item.PharmacySaleTypeId == 6) {//previously medicine credit bills are not taken for pharmacy clearance
                    //     if (!item.PaidAmount) {
                    //         item.PaidAmount = 0;
                    //     }
                    //     //item.DueAmount = item.NetPatientAmount - item.PaidAmount;
                    //     //item.BillAmount = item.BillAmount + item.NetInsuranceAmount;
                    // } else {
                    if (!item.PaidAmount) {
                        item.PaidAmount = 0;
                    }

                    //item.DueAmount = item.NetAmount - item.PaidAmount;
                    item.DueAmount = (parseFloat(item.BillAmount) - parseFloat(item.ReturnAmount)) - (parseFloat(item.PaidAmount) - parseFloat(item.RefundAmount));
                    // $scope.currentfilter.TotalGrossAmount = $scope.currentfilter.TotalGrossAmount + item.NetAmount;
                    // $scope.currentfilter.TotalSalesAmount = $scope.currentfilter.TotalSalesAmount + item.BillAmount;
                    $scope.currentfilter.TotalSalesAmount = $scope.currentfilter.TotalSalesAmount + item.NetAmount;
                    $scope.currentfilter.TotalGrossAmount = $scope.currentfilter.TotalGrossAmount + item.BillAmount;
                    $scope.currentfilter.TotalDiscountAmount = $scope.currentfilter.TotalDiscountAmount + item.BillDiscount;
                    $scope.currentfilter.TotalOutStandingAmount = $scope.currentfilter.TotalOutStandingAmount + item.OutStandingAmount;
                    $scope.currentfilter.TotalDueAmount = $scope.currentfilter.TotalDueAmount + item.DueAmount;
                    $scope.currentfilter.TotalPaidAmount = $scope.currentfilter.TotalPaidAmount + item.PaidAmount;
                    if (item.DueAmount > 0) {
                        item.select = true;
                    }
                    $scope.PatientPharmacyBills.push(item);
                    $scope.SalesSerialNo++;
                    // }

                    //$scope.currentfilter.TotalPatientAmount = $scope.currentfilter.TotalPatientAmount + item.NetPatientAmount;
                    //$scope.currentfilter.TotalInsuranceAmount = item.NetInsuranceAmount + $scope.currentfilter.TotalInsuranceAmount;

                }
            }

            if ($scope.currentfilter.TotalDueAmount) {
                //$scope.currentfilter.TotalDueAmount = parseFloat($scope.currentfilter.TotalDueAmount) - parseFloat($scope.currentfilter.TotalReturnAmount);
                //$scope.currentfilter.TotalDueAmount = (parseFloat($scope.currentfilter.TotalGrossAmount) - parseFloat($scope.currentfilter.TotalReturnAmount)) - (parseFloat($scope.currentfilter.TotalPaidAmount) - parseFloat($scope.currentfilter.TotalRefundAmount))

            }

            if ($scope.currentfilter.TotalDueAmount > 0) {
                $scope.currentfilter.TotalDueAmount = $scope.currentfilter.TotalDueAmount - $scope.currentfilter.TotalReturnAmount;
            }

            $scope.currentfilter.TotalDueAmount = parseFloat($scope.currentfilter.TotalDueAmount).toFixed(2);
            var NetNaturalValue = getNatural(Number($scope.currentfilter.TotalDueAmount).toFixed(2));
            var NetDecimalValue = getDecimal(Number($scope.currentfilter.TotalDueAmount).toFixed(2));
            var RoundOffValue = 0;

            if (NetDecimalValue > 0 && NetDecimalValue < 50) {
                $scope.currentfilter.TotalDueAmount = NetNaturalValue;
                RoundOffValue = -1 * (NetDecimalValue / 100);
                $scope.currentcontext.RoundOffValue = parseFloat(RoundOffValue);
            } else if (NetDecimalValue >= 50 && NetDecimalValue <= 99) {
                $scope.currentfilter.TotalDueAmount = NetNaturalValue + 1;
                RoundOffValue = (100 - NetDecimalValue) / 100;
                $scope.currentcontext.RoundOffValue = parseFloat(RoundOffValue);
            } else {
                RoundOffValue = 0;
                $scope.currentcontext.RoundOffValue = parseFloat(RoundOffValue);
            }
            $scope.currentcontext.ReceiptAmt = $scope.currentfilter.TotalDueAmount;
            $scope.currentcontext.TotBalanceAmt = $scope.currentfilter.TotalDueAmount;
            $scope.item.TotalDueAmount = $scope.currentfilter.TotalDueAmount;
            // $scope.SelectAll($scope.currentcontext.selectallchk);
            // $scope.SelectAll1($scope.currentcontext.selectallchk1);
            //$scope.canShowDMPrintBtn = true;


            // if ($scope.item.GuarantorTypeId > 1 W) {
            //     $scope.item.PaidAmount = parseFloat($scope.currentcontext.TotalReceiptAmount) - parseFloat($scope.currentcontext.TotalRefundAmount);ZZ
            // }
            if ($scope.currentfilter.TotalPaidAmount > 0) {
                var NetNaturalValue = getNatural(Number($scope.currentfilter.TotalPaidAmount).toFixed(2));
                var NetDecimalValue = getDecimal(Number($scope.currentfilter.TotalPaidAmount).toFixed(2));
                var RoundOffValue = 0;

                if (NetDecimalValue > 0 && NetDecimalValue < 50) {
                    $scope.currentfilter.TotalPaidAmount = NetNaturalValue;
                    RoundOffValue = -1 * (NetDecimalValue / 100);

                } else if (NetDecimalValue >= 50 && NetDecimalValue <= 99) {
                    $scope.currentfilter.TotalPaidAmount = NetNaturalValue + 1;
                    RoundOffValue = (100 - NetDecimalValue) / 100;

                }
            }
            $scope.currentfilter.TotalAmount = $scope.currentfilter.TotalSalesAmount - $scope.currentfilter.TotalReturnAmount;
            $scope.getAvailableAmount();
        };
        function getNatural(num) {
            return parseFloat(num.toString().split(".")[0]);
        }

        function getDecimal(num) {
            return parseFloat(num.toString().split(".")[1]);
        }
        $scope.backToList = function () {
            $state.go('app.pharmacyclearance');
        }
        $scope.getPharmacyBills = function () {
            if ($scope.currentfilter.PatientId > 0) {
                // var FromDate = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd 00:00:00') || null;
                // var ToDate = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd 23:59:59') || null;

                var inputData = {
                    Data: {
                        PatientId: $scope.currentfilter.PatientId,
                        EncounterId: $scope.currentcontext.EncounterId,
                        PatientBillStatusId: 3,
                        //PharmacySaleTypeId: $scope.currentfilter.PharmacySaleTypeId,
                        //DueApprovedById: $scope.currentfilter.DueApprovedById,
                        //FromDate: FromDate,
                        //ToDate: ToDate,
                        //IsOutStanding: $scope.currentfilter.IsOutStanding,
                        //IsOutStanding: true,
                        //NotOutStanding: $scope.currentfilter.NotOutStanding
                    }
                };

                var options = {
                    // action: 'billing/PatientBills/getPharmacyBillsWithReturn',
                    action: 'billing/PatientBills/getPharmacyClearanceBillsWithReturn',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getPharmacyBillsCallback
                };

                utl.Http.doAction(options);
            } else {
                utl.Alert.showSuccessMsg('billing.pharmacy-billdetails.process.lbl');
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "BillDateTime",
                displayName: $translate.instant('billing.pharmacy-billdetails.billdate.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.BillDateTime | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{row.entity.PatientBill.BillDateTime| date: 'HH:mm'}}</span>" + "</div>"
            }, {
                field: "BillNumber",
                displayName: $translate.instant('billing.pharmacy-billdetails.billno.lbl')
            }, {
                field: "Patient",
                displayName: $translate.instant('billing.pharmacy-billdetails.patient.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)" uib-tooltip="{{row.entity.Patient.Title.Description}}&nbsp; .{{row.entity.Patient.FirstName}} / {{row.entity.Patient.MRN}}  / {{row.entity.Patient.Age}} / {{row.entity.Patient.Gender.Description}}" tooltip-placement="right" >' +
                    "{{row.entity.Patient.Title.Description}}&nbsp;</span>" +
                    "<span >{{row.entity.Patient.FirstName}}&nbsp;</span>" +
                    "<span >{{row.entity.Patient.LastName}}</span>" +
                    "<span >/</span>" +
                    "<span >{{row.entity.Patient.MRN}}</span>" +
                    "<span >/<span>" +
                    "<span ng-if='row.entity.Patient.Title && row.entity.Patient.Title.Description' >" +
                    "<span >{{row.entity.Patient.Age}}</span>" +
                    "<span >/</span>" +
                    "<span >{{row.entity.Patient.Gender.Description}}</span>" +
                    "</a></div>"
            },
            // {
            //     field: "RoomDetails",
            //     displayName: $translate.instant('billing.pharmacy-billdetails.roomdetails.lbl'),
            // },
            {
                field: "UserName",
                displayName: $translate.instant('billing.pharmacy-billdetails.doctor.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>" +
                    "<span >{{row.entity.User.Title.Description}}&nbsp;</span>" +
                    "<span >{{row.entity.User.FirstName}}&nbsp;</span>" +
                    "<span >{{row.entity.User.LastName}}&nbsp;</span>" +
                    "</span></div>"
            }, {
                field: "BillAmount",
                displayName: $translate.instant('billing.pharmacy-billdetails.billamount.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{row.entity.BillAmount | displaycurrency}}</span>' + '</div>'
            }, {
                field: "BillDiscount",
                displayName: $translate.instant('billing.pharmacy-billdetails.discount.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{row.entity.BillDiscount | displaycurrency}}</span>' + '</div>'
            }, {
                field: "RoundOff",
                displayName: $translate.instant('billing.pharmacy-billdetails.roundoff.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{row.entity.RoundOffValue | displaycurrency}}</span>' + '</div>'
            }, {
                field: "NetAmount",
                displayName: $translate.instant('billing.pharmacy-billdetails.netamount.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{row.entity.NetAmount | displaycurrency}}</span>' + '</div>'
            },
                // {
                //     field: "NetAmount",
                //     displayName: $translate.instant('billing.pharmacy-billdetails.paymentmode.lbl'),
                //     cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{row.entity.PaymentType | displaycurrency}}</span>' + '</div>'
                // }
            ]
        };
        vm.gridConfig.enableRowSelection = true;
        vm.gridConfig.multiSelect = true;
        vm.gridConfig.enableFullRowSelection = true;
        vm.gridConfig.onRegisterApi = function (gridApi) {
            $scope.gridApi = gridApi;
        };

        function getSelectionRows() {
            var currentSelection = [];
            for (var idx in $scope.PatientPharmacyBills) {
                if ($scope.PatientPharmacyBills[idx].select) {
                    currentSelection.push($scope.PatientPharmacyBills[idx]);
                }
            }
            return currentSelection;
        }

        function getSelectionRowsForReturn() {
            var currentSelection = [];
            for (var idx in $scope.PatientPharmacyReturns) {
                if ($scope.PatientPharmacyReturns[idx].select1) {
                    currentSelection.push($scope.PatientPharmacyReturns[idx]);
                }
            }
            return currentSelection;
        }

        // $scope.disableInclusion = function(idx, bill) {
        //     if (bill.IsExclusionItem) {
        //         $scope.PatientBillDetails[idx].IsInclusionItem = false;
        //     } else {
        //         $scope.PatientBillDetails[idx].IsInclusionItem = true;
        //     }
        // };

        $scope.selectionChangedCal = function (item) {
            $scope.calculateTotalDue();
        }

        // function selectionChangedCal(row) {
        //     var item = row.entity;
        //     if (row.isSelected) {
        //         $scope.item.OutStandingAmt = parseFloat($scope.item.OutStandingAmt) + parseFloat(item.OutStandingAmount);
        //         $scope.item.Discount = parseFloat($scope.item.Discount) + parseFloat(item.BillDiscount);
        //         $scope.item.BillAmount = parseFloat($scope.item.BillAmount) + parseFloat(item.BillAmount);
        //         var amt = parseFloat($scope.item.Received) + parseFloat(item.PaidAmount);
        //         $scope.item.Received = eval(amt).toFixed(2);
        //     } else {
        //         $scope.item.OutStandingAmt = parseFloat($scope.item.OutStandingAmt) - parseFloat(item.OutStandingAmount);
        //         $scope.item.Discount = parseFloat($scope.item.Discount) - parseFloat(item.BillDiscount);
        //         $scope.item.BillAmount = parseFloat($scope.item.BillAmount) - parseFloat(item.BillAmount);
        //         var amt = parseFloat($scope.item.Received) - parseFloat(item.PaidAmount);
        //         $scope.item.Received = eval(amt).toFixed(2);
        //     }
        // }

        $scope.Print = function () {
            $scope.Details = getSelectionRows();
            var ids = [];
            for (var idx in $scope.Details) {
                var currentBill = $scope.Details[idx];
                ids.push(currentBill.Id);
            }
            if (ids.length > 0) {
                var actionName = 'billing/patientbills/PrintConsolidatedPharmacybilldetails';
                var options = {
                    action: actionName,
                    data: {
                        Data: ids
                    },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };
                utl.Http.doDownload(options);
            }
        };
        $scope.HeaderPrint = function () {
            if ($scope.currentfilter.PatientId > 0) {
                var FromDate = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd 00:00:00') || null;
                var ToDate = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd 23:59:59') || null;

                var inputData = {
                    Data: {
                        PatientId: $scope.currentfilter.PatientId,
                        PharmacySaleTypeId: $scope.currentfilter.PharmacySaleTypeId,
                        FacilityId: utl.Session.getCurrentFacilityId(),
                        DueApprovedById: $scope.currentfilter.DueApprovedById,
                        FromDate: FromDate,
                        ToDate: ToDate,
                        IsOutStanding: $scope.currentfilter.IsOutStanding,
                        NotOutStanding: $scope.currentfilter.NotOutStanding
                    }
                };
                var options = {
                    action: 'billing/patientbills/PrintPharmacyConsolidatedbill',
                    data: inputData,
                    type: 'post'
                };
                utl.Http.doDownload(options);
            }
        };
        $scope.print = function () {
            // if ($scope.currentfilter.PatientId > 0) {
            var FromDate = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Data: {
                    PatientId: $scope.currentfilter.PatientId,
                    EncounterId: $scope.currentcontext.EncounterId,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    PatientBillStatusId: 3,
                }
            };

            var options = {
                action: 'billing/PatientBills/PrintPharmacyClearance',
                data: inputData,
                type: 'post',
                // onComplete: $scope.getPharmacyBillsCallback
            };

            utl.Http.doDownload(options);
            // } else {
            //     utl.Alert.showSuccessMsg('Successful');
            // }
        };

        // $scope.print = function () {

        //     var inputData = {
        //         Id: $scope.currentcontext.id
        //     };
        //     var options = {
        //         action: 'billing/PatientBills/PrintPharmacyConsolidatedbill',
        //         data: inputData,
        //         type: 'post'
        //     };
        //     utl.Http.doDownload(options);
        // }
        $scope.dmPrintForPharmacyBillsWithReturn = function () {
            if ($scope.dmprintpreferences != 1) {
                utl.Alert.showErrorMsg('billing.pharmacy.preferencesetting.lbl');
                return false;
            } else {
                PatientBillIds = [];
                PatientReturnIds = [];
                var selectedRows = getSelectionRows();
                for (var index in selectedRows) {
                    PatientBillIds.push(selectedRows[index].Id);
                }
                var selectedRowsForReturn = getSelectionRowsForReturn();
                for (var index1 in selectedRowsForReturn) {
                    PatientReturnIds.push(selectedRowsForReturn[index1].Id);
                }
                var inputData = {
                    Data: {
                        PatientBillIds: PatientBillIds,
                        PatientReturnIds: PatientReturnIds,
                        PatientId: $scope.currentfilter.PatientId
                    }
                };
                var options = {
                    action: 'billing/patientbills/DMPrintPharmacyBillsWithReturn',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.dmPrintForPharmacyBillsWithReturnCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.dmPrintForPharmacyBillsWithReturnCallback = function (scope, data, options, hasError) {
            console.log(data);
            var dmPrintInput = preparePrintDataForSalesWithReturn(data);
            $scope.printPharmacyConsolidatedBill(dmPrintInput);
        };

        function preparePrintDataForSalesWithReturn(data) {
            console.log('preparePrintDataForSalesWithReturn starts');

            var vIPOPNO = '';
            var vPTitle = '';
            var vPFirstName = '';
            var vPLastName = '';
            var vPAddressLine1 = '';
            var vPAddressLine2 = '';
            var vUTitle = '';
            var vUFirstName = '';
            var vULastName = '';
            var vMRN = '';
            var vAge = '';
            var vDOB = '';
            var vFDOB = '';
            var vGender = '';
            var vCFirstName = '';
            var vCLastName = '';
            var vCTitle = '';
            var vDrName = '';
            var vGuarantorName = '';

            if (data.PatientData) {
                if (data.PatientData.Title) vPTitle = data.PatientData.Title.Description;
                if (data.PatientData.FirstName) vPFirstName = data.PatientData.FirstName;
                if (data.PatientData.LastName) vPLastName = data.PatientData.LastName;
                if (data.PatientData.MRN) vMRN = data.PatientData.MRN;
                if (data.PatientData.Age) vAge = '' + data.PatientData.Age;
                if (data.PatientData.DOB) vDOB = '' + data.PatientData.DOB;
                if (data.PatientData.DOB) vFDOB = '' + utl.Formatter.getDateTimeString(data.PatientData.DOB);
                if (data.PatientData.Gender) vGender = '' + data.PatientData.Gender.Description;
                if (data.PatientData.AddressLine1) vPAddressLine1 = data.PatientData.AddressLine1;
                if (data.PatientData.AddressLine2) vPAddressLine2 = data.PatientData.AddressLine2;
            }

            if (data.Encounter) vIPOPNO = '' + data.Encounter.VisitIdentifier;
            if (data.Encounter) vDrName = '' + data.Encounter.DoctorName;
            if (data.Encounter.PatientGuarantor) {
                if (data.Encounter.PatientGuarantor.GuarantorName) vGuarantorName = '' + data.Encounter.PatientGuarantor.GuarantorName;
            }

            var dmPrintInput = {};
            dmPrintInput.header = {
                PatientName: vPTitle +
                    vPFirstName + ' ' + vPLastName,
                MRN: vMRN,
                Age: vAge,
                DOB: vDOB,
                FDOB: vFDOB,
                Gender: vGender,
                IPOPNO: vIPOPNO,
                DrName: vDrName,
                AgeGender: vAge + ' Y / ' + vGender,
                Address: vPAddressLine1 + ',' + vPAddressLine2
            };
            var TotalSalesAmount = 0;
            var TotalReturnAmount = 0;
            var TotalAmount = 0;
            var TinNo = '';
            var LicenseNo = '';

            dmPrintInput.PharmacyBills = [];
            var islno = 1;
            for (var index in data.PharmacyBillsDetails) {
                var PharmacyBill = data.PharmacyBillsDetails[index];
                var BillNumber = PharmacyBill.BillNumber;
                //var BillDateTime = PharmacyBill.BillDateTime;

                var BillDate = utl.Formatter.getDateString(PharmacyBill.BillDateTime);
                var BillDateTime = new Date(PharmacyBill.BillDateTime);
                var Minutes = BillDateTime.getMinutes();
                var Hours = BillDateTime.getHours();
                var Meridiem = 'AM';
                if (Hours > 12 || Hours == 12) {
                    Meridiem = 'PM';
                    Hours = Hours - 12;
                }
                if (Hours < 10) {
                    Hours = '0' + Hours;
                }
                if (Minutes < 10) {
                    Minutes = '0' + Minutes;
                }
                var BillTime = Hours + ':' + Minutes + ' ' + Meridiem;
                var BillDateWithTime = BillDate + ' ' + BillTime;


                var BillAmount = PharmacyBill.BillAmount.toFixed(2);
                var BillDiscount = PharmacyBill.BillDiscount.toFixed(2);
                var RoundOffValue = PharmacyBill.RoundOffValue.toFixed(2);
                var BillNetAmount = BillAmount - BillDiscount;
                BillNetAmount = Math.round(BillNetAmount);
                BillNetAmount = BillNetAmount.toFixed(2);
                var vBillDoctorName = PharmacyBill.DoctorName;
                var vBillDoctorId = PharmacyBill.DoctorId;
                var vUTitle = '';
                var vUFirstName = '';
                var vULastName = '';
                var vCTitle = '';
                var vCFirstName = '';
                var vCLastName = '';
                var vCreatedUser = '';

                TotalSalesAmount = TotalSalesAmount + PharmacyBill.BillAmount;
                if (TinNo == '' || TinNo == undefined || TinNo == null) {
                    TinNo = PharmacyBill.StoreMaster.TinNo;
                }
                if (LicenseNo == '' || LicenseNo == undefined || LicenseNo == null) {
                    LicenseNo = PharmacyBill.StoreMaster.LicenseNo;
                }

                if (vGuarantorName == null || vGuarantorName == '' || vGuarantorName == undefined) {
                    if (PharmacyBill.GuarantorMaster) {
                        if (PharmacyBill.GuarantorMaster.GuarantorName) vGuarantorName = '' + PharmacyBill.GuarantorMaster.GuarantorName;
                    }
                }

                if (vBillDoctorName == '' || vBillDoctorName == undefined || vBillDoctorName == null) {
                    if (PharmacyBill.User) {
                        if (PharmacyBill.User.Title) vUTitle = PharmacyBill.User.Title.Description;
                        if (PharmacyBill.User.FirstName) vUFirstName = PharmacyBill.User.FirstName;
                        if (PharmacyBill.User.LastName) vULastName = PharmacyBill.User.LastName;
                        vBillDoctorName = (vUTitle + '.' + vUFirstName + ' ' + vULastName);
                    }
                }
                if (PharmacyBill.CreatedUser) {
                    if (PharmacyBill.CreatedUser.Title) vCTitle = PharmacyBill.CreatedUser.Title.Description;
                    if (PharmacyBill.CreatedUser.FirstName) vCFirstName = PharmacyBill.CreatedUser.FirstName;
                    if (PharmacyBill.CreatedUser.LastName) vCLastName = PharmacyBill.CreatedUser.LastName;
                    vCreatedUser = vCTitle + '.' + vCFirstName + ' ' + vCLastName;
                }

                var SalesDetail = {
                    ispace: ' ',
                    slno: islno++,
                    BillNumber: BillNumber,
                    BillDateTime: BillDateTime,
                    BillAmount: BillAmount,
                    BillDiscount: BillDiscount,
                    RoundOffValue: RoundOffValue,
                    BillNetAmount: BillNetAmount,
                    BillDoctorName: vBillDoctorName,
                    BillDoctorId: vBillDoctorId,
                    CreatedUser: vCreatedUser,
                    BillDateWithTime: BillDateWithTime
                };

                dmPrintInput.PharmacyBills.push(SalesDetail);
            }

            dmPrintInput.PharmacyReturns = [];
            var IsDisplayReturns = true;
            var islno1 = 1;
            if (data.PharmacyReturnDetails.length > 0) {
                for (var index1 in data.PharmacyReturnDetails) {
                    var PharmacyReturn = data.PharmacyReturnDetails[index1];

                    var ReturnNumber = PharmacyReturn.ReturnNumber;
                    //var ReturnDateTime = PharmacyReturn.ReturnDateTime;

                    var ReturnDate = utl.Formatter.getDateString(PharmacyReturn.ReturnDateTime);
                    var ReturnDateTime = new Date(PharmacyReturn.ReturnDateTime);
                    var ReturnMinutes = ReturnDateTime.getMinutes();
                    var ReturnHours = ReturnDateTime.getHours();
                    var ReturnMeridiem = 'AM';
                    if (ReturnHours > 12 || ReturnHours == 12) {
                        ReturnMeridiem = 'PM';
                        ReturnHours = ReturnHours - 12;
                    }
                    if (ReturnHours < 10) {
                        ReturnHours = '0' + ReturnHours;
                    }
                    if (ReturnMinutes < 10) {
                        ReturnMinutes = '0' + ReturnMinutes;
                    }
                    var ReturnTime = ReturnHours + ':' + ReturnMinutes + ' ' + ReturnMeridiem;
                    var ReturnDateWithTime = ReturnDate + ' ' + ReturnTime;

                    var BillNumberAgainstReturn = PharmacyReturn.BillNumber;
                    //var BillDateTimeAgainstReturn = PharmacyReturn.BillDateTime;

                    var BillDateAgainstReturn = utl.Formatter.getDateString(PharmacyReturn.BillDateTime);
                    var BillDateTimeAgainstReturn = new Date(PharmacyReturn.BillDateTime);
                    var MinutesAgainstReturn = BillDateTimeAgainstReturn.getMinutes();
                    var HoursAgainstReturn = BillDateTimeAgainstReturn.getHours();
                    var MeridiemAgainstReturn = 'AM';
                    if (HoursAgainstReturn > 12 || HoursAgainstReturn == 12) {
                        MeridiemAgainstReturn = 'PM';
                        HoursAgainstReturn = HoursAgainstReturn - 12;
                    }
                    if (HoursAgainstReturn < 10) {
                        HoursAgainstReturn = '0' + HoursAgainstReturn;
                    }
                    if (MinutesAgainstReturn < 10) {
                        MinutesAgainstReturn = '0' + MinutesAgainstReturn;
                    }
                    var BillTimeAgainstReturn = HoursAgainstReturn + ':' + MinutesAgainstReturn + ' ' + MeridiemAgainstReturn;
                    var BillDateWithTimeAgainstReturn = BillDateAgainstReturn + ' ' + BillTimeAgainstReturn;

                    if (PharmacyReturn.ReturnAmount == 0 && PharmacyReturn.GrossAmount > 0) {
                        PharmacyReturn.ReturnAmount = PharmacyReturn.GrossAmount;
                    }

                    var ReturnAmount = PharmacyReturn.ReturnAmount.toFixed(2);
                    var DiscountAmount = PharmacyReturn.DiscountAmount.toFixed(2);
                    var RoundOffValue = PharmacyReturn.RoundOffValue.toFixed(2);
                    var ReturnNetAmount = ReturnAmount - DiscountAmount;
                    ReturnNetAmount = Math.round(ReturnNetAmount);
                    ReturnNetAmount = ReturnNetAmount.toFixed(2);
                    var vReturnDoctorId = PharmacyReturn.DoctorId;
                    var vReturnDoctorName = ''
                    var vReturnUTitle = '';
                    var vReturnUFirstName = '';
                    var vReturnULastName = '';
                    var vReturnCTitle = '';
                    var vReturnCFirstName = '';
                    var vReturnCLastName = '';
                    var vReturnCreatedUser = '';

                    TotalReturnAmount = TotalReturnAmount + PharmacyReturn.ReturnAmount;

                    if (PharmacyReturn.User) {
                        if (PharmacyReturn.User.Title) vReturnUTitle = PharmacyReturn.User.Title.Description;
                        if (PharmacyReturn.User.FirstName) vReturnUFirstName = PharmacyReturn.User.FirstName;
                        if (PharmacyReturn.User.LastName) vReturnULastName = PharmacyReturn.User.LastName;
                        vReturnDoctorName = (vReturnUTitle + '.' + vReturnUFirstName + ' ' + vReturnULastName);
                    }

                    if (PharmacyReturn.CreatedUser) {
                        if (PharmacyReturn.CreatedUser.Title) vReturnCTitle = PharmacyReturn.CreatedUser.Title.Description;
                        if (PharmacyReturn.CreatedUser.FirstName) vReturnCFirstName = PharmacyReturn.CreatedUser.FirstName;
                        if (PharmacyReturn.CreatedUser.LastName) vReturnCLastName = PharmacyReturn.CreatedUser.LastName;
                        vReturnCreatedUser = vReturnCTitle + '.' + vReturnCFirstName + ' ' + vReturnCLastName;
                    }

                    var ReturnDetail = {
                        ispace: ' ',
                        slno1: islno1++,
                        ReturnNumber: ReturnNumber,
                        ReturnDateTime: ReturnDateTime,
                        BillNumberAgainstReturn: BillNumberAgainstReturn,
                        BillDateTimeAgainstReturn: BillDateTimeAgainstReturn,
                        ReturnAmount: ReturnAmount,
                        DiscountAmount: DiscountAmount,
                        RoundOffValue: RoundOffValue,
                        ReturnNetAmount: ReturnNetAmount,
                        ReturnDoctorId: vReturnDoctorId,
                        vReturnDoctorName: vReturnDoctorName,
                        vReturnCreatedUser: vReturnCreatedUser,
                        ReturnDateWithTime: ReturnDateWithTime,
                        BillDateWithTimeAgainstReturn: BillDateWithTimeAgainstReturn
                    };

                    dmPrintInput.PharmacyReturns.push(ReturnDetail);
                }
            } else {
                IsDisplayReturns = false;
            }

            TotalSalesAmount = Math.round(TotalSalesAmount);
            TotalSalesAmount = TotalSalesAmount.toFixed(2);
            TotalReturnAmount = Math.round(TotalReturnAmount);
            TotalReturnAmount = TotalReturnAmount.toFixed(2);
            TotalAmount = TotalSalesAmount - TotalReturnAmount;
            TotalAmount = Math.round(TotalAmount);
            TotalAmount = TotalAmount.toFixed(2);

            dmPrintInput.summary = {
                TotalSalesAmount: TotalSalesAmount,
                TotalReturnAmount: TotalReturnAmount,
                TotalAmount: TotalAmount,
                IsDisplayReturns: IsDisplayReturns,
                TinNo: TinNo,
                LicenseNo: LicenseNo,
                GuarantorName: vGuarantorName
            };

            console.log('preparePrintDataForSalesWithReturn ends');
            return dmPrintInput;
        }

        /* Pharmacy dotmatrix print starts */
        $scope.dmPrint = function () {
            if ($scope.dmprintpreferences != 1) {
                utl.Alert.showErrorMsg('billing.pharmacy.preferencesetting.lbl');

                return false;
            } else {

                var selectedRows = getSelectionRows();
                for (var idx in selectedRows) {
                    var options = {
                        action: 'billing/patientbills/DMPrintPatientBills',
                        data: selectedRows[idx],
                        type: 'post',
                        onComplete: $scope.dmPrintCallback
                    };
                }
                utl.Http.doAction(options);
            }
        };

        $scope.dmPrintCallback = function (scope, data, options, hasError) {
            console.log(data);
            var dmPrintInput = preparePrintData(data);
            $scope.printPharmacyBillDetails(dmPrintInput);
        };

        function preparePrintData(data) {
            console.log('preparePrintData starts');
            var dmAllPrintInput = [];
            var selectedRows = getSelectionRows();
            for (var idx in selectedRows) {
                var currentBill = selectedRows[idx];
                var vIPOPNO = '';
                var vGST = '';
                var vPTitle = '';
                var vPFirstName = '';
                var vPLastName = '';
                var vUTitle = '';
                var vUFirstName = '';
                var vULastName = '';
                var vTinNo = '';
                var vMRN = '';
                var vAge = '';
                var vDOB = '';
                var vFDOB = '';
                var vGender = '';
                var vCFirstName = '';
                var vCLastName = '';
                var vCTitle = '';
                var vDrName = '';
                var vStoreheading1 = '';
                var vStoreheading2 = '';
                var vStoreheading3 = '';
                var vStoreheading4 = '';

                if (currentBill.Encounter) vIPOPNO = '' + currentBill.Encounter.VisitIdentifier;
                if (currentBill.Facility) vGST = '' + currentBill.Facility.GstNumber;



                if (currentBill.User) {
                    if (currentBill.User.Title) vUTitle = currentBill.User.Title.Description;
                    if (currentBill.User.FirstName) vUFirstName = currentBill.User.FirstName;
                    if (currentBill.User.LastName) vULastName = currentBill.User.LastName;
                    vDrName = (vUTitle + '.' + vUFirstName + ' ' + vULastName)
                }
                if (currentBill.CreatedUser) {
                    if (currentBill.CreatedUser.Title) vCTitle = currentBill.CreatedUser.Title.Description;
                    if (currentBill.CreatedUser.FirstName) vCFirstName = currentBill.CreatedUser.FirstName;
                    if (currentBill.CreatedUser.LastName) vCLastName = currentBill.CreatedUser.LastName;
                }
                if (currentBill.Patient) {
                    if (currentBill.Patient.Title) vPTitle = currentBill.Patient.Title.Description;
                    if (currentBill.Patient.FirstName) vPFirstName = currentBill.Patient.FirstName;
                    if (currentBill.Patient.LastName) vPLastName = currentBill.Patient.LastName;
                    if (currentBill.Patient.MRN) vMRN = currentBill.Patient.MRN;
                    if (currentBill.Patient.Age) vAge = '' + currentBill.Patient.Age;
                    if (currentBill.Patient.DOB) vDOB = '' + currentBill.Patient.DOB;
                    if (currentBill.Patient.DOB) vFDOB = '' + utl.Formatter.getDateTimeString(currentBill.Patient.DOB);
                    if (currentBill.Patient.Gender) vGender = '' + currentBill.Patient.Gender.Description;
                } else {
                    if (currentBill.Title)
                        vPTitle = currentBill.Title.Description;
                    vPFirstName = currentBill.PatientName;
                    if (currentBill.Age)
                        vAge = '' + currentBill.Age;
                    if (currentBill.Gender)
                        vGender = '' + currentBill.Gender.Description;
                    if (currentBill.DoctorName)
                        vDrName = '' + currentBill.DoctorName;
                }



                if (currentBill.StoreMaster) vTinNo = currentBill.StoreMaster.TinNo;


                var vPayTypeId = -1;

                if (currentBill.PatientPaymentDetails)
                    for (var idxpy in currentBill.PatientPaymentDetails)
                        vPayTypeId = currentBill.PatientPaymentDetails[idxpy].PaymentTypeId;

                if (data.PrintData.heading1)
                    vStoreheading1 = data.PrintData.heading1
                if (data.PrintData.heading2)
                    vStoreheading2 = data.PrintData.heading2
                if (data.PrintData.heading3)
                    vStoreheading3 = data.PrintData.heading3
                if (data.PrintData.heading4)
                    vStoreheading4 = data.PrintData.heading4

                var dmPrintInput = {};
                dmPrintInput.header = {
                    prescribedby: vDrName || '',
                    licenseno: '' + currentBill.StoreMaster.LicenseNo,
                    billno: '' + currentBill.BillNumber,
                    patientname: vPTitle + '.' +
                        vPFirstName + ' ' + vPLastName,
                    GstNo: vGST,
                    TinNo: vTinNo,
                    MRN: vMRN,
                    Age: vAge,
                    DOB: vDOB,
                    FDOB: vFDOB,
                    Gender: vGender,
                    IPOPNO: vIPOPNO,
                    billdate: utl.Formatter.getDateTimeString(currentBill.BillDateTime),
                    // addressline: currentBill.Patient.AddressLine1,
                    // state: currentBill.Patient.State,
                    // city: currentBill.Patient.City,
                    // pincode: '' + currentBill.Patient.Pincode || '',
                    totalamount: currentBill.BillAmount,
                    totDiscont: currentBill.BillDiscount,
                    totroundoff: currentBill.RoundOffValue,
                    totpaidamt: currentBill.PaidAmount,
                    billedby: vCTitle + '.' + vCFirstName + ' ' + vCLastName,
                    paytypeid: vPayTypeId || -1,
                    vStoreheading1: vStoreheading1,
                    vStoreheading2: vStoreheading2,
                    vStoreheading3: vStoreheading3,
                    vStoreheading4: vStoreheading4
                };

                dmPrintInput.lines = [];
                var islno = 1;
                for (var idx1 in currentBill.PatientBillDetails) {
                    var billDetail = currentBill.PatientBillDetails[idx1];
                    var expiryDate = billDetail.ExpiryDate ? utl.Formatter.formatDate(billDetail.ExpiryDate, 'MM/YY') : '';
                    var manu = billDetail.ManufacturerName;
                    if (manu && manu.length > 3) {
                        manu = manu.substring(0, 3);
                    }

                    var batchid = billDetail.BatchId;
                    if (batchid && batchid.length > 4) {
                        batchid = batchid.substring(0, 4);
                    }

                    var cgstamt = billDetail.CGstAmount.toFixed(2);
                    var sgstamt = billDetail.SGstAmount.toFixed(2);

                    var vHSN = '';
                    if (billDetail.ItemMaster)
                        if (billDetail.ItemMaster.ProductRegNo)
                            vHSN = '' + billDetail.ItemMaster.ProductRegNo;

                    var vSCH = '';
                    if (billDetail.ScheduleTypeDescription)
                        vSCH = billDetail.ScheduleTypeDescription;

                    var detail = {
                        ispace: ' ',
                        slno: islno++,
                        desc: billDetail.ItemName,
                        hsn: vHSN,
                        sch: vSCH,
                        batch: batchid,
                        exp: expiryDate,
                        qty: billDetail.Quantity,
                        mrp: billDetail.Rate.toFixed(2),
                        value: billDetail.NetAmountBeforeGST.toFixed(2),
                        cgstper: billDetail.CGstPercentage,
                        cgstamt: cgstamt,
                        sgstper: billDetail.SGstPercentage,
                        sgstamt: sgstamt,
                        totgst: (billDetail.CGstAmount + billDetail.SGstAmount),
                        amount: billDetail.Amount.toFixed(2),
                        mfr: manu,
                        netamount: billDetail.NetAmount.toFixed(2)
                    };

                    dmPrintInput.lines.push(detail);
                }

                dmAllPrintInput.push(dmPrintInput);
            }
            console.log('preparePrintData ends');
            return dmAllPrintInput;
        }
        /* Pharmacy dotmatrix print ends */

        $scope.getPatientInfo = function (scope, data, options, hasError) {
            $scope.selectedPatient = data;
            if ($scope.selectedPatient.Encounters.length > 0) {
                $scope.currentcontext.EncounterId = $scope.selectedPatient.Encounters[0].Id;
                $scope.item1.EncounterId = $scope.currentcontext.EncounterId;
                $scope.getEncounters();
            }

            //console.log($scope.selectedPatient.Encounters);

        }

        $scope.getPatient = function () {
            if ($scope.currentfilter.PatientId > 0) {
                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: {
                        Id: $scope.currentfilter.PatientId
                    },
                    type: 'post',
                    onComplete: $scope.getPatientInfo
                };

                utl.Http.doAction(options);
            }
        }
        // For Displaying Created User - Start Vidya
        $scope.getEncounterCallback = function (scope, res, options, hasError) {
            $scope.Encounter = res.Data[0];
            $scope.items = $scope.Encounter;
            console.log($scope.items);
            $scope.item1.DoctorId = $scope.items.DoctorId;
            $scope.item1.DoctorName = $scope.items.DoctorName;
            $scope.item1.PatientId = $scope.currentfilter.PatientId;
            $scope.item1.PatientName = $scope.items.Patient.FirstName;
            $scope.item1.PatientMrn = $scope.items.PatientMrn;
            $scope.items.DOA = $scope.Encounter.AdmissionDate;
            // if ($scope.Encounter.IsPharmacyClearance == true) {
            //     $scope.canShowDMPrintBtn = true;
            //     $scope.ShowPrintBtn = 1;
            // }
            $scope.getPharmacyBills();
            // if ($scope.maxadvancecash == 1) {
            //     $scope.getPrevAdvances();
            // }

            // vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getEncounters = function () {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.currentcontext.EncounterId
                }]
            };

            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getEncounterCallback
            };

            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            var InPatientSaleType = {
                Code: "Credit-InPatient",
                Id: 6,
                IsDefault: true,
                Language: null,
                Text: "Credit InPatient"
            }
            $scope.lookup["PharmacySaleType"].push(InPatientSaleType);
            //$scope.getPatient();
            //$scope.getEncounters();
        };

        $scope.HeaderDiscountValueChange = function () {
            $scope.IsHeaderDisc = true;
            $scope.currentfilter.TotalDueAmount = $scope.item.TotalDueAmount;
            if (!$scope.currentcontext.ReceiptAmt) {
                $scope.currentcontext.ReceiptAmt = 0;
            }
            if ($scope.currentfilter.DiscountModeId && $scope.currentfilter.DiscountModeId != -1) {
                // for (var idx in $scope.PatientBillDetails) {
                //     if ($scope.PatientBillDetails[idx].Status == 1) {
                //         $scope.PatientBillDetails[idx].DiscountAmount = 0;
                //         $scope.PatientBillDetails[idx].DiscountPercentage = 0;
                //         $scope.PatientBillDetails[idx].NetAmount = parseFloat(($scope.PatientBillDetails[idx].Quantity * $scope.PatientBillDetails[idx].MrPrice).toFixed(2));
                //     }
                // }
                // $scope.CalculateNetAmt();
                if ($scope.currentfilter.DiscountModeId == 1) {
                    $scope.currentfilter.TotalDueAmount = parseFloat($scope.currentfilter.TotalDueAmount) - parseFloat($scope.currentcontext.BillDiscount);
                    $scope.currentfilter.TotalDueAmount = parseFloat($scope.currentfilter.TotalDueAmount).toFixed(2);
                    $scope.currentcontext.ReceiptAmt = $scope.currentfilter.TotalDueAmount;
                    $scope.currentcontext.TotBalanceAmt = $scope.currentfilter.TotalDueAmount;
                    $scope.item1.BillDiscount = $scope.currentcontext.BillDiscount;
                }
                else {
                    var DiscountPercentage = parseFloat($scope.currentcontext.BillDiscount);
                    var discamt = parseFloat(((parseFloat(DiscountPercentage || 0) / 100) * $scope.currentfilter.TotalDueAmount).toFixed(2));
                    $scope.item1.DiscountPercentage = DiscountPercentage;
                    $scope.item1.BillDiscount = discamt;
                    $scope.currentfilter.TotalDueAmount = $scope.currentfilter.TotalDueAmount - discamt;
                    $scope.currentfilter.TotalDueAmount = parseFloat($scope.currentfilter.TotalDueAmount).toFixed(2);
                    $scope.currentcontext.ReceiptAmt = $scope.currentfilter.TotalDueAmount;
                    $scope.currentcontext.TotBalanceAmt = $scope.currentfilter.TotalDueAmount;
                }
                $scope.item1.BillAmount = $scope.currentfilter.TotalDueAmount;

                // $scope.updateReceiptAmt();
            } else {
                utl.Alert.showErrorMsg($translate.instant('billing.opbilling-list.discounttypemessage.lbl'));
                $scope.currentcontext.BillDiscount = 0;
            }
        };

        $scope.updateReceiptAmt = function () {
            // if (!$scope.item.GuarantorId) {
            //     utl.Alert.showErrorMsg($translate.instant('Please Select Insurance'));
            //     return;
            // } else {
            //     if ($scope.currentcontext.TotBalanceAmt !== 0.00) {
            //         if ($scope.currentcontext.id === 0 || $scope.item.PatientBillStatusId === 1) {
            //             $scope.currentcontext.ReceiptAmt = parseFloat($scope.item.Received) + parseFloat($scope.currentcontext.TotBalanceAmt);
            //             $scope.item.Received = $scope.currentcontext.ReceiptAmt;
            //         } else {
            //             $scope.currentcontext.ReceiptAmt = parseFloat($scope.currentcontext.ReceiptAmt) + parseFloat($scope.currentcontext.TotBalanceAmt);
            //             $scope.item.Received = ($scope.currentcontext.TotNetAmount);
            //         }
            //         $scope.currentcontext.ReceiptAmt = parseFloat($scope.currentcontext.ReceiptAmt).toFixed(2);
            //         $scope.currentcontext.ReceiptAmt = parseFloat($scope.currentcontext.ReceiptAmt);
            //     }
            //     $scope.currentcontext.TotBalanceAmt = 0.00;
            // }
        };


        // $scope.BillDiscountModechange = function(selecteditem) {
        //     if (!$scope.currentcontext.ReceiptAmt) {
        //         $scope.currentcontext.ReceiptAmt = 0;
        //     }
        //     $scope.currentcontext.DiscountModeValue = 0;
        //     var LastIndex = $scope.PatientBillDetails.length - 1;
        //     if (selecteditem.Id > 0) {
        //         for (var idx in $scope.PatientBillDetails) {
        //             $scope.PatientBillDetails[idx].RdoDiscountMode = true;
        //             $scope.PatientBillDetails[idx].RdoDiscount = true;
        //             $scope.PatientBillDetails[idx].DiscountModeId = -1;
        //             $scope.PatientBillDetails[idx].DiscountAmount = 0;
        //             $scope.ItemwiseDiscountModechange($scope.PatientBillDetails[idx]);
        //         }
        //     } else {
        //         for (var idx1 in $scope.PatientBillDetails) {
        //             if (idx1 != LastIndex) {
        //                 $scope.PatientBillDetails[idx1].RdoDiscountMode = false;
        //                 $scope.PatientBillDetails[idx1].RdoDiscount = false;
        //             }
        //         }
        //     }
        //     $scope.CalculateNetAmt();
        // };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "PharmacySaleType"
            },
            {
                "Key": "PrivateDueApprover"
            },
            {
                "Key": "PaymentType"
            },
            {
                "Key": "SettlementType"
            },
            {
                "Key": "Bank"
            },
            {
                "Key": "DiscountMode"
            },
            {
                "Key": "CardType"
            },
            ];
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };
        $timeout(function () {
            removeFloatingNav();
        }, 1000);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.getPharmacyPrintPreference = function () {
            $scope.dmprintpreferences =
                utl.FacilitySetting.getFacilitySettingValue('dmprint', 'pharmacydmprintenable');

            $scope.dmprintpreferences =
                utl.FacilitySetting.getFacilitySettingValue('print', 'laserprintenable');

            if ($scope.dmprintpreferences)
                if ($scope.dmprintpreferences <= 0)
                    $('#btndmprint').hide();


            if ($scope.printpreferences)
                if ($scope.printpreferences <= 0)
                    $('#btnprint').hide();

        };

        $scope.getPharmacyPrintPreference();
        $scope.initLookup();
    }

    pharmacyclearanceFormController.$inject = ['$rootScope', '$timeout', '$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();