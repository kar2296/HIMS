(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('facilitystoredashboardController', facilitystoredashboardController);

    function facilitystoredashboardController($rootScope, $scope, $timeout, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        $scope.items = [];
        $scope.lookup = {};
        $scope.ExpiredData = [];
        $scope.NearExpiryData = [];
        $scope.currentcontext = {
            FacilityId: utl.Session.getCurrentFacilityId(),
            DoctorId: parseInt(utl.Session.getCurrentUserId()),
            FromDate: utl.Formatter.getCurrentDate(),
            ToDate: utl.Formatter.addDays(utl.Formatter.getCurrentDate(), +30),
            // FromDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00'),
            // ToDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59'),
        }
        $scope.item = {
            StoreMasterId: 0
        };

        // $scope.ExpiredMedicine = [];


        $scope.getExpiredMedicineCallback = function (scope, data, options, hasError) {
            $scope.ExpiredData = [];
            $scope.ExpiredData = data.Data;

        };

        $scope.getExpiredMedicine = function () {
            var TodayDate = new Date().toISOString().slice(0, 10);
            var inputData = {
                Params: [{
                        Key: 8,
                        Value: TodayDate
                    },
                    {
                        Key: 3,
                        Value: $scope.currentcontext.FacilityId
                    },
                ],
                PageContext: {
                    PageSize: 15,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'pharmacy/stockserialitem/GetExpiredSerialItems',
                data: inputData,
                type: 'post',
                onComplete: $scope.getExpiredMedicineCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getNearExpiryCallback = function (scope, data, options, hasError) {
            $scope.NearExpiryData = [];
            $scope.NearExpiryData = data.Data;
            // $scope.NearExpiryData = [];
            // for (var idx in data.Data) {
            //     var storemaster = data.Data[idx];
            //     storemaster.ExpiryWarningDays = storemaster.StoreMaster.ExpiryWarningDays;
            //     $scope.NearExpiryData.push(storemaster);
            // }

        };
        $scope.getNearExpiry = function () {
            $scope.currentcontext.warningToDate = utl.Formatter.addDays(utl.Formatter.getCurrentDate(), +$scope.item.ExpiryWarningDays);
            var From = $filter('date')($scope.currentcontext.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentcontext.warningToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                        Key: 7,
                        Value: From
                    },
                    {
                        Key: 8,
                        Value: To
                    },
                    {
                        Key: 3,
                        Value: $scope.currentcontext.FacilityId
                    },
                    // {
                    //     Key: 2,
                    //     Value: $scope.item.StorMasterId
                    // },

                ],
                PageContext: {
                    PageSize: 15,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'pharmacy/stockserialitem/GetStockSerialItems',
                data: inputData,
                type: 'post',
                onComplete: $scope.getNearExpiryCallback
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
            forEach(data, function (value, key) {
                $scope.lookup[key] = value;
                if (key == 'UserStores' && $scope.item.StoreMasterId === 0) {
                    $scope.item.StoreMasterId = value[0].Id;
                    $scope.item.ExpiryWarningDays = value[0].StoreMaster.ExpiryWarningDays;
                } else if (key == 'UserStores' && $scope.item.StoreMasterId > 0) {
                    for (var userstoreid = 0; userstoreid < $scope.lookup['UserStores'].length; userstoreid++) {
                        if ($scope.lookup['UserStores'][userstoreid].Id == $scope.item.StoreMasterId) {
                            $scope.item.ExpiryWarningDays = $scope.lookup['UserStores'][userstoreid].StoreMaster.ExpiryWarningDays;
                        }
                    }
                }
            });
            $scope.LoadDashboard();

        };

        $scope.initLookup = function () {
            var inputData = [{
                    "Key": "Facility"
                },
                {
                    "Key": "UserStores",
                    Request: {
                        Params: [{
                                Key: 1,
                                Value: utl.Session.getCurrentUserId()
                            },
                            {
                                Key: 2,
                                Value: $scope.item.FacilityId
                            },
                            {
                                Key: 5,
                                Value: 2
                            }
                        ]
                    },
                    Default: false
                }
            ];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };
        $scope.initLookup();
        $scope.LoadDashboard = function () {
            $scope.getExpiredMedicine();
            $scope.getNearExpiry();
        }

    }
    facilitystoredashboardController.$inject = ['$rootScope', '$scope', '$timeout', '$filter', '$stateParams', '$state', '$translate', 'utl'];
})();