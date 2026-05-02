(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('itemwiseOPBillCancelController', itemwiseOPBillCancelController);

    function itemwiseOPBillCancelController($scope, $filter, $stateParams,
        $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        var savehitcompleted = 0;
        $scope.currentcontext = {};
        $scope.currentfilter = {};
        $scope.currentcontext.PaymentTypeId = 1;
        $scope.currentcontext.BankId = -1;
        $scope.currentcontext.ChequeNo = null;
        $scope.currentcontext.DDNumber = null;
        $scope.currentcontext.WireTransferId = null;
        $scope.currentcontext.AuthorizeNumber = null;
        $scope.currentcontext.CollectedOn = null;
        $scope.currentcontext.TerminalNoId = null;
        $scope.currentcontext.ChequeDate = null;
        $scope.currentcontext.DDDate = null;
        $scope.currentcontext.WireTransferDate = null;
        $scope.currentcontext.CardTypeId = null;

        $scope.currentcontext.RefundAmount = 0;
        $scope.currentcontext.selectallchk = false;
        $scope.refundcn = {};
        $scope.refundcn.Details = [];
        $scope.billheader = {}; // Bill Header
        $scope.Selectionrow = []; // Bill Detail
        $scope.billinfo = []; // total Bill info
        $scope.orderheader = []; // Order Header Info
        $scope.orderdetail = []; // Order Detail Info
        $scope.items = {};
        $scope.maxcashrefund =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'maxcashrefund');

        $scope.carddetailsmandatory = 0;
        $scope.carddetailsmandatory = utl.FacilitySetting.getFacilitySettingValue('billing', 'carddetailsmandatory');

        $scope.SelectAll = function (chk) {
            for (var idx in $scope.billinfo) {
                if ($scope.billinfo[idx].PatientBillStatusId != 2 && $scope.billinfo[idx].OrderStatusId != 10) {
                    $scope.billinfo[idx].select = chk;
                }
            }
            $scope.selectionChangedCal();
        }

        $scope.refundcn.Header = {
            ActiveFrom: utl.Formatter.getCurrentDate(),
            ChequeDate: utl.Formatter.getCurrentDate(),
            CollectedOn: utl.Formatter.getCurrentDate(),
            CreditNoteAmount: 0,
            CreditNoteDateTime: utl.Formatter.getCurrentDate(),
            CreditNoteIdentifier: null,
            CurrencyTypeId: 1,
            DDDate: utl.Formatter.getCurrentDate(),
            DepartmentID: null,
            DoctorId: null,
            EncounterId: null,
            EncounterTypeId: null,
            FacilityId: null,
            GuarantorId: null,
            GuarantorTypeId: null,
            IsActive: true,
            IsFromFinalize: false,
            PatientBillId: 0,
            PatientCreditNoteId: 0,
            PatientId: 0,
            PatientName: null,
            PaymentTypeId: 1,
            RefundAmount: 0,
            RoundOffValue: 0,
            RefundDateTime: utl.Formatter.getCurrentDate(),
            RefundStatusId: 1,
            RefundTypeId: 3,
            VisitIdentifier: null,
            WireTransferDate: utl.Formatter.getCurrentDate(),
            isCompleted: true,
            AuthorizedBy: null,
            BillDateTime: utl.Formatter.getCurrentDate(),
            BillNumber: null,
            CreditNoteApprovedById: 0,
            CreditNoteStatusId: 2,
            CreditNoteTypeId: 4
        };
        $scope.currentcontext.id = 0;
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.item = {};
        $scope.item.BillNumber = modalConfig.params.billnumber;
        if (modalConfig.params.CancelReqRaisedStatusId) {
            $scope.item.CancelReqRaisedStatusId = modalConfig.params.CancelReqRaisedStatusId;
        } else {
            $scope.item.CancelReqRaisedStatusId = -1;
        }

        $scope.Clear = function () {
            $state.reload();
        }

        $scope.getOrderInfoBillIdCallback = function (scope, res, options, hasError) {
            for (var idx in res.Data) {
                var header = {
                    Id: res.Data[idx].Id,
                    Rev: res.Data[idx].Rev,
                    PatientBillStatusId: res.Data[idx].PatientBillStatusId,
                    OrderStatusId: 2,
                    OrderNumber: res.Data[idx].OrderNumber,
                    BillingId: res.Data[idx].BillingId,
                }
                $scope.orderheader.push(header);
                for (var idex in res.Data[idx].PatientOrderDetails) {
                    var detail = {
                        Id: res.Data[idx].PatientOrderDetails[idex].Id,
                        Rev: res.Data[idx].PatientOrderDetails[idex].Rev,
                        PatientBillStatusId: res.Data[idx].PatientOrderDetails[idex].PatientBillStatusId,
                        TestId: res.Data[idx].PatientOrderDetails[idex].TestId,
                        PatientOrderId: res.Data[idx].PatientOrderDetails[idex].PatientOrderId,
                        TestName: res.Data[idx].PatientOrderDetails[idex].TestName,
                        OrderStatusId: 2,
                    }
                    $scope.orderdetail.push(detail);
                }
            }
            $scope.getBillInfoByBillNumber();
        }

        $scope.getOrderInfoBillId = function () {
            if ($scope.currentcontext.id > 0) {
                var SearchBillId = $scope.currentcontext.id;
                if (SearchBillId && SearchBillId > 0) {
                    var inputData = {
                        Params: [{
                            Key: 5,
                            Value: SearchBillId
                        }],
                        PageContext: {
                            PageSize: 10000,
                            PageNumber: 1
                        }
                    };
                    var options = {
                        action: 'emr/patientorder/GetPatientOrderWithDetailsByBillingId',
                        data: inputData,
                        type: 'post',
                        onComplete: $scope.getOrderInfoBillIdCallback
                    };
                    utl.Http.doAction(options);
                }
            }
        };

        $scope.getBillInfoByBillId = function () {
            if ($scope.currentcontext.id > 0) {
                var SearchBillId = $scope.currentcontext.id;
                if (SearchBillId && SearchBillId > 0) {
                    var inputData = {
                        Params: [{
                            Key: 2,
                            Value: SearchBillId
                        }],
                        PageContext: {
                            PageSize: 10000,
                            PageNumber: 1
                        }
                    };

                    if ($scope.item.CancelReqRaisedStatusId == 2) {
                        inputData.Params.push({
                            Key: 48,
                            Value: 1
                        })
                    }
                    var options = {
                        action: 'billing/patientbilldetails/GetPatientBillDetails',
                        data: inputData,
                        type: 'post',
                        onComplete: $scope.getBillInfoCallback
                    };
                    utl.Http.doAction(options);
                } else {
                    $scope.clear();
                }
            }
        };

        $scope.getBillHeaderByBillId = function () {
            if ($scope.currentcontext.id > 0) {
                var SearchBillId = $scope.currentcontext.id;
                var inputData = {
                    Params: [{
                        Key: 0,
                        Value: SearchBillId
                    }],
                    PageContext: {
                        PageSize: 1000,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'billing/patientbills/GetPatientBills',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getBillHeaderCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.clear();
            }
        }
        $scope.getBillHeaderCallback = function (scope, res, options, hasError) {
            $scope.billheader = {};
            if (res.Data.length > 0) {
                var item = res.Data[0];
                $scope.billheader = item;
                $scope.refundcn.Header.BillNumber = item.BillNumber;
                $scope.refundcn.Header.PatientBillId = item.Id;
                $scope.refundcn.Header.BillDateTime = item.BillDateTime;
                $scope.refundcn.Header.AuthorizedBy = item.BillApprovedBy;
                $scope.refundcn.Header.PatientId = item.PatientId;
                $scope.refundcn.Header.EncounterId = item.EncounterId;
                $scope.refundcn.Header.VisitIdentifier = item.Encounter.VisitIdentifier;
                $scope.refundcn.Header.EncounterTypeId = item.EncounterTypeId;
                $scope.refundcn.Header.PatientName = item.PatientName;
                $scope.refundcn.Header.DepartmentID = item.DepartmentId;
                $scope.refundcn.Header.GuarantorId = item.GuarantorId;
                $scope.refundcn.Header.GuarantorTypeId = item.GuarantorTypeId;
                $scope.refundcn.Header.DoctorId = item.DoctorId;
                $scope.refundcn.Header.FacilityId = item.FacilityId;
                $scope.refundcn.Header.RefundGeneratedById = utl.Session.getCurrentUserId();
            }
            $scope.getOrderInfoBillId();
        }

        $scope.billingFilter = function (item) {
            if (item.Status == 1 && item.PackageMasterServiceId == 0) {
                return item;
            }
        };

        $scope.getBillInfoCallback = function (scope, res, options, hasError) {
            $scope.billinfo = res.Data;
            for (var ind in $scope.billinfo) {
                // var totDiscount = $scope.billinfo[ind].DiscountAmount +
                // $scope.billinfo[ind].ProportionateDiscount;
                var totDiscount = $scope.billinfo[ind].DiscountAmount;
                totDiscount = totDiscount.toFixed(2);
                $scope.billinfo[ind].totDiscount = totDiscount;
                // $scope.billinfo[ind].N
                // $scope.billinfo[ind].NetAmount -= totDiscount;
                $scope.billinfo[ind].Rate = math.floor($scope.billinfo[ind].Rate);
                $scope.billinfo[ind].NetAmount = math.floor($scope.billinfo[ind].NetAmount);
                $scope.billinfo[ind].ReceivedAmount = math.floor($scope.billinfo[ind].ReceivedAmount);

            }
            $scope.getBillHeaderByBillId();
        }

        $scope.AddValuetoDetail = function () {
            var totalrefund = 0;
            var totalcnamt = 0;
            $scope.refundcn.Details = [];
            $scope.Selectionrow = getSelectionRows();
            var orderdetaildata = $scope.orderdetail;
            $scope.orderdetail = [];
            var orderheader = 0;
            for (var ind in $scope.Selectionrow) {
                $scope.refundcn.Detail = {
                    CNAmount: isNaN(parseFloat($scope.Selectionrow[ind].NetAmount)) ? 0 : parseFloat($scope.Selectionrow[ind].NetAmount),
                    CNCompleted: true,
                    Code: $scope.Selectionrow[ind].ServiceItem.ItemCode,
                    CreditNoteAmount: isNaN(parseFloat($scope.Selectionrow[ind].NetAmount)) ? 0 : parseFloat($scope.Selectionrow[ind].NetAmount),
                    CreditNoteDetailDateTime: utl.Formatter.getCurrentDate(),
                    CreditNoteTypeId: 4,
                    DepartmentID: $scope.Selectionrow[ind].DepartmentID,
                    Discount: $scope.Selectionrow[ind].Discount,
                    IsEditable: true,
                    NetAmount: $scope.Selectionrow[ind].ReceivedAmount,
                    PatientBillDetailId: $scope.Selectionrow[ind].Id,
                    ServiceAmount: 0,
                    ServiceId: $scope.Selectionrow[ind].ServiceId,
                    ServiceName: $scope.Selectionrow[ind].ServiceName,
                    Status: $scope.Selectionrow[ind].Status,
                    isCompleted: true
                };

                $scope.Selectionrow[ind].PatientBillStatusId = 2;
                $scope.Selectionrow[ind].CancelledBy = utl.Session.getCurrentUserId();
                $scope.Selectionrow[ind].CNAmount += $scope.Selectionrow[ind].NetAmount;
                totalcnamt += $scope.Selectionrow[ind].NetAmount;
                totalrefund += $scope.Selectionrow[ind].ReceivedAmount;
                $scope.refundcn.Details.push($scope.refundcn.Detail);


                if ($scope.Selectionrow[ind].MasterTypeId) {
                    if ($scope.Selectionrow[ind].MasterTypeId > 0) {
                        for (var ind1 in orderdetaildata) {
                            if (orderdetaildata[ind1].TestId == $scope.Selectionrow[ind].MasterItemId) {
                                orderdetaildata[ind1].PatientBillStatusId = 2; // Cancelled
                                $scope.orderdetail.push(orderdetaildata[ind1]);
                            }
                        }
                    }
                }
            }

            for (var ind1 in $scope.orderheader) {
                var orddeitem = [];
                var recnt = 0;
                for (var ind2 in orderdetaildata) {
                    if ($scope.orderheader[ind1].Id == orderdetaildata[ind2].PatientOrderId) {
                        orddeitem.push(orderdetaildata[ind2]);
                    }
                    if (orderdetaildata[ind2].PatientBillStatusId == 2 &&
                        $scope.orderheader[ind1].Id == orderdetaildata[ind2].PatientOrderId) {
                        recnt++;
                    }
                }
                if (orddeitem.length == recnt && recnt > 0 && orddeitem.length > 0) {
                    $scope.orderheader[ind1].PatientBillStatusId = 2;
                    orderheader = 1;
                }
            }

            if (orderheader == 0)
                $scope.orderheader = [];

            /* Rounding Values */
            var NetNaturalValue = getNatural(Number(totalrefund).toFixed(2));
            var NetDecimalValue = getDecimal(Number(totalrefund).toFixed(2));
            var NetRoundOffValue = 0;
            if (NetDecimalValue > 0 && NetDecimalValue < 50) {
                $scope.currentcontext.RefundAmount = NetNaturalValue;
                NetRoundOffValue = -1 * (NetDecimalValue / 100);
                $scope.currentcontext.RoundOffValue = parseFloat(NetRoundOffValue);
            } else if (NetDecimalValue >= 50 && NetDecimalValue <= 99) {
                $scope.currentcontext.RefundAmount = NetNaturalValue + 1;
                NetRoundOffValue = (100 - NetDecimalValue) / 100;
                $scope.currentcontext.RoundOffValue = parseFloat(NetRoundOffValue);
            } else {
                NetRoundOffValue = 0;
                $scope.currentcontext.RoundOffValue = parseFloat(NetRoundOffValue);
                $scope.currentcontext.RefundAmount = totalrefund;
            }
            /* Rounding Values */

            $scope.billheader.RefundAmount += $scope.currentcontext.RefundAmount;
            $scope.billheader.RoundOffValue += $scope.currentcontext.RoundOffValue;
            $scope.billheader.CancelAmount += $scope.currentcontext.RefundAmount;
            $scope.billheader.CNAmount += totalcnamt;
            $scope.refundcn.Header.RefundAmount += $scope.currentcontext.RefundAmount;
            $scope.refundcn.Header.RoundOffValue += $scope.currentcontext.RoundOffValue;
            $scope.refundcn.Header.CreditNoteAmount += totalcnamt;
            $scope.refundcn.Detail = {};
            if ($scope.IsDue == true && $scope.item.PaidAmount > 0) {
                if ($scope.billheader.OutStandingAmount > totalcnamt) {
                    $scope.billheader.OutStandingAmount -= totalcnamt;
                }
                if ($scope.billheader.OutStandingAmount == totalcnamt) {
                    $scope.billheader.OutStandingAmount = 0;
                }
                if ($scope.billheader.OutStandingAmount < totalcnamt) {
                    var due = totalcnamt - $scope.billheader.OutStandingAmount;
                    $scope.billheader.OutStandingAmount -= totalcnamt;
                    $scope.billheader.RefundAmount = due;
                }
            }
            if ($scope.IsDue == true && $scope.item.PaidAmount == 0) {
                if ($scope.billheader.OutStandingAmount > totalcnamt) {
                    $scope.billheader.OutStandingAmount -= totalcnamt;
                }
                if ($scope.billheader.OutStandingAmount == totalcnamt) {
                    $scope.billheader.OutStandingAmount = 0;
                }
            }
            return $scope.Selectionrow;
        }

        function getSelectionRows() {
            var currentSelection = [];
            for (var idx in $scope.billinfo) {
                if (($scope.billinfo[idx].PatientBillStatusId != 2 || $scope.billinfo[idx].OrderStatusId != 10) &&
                    $scope.billinfo[idx].select) {
                    currentSelection.push($scope.billinfo[idx]);
                }
            }
            return currentSelection;
        }

        function getNatural(num) {
            return parseFloat(num.toString().split(".")[0]);
        }

        function getDecimal(num) {
            return parseFloat(num.toString().split(".")[1]);
        }

        $scope.selectionChangedCal = function () {
            var totalrefund = 0;
            var Selectionrow = getSelectionRows();
            for (var ind in Selectionrow) {
                totalrefund += Selectionrow[ind].ReceivedAmount;
            }

            for (var idx in $scope.billinfo) {
                var lineitem = $scope.billinfo[idx];
                if (lineitem.IsPackageItem) {
                    for (var shareidx in $scope.billinfo) {
                        var shareitem = $scope.billinfo[shareidx];
                        if (shareitem.PackageMasterServiceId == lineitem.ServiceId) {
                            shareitem.select = lineitem.select;
                        }
                    }
                }
            }

            $scope.CalculateTotal(totalrefund);
        };

        $scope.CalculateTotal = function (totalrefund) {
            /* Rounding Values */
            var NetNaturalValue = getNatural(Number(totalrefund).toFixed(2));
            var NetDecimalValue = getDecimal(Number(totalrefund).toFixed(2));
            var NetRoundOffValue = 0;
            if (NetDecimalValue > 0 && NetDecimalValue < 50) {
                $scope.currentcontext.RefundAmount = NetNaturalValue;
                NetRoundOffValue = -1 * (NetDecimalValue / 100);
                $scope.currentcontext.RoundOffValue = parseFloat(NetRoundOffValue);
            } else if (NetDecimalValue >= 50 && NetDecimalValue <= 99) {
                $scope.currentcontext.RefundAmount = NetNaturalValue + 1;
                NetRoundOffValue = (100 - NetDecimalValue) / 100;
                $scope.currentcontext.RoundOffValue = parseFloat(NetRoundOffValue);
            } else {
                NetRoundOffValue = 0;
                $scope.currentcontext.RoundOffValue = parseFloat(NetRoundOffValue);
                $scope.currentcontext.RefundAmount = totalrefund;
            }
            /* Rounding Values */
        };

        function getBillHeader() {
            var fullbillcancel = 0;
            /* Partial Cancel no need to cancel the total bill */
            // var fullbillcancel = 1;
            // for (var idx in $scope.billinfo) {
            //     if ($scope.billinfo[idx].PatientBillStatusId != 2) {
            //         fullbillcancel = 0;
            //     }
            // }
            // if (fullbillcancel == 1)
            //     $scope.billheader.PatientBillStatusId = 2; // full bill cancel;
            /* Partial Cancel no need to cancel the total bill */

            return $scope.billheader;
        }
        $scope.onDoctorSelected = function (data) {
            $scope.currentcontext.selecteddept = [];
            $scope.item.DoctorName = '';
        };
        $scope.applyVisibilityRules = function () {
            if ($scope.item.CancelReqRaisedStatusId == -1) {
                $scope.CanShowCancelReqbtn = true;
                $scope.CanShowCancelbtn = false;
            } else if ($scope.item.CancelReqRaisedStatusId == 1) {
                $scope.CanShowCancelReqbtn = false;
                $scope.CanShowCancelbtn = false;
            } else if ($scope.item.CancelReqRaisedStatusId == 2) {
                $scope.CanShowCancelReqbtn = false;
                $scope.CanShowCancelbtn = true;
            }

        }

        $scope.getBillInfoByBillNumberCallback = function (scope, res, options, hasError) {
            $scope.item.IsFromIPBill = 0;
            $scope.PatientBillInfo = res.Data[0] || [];
            // if ($scope.PatientBillInfo && $scope.PatientBillInfo.length > 0) {

            // $scope.PatientBillInfo.forEach(patientbills => {
            $scope.item.PatientId = $scope.PatientBillInfo.PatientId;
            $scope.item.PatientBillStatusId = $scope.PatientBillInfo.PatientBillStatusId;
            $scope.item.BillGeneratedBy = $scope.PatientBillInfo.BillGeneratedBy;
            $scope.item.BillAmount = $scope.PatientBillInfo.BillAmount;
            $scope.item.PaidAmount = $scope.PatientBillInfo.PaidAmount;
            $scope.item.DepartmentId = $scope.PatientBillInfo.DepartmentId;
            $scope.item.BillDateTime = $scope.PatientBillInfo.BillDateTime;
            $scope.item.PatientName = $scope.PatientBillInfo.PatientName;
            $scope.item.DoctorId = $scope.PatientBillInfo.DoctorId;

            $scope.item.IsCancelReqApproved = $scope.PatientBillInfo.IsCancelReqApproved;
            // if ($scope.item.PatientBillStatusId == 3) {
            //     $scope.loadPatientGuarantors();
            // }
            // $scope.currentfilter.PatientId = $scope.PatientBillInfo.PatientId;
            // $scope.patientChange();
            if ($scope.PatientBillInfo.OutStandingAmount > 0) {
                $scope.IsDue = true
                $scope.item.TotalDueAmount = $scope.PatientBillInfo.OutStandingAmount;
            } else {
                $scope.item.TotalDueAmount = $scope.PatientBillInfo.OutStandingAmount;
                $scope.item.TotalPaidAmount = $scope.PatientBillInfo.PaidAmount;
                $scope.canShowAdvanceBtn = true;
            }
            // $scope.currentfilter.PatientId = $scope.PatientBillInfo.PatientId;
            $scope.currentcontext.FacilityId = $scope.PatientBillInfo.FacilityId;
            $scope.currentcontext.DiscountApprovedBy = $scope.PatientBillInfo.DiscountApprovedBy;
            $scope.currentcontext.id = $scope.PatientBillInfo.Id;
            $scope.currentcontext.ReceiptAmt = null;
            $scope.currentcontext.PaidAmt = $scope.PatientBillInfo.PaidAmount;
            $scope.currentcontext.ApprovedById = $scope.PatientBillInfo.BillApprovedBy;
            $scope.currentcontext.billdate = $scope.PatientBillInfo.BillDateTime;
            $scope.currentcontext.BillDiscount = $scope.PatientBillInfo.BillDiscount;
            $scope.currentcontext.CNAmount = $scope.PatientBillInfo.CNAmount;
            $scope.currentcontext.RefundAmount = $scope.PatientBillInfo.RefundAmount;
            $scope.currentcontext.CancelReason = $scope.PatientBillInfo.CancelReason;
            $scope.currentfilter.DiscountModeId = $scope.PatientBillInfo.BillDiscountModeId;
            $scope.item.BillNumber = $scope.PatientBillInfo.BillNumber;
            $scope.item.DepartmentId = $scope.PatientBillInfo.DepartmentId;
            $scope.item.DoctorId = $scope.PatientBillInfo.DoctorId;
            $scope.currentfilter.GuarantorId = $scope.PatientBillInfo.GuarantorId;
            $scope.currentfilter.GuarantorName = $scope.PatientBillInfo.GuarantorName;
            $scope.currentfilter.GuarantorTypeId = $scope.PatientBillInfo.GuarantorTypeId;
            $scope.currentfilter.ServiceRateCategoryId = $scope.PatientBillInfo.ServiceRateCategoryId;
            $scope.item.IsMultiplePayment = $scope.PatientBillInfo.IsMultiplePayment;

            if ($scope.currentfilter.DiscountModeId == 2) {
                $scope.currentcontext.BillDiscount = $scope.PatientBillInfo.DiscountPercentage;
            }

            if ($scope.PatientBillInfo.PatientBillStatusId == 1) {
                $scope.CanDelete = true;
            } else {
                $scope.CanDelete = false;
            }

            $scope.currentcontext.PatientBillStatusId = $scope.PatientBillInfo.PatientBillStatusId;
            $scope.currentcontext.PatientStatusId = $scope.PatientBillInfo.PatientBillStatusId;
            $scope.item.PatientTypeId = $scope.PatientBillInfo.PatientTypeId;
            $scope.item.IsEmergency = $scope.PatientBillInfo.IsEmergency;
            $scope.item.EncounterId = $scope.PatientBillInfo.EncounterId;
            $scope.item.PatientName = $scope.PatientBillInfo.PatientName;
            $scope.item.PatientBillStatus = $scope.PatientBillInfo.PatientBillStatus.Description;
            $scope.item.GuarantorDueId = $scope.PatientBillInfo.GuarantorDueId || null;
            $scope.item.PrivateDueId = $scope.PatientBillInfo.PrivateDueId || null;
            $scope.item.IsManualBill = $scope.PatientBillInfo.IsManualBill;
            $scope.item.ManualBillNumber = $scope.PatientBillInfo.ManualBillNumber;
            $scope.item.ManualBillDate = $scope.PatientBillInfo.ManualBillDate;
            $scope.item.ManualBillComments = $scope.PatientBillInfo.ManualBillComments;
            $scope.isSaveandApprove = true;
            // $scope.applyVisibilityRules();

            $scope.PatientPaymentDetails = [];

            // $scope.CalculateNetAmt();
            $scope.currentcontext.PendingAmt = $scope.PatientBillInfo.OutStandingAmount;
            $scope.item.BillDateTime = $scope.PatientBillInfo.BillDateTime;
            if ($scope.PatientBillInfo.PatientBillStatusId == 1)
                $scope.isSaving = false;

            // });

            // }
            $scope.applyVisibilityRules();
        };

        $scope.getBillInfoByBillNumber = function () {
            var SearchBillnumber = $scope.item.BillNumber;
            if ($scope.currentcontext.id >= 0 && (SearchBillnumber && SearchBillnumber.length > 0)) {
                var inputData = {
                    Params: [{
                        Key: 2,
                        Value: SearchBillnumber
                    }],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'billing/patientbills/GetPatientBills',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getBillInfoByBillNumberCallback
                };
                utl.Http.doAction(options);
            }
        };
        $scope.UpdatePatientBillsForCancelCallback = function (scope, data, options, hasError) {
            savehitcompleted = 0;
            $scope.confirmCallback({
                BillId: $scope.currentcontext.id
            });
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        };
        $scope.UpdatePatientBillsForCancel = function () {

            $scope.items.CancelReqRaisedStatusId = 1;
            $scope.items.Id = $scope.item.PatientBillId;
            // var lines = getLinesForSaveCancel();
            var actionName = 'Billing/PatientBills/AddPatientBills';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'Billing/PatientBills/UpdatePatientBillsFromCancel';
            }
            var inputData = {
                Header: $scope.items,
            };
            var options = {
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.UpdatePatientBillsForCancelCallback
            };
            utl.Http.doAction(options);
        };
        $scope.CancelRequestCallback = function (scope, data, options, hasError) {
            $scope.UpdatePatientBillsForCancel();
            // $scope.currentcontext.id = (typeof data === "number") ? data : $scope.currentcontext.id;
        };

        $scope.CancelRequest = function () {
            if (!utl.Validator.validate($scope)) {
                utl.Alert.showErrorMsg($translate.instant('common.validationmsg.lbl'));
                return;
            }
            var checkselectedlist = getSelectionRows();
            $scope.item.PatientBillDetIds = [];
            if (checkselectedlist.length == 0) {
                utl.Alert.showErrorMsg($translate.instant('Please Select Item'));
                return;
            }
            if (checkselectedlist.length > 0) {
                for (var pdx in checkselectedlist) {
                    var billdet = checkselectedlist[pdx];
                    $scope.item.PatientBillDetIds.push({ Id: billdet.Id, CancelReason: billdet.CancelReason });
                }
            }
            $scope.item.BillingRequestBy = utl.Session.getCurrentUserId();
            $scope.item.BillingRequestAt = utl.Formatter.getCurrentDate();
            $scope.item.PatientBillId = $scope.currentcontext.id;
            $scope.item.BillingRequestTypeId = 1;
            $scope.item.BillingRequestDateTime = utl.Formatter.getCurrentDate();
            $scope.item.BillAmount = $scope.item.BillAmount;
            $scope.item.PaidAmount = $scope.item.PaidAmount;
            $scope.item.PatientId = $scope.item.PatientId;
            $scope.item.BillingRequestStatusId = 1;
            $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
            $scope.item.IsPartialCancel = true;
            $scope.item.TypeId = 1;

            var actionName = 'Billing/BillingRequest/AddBillingRequest';
            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.CancelRequestCallback
            };
            utl.Http.doAction(options);
        };


        $scope.cancelItemwsieCallback = function (scope, data, options, hasError) {
            savehitcompleted = 0;
            $scope.confirmCallback({
                BillId: $scope.currentcontext.id
            });
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        };
        $scope.cancel = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            if ($scope.currentcontext.PaymentTypeId == 1 && $scope.currentcontext.RefundAmount > parseInt($scope.maxcashrefund)) {
                utl.Alert.showErrorMsg('Reached limit of Max.Cash Refund...');
                return;
            }
            if ($scope.carddetailsmandatory == 1) {
                if ($scope.currentcontext.PaymentTypeId == 5 || $scope.currentcontext.PaymentTypeId == 6 ||
                    $scope.currentcontext.PaymentTypeId == 11) {
                    if (!$scope.currentcontext.BankId) {
                        utl.Alert.showErrorMsg($translate.instant('Please Select Bank!...'));
                        return;
                    }
                    // if (!$scope.currentcontext.CardTypeId) {
                    //     utl.Alert.showErrorMsg($translate.instant('Please Select CardType!...'));
                    //     return;
                    // }
                    // if (!$scope.currentcontext.TerminalNoId) {
                    //     utl.Alert.showErrorMsg($translate.instant('Please Select TerminalNo!...'));
                    //     return;
                    // }
                }
                if ($scope.currentcontext.PaymentTypeId == 5 || $scope.currentcontext.PaymentTypeId == 6) {
                    if (!$scope.currentcontext.AuthorizeNumber || $scope.currentcontext.AuthorizeNumber == '') {
                        utl.Alert.showErrorMsg($translate.instant('Please Enter AuthCode!...'));
                        return;
                    }
                }
                // if ($scope.currentcontext.PaymentTypeId == 11) {
                //     if (!$scope.currentcontext.UPIRefNumber || $scope.currentcontext.UPIRefNumber == '') {
                //         utl.Alert.showErrorMsg($translate.instant('Please Enter AuthCode!...'));
                //         return;
                //     }
                // }
            }
            /* Security IsValid */
            $scope.requiredsecuritypin =
                utl.FacilitySetting.getFacilitySettingValue('billing', 'requiredsecuritypin');
            if ($scope.requiredsecuritypin) $scope.saveCancelled();
            else {
                var confirmOptions = {
                    headingKey: 'common.confirm-modal-header.lbl',
                    messageKey: 'patientemr.patientorder-form.cancelmsg.lbl',
                    yesKey: 'common.yeskey.lbl',
                    noKey: 'common.nokey.lbl',
                    onSuccessMethod: $scope.saveCancelled,
                };
                utl.Dialog.confirmMessage(confirmOptions);
            }
        }

        /* Security IsValid */
        $scope.securitypisvalid = false;
        $scope.SecurityPINChkCallback = function (SecurityStatus) {
            //console.log(SecurityStatus);
            $scope.securitypisvalid = SecurityStatus.pinstatus;
            $scope.saveCancelled();
        };
        $scope.securitydialogopened = false;
        $scope.securitypindiagCallback = function () {
            $scope.securitydialogopened = false;
        };
        $scope.securitypincheck = function () {
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

        $scope.saveCancelled = function () {

            if (savehitcompleted == 1) return;

            if (!utl.Validator.validate($scope)) {
                return;
            }

            var checkselectedlist = getSelectionRows();
            if (checkselectedlist.length == 0) {
                utl.Alert.showErrorMsg('Select Any One Item');
                return;
            } else {

                /* Security IsValid */
                $scope.requiredsecuritypin =
                    utl.FacilitySetting.getFacilitySettingValue('billing', 'requiredsecuritypin');

                if ($scope.requiredsecuritypin && !$scope.securitypisvalid)
                    if (!$scope.securitypincheck())
                        return false;

                /* Security IsValid */
                savehitcompleted = 1;
                var selectedlist = $scope.AddValuetoDetail();
                var billheader = $scope.billheader;

                /* Paymode Options */
                $scope.refundcn.Header.PaymentTypeId = $scope.currentcontext.PaymentTypeId;
                $scope.refundcn.Header.BankId = $scope.currentcontext.BankId;
                $scope.refundcn.Header.CardTypeId = $scope.currentcontext.CardTypeId;
                $scope.refundcn.Header.TerminalNoId = $scope.currentcontext.TerminalNoId;
                $scope.refundcn.Header.AuthorizeNumber = $scope.currentcontext.AuthorizeNumber;
                $scope.refundcn.Header.ChequeNo = $scope.currentcontext.ChequeNo;
                $scope.refundcn.Header.ChequeDate = $scope.currentcontext.ChequeDate;
                $scope.refundcn.Header.DDNumber = $scope.currentcontext.DDNumber;
                $scope.refundcn.Header.DDDate = $scope.currentcontext.DDDate;
                $scope.refundcn.Header.WireTransferId = $scope.currentcontext.WireTransferId;
                $scope.refundcn.Header.WireTransferDate = $scope.currentcontext.WireTransferDate;
                /* Paymode Options */

                $scope.refundcn.Header.RefundGeneratedById = utl.Session.getCurrentUserId();
                $scope.refundcn.Header.FacilityId = utl.Session.getCurrentFacilityId();

                var actionName = 'billing/patientbilldetails/UpdatePatientCancelItemwise';
                var options = {
                    action: actionName,
                    data: {
                        Data: {
                            selectedlist,
                            billheader,
                            CN: {
                                Data: {
                                    Header: $scope.refundcn.Header,
                                    Details: $scope.refundcn.Details
                                }
                            },
                            Refund: {
                                Data: {
                                    Header: $scope.refundcn.Header,
                                    Details: $scope.refundcn.Details
                                }
                            },
                            Order: {
                                Header: $scope.orderheader,
                                Details: $scope.orderdetail
                            }
                        }
                    },
                    type: 'post',
                    onComplete: $scope.cancelItemwsieCallback
                };
                utl.Http.doAction(options);
            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getBillInfoByBillId();
            $scope.applyVisibilityRules();
        };
        $scope.initLookup = function () {
            var inputData = [{
                "Key": "BillType"
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
                "Key": "Terminal"
            },
            ]
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

    itemwiseOPBillCancelController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];


})();