(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('covidstatisticsreportController', covidstatisticsreportController);

    function covidstatisticsreportController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.items = [];
        $scope.currentcontext = {};
        $scope.currentfilter = {
            From: utl.Formatter.getCurrentDate(),
            To: utl.Formatter.getCurrentDate(),
        }
        $scope.currentcontext = {
            FacilityId: utl.Session.getCurrentFacilityId(),

        }
        if ($stateParams.context) {
            $scope.Context = $stateParams.context;
        }
        $scope.GetFacilityDashboardOptionsCallBack = function (scope, res, options, hasError) {
            $scope.CovidInfo = res;
            $scope.Total= (res.admissionInfo.covidventilatorCount||0)+
                (res.admissionInfo.covidHighflowO2Count||0)+
             (res.admissionInfo.covidmildCount||0)
            $scope.tenDaysCount = res.admissionInfo.Covid10dayCount;
            $scope.CovidInfo.admissionInfo.Cov10DayCount = 0;
            for (var idx in $scope.tenDaysCount) {
                var Daydiff = $scope.tenDaysCount[idx];
                var date1 = new Date(Daydiff.AdmDate);
                var date2 = new Date(Daydiff.DiscDate);
                var Difference_In_Time = date2.getTime() - date1.getTime();
               var timeDuration = parseInt(Difference_In_Time / (1000 * 3600 * 24));
                var diffDay = date2.getDay() - date1.getDay();
                var difmonths = date2.getMonth() - date1.getMonth();
                var difDate = date2.getDate() - date1.getDate();
                if (timeDuration < 10) {
                    $scope.CovidInfo.admissionInfo.Cov10DayCount++;
                }
            }

            //console.log($scope.FacilityInfo);

        }


        $scope.GetFacilityDashboardOptions = function () {
            var startTime = new Date($scope.currentfilter.From);
            var endTime = new Date($scope.currentfilter.To);
            var difference = endTime.getTime() - startTime.getTime();
            var resultInDays = Math.round(difference / (1000 * 60 * 60 * 24)); // Calculate difference in days
            if (!(resultInDays >= 0 && resultInDays <= 31)) { // Check if difference is less than 15 days
                utl.Alert.showSuccessMsg("From and To Date Difference should be less than one month...");
                $scope.currentfilter.From = new Date();
                $scope.currentfilter.To = new Date();
                return false;
            }
            $scope.currentcontext.FromDate = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00');
            $scope.currentcontext.ToDate = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59');


            var inputData = {
                Data: {
                    Keys: [{
                        Key: 'bedInfo'
                    },
                    {
                        Key: 'admissionInfo'
                    }
                    ]
                },
                Attributes: $scope.currentcontext
            };

            var options = {
                action: 'SystemSettings/facilitydashboard/GetFacilityCovidBedDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.GetFacilityDashboardOptionsCallBack
            };
            utl.Http.doAction(options);
        };
        $scope.SelectedCategory = function (selectedItem) {
            $scope.currentfilter.Category = selectedItem.ServiceCategoryName;
        };
        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                }
            };
            var options = {
                action: 'GeneralMaster/WardRoomBedMaster/PrintCovidStatisticsReport',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };
        $scope.onenter = function (data) {
            if (data == undefined) {
                // $scope.GetFacilityDashboardOptions();
            }
        };
        $scope.backtoReport = function () {
            if ($scope.Context == 'ipopreport') {
                $state.go('app.ipopreportstab.inpatientreport');
            } if ($scope.Context == 'mrdreports') {
                $state.go('app.mrdreports');
            } 
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            // $scope.GetFacilityDashboardOptions();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "ServiceCategory" }
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
    covidstatisticsreportController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();