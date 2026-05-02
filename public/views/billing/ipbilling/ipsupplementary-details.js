(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('supplementaryDetailsController', supplementaryDetailsController);

    function supplementaryDetailsController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig, $filter, $timeout) {
        var vm = this;
        $scope.SupplementaryDetails = [];
        if (modalConfig && modalConfig.params) {
            $scope.PatientId = modalConfig.params.pid;
            $scope.EncounterId = modalConfig.params.eid;
            $scope.CategoryId = modalConfig.params.cid;
            $scope.ServiceCategoryName = modalConfig.params.categoryname;
            $scope.IsSupplementary = modalConfig.params.issupplementary;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.getListCallback = function (scope, data, options, hasError) {
            $scope.SupplementaryDetails = [];
            $timeout(function () {
                $scope.SupplementaryDetails = data.Data;
            }, 1000);
        };

        $scope.getList = function () {
            var inputData = {
                Params: [
                    { Key: 4, Value: 3 },
                    { Key: 3, Value: $scope.EncounterId },
                    { Key: 5, Value: $scope.CategoryId },
                    { Key: 12, Value: true }
                ]
            };

            var options = {
                action: 'Billing/PatientBillDetails/GetPatientBillDetails',
                data: inputData,
                type: 'post',
                onComplete: $scope.getListCallback
            };

            utl.Http.doAction(options);
        };
        $scope.getList();



    }

    supplementaryDetailsController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig', '$filter', '$timeout'];

})();