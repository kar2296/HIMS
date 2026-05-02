(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ItemReorderListReportController', ItemReorderListReportController);

    function ItemReorderListReportController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            StoreMasterId: 0
        };
        $scope.lookup = {};


        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Item Code", "Item Name", "Product Type Name", "Category", "Sub Category", "Max Qty", "Min Qty", "ROL Qty", "Lead Time"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var itemcode = '';
                var itemName = '';
                var productType = '';
                var category = '';
                var subCategory = '';
                var maxQty = '';
                var minQty = '';
                var rolqty = '';
                var leadtime = '';

                if (rowArray.ItemCode) {
                    itemcode = rowArray.ItemCode;
                }
                if (rowArray.ItemName) {
                    itemName = rowArray.ItemName;
                }
                if (rowArray.ItemMaster.ProductType.ProductTypeName) {
                    productType = rowArray.ItemMaster.ProductType.ProductTypeName;
                }
                if (rowArray.ItemMaster.ItemCategory.CategoryName) {
                    category = rowArray.ItemMaster.ItemCategory.CategoryName;
                }
                if (rowArray.ItemMaster.ItemSubCategory.SubCategoryName) {
                    subCategory = rowArray.ItemMaster.ItemSubCategory.SubCategoryName;
                }
                if (rowArray.MaxQty) {
                    maxQty = rowArray.MaxQty;
                }
                if (rowArray.MinQty) {
                    minQty = rowArray.MinQty;
                }
                if (rowArray.ROLQty) {
                    rolqty = rowArray.ROLQty;
                }
                if (rowArray.LeadTime) {
                    leadtime = rowArray.LeadTime;
                }


                csvContent += itemcode + ',' + itemName + ',' + productType + ',' + category + ',' + subCategory + ',' + maxQty + ',' + minQty + ',' + rolqty + ',' + leadtime + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'itemreorderlist-report.csv';
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
                { header: 'Manufacturer Name', field: 'ManufacturerName', datatype: 'string', headercls: 'td-manufacturername', fieldcls: 'td-manufacturername' },
                { header: 'Stock-In-Hand', field: 'StockInHand', datatype: 'string', headercls: 'td-stockinhand', fieldcls: 'td-stockinhand' }
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
                    field: "ItemMaster.ItemCategory.CategoryName",
                    displayName: $translate.instant('reports.cat.lbl')
                },

                {
                    field: "ItemMaster.ItemSubCategory.SubCategoryName",
                    displayName: $translate.instant('reports.subcat.lbl')
                },
                {
                    field: "MaxQty",
                    displayName: $translate.instant('reports.maxqty.lbl')
                },
                {
                    field: "MinQty",
                    displayName: $translate.instant('reports.minqty.lbl')
                },
                {
                    field: "ROLQty",
                    displayName: $translate.instant('reports.rolqty.lbl')
                },
                {
                    field: "LeadTime",
                    displayName: $translate.instant('reports.leadtime.lbl')
                },

            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };
        $scope.excel = function () {
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
                action: 'pharmacy/ItemStoreMap/PrintItemReorderList',
                data: inputData,
                type: 'post',
            };

            var downloadLink;
            var dataType = 'application/vnd.ms-excel';
            var tableSelect = document.getElementById(tableID);
            var tableHTML = tableSelect.outerHTML.replace(/ /g, '%20');

            // Specify file name
            filename = filename ? filename + '.xls' : 'excel_data.xls';

            // Create download link element
            downloadLink = document.createElement("a");

            document.body.appendChild(downloadLink);

            if (navigator.msSaveOrOpenBlob) {
                var blob = new Blob(['\ufeff', tableHTML], {
                    type: dataType
                });
                navigator.msSaveOrOpenBlob(blob, filename);
            } else {
                // Create a link to the file
                downloadLink.href = 'data:' + dataType + ', ' + tableHTML;

                // Setting the file name
                downloadLink.download = filename;

                //triggering the function
                downloadLink.click();
            }
        }

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
                action: 'pharmacy/ItemStoreMap/PrintItemReorderList',
                data: inputData,
                type: 'post',
            };

            utl.Http.doDownload(options);
        };
        $scope.backtoReport = function () {
            $state.go('app.storereporttab.masterreport')
        }
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

    ItemReorderListReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();