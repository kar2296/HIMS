(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('purchaseorderdetailreportController', purchaseorderdetailreportController);

    function purchaseorderdetailreportController($scope, $stateParams, $state, $translate, $filter, utl) {
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
            const JsonFields = ["PO Number", "PO Date", "Item Name", "POQty", "StoreName", "VendorCode", "VendorName", "VendorAddress",
                "Delivery Date", "MRP", "PurchasePrice", "Gross Amt", "Discount", "Gst Amount", "Net Amount", "Approved By", "PO Status"
            ]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var poNum = '';
                var poDate = '';
                var itemname = '';
                var poqty = '';
                var storename = '';
                var vendorcode = '';
                var vendorname = '';
                var vendoraddress = '';
                var delevery = '';
                var mrp = '';
                var purchaseprice = '';
                var grossamt = '';
                var discount = '';
                var gst = '';
                var netamt = '';
                var approved = '';
                var poStatus = '';

                if (rowArray.PurchaseOrder.PoNumber) {
                    poNum = rowArray.PurchaseOrder.PoNumber;
                }
                if (rowArray.PurchaseOrder.PoDate) {
                    poDate = rowArray.PurchaseOrder.PoDate;
                }
                if (rowArray.ItemName) {
                    itemname = rowArray.ItemName;
                }
                if (rowArray.PoQuantity) {
                    poqty = rowArray.PoQuantity;
                }
                if (rowArray.PurchaseOrder.FromStore.StoreName) {
                    storename = rowArray.PurchaseOrder.FromStore.StoreName;
                }
                if (rowArray.VendorMaster.VendorName) {
                    vendorname = rowArray.VendorMaster.VendorName;
                }
                if (rowArray.VendorMaster.VendorCode) {
                    vendorcode = rowArray.VendorMaster.VendorCode;
                }
                if (rowArray.VendorMaster.AddressLine1) {
                    vendoraddress += ' ' + rowArray.VendorMaster.AddressLine1;
                }
                if (rowArray.VendorMaster.AddressLine2) {
                    vendoraddress += ' ' + rowArray.VendorMaster.AddressLine2;
                }
                if (rowArray.PurchaseOrder.DeliveryDate) {
                    delevery = rowArray.PurchaseOrder.DeliveryDate;
                }
                if (rowArray.MrPrice) {
                    mrp = rowArray.MrPrice;
                }
                if (rowArray.PurchasePrice) {
                    purchaseprice = rowArray.PurchasePrice;
                }
                if (rowArray.GrossAmount) {
                    grossamt = rowArray.GrossAmount;
                }
                if (rowArray.DiscountAmount) {
                    discount = rowArray.DiscountAmount;
                }
                if (rowArray.GstAmount) {
                    gst = rowArray.GstAmount;
                }
                if (rowArray.NetAmount) {
                    netamt = rowArray.NetAmount;
                }
                if (rowArray.PurchaseOrder.ApprovedUser.Title.Description) {
                    approved = rowArray.PurchaseOrder.ApprovedUser.Title.Description;
                }
                if (rowArray.PurchaseOrder.ApprovedUser.FirstName) {
                    approved += ' ' + rowArray.PurchaseOrder.ApprovedUser.FirstName;
                }
                if (rowArray.PurchaseOrder.ApprovedUser.LastName) {
                    approved += ' ' + rowArray.PurchaseOrder.ApprovedUser.LastName;
                }
                if (rowArray.PurchaseOrder.PoStatus.Description) {
                    poStatus = rowArray.PurchaseOrder.PoStatus.Description;
                }
                csvContent += poNum + ',' + poDate + ',' + itemname + ',' + poqty + ',' + storename + ',' + vendorcode + ',' + vendorname + ',' + vendoraddress + ',' + delevery + ',' + mrp + ',' + purchaseprice + ',' + grossamt + ',' + discount + ',' + gst + ',' +
                    netamt + ',' + approved + ',' + poStatus + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'purchaseorder-report.csv';
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
                        Value: $scope.currentfilter.PoStatusId
                    },
                ],

            };
            var options = {
                action: 'pharmacy/purchaseorderdetail/GetPurchaseOrderDetails',
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };


        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            var totalgrossamount = 0;
            var totaldisamount = 0;
            var totalgstamount = 0;
            var totalMrPrice = 0;
            var totalPurchasePrice = 0;
            var totalnetamount = 0;
            for (var idx in res.Data) {
                var item = res.Data[idx];
                if ($scope.currentfilter.StoreMasterId > 0) {
                    $scope.StoreName = item.PurchaseOrder.FromStore.StoreName;
                } else {
                    $scope.StoreName = '';
                }
                if ($scope.currentfilter.VendorMasterId > 0) {
                    $scope.VendorName = item.VendorMaster.VendorName;
                } else {
                    $scope.VendorName = '';
                }
                if ($scope.currentfilter.PoStatusId > 0) {
                    $scope.PoStatus = item.PurchaseOrder.PoStatus.Description;
                } else {
                    $scope.PoStatus = '';
                }
                totalgrossamount = totalgrossamount + (item.GrossAmount);
                totaldisamount = totaldisamount + (item.DiscountAmount);
                totalgstamount = totalgstamount + (item.GstAmount);
                totalnetamount = totalnetamount + (item.NetAmount);
                totalMrPrice = totalMrPrice + (item.MrPrice);
                totalPurchasePrice = totalPurchasePrice + (item.PurchasePrice);
                vm.gridConfig.data.push(item);
            }
            if (vm.gridConfig.data.length > 0) {
                $scope.CanShowPrint = true;
            }
            $scope.TotalGrossAmount = totalgrossamount;
            $scope.TotalDisAmount = totaldisamount;
            $scope.TotalGstAmt = totalgstamount;
            $scope.TotalPurchasePrice = totalPurchasePrice;
            $scope.TotalNetAmt = totalnetamount;
            $scope.TotalMrPrice = totalMrPrice;
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
                        Value: $scope.currentfilter.PoStatusId
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
                // $scope.getList();
            }
        };
        $scope.backtoReport = function () {
            if ($scope.Context == 'inventoryreport') {
                $state.go('app.financereporttab.inventoryreport');
            }
            if ($scope.Context == 'purchasestorereports') {
                $state.go('app.storereporttab.purchasemanagementreport');
            }

        };
        vm.vendorcontrolconfig = {
            query: '',
            searchbyid: false,
            options: [{
                    header: 'Vendor Code',
                    field: 'VendorCode',
                    datatype: 'string',
                    headercls: 'td-code',
                    fieldcls: 'td-code'
                },
                {
                    header: 'Vendor Name',
                    field: 'VendorName',
                    datatype: 'string',
                    headercls: 'td-name',
                    fieldcls: 'td-name'
                },
                {
                    header: 'Vendor Contact',
                    field: 'PhoneNumber',
                    datatype: 'string',
                    headercls: 'td-phoneno',
                    fieldcls: 'td-phoneno'
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
                PageContext: {
                    PageSize: 25,
                    PageNumber: 1
                }
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
                    VendorName: $scope.VendorName,
                    PoStatus: $scope.PoStatus,
                    FacilityId: $scope.currentfilter.FacilityId
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
                        Value: $scope.currentfilter.PoStatusId
                    },
                ],
            };

            var options = {
                action: 'pharmacy/purchaseorderdetail/PrintPurchaseOrderDetailReport',
                data: inputData,
                type: 'post',
            };
            utl.Http.doDownload(options);
        };

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "idx",
                    displayName: $translate.instant('S.No'),
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
                    field: "ItemName",
                    displayName: $translate.instant('Item Name')
                },
                {
                    field: "PoQuantity",
                    displayName: $translate.instant('Qty')
                },
                {
                    field: "",
                    displayName: $translate.instant('Ordered By')
                },
                {
                    field: "PurchaseOrder.FromStore.StoreName",
                    displayName: $translate.instant('Store Name')
                },
                {
                    field: "VendorMaster.VendorCode",
                    displayName: $translate.instant('Vendor Code')
                },
                {
                    field: "VendorMaster.VendorName",
                    displayName: $translate.instant('reports.vendorname.lbl')
                },
                {
                    field: "VendorMaster.AddressLine1",
                    displayName: $translate.instant('Address'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                            <span>{{entity.VendorMaster.AddressLine1}}</span>&nbsp;<span>{{entity.VendorMaster.AddressLine2}}</span>\
                             </div>"
                },
                {
                    field: "PurchaseOrder.DeliveryDate",
                    displayName: $translate.instant('reports.deldate.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.PurchaseOrder.DeliveryDate | date : 'dd-MM-yyyy'}} </span></div>"
                },

                {
                    field: "MrPrice",
                    displayName: $translate.instant('MrPrice'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.MrPrice | displaycurrency}}</span>" + "</div>"
                    // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalGrossAmount | displaycurrency}}&nbsp;</span>' + '</div>'
                },
                {
                    field: "PurchasePrice",
                    displayName: $translate.instant('PurchasePrice'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.PurchasePrice | displaycurrency}}</span>" + "</div>"
                    // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalDiscountAmount | displaycurrency}}&nbsp;</span>' + '</div>'
                },
                {
                    field: "GrossAmount",
                    displayName: $translate.instant('GrossAmount'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.GrossAmount | displaycurrency}}</span>" + "</div>"
                    // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalGstAmount | displaycurrency}}&nbsp;</span>' + '</div>'
                },
                {
                    field: "DiscountAmount",
                    displayName: $translate.instant('DiscountAmount'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.DiscountAmount | displaycurrency}}</span>" + "</div>"
                    // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.OtherCharges | displaycurrency}}&nbsp;</span>' + '</div>'
                },
                {
                    field: "GstAmount",
                    displayName: $translate.instant('GstAmount'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.GstAmount | displaycurrency}}</span>" + "</div>"
                    // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalNetAmount | displaycurrency}}&nbsp;</span>' + '</div>'
                },
                {
                    field: "NetAmount",
                    displayName: $translate.instant('NetAmount'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.NetAmount | displaycurrency}}</span>" + "</div>"
                    // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalNetAmount | displaycurrency}}&nbsp;</span>' + '</div>'
                },

                {
                    field: "FirstName",
                    displayName: $translate.instant('reports.approvedby.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.PurchaseOrder.ApprovedUser.Title && entity.PurchaseOrder.ApprovedUser.Title.Description'>{{entity.PurchaseOrder.ApprovedUser.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.PurchaseOrder.ApprovedUser.FirstName}}</span>&nbsp;<span>{{entity.PurchaseOrder.ApprovedUser.LastName}}</span>\
                                        </div>"
                },
                {
                    field: "PurchaseOrder.PoStatus.Description",
                    displayName: $translate.instant('reports.postatus.lbl')
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
                    "Key": "PoStatus",
                    Default: false
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

    purchaseorderdetailreportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();