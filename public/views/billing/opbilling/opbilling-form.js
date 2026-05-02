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

        $scope.initLookup();


    }

    opbillingFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();