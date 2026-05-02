(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('previousPrescriptionController', previousPrescriptionController);

    function previousPrescriptionController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.Items = [];

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {
            $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
        } else {
            $scope.currentcontext.pid = parseInt(utl.Session.getEMRPatientId());
        }

        $scope.getListCallback = function (scope, res, options, hasError) {
            $scope.previousPrescriptions = res.Data;
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 2, Value: $scope.currentcontext.pid }
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

        $scope.getList();
    }

    previousPrescriptionController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();