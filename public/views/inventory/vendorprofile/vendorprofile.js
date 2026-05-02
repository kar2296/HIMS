(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('VendorProfileController', VendorProfileController);

    function VendorProfileController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            Name: ''
        };
        $scope.item = [];

        //$scope.vendorprofile = [];
        $scope.vendorContact = {}
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };
        $scope.currentcontext.vid = parseInt(modalConfig.params.vid);

        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;

        $scope.item.VendorMasterId = $scope.currentcontext.vid;

        $scope.getListCallback = function (scope, data, options, hasError) {
            $scope.item = data.Data[0];
            $scope.getContact();
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 0, Value: $scope.currentcontext.vid }
                ],

            };
            var options = {
                action: 'pharmacy/vendormaster/GetVendorMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);

        };

        $scope.getContactCallback = function (scope, res, options, hasError) {
            $scope.vendorContact = res.Data[0];
        };

        $scope.getContact = function () {
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.vid }
                ],

            };
            var options = {
                action: 'pharmacy/vendormaster/GetVendorContacts',
                data: inputData,
                type: 'post',
                onComplete: $scope.getContactCallback
            };

            utl.Http.doAction(options);
        };
        $scope.backToList = function () {
            $scope.confirmCallback();
        }
        function loadData() {
            $scope.getList();
        }
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        }

        $scope.initLookup = function () {
            var inputData = [
                // { "Key": "OrderStatus" }
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
        loadData();
    }

    VendorProfileController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();