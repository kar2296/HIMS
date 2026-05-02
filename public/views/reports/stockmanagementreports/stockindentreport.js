(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('StockIndentReportController', StockIndentReportController);

    function StockIndentReportController($scope, $stateParams, $state, $translate, $filter, utl) {
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
            const JsonFields = ["Indent Number", "Indent Date", "From Store", "Indent Status", "Requested By", "Remark"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var indentNum = '';
                var indentDate = '';
                var fromStore = '';
                var indentStatus = '';
                var requestBy = '';
                var remark = '';

                if (rowArray.RequestNumber) {
                    indentNum = rowArray.RequestNumber;
                }

                if (rowArray.RequestedDate) {
                    // indentDate = rowArray.RequestedDate;
                    indentDate = utl.Formatter.getDateTimeString(rowArray.RequestedDate);
                }
                if (rowArray.StoreName) {
                    fromStore = rowArray.StoreName;
                }
                if (rowArray.RequestStatus) {
                    if (rowArray.RequestStatus.Description) {
                        indentStatus = rowArray.RequestStatus.Description;
                    }
                }
                if (rowArray.RequestedUser.Title) {
                    if (rowArray.RequestedUser.Title.Description) {
                        requestBy = rowArray.RequestedUser.Title.Description;
                    }
                }
                if (rowArray.RequestedUser.FirstName) {
                    requestBy += ' ' + rowArray.RequestedUser.FirstName;
                }
                if (rowArray.RequestedUser.LastName) {
                    requestBy += ' ' + rowArray.RequestedUser.LastName;
                }
                if (rowArray.Comments) {
                    remark = rowArray.Comments;
                }

                csvContent += indentNum + ',' + indentDate + ',' + fromStore + ',' + indentStatus + ',' + requestBy + ',' + remark + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'stockindent-report.csv';
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
                    Key: 11,
                    Value: From
                },
                {
                    Key: 12,
                    Value: To
                },
                {
                    Key: 6,
                    Value: $scope.currentfilter.StoreMasterId
                },
                {
                    Key: 3,
                    Value: $scope.currentfilter.RequestStatusId
                }
                ],

            };
            var options = {
                action: "pharmacy/stockrequest/GetStockRequests",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            if ($scope.currentfilter.StoreMasterId > 0) {
                $scope.StoreName = res.Data[0].FromStore.StoreName;
            } else {
                $scope.StoreName = '';
            }
            if ($scope.currentfilter.RequestStatusId > 0) {
                $scope.Status = res.Data[0].RequestStatus.Description;
            } else {
                $scope.Status = '';
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
                Params: [{
                    Key: 11,
                    Value: From
                },
                {
                    Key: 12,
                    Value: To
                },
                {
                    Key: 6,
                    Value: $scope.currentfilter.StoreMasterId
                },
                {
                    Key: 3,
                    Value: $scope.currentfilter.RequestStatusId
                },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/stockrequest/GetStockRequests',
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
                    Status: $scope.Status
                },
                Params: [{
                    Key: 11,
                    Value: From
                },
                {
                    Key: 12,
                    Value: To
                },
                {
                    Key: 6,
                    Value: $scope.currentfilter.StoreMasterId
                },
                {
                    Key: 3,
                    Value: $scope.currentfilter.RequestStatusId
                },
                ],
            };

            var options = {
                action: 'pharmacy/stockrequest/PrintStockIndentReport',
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
                field: "RequestNumber",
                displayName: $translate.instant('reports.Reqnum.lbl')
            },
            {
                field: "RequestedDate",
                displayName: $translate.instant('reports.Reqdate.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.RequestedDate | date : 'dd-MM-yyyy'}} </span></div>"
            },
            {
                field: "StoreName",
                displayName: $translate.instant('reports.fromstore.lbl')
            },
            {
                field: "RequestStatus.Description",
                displayName: $translate.instant('reports.status.lbl')
            },
            {
                field: "FirstName",
                displayName: $translate.instant('reports.reqby.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                <span ng-if='entity.Title && entity.RequestedUser.Title.Description'>{{entity.RequestedUser.Title.Description}}&nbsp;</span>\
                <span>{{entity.RequestedUser.FirstName}}</span>&nbsp;<span>{{entity.RequestedUser.LastName}}</span>\
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
                "Key": "RequestStatus"
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

    StockIndentReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();