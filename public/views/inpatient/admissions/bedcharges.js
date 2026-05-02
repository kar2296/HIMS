(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('bedChargesListController', bedChargesListController);

    function bedChargesListController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, $filter) {
        var vm = this;
        $scope.currentcontext = {};
        $scope.RoomChargeDetails = [];
        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.id = parseInt(modalConfig.params.id);
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.BedInfo = res;
        };


        $scope.getList = function () {
            var options = {
                action: 'GeneralMaster/WardRoomServiceMap/GetRoomChargesDetails',
                data: { Id: $scope.currentcontext.id },
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getList();
    }

    bedChargesListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', '$filter'];

})();