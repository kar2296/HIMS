(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('stockadjustmentgeneralreportController', stockadjustmentgeneralreportController);

    function stockadjustmentgeneralreportController($scope, $stateParams, $state, $translate, $filter, utl) {
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
            const JsonFields = ["Adjust Number", "Date", "Store Name", "Item Name", "Adjust Type", "Batch Id", "Expiry Date", "Quantity", "MRP", "Total Amount", "Adjust By", "Remark"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var number = '';
                var date = '';
                var storeName = '';
                var itemName = '';
                var adjType = '';
                var batchId = '';
                var expDate = '';
                var Quantity = '';
                var mrp = '';
                var totalAmt = '';
                var adjBy = '';
                var remark = '';

                if (rowArray.StockAdjustment.StockAdjustmentNumber) {
                    number = rowArray.StockAdjustment.StockAdjustmentNumber;
                }
                if (rowArray.StockAdjustment.AdjustedDate) {
                    date = rowArray.StockAdjustment.AdjustedDate;
                }
                if (rowArray.StoreMaster.StoreName) {
                    storeName = rowArray.StoreMaster.StoreName;
                }
                if (rowArray.ItemName) {
                    itemName = rowArray.ItemName;
                }
                if (rowArray.AdjustmentType.Description) {
                    adjType = rowArray.AdjustmentType.Description;
                }
                if (rowArray.BatchId) {
                    batchId = rowArray.BatchId;
                }
                if (rowArray.ExpiryDate) {
                    expDate = rowArray.ExpiryDate;
                }
                if (rowArray.QtyAdjusted) {
                    Quantity = rowArray.QtyAdjusted;
                }
                if (rowArray.MrPrice) {
                    mrp = rowArray.MrPrice;
                }
                if (rowArray.NetAmount) {
                    totalAmt = rowArray.NetAmount;
                }
                if (rowArray.StockAdjustment.AdjustedUser.Title.Description) {
                    adjBy = rowArray.StockAdjustment.AdjustedUser.Title.Description;
                }
                if (rowArray.StockAdjustment.AdjustedUser.FirstName) {
                    adjBy += ' ' + rowArray.StockAdjustment.AdjustedUser.FirstName;
                }
                if (rowArray.StockAdjustment.AdjustedUser.LastName) {
                    adjBy += ' ' + rowArray.StockAdjustment.AdjustedUser.LastName;
                }
                if (rowArray.Comments) {
                    remark = rowArray.Comments;
                }

                csvContent += number + ',' + date + ',' + storeName + ',' + itemName + ',' + adjType + ',' + batchId + ',' + expDate + ',' + Quantity + ',' + mrp + ',' + totalAmt + ',' + adjBy + ',' + remark + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'stockadjustment-report.csv';
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
                    Key: 6,
                    Value: From
                },
                {
                    Key: 7,
                    Value: To
                },
                {
                    Key: 9,
                    Value: $scope.currentfilter.StoreMasterId
                },
                {
                    Key: 10,
                    Value: $scope.currentfilter.AdjustmentTypeId
                },
                {
                    Key: 2,
                    Value: $scope.currentfilter.ItemMasterId
                },
                ],

            };
            var options = {
                action: "pharmacy/stockadjustmentdetail/GetStockAdjustmentDetails",
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
                Params: [{
                    Key: 6,
                    Value: From
                },
                {
                    Key: 7,
                    Value: To
                },
                {
                    Key: 9,
                    Value: $scope.currentfilter.StoreMasterId
                },
                {
                    Key: 10,
                    Value: $scope.currentfilter.AdjustmentTypeId
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
                action: 'pharmacy/stockadjustmentdetail/GetStockAdjustmentDetails',
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
            $state.go('app.storereporttab.generalstorereport');
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
                    Key: 6,
                    Value: From
                },
                {
                    Key: 7,
                    Value: To
                },
                {
                    Key: 9,
                    Value: $scope.currentfilter.StoreMasterId
                },
                {
                    Key: 10,
                    Value: $scope.currentfilter.AdjustmentTypeId
                },
                {
                    Key: 2,
                    Value: $scope.currentfilter.ItemMasterId
                },
                ],
            };

            var options = {
                action: 'pharmacy/stockadjustmentdetail/PrintStockAdjustmentReport',
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
                field: "StockAdjustment.StockAdjustmentNumber",
                displayName: $translate.instant('reports.adjustnum.lbl')
            },
            {
                field: "StockAdjustment.AdjustedDate",
                displayName: $translate.instant('reports.date.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.StockAdjustment.AdjustedDate | date : 'dd-MM-yyyy'}} </span></div>"
            },
            {
                field: "StoreMaster.StoreName",
                displayName: $translate.instant('reports.storename.lbl')
            },
            {
                field: "ItemName",
                displayName: $translate.instant('reports.itemname.lbl')
            },
            {
                field: "AdjustmentType.Description",
                displayName: $translate.instant('reports.adjusttype.lbl')
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
                field: "QtyAdjusted",
                displayName: $translate.instant('reports.qty.lbl')
            },
            // {
            //     field: "MrPrice",
            //     displayName: $translate.instant('reports.mrp.lbl'),
            //     cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.MrPrice | displaycurrency}}</span>" + "</div>"
            //     // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.MrPrice | displaycurrency}}&nbsp;</span>' + '</div>'
            // },
            {
                field: "NetAmount",
                displayName: $translate.instant('reports.totalamt.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.NetAmount | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.NetAmount | displaycurrency}}&nbsp;</span>' + '</div>'
            },
            {
                field: "Adjustby",
                displayName: $translate.instant('reports.adjustby.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                <span ng-if='entity.Title && entity.StockAdjustment.AdjustedUser.Title.Description'>{{entity.StockAdjustment.AdjustedUser.Title.Description}}&nbsp;</span>\
                <span>{{entity.StockAdjustment.AdjustedUser.FirstName}}</span>&nbsp;<span>{{entity.StockAdjustment.AdjustedUser.LastName}}</span>\
                 </div>"
            },
            {
                field: "Comments",
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
                    },
                    // {
                    //     Key: 8,
                    //     Value: 2
                    // }
                    ]
                }
            }, {
                "Key": "AdjustmentType"
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

    stockadjustmentgeneralreportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();