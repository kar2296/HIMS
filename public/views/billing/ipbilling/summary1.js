(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('summaryListController', summaryListController);

    function summaryListController($scope, $stateParams, $state, $translate, utl, $filter, $timeout) {
        var vm = this;
        var savehitcompleted = 0;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        $scope.currentcontext.CanIPSUM_PRINT = utl.Privilege.hasAccess('CanIPSUM_PRINT');
        $scope.currentcontext.CanIPSUM_INSURANCE = utl.Privilege.hasAccess('CanIPSUM_INSURANCE');
        $scope.currentcontext.CanIPSUM_PHARMACY = utl.Privilege.hasAccess('CanIPSUM_PHARMACY');
        $scope.currentcontext.CanIPSUM_DISCHARGE = utl.Privilege.hasAccess('CanIPSUM_DISCHARGE');
        $scope.currentcontext.CanIPSUM_FINALIZE = utl.Privilege.hasAccess('CanIPSUM_FINALIZE');
        $scope.currentcontext.CanIPSUM_BILL_LOCK = utl.Privilege.hasAccess('CanIPSUM_BILL_LOCK');

        $scope.SelectedIndex = -1;
        $scope.BillRefreshCount = 0;
        $scope.canShowSaveBtn = false;
        $scope.FacilityBlockPendingOrders = false;
        $scope.PendingOrderTestNames = '';

        $scope.BillLockDetail = {};
        $scope.selectedPatient = {};
        $scope.notEditIns = true;

        $scope.BillCompleted = 0;
        $("#summarytable").hide();
        $("#summaryselftable").hide();
        $("#hidetotal").hide();
        $("#demo1").show();
        $("#tagul").click(function() {
            $("#demo").toggle();
            $("#demo1").toggle();
        });
        $("#tagul1").click(function() {
            $("#demo1").toggle();
            $("#demo").toggle();
        });

        // $("#summary").hide();
        $scope.item = {};
        $scope.lookup = {};
        $scope.item.doadate = utl.Formatter.getCurrentDate();
        $scope.item.PatientId = -1;
        $scope.item.PaymentTypeId = 1;
        $scope.item.ReceiptTypeId = -1;
        $scope.item.GuarantorDueId = -1;
        $scope.item.FamilyLinkId = -1;
        $scope.item.changeCreditVoucher = 0;
        $scope.item.WithHeader = true;
        $scope.item.WithoutHeader = false;
        $scope.item.WithPayments = true;
        $scope.item.NonMedical = false;

        $scope.currentcontext = {};
        $scope.currentcontext.EncounterId = parseInt($stateParams.id);
        $scope.currentcontext.PatientId = parseInt($stateParams.patientid);
        $scope.currentcontext.SurgeryEntryId = parseInt($stateParams.SurgeryEntryId);
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
        $scope.currentfilter.filter_from = $stateParams.filter_from;
        $scope.currentfilter.isdaycare = $stateParams.isdaycare;
        $scope.currentfilter.from = $stateParams.from;
        $scope.currentfilter.filter_to = $stateParams.filter_to;
        $scope.currentfilter.filter_phone = $stateParams.filter_phone;
        $scope.currentfilter.filter_guarantor = $stateParams.filter_guarantor;
        $scope.currentfilter.filter_guarantortype = $stateParams.filter_guarantortype;
        $scope.currentfilter.filter_doctor = $stateParams.filter_doctor;
        $scope.currentfilter.filter_dept = $stateParams.filter_dept;
        $scope.currentfilter.filter_isout = $stateParams.filter_isout;
        $scope.currentfilter.GuarantorTypeId = 0;
        $scope.PatientSummaryDetails = [];
        $scope.PatientPaymentDetails = [];
        $scope.carddetailsmandatory = 0;
        $scope.carddetailsmandatory =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'carddetailsmandatory');
        $scope.currentcontext.DisableCategoryPrint = 0;
        $scope.currentcontext.DisableCategoryPrint =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'disablecategoryprintforipbill');

        $scope.maxadvancecash = 0;
        $scope.maxadvancecash =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'maxadvancecash');
        $scope.ipmaxcash = 0;
        $scope.ipmaxcash =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'ipmaxcash');
        $scope.maxcashrefund = 0;
        $scope.maxcashrefund =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'maxcashrefund');
        $scope.ipbillflowrequired = 0;
        $scope.ipbillflowrequired =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'ipbillflowrequired');
        $scope.isSaving = false;
        $scope.outstanding = false;
        $scope.BlockOrders = 0;
        $scope.toggleShowDetails = function() { };
        $scope.PatientBillDetailsforDiscount = [];
        $scope.fillDefaultValues = function() {
            $scope.currentcontext.PaymentTypeId = 1;
        };

        if (!$scope.currentcontext.id || $scope.currentcontext.id === 0) {
            $scope.fillDefaultValues();
        }

        $scope.GetPatientBillPackageSummaryDetails = function() {
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

        $scope.RefershSplitDetailsCallback = function(scope, res, options, hasError) {
            if ($scope.BlockOrders == 0) {
                $scope.ActiveBillsCount = 0;
            }
            // $scope.GetPatientBillPackageSummaryDetails();
            if (res.Refreshed && res.IsPackageAssigned) {
                $scope.GetPatientBillPackageSummaryDetails();
            }
            // else if (res.Refreshed) {
            //     $scope.GetPatientBillSummary();
            //     $scope.FacilityBlockPendingOrders = utl.FacilitySetting.getFacilitySettingValue('billing', 'pendingordersblock');
            //     $scope.PendingOrderTestNames = '';
            //     // if ($scope.FacilityBlockPendingOrders) {
            //     //     $scope.getPendingOrderList();
            //     //     $scope.getPendingDispensesList();
            //     //     $scope.getPendingDispensesReturnList();
            //     // }
            // }

        };

        $scope.RefershSplitDetails = function() {
            var options = {
                action: 'billing/patientbills/PopulateInpatientBills',
                data: {
                    Id: $scope.currentcontext.EncounterId
                },
                type: 'post',
                onComplete: $scope.RefershSplitDetailsCallback
            };

            utl.Http.doAction(options);
        };

        $scope.PopulateRoomChargesCallback = function(scope, res, options, hasError) {
            $scope.GetPatientBillSummary();
        };

        $scope.PopulateRoomCharges = function() {
            var options = {
                action: 'billing/patientbills/PopulateRoomCharges',
                data: {
                    Id: $scope.currentcontext.EncounterId
                },
                type: 'post',
                onComplete: $scope.PopulateRoomChargesCallback
            };

            utl.Http.doAction(options);
        };

        $scope.openModal = function(appKey, stateParams, callBack) {
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

        $scope.discharge = function(data) {
            if (data == 6) {
                $scope.candisabledischargebtn = true;
                $scope.getEncounter();

            }
        };

        $scope.getPhysicalDischargeCallback = function(scope, data, options, hasError) {
            $scope.openModal('app.physicalpatient', {
                id: data,
                EncounterId: $scope.currentcontext.EncounterId || 0,
                Encounter: $scope.EncounterInfo || {},
                type: 1
            }, $scope.discharge);
        };

        $scope.patientDischarge = function() {
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

        $scope.getPatient = function() {
            if ($scope.item.PatientId > 0) {
                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: {
                        Id: $scope.currentcontext.PatientId
                    },
                    type: 'post',
                    onComplete: $scope.getPatientCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getPatientCallback = function(scope, data, options, hasError) {
            $scope.currentcontext.TotDueAmount = data.OutStandingAmount;
        };

        $scope.getEncounterCallback = function(scope, data, options, hasError) {
            $scope.PatientInfo = $scope.$parent.selectedPatient;
            var Encounter = data;
            $scope.EncounterInfo = data;
            $scope.$parent.EncounterDetails = data;
            if (typeof $scope.$parent.selectedPatient.FirstName != 'undefined') {
                $scope.EncounterInfo.Patient = $scope.PatientInfo;
                if ($scope.PatientInfo.LastName != null || $scope.PatientInfo.Title != null) {
                    if ($scope.PatientInfo.Title) {
                        $scope.item.PatientName = $scope.PatientInfo.Title.Description +
                            ' ' + $scope.PatientInfo.FirstName + ' ' +
                            $scope.PatientInfo.LastName;
                    } else {
                        $scope.item.PatientName = $scope.PatientInfo.FirstName + ' ' +
                            $scope.PatientInfo.LastName;
                    }
                } else {
                    if ($scope.PatientInfo.Title) {
                        $scope.item.PatientName = $scope.PatientInfo.Title.Description +
                            ' ' + $scope.PatientInfo.FirstName;
                    } else {
                        $scope.item.PatientName = scope.PatientInfo.FirstName;
                    }
                }
            }
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
            if (Encounter.Guarantor) {
                $scope.item.GuarantorName = Encounter.Guarantor.GuarantorName;
            }
            $scope.item.GuarantorTypeId = Encounter.GuarantorTypeId;
            $scope.item.SurgeryDate = Encounter.SurgeryDate;
            $scope.item.AdmissionStatusId = Encounter.AdmissionStatusId;
            $scope.item.DepartmentId = Encounter.DepartmentId;
            $scope.item.ReferralId = Encounter.ReferralId || 0;
            $scope.item.ReferralName = Encounter.ReferralName || '';
            if ($scope.currentcontext.TotBalanceAmt < 0) {
                $scope.currentcontext.FApprovedAmountSTypeId = 2;
            } else if ($scope.item.GuarantorTypeId != 1) {
                $scope.currentcontext.FSTypeId = 3;
            } else {
                $scope.currentcontext.FSTypeId = 1;
            }

            $scope.item.IsBillLock = Encounter.IsBillLock;
            if ($scope.item.IsBillLock == true) {
                $scope.notEditIns = false;
            } else {
                $scope.notEditIns = true;
            }

            $scope.$parent.Islocked = Encounter.IsBillLock;
            $scope.currentcontext.IsEstimatedBill = Encounter.IsEstimatedBill;
            $scope.currentcontext.EstimatedBillDist = Encounter.EstimatedBillDist;
            $scope.currentcontext.EligibleAmount = Encounter.EligibleAmount;
            $scope.currentcontext.ApprovedAmount = Encounter.CreditLimit;
            $scope.currentcontext.EstimatedBillDistTypeId = Encounter.EstimatedBillDistTypeId;

            $scope.getPatient();
            // $scope.loadPatientGuarantors();
            $scope.loadEncounterGuarantor();
            $scope.getBillLockDetails();
            // $state.go('app.ipbillingtab.summary')
            $scope.canShowSaveBtn = true;
            if (!$scope.item.IsBillLock) {
                $scope.PopulateRoomCharges();
            } else {
                $scope.GetPatientBillSummary();
            }
            // if ($scope.item.IsBillLock && $scope.item.GuarantorTypeId == 6) {
            if ($scope.EncounterInfo.IsPackageAssigned) {
                $scope.RefershSplitDetails();
            }
            //
            // }

        };

        $scope.getEncounter = function() {
            var options = {
                action: 'Visit/Visit/GetEncounterById',
                data: {
                    Id: $scope.currentcontext.EncounterId
                },
                type: 'post',
                onComplete: $scope.getEncounterCallback
            };

            utl.Http.doAction(options);
        };

        $scope.custom_sort = function(a, b) {
            return parseInt(a.DisplayOrder) - parseInt(b.DisplayOrder);
        };

        $scope.GetPatientBillSummaryCallback = function(scope, res, options, hasError) {
            //console.log(res.)
            $scope.currentcontext.TotalRefundAmount = 0;
            $scope.currentcontext.TotalReceiptAmount = 0;
            $scope.currentcontext.TotalCNAmount = 0;
            $scope.currentcontext.NetInclusion = 0;
            $scope.currentcontext.NetExclusion = 0;
            if (res.ReceiptInfo && res.ReceiptInfo.Data.length > 0) {
                var receiptAmount = 0;
                $scope.ReceiptDetails = res.ReceiptInfo.Data;
                $scope.ReceiptDetails.forEach((val, idx) => {
                    if (val.ReceiptStatusId == 1 && val.IsPharmacyReceipt == false)
                        receiptAmount += isNaN(parseFloat(val.AmountPaid)) ? 0 : parseFloat(val.AmountPaid);
                    else if (val.ReceiptStatusId == 1 && val.IsPharmacyReceipt == true && val.IsConsolidatePay == true) {
                        receiptAmount += isNaN(parseFloat(val.AmountPaid)) ? 0 : parseFloat(val.AmountPaid);
                    }
                });
                $scope.currentcontext.TotalReceiptAmount = receiptAmount;
                $scope.$parent.ReceivedAmt = receiptAmount;
            }
            if (res.PRFundInfo && res.PRFundInfo.Data.length > 0) {
                var refundAmount = 0;
                $scope.refundDetails = res.PRFundInfo.Data;
                $scope.refundDetails.forEach((val, idx) => {
                    refundAmount += isNaN(parseFloat(val.RefundAmount)) ? 0 : parseFloat(val.RefundAmount);
                });
                $scope.currentcontext.TotalRefundAmount = refundAmount;
                $scope.$parent.TotalRefundAmount = $scope.currentcontext.TotalRefundAmount
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
            if (res.BillInfo && res.BillInfo.Data.length > 0) {
                $scope.ActiveBillsCount = res.BillInfo.Data.length;
                res.BillInfo.Data.forEach((val, idx) => {
                    var GroupGrossAmount = 0;
                    var GroupDiscountAmount = 0;
                    var GroupTaxAmount = 0;
                    var GroupNetAmount = 0;
                    var GroupSplitGrossAmount = 0;
                    var GroupSplitDiscountAmount = 0;
                    var GroupSplitNetAmount = 0;
                    if (!$scope.EncounterInfo.IsPackageAssigned) {
                        // var actualGrossAmt = parseFloat(val.ActualAmount) + parseFloat(val.DiscountAmount || 0);
                        // GroupGrossAmount += isNaN(parseFloat(val.ActualAmount)) ? 0 : parseFloat(val.ActualAmount);//comment by jothi - 18/8/23
                        if (val.ServiceCategory.Id == 25) { //include by jothi
                            GroupGrossAmount = isNaN(parseFloat(val.ActualAmount)) ? 0 : parseFloat(val.ActualAmount);
                        } else {
                            GroupGrossAmount = isNaN(parseFloat(val.ActualAmount)) ? 0 : parseFloat(val.ActualAmount);
                        }
                        if ($scope.item.GuarantorTypeId > 1) {

                            GroupNetAmount += isNaN(parseFloat(val.ActualNetAmount)) ? 0 : parseFloat(val.ActualNetAmount);
                            GroupNetAmount += isNaN(parseFloat(val.ActualPatAmount)) ? 0 : parseFloat(val.ActualPatAmount);

                        } else {
                            GroupNetAmount += isNaN(parseFloat(val.ActualNetAmount)) ? 0 : parseFloat(val.ActualNetAmount);
                        }

                        GroupTaxAmount += isNaN(parseFloat(val.TaxAmount)) ? 0 : parseFloat(val.TaxAmount);
                        GroupSplitGrossAmount += isNaN(parseFloat(val.ActualPatAmount)) ? 0 : parseFloat(val.ActualPatAmount);
                        GroupDiscountAmount += isNaN(parseFloat(val.DiscountAmount)) ? 0 : parseFloat(val.DiscountAmount);
                        if (val.ServiceCategory.Id == 25) { //Added by jothi 18/8/23
                            GroupGrossAmount -= GroupDiscountAmount;
                            GroupGrossAmount += GroupTaxAmount;
                        }
                    } else {
                        $scope.item.PackageDetails = res.BillInfo.Data[0].PackageName;
                        $scope.item.PackageAmount = isNaN(parseFloat(res.PackageInfo.Data[0].PackageAmount)) ?
                            0 : parseFloat(res.PackageInfo.Data[0].PackageAmount);
                        GroupGrossAmount = isNaN(parseFloat(val.PackageAmount)) ? 0 : parseFloat(val.PackageAmount);
                        GroupSplitGrossAmount += isNaN(parseFloat(val.ExclusionAmount)) ? 0 : parseFloat(val.ExclusionAmount);
                        $scope.currentcontext.NetInclusion += GroupGrossAmount;
                        $scope.currentcontext.NetExclusion += GroupSplitGrossAmount;
                    }
                    // GroupNetAmount = GroupGrossAmount - GroupDiscountAmount;
                    GroupSplitNetAmount = GroupSplitGrossAmount - GroupSplitDiscountAmount;

                    val.GroupGrossAmount = GroupGrossAmount;
                    val.GroupDiscountAmount = GroupDiscountAmount;
                    val.GroupNetAmount = GroupNetAmount;
                    val.GroupTaxAmount = GroupTaxAmount;

                    val.GroupSplitGrossAmount = GroupSplitGrossAmount;
                    val.GroupSplitDiscountAmount = GroupSplitDiscountAmount;
                    val.GroupSplitNetAmount = GroupSplitNetAmount;
                });
                res.BillInfo.Data.sort($scope.custom_sort);
                $scope.PatientSummaryDetails = res.BillInfo.Data;
                $scope.isFinalized = false;
                if (res.FinalBillInfo && res.FinalBillInfo.Id > 0) {
                    $scope.$parent.FinalBillInfo = res.FinalBillInfo;
                    $scope.isFinalized = true;
                    $scope.notEditIns = true;
                    $scope.FinalBillInfo = res.FinalBillInfo;
                    $scope.item.PatientBillStatus = $scope.FinalBillInfo.PatientBillStatus.Description;
                    $scope.item.PatientBillId = $scope.FinalBillInfo.Id;
                    $scope.item.NetInsuranceAmount = $scope.FinalBillInfo.NetInsuranceAmount;
                    if ($scope.FinalBillInfo.CreditApproved > 0)
                        $scope.currentcontext.InsuranceAmount = $scope.FinalBillInfo.CreditApproved;
                    $scope.item.NetPatientAmount = $scope.FinalBillInfo.NetPatientAmount;
                    $scope.currentcontext.PatientAmount = $scope.FinalBillInfo.NetPatientAmount;
                    $scope.item.PatientBillStatusId = $scope.FinalBillInfo.PatientBillStatusId;
                    $scope.currentcontext.PaidAmt = $scope.FinalBillInfo.PaidAmount;
                    $scope.item.Id = $scope.FinalBillInfo.Id;
                    if ($scope.FinalBillInfo.BillDiscountModeId == 2) {
                        $scope.currentcontext.BillDiscount = $scope.FinalBillInfo.DiscountPercentage;
                    } else {
                        $scope.currentcontext.BillDiscount = $scope.FinalBillInfo.BillDiscount;
                    }
                    $scope.currentcontext.GuarantorTypeId = $scope.FinalBillInfo.GuarantorTypeId;
                    $scope.currentcontext.DiscountApprovedBy = $scope.FinalBillInfo.DiscountApprovedBy;
                    $scope.currentcontext.FinalDue = $scope.FinalBillInfo.FinalDueAmount;
                    $scope.item.CreditNote = $scope.FinalBillInfo.CreditNote;
                    $scope.item.Secondarygurantor = $scope.FinalBillInfo.Secondarygurantor;
                    if ($scope.FinalBillInfo.Comments) {
                        $scope.currentcontext.Comments = $scope.FinalBillInfo.Comments;
                    }
                    $scope.item.Comments = $scope.FinalBillInfo.Comments;
                    $scope.currentfilter.DiscountModeId = $scope.FinalBillInfo.BillDiscountModeId;
                    $scope.currentfilter.GuarantorTypeId = $scope.FinalBillInfo.GuarantorTypeId;
                    $scope.currentcontext.TotalRefundAmount = $scope.FinalBillInfo.RefundAmount;
                    $scope.currentcontext.FSTypeId = $scope.FinalBillInfo.FSTypeId;
                    $scope.currentcontext.FamilyLinkId = $scope.FinalBillInfo.FamilyLinkId;
                    $scope.currentcontext.TransferEncounterId = $scope.FinalBillInfo.TransferEncounterId;
                    $scope.currentcontext.TransferPatientId = $scope.FinalBillInfo.TransferPatientId;
                    $scope.currentcontext.TransferAmount = $scope.FinalBillInfo.TransferAmount;
                    $scope.currentcontext.ToBeRefunded = $scope.FinalBillInfo.ToBeRefunded;
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
                    $scope.canChangeFSType = true;
                    $scope.canShowCancelBtn = true;
                    $scope.item.isCompleted = true;
                } else {
                    $scope.HidePrintBtn = true;
                    $scope.canShowCancelBtn = false;
                    $scope.canChangeFSType = false;
                }

                if ($scope.BillCompleted == 1) {
                    if ($scope.item.PatientBillStatusId == 3) {
                        if ($scope.item.GuarantorTypeId == 1) {
                            $scope.print();
                        } else {
                            $scope.print5();
                        }
                    }
                }
                $scope.getPatientBillDetails();


                var bill = res.BillInfo.Data[0];
                $scope.plusopensupplementary(bill, false);
            }

        };

        $scope.GetPatientBillSummary = function() {
            var options = {
                action: 'billing/PatientBillSummary/GetPatientBillSummaryDetails',
                data: {
                    Data: {
                        EncounterId: $scope.currentcontext.EncounterId,
                        IsDayCare: $scope.currentfilter.isdaycare
                    }
                },
                type: 'post',
                onComplete: $scope.GetPatientBillSummaryCallback
            };
            utl.Http.doAction(options);
        };

        $scope.GuarantorChange = function(SelectedGuarantor) {
            $scope.currentfilter.GuarantorName = SelectedGuarantor.Text;
            $scope.item.GuarantorTypeId = SelectedGuarantor.GuarantorTypeId;
            $scope.clear();
        };

        $scope.ServiceRateCatChange = function(SelectedSerRateCat) {
            $scope.currentfilter.ServiceRateCategoryId = SelectedSerRateCat.Id;
            $scope.currentfilter.ServiceRateCategoryName = SelectedSerRateCat.Text;
            $scope.clear();
        };

        $scope.Bedoccupancy = function() {
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

        $scope.applyVisibilityRules = function() {
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

        $scope.findissues = function() {
            utl.Modal.open('app.pharmacyreturn-findissues', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.findreturns = function() {
            utl.Modal.open('app.pharmacyreturn-findreturn', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.lockctrl = function() {
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

        $scope.ManageEstimatedBillCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg('Success');
        };

        $scope.EstimatedBill = function() {
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
                    data: {
                        Data
                    },
                    type: 'post',
                    onComplete: $scope.ManageEstimatedBillCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.Bedoccupancy = function() {
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

        $scope.moneysplit = function() {
            utl.Modal.open('app.moneysplit', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.DiscountModeChange = function() {
            $scope.currentcontext.BillDiscount = 0;
            if ($scope.item.GuarantorTypeId > 1) {
                $scope.calcinsamt();
            } else {
                $scope.CalculateNetAmt();
            }
        };

        $scope.DiscountChange = function() {
            if ($scope.currentfilter.DiscountModeId && $scope.currentfilter.DiscountModeId != -1) {
                if ($scope.item.GuarantorTypeId > 1) {
                    $scope.calcinsamt();
                } else {
                    $scope.CalculateNetAmt();
                }

            } else {
                $scope.currentcontext.BillDiscount = 0;
                utl.Alert.showErrorMsg($translate.instant('billing.opbilling-list.discounttypemessage.lbl'));
            }
        };

        $scope.calcFinaldue = function(item) {
            if (item.CreditNote > 0) {
                $scope.currentcontext.FinalDue = $scope.currentcontext.TotBalanceAmt - parseFloat(item.CreditNote);
                $scope.$parent.FinalDue = $scope.currentcontext.FinalDue;
                $scope.$parent.CreditNote = $scope.item.CreditNote;
            }
        }

        $scope.CalculateNetAmt = function() {
            var itemwiseGrossAmt = 0;
            var itemwiseNetAmt = 0;
            var itemwiseDiscountAmt = 0;
            var itemwisemouDiscountAmt = 0;
            var SplitItemGrossAmt = 0;
            var SplitItemDiscountAmt = 0;
            var SplitItemNetAmount = 0;
            var itemwiseGstAmt = 0;
            $scope.PatientSummaryDetails.forEach((val, idx) => {
                var itemnetAmount = 0;
                var itemGrossAmount = 0;
                var itemDiscountAmount = 0;
                var itemmouDiscamt = 0;
                var splititemGrossAmt = 0;
                var splititemDiscountAmt = 0;
                var itemtaxamt = 0;
                var splititemNetAmount = 0;

                if (val.Status == 1) {
                    if (!$scope.EncounterInfo.IsPackageAssigned) {
                        // itemGrossAmount = isNaN(parseFloat(val.ActualAmount)) ? 0 : parseFloat(val.ActualAmount); Discarded by jothi on 18/8/23 for testing(wrong total gross amount and net amount)
                        if (val.ServiceCategory.Id == 25) {
                            itemGrossAmount = isNaN(parseFloat(val.ActualAmount)) ? 0 : parseFloat(val.ActualAmount); //included by jothi on 18/8/23 for testing(wrong total gross amount and net amount)
                        } else {
                            itemGrossAmount = isNaN(parseFloat(val.ActualAmount)) ? 0 : parseFloat(val.ActualAmount);
                        }

                        itemnetAmount = isNaN(parseFloat(val.ActualNetAmount)) ? 0 : parseFloat(val.ActualNetAmount);
                        itemDiscountAmount = isNaN(parseFloat(val.DiscountAmount)) ? 0 : parseFloat(val.DiscountAmount);
                        itemtaxamt = isNaN(parseFloat(val.TaxAmount)) ? 0 : parseFloat(val.TaxAmount);
                        if (val.ServiceCategory.Id == 25) { //Added by jothi 18/8/23
                            itemGrossAmount -= itemDiscountAmount;
                            itemGrossAmount += itemtaxamt;
                        }
                        itemwiseGrossAmt += itemGrossAmount;
                        itemwiseNetAmt += itemnetAmount;
                        itemwiseDiscountAmt += itemDiscountAmount;
                        itemwisemouDiscountAmt += itemmouDiscamt;
                        splititemGrossAmt += isNaN(parseFloat(val.ActualPatAmount)) ? 0 : parseFloat(val.ActualPatAmount);
                        SplitItemGrossAmt += splititemGrossAmt;
                        SplitItemDiscountAmt += splititemDiscountAmt;
                        itemwiseGstAmt += itemtaxamt;
                    } else {
                        itemGrossAmount = isNaN(parseFloat(val.GroupGrossAmount)) ? 0 : parseFloat(val.GroupGrossAmount);
                        itemnetAmount = isNaN(parseFloat(val.GroupNetAmount)) ? 0 : parseFloat(val.GroupNetAmount);
                        splititemGrossAmt = isNaN(parseFloat(val.ExclusionAmount)) ? 0 : parseFloat(val.ExclusionAmount);
                        itemwiseGrossAmt += itemGrossAmount;
                        itemwiseNetAmt += itemnetAmount;
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

            $scope.item.AgreementDiscountAmt = itemwisemouDiscountAmt;
            if (itemwisemouDiscountAmt > 0) {
                $scope.item.IsInsAgreementDiscount = true;
            }
            if (!$scope.EncounterInfo.IsPackageAssigned) {
                $scope.item.GrossAmount = itemwiseGrossAmt;
            } else {
                $scope.item.GrossAmount = itemwiseGrossAmt + SplitItemGrossAmt;
            }
            $scope.currentcontext.viewGrossAmount = itemwiseGrossAmt - (SplitItemGrossAmt || 0);
            $scope.item.DiscountAmount = itemwiseDiscountAmt;
            $scope.item.NetAmount = itemwiseNetAmt;

            $scope.item.SplitGrossAmount = SplitItemGrossAmt;
            $scope.item.SplitDiscountAmount = SplitItemDiscountAmt;
            $scope.item.SplitNetAmount = SplitItemGrossAmt;
            $scope.item.GSTAmount = itemwiseGstAmt;

            $scope.currentcontext.TotGrossAmount = 0;
            $scope.currentcontext.TotDiscAmount = 0;
            $scope.currentcontext.TotRefundAmount = 0;
            $scope.currentcontext.TotNetAmount = 0;
            $scope.currentcontext.mouDiscAmount = 0;
            $scope.currentcontext.TotBalanceAmt = 0;
            if ($scope.item.GuarantorTypeId == 1) {
                $scope.currentcontext.ReceiptAmt = (!$scope.currentcontext.ReceiptAmt) ? 0 : $scope.currentcontext.ReceiptAmt;
            } else {
                if (!$scope.FinalBillInfo) {
                    $scope.currentcontext.ReceiptAmt = $scope.item.NetPatientAmount;
                }
            }
            if ($scope.currentcontext.TotalRefundAmount !== null && $scope.currentcontext.TotalRefundAmount !== 'NaN') {
                $scope.currentcontext.TotRefundAmount = parseFloat($scope.currentcontext.TotalRefundAmount);
            }
            $scope.currentcontext.TotGrossAmount = $scope.item.GrossAmount + $scope.item.SplitDiscountAmount;
            $scope.currentcontext.TotNetAmount = $scope.item.NetAmount;
            if ($scope.currentcontext.BillDiscount > 0) {
                if ($scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 2) {
                    if ($scope.item.GuarantorTypeId == 1) {
                        $scope.currentcontext.TotDiscAmount = (parseFloat($scope.currentcontext.BillDiscount) / 100 * $scope.item.GrossAmount);
                    } else { $scope.currentcontext.TotDiscAmount = (parseFloat($scope.currentcontext.BillDiscount) / 100 * $scope.item.NetPatientAmount); }
                } else if ($scope.currentfilter.DiscountModeId == 1) {
                    $scope.currentcontext.TotDiscAmount = parseFloat($scope.currentcontext.BillDiscount);
                }
                if (!$scope.FinalBillInfo)
                    $scope.currentcontext.TotDiscAmount = $scope.currentcontext.TotDiscAmount + itemwiseDiscountAmt + SplitItemDiscountAmt;
            } else if (itemwiseDiscountAmt > 0 || SplitItemDiscountAmt > 0) {
                $scope.currentcontext.TotDiscAmount = itemwiseDiscountAmt + SplitItemDiscountAmt;
            }

            // if ($scope.item.GuarantorTypeId == 1) {
            $scope.currentcontext.TotNetAmount = parseFloat($scope.currentcontext.TotGrossAmount) + parseFloat($scope.item.GSTAmount || 0) - parseFloat($scope.currentcontext.TotDiscAmount);
            // } else {
            //     $scope.currentcontext.TotNetAmount = parseFloat($scope.currentcontext.TotGrossAmount) + parseFloat($scope.item.GSTAmount || 0);
            // }

            if (isNaN($scope.currentcontext.TotNetAmount)) $scope.currentcontext.TotNetAmount = 0;
            if (isNaN($scope.currentcontext.ReceiptAmt)) $scope.currentcontext.ReceiptAmt = 0;
            if (isNaN($scope.currentcontext.TotPaidAmount)) $scope.currentcontext.TotPaidAmount = 0;
            if (isNaN($scope.currentcontext.TotRefundAmount)) $scope.currentcontext.TotRefundAmount = 0;

            // $scope.currentcontext.TotNetAmount = parseFloat($scope.currentcontext.TotGrossAmount) - parseFloat($scope.currentcontext.TotDiscAmount);

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



            if ($scope.FinalBillInfo && $scope.FinalBillInfo.Id > 0) {
                $scope.currentcontext.TotBalanceAmt = $scope.FinalBillInfo.OutStandingAmount;
            } else {
                $scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.TotNetAmount) -
                    parseFloat($scope.currentcontext.ReceiptAmt) -
                    (parseFloat($scope.currentcontext.TotPaidAmount) -
                        parseFloat($scope.currentcontext.TotRefundAmount));
            }
            if ($scope.item.GuarantorTypeId == 1) {
                var billBalance = parseFloat($scope.currentcontext.TotNetAmount) - (parseFloat($scope.currentcontext.TotPaidAmount) - parseFloat($scope.currentcontext.TotRefundAmount));
            } else {
                console.log($scope.item);
                var billBalance = parseFloat($scope.item.NetPatientAmount) - (parseFloat($scope.currentcontext.TotPaidAmount) - parseFloat($scope.currentcontext.TotRefundAmount));
            }
            if (!$scope.FinalBillInfo) {
                if ($scope.currentcontext.ReceiptAmt > 0) {
                    if ($scope.currentcontext.ReceiptAmt > billBalance) {
                        utl.Alert.showErrorMsg('Receipt Amount should not be greater than Balance Amount');
                        $scope.currentcontext.ReceiptAmt = 0;
                        //                 return true;
                    }
                }
            }

            if ($scope.item.GuarantorTypeId > 1) {
                if (!$scope.FinalBillInfo) {
                    $scope.currentcontext.ReceiptAmt = parseFloat($scope.currentcontext.TotNetAmount) -
                        parseFloat($scope.item.NetInsuranceAmount) -
                        (parseFloat($scope.currentcontext.TotalReceiptAmount) - parseFloat($scope.currentcontext.TotRefundAmount));
                }
            }
            if ($scope.FinalBillInfo && $scope.FinalBillInfo.Id > 0) {
                // if ($scope.item.GuarantorTypeId ==1) {
                $scope.currentcontext.TotBalanceAmt = $scope.FinalBillInfo.OutStandingAmount;
                //  }
                // if ($scope.item.GuarantorTypeId > 1) {
                $scope.currentcontext.PatOutstandingAmt = $scope.FinalBillInfo.PatientDue;
                // }
            } else {
                if ($scope.item.GuarantorTypeId == 1) {
                    $scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.TotNetAmount) -
                        parseFloat($scope.currentcontext.ReceiptAmt) -
                        (parseFloat($scope.currentcontext.TotPaidAmount) - parseFloat($scope.currentcontext.TotRefundAmount));
                } else {
                    $scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.TotNetAmount) -
                        parseFloat($scope.item.NetInsuranceAmount) -
                        (parseFloat($scope.currentcontext.TotPaidAmount) - parseFloat($scope.currentcontext.TotRefundAmount));
                }
            }

            if (!$scope.FinalBillInfo) {
                if ($scope.item.GuarantorTypeId > 1) {
                    $scope.currentcontext.PatOutstandingAmt = parseFloat($scope.currentcontext.TotNetAmount) -
                        parseFloat($scope.item.NetInsuranceAmount) -
                        parseFloat($scope.currentcontext.ReceiptAmt) -
                        (parseFloat($scope.currentcontext.TotPaidAmount) - parseFloat($scope.currentcontext.TotRefundAmount));
                }
            }
            $scope.item.Received = $scope.currentcontext.ReceiptAmt !== 0 ?
                $scope.currentcontext.ReceiptAmt : $scope.currentcontext.TotPaidAmount !== 0 ? $scope.currentcontext.TotPaidAmount : 0;
            if ($scope.FinalBillInfo && $scope.FinalBillInfo.Id > 0) {
                if ($scope.currentcontext.TotGrossAmount > 0) {
                    $scope.canShowSaveBtn = true;
                }
            } else {
                $scope.canShowSaveBtn = false;
            }

            if ($scope.currentcontext.TotDiscAmount > $scope.currentcontext.TotGrossAmount) {
                $scope.currentcontext.BillDiscount = 0;
                $scope.currentcontext.ReceiptAmt = 0;
                $scope.currentcontext.TotBalanceAmt = 0;
                $scope.currentcontext.TotDiscAmount = itemwiseDiscountAmt + SplitItemDiscountAmt;
                utl.Alert.showSuccessMsg($translate.instant('billing.ipbillingtab.billdiscount.lbl'));
            }

            if ($scope.currentcontext.TotDiscAmount > 0) {
                if ($scope.FinalBillInfo && $scope.FinalBillInfo.Id > 0) {
                    $scope.currentcontext.FSTypeId = $scope.FinalBillInfo.FSTypeId;
                } else if ($scope.currentcontext.TotBalanceAmt < 0) {
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
                    // $scope.currentcontext.FSTypeId = 2;
                    $scope.currentcontext.FSTypeId = 4;
                    // $scope.canChangeFSType = false;
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
            } else {
                if ($scope.FinalBillInfo && $scope.FinalBillInfo.Id > 0) {
                    $scope.currentcontext.FSTypeId = $scope.FinalBillInfo.FSTypeId;
                } else if ($scope.currentcontext.TotBalanceAmt < 0) {
                    $scope.currentcontext.FSTypeId = 4;
                    $scope.canChangeFSType = false;

                    $scope.lookup["SettlementType"] = $scope.lookup["SettlementType"].filter(function(item) {
                        return (item.Code !== "Receipt" && item.Code !== "CreditVoucher" && item.Code !== "BillTransfer");
                    });
                } else {
                    $scope.lookup["SettlementType"] = $scope.lookup["SettlementType"].filter(function(item) {
                        return (item.Code !== "Refund" && item.Code !== "TobeRefunded");
                    });
                }
            }

            if (!$scope.FinalBillInfo) {
                if ($scope.item.GuarantorTypeId != 1 && $scope.item.NetPatientAmount > 0) {
                    if ($scope.currentcontext.FSTypeId == -1 || !$scope.currentcontext.FSTypeId) {
                        $scope.currentcontext.FSTypeId = 1;
                    }
                } else if ($scope.item.GuarantorTypeId != 1) {
                    if ($scope.currentcontext.FSTypeId == -1 || !$scope.currentcontext.FSTypeId) {
                        $scope.currentcontext.FSTypeId = 3;
                    }
                }
            }
            /* Discount Limit Validation */
            if ($scope.currentcontext.TotDiscAmount > 0) {
                $scope.DiscountAlert = '';
                $scope.IsDiscountApproved = true;
                if ($scope.currentcontext.DiscountApprovedBy > 0) {
                    if ($scope.DiscountLimit != null && $scope.item.TotDiscAmount > $scope.DiscountLimit) {
                        if ($scope.currentcontext.TotDiscAmount > $scope.DiscountLimit) {
                            $scope.DiscountAlert = 'Maximum Discount of Rs.' + $scope.DiscountLimit + ' Only Can be Given For the Selected Discount Approver';
                            utl.Alert.showErrorMsg($scope.DiscountAlert);
                            $scope.IsDiscountApproved = false;
                        }
                    }
                } else {
                    // $scope.DiscountAlert = 'Please Select Discount Approver';
                    // utl.Alert.showErrorMsg($scope.DiscountAlert);
                    $scope.IsDiscountApproved = false;
                }
            }
            // $scope.$parent.ReceivedAmt = $scope.item.Received;
            if (!$scope.canShowSaveBtn) {
                if ($scope.item.Received > 0 && $scope.currentcontext.TotalReceiptAmount > 0)
                    $scope.item.Received -= $scope.currentcontext.TotalReceiptAmount;
            }

            // else {
            //     $scope.$parent.ReceivedAmt = $scope.currentcontext.TotalReceiptAmount;
            // }
        };

        function getNatural(num) {
            return parseFloat(num.toString().split(".")[0]);
        }

        function getDecimal(num) {
            return parseFloat(num.toString().split(".")[1]);
        }

        $scope.setDiscountLimit = function(item) {
            $scope.DiscountLimit = item.DiscountLimit;
            if (item.DiscountMode) {
                if (item.DiscountMode.Description == "%") {
                    $scope.DiscountLimit = (parseFloat($scope.item.GrossAmount) * item.DiscountLimit) / 100;
                }
            }
            if ($scope.item.GuarantorId == 1) {
                $scope.CalculateNetAmt();
            }

        };

        $scope.calcinsamt = function() {
            if (!$scope.currentcontext.ReceiptAmt) {
                $scope.currentcontext.ReceiptAmt = 0;
            }
            $scope.item.NetPatientAmount = parseFloat($scope.currentcontext.TotNetAmount) - parseFloat($scope.currentcontext.NetInsuranceAmount);
            $scope.currentcontext.BalanceInsurance = $scope.item.NetInsuranceAmount - ($scope.currentcontext.InsuranceAmount || 0);
            if ($scope.currentcontext.BillDiscount > 0) {
                if ($scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 2) {
                    $scope.currentcontext.TotDiscAmount = (parseFloat($scope.currentcontext.BillDiscount) / 100 * $scope.item.NetPatientAmount);
                    if ($scope.currentcontext.TotDiscAmount > $scope.item.NetPatientAmount) {
                        $scope.currentcontext.BillDiscount = 0;
                        $scope.currentcontext.TotDiscAmount = 0;
                        utl.Alert.showErrorMsg($translate.instant('Maximum Discount'));
                    } else {
                        $scope.currentcontext.TotDiscAmount = (parseFloat($scope.currentcontext.BillDiscount) / 100 * $scope.item.NetPatientAmount);
                    }
                } else if ($scope.currentfilter.DiscountModeId == 1) {
                    $scope.currentcontext.TotDiscAmount = parseFloat($scope.currentcontext.BillDiscount);
                }
            } else {
                $scope.currentcontext.TotDiscAmount = 0;
            }
            // if ($scope.currentcontext.TotDiscAmount > 0) {
            //     $scope.currentcontext.TotNetAmount = parseFloat($scope.item.NetAmount) - parseFloat($scope.currentcontext.TotDiscAmount);
            // }
            if ($scope.currentcontext.TotalReceiptAmount > 0) {
                $scope.item.NetPatientAmount = (parseFloat($scope.currentcontext.TotNetAmount) - parseFloat($scope.currentcontext.TotDiscAmount) - parseFloat($scope.item.NetInsuranceAmount)) + parseFloat($scope.currentcontext.BalanceInsurance);
                $scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.TotNetAmount) -
                    parseFloat($scope.currentcontext.InsuranceAmount) -
                    (parseFloat($scope.currentcontext.TotPaidAmount) - parseFloat($scope.currentcontext.TotRefundAmount));
                if (parseFloat($scope.currentcontext.BillDiscount) > 0 && parseFloat($scope.item.NetPatientAmount) > 0) {
                    $scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.TotBalanceAmt) - parseFloat($scope.currentcontext.TotDiscAmount);
                }
                $scope.currentcontext.ReceiptAmt = $scope.currentcontext.TotBalanceAmt;
            }
            if ($scope.currentcontext.TotalReceiptAmount == 0) {
                if ($scope.item.NetPatientAmount > 0) {
                    $scope.item.NetPatientAmount = (parseFloat($scope.currentcontext.TotNetAmount) - parseFloat($scope.item.NetInsuranceAmount)) + parseFloat($scope.currentcontext.BalanceInsurance);
                }
                if (parseFloat($scope.currentcontext.BillDiscount) > 0 && parseFloat($scope.item.NetPatientAmount) > 0) {
                    $scope.item.NetPatientAmount = parseFloat($scope.currentcontext.NetPatientAmount) - parseFloat($scope.currentcontext.TotDiscAmount);
                    $scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.TotBalanceAmt) - parseFloat($scope.currentcontext.TotDiscAmount);
                }
                if (parseFloat($scope.currentcontext.BillDiscount) > 0 && parseFloat($scope.item.NetInsuranceAmount) > 0 && parseFloat($scope.item.NetPatientAmount) == 0) {
                    $scope.item.NetInsuranceAmount = parseFloat($scope.currentcontext.NetInsuranceAmount) - parseFloat($scope.currentcontext.TotDiscAmount);
                    $scope.currentcontext.InsuranceAmount = $scope.item.NetInsuranceAmount;
                }
                $scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.TotNetAmount) -
                    parseFloat($scope.currentcontext.InsuranceAmount) - parseFloat($scope.currentcontext.TotDiscAmount) -
                    (parseFloat($scope.currentcontext.TotPaidAmount) - parseFloat($scope.currentcontext.TotRefundAmount));
                if (!$scope.currentcontext.ReceiptAmt && $scope.currentcontext.ReceiptAmt != 0) {
                    $scope.currentcontext.ReceiptAmt = $scope.currentcontext.TotBalanceAmt;
                }
            }
            if ($scope.currentcontext.TotBalanceAmt > 0) {
                $scope.currentcontext.PatOutstandingAmt = $scope.currentcontext.TotBalanceAmt;
            }
            if ($scope.currentcontext.TotBalanceAmt == 0) {
                $scope.currentcontext.PatOutstandingAmt = $scope.currentcontext.TotBalanceAmt;
            }
            // }
            // $scope.item.CreditApproved = parseFloat($scope.currentcontext.InsuranceAmount);
            if ($scope.currentcontext.ReceiptAmt > 0) {
                $scope.currentcontext.FSTypeId = 1;
            }
            if ($scope.currentcontext.TotBalanceAmt < 0) { //Newly included
                $scope.item.changeCreditVoucher = 1;
                $scope.item.CreditApproved = parseFloat($scope.currentcontext.InsuranceAmount);
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
                $scope.currentcontext.FSTypeId = 4;
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
                if ($scope.currentcontext.BalanceInsurance > 0) {
                    $scope.currentcontext.FSTypeId = 1;
                    $scope.item.changeCreditVoucher = 1;
                    $scope.item.CreditApproved = parseFloat($scope.currentcontext.InsuranceAmount);
                }
            }

        }

        $scope.OnLoadPackageItem = function(SelectedItem) {
            if (SelectedItem.IsPackage) {
                utl.Alert.showSuccessMsg($translate.instant('billing.ipbillingtab.needtoload.lbl'));
            } else {
                SelectedItem.IsPackage = false;
                utl.Alert.showSuccessMsg($translate.instant('billing.ipbillingtab.noneedtoload.lbl'));
            }
        };

        $scope.LoadPackageItem = function(SelectedItem) {
            $scope.OnLoadPackageItem(SelectedItem);
        };

        $scope.clear = function() {
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
            $scope.PatientSummaryDetails = [];
            $scope.PatientPaymentDetails = [];

            $scope.isSaving = false;
            $scope.outStanding = false;
        };

        $scope.addPay = function() {
            utl.Modal.open('app.opbilling-form', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.editInfo = function() {
            utl.Modal.open('app.opbillinginfo-form', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.pendingOrder = function() {
            utl.Modal.open('app.pendingorder-list', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.findBill = function() {
            utl.Modal.open('app.findbill-list', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.pendingBill = function() {
            utl.Modal.open('app.pendingbill-list', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.patientprofiledetails = function() {
            utl.Modal.open('app.patientprofiledetails', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.billHistory = function() {
            utl.Modal.open('app.billhistory-list', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.add_new = function() {
            utl.Modal.open('app.opbilling-list', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.attachment = function() {
            utl.Modal.open('app.patientattachments', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.previousOrders = function() {
            utl.Modal.open('app.previousorders', {
                params: {
                    eid: $scope.currentcontext.EncounterId,
                    pid: $scope.item.PatientId
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.otregister = function() {
            utl.Modal.open('patientemr.otregisters', {
                params: {
                    eid: $scope.currentcontext.EncounterId,
                    pid: $scope.item.PatientId
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.oppharmacylist = function(summaryviewflag) {
            utl.Modal.open('app.oppharmacybills', {
                params: {
                    eid: $scope.currentcontext.EncounterId,
                    pid: $scope.item.PatientId,
                    summaryview: summaryviewflag
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.supplementaryCallback = function(data) {
            if (data.method == 'print') {
                $scope.print3($scope.currentcontext.EncounterId, data.categoryid, data.categoryname);
            }
        };

        $scope.getSupplementaryDetailsCallback = function(scope, data, options, hasError) {
            $scope.SupplementaryDetails = [];
            // $timeout(function() {
            $scope.SupplementaryDetails = data.Data;
            var TotalSupplementAmt = 0;
            for (var idx in $scope.SupplementaryDetails) {
                var supplementData = $scope.SupplementaryDetails[idx];
                // if (supplementData.IsPartialSupplemetary && options.data.Data.IsSupplementary == false) {
                //     supplementData.NetAmount = supplementData.InsNetAmount;
                // }
                // if (supplementData.IsPartialSupplemetary && options.data.Data.IsSupplementary == true) {
                //     supplementData.NetAmount = supplementData.PatNetAmount;
                // } else {
                //     supplementData.NetAmount = supplementData.NetAmount;
                // }
                TotalSupplementAmt = TotalSupplementAmt + supplementData.NetAmount;
            }
            // }, 1000);
            $scope.TotSupplementAmt = TotalSupplementAmt;
        };

        $scope.getSupplementaryDetails = function(bill, issupplementary) {
            var inputData = {
                Data: {
                    IsSupplementary: issupplementary
                },
                Params: [{
                    Key: 4,
                    Value: 3
                },
                {
                    Key: 3,
                    Value: bill.EncounterId
                },
                {
                    Key: 5,
                    Value: bill.ServiceCategoryId
                },
                {
                    Key: 12,
                    Value: true
                },
                    // {
                    //     Key: 9,
                    //     Value: issupplementary
                    // },
                    // {
                    //     Key: 40,
                    //     Value: true
                    // }
                ]
            };
            if (issupplementary == false) {
                inputData.Params.push({
                    Key: 40,
                    Value: true
                })
            }
            if (issupplementary == true) {
                inputData.Params.push({
                    Key: 9,
                    Value: issupplementary
                })
            }
            var options = {
                action: 'Billing/PatientBillDetails/GetPatientBillDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getSupplementaryDetailsCallback
            };

            utl.Http.doAction(options);
        };

        $scope.CalcNetInsAmt = function() {
            var itemwiseNetInsAmt = 0;
            var itemwiseNetPatAmt = 0;
            var itemwiseMouDisc = 0;
            for (var pdx in $scope.PatientBillDetailsforDiscount) {
                var billDetail = $scope.PatientBillDetailsforDiscount[pdx];
                var itemInsAmt = 0;
                var itemPatAmt = 0;
                var itemMouDiscAmt = 0;
                itemInsAmt = isNaN(parseFloat(billDetail.InsNetAmount)) ? 0 : parseFloat(billDetail.InsNetAmount);
                itemPatAmt = isNaN(parseFloat(billDetail.PatNetAmount)) ? 0 : parseFloat(billDetail.PatNetAmount);
                itemwiseNetInsAmt += itemInsAmt;
                itemwiseNetPatAmt += itemPatAmt;
                itemwiseMouDisc += itemMouDiscAmt;
            }
            $scope.item.NetInsuranceAmount = parseFloat(itemwiseNetInsAmt).toFixed(2);
            $scope.item.NetPatientAmount = parseFloat(itemwiseNetPatAmt).toFixed(2);
            $scope.currentcontext.MouDiscAmt = parseFloat(itemwiseMouDisc).toFixed(2);
            $scope.currentcontext.NetInsuranceAmount = parseFloat(itemwiseNetInsAmt).toFixed(2);
            $scope.currentcontext.NetPatientAmount = parseFloat(itemwiseNetPatAmt).toFixed(2);
            var InsNetNaturalValue = getNatural(Number($scope.item.NetInsuranceAmount).toFixed(2));
            var InsNetDecimalValue = getDecimal(Number($scope.item.NetInsuranceAmount).toFixed(2));
            var InsRoundOffValue = 0;

            if (InsNetDecimalValue > 0 && InsNetDecimalValue < 50) {
                $scope.item.NetInsuranceAmount = InsNetNaturalValue;
                InsRoundOffValue = -1 * (InsNetDecimalValue / 100);
                $scope.currentcontext.InsRoundOffValue = parseFloat(InsRoundOffValue);
            } else if (InsNetDecimalValue >= 50 && InsNetDecimalValue <= 99) {
                $scope.item.NetInsuranceAmount = InsNetNaturalValue + 1;
                InsRoundOffValue = (100 - InsNetDecimalValue) / 100;
                $scope.currentcontext.InsRoundOffValue = parseFloat(InsRoundOffValue);
            } else {
                InsRoundOffValue = 0;
                $scope.currentcontext.InsRoundOffValue = parseFloat(InsRoundOffValue);
            }
            $scope.currentcontext.InsuranceAmount = $scope.item.NetInsuranceAmount;
            var PatNetNaturalValue = getNatural(Number($scope.item.NetPatientAmount).toFixed(2));
            var PatNetDecimalValue = getDecimal(Number($scope.item.NetPatientAmount).toFixed(2));
            var PatRoundOffValue = 0;

            if (PatNetDecimalValue > 0 && PatNetDecimalValue < 50) {
                $scope.item.NetPatientAmount = PatNetNaturalValue;
                PatRoundOffValue = -1 * (PatNetDecimalValue / 100);
                $scope.currentcontext.PatRoundOffValue = parseFloat(PatRoundOffValue);
            } else if (PatNetDecimalValue >= 50 && PatNetDecimalValue <= 99) {
                $scope.item.NetPatientAmount = PatNetNaturalValue + 1;
                PatRoundOffValue = (100 - PatNetDecimalValue) / 100;
                $scope.currentcontext.PatRoundOffValue = parseFloat(PatRoundOffValue);
            } else {
                PatRoundOffValue = 0;
                $scope.currentcontext.PatRoundOffValue = parseFloat(PatRoundOffValue);
            }

            $scope.currentcontext.ReceiptAmt = $scope.item.NetPatientAmount;
            if (!$scope.FinalBillInfo) {
                $scope.currentcontext.PatOutstandingAmt = $scope.item.NetPatientAmount - $scope.currentcontext.ReceiptAmt;
            }
            $scope.currentcontext.PatientAmount = $scope.item.NetPatientAmount;
            $scope.CalculateNetAmt();
        }

        $scope.getPatientBillDetailsCallback = function(scope, data, options, hasError) {
            $scope.PatientBillDetailsforDiscount = [];
            $scope.PatientBillDetailsforDiscount = data.Data;
            if ($scope.item.GuarantorTypeId > 1 && !$scope.FinalBillInfo) {
                $scope.CalcNetInsAmt();
            } else {
                if ($scope.item.GuarantorTypeId > 1) {
                    $scope.CalculateNetAmt();

                } else {
                    $scope.CalculateNetAmt();
                }

                // else {
                //     if(!$scope.FinalBillInfo)
                //         $scope.CalculateNetAmt();
                // }

            }
        };

        $scope.getPatientBillDetails = function() {
            var inputData = {
                Params: [{
                    Key: 4,
                    Value: 3
                },
                {
                    Key: 3,
                    Value: $scope.currentcontext.EncounterId
                },
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'Billing/PatientBillDetails/GetPatientBillDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientBillDetailsCallback
            };

            utl.Http.doAction(options);
        };

        $scope.supplementaryDetails = function(bill, issupplementary) {
            utl.Modal.open('app.ipsupplementarydetails', {
                params: {
                    pid: $scope.item.PatientId,
                    eid: bill.EncounterId,
                    cid: bill.ServiceCategoryId,
                    categoryname: bill.ServiceCategory.ServiceCategoryName,
                    issupplementary: issupplementary
                },
                confirmCallback: $scope.supplementaryCallback
            });
        };

        $scope.intermediateBillCallback = function(data) {
            if (data.method == 'print') {
                $scope.print3($scope.currentcontext.EncounterId, data.categoryid, data.categoryname);
            }
        };

        $scope.intermediateBillDetails = function(bill, issupplementary) {
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

        $scope.print = function() {
            if (window.printcode.toLowerCase() == 'wellcare') {
                var consultDetailsLoad = true;
            } else {
                var consultDetailsLoad = false;
            }
            var inputData = {
                Id: $scope.currentcontext.EncounterId,
                Data: {
                    isFinalized: $scope.isFinalized,
                    NetInsuranceAmount: ($scope.item.NetInsuranceAmount || 0),
                    NetPatientAmount: ($scope.item.NetPatientAmount || 0),
                    TotalMou: ($scope.currentcontext.MouDiscAmt || 0),
                    isGuarantor: false,
                    PrintUser: utl.Session.getCurrentUserId(),
                    consultDetailsLoad: consultDetailsLoad,
                    PrintCode: window.printcode.toLowerCase(),
                    withHeader: $scope.item.WithHeader,
                    withoutHeader: $scope.item.WithoutHeader,
                    paymentDetail: $scope.item.WithPayments,
                    nonmedical: $scope.item.NonMedical
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

            utl.Http.doDownload(options);
        };

        $scope.printPackageDetails = function() {
            var inputData = {
                Id: $scope.currentcontext.EncounterId,
                Data: {
                    isFinalized: $scope.isFinalized,
                    isGuarantor: false,
                    PrintUser: utl.Session.getCurrentUserId(),
                    withHeader: $scope.item.WithHeader,
                    withoutHeader: $scope.item.WithoutHeader,
                    paymentDetail: $scope.item.WithPayments,
                    nonmedical: $scope.item.NonMedical
                }
            };

            if ($scope.EncounterInfo.IsPackageAssigned) {
                var action = 'Visit/EncounterIPPackage/PrintIPPatientPackageDetails';
                var options = {
                    action: action,
                    data: inputData,
                    type: 'post'
                };
                utl.Http.doDownload(options);
            } else {
                utl.Alert.showErrorMsg($translate.instant('billing.receipt-form.packagedetailserror.lbl'));
            }
        };

        $scope.printIncPackageDetails = function() {
            var inputData = {
                Id: $scope.currentcontext.EncounterId,
                Data: {
                    isFinalized: $scope.isFinalized,
                    isGuarantor: false,
                    PrintUser: utl.Session.getCurrentUserId(),
                    withHeader: $scope.item.WithHeader,
                    withoutHeader: $scope.item.WithoutHeader,
                    paymentDetail: $scope.item.WithPayments,
                    nonmedical: $scope.item.NonMedical
                }
            };

            if ($scope.EncounterInfo.IsPackageAssigned) {
                var action = 'Visit/EncounterIPPackage/PrintIPPatientInclusionPackageDetails';
                var options = {
                    action: action,
                    data: inputData,
                    type: 'post'
                };
                utl.Http.doDownload(options);
            } else {
                utl.Alert.showErrorMsg($translate.instant('billing.receipt-form.packagedetailserror.lbl'));
            }
        };

        $scope.printDischargeSlip = function() {
            var inputData = {
                Id: $scope.currentcontext.EncounterId,
                Data: {
                    withHeader: $scope.item.WithHeader,
                    withoutHeader: $scope.item.WithoutHeader,
                    paymentDetail: $scope.item.WithPayments,
                    nonmedical: $scope.item.NonMedical
                }
            };
            var options = {
                action: 'Visit/Visit/DischargeSlipPrint',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }

        $scope.print2 = function() {
            var inputData = {
                Id: $scope.currentcontext.EncounterId,
                Data: {
                    isFinalized: $scope.isFinalized,
                    isGuarantor: false,
                    ShowAliasInfo: $scope.item.ShowAliasInfo,
                    PrintUser: utl.Session.getCurrentUserId(),
                    withHeader: $scope.item.WithHeader,
                    withoutHeader: $scope.item.WithoutHeader,
                    paymentDetail: $scope.item.WithPayments,
                    nonmedical: $scope.item.NonMedical,
                    isSupplementary: false
                }
            };
            var Action = 'billing/patientbills/PrintInpatientBillDetails';
            // var Action = 'billing/patientbills/NewPrintInpatientBills';
            if (window.printcode.toLowerCase() == 'prakriya') {
                Action = 'billing/patientbills/PrintInpatientBillDetails';
            } else if (window.printcode.toLowerCase() == 'promed') {
                Action = 'billing/patientbills/NewPrintInpatientBills';
            }
            var options = {
                action: Action,
                data: inputData,
                type: 'post'
            };

            utl.Http.doDownload(options);
        };

        $scope.dailyprint = function() {
            utl.Modal.open('app.dailyprint', {
                params: {
                    id: $scope.currentcontext.EncounterId,
                    isFinalized: $scope.isFinalized,
                    isGuarantor: false,
                    fromdate: $scope.item.DOA,
                    PrintUser: utl.Session.getCurrentUserId()
                },
                confirmCallback: $scope.getItem
            });
        };

        // $scope.print8 = function() {
        //     var inputData = {
        //         Id: $scope.currentcontext.EncounterId,
        //         Data: {
        //             isFinalized: $scope.isFinalized,
        //             isGuarantor: false,
        //             PrintUser: utl.Session.getCurrentUserId()
        //         }
        //     };
        //     var options = {
        //         action: 'billing/patientbills/PrintDailyInpatientBills',
        //         data: inputData,
        //         type: 'post'
        //     };

        //     utl.Http.doDownload(options);
        // };

        $scope.print3 = function(EncounterId, ServiceCategoryId, ServiceName) {
            var inputData = {
                Id: EncounterId,
                Data: {
                    isFinalized: $scope.isFinalized,
                    ServiceCategoryId: ServiceCategoryId,
                    ServiceName: ServiceName,
                    isGuarantor: false,
                    IsTempIPBill: true,
                    PrintUser: utl.Session.getCurrentUserId(),
                    withHeader: $scope.item.WithHeader,
                    withoutHeader: $scope.item.WithoutHeader,
                    paymentDetail: $scope.item.WithPayments,
                    nonmedical: $scope.item.NonMedical
                }
            };

            var options = {
                action: 'billing/Patientbilldetails/PrintPatientBillDetails',
                data: inputData,
                type: 'post'
            };

            utl.Http.doDownload(options);
        };

        $scope.otpharmacyprint = function() {
            var inputData = {
                Id: $scope.currentcontext.SurgeryEntryId,
                Data: {
                    isprint: false,
                    withHeader: $scope.item.WithHeader,
                    withoutHeader: $scope.item.WithoutHeader,
                    paymentDetail: $scope.item.WithPayments,
                    nonmedical: $scope.item.NonMedical
                }
            };
            var options = {
                action: 'billing/patientbills/PrintOTBillingPharmacyBills',
                data: inputData,
                type: 'post'
            };

            utl.Http.doDownload(options);
        };

        $scope.print4 = function() {
            var inputData = {
                Id: $scope.currentcontext.EncounterId,
                Data: {
                    isGuarantor: true,
                    isFinalized: $scope.isFinalized,
                    PrintUser: utl.Session.getCurrentUserId(),
                    withHeader: $scope.item.WithHeader,
                    withoutHeader: $scope.item.WithoutHeader,
                    paymentDetail: $scope.item.WithPayments,
                    nonmedical: $scope.item.NonMedical
                }
            };
            var Action = 'billing/patientbills/PrintInpatientBills';
            if (window.printcode.toLowerCase() == 'prakriya') {
                Action = 'billing/patientbills/PrintInpatientBillDetails';
            }
            var options = {
                action: Action,
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.print5 = function() {
            var inputData = {
                Id: $scope.currentcontext.EncounterId,
                Data: {
                    isGuarantor: true,
                    isFinalized: $scope.isFinalized,
                    PrintUser: utl.Session.getCurrentUserId(),
                    withHeader: $scope.item.WithHeader,
                    withoutHeader: $scope.item.WithoutHeader,
                    paymentDetail: $scope.item.WithPayments,
                    nonmedical: $scope.item.NonMedical
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

            utl.Http.doDownload(options);
        };

        $scope.print6 = function() {
            var inputData = {
                Id: $scope.currentcontext.EncounterId,
                Data: {
                    isGuarantor: false,
                    isFinalized: $scope.isFinalized,
                    isSupplementary: true,
                    PrintUser: utl.Session.getCurrentUserId(),
                    withHeader: $scope.item.WithHeader,
                    withoutHeader: $scope.item.WithoutHeader,
                    paymentDetail: $scope.item.WithPayments,
                    nonmedical: $scope.item.NonMedical
                }
            };

            var options = {
                action: 'billing/patientbills/PrintInpatientBills',
                data: inputData,
                type: 'post'
            };

            utl.Http.doDownload(options);
        };
        $scope.printnonmedical = function() {
            var inputData = {
                Id: $scope.currentcontext.EncounterId,
                Data: {
                    isGuarantor: false,
                    isFinalized: $scope.isFinalized,
                    isSupplementary: true,
                    PrintUser: utl.Session.getCurrentUserId(),
                    withHeader: $scope.item.WithHeader,
                    withoutHeader: $scope.item.WithoutHeader,
                    paymentDetail: $scope.item.WithPayments,
                    nonmedical: $scope.item.NonMedical
                }
            };

            var options = {
                action: 'billing/patientbills/PrintNonMedical',
                data: inputData,
                type: 'post'
            };

            utl.Http.doDownload(options);
        };

        $scope.print7 = function() {
            var inputData = {
                Id: $scope.currentcontext.EncounterId,
                Data: {
                    isprint: false,
                    withHeader: $scope.item.WithHeader,
                    withoutHeader: $scope.item.WithoutHeader,
                    paymentDetail: $scope.item.WithPayments,
                    nonmedical: $scope.item.NonMedical
                }
            };
            var options = {
                action: 'billing/patientbills/PrintIPBillingPharmacyBills',
                data: inputData,
                type: 'post'
            };

            utl.Http.doDownload(options);
        };

        $scope.backToList = function() {
            if ($scope.currentfilter.from == 'dcdischarges' && $scope.currentfilter.isdaycare) {
                $state.go('app.daycaredischargebilling');
            } else if ($scope.currentfilter.isdaycare) {
                $state.go('app.daycarebilling');
            } else {
                if ($scope.item.AdmissionStatusId == 6) {
                    $state.go('app.discharged-patients');
                    // {
                    //     filter_id: $scope.FinalBillInfo.Id,
                    //     filter_from: $scope.currentfilter.filter_from,
                    //     filter_to: $scope.currentfilter.filter_to,
                    //     filter_phone: $scope.currentfilter.filter_phone,
                    //     filter_guarantor: $scope.currentfilter.filter_guarantor,
                    //     filter_guarantortype: $scope.currentfilter.filter_guarantortype,
                    //     filter_doctor: $scope.currentfilter.filter_doctor,
                    //     filter_dept: $scope.currentfilter.filter_dept,
                    //     filter_isout: $scope.currentfilter.filter_isout,
                    // });
                    // {
                    //     filter_id: $scope.currentfilter.billid,
                    //     filter_facilityid: utl.Session.getCurrentFacilityId,
                    //     filter_wardid: $scope.currentfilter.WardId,
                    //     filter_doctorid: $scope.currentfilter.DoctorId,
                    //     filter_departmentid: $scope.currentfilter.DepartmentId,
                    //     filter_patientmrn: $scope.currentfilter.PatientMRN,
                    //     filter_visitidentifier: $scope.currentfilter.VisitIdentifier,
                    //     filter_admissionstatusid: $scope.currentfilter.AdmissionStatusId,
                    //     filter_activestatusid: $scope.currentfilter.ActiveStatusId,
                    //     filter_phone: $scope.currentfilter.Phone,
                    //     filter_guarantorid: $scope.currentfilter.GuarantorId,
                    //     filter_guarantortypeid: $scope.currentfilter.GuarantorTypeId,
                    //     filter_isbilllock: $scope.currentfilter.IsBillLock,
                    //     filter_isestimatedbill: $scope.currentfilter.IsEstimatedBill,
                    //     filter_billfromdate: $scope.currentfilter.BillFromDate,
                    //     filter_billtodate: $scope.currentfilter.BillToDate,
                    //     filter_doa: $scope.currentfilter.DOA,
                    // });
                } else {
                    $state.go('app.inpatient-billing', {
                        filter_id: $scope.currentfilter.billid,
                        filter_facilityid: utl.Session.getCurrentFacilityId,
                        filter_wardid: $scope.currentfilter.WardId,
                        filter_doctorid: $scope.currentfilter.DoctorId,
                        filter_departmentid: $scope.currentfilter.DepartmentId,
                        filter_patientmrn: $scope.currentfilter.PatientMRN,
                        filter_visitidentifier: $scope.currentfilter.VisitIdentifier,
                        filter_admissionstatusid: $scope.currentfilter.AdmissionStatusId,
                        filter_activestatusid: $scope.currentfilter.ActiveStatusId,
                        filter_phone: $scope.currentfilter.Phone,
                        filter_guarantorid: $scope.currentfilter.GuarantorId,
                        filter_guarantortypeid: $scope.currentfilter.GuarantorTypeId,
                        filter_isbilllock: $scope.currentfilter.IsBillLock,
                        filter_isestimatedbill: $scope.currentfilter.IsEstimatedBill,
                        filter_billfromdate: $scope.currentfilter.BillFromDate,
                        filter_billtodate: $scope.currentfilter.BillToDate,
                        filter_doa: $scope.currentfilter.DOA,
                    });
                }
            }
        };

        var sort_by = function(field, reverse, primer) {
            var key = primer ?
                function(x) {
                    return primer(x[field]);
                } :
                function(x) {
                    return x[field];
                };

            reverse = !reverse ? 1 : -1;

            return function(a, b) {
                return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
            };
        };

        $scope.plusopensupplementary = function(bill, issupplementary) {
            $("#summarytable").show();
            $("#hidetotal").show();
            $scope.getSupplementaryDetails(bill, issupplementary)

        };
        $scope.plusopenselfsupplementary = function(bill, issupplementary) {
            $("#summaryselftable").show();
            $("#hidetotal").show();
            $scope.getSupplementaryDetails(bill, issupplementary)

        };
        // $scope.plusopen = function() {
        //     $("#summary").show();

        // };


        $scope.changeFSTType = function() {
            if ($scope.item.GuarantorId > 0 && $scope.currentcontext.FSTypeId == 3) {
                $scope.item.GuarantorDueId = $scope.item.GuarantorId;
                $scope.currentcontext.isSelfGuarantor = true;
            } else {
                $scope.item.GuarantorDueId = -1;
                $scope.currentcontext.isSelfGuarantor = false;
            }
        };

        $scope.loadPatientGuarantorsCallback = function(scope, data, options, hasError) {
            if (data && data.PatientGuarantor)
                $scope.lookup['PatientGuarantor'] = [];

            data.PatientGuarantor.sort(sort_by('Rank', false, parseInt));
            $scope.lookup['PatientGuarantor'] = data.PatientGuarantor;

            for (var patientguarantoridx in $scope.lookup.PatientGuarantor) {
                var patientguarantor = $scope.lookup.PatientGuarantor[patientguarantoridx];
                if (patientguarantor.GuarantorId == $scope.item.GuarantorId) {
                    var SelectedGuarantorId = $scope.item.GuarantorId;
                    var SelectedGuarantorName = patientguarantor.GuarantorName;
                    var SelectedGuarantorCreditLimit = patientguarantor.CreditLimit;
                    // $scope.item.GuarantorId = -1;
                    $timeout(function() {
                        $scope.item.GuarantorId = SelectedGuarantorId;
                        $scope.item.GuarantorName = SelectedGuarantorName;
                        $scope.currentcontext.InsApprovalAmt = SelectedGuarantorCreditLimit;
                    }, 800);
                }
            }

            if ($scope.item.GuarantorTypeId != 1) {
                $scope.item.GuarantorDueId = $scope.item.GuarantorId;
            } else {
                $scope.item.GuarantorDueId = 0;
            }
        };

        $scope.loadPatientGuarantors = function() {
            if ($scope.item.PatientId && $scope.item.PatientId > 0) {
                var inputData = [{
                    Key: "PatientGuarantor",
                    Request: {
                        Params: [{
                            Key: 1,
                            Value: 2
                        }, {
                            Key: 2,
                            Value: $scope.item.PatientId
                        }]
                    }
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

        $scope.onPatientGuarantorChange = function(selected) {
            var patientGuarantorId = utl.Lookup.getDefault($scope.lookup.PatientGuarantor, 'SELF');
            $scope.currentcontext.isSelfGuarantor = parseInt($scope.item.GuarantorDueId) == parseInt(patientGuarantorId);
        };

        $scope.onFamilyLinkChange = function(selected) {
            $scope.currentcontext.FamilyLinkId = selected.Id;
            $scope.currentcontext.TransferEncounterId = selected.PatientEncounter.Id;
            $scope.currentcontext.TransferPatientId = selected.MemberId;
        };

        $scope.loadEncounterGuarantorCallback = function(scope, res, options, hasError) {
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

                res.Data.sort(sort_by('Rank', false, parseInt));
                $scope.lookup['PatientGuarantor'] = res.Data;

                for (var patientguarantoridx in $scope.lookup.PatientGuarantor) {
                    var patientguarantor = $scope.lookup.PatientGuarantor[patientguarantoridx];
                    if (patientguarantor.GuarantorId == $scope.item.GuarantorId) {
                        var SelectedGuarantorId = $scope.item.GuarantorId;
                        var SelectedGuarantorName = patientguarantor.GuarantorName;
                        var SelectedGuarantorCreditLimit = patientguarantor.CreditLimit;
                        // $scope.item.GuarantorId = -1;
                        $timeout(function() {
                            $scope.item.GuarantorId = SelectedGuarantorId;
                            $scope.item.GuarantorName = SelectedGuarantorName;
                            $scope.currentcontext.InsApprovalAmt = SelectedGuarantorCreditLimit;
                        }, 800);
                    }
                }

                if ($scope.item.GuarantorTypeId != 1) {
                    $scope.item.GuarantorDueId = $scope.item.GuarantorId;
                } else {
                    $scope.item.GuarantorDueId = 0;
                }
            }
        };

        $scope.loadEncounterGuarantor = function() {
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.currentcontext.EncounterId
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'registration/EncounterGuarantor/GetEncounterGuarantors',
                data: inputData,
                type: 'post',
                onComplete: $scope.loadEncounterGuarantorCallback
            };

            utl.Http.doAction(options);
        };

        $scope.manageEncounterGuarantorCallback = function(scope, res, options, hasError) {
            if (res > 0)
                $scope.getEncounter();
        };

        $scope.ViewReceipt = function() {
            $scope.openReceipt($scope.currentcontext.EncounterId, 'view');
        };

        $scope.openReceipt = function(EncounterId, type) {
            utl.Modal.open('app.cancelreceipt', {
                params: {
                    EncounterId: EncounterId,
                    type: type
                },
                confirmCallback: $scope.getItem
            });
        };

        $scope.outstandingBill = function() {
            utl.Modal.open('app.outstandingbill-list', {
                params: {
                    eid: $scope.item.PatientId
                },
                confirmCallback: $scope.GetPatientBillSummary
            });
        };

        $scope.onGuarantorSelected = function(dataFromModal) {
            $scope.item.GuarantorId = dataFromModal.gid;
            $scope.item.GuarantorDueId = dataFromModal.gid;
            $scope.item.GuarantorTypeId = dataFromModal.GuarantorTypeId;

            if ($scope.item.GuarantorTypeId > 1) {
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

        $scope.addGuarantor = function() {
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

        $scope.AddPaymentDetails = function() {
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
                AmountPaid: $scope.currentcontext.ReceiptAmt,
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
                UPIRefNumber: $scope.currentcontext.PaymentTypeId == 11 ? $scope.item.UPIRefNumber : '',
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

        $scope.setPaymentType = function(selected) {
            if (selected.Id == 6 || selected.Id == 5)
                $scope.item.TerminalNoId = 2;
            else $scope.item.TerminalNoId = 0;
        };

        $scope.saveItemCallback = function(scope, data, options, hasError) {
            savehitcompleted = 0;
            if (data) {
                utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
                $scope.currentcontext.billId = options.data.Data.ParentBillId;
                $scope.BillCompleted = 1;
                loadData();
            }
        };

        $scope.getPendingOrderList = function() {
            var inputData = {
                Params: [{
                    Key: 4,
                    Value: 1
                },
                {
                    Key: 18,
                    Value: $scope.currentcontext.EncounterId
                },
                {
                    Key: 29,
                    Value: false
                }, // IsDirectBill is false order
                {
                    Key: 20,
                    Value: 2
                }, // EncountertypeId IP
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

        $scope.getPendingOrderListCallback = function(scope, res, options, hasError) {
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

        $scope.getPendingDispensesList = function() {
            var inputData = {
                Params: [{
                    Key: 4,
                    Value: [2, 3, 4]
                },
                {
                    Key: 16,
                    Value: $scope.currentcontext.EncounterId
                }
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

        $scope.getPendingDispensesListCallback = function(scope, res, options, hasError) {
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

        $scope.getPendingDispensesReturnList = function(pageNo) {
            var inputData = {
                Params: [{
                    Key: 4,
                    Value: [2, 3]
                },
                {
                    Key: 16,
                    Value: $scope.currentcontext.EncounterId
                }
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

        $scope.getPendingDispensesReturnListCallback = function(scope, res, options, hasError) {
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


        $scope.EstimatedBillDistCallback = function(dataFromModal) {
            $scope.currentcontext.EstimatedBillDist = dataFromModal.EstimatedBillDist;
            $scope.currentcontext.EstimatedBillDistTypeId = dataFromModal.EstimatedBillDistTypeId;
            $scope.CalculateNetAmt();
        }

        $scope.EstimatedBillDist = function() {
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

        /* Security IsValid */
        $scope.securitypisvalid = false;
        $scope.SecurityPINChkCallback = function(SecurityStatus) {
            //console.log(SecurityStatus);
            $scope.securitypisvalid = SecurityStatus.pinstatus;
            $scope.onSaveandApprovedConfirm();
        };
        $scope.securitydialogopened = false;
        $scope.securitypindiagCallback = function() {
            $scope.securitydialogopened = false;
        };
        $scope.securitypincheck = function() {
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


        $scope.onSaveandApprovedConfirm = function() {
            $scope.canShowSaveBtn = true;
            /* Security IsValid */
            $scope.requiredsecuritypin =
                utl.FacilitySetting.getFacilitySettingValue('billing', 'requiredsecuritypin');

            if ($scope.requiredsecuritypin && !$scope.securitypisvalid)
                if (!$scope.securitypincheck())
                    return false;

            /* Security IsValid */

            $scope.saveItem(3);
        };

        $scope.pendingorders = function() {
            utl.Modal.open('app.patientpendinglisttab', {
                params: {
                    eid: $scope.currentcontext.EncounterId
                },
                confirmCallback: $scope.RefershSplitDetailsCallback
            });
        }

        $scope.saveAndApprove = function() {
            if ($scope.ipbillflowrequired == 1) {
                if ($scope.item.AdmissionStatusId != 4) {
                    utl.Alert.showErrorMsg("Patient not yet discharged clinically");
                    return;
                }
            }
            var msg = '';
            if ($scope.currentcontext.TotDiscAmount > 0) {
                $scope.DiscountAlert = '';
                $scope.IsDiscountApproved = true;
                if ($scope.currentcontext.DiscountApprovedBy > 0) {
                    if ($scope.DiscountLimit != null && $scope.item.TotDiscAmount > $scope.DiscountLimit) {
                        if ($scope.currentcontext.TotDiscAmount > $scope.DiscountLimit) {
                            $scope.DiscountAlert = 'Maximum Discount of Rs.' + $scope.DiscountLimit + ' Only Can be Given For the Selected Discount Approver';
                            utl.Alert.showErrorMsg($scope.DiscountAlert);
                            $scope.IsDiscountApproved = false;
                        }
                    }
                } else {
                    $scope.DiscountAlert = 'Please Select Discount Approver';
                    utl.Alert.showErrorMsg($scope.DiscountAlert);
                    $scope.IsDiscountApproved = false;
                }
            }
            if ($scope.currentcontext.FSTypeId === 3) {
                if ($scope.item.GuarantorDueId <= 0) {
                    utl.Alert.showErrorMsg('Please Select the Credit Approver');
                    return false;
                }
            }
            if ($scope.currentcontext.FSTypeId != 3 && $scope.currentcontext.TotBalanceAmt > 0) {
                if ($scope.item.PrivateDueId <= 0 || !$scope.item.PrivateDueId) {
                    // if ($scope.currentcontext.PaymentTypeId < 1) {
                    utl.Alert.showErrorMsg('Please Select the Credit Approver');
                    return false;
                    // }
                }
            }
            if ($scope.currentcontext.TotDueAmount > 0) {
                utl.Alert.showErrorMsg("Patient having due amount");
            }
            if ($scope.FacilityBlockPendingOrders) {
                if ($scope.PendingOrderTestNames) {
                    $scope.BlockOrders = 1;
                    msg = "Peinding List : " + $scope.PendingOrderTestNames;
                    utl.Modal.open('app.patientpendinglisttab', {
                        params: {
                            eid: $scope.currentcontext.EncounterId
                        },
                        confirmCallback: $scope.RefershSplitDetailsCallback
                    });
                    return false;
                }
            }
            if ($scope.item.PaymentTypeId == 1) {
                if ($scope.maxadvancecash == 1) {
                    var nettotalpaidamt = $scope.totalpaidamt + parseFloat($scope.currentcontext.ReceiptAmt);
                    if (nettotalpaidamt > parseInt($scope.ipmaxcash)) {
                        utl.Alert.showErrorMsg('Receipt Amount is greater than allowed Maximum Cash.....');
                        return;
                    }
                }
            }
            if ($scope.currentcontext.FSTypeId == 2 || $scope.currentcontext.FSTypeId == 5) {
                if ($scope.item.PaymentTypeId == 1) {
                    var refamt = 0;
                    var dTotNetAmount = parseFloat($scope.currentcontext.TotNetAmount);
                    var dPaidAmt = parseFloat($scope.currentcontext.PaidAmt) + $scope.currentcontext.TotalReceiptAmount;
                    refamt = dPaidAmt - dTotNetAmount;
                    if (parseInt(refamt) > parseInt($scope.maxcashrefund)) {
                        utl.Alert.showErrorMsg('Reached limit of Max.Cash Refund...');
                        return;
                    }
                }
            }
            if ($scope.currentcontext.FSTypeId && $scope.currentcontext.FSTypeId > 0) {
                if ($scope.currentcontext.FSTypeId == 1)
                    msg = 'billing.summary.receiptconfirm.lbl';
                if ($scope.currentcontext.FSTypeId == 2)
                    msg = 'billing.summary.refundconfirm.lbl';
                if ($scope.currentcontext.FSTypeId == 3)
                    msg = 'billing.summary.creditvocherconfirm.lbl';
                if ($scope.currentcontext.FSTypeId == 4)
                    msg = 'billing.summary.toberefundconfirm.lbl';
            }

            $scope.requiredsecuritypin =
                utl.FacilitySetting.getFacilitySettingValue('billing', 'requiredsecuritypin');
            if ($scope.requiredsecuritypin) $scope.onSaveandApprovedConfirm();
            else {

                var confirmOptions = {
                    headingKey: 'common.confirm-modal-header.lbl',
                    messageKey: msg,
                    yesKey: 'common.yeskey.lbl',
                    noKey: 'common.nokey.lbl',
                    onSuccessMethod: $scope.onSaveandApprovedConfirm,
                };

                utl.Dialog.confirmMessage(confirmOptions);
            }
        };
        /*
                $scope.OnConfirm = function() {
                    var msg = '';
                    if ($scope.currentcontext.FSTypeId && $scope.currentcontext.FSTypeId > 0) {
                        if ($scope.currentcontext.FSTypeId == 1)
                            msg = 'billing.summary.receiptconfirm.lbl';
                        if ($scope.currentcontext.FSTypeId == 2)
                            msg = 'billing.summary.refundconfirm.lbl';
                        if ($scope.currentcontext.FSTypeId == 3)
                            msg = 'billing.summary.creditvocherconfirm.lbl';
                        if ($scope.currentcontext.FSTypeId == 4)
                            msg = 'billing.summary.toberefundconfirm.lbl';
                    }
                    $scope.requiredsecuritypin =
                        utl.FacilitySetting.getFacilitySettingValue('billing', 'requiredsecuritypin');
                    if ($scope.requiredsecuritypin) $scope.onSaveandApprovedConfirm();
                    else {
                        var confirmOptions = {
                            headingKey: 'common.confirm-modal-header.lbl',
                            messageKey: msg,
                            yesKey: 'common.yeskey.lbl',
                            noKey: 'common.nokey.lbl',
                            onSuccessMethod: $scope.onSaveandApprovedConfirm,
                        };
                        utl.Dialog.confirmMessage(confirmOptions);
                    }
                };
        */
        $scope.onCancelConfirmed = function() {
            $scope.saveItem(2);
        };

        $scope.ipbillingprofiles = function() {
            utl.Modal.open('app.ipbillingprofiledetails', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.patientguarantorbilling = function() {
            utl.Modal.open('app.patientguarantorbilling', {
                params: {
                    id: 0,
                    pid: $scope.currentcontext.patientid
                },
                confirmCallback: $scope.initLookup
            });
        };

        $scope.saveCancelled = function() {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'patientemr.prescription-form.cancelmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onCancelConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.saveCancelledbill = function() {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'billing.opbilling-list.cancelbillmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onCancelConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.LockReleaseBillCallBack = function(scope, res, options, hasError) {
            if (res)
                $scope.BillLockDetail = {};
            $scope.getEncounter();
            if ($scope.FacilityBlockPendingOrders) {
                $scope.getPendingOrderList();
                $scope.getPendingDispensesList();
                $scope.getPendingDispensesReturnList();
            }
        };

        $scope.LockReleaseBill = function(data) {
            var inputData = {};
            if (!data.IsLocked) {
                inputData = {
                    EncounterId: $scope.currentcontext.EncounterId,
                    PatientId: $scope.item.PatientId,
                    LockedBy: utl.Session.getCurrentUserId(),
                    LockedOn: utl.Formatter.getCurrentDate(),
                    LockStatusId: 1,
                    LockTypeId: data.LockTypeId,
                    Comments: data.Comments,
                    GuarantorTypeId: $scope.item.GuarantorTypeId,
                };
            } else {
                inputData = {
                    Id: $scope.BillLockDetail.Id,
                    EncounterId: $scope.currentcontext.EncounterId,
                    PatientId: $scope.item.PatientId,
                    UnLockedBy: utl.Session.getCurrentUserId(),
                    ReleasedOn: utl.Formatter.getCurrentDate(),
                    UnLockComments: data.UnLockComments,
                    LockStatusId: 2,
                    GuarantorTypeId: $scope.item.GuarantorTypeId,
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

        $scope.getBillLockDetailsCallBack = function(scope, res, options, hasError) {
            if (res.Id > 0) {
                $scope.BillLockDetail = res;
            } else
                $scope.BillLockDetail = {};

            if ($scope.currentcontext.TotNetAmount > 0 && !$scope.currentcontext.billId) {
                $scope.CalculateNetAmt();
            }
        };

        $scope.getBillLockDetails = function() {
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

        $scope.saveItem = function(statusId) {

            if (savehitcompleted == 1) return;

            $scope.BillCompleted = 0;
            if (!utl.Validator.validate($scope)) {
                return;
            }

            if ($scope.currentcontext.FSTypeId === 5) {
                if ($scope.currentcontext.FamilyLinkId <= 0) {
                    utl.Alert.showErrorMsg('Please Select the Admitted Family Member for Transfer.');
                    return false;
                }
            }
            if ($scope.carddetailsmandatory == 1) {
                if ($scope.currentcontext.PaymentTypeId == 5 || $scope.currentcontext.PaymentTypeId == 6 ||
                    $scope.currentcontext.PaymentTypeId == 11) {
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
                if ($scope.currentcontext.PaymentTypeId == 5 || $scope.currentcontext.PaymentTypeId == 6) {
                    if (!$scope.item.AuthorizeNumber || $scope.item.AuthorizeNumber == '') {
                        utl.Alert.showErrorMsg($translate.instant('Please Enter AuthCode!...'));
                        return;
                    }
                }
                if ($scope.currentcontext.PaymentTypeId == 11) {
                    if (!$scope.item.UPIRefNumber || $scope.item.UPIRefNumber == '') {
                        utl.Alert.showErrorMsg($translate.instant('Please Enter AuthCode!...'));
                        return;
                    }
                }
            }
            if ($scope.currentcontext.FSTypeId === 3) {
                if ($scope.item.GuarantorDueId <= 0) {
                    utl.Alert.showErrorMsg('Please Select the Credit Approver');
                    return false;
                }
            }
            if ($scope.currentcontext.FSTypeId != 3 && $scope.currentcontext.TotBalanceAmt > 0) {
                if ($scope.item.PrivateDueId <= 0 || !$scope.item.PrivateDueId) {
                    // if ($scope.currentcontext.PaymentTypeId < 1) {
                    utl.Alert.showErrorMsg('Please Select the Credit Approver');
                    return false;
                    // }
                }
            }
            $scope.item.PatientBillStatusId = statusId;

            var dTotNetAmount = parseFloat($scope.currentcontext.TotNetAmount);
            var dPaidAmt = parseFloat($scope.currentcontext.PaidAmt) + $scope.currentcontext.TotalReceiptAmount;
            var dReceiptAmt = parseFloat($scope.currentcontext.ReceiptAmt);

            $scope.item.EncounterId = $scope.currentcontext.EncounterId;
            $scope.item.BillDateTime = $scope.currentfilter.billdate;
            $scope.item.IsDayCare = $scope.currentfilter.isdaycare;
            $scope.item.BillTypeId = 2;
            $scope.item.BillPriorityId = 1;
            $scope.item.BillAmount = $scope.currentcontext.TotNetAmount;
            $scope.item.BillDiscountModeId = $scope.currentfilter.DiscountModeId;
            if ($scope.currentfilter.DiscountModeId == 2) {
                $scope.item.BillDiscount = parseFloat($scope.currentcontext.TotDiscAmount) + parseFloat($scope.item.DiscountAmount);
            } else {
                $scope.item.BillDiscount = parseFloat($scope.currentcontext.BillDiscount) + parseFloat($scope.item.DiscountAmount);
            }
            $scope.item.GuarantorTypeId = $scope.item.GuarantorTypeId;
            $scope.item.BillDiscountTypeId = $scope.currentcontext.BillDiscountTypeId;
            $scope.item.RoundOffValue = $scope.currentcontext.RoundOffValue;
            $scope.item.BilledCounter = 0;
            if ($scope.item.GuarantorTypeId == 1) {
                $scope.item.OutStandingAmount = (dTotNetAmount - (dPaidAmt + dReceiptAmt));
                if ($scope.currentcontext.TotBalanceAmt < 0) {
                    $scope.item.ToBeRefunded = -($scope.currentcontext.TotBalanceAmt);
                }
            } else {
                if ($scope.item.CreditApproved > 0) {
                    $scope.item.OutStandingAmount = $scope.item.CreditApproved;
                } else {
                    $scope.item.OutStandingAmount = $scope.item.NetInsuranceAmount;
                }

                if (!$scope.item.NetPatientAmount || $scope.item.NetPatientAmount == 0) {
                    $scope.item.NetPatientAmount = $scope.currentcontext.BalanceInsurance;
                }
                if ($scope.item.NetPatientAmount > 0) {
                    //$scope.item.NetPatientAmount = parseFloat($scope.item.NetPatientAmount) + parseFloat($scope.currentcontext.BalanceInsurance);
                }
                if ($scope.currentcontext.FSTypeId == 4) {
                    if ($scope.currentcontext.TotBalanceAmt < 0) {
                        if ($scope.item.NetPatientAmount == 0) {
                            $scope.item.ToBeRefunded = dPaidAmt;
                        }
                    }
                }
            }
            $scope.item.PatientDue = $scope.currentcontext.PatOutstandingAmt;
            $scope.item.FinalDueAmount = $scope.currentcontext.FinalDue;
            $scope.item.IsPaidFully = 0;
            $scope.item.ServiceTax = 0;
            $scope.item.EducationCess = 0;
            $scope.item.BillApprovedBy = $scope.currentcontext.ApprovedById;
            $scope.item.IsIntermediateBill = 0;
            $scope.item.ParentBillId = 0;
            $scope.item.IsPackageBill = 0;
            $scope.item.PackageDiscount = 0;
            $scope.item.OrganizationId = utl.Session.getCurrentOrgId();
            $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
            $scope.item.BillGeneratedBy = utl.Session.getCurrentUserId();
            //$scope.item.DepartmentId = $scope.currentfilter.DepartmentId;
            //$scope.item.PatientId = $scope.currentfilter.PatientId;
            //$scope.item.PatientName = $scope.currentfilter.PatientName;
            //$scope.item.GuarantorId = $scope.currentfilter.GuarantorId;
            //$scope.item.GuarantorName = $scope.currentfilter.GuarantorName;
            $scope.item.ServiceRateCategoryId = $scope.currentfilter.ServiceRateCategoryId;
            $scope.item.ServiceRateCategoryName = $scope.currentfilter.ServiceRateCategoryName;
            $scope.item.PatientTypeId = 0;
            //$scope.item.EncounterId = 0;
            //$scope.item.EncounterTypeId = 0;
            //$scope.item.DoctorId = $scope.currentfilter.DoctorId;
            //$scope.item.ReferralId = 0;
            //$scope.item.ReferralName = 0;
            $scope.item.CancelReasonId = 0;
            $scope.item.CancelledBy = 0;
            // $scope.item.Comments = '';
            $scope.item.ReceiptGeneratedById = utl.Session.getCurrentUserId();
            $scope.item.EncounterTypeId = $scope.EncounterInfo.EncounterTypeId;
            $scope.item.FSTypeId = $scope.currentcontext.FSTypeId;
            $scope.item.FamilyLinkId = $scope.currentcontext.FamilyLinkId;
            $scope.item.TransferEncounterId = $scope.currentcontext.TransferEncounterId;
            $scope.item.TransferPatientId = $scope.currentcontext.TransferPatientId;
            if ($scope.item.TransferEncounterId > 0) {
                $scope.item.TransferAmount = $scope.currentcontext.TotBalanceAmt;
            }
            $scope.item.BillAmount = $scope.currentcontext.TotGrossAmount;
            // $scope.item.BillDiscount = $scope.currentcontext.TotDiscAmount;
            if ($scope.currentcontext.Comments) {
                $scope.item.Comments = $scope.currentcontext.Comments;
            }
            if ($scope.item.BillDiscount > 0) {
                $scope.item.DiscountApprovedBy = $scope.currentcontext.DiscountApprovedBy;
            }
            $scope.item.NetAmount = $scope.currentcontext.TotNetAmount;
            // $scope.item.OutStandingAmount = ($scope.currentcontext.TotBalanceAmt > 0 ? $scope.currentcontext.TotBalanceAmt : ($scope.currentcontext.TotBalanceAmt) * -1);
            $scope.item.PaidAmount = $scope.currentcontext.TotBalanceAmt === 0 ? $scope.currentcontext.TotNetAmount : parseFloat($scope.currentcontext.ReceiptAmt);
            if ($scope.item.GuarantorTypeId > 1 && !$scope.currentcontext.ReceiptAmt) {
                $scope.item.PaidAmount = parseFloat($scope.currentcontext.TotalReceiptAmount) - parseFloat($scope.currentcontext.TotalRefundAmount);
            }
            $scope.item.RefundAmount = $scope.currentcontext.TotalRefundAmount;
            if ($scope.item.FSTypeId == 2) {
                $scope.item.OutStandingAmount = -($scope.item.OutStandingAmount);
            }
            if (!$scope.PatientPaymentDetails || $scope.PatientPaymentDetails.length === 0) {
                if ($scope.item.FSTypeId === 5) {
                    $scope.currentcontext.PaymentTypeId = $scope.currentcontext.PaymentTypeId;
                    $scope.currentcontext.ReceiptTypeId = 4;
                    $scope.currentcontext.ReceiptStatusId = 1;
                } else {
                    $scope.currentcontext.PaymentTypeId = $scope.currentcontext.PaymentTypeId;
                    $scope.currentcontext.ReceiptTypeId = 2;
                    $scope.currentcontext.ReceiptStatusId = 1;
                }
                $scope.AddPaymentDetails();
            }
            // $scope.getPatientBillDetails(); //Hided for Balance Insurance
            if ($scope.currentcontext.BillDiscount > 0) {
                var billingitem = null;
                if ($scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 2) {
                    $scope.item.DiscountPercentage = parseFloat($scope.currentcontext.BillDiscount);
                    for (var per = 0, perlen = $scope.PatientBillDetailsforDiscount.length; per < perlen; per++) {
                        billingitem = $scope.PatientBillDetailsforDiscount[per];
                        if (billingitem.DiscountAmount == 0) {
                            var linepercentage = (100 / $scope.item.GrossAmount) * $scope.PatientBillDetailsforDiscount[per].Amount;
                            var netdiscountrupees = parseFloat($scope.currentcontext.BillDiscount) / 100 * linepercentage;
                            $scope.PatientBillDetailsforDiscount[per].DiscountModeId = $scope.currentfilter.DiscountModeId;
                            $scope.PatientBillDetailsforDiscount[per].DiscountPercentage = $scope.currentcontext.BillDiscount;
                            $scope.PatientBillDetailsforDiscount[per].ProportionateDiscount = $scope.currentcontext.BillDiscount / 100 * $scope.PatientBillDetailsforDiscount[per].Amount;
                            $scope.PatientBillDetailsforDiscount[per].NetAmount = $scope.PatientBillDetailsforDiscount[per].Amount - $scope.PatientBillDetailsforDiscount[per].ProportionateDiscount;
                            if ($scope.PatientBillDetailsforDiscount[per].DoctorShareValue > 0) {
                                $scope.PatientBillDetailsforDiscount[per].DoctorShare = $scope.PatientBillDetailsforDiscount[per].NetAmount * ($scope.PatientBillDetailsforDiscount[per].DoctorShareValue / 100);
                            }
                        }
                    }
                } else if ($scope.currentfilter.DiscountModeId == 1) {
                    $scope.currentcontext.DiscountAmount = $scope.currentcontext.BillDiscount;
                    for (var inr = 0, inrlen = $scope.PatientBillDetailsforDiscount.length; inr < inrlen; inr++) {
                        billingitem = $scope.PatientBillDetailsforDiscount[inr];
                        var linepercentage = (100 / $scope.item.GrossAmount) * $scope.PatientBillDetailsforDiscount[inr].Amount;
                        var netdiscountrupees = $scope.currentcontext.DiscountAmount / 100 * linepercentage;
                        $scope.PatientBillDetailsforDiscount[inr].DiscountModeId = $scope.currentfilter.DiscountModeId;
                        $scope.PatientBillDetailsforDiscount[inr].DiscountPercentage = 0;
                        $scope.PatientBillDetailsforDiscount[inr].ProportionateDiscount = netdiscountrupees;
                        $scope.PatientBillDetailsforDiscount[inr].NetAmount = $scope.PatientBillDetailsforDiscount[inr].Amount - $scope.PatientBillDetailsforDiscount[inr].ProportionateDiscount;
                        if ($scope.PatientBillDetailsforDiscount[inr].DoctorShareValue > 0) {
                            $scope.PatientBillDetailsforDiscount[inr].DoctorShare = $scope.PatientBillDetailsforDiscount[inr].NetAmount * ($scope.PatientBillDetailsforDiscount[inr].DoctorShareValue / 100);
                        }
                    }
                }
            }
            /* Check Mandatory Values */
            if (checkMandatoryFields()) {
                var lines = getLinesForSave();
                var paymentlines = getpaymentsLinesForSave();
                var actionName = 'billing/patientbills/ManageIPBills';
                if ($scope.FinalBillInfo && $scope.FinalBillInfo.Id > 0)
                    $scope.item.Id = $scope.FinalBillInfo.Id;
                else
                    $scope.item.Id = 0;

                var PaymentTypeInfo = {
                    PaymentTypeId: $scope.currentcontext.PaymentTypeId,
                    CardNumber: '',
                    CardDateTime: null,
                    CardExpiryDate: null,
                    TerminalNoId: $scope.item.TerminalNoId,
                    BankId: $scope.currentcontext.PaymentTypeId != 1 ? $scope.item.BankId : -1,
                    CardTypeId: $scope.currentcontext.PaymentTypeId == 5 ? $scope.item.CardTypeId : -1,
                    ChequeNo: $scope.currentcontext.PaymentTypeId == 2 ? $scope.item.ChequeNo : '',
                    UPIRefNumber: $scope.currentcontext.PaymentTypeId == 11 ? $scope.item.UPIRefNumber : '',
                    ChequeDate: $scope.currentcontext.PaymentTypeId == 2 ? (!$scope.item.ChequeDate ? null : $scope.item.ChequeDate) : null,
                    DDNumber: $scope.currentcontext.PaymentTypeId == 3 ? (!$scope.item.DDNumber) ? null : $scope.item.DDNumber : null,
                    DDDate: $scope.currentcontext.PaymentTypeId == 3 ? (!$scope.item.DDDate) ? null : $scope.item.DDDate : null,
                    WireTransferId: $scope.currentcontext.PaymentTypeId == 4 ? $scope.item.WireTransferId : null,
                    WireTransferDate: $scope.currentcontext.PaymentTypeId == 4 ? (!$scope.item.WireTransferDate) ? null : $scope.item.WireTransferDate : null
                };

                var inputData = {
                    Header: $scope.item,
                    Details: lines,
                    paymentDetail: paymentlines,
                    PaymentTypeInfo: PaymentTypeInfo
                };
                // console.log(inputData);return;
                if ($scope.currentcontext.FSTypeId == 3) {
                    if ($scope.currentcontext.isSelfGuarantor)
                        $scope.item.PrivateDueId = $scope.currentcontext.SelfCreditApprovedBy;
                }
                savehitcompleted = 1;
                var options = {
                    action: actionName,
                    data: {
                        Data: inputData
                    },
                    type: 'post',
                    onComplete: $scope.UpdatebillIdCallback
                };

                utl.Http.doAction(options);
            }
        };
        $scope.UpdatebillIdCallback = function(scope, data, options, hasError) {
            // $scope.canShowSaveBtn = true;
            $scope.canShowSaveBtn = false;
            $scope.items = {};
            savehitcompleted = 0;
            if (data) {
                $scope.items.ParentBillId = data;
                $scope.items.EncounterId = $scope.currentcontext.EncounterId;
                $scope.UpdatebillId();
            }
        };

        $scope.UpdatebillId = function() {
            var options = {
                action: 'billing/patientbills/UpdateIpParentId',
                data: {
                    Data: $scope.items
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };

            utl.Http.doAction(options);
        }

        function checkMandatoryFields() {
            var activeRecords = $filter('filterArrayItems')($scope.PatientSummaryDetails, [{
                search: 1,
                fields: ['Status']
            }]);
            for (var idx in activeRecords) {
                var item = activeRecords[idx];
                if ((item.RxName) && (!item.ServiceId || !item.ServiceName || !item.Quantity > 0 || item.Rate > 0 ||
                    item.Amount > 0 || !item.Discount >= 0 || item.TaxRate >= 0 || !item.NetAmount > 0)) {
                    utl.Alert.showErrorMsg($translate.instant('common.req-validation-msg.lbl'));
                    return false;
                }
            }
            return true;
        }

        function getpaymentsLinesForSave() {
            var result = [];
            for (var idx in $scope.PatientPaymentDetails) {
                var item = $scope.PatientPaymentDetails[idx];
                if (item.FamilyLinkId <= 0) {
                    item.ReceiptTypeId = 2;
                }
                if (item.AmountPaid > 0) {
                    result.push(item);
                }
            }
            return result;
        }

        function getLinesForSave() {
            var result = [];
            for (var idx in $scope.PatientBillDetailsforDiscount) {
                var item = $scope.PatientBillDetailsforDiscount[idx];
                if ((item.Quantity > 0 && item.Amount > 0) || item.PackageMasterServiceId > 0) {
                    if (item.DocShareDetails) {
                        if (item.DocShareDetails.length > 0) {
                            for (var per = 0, perlen = item.DocShareDetails.length; per < perlen; per++) {
                                if (item.DocShareDetails[per].PerformDrShareValue > 0) {
                                    item.DocShareDetails[per].PerformDrShare = item.NetAmount * (item.DocShareDetails[per].PerformDrShareValue / 100);
                                }
                            }
                        }
                    }
                    item.GrossAmount = item.Amount;
                    item.DiscountAmount = item.DiscountAmount;
                    item.DoctorDiscountAmount = 0;
                    item.GSTId = item.GSTId;
                    item.TaxId = item.GSTId;
                    item.TaxCode = item.TaxCode;
                    item.TaxCost = item.GSTAmount;
                    item.IsPackageItem = item.IsPackageItem;
                    item.PackageId = 0;
                    item.PackageName = '';
                    item.OrderId = 0;
                    item.OrderDetailId = 0;
                    item.OrderDateTime = utl.Formatter.getCurrentDate();
                    item.RequestDate = utl.Formatter.getCurrentDate();
                    item.IsModified = 0;
                    item.IsSupplimentary = 0;
                    item.IsBillable = 0;
                    item.IsGstDoctor = 0;
                    item.StartDateTime = null;
                    item.EndDateTime = null;
                    item.DiscountTypeId = item.DiscountTypeId;
                    item.DoctorId = $scope.item.DoctorId;
                    item.DoctorName = $scope.item.DoctorName;
                    item.DiscountAuthorizedBy = 0;
                    item.ReferalShare = 0;
                    item.CancelReason = null;
                    item.DoctorShareValue = item.DoctorShareValue || 0;
                    item.DoctorShare = item.DoctorShare || 0;
                    item.AllowIPDocShare = 0;
                    // item.PerformDoctorId = item.PerformDoctorId || 0;
                    // item.PerformDoctorName = item.PerformDoctorName;
                    // item.PerformDrShareValue = item.PerformDrShareValue || 0;
                    // item.PerformDrShare = item.PerformDrShare || 0;
                    item.EncounterId = $scope.item.EncounterId;
                    item.EncounterTypeId = vm.Context == 'OP' ? 1 : 4;
                    item.AliasId = item.AliasId || null;
                    item.AliasName = item.AliasName || null;
                    item.IsExecutableProcedure = item.IsExecutableProcedure;
                    item.IsExecutingService = item.IsExecutingService;
                    item.FacilityId = utl.Session.getCurrentFacilityId();
                    item.DocShareDetails = item.DocShareDetails;
                    result.push(item);
                }
            }
            for (var idx in $scope.DeletedPatientBills) {
                var item = $scope.DeletedPatientBills[idx];
                if (item.Id > 0) {
                    result.push(item);
                }
            }
            return result;
        }

        function loadData() {
            if ($scope.currentcontext.EncounterId && $scope.currentcontext.EncounterId > 0) {
                $scope.getPrevAdvances();
                $scope.getEncounter();
                $scope.applyVisibilityRules();
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

        $scope.getPrevAdvancesCallback = function(scope, data, options, hasError) {
            var prevpaidamt = 0;
            if (data.Data.length > 0) {
                for (var pdx in data.Data) {
                    var preadv = data.Data[pdx];
                    prevpaidamt += preadv.AmountPaid;
                }
            }
            $scope.totalpaidamt = prevpaidamt;

        };

        $scope.getPrevAdvances = function() {
            var inputData = {
                Params: [{
                    Key: 4,
                    Value: 1
                },
                {
                    Key: 5,
                    Value: 1
                },
                {
                    Key: 23,
                    Value: 1
                },
                {
                    Key: 10,
                    Value: $scope.currentcontext.EncounterId
                },
                {
                    Key: 11,
                    Value: 2
                },
                {
                    Key: 13,
                    Value: false
                },
                {
                    Key: 16,
                    Value: false
                },
                ],
            };

            var options = {
                action: 'Billing/PatientPaymentDetails/GetPatientPaymentDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPrevAdvancesCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getFacInfoCallbck = function(scope, data, options, hasError) {
            $scope.item.ShowAliasInfo = data.ShowAliasInfo;
        };

        $scope.getFacInfo = function() {
            var options = {
                action: 'SystemSettings/facility/GetFacilityById',
                data: {
                    Id: utl.Session.getCurrentFacilityId()
                },
                type: 'post',
                onComplete: $scope.getFacInfoCallbck
            };
            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function(scope, data, options, hasError) {
            forEach(data, function(value, key) {
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
            if ($scope.maxadvancecash == 1) {
                $scope.getPrevAdvances();
            }
            loadData();
            $scope.getFacInfo();
            $scope.currentfilter.DiscountModeId = 1;
        };

        $scope.initLookup = function() {
            var inputData = [
                // {
                //     "Key": "Ward"
                // },
                {
                    "Key": "GuarantorType"
                },
                // {
                //     "Key": "Doctor"
                // },
                {
                    "Key": "Guarantor",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                // {
                //     "Key": "ServiceRateCategory"
                // },
                {
                    "Key": "DiscountMode"
                },
                {
                    "Key": "DiscountType"
                },
                {
                    "Key": "PaymentType"
                },
                // {
                //     "Key": "ReceiptType"
                // },
                // {
                //     "Key": "User"
                // },
                // {
                //     "Key": "PaymentType"
                // },
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
                        Params: [{
                            Key: 2,
                            Value: $scope.currentcontext.PatientId
                        }, {
                            Key: 3,
                            Value: true
                        }]
                    }
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

        $scope.checkHeader = function(iVal) {
            if (iVal == 1) {
                $scope.item.WithoutHeader = false;
            }
            if (iVal == 2) {
                $scope.item.WithHeader = false;
            }
        };


        $scope.initLookup();
    }

    summaryListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$timeout'];

})();