(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('LabSummaryBySampleController', LabSummaryBySampleController);

    function LabSummaryBySampleController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;
        $scope.LabSamples = [];
        $scope.currentcontext = {};
        $scope.currentfilter = {
            From: $filter('date')(new Date(), 'yyyy-MM-dd 00:00:00'),
            To: $filter('date')(new Date(), 'yyyy-MM-dd 23:59:59'),
        }
        $scope.currentcontext = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            Testtypeid: 1,
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.getCurrentDate(),
            SampleTypeId: 0,
        }
        $scope.getListCallBack = function (scope, res, options, hasError) {
            $scope.LabSamples = res;
            $scope.SampleSummary = [];
            if ($scope.LabSamples) {
                var opsamplesummary = [];
                var ipsamplesummary = [];
                if ($scope.LabSamples.length > 0) {
                    opsamplesummary = $scope.LabSamples[0].Value;
                }
                if ($scope.LabSamples.length > 1) {
                    ipsamplesummary = $scope.LabSamples[1].Value;
                }

                for (var idx in opsamplesummary) {
                    var opsample = opsamplesummary[idx];
                    var Key = '';
                    var opcount = 0;
                    var ipcount = 0;
                    Key = opsample.SampleName;
                    opcount = opsample.OpCount;
                    $scope.SampleSummary.push({
                        'Key': Key,
                        'OpCount': opcount,
                        'IpCount':0
                    })
                }
                for (var idx in ipsamplesummary) {
                    var ipsample = ipsamplesummary[idx];
                    var Key = '';
                    var opcount = 0;
                    var ipcount = 0;
                    Key = ipsample.SampleName;
                    ipcount = ipsample.IpCount;
                    var valappended = 0;
                    $scope.SampleSummary.forEach(function (item) {
                        if (Key === item.Key) {
                            item.IpCount = ipcount;
                            valappended = 1;
                        }
                    });
                    if (valappended == 0)
                        $scope.SampleSummary.push({
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
            for (var ix in $scope.SampleSummary) {
                let netsummary = $scope.SampleSummary[ix];
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
                    FromDate: $scope.currentfilter.From,
                    ToDate: $scope.currentfilter.To,
                    SampleTypeId: $scope.currentcontext.SampleTypeId,
                },
            };

            var options = {
                action: 'lis/patientworkorderdetails/GetEncounterTypeBySample',
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
                    FromDate: $scope.currentfilter.From,
                    ToDate: $scope.currentfilter.To,
                    SampleTypeId: $scope.currentcontext.SampleTypeId,
                }
            };
            var options = {
                action: 'lis/patientworkorderdetails/PrintLabSummaryBySample',
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
            $state.go('app.labreports')
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

    LabSummaryBySampleController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();