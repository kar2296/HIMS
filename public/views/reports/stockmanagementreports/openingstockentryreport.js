(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('OpeningStockEntryReportController', OpeningStockEntryReportController);

    function OpeningStockEntryReportController($scope, $stateParams, $state, $translate, $filter, utl) {
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
            const JsonFields = ["Stock Entry Number", "Date", "Store Name", "Total Amount", "Created By", "Approved By", "Remark"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var stockentry = '';
                var date = '';
                var storeName = '';
                var depttotalAmt = '';
                var createdBy = '';
                var approvedBy = '';
                var remark = '';

                if (rowArray.StockEntryNumber) {
                    stockentry = rowArray.StockEntryNumber;
                }
                if (rowArray.StockEntryDate) {
                    date = rowArray.StockEntryDate;
                }
                if (rowArray.StoreMaster.StoreName) {
                    storeName = rowArray.StoreMaster.StoreName;
                }
                if (rowArray.TotalNetAmount) {
                    depttotalAmt = rowArray.TotalNetAmount;
                }
                if (rowArray.CreatedUser) {
                    if (rowArray.CreatedUser.Title.Description) {
                        createdBy = rowArray.CreatedUser.Title.Description;
                    }
                    if (rowArray.CreatedUser.FirstName) {
                        createdBy += ' ' + rowArray.CreatedUser.FirstName;
                    }
                    if (rowArray.CreatedUser.LastName) {
                        createdBy += ' ' + rowArray.CreatedUser.LastName;
                    }
                }
                if (rowArray.ApprovedUser) {
                    if (rowArray.ApprovedUser.Title.Description) {
                        approvedBy = rowArray.ApprovedUser.Title.Description;
                    }
                    if (rowArray.ApprovedUser.FirstName) {
                        approvedBy += ' ' + rowArray.ApprovedUser.FirstName;
                    }
                    if (rowArray.ApprovedUser.LastName) {
                        approvedBy += ' ' + rowArray.ApprovedUser.LastName;
                    }
                }
                if (rowArray.Comments) {
                    remark = rowArray.Comments;
                }
                csvContent += stockentry + ',' + date + ',' + storeName + ',' + depttotalAmt + ',' + createdBy + ',' + approvedBy + ',' + remark + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'openingstockentry-report.csv';
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
                    Key: 4,
                    Value: $scope.currentfilter.StoreMasterId
                }
                ],

            };
            var options = {
                action: "pharmacy/stockentry/GetStockEntrys",
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
                totalnetamount = totalnetamount + (item.TotalNetAmount);
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
                action: 'pharmacy/stockentry/GetStockEntrys',
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
            $state.go('app.storereporttab.stackmanagementreport')
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
                    Key: 7,
                    Value: From
                },
                {
                    Key: 8,
                    Value: To
                },
                {
                    Key: 4,
                    Value: $scope.currentfilter.StoreMasterId
                },
                ],
            };

            var options = {
                action: 'pharmacy/stockentry/PrintOpeningStockReport',
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
                field: "StockEntryNumber",
                displayName: $translate.instant('reports.stockno.lbl')
            },
            {
                field: "StockEntryDate",
                displayName: $translate.instant('reports.date.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.StockEntryDate | date : 'dd-MM-yyyy'}} </span></div>"
            },
            {
                field: "StoreMaster.StoreName",
                displayName: $translate.instant('reports.storename.lbl')
            },
            {
                field: "TotalNetAmount",
                displayName: $translate.instant('reports.totalamt.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span class='pl-3'>{{entity.TotalNetAmount | displaycurrency}}</span>" + "</div>"
                // cellTemplate: '<div class="ui-grid-cell-contents" >' + '<span >{{entity.TotalNetAmount | displaycurrency}}&nbsp;</span>' + '</div>'
            },
            {
                field: "createdby",
                displayName: $translate.instant('reports.createdby.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                <span ng-if='entity.Title && entity.CreatedUser.Title.Description'>{{entity.CreatedUser.Title.Description}}&nbsp;</span>\
                <span>{{entity.CreatedUser.FirstName}}</span>&nbsp;<span>{{entity.CreatedUser.LastName}}</span>\
                 </div>"
            },
            {
                field: "ApprovedUser",
                displayName: $translate.instant('reports.approvedby.lbl'),
                cellTemplate: "<div class='ui-grid-cell-contents'>\
                <span ng-if='entity.Title && entity.ApprovedUser.Title.Description'>{{entity.ApprovedUser.Title.Description}}&nbsp;</span>\
                <span>{{entity.ApprovedUser.FirstName}}</span>&nbsp;<span>{{entity.ApprovedUser.LastName}}</span>\
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

    OpeningStockEntryReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();