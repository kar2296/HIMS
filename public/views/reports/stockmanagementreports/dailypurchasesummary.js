(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('dailypurchasesummaryReportController', dailypurchasesummaryReportController);

    function dailypurchasesummaryReportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            StoreMasterId: 0,
        };
        $scope.CanShowPrint = false;
        $scope.lookup = {};

        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Item Name", "Manufacturer Name", "Quantity", "Free Qty", "Purchase Qty", "Purchase Price", "Gross Amt", "Net Amount"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {

                var item = '';
                var manufacture = '';
                var qty = '';
                var freeqty = '';
                var purchaseqty = '';
                var Price = '';
                var grossAmt = '';
                var netAmt = '';

                if (rowArray.ItemName) {
                    item = rowArray.ItemName;
                }
                if (rowArray.ManufacturerName) {
                    manufacture = rowArray.ManufacturerName;
                }
                if (rowArray.GrnQuantity) {
                    qty = rowArray.GrnQuantity;
                }
                if (rowArray.FreeQty) {
                    freeqty = rowArray.FreeQty;
                }
                if (rowArray.GrnQuantityAfterConversion) {
                    purchaseqty = rowArray.GrnQuantityAfterConversion;
                }
                if (rowArray.PurchasePrice) {
                    Price = rowArray.PurchasePrice;
                }
                if (rowArray.GrossAmount) {
                    grossAmt = rowArray.GrossAmount;
                }
                if (rowArray.NetAmount) {
                    netAmt = rowArray.NetAmount;
                }
                csvContent += item + ',' + manufacture + ',' + qty + ',' + freeqty + ',' + purchaseqty + ',' + Price + ',' + grossAmt + ',' + netAmt + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'dailypurchasesummary-reports.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            if (!$scope.currentfilter.FromDate || $scope.currentfilter.FromDate == '' ||
                !$scope.currentfilter.ToDate || $scope.currentfilter.ToDate == '') {
                vm.gridConfig.data = [];
                $scope.CanShowPrint = false;
                return;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                    Key: 7,
                    Value: From
                },
                {
                    Key: 8,
                    Value: To
                },
                {
                    Key: 9,
                    Value: $scope.currentfilter.StoreMasterId
                },
                {
                    Key: 2,
                    Value: $scope.currentfilter.ItemMasterId
                },
                {
                    Key: 14,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 11,
                    Value: [2, 3, 4]
                }
                ],

            };
            var options = {
                action: "pharmacy/grndetail/GetGrnDetails",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            var totalgrossamount = 0;
            var totalnetamount = 0;
            var GroupedBatchData = _.groupBy(res.Data, 'ItemMasterId');
            if ($scope.currentfilter.StoreMasterId > 0) {
                $scope.StoreName = res.Data[0].StoreMaster.StoreName;
            } else {
                $scope.StoreName = '';
            }
            if ($scope.currentfilter.ItemMasterId > 0) {
                $scope.ItemName = res.Data[0].ItemMaster.ItemName;
            } else {
                $scope.ItemName = '';
            }
            for (var jdx in GroupedBatchData) {
                var itemgrouped = GroupedBatchData[jdx];
                var itemData = {
                    ItemName: '',
                    ManufactureName: '',
                    GrnQuantity: 0,
                    FreeQty: 0,
                    GrnQuantityAfterConversion: 0,
                    PurchasePrice: 0,
                    GrossAmount: 0,
                    NetAmount: 0
                }
                for (var imdx in itemgrouped) {
                    var item = itemgrouped[imdx];
                    itemData.ItemName = item.ItemName;
                    itemData.ManufactureName = item.ItemMaster.ManufacturerName;
                    itemData.GrnQuantity += item.GrnQuantity;
                    itemData.FreeQty += item.FreeQty;
                    itemData.GrnQuantityAfterConversion += item.GrnQuantityAfterConversion;
                    itemData.PurchasePrice += item.PurchasePrice;
                    itemData.GrossAmount += item.GrossAmount;
                    itemData.NetAmount += item.NetAmount;
                }
                totalgrossamount = totalgrossamount + (itemData.GrossAmount);
                totalnetamount = totalnetamount + (itemData.NetAmount);
                vm.gridConfig.data.push(itemData);
            }

            // for (var idx in res.Data) {
            //     if ($scope.currentfilter.StoreMasterId > 0) {
            //         $scope.StoreName = res.Data[0].StoreMaster.StoreName;
            //     } else {
            //         $scope.StoreName = '';
            //     }
            //     if ($scope.currentfilter.ProductTypeId > 0) {
            //         $scope.ProductType = res.Data[0].ItemMaster.ProductType.ProductTypeName;
            //     } else {
            //         $scope.ProductType = '';
            //     }
            //     var item = res.Data[idx];
            //     totalgrossamount = totalgrossamount + (item.GrossAmount);
            //     totalnetamount = totalnetamount + (item.NetAmount);
            //     vm.gridConfig.data.push(item);
            // }

            if (vm.gridConfig.data.length > 0) {
                $scope.CanShowPrint = true;
            }
            $scope.TotalGrossAmt = totalgrossamount;
            $scope.TotalNetAmt = totalnetamount;

            // vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var startTime = new Date($scope.currentfilter.FromDate);
            var endTime = new Date($scope.currentfilter.ToDate);
            var difference = endTime.getTime() - startTime.getTime();
            var resultInDays = Math.round(difference / (1000 * 60 * 60 * 24)); // Calculate difference in days
            if (!(resultInDays >= 0 && resultInDays < 90)) { // Check if difference is less than 3 months
                utl.Alert.showSuccessMsg("From and To Date Difference should be less than three months...");
                $scope.currentfilter.FromDate = new Date();
                $scope.currentfilter.ToDate = new Date();
                return false;
            }
            if (!$scope.currentfilter.FromDate || $scope.currentfilter.FromDate == '' ||
                !$scope.currentfilter.ToDate || $scope.currentfilter.ToDate == '') {
                vm.gridConfig.data = [];
                $scope.CanShowPrint = false;
                return;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                    Key: 7,
                    Value: From
                },
                {
                    Key: 8,
                    Value: To
                },
                {
                    Key: 9,
                    Value: $scope.currentfilter.StoreMasterId
                },
                {
                    Key: 14,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 2,
                    Value: $scope.currentfilter.ItemMasterId
                },
                {
                    Key: 11,
                    Value: [2, 3, 4]
                },
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'pharmacy/grndetail/GetGrnDetails',
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
            if ($scope.Context == 'inventoryreport') {
                $state.go('app.financereporttab.inventoryreport');
            }
            if ($scope.Context == 'financedashboard') {
                $state.go('app.financedashboard');
            }

        };

        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    StoreName: $scope.StoreName,
                    ItemName: $scope.ItemName

                },
                Params: [{
                    Key: 7,
                    Value: From
                },
                {
                    Key: 8,
                    Value: To
                },
                {
                    Key: 9,
                    Value: $scope.currentfilter.StoreMasterId
                },
                {
                    Key: 2,
                    Value: $scope.currentfilter.ItemMasterId
                },
                {
                    Key: 14,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 11,
                    Value: [2, 3, 4]
                }],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'pharmacy/grndetail/PrintDailyPurchaseSummary',
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
                field: "idx",
                displayName: $translate.instant('S.No'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}} </span> </div>"
            },
            {
                field: "ItemName",
                displayName: $translate.instant('reports.itemname.lbl')
            },
            {
                field: "ManufacturerName",
                displayName: $translate.instant('reports.manu.lbl')
            },
            {
                field: "GrnQuantity",
                displayName: $translate.instant('reports.qty.lbl')
            },
            {
                field: "FreeQty",
                displayName: $translate.instant('reports.freeqty.lbl')
            },
            {
                field: "GrnQuantityAfterConversion",
                displayName: $translate.instant('reports.purchaseqty.lbl')
            },
            {
                field: "PurchasePrice",
                displayName: $translate.instant('reports.purchaseprice.lbl')
            },
            {
                field: "GrossAmount",
                displayName: $translate.instant('reports.grossamt.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.GrossAmount | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.GrossAmount | displaycurrency}}&nbsp;</span>' + '</div>'
            },
            {
                field: "NetAmount",
                displayName: $translate.instant('reports.netamt.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.NetAmount | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.NetAmount | displaycurrency}}&nbsp;</span>' + '</div>'
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

    dailypurchasesummaryReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();