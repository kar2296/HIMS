(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('IPBillModificationFormController', IPBillModificationFormController);

    function IPBillModificationFormController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        var savehitcompleted = 0;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));
        $scope.SelectedIndex = -1;
        $scope.BillRefreshCount = 0;

        $scope.FacilityBlockPendingOrders = false;
        $scope.PendingOrderTestNames = '';

        $scope.BillLockDetail = {};
        $scope.selectedPatient = {};

        $scope.BillCompleted = 0;

        $scope.item = {};
        $scope.lookup = {};
        $scope.item.doadate = utl.Formatter.getCurrentDate();
        $scope.item.PatientId = -1;
        $scope.item.PaymentTypeId = 1;
        $scope.item.ReceiptTypeId = -1;
        $scope.item.GuarantorDueId = -1;
        $scope.item.FamilyLinkId = -1;

        $scope.currentcontext = {};
        // $scope.currentcontext.CanApprove = utl.Privilege.hasPrivilege('CanApprove');
        // $scope.currentcontext.CanPrint = utl.Privilege.hasPrivilege('CanPrint');
        // $scope.currentcontext.CanViewReceipt = utl.Privilege.hasPrivilege('CanViewReceipt');
        // $scope.currentcontext.CanDischarge = utl.Privilege.hasPrivilege('CanDischarge');
        // $scope.currentcontext.CanIPSPreviousOrder = utl.Privilege.hasPrivilege('CanIPSPreviousOrder');
        // $scope.currentcontext.CanDue = utl.Privilege.hasPrivilege('CanDue');
        // $scope.currentcontext.CanBillLock = utl.Privilege.hasPrivilege('CanBillLock');
        // $scope.currentcontext.CanPharmacyPrint = utl.Privilege.hasPrivilege('CanPharmacyPrint');
        // $scope.currentcontext.CanInsurancePrint = utl.Privilege.hasPrivilege('CanInsurancePrint');
        // $scope.currentcontext.CanFinalize = utl.Privilege.hasPrivilege('CanFinalize');
        // $scope.currentcontext.CanCancel = utl.Privilege.hasPrivilege('CanCancel');
        // $scope.currentcontext.CanOPPharmacy = utl.Privilege.hasPrivilege('CanOPPharmacy');
        $scope.currentcontext.EncounterId = parseInt($stateParams.eid);
        $scope.currentcontext.PatientId = parseInt($stateParams.patientid);
        $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        $scope.currentcontext.id = 0;
        $scope.currentcontext.RdoBillDiscount = false;
        $scope.currentcontext.RdoBillDiscountMode = false;
        $scope.currentcontext.Rdobilldate = true;
        $scope.currentcontext.BillDiscountTypeId = -1;
        $scope.currentcontext.BillDiscount = 0;
        $scope.currentcontext.BillDiscountModeId = -1;
        $scope.currentcontext.ApprovedById = -1;
        $scope.currentcontext.PaymentTypeId = 1;
        $scope.currentcontext.TotNetAmount = 0;
        $scope.currentcontext.TotDueAmount = 0;
        $scope.currentcontext.TotDiscountAmt = 0;
        $scope.currentcontext.PaidAmt = 0;
        $scope.currentcontext.ReceiptAmt = 0;
        $scope.currentcontext.TotBalanceAmt = 0;
        $scope.currentcontext.RoundOffValue = 0;
        $scope.currentcontext.FSTypeId = 1;
        $scope.currentcontext.FamilyLinkId = 0;
        $scope.currentcontext.TransferEncounterId = 0;
        $scope.currentcontext.TransferPatientId = 0;
        $scope.currentcontext.TransferAmount = 0;
        $scope.currentcontext.InsApprovalAmt = 0;
        $scope.currentcontext.IsEstimatedBill = false;
        $scope.currentcontext.EstimatedBillDist = 0;
        $scope.currentcontext.EstimatedBillDistTypeId = 1;
        $scope.currentcontext.TotalReceiptAmount = 0;

        $scope.currentfilter = {};
        $scope.currentfilter.billdate = '';
        $scope.currentfilter.billnumber = '';
        $scope.currentfilter.PatientId = -1;
        $scope.currentfilter.patientname = '';
        $scope.currentfilter.DoctorId = -1;
        $scope.currentfilter.DepartmentId = -1;
        $scope.currentfilter.PayScenarioId = -1;
        $scope.currentfilter.GuarantorName = '';
        $scope.currentfilter.ServiceRateCategoryId = -1;
        $scope.currentfilter.ServiceRateCategoryName = '';
        $scope.currentfilter.billdate = utl.Formatter.getCurrentDate();
        $scope.PatientBillDetails = [];
        $scope.PatientPaymentDetails = [];

        $scope.filterbillnr = $stateParams.filterbillnr;
        $scope.filterbilldt = $stateParams.filterbilldt;
        $scope.filtermrn = $stateParams.filtermrn;

        $scope.isSaving = false;
        $scope.outstanding = false;

        $scope.toggleShowDetails = function () { };

        $scope.fillDefaultValues = function () {
            $scope.currentcontext.PaymentTypeId = 1;
        };

        if (!$scope.currentcontext.id || $scope.currentcontext.id === 0) {
            $scope.fillDefaultValues();
        }

        $scope.GetPatientBillPackageSummaryDetails = function () {
            var options = {
                action: 'billing/PatientBillPackageSummary/GetPatientBillPackageSummaryDetails',
                data: {
                    Data: {
                        EncounterId: $scope.currentcontext.EncounterId
                    }
                },
                type: 'post',
                onComplete: $scope.GetPatientBillSummaryCallback
            };
            utl.Http.doAction(options);
        };

        $scope.RefershSplitDetailsCallback = function (scope, res, options, hasError) {
            $scope.ActiveBillsCount = 0;
            if (res.Refreshed && res.IsPackageAssigned) {
                $scope.GetPatientBillPackageSummaryDetails();
            } else if (res.Refreshed) {
                $scope.GetPatientBillSummary();
                $scope.FacilityBlockPendingOrders = utl.FacilitySetting.getFacilitySettingValue('billing', 'pendingordersblock');
                $scope.PendingOrderTestNames = '';
                if ($scope.FacilityBlockPendingOrders) {
                    $scope.getPendingOrderList();
                    $scope.getPendingDispensesList();
                    $scope.getPendingDispensesReturnList();
                }
            }
        };

        $scope.RefershSplitDetails = function () {
            var options = {
                action: 'billing/patientbills/PopulateIPBillsWithoutAutoCharge',
                data: {
                    Id: $scope.currentcontext.EncounterId
                },
                type: 'post',
                onComplete: $scope.RefershSplitDetailsCallback
            };

            utl.Http.doAction(options);
        };

        $scope.openModal = function (appKey, stateParams, callBack) {
            var callBackFunction = null;
            if (callBack) {
                callBackFunction = callBack;
            } else {
                callBackFunction = $scope.getItem;
            }
            utl.Modal.open(appKey, {
                params: stateParams,
                confirmCallback: callBack
            });
        };

        $scope.discharge = function (data) {
            if (data == 6) {
                $scope.candisabledischargebtn = true;
                $scope.getEncounter();
            }
        };

        $scope.getPhysicalDischargeCallback = function (scope, data, options, hasError) {
            $scope.openModal('app.physicalpatient', {
                id: data,
                EncounterId: $scope.currentcontext.EncounterId || 0,
                Encounter: $scope.EncounterInfo || {},
                type: 1
            }, $scope.discharge);
        };

        $scope.patientDischarge = function () {
            var options = {
                action: 'IPManagement/PatientDischargeEvent/GetPatientDischargeEventByEncounterId',
                data: {
                    Id: $scope.currentcontext.EncounterId
                },
                type: 'post',
                onComplete: $scope.getPhysicalDischargeCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getPatient = function () {
            if ($scope.item.PatientId > 0) {
                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: { Id: $scope.currentcontext.PatientId },
                    type: 'post',
                    onComplete: $scope.getPatientCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getPatientCallback = function (scope, data, options, hasError) {
            $scope.currentcontext.TotDueAmount = data.OutStandingAmount;
        };

        $scope.getEncounterCallback = function (scope, res, options, hasError) {
            if (res && res.Data && res.Data.length > 0) {
                var Encounter = res.Data[0];
                $scope.EncounterInfo = res.Data[0];
                $scope.selectedPatient = $scope.EncounterInfo.Patient;
                $scope.item.DoctorId = Encounter.DoctorId;
                $scope.item.DOA = Encounter.AdmissionDate;
                $scope.item.DOD = Encounter.DischargeDate;
                $scope.item.WardId = Encounter.WardId;
                $scope.item.BedId = Encounter.BedId;
                $scope.item.DoctorId = Encounter.DoctorId;
                $scope.item.TeamId = Encounter.TeamId;
                $scope.item.PatientId = Encounter.PatientId;
                $scope.currentcontext.PatientId = Encounter.PatientId;
                $scope.item.GuarantorId = Encounter.GuarantorId;
                $scope.item.GuarantorTypeId = Encounter.GuarantorTypeId;
                $scope.item.SurgeryDate = Encounter.SurgeryDate;
                $scope.item.AdmissionStatusId = Encounter.AdmissionStatusId;
                $scope.item.DepartmentId = Encounter.DepartmentId;
                $scope.item.ReferralId = Encounter.ReferralId || 0;
                $scope.item.ReferralName = Encounter.ReferralName || '';
                if ($scope.currentcontext.TotBalanceAmt < 0) {
                    $scope.currentcontext.FSTypeId = 2;
                } else if ($scope.item.GuarantorTypeId != 1) {
                    $scope.currentcontext.FSTypeId = 3;
                } else {
                    $scope.currentcontext.FSTypeId = 1;
                }

                $scope.item.IsBillLock = false;
                $scope.currentcontext.IsEstimatedBill = Encounter.IsEstimatedBill;
                $scope.currentcontext.EstimatedBillDist = Encounter.EstimatedBillDist;
                $scope.currentcontext.EstimatedBillDistTypeId = Encounter.EstimatedBillDistTypeId;
                $scope.getPatient();
                $scope.loadPatientGuarantors();
                $scope.loadEncounterGuarantor();
                $scope.getBillLockDetails();
            }
        };

        $scope.getEncounter = function () {
            if ($scope.currentcontext.EncounterId) {
                var inputData = {
                    Params: [
                        { Key: 0, Value: $scope.currentcontext.EncounterId },
                    ],
                    PageContext: {
                        PageSize: 1,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'Visit/Visit/GetEncounters',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getEncounterCallback
                };

                utl.Http.doAction(options);

            }
        };



        $scope.GetPatientBillSummaryCallback = function (scope, res, options, hasError) {
            $scope.currentcontext.TotalRefundAmount = 0;
            $scope.currentcontext.TotalReceiptAmount = 0;
            $scope.currentcontext.TotalCNAmount = 0;
            if (res.BillInfo && res.BillInfo.Data.length > 0) {
                $scope.ActiveBillsCount = res.BillInfo.Data.length;
                res.BillInfo.Data.forEach((val, idx) => {
                    var GroupGrossAmount = 0;
                    var GroupDiscountAmount = 0;
                    var GroupNetAmount = 0;
                    var GroupSplitGrossAmount = 0;
                    var GroupSplitDiscountAmount = 0;
                    var GroupSplitNetAmount = 0;
                    if (!$scope.EncounterInfo.IsPackageAssigned) {
                        val.PatientBillSplitDetails.forEach((bill, index) => {
                            GroupGrossAmount += isNaN(parseFloat(bill.ItemAmount)) ? 0 : parseFloat(bill.ItemAmount);
                            GroupDiscountAmount += isNaN(parseFloat(bill.ItemDiscount)) ? 0 : parseFloat(bill.ItemDiscount);

                            GroupSplitGrossAmount += isNaN(parseFloat(bill.SplitItemAmount)) ? 0 : parseFloat(bill.SplitItemAmount);
                            GroupSplitDiscountAmount += isNaN(parseFloat(bill.SplitItemDiscount)) ? 0 : parseFloat(bill.SplitItemDiscount);
                        });
                    }
                    else {
                        $scope.item.PackageDetails = res.BillInfo.Data[0].PackageName;
                        $scope.item.PackageAmount = isNaN(parseFloat(res.PackageInfo.Data[0].PackageAmount))
                            ? 0 : parseFloat(res.PackageInfo.Data[0].PackageAmount);
                        GroupGrossAmount = isNaN(parseFloat(val.PackageAmount)) ? 0 : parseFloat(val.PackageAmount);
                        GroupSplitGrossAmount += isNaN(parseFloat(val.ExclusionAmount)) ? 0 : parseFloat(val.ExclusionAmount);
                    }
                    GroupNetAmount = GroupGrossAmount - GroupDiscountAmount;
                    GroupSplitNetAmount = GroupSplitGrossAmount - GroupSplitDiscountAmount;

                    val.GroupGrossAmount = GroupGrossAmount;
                    val.GroupDiscountAmount = GroupDiscountAmount;
                    val.GroupNetAmount = GroupNetAmount;

                    val.GroupSplitGrossAmount = GroupSplitGrossAmount;
                    val.GroupSplitDiscountAmount = GroupSplitDiscountAmount;
                    val.GroupSplitNetAmount = GroupSplitNetAmount;
                });
                res.BillInfo.Data.sort($scope.custom_sort);
                $scope.PatientBillDetails = res.BillInfo.Data;
                if (res.PRFundInfo && res.PRFundInfo.Data.length > 0) {
                    var refundAmount = 0;
                    $scope.refundDetails = res.PRFundInfo.Data;
                    $scope.refundDetails.forEach((val, idx) => {
                        refundAmount += isNaN(parseFloat(val.RefundAmount)) ? 0 : parseFloat(val.RefundAmount);
                    });
                    $scope.currentcontext.TotalRefundAmount = refundAmount;
                }

                if (res.ReceiptInfo && res.ReceiptInfo.Data.length > 0) {
                    var receiptAmount = 0;
                    $scope.ReceiptDetails = res.ReceiptInfo.Data;
                    $scope.ReceiptDetails.forEach((val, idx) => {
                        if (val.ReceiptStatusId == 1)
                            receiptAmount += isNaN(parseFloat(val.AmountPaid)) ? 0 : parseFloat(val.AmountPaid);
                    });
                    $scope.currentcontext.TotalReceiptAmount = receiptAmount;
                }

                if (res.AdjustmentInfo && res.AdjustmentInfo.Data.length > 0) {
                    var adjAmount = 0;
                    $scope.AdjustmentDetails = res.AdjustmentInfo.Data;
                    $scope.AdjustmentDetails.forEach((val, idx) => {
                        if (val.ReceiptStatusId == 1)
                        adjAmount += isNaN(parseFloat(val.AmountPaid)) ? 0 : parseFloat(val.AmountPaid);
                    });
                    $scope.currentcontext.TotalReceiptAmount += adjAmount;
                }

                $scope.isFinalized = false;

                if (res.FinalBillInfo && res.FinalBillInfo.Id > 0) {
                    $scope.FinalBillInfo = res.FinalBillInfo;
                    $scope.isFinalized = true;
                    $scope.item.PatientBillStatus = $scope.FinalBillInfo.PatientBillStatus.Description;
                    $scope.item.PatientBillId = $scope.FinalBillInfo.Id;
                    $scope.item.BillDateTime = $scope.FinalBillInfo.BillDateTime;
                    $scope.item.PatientBillStatusId = $scope.FinalBillInfo.PatientBillStatusId;
                    $scope.currentcontext.PaidAmt = $scope.FinalBillInfo.PaidAmount;
                    $scope.item.Id = $scope.FinalBillInfo.Id;
                    $scope.currentcontext.BillDiscount = $scope.FinalBillInfo.BillDiscount;
                    $scope.currentcontext.DiscountApprovedBy = $scope.FinalBillInfo.DiscountApprovedBy;
                    $scope.currentcontext.Comments = $scope.FinalBillInfo.Comments;
                    $scope.currentfilter.DiscountModeId = $scope.FinalBillInfo.BillDiscountModeId;
                    $scope.currentcontext.TotalRefundAmount = $scope.FinalBillInfo.RefundAmount;
                    $scope.currentcontext.FSTypeId = $scope.FinalBillInfo.FSTypeId;
                    $scope.currentcontext.FamilyLinkId = $scope.FinalBillInfo.FamilyLinkId;
                    $scope.currentcontext.TransferEncounterId = $scope.FinalBillInfo.TransferEncounterId;
                    $scope.currentcontext.TransferPatientId = $scope.FinalBillInfo.TransferPatientId;
                    $scope.currentcontext.TransferAmount = $scope.FinalBillInfo.TransferAmount;
                    $scope.currentcontext.SelfCreditApprovedBy = $scope.FinalBillInfo.PrivateDueId;
                    $scope.currentcontext.TDSAmount = $scope.FinalBillInfo.TDSAmount;
                    $scope.currentcontext.Disallowed = $scope.FinalBillInfo.Disallowed;
                    if ($scope.FinalBillInfo.PrivateDueId > 0) {
                        $scope.currentcontext.isSelfGuarantor = true;
                    }
                    $scope.item.GuarantorDueId = $scope.FinalBillInfo.GuarantorDueId;
                    $scope.item.FamilyLinkId = $scope.FinalBillInfo.FamilyLinkId;
                    $scope.item.TransferEncounterId = $scope.FinalBillInfo.TransferEncounterId;
                    $scope.item.TransferPatientId = $scope.FinalBillInfo.TransferPatientId;
                    $scope.item.TransferAmount = $scope.FinalBillInfo.TransferAmount;
                    $scope.HidePrintBtn = false;
                    $scope.canChangeFSType = false;
                    $scope.canShowCancelBtn = true;
                    $scope.item.isCompleted = false;
                } else {
                    $scope.HidePrintBtn = true;
                    $scope.canShowCancelBtn = false;
                }
                $scope.CalculateNetAmt();
            } else {
                $scope.BillRefreshCount++;
                if ($scope.BillRefreshCount < 2) {
                    if (!$scope.item.IsBillLock)
                        $scope.RefershSplitDetails();
                } else
                    $state.go('app.ipbillingtab.billdetails');
            }

            if ($scope.BillCompleted == 1) {
                if ($scope.item.PatientBillStatusId == 3) {
                    if ($scope.item.GuarantorTypeId == 1) $scope.print();
                    else $scope.print5();
                }
            }
        };

        $scope.GetPatientBillSummary = function () {
            var options = {
                action: 'billing/PatientBillSummary/GetPatientBillSummaryDetails',
                data: {
                    Data: {
                        EncounterId: $scope.currentcontext.EncounterId
                    }
                },
                type: 'post',
                onComplete: $scope.GetPatientBillSummaryCallback
            };
            utl.Http.doAction(options);
        };

        $scope.GuarantorChange = function (SelectedGuarantor) {
            $scope.currentfilter.GuarantorName = SelectedGuarantor.Text;
            $scope.item.GuarantorTypeId = SelectedGuarantor.GuarantorTypeId;
            $scope.clear();
        };

        $scope.ServiceRateCatChange = function (SelectedSerRateCat) {
            $scope.currentfilter.ServiceRateCategoryId = SelectedSerRateCat.Id;
            $scope.currentfilter.ServiceRateCategoryName = SelectedSerRateCat.Text;
            $scope.clear();
        };

        $scope.Bedoccupancy = function () {
            if ($scope.item.PatientId > 0) {
                utl.Modal.open('app.bedoccupancyhistory', {
                    params: {
                        pid: $scope.item.PatientId
                    },
                    confirmCallback: $scope.getList
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('admission.previous-admi-nopatient-msg.lbl'));
            }
        };

        $scope.applyVisibilityRules = function () {
            // Draft
            if ($scope.item.PatientBillStatusId != 2 || $scope.item.PatientBillStatusId != 3) {
                $scope.canShowPrescribeBtn = true;
                $scope.canShowPrescribeOrderBtn = true;
                $scope.canShowClearBtn = true;
                $scope.canShowCancelBtn = true;
                $scope.canShowViewReceipt = true;
            }
            // Cancelled
            if ($scope.item.PatientBillStatusId == 2) {
                $scope.canShowPrescribeBtn = false;
                $scope.canShowPrescribeOrderBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.canShowViewReceipt = true;
            }
            // Completed
            if ($scope.item.PatientBillStatusId == 3) {
                $scope.canShowSaveBtn = true;
                $scope.canShowPrescribeBtn = false;
                $scope.canShowPrescribeOrderBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.canShowViewReceipt = true;
            }
        };

        $scope.findissues = function () {
            utl.Modal.open('app.pharmacyreturn-findissues', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.findreturns = function () {
            utl.Modal.open('app.pharmacyreturn-findreturn', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.lockctrl = function () {
            if ($scope.ActiveBillsCount === 0) {
                utl.Alert.showErrorMsg($translate.instant('billing.summary.cancelledbillalert.lbl'));
                return false;
            }
            utl.Modal.open('app.billock', {
                params: {
                    eid: $scope.currentcontext.EncounterId,
                    islocked: $scope.item.IsBillLock,
                    lockuser: $scope.BillLockDetail.LockedBy || null
                },
                confirmCallback: $scope.LockReleaseBill
            });
        };

        $scope.ManageEstimatedBillCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg('Success');
        };

        $scope.EstimatedBill = function () {
            if ($scope.ActiveBillsCount === 0) {
                utl.Alert.showErrorMsg($translate.instant('billing.summary.cancelledbillalert.lbl'));
                return false;
            }
            let Data = {
                Id: $scope.currentcontext.EncounterId,
                IsEstimatedBill: $scope.currentcontext.IsEstimatedBill
            };
            if ($scope.currentcontext.EncounterId > 0) {
                var options = {
                    action: 'Visit/Visit/UpdateEncounter',
                    data: { Data },
                    type: 'post',
                    onComplete: $scope.ManageEstimatedBillCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.Bedoccupancy = function () {
            if ($scope.item.PatientId > 0) {
                utl.Modal.open('app.bedoccupancyhistory', {
                    params: {
                        pid: $scope.item.PatientId
                    },
                    confirmCallback: $scope.getList
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('admission.previous-admi-nopatient-msg.lbl'));
            }
        };

        $scope.moneysplit = function () {
            utl.Modal.open('app.moneysplit', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.DiscountModeChange = function () {
            $scope.currentcontext.BillDiscount = 0;
            $scope.CalculateNetAmt();
        };

        $scope.DiscountChange = function () {
            if ($scope.currentfilter.DiscountModeId && $scope.currentfilter.DiscountModeId != -1) {
                $scope.CalculateNetAmt();
            } else {
                $scope.currentcontext.BillDiscount = 0;
                utl.Alert.showErrorMsg($translate.instant('billing.opbilling-list.discounttypemessage.lbl'));
            }
        };

        $scope.ResetFinalSettlementList = function() {
            if ($scope.currentcontext.TotBalanceAmt < 0) {
                $scope.lookup["SettlementType"] = [];
                for (var setid = 1; setid < 3; setid++) {
                    if (setid == 1) {
                        var Settlement = {
                            Code: "Refund",
                            Id: 2,
                            IsDefault: false,
                            Language: null,
                            ObjectTypeId: null,
                            Text: "Refund"
                        };
                    } else {
                        var Settlement = {
                            Code: "TobeRefunded",
                            Id: 4,
                            IsDefault: false,
                            Language: null,
                            ObjectTypeId: null,
                            Text: "To be Refunded"
                        };
                    }
                    $scope.lookup["SettlementType"].push(Settlement);
                }
                $scope.currentcontext.FSTypeId = 2;
            } else {
                $scope.lookup["SettlementType"] = [];
                for (var setid = 1; setid < 4; setid++) {
                    if (setid == 1) {
                        var Settlement = {
                            Code: "Receipt",
                            Id: 1,
                            IsDefault: false,
                            Language: null,
                            ObjectTypeId: null,
                            Text: "Receipt"
                        };
                    } else if (setid == 3) {
                        var Settlement = {
                            Code: "CreditVoucher",
                            Id: 3,
                            IsDefault: false,
                            Language: null,
                            ObjectTypeId: null,
                            Text: "Credit Voucher"
                        };
                    } else {
                        var Settlement = {
                            Code: "BillTransfer",
                            Id: 5,
                            IsDefault: false,
                            Language: null,
                            ObjectTypeId: null,
                            Text: "Bill Transfer"
                        };
                    }

                    $scope.lookup["SettlementType"].push(Settlement);
                }
                if ($scope.item.GuarantorTypeId == 1) {
                    $scope.currentcontext.FSTypeId = 1;
                }
            }
        }

        $scope.CalculateNetAmt = function () {
            var itemwiseGrossAmt = 0;
            var itemwiseNetAmt = 0;
            var itemwiseDiscountAmt = 0;
            var SplitItemGrossAmt = 0;
            var SplitItemDiscountAmt = 0;
            var SplitItemNetAmount = 0;
            $scope.PatientBillDetails.forEach((val, idx) => {
                var itemnetAmount = 0;
                var itemGrossAmount = 0;
                var itemDiscountAmount = 0;

                var splititemGrossAmt = 0;
                var splititemDiscountAmt = 0;
                var splititemNetAmount = 0;

                if (val.Status == 1) {
                    if (!$scope.EncounterInfo.IsPackageAssigned) {
                        val.PatientBillSplitDetails.forEach((interVal, interIdx) => {
                            var splitDetails = interVal;
                            itemGrossAmount = isNaN(parseFloat(splitDetails.ItemAmount)) ? 0 : parseFloat(splitDetails.ItemAmount);
                            itemDiscountAmount = isNaN(parseFloat(splitDetails.ItemDiscount)) ? 0 : parseFloat(splitDetails.ItemDiscount);

                            splititemGrossAmt = isNaN(parseFloat(splitDetails.SplitItemAmount)) ? 0 : parseFloat(splitDetails.SplitItemAmount);
                            splititemDiscountAmt = isNaN(parseFloat(splitDetails.SplitItemDiscount)) ? 0 : parseFloat(splitDetails.SplitItemDiscount);

                            itemwiseGrossAmt += itemGrossAmount;
                            itemwiseDiscountAmt += itemDiscountAmount;

                            SplitItemGrossAmt += splititemGrossAmt;
                            SplitItemDiscountAmt += splititemDiscountAmt;
                        });
                    }
                    else {
                        itemGrossAmount = isNaN(parseFloat(val.GroupGrossAmount)) ? 0 : parseFloat(val.GroupGrossAmount);
                        splititemGrossAmt = isNaN(parseFloat(val.ExclusionAmount)) ? 0 : parseFloat(val.ExclusionAmount);
                        itemwiseGrossAmt += itemGrossAmount;
                        itemwiseDiscountAmt += itemDiscountAmount;

                        SplitItemGrossAmt += splititemGrossAmt;
                        SplitItemDiscountAmt += splititemDiscountAmt;
                        if ($scope.item.PackageAmount && parseFloat($scope.item.PackageAmount) > 0)
                            itemwiseGrossAmt = $scope.item.PackageAmount;
                    }
                }
            });

            var PaidAmount = parseFloat($scope.currentcontext.TotalReceiptAmount);
            if ($scope.FinalBillInfo && $scope.FinalBillInfo.Id > 0)
                $scope.currentcontext.TotPaidAmount = $scope.currentcontext.PaidAmt;
            else
                $scope.currentcontext.TotPaidAmount = (!$scope.currentcontext.PaidAmt) ? PaidAmount : parseFloat($scope.currentcontext.PaidAmt) + PaidAmount;


            $scope.item.GrossAmount = itemwiseGrossAmt;
            $scope.item.DiscountAmount = itemwiseDiscountAmt;
            $scope.item.NetAmount = itemwiseGrossAmt - itemwiseDiscountAmt;

            $scope.item.SplitGrossAmount = SplitItemGrossAmt;
            $scope.item.SplitDiscountAmount = SplitItemDiscountAmt;
            $scope.item.SplitNetAmount = SplitItemGrossAmt - SplitItemDiscountAmt;

            $scope.currentcontext.TotGrossAmount = 0;
            $scope.currentcontext.TotDiscAmount = 0;
            $scope.currentcontext.TotRefundAmount = 0;
            $scope.currentcontext.TotNetAmount = 0;
            $scope.currentcontext.TotBalanceAmt = 0;

            $scope.currentcontext.ReceiptAmt = (!$scope.currentcontext.ReceiptAmt) ? 0 : $scope.currentcontext.ReceiptAmt;
            if ($scope.currentcontext.TotalRefundAmount !== null && $scope.currentcontext.TotalRefundAmount !== 'NaN') {
                $scope.currentcontext.TotRefundAmount = parseFloat($scope.currentcontext.TotalRefundAmount);
            }
            $scope.currentcontext.TotGrossAmount = $scope.item.GrossAmount + $scope.item.SplitGrossAmount;
            if ($scope.currentcontext.BillDiscount > 0) {
                if ($scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 2) {
                    $scope.currentcontext.TotDiscAmount = (parseFloat($scope.currentcontext.BillDiscount) / 100 * $scope.currentcontext.TotGrossAmount);
                } else if ($scope.currentfilter.DiscountModeId == 1) {
                    $scope.currentcontext.TotDiscAmount = parseFloat($scope.currentcontext.BillDiscount);
                }
                if (!$scope.FinalBillInfo)
                    $scope.currentcontext.TotDiscAmount = $scope.currentcontext.TotDiscAmount + itemwiseDiscountAmt + SplitItemDiscountAmt;
            } else if (itemwiseDiscountAmt > 0 || SplitItemDiscountAmt > 0) {
                $scope.currentcontext.TotDiscAmount = itemwiseDiscountAmt + SplitItemDiscountAmt;
            }

            $scope.currentcontext.TotNetAmount = parseFloat($scope.currentcontext.TotGrossAmount) - parseFloat($scope.currentcontext.TotDiscAmount);

            if (isNaN($scope.currentcontext.TotNetAmount)) $scope.currentcontext.TotNetAmount = 0;
            if (isNaN($scope.currentcontext.ReceiptAmt)) $scope.currentcontext.ReceiptAmt = 0;
            if (isNaN($scope.currentcontext.TotPaidAmount)) $scope.currentcontext.TotPaidAmount = 0;
            if (isNaN($scope.currentcontext.TotRefundAmount)) $scope.currentcontext.TotRefundAmount = 0;


            $scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.TotNetAmount)
                - parseFloat($scope.currentcontext.ReceiptAmt)
                - (parseFloat($scope.currentcontext.TotPaidAmount)
                    - parseFloat($scope.currentcontext.TotRefundAmount));

            var billBalance = parseFloat($scope.currentcontext.TotNetAmount) - (parseFloat($scope.currentcontext.TotPaidAmount) - parseFloat($scope.currentcontext.TotRefundAmount));

            if ($scope.currentcontext.TotDiscAmount > $scope.currentcontext.TotGrossAmount) {
                $scope.currentcontext.BillDiscount = 0;
                $scope.currentcontext.ReceiptAmt = 0;
                $scope.currentcontext.TotBalanceAmt = 0;
                $scope.currentcontext.TotDiscAmount = itemwiseDiscountAmt + SplitItemDiscountAmt;
                utl.Alert.showSuccessMsg($translate.instant('billing.ipbillingtab.billdiscount.lbl'));
            }
            if ($scope.currentcontext.TotDiscAmount > 0) {
                $scope.ResetFinalSettlementList();
            } else {
                $scope.ResetFinalSettlementList();
                 if ($scope.currentcontext.TotBalanceAmt < 0) {
                    $scope.currentcontext.FSTypeId = 2;
                    $scope.lookup["SettlementType"] = $scope.lookup["SettlementType"].filter(function (item) {
                        return (item.Code !== "Receipt" && item.Code !== "CreditVoucher" && item.Code !== "BillTransfer");
                    });
                } else {
                    $scope.lookup["SettlementType"] = $scope.lookup["SettlementType"].filter(function (item) {
                        return (item.Code !== "Refund" && item.Code !== "TobeRefunded");
                    });
                }
            }


            $scope.currentcontext.TotNetAmount = parseFloat($scope.currentcontext.TotGrossAmount) - parseFloat($scope.currentcontext.TotDiscAmount);

            if (!$scope.item.IsBillLock) {
                if (!$scope.currentcontext.EstimatedBillDist)
                    $scope.currentcontext.EstimatedBillDist = 0;
                $scope.currentcontext.TotNetAmount -= $scope.currentcontext.EstimatedBillDist;
            }

            var NetNaturalValue = getNatural(Number($scope.currentcontext.TotNetAmount).toFixed(2));
            var NetDecimalValue = getDecimal(Number($scope.currentcontext.TotNetAmount).toFixed(2));
            var RoundOffValue = 0;

            if (NetDecimalValue > 0 && NetDecimalValue < 50) {
                $scope.currentcontext.TotNetAmount = NetNaturalValue;
                RoundOffValue = -1 * (NetDecimalValue / 100);
                $scope.currentcontext.RoundOffValue = parseFloat(RoundOffValue);
            } else if (NetDecimalValue >= 50 && NetDecimalValue <= 99) {
                $scope.currentcontext.TotNetAmount = NetNaturalValue + 1;
                RoundOffValue = (100 - NetDecimalValue) / 100;
                $scope.currentcontext.RoundOffValue = parseFloat(RoundOffValue);
            } else {
                RoundOffValue = 0;
                $scope.currentcontext.RoundOffValue = parseFloat(RoundOffValue);
            }

            $scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.TotNetAmount) -
                parseFloat($scope.currentcontext.ReceiptAmt) -
                (parseFloat($scope.currentcontext.TotPaidAmount) - parseFloat($scope.currentcontext.TotRefundAmount));

            $scope.item.Received = $scope.currentcontext.ReceiptAmt !== 0 ?
                $scope.currentcontext.ReceiptAmt : $scope.currentcontext.TotPaidAmount !== 0 ? $scope.currentcontext.TotPaidAmount : 0;
            if ($scope.FinalBillInfo && $scope.FinalBillInfo.Id > 0) {
                $scope.canShowSaveBtn = true;
            }

            /* Discount Limit Validation */
            if ($scope.currentcontext.TotDiscAmount > 0) {
                $scope.DiscountAlert = '';
                $scope.IsDiscountApproved = true;
                if ($scope.currentcontext.DiscountApprovedBy > 0) {
                    if ($scope.DiscountLimit !== null && $scope.currentcontext.TotDiscAmount > $scope.DiscountLimit) {
                        $scope.DiscountAlert = 'Maximum Discount of Rs.' + $scope.DiscountLimit + ' Only Can be Given For the Selected Discount Approver';
                        utl.Alert.showErrorMsg($scope.DiscountAlert);
                        $scope.IsDiscountApproved = false;
                    }
                } else {
                    $scope.DiscountAlert = 'Please Select Discount Approver';
                    utl.Alert.showErrorMsg($scope.DiscountAlert);
                    $scope.IsDiscountApproved = false;
                }
            }

            if ($scope.item.Received > 0 && $scope.currentcontext.TotalReceiptAmount > 0)
                $scope.item.Received -= $scope.currentcontext.TotalReceiptAmount;
        };

        function getNatural(num) {
            return parseFloat(num.toString().split(".")[0]);
        }

        function getDecimal(num) {
            return parseFloat(num.toString().split(".")[1]);
        }

        $scope.setDiscountLimit = function (item) {
            $scope.DiscountLimit = item.DiscountLimit;
            if (item.DiscountMode.Description == "%") {
                $scope.DiscountLimit = (parseFloat($scope.item.GrossAmount) * item.DiscountLimit) / 100;
            }
            $scope.CalculateNetAmt();
        };

        $scope.OnLoadPackageItem = function (SelectedItem) {
            if (SelectedItem.IsPackage) {
                utl.Alert.showSuccessMsg($translate.instant('billing.ipbillingtab.needtoload.lbl'));
            } else {
                SelectedItem.IsPackage = false;
                utl.Alert.showSuccessMsg($translate.instant('billing.ipbillingtab.noneedtoload.lbl'));
            }
        };

        $scope.LoadPackageItem = function (SelectedItem) {
            $scope.OnLoadPackageItem(SelectedItem);
        };

        $scope.clear = function () {
            $scope.currentfilter.billdate = '';
            $scope.currentfilter.billnumber = '';
            $scope.currentfilter.PatientId = -1;
            $scope.currentfilter.patientname = '';
            $scope.currentfilter.DoctorId = -1;
            $scope.currentfilter.DepartmentId = -1;
            $scope.currentfilter.PayScenarioId = -1;
            $scope.currentfilter.GuarantorName = '';
            $scope.currentfilter.ServiceRateCategoryId = -1;
            $scope.currentfilter.ServiceRateCategoryName = '';

            $scope.currentcontext.id = 0;
            $scope.currentcontext.RdoBillDiscount = true;
            $scope.currentcontext.RdoBillDiscountMode = true;
            $scope.currentcontext.Rdobilldate = true;
            $scope.currentcontext.BillDiscountTypeId = -1;
            $scope.currentcontext.BillDiscount = 0;
            $scope.currentcontext.BillDiscountModeId = -1;
            $scope.currentcontext.ApprovedById = -1;
            $scope.currentcontext.PaymentTypeId = 1;
            $scope.currentcontext.TotNetAmount = 0;
            $scope.currentcontext.TotDiscountAmt = 0;
            $scope.currentcontext.PaidAmt = 0;
            $scope.currentcontext.ReceiptAmt = 0;
            $scope.currentcontext.TotBalanceAmt = 0;
            $scope.currentfilter.billdate = utl.Formatter.getCurrentDate();
            $scope.PatientBillDetails = [];
            $scope.PatientPaymentDetails = [];

            $scope.isSaving = false;
            $scope.outStanding = false;
        };

        $scope.addPay = function () {
            utl.Modal.open('app.opbilling-form', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.editInfo = function () {
            utl.Modal.open('app.opbillinginfo-form', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.pendingOrder = function () {
            utl.Modal.open('app.pendingorder-list', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.findBill = function () {
            utl.Modal.open('app.findbill-list', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.pendingBill = function () {
            utl.Modal.open('app.pendingbill-list', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.patientprofiledetails = function () {
            utl.Modal.open('app.patientprofiledetails', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.billHistory = function () {
            utl.Modal.open('app.billhistory-list', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.add_new = function () {
            utl.Modal.open('app.opbilling-list', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.attachment = function () {
            utl.Modal.open('app.patientattachments', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.previousOrders = function () {
            utl.Modal.open('app.previousorders', {
                params: {
                    eid: $scope.currentcontext.EncounterId,
                    pid: $scope.item.PatientId
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.otregister = function () {
            utl.Modal.open('patientemr.otregisters', {
                params: {
                    eid: $scope.currentcontext.EncounterId,
                    pid: $scope.item.PatientId
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.oppharmacylist = function (summaryviewflag) {
            utl.Modal.open('app.oppharmacybills', {
                params: {
                    eid: $scope.currentcontext.EncounterId,
                    pid: $scope.item.PatientId,
                    summaryview: summaryviewflag
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.supplementaryDetails = function (bill, issupplementary) {
            utl.Modal.open('app.ipguarantorcategorydetails', {
                params: {
                    pid: $scope.item.PatientId,
                    id: 0,
                    eid: bill.EncounterId,
                    bid: bill.Id,
                    mbid: 0,
                    cid: bill.ServiceCategoryId,
                    cname: bill.ServiceCategory.ServiceCategoryName,
                    isguarantor: true,
                    issupplementary: issupplementary,
                    ireceiveamt: $scope.item.Received,
                    PatientBillId: $scope.item.PatientBillId,
                    GuarantorId: $scope.item.GuarantorId,
                    GuarantorTypeId: $scope.item.GuarantorTypeId,
                    DoctorId: $scope.item.DoctorId,
                    TotNetAmount: $scope.currentcontext.TotNetAmount,
                    TotDiscAmount: $scope.currentcontext.TotDiscAmount,
                    DOA: $scope.item.DOA,
                    DOD: $scope.item.DOD,
                },
                confirmCallback: $scope.ScreenRefersh
            });
        };

        $scope.ScreenRefersh = function (data) {
            if (data.method == 'print') {
                $scope.print3($scope.currentcontext.EncounterId, data.categoryid, data.categoryname);
            } else {
                $scope.RefershSplitDetails();
            }
        };

        $scope.intermediateBillCallback = function (data) {
            if (data.method == 'print') {
                $scope.print3($scope.currentcontext.EncounterId, data.categoryid, data.categoryname);
            }
        };

        $scope.intermediateBillDetails = function (bill, issupplementary) {
            utl.Modal.open('app.intermediatebilldetails', {
                params: {
                    pid: $scope.item.PatientId,
                    eid: bill.EncounterId,
                    cid: bill.ServiceCategoryId,
                    categoryname: bill.ServiceCategory.ServiceCategoryName,
                    issupplementary: issupplementary
                },
                confirmCallback: $scope.intermediateBillCallback
            });
        };

        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.EncounterId,
                Data: {
                    isFinalized: $scope.isFinalized,
                    isGuarantor: false,
                    PrintUser: utl.Session.getCurrentUserId()
                }
            };
            var action = 'billing/PatientBillSummary/PrintPatientBillSummary';
            if ($scope.EncounterInfo.IsPackageAssigned)
                action = 'billing/PatientBillPackageSummary/PrintPatientBillPackageSummary';

            var options = {
                action: action,
                data: inputData,
                type: 'post'
            };

            utl.Http.doPrint(options);
        };

        $scope.printPackageDetails = function () {
            var inputData = {
                Id: $scope.currentcontext.EncounterId,
                Data: {
                    isFinalized: $scope.isFinalized,
                    isGuarantor: false,
                    PrintUser: utl.Session.getCurrentUserId()
                }
            };

            if ($scope.EncounterInfo.IsPackageAssigned) {
                var action = 'encounter/EncounterIPPackage/PrintIPPatientPackageDetails';
                var options = {
                    action: action,
                    data: inputData,
                    type: 'post'
                };
                utl.Http.doPrint(options);
            } else {
                utl.Alert.showErrorMsg($translate.instant('billing.receipt-form.packagedetailserror.lbl'));
            }
        };

        $scope.print2 = function () {
            var inputData = {
                Id: $scope.currentcontext.EncounterId,
                Data: {
                    isFinalized: $scope.isFinalized,
                    isGuarantor: false,
                    PrintUser: utl.Session.getCurrentUserId()
                }
            };
            var options = {
                action: 'billing/patientbills/PrintInpatientBills',
                data: inputData,
                type: 'post'
            };

            utl.Http.doPrint(options);
        };

        $scope.print8 = function () {
            var inputData = {
                Id: $scope.currentcontext.EncounterId,
                Data: {
                    isFinalized: $scope.isFinalized,
                    isGuarantor: false,
                    PrintUser: utl.Session.getCurrentUserId()
                }
            };
            var options = {
                action: 'billing/patientbills/PrintDailyInpatientBills',
                data: inputData,
                type: 'post'
            };

            utl.Http.doPrint(options);
        };

        $scope.print3 = function (EncounterId, ServiceCategoryId, ServiceName) {
            var inputData = {
                Id: EncounterId,
                Data: {
                    isFinalized: $scope.isFinalized,
                    ServiceCategoryId: ServiceCategoryId,
                    ServiceName: ServiceName,
                    isGuarantor: false,
                    IsTempIPBill: true,
                    PrintUser: utl.Session.getCurrentUserId()
                }
            };

            var options = {
                action: 'billing/Patientbilldetails/PrintPatientBillDetails',
                data: inputData,
                type: 'post'
            };

            utl.Http.doDownload(options);
        };

        $scope.print4 = function () {
            var inputData = {
                Id: $scope.currentcontext.EncounterId,
                Data: {
                    isGuarantor: true,
                    isFinalized: $scope.isFinalized,
                    PrintUser: utl.Session.getCurrentUserId()
                }
            };
            var options = {
                action: 'billing/patientbills/PrintInpatientBills',
                data: inputData,
                type: 'post'
            };
            utl.Http.doPrint(options);
        };

        $scope.print5 = function () {
            var inputData = {
                Id: $scope.currentcontext.EncounterId,
                Data: {
                    isGuarantor: true,
                    isFinalized: $scope.isFinalized,
                    PrintUser: utl.Session.getCurrentUserId()
                }
            };
            var action = 'billing/PatientBillSummary/PrintPatientBillSummary';
            if ($scope.EncounterInfo.IsPackageAssigned)
                action = 'billing/PatientBillPackageSummary/PrintPatientBillPackageSummary';

            var options = {
                action: action,
                data: inputData,
                type: 'post'
            };

            utl.Http.doPrint(options);
        };

        $scope.print6 = function () {
            var inputData = {
                Id: $scope.currentcontext.EncounterId,
                Data: {
                    isGuarantor: false,
                    isFinalized: $scope.isFinalized,
                    isSupplementary: true,
                    PrintUser: utl.Session.getCurrentUserId()
                }
            };

            var options = {
                action: 'billing/patientbills/PrintInpatientBills',
                data: inputData,
                type: 'post'
            };

            utl.Http.doPrint(options);
        };

        $scope.print7 = function () {
            var inputData = {
                Id: $scope.currentcontext.EncounterId,
                Data: {
                    isprint: false
                }
            };
            var options = {
                action: 'billing/patientbills/PrintIPBillingPharmacyBills',
                data: inputData,
                type: 'post'
            };

            utl.Http.doDownload(options);
        };

        $scope.backToList = function () {
            $state.go('app.ipbillmodificationtab.ipbillmodification-list', {
                filterbillnr: $scope.filterbillnr,
                filterbilldt: $scope.filterbilldt,
                filtermrn: $scope.filtermrn
            });
        };

        var sort_by = function (field, reverse, primer) {
            var key = primer ?
                function (x) {
                    return primer(x[field]);
                } :
                function (x) {
                    return x[field];
                };

            reverse = !reverse ? 1 : -1;

            return function (a, b) {
                return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
            };
        };

        $scope.changeFSTType = function () {
            if ($scope.item.GuarantorId > 0 && $scope.currentcontext.FSTypeId == 3) {
                $scope.item.GuarantorDueId = $scope.item.GuarantorId;
                $scope.currentcontext.isSelfGuarantor = true;
            } else {
                $scope.item.GuarantorDueId = -1;
                $scope.currentcontext.isSelfGuarantor = false;
            }
        };

        $scope.loadPatientGuarantorsCallback = function (scope, data, options, hasError) {
            data.PatientGuarantor.sort(sort_by('Rank', false, parseInt));
            $scope.lookup['PatientGuarantor'] = data.PatientGuarantor;

            for (var patientguarantoridx in $scope.lookup.PatientGuarantor) {
                var patientguarantor = $scope.lookup.PatientGuarantor[patientguarantoridx];
                if (patientguarantor.Id == $scope.item.GuarantorId) {
                    $scope.item.GuarantorName = patientguarantor.GuarantorName;
                    $scope.currentcontext.InsApprovalAmt = patientguarantor.CreditLimit;
                }
            }

            if ($scope.item.GuarantorTypeId != 1) {
                $scope.item.GuarantorDueId = $scope.item.GuarantorId;
            } else {
                $scope.item.GuarantorDueId = 0;
            }
        };

        $scope.loadPatientGuarantors = function () {
            if ($scope.item.PatientId && $scope.item.PatientId > 0) {
                var inputData = [{
                    Key: "PatientGuarantor",
                    Request: { Params: [{ Key: 1, Value: 2 }, { Key: 2, Value: $scope.item.PatientId }] }
                }];

                var options = {
                    action: 'General/Options/getoptions',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.loadPatientGuarantorsCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.onPatientGuarantorChange = function (selected) {
            var patientGuarantorId = utl.Lookup.getDefault($scope.lookup.PatientGuarantor, 'SELF');
            $scope.currentcontext.isSelfGuarantor = parseInt($scope.item.GuarantorDueId) == parseInt(patientGuarantorId);
        };

        $scope.onFamilyLinkChange = function (selected) {
            $scope.currentcontext.FamilyLinkId = selected.Id;
            $scope.currentcontext.TransferEncounterId = selected.PatientEncounter.Id;
            $scope.currentcontext.TransferPatientId = selected.MemberId;
        };

        $scope.loadEncounterGuarantorCallback = function (scope, res, options, hasError) {
            if (res.Data && res.Data.length > 0) {
                res.Data.forEach((val, idx) => {
                    if (val.Rank == 1) {
                        $scope.currentcontext.RankFirstGuarantor = val.GuarantorName;
                    }
                    if (val.Rank == 2) {
                        $scope.currentcontext.RankSecGuarantor = val.GuarantorName;
                    } else {
                        $scope.currentcontext.RankSecGuarantor = 'SELF';
                    }
                });
            }
        };

        $scope.loadEncounterGuarantor = function () {
            var inputData = {
                Params: [{ Key: 2, Value: $scope.currentcontext.EncounterId }],
                PageContext: { PageSize: 25, PageNumber: 1 }
            };

            var options = {
                action: 'registration/EncounterGuarantor/GetEncounterGuarantors',
                data: inputData,
                type: 'post',
                onComplete: $scope.loadEncounterGuarantorCallback
            };

            utl.Http.doAction(options);
        };

        $scope.manageEncounterGuarantorCallback = function (scope, res, options, hasError) {
            if (res > 0)
                $scope.getEncounter();
        };

        $scope.ViewReceipt = function () {
            $scope.openReceipt($scope.currentcontext.EncounterId, 'view');
        };

        $scope.openReceipt = function (EncounterId, type) {
            utl.Modal.open('app.modifyreceipt', {
                params: {
                    EncounterId: EncounterId,
                    pid: $scope.selectedPatient.Id,
                    GuarantorId: $scope.item.GuarantorId,
                    GuarantorTypeId: $scope.item.GuarantorTypeId,
                    DoctorId: $scope.item.DoctorId,
                    PatientBillId: $scope.FinalBillInfo.Id,
                    TotNetAmount: $scope.currentcontext.TotNetAmount,
                    TotDiscAmount: $scope.currentcontext.TotDiscAmount,
                    DOA: $scope.item.DOA,
                    DOD: $scope.item.DOD,
                    BillDateTime: $scope.item.BillDateTime,
                    type: type
                },
                confirmCallback: $scope.ScreenRefersh
            });
        };



        $scope.outstandingBill = function () {
            utl.Modal.open('app.outstandingbill-list', {
                params: {
                    eid: $scope.item.PatientId
                },
                confirmCallback: $scope.GetPatientBillSummary
            });
        };

        $scope.onGuarantorSelected = function (dataFromModal) {
            $scope.item.GuarantorId = dataFromModal.gid;
            $scope.item.GuarantorDueId = dataFromModal.gid;
            $scope.item.GuarantorTypeId = dataFromModal.GuarantorTypeId;
            if ($scope.item.GuarantorTypeId == 2) {
                $scope.currentcontext.FSTypeId = 3;
            } else
                $scope.currentcontext.FSTypeId = 1;
            $scope.loadPatientGuarantors();
            if ($scope.item.GuarantorId > 0) {
                var inputData = {
                    Data: {
                        EncounterId: $scope.currentcontext.EncounterId,
                        FacilityId: utl.Session.getCurrentFacilityId(),
                        PatientId: $scope.item.PatientId,
                        PatientGuarantorId: $scope.item.GuarantorId,
                        IsIPReq: true
                    }
                };

                var options = {
                    action: 'registration/EncounterGuarantor/ManageEncounterGuarantor',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.manageEncounterGuarantorCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.addGuarantor = function () {
            if ($scope.item.PatientId) {
                utl.Modal.open('app.patientguarantorlist', {
                    params: {
                        id: 0,
                        pid: $scope.item.PatientId,
                        parent: 'txn',
                        isFinalized: $scope.isFinalized
                    },
                    confirmCallback: $scope.onGuarantorSelected,
                    cancelCallback: $scope.loadPatientGuarantors
                });
            }
        };

        $scope.AddPaymentDetails = function () {
            var PatientPaymentDetail = {
                Id: 0,
                ReceiptDateTime: utl.Formatter.getCurrentDate(),
                FacilityId: utl.Session.getCurrentFacilityId(),
                OrganizationId: $scope.item.OrganizationId,
                PatientId: $scope.item.PatientId,
                ReceiptTypeId: $scope.currentcontext.ReceiptTypeId,
                EncounterId: $scope.currentcontext.EncounterId,
                EncounterTypeId: $scope.EncounterInfo.EncounterTypeId,
                PatientName: $scope.item.PatientName,
                AmountPaid: ((!$scope.currentcontext.ReceiptAmt) ? 1 : $scope.currentcontext.ReceiptAmt === 0 ? 1 : $scope.currentcontext.ReceiptAmt),
                DepartmentID: $scope.item.DepartmentId,
                PaymentcounterID: 0,
                GuarantorId: $scope.item.GuarantorId,
                GuarantorTypeId: $scope.item.GuarantorTypeId,
                FamilyLinkId: $scope.item.FamilyLinkId,
                TransferEncounterId: $scope.item.TransferEncounterId,
                TransferPatientId: $scope.item.TransferPatientId,
                ReceiptGeneratedById: $scope.item.ReceiptGeneratedById,
                ReceiptApprovedById: $scope.currentcontext.ApprovedById,
                PaymentTypeId: $scope.currentcontext.PaymentTypeId,
                DoctorId: $scope.item.DoctorId,
                ServiceId: $scope.currentfilter.ServiceRateCategoryId,
                ServiceName: $scope.currentfilter.ServiceRateCategoryName,
                PatientBillId: null,
                CardHolderName: null,
                AuthorizedCode: $scope.item.AuthorizedCode,
                GurantorName: $scope.currentfilter.GuarantorName,
                Comments: $scope.item.Remarks,
                CancelReason: null,
                ReceiptStatusId: $scope.currentcontext.ReceiptStatusId,
                TDSAmount: null,
                Disallowance: null,
                RoundOffValue: null,
                CreditNoteId: null,
                PaymentStatusId: 3,
                CollectedOn: utl.Formatter.getCurrentDate(),
                CardNumber: '',
                CardDateTime: null,
                CardExpiryDate: null,
                TerminalNoId: $scope.item.TerminalNoId,
                BankId: $scope.currentcontext.PaymentTypeId != 1 ? $scope.item.BankId : -1,
                CardTypeId: $scope.currentcontext.PaymentTypeId == 5 ? $scope.item.CardTypeId : -1,
                ChequeNo: $scope.currentcontext.PaymentTypeId == 2 ? $scope.item.ChequeNo : '',
                ChequeDate: $scope.currentcontext.PaymentTypeId == 2 ? (!$scope.item.ChequeDate ? null : $scope.item.ChequeDate) : null,
                DDNumber: $scope.currentcontext.PaymentTypeId == 3 ? (!$scope.item.DDNumber) ? null : $scope.item.DDNumber : null,
                DDDate: $scope.currentcontext.PaymentTypeId == 3 ? (!$scope.item.DDDate) ? null : $scope.item.DDDate : null,
                WireTransferId: $scope.currentcontext.PaymentTypeId == 4 ? $scope.item.WireTransferId : null,
                WireTransferDate: $scope.currentcontext.PaymentTypeId == 4 ? (!$scope.item.WireTransferDate) ? null : $scope.item.WireTransferDate : null,
            };
            if ($scope.currentcontext.id > 0) {
                PatientPaymentDetail.PatientBillId = $scope.currentcontext.id;
            }
            $scope.PatientPaymentDetails.push(PatientPaymentDetail);
        };

        $scope.setPaymentType = function (selected) {
            if (selected.Id == 6 || selected.Id == 5)
                $scope.item.TerminalNoId = 2;
            else $scope.item.TerminalNoId = 0;
        };



        $scope.getPendingOrderList = function () {
            var inputData = {
                Params: [
                    { Key: 4, Value: 1 },
                    { Key: 18, Value: $scope.currentcontext.EncounterId },
                    { Key: 29, Value: false }, // IsDirectBill is false order
                    { Key: 20, Value: 2 }, // EncountertypeId IP
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'emr/patientorder/GetPatientOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPendingOrderListCallback
            };
            utl.Http.doAction(options);
        };

        $scope.getPendingOrderListCallback = function (scope, res, options, hasError) {
            var pendingorderitems = res.Data;
            var pendingtestname = '';
            for (var idx in pendingorderitems) {
                var pendingorderitem = pendingorderitems[idx];
                for (var idtx in pendingorderitem.PatientOrderDetails) {
                    var pendingorderdtitem = pendingorderitem.PatientOrderDetails[idtx];
                    if (!pendingtestname) pendingtestname = pendingorderdtitem.TestName;
                    else pendingtestname += ' , ' + pendingorderdtitem.TestName;
                }
            }
            if (pendingtestname)
                $scope.PendingOrderTestNames += pendingtestname;
        };

        $scope.getPendingDispensesList = function () {
            var inputData = {
                Params: [
                    { Key: 4, Value: [2, 3, 4] },
                    { Key: 16, Value: $scope.currentcontext.EncounterId }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'IPManagement/PatientStockRequests/GetPatientStockRequests',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPendingDispensesListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getPendingDispensesListCallback = function (scope, res, options, hasError) {
            var pendingorderitems = res.Data;
            var pendingtestname = '';
            for (var idx in pendingorderitems) {
                var pendingorderitem = pendingorderitems[idx];
                for (var idtx in pendingorderitem.PatientStockRequestDetails) {
                    var pendingorderdtitem = pendingorderitem.PatientStockRequestDetails[idtx];
                    if (!pendingtestname) pendingtestname = pendingorderdtitem.ItemName;
                    else pendingtestname += ' , ' + pendingorderdtitem.ItemName;
                }
            }
            if (pendingtestname)
                $scope.PendingOrderTestNames += pendingtestname;
        };

        $scope.getPendingDispensesReturnList = function (pageNo) {
            var inputData = {
                Params: [
                    { Key: 4, Value: [2, 3, 4] },
                    { Key: 16, Value: $scope.currentcontext.EncounterId }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'IPManagement/PatientStockReturns/GetPatientStockReturns',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPendingDispensesReturnListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getPendingDispensesReturnListCallback = function (scope, res, options, hasError) {
            var pendingorderitems = res.Data;
            var pendingtestname = '';
            for (var idx in pendingorderitems) {
                var pendingorderitem = pendingorderitems[idx];
                for (var idtx in pendingorderitem.PatientStockReturnDetails) {
                    var pendingorderdtitem = pendingorderitem.PatientStockReturnDetails[idtx];
                    if (!pendingtestname) pendingtestname = pendingorderdtitem.ItemName;
                    else pendingtestname += ' , ' + pendingorderdtitem.ItemName;
                }
            }
            if (pendingtestname)
                $scope.PendingOrderTestNames += pendingtestname;
        };


        $scope.EstimatedBillDistCallback = function (dataFromModal) {
            $scope.currentcontext.EstimatedBillDist = dataFromModal.EstimatedBillDist;
            $scope.currentcontext.EstimatedBillDistTypeId = dataFromModal.EstimatedBillDistTypeId;
            $scope.CalculateNetAmt();
        }

        $scope.EstimatedBillDist = function () {
            if ($scope.currentcontext.IsEstimatedBill) {
                utl.Modal.open('app.estimatebilldiscount', {
                    params: {
                        eid: $scope.currentcontext.EncounterId,
                        totnet: $scope.currentcontext.TotNetAmount,
                        estimatebilldist: $scope.currentcontext.EstimatedBillDist,
                        estimatebilldisttypeid: $scope.currentcontext.EstimatedBillDistTypeId,
                    },
                    confirmCallback: $scope.EstimatedBillDistCallback
                });
            } else {
                utl.Alert.showErrorMsg("Try again after bill has estimated");
            }
        };



        $scope.ipbillingprofiles = function () {
            utl.Modal.open('app.ipbillingprofiledetails', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.patientguarantorbilling = function () {
            utl.Modal.open('app.patientguarantorbilling', {
                params: {
                    id: 0,
                    pid: $scope.currentcontext.patientid
                },
                confirmCallback: $scope.initLookup
            });
        };


        $scope.LockReleaseBillCallBack = function (scope, res, options, hasError) {
            if (res)
                $scope.BillLockDetail = {};
            $scope.getEncounter();
        };

        $scope.LockReleaseBill = function (data) {
            var inputData = {};
            if (!data.IsLocked)
                inputData = {
                    EncounterId: $scope.currentcontext.EncounterId,
                    PatientId: $scope.item.PatientId,
                    LockedBy: utl.Session.getCurrentUserId(),
                    LockedOn: utl.Formatter.getCurrentDate(),
                    LockStatusId: 1,
                    LockTypeId: data.LockTypeId,
                    Comments: data.Comments
                };
            else {
                inputData = {
                    Id: $scope.BillLockDetail.Id,
                    EncounterId: $scope.currentcontext.EncounterId,
                    PatientId: $scope.item.PatientId,
                    ReleasedOn: utl.Formatter.getCurrentDate(),
                    LockStatusId: 2
                };
            }
            var actionName = 'billing/PatientBillLock/AddPatientBillLock';
            if ($scope.BillLockDetail.Id && $scope.BillLockDetail.Id > 0)
                actionName = 'billing/PatientBillLock/UpdatePatientBillLock';
            var options = {
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.LockReleaseBillCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.getBillLockDetailsCallBack = function (scope, res, options, hasError) {
            if (res.Id > 0) {
                $scope.BillLockDetail = res;
            } else
                $scope.BillLockDetail = {};

            if ($scope.currentcontext.TotNetAmount > 0)
                $scope.CalculateNetAmt();
        };

        $scope.getBillLockDetails = function () {
            if ($scope.item.IsBillLock) {
                var options = {
                    action: 'billing/PatientBillLock/GetPatientBillLockByEncounterId',
                    data: {
                        Data: {
                            EncounterId: $scope.currentcontext.EncounterId
                        }
                    },
                    type: 'post',
                    onComplete: $scope.getBillLockDetailsCallBack
                };
                utl.Http.doAction(options);
            } else {
                if ($scope.currentcontext.TotNetAmount > 0)
                    $scope.CalculateNetAmt();
            }
        };

        $scope.saveAndApprove = function () {



        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            savehitcompleted = 0;
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.BillCompleted = 1;
            $scope.ScreenRefersh();
        };


        function loadData() {
            if ($scope.currentcontext.EncounterId && $scope.currentcontext.EncounterId > 0) {
                $scope.getEncounter();
                $scope.applyVisibilityRules();
                $scope.RefershSplitDetails();
            } else if ($scope.currentcontext.pid && $scope.currentcontext.pid > 0) { }
        }

        vm.wardbedmastercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Bed No',
                field: 'BedNo',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            }
                /*
                { header: 'Ward Name', field: 'WardName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header : 'ServiceRate Catogory', field : 'ServiceRateCategory', datatype: 'string', headercls:'td-category', fieldcls:'td-category' },
                { header: 'ServiceItem Rate', field: 'ServiceItemRate', datatype: 'string', headercls: 'td-rate', fieldcls: 'td-rate' }
                */
            ],
            searchparams: {},
            result: {},
            api: 'generalmaster/WardRoomBedMaster/GetWardRoomBedMasters',
            formatdisplay: formatselectedserviceitem,
            presearch: presearchserviceitem,
            postsearch: postsearchserviceitem
        };

        function formatselectedserviceitem() {
            var selectedItem = vm.wardbedmastercontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.Code, selectedItem.WardRoomMaster.RoomNo, selectedItem.WardMaster.WardName].join(' / ');
            } else if (vm.wardbedmastercontrolconfig.rowdata) {
                result = [vm.wardbedmastercontrolconfig.rowdata.Code, vm.wardbedmastercontrolconfig.rowdata.WardRoomMaster.RoomNo].join(' / ');
            }
            return result;
        }

        function presearchserviceitem() {
            var query = vm.wardbedmastercontrolconfig.query;
            /* Search Only Active Patients */
            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.wardbedmastercontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
            }

            vm.wardbedmastercontrolconfig.searchparams = inputData;
        }

        function postsearchserviceitem() {
            for (var idx in vm.wardbedmastercontrolconfig.result) {
                var item = vm.wardbedmastercontrolconfig.result[idx];
                item.Code = item.Code;
            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'FamilyLink') {
                    for (var flidx in $scope.lookup[key]) {
                        if ($scope.lookup[key][flidx].Id > 0) {
                            if ($scope.lookup[key][flidx].PatientEncounter !== null) {
                                $scope.lookup[key][flidx].Text = $scope.lookup[key][flidx].Text + '-[' + $scope.lookup[key][flidx].PatientEncounter.VisitIdentifier + ']';
                            } else {
                                $scope.lookup[key][flidx] = null;
                            }
                        }
                    }
                }
            });
            loadData();
            $scope.currentfilter.DiscountModeId = 1;
        };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Ward"
            },
            {
                "Key": "Doctor",
                Request: {
                    Params: [{
                        Key: 2,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    }]
                }
            },
            {
                "Key": "ServiceRateCategory"
            },
            {
                "Key": "DiscountMode"
            },
            {
                "Key": "DiscountType"
            },
            {
                "Key": "PaymentType"
            },
            {
                "Key": "ReceiptType"
            },
            {
                "Key": "User"
            },
            {
                "Key": "PaymentType"
            },
            {
                "Key": "Bank"
            },
            {
                "Key": "CardType"
            },
            {
                "Key": "PrivateDueApprover"
            },
            {
                "Key": "DiscountApprover"
            },
            {
                "Key": "SettlementType"
            },
            {
                "Key": "Terminal"
            },
            {
                "Key": "FamilyLink",
                Request: {
                    Params: [{ Key: 2, Value: $scope.currentcontext.PatientId }, { Key: 3, Value: true }]
                }
            }];

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

    IPBillModificationFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();
