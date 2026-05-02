(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('ServiceGroupDetailsController', ServiceGroupDetailsController);

    function ServiceGroupDetailsController($rootScope, $scope, $stateParams, $state, $translate, utl, $filter, $timeout) {
        var vm = this;
        $scope.Items = [];
        $scope.item = {}
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        //getlist
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;

        };
        $scope.backtoReport = function () {
            $state.go('app.billingreportstab.masterbillingreport');
        }

        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Code", "Service Group", "Display Order","Print Order"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var code = '';
                var group = '';
                var displayOrder = '';
                var print = '';
        
                if (rowArray.ServiceCategoryCode) {
                    code = rowArray.ServiceCategoryCode;
                }
                if (rowArray.ServiceCategoryName) {
                    group = rowArray.ServiceCategoryName;
                }
                if (rowArray.DisplayOrder) {
                    displayOrder = rowArray.DisplayOrder;
                }
                if (rowArray.PrintOrder) {
                    print = rowArray.PrintOrder;
                }
              
                csvContent += code + ',' + group + ',' + displayOrder + ',' + print + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'servicegroupdetails-report.csv';
            hiddenElement.click();
        
        };
        
        $scope.excelDownload = function () {
             var inputData = {
                Params: [
                    {
                        Key: 2,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 5,
                        Value: true
                    }
                ],
        
            };
            var options = {
                action: "clinicalmaster/servicecategory/GetServiceCategorys",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };
        

        $scope.getList = function () {

            var inputData = {
                Params: [
                    {
                        Key: 2,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 5,
                        Value: true
                    }
                ],
                PageContext: {
                    PageSize: 400,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'clinicalmaster/servicecategory/GetServiceCategorys',
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
                    field: "S.No",
                    displayName: $translate.instant('S.No'),
                    cellTemplate: "<div class='ui-grid-cell-contents'><span >{{index+1}}</span> </div>"
                },
                { field: "ServiceCategoryCode", displayName: $translate.instant('clinicalmaster.serviceitem-list.itemcode.lbl') },
                { field: "ServiceCategoryName", displayName: $translate.instant('clinicalmaster.serviceitem-list.itemname.lbl') },
                { field: "DisplayOrder", displayName: $translate.instant('clinicalmaster.servicecategory-list.displayorder.lbl') },
                { field: "PrintOrder", displayName: $translate.instant('clinicalmaster.servicecategory-list.printorder.lbl') },
            ],
            pagerObj: { totalItems: 0, currentPage: 1, startIndex: 0, pageSize: 25 }
        };


        //lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }
        $scope.print = function () {
            var inputData = {
                Params: [
                    {
                        Key: 2,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 5,
                        Value: true
                    }
                ]
            };

            var options = {
                action: 'clinicalmaster/servicecategory/PrintServiceCategorys',
                data: inputData,
                type: 'post',
            };

            utl.Http.doDownload(options);
        };
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

    ServiceGroupDetailsController.$inject = ['$rootScope', '$scope', '$stateParams', '$state', '$translate', 'utl', '$filter', '$timeout'];

})();