(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('workOrderObservationListController', workOrderObservationListController);

function workOrderObservationListController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
    var vm = this;

    $scope.observationconfig = {
        patientid : parseInt(modalConfig.params.pid),
        workorderid : parseInt(modalConfig.params.woid),
        workorderdetailid : parseInt(modalConfig.params.wodid),
        readonly : modalConfig.params.readonly || false
    };

    $scope.cancelCallback = $uibModalInstance.dismiss;

    $scope.currentcontext =  {
        ismodal : modalConfig && modalConfig.params ? true : false
    };

    if (modalConfig && modalConfig.params) {
        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;
    }

    $scope.backToList = function () {
        if($scope.currentcontext.ismodal) {
            $scope.confirmCallback();
        }
    }
}

workOrderObservationListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();