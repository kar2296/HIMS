(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('pendingIndentListController', pendingIndentListController);

    function pendingIndentListController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
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

        $scope.toggleCanShowDetails = function (clickedItem) {
            for (var idx in $scope.items) {
                var item = $scope.items[idx];
                if (item.Id == clickedItem.Id) {
                    item.CanShowDetails = !item.CanShowDetails;
                } else {
                    item.CanShowDetails = false;
                }
            }
        };

        $scope.getListCallback = function (scope, res, options, hasError) {
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

        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 5, Value: $scope.currentcontext.pid },
                    { Key: 4, Value: 2 },
                    { Key: 18, Value: 1 },
                    { Key: 9, Value: 1 },
                    {
                        Key: 8,
                        Value: utl.Session.getCurrentFacilityId()
                    }
                ],
                PageContext: {
                    PageSize: -1,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'IPManagement/PatientStockRequests/GetPatientStockRequests',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.loadData = function (item) {
            $scope.confirmCallback({ Id: item.Id, PatientId: item.PatientId });
        };

        $scope.handleEvents = function (actionType, row) { };

        $scope.getList();
    }

    pendingIndentListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();