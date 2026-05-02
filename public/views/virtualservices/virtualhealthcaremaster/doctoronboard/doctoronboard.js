(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('DoctoronboardController', DoctoronboardController);

    function DoctoronboardController($rootScope,$scope ,$timeout,$stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        $scope.item = {
            IsActive: true,
            isDisabled: false,
        };
        $scope.currentfilter = {
            CompletedDate: utl.Formatter.getCurrentDate(),
        }
        $scope.Items = {};
        $scope.todayonboard = {};
        $scope.todayrejectedonboard = {};
        $scope.todayapprovedonboard = {};
        $scope.spacility = {};
        $scope.Items.TodayOnboardCount = '0';
        $scope.Items.TodayApprovedOnboardCount = '0';
        $scope.Items.TodayRejectOnboardCount = '0';
        $scope.Items.TodayTotalOnboardCount = '0';

        $scope.currentcontext = {};
        // $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext = {
            FromDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00'),
            ToDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59'),
            FacilityId: utl.Session.getCurrentFacilityId(),
            From: utl.Formatter.addMonths(utl.Formatter.getCurrentDate(), -1),
            To: utl.Formatter.getCurrentDate()
        };
        $scope.gettodayonboardCallback = function (scope, res, options, hasError) {
            $scope.todayonboard = res.Data || [];
        };

        $scope.gettodayonboard = function () {
            var From = $filter('date')($scope.currentcontext.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentcontext.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
                        Key: 3,
                        Value: 2
                    },
                    {
                        Key: 5,
                        Value: 2
                    },
                    { Key: 29, Value: From },
                    { Key: 30, Value: To },
                ],
            };
            var options = {
                action: 'appmanager/user/GetUsers',
                data: inputData,
                type: 'post',
                onComplete: $scope.gettodayonboardCallback
            };

            utl.Http.doAction(options);
        };
        $scope.gettodayapprovedonboardCallback = function (scope, res, options, hasError) {
            $scope.todayapprovedonboard = res.Data || [];
        };

        $scope.gettodayapprovedonboard = function () {
            var From = $filter('date')($scope.currentcontext.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentcontext.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
                        Key: 3,
                        Value: 2
                    },
                    {
                        Key: 5,
                        Value: 1
                    },
                    { Key: 29, Value: From },
                    { Key: 30, Value: To },
                ],
            };
            var options = {
                action: 'appmanager/user/GetUsers',
                data: inputData,
                type: 'post',
                onComplete: $scope.gettodayapprovedonboardCallback
            };

            utl.Http.doAction(options);
        };
        $scope.gettodayspacilityCallback = function (scope, res, options, hasError) {
            $scope.spacility = [];
            var grpData = _.groupBy(res.Data, 'VirtualSubCategoryId');
            for (var grpKey in grpData) {
                var grpspdata = grpData[grpKey]
                var specdata={
                    specName:'',
                    Count:0,
                }
                specdata.specName = grpspdata[0].VirtualSubCategory.SubCategoryName;
                specdata.Count = grpspdata.length;
                // var td = _.find(grpData[grpKey]);
                $scope.spacility.push(specdata);
            }
            $scope.spacility.totalItems = res.PageContext.TotalRecords;
        };

        $scope.gettodayspacility = function () {
            var From = $filter('date')($scope.currentcontext.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentcontext.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
                        Key: 3,
                        Value: 2
                    },
                    // {
                    //     Key: 5,
                    //     Value: 3
                    // },
                    { Key: 29, Value: From },
                    { Key: 30, Value: To },
                ],
            };
            var options = {
                action: 'appmanager/user/GetUsers',
                data: inputData,
                type: 'post',
                onComplete: $scope.gettodayspacilityCallback
            };

            utl.Http.doAction(options);
        };

        $scope.gettodayrejecteddonboardCallback = function (scope, res, options, hasError) {
            $scope.todayrejectedonboard = res.Data || [];
        };

        $scope.gettodayrejecteddonboard = function () {
            var From = $filter('date')($scope.currentcontext.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentcontext.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
                        Key: 3,
                        Value: 2
                    },
                    {
                        Key: 5,
                        Value: 3
                    },
                    { Key: 36, Value: From },
                    { Key: 37, Value: To },
                ],
            };
            var options = {
                action: 'appmanager/user/GetUsers',
                data: inputData,
                type: 'post',
                onComplete: $scope.gettodayrejecteddonboardCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getCountCallBack = function (scope, res, options, hasError) {
            $scope.Items.TodayOnboardCount = res.Userbo.TodayOnboardCount;
            $scope.Items.TodayApprovedOnboardCount = res.Userbo.TodayApprovedOnboardCount;
            $scope.Items.TodayRejectOnboardCount = res.Userbo.TodayRejectOnboardCount;
            $scope.Items.TodayTotalOnboardCount = res.Userbo.TodayTotalOnboardCount;
            if (!$scope.Items.TodayOnboardCount)
                $scope.Items.TodayOnboardCount = '0';
            if (!$scope.Items.TodayApprovedOnboardCount)
                $scope.Items.TodayApprovedOnboardCount = '0';
            if (!$scope.Items.TodayRejectOnboardCount)
                $scope.Items.TodayRejectOnboardCount = '0';
            if (!$scope.Items.TodayTotalOnboardCount)
                $scope.Items.TodayTotalOnboardCount = '0';
        };
        $scope.getCount = function () {
            var inputData = {
                Data: {
                    Keys: [
                        { Key: 'Userbo' },

                    ]
                },
                Attributes: $scope.currentcontext
            };

            var options = {
                action: 'appmanager/DoctorDashboard/GetDoctorDashboardOptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getCountCallBack
            };
            utl.Http.doAction(options);
        };
          /* Side Menu close*/
          $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }
        /* Side Menu close*/
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getCount();
            $scope.gettodayonboard();
            $scope.gettodayapprovedonboard();
            $scope.gettodayrejecteddonboard();
            $scope.gettodayspacility();
        }

        $scope.initLookup = function () {
            var inputData = []
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

    DoctoronboardController.$inject = ['$rootScope','$scope','$timeout', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();