(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('StockNonMovementReportController', StockNonMovementReportController);

    function StockNonMovementReportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            StoreMasterId: -1,
        };
        $scope.lookup = {};

        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }


        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Item Code", "Item Name", "Product Type Name", "Quantity", "Batch Id", "Expiry Date", "Purchase Price", "UCP", "MRP"]
            let csvContent = JsonFields.join(",") + "\n";
            data.forEach(function (rowArray) {
                var itemcode = '';
                var itemname = '';
                var productType = '';
                var qty = '';
                var batchId = '';
                var expDate = '';
                var purchasePrice = '';
                var ucp = '';
                var mrp = '';

                if (rowArray.ItemMaster.ItemCode) {
                    itemcode = rowArray.ItemMaster.ItemCode;
                }

                if (rowArray.ItemMaster.ItemName) {
                    itemname = rowArray.ItemMaster.ItemName;
                }
                if (rowArray.ItemMaster) {
                    if (rowArray.ItemMaster.ProductType) {
                        if (rowArray.ItemMaster.ProductType.ProductTypeName) {
                            productType = rowArray.ItemMaster.ProductType.ProductTypeName;
                        }
                    }
                }
                if (rowArray.Quantity) {
                    qty = rowArray.Quantity;
                }
                if (rowArray.BatchId) {
                    batchId = rowArray.BatchId;
                }
                if (rowArray.ExpiryDate) {
                    expDate = rowArray.ExpiryDate;
                }
                if (rowArray.PurchasePrice) {
                    purchasePrice = rowArray.PurchasePrice;
                }
                if (rowArray.Ucp) {
                    ucp = rowArray.Ucp;
                }
                if (rowArray.Mrp) {
                    mrp = rowArray.Mrp;
                }

                csvContent += itemcode + ',' + itemname + ',' + productType + ',' + qty + ',' + batchId + ',' + expDate + ',' + purchasePrice + ',' + ucp + ',' + mrp + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'stocknonmovement-report.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
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
                        Key: 11,
                        Value: '0'
                    }
                ],

            };
            var options = {
                action: "pharmacy/stockserialitem/GetStockSerialItemsforNonMovements",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res;
            if ($scope.currentfilter.ItemMasterId > 0) {
                $scope.ItemName = res[0].ItemMaster.ItemName;
            }
            if ($scope.currentfilter.StoreMasterId > 0) {
                $scope.StoreName = res[0].StoreMaster.StoreName;
            }
            // vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var startTime = new Date($scope.currentfilter.FromDate);
            var endTime = new Date($scope.currentfilter.ToDate);
            var difference = endTime.getTime() - startTime.getTime();
            var resultInDays = Math.round(difference / (1000 * 60 * 60 * 24)); // Calculate difference in days
            if (!(resultInDays >= 0 && resultInDays < 15)) { // Check if difference is less than 15 days
                utl.Alert.showSuccessMsg("From and To Date Difference should be less than 15 days...");
                $scope.currentfilter.FromDate = new Date();
                $scope.currentfilter.ToDate = new Date();
                return false;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
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
                        Key: 11,
                        Value: '0'
                    },
                ],
                // PageContext: {
                //     PageSize: vm.gridConfig.pagerObj.pageSize,
                //     PageNumber: vm.gridConfig.pagerObj.currentPage
                // }
            };

            var options = {
                action: 'pharmacy/stockserialitem/GetStockSerialItemsforNonMovements',
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
            $state.go('app.storereporttab.generalstorereport');
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

        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    StoreName: $scope.StoreName,
                    ItemName: $scope.ItemName,
                },
                Params: [{
                    Key: 1,
                    Value: $scope.currentfilter.ItemMasterId
                },
                {
                    Key: 2,
                    Value: $scope.currentfilter.StoreMasterId
                },
                {
                    Key: 11,
                    Value: '0'
                },
                ],
            };

            var options = {
                action: 'pharmacy/stockserialitem/PrintStockNonMovementReport',
                data: inputData,
                type: 'post',
            };
            utl.Http.doDownload(options);
        };

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
                field: "ItemMaster.ProductType.ProductTypeName",
                displayName: $translate.instant('reports.product.lbl')
            },
            {
                field: "Quantity",
                displayName: $translate.instant('reports.qty.lbl')
            },
            {
                field: "BatchId",
                displayName: $translate.instant('reports.batchid.lbl')
            },
            {
                field: "ExpiryDate",
                displayName: $translate.instant('reports.expirydate.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.ExpiryDate | date : 'dd-MM-yyyy'}} </span></div>"

            },
            {
                field: "PurchasePrice",
                displayName: $translate.instant('reports.purchaseprice.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.PurchasePrice | displaycurrency}}</span>" + "</div>"
                // cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.PurchasePrice | displaycurrency}}</span>" + "</div>"
            },
            {
                field: "Ucp",
                displayName: $translate.instant('reports.ucp.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.Ucp | displaycurrency}}</span>" + "</div>"
                // cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.Ucp | displaycurrency}}</span>" + "</div>"
            },
            {
                field: "Mrp",
                displayName: $translate.instant('reports.mrp.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.Mrp | displaycurrency}}</span>" + "</div>"
                // cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.Mrp | displaycurrency}}</span>" + "</div>"
            },
            ],
            // pagerObj: {
            //     totalItems: 0,
            //     currentPage: 1,
            //     startIndex: 0,
            //     pageSize: 25
            // }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.currentfilter.StoreMasterId === -1) {
                    for (var usidx in $scope.lookup.UserStores) {
                        if ($scope.lookup.UserStores[usidx].IsDefault) {
                            $scope.currentfilter.StoreMasterId = $scope.lookup.UserStores[usidx].Id;
                        }
                    }
                    if ($scope.currentfilter.StoreMasterId === -1) {
                        $scope.currentfilter.StoreMasterId = value[0].Id;
                    }
                }
            });
            // $scope.getList();

        };

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

    StockNonMovementReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();