(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('StoreMasterReportController', StoreMasterReportController);

    function StoreMasterReportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),

        };


        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Code", "Store Name", "Store Type", "Department",  "Store Sub Type", "License No", "Tax", "Expiry Warning Days"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var code = '';
                var storeName = '';
                var storeType = '';
                var dept = '';
                var subStore = '';
                var licenceNo = '';
                var tax = '';
                var expDays = '';
        
                if (rowArray.StoreCode) {
                    code = rowArray.StoreCode;
                }
                if (rowArray.StoreName) {
                    storeName = rowArray.StoreName;
                }
                if (rowArray.StoreType.Description) {
                    storeType = rowArray.StoreType.Description;
                }
                if (rowArray.Department.DepartmentName) {
                    dept = rowArray.Department.DepartmentName;
                }
                if (rowArray.StoreSubType.Description) {
                    subStore = rowArray.StoreSubType.Description;
                }
                if (rowArray.LicenseNo) {
                    licenceNo = rowArray.LicenseNo;
                }
                if (rowArray.TinNo) {
                    tax = rowArray.TinNo;
                }
                if (rowArray.ExpiryWarningDays) {
                    expDays = rowArray.ExpiryWarningDays;
                }
 
                csvContent += code + ',' + storeName + ',' + storeType + ',' + dept + ',' + subStore + ',' + licenceNo + ',' + tax + ',' + expDays + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'storemaster-report.csv';
            hiddenElement.click();
        
        };
        
        $scope.excelDownload = function () {
           var inputData = {
                Params: [ 
                    { Key: 2, Value: $scope.currentfilter.StoreTypeId },
                    { Key: 3, Value: $scope.currentfilter.StoreSubTypeId },
                    { Key: 5, Value: $scope.currentfilter.DepartmentId },
                    { Key: 6, Value: $scope.currentfilter.FacilityId },
                    { Key: 7, Value: 2 }
                ],
        
            };
            var options = {
                action: "pharmacy/storemaster/GetStoreMasters",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            if ($scope.currentfilter.StoreTypeId > 0) {
                $scope.StoreType = res.Data[0].StoreType.Description;
            } else {
                $scope.StoreType = '';
            }
            if ($scope.currentfilter.StoreSubTypeId > 0) {
                $scope.StoreSubType = res.Data[0].StoreSubType.Description;
            } else {
                $scope.StoreSubType = '';
            }
            if ($scope.currentfilter.DepartmentId > 0) {
                $scope.Department = res.Data[0].Department.DepartmentName;
            } else {
                $scope.Department = '';
            } 
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var inputData = {
                Params: [ 
                    { Key: 2, Value: $scope.currentfilter.StoreTypeId },
                    { Key: 3, Value: $scope.currentfilter.StoreSubTypeId },
                    { Key: 5, Value: $scope.currentfilter.DepartmentId },
                    { Key: 6, Value: $scope.currentfilter.FacilityId },
                    { Key: 7, Value: 2 }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/storemaster/GetStoreMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.getList();
            }
        };
        $scope.backtoReport = function () {
            $state.go('app.storereporttab.masterreport')
        };

        $scope.print = function () {
            var inputData = {
                Data: { 
                    FacilityName:$scope.currentfilter.FacilityName,
                    StoreType: $scope.StoreType,
                    StoreSubType: $scope.StoreSubType,
                    Department: $scope.Department 
                },
                Params: [ 
                    { Key: 2, Value: $scope.currentfilter.StoreTypeId },
                    { Key: 3, Value: $scope.currentfilter.StoreSubTypeId },
                    { Key: 5, Value: $scope.currentfilter.DepartmentId },
                    { Key: 6, Value: $scope.currentfilter.FacilityId },
                    { Key: 7, Value: 2 }
                ],
            };
            var options = {
                action: 'pharmacy/storemaster/PrintStoreMasterReport',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };


        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "idx", displayName: $translate.instant('S.No'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}} </span> </div>"
            },
            {
                field: "StoreCode",
                displayName: $translate.instant('reports.code.lbl')
            },
            {
                field: "StoreName",
                displayName: $translate.instant('reports.storename.lbl')
            },
            {
                field: "StoreType.Description",
                displayName: $translate.instant('reports.storetype.lbl')

            },
            {
                field: "Department.DepartmentName",
                displayName: $translate.instant('reports.dep.lbl')
            },

            {
                field: "StoreSubType.Description",
                displayName: $translate.instant('reports.storesubtype.lbl')
            },
            {
                field: "LicenseNo",
                displayName: $translate.instant('reports.licenseno.lbl')
            },
            {
                field: "TinNo",
                displayName: $translate.instant('reports.tax.lbl')
            },
            {
                field: "ExpiryWarningDays",
                displayName: $translate.instant('reports.expday.lbl')
            },

            ],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            // $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Facility",
                Request: {
                    Params: [{
                        Key: 4,
                        Value: true
                    }]
                }
            },
            { "Key": "StoreSubType" },
            { "Key": "StoreType" },
            { "Key": "Department" },
            ]
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

    StoreMasterReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();