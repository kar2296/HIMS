(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('stockconsumptionreportController', stockconsumptionreportController);

    function stockconsumptionreportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            StoreMasterId: 0
        };
        $scope.CanShowPrint = false;
        $scope.lookup = {};
        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Consumption Number", "Date", "Store Name", "Item Code", "Item Name", "Batch Id", "Expiry Date", "Quantity", "MRP", "Total Amount", "Remark"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var number = '';
                var date = '';
                var storeName = '';
                var itemcode = '';
                var itemName = '';
                var batchId = '';
                var expDate = '';
                var Quantity = '';
                var mrp = '';
                var totalAmt = '';
                var adjBy = '';
                var remark = '';
                if (rowArray.StockConsumption) {
                    if (rowArray.StockConsumption.StockConsumptionNumber) {
                        number = rowArray.StockConsumption.StockConsumptionNumber;
                    }
                    if (rowArray.StockConsumption.ConsumptionDate) {
                        date = rowArray.StockConsumption.ConsumptionDate;
                    }
                }
                if (rowArray.ConsumedStore.StoreName) {
                    storeName = rowArray.ConsumedStore.StoreName;
                }
                if (rowArray.ItemCode) {
                    itemcode = rowArray.ItemCode;
                }
                if (rowArray.ItemName) {
                    itemName = rowArray.ItemName;
                }
                if (rowArray.BatchId) {
                    batchId = rowArray.BatchId;
                }
                if (rowArray.ExpiryDate) {
                    expDate = rowArray.ExpiryDate;
                }
                if (rowArray.QtyConsumed) {
                    Quantity = rowArray.QtyConsumed;
                }
                if (rowArray.MrPrice) {
                    mrp = rowArray.MrPrice;
                }
                if (rowArray.NetAmount) {
                    totalAmt = rowArray.NetAmount;
                }
                if (rowArray.StockConsumption) {
                    if (rowArray.StockConsumption.ConsumerComments) {
                        remark = rowArray.StockConsumption.ConsumerComments;
                    }
                }
                csvContent += number + ',' + date + ',' + storeName + ',' + itemcode + ',' + itemName + ',' + batchId + ',' + expDate + ',' + Quantity + ',' + mrp + ',' + totalAmt + ',' + remark + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'stockconsumption-report.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            if (!$scope.currentfilter.FromDate || $scope.currentfilter.FromDate == '' ||
                !$scope.currentfilter.ToDate || $scope.currentfilter.ToDate == '') {
                vm.gridConfig.data = [];
                $scope.TotalNetAmt = 0;
                $scope.CanShowPrint = false;
                return;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                    Key: 9,
                    Value: From
                },
                {
                    Key: 10,
                    Value: To
                },
                {
                    Key: 11,
                    Value: $scope.currentfilter.StoreMasterId
                },

                ],

            };
            var options = {
                action: 'pharmacy/stockconsumptiondetail/GetStockConsumptionDetails',
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };


        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            var totalnetamount = 0;
            for (var idx in res.Data) {
                var item = res.Data[idx];
                totalnetamount = totalnetamount + (item.NetAmount);
                vm.gridConfig.data.push(item);
            }

            if (vm.gridConfig.data.length > 0) {
                $scope.CanShowPrint = true;
            }
            $scope.TotalNetAmt = totalnetamount;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
                        Key: 9,
                        Value: From
                    },
                    {
                        Key: 10,
                        Value: To
                    },
                    {
                        Key: 11,
                        Value: $scope.currentfilter.StoreMasterId
                    },


                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/stockconsumptiondetail/GetStockConsumptionDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);

        };

        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.currentfilter.VendorMasterId = -1;
                // $scope.getList();
            }
        };
        $scope.backtoReport = function () {
            $state.go('app.storereporttab.stackmanagementreport')
        };

        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    StoreName: $scope.StoreName
                },
                Params: [{
                    Key: 9,
                    Value: From
                },
                {
                    Key: 10,
                    Value: To
                },
                {
                    Key: 11,
                    Value: $scope.currentfilter.StoreMasterId
                },
                ],
            };

            var options = {
                action: 'pharmacy/stockconsumptiondetail/PrintStockConsumptionReport',
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
                field: "StockConsumption.StockConsumptionNumber",
                displayName: $translate.instant('StockConsumptionNumber')
            },
            {
                field: "StockConsumption.ConsumptionDate",
                displayName: $translate.instant('reports.date.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.StockConsumption.ConsumptionDate | date : 'dd-MM-yyyy'}} </span></div>"
            },
            {
                field: "ConsumedStore.StoreName",
                displayName: $translate.instant('reports.storename.lbl')
            },
            {
                field: "ItemCode",
                displayName: $translate.instant('ItemCode')
            },
            {
                field: "ItemName",
                displayName: $translate.instant('reports.itemname.lbl')
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
                field: "QtyConsumed",
                displayName: $translate.instant('reports.qty.lbl')
            },
            {
                field: "MrPrice",
                displayName: $translate.instant('reports.mrp.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.MrPrice | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.MrPrice | displaycurrency}}&nbsp;</span>' + '</div>'
            },
            {
                field: "NetAmount",
                displayName: $translate.instant('reports.totalamt.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.NetAmount | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.NetAmount | displaycurrency}}&nbsp;</span>' + '</div>'
            },

            {
                field: "StockConsumption.ConsumerComments",
                displayName: $translate.instant('reports.remark.lbl')
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

    stockconsumptionreportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();