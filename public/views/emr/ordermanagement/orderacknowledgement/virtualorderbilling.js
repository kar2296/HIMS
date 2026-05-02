(function () {
    'use strict';

    var opbilling = angular.module('app.pages');
    opbilling.directive('onlyDecimalNr', function () {
        return {
            require: '?ngModel',
            link: function (scope, element, attrs, ngModelCtrl) {
                if (!ngModelCtrl) {
                    return;
                }
                ngModelCtrl.$parsers.push(function (val) {
                    if (angular.isUndefined(val)) {
                        var val = '';
                    }
                    var clean = val.replace(/[^-0-9\.]/g, '');
                    var negativeCheck = clean.split('-');
                    var decimalCheck = clean.split('.');
                    if (!angular.isUndefined(negativeCheck[1])) {
                        negativeCheck[1] = negativeCheck[1].slice(0, negativeCheck[1].length);
                        clean = negativeCheck[0] + '-' + negativeCheck[1];
                        if (negativeCheck[0].length > 0) {
                            clean = negativeCheck[0];
                        }
                    }
                    if (!angular.isUndefined(decimalCheck[1])) {
                        decimalCheck[1] = decimalCheck[1].slice(0, 2);
                        clean = decimalCheck[0] + '.' + decimalCheck[1];
                    }
                    if (val !== clean) {
                        ngModelCtrl.$setViewValue(clean);
                        ngModelCtrl.$render();
                    }
                    return clean;
                });
                element.bind('keypress', function (event) {
                    if (event.keyCode === 32) {
                        event.preventDefault();
                    }
                });
            }
        };
    });
    opbilling.controller('virtualOrderBillingController', virtualOrderBillingController);

    function virtualOrderBillingController($rootScope, $scope, $stateParams, $state, $translate, utl, $filter, $timeout) {
        var vm = this;
        var savehitcompleted = 0;

        $scope.autosearchpopup = 0;
        $scope.dmprintpreferences = 0;
        $scope.printpreferences = 1;
        $scope.chkfindBill = 0;
        $scope.dgbillnosaveoption = 0;
        $scope.IpBillList = 0;
        $scope.IPIsBillLock = false;

        $scope.lookup = {};
        $scope.DoctorClassId = -1;
        $scope.DrIncludeTax = false;
        $scope.DrShareDetailInfo = {};
        $scope.SerItmCalculateTax = false;
        $scope.SerItmGSTInfo = {};
        $scope.DrIdDrShareDetailInfo = {};
        $scope.DrIdDoctorClassId = {};
        $scope.DrIdDrIncludeTax = {};

        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }

        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        angular.extend(this, utl.Ctrl.getDMPrintDataController({
            $scope: $scope
        }));

        vm.Context = $stateParams.tp;

        $scope.SelectedIndex = -1;
        $scope.isSaveandApprove = true;
        $scope.PatientBillInfo = [];
        $scope.PatientBillInfoDetails = [];
        $scope.PackageInfoDetails = [];
        $scope.item = {};
        $scope.selectedPatient = {};
        $scope.currentcontext = {};

        $scope.tabindexmap = {
            patienttabindex: 1,
            detailtabindex: 2
        };
        $scope.currentcontext = {};
        $scope.item.OrganizationId = utl.Session.getCurrentOrgId();

        $scope.currentcontext.selecteddept = [];

        $scope.currentfilter = {
            ReferralId: vm.Context == 'DG' ? -1 : 0
        };

        if (vm.Context == 'DG') {
            $scope.currentfilter.GuarantorTypeId = 1;
            $scope.patientfilterconfig = {
                isbilloutstanding: true,
                isvisitinprogress: false
            };
        }


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
        $scope.item.TaxAmt = 0; // GSTAmount
        $scope.CanDelete = false;
        $scope.canShowFinanceBtn = false;
        $scope.canShowAdvanceBtn = false;
        $scope.IsDueAllowed = utl.Session.getIsDueCheck();
        if ($stateParams.bid) {
            $scope.currentcontext.id = parseInt($stateParams.bid);
        }
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

        $scope.item.PatientPendingOrdersCount = 0;

        $scope.opd_dashboard = function () {
            $state.go('app.opddashboard');
        };

        $scope.order_dashboard = function () {
            // if ($scope.currentfilter.TestTypeId == 1)
            $state.go('app.lisdashboard');
            // else if ($scope.currentfilter.TestTypeId == 2)
            //     $state.go('app.risdashboard');
        };
        $scope.backtoList = function () {
            if ($scope.Context == 'frontoffice') {
                $state.go('app.frontdashboard');
            } else if ($scope.Context == 'billing') {
                $state.go('app.billingsdashboard');
            }

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
        $scope.currentcontext.CanOP_Cancel = utl.Privilege.hasAccess('CanOP_Cancel');
        $scope.currentcontext.CanOP_PartialCancel = utl.Privilege.hasAccess('CanOP_PartialCancel');
        $scope.currentcontext.CanOP_PreviousBills = utl.Privilege.hasAccess('CanOP_PreviousBills');
        $scope.currentcontext.CanOP_OutStandingBills = utl.Privilege.hasAccess('CanOP_OutStandingBills');
        $scope.EnableDisableDropdown($scope.isSaving);

        $scope.fillDefaultValues = function () { };

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
                utl.Modal.open('app.ipbilltoopbill', {
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
                    action: 'billing/patientbills/PrintOPConsolidateWithoutPharmacy',
                    data: inputData,
                    type: 'post'
                };
                utl.Http.doDownload(options);
            }
        };

        $scope.getPatientPendingOrdersCountCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                $scope.item.PatientPendingOrdersCount = res.Data.length;
            }
        };

        $scope.getPatientPendingOrdersCount = function (testdata) {
            // var FromDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00');
            // var ToDate = $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59');
            if ($scope.item.PatientId) {
                var inputData = {
                    Params: [
                        // {
                        //     Key: 12,
                        //     Value: FromDate
                        // },
                        // {
                        //     Key: 13,
                        //     Value: ToDate
                        // },
                        {
                            Key: 2,
                            Value: $scope.item.PatientId
                        },
                        {
                            Key: 4,
                            Value: 1
                        },
                        {
                            Key: 19,
                            Value: 1
                        }
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
                    onComplete: $scope.getPatientPendingOrdersCountCallback
                };
                utl.Http.doAction(options);
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
            $scope.item.PatientMrn = $scope.selectedPatient.MRN;
            $scope.item.TotalAvailableAmount = $scope.selectedPatient.AmountPaid - $scope.selectedPatient.AmountAdjusted;
            $scope.canShowFinanceBtn = true;
            $scope.canShowAdvanceBtn = true;
            if (vm.Context == 'DG') {
                $scope.item.MRN = $scope.selectedPatient.MRN;
                $scope.item.DoctorId = -1;
                $scope.item.DepartmentId = -1;
            }
            // $scope.loadPatientGuarantors();
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
                if (!$scope.currentfilter.GuarantorTypeId) {
                    $scope.currentfilter.GuarantorTypeId = encGuarantor.GuarantorTypeId;
                }
                // $scope.GuarantorTypeChange({
                //     Id: encGuarantor.GuarantorTypeId
                // })
            }
            $scope.fnencounter();
            if ($scope.currentfilter.PatientId > 0 && !$scope.item.BillNumber) {
                $scope.isSaving = false;
                $scope.outstanding = false;
                $scope.EnableDisableDropdown($scope.isSaving);

                if ($scope.currentcontext.id <= 0)
                    $scope.getBillInfoByPatientID();
            }
            //$scope.getGeneralAlertsCount();
            //             $scope.getPatientAlertsCount();
            $scope.getPatientPendingOrdersCount();
        };

        $scope.patientChange = function () {
            $scope.chkfindBill = 0;
            if ($scope.item.PatientId > 0) {
                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: {
                        Id: $scope.item.PatientId
                    },
                    type: 'post',
                    onComplete: $scope.getPatientInfo
                };
                utl.Http.doAction(options);
            }
        };

        if ($stateParams.id && $stateParams.id > 0) {
            $scope.item.PatientId = parseInt($stateParams.id);
            $scope.currentfilter.PatientId = parseInt($stateParams.id);
            //$scope.patientChange();
        }

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
                    // onComplete: $scope.getBillInfoCallback
                    onComplete: $scope.getPendingBillCallBack
                };
                utl.Http.doAction(options);
            } else {
                $scope.clear();
            }
        };


        $scope.getPendingBillCallBack = function (scope, res, options, hasError) {
            $scope.item.IsFromIPBill = 0;
            $scope.PatientBillInfo = res.Data || [];
            $scope.item.Count = $scope.PatientBillInfo.length;
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
            // $scope.item.GuarantorDueId = SelectedGuarantor.Id;
            $scope.currentfilter.GuarantorName = SelectedGuarantor.Text;
            $scope.currentfilter.GuarantorTypeId = SelectedGuarantor.GuarantorTypeId;
            $scope.currentfilter.ServiceRateCategoryId = SelectedGuarantor.Guarantor.ServiceRateCategoryId;
            $scope.PatientBillDetails = [];
            $scope.PatientPaymentDetails = [];
            $scope.item.GuarantorDueId = SelectedGuarantor.Id;
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
            if (item.DiscountMode) {
                if (item.DiscountMode.Description == "%") {
                    $scope.DiscountLimit = (parseFloat($scope.item.GrossAmount) * item.DiscountLimit) / 100;
                }
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

                //                 $scope.calDoctorShareInfo(doctorObj);

            }
        };

        $scope.calDoctorShareInfo = function (doctorObj) {
            if (doctorObj.DoctorClassId) {
                $scope.DoctorClassId = doctorObj.DoctorClassId;
                $scope.DrIncludeTax = doctorObj.IsIncludeTax;
                $scope.DrShareDetailInfo = {};
                $scope.SerItmCalculateTax = false;
                $scope.SerItmGSTInfo = {};
                if (doctorObj.DoctorClassId > 0) {
                    var inputData = {
                        Params: [{
                            Key: 2,
                            Value: doctorObj.DoctorClassId
                        },
                        {
                            Key: 4,
                            Value: 1
                        }, // EncounterTypeId
                        ],
                        PageContext: {
                            PageSize: -1,
                            PageNumber: 1
                        }
                    };
                    var options = {
                        action: 'billing/doctorshare/GetDoctorShare',
                        data: inputData,
                        type: 'post',
                        onComplete: $scope.getDoctorShareCallback
                    };
                    utl.Http.doAction(options);
                }
            }
        };

        $scope.getDoctorShareCallback = function (scope, res, options, hasError) {
            if (res && res.Data) {
                for (var idx in res.Data) {
                    var item = res.Data[idx];
                    $scope.DrShareDetailInfo = item.DoctorShareDetails;
                    if (!$scope.DrIdDrShareDetailInfo[$scope.item.DoctorId]) {
                        $scope.DrIdDrShareDetailInfo[$scope.item.DoctorId] = item.DoctorShareDetails;
                    }
                    if (!$scope.DrIdDoctorClassId[$scope.item.DoctorId]) {
                        $scope.DrIdDoctorClassId[$scope.item.DoctorId] = $scope.DoctorClassId;
                    }
                    if (!$scope.DrIdDrIncludeTax[$scope.item.DoctorId]) {
                        $scope.DrIdDrIncludeTax[$scope.item.DoctorId] = $scope.DrIncludeTax;
                    }
                }
            }
            $scope.CalculateDoctorShare($scope.DoctorClassId, $scope.DrShareDetailInfo, $scope.DrIncludeTax);
        };


        $scope.onDoctorSelected = function (data) {
            $scope.currentcontext.selecteddept = [];
            $scope.item.DoctorName = '';
            if (data) {
                if (data.Title)
                    $scope.item.DoctorName = data.Title.Description;
                if (data.Text)
                    $scope.item.DoctorName += ' ' + data.Text;
            }
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
                if ($scope.item.PatientBillStatusId == 1) { // Draft Bill
                    $scope.RdoPaymentTypeId = false;
                } else {
                    $scope.RdoPaymentTypeId = true;
                }
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
            if ($scope.item.IsMultiplePayment == true) {
                $scope.currentcontext.ReceiptTypeId = 2;
            }
            var PatientPaymentDetail = {
                Id: 0,
                ReceiptDateTime: utl.Formatter.getCurrentDate(),
                FacilityId: $scope.item.FacilityId,
                OrganizationId: $scope.item.OrganizationId,
                PatientId: $scope.item.PatientId,
                ReceiptTypeId: $scope.currentcontext.ReceiptTypeId,
                IsMultiplePayment: $scope.item.IsMultiplePayment,
                EncounterId: $scope.item.EncounterId,
                EncounterTypeId: vm.Context == 'OP' ? 1 : 4,
                BillTypeId: vm.Context == 'OP' ? 1 : 5,
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
            for (var idx in $scope.PatientBillDetails) {
                if ($scope.PatientBillDetails[idx].Status == 1) {
                    $scope.PatientBillDetails[idx].itemidxdesc = 'desc' + idx;
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
                DoctorClassId: -1,
                EligiblePercentage: 0,
                SharePercentage: 0,
                ShareAmount: 0,
                DoctorShareActual: 0,
                DoctorShareDisc: 0,
                DrShareTaxId: -1,
                DrTaxPercentage: 0,
                DrTaxAmount: 0,
                PackageSharePercentage: 0,
                PackageFormula: 0,
                PackageMasterServiceId: 0,
                FreeNetAmount: 0,
                tabindex: $scope.tabindexmap.detailtabindex++
            };

            if ($scope.currentcontext.id > 0) {
                PatientBillDetails.PatientBillId = $scope.currentcontext.id;
            }

            $scope.PatientBillDetails.push(PatientBillDetails);

            $scope.setIndexforTableIndex();

            $scope.SelectedIndex = $scope.PatientBillDetails.length;

        };

        $scope.billingFilter = function (item) {
            if (item.Status == 1 && item.PackageMasterServiceId == 0) {
                return item;
            }
        };

        $scope.addnewbill = function () {
            utl.Modal.open('app.opbillinginfo-form', {
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

            utl.Modal.open('app.itemwiseopbillcancel', {
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

        $scope.ServiceItemChanged = function (idx, item) {
            var isDuplicate = utl.Common.isDuplicateRec($scope.PatientBillDetails, {
                pivotkey: 'ServiceId',
                displaykey: 'ServiceName'
            });
            if (isDuplicate) {
                item.ServiceId = '';
                item.ServiceName = '';
                $scope.PatientBillDetails.splice(idx, 1)
                $scope.addNewLineItem();
                return;
            }
            console.log(item.SelectedItem);

            if (item.LoadFrom != 'PatientOrder') {
                $scope.getOrderInfoDetails(item.SelectedItem);
            }

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
                item.IsExecutingService = ServiceItemobj.IsExecutingService;

                item.DrShareTaxId = -1;
                item.DrTaxPercentage = -1;
                if (ServiceItemobj.GstMaster && ServiceItemobj.GstMaster.Id)
                    item.DrShareTaxId = ServiceItemobj.GstMaster.Id;
                if (ServiceItemobj.GstMaster && ServiceItemobj.GstMaster.GstPercentage)
                    item.DrTaxPercentage = ServiceItemobj.GstMaster.GstPercentage;
                if (ServiceItemobj.GstMaster && ServiceItemobj.GstMaster.GstCode)
                    item.TaxCode = ServiceItemobj.GstMaster.GstCode;

                item.DoctorId = $scope.item.DoctorId;
                item.DoctorName = $scope.item.DoctorName;
                item.RdoDiscountMode = false;
                item.IsPackageItem = ServiceItemobj.IsPackage;
                item.IsExecutableProcedure = ServiceItemobj.IsExecutableProcedure;
                var ServiceTraiffobj = $filter('filter')(ServiceItemobj.ServiceItemTariffDetails, {
                    ServiceRateCategoryId: $scope.currentfilter.ServiceRateCategoryId
                }, true);
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
                    var lastIndex = 0;
                    for (var packid in $scope.PatientBillDetails) {
                        if (!$scope.PatientBillDetails[packid].PackageMasterServiceId)
                            lastIndex++;
                    }
                    if (idx == (lastIndex - 1)) {
                        $scope.addNewLineItem();
                    }
                }
                var selectedGuarantor = utl.Lookup.getObject($scope.lookup.PatientGuarantor, $scope.currentfilter.GuarantorId);
                if (selectedGuarantor && selectedGuarantor.GuarantorId) {
                    var ServiceItemAliasobj = $filter('filter')(ServiceItemobj.ServiceItemAliases, {
                        ExternalProviderId: selectedGuarantor.GuarantorId
                    }, true);
                    if (ServiceItemAliasobj != null && ServiceItemAliasobj.length > 0) {
                        item.AliasId = ServiceItemAliasobj[0].AliasId;
                        item.AliasName = ServiceItemAliasobj[0].AliasName;
                    }
                }
                item.PackageMasterServiceId = 0;
                item.PackageFormula = 0;
                if (ServiceItemobj.IsPackage && ServiceItemobj.IsSaveServiceDetails) {
                    for (var packid in ServiceItemobj.ServiceItemPackageMaps) {
                        var packitem = ServiceItemobj.ServiceItemPackageMaps[packid];
                        if (packitem.Formula && packitem.DoctorId) {
                            var formulaobj = {
                                NetAmount: item.NetAmount,
                                SharePercentage: packitem.SharePercentage,
                            };
                            var computedValue = (math.eval(packitem.Formula, formulaobj));
                            computedValue = computedValue.toFixed(2);
                            var lastIndex = $scope.PatientBillDetails.length - 1;
                            var doctorObj = utl.Lookup.getObject($scope.lookup.Doctor, packitem.DoctorId);
                            $scope.PatientBillDetails[lastIndex].SharePercentage = packitem.SharePercentage;
                            $scope.PatientBillDetails[lastIndex].PackageFormula = packitem.Formula;
                            $scope.PatientBillDetails[lastIndex].ServiceId = packitem.ServiceId;
                            $scope.PatientBillDetails[lastIndex].ServiceCategoryId = item.ServiceCategoryId;
                            $scope.PatientBillDetails[lastIndex].ServiceName = packitem.ServiceName;
                            $scope.PatientBillDetails[lastIndex].DoctorId = packitem.DoctorId;
                            $scope.PatientBillDetails[lastIndex].DoctorName = doctorObj.Text || null;
                            $scope.PatientBillDetails[lastIndex].DoctorShare = computedValue;
                            $scope.PatientBillDetails[lastIndex].IsPackageItem = 1;
                            $scope.PatientBillDetails[lastIndex].PackageMasterServiceId = item.ServiceId;
                            $scope.addNewLineItem();
                        } else {
                            var computedValue = 0;
                            var lastIndex = $scope.PatientBillDetails.length - 1;
                            $scope.PatientBillDetails[lastIndex].ServiceId = packitem.ServiceId;
                            $scope.PatientBillDetails[lastIndex].ServiceCategoryId = item.ServiceCategoryId;
                            $scope.PatientBillDetails[lastIndex].ServiceName = packitem.ServiceName;
                            $scope.PatientBillDetails[lastIndex].DoctorId = packitem.DoctorId || -1;
                            $scope.PatientBillDetails[lastIndex].DoctorName = null;
                            $scope.PatientBillDetails[lastIndex].DoctorShare = computedValue;
                            $scope.PatientBillDetails[lastIndex].IsPackageItem = 1;
                            $scope.PatientBillDetails[lastIndex].PackageMasterServiceId = item.ServiceId;
                            $scope.addNewLineItem();
                        }
                    }
                }
            }
            $scope.getBillInfoDetails(ServiceItemobj);
        };

        $scope.CalculateDoctorShare = function (DoctorClassId, DrShareDetailInfo, DrIncludeTax) {
            if ($scope.PatientBillDetails.length > 0) {
                var itemwiseGrossAmt = 0;
                for (var i = 0, len = $scope.PatientBillDetails.length; i < len; i++) {
                    if ($scope.PatientBillDetails[i].Status == 1) {
                        var itemGrossAmount = 0;
                        itemGrossAmount = isNaN(parseFloat($scope.PatientBillDetails[i].Amount)) ? 0 : parseFloat($scope.PatientBillDetails[i].Amount);
                        itemwiseGrossAmt += itemGrossAmount;
                    }
                }
                for (var idx1 in $scope.PatientBillDetails) {
                    if ($scope.PatientBillDetails[idx1].Status == 1) {
                        var item = $scope.PatientBillDetails[idx1];
                        DrShareDetailInfo = $scope.DrIdDrShareDetailInfo[item.DoctorId];
                        DoctorClassId = $scope.DrIdDoctorClassId[item.DoctorId];
                        DrIncludeTax = $scope.DrIdDrIncludeTax[item.DoctorId];
                        if (!item.IsPackageItem && DoctorClassId && DoctorClassId > 0) { // Non Package
                            item.DoctorShare = 0;
                            item.DoctorShareActual = 0;
                            item.DoctorShareDisc = 0;
                            var discamt = 0;
                            var netamt = 0;
                            var amt = item.Amount;
                            //Line Item Discount
                            if ($scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 2) { // percentage
                                discamt = (item.DiscountAmount / 100) * item.Amount;
                            } else if ($scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 1) {
                                discamt = item.DiscountAmount;
                            }
                            netamt = amt - discamt;
                            item.NetAmount = netamt;
                            // Bill Level - Proportionate Discount
                            if ($scope.currentcontext.BillDiscount > 0) {
                                if ($scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 2) {
                                    discamt = $scope.currentcontext.BillDiscount / 100 * item.Amount;
                                } else if ($scope.currentfilter.DiscountModeId == 1) {
                                    var disc_ = $scope.currentcontext.BillDiscount;
                                    var linepercentage = (100 / itemwiseGrossAmt) * item.Amount;
                                    var netdiscountrupees = disc_ / 100 * linepercentage;
                                    discamt = netdiscountrupees;
                                }
                                netamt = amt - discamt;
                            }

                            if (DoctorClassId) {
                                for (var idx in DrShareDetailInfo) {
                                    var shareitem = DrShareDetailInfo[idx];
                                    if (shareitem.SharingTypeId == 1) { // Category wise share
                                        if (item.ServiceCategoryId == shareitem.ServiceCategoryId) {
                                            var EligiblePerAmount1 = 0;
                                            var SharePerAmount1 = 0;
                                            var TaxPerAmount1 = 0;

                                            var EligiblePerAmount = 0;
                                            var SharePerAmount = 0;
                                            var TaxPerAmount = 0;

                                            item.DoctorClassId = DoctorClassId;
                                            item.EligiblePercentage = shareitem.EligiblePercentage;
                                            item.SharePercentage = shareitem.SharePercentage;
                                            item.ShareAmount = shareitem.ShareAmount;

                                            try {
                                                EligiblePerAmount1 = amt * (item.EligiblePercentage / 100);
                                                if (shareitem.SharePercentage == 0) {
                                                    SharePerAmount1 = (EligiblePerAmount1 / 100) * shareitem.ShareAmount;
                                                } else {
                                                    SharePerAmount1 = EligiblePerAmount1 * (item.SharePercentage / 100);
                                                }
                                                item.DoctorShareActual = SharePerAmount1;
                                            } catch (ex) { }
                                            try {
                                                if (DrIncludeTax && item.DrTaxPercentage > 0) {
                                                    TaxPerAmount1 = SharePerAmount1 * (item.DrTaxPercentage / 100);
                                                    item.DoctorShareActual += TaxPerAmount1;
                                                }
                                                item.DoctorShareActual = parseFloat(item.DoctorShareActual).toFixed(2);
                                            } catch (ex) { }

                                            try {
                                                EligiblePerAmount = netamt * (item.EligiblePercentage / 100);
                                                SharePerAmount = EligiblePerAmount * (item.SharePercentage / 100);
                                                item.DoctorShare = SharePerAmount;
                                            } catch (ex) { }
                                            try {
                                                if (DrIncludeTax && item.DrTaxPercentage > 0) {
                                                    TaxPerAmount = SharePerAmount * (item.DrTaxPercentage / 100);
                                                    item.GSTAmount = TaxPerAmount;
                                                    item.DrTaxAmount = TaxPerAmount;
                                                    item.DoctorShare += item.GSTAmount;
                                                    item.NetAmount += item.GSTAmount;
                                                }
                                                item.DoctorShare = parseFloat(item.DoctorShare).toFixed(2);
                                            } catch (ex) { }
                                            item.DoctorShareDisc = item.DoctorShareActual - item.DoctorShare;
                                            break;
                                        }

                                    } else if (shareitem.SharingTypeId == 2) { // Doctor wise share
                                        if (item.ServiceId == shareitem.ServiceId) {
                                            var EligiblePerAmount1 = 0;
                                            var SharePerAmount1 = 0;
                                            var TaxPerAmount1 = 0;

                                            var EligiblePerAmount = 0;
                                            var SharePerAmount = 0;
                                            var TaxPerAmount = 0;

                                            item.DoctorClassId = DoctorClassId;
                                            item.EligiblePercentage = shareitem.EligiblePercentage;
                                            item.SharePercentage = shareitem.SharePercentage;
                                            item.ShareAmount = shareitem.ShareAmount;

                                            try {
                                                EligiblePerAmount1 = amt * (item.EligiblePercentage / 100);
                                                if (shareitem.SharePercentage == 0) {
                                                    SharePerAmount1 = (EligiblePerAmount1 / 100) * shareitem.ShareAmount;
                                                } else {
                                                    SharePerAmount1 = EligiblePerAmount1 * (item.SharePercentage / 100);
                                                }
                                                item.DoctorShareActual = SharePerAmount1;
                                            } catch (ex) { }
                                            try {
                                                if (DrIncludeTax && item.DrTaxPercentage > 0) {
                                                    TaxPerAmount1 = SharePerAmount1 * (item.DrTaxPercentage / 100);
                                                    item.DoctorShareActual += TaxPerAmount1;
                                                }
                                                item.DoctorShareActual = parseFloat(item.DoctorShareActual).toFixed(2);
                                            } catch (ex) { }

                                            try {
                                                EligiblePerAmount = netamt * (item.EligiblePercentage / 100);
                                                if (shareitem.SharePercentage == 0) {
                                                    SharePerAmount = (EligiblePerAmount / 100) * shareitem.ShareAmount;
                                                } else {
                                                    SharePerAmount = EligiblePerAmount * (item.SharePercentage / 100);
                                                }
                                                item.DoctorShare = SharePerAmount;
                                            } catch (ex) { }
                                            try {
                                                if (DrIncludeTax && item.DrTaxPercentage > 0) {
                                                    TaxPerAmount = SharePerAmount * (item.DrTaxPercentage / 100);
                                                    item.GSTAmount = TaxPerAmount;
                                                    item.DrTaxAmount = TaxPerAmount;
                                                    item.DoctorShare += item.GSTAmount;
                                                    item.NetAmount += item.GSTAmount;
                                                }
                                                item.DoctorShare = parseFloat(item.DoctorShare).toFixed(2);
                                            } catch (ex) { }
                                            item.DoctorShareDisc = item.DoctorShareActual - item.DoctorShare;
                                            break;
                                        }
                                    }
                                }
                            }
                        } else { // Package Item
                            var discamt = 0;
                            if ($scope.currentcontext.BillDiscount > 0) {
                                if ($scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 2) {
                                    discamt = $scope.currentcontext.BillDiscount / 100 * item.Amount;
                                } else if ($scope.currentfilter.DiscountModeId == 1) {
                                    var disc_ = $scope.currentcontext.BillDiscount;
                                    var linepercentage = (100 / itemwiseGrossAmt) * item.Amount;
                                    var netdiscountrupees = disc_ / 100 * linepercentage;
                                    discamt = netdiscountrupees;
                                }
                            }
                            for (var packsubidx in $scope.PatientBillDetails) {
                                if ($scope.PatientBillDetails[packsubidx].Status == 1) {
                                    var packsubline = $scope.PatientBillDetails[packsubidx];
                                    if (packsubline.PackageMasterServiceId == item.ServiceId &&
                                        packsubline.IsPackageItem == 1 &&
                                        packsubline.PackageFormula &&
                                        packsubline.PackageFormula != 0) {
                                        var amtformulaobj = {
                                            NetAmount: item.Amount,
                                            SharePercentage: packsubline.SharePercentage,
                                        };
                                        var computedValue = (math.eval(packsubline.PackageFormula, amtformulaobj));
                                        packsubline.DoctorShareActual = computedValue;
                                        var netformulaobj = {
                                            NetAmount: item.NetAmount - discamt,
                                            SharePercentage: packsubline.SharePercentage,
                                        };
                                        var computedValue = (math.eval(packsubline.PackageFormula, netformulaobj));
                                        packsubline.DoctorShare = computedValue;
                                        packsubline.DoctorShareDisc = packsubline.DoctorShareActual - packsubline.DoctorShare;
                                        packsubline.DoctorShareDisc = parseFloat(packsubline.DoctorShareDisc).toFixed(2);
                                    }
                                }
                            }
                        }
                    }
                }
                $scope.CalculateNetAmt();
            }
        };

        $scope.QtyRequired = function (item) {
            if (!item.Quantity) item.Quantity = "1";
            $scope.CalcualteAmt(item);
        }

        $scope.CalcualteAmt = function (item) {
            $scope.currentcontext.BillDiscount = 0;
            item.Amount = item.Quantity * item.Rate;
            if ($scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 2) { // percentage
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
                $scope.CalculateDoctorShare($scope.DoctorClassId, $scope.DrShareDetailInfo, $scope.DrIncludeTax);
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
                $scope.CalculateDoctorShare($scope.DoctorClassId, $scope.DrShareDetailInfo, $scope.DrIncludeTax);
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
            var itemwiseGrossAmt = 0
            var itemwiseNetAmt = 0;
            var itemwiseDiscountAmt = 0;
            var itemwiseTaxAmt = 0;
            var itemwisereceivedamt = 0;
            for (var i = 0, len = $scope.PatientBillDetails.length; i < len; i++) {
                if ($scope.PatientBillDetails[i].Status == 1) {
                    var itemnetAmount = 0;
                    var itemGrossAmount = 0;
                    var itemDiscountAmount = 0;
                    var itemTaxAmount = 0;
                    var itemreceivedAmt = 0;
                    itemnetAmount = isNaN(parseFloat($scope.PatientBillDetails[i].NetAmount)) ? 0 : parseFloat($scope.PatientBillDetails[i].NetAmount);
                    itemGrossAmount = isNaN(parseFloat($scope.PatientBillDetails[i].Amount)) ? 0 : parseFloat($scope.PatientBillDetails[i].Amount);
                    itemDiscountAmount = isNaN(parseFloat($scope.PatientBillDetails[i].DiscountAmount || $scope.PatientBillDetails[i].ProportionateDiscount)) ? 0 : parseFloat($scope.PatientBillDetails[i].DiscountAmount || $scope.PatientBillDetails[i].ProportionateDiscount);
                    itemTaxAmount = isNaN(parseFloat($scope.PatientBillDetails[i].GSTAmount)) ? 0 : parseFloat($scope.PatientBillDetails[i].GSTAmount);
                    itemreceivedAmt = isNaN(parseFloat($scope.PatientBillDetails[i].ReceivedAmount)) ? 0 : parseFloat($scope.PatientBillDetails[i].ReceivedAmount);
                    if ($scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 2) {
                        itemDiscountAmount = itemDiscountAmount / 100 * itemGrossAmount;
                    }

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
                        itemTaxAmount = 0;
                    }

                    itemwiseGrossAmt += itemGrossAmount;
                    itemwiseNetAmt += itemnetAmount;
                    itemwiseDiscountAmt += itemDiscountAmount;
                    itemwiseTaxAmt += itemTaxAmount;
                    itemwisereceivedamt += itemreceivedAmt;
                }
            }
            $scope.currentcontext.PaidAmt = (!$scope.currentcontext.PaidAmt) ? 0 : $scope.currentcontext.PaidAmt;
            $scope.item.TotDiscAmount = 0;
            $scope.item.GrossAmount = 0;
            $scope.item.TaxAmt = 0;
            $scope.currentcontext.TotNetAmount = 0;
            $scope.currentcontext.TotBalanceAmt = 0;

            $scope.item.GrossAmount = (itemwiseGrossAmt + itemwiseTaxAmt);
            $scope.item.TaxAmt = itemwiseTaxAmt;
            $scope.currentcontext.ReceivedAmt = itemwisereceivedamt;

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
                } else {
                    $scope.DiscountAlert = 'Please Select Discount Approver';
                    utl.Alert.showErrorMsg($scope.DiscountAlert);
                    $scope.IsDiscountApproved = false;
                }
            }

            $scope.currentcontext.TotNetAmount = parseFloat($scope.item.GrossAmount) - parseFloat($scope.item.TotDiscAmount);
            $scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.TotNetAmount) - parseFloat($scope.currentcontext.ReceiptAmt || 0) - parseFloat($scope.currentcontext.PaidAmt || 0);
            // if (parseFloat($scope.currentcontext.PaidAmt) > 0) {
            //     $scope.currentcontext.TotBalanceAmt = (parseFloat($scope.currentcontext.TotNetAmount) + parseFloat($scope.item.TotDiscAmount) - parseFloat($scope.currentcontext.CNAmount || 0)) - parseFloat($scope.currentcontext.ReceiptAmt) - (parseFloat($scope.currentcontext.PaidAmt) - parseFloat($scope.currentcontext.RefundAmount));
            // }
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

            var billBalance = parseFloat($scope.currentcontext.TotNetAmount) - parseFloat($scope.currentcontext.ReceiptAmt || 0) - parseFloat($scope.currentcontext.PaidAmt);
            // if (parseFloat($scope.currentcontext.PaidAmt) > 0) {
            //     var billBalance = (parseFloat($scope.currentcontext.TotNetAmount) + parseFloat($scope.item.TotDiscAmount) - parseFloat($scope.currentcontext.CNAmount || 0)) - (parseFloat($scope.currentcontext.PaidAmt) - parseFloat($scope.currentcontext.RefundAmount));
            // }
            if (parseFloat(($scope.currentcontext.ReceiptAmt)) > math.round(billBalance)) {
                $scope.currentcontext.ReceiptAmt = 0;
                $scope.currentcontext.TotBalanceAmt = billBalance;
                utl.Alert.showErrorMsg($translate.instant('billing.pharmacy-return.receivingamt.lbl'));
            }

            if (parseFloat(($scope.item.TotDiscAmount)) > parseFloat(($scope.item.GrossAmount).toFixed(2)) /* || $scope.currentcontext.TotBalanceAmt < 0*/) {
                $scope.currentcontext.dBillDiscount = 0;
                $scope.currentcontext.ReceiptAmt = 0;
                $scope.currentcontext.TotBalanceAmt = 0;
                utl.Alert.showErrorMsg($translate.instant('billing.pharmacy-return.receivingamt.lbl'));
                $scope.currentcontext.BillDiscount = 0;
                $scope.currentcontext.TotNetAmount = parseFloat((parseFloat($scope.item.GrossAmount)).toFixed(2));
            }

            $scope.item.Received = $scope.currentcontext.ReceiptAmt !== 0 ?
                $scope.currentcontext.ReceiptAmt : $scope.currentcontext.PaidAmt !== 0 ? $scope.currentcontext.PaidAmt : 0;
            if ($scope.currentcontext.id !== 0 && $scope.item.PatientBillStatusId !== 1)
                $scope.item.Received = parseFloat($scope.currentcontext.PaidAmt) + parseFloat($scope.currentcontext.ReceiptAmt);
        };

        $scope.updateReceiptAmt = function () {
            if ($scope.currentcontext.TotBalanceAmt !== 0.00) {
                if ($scope.currentcontext.id === 0 || $scope.item.PatientBillStatusId === 1) {
                    if (!$scope.item.Received) {
                        $scope.item.Received = 0;
                    }
                    $scope.currentcontext.ReceiptAmt = parseFloat($scope.item.Received) + parseFloat($scope.currentcontext.TotBalanceAmt);
                } else {
                    $scope.currentcontext.ReceiptAmt = parseFloat($scope.currentcontext.ReceiptAmt) + parseFloat($scope.currentcontext.TotBalanceAmt);
                }
                $scope.currentcontext.ReceiptAmt = parseFloat($scope.currentcontext.ReceiptAmt).toFixed(2);
                $scope.currentcontext.ReceiptAmt = parseFloat($scope.currentcontext.ReceiptAmt);
            }
            $scope.currentcontext.TotBalanceAmt = 0.00;
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
            $state.reload();
        };

        $scope.addNewBill = function () {
            if ($stateParams.id > 0)
                $state.go('app.opbilling-list', {
                    id: 0,
                    tp: vm.Context
                });
            else
                $state.reload();

        };

        $scope.addPay = function () {
            utl.Modal.open('app.opbilling-form', {
                params: {
                    id: $scope.item.PatientId
                },
                confirmCallback: $scope.getList
            });
        };

        $scope.alertviewclick = function () {
            utl.Modal.open('app.alertview', {
                params: {
                    id: $scope.item.PatientId
                },
                confirmCallback: $scope.updateCount
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
                v.LoadFrom = 'PatientOrder';
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
            utl.Modal.open('app.pendingorder', {
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
            $scope.PatPaymentDetails($scope.currentcontext.id);
        }

        $scope.findBill = function () {
            utl.Modal.open('app.findbill-list', {
                params: {
                    id: $scope.item.PatientId,
                    context: vm.Context
                },
                confirmCallback: patientBillPickerCallback
            });
            $scope.chkfindBill = 1;
        };

        $scope.patientprofiledetails = function () {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: $scope.currentfilter.PatientId
                },
                confirmCallback: $scope.getItem
            });
        };

        $scope.pendingBill = function () {
            utl.Modal.open('app.pendingbill-list', {
                params: {
                    id: $scope.currentfilter.PatientId
                },
                confirmCallback: patientBillPickerCallback
            });
        };

        $scope.outstandingBill = function () {
            utl.Modal.open('app.outstandingbill-list', {
                params: {
                    id: $scope.currentfilter.PatientId
                },
                confirmCallback: patientBillPickerCallback
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
        $scope.printwithoutheader2 = function () {
            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'billing/patientbills/PrintPatientDGBillsWithoutHeader',
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
            $state.go('app.opbilling-list', $scope.currentcontext.id);
        };

        $scope.DrShareChangeDr = function (DoctorClassId, DrShareDetailInfo, item, DrIncludeTax) {
            if (DoctorClassId > 0 && DrShareDetailInfo &&
                DrShareDetailInfo.length > 0 && $scope.PatientBillDetails.length > 0) {
                var itemwiseGrossAmt = 0;
                for (var i = 0, len = $scope.PatientBillDetails.length; i < len; i++) {
                    if ($scope.PatientBillDetails[i].Status == 1) {
                        var itemGrossAmount = 0;
                        itemGrossAmount = isNaN(parseFloat($scope.PatientBillDetails[i].Amount)) ? 0 : parseFloat($scope.PatientBillDetails[i].Amount);
                        itemwiseGrossAmt += itemGrossAmount;
                    }
                }
                if (item.Status == 1) {
                    if (!item.IsPackageItem) { // Non Package
                        var discamt = 0;
                        var netamt = 0;
                        var amt = item.Amount;
                        //Line Item Discount
                        if ($scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 2) { // percentage
                            discamt = (item.DiscountAmount / 100) * item.Amount;
                        } else if ($scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 1) {
                            discamt = item.DiscountAmount;
                        }
                        netamt = amt - discamt;
                        item.NetAmount = netamt;
                        // Bill Level - Proportionate Discount
                        if ($scope.currentcontext.BillDiscount > 0) {
                            if ($scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 2) {
                                discamt = $scope.currentcontext.BillDiscount / 100 * item.Amount;
                            } else if ($scope.currentfilter.DiscountModeId == 1) {
                                var disc_ = $scope.currentcontext.BillDiscount;
                                var linepercentage = (100 / itemwiseGrossAmt) * item.Amount;
                                var netdiscountrupees = disc_ / 100 * linepercentage;
                                discamt = netdiscountrupees;
                            }
                            netamt = amt - discamt;
                        }

                        if ($scope.DoctorClassId) {
                            for (var idx in DrShareDetailInfo) {
                                var shareitem = DrShareDetailInfo[idx];
                                if (shareitem.SharingTypeId == 1) { // Category wise share
                                    if (item.ServiceCategoryId == shareitem.ServiceCategoryId) {
                                        var EligiblePerAmount = 0;
                                        var SharePerAmount = 0;
                                        var TaxPerAmount = 0;

                                        var EligiblePerAmount1 = 0;
                                        var SharePerAmount1 = 0;
                                        var TaxPerAmount1 = 0;

                                        item.DoctorClassId = $scope.DoctorClassId;
                                        item.EligiblePercentage = shareitem.EligiblePercentage;
                                        item.SharePercentage = shareitem.SharePercentage;
                                        item.ShareAmount = shareitem.ShareAmount;

                                        try {
                                            EligiblePerAmount1 = amt * (item.EligiblePercentage / 100);
                                            if (shareitem.SharePercentage == 0) {
                                                SharePerAmount1 = (EligiblePerAmount1 / 100) * shareitem.ShareAmount;
                                            } else {
                                                SharePerAmount1 = EligiblePerAmount1 * (item.SharePercentage / 100);
                                            }
                                            item.DoctorShareActual = SharePerAmount1;
                                        } catch (ex) { }
                                        try {
                                            if (DrIncludeTax && item.DrTaxPercentage > 0) {
                                                TaxPerAmount1 = SharePerAmount1 * (item.DrTaxPercentage / 100);
                                                item.DoctorShareActual += TaxPerAmount1;
                                            }
                                            item.DoctorShareActual = parseFloat(item.DoctorShareActual).toFixed(2);
                                        } catch (ex) { }


                                        try {
                                            EligiblePerAmount = netamt * (item.EligiblePercentage / 100);
                                            SharePerAmount = EligiblePerAmount * (item.SharePercentage / 100);
                                            item.DoctorShare = SharePerAmount;
                                        } catch (ex) { }
                                        try {
                                            if (DrIncludeTax && item.DrTaxPercentage > 0) {
                                                TaxPerAmount = SharePerAmount * (item.DrTaxPercentage / 100);
                                                item.GSTAmount = TaxPerAmount;
                                                item.DrTaxAmount = TaxPerAmount;
                                                item.DoctorShare += item.GSTAmount;
                                                item.NetAmount += item.GSTAmount;
                                            }
                                            item.DoctorShare = parseFloat(item.DoctorShare).toFixed(2);
                                        } catch (ex) { }
                                        item.DoctorShareDisc = item.DoctorShareActual - item.DoctorShare;
                                        break;
                                    }

                                } else if (shareitem.SharingTypeId == 2) { // Doctor wise share
                                    if (item.ServiceId == shareitem.ServiceId) {
                                        var EligiblePerAmount = 0;
                                        var SharePerAmount = 0;
                                        var TaxPerAmount = 0;

                                        var EligiblePerAmount1 = 0;
                                        var SharePerAmount1 = 0;
                                        var TaxPerAmount1 = 0;

                                        item.DoctorClassId = $scope.DoctorClassId;
                                        item.EligiblePercentage = shareitem.EligiblePercentage;
                                        item.SharePercentage = shareitem.SharePercentage;
                                        item.ShareAmount = shareitem.ShareAmount;

                                        try {
                                            EligiblePerAmount1 = amt * (item.EligiblePercentage / 100);
                                            if (shareitem.SharePercentage == 0) {
                                                SharePerAmount1 = (EligiblePerAmount1 / 100) * shareitem.ShareAmount;
                                            } else {
                                                SharePerAmount1 = EligiblePerAmount1 * (item.SharePercentage / 100);
                                            }
                                            item.DoctorShareActual = SharePerAmount1;
                                        } catch (ex) { }
                                        try {
                                            if (DrIncludeTax && item.DrTaxPercentage > 0) {
                                                TaxPerAmount1 = SharePerAmount1 * (item.DrTaxPercentage / 100);
                                                item.DoctorShareActual += TaxPerAmount1;
                                            }
                                            item.DoctorShareActual = parseFloat(item.DoctorShareActual).toFixed(2);
                                        } catch (ex) { }


                                        try {
                                            EligiblePerAmount = netamt * (item.EligiblePercentage / 100);
                                            if (shareitem.SharePercentage == 0) {
                                                SharePerAmount = (EligiblePerAmount / 100) * shareitem.ShareAmount;
                                            } else {
                                                SharePerAmount = EligiblePerAmount * (item.SharePercentage / 100);
                                            }
                                            item.DoctorShare = SharePerAmount;
                                        } catch (ex) { }
                                        try {
                                            if (DrIncludeTax && item.DrTaxPercentage > 0) {
                                                TaxPerAmount = SharePerAmount * (item.DrTaxPercentage / 100);
                                                item.GSTAmount = TaxPerAmount;
                                                item.DrTaxAmount = TaxPerAmount;
                                                item.DoctorShare += item.GSTAmount;
                                                item.NetAmount += item.GSTAmount;
                                            }
                                            item.DoctorShare = parseFloat(item.DoctorShare).toFixed(2);
                                        } catch (ex) { }
                                        item.DoctorShareDisc = item.DoctorShareActual - item.DoctorShare;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            $scope.CalculateNetAmt();
        }

        $scope.EditLineItem = function (item) {
            var idx = $scope.PatientBillDetails.indexOf(item);
            $scope.PatientBillDetails[idx].DoctorId = item.DoctorId;
            $scope.PatientBillDetails[idx].DiscountTypeId = item.DiscountTypeId;
            $scope.PatientBillDetails[idx].IsDoctorDiscount = item.IsDoctorDiscount;
            $scope.PatientBillDetails[idx].Comments = item.Comments;
            $scope.PatientBillDetails[idx].DoctorClassId = item.DoctorClassId;
            var DrIncludeTax = item.DrIncludeTax;
            $scope.PatientBillDetails[idx].DrTaxAmount = 0;
            $scope.PatientBillDetails[idx].GSTAmount = 0;
            var discamt = 0;
            //Line Item Discount
            if ($scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 2) { // percentage
                discamt = (item.DiscountAmount / 100) * item.Amount;
            } else if ($scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 1) {
                discamt = item.DiscountAmount;
            }
            item.NetAmount = item.Amount - discamt;
            item.DoctorShare = 0;
            if (!$scope.DrIdDrShareDetailInfo[item.DoctorId]) {
                $scope.DrIdDrShareDetailInfo[item.DoctorId] = item.DrShareDetailInfo;
            }
            if (!$scope.DrIdDoctorClassId[item.DoctorId]) {
                $scope.DrIdDoctorClassId[item.DoctorId] = item.DoctorClassId;
            }
            if (!$scope.DrIdDrIncludeTax[item.DoctorId]) {
                $scope.DrIdDrIncludeTax[item.DoctorId] = DrIncludeTax;
            }
            $scope.DrShareChangeDr(item.DoctorClassId, item.DrShareDetailInfo, $scope.PatientBillDetails[idx], DrIncludeTax);
        };

        $scope.EditPackageLineItem = function (data) {
            if (data.items && data.items.length > 0) {
                for (var idx in data.items) {
                    var item = data.items[idx];
                    var idx = $scope.PatientBillDetails.indexOf(item);
                    $scope.PatientBillDetails[idx].DiscountAmount = item.DiscountAmount;
                    $scope.PatientBillDetails[idx].NetAmount = 0;
                    $scope.PatientBillDetails[idx].IsPackageItem = 1;
                    $scope.PatientBillDetails[idx].DoctorShare = item.DoctorShare;
                    $scope.PatientBillDetails[idx].DoctorId = item.DoctorId;
                    $scope.PatientBillDetails[idx].DoctorName = item.DoctorName;
                }
            }
        };

        $scope.editPatientBillDetails = function (idx, item) {
            var IsEditable = false;
            if ($scope.currentcontext.PatientBillStatusId == 1) {
                IsEditable = true;
            }
            if (item.IsPackageItem) {
                utl.Modal.open('app.obillingpackage', {
                    params: {
                        itemid: idx,
                        item: item,
                        items: $scope.PatientBillDetails,
                        patient: $scope.selectedPatient,
                        IsEditable
                    },
                    confirmCallback: $scope.EditPackageLineItem
                });
            } else {
                utl.Modal.open('app.obillingmore', {
                    params: {
                        itemid: idx,
                        item: item,
                        patient: $scope.selectedPatient,
                        IsEditable
                    },
                    confirmCallback: $scope.EditLineItem
                    // cancelCallback: $scope.initLookup
                });
            }
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
            utl.Modal.open('app.opmanualbill', {
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
            var itemPackageMasterServiceId = item.ServiceId;
            var index = $scope.PatientBillDetails.indexOf(item);
            item.Status = 2;
            $scope.DeletedPatientBills.push(item);
            $scope.PatientBillDetails.splice(index, 1);

            var packitemremove = [];
            for (var pkgidx in $scope.PatientBillDetails) {
                var packitemmaster = $scope.PatientBillDetails[pkgidx];
                if (packitemmaster.PackageMasterServiceId == item.ServiceId) {
                    packitemremove.push(packitemmaster);
                }
            }
            for (var pkgidx in packitemremove) {
                var packitem = packitemremove[pkgidx];
                var index = $scope.PatientBillDetails.indexOf(packitem);
                if (index >= 0) {
                    packitem.Status = 2;
                    $scope.DeletedPatientBills.push(packitem);
                    $scope.PatientBillDetails.splice(index, 1);
                }
            }


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
                            $scope.PatientBillDetails[idx].IsExecutableProcedure = ServiceItemobj[idx1].IsExecutableProcedure;
                            $scope.PatientBillDetails[idx].IsExecutingService = ServiceItemobj[idx1].IsExecutingService;
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
            $scope.PatientBillInfo = res.Data || [];
            if ($scope.PatientBillInfo && $scope.PatientBillInfo.length > 0) {
                $scope.isSaving = true;
                $scope.outstanding = false;
                $scope.IsDue = false;
                $scope.canShowAdvanceBtn = false;
                // $scope.onDoctorSelected()
                $scope.PatientBillInfo.forEach(patientbills => {
                    $scope.item.PatientId = patientbills.PatientId;
                    $scope.item.PatientOrderId = patientbills.PatientOrderId;
                    $scope.item.PatientBillStatusId = patientbills.PatientBillStatusId;
                    $scope.item.BillGeneratedBy = patientbills.BillGeneratedBy;
                    // if ($scope.item.PatientBillStatusId == 3) {
                    //     $scope.loadPatientGuarantors();
                    // }
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
                    $scope.currentfilter.DiscountModeId = patientbills.BillDiscountModeId;
                    $scope.item.BillNumber = patientbills.BillNumber;
                    $scope.item.DepartmentId = patientbills.DepartmentId;
                    $scope.item.DoctorId = patientbills.DoctorId;
                    $scope.currentfilter.GuarantorId = patientbills.GuarantorId;
                    $scope.currentfilter.GuarantorName = patientbills.GuarantorName;
                    $scope.currentfilter.GuarantorTypeId = patientbills.GuarantorTypeId;
                    $scope.currentfilter.ServiceRateCategoryId = patientbills.ServiceRateCategoryId;
                    $scope.item.IsMultiplePayment = patientbills.IsMultiplePayment;

                    if ($scope.currentfilter.DiscountModeId == 2) {
                        $scope.currentcontext.BillDiscount = patientbills.DiscountPercentage;
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
                    $scope.isSaveandApprove = true;
                    // $scope.applyVisibilityRules();
                    $scope.patientChange();
                    $scope.PatientPaymentDetails = [];

                    $scope.CalculateNetAmt();
                    $scope.currentcontext.PendingAmt = patientbills.OutStandingAmount;
                    $scope.item.BillDateTime = patientbills.BillDateTime;
                    if (patientbills.PatientBillStatusId == 1)
                        $scope.isSaving = false;

                });

                // $scope.EnableDisableDropdown($scope.isSaving);
                $scope.RdoPatientId = true;
                $scope.RdoBillnumber = true;
                $scope.canShowFinanceBtn = true;

                // if ($scope.item.EncounterId)
                //     $scope.getBilledEncounter($scope.item.EncounterId);
                // else
                //     $scope.fnencounter();

                // if ($scope.chkfindBill == 0 && $scope.item.BillNumber) {
                //     if ($scope.item.IsMultiplePayment == true && $scope.currentcontext.PendingAmt == 0) {
                //         $scope.print();
                //     } else if ($scope.item.IsMultiplePayment == false) {
                //         $scope.print();
                //     }
                // }
                // if ($scope.item.PatientBillStatusId == 1) {
                //     $scope.addNewLineItem();
                //     $scope.ServiceItemMapping();
                // }

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
                    TransDetails += '/' + payData.CardType.Description;
                    TransDetails += '/' + payData.AuthorizedCode;
                }
                if (payData.PaymentTypeId == 6) {
                    TransDetails = payData.PaymentType.Description;
                    TransDetails += '/' + payData.Bank.Description;
                    TransDetails += '/' + payData.CardType.Description;
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

        function onGuarantorSelected(dataFromModal) {
            $scope.currentfilter.GuarantorId = dataFromModal.gid;
            $scope.loadPatientGuarantors();
        }

        $scope.addGuarantor = function () {
            utl.Modal.open('app.patientguarantorlist', {
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
            for (var idx in $scope.lookup.Guarantor) {
                var item = $scope.lookup.Guarantor[idx];
                if (item.Id == guarantorid) {
                    $scope.currentfilter.GuarantorTypeId = item.GuarantorTypeId;
                    $scope.currentfilter.ServiceRateCategoryId = item.ServiceRateCategoryId;
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
                if (!$scope.currentfilter.GuarantorTypeId) {
                    $scope.currentfilter.GuarantorTypeId = $scope.encounter.GuarantorTypeId || 0;
                }
                $scope.currentfilter.GuarantorId = $scope.encounter.GuarantorId || 0;
                $scope.currentfilter.ReferralId = $scope.encounter.ReferralId || 0;
                $scope.currentfilter.ReferralName = $scope.encounter.ReferralName || null;
                if (!$scope.item.DoctorId) {
                    $scope.item.DoctorId = $scope.encounter.DoctorId;
                    if ($scope.encounter.Doctor)
                        $scope.item.DoctorName = $scope.encounter.Doctor.Title.Description + '  ' +
                            $scope.encounter.Doctor.FirstName + ' ' +
                            ($scope.encounter.Doctor.LastName != null ? $scope.encounter.Doctor.LastName : '');
                }
                $scope.item.DepartmentId = $scope.encounter.DepartmentId;
                $scope.item.IsEncounter = true;
                $scope.item.TotalAvailableAmount = $scope.encounter.PaidAmount - $scope.encounter.AmountAdjusted;
            } else if (vm.Context == 'OP') {
                if (!$scope.item.BillNumber) {
                    utl.Alert.showErrorMsg('No Visit Created For The Selected Patient');
                }
            }
            $scope.guarantorType($scope.currentfilter.GuarantorId);
            // $scope.GuarantorTypeChange({
            //     Id: $scope.currentfilter.GuarantorTypeId
            // })
            $scope.doctorChange();
            $scope.addNewLineItem();
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
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.print();
            $state.go('app.virtualpendingbills');
        };
        // savehitcompleted = 0;
        // $scope.item.IsFromIPBill = 0;
        // $scope.securitypisvalid = false;
        // $scope.IpBillList = 0;
        // $scope.IPIsBillLock = false;
        // if ($scope.currentcontext.id <= 0)
        //     $scope.currentcontext.id = data;
        // // $scope.currentcontext.PaymentTypeId = 1;
        // $scope.getBillInfoByBillId();
        // $scope.PatPaymentDetails(data);
        // $scope.applyVisibilityRules();



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

            if ($scope.currentcontext.TotBalanceAmt > 0) {
                if (($scope.item.PrivateDueId <= 0 || !$scope.item.PrivateDueId)) {
                    utl.Alert.showErrorMsg('Please Select the Credit Approver');
                    return false;
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
            $scope.dmPrint();
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
            $scope.item.CancelledOn = utl.Formatter.getCurrentDate();
            $scope.item.CancelledBy = utl.Session.getCurrentUserId();
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
            if ($scope.item.TotalDueAmount == 0) {
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
            } else {
                utl.Alert.showErrorMsg('Due Bill Cannot be Cancelled...');
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
            utl.Modal.open('app.adjustagainstadvance', {
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
            utl.Modal.open('app.patientfinanceinfo', {
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
            if (!$scope.item.IsMultiplePayment || $scope.item.IsMultiplePayment == false) {
                if ($scope.currentcontext.TotBalanceAmt > 0) {
                    if (($scope.item.PrivateDueId <= 0 || !$scope.item.PrivateDueId)) {
                        utl.Alert.showErrorMsg('Please Select the Credit Approver');
                        return false;
                    }
                }
            }
            if (!$scope.item.IsMultiplePayment || $scope.item.IsMultiplePayment == false) {
                if ($scope.currentcontext.TotBalanceAmt > 0 && $scope.currentfilter.GuarantorTypeId > 1) {
                    if ($scope.item.GuarantorDueId <= 0 || !$scope.item.GuarantorDueId) {
                        utl.Alert.showErrorMsg('Please Select the Credit Approver');
                        return false;
                    }
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
                        $scope.item.DiscountPercentage = parseFloat($scope.currentcontext.BillDiscount);
                        for (var per = 0, perlen = $scope.PatientBillDetails.length; per < perlen; per++) {
                            billingitem = $scope.PatientBillDetails[per];
                            if (billingitem.DiscountAmount == 0) {
                                var linepercentage = (100 / $scope.item.GrossAmount) * $scope.PatientBillDetails[per].Amount;
                                var netdiscountrupees = parseFloat($scope.currentcontext.BillDiscount) / 100 * linepercentage;
                                $scope.PatientBillDetails[per].DiscountModeId = $scope.currentfilter.DiscountModeId;
                                $scope.PatientBillDetails[per].DiscountPercentage = $scope.currentcontext.BillDiscount;
                                $scope.PatientBillDetails[per].ProportionateDiscount = netdiscountrupees;
                            }
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
            $scope.item.IsDirectDGBill = vm.Context == 'OP' ? false : true;
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
            $scope.item.DiscountApprovedBy = $scope.currentcontext.DiscountApprovedBy;
            $scope.item.IsIntermediateBill = 0;
            $scope.item.ParentBillId = 0;
            $scope.item.IsPackageBill = 0;
            $scope.item.PackageDiscount = 0;
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

            if ($scope.item.PatientBillStatusId == 3 && !$scope.item.BillGeneratedBy)
                $scope.item.BillGeneratedBy = utl.Session.getCurrentUserId();


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
                    var linenetamount = billitem.Amount || 0;
                    var linediscountamount = billitem.DiscountAmount || 0;
                    var lineproportionatediscountamount = billitem.ProportionateDiscount || 0;
                    var actuallinenetamount = linenetamount - (parseFloat(linediscountamount) + lineproportionatediscountamount);
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

                // var actionName = 'billing/patientbills/AddPatientBills';
                // if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var actionName = 'billing/patientbills/UpdateVirtualPatientBills';
                // }

                if ($scope.currentfilter.GuarantorTypeId == 6) { // Free type
                    var itemwiseNetAmt = 0;
                    for (var i = 0, len = $scope.PatientBillDetails.length; i < len; i++) {
                        if ($scope.PatientBillDetails[i].Status == 1) {
                            var itemnetAmount = 0;
                            itemnetAmount = isNaN(parseFloat($scope.PatientBillDetails[i].FreeNetAmount)) ?
                                0 : parseFloat($scope.PatientBillDetails[i].FreeNetAmount);
                            itemwiseNetAmt += itemnetAmount;
                        }
                    }
                    $scope.item.FreeBillAmount = itemwiseNetAmt;
                    $scope.item.BillAmount = 0;
                    $scope.item.PaidAmount = 0;
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
                if ((item.Quantity > 0 && item.Amount > 0) || item.PackageMasterServiceId > 0) {
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
                    item.DoctorShare = item.DoctorShare || 0;
                    item.EncounterId = $scope.item.EncounterId;
                    item.EncounterTypeId = vm.Context == 'OP' ? 1 : 4;
                    item.AliasId = item.AliasId || null;
                    item.AliasName = item.AliasName || null;
                    item.IsExecutableProcedure = item.IsExecutableProcedure;
                    item.IsExecutingService = item.IsExecutingService;
                    item.FacilityId = utl.Session.getCurrentFacilityId();
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
            options: [{
                header: 'Service Code',
                field: 'ServiceCode',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Service Name',
                field: 'ServiceName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            {
                header: 'Rate',
                field: 'ServiceItemRate',
                datatype: 'string',
                headercls: 'td-rate',
                fieldcls: 'td-rate'
            }
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
                Params: [{
                    Key: 4,
                    Value: 2
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            inputData.Params.push({
                Key: 36,
                Value: [-1, utl.Session.getCurrentFacilityId()]
            });

            if (vm.serviceitemcontrolconfig.searchbyid == true) {
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

            vm.serviceitemcontrolconfig.searchparams = inputData;
        }

        function postsearchserviceitem() {
            $scope.autosearchpopup = 1;
            for (var idx in vm.serviceitemcontrolconfig.result) {
                var item = vm.serviceitemcontrolconfig.result[idx];
                item.ServiceCode = item.ItemCode;
                item.ServiceName = item.Name;
                var ServiceTraiffobj = $filter('filter')(item.ServiceItemTariffDetails, {
                    ServiceRateCategoryId: $scope.currentfilter.ServiceRateCategoryId
                }, true);
                if (ServiceTraiffobj != null && ServiceTraiffobj.length > 0) {
                    item.ServiceItemRate = ServiceTraiffobj[0].Rate;
                    item.DoctorShare = ServiceTraiffobj[0].DoctorShare;
                }
                var selectedGuarantor = utl.Lookup.getObject($scope.lookup.PatientGuarantor, $scope.currentfilter.GuarantorId);
                if (selectedGuarantor && selectedGuarantor.GuarantorId) {
                    var ServiceItemAliasobj = $filter('filter')(item.ServiceItemAliases, {
                        ExternalProviderId: selectedGuarantor.GuarantorId
                    }, true);
                    if (ServiceItemAliasobj != null && ServiceItemAliasobj.length > 0) {
                        item.AliasId = ServiceItemAliasobj[0].AliasId;
                        item.AliasName = ServiceItemAliasobj[0].AliasName;
                    }
                }
            }
        }

        vm.referralcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Referral Code',
                field: 'ReferralCode',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Referral Name',
                field: 'ReferralName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            {
                header: 'Referral Type',
                field: 'ReferralType',
                datatype: 'string',
                headercls: 'td-type',
                fieldcls: 'td-type'
            },
            {
                header: 'PhoneNo',
                field: 'PhoneNo',
                datatype: 'string',
                headercls: 'td-phone',
                fieldcls: 'td-phone'
            },
            {
                header: 'Area',
                field: 'Area',
                datatype: 'string',
                headercls: 'td-area',
                fieldcls: 'td-area'
            }
            ],
            searchparams: {},
            result: {},
            api: 'generalmaster/referral/GetReferrals',
            formatdisplay: formatselectedreferral,
            presearch: presearchreferral,
            postsearch: postsearchreferral
        };

        function formatselectedreferral() {
            var selectedItem = vm.referralcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.ReferralName = selectedItem.ReferralName;
                $scope.currentfilter.ReferralName = selectedItem.ReferralName;
                $scope.item.ReferrerNumber = selectedItem.PhoneNo;
                $scope.item.ReferrerEmail = selectedItem.Email;
                result = [selectedItem.ReferralName + ' (' + selectedItem.ReferralCode + ')'].join(' ');
            } else if (vm.referralcontrolconfig.rowdata) {
                result = [vm.referralcontrolconfig.rowdata.ReferralName, vm.referralcontrolconfig.rowdata.ReferralCode].join(' ');
            }
            return result;
        }

        function presearchreferral() {
            var query = vm.referralcontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: $scope.item.ReferTypeId
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.referralcontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: $scope.item.ReferralId
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
            }

            vm.referralcontrolconfig.searchparams = inputData;
        }

        function postsearchreferral() {
            for (var idx in vm.referralcontrolconfig.result) {
                var item = vm.referralcontrolconfig.result[idx];
                item.ReferralCode = item.ReferralCode;
                if (item.ReferralType)
                    item.ReferralType = item.ReferralType.Description;
                item.PhoneNo = item.PhoneNo;
                if (item.AddressLine1)
                    item.Area = item.AddressLine1 + ',' + item.CityName;
            }
        }

        $scope.orderinfo = function (idx, item) {
            item.currenteditable = true;
            item.IsDisabled = $scope.IsDisabled;
            utl.Modal.open('patientemr.patientorderdetail', {
                params: {
                    id: 0,
                    pid: $scope.selectedPatient.Id,
                    current_item: item
                },
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
                } else if (upId == 'desc') {
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
                        nextId = "receivedamt";
                        $('#' + nextId).focus();
                    } else {
                        var banknamedom = document.getElementById('BankName');
                        $scope.setCmbFocus(banknamedom);
                    }
                } else if (nextId == "BankName") {
                    $timeout(function () {
                        if ($scope.currentcontext.PaymentTypeId == 2) {
                            nextId = "chequeno";
                            $('#' + nextId).focus();
                        } else if ($scope.currentcontext.PaymentTypeId == 3) {
                            nextId = "ddno";
                            $('#' + nextId).focus();
                        } else if ($scope.currentcontext.PaymentTypeId == 4) {
                            nextId = "transationno";
                            $('#' + nextId).focus();
                        } else if ($scope.currentcontext.PaymentTypeId == 5 || $scope.currentcontext.PaymentTypeId == 6) {
                            nextId = "cardno";
                            $('#' + nextId).focus();
                        }
                    }, 500);
                } else if (nextId == "cardno") {
                    if ($scope.currentcontext.PaymentTypeId == 5 || $scope.currentcontext.PaymentTypeId == 6) {
                        var dom1 = document.getElementById('TerminalNoId');
                        $scope.setCmbFocus(dom1);
                    }
                } else if (nextId == "TerminalNoId") {
                    if ($scope.currentcontext.PaymentTypeId == 5 || $scope.currentcontext.PaymentTypeId == 6) {
                        var dom2 = document.getElementById('CardType');
                        $scope.setCmbFocus(dom2);
                    }
                } else if (nextId == "chequeno") {
                    if ($scope.currentcontext.PaymentTypeId == 2) {
                        nextId = "CollectedOn";
                        $('#' + nextId).focus();
                    }
                } else if (nextId == "transationno") {
                    if ($scope.currentcontext.PaymentTypeId == 4) {
                        nextId = "CollectedOn";
                        $('#' + nextId).focus();
                    }
                } else if (nextId == "ddno") {
                    if ($scope.currentcontext.PaymentTypeId == 3) {
                        nextId = "CollectedOn";
                        $('#' + nextId).focus();
                    }
                } else if (nextId == "CollectedOn") {
                    if ($scope.currentcontext.PaymentTypeId == 2) {
                        nextId = "Chequedate";
                        $('#' + nextId).focus();
                    }
                    if ($scope.currentcontext.PaymentTypeId == 3) {
                        nextId = "dddate";
                        $('#' + nextId).focus();
                    }
                    if ($scope.currentcontext.PaymentTypeId == 4) {
                        nextId = "transferredon";
                        $('#' + nextId).focus();
                    }
                } else if (nextId == "Chequedate") {
                    if ($scope.currentcontext.PaymentTypeId == 2) {
                        nextId = "saveAndApproveid";
                        $('#' + nextId).focus();
                    }
                } else if (nextId == "dddate") {
                    if ($scope.currentcontext.PaymentTypeId == 3) {
                        nextId = "saveAndApproveid";
                        $('#' + nextId).focus();
                    }
                } else if (nextId == "transferredon") {
                    if ($scope.currentcontext.PaymentTypeId == 4) {
                        nextId = "saveAndApproveid";
                        $('#' + nextId).focus();
                    }
                } else if (nextId == "CardType") {
                    if ($scope.currentcontext.PaymentTypeId == 5 || $scope.currentcontext.PaymentTypeId == 6) {
                        nextId = "saveAndApproveid";
                        $('#' + nextId).focus();
                    }
                } else if (nextId == "receivedamt") {
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
            if (kCode == 27) { // Esc
                $scope.autosearchpopup = 0;
            }
        }

        angular.element(document).on('keydown', keyupHandler);

        $scope.$on('$destroy', function () {
            angular.element(document).off('keydown', keyupHandler);
        });
        /* Shortcut Keys Ends Here */
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.getPharmacyPrintPreference();

        $scope.getUserBillsCallback = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                if ($scope.IsDueAllowed == 'true') {
                    utl.Alert.showErrorMsg('Please Collect all Due Amounts to Proceed Next Bill...');
                    $scope.canShowSaveapproveBtn = false;
                    $scope.canShowSaveBtn = false;
                }
            }
        };

        $scope.getUserBills = function () {
            var inputData = {
                Params: [{
                    Key: 39,
                    Value: utl.Session.getCurrentUserId()
                },
                {
                    Key: 45,
                    Value: '0'
                },
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
                onComplete: $scope.getUserBillsCallback
            };
            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $('#btnsubmit').text("Save (F2)");
            $('#saveAndApproveid').text("Approve (F4)");
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
            });
            if ($stateParams.bid > 0) {
                $scope.getBillInfoByBillId();
            }
        };

        $scope.initLookup = function () {
            var inputData = [
                // {
                //     "Key": "Department"
                // },
                // {
                //     "Key": "ServiceRateCategory",
                //     Request: {
                //         Params: [{
                //             Key: 2,
                //             Value: utl.Session.getCurrentFacilityId()
                //         }]
                //     },
                //     Default: false
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
                    "Key": "DiscountMode"
                },
                // {
                //     "Key": "GuarantorType"
                // },
                // {
                //     "Key": "Doctor"
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
                {
                    "Key": "PrivateDueApprover"
                },
                {
                    "Key": "DiscountApprover"
                },
                // {
                //     "Key": "Referral",
                //     Request: {
                //         Params: [{
                //             Key: 7,
                //             Value: [1]
                //         }],
                //         PageContext: {
                //             PageSize: -1,
                //             PageNumber: 1
                //         }
                //     }
                // },
                // {
                //     "Key": "PatientType"
                // }
            ];

            $scope.getLookUp(inputData);
            // var options = {
            //     action: 'General/Options/getoptions',
            //     data: inputData,
            //     type: 'post',
            //     onComplete: $scope.lookupCallback
            // };
            // utl.Http.doAction(options);
        };


        $scope.getLookUp = function (inputData) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        // $scope.getInsurancelookup = function() {
        //     var inputData = [{
        //         "Key": "Guarantor",
        //         Request: {
        //             Params: [{
        //                 Key: 7,
        //                 Value: utl.Session.getCurrentFacilityId()
        //             }, {
        //                 Key: 2,
        //                 Value: $scope.currentfilter.GuarantorTypeId
        //             }]
        //         }
        //     }];
        //     $scope.getLookUp(inputData);
        // };

        $scope.initLookup();
    }

    virtualOrderBillingController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$timeout'];

})();