(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('OPserviceItemReportController', OPserviceItemReportController);

    function OPserviceItemReportController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;

        $scope.ServiceItemData = [];
        $scope.currentfilter = {
            Code: '',
            Name: '',
            DepartmentId: -1,
            CategoryId: -1,
            ActiveStatusId: 2,
            file: null
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        
        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Code", "Service Group", "Description", "Department", "Billing Group", "Sub Category", "Rate", "Status"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var code = '';
                var serviceGrp = '';
                var descript = '';
                var dept = '';
                var billGrp = '';
                var subCate = '';
                var rate = '';
                var status = '';
             
                if (rowArray.ItemCode) {
                    code = rowArray.ItemCode;
                }
                if (rowArray.Name) {
                    serviceGrp = rowArray.Name;
                }
                if (rowArray.Description) {
                    descript = rowArray.Description;
                }
                if (rowArray.Department.DepartmentName) {
                    dept = rowArray.Department.DepartmentName;
                }
                if (rowArray.ParentCategory.ServiceCategoryName) {
                    billGrp = rowArray.ParentCategory.ServiceCategoryName;
                }
                if (rowArray.SubCategory) {
                if (rowArray.SubCategory.ServiceCategoryName) {
                    subCate = rowArray.SubCategory.ServiceCategoryName;
                }
            }
                if (rowArray.ItemCost) {
                    rate = rowArray.ItemCost;
                }
                if (rowArray.ActiveStatus.Description) {
                    status = rowArray.ActiveStatus.Description;
                }
                csvContent += code + ',' + serviceGrp + ',' + descript + ',' + dept + ',' + billGrp + ',' + subCate + ',' + rate + ',' + status + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'opserviceitem-report.csv';
            hiddenElement.click();
        
        };
        
        $scope.excelDownload = function () {
    var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentfilter.DepartmentId },
                    { Key: 3, Value: $scope.currentfilter.CategoryId },
                    { Key: 7, Value: $scope.currentfilter.SubCategoryId },
                    { Key: 4, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 30, Value: 1 }
                ],
        
            };
            var options = {
                action: "clinicalmaster/serviceitem/GetServiceItems",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };


        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            $scope.ServiceItemData = res.Data;
                for(var idx in res.Data){
                    var item = res.Data[idx];
                    if(item.ServiceItemTariffDetails.length>0){
                        item.Rate = item.ServiceItemTariffDetails[0].Rate;
                    }
                    vm.gridConfig.data = $scope.ServiceItemData;
                }
                if($scope.currentfilter.DepartmentId>0) {
                    $scope.Department = res.Data[0].Department.DepartmentName;
                }else {
                    $scope.Department = '';
                }
                if($scope.currentfilter.CategoryId>0) {
                    $scope.Category = res.Data[0].ParentCategory.ServiceCategoryName;
                }else {
                    $scope.Category = '';
                }
                if($scope.currentfilter.SubCategoryId>0) {
                    $scope.SubCategory = res.Data[0].SubCategory.ServiceCategoryName;
                }else {
                    $scope.SubCategory = '';
                }
                if($scope.currentfilter.ActiveStatusId>0) {
                    $scope.ActiveStatus = res.Data[0].ActiveStatus.Description;
                }else {
                    $scope.ActiveStatus = '';
                }
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };
        $scope.backtoReport = function () {
            $state.go('app.ipopreportstab.masterreport');
        };
        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentfilter.DepartmentId },
                    { Key: 3, Value: $scope.currentfilter.CategoryId },
                    { Key: 7, Value: $scope.currentfilter.SubCategoryId },
                    { Key: 4, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 30, Value: 1 },

                ],
                PageContext: {
                    PageSize: 25,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'clinicalmaster/serviceitem/GetServiceItems',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.print = function () {

            var inputData = {
                Data: {
                    Category : $scope.Category,
                    SubCategory : $scope.SubCategory,
                    ActiveStatus : $scope.ActiveStatus,
                    Department : $scope.Department
                },
                Params: [
                    { Key: 2, Value: $scope.currentfilter.DepartmentId },
                    { Key: 3, Value: $scope.currentfilter.CategoryId },
                    { Key: 7, Value: $scope.currentfilter.SubCategoryId },
                    { Key: 4, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 30, Value: 1 },

                ]
            };

            var options = {
                action: 'clinicalmaster/serviceitem/PrintServiceItemsOp',
                data: inputData,
                type: 'post'
            };

            utl.Http.doDownload(options);
        };
        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "S.No",
                displayName: $translate.instant('S.No'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span>{{index+1}}</span> </div>"
            },
                { field: "ItemCode", displayName: $translate.instant('clinicalmaster.serviceitem-list.itemcode.lbl') },
                { field: "Name", displayName: $translate.instant('clinicalmaster.serviceitem-list.itemname.lbl') },
                { field: "Description", displayName: $translate.instant('clinicalmaster.serviceitem-list.description.lbl') },
                {
                    field: "Department.DepartmentName", displayName: $translate.instant('clinicalmaster.serviceitem-list.department.lbl')
                },
                {
                    field: "ParentCategory.ServiceCategoryName", displayName:
                        $translate.instant('clinicalmaster.serviceitem-list.category.lbl')
                },
                {
                    field: "SubCategory.ServiceCategoryName", displayName:
                        $translate.instant('clinicalmaster.serviceitem-list.subcategory.lbl')
                },
                { field: "Rate", displayName: $translate.instant('Rate') },
                { field: "ActiveStatus.Description", displayName: $translate.instant('clinicalmaster.serviceitem-list.status.lbl') },
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            // $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Department" },
                { "Key": "SubDepartment" },
                { "Key": "ActiveStatus" },
                { "Key": "ServiceSubCategory" },
                { "Key": "ServiceCategory" },
                { "Key": "ServiceGroup" },
                { "Key": "MasterType" },
                { "Key": "Facility" }
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

    OPserviceItemReportController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();