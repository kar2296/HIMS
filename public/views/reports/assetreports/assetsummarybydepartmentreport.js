(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('assetsummarybydepartmentreportController', assetsummarybydepartmentreportController);

    function assetsummarybydepartmentreportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = { 
            AssetCategoryId: -1,
            FacilityId: utl.Session.getCurrentFacilityId(),
            DepartmentId: -1,
            AssetTypeId: -1,
            // AssetTypeId: parseInt(utl.Session.getCurrentTicketTypeId()),

        };
        $scope.lookup = {};
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
     
    $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
        const JsonFields = ["Department", "Asset Name", "Count"]
        let csvContent = JsonFields.join(",") + "\n";
        data.Data.forEach(function (rowArray) {
    
            var dept = '';
            var assetName='';
            var count='';

            if (rowArray.Department.DepartmentName) {
                dept = rowArray.Department.DepartmentName;
            }
            if (rowArray.AssetName) {
                assetName = rowArray.AssetName;
            }
            if (rowArray.Status) {
                count = rowArray.Status;
            }
            csvContent += dept + ',' + assetName + ',' + count + "\n";
        });
        var encodedUri = encodeURI(csvContent);
        var hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
        hiddenElement.target = '_blank';
        hiddenElement.download = 'assetsummarybydepartment-report.csv';
        hiddenElement.click();
    
    };
    
    $scope.excelDownload = function () {
    var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                    Key: 1,
                    Value: $scope.currentfilter.AssetTypeId
                },
                {
                    Key: 2,
                    Value: $scope.currentfilter.AssetCategoryId
                },
                {
                    Key: 3,
                    Value: $scope.currentfilter.DepartmentId
                },
                {
                    Key: 17,
                    Value: $scope.currentfilter.FacilityId
                }
            ],
    
        };
        var options = {
            action: "AssetManagement/Asset/GetAssets",
            data: inputData,
            type: "post",
            onComplete: $scope.excelDownloadCallbackExcel,
        };
        utl.Http.doAction(options);
    };




        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.AssetsummarybyDep = [];
            var GroupedBatchData = _.groupBy(res.Data, 'DepartmentId')
            if ($scope.currentfilter.AssetTypeId > 0) {
                if (res.Data.length > 0) {
                    $scope.AssetType = res.Data[0].AssetType.Description;
                } else {
                    $scope.AssetType = '';
                }
            }
            if ($scope.currentfilter.AssetCategoryId > 0) {
                if (res.Data.length > 0) {
                    $scope.AssetCategory = res.Data[0].AssetCategory.Description;
                } else {
                    $scope.AssetCategory = '';
                }
            }
            if ($scope.currentfilter.DepartmentId > 0) {
                if (res.Data.length > 0) {
                    $scope.Department = res.Data[0].Department.DepartmentName;
                } else {
                    $scope.Department = '';
                }
            } 
            for (var jdx in GroupedBatchData) {
                var batchdata = GroupedBatchData[jdx];
                var Department = '';
                var AssetName = 0;
                var Count = 0;
                for (var cdx in batchdata) {
                    var assetInfo = batchdata[cdx];
                    Count = 1;
                    Department = assetInfo.Department.DepartmentName;
                    AssetName = assetInfo.AssetName;
                    var valappend = 0;
                    // }
                    // if ($scope.AssetsummarybyDep.length > 0) {
                    //     $scope.AssetsummarybyDep.forEach(function (item) {
                    //         if (Department == item.Department) {
                    //             item.Count = DirectCount;
                    //             item.OnlineCount = OnlineCount;
                    //             valappend = 1;
                    //         }
                    //     });
                    // }
                    // if (valappend == 0) {
                    $scope.AssetsummarybyDep.push({
                        'Department': Department,
                        'AssetName': AssetName,
                        'Count': Count,
                    })
                }
            }

            var TotCount = 0;
            for (var jdx in $scope.AssetsummarybyDep) {
                var netcal = $scope.AssetsummarybyDep[jdx];
                TotCount = TotCount + (netcal.Count || 0);

            }
            $scope.TotCount = TotCount;
        };

        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                    Key: 1,
                    Value: $scope.currentfilter.AssetTypeId
                },
                {
                    Key: 2,
                    Value: $scope.currentfilter.AssetCategoryId
                },
                {
                    Key: 3,
                    Value: $scope.currentfilter.DepartmentId
                },
                {
                    Key: 17,
                    Value: $scope.currentfilter.FacilityId
                },
                ],
            };

            var options = {
                action: 'AssetManagement/Asset/GetAssets',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.currentfilter.CreatedBy = -1
                $scope.getList();
            }
        };
        $scope.backtoReport = function () {
            $state.go('app.assetreports');
        };
        $scope.openFilterTab = function () {
            if ($scope.currentfilter.showFilterTab === true) {
                $scope.currentfilter.showFilterTab = false;
            } else {
                $scope.currentfilter.showFilterTab = true;
            }
        }
        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    AssetType: $scope.AssetType,
                    AssetCategory: $scope.AssetCategory,
                    Department: $scope.Department,
                },
                Params: [{
                    Key: 1,
                    Value: $scope.currentfilter.AssetTypeId
                },
                {
                    Key: 2,
                    Value: $scope.currentfilter.AssetCategoryId
                },
                {
                    Key: 3,
                    Value: $scope.currentfilter.DepartmentId
                },
                {
                    Key: 17,
                    Value: $scope.currentfilter.FacilityId
                },
                ],
            };
            var options = {
                action: 'AssetManagement/Asset/PrintAssetsummarybyDepartmentReport',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.currentfilter.StoreMasterId === 0) {
                    $scope.currentfilter.StoreMasterId = value[0].Id;
                    $scope.currentfilter.StoreMaster = value[0].Text;
                }
            });
            // $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "AssetType"
            },
            {
                "Key": "AssetCategory"
            },
            // {
            //     "Key": "Department",
            //     Request: {
            //         Params: [
            //             {
            //                 Key: 5,
            //                 Value: 2
            //             },
            //             {
            //                 Key: 17,
            //                 Value: curdeptids
            //             }, // Institution dept filter
            //         ]
            //     }
            // },
            {
                "Key": "Department",
                Request: {
                    Params: [{ Key: 4, Value: 2 },
                    { Key: 6, Value: [-1, utl.Session.getCurrentFacilityId()] }]
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

    assetsummarybydepartmentreportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();