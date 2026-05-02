(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PurchaseVendorReportController', PurchaseVendorReportController);

    function PurchaseVendorReportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
        };
        $scope.CanShowPrint = false;
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }


        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Date", "Receipt", "Supplier", "Net Amount", "Receipt Amount", "TDS Amount", "Write-Off Amount", "Balance Amount", "Payment Type", "User Name"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var date = '';
                var receipt = '';
                var supplier = '';
                var netAmt = '';
                var receiptAmt = '';
                var tdsAmt = '';
                var writeOff = '';
                var balanceAmt = '';
                var payType = '';
                var useName = '';

                if (rowArray.VendorPaymentDate) {
                    date = rowArray.VendorPaymentDate;
                }
                if (rowArray.VendorPaymentIdentifier) {
                    receipt = rowArray.VendorPaymentIdentifier;
                }
                if (rowArray.VendorName) {
                    supplier = rowArray.VendorName;
                }
                if (rowArray.TotalNetAmount) {
                    netAmt = rowArray.TotalNetAmount;
                }
                if (rowArray.TotalPaidAmount) {
                    receiptAmt = rowArray.TotalPaidAmount;
                }
                if (rowArray.TotalTDSAmount) {
                    tdsAmt = rowArray.TotalTDSAmount;
                }
                if (rowArray.WriteOff) {
                    writeOff = rowArray.WriteOff;
                }
                if (rowArray.TotalOutstandingAmount) {
                    balanceAmt = rowArray.TotalOutstandingAmount;
                }
                if (rowArray.PaymentType) {
                    if (rowArray.PaymentType.Description) {
                        payType = rowArray.PaymentType.Description;
                    }
                }
                if (rowArray.CreatedUser) {
                    if (rowArray.CreatedUser.Title.Description) {
                        useName = rowArray.CreatedUser.Title.Description;
                    }
                    if (rowArray.CreatedUser.FirstName) {
                        useName += ' ' + rowArray.CreatedUser.FirstName;
                    }
                    if (rowArray.CreatedUser.LastName) {
                        useName += ' ' + rowArray.CreatedUser.LastName;
                    }
                }

                csvContent += date + ',' + receipt + ',' + supplier + ',' + netAmt + ',' + receiptAmt + ',' + tdsAmt + ',' + writeOff + ',' + balanceAmt + ',' + payType + ',' + useName + "\n";
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
                $scope.TotalRecAmt = 0;
                $scope.TotalTdsAmt = 0;
                $scope.TotalWriteoffAmt = 0;
                $scope.TotalBalanceAmt = 0;
                $scope.CanShowPrint = false;
                return;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                        Key: 3,
                        Value: From
                    },
                    {
                        Key: 4,
                        Value: To
                    },
                    {
                        Key: 1,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 6,
                        Value: 2
                    },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.VendorMasterId
                    },
                    {
                        Key: 8,
                        Value: $scope.currentfilter.PaymentTypeId
                    }
                ],

            };
            var options = {
                action: "pharmacy/VendorPayment/GetVendorPayments",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };


        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            var totalnetamount = 0;
            var totalreceiptamout = 0;
            var totaltdsamount = 0;
            var totalwriteoffamount = 0;
            var totalbalanceamount = 0;
            for (var idx in res.Data) {
                var item = res.Data[idx];
                if ($scope.currentfilter.PaymentTypeId > 0) {
                    $scope.PaymentType = item.PaymentType.Description;
                }
                if ($scope.currentfilter.VendorMasterId > 0) {
                    $scope.VendorName = item.VendorName;
                }
                totalnetamount = totalnetamount + (item.TotalNetAmount);
                totalreceiptamout = totalreceiptamout + (item.TotalPaidAmount);
                totaltdsamount = totaltdsamount + (item.TotalTDSAmount);
                totalwriteoffamount = totalwriteoffamount + (item.WriteOff);
                totalbalanceamount = totalbalanceamount + (item.TotalOutstandingAmount);
                vm.gridConfig.data.push(item);
            }
            $scope.TotalNetAmt = totalnetamount;
            $scope.TotalRecAmt = totalreceiptamout;
            $scope.TotalTdsAmt = totaltdsamount;
            $scope.TotalWriteoffAmt = totalwriteoffamount;
            $scope.TotalBalanceAmt = totalbalanceamount;
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
                $scope.TotalNetAmt = 0;
                $scope.TotalRecAmt = 0;
                $scope.TotalTdsAmt = 0;
                $scope.TotalWriteoffAmt = 0;
                $scope.TotalBalanceAmt = 0;
                $scope.CanShowPrint = false;
                return;
            }
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                        Key: 3,
                        Value: From
                    },
                    {
                        Key: 4,
                        Value: To
                    },
                    {
                        Key: 1,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 6,
                        Value: 2
                    },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.VendorMasterId
                    },
                    {
                        Key: 8,
                        Value: $scope.currentfilter.PaymentTypeId
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/VendorPayment/GetVendorPayments',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.onenter = function (data) {
            if (data == undefined) {
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

        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityName: $scope.currentfilter.FacilityName,
                    VendorName: $scope.currentfilter.VendorName,
                    PaymentType: $scope.PaymentType
                },
                Params: [{
                        Key: 3,
                        Value: From
                    },
                    {
                        Key: 4,
                        Value: To
                    },
                    {
                        Key: 1,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 6,
                        Value: 2
                    },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.VendorMasterId
                    },
                    {
                        Key: 8,
                        Value: $scope.currentfilter.PaymentTypeId
                    },
                ],
            };
            var options = {
                action: 'pharmacy/VendorPayment/PrintVendorPaymentReport',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
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
                $scope.currentfilter.VendorCode = selectedItem.VendorCode;
                $scope.currentfilter.VendorName = selectedItem.VendorName;
                result = [selectedItem.VendorName + ' (' + selectedItem.VendorCode + ')'].join(' ');
            } else if (vm.vendorcontrolconfig.rowdata) {
                result = [vm.vendorcontrolconfig.rowdata.VendorName, vm.vendorcontrolconfig.rowdata.VendorCode].join(' ');
            }
            return result;
        }

        function presearchvendor() {
            var query = vm.vendorcontrolconfig.query;

            var inputData = {
                Params: [{
                    Key: 3,
                    Value: 1
                }, {
                    Key: 4,
                    Value: 2
                }],
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


        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                    field: "idx",
                    displayName: $translate.instant('S.No'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}} </span> </div>"
                },
                {
                    field: "VendorPaymentDate",
                    displayName: $translate.instant('reports.date.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.VendorPaymentDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.ReceiptDateTime| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "VendorPaymentIdentifier",
                    displayName: $translate.instant('reports.receipt.lbl')
                },
                {
                    field: "VendorName",
                    displayName: $translate.instant('reports.vendorname.lbl')
                },
                {
                    field: "TotalNetAmount",
                    displayName: $translate.instant('reports.netamt.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TotalNetAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "TotalPaidAmount",
                    displayName: $translate.instant('reports.receiptamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TotalPaidAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "TotalTDSAmount",
                    displayName: $translate.instant('reports.tdsamount.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TotalTDSAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "WriteOff",
                    displayName: $translate.instant('reports.writeoff.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.WriteOff | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "TotalOutstandingAmount",
                    displayName: $translate.instant('reports.balance.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TotalOutstandingAmount | displaycurrency}}</span>" + "</div>"
                },
                {
                    field: "PaymentType.Description",
                    displayName: $translate.instant('reports.paymenttype.lbl')
                },
                {
                    field: "CreatedUser",
                    displayName: $translate.instant('reports.username.lbl'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.CreatedUser.Title && entity.CreatedUser.Title.Description'>{{entity.CreatedUser.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.CreatedUser.FirstName}}</span>&nbsp;<span>{{entity.CreatedUser.LastName}}</span>\
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
            $scope.lookup = hasError ? {} : data;
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
                    "Key": "PaymentType"
                }
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

    PurchaseVendorReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();