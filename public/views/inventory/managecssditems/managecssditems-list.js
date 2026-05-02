(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('managecssdsetupController', managecssdsetupController);

    function managecssdsetupController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.lookup = {};
        $scope.currentfilter = {
            itemname: '',
            FacilityId: utl.Session.getCurrentFacilityId(),
            ProductTypeId: -1,
            GenericId: -1,
            itemcode: '',
            StoreMasterId: 0,
            SubCategoryId: -1,
            CategoryId: -1,
            ActiveStatusId: 2,
        };
        $scope.currentcontext = {
            id: 0
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            for (var idx in vm.gridConfig.data) {
                var item = vm.gridConfig.data[idx];
                item.UnitCostPrice = parseFloat(item.Price) - parseFloat(item.Discount) + (parseFloat(item.Price) * parseFloat(item.GstMaster.GstName) / 100);
            }
        };

        $scope.getList = function (pageNo) {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.VendorMasterId },
                    { Key: 2, Value: $scope.currentfilter.ItemMasterId },
                    { Key: 9, Value: $scope.currentfilter.ProductTypeId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/ItemStoreMap/GetItemStoreMaps',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        // $scope.openModal = function(Id) {
        //     utl.Modal.open('app.managecssditemform', {
        //         params: { id: Id },
        //         confirmCallback: $scope.initLookup
        //     });
        // };
        $scope.openModal = function (appKey, stateParams) {
            utl.Modal.open(appKey, {
                params: stateParams,
                confirmCallback: $scope.getList
            });
        }

        $scope.addNew = function () {
            $scope.openModal(0);
        };

        $scope.deleteItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.delete_successmsg.lbl'));
            $scope.getList();
        };

        $scope.onDeleteConfirmed = function (deleteId) {
            var options = {
                action: 'pharmacy/itmstoremap/DeleteItemStoreMap',
                data: { Id: deleteId },
                type: 'post',
                onComplete: $scope.deleteItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, row) {
            if (actionType == 'info') {
                $scope.openModal('app.managecssditems', row.entity);
            } else if (actionType == 'view') {
                $state.go('app.itemmastertab.itemmaster', { id: row.entity.Id, IsProfile: row.entity.IsProfile, ItemCode: row.entity.ItemCode, ItemName: row.entity.ItemName });
            } else if (actionType == 'delete') {
                utl.Dialog.confirmDelete($scope.onDeleteConfirmed, row.entity.Id, row.entity.GstName);
            }
            //  else if (actionType == 'groupitems') {

            //     utl.Modal.open('app.managecssdgroupitems', {
            //         params: { id: row.entity.Id},
            //         confirmCallback: $scope.initLookup
            //     }
            //     );
            // }
            else if (actionType == 'groupitems') {
                $scope.openModal('app.managecssdgroupitems');
            }
            
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "ItemCode", displayName: $translate.instant('inventory.itemrackmapping.itemcode.lbl') },
                { field: "ItemName", displayName: $translate.instant('inventory.itemrackmapping.itemname.lbl') },
                { field: "ItemMaster.ItemCategory.CategoryName", displayName: $translate.instant('inventory.itemrackmapping.categoryname.lbl') },
                { field: "UsageTypeId", displayName: $translate.instant('inventory.itemrackmapping.usagetype.lbl') },
                { field: "CSSDTypeId", displayName: $translate.instant('inventory.itemrackmapping.cssdtype.lbl') },
                { field: "IsReusable", displayName: $translate.instant('inventory.itemrackmapping.isreusable.lbl') },
                { field: "MinUsage", displayName: $translate.instant('inventory.itemrackmapping.minusage.lbl') },
                { field: "MaxUsage", displayName: $translate.instant('inventory.itemrackmapping.maxusage.lbl') },

                {
                    field: "Id",
                    displayName: $translate.instant('common.actions_col.lbl'),
                    cellTemplate: '<div class="ui-grid-cell-contents">\
                                   <span class="grid-action" ng-click="grid.appScope.handleEvents(\'edit\',row)"><img class="drhms-edit-button" src="assets/svg/edit.svg" alt=""></span>\
                                   <span class="grid-action"ng-click="grid.appScope.handleEvents(\'groupitems\',row)"><i class="fa fa-sign-in btn  bt-color3 btn-rounded" aria-hidden="true"></i></span>\
                                   </div>',
                    actions: [
                        { actiontype: 'edit', display: 'common.editaction.lbl' },
                        { actiontype: 'delete', display: 'common.deleteaction.lbl' }
                    ]
                }
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        vm.itemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Item Code', field: 'ItemCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Item Name', field: 'ItemName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Product Type Name', field: 'ProductTypeName', datatype: 'string', headercls: 'td-producttypename', fieldcls: 'td-producttypename' },
                { header: 'Generic Name', field: 'GenericName', datatype: 'string', headercls: 'td-genericname', fieldcls: 'td-genericname' },
                { header: 'Manufacturer Name', field: 'ManufacturerName', datatype: 'string', headercls: 'td-manufacturername', fieldcls: 'td-manufacturername' },
                { header: 'Stock-In-Hand', field: 'StockInHand', datatype: 'string', headercls: 'td-stockinhand', fieldcls: 'td-stockinhand' }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/itemmaster/GetItemMasters',
            formatdisplay: formatselectedgrnitem,
            presearch: presearchgrnitem,
            postsearch: postsearchgrnitem
        };

        function formatselectedgrnitem() {
            var selectedItem = vm.itemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ItemName + '(' + selectedItem.ItemCode + ')'].join('    ');
            } else if (vm.itemcontrolconfig.rowdata) {
                result = [vm.itemcontrolconfig.rowdata.ItemName, vm.itemcontrolconfig.rowdata.ItemCode].join(' ');
            }
            return result;
        }

        function presearchgrnitem() {
            var query = vm.itemcontrolconfig.query;
            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.itemcontrolconfig.searchbyid === true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.itemcontrolconfig.searchparams = inputData;
        }

        function postsearchgrnitem() {
            for (var idx in vm.itemcontrolconfig.result) {
                var item = vm.itemcontrolconfig.result[idx];
                item.ItemCode = item.ItemCode;
                item.ItemName = item.ItemName;
            }
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.currentfilter.StoreMasterId === 0) {
                    $scope.currentfilter.StoreMasterId = value[0].Id;
                }
            });

            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "StoreMaster" },
                {
                    "Key": "ProductType",
                    Request: {
                        Params: [{
                            Key: 3,
                            Value: 2
                        }, {
                            Key: 4,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        },]
                    }
                },
                {
                    "Key": "UserStores",
                    Request: {
                        Params: [{
                            Key: 1,
                            Value: utl.Session.getCurrentUserId()
                        },
                        {
                            Key: 2,
                            Value: utl.Session.getCurrentFacilityId(),
                        },
                        {
                            Key: 5,
                            Value: 2
                        }
                        ]
                    },
                    Default: false
                },
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

    managecssdsetupController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();