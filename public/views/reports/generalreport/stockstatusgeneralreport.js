(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('stockstatusgeneralreportController', stockstatusgeneralreportController);

    function stockstatusgeneralreportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            StoreMasterId: 0
        };
        $scope.lookup = {};
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Item Code", "Item Name", "Total Qty", "Total UCP"]
            let csvContent = JsonFields.join(",") + "\n";
            var TotalFooterQty = 0;
            var totalFooterUcp = 0;
            var totalUcp = 0;
            var totalFooterMrp = 0;
            $scope.TotalFooterQty = 0;
            $scope.TotalFooterUcp = 0;
            $scope.TotalUcp = 0;
            $scope.TotalFooterMrp = 0;

            if (data.Data.length > 0) {
                var GroupedBatchData = _.groupBy(data.Data, 'ItemMasterId');

                for (var itmdx in GroupedBatchData) {
                    var itemgrouped = GroupedBatchData[itmdx];
                    var stockdata = {
                        Qty: 0,
                        Ucp: 0,
                        NetUcp: 0,
                        Mrp: 0,
                        TotalQty: 0,
                        TotalQtyinfloat: 0,
                        TotalUcp: 0,
                        TotalMrp: 0,
                        itemlength: itemgrouped.length
                    };
                    var stocklength = 0;
                    var batchGrpData = _.groupBy(itemgrouped, 'BatchId');
                    for (var gpdx in batchGrpData) {
                        stocklength++;
                        var item = batchGrpData[gpdx];
                        for (var idx in item) {
                            var batchData = item[idx];
                            stockdata.Qty += parseInt(batchData.Quantity);
                            stockdata.Ucp += parseFloat(batchData.Ucp);
                            stockdata.NetUcp += parseFloat(batchData.Quantity) * parseFloat(batchData.Ucp);
                            stockdata.Mrp += parseFloat(batchData.Mrp);
                            stockdata.ItemName = batchData.ItemName;
                            stockdata.ItemCode = batchData.ItemCode;
                            if (batchData.ItemMaster) {
                                stockdata.GenericName = batchData.ItemMaster.GenericName;

                                stockdata.ManufacturerName = batchData.ItemMaster.ManufacturerName;
                            }
                        }
                    }
                    stockdata.TotalQtyinfloat = (parseInt(stockdata.Qty));
                    stockdata.TotalUcp = (parseFloat(stockdata.Ucp)) / stocklength;
                    stockdata.TotalMrp = (parseFloat(stockdata.Mrp)) / stocklength;
                    stockdata.TotalQty = parseInt(stockdata.TotalQtyinfloat);

                    TotalFooterQty = TotalFooterQty + (stockdata.TotalQty || 0);
                    totalFooterUcp = totalFooterUcp + (stockdata.TotalUcp || 0);
                    totalUcp = totalUcp + (stockdata.NetUcp || 0);
                    totalFooterMrp = totalFooterMrp + (stockdata.TotalMrp || 0);
                    StockstatusData.push(stockdata);
                }
                $scope.TotalFooterQty = TotalFooterQty;
                $scope.TotalFooterUcp = totalFooterUcp;
                $scope.TotalUcp = totalUcp;
                $scope.TotalFooterMrp = totalFooterMrp;
            }


            StockstatusData.forEach(function (rowArray) {
                var itemCode = '';
                var Itemname = '';
                var genericname = '';
                var manufacture = '';
                var totalqty = '';
                var totalucpAvg = '';
                var totalmrpAvg = '';

                if (rowArray.ItemCode) {
                    itemCode = rowArray.ItemCode;
                }

                if (rowArray.ItemName) {
                    Itemname = rowArray.ItemName;
                }
                if (rowArray.GenericName) {
                    genericname = rowArray.GenericName;
                }
                if (rowArray.ManufacturerName) {
                    manufacture = rowArray.ManufacturerName;
                }
                if (rowArray.Qty) {
                    totalqty = rowArray.Qty;
                }
                if (rowArray.Ucp) {
                    totalucpAvg = rowArray.NetUcp;
                }
                if (rowArray.Mrp) {
                    totalmrpAvg = rowArray.Mrp;
                }

                genericname = genericname.replace(/,/g, " ");
                genericname = genericname.replace(/ /g, " ");

                manufacture = manufacture.replace(/,/g, " ");
                manufacture = manufacture.replace(/ /g, " ");

                Itemname = Itemname.replace(/,/g, " ");
                Itemname = Itemname.replace(/ /g, " ");

                csvContent += itemCode + ',' + Itemname + ',' + totalqty + ',' + totalucpAvg + "\n";
            });
            // var encodedUri = encodeURI(csvContent);
            var encodedUri = encodeURIComponent(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'stockstatus-report.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            // var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
                        Key: 1,
                        Value: $scope.currentfilter.ItemMasterId
                    },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.StoreMasterId
                    },
                    {
                        Key: 10,
                        Value: $scope.currentfilter.ProductTypeId
                    },
                    {
                        Key: 11,
                        Value: '0'
                    },
                    // {
                    //     Key: 7,
                    //     Value: From
                    // }
                ],
                PageContext: {
                    PageSize: 10000,
                    PageNumber: 1
                }


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
            var TotalFooterQty = 0;
            var totalFooterUcp = 0;
            var totalUcp = 0;
            var totalFooterMrp = 0;
            $scope.TotalFooterQty = 0;
            $scope.TotalFooterUcp = 0;
            $scope.TotalUcp = 0;
            $scope.TotalFooterMrp = 0;
            if (res.Data.length > 0) {
                var GroupedBatchData = _.groupBy(res.Data, 'ItemMasterId');
                if ($scope.currentfilter.StoreMasterId > 0) {
                    $scope.StoreName = res.Data[0].StoreMaster.StoreName;
                } else {
                    $scope.StoreName = '';
                }
                if ($scope.currentfilter.ProductTypeId > 0) {
                    $scope.ProductType = res.Data[0].ItemMaster.ProductType.ProductTypeName;
                } else {
                    $scope.ProductType = '';
                }
                if ($scope.currentfilter.ItemMasterId > 0) {
                    $scope.ItemName = res.Data[0].ItemMaster.ItemName;
                } else {
                    $scope.ItemName = '';
                }
                for (var itmdx in GroupedBatchData) {
                    var itemgrouped = GroupedBatchData[itmdx];
                    var stockdata = {
                        Qty: 0,
                        Ucp: 0,
                        NetUcp: 0,
                        Mrp: 0,
                        TotalQty: 0,
                        TotalQtyinfloat: 0,
                        TotalUcp: 0,
                        TotalMrp: 0,
                        itemlength: itemgrouped.length
                    };
                    var stocklength = 0;
                    var batchGrpData = _.groupBy(itemgrouped, 'BatchId');
                    for (var gpdx in batchGrpData) {
                        stocklength++;
                        var item = batchGrpData[gpdx];
                        for (var idx in item) {
                            var batchData = item[idx];
                            stockdata.Qty += parseInt(batchData.Quantity);
                            stockdata.Ucp += parseFloat(batchData.Ucp);
                            stockdata.NetUcp += parseFloat(batchData.Quantity) * parseFloat(batchData.Ucp);
                            stockdata.Mrp += parseFloat(batchData.Mrp);
                            stockdata.ItemName = batchData.ItemName;
                            stockdata.ItemCode = batchData.ItemCode;
                            if (batchData.ItemMaster) {
                                stockdata.GenericName = batchData.ItemMaster.GenericName;

                                stockdata.ManufacturerName = batchData.ItemMaster.ManufacturerName;
                            }
                        }
                    }
                    stockdata.TotalQtyinfloat = (parseInt(stockdata.Qty));
                    stockdata.TotalUcp = (parseFloat(stockdata.Ucp)) / stocklength;
                    stockdata.TotalMrp = (parseFloat(stockdata.Mrp)) / stocklength;
                    stockdata.TotalQty = parseInt(stockdata.TotalQtyinfloat);

                    TotalFooterQty = TotalFooterQty + (stockdata.TotalQty || 0);
                    totalFooterUcp = totalFooterUcp + (stockdata.TotalUcp || 0);
                    totalUcp = totalUcp + (stockdata.NetUcp || 0);
                    totalFooterMrp = totalFooterMrp + (stockdata.TotalMrp || 0);
                    vm.gridConfig.data.push(stockdata);
                }
                $scope.TotalFooterQty = TotalFooterQty;
                $scope.TotalFooterUcp = totalFooterUcp;
                $scope.TotalUcp = totalUcp;
                $scope.TotalFooterMrp = totalFooterMrp;
            }
            // vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
        };

        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            // var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
                        Key: 1,
                        Value: $scope.currentfilter.ItemMasterId
                    },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.StoreMasterId
                    },
                    {
                        Key: 10,
                        Value: $scope.currentfilter.ProductTypeId
                    },
                    {
                        Key: 11,
                        Value: '0'
                    },
                    // {
                    //     Key: 7,
                    //     Value: From
                    // },
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
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
        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.currentfilter.ItemMasterId = -1;
                // $scope.getList();
            }
        };
        $scope.backtoReport = function () {
            $state.go('app.storereporttab.generalstorereport');
        };
        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            // var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    StoreName: $scope.StoreName,
                    ItemName: $scope.ItemName,
                    ProductType: $scope.ProductType
                },
                Params: [
                    {
                        Key: 1,
                        Value: $scope.currentfilter.ItemMasterId
                    },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.StoreMasterId
                    },
                    {
                        Key: 10,
                        Value: $scope.currentfilter.ProductTypeId
                    },
                    {
                        Key: 11,
                        Value: '0'
                    },
                    // {
                    //     Key: 7,
                    //     Value: From
                    // },
                ],
                PageContext: {
                    PageSize: 10000,
                    PageNumber: 1
                }
                // PageContext: { PageSize: -1, PageNumber: 1 },
            };

            var options = {
                action: 'pharmacy/stockserialitem/PrintStockStatusGeneralReport',
                data: inputData,
                type: 'post',
            };
            utl.Http.doDownload(options);
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
                PageContext: { PageSize: 25, PageNumber: 1 }
            };

            if (vm.Genericitemcontrolconfig.searchbyid === true) {
                inputData.Params.push({ Key: 3, Value: 2 });
            } else if (query && query.length > 2) {
                inputData.Params.push({ Key: 1, Value: query });
            }

            vm.Genericitemcontrolconfig.searchparams = inputData;
        }

        function postsearchGenericitem() {
            for (var idx in vm.Genericitemcontrolconfig.result) {
                var item = vm.Genericitemcontrolconfig.result[idx];
                item.Code = item.Code;
                item.GenericName = item.GenericName;
                // item.AllergenType = item.AllergenType.Description;
            }
        }
        vm.movementitemcontrolconfig = {
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
            },
            {
                header: 'Generic',
                field: 'GenericName',
                datatype: 'string',
                headercls: 'td-genericname',
                fieldcls: 'td-genericname'
            },
            {
                header: 'Manufacturer',
                field: 'ManufacturerName',
                datatype: 'string',
                headercls: 'td-manufacturername',
                fieldcls: 'td-manufacturername'
            }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/itemmaster/GetItemMasters',
            formatdisplay: formatselectedmovementitem,
            presearch: presearchmovementitem,
            postsearch: postsearchmovementitem
        };

        function formatselectedmovementitem() {
            var selectedItem = vm.movementitemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ItemName + '(' + selectedItem.ItemCode + ')'].join('    ');
            } else if (vm.movementitemcontrolconfig.rowdata) {
                result = [vm.movementitemcontrolconfig.rowdata.ItemCode, vm.movementitemcontrolconfig.rowdata.ItemName].join(' ');
            }
            return result;
        }

        function presearchmovementitem() {
            var query = vm.movementitemcontrolconfig.query;
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

            if (vm.movementitemcontrolconfig.searchbyid === true) {
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

            vm.movementitemcontrolconfig.searchparams = inputData;
        }

        function postsearchmovementitem() {
            for (var idx in vm.movementitemcontrolconfig.result) {
                var item = vm.movementitemcontrolconfig.result[idx];
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
        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "idx", displayName: $translate.instant('S.No'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}} </span> </div>"
            },
            {
                field: "ItemCode",
                displayName: $translate.instant('reports.itemcode.lbl')
            },
            {
                field: "ItemName",
                displayName: $translate.instant('reports.itemname.lbl')
            },
            // {
            //     field: "GenericName",
            //     displayName: $translate.instant('reports.generic.lbl')
            // },
            // {
            //     field: "ManufacturerName",
            //     displayName: $translate.instant('reports.manu.lbl')
            // },
            {
                field: "TotalQty",
                displayName: $translate.instant('reports.totalqty.lbl')
            },
           
            {
                field: "TotalUcp",
                displayName: $translate.instant('UCP'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TotalUcp | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalUcp | displaycurrency}}&nbsp;</span>' + '</div>',
            },
            {
                field: "NetUcp",
                displayName: $translate.instant('Total Ucp'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.NetUcp | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalMrp | displaycurrency}}&nbsp;</span>' + '</div>',
            },
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.currentfilter.StoreMasterId === 0) {
                    $scope.currentfilter.StoreMasterId = value[0].Id;
                }
            });
            // $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Facility",
                Request: {
                    Params: [{
                        Key: 4,
                        Value: true
                    }]
                }
            },
            {
                "Key": "UserStores",
                Default: false,
                Request: {
                    Params: [{
                        Key: 1,
                        Value: utl.Session.getCurrentUserId()
                    },
                    {
                        Key: 2,
                        Value: utl.Session.getCurrentFacilityId()
                    },
                    {
                        Key: 5,
                        Value: 2
                    },
                        // {
                        //     Key: 8,
                        //     Value: 2
                        // }
                    ]
                }
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
            },]
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

    stockstatusgeneralreportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();