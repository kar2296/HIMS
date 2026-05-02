(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('performanceGlanceController', performanceGlanceController);

    function performanceGlanceController($rootScope, $filter, $scope, $stateParams, $state, $translate, utl, $timeout) {

        //$scope.setPageTitle($scope.i18n.appmanager.users.pagetitle.lbl);
        var vm = this;

        $scope.items = [];
        $scope.currentcontext = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            CurrentDate: utl.Formatter.getCurrentDate(),
        }
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        //getList

        $scope.getOPStatListCallback = function (scope, res, options, hasError) {
            $scope.OPStat = [];
            $scope.OPStat = res.Data;
        };

        $scope.getOPStatList = function () {
            var From = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [

                    {
                        Key: 2,
                        Value: From
                    },
                    {
                        Key: 3,
                        Value: To
                    },
                    {
                        Key: 4,
                        Value: $scope.currentcontext.FacilityId
                    },


                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'billing/OPStatistics/GetOPStatisticss',
                data: inputData,
                type: 'post',
                onComplete: $scope.getOPStatListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getRevenueListCallback = function (scope, res, options, hasError) {
            $scope.Revenue = [];
            var actualamt = 0;
            var month = 0;
            var curyearrev = 0;
            var preyearrev = 0;
            var growth = 0;
            for (var idx in res.Data) {
                var item = res.Data[idx];
                actualamt += item.ActualAmount;
                month += item.MonthToDay;
                curyearrev += item.CurrentYearRevenue;
                preyearrev += item.PreviousYearRevenue;
                growth += item.GrowthInYear;
                $scope.Revenue.push(item);
            }
            var gross = {
                BillType: 'Gross Total Revenue',
                ActualAmount: actualamt,
                MonthToDay: month,
                CurrentYearRevenue: curyearrev,
                PreviousYearRevenue: preyearrev,
                GrowthInYear: growth
            };
            $scope.Revenue.push(gross);

        };

        $scope.getRevenueList = function () {
            var From = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [

                    {
                        Key: 3,
                        Value: From
                    },
                    {
                        Key: 4,
                        Value: To
                    },
                    {
                        Key: 1,
                        Value: $scope.currentcontext.FacilityId
                    },


                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'billing/Revenue/GetRevenues',
                data: inputData,
                type: 'post',
                onComplete: $scope.getRevenueListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getTargetListCallback = function (scope, res, options, hasError) {
            $scope.RevenueTarget = [];
            for (var idx in res.Data) {
                var item = res.Data[idx];
                item.RevTarget = 0;
                item.RevenuePer = 0;
                item.RevTarget = ((item.RevenueTarget) / 100000);
                item.RevenuePer = ((item.RevenueTarget) / 100000) * 100;
                $scope.RevenueTarget.push(item);
            }
        };

        $scope.getTargetList = function () {
            var From = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [
                    {
                        Key: 1,
                        Value: $scope.currentcontext.FacilityId
                    },
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/RevenueTarget/GetRevenueTargets',
                data: inputData,
                type: 'post',
                onComplete: $scope.getTargetListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            // initDynamicForm();
            // $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Facility"
            },]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }

        $scope.initLookup();
        $scope.loadData = function () {
            $scope.getOPStatList();
            $scope.getRevenueList();
            $scope.getTargetList();
        }

        $scope.loadData();

    }

    performanceGlanceController.$inject = ['$rootScope', '$filter', '$scope', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();