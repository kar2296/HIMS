(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('IPOccupancyByWardController', IPOccupancyByWardController);

    function IPOccupancyByWardController($scope, $stateParams, $state, $translate, $filter, utl) {
        var vm = this;
        $scope.items = [];
        $scope.currentcontext = {};
         
        $scope.currentcontext = {
            FacilityId: utl.Session.getCurrentFacilityId(),

        }
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.getWardInfoDashBoardCallBack = function (scope, res, options, hasError) {
            $scope.Wards = res.Data;
            $scope.wardtotal = { BedsCount: 0, OccupiedBeds: 0, AvailableBeds: 0, OtherBeds: 0 };
            $scope.Wards.forEach((v) => {
                $scope.wardtotal.BedsCount += parseInt(v.BedsCount);
                $scope.wardtotal.OccupiedBeds += parseInt(v.OccupiedBeds);
                $scope.wardtotal.AvailableBeds += parseInt(v.AvailableBeds);
                $scope.wardtotal.OtherBeds += parseInt(v.OtherBeds);
            });
        }

        $scope.getWardInfoDashBoard = function () {
            var inputData = {
                Data: { 
                    FacilityId: $scope.currentcontext.FacilityId 
                }
            };

            var options = {
                action: 'generalmaster/wardmaster/GetWardInfoDashBoard',
                data: inputData,
                type: 'post',
                onComplete: $scope.getWardInfoDashBoardCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.print = function () { 
            var inputData = {
                Data: {
                    FacilityId: $scope.currentcontext.FacilityId 
                }
            };
            var options = {
                action: 'generalmaster/wardmaster/PrintIPOccupanyWardReport',
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
            if ($scope.Context == 'ipopreport') {
                $state.go('app.ipopreportstab.inpatientreport');
            } if ($scope.Context == 'mrdreports') {
                $state.go('app.mrdreports');
            }

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
 
        $scope.LoadDashboard = function () { 
            $scope.getWardInfoDashBoard(); 
        }

        $scope.LoadDashboard();

    }

    IPOccupancyByWardController.$inject = ['$scope', '$stateParams', '$state', '$translate', '$filter', 'utl'];

})();