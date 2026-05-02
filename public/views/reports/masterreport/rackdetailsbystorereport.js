(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('RackDetailByStoreReportController', RackDetailByStoreReportController);

    function RackDetailByStoreReportController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            StoreMasterId: 0
        };
        $scope.lookup = {};

        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Item Code", "Item Name", "Product Type Name", "Category", "Sub Category", "Rack", "Self", "Tray"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var itemcode = '';
                var itemName = '';
                var productName = '';
                var category = '';
                var subCategory = '';
                var rack = '';
                var self = '';
                var tray = '';

                if (rowArray.ItemCode) {
                    itemcode = rowArray.ItemCode;
                }
                if (rowArray.ItemName) {
                    itemName = rowArray.ItemName;
                }
                if (rowArray.ItemMaster.ProductType) {
                    if (rowArray.ItemMaster.ProductType.ProductTypeName) {
                        productName = rowArray.ItemMaster.ProductType.ProductTypeName;
                    }
                }
                if (rowArray.ItemMaster.ItemCategory) {
                    if (rowArray.ItemMaster.ItemCategory.CategoryName) {
                        category = rowArray.ItemMaster.ItemCategory.CategoryName;
                    }

                    if (rowArray.ItemMaster.ItemSubCategory.SubCategoryName) {
                        subCategory = rowArray.ItemMaster.ItemSubCategory.SubCategoryName;
                    }
                }
                if (rowArray.RackName) {
                    rack = rowArray.RackName;
                }
                if (rowArray.Self) {
                    self = rowArray.Self;
                }
                if (rowArray.Tray) {
                    tray = rowArray.Tray;
                }


                csvContent += itemcode + ',' + itemName + ',' + productName + ',' + category + ',' + subCategory + ',' + rack + ',' + self + ',' + tray + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'rackdetailsbystore-report.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.StoreMasterId },
                    { Key: 2, Value: $scope.currentfilter.ItemMasterId },
                    { Key: 6, Value: $scope.currentfilter.ProductTypeId }
                ],

            };
            var options = {
                action: "pharmacy/itemmaster/GetStoreItems",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            vm.gridConfig.data = res.Data;
            if ($scope.currentfilter.StoreMasterId > 0) {
                $scope.StoreName = res.Data[0].StoreMaster.StoreName;
            } else {
                $scope.StoreName = '';
            }
            if ($scope.currentfilter.ProductTypeId > 0) {
                $scope.ProductName = res.Data[0].ProductType.ProductTypeName;
            } else {
                $scope.ProductName = '';
            }
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {
            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.StoreMasterId },
                    { Key: 2, Value: $scope.currentfilter.ItemMasterId },
                    { Key: 6, Value: $scope.currentfilter.ProductTypeId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/itemmaster/GetStoreItems',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        vm.itemcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Item Code', field: 'ItemCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Item Name', field: 'ItemName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Product Type Name', field: 'ProductTypeName', datatype: 'string', headercls: 'td-producttypename', fieldcls: 'td-producttypename' },
                { header: 'Generic Name', field: 'GenericName', datatype: 'string', headercls: 'td-genericname', fieldcls: 'td-genericname' },
                // { header: 'Manufacturer Name', field: 'ManufacturerName', datatype: 'string', headercls: 'td-manufacturername', fieldcls: 'td-manufacturername' },
                // { header: 'Stock-In-Hand', field: 'StockInHand', datatype: 'string', headercls: 'td-stockinhand', fieldcls: 'td-stockinhand' }
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

            // $scope.getList();

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
                if (item.StockItem) {
                    item.StockInHand = item.StockItem.Quantity;
                    item.Mrp = parseFloat(item.MrPrice).toFixed(2);
                } else {
                    if (item.ItemMaster) {
                        if (item.ItemMaster.StockItem) {
                            item.StockInHand = item.ItemMaster.StockItem.Quantity;
                        } else {
                            item.StockInHand = 0;
                        }
                    } else {
                        item.StockInHand = 0;
                    }
                    item.Mrp = parseFloat(item.UomMrPrice).toFixed(2);
                }
            }
        }
        $scope.onenter = function (data) {
            if (data == undefined) {
                // $scope.getList();
            }
        };


        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "idx", displayName: $translate.instant('S.No'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{index+1}} </span> </div>"
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
                    field: "ItemMaster.ItemCategory.CategoryName",
                    displayName: $translate.instant('reports.cat.lbl')
                },

                {
                    field: "ItemMaster.ItemSubCategory.SubCategoryName",
                    displayName: $translate.instant('reports.subcat.lbl')
                },
                {
                    field: "RackName",
                    displayName: $translate.instant('reports.rack.lbl')
                },
                {
                    field: "Self",
                    displayName: $translate.instant('reports.self.lbl')
                },
                {
                    field: "Tray",
                    displayName: $translate.instant('reports.tray.lbl')
                },

            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };
        $scope.print = function () {
            var inputData = {
                Data: {
                    ItemName: $scope.ItemName,
                    ProductName: $scope.ProductName,
                    StoreName: $scope.StoreName

                },
                Params: [
                    { Key: 1, Value: $scope.currentfilter.StoreMasterId },
                    { Key: 2, Value: $scope.currentfilter.ItemMasterId },
                    { Key: 6, Value: $scope.currentfilter.ProductTypeId }
                ],
            };

            var options = {
                action: 'pharmacy/ItemStoreMap/PrintRackDetailsbyStore',
                data: inputData,
                type: 'post',
            };

            utl.Http.doDownload(options);
        };
        $scope.backtoReport = function () {
            if ($scope.Context == 'pharmacyreports') {
                $state.go('app.pharmacytabreport.masterreport');
            } if ($scope.Context == 'storereports') {
                $state.go('app.storereporttab.masterreport');
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
            var inputData = [
                { "Key": "Facility" },
                { "Key": "ActiveStatus" },
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
                { "Key": "VendorMaster" },
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

    RackDetailByStoreReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();