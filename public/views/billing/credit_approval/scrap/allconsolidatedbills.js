(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('allconsolidatedbillsController', allconsolidatedbillsController);

    function allconsolidatedbillsController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        angular.extend(this, utl.Ctrl.getDMPrintDataController({
            $scope: $scope
        }));

        if ($stateParams.pid)
            $scope.currentcontext.pid = $stateParams.pid;
        else
            // $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());

        $scope.dmprintpreferences = 0;
        $scope.printpreferences = 1;
        $scope.currentcontext = {};
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
        $scope.currentcontext.FSTypeId = 1;
        $scope.canShowDMPrintBtn = false;
        $scope.currentfilter = {
            // FromBillDate: utl.Formatter.getCurrentDate(),
            // ToBillDate: utl.Formatter.getCurrentDate(),
            DueApprovedById: -1,
            TotalAmount: 0,
            TotalDueAmount: 0
        };
        $scope.ShowHeaderDisc = true;
        $scope.currentfilter.FromBillDate = $filter('date')(new Date(), 'yyyy-MM-dd 00:00:00');
        $scope.currentfilter.ToBillDate = $filter('date')(new Date(), 'yyyy-MM-dd 23:59:59');
        $scope.Details = [];
        $scope.OPPatientBills = [];
        $scope.PatallBills = [];
        var PatientBillIds = Array();
        $scope.currentcontext.selectallchk = true;
        $scope.item1 = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            OrganizationId: utl.Session.getCurrentOrgId(),
            Id: 0,
            BillTypeId: 1,
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

            PatientName: '',
            PatientMrn: '',
            // PatientTypeId: $scope.item.PatientTypeId,
            // OTIdentifier: { type: DataTypes.STRING, field: 'OTIdentifier' },
            PatientId: '',
            EncounterId: '',
            EncounterTypeId: 2,

            DoctorId: '',
            DoctorName: '',

            PatientBillStatusId: 3,
            // CreditVocher: { type: DataTypes.DECIMAL, field: 'CreditVocher' },
            // ToBeRefunded: { type: DataTypes.DECIMAL, field: 'ToBeRefunded' },
            // RefundAmount: { type: DataTypes.DECIMAL, field: 'RefundAmount' },
            FSTypeId: $scope.item.SettlementTypeId,

            IsConsolidatePay: 1,
            // ChecklistStatusId: { type: DataTypes.INTEGER, field: 'ChecklistStatusId' },
            PharmacySaleTypeId: 3,

            Status: 1,

            NetPatientAmount: 0,
            NetInsuranceAmount: 0,
            StoreMasterId: 0,
            IsPharmacyBill: 1

        };

        $scope.SelectAll = function (chk) {
            // for (var idx in $scope.PatientOPBills) {
            //     $scope.PatientOPBills[idx].select = chk;
            // }
            for (var idx in $scope.PatallBills) {
                $scope.PatallBills[idx].select = chk;
            }
        };
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
            // $scope.getPharmacyBills();
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
        $scope.getPatientInfo = function (scope, data, options, hasError) {
            $scope.selectedPatient = data;
            $scope.$parent.currentcontext.pid = $scope.currentfilter.PatientId;
            $scope.currentcontext.pid = $scope.currentfilter.PatientId;
            $scope.currentcontext.eid = $scope.selectedPatient.EncounterId
            // $scope.currentcontext.pid = $scope.currentfilter.PatientId;
            // utl.Session.setEMRPatientId($scope.currentfilter.PatientId);
            if ($scope.selectedPatient.Encounters.length > 0) {
                $scope.currentcontext.EncounterId = $scope.selectedPatient.Encounters[0].Id;
                $scope.item1.EncounterId = $scope.currentcontext.EncounterId;
                $scope.getEncounters();
            }
        };

        $scope.patientChange = function () {
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
        };
        $scope.BillDiscountModechange = function (selecteditem) {
            if ($scope.currentcontext.BillDiscount && parseFloat($scope.currentcontext.BillDiscount) > 0) {
                $scope.HeaderDiscountValueChange();
            }
        }

        $scope.HeaderDiscountValueChange = function () {
            if ($scope.currentcontext.BillDiscount && parseFloat($scope.currentcontext.BillDiscount) > 0) {
                $scope.currentcontext.BillDiscount = parseFloat($scope.currentcontext.BillDiscount);
            } else if ($scope.currentcontext.BillDiscount == '') {
                $scope.currentcontext.BillDiscount = 0;
            }
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
                $scope.currentfilter.TotalDiscountAmount = $scope.item1.BillDiscount;
                // $scope.updateReceiptAmt();
            } else {
                utl.Alert.showErrorMsg($translate.instant('billing.opbilling-list.discounttypemessage.lbl'));
                $scope.currentcontext.BillDiscount = 0;
            }

        };
        $scope.saveOpBillCallback = function (scope, data, options, hasError) {

            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getEncounters();

        };

        $scope.pay_opconsolidatedbills = function () {
            var getbills = getSelectionRows();
            var returnbills = {};
            // var returnbills = getSelectionRowsForReturn();
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
            $scope.item1.PatientId = $scope.currentfilter.PatientId;
            $scope.item1.FSTypeId = $scope.currentcontext.FSTypeId;
            $scope.item1.PaidAmount = $scope.currentcontext.ReceiptAmt;
            $scope.item1.BillAmount = $scope.item1.PaidAmount;
            $scope.item1.BillDiscountModeId = $scope.currentfilter.DiscountModeId;
            console.log($scope.item);
            console.log($scope.item1);
            // console.log(adjustments);
            // if ($scope.currentcontext.ReceiptAmt < $scope.currentfilter.TotalDueAmount) {
            //     utl.Alert.showErrorMsg('Receipt Amount should not be less than TotalDueAmount'); return;
            // }

            if ($scope.currentcontext.ReceiptAmt > $scope.currentfilter.TotalDueAmount) {
                utl.Alert.showErrorMsg('Receipt Amount should not be greater than TotalDueAmount'); return;
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
                onComplete: $scope.saveOpBillCallback
            };
            utl.Http.doAction(options);
        };

        $scope.calculateTotalDue = function () {
            $scope.currentfilter.TotalSalesAmount = 0;
            $scope.currentfilter.TotalGrossAmount = 0;
            $scope.currentfilter.TotalDiscountAmount = 0;
            $scope.currentfilter.TotalOutStandingAmount = 0;
            $scope.currentfilter.TotalDueAmount = 0;
            $scope.currentfilter.TotalPaidAmount = 0;
            for (var i = 0; i < $scope.PatallBills.length; i++) {
                var item = $scope.PatallBills[i];
                if (item.select == true) {
                    item.DueAmount = (parseFloat(item.BillAmount) - parseFloat(item.ReturnedAmount)) - (parseFloat(item.PaidAmount) - parseFloat(item.RefundAmount));
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
                // $scope.currentfilter.TotalDueAmount = $scope.currentfilter.TotalDueAmount - $scope.currentfilter.TotalReturnAmount;
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
            // $scope.item.TotalDueAmount = $scope.currentfilter.TotalDueAmount;
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

        $scope.getopBillsCallback = function (scope, data, options, hasError) {
            //             $scope.PatallBills = [];
            for (var pdx in data.Data) {
                var item = data.Data[pdx];
                item.NetAmount = item.BillAmount - item.BillDiscount;
                item.NetAmount = Math.round(item.NetAmount);
                $scope.PatallBills.push(item);
            }

            $scope.SelectAll($scope.currentcontext.selectallchk);
            $scope.canShowDMPrintBtn = true;
            $scope.currentfilter.TotalAmount = $scope.currentfilter.TotalSalesAmount - $scope.currentfilter.TotalReturnAmount;
            // $scope.getPharmacyBills();
            $scope.calculateTotalDue();
        };

        $scope.getopBills = function () {
            if ($scope.currentfilter.PatientId > 0) {
                // var FromDate = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd 00:00:00') || null;
                // var ToDate = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd 23:59:59') || null;

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
                        Value: [1, 4, 5]
                    },
                    {
                        Key: 8,
                        Value: utl.Session.getCurrentFacilityId()
                    },
                    {
                        Key: 17,
                        Value: $scope.currentfilter.FromBillDate
                    },
                    {
                        Key: 18,
                        Value: $scope.currentfilter.ToBillDate
                    },
                    {
                        Key: 11,
                        Value: true
                    }
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
                utl.Alert.showErrorMsg('Please Select Patient');
            }
        };

        $scope.getPharmacyBillsCallback = function (scope, data, options, hasError) {
            $scope.SalesSerialNo = 0;
            $scope.ReturnSerialNo = 0;
            //             $scope.PatallBills = [];
            $scope.PatientPharmacyReturns = [];
            $scope.PatientBillsWithReturn = data;
            $scope.currentfilter.TotalAmount = 0;
            $scope.currentfilter.TotalSalesAmount = 0;
            $scope.currentfilter.TotalReturnAmount = 0;
            for (var i = 0; i < $scope.PatientBillsWithReturn.length; i++) {
                var item = $scope.PatientBillsWithReturn[i];
                if (item.ReturnNumber && item.ReturnNumber != undefined &&
                    item.ReturnNumber != null && item.ReturnNumber != '') {
                    item.ReturnSerialNo = $scope.ReturnSerialNo + 1;
                    if (item.ReturnAmount == 0 && item.GrossAmount > 0) {
                        item.ReturnAmount = item.GrossAmount;
                    }
                    item.NetReturnAmount = item.ReturnAmount - item.DiscountAmount;
                    item.NetReturnAmount = Math.round(item.NetReturnAmount);
                    $scope.currentfilter.TotalReturnAmount = $scope.currentfilter.TotalReturnAmount + item.NetReturnAmount;
                    $scope.PatientPharmacyReturns.push(item);
                    $scope.ReturnSerialNo++;
                } else {
                    item.SalesSerialNo = $scope.SalesSerialNo + 1;
                    item.NetAmount = item.BillAmount - item.BillDiscount;
                    item.NetAmount = Math.round(item.NetAmount);
                    $scope.currentfilter.TotalSalesAmount = $scope.currentfilter.TotalSalesAmount + item.NetAmount;
                    $scope.PatallBills.push(item);
                    $scope.SalesSerialNo++;
                }
            }
            $scope.SelectAll($scope.currentcontext.selectallchk);
            //             $scope.SelectAll1($scope.currentcontext.selectallchk1);
            $scope.canShowDMPrintBtn = true;
            $scope.currentfilter.TotalAmount = $scope.currentfilter.TotalSalesAmount - $scope.currentfilter.TotalReturnAmount;
            $scope.calculateTotalDue();
        };

        $scope.getPharmacyBills = function () {
            if ($scope.currentfilter.PatientId > 0) {
                // var FromDate = $filter('date')($scope.currentfilter.FromBillDate, 'yyyy-MM-dd 00:00:00') || null;
                // var ToDate = $filter('date')($scope.currentfilter.ToBillDate, 'yyyy-MM-dd 23:59:59') || null;

                var inputData = {
                    Data: {
                        PatientId: $scope.currentfilter.PatientId,
                        PharmacySaleTypeId: $scope.currentfilter.PharmacySaleTypeId,
                        DueApprovedById: $scope.currentfilter.DueApprovedById,
                        FromDate: $scope.currentfilter.FromBillDate,
                        ToDate: $scope.currentfilter.ToBillDate,
                        IsOutStanding: $scope.currentfilter.IsOutStanding,
                        NotOutStanding: $scope.currentfilter.NotOutStanding
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
                utl.Alert.showSuccessMsg('Successful');
            }
        };
        function getNatural(num) {
            return parseFloat(num.toString().split(".")[0]);
        }

        function getDecimal(num) {
            return parseFloat(num.toString().split(".")[1]);
        }

        $scope.loadallbills = function () {
            $scope.PatallBills = [];
            $scope.getopBills();
            // $scope.getPharmacyBills();
        }
        function getSelectionRows() {
            var currentSelection = [];
            for (var idx in $scope.PatallBills) {
                if ($scope.PatallBills[idx].select) {
                    currentSelection.push($scope.PatallBills[idx]);
                }
            }
            return currentSelection;
        }


        $scope.Print = function () {
            $scope.Details = getSelectionRows();
            var ids = [];
            for (var idx in $scope.Details) {
                var currentBill = $scope.Details[idx];
                ids.push(currentBill.Id);
            }
            if (ids.length > 0) {
                var actionName = 'billing/patientbills/PrintConsolidatedallbilldetails';
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
        };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "PharmacySaleType"
            },
            // {
            //     "Key": "PrivateDueApprover"
            // },
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

    allconsolidatedbillsController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();