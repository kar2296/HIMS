(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('serviceItemReportController', serviceItemReportController);

    function serviceItemReportController($rootScope, $scope, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;

        $scope.ServiceItemData = [];
        $scope.currentfilter = {
            Code: '',
            Name: '',
            DepartmentId: -1,
            CategoryId: -1,
            ActiveStatusId: 2,
            file: null,
            FacilityId: utl.Session.getCurrentFacilityId(),
            // FacilityName: utl.Session.getCurrentFacilityName(),
        };

        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.ServiceItemData = res.Data;
            //     for(var idx in res.Data){
            //         var item = res.Data[idx];
            //         if(item.ServiceItemTariffDetails.length>0){
            //             item.Rate = item.ServiceItemTariffDetails[0].Rate;
            //             item.RateType = item.ServiceItemTariffDetails[0].ServiceRateCategory.Description;
            //         }
            //         vm.gridConfig.data = $scope.ServiceItemData;
            //     }
            // vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };
        $scope.backtoReport = function () {
            $state.go('app.billingreportstab.masterbillingreport');
        };
        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 1, Value: $scope.currentfilter.Code },
                    { Key: 2, Value: $scope.currentfilter.DepartmentId },
                    { Key: 3, Value: $scope.currentfilter.CategoryId },
                    { Key: 4, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 8, Value: $scope.currentfilter.FacilityId },
                    {
                        Key: 35,
                        Value: {
                            'FacilityId': $scope.currentfilter.FacilityId
                        }
                    }
                    // { Key: 30, Value: 1 },

                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'clinicalmaster/serviceitem/GettraiffServiceItems',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.print = function () {

            var inputData = {
                Data: {
                    Category: $scope.Category,
                    ActiveStatus: $scope.ActiveStatus,
                    Department: $scope.Department
                },
                Params: [
                    { Key: 2, Value: $scope.currentfilter.DepartmentId },
                    { Key: 3, Value: $scope.currentfilter.CategoryId },
                    { Key: 4, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 8, Value: $scope.currentfilter.FacilityId },
                    // { Key: 30, Value: 2 },

                ]
            };
            var options = {
                action: 'clinicalmaster/serviceitem/PrintServiceItemRateDetails',
                data: inputData,
                type: 'post'
            };

            utl.Http.doDownload(options);
        };
        // vm.gridConfig = {
        //     enableColumnResizing: true,
        //     columnDefs: [
        //         { field: "ItemCode", displayName: $translate.instant('clinicalmaster.serviceitem-list.itemcode.lbl') },
        //         { field: "Name", displayName: $translate.instant('clinicalmaster.serviceitem-list.itemname.lbl') },
        //         { field: "Description", displayName: $translate.instant('clinicalmaster.serviceitem-list.description.lbl') },
        //         {
        //             field: "Department.DepartmentName", displayName: $translate.instant('clinicalmaster.serviceitem-list.department.lbl')
        //         },
        //         {
        //             field: "ParentCategory.ServiceCategoryName", displayName:
        //                 $translate.instant('clinicalmaster.serviceitem-list.category.lbl')
        //         },
        //         {
        //             field: "SubCategory.ServiceCategoryName", displayName:
        //                 $translate.instant('clinicalmaster.serviceitem-list.subcategory.lbl')
        //         },
        //         { field: "ServiceItemTariffDetails.Rate", displayName: $translate.instant('Rate') },
        //         { field: "ActiveStatus.Description", displayName: $translate.instant('clinicalmaster.serviceitem-list.status.lbl') },
        //     ],
        //     pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        // };

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
                {
                    "Key": "Facility"
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

    serviceItemReportController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();