(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('customerreturnController', customerreturnController);

    function customerreturnController($rootScope, $scope, $interval, $stateParams, $state, $translate, utl, $filter, $timeout) {
        var vm = this;
        var savehitcompleted = 0;

        angular.extend(this, utl.Ctrl.getDMPrintDataController({
            $scope: $scope
        }));

        $scope.SelectedIndex = -1;
        $scope.isSaveandApprove = true;
        $scope.isSaving = true;
        $scope.RdoCustomerMasterId = false;
        $scope.RdoBillnumber = false;
        $scope.IsDue = true;
        $scope.IsDisabled = true;
        $scope.IsNewBill = true;
        $scope.dmprintpreferences = 0;
        $scope.printpreferences = 1;
        $scope.SaveImdDMPrint = 0;

        $scope.CustomerReturnInfo = [];
        $scope.CustomerBillInfo = [];
        $scope.CustomerReturnDetails = [];

        $scope.selectedCustomer = {};
        $scope.carddetailsmandatory = 0;
        $scope.carddetailsmandatory = utl.FacilitySetting.getFacilitySettingValue('billing', 'carddetailsmandatory');
        $scope.item = {
            CustomerMasterId: -1,
            ReturnWithComeRefund: true,
            CustomerReturnStatusId: 1,
            RefundedOn: utl.Formatter.getCurrentDate(),
            ChequeDate: utl.Formatter.getCurrentDate(),
            DDDate: utl.Formatter.getCurrentDate(),
            WireTransferDate: utl.Formatter.getCurrentDate(),
            PharmacySaleTypeId: 1,
            PharmacyReturnTypeId: 1,
            TotRndoffAmt: 0,
            PreferedRoundOff: 0,
            GSTAmount: 0,
            InGstAmount: 0,
            CGstAmount: 0,
            SGstAmount: 0,
            ReturnAll: false,
            WithHeader: true,
            WithoutHeader: false,
        };
        $scope.item.CustomerBills = [];
        $scope.newCustomer = {
            CustomerName: '',
        };
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.currentcontext = {
            id: 0,
            RdoBillDiscount: true,
            RdoBillDiscountMode: true,
            Rdobilldate: true,
            BillDiscountTypeId: -1,
            BillDiscount: 0,
            BillDiscountModeId: -1,
            ApprovedById: -1,
            PaymentTypeId: 1,
            TotNetAmount: 0,
            TotDiscountAmt: 0,
            PaidAmt: 0,
            ReceiptAmt: 0,
            ReceivedAmount: 0,
            TotBalanceAmt: 0,
            ReturnAmount: 0,
            CustomerReturnStatusId: 1,
            CustomerStatusId: 1,
            isnewcustomer: false
        };

        $scope.currentfilter = {
            billdate: utl.Formatter.getCurrentDate(),
            returndate: utl.Formatter.getCurrentDate(),
            billnumber: '',
            refundnumber: '',
            CustomerMasterId: -1,
            customername: '',
            DepartmentId: -1,
            PayScenarioId: -1,
            StoreMasterId: 0,
            StoreTypeId: 0,
            StoreSubTypeId: 0,
            SequenceOptionId: 1,
        };

        $scope.EnableReturnWithComeRefund = function () {
            var flag = !$scope.item.ReturnWithComeRefund;
            $scope.currentcontext.RdoReceiptAmt = flag;
            $scope.RdoPaymentTypeId = flag;
        };
        $scope.backtoList = function () {
            $state.go('app.pharmacydashboard');
        };
        $scope.EnableDisableDropdown = function (flag) {
            $scope.RdoCustomerMasterId = !flag;
            $scope.RdoDepartmentId = flag;
            $scope.RdoPayScenarioId = flag;
            $scope.RdoItemMasterId = flag;
            for (var i = 0, len = $scope.CustomerReturnDetails.length; i < len; i++) {
                $scope.CustomerReturnDetails[i].RdoItemMasterId = flag;
                $scope.CustomerReturnDetails[i].RdoDiscountMode = flag;
                $scope.CustomerReturnDetails[i].RdoDiscountTypeId = flag;
            }

            $scope.currentcontext.RdoBillDiscount = flag;
            $scope.RdoBillDiscountTypeId = flag;
            $scope.RdoApprovedById = flag;
            $scope.currentcontext.RdoBillDiscountMode = flag;

            $scope.EnableReturnWithComeRefund();
        };

        $scope.clear = function () {
            $state.reload();
            savehitcompleted = 0;
        };

        $scope.EnableDisableDropdown($scope.isSaving);

        $scope.applyVisibilityRules = function () {
            // Draft
            if ($scope.item.CustomerReturnStatusId == 1) {
                $scope.canShowSaveBtn = true;
                $scope.canShowSaveapproveBtn = true;
                $scope.canShowClearBtn = true;
                $scope.canShowCancelBtn = false;
                $scope.HidePrintBtn = true;
                $scope.canShowViewReceipt = false;
                $scope.canShowAttachBtn = true;
            }
            // Return Cancelled
            if ($scope.item.CustomerReturnStatusId == 2) {
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveapproveBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.HidePrintBtn = false;
                $scope.canShowViewReceipt = true;
                $scope.canShowAttachBtn = true;
            }
            // Return Completed
            if ($scope.item.CustomerReturnStatusId == 3) {
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveapproveBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = true;
                $scope.HidePrintBtn = false;
                $scope.canShowViewReceipt = true;
                $scope.canShowAttachBtn = true;
            }

            if ($scope.item.IsRefundedFully === false) {
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveapproveBtn = true;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = true;
                $scope.HidePrintBtn = false;
                $scope.canShowViewReceipt = true;
                $scope.canShowAttachBtn = true;
            }

            if ($scope.CustomerReturnInfo.length > 0 && $scope.item.CustomerReturnStatusId == 3) {
                $scope.RdoPaymentTypeId = false;
                // $scope.item.ReturnWithComeRefund = false;
            }
        };

        $scope.openAttachments = function () {
            utl.Modal.open('app.customerattachments', {
                params: {
                    pid: 0,
                    itemid: 0
                },
                confirmCallback: $scope.initLookup,
                cancelCallback: $scope.initLookup
            });
        };
        $scope.saleandreturnprint = function () {
            var inputData = {
                Data: {
                    Id: $scope.currentfilter.CustomerMasterId,
                    withHeader: $scope.item.WithHeader,
                    withoutHeader: $scope.item.WithoutHeader
                }
            };
            var actionName = 'billing/customerbills/PrintAllPharmacybilldetails';
            var options = {
                action: actionName,
                data: inputData,
                type: 'post'
            };
            utl.Http.doPrint(options);
        };

        $scope.print = function () {
            if ($scope.printpreferences != 1) {
                utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.preferencesetting.lbl'));


                return false;
            } else {
                var inputData = {
                    Id: $scope.currentcontext.id,
                    Data: {
                    withHeader: $scope.item.WithHeader,
                    withoutHeader: $scope.item.WithoutHeader
                    }
                };
                var actionName = 'billing/customerreturns/PrintCustomerReturns';
                if (window.printcode.toLowerCase() == 'bewell') {
                    var actionName = 'billing/customerreturns/PrintCustomerReturns1';
                }
                var options = {
                    action: actionName,
                    data: inputData,
                    type: 'post'
                };
                utl.Http.doPrint(options);
            }
        };

        $scope.backToList = function () {
            $state.go('app.opbilling-list', $scope.currentcontext.id);
        };

        /* Find and Loading the Bill Starts Here */

        $scope.findBill = function () {
            $scope.SaveImdDMPrint = 0;
            savehitcompleted = 0;
            utl.Modal.open('app.find-customer-sales', {
                params: {
                    id: $scope.currentfilter.CustomerMasterId,
                    td: 'return'
                },
                confirmCallback: customerBillPickerCallback
            });
        };

        $scope.findReturn = function () {
            $scope.SaveImdDMPrint = 0;
            utl.Modal.open('app.find-customer-returns', {
                params: {
                    id: $scope.currentfilter.CustomerMasterId
                },
                confirmCallback: customerReturnPickerCallback
            });
        };

        function customerBillPickerCallback(customerbilldata) {
            if (customerbilldata && customerbilldata.IsCashToCreditBill) {
                var Msg = 'Already Bill changed as cash to credit so we cannnot take return from this bill';
                utl.Alert.showErrorMsg($translate.instant(Msg));
                return;
            } else {
                $scope.currentcontext.id = customerbilldata.BillId;
                $scope.getBillInfoByBillId();
            }
        }

        function customerReturnPickerCallback(customerreutrndata) {
            $scope.currentcontext.id = customerreutrndata.ReturnId;
            $scope.getReturnInfoByReturnId();
        }

        $scope.getBillInfoByBillId = function () {
            var SearchBillId = $scope.currentcontext.id;
            if (SearchBillId && SearchBillId > 0) {
                var inputData = {
                    Params: [{
                        Key: 0,
                        Value: SearchBillId
                    }],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'billing/customerbills/GetCustomerBills',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getBillInfoCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.clear();
            }
        };

        $scope.getBillInfoCallback = function (scope, res, options, hasError) {
            $scope.CustomerBillInfo = res.Data || [];
            console.log( $scope.CustomerBillInfo,' $scope.CustomerBillInfo');
            $scope.CustomerBillInfo.forEach(customerbills => {
                $scope.currentfilter.CustomerMasterId = customerbills.CustomerMasterId;
                $scope.item.PharmacySaleTypeId = customerbills.PharmacySaleTypeId;
                $scope.item.CustomerBillStatusId = customerbills.CustomerBillStatusId;
                if ($scope.item.PharmacySaleTypeId == 1) {
                    //Implemented Out-Customer Return Scenario
                    $scope.currentcontext.isnewcustomer = false;
                    $scope.item.PharmacyReturnTypeId = 1;
                    $scope.item.CustomerBillStatusId = customerbills.CustomerBillStatusId;
                    $scope.item.OutStandingAmount = customerbills.OutStandingAmount;
                    $scope.currentcontext.CustomerBillStatusId = customerbills.CustomerBillStatusId;
                    if ($scope.item.CustomerBillStatusId == 3) {
                        $scope.IsDisabled = true;
                        $scope.RdoPharmacySaleType = true;
                    }

                    $scope.currentfilter.CustomerMasterId = customerbills.CustomerMasterId;
                    $scope.currentfilter.DiscountModeId = customerbills.BillDiscountModeId;
                    $scope.currentfilter.GuarantorId = customerbills.GuarantorId;
                    $scope.currentfilter.GuarantorName = customerbills.GuarantorName;
                    $scope.currentfilter.GuarantorTypeId = customerbills.GuarantorTypeId;

                    $scope.currentcontext.DiscountApprovedBy = customerbills.DiscountApprovedBy;
                    $scope.currentcontext.id = 0;
                    $scope.currentcontext.ReceiptAmt = 0;
                    $scope.currentcontext.ReceivedAmount = parseFloat(customerbills.NetAmount);
                    $scope.currentcontext.PaidAmt = parseFloat(customerbills.NetAmount) - parseFloat(customerbills.RefundAmount);
                    $scope.currentcontext.ApprovedById = customerbills.BillApprovedBy;
                    $scope.currentcontext.billdate = customerbills.BillDateTime;
                    $scope.currentcontext.BillDiscount = 0;
                    $scope.item.TotDiscAmount = customerbills.BillDiscount;
                    $scope.currentcontext.CNAmount = 0;
                    $scope.currentcontext.TotNetAmount = 0;
                    $scope.currentcontext.TotBalanceAmt = 0;
                    $scope.currentcontext.RefundedAmount = parseFloat(customerbills.RefundAmount);
                    $scope.currentcontext.CustomerStatusId = customerbills.CustomerBillStatusId;
                    $scope.currentfilter.StoreMasterId = customerbills.StoreMasterId;
                    if (customerbills.StoreMaster) {
                        $scope.currentfilter.StoreTypeId = customerbills.StoreMaster.StoreTypeId;
                        $scope.currentfilter.StoreSubTypeId = customerbills.StoreMaster.StoreSubTypeId;
                        $scope.currentfilter.SequenceOptionId = customerbills.StoreMaster.SequenceOptionId;
                    }

                    $scope.item.CustomerBillStatus = customerbills.CustomerBillStatus.Description;
                    $scope.item.BillNumber = customerbills.BillNumber;
                    $scope.item.CustomerBillId = customerbills.Id;
                    $scope.item.DepartmentId = customerbills.DepartmentId;
                    $scope.item.BillDateTime = customerbills.BillDateTime;
                    $scope.item.FacilityId = customerbills.FacilityId;
                    $scope.item.OrganizationId = customerbills.OrganizationId;
                    $scope.item.CustomerName = customerbills.CustomerName;
                    $scope.item.CardTypeId = -1;
                    $scope.item.BankId = -1;
                    $scope.item.ChequeNo = '';
                    $scope.item.DDNumber = 0;
                    $scope.item.CollectedOn = utl.Formatter.getCurrentDate();
                    $scope.item.ChequeDate = utl.Formatter.getCurrentDate();
                    $scope.item.DDDate = utl.Formatter.getCurrentDate();
                    $scope.item.WireTransferId = -1;
                    $scope.item.AuthorizeNumber = 0;
                    // $scope.item.TotDiscAmount = 0;
                    $scope.item.GrossAmount = 0;
                } else if ($scope.item.PharmacySaleTypeId == 2) {
                    //Implemented In-Customer Return Scenario
                    $scope.currentcontext.isnewcustomer = false;
                    $scope.item.PharmacyReturnTypeId = 2;
                    $scope.item.CustomerBillStatusId = customerbills.CustomerBillStatusId;
                    $scope.currentcontext.CustomerBillStatusId = customerbills.CustomerBillStatusId;
                    if ($scope.item.CustomerBillStatusId == 3) {
                        $scope.IsDisabled = true;
                        $scope.RdoPharmacySaleType = true;
                    }

                    $scope.currentfilter.CustomerMasterId = customerbills.CustomerMasterId;
                    $scope.currentfilter.DiscountModeId = customerbills.BillDiscountModeId;
                    $scope.currentfilter.StoreMasterId = customerbills.StoreMasterId;
                    if (customerbills.StoreMaster) {
                        $scope.currentfilter.StoreTypeId = customerbills.StoreMaster.StoreTypeId;
                        $scope.currentfilter.StoreSubTypeId = customerbills.StoreMaster.StoreSubTypeId;
                        $scope.currentfilter.SequenceOptionId = customerbills.StoreMaster.SequenceOptionId;
                    }

                    $scope.currentcontext.DiscountApprovedBy = customerbills.DiscountApprovedBy;
                    $scope.currentcontext.id = 0;
                    $scope.currentcontext.ReceiptAmt = 0;
                    $scope.currentcontext.ReceivedAmount = parseFloat(customerbills.NetAmount);
                    $scope.currentcontext.PaidAmt = parseFloat(customerbills.NetAmount) - parseFloat(customerbills.RefundAmount);
                    $scope.currentcontext.ApprovedById = customerbills.BillApprovedBy;
                    $scope.currentcontext.billdate = customerbills.BillDateTime;
                    $scope.currentcontext.BillDiscount = 0;
                    $scope.item.TotDiscAmount = customerbills.BillDiscount;
                    $scope.currentcontext.CNAmount = 0;
                    $scope.currentcontext.TotNetAmount = 0;
                    $scope.currentcontext.TotBalanceAmt = 0;
                    $scope.currentcontext.CustomerStatusId = customerbills.CustomerBillStatusId;

                    $scope.item.CustomerBillStatus = customerbills.CustomerBillStatus.Description;
                    $scope.item.BillNumber = customerbills.BillNumber;
                    $scope.item.CustomerBillId = customerbills.Id;
                    $scope.item.DepartmentId = customerbills.DepartmentId;
                    $scope.item.BillDateTime = customerbills.BillDateTime;
                    $scope.item.FacilityId = customerbills.FacilityId;
                    $scope.item.OrganizationId = customerbills.OrganizationId;
                    $scope.item.CustomerName = customerbills.CustomerName;
                    $scope.item.CardTypeId = -1;
                    $scope.item.BankId = -1;
                    $scope.item.ChequeNo = '';
                    $scope.item.DDNumber = 0;
                    $scope.item.CollectedOn = utl.Formatter.getCurrentDate();
                    $scope.item.ChequeDate = utl.Formatter.getCurrentDate();
                    $scope.item.DDDate = utl.Formatter.getCurrentDate();
                    $scope.item.WireTransferId = -1;
                    $scope.item.AuthorizeNumber = 0;
                    $scope.item.GrossAmount = 0;
                } else if ($scope.item.PharmacySaleTypeId == 3) {
                    //Implemented A&E-Customer Return Scenario
                    $scope.currentcontext.isnewcustomer = false;
                    $scope.item.PharmacyReturnTypeId = 3;
                    $scope.item.CustomerBillStatusId = customerbills.CustomerBillStatusId;
                    $scope.currentcontext.CustomerBillStatusId = customerbills.CustomerBillStatusId;
                    if ($scope.item.CustomerBillStatusId == 3) {
                        $scope.IsDisabled = true;
                        $scope.RdoPharmacySaleType = true;
                    }

                    $scope.currentfilter.CustomerMasterId = customerbills.CustomerMasterId;
                    $scope.currentfilter.DiscountModeId = customerbills.BillDiscountModeId;
                    $scope.currentfilter.StoreMasterId = customerbills.StoreMasterId;
                    if (customerbills.StoreMaster) {
                        $scope.currentfilter.StoreTypeId = customerbills.StoreMaster.StoreTypeId;
                        $scope.currentfilter.StoreSubTypeId = customerbills.StoreMaster.StoreSubTypeId;
                        $scope.currentfilter.SequenceOptionId = customerbills.StoreMaster.SequenceOptionId;
                    }

                    $scope.currentcontext.DiscountApprovedBy = customerbills.DiscountApprovedBy;
                    $scope.currentcontext.id = 0;
                    $scope.currentcontext.ReceiptAmt = 0;
                    $scope.currentcontext.ReceivedAmount = parseFloat(customerbills.NetAmount);
                    $scope.currentcontext.PaidAmt = parseFloat(customerbills.NetAmount) - parseFloat(customerbills.RefundAmount);
                    $scope.currentcontext.ApprovedById = customerbills.BillApprovedBy;
                    $scope.currentcontext.billdate = customerbills.BillDateTime;
                    $scope.currentcontext.BillDiscount = 0;
                    $scope.item.TotDiscAmount = customerbills.BillDiscount;
                    $scope.currentcontext.CNAmount = 0;
                    $scope.currentcontext.TotNetAmount = 0;
                    $scope.currentcontext.TotBalanceAmt = 0;
                    $scope.currentcontext.RefundedAmount = parseFloat(customerbills.RefundAmount);
                    $scope.currentcontext.CustomerStatusId = customerbills.CustomerBillStatusId;

                    $scope.item.CustomerBillStatus = customerbills.CustomerBillStatus.Description;
                    $scope.item.BillNumber = customerbills.BillNumber;
                    $scope.item.CustomerBillId = customerbills.Id;
                    $scope.item.DepartmentId = customerbills.DepartmentId;
                    $scope.item.BillDateTime = customerbills.BillDateTime;
                    $scope.item.FacilityId = customerbills.FacilityId;
                    $scope.item.OrganizationId = customerbills.OrganizationId;
                    $scope.item.CustomerName = customerbills.CustomerName;
                    $scope.item.CardTypeId = -1;
                    $scope.item.BankId = -1;
                    $scope.item.ChequeNo = '';
                    $scope.item.DDNumber = 0;
                    $scope.item.CollectedOn = utl.Formatter.getCurrentDate();
                    $scope.item.ChequeDate = utl.Formatter.getCurrentDate();
                    $scope.item.DDDate = utl.Formatter.getCurrentDate();
                    $scope.item.WireTransferId = -1;
                    $scope.item.AuthorizeNumber = 0;
                    $scope.item.TotDiscAmount = 0;
                    $scope.item.GrossAmount = 0;
                } else if ($scope.item.PharmacySaleTypeId == 4) {
                    //Implemented Direct-Sale-Return Scenario
                    $scope.item.PharmacyReturnTypeId = 4;
                    $scope.currentcontext.isnewcustomer = true;
                    if ($scope.item.CustomerBillStatusId == 3) {
                        $scope.IsDisabled = true;
                        $scope.RdoPharmacySaleType = true;
                    }

                    $scope.newCustomer.CustomerName = customerbills.CustomerName;

                    $scope.currentfilter.CustomerMasterId = customerbills.CustomerMasterId;
                    $scope.currentfilter.DiscountModeId = customerbills.BillDiscountModeId;
                    $scope.currentfilter.StoreMasterId = customerbills.StoreMasterId;
                    if (customerbills.StoreMaster) {
                        $scope.currentfilter.StoreTypeId = customerbills.StoreMaster.StoreTypeId;
                        $scope.currentfilter.StoreSubTypeId = customerbills.StoreMaster.StoreSubTypeId;
                        $scope.currentfilter.SequenceOptionId = customerbills.StoreMaster.SequenceOptionId;
                    }

                    $scope.currentcontext.DiscountApprovedBy = customerbills.DiscountApprovedBy;
                    $scope.currentcontext.id = 0;
                    $scope.currentcontext.ReceiptAmt = 0;
                    $scope.currentcontext.ReceivedAmount = parseFloat(customerbills.NetAmount);
                    $scope.currentcontext.PaidAmt = parseFloat(customerbills.NetAmount) - parseFloat(customerbills.RefundAmount);
                    $scope.currentcontext.ApprovedById = customerbills.BillApprovedBy;
                    $scope.currentcontext.billdate = customerbills.BillDateTime;
                    // $scope.currentcontext.BillDiscount = 0;
                    $scope.item.TotDiscAmount = customerbills.BillDiscount;
                    $scope.currentcontext.CNAmount = 0;
                    $scope.currentcontext.TotNetAmount = 0;
                    $scope.currentcontext.TotBalanceAmt = 0;
                    $scope.currentcontext.CustomerStatusId = customerbills.CustomerBillStatusId;

                    $scope.item.CustomerBillStatus = customerbills.CustomerBillStatus.Description;
                    $scope.item.BillNumber = customerbills.BillNumber;
                    $scope.item.CustomerBillId = customerbills.Id;
                    $scope.item.DepartmentId = 0;
                    $scope.item.BillDateTime = customerbills.BillDateTime;
                    $scope.item.FacilityId = customerbills.FacilityId;
                    $scope.item.OrganizationId = customerbills.OrganizationId;
                    $scope.item.CustomerName = customerbills.CustomerName;
                    $scope.item.CardTypeId = -1;
                    $scope.item.BankId = -1;
                    $scope.item.ChequeNo = '';
                    $scope.item.DDNumber = 0;
                    $scope.item.CollectedOn = utl.Formatter.getCurrentDate();
                    $scope.item.ChequeDate = utl.Formatter.getCurrentDate();
                    $scope.item.DDDate = utl.Formatter.getCurrentDate();
                    $scope.item.WireTransferId = -1;
                    $scope.item.AuthorizeNumber = 0;
                    // $scope.item.TotDiscAmount = 0;
                    $scope.item.GrossAmount = 0;
                }

                $scope.CustomerReturnDetails = [];

                for (var idx in customerbills.CustomerBillDetails) {
                    var billdetails = customerbills.CustomerBillDetails[idx];
                    if (customerbills.BillDiscountModeId == 1) {
                        billdetails.DiscountData = billdetails.DiscountAmount;
                    }
                    if (customerbills.BillDiscountModeId == 2) {
                        billdetails.DiscountData = billdetails.DiscountPercentage;
                    }
                    $scope.CustomerReturnDetails.push(billdetails);
                }
                // $scope.CustomerReturnDetails = customerbills.CustomerBillDetails;

                var count = 0;
                for (var idx in $scope.CustomerReturnDetails) {
                    var item = $scope.CustomerReturnDetails[idx];
                    if (item.Quantity == item.ReturnedQuantity) {
                        count++;
                    }
                    item.CustomerBillDetailId = item.Id;
                    item.ReturnQuantity = 0;
                    item.Id = 0;
                    item.UnitDiscountAmount = item.UnitDiscountAmount + item.UnitProportionateDiscount;
                    item.DiscountAmount = item.DiscountAmount || 0;
                    item.ProportionateDiscount = 0;
                    item.Rate = item.Rate;
                    item.Amount = 0;
                    item.GrossAmount = 0;
                    item.NetAmountBeforeGST = 0;
                    item.NetAmount = 0;

                    item.GSTAmount = 0;
                    item.InGstAmount = 0;
                    item.CGstAmount = 0;
                    item.SGstAmount = 0;
                    item.IsMultiUse = item.IsMultiUse;
                    item.NoOfTransactions = item.NoOfTransactions;
                    item.TotalTransactions = item.TotalTransactions;
                    item.ConsumedTransactions = item.ConsumedTransactions;
                    item.PendingTransactions = item.PendingTransactions;
                    item.RST = '';
                    if (item.RackName) {
                        item.RST = item.RackName;
                    }
                    if (item.Shelf) {
                        item.RST = item.RST + ' / ' + item.Shelf;
                    }
                    if (item.Tray) {
                        item.RST = item.RST + ' / ' + item.Tray;
                    }
                }
                if (count == $scope.CustomerReturnDetails.length) {
                    utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.fullrefund.lbl'));

                    $state.reload();
                    return false;
                }

                $scope.applyVisibilityRules();
                $scope.customerChange();
            });

            $('#pid').select();
            $('#pid').focus();


        };

        $scope.customerChange = function () {
                var options = {
                    action: 'pharmacy/customermaster/GetCustomerMasterById',
                    data: {
                        Id: $scope.currentfilter.CustomerMasterId
                    },
                    type: 'post',
                    onComplete: $scope.getCustomerInfo
                };
                utl.Http.doAction(options);
        };

        $scope.getCustomerInfo = function (scope, data, options, hasError) {
            savehitcompleted = 0;
            $scope.selectedCustomer = data;
            $scope.item.CustomerName = $scope.selectedCustomer.FirstName;
            // $scope.item.FacilityId = $scope.selectedCustomer.FacilityId;
        };

        $scope.getReturnInfoByReturnId = function () {
            var SearchReturnId = $scope.currentcontext.id;
            if (SearchReturnId && SearchReturnId > 0) {
                var inputData = {
                    Params: [{
                        Key: 0,
                        Value: SearchReturnId
                    }],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'billing/customerreturns/GetCustomerReturns',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getReturnInfoCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.clear();
            }
        };

        $scope.getReturnInfoCallback = function (scope, res, options, hasError) {
            $scope.CustomerReturnInfo = res.Data || [];
            if ($scope.CustomerReturnInfo && $scope.CustomerReturnInfo.length > 0) {
                $scope.CustomerReturnInfo.forEach(customerreturns => {
                    $scope.item.PharmacyReturnTypeId = customerreturns.PharmacyReturnTypeId;
                    if ($scope.item.PharmacyReturnTypeId == 1) {
                        $scope.currentcontext.isnewcustomer = false;

                        $scope.currentfilter.CustomerMasterId = customerreturns.CustomerMasterId;
                        $scope.currentfilter.StoreMasterId = customerreturns.StoreMasterId;
                        $scope.currentfilter.billdate = customerreturns.BillDateTime;
                        $scope.currentfilter.returndate = customerreturns.ReturnDateTime;
                        $scope.currentfilter.billnumber = customerreturns.BillNumber;
                        $scope.currentfilter.customername = customerreturns.CustomerName;
                        $scope.item.customername = customerreturns.CustomerName;
                        $scope.currentfilter.DepartmentId = customerreturns.DepartmentId;
                        $scope.currentfilter.DiscountModeId = customerreturns.DiscountModeId;

                        $scope.currentcontext.id = customerreturns.Id;
                        $scope.currentcontext.ReceiptAmt = customerreturns.ReturnAmount;
                        if (customerreturns.CustomerBill) {
                            $scope.currentcontext.PaidAmt = parseFloat(customerreturns.CustomerBill.NetAmount) - parseFloat(customerreturns.CustomerBill.RefundAmount);
                        }
                        $scope.currentcontext.ApprovedById = customerreturns.ReturnApprovedBy;
                        $scope.currentcontext.CustomerReturnStatusId = customerreturns.CustomerReturnStatusId;

                        $scope.item.CustomerReturnStatusId = customerreturns.CustomerReturnStatusId;
                        $scope.item.BillNumber = customerreturns.BillNumber;
                        $scope.item.CustomerBillId = customerreturns.CustomerBillId;
                        $scope.item.ReturnNumber = customerreturns.ReturnNumber;
                        $scope.item.CustomerReturnId = customerreturns.Id;
                        $scope.item.DepartmentId = customerreturns.DepartmentId;
                        $scope.item.BillDateTime = customerreturns.BillDateTime;
                        $scope.item.ReturnDateTime = customerreturns.ReturnDateTime;
                        $scope.item.FacilityId = customerreturns.FacilityId;
                        $scope.item.OrganizationId = customerreturns.OrganizationId;
                        $scope.item.CustomerName = customerreturns.CustomerName;
                        $scope.item.IsRefundedFully = customerreturns.IsRefundedFully;
                        $scope.item.TotRndoffAmt = customerreturns.RoundOffValue;
                        $scope.item.TotDiscAmount = customerreturns.DiscountAmount;
                        $scope.item.GrossAmount = customerreturns.GrossAmount;
                        $scope.item.NetAmount = customerreturns.ReturnAmount;
                        $scope.item.ReturnBy = '';
                        if (customerreturns.ReturnedUser.Title)
                            $scope.item.ReturnBy = customerreturns.ReturnedUser.Title.Description;
                        if (customerreturns.ReturnedUser.FirstName)
                            $scope.item.ReturnBy += ' ' + customerreturns.ReturnedUser.FirstName;
                        if (customerreturns.ReturnedUser.LastName)
                            $scope.item.ReturnBy += ' ' + customerreturns.ReturnedUser.LastName;
                        if ($scope.item.CustomerReturnStatusId === 3) {
                            if ($scope.item.IsRefundedFully === true) {
                                $scope.currentcontext.TotNetAmount = customerreturns.ReturnAmount;
                                $scope.currentcontext.ReturnAmount = 0;
                                $scope.currentcontext.ToBeRefundAmount = 0;
                                $scope.currentcontext.RefundedAmount = customerreturns.RefundedAmount;

                                $scope.item.RefundStatus = 'Refunded';
                                $scope.IsDue = false;
                                $scope.item.ReturnWithComeRefund = true;
                            } else {
                                $scope.currentcontext.TotNetAmount = customerreturns.ReturnAmount;
                                $scope.currentcontext.ReturnAmount = customerreturns.ReturnAmount;
                                $scope.currentcontext.ToBeRefundAmount = customerreturns.ToBeRefundAmount;
                                $scope.currentcontext.RefundedAmount = customerreturns.RefundedAmount;
                            }
                        } else {
                            $scope.item.RefundStatus = 'Draft';

                            $scope.currentcontext.TotNetAmount = customerreturns.ReturnAmount;
                            $scope.currentcontext.ReturnAmount = customerreturns.ReturnAmount;
                            $scope.currentcontext.ToBeRefundAmount = customerreturns.ToBeRefundAmount;
                            $scope.currentcontext.RefundedAmount = parseFloat(customerreturns.CustomerBill.RefundAmount);
                            $scope.currentcontext.ReceivedAmount = parseFloat(customerreturns.CustomerBill.NetAmount);
                        }
                    } else if ($scope.item.PharmacyReturnTypeId == 2) {
                        $scope.currentcontext.isnewcustomer = false;

                        $scope.currentfilter.CustomerMasterId = customerreturns.CustomerMasterId;
                        $scope.currentfilter.StoreMasterId = customerreturns.StoreMasterId;
                        $scope.currentfilter.billdate = customerreturns.BillDateTime;
                        $scope.currentfilter.returndate = customerreturns.ReturnDateTime;
                        $scope.currentfilter.billnumber = customerreturns.BillNumber;
                        $scope.currentfilter.customername = customerreturns.CustomerName;
                        $scope.currentfilter.DepartmentId = customerreturns.DepartmentId;
                        $scope.currentfilter.DiscountModeId = customerreturns.DiscountModeId;

                        $scope.currentcontext.id = customerreturns.Id;
                        $scope.currentcontext.ReceiptAmt = customerreturns.ReturnAmount;
                        $scope.currentcontext.PaidAmt = parseFloat(customerreturns.CustomerBill.NetAmount) - parseFloat(customerreturns.CustomerBill.RefundAmount);
                        $scope.currentcontext.ApprovedById = customerreturns.ReturnApprovedBy;
                        $scope.currentcontext.CustomerReturnStatusId = customerreturns.CustomerReturnStatusId;

                        $scope.item.CustomerReturnStatusId = customerreturns.CustomerReturnStatusId;
                        $scope.item.BillNumber = customerreturns.BillNumber;
                        $scope.item.CustomerBillId = customerreturns.CustomerBillId;
                        $scope.item.ReturnNumber = customerreturns.ReturnNumber;
                        $scope.item.CustomerReturnId = customerreturns.Id;
                        $scope.item.DepartmentId = customerreturns.DepartmentId;
                        $scope.item.BillDateTime = customerreturns.BillDateTime;
                        $scope.item.ReturnDateTime = customerreturns.ReturnDateTime;
                        $scope.item.FacilityId = customerreturns.FacilityId;
                        $scope.item.OrganizationId = customerreturns.OrganizationId;
                        $scope.item.CustomerName = customerreturns.CustomerName;
                        $scope.item.IsRefundedFully = customerreturns.IsRefundedFully;
                        $scope.item.TotRndoffAmt = customerreturns.RoundOffValue;
                        $scope.item.TotDiscAmount = customerreturns.DiscountAmount;
                        $scope.item.GrossAmount = customerreturns.GrossAmount;
                        $scope.item.NetAmount = customerreturns.ReturnAmount;

                        if ($scope.item.CustomerReturnStatusId === 3) {
                            if ($scope.item.IsRefundedFully === true) {
                                $scope.currentcontext.TotNetAmount = customerreturns.ReturnAmount;
                                $scope.currentcontext.ReturnAmount = 0;
                                $scope.currentcontext.ToBeRefundAmount = 0;
                                $scope.currentcontext.RefundedAmount = customerreturns.RefundedAmount;

                                $scope.item.RefundStatus = 'Refunded';
                                $scope.IsDue = false;
                                $scope.item.ReturnWithComeRefund = true;
                            } else {
                                $scope.currentcontext.TotNetAmount = customerreturns.ReturnAmount;
                                $scope.currentcontext.ReturnAmount = customerreturns.ReturnAmount;
                                $scope.currentcontext.ToBeRefundAmount = customerreturns.ToBeRefundAmount;
                                $scope.currentcontext.RefundedAmount = customerreturns.RefundedAmount;
                            }
                        } else {
                            $scope.item.RefundStatus = 'Draft';

                            $scope.currentcontext.TotNetAmount = customerreturns.ReturnAmount;
                            $scope.currentcontext.ReturnAmount = customerreturns.ReturnAmount;
                            $scope.currentcontext.ToBeRefundAmount = customerreturns.ToBeRefundAmount;
                            $scope.currentcontext.RefundedAmount = parseFloat(customerreturns.CustomerBill.RefundAmount);
                            $scope.currentcontext.ReceivedAmount = parseFloat(customerreturns.CustomerBill.NetAmount);
                        }
                    } else if ($scope.item.PharmacyReturnTypeId == 3) {
                        $scope.currentcontext.isnewcustomer = false;

                        $scope.currentfilter.CustomerMasterId = customerreturns.CustomerMasterId;
                        $scope.currentfilter.StoreMasterId = customerreturns.StoreMasterId;
                        $scope.currentfilter.billdate = customerreturns.BillDateTime;
                        $scope.currentfilter.returndate = customerreturns.ReturnDateTime;
                        $scope.currentfilter.billnumber = customerreturns.BillNumber;
                        $scope.currentfilter.refundnumber = customerreturns.ReturnNumber;
                        $scope.currentfilter.customername = customerreturns.CustomerName;
                        $scope.currentfilter.DepartmentId = customerreturns.DepartmentId;
                        $scope.currentfilter.DiscountModeId = customerreturns.DiscountModeId;

                        $scope.currentcontext.id = customerreturns.Id;
                        $scope.currentcontext.ReceiptAmt = customerreturns.ReturnAmount;
                        $scope.currentcontext.PaidAmt = parseFloat(customerreturns.CustomerBill.NetAmount) - parseFloat(customerreturns.CustomerBill.RefundAmount);
                        $scope.currentcontext.ApprovedById = customerreturns.ReturnApprovedBy;
                        $scope.currentcontext.CustomerReturnStatusId = customerreturns.CustomerReturnStatusId;

                        $scope.item.CustomerReturnStatusId = customerreturns.CustomerReturnStatusId;
                        $scope.item.BillNumber = customerreturns.BillNumber;
                        $scope.item.CustomerBillId = customerreturns.CustomerBillId;
                        $scope.item.ReturnNumber = customerreturns.ReturnNumber;
                        $scope.item.CustomerReturnId = customerreturns.Id;
                        $scope.item.DepartmentId = customerreturns.DepartmentId;
                        $scope.item.BillDateTime = customerreturns.BillDateTime;
                        $scope.item.ReturnDateTime = customerreturns.ReturnDateTime;
                        $scope.item.FacilityId = customerreturns.FacilityId;
                        $scope.item.OrganizationId = customerreturns.OrganizationId;
                        $scope.item.CustomerName = customerreturns.CustomerName;
                        $scope.item.IsRefundedFully = customerreturns.IsRefundedFully;
                        $scope.item.TotRndoffAmt = customerreturns.RoundOffValue;
                        $scope.item.TotDiscAmount = customerreturns.DiscountAmount;
                        $scope.item.GrossAmount = customerreturns.GrossAmount;
                        $scope.item.NetAmount = customerreturns.ReturnAmount;

                        if ($scope.item.CustomerReturnStatusId === 3) {
                            $scope.item.BillNumber = customerreturns.BillNumber;
                            $scope.item.CustomerBillId = customerreturns.CustomerBillId;
                            $scope.item.ReturnNumber = customerreturns.ReturnNumber;
                            $scope.item.CustomerReturnId = customerreturns.Id;
                            $scope.item.DepartmentId = customerreturns.DepartmentId;
                            $scope.item.BillDateTime = customerreturns.BillDateTime;
                            $scope.item.ReturnDateTime = customerreturns.ReturnDateTime;
                            $scope.item.FacilityId = customerreturns.FacilityId;
                            $scope.item.OrganizationId = customerreturns.OrganizationId;
                            $scope.item.CustomerName = customerreturns.CustomerName;
                            $scope.item.IsRefundedFully = customerreturns.IsRefundedFully;
                            $scope.item.TotRndoffAmt = customerreturns.RoundOffValue;
                            $scope.item.TotDiscAmount = customerreturns.DiscountAmount;
                            $scope.item.GrossAmount = customerreturns.GrossAmount;
                            $scope.item.NetAmount = customerreturns.ReturnAmount;
                            if ($scope.item.IsRefundedFully === true) {
                                $scope.currentcontext.TotNetAmount = customerreturns.ReturnAmount;
                                $scope.currentcontext.ReturnAmount = 0;
                                $scope.currentcontext.ToBeRefundAmount = 0;
                                $scope.currentcontext.RefundedAmount = customerreturns.RefundedAmount;

                                $scope.item.RefundStatus = 'Refunded';
                                $scope.IsDue = false;
                                $scope.item.ReturnWithComeRefund = true;
                            } else {
                                $scope.currentcontext.TotNetAmount = customerreturns.ReturnAmount;
                                $scope.currentcontext.ReturnAmount = customerreturns.ReturnAmount;
                                $scope.currentcontext.ToBeRefundAmount = customerreturns.ToBeRefundAmount;
                                $scope.currentcontext.RefundedAmount = customerreturns.RefundedAmount;
                            }
                        } else {
                            $scope.item.RefundStatus = 'Draft';

                            $scope.currentcontext.TotNetAmount = customerreturns.ReturnAmount;
                            $scope.currentcontext.ReturnAmount = customerreturns.ReturnAmount;
                            $scope.currentcontext.ToBeRefundAmount = customerreturns.ToBeRefundAmount;
                            $scope.currentcontext.RefundedAmount = parseFloat(customerreturns.CustomerBill.RefundAmount);
                            $scope.currentcontext.ReceivedAmount = parseFloat(customerreturns.CustomerBill.NetAmount);
                        }
                    } else if ($scope.item.PharmacyReturnTypeId == 4) {
                        $scope.item.PharmacySaleTypeId = 4;
                        $scope.currentcontext.isnewcustomer = true;

                        $scope.newCustomer.CustomerName = customerreturns.CustomerName;
                        //$scope.newCustomer.DoctorName = customerbills.DoctorName;
                        //$scope.newCustomer.Mobile = customerbills.Mobile;
                        //$scope.newCustomer.TitleId = customerbills.TitleId;
                        //$scope.newCustomer.GenderId = customerbills.GenderId;
                        //$scope.newCustomer.DOB = customerbills.DOB;
                        //$scope.newCustomer.Age = customerbills.Age;

                        $scope.currentfilter.CustomerMasterId = customerreturns.CustomerMasterId;
                        $scope.currentfilter.StoreMasterId = customerreturns.StoreMasterId;
                        $scope.currentfilter.billdate = customerreturns.BillDateTime;
                        $scope.currentfilter.returndate = customerreturns.ReturnDateTime;
                        $scope.currentfilter.billnumber = customerreturns.BillNumber;
                        $scope.currentfilter.refundnumber = customerreturns.ReturnNumber;
                        $scope.currentfilter.customername = customerreturns.CustomerName;
                        $scope.currentfilter.DepartmentId = customerreturns.DepartmentId;
                        $scope.currentfilter.DiscountModeId = customerreturns.DiscountModeId;

                        $scope.currentcontext.id = customerreturns.Id;
                        $scope.currentcontext.ReceiptAmt = customerreturns.ReturnAmount;
                        $scope.currentcontext.PaidAmt = parseFloat(customerreturns.CustomerBill.NetAmount) - parseFloat(customerreturns.CustomerBill.RefundAmount);
                        $scope.currentcontext.ApprovedById = customerreturns.ReturnApprovedBy;
                        $scope.currentcontext.CustomerReturnStatusId = customerreturns.CustomerReturnStatusId;

                        $scope.item.CustomerReturnStatusId = customerreturns.CustomerReturnStatusId;
                        $scope.item.BillNumber = customerreturns.BillNumber;
                        $scope.item.CustomerBillId = customerreturns.CustomerBillId;
                        $scope.item.ReturnNumber = customerreturns.ReturnNumber;
                        $scope.item.CustomerReturnId = customerreturns.Id;
                        $scope.item.DepartmentId = customerreturns.DepartmentId;
                        $scope.item.BillDateTime = customerreturns.BillDateTime;
                        $scope.item.ReturnDateTime = customerreturns.ReturnDateTime;
                        $scope.item.FacilityId = customerreturns.FacilityId;
                        $scope.item.OrganizationId = customerreturns.OrganizationId;
                        $scope.item.DoctorId = customerreturns.DoctorId;
                        $scope.item.CustomerName = customerreturns.CustomerName;
                        $scope.item.IsRefundedFully = customerreturns.IsRefundedFully;
                        $scope.item.TotRndoffAmt = customerreturns.RoundOffValue;
                        $scope.item.TotDiscAmount = customerreturns.DiscountAmount;
                        $scope.item.GrossAmount = customerreturns.GrossAmount;
                        $scope.item.NetAmount = customerreturns.ReturnAmount;

                        if ($scope.item.CustomerReturnStatusId === 3) {
                            if ($scope.item.IsRefundedFully === true) {
                                $scope.currentcontext.TotNetAmount = customerreturns.ReturnAmount;
                                $scope.currentcontext.ReturnAmount = 0;
                                $scope.currentcontext.ToBeRefundAmount = 0;
                                $scope.currentcontext.RefundedAmount = customerreturns.RefundedAmount;

                                $scope.item.RefundStatus = 'Refunded';
                                $scope.IsDue = false;
                                $scope.item.ReturnWithComeRefund = true;
                            } else {
                                $scope.currentcontext.TotNetAmount = customerreturns.ReturnAmount;
                                $scope.currentcontext.ReturnAmount = customerreturns.ReturnAmount;
                                $scope.currentcontext.ToBeRefundAmount = customerreturns.ToBeRefundAmount;
                                $scope.currentcontext.RefundedAmount = customerreturns.RefundedAmount;
                            }

                            $scope.IsDisabled = true;
                            $scope.RdoPharmacySaleType = true;
                        } else {
                            $scope.item.RefundStatus = 'Draft';

                            $scope.currentcontext.TotNetAmount = customerreturns.ReturnAmount;
                            $scope.currentcontext.ReturnAmount = customerreturns.ReturnAmount;
                            $scope.currentcontext.ToBeRefundAmount = customerreturns.ToBeRefundAmount;
                            $scope.currentcontext.RefundedAmount = parseFloat(customerreturns.CustomerBill.RefundAmount);
                            $scope.currentcontext.ReceivedAmount = parseFloat(customerreturns.CustomerBill.NetAmount);

                            $scope.IsDisabled = false;
                            $scope.RdoPharmacySaleType = false;
                        }
                    }
                    $scope.customerChange();
                    $scope.item.CardTypeId = -1;
                    $scope.item.BankId = -1;
                    $scope.item.ChequeNo = '';
                    $scope.item.DDNumber = 0;
                    $scope.item.CollectedOn = utl.Formatter.getCurrentDate();
                    $scope.item.ChequeDate = utl.Formatter.getCurrentDate();
                    $scope.item.DDDate = utl.Formatter.getCurrentDate();
                    $scope.item.WireTransferId = -1;
                    $scope.item.AuthorizeNumber = 0;

                    $scope.CustomerReturnDetails = [];
                    $scope.CustomerReturnDetails = customerreturns.CustomerReturnDetails;
                    for (var idx in $scope.CustomerReturnDetails) {
                        var item = $scope.CustomerReturnDetails[idx];
                        item.CustomerReturnDetailId = customerreturns.Id;
                        item.IsRefundCompleted = false;
                        if ($scope.item.CustomerReturnStatusId == 3) {
                            item.IsRefundCompleted = true;
                        }

                        item.RST = '';
                        if (item.RackName) {
                            item.RST = item.RackName;
                        }
                        if (item.Shelf) {
                            item.RST = item.RST + ' / ' + item.Shelf;
                        }
                        if (item.Tray) {
                            item.RST = item.RST + ' / ' + item.Tray;
                        }
                    }
                    $scope.IsNewBill = false;
                    $scope.applyVisibilityRules();

                    /*
                    if (!$scope.item.IsRefundedFully) {
                        $scope.currentcontext.ReceiptAmt = $scope.currentcontext.PaidAmt;
                    }
                    */
                });
            }
            $scope.getStorePrintPreference();
            if ($scope.SaveImdDMPrint == 1) {
                $scope.SaveImdDMPrint = 0;
                if ($scope.dmprintpreferences == 1) {
                    $scope.dmPrint();
                } else {
                    $scope.print();
                }
            }
        };

        $scope.pickreturns = function () {
            utl.Modal.open('app.pick-from-saleslist', {
                params: {
                    customerid: $scope.item.CustomerMasterId,
                    encounterid: $scope.item.EncounterId,
                    id: $scope.item.EncounterId
                },
                confirmCallback: loadSelectedList
            });
        };

        function loadSelectedList(selectedList) {
            $scope.item.IsPicked = selectedList.IsPicked;
            $scope.item.EncounterId = selectedList.EncId;
            $scope.selectedCustomer = selectedList.CustomerInfo;
            $scope.item.CustomerBills = selectedList.CustomerBills;
            $scope.CustomerReturnDetails = [];
            if (selectedList.ReturnData && selectedList.ReturnData.length > 0) {
                selectedList.ReturnData.forEach(SelectedReturn => {
                    var ReturnItemDetail = {
                        Id: 0,
                        CustomerStockRequestDetailId: 0,
                        CustomerBillDetailId: SelectedReturn.CustomerBillDetailId,
                        CustomerBillId: SelectedReturn.CustomerBillId,
                        ServiceId: SelectedReturn.ItemMasterId,
                        ItemMasterId: SelectedReturn.ItemMasterId,
                        ItemCode: SelectedReturn.ItemCode,
                        ServiceName: SelectedReturn.ItemName,
                        ReturnQuantity: parseInt(SelectedReturn.ReturnQuantity),
                        Quantity: parseInt(SelectedReturn.SoldQuantity),
                        ReturnedQuantity: SelectedReturn.ReturnedQuantity,
                        BilledQuantity: SelectedReturn.Quantity,
                        ReceivedQuantity: 0,
                        StockItemId: SelectedReturn.StockItemId,
                        StockSerialItemId: SelectedReturn.StockSerialItemId,
                        BatchId: SelectedReturn.BatchId,
                        ExpiryDate: SelectedReturn.ExpiryDate,
                        Ucp: SelectedReturn.Rate,
                        MrPrice: SelectedReturn.Rate,
                        GstId: SelectedReturn.GSTId,
                        GSTPercentage: SelectedReturn.GSTPercentage,
                        GstAmount: SelectedReturn.GSTAmount,
                        InGstId: SelectedReturn.InGstId,
                        InGstPercentage: SelectedReturn.InGstPercentage,
                        InGstAmount: SelectedReturn.InGstAmount,
                        CGstId: SelectedReturn.CGstId,
                        CGstPercentage: SelectedReturn.CGstPercentage,
                        CGstAmount: SelectedReturn.CGstAmount,
                        SGstId: SelectedReturn.SGstId,
                        SGstPercentage: SelectedReturn.SGstPercentage,
                        SGstAmount: SelectedReturn.SGstAmount,
                        UnitSGstAmount: SelectedReturn.UnitSGstAmount,
                        UnitCGstAmount: SelectedReturn.UnitCGstAmount,
                        UnitInGstAmount: SelectedReturn.UnitInGstAmount,
                        Rate: SelectedReturn.Rate,
                        UnitGSTAmount: SelectedReturn.UnitGSTAmount,
                        UnitDiscountAmount: SelectedReturn.UnitDiscountAmount,
                        GrossAmount: parseInt(SelectedReturn.ReturnQuantity) * SelectedReturn.Rate,
                        Amount: parseInt(SelectedReturn.ReturnQuantity) * SelectedReturn.Rate,
                        Amount: parseInt(SelectedReturn.ReturnQuantity) * SelectedReturn.Rate,
                        NetAmount: parseInt(SelectedReturn.ReturnQuantity) * SelectedReturn.Rate,
                        Comments: '',
                        Status: 1,
                        CanDisableDetails: false
                    }
                    // $scope.item.GrossAmount = $scope.item.GrossAmount + ReturnItemDetail.GrossAmount;
                    // $scope.item.TotalGstAmount = $scope.item.TotalGstAmount + ReturnItemDetail.GstAmount;
                    // $scope.item.TotalInGstAmount = $scope.item.TotalInGstAmount + ReturnItemDetail.InGstAmount;
                    // $scope.item.TotalCGstAmount = $scope.item.TotalCGstAmount + ReturnItemDetail.CGstAmount;
                    // $scope.item.TotalSGstAmount = $scope.item.TotalSGstAmount + ReturnItemDetail.SGstAmount;
                    // $scope.item.TotalNetAmount = $scope.item.TotalNetAmount + ReturnItemDetail.NetAmount;
                    $scope.CustomerReturnDetails.push(ReturnItemDetail);
                    $scope.item.PharmacyReturnTypeId = 1;
                    $scope.item.CustomerName = $scope.selectedCustomer.CustomerName;
                    $scope.item.CustomerMasterId = $scope.selectedCustomer.Id;
                    $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
                    $scope.CalcualteAmt(ReturnItemDetail);
                });
            }

            // $scope.CalculateNetAmt();
        }


        $scope.customerprofiledetails = function () {
            utl.Modal.open('registration.customerprofile', {
                params: {
                    pid: $scope.currentfilter.CustomerMasterId
                },
                confirmCallback: $scope.getItem
            });
        };

        /* Find and Loading the Bill Ends Here */

        /* Enter Qty and Calculations Starts Here */

        $scope.CalcualteAmt = function (item) {
            $scope.currentcontext.ReceiptAmt = 0;
            // if (parseInt(item.ReturnQuantity) > item.Quantity - item.ReturnedQuantity) {
            //     item.ReturnQuantity = 0;
            //     utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.saledqty.lbl'));
            // } else {
                $scope.currentcontext.BillDiscount = 0;
                item.DiscountAmount = parseInt(item.ReturnQuantity) * item.UnitDiscountAmount;

                //item.Rate = parseFloat(item.Rate) - item.UnitDiscountAmount;
                item.Amount = parseInt(item.ReturnQuantity) * (item.Rate - item.UnitDiscountAmount);

                item.GSTAmount = parseInt(item.ReturnQuantity) * item.UnitGSTAmount;
                item.InGstAmount = parseInt(item.ReturnQuantity) * item.UnitInGstAmount;
                item.CGstAmount = parseInt(item.ReturnQuantity) * item.UnitCGstAmount;
                item.SGstAmount = parseInt(item.ReturnQuantity) * item.UnitSGstAmount;
                item.ConsumedTransactions = parseInt(item.ReturnQuantity);
                item.PendingTransactions = parseInt(item.ReturnQuantity);
                item.NetAmount = item.Amount;
                item.NetAmountBeforeGST = item.NetAmount - item.GSTAmount;
            //     if (item.NetAmount >= 0) {
            //         $scope.CalculateNetAmt();
            //         $scope.updatereceiptamount();
            //         //$scope.applyVisibilityRules();
            //     } else {
            //         utl.Alert.showErrorMsg($translate.instant('billing.opbilling-list.discountlimit.lbl'));
            //     }
            // }
        };

        $scope.ReturnAll = function () {
            if ($scope.item.ReturnAll) {
                $scope.currentcontext.BillDiscount = 0;
                for (var i = 0, len = $scope.CustomerReturnDetails.length; i < len; i++) {
                    if ($scope.CustomerReturnDetails[i].Status == 1) {
                        $scope.CustomerReturnDetails[i].ReturnQuantity = $scope.CustomerReturnDetails[i].Quantity - $scope.CustomerReturnDetails[i].ReturnedQuantity;
                        $scope.CustomerReturnDetails[i].DiscountAmount = parseInt($scope.CustomerReturnDetails[i].ReturnQuantity) * $scope.CustomerReturnDetails[i].UnitDiscountAmount;
                        $scope.CustomerReturnDetails[i].Amount = parseInt($scope.CustomerReturnDetails[i].ReturnQuantity) * ($scope.CustomerReturnDetails[i].Rate - $scope.CustomerReturnDetails[i].UnitDiscountAmount);

                        $scope.CustomerReturnDetails[i].GSTAmount = parseInt($scope.CustomerReturnDetails[i].ReturnQuantity) * $scope.CustomerReturnDetails[i].UnitGSTAmount;
                        $scope.CustomerReturnDetails[i].InGstAmount = parseInt($scope.CustomerReturnDetails[i].ReturnQuantity) * $scope.CustomerReturnDetails[i].UnitInGstAmount;
                        $scope.CustomerReturnDetails[i].CGstAmount = parseInt($scope.CustomerReturnDetails[i].ReturnQuantity) * $scope.CustomerReturnDetails[i].UnitCGstAmount;
                        $scope.CustomerReturnDetails[i].SGstAmount = parseInt($scope.CustomerReturnDetails[i].ReturnQuantity) * $scope.CustomerReturnDetails[i].UnitSGstAmount;

                        $scope.CustomerReturnDetails[i].NetAmount = $scope.CustomerReturnDetails[i].Amount;
                        $scope.CustomerReturnDetails[i].NetAmountBeforeGST = $scope.CustomerReturnDetails[i].NetAmount - $scope.CustomerReturnDetails[i].GSTAmount;
                    }
                }
            } else {
                for (var i = 0, len = $scope.CustomerReturnDetails.length; i < len; i++) {
                    if ($scope.CustomerReturnDetails[i].Status == 1) {
                        $scope.CustomerReturnDetails[i].ReturnQuantity = 0;
                        $scope.CustomerReturnDetails[i].DiscountAmount = parseInt($scope.CustomerReturnDetails[i].ReturnQuantity) * $scope.CustomerReturnDetails[i].UnitDiscountAmount;
                        $scope.CustomerReturnDetails[i].Amount = parseInt($scope.CustomerReturnDetails[i].ReturnQuantity) * ($scope.CustomerReturnDetails[i].Rate - $scope.CustomerReturnDetails[i].UnitDiscountAmount);

                        $scope.CustomerReturnDetails[i].GSTAmount = parseInt($scope.CustomerReturnDetails[i].ReturnQuantity) * $scope.CustomerReturnDetails[i].UnitGSTAmount;
                        $scope.CustomerReturnDetails[i].InGstAmount = parseInt($scope.CustomerReturnDetails[i].ReturnQuantity) * $scope.CustomerReturnDetails[i].UnitInGstAmount;
                        $scope.CustomerReturnDetails[i].CGstAmount = parseInt($scope.CustomerReturnDetails[i].ReturnQuantity) * $scope.CustomerReturnDetails[i].UnitCGstAmount;
                        $scope.CustomerReturnDetails[i].SGstAmount = parseInt($scope.CustomerReturnDetails[i].ReturnQuantity) * $scope.CustomerReturnDetails[i].UnitSGstAmount;

                        $scope.CustomerReturnDetails[i].NetAmount = $scope.CustomerReturnDetails[i].Amount;
                        $scope.CustomerReturnDetails[i].NetAmountBeforeGST = $scope.CustomerReturnDetails[i].NetAmount - $scope.CustomerReturnDetails[i].GSTAmount;
                    }
                }
            }
            $scope.CalculateNetAmt();
            $scope.updatereceiptamount();
        };

        $scope.CalculateNetAmt = function () {
            var itemwiseGrossAmt = 0;
            var itemwiseNetAmt = 0;
            var itemwiseDiscountAmt = 0;

            var itemwiseGstAmt = 0;
            var itemwiseInGstAmt = 0;
            var itemwiseCGstAmt = 0;
            var itemwiseSGstAmt = 0;

            for (var i = 0, len = $scope.CustomerReturnDetails.length; i < len; i++) {
                if ($scope.CustomerReturnDetails[i].Status == 1 && $scope.CustomerReturnDetails[i].ReturnQuantity > 0) {
                    var itemnetAmount = 0;
                    var itemGrossAmount = 0;
                    var itemDiscountAmount = 0;

                    var itemGstAmount = 0;
                    var itemInGstAmount = 0;
                    var itemCGstAmount = 0;
                    var itemSGstAmount = 0;

                    itemnetAmount = isNaN(parseFloat($scope.CustomerReturnDetails[i].NetAmount)) ? 0 : parseFloat($scope.CustomerReturnDetails[i].NetAmount);
                    itemGrossAmount = isNaN(parseFloat($scope.CustomerReturnDetails[i].Amount)) ? 0 : parseFloat($scope.CustomerReturnDetails[i].Amount);
                    itemDiscountAmount = isNaN(parseFloat($scope.CustomerReturnDetails[i].DiscountAmount)) ? 0 : parseFloat($scope.CustomerReturnDetails[i].DiscountAmount);

                    itemInGstAmount = isNaN(parseFloat($scope.CustomerReturnDetails[i].InGstAmount)) ? 0 : parseFloat($scope.CustomerReturnDetails[i].InGstAmount);
                    itemCGstAmount = isNaN(parseFloat(($scope.CustomerReturnDetails[i].NetAmount * $scope.CustomerReturnDetails[i].CGstPercentage) / (100 + $scope.CustomerReturnDetails[i].GSTPercentage)).toFixed(2)) ? 0 : parseFloat(($scope.CustomerReturnDetails[i].NetAmount * $scope.CustomerReturnDetails[i].CGstPercentage) / (100 + $scope.CustomerReturnDetails[i].GSTPercentage)).toFixed(2);
                    itemSGstAmount = isNaN(parseFloat(($scope.CustomerReturnDetails[i].NetAmount * $scope.CustomerReturnDetails[i].SGstPercentage) / (100 + $scope.CustomerReturnDetails[i].GSTPercentage)).toFixed(2)) ? 0 : parseFloat(($scope.CustomerReturnDetails[i].NetAmount * $scope.CustomerReturnDetails[i].SGstPercentage) / (100 + $scope.CustomerReturnDetails[i].GSTPercentage)).toFixed(2);
                    itemGstAmount = parseFloat(itemCGstAmount) + parseFloat(itemSGstAmount);
                    // itemGstAmount = isNaN(parseFloat($scope.CustomerReturnDetails[i].GstAmount)) ? 0 : parseFloat($scope.CustomerReturnDetails[i].GstAmount);

                    // itemCGstAmount = isNaN(parseFloat($scope.CustomerReturnDetails[i].CGstAmount)) ? 0 : parseFloat($scope.CustomerReturnDetails[i].CGstAmount);
                    // itemSGstAmount = isNaN(parseFloat($scope.CustomerReturnDetails[i].SGstAmount)) ? 0 : parseFloat($scope.CustomerReturnDetails[i].SGstAmount);
                    /*
                    if ($scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 2) {
                        itemDiscountAmount = itemDiscountAmount / 100 * itemGrossAmount;
                    }
                    */


                    if ($scope.currentfilter.GuarantorTypeId == 6) { // Free type
                        if ($scope.CustomerReturnDetails[i].NetAmount) { // FreeNetAmount
                            $scope.CustomerReturnDetails[i].FreeNetAmount = $scope.CustomerReturnDetails[i].NetAmount;
                        }
                        $scope.CustomerReturnDetails[i].NetAmount = 0;
                        $scope.CustomerReturnDetails[i].DoctorShare = 0;
                        $scope.CustomerReturnDetails[i].GSTAmount = 0;
                        itemGrossAmount = 0;
                        itemnetAmount = 0;
                        itemDiscountAmount = 0;
                    }

                    itemwiseGrossAmt += itemGrossAmount;
                    itemwiseNetAmt += itemnetAmount;
                    itemwiseDiscountAmt += itemDiscountAmount;

                    itemwiseGstAmt += itemGstAmount;
                    itemwiseInGstAmt += itemInGstAmount;
                    itemwiseCGstAmt += parseFloat(itemCGstAmount);
                    itemwiseSGstAmt += parseFloat(itemSGstAmount);
                }
            }
            $scope.currentcontext.PaidAmt = (!$scope.currentcontext.PaidAmt) ? 0 : $scope.currentcontext.PaidAmt;
            $scope.currentcontext.RefundAmt = (!$scope.currentcontext.RefundAmt) ? 0 : $scope.currentcontext.RefundAmt;
            //             if ($scope.item.TotDiscAmount > 0) {
            //                 $scope.item.TotDiscAmount = $scope.item.TotDiscAmount;
            //             } else {
            $scope.item.TotDiscAmount = itemwiseDiscountAmt;
            //             }
            $scope.item.GrossAmount = 0;
            $scope.currentcontext.TotNetAmount = 0;
            $scope.currentcontext.TotBalanceAmt = 0;

            $scope.item.GrossAmount = decimalRoundOff(itemwiseGrossAmt);
            $scope.item.GstAmount = itemwiseGstAmt;
            $scope.item.InGstAmount = itemwiseInGstAmt;
            $scope.item.CGstAmount = itemwiseCGstAmt;
            $scope.item.SGstAmount = itemwiseSGstAmt;

            $scope.currentcontext.ReceiptAmt = (!$scope.currentcontext.ReceiptAmt) ? 0 : $scope.currentcontext.ReceiptAmt;

            if ($scope.currentcontext.BillDiscount > 0) {
                if ($scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 2) {
                    $scope.item.TotDiscAmount = $scope.currentcontext.BillDiscount / 100 * $scope.item.GrossAmount;
                } else if ($scope.currentfilter.DiscountModeId == 1) {
                    $scope.item.TotDiscAmount = $scope.currentcontext.BillDiscount;
                }
            } else if (itemwiseDiscountAmt > 0) {
                $scope.item.TotDiscAmount = itemwiseDiscountAmt;
            }

            /*
            $scope.currentcontext.TotNetAmount = parseFloat($scope.item.GrossAmount) - parseFloat($scope.item.TotDiscAmount);
            $scope.currentcontext.ToBeRefundAmount = parseFloat($scope.item.GrossAmount) - parseFloat($scope.item.TotDiscAmount);
            $scope.currentcontext.ReturnAmount = parseFloat($scope.item.GrossAmount) - parseFloat($scope.item.TotDiscAmount);
            */

            $scope.currentcontext.TotNetAmount = parseFloat($scope.item.GrossAmount);
            $scope.currentcontext.ToBeRefundAmount = parseFloat($scope.item.GrossAmount);
            $scope.currentcontext.ReturnAmount = parseFloat($scope.item.GrossAmount);

            $scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.TotNetAmount) - parseFloat($scope.currentcontext.ReceiptAmt) - parseFloat($scope.currentcontext.RefundAmt);
            var billBalance = parseFloat($scope.currentcontext.TotNetAmount) - parseFloat($scope.currentcontext.RefundAmt);

            /*
            if ($scope.currentcontext.ReceiptAmt > ($scope.item.GrossAmount + $scope.item.TotRndoffAmt)) {
                $scope.currentcontext.ReceiptAmt = 0;
                $scope.currentcontext.TotBalanceAmt = billBalance;
                utl.Alert.showErrorMsg($translate.instant('Refund Amount should not exceed with Actual Return Amount...!'));
            }
            */

            var NetNaturalValue = getNatural(Number($scope.currentcontext.TotNetAmount).toFixed(2));
            var NetDecimalValue = getDecimal(Number($scope.currentcontext.TotNetAmount).toFixed(2));
            var PreferedRoundOff = parseFloat($scope.item.PreferedRoundOff);
            var NetRoundOffValue = 0;

            if (NetDecimalValue > 0 && NetDecimalValue < 50) {
                $scope.currentcontext.TotNetAmount = NetNaturalValue;
                $scope.currentcontext.ToBeRefundAmount = $scope.currentcontext.TotNetAmount;
                $scope.currentcontext.ReturnAmount = $scope.currentcontext.TotNetAmount;
                $scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.PaidAmt) - parseFloat($scope.currentcontext.ReceiptAmt) - parseFloat($scope.currentcontext.TotNetAmount);
                // $scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.TotNetAmount) - parseFloat($scope.currentcontext.ReceiptAmt) - parseFloat($scope.currentcontext.PaidAmt);
                NetRoundOffValue = -1 * (NetDecimalValue / 100);
                $scope.item.TotRndoffAmt = parseFloat(NetRoundOffValue);
            } else if (NetDecimalValue >= 50 && NetDecimalValue <= 99) {
                $scope.currentcontext.TotNetAmount = NetNaturalValue + 1;
                $scope.currentcontext.ToBeRefundAmount = $scope.currentcontext.TotNetAmount;
                $scope.currentcontext.ReturnAmount = $scope.currentcontext.TotNetAmount;
                $scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.PaidAmt) - parseFloat($scope.currentcontext.ReceiptAmt) - parseFloat($scope.currentcontext.TotNetAmount);
                // $scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.TotNetAmount) - parseFloat($scope.currentcontext.ReceiptAmt) - parseFloat($scope.currentcontext.PaidAmt);
                NetRoundOffValue = (100 - NetDecimalValue) / 100;
                $scope.item.TotRndoffAmt = parseFloat(NetRoundOffValue);
            } else {
                NetRoundOffValue = 0;
                $scope.item.TotRndoffAmt = parseFloat(NetRoundOffValue);
            }

            $scope.item.Received = $scope.currentcontext.ReceiptAmt !== 0 ?
                $scope.currentcontext.ReceiptAmt : $scope.currentcontext.RefundAmt !== 0 ? $scope.currentcontext.RefundAmt : 0;
        };

        $scope.updatereceiptamount = function () {
            if ($scope.item.ReturnWithComeRefund) {

                //$scope.currentcontext.TotBalanceAmt;
                $scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.TotBalanceAmt).toFixed(2);
                $scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.TotBalanceAmt);

                $scope.currentcontext.TotNetAmount = parseFloat($scope.currentcontext.TotNetAmount).toFixed(2);
                $scope.currentcontext.TotNetAmount = parseFloat($scope.currentcontext.TotNetAmount);

                if (($scope.currentcontext.ReceivedAmount - $scope.currentcontext.RefundedAmount) < $scope.currentcontext.TotNetAmount) {
                    //utl.Alert.showErrorMsg('Refund Amount Will not be Greater than Paid Amount');
                    $scope.currentcontext.ReceiptAmt = ($scope.currentcontext.ReceivedAmount - $scope.currentcontext.RefundedAmount);
                    $scope.currentcontext.ReturnAmount = ($scope.currentcontext.ReceivedAmount - $scope.currentcontext.RefundedAmount);
                    $scope.currentcontext.ToBeRefundAmount = $scope.currentcontext.ReturnAmount;
                } else {
                    $scope.currentcontext.ReceiptAmt = parseFloat($scope.currentcontext.ReceiptAmt) + parseFloat($scope.currentcontext.TotBalanceAmt);
                    $scope.item.Received = ($scope.currentcontext.TotNetAmount);
                    $scope.currentcontext.TotBalanceAmt = 0.00;
                    $scope.currentcontext.ReceiptAmt = $scope.currentcontext.TotNetAmount;
                }
            } else {
                $scope.currentcontext.ReceiptAmt = 0;
                $scope.currentcontext.ReturnAmount = 0;
            }
        };

        $scope.doReceipt = function () {
            $scope.currentcontext.ReceiptAmt = 0;
            $scope.CalculateNetAmt();
            $scope.updatereceiptamount();
        };

        function getNatural(num) {
            return parseFloat(num.toString().split(".")[0]);
        }

        function getDecimal(num) {
            return parseFloat(num.toString().split(".")[1]);
        }

        function decimalRoundOff(value) {
            var result = parseFloat(value).toFixed(2);
            return parseFloat(result);
        }

        /* Enter Qty and Calculations Ends Here */

        /* Save or Save&Approve Starts Here */

        $scope.saveDraft = function () {
            $scope.item.ReturnDateTime = utl.Formatter.getCurrentDate();
            $scope.item.ReturnGeneratedBy = utl.Session.getCurrentUserId();
            $scope.saveItem(1);
        };

        /* - Security IsValid */
        $scope.securitypisvalid = false;
        $scope.SecurityPINChkCallback = function (SecurityStatus) {
            //console.log(SecurityStatus);
            $scope.securitypisvalid = SecurityStatus.pinstatus;
            $scope.saveAndApprove();
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
        /* - Security IsValid */

        $scope.saveAndApprove = function () {
            $scope.isSaveandApprove = false;
            $scope.item.ReturnApprovedBy = utl.Session.getCurrentUserId();
            if ($scope.item.returnnumber === null) {
                $scope.item.ReturnNumber = '';
                $scope.item.ReturnDateTime = utl.Formatter.getCurrentDate();
            }

            if ($scope.currentcontext.TotBalanceAmt === 0) {
                $scope.item.IsPaidFully = true;
            }

            /* Security IsValid */
            $scope.requiredsecuritypin =
                utl.FacilitySetting.getFacilitySettingValue('billing', 'requiredsecuritypin');

            if ($scope.requiredsecuritypin && !$scope.securitypisvalid)
                if (!$scope.securitypincheck())
                    return false;

            /* Security IsValid */

            $scope.saveItem(3);
        };

        $scope.saveCancelled = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'billing.opbilling-list.cancelmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.CancelReceipt,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.CancelReceipt = function () {
            $scope.openModal($scope.currentcontext.id, 'cancel');
        };

        $scope.ViewReceipt = function () {
            $scope.openModal($scope.currentcontext.id, 'view');
        };

        $scope.openModal = function (id, type) {
            utl.Modal.open('app.cancelreceipt', {
                params: {
                    id: id,
                    type: type
                },
                confirmCallback: $scope.onCancelConfirmed
            });
        };

        $scope.onCancelConfirmed = function (reason) {
            $scope.item.CancelReason = reason;
            $scope.saveItem(2);
        };

        $scope.saveBillCancelled = function () {
            $scope.saveItem(3);
        };

        $scope.completeBill = function (action) {
            if (!utl.Validator.validate($scope)) {
                $scope.isSaveandApprove = true;
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'billing.billing-details.confirm.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: action,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };

        $scope.saveItem = function (StatusId) {

            if (savehitcompleted == 1) return false;

            $scope.item.CustomerReturnStatusId = StatusId;
            var dTotNetAmount = parseFloat($scope.currentcontext.TotNetAmount);
            var RefundAmt = parseFloat($scope.currentcontext.RefundAmt);
            var dReceiptAmt = parseFloat($scope.currentcontext.ReturnAmount);

            if (dReceiptAmt < 0) {
                utl.Alert.showErrorMsg('billing.opbilling-list.returnamt.lbl');


                dReceiptAmt = 0;
                return false;
            }

            if ($scope.item.CustomerReturnStatusId == 1 && dReceiptAmt > 0) {
                /*
                utl.Alert.showSuccessMsg('Amount collection use save and approve button');
                $scope.currentcontext.ReceiptAmt = 0;
                dReceiptAmt = 0;
                $scope.CalculateNetAmt();
                return false;
                */

                $scope.item.ReturnWithComeRefund = false;
            }

            $scope.item.Id = $scope.currentcontext.id;
            $scope.item.ReturnDateTime = utl.Formatter.getCurrentDate();
            $scope.item.CustomerMasterId = $scope.currentfilter.CustomerMasterId;
            $scope.item.ReturnTypeId = $scope.item.PharmacyReturnTypeId;
            $scope.item.ReturnAmount = $scope.currentcontext.ReturnAmount;
            $scope.item.DiscountModeId = $scope.currentfilter.DiscountModeId;
            $scope.item.DiscountAmount = $scope.item.TotDiscAmount;
            $scope.item.NetAmount = $scope.currentcontext.TotNetAmount;
            $scope.item.RoundOffValue = $scope.item.TotRndoffAmt;
            if ($scope.item.ReturnWithComeRefund) {
                $scope.item.RefundedAmount = $scope.currentcontext.ReturnAmount;
                $scope.item.ToBeRefundAmount = 0;
                $scope.item.IsRefundedFully = true;
            } else {
                $scope.item.RefundedAmount = 0;
                $scope.item.ToBeRefundAmount = $scope.currentcontext.ToBeRefundAmount;
                $scope.item.IsRefundedFully = false;
            }
            if ($scope.item.PharmacySaleTypeId == 4) {
                $scope.item.DepartmentId = 0;
            } else {
                $scope.item.DepartmentId = $scope.item.DepartmentId;
            }
            $scope.item.GuarantorId = $scope.currentfilter.GuarantorId;
            $scope.item.GuarantorTypeId = $scope.currentfilter.GuarantorTypeId;
            $scope.item.GuarantorName = $scope.currentfilter.GuarantorName;
            $scope.item.ReturnGeneratedById = utl.Session.getCurrentUserId();
            $scope.item.ReturnApprovedById = utl.Session.getCurrentUserId();
            $scope.item.StoreMasterId = $scope.currentfilter.StoreMasterId;
            $scope.item.StoreTypeId = $scope.currentfilter.StoreTypeId;
            $scope.item.StoreSubTypeId = $scope.currentfilter.StoreSubTypeId;
            $scope.item.SequenceOptionId = $scope.currentfilter.SequenceOptionId;
            $scope.item.CancelReason = '';
            $scope.item.Comments = '';

            var pharmacyreturnitemlines = getLinesForSave();
            if (pharmacyreturnitemlines.length <= 0) {
                utl.Alert.showErrorMsg('billing.pharmacy.returnquantity.lbl');
                return false;
            }
            var returnedpaymentlines = getpaymentsLinesForSave();


            if ($scope.currentfilter.GuarantorTypeId == 6) { // Free type
                var itemwiseNetAmt = 0;
                for (var i = 0, len = $scope.CustomerReturnDetails.length; i < len; i++) {
                    if ($scope.CustomerReturnDetails[i].Status == 1) {
                        var itemnetAmount = 0;
                        itemnetAmount = isNaN(parseFloat($scope.CustomerReturnDetails[i].FreeNetAmount)) ?
                            0 : parseFloat($scope.CustomerReturnDetails[i].FreeNetAmount);
                        itemwiseNetAmt += itemnetAmount;
                    }
                }
                $scope.item.FreeReturnAmount = itemwiseNetAmt;
                $scope.item.FreeRefundAmount = $scope.item.RefundAmount;
                $scope.item.ReturnAmount = 0;
                $scope.item.RefundAmount = 0;
            }
console.log($scope.item);
// return;
            var actionName = 'billing/customerreturns/AddCustomerReturns';
            // if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
            //     actionName = 'billing/customerreturns/UpdateCustomerReturns';
            // }

            savehitcompleted = 1;

            var inputData = {
                Header: $scope.item,
                Details: pharmacyreturnitemlines,
                paymentDetail: returnedpaymentlines
            };
            // console.log(inputData);return;
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

        function getLinesForSave() {
            var result = [];
            for (var piidx in $scope.CustomerReturnDetails) {
                var pharmacyitem = $scope.CustomerReturnDetails[piidx];
                if (pharmacyitem.ItemMasterId > 0 && parseInt(pharmacyitem.ReturnQuantity) > 0 /* && pharmacyitem.Amount > 0 */) {
                    pharmacyitem.ReturnDateTime = utl.Formatter.getCurrentDate();
                    pharmacyitem.FacilityId = utl.Session.getCurrentFacilityId();
                    pharmacyitem.CustomerMasterId = $scope.currentfilter.CustomerMasterId;
                    pharmacyitem.ServiceId = pharmacyitem.ServiceId;
                    pharmacyitem.ServiceName = pharmacyitem.ServiceName;
                    pharmacyitem.StoreMasterId = $scope.currentfilter.StoreMasterId;
                    pharmacyitem.EncounterId = $scope.item.EncounterId;
                    pharmacyitem.CustomerReturnStatusId = $scope.item.CustomerReturnStatusId;
                    pharmacyitem.ReturnedQuantity = parseInt(pharmacyitem.ReturnedQuantity);
                    pharmacyitem.SoldQuantity = pharmacyitem.SoldQuantity !== undefined ? pharmacyitem.SoldQuantity : pharmacyitem.Quantity;
                    pharmacyitem.ReturnQuantity = parseInt(pharmacyitem.ReturnQuantity);
                    pharmacyitem.BatchId = pharmacyitem.BatchId;
                    pharmacyitem.ExpiryDate = pharmacyitem.ExpiryDate;
                    pharmacyitem.Rate = pharmacyitem.Rate;
                    pharmacyitem.Amount = pharmacyitem.Amount;
                    pharmacyitem.GrossAmount = pharmacyitem.Amount;
                    pharmacyitem.NetAmount = pharmacyitem.NetAmount;
                    pharmacyitem.GSTId = pharmacyitem.GSTId;
                    pharmacyitem.GSTPercentage = pharmacyitem.GSTPercentage;
                    // pharmacyitem.GSTAmount = pharmacyitem.GSTAmount;
                    // pharmacyitem.UnitGSTAmount = pharmacyitem.UnitGSTAmount;
                    pharmacyitem.TaxCode = pharmacyitem.TaxCode;
                    pharmacyitem.InGstId = pharmacyitem.InGstId;
                    pharmacyitem.InGstPercentage = pharmacyitem.InGstPercentage;
                    pharmacyitem.InGstAmount = pharmacyitem.InGstAmount;
                    pharmacyitem.UnitInGstAmount = pharmacyitem.UnitInGstAmount;
                    pharmacyitem.CGstId = pharmacyitem.CGstId;
                    pharmacyitem.CGstPercentage = pharmacyitem.CGstPercentage;
                    pharmacyitem.CGstAmount = parseFloat((pharmacyitem.NetAmount * pharmacyitem.CGstPercentage) / (100 + pharmacyitem.GSTPercentage)).toFixed(2);
                    pharmacyitem.UnitCGstAmount = parseFloat(pharmacyitem.CGstAmount / pharmacyitem.Quantity).toFixed(2);
                    pharmacyitem.SGstId = pharmacyitem.SGstId;
                    pharmacyitem.SGstPercentage = pharmacyitem.SGstPercentage;
                    pharmacyitem.SGstAmount = parseFloat((pharmacyitem.NetAmount * pharmacyitem.SGstPercentage) / (100 + pharmacyitem.GSTPercentage)).toFixed(2);;
                    pharmacyitem.UnitSGstAmount = parseFloat(pharmacyitem.SGstAmount / pharmacyitem.Quantity).toFixed(2);
                    pharmacyitem.NetAmountBeforeGST = parseFloat(pharmacyitem.NetAmount - (parseFloat(pharmacyitem.CGstAmount) + parseFloat(pharmacyitem.SGstAmount))).toFixed(2);
                    pharmacyitem.GSTAmount = parseFloat(pharmacyitem.CGstAmount) + parseFloat(pharmacyitem.SGstAmount);
                    pharmacyitem.UnitGSTAmount = parseFloat(pharmacyitem.UnitCGstAmount) + parseFloat(pharmacyitem.UnitSGstAmount);
                    pharmacyitem.DiscountModeId = $scope.currentfilter.DiscountModeId;
                    pharmacyitem.IsMultiUse = pharmacyitem.IsMultiUse;
                    pharmacyitem.NoOfTransactions = pharmacyitem.NoOfTransactions;
                    pharmacyitem.TotalTransactions = pharmacyitem.TotalTransactions;
                    pharmacyitem.ConsumedTransactions = pharmacyitem.ConsumedTransactions;
                    pharmacyitem.PendingTransactions = pharmacyitem.PendingTransactions;
                    pharmacyitem.DoctorDiscountAmount = 0;
                    if ($scope.item.PharmacySaleTypeId == 4) {
                        pharmacyitem.DepartmentId = 0;
                    } else {
                        pharmacyitem.DepartmentId = $scope.item.DepartmentId;
                    }

                    result.push(pharmacyitem);
                }
            }
            return result;
        }

        function getpaymentsLinesForSave() {
            var result = [];
            for (var idx in $scope.CustomerRefunds) {
                var item = $scope.CustomerRefunds[idx];
                if (item.ReturnAmount > 0) {
                    result.push(item);
                }
            }
            return result;
        }

        $scope.addPay = function () {
            utl.Modal.open('app.opbilling-form', {
                params: {
                    id: $scope.item.CustomerMasterId
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.amountConversion = function (amount) {
            if (amount !== undefined) {
                return parseFloat(amount).toFixed(2);
            } else {
                return '0.00';
            }
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            if ($scope.currentcontext.id <= 0)
                $scope.currentcontext.id = data;
            $scope.IsNewBill = false;
            // $scope.currentcontext.PaymentTypeId = 1;
            $scope.getReturnInfoByReturnId();
            $scope.getBillInfoByBillId();

            $scope.applyVisibilityRules();

            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.SaveImdDMPrint = 1;
        };

        /* Save or Save&Approve Ends Here */

        function loadData() {
            $scope.applyVisibilityRules();
            $scope.currentfilter.GuarantorTypeId = -1;
        }

        vm.doctorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Doctor Id',
                field: 'DoctorId',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Doctor Name',
                field: 'DoctorName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            {
                header: 'Qualification',
                field: 'Qualification',
                datatype: 'string',
                headercls: 'td-Qualification',
                fieldcls: 'td-Qualification'
            },
            {
                header: 'Speciality',
                field: 'Speciality',
                datatype: 'string',
                headercls: 'td-dept',
                fieldcls: 'td-dept'
            },
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselecteddoctor,
            presearch: presearchdoctor,
            postsearch: postsearchdoctor
        };

        function formatselecteddoctor() {
            var selectedItem = vm.doctorcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.DoctorName].join('  ');
            } else if (vm.doctorcontrolconfig.rowdata) {
                result = [vm.doctorcontrolconfig.rowdata.DoctorId, vm.doctorcontrolconfig.rowdata.DoctorName,
                vm.doctorcontrolconfig.rowdata.Qualification, vm.doctorcontrolconfig.rowdata.Speciality
                ].join(' ');
            }
            $scope.item.DoctorName = result;

            return result;
        }

        function presearchdoctor() {
            var query = vm.doctorcontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: 2
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.doctorcontrolconfig.searchbyid === true) {
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

            vm.doctorcontrolconfig.searchparams = inputData;
        }

        function postsearchdoctor() {
            for (var idx in vm.doctorcontrolconfig.result) {
                var item = vm.doctorcontrolconfig.result[idx];
                item.DoctorId = item.Id;
                item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                item.Speciality = item.Department.DepartmentName;
            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $('#btnsubmit').text("Save (F2)");
            $('#saveAndApproveid').text("Approve (F4)");
            $('#btnprint').text("Print (Alt + P)");
            $('#btndmprint').text("DMPrint (Alt + P)");
            $scope.lookup = hasError ? {} : data;
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.currentfilter.StoreMasterId === 0) {
                    for (var usidx in $scope.lookup.UserStores) {
                        if ($scope.lookup.UserStores[usidx].IsDefault) {
                            $scope.currentfilter.StoreMasterId = $scope.lookup.UserStores[usidx].Id;
                            $scope.currentfilter.StoreTypeId = $scope.lookup.UserStores[usidx].StoreMaster.StoreTypeId;
                            $scope.currentfilter.StoreSubTypeId = $scope.lookup.UserStores[usidx].StoreMaster.StoreSubTypeId;
                            $scope.currentfilter.SequenceOptionId = $scope.lookup.UserStores[usidx].StoreMaster.SequenceOptionId;
                        }
                    }
                    if ($scope.currentfilter.StoreMasterId === 0) {
                        $scope.currentfilter.StoreMasterId = value[0].Id;
                        $scope.currentfilter.StoreTypeId = value[0].StoreMaster.StoreTypeId;
                        $scope.currentfilter.StoreSubTypeId = value[0].StoreMaster.StoreSubTypeId;
                        $scope.currentfilter.SequenceOptionId = value[0].StoreMaster.SequenceOptionId;
                    }
                }
                if (key == 'FacilityPreference') {
                    $scope.item.PreferedRoundOff = value[0].PreferenceValue;
                }
            });

            loadData();
        };

        $scope.initLookup = function () {
            var inputData = [
                // {
                //     "Key": "Department"
                // },
                // {
                //     "Key": "Doctor"
                // },
                {
                    "Key": "DiscountMode"
                },
                {
                    "Key": "DiscountType"
                },
                // {
                //     "Key": "GuarantorType"
                // },
                // {
                //     "Key": "Guarantor",
                //     Request: {
                //         Params: [{
                //             Key: 7,
                //             Value: utl.Session.getCurrentFacilityId()
                //         }]
                //     }
                // },
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
                // {
                //     "Key": "Title"
                // },
                // {
                //     "Key": "Gender"
                // },
                {
                    "Key": "PharmacySaleType"
                },
                // {
                //     "Key": "PrivateDueApprover"
                // },
                {
                    "Key": "UserStores",
                    Request: {
                        Params: [{
                            Key: 1,
                            Value: utl.Session.getCurrentUserId()
                        },
                        {
                            Key: 2,
                            Value: utl.Session.getCurrentFacilityId(),
                        },
                        {
                            Key: 5,
                            Value: 2
                        }
                        ]
                    },
                    Default: false
                },
                {
                    "Key": "FacilityPreference",
                    Request: {
                        Params: [{
                            Key: 0,
                            Value: 76
                        }]
                    },
                    Default: false
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

        /* Pharmacy dotmatrix print starts */

        $scope.dmPrint = function () {
            if ($scope.dmprintpreferences != 1) {
                utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.preferencesetting.lbl'));
                return false;
            } else {
                var inputData = {
                    Id: $scope.currentcontext.id
                };
                var options = {
                    action: 'billing/customerreturns/PrintDMCustomerReturns',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.dmPrintCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.dmPrintCallback = function (scope, data, options, hasError) {
            console.log(data);
            var dmPrintInput = preparePrintData(data);
            $scope.printPharmcyReturn(dmPrintInput);
            if ($scope.FindOldBillFlag != 1)
                $scope.clear();
        };

        function preparePrintData(data) {
            console.log('preparePrintData starts');

            var vIPOPNO = '';
            var vEncounterType = '';
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
            var vStoreheading1 = '';
            var vStoreheading2 = '';
            var vStoreheading3 = '';
            var vStoreheading4 = '';
            var vStorefooter1 = '';
            var vStorefooter2 = '';
            var vStorefooter3 = '';
            var vStorefooter4 = '';
            var vGuarantorName = '';
            var DepartmentName = '';

            if (data.CustomerReturns.Encounter) vIPOPNO = '' + data.CustomerReturns.Encounter.VisitIdentifier;
            if (data.Encounter) vEncounterType = '' + data.Encounter.EncounterType.Description;
            if (data.CustomerReturns.Facility) vGST = '' + data.CustomerReturns.Facility.GstNumber;

            if (data.CustomerReturns.Department) {
                DepartmentName = data.CustomerReturns.Department.DepartmentName;
            }

            if (data.CustomerReturns.User) {
                if (data.CustomerReturns.User.Title) vUTitle = data.CustomerReturns.User.Title.Description;
                if (data.CustomerReturns.User.FirstName) vUFirstName = data.CustomerReturns.User.FirstName;
                if (data.CustomerReturns.User.LastName) vULastName = data.CustomerReturns.User.LastName;
            }
            if (data.CustomerReturns.CreatedUser) {
                if (data.CustomerReturns.CreatedUser.Title) vCTitle = data.CustomerReturns.CreatedUser.Title.Description;
                if (data.CustomerReturns.CreatedUser.FirstName) vCFirstName = data.CustomerReturns.CreatedUser.FirstName;
                if (data.CustomerReturns.CreatedUser.LastName) vCLastName = data.CustomerReturns.CreatedUser.LastName;
            }
            if (data.CustomerReturns.Customer) {
                if (data.CustomerReturns.Customer.Title) vPTitle = data.CustomerReturns.Customer.Title.Description;
                if (data.CustomerReturns.Customer.FirstName) vPFirstName = data.CustomerReturns.Customer.FirstName;
                if (data.CustomerReturns.Customer.LastName) vPLastName = data.CustomerReturns.Customer.LastName;
                if (data.CustomerReturns.Customer.MRN) vMRN = data.CustomerReturns.Customer.MRN;
                if (data.CustomerReturns.Customer.Age) vAge = '' + data.CustomerReturns.Customer.Age;
                if (data.CustomerReturns.Customer.DOB) vDOB = '' + data.CustomerReturns.Customer.DOB;
                if (data.CustomerReturns.Customer.DOB) vFDOB = '' + utl.Formatter.getDateTimeString(data.CustomerReturns.Customer.DOB);
                if (data.CustomerReturns.Customer.Gender) vGender = '' + data.CustomerReturns.Customer.Gender.Description;
            } else {
                vPFirstName = data.CustomerReturns.CustomerName;
            }

            if (data.CustomerReturns.GuarantorName &&
                data.CustomerReturns.GuarantorName != null &&
                data.CustomerReturns.GuarantorName != '' &&
                data.CustomerReturns.GuarantorName != undefined) {
                vGuarantorName = data.CustomerReturns.GuarantorName;
            }

            if (vGuarantorName == null || vGuarantorName == '' || vGuarantorName == undefined) {
                if (data.CustomerReturns.CustomerGuarantor) {
                    if (data.CustomerReturns.CustomerGuarantor.GuarantorName) vGuarantorName = '' + data.CustomerReturns.CustomerGuarantor.GuarantorName;
                }
            }

            if (vGuarantorName == null || vGuarantorName == '' || vGuarantorName == undefined) {
                if (data.CustomerReturns.GuarantorMaster) {
                    if (data.CustomerReturns.GuarantorMaster.GuarantorName) vGuarantorName = '' + data.CustomerReturns.GuarantorMaster.GuarantorName;
                }
            }

            if (data.CustomerReturns.StoreMaster) vTinNo = data.CustomerReturns.StoreMaster.TinNo;

            var vtotalrnd = 0;
            var vtotDiscont = 0;

            var vtotmt = 0;

            if (data.CustomerReturns.RoundOffValue)
                vtotalrnd = data.CustomerReturns.RoundOffValue;

            if (data.CustomerReturns.DiscountAmount)
                vtotDiscont = data.CustomerReturns.DiscountAmount;

            if (data.CustomerReturns.GrossAmount)
                vtotmt = data.CustomerReturns.GrossAmount;

            if (data.PrintData.heading1)
                vStoreheading1 = data.PrintData.heading1
            if (data.PrintData.heading2)
                vStoreheading2 = data.PrintData.heading2
            if (data.PrintData.heading3)
                vStoreheading3 = data.PrintData.heading3
            if (data.PrintData.heading4)
                vStoreheading4 = data.PrintData.heading4
            if (data.PrintData.footer1)
                vStorefooter1 = data.PrintData.footer1
            if (data.PrintData.footer2)
                vStorefooter2 = data.PrintData.footer2
            if (data.PrintData.footer3)
                vStorefooter3 = data.PrintData.footer3
            if (data.PrintData.footer4)
                vStorefooter4 = data.PrintData.footer4

            var vPayTypeId = -1;
            var GrossAmount = 0;
            var TotalGSTAmount = 0;
            var TotalBillAmount = data.CustomerReturns.ReturnAmount;
            var TotalCGSTAmount = data.CustomerReturns.CGstAmount;
            var TotalSGSTAmount = data.CustomerReturns.SGstAmount;
            TotalGSTAmount = TotalCGSTAmount + TotalSGSTAmount;
            GrossAmount = TotalBillAmount - TotalGSTAmount;
            var TotalNoOfItems = data.CustomerReturns.CustomerReturnDetails.length;
            var TotalQuantity = 0;
            var TotalQuantity = 0;
            var TotalGstPercent = 0;
            var TotalCGstPercent = 0;
            var TotalSGstPercent = 0;
            var GSTlistitem = 0;
            var Total28perGstPercent = 0;
            var Total18perGstPercent = 0;
            var Total14perGstPercent = 0;
            var Total12perGstPercent = 0;
            var Total9perGstPercent = 0;
            var Total7perGstPercent = 0;
            var Total6perGstPercent = 0;
            var Total5perGstPercent = 0;
            var Total0perGstPercent = 0;

            var Total28perCGSTAmount = 0;
            var Total18perCGSTAmount = 0;
            var Total14perCGSTAmount = 0;
            var Total12perCGSTAmount = 0;
            var Total9perCGSTAmount = 0;
            var Total7perCGSTAmount = 0;
            var Total6perCGSTAmount = 0;
            var Total5perCGSTAmount = 0;
            var Total0perCGSTAmount = 0;

            var Total28perSGSTAmount = 0;
            var Total18perSGSTAmount = 0;
            var Total14perSGSTAmount = 0;
            var Total12perSGSTAmount = 0;
            var Total9perSGSTAmount = 0;
            var Total7perSGSTAmount = 0;
            var Total6perSGSTAmount = 0;
            var Total5perSGSTAmount = 0;
            var Total0perSGSTAmount = 0;
            for (var idx in data.CustomerReturns.CustomerReturnDetails) {
                var billDetail = data.CustomerReturns.CustomerReturnDetails[idx];
                TotalQuantity = TotalQuantity + billDetail.Quantity;
                TotalGstPercent = TotalGstPercent + billDetail.GSTPercentage;
                if (billDetail.GSTPercentage == 12) {
                    Total12perGstPercent = billDetail.GSTPercentage;
                    Total12perCGSTAmount = Total12perCGSTAmount + billDetail.CGstAmount;
                    Total12perSGSTAmount = Total12perSGSTAmount + billDetail.SGstAmount
                } else if (billDetail.GSTPercentage == 28) {
                    Total28perGstPercent = billDetail.GSTPercentage;
                    Total28perCGSTAmount = Total28perCGSTAmount + billDetail.CGstAmount;
                    Total28perSGSTAmount = Total28perSGSTAmount + billDetail.SGstAmount

                } else if (billDetail.GSTPercentage == 18) {
                    Total18perGstPercent = billDetail.GSTPercentage;
                    Total18perCGSTAmount = Total18perCGSTAmount + billDetail.CGstAmount;
                    Total18perSGSTAmount = Total18perSGSTAmount + billDetail.SGstAmount
                } else if (billDetail.GSTPercentage == 5) {
                    Total5perGstPercent = billDetail.GSTPercentage;
                    Total5perCGSTAmount = Total5perCGSTAmount + billDetail.CGstAmount;
                    Total5perSGSTAmount = Total5perSGSTAmount + billDetail.SGstAmount
                } else if (billDetail.GSTPercentage == 0) {
                    Total0perGstPercent = billDetail.GSTPercentage;
                    Total0perCGSTAmount = Total0perCGSTAmount + billDetail.CGstAmount;
                    Total0perSGSTAmount = Total0perSGSTAmount + billDetail.SGstAmount
                }
                TotalCGstPercent = TotalCGstPercent + billDetail.CGstPercentage;
                TotalSGstPercent = TotalSGstPercent + billDetail.SGstPercentage;
                TotalQuantity = TotalQuantity + billDetail.ReturnQuantity;
            }
            var BillType = vEncounterType + ' SALES RETURN';
            /*
                        if (data.CustomerBills.IsPharmacyBill == true
                            && data.CustomerBills.IsPaidFully == false
                            && data.CustomerBills.OutStandingAmount > 0) {
                            BillType = 'CASH BILL';
                        }
            */
            var BillDate = utl.Formatter.getDateString(data.CustomerReturns.ReturnDateTime);
            var BillDateTime = new Date(data.CustomerReturns.ReturnDateTime);
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

            var SaleDate = utl.Formatter.getDateString(data.CustomerReturns.BillDateTime);
            var SaleDateTime = new Date(data.CustomerReturns.BillDateTime);
            var SaleMinutes = SaleDateTime.getMinutes();
            var SaleHours = SaleDateTime.getHours();
            var SaleMeridiem = 'AM';
            if (SaleHours > 12 || SaleHours == 12) {
                SaleMeridiem = 'PM';
                SaleHours = SaleHours - 12;
            }
            if (SaleHours < 10) {
                SaleHours = '0' + SaleHours;
            }
            if (SaleMinutes < 10) {
                SaleMinutes = '0' + SaleMinutes;
            }
            var SaleTime = SaleHours + ':' + SaleMinutes + ' ' + SaleMeridiem;


            var dmPrintInput = {};
            dmPrintInput.header = {
                prescribedby: (vUTitle + ' ' +
                    vUFirstName + ' ' + vULastName) || '',
                licenseno: '' + data.CustomerReturns.StoreMaster.LicenseNo,
                billno: '' + data.CustomerReturns.ReturnNumber,
                customername: vPTitle + ' ' +
                    vPFirstName + ' ' + vPLastName,
                GstNo: vGST,
                TinNo: vTinNo,
                MRN: vMRN || ' ',
                Age: vAge,
                DOB: vDOB,
                FDOB: vFDOB,
                Gender: vGender,
                IPOPNO: vIPOPNO,
                GuarantorName: vGuarantorName,
                billdate: utl.Formatter.getDateTimeString(data.CustomerReturns.ReturnDateTime),
                totalamount: vtotmt,
                totDiscont: vtotDiscont,
                totroundoff: vtotalrnd,
                totpaidamt: 0,
                billedby: vCTitle + ' ' + vCFirstName + ' ' + vCLastName,
                paytypeid: vPayTypeId || -1,
                vStoreheading1: vStoreheading1,
                vStoreheading2: vStoreheading2,
                vStoreheading3: vStoreheading3,
                vStoreheading4: vStoreheading4,
                vStorefooter1: vStorefooter1,
                vStorefooter2: vStorefooter2,
                vStorefooter3: vStorefooter3,
                vStorefooter4: vStorefooter4,
                GrossAmount: GrossAmount,
                TotalCGSTAmount: TotalCGSTAmount,
                TotalSGSTAmount: TotalSGSTAmount,
                TotalGSTAmount: TotalGSTAmount,
                TotalNoOfItems: TotalNoOfItems,
                TotalQuantity: TotalQuantity,
                BillType: BillType,
                BillDate: BillDate,
                BillTime: BillTime,
                TotalQuantity: TotalQuantity,
                TotalGstPercent: TotalGstPercent,
                TotalCGstPercent: TotalCGstPercent,
                TotalSGstPercent: TotalSGstPercent,
                BillType: BillType,
                BillDate: BillDate,
                BillTime: BillTime,
                Total12perGstPercent: Total12perGstPercent,
                Total12perCGSTAmount: Total12perCGSTAmount,
                Total12perSGSTAmount: Total12perSGSTAmount,
                Total28perGstPercent: Total28perGstPercent,
                Total28perCGSTAmount: Total28perCGSTAmount,
                Total28perSGSTAmount: Total28perSGSTAmount,
                Total18perGstPercent: Total18perGstPercent,
                Total18perCGSTAmount: Total18perCGSTAmount,
                Total18perSGSTAmount: Total18perSGSTAmount,
                Total5perGstPercent: Total5perGstPercent,
                Total5perCGSTAmount: Total5perCGSTAmount,
                Total5perSGSTAmount: Total5perSGSTAmount,
                Total0perGstPercent: Total0perGstPercent,
                Total0perCGSTAmount: Total0perCGSTAmount,
                Total0perSGSTAmount: Total0perSGSTAmount,
                SaleNumber: data.CustomerReturns.BillNumber,
                SaleDate: SaleDate,
                SaleTime: SaleTime,
                DepartmentName: DepartmentName
            };

            dmPrintInput.lines = [];
            var islno = 1;
            var GSTPercentages = Array();
            for (var idx in data.CustomerReturns.CustomerReturnDetails) {
                var billDetail = data.CustomerReturns.CustomerReturnDetails[idx];
                var expiryDate = billDetail.ExpiryDate ? utl.Formatter.formatDate(billDetail.ExpiryDate, 'MM/YY') : '';
                var manu = billDetail.ManufacturerName;
                if (manu && manu.length > 3) {
                    manu = manu.substring(0, 3);
                }

                var batchid = billDetail.BatchId;
                if (batchid && batchid.length > 6) {
                    batchid = batchid.substring(0, 6);
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

                var DetailDiscountPercentage = billDetail.DiscountPercentage.toFixed(1);

                var Location = '';
                if (billDetail.RackName &&
                    billDetail.RackName != null &&
                    billDetail.RackName != '' &&
                    billDetail.RackName != undefined) {
                    Location = Location + billDetail.RackName;
                }

                if (billDetail.Shelf &&
                    billDetail.Shelf != null &&
                    billDetail.Shelf != '' &&
                    billDetail.Shelf != undefined) {
                    Location = Location + '/' + billDetail.Shelf;
                }

                if (billDetail.Tray &&
                    billDetail.Tray != null &&
                    billDetail.Tray != '' &&
                    billDetail.Tray != undefined) {
                    Location = Location + '/' + billDetail.Tray;
                }

                GSTPercentages.push(billDetail.GSTPercentage);

                var detail = {
                    ispace: ' ',
                    slno: islno++,
                    desc: billDetail.ItemName,
                    hsn: vHSN,
                    sch: vSCH,
                    batch: batchid,
                    exp: expiryDate,
                    qty: billDetail.ReturnQuantity,
                    mrp: billDetail.Rate.toFixed(2),
                    value: billDetail.NetAmountBeforeGST.toFixed(2),
                    cgstper: billDetail.CGstPercentage,
                    cgstamt: cgstamt,
                    sgstper: billDetail.SGstPercentage,
                    sgstamt: sgstamt,
                    totgst: (billDetail.CGstAmount + billDetail.SGstAmount),
                    amount: billDetail.Amount.toFixed(2),
                    mfr: manu,
                    netamount: billDetail.NetAmount.toFixed(2),
                    DetailDiscountPercentage: DetailDiscountPercentage,
                    gstamt: billDetail.GSTAmount,
                    gstper: billDetail.GSTPercentage,

                    beforegst: billDetail.NetAmountBeforeGST,
                    loc: billDetail.LocationId,
                    cgstper: billDetail.CGstPercentage,
                    cgstamt: cgstamt,
                    sgstper: billDetail.SGstPercentage,
                    sgstamt: sgstamt,
                    totgst: (billDetail.CGstAmount + billDetail.SGstAmount),
                    //totbfrgst: (),
                    amount: billDetail.Amount.toFixed(2),
                    vLocation: Location
                };

                dmPrintInput.lines.push(detail);
            }

            dmPrintInput.GSTDetails = [];
            let UniqueGSTPercentages = []
            for (let i = 0; i < GSTPercentages.length; i++) {
                if (UniqueGSTPercentages.indexOf(GSTPercentages[i]) == -1) {
                    UniqueGSTPercentages.push(GSTPercentages[i])
                }
            }

            for (var index in UniqueGSTPercentages) {
                var IndividualGSTPercentage = UniqueGSTPercentages[index];
                var IndividualGSTAmount = 0;
                var IndividualSGSTAmount = 0;
                var IndividualCGSTAmount = 0;
                for (var index1 in data.CustomerReturns.CustomerReturnDetails) {
                    var BillDetails = data.CustomerReturns.CustomerReturnDetails[index1];
                    if (IndividualGSTPercentage == BillDetails.GSTPercentage) {
                        IndividualGSTAmount = IndividualGSTAmount + BillDetails.GSTAmount;
                        IndividualSGSTAmount = IndividualSGSTAmount + BillDetails.SGstAmount;
                        IndividualCGSTAmount = IndividualCGSTAmount + BillDetails.CGstAmount;
                    }
                }
                var GSTDetail = {
                    space: ' ',
                    IndividualGSTPercentage: IndividualGSTPercentage,
                    IndividualGSTAmount: IndividualGSTAmount.toFixed(2),
                    IndividualSGSTAmount: IndividualSGSTAmount.toFixed(2),
                    IndividualCGSTAmount: IndividualCGSTAmount.toFixed(2)
                };
                dmPrintInput.GSTDetails.push(GSTDetail);
            }

            console.log('preparePrintData ends');
            return dmPrintInput;
        }

        /* Pharmacy dotmatrix print ends */

        $scope.moveHeaderFocus = function (nextId) {
            if (event.keyCode == 13) {
                if (nextId == "pid") {
                    nextId = "qty0";
                    $('#' + nextId).focus();
                }
            }
        };

        $scope.startinterval = null;

        $scope.moveFocus = function (nextId, prevId, downId, upId, index, event, item) {
            if (event.keyCode == 39) { // right
            } else if (event.keyCode == 37) { // left
            } else if (event.keyCode == 38) { // Up
                upId = upId + (index - 1);
                $('#' + upId).focus();
            } else if (event.keyCode == 40) { // Down
                downId = downId + (index + 1);
                $('#' + downId).focus();
            }
            if (event.keyCode == 13) {
                if (nextId == 'qty') {
                    $scope.ValidQty(downId + index);
                    var idx = $scope.CustomerReturnDetails.length - 1;
                    nextId = "qty" + '' + idx;
                    if (idx == (index)) {
                        var paytypedom = document.getElementById('paymenttype');
                        $scope.setCmbFocus(paytypedom);
                    } else {
                        index++;
                        nextId = "qty" + '' + index;
                        $('#' + nextId).select();
                        $('#' + nextId).focus();
                    }
                }
            }
            if (event.keyCode == 9) {
                if (nextId == 'desc') {
                    $scope.ValidQty(downId + index);
                }
            }
            if (event.key == "Delete" && event.keyCode == 46) {

            }
        };

        $scope.ValidQty = function (nextId) {
            if ($('#' + nextId).val() == '')
                $('#' + nextId).val(0);
        };

        $scope.setCmbFocus = function (dom) {
            $scope.startinterval = $interval(function () {
                $scope.callCmbFocus(dom);
            }, 10);
        };

        $scope.callCmbFocus = function (dom) {
            var uiSelect = angular.element(dom);
            var uichild = uiSelect.controller('uiSelect');
            uichild.focusser[0].focus();
            uichild.activate();
            $interval.cancel($scope.startinterval);
        };

        $scope.FooterFocus = function (nextId) {
            if (event.keyCode == 13) {
                if (nextId == "paymenttype") {
                    nextId = "saveAndApproveid";
                    $('#' + nextId).focus();
                }
            }
            if (event.keyCode == 39) { //right
                if (nextId == "btnsubmit") {
                    nextId = "saveAndApproveid";
                    $('#' + nextId).focus();
                }
            }
            if (event.keyCode == 37) { //left
                if (nextId == "saveAndApproveid") {
                    nextId = "btnsubmit";
                    $('#' + nextId).focus();
                }
            }
        };

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.getStorePrintPreferenceCallback = function (scope, data, options, hasError) {
            if (data) {
                if (data.PrinterOptionId == 1) {
                    $scope.printpreferences = 1;
                    $scope.dmprintpreferences = 0;
                } else if (data.PrinterOptionId == 2) {
                    $scope.dmprintpreferences = 1;
                    $scope.printpreferences = 0;
                }
                if ($scope.dmprintpreferences <= 0) $('#btndmprint').hide();
                else $('#btndmprint').show();

                if ($scope.printpreferences <= 0) $('#btnprint').hide();
                else $('#btnprint').show();

                if (data.ISSeparatePayCounter) $scope.separatePaymentCounter = 1;
                else $scope.separatePaymentCounter = 0;
                // $scope.IsSeparatePharmacyCounter();
            }
        };

        $scope.getStorePrintPreference = function () {
            var storemasterid = $scope.currentfilter.StoreMasterId;
            if (storemasterid > 0) {
                var options = {
                    action: 'pharmacy/storemaster/GetStoreMasterById',
                    data: {
                        Id: storemasterid
                    },
                    type: 'post',
                    onComplete: $scope.getStorePrintPreferenceCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getPharmacyPrintPreference = function () {
            $scope.dmprintpreferences =
                utl.FacilitySetting.getFacilitySettingValue('dmprint', 'pharmacydmprintenable');

            $scope.printpreferences =
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

        /* Pharmacy  Return - Shortcut Keys - Start */
        function keyupHandler(e) {
            var kCode = e.keyCode;
            if (kCode == 113 && savehitcompleted == 0 && $scope.canShowSaveBtn) { // F2  - SaveDraft
                $scope.saveDraft();
            }
            if (kCode == 115 && savehitcompleted == 0 && $scope.canShowSaveapproveBtn) { // F2  - SaveAndApprove
                $scope.saveAndApprove();
            }
            if (kCode == 118) { // F7  - New Page
                $scope.clear();
            }
            if (kCode == 119 && $scope.IsNewBill) { // F8  - Find Bills
                $scope.findBill();
            }
            if (kCode == 120) { // F8  - Find Return Bills
                $scope.findReturn();
            }
            if (e.altKey && kCode == 83 && savehitcompleted == 0 && $scope.canShowSaveBtn) { // alt + s  - SaveDraft
                $scope.saveDraft();
            }
            if (e.altKey && kCode == 65 && savehitcompleted == 0 && $scope.canShowSaveapproveBtn) { // alt + s  - SaveAndApprove
                $scope.saveAndApprove();
            }
            if (e.altKey && kCode == 80) { // alt + p  - DMPrint
                if ($scope.dmprintpreferences > 0) {
                    $scope.dmPrint();
                } else {
                    $scope.print();
                }
            }
        }

        angular.element(document).on('keydown', keyupHandler);

        $scope.$on('$destroy', function () {
            angular.element(document).off('keydown', keyupHandler);
        });
        /* Pharmacy  Return - Shortcut Keys - End */
    }

    customerreturnController.$inject = ['$rootScope', '$scope', '$interval', '$stateParams', '$state', '$translate', 'utl', '$filter', '$timeout'];

})();