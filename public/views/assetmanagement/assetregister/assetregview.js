(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('AssetRegViewController', AssetRegViewController);

    function AssetRegViewController($scope, $stateParams, $state, $translate, utl) {
        var vm = this;

        $scope.Items = [];
        $scope.currentfilter = {
            AssetTypeId: -1,
            AssetCategoryId: -1,
            ActiveStatusId: 2,
            DepartmentId: -1,
            EmployeeId: utl.Session.getCurrentUserId(),
        };
        $scope.currentcontext = {};
        $scope.Asset_dashboard = function () {
            $state.go('app.newassetdashboard')
        };

        $scope.currentcontext = {
            // ismodal: modalConfig && modalConfig.params ? true : false
        };
        // $scope.currentcontext.id = parseInt(modalConfig.params.id.id);

        // $scope.confirmCallback = $uibModalInstance.close;
        // $scope.cancelCallback = $uibModalInstance.dismiss;

        $scope.warrentyitem = {};
        $scope.insuranceitem = {};


        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.item = res.Data[0];
            $scope.getWarrentyList();
            $scope.getInsuranceList();
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    {
                        Key: 0,
                        Value: $scope.currentcontext.id
                    },
                ],
            };

            var options = {
                action: 'AssetManagement/Asset/GetAssets',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.getWarrentyListCallback = function (scope, res, options, hasError) {
            $scope.warrentyitem = res.Data[0];
            // vm.gridConfig.pagerObj.totalItems = res.PageContext.TotalRecords;
        };

        $scope.getWarrentyList = function () {
            var inputData = {

                Params: [

                    {
                        Key: 5,
                        Value: $scope.currentcontext.id
                    },
                ],
            };

            var options = {
                action: 'AssetManagement/Assetwarranty/GetAssetWarranties',
                data: inputData,
                type: 'post',
                onComplete: $scope.getWarrentyListCallback
            };

            utl.Http.doAction(options);

        };

        $scope.getInsuranceListCallback = function (scope, res, options, hasError) {
            $scope.insuranceitem = res.Data[0];
        };

        $scope.getInsuranceList = function () {
            var inputData = {

                Params: [
                    {
                        Key: 2,
                        Value: $scope.currentcontext.id
                    },
                ],

            };

            var options = {
                action: 'AssetManagement/AssetInsurance/GetAssetInsurances',
                data: inputData,
                type: 'post',
                onComplete: $scope.getInsuranceListCallback
            };

            utl.Http.doAction(options);

        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }
        $scope.backToList = function () {
            $scope.confirmCallback();
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.backToList();
        };
        $scope.initLookup = function () {
            // var curdeptids = utl.Session.getUserDepartments();
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
    }

    AssetRegViewController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl'];

})();