(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('uaebillingFormController', uaebillingFormController);

    function uaebillingFormController($rootScope, $scope, $stateParams, $state, $translate, utl, $filter, $timeout) {
        var vm = this;

        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));

        $scope.item = {};
        $scope.item.PatientId = -1;
        $scope.item.PatientName = '';
        $scope.item.MRN = '';
        $scope.item.MRNTypeId = -1;
        $scope.item.Mobile = '';
        $scope.item.EncounterId = -1;
        $scope.item.DoctorId = -1;
        $scope.item.DoctorName = '';
        $scope.item.VisitIdentifier = '';
        $scope.item.VisitTypeId = -1;
        $scope.item.VisitType = '';
        $scope.item.VisitReasonId = -1;
        $scope.item.VisitReason = '';
        $scope.item.ConsultationStatus = '';
        $scope.item.DepartmentId = -1;
        $scope.item.DepartmentCode = '';
        $scope.item.DepartmentName = '';
        $scope.item.SpecialityId = -1;
        $scope.item.Speciality = '';
        $scope.item.GuarantorId = -1;
        $scope.item.GuarantorName = '';

        $scope.currentcontext = {};
        $scope.currentcontext.id = 0;
        $scope.currentcontext.PatientStatusId = 1;
        $scope.currentcontext.PatientBillStatusId = 1;
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

        $scope.selectedPatient = {};

        $scope.PatientBillInfo = [];
        $scope.PatientBillInfoDetails = [];
        $scope.PatientBillDetails = [];
        $scope.DeletedBillDetails = [];
        $scope.PatientPaymentDetails = [];
        $scope.PaymentAdjustmentDetails = [];

        $scope.patientChange = function () {
            $scope.chkfindBill = 0;
            if ($scope.item.PatientId > 0) {
                var options = {
                    action: 'registration/patient/GetPatientInfoById',
                    data: { Id: $scope.item.PatientId },
                    type: 'post',
                    onComplete: $scope.getPatientInfo
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getPatientInfo = function (scope, data, options, hasError) {
            $scope.selectedPatient = data;

            $scope.item.PatientName = $scope.selectedPatient.Title.Description + ' ' + $scope.selectedPatient.FirstName;
            $scope.item.PatientId = $scope.selectedPatient.Id;
            $scope.item.MRN = $scope.selectedPatient.MRN;
            $scope.item.MRNTypeId = $scope.selectedPatient.MRNTypeId;
            $scope.item.Mobile = $scope.selectedPatient.Mobile;

            if ($scope.selectedPatient.Encounters && $scope.selectedPatient.Encounters.length > 0) {
                var encounter = $scope.selectedPatient.Encounters[0] || {};
                $scope.item.EncounterId = encounter.Id;
                $scope.item.DoctorId = encounter.DoctorId;
                $scope.item.DoctorName = encounter.DoctorName;
                $scope.item.VisitIdentifier = encounter.VisitIdentifier;
                $scope.item.VisitTypeId = encounter.VisitTypeId;
                if (encounter.VisitType) {
                    $scope.item.VisitType = encounter.VisitType.Description;
                }
                $scope.item.VisitReasonId = encounter.VisitReasonId;
                if (encounter.VisitReason) {
                    $scope.item.VisitReason = encounter.VisitReason.Remarks;
                }
                if (encounter.EncounterDoctors && encounter.EncounterDoctors.length > 0) {
                    var encounterDoctor = encounter.EncounterDoctors[0] || {};
                    if (encounterDoctor.ConsultationStatus) {
                        $scope.item.ConsultationStatus = encounterDoctor.ConsultationStatus.Description;
                    }
                    if (encounterDoctor.Department) {
                        $scope.item.DepartmentId = encounterDoctor.Department.Id;
                        $scope.item.DepartmentCode = encounterDoctor.Department.DepartmentCode;
                        $scope.item.DepartmentName = encounterDoctor.Department.DepartmentName;
                        $scope.item.SpecialityId = encounterDoctor.Department.SpecialityId || 0;
                        if (encounterDoctor.Department.Speciality) {
                            $scope.item.Speciality = encounterDoctor.Department.Speciality.Description;
                        }
                    }
                }

                var encGuarantor = encounter.EncounterGuarantors.length > 0 ? encounter.EncounterGuarantors[0] : { GuarantorTypeId: -1 };
                $scope.item.GuarantorId = encGuarantor.GuarantorId;
                $scope.item.GuarantorTypeId = encGuarantor.GuarantorTypeId;
                $scope.item.GuarantorName = encGuarantor.GuarantorName;
                //$scope.currentfilter.GuarantorTypeId = encGuarantor.GuarantorTypeId;
                //$scope.GuarantorTypeChange({ Id: encGuarantor.GuarantorTypeId })

            }

            //$scope.loadPatientGuarantors();
            //$scope.onDoctorSelected();

            //$scope.fnencounter();
        };

        $scope.applyVisibilityRules = function () {
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
            } else if ($scope.item.PatientBillStatusId == 2) {
                $scope.canShowSaveBtn = false;
                $scope.canShowPrescribeBtn = false;
                $scope.canShowPrescribeOrderBtn = false;
                $scope.canShowClearBtn = false;
                $scope.canShowSaveapproveBtn = false;
                $scope.canShowCancelBtn = false;
                $scope.HidePrintBtn = false;
                $scope.canShowViewReceipt = true;
                $scope.canShowPrintheader = true;
            } else if ($scope.item.PatientBillStatusId == 3) {
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
        };

        $scope.addNewLineItem = function () {
            var lastIndex = $scope.PatientBillDetails.length - 1;
            if (lastIndex >= 0) {
                if ($scope.PatientBillDetails[lastIndex].ServiceId == -1)
                    return false;
            }
            var PatientBillDetails = {
                RdoDiscountMode: true,
                RdoDiscount: true,
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
        };

        $scope.ServiceItemChanged = function (idx, item) {
            var isDuplicate = utl.Common.isDuplicateRec($scope.PatientBillDetails, { pivotkey: 'ServiceId', displaykey: 'ServiceName' });
            if (isDuplicate) {
                item.ServiceId = '';
                item.ServiceName = '';
                return;
            }
            console.log(item.SelectedItem);
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
                item.DoctorId = $scope.item.DoctorId;
                item.DoctorName = $scope.item.DoctorName;
                item.RdoDiscountMode = false;
                item.IsPackageItem = ServiceItemobj.IsPackage;
                var ServiceTraiffobj = $filter('filter')(ServiceItemobj.ServiceItemTariffDetails, { ServiceRateCategoryId: $scope.currentfilter.ServiceRateCategoryId }, true);
                if (ServiceTraiffobj != null && ServiceTraiffobj.length > 0) {
                    item.ServiceRateCategoryId = ServiceTraiffobj[0].ServiceRateCategoryId;
                    item.ServiceRateCategoryName = ServiceTraiffobj[0].Text;
                    item.Rate = ServiceTraiffobj[0].Rate;
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











        function loadData() {
            $scope.patientChange();
            //$scope.applyVisibilityRules();
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            loadData();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Department" },
                { "Key": "DiscountMode" },
                { "Key": "GuarantorType" },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "PaymentType" },
                { "Key": "Bank" },
                { "Key": "CardType" },
                { "Key": "Terminal" },
                { "Key": "PrivateDueApprover" },
                { "Key": "DiscountApprover" },
                { "Key": "Referral" },
                { "Key": "PatientType" }
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

    uaebillingFormController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$timeout'];

})();