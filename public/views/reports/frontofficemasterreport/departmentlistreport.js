(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('DepartmentListReportController', DepartmentListReportController);

    function DepartmentListReportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FacilityName: utl.Session.getCurrentFacilityName(),

        };

        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Code", "Department", "Type", "Parent Department", "Status"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var code = '';
                var dept = '';
                var type = '';
                var parentDept = '';
                var status = '';
             
                if (rowArray.DepartmentCode) {
                    code = rowArray.DepartmentCode;
                }
                if (rowArray.DepartmentName) {
                    dept = rowArray.DepartmentName;
                }
                if (rowArray.DepartmentType.Description) {
                    type = rowArray.DepartmentType.Description;
                }
                if (rowArray.ParentDepartment) {
                if (rowArray.ParentDepartment.DepartmentName) {
                    parentDept = rowArray.ParentDepartment.DepartmentName;
                }
            }
                if (rowArray.ActiveStatus.Description) {
                    status = rowArray.ActiveStatus.Description;
                }
                csvContent += code + ',' + dept + ',' + type + ',' + parentDept + ',' + status + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'departmentlist-report.csv';
            hiddenElement.click();
        
        };
        
        $scope.excelDownload = function () {
           var inputData = {
                Params: [
                    {
                        Key: 3,
                        Value: $scope.currentfilter.departmenttypeid
                    },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.ActiveStatusId
                    }
                ],
        
            };
            var options = {
                action: "SystemSettingsdepartment/GetDepartments",
                data: inputData,
                type: "post",
                onComplete: $scope.excelDownloadCallbackExcel,
            };
            utl.Http.doAction(options);
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = res.Data;
            if ($scope.currentfilter.departmenttypeid > 0) {
                if (res.Data.length > 0) {
                    $scope.Type = res.Data[0].DepartmentType.Description;
                }
            }
            else {
                $scope.Type = '';
            }
            if ($scope.currentfilter.ActiveStatusId > 0) {
                if (res.Data.length > 0) {
                    $scope.ActiveStatus = res.Data[0].ActiveStatus.Description;
                }
            }
            else {
                $scope.ActiveStatus = '';
            }
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    {
                        Key: 3,
                        Value: $scope.currentfilter.departmenttypeid
                    },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.ActiveStatusId
                    },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'SystemSettings/department/GetDepartments',
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
            $state.go('app.ipopreportstab.masterreport')
        };

        $scope.print = function () {
            var inputData = {
                Data: {
                    FacilityName: $scope.currentfilter.FacilityName,
                    Type: $scope.Type,
                    ActiveStatus: $scope.ActiveStatus
                },
                Params: [
                    {
                        Key: 3,
                        Value: $scope.currentfilter.departmenttypeid
                    },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.ActiveStatusId
                    },
                ],
            };
            var options = {
                action: 'SystemSettings/department/PrintDepartmentListReport',
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
                field: "DepartmentCode",
                displayName: $translate.instant('reports.code.lbl')
            },
            {
                field: "DepartmentName",
                displayName: $translate.instant('reports.dep.lbl')
            },
            {
                field: "DepartmentType.Description",
                displayName: $translate.instant('reports.type.lbl')
            },
            {
                field: "ParentDepartment.DepartmentName",
                displayName: $translate.instant('reports.patdep.lbl')

            },
            {
                field: "ActiveStatus.Description",
                displayName: $translate.instant('reports.statusr.lbl')
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

            {
                "Key": "DepartmentType"
            },
            {
                "Key": "ActiveStatus"
            },
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

    DepartmentListReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();