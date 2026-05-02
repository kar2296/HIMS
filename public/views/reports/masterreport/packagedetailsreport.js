(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PackageDetailsController', PackageDetailsController);

    function PackageDetailsController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            Code: '',
            Name: '',
            DepartmentId: -1,
            CategoryId: -1,
            ActiveStatusId: 2,
            file: null
        };


        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Code", "Service Group", "Description", "Department", "Billing Group", "Status"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {

                var code = '';
                var grp = '';
                var descipt = '';
                var dept = '';
                var billGrp = '';
                var status = '';

                if (rowArray.ItemCode) {
                    code = rowArray.ItemCode;
                }
                if (rowArray.Name) {
                    grp = rowArray.Name;
                }
                if (rowArray.Description) {
                    descipt = rowArray.Description;
                }
                if (rowArray.Department.DepartmentName) {
                    dept = rowArray.Department.DepartmentName;
                }
                if (rowArray.ParentCategory.ServiceCategoryName) {
                    billGrp = rowArray.ParentCategory.ServiceCategoryName;
                }
                if (rowArray.ActiveStatus.Description) {
                    status = rowArray.ActiveStatus.Description;
                }
                csvContent += code + ',' + grp + ',' + descipt + ',' + dept + ',' + billGrp + ',' + status + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'packagedetails-reports.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
             var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentfilter.DepartmentId },
                    { Key: 3, Value: $scope.currentfilter.CategoryId },
                    { Key: 4, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 11, Value: true }
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
            if (res.Data.length > 0) {
                if ($scope.currentfilter.DepartmentId > 0) {
                    $scope.Department = res.Data[0].Department.Description;
                }
                if ($scope.currentfilter.CategoryId > 0) {
                    $scope.Category = res.Data[0].ParentCategory.ServiceCategoryName;
                }
                if ($scope.currentfilter.ActiveStatusId > 0) {
                    $scope.ActiveStatus = res.Data[0].ActiveStatus.Description;
                }
            }
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentfilter.DepartmentId },
                    { Key: 3, Value: $scope.currentfilter.CategoryId },
                    { Key: 4, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 11, Value: true },

                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
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

        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [{
                field: "S.No",
                displayName: $translate.instant('S.No'),
                cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
            },
            { field: "ItemCode", displayName: $translate.instant('clinicalmaster.serviceitem-list.itemcode.lbl') },
            { field: "Name", displayName: $translate.instant('clinicalmaster.serviceitem-list.itemname.lbl') },
            { field: "Description", displayName: $translate.instant('clinicalmaster.serviceitem-list.description.lbl') },
            { field: "Department.DepartmentName", displayName: $translate.instant('clinicalmaster.serviceitem-list.department.lbl') },
            { field: "ParentCategory.ServiceCategoryName", displayName: $translate.instant('clinicalmaster.serviceitem-list.category.lbl') },
            // { field: "SubCategory.ServiceCategoryName", displayName: $translate.instant('clinicalmaster.serviceitem-list.subcategory.lbl') },
            // { field: "Facility.FacilityName", displayName: $translate.instant('clinicalmaster.serviceitem-list.facility.lbl') },
            { field: "ActiveStatus.Description", displayName: $translate.instant('clinicalmaster.serviceitem-list.status.lbl') },
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };
        $scope.backtoReport = function () {
            $state.go('app.billingreportstab.masterbillingreport')
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            // $scope.getList();
        }
        $scope.print = function () {

            var inputData = {
                Data: {
                    Department: $scope.Department,
                    Category: $scope.Category,
                    ActiveStatus: $scope.ActiveStatus
                },
                Params: [
                    { Key: 2, Value: $scope.currentfilter.DepartmentId },
                    { Key: 3, Value: $scope.currentfilter.CategoryId },
                    { Key: 4, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 11, Value: true },
                ]
            };

            var options = {
                action: 'clinicalmaster/serviceitem/PrintServiceItems',
                data: inputData,
                type: 'post'
            };

            utl.Http.doDownload(options);
        };
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

    PackageDetailsController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();