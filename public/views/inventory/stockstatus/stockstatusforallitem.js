(function () {
        'use strict';

        angular
            .module('app.pages')
            .controller('stockStatusForallItemsController', stockStatusForallItemsController);

        function stockStatusForallItemsController($rootScope, $scope, $filter, $stateParams, $state, $translate, utl, $timeout) {
            var vm = this;
            if ($stateParams.context) {
                $scope.Context = $stateParams.context;
            }

            $scope.Items = [];
            $scope.lookup = {};
            $scope.currentcontext = {
                id: -1
            };
            $scope.currentfilter = {
                FacilityId: utl.Session.getCurrentFacilityId(),
                ProductTypeId: -1,
                ItemMasterId: -1,
                GenericId: -1,
                StoreMasterId: 0
            };
            
            $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
                const JsonFields = ["S.No","Code", "Item Name", "Generic Name", "Manufacture", "Batch Id", "Expiry Date", "Quantity", "Purchase Price", "Sales Price"];
                let csvContent = JsonFields.join(",") + "\n";
                let totalQuantity = 0;
            
                if (data.Data && data.Data.length > 0) {
                    data.Data.forEach(function (item,index) {
                        var sno = index + 1;
                        var code = '';
                        var itemname = '';
                        var genericname = '';
                        var manufacture = '';
                        var batchid = '';
                        var expdate = '';
                        var quantity = '';
                        var purchaseprice = '';
                        var saleprice = '';
            
                        if (item.ItemMaster && item.ItemMaster.ItemCode) {
                            code = item.ItemMaster.ItemCode;
                        }
                        if (item.ItemMaster && item.ItemMaster.ItemName) {
                            itemname = item.ItemMaster.ItemName;
                        }
                        if (item.ItemMaster && item.ItemMaster.GenericName) {
                            genericname = item.ItemMaster.GenericName;
                        }
                        if (item.ItemMaster && item.ItemMaster.ManufacturerName) {
                            manufacture = item.ItemMaster.ManufacturerName;
                        }
                        if (item.BatchId) {
                            batchid = item.BatchId;
                        }
                        if (item.ExpiryDate) {
                            expdate = utl.Formatter.getDateTimeString(item.ExpiryDate);
                        }
                        if (item.Quantity) {
                            quantity = item.Quantity;
                            totalQuantity += parseInt(quantity);
                        }
                        if (item.Ucp) {
                            purchaseprice = parseFloat(item.Ucp).toFixed(2);
                        }
                        if (item.Mrp) {
                            saleprice = parseFloat(item.Mrp).toFixed(2);
                        }
            
                        itemname = itemname.replace(/,/g, " ");
                        itemname = itemname.replace(/ /g, " ");

                        genericname = genericname.replace(/,/g, " ");
                        genericname = genericname.replace(/ /g, " ");

                        manufacture = manufacture.replace(/,/g, " ");
                        manufacture = manufacture.replace(/ /g, " ");
            
                        csvContent +=sno+','+ code + ',' + itemname + ',' + genericname + ',' + manufacture + ',' + batchid + ',' + expdate + ',' + quantity + ',' + purchaseprice + ',' + saleprice + "\n";
                    });
            
                    csvContent += "\n,,,,,,Total Quantity:," + totalQuantity + "\n";
                }
            
                var encodedUri = encodeURI(csvContent);
                var hiddenElement = document.createElement('a');
                hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
                hiddenElement.target = '_blank';
                hiddenElement.download = 'stockstatusforallitems.csv';
                hiddenElement.click();
            };
            
            $scope.excelDownload = function () {
                var inputData = {
                    Params: [
                        { 
                            Key: 25, 
                            Value: $scope.currentfilter.ItemMasterId 
                        },
                        { 
                            Key: 24, 
                            Value: $scope.currentfilter.StoreMasterId 
                        },
                        { 
                            Key: 10, 
                            Value: $scope.currentfilter.ProductTypeId 
                        },
                        { 
                            Key: 11, 
                            Value: $scope.currentfilter.Quantity > 0 
                        }
                    ],
                };
            
                var options = {
                    action: "pharmacy/stockserialitem/GetStockSerialItems",
                    data: inputData,
                    type: "post",
                    onComplete: $scope.excelDownloadCallbackExcel,
                };
                utl.Http.doAction(options);
            };
            

            
            $scope.getListCallback = function (scope, res, options, hasError) {
                vm.gridConfig.data = [];
                var TotalQty = 0;
                for (var idx in res.Data) {
                    var item = res.Data[idx];
                    // if (item.Quantity > 0){
                        item.Ucp = isNaN(parseFloat(item.Ucp)) ? (0) : parseFloat(item.Ucp);
                    item.Mrp = isNaN(parseFloat(item.Mrp)) ? (0) : parseFloat(item.Mrp);

                    //item.Ucp = parseFloat(item.Ucp).toFixed(2);
                    //item.Mrp = parseFloat(item.Mrp).toFixed(2);
                    if (item.Quantity > 0) {
                        TotalQty = TotalQty + item.Quantity;
                        vm.gridConfig.data.push(item);
                    }
                    // TotalQty = TotalQty + res.Data[idx].Quantity;

                    // vm.gridConfig.data.push(item);
                // }
            }
            $scope.TotalQuantity = TotalQty;

            //vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {
            var inputData = {
                Params: [{
                        Key: 25,
                        Value: $scope.currentfilter.ItemMasterId
                    },
                    {
                        Key: 24,
                        Value: $scope.currentfilter.StoreMasterId
                    },
                    {
                        Key: 10,
                        Value: $scope.currentfilter.ProductTypeId
                    },
                    {
                        Key: 11,
                        Value: $scope.currentfilter.Quantity > 0
                    },
                    // { Key: 11, Value: 0 }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            }

            var options = {
                action: 'pharmacy/stockserialitem/GetStockSerialItems',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
            
        };
        
        $scope.backtoList = function () {
            if ($scope.Context == 'pharmacy') {
                $state.go('app.pharmacydashboard');
            } else if ($scope.Context == 'store') {
                $state.go('app.storedashboard');
            }
        }
       

        vm.gridConfig = {
            enableColumnResizing: true,
            background: {
                flag: 'IsMultiUse',
                // style:{
                //     field:'Status',
                //     value:{
                //         1:{'background':'red','color':'#fff'}
                //     }
                // }
            },
            columnDefs: [{
                    field: "S.No",
                    displayName: $translate.instant('inventory.purchaseorders.sno.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
                },
                {
                    field: "ItemMaster.ItemCode",
                    displayName: $translate.instant('inventory.stockstatus.code.lbl')
                },
                {
                    field: "ItemMaster.ItemName",
                    displayName: $translate.instant('inventory.stockstatus.itemname.lbl')
                },
                {
                    field: "ItemMaster.GenericName",
                    displayName: $translate.instant('inventory.stockstatus.genericname.lbl')
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
                    displayName: $translate.instant('inventory.stockstatus.expirydate.lbl'),
                    cellTemplate: "<ngformatdate date-val='entity.ExpiryDate'></ngformatdate>"
                },
                {
                    field: "Quantity",
                    displayName: $translate.instant('inventory.stockstatus.quantity.lbl')
                },
                {
                    field: "Ucp",
                    displayName: $translate.instant('inventory.stockstatus.purchaseprice.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.Ucp | displaycurrency}}</span>" + "</div>",
                    // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.Ucp | displaycurrency}}&nbsp;</span>' + '</div>'
                },
                {
                    field: "Mrp",
                    displayName: $translate.instant('inventory.stockstatus.salesprice.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.Mrp | displaycurrency}}</span>" + "</div>",
                    // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.Mrp | displaycurrency}}&nbsp;</span>' + '</div>',
                    handleEvent: $scope.handleEvents,
                    actions: []
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
            options: [{
                    header: 'Item Code',
                    field: 'ItemCode',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Item Name',
                    field: 'ItemName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
                {
                    header: 'Product Name',
                    field: 'ProductTypeName',
                    datatype: 'string',
                    headercls: 'td-producttypename',
                    fieldcls: 'td-producttypename'
                }
                // {
                //     header: 'Generic',
                //     field: 'GenericName',
                //     datatype: 'string',
                //     headercls: 'td-genericname',
                //     fieldcls: 'td-genericname'
                // },
                // {
                //     header: 'Manufacturer',
                //     field: 'ManufacturerName',
                //     datatype: 'string',
                //     headercls: 'td-manufacturername',
                //     fieldcls: 'td-manufacturername'
                // }
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
                Params: [{
                    Key: 7,
                    Value: $scope.currentfilter.CategoryId
                }, {
                    Key: 3,
                    Value: 2
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.stockitemcontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
            }
            if ($scope.currentfilter.StoreMasterId > 0) {
                inputData.Params.push({
                    Key: 11,
                    Value: $scope.currentfilter.StoreMasterId
                });
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

        vm.stockgenericcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Generic Code',
                    field: 'GenericCode',
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
                    header: 'Schedule Type',
                    field: 'ScheduleType',
                    datatype: 'string',
                    headercls: 'td-scheduletype',
                    fieldcls: 'td-scheduletype'
                }
            ],
            searchparams: {},
            result: {},
            api: 'clinicalmaster/genericmaster/GetGenericMasters',
            formatdisplay: formatselectedstockgeneric,
            presearch: presearchstockgeneric,
            postsearch: postsearchstockgeneric
        };

        function formatselectedstockgeneric() {
            var selectedItem = vm.stockgenericcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.GenericName + ' (' + selectedItem.GenericCode + ')'].join(' ');
            } else if (vm.stockgenericcontrolconfig.rowdata) {
                result = [vm.stockgenericcontrolconfig.rowdata.GenericCode, vm.stockgenericcontrolconfig.rowdata.GenericName].join(' ');
            }
            return result;
        }

        function presearchstockgeneric() {
            var query = vm.stockgenericcontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: 2
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.stockgenericcontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 1,
                    Value: query
                });
            }

            vm.stockgenericcontrolconfig.searchparams = inputData;
        }

        function postsearchstockgeneric() {
            for (var idx in vm.stockgenericcontrolconfig.result) {
                var item = vm.stockgenericcontrolconfig.result[idx];
                item.GenericCode = item.Code;
                item.GenericName = item.GenericName;
                if (item.ScheduleType !== null) {
                    item.ScheduleType = item.ScheduleType.Description;
                } else {
                    item.ScheduleType = '';
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
                    for (var usidx in $scope.lookup.UserStores) {
                        if ($scope.lookup.UserStores[usidx].IsDefault) {
                            $scope.currentfilter.StoreMasterId = $scope.lookup.UserStores[usidx].Id;
                        }
                    }
                    if ($scope.currentfilter.StoreMasterId === 0) {
                        $scope.currentfilter.StoreMasterId = value[0].Id;
                    }
                }
            });
            $scope.getList();
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
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
                        }, ]
                    }
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

    stockStatusForallItemsController.$inject = ['$rootScope', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();