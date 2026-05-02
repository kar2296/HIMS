(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('stockStatusController', stockStatusController);

    function stockStatusController($rootScope, $scope, $filter, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        angular.extend(this, utl.Ctrl.getBarcodePrintCtrl({
            $scope: $scope
        }));
        $scope.Items = [];
        $scope.lookup = {};
        $scope.currentcontext = {
            id: -1
        };
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            CategoryId: -1,
            ItemMasterId: -1,
            GenericId: -1,
            StoreMasterId: 0
        };
        $scope.itemexactsearch = 0;
        $scope.itemexactsearch =
            (utl.FacilitySetting.getFacilitySettingValue('general', 'itemexactsearch')) ? utl.FacilitySetting.getFacilitySettingValue('general', 'itemexactsearch') : 0;

        $scope.backtoList = function () {
            if ($scope.Context == 'pharmacy') {
                $state.go('app.pharmacydashboard');
            } else if ($scope.Context == 'store') {
                $state.go('app.storedashboard');
            }
        }

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            var TotalQty = 0;
            for (var idx in res.Data) {
                var item = res.Data[idx];
                item.Ucp = isNaN(parseFloat(item.Ucp)) ? (0) : parseFloat(item.Ucp);
                item.Mrp = isNaN(parseFloat(item.Mrp)) ? (0) : parseFloat(item.Mrp);

                //item.Ucp = parseFloat(item.Ucp).toFixed(2);
                //item.Mrp = parseFloat(item.Mrp).toFixed(2);

                TotalQty = TotalQty + res.Data[idx].Quantity;

                vm.gridConfig.data.push(item);
            }

            $scope.TotalQuantity = TotalQty;

            //vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function (selecteditem) {
            console.log(selecteditem);

            // if ($scope.currentfilter.ItemMasterId > 0) {
            if (selecteditem.ItemMasterId && selecteditem.ItemMasterId > 0) {
                var inputData = {
                    Params: [{
                        Key: 1,
                        // Value: $scope.currentfilter.ItemMasterId
                        Value: selecteditem.ItemMasterId
                    },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.StoreMasterId
                    },
                    {
                        Key: 10,
                        Value: $scope.currentfilter.ProductTypeId
                    },

                        // { Key: 12, Value: $scope.currentfilter.GenericId }
                    ],
                    PageContext: {
                        PageSize: vm.gridConfig.pagerObj.pageSize,
                        PageNumber: vm.gridConfig.pagerObj.currentPage
                    }
                }
            } else {
                utl.Alert.showErrorMsg('Please Select Item First');
                return true;
            }

            var options = {
                action: 'pharmacy/stockserialitem/GetStockSerialItems',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.generatebarCode = function (item) {
            var vExpiryDate = "";
            var vBatchNo = "";
            var vItemName = "";
            var vItemCode = "";
            var vBarcode = "";
            if (item.ItemMasterId) {
                if (item.ItemMaster && item.ItemMaster.ItemName)
                    vItemName = item.ItemMaster.ItemName;
                vItemCode = item.ItemMaster.ItemCode;
                if (item.BatchId)
                    vBatchNo = item.BatchId;
                if (item.ExpiryDate)
                    vExpiryDate = item.ExpiryDate;
                if (item.BarcodeNo)
                    vBarcode = item.BarcodeNo;
                $scope.generateBarcodeScript(vItemName, vItemCode, vBatchNo, vBarcode, vExpiryDate, item);
            }
        };


        $scope.generateBarcodeScript = function (itemName, itemCode, batchno, barcodenr, expDate, items) {

            var vItemName = '';
            var vItemCode = '';
            var vBatchNo = '';
            var vExpiryDate = '';
            var vBarcode = '';
            try {
                if (itemName) {
                    vItemName = itemName;
                }
                if (itemCode) {
                    vItemCode = itemCode;
                }
                if (batchno) {
                    vBatchNo = batchno;
                }
                if (barcodenr) {
                    vBarcode = barcodenr;
                }
                if (expDate) {
                    vExpiryDate = utl.Formatter.getExpDateString(expDate);
                }

            } catch (ex) { }

            var code = '';
            var printData = []
            var printCodes = {
                new_line: '\x0A'
            };
            var code = '';
            code += 'I8,A' + printCodes.new_line;
            code += 'q799' + printCodes.new_line;
            code += 'O' + printCodes.new_line;
            code += 'JF' + printCodes.new_line;
            code += 'ZT' + printCodes.new_line;
            code += 'Q120,25' + printCodes.new_line;
            code += 'N' + printCodes.new_line;
            code += 'A783,99,2,3,1,1,N,"' + vItemName + '"' + printCodes.new_line;
            code += 'A583,99,2,3,1,1,N,"' + vItemName + '"' + printCodes.new_line;
            code += 'A390,99,2,3,1,1,N,"' + vItemName + '"' + printCodes.new_line;
            code += 'A194,99,2,3,1,1,N,"' + vItemName + '"' + printCodes.new_line;

            code += 'B758,69,2,9,1,2,27,N,"' + vBarcode + '"' + printCodes.new_line;
            code += 'A768,35,2,3,1,1,N,"' + vBatchNo + '"' + printCodes.new_line;
            code += 'B549,69,2,9,1,2,27,N,"' + vBarcode + '"' + printCodes.new_line;
            code += 'A559,35,2,3,1,1,N,"' + vBatchNo + '"' + printCodes.new_line;
            code += 'B365,69,2,9,1,2,27,N,"' + vBarcode + '"' + printCodes.new_line;
            code += 'A374,35,2,3,1,1,N,"' + vBatchNo + '"' + printCodes.new_line;
            code += 'B175,69,2,9,1,2,27,N,"' + vBarcode + '"' + printCodes.new_line;
            code += 'A184,35,2,3,1,1,N,"' + vBatchNo + '"' + printCodes.new_line;

            code += 'A778,15,2,3,1,1,N,"' + vExpiryDate + '"' + printCodes.new_line;
            code += 'A583,15,2,3,1,1,N,"' + vExpiryDate + '"' + printCodes.new_line;
            code += 'A390,15,2,3,1,1,N,"' + vExpiryDate + '"' + printCodes.new_line;
            code += 'A194,15,2,3,1,1,N,"' + vExpiryDate + '"' + printCodes.new_line;


            code += 'P1,1' + printCodes.new_line;
            printData.push(code);
            console.log(printData);
            $scope.printRaw(printData);


            // var code = '';
            // code += 'I8,A,001' + printCodes.new_line;
            // code += 'Q200,024' + printCodes.new_line;
            // code += 'q831' + printCodes.new_line;
            // code += 'rN' + printCodes.new_line;
            // code += 'S2' + printCodes.new_line;
            // code += 'D15' + printCodes.new_line;
            // code += 'ZT' + printCodes.new_line;
            // code += 'JF' + printCodes.new_line;
            // code += 'O' + printCodes.new_line;
            // code += 'R215,0' + printCodes.new_line;
            // code += 'f100' + printCodes.new_line;
            // code += 'N' + printCodes.new_line;
            // code += 'B373,120,2,1,3,9,61,B,"' + barcodenr + '"' + printCodes.new_line;
            // // code += 'A373,170,2,2,1,1,N,"' + printCodes.new_line;
            // // code += 'A373,150,2,2,1,1,N,"' + printCodes.new_line;
            // code += 'A374,185,2,2,1,1,N,"' + vItemName + '(' + vItemCode + ')' + '"' + printCodes.new_line;
            // code += 'A374,155,2,2,1,1,N,"' + vexpDate + '"' + printCodes.new_line;
            // code += 'A165,155,2,2,1,1,N,"' + vBatchInfo + '"' + printCodes.new_line;
            // code += 'P1,1' + printCodes.new_line;
            // printData.push(code);
            // console.log(printData);
            // $scope.printRaw(printData);

        };

        $scope.handleEvents = function (actionType, entity) {
            if (actionType == 'barcode') {
                $scope.generatebarCode(entity);
            }
            if (actionType == 'manualbarcode') {
                utl.Modal.openFixedDialog('app.manualbarcode', {
                    params: {
                        itemId: entity.ItemMasterId,
                        from: 'stock',
                        barcode: entity.BarcodeNo,
                        stockInfo: entity
                    },
                    confirmCallback: $scope.getList
                });
            }
        };

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
            },
            {
                field: "Id",
                displayName: $translate.instant('common.actions_col.lbl'),
                cellTemplate: '<div class="ui-grid-cell-contents">\
                    <span class="grid-action" ng-click="handleEvents(\'barcode\',entity)" ><i class="fa fa-barcode" aria-hidden="true"></i></span>\
                    <span class="grid-action" ng-click="handleEvents(\'manualbarcode\',entity)" ><i class="fa fa-plus" aria-hidden="true"></i></span>\
                         </div>',
                handleEvent: $scope.handleEvents,
                actions: []
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
            // api: 'pharmacy/itemmaster/GetItemMasters',
            api: 'pharmacy/itemstoremap/GetItemStoreMaps',
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
            // var inputData = {
            //     Params: [{
            //         Key: 7,
            //         Value: $scope.currentfilter.CategoryId
            //     },
            //     // { Key: 26, Value: [-1, utl.Session.getCurrentFacilityId()] },
            //     {
            //         Key: 3,
            //         Value: 2
            //     }],
            //     PageContext: {
            //         PageSize: 25,
            //         PageNumber: 1
            //     }
            // };

            // if (vm.stockitemcontrolconfig.searchbyid === true) {
            //     inputData.Params.push({
            //         Key: 0,
            //         Value: query
            //     });
            // } else if (query && query.length > 2) {
            //         inputData.Params.push({
            //             Key: 1,
            //             Value: query
            //         });
            // }
            var inputData = {
                Params: [{
                    Key: 8,
                    Value: $scope.currentfilter.CategoryId
                },
                // { Key: 26, Value: [-1, utl.Session.getCurrentFacilityId()] },
                {
                    Key: 13,//ActiveStatus
                    Value: 2
                },
                {
                    Key: 1,
                    Value: $scope.currentfilter.StoreMasterId
                },
                ],
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
                if ($scope.itemexactsearch == true) {
                    inputData.Params.push({
                        Key: 24,
                        Value: query
                    });
                } else {
                    inputData.Params.push({
                        Key: 3,
                        Value: query
                    });
                }
            }

            vm.stockitemcontrolconfig.searchparams = inputData;
        }

        function postsearchstockitem() {
            for (var idx in vm.stockitemcontrolconfig.result) {
                var item = vm.stockitemcontrolconfig.result[idx];
                item.ItemCode = item.ItemCode;
                item.ItemName = item.ItemName;
                // $scope.currentfilter.ItemMasterId = item.ItemMasterId;
                // if (item.ProductType !== null) {
                //     item.ProductTypeName = item.ProductType.ProductTypeName;
                // } else {
                //     item.ProductTypeName = '';
                // }
                // if (item.GenericMaster !== null) {
                //     item.GenericName = item.GenericMaster.GenericName;
                // } else {
                //     item.GenericName = '';
                // }
                // if (item.VendorMaster !== null) {
                //     item.ManufacturerName = item.VendorMaster.VendorName;
                // } else {
                //     item.ManufacturerName = '';
                // }
                if (item.ProductType) {
                    item.ProductTypeName = item.ProductType.ProductTypeName;
                } else {
                    if (item.ItemMaster) {
                        if (item.ItemMaster.ProductType) {
                            item.ProductTypeName = item.ItemMaster.ProductType.ProductTypeName;
                        } else {
                            item.ProductTypeName = '';
                        }
                    } else {
                        item.ProductTypeName = '';
                    }
                }
                if (item.GenericMaster) {
                    item.GenericName = item.GenericMaster.GenericName;
                } else {
                    if (item.ItemMaster) {
                        if (item.ItemMaster.GenericMaster) {
                            item.GenericName = item.ItemMaster.GenericMaster.GenericName;
                        } else {
                            item.GenericName = '';
                        }
                    } else {
                        item.GenericName = '';
                    }
                }
                if (item.Manufacturer) {
                    item.ManufacturerName = item.Manufacturer.VendorName;
                } else {
                    if (item.ItemMaster) {
                        if (item.ItemMaster.Manufacturer) {
                            item.ManufacturerName = item.ItemMaster.Manufacturer.VendorName;
                        } else {
                            item.ManufacturerName = '';
                        }
                    } else {
                        item.ManufacturerName = '';
                    }
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
                    }]
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
                    },]
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

    stockStatusController.$inject = ['$rootScope', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();
