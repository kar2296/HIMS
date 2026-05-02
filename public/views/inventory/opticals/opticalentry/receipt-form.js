(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('OpticalreceiptFormController', OpticalreceiptFormController);

    function OpticalreceiptFormController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.item = {
            isCompleted: true,
        };
        var savehitcompleted = 0;
        $scope.encounterInfo = {};
        $scope.currentcontext = {};
        $scope.currentcontext.id = $stateParams.Id;
        $scope.currentcontext.pid = $stateParams.pid;


        $scope.FillInitialData = function () {
            $scope.item.ReceiptDateTime = new Date();
            $scope.item.CollectedOn = new Date();
            $scope.item.ChequeDate = new Date();
            $scope.item.DDDate = new Date();
            $scope.item.WireTransferDate = new Date();
            $scope.item.facilityid = utl.Session.getCurrentFacilityId();
            $scope.item.CurrencyTypeId = 1;
            $scope.item.IsActive = true;
            $scope.item.ReceiptTypeId = 1;
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


        $scope.currentcontext = {};

        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.getPatientInfo = function (scope, data, options, hasError) {
            $scope.selectedPatient = data;
            $scope.encounter()
            if ($scope.currentcontext.id == 0) { $scope.item.isCompleted = false; }
        }
        //$scope.currentfilter = { PatientId: -1 };
        $scope.patientChange = function () {
            //console.log($scope.item.PatientId);
            if ($scope.item.PatientId > 0) {
                var options = {
                    action: 'registration/patient/GetPatientById',
                    data: { Id: $scope.item.PatientId },
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
            $scope.getBillInfoByBillNumber($scope.item.PatientBillId);
            $scope.patientChange()
            $scope.item.facilityid = utl.Session.getCurrentFacilityId();

        };

        $scope.getItem = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var options = {
                    action: 'Billing/PatientPaymentDetails/GetPatientPaymentDetailsById',
                    data: { Id: $scope.currentcontext.id },
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
                params: { id: $scope.item.PatientId },
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
                    data: { Id: patientbilldata.BillId },
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
                    data: { Data: { 'receiptdate': $scope.item.ReceiptDateTime, 'facilityId': $scope.item.facilityid } },
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
                data: { Id: deleteId },
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
                $scope.print();
            }
            $scope.backToList();
        };

        $scope.patientprofiledetails = function () {
            utl.Modal.open('registration.patientprofile', {
                params: { pid: $scope.item.PatientId },
                confirmCallback: $scope.getItem
            });
        }
        $scope.getBillInfoByBillNumber = function (billingid) {
            if (billingid > 0) {
                var inputData = {
                    Params: [
                        { Key: 0, Value: billingid }
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
                Id: $scope.currentcontext.id
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
        };

        $scope.addnew = function () {
            $scope.currentcontext.id = 0
            $scope.item = {
                PaymentTypeId: 1,
                ReceiptTypeId: 1,
                PatientId: -1,
                ReceiptDateTime: new Date(),

            };

            $scope.applyVisibilityRules();
        }

        function receiptPicker(receiptData) {

            $state.go('app.receipt-form', { id: receiptData.rid });
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
                Params: [
                    { Key: 3, Value: 0 },
                    { Key: 4, Value: $scope.item.PatientId },

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
                params: { pid: 0, itemid: 0 },
                confirmCallback: $scope.initLookup,
                cancelCallback: $scope.initLookup
            });
        }
        $scope.findReceipt = function () {
            utl.Modal.open('app.findreceipt-list', {
                params: { id: 0 },
                confirmCallback: $scope.getList
            });
        }
        $scope.receiptHistory = function () {
            utl.Modal.open('app.receipthistory-list', {
                params: { id: 0 },
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
            var actionName = 'Billing/PatientPaymentDetails/AddPatientPaymentDetails';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'Billing/PatientPaymentDetails/UpdatePatientPaymentDetails';
            }
            savehitcompleted = 1;

            if ($scope.item.ReceiptStatusId == 1) {
                $scope.item.ReceiptGeneratedById = utl.Session.getCurrentUserId();
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
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
            var inputData = [
                { "Key": "ReceiptType" },
                { "Key": "Facility" },
                { "Key": "PaymentType" },
                { "Key": "EncounterType" },
                { "Key": "Department" },
                // { "Key": "ServiceItem" },
                { "Key": "PackageName" },
                {
                    Key: 'Doctor',
                    Request: {
                        Params: [{ Key: 5, Value: 2 }]

                    }
                },
                { "Key": "GuarantorType" },
                { 'Key': 'Bank' },
                { 'Key': 'AdvanceNo' },
                { 'Key': 'CardType' },
                { 'Key': 'CurrencyType' },
                { 'Key': 'DueBillNo' },
                { "Key": "Encounter" } // become slow put text box
            ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.initLookup();
    }

    OpticalreceiptFormController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();