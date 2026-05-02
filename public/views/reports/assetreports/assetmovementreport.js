(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('assetmovementreportController', assetmovementreportController);

    function assetmovementreportController($rootScope, $scope, $stateParams, $state, $translate, $filter, utl, $timeout) {
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
            const JsonFields = ["Name", " From Department", "Unique", " Serial No", "To Department", "To Facility", "TransferedBy", "ApprovedBy"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var name = '';
                var fromDept = '';
                var unique = '';
                var serialNo = '';
                var toDept = '';
                var Tofacility = '';
                var transfer = '';
                var approved = '';

                if (rowArray.Asset.Description) {
                    name = rowArray.Asset.Description;
                }
                if (rowArray.FromDepartment.DepartmentName) {
                    fromDept = rowArray.FromDepartment.DepartmentName;
                }
                if (rowArray.Asset.ShortCode) {
                    unique = rowArray.Asset.ShortCode;
                }
                if (rowArray.Asset.Serial) {
                    serialNo = rowArray.Asset.Serial;
                }
                if (rowArray.ToDepartment.DepartmentName) {
                    toDept = rowArray.ToDepartment.DepartmentName;
                }
                if (rowArray.ToFacility.FacilityName) {
                    Tofacility = rowArray.ToFacility.FacilityName;
                }

                if (rowArray.TransferedUser.Title) {
                    transfer = rowArray.TransferedUser.Title.Description;
                }
                if (rowArray.TransferedUser.FirstName) {
                    transfer += ' ' + rowArray.TransferedUser.FirstName;
                }
                if (rowArray.TransferedUser.LastName) {
                    transfer += ' ' + rowArray.TransferedUser.LastName;
                }
                if (rowArray.ApprovedUser) {
                    if (rowArray.ApprovedUser.Title) {
                        approved = rowArray.ApprovedUser.Title.Description;
                    }
                    if (rowArray.ApprovedUser) {
                        approved += ' ' + rowArray.ApprovedUser.FirstName;
                    }
                    if (rowArray.ApprovedUser) {
                        approved += ' ' + rowArray.ApprovedUser.LastName;
                    }
                }
                csvContent += name + ',' + fromDept + ',' + unique + ',' + serialNo + ',' + toDept + ',' + Tofacility + ',' + transfer + ',' + approved + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'assetmovement-report.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
                        Key: 8,
                        Value: From
                    },
                    {
                        Key: 9,
                        Value: To
                    },
                    {
                        Key: 13,
                        Value: $scope.currentfilter.AssetTypeId
                    },
                    {
                        Key: 12,
                        Value: $scope.currentfilter.AssetCategoryId
                    },
                    {
                        Key: 6,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 1,
                        Value: $scope.currentfilter.FromDepartmentId
                    }
                ],

            };
            var options = {
                action: "AssetManagement/AssetTransfer/GetAssetTransfers",
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
            if ($scope.currentfilter.FromDepartmentId > 0) {
                if (res.Data.length > 0) {
                    $scope.DepartmentName = res.Data[0].FromDepartment.DepartmentName;
                } else {
                    $scope.DepartmentName = '';
                }
            }
            if ($scope.currentfilter.AssetId > 0) {
                if (res.Data.length > 0) {
                    $scope.AssetName = res.Data[0].Asset.Description;
                } else {
                    $scope.AssetName = '';
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
                        Key: 8,
                        Value: From
                    },
                    {
                        Key: 9,
                        Value: To
                    },
                    {
                        Key: 13,
                        Value: $scope.currentfilter.AssetTypeId
                    },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.AssetId
                    },
                    {
                        Key: 12,
                        Value: $scope.currentfilter.AssetCategoryId
                    },
                    {
                        Key: 6,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 1,
                        Value: $scope.currentfilter.FromDepartmentId
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'AssetManagement/AssetTransfer/GetAssetTransfers',
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
                { field: "FromDepartment.DepartmentName", displayName: $translate.instant('From Department') },
                { field: "Asset.ShortCode", displayName: $translate.instant('Unique') },
                { field: "Asset.Serial", displayName: $translate.instant('Serial') },
                { field: "ToDepartment.DepartmentName", displayName: $translate.instant('To Department') },
                { field: "ToFacility.FacilityName", displayName: $translate.instant('To Facility') },

                {
                    field: "FirstName",
                    displayName: $translate.instant('TransferedBy'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                    <span ng-if='entity.Title && entity.TransferedUser.Title.Description'>{{entity.TransferedUser.Title.Description}}&nbsp;</span>\
                    <span>{{entity.TransferedUser.FirstName}}</span>&nbsp;<span>{{entity.TransferedUser.LastName}}</span>\
                     </div>"
                },
                {
                    field: "FirstName",
                    displayName: $translate.instant('ApprovedBy'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                    <span ng-if='entity.Title && entity.ApprovedUser.Title.Description'>{{entity.ApprovedUser.Title.Description}}&nbsp;</span>\
                    <span>{{entity.ApprovedUser.FirstName}}</span>&nbsp;<span>{{entity.ApprovedUser.LastName}}</span>\
                     </div>"
                },
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };
        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: $scope.currentfilter.FacilityId,
                    AssetType: $scope.AssetType,
                    AssetCategory: $scope.AssetCategory,
                    DepartmentName: $scope.DepartmentName,
                    AssetName: $scope.AssetName,
                },
                Params: [
                    {
                        Key: 8,
                        Value: From
                    },
                    {
                        Key: 9,
                        Value: To
                    },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.AssetId
                    },
                    {
                        Key: 13,
                        Value: $scope.currentfilter.AssetTypeId
                    },
                    {
                        Key: 12,
                        Value: $scope.currentfilter.AssetCategoryId
                    },
                    {
                        Key: 6,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 1,
                        Value: $scope.currentfilter.FromDepartmentId
                    },
                ],
            };
            var options = {
                action: 'AssetManagement/AssetTransfer/PrintAssetMovementReport',
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
                    "Key": "FromDepartment", Request: {
                        Params: [{ Key: 4, Value: 2 },
                        { Key: 7, Value: [-1, utl.Session.getCurrentFacilityId()] }
                        ]
                    }
                },
                {
                    "Key": "ActiveStatus"
                },
                {
                    "Key": "Asset", Request: {
                        Params: [{ Key: 4, Value: 2 },
                        { Key: 17, Value: [-1, utl.Session.getCurrentFacilityId()] }
                        ]
                    }
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

    assetmovementreportController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', '$filter', 'utl', '$timeout'];

})();