(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('consolidatepaymentController', consolidatepaymentController);

    function consolidatepaymentController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getDMPrintDataController({ $scope: $scope }));

        var savehitcompleted = 0;
        $scope.printpreferences = 1;
        $scope.dmprintpreferences = 0;

        $scope.currentfilter = {};
        $scope.canSaveAndApprove = true;

        $scope.item = {
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
            PaidAmount: 0.00
        };

        $scope.custom_sort = function (a, b) {
            return new Date(b.BillDateTime).getTime() - new Date(a.BillDateTime).getTime();
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            if (res.Data) {
                for (var idx in res.Data) {
                    var item = res.Data[idx];
                    item.NetAmount = (!isNaN(parseFloat(item.BillAmount)) ? parseFloat(item.BillAmount) : 0)
                        - (!isNaN(parseFloat(item.BillDiscount)) ? parseFloat(item.BillDiscount) : 0);
                }
                if (res.Data.length > 0) {
                    res.Data.sort($scope.custom_sort);
                    vm.gridConfig.data = res.Data;
                } else {
                    utl.Alert.showErrorMsg($translate.instant('No Records For This Patient'));
                }
                if (res.Data.length == 0) { vm.gridConfig.data = []; }
            }
        };

        $scope.findConsolidatePayBills = function () {
            if ($scope.currentfilter.PatientId > 0) {
                var inputData = {
                    Params: [
                        { Key: 12, Value: $scope.currentfilter.PatientId },
                        { Key: 6, Value: $scope.currentfilter.BillTypeId },
                        { Key: 32, Value: true },
                        { Key: 4, Value: 3 }
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
            if ($scope.currentfilter.PatientId > 0) {
                var inputData = {
                    Params: [
                        { Key: 12, Value: $scope.currentfilter.PatientId },
                        { Key: 6, Value: $scope.currentfilter.BillTypeId },
                        { Key: 11, Value: true },
                        { Key: 4, Value: 3 }
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
                utl.Alert.showErrorMsg($translate.instant('billing.consolidatepayment.selectanybill.lbl'));
                return false;
            }

            /* Security IsValid */
            $scope.requiredsecuritypin =
                utl.FacilitySetting.getFacilitySettingValue('billing', 'requiredsecuritypin');

            if ($scope.requiredsecuritypin && !$scope.securitypisvalid)
                if (!$scope.securitypincheck())
                    return false;

            /* Security IsValid */

            if($scope.requiredsecuritypin){
                $scope.saveItem();
            } else {
                var confirmOptions = {
                    headingKey: 'common.confirm-modal-header.lbl',
                    messageKey: 'Are You Sure Do You Want To Close OutStanding Amount For The Selected Bills',
                    yesKey: 'common.yeskey.lbl',
                    noKey: 'common.nokey.lbl',
                    onSuccessMethod: $scope.saveItem,
                };
                utl.Dialog.confirmMessage(confirmOptions);
            }
        };

        $scope.saveItem = function () {
            var getbills = getSelectionRows();
            var actionName = 'billing/PatientBills/ConsolidatePayment';
            var options = {
                action: actionName,
                data: { Data: { PaymentDetail: $scope.item, Bills: getbills } },
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
                        "<span >{{row.entity.Patient.FirstName}}&nbsp;</span>" + "<span > </span>" +
                        "<span >{{row.entity.Patient.LastName}}&nbsp;</span>" +
                        "<span >/</span>" +
                        "<span >{{row.entity.Patient.MRN}}&nbsp;</span>" +
                        "<span >/<span>" +
                        "<span >{{row.entity.Patient.Age}}&nbsp;</span>" +
                        "<span >/</span>" +
                        "<span >{{row.entity.Patient.Gender.Description}}</span>" +
                        "</a></div>"
                },
                {
                    field: "Amount", displayName: $translate.instant('billing.consolidate.billamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.BillAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "GrossGSTAmount", displayName: $translate.instant('billing.consolidate.discount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.BillDiscount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "DoctorShare", displayName: $translate.instant('billing.consolidate.roundoff.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.RoundOff | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "NetAmount", displayName: $translate.instant('billing.consolidate.netamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.NetAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "Doctor", displayName: $translate.instant('billing.consolidate.paidamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.PaidAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "Doctor", displayName: $translate.instant('billing.consolidate.dueamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.OutStandingAmount | displaycurrency}}</span>" + "</div>"
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
                var amt = parseFloat($scope.item.Received) + parseFloat(item.PaidAmount);
                $scope.item.Received = eval(amt).toFixed(2);
            } else {
                $scope.item.OutStandingAmt = parseFloat($scope.item.OutStandingAmt) - parseFloat(item.OutStandingAmount);
                $scope.item.Discount = parseFloat($scope.item.Discount) - parseFloat(item.BillDiscount);
                $scope.item.BillAmount = parseFloat($scope.item.BillAmount) - parseFloat(item.BillAmount);
                var amt = parseFloat($scope.item.Received) - parseFloat(item.PaidAmount);
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
                { "Key": "PaymentType" },
                { "Key": "Bank" },
                { "Key": "CardType" },
                { "Key": "Terminal" }
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
                utl.Alert.showSuccessMsg($translate.instant('billing.consolidatepayment.noperference.lbl'));
                return false;
            } else {
                var dmAllPrintInput = preparePrintData();
                console.log(dmAllPrintInput);
                $scope.printConsolidatePayment(dmAllPrintInput);
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

        function toIsoDate(d) {
            if (!d) return null;
            var dt = (d instanceof Date) ? d : new Date(d);
            if (isNaN(dt.getTime())) return null;
            var mm = ('0' + (dt.getMonth() + 1)).slice(-2);
            var dd = ('0' + dt.getDate()).slice(-2);
            return dt.getFullYear() + '-' + mm + '-' + dd;
        }

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                currentfilter: {
                    PatientId: $scope.currentfilter.PatientId,
                    BillTypeId: $scope.currentfilter.BillTypeId
                },
                lookup: $scope.lookup,
                item: angular.extend({}, $scope.item, {
                    CollectedOn: toIsoDate($scope.item.CollectedOn),
                    ChequeDate: toIsoDate($scope.item.ChequeDate),
                    DDDate: toIsoDate($scope.item.DDDate),
                    WireTransferDate: toIsoDate($scope.item.WireTransferDate)
                }),
                canSaveAndApprove: $scope.canSaveAndApprove,
                printpreferences: $scope.printpreferences,
                bills: vm.gridConfig.data
            };
            $scope.$applyAsync();
        };

        var _origGetListCallback = $scope.getListCallback;
        $scope.getListCallback = function (scope, res, options, hasError) {
            _origGetListCallback(scope, res, options, hasError);
            $scope.refreshReactProps();
        };

        var _origSaveItemCallback = $scope.saveItemCallback;
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            _origSaveItemCallback(scope, data, options, hasError);
            $scope.refreshReactProps();
        };

        $scope.handleReactAction = function (actionName, payload) {
            payload = payload || {};
            if (actionName === 'billTypeChange') {
                $scope.currentfilter.BillTypeId = payload.value;
                $scope.refreshReactProps();
            } else if (actionName === 'loadBills') {
                $scope.getList();
            } else if (actionName === 'find') {
                $scope.findConsolidatePayBills();
            } else if (actionName === 'clear') {
                $scope.Clear();
            } else if (actionName === 'sortBills') {
                // Mirrors the real customTableController.reOrder(column) exactly --
                // same dotted-path field lookup, same case-insensitive string
                // compare, same in-place mutation of vm.gridConfig.data (which is
                // what genuinely drives the AngularJS-owned totals/print/save
                // logic downstream). See BillingConsolidatePaymentGridScreen.tsx
                // for the full disclosure of the column/field mismatches this
                // reproduces verbatim (e.g. the "Bill Amount" header sorts by the
                // unrelated "Amount" field, not BillAmount).
                var columnDef = null;
                for (var ci = 0; ci < vm.gridConfig.columnDefs.length; ci++) {
                    if (vm.gridConfig.columnDefs[ci].field === payload.field) {
                        columnDef = vm.gridConfig.columnDefs[ci];
                        break;
                    }
                }
                if (columnDef) {
                    if (!columnDef['order']) {
                        columnDef['order'] = 1;
                    } else {
                        columnDef['order'] = -columnDef['order'];
                    }
                    var field = columnDef['field'];
                    var order = columnDef['order'];
                    vm.gridConfig.data = vm.gridConfig.data.sort(function (a, b) {
                        var breaq = false;
                        a = field.split('.').reduce(function (o, i) {
                            if (!breaq && o[i]) { return o[i]; } else { breaq = true; }
                        }, a);
                        breaq = false;
                        b = field.split('.').reduce(function (o, i) {
                            if (!breaq && o[i]) { return o[i]; } else { breaq = true; }
                        }, b);
                        var x = a ? a.toLowerCase() : '';
                        var y = b ? b.toLowerCase() : '';
                        if (x < y) { return -order; }
                        if (x > y) { return order; }
                        return 0;
                    });
                    $scope.refreshReactProps();
                }
            } else if (actionName === 'paymentTypeChange') {
                $scope.item.PaymentTypeId = payload.value;
                $scope.refreshReactProps();
            } else if (actionName === 'bankChange') {
                $scope.item.BankId = payload.value;
                $scope.refreshReactProps();
            } else if (actionName === 'chequeNoChange') {
                $scope.item.ChequeNo = payload.value;
                $scope.refreshReactProps();
            } else if (actionName === 'ddNumberChange') {
                $scope.item.DDNumber = payload.value;
                $scope.refreshReactProps();
            } else if (actionName === 'wireTransferIdChange') {
                $scope.item.WireTransferId = payload.value;
                $scope.refreshReactProps();
            } else if (actionName === 'authorizedCodeChange') {
                $scope.item.AuthorizedCode = payload.value;
                $scope.refreshReactProps();
            } else if (actionName === 'collectedOnChange') {
                $scope.item.CollectedOn = payload.value ? new Date(payload.value) : null;
                $scope.refreshReactProps();
            } else if (actionName === 'terminalChange') {
                $scope.item.TerminalNoId = payload.value;
                $scope.refreshReactProps();
            } else if (actionName === 'chequeDateChange') {
                $scope.item.ChequeDate = payload.value ? new Date(payload.value) : null;
                $scope.refreshReactProps();
            } else if (actionName === 'ddDateChange') {
                $scope.item.DDDate = payload.value ? new Date(payload.value) : null;
                $scope.refreshReactProps();
            } else if (actionName === 'wireTransferDateChange') {
                $scope.item.WireTransferDate = payload.value ? new Date(payload.value) : null;
                $scope.refreshReactProps();
            } else if (actionName === 'cardTypeChange') {
                $scope.item.CardTypeId = payload.value;
                $scope.refreshReactProps();
            } else if (actionName === 'saveAndApprove') {
                $scope.saveAndApprove();
            } else if (actionName === 'print') {
                // Confirmed dead in the real template too: ng-click="print()" has
                // no matching $scope.print definition anywhere in this controller
                // (unlike many sibling screens, which each define their own
                // $scope.print). Clicking it today throws inside Angular's
                // expression evaluator, silently caught, no visible effect.
                // Reproduced as a no-op.
            }
        };

        $scope.getPharmacyPrintPreference();
        $scope.initLookup();
    }

    consolidatepaymentController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();