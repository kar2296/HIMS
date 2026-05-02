(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('departmentwisestatisticsreportController', departmentwisestatisticsreportController);

    function departmentwisestatisticsreportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            From: utl.Formatter.getCurrentDate(),
            To: utl.Formatter.getCurrentDate(),
            StoreMasterId: 0
        };
        $scope.lookup = {};
        $scope.CanShowPrint = false;
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
 
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.gridConfig.data = [];

            if (res.Data.length > 0) {
                var GroupedBatchData = _.groupBy(res.Data, 'DepartmentId');
                for (var idx in GroupedBatchData) {
                    var deptStats = {
                        DepartmentName: '',
                        NewCount: 0,
                        FollowupCount: 0,
                        TotOpCount: 0,
                        AdmCount: 0,
                        DisCount: 0
                    }
                    var grpDept = GroupedBatchData[idx];
                    for (var ddx in grpDept) {
                        var deptEnc = grpDept[ddx];
                        deptStats.DepartmentName = deptEnc.Department.DepartmentName;
                        if (deptEnc.EncounterTypeId == 1) {
                            deptStats.TotOpCount++;
                        }
                        if (deptEnc.EncounterTypeId == 1 && deptEnc.VisitTypeId == 1) {
                            deptStats.NewCount++;
                        }
                        if (deptEnc.EncounterTypeId == 1 && deptEnc.VisitTypeId == 2) {
                            deptStats.FollowupCount++;
                        }
                        if (deptEnc.EncounterTypeId == 2 && deptEnc.AdmissionDate) {
                            deptStats.AdmCount++;
                        }
                        if (deptEnc.EncounterTypeId == 2 && deptEnc.DischargeDate) {
                            deptStats.DisCount++;
                        }
                        if (vm.gridConfig.data.length == 0) {
                            vm.gridConfig.data.push(deptStats);
                        } else {
                            var valappended = 0;
                            vm.gridConfig.data.forEach(function (item) {
                                if (deptStats.DepartmentName == item.DepartmentName) {
                                    item.TotOpCount = deptStats.TotOpCount;
                                    item.NewCount = deptStats.NewCount;
                                    item.FollowupCount = deptStats.FollowupCount;
                                    item.AdmCount = deptStats.AdmCount;
                                    item.DisCount = deptStats.DisCount;
                                    valappended = 1;
                                }
                            });
                            if (valappended == 0)
                                vm.gridConfig.data.push(deptStats);
                        }

                    }
                }
            }
            vm.gridConfig.pagerObj.totalItems = vm.gridConfig.data.length;
            if (vm.gridConfig.data.length > 0) {
                $scope.CanShowPrint = true;
            }

        };

        $scope.getList = function () {
            //             if (!$scope.currentfilter.FromDate || $scope.currentfilter.FromDate == '' ||
            //                 !$scope.currentfilter.ToDate || $scope.currentfilter.ToDate == '') {
            //                 vm.gridConfig.data = [];
            //                 $scope.TotalQty = 0;
            //                 $scope.CanShowPrint = false;
            //                 return;
            //             }
            var From = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 62, Value: [From, To] }
                    // {
                    //     Key: 17,
                    //     Value: From
                    // },
                    // {
                    //     Key: 18,
                    //     Value: To
                    // },
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: vm.gridConfig.pagerObj.currentPage
                }
            };

            var options = {
                action: 'Visit/Visit/GetEncounters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.currentfilter.ItemMasterId = -1;
                $scope.getList();
            }
        };
        $scope.backtoReport = function () {
            if ($scope.Context == 'ipopreport') {
                $state.go('app.ipopreportstab.inpatientreport');
            } if ($scope.Context == 'mrdreports') {
                $state.go('app.mrdreports');
            }
        };
        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                },
                Params: [
                    { Key: 62, Value: [From, To] }
                ],
                PageContext: { PageSize: -1, PageNumber: 1 },
            };

            var options = {
                action: 'Visit/Visit/PrintDepartmentWiseStatisticsReport',
                data: inputData,
                type: 'post',
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
                field: "DepartmentName",
                displayName: $translate.instant('Department Name')
            },
            {
                field: "NewCount",
                displayName: $translate.instant('New')
            },
            {
                field: "FollowupCount",
                displayName: $translate.instant('FollowUp')
            },
            {
                field: "TotOpCount",
                displayName: $translate.instant('Total OP')
            },
            {
                field: "AdmCount",
                displayName: $translate.instant('Admissions')
            },
            {
                field: "DisCount",
                displayName: $translate.instant('Discharges'),
            }],
            pagerObj: {
                totalItems: 0,
                currentPage: 1,
                startIndex: 0,
                pageSize: 25
            }
        };


        $scope.getList();

    }

    departmentwisestatisticsreportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();