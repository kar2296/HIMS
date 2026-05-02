(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('manualbillController', manualbillController);

    function manualbillController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };

        if (modalConfig && modalConfig.params) {

            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }
        $scope.IsEditable = modalConfig.params.IsEditable;
        $scope.selectedPatient = modalConfig.params.patient;
        $scope.item = {

        }
        $scope.item = modalConfig.params.item;

        $scope.Save = function () {
            $scope.confirmCallback($scope.item);
        }


    }

    manualbillController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();