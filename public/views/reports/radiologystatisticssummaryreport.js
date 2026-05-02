(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('RadiologyStatisticsSummaryReportController', RadiologyStatisticsSummaryReportController);

    function RadiologyStatisticsSummaryReportController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;
        $scope.StatisticSummary = [];
        $scope.currentcontext = {};
        $scope.currentfilter = {
            From: $filter('date')(new Date(), 'yyyy-MM-dd 00:00:00'),
            To: $filter('date')(new Date(), 'yyyy-MM-dd 23:59:59'),
        }
        $scope.currentcontext = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            Testtypeid: 2,
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            TestId: 0,
        }
        $scope.getListCallBack = function (scope, res, options, hasError) {
            $scope.StatisticSummary = res;
            $scope.TestSummary = [];
            $scope.NetTestSummary = [];
            if ($scope.StatisticSummary) {
                var createdsummary = [];
                var acceptedsummary = [];
                var samplesummary = [];
                var pendingprocesssummary = [];
                var completeprocesssummary = [];
                var pendingapprovalsummary = [];
                var resultapprovalsummary = [];
                var resultdispatchsummary = [];
                if ($scope.StatisticSummary.length > 0) {
                    createdsummary = $scope.StatisticSummary[0].Value;
                }
                if ($scope.StatisticSummary.length > 1) {
                    acceptedsummary = $scope.StatisticSummary[1].Value;
                }
                if ($scope.StatisticSummary.length > 2) {
                    samplesummary = $scope.StatisticSummary[2].Value;
                }
                if ($scope.StatisticSummary.length > 3) {
                    pendingprocesssummary = $scope.StatisticSummary[3].Value;
                }
                if ($scope.StatisticSummary.length > 3) {
                    completeprocesssummary = $scope.StatisticSummary[4].Value;
                }
                if ($scope.StatisticSummary.length > 3) {
                    pendingapprovalsummary = $scope.StatisticSummary[5].Value;
                }
                if ($scope.StatisticSummary.length > 3) {
                    resultapprovalsummary = $scope.StatisticSummary[6].Value;
                }
                if ($scope.StatisticSummary.length > 3) {
                    resultdispatchsummary = $scope.StatisticSummary[7].Value;
                }

                for (var idx in createdsummary) {
                    var createdsmry = createdsummary[idx];
                    var Key = '';
                    var createdcount = 0;
                    Key = createdsmry.TestName;
                    createdcount = createdsmry.CreatedCount;
                    $scope.TestSummary.push({
                        'Key': Key,
                        'CreatedCount': createdcount,
                    })
                }
                for (var idx in acceptedsummary) {
                    var acceptedsmry = acceptedsummary[idx];
                    var Key = '';
                    var createdcount = 0;
                    var acceptedcount = 0;
                    Key = acceptedsmry.TestName;
                    acceptedcount = acceptedsmry.AcceptedCount;
                    var valappended = 0;
                    $scope.TestSummary.forEach(function (item) {
                        if (Key === item.Key) {
                            item.AcceptedCount = acceptedcount;
                            valappended = 1;
                        }
                    });
                    if (valappended == 0)
                        $scope.TestSummary.push({
                            'Key': Key,
                            'AcceptedCount': acceptedcount,
                        });
                }
                for (var idx in samplesummary) {
                    var samplesmry = samplesummary[idx];
                    var Key = '';
                    var sampleclctdcount = 0;
                    Key = samplesmry.TestName;
                    sampleclctdcount = samplesmry.SampleCollectedCount;
                    var valappended = 0;
                    $scope.TestSummary.forEach(function (item) {
                        if (Key === item.Key) {
                            item.SampleCollectedCount = sampleclctdcount;
                            valappended = 1;
                        }
                    });
                    if (valappended == 0)
                        $scope.TestSummary.push({
                            'Key': Key,
                            'SampleCollectedCount': sampleclctdcount,
                        });
                }
                for (var idx in pendingprocesssummary) {
                    var pendingsummary = pendingprocesssummary[idx];
                    var Key = '';
                    var pendingprocesscount = 0;
                    Key = pendingsummary.TestName;
                    pendingprocesscount = pendingsummary.PendingProcessCount;
                    var valappended = 0;
                    $scope.TestSummary.forEach(function (item) {
                        if (Key === item.Key) {
                            item.PendingProcessCount = pendingprocesscount;
                            valappended = 1;
                        }
                    });
                    if (valappended == 0)
                        $scope.TestSummary.push({
                            'Key': Key,
                            'PendingProcessCount': pendingprocesscount,
                        });
                }
                for (var idx in completeprocesssummary) {
                    var completesummary = completeprocesssummary[idx];
                    var Key = '';
                    var completeprocessCount = 0;
                    Key = completesummary.TestName;
                    completeprocessCount = completesummary.completeprocessCount;
                    var valappended = 0;
                    $scope.TestSummary.forEach(function (item) {
                        if (Key === item.Key) {
                            item.completeprocessCount = completeprocessCount;
                            valappended = 1;
                        }
                    });
                    if (valappended == 0)
                        $scope.TestSummary.push({
                            'Key': Key,
                            'CompleteProcessCount': completeprocessCount,
                        });
                }
                for (var idx in pendingapprovalsummary) {
                    var pendingapprovalsummary = pendingapprovalsummary[idx];
                    var Key = '';
                    var pendingapprovalCount = 0;
                    Key = pendingapprovalsummary.TestName;
                    pendingapprovalCount = pendingapprovalsummary.pendingapprovalCount;
                    var valappended = 0;
                    $scope.TestSummary.forEach(function (item) {
                        if (Key === item.Key) {
                            item.pendingapprovalCount = pendingapprovalCount;
                            valappended = 1;
                        }
                    });
                    if (valappended == 0)
                        $scope.TestSummary.push({
                            'Key': Key,
                            'PendingapprovalCount': pendingapprovalCount,
                        });
                }
                for (var idx in resultapprovalsummary) {
                    var resultapprovalsummary = resultapprovalsummary[idx];
                    var Key = '';
                    var resultapprovalCount = 0;
                    Key = resultapprovalsummary.TestName;
                    resultapprovalCount = resultapprovalsummary.resultapprovalCount;
                    var valappended = 0;
                    $scope.TestSummary.forEach(function (item) {
                        if (Key === item.Key) {
                            item.resultapprovalCount = resultapprovalCount;
                            valappended = 1;
                        }
                    });
                    if (valappended == 0)
                        $scope.TestSummary.push({
                            'Key': Key,
                            'ResultapprovalCount': resultapprovalCount,
                        });
                }
                for (var idx in resultdispatchsummary) {
                    var resultdispatchsummary = resultdispatchsummary[idx];
                    var Key = '';
                    var resultdispatchCount = 0;
                    Key = resultdispatchsummary.TestName;
                    resultdispatchCount = resultdispatchsummary.resultdispatchCount;
                    var valappended = 0;
                    $scope.TestSummary.forEach(function (item) {
                        if (Key === item.Key) {
                            item.resultdispatchCount = resultdispatchCount;
                            valappended = 1;
                        }
                    });
                    if (valappended == 0)
                        $scope.TestSummary.push({
                            'Key': Key,
                            'ResultdispatchCount': resultdispatchCount,
                        });
                }
            }
            // $scope.Totcreatedcount = 0;
            // $scope.TotIpCount = 0;
            // $scope.TotAllCount = 0;
            // var totcreatedcount = 0;
            // var totipcount = 0;
            // for (var ix in $scope.TestSummary) {
            //     let netsummary = $scope.TestSummary[ix];
            //     totcreatedcount += netsummary.createdcount;
            //     totipcount += netsummary.IpCount;
            // }
            // $scope.Totcreatedcount = totcreatedcount;
            // $scope.TotIpCount = totipcount;
            // $scope.TotAllCount = (totcreatedcount) + (totipcount);
        };

        $scope.getList = function () {
            var inputData = {
                Data: {
                    FacilityId: $scope.currentcontext.FacilityId,
                    Testtypeid: $scope.currentcontext.Testtypeid,
                    FromDate: $scope.currentfilter.From,
                    ToDate: $scope.currentfilter.To,
                    TestId: $scope.currentcontext.TestId,
                },
            };

            var options = {
                action: 'emr/patientorderdetail/GetTestStatisticsSummary',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.print = function () {
            var inputData = {
                Data: {
                    FacilityId: $scope.currentcontext.FacilityId,
                    Testtypeid: $scope.currentcontext.Testtypeid,
                    FromDate: $scope.currentfilter.From,
                    ToDate: $scope.currentfilter.To,
                    TestId: $scope.currentcontext.TestId,
                }
            };
            var options = {
                action: 'emr/patientorderdetail/PrintLabStatisticsSummary',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };
        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.getList();
            }
        };
        $scope.backtoReport = function () {
            $state.go('app.radiologyreports')
        };

        $scope.getList();

    }

    RadiologyStatisticsSummaryReportController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();