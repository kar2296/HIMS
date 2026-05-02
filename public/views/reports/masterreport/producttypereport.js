(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ProductTypeReportController', ProductTypeReportController);

    function ProductTypeReportController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            ActiveStatusId: 2
        };
        $scope.lookup = {};


        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Category", "Sub Category", "Product Type Code", "Product Type Name", "Status"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var category = '';
                var subCate = '';
                var productCode = '';
                var productName = '';
                var Status = '';

                if (rowArray.ItemCategory) {
                    if (rowArray.ItemCategory.CategoryName) {
                        category = rowArray.ItemCategory.CategoryName;
                    }
                }
                if (rowArray.ItemSubCategory.SubCategoryName) {
                    subCate = rowArray.ItemSubCategory.SubCategoryName;
                }
                if (rowArray.ProductTypeCode) {
                    productCode = rowArray.ProductTypeCode;
                }
                if (rowArray.ProductTypeName) {
                    productName = rowArray.ProductTypeName;
                }
                if (rowArray.ActiveStatus.Description) {
                    Status = rowArray.ActiveStatus.Description;
                }



                csvContent += category + ',' + subCate + ',' + productCode + ',' + productName + ',' + Status + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'producttype-report.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            var inputData = {
                Params: [
                    { Key: 3, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 4, Value: $scope.currentfilter.FacilityId },
                    { Key: 5, Value: $scope.currentfilter.CategoryId },
                    { Key: 6, Value: $scope.currentfilter.SubCategoryId }
                ],

            };
            var options = {
                action: "pharmacy/producttype/GetProductTypes",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };



        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];
            vm.gridConfig.data = res.Data;
            if ($scope.currentfilter.ActiveStatusId > 0) {
                $scope.ActiveStatus = res.Data[0].ActiveStatus.Description;
            } else {
                $scope.ActiveStatus = '';
            }
            if ($scope.currentfilter.CategoryId > 0) {
                $scope.CategoryName = res.Data[0].ItemCategory.CategoryName;
            } else {
                $scope.CategoryName = '';
            }
            if ($scope.currentfilter.SubCategoryId > 0) {
                $scope.SubCategoryName = res.Data[0].ItemSubCategory.SubCategoryName;
            } else {
                $scope.SubCategoryName = '';
            }
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {
            var inputData = {
                Params: [
                    { Key: 3, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 4, Value: $scope.currentfilter.FacilityId },
                    { Key: 5, Value: $scope.currentfilter.CategoryId },
                    { Key: 6, Value: $scope.currentfilter.SubCategoryId }
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'pharmacy/producttype/GetProductTypes',
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


        vm.gridConfig = {
            enableColumnResizing: true,
            columnDefs: [
                {
                    field: "idx", displayName: $translate.instant('S.No'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}} </span> </div>"
                },
                {
                    field: "ItemCategory.CategoryName",
                    displayName: $translate.instant('reports.cat.lbl')
                },
                {
                    field: "ItemSubCategory.SubCategoryName",
                    displayName: $translate.instant('reports.subcat.lbl')
                },
                {
                    field: "ProductTypeCode",
                    displayName: $translate.instant('reports.productcode.lbl')

                },
                {
                    field: "ProductTypeName",
                    displayName: $translate.instant('reports.product.lbl')
                },

                {
                    field: "ActiveStatus.Description",
                    displayName: $translate.instant('reports.activestatus.lbl')
                },

            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };
        $scope.print = function () {
            var inputData = {
                Data: {
                    ActiveStatus: $scope.ActiveStatus,
                    CategoryName: $scope.CategoryName,
                    SubCategoryName: $scope.SubCategoryName

                },
                Params: [
                    { Key: 3, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 4, Value: $scope.currentfilter.FacilityId },
                    { Key: 5, Value: $scope.currentfilter.CategoryId },
                    { Key: 6, Value: $scope.currentfilter.SubCategoryId }
                ],
            };

            var options = {
                action: 'pharmacy/producttype/PrintProductTypeReport',
                data: inputData,
                type: 'post',
            };

            utl.Http.doDownload(options);
        };
        $scope.backtoReport = function () {
            $state.go('app.storereporttab.masterreport')
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.currentfilter.StoreMasterId === 0) {
                    $scope.currentfilter.StoreMasterId = value[0].Id;
                }
            });
            // $scope.getList();
        }
        $scope.initLookup = function () {
            var inputData = [
                { "Key": "Facility" },
                { "Key": "ActiveStatus" },
                {
                    "Key": "ItemCategory",
                    Request: {
                        Params: [{
                            Key: 3,
                            Value: 2
                        }, {
                            Key: 4,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        },]
                    }
                },
                {
                    "Key": "ItemSubCategory",
                    Request: {
                        Params: [{
                            Key: 3,
                            Value: 2
                        }, {
                            Key: 4,
                            Value: [-1, utl.Session.getCurrentFacilityId()]
                        },]
                    }
                },
                {
                    "Key": "UserStores",
                    Default: false,
                    Request: {
                        Params: [{
                            Key: 1,
                            Value: utl.Session.getCurrentUserId()
                        },
                        {
                            Key: 2,
                            Value: utl.Session.getCurrentFacilityId()
                        },
                        {
                            Key: 5,
                            Value: 2
                        }
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
        };
        $scope.initLookup();
    }

    ProductTypeReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();