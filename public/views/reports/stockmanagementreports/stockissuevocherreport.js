(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('StockIssueVocherReportController', StockIssueVocherReportController);

    function StockIssueVocherReportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            StoreMasterId: 0
        };
        $scope.lookup = {};

        $scope.CanShowPrint = false;
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }


        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Transfer Number", "Transfer Date", "Item Name", "Batch Id", "Quantity", "From Store", "Total Amount", "To Store", "Transfered By"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var transferNum = '';
                var transferDate = '';
                var itemName = '';
                var batchId = '';
                var qty = '';
                var fromStore = '';
                var totalAMt = '';
                var tostore = '';
                var transferBy = '';

                if (rowArray.StockTransfer.TransferNumber) {
                    transferNum = rowArray.StockTransfer.TransferNumber;
                }
                if (rowArray.StockTransfer.TransferDate) {
                    // transferDate = rowArray.StockTransfer.TransferDate;
                    transferDate = utl.Formatter.getDateTimeString(rowArray.StockTransfer.TransferDate);
                }
                if (rowArray.ItemName) {
                    itemName = rowArray.ItemName;
                }
                if (rowArray.BatchId) {
                    batchId = rowArray.BatchId;
                }
                if (rowArray.TransferedQuantity) {
                    qty = rowArray.TransferedQuantity;
                }
                if (rowArray.StockTransfer.StoreName) {
                    fromStore = rowArray.StockTransfer.StoreName;
                }
                if (rowArray.NetAmount) {
                    totalAMt = rowArray.NetAmount;
                }
                if (rowArray.StockTransfer.ToStoreName) {
                    tostore = rowArray.StockTransfer.ToStoreName;
                }
                if (rowArray.StockTransfer.TranferedUser) {
                    if (rowArray.StockTransfer.TranferedUser.Title) {
                        if (rowArray.StockTransfer.TranferedUser.Title.Description) {
                            transferBy = rowArray.StockTransfer.TranferedUser.Title.Description;
                        }
                    }
                    if (rowArray.StockTransfer.TranferedUser.FirstName) {
                        transferBy += ' ' + rowArray.StockTransfer.TranferedUser.FirstName;
                    }
                    if (rowArray.StockTransfer.TranferedUser.LastName) {
                        transferBy += ' ' + rowArray.StockTransfer.TranferedUser.LastName;
                    }
                }
                csvContent += transferNum + ',' + transferDate + ',' + itemName + ',' + batchId + ',' + qty + ',' + fromStore + ',' + totalAMt + ',' + tostore + ',' + transferBy + "\n";
            });
            var encodedUri = encodeURIComponent(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'stockissuevocher-report.csv';
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
                Params: [
                    {
                        Key: 4,
                        Value: From
                    },
                    {
                        Key: 5,
                        Value: To
                    },
                    {
                        Key: 6,
                        Value: $scope.currentfilter.StoreMasterId
                    },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.ItemMasterId
                    }
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };
            var options = {
                action: "pharmacy/StockTransferDetail/GetStockTransferDetails",
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
                if ($scope.currentfilter.StoreMasterId > 0) {
                    $scope.StoreName = item.StockTransfer.StoreName;
                } else {
                    $scope.StoreName = '';
                }
                if ($scope.currentfilter.ItemMasterId > 0) {
                    $scope.ItemName = item.ItemName;
                } else {
                    $scope.ItemName = '';
                }
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
            var startTime = new Date($scope.currentfilter.FromDate);
            var endTime = new Date($scope.currentfilter.ToDate);
            var difference = endTime.getTime() - startTime.getTime();
            var resultInDays = Math.round(difference / (1000 * 60 * 60 * 24)); // Calculate difference in days
            if (!(resultInDays >= 0 && resultInDays <= 31)) { // Check if difference is less than 15 days
                utl.Alert.showSuccessMsg("From and To Date Difference should be less than one month...");
                $scope.currentfilter.FromDate = new Date();
                $scope.currentfilter.ToDate = new Date();
                return false;
            }
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
                Params: [
                    {
                        Key: 4,
                        Value: From
                    },
                    {
                        Key: 5,
                        Value: To
                    },
                    {
                        Key: 6,
                        Value: $scope.currentfilter.StoreMasterId
                    },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.ItemMasterId
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/StockTransferDetail/GetStockTransferDetails',
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
            } if ($scope.Context == 'purchasestorereports') {
                $state.go('app.storereporttab.purchasemanagementreport');
            }

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

        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    StoreName: $scope.StoreName,
                    ItemName: $scope.ItemName,
                    StoreMasterId: $scope.currentfilter.StoreMasterId,
                },
                Params: [
                    {
                        Key: 4,
                        Value: From
                    },
                    {
                        Key: 5,
                        Value: To
                    },
                    {
                        Key: 6,
                        Value: $scope.currentfilter.StoreMasterId
                    },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.ItemMasterId
                    },
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'pharmacy/StockTransferDetail/PrintStockIssueVocherReport',
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
                field: "StockTransfer.TransferNumber",
                displayName: $translate.instant('reports.tranfnum.lbl')
            },
            {
                field: "StockTransfer.TransferDate",
                displayName: $translate.instant('reports.tranfdate.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.StockTransfer.TransferDate | date : 'dd-MM-yyyy'}} </span></div>"
            },
            {
                field: "ItemName",
                displayName: $translate.instant('reports.itemname.lbl')
            },
            {
                field: "BatchId",
                displayName: $translate.instant('reports.batchid.lbl')
            },
            // {
            //     field: "QuantityBeforeTransfer",
            //     displayName: $translate.instant('reports.befqty.lbl')  
            // },
            {
                field: "TransferedQuantity",
                displayName: $translate.instant('reports.qty.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TransferedQuantity | displaycurrency}}</span>" + "</div>"

            },
            {
                field: "StockTransfer.StoreName",
                displayName: $translate.instant('reports.fromstore.lbl')
            },
            {
                field: "NetAmount",
                displayName: $translate.instant('reports.totalamt.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.NetAmount | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.NetAmount | displaycurrency}}&nbsp;</span>' + '</div>'
            },
            {
                field: "StockTransfer.ToStoreName",
                displayName: $translate.instant('reports.tostore.lbl')
            },
            {
                field: "FirstName",
                displayName: $translate.instant('reports.transby.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                <span ng-if='entity.Title && entity.StockTransfer.TranferedUser.Title.Description'>{{entity.StockTransfer.TranferedUser.Title.Description}}&nbsp;</span>\
                <span>{{entity.StockTransfer.TranferedUser.FirstName}}</span>&nbsp;<span>{{entity.StockTransfer.TranferedUser.LastName}}</span>\
                 </div>"
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
                "Key": "GrnStatus",
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

    StockIssueVocherReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();