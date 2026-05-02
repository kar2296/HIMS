(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('newassetdashboardController', newassetdashboardController);

    function newassetdashboardController($scope, $filter, $stateParams, $state, $translate, utl) {
        var vm = this;
        angular.extend(this, utl.Ctrl.getPrivilegeCtrl({
            $scope: $scope
        }));
        $scope.AssetMaintanance = [];
        $scope.AssetTickets = [];
        $scope.AssetAMCExpiry = [];
        $scope.AssetWarrentyExpiry = [];
        $scope.Items = [];
        $scope.AssetPMCExpiry = [];
        $scope.Calibration = [];
        $scope.AssetTransfer = [];
        $scope.AssetDispose = [];
        $scope.Assetbreakdowntickets = [];
        $scope.AccessoriesWarrantyExpiry = [];
        $scope.Items.AssetCount = 0;
        $scope.Items.AssetCountforallbranches = 0;
        $scope.Items.InactiveAssetCount = 0;
        $scope.Items.RaisedAssetTicketCount = 0;
        $scope.Items.AllTicketCount = 0;
        $scope.Items.AssetDisposeCount = 0;
        $scope.Items.AssetAuditCount = 0;
        $scope.Items.AssetWarrentyCount = 0;


        $scope.currentfilter = {
            FromDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 00:00:00'),
            ToDate: $filter('date')(utl.Formatter.getCurrentDate(), 'yyyy-MM-dd 23:59:59'),
            FromDepartmentId: parseInt(utl.Session.getCurrentDepartmentId()),
            DepartmentId: parseInt(utl.Session.getCurrentDepartmentId()),
            FacilityId: utl.Session.getCurrentFacilityId(),
            FromFacilityId: utl.Session.getCurrentFacilityId(),
            // AssetTypeId: parseInt(utl.Session.getCurrentTicketTypeId()),
            // TicketTypeId: parseInt(utl.Session.getCurrentTicketTypeId()),
            From: utl.Formatter.addMonths(utl.Formatter.getCurrentDate(), -1),
            To: utl.Formatter.getCurrentDate()
        };

        var today = new Date();
        $scope.currentfilter.MonthStart = today;
        $scope.currentfilter.firstDay = new Date($scope.currentfilter.MonthStart.getFullYear(), $scope.currentfilter.MonthStart.getMonth(), 1);
        $scope.currentfilter.lastDay = new Date($scope.currentfilter.MonthStart.getFullYear(), $scope.currentfilter.MonthStart.getMonth() + 1, 0);

        $scope.GetAssetDashboardHeadingCallBack = function (scope, res, options, hasError) {
            $scope.Items.AssetCount = res.assetbo.AssetCount;
            $scope.Items.AssetCountforallbranches = res.assetbo.AssetCountforallbranches;
            $scope.Items.InactiveAssetCount = res.assetbo.InactiveAssetCount;
            $scope.Items.AssetDisposeCount = res.assetdisposebo.AssetDisposeCount;
            $scope.Items.AssetAuditCount = res.assetauditbo.AssetAuditCount;
            $scope.Items.AssetWarrentyCount = res.assetwarrentybo.AssetWarrentyCount;
            if (!$scope.Items.AssetCount)
                $scope.Items.AssetCount = '0';
            if (!$scope.Items.AssetCountforallbranches)
                $scope.Items.AssetCountforallbranches = '0';
            if (!$scope.Items.InactiveAssetCount)
                $scope.Items.InactiveAssetCount = '0';
            if (!$scope.Items.AssetDisposeCount)
                $scope.Items.AssetDisposeCount = '0';
            if (!$scope.Items.AssetAuditCount)
                $scope.Items.AssetAuditCount = '0';
            if (!$scope.Items.AssetWarrentyCount)
                $scope.Items.AssetWarrentyCount = '0';

            console.clear();
            const response = res.assetwarrentybo;
            const labelData = [];
            const chartDataSets = [{
                label: "AMC",
                backgroundColor: "#75dbe0",
                data: []
            },
            {
                label: "Warranty",
                backgroundColor: "#f74851",
                data: []
            },
            {
                label: "PMC",
                backgroundColor: "#60e076",
                data: []
            }];

            console.clear();
            const departItems = [];
            const deptIds = [];

            for (var key in response) {
                if (response.hasOwnProperty(key)) {
                    const oneItem = response[key];
                    if (oneItem.length > 0) {
                        labelData.push(oneItem[0].DepartmentName);
                        deptIds.push({
                            id: oneItem[0].DepartmentId,
                            warrenty: 0,
                            amc: 0,
                            pmc: 0
                        })
                        oneItem.forEach(i => {
                            departItems.push(i);
                        });
                    }
                }
            }

            deptIds.forEach(i => {
                departItems.forEach(child => {
                    if (child.DepartmentId === i.id) {
                        if (child.WarrantyTypeId === 1) {
                            i.amc = child.WarrantyTypeCount;
                        }

                        if (child.WarrantyTypeId === 2) {
                            i.pmc = child.WarrantyTypeCount;
                        }

                        if (child.WarrantyTypeId === 3) {
                            i.warrenty = child.WarrantyTypeCount;
                        }
                    }
                });
            });

            deptIds.forEach(i => {
                chartDataSets[0].data.push(i.amc);
                chartDataSets[1].data.push(i.warrenty);
                chartDataSets[2].data.push(i.pmc);
            })

            const formattedChartData = {
                type: 'bar',
                data: {
                    labels: labelData,
                    datasets: chartDataSets
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            };

            var ctx = document.getElementById('myChart');
            var myChart = new Chart(ctx, formattedChartData);

        };
        $scope.getList = function () {
            var inputData = {
                Data: {
                    Keys: [{ Key: 'assetbo' }, { Key: 'assetdisposebo' }, { Key: 'assetauditbo' }, { Key: 'assetwarrentybo' }]
                },
                Attributes: $scope.currentfilter
            };

            var options = {
                action: 'AssetManagement/AssetDashboard/GetAssetDashboardOptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.GetAssetDashboardHeadingCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.getRaisedTicketCallBack = function (scope, res, options, hasError) {
            $scope.Items.RaisedAssetTicketCount = res.raisedticketbo.RaisedAssetTicketCount;
            $scope.Items.AllTicketCount = res.allticketsbo.AllTicketCount;
            if (!$scope.Items.RaisedAssetTicketCount)
                $scope.Items.RaisedAssetTicketCount = '0';
            if (!$scope.Items.AllTicketCount)
                $scope.Items.AllTicketCount = '0';
        };

        $scope.getRaisedTicket = function () {
            var inputData = {
                Data: {
                    Keys: [{ Key: 'raisedticketbo' }, { Key: 'allticketsbo' }]
                },
                Attributes: $scope.currentfilter
            };

            var options = {
                action: 'AssetManagement/AssetDashboard/GetRaisedTicketDashboardOptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getRaisedTicketCallBack
            };
            utl.Http.doAction(options);
        };

        $scope.getAssetMaintananceCallback = function (scope, res, options, hasError) {
            $scope.AssetMaintanance = res.Data;
        };

        $scope.getAssetMaintanance = function () {
            var inputData = {
                Params: [],
            };

            var options = {
                action: 'AssetManagement/AssetMaintanance/GetAssetMaintanances',
                data: inputData,
                type: 'post',
                onComplete: $scope.getAssetMaintananceCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getAssetTicketsCallback = function (scope, res, options, hasError) {
            $scope.AssetTickets = res.Data;
        };

        $scope.getAssetTickets = function () {
            var inputData = {
                Params: [{
                    Key: 20,
                    Value: $scope.currentfilter.AssetTicketStatusId
                },],
            };

            var options = {
                action: 'AssetManagement/ServiceRequest/GetServiceRequests',
                data: inputData,
                type: 'post',
                onComplete: $scope.getAssetTicketsCallback
            };
            utl.Http.doAction(options);
        };

        $scope.TicketTypeStatus = function (TicketType) {
            if (TicketType == 1) {
                $scope.currentfilter.AssetTicketStatusId = 2;
            }
            if (TicketType == 2) {
                $scope.currentfilter.AssetTicketStatusId = [3, 4, 5];
            }
            if (TicketType == 3) {
                $scope.currentfilter.AssetTicketStatusId = 7;
            }
            if (TicketType == 4) {
                $scope.currentfilter.AssetTicketStatusId = 8;
            }
            $scope.getAssetTickets();
        }
        $scope.CallAssetRegister = function () {
            $state.go('app.assetregview')
        };
        $scope.getAmcexpiryCallback = function (scope, res, options, hasError) {
            $scope.AssetAMCExpiry = res.Data;
        };
        $scope.getAmcexpiry = function () {
            var From = $filter('date')($scope.currentfilter.firstDay, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.lastDay, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
                        Key: 1,
                        Value: 1
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.ActiveStatusId
                    },
                    {
                        Key: 6,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 12,
                        Value: $scope.currentfilter.AssetTypeId
                    },
                    // {
                    //     Key: 13,
                    //     Value: $scope.currentfilter.DepartmentId
                    // },
                    {
                        Key: 10,
                        Value: From
                    },
                    {
                        Key: 11,
                        Value: To
                    },
                    {
                        Key: 4,
                        Value: 2
                    },

                ],

            };

            var options = {
                action: 'AssetManagement/Assetwarranty/GetAssetWarranties',
                data: inputData,
                type: 'post',
                onComplete: $scope.getAmcexpiryCallback
            };

            utl.Http.doAction(options);

        };

        $scope.getPMCexpiryCallback = function (scope, res, options, hasError) {
            $scope.AssetPMCExpiry = res.Data;
        };
        $scope.getPMCexpiry = function () {
            var From = $filter('date')($scope.currentfilter.firstDay, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.lastDay, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
                        Key: 1,
                        Value: 2
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.ActiveStatusId
                    },
                    {
                        Key: 6,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 12,
                        Value: $scope.currentfilter.AssetTypeId
                    },
                    // {
                    //     Key: 13,
                    //     Value: $scope.currentfilter.DepartmentId
                    // },
                    {
                        Key: 10,
                        Value: From
                    },
                    {
                        Key: 11,
                        Value: To
                    },
                    {
                        Key: 4,
                        Value: 2
                    },
                ],
            };

            var options = {
                action: 'AssetManagement/Assetwarranty/GetAssetWarranties',
                data: inputData,
                type: 'post',
                onComplete: $scope.getPMCexpiryCallback
            };

            utl.Http.doAction(options);

        };

        $scope.getCalibrationCallback = function (scope, res, options, hasError) {
            $scope.Calibration = res.Data;
        };
        $scope.getCalibration = function () {
            var From = $filter('date')($scope.currentfilter.firstDay, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.lastDay, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
                        Key: 1,
                        Value: 5
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.ActiveStatusId
                    },
                    {
                        Key: 6,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 12,
                        Value: $scope.currentfilter.AssetTypeId
                    },
                    // {
                    //     Key: 13,
                    //     Value: $scope.currentfilter.DepartmentId
                    // },
                    {
                        Key: 10,
                        Value: From
                    },
                    {
                        Key: 11,
                        Value: To
                    },
                    {
                        Key: 4,
                        Value: 2
                    },
                ],
            };

            var options = {
                action: 'AssetManagement/Assetwarranty/GetAssetWarranties',
                data: inputData,
                type: 'post',
                onComplete: $scope.getCalibrationCallback
            };

            utl.Http.doAction(options);

        };

        $scope.getWarrentyexpiryCallback = function (scope, res, options, hasError) {
            $scope.AssetWarrentyExpiry = res.Data;
        };
        $scope.getWarrentyexpiry = function () {
            var From = $filter('date')($scope.currentfilter.firstDay, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.lastDay, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
                        Key: 1,
                        Value: 3
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.ActiveStatusId
                    },
                    {
                        Key: 6,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 12,
                        Value: $scope.currentfilter.AssetTypeId
                    },
                    // {
                    //     Key: 13,
                    //     Value: $scope.currentfilter.DepartmentId
                    // },
                    {
                        Key: 10,
                        Value: From
                    },
                    {
                        Key: 11,
                        Value: To
                    },
                    {
                        Key: 4,
                        Value: 2
                    },
                ],

            };

            var options = {
                action: 'AssetManagement/Assetwarranty/GetAssetWarranties',
                data: inputData,
                type: 'post',
                onComplete: $scope.getWarrentyexpiryCallback
            };

            utl.Http.doAction(options);

        };

        $scope.getassettransferCallback = function (scope, res, options, hasError) {
            $scope.AssetTransfer = res.Data;
        };
        $scope.getassettransfer = function () {
            var inputData = {
                Params: [
                    {
                        Key: 1,
                        Value: $scope.currentfilter.FromDepartmentId
                    },
                    {
                        Key: 6,
                        Value: $scope.currentfilter.FromFacilityId
                    },

                ],
            };
            var options = {
                action: 'AssetManagement/AssetTransfer/GetAssetTransfers',
                data: inputData,
                type: 'post',
                onComplete: $scope.getassettransferCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getassetdisposeCallback = function (scope, res, options, hasError) {
            $scope.AssetDispose = res.Data;
        };

        $scope.getassetdispose = function () {
            var From = $filter('date')($scope.currentfilter.firstDay, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.lastDay, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    {
                        Key: 8,
                        Value: $scope.currentfilter.AssetTypeId
                    },
                    {
                        Key: 5,
                        Value: $scope.currentfilter.FacilityId
                    },
                    {
                        Key: 6,
                        Value: From
                    },
                    {
                        Key: 7,
                        Value: To
                    },
                ]
            };

            var options = {
                action: 'AssetManagement/AssetDispose/GetAssetDisposes',
                data: inputData,
                type: 'post',
                onComplete: $scope.getassetdisposeCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getNewAssetsCallback = function (scope, res, options, hasError) {
            $scope.NewAssets = res.Data;
        };

        $scope.getNewAssets = function () {
            var From = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [{
                    Key: 23,
                    Value: $scope.currentfilter.DepartmentId
                },
                {
                    Key: 1,
                    Value: $scope.currentfilter.AssetTypeId
                },
                {
                    Key: 20,
                    Value: From
                },
                {
                    Key: 21,
                    Value: To
                }
                ],
            };

            var options = {
                action: 'AssetManagement/Asset/GetAssets',
                data: inputData,
                type: 'post',
                onComplete: $scope.getNewAssetsCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getbreakdownticketCallback = function (scope, res, options, hasError) {
            $scope.Assetbreakdowntickets = res.Data;
        };

        $scope.getbreakdownticket = function () {
            var TicketFrom = $filter('date')($scope.currentfilter.FromDate, 'yyyy-MM-dd 00:00:00') || null;
            var TicketTo = $filter('date')($scope.currentfilter.ToDate, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    { Key: 7, Value: $scope.currentfilter.TicketTypeId },
                    { Key: 4, Value: $scope.currentfilter.FacilityId },
                    { Key: 2, Value: [1, 2] },
                    {
                        Key: 18,
                        Value: TicketFrom
                    },
                    {
                        Key: 19,
                        Value: TicketTo
                    },
                ],
            };
            var options = {
                action: 'TicketManagement/TicketManagement/GetTicketManagements',
                data: inputData,
                type: 'post',
                onComplete: $scope.getbreakdownticketCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getAccessoriesWarrentyexpiryCallback = function (scope, res, options, hasError) {
            $scope.AccessoriesWarrantyExpiry = res.Data;
        };
        $scope.getAccessoriesWarrentyexpiry = function () {
            var From = $filter('date')($scope.currentfilter.firstDay, 'yyyy-MM-dd 00:00:00') || null;
            var To = $filter('date')($scope.currentfilter.lastDay, 'yyyy-MM-dd 23:59:59') || null;
            var inputData = {
                Params: [
                    // {
                    //     Key: 2,
                    //     Value: $scope.currentfilter.FacilityId
                    // },
                    {
                        Key: 5,
                        Value: From
                    },
                    {
                        Key: 6,
                        Value: To
                    },
                    {
                        Key: 4,
                        Value: $scope.currentfilter.AssetTypeId
                    },
                    {
                        Key: 7,
                        Value: $scope.currentfilter.DepartmentId
                    },
                ],

            };

            var options = {
                action: 'AssetManagement/AssetAccessories/GetAssetAccessoriess',
                data: inputData,
                type: 'post',
                onComplete: $scope.getAccessoriesWarrentyexpiryCallback
            };

            utl.Http.doAction(options);

        };



        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
            // $scope.getRaisedTicket();

        }

        $scope.initLookup = function () {
            var inputData = [];
            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        }
        $scope.initLookup();
        $scope.getAmcexpiry();
        $scope.getPMCexpiry();
        $scope.getWarrentyexpiry();
        $scope.getassettransfer();
        $scope.getassetdispose();
        // $scope.getbreakdownticket();
        $scope.getCalibration();
        $scope.getAccessoriesWarrentyexpiry();
    }
    newassetdashboardController.$inject = ['$scope', '$filter', '$stateParams', '$state', '$translate', 'utl'];

})();