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
                    var clean = val.replace(/[^0-9]/g, '');
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
    opbilling.controller('opbillingListController', opbillingListController);

    function opbillingListController($rootScope, $scope, $stateParams, $state, $translate, utl, $filter, $timeout, $interval) {
        var vm = this;
        var savehitcompleted = 0;

        $scope.autosearchpopup = 0;
        $scope.dmprintpreferences = 0;
        $scope.printpreferences = 1;
        $scope.chkfindBill = 0;
        $scope.dgbillnosaveoption = 0;
        $scope.IpBillList = 0;
        $scope.IPIsBillLock = false;
        $scope.IsApproved = false;
        $scope.lookup = {};
        $scope.DoctorClassId = -1;
        $scope.DrIncludeTax = false;
        $scope.DrShareDetailInfo = {};
        $scope.SerItmCalculateTax = false;
        $scope.SerItmGSTInfo = {};
        $scope.DrIdDrShareDetailInfo = {};
        $scope.DrIdDoctorClassId = {};
        $scope.DrIdDrIncludeTax = {};
        $scope.canSelectPatients = true;
        $scope.required = false;
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }

        $scope.UserCounterInfo = [];
        $scope.ipnotallowop = 0;
        $scope.opduebillcancel = 0;
        $scope.ispatienttyperequired = 0;
        $scope.disabledueprintforopbill = 0;
        $scope.carddetailsmandatory = 0;
        $scope.carddetailsmandatory = utl.FacilitySetting.getFacilitySettingValue('billing', 'carddetailsmandatory');
        $scope.ipnotallowop =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'ipnotallowop');
        $scope.opduebillcancel =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'opduebillcancel');
        $scope.ispatienttyperequired =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'ispatienttyperequired');
        $scope.disabledueprintforopbill =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'disabledueprintforopbill');
        $scope.editratetype = 0;
        $scope.editratetype =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'editratetype');
        $scope.IsMomentPay =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'isMomentPay');
        $scope.cashcountermandatory = 0;
        $scope.cashcountermandatory =
            (utl.FacilitySetting.getFacilitySettingValue('billing', 'cashcounter')) ? utl.FacilitySetting.getFacilitySettingValue('billing', 'cashcounter') : 0;

        if ($scope.editratetype == 0 || !$scope.editratetype) {
            $scope.DisRateType = true;
        }
        if ($scope.editratetype == 1) {
            $scope.DisRateType = false;
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
        $scope.canShowSaveBtn = true;
        $scope.canShowSaveapproveBtn = true;
        $scope.PatientBillInfo = [];
        $scope.PatientBillInfoDetails = [];
        $scope.PackageInfoDetails = [];
        $scope.RefundInfoDetails = [];
        $scope.item = {};
        $scope.items = {};
        $scope.selectedPatient = {};
        $scope.currentcontext = {};

        $scope.tabindexmap = {
            patienttabindex: 1,
            detailtabindex: 2,
            patientdoctabindex: 3
        };
        $scope.currentcontext = {};


        $scope.currentcontext.selecteddept = [];

        $scope.currentfilter = {
            ReferralId: vm.Context == 'DG' ? -1 : 0,
            DocumentDate: utl.Formatter.getCurrentDate(),
        };

        $scope.patientfilterconfig = {
            ipnotallowop: $scope.ipnotallowop
        };

        if (vm.Context == 'DG') {
            $scope.currentfilter.GuarantorTypeId = 1;
            $scope.patientfilterconfig = {
                isbilloutstanding: true,
                isvisitinprogress: false,
                ipnotallowop: $scope.ipnotallowop,
                context: 'dg'
            };
        }


        $scope.item.PatientId = -1;
        $scope.currentfilter.PatientId = -1;
        $scope.orderfrombilling = 0;
        $scope.currentfilter.patientname = '';
        $scope.currentcontext.PaymentTypeId = 1;
        $scope.currentcontext.TenderAmount = 0;
        $scope.currentfilter.DoctorName = '';
        $scope.currentfilter.GuarantorName = '';
        $scope.currentfilter.ServiceRateCategoryName = '';
        $scope.isSaving = true;
        $scope.outstanding = true;
        $scope.item.BillWithComeReceipt = true;
        $scope.item.PatientBillStatusId = 1;
        $scope.currentcontext.PatientBillStatusId = 1;
        $scope.currentfilter.DiscountModeId = 2;
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
        $scope.item.DoctorId = -1;
        $scope.item.IsFromIPBill = 0;
        $scope.item.TaxAmt = 0; // GSTAmount
        $scope.CanDelete = false;
        $scope.canShowFinanceBtn = false;
        $scope.canShowAdvanceBtn = false;
        $scope.item.WithHeader = true;
        $scope.item.WithoutHeader = false;
        $scope.item.GuarantorDueId = -1;
        $scope.IsDueAllowed = utl.Session.getIsDueCheck();
        $scope.disallowMultiplePay = false;
        // if ($stateParams.orderdetails) {
        //     $scope.PatientBillDetails = orderdetails;
        // }
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

        $scope.checkCounterStatusCallback = function (scope, res, options, hasError) {
            $scope.UserCounterInfo = res.Data || [];
            $scope.patientChange();
            $scope.initLookup();
            $scope.applyVisibilityRules();
            // $scope.clear();
            //             $scope.currentfilter.GuarantorTypeId = -1;
            if (vm.Context == 'DG') {
                $scope.currentfilter.GuarantorTypeId = 1;
                $scope.item.DepartmentId = 126;
                var guarantor = {
                    Id: 1
                };
                $scope.GuarantorTypeChange(guarantor)
            }
            // if ($scope.UserCounterInfo && $scope.UserCounterInfo.length > 0) {
            //     $scope.patientChange();
            //     $scope.initLookup();
            //     $scope.applyVisibilityRules();
            //     // $scope.clear();
            //     //             $scope.currentfilter.GuarantorTypeId = -1;
            //     if (vm.Context == 'DG') {
            //         $scope.currentfilter.GuarantorTypeId = 1;
            //         $scope.item.DepartmentId = 126;
            //         var guarantor = {
            //             Id: 1
            //         };
            //         $scope.GuarantorTypeChange(guarantor)
            //     }

            // } else {
            //     utl.Alert.showErrorMsg($translate.instant('Please Start Cash Counter'));
            //     return false;

            // }
        };

        $scope.checkCounterStatusByUserId = function () {
            var inputData = {
                Params: [
                    { Key: 1, Value: utl.Session.getCurrentUserId() },
                    { Key: 10, Value: 1 }
                ],
                PageContext: { PageSize: 1000, PageNumber: 1 }
            };

            var options = {
                action: 'billing/userbillingcounters/GetBillingCounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.checkCounterStatusCallback
            };

            utl.Http.doAction(options);
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

        // --- React Bridge ---
        $scope.handleReactAction = function(actionName) {
            if (typeof $scope[actionName] === 'function') {
                $scope[actionName]();
            } else if (actionName === 'saveAndDraft') {
                $scope.completeBill($scope.saveDraft);
            } else if (actionName === 'saveAndApprove') {
                $scope.completeBill($scope.saveAndApprove);
            } else if (actionName === 'printReceipt') {
                $scope.print(true);
            }
        };

        // Payload-aware dispatchers for the opbilling-list header / discount
        // approval / footer payment ui-select clusters. Kept separate from
        // the generic zero-argument handleReactAction above (which has no
        // payload support) rather than changing its signature, so every
        // existing caller of handleReactAction is unaffected.
        $scope.handleHeaderAction = function (actionType, payload) {
            payload = payload || {};
            switch (actionType) {
                case 'serviceRateCatChange':
                    $scope.currentfilter.ServiceRateCategoryId = payload.id;
                    var selectedRateCat = null;
                    ($scope.lookup.ServiceRateCategory || []).forEach(function (o) {
                        if (o.Id === payload.id) selectedRateCat = o;
                    });
                    $scope.ServiceRateCatChange(selectedRateCat || { Id: payload.id, Text: '' });
                    break;
                case 'discountModeHeaderChange':
                    $scope.currentfilter.DiscountModeId = payload.id;
                    $scope.DiscountModechange();
                    break;
                case 'patientTypeChange':
                    $scope.item.PatientTypeId = payload.id;
                    break;
                case 'guarantorTypeDiscountCategoryChange':
                    $scope.currentfilter.GuarantorTypeId = payload.id;
                    var selectedGuarantorType = null;
                    ($scope.lookup.GuarantorType || []).forEach(function (o) {
                        if (o.Id === payload.id) selectedGuarantorType = o;
                    });
                    $scope.GuarantorTypeChange(selectedGuarantorType || { Id: payload.id });
                    break;
                case 'headerKeyUp':
                    $scope.moveHeaderFocus(payload.nextId);
                    break;
            }
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.handleDiscountApprovalAction = function (actionType, payload) {
            payload = payload || {};
            switch (actionType) {
                case 'discountModeFooterChange':
                    $scope.currentfilter.DiscountModeId = payload.id;
                    var selectedDiscMode = null;
                    ($scope.lookup.DiscountMode || []).forEach(function (o) {
                        if (o.Id === payload.id) selectedDiscMode = o;
                    });
                    $scope.BillDiscountModechange(selectedDiscMode || { Id: payload.id });
                    break;
                case 'discountApproverChange':
                    $scope.currentcontext.DiscountApprovedBy = payload.id;
                    var selectedApprover = null;
                    ($scope.lookup.DiscountApprover || []).forEach(function (o) {
                        if (o.Id === payload.id) selectedApprover = o;
                    });
                    if (selectedApprover) { $scope.setDiscountLimit(selectedApprover); }
                    break;
            }
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.handleFooterPaymentAction = function (actionType, payload) {
            payload = payload || {};
            switch (actionType) {
                case 'paymentTypeChange':
                    $scope.currentcontext.PaymentTypeId = payload.id;
                    break;
                case 'creditApproverChange':
                    $scope.item.PrivateDueId = payload.id;
                    var selectedDueApprover = null;
                    ($scope.lookup.PrivateDueApprover || []).forEach(function (o) {
                        if (o.Id === payload.id) selectedDueApprover = o;
                    });
                    if (selectedDueApprover) { $scope.setDueLimit(selectedDueApprover); }
                    break;
                case 'bankChange':
                    $scope.item.BankId = payload.id;
                    break;
                case 'cardTypeChange':
                    $scope.item.CardTypeId = payload.id;
                    break;
                case 'terminalChange':
                    $scope.item.TerminalNoId = payload.id;
                    break;
                case 'footerKeyUp':
                    $scope.FooterFocus(payload.nextId);
                    break;
            }
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.refreshReactProps = function() {
            $scope.reactPropsActionBarContainer = {
                onAction: $scope.handleReactAction,
                reactProps: {
                    context: vm.Context,
                    ipIsBillLock: $scope.IPIsBillLock,
                    ipBillListEnabled: !!$scope.IpBillList,
                    privileges: {
                        canViewPreviousBills: $scope.HasAccess ? $scope.HasAccess('OPBilling','OP_PreviousBills') : true,
                        canViewOutstandingBills: $scope.HasAccess ? $scope.HasAccess('OPBilling','OP_OutStandingBills') : true
                    }
                }
            };

            $scope.reactPropsSaveBarContainer = {
                onAction: $scope.handleReactAction,
                reactProps: {
                    itemId: $scope.item ? $scope.item.Id : 0,
                    patientBillStatusId: $scope.item ? $scope.item.PatientBillStatusId : 0,
                    patientStatusId: $scope.item ? $scope.item.PatientStatusId : 0,
                    advanceReceiptAmount: $scope.item ? $scope.item.AdvanceReceptAmount : 0,
                    isShow: $scope.IsShow,
                    canShowSaveBtn: $scope.canShowSaveBtn,
                    canShowSaveapproveBtn: $scope.canShowSaveapproveBtn,
                    isFromIPBill: $scope.item ? (Number($scope.item.IsFromIPBill) || 0) : 0,
                    receiptNo: $scope.item ? $scope.item.ReceiptNo : '',
                    attachmentCount: $scope.currentcontext ? $scope.currentcontext.attachmentcount : 0,
                    privileges: {
                        canAttachment: $scope.HasAccess ? $scope.HasAccess('OPBilling','Attachment') : true,
                        canSave: $scope.HasAccess ? $scope.HasAccess('OPBilling', 'Save') : true,
                        canSaveApprove: $scope.HasAccess ? $scope.HasAccess('OPBilling', 'Save_Approve') : true
                    }
                }
            };

            $scope.reactPropsHeaderContainer = {
                onAction: $scope.handleHeaderAction,
                reactProps: {
                    serviceRateCategoryOptions: $scope.lookup.ServiceRateCategory || [],
                    serviceRateCategoryId: $scope.currentfilter ? $scope.currentfilter.ServiceRateCategoryId : null,
                    disRateType: $scope.DisRateType,
                    guarantorTypeOptions: $scope.lookup.GuarantorType || [],
                    guarantorTypePayerId: $scope.currentfilter ? $scope.currentfilter.GuarantorTypeId : null,
                    discountModeOptions: $scope.lookup.DiscountMode || [],
                    discountModeHeaderId: $scope.currentfilter ? $scope.currentfilter.DiscountModeId : null,
                    rdoBillDiscountMode: $scope.currentcontext ? $scope.currentcontext.RdoBillDiscountMode : false,
                    patientTypeOptions: $scope.lookup.PatientType || [],
                    patientTypeId: $scope.item ? $scope.item.PatientTypeId : null,
                    guarantorTypeDiscountCategoryId: $scope.currentfilter ? $scope.currentfilter.GuarantorTypeId : null
                }
            };

            $scope.reactPropsDiscountApprovalContainer = {
                onAction: $scope.handleDiscountApprovalAction,
                reactProps: {
                    discountModeOptions: $scope.lookup.DiscountMode || [],
                    discountModeFooterId: $scope.currentfilter ? $scope.currentfilter.DiscountModeId : null,
                    rdoBillDiscountMode: $scope.currentcontext ? $scope.currentcontext.RdoBillDiscountMode : false,
                    discountApproverOptions: $scope.lookup.DiscountApprover || [],
                    discountApprovedById: $scope.currentcontext ? $scope.currentcontext.DiscountApprovedBy : null,
                    rdoApprovedById: $scope.RdoApprovedById
                }
            };

            $scope.reactPropsFooterPaymentContainer = {
                onAction: $scope.handleFooterPaymentAction,
                reactProps: {
                    paymentTypeOptions: $scope.lookup.PaymentType || [],
                    paymentTypeId: $scope.currentcontext ? $scope.currentcontext.PaymentTypeId : null,
                    rdoPaymentTypeId: $scope.RdoPaymentTypeId,
                    privateDueApproverOptions: $scope.lookup.PrivateDueApprover || [],
                    privateDueId: $scope.item ? $scope.item.PrivateDueId : null,
                    rdoGuarantorDue: $scope.currentcontext ? $scope.currentcontext.RdoGuarantorDue : false,
                    bankOptions: $scope.lookup.Bank || [],
                    bankId: $scope.item ? $scope.item.BankId : null,
                    cardTypeOptions: $scope.lookup.CardType || [],
                    cardTypeId: $scope.item ? $scope.item.CardTypeId : null,
                    terminalOptions: $scope.lookup.Terminal || [],
                    terminalNoId: $scope.item ? $scope.item.TerminalNoId : null,
                    itemIsCompleted: $scope.item ? $scope.item.isCompleted : false
                }
            };
        };

        $scope.refreshReactProps();

        $scope.$watchGroup([
            'item',
            'canShowSaveBtn',
            'canShowSaveapproveBtn',
            'IsShow',
            'currentfilter.ServiceRateCategoryId',
            'currentfilter.GuarantorTypeId',
            'currentfilter.DiscountModeId',
            'currentcontext.DiscountApprovedBy',
            'currentcontext.PaymentTypeId',
            'currentcontext.RdoBillDiscountMode',
            'currentcontext.RdoGuarantorDue',
            'item.PatientTypeId',
            'item.BankId',
            'item.CardTypeId',
            'item.TerminalNoId',
            'item.PrivateDueId',
            'item.isCompleted',
            'DisRateType',
            'RdoPaymentTypeId',
            'RdoApprovedById'
        ], function() {
            $scope.refreshReactProps();
        });
        // --------------------
        $scope.EnableBillWithComeReceipt = function () {
            var flag = !$scope.item.BillWithComeReceipt;
            $scope.currentcontext.RdoReceiptAmt = flag;
            $scope.RdoPaymentTypeId = flag;
        };

        $scope.currentcontext.PatientStatusId = 1;
        $scope.currentcontext.id = 0;
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
        $scope.encGuarantorAgreements = [];
        $scope.currentcontext.CanOP_Cancel = utl.Privilege.hasAccess('CanOP_Cancel');
        $scope.currentcontext.CanOP_PartialCancel = utl.Privilege.hasAccess('CanOP_PartialCancel');
        $scope.currentcontext.CanOP_PreviousBills = utl.Privilege.hasAccess('CanOP_PreviousBills');
        $scope.currentcontext.CanOP_OutStandingBills = utl.Privilege.hasAccess('CanOP_OutStandingBills');
        $scope.currentcontext.CanOP_TheramlPrint = utl.Privilege.hasAccess('CanOP_TheramlPrint');
        $scope.currentcontext.tpa = "";
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
        vm.doctorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                // {
                //     header: 'Doctor Id',
                //     field: 'DoctorId',
                //     datatype: 'string',
                //     headercls: 'td-code',
                //     fieldcls: 'td-code'
                // },
                {
                    header: 'Doctor Name',
                    field: 'DoctorName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
                // {
                //     header: 'Qualification',
                //     field: 'Qualification',
                //     datatype: 'string',
                //     headercls: 'td-Qualification',
                //     fieldcls: 'td-Qualification'
                // },
                {
                    header: 'Department',
                    field: 'Speciality',
                    datatype: 'string',
                    headercls: 'td-Department',
                    fieldcls: 'td-Department'
                },
                // {
                //     header: 'Speciality',
                //     field: 'Speciality',
                //     datatype: 'string',
                //     headercls: 'td-dept',
                //     fieldcls: 'td-dept'
                // },
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/User/GetMinUsers',
            formatdisplay: formatselecteddoctor,
            presearch: presearchdoctor,
            postsearch: postsearchdoctor
        };

        function formatselecteddoctor() {
            var selectedItem = vm.doctorcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.DoctorName].join('  ');
                $scope.item.DepartmentId = selectedItem.DepartmentId;

                if (selectedItem.Department) {
                    // if (selectedItem.Department.IsEmergency == true)
                    $scope.item.IsEmergencyPatient = selectedItem.Department.IsEmergency;
                    $scope.item.DepartmentName = selectedItem.UserDept.DepartmentName;
                }
            } else if (vm.doctorcontrolconfig.rowdata) {
                result = [vm.doctorcontrolconfig.rowdata.DoctorId, vm.doctorcontrolconfig.rowdata.DoctorName,
                vm.doctorcontrolconfig.rowdata.Qualification, vm.doctorcontrolconfig.rowdata.UserDept.DepartmentName, vm.doctorcontrolconfig.rowdata.Speciality
                ].join(' ');
            }

            /* Doctor Share */
            // $scope.DoctorClassId = selectedItem.DoctorClassId;
            // $scope.DrIncludeTax = selectedItem.IsIncludeTax;
            // $scope.DrShareDetailInfo = {};
            // $scope.SerItmCalculateTax = false;
            // $scope.SerItmGSTInfo = {};
            // /* Doctor Share */

            // $scope.item.ScheduleApptId = null;
            // $scope.item.ScheduleApptTime = null;
            // $scope.item.IsCheckedInAppt = false;
            $scope.item.DoctorName = result;
            // $scope.DrDefaultServiceInfo = [];
            // $scope.getDoctorTeam();
            // $scope.getFollowupDeptwise();
            // $scope.calDoctorShareInfo();
            return result;
        }

        function presearchdoctor() {
            var query = vm.doctorcontrolconfig.query;
            //Search only DoctorGroup
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: 2
                },
                {
                    Key: 5,
                    Value: 2
                },
                // {
                //     Key: 2,
                //     Value: utl.Session.getCurrentFacilityId()
                // },
                {
                    Key: 33,
                    Value: utl.Session.getCurrentFacilityId()
                }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.doctorcontrolconfig.searchbyid == true) {
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
                if (item.Title)
                    item.DoctorName = item.Title.Description + ' ' + item.FirstName;
                item.Qualification = item.Qualification;
                if (item.Department)
                    item.Speciality = item.Department.DepartmentName;
            }
        }

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
            // $scope.getInsurancelookup();
            // $scope.initLookup();
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
            $scope.item.Title = $scope.selectedPatient.Title.Description;
            $scope.item.PatientId = $scope.selectedPatient.Id;
            $scope.item.PatientMrn = $scope.selectedPatient.MRN;
            $scope.item.Mobile = $scope.selectedPatient.Mobile;
            $scope.item.Gender = $scope.selectedPatient.Gender.Description;
            $scope.item.PatientTypeId = $scope.selectedPatient.PatientTypeId;
            var ageObj = utl.Formatter.getDetailedAgeFromDOB($scope.selectedPatient.DOB);
            $scope.selectedPatient.ApproxAgeDays = ageObj.d;
            $scope.selectedPatient.ApproxAgeMonths = ageObj.m || 0;
            $scope.selectedPatient.Age = ageObj.y;
            if ($scope.selectedPatient.Age == null) {
                $scope.selectedPatient.Age = 0;
            }
            if ($scope.selectedPatient.Age == 0 || !$scope.selectedPatient.Age) {
                $scope.currentcontext.Age = $scope.selectedPatient.ApproxAgeDays + ' ' +
                    'D' + '/' + $scope.selectedPatient.ApproxAgeMonths + 'M';
            } else {
                $scope.currentcontext.Age = $scope.selectedPatient.Age;
            }
            if ($scope.selectedPatient.Referrer) {
                $scope.currentcontext.ReferralName = $scope.selectedPatient.Referrer.ReferralName;
            }
            // $scope.item.TotalAvailableAmount = $scope.selectedPatient.AmountPaid - $scope.selectedPatient.AmountAdjusted;
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
                    if ($scope.ipnotallowop == 1) {
                        utl.Alert.showErrorMsg('Cannot generate OP bill for an IP patient.');
                        return;
                    }
                }
                var encGuarantor = encounter.EncounterGuarantors.length > 0 ? encounter.EncounterGuarantors[0] : {
                    GuarantorTypeId: -1
                };
                if (!$scope.currentfilter.GuarantorTypeId) {
                    // $scope.currentfilter.GuarantorTypeId = encGuarantor.GuarantorTypeId;
                    $scope.currentfilter.GuarantorTypeId = encounter.GuarantorTypeId;
                }
                $scope.CanShowScheme = false;
                $scope.ItemPromotions = [];
                $scope.CategoryPromotions = [];
                if (encounter.PromotionalSchemeId > 0) {
                    $scope.CanShowScheme = true;
                    $scope.currentfilter.PromotionalSchemeId = encounter.PromotionalSchemeId;
                    $scope.currentfilter.PromotionalScheme = encounter.PromotionalScheme.PromotionSchemeName;
                    $scope.PromotionalSchemeDetails = encounter.PromotionalScheme.PromotionalSchemeDetails;
                    for (var idx in $scope.PromotionalSchemeDetails) {
                        var schemeDetail = $scope.PromotionalSchemeDetails[idx];
                        if (schemeDetail.ServiceCategoryId > 0) {
                            $scope.CategoryPromotions.push(schemeDetail);
                        }
                        if (schemeDetail.ServiceItemId > 0) {
                            $scope.ItemPromotions.push(schemeDetail);
                        }
                    }
                }
                $scope.encGuarantorAgreements = [];

                if (encGuarantor.Guarantor) {
                    $scope.currentfilter.GuarantorName = encGuarantor.Guarantor.GuarantorName;
                    if ($scope.currentfilter.GuarantorTypeId > 1) {
                        if (encGuarantor.Guarantor.GuarantorAgreements.length > 0) {
                            $scope.encGuarantorAgreements = encGuarantor.Guarantor.GuarantorAgreements;
                        }
                    }
                }

                // $scope.GuarantorTypeChange({
                //     Id: encGuarantor.GuarantorTypeId
                // })
            }
            $scope.fnencounter();
            $scope.getUserBills();
            if ($scope.currentfilter.PatientId > 0 && !$scope.item.BillNumber) {
                $scope.isSaving = false;
                $scope.outstanding = false;
                $scope.EnableDisableDropdown($scope.isSaving);

                if ($scope.currentcontext.id <= 0) {
                    $scope.getBillInfoByPatientID();
                }
            }
            //$scope.getGeneralAlertsCount();
            $scope.getPatientAlertsCount();
            $scope.getPatientPendingOrdersCount();

            // $scope.getInsurancelookup();
            $scope.applyVisibilityRules();
            // $timeout(function () {
            //     $('#doctorid').focus();
            // }, 100);
            // $('#doctorid').select();
            // $('#doctorid').focus();
        };

        $scope.patientChange = function () {
            $scope.chkfindBill = 0;
            // if ($scope.cashcountermandatory == 1) {
            //     if ($scope.UserCounterInfo.length == 0) {
            //         utl.Alert.showErrorMsg($translate.instant('Please Start Cash Counter'));
            //         // return false;
            //         $scope.clear();
            //     }
            // }
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

        $scope.patcmnts = function () {
            utl.Modal.open('app.patcomments', {
                params: {
                    eid: $scope.item.EncounterId,
                    pid: $scope.currentfilter.PatientId,
                },
                confirmCallback: $scope.getItem
            });
        }

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
                        Key: 12,
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
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.PatientId
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
            // $scope.getInsurancelookup();
            $scope.addNewLineItem();
        };

        $scope.getguarantoragreementsCallback = function (scope, res, options, hasError) {
            $scope.encGuarantorAgreements = res.Data;
        }
        $scope.getguarantoragreements = function (SelectedGuarantor) {
            var inputData = {
                Params: [{
                    Key: 1,
                    Value: SelectedGuarantor.Id
                }],
            };
            var options = {
                action: 'generalmaster/GuarantorAgreement/GetGuarantorAgreements',
                data: inputData,
                type: 'post',
                onComplete: $scope.getguarantoragreementsCallback
            };
            utl.Http.doAction(options);
        };

        $scope.GuarantorChange = function (SelectedGuarantor) {
            $scope.currentfilter.GuarantorId = SelectedGuarantor.Id;
            // $scope.item.GuarantorDueId = SelectedGuarantor.Id;
            $scope.currentfilter.GuarantorName = SelectedGuarantor.Text;
            $scope.currentfilter.GuarantorTypeId = SelectedGuarantor.GuarantorTypeId;
            $scope.currentfilter.ServiceRateCategoryId = SelectedGuarantor.ServiceRateCategoryId;
            $scope.PatientBillDetails = [];
            $scope.PatientPaymentDetails = [];
            $scope.item.GuarantorDueId = SelectedGuarantor.Id;
            $scope.addNewLineItem();
            $scope.getguarantoragreements(SelectedGuarantor);
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

        $scope.setDueLimit = function (item) {
            vm.DueApprover = item;
            $scope.CalculateNetAmt();
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
                if (doctorObj) {
                    $scope.calDoctorShareInfo(doctorObj);
                } else {
                    $scope.CalculateNetAmt();
                }


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
                if ($scope.disabledueprintforopbill == 1) {
                    if ($scope.PatientBillInfo.length > 0 && $scope.currentfilter.GuarantorTypeId == 1 &&
                        $scope.PatientBillInfo[0].OutStandingAmount > 0) {
                        $scope.HidePrintBtn = true;
                    }
                } else if (!$scope.disabledueprintforopbill || $scope.disabledueprintforopbill == 0) {
                    if ($scope.PatientBillInfo.length > 0 && $scope.currentfilter.GuarantorTypeId == 1 &&
                        $scope.PatientBillInfo[0].OutStandingAmount > 0) {
                        $scope.HidePrintBtn = false;
                    }
                }
            }
            if ($scope.PatientBillInfo.length > 0 && $scope.PatientBillInfo[0].OutStandingAmount > 0 &&
                $scope.item.PatientBillStatusId != 2 && $scope.item.IsMultiplePayment) {
                $scope.HidePrintBtn = true;
            }
            if ($scope.PatientBillInfo.length > 0 && $scope.PatientBillInfo[0].OutStandingAmount > 0 &&
                $scope.item.IsMultiplePayment == true) {
                $scope.disallowMultiplePay = true;
            }

            if ($scope.PatientBillInfo.length > 0 && $scope.PatientBillInfo[0].OutStandingAmount > 0 &&
                $scope.item.PatientBillStatusId != 2) {
                $scope.canShowSaveapproveBtn = true;
                $scope.RdoPaymentTypeId = false;
                $scope.item.BillWithComeReceipt = true;
            } else if ($scope.PatientBillInfo.length > 0 && $scope.PatientBillInfo[0].OutStandingAmount == 0 && $scope.item.PatientBillStatusId > 1) {
                $scope.canShowSaveapproveBtn = false;
                $scope.RdoPaymentTypeId = true;
                $scope.item.BillWithComeReceipt = false;
            }
            if ($scope.PatientBillInfo.length > 0 && $scope.PatientBillInfo[0].OutStandingAmount > 0 &&
                $scope.currentfilter.GuarantorTypeId > 1) {
                // if ($scope.item.IsMultiplePayment === true && vm.Context) {
                $scope.canShowSaveapproveBtn = true;
                // } else {
                //     $scope.canShowSaveapproveBtn = false;
                // }

            }
            $scope.currentcontext.RdoGuarantorDue = $scope.item.PatientBillStatusId != 1 ? true : false;
            console.log($scope.currentcontext.RdoGuarantorDue);
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
                UPIRefNumber: $scope.currentcontext.PaymentTypeId == 11 || $scope.currentcontext.PaymentTypeId == 12 ? $scope.item.UPIRefNumber : '',
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
                AgreementDiscountRate: 0.00,
                ExecDoctorId: -1,
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
            if ($scope.item.CancelReqRaisedStatusId == 1) {
                utl.Alert.showErrorMsg('Cancel Request Already Raised');
                return false;
            }
            if ($scope.item.CancelReqRaisedStatusId == 3) {
                utl.Alert.showErrorMsg('Cancel Request Rejected');
                return false;
            }

            if ($scope.item.IsMultiplePayment && ($scope.item.OutStandingAmount > 0 || $scope.currentcontext.TotBalanceAmt > 0)) {
                utl.Alert.showErrorMsg('Cancel Request Rejected... Pay the full amount');
                return false;
            }
            utl.Modal.open('app.itemwiseopbillcancel', {
                params: {
                    id: $scope.currentcontext.id,
                    billnumber: $scope.item.BillNumber,
                    CancelReqRaisedStatusId: $scope.item.CancelReqRaisedStatusId,
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
                item.IsExternalLab = ServiceItemobj.IsExternalLab;
                item.IsPackage = ServiceItemobj.IsPackage;
                item.IsInsAgreementDiscount = false;
                item.IsExecDoctor = ServiceItemobj.IsExecDoctor;
                if (item.IsOrderable == true || item.IsPackage == true) {
                    if (!item.LoadFrom) {
                        $scope.item.LoadFrom = 'orderbills';
                    }
                }
                if ($scope.CategoryPromotions && $scope.CategoryPromotions.length > 0) {
                    for (var ctsc in $scope.CategoryPromotions) {
                        var catescheme = $scope.CategoryPromotions[ctsc];
                        if (catescheme.ServiceCategoryId === item.ServiceCategoryId) {
                            if ($scope.currentfilter.DiscountModeId > 0) {
                                item.IsSchemeDiscount = true;
                                $scope.currentcontext.BillDiscountTypeId = 1;
                                if ($scope.currentfilter.DiscountModeId == 2) {
                                    if (catescheme.DiscountModeId == $scope.currentfilter.DiscountModeId) {
                                        item.SchemeDiscountRate = parseFloat(catescheme.Discount).toFixed(2);
                                    }
                                } else if ($scope.currentfilter.DiscountModeId == 1) {
                                    if (catescheme.DiscountModeId == $scope.currentfilter.DiscountModeId) {
                                        item.SchemeDiscountAmt = parseFloat(catescheme.Discount).toFixed(2);
                                    }
                                }
                            } else {
                                utl.Alert.showErrorMsg($translate.instant('Please Select Discount Mode'));
                            }
                        }
                    }
                }
                if ($scope.ItemPromotions && $scope.ItemPromotions.length > 0) {
                    for (var itsc in $scope.ItemPromotions) {
                        var itemScheme = $scope.ItemPromotions[itsc];
                        if (itemScheme.ServiceItemId === item.ServiceId) {
                            if ($scope.currentfilter.DiscountModeId > 0) {
                                if ($scope.currentfilter.DiscountModeId == 2) {
                                    item.IsSchemeDiscount = true;
                                    $scope.currentcontext.BillDiscountTypeId = 1;
                                    if (itemScheme.DiscountModeId == $scope.currentfilter.DiscountModeId) {
                                        item.SchemeDiscountRate = parseFloat(itemScheme.Discount).toFixed(2);
                                    }
                                } else if ($scope.currentfilter.DiscountModeId == 1) {
                                    if (itemScheme.DiscountModeId == $scope.currentfilter.DiscountModeId) {
                                        item.SchemeDiscountAmt = parseFloat(itemScheme.Discount).toFixed(2);
                                    }
                                }
                            } else {
                                utl.Alert.showErrorMsg($translate.instant('Please Select Discount Mode'));
                            }
                        }
                    }
                }
                if ($scope.currentfilter.GuarantorTypeId > 1) {
                    if ($scope.encGuarantorAgreements && $scope.encGuarantorAgreements.length > 0) {
                        for (var encGAidx in $scope.encGuarantorAgreements) {
                            var agreementitem = $scope.encGuarantorAgreements[encGAidx];
                            if (agreementitem.ServiceCategoryId === item.ServiceCategoryId) {
                                if ($scope.currentfilter.DiscountModeId > 0) {
                                    item.IsInsAgreementDiscount = true;
                                    if ($scope.currentfilter.DiscountModeId == 2) {
                                        item.AgreementDiscountRate = parseFloat(agreementitem.OPDiscount).toFixed(2);
                                    } else if ($scope.currentfilter.DiscountModeId == 1) {
                                        item.AgreementDiscountRate = parseFloat(agreementitem.OPDiscountRate).toFixed(2);
                                    }
                                } else {
                                    utl.Alert.showErrorMsg($translate.instant('Please Select Discount Mode'));
                                }
                            }
                        }
                    }
                }
                item.DrShareTaxId = -1;
                item.DrTaxPercentage = -1;
                if (ServiceItemobj.GstMaster && ServiceItemobj.GstMaster.Id)
                    item.DrShareTaxId = ServiceItemobj.GstMaster.Id;
                if (ServiceItemobj.GstMaster && ServiceItemobj.GstMaster.GstPercentage)
                    item.DrTaxPercentage = ServiceItemobj.GstMaster.GstPercentage;
                if (ServiceItemobj.GstMaster && ServiceItemobj.GstMaster.GstCode)
                    item.TaxCode = ServiceItemobj.GstMaster.GstCode;

                if (ServiceItemobj.GstMaster && ServiceItemobj.GstMaster.Id)
                    item.GSTId = ServiceItemobj.GstMaster.Id;
                if (ServiceItemobj.GstMaster && ServiceItemobj.GstMaster.GstPercentage)
                    item.GSTPercentage = ServiceItemobj.GstMaster.GstPercentage;

                item.DoctorId = $scope.item.DoctorId;
                item.DoctorName = $scope.item.DoctorName;
                item.RdoDiscountMode = false;
                item.IsPackageItem = ServiceItemobj.IsPackage;
                item.IsExecutableProcedure = ServiceItemobj.IsExecutableProcedure;
                var ServiceTraiffobj = $filter('filter')(ServiceItemobj.ServiceItemTariffDetails, {
                    ServiceRateCategoryId: $scope.currentfilter.ServiceRateCategoryId,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                }, true);
                if (ServiceTraiffobj != null && ServiceTraiffobj.length > 0) {
                    item.ServiceRateCategoryId = ServiceTraiffobj[0].ServiceRateCategoryId;
                    item.ServiceRateCategoryName = ServiceTraiffobj[0].Text;
                    if ($scope.item.IsEmergency) {
                        item.UnitPrice = ServiceTraiffobj[0].EmergencyRate;
                        item.Rate = ServiceTraiffobj[0].EmergencyRate;
                    } else {
                        item.UnitPrice = ServiceTraiffobj[0].Rate;
                        item.Rate = ServiceTraiffobj[0].Rate;
                    }
                    item.DoctorShareValue = ServiceTraiffobj[0].DoctorShareValue;
                    item.DoctorShareRate = ServiceTraiffobj[0].DoctorShare;
                    item.ShareTypeId = ServiceTraiffobj[0].ShareTypeId;
                    item.ExternalPrice = ServiceTraiffobj[0].ExternalPrice;
                    $scope.CalcualteAmt(item);
                    var lastIndex = 0;
                    for (var packid in $scope.PatientBillDetails) {
                        if (!$scope.PatientBillDetails[packid].PackageMasterServiceId)
                            lastIndex++;
                    }
                    if (idx == (lastIndex - 1)) {
                        $scope.addNewLineItem();
                    } else if (idx == (lastIndex - 2)) {
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
                if (ServiceItemobj.IsPackage) {
                    item.ServiceItemPackageMaps = ServiceItemobj.ServiceItemPackageMaps;
                }
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
            $scope.getDuplicateordererror(ServiceItemobj);
            $scope.getBillInfoDetails(ServiceItemobj);
        };
        $scope.getDuplicateordererror = function (ServiceItemobj) {
            if ($scope.PatientBillDetails.length > 0) {
                for (var pdx in $scope.PatientBillDetails) {
                    var BillDetailData = $scope.PatientBillDetails[pdx];
                    if (BillDetailData.IsPackageItem) {
                        var Servicepackages = BillDetailData.ServiceItemPackageMaps;
                    }
                    if (!BillDetailData.IsPackageItem) {
                        if (Servicepackages) {
                            if (Servicepackages.length > 0) {
                                for (var sdx in Servicepackages) {
                                    var servicePackmapItem = Servicepackages[sdx];
                                    if (servicePackmapItem.ServiceId == BillDetailData.ServiceId) {
                                        utl.Alert.showErrorMsg($translate.instant('Item Already included in packages'));
                                        var index = $scope.PatientBillDetails.indexOf(BillDetailData);
                                        BillDetailData.Status = 2;
                                        $scope.DeletedPatientBills.push(BillDetailData);
                                        $scope.PatientBillDetails.splice(index, 1);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
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
                if (item.SchemeDiscountRate > 0) {
                    var sdisamt = (item.SchemeDiscountRate / 100) * item.Amount;
                    item.SchemeDiscountAmt = sdisamt;
                    item.NetAmount = item.Amount - sdisamt;
                }
                if (item.AgreementDiscountRate > 0) {
                    var discamt = (item.AgreementDiscountRate / 100) * item.Amount;
                    item.AgreementDiscountAmt = discamt;
                    item.NetAmount = item.Amount - discamt;
                }

                if (item.DiscountAmount > 0) {
                    var discamt = (item.DiscountAmount / 100) * item.Amount;
                    if (discamt > item.Amount) {
                        item.DiscountAmount = 0;
                        item.NetAmount = item.Amount;
                        utl.Alert.showErrorMsg($translate.instant('billing.pharmacy-return.receivingamt.lbl'));
                    } else {
                        item.NetAmount = item.Amount - discamt;
                    }
                }
                if (item.AgreementDiscountRate > 0 && item.DiscountAmount > 0) {
                    var agreediscamt = (item.AgreementDiscountRate / 100) * item.Amount;
                    item.AgreementDiscountAmt = agreediscamt;
                    var discamt = (item.DiscountAmount / 100) * item.Amount;
                    var totdiscamt = parseFloat(agreediscamt) + parseFloat(discamt);
                    item.NetAmount = item.Amount - totdiscamt;
                }
                if (item.SchemeDiscountRate > 0 && item.DiscountAmount > 0) {
                    var sdisamt = (item.SchemeDiscountRate / 100) * item.Amount;
                    item.SchemeDiscountAmt = sdisamt;
                    var discamt = (item.DiscountAmount / 100) * item.Amount;
                    var totdiscamt = parseFloat(sdisamt) + parseFloat(discamt);
                    item.NetAmount = item.Amount - totdiscamt;
                } else if ((!item.DiscountAmount && !item.AgreementDiscountRate && !item.SchemeDiscountAmt) ||
                    (item.DiscountAmount == 0 && item.AgreementDiscountRate == 0 && item.SchemeDiscountAmt == 0)) {
                    item.NetAmount = item.Amount;
                }
            } else if ($scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 1) {
                if (item.SchemeDiscountAmt > 0) {
                    item.NetAmount = item.Amount - item.SchemeDiscountAmt;
                }
                if (item.AgreementDiscountRate > 0) {
                    item.AgreementDiscountAmt = item.AgreementDiscountRate;
                    item.NetAmount = item.Amount - item.AgreementDiscountRate;
                }

                if (item.DiscountAmount > 0) {
                    if (item.DiscountAmount > item.Amount) {
                        item.DiscountAmount = 0;
                        item.NetAmount = item.Amount;
                        utl.Alert.showErrorMsg($translate.instant('billing.pharmacy-return.receivingamt.lbl'));
                    } else {
                        item.NetAmount = item.Amount - item.DiscountAmount;
                    }
                }
                if (item.AgreementDiscountRate > 0 && item.DiscountAmount > 0) {
                    item.AgreementDiscountAmt = item.AgreementDiscountRate;
                    var totdiscamt = parseFloat(item.AgreementDiscountRate) + parseFloat(item.DiscountAmount);
                    item.NetAmount = item.Amount - totdiscamt;
                }
                if (item.SchemeDiscountAmt > 0 && item.DiscountAmount > 0) {
                    var totdiscamt = parseFloat(item.SchemeDiscountAmt) + parseFloat(item.DiscountAmount);
                    item.NetAmount = item.Amount - totdiscamt;
                } else if ((!item.DiscountAmount && !item.AgreementDiscountRate && !item.SchemeDiscountAmt) ||
                    (item.DiscountAmount == 0 && item.AgreementDiscountRate == 0 && item.SchemeDiscountAmt == 0)) {
                    item.NetAmount = item.Amount;
                }
            } else {
                item.DiscountAmount = 0;
                item.NetAmount = item.Amount;
            }
            if (item.GSTPercentage) {
                item.UnitGSTAmount = (item.GSTPercentage / 100) * item.Rate;
            }
            if (item.UnitGSTAmount > 0) {
                item.GSTAmount = parseFloat(item.UnitGSTAmount * item.Quantity).toFixed(2);
                item.NetAmount = (parseFloat(item.Amount) + parseFloat(item.GSTAmount)) - parseFloat(item.DiscountAmount);
            }
            if (item.DoctorShareRate == 0) {
                item.IsDoctorDiscount = false;
            }
            if (item.DoctorShareValue > 0 && item.ShareTypeId == 2) {
                item.DoctorShare = item.NetAmount * item.DoctorShareValue / 100;
            } else {
                item.DoctorShareValue = (item.DoctorShareRate * 100) / (item.NetAmount / item.Quantity);
                // item.DoctorShare = item.DoctorShareRate;
                item.DoctorShare = item.NetAmount * item.DoctorShareValue / 100;
            }
            // item.RdoServiceId = true;
            if (item.NetAmount >= 0) {
                item.RdoIsPackage = true;
                $scope.CalculateDoctorShare($scope.DoctorClassId, $scope.DrShareDetailInfo, $scope.DrIncludeTax);
                $scope.CalculateNetAmt();
                $scope.applyVisibilityRules();
            } else {
                utl.Alert.showErrorMsg($translate.instant('billing.opbilling-list.discountlimit.lbl'));
            }

            if (item.ExternalPrice > item.NetAmount) {
                utl.Alert.showErrorMsg($translate.instant('Vendor Price is higher than ServicePrice'));
            }


        };

        $scope.HeaderDiscountValueChange = function () {
            if ($scope.currentfilter.DiscountModeId && $scope.currentfilter.DiscountModeId != -1) {
                if ($scope.currentfilter.DiscountModeId == 2) {
                    if ($scope.currentcontext.BillDiscount > 100) {
                        utl.Alert.showErrorMsg($translate.instant('Discount should not be greater than 100%'));
                        $scope.currentcontext.BillDiscount = 0;
                    }
                }
                for (var idx in $scope.PatientBillDetails) {
                    if ($scope.PatientBillDetails[idx].Status == 1) {
                        $scope.PatientBillDetails[idx].DiscountAmount = 0;
                        $scope.PatientBillDetails[idx].NetAmount = ($scope.PatientBillDetails[idx].Quantity *
                            $scope.PatientBillDetails[idx].Rate) + parseFloat($scope.PatientBillDetails[idx].GSTAmount);
                    }
                }
                $scope.CalculateDoctorShare($scope.DoctorClassId, $scope.DrShareDetailInfo, $scope.DrIncludeTax);
                $scope.CalculateNetAmt();
            } else {
                utl.Alert.showErrorMsg($translate.instant('billing.opbilling-list.discounttypemessage.lbl'));
            }
        };

        $scope.CalculateNetAmt = function () {

            if (isNaN($scope.currentcontext.ReceiptAmt)) {
                utl.Alert.showErrorMsg($translate.instant('Please Enter Valid Amount'));
                $scope.currentcontext.ReceiptAmt = 0;
                // return false;
            }
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
            var itemwisecancelAmt = 0;
            var itemwisenetagrmntdiscamt = 0;
            for (var i = 0, len = $scope.PatientBillDetails.length; i < len; i++) {
                if ($scope.PatientBillDetails[i].Status == 1) {
                    var itemnetAmount = 0;
                    var itemGrossAmount = 0;
                    var itemDiscountAmount = 0;
                    var itemTaxAmount = 0;
                    var itemreceivedAmt = 0;
                    var itemcancel = 0;
                    var itemagrmntdiscamt = 0;
                    itemnetAmount = isNaN(parseFloat($scope.PatientBillDetails[i].NetAmount)) ? 0 : parseFloat($scope.PatientBillDetails[i].NetAmount);
                    itemGrossAmount = isNaN(parseFloat($scope.PatientBillDetails[i].Amount)) ? 0 : parseFloat($scope.PatientBillDetails[i].Amount);
                    // itemDiscountAmount = isNaN(parseFloat($scope.PatientBillDetails[i].DiscountAmount || $scope.PatientBillDetails[i].ProportionateDiscount)) ? 0 : parseFloat($scope.PatientBillDetails[i].DiscountAmount || $scope.PatientBillDetails[i].ProportionateDiscount);
                    itemDiscountAmount = parseFloat($scope.PatientBillDetails[i].SchemeDiscountAmt) || 0;
                    if ($scope.PatientBillDetails[i].AgreementDiscountRate) {
                        // if (!itemDiscountAmount) {
                        //     itemDiscountAmount = isNaN(parseFloat($scope.PatientBillDetails[i].AgreementDiscountRate || $scope.PatientBillDetails[i].ProportionateDiscount)) ? 0 : parseFloat($scope.PatientBillDetails[i].AgreementDiscountRate || $scope.PatientBillDetails[i].ProportionateDiscount);
                        // } else if (itemDiscountAmount > 0) {
                        //     itemDiscountAmount += isNaN(parseFloat($scope.PatientBillDetails[i].AgreementDiscountRate || $scope.PatientBillDetails[i].ProportionateDiscount)) ? 0 : parseFloat($scope.PatientBillDetails[i].AgreementDiscountRate || $scope.PatientBillDetails[i].ProportionateDiscount);
                        // }
                        itemagrmntdiscamt = isNaN(parseFloat($scope.PatientBillDetails[i].AgreementDiscountAmt)) ? 0 : parseFloat($scope.PatientBillDetails[i].AgreementDiscountAmt);
                    }
                    if ($scope.PatientBillDetails[i].SchemeDiscountRate) {
                        if (!itemDiscountAmount) {
                            itemDiscountAmount = isNaN(parseFloat($scope.PatientBillDetails[i].SchemeDiscountRate || $scope.PatientBillDetails[i].ProportionateDiscount)) ? 0 : parseFloat($scope.PatientBillDetails[i].SchemeDiscountRate || $scope.PatientBillDetails[i].ProportionateDiscount);
                        } else if (itemDiscountAmount > 0) {
                            // itemDiscountAmount += isNaN(parseFloat($scope.PatientBillDetails[i].SchemeDiscountRate || $scope.PatientBillDetails[i].ProportionateDiscount)) ? 0 : parseFloat($scope.PatientBillDetails[i].SchemeDiscountRate || $scope.PatientBillDetails[i].ProportionateDiscount);
                        }
                    }
                    itemTaxAmount = isNaN(parseFloat($scope.PatientBillDetails[i].GSTAmount)) ? 0 : parseFloat($scope.PatientBillDetails[i].GSTAmount);
                    itemreceivedAmt = isNaN(parseFloat($scope.PatientBillDetails[i].ReceivedAmount)) ? 0 : parseFloat($scope.PatientBillDetails[i].ReceivedAmount);
                    if (!$scope.currentcontext.id) {
                        if ($scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 2) {
                            // itemDiscountAmount = itemDiscountAmount / 100 * itemGrossAmount;
                        }
                    }
                    if ($scope.PatientBillDetails[i].PatientBillStatusId == 2) {
                        // itemcancel = isNaN(parseFloat($scope.PatientBillDetails[i].Amount)) ? 0 : parseFloat($scope.PatientBillDetails[i].Amount);
                        itemcancel = isNaN(parseFloat($scope.PatientBillDetails[i].NetAmount)) ? 0 : parseFloat($scope.PatientBillDetails[i].NetAmount);
                    }
                    // if ($scope.currentfilter.GuarantorTypeId == 6) { // Free type
                    //     if ($scope.PatientBillDetails[i].Amount) { // FreeNetAmount
                    //         $scope.PatientBillDetails[i].FreeNetAmount = $scope.PatientBillDetails[i].Amount;
                    //     }
                    //     $scope.PatientBillDetails[i].NetAmount = 0;
                    //     $scope.PatientBillDetails[i].DoctorShare = 0;
                    //     $scope.PatientBillDetails[i].GSTAmount = 0;
                    //     itemGrossAmount = 0;
                    //     itemnetAmount = 0;
                    //     itemDiscountAmount = 0;
                    //     itemTaxAmount = 0;
                    // }

                    itemwiseGrossAmt += itemGrossAmount;
                    itemwiseNetAmt += itemnetAmount;
                    itemwiseDiscountAmt += itemDiscountAmount;
                    itemwiseTaxAmt += itemTaxAmount;
                    itemwisereceivedamt += itemreceivedAmt;
                    itemwisecancelAmt += itemcancel;
                    itemwisenetagrmntdiscamt += itemagrmntdiscamt;
                }
            }
            $scope.currentcontext.PaidAmt = (!$scope.currentcontext.PaidAmt) ? 0 : $scope.currentcontext.PaidAmt;
            $scope.item.TotDiscAmount = 0;
            $scope.item.GrossAmount = 0;
            $scope.item.TaxAmt = 0;
            $scope.currentcontext.TotNetAmount = 0;
            $scope.currentcontext.TotBalanceAmt = 0;
            $scope.currentcontext.CancelledAmount = itemwisecancelAmt;
            $scope.item.GrossAmount = (itemwiseGrossAmt);
            $scope.item.TaxAmt = itemwiseTaxAmt;
            $scope.item.GSTAmount = itemwiseTaxAmt;
            $scope.item.AgreementDiscountAmt = itemwisenetagrmntdiscamt;
            $scope.currentcontext.ReceivedAmt = itemwisereceivedamt;

            $scope.currentcontext.ReceiptAmt = (!$scope.currentcontext.ReceiptAmt) ? 0 : $scope.currentcontext.ReceiptAmt;

            if ($scope.currentcontext.BillDiscount > 0) {
                if ($scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 2) {
                    $scope.item.TotDiscAmount = $scope.currentcontext.BillDiscount / 100 * $scope.item.GrossAmount;
                } else if ($scope.currentfilter.DiscountModeId == 1) {
                    $scope.item.TotDiscAmount = $scope.currentcontext.BillDiscount;
                }
            } else if (itemwiseDiscountAmt > 0) {
                if ($scope.currentcontext.id > 0 && itemwisenetagrmntdiscamt > 0) {
                    $scope.item.TotDiscAmount = itemwisenetagrmntdiscamt;
                } else {
                    $scope.item.TotDiscAmount = itemwiseDiscountAmt;
                }
            }

            $scope.currentcontext.TotNetAmount = parseFloat($scope.item.GrossAmount) + parseFloat($scope.item.RoundOffValue) + parseFloat($scope.item.TaxAmt || 0) - parseFloat($scope.item.AgreementDiscountAmt || 0) - parseFloat($scope.item.TotDiscAmount) - parseFloat($scope.currentcontext.RefundAmount || 0);
            $scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.TotNetAmount) + parseFloat($scope.currentcontext.RefundAmount) - parseFloat($scope.currentcontext.ReceiptAmt || 0) - parseFloat($scope.currentcontext.PaidAmt || 0);
            //$scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.TotBalanceAmt) - parseFloat($scope.currentcontext.RefundAmount);
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

            // var billBalance = parseFloat($scope.currentcontext.TotNetAmount) - parseFloat($scope.currentcontext.ReceiptAmt || 0) - parseFloat($scope.currentcontext.PaidAmt);
            var billBalance = parseFloat($scope.currentcontext.TotNetAmount) + parseFloat($scope.currentcontext.RefundAmount) - parseFloat($scope.currentcontext.ReceiptAmt || 0) - parseFloat($scope.currentcontext.PaidAmt);
            // if (parseFloat($scope.currentcontext.PaidAmt) > 0) {
            //     var billBalance = (parseFloat($scope.currentcontext.TotNetAmount) + parseFloat($scope.item.TotDiscAmount) - parseFloat($scope.currentcontext.CNAmount || 0)) - (parseFloat($scope.currentcontext.PaidAmt) - parseFloat($scope.currentcontext.RefundAmount));
            // }
            if ($scope.item.IsMultiplePayment) {
                if ($scope.currentcontext.PaidAmt > 0) {
                    if (parseFloat(($scope.currentcontext.ReceiptAmt)) > (parseFloat($scope.currentcontext.TotNetAmount) - parseFloat($scope.currentcontext.PaidAmt))) {
                        $scope.currentcontext.ReceiptAmt = 0;
                        $scope.currentcontext.TotBalanceAmt = billBalance;
                        utl.Alert.showErrorMsg($translate.instant('billing.pharmacy-return.receivingamt.lbl'));
                    }
                } else {
                    if (parseFloat(($scope.currentcontext.ReceiptAmt)) > math.round($scope.currentcontext.TotNetAmount)) {
                        $scope.currentcontext.ReceiptAmt = 0;
                        $scope.currentcontext.TotBalanceAmt = billBalance;
                        utl.Alert.showErrorMsg($translate.instant('billing.pharmacy-return.receivingamt.lbl'));
                    }
                }
            } else {
                if (parseFloat(($scope.currentcontext.ReceiptAmt)) > math.round($scope.currentcontext.TotNetAmount)) {
                    $scope.currentcontext.ReceiptAmt = 0;
                    $scope.currentcontext.TotBalanceAmt = billBalance;
                    utl.Alert.showErrorMsg($translate.instant('billing.pharmacy-return.receivingamt.lbl'));
                }
            }

            if ($scope.currentcontext.TotBalanceAmt < 0) {
                utl.Alert.showErrorMsg($translate.instant('Entered Wrong Receipt Amount'));
                $scope.currentcontext.ReceiptAmt = 0;
                $scope.item.Received = $scope.currentcontext.PaidAmt;
                $scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.TotNetAmount) + parseFloat($scope.currentcontext.RefundAmount) - parseFloat($scope.currentcontext.ReceiptAmt || 0) - parseFloat($scope.currentcontext.PaidAmt || 0);
                return false;
            }

            if (parseFloat(($scope.item.TotDiscAmount)) > parseFloat(($scope.item.GrossAmount).toFixed(2)) /* || $scope.currentcontext.TotBalanceAmt < 0*/) {
                $scope.currentcontext.dBillDiscount = 0;
                $scope.currentcontext.ReceiptAmt = 0;
                $scope.currentcontext.TotBalanceAmt = 0;
                utl.Alert.showErrorMsg($translate.instant('billing.pharmacy-return.receivingamt.lbl'));
                $scope.currentcontext.BillDiscount = 0;
                $scope.currentcontext.TotNetAmount = parseFloat(parseFloat($scope.item.GrossAmount) + parseFloat($scope.item.TaxAmt || 0)).toFixed(2);
            }

            if (vm.DueApprover) {
                $scope.DueLimit = vm.DueApprover.PrivateDueLimit;
                $scope.LimitDue = parseFloat($scope.currentcontext.TotBalanceAmt);
            }
            if ($scope.currentcontext.TotBalanceAmt > 0) {
                $scope.DueAlert = '';
                $scope.IsDueApproved = true;
                if ($scope.item.PrivateDueId > 0) {
                    if ($scope.DueLimit !== null && $scope.currentcontext.TotBalanceAmt > $scope.DueLimit) {
                        $scope.DueAlert = 'Maximum Due of ' + vm.DueApprover.PrivateDueLimit + ' Only Can be Given For the Selected Credit Approver';
                        utl.Alert.showErrorMsg($scope.DueAlert);
                        $scope.IsDueApproved = false;
                    }
                }
                // else {
                //     $scope.DueAlert = 'Please Select Credit Approver';
                //     utl.Alert.showErrorMsg($scope.DueAlert);
                //     $scope.IsDiscountApproved = false;
                // }
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
            // $scope.item.Received = $scope.currentcontext.ReceiptAmt !== 0 ?
            //     $scope.currentcontext.ReceiptAmt : $scope.currentcontext.PaidAmt !== 0 ? $scope.currentcontext.PaidAmt : 0;
            if ($scope.currentcontext.id !== 0 && $scope.item.PatientBillStatusId !== 1) {
                // $scope.item.Received = parseFloat($scope.currentcontext.PaidAmt) + parseFloat($scope.currentcontext.ReceiptAmt);
                $scope.item.Received = parseFloat($scope.currentcontext.PaidAmt);
            }
            // $scope.updateReceiptAmt()
            $scope.setupPaymentDetails();
        };

        $scope.updateReceiptAmt = function () {
            if ($scope.currentcontext.TotNetAmount == ($scope.currentcontext.TotBalanceAmt + $scope.item.RoundOffValue)) {
                if ($scope.currentcontext.TotNetAmount !== 0.00) {
                    if ($scope.currentcontext.id === 0 || $scope.item.PatientBillStatusId === 1) {
                        if (!$scope.item.Received) {
                            $scope.item.Received = 0;
                        }
                        $scope.currentcontext.ReceiptAmt = parseFloat($scope.item.Received) + parseFloat($scope.currentcontext.TotNetAmount);
                    } else {
                        $scope.currentcontext.ReceiptAmt = parseFloat($scope.currentcontext.ReceiptAmt) + parseFloat($scope.currentcontext.TotNetAmount);
                    }

                    $scope.currentcontext.ReceiptAmt = parseFloat($scope.currentcontext.ReceiptAmt).toFixed(2);
                    $scope.currentcontext.ReceiptAmt = parseFloat($scope.currentcontext.ReceiptAmt);
                }
                $scope.currentcontext.TotBalanceAmt = 0.00;
            } else {
                if (($scope.currentcontext.TotBalanceAmt + $scope.item.RoundOffValue) !== 0.00) {
                    if ($scope.currentcontext.id === 0 || $scope.item.PatientBillStatusId === 1) {
                        if (!$scope.item.Received) {
                            $scope.item.Received = 0;
                        }
                        $scope.currentcontext.ReceiptAmt = parseFloat($scope.item.Received) + parseFloat(($scope.currentcontext.TotBalanceAmt + $scope.item.RoundOffValue));
                    } else {
                        $scope.currentcontext.ReceiptAmt = parseFloat($scope.currentcontext.ReceiptAmt) + parseFloat(($scope.currentcontext.TotBalanceAmt + $scope.item.RoundOffValue));
                    }
                    $scope.currentcontext.ReceiptAmt = parseFloat($scope.currentcontext.ReceiptAmt).toFixed(2);
                    $scope.currentcontext.ReceiptAmt = parseFloat($scope.currentcontext.ReceiptAmt);
                }
                $scope.currentcontext.TotBalanceAmt = 0.00;
            }
            if ($scope.currentcontext.ReceiptAmt < 0) {
                $scope.currentcontext.ReceiptAmt = 0;
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

        $scope.getPendingData = function (pendingData) {
            $scope.Detailids = [];
            pendingData.list.forEach((item, idx) => {
                var v = {};
                v = item.Id;
                $scope.Detailids.push(v);
                $scope.pendingorder();
            });
        };

        $scope.getPendingDataList = function (scope, data, options, hasError) {
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

        $scope.pendingorder = function () {
            var options = {
                action: 'billing/PatientBills/GetMultiPendingOrders',
                data: {
                    Id: $scope.Detailids
                },
                type: 'post',
                onComplete: $scope.getPendingDataList
            };
            utl.Http.doAction(options);
        };

        $scope.pendingOrder = function () {
            utl.Modal.open('app.pendingorder', {
                params: {
                    id: $scope.currentfilter.PatientId
                },
                confirmCallback: $scope.getPendingData
            });
        };

        $scope.pendingProcedures = function () {
            utl.Modal.openFixedDialog('app.pending-procedures', {
                params: {
                    id: $scope.currentfilter.PatientId
                },
                confirmCallback: $scope.getPendingProceduresData
            });
        };

        $scope.getPendingProceduresData = function (pendingData) {
            $scope.Detailids = [];
            pendingData.list.forEach((item, idx) => {
                var v = {};
                v = item.Id;
                $scope.Detailids.push(v);
                $scope.pendingprocedures();
            });
        };

        $scope.pendingprocedures = function (pendingData) {
            var options = {
                action: 'billing/PatientBills/GetPendingProcedureOrders',
                data: {
                    Id: $scope.Detailids
                },
                type: 'post',
                onComplete: $scope.getPendingProcedureData
            };

            utl.Http.doAction(options);
        };

        $scope.getPendingProcedureData = function (scope, data, options, hasError) {
            $scope.item.ProceduresCount = 0;
            if (data.length > 0) {
                $scope.item.ProceduresCount = data.length;
            }
            $scope.PatientBillDetails = [];
            data.forEach((item, idx) => {
                var v = {};
                v.ServiceId = item.Id;
                v.Status = item.Status;
                v.Quantity = 1;
                v.LoadFrom = 'ProcedureOrder';
                v.SelectedItem = item;
                $scope.PatientBillDetails.push(v);
            });
            for (var idx in $scope.PatientBillDetails) {
                var item = $scope.PatientBillDetails[idx];
                $scope.ServiceItemChanged(idx, item);
            }
        };
        //Guarantor List
        vm.guarantorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                {
                    header: 'Guarantor Code',
                    field: 'Code',
                    datatype: 'string',
                    headercls: 'td-type',
                    fieldcls: 'td-type'
                }, {
                    header: 'Guarantor Name',
                    field: 'GuarantorName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },

            ],
            searchparams: {},
            result: {},
            api: 'generalmaster/Guarantor/GetGuarantors',
            formatdisplay: formatselectedguarantor,
            presearch: presearchguarantor,
            postsearch: postsearchguarantor
        };

        function formatselectedguarantor() {
            var selectedItem = vm.guarantorcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.item.GuarantorId = selectedItem.Id;
                $scope.item.GuarantorName = selectedItem.GuarantorName;
                result = [selectedItem.GuarantorName].join(' ');
            } else if (vm.guarantorcontrolconfig.rowdata) {
                result = [vm.guarantorcontrolconfig.rowdata.GuarantorName].join(' ');
            }
            return result;
        }

        function presearchguarantor() {
            var query = vm.guarantorcontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 7,
                    Value: [-1, utl.Session.getCurrentFacilityId()]
                }],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };


            if (vm.guarantorcontrolconfig.searchbyid === true) {
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

            vm.guarantorcontrolconfig.searchparams = inputData;
        }

        function postsearchguarantor() {
            for (var idx in vm.guarantorcontrolconfig.result) {
                var item = vm.guarantorcontrolconfig.result[idx];
                item.GuarantorName = item.GuarantorName;
                item.GuarantorCode = item.GuarantorCode;
                $scope.currentcontext.GuarantorTypeId = item.GuarantorTypeId;
                $scope.item.TpaId = item.TPAId;
                $scope.currentfilter.ServiceRateCategoryId = item.ServiceRateCategoryId;
                // if (item.RemarkType) {
                //     item.RemarkType = item.RemarkType.Description;
                // }
            }
        }

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
                    id: $scope.currentfilter.PatientId,
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
                    id: $scope.currentfilter.PatientId,
                    billtype: vm.Context == 'OP' ? 1 : 5,
                    pid: $scope.currentfilter.PatientId
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


        $scope.loadtpaCallback = function (scope, data, options, hasError) {
            var match = data.TPA.find(function (tpa) {
                return tpa.Id === $scope.item.TpaId;
            });

            if (match) {
                $scope.currentcontext.tpa = match.Text;
            }
        };

        $scope.loadtpa = function () {
            //Get only active guarantors - 2
            if ($scope.item.PatientId && $scope.item.PatientId > 0) {
                var inputData = [{
                    Key: "TPA"
                    // Request: {
                    //     Params: [{
                    //         Key: 0,
                    //         Value: $scope.item.TpaId
                    //     }]
                    // }
                }];

                var options = {
                    action: 'General/Options/getoptions',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.loadtpaCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.originalprint = function () {
            var inputData = {
                Id: $scope.currentcontext.id,
                Data: {
                    Reason: $scope.currentcontext.printreason,
                    isprint: false,
                    withHeader: $scope.item.WithHeader,
                    withoutHeader: $scope.item.WithoutHeader,
                    tpa: $scope.currentcontext.tpa
                }
            };
            // var actionName = 'billing/patientbills/PrintPatientBills';
            var actionName = 'billing/patientbills/PrintOPPatientBills';
            if (window.printcode.toLowerCase() == 'bewell') {
                var actionName = 'billing/patientbills/PrintPatientBills1';
            }
            var options = {
                action: actionName,
                data: inputData,
                type: 'post'
            };
            utl.Http.doPrint(options);
        };

        $scope.print = function (isdup) {
            var inputData = {
                Id: $scope.currentcontext.id,
                Data: {
                    IsDuplicate: isdup,
                    isprint: false,
                    withHeader: $scope.item.WithHeader,
                    withoutHeader: $scope.item.WithoutHeader,
                    CancelledAmount: $scope.currentcontext.CancelledAmount || 0,
                    tpa: $scope.currentcontext.tpa
                }
            };
            // var actionName = 'billing/patientbills/PrintPatientBills';
            var actionName = 'billing/patientbills/PrintOPPatientBills';
            if (window.printcode.toLowerCase() == 'bewell') {
                var actionName = 'billing/patientbills/PrintPatientBills1';
            }
            var options = {
                action: actionName,
                data: inputData,
                type: 'post'
            };
            utl.Http.doPrint(options);
        };

        $scope.thermalprint = function (isdup) {
            var inputData = {
                Id: $scope.currentcontext.id,
                Data: {
                    IsDuplicate: isdup
                }
            };
            var actionName = 'billing/patientbills/ThermalPrintPatientBills';
            var options = {
                action: actionName,
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
            // item.DoctorShare = 0;
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

        $scope.EditPackageLineItem = function (item) {
            if (item.PackageDetails && item.PackageDetails.length > 0) {
                // for (var idx in data.items) {
                //     var item = data.items[idx];
                //     var idx = $scope.PatientBillDetails.indexOf(item);
                //     $scope.PatientBillDetails[idx].DiscountAmount = item.DiscountAmount;
                //     $scope.PatientBillDetails[idx].NetAmount = 0;
                //     $scope.PatientBillDetails[idx].IsPackageItem = 1;
                //     $scope.PatientBillDetails[idx].DoctorShare = item.DoctorShare;
                //     $scope.PatientBillDetails[idx].DoctorId = item.DoctorId;
                //     $scope.PatientBillDetails[idx].DoctorName = item.DoctorName;
                // }
                $scope.PatientBillDetails[idx].PackageDetails = item.PackageDetails;
            }
        };


        $scope.EditDocShareLineItem = function (item) {
            if (item.DocShareDetails && item.DocShareDetails.length > 0) {
                $scope.PatientBillDetails.DocShareDetails = [];
                for (var idx in item.DocShareDetails) {
                    var items = item.DocShareDetails[idx];
                    $scope.PatientBillDetails.DocShareDetails.push(items);
                }
            }
        };

        $scope.editDocShareInfo = function (idx, item) {
            var IsEditable = false;
            if ($scope.currentcontext.PatientBillStatusId == 1) {
                IsEditable = true;
            }
            if ($scope.currentcontext.id == 0) {
                utl.Modal.open('app.drshareSelection', {
                    params: {
                        itemid: idx,
                        item: item,
                        patient: $scope.selectedPatient,
                        IsEditable,
                        patType: $scope.item.EncounterTypeId,
                        encId: $scope.item.EncounterId,
                        ratetype: $scope.currentfilter.ServiceRateCategoryId,
                        filterData: $scope.currentfilter
                    },
                    confirmCallback: $scope.EditDocShareLineItem
                    // cancelCallback: $scope.initLookup
                });
            } else if ($scope.currentcontext.id > 0) {
                utl.Modal.open('app.editdrShareInfo', {
                    params: {
                        id: $scope.currentcontext.id,
                        serviceid: item.ServiceId,
                    },
                    confirmCallback: $scope.getItem
                });
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
                        IsEditable,
                        ratetype: $scope.currentfilter.ServiceRateCategoryId
                    },
                    confirmCallback: $scope.EditPackageLineItem
                });
            } else {
                utl.Modal.open('app.obillingmore', {
                    params: {
                        itemid: idx,
                        item: item,
                        patient: $scope.selectedPatient,
                        IsEditable,
                        ratetype: $scope.currentfilter.ServiceRateCategoryId
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
                $scope.onDoctorSelected()
                $scope.PatientBillInfo.forEach(patientbills => {
                    $scope.item.PatientId = patientbills.PatientId;
                    $scope.item.PatientBillStatusId = patientbills.PatientBillStatusId;
                    $scope.item.BillGeneratedBy = patientbills.BillGeneratedBy;
                    $scope.item.BillAmount = patientbills.BillAmount;
                    $scope.item.PaidAmount = patientbills.PaidAmount;
                    $scope.item.CancelReqRaisedStatusId = patientbills.CancelReqRaisedStatusId;
                    $scope.item.Comments = patientbills.Comments;
                    if ($scope.item.PatientBillStatusId == 3) {
                        $scope.loadPatientGuarantors();
                    }
                    $scope.currentfilter.PatientId = patientbills.PatientId;
                    $scope.patientChange();
                    if (patientbills.OutStandingAmount > 0) {
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
                    $scope.item.RoundOffValue = patientbills.RoundOffValue;
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
                    if ($scope.item.IsMultiplePayment && patientbills.OutStandingAmount > 0) {
                        $scope.HidePrintBtn = true;
                    }
                    if ($scope.currentfilter.DiscountModeId == 2) {
                        $scope.currentcontext.BillDiscount = patientbills.DiscountPercentage;
                    }

                    $scope.PatientBillDetails = [];
                    // $scope.PatientBillDetails = patientbills.PatientBillDetails;
                    for (var odx in patientbills.PatientBillDetails) {
                        var billItem = patientbills.PatientBillDetails[odx];
                        if ($scope.currentfilter.DiscountModeId == 2) {
                            // billItem.DiscountAmount = billItem.DiscountPercentage;//29/6/2024
                        }
                        if (billItem.GSTAmount) {
                            billItem.GSTAmount = parseFloat(billItem.GSTAmount).toFixed(2);
                        }
                        if (billItem.ServiceItem) {
                            if (billItem.ServiceItem.IsOrderable == true || billItem.ServiceItem.IsPackage == true) {
                                if (!billItem.LoadFrom) {
                                    $scope.item.LoadFrom = 'orderbills';
                                }
                            }
                        }
                        $scope.PatientBillDetails.push(billItem);
                    }


                    $scope.RefundInfoDetails = [];
                    for (var pdx in patientbills.PatientRefunds) {
                        var payData = patientbills.PatientRefunds[pdx];
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
                            //TransDetails += '/' + payData.Terminal.Description;
                            TransDetails += '/' + payData.AuthorizedCode;
                        }
                        if (payData.PaymentTypeId == 6) {
                            TransDetails = payData.PaymentType.Description;
                            TransDetails += '/' + payData.Bank.Description;
                            TransDetails += '/' + payData.CardType.Description;
                            //TransDetails += '/' + payData.Terminal.Description;
                            TransDetails += '/' + payData.AuthorizedCode;
                        }
                        if (payData.PaymentTypeId == 11) { //UPI
                            TransDetails = payData.PaymentType.Description;
                            if (payData.Bank) {
                                TransDetails += '/' + payData.Bank.Description;
                            }
                            //TransDetails += '/' + payData.CardType.Description;
                            //TransDetails += '/' + payData.Terminal.Description;
                            TransDetails += '/' + payData.UPIRefNumber;
                        }
                        if (payData.PaymentTypeId == 12) { //APlan
                            TransDetails = payData.PaymentType.Description;
                            TransDetails += '/' + payData.Bank.Description;
                            //TransDetails += '/' + payData.CardType.Description;
                            //TransDetails += '/' + payData.Terminal.Description;
                            TransDetails += '/' + payData.UPIRefNumber;
                        }
                        var payDetaildata = {
                            PaymentInfo: TransDetails,
                            ReceiptType: 'Refund',
                            ReceiptNumber: payData.RefundIdentifier,
                            ReceiptDateTime: payData.RefundDateTime,
                            AmountPaid: payData.RefundAmount,
                        };
                        $scope.RefundInfoDetails.push(payDetaildata);
                    }
                    if (patientbills.PatientBillStatusId == 1) {
                        $scope.CanDelete = true;
                    } else {
                        $scope.CanDelete = false;
                    }
                    if ($scope.PatientBillDetails.length > 1) {
                        $scope.ShowPartialCancel = true;
                    } else {
                        $scope.ShowPartialCancel = false;
                    }
                    $scope.currentcontext.PatientBillStatusId = patientbills.PatientBillStatusId;
                    $scope.currentcontext.PatientStatusId = patientbills.PatientBillStatusId;
                    $scope.item.PatientTypeId = patientbills.PatientTypeId;
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
                    $scope.applyVisibilityRules();

                    $scope.PatientPaymentDetails = [];

                    $scope.CalculateNetAmt();
                    $scope.currentcontext.PendingAmt = patientbills.OutStandingAmount;
                    $scope.item.BillDateTime = patientbills.BillDateTime;
                    if (patientbills.PatientBillStatusId == 1)
                        $scope.isSaving = false;
                    $scope.loadtpa();

                });

                $scope.EnableDisableDropdown($scope.isSaving);
                $scope.RdoPatientId = true;
                $scope.RdoBillnumber = true;
                $scope.canShowFinanceBtn = true;

                if ($scope.item.EncounterId)
                    $scope.getBilledEncounter($scope.item.EncounterId);
                else
                    $scope.fnencounter();

                // if ($scope.chkfindBill == 0 && $scope.item.BillNumber) {
                //     if ($scope.item.IsMultiplePayment == true && $scope.currentcontext.PendingAmt == 0) {
                //         $scope.print(false);
                //     } else if ($scope.item.IsMultiplePayment == false) {
                //         $scope.print(false);
                //     }
                // }
                if ($scope.item.PatientBillStatusId == 1) {
                    $scope.addNewLineItem();
                    $scope.ServiceItemMapping();
                }
                $scope.OrderInfo($scope.currentcontext.id);
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

        $scope.getOrderInfoCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                $scope.OrderInfo = data.Data[0];
            }
        }

        $scope.OrderInfo = function (billId) {
            if (billId && billId > 0) {
                var inputData = {
                    Params: [{
                        Key: 42,
                        Value: billId
                    },],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };
                var options = {
                    action: 'emr/patientorder/GetPatientOrders',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getOrderInfoCallback
                };
                utl.Http.doAction(options);
            }
        }

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
                    if (payData.Bank) {
                        TransDetails += '/' + payData.Bank.Description;
                    }
                    TransDetails += '/' + payData.ChequeNo;
                    var ChequeDate = $filter('date')(payData.ChequeDate, 'yyyy-MM-dd');
                    TransDetails += '/' + ChequeDate;
                }
                if (payData.PaymentTypeId == 3) {
                    TransDetails = payData.PaymentType.Description;
                    if (payData.Bank) {
                        TransDetails += '/' + payData.Bank.Description;
                    }
                    TransDetails += '/' + payData.DDNumber;
                    var DDDate = $filter('date')(payData.DDDate, 'yyyy-MM-dd');
                    TransDetails += '/' + DDDate;
                }
                if (payData.PaymentTypeId == 4) {
                    TransDetails = payData.PaymentType.Description;
                    if (payData.Bank) {
                        TransDetails += '/' + payData.Bank.Description;
                    }
                    TransDetails += '/' + payData.WireTransferId;
                    var WireTransferDate = $filter('date')(payData.WireTransferDate, 'yyyy-MM-dd');
                    TransDetails += '/' + WireTransferDate;
                }
                if (payData.PaymentTypeId == 5) {
                    TransDetails = payData.PaymentType.Description;
                    if (payData.Bank) {
                        TransDetails += '/' + payData.Bank.Description;
                    }
                    if (payData.CardType) {
                        TransDetails += '/' + payData.CardType.Description;
                    }
                    //TransDetails += '/' + payData.Terminal.Description;
                    TransDetails += '/' + payData.AuthorizedCode;
                }
                if (payData.PaymentTypeId == 6) {
                    TransDetails = payData.PaymentType.Description;
                    if (payData.Bank) {
                        TransDetails += '/' + payData.Bank.Description;
                    }
                    if (payData.CardType) {
                        TransDetails += '/' + payData.CardType.Description;
                    }
                    //TransDetails += '/' + payData.Terminal.Description;
                    TransDetails += '/' + payData.AuthorizedCode;
                }
                if (payData.PaymentTypeId == 11) {
                    TransDetails = payData.PaymentType.Description;
                    if (payData.Bank) {
                        TransDetails += '/' + payData.Bank.Description;
                    }
                    //TransDetails += '/' + payData.CardType.Description;
                    //TransDetails += '/' + payData.Terminal.Description;
                    TransDetails += '/' + payData.UPIRefNumber;
                }
                if (payData.PaymentTypeId == 12) {
                    TransDetails = payData.PaymentType.Description;
                    if (payData.Bank) {
                        TransDetails += '/' + payData.Bank.Description;
                    }
                    //TransDetails += '/' + payData.CardType.Description;
                    //TransDetails += '/' + payData.Terminal.Description;
                    TransDetails += '/' + payData.UPIRefNumber;
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
                $scope.item.TerminalNoId = PaymentDatas.TerminalNoId;
                if (PaymentDatas.Terminal) {
                    $scope.item.Terminal = PaymentDatas.Terminal.Description;
                }
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
            // for (var idx in $scope.lookup.Guarantor) {
            //     var item = $scope.lookup.Guarantor[idx];
            //     if (item.Id == guarantorid) {
            //         $scope.currentfilter.GuarantorTypeId = item.GuarantorTypeId;
            //         $scope.currentfilter.ServiceRateCategoryId = item.ServiceRateCategoryId;
            //         $scope.currentfilter.GuarantorName = item.Text;
            //         if (item.GuarantorTypeId != 1) {
            //             $scope.item.GuarantorDueId = guarantorid;
            //             break;
            //         }
            //         else $scope.item.GuarantorDueId = 0;
            //     }
            // }
            // if ($scope.currentfilter.GuarantorTypeId != 1) {
            //     $scope.item.GuarantorDueId = guarantorid;
            // } else $scope.item.GuarantorDueId = 0;
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
                $scope.item.EncounterTypeId = $scope.encounter.EncounterTypeId;
                $scope.item.VisitNumber = $scope.encounter.VisitIdentifier;
                // if (!$scope.currentfilter.GuarantorTypeId) {
                $scope.currentfilter.GuarantorTypeId = $scope.encounter.GuarantorTypeId || 0;
                // }
                // if (!$scope.currentfilter.GuarantorId) {
                $scope.currentfilter.GuarantorId = $scope.encounter.GuarantorId || 0;
                // }
                $scope.currentfilter.ReferralId = $scope.encounter.ReferralId || 0;
                $scope.currentfilter.ServiceRateCategoryId = $scope.encounter.ServiceRateCategoryId || 0;
                $scope.currentfilter.ReferralName = $scope.encounter.ReferralName || null;
                // if (!$scope.item.DoctorId) {
                $scope.item.DoctorId = $scope.encounter.DoctorId;
                if ($scope.encounter.Doctor)
                    $scope.item.DoctorName = $scope.encounter.Doctor.Title.Description + '  ' +
                        $scope.encounter.Doctor.FirstName + ' ' +
                        ($scope.encounter.Doctor.LastName != null ? $scope.encounter.Doctor.LastName : '');
                // }
                $scope.item.DepartmentId = $scope.encounter.DepartmentId;
                $scope.item.IsEncounter = true;
                // $scope.item.TotalAvailableAmount = $scope.encounter.PaidAmount - $scope.encounter.AmountAdjusted;
            } else if (vm.Context == 'OP') {
                if (!$scope.item.BillNumber) {
                    utl.Alert.showErrorMsg('No Visit Created For The Selected Patient');
                }
            }
            // $scope.guarantorType($scope.currentfilter.GuarantorId);
            $scope.item.GuarantorDueId = $scope.currentfilter.GuarantorId;
            // $scope.GuarantorTypeChange({
            //     Id: $scope.currentfilter.GuarantorTypeId
            // })
            // $scope.doctorChange();
            $scope.addNewLineItem();
            $scope.getAvailableAmount();
        };

        $scope.getAvailableAmount = function () {
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.item.PatientId
                },
                {
                    Key: 4,
                    Value: 5
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
            $scope.item.TotalAvailableAmount = 0;
            for (var idx in $scope.advanceDetails) {
                var item = $scope.advanceDetails[idx];
                TotalAvailableAmt = TotalAvailableAmt + item.AmountAvailable;
            }
            $scope.item.TotalAvailableAmount = TotalAvailableAmt;

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
                },
                {
                    Key: 52, //Is Latest
                    Value: 1

                },
                    // {
                    //     Key: 40,
                    //     Value: 1
                    // },
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
            console.log(vm.Context);
            $scope.item.IsFromIPBill = 0;
            $scope.securitypisvalid = false;
            $scope.IpBillList = 0;
            $scope.IPIsBillLock = false;
            if ($scope.currentcontext.id <= 0)
                $scope.currentcontext.id = data;
            // $scope.currentcontext.PaymentTypeId = 1;
            $scope.getBillInfoByBillId();
            $scope.PatPaymentDetails(data);
            // $scope.applyVisibilityRules();
            if (($scope.currentcontext.id > 0 && $scope.item.PatientBillStatusId == 3) && !$scope.item.IsMultiplePayment) {
                if ($scope.item.GuarantorTypeId == 1) {
                    $scope.print();
                } else if ($scope.item.GuarantorTypeId != 1) {
                    $scope.print();
                }
            }
            if (($scope.currentcontext.id > 0 && $scope.item.PatientBillStatusId == 3) &&
                $scope.item.IsMultiplePayment && $scope.currentcontext.TotBalanceAmt == 0) {
                $scope.print();
            }
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        };

        $scope.completeBill = function (action) {
            var msg = 'billing.billing-details.draft.lbl';
            if ($scope.item.TotDiscAmount > 0 && !$scope.IsDiscountApproved) {
                utl.Alert.showErrorMsg($scope.DiscountAlert);
                return false;
            }
            if ($scope.currentcontext.TotBalanceAmt > 0 && !$scope.IsDueApproved) {
                utl.Alert.showErrorMsg($scope.DueAlert);
                return false;
            }
            if (action == $scope.saveAndApprove) {
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
            } else {
                if ($scope.ipnotallowop == 1) {
                    if ($scope.IpBillList == 1) {
                        utl.Alert.showErrorMsg('Cannot generate OP bill for an IP patient.');
                        return;
                    }
                }
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
            // if ($scope.currentfilter.GuarantorTypeId == 4) {
            //     if ((!$scope.item.StaffName || $scope.item.StaffName == '') && (!$scope.item.EmployeeId || $scope.item.EmployeeId == '')) {
            //         utl.Alert.showErrorMsg('Please Enter Staff Info...');
            //         return;
            //     }
            // }
            /* Security IsValid */
            $scope.requiredsecuritypin =
                utl.FacilitySetting.getFacilitySettingValue('billing', 'requiredsecuritypin');

            if ($scope.requiredsecuritypin && !$scope.securitypisvalid)
                if (!$scope.securitypincheck())
                    return false;

            /* Security IsValid */
            $scope.IsApproved = true;
            if ($scope.ipnotallowop == 1) {
                if ($scope.IpBillList == 1) {
                    utl.Alert.showErrorMsg('Cannot generate OP bill for an IP patient.');
                    return;
                }
            }
            $scope.saveItem(3);
        };

        $scope.onCancelConfirmed = function (reason) {
            $scope.item.CancelledOn = utl.Formatter.getCurrentDate();
            $scope.item.CancelledBy = utl.Session.getCurrentUserId();
            $scope.item.CancelReason = reason;
            $scope.getBillInfoByBillId();
        };
        $scope.onDueBillCancelConfirmedCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        };
        $scope.onDueBillCancelConfirmed = function () {

            $scope.items.CancelledOn = utl.Formatter.getCurrentDate();
            $scope.items.CancelledBy = utl.Session.getCurrentUserId();
            $scope.items.PatientBillStatusId = 2;
            $scope.items.Id = $scope.currentcontext.id;
            var lines = getLinesForSaveCancel();
            var actionName = 'Billing/PatientBills/AddPatientBills';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'Billing/PatientBills/UpdatePatientBillsFromCancel';
            }
            var inputData = {
                Header: $scope.items,
                Details: lines,
            };
            var options = {
                action: actionName,
                data: {
                    Data: inputData
                },
                type: 'post',
                onComplete: $scope.onDueBillCancelConfirmedCallback
            };
            utl.Http.doAction(options);
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
            if ($scope.IsDue == true) {
                // if ($scope.opduebillcancel == 1) {
                //     utl.Alert.showErrorMsg('Due Bill Cannot be Cancelled...');
                // }
                // $("#remarks").css("required", "true");
                if ($scope.item.IsMultiplePayment && ($scope.item.OutStandingAmount > 0 || $scope.currentcontext.TotBalanceAmt > 0)) {
                    utl.Alert.showErrorMsg('Cancel Request Rejected... Pay the full amount');
                    return false;
                }
                $scope.required = true;
                var confirmOptions = {
                    headingKey: 'common.confirm-modal-header.lbl',
                    messageKey: 'Do you want to cancel the Due bill',
                    yesKey: 'common.yeskey.lbl',
                    noKey: 'common.nokey.lbl',
                    onSuccessMethod: $scope.onDueBillCancelConfirmed,
                };
                utl.Dialog.confirmMessage(confirmOptions);
            } else {
                if (vm.Context == 'OP' && $scope.dgbillnosaveoption == 1) {
                    utl.Alert.showErrorMsg('DG Bill Cancel Option not possible In OP Billing Screen.');
                    return false;
                }
                // if ($scope.item.TotalDueAmount == 0) {
                if ($scope.isPartiallyOrderCancelled()) {
                    utl.Alert.showErrorMsg('Cannot Cancel the full bill, Partially Order Status Changed...');
                } else if ($scope.item.CancelReqRaisedStatusId == 2) {
                    var confirmOptions = {
                        headingKey: 'common.confirm-modal-header.lbl',
                        messageKey: 'billing.opbilling-list.cancelmsg.lbl',
                        yesKey: 'common.yeskey.lbl',
                        noKey: 'common.nokey.lbl',
                        onSuccessMethod: $scope.CancelReceipt,
                    };
                    utl.Dialog.confirmMessage(confirmOptions);
                } else if ($scope.item.CancelReqRaisedStatusId == 1) {
                    utl.Alert.showErrorMsg('Cancel Request already raised');
                    return false;
                } else if ($scope.item.CancelReqRaisedStatusId == 3) {
                    utl.Alert.showErrorMsg('Cancel Request Rejected');
                    return false;
                } else {
                    // $("#remarks").css("required", "true");
                    $scope.required = true;
                    var confirmOptions = {
                        headingKey: 'common.confirm-modal-header.lbl',
                        messageKey: 'Do you want to raise Cancel Request',
                        yesKey: 'common.yeskey.lbl',
                        noKey: 'common.nokey.lbl',
                        onSuccessMethod: $scope.CancelRequest,
                    };
                    utl.Dialog.confirmMessage(confirmOptions);
                }
            }
        };
        $scope.UpdateCancelRequestPatientbillsCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.currentcontext.id = (typeof data === "number") ? data : $scope.currentcontext.id;
            $scope.getBillInfoByBillId();
        };
        $scope.UpdateCancelRequestPatientbills = function () {

            $scope.items.CancelReqRaisedStatusId = 1;
            $scope.items.Id = $scope.currentcontext.id;
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
                onComplete: $scope.UpdateCancelRequestPatientbillsCallback
            };
            utl.Http.doAction(options);
        };

        $scope.CancelRequestCallback = function (scope, data, options, hasError) {
            // utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            // $scope.currentcontext.id = (typeof data === "number") ? data : $scope.currentcontext.id;
            $scope.UpdateCancelRequestPatientbills();
            $scope.required = false;
        };

        $scope.CancelRequest = function () {
            // if (!utl.Validator.validate($scope)) {
            //     $scope.showErrorMsg($translate.instant('common.validationmsg.lbl'));
            //     return;
            // }
            $scope.item.BillingRequestBy = utl.Session.getCurrentUserId();
            $scope.item.BillingRequestAt = utl.Formatter.getCurrentDate();
            $scope.item.PatientBillId = $scope.currentcontext.id;
            $scope.item.BillingRequestTypeId = 1;
            $scope.item.BillingRequestDateTime = utl.Formatter.getCurrentDate();
            $scope.item.BillAmount = $scope.item.BillAmount;
            $scope.item.PaidAmount = $scope.item.PaidAmount;
            $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
            $scope.item.BillingRequestStatusId = 1;
            $scope.item.TypeId = 1;
            console.log($scope.item);
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


        $scope.CancelReceipt = function () {
            $scope.openModal($scope.currentcontext.id, 'cancel');
        };
        // $scope.CancelRequest = function () {
        //     $scope.openModal($scope.currentcontext.id, 'cancel');
        // };


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
            if ($scope.currentcontext.TotBalanceAmt == 0) {
                $scope.currentcontext.TotBalanceAmt = parseFloat($scope.currentcontext.ReceiptAmt) + parseFloat($scope.currentcontext.TotBalanceAmt);
            }
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
        $scope.CalReturnAmt = function () {
            if ($scope.currentcontext.TenderAmount > 0 && $scope.currentcontext.TenderAmount > $scope.currentcontext.TotNetAmount) {
                $scope.currentcontext.ReturnAmount = ($scope.currentcontext.TenderAmount - $scope.currentcontext.TotNetAmount);
            } else {
                $scope.currentcontext.ReturnAmount = 0;
            }
        }

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
            if (!utl.Validator.validate($scope)) {
                $scope.showErrorMsg($translate.instant('common.validationmsg.lbl'));
                return;
            }
            if (isNaN($scope.currentcontext.ReceiptAmt)) {
                utl.Alert.showErrorMsg($translate.instant('Please Enter Valid Amount'));
                return false;
            }
            $scope.item.PatientBillStatusId = StatusId;
            if (vm.Context == 'OP' && $scope.dgbillnosaveoption == 1) {
                utl.Alert.showErrorMsg('DG Bill Save Option not possible In OP Billing Screen.');
                return false;
            }
            if (!$scope.item.DoctorId && $scope.item.DoctorId < 1) {
                utl.Alert.showErrorMsg('Please Select Doctor');
                return false;
            }
            if ($scope.currentcontext.PaymentTypeId == 7) {
                $scope.item.IsMultiplePayment = true;
                if ($scope.PaymentAdjustmentDetails.length == 0) {
                    utl.Alert.showErrorMsg('Please Adjust Advance Amount');
                    return false;
                }
            }
            if (!$scope.item.BillNumber) {
                if ($scope.item.IsEncounter == false && vm.Context == 'OP') {
                    utl.Alert.showErrorMsg('No Visit Created For The Patient');
                    $scope.clear();
                    return false;
                }
            }
            console.log($scope.item);
            if (!$scope.item.IsMultiplePayment || $scope.item.IsMultiplePayment == false) {
                if ($scope.currentcontext.TotBalanceAmt > 0 && $scope.item.PatientBillStatusId == 3) {
                    if ($scope.currentfilter.GuarantorTypeId == 1) {
                        if (($scope.item.PrivateDueId <= 0 || !$scope.item.PrivateDueId) && $scope.currentfilter.GuarantorTypeId == 1) {
                            utl.Alert.showErrorMsg('Please Select the Credit Approver');
                            return false;
                        }
                    }
                }
            }
            if ($scope.ispatienttyperequired == 1) {
                if (!$scope.item.PatientTypeId) {
                    utl.Alert.showErrorMsg('Please Select PatientType');
                    return false;
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
            if ($scope.carddetailsmandatory == 1) {
                if ($scope.currentcontext.PaymentTypeId == 5 || $scope.currentcontext.PaymentTypeId == 6) {
                    if (!$scope.item.BankId) {
                        utl.Alert.showErrorMsg($translate.instant('Please Select Bank!...'));
                        return;
                    }
                    if (!$scope.item.CardTypeId) {
                        utl.Alert.showErrorMsg($translate.instant('Please Select CardType!...'));
                        return;
                    }
                    if (!$scope.item.TerminalNoId) {
                        utl.Alert.showErrorMsg($translate.instant('Please Select TerminalNo!...'));
                        return;
                    }
                }
                if ($scope.currentcontext.PaymentTypeId == 5 || $scope.currentcontext.PaymentTypeId == 6) {
                    if (!$scope.item.AuthorizeNumber || $scope.item.AuthorizeNumber == '') {
                        utl.Alert.showErrorMsg($translate.instant('Please Enter AuthCode!...'));
                        return;
                    }
                }
                if ($scope.currentcontext.PaymentTypeId == 11 || $scope.currentcontext.PaymentTypeId == 12) {
                    if (!$scope.item.UPIRefNumber || $scope.item.UPIRefNumber == '') {
                        utl.Alert.showErrorMsg($translate.instant('Please Enter RefNum!...'));
                        return;
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
                                $scope.PatientBillDetails[per].ProportionateDiscount = $scope.currentcontext.BillDiscount / 100 * $scope.PatientBillDetails[per].Amount;
                                $scope.PatientBillDetails[per].NetAmount =
                                    (($scope.PatientBillDetails[per].Amount) + parseFloat($scope.PatientBillDetails[per].GSTAmount)) -
                                    $scope.PatientBillDetails[per].ProportionateDiscount;
                                if ($scope.PatientBillDetails[per].DoctorShareValue > 0) {
                                    $scope.PatientBillDetails[per].DoctorShare = $scope.PatientBillDetails[per].NetAmount * ($scope.PatientBillDetails[per].DoctorShareValue / 100);
                                }
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
                            $scope.PatientBillDetails[inr].NetAmount = ($scope.PatientBillDetails[inr].Amount +
                                parseFloat($scope.PatientBillDetails[inr].GSTAmount)) - $scope.PatientBillDetails[inr].ProportionateDiscount;
                            if ($scope.PatientBillDetails[inr].DoctorShareValue > 0) {
                                $scope.PatientBillDetails[inr].DoctorShare = $scope.PatientBillDetails[inr].NetAmount * ($scope.PatientBillDetails[inr].DoctorShareValue / 100);
                            }
                        }
                    }
                } else {
                    for (var idx in $scope.PatientBillDetails) {
                        var item = $scope.PatientBillDetails[idx];
                        if ($scope.currentfilter.DiscountModeId && $scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 2) {
                            if (item.DiscountAmount > 0) {
                                item.DiscountPercentage = parseInt(item.DiscountAmount);
                                item.DiscountAmount = parseInt(item.DiscountAmount) / 100 * item.Amount;
                            }
                        }
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
            $scope.item.BillDiscount = parseFloat($scope.item.TotDiscAmount).toFixed(2);
            $scope.item.BillDiscountModeId = $scope.currentfilter.DiscountModeId;
            $scope.item.BillDiscountTypeId = $scope.currentcontext.BillDiscountTypeId;
            // $scope.item.RoundOffValue = 0;
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
            // $scope.item.PatientTypeId = 0;
            if ($scope.item.AgreementDiscountAmt > 0) {
                $scope.item.IsInsAgreementDiscount = true;
            }
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
                    var linenetamount = billitem.Amount + parseFloat(billitem.GSTAmount || 0) || 0;
                    if ($scope.CanShowScheme == true) {
                        var linediscountamount = billitem.SchemeDiscountAmt || 0;
                        var lineproportionatediscountamount = billitem.ProportionateDiscount || 0;
                        var actuallinenetamount = linenetamount - (parseFloat(linediscountamount) + lineproportionatediscountamount);
                        //var actuallinenetamount = $scope.PatientBillDetails[pay].NetAmount - ($scope.PatientBillDetails[pay].DiscountAmount + $scope.PatientBillDetails[pay].ProportionateDiscount);
                        var linepercentage = (100 / parseFloat($scope.currentcontext.TotNetAmount)) * actuallinenetamount;
                        var netpaidrupees = totalbillpayment / 100 * linepercentage;
                        $scope.PatientBillDetails[pay].ReceivedAmount = parseFloat(netpaidrupees).toFixed(2);
                    } else {
                        var linediscountamount = billitem.DiscountAmount || 0;
                        var lineproportionatediscountamount = billitem.ProportionateDiscount || 0;
                        var actuallinenetamount = linenetamount - (parseFloat(linediscountamount) + lineproportionatediscountamount);
                        // var actuallinenetamount = linenetamount - (parseFloat(linediscountamount) );
                        //var actuallinenetamount = $scope.PatientBillDetails[pay].NetAmount - ($scope.PatientBillDetails[pay].DiscountAmount + $scope.PatientBillDetails[pay].ProportionateDiscount);
                        var linepercentage = (100 / parseFloat($scope.currentcontext.TotNetAmount)) * actuallinenetamount;
                        var netpaidrupees = totalbillpayment / 100 * linepercentage;
                        $scope.PatientBillDetails[pay].DiscountAmount = parseFloat(billitem.DiscountAmount).toFixed(2);
                        $scope.PatientBillDetails[pay].ReceivedAmount = parseFloat(netpaidrupees).toFixed(2);
                    }
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
                if ($scope.cashcountermandatory == 1 && paymentlines.length > 0) {
                    if ($scope.UserCounterInfo.length == 0) {
                        utl.Alert.showErrorMsg($translate.instant('Please Start Cash Counter'));
                        return false;
                        // $scope.clear();
                    }
                }
                var adjustments = $scope.PaymentAdjustmentDetails;

                var actionName = 'billing/patientbills/AddPatientBills';
                if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                    actionName = 'billing/patientbills/UpdatePatientBills';
                }

                // if ($scope.currentfilter.GuarantorTypeId == 6) { // Free type
                //     var itemwiseNetAmt = 0;
                //     for (var i = 0, len = $scope.PatientBillDetails.length; i < len; i++) {
                //         if ($scope.PatientBillDetails[i].Status == 1) {
                //             var itemnetAmount = 0;
                //             itemnetAmount = isNaN(parseFloat($scope.PatientBillDetails[i].FreeNetAmount)) ?
                //                 0 : parseFloat($scope.PatientBillDetails[i].FreeNetAmount);
                //             itemwiseNetAmt += itemnetAmount;
                //         }
                //     }
                //     $scope.item.FreeBillAmount = itemwiseNetAmt;
                //     $scope.item.BillAmount = 0;
                //     $scope.item.PaidAmount = 0;
                // }

                savehitcompleted = 1;
                if (!$scope.item.LoadFrom) {
                    $scope.item.LoadFrom = $scope.PatientBillDetails[0].LoadFrom;
                }
                if ($scope.currentcontext.DiscountApprovedBy >= 1) {
                    $scope.item.DiscountApprovalStatusId = 1;
                }
                $scope.item.OrderIds = [];
                $scope.item.OrderIds = $scope.Detailids;
                var inputData = {
                    Header: $scope.item,
                    Details: lines,
                    paymentDetail: paymentlines,
                    adjustmentDetail: adjustments
                };
                console.log(inputData);
                // return;
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

                if (item.IsExecDoctor == true) {
                    if (item.ExecDoctorId < 1) {
                        utl.Alert.showErrorMsg($translate.instant('common.req-validation-msg.lbl'));
                        return false;
                    }
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
                    // item.DoctorId = $scope.item.DoctorId;
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
                    if (isNaN(item.DiscountAmount)) {
                        item.DiscountAmount = 0;
                    }
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

        function getLinesForSaveCancel() {
            var result = [];
            for (var idx in $scope.PatientBillDetails) {
                var item = $scope.PatientBillDetails[idx];
                if ((item.Quantity > 0 && item.Amount > 0)) {
                    item.Id = item.Id;
                    item.PatientBillStatusId = 2;
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
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            inputData.Params.push({
                Key: 8,
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
                    ServiceRateCategoryId: $scope.currentfilter.ServiceRateCategoryId,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                }, true);
                if (ServiceTraiffobj != null && ServiceTraiffobj.length > 0) {
                    item.ServiceItemRate = ServiceTraiffobj[0].Rate;
                    item.DoctorShare = ServiceTraiffobj[0].DoctorShare;
                    item.ExternalPrice = ServiceTraiffobj[0].ExternalPrice;
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



        function loadData() {
            if ($scope.cashcountermandatory == 1) {
                $scope.checkCounterStatusByUserId();
            } else {
                $scope.patientChange();
                $scope.initLookup();
                $scope.applyVisibilityRules();
                // $scope.clear();
                //             $scope.currentfilter.GuarantorTypeId = -1;
                if (vm.Context == 'DG') {
                    $scope.currentfilter.GuarantorTypeId = 1;
                    $scope.item.DepartmentId = 126;
                    var guarantor = {
                        Id: 1
                    };
                    $scope.GuarantorTypeChange(guarantor)
                }
            }
        }

        $scope.updateCount = function () {
            $scope.getPatientAlertsCount();
        };

        $scope.CheckExecDoctor = function (item) {
            if (item == true) {
                item.isRequired = true;
            } else {
                item.isRequired = false;
            }
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

            utl.Http.doAction(options);
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
            utl.Modal.open('app.referral', {
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
        $scope.CheckCashCounterStartCallbck = function (scope, res, options, hasError) {
            //   $scope.cashcounter=[];
            if (res.Data.length == 0) {
                utl.Alert.showErrorMsg('Start the Cash Counter');
                $scope.canSelectPatients = false;
            }
        };

        $scope.CheckCashCounterStart = function () {
            var StartDate = $filter('date')($scope.currentfilter.DocumentDate, 'yyyy-MM-dd 00:00:00') || null;
            var EndDate = $filter('date')($scope.currentfilter.DocumentDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                    Key: 10,
                    Value: 1
                },
                {
                    Key: 1,
                    Value: utl.Session.getCurrentUserId()
                }
                ],
            }
            if ($scope.currentfilter.DocumentDate) {
                StartDate = $filter('date')($scope.currentfilter.DocumentDate, 'yyyy-MM-dd 00:00:00');
                EndDate = $filter('date')($scope.currentfilter.DocumentDate, 'yyyy-MM-dd 23:59:59');
                inputData.Params.push({
                    Key: 7,
                    Value: [StartDate, EndDate]
                });

            }
            var options = {
                action: 'Billing/UserBillingCounters/GetUserBillingCounterWithoutDenominations',
                data: inputData,
                type: 'post',
                onComplete: $scope.CheckCashCounterStartCallbck
            };
            utl.Http.doAction(options);
        };

        $scope.getFacPreferenceInfoCallbck = function (scope, res, options, hasError) {
            //    for(var idx in res.Data){
            //     var items = res.Data[idx];
            //     if(items.PreferenceKey == 'billingdepartment'){
            //         $scope.item.PreferenceValue = items.PreferenceValue;
            //     }
            //    }
            if (res.Data[0].PreferenceValue == '1') {
                $scope.CheckCashCounterStart();
            }
        };

        $scope.getFacPreferenceInfo = function () {
            $scope.PreferenceKey = 'billingdepartment';
            var inputData = {
                Params: [{
                    Key: 4,
                    Value: utl.Session.getCurrentFacilityId()
                },
                {
                    Key: 2,
                    Value: $scope.PreferenceKey
                },
                ],
            }
            var options = {
                action: 'SystemSettings/FacilityPreference/GetFacilityPreferences',
                data: inputData,
                type: 'post',
                onComplete: $scope.getFacPreferenceInfoCallbck
            };
            utl.Http.doAction(options);
        };


        $scope.getFacInfoCallbck = function (scope, data, options, hasError) {
            $scope.item.IsVAT = data.IsVAT;
            $scope.ShowVAT = false;
            if (data.IsVAT) {
                $scope.ShowVAT = true;
            }
            $scope.item.IsDoctorShare = data.IsDoctorShare;
            $scope.ShowDoctorShare = false;
            if (data.IsDoctorShare) {
                $scope.ShowDoctorShare = true;
            }
            $scope.getFacPreferenceInfo();

        };

        $scope.getFacInfo = function () {
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

        $scope.moveHeaderFocus = function (nextId) {
            $('#doctorid').focus();
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
                } else if (nextId == 'DoctorShare' && (!(item.RdoServiceId || item.ServiceId <= 0 || !item.SelectedItem.IsRateEditable))) {
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
            // Compatibility adapter: dom may now be either a still-native
            // AngularJS <ui-select> (an "island" retained for parity
            // reasons) or a plain React-rendered <select>. Never throws.
            $timeout(function () {
                if (!dom) {
                    return;
                }
                var uiSelect = angular.element(dom);
                var uichild = uiSelect.controller ? uiSelect.controller('uiSelect') : null;
                if (uichild && typeof uichild.activate === 'function') {
                    uichild.activate();
                    return;
                }
                if (typeof dom.focus === 'function') {
                    dom.focus();
                }
                if (typeof dom.showPicker === 'function') {
                    try {
                        dom.showPicker();
                    } catch (e) {
                        // best-effort auto-open only; some browsers/contexts
                        // refuse showPicker() (e.g. not a user gesture) --
                        // focus() above already landed, so swallow this.
                    }
                }
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
            if (kCode == 113 && savehitcompleted === 0 && $scope.canShowSaveBtn && !$scope.IsApproved) { // F2  - SaveDraft
                $scope.completeBill($scope.saveDraft);
            }
            if (kCode == 115 && savehitcompleted === 0 && $scope.canShowSaveapproveBtn && !$scope.IsApproved) { // F2  - SaveAndApprove
                $scope.completeBill($scope.saveAndApprove);
            }
            if (kCode == 118) { // F7  - New Page
                $scope.addNewBill();
            }
            if (kCode == 119) { // F8  - Find Bills
                $scope.findBill();
            }
            if (e.altKey && kCode == 83 && savehitcompleted === 0 && $scope.canShowSaveBtn && !$scope.IsApproved) { // alt + s  - SaveDraft
                $scope.completeBill($scope.saveDraft);
            }
            if (e.altKey && kCode == 65 && savehitcompleted === 0 && $scope.canShowSaveapproveBtn && !$scope.IsApproved) { // alt + s  - SaveAndApprove
                $scope.completeBill($scope.saveAndApprove);
            }
            if (e.altKey && kCode == 80) { // alt + p  - DMPrint
                if ($scope.dmprintpreferences > 0) {
                    $scope.dmPrint();
                } else {
                    $scope.print(false);
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
            $scope.item.OverallDue = 0;
            var overalldue = 0;
            if (res.Data.length > 0) {
                for (var dx in res.Data) {
                    var bill = res.Data[dx];
                    if (bill.OutStandingAmount) {
                        overalldue += bill.OutStandingAmount;
                    }
                }
                $scope.item.OverallDue = overalldue;
                if ($scope.IsDueAllowed == 'true') {
                    utl.Alert.showErrorMsg('Please Collect all Due Amounts to Proceed Next Bill...');
                    // $scope.canShowSaveapproveBtn = false;
                    $scope.canShowSaveBtn = false;
                }
            }
        };

        $scope.getUserBills = function () {
            var inputData = {
                Params: [
                    // {
                    //     Key: 39,
                    //     Value: utl.Session.getCurrentUserId()
                    // },
                    {
                        Key: 12,
                        Value: $scope.currentfilter.PatientId
                    },
                    {
                        Key: 11,
                        Value: '0'
                    },
                    {
                        Key: 20,
                        Value: [1, 5, 4]
                    },
                    {
                        Key: 4,
                        Value: 3
                    },
                ],
                PageContext: {
                    PageSize: -1,
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

            $scope.refreshReactProps();
        };

        $scope.initLookup = function () {
            var inputData = [
                // {
                //     "Key": "Department"
                // },
                {
                    "Key": "ServiceRateCategory",
                    Request: {
                        Params: [{
                            Key: 5,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        },
                        {
                            Key: 7,
                            Value: 1
                        }
                        ]
                    },
                    Default: false
                },
                // {
                //     "Key": "Guarantor",
                //     Request: {
                //         Params: [{
                //             Key: 7,
                //             Value: [-1, utl.Session.getCurrentFacilityId()]
                //         }]
                //     }
                // },
                {
                    "Key": "DiscountMode"
                },
                {
                    "Key": "GuarantorType"
                },
                // {
                //     "Key": "Doctor",
                //     Request: {
                //         Params: [{
                //             Key: 33,
                //             Value: [-1, utl.Session.getCurrentFacilityId()]
                //         }
                //         ]
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
                {
                    "Key": "PatientType"
                }
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

        $scope.getInsurancelookup = function () {
            var inputData = [{
                "Key": "Guarantor",
                Request: {
                    Params: [{
                        Key: 7,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    }, {
                        Key: 2,
                        Value: $scope.currentfilter.GuarantorTypeId
                    }]
                }
            }];
            $scope.getLookUp(inputData);
        };
        defaultReferral();
        // $scope.getUserBills();
        $scope.checkHeader = function (iVal) {
            if (iVal == 1) {
                $scope.item.WithoutHeader = false;
            }
            if (iVal == 2) {
                $scope.item.WithHeader = false;
            }
        };
        $scope.getPatientAlertsCount();

        $scope.getFacInfo();
        loadData();

        // Hosmat POS Integration
        function generateProcessId() {
            const now = new Date();
            const year = now.getFullYear().toString().slice(-2);
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            const milliseconds = String(now.getMilliseconds()).padStart(3, '0');

            return `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
        }
        var pollInterval = null;
        var pollEndTime = null;
        var countdownTimer = null;
        var pollingFrequency = 5000;
        $scope.paymentInProgress = false;
        // $scope.countdown = 60;
        $scope.setupPaymentDetails = function () {
            // $(document).ready(function () {
            const patientName = $scope.item.PatientName;
            const uhid = $scope.item.PatientMrn;
            const chargerate = parseFloat($scope.currentcontext.ReceiptAmt).toFixed(2);
            // const chargerate = '1';
            const email = '';
            const mobileno = $scope.item.Mobile;
            console.log('mobileis', mobileno);
            $scope.processingid = generateProcessId();
            const uname = utl.Session.getCurrentUserId() + '-' + utl.Session.getCurrentUserName();
            var paymode = '';
            if ($scope.currentcontext.PaymentTypeId == 11) {
                paymode = "cards-upi";
            } else if ($scope.currentcontext.PaymentTypeId == 5) {
                paymode = "cards-swipe";
            }
            const callback_url = "https://hosmat.momentpay.live/ma/ariticpayment/callback";
            const redirect_url = "";
            // const redirect_url = "https://testing.momentpay.in/ma/thankyou-new";

            const myVal = '{"credentials":{"user":"hosmat_hospital","key":"cozQP6vmJNbcraqWlnLpzNJIiiIC5H4EIlHNkYcm0vBy0WNbs8","version":"HISV2"},"cashier_id": "' + uname + '", "customer_details": [{"customer_name": "' +
                patientName + '", "customer_id": "' + uhid + '", "payment_amount": "' + chargerate + '", "customer_email": "' + email + '","customer_phone": "' +
                mobileno + '"}], "processing_id": "' + $scope.processingid + '","paymode": "' + paymode + '","payment_fill":"pre_full","transaction_location":"Hosmat Hospital","callback_url": "' + callback_url + '","redirect_url": "' + redirect_url + '"}';

            $('#txttoken').val(myVal);
            $('#mid').val('KkZma9ph');
            $('#check_sum_hash').val('ZjMzNzk0MTFmZjE3YTA4YjlkNzI2NGM3NTBmMWFhMWMxNzAzOWY5N2ViNmYzYTA3ZTc5YzEzYTJjZGZlZDExYQ==');

            // $("#paynow").click(function () {
            //     $("#iframeForm").submit();
            // });

            // });
        }
        // $("#paynow").click(function () {
        //     $scope.processPayment();
        // });

        $("#paynow").click(function () {
            if (!$scope.ApproveFromPayment()) {
                return;
            }
            $scope.setupPaymentDetails();
            var width = 800;
            var height = 700;
            // Calculate center position
            var left = (screen.width - width) / 2;
            var top = (screen.height - height) / 2;
            var popupWindow = window.open("", "PaymentWindow", `width=${width},height=${height},top=${top},left=${left}`);
            if (popupWindow) {
                $("#iframeForm").attr("target", "PaymentWindow");
                $("#iframeForm").submit();
                startPolling($scope.processingid);

                // Entra for count and reset UI
                var checkPopupClosed = setInterval(function () {
                    if (popupWindow.closed) {
                        console.log("Payment window closed. Stopping polling...");
                        clearInterval(checkPopupClosed);
                        stopPolling();
                        resetUI();
                    }
                }, 1000);
            } else {
                alert("Popup blocked! Please allow popups for this site.");
            }
        });

        $scope.$watchGroup(["currentcontext.ReceiptAmt", "currentcontext.PaymentTypeId"], function (newValues, oldValues) {
            const [newReceiptAmt, newPaymentTypeId] = newValues;
            const [oldReceiptAmt, oldPaymentTypeId] = oldValues;

            if (newReceiptAmt > 0 && (newReceiptAmt !== oldReceiptAmt || newPaymentTypeId !== oldPaymentTypeId)) {
                $scope.setupPaymentDetails();
            }
        });
        function resetUI() {
            $scope.$apply(function () {
                $scope.paymentInProgress = false;
                // $scope.countdown = 60;
            });
            console.log("UI Reset: Countdown stopped, payment process reset.");
        }
        function startPolling(processingid) {
            stopPolling();
            $scope.paymentInProgress = true;
            if ($scope.currentcontext.PaymentTypeId == 11) {
                $scope.countdown = 180;
            } else if ($scope.currentcontext.PaymentTypeId == 5) {
                $scope.countdown = 240;
            } else {
                $scope.countdown = 60;
            }

            pollEndTime = Date.now() + ($scope.countdown * 1000);

            startCountdown();

            pollInterval = $interval(function () {
                if (Date.now() >= pollEndTime) {
                    stopPolling();
                    console.log("Polling stopped: Time expired.");
                    return;
                }

                // Reduce polling time dynamically as countdown decreases
                // if ($scope.countdown < 30) {
                //     pollingFrequency = 3000;
                // }
                // if ($scope.countdown < 10) {
                //     pollingFrequency = 1000;
                // }

                $scope.getListPOS(processingid);
            }, pollingFrequency);
        }

        function stopPolling() {
            if (pollInterval) {
                $interval.cancel(pollInterval);
                pollInterval = null;
                console.log("Polling stopped.");
            }
            if (countdownTimer) {
                $interval.cancel(countdownTimer);
                countdownTimer = null;
            }
            $scope.paymentInProgress = false;
        }

        function startCountdown() {
            countdownTimer = $interval(function () {
                if ($scope.countdown <= 0) {
                    stopPolling();
                } else {
                    $scope.countdown--;
                }
            }, 1000);
        }

        $scope.getListCallbackPOS = function (scope, res, options, hasError) {
            console.log('Checking transaction status:', res.body);
            const token = res.body.response_token || '';
            const ResponseCode = token.response_code || '';
            if (ResponseCode == '1200') {
                $scope.$applyAsync(() => {
                    console.log('Transaction successful.');
                    utl.Alert.showSuccessMsg($translate.instant('Transaction successful.'));
                    stopPolling();
                    $scope.item.ReferenceNumber = token.processing_id;
                    if (token.payment_method === 'UPI') {
                        $scope.item.UPIRefNumber = token.transaction_id;
                    } else {
                        $scope.item.AuthorizedCode = token.transaction_id;
                        $scope.item.AuthorizeNumber = token.transaction_id;
                    }
                    $scope.saveStatus(token);
                    $scope.saveItem(3);
                    $scope.currentcontext.retryTypeId = 1;
                });
            } else {
                console.log('Transaction still pending...');
                $scope.currentcontext.retryTypeId = 2;
            }
        };

        $scope.getListPOS = function (processingid) {
            var inputData = {
                processing_id: processingid
            };

            var options = {
                action: 'Billing/PosMomentLog/MomentTransactionStatus',
                data: { Data: inputData },
                type: 'post',
                onComplete: $scope.getListCallbackPOS
            };

            utl.Http.doAction(options);
        };
        $scope.retryTransaction = function () {
            if (!$scope.processingid) {
                console.warn("No processing ID found. Cannot retry transaction.");
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'Do You Want to Retry this Transaction',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.onRetryConfirm,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        };
        $scope.onRetryConfirm = function () {
            $scope.getListPOS($scope.processingid);
        };
        $scope.saveStatus = function (req) {
            var inputData = {
                ResponseCode: req.response_code || null,
                ResponseMessage: req.response_message || null,
                ProcessingId: req.processing_id || null,
                Amount: req.customer_details ? parseFloat(req.customer_details.amount) : null,
                TransactionId: req.transaction_id || null,
                PayMode: req.payment_method || null,
                RrnId: req.payment_response.rrn_id || null,
                CardNumber: req.payment_response.cardNumber || null,
                CardHolderName: req.payment_response.cardHolderName || null,
                CardType: req.payment_response.cardType || null,
                ApprovalCode: req.payment_response.approval_code || null,
                CustomerId: req.customer_details.customer_number,
                TransactionAmount: req.customer_details ? parseFloat(req.customer_details.amount) : null,
            };

            var options = {
                action: 'Billing/PosMomentLog/AddPosMomentLog',
                data: { Data: inputData },
                type: 'post',
                onComplete: $scope.saveStatusCallbackPOS
            };

            utl.Http.doAction(options);
        };
        $scope.saveStatusCallbackPOS = function (scope, data, options, hasError) {
            if (!hasError) {
                utl.Alert.showSuccessMsg($translate.instant('Transaction Satus Saved'));
            }
        };
        $scope.ApproveFromPayment = function () {
            $scope.isSaveandApprove = false;
            if ($scope.item.BillNumber == null) {
                $scope.item.BillDateTime = utl.Formatter.getCurrentDate();
            }
            $scope.requiredsecuritypin =
                utl.FacilitySetting.getFacilitySettingValue('billing', 'requiredsecuritypin');

            if ($scope.requiredsecuritypin && !$scope.securitypisvalid)
                if (!$scope.securitypincheck())
                    return false;
            $scope.IsApproved = true;


            if (savehitcompleted == 1) return;
            if (!utl.Validator.validate($scope)) {
                $scope.showErrorMsg($translate.instant('common.validationmsg.lbl'));
                return;
            }
            if (isNaN($scope.currentcontext.ReceiptAmt)) {
                utl.Alert.showErrorMsg($translate.instant('Please Enter Valid Amount'));
                return false;
            }
            $scope.item.PatientBillStatusId = 3;
            if (vm.Context == 'OP' && $scope.dgbillnosaveoption == 1) {
                utl.Alert.showErrorMsg('DG Bill Save Option not possible In OP Billing Screen.');
                return false;
            }
            if (!$scope.item.DoctorId && $scope.item.DoctorId < 1) {
                utl.Alert.showErrorMsg('Please Select Doctor');
                return false;
            }
            if ($scope.currentcontext.PaymentTypeId == 7) {
                $scope.item.IsMultiplePayment = true;
                if ($scope.PaymentAdjustmentDetails.length == 0) {
                    utl.Alert.showErrorMsg('Please Adjust Advance Amount');
                    return false;
                }
            }
            if (!$scope.item.BillNumber) {
                if ($scope.item.IsEncounter == false && vm.Context == 'OP') {
                    utl.Alert.showErrorMsg('No Visit Created For The Patient');
                    $scope.clear();
                    return false;
                }
            }
            console.log($scope.item);
            if (!$scope.item.IsMultiplePayment || $scope.item.IsMultiplePayment == false) {
                if ($scope.currentcontext.TotBalanceAmt > 0 && $scope.item.PatientBillStatusId == 3) {
                    if ($scope.currentfilter.GuarantorTypeId == 1) {
                        if (($scope.item.PrivateDueId <= 0 || !$scope.item.PrivateDueId) && $scope.currentfilter.GuarantorTypeId == 1) {
                            utl.Alert.showErrorMsg('Please Select the Credit Approver');
                            return false;
                        }
                    }
                }
            }
            if ($scope.ispatienttyperequired == 1) {
                if (!$scope.item.PatientTypeId) {
                    utl.Alert.showErrorMsg('Please Select PatientType');
                    return false;
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
            if ($scope.carddetailsmandatory == 1) {
                if ($scope.currentcontext.PaymentTypeId == 5 || $scope.currentcontext.PaymentTypeId == 6) {
                    if (!$scope.item.BankId) {
                        utl.Alert.showErrorMsg($translate.instant('Please Select Bank!...'));
                        return;
                    }
                    if (!$scope.item.CardTypeId) {
                        utl.Alert.showErrorMsg($translate.instant('Please Select CardType!...'));
                        return;
                    }
                    if (!$scope.item.TerminalNoId) {
                        utl.Alert.showErrorMsg($translate.instant('Please Select TerminalNo!...'));
                        return;
                    }
                }
                if ($scope.currentcontext.PaymentTypeId == 5 || $scope.currentcontext.PaymentTypeId == 6) {
                    if (!$scope.item.AuthorizeNumber || $scope.item.AuthorizeNumber == '') {
                        utl.Alert.showErrorMsg($translate.instant('Please Enter AuthCode!...'));
                        return;
                    }
                }
                if ($scope.currentcontext.PaymentTypeId == 11 || $scope.currentcontext.PaymentTypeId == 12) {
                    if (!$scope.item.UPIRefNumber || $scope.item.UPIRefNumber == '') {
                        utl.Alert.showErrorMsg($translate.instant('Please Enter RefNum!...'));
                        return;
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
                if (iServiceNotSelected == 1) {
                    utl.Alert.showErrorMsg('Select Any Service');
                    return false;
                }

                if (iServiceNotSelected == 2) {
                    utl.Alert.showErrorMsg('Selected Service Quantity and Amount Should not be zero');
                    return false;
                }
            }

            if ($scope.item.PatientBillStatusId == 1 && dReceiptAmt > 0) {
                utl.Alert.showErrorMsg('Amount collection use save and approve button');
                $scope.currentcontext.ReceiptAmt = null;
                dReceiptAmt = 0;
                $scope.CalculateNetAmt();
                return false;
            }

            if (!checkMandatoryFields()) {
                return;
            }
            return true;

        };
    }

    opbillingListController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$timeout', '$interval'];

})();