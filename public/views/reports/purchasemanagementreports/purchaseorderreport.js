(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PurchaseOrderReportController', PurchaseOrderReportController);

    function PurchaseOrderReportController($scope, $stateParams, $state, $translate, $filter, utl) {
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
            const JsonFields = ["PO Number", "PO Date", "Supplier", "Delivery Date", "Total Amount", "Discount Amt", "GST", "Others Charges", "Net Amount", "Approved By", "PO Status"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var poNum = '';
                var poDate = '';
                var supplier = '';
                var delevery = '';
                var totalAmt = '';
                var discountAmt = '';
                var gst = '';
                var otherCharge = '';
                var netAmt = '';
                var approved = '';
                var poStatus = '';

                if (rowArray.PoNumber) {
                    poNum = rowArray.PoNumber;
                }
                if (rowArray.PoDate) {
                    poDate = rowArray.PoDate;
                }
                if (rowArray.VendorName) {
                    supplier = rowArray.VendorName;
                }
                if (rowArray.DeliveryDate) {
                    delevery = rowArray.DeliveryDate;
                }
                if (rowArray.TotalGrossAmount) {
                    totalAmt = rowArray.TotalGrossAmount;
                }
                if (rowArray.TotalDiscountAmount) {
                    discountAmt = rowArray.TotalDiscountAmount;
                }
                if (rowArray.TotalGstAmount) {
                    gst = rowArray.TotalGstAmount;
                }
                if (rowArray.OtherCharges) {
                    otherCharge = rowArray.OtherCharges;
                }
                if (rowArray.TotalNetAmount) {
                    netAmt = rowArray.TotalNetAmount;
                }
                if (rowArray.ApprovedUser) {
                    if (rowArray.ApprovedUser.Title) {
                        if (rowArray.ApprovedUser.Title.Description) {
                            approved = rowArray.ApprovedUser.Title.Description;
                        }
                    }
                    if (rowArray.ApprovedUser.FirstName) {
                        approved += ' ' + rowArray.ApprovedUser.FirstName;
                    }
                    if (rowArray.ApprovedUser.LastName) {
                        approved += ' ' + rowArray.ApprovedUser.LastName;
                    }
                }
                if (rowArray.PoStatus.Description) {
                    poStatus = rowArray.PoStatus.Description;
                }
                csvContent += poNum + ',' + poDate + ',' + supplier + ',' + delevery + ',' + totalAmt + ',' + discountAmt + ',' + gst + ',' + otherCharge + ',' + netAmt + ',' + approved + ',' + poStatus + "\n";
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
                    Key: 5,
                    Value: $scope.currentfilter.StoreMasterId
                },
                {
                    Key: 3,
                    Value: $scope.currentfilter.VendorMasterId
                },
                {
                    Key: 4,
                    Value: $scope.currentfilter.PoStatusId
                }
                ],

            };
            var options = {
                action: "pharmacy/purchaseorder/GetPurchaseOrders",
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
            var totalotheramount = 0;
            var totalnetamount = 0;
            for (var idx in res.Data) {
                var item = res.Data[idx];
                if ($scope.currentfilter.StoreMasterId > 0) {
                    $scope.StoreName = item.FromStore.StoreName;
                } else {
                    $scope.StoreName = '';
                }
                if ($scope.currentfilter.VendorMasterId > 0) {
                    $scope.VendorName = item.VendorName;
                } else {
                    $scope.VendorName = '';
                }
                if ($scope.currentfilter.PoStatusId > 0) {
                    $scope.PoStatus = item.PoStatus.Description;
                } else {
                    $scope.PoStatus = '';
                }
                totalgrossamount = totalgrossamount + (item.TotalGrossAmount);
                totaldisamount = totaldisamount + (item.TotalDiscountAmount);
                totalgstamount = totalgstamount + (item.TotalGstAmount);
                totalotheramount = totalotheramount + (item.OtherCharges);
                totalnetamount = totalnetamount + (item.TotalNetAmount);
                vm.gridConfig.data.push(item);
            }
            if (vm.gridConfig.data.length > 0) {
                $scope.CanShowPrint = true;
            }
            $scope.TotalGrossAmount = totalgrossamount;
            $scope.TotalDisAmount = totaldisamount;
            $scope.TotalGstAmt = totalgstamount;
            $scope.TotalOtherAmt = totalotheramount;
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
                    Key: 5,
                    Value: $scope.currentfilter.StoreMasterId
                },
                {
                    Key: 3,
                    Value: $scope.currentfilter.VendorMasterId
                },
                {
                    Key: 4,
                    Value: $scope.currentfilter.PoStatusId
                },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/purchaseorder/GetPurchaseOrders',
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
                    PoStatus: $scope.PoStatus
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
                    Key: 5,
                    Value: $scope.currentfilter.StoreMasterId
                },
                {
                    Key: 3,
                    Value: $scope.currentfilter.VendorMasterId
                },
                {
                    Key: 4,
                    Value: $scope.currentfilter.PoStatusId
                },
                ],
            };

            var options = {
                action: 'pharmacy/purchaseorder/PrintPurchaseOrderReport',
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
                field: "PoNumber",
                displayName: $translate.instant('reports.ponum.lbl')

            },
            {
                field: "PoDate",
                displayName: $translate.instant('reports.podate.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.PoDate | date : 'dd-MM-yyyy'}} </span></div>"
            },
            {
                field: "VendorName",
                displayName: $translate.instant('reports.vendorname.lbl')
            },
            {
                field: "DeliveryDate",
                displayName: $translate.instant('reports.deldate.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.DeliveryDate | date : 'dd-MM-yyyy'}} </span></div>"
            },

            {
                field: "TotalGrossAmount",
                displayName: $translate.instant('reports.totalamt.lbl'),
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

            // {
            //     field: "FirstName",
            //     displayName: $translate.instant('reports.createdby.lbl'),
            //     cellTemplate: "<div class='ui-grid-cell-contents'>\
            //     <span ng-if='entity.Title && entity.CreatedUser.Title.Description'>{{entity.CreatedUser.Title.Description}}&nbsp;</span>\
            //     <span>{{entity.CreatedUser.FirstName}}</span>&nbsp;<span>{{entity.CreatedUser.LastName}}</span>\
            //      </div>"
            // },
            {
                field: "FirstName",
                displayName: $translate.instant('reports.approvedby.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                                       <span ng-if='entity.ApprovedUser.Title && entity.ApprovedUser.Title.Description'>{{entity.ApprovedUser.Title.Description}}&nbsp;</span>\
                                       <span>{{entity.ApprovedUser.FirstName}}</span>&nbsp;<span>{{entity.ApprovedUser.LastName}}</span>\
                                        </div>"
            },
            {
                field: "PoStatus.Description",
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

    PurchaseOrderReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();