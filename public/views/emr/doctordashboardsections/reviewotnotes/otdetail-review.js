(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('OtDetailReviewController', OtDetailReviewController);

    function OtDetailReviewController($scope, $stateParams, $state, $translate, utl, $filter) {
        var vm = this;

        vm.orders = [];
        $scope.item = {};
        $scope.currentcontext = {};

        $scope.currentcontext.id = parseInt($stateParams.id);
        $scope.currentcontext.eid = parseInt($stateParams.eid);
        $scope.currentcontext.pid = parseInt($stateParams.pid);

        //getList
        $scope.getListCallback = function (scope, res, options, hasError) {
            vm.orders = res.Data;
            $scope.otregister = vm.orders
        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 0, Value: $scope.currentcontext.id },
                ]
            };
            var options = {
                action: 'OtManagement/SurgeryEntry/GetSurgeryEntrys',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.backToList = function () {
            $state.go('app.otdoctornotes');
        }
        $scope.reviewlist = function () {
            $scope.saveItem();
        }
        $scope.saveItemCallback = function (scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('Order Reviewed Successfully'));
            // $scope.backtoList();
        };
        $scope.saveItem = function () {
            var lines = getLinesForSave();
            var actionName = 'OtManagement/OtRegister/AddOtRegister';
            if ($scope.currentcontext.id && $scope.currentcontext.id > 0) {
                actionName = 'OtManagement/OtRegister/UpdateOtRegisterReview';
            }
            var options = {
                action: actionName,
                data: { Data: $scope.item },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        };
        function getLinesForSave() {
            var result = [];
            for (var idx in vm.orders) {
                var item = vm.orders[idx];
                item.PatientId = item.PatientId;
                item.ReviewStatusId = 1;
                if (item.Id > 0) {
                    $scope.item.ReviewStatusId = item.ReviewStatusId;
                    $scope.item.Id = item.Id
                }
            }
            return result;
        }
        $scope.print = function () {

            var inputData = {
                Id: $scope.currentcontext.id
            };
            var options = {
                action: 'OtManagement/OtRegister/PrintOtRegister',
                data: inputData,
                type: 'post'
            };
            utl.Http.doDownload(options);
        }
        //Lookup
        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getDetails();
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

        $scope.getList();
    }

    OtDetailReviewController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$filter'];

})();