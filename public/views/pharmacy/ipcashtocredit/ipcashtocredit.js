(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('cashToCreditBillController', cashToCreditBillController);

    function cashToCreditBillController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getDMPrintDataController({ $scope: $scope }));

        var savehitcompleted = 0;
        $scope.printpreferences = 1;
        $scope.dmprintpreferences = 0;
        $scope.AdmissionDate = null;

        $scope.patientChange = function () {
            $scope.item.Received =0;
            $scope.AdmissionDate = null;
            console.log($scope.selectedPatient);
            var Encounterlist = $scope.selectedPatient.Encounters;
            if (Encounterlist.length > 0) {
                var encounterinfo = Encounterlist[0];
                if (encounterinfo && encounterinfo.EncounterTypeId
                    && encounterinfo.EncounterTypeId == 2) {
                    $scope.AdmissionDate = encounterinfo.AdmissionDate;
                    $scope.isBill = encounterinfo.AdmissionDate;
                    $scope.AdmissionDate = encounterinfo.AdmissionDate;
                } else {
                    utl.Alert.showErrorMsg($translate.instant('billing.ipcashtocredit.norecord.lbl'));
                }
            } else {
                utl.Alert.showErrorMsg($translate.instant('billing.ipcashtocredit.norecord.lbl'));
            }
        };

        $scope.currentfilter = {
            BillTypeId: 4
        };

        $scope.canSaveAndApprove = true;

        $scope.item = {
            PrivateDueId: -1,
            TerminalNoId: -1,
            BankId: -1,
            CardTypeId: -1,
            ChequeNo: '',
            ChequeDate: null,
            DDNumber: null,
            DDDate: null,
            WireTransferId: null,
            WireTransferDate: null,
            ReceiptGeneratedById: utl.Session.getCurrentUserId(),
            ReceiptApprovedById: utl.Session.getCurrentUserId(),
            PaymentTypeId: 1,
            AuthorizedCode: null,
            Comments: '',
            Received: 0.00,
            OutStandingAmt: 0.00,
            Discount: 0.00,
            BillAmount: 0.00,
            PaidAmount: 0.00,
        };

        $scope.custom_sort = function (a, b) {
            return new Date(b.BillDateTime).getTime() - new Date(a.BillDateTime).getTime();
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            if (res.Data) {
                for (var idx in res.Data) {
                    var item = res.Data[idx];
                    item.CustPaidAmt = 0;
                    if (item.OutStandingAmount <= 0) {
                        for (var payidx in item.PatientPaymentDetails) {
                            var payinfo = item.PatientPaymentDetails[payidx];
                            item.CustPaidAmt += payinfo.AmountPaid;
                        }
                        if (item.CustPaidAmt && item.CustPaidAmt >= item.RefundAmount) {
                            item.NetAmount = (!isNaN(parseFloat(item.CustPaidAmt)) ? parseFloat(item.CustPaidAmt) : 0)
                                - (!isNaN(parseFloat(item.RefundAmount)) ? parseFloat(item.RefundAmount) : 0);
                        }
                    }
                }
                vm.gridConfig.data = [];
                if (res.Data.length > 0) {
                    res.Data.sort($scope.custom_sort);

                    for (var idx in res.Data) {
                        var item = res.Data[idx];

                        if (item.NetAmount > 0)
                            vm.gridConfig.data.push(item);
                    }
                } else {
                    utl.Alert.showErrorMsg($translate.instant('billing.ipcashtocredit.norecord.lbl'));
                }
            }
        };

        $scope.findConsolidatePayBills = function () {
            $scope.item.Received =0;
            if ($scope.currentfilter.PatientId > 0) {
                var inputData = {
                    Params: [
                        { Key: 17, Value: $scope.AdmissionDate },
                        { Key: 12, Value: $scope.currentfilter.PatientId },
                        { Key: 6, Value: $scope.currentfilter.BillTypeId },
                        { Key: 11, Value: true }, // Outstanding
                        { Key: 4, Value: 3 } // PatientBillStatus
                    ]
                };
                $scope.canSaveAndApprove = false;
                var options = {
                    action: 'billing/PatientBills/GetPatientBills',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getListCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.Clear = function () {
            $state.reload();
        };

        $scope.getList = function () {
            $scope.item.Received =0;
            if ($scope.AdmissionDate && $scope.currentfilter.PatientId > 0) {
                var inputData = {
                    Params: [
                        { Key: 17, Value: $scope.AdmissionDate },
                        { Key: 12, Value: $scope.currentfilter.PatientId },
                        { Key: 6, Value: $scope.currentfilter.BillTypeId }, // BillTypeId = 4 only pharmacy
                        { Key: 41, Value: 1 }, // PaymentTypeId
                        { Key: 4, Value: 3 } // PatientBillStatus
                    ]
                };
                var options = {
                    action: 'billing/PatientBills/GetPatientBills',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getListCallback
                };

                utl.Http.doAction(options);
            }
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            vm.gridConfig.data = [];
            $scope.item = {
                PrivateDueId: -1,
                TerminalNoId: -1,
                BankId: -1,
                CardTypeId: -1,
                ChequeNo: '',
                ChequeDate: null,
                DDNumber: null,
                DDDate: null,
                WireTransferId: null,
                WireTransferDate: null,
                ReceiptGeneratedById: utl.Session.getCurrentUserId(),
                ReceiptApprovedById: utl.Session.getCurrentUserId(),
                PaymentTypeId: 1,
                AuthorizedCode: 0,
                Comments: '',
                Received: 0.00,
                OutStandingAmt: 0.00,
                Discount: 0.00,
                BillAmount: 0.00,
                PaidAmount: 0.00
            };
            $scope.findConsolidatePayBills();
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
            if (!utl.Validator.validate($scope)) {
                return;
            }
            var getbills = getSelectionRows();
            if (getbills.length === 0) {
                utl.Alert.showErrorMsg($translate.instant('billing.cashToCreditBill.selectanybill.lbl'));
                return false;
            }

            /* Security IsValid */
            $scope.requiredsecuritypin =
                utl.FacilitySetting.getFacilitySettingValue('billing', 'requiredsecuritypin');

            if ($scope.requiredsecuritypin && !$scope.securitypisvalid)
                if (!$scope.securitypincheck())
                    return false;

            /* Security IsValid */

            if ($scope.requiredsecuritypin) {
                $scope.saveItem();
            } else {
                var confirmOptions = {
                    headingKey: 'common.confirm-modal-header.lbl',
                    messageKey: 'Are You Sure Do You Want to change cash to credit bills',
                    yesKey: 'common.yeskey.lbl',
                    noKey: 'common.nokey.lbl',
                    onSuccessMethod: $scope.saveItem,
                };
                utl.Dialog.confirmMessage(confirmOptions);
            }
        };

        $scope.saveItem = function () {
            var getbills = getSelectionRows();
            var actionName = 'billing/PatientBills/ManageCashToCreditBill';

            var options = {
                action: actionName,
                data: { Data: { PaymentDetail: $scope.item, Bills: getbills,
                     GeneratedById:  utl.Session.getCurrentUserId() } },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "BillDateTime", displayName: $translate.instant('doctorinvoice-form.billdate.lbl'),
                    cellTemplate: "<ngformatdate datetime-val='row.entity.BillDateTime'></ngformatdate>"
                },
                { field: "BillNumber", displayName: $translate.instant('doctorinvoice-form.billno.lbl') },
                {
                    field: "Patient",
                    displayName: $translate.instant('doctorinvoice-form.patientname.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>" +
                        '<a ng-click="grid.appScope.handleEvents(\'patientinfo\',row)" uib-tooltip="{{row.entity.Patient.Title.Description}} '
                        + '{{row.entity.Patient.FirstName }} ' + '{{row.entity.Patient.LastName}} | ' + '{{row.entity.Patient.MRN}} | '
                        + '{{row.entity.Patient.Age}} | ' + '{{row.entity.Patient.Gender.Description}}" tooltip-placement="bottom">' +
                        "<span ng-if='row.entity.Patient.Title && row.entity.Patient.Title.Description' >" +
                        "{{row.entity.Patient.Title.Description}}</span>" +
                        "<span > </span>" +
                        "<span >{{row.entity.Patient.FirstName}}</span>" + "<span > </span>" +
                        "<span >{{row.entity.Patient.LastName}}</span>" +
                        "<span >/</span>" +
                        "<span >{{row.entity.Patient.MRN}}</span>" +
                        "<span >/<span>" +
                        "<span >{{row.entity.Patient.Age}}</span>" +
                        "<span >/</span>" +
                        "<span >{{row.entity.Patient.Gender.Description}}</span>" +
                        "</a></div>"
                },
                {
                    field: "Amount", displayName: $translate.instant('billing.consolidate.billamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{row.entity.BillAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "GrossGSTAmount", displayName: $translate.instant('billing.consolidate.discount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{row.entity.BillDiscount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "DoctorShare", displayName: $translate.instant('billing.consolidate.refundamt.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{row.entity.RefundAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "Doctor", displayName: $translate.instant('billing.consolidate.paidamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{row.entity.PaidAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "NetAmount", displayName: $translate.instant('billing.consolidate.netamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{row.entity.NetAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "Doctor", displayName: $translate.instant('billing.consolidate.dueamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{row.entity.OutStandingAmount | displaycurrency}}</span>" + "</div>"
                }
            ]
        };

        vm.gridConfig.enableRowSelection = true;
        vm.gridConfig.multiSelect = true;
        vm.gridConfig.enableFullRowSelection = true;
        vm.gridConfig.onRegisterApi = function (gridApi) {
            $scope.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged($scope, function (row) {
                selectionChangedCal(row);
            });
            gridApi.selection.on.rowSelectionChangedBatch($scope, function (rows) {
                for (var idx in rows) {
                    selectionChangedCal(rows[idx]);
                }
            });
        };

        function selectionChangedCal(row) {
            var item = row.entity;
            if (row.isSelected) {
                $scope.item.OutStandingAmt = parseFloat($scope.item.OutStandingAmt) + parseFloat(item.OutStandingAmount);
                $scope.item.Discount = parseFloat($scope.item.Discount) + parseFloat(item.BillDiscount);
                $scope.item.BillAmount = parseFloat($scope.item.BillAmount) + parseFloat(item.BillAmount);
                var amt = (parseFloat($scope.item.Received) + (parseFloat(item.PaidAmount) - parseFloat(item.RefundAmount)));
                $scope.item.Received = eval(amt).toFixed(2);
            } else {
                $scope.item.OutStandingAmt = parseFloat($scope.item.OutStandingAmt) - parseFloat(item.OutStandingAmount);
                $scope.item.Discount = parseFloat($scope.item.Discount) - parseFloat(item.BillDiscount);
                $scope.item.BillAmount = parseFloat($scope.item.BillAmount) - parseFloat(item.BillAmount);
                var amt = (parseFloat($scope.item.Received) - (parseFloat(item.PaidAmount) - parseFloat(item.RefundAmount)));
                $scope.item.Received = eval(amt).toFixed(2);
            }
        }

        function getSelectionRows() {
            var currentSelection = $scope.gridApi.selection.getSelectedRows();
            return currentSelection;
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            if ($scope.lookup.BillType) {
                var billtype = [];
                var vbilltype = $scope.lookup.BillType;
                for (var idx in vbilltype) {
                    if (vbilltype[idx].Id) {
                        if (vbilltype[idx].Id != 2 && vbilltype[idx].Id != 3) {
                            billtype.push(vbilltype[idx]);
                        }
                    }
                }
                if (billtype.length > 0) {
                    $scope.lookup.BillType = [];
                    $scope.lookup.BillType = billtype;
                }
            }
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "BillType" },
                { "Key": "PrivateDueApprover" }
            ]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        /* Consolidate Payment dotmatrix print starts */

        $scope.dmPrint = function () {
            if ($scope.dmprintpreferences != 1) {
                utl.Alert.showSuccessMsg($translate.instant('billing.cashToCreditBill.noperference.lbl'));
                return false;
            } else {
                var dmAllPrintInput = preparePrintData();
                console.log(dmAllPrintInput);
                $scope.printcashToCreditBill(dmAllPrintInput);
            }
        };

        function preparePrintData() {
            console.log('preparePrintData starts');
            var dmAllPrintInput = [];
            var selectedRows = getSelectionRows();
            for (var idx in selectedRows) {
                var currentBill = selectedRows[idx];
                var vIPOPNO = '';
                var vGST = '';
                var vPTitle = '';
                var vPFirstName = '';
                var vPLastName = '';
                var vUTitle = '';
                var vUFirstName = '';
                var vULastName = '';
                var vTinNo = '';
                var vMRN = '';
                var vAge = '';
                var vDOB = '';
                var vFDOB = '';
                var vGender = '';
                var vCFirstName = '';
                var vCLastName = '';
                var vCTitle = '';
                var vDrName = '';

                if (currentBill.Encounter) vIPOPNO = '' + currentBill.Encounter.VisitIdentifier;
                if (currentBill.Facility) vGST = '' + currentBill.Facility.GstNumber;



                if (currentBill.User) {
                    if (currentBill.User.Title) vUTitle = currentBill.User.Title.Description;
                    if (currentBill.User.FirstName) vUFirstName = currentBill.User.FirstName;
                    if (currentBill.User.LastName) vULastName = currentBill.User.LastName;
                    vDrName = (vUTitle + '.' + vUFirstName + ' ' + vULastName)
                }
                if (currentBill.CreatedUser) {
                    if (currentBill.CreatedUser.Title) vCTitle = currentBill.CreatedUser.Title.Description;
                    if (currentBill.CreatedUser.FirstName) vCFirstName = currentBill.CreatedUser.FirstName;
                    if (currentBill.CreatedUser.LastName) vCLastName = currentBill.CreatedUser.LastName;
                }
                if (currentBill.Patient) {
                    if (currentBill.Patient.Title) vPTitle = currentBill.Patient.Title.Description;
                    if (currentBill.Patient.FirstName) vPFirstName = currentBill.Patient.FirstName;
                    if (currentBill.Patient.LastName) vPLastName = currentBill.Patient.LastName;
                    if (currentBill.Patient.MRN) vMRN = currentBill.Patient.MRN;
                    if (currentBill.Patient.Age) vAge = '' + currentBill.Patient.Age;
                    if (currentBill.Patient.DOB) vDOB = '' + currentBill.Patient.DOB;
                    if (currentBill.Patient.DOB) vFDOB = '' + utl.Formatter.getDateTimeString(currentBill.Patient.DOB);
                    if (currentBill.Patient.Gender) vGender = '' + currentBill.Patient.Gender.Description;
                } else {
                    if (currentBill.Title)
                        vPTitle = currentBill.Title.Description;
                    vPFirstName = currentBill.PatientName;
                    if (currentBill.Age)
                        vAge = '' + currentBill.Age;
                    if (currentBill.Gender)
                        vGender = '' + currentBill.Gender.Description;
                    if (currentBill.DoctorName)
                        vDrName = '' + currentBill.DoctorName;
                }



                if (currentBill.StoreMaster) vTinNo = currentBill.StoreMaster.TinNo;


                var vPayTypeId = -1;

                if (currentBill.PatientPaymentDetails)
                    for (var idxpy in currentBill.PatientPaymentDetails)
                        vPayTypeId = currentBill.PatientPaymentDetails[idxpy].PaymentTypeId;

                var lincenseno = '';
                if (currentBill.StoreMaster)
                    if (currentBill.StoreMaster.LicenseNo)
                        lincenseno += currentBill.StoreMaster.LicenseNo;

                var dmPrintInput = {};
                dmPrintInput.header = {
                    prescribedby: vDrName || '',
                    licenseno: lincenseno,
                    billno: '' + currentBill.BillNumber,
                    patientname: vPTitle + '.' +
                        vPFirstName + ' ' + vPLastName,
                    GstNo: vGST,
                    TinNo: vTinNo,
                    MRN: vMRN,
                    Age: vAge,
                    DOB: vDOB,
                    FDOB: vFDOB,
                    Gender: vGender,
                    IPOPNO: vIPOPNO,
                    billdate: utl.Formatter.getDateTimeString(currentBill.BillDateTime),
                    totalamount: currentBill.BillAmount,
                    totDiscont: currentBill.BillDiscount,
                    totroundoff: currentBill.RoundOffValue,
                    totpaidamt: currentBill.PaidAmount,
                    billedby: vCTitle + '.' + vCFirstName + ' ' + vCLastName,
                    paytypeid: vPayTypeId || -1

                };

                dmPrintInput.lines = [];
                var islno = 1;
                for (var idx in currentBill.PatientBillDetails) {
                    var billDetail = currentBill.PatientBillDetails[idx];
                    var expiryDate = billDetail.ExpiryDate ? utl.Formatter.formatDate(billDetail.ExpiryDate, 'MM/YY') : '';
                    var manu = billDetail.ManufacturerName;
                    if (manu && manu.length > 3) {
                        manu = manu.substring(0, 3);
                    }

                    var batchid = billDetail.BatchId;
                    if (batchid && batchid.length > 4) {
                        batchid = batchid.substring(0, 4);
                    }

                    var cgstamt = parseFloat(billDetail.CGstAmount).toFixed(2);
                    var sgstamt = parseFloat(billDetail.SGstAmount).toFixed(2);

                    var vHSN = '';
                    if (billDetail.ItemMaster)
                        if (billDetail.ItemMaster.ProductRegNo)
                            vHSN = '' + billDetail.ItemMaster.ProductRegNo;

                    var vSCH = '';
                    if (billDetail.ScheduleTypeDescription)
                        vSCH = billDetail.ScheduleTypeDescription;

                    var detail = {
                        ispace: ' ',
                        slno: islno++,
                        desc: billDetail.ItemName,
                        hsn: vHSN,
                        sch: vSCH,
                        batch: batchid,
                        exp: expiryDate,
                        qty: billDetail.Quantity,
                        mrp: parseFloat(billDetail.Rate).toFixed(2),
                        value: parseFloat(billDetail.NetAmountBeforeGST).toFixed(2),
                        cgstper: billDetail.CGstPercentage,
                        cgstamt: cgstamt,
                        sgstper: billDetail.SGstPercentage,
                        sgstamt: sgstamt,
                        totgst: (billDetail.CGstAmount + billDetail.SGstAmount),
                        amount: parseFloat(billDetail.Amount).toFixed(2),
                        mfr: manu,
                        netamount: parseFloat(billDetail.NetAmount).toFixed(2)
                    };

                    dmPrintInput.lines.push(detail);
                }
                dmAllPrintInput.push(dmPrintInput);
            }
            console.log('preparePrintData ends');
            return dmAllPrintInput;
        }

        /* Consolidate Payment dotmatrix print ends */

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

        $scope.getPharmacyPrintPreference();
        $scope.initLookup();
    }

    cashToCreditBillController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();