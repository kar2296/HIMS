(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('RevenueSummaryByCategoryController', RevenueSummaryByCategoryController);

    function RevenueSummaryByCategoryController($scope, $filter, $stateParams, $state, $translate, utl) {
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
            $scope.FacilityInfo = res;
            $scope.GetCategoryCollection();

            //console.log($scope.FacilityInfo);

        }

        $scope.GetCategoryCollection = function () {
            $scope.FacilityInfo.category = [];
            $scope.FacilityInfo.totcategory = [];
            $scope.FacilityInfo.opcategory = [];
            $scope.FacilityInfo.totopcategory = [];
            $scope.FacilityInfo.ipcategory = [];
            $scope.FacilityInfo.totipcategory = [];
            if ($scope.FacilityInfo.categorycollection) {
                var opcollection = [];
                var ipcollection = [];

                if ($scope.FacilityInfo.categorycollection.length > 0)
                    opcollection = $scope.FacilityInfo.categorycollection[0].Value;


                if ($scope.FacilityInfo.categorycollection.length > 1)
                    ipcollection = $scope.FacilityInfo.categorycollection[1].Value;

                var opTotNetAmt = 0;
                for (var idx in opcollection) {
                    var coll = opcollection[idx];
                    var NetAmt = 0;
                    var key = '';
                    for (var idx in coll) {
                        key = coll[idx].ServiceCategoryName;
                        NetAmt += parseFloat(coll[idx].NetAmount);
                    }
                    opTotNetAmt += NetAmt;
                    $scope.FacilityInfo.opcategory.push({
                        'Key': key,
                        'Value': NetAmt
                    });
                    $scope.FacilityInfo.category.push({
                        'Key': key,
                        'Value': {
                            'OP': NetAmt,
                            'IP': 0.00
                        }
                    });
                }
                $scope.FacilityInfo.totopcategory.push({
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
                        NetAmt += parseFloat(coll[idx].NetAmount);
                    }
                    ipTotNetAmt += NetAmt;
                    $scope.FacilityInfo.ipcategory.push({
                        'Key': key,
                        'Value': NetAmt
                    });

                    var valappended = 0;
                    $scope.FacilityInfo.category.forEach(function (item) {
                        if (key === item.Key) {
                            item.Value.IP = NetAmt;
                            valappended = 1;
                        }
                    });

                    if (valappended == 0)
                        $scope.FacilityInfo.category.push({
                            'Key': key,
                            'Value': {
                                'OP': 0.00,
                                'IP': NetAmt
                            }
                        });

                }
                $scope.FacilityInfo.totipcategory.push({
                    'Key': 'Total',
                    'Value': ipTotNetAmt
                });

                $scope.FacilityInfo.category.push({
                    'Key': 'Total',
                    'Value': {
                        'OP': opTotNetAmt,
                        'IP': ipTotNetAmt
                    }
                });

            }
        }

        $scope.GetFacilityDashboardOptions = function () {

            var startTime = new Date($scope.currentfilter.From);
            var endTime = new Date($scope.currentfilter.To);
            var difference = endTime.getTime() - startTime.getTime();
            var resultInDays = Math.round(difference / (1000 * 60 * 60 * 24)); // Calculate difference in days
            if (!(resultInDays >= 0 && resultInDays < 90)) { // Check if difference is less than 3 months
                utl.Alert.showSuccessMsg("From and To Date Difference should be less than three months...");
                $scope.currentfilter.From = new Date();
                $scope.currentfilter.To = new Date();
                return false;
            }
            $scope.currentcontext.FromDate = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00');
            $scope.currentcontext.ToDate = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59');
            if ($scope.currentfilter.ServiceCategoryId == -1) {
                $scope.currentfilter.ServiceCategoryId = 0;
            }
            $scope.currentcontext.ServiceCategoryId = $scope.currentfilter.ServiceCategoryId || 0

            var inputData = {
                Data: {
                    Keys: [{
                        Key: 'categorycollection'
                    }]
                },
                Attributes: $scope.currentcontext
            };

            var options = {
                action: 'SystemSettings/facilitydashboard/GetFacilityDashboardsReport',
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
                    ServiceCategoryId: $scope.currentfilter.ServiceCategoryId || 0,
                    CategoryName: $scope.currentfilter.Category
                }
            };
            var options = {
                action: 'billing/PatientBillDetails/PrintRevenueSummaryCategoryReport',
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
            if ($scope.Context == 'revenuesummary') {
                $state.go('app.financereporttab.revenuesummary');
            }
            if ($scope.Context == 'financedashboard') {
                $state.go('app.financedashboard');
            }

        };
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            // $scope.GetFacilityDashboardOptions();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "ServiceCategory" },
                {
                    "Key": "Facility",
                    Request: {
                        Params: [{
                            Key: 4,
                            Value: true
                        }]
                    }
                }
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
    RevenueSummaryByCategoryController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();