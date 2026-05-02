(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ClaimReceiptformListController', ClaimReceiptformListController);

    function ClaimReceiptformListController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        var savehitcompleted = 0;
        $scope.currentfilter = {
            encountertypeid: -1,
            patientname: '',
            billdatetime: '',
            billno: ''
        };
        $scope.currentcontext = {
            PaymentTypeId: 2,
            id: !isNaN(parseInt($stateParams.id)) ? parseInt($stateParams.id) : 0,
            totalClaimedBills: 0
        };
        $scope.IsDisabled = false;
        $scope.ClaimableBills = [];
        $scope.item = {
            PaymentDate: utl.Formatter.getCurrentDate(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            GuarantorId: -1,
            GuarantorTypeId: -1,
            GuarantorName: '',
            ToBeClaimAmount: 0,
            ReceivedAmount: 0,
            TDSAmount: 0,
            Disallowed: 0,
            InsurancePaymentStatusId: 0,
            CollectedOn: utl.Formatter.getCurrentDate()
        }

        $scope.GuarantorTypeChange = function (SelectedGuarantorType) {
            $scope.lookup.SelectedGuarantor = [];
            var len = $scope.lookup.Guarantor.length;
            for (var i = 0; i < len; i++) {
                if ($scope.lookup.Guarantor[i].Id > 0) {
                    if (SelectedGuarantorType.Id == $scope.lookup.Guarantor[i].GuarantorTypeId) {
                        $scope.lookup.SelectedGuarantor.push($scope.lookup.Guarantor[i]);
                    }
                } else {
                    $scope.lookup.SelectedGuarantor.push($scope.lookup.Guarantor[i]);
                }
            }

            if ($scope.lookup.SelectedGuarantor && $scope.lookup.SelectedGuarantor.length > 1) {
                $scope.item.GuarantorId = -1;
                $scope.item.GuarantorName = '';
            }
        };


        $scope.loadBillsCallBack = function (scope, res, options, hasError) {
            $scope.ClaimableBills = [];
            if (res.Data.length > 0) {
                res.Data.forEach((v, i) => {
                    var item = {
                        Encounter: v.Encounter.VisitIdentifier,
                        Patient: v.Patient,
                        BillDateTime: v.BillDateTime,
                        BillIdentifier: v.BillNumber,
                        BillAmount: v.BillAmount,
                        BillDiscount: v.BillDiscount,
                        PaidAmount: v.PaidAmount,
                        ToBeClaimAmount: v.OutStandingAmount,
                        PatientBillStatus: v.PatientBillStatus,
                        ReceivedAmount: 0,
                        TDSAmount: 0,
                        Disallowed: 0,
                        PatientBillId: v.Id,
                        PatientId: v.PatientId,
                        VisitIdentifier: v.Encounter.VisitIdentifier,
                        ClaimStatusId: 1,
                        GuarantorName: v.Guarantor.GuarantorName
                    }
                    $scope.ClaimableBills.push(item);
                });
            }
        };

        $scope.loadBills = function () {

            // var guarantorId_ = 1000;
            // var facilityId_ = utl.Session.getCurrentFacilityId();
            // if (!facilityId_) facilityId_ = 1;
            // guarantorId_ *= facilityId_;

            if ($scope.item.GuarantorId != -1 ) {
            // var dateFilter = -1;
            if ($scope.currentfilter.billdatetime != '') {
                var FromDate = $filter('date')($scope.currentfilter.billdatetime, 'yyyy-MM-dd 00:00:00') || null;
                var ToDate = $filter('date')($scope.currentfilter.billdatetime, 'yyyy-MM-dd 23:59:59') || null;
                // dateFilter = [FromDate, ToDate];
            }
            var inputParams = {
                Params: [{
                    Key: 8,
                    Value: $scope.item.FacilityId
                },
                {
                    Key: 9,
                    Value: $scope.item.GuarantorTypeId
                },
                {
                    Key: 17,
                    Value: FromDate
                },
                {
                    Key: 18,
                    Value: ToDate
                },
                {
                    Key: 19,
                    Value: $scope.currentfilter.encountertypeid
                },
                {
                    Key: 61,
                    Value: $scope.item.GuarantorId
                },
                {
                    Key: 11,
                    Value: '0'
                },
                {
                    Key: 2,
                    Value: $scope.currentfilter.billno
                },
                {
                    Key: 13,
                    Value: $scope.currentfilter.patientnamemrn
                },
                {
                    Key: 48,
                    Value: $scope.currentfilter.ipnumber
                }
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };
            if ($scope.currentcontext.id || $scope.currentcontext.id <= 0) {
                var options = {
                    action: 'billing/patientbills/GetPatientBills',
                    data: inputParams,
                    type: 'post',
                    onComplete: $scope.loadBillsCallBack
                };
                utl.Http.doAction(options);
            } else
                $scope.getItem();
            }
            // else {
            //     utl.Alert.showErrorMsg('Please select Guarantor');
            // }
        };

        $scope.getItemCallBack = function (scope, res, options, hasError) {
            if (res.Data.length > 0) {
                $scope.item = res.Data[0];
                $scope.item.PaymentDate = new Date($scope.item.PaymentDate);
                $scope.currentcontext.PaymentTypeId = $scope.item.PaymentTypeId;
                $scope.item.InsurancePaymentDetails.forEach((v, i) => {
                    var item = {
                        Encounter: v.VisitIdentifier,
                        Patient: v.Patient,
                        BillDateTime: v.BillDateTime,
                        BillIdentifier: v.BillIdentifier,
                        BillAmount: v.BillAmount,
                        BillDiscount: 0,
                        PaidAmount: 0,
                        ToBeClaimAmount: v.ToBeClaimAmount,
                        PatientBillStatus: '',
                        ReceivedAmount: v.ReceivedAmount,
                        TDSAmount: v.TDSAmount,
                        Disallowed: v.Disallowed,
                        Id: v.Id,
                        PatientBillId: v.PatientBillId,
                        PatientId: v.PatientId,
                        ClaimStatusId: 2,
                        Comments: v.Comments
                    }
                    $scope.ClaimableBills.push(item);
                });

                $scope.calculateAmount();
                if ($scope.item.InsurancePaymentStatusId == 1 || $scope.item.InsurancePaymentStatusId == 3) {
                    $scope.IsDisabled = true;
                }
                if ($scope.item.InsurancePaymentStatusId == 1) {
                    $scope.item.DisplayInsurancePaymentStatus = 'Draft';
                }
                if ($scope.item.InsurancePaymentStatusId == 2) {
                    $scope.item.DisplayInsurancePaymentStatus = 'Partial';
                }
                if ($scope.item.InsurancePaymentStatusId == 3) {
                    $scope.item.DisplayInsurancePaymentStatus = 'Completed';
                }
                if ($scope.item.InsurancePaymentStatusId == 4) {
                    $scope.item.DisplayInsurancePaymentStatus = 'Cancelled';
                }
                $scope.getAttachments();
            }
        };

        $scope.getItem = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputParams = {
                    Params: [{
                        Key: 0,
                        Value: $scope.currentcontext.id
                    }],
                    PageContext: {
                        PageSize: 10,
                        PageNumber: 1
                    }
                };
                var actionName = 'billing/InsurancePayment/GetInsurancePayments';
                var options = {
                    action: actionName,
                    data: inputParams,
                    type: 'post',
                    onComplete: $scope.getItemCallBack
                };
                utl.Http.doAction(options);
            } else {
                $scope.loadBills();
            }
        };

        $scope.addPayment = function (rowItem) {
            if (rowItem) {
                rowItem.ClaimStatusId = 2;
            }
            $scope.calculateAmount();
        };

        $scope.removePayment = function (rowItem) {
            if (rowItem)
                rowItem.ClaimStatusId = 1;
            $scope.calculateAmount();
        };
        $scope.backToList = function () {
            $state.go('app.claimmanagement-listtab.receivedreceipts');
        }
        $scope.calculateAmount = function () {
            $scope.currentcontext.totalClaimedBills = 0;
            $scope.item.ToBeClaimAmount = 0;
            $scope.item.ReceivedAmount = 0;
            $scope.item.TDSAmount = 0;
            $scope.item.Disallowed = 0;
            $scope.ClaimableBills.forEach((v, i) => {
                if (v.ClaimStatusId == 2) {
                    $scope.currentcontext.totalClaimedBills += 1;
                    $scope.item.ToBeClaimAmount =
                        parseFloat($scope.item.ToBeClaimAmount) +
                        (isNaN(parseFloat(v.ToBeClaimAmount)) ? 0 :
                            parseFloat(v.ToBeClaimAmount));
                    $scope.item.ReceivedAmount =
                        parseFloat($scope.item.ReceivedAmount) +
                        (isNaN(parseFloat(v.ReceivedAmount)) ? 0 :
                            parseFloat(v.ReceivedAmount));
                    $scope.item.TDSAmount =
                        parseFloat($scope.item.TDSAmount) +
                        (isNaN(parseFloat(v.TDSAmount)) ? 0 :
                            parseFloat(v.TDSAmount));
                    $scope.item.Disallowed =
                        parseFloat($scope.item.Disallowed) +
                        (isNaN(parseFloat(v.Disallowed)) ? 0 :
                            parseFloat(v.Disallowed));
                }
            });
        };

        $scope.calculateLineValues = function (claims) {
            var totalLineAmount = 0;
            totalLineAmount = totalLineAmount + (isNaN(parseFloat(claims.ReceivedAmount)) ? 0 : parseFloat(claims.ReceivedAmount)) +
                (isNaN(parseFloat(claims.TDSAmount)) ? 0 : parseFloat(claims.TDSAmount)) +
                (isNaN(parseFloat(claims.Disallowed)) ? 0 : parseFloat(claims.Disallowed));
            if (claims.ToBeClaimAmount < totalLineAmount) {
                utl.Alert.showErrorMsg('Received amount should not exceed out standing amount');
                claims.ReceivedAmount = 0;
                claims.TDSAmount = 0
                claims.Disallowed = 0;
            }
            $scope.calculateAmount();
        };

        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: patientId
                },
                confirmCallback: $scope.getList
            });
        }

        $scope.openattachments = function () {
            if ($scope.currentcontext.id > 0) {
                utl.Modal.open('app.patientattachments', {
                    params: {
                        pid: $scope.currentcontext.id,
                        itemid: $scope.currentcontext.id,
                        objecttypeid: 2
                    },
                    confirmCallback: $scope.getAttachments,
                    cancelCallback: $scope.getAttachments
                });
            } else {
                utl.Alert.showErrorMsg($translate.instant('registration.fullregistration.savepatient-msg.lbl'));
            }
        }

        $scope.getPatientAttachmentsCallback = function (scope, res, options, hasError) {
            $scope.currentcontext.attachmentcount = res.PageContext.TotalRecords;
        }

        $scope.getAttachments = function () {
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.currentcontext.id
                }, {
                    Key: 3,
                    Value: 2
                }],
                PageContext: {
                    PageSize: 1000,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'registration/PatientAttachment/GetPatientAttachments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPatientAttachmentsCallback
            };
            utl.Http.doAction(options);
        }

        $scope.confirm = function () {
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'billing.claimmanagement.confirmmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveandApprove,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            savehitcompleted = 0;
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (typeof (data) == "number") {
                $state.go('app.claimmanagement-listtab.newreceipts', {
                    id: data
                });
            }
        };
        $scope.errorItemCallback = function (scope, data, options, hasError) {
            savehitcompleted = 0;
        };

        $scope.saveItem = function (InsurancePaymentStatusId) {

            if (savehitcompleted == 1) return;

            var details = [];
            $scope.ClaimableBills.forEach((v, i) => {
                if (v.ClaimStatusId == 2) {
                    v.Id = v.Id ? v.Id : 0;
                    details.push(v);
                }
            });

            $scope.item.GuarantorName = $scope.ClaimableBills[0].GuarantorName;
            $scope.item.Details = details;
            $scope.item.CardNumber = '';
            $scope.item.CardDateTime = null;
            $scope.item.CardExpiryDate = null;
            $scope.item.PaymentTypeId = $scope.currentcontext.PaymentTypeId;
            $scope.item.TerminalNoId = $scope.item.TerminalNoId;
            $scope.item.BankId = $scope.currentcontext.PaymentTypeId != 1 ? $scope.item.BankId : -1;
            $scope.item.CardTypeId = $scope.currentcontext.PaymentTypeId == 5 ? $scope.item.CardTypeId : -1;
            $scope.item.ChequeNo = $scope.currentcontext.PaymentTypeId == 2 ? $scope.item.ChequeNo : '';
            $scope.item.ChequeDate = $scope.currentcontext.PaymentTypeId == 2 ? (!$scope.item.ChequeDate ? null : $scope.item.ChequeDate) : null;
            $scope.item.DDNumber = $scope.currentcontext.PaymentTypeId == 3 ? (!$scope.item.DDNumber) ? null : $scope.item.DDNumber : null;
            $scope.item.DDDate = $scope.currentcontext.PaymentTypeId == 3 ? (!$scope.item.DDDate) ? null : $scope.item.DDDate : null;
            $scope.item.WireTransferId = $scope.currentcontext.PaymentTypeId == 4 ? $scope.item.WireTransferId : null;
            $scope.item.WireTransferDate = $scope.currentcontext.PaymentTypeId == 4 ? (!$scope.item.WireTransferDate) ? null : $scope.item.WireTransferDate : null;
            //if ($scope.item.ToBeClaimAmount == ($scope.item.ReceivedAmount + $scope.item.TDSAmount + $scope.item.Disallowed))
            $scope.item.InsurancePaymentStatusId = InsurancePaymentStatusId;
            //else
            //  $scope.item.InsurancePaymentStatusId = 2;
            savehitcompleted = 1;
            var actionName = 'billing/insurancepayment/AddInsurancePayment';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0)
                var actionName = 'billing/insurancepayment/UpdateInsurancePayment';
            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.saveItemCallback,
                onError: $scope.errorItemCallback
            };
            //console.log(options);
            utl.Http.doAction(options);
        }

        /* Security IsValid */
        $scope.securitypisvalid = false;
        $scope.SecurityPINChkCallback = function (SecurityStatus) {
            //console.log(SecurityStatus);
            $scope.securitypisvalid = SecurityStatus.pinstatus;
            $scope.saveandApprove();
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

        $scope.saveandApprove = function () {

            /* Security IsValid */
            $scope.requiredsecuritypin =
                utl.FacilitySetting.getFacilitySettingValue('billing', 'requiredsecuritypin');

            if ($scope.requiredsecuritypin && !$scope.securitypisvalid)
                if (!$scope.securitypincheck())
                    return false;

            /* Security IsValid */

            $scope.saveItem(3);
        };
        $scope.print = function () {

            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'billing/InsurancePayment/PrintInsurancePayments',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            var GuarantorType = $scope.lookup['GuarantorType'];
            var lkGuarantorType = [];
            GuarantorType.forEach((v, i) => {
                if (v.Id != 1)
                    lkGuarantorType.push(v);
            });
            $scope.lookup['GuarantorType'] = lkGuarantorType;
            if ($scope.currentcontext.id > 0)
                $scope.lookup.SelectedGuarantor = $scope.lookup["Guarantor"];
            $scope.getItem();
        };

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "EncounterType"
            },
            {
                "Key": "Bank"
            },
            {
                "Key": "Terminal"
            },
            {
                "Key": "CardType"
            },
            {
                "Key": "Facility"
            },
            {
                "Key": "GuarantorType"
            },
            {
                "Key": "Guarantor",
                Request: {
                    Params: [{
                        Key: 7,
                        Value: utl.Session.getCurrentFacilityId()
                    }]
                }
            },
            {
                "Key": "PaymentType"
            }
            ]
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

    ClaimReceiptformListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();