(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PatientReturnProfileController', PatientReturnProfileController);

    function PatientReturnProfileController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            PatientReturnId: -1
        };

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        $scope.currentcontext.prid = parseInt(modalConfig.params.prid);

        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;

        $scope.item.PatientReturnId = $scope.currentcontext.prid;

        $scope.getListCallback = function (scope, data, options, hasError) {
            $scope.item = data.Data[0];
            $scope.item.WardName = '';
            if ($scope.item.WardMaster) {
                $scope.item.WardName = $scope.item.WardMaster.WardName;
            }
            $scope.item.RoomName = '';
            if ($scope.item.WardRoomMaster) {
                $scope.item.RoomName = $scope.item.WardRoomMaster.RoomNo;
            }

            if ($scope.item.PatientReturnStatusId == 1) {
                $scope.item.DisplayRequestStatus = 'Draft';
            } else if ($scope.item.PatientReturnStatusId == 2) {
                $scope.item.DisplayRequestStatus = 'Return Requested';
            } else if ($scope.item.PatientReturnStatusId == 3) {
                $scope.item.DisplayRequestStatus = 'Authorized';
            } else if ($scope.item.PatientReturnStatusId == 4) {
                $scope.item.DisplayRequestStatus = 'Partially Received';
            } else if ($scope.item.PatientReturnStatusId == 5) {
                $scope.item.DisplayRequestStatus = 'Received';
            } else if ($scope.item.PatientReturnStatusId == 6) {
                $scope.item.DisplayRequestStatus = 'Cancelled';
            }
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 0, Value: $scope.currentcontext.prid }
                ],

            };
            var options = {
                action: 'IPManagement/PatientStockReturns/GetPatientStockReturns',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };
            utl.Http.doAction(options);

        };

        $scope.backToList = function () {
            $scope.confirmCallback();
        };

        function loadData() {
            $scope.getList();
        }

        $scope.lookupCallback = function (scope, data, options, hasError) {
            $scope.lookup = hasError ? {} : data;
            $scope.getList();
        };

        $scope.initLookup = function () {
            var inputData = [];

            var options = {
                action: 'General/Options/getoptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.lookupCallback
            };
            utl.Http.doAction(options);
        };

        $scope.initLookup();

        loadData();
    }

    PatientReturnProfileController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();