(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('stockstatusproductsummarygeneralreportController', stockstatusproductsummarygeneralreportController);

    function stockstatusproductsummarygeneralreportController($scope, $stateParams, $state, $translate, $filter, utl) {
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
            const JsonFields = ["Product Name", "Total UCP", "Total MRP", "Profit"]
            let csvContent = JsonFields.join(",") + "\n";


            var Stockstatus = [];
            var totalFooterUcp = 0;
            var totalFooterMrp = 0;
            var totalFooterProfit = 0;
            $scope.TotalFooterUcp = 0;
            $scope.TotalFooterMrp = 0;
            $scope.TotalFooterProfit = 0;
            var GroupedBatchData = _.groupBy(data.Data, 'ItemMaster.ProductTypeId')

            for (var prdtdx in GroupedBatchData) {
                var productgrouped = GroupedBatchData[prdtdx];
                var proddata = {
                    TotalUcp: 0,
                    TotalMrp: 0,
                    Profit: 0
                };
                for (var idx in productgrouped) {
                    var item = productgrouped[idx];
                    proddata.TotalUcp += parseFloat(item.Quantity) * parseFloat(item.Ucp);
                    proddata.TotalMrp += parseFloat(item.Quantity) * parseFloat(item.Mrp);
                    proddata.Profit = (proddata.TotalMrp) - (proddata.TotalUcp);
                    proddata.ProductTypeName = item.ItemMaster.ProductType.ProductTypeName;
                }
                totalFooterUcp = totalFooterUcp + (proddata.TotalUcp);
                totalFooterMrp = totalFooterMrp + (proddata.TotalMrp);
                totalFooterProfit = totalFooterProfit + (proddata.Profit);
                Stockstatus.push(proddata);
            }
            $scope.TotalFooterUcp = totalFooterUcp;
            $scope.TotalFooterMrp = totalFooterMrp;
            $scope.TotalFooterProfit = totalFooterProfit;


            Stockstatus.forEach(function (rowArray) {
                var productname =  ''; 
                var profit = '';
                var totalucpAvg = '';
                var totalmrpAvg = '';

                if (rowArray.ProductTypeName) {
                    productname = rowArray.ProductTypeName;
                }

               
                if (rowArray.TotalUcp) {
                    totalucpAvg = rowArray.TotalUcp;
                }
                if (rowArray.TotalMrp) {
                    totalmrpAvg = rowArray.TotalMrp;
                }
                     if (rowArray.Profit) {
                    profit = rowArray.Profit;
                }

                csvContent += productname + ',' + totalucpAvg + ',' + totalmrpAvg + ',' + profit  + "\n";
            });
            var encodedUri = encodeURI(csvContent);
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
            var totalFooterUcp = 0;
            var totalFooterMrp = 0;
            var totalFooterProfit = 0;
            $scope.TotalFooterUcp = 0;
            $scope.TotalFooterMrp = 0;
            $scope.TotalFooterProfit = 0;
            var GroupedBatchData = _.groupBy(res.Data, 'ItemMaster.ProductTypeId')
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
            for (var prdtdx in GroupedBatchData) {
                var productgrouped = GroupedBatchData[prdtdx];
                var proddata = {
                    TotalUcp: 0,
                    TotalMrp: 0,
                    Profit: 0
                };
                for (var idx in productgrouped) {
                    var item = productgrouped[idx];
                    proddata.TotalUcp += parseFloat(item.Quantity) * parseFloat(item.Ucp);
                    proddata.TotalMrp += parseFloat(item.Quantity) * parseFloat(item.Mrp);
                    proddata.Profit = (proddata.TotalMrp) - (proddata.TotalUcp);
                    proddata.ProductTypeName = item.ItemMaster.ProductType.ProductTypeName;
                }
                totalFooterUcp = totalFooterUcp + (proddata.TotalUcp);
                totalFooterMrp = totalFooterMrp + (proddata.TotalMrp);
                totalFooterProfit = totalFooterProfit + (proddata.Profit);
                vm.gridConfig.data.push(proddata);
            }
            $scope.TotalFooterUcp = totalFooterUcp;
            $scope.TotalFooterMrp = totalFooterMrp;
            $scope.TotalFooterProfit = totalFooterProfit;
            vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
        };

        $scope.getList = function () {
            
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            // var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [

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
            $state.go('app.storereporttab.generalstorereport');
        };
        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            // var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    StoreName: $scope.StoreName,
                    ProductType: $scope.ProductType
                },
                Params: [

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
            };

            var options = {
                action: 'pharmacy/stockserialitem/PrintStockStatusProductSummaryReport',
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
                field: "ProductTypeName",
                displayName: $translate.instant('reports.product.lbl')
            },
            {
                field: "TotalUcp",
                displayName: $translate.instant('reports.totalucps.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TotalUcp | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalUcp | displaycurrency}}&nbsp;</span>' + '</div>',
            },
            {
                field: "TotalMrp",
                displayName: $translate.instant('reports.totalmrps.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TotalMrp | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalMrp | displaycurrency}}&nbsp;</span>' + '</div>',
            },
            {
                field: "Profit",
                displayName: $translate.instant('reports.profit.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.Profit | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.Profit | displaycurrency}}&nbsp;</span>' + '</div>',
            }],
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

    stockstatusproductsummarygeneralreportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();