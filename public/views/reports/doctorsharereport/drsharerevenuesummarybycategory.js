(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('drsharerevenuesummarybycategoryController', drsharerevenuesummarybycategoryController);

    function drsharerevenuesummarybycategoryController($scope, $filter, $stateParams, $state, $translate, utl) {
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

        $scope.GetFacilityDashboardOptionsCallBack = function (scope, res, options, hasError) {
            $scope.CategoryInfo = res;
            $scope.category = [];
            $scope.totcategory = [];
            $scope.opcategory = [];
            $scope.totopcategory = [];
            $scope.ipcategory = [];
            $scope.totipcategory = [];
            $scope.drsharecategory = [];
            $scope.totdrsharecategory = [];
            $scope.providersharecategory = [];
            $scope.totprovidersharecategory = [];
            if ($scope.CategoryInfo) {
                var opcollection = [];
                var ipcollection = [];
                var drsharecollection = [];
                var providersharecollection = [];

                if ($scope.CategoryInfo.length > 0)
                    opcollection = $scope.CategoryInfo[0].Value;


                if ($scope.CategoryInfo.length > 1)
                    ipcollection = $scope.CategoryInfo[1].Value;

                if ($scope.CategoryInfo.length > 2)
                    drsharecollection = $scope.CategoryInfo[2].Value;

                if ($scope.CategoryInfo.length > 3)
                    providersharecollection = $scope.CategoryInfo[3].Value;

                var opTotNetAmt = 0;
                for (var idx in opcollection) {
                    var coll = opcollection[idx];
                    var NetAmt = 0;
                    var key = '';
                    for (var idx in coll) {
                        key = coll[idx].ServiceCategoryName;
                        NetAmt += coll[idx].NetAmount;
                    }
                    opTotNetAmt += NetAmt;
                    $scope.opcategory.push({
                        'Key': key,
                        'Value': NetAmt
                    });
                    $scope.category.push({
                        'Key': key,
                        'Value': {
                            'OP': NetAmt,
                            'IP': 0.00,
                            'DrShare': 0.00,
                            'ProviderShare': 0.00,
                        }
                    });
                }
                $scope.totopcategory.push({
                    'Key': 'Total',
                    'Value': opTotNetAmt
                });
                var ipTotNetAmt = 0;
                for (var idx in ipcollection) {
                    var coll = ipcollection[idx];
                    var NetAmt = 0;
                    var key = '';
                    for (var idx in coll) {
                        key = coll[idx].ServiceCategoryName;
                        NetAmt += coll[idx].NetAmount;
                    }
                    ipTotNetAmt += NetAmt;
                    $scope.ipcategory.push({
                        'Key': key,
                        'Value': NetAmt
                    });

                    var valappended = 0;
                    $scope.category.forEach(function (item) {
                        if (key === item.Key) {
                            item.Value.IP = NetAmt;
                            valappended = 1;
                        }
                    });

                    if (valappended == 0)
                        $scope.category.push({
                            'Key': key,
                            'Value': {
                                'OP': 0.00,
                                'IP': NetAmt,
                                'DrShare': 0.00,
                                'ProviderShare': 0.00,
                            }
                        });

                }
                $scope.totipcategory.push({
                    'Key': 'Total',
                    'Value': ipTotNetAmt
                });

                var drshareTotNetAmt = 0;
                for (var idx in drsharecollection) {
                    var coll = drsharecollection[idx];
                    var NetAmt = 0;
                    var key = '';
                    for (var idx in coll) {
                        key = coll[idx].ServiceCategoryName;
                        NetAmt += coll[idx].NetAmount;
                    }
                    drshareTotNetAmt += NetAmt;
                    $scope.drsharecategory.push({
                        'Key': key,
                        'Value': NetAmt
                    });

                    var valappended = 0;
                    $scope.category.forEach(function (item) {
                        if (key === item.Key) {
                            item.Value.DrShare = NetAmt;
                            valappended = 1;
                        }
                    });

                    if (valappended == 0)
                        $scope.category.push({
                            'Key': key,
                            'Value': {
                                'OP': 0.00,
                                'IP': 0.00,
                                'DrShare': NetAmt,
                                'ProviderShare': 0.00,
                            }
                        });

                }
                $scope.totdrsharecategory.push({
                    'Key': 'Total',
                    'Value': drshareTotNetAmt
                });

                var providershareTotNetAmt = 0;
                for (var idx in providersharecollection) {
                    var coll = providersharecollection[idx];
                    var NetAmt = 0;
                    var key = '';
                    for (var idx in coll) {
                        key = coll[idx].ServiceCategoryName;
                        NetAmt += coll[idx].NetAmount;
                    }
                    providershareTotNetAmt += NetAmt;
                    $scope.providersharecategory.push({
                        'Key': key,
                        'Value': NetAmt
                    });

                    var valappended = 0;
                    $scope.category.forEach(function (item) {
                        if (key === item.Key) {
                            item.Value.ProviderShare = NetAmt;
                            valappended = 1;
                        }
                    });

                    if (valappended == 0)
                        $scope.category.push({
                            'Key': key,
                            'Value': {
                                'OP': 0.00,
                                'IP': 0.00,
                                'DrShare': 0.00,
                                'ProviderShare': NetAmt
                            }
                        });

                }
                $scope.totprovidersharecategory.push({
                    'Key': 'Total',
                    'Value': providershareTotNetAmt
                });

                $scope.category.push({
                    'Key': 'Total',
                    'Value': {
                        'OP': opTotNetAmt,
                        'IP': ipTotNetAmt,
                        'DrShare': drshareTotNetAmt,
                        'ProviderShare': providershareTotNetAmt,
                    }
                });

            }
        }

        $scope.GetFacilityDashboardOptions = function () {
            var startTime = new Date($scope.currentfilter.FromDate);
            var endTime = new Date($scope.currentfilter.ToDate);
            var difference = endTime.getTime() - startTime.getTime();
            var resultInDays = Math.round(difference / (1000 * 60 * 60 * 24)); // Calculate difference in days
            if (!(resultInDays >= 0 && resultInDays < 90)) { // Check if difference is less than 3 months
                utl.Alert.showSuccessMsg("From and To Date Difference should be less than three months...");
                $scope.currentfilter.FromDate = new Date();
                $scope.currentfilter.ToDate = new Date();
                return false;
            }
            var From = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    CategoryId: $scope.currentfilter.CategoryId || 0

                },
            };


            var options = {
                action: 'billing/CollectionBaseRevenue/GetRevenueCategorySummary',
                data: inputData,
                type: 'post',
                onComplete: $scope.GetFacilityDashboardOptionsCallBack
            };
            utl.Http.doAction(options);
        };
        $scope.SelectedCategory = function (selectedItem) {
            $scope.currentfilter.CategoryName = selectedItem.ServiceCategoryName;
        };
        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    CategoryId: $scope.currentfilter.CategoryId || 0,
                    CategoryName: $scope.currentfilter.Category
                }
            };
            var options = {
                action: 'billing/CollectionBaseRevenue/PrintRevenueSummaryCategoryReport',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };
        $scope.onenter = function (data) {
            if (data == undefined) {
                $scope.GetFacilityDashboardOptions();
            }
        };
        $scope.backtoReport = function () {
            $state.go('app.financereporttab.doctorsharereport')
        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            // $scope.GetFacilityDashboardOptions();
        }

        $scope.initLookup = function () {
            var inputData = [{
                "Key": "ServiceCategory"
            }]
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
    drsharerevenuesummarybycategoryController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();