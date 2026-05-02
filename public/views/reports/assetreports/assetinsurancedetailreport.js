(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('assetinsurancedetailreportController', assetinsurancedetailreportController);

    function assetinsurancedetailreportController($rootScope, $scope, $stateParams, $state, $translate, $filter, utl, $timeout) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));

        $scope.Items = [];
        $scope.currentfilter = {
            AssetTypeId: -1,
            AssetCategoryId: -1,
            ActiveStatusId: 2,
            DepartmentId: -1,
            EmployeeId: -1,
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
            const JsonFields = ["Code", "Name", "Category", "Type","Model No","Payer Name","IDV Value","Premium Amount","Start Date","End Date","Policy Type","Comments"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var code = '';
                var name = '';
                var category = '';
                var type = '';
                var modelNo='';
                var insurance='';
                var idvValue='';
                var premiumAmt='';
                var startDate='';
                var endDate='';
                var policyType='';
                var comments='';
                
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
                    modelNo = rowArray.Asset.ModelNum;
                }
                if (rowArray.InsuranceName) {
                    insurance = rowArray.InsuranceName;
                }
                if (rowArray.IDVValue) {
                    idvValue = rowArray.IDVValue;
                }
                if (rowArray.PremimumAmount) {
                    premiumAmt = rowArray.PremimumAmount;
                }
                if (rowArray.PeriodStart) {
                    startDate = rowArray.PeriodStart;
                }
                if (rowArray.PeriodEnd) {
                    endDate = rowArray.PeriodEnd;
                }
                if (rowArray.PolicyType.Description) {
                    policyType = rowArray.PolicyType.Description;
                }
                if (rowArray.Comments) {
                    comments = rowArray.Comments;
                }
                
                csvContent += code + ',' + name + ',' + category + ',' + type + ',' + modelNo + ',' + insurance + ',' + idvValue + ',' + premiumAmt + ',' + startDate + ',' + endDate + ',' + policyType + ',' + comments + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'assetinsurancedetail-report.csv';
            hiddenElement.click();
        
        };
        
        $scope.excelDownload = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                    Key: 3,
                    Value: $scope.currentfilter.AssetTypeId
                },
                {
                    Key: 6,
                    Value: $scope.currentfilter.AssetCategoryId
                },

                {
                    Key: 1,
                    Value: $scope.currentfilter.ActiveStatusId
                },
                {
                    Key: 7,
                    Value: $scope.currentfilter.FacilityId
                }
                ],
        
            };
            var options = {
                action: "AssetManagement/AssetInsurance/GetAssetInsurances",
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
            // if ($scope.currentfilter.ProjectId > 0) {
            //     if (res.Data.length > 0) {
            //         $scope.Project = res.Data[0].Project.ProjectName;
            //     } else {
            //         $scope.Project = '';
            //     }
            // }
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
                Params: [{
                    Key: 3,
                    Value: $scope.currentfilter.AssetTypeId
                },
                {
                    Key: 6,
                    Value: $scope.currentfilter.AssetCategoryId
                },
                // {
                //     Key: 2,
                //     Value: $scope.currentfilter.FromDate
                // },
                // {
                //     Key: 3,
                //     Value: $scope.currentfilter.ToDate
                // },
                {
                    Key: 1,
                    Value: $scope.currentfilter.ActiveStatusId
                },
                {
                    Key: 7,
                    Value: $scope.currentfilter.FacilityId
                }

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'AssetManagement/AssetInsurance/GetAssetInsurances',
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
                field: "InsuranceName",
                displayName: $translate.instant('Payer Name')
            },

            {
                field: "IDVValue",
                displayName: $translate.instant('IDV Value')
            },
            {
                field: "PremimumAmount",
                displayName: $translate.instant('Premimum Amount')
            },
            {
                field: "PeriodStart",
                displayName: $translate.instant('Period Start')
            },
            {
                field: "PeriodEnd",
                displayName: $translate.instant('Period End')
            },
            {
                field: "PolicyType.Description",
                displayName: $translate.instant('Policy Type')
            },
            {
                field: "Comments",
                displayName: $translate.instant('Comments')
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
                Params: [{
                    Key: 3,
                    Value: $scope.currentfilter.AssetTypeId
                },
                {
                    Key: 6,
                    Value: $scope.currentfilter.AssetCategoryId
                },
                // {
                //     Key: 2,
                //     Value: $scope.currentfilter.FromDate
                // },
                // {
                //     Key: 3,
                //     Value: $scope.currentfilter.ToDate
                // },
                {
                    Key: 1,
                    Value: $scope.currentfilter.ActiveStatusId
                },
                {
                    Key: 7,
                    Value: $scope.currentfilter.FacilityId
                }
                ],
            };
            var options = {
                action: 'AssetManagement/AssetInsurance/PrintAssetInsuranceReport',
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
                "Key": "AssetType"
            },
            {
                "Key": "AssetCategory"
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

    assetinsurancedetailreportController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', '$filter', 'utl', '$timeout'];

})();