(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('GrnReportByItemController', GrnReportByItemController);

    function GrnReportByItemController($scope, $stateParams, $state, $translate, $filter, utl) {
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
            const JsonFields = ["GRN Number", "GRN Date", "Supplier", "Invoice Date", "Invoice Number", "Item Name", "Quantity", "Free Qty", "Total Qty", "Con Qty", "GrnAfterCon Qty", "Purchase Uom", "Discount Amt", "GST", "Net Amount", "Sale Uom"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var grnNum = '';
                var grnDate = '';
                var supplier = '';
                var invoiceDate = '';
                var invoideNumber = '';
                var itemName = '';
                var Quantity = '';
                var freeQty = '';
                var TotalQuantity = '';
                var ConQty = '';
                var GrnQtyAfterCon = '';
                var purchaseuom = '';
                var discountAmt = '';
                var gst = '';
                var netAmt = '';
                var saleUom = '';

                if (rowArray.Grn.GrnNumber) {
                    grnNum = rowArray.Grn.GrnNumber;
                }
                if (rowArray.Grn.GrnDate) {
                    grnDate = rowArray.Grn.GrnDate;
                }

                if (rowArray.Grn.VendorName) {
                    supplier = rowArray.Grn.VendorName;
                }
                if (rowArray.Grn.InvoiceDate) {
                    invoiceDate = rowArray.Grn.InvoiceDate;
                }
                if (rowArray.Grn.InvoiceNumber) {
                    invoideNumber = rowArray.Grn.InvoiceNumber;
                }
                if (rowArray.ItemName) {
                    itemName = rowArray.ItemName;
                }
                if (rowArray.GrnQuantity) {
                    Quantity = rowArray.GrnQuantity;
                }
                if (rowArray.FreeQty) {
                    freeQty = rowArray.FreeQty;
                }
                if (rowArray.TotalQuantity) {
                    TotalQuantity = rowArray.TotalQuantity;
                }
                if (rowArray.ConversionQuantity) {
                    ConQty = rowArray.ConversionQuantity;
                }
                if (rowArray.GrnQuantityAfterConversion) {
                    GrnQtyAfterCon = rowArray.GrnQuantityAfterConversion;
                }
                if (rowArray.UomPrice) {
                    purchaseuom = rowArray.UomPrice;
                }
                if (rowArray.DiscountAmount) {
                    discountAmt = rowArray.DiscountAmount;
                }
                if (rowArray.InGstAmount) {
                    gst = rowArray.InGstAmount;
                }

                if (rowArray.NetAmount) {
                    netAmt = rowArray.NetAmount;
                }
                if (rowArray.UomMrPrice) {
                    saleUom = rowArray.UomMrPrice;
                }


                csvContent += grnNum + ',' + grnDate + ',' + supplier + ',' + invoiceDate + ',' + invoideNumber + ',' + itemName + ',' + Quantity + ',' + freeQty + ',' + TotalQuantity + ',' + ConQty + ',' + GrnQtyAfterCon + ',' + purchaseuom + ',' + discountAmt + ',' + gst + ',' + netAmt + ',' + saleUom + "\n";
            });
            var encodedUri = encodeURIComponent(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'grnreportbyitem-report.csv';
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
                    Key: 10,
                    Value: $scope.currentfilter.VendorMasterId
                },
                {
                    Key: 2,
                    Value: $scope.currentfilter.ItemMasterId
                },
                {
                    Key: 11,
                    Value: [2, 3, 4]
                }
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
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
            var totalnetamount = 0;
            for (var idx in res.Data) {
                var item = res.Data[idx];
                if ($scope.currentfilter.StoreMasterId > 0) {
                    $scope.StoreName = item.StoreMaster.StoreName;
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
                    Key: 10,
                    Value: $scope.currentfilter.VendorMasterId
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
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
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
                $scope.currentfilter.VendorMasterId = -1;
                $scope.getList();
            }
        };
        $scope.backtoReport = function () {
            $state.go('app.storereporttab.purchasemanagementreport')
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
        vm.itemcontrolconfig = {
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
            }],
            searchparams: {},
            result: {},
            api: 'pharmacy/itemmaster/GetItemMasters',
            formatdisplay: formatselectedmovementitem,
            presearch: presearchmovementitem,
            postsearch: postsearchmovementitem
        };

        function formatselectedmovementitem() {
            var selectedItem = vm.itemcontrolconfig.selected;
            var result = '';
            if (selectedItem && !utl.Common.isEmptyJSONObject(selectedItem)) {
                result = [selectedItem.ItemName + '(' + selectedItem.ItemCode + ')'].join('    ');
            } else if (vm.itemcontrolconfig.rowdata) {
                result = [vm.itemcontrolconfig.rowdata.ItemCode, vm.itemcontrolconfig.rowdata.ItemName].join(' ');
            }
            $scope.ItemName = result;
            return result;
        }

        function presearchmovementitem() {
            var query = vm.itemcontrolconfig.query;
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

            if (vm.itemcontrolconfig.searchbyid === true) {
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

            vm.itemcontrolconfig.searchparams = inputData;
        }

        function postsearchmovementitem() {
            for (var idx in vm.itemcontrolconfig.result) {
                var item = vm.itemcontrolconfig.result[idx];
                item.ItemCode = item.ItemCode;
                item.ItemName = item.ItemName;
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
                    VendorName: $scope.VendorName,
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
                    Key: 10,
                    Value: $scope.currentfilter.VendorMasterId
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
                action: 'pharmacy/grndetail/PrintGRNReportByItem',
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
                field: "Grn.GrnNumber",
                displayName: $translate.instant('reports.grnnum.lbl')
            },
            {
                field: "Grn.GrnDate",
                displayName: $translate.instant('reports.grndate.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.Grn.GrnDate | date : 'dd-MM-yyyy'}} </span></div>"
            },
            // {
            //     field: "PoDate",
            //     displayName: $translate.instant('reports.podate.lbl'),
            //     cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.PoDate | date : 'dd-MM-yyyy'}} </span></div>"
            // },
            // {
            //     field: "PoNumber",
            //     displayName: $translate.instant('reports.ponum.lbl')
            // },

            {
                field: "Grn.VendorName",
                displayName: $translate.instant('reports.vendorname.lbl')
            },
            {
                field: "Grn.InvoiceDate",
                displayName: $translate.instant('reports.invoicedate.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.Grn.InvoiceDate | date : 'dd-MM-yyyy'}} </span></div>"
            },
            {
                field: "Grn.InvoiceNumber",
                displayName: $translate.instant('reports.invoicenum.lbl')
            },
            {
                field: "ItemCode",
                displayName: $translate.instant('Item Code')
            },
            {
                field: "ItemName",
                displayName: $translate.instant('reports.itemname.lbl')
            },
            {
                field: "GrnQuantity",
                displayName: $translate.instant('reports.qty.lbl')
            },
            {
                field: "TotalQuantity",
                displayName: $translate.instant('TotalQuantity')
            },
            {
                field: "FreeQty",
                displayName: $translate.instant('reports.freeqty.lbl')
            },

            {
                field: "ConversionQuantity",
                displayName: $translate.instant('Con.Qty')
            },
            {
                field: "GrnQuantityAfterConversion",
                displayName: $translate.instant('Total Qty After Conversion')
            },
            {
                field: "UomPrice",
                displayName: $translate.instant('reports.purchaseuom.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.UomPrice | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.UomPrice | displaycurrency}}&nbsp;</span>' + '</div>'
            },
            {
                field: "DiscountAmount",
                displayName: $translate.instant('reports.disamt.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.DiscountAmount | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.DiscountAmount | displaycurrency}}&nbsp;</span>' + '</div>'
            },
            {
                field: "GstAmount",
                displayName: $translate.instant('reports.gst.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.GstAmount | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.InGstAmount | displaycurrency}}&nbsp;</span>' + '</div>'
            },
            {
                field: "NetAmount",
                displayName: $translate.instant('reports.netamt.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.NetAmount | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.NetAmount | displaycurrency}}&nbsp;</span>' + '</div>'
            },
            {
                field: "UomMrPrice",
                displayName: $translate.instant('reports.saleuom.lbl'),
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

    GrnReportByItemController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();