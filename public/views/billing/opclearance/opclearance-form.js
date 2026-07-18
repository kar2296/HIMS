(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('OPclearanceFormController', OPclearanceFormController);

    function OPclearanceFormController($rootScope, $timeout,
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
        $scope.IsPharmacy = false;

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
            InsuranceAmount: 0.00
        };

        $scope.SelectAll = function (chk) {
            for (var idx in $scope.PatientPharmacyBills) {
                $scope.PatientPharmacyBills[idx].select = chk;
            }
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

        $scope.pay_pharmacybills = function () {
            var getbills = getSelectionRows();
            var returnbills = getSelectionRowsForReturn();
            // console.log($scope.item);
            // console.log(returnbills);
            console.log(getbills); //return;
            var adjustments = [];
            adjustments = $scope.PaymentAdjustmentDetails;
            if(!adjustments)
            {
                utl.Alert.showErrorMsg($translate.instant('Please do the Adjustments'));
                return false;
            }

            if(adjustments && adjustments.length == 0)
            {
                utl.Alert.showErrorMsg($translate.instant('Please do the Adjustments'));
                return false;
            }
            console.log(adjustments); //return;
            var actionName = 'billing/PatientBills/ConsolidatePayment';
            var options = {
                action: actionName,
                data: {
                    Data: {
                        PaymentDetail: $scope.item,
                        Bills: getbills,
                        ReturnBills: returnbills,
                        adjustmentDetail: adjustments
                    }
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
                else if(AdjAmount == $scope.currentcontext.TotBalanceAmt)
                {
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
            $scope.PatientBillsWithReturn = data;
            // $scope.currentfilter.TotalAmount = 0;
            // $scope.currentfilter.TotalSalesAmount = 0;
            // $scope.currentfilter.TotalReturnAmount = 0;
            // $scope.currentfilter.TotalRefundAmount = 0;
            // $scope.currentfilter.TotalOutStandingAmount = 0;
            // $scope.currentfilter.TotalGrossAmount = 0;
            // $scope.currentfilter.TotalPatientAmount = 0;
            // $scope.currentfilter.TotalPaidAmount = 0;
            // $scope.currentfilter.TotalInsuranceAmount = 0;
            // $scope.currentfilter.TotalDiscountAmount = 0;
            //$scope.currentfilter.TotalDueAmount = 0;
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
                    if(item.IsReturnUsed == 0)
                    {
                        $scope.currentfilter.TotalReturnAmount = $scope.currentfilter.TotalReturnAmount + item.NetReturnAmount;
                        item.select1 = true;
                        item.IsReturnUsed = 1;
                    }
                    $scope.currentfilter.TotalRefundAmount = $scope.currentfilter.TotalRefundAmount + item.NetReturnAmount;
                    $scope.PatientPharmacyReturns.push(item);
                    $scope.ReturnSerialNo++;
                } else if (item.PharmacyReturnTypeId != 6) {
                    if($scope.IsPharmacy == true) {
                    item.SalesSerialNo = $scope.SalesSerialNo + 1;
                    item.NetAmount = item.BillAmount - item.BillDiscount;
                    // if (item.BillTypeId != 3) {
                    //     item.NetAmount = Math.round(item.NetAmount);
                    // }
                    if (!item.BillDiscount) {
                        item.BillDiscount = 0;
                    }




                    if (item.PharmacySaleTypeId == 6) {
                        if (!item.PaidAmount) {
                            item.PaidAmount = 0;
                        }
                        //item.DueAmount = item.NetPatientAmount - item.PaidAmount;
                        //item.BillAmount = item.BillAmount + item.NetInsuranceAmount;
                    } else {
                        if (!item.PaidAmount) {
                            item.PaidAmount = 0;
                        }
                        item.DueAmount = item.NetAmount - item.PaidAmount;
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
                    }

                    //$scope.currentfilter.TotalPatientAmount = $scope.currentfilter.TotalPatientAmount + item.NetPatientAmount;
                    //$scope.currentfilter.TotalInsuranceAmount = item.NetInsuranceAmount + $scope.currentfilter.TotalInsuranceAmount;
                }
                }
            }

            if ($scope.currentfilter.TotalDueAmount) {
                $scope.currentfilter.TotalDueAmount = parseFloat($scope.currentfilter.TotalDueAmount) - parseFloat($scope.currentfilter.TotalReturnAmount);
            }

            $scope.currentfilter.TotalDueAmount = parseFloat($scope.currentfilter.TotalDueAmount).toFixed(2);
            $scope.currentcontext.ReceiptAmt = $scope.currentfilter.TotalDueAmount;
            $scope.currentcontext.TotBalanceAmt = $scope.currentfilter.TotalDueAmount;
            // $scope.SelectAll($scope.currentcontext.selectallchk);
            // $scope.SelectAll1($scope.currentcontext.selectallchk1);
            //$scope.canShowDMPrintBtn = true;


            // if ($scope.item.GuarantorTypeId > 1 W) {
            //     $scope.item.PaidAmount = parseFloat($scope.currentcontext.TotalReceiptAmount) - parseFloat($scope.currentcontext.TotalRefundAmount);ZZ
            // }
            $scope.currentfilter.TotalAmount = $scope.currentfilter.TotalSalesAmount - $scope.currentfilter.TotalReturnAmount;
        };
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
                    action: 'billing/PatientBills/getPharmacyBillsWithReturn',
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

        function selectionChangedCal(row) {
            var item = row.entity;
            if (row.isSelected) {
                $scope.item.OutStandingAmt = parseFloat($scope.item.OutStandingAmt) + parseFloat(item.OutStandingAmount);
                $scope.item.Discount = parseFloat($scope.item.Discount) + parseFloat(item.BillDiscount);
                $scope.item.BillAmount = parseFloat($scope.item.BillAmount) + parseFloat(item.BillAmount);
                var amt = parseFloat($scope.item.Received) + parseFloat(item.PaidAmount);
                $scope.item.Received = eval(amt).toFixed(2);
            } else {
                $scope.item.OutStandingAmt = parseFloat($scope.item.OutStandingAmt) - parseFloat(item.OutStandingAmount);
                $scope.item.Discount = parseFloat($scope.item.Discount) - parseFloat(item.BillDiscount);
                $scope.item.BillAmount = parseFloat($scope.item.BillAmount) - parseFloat(item.BillAmount);
                var amt = parseFloat($scope.item.Received) - parseFloat(item.PaidAmount);
                $scope.item.Received = eval(amt).toFixed(2);
            }
        }

        $scope.getopBillsCallback = function (scope, data, options, hasError) {
            $scope.SalesSerialNo = 0;
            $scope.ReturnSerialNo = 0;
            $scope.PatientBills = [];
            $scope.PatientReturns = [];
            $scope.PatientBillsWithReturn = data.Data;
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
                    if(item.IsReturnUsed == 0)
                    {
                        $scope.currentfilter.TotalReturnAmount = $scope.currentfilter.TotalReturnAmount + item.NetReturnAmount;
                        item.select1 = true;
                        item.IsReturnUsed = 1;
                    }
                    $scope.currentfilter.TotalRefundAmount = $scope.currentfilter.TotalRefundAmount + item.NetReturnAmount;
                    $scope.PatientReturns.push(item);
                    $scope.ReturnSerialNo++;
                } else {
                    item.SalesSerialNo = $scope.SalesSerialNo + 1;
                    item.NetAmount = item.BillAmount - item.BillDiscount;
                    // if (item.BillTypeId != 3) {
                    //     item.NetAmount = Math.round(item.NetAmount);
                    // }
                    if (!item.BillDiscount) {
                        item.BillDiscount = 0;
                    }

                        if (!item.PaidAmount) {
                            item.PaidAmount = 0;
                        }
                        item.DueAmount = item.NetAmount - item.PaidAmount;
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
                        $scope.PatientBills.push(item);
                        $scope.SalesSerialNo++;


                    //$scope.currentfilter.TotalPatientAmount = $scope.currentfilter.TotalPatientAmount + item.NetPatientAmount;
                    //$scope.currentfilter.TotalInsuranceAmount = item.NetInsuranceAmount + $scope.currentfilter.TotalInsuranceAmount;

                }
            }

            if ($scope.currentfilter.TotalDueAmount) {
                $scope.currentfilter.TotalDueAmount = parseFloat($scope.currentfilter.TotalDueAmount) - parseFloat($scope.currentfilter.TotalReturnAmount);
            }

            $scope.currentfilter.TotalDueAmount = parseFloat($scope.currentfilter.TotalDueAmount).toFixed(2);
            $scope.currentcontext.ReceiptAmt = $scope.currentfilter.TotalDueAmount;
            $scope.currentcontext.TotBalanceAmt = $scope.currentfilter.TotalDueAmount;
            // $scope.SelectAll($scope.currentcontext.selectallchk);
            // $scope.SelectAll1($scope.currentcontext.selectallchk1);
            //$scope.canShowDMPrintBtn = true;


            // if ($scope.item.GuarantorTypeId > 1 W) {
            //     $scope.item.PaidAmount = parseFloat($scope.currentcontext.TotalReceiptAmount) - parseFloat($scope.currentcontext.TotalRefundAmount);ZZ
            // }
            $scope.currentfilter.TotalAmount = $scope.currentfilter.TotalSalesAmount - $scope.currentfilter.TotalReturnAmount;
            $scope.getPharmacyBills();
            // if($scope.IsPharmacy == true) {
            //     $scope.getPharmacyBills();
            // }

        };
        $scope.getopBills = function() {
            if ($scope.currentfilter.PatientId > 0) {
                var FromDate = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd 00:00:00') || null;
                var ToDate = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd 23:59:59') || null;

                var inputData = {
                    Params: [{
                            Key: 12,
                            Value: $scope.currentfilter.PatientId
                        },
                        {
                            Key: 4,
                            Value: 3
                        },
                        {
                            Key: 20,
                            Value: [1, 5]
                        },
                        {
                            Key: 8,
                            Value: utl.Session.getCurrentFacilityId()
                        },
                        // {
                        //     Key: 17,
                        //     Value: FromDate
                        // },
                        // {
                        //     Key: 18,
                        //     Value: ToDate
                        // }
                    ],

                };

                var options = {
                    action: 'billing/PatientBills/GetPatientBills',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getopBillsCallback
                };

                utl.Http.doAction(options);
            } else {
                utl.Alert.showSuccessMsg('Successful');
            }
        };

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
            if($scope.selectedPatient.Encounters.length > 0) {
                $scope.currentcontext.EncounterId = $scope.selectedPatient.Encounters[0].Id;
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
        // For Displaying Created User - Start
        $scope.getEncounterCallback = function (scope, res, options, hasError) {
            $scope.Encounter = res.Data[0];
            $scope.items = $scope.Encounter;
            console.log($scope.Encounter);
            $scope.items.DOA = $scope.Encounter.AdmissionDate;
            // if ($scope.Encounter.IsPharmacyClearance == true) {
            //     $scope.canShowDMPrintBtn = true;
            //     $scope.ShowPrintBtn = 1;
            // }
            $scope.getopBills();
            // $scope.getPharmacyBills();
            // if ($scope.maxadvancecash == 1) {
            //     $scope.getPrevAdvances();
            // }
            $scope.getAvailableAmount();
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
                    "Key": "Bank"
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

    OPclearanceFormController.$inject = ['$rootScope', '$timeout', '$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();