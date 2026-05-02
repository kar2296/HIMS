(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('drsharerevenuesummarybydepartmentController', drsharerevenuesummarybydepartmentController);

    function drsharerevenuesummarybydepartmentController($scope, $filter, $stateParams, $state, $translate, utl) {
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
            $scope.DepartmentInfo = res;
            $scope.department = [];
            $scope.totdepartment = [];
            $scope.opdepartment = [];
            $scope.totopdepartment = [];
            $scope.ipdepartment = [];
            $scope.totipdepartment = [];
            $scope.drsharedepartment = [];
            $scope.totdrsharedepartment = [];
            $scope.providersharedepartment = [];
            $scope.totprovidersharedepartment = [];
            if ($scope.DepartmentInfo) {
                var opdepartmentcollection = [];
                var ipdepartmentcollection = [];
                var directdepartmentcollection = [];
                var drsharedepartmentcollection = [];
                var providersharedepartmentcollection = [];

                if ($scope.DepartmentInfo.length > 0)
                    opdepartmentcollection = $scope.DepartmentInfo[0].Value;


                if ($scope.DepartmentInfo.length > 1)
                    ipdepartmentcollection = $scope.DepartmentInfo[1].Value;

                if ($scope.DepartmentInfo.length > 2)
                    directdepartmentcollection = $scope.DepartmentInfo[2].Value;

                if ($scope.DepartmentInfo.length > 3)
                    drsharedepartmentcollection = $scope.DepartmentInfo[3].Value;

                if ($scope.DepartmentInfo.length > 4)
                    providersharedepartmentcollection = $scope.DepartmentInfo[4].Value;

                var opTotNetAmt = 0;
                for (var idx in opdepartmentcollection) {
                    var coll = opdepartmentcollection[idx];
                    var NetAmt = 0;
                    var key = '';
                    for (var idx in coll) {
                        key = coll[idx].DepartmentName;
                        NetAmt += coll[idx].NetAmount;
                    }
                    opTotNetAmt += NetAmt;
                    $scope.opdepartment.push({
                        'Key': key,
                        'Value': NetAmt
                    });
                    $scope.department.push({
                        'Key': key,
                        'Value': {
                            'OP': NetAmt,
                            'IP': 0.00,
                            'DrShare': 0.00,
                            'ProviderShare': 0.00,

                        }
                    });
                }
                $scope.totopdepartment.push({
                    'Key': 'Total',
                    'Value': opTotNetAmt
                });
                var ipTotNetAmt = 0;
                for (var idx in ipdepartmentcollection) {
                    var coll = ipdepartmentcollection[idx];
                    var NetAmt = 0;
                    var key = '';
                    for (var idx in coll) {
                        key = coll[idx].DepartmentName;
                        NetAmt += coll[idx].NetAmount;
                    }
                    ipTotNetAmt += NetAmt;
                    $scope.ipdepartment.push({
                        'Key': key,
                        'Value': NetAmt
                    });

                    var valappended = 0;
                    $scope.department.forEach(function (item) {
                        if (key === item.Key) {
                            item.Value.IP = NetAmt;
                            valappended = 1;
                        }
                    });

                    if (valappended == 0)
                        $scope.department.push({
                            'Key': key,
                            'Value': {
                                'OP': 0.00,
                                'IP': NetAmt,
                                'DrShare': 0.00,
                                'ProviderShare': 0.00,
                            }
                        });

                }
                $scope.totipdepartment.push({
                    'Key': 'Total',
                    'Value': ipTotNetAmt
                });

                var directbillamt = 0;
                var opwithdirectamt = 0;
                for (var idx in directdepartmentcollection) {
                    var coll = directdepartmentcollection[idx];
                    var NetAmt = 0;
                    var key = '';
                    for (var idx in coll) {
                        key = coll[idx].DepartmentName;
                        NetAmt += coll[idx].NetAmount;
                    }
                    directbillamt += NetAmt;

                    $scope.opdepartment.push({
                        'Key': key,
                        'Value': NetAmt
                    });
                    $scope.department.push({
                        'Key': key,
                        'Value': {
                            'OP': NetAmt,
                            'IP': 0.00,
                            'DrShare': 0.00,
                            'ProviderShare': 0.00,
                        }
                    });
                }
                opwithdirectamt = opTotNetAmt + directbillamt;
                $scope.totopdepartment.push({
                    'Key': 'Total',
                    'Value': opwithdirectamt
                });

                var drshareTotNetAmt = 0;
                for (var idx in drsharedepartmentcollection) {
                    var coll = drsharedepartmentcollection[idx];
                    var NetAmt = 0;
                    var key = '';
                    for (var idx in coll) {
                        key = coll[idx].DepartmentName;
                        NetAmt += coll[idx].DrShare;
                    }
                    drshareTotNetAmt += NetAmt;
                    $scope.drsharedepartment.push({
                        'Key': key,
                        'Value': NetAmt
                    });

                    var valappended = 0;
                    $scope.department.forEach(function (item) {
                        if (key === item.Key) {
                            item.Value.DrShare = NetAmt;
                            valappended = 1;
                        }
                    });

                    if (valappended == 0)
                        $scope.department.push({
                            'Key': key,
                            'Value': {
                                'OP': 0.00,
                                'IP': 0.00,
                                'DrShare': NetAmt,
                                'ProviderShare': 0.00,

                            }
                        });

                }
                $scope.totdrsharedepartment.push({
                    'Key': 'Total',
                    'Value': drshareTotNetAmt
                });

                var providershareTotNetAmt = 0;
                for (var idx in providersharedepartmentcollection) {
                    var coll = providersharedepartmentcollection[idx];
                    var NetAmt = 0;
                    var key = '';
                    for (var idx in coll) {
                        key = coll[idx].DepartmentName;
                        NetAmt += coll[idx].ProviderShare;
                    }
                    providershareTotNetAmt += NetAmt;
                    $scope.providersharedepartment.push({
                        'Key': key,
                        'Value': NetAmt
                    });

                    var valappended = 0;
                    $scope.department.forEach(function (item) {
                        if (key === item.Key) {
                            item.Value.ProviderShare = NetAmt;
                            valappended = 1;
                        }
                    });

                    if (valappended == 0)
                        $scope.department.push({
                            'Key': key,
                            'Value': {
                                'OP': 0.00,
                                'IP': 0.00,
                                'DrShare': 0.00,
                                'ProviderShare': NetAmt,
                            }
                        });

                }
                $scope.totprovidersharedepartment.push({
                    'Key': 'Total',
                    'Value': providershareTotNetAmt
                });

                $scope.department.push({
                    'Key': 'Total',
                    'Value': {
                        'OP': opwithdirectamt,
                        'IP': ipTotNetAmt,
                        'DrShare': drshareTotNetAmt,
                        'ProviderShare': providershareTotNetAmt,
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

            var From = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;

            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    DepartmentId: $scope.currentfilter.DepartmentId || 0
                },
            };

            var options = {
                action: 'billing/CollectionBaseRevenue/GetRevenueDepartmentSummary',
                data: inputData,
                type: 'post',
                onComplete: $scope.GetFacilityDashboardOptionsCallBack
            };
            utl.Http.doAction(options);
        };
        $scope.SelectedDepartment = function (selectedItem) {
            $scope.currentfilter.DepartmentName = selectedItem.DepartmentName;
        };
        $scope.print = function () {
            var From = $filter('date')($scope.currentfilter.From, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.To, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Data: {
                    FromDate: From,
                    ToDate: To,
                    FacilityId: utl.Session.getCurrentFacilityId(),
                    DepartmentId: $scope.currentfilter.DepartmentId || 0,
                    DepartmentName: $scope.currentfilter.DepartmentName
                }
            };
            var options = {
                action: 'billing/CollectionBaseRevenue/PrintRevenueSummaryDepartmentReport',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        };
        $scope.onenter = function (data) {
            if (data == undefined) {
                // $scope.getList();
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
                "Key": "Department"
            }, ]
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
    drsharerevenuesummarybydepartmentController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();