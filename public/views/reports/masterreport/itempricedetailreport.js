(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ItemPriceDetailsController', ItemPriceDetailsController);

    function ItemPriceDetailsController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            StoreMasterId: 0,
            ActiveStatusId: 2,
        };
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }


        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Item Code", "Item Name", "Product Type Name", "Supplier", "Min Qty", "Max Qty", "Free Qty", "Purchase Uom", "GST", "Purchase Price", "Sale Price"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var itemCode = '';
                var itemName = '';
                var producttypename = '';
                var supplier = '';
                var minQty = '';
                var maxQty = '';
                var freeQty = '';
                var purchaseUom = '';
                var gst = '';
                var purchasePrice = '';
                var saleprice = '';

                if (rowArray.ItemCode) {
                    itemCode = rowArray.ItemCode;
                }
                if (rowArray.ItemName) {
                    itemName = rowArray.ItemName;
                }
                if (rowArray.ItemMaster.ProductType) {
                    if (rowArray.ItemMaster.ProductType.ProductTypeName) {
                        producttypename = rowArray.ItemMaster.ProductType.ProductTypeName;
                    }
                }
                if (rowArray.VendorMaster.VendorName) {
                    supplier = rowArray.VendorMaster.VendorName;
                }
                if (rowArray.MinQty) {
                    minQty = rowArray.MinQty;
                }
                if (rowArray.MaxQty) {
                    maxQty = rowArray.MaxQty;
                }
                if (rowArray.FreeQty) {
                    freeQty = rowArray.FreeQty;
                }
                if (rowArray.PurchaseUom) {
                    if (rowArray.PurchaseUom.UomName) {
                        purchaseUom = rowArray.PurchaseUom.UomName;
                    }
                }
                if (rowArray.GstMaster.GstName) {
                    gst = rowArray.GstMaster.GstName;
                }

                if (rowArray.UomPrice) {
                    purchasePrice = rowArray.UomPrice;
                }
                if (rowArray.UomMrPrice) {
                    saleprice = rowArray.UomMrPrice;
                }


                csvContent += itemCode + ',' + itemName + ',' + producttypename + ',' + supplier + ',' + minQty + ',' + maxQty + ',' + freeQty + ',' + purchaseUom + ',' + gst + ',' + purchasePrice + ',' + saleprice + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'itempricedetails-report.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            var inputData = {
                Params: [{
                    Key: 1,
                    Value: $scope.currentfilter.VendorMasterId
                },
                {
                    Key: 2,
                    Value: $scope.currentfilter.ItemMasterId
                },
                {
                    Key: 9,
                    Value: $scope.currentfilter.ProductTypeId
                },
                {
                    Key: 5,
                    Value: $scope.currentfilter.ActiveStatusId
                }
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };
            var options = {
                action: "pharmacy/itemmaster/GetItemVendorMaps",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };


        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
            if ($scope.currentfilter.VendorMasterId > 0) {
                $scope.VendorName = res.Data[0].VendorMaster.VendorName;
            } else {
                $scope.VendorName = '';
            }
            if ($scope.currentfilter.ProductTypeId > 0) {
                $scope.ProductName = res.Data[0].ProductType.ProductTypeName;
            } else {
                $scope.ProductName = '';
            }
            if ($scope.currentfilter.ActiveStatusId > 0) {
                $scope.ActiveStatus = res.Data[0].ActiveStatus.Description;
            } else {
                $scope.ActiveStatus = '';
            }
        };

        $scope.getList = function (pageNo) {
            var inputData = {
                Params: [{
                    Key: 1,
                    Value: $scope.currentfilter.VendorMasterId
                },
                {
                    Key: 2,
                    Value: $scope.currentfilter.ItemMasterId
                },
                {
                    Key: 9,
                    Value: $scope.currentfilter.ProductTypeId
                },
                {
                    Key: 5,
                    Value: $scope.currentfilter.ActiveStatusId
                },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/itemmaster/GetItemVendorMaps',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        vm.itemcontrolconfig = {
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
                header: 'Product Type Name',
                field: 'ProductTypeName',
                datatype: 'string',
                headercls: 'td-producttypename',
                fieldcls: 'td-producttypename'
            },
            {
                header: 'Generic Name',
                field: 'GenericName',
                datatype: 'string',
                headercls: 'td-genericname',
                fieldcls: 'td-genericname'
            },
            {
                header: 'Manufacturer Name',
                field: 'ManufacturerName',
                datatype: 'string',
                headercls: 'td-manufacturername',
                fieldcls: 'td-manufacturername'
            },
            {
                header: 'Stock-In-Hand',
                field: 'StockInHand',
                datatype: 'string',
                headercls: 'td-stockinhand',
                fieldcls: 'td-stockinhand'
            }
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

            vm.itemcontrolconfig.searchparams = inputData;
        }

        function postsearchgrnitem() {
            for (var idx in vm.itemcontrolconfig.result) {
                var item = vm.itemcontrolconfig.result[idx];
                item.ItemCode = item.ItemCode;
                item.ItemName = item.ItemName;
            }
        }
        $scope.onenter = function (data) {
            if (data == undefined) {
                // $scope.getList();
            }
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            // $scope.getList();
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "idx",
                displayName: $translate.instant('S.No'),
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
                field: "VendorMaster.VendorName",
                displayName: $translate.instant('reports.vendorname.lbl')
            },

            {
                field: "MinQty",
                displayName: $translate.instant('reports.minqty.lbl')
            },
            {
                field: "MaxQty",
                displayName: $translate.instant('reports.maxqty.lbl')
            },
            {
                field: "FreeQty",
                displayName: $translate.instant('reports.freeqty.lbl')
            },
            {
                field: "PurchaseUom.UomName",
                displayName: $translate.instant('reports.purchaseuom.lbl')
            },

            {
                field: "GstMaster.GstName",
                displayName: $translate.instant('reports.gst.lbl')
            },
            {
                field: "UomPrice",
                displayName: $translate.instant('reports.purchaseprice.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.UomPrice | displaycurrency}}</span>" + "</div>"
            },
            {
                field: "UomMrPrice",
                displayName: $translate.instant('reports.saleprice.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.UomMrPrice | displaycurrency}}</span>" + "</div>"
            },
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };
        $scope.print = function (pageNo) {
            var inputData = {
                Data: {
                    VendorName: $scope.VendorName,
                    ProductName: $scope.ProductName

                },
                Params: [{
                    Key: 1,
                    Value: $scope.currentfilter.VendorMasterId
                },
                {
                    Key: 2,
                    Value: $scope.currentfilter.ItemMasterId
                },
                {
                    Key: 9,
                    Value: $scope.currentfilter.ProductTypeId
                },
                {
                    Key: 5,
                    Value: $scope.currentfilter.ActiveStatusId
                },
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'pharmacy/itemmaster/PrintItemPricereport',
                data: inputData,
                type: 'post',
            };

            utl.Http.doDownload(options);
        };
        $scope.backtoReport = function () {
            if ($scope.Context == 'pharmacyreports') {
                $state.go('app.pharmacytabreport.masterreport');
            }
            if ($scope.Context == 'storereports') {
                $state.go('app.storereporttab.masterreport');
            }

        };
        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Facility"
            },
            {
                "Key": "ActiveStatus"
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
                "Key": "VendorMaster"
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

    ItemPriceDetailsController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();