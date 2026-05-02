(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('assetmaintenancereportController', assetmaintenancereportController);

    function assetmaintenancereportController($rootScope, $scope, $stateParams, $state, $translate, $filter, utl, $timeout) {
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
            const JsonFields = ["Code", "Name", "Category", "Type","Model Name","Event Date","Event Description","Maintenance Date","Performed By","Cost Value "]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var code = '';
                var name = '';
                var category = '';
                var type = '';
                var modelName='';
                var eventdate='';
                var eventDescripe='';
                var maintDate='';
                var PerformedBy='';
                var costValue='';
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
                if (rowArray.Asset.ModelName) {
                    modelName = rowArray.Asset.ModelName;
                }
                if (rowArray.EventDate) {
                    eventdate = rowArray.EventDate;
                }
                if (rowArray.EventDescription) {
                    eventDescripe = rowArray.EventDescription;
                }
                if (rowArray.MaintananceDate) {
                    maintDate = rowArray.MaintananceDate;
                }
                if (rowArray.PerformedBy) {
                    PerformedBy = rowArray.PerformedBy;
                }
                if (rowArray.Cost) {
                    costValue = rowArray.Cost;
                }
              
                csvContent += code + ',' + name + ',' + category + ',' + type + ',' + modelName + ',' + eventdate + ',' + eventDescripe + ',' + maintDate + ',' + PerformedBy + ',' + costValue + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'assetmaintenance-report.csv';
            hiddenElement.click();
        
        };
        
        $scope.excelDownload = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
                        Key: 4,
                        Value: From
                    },
                    {
                        Key: 5,
                        Value: To
                    }
                ],
        
            };
            var options = {
                action: "AssetManagement/AssetMaintanance/GetAssetMaintanances",
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

            // if ($scope.currentfilter.ProjectId > 0) {
            //     if (res.Data.length > 0) {
            //         $scope.Project = res.Data[0].Project.ProjectName;
            //     } else {
            //         $scope.Project = '';
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
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    // {
                    //     Key: 1,
                    //     Value: $scope.currentfilter.WarrantyTypeId
                    // },
                    {
                        Key: 4,
                        Value: From
                    },
                    {
                        Key: 5,
                        Value: To
                    },
                    // {
                    //     Key: 4,
                    //     Value: $scope.currentfilter.ActiveStatusId
                    // },
                    // {
                    //     Key: 2,
                    //     Value: $scope.currentfilter.FacilityId
                    // }

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'AssetManagement/AssetMaintanance/GetAssetMaintanances',
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
                field: "Asset.ModelName",
                displayName: $translate.instant('Model Name')
            },
            {
                field: "EventDate",
                displayName: $translate.instant('Event Date'),
                cellTemplate: "<ngformatdate date-val='entity.EventDate'></ngformatdate>"
            },
            {
                field: "EventDescription",
                displayName: $translate.instant('Event Description')
            },

            {
                field: "MaintananceDate",
                displayName: $translate.instant('Maintanance Date'),
                cellTemplate: "<ngformatdate date-val='entity.MaintananceDate'></ngformatdate>"
            },
            {
                field: "PerformedBy",
                displayName: $translate.instant('Performed By')
            },
            {
                field: "Cost",
                displayName: $translate.instant('Cost')
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
                    AssetType: $scope.AssetType,
                    AssetCategory: $scope.AssetCategory,
                    Department: $scope.Department,
                    ActiveStatus: $scope.ActiveStatus,
                },
                Params: [
                    {
                        Key: 4,
                        Value: From
                    },
                    {
                        Key: 5,
                        Value: To
                    },
                ],
            };
            var options = {
                action: 'AssetManagement/AssetMaintanance/PrintAssetmaintenanceReport',
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

    assetmaintenancereportController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', '$filter', 'utl', '$timeout'];

})();