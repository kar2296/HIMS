(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('cssdpreparationListController', cssdpreparationListController);

    function cssdpreparationListController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.lookup = {};
        $scope.currentcontext = {
            id: -1
        };
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            CategoryId: -1,
            ItemMasterId: -1,
            StoreMasterId: 0
        };


        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = [];
            var TotalQty = 0;
            for (var idx in data.Data) {
                var item = data.Data[idx];
                item.Ucp = isNaN(parseFloat(item.Ucp)) ? (0) : parseFloat(item.Ucp);
                item.Mrp = isNaN(parseFloat(item.Mrp)) ? (0) : parseFloat(item.Mrp);

                //item.Ucp = parseFloat(item.Ucp).toFixed(2);
                //item.Mrp = parseFloat(item.Mrp).toFixed(2);

                TotalQty = TotalQty + data.Data[idx].Quantity;

                vm.gridConfig.data.push(item);
            }

            $scope.TotalQuantity = TotalQty;

            vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
        };

        $scope.getList = function (pageNo) {

            var inputData = {
                Params: [{
                    Key: 1,
                    Value: $scope.currentfilter.ItemMasterId
                },
                {
                    Key: 2,
                    Value: $scope.currentfilter.StoreMasterId
                }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/stockserialitem/GetStockSerialItems',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.handleEvents = function (actionType, row) {

            if (actionType == 'receive') {
                $state.go('', { id: 0 });
            }
            else if (actionType == 'transfer') {
                $state.go('', { id: row.entity.Id });
            }
            else if (actionType == 'preparation') {
                $state.go('app.cssdpreparations', { id: row.entity.Id });
            }
        }

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "StoreMaster.StoreName",
                displayName: $translate.instant('inventory.stockstatus.store.lbl')
            },
            {
                field: "ItemMaster.ItemCode",
                displayName: $translate.instant('inventory.stockstatus.itemcode.lbl')
            },
            {
                field: "ItemMaster.ItemName",
                displayName: $translate.instant('inventory.stockstatus.itemname.lbl')
            },
            {
                field: "BatchId",
                displayName: $translate.instant('inventory.stockstatus.batch.lbl')
            },
            {
                field: "Quantity",
                displayName: $translate.instant('inventory.stockstatus.quantity.lbl')
            },


            {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                                                                <span class="grid-action" title="Receive" ng-click="grid.appScope.handleEvents(\'receive\',row)"><i class="text-white btn dem-color4 btn-xs fa fa-database fa-xs" aria-hidden="true"></i></span>\
  <span class="grid-action" title="Preparation" ng-click="grid.appScope.handleEvents(\'preparation\',row)"><i class="btn btn-primary btn-rounded btn-rounded fa fa-history fa-xs" aria-hidden="true"></i></span>\
                                 <span class="grid-action"  title="Transfer"  ng-click="grid.appScope.handleEvents(\'transfer\',row)"><i class=" btn btn-default btn-rounded fa fa-eye" aria-hidden="true"></i></span>\
                                                </div>',
                actions: [
                    //{ actiontype: 'edit', display: 'common.editaction.lbl' },
                    //{ actiontype: 'delete', display: 'common.deleteaction.lbl' },
                    //{ actiontype: 'history', display: 'common.history.lbl' }
                ]
            }
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };

        vm.stockitemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Item Code', field: 'ItemCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Item Name', field: 'ItemName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Product Name', field: 'ProductTypeName', datatype: 'string', headercls: 'td-producttypename', fieldcls: 'td-producttypename' },
                { header: 'Generic', field: 'GenericName', datatype: 'string', headercls: 'td-genericname', fieldcls: 'td-genericname' },
                { header: 'Manufacturer', field: 'ManufacturerName', datatype: 'string', headercls: 'td-manufacturername', fieldcls: 'td-manufacturername' }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/itemmaster/GetItemMasters',
            formatdisplay: formatselectedstockitem,
            presearch: presearchstockitem,
            postsearch: postsearchstockitem
        };

        function formatselectedstockitem() {
            var selectedItem = vm.stockitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ItemName + ' (' + selectedItem.ItemCode + ')'].join(' ');
            } else if (vm.stockitemcontrolconfig.rowdata) {
                result = [vm.stockitemcontrolconfig.rowdata.ItemCode, vm.stockitemcontrolconfig.rowdata.ItemName].join(' ');
            }
            return result;
        }

        function presearchstockitem() {
            var query = vm.stockitemcontrolconfig.query;
            var inputData = {
                Params: [{ Key: 7, Value: $scope.currentfilter.CategoryId },
                    // { Key: 13, Value: 1 }
                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.stockitemcontrolconfig.searchbyid === true) {
                inputData.Params.push({ Key: 0, Value: query });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.stockitemcontrolconfig.searchparams = inputData;
        }

        function postsearchstockitem() {
            for (var idx in vm.stockitemcontrolconfig.result) {
                var item = vm.stockitemcontrolconfig.result[idx];
                item.ItemCode = item.ItemCode;
                item.ItemName = item.ItemName;
                if (item.ProductType !== null) {
                    item.ProductTypeName = item.ProductType.ProductTypeName;
                } else {
                    item.ProductTypeName = '';
                }
                if (item.GenericMaster !== null) {
                    item.GenericName = item.GenericMaster.GenericName;
                } else {
                    item.GenericName = '';
                }
                if (item.VendorMaster !== null) {
                    item.ManufacturerName = item.VendorMaster.VendorName;
                } else {
                    item.ManufacturerName = '';
                }
            }
        }

        $scope.print = function () {
            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'pharmacy/stockstatus/PrintStockStatus',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.currentfilter.StoreMasterId === 0) {
                    $scope.currentfilter.StoreMasterId = value[0].Id;
                }
            });
        };

        $scope.initLookup = function () {
            var inputData = [{
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
            {
                "Key": "Facility"
            },
            {
                "Key": "ItemCategory"
            }
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

    cssdpreparationListController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();