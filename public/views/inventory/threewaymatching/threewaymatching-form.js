(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('threewayMatchingFormController', threewayMatchingFormController);

    function threewayMatchingFormController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        $scope.SelectedIndex = -1;

        $scope.item = {
            invoicedate: utl.Formatter.getCurrentDate(),
        };
        $scope.currentcontext = {};
        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentfilter = {
            invoiceDate: utl.Formatter.getCurrentDate(),
            VendorId: -1,
            PoTypeId: -1
        };

        $scope.getListCallback = function (scope, data, options, hasError) {

            vm.gridConfig.data = data.Data;
            vm.gridConfig.pagerObj.totalItems = data.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {
            var inputData = {
                Params: [

                ],
            
            PageContext: {
                PageSize: vm.gridConfig.pagerObj.pagerSize,
                PageNumber: vm.gridConfig.pagerObj.currentPage
            }
        };
        var options = {
            action: 'pharmacy/threewaymatching/Getthreewaymatching',
            data: inputData,
            type: 'post',
            onComplete: $scope.getListCallback
        };
        utl.Http.doAction(options);
 };
    
        $scope.cancelCallback = function (scope, data, options, hasError) {

            $scope.item = data;
            $scope.cancelItem()
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };
        $scope.backToList = function () {
            $state.go('app.threewaymatchings');
        }
        $scope.save = function () {
            if ($scope.currentcontext.id == 0) { $scope.item.DoctorInvoiceId = 1; }
            $scope.saveItem();
        };
        $scope.saveAndApprove = function () {
            $scope.item.ActiveStatus = 'Active'
            $scope.item.DoctorInvoiceId = 2;
            $scope.saveItem();
        };

        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };
        $scope.clearItem = function () {
            $scope.item = {};
            $scope.fillDefaultValues();
        }
        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'pharmacy/threewaymatching/Deletethreewaymatching',
                type: 'post',
                oncomplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        }
        vm.gridConfig = {
            columnDefs: [
                { field: "Date", displayName: $translate.instant('inventory.threewaymatching-form.date.lbl') },
                { field: "Type", displayName: $translate.instant('inventory.threewaymatching-form.type.lbl') },
                { field: "PO", displayName: $translate.instant('inventory.threewaymatching-form.po.lbl'),
                     cellTemplate: "<div class='ui-grid-cell-contents'><span ></span></div>"
                },
                { field: "ItemCode", displayName: $translate.instant('inventory.threewaymatching-form.itemcode.lbl') },
                { field: "itemname", displayName: $translate.instant('inventory.threewaymatching-form.itemname.lbl') },
                { field: "Qty", displayName: $translate.instant('inventory.threewaymatching-form.qty.lbl') },
                { field: "Cost", displayName: $translate.instant('inventory.threewaymatching-form.cost.lbl') },
                { field: "Amount", displayName: $translate.instant('inventory.threewaymatching-form.amount.lbl') },
                { field: "Tax", displayName: $translate.instant('inventory.threewaymatching-form.tax.lbl') },
                { field: "Disc", displayName: $translate.instant('inventory.threewaymatching-form.disc.lbl') },
                { field: "Net", displayName: $translate.instant('inventory.threewaymatching-form.net.lbl') }

            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            initDynamicForm();
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "VendorMaster" },
                { "Key": "PoType" }

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

    threewayMatchingFormController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();