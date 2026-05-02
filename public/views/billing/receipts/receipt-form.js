(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('receiptFormController', receiptFormController);

    function receiptFormController($scope, $filter, $stateParams, $state, $translate, utl, $interval) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        angular.extend(this, utl.Ctrl.getBaseCtrl({
            $scope: $scope
        }));

        $scope.item = {
            isCompleted: true,
        };
        var savehitcompleted = 0;
        $scope.encounterInfo = {};
        $scope.FillInitialData = function () {
            $scope.item.ReceiptDateTime = new Date();
            $scope.item.CollectedOn = new Date();
            $scope.item.ChequeDate = new Date();
            $scope.item.DDDate = new Date();
            $scope.item.WireTransferDate = new Date();
            $scope.item.facilityid = utl.Session.getCurrentFacilityId();
            $scope.item.CurrencyTypeId = 1;
            $scope.item.IsActive = true;
            $scope.item.ReceiptTypeId = 5;
            $scope.item.PaymentTypeId = 1;
        }
        $scope.FillInitialData();
        $scope.item.PatientId = -1;


        $scope.item.BillNumber = "";
        $scope.item.BillNetAmount = "";
        $scope.item.BillDueAmount = "";
        $scope.item.BillDateTime = "";
        $scope.item.AdjustedAmount = "";
        $scope.item.AuthorizedBy = "";
        $scope.item.WithHeader = true;
        $scope.item.WithoutHeader = false;

        $scope.carddetailsmandatory = 0;
        $scope.carddetailsmandatory =
            utl.FacilitySetting.getFacilitySettingValue('billing', 'carddetailsmandatory');
        $scope.IsMomentPay = 0;
        $scope.IsMomentPay = utl.FacilitySetting.getFacilitySettingValue('billing', 'isMomentPay');
        $scope.currentcontext = {};

        $scope.currentcontext.id = parseInt($stateParams.id);
        if (parseInt($stateParams.pid)) {
            $scope.item.PatientId = $stateParams.pid;
        }
        $scope.getPatientInfo = function (scope, data, options, hasError) {
            $scope.selectedPatient = data;
            $scope.encounter();
            if ($scope.currentcontext.id == 0) {
                $scope.item.isCompleted = false;
            }
        }
        //$scope.currentfilter = { PatientId: -1 };
        $scope.patientChange = function () {
            //console.log($scope.item.PatientId);
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
        }
        //Visibility rules starts
        $scope.applyVisibilityRules = function () {

            if ($scope.currentcontext.id <= 0) {
                $scope.isSaving = false;
                $scope.canShowSaveBtn = true;
                $scope.canShowDeleteBtn = true;
                $scope.canShowBackBtn = true;
                $scope.canShowPrintBtn = false;

                $scope.canShowCancelledBtn = false;
                $scope.canShowSaveandApproveBtn = true;
                $scope.canShowClearBtn = true;
                $scope.canShowAddNewBtn = true;
            } else {
                $scope.canShowSaveBtn = false;
                $scope.canShowDeleteBtn = false;
                //                 $scope.canShowCancelledBtn = false;
                $scope.canShowSaveandApproveBtn = false;
                $scope.canShowClearBtn = true;
                $scope.canShowAddNewBtn = true;

                if ($scope.item.PaymentStatusId == 3) {
                    $scope.isSaving = true;
                    $scope.canShowAddNewBtn = false;
                    $scope.canShowClearBtn = false;
                }


                /*
                ReceiptStatusId
                2 - Draft - Enable delete, saveandapprove
                1 - Completed  Enable Cancelled, saveandapprove
                3 - Cancelled  Enable Cancelled
                PaymentStatusId
                3 - Payment Consumed
                */

                if ($scope.item.ReceiptStatusId) {
                    if ($scope.item.ReceiptStatusId == 1) // Completed && not Bill Consumed
                    {
                        $scope.isSaving = true;
                        $scope.canShowSaveBtn = false;
                        $scope.canShowAddNewBtn = false;
                        $scope.canShowPrintBtn = true;

                        $scope.canShowDeleteBtn = false;
                        $scope.canShowClearBtn = false;
                        // $scope.canShowDeleteBtn = false;
                        $scope.canShowHistoryBtn = false;
                        $scope.canShowattachmentsBtn = false;
                        $scope.canShowBackBtn = true;
                        $scope.canShowcancelBtn = false;
                        $scope.canShowfinanceinfoBtn = false;
                        $scope.canShowSaveandApproveBtn = false;
                    } else if ($scope.item.ReceiptStatusId == 2) // Draft && not Bill Consumed
                    {
                        $scope.canShowBackBtn = true;
                        $scope.canShowPrintBtn = true;

                        $scope.canShowSaveBtn = false;
                        $scope.canShowDeleteBtn = true;
                        $scope.canShowSaveandApproveBtn = true;
                    } else if ($scope.item.ReceiptStatusId == 3) // Cancelled && not Bill Consumed
                    {
                        $scope.isSaving = true;
                        $scope.canShowAddNewBtn = false;
                        $scope.canShowClearBtn = false;
                        $scope.canShowBackBtn = true;
                        $scope.canShowPrintBtn = true;

                        $scope.canShowSaveBtn = false;
                        $scope.canShowDeleteBtn = false;
                        $scope.canShowSaveandApproveBtn = false;
                    }
                }

            }
        }

        if ($scope.currentcontext.id <= 0)
            $scope.applyVisibilityRules();


        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            if (data.AmountAdjusted > 0) {
                $scope.canShowCancelledBtn = false;
            } else {
                $scope.canShowCancelledBtn = true;
            }
            $scope.item.ReceivedUser = '';
            if (data.CreatedUser.Title) {
                $scope.item.ReceivedUser = data.CreatedUser.Title.Description;
            }
            if (data.CreatedUser.FirstName) {
                $scope.item.ReceivedUser += ' ' + data.CreatedUser.FirstName;
            }
            if (data.CreatedUser.LastName) {
                $scope.item.ReceivedUser += ' ' + data.CreatedUser.LastName;
            }
            //console.log($scope.item);
            if (data.ReceiptStatusId == 1)
                $scope.item.isCompleted = true;

            if (data.ReceiptStatusId == 3)
                $scope.item.isCompleted = true;

            $scope.applyVisibilityRules();
            if ($scope.item.PatientBillId > 0) {
                $scope.getBillInfoByBillNumber($scope.item.PatientBillId);
            } else {
                $scope.patientChange();
            }


            $scope.item.FacilityId = utl.Session.getCurrentFacilityId();

        };

        $scope.getItem = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'Billing/PatientPaymentDetails/GetPatientPaymentDetailsById',
                    data: {
                        Id: $scope.currentcontext.id
                    },
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.backToList = function () {
            $state.go('app.receipt-list');
        }
        $scope.outstanding = function () {
            utl.Modal.open('app.outstandingreceipt-list', {
                params: {
                    id: $scope.item.PatientId
                },
                confirmCallback: patientBillPickerCallback
            });
        }
        $scope.getBilldata = function (scope, data, options, hasError) {

            console.log(data);
            $scope.CurrentItem = $scope.item;
            $scope.item = data;
            $scope.item.ReceiptTypeId = 2;
            $scope.item.PatientBillId = $scope.item.Id
            $scope.item.ReceiptDateTime = new Date();
            $scope.item.PaymentTypeId = 1;
            $scope.item.facilityid = utl.Session.getCurrentFacilityId();
            $scope.item.AmountPaid = $scope.item.OutStandingAmount;
            if ($scope.item.AmountPaid = $scope.item.OutStandingAmount

            ) {

            };
            $scope.item.Id = ($scope.CurrentItem.Id || 0);
            $scope.FillInitialData();

        };

        function patientBillPickerCallback(patientbilldata) {
            //console.log(patientbilldata);
            //utl.Alert.showSuccessMsg($translate.instant('Need to Load' + patientbilldata.BillId));
            if (patientbilldata.BillId && patientbilldata.BillId > 0) {
                var options = {
                    action: 'billing/patientbills/GetPatientBillsById',
                    data: {
                        Id: patientbilldata.BillId
                    },
                    type: 'post',
                    onComplete: $scope.getBilldata
                };
                utl.Http.doAction(options);
            }
        }
        $scope.save = function () {
            $scope.item.ReceiptStatusId = 2; // Draft
            $scope.saveItem();
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

            $scope.item.ReceiptStatusId = 1; // Completed
            $scope.saveItem();
        }

        $scope.CanCancellFromBillSettings = function (scope, data, options, hasError) {
            if (data) {
                $scope.item.ReceiptStatusId = 3; // Cancelled
                $scope.saveItem();
            } else {
                utl.Alert.showErrorMsg($translate.instant('billing.opbilling-list.cancelrestriction.lbl'));
            }
        }

        $scope.onCancelConfirmed = function () {



            if ($scope.item.ReceiptDateTime) {
                var actionName = 'SystemSettings/FacilityPreference/ReceiptCancelFromBillSettings';
                var options = {
                    action: actionName,
                    data: {
                        Data: {
                            'receiptdate': $scope.item.ReceiptDateTime,
                            'facilityId': $scope.item.facilityid
                        }
                    },
                    type: 'post',
                    onComplete: $scope.CanCancellFromBillSettings
                };
                utl.Http.doAction(options);
            }
        }

        $scope.Cancel = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'billing.receipt-form.cancelmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                placeholder: $scope.item.ReceiptNumber,
                onSuccessMethod: $scope.onCancelConfirmed,
            };
            utl.Dialog.confirmMessage(confirmOptions, $scope.item.ReceiptNumber);
        }


        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'Billing/PatientPaymentDetails/DeletePatientPaymentDetails',
                data: {
                    Id: deleteId
                },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
            $scope.backToList();
        };
        $scope.saveDeleteRpt = function () {
            utl.Dialog.confirmDelete($scope.onDeleteConfirmed, $scope.currentcontext.id);
            // Deleted
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            savehitcompleted = 0;
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if (typeof (data) == "number") {
                $scope.currentcontext.id = data;
                $scope.originalprint();
            }
            $scope.backToList();
        };

        $scope.patientprofiledetails = function () {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: $scope.item.PatientId
                },
                confirmCallback: $scope.getItem
            });
        }
        $scope.getBillInfoByBillNumber = function (billingid) {
            if (billingid > 0) {
                var inputData = {
                    Params: [{
                        Key: 0,
                        Value: billingid
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
        $scope.originalprint = function () {
            var inputData = {
                Id: $scope.currentcontext.id,
                Data: {
                    Reason: $scope.currentcontext.printreason
                }
            };
            var options = {
                action: 'Billing/PatientPaymentDetails/PrintPatientPaymentDetails',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
        $scope.print = function () {

            var inputData = {
                Id: $scope.currentcontext.id,
                Data: {
                    isprint: false,
                    withHeader: $scope.item.WithHeader,
                    withoutHeader: $scope.item.WithoutHeader,
                }
            };
            var options = {
                action: 'Billing/PatientPaymentDetails/PrintPatientPaymentDetails',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
        $scope.getBillInfoCallback = function (scope, res, options, hasError) {
            $scope.PatientBillInfo = res.Data || [];
            if ($scope.PatientBillInfo && $scope.PatientBillInfo.length > 0) {
                $scope.PatientBillInfo.forEach(patientbills => {
                    $scope.item.BillNumber = patientbills.BillNumber;
                    $scope.item.BillAmount = patientbills.BillAmount;
                    $scope.item.OutStandingAmount = patientbills.OutStandingAmount;
                    $scope.item.BillDateTime = $filter('date')(patientbills.BillDateTime, 'dd-MM-yyyy HH:mm:ss');
                    $scope.item.Amount = patientbills.Amount;
                    $scope.item.PaidAmount = patientbills.PaidAmount;

                });
            }
            $scope.patientChange();
        };

        $scope.addnew = function () {
            $scope.currentcontext.id = 0
            $scope.item = {
                PaymentTypeId: 1,
                ReceiptTypeId: 5,
                PatientId: -1,
                ReceiptDateTime: new Date(),

            };

            $scope.applyVisibilityRules();
        }

        function receiptPicker(receiptData) {

            $state.go('app.receipt-form', {
                id: receiptData.rid
            });
        }

        $scope.pickPatient = function () {
            utl.Modal.open('app.receiptpicker', {
                params: {},
                confirmCallback: receiptPicker
            });
        }


        $scope.getVisitIndentifier = function (scope, data, options, hasError) {
            if (data && data.Data.length > 0) {
                $scope.encounterInfo = data.Data[0];
                $scope.item.EncounterId = $scope.encounterInfo.Id;
            }
        };
        $scope.encounter = function () {
            var inputData = {
                Params: [{
                    Key: 52,
                    Value: true
                },
                {
                    Key: 4,
                    Value: $scope.item.PatientId
                },

                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getVisitIndentifier
            };

            utl.Http.doAction(options);
        };

        // $scope.clear = function () {
        //     $scope.isSaving = false;
        //     $scope.item.ReceiptDateTime = new Date();
        //     $scope.item.CollectedOn = new Date();
        //     $scope.item.ChequeDate = new Date();
        //     $scope.item.DDDate = new Date();
        //     $scope.item.WireTransferDate = new Date();
        //     $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
        //     $scope.item.CurrencyTypeId = 1;
        //     $scope.item.IsActive = true;
        //     $scope.item.ReceiptTypeId = 1;
        //     $scope.item.PaymentTypeId = 1;

        //     $scope.applyVisibilityRules();
        // }

        $scope.clear = function () {

            if ($scope.currentcontext.id == 0) {
                $scope.item = {
                    PaymentTypeId: 1,
                    ReceiptTypeId: 1,
                    PatientId: -1,
                    ReceiptDateTime: new Date(),

                };

            }



            $scope.applyVisibilityRules();
        }
        $scope.openAttachments = function () {
            utl.Modal.open('app.patientattachments', {
                params: {
                    pid: 0,
                    itemid: 0
                },
                confirmCallback: $scope.initLookup,
                cancelCallback: $scope.initLookup
            });
        }
        $scope.findReceipt = function () {
            utl.Modal.open('app.findreceipt-list', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.getList
            });
        }
        $scope.receiptHistory = function () {
            utl.Modal.open('app.receipthistory-list', {
                params: {
                    id: 0
                },
                confirmCallback: $scope.getList
            });
        }

        // $scope.Paymodechange = function () {

        //         $scope.item.BankId = null;
        //         $scope.item.ChequeNo = null;
        //         $scope.item.DDNumber = null;
        //         $scope.item.ChequeDate = null;
        //         $scope.item.CollectedOn = null;
        //         $scope.item.DDDate = null;
        //         $scope.item.WireTransferId = null;
        //         $scope.item.WireTransferDate = null;
        //         $scope.item.CardTypeId = null;
        //         $scope.item.TerminalNoId = null;
        //         $scope.item.CardNumber = null;
        //         $scope.item.AuthorizedCode = null;


        //         if ($scope.item.PaymentTypeId == 2) // Cheque
        //         {
        //             $scope.item.DDNumber = null;
        //             $scope.item.DDDate = null;
        //             $scope.item.WireTransferId = null;
        //             $scope.item.WireTransferDate = null;
        //             $scope.item.CardTypeId = null;
        //             $scope.item.TerminalNoId = null;
        //             $scope.item.CardNumber = null;
        //             $scope.item.AuthorizedCode = null;
        //         }
        //         else if ($scope.item.PaymentTypeId == 3) // Demand Draft
        //         {
        //             $scope.item.ChequeNo = null;
        //             $scope.item.ChequeDate = null;
        //             $scope.item.WireTransferId = null;
        //             $scope.item.WireTransferDate = null;
        //             $scope.item.CardTypeId = null;
        //             $scope.item.TerminalNoId = null;
        //             $scope.item.CardNumber = null;
        //             $scope.item.AuthorizedCode = null;
        //         }
        //         else if ($scope.item.PaymentTypeId == 4) // Wired Transfer
        //         {
        //             $scope.item.ChequeNo = null;
        //             $scope.item.DDNumber = null;
        //             $scope.item.ChequeDate = null;
        //             $scope.item.DDDate = null;
        //             $scope.item.CardTypeId = null;
        //             $scope.item.TerminalNoId = null;
        //             $scope.item.CardNumber = null;
        //             $scope.item.AuthorizedCode = null;

        //         }
        //         else if ($scope.item.PaymentTypeId == 5) //  Card
        //         {
        //             $scope.item.ChequeNo = null;
        //             $scope.item.DDNumber = null;
        //             $scope.item.ChequeDate = null;
        //             $scope.item.DDDate = null;
        //             $scope.item.WireTransferId = null;
        //             $scope.item.WireTransferDate = null;
        //         }

        //     }

        $scope.saveItem = function () {

            if (savehitcompleted == 1) return;

            if ($scope.item.PatientId <= 0) {
                utl.Alert.showSuccessMsg('Select the Patient');
                return;
            }

            if ($scope.carddetailsmandatory == 1) {
                if ($scope.currentcontext.PaymentTypeId == 5 || $scope.currentcontext.PaymentTypeId == 6 ||
                    $scope.currentcontext.PaymentTypeId == 11) {
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
                        utl.Alert.showErrorMsg($translate.instant('Please Enter AuthCode!...'));
                        return;
                    }
                }
            }

            if ($scope.item.PaymentTypeId <= 0) {
                utl.Alert.showSuccessMsg('Select the Payment Mode');
                return;
            }

            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.FacilityId = utl.Session.getCurrentFacilityId();
            $scope.item.OrganizationId = utl.Session.getCurrentOrgId();
            $scope.item.AmountPaid = parseFloat($scope.item.AmountPaid);
            if (!$scope.item.AgreementDiscountAmt) {
                $scope.item.AgreementDiscountAmt = 0;
            }
            if ($scope.item.ReceiptStatusId == 1) {
                $scope.item.ReceiptGeneratedById = utl.Session.getCurrentUserId();
            }
            var actionName = 'Billing/PatientPaymentDetails/AddPatientPaymentDetails';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'Billing/PatientPaymentDetails/UpdatePatientPaymentDetails';
            }
            savehitcompleted = 1;



            var options = {
                action: actionName,
                data: {
                    Data: $scope.item
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "ReceiptType"
            },
            {
                "Key": "Facility"
            },
            {
                "Key": "PaymentType"
            },
            {
                "Key": "EncounterType"
            },
            {
                "Key": "Department"
            },
            // { "Key": "ServiceItem" },
            {
                "Key": "PackageName"
            },
            {
                Key: 'Doctor',
                Request: {
                    Params: [{
                        Key: 5,
                        Value: 2
                    }]

                }
            },
            {
                "Key": "GuarantorType"
            },
            {
                'Key': 'Bank'
            },
            {
                'Key': 'AdvanceNo'
            },
            {
                'Key': 'CardType'
            },
            {
                'Key': 'Terminal'
            },
            {
                'Key': 'CurrencyType'
            },
            {
                'Key': 'DueBillNo'
            },
            ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }
        $scope.checkHeader = function (iVal) {
            if (iVal == 1) {
                $scope.item.WithoutHeader = false;
            }
            if (iVal == 2) {
                $scope.item.WithHeader = false;
            }
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
        // $scope.countdown = 60;
        $scope.setupPaymentDetails = function () {
            if ($scope.selectedPatient) {
                const patientName = $scope.selectedPatient.FirstName;
                const uhid = $scope.selectedPatient.MRN;
                const chargerate = parseFloat($scope.item.AmountPaid).toFixed(2);
                // const chargerate = '1';
                const email = '';
                const mobileno = $scope.selectedPatient.Mobile;
                $scope.processingid = generateProcessId();
                const uname = utl.Session.getCurrentUserId() + '-' + utl.Session.getCurrentUserName();
                var paymode = '';
                if ($scope.item.PaymentTypeId == 11) {
                    paymode = "cards-upi";
                } else if ($scope.item.PaymentTypeId == 5) {
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
            }
        }
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
        $scope.$watchGroup(["item.AmountPaid", "item.PaymentTypeId"], function (newValues, oldValues) {
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
            if ($scope.item.PaymentTypeId == 11) {
                $scope.countdown = 180;
            } else if ($scope.item.PaymentTypeId == 5) {
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
                    $scope.item.UPIRefNumber = res.body.response_token.transaction_id;
                } else {
                    $scope.item.AuthorizedCode = res.body.response_token.transaction_id;
                }
                $scope.saveStatus(res.body.response_token);
                $scope.saveItem();
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
            $scope.requiredsecuritypin =
                utl.FacilitySetting.getFacilitySettingValue('billing', 'requiredsecuritypin');

            if ($scope.requiredsecuritypin && !$scope.securitypisvalid)
                if (!$scope.securitypincheck())
                    return false;

            $scope.item.ReceiptStatusId = 1;
            if (savehitcompleted == 1) return;

            if ($scope.item.PatientId <= 0) {
                utl.Alert.showSuccessMsg('Select the Patient');
                return;
            }

            if ($scope.carddetailsmandatory == 1) {
                if ($scope.currentcontext.PaymentTypeId == 5 || $scope.currentcontext.PaymentTypeId == 6 ||
                    $scope.currentcontext.PaymentTypeId == 11) {
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
                        utl.Alert.showErrorMsg($translate.instant('Please Enter AuthCode!...'));
                        return;
                    }
                }
            }

            if ($scope.item.PaymentTypeId <= 0) {
                utl.Alert.showSuccessMsg('Select the Payment Mode');
                return;
            }

            if (!utl.Validator.validate($scope)) {
                return;
            }
            return true;
        };
    }

    receiptFormController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$interval'];

})();