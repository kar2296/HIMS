(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('DrugProfileController', DrugProfileController);

    function DrugProfileController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            Name: ''
        };
        $scope.item = [];

        //$scope.vendorprofile = [];
        $scope.drugAlerts = {}
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };
        $scope.currentcontext.drugid = parseInt(modalConfig.params.drugid);

        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;

        $scope.item.DrugMasterId = $scope.currentcontext.drugid;

        $scope.getdrugLogoCallback = function (scope, data, options, hasError) {
            $scope.currentcontext.Logo = data.Logo;
        };
        $scope.getdrugLogo = function () {
            if($scope.item.LogoPath) {
                var inputData = { Id : $scope.item.Id, LogoPath : $scope.item.LogoPath };
                var options = {
                    action: 'clinicalmaster/DrugMaster/GetDrugLogo',
                    data: { Data : inputData },
                    type: 'post',
                    onComplete: $scope.getdrugLogoCallback
                };
                utl.Http.doAction(options);
            }
        };

        $scope.getListCallback = function (scope, data, options, hasError) {
            $scope.item = data.Data[0];
            $scope.getAlert();
            $scope.getdrugLogo();
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 0, Value: $scope.currentcontext.drugid }
                ],

            };
            var options = {
                action:  'clinicalmaster/DrugMaster/GetDrugMasters',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);

        };

        $scope.getAlertCallback = function (scope, res, options, hasError) {
            $scope.drugAlerts = res[0];
        };

        $scope.getAlert = function () {
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.drugid }
                ],

            };
            var options = {
                action: 'clinicalmaster/DrugAlert/GetDrugAlerts',
                data: inputData,
                type: 'post',
                onComplete: $scope.getAlertCallback
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

    DrugProfileController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();