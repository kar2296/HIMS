(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('pendingPrescriptionListController', pendingPrescriptionListController);

    function pendingPrescriptionListController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.items = [];
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false,
            pid: 0
        };

        if ($scope.currentcontext.ismodal) {
            $scope.currentcontext.pid = modalConfig.params.id;

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.toggleCanShowDetails = function(clickedItem) {
            for (var idx in $scope.items) {
                var item = $scope.items[idx];
                if (item.Id == clickedItem.Id) {
                    item.CanShowDetails = !item.CanShowDetails;
                } else {
                    item.CanShowDetails = false;
                }
            }
        };

        $scope.getListCallback = function(scope, res, options, hasError) {
            $scope.items = res.Data;

            for (var idx in $scope.items) {
                var item = $scope.items[idx];
                if (idx === 0) {
                    item.CanShowDetails = true;
                } else {
                    item.CanShowDetails = false;
                }
            }
        };

        $scope.getList = function() {

            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid },
                    { Key: 11, Value: 1 },
                    { Key: 6, Value: 3},
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/prescription/GetPrescriptions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.editPrescriptionDetail = function(item) {
            $scope.confirmCallback({ Id: item.Id, PatientId: item.PatientId });
        };

        $scope.handleEvents = function(actionType, row) {};

        $scope.getList();
    }

    pendingPrescriptionListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();