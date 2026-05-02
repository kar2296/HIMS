(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('MedicineExpiredReportController', MedicineExpiredReportController);

    function MedicineExpiredReportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            // FromDate: utl.Formatter.getCurrentDate(),
            // ToDate: utl.Formatter.getCurrentDate(),
            StoreMasterId: 0
        };
        $scope.lookup = {};
        $scope.CanShowPrint = false;
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Item Code", "Item Name", "Product Type Name", "Manufacturer Name", "Quantity", "Batch Id", "Expiry Date", "Purchase Price", "MRP", "Value"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var itemcode = '';
                var itemname = '';
                var productType = '';
                var manufacture = '';
                var qty = '';
                var batchId = '';
                var expDate = '';
                var purchasePrice = '';
                var mrp = '';
                var value = '';

                if (rowArray.ItemCode) {
                    itemcode = rowArray.ItemCode;
                }

                if (rowArray.ItemName) {
                    itemname = rowArray.ItemName;
                }
                if (rowArray.ItemMaster) {
                    if (rowArray.ItemMaster.ProductType) {
                        if (rowArray.ItemMaster.ProductType.ProductTypeName) {
                            productType = rowArray.ItemMaster.ProductType.ProductTypeName;
                        }
                    }
                    if (rowArray.ItemMaster.ManufacturerName) {
                        manufacture = rowArray.ItemMaster.ManufacturerName;
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
                if (rowArray.Mrp) {
                    mrp = rowArray.Mrp;
                }
                if (rowArray.Value) {
                    value = rowArray.Value;
                }
                csvContent += itemcode + ',' + itemname + ',' + productType + ',' + manufacture + ',' + qty + ',' + batchId + ',' + expDate + ',' + purchasePrice + ',' + mrp + ',' + value + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'medicineexpired-report.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            var TodayDate = new Date().toISOString().slice(0, 10);
            var inputData = {
                Params: [
                    // {
                    //     Key: 7,
                    //     Value: From
                    // },
                    {
                        Key: 8,
                        Value: TodayDate
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
                    }
                ],

            };
            var options = {
                action: "pharmacy/stockserialitem/GetExpiredSerialItems",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            for (var idx in res.Data) {
                var item = res.Data[idx];
                if ($scope.currentfilter.StoreMasterId > 0) {
                    $scope.StoreName = item.StoreMaster.StoreName;
                }
                if ($scope.currentfilter.ProductTypeId > 0) {
                    $scope.ProductName = item.ItemMaster.ProductType.ProductTypeName;
                }

                item.Value = parseFloat(item.Quantity) * parseFloat(item.PurchasePrice);
                vm.gridConfig.data.push(item);
            }
            if (vm.gridConfig.data.length > 0) {
                $scope.CanShowPrint = true;
            }
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var TodayDate = new Date().toISOString().slice(0, 10);
            var inputData = {
                Params: [
                    // {
                    //     Key: 7,
                    //     Value: From
                    // },
                    {
                        Key: 8,
                        Value: TodayDate
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
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/stockserialitem/GetExpiredSerialItems',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.currentfilter.VendorMasterId = -1;
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
        vm.vendorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Vendor Code', field: 'VendorCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Vendor Name', field: 'VendorName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Vendor Contact', field: 'PhoneNumber', datatype: 'string', headercls: 'td-phoneno', fieldcls: 'td-phoneno' }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/vendormaster/GetVendorMasters',
            formatdisplay: formatselectedvendor,
            presearch: presearchvendor,
            postsearch: postsearchvendor
        };

        function formatselectedvendor() {
            var selectedItem = vm.vendorcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.currentfilter.VendorMasterId = selectedItem.VendorMasterId;
                result = [selectedItem.VendorName + ' (' + selectedItem.VendorCode + ')'].join(' ');
            } else if (vm.vendorcontrolconfig.rowdata) {
                result = [vm.vendorcontrolconfig.rowdata.VendorName, vm.vendorcontrolconfig.rowdata.VendorCode].join(' ');
            }

            return result;

            if ($scope.currentfilter.VendorMasterId > 0) {
                $scope.getList();
            }
        }

        function presearchvendor() {
            var query = vm.vendorcontrolconfig.query;
            var inputData = {
                Params: [],
                PageContext: { PageSize: 25, PageNumber: 1 }
            };

            if (vm.vendorcontrolconfig.searchbyid === true) {
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

            vm.vendorcontrolconfig.searchparams = inputData;
        }

        function postsearchvendor() {
            for (var idx in vm.vendorcontrolconfig.result) {
                var item = vm.vendorcontrolconfig.result[idx];
                item.VendorCode = item.VendorCode;
                item.VendorName = item.VendorName;
                item.PhoneNumber = item.PhoneNumber;
            }
        }


        $scope.print = function () {
            // var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var TodayDate = new Date().toISOString().slice(0, 10);
            var inputData = {
                Data: {
                    // FromDate: From,
                    ToDate: TodayDate,
                    StoreName: $scope.StoreName,
                    ProductName: $scope.ProductName
                },
                Params: [
                    // {
                    //     Key: 7,
                    //     Value: From
                    // },
                    {
                        Key: 8,
                        Value: TodayDate
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
                ],
            };

            var options = {
                action: 'pharmacy/stockserialitem/PrintMedicineExpiredReport',
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
                field: "ItemCode",
                displayName: $translate.instant('reports.itemcode.lbl')
            },
            {
                field: "ItemName",
                displayName: $translate.instant('reports.itemname.lbl')
            },
            {
                field: "ItemMaster.ProductType.ProductTypeName",
                displayName: $translate.instant('reports.product.lbl')
            },
            {
                field: "ItemMaster.ManufacturerName",
                displayName: $translate.instant('reports.manu.lbl')
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
                field: "Mrp",
                displayName: $translate.instant('reports.mrp.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.Mrp | displaycurrency}}</span>" + "</div>"
                // cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.Mrp | displaycurrency}}</span>" + "</div>"
            },
            {
                field: "Value",
                displayName: $translate.instant('reports.value.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.Value | displaycurrency}}</span>" + "</div>"
                // cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.Value | displaycurrency}}</span>" + "</div>"
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

    MedicineExpiredReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();