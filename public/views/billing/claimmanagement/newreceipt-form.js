(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('newReceiptformListController', newReceiptformListController);

    function newReceiptformListController($scope, $stateParams, $state, $translate, utl, $filter, $interval) {
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
        $scope.IsMomentPay = 0;
        $scope.IsMomentPay = utl.FacilitySetting.getFacilitySettingValue('billing', 'isMomentPay');

        $scope.addNew = function () {
            $state.go('app.claimmanagement-listtab.newreceipts', {
                id: 0
            });
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
                // if (item.RemarkType) {
                //     item.RemarkType = item.RemarkType.Description;
                // }
            }
        }

        $scope.loadBillsCallBack = function (scope, res, options, hasError) {
            $scope.ClaimableBills = [];
            if (res.Data.length > 0) {
                res.Data.forEach((v, i) => {
                    console.log(v);
                    var item = {
                        Encounter: (v.Encounter) ? v.Encounter.VisitIdentifier : '',
                        Patient: v.Patient,
                        BillDateTime: v.BillDateTime,
                        BillIdentifier: v.BillNumber,
                        BillAmount: v.BillAmount,
                        BillDiscount: v.BillDiscount,
                        AgreementDiscountAmt: v.AgreementDiscountAmt,
                        PaidAmount: v.PaidAmount,
                        ToBeClaimAmount: v.OutStandingAmount,
                        PatientBillStatus: v.PatientBillStatus,
                        Remarks: '',
                        ReceivedAmount: 0,
                        TDSAmount: 0,
                        Disallowed: 0,
                        PatientBillId: v.Id,
                        PatientId: v.PatientId,
                        VisitIdentifier: (v.Encounter) ? v.Encounter.VisitIdentifier : '',
                        ClaimStatusId: 1,
                        GuarantorName: v.GuarantorMaster.GuarantorName
                    }
                    $scope.ClaimableBills.push(item);
                });
            }
            $scope.refreshReactProps();
        };

        $scope.loadBills = function () {

            // var guarantorId_ = 1000;
            // var facilityId_ = utl.Session.getCurrentFacilityId();
            // if (!facilityId_) facilityId_ = 1;
            // guarantorId_ *= facilityId_;

            if ($scope.item.GuarantorId != -1) {
                // var dateFilter = -1;
                // if ($scope.currentfilter.billdatetime != '') {
                //     var FromDate = $filter('date')($scope.currentfilter.billdatetime, 'yyyy-MM-dd 00:00:00') || null;
                //     var ToDate = $filter('date')($scope.currentfilter.billdatetime, 'yyyy-MM-dd 23:59:59') || null;
                //     // dateFilter = [FromDate, ToDate];
                // }
                var FromDate = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
                var ToDate = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;
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
                    },
                    {
                        Key: 4,
                        Value: 3
                    },
                    {
                        Key: 33,
                        Value: [1, 2, 4, 5]
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
                        AgreementDiscountAmt: v.AgreementDiscountAmt,
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
                        Comments: v.Comments,
                        Remarks: v.Remarks
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
            $scope.refreshReactProps();
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
            let selectedPatients = $scope.ClaimableBills.filter(v => v.ClaimStatusId == 2);
            $scope.selectedPayPatient = selectedPatients.length > 0 ? selectedPatients[0] : null;
            console.log("Selected Pay Patient:", $scope.selectedPayPatient);
            $scope.calculateAmount();
            $scope.refreshReactProps();
        };

        $scope.removePayment = function (rowItem) {
            if (rowItem) {
                rowItem.ClaimStatusId = 1;
            }
            let selectedPatients = $scope.ClaimableBills.filter(v => v.ClaimStatusId == 2);
            $scope.selectedPayPatient = selectedPatients.length > 0 ? selectedPatients[0] : null;

            $scope.calculateAmount();
            $scope.refreshReactProps();
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

        $scope.GetGuarantorCallback = function (scope, data, options, hasError) {
            $scope.lookup["Guarantor"] = data["Guarantor"];
            $scope.refreshReactProps();
        };

        $scope.getGuarantor = function () {
            $scope.item.GuarantorId = -1;
            var inputData = [{
                "Key": "Guarantor",
                Request: {
                    Params: [{
                        Key: 2,
                        Value: $scope.item.GuarantorTypeId
                    },
                    {
                        Key: 7,
                        Value: [-1, utl.Session.getCurrentFacilityId()]
                    }
                    ]
                }
            },
            ];
            $scope.initLookupCall(inputData, $scope.GetGuarantorCallback);
        }

        $scope.initLookupCall = function (inputData, callback) {
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: callback
            };
            utl.Http.doAction(options);
        };


        $scope.calculateLineValues = function (claims) {
            var totalLineAmount = 0;
            // totalLineAmount = totalLineAmount + (isNaN(parseFloat(claims.ReceivedAmount)) ? 0 : parseFloat(claims.ReceivedAmount)) +
            //     (isNaN(parseFloat(claims.TDSAmount)) ? 0 : parseFloat(claims.TDSAmount)) +
            //     (isNaN(parseFloat(claims.Disallowed)) ? 0 : parseFloat(claims.Disallowed)) - (isNaN(parseFloat(claims.AgreementDiscountAmt)) ? 0 : parseFloat(claims.AgreementDiscountAmt));
            totalLineAmount = totalLineAmount + (isNaN(parseFloat(claims.ReceivedAmount)) ? 0 : parseFloat(claims.ReceivedAmount)) +
                (isNaN(parseFloat(claims.TDSAmount)) ? 0 : parseFloat(claims.TDSAmount)) +
                (isNaN(parseFloat(claims.Disallowed)) ? 0 : parseFloat(claims.Disallowed)) + (isNaN(parseFloat(claims.AgreementDiscountAmt)) ? 0 : parseFloat(claims.AgreementDiscountAmt));
            if (claims.ToBeClaimAmount < totalLineAmount) {
                utl.Alert.showErrorMsg('Received amount should not exceed out standing amount');
                claims.ReceivedAmount = 0;
                claims.TDSAmount = 0
                claims.Disallowed = 0;
                claims.AgreementDiscountAmt = 0;
            }
            $scope.calculateAmount();
            $scope.refreshReactProps();
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
            // $scope.item.WireTransferId = $scope.currentcontext.PaymentTypeId == 4 ? $scope.item.WireTransferId : null;
            $scope.item.WireTransferId = ($scope.currentcontext.PaymentTypeId == 4 || $scope.currentcontext.PaymentTypeId == 11) ? $scope.item.WireTransferId : null;
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

            if ($scope.item.ReceivedAmount == 0 && $scope.item.TDSAmount == 0 && $scope.item.Disallowed == 0) {
                utl.Alert.showErrorMsg('Please Check the Amount Entered');
                return false;
            }

            // if ($scope.item.ReceivedAmount > 0 || $scope.item.TDSAmount > 0) {
            //     if (!$scope.item.BankId || $scope.item.BankId <= 0) {
            //         utl.Alert.showErrorMsg('Please Select Bank ');
            //         return false;
            //     }

            // } else {
                // if ($scope.item.ReceivedAmount == 0 && $scope.item.TDSAmount == 0 && $scope.item.Disallowed > 0) {
                //     utl.Alert.showErrorMsg('Please Check the Amount Entered');
                //     return false;
                // }
            // }
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
            $scope.refreshReactProps();
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
                        Value: [-1, utl.Session.getCurrentFacilityId()]
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

        $scope.refreshReactProps = function () {
            $scope.lookup = $scope.lookup || {};
            ($scope.ClaimableBills || []).forEach(function (b, idx) { b._idx = idx; });
            $scope.reactProps = {
                isDisabled: $scope.IsDisabled,
                guarantorTypeId: $scope.item.GuarantorTypeId,
                guarantorTypeOptions: $scope.lookup.GuarantorType || [],
                encounterTypeId: $scope.currentfilter.encountertypeid,
                encounterTypeOptions: $scope.lookup.EncounterType || [],
                paymentTypeId: $scope.currentcontext.PaymentTypeId,
                paymentTypeOptions: $scope.lookup.PaymentType || [],
                bankId: $scope.item.BankId,
                bankOptions: $scope.lookup.Bank || [],
                terminalId: $scope.item.TerminalNoId,
                terminalOptions: $scope.lookup.Terminal || [],
                cardTypeId: $scope.item.CardTypeId,
                cardTypeOptions: $scope.lookup.CardType || [],
                claimableBills: $scope.ClaimableBills || []
            };
        };

        $scope.handleReactAction = function (actionType, payload) {
            switch (actionType) {
                case 'guarantorTypeChange':
                    $scope.item.GuarantorTypeId = payload.id;
                    $scope.getGuarantor();
                    break;
                case 'encounterTypeChange':
                    $scope.currentfilter.encountertypeid = payload.id;
                    $scope.loadBills();
                    break;
                case 'paymentTypeChange':
                    $scope.currentcontext.PaymentTypeId = payload.id;
                    break;
                case 'bankChange':
                    $scope.item.BankId = payload.id;
                    break;
                case 'terminalChange':
                    $scope.item.TerminalNoId = payload.id;
                    break;
                case 'cardTypeChange':
                    $scope.item.CardTypeId = payload.id;
                    break;
                case 'addPayment':
                    $scope.ClaimableBills.forEach(function (b) {
                        if (b._idx === payload.idx) $scope.addPayment(b);
                    });
                    break;
                case 'removePayment':
                    $scope.ClaimableBills.forEach(function (b) {
                        if (b._idx === payload.idx) $scope.removePayment(b);
                    });
                    break;
                case 'lineFieldChange':
                    $scope.ClaimableBills.forEach(function (b) {
                        if (b._idx === payload.idx) {
                            b[payload.field] = payload.value;
                            if (payload.recalc) $scope.calculateLineValues(b);
                        }
                    });
                    break;
                case 'patientInfo':
                    $scope.patientprofiledetails(payload.patientId);
                    break;
            }
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.initLookup();

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
        $scope.setupPaymentDetails = function () {
            const patientName = $scope.selectedPayPatient.Patient.FirstName + ' ' + ($scope.selectedPayPatient.Patient.LastName || '');
            const uhid = $scope.selectedPayPatient.Patient.MRN;
            const chargerate = parseFloat($scope.item.ReceivedAmount).toFixed(2);
            // const chargerate = '1';
            const email = '';
            $scope.processingid = generateProcessId();
            const mobileno =$scope.selectedPayPatient.Patient.Mobile;
            const uname = utl.Session.getCurrentUserId() + '-' + utl.Session.getCurrentUserName();
            var paymode = '';
            if ($scope.currentcontext.PaymentTypeId == 11) {
                paymode = "cards-upi";
            } else if ($scope.currentcontext.PaymentTypeId == 5) {
                paymode = "cards-swipe";
            }
            const callback_url = "https://hosmat.momentpay.live/ma/ariticpayment/callback";
            const redirect_url = "";

            const myVal = '{"credentials":{"user":"hosmat_hospital","key":"cozQP6vmJNbcraqWlnLpzNJIiiIC5H4EIlHNkYcm0vBy0WNbs8","version":"HISV2"},"cashier_id": "' + uname + '", "customer_details": [{"customer_name": "' +
                patientName + '", "customer_id": "' + uhid + '", "payment_amount": "' + chargerate + '", "customer_email": "' + email + '","customer_phone": "' +
                mobileno + '"}], "processing_id": "' + $scope.processingid + '","paymode": "' + paymode + '","payment_fill":"pre_full","transaction_location":"Hosmat Hospital","callback_url": "' + callback_url + '","redirect_url": "' + redirect_url + '"}';

            $('#txttoken').val(myVal);
            $('#mid').val('KkZma9ph');
            $('#check_sum_hash').val('ZjMzNzk0MTFmZjE3YTA4YjlkNzI2NGM3NTBmMWFhMWMxNzAzOWY5N2ViNmYzYTA3ZTc5YzEzYTJjZGZlZDExYQ==');
        };
        $scope.$watchGroup(["item.ReceivedAmount", "currentcontext.PaymentTypeId", "selectedPayPatient.Patient.MRN"],
            function (newValues, oldValues) {
                const [newReceiptAmt, newPaymentTypeId, newUhid] = newValues;
                const [oldReceiptAmt, oldPaymentTypeId, oldUhid] = oldValues;

                if (newReceiptAmt > 0 &&
                    (newReceiptAmt !== oldReceiptAmt || newPaymentTypeId !== oldPaymentTypeId || newUhid !== oldUhid)) {
                    $scope.setupPaymentDetails();
                }
            }
        );
        // $(document).ready(function () {
            $("#paynow").click(function () {
                if (!$scope.ApproveFromPayment()) {
                    return;
                }
                $scope.setupPaymentDetails();
                var width = 800;
                var height = 700;
                var left = (screen.width - width) / 2;
                var top = (screen.height - height) / 2;
                var popupWindow = window.open("", "PaymentWindow", `width=${width},height=${height},top=${top},left=${left}`);

                if (popupWindow) {
                    $("#iframeForm").attr("target", "PaymentWindow");
                    $("#iframeForm").submit();
                    startPolling($scope.processingid);

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
        // });
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
            var ResponseCode = res.body.response_token.response_code;
            if (ResponseCode == '1200') {
                console.log('Transaction successful.');
                utl.Alert.showSuccessMsg($translate.instant('Transaction successful.'));
                stopPolling();
                $scope.item.ReferenceNumber = res.body.response_token.processing_id;
                if (res.body.response_token.payment_method == 'UPI') {
                    $scope.item.WireTransferId = res.body.response_token.transaction_id;
                } else {
                    $scope.item.AuthorizedCode = res.body.response_token.transaction_id;
                }
                $scope.saveStatus(res.body.response_token);
                $scope.saveItem(3);
            } else {
                console.log('Transaction still pending...');
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
        $scope.saveStatus = function (req) {
            var inputData = {
                ResponseCode: req.response_code || null,
                ResponseMessage: req.response_message || null,
                ProcessingId: req.processing_id || null,
                Amount: req.customer_details? parseFloat(req.customer_details.amount) : null,
                TransactionId: req.transaction_id || null,
                PayMode: req.payment_method || null,
                RrnId: req.payment_response.rrn_id || null,
                CardNumber: req.payment_response.cardNumber || null,
                CardHolderName: req.payment_response.cardHolderName || null,
                CardType: req.payment_response.cardType || null,
                ApprovalCode: req.payment_response.approval_code || null,
                CustomerId: req.customer_details.customer_number,
                TransactionAmount: req.customer_details? parseFloat(req.customer_details.amount) : null,
            };

            var options = {
                action: 'Billing/PosMomentLog/AddPosMomentLog',
                data: { Data: inputData },
                type: 'post',
                onComplete: $scope.saveStatusCallbackPOS
            };

            utl.Http.doAction(options);
        };
        $scope.saveStatusCallbackPOS  = function (scope, data, options, hasError) {
            if (!hasError) {
                utl.Alert.showSuccessMsg($translate.instant('Transaction Satus Saved'));
            }
        };
        $scope.ApproveFromPayment = function () {
            if ($scope.item.ReceivedAmount == 0 && $scope.item.TDSAmount == 0 && $scope.item.Disallowed == 0) {
                utl.Alert.showErrorMsg('Please Check the Amount Entered');
                return false;
            }
            return true;
        };
    }

    newReceiptformListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$interval'];

})();