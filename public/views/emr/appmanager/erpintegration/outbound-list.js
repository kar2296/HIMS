(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('outboundListController', outboundListController);

    function outboundListController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        $scope.isErpValidation = 0;
        $scope.contexttc = null,
            $scope.Items = [];
        $scope.item = {
            AccountId: -1,
            InventoryId: -1,
            ARCollectionId: -1,
            ReleaseToPatientId: -1,
            MasterId: -1,
            FacilityId: utl.Session.getCurrentFacilityId(),
        };
        $scope.ARCollectionSelection = function (ARCollectionId) {
            if (ARCollectionId > 0) {
                $scope.item.AccountId = -1;
                $scope.item.InventoryId = -1;
                $scope.item.ReleaseToPatientId = -1;
                $scope.item.MasterId = -1;
                $scope.gridClear();
            }
        };
        $scope.ReleaseToPatientSelection = function (ReleaseToPatientId) {
            if (ReleaseToPatientId > 0) {
                $scope.item.AccountId = -1;
                $scope.item.InventoryId = -1;
                $scope.item.ARCollectionId = -1;
                $scope.item.MasterId = -1;
                $scope.gridClear();
            }
        };
        $scope.MasterSelection = function (MasterId) {
            if (MasterId > 0) {
                $scope.item.AccountId = -1;
                $scope.item.InventoryId = -1;
                $scope.item.ARCollectionId = -1;
                $scope.item.ReleaseToPatientId = -1;
                $scope.gridClear();
            }
        };
        $scope.AccountSelection = function (AccountId) {
            if (AccountId > 0) {
                $scope.item.InventoryId = -1;
                $scope.item.ARCollectionId = -1;
                $scope.item.ReleaseToPatientId = -1;
                $scope.item.MasterId = -1;
                $scope.gridClear();
            }
        };
        $scope.InventorySelection = function (InventoryId) {
            if (InventoryId > 0) {
                $scope.item.AccountId = -1;
                $scope.item.ARCollectionId = -1;
                $scope.item.ReleaseToPatientId = -1;
                $scope.item.MasterId = -1;
                $scope.gridClear();
            }
        };
        $scope.validationXMLCallback = function (scope, data, options, hasError) {
            if (typeof (data) == "boolean") {
                if (data) {
                    $scope.isErpValidation = 1;
                    utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
                } else {
                    $scope.isErpValidation = 0;
                    utl.Alert.showErrorMsg($translate.instant('common.validationmsg.lbl'));
                }
            }
        };
        $scope.Validate = function () {
            var targetcontext = $scope.contexttc;
            if (vm.gridConfig.data) {
                var Itemdatas = vm.gridConfig.data;
                var actionName = 'SystemSettingsERPIntegration/ERPValidation';
                var options = {
                    action: actionName,
                    data: {
                        Data: { Itemdatas, targetcontext }
                    },
                    type: 'post',
                    onComplete: $scope.validationXMLCallback
                };

                utl.Http.doAction(options);
            }

        };
        $scope.exportXMLCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        };
        $scope.ExportXML = function () {
            if ($scope.isErpValidation == 0) {
                utl.Alert.showErrorMsg($translate.instant('common.validationmsg.lbl'));
            }
            else {
                if (vm.gridConfig.data) {
                    var targetcontext = $scope.contexttc;
                    var Itemdatas = vm.gridConfig.data;
                    var actionName = 'SystemSettingsERPIntegration/ERPIntegrationXML';
                    var options = {
                        action: actionName,
                        data: {
                            Data: { Itemdatas, targetcontext }
                        },
                        type: 'post',
                        onComplete: $scope.exportXMLCallback
                    };

                    utl.Http.doAction(options);
                }
            }
        };
        $scope.ExportXL = function () {
            if ($scope.isErpValidation == 0) {
                utl.Alert.showErrorMsg($translate.instant('common.validationmsg.lbl'));
            }
            else {
                if (vm.gridConfig.data) {
                    var targetcontext = $scope.contexttc;
                    var Itemdatas = vm.gridConfig.data;
                    var actionName = 'SystemSettingsERPIntegration/ERPIntegrationXL';
                    var options = {
                        action: actionName,
                        data: {
                            Data: { Itemdatas, targetcontext }
                        },
                        type: 'post',
                        onComplete: $scope.exportXMLCallback
                    };

                    utl.Http.doAction(options);
                }
            }
        };
        $scope.LoadData = function () {
            $scope.isErpValidation = 0;
            $scope.gridClear();
            console.log("test");
            if ($scope.item.MasterId > 0) {
                if ($scope.item.MasterId == 1) { // Guarantor Master  
                    $scope.getGuarantorMasterList();
                } else if ($scope.item.MasterId == 2) { // Vendor Master 
                    $scope.getVendorMasterList();
                }
            }
            else if ($scope.item.InventoryId > 0) {

            }
            else if ($scope.item.AccountId > 0) {

            }
            else if ($scope.item.ARCollectionId > 0) {
                if ($scope.item.ARCollectionId == 5) { // Finance Receivable  
                    if ($scope.item.FromDate && $scope.item.ToDate) { $scope.getFinanceReceivableList(); }
                    else { utl.Alert.showErrorMsg('Need From and To Date'); }
                }
            }
            else if ($scope.item.ReleaseToPatientId > 0) {

            }
        };

        /*Vendor Master */
        $scope.getVendorMasterListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            $scope.contexttc = 'VendorMasterFormat';
        };
        $scope.getVendorMasterList = function () {
            vm.gridConfig = {
                enableColumnResizing: true,
                columnDefs: [
                    { field: "VendorCode", displayName: $translate.instant('inventory.vendormasters.code.lbl') },
                    { field: "VendorName", displayName: $translate.instant('inventory.vendormasters.name.lbl') },
                    { field: "VendorType.Description", displayName: $translate.instant('inventory.vendormasters.type.lbl') },
                    { field: "BusinessDomain.Description", displayName: $translate.instant('inventory.vendormaster.businessdomain.lbl') },
                    { field: "DistributionType.Description", displayName: $translate.instant('inventory.vendormaster.distributiontype.lbl') },
                    { field: "PhoneNumber", displayName: $translate.instant('inventory.vendormasters.number.lbl') },
                    { field: "EmailAddress", displayName: $translate.instant('inventory.vendormasters.email.lbl') },
                    { field: "City", displayName: $translate.instant('inventory.vendormasters.city.lbl') },
                    { field: "LeadTime", displayName: $translate.instant('inventory.vendormasters.leadtime.lbl') },
                    { field: "ActiveStatus.Description", displayName: $translate.instant('inventory.vendormasters.status.lbl') }
                ]
            };
            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 10000000000,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'pharmacy/vendormaster/GetVendorMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getVendorMasterListCallback
            };

            utl.Http.doAction(options);
        };
        /*Vendor Master */

        /*Guarantor Master */
        $scope.getGuarantorMasterListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            $scope.contexttc = 'GuarantorMasterFormat';
        };
        $scope.getGuarantorMasterList = function () {
            vm.gridConfig = {
                enableColumnResizing: true,
                columnDefs: [
                    { field: "Code", displayName: $translate.instant('generalmaster.guarantor-list.code.lbl') },
                    { field: "GuarantorName", displayName: $translate.instant('generalmaster.guarantor-list.guarantorname.lbl') },
                    { field: "GuarantorType.Description", displayName: $translate.instant('generalmaster.guarantor-list.type.lbl') },
                    {
                        field: "ContractDate", displayName: $translate.instant('generalmaster.guarantor-list.contractdate.lbl'),
                        cellTemplate: "<ngformatdate date-val='row.entity.ContractDate'></ngformatdate>"
                    },
                    {
                        field: "ContractExpiryDate", displayName: $translate.instant('generalmaster.guarantor-list.expirydate.lbl'),
                        cellTemplate: "<ngformatdate date-val='row.entity.ContractExpiryDate'></ngformatdate>"
                    },
                    { field: "TPA.Description", displayName: $translate.instant('generalmaster.guarantor-list.tpa.lbl') },
                    { field: "CreditLimit", displayName: $translate.instant('generalmaster.guarantor-list.creditlimit.lbl') },
                    { field: "AvailableLimit", displayName: $translate.instant('generalmaster.guarantor-list.availablelimit.lbl') },
                    { field: "ActiveStatus.Description", displayName: $translate.instant('generalmaster.guarantor-list.status.lbl') }
                ]
            };
            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 10000000000,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'generalmaster/guarantor/GetGuarantors',
                data: inputData,
                type: 'post',
                onComplete: $scope.getGuarantorMasterListCallback
            };

            utl.Http.doAction(options);
        };
        /*Guarantor Master */

        /*FinanceReceivable */
        $scope.GetFinanceRefundListCallback = function (scope, res, options, hasError) {
            //console.log(res.Data);  
            var items = res.Data;
            for (var i = 0; i < items.length; i++) {
                var data = (118 + (i + 1));
                var lineno = (10000 * (i + 6));
                var ConvertionData = {
                    AmountPaid: -1 * items[i].RefundAmount,
                    AuthorizeNumber: items[i].AuthorizeNumber,
                    AuthorizedCode: null,
                    Bank: null,
                    BankId: items[i].BankId,
                    BillTypeId: null,
                    CancelReason: items[i].CancelReason,
                    CardDateTime: items[i].CardDateTime,
                    CardExpiryDate: items[i].CardExpiryDate,
                    CardHolderName: items[i].CardHolderName,
                    CardNumber: items[i].CardNumber,
                    CardType: null,
                    CardTypeId: items[i].CardTypeId,
                    ChequeDate: items[i].ChequeDate,
                    ChequeNo: items[i].ChequeNo,
                    CollectedOn: null,
                    Comments: items[i].Comments,
                    CreatedAt: items[i].CreatedAt,
                    CreatedBy: items[i].CreatedBy,
                    CreatedUser: items[i].CreatedUser,
                    CreditNoteId: null,
                    CurrencyTypeId: null,
                    DDDate: items[i].DDDate,
                    DDNumber: items[i].DDNumber,
                    Department: items[i].Department,
                    DepartmentID: items[i].DepartmentID,
                    Disallowance: null,
                    DoctorId: items[i].DoctorId,
                    Encounter: items[i].Encounter,
                    EncounterId: items[i].EncounterId,
                    EncounterTypeId: items[i].EncounterTypeId,
                    FacilityId: items[i].FacilityId,
                    GuarantorId: items[i].GuarantorId,
                    GuarantorType: null,
                    GuarantorTypeId: items[i].GuarantorTypeId,
                    GurantorName: items[i].GurantorName,
                    Id: items[i].Id,
                    IsClaimed: 0,
                    IsConsolidatePay: 0,
                    IsPharmacyReceipt: 0,
                    OrganizationId: items[i].OrganizationId,
                    Patient: items[i].Patient,
                    PatientBillId: items[i].PatientBillId,
                    PatientId: items[i].PatientId,
                    PatientName: items[i].PatientName,
                    PaymentStatusId: null,
                    PaymentType: items[i].PaymentType,
                    PaymentTypeId: items[i].PaymentTypeId,
                    PaymentcounterID: items[i].PaymentcounterID,
                    PharmacyReceiptTypeId: null,
                    ReceiptApprovedById: items[i].RefundApprovedById,
                    ReceiptDateTime: items[i].RefundDateTime,
                    ReceiptGeneratedById: items[i].RefundGeneratedById,
                    ReceiptNumber: items[i].RefundIdentifier,
                    ReceiptStatus: items[i].RefundStatus,
                    ReceiptStatusId: items[i].RefundStatusId,
                    ReceiptType: items[i].RefundType,
                    ReceiptTypeId: items[i].RefundTypeId,
                    RoundOffValue: items[i].RoundOffValue,
                    ServiceId: null,
                    ServiceName: null,
                    TDSAmount: null,
                    TerminalNoId: items[i].TerminalNoId,
                    User: items[i].User,
                    WireTransferDate: items[i].WireTransferDate,
                    WireTransferId: items[i].WireTransferId,
                    Account_Type: 'CUSTOMER',
                    Line_No: '' + lineno,
                    Account_No: 'C-00' + data,
                    Journal_Template_Name: 'GENERAL',
                    Document_Type: 'Payment',
                    Bal_Account_No: '2910',
                    Business_Unit_Code: '101',
                    Bal_Account_Type: 'G/L Account',
                    Payment_Method_Code: 'ACCOUNT',
                    Dimension_Set_ID: '150',
                    Customer_Posting_Group: 'DOMESTIC',
                    Payment_Terms_Code: '1 DAY',
                    Gen_Bus_Posting_Group: 'NATIONAL',
                    VAT_Bus_Posting_Group: 'NATIONAL'
                }
                vm.gridConfig.data.push(ConvertionData);
            }
            //console.log(vm.gridConfig.data);
            $scope.contexttc = 'FinanceReceivableFormat';
        };
        $scope.getFinanceRefundList = function (data) {
            var FrmDate = $filter('date')($scope.item.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.item.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 3, Value: [FrmDate, ToDate] }
                ],
                PageContext: {
                    PageSize: 1000000000000000,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'Billing/PatientRefund/GetPatientRefund',
                data: inputData,
                type: 'post',
                onComplete: $scope.GetFinanceRefundListCallback
            };
            utl.Http.doAction(options);
        };
        $scope.GetFinanceReceivableListCallback = function (scope, res, options, hasError) {
            var items = res.Data;
            for (var i = 0; i < items.length; i++) {
                var mrn = '';
                if (items[i].Patient.MRN)
                    mrn = items[i].Patient.MRN;

                var data = (118 + (i + 1));
                var lineno = (10000 * (i + 6));
                items[i].Account_Type = 'CUSTOMER';
                items[i].Line_No = '' + lineno;
                items[i].Account_No = mrn;
                items[i].Journal_Template_Name = 'GENERAL';
                items[i].Document_Type = 'Payment';
                items[i].Bal_Account_No = '2910';
                items[i].Business_Unit_Code = '101';
                items[i].Bal_Account_Type = 'G/L Account';
                items[i].Payment_Method_Code = 'ACCOUNT';
                items[i].Dimension_Set_ID = '150';
                items[i].Customer_Posting_Group = 'DOMESTIC';
                items[i].Payment_Terms_Code = '1 DAY';
                items[i].Gen_Bus_Posting_Group = 'NATIONAL';
                items[i].VAT_Bus_Posting_Group = 'NATIONAL';
            }
            vm.gridConfig.data = items;
            $scope.getFinanceRefundList();
            $scope.contexttc = 'FinanceReceivableFormat';
        };
        $scope.getFinanceReceivableList = function () {
            vm.gridConfig = {
                enableColumnResizing: true,
                columnDefs: [
                    { field: "Patient.MRN", displayName: $translate.instant('MRN') },
                    {
                        field: "PatientName", displayName: $translate.instant('Patient Name'),
                        cellTemplate: "<div class='ui-grid-cell-contents'><span > " +
                        "<span ng-if ='row.entity.PatientId != 0'> " +
                        "{{row.entity.Patient.Title.Description}}.&nbsp; " +
                        "{{row.entity.Patient.FirstName}}&nbsp;{{row.entity.Patient.LastName}} </span> " +
                        "<span ng-if ='row.entity.PatientId == 0'> {{row.entity.PatientName}} </span> " +
                        "</span> </div>"
                    },
                    { field: "Patient.AddressLine1", displayName: $translate.instant('Address Line1') },
                    { field: "Patient.AddressLine2", displayName: $translate.instant('AddressLine2') },
                    { field: "Patient.City", displayName: $translate.instant('City') },
                    { field: "ReceiptNumber", displayName: $translate.instant('billing.receipt-list.receiptno.lbl') },
                    {
                        field: "ReceiptDateTime", displayName: $translate.instant('billing.receipt-list.receiptdate.lbl'),
                        cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.CreatedAt | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{row.entity.CreatedAt| date: 'HH:mm'}}</span>" + "</div>"
                    },
                    { field: "ReceiptType.Description", displayName: $translate.instant('billing.receipt-list.type.lbl') },
                    {
                        field: "AmountPaid", displayName: $translate.instant('billing.receipt-list.receiptamount.lbl'),
                        cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span>{{row.entity.AmountPaid | displaycurrency}}</span>' + '</div>'
                    },
                    // { field: "RefundIdentifier", displayName: $translate.instant('billing.refund-list.refundno.lbl') },
                    // {
                    //     field: "RefundDateTime", displayName: $translate.instant('billing.refund-list.refunddate.lbl'),
                    //     cellTemplate: "<div class='ui-grid-cell-contents'><span >{{row.entity.CreatedAt | date : 'dd-MMM-yyyy'}}&nbsp;</span>" + "<span >{{row.entity.CreatedAt| date: 'HH:mm'}}</span>" + "</div>"
                    // },
                    // { field: "RefundType.Description", displayName: $translate.instant('billing.receipt-list.type.lbl') },
                    // {
                    //     field: "RefundAmount", displayName: $translate.instant('billing.refund-list.refundamount.lbl'),
                    //     cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span> -{{row.entity.RefundAmount}}</span>' + '</div>'
                    // },
                    { field: "PaymentType.Description", displayName: $translate.instant('billing.receipt-list.paymentmode.lbl') },
                    { field: "ReceiptStatus.Description", displayName: $translate.instant('billing.receipt-list.status.lbl') },
                    //{ field: "RefundStatus.Description", displayName: $translate.instant('billing.receipt-list.status.lbl') },
                ]
            };
            var FrmDate = $filter('date')($scope.item.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var ToDate = $filter('date')($scope.item.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 3, Value: [FrmDate, ToDate] }
                ],
                PageContext: {
                    PageSize: 1000000000000000,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'Billing/PatientPaymentDetails/GetPatientPaymentDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.GetFinanceReceivableListCallback
            };
            utl.Http.doAction(options);
        };
        /*FinanceReceivable */

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
            ]
        };

        $scope.gridClear = function () {
            vm.gridConfig = {
                enableColumnResizing: true,
                columnDefs: [
                ]
            };
            vm.gridConfig.data = {};
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "ERPMasters", Default: false },
                { "Key": "AccountPayable", Default: false },
                { "Key": "Inventory", Default: false },
                { "Key": "ARCollection", Default: false },
                { "Key": "Revenue", Default: false },
                { "Key": "Facility", }
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

    outboundListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();