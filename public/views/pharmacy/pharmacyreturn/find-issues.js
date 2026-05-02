(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('pharmacyreturnfindissuesController', pharmacyreturnfindissuesController);

    function pharmacyreturnfindissuesController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            name: ''
        };
        $scope.cancelCallback = $uibModalInstance.dismiss;
        $scope.currentcontext = {};
        $scope.currentcontext.patientid = parseInt($stateParams.id);

        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = data;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.patientid }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'generalmaster/opbilling/Getopbillings',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions


        $scope.backToList = function () {
            if ($scope.currentcontext.ismodal) {
                $scope.confirmCallback();
            } else {
                $state.go('app.opbilling', { pid: $scope.currentcontext.pid });
            }
        }

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'generalmaster/opbilling/Deleteopbilling',
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
                { field: "opbillingType.Description", displayName: $translate.instant('billing.opbilling-form.mode.lbl') },
                { field: "IDNumber", displayName: $translate.instant('billing.opbilling-form.amount.lbl') },
                { field: "Comments", displayName: $translate.instant('billing.opbilling-form.bankname.lbl') },
                { field: "opbillingType.Description", displayName: $translate.instant('billing.opbilling-form.cardtype.lbl') },
                { field: "IDNumber", displayName: $translate.instant('billing.opbilling-form.authcode.lbl') },
                { field: "Comments", displayName: $translate.instant('billing.opbilling-form.terminalno.lbl') },
                {
                    field: "Id", displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: 'actionTemplate.html',
                    actions: [
                        { actiontype: 'edit', display: 'common.editaction.lbl' },
                        { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
                }
            ]
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "opbillingType" }
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

    pharmacyreturnfindissuesController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();