(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('IPBillModificationViewController', IPBillModificationViewController);

    function IPBillModificationViewController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));
        $scope.SelectedIndex = -1;
        $scope.BillRefreshCount = 0;
        $scope.FacilityBlockPendingOrders = false;
        $scope.PendingOrderTestNames = '';
        $scope.BillLockDetail = {};
        $scope.selectedPatient = {};
        $scope.lookup = {};
        $scope.IsPackageAssigned = false;
        $scope.isFinalized = false;

        $scope.item = {
            SupplementaryGrossAmount: 0,
            SupplementaryDiscountAmount: 0,
            SupplementaryGstAmount: 0,
            SupplementaryNetAmount: 0,
            GuarantorGrossAmount: 0,
            GuarantorDiscountAmount: 0,
            GuarantorGstAmount: 0,
            GuarantorNetAmount: 0
        };
        $scope.item.doadate = utl.Formatter.getCurrentDate();
        $scope.item.PatientId = -1;
        $scope.item.PaymentTypeId = 1;
        $scope.item.ReceiptTypeId = -1;
        $scope.item.GuarantorDueId = -1;
        $scope.item.FamilyLinkId = -1;
        $scope.item.DoctorId = -1;

        $scope.currentcontext = {
            TotalGrossAmount: 0,
            TotalDiscountAmount: 0,
            TotalNetAmount: 0,
            TotalBalanceAmount: 0,
            TotalCNAmount: 0,
            TotalRefundAmount: 0,
            TotalTDSAmount: 0,
            TotalDisAllowedAmount: 0,
            TotalReceivedAmount: 0,
            TotalDueAmount: 0,
            RoundOffValue: 0
        };
        $scope.currentcontext.ModifiedPatientBillId = parseInt($stateParams.id);
        $scope.currentcontext.eid = parseInt($stateParams.eid);
        $scope.currentcontext.mode = parseInt($stateParams.mode);

        $scope.filterbillnr = $stateParams.filterbillnr;
        $scope.filterbilldt = $stateParams.filterbilldt;
        $scope.filtermrn = $stateParams.filtermrn;

        $scope.backToList = function () {
            $state.go('app.ipbillmodificationtab.ipbillmodification-list', {
                filterbillnr: $scope.filterbillnr,
                filterbilldt: $scope.filterbilldt,
                filtermrn: $scope.filtermrn
            });
        };

        $scope.currentcontext.id = 0;
        $scope.currentcontext.RdoBillDiscount = false;
        $scope.currentcontext.RdoBillDiscountMode = false;
        $scope.currentcontext.Rdobilldate = true;
        $scope.currentcontext.DiscountModeValue = 0;
        $scope.currentcontext.BillDiscountTypeId = -1;
        $scope.currentcontext.ModifiedBillDiscount = 0;
        $scope.currentcontext.BillDiscount = 0;
        $scope.currentcontext.BillDiscountModeId = -1;
        $scope.currentcontext.ApprovedById = -1;
        $scope.currentcontext.PaymentTypeId = 1;
        $scope.currentcontext.TotNetAmount = 0;
        $scope.currentcontext.TotDueAmount = 0;
        $scope.currentcontext.TotDiscountAmt = 0;
        $scope.currentcontext.PaidAmt = 0;
        $scope.currentcontext.ReceiptAmt = 0;
        $scope.currentcontext.TotBalanceAmt = 0;
        $scope.currentcontext.RoundOffValue = 0;
        $scope.currentcontext.FSTypeId = 1;
        $scope.currentcontext.FamilyLinkId = 0;
        $scope.currentcontext.TransferEncounterId = 0;
        $scope.currentcontext.TransferPatientId = 0;
        $scope.currentcontext.TransferAmount = 0;

        $scope.currentfilter = {};
        $scope.currentfilter.DiscountModeId = 2;
        $scope.currentfilter.billdate = '';
        $scope.currentfilter.billnumber = '';
        $scope.currentfilter.PatientId = -1;
        $scope.currentfilter.patientname = '';
        $scope.currentfilter.DoctorId = -1;
        $scope.currentfilter.DepartmentId = -1;
        $scope.currentfilter.PayScenarioId = -1;
        $scope.currentfilter.GuarantorName = '';
        $scope.currentfilter.ServiceRateCategoryId = -1;
        $scope.currentfilter.ServiceRateCategoryName = '';
        $scope.currentfilter.billdate = utl.Formatter.getCurrentDate();

        $scope.PatientBillDetails = [];
        $scope.PatientPaymentDetails = [];

        $scope.isSaving = false;
        $scope.outstanding = false;

        $scope.ReadOnly = function() {
            return true;
        }

        $scope.addNewServiceItems = function () {
            utl.Modal.open('app.ipbilling-newservices', {
                params: {
                    pid: $scope.item.PatientId,
                    eid: $scope.item.EncounterId,
                    mbid: $scope.currentcontext.ModifiedPatientBillId,
                    bid: $scope.item.PatientBillId
                },
                confirmCallback: $scope.getModifiedBillInfoAfterAddedServices
            });
        };

        $scope.getModifiedBillInfoAfterAddedServices = function (ModifiedData) {
            $scope.currentcontext.ModifiedPatientBillId = ModifiedData.ModifiendPatientBillId;
            $scope.getModifiedBillInfoById();
        };

        $scope.addNewDrugItems = function () {
            utl.Modal.open('app.ipbilling-newdrugs', {
                params: {
                    pid: $scope.item.PatientId,
                    eid: $scope.item.EncounterId,
                    mbid: $scope.currentcontext.ModifiedPatientBillId,
                    bid: $scope.item.PatientBillId
                },
                confirmCallback: $scope.getModifiedBillInfoAfterAddedDrugs
            });
        };

        $scope.getModifiedBillInfoAfterAddedDrugs = function (ModifiedData) {
            $scope.currentcontext.ModifiedPatientBillId = ModifiedData.ModifiendPatientBillId;
            $scope.getModifiedBillInfoById();
        };

        $scope.IPGuarantorCategoryDetails = function (category, isguarantor) {
            utl.Modal.open('app.ipguarantorcategorydetails', {
                params: {
                    pid: $scope.item.PatientId,
                    id: category.Id,
                    eid: category.EncounterId,
                    bid: category.PatientBillId,
                    mbid: category.ModifiedPatientBillId,
                    cid: category.ServiceCategoryId,
                    cname: category.ServiceCategory.ServiceCategoryName,
                    isguarantor: isguarantor,
                    issupplementary: false
                },
                confirmCallback: $scope.IPGuarantorCategoryDetailsCallback
            });
        };

        $scope.IPGuarantorCategoryDetailsCallback = function (ModifiedData) {
            $scope.currentcontext.ModifiedPatientBillId = ModifiedData.ModifiedPatientBillId;
            $scope.getModifiedBillInfoById();
        };

        $scope.IPSupplementaryCategoryDetails = function (category, issupplementary) {
            utl.Modal.open('app.ipsupplementarycategorydetails', {
                params: {
                    pid: $scope.item.PatientId,
                    id: category.Id,
                    eid: category.EncounterId,
                    bid: category.PatientBillId,
                    mbid: category.ModifiedPatientBillId,
                    cid: category.ServiceCategoryId,
                    cname: category.ServiceCategory.ServiceCategoryName,
                    isguarantor: false,
                    issupplementary: issupplementary
                },
                confirmCallback: $scope.IPSupplementaryCategoryDetailsCallback
            });
        };

        $scope.IPSupplementaryCategoryDetailsCallback = function (ModifiedData) {
            $scope.currentcontext.ModifiedPatientBillId = ModifiedData.ModifiedPatientBillId;
            $scope.getModifiedBillInfoById();
        };

        $scope.loadPatientGuarantorsCallback = function (scope, data, options, hasError) {
            if(data && data.PatientGuarantor) {
                $scope.lookup['PatientGuarantor'] = data.PatientGuarantor;
                for (var patientguarantoridx in $scope.lookup.PatientGuarantor) {
                    var patientguarantor = $scope.lookup.PatientGuarantor[patientguarantoridx];
                    if (patientguarantor.Id == $scope.item.GuarantorId) {
                        $scope.item.GuarantorName = patientguarantor.GuarantorName;
                        $scope.currentcontext.InsApprovalAmt = patientguarantor.CreditLimit;
                    }
                }
                if ($scope.item.GuarantorTypeId != 1) {
                    $scope.item.GuarantorDueId = $scope.item.GuarantorId;
                } else {
                    $scope.item.GuarantorDueId = 0;
                }
            }
        };

        $scope.loadPatientGuarantors = function () {
            if ($scope.item.PatientId && $scope.item.PatientId > 0) {
                var inputData = [{
                    Key: "PatientGuarantor",
                    Request: { Params: [{ Key: 1, Value: 2 }, { Key: 2, Value: $scope.item.PatientId }] }
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

        $scope.getModifiedBillInfoCallback = function (scope, res, options, hasError) {
            if (res.Data && res.Data.length > 0) {
                var BillInfo = res.Data[0];
                $scope.isFinalized = true;
                $scope.selectedPatient = BillInfo.Patient;

                $scope.item.PatientId = BillInfo.PatientId;
                $scope.item.EncounterId = BillInfo.EncounterId;
                $scope.item.GuarantorId = BillInfo.GuarantorId;
                $scope.loadPatientGuarantors(BillInfo);

                $scope.item.DoctorId = BillInfo.DoctorId;
                $scope.item.ModifiedPatientBillId = BillInfo.Id;
                $scope.item.ModifiedBillNumber = BillInfo.ModifiedBillNumber;
                $scope.item.ModifiedBillDateTime = BillInfo.ModifiedBillDateTime;
                $scope.item.ModifiedBillAmount = BillInfo.ModifiedBillAmount;

                $scope.item.PatientBillId = BillInfo.PatientBillId;
                $scope.item.AdmissionDate = BillInfo.AdmissionDate;
                $scope.item.DischargeDate = BillInfo.DischargeDate;

                $scope.currentcontext.id = BillInfo.Id;
                $scope.currentcontext.TotalGrossAmount = BillInfo.ModifiedBillAmount + BillInfo.ModifiedBillDiscount;
                $scope.currentcontext.TotalDiscountAmount = BillInfo.ModifiedBillDiscount;
                $scope.currentcontext.TotalNetAmount = BillInfo.ModifiedBillAmount;
                $scope.currentcontext.DiscountModeValue = BillInfo.DiscountModeValue;


                $scope.PatientBillCategorys = [];
                if (BillInfo.ModifiedPatientBillCategorys) {
                    $scope.PatientBillCategorys = BillInfo.ModifiedPatientBillCategorys;
                    $scope.item.SupplementaryGrossAmount = 0;
                    $scope.item.SupplementaryDiscountAmount = 0;
                    $scope.item.SupplementaryNetAmount = 0;
                    $scope.item.GuarantorGrossAmount = 0;
                    $scope.item.GuarantorDiscountAmount = 0;
                    $scope.item.GuarantorNetAmount = 0;

                    $scope.currentcontext.TotalCNAmount = 0;
                    $scope.currentcontext.TotalTDSAmount = 0;
                    $scope.currentcontext.TotalDisAllowedAmount = 0;
                    $scope.currentcontext.TotalDueAmount = 0;
                    $scope.currentcontext.RoundOffValue = 0;

                    for (var idx in $scope.PatientBillCategorys) {
                        var categoryitem = $scope.PatientBillCategorys[idx];
                        $scope.item.SupplementaryGrossAmount = $scope.item.SupplementaryGrossAmount + categoryitem.SupplementaryGrossAmount;
                        $scope.item.SupplementaryDiscountAmount = $scope.item.SupplementaryDiscountAmount + categoryitem.SupplementaryDiscountAmount;
                        $scope.item.SupplementaryNetAmount = $scope.item.SupplementaryNetAmount + categoryitem.SupplementaryNetAmount;
                        $scope.item.GuarantorGrossAmount = $scope.item.GuarantorGrossAmount + categoryitem.GuarantorGrossAmount;
                        $scope.item.GuarantorDiscountAmount = $scope.item.GuarantorDiscountAmount + categoryitem.GuarantorDiscountAmount;
                        $scope.item.GuarantorNetAmount = $scope.item.GuarantorNetAmount + categoryitem.GuarantorNetAmount;

                    }
                }

                $scope.PatientPaymentDetails = [];
                if (BillInfo.ModifiedPatientPaymentDetails) {
                    $scope.PatientPaymentDetails = BillInfo.ModifiedPatientPaymentDetails;
                    $scope.currentcontext.TotalReceivedAmount = 0;
                    for (var pidx in $scope.PatientPaymentDetails) {
                        var paiditem = $scope.PatientPaymentDetails[pidx];
                        $scope.currentcontext.TotalReceivedAmount = $scope.currentcontext.TotalReceivedAmount + paiditem.AmountPaid;
                    }
                }

                $scope.currentcontext.TotalBalanceAmount = 0;
                if ($scope.currentcontext.TotalReceivedAmount < $scope.currentcontext.TotalNetAmount) {
                    $scope.currentcontext.TotalBalanceAmount = $scope.currentcontext.TotalNetAmount - $scope.currentcontext.TotalReceivedAmount;
                }

                $scope.currentcontext.TotalRefundAmount = 0;
                if ($scope.currentcontext.TotalReceivedAmount > $scope.currentcontext.TotalNetAmount) {
                    $scope.currentcontext.TotalRefundAmount = $scope.currentcontext.TotalReceivedAmount - $scope.currentcontext.TotalNetAmount;
                }
                if ($scope.item.EncounterId && $scope.item.EncounterId > 0) {
                    $scope.getEncounter();
                }
            }
        };

        $scope.getModifiedBillInfoById = function () {
            var SearchBillId = $scope.currentcontext.ModifiedPatientBillId;
            if (SearchBillId && SearchBillId > 0) {
                var inputData = {
                    Params: [
                        { Key: 0, Value: SearchBillId }
                    ],
                    PageContext: { PageSize: 100, PageNumber: 1 }
                };
                var options = {
                    action: 'BillModification/ModifiedPatientBills/GetModifiedPatientBillsById',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getModifiedBillInfoCallback
                };
                utl.Http.doAction(options);
            } else { }
        };

        $scope.DiscountModeChange = function () {
            $scope.currentcontext.DiscountModeValue = 0;
            $scope.currentcontext.ModifiedBillDiscount = 0;
            $scope.currentcontext.TotalDiscountAmount = 0;
            $scope.currentcontext.TotalNetAmount = $scope.currentcontext.TotalGrossAmount - $scope.currentcontext.ModifiedBillDiscount;
            $scope.currentcontext.TotalBalanceAmount = 0;
            if ($scope.currentcontext.TotalReceivedAmount < $scope.currentcontext.TotalNetAmount) {
                $scope.currentcontext.TotalBalanceAmount = $scope.currentcontext.TotalNetAmount - $scope.currentcontext.TotalReceivedAmount;
            }

            $scope.currentcontext.TotalRefundAmount = 0;
            if ($scope.currentcontext.TotalReceivedAmount > $scope.currentcontext.TotalNetAmount) {
                $scope.currentcontext.TotalRefundAmount = $scope.currentcontext.TotalReceivedAmount - $scope.currentcontext.TotalNetAmount;
            }
        };

        $scope.DiscountChange = function () {
            if ($scope.currentfilter.DiscountModeId && $scope.currentfilter.DiscountModeId != -1) {
                if ($scope.currentcontext.DiscountModeValue > 0) {
                    if ($scope.currentfilter.DiscountModeId > 0 && $scope.currentfilter.DiscountModeId == 2) {
                        $scope.currentcontext.ModifiedBillDiscount = (parseFloat($scope.currentcontext.DiscountModeValue) / 100 * $scope.currentcontext.TotalGrossAmount);
                    } else if ($scope.currentfilter.DiscountModeId == 1) {
                        $scope.currentcontext.ModifiedBillDiscount = parseFloat($scope.currentcontext.DiscountModeValue);
                    }

                    $scope.currentcontext.TotalDiscountAmount = $scope.currentcontext.ModifiedBillDiscount;
                    $scope.currentcontext.TotalNetAmount = $scope.currentcontext.TotalGrossAmount - $scope.currentcontext.ModifiedBillDiscount;

                    $scope.currentcontext.TotalBalanceAmount = 0;
                    if ($scope.currentcontext.TotalReceivedAmount < $scope.currentcontext.TotalNetAmount) {
                        $scope.currentcontext.TotalBalanceAmount = $scope.currentcontext.TotalNetAmount - $scope.currentcontext.TotalReceivedAmount;
                    }

                    $scope.currentcontext.TotalRefundAmount = 0;
                    if ($scope.currentcontext.TotalReceivedAmount > $scope.currentcontext.TotalNetAmount) {
                        $scope.currentcontext.TotalRefundAmount = $scope.currentcontext.TotalReceivedAmount - $scope.currentcontext.TotalNetAmount;
                    }
                }
            } else {
                $scope.currentcontext.ModifiedBillDiscount = 0;
                utl.Alert.showErrorMsg($translate.instant('billing.opbilling-list.discounttypemessage.lbl'));
            }
        };



        $scope.printPackageDetails = function () {
            var inputData = {
                Id: $scope.currentcontext.eid,
                Data: {
                    isFinalized: $scope.isFinalized,
                    isGuarantor: false,
                    PrintUser: utl.Session.getCurrentUserId()
                }
            };

            if ($scope.EncounterInfo.IsPackageAssigned) {
                var action = 'encounter/EncounterIPPackage/PrintIPPatientPackageDetails';
                var options = {
                    action: action,
                    data: inputData,
                    type: 'post'
                };
                utl.Http.doPrint(options);
            } else {
                utl.Alert.showErrorMsg($translate.instant('billing.receipt-form.packagedetailserror.lbl'));
            }
        };

        $scope.print2 = function () {
            var inputData = {
                Id: $scope.currentcontext.eid,
                Data: {
                    isFinalized: $scope.isFinalized,
                    isGuarantor: false,
                    PrintUser: utl.Session.getCurrentUserId()
                }
            };
            var options = {
                action: 'billing/patientbills/PrintInpatientBills',
                data: inputData,
                type: 'post'
            };

            utl.Http.doPrint(options);
        };

        $scope.print8 = function () {
            var inputData = {
                Id: $scope.currentcontext.eid,
                Data: {
                    isFinalized: $scope.isFinalized,
                    isGuarantor: false,
                    PrintUser: utl.Session.getCurrentUserId()
                }
            };
            var options = {
                action: 'billing/patientbills/PrintDailyInpatientBills',
                data: inputData,
                type: 'post'
            };

            utl.Http.doPrint(options);
        };

        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.eid,
                Data: {
                    isFinalized: $scope.isFinalized,
                    isGuarantor: false,
                    PrintUser: utl.Session.getCurrentUserId()
                }
            };
            var action = 'BillModification/ModifiedPatientBillCategorys/AcutalPrintPatientBillSummary';
            var options = {
                action: action,
                data: inputData,
                type: 'post'
            };

            utl.Http.doPrint(options);
        };

        $scope.custom_sort = function (a, b) {
            return parseInt(a.DisplayOrder) - parseInt(b.DisplayOrder);
        };

        $scope.saveAndApprove = function() {

        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (data === true) {
                $scope.currentcontext.ModifiedPatientBillId = options.data.Data.Header.Id;
            } else {
                $scope.currentcontext.ModifiedPatientBillId = data;
            }
            loadData();
        };

        $scope.getEncounterCallback = function (scope, data, options, hasError) {
            $scope.IsPackageAssigned = data.IsPackageAssigned;
        };

        $scope.getEncounter = function () {
            var options = {
                action: 'Visit/Visit/GetEncounterById',
                data: {
                    Id: $scope.item.EncounterId
                },
                type: 'post',
                onComplete: $scope.getEncounterCallback
            };

            utl.Http.doAction(options);
        };

        function loadData() {
            if ($scope.currentcontext.ModifiedPatientBillId && $scope.currentcontext.ModifiedPatientBillId > 0) {
                $scope.getModifiedBillInfoById();
            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
            });

            loadData();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Ward" },
                {
                    "Key": "Doctor",
                    Request: {
                        Params: [{
                            Key: 2,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        }]
                    }
                },
                { "Key": "DiscountMode" },
                { "Key": "DiscountType" },
                { "Key": "User" },
                { "Key": "PrivateDueApprover" },
                { "Key": "DiscountApprover" },
                { "Key": "ReceiptType" }
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

    IPBillModificationViewController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();
