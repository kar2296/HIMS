(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('dispenseworkListHistoryController', dispenseworkListHistoryController);

    function dispenseworkListHistoryController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            Name: ''
        };
        $scope.historyprofile = [];
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };
        $scope.currentcontext.hid = parseInt(modalConfig.params.hid);

        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;
        // $scope.currentcontext.id = parseInt(modalConfig.params.id);
        $scope.item.HistoryId = $scope.currentcontext.hid;

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.historyprofile = res.Data;
        };
        $scope.getList = function (pageNo) {

            var inputData = {
                Params: [
                   { Key: 0, Value: $scope.item.HistoryId },
                ],

            };
            var options = {
                action: 'IPManagement/PatientStockRequests/GetPatientStockRequests',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.backToList = function () {
            $scope.confirmCallback();
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
            // $scope.loadData();
        }

        $scope.initLookup = function () {
            var inputData = [
                { "Key": "OrderStatus" }
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
        // loadData();
    }

    dispenseworkListHistoryController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();