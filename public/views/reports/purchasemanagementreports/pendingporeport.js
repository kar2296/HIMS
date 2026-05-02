(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PendingPOReportController', PendingPOReportController);

    function PendingPOReportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            StoreMasterId: 0
        };
        $scope.CanShowPrint = false;
        $scope.lookup = {};
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }

        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["PO Number", "PO Date", "Supplier", "Total Amount",  "Delivery Date", "Item Code", "Item Name", "Quantity", "Free Qty","UCP","Sale Price"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var poNum = '';
                var poDate = '';
                var supplier = '';
                var totalAmt = '';
                var delevery = '';
                var itemcode = '';
                var itemname = '';
                var qty = '';
                var freeqty = '';
                var ucp = '';
                var saleprice = '';
        
                if (rowArray.PurchaseOrder.PoNumber) {
                    poNum = rowArray.PurchaseOrder.PoNumber;
                }
                if (rowArray.PurchaseOrder.PoDate) {
                    poDate = rowArray.PurchaseOrder.PoDate;
                }
                if (rowArray.PurchaseOrder.VendorName) {
                    supplier = rowArray.PurchaseOrder.VendorName;
                }
                if (rowArray.NetAmount) {
                    totalAmt = rowArray.NetAmount;
                }
                if (rowArray.PurchaseOrder.DeliveryDate) {
                    delevery = rowArray.PurchaseOrder.DeliveryDate;
                }
                if (rowArray.ItemCode) {
                    itemcode = rowArray.ItemCode;
                }
                if (rowArray.ItemName) {
                    itemname = rowArray.ItemName;
                }
                if (rowArray.PoQuantity) {
                    qty = rowArray.PoQuantity;
                }
                if (rowArray.FreeQty) {
                    freeqty = rowArray.FreeQty;
                }
                
                if (rowArray.UnitCostPrice) {
                    ucp = rowArray.UnitCostPrice;
                }
                if (rowArray.UomMrPrice) {
                    saleprice = rowArray.UomMrPrice;
                }
 
 
                csvContent += poNum + ',' + poDate + ',' + supplier + ',' + totalAmt + ',' + delevery + ',' + itemcode + ',' + itemname + ',' + qty + ',' + freeqty +',' + ucp + ',' + saleprice + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'pendingpo-report.csv';
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
                    Key: 8,
                    Value: From
                },
                {
                    Key: 9,
                    Value: To
                },
                {
                    Key: 6,
                    Value: $scope.currentfilter.StoreMasterId
                },
                {
                    Key: 11,
                    Value: $scope.currentfilter.VendorMasterId
                },
                {
                    Key: 10,
                    Value: [2, 3]
                }
                ],
        
            };
            var options = {
                action: "pharmacy/purchaseorderdetail/GetPurchaseOrderDetails",
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
                    $scope.StoreName = item.RequestedStore.StoreName;
                } else {
                    $scope.StoreName = '';
                }
                if ($scope.currentfilter.VendorMasterId > 0) {
                    $scope.VendorName = item.VendorName;
                } else {
                    $scope.VendorName = '';
                }
                totalnetamount = totalnetamount + (item.NetAmount);
                vm.gridConfig.data.push(item);
            }
            if (vm.gridConfig.data.length > 0) {
                $scope.CanShowPrint = true;
            }
            $scope.TotalNetAmt = totalnetamount;
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
                    Key: 8,
                    Value: From
                },
                {
                    Key: 9,
                    Value: To
                },
                {
                    Key: 6,
                    Value: $scope.currentfilter.StoreMasterId
                },
                {
                    Key: 11,
                    Value: $scope.currentfilter.VendorMasterId
                },
                {
                    Key: 10,
                    Value: [2, 3]
                },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/purchaseorderdetail/GetPurchaseOrderDetails',
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
            if ($scope.Context == 'inventoryreport') {
                $state.go('app.financereporttab.inventoryreport');
            } if ($scope.Context == 'purchasestorereports') {
                $state.go('app.storereporttab.purchasemanagementreport');
            }

        };
        vm.vendorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [
                { header: 'Vendor Code', field: 'VendorCode', datatype: 'string', headercls: 'td-code', fieldcls: 'td-code' },
                { header: 'Vendor Name', field: 'VendorName', datatype: 'string', headercls: 'td-name', fieldcls: 'td-name' },
                { header: 'Vendor Contact', field: 'PhoneNumber', datatype: 'string', headercls: 'td-phoneno', fieldcls: 'td-phoneno' }
            ],
            searchparams: {},
            result: {},
            api: 'pharmacy/vendormaster/GetVendorMasters',
            formatdisplay: formatselectedvendor,
            presearch: presearchvendor,
            postsearch: postsearchvendor
        };

        function formatselectedvendor() {
            var selectedItem = vm.vendorcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                $scope.currentfilter.VendorMasterId = selectedItem.VendorMasterId;
                result = [selectedItem.VendorName + ' (' + selectedItem.VendorCode + ')'].join(' ');
            } else if (vm.vendorcontrolconfig.rowdata) {
                result = [vm.vendorcontrolconfig.rowdata.VendorName, vm.vendorcontrolconfig.rowdata.VendorCode].join(' ');
            }

            return result;

            if ($scope.currentfilter.VendorMasterId > 0) {
                $scope.getList();
            }
        }

        function presearchvendor() {
            var query = vm.vendorcontrolconfig.query;
            var inputData = {
                Params: [],
                PageContext: { PageSize: 25, PageNumber: 1 }
            };

            if (vm.vendorcontrolconfig.searchbyid === true) {
                inputData.Params.push({
                    Key: 0,
                    Value: query
                });
            } else if (query && query.length > 2) {
                inputData.Params.push({
                    Key: 2,
                    Value: query
                });
            }

            vm.vendorcontrolconfig.searchparams = inputData;
        }

        function postsearchvendor() {
            for (var idx in vm.vendorcontrolconfig.result) {
                var item = vm.vendorcontrolconfig.result[idx];
                item.VendorCode = item.VendorCode;
                item.VendorName = item.VendorName;
                item.PhoneNumber = item.PhoneNumber;
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
                    VendorName: $scope.VendorName
                },
                Params: [{
                    Key: 8,
                    Value: From
                },
                {
                    Key: 9,
                    Value: To
                },
                {
                    Key: 6,
                    Value: $scope.currentfilter.StoreMasterId
                },
                {
                    Key: 11,
                    Value: $scope.currentfilter.VendorMasterId
                },
                {
                    Key: 10,
                    Value: [2, 3]
                },
                ],
            };

            var options = {
                action: 'pharmacy/purchaseorderdetail/PrintPendingPOReport',
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
                field: "PurchaseOrder.PoNumber",
                displayName: $translate.instant('reports.ponum.lbl')

            },
            {
                field: "PurchaseOrder.PoDate",
                displayName: $translate.instant('reports.podate.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.PurchaseOrder.PoDate | date : 'dd-MM-yyyy'}} </span></div>"
            },
            {
                field: "PurchaseOrder.VendorName",
                displayName: $translate.instant('reports.vendorname.lbl')
            },

            {
                field: "NetAmount",
                displayName: $translate.instant('reports.totalamt.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.NetAmount | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.NetAmount | displaycurrency}}&nbsp;</span>' + '</div>'
            },
            {
                field: "PurchaseOrder.DeliveryDate",
                displayName: $translate.instant('reports.deldate.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.PurchaseOrder.DeliveryDate | date : 'dd-MM-yyyy'}} </span></div>"
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
                field: "PoQuantity",
                displayName: $translate.instant('reports.qty.lbl')
            },
            {
                field: "FreeQty",
                displayName: $translate.instant('reports.freeqty.lbl')
            },
            {
                field: "UnitCostPrice",
                displayName: $translate.instant('reports.ucp.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.UnitCostPrice | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.UnitCostPrice | displaycurrency}}&nbsp;</span>' + '</div>'
            },
            {
                field: "UomMrPrice",
                displayName: $translate.instant('reports.saleprice.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.UomMrPrice | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.UomMrPrice | displaycurrency}}&nbsp;</span>' + '</div>'
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

    PendingPOReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();