(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('guarantorcustomerListController', guarantorcustomerListController);

    function guarantorcustomerListController($scope, $stateParams, $state, $translate, utl) {
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
                    action: 'generalmaster/GuarantorCustomer/GetGuarantorCustomers',
                    data: inputData,
                    type: 'post',
                    onComplete: $scope.getListCallback
                };

                utl.Http.doAction(options);
            }
        };

        $scope.addNew = function () {
            $scope.openModal('app.guarantortab.guarantorcustomer-form', { gid: 0 });
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
                action: 'generalmaster/GuarantorCustomer/DeleteGuarantorCustomer',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.openModal = function (Id) {
            utl.Modal.open('app.guarantortab.guarantorcustomer-form', {
                params: { id: Id },
                confirmCallback: $scope.getList
            });
        };

        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'edit') {
                $scope.openModal(row.entity.Id);
                //$scope.openModal('app.guarantortab.guarantorcustomers', { gid: row.entity.Id });
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "CustomerType.Description", displayName: $translate.instant('generalmaster.customer.customertype.lbl') },
                { field: "CustomerCode", displayName: $translate.instant('generalmaster.customer.customercode.lbl') },
                { field: "CustomerName", displayName: $translate.instant('generalmaster.customer.customername.lbl') },
                { field: "PolicyNo", displayName: $translate.instant('generalmaster.customer.policyno.lbl') },
                { field: "PolicyName", displayName: $translate.instant('generalmaster.customer.policyname.lbl') },
                { field: "CreditLimit", displayName: $translate.instant('generalmaster.customer.creditlimit.lbl') },
                { field: "ApprovalLimit", displayName: $translate.instant('generalmaster.customer.approvallimit.lbl') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('generalmaster.customer.status.lbl') },
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
                { "Key": "CustomerType" },
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

    guarantorcustomerListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();