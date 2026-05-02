(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('clinicaldashboardController', clinicaldashboardController);

    function clinicaldashboardController($rootScope, $timeout, $scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.items = [];
        $scope.currentcontext = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            FromDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00'),
            ToDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59'),
        }
        $scope.currentfilter = {};
        $scope.lookup = {};
        var today = new Date();
        $scope.currentfilter.MonthStart = today;
        $scope.currentfilter.firstDay = new Date($scope.currentfilter.MonthStart.getFullYear(), $scope.currentfilter.MonthStart.getMonth(), 1);
        $scope.currentfilter.lastDay = new Date($scope.currentfilter.MonthStart.getFullYear(), $scope.currentfilter.MonthStart.getMonth() + 1, 0);
        $scope.currentfilter.MonthNo = $scope.currentfilter.firstDay.getMonth() + 1;
        $scope.currentfilter.Year = $scope.currentfilter.firstDay.getFullYear();
        $scope.currentfilter.FilterMonthId = $scope.currentfilter.MonthNo;


        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'FinancialYear' && $scope.currentfilter.Year) {
                    for (var ldx in $scope.lookup.FinancialYear) {
                        var fyear = $scope.lookup.FinancialYear[ldx];
                        if (fyear.YearName == $scope.currentfilter.Year) {
                            $scope.currentfilter.FinancialYearId = fyear.Id;
                        }
                    }
                }
            });
        }


        $scope.initLookup = function () {
            var inputData = [{
                "Key": "Month"
            },
            {
                "Key": "FinancialYear"
            }]
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            $scope.$doAction(options);
        }

        $scope.initLookup();

    }
    clinicaldashboardController.$inject = ['$rootScope', '$timeout', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();