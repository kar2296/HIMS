(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('volumeGlanceController', volumeGlanceController);

    function volumeGlanceController($rootScope, $scope, $filter, $stateParams, $state, $translate, utl, $timeout) {
        var vm = this;

        $scope.items = [];
        $scope.currentcontext = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            CurrentDate: utl.Formatter.getCurrentDate(),
        }
        $scope.lookup = {};
        /* Side Menu close*/
        $timeout(function () {
            removeFloatingNav();
        }, 100);

        function removeFloatingNav() {
            $rootScope.app.layout.isCollapsed = true;
        }


        //getList


        $scope.getOPCatListCallback = function (scope, res, options, hasError) {
            $scope.OPCat = [];
            $scope.OPCat = res.Data;
        };

        $scope.getOPList = function () {
            var From = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [{
                    Key: 4,
                    Value: $scope.currentcontext.FacilityId
                },

                {
                    Key: 2,
                    Value: From
                },
                {
                    Key: 3,
                    Value: To
                },
                {
                    Key: 5,
                    Value: 'OP'
                },
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'billing/CategoryRevenue/GetCategoryRevenues',
                data: inputData,
                type: 'post',
                onComplete: $scope.getOPCatListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getIPCatListCallback = function (scope, res, options, hasError) {
            $scope.IPCat = [];
            $scope.IPCat = res.Data;
        };

        $scope.getIPList = function () {
            var From = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentcontext.CurrentDate, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Params: [{
                    Key: 4,
                    Value: $scope.currentcontext.FacilityId
                },

                {
                    Key: 2,
                    Value: From
                },
                {
                    Key: 3,
                    Value: To
                },
                {
                    Key: 5,
                    Value: 'IP'
                },
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'billing/CategoryRevenue/GetCategoryRevenues',
                data: inputData,
                type: 'post',
                onComplete: $scope.getIPCatListCallback
            };

            utl.Http.doAction(options);
        };

        //Grid Actions


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
            $scope.getOPList();
            $scope.getIPList();
        }

        $scope.loadData();

    }

    volumeGlanceController.$inject = ['$rootScope', '$scope', '$filter', '$stateParams', '$state', '$translate', 'utl', '$timeout'];

})();