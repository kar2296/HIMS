(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('facilityitemmasterCustomerMapListController', facilityitemmasterCustomerMapListController);

    function facilityitemmasterCustomerMapListController($scope, $stateParams, $state, $translate, utl, $filter, modalConfig) {
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
                    { Key: 1, Value: $scope.currentfilter.CustomerMasterId },
                    { Key: 12, Value: FacilityId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/itemmaster/GetItemCustomerMaps',
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
                action: 'pharmacy/itemmaster/DeleteItemCustomerMap',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.addNew = function () {
            utl.Modal.open('app.facilityitemmastertab.facilityitemmastercustomermapping', {
                params: { id: 0, ItemFacilityMapId: parseInt($stateParams.id), FacilityId: $state.params.FacilityId, ItemMasterId: $state.params.ItemMasterId, ItemCode: $state.params.ItemCode, ItemName: $state.params.ItemName, IsProfile: $state.params.IsProfile },
                confirmCallback: $scope.getList
            });
        };

        $scope.openModal = function (Id) {
            utl.Modal.open('app.facilityitemmastertab.facilityitemmastercustomermapping', {
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
                { field: "CustomerName", displayName: $translate.instant('inventory.itemmastercustomermappings.customername.lbl') },
                {
                    field: "UomPrice",
                    displayName: $translate.instant('inventory.itemmastercustomermapping.pponuom.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.UomPrice | displaycurrency}}&nbsp;</span>' + '</div>'
                },
                {
                    field: "UomCrPrice",
                    displayName: $translate.instant('inventory.itemmastercustomermapping.cponuom.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.UomCrPrice | displaycurrency}}&nbsp;</span>' + '</div>'
                },
                {
                    field: "UomMrPrice",
                    displayName: $translate.instant('inventory.itemmastercustomermapping.mrponuom.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.UomMrPrice | displaycurrency}}&nbsp;</span>' + '</div>'
                },
                /*
                {
                    field: "Price",
                    displayName: $translate.instant('inventory.itemmastercustomermapping.pponunit.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.Price | displaycurrency}}&nbsp;</span>' + '</div>'
                },
                {
                    field: "MrPrice",
                    displayName: $translate.instant('inventory.itemmastercustomermapping.cponunit.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.MrPrice | displaycurrency}}&nbsp;</span>' + '</div>'
                },
                */
                /* { field: "FreeQty", displayName: $translate.instant('inventory.itemmastercustomermapping.freeqty.lbl') }, */
                { field: "DiscountMode.Description", displayName: $translate.instant('inventory.itemmastercustomermapping.discountmode.lbl') },
                {
                    field: "Discount",
                    displayName: $translate.instant('inventory.itemmastercustomermapping.discount.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.Discount | displaycurrency}}&nbsp;</span>' + '</div>'
                },
                { field: "ActiveStatus.Description", displayName: $translate.instant('inventory.itemmastercustomermappings.status.lbl') },
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

        vm.customercontrolconfig = {
            query: '',
            searchbyid: false,

            options: [
                { header: 'Customer Code', field: 'CustomerCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Customer Name', field: 'CustomerName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Customer Contact', field: 'PhoneNumber', datatype: 'string', headercls: 'td-phoneno', fieldcls: 'td-phoneno' }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/customermaster/GetCustomerMasters',
            formatdisplay: formatselectedcustomer,
            presearch: presearchcustomer,
            postsearch: postsearchcustomer
        };

        function formatselectedcustomer() {
            var selectedItem = vm.customercontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.CustomerName + ' (' + selectedItem.CustomerCode + ')'].join(' ');
            } else if (vm.customercontrolconfig.rowdata) {
                result = [vm.customercontrolconfig.rowdata.CustomerName, vm.customercontrolconfig.rowdata.CustomerCode].join(' ');
            }

            $scope.getList();

            return result;
        }

        function presearchcustomer() {
            var query = vm.customercontrolconfig.query;

            var inputData = {
                Params: [],
                PageContext: { PageSize: 25, PageNumber: 1 }
            };

            if (vm.customercontrolconfig.searchbyid === true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 2, Value: query });
            }

            vm.customercontrolconfig.searchparams = inputData;
        }

        function postsearchcustomer() {
            for (var idx in vm.customercontrolconfig.result) {
                var item = vm.customercontrolconfig.result[idx];

                item.CustomerCode = item.CustomerCode;
                item.CustomerName = item.CustomerName;
                item.PhoneNumber = item.PhoneNumber;
            }
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

    facilityitemmasterCustomerMapListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', 'modalConfig'];

})();