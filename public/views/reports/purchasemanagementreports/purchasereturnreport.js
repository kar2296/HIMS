(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PurchaseReturnReportController', PurchaseReturnReportController);

    function PurchaseReturnReportController($scope, $stateParams, $state, $translate, $filter, utl) {
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
            const JsonFields = [" Prn Date", "Prn No", "GRN Date", "GRN Number", "Supplier", "Store Name", "Invoice Number", "Gross Amt", "Discount Amt", "GST", "Others Charges", "Net Amount", "Prn Status", "Returned By"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var prnDate = '';
                var prnNo = '';
                var grnDate = '';
                var grnNum = '';
                var supplier = '';
                var storeName = '';
                var invoiceNum = '';
                var grossAmt = '';
                var discountAmt = '';
                var gst = '';
                var otherCharges = '';
                var netAmt = '';
                var prnStatus = '';
                var returnedby = '';

                if (rowArray.PrnDate) {
                    prnDate = rowArray.PrnDate;
                }
                if (rowArray.PrnNumber) {
                    prnNo = rowArray.PrnNumber;
                }
                if (rowArray.Grn) {
                    if (rowArray.Grn.GrnDate) {
                        grnDate = rowArray.Grn.GrnDate;
                    }
                }
                if (rowArray.Grn) {
                    if (rowArray.Grn.GrnNumber) {
                        grnNum = rowArray.Grn.GrnNumber;
                    }
                }
                if (rowArray.VendorMaster) {
                if (rowArray.VendorMaster.VendorName) {
                    supplier = rowArray.VendorMaster.VendorName;
                }
            }
                if (rowArray.StoreMaster.StoreName) {
                    storeName = rowArray.StoreMaster.StoreName;
                }
                if (rowArray.Grn) {
                    if (rowArray.Grn.InvoiceNumber) {
                        invoiceNum = rowArray.Grn.InvoiceNumber;
                    }
                }
                if (rowArray.TotalGrossAmount) {
                    grossAmt = rowArray.TotalGrossAmount;
                }
                if (rowArray.TotalDiscountAmount) {
                    discountAmt = rowArray.TotalDiscountAmount;
                }
                if (rowArray.TotalGstAmount) {
                    gst = rowArray.TotalGstAmount;
                }
                if (rowArray.OtherCharges) {
                    otherCharges = rowArray.OtherCharges;
                }

                if (rowArray.TotalNetAmount) {
                    netAmt = rowArray.TotalNetAmount;
                }
                if (rowArray.PrnStatus.Description) {
                    prnStatus = rowArray.PrnStatus.Description;
                }
                if (rowArray.ReturnedUser.Title.Description) {
                    returnedby = rowArray.ReturnedUser.Title.Description;
                }
                if (rowArray.ReturnedUser.FirstName) {
                    returnedby += ' ' + rowArray.ReturnedUser.FirstName;
                }
                if (rowArray.ReturnedUser.LastName) {
                    returnedby += ' ' + rowArray.ReturnedUser.LastName;
                }

                csvContent += prnDate + ',' + prnNo + ',' + grnDate + ',' + grnNum + ',' + supplier + ',' + storeName + ',' + invoiceNum + ',' + grossAmt + ',' + discountAmt + ',' + gst + ',' + otherCharges + ',' + netAmt + ',' + prnStatus + ',' + returnedby + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'purchasereturn-report.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            if (!$scope.currentfilter.FromDate || $scope.currentfilter.FromDate == '' ||
                !$scope.currentfilter.ToDate || $scope.currentfilter.ToDate == '') {
                vm.gridConfig.data = [];
                $scope.TotalGrossAmount = 0;
                $scope.TotalDiscountAmount = 0;
                $scope.TotalOtherAmount = 0;
                $scope.TotalGstAmount = 0;
                $scope.TotalNetAmount = 0;
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
                    Key: 3,
                    Value: $scope.currentfilter.VendorMasterId
                },
                {
                    Key: 4,
                    Value: $scope.currentfilter.StoreMasterId
                }
                ],

            };
            var options = {
                action: "pharmacy/PurchaseReturn/GetPurchaseReturns",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };


        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            var totalgrossamount = 0;
            var totaldiscountamount = 0;
            var totalotheramount = 0;
            var totalgstamount = 0;
            var totalnetamount = 0;
            for (var idx in res.Data) {
                var item = res.Data[idx];
                if ($scope.currentfilter.VendorMasterId > 0) {
                    $scope.VendorName = item.VendorMaster.VendorName;
                }
                else {
                    $scope.VendorName = '';
                }
                if ($scope.currentfilter.StoreMasterId > 0) {
                    $scope.StoreName = item.StoreMaster.StoreName;
                }
                totalgrossamount = totalgrossamount + (item.TotalGrossAmount);
                totaldiscountamount = totaldiscountamount + (item.TotalDiscountAmount);
                totalotheramount = totalotheramount + (item.OtherCharges);
                totalgstamount = totalgstamount + (item.TotalGstAmount)
                totalnetamount = totalnetamount + (item.TotalNetAmount)
                vm.gridConfig.data.push(item);
            }
            $scope.TotalGrossAmount = totalgrossamount;
            $scope.TotalDiscountAmount = totaldiscountamount;
            $scope.TotalOtherAmount = totalotheramount;
            $scope.TotalGstAmount = totalgstamount;
            $scope.TotalNetAmount = totalnetamount;
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
                $scope.TotalGrossAmount = 0;
                $scope.TotalDiscountAmount = 0;
                $scope.TotalOtherAmount = 0;
                $scope.TotalGstAmount = 0;
                $scope.TotalNetAmount = 0;
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
                    Key: 3,
                    Value: $scope.currentfilter.VendorMasterId
                },
                {
                    Key: 4,
                    Value: $scope.currentfilter.StoreMasterId
                },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/PurchaseReturn/GetPurchaseReturns',
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
            } if ($scope.Context == 'purchasestorereports') {
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
                field: 'MobileNumber',
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
                result = [selectedItem.VendorName + ' (' + selectedItem.VendorCode + ')'].join(' ');
            } else if (vm.vendorcontrolconfig.rowdata) {
                result = [vm.vendorcontrolconfig.rowdata.VendorName, vm.vendorcontrolconfig.rowdata.VendorCode].join(' ');
            }

            // $scope.getList();

            return result;
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
                    Key: 3,
                    Value: $scope.currentfilter.VendorMasterId
                },
                {
                    Key: 4,
                    Value: $scope.currentfilter.StoreMasterId
                },
                ],
            };

            var options = {
                action: 'pharmacy/PurchaseReturn/PrintPurchaseReturnReport',
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
                field: "PrnDate",
                displayName: $translate.instant('reports.prndate.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.PrnDate | date : 'dd-MM-yyyy'}} </span></div>"
            },
            {
                field: "PrnNumber",
                displayName: $translate.instant('reports.prnno.lbl')
            },
            {
                field: "Grn.GrnDate",
                displayName: $translate.instant('reports.grndate.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.Grn.GrnDate | date : 'dd-MM-yyyy'}} </span></div>"
            },
            {
                field: "Grn.GrnNumber",
                displayName: $translate.instant('reports.grnnum.lbl')
            },
            {
                field: "VendorMaster.VendorName",
                displayName: $translate.instant('reports.vendorname.lbl')
            },
            {
                field: "StoreMaster.StoreName",
                displayName: $translate.instant('reports.storename.lbl')
            },
            {
                field: "Grn.InvoiceNumber",
                displayName: $translate.instant('reports.invoicenum.lbl')
            },
            {
                field: "TotalGrossAmount",
                displayName: $translate.instant('reports.grossamt.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TotalGrossAmount | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalGrossAmount | displaycurrency}}&nbsp;</span>' + '</div>'
            },
            {
                field: "TotalDiscountAmount",
                displayName: $translate.instant('reports.disamt.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TotalDiscountAmount | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalDiscountAmount | displaycurrency}}&nbsp;</span>' + '</div>'
            },
            {
                field: "TotalGstAmount",
                displayName: $translate.instant('reports.gst.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TotalGstAmount | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalGstAmount | displaycurrency}}&nbsp;</span>' + '</div>'
            },
            {
                field: "OtherCharges",
                displayName: $translate.instant('reports.othercharge.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.OtherCharges | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.OtherCharges | displaycurrency}}&nbsp;</span>' + '</div>'
            },
            {
                field: "TotalNetAmount",
                displayName: $translate.instant('reports.netamt.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TotalNetAmount | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalNetAmount | displaycurrency}}&nbsp;</span>' + '</div>'
            },
            {
                field: "PrnStatus.Description",
                displayName: $translate.instant('reports.prnstatus.lbl')
            },
            {
                field: "FirstName",
                displayName: $translate.instant('reports.returnedby.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
            <span ng-if='entity.Title && entity.ReturnedUser.Title.Description'>{{entity.ReturnedUser.Title.Description}}&nbsp;</span>\
            <span>{{entity.ReturnedUser.FirstName}}</span>&nbsp;<span>{{entity.ReturnedUser.LastName}}</span>\
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

    PurchaseReturnReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();