(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ItemMasterReportController', ItemMasterReportController);

    function ItemMasterReportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
            ActiveStatusId: 2,
        };

        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.lookup = {};
        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Item Code", "Item Name", "Category", "Sub Category", "Generic Name", "Manufacturer Name", "Purchase Uom", "GST", "Discount Amt", "Product Type Name", "Billable", "Schedule Type"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var itemCode = '';
                var itemName = '';
                var category = '';
                var subCate = '';
                var genericeName = '';
                var manufacture = '';
                var purchaseUom = '';
                var gst = '';
                var discountAmt = '';
                var productType = '';
                var billable = '';
                var scheduleType = '';

                if (rowArray.ItemCode) {
                    itemCode = rowArray.ItemCode;
                }
                if (rowArray.ItemName) {
                    itemName = rowArray.ItemName;
                }
                if (rowArray.ItemCategory.CategoryName) {
                    category = rowArray.ItemCategory.CategoryName;
                }
                if (rowArray.ItemSubCategory.SubCategoryName) {
                    subCate = rowArray.ItemSubCategory.SubCategoryName;
                }
                if (rowArray.GenericName) {
                    genericeName = rowArray.GenericName;
                }
                if (rowArray.ManufacturerName) {
                    manufacture = rowArray.ManufacturerName;
                }
                if (rowArray.PurchaseUom.UomName) {
                    purchaseUom = rowArray.PurchaseUom.UomName;
                }
                if (rowArray.GstMaster) {
                    if (rowArray.GstMaster.GstName) {
                        gst = rowArray.GstMaster.GstName;
                    }
                }
                if (rowArray.Discount) {
                    discountAmt = rowArray.Discount;
                }

                if (rowArray.ProductType.ProductTypeName) {
                    productType = rowArray.ProductType.ProductTypeName;
                }
                if (rowArray.IsBillable) {
                    billable = rowArray.IsBillable;
                }
                if (rowArray.ScheduleType) {
                    if (rowArray.ScheduleType.Description) {
                        scheduleType = rowArray.ScheduleType.Description;
                    }
                }



                csvContent += itemCode + ',' + itemName + ',' + category + ',' + subCate + ',' + genericeName + ',' + manufacture + ',' + purchaseUom + ',' + gst + ',' + discountAmt + ',' + productType + ',' + billable + ',' + scheduleType + "\n";
            });
            var encodedUri = encodeURIComponent(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'itemmaster-report.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            var inputData = {
                Params: [

                    {
                        Key: 5,
                        Value: $scope.currentfilter.ProductTypeId
                    },
                    {
                        Key: 8,
                        Value: $scope.currentfilter.GenericId
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.ActiveStatusId
                    },
                    {
                        Key: 25,
                        Value: $scope.currentfilter.ManufacturerId
                    },
                    {
                        Key: 27,
                        Value: $scope.currentfilter.StoreMasterId
                    },
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };
            var options = {
                action: "pharmacy/itemmaster/GetItemMasters",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
                if(res.Data.length>0)
                { 
                        if ($scope.currentfilter.ProductTypeId > 0) {
                $scope.ProductType = res.Data[0].ProductType.ProductTypeName;
            } else {
                $scope.ProductType = '';
            }
            if ($scope.currentfilter.GenericId > 0) {
                $scope.GenericName = res.Data[0].GenericName;
            } else {
                $scope.GenericName = '';
            }
            if ($scope.currentfilter.ActiveStatusId > 0) {
                $scope.ActiveStatus = res.Data[0].ActiveStatus.Description;
            } else {
                $scope.ActiveStatus = '';
            }
            if ($scope.currentfilter.ManufacturerId > 0) {
                $scope.ManufacturerName = res.Data[0].ManufacturerName;
            } else {
                $scope.ManufacturerName = '';
            }}
           
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var inputData = {
                Params: [

                    {
                        Key: 5,
                        Value: $scope.currentfilter.ProductTypeId
                    },
                    {
                        Key: 8,
                        Value: $scope.currentfilter.GenericId
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.ActiveStatusId
                    },
                    {
                        Key: 25,
                        Value: $scope.currentfilter.ManufacturerId
                    },
                    {
                        Key: 27,
                        Value: $scope.currentfilter.StoreMasterId
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/itemmaster/GetItemMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.onmanufacenter = function (data) {
            if (data == undefined) {
                $scope.currentfilter.ManufacturerId = -1
                // $scope.getList();
            }
        };
        $scope.ongenericenter = function (data) {
            if (data == undefined) {
                $scope.currentfilter.GenericId = -1
                // $scope.getList();
            }
        };
        $scope.backtoReport = function () {
            if ($scope.Context == 'pharmacyreports') {
                $state.go('app.pharmacytabreport.masterreport');
            } if ($scope.Context == 'storereports') {
                $state.go('app.storereporttab.masterreport');
            }

        };

        $scope.print = function () {
            var inputData = {
                Data: {
                    ProductType: $scope.ProductType,
                    GenericName: $scope.GenericName,
                    ManufacturerName: $scope.ManufacturerName,
                    ActiveStatus: $scope.ActiveStatus
                },
                Params: [

                    {
                        Key: 5,
                        Value: $scope.currentfilter.ProductTypeId
                    },
                    {
                        Key: 8,
                        Value: $scope.currentfilter.GenericId
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.ActiveStatusId
                    },
                    {
                        Key: 25,
                        Value: $scope.currentfilter.ManufacturerId
                    },
                    {
                        Key: 27,
                        Value: $scope.currentfilter.StoreMasterId
                    },
                ],
            };
            var options = {
                action: 'pharmacy/itemmaster/PrintItemMasterReport',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        vm.manufacturercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'Manufacturer Code',
                field: 'VendorCode',
                datatype: 'string',
                headercls: 'td-vendorcode',
                fieldcls: 'td-vendorcode'
            },
            {
                header: 'Manufacturer Name',
                field: 'VendorName',
                datatype: 'string',
                headercls: 'td-vendorname',
                fieldcls: 'td-vendorname'
            }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/vendormaster/GetVendorMasters',
            formatdisplay: formatselectedvendor,
            presearch: presearchvendor,
            postsearch: postsearchvendor
        };

        function formatselectedvendor() {
            var selectedItem = vm.manufacturercontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.VendorName + '(' + selectedItem.VendorCode + ')'].join('    ');
            } else if (vm.manufacturercontrolconfig.rowdata) {
                result = [vm.manufacturercontrolconfig.rowdata.VendorName, vm.manufacturercontrolconfig.rowdata.VendorCode].join(' ');
            }
            return result;
        }

        function presearchvendor() {
            var query = vm.manufacturercontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: 2
                }, {
                    Key: 4,
                    Value: 2
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };
            if (vm.manufacturercontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: $scope.item.ManufacturerId
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 2,
                    Value: query
                });
            }
            vm.manufacturercontrolconfig.searchparams = inputData;
        }

        function postsearchvendor() {
            for (var idx in vm.manufacturercontrolconfig.result) {
                var item = vm.manufacturercontrolconfig.result[idx];
                item.VendorCode = item.VendorCode;
                item.VendorName = item.VendorName;
            }
        }


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
                field: "ItemCategory.CategoryName",
                displayName: $translate.instant('reports.cat.lbl')

            },
            {
                field: "ItemSubCategory.SubCategoryName",
                displayName: $translate.instant('reports.subcat.lbl')
            },

            {
                field: "GenericName",
                displayName: $translate.instant('reports.generic.lbl')
            },
            {
                field: "ManufacturerName",
                displayName: $translate.instant('reports.manu.lbl')
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
                field: "Discount",
                displayName: $translate.instant('reports.disamt.lbl')
            },
            {
                field: "ProductType.ProductTypeName",
                displayName: $translate.instant('reports.product.lbl')
            },
            {
                field: "IsBillable",
                displayName: $translate.instant('reports.billable.lbl')
            },
            {
                field: "ScheduleType.Description",
                displayName: $translate.instant('reports.scheduletype.lbl')
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
                    $scope.currentfilter.StoreMaster = value[0].Text;
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
            }, {
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
            ]
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

    ItemMasterReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();