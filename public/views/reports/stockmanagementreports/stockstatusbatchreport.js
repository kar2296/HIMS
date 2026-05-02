(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('StockStatusBatchReportController', StockStatusBatchReportController);

    function StockStatusBatchReportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            StoreMasterId: 0
        };
        $scope.lookup = {};
        $scope.CanShowPrint = false;
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }


        $scope.custom_sort = function (a, b) {
            if (a.ItemName < b.ItemName)
                return -1;
            if (a.ItemName > b.ItemName)
                return 1;
            return 0;
        };


        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Item Code", "Item Name", "Generic Name", "Manufacturer Name", "Batch Id", "Expiry Date", "Quantity", "UCP", "MRP", "Total UCP", "Total MRP"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var itemcode = '';
                var itemname = '';
                var genericName = '';
                var manufacture = '';
                var batchId = '';
                var expDate = '';
                var qty = '';
                var ucp = '';
                var mrp = '';
                var totalucp = '';
                var totalmrp = '';

                if (rowArray.ItemMaster.ItemCode) {
                    itemcode = rowArray.ItemMaster.ItemCode;
                }
                if (rowArray.ItemMaster.ItemName) {
                    itemname = rowArray.ItemMaster.ItemName;
                }
                if (rowArray.ItemMaster) {
                    if (rowArray.ItemMaster.GenericName) {
                        genericName = rowArray.ItemMaster.GenericName;
                    }
                    if (rowArray.ItemMaster.ManufacturerName) {
                        manufacture = rowArray.ItemMaster.ManufacturerName;
                    }
                }
                if (rowArray.BatchId) {
                    batchId = rowArray.BatchId;
                }
                if (rowArray.ExpiryDate) {
                    expDate = rowArray.ExpiryDate;
                }
                if (rowArray.Quantity) {
                    qty = rowArray.Quantity;
                }
                if (rowArray.Ucp) {
                    ucp = rowArray.Ucp;
                    totalucp = rowArray.Quantity * rowArray.Ucp;
                }
                if (rowArray.Mrp) {
                    mrp = rowArray.Mrp;
                    totalmrp = rowArray.Quantity * rowArray.Mrp;
                }

                csvContent += itemcode + ',' + itemname + ',' + genericName + ',' + manufacture + ',' + batchId + ',' + expDate + ',' + qty + ',' + ucp + ',' + mrp + ',' + totalucp + ',' + totalmrp + "\n";
            });
            // var encodedUri = encodeURI(csvContent);
            var encodedUri = encodeURIComponent(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'stockstatusbatch-report.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            // if (!$scope.currentfilter.FromDate || $scope.currentfilter.FromDate == '' ||
            //     !$scope.currentfilter.ToDate || $scope.currentfilter.ToDate == '') {
            //     vm.gridConfig.data = [];
            //     $scope.TotalQty = 0;
            //     $scope.CanShowPrint = false;
            //     return;
            // // }
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
                    {
                        Key: 7,
                        Value: From
                    }
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
            $scope.StockData = [];
            var TotalQty = 0;
            var FooterUCP = 0;
            var FooterMRP = 0;
            var FootertotUCP = 0;
            var FootertotMRP = 0;
            // var GroupedBatchData = _.groupBy(res.Data, 'BatchId','ItemMasterId')

            for (var idx in res.Data) {
                var item = res.Data[idx];
                item.Ucp = isNaN(parseFloat(item.Ucp)) ? (0) : parseFloat(item.Ucp);
                item.Mrp = isNaN(parseFloat(item.Mrp)) ? (0) : parseFloat(item.Mrp);
                item.TotalUCP = isNaN(parseFloat(item.Quantity) * parseFloat(item.Ucp)) ? (0) : parseFloat(item.Quantity) * parseFloat(item.Ucp);
                item.TotalMRP = isNaN(parseFloat(item.Quantity) * parseFloat(item.Mrp)) ? (0) : parseFloat(item.Quantity) * parseFloat(item.Mrp);
                if ($scope.currentfilter.ItemMasterId > 0) {
                    $scope.ItemName = res.Data[0].ItemMaster.ItemName;
                } else {
                    $scope.ItemName = '';
                }
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
                TotalQty = TotalQty + item.Quantity;
                FooterUCP = FooterUCP + item.Ucp;
                FooterMRP = FooterMRP + item.Mrp;
                FootertotUCP = FootertotUCP + item.TotalUCP;
                FootertotMRP = FootertotMRP + item.TotalMRP;

                $scope.StockData.push(item);
            }
            vm.gridConfig.data = $scope.StockData.sort($scope.custom_sort);
            if (vm.gridConfig.data.length > 0) {
                $scope.CanShowPrint = true;
            }

            $scope.TotalQuantity = TotalQty;
            $scope.FooterUCP = FooterUCP;
            $scope.FooterMRP = FooterMRP;
            $scope.FootertotUCP = FootertotUCP;
            $scope.FootertotMRP = FootertotMRP;

            // vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
            // vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            
            if (!$scope.currentfilter.FromDate || $scope.currentfilter.FromDate == '' ||
                !$scope.currentfilter.ToDate || $scope.currentfilter.ToDate == '') {
                vm.gridConfig.data = [];
                $scope.TotalQty = 0;
                $scope.CanShowPrint = false;
                return;
            }
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
                    {
                        Key: 7,
                        Value: From
                    },
                ],
                PageContext: {
                    PageSize: -1,
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
        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.currentfilter.ItemMasterId = -1;
                $scope.getList();
            }
        };
        $scope.backtoReport = function () {
            if ($scope.Context == 'pharmacyreports') {
                $state.go('app.pharmacytabreport.stockmanagementreport');
            } if ($scope.Context == 'inventoryreport') {
                $state.go('app.financereporttab.inventoryreport');
            } if ($scope.Context == 'storereports') {
                $state.go('app.storereporttab.stackmanagementreport');
            }

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
                    {
                        Key: 7,
                        Value: From
                    },
                ],
                PageContext: { PageSize: -1, PageNumber: 1 },
            };

            var options = {
                action: 'pharmacy/stockserialitem/PrintStockStatusBatchReport',
                data: inputData,
                type: 'post',
            };
            utl.Http.doDownload(options);
        };
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
                field: "ItemMaster.ItemCode",
                displayName: $translate.instant('reports.itemcode.lbl')
            },
            {
                field: "ItemMaster.ItemName",
                displayName: $translate.instant('reports.itemname.lbl')
            },
            {
                field: "ItemMaster.GenericName",
                displayName: $translate.instant('reports.generic.lbl')
            },
            {
                field: "ItemMaster.ManufacturerName",
                displayName: $translate.instant('reports.manu.lbl')
            },
            {
                field: "BatchId",
                displayName: $translate.instant('reports.batchid.lbl')
            },
            {
                field: "ExpiryDate",
                displayName: $translate.instant('reports.expirydate.lbl'),
                cellTemplate: "<ngformatdate date-val='entity.ExpiryDate'></ngformatdate>"
            },
            {
                field: "Quantity",
                displayName: $translate.instant('reports.qty.lbl')
            },
            {
                field: "Ucp",
                displayName: $translate.instant('reports.ucp.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.Ucp | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.Ucp | displaycurrency}}&nbsp;</span>' + '</div>',
            },
            {
                field: "Mrp",
                displayName: $translate.instant('reports.mrp.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.Mrp | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.Mrp | displaycurrency}}&nbsp;</span>' + '</div>',
            },
            {
                field: "TotalUCP",
                displayName: $translate.instant('Total UCP'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TotalUCP | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalUCP | displaycurrency}}&nbsp;</span>' + '</div>',
            },
            {
                field: "TotalMRP",
                displayName: $translate.instant('Total MRP'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TotalMRP | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalMRP | displaycurrency}}&nbsp;</span>' + '</div>',
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
                    }
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

    StockStatusBatchReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();