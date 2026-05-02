(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('GenericMasterReportController', GenericMasterReportController);

    function GenericMasterReportController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;
        $scope.currentfilter = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            ActiveStatusId: 2
        };
        $scope.lookup = {};


        $scope.excelDownloadCallbackExcel = function (scope, data, options, hasError) {
            const JsonFields = ["Code", "Generic Name", "Description", "Schedule Type", "Status"]
            let csvContent = JsonFields.join(",") + "\n";
            data.Data.forEach(function (rowArray) {
                var code = '';
                var genericNmae = '';
                var description = '';
                var schedule = '';
                var status = '';

                if (rowArray.Code) {
                    code = rowArray.Code;
                }
                if (rowArray.GenericName) {
                    genericNmae = rowArray.GenericName;
                }
                if (rowArray.Description) {
                    description = rowArray.Description;
                }
                if (rowArray.ScheduleType) {
                    if (rowArray.ScheduleType.Description) {
                        schedule = rowArray.ScheduleType.Description;
                    }
                }
                if (rowArray.ActiveStatus.Description) {
                    status = rowArray.ActiveStatus.Description;
                }



                csvContent += code + ',' + genericNmae + ',' + description + ',' + schedule + ',' + status + "\n";
            });
            var encodedUri = encodeURI(csvContent);
            var hiddenElement = document.createElement('a');
            hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodedUri;
            hiddenElement.target = '_blank';
            hiddenElement.download = 'genericmaster-report.csv';
            hiddenElement.click();

        };

        $scope.excelDownload = function () {
            var inputData = {
                Params: [
                    { Key: 3, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 4, Value: $scope.currentfilter.ScheduleTypeId }
                ],

            };
            var options = {
                action: "clinicalmaster/GenericMaster/GetGenericMasters",
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
            if ($scope.currentfilter.ScheduleTypeId > 0) {
                $scope.ScheduleType = res.Data[0].ScheduleType.Description;
            } else {
                $scope.ScheduleType = '';
            }
            vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getList = function (pageNo) {
            var inputData = {
                Params: [
                    { Key: 3, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 4, Value: $scope.currentfilter.ScheduleTypeId },
                ],
                PageContext: {
                    PageSize: vm.gridConfig.pagerObj.pageSize,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'clinicalmaster/GenericMaster/GetGenericMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.onenter = function (data) {
            if (data == undefined) {
                // $scope.getList();
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
                    field: "Code",
                    displayName: $translate.instant('reports.code.lbl')
                },
                {
                    field: "GenericName",
                    displayName: $translate.instant('reports.generic.lbl')
                },
                {
                    field: "Description",
                    displayName: $translate.instant('reports.description.lbl')

                },
                {
                    field: "ScheduleType.Description",
                    displayName: $translate.instant('reports.scheduletype.lbl')
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
                    ScheduleType: $scope.ScheduleType

                },
                Params: [
                    { Key: 3, Value: $scope.currentfilter.ActiveStatusId },
                    { Key: 4, Value: $scope.currentfilter.ScheduleTypeId },
                ],
            };

            var options = {
                action: 'clinicalmaster/GenericMaster/PrintGenericMasterReport',
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
                    "Key": "ScheduleType"
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

    GenericMasterReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();