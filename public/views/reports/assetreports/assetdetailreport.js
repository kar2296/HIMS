(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('assetdetailreportController', assetdetailreportController);

    function assetdetailreportController($rootScope, $scope, $stateParams, $state, $translate, $filter, utl, $timeout) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));

        $scope.Items = [];
        $scope.currentfilter = {
            // AssetTypeId: parseInt(utl.Session.getCurrentTicketTypeId()),
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
            const JsonFields = ["Code", "Name", "Category", "Type", "Model No", "Manufacturer Name", "Serial No", "PO Date",
                "Supplier", "Purchase Value", "Current Value", "Installed On", "Installed Person", "CreatedAt", "DepartmentName",
                "Description", "address", "DateOfJoining", "Mobile", "ModelName", "EmployeeCode",]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var code = '';
                var name = '';
                var category = '';
                var type = '';
                var modelNo = '';
                var manufacturer = '';
                var serialNo = '';
                var poDate = '';
                var supplier = '';
                var purchasevalue = '';
                var currentvalue = '';
                var installOn = '';
                var installPerson = '';
                var EmployeeCode = '';
                var CreatedAt = '';
                var DepartmentName = '';
                var Description = '';
                var address = '';
                var DateOfJoining = '';
                var Mobile = '';
                var ModelName = '';
                // var ShortCode = '';


                if (rowArray.AssetName) {
                    code = rowArray.AssetName;
                }
                if (rowArray.Description) {
                    name = rowArray.Description;
                }
                if (rowArray.AssetCategory) {
                    if (rowArray.AssetCategory.Description) {
                        category = rowArray.AssetCategory.Description;
                    }
                }
                if (rowArray.AssetType.Description) {
                    type = rowArray.AssetType.Description;
                }
                if (rowArray.ModelNum) {
                    modelNo = rowArray.ModelNum;
                }
                if (rowArray.Manufacturer) {
                    manufacturer = rowArray.Manufacturer;
                }
                if (rowArray.Serial) {
                    serialNo = rowArray.Serial;
                }
                if (rowArray.PO) {
                    poDate = rowArray.PO;
                }
                if (rowArray.VendorMaster) {
                    if (rowArray.VendorMaster.VendorName) {
                        supplier = rowArray.VendorMaster.VendorName;
                    }
                }
                if (rowArray.PurchaseValue) {
                    purchasevalue = rowArray.PurchaseValue;
                }
                if (rowArray.CurrentValue) {
                    currentvalue = rowArray.CurrentValue;
                }
                if (rowArray.InstalledOn) {
                    installOn = rowArray.InstalledOn;
                }
                if (rowArray.InstalledBy) {
                    installPerson = rowArray.InstalledBy;
                }
                if (rowArray.EmployeeUser) {
                    EmployeeCode = rowArray.EmployeeUser.EmployeeCode;
                }
                // if (rowArray.ShortCode) {
                //     ShortCode = rowArray.ShortCode;
                // }
                if (rowArray.CreatedAt) {
                    CreatedAt = rowArray.CreatedAt;
                }
                if (rowArray.Department.DepartmentName) {
                    DepartmentName = rowArray.Department.DepartmentName;
                }
                if (rowArray.Description) {
                    Description = rowArray.Description;
                }
                if (rowArray.EmployeeUser) {
                    if (rowArray.EmployeeUser.AddressLine1) {
                        address = rowArray.EmployeeUser.AddressLine1;
                    }
                    if (rowArray.EmployeeUser.AddressLine2) {
                        address += ' ' + rowArray.EmployeeUser.AddressLine2;
                    }
                    if (rowArray.AddressLine3) {
                        address += ' ' + rowArray.EmployeeUser.AddressLine3;
                    }
                }
                if (rowArray.DateOfJoining) {
                    DateOfJoining = rowArray.DateOfJoining;
                }
                if (rowArray.EmployeeUser) {
                    Mobile = rowArray.EmployeeUser.Mobile;
                }
                if (rowArray.ModelName) {
                    ModelName = rowArray.ModelName;
                }
                csvContent += code + ',' + name + ',' + category + ',' + type + ',' + modelNo + ',' + manufacturer + ',' + serialNo + ',' + poDate + ',' + supplier + ',' + purchasevalue + ',' + currentvalue + ',' + installOn + ',' + installPerson + ',' + CreatedAt + ',' + DepartmentName + ',' + Description + ',' + address + ',' + DateOfJoining + ',' + Mobile + ',' + ModelName + ',' + EmployeeCode + ',' + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'assetdetail-report.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            var inputData = {
                Params: [
                    {
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
                        Key: 4,
                        Value: $scope.currentfilter.ActiveStatusId
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
            angular.forEach(res.Data, function (data, index) {
                res.Data[index].rowIndex = index + 1;
            })
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
            // var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            // var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
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
                        Key: 4,
                        Value: $scope.currentfilter.ActiveStatusId
                    },
                    {
                        Key: 17,
                        Value: $scope.currentfilter.FacilityId
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'AssetManagement/Asset/GetAssets',
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
                { field: "AssetName", displayName: $translate.instant('Asset Code') },
                { field: "Description", displayName: $translate.instant('Asset Name') },
                { field: "AssetCategory.Description", displayName: $translate.instant('Category') },
                { field: "AssetType.Description", displayName: $translate.instant('Asset Type') },
                { field: "ModelNum", displayName: $translate.instant('Model #') },
                { field: "Manufacturer", displayName: $translate.instant('Manufacturer') },

                { field: "Serial", displayName: $translate.instant('Serial') },
                {
                    field: "PO",
                    displayName: $translate.instant('PO Date'),
                    cellTemplate: "<ngformatdate date-val='entity.PO'></ngformatdate>"
                },
                { field: "VendorMaster.VendorName", displayName: $translate.instant('Vendor Name') },
                { field: "PurchaseValue", displayName: $translate.instant('Purchase Value') },
                { field: "CurrentValue", displayName: $translate.instant('Current Value') },
                { field: "InstalledOn", displayName: $translate.instant('Installed On') },
                { field: "InstalledBy", displayName: $translate.instant('Installed By') },
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
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
                        Key: 4,
                        Value: $scope.currentfilter.ActiveStatusId
                    },
                    {
                        Key: 17,
                        Value: $scope.currentfilter.FacilityId
                    },
                ],
            };
            var options = {
                action: 'AssetManagement/Asset/PrintAssetDetailReport',
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

    assetdetailreportController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', '$filter', 'utl', '$timeout'];

})();