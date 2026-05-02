(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('newassetrequestreportController', newassetrequestreportController);

    function newassetrequestreportController($rootScope, $scope, $stateParams, $state, $translate, $filter, utl, $timeout) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));

        $scope.Items = [];
        $scope.currentfilter = {
            DepartmentId: -1,
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            FacilityId: utl.Session.getCurrentFacilityId(),
            AssetRequestStatusId: -1
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
            const JsonFields = ["Request Date", "Name", "Manufacturer", "Preferred Supplier", "Approximate Value", "Requested", "Department Name", "Request Date", "Approved", "Description"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var requestDate = '';
                var name = '';
                var manufacturer = '';
                var preferred = '';
                var approximate = '';
                var requested = '';
                var deptName = '';
                var reqDate = '';
                var approved = '';
                var discript = '';

                if (rowArray.RequestedDate) {
                    requestDate = rowArray.RequestedDate;
                }
                if (rowArray.AssetName) {
                    name = rowArray.AssetName;
                }

                if (rowArray.Manufacturer) {
                    manufacturer = rowArray.Manufacturer;
                }
                if (rowArray.PreferredSupplier) {
                    preferred = rowArray.PreferredSupplier;
                }
                if (rowArray.ApproximateValue) {
                    approximate = rowArray.ApproximateValue;
                }
                if (rowArray.RequestedUser) {
                    if (rowArray.RequestedUser.Title) {
                        requested = rowArray.RequestedUser.Title.Description;
                    }
                    if (rowArray.RequestedUser.FirstName) {
                        requested += ' ' + rowArray.RequestedUser.FirstName;
                    }
                    if (rowArray.RequestedUser.LastName) {
                        requested += ' ' + rowArray.RequestedUser.LastName;
                    }
                }
                if (rowArray.Department.DepartmentName) {
                    deptName = rowArray.Department.DepartmentName;
                }
                if (rowArray.ApprovedDate) {
                    reqDate = rowArray.ApprovedDate;
                }
                if (rowArray.ApprovedUser) {
                    if (rowArray.ApprovedUser) {
                        approved = rowArray.ApprovedUser.Title.Description;
                    }
                    if (rowArray.ApprovedUser.FirstName) {
                        approved += ' ' + rowArray.ApprovedUser.FirstName;
                    }
                    if (rowArray.ApprovedUser.LastName) {
                        approved += ' ' + rowArray.ApprovedUser.LastName;
                    }
                }
                // if (rowArray.DispatchedType) {
                if (rowArray.Description) {
                    discript = rowArray.Description;
                }
                // }

                csvContent += requestDate + ',' + name + ',' + manufacturer + ',' + preferred + ',' + approximate + ',' + requested + ',' + deptName + ',' + reqDate + ',' + approved + ',' + discript + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'assetgatepass-report.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
                        Key: 6,
                        Value: From
                    },
                    {
                        Key: 7,
                        Value: To
                    },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.DepartmentId
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.AssetRequestStatusId
                    },
                    {
                        Key: 8,
                        Value: $scope.currentfilter.FacilityId
                    }
                ],

            };
            var options = {
                action: "AssetManagement/NewAssetRequest/GetNewAssetRequests",
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
            if ($scope.currentfilter.DepartmentId > 0) {
                if (res.Data.length > 0) {
                    $scope.Department = res.Data[0].Department.DepartmentName;
                } else {
                    $scope.Department = '';
                }
            }
            if ($scope.currentfilter.AssetRequestStatusId > 0) {
                if (res.Data.length > 0) {
                    $scope.AssetRequestStatus = res.Data[0].AssetRequestStatus.Description;
                } else {
                    $scope.AssetRequestStatus = '';
                }
            }
            vm.gridConfig.data = [];

            for (var idx in res.Data) {
                var item = res.Data[idx];

                vm.gridConfig.data.push(item);
            }
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };
        $scope.handleEvents = function (actionType, entity, index) {
            if (actionType == 'employeeinfo') {
                utl.Modal.open("app.empprofile", {
                    params: {
                        eid: entity.EmployeeId, Type: actionType
                    },
                });
            }
        }

        $scope.getList = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
                        Key: 6,
                        Value: From
                    },
                    {
                        Key: 7,
                        Value: To
                    },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.DepartmentId
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.AssetRequestStatusId
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
                action: 'AssetManagement/NewAssetRequest/GetNewAssetRequests',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };


        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "rowIndex", displayName: $translate.instant('S.No.') },
                {
                    field: "RequestedDate",
                    displayName: $translate.instant('Request Date'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.RequestedDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.RequestedDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                { field: "AssetName", displayName: $translate.instant('reports.name.lbl') },
                { field: "Manufacturer", displayName: $translate.instant('Manufacturer') },
                { field: "PreferredSupplier", displayName: $translate.instant('Preferred Supplier') },
                { field: "ApproximateValue", displayName: $translate.instant('Approximate Value') },
                {
                    field: "FirstName",
                    displayName: $translate.instant('Requested'),
                    // cellTemplate: "<div class='ui-grid-cell-contents'>\
                    // <span ng-if='entity.Title && entity.RequestedUser.Title.Description'>{{entity.RequestedUser.Title.Description}}&nbsp;</span>\
                    // <span>{{entity.RequestedUser.FirstName}}</span>&nbsp;<span>{{entity.RequestedUser.LastName}}</span>\
                    //  </div>"

                    cellTemplate: "<div class='ui-grid-cell-contents'>"
                        +
                        '<a ng-click="handleEvents(\'employeeinfo\',entity)">' +
                        '<span uib-tooltip="{{entity.RequestedUser.Title.Description}} ' + '{{entity.RequestedUser.FirstName }} ' +
                        '{{entity.RequestedUser.LastName}} | ' + '{{entity.Gender.Description}}" tooltip-placement="bottom">' +
                        "<span ng-if='entity.Title && entity.RequestedUser.Title.Description' >" +
                        "{{entity.RequestedUser.Title.Description}}</span> &nbsp;" +
                        "<span >{{entity.RequestedUser.FirstName}}</span> &nbsp;" +
                        "<span >{{entity.RequestedUser.LastName}}</span>" +
                        "<span ></span>" +
                        "</a></div>",
                    handleEvent: $scope.handleEvents
                },
                { field: "Department.DepartmentName", displayName: $translate.instant('Department Name') },
                {
                    field: "ApprovedDate",
                    displayName: $translate.instant('Request Date'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.ApprovedDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.ApprovedDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                {
                    field: "FirstName",
                    displayName: $translate.instant('Approved'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                    <span ng-if='entity.Title && entity.ApprovedUser.Title.Description'>{{entity.ApprovedUser.Title.Description}}&nbsp;</span>\
                    <span>{{entity.ApprovedUser.FirstName}}</span>&nbsp;<span>{{entity.ApprovedUser.LastName}}</span>\
                     </div>"
                },
                { field: "Description", displayName: $translate.instant('Description') },
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
                    Department: $scope.Department,
                    AssetRequestStatus: $scope.AssetRequestStatus,
                },
                Params: [
                    {
                        Key: 6,
                        Value: From
                    },
                    {
                        Key: 7,
                        Value: To
                    },
                    {
                        Key: 2,
                        Value: $scope.currentfilter.DepartmentId
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.AssetRequestStatusId
                    },
                    {
                        Key: 8,
                        Value: $scope.currentfilter.FacilityId
                    },
                ],
            };
            var options = {
                action: 'AssetManagement/NewAssetRequest/PrintNewAssetRequestReport',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };
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
                    "Key": "AssetRequestStatus"
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

    newassetrequestreportController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', '$filter', 'utl', '$timeout'];

})();