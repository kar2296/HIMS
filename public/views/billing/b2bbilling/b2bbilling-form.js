(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('b2bBillingFormController', b2bBillingFormController);

    function b2bBillingFormController($scope, $stateParams, $state, $translate, utl, $filter, $timeout) {
        var vm = this;
        var savehitcompleted = 0;

        $scope.autosearchpopup = 0;
        $scope.dmprintpreferences = 0;
        $scope.printpreferences = 1;
        $scope.chkfindBill = 0;
        $scope.dgbillnosaveoption = 0;
        $scope.IpBillList = 0;
        $scope.SelectedIndex = -1;
        $scope.isSaveandApprove = true;
        $scope.isSaving = true;
        $scope.outstanding = true;
        $scope.IPIsBillLock = false;
        $scope.RdoPatientId = false;
        $scope.RdoBillnumber = false;
        $scope.IsDue = false;
        $scope.CanDelete = false;
        $scope.canShowFinanceBtn = false;
        $scope.canShowAdvanceBtn = false;

        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));
        angular.extend(this, utl.Ctrl.getDMPrintDataController({ $scope: $scope }));

        $scope.PatientBillInfo = [];
        $scope.PatientBillInfoDetails = [];
        $scope.DeletedPatientBills = [];
        $scope.PatientBillDetails = [];
        $scope.PatientPaymentDetails = [];

        $scope.selectedPatient = {};
        $scope.tabindexmap = {
            patienttabindex: 1,
            detailtabindex: 2
        };



        $scope.currentcontext = {};
        $scope.currentcontext.id = 0;
        $scope.currentcontext.PatientBillStatusId = 1;
        $scope.currentcontext.PatientStatusId = 1;
        $scope.currentcontext.RdoBillDiscount = true;
        $scope.currentcontext.RdoBillDiscountMode = true;
        $scope.currentcontext.Rdobilldate = true;
        $scope.currentcontext.BillDiscount = 0;
        $scope.currentcontext.PaymentTypeId = 1;
        $scope.currentcontext.TotNetAmount = 0;
        $scope.currentcontext.TotDiscountAmt = 0;
        $scope.currentcontext.PaidAmt = 0;
        $scope.currentcontext.ReceiptAmt = null;
        $scope.currentcontext.TotBalanceAmt = 0;
        $scope.currentcontext.TotDueAmt = 0;
        $scope.currentcontext.RefundAmount = 0;
        $scope.currentcontext.CNAmount = 0;
        $scope.currentcontext.PendingAmt = 0;

        $scope.currentfilter = {};
        $scope.currentfilter.ReferralId = -1;
        $scope.currentfilter.PatientId = -1;
        $scope.currentfilter.patientname = '';
        $scope.currentfilter.DoctorName = '';
        $scope.currentfilter.GuarantorName = '';
        $scope.currentfilter.ServiceRateCategoryName = '';
        $scope.currentfilter.B2BCustomerMasterId = -1;
        $scope.currentfilter.ServiceRateCategoryId = 1;
        $scope.currentfilter.DiscountModeId = 2;
        $scope.currentfilter.DiscountModeValue = 0;
        $scope.currentfilter.FacilityId = utl.Session.getCurrentFacilityId();

        $scope.item = {};
        $scope.item.PatientId = -1;
        $scope.item.PatientBillStatusId = 1;
        $scope.item.CollectedOn = utl.Formatter.getCurrentDate();
        $scope.item.ChequeDate = utl.Formatter.getCurrentDate();
        $scope.item.DDDate = utl.Formatter.getCurrentDate();
        $scope.item.WireTransferDate = utl.Formatter.getCurrentDate();
        $scope.item.TotalPaidAmount = 0;
        $scope.item.TotalAvailableAmount = 0;
        $scope.item.TotalDueAmount = 0;
        $scope.item.VisitNumber = null;
        $scope.item.PendingOrders = 0;

        $scope.fillDefaultValues = function () { };
        if ($stateParams.billingorderdetails) {
            $scope.OrderBillDetails = $stateParams.billingorderdetails;
            for (var iddx in $scope.OrderBillDetails) {
                var billingorderdetails = {
                    RdoDiscountMode: true, // disable discount mode
                    RdoDiscount: true, // disable discount
                    Id: 0,
                    ServiceId: $scope.OrderBillDetails[iddx].Testmaster.ServiceItem.Id,
                    ServiceCode: $scope.OrderBillDetails[iddx].Testmaster.ServiceItem.ItemCode,
                    ServiceName: $scope.OrderBillDetails[iddx].Testmaster.ServiceItem.Name,
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
                    Quantity: $scope.OrderBillDetails[iddx].Quantity,
                    Rate: $scope.OrderBillDetails[iddx].TestPrice,
                    Amount: $scope.OrderBillDetails[iddx].NetAmount,
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
                    tabindex: $scope.tabindexmap.detailtabindex++
                }
                $scope.PatientBillDetails.push(billingorderdetails);
            }
        }

        $scope.getPatientInfo = function (scope, data, options, hasError) {
            $scope.selectedPatient = data;
            $scope.item.PatientName = $scope.selectedPatient.FirstName;
            $scope.item.PatientId = $scope.selectedPatient.Id;
            $scope.item.MRN = $scope.selectedPatient.MRN;
            $scope.item.DoctorId = -1;
            $scope.item.DepartmentId = -1;
            if ($scope.selectedPatient.Encounters && $scope.selectedPatient.Encounters.length > 0) {
                var encounter = $scope.selectedPatient.Encounters[0] || {};
                if (encounter && encounter.EncounterTypeId == 2) {
                }
            }
            $scope.fnencounter();
            if ($scope.currentfilter.PatientId > 0 && !$scope.item.BillNumber) {
                if ($scope.currentcontext.id <= 0)
                    $scope.getBillInfoByPatientID();
            }
            $scope.getPatientPendingOrders();
        };

        $scope.order_dashboard = function () {
            // if ($scope.currentfilter.TestTypeId == 1)
            $state.go('app.lisdashboard');
            // else if ($scope.currentfilter.TestTypeId == 2)
            //     $state.go('app.risdashboard');
        };
        $scope.patientChange = function () {
            $scope.chkfindBill = 0;
            if ($scope.currentfilter.PatientId > 0) {
                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: { Id: $scope.currentfilter.PatientId },
                    type: 'post',
                    onComplete: $scope.getPatientInfo
                };
                utl.Http.doAction(options);
            }
        };

        if ($stateParams.id && $stateParams.id > 0) {
            $scope.item.PatientId = parseInt($stateParams.id);
            $scope.currentfilter.PatientId = parseInt($stateParams.id);
        }
        if (!$scope.currentcontext.id || $scope.currentcontext.id == 0) {
            $scope.fillDefaultValues();
        }

        $scope.getPatientPendingOrders = function () {
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.item.PatientId },
                    { Key: 4, Value: 1 },
                    { Key: 19, Value: 1 }
                ],
                PageContext: { PageSize: 1000, PageNumber: 1 }
            };

            var options = {
                action: 'emr/patientorder/GetPatientOrders',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientPendingOrdersCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getPatientPendingOrdersCallback = function (scope, data, options, hasError) {
            $scope.item.PendingOrders = data.Data.length;
        };

        $scope.getBillInfoByPatientID = function () {
            if ($scope.currentfilter.PatientId && $scope.currentcontext.id <= 0) {
                var inputData = {
                    Params: [
                        { Key: 3, Value: $scope.currentfilter.PatientId },
                        { Key: 6, Value: vm.Context == 'OP' ? 1 : 5 }
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
                    Params: [
                        { Key: 17, Value: FromDate },
                        { Key: 18, Value: ToDate },
                        { Key: 6, Value: 1 }
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

        $scope.ServiceRateCatChange = function (SelectedSerRateCat) {
            $scope.currentfilter.ServiceRateCategoryId = SelectedSerRateCat.Id;
            $scope.currentfilter.ServiceRateCategoryName = SelectedSerRateCat.Text;
            $scope.PatientBillDetails = [];
            $scope.PatientPaymentDetails = [];
            $scope.addNewLineItem();
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
                SNo: 0,
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
                ItemCost: 0,
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
                tabindex: $scope.tabindexmap.detailtabindex++
            };

            if ($scope.currentcontext.id > 0) {
                PatientBillDetails.PatientBillId = $scope.currentcontext.id;
            }

            $scope.PatientBillDetails.push(PatientBillDetails);

            $scope.SelectedIndex = $scope.PatientBillDetails.length;

            $scope.setIndexforTableIndex();
        };

        $scope.addnewbill = function () {
            utl.Modal.open('app.opbillinginfo-form', {
                params: { id: 0 },
                confirmCallback: $scope.getList
            });
        };

        $scope.CancelBillItemWise = function () {
            if (vm.Context == 'OP' && $scope.dgbillnosaveoption == 1) {
                utl.Alert.showErrorMsg('DG Bill Itemwise Cancel Option not possible In OP Billing Screen.');
                return false;
            }

            utl.Modal.open('app.itemwiseopbillcancel', {
                params: { id: $scope.currentcontext.id },
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
                    Params: [
                        { Key: 12, Value: FromDate },
                        { Key: 13, Value: ToDate },
                        { Key: 2, Value: $scope.item.PatientId },
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

        $scope.ServiceItemChanged = function (idx, item) {
            var isDuplicate = utl.Common.isDuplicateRec($scope.PatientBillDetails, { pivotkey: 'ServiceId', displaykey: 'ServiceName' });
            if (isDuplicate) {
                item.ServiceId = '';
                item.ServiceName = '';
                return;
            }

            $scope.getOrderInfoDetails(item.SelectedItem);

            //please publish and sahll debug -- please repat test da..
            //shall do now test..
            // var ServiceItemobj = $filter('filter')($scope.lookup.ServiceItem, { Id: item.ServiceId }, true);
            var ServiceItemobj = item.SelectedItem;
            if (ServiceItemobj != null) {
                item.DisableRate = !ServiceItemobj.IsRateEditable;
                item.ServiceCode = ServiceItemobj.ItemCode;
                item.ServiceName = ServiceItemobj.Name;
                item.TestCode = ServiceItemobj.ItemCode;
                item.TestName = ServiceItemobj.Name;
                item.TestDescription = ServiceItemobj.Name;
                item.DepartmentId = ServiceItemobj.DepartmentId;
                item.SubDepartmentId = ServiceItemobj.SubDepartmentId;
                item.IsOrderable = ServiceItemobj.IsOrderable;
                item.CanDiscountProportionate = ServiceItemobj.CanDiscountProportionate;
                item.ServiceCategoryId = ServiceItemobj.CategoryId;
                item.MasterTypeId = ServiceItemobj.MasterTypeId;
                item.TestId = ServiceItemobj.MasterItemId;
                item.TestTypeId = ServiceItemobj.OrderTypeId;
                item.MasterItemId = ServiceItemobj.MasterItemId;
                item.MasterName = ServiceItemobj.MasterName;
                item.IsNightCharge = ServiceItemobj.IsNightCharge;
                item.ItemCost = ServiceItemobj.ItemCost;
                item.DoctorId = $scope.item.DoctorId;
                item.DoctorName = $scope.item.DoctorName;
                item.RdoDiscountMode = false;
                item.IsPackageItem = ServiceItemobj.IsPackage;
                var ServiceTraiffobj = $filter('filter')(ServiceItemobj.ServiceItemTariffDetails, { ServiceRateCategoryId: $scope.currentfilter.ServiceRateCategoryId }, true);
                if (ServiceTraiffobj != null && ServiceTraiffobj.length > 0) {
                    item.ServiceRateCategoryId = ServiceTraiffobj[0].ServiceRateCategoryId;
                    item.ServiceRateCategoryName = ServiceTraiffobj[0].Text;
                    if ($scope.item.IsEmergency) {
                        item.Rate = ServiceTraiffobj[0].EmergencyRate;
                    } else {
                        item.Rate = ServiceTraiffobj[0].Rate;
                    }
                    item.DoctorShare = ServiceTraiffobj[0].DoctorShare;
                    $scope.CalcualteAmt(item);
                    var lastIndex = $scope.PatientBillDetails.length - 1;
                    if (idx == lastIndex) {
                        $scope.addNewLineItem();
                    }
                }
                var selectedGuarantor = utl.Lookup.getObject($scope.lookup.PatientGuarantor, $scope.currentfilter.GuarantorId);
                if (selectedGuarantor && selectedGuarantor.GuarantorId) {
                    var ServiceItemAliasobj = $filter('filter')(ServiceItemobj.ServiceItemAliases, { ExternalProviderId: selectedGuarantor.GuarantorId }, true);
                    if (ServiceItemAliasobj != null && ServiceItemAliasobj.length > 0) {
                        item.AliasId = ServiceItemAliasobj[0].AliasId;
                        item.AliasName = ServiceItemAliasobj[0].AliasName;
                    }
                }
            }
            $scope.getBillInfoDetails(ServiceItemobj);
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
            var itemwiseGrossAmt = 0
            var itemwiseNetAmt = 0;
            var itemwiseDiscountAmt = 0;
            for (var i = 0, len = $scope.PatientBillDetails.length; i < len; i++) {
                if ($scope.PatientBillDetails[i].Status == 1) {
                    var itemnetAmount = 0;
                    var itemGrossAmount = 0;
                    var itemDiscountAmount = 0;

                    itemnetAmount = isNaN(parseFloat($scope.PatientBillDetails[i].NetAmount)) ? 0 : parseFloat($scope.PatientBillDetails[i].NetAmount);
                    itemGrossAmount = isNaN(parseFloat($scope.PatientBillDetails[i].Amount)) ? 0 : parseFloat($scope.PatientBillDetails[i].Amount);
                    itemDiscountAmount = isNaN(parseFloat($scope.PatientBillDetails[i].DiscountAmount)) ? 0 : parseFloat($scope.PatientBillDetails[i].DiscountAmount);
                    if ($scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 2) {
                        itemDiscountAmount = itemDiscountAmount / 100 * itemGrossAmount;
                    }
                    itemwiseGrossAmt += itemGrossAmount;
                    itemwiseNetAmt += itemnetAmount;
                    itemwiseDiscountAmt += itemDiscountAmount;
                }
            }
            $scope.currentcontext.PaidAmt = (!$scope.currentcontext.PaidAmt) ? 0 : $scope.currentcontext.PaidAmt;
            $scope.item.TotDiscAmount = 0;
            $scope.item.GrossAmount = 0;
            $scope.currentcontext.TotNetAmount = 0;
            $scope.currentcontext.TotBalanceAmt = 0;

            $scope.item.GrossAmount = itemwiseGrossAmt;

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

            if ($scope.item.TotDiscAmount > 0) {
                $scope.DiscountAlert = '';
                $scope.IsDiscountApproved = true;
                if ($scope.currentcontext.DiscountApprovedBy > 0) {
                    if ($scope.DiscountLimit != null && $scope.item.TotDiscAmount > $scope.DiscountLimit) {
                        $scope.DiscountAlert = 'Maximum Discount of Rs.' + $scope.DiscountLimit + ' Only Can be Given For the Selected Discount Approver';
                        utl.Alert.showErrorMsg($scope.DiscountAlert);
                        $scope.IsDiscountApproved = false;
                    }
                }
                else {
                    $scope.DiscountAlert = 'Please Select Due Approver';
                    utl.Alert.showErrorMsg($scope.DiscountAlert);
                    $scope.IsDiscountApproved = false;
                }
            }

            $scope.currentcontext.TotNetAmount = parseFloat($scope.item.GrossAmount) - parseFloat($scope.item.TotDiscAmount);

            /* Rounding Values */
            var NetNaturalValue = getNatural(Number($scope.currentcontext.TotNetAmount).toFixed(2));
            var NetDecimalValue = getDecimal(Number($scope.currentcontext.TotNetAmount).toFixed(2));
            var NetRoundOffValue = 0;

            if (NetDecimalValue > 0 && NetDecimalValue < 50) {
                $scope.currentcontext.TotNetAmount = NetNaturalValue;
                NetRoundOffValue = -1 * (NetDecimalValue / 100);
                $scope.item.RoundOffValue = parseFloat(NetRoundOffValue);
            } else if (NetDecimalValue >= 50 && NetDecimalValue <= 99) {
                $scope.currentcontext.TotNetAmount = NetNaturalValue + 1;
                NetRoundOffValue = (100 - NetDecimalValue) / 100;
                $scope.item.RoundOffValue = parseFloat(NetRoundOffValue);
            } else {
                NetRoundOffValue = 0;
                $scope.item.RoundOffValue = parseFloat(NetRoundOffValue);
            }
            /* Rounding Values */

            //$scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.TotNetAmount) - parseFloat($scope.currentcontext.ReceiptAmt) - parseFloat($scope.currentcontext.PaidAmt);
            $scope.currentcontext.TotBalanceAmt = (parseFloat($scope.currentcontext.TotNetAmount) - parseFloat($scope.currentcontext.CNAmount || 0)) - parseFloat($scope.currentcontext.ReceiptAmt) - (parseFloat($scope.currentcontext.PaidAmt) - parseFloat($scope.currentcontext.RefundAmount));
            //var billBalance = parseFloat($scope.currentcontext.TotNetAmount) - parseFloat($scope.currentcontext.PaidAmt);
            var billBalance = (parseFloat($scope.currentcontext.TotNetAmount) - parseFloat($scope.currentcontext.CNAmount || 0)) - (parseFloat($scope.currentcontext.PaidAmt) - parseFloat($scope.currentcontext.RefundAmount));

            if ($scope.currentcontext.ReceiptAmt > $scope.currentcontext.TotNetAmount || $scope.currentcontext.TotBalanceAmt < 0) {
                $scope.currentcontext.ReceiptAmt = null;
                $scope.currentcontext.TotBalanceAmt = billBalance;
                utl.Alert.showSuccessMsg($translate.instant('billing.ipbillingtab.billdiscount.lbl'));
            }
            if ($scope.item.TotDiscAmount > $scope.currentcontext.TotNetAmount || $scope.currentcontext.TotBalanceAmt < 0) {
                $scope.currentcontext.dBillDiscount = 0;
                $scope.currentcontext.ReceiptAmt = null;
                $scope.currentcontext.TotBalanceAmt = 0;
                utl.Alert.showSuccessMsg($translate.instant('billing.ipbillingtab.billdiscount.lbl'));
            }

            $scope.item.Received = $scope.currentcontext.ReceiptAmt != 0 ?
                $scope.currentcontext.ReceiptAmt : $scope.currentcontext.PaidAmt != 0 ? $scope.currentcontext.PaidAmt : 0;
            $scope.currentcontext.ReceiptAmt = (!$scope.currentcontext.ReceiptAmt) ? null : $scope.currentcontext.ReceiptAmt;



        };

        function getNatural(num) {
            return parseFloat(num.toString().split(".")[0]);
        }

        function getDecimal(num) {
            return parseFloat(num.toString().split(".")[1]);
        }

        $scope.clear = function () {
            $state.reload();
        };

        $scope.addNewBill = function () {
            if ($stateParams.id > 0) {
                $state.go('app.opbilling-list', { id: 0 });
            } else {
                $state.reload();
            }
        };

        $scope.editInfo = function () {
            utl.Modal.open('app.opbillinginfo-form', {
                params: { id: 0 },
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
                    data: { Id: pendingData.id },
                    type: 'post',
                    onComplete: $scope.getPendingData
                };

                utl.Http.doAction(options);
            }

        };

        $scope.pendingOrder = function () {
            utl.Modal.open('app.pendingorder', {
                params: { id: $scope.currentfilter.PatientId },
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
            utl.Modal.open('app.findbill-list', {
                params: { id: $scope.currentfilter.PatientId },
                confirmCallback: patientBillPickerCallback
            });
            $scope.chkfindBill = 1;
        };

        $scope.patientprofiledetails = function () {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: $scope.currentfilter.PatientId },
                confirmCallback: $scope.getItem
            });
        };

        $scope.pendingBill = function () {
            utl.Modal.open('app.pendingbill-list', {
                params: { id: $scope.currentfilter.PatientId },
                confirmCallback: patientBillPickerCallback
            });
        };

        $scope.outstandingBill = function () {
            utl.Modal.open('app.outstandingbill-list', {
                params: { id: $scope.currentfilter.PatientId },
                confirmCallback: patientBillPickerCallback
            });
        };

        $scope.billHistory = function () {
            utl.Modal.open('app.billhistory-list', {
                params: { id: 0 },
                confirmCallback: $scope.getList
            });
        };

        $scope.add_new = function () {
            utl.Modal.open('app.opbilling-list', {
                params: { id: 0 },
                confirmCallback: $scope.getList
            });
        };

        $scope.openAttachments = function () {
            utl.Modal.open('app.patientattachments', {
                params: { pid: 0, itemid: 0 },
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
            $state.go('app.opbilling-list', $scope.currentcontext.id);
        };

        $scope.EditLineItem = function (item) {
            var idx = $scope.PatientBillDetails.indexOf(item);
            $scope.PatientBillDetails[idx].DoctorId = item.DoctorId;
            $scope.PatientBillDetails[idx].DiscountTypeId = item.DiscountTypeId;
            $scope.PatientBillDetails[idx].IsDoctorDiscount = item.IsDoctorDiscount;
            $scope.PatientBillDetails[idx].Comments = item.Comments;
        };

        $scope.editPatientBillDetails = function (idx, item) {
            var IsEditable = false;
            if ($scope.currentcontext.PatientBillStatusId == 1) {
                IsEditable = true
            }
            utl.Modal.open('app.obillingmore', {
                params: { itemid: idx, item: item, patient: $scope.selectedPatient, IsEditable },
                confirmCallback: $scope.EditLineItem
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
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $state.reload();
        };

        $scope.onBillDeleteConfirmed = function (deleteid) {
            var options = {
                action: 'billing/patientbills/DeletePatientBills',
                data: { Id: deleteid },
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
                    Params: [
                        { Key: 0, Value: serviceid }
                    ],
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
            $scope.PatientBillInfo = res.Data || [];
            if ($scope.PatientBillInfo && $scope.PatientBillInfo.length > 0) {
                $scope.PatientBillInfo.forEach(patientbills => {
                    $scope.item.PatientId = patientbills.PatientId;
                    $scope.item.PatientBillStatusId = patientbills.PatientBillStatusId;
                    $scope.item.TotalDueAmount = patientbills.OutStandingAmount;
                    $scope.item.TotalPaidAmount = patientbills.PaidAmount;
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
                    $scope.currentfilter.ServiceRateCategoryId = patientbills.ServiceRateCategoryId;

                    $scope.PatientBillDetails = [];
                    $scope.PatientBillDetails = patientbills.PatientBillDetails;
                    if (patientbills.PatientBillStatusId == 1) {
                        $scope.CanDelete = true;
                    } else { $scope.CanDelete = false; }

                    $scope.currentcontext.PatientBillStatusId = patientbills.PatientBillStatusId;
                    $scope.currentcontext.PatientStatusId = patientbills.PatientBillStatusId;
                    $scope.item.IsEmergency = patientbills.IsEmergency;
                    $scope.item.EncounterId = patientbills.EncounterId;
                    $scope.item.PatientName = patientbills.PatientName;
                    $scope.item.PatientBillStatus = patientbills.PatientBillStatus.Description;

                    $scope.applyVisibilityRules();
                    $scope.CalculateNetAmt();
                    $scope.currentcontext.PendingAmt = patientbills.OutStandingAmount;
                    $scope.item.BillDateTime = patientbills.BillDateTime;
                });

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
                    Params: [
                        { Key: 0, Value: encid }
                    ]
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
                    Params: [
                        { Key: 2, Value: SearchBillnumber }
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

        $scope.getBillInfoByBillId = function () {
            var SearchBillId = $scope.currentcontext.id;
            if (SearchBillId && SearchBillId > 0) {
                var inputData = {
                    Params: [
                        { Key: 0, Value: SearchBillId }
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

        $scope.getVisitIndentifier = function (scope, data, options, hasError) {
            $scope.item.IsEncounter = false;
            if (data.Data.length > 0) {
                $scope.encounter = data.Data[0];
                $scope.item.EncounterId = $scope.encounter.Id;
                $scope.item.VisitNumber = $scope.encounter.VisitIdentifier;
                $scope.currentfilter.B2BCustomerMasterId = $scope.encounter.B2BCustomerMasterId || 0;
                if ($scope.encounter.B2BCustomerMaster) {
                    $scope.currentfilter.ServiceRateCategoryId = $scope.encounter.B2BCustomerMaster.ServiceRateCategoryId;
                }
                $scope.currentfilter.ClinicalNotes = $scope.encounter.ClinicalNotes;
                $scope.currentfilter.ReferralId = $scope.encounter.ReferralId || 0;
                $scope.currentfilter.ReferralName = $scope.encounter.ReferralName || null;
                $scope.item.DoctorId = $scope.encounter.DoctorId;
                if ($scope.encounter.Doctor)
                    $scope.item.DoctorName = $scope.encounter.Doctor.Title.Description + '  '
                        + $scope.encounter.Doctor.FirstName + ' '
                        + ($scope.encounter.Doctor.LastName != null ? $scope.encounter.Doctor.LastName : '');
                $scope.item.DepartmentId = $scope.encounter.DepartmentId;
                $scope.item.IsEncounter = true;

                $scope.addNewLineItem();
            } else {
                if (!$scope.item.BillNumber) {
                    utl.Alert.showErrorMsg('No Visit Created For The Selected Patient');
                }
            }
        };

        $scope.fnencounter = function () {
            var inputData = {
                Params: [
                    { Key: 14, Value: 1 },
                    { Key: 4, Value: $scope.currentfilter.PatientId },
                    { Key: 15, Value: 4 },
                    { Key: 52, Value: 1 }
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
            if ($scope.currentcontext.id <= 0)
                $scope.currentcontext.id = data;
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

        $scope.saveAndApprove = function () {
            $scope.isSaveandApprove = false;
            if ($scope.item.BillNumber == null) {
                $scope.item.BillDateTime = utl.Formatter.getCurrentDate();
            }

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

        $scope.CancelCompleteBill = function () {
            if (vm.Context == 'OP' && $scope.dgbillnosaveoption == 1) {
                utl.Alert.showErrorMsg('DG Bill Cancel Option not possible In OP Billing Screen.');
                return false;
            }
            if ($scope.isPartiallyOrderCancelled()) {
                utl.Alert.showErrorMsg('Cannot Cancel the full bill, Partially Order Status Changed...');
            }
            else {
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
            utl.Modal.open('app.cancelreceipt', {
                params: {
                    id: id, type: type,
                    reason: $scope.currentcontext.CancelReason || '', billinfo: $scope.PatientBillInfo,
                    billdate: $scope.item.BillDateTime,
                    facilityId: $scope.currentcontext.FacilityId
                },
                confirmCallback: $scope.onCancelConfirmed
            });
        };

        $scope.GetPatientFinanceInfo = function () {
            $scope.openFinanceInfoModal($scope.currentfilter.PatientId)
        };

        $scope.openFinanceInfoModal = function (patientid) {
            utl.Modal.open('app.patientfinanceinfo', {
                params: { id: patientid },
                confirmCallback: $scope.onCloseConfirmed
            });
        };

        $scope.saveItem = function (StatusId) {

            if (savehitcompleted == 1) return;

            /*
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
            */

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

                /*
                if ($scope.currentcontext.BillDiscount > 0) {
                    var billingitem = null;
                    if ($scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 2) {
                        for (var per = 0, perlen = $scope.PatientBillDetails.length; per < perlen; per++) {
                            billingitem = $scope.PatientBillDetails[per];
                            $scope.PatientBillDetails[per].DiscountModeId = $scope.currentfilter.DiscountModeId;
                            $scope.PatientBillDetails[per].DiscountPercentage = $scope.currentcontext.BillDiscount;
                            $scope.PatientBillDetails[per].ProportionateDiscount = $scope.currentcontext.BillDiscount / 100 * $scope.PatientBillDetails[per].Amount;
                        }
                    } else if ($scope.currentfilter.DiscountModeId == 1) {
                        $scope.currentcontext.DiscountAmount = $scope.currentcontext.BillDiscount;
                        for (var inr = 0, inrlen = $scope.PatientBillDetails.length; inr < inrlen; inr++) {
                            billingitem = $scope.PatientBillDetails[inr];
                            var linepercentage = (100 / $scope.item.GrossAmount) * $scope.PatientBillDetails[inr].Amount;
                            var netdiscountrupees = $scope.currentcontext.DiscountAmount / 100 * linepercentage;
                            $scope.PatientBillDetails[inr].DiscountModeId = $scope.currentfilter.DiscountModeId;
                            $scope.PatientBillDetails[inr].DiscountPercentage = 0;
                            $scope.PatientBillDetails[inr].ProportionateDiscount = netdiscountrupees;
                        }
                    }
                } else {
                    for (var idx in $scope.PatientBillDetails) {
                        var item = $scope.PatientBillDetails[idx];
                        if ($scope.currentfilter.DiscountModeId && $scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 2)
                            item.DiscountAmount = item.DiscountAmount / 100 * item.Amount;
                    }
                }
                */

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
            /*
            if ($scope.item.PatientBillStatusId == 1 && dReceiptAmt > 0) {
                utl.Alert.showErrorMsg('Amount collection use save and approve button');
                $scope.currentcontext.ReceiptAmt = null;
                dReceiptAmt = 0;
                $scope.CalculateNetAmt();
                return false;
            }
            */

            $scope.item.EncounterTypeId = 4;
            $scope.item.Id = $scope.currentcontext.id;
            $scope.item.NetAmount = parseFloat($scope.currentcontext.TotNetAmount);
            $scope.item.BillTypeId = 6;
            $scope.item.BillPriorityId = 1;
            $scope.item.BillAmount = $scope.item.GrossAmount || 0;
            $scope.item.BillDiscount = $scope.item.TotDiscAmount || 0;
            $scope.item.BillDiscountModeId = $scope.currentfilter.DiscountModeId;
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
            $scope.item.DiscountApprovedBy = $scope.currentcontext.DiscountApprovedBy || 0;
            $scope.item.IsIntermediateBill = 0;
            $scope.item.ParentBillId = 0;
            $scope.item.IsPackageBill = 0;
            $scope.item.PackageDiscount = 0;
            $scope.item.OrganizationId = 0;
            $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
            $scope.item.OrganizationId = utl.Session.getCurrentOrgId();
            $scope.item.DepartmentId = $scope.item.DepartmentId || 0;
            $scope.item.PatientId = $scope.currentfilter.PatientId || 0;
            $scope.item.ServiceRateCategoryId = $scope.currentfilter.ServiceRateCategoryId;
            $scope.item.PatientTypeId = 0;

            if ($scope.item.IsEncounter)
                $scope.item.EncounterId = $scope.encounter.Id;
            $scope.item.DoctorId = $scope.item.DoctorId;
            $scope.item.CancelledBy = 0;

            if ($scope.item.CancelReason)
                $scope.item.CancelledBy = utl.Session.getCurrentUserId();
            $scope.item.ReceiptGeneratedById = utl.Session.getCurrentUserId();

            /*
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
                    var linepercentage = (100 / parseFloat($scope.currentcontext.TotNetAmount)) * actuallinenetamount;
                    var netpaidrupees = totalbillpayment / 100 * linepercentage;
                    $scope.PatientBillDetails[pay].ReceivedAmount = parseFloat(netpaidrupees).toFixed(2);
                }
            }
            */

            if (checkMandatoryFields()) {
                var lines = getLinesForSave();
                lines.forEach((v, i) => { v.PatientBillStatusId = StatusId });

                var actionName = 'billing/patientbills/AddPatientB2BBills';
                if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                    actionName = 'billing/patientbills/UpdatePatientB2BBills';
                }

                savehitcompleted = 1;

                var inputData = { Header: $scope.item, Details: lines, paymentDetail: [], adjustmentDetail: [] };

                var options = {
                    action: actionName,
                    data: { Data: inputData },
                    type: 'post',
                    onComplete: $scope.saveItemCallback
                };

                utl.Http.doAction(options);
            }
        };

        function checkMandatoryFields() {
            var activeRecords = $filter('filterArrayItems')($scope.PatientBillDetails, [
                { search: 1, fields: ['Status'] }
            ]);
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

        function getLinesForSave() {
            var result = [];
            for (var idx in $scope.PatientBillDetails) {
                var item = $scope.PatientBillDetails[idx];
                if (item.Quantity > 0 && item.Amount > 0) {
                    item.GrossAmount = item.Amount;
                    item.DiscountAmount = item.DiscountAmount;
                    item.DoctorDiscountAmount = 0;
                    item.GSTId = item.GSTId || 0;
                    item.TaxId = item.GSTId || 0;
                    item.TaxCost = item.GSTAmount || 0;
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
                    item.DiscountTypeId = item.DiscountTypeId || 0;
                    item.DiscountAuthorizedBy = 0;
                    item.ReferalShare = 0;
                    item.CancelReason = null;
                    item.DoctorShare = item.DoctorShare || 0;
                    item.EncounterId = $scope.item.EncounterId;
                    item.EncounterTypeId = 4;
                    item.AliasId = item.AliasId || 0;
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

        vm.serviceitemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Service Code', field: 'ServiceCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Service Name', field: 'ServiceName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'ServiceItem Rate', field: 'ServiceItemRate', datatype: 'string', headercls: 'td-rate', fieldcls: 'td-rate' },
                { header: 'Night Tariff %', field: 'NightTariffAmt', datatype: 'string', headercls: 'td-rate', fieldcls: 'td-rate' },
                { header: 'Holiday Tariff %', field: 'HolidayTariffAmt', datatype: 'string', headercls: 'td-rate', fieldcls: 'td-rate' }
            ],
            searchparams: {},
            result: {},
            api: 'ClinicalMaster/ServiceItem/GetServiceItems',
            formatdisplay: formatselectedserviceitem,
            presearch: presearchserviceitem,
            postsearch: postsearchserviceitem
        };

        function formatselectedserviceitem() {
            $scope.autosearchpopup = 0;
            var selectedItem = vm.serviceitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ServiceName + '(' + selectedItem.ServiceCode + ')'].join(' ');
            } else if (vm.serviceitemcontrolconfig.rowdata) {
                result = [vm.serviceitemcontrolconfig.rowdata.ServiceCode, vm.serviceitemcontrolconfig.rowdata.ServiceName].join(' ');
            }
            return result;
        }

        function presearchserviceitem() {
            var query = vm.serviceitemcontrolconfig.query;

            //Search only active patients
            var inputData = {
                Params: [
                    { Key: 4, Value: 2 },
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            inputData.Params.push({ Key: 8, Value: utl.Session.getCurrentFacilityId() });

            if (vm.serviceitemcontrolconfig.searchbyid == true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.serviceitemcontrolconfig.searchparams = inputData;
        }

        function postsearchserviceitem() {
            $scope.autosearchpopup = 1;
            for (var idx in vm.serviceitemcontrolconfig.result) {
                var item = vm.serviceitemcontrolconfig.result[idx];
                item.ServiceCode = item.ItemCode;
                item.ServiceName = item.Name;
                var ServiceTraiffobj = $filter('filter')(item.ServiceItemTariffDetails, { ServiceRateCategoryId: $scope.currentfilter.ServiceRateCategoryId }, true);
                if (ServiceTraiffobj != null && ServiceTraiffobj.length > 0) {
                    item.ServiceItemRate = ServiceTraiffobj[0].Rate;
                    item.DoctorShare = ServiceTraiffobj[0].DoctorShare;
                }
                var selectedGuarantor = utl.Lookup.getObject($scope.lookup.PatientGuarantor, $scope.currentfilter.GuarantorId);
                if (selectedGuarantor && selectedGuarantor.GuarantorId) {
                    var ServiceItemAliasobj = $filter('filter')(item.ServiceItemAliases, { ExternalProviderId: selectedGuarantor.GuarantorId }, true);
                    if (ServiceItemAliasobj != null && ServiceItemAliasobj.length > 0) {
                        item.AliasId = ServiceItemAliasobj[0].AliasId;
                        item.AliasName = ServiceItemAliasobj[0].AliasName;
                    }
                }
            }
        }



        function loadData() {
            $scope.patientChange();
            $scope.applyVisibilityRules();
        }

        $scope.orderinfo = function (idx, item) {
            item.currenteditable = true;
            item.IsDisabled = $scope.IsDisabled;
            utl.Modal.open('patientemr.patientorderdetail', {
                params: { id: 0, pid: $scope.selectedPatient.Id, current_item: item },
                confirmCallback: $scope.onDetailSave
            });
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

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $('#btnsubmit').text("Save (F2)");
            $('#saveAndApproveid').text("Save & Approve (F4)");
            $scope.lookup = hasError ? {} : data;
            loadData();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Department" },
                {
                    "Key": "ServiceRateCategory",
                    Request: {
                        Params: [{ Key: 2, Value: utl.Session.getCurrentFacilityId() }]
                    },
                    Default: false
                },
                {
                    "Key": "B2BCustomerMaster", Request: {
                        Params: [
                            { Key: 1, Value: utl.Session.getCurrentFacilityId() }
                        ]
                    }
                },
                { "Key": "DiscountMode" },
                { "Key": "Facility" }
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        /* Set Focus Starts Here */

        $scope.moveHeaderFocus = function (nextId) {
            if (event.keyCode == 13) {
                if (nextId == "pid") {
                    var idx = $scope.PatientBillDetails.length - 1;
                    nextId = "desc" + '' + idx;
                    $('#' + nextId).focus();
                }
            }
        };

        $scope.moveFocus = function (nextId, prevId, downId, upId, index, event, item) {
            if (event.keyCode == 39) { // right
                nextId = nextId + index;
                $('#' + nextId).select();
                $('#' + nextId).focus();
            } else if (event.keyCode == 37) { // left
                prevId = prevId + index;
                $('#' + prevId).focus();
            } else if (event.keyCode == 38) { // Up
                if (upId == 'qty') {
                    upId = upId + (index - 1);
                    $('#' + upId).focus();
                }
                else if (upId == 'desc') {
                    if ($scope.autosearchpopup == 0) {
                        upId = upId + (index - 1);
                        $('#' + upId).focus();
                    }
                }
            } else if (event.keyCode == 40) { // Down
                downId = downId + (index + 1);
                $('#' + downId).focus();
            }
            if (event.keyCode == 13) {
                if (nextId == 'desc') {
                    var idx = $scope.PatientBillDetails.length - 1;
                    nextId = "desc" + '' + idx;
                    if (idx == (index)) {
                        var paytypedom = document.getElementById('paymenttype');
                        $scope.setCmbFocus(paytypedom);
                    } else {
                        $timeout(function () {
                            $('#' + nextId).focus();
                        }, 100);
                    }
                } else if (nextId == 'qty' && (!(item.RdoServiceId || item.ServiceId <= 0))) {
                    nextId = nextId + index;
                    $('#' + nextId).select();
                    $('#' + nextId).focus();
                } else if (nextId == 'rate' && (!(item.RdoServiceId || item.ServiceId <= 0 || !item.SelectedItem.IsRateEditable))) {
                    nextId = nextId + index;
                    $('#' + nextId).select();
                    $('#' + nextId).focus();
                } else if (nextId == 'discount' && (!(item.RdoServiceId || item.ServiceId <= 0))) {
                    nextId = nextId + index;
                    $('#' + nextId).select();
                    $('#' + nextId).focus();
                } else if (nextId == 'DoctorShare' && (!(item.RdoServiceId || item.ServiceId <= 0))) {
                    nextId = nextId + index;
                    $('#' + nextId).select();
                    $('#' + nextId).focus();
                } else {
                    var idx = $scope.PatientBillDetails.length - 1;
                    nextId = "desc" + '' + idx;
                    if (idx == (index)) {
                        var paytypedom = document.getElementById('paymenttype');
                        $scope.setCmbFocus(paytypedom);
                    } else {
                        $timeout(function () {
                            $('#' + nextId).focus();
                        }, 100);
                    }
                }
            }
            if (event.keyCode == 9) {
                if (nextId == 'desc') {
                    $scope.ValidQty(downId + index);
                    $scope.currentcontext.ReceiptAmt = $scope.currentcontext.TotNetAmount;
                    $scope.updateReceiptAmt();
                }
            }
            if (event.key == "Delete" && event.keyCode == 46) {
                $scope.onDeleteConfirmed(item);
                $timeout(function () {
                    var idx = $scope.PatientBillDetails.length - 1;
                    nextId = "desc" + '' + idx;
                    $('#' + nextId).focus();
                }, 10);
            }
        };

        $scope.ValidQty = function (nextId) {
            if ($('#' + nextId).val() === '')
                $('#' + nextId).val(0);
        };

        $scope.setCmbFocus = function (dom) {
            $timeout(function () {
                var uiSelect = angular.element(dom);
                var uichild = uiSelect.controller('uiSelect');
                uichild.activate();
            }, 100);
        };

        $scope.FooterFocus = function (nextId) {
            if (event.keyCode == 13) {
                if (nextId == "paymenttype") {
                    if ($scope.currentcontext.PaymentTypeId == 1) {
                        nextId = "receivedamt"; $('#' + nextId).focus();
                    }
                    else {
                        var banknamedom = document.getElementById('BankName');
                        $scope.setCmbFocus(banknamedom);
                    }
                }
                else if (nextId == "BankName") {
                    $timeout(function () {
                        if ($scope.currentcontext.PaymentTypeId == 2) {
                            nextId = "chequeno"; $('#' + nextId).focus();
                        }
                        else if ($scope.currentcontext.PaymentTypeId == 3) {
                            nextId = "ddno"; $('#' + nextId).focus();
                        }
                        else if ($scope.currentcontext.PaymentTypeId == 4) {
                            nextId = "transationno"; $('#' + nextId).focus();
                        }
                        else if ($scope.currentcontext.PaymentTypeId == 5 || $scope.currentcontext.PaymentTypeId == 6) {
                            nextId = "cardno"; $('#' + nextId).focus();
                        }
                    }, 500);
                }
                else if (nextId == "cardno") {
                    if ($scope.currentcontext.PaymentTypeId == 5 || $scope.currentcontext.PaymentTypeId == 6) {
                        var dom1 = document.getElementById('TerminalNoId');
                        $scope.setCmbFocus(dom1);
                    }
                }
                else if (nextId == "TerminalNoId") {
                    if ($scope.currentcontext.PaymentTypeId == 5 || $scope.currentcontext.PaymentTypeId == 6) {
                        var dom2 = document.getElementById('CardType');
                        $scope.setCmbFocus(dom2);
                    }
                }
                else if (nextId == "chequeno") {
                    if ($scope.currentcontext.PaymentTypeId == 2) {
                        nextId = "CollectedOn"; $('#' + nextId).focus();
                    }
                }
                else if (nextId == "transationno") {
                    if ($scope.currentcontext.PaymentTypeId == 4) {
                        nextId = "CollectedOn"; $('#' + nextId).focus();
                    }
                }
                else if (nextId == "ddno") {
                    if ($scope.currentcontext.PaymentTypeId == 3) {
                        nextId = "CollectedOn"; $('#' + nextId).focus();
                    }
                }
                else if (nextId == "CollectedOn") {
                    if ($scope.currentcontext.PaymentTypeId == 2) {
                        nextId = "Chequedate"; $('#' + nextId).focus();
                    }
                    if ($scope.currentcontext.PaymentTypeId == 3) {
                        nextId = "dddate"; $('#' + nextId).focus();
                    }
                    if ($scope.currentcontext.PaymentTypeId == 4) {
                        nextId = "transferredon"; $('#' + nextId).focus();
                    }
                }
                else if (nextId == "Chequedate") {
                    if ($scope.currentcontext.PaymentTypeId == 2) {
                        nextId = "saveAndApproveid"; $('#' + nextId).focus();
                    }
                }
                else if (nextId == "dddate") {
                    if ($scope.currentcontext.PaymentTypeId == 3) {
                        nextId = "saveAndApproveid"; $('#' + nextId).focus();
                    }
                }
                else if (nextId == "transferredon") {
                    if ($scope.currentcontext.PaymentTypeId == 4) {
                        nextId = "saveAndApproveid"; $('#' + nextId).focus();
                    }
                }
                else if (nextId == "CardType") {
                    if ($scope.currentcontext.PaymentTypeId == 5 || $scope.currentcontext.PaymentTypeId == 6) {
                        nextId = "saveAndApproveid";
                        $('#' + nextId).focus();
                    }
                }
                else if (nextId == "receivedamt") {
                    if ($('#' + nextId).val() <= 0) {
                        var creditapproverdom = document.getElementById('creditapprover');
                        $scope.setCmbFocus(creditapproverdom);
                    } else {
                        nextId = "saveAndApproveid";
                        $('#' + nextId).focus();
                    }
                } else if (nextId == "creditapprover") {
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

        /* Set Focus Ends Here */

        /* Shortcut Keys Starts Here */
        function keyupHandler(e) {
            var kCode = e.keyCode;
            if (kCode == 113 && savehitcompleted === 0 && $scope.canShowSaveBtn) { // F2  - SaveDraft
                $scope.completeBill($scope.saveDraft);
            }
            if (kCode == 115 && savehitcompleted === 0 && $scope.canShowSaveapproveBtn) { // F2  - SaveAndApprove
                $scope.completeBill($scope.saveAndApprove);
            }
            if (kCode == 118) { // F7  - New Page
                $scope.addNewBill();
            }
            if (kCode == 119) { // F8  - Find Bills
                $scope.findBill();
            }
            if (e.altKey && kCode == 83 && savehitcompleted === 0 && $scope.canShowSaveBtn) { // alt + s  - SaveDraft
                $scope.completeBill($scope.saveDraft);
            }
            if (e.altKey && kCode == 65 && savehitcompleted === 0 && $scope.canShowSaveapproveBtn) { // alt + s  - SaveAndApprove
                $scope.completeBill($scope.saveAndApprove);
            }
            if (e.altKey && kCode == 80) { // alt + p  - DMPrint
                if ($scope.dmprintpreferences > 0) {
                    $scope.dmPrint();
                } else {
                    $scope.print();
                }
            }
            if (kCode == 27) {// Esc
                $scope.autosearchpopup = 0;
            }
        }

        angular.element(document).on('keydown', keyupHandler);

        $scope.$on('$destroy', function () {
            angular.element(document).off('keydown', keyupHandler);
        });
        /* Shortcut Keys Ends Here */

        $scope.getPharmacyPrintPreference();
        $scope.initLookup();
    }

    b2bBillingFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$timeout'];

})();