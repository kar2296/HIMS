(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('AssetProfileController', AssetProfileController);

    function AssetProfileController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            EndDate: utl.Formatter.getCurrentDateWithoutTime()
        };
        $scope.warrantydetails = [];
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false,
            // crntdate: utl.Formatter.getCurrentDateWithoutTime()
        };
        $scope.currentcontext.aid = parseInt(modalConfig.params.aid);
        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;

        $scope.getItemCallback = function (scope, data, options, hasError) {
            $scope.item = data;
            $scope.getassetwarranty();
        };

        $scope.getItem = function (pageNo) {
            var options = {
                action: 'AssetManagement/Asset/GetAssetById',
                data: { Id: $scope.currentcontext.aid },
                type: 'post',
                onComplete: $scope.getItemCallback
            };
            utl.Http.doAction(options);
        };

        $scope.backToList = function () {
            $scope.confirmCallback();
        }
        $scope.getassetwarrantyCallback = function (scope, res, options, hasError) {
            $scope.warrantydetails = res.Data;
        };

        $scope.getassetwarranty = function () {
            var inputData = {
                Params: [
                    { Key: 5, Value: $scope.currentcontext.aid }
                ]
            };
            var options = {
                action: 'AssetManagement/Assetwarranty/GetAssetWarranties',
                data: inputData,
                type: 'post',
                onComplete: $scope.getassetwarrantyCallback
            };
            utl.Http.doAction(options);
        };

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getItem();
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

    }

    AssetProfileController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();