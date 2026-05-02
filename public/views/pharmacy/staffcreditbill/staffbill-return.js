(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('StaffBillReturnController', StaffBillReturnController);

    function StaffBillReturnController($rootScope, $scope, $interval, $stateParams, $state, $translate, utl, $filter, $timeout) {
        var vm = this;
        var savehitcompleted = 0;

        angular.extend(this, utl.Ctrl.getDMPrintDataController({
            $scope: $scope
        }));

        $scope.SelectedIndex = -1;
        $scope.isSaveandApprove = true;
        $scope.isSaving = true;
        $scope.RdoPatientId = false;
        $scope.RdoBillnumber = false;
        $scope.IsDue = true;
        $scope.IsDisabled = true;
        $scope.IsNewBill = true;
        $scope.dmprintpreferences = 0;
        $scope.printpreferences = 1;
        $scope.SaveImdDMPrint = 0;

        $scope.PatientReturnInfo = [];
        $scope.PatientBillInfo = [];
        $scope.PatientReturnDetails = [];
        $scope.PatientRefunds = [];

        $scope.selectedPatient = {};
        $scope.currentfilter = {};

        $scope.item = {
            PatientId: -1,
            ReturnWithComeRefund: true,
            PatientReturnStatusId: 1,
            RefundedOn: utl.Formatter.getCurrentDate(),
            ChequeDate: utl.Formatter.getCurrentDate(),
            DDDate: utl.Formatter.getCurrentDate(),
            WireTransferDate: utl.Formatter.getCurrentDate(),
            PharmacySaleTypeId: 1,
            PharmacyReturnTypeId: 7,
            TotRndoffAmt: 0,
            PreferedRoundOff: 0,
            GSTAmount: 0,
            InGstAmount: 0,
            CGstAmount: 0,
            SGstAmount: 0,
            ReturnAll: false
        };

        $scope.newPatient = {
            PatientName: '',
            DoctorName: '',
            Mobile: '',
            TitleId: -1,
            GenderId: -1,
            DOB: null,
            Age: 0
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
            RefundAmt: 0,
            ReceiptAmt: 0,
            ReceivedAmount: 0,
            TotBalanceAmt: 0,
            ToBeRefundAmount: 0,
            ReturnAmount: 0,
            PatientReturnStatusId: 1,
            PatientStatusId: 1,
            isnewpatient: false,
            // pid:'',
            // returnid:''
        };
        if ($stateParams.id)
            $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.pid = parseInt($stateParams.pid);
        $scope.currentcontext.returnid = parseInt($stateParams.returnid);

        $scope.currentfilter = {
            billdate: utl.Formatter.getCurrentDate(),
            returndate: utl.Formatter.getCurrentDate(),
            billnumber: '',
            refundnumber: '',
            PatientId: -1,
            patientname: '',
            DoctorId: -1,
            DoctorName: '',
            DepartmentId: -1,
            PayScenarioId: -1,
            GuarantorId: -1,
            GuarantorTypeId: -1,
            GuarantorName: '',
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
        $scope.dashboard = function () {
            $state.go('app.pharmacydashboard');
        };
        $scope.EnableDisableDropdown = function (flag) {
            $scope.RdoPatientId = !flag;
            $scope.RdoDoctorId = flag;
            $scope.RdoDepartmentId = flag;
            $scope.RdoPayScenarioId = flag;
            $scope.RdoGuarantorId = flag;
            $scope.RdoItemMasterId = flag;
            for (var i = 0, len = $scope.PatientReturnDetails.length; i < len; i++) {
                $scope.PatientReturnDetails[i].RdoItemMasterId = flag;
                $scope.PatientReturnDetails[i].RdoDiscountMode = flag;
                $scope.PatientReturnDetails[i].RdoDiscountTypeId = flag;
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

        $scope.addNew = function () {
            $state.go('app.staffbill-return', {
                id: 0
            });
        };

        $scope.EnableDisableDropdown($scope.isSaving);

        $scope.applyVisibilityRules = function () {
            // Draft
            if ($scope.item.PatientReturnStatusId == 1) {
                $scope.canShowSaveBtn = true;
                $scope.canShowSaveapproveBtn = true;
                $scope.canShowClearBtn = true;
                $scope.canShowCancelBtn = false;
                $scope.HidePrintBtn = true;
                $scope.canShowViewReceipt = false;
                $scope.canShowAttachBtn = true;
            }
            // Return Cancelled
            if ($scope.item.PatientReturnStatusId == 2) {
                $scope.canShowSaveBtn = false;
                $scope.canShowSaveapproveBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.HidePrintBtn = false;
                $scope.canShowViewReceipt = true;
                $scope.canShowAttachBtn = true;
            }
            // Return Completed
            if ($scope.item.PatientReturnStatusId == 3) {
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

            if ($scope.PatientReturnInfo.length > 0 && $scope.item.PatientReturnStatusId == 3) {
                $scope.RdoPaymentTypeId = false;
                // $scope.item.ReturnWithComeRefund = false;
            }
        };


        $scope.openAttachments = function () {
            utl.Modal.open('app.patientattachments', {
                params: {
                    pid: 0,
                    itemid: 0
                },
                confirmCallback: $scope.initLookup,
                cancelCallback: $scope.initLookup
            });
        };

        $scope.print = function () {
            if ($scope.printpreferences != 1) {
                utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.preferencesetting.lbl'));


                return false;
            } else {
                var inputData = {
                    Id: $scope.currentcontext.id
                };
                var options = {
                    action: 'billing/patientreturns/PrintPatientReturns',
                    data: inputData,
                    type: 'post'
                };
                utl.Http.doPrint(options);
            }
        };

        $scope.backToList = function () {
            $state.go('app.staffcreditreturns', $scope.currentcontext.id);
        };

        /* Find and Loading the Bill Starts Here */

        $scope.findBill = function () {
            $scope.SaveImdDMPrint = 0;
            savehitcompleted = 0;
            utl.Modal.open('app.find-pharmacy-sales', {
                params: {
                    id: $scope.currentfilter.PatientId,
                    td: 'return'
                },
                confirmCallback: patientBillPickerCallback
            });
        };

        $scope.findReturn = function () {
            $scope.SaveImdDMPrint = 0;
            utl.Modal.open('app.find-pharmacy-returns', {
                params: {
                    id: $scope.currentfilter.PatientId
                },
                confirmCallback: patientReturnPickerCallback
            });
        };

        function patientBillPickerCallback(patientbilldata) {
            if (patientbilldata && patientbilldata.IsCashToCreditBill) {
                var Msg = 'Already Bill changed as cash to credit so we cannnot take return from this bill';
                utl.Alert.showErrorMsg($translate.instant(Msg));
                return;
            } else {
                $scope.currentcontext.id = patientbilldata.BillId;
                $scope.getBillInfoByBillId();
            }
        }

        function patientReturnPickerCallback(patientreutrndata) {
            $scope.currentcontext.id = patientreutrndata.ReturnId;
            $scope.getReturnInfoByReturnId();
        }
        $scope.getPaymentDetailsCallback = function (scope, res, options, hasError) {
            if(res.Data.length>0){
                $scope.IsPaymentDone = 1;
            }else{
                $scope.IsPaymentDone = 0;
            }   
        }
        $scope.getPaymentDetails = function () {
            var SearchBillId = $scope.currentcontext.id;
            if (SearchBillId && SearchBillId > 0) {
                var inputData = {
                    Params: [{
                        Key: 10,
                        Value: SearchBillId
                    }],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'billing/PatientPaymentDetails/GetPatientPaymentDetails',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getPaymentDetailsCallback
                };
                utl.Http.doAction(options);
            } else {
                $scope.clear();
            }
        };


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
                    action: 'billing/patientbills/GetPatientBills',
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
            $scope.PatientBillInfo = res.Data || [];
            if ($scope.PatientBillInfo && $scope.PatientBillInfo.length > 0) {
                $scope.PatientBillInfo.forEach(patientbills => {
                    $scope.item.PharmacySaleTypeId = patientbills.PharmacySaleTypeId;
                    $scope.item.PatientBillStatusId = patientbills.PatientBillStatusId;
                    if ($scope.item.PharmacySaleTypeId == 1) {
                        //Implemented Out-Patient Return Scenario
                        $scope.currentcontext.isnewpatient = false;
                        $scope.item.PharmacyReturnTypeId = 7;
                        $scope.item.PatientBillStatusId = patientbills.PatientBillStatusId;
                        $scope.currentcontext.PatientBillStatusId = patientbills.PatientBillStatusId;
                        if ($scope.item.PatientBillStatusId == 3) {
                            $scope.IsDisabled = true;
                            $scope.RdoPharmacySaleType = true;
                        }

                        $scope.item.StaffId = patientbills.StaffId;
                        $scope.currentfilter.PatientId = patientbills.PatientId;
                        $scope.currentfilter.DiscountModeId = patientbills.BillDiscountModeId;
                        $scope.currentfilter.GuarantorId = patientbills.GuarantorId;
                        $scope.currentfilter.GuarantorName = patientbills.GuarantorName;
                        $scope.currentfilter.GuarantorTypeId = patientbills.GuarantorTypeId;

                        $scope.currentcontext.DiscountApprovedBy = patientbills.DiscountApprovedBy;
                        $scope.currentcontext.id = 0;
                        $scope.currentcontext.ReceiptAmt = 0;
                        $scope.currentcontext.ReceivedAmount = parseFloat(patientbills.PaidAmount);
                        $scope.currentcontext.PaidAmt = parseFloat(patientbills.PaidAmount) - parseFloat(patientbills.RefundAmount);
                        $scope.currentcontext.ApprovedById = patientbills.BillApprovedBy;
                        $scope.currentcontext.billdate = patientbills.BillDateTime;
                        $scope.currentcontext.BillDiscount = 0;
                        $scope.item.TotDiscAmount = patientbills.BillDiscount;
                        $scope.currentcontext.CNAmount = 0;
                        $scope.currentcontext.TotNetAmount = 0;
                        $scope.currentcontext.TotBalanceAmt = 0;
                        $scope.currentcontext.RefundedAmount = parseFloat(patientbills.RefundAmount);
                        $scope.currentcontext.PatientStatusId = patientbills.PatientBillStatusId;
                        $scope.currentfilter.StoreMasterId = patientbills.StoreMasterId;
                        if (patientbills.StoreMaster) {
                            $scope.currentfilter.StoreTypeId = patientbills.StoreMaster.StoreTypeId;
                            $scope.currentfilter.StoreSubTypeId = patientbills.StoreMaster.StoreSubTypeId;
                            $scope.currentfilter.SequenceOptionId = patientbills.StoreMaster.SequenceOptionId;
                        }

                        $scope.item.PatientBillStatus = patientbills.PatientBillStatus.Description;
                        $scope.item.GuarantorDueId = patientbills.GuarantorDueId || null;
                        $scope.item.PrivateDueId = patientbills.PrivateDueId || null;
                        $scope.item.BillNumber = patientbills.BillNumber;
                        $scope.item.PatientBillId = patientbills.Id;
                        $scope.item.DepartmentId = patientbills.DepartmentId;
                        $scope.item.BillDateTime = patientbills.BillDateTime;
                        $scope.item.EncounterId = patientbills.EncounterId;
                        $scope.item.EncounterTypeId = patientbills.EncounterTypeId;
                        $scope.item.FacilityId = patientbills.FacilityId;
                        $scope.item.OrganizationId = patientbills.OrganizationId;
                        $scope.item.PatientName = patientbills.PatientName;
                        $scope.item.MobileNo = patientbills.Mobile;
                        $scope.item.PatientMRN = patientbills.PatientMrn;
                        $scope.item.DoctorId = patientbills.DoctorId;
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

                    $scope.PatientReturnDetails = [];
                    $scope.PatientRefunds = [];
                    $scope.PatientReturnDetails = patientbills.PatientBillDetails;

                    var count = 0;
                    for (var idx in $scope.PatientReturnDetails) {
                        var item = $scope.PatientReturnDetails[idx];
                        if (item.Quantity == item.ReturnedQuantity) {
                            count++;
                        }
                        item.PatientBillDetailId = item.Id;
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
                    if (count == $scope.PatientReturnDetails.length) {
                        utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.fullrefund.lbl'));

                        $state.reload();
                        return false;
                    }

                    $scope.applyVisibilityRules();
                    $scope.patientChange();
                    $scope.setIndexforTableIndex();
                   
                });
            }

            $('#pid').select();
            $('#pid').focus();


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

        $scope.getPatientInfo = function (scope, data, options, hasError) {
            savehitcompleted = 0;
            $scope.selectedPatient = data;
            $scope.item.PatientName = $scope.selectedPatient.FirstName;
            $scope.item.FacilityId = $scope.selectedPatient.FacilityId;
            $scope.fnencounter();
        };

        $scope.fnencounter = function () {
            var inputData = {
                Params: [{
                        Key: 14,
                        Value: 1
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.PatientId
                    }
                ]
            };
            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getVisitIndentifier
            };

            utl.Http.doAction(options);
        };

        $scope.getVisitIndentifier = function (scope, data, options, hasError) {
            $scope.item.IsEncounter = false;
            if (data.Data.length > 0) {
                $scope.encounter = data.Data[0];
                $scope.item.EncounterId = $scope.encounter.Id;
                $scope.item.DoctorId = $scope.encounter.DoctorId;
                $scope.item.DepartmentId = $scope.encounter.DepartmentId;
                if ($scope.item.PharmacySaleTypeId == 4) {
                    $scope.item.DepartmentId = 0;
                } else {
                    $scope.item.DepartmentId = $scope.encounter.DepartmentId;
                }
                $scope.item.IsEncounter = true;
            } else {}
        };

        $scope.getReturnInfoByReturnId = function () {
            var SearchReturnId = $scope.currentcontext.returnid;
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
                    action: 'billing/patientreturns/GetPatientReturns',
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
            $scope.PatientReturnInfo = res.Data || [];
            if ($scope.PatientReturnInfo && $scope.PatientReturnInfo.length > 0) {
                $scope.PatientReturnInfo.forEach(patientreturns => {
                    $scope.item.PharmacyReturnTypeId = patientreturns.PharmacyReturnTypeId;
                    // if ($scope.item.PharmacyReturnTypeId == 1) {
                    $scope.currentfilter.PatientId = patientreturns.PatientId;
                    $scope.currentfilter.FirstName = patientreturns.Patient.FirstName;
                    $scope.currentfilter.LastName = patientreturns.Patient.LastName;
                    $scope.currentfilter.Age = patientreturns.Patient.Age;
                    $scope.currentfilter.MRN = patientreturns.Patient.MRN;
                    if (patientreturns.GenderId) {
                        $scope.currentfilter.Gender = patientreturns.Gender.Description;
                    }
                    $scope.currentfilter.GuarantorName = patientreturns.GuarantorName;
                    $scope.currentfilter.GuarantorTypeId = patientreturns.GuarantorTypeId;
                    $scope.currentfilter.StoreMasterId = patientreturns.StoreMasterId;
                    $scope.currentfilter.billdate = patientreturns.BillDateTime;
                    $scope.currentfilter.returndate = patientreturns.ReturnDateTime;
                    $scope.currentfilter.billnumber = patientreturns.BillNumber;
                    $scope.currentfilter.refundnumber = patientreturns.ReturnNumber;
                    $scope.currentfilter.patientname = patientreturns.PatientName;
                    $scope.currentfilter.DoctorId = patientreturns.DoctorId;
                    $scope.currentfilter.DepartmentId = patientreturns.DepartmentId;
                    $scope.currentfilter.DiscountModeId = patientreturns.DiscountModeId;

                    $scope.currentcontext.id = patientreturns.Id;
                    $scope.currentcontext.ReceiptAmt = patientreturns.ReturnAmount;
                    $scope.currentcontext.PaidAmt = parseFloat(patientreturns.PatientBill.PaidAmount) - parseFloat(patientreturns.PatientBill.RefundAmount);
                    $scope.currentcontext.ApprovedById = patientreturns.ReturnApprovedBy;
                    $scope.currentcontext.PatientReturnStatusId = patientreturns.PatientReturnStatusId;

                    $scope.item.PatientReturnStatusId = patientreturns.PatientReturnStatusId;
                    $scope.item.BillNumber = patientreturns.BillNumber;
                    $scope.item.PatientBillId = patientreturns.PatientBillId;
                    $scope.item.ReturnNumber = patientreturns.ReturnNumber;
                    $scope.item.PatientReturnId = patientreturns.Id;
                    $scope.item.DepartmentId = patientreturns.DepartmentId;
                    $scope.item.BillDateTime = patientreturns.BillDateTime;
                    $scope.item.ReturnDateTime = patientreturns.ReturnDateTime;
                    $scope.item.EncounterId = patientreturns.EncounterId;
                    $scope.item.EncounterTypeId = patientreturns.EncounterTypeId;
                    $scope.item.FacilityId = patientreturns.FacilityId;
                    $scope.item.OrganizationId = patientreturns.OrganizationId;
                    $scope.item.DoctorId = patientreturns.DoctorId;
                    $scope.item.PatientName = patientreturns.PatientName;
                    $scope.item.IsRefundedFully = patientreturns.IsRefundedFully;
                    $scope.item.TotRndoffAmt = patientreturns.RoundOffValue;
                    $scope.item.TotDiscAmount = patientreturns.DiscountAmount;
                    $scope.item.GrossAmount = patientreturns.GrossAmount;
                    $scope.item.NetAmount = patientreturns.ReturnAmount;
                    $scope.item.ReturnBy = '';
                    if (patientreturns.ReturnedUser.Title)
                        $scope.item.ReturnBy = patientreturns.ReturnedUser.Title.Description;
                    if (patientreturns.ReturnedUser.FirstName)
                        $scope.item.ReturnBy += ' ' + patientreturns.ReturnedUser.FirstName;
                    if (patientreturns.ReturnedUser.LastName)
                        $scope.item.ReturnBy += ' ' + patientreturns.ReturnedUser.LastName;
                    if ($scope.item.PatientReturnStatusId === 3) {
                        if ($scope.item.IsRefundedFully === true) {
                            $scope.currentcontext.TotNetAmount = patientreturns.ReturnAmount;
                            $scope.currentcontext.ReturnAmount = 0;
                            $scope.currentcontext.ToBeRefundAmount = 0;
                            $scope.currentcontext.RefundedAmount = patientreturns.RefundedAmount;

                            $scope.item.RefundStatus = 'Refunded';
                            $scope.IsDue = false;
                            $scope.item.ReturnWithComeRefund = true;
                        } else {
                            $scope.currentcontext.TotNetAmount = patientreturns.ReturnAmount;
                            $scope.currentcontext.ReturnAmount = patientreturns.ReturnAmount;
                            $scope.currentcontext.ToBeRefundAmount = patientreturns.ToBeRefundAmount;
                            $scope.currentcontext.RefundedAmount = patientreturns.RefundedAmount;
                        }
                    } else {
                        $scope.item.RefundStatus = 'Draft';

                        $scope.currentcontext.TotNetAmount = patientreturns.ReturnAmount;
                        $scope.currentcontext.ReturnAmount = patientreturns.ReturnAmount;
                        $scope.currentcontext.ToBeRefundAmount = patientreturns.ToBeRefundAmount;
                        $scope.currentcontext.RefundedAmount = parseFloat(patientreturns.PatientBill.RefundAmount);
                        $scope.currentcontext.ReceivedAmount = parseFloat(patientreturns.PatientBill.PaidAmount);
                    }
                    // } 

                    $scope.item.CardTypeId = -1;
                    $scope.item.BankId = -1;
                    $scope.item.ChequeNo = '';
                    $scope.item.DDNumber = 0;
                    $scope.item.CollectedOn = utl.Formatter.getCurrentDate();
                    $scope.item.ChequeDate = utl.Formatter.getCurrentDate();
                    $scope.item.DDDate = utl.Formatter.getCurrentDate();
                    $scope.item.WireTransferId = -1;
                    $scope.item.AuthorizeNumber = 0;

                    $scope.PatientReturnDetails = [];
                    $scope.PatientRefunds = [];
                    /*
                    $scope.item.ReturnWithComeRefund = false;
                    $scope.item.RefundStatus = 'Pending';
                    if ($scope.item.PatientReturnStatusId == 3 && $scope.item.IsRefundedFully) {
                        $scope.item.RefundStatus = 'Refunded';
                        $scope.IsDue = false;
                        $scope.item.ReturnWithComeRefund = true;
                    }
                    */
                    /*
                    if (!$scope.item.IsRefundedFully) {
                        $scope.currentcontext.ReceiptAmt = 0;
                    }
                    */
                    $scope.PatientReturnDetails = patientreturns.PatientReturnDetails;
                    for (var idx in $scope.PatientReturnDetails) {
                        var item = $scope.PatientReturnDetails[idx];
                        item.PatientReturnDetailId = patientreturns.Id;
                        item.IsRefundCompleted = false;
                        if ($scope.item.PatientReturnStatusId == 2) {
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
                    $scope.setIndexforTableIndex();
                    $scope.patientChange();

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

        $scope.patientprofiledetails = function () {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: $scope.currentfilter.PatientId
                },
                confirmCallback: $scope.getItem
            });
        };

        /* Find and Loading the Bill Ends Here */

        /* Enter Qty and Calculations Starts Here */

        $scope.CalcualteAmt = function (item) {
            $scope.currentcontext.ReceiptAmt = 0;
            // item.Quantity=(item.Quantity-item.ReturnQuantity);
            // item.ReturnedQuantity=(item.ReturnedQuantity)+(item.ReturnQuantity)
            if (parseInt(item.ReturnQuantity) > item.Quantity - item.ReturnedQuantity) {
                item.ReturnQuantity = 0;
                utl.Alert.showErrorMsg($translate.instant('billing.pharmacy.saledqty.lbl'));
            } else {
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
                if (item.NetAmount >= 0) {
                    $scope.CalculateNetAmt();
                    $scope.updatereceiptamount();
                    //$scope.applyVisibilityRules();
                } else {
                    utl.Alert.showErrorMsg($translate.instant('billing.opbilling-list.discountlimit.lbl'));
                }
            }
        };

        $scope.ReturnAll = function () {
            if ($scope.item.ReturnAll) {
                $scope.currentcontext.BillDiscount = 0;
                for (var i = 0, len = $scope.PatientReturnDetails.length; i < len; i++) {
                    if ($scope.PatientReturnDetails[i].Status == 1) {
                        $scope.PatientReturnDetails[i].ReturnQuantity = $scope.PatientReturnDetails[i].Quantity - $scope.PatientReturnDetails[i].ReturnedQuantity;
                        $scope.PatientReturnDetails[i].DiscountAmount = parseInt($scope.PatientReturnDetails[i].ReturnQuantity) * $scope.PatientReturnDetails[i].UnitDiscountAmount;
                        $scope.PatientReturnDetails[i].Amount = parseInt($scope.PatientReturnDetails[i].ReturnQuantity) * ($scope.PatientReturnDetails[i].Rate - $scope.PatientReturnDetails[i].UnitDiscountAmount);

                        $scope.PatientReturnDetails[i].GSTAmount = parseInt($scope.PatientReturnDetails[i].ReturnQuantity) * $scope.PatientReturnDetails[i].UnitGSTAmount;
                        $scope.PatientReturnDetails[i].InGstAmount = parseInt($scope.PatientReturnDetails[i].ReturnQuantity) * $scope.PatientReturnDetails[i].UnitInGstAmount;
                        $scope.PatientReturnDetails[i].CGstAmount = parseInt($scope.PatientReturnDetails[i].ReturnQuantity) * $scope.PatientReturnDetails[i].UnitCGstAmount;
                        $scope.PatientReturnDetails[i].SGstAmount = parseInt($scope.PatientReturnDetails[i].ReturnQuantity) * $scope.PatientReturnDetails[i].UnitSGstAmount;

                        $scope.PatientReturnDetails[i].NetAmount = $scope.PatientReturnDetails[i].Amount;
                        $scope.PatientReturnDetails[i].NetAmountBeforeGST = $scope.PatientReturnDetails[i].NetAmount - $scope.PatientReturnDetails[i].GSTAmount;
                    }
                }
            } else {
                for (var i = 0, len = $scope.PatientReturnDetails.length; i < len; i++) {
                    if ($scope.PatientReturnDetails[i].Status == 1) {
                        $scope.PatientReturnDetails[i].ReturnQuantity = 0;
                        $scope.PatientReturnDetails[i].DiscountAmount = parseInt($scope.PatientReturnDetails[i].ReturnQuantity) * $scope.PatientReturnDetails[i].UnitDiscountAmount;
                        $scope.PatientReturnDetails[i].Amount = parseInt($scope.PatientReturnDetails[i].ReturnQuantity) * ($scope.PatientReturnDetails[i].Rate - $scope.PatientReturnDetails[i].UnitDiscountAmount);

                        $scope.PatientReturnDetails[i].GSTAmount = parseInt($scope.PatientReturnDetails[i].ReturnQuantity) * $scope.PatientReturnDetails[i].UnitGSTAmount;
                        $scope.PatientReturnDetails[i].InGstAmount = parseInt($scope.PatientReturnDetails[i].ReturnQuantity) * $scope.PatientReturnDetails[i].UnitInGstAmount;
                        $scope.PatientReturnDetails[i].CGstAmount = parseInt($scope.PatientReturnDetails[i].ReturnQuantity) * $scope.PatientReturnDetails[i].UnitCGstAmount;
                        $scope.PatientReturnDetails[i].SGstAmount = parseInt($scope.PatientReturnDetails[i].ReturnQuantity) * $scope.PatientReturnDetails[i].UnitSGstAmount;

                        $scope.PatientReturnDetails[i].NetAmount = $scope.PatientReturnDetails[i].Amount;
                        $scope.PatientReturnDetails[i].NetAmountBeforeGST = $scope.PatientReturnDetails[i].NetAmount - $scope.PatientReturnDetails[i].GSTAmount;
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

            for (var i = 0, len = $scope.PatientReturnDetails.length; i < len; i++) {
                if ($scope.PatientReturnDetails[i].Status == 1 && $scope.PatientReturnDetails[i].ReturnQuantity > 0) {
                    var itemnetAmount = 0;
                    var itemGrossAmount = 0;
                    var itemDiscountAmount = 0;

                    var itemGstAmount = 0;
                    var itemInGstAmount = 0;
                    var itemCGstAmount = 0;
                    var itemSGstAmount = 0;

                    itemnetAmount = isNaN(parseFloat($scope.PatientReturnDetails[i].NetAmount)) ? 0 : parseFloat($scope.PatientReturnDetails[i].NetAmount);
                    itemGrossAmount = isNaN(parseFloat($scope.PatientReturnDetails[i].Amount)) ? 0 : parseFloat($scope.PatientReturnDetails[i].Amount);
                    itemDiscountAmount = isNaN(parseFloat($scope.PatientReturnDetails[i].DiscountAmount)) ? 0 : parseFloat($scope.PatientReturnDetails[i].DiscountAmount);

                    itemInGstAmount = isNaN(parseFloat($scope.PatientReturnDetails[i].InGstAmount)) ? 0 : parseFloat($scope.PatientReturnDetails[i].InGstAmount);
                    itemCGstAmount = isNaN(parseFloat(($scope.PatientReturnDetails[i].NetAmount * $scope.PatientReturnDetails[i].CGstPercentage) / (100 + $scope.PatientReturnDetails[i].GSTPercentage)).toFixed(2)) ? 0 : parseFloat(($scope.PatientReturnDetails[i].NetAmount * $scope.PatientReturnDetails[i].CGstPercentage) / (100 + $scope.PatientReturnDetails[i].GSTPercentage)).toFixed(2);
                    itemSGstAmount = isNaN(parseFloat(($scope.PatientReturnDetails[i].NetAmount * $scope.PatientReturnDetails[i].SGstPercentage) / (100 + $scope.PatientReturnDetails[i].GSTPercentage)).toFixed(2)) ? 0 : parseFloat(($scope.PatientReturnDetails[i].NetAmount * $scope.PatientReturnDetails[i].SGstPercentage) / (100 + $scope.PatientReturnDetails[i].GSTPercentage)).toFixed(2);
                    itemGstAmount = parseFloat(itemCGstAmount) + parseFloat(itemSGstAmount);
                    // itemGstAmount = isNaN(parseFloat($scope.PatientReturnDetails[i].GstAmount)) ? 0 : parseFloat($scope.PatientReturnDetails[i].GstAmount);

                    // itemCGstAmount = isNaN(parseFloat($scope.PatientReturnDetails[i].CGstAmount)) ? 0 : parseFloat($scope.PatientReturnDetails[i].CGstAmount);
                    // itemSGstAmount = isNaN(parseFloat($scope.PatientReturnDetails[i].SGstAmount)) ? 0 : parseFloat($scope.PatientReturnDetails[i].SGstAmount);
                    /*
                    if ($scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 2) {
                        itemDiscountAmount = itemDiscountAmount / 100 * itemGrossAmount;
                    }
                    */


                    if ($scope.currentfilter.GuarantorTypeId == 6) { // Free type
                        if ($scope.PatientReturnDetails[i].NetAmount) { // FreeNetAmount
                            $scope.PatientReturnDetails[i].FreeNetAmount = $scope.PatientReturnDetails[i].NetAmount;
                        }
                        $scope.PatientReturnDetails[i].NetAmount = 0;
                        $scope.PatientReturnDetails[i].DoctorShare = 0;
                        $scope.PatientReturnDetails[i].GSTAmount = 0;
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
            $scope.currentcontext.TotBalanceAmt = 0;

            $scope.item.GrossAmount = decimalRoundOff(itemwiseGrossAmt);
            $scope.currentcontext.TotNetAmount = itemwiseNetAmt;
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

            // $scope.currentcontext.TotNetAmount = parseFloat($scope.item.GrossAmount);
            // $scope.currentcontext.ToBeRefundAmount = parseFloat($scope.item.GrossAmount);
            // $scope.currentcontext.ReturnAmount = parseFloat($scope.item.GrossAmount);

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

            $scope.saveItem(2);
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

            $scope.item.PatientReturnStatusId = StatusId;

            if (($scope.currentcontext.PaidAmt) < $scope.currentcontext.ReceiptAmt) {
                utl.Alert.showErrorMsg('billing.opbilling-list.paidamount.lbl');


                $scope.currentcontext.ReceiptAmt = $scope.currentcontext.PaidAmt;
                $scope.currentcontext.ReturnAmount = $scope.currentcontext.PaidAmt;
                return false;
            }

            var dTotNetAmount = parseFloat($scope.currentcontext.TotNetAmount);
            var dPaidAmt = parseFloat($scope.currentcontext.PaidAmt);
            var RefundAmt = parseFloat($scope.currentcontext.RefundAmt);
            var dReceiptAmt = parseFloat($scope.currentcontext.TotNetAmount);

            if (dReceiptAmt < 0) {
                utl.Alert.showErrorMsg('billing.opbilling-list.returnamt.lbl');


                dReceiptAmt = 0;
                return false;
            }

            if ($scope.item.PatientReturnStatusId == 1 && dReceiptAmt > 0) {
                /*
                utl.Alert.showSuccessMsg('Amount collection use save and approve button');
                $scope.currentcontext.ReceiptAmt = 0;
                dReceiptAmt = 0;
                $scope.CalculateNetAmt();
                return false;
                */

                $scope.item.ReturnWithComeRefund = false;
            }
            if($scope.IsPaymentDone == 0){
                $scope.item.ReturnWithComeRefund = false;
            }

            $scope.item.Id = $scope.currentcontext.id;
            $scope.item.ReturnDateTime = utl.Formatter.getCurrentDate();
            $scope.item.PatientId = $scope.currentfilter.PatientId;
            $scope.item.ReturnTypeId = $scope.item.PharmacyReturnTypeId;
            $scope.item.ReturnAmount = $scope.currentcontext.TotNetAmount;
            $scope.item.DiscountModeId = $scope.currentfilter.DiscountModeId;
            $scope.item.DiscountAmount = $scope.item.TotDiscAmount;
            $scope.item.NetAmount = $scope.currentcontext.TotNetAmount;
            $scope.item.RoundOffValue = $scope.item.TotRndoffAmt;
            if ($scope.item.ReturnWithComeRefund) {
                $scope.item.RefundedAmount = $scope.currentcontext.TotNetAmount;
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
            $scope.item.ReturnApprovedById = 0;
            $scope.item.DoctorId = $scope.item.DoctorId;
            $scope.item.StoreMasterId = $scope.currentfilter.StoreMasterId;
            $scope.item.StoreTypeId = $scope.currentfilter.StoreTypeId;
            $scope.item.StoreSubTypeId = $scope.currentfilter.StoreSubTypeId;
            $scope.item.SequenceOptionId = $scope.currentfilter.SequenceOptionId;
            $scope.item.CancelReason = '';
            $scope.item.Comments = '';


            /*
            for (var disidx in $scope.PatientReturnDetails) {
                var disitem = $scope.PatientReturnDetails[disidx];
                if ($scope.currentfilter.DiscountModeId && $scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 2)
                    disitem.DiscountAmount = disitem.DiscountAmount / 100 * disitem.Amount;
            }
            */
        //    $scope.getBillInfoByBillId();
            if (!$scope.PatientRefunds || $scope.PatientRefunds.length === 0) {
                if ($scope.currentcontext.RefundAmount > 0) {
                    $scope.currentcontext.PaymentTypeId = $scope.currentcontext.PaymentTypeId;
                    $scope.currentcontext.RefundTypeId = 4;
                    $scope.currentcontext.RefundStatusId = 1;

                    $scope.AddRefundDetails();
                }
            }

            var pharmacyreturnitemlines = getLinesForSave();
            if (pharmacyreturnitemlines.length <= 0) {
                utl.Alert.showErrorMsg('billing.pharmacy.returnquantity.lbl');
                return false;
            }
            var returnedpaymentlines = getpaymentsLinesForSave();


            if ($scope.currentfilter.GuarantorTypeId == 6) { // Free type
                var itemwiseNetAmt = 0;
                for (var i = 0, len = $scope.PatientReturnDetails.length; i < len; i++) {
                    if ($scope.PatientReturnDetails[i].Status == 1) {
                        var itemnetAmount = 0;
                        itemnetAmount = isNaN(parseFloat($scope.PatientReturnDetails[i].FreeNetAmount)) ?
                            0 : parseFloat($scope.PatientReturnDetails[i].FreeNetAmount);
                        itemwiseNetAmt += itemnetAmount;
                    }
                }
                $scope.item.FreeReturnAmount = itemwiseNetAmt;
                $scope.item.FreeRefundAmount = $scope.item.RefundAmount;
                $scope.item.ReturnAmount = 0;
                $scope.item.RefundAmount = 0;
            }

            var actionName = 'billing/patientreturns/AddStaffBillReturns';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'billing/patientreturns/UpdateStaffBillReturns';
            }

            savehitcompleted = 1;

            var inputData = {
                Header: $scope.item,
                Details: pharmacyreturnitemlines,
                paymentDetail: returnedpaymentlines
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

        $scope.AddRefundDetails = function () {
            var PatientRefund = {
                Id: 0,
                RefundDateTime: utl.Formatter.getCurrentDate(),
                FacilityId: $scope.item.FacilityId,
                OrganizationId: $scope.item.OrganizationId,
                PatientId: $scope.item.PatientId,
                RefundTypeId: 4,
                EncounterId: $scope.item.EncounterId,
                EncounterTypeId: 0,
                PatientName: $scope.item.PatientName,
                RefundAmount: $scope.currentcontext.RefundAmount,
                DepartmentID: $scope.item.DepartmentId,
                StoreMasterId: $scope.currentfilter.StoreMasterId,
                PaymentcounterID: 0,
                GuarantorId: $scope.currentfilter.GuarantorId,
                GuarantorTypeId: $scope.currentfilter.GuarantorTypeId,
                RefundGeneratedById: utl.Session.getCurrentUserId(),
                RefundApprovedById: utl.Session.getCurrentUserId(),
                DoctorId: $scope.item.DoctorId,
                PatientBillId: $scope.item.PatientBillId,
                CardNumber: '',
                CardDateTime: null,
                CardExpiryDate: null,
                BankId: $scope.currentcontext.PaymentTypeId != 1 ? $scope.item.BankId : -1,
                CardTypeId: $scope.currentcontext.PaymentTypeId == 5 || $scope.currentcontext.PaymentTypeId == 6 ? $scope.item.CardTypeId : -1,
                TerminalNoId: $scope.item.TerminalNoId,
                CardHolderName: null,
                AuthorizeNumber: 0,
                AuthorizedCode: $scope.item.AuthorizeNumber,
                GurantorName: $scope.currentfilter.GuarantorName,
                ChequeNo: $scope.currentcontext.PaymentTypeId == 2 ? $scope.item.ChequeNo : '',
                ChequeDate: $scope.currentcontext.PaymentTypeId == 2 ? (!$scope.item.ChequeDate ? null : $scope.item.ChequeDate) : null,
                DDNumber: $scope.currentcontext.PaymentTypeId == 3 ? (!$scope.item.DDNumber) ? null : $scope.item.DDNumber : null,
                DDDate: $scope.currentcontext.PaymentTypeId == 3 ? (!$scope.item.DDDate) ? null : $scope.item.DDDate : null,
                WireTransferId: $scope.currentcontext.PaymentTypeId == 4 ? $scope.item.WireTransferId : null,
                WireTransferDate: $scope.currentcontext.PaymentTypeId == 4 ? (!$scope.item.WireTransferDate) ? null : $scope.item.WireTransferDate : null,
                Comments: $scope.item.Remarks,
                CancelReason: null,
                RefundStatusId: 1,
                RoundOffValue: 0,
                DebitNoteId: 0,
                PaymentTypeId: $scope.currentcontext.PaymentTypeId,
                PatientCreditNoteId: 0
            };

            if ($scope.currentcontext.id > 0) {
                PatientRefund.PatientBillId = $scope.currentcontext.id;
            }
            $scope.PatientRefunds.push(PatientRefund);
        };

        function getLinesForSave() {
            var result = [];
            for (var piidx in $scope.PatientReturnDetails) {
                var pharmacyitem = $scope.PatientReturnDetails[piidx];
                if (pharmacyitem.ItemMasterId > 0 && parseInt(pharmacyitem.ReturnQuantity) > 0 /* && pharmacyitem.Amount > 0 */ ) {
                    pharmacyitem.ReturnDateTime = utl.Formatter.getCurrentDate();
                    pharmacyitem.FacilityId = utl.Session.getCurrentFacilityId();
                    pharmacyitem.PatientId = $scope.currentfilter.PatientId;
                    pharmacyitem.ServiceId = pharmacyitem.ServiceId;
                    pharmacyitem.ServiceName = pharmacyitem.ServiceName;
                    pharmacyitem.StoreMasterId = $scope.currentfilter.StoreMasterId;
                    pharmacyitem.EncounterId = $scope.item.EncounterId;
                    pharmacyitem.PatientReturnStatusId = $scope.item.PatientReturnStatusId;
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
            for (var idx in $scope.PatientRefunds) {
                var item = $scope.PatientRefunds[idx];
                if (item.RefundAmount > 0) {
                    result.push(item);
                }
            }
            return result;
        }

        $scope.addPay = function () {
            utl.Modal.open('app.opbilling-form', {
                params: {
                    id: $scope.item.PatientId
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
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };

        /* Save or Save&Approve Ends Here */

        function loadData() {
            // $scope.patientChange();
            $scope.applyVisibilityRules();

            if ($scope.currentcontext.returnid > 0) {
                $scope.getReturnInfoByReturnId();
            };
            if ($scope.currentcontext.id > 0) {
                $scope.getBillInfoByBillId();
                $scope.getPaymentDetails();
            }
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

        $scope.setIndexforTableIndex = function () {
            var SNo = 1;
            for (var idx in $scope.PatientReturnDetails) {
                if ($scope.PatientReturnDetails[idx].Status == 1) {
                    $scope.PatientReturnDetails[idx].SNo = SNo;
                    $scope.PatientReturnDetails[idx].itemidxdesc = 'desc' + (SNo - 1);
                    $scope.PatientReturnDetails[idx].itemidxqty = 'qty' + (SNo - 1);
                    SNo++;
                }
            }
        };

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
            var inputData = [{
                    "Key": "Department"
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
                    "Key": "DiscountMode"
                },
                {
                    "Key": "DiscountType"
                },
                {
                    "Key": "GuarantorType"
                },
                {
                    "Key": "Guarantor",
                    Request: {
                        Params: [{
                            Key: 7,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
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
                {
                    "Key": "Title"
                },
                {
                    "Key": "Gender"
                },
                {
                    "Key": "PharmacySaleType"
                },
                {
                    "Key": "PrivateDueApprover"
                },
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
                    action: 'billing/patientreturns/PrintDMPatientReturns',
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

            if (data.PatientReturns.Encounter) vIPOPNO = '' + data.PatientReturns.Encounter.VisitIdentifier;
            if (data.Encounter) vEncounterType = '' + data.Encounter.EncounterType.Description;
            if (data.PatientReturns.Facility) vGST = '' + data.PatientReturns.Facility.GstNumber;

            if (data.PatientReturns.Department) {
                DepartmentName = data.PatientReturns.Department.DepartmentName;
            }

            if (data.PatientReturns.User) {
                if (data.PatientReturns.User.Title) vUTitle = data.PatientReturns.User.Title.Description;
                if (data.PatientReturns.User.FirstName) vUFirstName = data.PatientReturns.User.FirstName;
                if (data.PatientReturns.User.LastName) vULastName = data.PatientReturns.User.LastName;
            }
            if (data.PatientReturns.CreatedUser) {
                if (data.PatientReturns.CreatedUser.Title) vCTitle = data.PatientReturns.CreatedUser.Title.Description;
                if (data.PatientReturns.CreatedUser.FirstName) vCFirstName = data.PatientReturns.CreatedUser.FirstName;
                if (data.PatientReturns.CreatedUser.LastName) vCLastName = data.PatientReturns.CreatedUser.LastName;
            }
            if (data.PatientReturns.Patient) {
                if (data.PatientReturns.Patient.Title) vPTitle = data.PatientReturns.Patient.Title.Description;
                if (data.PatientReturns.Patient.FirstName) vPFirstName = data.PatientReturns.Patient.FirstName;
                if (data.PatientReturns.Patient.LastName) vPLastName = data.PatientReturns.Patient.LastName;
                if (data.PatientReturns.Patient.MRN) vMRN = data.PatientReturns.Patient.MRN;
                if (data.PatientReturns.Patient.Age) vAge = '' + data.PatientReturns.Patient.Age;
                if (data.PatientReturns.Patient.DOB) vDOB = '' + data.PatientReturns.Patient.DOB;
                if (data.PatientReturns.Patient.DOB) vFDOB = '' + utl.Formatter.getDateTimeString(data.PatientReturns.Patient.DOB);
                if (data.PatientReturns.Patient.Gender) vGender = '' + data.PatientReturns.Patient.Gender.Description;
            } else {
                vPFirstName = data.PatientReturns.PatientName;
            }

            if (data.PatientReturns.GuarantorName &&
                data.PatientReturns.GuarantorName != null &&
                data.PatientReturns.GuarantorName != '' &&
                data.PatientReturns.GuarantorName != undefined) {
                vGuarantorName = data.PatientReturns.GuarantorName;
            }

            if (vGuarantorName == null || vGuarantorName == '' || vGuarantorName == undefined) {
                if (data.PatientReturns.PatientGuarantor) {
                    if (data.PatientReturns.PatientGuarantor.GuarantorName) vGuarantorName = '' + data.PatientReturns.PatientGuarantor.GuarantorName;
                }
            }

            if (vGuarantorName == null || vGuarantorName == '' || vGuarantorName == undefined) {
                if (data.PatientReturns.GuarantorMaster) {
                    if (data.PatientReturns.GuarantorMaster.GuarantorName) vGuarantorName = '' + data.PatientReturns.GuarantorMaster.GuarantorName;
                }
            }

            if (data.PatientReturns.StoreMaster) vTinNo = data.PatientReturns.StoreMaster.TinNo;

            var vtotalrnd = 0;
            var vtotDiscont = 0;

            var vtotmt = 0;

            if (data.PatientReturns.RoundOffValue)
                vtotalrnd = data.PatientReturns.RoundOffValue;

            if (data.PatientReturns.DiscountAmount)
                vtotDiscont = data.PatientReturns.DiscountAmount;

            if (data.PatientReturns.GrossAmount)
                vtotmt = data.PatientReturns.GrossAmount;

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
            var TotalBillAmount = data.PatientReturns.ReturnAmount;
            var TotalCGSTAmount = data.PatientReturns.CGstAmount;
            var TotalSGSTAmount = data.PatientReturns.SGstAmount;
            TotalGSTAmount = TotalCGSTAmount + TotalSGSTAmount;
            GrossAmount = TotalBillAmount - TotalGSTAmount;
            var TotalNoOfItems = data.PatientReturns.PatientReturnDetails.length;
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
            for (var idx in data.PatientReturns.PatientReturnDetails) {
                var billDetail = data.PatientReturns.PatientReturnDetails[idx];
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
                        if (data.PatientBills.IsPharmacyBill == true
                            && data.PatientBills.IsPaidFully == false
                            && data.PatientBills.OutStandingAmount > 0) {
                            BillType = 'CASH BILL';
                        }
            */
            var BillDate = utl.Formatter.getDateString(data.PatientReturns.ReturnDateTime);
            var BillDateTime = new Date(data.PatientReturns.ReturnDateTime);
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

            var SaleDate = utl.Formatter.getDateString(data.PatientReturns.BillDateTime);
            var SaleDateTime = new Date(data.PatientReturns.BillDateTime);
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
                licenseno: '' + data.PatientReturns.StoreMaster.LicenseNo,
                billno: '' + data.PatientReturns.ReturnNumber,
                patientname: vPTitle + ' ' +
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
                billdate: utl.Formatter.getDateTimeString(data.PatientReturns.ReturnDateTime),
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
                SaleNumber: data.PatientReturns.BillNumber,
                SaleDate: SaleDate,
                SaleTime: SaleTime,
                DepartmentName: DepartmentName
            };

            dmPrintInput.lines = [];
            var islno = 1;
            var GSTPercentages = Array();
            for (var idx in data.PatientReturns.PatientReturnDetails) {
                var billDetail = data.PatientReturns.PatientReturnDetails[idx];
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
                for (var index1 in data.PatientReturns.PatientReturnDetails) {
                    var BillDetails = data.PatientReturns.PatientReturnDetails[index1];
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
                    var idx = $scope.PatientReturnDetails.length - 1;
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

    StaffBillReturnController.$inject = ['$rootScope', '$scope', '$interval', '$stateParams', '$state', '$translate', 'utl', '$filter', '$timeout'];

})();