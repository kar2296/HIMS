(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('assetaccessoriesreportController', assetaccessoriesreportController);

    function assetaccessoriesreportController($rootScope, $scope, $stateParams, $state, $translate, $filter, utl, $timeout) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));

        $scope.Items = [];
        $scope.currentfilter = {
            // AssetTypeId: parseInt(utl.Session.getCurrentTicketTypeId()),
            AssetTypeId: -1,
            AssetCategoryId: -1,
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            FacilityId: utl.Session.getCurrentFacilityId(),
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
            const JsonFields = ["Name", " Department", "Unique No", " Serial No", "Accessories Name", "Installed On", "WarrentyTo", "Description"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var name = '';
                var Dept = '';
                var uniqueNo = '';
                var serialNo = '';
                var accessories = '';
                var installed = '';
                var warrenty = '';
                var descript = '';

                if (rowArray.Asset.Description) {
                    name = rowArray.Asset.Description;
                }
                if (rowArray.Department) {
                    if (rowArray.Department.DepartmentName) {
                        Dept = rowArray.Department.DepartmentName;
                    }
                }
                if (rowArray.Asset.ShortCode) {
                    uniqueNo = rowArray.Asset.ShortCode;
                }
                if (rowArray.SerialNO) {
                    serialNo = rowArray.SerialNO;
                }
                if (rowArray.AccessoriesName) {
                    accessories = rowArray.AccessoriesName;
                }
                if (rowArray.InstalledOn) {
                    installed = rowArray.InstalledOn;
                }

                if (rowArray.WarrentyTo) {
                    warrenty = rowArray.WarrentyTo;
                }
                if (rowArray.Description) {
                    descript = rowArray.Description;
                }
                csvContent += name + ',' + Dept + ',' + uniqueNo + ',' + serialNo + ',' + accessories + ',' + installed + ',' + warrenty + ',' + descript + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'assetaccessories-report.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
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
                        Key: 4,
                        Value: $scope.currentfilter.AssetTypeId
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.AssetCategoryId
                    },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 1,
                        Value: $scope.currentfilter.AssetId
                    },
                ],

            };
            var options = {
                action: "AssetManagement/AssetAccessories/GetAssetAccessoriess",
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
            if ($scope.currentfilter.AssetTypeId > 0) {
                if (res.Data.length > 0) {
                    $scope.AssetType = res.Data[0].Asset.AssetType.Description;
                } else {
                    $scope.AssetType = '';
                }
            }
            if ($scope.currentfilter.AssetCategoryId > 0) {
                if (res.Data.length > 0) {
                    $scope.AssetCategory = res.Data[0].Asset.AssetCategory.Description;
                } else {
                    $scope.AssetCategory = '';
                }
            }
            if ($scope.currentfilter.AssetId > 0) {
                if (res.Data.length > 0) {
                    $scope.AssetName = res.Data[0].Asset.Description;
                } else {
                    $scope.AssetName = '';
                }
            }
            // if ($scope.currentfilter.FromDepartmentId > 0) {
            //     if (res.Data.length > 0) {
            //         $scope.DepartmentName = res.Data[0].FromDepartment.DepartmentName;
            //     } else {
            //         $scope.DepartmentName = '';
            //     }
            // }
            vm.gridConfig.data = [];

            for (var idx in res.Data) {
                var item = res.Data[idx];

                vm.gridConfig.data.push(item);
            }
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            // var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            // var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    // {
                    //     Key: 5,
                    //     Value: From
                    // },
                    // {
                    //     Key: 6,
                    //     Value: To
                    // },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.AssetTypeId
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.AssetCategoryId
                    },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 1,
                        Value: $scope.currentfilter.AssetId
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'AssetManagement/AssetAccessories/GetAssetAccessoriess',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };


        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "rowIndex", displayName: $translate.instant('S.No') },
                { field: "Asset.Description", displayName: $translate.instant('Asset Name') },
                { field: "Department.DepartmentName", displayName: $translate.instant('Department') },
                { field: "Asset.ShortCode", displayName: $translate.instant('Unique No') },
                { field: "SerialNO", displayName: $translate.instant('Serial NO') },
                { field: "AccessoriesName", displayName: $translate.instant('Accessories Name') },
                { field: "InstalledOn", displayName: $translate.instant('Installed On') },
                { field: "WarrentyTo", displayName: $translate.instant('WarrentyTo') },
                { field: "Description", displayName: $translate.instant('Description') },

            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };
        $scope.print = function () {
            // var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            // var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    // FromDate: From,
                    // ToDate: To,
                    FacilityId: $scope.currentfilter.FacilityId,
                    AssetType: $scope.AssetType,
                    AssetCategory: $scope.AssetCategory,
                    AssetName: $scope.AssetName,

                },
                Params: [
                    // {
                    //     Key: 5,
                    //     Value: From
                    // },
                    // {
                    //     Key: 6,
                    //     Value: To
                    // },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.AssetTypeId
                    },
                    {
                        Key: 3,
                        Value: $scope.currentfilter.AssetCategoryId
                    },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.FacilityId
                    },
                ],
            };
            var options = {
                action: 'AssetManagement/AssetAccessories/PrintAssetAccessoriesReport',
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
            var inputData = [
                {
                    "Key": "AssetType"
                },
                {
                    "Key": "AssetCategory"
                },

                {
                    "Key": "Asset", Request: {
                        Params: [{ Key: 4, Value: 2 },
                        { Key: 17, Value: [-1, utl.Session.getCurrentFacilityId()] }
                        ]
                    }
                },
                {
                    "Key": "ActiveStatus"
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

    assetaccessoriesreportController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', '$filter', 'utl', '$timeout'];

})();