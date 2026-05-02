(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('assetwarrantyexpiryreportController', assetwarrantyexpiryreportController);

    function assetwarrantyexpiryreportController($rootScope, $scope, $stateParams, $state, $translate, $filter, utl, $timeout) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));

        $scope.Items = [];
        $scope.currentfilter = {
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            WarrantyTypeId: -1,
            ActiveStatusId: 2,
            FacilityId: utl.Session.getCurrentFacilityId(),
            AssetTypeId: -1, 
            // AssetTypeId: parseInt(utl.Session.getCurrentTicketTypeId()), 
        };

        $scope.openFilterTab = function () {
            if ($scope.currentfilter.showFilterTab === true) {
                $scope.currentfilter.showFilterTab = false;
            } else {
                $scope.currentfilter.showFilterTab = true;
            }
        }
        $scope.backtoReport = function () {
            $state.go('app.assetreports');
        };


        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Code", "Name", "Category", "Type", "Model No", "Warranty Type", "From Date", "To Date", "No Of Free Services", "No Of Pending Services", "Cost Value", "Ref No"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var code = '';
                var name = '';
                var category = '';
                var type = '';
                var modeNo = '';
                var warranty = '';
                var fromDate = '';
                var toDate = '';
                var noService = '';
                var pendingService = '';
                var costValue = '';
                var refNo = '';

                if (rowArray.Asset.AssetCode) {
                    code = rowArray.Asset.AssetCode;
                }
                if (rowArray.Asset.AssetName) {
                    name = rowArray.Asset.AssetName;
                }
                if (rowArray.Asset.AssetCategory.Description) {
                    category = rowArray.Asset.AssetCategory.Description;
                }
                if (rowArray.Asset.AssetType.Description) {
                    type = rowArray.Asset.AssetType.Description;
                }
                if (rowArray.Asset.ModelNum) {
                    modeNo = rowArray.Asset.ModelNum;
                }
                if (rowArray.WarrantyType.Description) {
                    warranty = rowArray.WarrantyType.Description;
                }
                if (rowArray.FromDate) {
                    fromDate = rowArray.FromDate;
                }
                if (rowArray.ToDate) {
                    toDate = rowArray.ToDate;
                }
                if (rowArray.NoOfFreeServices) {
                    noService = rowArray.NoOfFreeServices;
                }
                if (rowArray.NoOfPendingServices) {
                    pendingService = rowArray.NoOfPendingServices;
                }
                if (rowArray.CostValue) {
                    costValue = rowArray.CostValue;
                }
                if (rowArray.ReferenceNumber) {
                    refNo = rowArray.ReferenceNumber;
                }

                csvContent += code + ',' + name + ',' + category + ',' + type + ',' + modeNo + ',' + warranty + ',' + fromDate + ',' + toDate + ',' + noService + ',' + pendingService + ',' + costValue + ',' + refNo + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'assetwarrantyexpiry-report.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
                        Key: 1,
                        Value: $scope.currentfilter.WarrantyTypeId
                    },
                    {
                        Key: 10,
                        Value: From
                    },
                    {
                        Key: 11,
                        Value: To
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.ActiveStatusId
                    },
                    {
                        Key: 6,
                        Value: $scope.currentfilter.FacilityId
                    }
                ],

            };
            var options = {
                action: "AssetManagement/Assetwarranty/GetAssetWarranties",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            angular.forEach(res.Data, function (data, index) {
                res.Data[index].rowIndex = index + 1;
            })
            if ($scope.currentfilter.WarrantyTypeId > 0) {
                if (res.Data.length > 0) {
                    $scope.WarrantyType = res.Data[0].WarrantyType.Description;
                } else {
                    $scope.WarrantyType = '';
                }
            }
            if ($scope.currentfilter.AssetTypeId > 0) {
                if (res.Data.length > 0) {
                    $scope.AssetType = res.Data[0].Asset.AssetType.Description;
                } else {
                    $scope.AssetType = '';
                }
            }
            if ($scope.currentfilter.ActiveStatusId > 0) {
                if (res.Data.length > 0) {
                    $scope.ActiveStatus = res.Data[0].ActiveStatus.Description;
                } else {
                    $scope.ActiveStatus = '';
                }
            }
            vm.gridConfig.data = [];

            for (var idx in res.Data) {
                var item = res.Data[idx];

                vm.gridConfig.data.push(item);
            }
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
                        Key: 1,
                        Value: $scope.currentfilter.WarrantyTypeId
                    },
                    {
                        Key: 10,
                        Value: From
                    },
                    {
                        Key: 11,
                        Value: To
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.ActiveStatusId
                    },
                    {
                        Key: 6,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 12,
                        Value: $scope.currentfilter.AssetTypeId
                    }

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'AssetManagement/Assetwarranty/GetAssetWarranties',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };


        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "rowIndex",
                displayName: $translate.instant('S.No')
            },
            {
                field: "Asset.AssetName",
                displayName: $translate.instant('Asset Code')
            },
            {
                field: "Asset.Description",
                displayName: $translate.instant('Asset Name')
            },
            {
                field: "Asset.AssetCategory.Description",
                displayName: $translate.instant('Asset Category')
            },
            {
                field: "Asset.AssetType.Description",
                displayName: $translate.instant('Asset Type')
            },
            {
                field: "Asset.ModelNum",
                displayName: $translate.instant('Model #')
            },
            {
                field: "WarrantyType.Description",
                displayName: $translate.instant('Warranty Type')
            },
            {
                field: "FromDate",
                displayName: $translate.instant('From Date'),
                cellTemplate: "<ngformatdate date-val='entity.FromDate'></ngformatdate>"
            },
            {
                field: "ToDate",
                displayName: $translate.instant('To Date'),
                cellTemplate: "<ngformatdate date-val='entity.ToDate'></ngformatdate>"
            },
            {
                field: "NoOfFreeServices",
                displayName: $translate.instant('Free Services')
            },
            {
                field: "NoOfPendingServices",
                displayName: $translate.instant('Pending Services')
            },
            {
                field: "CostValue",
                displayName: $translate.instant('Cost Value')
            },
            {
                field: "ReferenceNumber",
                displayName: $translate.instant('Reference Number')
            },
            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };
        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    WarrantyType: $scope.WarrantyType,
                    ActiveStatus: $scope.ActiveStatus,
                    AssetType: $scope.AssetType,
                },
                Params: [
                    {
                        Key: 1,
                        Value: $scope.currentfilter.WarrantyTypeId
                    },
                    {
                        Key: 10,
                        Value: From
                    },
                    {
                        Key: 11,
                        Value: To
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.ActiveStatusId
                    },
                    {
                        Key: 6,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 12,
                        Value: $scope.currentfilter.AssetTypeId
                    }
                ],
            };
            var options = {
                action: 'AssetManagement/Assetwarranty/PrintAssetwarrantyexpiryReport',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        //Timeout
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            // $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "WarrantyType"
            },
            {
                "Key": "ActiveStatus"
            },
            {
                "Key": "AssetType"
            },
            ];
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

    assetwarrantyexpiryreportController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', '$filter', 'utl', '$timeout'];

})();