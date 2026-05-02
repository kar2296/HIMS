(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('assettransferdetailreportController', assettransferdetailreportController);

    function assettransferdetailreportController($rootScope, $scope, $stateParams, $state, $translate, $filter, utl, $timeout) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));

        $scope.Items = [];
        $scope.currentfilter = {
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            // AssetTypeId: parseInt(utl.Session.getCurrentTicketTypeId()),
            AssetTypeId: -1,
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
            const JsonFields = ["Ref No", "Date", "From Dept", "To Dept", "Type", "Name", "Serial No", "Transfered By", "Comments"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var refNo = '';
                var date = '';
                var fromDept = '';
                var toDept = '';
                var type = '';
                var name = '';
                var serialNo = '';
                var transfer = '';
                var comments = '';

                // if (rowArray.EmployeeCode) {
                //     refNo = rowArray.EmployeeCode;
                // }
                if (rowArray.TransferedDate) {
                    date = rowArray.TransferedDate;
                }
                if (rowArray.FromDepartment.DepartmentName) {
                    fromDept = rowArray.FromDepartment.DepartmentName;
                }
                if (rowArray.ToDepartment.DepartmentName) {
                    toDept = rowArray.ToDepartment.DepartmentName;
                }

                if (rowArray.Asset.AssetType.Description) {
                    type = rowArray.Asset.AssetType.Description;
                }

                if (rowArray.AssetName) {
                    name = rowArray.AssetName;
                }
                if (rowArray.Asset.Serial) {
                    serialNo = rowArray.Asset.Serial;
                }
                if (rowArray.Asset.AssetType) {
                    if (rowArray.TransferedUser.Title) {
                        transfer = rowArray.TransferedUser.Title.Description;
                    }
                }
                if (rowArray.TransferedUser.FirstName) {
                    transfer += ' ' + rowArray.TransferedUser.FirstName;
                }
                if (rowArray.TransferedUser.LastName) {
                    transfer += ' ' + rowArray.TransferedUser.LastName;
                }

                if (rowArray.Comments) {
                    comments = rowArray.Comments;
                }


                csvContent += refNo + ',' + date + ',' + fromDept + ',' + toDept + ',' + type + ',' + name + ',' + serialNo + ',' + transfer + ',' + comments + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'employees-report.csv';
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
            // if ($scope.currentfilter.AssetCategoryId > 0) {
            //     if (res.Data.length > 0) {
            //         $scope.AssetCategory = res.Data[0].Asset.AssetCategory.Description;
            //     } else {
            //         $scope.AssetCategory = '';
            //     }
            // }
            // // if ($scope.currentfilter.ProjectId > 0) {
            // //     if (res.Data.length > 0) {
            // //         $scope.Project = res.Data[0].Project.ProjectName;
            // //     } else {
            // //         $scope.Project = '';
            // //     }
            // // }
            // if ($scope.currentfilter.ActiveStatusId > 0) {
            //     if (res.Data.length > 0) {
            //         $scope.ActiveStatus = res.Data[0].ActiveStatus.Description;
            //     } else {
            //         $scope.ActiveStatus = '';
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
                    {
                        Key: 8,
                        Value: From
                    },
                    {
                        Key: 9,
                        Value: To
                    },
                    {
                        Key: 6,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 13,
                        Value: $scope.currentfilter.AssetTypeId
                    }

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
                {
                    field: "rowIndex",
                    displayName: $translate.instant('S.No')
                },
                {
                    field: " ",
                    displayName: $translate.instant('Refno')
                },
                {
                    field: "TransferedDate",
                    displayName: $translate.instant('Transfered Date'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.TransferedDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.TransferedDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "FromDepartment.DepartmentName",
                    displayName: $translate.instant('From Department')
                },
                {
                    field: "ToDepartment.DepartmentName",
                    displayName: $translate.instant('To Department')
                },
                {
                    field: "Asset.AssetType.Description",
                    displayName: $translate.instant('Asset Type')
                },
                {
                    field: "AssetName",
                    displayName: $translate.instant('Asset Name')
                },
                {
                    field: "Asset.Serial",
                    displayName: $translate.instant('Serial')
                },
                {
                    field: "FirstName",
                    displayName: $translate.instant('Transfered By'),
                    cellTemplate: '<div class="ui-grid-cell-contents"> {{entity.TransferedUser.Title.Description}} {{entity.TransferedUser.FirstName}} {{entity.TransferedUser.LastName}}</div>'

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
                    FromDate: From,
                    ToDate: To,
                    Department: $scope.Department,
                    ActiveStatus: $scope.ActiveStatus,
                    FacilityId: $scope.currentfilter.FacilityId,
                    AssetType: $scope.AssetType
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
                        Key: 6,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 13,
                        Value: $scope.currentfilter.AssetTypeId
                    }
                ],
            };
            var options = {
                action: 'AssetManagement/AssetTransfer/PrintAssetTransferReport',
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

    assettransferdetailreportController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', '$filter', 'utl', '$timeout'];

})();