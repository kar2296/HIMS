(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('pharmacybillmodifyviewController', pharmacybillmodifyviewController);

    function pharmacybillmodifyviewController($rootScope, $scope, $stateParams, $state, $translate, utl, $filter, $timeout) {
        var vm = this;
        var savehitcompleted = 0;

        $scope.autosearchpopup = 0;
        $scope.dmprintpreferences = 0;
        $scope.printpreferences = 1;
        $scope.chkfindBill = 0;
        $scope.dgbillnosaveoption = 0;
        $scope.IpBillList = 0;
        $scope.IPIsBillLock = false;
        $scope.newPatient = {};
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        //angular.extend(this, utl.Ctrl.getDMPrintDataController({ $scope: $scope }));

        $scope.SelectedIndex = -1;
        $scope.isSaveandApprove = true;
        $scope.PatientBillInfo = [];
        $scope.PatientBillInfoDetails = [];
        $scope.item = {};
        $scope.selectedPatient = {};
        $scope.currentcontext = {};
        $scope.currentfilter = {};
        $scope.currentcontext.selecteddept = [];

        $scope.item.PatientId = -1;
        $scope.currentfilter.PatientId = -1;
        $scope.orderfrombilling = 0;
        $scope.currentfilter.patientname = '';
        $scope.currentcontext.PaymentTypeId = 1;
        $scope.currentfilter.DoctorName = '';
        $scope.currentfilter.GuarantorName = '';
        $scope.currentfilter.ServiceRateCategoryName = '';
        $scope.isSaving = true;
        $scope.outstanding = true;
        $scope.item.BillWithComeReceipt = true;
        $scope.item.PatientBillStatusId = 1;
        $scope.currentcontext.PatientBillStatusId = 1;
        $scope.RdoPatientId = false;
        $scope.RdoBillnumber = false;
        $scope.IsDue = false;
        $scope.DeletedPatientBills = [];
        $scope.item.CollectedOn = utl.Formatter.getCurrentDate();
        $scope.item.ChequeDate = utl.Formatter.getCurrentDate();
        $scope.item.DDDate = utl.Formatter.getCurrentDate();
        $scope.item.WireTransferDate = utl.Formatter.getCurrentDate();
        $scope.item.TotalPaidAmount = 0;
        $scope.item.TotalAvailableAmount = 0;
        $scope.item.TotalDueAmount = 0;
        $scope.item.VisitNumber = null;
        $scope.item.IsFromIPBill = 0;
        $scope.CanDelete = false;
        $scope.canShowFinanceBtn = false;
        $scope.canShowAdvanceBtn = false;

        $scope.currentcontext.id = 0;
        $scope.EnableDisableDropdown = function (flag) {
            $scope.RdoPatientId = !flag;
            $scope.RdoDoctorId = flag;
            $scope.RdoDepartmentId = flag;
            $scope.RdoPayScenarioId = flag;
            $scope.RdoGuarantorId = flag;
            $scope.RdoServiceRateCategoryId = flag;
            $scope.RdoServiceId = flag;
            for (var i = 0, len = $scope.PatientBillDetails.length; i < len; i++) {
                $scope.PatientBillDetails[i].RdoServiceId = $scope.item.PatientBillStatusId == 1 ? false : flag;
                $scope.PatientBillDetails[i].RdoIsPackage = flag;
                $scope.PatientBillDetails[i].RdoDiscountMode = flag;
                $scope.PatientBillDetails[i].RdoDiscountTypeId = flag;
            }

            $scope.currentcontext.RdoBillDiscount = flag;
            $scope.RdoBillDiscountTypeId = flag;
            $scope.RdoApprovedById = flag;
            $scope.currentcontext.RdoBillDiscountMode = flag;

            $scope.EnableBillWithComeReceipt();

        };

        $scope.opd_dashboard = function () {
            $state.go('app.opddashboard');
        };

        $scope.EnableBillWithComeReceipt = function () {
            var flag = !$scope.item.BillWithComeReceipt;
            $scope.currentcontext.RdoReceiptAmt = flag;
            $scope.RdoPaymentTypeId = flag;
        };

        $scope.currentcontext.PatientStatusId = 1;
        $scope.currentcontext.IsAdjustAgainstAdvance = false;
        $scope.currentcontext.RdoBillDiscount = true;
        $scope.currentcontext.RdoBillDiscountMode = true;
        $scope.currentcontext.Rdobilldate = true;
        $scope.currentcontext.BillDiscount = 0;
        $scope.currentcontext.PaymentTypeId = 1;
        $scope.currentcontext.TotNetAmount = 0;
        $scope.currentcontext.TotCASHAmount = 0;
        $scope.currentcontext.TotDiscountAmt = 0;
        $scope.currentcontext.PaidAmt = 0;
        $scope.currentcontext.ReceiptAmt = null;
        $scope.currentcontext.TotBalanceAmt = 0;
        $scope.currentcontext.TotDueAmt = 0;
        $scope.currentcontext.RefundAmount = 0;
        $scope.currentcontext.CNAmount = 0;
        $scope.currentcontext.PendingAmt = 0;
        $scope.PatientBillDetails = [];
        $scope.PatientPaymentDetails = [];
        $scope.PaymentAdjustmentDetails = [];

        $scope.EnableDisableDropdown($scope.isSaving);

        $scope.fillDefaultValues = function () {};

        function getIPBillListCallback(ipBillListData) {
            if (ipBillListData && ipBillListData.data &&
                ipBillListData.data.length > 0) {
                $scope.PatientBillDetails = [];
                $scope.item.IsFromIPBill = 1;
                $scope.PatientBillDetails = ipBillListData.data;
                for (var idx in $scope.PatientBillDetails) {
                    $scope.currentcontext.PatientBillStatusId = 3;
                    if ($scope.PatientBillDetails[idx].DiscountAmount)
                        $scope.PatientBillDetails[idx].Amount += $scope.PatientBillDetails[idx].DiscountAmount;
                    $scope.PatientBillDetails[idx].RdoServiceId = true;
                    $scope.PatientBillDetails[idx].IPBillDetailId = $scope.PatientBillDetails[idx].Id;
                }
                $scope.CalculateNetAmt();
            }
        }

        $scope.getIPBillList = function () {
            if ($scope.item.EncounterId) {
                utl.Modal.openFixedDialogFixedDialog('app.ipbilltoopbill', {
                    params: {
                        eid: $scope.item.EncounterId
                    },
                    confirmCallback: getIPBillListCallback
                });
            }
        };

        $scope.oppharmacylist = function (summaryviewflag) {
            if ($scope.item.IsEncounter) {
                var inputData = {
                    Id: $scope.item.EncounterId,
                    Data: {
                        isprint: false,
                        summaryviewflag: summaryviewflag
                    }
                };
                var options = {
                    action: 'billing/patientbills/PrintOPConsolidate',
                    data: inputData,
                    type: 'post'
                };
                utl.Http.doDownload(options);
            }
        };

        $scope.getPatientInfo = function (scope, data, options, hasError) {
            $scope.item.IsFromIPBill = 0;
            $scope.IpBillList = 0;
            $scope.IPIsBillLock = false;
            if (data && data.OutStandingAmount > 0)
                $scope.selectedPatient.OutStandingAmount = data.OutStandingAmount;

            if ($scope.selectedPatient.OutStandingAmount && $scope.selectedPatient.OutStandingAmount > 0) {
                $scope.currentcontext.TotDueAmt = $scope.selectedPatient.OutStandingAmount;
                //utl.Alert.showErrorMsg('Patient has been due. Due Amount :' + $filter('displaycurrency')($scope.selectedPatient.OutStandingAmount));
            }
            $scope.selectedPatient = data;
            $scope.item.PatientName = $scope.selectedPatient.FirstName;
            $scope.item.PatientId = $scope.selectedPatient.Id;
            $scope.item.TotalAvailableAmount = $scope.selectedPatient.AmountPaid - $scope.selectedPatient.AmountAdjusted;
            $scope.canShowFinanceBtn = true;
            $scope.canShowAdvanceBtn = true;
            if (vm.Context == 'DG') {
                $scope.item.MRN = $scope.selectedPatient.MRN;
                $scope.item.DoctorId = -1;
                $scope.item.DepartmentId = -1;
            }
            $scope.loadPatientGuarantors();
            $scope.onDoctorSelected();
            if ($scope.selectedPatient.Encounters && $scope.selectedPatient.Encounters.length > 0) {
                var encounter = $scope.selectedPatient.Encounters[0] || {};
                if (encounter && encounter.EncounterTypeId == 2) {
                    $scope.IpBillList = 1;
                    $scope.IPIsBillLock = encounter.IsBillLock;
                }
                var encGuarantor = encounter.EncounterGuarantors.length > 0 ? encounter.EncounterGuarantors[0] : {
                    GuarantorTypeId: -1
                };
                $scope.currentfilter.GuarantorTypeId = encGuarantor.GuarantorTypeId;
                $scope.GuarantorTypeChange({
                    Id: encGuarantor.GuarantorTypeId
                })
            }
            $scope.fnencounter();
            if ($scope.currentfilter.PatientId > 0 && !$scope.item.BillNumber) {
                $scope.isSaving = false;
                $scope.outstanding = false;
                $scope.EnableDisableDropdown($scope.isSaving);

                if ($scope.currentcontext.id <= 0)
                    $scope.getBillInfoByPatientID();
            }

        };

        $scope.patientChange = function () {
            $scope.chkfindBill = 0;
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

        if ($stateParams.id) {
            $scope.currentcontext.id = parseInt($stateParams.id);
            $scope.currentfilter.PatientId = $stateParams.pid;
            $scope.patientChange();
        }

        $scope.filterbillnr = $stateParams.filterbillnr;
        $scope.filterbilldt = $stateParams.filterbilldt;
        $scope.filtermrn = $stateParams.filtermrn;

        if (!$scope.currentcontext.id || $scope.currentcontext.id == 0) {
            $scope.fillDefaultValues();
        }

        $scope.getBillInfoByPatientID = function () {
            if ($scope.currentfilter.PatientId && $scope.currentcontext.id <= 0) {
                var inputData = {
                    Params: [{
                            Key: 3,
                            Value: $scope.currentfilter.PatientId
                        },
                        {
                            Key: 6,
                            Value: vm.Context == 'OP' ? 1 : 5
                        }
                    ],
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

        $scope.getBillDetailsCallback = function (scope, res, options, hasError) {
            $scope.PatientBillInfoDetails = res.Data || [];
            var bills = [];
            var billdetails = [];
            for (var idx in res.Data) {
                var bills = res.Data[idx];
                if (bills.PatientId == $scope.currentfilter.PatientId) {
                    for (var iddx in bills.PatientBillDetails) {
                        var billdetails = bills.PatientBillDetails[iddx];
                        for (var jdx in $scope.PatientBillDetails) {
                            if ($scope.PatientBillDetails[jdx].ServiceId > 0)
                                var Service = $scope.PatientBillDetails[jdx].ServiceId;
                        }
                        if (billdetails.ServiceId == Service) {
                            utl.Alert.showErrorMsg($translate.instant('Item Already Ordered'));
                        }
                    }
                }
            }
        };

        $scope.getBillInfoDetails = function (ServiceItemobj) {
            var FromDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59');
            if ($scope.currentfilter.PatientId) {
                var inputData = {
                    Params: [{
                            Key: 17,
                            Value: FromDate
                        },
                        {
                            Key: 18,
                            Value: ToDate
                        },
                        {
                            Key: 6,
                            Value: vm.Context == 'OP' ? 1 : 5
                        }
                    ],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'billing/patientbills/GetPatientBills',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getBillDetailsCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.GuarantorTypeChange = function (SelectedGuarantorType) {
            $scope.lookup.SelectedGuarantor = [];
            $scope.currentfilter.GuarantorId = -1;
            $scope.currentfilter.GuarantorName = "";
            $scope.currentfilter.ServiceRateCategoryId = -1;
            $scope.addNewLineItem();
        };

        $scope.GuarantorChange = function (SelectedGuarantor) {
            $scope.currentfilter.GuarantorId = SelectedGuarantor.Id;
            $scope.item.GuarantorDueId = SelectedGuarantor.Id;
            $scope.currentfilter.GuarantorName = SelectedGuarantor.Text;
            $scope.currentfilter.GuarantorTypeId = SelectedGuarantor.GuarantorTypeId;
            $scope.currentfilter.ServiceRateCategoryId = SelectedGuarantor.Guarantor.ServiceRateCategoryId;
            $scope.PatientBillDetails = [];
            $scope.PatientPaymentDetails = [];
            $scope.addNewLineItem();
        };

        $scope.ServiceRateCatChange = function (SelectedSerRateCat) {
            $scope.currentfilter.ServiceRateCategoryId = SelectedSerRateCat.Id;
            $scope.currentfilter.ServiceRateCategoryName = SelectedSerRateCat.Text;
            $scope.PatientBillDetails = [];
            $scope.PatientPaymentDetails = [];
            $scope.addNewLineItem();
        };

        $scope.ItemwiseDiscountTypechange = function (selecteditem) {
            if (selecteditem.DiscountTypeId > 0) {
                selecteditem.RdoDiscountMode = false;
            } else {
                selecteditem.Discount = 0;
                selecteditem.RdoDiscount = true;
                selecteditem.RdoDiscountMode = true;
            }

            $scope.CalcualteAmt(selecteditem);
        };

        $scope.DiscountModechange = function () {
            for (var idx in $scope.PatientBillDetails) {

                $scope.ItemwiseDiscountModechange($scope.PatientBillDetails[idx]);
            }
        };

        $scope.ItemwiseDiscountModechange = function (item) {
            if ($scope.currentfilter.DiscountModeId > 0) {
                item.RdoDiscount = false;
            } else {
                item.RdoDiscount = true;
            }
            $scope.CalcualteAmt(item);
        };

        $scope.setDiscountLimit = function (item) {
            $scope.DiscountLimit = item.DiscountLimit;
            if (item.DiscountMode.Description == "%") {
                $scope.DiscountLimit = (parseFloat($scope.item.GrossAmount) * item.DiscountLimit) / 100;
            }
            $scope.CalculateNetAmt();
        };

        $scope.BillDiscountTypechange = function (billwisedisselectedtype) {

            if (billwisedisselectedtype.Id > 0) {
                $scope.currentcontext.RdoBillDiscount = false;
                $scope.currentcontext.RdoBillDiscountMode = false;
            } else {
                $scope.currentcontext.BillDiscountId = -1;
                $scope.currentcontext.RdoBillDiscountMode = true;
            }
            $scope.CalculateNetAmt();
        };

        $scope.BillDiscountModechange = function (selecteditem) {
            var LastIndex = $scope.PatientBillDetails.length - 1;
            if (selecteditem.Id > 0) {
                for (var idx in $scope.PatientBillDetails) {
                    $scope.PatientBillDetails[idx].RdoDiscountMode = true;
                    $scope.PatientBillDetails[idx].RdoDiscount = true;
                    $scope.PatientBillDetails[idx].DiscountModeId = -1;
                    $scope.PatientBillDetails[idx].DiscountAmount = 0;
                    $scope.ItemwiseDiscountModechange($scope.PatientBillDetails[idx]);
                }
            } else {
                for (var idx in $scope.PatientBillDetails) {
                    if (idx != LastIndex) {
                        $scope.PatientBillDetails[idx].RdoDiscountMode = false;
                        $scope.PatientBillDetails[idx].RdoDiscount = false;
                    }
                }
            }
            $scope.CalculateNetAmt();
        };

        $scope.doctorChange = function () {
            if ($scope.item.DoctorId) {
                var doctorObj = utl.Lookup.getObject($scope.lookup.Doctor, $scope.item.DoctorId);
                for (var idx in $scope.lookup.Department) {
                    if ($scope.lookup.Department[idx].Id == doctorObj.DepartmentId) {
                        if ($scope.currentcontext.selecteddept.indexOf($scope.lookup.Department[idx]) == -1) {
                            $scope.currentcontext.selecteddept.push($scope.lookup.Department[idx]);
                        }
                    }
                }
                if ($scope.currentcontext.selecteddept.length > 0)
                    $scope.item.DepartmentId = $scope.currentcontext.selecteddept[0].Id;
            }
        };

        $scope.onDoctorSelected = function (data) {
            $scope.currentcontext.selecteddept = [];
            $scope.getdepartment();
        };

        $scope.getdeptCallback = function (scope, data, options, hasError) {
            $scope.item.map = data;
            var dept = [];
            for (var idx in data) {
                dept.push(data[idx])
                for (var iddx in $scope.lookup.Department) {
                    if ($scope.lookup.Department[iddx].Id == dept[idx].DepartmentId)
                        $scope.currentcontext.selecteddept.push($scope.lookup.Department[iddx]);
                }
            }
            $scope.doctorChange();
        };

        $scope.getdepartment = function (pageNo) {
            var inputData = {
                Params: [{
                    Key: 0,
                    Value: $scope.item.DoctorId
                }]
            };
            var options = {
                action: 'SystemSettings/User/GetDepartments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getdeptCallback
            };
            utl.Http.doAction(options);
        };

        $scope.applyVisibilityRules = function () {
            // Draft
            if ($scope.item.PatientBillStatusId == 1) {
                $scope.canShowSaveBtn = true;
                $scope.canShowPrescribeBtn = true;
                $scope.canShowPrescribeOrderBtn = true;
                $scope.canShowClearBtn = true;
                $scope.canShowCancelBtn = false;
                $scope.HidePrintBtn = true;
                $scope.canShowSaveapproveBtn = true;
                $scope.canShowViewReceipt = false;
                $scope.canShowPrintheader = false;
            }
            // Bill Completed
            if ($scope.item.PatientBillStatusId == 2) {
                $scope.canShowSaveBtn = false;
                $scope.canShowPrescribeBtn = false;
                $scope.canShowPrescribeOrderBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowSaveapproveBtn = false;
                $scope.canShowCancelBtn = false;
                //$scope.canShowCancelBtn = false;
                $scope.HidePrintBtn = false;
                $scope.canShowViewReceipt = true;
                $scope.canShowPrintheader = true;
            }
            // Bill Cancelled
            if ($scope.item.PatientBillStatusId == 3) {
                $scope.canShowSaveBtn = false;
                $scope.canShowPrescribeBtn = false;
                $scope.canShowPrescribeOrderBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowSaveapproveBtn = false;
                $scope.canShowCancelBtn = true;
                $scope.HidePrintBtn = false;
                $scope.canShowViewReceipt = true;
                $scope.canShowPrintheader = true;
            }
            if ($scope.PatientBillInfo.length > 0 && $scope.PatientBillInfo[0].OutStandingAmount > 0 &&
                $scope.item.PatientBillStatusId != 2) {
                $scope.canShowSaveapproveBtn = true;
                $scope.RdoPaymentTypeId = true;
                $scope.item.BillWithComeReceipt = true;
            } else if ($scope.PatientBillInfo.length > 0 && $scope.PatientBillInfo[0].OutStandingAmount == 0) {
                $scope.canShowSaveapproveBtn = false;
                $scope.RdoPaymentTypeId = false;
                $scope.item.BillWithComeReceipt = false;
            }
            $scope.currentcontext.RdoGuarantorDue = $scope.item.PatientBillStatusId != 1 ? true : false;
        };

        $scope.AddPaymentDetails = function () {
            if ($scope.currentcontext.PendingAmt == null) {
                $scope.currentcontext.PendingAmt = $scope.currentcontext.TotNetAmount;
            }
            var PatientPaymentDetail = {
                Id: 0,
                ReceiptDateTime: utl.Formatter.getCurrentDate(),
                FacilityId: $scope.item.FacilityId,
                OrganizationId: $scope.item.OrganizationId,
                PatientId: $scope.item.PatientId,
                ReceiptTypeId: $scope.currentcontext.ReceiptTypeId,
                EncounterId: $scope.item.EncounterId,
                EncounterTypeId: vm.Context == 'OP' ? 1 : 4,
                PatientName: $scope.item.PatientName,
                OutStandingAmount: $scope.currentcontext.PendingAmt,
                AmountPaid: parseFloat($scope.currentcontext.ReceiptAmt),
                DueAmount: $scope.currentcontext.PendingAmt - parseFloat($scope.currentcontext.ReceiptAmt),
                DepartmentID: $scope.item.DepartmentId,
                PaymentcounterID: 0,
                GuarantorId: $scope.currentfilter.GuarantorId,
                GuarantorTypeId: $scope.currentfilter.GuarantorTypeId,
                ReceiptGeneratedById: $scope.item.ReceiptGeneratedById,
                ReceiptApprovedById: $scope.currentcontext.ApprovedById,
                PaymentTypeId: $scope.currentcontext.PaymentTypeId,
                DoctorId: $scope.item.DoctorId,
                ServiceId: $scope.currentfilter.ServiceRateCategoryId,
                ServiceName: $scope.currentfilter.ServiceRateCategoryName,
                PatientBillId: null,
                CardHolderName: null,
                AuthorizedCode: $scope.item.AuthorizeNumber,
                GurantorName: $scope.currentfilter.GuarantorName,
                Comments: $scope.item.Remarks,
                CancelReason: null,
                ReceiptStatusId: $scope.currentcontext.ReceiptStatusId,
                TDSAmount: 0.00,
                Disallowance: 0.00,
                RoundOffValue: null,
                CreditNoteId: null,
                PaymentStatusId: 3,
                CollectedOn: utl.Formatter.getCurrentDate(),
                CardNumber: '',
                CardDateTime: null,
                CardExpiryDate: null,
                TerminalNoId: $scope.item.TerminalNoId,
                BankId: $scope.currentcontext.PaymentTypeId != 1 ? $scope.item.BankId : -1,
                CardTypeId: $scope.currentcontext.PaymentTypeId == 5 || $scope.currentcontext.PaymentTypeId == 6 ? $scope.item.CardTypeId : -1,
                ChequeNo: $scope.currentcontext.PaymentTypeId == 2 ? $scope.item.ChequeNo : '',
                ChequeDate: $scope.currentcontext.PaymentTypeId == 2 ? (!$scope.item.ChequeDate ? null : $scope.item.ChequeDate) : null,
                DDNumber: $scope.currentcontext.PaymentTypeId == 3 ? (!$scope.item.DDNumber) ? null : $scope.item.DDNumber : null,
                DDDate: $scope.currentcontext.PaymentTypeId == 3 ? (!$scope.item.DDDate) ? null : $scope.item.DDDate : null,
                WireTransferId: $scope.currentcontext.PaymentTypeId == 4 ? $scope.item.WireTransferId : null,
                WireTransferDate: $scope.currentcontext.PaymentTypeId == 4 ? (!$scope.item.WireTransferDate) ? null : $scope.item.WireTransferDate : null,
            }
            if ($scope.currentcontext.id > 0) {
                PatientPaymentDetail.PatientBillId = $scope.currentcontext.id;
            }
            $scope.PatientPaymentDetails.push(PatientPaymentDetail);
        };

        $scope.setIndexforTableIndex = function () {
            var SNo = 1;
            for (var idx in $scope.PatientBillDetails) {
                if ($scope.PatientBillDetails[idx].Status == 1) {
                    $scope.PatientBillDetails[idx].SNo = SNo;
                    $scope.PatientBillDetails[idx].itemidxdesc = 'desc' + (SNo - 1);
                    $scope.PatientBillDetails[idx].itemidxqty = 'qty' + (SNo - 1);
                    SNo++;
                }
            }
        };

        $scope.addNewLineItem = function () {

            var lastIndex = $scope.PatientBillDetails.length - 1;
            if (lastIndex >= 0) {
                if ($scope.PatientBillDetails[lastIndex].ServiceId == -1)
                    return false;
            }
            var PatientBillDetails = {
                RdoDiscountMode: true, // disable discount mode
                RdoDiscount: true, // disable discount
                Id: 0,
                ServiceId: -1,
                ServiceCode: '',
                ServiceName: '',
                RequestDate: null,
                TestId: -1,
                TestCode: '',
                TestName: '',
                TestTypeId: -1,
                itemidxdesc: null,
                TestDescription: '',
                DepartmentId: -1,
                SubDepartmentId: -1,
                BillDateTime: utl.Formatter.getCurrentDate(),
                IsPackage: false,
                ServiceTypeId: -1,
                Quantity: 1,
                Rate: 0,
                Amount: 0.00,
                ProportionateDiscount: 0,
                DiscountAmount: 0,
                DiscountModeId: -1,
                CanDiscountProportionate: 0,
                GSTAmount: 0,
                TaxCode: 'ES',
                NetAmount: 0.00,
                DiscountTypeId: -1,
                IsOrderable: 0,
                ServiceCategoryId: 0,
                MasterTypeId: -1,
                MasterItemId: -1,
                MasterName: '',
                Status: 1,
                RdoServiceId: false,
                AliasId: null,
                AliasName: null,
            };

            if ($scope.currentcontext.id > 0) {
                PatientBillDetails.PatientBillId = $scope.currentcontext.id;
            }

            $scope.PatientBillDetails.push(PatientBillDetails);

            $scope.setIndexforTableIndex();

            $scope.SelectedIndex = $scope.PatientBillDetails.length;

        };

        $scope.addnewbill = function () {
            utl.Modal.openFixedDialog('app.opbillinginfo-form', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.saveItemwiseCancelled = function () {
            if (vm.Context == 'OP' && $scope.dgbillnosaveoption == 1) {
                utl.Alert.showErrorMsg('DG Bill Itemwise Cancel Option not possible In OP Billing Screen.');
                return false;
            }

            utl.Modal.openFixedDialog('app.itemwiseopbillcancel', {
                params: {
                    id: $scope.currentcontext.id
                },
                confirmCallback: patientBillPickerCallback
            });
        };

        $scope.getOrderDetailsCallback = function (scope, res, options, hasError) {
            var orders = [];
            var orderdetails = [];
            if (options.conditionid) {
                for (var idx in res.Data) {
                    var orders = res.Data[idx];
                    if (orders.PatientId == $scope.item.PatientId) {
                        for (var iddx in orders.PatientOrderDetails) {
                            var orderdetails = orders.PatientOrderDetails[iddx];
                            if (orderdetails.TestId == options.conditionid) {
                                utl.Alert.showErrorMsg($translate.instant('Item Already Ordered'));
                            }
                        }
                    }
                }
            }
        };

        $scope.getOrderInfoDetails = function (testdata) {
            var FromDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00');
            var ToDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59');
            if ($scope.item.PatientId) {
                var inputData = {
                    Params: [{
                            Key: 12,
                            Value: FromDate
                        },
                        {
                            Key: 13,
                            Value: ToDate
                        },
                        {
                            Key: 2,
                            Value: $scope.item.PatientId
                        },
                    ],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'emr/patientorder/GetPatientOrders',
                    data: inputData,
                    conditionid: testdata.MasterItemId,
                    type: 'post',
                    onComplete: $scope.getOrderDetailsCallback
                };
                utl.Http.doAction(options);
            }
        };


        $scope.ServiceItemChanged = function (idx, selectedItem) {
            var SelectedMasterItem = null;
            var stockserialitems = null;
            var serialitem = [];
            var batid = 0;
            if (selectedItem.IsThisPrescription) {
                SelectedMasterItem = selectedItem.SelectedItem;
                selectedItem.ItemMasterId = SelectedMasterItem.ItemMasterId;
                selectedItem.ItemCode = SelectedMasterItem.ItemCode;
                selectedItem.ItemName = SelectedMasterItem.ItemName;
                selectedItem.StoreMasterId = SelectedMasterItem.StoreMasterId;
                selectedItem.RST = '';
                selectedItem.RackId = SelectedMasterItem.RackId || 0;
                selectedItem.RackName = SelectedMasterItem.RackName || '';
                selectedItem.Shelf = SelectedMasterItem.Self || '';
                selectedItem.Tray = SelectedMasterItem.Tray || '';
                selectedItem.DiscountModeId = 2;
                selectedItem.Discount = 0;
                if (SelectedMasterItem.RackName) {
                    selectedItem.RST = SelectedMasterItem.RackName;
                }
                if (SelectedMasterItem.Self) {
                    selectedItem.RST = selectedItem.RST + ' / ' + SelectedMasterItem.Self;
                }
                if (SelectedMasterItem.Tray) {
                    selectedItem.RST = selectedItem.RST + ' / ' + SelectedMasterItem.Tray;
                }
                selectedItem.IsNonClaimable = SelectedMasterItem.IsNonClaimable;
                if (SelectedMasterItem.GenericMaster) {
                    selectedItem.GenericId = SelectedMasterItem.GenericId;
                    selectedItem.GenericName = SelectedMasterItem.GenericMaster.GenericName;
                }
                if (SelectedMasterItem.Manufacturer) {
                    selectedItem.ManufacturerId = SelectedMasterItem.ManufacturerId;
                    selectedItem.ManufacturerName = SelectedMasterItem.Manufacturer.VendorName;
                }
                if (SelectedMasterItem.ScheduleType) {
                    selectedItem.ScheduleTypeId = SelectedMasterItem.ScheduleTypeId;
                    selectedItem.ScheduleTypeDescription = SelectedMasterItem.ScheduleType.Description;
                }
                if (SelectedMasterItem.SubCategoryId == 1) {
                    selectedItem.SubCategoryId = 1;
                    selectedItem.ServiceTypeId = 0;
                    selectedItem.ServiceGroupId = $scope.item.DrugServiceGroupId;
                    selectedItem.ServiceCategoryId = $scope.item.DrugServiceCategoryId;
                    selectedItem.MasterName = SelectedMasterItem.DrugName;
                    selectedItem.MasterItemId = SelectedMasterItem.DrugId;
                    selectedItem.DrugName = SelectedMasterItem.DrugName;
                    selectedItem.DrugId = SelectedMasterItem.DrugId;
                    selectedItem.MasterTypeId = SelectedMasterItem.SubCategoryId;
                } else if (SelectedMasterItem.SubCategoryId == 2) {
                    selectedItem.SubCategoryId = 2;
                    selectedItem.ServiceTypeId = 0;
                    selectedItem.ServiceGroupId = $scope.item.NonDrugServiceGroupId;
                    selectedItem.ServiceCategoryId = $scope.item.NonDrugServiceCategoryId;
                    selectedItem.MasterName = SelectedMasterItem.DrugName;
                    selectedItem.MasterItemId = SelectedMasterItem.DrugId;
                    selectedItem.DrugName = SelectedMasterItem.DrugName;
                    selectedItem.DrugId = SelectedMasterItem.DrugId;
                    selectedItem.MasterTypeId = SelectedMasterItem.SubCategoryId;
                } else {
                    selectedItem.SubCategoryId = 0;
                    selectedItem.ServiceTypeId = 0;
                    selectedItem.ServiceGroupId = 0;
                    selectedItem.ServiceCategoryId = 0;
                    selectedItem.MasterName = '';
                    selectedItem.MasterItemId = 0;
                    selectedItem.DrugName = 0;
                    selectedItem.DrugId = 0;
                    selectedItem.MasterTypeId = 0;
                }

                if (SelectedMasterItem.StockItem &&
                    SelectedMasterItem.StockItem.StockSerialItems.length > 0) {
                    selectedItem.MinQty = SelectedMasterItem.MinQty;
                    selectedItem.TotalQuantity = SelectedMasterItem.StockItem.Quantity;
                    selectedItem.MaxQty = SelectedMasterItem.MaxQty;
                    if (selectedItem.TotalQuantity <= selectedItem.MinQty) {
                        selectedItem.IsFallUnderMinQty = true;
                    }
                    selectedItem.StockItemRev = SelectedMasterItem.StockItem.Rev;
                    stockserialitems = SelectedMasterItem.StockItem.StockSerialItems;
                    for (batid = 0; batid < stockserialitems.length; batid++) {
                        serialitem = stockserialitems[batid];
                        if (serialitem.Quantity > 0) {
                            selectedItem.BatchDetails.push(serialitem);
                        }
                    }

                    $scope.ChooseBatches(idx, selectedItem);
                    if ($scope.separatePaymentCounter == 1) {
                        $scope.IsSeparatePharmacyCounter();
                    } else {
                        $scope.updateReceiptAmt();
                    }
                }
            } else {
                if (selectedItem.SelectedItem.StockInHand <= 0) {
                    utl.Alert.showErrorMsg('Stock Not Available');
                    selectedItem.BatchQuantity = 0;
                    selectedItem.TotalQuantity = 0;
                    selectedItem.Quantity = 0;
                    selectedItem.ExpiryDate = '';
                    selectedItem.MrPrice = 0.00;
                    selectedItem.GSTPercentage = 0.00;
                    selectedItem.DiscountAmount = 0;
                    selectedItem.DiscountAmount = 0.00;
                    selectedItem.SelectedBatchId = -1;
                    selectedItem.BatchDetails = [];
                } else {
                    SelectedMasterItem = selectedItem.SelectedItem;
                    selectedItem.IsThisPrescription = false;
                    selectedItem.ItemMasterId = SelectedMasterItem.ItemMasterId;
                    selectedItem.ItemCode = SelectedMasterItem.ItemCode;
                    selectedItem.ItemName = SelectedMasterItem.ItemName;
                    selectedItem.StoreMasterId = SelectedMasterItem.StoreMasterId;
                    selectedItem.GenericId = SelectedMasterItem.ItemMaster.GenericId;
                    selectedItem.GenericName = SelectedMasterItem.ItemMaster.GenericName;
                    selectedItem.IsMultiUse = SelectedMasterItem.ItemMaster.IsMultiUse;
                    selectedItem.NoOfTransactions = SelectedMasterItem.ItemMaster.NoOfTransactions;
                    selectedItem.RST = '';
                    selectedItem.RackId = SelectedMasterItem.RackId || 0;
                    selectedItem.RackName = SelectedMasterItem.RackName || '';
                    selectedItem.Shelf = SelectedMasterItem.Self || '';
                    selectedItem.Tray = SelectedMasterItem.Tray || '';
                    if (SelectedMasterItem.RackName) {
                        selectedItem.RST = SelectedMasterItem.RackName;
                    }
                    if (SelectedMasterItem.Self) {
                        selectedItem.RST = selectedItem.RST + ' / ' + SelectedMasterItem.Self;
                    }
                    if (SelectedMasterItem.Tray) {
                        selectedItem.RST = selectedItem.RST + ' / ' + SelectedMasterItem.Tray;
                    }
                    selectedItem.AllowStaffDiscount = SelectedMasterItem.ItemMaster.AllowStaffDiscount;
                    selectedItem.IsNonClaimable = SelectedMasterItem.ItemMaster.IsNonClaimable;
                    selectedItem.ManufacturerId = SelectedMasterItem.ItemMaster.ManufacturerId;
                    selectedItem.ManufacturerName = SelectedMasterItem.ItemMaster.ManufacturerName;
                    selectedItem.ScheduleTypeId = SelectedMasterItem.ItemMaster.ScheduleTypeId;
                    selectedItem.DiscountModeId = SelectedMasterItem.ItemMaster.DiscountModeId || 2;
                    selectedItem.Discount = SelectedMasterItem.ItemMaster.Discount || 0;
                    if (SelectedMasterItem.ItemMaster.ScheduleType) {
                        selectedItem.ScheduleTypeDescription = SelectedMasterItem.ItemMaster.ScheduleType.Description;
                    }
                    if (SelectedMasterItem.ItemMaster.GenericMaster) {
                        selectedItem.IsPrescribed = SelectedMasterItem.ItemMaster.GenericMaster.IsPrescribed;
                    }
                    if (SelectedMasterItem.ItemMaster.SubCategoryId == 1) {
                        selectedItem.SubCategoryId = 1;
                        selectedItem.ServiceTypeId = 0;
                        selectedItem.ServiceGroupId = $scope.item.DrugServiceGroupId;
                        selectedItem.ServiceCategoryId = $scope.item.DrugServiceCategoryId;
                        selectedItem.MasterName = SelectedMasterItem.ItemMaster.DrugName;
                        selectedItem.MasterItemId = SelectedMasterItem.ItemMaster.DrugId;
                        selectedItem.DrugName = SelectedMasterItem.ItemMaster.DrugName;
                        selectedItem.DrugId = SelectedMasterItem.ItemMaster.DrugId;
                        selectedItem.MasterTypeId = SelectedMasterItem.ItemMaster.SubCategoryId;
                    } else if (SelectedMasterItem.ItemMaster.SubCategoryId == 2) {
                        selectedItem.SubCategoryId = 2;
                        selectedItem.ServiceTypeId = 0;
                        selectedItem.ServiceGroupId = $scope.item.NonDrugServiceGroupId;
                        selectedItem.ServiceCategoryId = $scope.item.NonDrugServiceCategoryId;
                        selectedItem.MasterName = SelectedMasterItem.ItemMaster.DrugName;
                        selectedItem.MasterItemId = SelectedMasterItem.ItemMaster.DrugId;
                        selectedItem.DrugName = SelectedMasterItem.ItemMaster.DrugName;
                        selectedItem.DrugId = SelectedMasterItem.ItemMaster.DrugId;
                        selectedItem.MasterTypeId = SelectedMasterItem.ItemMaster.SubCategoryId;
                    } else {
                        selectedItem.SubCategoryId = 0;
                        selectedItem.ServiceTypeId = 0;
                        selectedItem.ServiceGroupId = 0;
                        selectedItem.ServiceCategoryId = 0;
                        selectedItem.MasterName = '';
                        selectedItem.MasterItemId = 0;
                        selectedItem.DrugName = 0;
                        selectedItem.DrugId = 0;
                        selectedItem.MasterTypeId = 0;
                    }

                    selectedItem.BatchDetails = [];
                    selectedItem.BatchDetail = {};
                    selectedItem.BatchId = '';
                    selectedItem.SelectedBatchId = '';
                    selectedItem.ExpiryDate = '';
                    selectedItem.BatchQuantity = 0;
                    selectedItem.Quantity = 0;
                    selectedItem.MrPrice = 0.00;
                    selectedItem.Amount = 0.00;
                    selectedItem.GrossAmount = 0.00;
                    selectedItem.UnitDiscountAmount = 0.00;
                    selectedItem.DiscountAmount = 0.00;
                    selectedItem.GSTPercentage = 0.00;
                    selectedItem.GSTAmount = 0.00;
                    selectedItem.InGstPercentage = 0.00;
                    selectedItem.InGstAmount = 0.00;
                    selectedItem.CGstPercentage = 0.00;
                    selectedItem.CGstAmount = 0.00;
                    selectedItem.SGstPercentage = 0.00;
                    selectedItem.SGstAmount = 0.00;
                    selectedItem.NetAmount = 0.00;

                    if (SelectedMasterItem.ItemMaster.StockItem &&
                        SelectedMasterItem.ItemMaster.StockItem.StockSerialItems.length > 0) {
                        var SumOfSerialQuantity = 0;
                        stockserialitems = SelectedMasterItem.ItemMaster.StockItem.StockSerialItems;
                        for (batid = 0; batid < stockserialitems.length; batid++) {
                            serialitem = stockserialitems[batid];
                            if (serialitem.Quantity > 0) {
                                if (serialitem.IsMultiUse) {
                                    var SumOfQty = parseInt(serialitem.PendingTransactions);
                                    SumOfSerialQuantity = SumOfSerialQuantity + serialitem.Quantity
                                } else {
                                    SumOfSerialQuantity = SumOfSerialQuantity + serialitem.Quantity;
                                }
                                selectedItem.BatchDetails.push(serialitem);
                            }
                        }

                        selectedItem.MinQty = SelectedMasterItem.MinQty;
                        selectedItem.SumOfQty = SumOfQty;
                        selectedItem.TotalQuantity = SumOfSerialQuantity;
                        selectedItem.MaxQty = SelectedMasterItem.MaxQty;
                        if (selectedItem.TotalQuantity <= selectedItem.MinQty) {
                            selectedItem.IsFallUnderMinQty = true;
                        }
                        selectedItem.StockItemRev = SelectedMasterItem.ItemMaster.StockItem.Rev;
                    }
                }
            }
        };

        $scope.CleanItemBatches = function (item) {
            for (var count = 0; count < $scope.PatientBillDetails.length; count++) {
                var cllitem = $scope.PatientBillDetails[count];
                if (cllitem.ItemMasterId == item.ItemMasterId) {
                    cllitem.Status = 2;
                    $scope.DeletedPatientBills.push(cllitem);
                    var index1 = $scope.PatientBillDetails.indexOf(cllitem);
                    $scope.PatientBillDetails.splice(index1, 1);
                    count = count - 1;
                }
            }

            for (var clsidx in $scope.PatientBillDetails) {
                var clsitem = $scope.PatientBillDetails[clsidx];
                if (clsitem.ServiceId == -1) {
                    clsitem.Status = 2;
                    $scope.DeletedPatientBills.push(clsitem);
                    var index2 = $scope.PatientBillDetails.indexOf(clsitem);
                    $scope.PatientBillDetails.splice(index2, 1);
                }
            }
        };

        $scope.ChooseBatches = function (idx, item) {
            var currentitem = item;
            var PatientBillDetail = {};
            var ExpiryDays = null;
            $scope.currentcontext.ReceiptAmt = 0;
            if (item.IsMultiUse) {
                var QtyCheck = (item.SumOfQty);
            } else {
                var QtyCheck = item.TotalQuantity;
            }
            if (item.Quantity > QtyCheck) {
                utl.Alert.showErrorMsg($translate.instant('billing.opbilling-list.stock.lbl'));
                item.Quantity = 0;
            } else if (item.Quantity === null || item.Quantity === 0) {
                /* utl.Alert.showErrorMsg('Quantity should be Greater Than Zero'); */
                /* item.Quantity = 0; */
            } else {
                $scope.CleanItemBatches(item);
                item.BatchDetails.sort($scope.custom_multi_sort);
                for (var batid = 0; batid < item.BatchDetails.length; batid++) {
                    if (item.Quantity > 0) {
                        if (item.BatchDetails[batid].Quantity >= item.Quantity) {
                            if (item.IsMultiUse) {
                                var Mrp = parseFloat((item.BatchDetails[batid].ConversionMrp).toFixed(2));
                            } else
                                var Mrp = parseFloat((item.BatchDetails[batid].Mrp).toFixed(2));

                            PatientBillDetail = {
                                Id: 0,
                                BillDateTime: utl.Formatter.getCurrentDate(),
                                ServiceId: item.ItemMasterId,
                                ServiceCode: item.ItemCode,
                                ServiceName: item.ItemName,
                                ItemMasterId: item.ItemMasterId,
                                ItemCode: item.ItemCode,
                                ItemName: item.ItemName,
                                AllowStaffDiscount: item.AllowStaffDiscount,
                                itemidxdesc: null,
                                ScheduleTypeId: item.ScheduleTypeId,
                                ScheduleTypeDescription: item.ScheduleTypeDescription,
                                StoreMasterId: item.StoreMasterId,
                                ItemTypeId: 0,
                                ServiceTypeId: 0,
                                ServiceGroupId: 0,
                                ServiceCategoryId: 0,
                                MasterName: '',
                                MasterItemId: 0,
                                EncounterId: 0,
                                PatientBillStatusId: 0,
                                MasterTypeId: 0,
                                StockSerialItemId: item.BatchDetails[batid].Id,
                                StockSerialItemRev: item.BatchDetails[batid].Rev,
                                StockItemId: item.BatchDetails[batid].StockItemId,
                                Quantity: item.Quantity,
                                itemidxqty: null,
                                BatchQuantity: item.BatchDetails[batid].Quantity,
                                MinQty: item.MinQty,
                                TotalQuantity: item.TotalQuantity,
                                MaxQty: item.MaxQty,
                                Batch: true,
                                BatchId: item.BatchDetails[batid].BatchId,
                                SelectedBatchId: item.BatchDetails[batid].BatchId,
                                ExpiryDate: null,
                                ExpiryAlert: false,
                                ExpiryStop: false,
                                ExpiryProceed: false,
                                Ucp: parseFloat((item.BatchDetails[batid].Ucp).toFixed(2)),
                                Mrp: Mrp,
                                Rate: Mrp,
                                Amount: 0.00,
                                GrossAmount: 0.00,
                                GrossGSTAmount: 0.00,
                                DiscountPercentage: 0.00,
                                UnitDiscountAmount: 0.00,
                                DiscountAmount: 0.00,
                                UnitProportionateDiscount: 0.00,
                                ProportionateDiscount: 0.00,
                                DoctorDiscountAmount: 0.00,
                                EducationCess: 0.00,
                                NetAmountBeforeGST: 0.00,
                                NetAmount: 0.00,
                                TaxCode: '',
                                DoctorId: 0,
                                DoctorName: '',
                                IsPrescribed: false,
                                IsPackageItem: 0,
                                PackageId: 0,
                                PackageName: '',
                                OrderId: 0,
                                OrderDetailId: 0,
                                OrderTypeId: 0,
                                OrderDateTime: null,
                                ServiceRateCategoryId: 0,
                                ServiceRateCategoryName: '',
                                IsModified: 0,
                                IsSupplimentary: 0,
                                IsBillable: 0,
                                IsPharmacySale: 1,
                                IsDoctorDiscount: 0,
                                IsGstDoctor: 0,
                                StartDateTime: null,
                                EndDateTime: null,
                                DiscountTypeId: 0,
                                DiscountModeId: item.DiscountModeId,
                                Discount: parseFloat((item.Discount).toFixed(2)),
                                DiscountAuthorizedBy: 0,
                                DoctorShare: 0.00,
                                ReferalShare: 0.00,
                                CNAmount: 0.00,
                                CancelReason: 0,
                                CancelledBy: 0,
                                Comments: '',
                                DepartmentId: 0,
                                GenericId: item.GenericId,
                                GenericName: item.GenericName,
                                IsNonClaimable: item.IsNonClaimable,
                                RackId: item.RackId,
                                RackName: item.RackName,
                                Shelf: item.Shelf,
                                Tray: item.Tray,
                                RST: item.RST,
                                VendorMasterId: item.BatchDetails[batid].VendorMasterId,
                                ManufacturerId: item.BatchDetails[batid].ManufacturerId,
                                ManufacturerName: item.ManufacturerName,
                                UnitCostPrice: parseFloat((item.BatchDetails[batid].Ucp).toFixed(2)),
                                MrPrice: Mrp,
                                UnitPrice: 0.00,
                                GSTId: item.BatchDetails[batid].GstId,
                                InGstId: item.BatchDetails[batid].InGstId,
                                CGstId: item.BatchDetails[batid].CGstId,
                                SGstId: item.BatchDetails[batid].SGstId,
                                GSTPercentage: item.BatchDetails[batid].GstPercentage,
                                InGstPercentage: item.BatchDetails[batid].InGstPercentage,
                                CGstPercentage: item.BatchDetails[batid].CGstPercentage,
                                SGstPercentage: item.BatchDetails[batid].SGstPercentage,
                                PurchaseUomId: item.BatchDetails[batid].PurchaseUomId,
                                BaseUomId: item.BatchDetails[batid].BaseUomId,
                                SaleUomId: item.BatchDetails[batid].SaleUomId,
                                GrnId: item.BatchDetails[batid].GrnId,
                                GrnDetailId: item.BatchDetails[batid].GrnDetailId,
                                StockEntryId: item.BatchDetails[batid].StockEntryId,
                                StockEntryDetailId: item.BatchDetails[batid].StockEntryDetailId,
                                UnitGSTAmount: 0.00,
                                UnitInGstAmount: 0.00,
                                UnitCGstAmount: 0.00,
                                UnitSGstAmount: 0.00,
                                GSTAmount: 0.00,
                                InGstAmount: 0.00,
                                CGstAmount: 0.00,
                                SGstAmount: 0.00,
                                RdoDiscountMode: true,
                                RdoDiscount: true,
                                PrescriptionDetailId: 0,
                                IsThisPrescription: item.IsThisPrescription,
                                Status: 1,
                                IsMultiUse: item.BatchDetails[batid].IsMultiUse,
                                // NoOfTransactions: ItemMasterData.NoOfTransactions,
                                ConsumedTransactions: (parseFloat(item.BatchDetails[batid].ConsumedTransactions)) + parseFloat(item.Quantity),
                                TotalTransactions: item.BatchDetails[batid].TotalTransactions,
                                PendingTransactions: (parseFloat(item.BatchDetails[batid].PendingTransactions)) - (parseFloat(item.Quantity)),
                                // ItemPossibleTransactions: ItemMasterData.NoOfTransactions,
                                ConsumedPerTransactions: item.Quantity
                            };

                            if (item.SelectedItem) {
                                if (item.SelectedItem.ItemMaster) {
                                    var ItemMasterData = item.SelectedItem.ItemMaster;
                                    PatientBillDetail.NoOfTransactions = ItemMasterData.NoOfTransactions;
                                    PatientBillDetail.ItemPossibleTransactions = ItemMasterData.NoOfTransactions;
                                }
                            }

                            ExpiryDays = GetExpiryDays(item.BatchDetails[batid].ExpiryDate);
                            if (ExpiryDays <= $scope.currentfilter.ExpiryPriorStopDays) {
                                PatientBillDetail.ExpiryStop = true;
                            } else if (ExpiryDays > $scope.currentfilter.ExpiryPriorStopDays && ExpiryDays <= $scope.currentfilter.ExpiryWarningDays) {
                                PatientBillDetail.ExpiryAlert = true;
                            } else {
                                PatientBillDetail.ExpiryProceed = true;
                            }

                            if (PatientBillDetail.ExpiryAlert) {
                                PatientBillDetail.ExpiryDate = null;
                                PatientBillDetail.ExpiryAlert = true;
                                PatientBillDetail.ExpiryDate = item.BatchDetails[batid].ExpiryDate;
                            } else if (PatientBillDetail.ExpiryStop) {
                                PatientBillDetail.ExpiryDate = null;
                                PatientBillDetail.ExpiryStop = true;
                                PatientBillDetail.ExpiryDate = item.BatchDetails[batid].ExpiryDate;
                            } else {
                                PatientBillDetail.ExpiryDate = null;
                                PatientBillDetail.ExpiryProceed = true;
                                PatientBillDetail.ExpiryDate = item.BatchDetails[batid].ExpiryDate;
                            }

                            if (PatientBillDetail.TotalQuantity <= PatientBillDetail.MinQty) {
                                PatientBillDetail.IsFallUnderMinQty = true;
                            } else {
                                PatientBillDetail.IsFallUnderMinQty = false;
                            }

                            PatientBillDetail.IsPrescribed = item.IsPrescribed;
                            if ($scope.item.StaffCheck) {
                                if (PatientBillDetail.AllowStaffDiscount) {
                                    if ($scope.item.StaffDiscountTypeId === 2) {
                                        PatientBillDetail.DiscountPercentage = $scope.item.StaffDiscountPercentage;
                                        PatientBillDetail.DiscountAmount = $scope.item.StaffDiscountPercentage;

                                        PatientBillDetail.UnitPrice = parseFloat(((PatientBillDetail.MrPrice * 100) / (100 + PatientBillDetail.GSTPercentage)).toFixed(2));
                                        PatientBillDetail.UnitDiscountAmount = parseFloat(($scope.item.StaffDiscountPercentage / 100 * PatientBillDetail.UnitPrice).toFixed(2));
                                        PatientBillDetail.UnitPrice = PatientBillDetail.UnitPrice - parseFloat(PatientBillDetail.UnitDiscountAmount);

                                        PatientBillDetail.UnitGSTAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.GSTPercentage).toFixed(2));
                                        PatientBillDetail.UnitInGstAmount = 0;
                                        PatientBillDetail.UnitCGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                                        PatientBillDetail.UnitSGstAmount = PatientBillDetail.UnitGSTAmount / 2;

                                        PatientBillDetail.Rate = PatientBillDetail.UnitPrice + parseFloat(PatientBillDetail.UnitGSTAmount);
                                    } else {
                                        PatientBillDetail.DiscountPercentage = $scope.item.StaffDiscountPercentage;
                                        PatientBillDetail.DiscountAmount = $scope.item.StaffDiscountPercentage;

                                        PatientBillDetail.MrPrice = PatientBillDetail.UnitCostPrice;
                                        PatientBillDetail.UnitPrice = parseFloat(((PatientBillDetail.UnitCostPrice * 100) / (100 + PatientBillDetail.GSTPercentage)).toFixed(2));
                                        PatientBillDetail.UnitDiscountAmount = parseFloat(($scope.item.StaffDiscountPercentage / 100 * PatientBillDetail.UnitPrice).toFixed(2));
                                        PatientBillDetail.UnitPrice = PatientBillDetail.UnitPrice - parseFloat(PatientBillDetail.UnitDiscountAmount);

                                        PatientBillDetail.UnitGSTAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.GSTPercentage).toFixed(2));
                                        PatientBillDetail.UnitInGstAmount = 0;
                                        PatientBillDetail.UnitCGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                                        PatientBillDetail.UnitSGstAmount = PatientBillDetail.UnitGSTAmount / 2;

                                        PatientBillDetail.Rate = PatientBillDetail.UnitPrice + parseFloat(PatientBillDetail.UnitGSTAmount);
                                    }
                                } else {
                                    PatientBillDetail.DiscountPercentage = 0;
                                    PatientBillDetail.DiscountAmount = 0;
                                    PatientBillDetail.UnitDiscountAmount = 0;
                                    PatientBillDetail.UnitPrice = parseFloat(((PatientBillDetail.MrPrice * 100) / (100 + PatientBillDetail.GSTPercentage)).toFixed(2));
                                    PatientBillDetail.UnitGSTAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.GSTPercentage).toFixed(2));
                                    PatientBillDetail.UnitInGstAmount = 0;
                                    PatientBillDetail.UnitCGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                                    PatientBillDetail.UnitSGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                                    PatientBillDetail.Rate = PatientBillDetail.MrPrice;
                                }
                            } else {
                                if (item.DiscountModeId == 2 && item.Discount > 0) {
                                    PatientBillDetail.DiscountPercentage = item.Discount;
                                    PatientBillDetail.DiscountAmount = item.Discount;

                                    PatientBillDetail.UnitPrice = parseFloat(((PatientBillDetail.MrPrice * 100) / (100 + PatientBillDetail.GSTPercentage)).toFixed(2));
                                    PatientBillDetail.UnitDiscountAmount = parseFloat((item.Discount / 100 * PatientBillDetail.UnitPrice).toFixed(2));
                                    PatientBillDetail.UnitPrice = PatientBillDetail.UnitPrice - parseFloat(PatientBillDetail.UnitDiscountAmount);

                                    PatientBillDetail.UnitGSTAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.GSTPercentage).toFixed(2));
                                    PatientBillDetail.UnitInGstAmount = 0;
                                    PatientBillDetail.UnitCGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                                    PatientBillDetail.UnitSGstAmount = PatientBillDetail.UnitGSTAmount / 2;

                                    PatientBillDetail.Rate = PatientBillDetail.UnitPrice + parseFloat(PatientBillDetail.UnitGSTAmount);
                                } else if (item.DiscountModeId == 1 && item.Discount > 0) {
                                    PatientBillDetail.DiscountPercentage = 0;
                                    PatientBillDetail.DiscountAmount = item.Discount;

                                    PatientBillDetail.UnitPrice = parseFloat(((PatientBillDetail.MrPrice * 100) / (100 + PatientBillDetail.GSTPercentage)).toFixed(2));
                                    PatientBillDetail.Rate = PatientBillDetail.UnitPrice - item.Discount;
                                    PatientBillDetail.UnitPrice = PatientBillDetail.UnitPrice - item.Discount;

                                    PatientBillDetail.UnitGSTAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.GSTPercentage).toFixed(2));
                                    PatientBillDetail.UnitInGstAmount = 0;
                                    PatientBillDetail.UnitCGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                                    PatientBillDetail.UnitSGstAmount = PatientBillDetail.UnitGSTAmount / 2;

                                    PatientBillDetail.Rate = PatientBillDetail.UnitPrice + parseFloat(PatientBillDetail.UnitGSTAmount);
                                } else {
                                    PatientBillDetail.UnitPrice = parseFloat(((PatientBillDetail.Rate * 100) / (100 + PatientBillDetail.GSTPercentage)).toFixed(2));

                                    PatientBillDetail.UnitGSTAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.GSTPercentage).toFixed(2));
                                    PatientBillDetail.UnitInGstAmount = 0;
                                    PatientBillDetail.UnitCGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                                    PatientBillDetail.UnitSGstAmount = PatientBillDetail.UnitGSTAmount / 2;

                                    PatientBillDetail.Rate = PatientBillDetail.MrPrice;
                                }
                            }
                            PatientBillDetail.Amount = parseFloat((PatientBillDetail.MrPrice * PatientBillDetail.Quantity).toFixed(2));
                            //PatientBillDetail.UnitPrice = parseFloat(((PatientBillDetail.Rate * 100) / (100 + PatientBillDetail.GSTPercentage)).toFixed(2));
                            //PatientBillDetail.UnitGSTAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.GSTPercentage).toFixed(2));
                            //PatientBillDetail.UnitInGstAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.InGstPercentage).toFixed(2));
                            //PatientBillDetail.UnitCGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                            //PatientBillDetail.UnitSGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                            //PatientBillDetail.UnitCGstAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.CGstPercentage).toFixed(2));
                            //PatientBillDetail.UnitSGstAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.SGstPercentage).toFixed(2));
                            PatientBillDetail.GSTAmount = parseFloat((PatientBillDetail.UnitGSTAmount * PatientBillDetail.Quantity).toFixed(2));
                            PatientBillDetail.InGstAmount = parseFloat((PatientBillDetail.UnitInGstAmount * PatientBillDetail.Quantity).toFixed(2));
                            PatientBillDetail.CGstAmount = PatientBillDetail.GSTAmount / 2;
                            PatientBillDetail.SGstAmount = PatientBillDetail.GSTAmount / 2;
                            //PatientBillDetail.CGstAmount = parseFloat((PatientBillDetail.UnitCGstAmount * PatientBillDetail.Quantity).toFixed(2));
                            //PatientBillDetail.SGstAmount = parseFloat((PatientBillDetail.UnitSGstAmount * PatientBillDetail.Quantity).toFixed(2));
                            PatientBillDetail.NetAmount = parseFloat((PatientBillDetail.Rate * PatientBillDetail.Quantity).toFixed(2));
                            PatientBillDetail.NetAmountBeforeGST = parseFloat((PatientBillDetail.NetAmount - PatientBillDetail.GSTAmount).toFixed(2));

                            if (item.SubCategoryId == 1) {
                                PatientBillDetail.SubCategoryId = 1;
                                PatientBillDetail.ServiceTypeId = 0;
                                PatientBillDetail.ServiceGroupId = $scope.item.DrugServiceGroupId;
                                PatientBillDetail.ServiceCategoryId = $scope.item.DrugServiceCategoryId;
                                PatientBillDetail.MasterName = item.DrugName;
                                PatientBillDetail.MasterItemId = item.DrugId;
                                PatientBillDetail.MasterTypeId = item.SubCategoryId;
                            } else if (item.SubCategoryId == 2) {
                                PatientBillDetail.SubCategoryId = 2;
                                PatientBillDetail.ServiceTypeId = 0;
                                PatientBillDetail.ServiceGroupId = $scope.item.NonDrugServiceGroupId;
                                PatientBillDetail.ServiceCategoryId = $scope.item.NonDrugServiceCategoryId;
                                PatientBillDetail.MasterName = item.DrugName;
                                PatientBillDetail.MasterItemId = item.DrugId;
                                PatientBillDetail.MasterTypeId = item.SubCategoryId;
                            } else {
                                PatientBillDetail.SubCategoryId = 0;
                                PatientBillDetail.ServiceTypeId = 0;
                                PatientBillDetail.ServiceGroupId = 0;
                                PatientBillDetail.ServiceCategoryId = 0;
                                PatientBillDetail.MasterName = '';
                                PatientBillDetail.MasterItemId = 0;
                                PatientBillDetail.MasterTypeId = 0;
                            }

                            PatientBillDetail.BatchDetails = item.BatchDetails;
                            $scope.PatientBillDetails.push(PatientBillDetail);
                            item.Quantity = 0;
                            $scope.currentcontext.BillDiscount = 0;
                            savehitcompleted = 0;
                        } else if (item.BatchDetails[batid].Quantity < item.Quantity) {
                            if (item.IsMultiUse) {
                                var Qty = item.Quantity;
                                var Mrp = parseFloat((item.BatchDetails[batid].ConversionMrp).toFixed(2));
                            } else {
                                var Qty = item.BatchDetails[batid].Quantity;
                                var Mrp = parseFloat((item.BatchDetails[batid].Mrp).toFixed(2));
                            }
                            PatientBillDetail = {
                                Id: 0,
                                BillDateTime: utl.Formatter.getCurrentDate(),
                                ServiceId: item.ItemMasterId,
                                ServiceCode: item.ItemCode,
                                ServiceName: item.ItemName,
                                ItemMasterId: item.ItemMasterId,
                                ItemCode: item.ItemCode,
                                ItemName: item.ItemName,
                                AllowStaffDiscount: item.AllowStaffDiscount,
                                itemidxdesc: null,
                                ScheduleTypeId: item.ScheduleTypeId,
                                ScheduleTypeDescription: item.ScheduleTypeDescription,
                                StoreMasterId: item.StoreMasterId,
                                ItemTypeId: 0,
                                ServiceTypeId: 0,
                                ServiceGroupId: 0,
                                ServiceCategoryId: 0,
                                MasterName: '',
                                MasterItemId: 0,
                                EncounterId: 0,
                                PatientBillStatusId: 0,
                                MasterTypeId: 0,
                                StockSerialItemId: item.BatchDetails[batid].Id,
                                StockSerialItemRev: item.BatchDetails[batid].Rev,
                                StockItemId: item.BatchDetails[batid].StockItemId,
                                Quantity: Qty,
                                itemidxqty: null,
                                BatchQuantity: item.BatchDetails[batid].Quantity,
                                MinQty: item.MinQty,
                                TotalQuantity: item.TotalQuantity,
                                MaxQty: item.MaxQty,
                                Batch: true,
                                BatchId: item.BatchDetails[batid].BatchId,
                                SelectedBatchId: item.BatchDetails[batid].BatchId,
                                ExpiryDate: null,
                                ExpiryAlert: false,
                                ExpiryStop: false,
                                ExpiryProceed: false,
                                Ucp: parseFloat((item.BatchDetails[batid].Ucp).toFixed(2)),
                                Mrp: Mrp,
                                Rate: Mrp,
                                Amount: 0.00,
                                GrossAmount: 0.00,
                                GrossGSTAmount: 0.00,
                                DiscountPercentage: 0.00,
                                UnitDiscountAmount: 0.00,
                                DiscountAmount: 0.00,
                                UnitProportionateDiscount: 0.00,
                                ProportionateDiscount: 0.00,
                                DoctorDiscountAmount: 0.00,
                                EducationCess: 0.00,
                                NetAmountBeforeGST: 0.00,
                                NetAmount: 0.00,
                                TaxCode: '',
                                DoctorId: 0,
                                DoctorName: '',
                                IsPrescribed: false,
                                IsPackageItem: 0,
                                PackageId: 0,
                                PackageName: '',
                                OrderId: 0,
                                OrderDetailId: 0,
                                OrderTypeId: 0,
                                OrderDateTime: null,
                                ServiceRateCategoryId: 0,
                                ServiceRateCategoryName: '',
                                IsModified: 0,
                                IsSupplimentary: 0,
                                IsBillable: 0,
                                IsPharmacySale: 1,
                                IsDoctorDiscount: 0,
                                IsGstDoctor: 0,
                                StartDateTime: null,
                                EndDateTime: null,
                                DiscountTypeId: 0,
                                DiscountModeId: item.DiscountModeId,
                                Discount: parseFloat((item.Discount).toFixed(2)),
                                DiscountAuthorizedBy: 0,
                                DoctorShare: 0.00,
                                ReferalShare: 0.00,
                                CNAmount: 0.00,
                                CancelReason: 0,
                                CancelledBy: 0,
                                Comments: '',
                                DepartmentId: 0,
                                GenericId: item.GenericId,
                                GenericName: item.GenericName,
                                IsNonClaimable: item.IsNonClaimable,
                                RackId: item.RackId,
                                RackName: item.RackName,
                                Shelf: item.Shelf,
                                Tray: item.Tray,
                                RST: item.RST,
                                VendorMasterId: item.BatchDetails[batid].VendorMasterId,
                                ManufacturerId: item.BatchDetails[batid].ManufacturerId,
                                ManufacturerName: item.ManufacturerName,
                                UnitCostPrice: parseFloat((item.BatchDetails[batid].Ucp).toFixed(2)),
                                MrPrice: Mrp,
                                UnitPrice: 0.00,
                                GSTId: item.BatchDetails[batid].GstId,
                                InGstId: item.BatchDetails[batid].InGstId,
                                CGstId: item.BatchDetails[batid].CGstId,
                                SGstId: item.BatchDetails[batid].SGstId,
                                GSTPercentage: item.BatchDetails[batid].GstPercentage,
                                InGstPercentage: item.BatchDetails[batid].InGstPercentage,
                                CGstPercentage: item.BatchDetails[batid].CGstPercentage,
                                SGstPercentage: item.BatchDetails[batid].SGstPercentage,
                                PurchaseUomId: item.BatchDetails[batid].PurchaseUomId,
                                BaseUomId: item.BatchDetails[batid].BaseUomId,
                                SaleUomId: item.BatchDetails[batid].SaleUomId,
                                GrnId: item.BatchDetails[batid].GrnId,
                                GrnDetailId: item.BatchDetails[batid].GrnDetailId,
                                StockEntryId: item.BatchDetails[batid].StockEntryId,
                                StockEntryDetailId: item.BatchDetails[batid].StockEntryDetailId,
                                UnitGSTAmount: 0.00,
                                UnitInGstAmount: 0.00,
                                UnitCGstAmount: 0.00,
                                UnitSGstAmount: 0.00,
                                GSTAmount: 0.00,
                                InGstAmount: 0.00,
                                CGstAmount: 0.00,
                                SGstAmount: 0.00,
                                RdoDiscountMode: true,
                                RdoDiscount: true,
                                PrescriptionDetailId: 0,
                                IsThisPrescription: item.IsThisPrescription,
                                Status: 1,
                                IsMultiUse: item.BatchDetails[batid].IsMultiUse,
                                // NoOfTransactions: ItemMasterData.NoOfTransactions,
                                ConsumedTransactions: (parseFloat(item.BatchDetails[batid].ConsumedTransactions)) + parseFloat(item.Quantity),
                                TotalTransactions: item.BatchDetails[batid].TotalTransactions,
                                PendingTransactions: (parseFloat(item.BatchDetails[batid].PendingTransactions)) - (parseFloat(item.Quantity)),
                                // ItemPossibleTransactions: ItemMasterData.NoOfTransactions,
                                ConsumedPerTransactions: item.Quantity
                            };

                            if (item.SelectedItem) {
                                if (item.SelectedItem.ItemMaster) {
                                    var ItemMasterData = item.SelectedItem.ItemMaster;
                                    PatientBillDetail.NoOfTransactions = ItemMasterData.NoOfTransactions;
                                    PatientBillDetail.ItemPossibleTransactions = ItemMasterData.NoOfTransactions;
                                }
                            }

                            ExpiryDays = GetExpiryDays(item.BatchDetails[batid].ExpiryDate);
                            if (ExpiryDays <= $scope.currentfilter.ExpiryPriorStopDays) {
                                PatientBillDetail.ExpiryStop = true;
                            } else if (ExpiryDays > $scope.currentfilter.ExpiryPriorStopDays && ExpiryDays <= $scope.currentfilter.ExpiryWarningDays) {
                                PatientBillDetail.ExpiryAlert = true;
                            } else {
                                PatientBillDetail.ExpiryProceed = true;
                            }

                            if (PatientBillDetail.ExpiryAlert) {
                                PatientBillDetail.ExpiryDate = null;
                                PatientBillDetail.ExpiryAlert = true;
                                PatientBillDetail.ExpiryDate = item.BatchDetails[batid].ExpiryDate;
                            } else if (PatientBillDetail.ExpiryStop) {
                                PatientBillDetail.ExpiryDate = null;
                                PatientBillDetail.ExpiryStop = true;
                                PatientBillDetail.ExpiryDate = item.BatchDetails[batid].ExpiryDate;
                            } else {
                                PatientBillDetail.ExpiryDate = null;
                                PatientBillDetail.ExpiryProceed = true;
                                PatientBillDetail.ExpiryDate = item.BatchDetails[batid].ExpiryDate;
                            }

                            if (PatientBillDetail.TotalQuantity <= PatientBillDetail.MinQty) {
                                PatientBillDetail.IsFallUnderMinQty = true;
                            } else {
                                PatientBillDetail.IsFallUnderMinQty = false;
                            }

                            PatientBillDetail.IsPrescribed = item.IsPrescribed;
                            if ($scope.item.StaffCheck) {
                                if (PatientBillDetail.AllowStaffDiscount) {
                                    if ($scope.item.StaffDiscountTypeId === 2) {
                                        PatientBillDetail.DiscountPercentage = $scope.item.StaffDiscountPercentage;
                                        PatientBillDetail.DiscountAmount = $scope.item.StaffDiscountPercentage;

                                        PatientBillDetail.UnitPrice = parseFloat(((PatientBillDetail.MrPrice * 100) / (100 + PatientBillDetail.GSTPercentage)).toFixed(2));
                                        PatientBillDetail.UnitDiscountAmount = parseFloat(($scope.item.StaffDiscountPercentage / 100 * PatientBillDetail.UnitPrice).toFixed(2));
                                        PatientBillDetail.UnitPrice = PatientBillDetail.UnitPrice - parseFloat(PatientBillDetail.UnitDiscountAmount);

                                        PatientBillDetail.UnitGSTAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.GSTPercentage).toFixed(2));
                                        PatientBillDetail.UnitInGstAmount = 0;
                                        PatientBillDetail.UnitCGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                                        PatientBillDetail.UnitSGstAmount = PatientBillDetail.UnitGSTAmount / 2;

                                        PatientBillDetail.Rate = PatientBillDetail.UnitPrice + parseFloat(PatientBillDetail.UnitGSTAmount);
                                    } else {
                                        PatientBillDetail.DiscountPercentage = $scope.item.StaffDiscountPercentage;
                                        PatientBillDetail.DiscountAmount = $scope.item.StaffDiscountPercentage;

                                        PatientBillDetail.MrPrice = PatientBillDetail.UnitCostPrice;
                                        PatientBillDetail.UnitPrice = parseFloat(((PatientBillDetail.UnitCostPrice * 100) / (100 + PatientBillDetail.GSTPercentage)).toFixed(2));
                                        PatientBillDetail.UnitDiscountAmount = parseFloat(($scope.item.StaffDiscountPercentage / 100 * PatientBillDetail.UnitPrice).toFixed(2));
                                        PatientBillDetail.UnitPrice = PatientBillDetail.UnitPrice - parseFloat(PatientBillDetail.UnitDiscountAmount);

                                        PatientBillDetail.UnitGSTAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.GSTPercentage).toFixed(2));
                                        PatientBillDetail.UnitInGstAmount = 0;
                                        PatientBillDetail.UnitCGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                                        PatientBillDetail.UnitSGstAmount = PatientBillDetail.UnitGSTAmount / 2;

                                        PatientBillDetail.Rate = PatientBillDetail.UnitPrice + parseFloat(PatientBillDetail.UnitGSTAmount);
                                    }
                                } else {
                                    PatientBillDetail.DiscountPercentage = 0;
                                    PatientBillDetail.DiscountAmount = 0;
                                    PatientBillDetail.UnitDiscountAmount = 0;
                                    PatientBillDetail.UnitPrice = parseFloat(((PatientBillDetail.MrPrice * 100) / (100 + PatientBillDetail.GSTPercentage)).toFixed(2));
                                    PatientBillDetail.UnitGSTAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.GSTPercentage).toFixed(2));
                                    PatientBillDetail.UnitInGstAmount = 0;
                                    PatientBillDetail.UnitCGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                                    PatientBillDetail.UnitSGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                                    PatientBillDetail.Rate = PatientBillDetail.MrPrice;
                                }
                            } else {
                                if (item.DiscountModeId == 2 && item.Discount > 0) {
                                    PatientBillDetail.DiscountPercentage = item.Discount;
                                    PatientBillDetail.DiscountAmount = item.Discount;

                                    PatientBillDetail.UnitPrice = parseFloat(((PatientBillDetail.MrPrice * 100) / (100 + PatientBillDetail.GSTPercentage)).toFixed(2));
                                    PatientBillDetail.UnitDiscountAmount = parseFloat((item.Discount / 100 * PatientBillDetail.UnitPrice).toFixed(2));
                                    PatientBillDetail.UnitPrice = PatientBillDetail.UnitPrice - parseFloat(PatientBillDetail.UnitDiscountAmount);

                                    PatientBillDetail.UnitGSTAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.GSTPercentage).toFixed(2));
                                    PatientBillDetail.UnitInGstAmount = 0;
                                    PatientBillDetail.UnitCGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                                    PatientBillDetail.UnitSGstAmount = PatientBillDetail.UnitGSTAmount / 2;

                                    PatientBillDetail.Rate = PatientBillDetail.UnitPrice + parseFloat(PatientBillDetail.UnitGSTAmount);
                                } else if (item.DiscountModeId == 1 && item.Discount > 0) {
                                    PatientBillDetail.DiscountPercentage = 0;
                                    PatientBillDetail.DiscountAmount = item.Discount;

                                    PatientBillDetail.UnitPrice = parseFloat(((PatientBillDetail.MrPrice * 100) / (100 + PatientBillDetail.GSTPercentage)).toFixed(2));
                                    PatientBillDetail.Rate = PatientBillDetail.UnitPrice - item.Discount;
                                    PatientBillDetail.UnitPrice = PatientBillDetail.UnitPrice - item.Discount;

                                    PatientBillDetail.UnitGSTAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.GSTPercentage).toFixed(2));
                                    PatientBillDetail.UnitInGstAmount = 0;
                                    PatientBillDetail.UnitCGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                                    PatientBillDetail.UnitSGstAmount = PatientBillDetail.UnitGSTAmount / 2;

                                    PatientBillDetail.Rate = PatientBillDetail.UnitPrice + parseFloat(PatientBillDetail.UnitGSTAmount);
                                } else {
                                    PatientBillDetail.UnitPrice = parseFloat(((PatientBillDetail.Rate * 100) / (100 + PatientBillDetail.GSTPercentage)).toFixed(2));

                                    PatientBillDetail.UnitGSTAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.GSTPercentage).toFixed(2));
                                    PatientBillDetail.UnitInGstAmount = 0;
                                    PatientBillDetail.UnitCGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                                    PatientBillDetail.UnitSGstAmount = PatientBillDetail.UnitGSTAmount / 2;

                                    PatientBillDetail.Rate = PatientBillDetail.MrPrice;
                                }
                            }
                            PatientBillDetail.Amount = parseFloat((PatientBillDetail.MrPrice * PatientBillDetail.Quantity).toFixed(2));
                            //PatientBillDetail.UnitPrice = parseFloat(((PatientBillDetail.Rate * 100) / (100 + PatientBillDetail.GSTPercentage)).toFixed(2));
                            //PatientBillDetail.UnitGSTAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.GSTPercentage).toFixed(2));
                            //PatientBillDetail.UnitInGstAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.InGstPercentage).toFixed(2));
                            //PatientBillDetail.UnitCGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                            //PatientBillDetail.UnitSGstAmount = PatientBillDetail.UnitGSTAmount / 2;
                            //PatientBillDetail.UnitCGstAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.CGstPercentage).toFixed(2));
                            //PatientBillDetail.UnitSGstAmount = parseFloat(((PatientBillDetail.UnitPrice / 100) * PatientBillDetail.SGstPercentage).toFixed(2));
                            PatientBillDetail.GSTAmount = parseFloat((PatientBillDetail.UnitGSTAmount * PatientBillDetail.Quantity).toFixed(2));
                            PatientBillDetail.InGstAmount = parseFloat((PatientBillDetail.UnitInGstAmount * PatientBillDetail.Quantity).toFixed(2));
                            PatientBillDetail.CGstAmount = PatientBillDetail.GSTAmount / 2;
                            PatientBillDetail.SGstAmount = PatientBillDetail.GSTAmount / 2;
                            //PatientBillDetail.CGstAmount = parseFloat((PatientBillDetail.UnitCGstAmount * PatientBillDetail.Quantity).toFixed(2));
                            //PatientBillDetail.SGstAmount = parseFloat((PatientBillDetail.UnitSGstAmount * PatientBillDetail.Quantity).toFixed(2));
                            PatientBillDetail.NetAmount = parseFloat((PatientBillDetail.Rate * PatientBillDetail.Quantity).toFixed(2));
                            PatientBillDetail.NetAmountBeforeGST = parseFloat((PatientBillDetail.NetAmount - PatientBillDetail.GSTAmount).toFixed(2));

                            if (item.SubCategoryId == 1) {
                                PatientBillDetail.SubCategoryId = 1;
                                PatientBillDetail.ServiceTypeId = 0;
                                PatientBillDetail.ServiceGroupId = $scope.item.DrugServiceGroupId;
                                PatientBillDetail.ServiceCategoryId = $scope.item.DrugServiceCategoryId;
                                PatientBillDetail.MasterName = item.DrugName;
                                PatientBillDetail.MasterItemId = item.DrugId;
                                PatientBillDetail.MasterTypeId = item.SubCategoryId;
                            } else if (item.SubCategoryId == 2) {
                                PatientBillDetail.SubCategoryId = 2;
                                PatientBillDetail.ServiceTypeId = 0;
                                PatientBillDetail.ServiceGroupId = $scope.item.NonDrugServiceGroupId;
                                PatientBillDetail.ServiceCategoryId = $scope.item.NonDrugServiceCategoryId;
                                PatientBillDetail.MasterName = item.DrugName;
                                PatientBillDetail.MasterItemId = item.DrugId;
                                PatientBillDetail.MasterTypeId = item.SubCategoryId;
                            } else {
                                PatientBillDetail.SubCategoryId = 0;
                                PatientBillDetail.ServiceTypeId = 0;
                                PatientBillDetail.ServiceGroupId = 0;
                                PatientBillDetail.ServiceCategoryId = 0;
                                PatientBillDetail.MasterName = '';
                                PatientBillDetail.MasterItemId = 0;
                                PatientBillDetail.MasterTypeId = 0;
                            }

                            PatientBillDetail.BatchDetails = item.BatchDetails;
                            $scope.PatientBillDetails.push(PatientBillDetail);
                            item.Quantity = item.Quantity - item.BatchDetails[batid].Quantity;
                            $scope.currentcontext.BillDiscount = 0;
                            savehitcompleted = 0;
                        }
                    }
                }

                $scope.CalculateNetAmt();
                $scope.addNewLineItem();
            }
        };

        $scope.CalcualteAmt = function (item) {

            $scope.currentcontext.BillDiscount = 0;
            item.Amount = item.Quantity * item.Rate;
            if ($scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 2) // percentage
            {
                var discamt = (item.DiscountAmount / 100) * item.Amount;
                item.NetAmount = item.Amount - discamt;
            } else if ($scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 1) {
                item.NetAmount = item.Amount - item.DiscountAmount;
            } else {
                item.DiscountAmount = 0;
                item.NetAmount = item.Amount;
            }

            if (item.DoctorShare == 0)
                item.IsDoctorDiscount = false;

            // item.RdoServiceId = true;
            if (item.NetAmount >= 0) {
                item.RdoIsPackage = true;
                $scope.CalculateNetAmt();
                $scope.applyVisibilityRules();
            } else {
                utl.Alert.showErrorMsg($translate.instant('billing.opbilling-list.discountlimit.lbl'));
            }
        };

        $scope.HeaderDiscountValueChange = function () {
            if ($scope.currentfilter.DiscountModeId && $scope.currentfilter.DiscountModeId != -1) {
                for (var idx in $scope.PatientBillDetails) {
                    if ($scope.PatientBillDetails[idx].Status == 1) {
                        $scope.PatientBillDetails[idx].DiscountAmount = 0;
                        $scope.PatientBillDetails[idx].NetAmount = $scope.PatientBillDetails[idx].Quantity * $scope.PatientBillDetails[idx].Rate;
                    }
                }
                $scope.CalculateNetAmt();
            } else {
                utl.Alert.showErrorMsg($translate.instant('billing.opbilling-list.discounttypemessage.lbl'));
            }
        };

        $scope.CalculateNetAmt = function () {

            if ($scope.currentcontext.PaymentTypeId == 7) {
                $scope.currentcontext.PaymentTypeId = 1;
                $scope.PaymentAdjustmentDetails = [];
                $scope.currentcontext.IsAdjustAgainstAdvance = false;
            }

            var itemwiseGrossAmt = 0;
            var itemwiseNetAmt = 0;
            var itemwiseDiscountAmt = 0;
            var itemtotaldiscountallpercent = 0;

            var itemwiseGstAmt = 0;
            var itemwiseInGstAmt = 0;
            var itemwiseCGstAmt = 0;
            var itemwiseSGstAmt = 0;
            for (var i = 0, len = $scope.PatientBillDetails.length; i < len; i++) {
                if ($scope.PatientBillDetails[i].Status == 1) {
                    var itemnetAmount = 0;
                    var itemGrossAmount = 0;
                    var itemDiscountAmount = 0;
                    var itemtotaldiscountpercent = 0;
                    var itemGstAmount = 0;
                    var itemInGstAmount = 0;
                    var itemCGstAmount = 0;
                    var itemSGstAmount = 0;

                    if ($scope.PatientBillDetails[i].NetAmount)
                        itemnetAmount = parseFloat(($scope.PatientBillDetails[i].NetAmount).toFixed(2));
                    if ($scope.PatientBillDetails[i].Amount)
                        itemGrossAmount = parseFloat(($scope.PatientBillDetails[i].Amount).toFixed(2));
                    if ($scope.PatientBillDetails[i].DiscountAmount)
                        itemDiscountAmount = parseFloat($scope.PatientBillDetails[i].DiscountAmount);
                    if ($scope.PatientBillDetails[i].GSTAmount)
                        itemGstAmount = parseFloat(($scope.PatientBillDetails[i].GSTAmount).toFixed(2));
                    if ($scope.PatientBillDetails[i].InGstAmount)
                        itemInGstAmount = parseFloat(($scope.PatientBillDetails[i].InGstAmount).toFixed(2));
                    if ($scope.PatientBillDetails[i].CGstAmount)
                        itemCGstAmount = parseFloat(($scope.PatientBillDetails[i].CGstAmount).toFixed(2));
                    if ($scope.PatientBillDetails[i].SGstAmount)
                        itemSGstAmount = parseFloat(($scope.PatientBillDetails[i].SGstAmount).toFixed(2));

                    if ($scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 2) {
                        itemDiscountAmount = parseFloat((itemDiscountAmount / 100 * itemGrossAmount).toFixed(2));
                    }
                    if ($scope.PatientBillDetails[i].DiscountAmount)
                        itemtotaldiscountpercent = parseFloat($scope.PatientBillDetails[i].DiscountAmount);

                    if ($scope.currentfilter.GuarantorTypeId == 6) { // Free type
                        if ($scope.PatientBillDetails[i].Amount) { // FreeNetAmount
                            $scope.PatientBillDetails[i].FreeNetAmount = $scope.PatientBillDetails[i].Amount;
                        }
                        $scope.PatientBillDetails[i].NetAmount = 0;
                        $scope.PatientBillDetails[i].DoctorShare = 0;
                        $scope.PatientBillDetails[i].GSTAmount = 0;
                        itemGrossAmount = 0;
                        itemnetAmount = 0;
                        itemDiscountAmount = 0;
                    }


                    itemwiseGrossAmt += itemGrossAmount;
                    itemwiseNetAmt += itemnetAmount;
                    itemwiseDiscountAmt += itemDiscountAmount;
                    itemtotaldiscountallpercent += itemtotaldiscountpercent;

                    itemwiseGstAmt += itemGstAmount;
                    itemwiseInGstAmt += itemInGstAmount;
                    itemwiseCGstAmt += itemCGstAmount;
                    itemwiseSGstAmt += itemSGstAmount;
                }
            }
            $scope.currentcontext.PaidAmt = (!$scope.currentcontext.PaidAmt) ? 0 : parseFloat(($scope.currentcontext.PaidAmt).toFixed(2));
            $scope.item.TotDiscAmount = 0;
            $scope.item.GrossAmount = 0;
            $scope.currentcontext.TotNetAmount = 0;
            $scope.currentcontext.TotBalanceAmt = 0;

            $scope.item.GrossAmount = itemwiseGrossAmt;
            $scope.item.GSTAmount = itemwiseGstAmt;
            $scope.item.InGstAmount = itemwiseInGstAmt;
            $scope.item.CGstAmount = itemwiseCGstAmt;
            $scope.item.SGstAmount = itemwiseSGstAmt;
            $scope.item.DiscountPercentage = itemtotaldiscountallpercent;

            $scope.currentcontext.ReceiptAmt = (!$scope.currentcontext.ReceiptAmt) ? 0 : parseFloat($scope.currentcontext.ReceiptAmt);
            if ($scope.item.DiscountPercentage > 0) {
                $scope.currentcontext.BillDiscount = parseFloat($scope.item.DiscountPercentage);
            }
            $scope.currentcontext.DiscountModeValue = parseFloat($scope.currentcontext.BillDiscount);
            if ($scope.currentcontext.BillDiscount > 0) {
                if ($scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 2) {
                    $scope.item.TotDiscAmount = parseFloat(($scope.currentcontext.BillDiscount / 100 * $scope.item.GrossAmount).toFixed(2));
                } else if ($scope.currentfilter.DiscountModeId == 1) {
                    $scope.item.TotDiscAmount = parseFloat($scope.currentcontext.BillDiscount);
                }
                $scope.item.DiscountPercentage = $scope.currentcontext.BillDiscount;
            } else if (itemwiseDiscountAmt > 0) {
                $scope.item.TotDiscAmount = itemwiseDiscountAmt;
            }

            if (itemwiseDiscountAmt > 0) {
                $scope.item.TotDiscAmount = itemwiseDiscountAmt;
            } else if ($scope.currentcontext.DiscountModeValue > 0) {
                if ($scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 2) {
                    $scope.item.TotDiscAmount = parseFloat(($scope.currentcontext.DiscountModeValue / 100 * $scope.item.GrossAmount).toFixed(2));
                } else if ($scope.currentfilter.DiscountModeId == 1) {
                    $scope.item.TotDiscAmount = parseFloat($scope.currentcontext.DiscountModeValue);
                }
            }

            $scope.currentcontext.TotNetAmount = parseFloat((parseFloat($scope.item.GrossAmount) - (parseFloat($scope.item.TotDiscAmount) + $scope.currentcontext.ReturnedAmount)).toFixed(2));
            $scope.currentcontext.TotBalanceAmt = parseFloat((parseFloat($scope.currentcontext.TotNetAmount) - parseFloat($scope.currentcontext.ReceiptAmt) - parseFloat($scope.currentcontext.PaidAmt)).toFixed(2));

            var NetNaturalValue = getNatural(Number($scope.currentcontext.TotNetAmount).toFixed(2));
            var NetDecimalValue = getDecimal(Number($scope.currentcontext.TotNetAmount).toFixed(2));
            var PreferedRoundOff = parseFloat($scope.item.PreferedRoundOff);
            var NetRoundOffValue = 0;
            if ($scope.enableroundoff == 1) {
                if (NetDecimalValue > 0 && NetDecimalValue < 50) {
                    $scope.currentcontext.TotNetAmount = NetNaturalValue;
                    $scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.TotNetAmount) - parseFloat($scope.currentcontext.ReceiptAmt) - parseFloat($scope.currentcontext.PaidAmt);
                    NetRoundOffValue = -1 * (NetDecimalValue / 100);
                    $scope.item.TotRndoffAmt = parseFloat(NetRoundOffValue);
                } else if (NetDecimalValue >= 50 && NetDecimalValue <= 99) {
                    $scope.currentcontext.TotNetAmount = NetNaturalValue + 1;
                    $scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.TotNetAmount) - parseFloat($scope.currentcontext.ReceiptAmt) - parseFloat($scope.currentcontext.PaidAmt);
                    NetRoundOffValue = (100 - NetDecimalValue) / 100;
                    $scope.item.TotRndoffAmt = parseFloat(NetRoundOffValue);
                } else {
                    NetRoundOffValue = 0;
                    $scope.item.TotRndoffAmt = parseFloat(NetRoundOffValue);
                }
            }
            var billBalance = parseFloat(((parseFloat($scope.currentcontext.TotNetAmount) + parseFloat($scope.item.TotRndoffAmt)) - parseFloat($scope.currentcontext.PaidAmt)).toFixed(2));
            if (parseFloat(($scope.currentcontext.ReceiptAmt).toFixed(2)) > math.round(billBalance)) {
                $scope.currentcontext.ReceiptAmt = 0;
                $scope.currentcontext.TotBalanceAmt = billBalance;
                utl.Alert.showErrorMsg($translate.instant('billing.pharmacy-return.receivingamt.lbl'));

            }
            if (parseFloat(($scope.item.TotDiscAmount).toFixed(2)) > parseFloat(($scope.item.GrossAmount).toFixed(2)) /* || $scope.currentcontext.TotBalanceAmt < 0*/ ) {
                $scope.currentcontext.dBillDiscount = 0;
                $scope.currentcontext.ReceiptAmt = 0;
                $scope.currentcontext.TotBalanceAmt = 0;
                utl.Alert.showErrorMsg($translate.instant('billing.pharmacy-return.receivingamt.lbl'));

                $scope.currentcontext.BillDiscount = 0;
                $scope.currentcontext.TotNetAmount = parseFloat((parseFloat($scope.item.GrossAmount)).toFixed(2));
            }

            /*
            if (NetDecimalValue > 0 && NetDecimalValue <= 50) {
                if (PreferedRoundOff > 0 && PreferedRoundOff <= 0.50) {
                    $scope.currentcontext.TotNetAmount = NetNaturalValue + 0.50;
                    $scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.TotNetAmount) - parseFloat($scope.currentcontext.ReceiptAmt) - parseFloat($scope.currentcontext.PaidAmt);
                    NetRoundOffValue = (50 - NetDecimalValue) / 100;
                    $scope.item.TotRndoffAmt = parseFloat(NetRoundOffValue);
                } else if (PreferedRoundOff > 0.50 && PreferedRoundOff <= 1) {
                    $scope.currentcontext.TotNetAmount = NetNaturalValue + 1;
                    $scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.TotNetAmount) - parseFloat($scope.currentcontext.ReceiptAmt) - parseFloat($scope.currentcontext.PaidAmt);
                    NetRoundOffValue = (100 - NetDecimalValue) / 100;
                    $scope.item.TotRndoffAmt = parseFloat(NetRoundOffValue);
                }
            } else if (NetDecimalValue > 50 && NetDecimalValue < 100) {
                if (PreferedRoundOff > 0 && PreferedRoundOff <= 0.50) {
                    $scope.currentcontext.TotNetAmount = NetNaturalValue + 1;
                    $scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.TotNetAmount) - parseFloat($scope.currentcontext.ReceiptAmt) - parseFloat($scope.currentcontext.PaidAmt);
                    NetRoundOffValue = (100 - NetDecimalValue) / 100;
                    $scope.item.TotRndoffAmt = parseFloat(NetRoundOffValue);
                } else if (PreferedRoundOff > 0.50 && PreferedRoundOff <= 1) {
                    $scope.currentcontext.TotNetAmount = NetNaturalValue + 1;
                    $scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.TotNetAmount) - parseFloat($scope.currentcontext.ReceiptAmt) - parseFloat($scope.currentcontext.PaidAmt);
                    NetRoundOffValue = (100 - NetDecimalValue) / 100;
                    $scope.item.TotRndoffAmt = parseFloat(NetRoundOffValue);
                }
            } else {
                NetRoundOffValue = 0;
                $scope.item.TotRndoffAmt = parseFloat(NetRoundOffValue);
            }
            */

            $scope.item.Received = $scope.currentcontext.ReceiptAmt !== 0 ?
                $scope.currentcontext.ReceiptAmt : $scope.currentcontext.PaidAmt !== 0 ? $scope.currentcontext.PaidAmt : 0;
            if ($scope.currentcontext.id !== 0 && $scope.item.PatientBillStatusId !== 1)
                $scope.item.Received = parseFloat($scope.currentcontext.PaidAmt) + parseFloat($scope.currentcontext.ReceiptAmt);

            // Discount Limit Validation
            if (vm.DiscountApprover) {
                $scope.DiscountLimit = vm.DiscountApprover.DiscountLimit;
                if (vm.DiscountApprover.DiscountMode) {
                    if (vm.DiscountApprover.DiscountMode.Description == "%") {
                        $scope.DiscountLimit = (parseFloat($scope.item.GrossAmount) * vm.DiscountApprover.DiscountLimit) / 100;
                    }
                }
            }
            if ($scope.item.TotDiscAmount > 0) {
                $scope.DiscountAlert = '';
                $scope.IsDiscountApproved = true;
                if ($scope.currentcontext.DiscountApprovedBy > 0) {
                    if ($scope.DiscountLimit !== null && $scope.item.TotDiscAmount > $scope.DiscountLimit) {
                        if (vm.DiscountApprover.DiscountMode.Description == "RS")
                            $scope.DiscountAlert = 'Maximum Discount of Rs.' + $scope.DiscountLimit + ' Only Can be Given For the Selected Discount Approver';
                        if (vm.DiscountApprover.DiscountMode.Description == "%")
                            $scope.DiscountAlert = 'Maximum Discount of ' + vm.DiscountApprover.DiscountLimit + '% Only Can be Given For the Selected Discount Approver';
                        utl.Alert.showErrorMsg($scope.DiscountAlert);
                        $scope.IsDiscountApproved = false;
                    }
                } else {
                    $scope.DiscountAlert = 'Please Select Discount Approver';
                    utl.Alert.showErrorMsg($scope.DiscountAlert);
                    $scope.IsDiscountApproved = false;
                }
            }

            if (!$scope.currentcontext.ReceiptAmt && $scope.currentfilter.GuarantorTypeId <= 1) {
                // $scope.setDefaultPrivateDueId();
            } else if (!$scope.currentcontext.ReceiptAmt && $scope.currentfilter.GuarantorTypeId > 1) {
                $scope.item.GuarantorDueId = $scope.currentfilter.GuarantorId;
            }

        };

        function getNatural(num) {
            return parseFloat(num.toString().split(".")[0]);
        }

        function getDecimal(num) {
            return parseFloat(num.toString().split(".")[1]);
        }

        $scope.OnLoadPackageItem = function (SelectedItem) {
            if (SelectedItem.IsPackage) {
                utl.Alert.showSuccessMsg($translate.instant('billing.opbilling-list.needtoload.lbl'));
            } else {
                SelectedItem.IsPackage = false;

                utl.Alert.showSuccessMsg($translate.instant('billing.opbilling-list.noneedtoload.lbl'));
            }
        };

        $scope.LoadPackageItem = function (SelectedItem) {
            $scope.OnLoadPackageItem(SelectedItem);
        };

        $scope.clear = function () {

        };

        $scope.addNewBill = function () {

        };

        $scope.addPay = function () {
            utl.Modal.openFixedDialog('app.opbilling-form', {
                params: {
                    id: $scope.item.PatientId
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.alertviewclick = function () {
            utl.Modal.openFixedDialog('app.alertview', {
                params: {
                    id: $scope.item.PatientId
                },
                confirmCallback: $scope.updateCount
            });
        };

        $scope.editInfo = function () {
            utl.Modal.openFixedDialog('app.opbillinginfo-form', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.numberonly = function (e) {

            if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
                // Allow: Ctrl+A, Command+A
                (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) ||
                // Allow: home, end, left, right, down, up
                (e.keyCode >= 35 && e.keyCode <= 40)) {
                // let it happen, don't do anything
                return;
            }
            // Ensure that it is a number and stop the keypress
            //&& (e.keyCode < 96 || e.keyCode > 105)
            if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57))) {

                e.preventDefault();
            }
        };

        $scope.getPendingData = function (scope, data, options, hasError) {
            $scope.PatientBillDetails = [];
            data.forEach((item, idx) => {
                var v = {};
                v.ServiceId = item.Id;
                v.Status = item.Status;
                v.Quantity = 1;
                v.SelectedItem = item;
                $scope.PatientBillDetails.push(v);
            });
            for (var idx in $scope.PatientBillDetails) {
                var item = $scope.PatientBillDetails[idx];
                $scope.ServiceItemChanged(idx, item);
            }
        };

        $scope.pendingorder = function (pendingData) {

            if (pendingData.id && pendingData.id > 0) {
                $scope.item.PendingOrderId = pendingData.id;
                var options = {
                    action: 'billing/PatientBills/GetPendingOrders',
                    data: {
                        Id: pendingData.id
                    },
                    type: 'post',
                    onComplete: $scope.getPendingData
                };

                utl.Http.doAction(options);
            }

        };

        $scope.pendingOrder = function () {
            utl.Modal.openFixedDialog('app.pendingorder', {
                params: {
                    id: $scope.currentfilter.PatientId
                },
                confirmCallback: $scope.pendingorder
            });
        };

        function patientBillPickerCallback(patientbilldata) {
            //console.log(patientbilldata);
            //utl.Alert.showSuccessMsg($translate.instant('Need to Load' + patientbilldata.BillId));
            $scope.currentcontext.id = patientbilldata.BillId;
            if (patientbilldata.BillTypeId == 5) {
                $scope.dgbillnosaveoption = 1;
            }
            $scope.getBillInfoByBillId();
        }

        $scope.findBill = function () {
            utl.Modal.openFixedDialog('app.findbill-list', {
                params: {
                    id: $scope.currentfilter.PatientId,
                    context: vm.Context
                },
                confirmCallback: patientBillPickerCallback
            });
            $scope.chkfindBill = 1;
        };

        $scope.patientprofiledetails = function () {
            utl.Modal.openFixedDialog('registration.patientprofile', {
                params: {
                    pid: $scope.currentfilter.PatientId
                },
                confirmCallback: $scope.getItem
            });
        };

        $scope.pendingBill = function () {
            utl.Modal.openFixedDialog('app.pendingbill-list', {
                params: {
                    id: $scope.currentfilter.PatientId
                },
                confirmCallback: patientBillPickerCallback
            });
        };

        $scope.outstandingBill = function () {
            utl.Modal.openFixedDialog('app.outstandingbill-list', {
                params: {
                    id: $scope.currentfilter.PatientId
                },
                confirmCallback: patientBillPickerCallback
            });
        };

        $scope.billHistory = function () {
            utl.Modal.openFixedDialog('app.billhistory-list', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.add_new = function () {
            utl.Modal.openFixedDialog('app.opbilling-list', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.openAttachments = function () {
            utl.Modal.openFixedDialog('app.patientattachments', {
                params: {
                    pid: 0,
                    itemid: 0
                },
                confirmCallback: $scope.initLookup,
                cancelCallback: $scope.initLookup
            });
        };

        $scope.originalprint = function () {

            var inputData = {
                Id: $scope.currentcontext.id,
                Data: {
                    Reason: $scope.currentcontext.printreason
                }
            };
            var options = {
                action: 'billing/patientbills/PrintPatientBills',
                data: inputData,
                type: 'post'
            };
            utl.Http.doPrint(options);
        };

        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'billing/patientbills/PrintPatientBills',
                data: inputData,
                type: 'post'
            };
            utl.Http.doPrint(options);
        };

        $scope.printwithoutheader = function () {
            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'billing/patientbills/PrintPatientBillsWithoutHeader',
                data: inputData,
                type: 'post'
            };
            utl.Http.doPrint(options);
        };

        $scope.printopcreditbill = function () {
            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'billing/patientbills/Printopcreditbill',
                data: inputData,
                type: 'post'
            };
            utl.Http.doPrint(options);
        };

        var totalpaperwidth = 135;

        function getCenterPositionforDMPrint(strdata) {
            var iPosi = 0;
            var iRemi = totalpaperwidth - strdata.length;
            if (iRemi < 0) iRemi = 0;
            iPosi = iRemi / 2;
            return iPosi;
        };

        $scope.dmPrint = function () {

            if ($scope.dmprintpreferences != 1) {
                utl.Alert.showSuccessMsg($translate.instant('billing.opbilling-list.currentfacility.lbl'));

                return false;
            } else {
                var inputData = {
                    Id: $scope.currentcontext.id
                };
                var options = {
                    action: 'billing/patientbills/DMPrintPatientBills',
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
            $scope.printOPBilling(dmPrintInput);
            if (savehitcompleted == 1)
                $scope.clear();
        };

        function preparePrintData(data) {
            console.log('preparePrintData starts');
            console.log(data);

            var vIPOPNO = '';
            var vPTitle = '';
            var vPFirstName = '';
            var vPLastName = '';
            var vUTitle = '';
            var vUFirstName = '';
            var vULastName = '';
            var vMRN = '';
            var vAge = '';
            var vDOB = '';
            var vaddr1 = '';
            var vaddr2 = '';
            var vpincode = '';
            var varea = '';
            var vcity = '';
            var vstate = '';
            var vcountry = '';
            var vContactNo = '';
            var vGuarantor = '';
            var vGender = '';
            var vCFirstName = '';
            var vCLastName = '';
            var vCTitle = '';
            var vDrName = '';
            var NetAmountInWords = '';

            if (data.PatientBills.Encounter) vIPOPNO = '' + data.PatientBills.Encounter.VisitIdentifier;




            if (data.PatientBills.User) {
                if (data.PatientBills.User.Title) vUTitle = data.PatientBills.User.Title.Description;
                if (data.PatientBills.User.FirstName) vUFirstName = data.PatientBills.User.FirstName;
                if (data.PatientBills.User.LastName) vULastName = data.PatientBills.User.LastName;
                vDrName = (vUTitle + '.' + vUFirstName + ' ' + vULastName);
            }
            if (data.PatientBills.CreatedUser) {
                if (data.PatientBills.CreatedUser.Title) vCTitle = data.PatientBills.CreatedUser.Title.Description;
                if (data.PatientBills.CreatedUser.FirstName) vCFirstName = data.PatientBills.CreatedUser.FirstName;
                if (data.PatientBills.CreatedUser.LastName) vCLastName = data.PatientBills.CreatedUser.LastName;
            }
            if (data.PatientBills.Patient) {
                if (data.PatientBills.Patient.Title) vPTitle = data.PatientBills.Patient.Title.Description;
                if (data.PatientBills.Patient.FirstName) vPFirstName = data.PatientBills.Patient.FirstName;
                if (data.PatientBills.Patient.LastName) vPLastName = data.PatientBills.Patient.LastName;
                if (data.PatientBills.Patient.MRN) vMRN = '' + data.PatientBills.Patient.MRN;
                if (data.PatientBills.Patient.Age) vAge = '' + data.PatientBills.Patient.Age;
                if (data.PatientBills.Patient.DOB) vDOB = '' + data.PatientBills.Patient.DOB;

                if (data.PatientBills.Patient.Gender) vGender = '' + data.PatientBills.Patient.Gender.Description;
                if (data.PatientBills.Patient.AddressLine1)
                    vaddr1 = '' + data.PatientBills.Patient.AddressLine1;
                if (data.PatientBills.Patient.AddressLine2)
                    vaddr2 = '' + data.PatientBills.Patient.AddressLine2;
                if (data.PatientBills.Patient.Pincode)
                    vpincode = '' + data.PatientBills.Patient.Pincode;

                if (data.PatientBills.Patient.Area)
                    varea = '' + data.PatientBills.Patient.Area;
                if (data.PatientBills.Patient.City)
                    vcity = '' + data.PatientBills.Patient.City;
                if (data.PatientBills.Patient.State)
                    vstate = '' + data.PatientBills.Patient.State;
                if (data.PatientBills.Patient.Country)
                    vcountry = '' + data.PatientBills.Patient.Country;

                if (data.PatientBills.Patient.Mobile) vContactNo = '' + data.PatientBills.Patient.Mobile;
                if (data.PatientBills.Guarantor.GuarantorName) vGuarantor = '' + data.PatientBills.Guarantor.GuarantorName;
            } else {
                if (data.PatientBills.Title)
                    vPTitle = data.PatientBills.Title.Description;
                vPFirstName = data.PatientBills.PatientName;
                if (data.PatientBills.Age)
                    vAge = '' + data.PatientBills.Age;
                if (data.PatientBills.Gender)
                    vGender = '' + data.PatientBills.Gender.Description;
                if (data.PatientBills.DoctorName)
                    vDrName = '' + data.PatientBills.DoctorName;
            }



            var vPayTypeId = -1;

            if (data.PatientBills.PatientPaymentDetails)
                for (var idxpy in data.PatientPaymentDetails)
                    vPayTypeId = data.PatientPaymentDetails[idxpy].PaymentTypeId;

            var dmPrintInput = {};
            dmPrintInput.header = {
                prescribedby: vDrName || '',
                billno: data.PatientBills.BillNumber,
                patientname: vPTitle + '.' +
                    vPFirstName + ' ' + vPLastName,
                MRN: vMRN,
                Age: vAge,
                DOB: vDOB,
                Gender: vGender,
                IPOPNO: vIPOPNO,
                AddressLine1: vaddr1,
                AddressLine2: vaddr2,
                Pincode: vpincode,
                Area: varea,
                City: vcity,
                State: vstate,
                Country: vcountry,
                Mobile: vContactNo,
                Guarantor: vGuarantor,
                billdate: utl.Formatter.getDateTimeString(data.PatientBills.BillDateTime),
                totalamount: data.PatientBills.BillAmount,
                totDiscont: data.PatientBills.BillDiscount,
                totroundoff: data.PatientBills.RoundOffValue,
                totpaidamt: data.PatientBills.PaidAmount,
                totdueamt: data.PatientBills.OutStandingAmount,
                billedby: vCTitle + '.' + vCFirstName + ' ' + vCLastName,
                NetAmountInWords: data.NetAmountInWords,
                paytypeid: vPayTypeId || -1

            };

            dmPrintInput.lines = [];
            var islno = 1;
            for (var idx in data.BillDetails) {
                var billDetail = data.BillDetails[idx];
                var expiryDate = billDetail.ExpiryDate ? utl.Formatter.formatDate(billDetail.ExpiryDate, 'MM/YY') : '';
                var manu = billDetail.ManufacturerName;
                if (manu && manu.length > 3) {
                    manu = manu.substring(0, 3);
                }

                var batchid = billDetail.BatchId;
                if (batchid && batchid.length > 4) {
                    batchid = batchid.substring(0, 4);
                }
                var vDepartment = billDetail.Department.DepartmentName;
                var vdescription = billDetail.ServiceName;


                var detail = {
                    ispace: ' ',
                    slno: islno++,
                    Desc: vdescription,
                    Department: vDepartment,
                    qty: billDetail.Quantity,
                    mrp: parseFloat(billDetail.Rate).toFixed(2),
                    netamount: parseFloat(billDetail.NetAmount).toFixed(2)
                };
                dmPrintInput.lines.push(detail);
            }

            console.log('preparePrintData ends');
            return dmPrintInput;
        }

        $scope.backToList = function () {
            $state.go('app.pharmacybillmodificationtab.pharmacybillmodification-list');
        };

        $scope.EditLineItem = function (item) {
            var idx = $scope.PatientBillDetails.indexOf(item);
            $scope.PatientBillDetails[idx].DoctorId = item.DoctorId;
            $scope.PatientBillDetails[idx].DiscountTypeId = item.DiscountTypeId;
            $scope.PatientBillDetails[idx].IsDoctorDiscount = item.IsDoctorDiscount;
            $scope.PatientBillDetails[idx].Comments = item.Comments;
        };

        $scope.referesh = function () {
            if ($stateParams.id) {
                $scope.chkfindBill = 1;
                $scope.getBillInfoByBillId();
            }
        };

        $scope.editPatientBillDetails = function () {
            utl.Modal.openFixedDialog('app.pharmacybillmodifydetails', {
                params: {
                    pid: $scope.item.PatientId,
                    eid: $scope.item.EncounterId,
                    ireceiveamt: $scope.currentcontext.TotCASHAmount,
                    PatientBillId: $scope.item.PatientBillId,
                    TotNetAmount: $scope.item.GrossAmount,
                    TotDiscAmount: $scope.item.TotDiscAmount,
                    TotGstAmount: $scope.item.GstAmount,
                },
                confirmCallback: $scope.referesh
            });
        };

        $scope.ManualBillCallback = function (item) {
            $scope.item.ManualBillNumber = item.ManualBillNumber;
            $scope.item.ManualBillDate = item.ManualBillDate;
            $scope.item.ManualBillComments = item.ManualBillComments;
        };

        $scope.OpenManualBill = function () {
            var IsEditable = false;
            if ($scope.currentcontext.PatientBillStatusId == 1) {
                IsEditable = true
            }
            utl.Modal.openFixedDialog('app.opmanualbill', {
                params: {
                    item: $scope.item,
                    patient: $scope.selectedPatient,
                    IsEditable: IsEditable
                },
                confirmCallback: $scope.ManualBillCallback
                // cancelCallback: $scope.initLookup
            });
        };

        $scope.deletePatientBillDetails = function (idx, item) {
            if (item.ServiceId != -1)
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, item, name);
        };

        $scope.onDeleteConfirmed = function (item) {
            var index = $scope.PatientBillDetails.indexOf(item);
            item.Status = 2;
            $scope.DeletedPatientBills.push(item);
            $scope.PatientBillDetails.splice(index, 1);
            var lastIndex = $scope.PatientBillDetails.length - 1;
            if (lastIndex < 0) {
                $scope.addNewLineItem();
            }
            $scope.setIndexforTableIndex();
            $scope.CalculateNetAmt();
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {

        };

        $scope.onBillDeleteConfirmed = function (deleteid) {
            var options = {
                action: 'billing/patientbills/DeletePatientBills',
                data: {
                    Id: deleteid
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.DeleteCompleteBill = function () {
            utl.Dialog.confirmDelete($scope.onBillDeleteConfirmed, $scope.currentcontext.id, 'this Bill');
        };

        $scope.getServiceItemMappingCallback = function (scope, res, options, hasError) {
            var ServiceItemobj = res.Data;
            if (ServiceItemobj) {
                for (var idx1 in ServiceItemobj) {
                    for (var idx in $scope.PatientBillDetails) {
                        if (ServiceItemobj[idx1].Id == $scope.PatientBillDetails[idx].ServiceId) {
                            $scope.PatientBillDetails[idx].DisableRate = !ServiceItemobj[idx1].IsRateEditable;
                            $scope.PatientBillDetails[idx].ServiceCode = ServiceItemobj[idx1].ItemCode;
                            $scope.PatientBillDetails[idx].ServiceName = ServiceItemobj[idx1].Name;
                            $scope.PatientBillDetails[idx].TestCode = ServiceItemobj[idx1].ItemCode;
                            $scope.PatientBillDetails[idx].TestName = ServiceItemobj[idx1].Name;
                            $scope.PatientBillDetails[idx].TestDescription = ServiceItemobj[idx1].Name;
                            $scope.PatientBillDetails[idx].DepartmentId = ServiceItemobj[idx1].DepartmentId;
                            $scope.PatientBillDetails[idx].SubDepartmentId = ServiceItemobj[idx1].SubDepartmentId;
                            $scope.PatientBillDetails[idx].IsOrderable = ServiceItemobj[idx1].IsOrderable;
                            $scope.PatientBillDetails[idx].CanDiscountProportionate = ServiceItemobj[idx1].CanDiscountProportionate;
                            $scope.PatientBillDetails[idx].ServiceCategoryId = ServiceItemobj[idx1].CategoryId;
                            $scope.PatientBillDetails[idx].MasterTypeId = ServiceItemobj[idx1].MasterTypeId;
                            $scope.PatientBillDetails[idx].TestId = ServiceItemobj[idx1].MasterItemId;
                            $scope.PatientBillDetails[idx].TestTypeId = ServiceItemobj[idx1].OrderTypeId;
                            $scope.PatientBillDetails[idx].MasterItemId = ServiceItemobj[idx1].MasterItemId;
                            $scope.PatientBillDetails[idx].MasterName = ServiceItemobj[idx1].MasterName;
                            $scope.PatientBillDetails[idx].IsPackageItem = ServiceItemobj[idx1].IsPackage;
                        }
                    }
                }
            }
        };

        $scope.ServiceItemMapping = function () {
            var serviceid = [];
            for (var idx in $scope.PatientBillDetails) {
                serviceid.push($scope.PatientBillDetails[idx].ServiceId);
            }
            if (serviceid.length > 0) {
                var inputData = {
                    Params: [{
                        Key: 0,
                        Value: serviceid
                    }],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'ClinicalMaster/ServiceItem/GetServiceItems',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getServiceItemMappingCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getBillInfoCallback = function (scope, res, options, hasError) {
            $scope.item.IsFromIPBill = 0;
            $scope.currentcontext.TotCASHAmount = 0;
            $scope.PatientBillInfo = res.Data || [];
            if ($scope.PatientBillInfo && $scope.PatientBillInfo.length > 0) {
                $scope.isSaving = true;
                $scope.outstanding = false;
                $scope.IsDue = false;
                $scope.canShowAdvanceBtn = false;
                $scope.onDoctorSelected()
                $scope.PatientBillInfo.forEach(patientbills => {
                    $scope.item.PatientId = patientbills.PatientId;
                    $scope.item.PatientBillId = patientbills.Id;
                    $scope.item.PatientBillStatusId = patientbills.PatientBillStatusId;
                    if ($scope.item.PatientBillStatusId == 3) {
                        $scope.loadPatientGuarantors();
                    }
                    if (patientbills.OutStandingAmount == 0) {
                        $scope.IsDue = true
                    } else {
                        $scope.item.TotalDueAmount = patientbills.OutStandingAmount;
                        $scope.item.TotalPaidAmount = patientbills.PaidAmount;
                        $scope.canShowAdvanceBtn = true;
                    }
                    $scope.currentfilter.PatientId = patientbills.PatientId;
                    $scope.currentcontext.FacilityId = patientbills.FacilityId;
                    $scope.currentcontext.DiscountApprovedBy = patientbills.DiscountApprovedBy;
                    $scope.currentcontext.id = patientbills.Id;
                    $scope.currentcontext.ReceiptAmt = null;
                    $scope.currentcontext.PaidAmt = patientbills.PaidAmount;
                    $scope.currentcontext.ApprovedById = patientbills.BillApprovedBy;
                    $scope.currentcontext.billdate = patientbills.BillDateTime;
                    $scope.currentcontext.BillDiscount = patientbills.BillDiscount;
                    $scope.currentcontext.CNAmount = patientbills.CNAmount;
                    $scope.currentcontext.RefundAmount = patientbills.RefundAmount;
                    $scope.currentcontext.CancelReason = patientbills.CancelReason;
                    $scope.currentfilter.DiscountModeId = 1;
                    $scope.item.BillNumber = patientbills.BillNumber;
                    $scope.item.DepartmentId = patientbills.DepartmentId;
                    $scope.item.DoctorId = patientbills.DoctorId;
                    $scope.currentfilter.GuarantorId = patientbills.GuarantorId;
                    $scope.currentfilter.GuarantorName = patientbills.GuarantorName;
                    $scope.currentfilter.GuarantorTypeId = patientbills.GuarantorTypeId;
                    $scope.currentfilter.ServiceRateCategoryId = patientbills.ServiceRateCategoryId;
                    $scope.currentfilter.StoreMasterId = patientbills.StoreMasterId;

                    if (patientbills.PharmacySaleTypeId == 4) {
                        $scope.currentcontext.isnewpatient = true;
                        if (patientbills.OutStandingAmount === 0) {
                            $scope.IsDue = true;
                            $scope.canShowFinanceBtn = true;
                        } else {
                            $scope.item.TotalDueAmount = patientbills.OutStandingAmount;
                            $scope.item.TotalPaidAmount = patientbills.PaidAmount;

                            $scope.canShowFinanceBtn = true;
                            $scope.canShowAdvanceBtn = true;
                        }
                        if ($scope.item.PatientBillStatusId == 3) {
                            $scope.IsDisabled = true;
                            $scope.RdoPharmacySaleType = true;
                            $scope.currentcontext.PharmacyBillStatusId = 3;
                        }

                        $scope.newPatient.PatientName = patientbills.PatientName;
                        $scope.newPatient.DoctorName = patientbills.DoctorName;
                        $scope.newPatient.Mobile = patientbills.Mobile;
                        $scope.newPatient.TitleId = patientbills.TitleId;
                        $scope.newPatient.GenderId = patientbills.GenderId;
                        $scope.newPatient.DOB = patientbills.DOB;
                        $scope.newPatient.Age = patientbills.Age;

                        $scope.currentfilter.PatientId = patientbills.PatientId;
                        $scope.currentcontext.DiscountApprovedBy = patientbills.DiscountApprovedBy;
                        $scope.currentcontext.id = patientbills.Id;
                        $scope.currentcontext.ReceiptAmt = 0;
                        $scope.currentcontext.PaidAmt = patientbills.PaidAmount;
                        $scope.currentcontext.ApprovedById = patientbills.BillApprovedBy;
                        $scope.currentcontext.billdate = patientbills.BillDateTime;
                        $scope.currentcontext.BillDiscount = patientbills.BillDiscount;
                        $scope.currentcontext.CNAmount = patientbills.CNAmount;
                        $scope.currentcontext.ReturnedAmount = patientbills.ReturnedAmount;
                        $scope.currentcontext.DiscountModeValue = patientbills.DiscountModeValue;
                        $scope.currentfilter.DiscountModeId = patientbills.BillDiscountModeId;
                        if ($scope.currentfilter.DiscountModeId == 2) {
                            $scope.currentcontext.BillDiscount = patientbills.DiscountPercentage;
                        }
                        $scope.item.BillNumber = patientbills.BillNumber;
                        $scope.item.DepartmentId = patientbills.DepartmentId;
                        $scope.item.DoctorId = patientbills.DoctorId;
                        $scope.currentfilter.GuarantorId = patientbills.GuarantorId;
                        $scope.currentfilter.GuarantorName = patientbills.GuarantorName;
                        $scope.currentfilter.GuarantorTypeId = patientbills.GuarantorTypeId;
                        $scope.currentcontext.PatientBillStatusId = patientbills.PatientBillStatusId;
                        $scope.currentcontext.PatientStatusId = patientbills.PatientBillStatusId;
                        $scope.item.PatientBillStatus = patientbills.PatientBillStatus.Description;
                        $scope.item.GuarantorDueId = patientbills.GuarantorDueId || null;
                        $scope.item.PrivateDueId = patientbills.PrivateDueId || null;
                        $scope.isSaveandApprove = true;
                    } else {
                        $scope.currentcontext.isnewpatient = false;
                        $scope.item.PatientBillStatusId = patientbills.PatientBillStatusId;
                        $scope.currentcontext.PatientBillStatusId = patientbills.PatientBillStatusId;
                        if (patientbills.OutStandingAmount === 0) {
                            $scope.IsDue = true;
                            $scope.canShowFinanceBtn = true;
                        } else {
                            $scope.canShowFinanceBtn = true;
                            $scope.canShowAdvanceBtn = true;
                        }
                        if ($scope.item.PatientBillStatusId == 3) {
                            $scope.IsDisabled = true;
                            $scope.RdoPharmacySaleType = true;
                            $scope.currentcontext.PharmacyBillStatusId = 3;
                        }

                        $scope.currentfilter.PatientId = patientbills.PatientId;
                        $scope.currentcontext.DiscountApprovedBy = patientbills.DiscountApprovedBy;
                        $scope.currentcontext.id = patientbills.Id;
                        $scope.currentcontext.ReceiptAmt = 0;
                        $scope.currentcontext.PaidAmt = patientbills.PaidAmount;
                        $scope.currentcontext.ApprovedById = patientbills.BillApprovedBy;
                        $scope.currentcontext.billdate = patientbills.BillDateTime;
                        $scope.currentcontext.BillDiscount = patientbills.BillDiscount;
                        $scope.currentcontext.CNAmount = patientbills.CNAmount;
                        $scope.currentcontext.ReturnedAmount = patientbills.ReturnedAmount;
                        $scope.currentcontext.DiscountModeValue = patientbills.DiscountModeValue;
                        $scope.currentfilter.DiscountModeId = patientbills.BillDiscountModeId;
                        if ($scope.currentfilter.DiscountModeId == 2) {
                            $scope.currentcontext.BillDiscount = patientbills.DiscountPercentage;
                        }
                        $scope.item.BillNumber = patientbills.BillNumber;
                        $scope.item.DepartmentId = patientbills.DepartmentId;
                        $scope.item.DoctorId = patientbills.DoctorId;
                        $scope.item.FacilityId = patientbills.FacilityId;
                        $scope.item.EncounterId = patientbills.EncounterId;
                        $scope.item.EncounterTypeId = patientbills.EncounterTypeId;
                        $scope.item.PatientName = patientbills.PatientName;

                        $scope.currentfilter.GuarantorTypeId = patientbills.GuarantorTypeId;

                        $scope.GuarantorTypeChange({
                            Id: patientbills.GuarantorTypeId
                        });
                        $scope.currentfilter.GuarantorId = patientbills.GuarantorId;

                        $scope.currentcontext.PatientStatusId = patientbills.PatientBillStatusId;
                        $scope.item.PatientBillStatus = patientbills.PatientBillStatus.Description;
                        $scope.item.GuarantorDueId = patientbills.GuarantorDueId || null;
                        $scope.item.PrivateDueId = patientbills.PrivateDueId || null;
                        $scope.isSaveandApprove = true;
                    }
                    $scope.PatientBillDetails = [];
                    $scope.PatientBillDetails = patientbills.PatientBillDetails;
                    if (patientbills.PatientBillStatusId == 1) {
                        $scope.CanDelete = true;
                    } else {
                        $scope.CanDelete = false;
                    }

                    $scope.currentcontext.PatientBillStatusId = patientbills.PatientBillStatusId;
                    $scope.currentcontext.PatientStatusId = patientbills.PatientBillStatusId;
                    $scope.item.IsEmergency = patientbills.IsEmergency;
                    $scope.item.EncounterId = patientbills.EncounterId;
                    $scope.item.PatientName = patientbills.PatientName;
                    $scope.item.PatientBillStatus = patientbills.PatientBillStatus.Description;
                    $scope.item.GuarantorDueId = patientbills.GuarantorDueId || null;
                    $scope.item.PrivateDueId = patientbills.PrivateDueId || null;
                    $scope.item.IsManualBill = patientbills.IsManualBill;
                    $scope.item.ManualBillNumber = patientbills.ManualBillNumber;
                    $scope.item.ManualBillDate = patientbills.ManualBillDate;
                    $scope.item.ManualBillComments = patientbills.ManualBillComments;
                    $scope.item.GstAmount = patientbills.GSTAmount;
                    $scope.isSaveandApprove = true;
                    $scope.applyVisibilityRules();
                    $scope.setIndexforTableIndex();
                    $scope.PatientPaymentDetails = [];
                    $scope.PatientPaymentDetails = patientbills.PatientPaymentDetails;
                    $scope.PatientPaymentDetails.forEach(patpayinfo => {
                        if (patpayinfo.PaymentTypeId == 1 && patpayinfo.ReceiptStatusId == 1) {
                            $scope.currentcontext.TotCASHAmount += parseFloat(patpayinfo.AmountPaid);
                        }
                    });

                    $scope.CalculateNetAmt();
                    $scope.currentcontext.PendingAmt = patientbills.OutStandingAmount;
                    $scope.item.BillDateTime = patientbills.BillDateTime;
                    $scope.item.CardTypeId = -1;
                    $scope.item.BankId = -1;
                    $scope.item.ChequeNo = '';
                    $scope.item.DDNumber = '';
                    $scope.item.CollectedOn = utl.Formatter.getCurrentDate();
                    $scope.item.ChequeDate = utl.Formatter.getCurrentDate();
                    $scope.item.DDDate = utl.Formatter.getCurrentDate();
                    $scope.item.WireTransferId = -1;
                    $scope.item.AuthorizeNumber = '';

                    if (patientbills.PatientBillStatusId == 1)
                        $scope.isSaving = false;

                });

                $scope.EnableDisableDropdown($scope.isSaving);
                $scope.RdoPatientId = true;
                $scope.RdoBillnumber = true;
                $scope.canShowFinanceBtn = true;

                if ($scope.item.EncounterId)
                    $scope.getBilledEncounter($scope.item.EncounterId);
                else
                    $scope.fnencounter();

                if ($scope.chkfindBill == 0 && $scope.item.BillNumber)
                    $scope.print();

                if ($scope.item.PatientBillStatusId == 1) {
                    $scope.addNewLineItem();
                    $scope.ServiceItemMapping();
                }

            }
        };

        $scope.getBilledEncounter = function (encid) {
            if (encid && encid > 0) {
                var inputData = {
                    Params: [{
                        Key: 0,
                        Value: encid
                    }]
                };
                var options = {
                    action: 'Visit/Visit/GetEncounters',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getVisitIndentifier
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getBillInfoByBillNumber = function () {
            var SearchBillnumber = $scope.item.BillNumber;
            if ($scope.currentcontext.id <= 0 && (SearchBillnumber && SearchBillnumber.length > 0)) {
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
                    onComplete: $scope.getBillInfoCallback
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

        function onGuarantorSelected(dataFromModal) {
            $scope.currentfilter.GuarantorId = dataFromModal.gid;
            $scope.loadPatientGuarantors();
        }

        $scope.addGuarantor = function () {
            utl.Modal.openFixedDialog('app.patientguarantorlist', {
                params: {
                    id: 0,
                    pid: $scope.currentfilter.PatientId,
                    parent: 'txn'
                },
                confirmCallback: onGuarantorSelected
            });
        };

        var sort_by = function (field, reverse, primer) {
            var key = primer ?
                function (x) {
                    return primer(x[field])
                } :
                function (x) {
                    return x[field]
                };

            reverse = !reverse ? 1 : -1;

            return function (a, b) {
                return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
            }
        }

        $scope.guarantorType = function (guarantorid) {
            for (var idx in $scope.lookup.PatientGuarantor) {
                var item = $scope.lookup.PatientGuarantor[idx];
                if (item.Id == guarantorid) {
                    $scope.currentfilter.GuarantorTypeId = item.GuarantorTypeId;
                    $scope.currentfilter.ServiceRateCategoryId = item.Guarantor.ServiceRateCategoryId;
                    $scope.currentfilter.GuarantorName = item.Text;
                    if (item.GuarantorTypeId != 1)
                        $scope.item.GuarantorDueId = guarantorid;
                    else $scope.item.GuarantorDueId = 0;
                }
            }
        };

        $scope.loadPatientGuarantorsCallback = function (scope, data, options, hasError) {
            data.PatientGuarantor.sort(sort_by('Rank', false, parseInt));
            $scope.lookup['PatientGuarantor'] = data.PatientGuarantor;

            if (!$scope.currentfilter.GuarantorId || $scope.currentfilter.GuarantorId == -1) {
                $scope.currentfilter.GuarantorId = $scope.lookup.PatientGuarantor[1].Id;
            }
            $scope.guarantorType($scope.currentfilter.GuarantorId);
        };

        $scope.loadPatientGuarantors = function () {
            //Get only active guarantors - 2
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

        $scope.getVisitIndentifier = function (scope, data, options, hasError) {
            $scope.item.IsEncounter = false;
            if (data.Data.length > 0) {
                $scope.encounter = data.Data[0];
                $scope.item.EncounterId = $scope.encounter.Id;
                $scope.item.VisitNumber = $scope.encounter.VisitIdentifier;
                $scope.currentfilter.ReferralId = $scope.encounter.ReferralId || 0;
                $scope.currentfilter.ReferralName = $scope.encounter.ReferralName || null;
                $scope.item.DoctorId = $scope.encounter.DoctorId;
                if ($scope.encounter.Doctor)
                    $scope.item.DoctorName = $scope.encounter.Doctor.Title.Description + '  ' +
                    $scope.encounter.Doctor.FirstName + ' ' +
                    ($scope.encounter.Doctor.LastName != null ? $scope.encounter.Doctor.LastName : '');
                $scope.item.DepartmentId = $scope.encounter.DepartmentId;
                $scope.item.IsEncounter = true;
                $scope.item.TotalAvailableAmount = $scope.encounter.PaidAmount - $scope.encounter.AmountAdjusted;
            } else if (vm.Context == 'OP') {
                if (!$scope.item.BillNumber) {
                    utl.Alert.showErrorMsg('No Visit Created For The Selected Patient');
                }
            }
            $scope.doctorChange();
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
                    },
                    {
                        Key: 40,
                        Value: 1
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

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            savehitcompleted = 0;
            $scope.item.IsFromIPBill = 0;
            $scope.securitypisvalid = false;
            $scope.IpBillList = 0;
            $scope.IPIsBillLock = false;
            if ($scope.currentcontext.id <= 0)
                $scope.currentcontext.id = data;
            $scope.currentcontext.PaymentTypeId = 1;
            $scope.getBillInfoByBillId();

            $scope.applyVisibilityRules();

            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        };

        $scope.completeBill = function (action) {
            var msg = 'billing.billing-details.draft.lbl';
            if (action == $scope.saveAndApprove) {
                if ($scope.item.TotDiscAmount > 0 && !$scope.IsDiscountApproved) {
                    utl.Alert.showErrorMsg($scope.DiscountAlert);
                    return false;
                }
                msg = 'billing.billing-details.confirm.lbl';
                if (!utl.Validator.validate($scope)) {
                    $scope.isSaveandApprove = true;
                    return;
                }
            }

            $scope.requiredsecuritypin =
                utl.FacilitySetting.getFacilitySettingValue('billing', 'requiredsecuritypin');
            if ($scope.requiredsecuritypin) {
                action();
            } else {
                var confirmOptions = {
                    headingKey: 'common.confirm-modal-header.lbl',
                    messageKey: msg,
                    yesKey: 'common.yeskey.lbl',
                    noKey: 'common.nokey.lbl',
                    onSuccessMethod: action,
                };
                utl.Dialog.confirmMessage(confirmOptions);
            }
        };

        $scope.saveDraft = function () {
            if ($scope.IpBillList == 0) {
                // $scope.item.PatientBillStatusId = 1;
                $scope.item.BillDateTime = utl.Formatter.getCurrentDate();
                $scope.saveItem(1);
            }
        };

        /* Security IsValid */
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
                    utl.Modal.openFixedDialog('app.securitypincheck', {
                        params: {},
                        confirmCallback: $scope.SecurityPINChkCallback,
                        cancelCallback: $scope.securitypindiagCallback
                    });
                }
                return false;
            }
        };
        /* Security IsValid */

        $scope.saveAndApprove = function () {
            $scope.isSaveandApprove = false;
            if ($scope.item.BillNumber == null) {
                $scope.item.BillDateTime = utl.Formatter.getCurrentDate();
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

        $scope.onCancelConfirmed = function (reason) {
            $scope.item.CancelReason = reason;
            $scope.getBillInfoByBillId();
        };

        $scope.IsEmergency = function () {
            $scope.PatientBillDetails = [];
            $scope.PatientPaymentDetails = [];
            $scope.CalculateNetAmt();
            $scope.addNewLineItem();
            $timeout(function () {
                var idx = $scope.PatientBillDetails.length - 1;
                var nextId = "desc" + '' + idx;
                $('#' + nextId).focus();
            }, 500);
        };

        $scope.isPartiallyOrderCancelled = function () {
            var brst = false;
            if ($scope.PatientBillInfo.length > 0) {
                for (var i = 0; i < $scope.PatientBillInfo.length; i++) {
                    var billinfo = $scope.PatientBillInfo[i];
                    for (var j = 0; j < billinfo.PatientBillDetails.length; j++) {
                        var billdetailinfo = billinfo.PatientBillDetails[j];
                        if (billdetailinfo.PatientBillStatusId == 2 || billdetailinfo.OrderStatusId == 10) {
                            brst = true;
                        }
                    }
                }
            }
            return brst;
        };



        $scope.saveCancelled = function () {
            if (vm.Context == 'OP' && $scope.dgbillnosaveoption == 1) {
                utl.Alert.showErrorMsg('DG Bill Cancel Option not possible In OP Billing Screen.');
                return false;
            }
            if ($scope.isPartiallyOrderCancelled()) {
                utl.Alert.showErrorMsg('Cannot Cancel the full bill, Partially Order Status Changed...');
            } else {
                var confirmOptions = {
                    headingKey: 'common.confirm-modal-header.lbl',
                    messageKey: 'billing.opbilling-list.cancelmsg.lbl',
                    yesKey: 'common.yeskey.lbl',
                    noKey: 'common.nokey.lbl',
                    onSuccessMethod: $scope.CancelReceipt,
                };
                utl.Dialog.confirmMessage(confirmOptions);
            }
        };

        $scope.CancelReceipt = function () {
            $scope.openModal($scope.currentcontext.id, 'cancel');
        };

        $scope.ViewReceipt = function () {
            $scope.openModal($scope.currentcontext.id, 'view');
        };

        $scope.openModal = function (id, type, reason) {
            utl.Modal.openFixedDialog('app.cancelreceipt', {
                params: {
                    id: id,
                    type: type,
                    reason: $scope.currentcontext.CancelReason || '',
                    billinfo: $scope.PatientBillInfo,
                    billdate: $scope.item.BillDateTime,
                    facilityId: $scope.currentcontext.FacilityId
                },
                confirmCallback: $scope.onCancelConfirmed
            });
        };

        $scope.AdjustAgainstAdvance = function () {
            $scope.openAdvanceModal($scope.currentfilter.PatientId)
        };

        $scope.openAdvanceModal = function (patientid) {
            utl.Modal.openFixedDialog('app.adjustagainstadvance', {
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
                        PatientId: $scope.item.PatientId,
                        PatientName: $scope.item.PatientName,
                        EncounterId: $scope.item.EncounterId,
                        EncounterTypeId: vm.Context == 'OP' ? 1 : 4,
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

            if (AdjAmount > $scope.currentcontext.TotBalanceAmt) {
                utl.Alert.showErrorMsg('Adjusting Amount Should Not Greater Than Actual Bill/Due Amount.');
                AdjAmount = 0;
                PaymentAdjustmentDetail = {};
                $scope.PaymentAdjustmentDetails = [];
                return false;
            } else {
                $scope.currentcontext.ReceiptAmt = AdjAmount;
                $scope.item.Received = AdjAmount;
                $scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.TotNetAmount) - parseFloat($scope.currentcontext.PaidAmt) - AdjAmount;
                $scope.currentcontext.PaymentTypeId = 7;
                $scope.currentcontext.IsAdjustAgainstAdvance = true;
            }
        };

        $scope.GetPatientFinanceInfo = function () {
            $scope.openFinanceInfoModal($scope.currentfilter.PatientId)
        };

        $scope.openFinanceInfoModal = function (patientid) {
            utl.Modal.openFixedDialog('app.patientfinanceinfo', {
                params: {
                    id: patientid
                },
                confirmCallback: $scope.onCloseConfirmed
            });
        };

        $scope.saveItem = function (StatusId) {

            if (savehitcompleted == 1) return;

            if (vm.Context == 'OP' && $scope.dgbillnosaveoption == 1) {
                utl.Alert.showErrorMsg('DG Bill Save Option not possible In OP Billing Screen.');
                return false;
            }
            if (!$scope.item.BillNumber) {
                if ($scope.item.IsEncounter == false && vm.Context == 'OP') {
                    utl.Alert.showErrorMsg('No Visit Created For The Patient');
                    $scope.clear();
                    return false;
                }
            }

            var dTotNetAmount = parseFloat($scope.currentcontext.TotNetAmount);
            var dCNAmount = parseFloat($scope.currentcontext.CNAmount) || 0;
            var dPaidAmt = parseFloat($scope.currentcontext.PaidAmt);
            var dRefundamt = parseFloat($scope.currentcontext.RefundAmount) || 0;
            var dReceiptAmt = parseFloat($scope.currentcontext.ReceiptAmt) || 0;

            if (dReceiptAmt < 0) {
                utl.Alert.showErrorMsg('Receipt Amount should be greater than or equal to zero');
                dReceiptAmt = 0;
                return false;
            }

            if ($scope.currentfilter.ServiceRateCategoryId < 0) {
                utl.Alert.showErrorMsg('Select the Service Rate Category');
                return false;
            }
            if (!$scope.PatientBillDetails || $scope.PatientBillDetails.length == 0) {
                utl.Alert.showErrorMsg('Select Any Service');
                return false;
            } else {
                var iServiceNotSelected = 0;
                for (var idx in $scope.PatientBillDetails) {
                    var item = $scope.PatientBillDetails[idx];
                    if (item && item.ServiceId <= 0) {
                        iServiceNotSelected = 1;
                        break;
                    } else if ((item && !item.Quantity && item.Quantity <= 0) || item.Amount <= 0) {
                        iServiceNotSelected = 2;
                        break;
                    } else {
                        break;
                    }

                }

                if ($scope.currentcontext.BillDiscount > 0) {
                    var billingitem = null;
                    if ($scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 2) {
                        //$scope.currentcontext.DiscountAmount = $scope.currentcontext.BillDiscount / 100 * $scope.item.Amount;
                        for (var per = 0, perlen = $scope.PatientBillDetails.length; per < perlen; per++) {
                            billingitem = $scope.PatientBillDetails[per];
                            //if (billingitem.CanDiscountProportionate) {
                            $scope.PatientBillDetails[per].DiscountModeId = $scope.currentfilter.DiscountModeId;
                            $scope.PatientBillDetails[per].DiscountPercentage = $scope.currentcontext.BillDiscount;
                            $scope.PatientBillDetails[per].ProportionateDiscount = $scope.currentcontext.BillDiscount / 100 * $scope.PatientBillDetails[per].Amount;
                            //}
                        }
                    } else if ($scope.currentfilter.DiscountModeId == 1) {
                        $scope.currentcontext.DiscountAmount = $scope.currentcontext.BillDiscount;
                        for (var inr = 0, inrlen = $scope.PatientBillDetails.length; inr < inrlen; inr++) {
                            billingitem = $scope.PatientBillDetails[inr];
                            //if (billingitem.CanDiscountProportionate) {
                            var linepercentage = (100 / $scope.item.GrossAmount) * $scope.PatientBillDetails[inr].Amount;
                            var netdiscountrupees = $scope.currentcontext.DiscountAmount / 100 * linepercentage;
                            $scope.PatientBillDetails[inr].DiscountModeId = $scope.currentfilter.DiscountModeId;
                            $scope.PatientBillDetails[inr].DiscountPercentage = 0;
                            $scope.PatientBillDetails[inr].ProportionateDiscount = netdiscountrupees;
                            //}
                        }
                    }
                } else {
                    for (var idx in $scope.PatientBillDetails) {
                        var item = $scope.PatientBillDetails[idx];
                        if ($scope.currentfilter.DiscountModeId && $scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 2)
                            item.DiscountAmount = item.DiscountAmount / 100 * item.Amount;
                    }
                }

                if (iServiceNotSelected == 1) {
                    utl.Alert.showErrorMsg('Select Any Service');
                    return false;
                }

                if (iServiceNotSelected == 2) {
                    utl.Alert.showErrorMsg('Selected Service Quantity and Amount Should not be zero');
                    return false;
                }
            }

            $scope.item.PatientBillStatusId = StatusId;
            if ($scope.item.PatientBillStatusId == 1 && dReceiptAmt > 0) {
                utl.Alert.showErrorMsg('Amount collection use save and approve button');
                $scope.currentcontext.ReceiptAmt = null;
                dReceiptAmt = 0;
                $scope.CalculateNetAmt();
                return false;
            }

            $scope.item.EncounterTypeId = vm.Context == 'OP' ? 1 : 4;
            $scope.item.Id = $scope.currentcontext.id;
            $scope.item.NetAmount = parseFloat($scope.currentcontext.TotNetAmount);
            $scope.item.BillTypeId = vm.Context == 'OP' ? 1 : 5; // default op / ip / a & E
            $scope.item.BillPriorityId = 1;
            $scope.item.BillAmount = $scope.item.GrossAmount;
            $scope.item.BillDiscount = $scope.item.TotDiscAmount;
            $scope.item.BillDiscountModeId = $scope.currentfilter.DiscountModeId;
            $scope.item.BillDiscountTypeId = $scope.currentcontext.BillDiscountTypeId;
            $scope.item.RoundOffValue = 0;
            $scope.item.BilledCounter = 0;
            $scope.item.OutStandingAmount = ((dTotNetAmount - dCNAmount) - ((dPaidAmt - dRefundamt) + dReceiptAmt));

            if ($scope.item.PatientBillStatusId == 3) // Save and Approve
                $scope.item.PaidAmount = dPaidAmt + dReceiptAmt;
            else
                $scope.item.PaidAmount = 0;

            $scope.item.IsPaidFully = false;
            if ($scope.currentcontext.TotBalanceAmt == 0) {
                $scope.item.IsPaidFully = true;
            }
            $scope.item.ServiceTax = 0;
            $scope.item.EducationCess = 0;
            $scope.item.BillGeneratedBy = 0;
            $scope.item.DiscountApprovedBy = $scope.currentcontext.DiscountApprovedBy;
            $scope.item.IsIntermediateBill = 0;
            $scope.item.ParentBillId = 0;
            $scope.item.IsPackageBill = 0;
            $scope.item.PackageDiscount = 0;
            $scope.item.OrganizationId = 0;
            $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
            $scope.item.OrganizationId = utl.Session.getCurrentOrgId();
            $scope.item.DepartmentId = $scope.item.DepartmentId;
            $scope.item.PatientId = $scope.currentfilter.PatientId;
            $scope.item.GuarantorId = $scope.currentfilter.GuarantorId;
            $scope.item.GuarantorTypeId = $scope.currentfilter.GuarantorTypeId;
            $scope.item.GuarantorName = $scope.currentfilter.GuarantorName;
            $scope.item.ServiceRateCategoryId = $scope.currentfilter.ServiceRateCategoryId;
            $scope.item.ServiceRateCategoryName = $scope.currentfilter.ServiceRateCategoryName;
            $scope.item.ReferralId = $scope.currentfilter.ReferralId || null;
            $scope.item.ReferralName = $scope.currentfilter.ReferralName || '';
            $scope.item.PatientTypeId = 0;

            if ($scope.item.IsEncounter)
                $scope.item.EncounterId = $scope.encounter.Id;
            $scope.item.DoctorId = $scope.item.DoctorId;
            $scope.item.CancelledBy = 0;

            if ($scope.item.CancelReason)
                $scope.item.CancelledBy = utl.Session.getCurrentUserId();
            $scope.item.ReceiptGeneratedById = utl.Session.getCurrentUserId();


            if (!$scope.PatientPaymentDetails || $scope.PatientPaymentDetails.length == 0) {
                if ($scope.currentcontext.ReceiptAmt > 0) {
                    $scope.currentcontext.PaymentTypeId = $scope.currentcontext.PaymentTypeId;
                    $scope.currentcontext.ReceiptTypeId = 2;
                    $scope.currentcontext.ReceiptStatusId = 1;
                    $scope.AddPaymentDetails();
                }
            }

            if (parseFloat($scope.currentcontext.ReceiptAmt) > 0 && $scope.item.PatientBillStatusId == 3) {
                var billitem = null;
                var totalbillpayment = 0;
                totalbillpayment = parseFloat($scope.currentcontext.PaidAmt) + parseFloat($scope.currentcontext.ReceiptAmt);
                for (var pay = 0, paylen = $scope.PatientBillDetails.length; pay < paylen; pay++) {
                    billitem = $scope.PatientBillDetails[pay];
                    var linenetamount = billitem.NetAmount || 0;
                    var linediscountamount = billitem.DiscountAmount || 0;
                    var lineproportionatediscountamount = billitem.ProportionateDiscount || 0;
                    var actuallinenetamount = linenetamount - (linediscountamount + lineproportionatediscountamount);
                    //var actuallinenetamount = $scope.PatientBillDetails[pay].NetAmount - ($scope.PatientBillDetails[pay].DiscountAmount + $scope.PatientBillDetails[pay].ProportionateDiscount);
                    var linepercentage = (100 / parseFloat($scope.currentcontext.TotNetAmount)) * actuallinenetamount;
                    var netpaidrupees = totalbillpayment / 100 * linepercentage;
                    $scope.PatientBillDetails[pay].ReceivedAmount = parseFloat(netpaidrupees).toFixed(2);
                }
            }

            //Check Mandatory values
            if (checkMandatoryFields()) {
                var lines = getLinesForSave();
                lines.forEach((v, i) => {
                    v.PatientBillStatusId = StatusId
                });
                /*
                var paymentlines = [];
                if (!$scope.currentcontext.IsAdjustAgainstAdvance) {
                    paymentlines = getpaymentsLinesForSave();
                }

                var adjustments = [];
                if ($scope.currentcontext.IsAdjustAgainstAdvance) {
                    adjustments = $scope.PaymentAdjustmentDetails;
                }
                */

                var paymentlines = getpaymentsLinesForSave();
                var adjustments = $scope.PaymentAdjustmentDetails;

                var actionName = 'billing/patientbills/AddPatientBills';
                if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                    actionName = 'billing/patientbills/UpdatePatientBills';
                }

                savehitcompleted = 1;

                var inputData = {
                    Header: $scope.item,
                    Details: lines,
                    paymentDetail: paymentlines,
                    adjustmentDetail: adjustments
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
            }
        };

        function checkMandatoryFields() {
            var activeRecords = $filter('filterArrayItems')($scope.PatientBillDetails, [{
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
                if (item.Quantity > 0 && item.Amount > 0) {
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
                    item.DiscountAuthorizedBy = 0;
                    item.ReferalShare = 0;
                    item.CancelReason = null;
                    item.DoctorShare = item.DoctorShare || 0;
                    item.EncounterId = $scope.item.EncounterId;
                    item.EncounterTypeId = vm.Context == 'OP' ? 1 : 4;
                    item.AliasId = item.AliasId || null;
                    item.AliasName = item.AliasName || null;
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

        vm.pharmacyitemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Item Code',
                    field: 'ItemCode',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Item Name',
                    field: 'ItemName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
                /*
                {
                    header: 'Product Type Name',
                    field: 'ProductTypeName',
                    datatype: 'string',
                    headercls: 'td-producttypename',
                    fieldcls: 'td-producttypename'
                },
                */
                // {
                //     header: 'Generic Name',
                //     field: 'GenericName',
                //     datatype: 'string',
                //     headercls: 'td-genericname',
                //     fieldcls: 'td-genericname'
                // },
                /*
                {
                    header: 'Manufacturer Name',
                    field: 'ManufacturerName',
                    datatype: 'string',
                    headercls: 'td-manufacturername',
                    fieldcls: 'td-manufacturername'
                },
                */
                // {
                //     header: 'Claim',
                //     field: 'Claimable',
                //     datatype: 'string',
                //     headercls: 'td-claimable',
                //     fieldcls: 'td-claimable'
                // },
                // {
                //     header: 'Rack Name',
                //     field: 'RackName',
                //     datatype: 'string',
                //     headercls: 'td-rackname',
                //     fieldcls: 'td-rackname'
                // },
                {
                    header: 'Stock-In-Hand',
                    field: 'StockInHand',
                    datatype: 'string',
                    headercls: 'td-stockinhand',
                    fieldcls: 'td-stockinhand'
                },
                {
                    header: 'Sales Price',
                    field: 'MrPrice',
                    datatype: 'string',
                    headercls: 'td-mrprice',
                    fieldcls: 'td-mrprice'
                }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/itemmaster/GetPharmacyStoreItems',
            formatdisplay: formatselectedpharmacyitem,
            presearch: presearchpharmacyitem,
            postsearch: postsearchpharmacyitem
        };

        function formatselectedpharmacyitem() {
            $scope.autosearchpopup = 0;
            var selectedItem = vm.pharmacyitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ItemName, selectedItem.ItemCode].join(' ');
            } else if (vm.pharmacyitemcontrolconfig.rowdata) {
                result = [vm.pharmacyitemcontrolconfig.rowdata.ItemName, vm.pharmacyitemcontrolconfig.rowdata.ItemCode].join(' ');
            }
            return result;
        }

        function presearchpharmacyitem() {
            var query = vm.pharmacyitemcontrolconfig.query;
            var TodayDate = new Date().toISOString().slice(0, 10);
            var inputData = {
                Params: [{
                        Key: 1,
                        Value: $scope.currentfilter.StoreMasterId
                    },
                    // {
                    //     Key: 8,
                    //     Value: $scope.currentfilter.StoreTypeId
                    // },
                    {
                        Key: 12,
                        Value: TodayDate
                    },
                    {
                        Key: 13,
                        Value: 1
                    },
                    {
                        Key: 15,
                        Value: 1
                    }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.pharmacyitemcontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 3,
                    Value: query
                });
            }

            vm.pharmacyitemcontrolconfig.searchparams = inputData;
        }

        function postsearchpharmacyitem() {
            $scope.autosearchpopup = 1;
            for (var idx in vm.pharmacyitemcontrolconfig.result) {
                var item = vm.pharmacyitemcontrolconfig.result[idx];
                var SerialItems = null;
                var SerialQuantity = 0;
                item.ItemCode = '(' + item.ItemCode + ')';
                item.ItemName = item.ItemName;
                /*
                if (item.ItemMaster.ProductType !== null) {
                    item.ProductTypeName = item.ItemMaster.ProductType.ProductTypeName;
                } else {
                    item.ProductTypeName = '';
                }
                */
                if (item.ItemMaster) {
                    item.GenericName = item.ItemMaster.GenericName;
                } else {
                    item.GenericName = '';
                }
                /*
                if (item.ItemMaster.GenericMaster !== null) {
                    item.GenericName = item.ItemMaster.GenericMaster.GenericName;
                } else {
                    item.GenericName = '';
                }
                */
                /*
                item.ManufacturerName = item.ManufacturerName;
                */
                /*
                if (item.ItemMaster.Manufacturer !== null) {
                    item.ManufacturerName = item.ItemMaster.Manufacturer.VendorName;
                } else {
                    item.ManufacturerName = '';
                }
                */
                item.RackName = item.RackName;
                if (item.ItemMaster.StockItem !== null) {
                    if (item.ItemMaster.StockItem &&
                        item.ItemMaster.StockItem.StockSerialItems.length > 0) {
                        SerialItems = item.ItemMaster.StockItem.StockSerialItems;
                        for (var batid = 0; batid < SerialItems.length; batid++) {
                            SerialQuantity = SerialQuantity + SerialItems[batid].Quantity;
                        }
                    }
                    item.StockInHand = SerialQuantity;
                } else {
                    item.StockInHand = 0;
                }
                item.MrPrice = item.ItemMaster.MrPrice;
                item.IsNonClaimable = item.ItemMaster.IsNonClaimable;
                if (item.IsNonClaimable == false) {
                    item.Claimable = 'Y'
                } else {
                    item.Claimable = 'N'
                }
            }
        }



        function loadData() {
            $scope.patientChange();
            $scope.applyVisibilityRules();
            // $scope.clear();
            $scope.currentfilter.GuarantorTypeId = -1;
            if (vm.Context == 'DG') {
                $scope.currentfilter.GuarantorTypeId = 1;
                $scope.item.DepartmentId = 126;
                var guarantor = {
                    Id: 1
                };
                $scope.GuarantorTypeChange(guarantor)
            }
        }

        $scope.updateCount = function () {

        };

        $scope.getPatientAlertsCallback = function (scope, res, options, hasError) {
            if ($scope.currentfilter.PatientId == -1)
                $scope.currentcontext.patientAlertsCount = 0;
            if ($scope.currentfilter.PatientId != -1)
                $scope.currentcontext.patientAlertsCount = res.Data.length;
        };

        $scope.getPatientAlertsCount = function () {
            var inputData = {
                Params: [{
                        Key: 4,
                        Value: $scope.currentfilter.PatientId
                    },
                    {
                        Key: 5,
                        Value: utl.Session.getUserDepartments()
                    },
                    {
                        Key: 6,
                        Value: utl.Session.getCurrentUserId()
                    }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'generalmaster/PatientAlert/GetPatientAlerts',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientAlertsCallback
            };

        };

        $scope.getGeneralAlertsCallback = function (scope, res, options, hasError) {
            $scope.currentcontext.generalAlertsCount = res.Data.length;
        };

        $scope.getGeneralAlertsCount = function () {
            var inputData = {
                Params: [{
                        Key: 5,
                        Value: utl.Session.getUserDepartments()
                    },
                    {
                        Key: 6,
                        Value: utl.Session.getCurrentUserId()
                    },
                    {
                        Key: 7,
                        Value: true
                    }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'generalmaster/PatientAlert/GetPatientAlerts',
                data: inputData,
                type: 'post',
                onComplete: $scope.getGeneralAlertsCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addReferralCallback = function (data) {
            $scope.currentfilter.ReferralId = data;
            $scope.initLookup();
        };

        $scope.addReferral = function () {
            utl.Modal.openFixedDialog('app.referral', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.addReferralCallback
            });
        };

        function defaultReferral() {
            for (var idx in $scope.lookup.Referral) {
                var item = $scope.lookup.Referral[idx];
                if (item.Id == $scope.currentfilter.ReferralId) {
                    $scope.currentfilter.ReferralName = item.Text;
                }
            }
        }

        $scope.orderinfo = function (idx, item) {
            item.currenteditable = true;
            item.IsDisabled = $scope.IsDisabled;
            utl.Modal.openFixedDialog('patientemr.patientorderdetail', {
                params: {
                    id: 0,
                    pid: $scope.selectedPatient.Id,
                    current_item: item
                },
                confirmCallback: $scope.onDetailSave
            });
        };

        $timeout(function () {
            removeFloatingNav();
        }, 100);

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
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $('#btnsubmit').text("Save (F2)");
            $('#saveAndApproveid').text("Approve(F4)");
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
                            $scope.currentfilter.ExpiryWarningDays = $scope.lookup.UserStores[usidx].StoreMaster.ExpiryWarningDays;
                            $scope.currentfilter.ExpiryPriorStopDays = $scope.lookup.UserStores[usidx].StoreMaster.ExpiryPriorStopDays;
                        }
                    }
                    if ($scope.currentfilter.StoreMasterId === 0) {
                        $scope.currentfilter.StoreMasterId = value[0].Id;
                        $scope.currentfilter.StoreTypeId = value[0].StoreMaster.StoreTypeId;
                        $scope.currentfilter.StoreSubTypeId = value[0].StoreMaster.StoreSubTypeId;
                        $scope.currentfilter.SequenceOptionId = value[0].StoreMaster.SequenceOptionId;
                        $scope.currentfilter.ExpiryWarningDays = value[0].StoreMaster.ExpiryWarningDays;
                        $scope.currentfilter.ExpiryPriorStopDays = value[0].StoreMaster.ExpiryPriorStopDays;
                    }
                }
                if (key == 'FacilityPreference') {
                    $scope.item.PreferedRoundOff = value[0].PreferenceValue;
                }
                if (key == 'ServiceCategory') {
                    for (var scidx in $scope.lookup.ServiceCategory) {
                        if ($scope.lookup.ServiceCategory[scidx].ServiceCategoryCode === 'DRUG') {
                            $scope.item.DrugServiceCategoryId = $scope.lookup.ServiceCategory[scidx].Id;
                            $scope.item.DrugServiceGroupId = $scope.lookup.ServiceCategory[scidx].ServiceGroupId;
                        }
                        if ($scope.lookup.ServiceCategory[scidx].ServiceCategoryCode === 'NONDRUG') {
                            $scope.item.NonDrugServiceCategoryId = $scope.lookup.ServiceCategory[scidx].Id;
                            $scope.item.NonDrugServiceGroupId = $scope.lookup.ServiceCategory[scidx].ServiceGroupId;
                        }
                    }
                }
            });
            $scope.currentcontext.TotCASHAmount = 0;
            if ($stateParams.id) {
                $scope.chkfindBill = 1;
                $scope.getBillInfoByBillId();
            }
        };

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "DiscountApprover"
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
                    "Key": "PrivateDueApprover"
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
                    "Key": "PharmacySaleType",
                    Default: false
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
                    "Key": "ServiceCategory"
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

        $scope.initLookup();
    }

    pharmacybillmodifyviewController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$timeout'];

})();