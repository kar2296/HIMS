(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('stockItemDetailsController', stockItemDetailsController);

    function stockItemDetailsController($scope, $filter, $stateParams, $state, $translate, utl) {
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


        // $scope.getListCallback = function (scope, res, options, hasError) {
        //     vm.gridConfig.data = res.Data;
        //     vm.gridConfig.pagerObj.totalItems = res.Data.length;
        // };

        $scope.getListCallback = function (scope, data, options, hasError) {
            vm.gridConfig.data = [];
            var Total = 0;
            for (var idx in data.Data) {
                var item = data.Data[idx];
                item.Ucp = isNaN(parseFloat(item.Ucp)) ? (0) : parseFloat(item.Ucp);
                item.Mrp = isNaN(parseFloat(item.Mrp)) ? (0) : parseFloat(item.Mrp);

                //item.Ucp = parseFloat(item.Ucp).toFixed(2);
                //item.Mrp = parseFloat(item.Mrp).toFixed(2);

                Total = Total + (item.Ucp * item.Quantity);

                vm.gridConfig.data.push(item);
            }

            $scope.TotalQuantity = Total;

            vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
        };

        vm.Genericitemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Generic Code',
                field: 'Code',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'Generic Name',
                field: 'GenericName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },
            {
                header: 'Allergen Type',
                field: 'AllergenType',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            },

            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/GenericMaster/GetGenericMasters',
            formatdisplay: formatselectedGenericitem,
            presearch: presearchgenericitem,
            postsearch: postsearchGenericitem
        };

        function formatselectedGenericitem() {
            var selectedItem = vm.Genericitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.GenericName + '(' + selectedItem.Code + ')'].join('    ');
            } else if (vm.Genericitemcontrolconfig.rowdata) {
                result = [vm.Genericitemcontrolconfig.rowdata.GenericName, vm.Genericitemcontrolconfig.rowdata.Code].join(' ');
            }
            return result;
            $scope.getList();
        }

        function presearchgenericitem() {
            var query = vm.Genericitemcontrolconfig.query;

            var inputData = {
                Params: [],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };


            if (vm.Genericitemcontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 3,
                    Value: 2
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
            }

            vm.Genericitemcontrolconfig.searchparams = inputData;
        }

        function postsearchGenericitem() {
            for (var idx in vm.Genericitemcontrolconfig.result) {
                var item = vm.Genericitemcontrolconfig.result[idx];
                item.Code = item.Code;
                item.GenericName = item.GenericName;
                item.AllergenType = item.AllergenType.Description;
            }
        }

        $scope.getList = function (pageNo) {
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentfilter.StoreMasterId },
                    { Key: 1, Value: $scope.currentfilter.ItemMasterId },
                    { Key: 10, Value: $scope.currentfilter.ProductTypeId },
                    { Key: 12, Value: $scope.currentfilter.GenericId },


                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'pharmacy/StockSerialItem/GetStockSerialItems',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "ItemMaster.GenericName",
                    displayName: $translate.instant('inventory.stockstatus.generic.lbl')
                },
                {
                    field: "ItemCode",
                    displayName: $translate.instant('inventory.stockstatus.itemcode.lbl')
                },
                {
                    field: "ItemName",
                    displayName: $translate.instant('inventory.stockstatus.itemname.lbl')
                },
                {
                    field: "ItemMaster.ManufacturerName",
                    displayName: $translate.instant('inventory.stockstatus.manufacture.lbl')
                },
                {
                    field: "BatchId",
                    displayName: $translate.instant('inventory.stockstatus.batch.lbl')
                },
                {
                    field: "ExpiryDate",
                    displayName: $translate.instant('inventory.stockstatus.expiry.lbl'),
                    cellTemplate: "<ngformatdate date-val='row.entity.ExpiryDate'></ngformatdate>"
                },
                {
                    field: "Quantity",
                    displayName: $translate.instant('inventory.stockstatus.quantity.lbl')
                },
                // {
                //     field: "Ucp",
                //     displayName: $translate.instant('inventory.stockstatus.ucp.lbl')
                // },
                {
                    field: "Ucp",
                    displayName: $translate.instant('inventory.stockstatus.ucp.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.Ucp | displaycurrency}}</span>" + "</div>"
                    // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{row.entity.Ucp | displaycurrency}}&nbsp;</span>' + '</div>'
                },
                // {
                //     field: "Mrp",
                //     displayName: $translate.instant('inventory.stockstatus.mrp.lbl')
                // },
                {
                    field: "Mrp",
                    displayName: $translate.instant('inventory.stockstatus.mrp.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.Mrp | displaycurrency}}</span>" + "</div>"
                    // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{row.entity.Mrp | displaycurrency}}&nbsp;</span>' + '</div>'
                },
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
                { header: 'UCP', field: 'CostPrice', datatype: 'string', headercls: 'td-ucp', fieldcls: 'td-ucp' },
                { header: 'Product Type Name', field: 'ProductTypeName', datatype: 'string', headercls: 'td-producttypename', fieldcls: 'td-producttypename' },
                { header: 'Generic Name', field: 'GenericName', datatype: 'string', headercls: 'td-genericname', fieldcls: 'td-genericname' },
                { header: 'Manufacturer Name', field: 'ManufacturerName', datatype: 'string', headercls: 'td-manufacturername', fieldcls: 'td-manufacturername' },

            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/itemmaster/GetItemMasters',
            formatdisplay: formatselecteditem,
            presearch: presearchitem,
            postsearch: postsearchitem
        };

        function formatselecteditem() {
            var selectedItem = vm.stockitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ItemName + ' (' + selectedItem.ItemCode + ')'].join(' ');
            } else if (vm.stockitemcontrolconfig.rowdata) {
                result = [vm.stockitemcontrolconfig.rowdata.ItemCode, vm.stockitemcontrolconfig.rowdata.ItemName].join(' ');
            }
            return result;
        }
        function presearchitem() {
            var query = vm.stockitemcontrolconfig.query;
            var inputData = {
                Params: [
                    //{ Key: 7, Value: $scope.currentfilter.CategoryId }
                ],
                PageContext: {
                    PageSize: -1,
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

        function postsearchitem() {
            for (var idx in vm.stockitemcontrolconfig.result) {
                var item = vm.stockitemcontrolconfig.result[idx];
                item.ItemCode = item.ItemCode;
                item.ItemName = item.ItemName;
                item.CostPrice = item.CostPrice;
                if (item.ProductType)
                    item.ProductTypeName = item.ProductType.ProductTypeName;
                if (item.GenericMaster)
                    item.GenericName = item.GenericMaster.GenericName;
                if (item.Manufacturer)
                    item.ManufacturerName = item.Manufacturer.VendorName;
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
            $scope.getList();
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
                "Key": "Generic"
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

    stockItemDetailsController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();