(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('creditnoteFormController', creditnoteFormController);

    function creditnoteFormController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));
        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.CreditNoteDetails = [];
        $scope.item = {
            IsActive: true,
            isCompleted: false,
            FacilityId: utl.Session.getCurrentFacilityId()

        };
        $scope.iscredited = false;
        $scope.getPatientInfo = function (scope, data, options, hasError) {
            $scope.selectedPatient = data;
        }

        $scope.patientChange = function () {

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

        $scope.getDetailCallback = function (scope, data, options, hasError) {

            var Billdetails = data.Data;
            for (var idx in Billdetails) {
                $scope.CreditNoteDetails[idx] = {};
                $scope.CreditNoteDetails[idx].CNCompleted = Billdetails[idx].NetAmount == Billdetails[idx].CNAmount ? true : false;
                $scope.CreditNoteDetails[idx].Code = Billdetails[idx].ServiceItem.ItemCode;
                $scope.CreditNoteDetails[idx].ServiceName = Billdetails[idx].ServiceName;
                $scope.CreditNoteDetails[idx].ServiceId = Billdetails[idx].ServiceId;
                $scope.CreditNoteDetails[idx].ServiceAmount = Billdetails[idx].GrossAmount;
                $scope.CreditNoteDetails[idx].DepartmentID = Billdetails[idx].DepartmentId;
                $scope.CreditNoteDetails[idx].Discount = isNaN(parseFloat(Billdetails[idx].DiscountAmount)) ? 0 : parseFloat(Billdetails[idx].DiscountAmount);// Billdetails[idx].DiscountAmount;
                $scope.CreditNoteDetails[idx].NetAmount = isNaN(parseFloat(Billdetails[idx].NetAmount)) ? 0 : parseFloat(Billdetails[idx].NetAmount);// Billdetails[idx].NetAmount;
                $scope.CreditNoteDetails[idx].CreditNoteDetailDateTime = utl.Formatter.getCurrentDate();
                $scope.CreditNoteDetails[idx].Status = Billdetails[idx].Status;
                $scope.CreditNoteDetails[idx].PatientBillDetailId = Billdetails[idx].Id;
                $scope.CreditNoteDetails[idx].CNAmount = isNaN(parseFloat(Billdetails[idx].CNAmount)) ? 0 : parseFloat(Billdetails[idx].CNAmount);
                var GrossAmount = isNaN(parseFloat(Billdetails[idx].GrossAmount)) ? 0 : parseFloat(Billdetails[idx].GrossAmount);
                var DiscountAmount = isNaN(parseFloat(Billdetails[idx].DiscountAmount)) ? 0 : parseFloat(Billdetails[idx].DiscountAmount);
                var CNAmount = isNaN(parseFloat(Billdetails[idx].CNAmount)) ? 0 : parseFloat(Billdetails[idx].CNAmount);
                $scope.CreditNoteDetails[idx].isCompleted = (GrossAmount - DiscountAmount) === CNAmount;
            }
            $scope.RdoPatientId = true;
        }
        $scope.getDetail = function (BillId) {
            var inputData = {
                Params: [
                    { Key: 2, Value: BillId },
                ],
                PageContext: {
                    PageSize: 50,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'Billing/PatientBillDetails/GetPatientBillDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getDetailCallback
            };
            utl.Http.doAction(options);
        }
        $scope.getCreditNoteType = function (item) {
            $scope.item.CreditNoteTypeId = item.CreditNoteTypeId;
        }
        $scope.originalprint = function () {
            var inputData = {
                Id: $scope.currentcontext.id,
                Data: {
                    Reason: $scope.currentcontext.printreason
                }
            };
            var options = {
                action: 'Billing/PatientCreditNote/PrintPatientCreditNote',
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
                action: 'Billing/PatientCreditNote/PrintPatientCreditNote',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
        $scope.patientBillPickerCallback = function (data) {
            $scope.item = {
                IsActive: true,
                isCompleted: false,
                FacilityId: utl.Session.getCurrentFacilityId()
            };
            $scope.currentcontext.id = 0;
            $scope.item.PatientBillId = data.BillId;
            $scope.item.PatientId = data.PatientId;
            $scope.getBillInfoByBillNumber($scope.item.PatientBillId);
        }
        $scope.findBill = function () {
            utl.Modal.open('app.findbill-list', {
                params: { id: $scope.item.PatientId },
                confirmCallback: $scope.patientBillPickerCallback
            });
        }
        $scope.getItemCallback = function (scope, data, options, hasError) {
            if (data.Data.length > 0) {
                $scope.item = data.Data[0];
                $scope.CreditNoteDetails = $scope.item.PatientCreditNoteDetails;
                if ($scope.item.CreditNoteStatusId == 1) {
                    for (var idx in $scope.CreditNoteDetails) {
                        $scope.CreditNoteDetails[idx].CreditNoteDetailDateTime = utl.Formatter.getCurrentDate();
                    }
                }
                if ($scope.item.CreditNoteStatusId == 2 || 3) {
                    $scope.item.isCompleted = true;
                }
                if ($scope.item.PatientBillId)
                    $scope.getBillInfoByBillNumber($scope.item.PatientBillId);
                $scope.UpdatedStatus = $scope.item.CreditNoteStatusId;
            }
        };
        $scope.getData = function (data) {
            $scope.currentcontext.id = data.Id;
            $scope.getItem();
        }
        $scope.cnPicker = function () {
            utl.Modal.open('app.cnpicker', {
                params: { id: 0 },
                confirmCallback: $scope.getData
            });
        }
        $scope.getItem = function () {
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                var inputData = {
                    Params: [
                        { Key: 0, Value: $scope.currentcontext.id }
                    ],
                    PageContext: {
                        PageSize: 100,
                        PageNumber: 1
                    }
                };

                var options = {
                    action: 'Billing/PatientCreditNote/GetPatientCreditNotes',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getItemCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            if ($scope.currentcontext.id == 0)
                $scope.currentcontext.id = data;
            $scope.getItem();
            // $scope.backToList();
        };

        $scope.backToList = function () {
            $state.go('app.creditnotes');
        }
        $scope.Refund = function () {
            $state.go('app.refund-form', { id: 0, cnid: $scope.currentcontext.id });
        }
        $scope.addNew = function () {
            $scope.clear();
        }
        $scope.clear = function () {
            $scope.item = {
                IsActive: true,
                isCompleted: false,
                FacilityId: utl.Session.getCurrentFacilityId()
            };
            $scope.CreditNoteDetails = [];
            $scope.currentcontext.id = 0;
        }

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
            }
        };
        $scope.getBillInfoCallback = function (scope, res, options, hasError) {
            $scope.PatientBillInfo = res.Data || [];
            if ($scope.PatientBillInfo && $scope.PatientBillInfo.length > 0) {
                $scope.PatientBillInfo.forEach(patientbills => {
                    if (patientbills.PatientBillStatusId == 3) {
                    $scope.item.BillNumber = patientbills.BillNumber;
                    $scope.item.BillDateTime = patientbills.BillDateTime;
                    $scope.item.AuthorizedBy = patientbills.BillApprovedBy;
                    $scope.item.PatientId = patientbills.PatientId;
                    $scope.item.EncounterId = patientbills.EncounterId;
                    $scope.item.VisitIdentifier = patientbills.Encounter.VisitIdentifier;
                    $scope.item.EncounterTypeId = patientbills.EncounterTypeId;
                    $scope.item.PatientName = patientbills.PatientName;
                    $scope.item.DepartmentID = patientbills.DepartmentId;
                    $scope.item.GuarantorId = patientbills.GuarantorId;
                    $scope.item.GuarantorTypeId = patientbills.GuarantorTypeId;
                    $scope.item.DoctorId = patientbills.DoctorId;
                    var NetAmount = (isNaN(parseFloat(patientbills.BillAmount)) ? 0 : parseFloat(patientbills.BillAmount)) - (isNaN(parseFloat(patientbills.BillDiscount)) ? 0 : parseFloat(patientbills.BillDiscount));
                    var CNAmount = (isNaN(parseFloat(patientbills.CNAmount)) ? 0 : parseFloat(patientbills.CNAmount));
                        $scope.iscredited = (NetAmount === CNAmount);
                        $scope.getDetail($scope.item.PatientBillId);
                    } else {
                        utl.Alert.showErrorMsg($translate.instant('billing.creditnote.billcancelled.lbl'));
                        return false;
                    }
                });
                // $scope.getEncounter();
            }
            $scope.checkCN();
        };
        // $scope.getEncounterCallback = function (scope, data, options, hasError) {
        //     $scope.item.VisitNo = data.VisitIdentifier;
        // }
        // $scope.getEncounter = function () {
        //     var options = {
        //         action: 'Visit/Visit/GetEncounterById',
        //         data: { Id: $scope.item.EncounterId },
        //         type: 'post',
        //         onComplete: $scope.getEncounterCallback
        //     };
        //     utl.Http.doAction(options);
        // }
        $scope.headerCalc = function () {
            $scope.TotalNetAmount = 0;
            for (var idx in $scope.CreditNoteDetails) {
                var item = $scope.CreditNoteDetails[idx];
                item.CreditNoteAmount = 0;
                item.CreditNoteTypeId = 0;
                item.IsEditable = false;
                $scope.TotalNetAmount += parseFloat(item.NetAmount) - parseFloat(item.CNAmount);
            }
            if ($scope.item.CreditNoteAmount > $scope.TotalNetAmount) {
                $scope.item.CreditNoteAmount = $scope.TotalValidAmt;
                utl.Alert.showErrorMsg($translate.instant('billing.creditnote.creditnoteamount.lbl'));
                return false;
            }
            $scope.TotalValidAmt = $scope.item.CreditNoteAmount;

        }
        $scope.calCreditAmount = function (index) {
            var CurrentCNAmount = parseFloat($scope.CreditNoteDetails[index].CreditNoteAmount);
            var CNAmount = parseFloat($scope.CreditNoteDetails[index].CNAmount);
            var NetAmount = parseFloat($scope.CreditNoteDetails[index].NetAmount);
            if (CurrentCNAmount > (NetAmount - CNAmount)) {
                $scope.CreditNoteDetails[index].CreditNoteAmount = $scope.CurrentValidAmount;
                utl.Alert.showErrorMsg($translate.instant('billing.creditnote.creditnoteamount.lbl'));
                return false;
            }
            $scope.item.CreditNoteAmount = 0;
            for (var idx in $scope.CreditNoteDetails) {
                if ($scope.CreditNoteDetails[idx].CreditNoteAmount == undefined)
                    $scope.CreditNoteDetails[idx].CreditNoteAmount = 0;
                $scope.item.CreditNoteAmount += parseFloat($scope.CreditNoteDetails[idx].CreditNoteAmount);
            }
            $scope.CurrentValidAmount = $scope.CreditNoteDetails[index].CreditNoteAmount;
        }
        $scope.checkCN = function () {
            if ($scope.iscredited && $scope.currentcontext.id == 0) {
                utl.Alert.showErrorMsg($translate.instant('billing.creditnote.creditsnotavailable.lbl'));
            }
            if ($scope.currentcontext.id > 0)
                $scope.item.isCompleted = true;
        }

        $scope.completeCN = function () {
            var confirmOptions = {
                headingKey: 'common.confirm-modal-header.lbl',
                messageKey: 'billing.creditnote.confirmmsg.lbl',
                yesKey: 'common.yeskey.lbl',
                noKey: 'common.nokey.lbl',
                onSuccessMethod: $scope.saveItem,
            };
            utl.Dialog.confirmMessage(confirmOptions);
        }
        $scope.saveDraft = function () {
            $scope.item.CreditNoteDateTime = utl.Formatter.getCurrentDate();
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.CreditNoteStatusId = 1;
            $scope.saveItem();
        }
        $scope.saveAndApprove = function () {
            $scope.item.CreditNoteDateTime = utl.Formatter.getCurrentDate();
            if (!utl.Validator.validate($scope)) {
                return;
            }
            $scope.item.CreditNoteStatusId = 2;
            $scope.completeCN();
        }
        $scope.saveItem = function () {
            var details = $scope.getlines();
            var actionName = 'Billing/PatientCreditNote/AddPatientCreditNote';

            var inputData = { Header: $scope.item, Details: details };
            var options = {
                action: actionName,
                data: { Data: inputData },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };
        $scope.getlines = function () {
            var result = [];
            for (var idx in $scope.CreditNoteDetails) {
                var item = $scope.CreditNoteDetails[idx];
                if (item.IsEditable) {
                    result.push(item)
                }
            }
            return result;
        }
        // $scope.amountConversion = function (amount) {
        //     if (amount != undefined) {
        //         return parseFloat(amount).toFixed(2);
        //     }
        //     else {
        //         return '0.00';
        //     }
        // }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
        }

        $scope.initLookup = function () {
            var inputData =
                [
                    { "Key": "CreditNoteType" },
                    { "Key": "User" },
                    { "Key": "Facility" },
                    // { "Key": "ServiceItem" },
                    // { "Key": "ServiceName" },
                ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }


        // ---- React bridge (UI-MODERNIZATION RETROFIT) ----
        // AngularJS remains authoritative for all data/business logic in this
        // controller; this section only mirrors state into reactProps and
        // dispatches UI actions from BillingCreditNoteFormScreen back onto the
        // real, unchanged $scope functions/fields. The bottom action bar
        // (Back/CN Status/Refund/printcontrol/Save & Approve/Clear) is left as
        // native AngularJS markup in creditnote-form.html and is NOT covered
        // by this bridge -- see the disclosure comment in
        // BillingCreditNoteFormScreen.tsx for the full rationale.
        function toIsoDate(d) {
            if (!d) return '';
            var dt = (d instanceof Date) ? d : new Date(d);
            if (isNaN(dt.getTime())) return '';
            var mm = ('0' + (dt.getMonth() + 1)).slice(-2);
            var dd = ('0' + dt.getDate()).slice(-2);
            return dt.getFullYear() + '-' + mm + '-' + dd;
        }

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                item: angular.extend({}, $scope.item, { CreditNoteDateTime: toIsoDate($scope.item.CreditNoteDateTime) }),
                patientAge: ($scope.PatientBillInfo && $scope.PatientBillInfo[0] && $scope.PatientBillInfo[0].Patient) ? $scope.PatientBillInfo[0].Patient.Age : undefined,
                patientAlertsCount: $scope.currentcontext.patientAlertsCount,
                creditNoteDetails: $scope.CreditNoteDetails,
                lookup: $scope.lookup
            };
        };

        var _origGetItemCallback = $scope.getItemCallback;
        $scope.getItemCallback = function (scope, data, options, hasError) {
            _origGetItemCallback(scope, data, options, hasError);
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        var _origGetBillInfoCallback = $scope.getBillInfoCallback;
        $scope.getBillInfoCallback = function (scope, res, options, hasError) {
            _origGetBillInfoCallback(scope, res, options, hasError);
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        var _origLookupCallback = $scope.lookupCallback;
        $scope.lookupCallback = function (scope, data, options, hasError) {
            _origLookupCallback(scope, data, options, hasError);
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.handleReactAction = function (actionName, payload) {
            switch (actionName) {
                case 'rowEditableChange':
                    $scope.CreditNoteDetails[payload.index].IsEditable = payload.value;
                    break;
                case 'rowTypeChange':
                    $scope.CreditNoteDetails[payload.index].CreditNoteTypeId = payload.value;
                    $scope.getCreditNoteType($scope.CreditNoteDetails[payload.index]);
                    break;
                case 'rowAmountChange':
                    $scope.CreditNoteDetails[payload.index].CreditNoteAmount = payload.value;
                    $scope.calCreditAmount(payload.index);
                    break;
                case 'rowCommentsChange':
                    $scope.CreditNoteDetails[payload.index].Comments = payload.value;
                    break;
                case 'cnTypeChange':
                    $scope.item.CreditNoteTypeId = payload.value;
                    break;
                case 'approvedByChange':
                    $scope.item.CreditNoteApprovedById = payload.value;
                    break;
                case 'commentsChange':
                    $scope.item.Comments = payload.value;
                    break;
                default:
                    // covers patientprofiledetails/cnPicker/findBill/addNew, and the
                    // confirmed pre-existing dead 'alertviewclick' handler (no matching
                    // $scope function exists, so this safely no-ops, matching the real
                    // app's behavior today)
                    if (typeof $scope[actionName] === 'function') {
                        $scope[actionName]();
                    }
                    break;
            }
            $scope.refreshReactProps();
            $scope.$applyAsync();
        };

        $scope.initLookup();
    }

    creditnoteFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();