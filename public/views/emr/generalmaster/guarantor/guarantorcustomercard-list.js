(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('guarantorcustomercardListController', guarantorcustomercardListController);

    function guarantorcustomercardListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.item = {};
        $scope.currentfilter = {};
        $scope.currentcontext = {};
        $scope.currentcontext.guarantorid = parseInt($stateParams.gid);

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            if ($scope.currentcontext.guarantorid > 0) {
                var inputData = {
                    Params: [
                        { Key: 1, Value: $scope.currentcontext.guarantorid },
                        { Key: 2, Value: 2 }
                    ],
                    PageContext: {
                        PageSize: vm.gridConfig.pagerObj.pageSize,
                        PageNumber: vm.gridConfig.pagerObj.currentPage
                    }
                };

                var options = {
                    action: 'generalmaster/GuarantorCustomerCard/GetGuarantorCustomerCards',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getListCallback
                };

                utl.Http.doAction(options);
            }
        };

        $scope.addNew = function () {
            $scope.openModal('app.guarantortab.guarantorcustomercard-form', { gid: 0 });
        };

        $scope.backToList = function () {
            $state.go('app.guarantortab.general');
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'generalmaster/GuarantorCustomerCard/DeleteGuarantorCustomerCard',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.openModal = function (Id) {
            utl.Modal.open('app.guarantortab.guarantorcustomercard-form', {
                params: { id: Id },
                confirmCallback: $scope.getList
            });
        };

        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'edit') {
                $scope.openModal(row.entity.Id);
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "GuarantorCustomer.CustomerName", displayName: $translate.instant('generalmaster.customercard.customername.lbl') },
                { field: "CardMasterType.Description", displayName: $translate.instant('generalmaster.customercard.cardtype.lbl') },
                { field: "CardCode", displayName: $translate.instant('generalmaster.customercard.cardcode.lbl') },
                { field: "CardName", displayName: $translate.instant('generalmaster.customercard.cardname.lbl') },
                { field: "PolicyNo", displayName: $translate.instant('generalmaster.customercard.policyno.lbl') },
                { field: "PolicyName", displayName: $translate.instant('generalmaster.customercard.policyname.lbl') },
                { field: "CreditLimit", displayName: $translate.instant('generalmaster.customercard.creditlimit.lbl') },
                { field: "ApprovalLimit", displayName: $translate.instant('generalmaster.customercard.approvallimit.lbl') },
                { field: "DeductableLimit", displayName: $translate.instant('generalmaster.customercard.deductablelimit.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('generalmaster.customercard.status.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
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
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "CardMasterType" },
                { "Key": "ActiveStatus" }
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

    guarantorcustomercardListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();