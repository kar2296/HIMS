(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('opbillingFormController', opbillingFormController);

    function opbillingFormController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getBaseCtrl({ $scope: $scope }));

        $scope.Items = [];
        $scope.currentfilter = {
            name: ''
        };
        $scope.item = {
            PaymentTypeId: 1,
            CurrencyTypeId: 1,
            ReceiptTypeId: 1

        };


        $scope.cancelCallback = $uibModalInstance.dismiss;
        $scope.currentcontext = {};
        $scope.currentcontext.patientid = parseInt($stateParams.id);
        $scope.item.CollectedOn = new Date();
        $scope.item.ChequeDate = new Date();
        $scope.item.DDDate = new Date();
        $scope.item.WireTransferDate = new Date();


        $scope.getListCallback = function (scope, data, options, hasError) {
            console.log(data.Data);
            vm.gridConfig.data = data.Data;
            $scope.refreshPaymentGridProps();
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var inputData = {
                Params: [

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

        $scope.backToList = function () {
            $scope.cancelCallback();
        }

        $scope.saveItemCallback = function (scope, data, options, hasError) {

            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.getList();
        };

        $scope.saveItem = function () {
            if ($scope.item.PatientId <= 0) {
         utl.Alert.showSuccessMsg($translate.instant('admission.selectthepatient.lbl'));
                return;
            }

            if ($scope.item.PaymentTypeId <= 0) {
         utl.Alert.showSuccessMsg($translate.instant('admission.selectthepaymentmode.lbl'));

                return;
            }


            if (!utl.Validator.validate($scope)) {
                return;
            }

            var actionName = 'Billing/PatientPaymentDetails/AddPatientPaymentDetails';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'Billing/PatientPaymentDetails/UpdatePatientPaymentDetails';
            }

            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList()
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'Billing/PatientPaymentDetails/DeletePatientPaymentDetails',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }

        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'edit') {
                $state.go('', { opbillingid: row.entity.Id });
            }
            else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id);
            }
        }

        vm.gridConfig = {
            columnDefs: [
                { field: "PaymentType.Description", displayName: $translate.instant('billing.opbilling-form.mode.lbl') },
                { field: "AmountPaid", displayName: $translate.instant('billing.opbilling-form.amount.lbl') },
                { field: "Bank.Description", displayName: $translate.instant('billing.opbilling-form.bankname.lbl') },
                { field: "CardType.Description", displayName: $translate.instant('billing.opbilling-form.cardtype.lbl') },
                { field: "AuthorizedCode", displayName: $translate.instant('billing.opbilling-form.authcode.lbl') },
                { field: "TerminalNoId", displayName: $translate.instant('billing.opbilling-form.terminalno.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: 'actionTemplate.html',
                    actions: [
                        { actiontype: 'edit', display: 'common.editaction.lbl' },
                        { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
            $scope.refreshReactProps();
            $scope.refreshPaymentGridProps();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "opbillingType" },
                { "Key": "CurrencyType" },
                { "Key": "CardType" },
                { "Key": 'Bank' },
                { "Key": "ReceiptType" },
                { "Key": "PaymentType" }

            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }


        // Grid bridge: replaces the last native <div ui-grid="vm.gridConfig">
        // on this form with a BridgeGridScreen mount. Only that grid is
        // touched -- every existing React mount, payment action, save/approval
        // path, discount flow, terminal/payment-mode behaviour, focus adapter,
        // API call, facility-setting variant and print/claim behaviour on this
        // form is left exactly as it is.
        //
        // This is a REAL ui-grid, so row.entity / grid.appScope were valid; the
        // dispatcher hands $scope.handleEvents the SAME { entity: ... } wrapper
        // it received before, so $state.go and utl.Dialog.confirmDelete still
        // run unchanged. The action column renders the shared
        // actionTemplate.html (app.html) driven by colDef.actions, which here
        // is [{ actiontype: 'edit' }, { actiontype: 'delete' }] -- both
        // unconditional, reproduced as two unconditional row actions.
        // All six data columns are plain fields with no cellTemplate, so no
        // formatting logic exists to preserve.
        //
        // PRE-EXISTING BUG documented, NOT fixed: the 'edit' branch of
        // $scope.handleEvents calls $state.go('') with an empty state name, so
        // the Edit action has never navigated anywhere. That handler is left
        // exactly as it is; the bridge only changes how it is reached.
        $scope.handlePaymentGridAction = function (actionType, payload) {
            var items = (vm.gridConfig && vm.gridConfig.data) || [];
            var entity = null;
            for (var i = 0; i < items.length; i++) {
                if (items[i].Id === payload.id) { entity = items[i]; break; }
            }
            if (entity === null) { return; }
            if (actionType == 'rowAction') { $scope.handleEvents(payload.key, { entity: entity }); }
        };

        $scope.refreshPaymentGridProps = function () {
            var defs = (vm.gridConfig && vm.gridConfig.columnDefs) || [];
            function hdr(i) { return defs[i] ? defs[i].displayName : ''; }
            var items = (vm.gridConfig && vm.gridConfig.data) || [];
            $scope.reactPropsPaymentGridContainer = {
                reactProps: {
                    columns: [
                        { key: 'mode', header: hdr(0), sortable: true },
                        { key: 'amount', header: hdr(1), align: 'right' },
                        { key: 'bankname', header: hdr(2), sortable: true },
                        { key: 'cardtype', header: hdr(3), sortable: true },
                        { key: 'authcode', header: hdr(4) },
                        { key: 'terminalno', header: hdr(5) }
                    ],
                    actionsHeader: hdr(6) || 'Actions',
                    hasActions: true,
                    rows: items.map(function (entity) {
                        return {
                            id: entity.Id,
                            actions: [
                                { key: 'edit', label: '', icon: 'fa fa-pencil', variant: 'success', title: 'Edit' },
                                { key: 'delete', label: '', icon: 'fa fa-trash', variant: 'danger', title: 'Delete' }
                            ],
                            cells: {
                                mode: entity.PaymentType && entity.PaymentType.Description,
                                amount: entity.AmountPaid,
                                bankname: entity.Bank && entity.Bank.Description,
                                cardtype: entity.CardType && entity.CardType.Description,
                                authcode: entity.AuthorizedCode,
                                terminalno: entity.TerminalNoId
                            }
                        };
                    })
                },
                onAction: $scope.handlePaymentGridAction
            };
        };

        // vm.gridConfig is already defined above, so the mount has real column
        // headers before the first getList() response arrives.
        $scope.refreshPaymentGridProps();

        $scope.refreshReactProps = function () {
            $scope.reactProps = {
                isDisabled: $scope.item.isDisabled,
                isCompleted: $scope.item.isCompleted,
                receiptTypeId: $scope.item.ReceiptTypeId,
                currencyTypeId: $scope.item.CurrencyTypeId,
                paymentTypeId: $scope.item.PaymentTypeId,
                bankId: $scope.item.BankId,
                cardTypeId: $scope.item.CardTypeId,
                receiptTypeOptions: ($scope.lookup && $scope.lookup.ReceiptType) || [],
                currencyTypeOptions: ($scope.lookup && $scope.lookup.CurrencyType) || [],
                paymentTypeOptions: ($scope.lookup && $scope.lookup.PaymentType) || [],
                bankOptions: ($scope.lookup && $scope.lookup.Bank) || [],
                cardTypeOptions: ($scope.lookup && $scope.lookup.CardType) || [],
                cardHolderOptions: ($scope.lookup && $scope.lookup.CardHolder) || []
            };
            $scope.$applyAsync();
        };

        $scope.handleReactAction = function (actionName, payload) {
            switch (actionName) {
                case 'receiptTypeChange':
                    $scope.item.ReceiptTypeId = payload.value;
                    $scope.refreshReactProps();
                    break;
                case 'currencyTypeChange':
                    $scope.item.CurrencyTypeId = payload.value;
                    $scope.refreshReactProps();
                    break;
                case 'paymentTypeChange':
                    $scope.item.PaymentTypeId = payload.value;
                    $scope.refreshReactProps();
                    break;
                case 'bankChange':
                    $scope.item.BankId = payload.value;
                    $scope.refreshReactProps();
                    break;
                case 'cardTypeChange':
                    $scope.item.CardTypeId = payload.value;
                    $scope.refreshReactProps();
                    break;
            }
        };

        $scope.initLookup();


    }

    opbillingFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();