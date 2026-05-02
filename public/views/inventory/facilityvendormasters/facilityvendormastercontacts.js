(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('facilityvendormasterContactListController', facilityvendormasterContactListController);

    function facilityvendormasterContactListController($scope, $stateParams, $state, $translate, utl) {
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
                action: 'pharmacy/vendormaster/GetVendorContacts',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            $state.go('app.facilityvendormastertab.facilityvendormastercontact', { vendorcontactid: 0, VendorFacilityMapId: parseInt($stateParams.id), VendorMasterId: $state.params.VendorMasterId, VendorCode: $state.params.VendorCode, VendorName: $state.params.VendorName });
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'pharmacy/vendormaster/DeleteVendorContact',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'edit') {
                $state.go('app.facilityvendormastertab.facilityvendormastercontact', { vendorcontactid: row.entity.Id });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id);
            }
        };

        vm.gridConfig = {
            columnDefs: [
                { field: "ContactType.Description", displayName: $translate.instant('inventory.facilityvendormastercontacts.contacttype.lbl') },
                { field: "ContactPerson", displayName: $translate.instant('inventory.facilityvendormastercontacts.contactperson.lbl') },
                { field: "MobileNo", displayName: $translate.instant('inventory.facilityvendormastercontacts.mobileno.lbl') },
                { field: "PhoneNo", displayName: $translate.instant('inventory.facilityvendormastercontacts.phoneno.lbl') },
                { field: "EMail", displayName: $translate.instant('inventory.facilityvendormastercontacts.email.lbl') },
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
                { "Key": "Facility" }
            ]
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

    facilityvendormasterContactListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();