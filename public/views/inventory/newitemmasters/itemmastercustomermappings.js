(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('newitemmasterCustomerMapListController', newitemmasterCustomerMapListController);

    function newitemmasterCustomerMapListController($scope, $stateParams, $state, $translate, utl, $filter, modalConfig) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));

        $scope.Items = [];
        $scope.currentfilter = {
            ActiveStatusId: 2
        };
        var itemmasterid = parseInt($stateParams.id);
        var IsProfile = $state.params.IsProfile;
        var ItemCode = $state.params.ItemCode;
        var ItemName = $state.params.ItemName;

        $scope.getListCallback = function(scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function(pageNo) {
            var inputData = {
                Params: [
                    { Key: 2, Value: itemmasterid },
                    { Key: 5, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 1, Value: $scope.currentfilter.CustomerMasterId },
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

        $scope.backToList = function() {
            $state.go('app.itemmastertab.itemmaster');
        };

        $scope.deleteItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function(deleteId) {
            var options = {
                action: 'pharmacy/itemmaster/DeleteItemCustomerMap',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.addNew = function() {
            utl.Modal.open('app.itemmastertab.itemmastercustomermapping', {
                params: { id: 0, ItemMasterId: parseInt($stateParams.id), ItemCode: $state.params.ItemCode, ItemName: $state.params.ItemName, IsProfile: $state.params.IsProfile },
                confirmCallback: $scope.getList
            });
        };

        $scope.openModal = function(Id) {
            utl.Modal.open('app.itemmastertab.itemmastercustomermapping', {
                params: { id: Id, ItemMasterId: parseInt($stateParams.id), ItemCode: $state.params.ItemCode, ItemName: $state.params.ItemName, IsProfile: $state.params.IsProfile },
                confirmCallback: $scope.getList
            });
        };

        $scope.handleEvents = function(actionType, row) {
            if (actionType == 'edit') {
                $scope.openModal(row.entity.Id);
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id);
            }
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "CustomerName", displayName: $translate.instant('inventory.itemmastercustomermappings.customername.lbl') },
                { field: "GstMaster.GstName", displayName: $translate.instant('inventory.itemmastercustomermapping.gst.lbl') },
                {
                    field: "Price",
                    displayName: $translate.instant('inventory.itemmastercustomermapping.price.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{row.entity.Price | displaycurrency}}&nbsp;</span>' + '</div>'
                },
                {
                    field: "MrPrice",
                    displayName: $translate.instant('inventory.itemmastercustomermapping.sales.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{row.entity.MrPrice | displaycurrency}}&nbsp;</span>' + '</div>'
                },
                { field: "FreeQty", displayName: $translate.instant('inventory.itemmastercustomermapping.freeqty.lbl') },
                { field: "DiscountMode.Description", displayName: $translate.instant('inventory.itemmastercustomermapping.discountmode.lbl') },
                {
                    field: "Discount",
                    displayName: $translate.instant('inventory.itemmastercustomermapping.discount.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{row.entity.Discount | displaycurrency}}&nbsp;</span>' + '</div>'
                },
                { field: "ActiveStatus.Description", displayName: $translate.instant('inventory.itemmastercustomermappings.status.lbl') },
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
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.customercontrolconfig.searchbyid === true) {
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

        function setDefaults() {
            var ActiveId = utl.Lookup.getDefault($scope.lookup.ActiveStatus, 'Active');
            $scope.currentfilter.ActiveStatusId = ActiveId;
        }

        $scope.lookupCallback = function(scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };

        $scope.initLookup = function() {
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

    newitemmasterCustomerMapListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', 'modalConfig'];

})();