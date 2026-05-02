(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('facilityitemmasterVendorMapListController', facilityitemmasterVendorMapListController);

    function facilityitemmasterVendorMapListController($scope, $stateParams, $state, $translate, utl, $filter, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));

        $scope.Items = [];
        $scope.currentfilter = {
            ActiveStatusId: 2
        };
        var itemfacilitymapid = parseInt($stateParams.id);
        var IsProfile = $state.params.IsProfile;
        var FacilityId = $state.params.FacilityId;
        var CategoryId = $state.params.CategoryId;
        var ItemMasterId = $state.params.ItemMasterId;
        var ItemCode = $state.params.ItemCode;
        var ItemName = $state.params.ItemName;

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {
            var inputData = {
                Params: [
                    { Key: 11, Value: itemfacilitymapid },
                    { Key: 5, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 1, Value: $scope.currentfilter.VendorMasterId },
                    { Key: 12, Value: FacilityId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/itemmaster/GetItemVendorMaps',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.backToList = function () {
            $state.go('app.facilityitemmastertab.facilityitemmaster');
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'pharmacy/itemmaster/DeleteItemVendorMap',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            utl.Modal.open('app.facilityitemmastertab.facilityitemmastervendormapping', {
                params: { id: 0, ItemFacilityMapId: parseInt($stateParams.id), FacilityId: $state.params.FacilityId, ItemMasterId: $state.params.ItemMasterId, ItemCode: $state.params.ItemCode, ItemName: $state.params.ItemName, IsProfile: $state.params.IsProfile },
                confirmCallback: $scope.getList
            });
        };

        $scope.openModal = function (Id) {
            utl.Modal.open('app.facilityitemmastertab.facilityitemmastervendormapping', {
                params: { id: Id, ItemFacilityMapId: parseInt($stateParams.id), FacilityId: $state.params.FacilityId, ItemMasterId: $state.params.ItemMasterId, ItemCode: $state.params.ItemCode, ItemName: $state.params.ItemName, IsProfile: $state.params.IsProfile },
                confirmCallback: $scope.getList
            });
        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'edit') {
                $scope.openModal(entity.Id);
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, entity.Id);
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "VendorName", displayName: $translate.instant('inventory.itemmastervendormappings.vendorname.lbl') },
                { field: "Rank.Description", displayName: $translate.instant('inventory.itemmastervendormappings.rank.lbl') },
                { field: "GstMaster.GstName", displayName: $translate.instant('inventory.itemmastervendormapping.gst.lbl') },
                {
                    field: "Price",
                    displayName: $translate.instant('inventory.itemmastervendormapping.price.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.Price | displaycurrency}}&nbsp;</span>' + '</div>'
                },
                {
                    field: "MrPrice",
                    displayName: $translate.instant('inventory.itemmastervendormapping.mrp.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.MrPrice | displaycurrency}}&nbsp;</span>' + '</div>'
                },
                { field: "FreeQty", displayName: $translate.instant('inventory.itemmastervendormapping.freeqty.lbl') },
                { field: "ConversionQuantity", displayName: $translate.instant('inventory.itemmastervendormapping.conversionqty.lbl') },
                { field: "DiscountMode.Description", displayName: $translate.instant('inventory.itemmastervendormapping.discountmode.lbl') },
                {
                    field: "Discount",
                    displayName: $translate.instant('inventory.itemmastervendormapping.discount.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.Discount | displaycurrency}}&nbsp;</span>' + '</div>'
                },
                { field: "ActiveStatus.Description", displayName: $translate.instant('inventory.itemmastervendormappings.status.lbl') },
                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)" ng-show="entity.ActiveStatusId==2||entity.ActiveStatusId==3||entity.ActiveStatusId==4||entity.ActiveStatusId==5"><img class="drhms-edit-button" src="assets/svg/edit.svg" aria-hidden="true"></span>\
                    <span class="grid-action" ng-click="handleEvents(\'edit\',entity)"ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                    <span class="grid-action" ng-click="handleEvents(\'delete\',entity)" ng-show="entity.ActiveStatusId==1"><img class="drhms-edit-button" src="assets/svg/delete.svg" alt=""></span>\
                </div>',
                handleEvent: $scope.handleEvents,
                    actions: [
                        { actiontype: 'edit', display: 'common.editaction.lbl' },
                        { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        vm.vendorcontrolconfig = {
            query: '',
            searchbyid: false,

            options: [
                { header: 'Vendor Code', field: 'VendorCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Vendor Name', field: 'VendorName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Vendor Contact', field: 'PhoneNumber', datatype: 'string', headercls: 'td-phoneno', fieldcls: 'td-phoneno' }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/vendormaster/GetVendorMasters',
            formatdisplay: formatselectedvendor,
            presearch: presearchvendor,
            postsearch: postsearchvendor
        };

        function formatselectedvendor() {
            var selectedItem = vm.vendorcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.VendorName + ' (' + selectedItem.VendorCode + ')'].join(' ');
            } else if (vm.vendorcontrolconfig.rowdata) {
                result = [vm.vendorcontrolconfig.rowdata.VendorName, vm.vendorcontrolconfig.rowdata.VendorCode].join(' ');
            }

            $scope.getList();

            return result;
        }

        function presearchvendor() {
            var query = vm.vendorcontrolconfig.query;

            var inputData = {
                Params: [
                    { Key: 3, Value: 1 },
                    { Key: 4, Value: 2 }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.vendorcontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 2,
                    Value: query
                });
            }

            vm.vendorcontrolconfig.searchparams = inputData;
        }

        function postsearchvendor() {
            for (var idx in vm.vendorcontrolconfig.result) {
                var item = vm.vendorcontrolconfig.result[idx];

                item.VendorCode = item.VendorCode;
                item.VendorName = item.VendorName;
                item.PhoneNumber = item.PhoneNumber;
            }
        }

        function setDefaults() {
            var ActiveId = utl.Lookup.getDefault($scope.lookup.ActiveStatus, 'Active');
            $scope.currentfilter.ActiveStatusId = ActiveId;
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
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

    facilityitemmasterVendorMapListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', 'modalConfig'];

})();