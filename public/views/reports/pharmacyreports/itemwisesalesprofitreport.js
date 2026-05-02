(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('itemwisesalesprofitreportController', itemwisesalesprofitreportController);

    function itemwisesalesprofitreportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
            // UserId: utl.Session.getCurrentUserId(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            StoreMasterId: 0,
            ProductTypeId: -1
        };
        $scope.CanShowPrint = false;
        $scope.lookup = {};
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }



        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Item Name", "Product Type Name", "UCP", "MRP", "Sale Qty", "Total Sale Value", "Total Purchase Value", "Total Profit"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var itemName = '';
                var product = '';
                var ucp = '';
                var mrp = '';
                var saleQty = '';
                var totalsale = '';
                var totalPurchase = '';
                var totalProfit = '';

                if (rowArray.ItemMaster.ItemName) {
                    itemName = rowArray.ItemMaster.ItemName;
                }
                if (rowArray.ItemMaster.ProductType.ProductTypeName) {
                    product = rowArray.ItemMaster.ProductType.ProductTypeName;
                }
                if (rowArray.StockSerialItem.Ucp) {
                    ucp = rowArray.StockSerialItem.Ucp;
                }
                if (rowArray.Rate) {
                    mrp = rowArray.Rate;
                }
                if (rowArray.Quantity) {
                    saleQty = rowArray.Quantity;
                }
                if (rowArray.NetAmount) {
                    totalsale = rowArray.NetAmount;
                }
                if (rowArray.PurchaseValue) {
                    totalPurchase = rowArray.PurchaseValue;
                }
                if (rowArray.Profit) {
                    totalProfit = rowArray.Profit;
                }
                csvContent += itemName + ',' + product + ',' + ucp + ',' + mrp + ',' + saleQty + ',' + totalsale + ',' + totalPurchase + ',' + totalProfit + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'itemwisesalesprofit-report.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            if (!$scope.currentfilter.FromDate || $scope.currentfilter.FromDate == '' ||
                !$scope.currentfilter.ToDate || $scope.currentfilter.ToDate == '') {
                vm.gridConfig.data = [];
                $scope.TotalUCP = 0;
                $scope.TotalMRP = 0;
                $scope.TotalQty = 0;
                $scope.TotalSale = 0;
                $scope.TotalPurchase = 0;
                $scope.TotalProfit = 0;
                $scope.CanShowPrint = false;
                return;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
                        Key: 6,
                        Value: From
                    },
                    {
                        Key: 7,
                        Value: To
                    },
                    {
                        Key: 33,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 14,
                        Value: $scope.currentfilter.StoreMasterId
                    },
                    {
                        Key: 42,
                        Value: $scope.currentfilter.ProductTypeId
                    },
                    {
                        Key: 36,
                        Value: true
                    },
                    {
                        Key: 4,
                        Value: 3
                    }
                ],

            };
            var options = {
                action: "billing/PatientBillDetails/GetPatientBillDetailsforStockserialItem",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            var totalucp = 0;
            var totalmrp = 0;
            var totalqty = 0;
            var totalsale = 0;
            var totalpurchase = 0;
            var totalprofit = 0;
            for (var idx in res.Data) {
                var item = res.Data[idx];
                if ($scope.currentfilter.ProductTypeId > 0) {
                    $scope.ProductType = res.Data[0].ItemMaster.ProductType.ProductTypeName;
                } else {
                    $scope.ProductType = '';
                }

                if ($scope.currentfilter.StoreMasterId > 0) {
                    $scope.StoreName = res.Data[0].StoreMaster.StoreName;
                } else {
                    $scope.StoreName = '';
                }
                item.PurchaseValue = parseFloat(item.StockSerialItem.Ucp) * parseInt(item.Quantity);
                item.Profit = parseFloat(item.NetAmount) - parseFloat(item.PurchaseValue);


                totalucp = totalucp + (item.StockSerialItem.Ucp);
                totalmrp = totalmrp + (item.Rate);
                totalqty = totalqty + (item.Quantity);
                totalsale = totalsale + (item.NetAmount);
                totalpurchase = totalpurchase + (item.PurchaseValue);
                totalprofit = totalprofit + (item.Profit);
                vm.gridConfig.data.push(item);
            }
            if (vm.gridConfig.data.length > 0) {
                $scope.CanShowPrint = true;
            }
            $scope.TotalUCP = totalucp;
            $scope.TotalMRP = totalmrp;
            $scope.TotalQty = totalqty;
            $scope.TotalSale = totalsale;
            $scope.TotalPurchase = totalpurchase;
            $scope.TotalProfit = totalprofit;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
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
                $scope.TotalUCP = 0;
                $scope.TotalMRP = 0;
                $scope.TotalQty = 0;
                $scope.TotalSale = 0;
                $scope.TotalPurchase = 0;
                $scope.TotalProfit = 0;
                $scope.CanShowPrint = false;
                return;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
                        Key: 6,
                        Value: From
                    },
                    {
                        Key: 7,
                        Value: To
                    },
                    {
                        Key: 33,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 14,
                        Value: $scope.currentfilter.StoreMasterId
                    },
                    {
                        Key: 42,
                        Value: $scope.currentfilter.ProductTypeId
                    },
                    {
                        Key: 36,
                        Value: true
                    },
                    {
                        Key: 4,
                        Value: 3
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'billing/PatientBillDetails/GetPatientBillDetailsforStockserialItem',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.currentfilter.CreatedBy = -1
                $scope.getList();
            }
        };
        $scope.backtoReport = function () {

            $state.go('app.financereporttab.pharmacyreport')
            // if ($scope.Context == 'invoicecollectionreport') {
            //     $state.go('app.pharmacytabreport.invoicecollectionreport');
            // } if ($scope.Context == 'pharmacyreport') {
            //     $state.go('app.financereporttab.pharmacyreport');
            // }

        };

        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityName: $scope.currentfilter.FacilityName,
                    StoreName: $scope.StoreName,
                    ProductType: $scope.ProductType,
                },
                Params: [{
                    Key: 6,
                    Value: From
                },
                {
                    Key: 7,
                    Value: To
                },
                {
                    Key: 33,
                    Value: $scope.currentfilter.FacilityId
                },
                {
                    Key: 14,
                    Value: $scope.currentfilter.StoreMasterId
                },
                {
                    Key: 42,
                    Value: $scope.currentfilter.ProductTypeId
                },
                {
                    Key: 36,
                    Value: true
                },
                {
                    Key: 4,
                    Value: 3
                },
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };
            var options = {
                action: 'billing/PatientBillDetails/PrintItemwisesalesprofit',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };


        vm.usercontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                header: 'User Id',
                field: 'UserId',
                datatype: 'string',
                headercls: 'td-code',
                fieldcls: 'td-code'
            },
            {
                header: 'User Name',
                field: 'UserName',
                datatype: 'string',
                headercls: 'td-name',
                fieldcls: 'td-name'
            }
            ],
            searchparams: {},
            result: {},
            api: 'SystemSettings/User/GetUsers',
            formatdisplay: formatselecteduser,
            presearch: presearchuser,
            postsearch: postsearchuser
        };

        function formatselecteduser() {
            var selectedItem = vm.usercontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.UserName].join('  ');
            } else if (vm.usercontrolconfig.rowdata) {
                result = [vm.usercontrolconfig.rowdata.UserId, vm.usercontrolconfig.rowdata.UserName].join(' ');
            }

            return result;
        }

        function presearchuser() {
            var query = vm.usercontrolconfig.query;
            var inputData = {
                Params: [{
                    Key: 2,
                    Value: $scope.currentfilter.FacilityId
                }],
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
            };

            if (vm.usercontrolconfig.searchbyid == true) {
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

            vm.usercontrolconfig.searchparams = inputData;
        }

        function postsearchuser() {
            for (var idx in vm.usercontrolconfig.result) {
                var item = vm.usercontrolconfig.result[idx];
                item.UserId = item.Id;
                item.UserName = item.Title.Description + ' ' + item.FirstName;
            }
        }


        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "idx", displayName: $translate.instant('S.No'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}} </span> </div>"
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
                field: "StockSerialItem.Ucp",
                displayName: $translate.instant('reports.ucp.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.StockSerialItem.Ucp | displaycurrency}}</span>" + "</div>"

            },
            {
                field: "Rate",
                displayName: $translate.instant('reports.mrp.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.Rate | displaycurrency}}</span>" + "</div>"
            },
            {
                field: "Quantity",
                displayName: $translate.instant('reports.saleqty.lbl')
            },
            {
                field: "NetAmount",
                displayName: $translate.instant('reports.totalsale.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.NetAmount| displaycurrency}}</span>" + "</div>"
            },
            {
                field: "PurchaseValue",
                displayName: $translate.instant('reports.totalpurchase.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.PurchaseValue | displaycurrency}}</span>" + "</div>"
            },
            {
                field: "Profit",
                displayName: $translate.instant('reports.totalprofit.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.Profit | displaycurrency}}</span>" + "</div>"
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

    itemwisesalesprofitreportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();