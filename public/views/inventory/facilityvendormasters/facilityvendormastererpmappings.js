(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('facilityvendormasterERPMapListController', facilityvendormasterERPMapListController);

    function facilityvendormasterERPMapListController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {};

        var vendorfacilitymapid = parseInt($stateParams.id);
        var IsProfile = $state.params.IsProfile;
        var VendorMasterId = $state.params.VendorMasterId;
        var VendorCode = $state.params.VendorCode;
        var VendorName = $state.params.VendorName;

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {
            var inputData = {
                Params: [
                    { Key: 5, Value: vendorfacilitymapid }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/vendormaster/GetVendorERPMaps',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            $state.go('app.facilityvendormastertab.facilityvendormastererpmapping', { vendorerpmapid: 0, VendorFacilityMapId: parseInt($stateParams.id), VendorMasterId: $state.params.VendorMasterId, VendorCode: $state.params.VendorCode, VendorName: $state.params.VendorName });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'pharmacy/vendormaster/DeleteVendorERPMap',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'edit') {
                $state.go('app.facilityvendormastertab.facilityvendormastererpmapping', { vendorerpmapid: row.entity.Id });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id);
            }
        }

        vm.gridConfig = {
            columnDefs: [
                { field: "ErpAccountType.Description", displayName: $translate.instant('inventory.facilityvendormastererpmappings.accounttype.lbl') },
                { field: "ErpSubAccountType.Description", displayName: $translate.instant('inventory.facilityvendormastererpmappings.subaccounttype.lbl') },
                { field: "ErpGLClassType.Description", displayName: $translate.instant('inventory.facilityvendormastererpmappings.glclasstype.lbl') },
                { field: "ErpGLClassName", displayName: $translate.instant('inventory.facilityvendormastererpmappings.glclassname.lbl') },
                { field: "ErpCreditAccountNo", displayName: $translate.instant('inventory.facilityvendormastererpmappings.creditaccountno.lbl') },
                { field: "ErpDebitAccountNo", displayName: $translate.instant('inventory.facilityvendormastererpmappings.debitaccountno.lbl') },
                { field: "Bank.Description", displayName: $translate.instant('inventory.facilityvendormastererpmappings.vendorbankname.lbl') },
                { field: "BankAccountNo", displayName: $translate.instant('inventory.facilityvendormastererpmappings.vendoraccountno.lbl') },
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
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" }
            ]
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

    facilityvendormasterERPMapListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();