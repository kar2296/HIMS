(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('cancelReceiptFormController', cancelReceiptFormController);

    function cancelReceiptFormController($scope, $filter, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {

        var vm = this;
        var savehitcompleted = 0;
        $scope.billinfo = [];
        $scope.facilityId = 0;
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };
        $scope.currentcontext.id = -1;
        if (modalConfig && modalConfig.params) {
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.cn = {};
        $scope.cn.Header = {
            ActiveFrom: utl.Formatter.getCurrentDate(),
            ChequeDate: utl.Formatter.getCurrentDate(),
            CollectedOn: utl.Formatter.getCurrentDate(),
            CreditNoteAmount: 0,
            CreditNoteDateTime: utl.Formatter.getCurrentDate(),
            CreditNoteIdentifier: null,
            CurrencyTypeId: 1,
            DDDate: utl.Formatter.getCurrentDate(),
            DepartmentID: null,
            DoctorId: null,
            EncounterId: null,
            EncounterTypeId: null,
            FacilityId: null,
            GuarantorId: null,
            GuarantorTypeId: null,
            IsActive: true,
            IsFromFinalize: false,
            PatientBillId: 0,
            PatientCreditNoteId: 0,
            PatientId: 0,
            PatientName: null,
            PaymentTypeId: 1,
            RefundAmount: 0,
            RefundDateTime: utl.Formatter.getCurrentDate(),
            RefundStatusId: 1,
            RefundTypeId: 3,
            VisitIdentifier: null,
            WireTransferDate: utl.Formatter.getCurrentDate(),
            isCompleted: true,
            AuthorizedBy: null,
            BillDateTime: utl.Formatter.getCurrentDate(),
            BillNumber: null,
            CreditNoteApprovedById: 0,
            CreditNoteStatusId: 2,
            CreditNoteTypeId: 4,
            reason: ''
        };
        $scope.cn.Details = [];

        if (modalConfig.params && modalConfig.params.billinfo)
            $scope.billinfo = modalConfig.params.billinfo;

        if (modalConfig.params && modalConfig.params.facilityId)
            $scope.facilityId = modalConfig.params.facilityId;

        if (modalConfig.params && modalConfig.params.billdate)
            $scope.billdate = modalConfig.params.billdate;

        if (modalConfig.params && modalConfig.params.id)
            $scope.currentcontext.id = modalConfig.params.id;
        if (modalConfig.params && modalConfig.params.EncounterId)
            $scope.currentcontext.EncounterId = modalConfig.params.EncounterId;
        $scope.IsCancelled = false;
        if (modalConfig.params && modalConfig.params.reason) {
            $scope.IsCancelled = true;
            $scope.currentcontext.CancelReason = modalConfig.params.reason;
        }
        $scope.currentcontext.type = modalConfig.params.type;
        $scope.closeReceipt = $scope.cancelCallback();
        $scope.action = function () {
            if ($scope.currentcontext.type == 'view') {
                $scope.Cancelbtn = false;
                $scope.closebtn = true;
            } else if ($scope.currentcontext.type == 'cancel') {
                $scope.Cancelbtn = true;
                $scope.closebtn = false;
            }
        }

        $scope.item = {
            receiptdate: utl.Formatter.getCurrentDate(),

        };


        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = data.Data;
            $scope.List = data.Data;
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
            $scope.refreshReactProps();
        };

        $scope.getList = function (BillId) {
            // $scope.currentfilter.Fromreceiptdate = $filter('date')($scope.item.receiptdate, 'yyyy-MM-dd 00:00:00');
            // $scope.currentfilter.Toreceiptdate = $filter('date')($scope.item.receiptdate, 'yyyy-MM-dd 23:59:59');


            var inputData = {
                Params: [{
                        Key: 9,
                        Value: BillId
                    },
                    {
                        Key: 10,
                        Value: $scope.currentcontext.EncounterId
                    },
                    {
                        Key: 13,
                        Value: false
                    }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'Billing/PatientPaymentDetails/GetPatientPaymentDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.cancelReceiptCNCallback = function (scope, data, options, hasError) {
            console.log(data);
            if ($scope.List.length != 0) {
                $scope.getCNData();
                for (var idx in $scope.List) {
                    $scope.List[idx].ReceiptStatusId = 3;
                    $scope.List[idx].Comments = $scope.currentcontext.CancelReason;
                    var actionName = 'Billing/PatientPaymentDetails/FullBillCancel';
                    var options = {
                        action: actionName,
                        data: {
                            Data: $scope.List
                        },
                        type: 'post',
                        onComplete: $scope.cancelReceiptCallback
                    };
                    utl.Http.doAction(options);
                }
            }
        };


        $scope.cancelDueBill = function () {
            if ($scope.List.length != 0) {
                for (var idx in $scope.List) {
                    $scope.List[idx].ReceiptStatusId = 3;
                    $scope.List[idx].Comments = $scope.currentcontext.CancelReason;
                    var actionName = 'Billing/PatientPaymentDetails/FullBillCancel';
                    var options = {
                        action: actionName,
                        data: {
                            Data: $scope.List
                        },
                        type: 'post',
                        onComplete: $scope.cancelReceiptCallback
                    };
                    utl.Http.doAction(options);
                }
            }
        };

        $scope.CanCancellFromBillSettings = function (scope, data, options, hasError) {
            savehitcompleted = 1;
            if (data) {
                if (!utl.Validator.validate($scope)) {
                    return;
                }
                if ($scope.List.length != 0) {
                    $scope.getCNData();
                    var actionName = 'Billing/PatientCreditNote/AddPatientCreditNote';
                    var options = {
                        action: actionName,
                        data: {
                            Data: {
                                Header: $scope.cn.Header,
                                Details: $scope.cn.Details
                            }
                        },
                        type: 'post',
                        onComplete: $scope.cancelReceiptCNCallback
                    };
                    utl.Http.doAction(options);
                } else if ($scope.List.length == 0) { // Due Bill
                    if ($scope.billinfo) {
                        if ($scope.billinfo.length > 0) {
                            var cancelbill = {
                                PatientBillId: $scope.billinfo[0].Id
                            };
                            $scope.List.push(cancelbill);
                            $scope.cancelDueBill();
                        }
                    } else {
                        utl.Alert.showErrorMsg('Due Bill No Bill Information');
                    }
                } else {
                    $scope.confirmCallback($scope.currentcontext.CancelReason);
                }
            } else {
                utl.Alert.showErrorMsg($translate.instant('billing.opbilling-list.cancelrestriction.lbl'));
            }
        }

        $scope.cancelReceiptCallback = function () {
            console.log($scope.List);
            $scope.confirmCallback($scope.currentcontext.CancelReason);
        }

        /* Security IsValid */
        $scope.securitypisvalid = false;
        $scope.SecurityPINChkCallback = function (SecurityStatus) {
            //console.log(SecurityStatus);
            $scope.securitypisvalid = SecurityStatus.pinstatus;
            $scope.cancelReceipt();
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

        $scope.cancelReceipt = function () {

            if (!utl.Validator.validate($scope)) {
                return;
            }

            if (savehitcompleted == 1) return;

            if ($scope.billdate) {

                /* Security IsValid */
                $scope.requiredsecuritypin =
                    utl.FacilitySetting.getFacilitySettingValue('billing', 'requiredsecuritypin');

                if ($scope.requiredsecuritypin && !$scope.securitypisvalid)
                    if (!$scope.securitypincheck())
                        return false;

                /* Security IsValid */
                savehitcompleted = 1;
                var actionName = 'SystemSettings/FacilityPreference/OPCanCancelFromBillSettings';
                var options = {
                    action: actionName,
                    data: {
                        Data: {
                            'billdate': $scope.billdate,
                            'facilityId': $scope.facilityId
                        }
                    },
                    type: 'post',
                    onComplete: $scope.CanCancellFromBillSettings
                };
                utl.Http.doAction(options);
            }
        }

        $scope.patientprofiledetails = function (patientId) {
            utl.Modal.open('registration.patientprofile', {
                params: {
                    pid: patientId
                },
                confirmCallback: $scope.getList
            });
        }

        $scope.getCNData = function () {
            var billdata = $scope.billinfo;
            for (var indbi in billdata) {
                var item = billdata[indbi];
                if (item) {
                    $scope.cn.Header.BillNumber = item.BillNumber;
                    $scope.cn.Header.PatientBillId = item.Id;
                    $scope.cn.Header.BillDateTime = item.BillDateTime;
                    $scope.cn.Header.AuthorizedBy = item.BillApprovedBy;
                    $scope.cn.Header.PatientId = item.PatientId;
                    $scope.cn.Header.EncounterId = item.EncounterId;
                    // $scope.cn.Header.VisitIdentifier = item.Encounter.VisitIdentifier;
                    $scope.cn.Header.EncounterTypeId = item.EncounterTypeId;
                    $scope.cn.Header.PatientName = item.PatientName;
                    $scope.cn.Header.DepartmentID = item.DepartmentId;
                    $scope.cn.Header.GuarantorId = item.GuarantorId;
                    $scope.cn.Header.GuarantorTypeId = item.GuarantorTypeId;
                    $scope.cn.Header.DoctorId = item.DoctorId;
                    $scope.cn.Header.FacilityId = item.FacilityId;
                    var totalrefund = 0;
                    var totalcnamt = 0;
                    $scope.cn.Details = [];
                    $scope.Selectionrow = [];
                    $scope.Selectionrow = item.PatientBillDetails;
                    for (var ind in $scope.Selectionrow) {
                        var itemcode = null;
                        if ($scope.Selectionrow[ind].ServiceItem)
                            itemcode = $scope.Selectionrow[ind].ServiceItem.ItemCode;

                        if ($scope.Selectionrow[ind].SelectedItem)
                            itemcode = $scope.Selectionrow[ind].SelectedItem.ItemCode;

                        $scope.cn.Detail = {
                            CNAmount: isNaN(parseFloat($scope.Selectionrow[ind].NetAmount)) ? 0 : parseFloat($scope.Selectionrow[ind].NetAmount),
                            CNCompleted: true,
                            Code: itemcode,
                            CreditNoteAmount: isNaN(parseFloat($scope.Selectionrow[ind].NetAmount)) ? 0 : parseFloat($scope.Selectionrow[ind].NetAmount),
                            CreditNoteDetailDateTime: utl.Formatter.getCurrentDate(),
                            CreditNoteTypeId: 4,
                            DepartmentID: $scope.Selectionrow[ind].DepartmentID,
                            Discount: $scope.Selectionrow[ind].Discount,
                            IsEditable: true,
                            NetAmount: $scope.Selectionrow[ind].ReceivedAmount,
                            PatientBillDetailId: $scope.Selectionrow[ind].Id,
                            ServiceAmount: 0,
                            ServiceId: $scope.Selectionrow[ind].ServiceId,
                            ServiceName: $scope.Selectionrow[ind].ServiceName,
                            Status: $scope.Selectionrow[ind].Status,
                            isCompleted: true
                        };

                        $scope.Selectionrow[ind].PatientBillStatusId = 2;
                        $scope.Selectionrow[ind].CancelledBy = utl.Session.getCurrentUserId();
                        $scope.Selectionrow[ind].CNAmount += $scope.Selectionrow[ind].NetAmount;
                        totalcnamt += $scope.Selectionrow[ind].NetAmount;
                        totalrefund += $scope.Selectionrow[ind].ReceivedAmount;
                        if ($scope.cn.Detail.ServiceId > 0) {
                            $scope.cn.Details.push($scope.cn.Detail);
                        }
                    }

                    $scope.cn.Header.RefundAmount += totalrefund;
                    $scope.cn.Header.CreditNoteAmount += totalcnamt;
                }
            }
            $scope.cn.Detail = {};
        }

        //Grid Actions
        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'patientinfo') {
                $scope.patientprofiledetails(entity.PatientId);
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "ReceiptNumber",
                    displayName: $translate.instant('billing.receipt-list.receiptno.lbl')
                },

                {
                    field: "ReceiptDateTime",
                    displayName: $translate.instant('billing.receipt-list.receiptdate.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='entity.ReceiptDateTime '></ngformatdate>"
                },
                {
                    field: "Patient",
                    displayName: $translate.instant('billing.receipt-list.patientinfor.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)">{{ entity.Patient.Title && entity.Patient.Title.Description}}' + '.' +
                        '{{entity.Patient.FirstName}}' + '{{entity.Patient.LastName}}' + ' ' + '{{entity.Patient.MRN}}' + ' ' + '{{entity.Patient.Age}}' + ' ' + '{{entity.Patient.Gender.Description}}</a>' + '</div>'
                },
                {
                    field: "ReceiptType.Description",
                    displayName: $translate.instant('billing.receipt-list.type.lbl')
                },
                {
                    field: "AmountPaid",
                    displayName: $translate.instant('billing.receipt-list.receiptamount.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{entity.AmountPaid | displaycurrency}}</span>' + '</div>'
                },
                {
                    field: "PaymentType.Description",
                    displayName: $translate.instant('billing.receipt-list.paymentmode.lbl')
                },
                {
                    field: "ReceiptStatus.Description",
                    displayName: $translate.instant('billing.receipt-list.status.lbl')
                }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };


        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList($scope.currentcontext.id);
            $scope.action();
        }

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "Facility",
                    Request: {
                        Params: [{
                            Key: 4,
                            Value: true
                        }]
                    }
                },
                {
                    "Key": "ReceiptType"
                },
                {
                    "Key": "ReceiptStatus"
                },
                {
                    "Key": "CardType"
                }

            ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                rows: (vm.gridConfig && vm.gridConfig.data) || []
            };
            $scope.$applyAsync();
        };

        $scope.handleReactAction = function (actionName, payload) {
            switch (actionName) {
                case 'patientinfo':
                    $scope.handleEvents('patientinfo', payload.entity);
                    break;
            }
        };

        $scope.initLookup();
    }

    cancelReceiptFormController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();