(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('assetDashboardController', assetDashboardController);

    function assetDashboardController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;
        $scope.rows = [];
        $scope.row = { cols: [] };
        $scope.headerRow = { cols: [] };

        $scope.Items = {

        };

        $scope.Items.AssetCount = '0';
        $scope.Items.AssetTransferCount = '0';
        $scope.Items.TicketCount = '0';
        $scope.Items.AssetAuditCount = '0';
        $scope.currentcontext = {};

        $scope.currentfilter = {
        };
         
        $scope.GetAssetDashboardHeadingCallBack = function (scope, res, options, hasError) {
            $scope.Items.AssetCount = res.assetbo.AssetCount;
            $scope.Items.AssetTransferCount = res.assettransferbo.AssetTransferCount;
            $scope.Items.TicketCount = res.servicerequestbo.TicketCount;
            $scope.Items.AssetAuditCount = res.assetauditbo.AssetAuditCount;
            if (!$scope.Items.AssetCount)
                $scope.Items.AssetCount = '0';
            if (!$scope.Items.AssetTransferCount)
                $scope.Items.AssetTransferCount = '0';
            if (!$scope.Items.TicketCount)
                $scope.Items.TicketCount = '0';
            if (!$scope.Items.AssetAuditCount)
                $scope.Items.AssetAuditCount = '0';

        };
        $scope.getList = function () {
            var inputData = {
                Data: {
                    Keys: [{ Key: 'assetbo' }, { Key: 'assettransferbo' }, { Key: 'servicerequestbo' }, { Key: 'assetauditbo' }]
                },
                Attributes: $scope.currentcontext
            };

            var options = {
                action: 'AssetManagement/AssetDashboard/GetAssetDashboardOptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.GetAssetDashboardHeadingCallBack
            };
            utl.Http.doAction(options);
        };
    $scope.More = function () {
            $state.go('app.assets', { id: 0 });
            // $scope.openModal(0);
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
     
        }

        $scope.initLookup = function () {
            var inputData = [

            ];

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

    assetDashboardController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();