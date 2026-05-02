(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('assetreconcilereportController', assetreconcilereportController);

    function assetreconcilereportController($rootScope, $scope, $stateParams, $state, $translate, $filter, utl, $timeout) {
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
            const JsonFields = ["Code", "Name", "Serial No", "Department", "Type", "Audit On", "Model No", "Manufacturer Name", "Audit Qty", "Expected Qty", "Reconcile Qty", "Updated"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var code = '';
                var name = '';
                var serialNo = '';
                var dept = '';
                var type = '';
                var Audit = '';
                var modelNo = '';
                var manufacture = '';
                var auditQty = '';
                var expectedQty = '';
                var reconcileQty = '';
                var update = '';

                if (rowArray.AssetName) {
                    code = rowArray.AssetName;
                }
                if (rowArray.Asset.Description) {
                    name = rowArray.Asset.Description;
                }
                if (rowArray.Serial) {
                    serialNo = rowArray.Serial;
                }
                if (rowArray.Department.DepartmentName) {
                    dept = rowArray.Department.DepartmentName;
                }
                if (rowArray.AssetTypeId) {
                    type = rowArray.AssetTypeId;
                }
                if (rowArray.StartDate) {
                    Audit = rowArray.StartDate;
                }
                if (rowArray.ModelNum) {
                    modelNo = rowArray.ModelNum;
                }
                if (rowArray.Manufacturer) {
                    manufacture = rowArray.Manufacturer;
                }
                if (rowArray.Quantity) {
                    auditQty = rowArray.Quantity;
                }
                if (rowArray.ExpectedQuantity) {
                    expectedQty = rowArray.ExpectedQuantity;
                }
                if (rowArray.ReconcileQuantity) {
                    reconcileQty = rowArray.ReconcileQuantity;
                }
                if (rowArray.UpdatedUser.Title) {
                    if (rowArray.UpdatedUser.Title.Description) {
                        update = rowArray.UpdatedUser.Title.Description;
                    }
                    if (rowArray.UpdatedUser.FirstName) {
                        update += ' ' + rowArray.UpdatedUser.FirstName;
                    }
                    if (rowArray.UpdatedUser.LastName) {
                        update += ' ' + rowArray.UpdatedUser.LastName;
                    }
                }

                csvContent += code + ',' + name + ',' + serialNo + ',' + dept + ',' + type + ',' + Audit + ',' + modelNo + ',' + manufacture + ',' + auditQty + ',' + expectedQty + ',' + reconcileQty + ',' + update + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'assetreconcile-report.csv';
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
                        Key: 10,
                        Value: $scope.currentfilter.AssetTypeId
                    },
                    {
                        Key: 9,
                        Value: $scope.currentfilter.AssetCategoryId
                    },
                    {
                        Key: 8,
                        Value: $scope.currentfilter.FacilityId
                    }
                ],

            };
            var options = {
                action: "AssetManagement/AssetAuditDetail/GetAssetAuditDetails",
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
                    $scope.AssetType = res.Data[0].AssetTypeId;
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
                        Key: 5,
                        Value: From
                    },
                    {
                        Key: 6,
                        Value: To
                    },
                    {
                        Key: 10,
                        Value: $scope.currentfilter.AssetTypeId
                    },
                    {
                        Key: 9,
                        Value: $scope.currentfilter.AssetCategoryId
                    },
                    {
                        Key: 8,
                        Value: $scope.currentfilter.FacilityId
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'AssetManagement/AssetAuditDetail/GetAssetAuditDetails',
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
                { field: "Asset.Description", displayName: $translate.instant('Asset Name') },
                { field: "Serial", displayName: $translate.instant('Serial') },
                { field: "Department.DepartmentName", displayName: $translate.instant('Department') },
                { field: "AssetTypeId", displayName: $translate.instant('Asset Type') },
                {
                    field: "StartDate",
                    displayName: $translate.instant('Audit On'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.StartDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.StartDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                { field: "ModelNum", displayName: $translate.instant('Model Num') },
                { field: "Manufacturer", displayName: $translate.instant('Manufacturer') },
                { field: "Quantity", displayName: $translate.instant('Audit Qty') },
                { field: "ExpectedQuantity", displayName: $translate.instant('Expected Qty') },
                { field: "ReconcileQuantity", displayName: $translate.instant('Reconcile Qty') },
                {
                    field: "FirstName",
                    displayName: $translate.instant('Updated'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                    <span ng-if='entity.Title && entity.UpdatedUser.Title.Description'>{{entity.UpdatedUser.Title.Description}}&nbsp;</span>\
                    <span>{{entity.UpdatedUser.FirstName}}</span>&nbsp;<span>{{entity.UpdatedUser.LastName}}</span>\
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
                },
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
                        Key: 10,
                        Value: $scope.currentfilter.AssetTypeId
                    },
                    {
                        Key: 9,
                        Value: $scope.currentfilter.AssetCategoryId
                    },
                    {
                        Key: 8,
                        Value: $scope.currentfilter.FacilityId
                    },
                ],
            };
            var options = {
                action: 'AssetManagement/AssetAuditDetail/PrintAssetReconcileReport',
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
                    "Key": "Department"
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

    assetreconcilereportController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', '$filter', 'utl', '$timeout'];

})();