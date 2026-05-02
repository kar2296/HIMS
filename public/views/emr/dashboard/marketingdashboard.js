(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('marketingdashboardController', marketingdashboardController);

    function marketingdashboardController($rootScope, $timeout, $scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.items = [];
        $scope.currentcontext = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            CurrentDate: utl.Formatter.getCurrentDate(),
        };
        $scope.currentcontext.MonthStart = new Date();
        $scope.currentcontext.firstDay = new Date($scope.currentcontext.MonthStart.getFullYear(), $scope.currentcontext.MonthStart.getMonth(), 1);
        $scope.currentcontext.lastDay = new Date($scope.currentcontext.MonthStart.getFullYear(), $scope.currentcontext.MonthStart.getMonth() + 1, 0);

        $scope.custom_sort = function (a, b) {
            if (b.Value && a.Value && b.Value.DisplayOrder && a.Value.DisplayOrder)
                return a.Value.DisplayOrder - b.Value.DisplayOrder;
            else
                return 0;
        }


        $scope.getReferralDoctorListCallback = function (scope, res, options, hasError) {
            $scope.ReferralDoctor = [];
            var grpData = _.groupBy(res.Data, 'ReferralId');

            for (var idx in grpData) {
                var item = grpData[idx];
                var RefData = {
                    OpCount: 0,
                    IpCount: 0,
                    RefName: '',
                };
                for (var kdx in item) {
                    var refsummary = item[kdx];
                    RefData.Referral = refsummary.Referral.ReferralName;
                    if (refsummary.EncounterTypeId == 1) {
                        RefData.OpCount++;
                    }
                    if (refsummary.EncounterTypeId == 2) {
                        RefData.IpCount++
                    }
                    RefData.TotalCount = (RefData.OpCount || 0) + (RefData.IpCount || 0);

                }
                $scope.ReferralDoctor.push(RefData);
            }
            var TotOPcount = 0;
            var TotIPcount = 0;
            var TotCount = 0;
            $scope.TotOP = 0;
            $scope.TotIP = 0;
            $scope.TotTotCount = 0;

            for (var idx in $scope.ReferralDoctor) {
                var OverallRefData = $scope.ReferralDoctor[idx];
                TotOPcount = TotOPcount + (OverallRefData.OpCount || 0);
                TotIPcount = TotIPcount + (OverallRefData.IpCount || 0);
                TotCount = TotCount + (OverallRefData.TotalCount || 0);
            }
            $scope.TotOP = TotOPcount;
            $scope.TotIP = TotIPcount;
            $scope.TotTotCount = TotCount;
        };

        $scope.getReferralDoctorList = function () {
            $scope.currentcontext.FromDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 00:00:00');
            $scope.currentcontext.ToDate = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [
                    {
                        Key: 17,
                        Value: $scope.currentcontext.FromDate
                    },
                    {
                        Key: 18,
                        Value: $scope.currentcontext.ToDate
                    },
                    {
                        Key: 1,
                        Value: $scope.currentcontext.FacilityId
                    },
                    // {
                    //     Key: 15,
                    //     Value: 2
                    // },

                    {
                        Key: 77,
                        Value: 9
                    }
                ]
            };


            var options = {
                action: "Visit/Visit/GetEncounters",
                data: inputData,
                type: 'post',
                onComplete: $scope.getReferralDoctorListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getInsuranceListCallback = function (scope, res, options, hasError) {
            $scope.Insurance = res.Data;
        };

        $scope.getInsuranceList = function () {
            $scope.currentcontext.FromDate = $filter('date')($scope.currentcontext.firstDay, 'yyyy-MM-dd 00:00:00');
            $scope.currentcontext.ToDate = $filter('date')($scope.currentcontext.lastDay, 'yyyy-MM-dd 23:59:59');
            var inputData = {
                Params: [
                    {
                        Key: 9,
                        Value: $scope.currentcontext.FromDate
                    },
                    {
                        Key: 10,
                        Value: $scope.currentcontext.ToDate
                    },
                    {
                        Key: 11,
                        Value: [-1, $scope.currentcontext.FacilityId]
                    },

                    {
                        Key: 2,
                        Value: [2, 3]
                    }
                ]
            };


            var options = {
                action: "generalmaster/guarantor/GetGuarantors",
                data: inputData,
                type: 'post',
                onComplete: $scope.getInsuranceListCallback
            };

            utl.Http.doAction(options);
        };
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.getReferralDoctorList();
        $scope.getInsuranceList();
    }
    marketingdashboardController.$inject = ['$rootScope', '$timeout', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();