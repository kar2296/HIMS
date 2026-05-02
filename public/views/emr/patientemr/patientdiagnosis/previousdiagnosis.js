(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('PreDiagnosisHistoryController', PreDiagnosisHistoryController);

    function PreDiagnosisHistoryController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.items = [];
        $scope.currentcontext = {};
        $scope.cancelCallback = $uibModalInstance.dismiss;
        $scope.currentcontext.pid = modalConfig.params.pid;
        $scope.currentcontext.IsPatientCondition = false;

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.items = res.Data;

        };

        $scope.getList = function () {

            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid },
                    { Key: 7, Value: $scope.currentcontext.IsPatientCondition }
                ],
                PageContext: {
                    PageSize: 100,
                    PageNumber: 1
                }
            };

            var options = {
                action: 'emr/patientcondition/GetPatientConditions',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };

        $scope.handleEvents = function (actionType, row) {
        }

        $scope.getList();
    }

    PreDiagnosisHistoryController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();