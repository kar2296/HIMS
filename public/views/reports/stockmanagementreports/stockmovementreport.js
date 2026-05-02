(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('StockMovementReportController', StockMovementReportController);

    function StockMovementReportController($scope, $stateParams, $state, $translate, $filter, utl) {
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

        $scope.CanShowPrint = false;

        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Transaction Date", "Type", "From Store", "Transaction Number", "Item Name", "To Store", "Created By", "Before Qty", "In Qty", "Out Qty", "Total Qty"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var transition = '';
                var type = '';
                var fromStore = '';
                var transitionNum = '';
                var itemName = '';
                var toStore = '';
                var createdBy = '';
                var beforeQty = '';
                var inQty = '';
                var outQty = '';
                var totalQty = '';

                if (rowArray.TransactionDate) {
                    // transition = rowArray.TransactionDate;
                    transition = utl.Formatter.getDateTimeString(rowArray.TransactionDate);
                }
                if (rowArray.TransactionType) {
                    if (rowArray.TransactionType.Description) {
                        type = rowArray.TransactionType.Description;
                    }
                }
                if (rowArray.StoreMaster.StoreName) {
                    fromStore = rowArray.StoreMaster.StoreName;
                }
                if (rowArray.TransactionNumber) {
                    transitionNum = rowArray.TransactionNumber;
                }
                if (rowArray.ItemMaster.ItemName) {
                    itemName = rowArray.ItemMaster.ItemName;
                }
                if (rowArray.ToStoreMaster) {
                    if (rowArray.ToStoreMaster.StoreName) {
                        toStore = rowArray.ToStoreMaster.StoreName;
                    }
                }
                if (rowArray.CreatedUser.Title) {
                    if (rowArray.CreatedUser.Title.Description) {
                        createdBy = rowArray.CreatedUser.Title.Description;
                    }
                }
                if (rowArray.CreatedUser.FirstName) {
                    createdBy += ' ' + rowArray.CreatedUser.FirstName;
                }
                if (rowArray.CreatedUser.LastName) {
                    createdBy += ' ' + rowArray.CreatedUser.LastName;
                }
                if (rowArray.TotalBFQty) {
                    beforeQty = rowArray.TotalBFQty;
                }
                if (rowArray.InQty) {
                    inQty = rowArray.InQty;
                }
                if (rowArray.OutQty) {
                    outQty = rowArray.OutQty;
                }
                if (rowArray.TotalAFQty) {
                    totalQty = rowArray.TotalAFQty;
                }

                csvContent += transition + ',' + type + ',' + fromStore + ',' + transitionNum + ',' + itemName + ',' + toStore + ',' + createdBy + ',' + beforeQty + ',' + inQty + ',' + outQty + ',' + totalQty + "\n";
            });
            var encodedUri = encodeURIComponent(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'stockmovement-report.csv';
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
                    Key: 5,
                    Value: From
                },
                {
                    Key: 6,
                    Value: To
                },
                {
                    Key: 1,
                    Value: $scope.currentfilter.ItemMasterId
                },
                {
                    Key: 2,
                    Value: $scope.currentfilter.StoreMasterId
                },
                {
                    Key: 7,
                    Value: $scope.currentfilter.TransactionTypeId
                }
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };
            var options = {
                action: "pharmacy/StockMovement/GetStockMovements",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            if (res.Data.length > 0) {
                if ($scope.currentfilter.ItemMasterId > 0) {
                    $scope.ItemName = res.Data[0].ItemMaster.ItemName;
                }
                if ($scope.currentfilter.StoreMasterId > 0) {
                    $scope.StoreName = res.Data[0].StoreMaster.StoreName;
                }
                if ($scope.currentfilter.TransactionTypeId > 0) {
                    $scope.TransactionType = res.Data[0].TransactionType.Description;
                }
            }
            if (vm.gridConfig.data.length > 0) {
                $scope.CanShowPrint = true;
            }
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
                $scope.CanShowPrint = false;
                return;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
                        Key: 5,
                        Value: From
                    },
                    {
                        Key: 6,
                        Value: To
                    },
                    {
                        Key: 1,
                        Value: $scope.currentfilter.ItemMasterId
                    },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.StoreMasterId
                    },
                    {
                        Key: 7,
                        Value: $scope.currentfilter.TransactionTypeId
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/StockMovement/GetStockMovements',
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
            if ($scope.Context == 'pharmacyreports') {
                $state.go('app.pharmacytabreport.stockmanagementreport');
            } if ($scope.Context == 'inventoryreport') {
                $state.go('app.financereporttab.inventoryreport');
            } if ($scope.Context == 'storereports') {
                $state.go('app.storereporttab.stackmanagementreport');
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
                    TransactionType: $scope.TransactionType,
                },
                Params: [{
                    Key: 5,
                    Value: From
                },
                {
                    Key: 6,
                    Value: To
                },
                {
                    Key: 1,
                    Value: $scope.currentfilter.ItemMasterId
                },
                {
                    Key: 2,
                    Value: $scope.currentfilter.StoreMasterId
                },
                {
                    Key: 7,
                    Value: $scope.currentfilter.TransactionTypeId
                },
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'pharmacy/StockMovement/PrintStockMovementReport',
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
                field: "TransactionDate",
                displayName: $translate.instant('reports.trandate.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.TransactionDate | date : 'dd-MM-yyyy'}} </span></div>"
            },
            {
                field: "TransactionType.Description",
                displayName: $translate.instant('reports.type.lbl')
            },
            {
                field: "StoreMaster.StoreName",
                displayName: $translate.instant('reports.fromstore.lbl')
            },
            {
                field: "TransactionNumber",
                displayName: $translate.instant('reports.trannum.lbl')
            },
            {
                field: "ItemMaster.ItemName",
                displayName: $translate.instant('reports.itemname.lbl')
            },
            {
                field: "ToStoreMaster.StoreName",
                displayName: $translate.instant('reports.tostore.lbl')
            },
            {
                field: "CreatedUser",
                displayName: $translate.instant('reports.createdby.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                <span ng-if='entity.Title && entity.CreatedUser.Title.Description'>{{entity.CreatedUser.Title.Description}}&nbsp;</span>\
                <span>{{entity.CreatedUser.FirstName}}</span>&nbsp;<span>{{entity.CreatedUser.LastName}}</span>\
                 </div>"
            },
            {
                field: "TotalBFQty",
                displayName: $translate.instant('reports.befqty.lbl')
            },
            {
                field: "InQty",
                displayName: $translate.instant('reports.inqty.lbl')
            },
            {
                field: "OutQty",
                displayName: $translate.instant('reports.outqty.lbl')
            },
            {
                field: "TotalAFQty",
                displayName: $translate.instant('reports.totalqty.lbl')
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
            }, {
                "Key": "TransactionType"
            }]
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

    StockMovementReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();