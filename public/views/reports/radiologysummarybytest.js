(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('RadiologySummaryByTestController', RadiologySummaryByTestController);

    function RadiologySummaryByTestController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;
        $scope.LabTest = [];
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
            $scope.LabTest = res;
            $scope.TestData = [];
            $scope.NetTestData = [];
            if ($scope.LabTest) {
                var optestsummary = [];
                var iptestsummary = [];
                if ($scope.LabTest.length > 0) {
                    optestsummary = $scope.LabTest[0].Value;
                }
                if ($scope.LabTest.length > 1) {
                    iptestsummary = $scope.LabTest[1].Value;
                }

                for (var idx in optestsummary) {
                    var optest = optestsummary[idx];
                    var Key = '';
                    var opcount = 0;
                    var ipcount = 0;
                    Key = optest.TestName;
                    opcount = optest.OpCount;
                    $scope.NetTestData.push({
                        'Key': Key,
                        'OpCount': opcount,
                        'IpCount':0
                    })
                }
                for (var idx in iptestsummary) {
                    var iptest = iptestsummary[idx];
                    var Key = '';
                    var opcount = 0;
                    var ipcount = 0;
                    Key = iptest.TestName;
                    ipcount = iptest.IpCount;
                    var valappended = 0;
                    $scope.NetTestData.forEach(function (item) {
                        if (Key === item.Key) {
                            item.IpCount = ipcount;
                            valappended = 1;
                        }
                    });
                    if (valappended == 0)
                        $scope.NetTestData.push({
                            'Key': Key,
                            'OpCount': 0,
                            'IpCount': ipcount,
                        });
                }
            }
            $scope.TotOpCount = 0;
            $scope.TotIpCount = 0;
            $scope.TotAllCount = 0;
            var totopcount = 0;
            var totipcount = 0;
            for (var ix in $scope.NetTestData) {
                let netsummary = $scope.NetTestData[ix];
                totopcount += netsummary.OpCount;
                totipcount += netsummary.IpCount;
            }
            $scope.TotOpCount = totopcount;
            $scope.TotIpCount = totipcount;
            $scope.TotAllCount = (totopcount) + (totipcount);
        }
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
                action: 'emr/patientorderdetail/GetTestEncountertypeSummary',
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
                action: 'emr/patientorderdetail/PrintLabSummaryByTest',
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


        // $scope.print = function () {
        //     var inputData = {
        //         Data: {
        //             DoctorName: $scope.DoctorName,
        //             WardName: $scope.WardName,
        //             GuarantorName: $scope.GuarantorName,
        //             AdmissionStatus: $scope.AdmissionStatus

        //         },
        //         Params: [{
        //             Key: 10,
        //             Value: $scope.currentfilter.GuarantorId
        //         },
        //         {
        //             Key: 7,
        //             Value: $scope.currentfilter.DoctorId
        //         },
        //         {
        //             Key: 8,
        //             Value: $scope.currentfilter.WardId
        //         },
        //         {
        //             Key: 2,
        //             Value: 1
        //         },
        //         {
        //             Key: 6,
        //             Value: $scope.currentfilter.AdmissionStatusId
        //         },
        //         // {
        //         //     Key: 6,
        //         //     Value: "2,3,4,5,"
        //         // }
        //         ],
        //             };
        //             var options = {
        //                 action: 'IPManagement/BedOccupancyHistory/PrintBedOccupancyHistorys',
        //                 data: inputData,
        //                 type: 'post',
        //             };
        //             utl.Http.doDownload(options);
        //         };

        $scope.getList();

    }

    RadiologySummaryByTestController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();