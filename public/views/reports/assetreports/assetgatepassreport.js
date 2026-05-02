(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('assetgatepassreportController', assetgatepassreportController);

    function assetgatepassreportController($rootScope, $scope, $stateParams, $state, $translate, $filter, utl, $timeout) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({ $scope: $scope }));

        $scope.Items = [];
        $scope.currentfilter = {
            AssetTypeId: -1,
            AssetCategoryId: -1,
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
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
            const JsonFields = ["GatePass No", "GatePass Date", "GatePass Type", "Name", "Serial No", "Purpose", "SupplierName", "Dispose", "Dispatch Type", "Approved"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var gatepass = '';
                var gateDate = '';
                var gateType = '';
                var name = '';
                var serialNo = '';
                var purpose = '';
                var supplier = '';
                var dispose = '';
                var dispatch = '';
                var approved = '';

                if (rowArray.GatePassNo) {
                    gatepass = rowArray.GatePassNo;
                }
                if (rowArray.GatePassDate) {
                    gateDate = rowArray.GatePassDate;
                }

                if (rowArray.GatePassType.Description) {
                    gateType = rowArray.GatePassType.Description;
                }
                if (rowArray.Asset.Description) {
                    name = rowArray.Asset.Description;
                }
                if (rowArray.SerialNo) {
                    serialNo = rowArray.SerialNo;
                }
                if (rowArray.GatePassPurpose) {
                    purpose = rowArray.GatePassPurpose;
                }
                if (rowArray.VendorMaster.VendorName) {
                    supplier = rowArray.VendorMaster.VendorName;
                }
                if (rowArray.DisposedUser) {
                    if (rowArray.DisposedUser.Title) {
                        dispose = rowArray.DisposedUser.Title.Description;
                    }
                    if (rowArray.DisposedUser.FirstName) {
                        dispose += ' ' + rowArray.DisposedUser.FirstName;
                    }
                    if (rowArray.DisposedUser.LastName) {
                        dispose += ' ' + rowArray.DisposedUser.LastName;
                    }
                }
                if (rowArray.DispatchedType) {
                    if (rowArray.DispatchedType) {
                        dispatch = rowArray.DispatchedType.Description;
                    }
                }
                if (rowArray.ApprovedUser) {
                    if (rowArray.ApprovedUser.Title) {
                        approved = rowArray.ApprovedUser.Title.Description;
                    }
                    if (rowArray.ApprovedUser.FirstName) {
                        approved += ' ' + rowArray.ApprovedUser.FirstName;
                    }
                    if (rowArray.ApprovedUser.LastName) {
                        approved += ' ' + rowArray.ApprovedUser.LastName;
                    }
                }
                csvContent += gatepass + ',' + gateDate + ',' + gateType + ',' + name + ',' + serialNo + ',' + purpose + ',' + supplier + ',' + dispose + ',' + dispatch + ',' + approved + "\n";
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
                    // {
                    //     Key: 10,
                    //     Value: $scope.currentfilter.AssetTypeId
                    // },
                    // {
                    //     Key: 9,
                    //     Value: $scope.currentfilter.AssetCategoryId
                    // },
                    {
                        Key: 9,
                        Value: $scope.currentfilter.FacilityId
                    }
                ],

            };
            var options = {
                action: "AssetManagement/GatePass/GetGatePasss",
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
            if ($scope.currentfilter.GatePassTypeId > 0) {
                if (res.Data.length > 0) {
                    $scope.GatePassType = res.Data[0].GatePassType.Description;
                } else {
                    $scope.GatePassType = '';
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
                        Key: 6,
                        Value: From
                    },
                    {
                        Key: 7,
                        Value: To
                    },
                    {
                        Key: 10,
                        Value: $scope.currentfilter.AssetTypeId
                    },
                    {
                        Key: 1,
                        Value: $scope.currentfilter.GatePassTypeId
                    },
                    {
                        Key: 9,
                        Value: $scope.currentfilter.FacilityId
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'AssetManagement/GatePass/GetGatePasss',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
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


        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                { field: "rowIndex", displayName: $translate.instant('S.No') },
                { field: "GatePassNo", displayName: $translate.instant('GatePass No') },
                {
                    field: "GatePassDate",
                    displayName: $translate.instant('GatePass Date'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{entity.GatePassDate | date : 'dd-MMM-yyyy'}} </span>" + "<span >{{entity.GatePassDate| date: 'HH:mm'}}</span>" + "</div>"
                },
                { field: "GatePassType.Description", displayName: $translate.instant('GatePass Type') },
                { field: "Asset.Description", displayName: $translate.instant('Asset Name') },
                { field: "SerialNo", displayName: $translate.instant('Serial No') },
                { field: "GatePassPurpose", displayName: $translate.instant('Purpose') },
                { field: "VendorMaster.VendorName", displayName: $translate.instant('SupplierName') },
                {
                    field: "FirstName",
                    displayName: $translate.instant('Dispose'),
                    cellTemplate: "<div class='ui-grid-cell-contents'>\
                    <span ng-if='entity.Title && entity.DisposedUser.Title.Description'>{{entity.DisposedUser.Title.Description}}&nbsp;</span>\
                    <span>{{entity.DisposedUser.FirstName}}</span>&nbsp;<span>{{entity.DisposedUser.LastName}}</span>\
                     </div>"
                },
                { field: "DispatchedType.Description", displayName: $translate.instant('Dispatch Type') },
                {
                    field: "FirstName",
                    displayName: $translate.instant('Approved'),
                    // cellTemplate: "<div class='ui-grid-cell-contents'>\
                    // <span ng-if='entity.Title && entity.ApprovedUser.Title.Description'>{{entity.ApprovedUser.Title.Description}}&nbsp;</span>\
                    // <span>{{entity.ApprovedUser.FirstName}}</span>&nbsp;<span>{{entity.ApprovedUser.LastName}}</span>\
                    //  </div>"
                    cellTemplate: "<div class='ui-grid-cell-contents'>"
                        +
                        '<a ng-click="handleEvents(\'employeeinfo\',entity)">' +
                        '<span uib-tooltip="{{entity.ApprovedUser.Title.Description}} ' + '{{entity.ApprovedUser.FirstName }} ' +
                        '{{entity.ApprovedUser.LastName}} | ' + '{{entity.Gender.Description}}" tooltip-placement="bottom">' +
                        "<span ng-if='entity.Title && entity.ApprovedUser.Title.Description' >" +
                        "{{entity.ApprovedUser.Title.Description}}</span> &nbsp;" +
                        "<span >{{entity.ApprovedUser.FirstName}}</span> &nbsp;" +
                        "<span >{{entity.ApprovedUser.LastName}}</span>" +
                        "<span ></span>" +
                        "</a></div>",
                    handleEvent: $scope.handleEvents

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
                    GatePassType: $scope.GatePassType,
                    AssetCategory: $scope.AssetCategory,
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
                        Key: 10,
                        Value: $scope.currentfilter.AssetTypeId
                    },
                    {
                        Key: 1,
                        Value: $scope.currentfilter.GatePassTypeId
                    },
                    {
                        Key: 9,
                        Value: $scope.currentfilter.FacilityId
                    },
                ],
            };
            var options = {
                action: 'AssetManagement/GatePass/PrintAssetGatepassReport',
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
                { "Key": "GatePassType" },

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

    assetgatepassreportController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', '$filter', 'utl', '$timeout'];

})();