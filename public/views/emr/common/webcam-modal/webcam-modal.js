(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('webcamModalController', webcamModalController);

function webcamModalController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
    var vm = this;

    $scope.webcamconfig = {
        base64string : ''
    };


    $scope.currentcontext =  {
        ismodal : modalConfig && modalConfig.params ? true : false
    };
    
    if (modalConfig && modalConfig.params) {
        $scope.webcamconfig.patientid = parseInt(modalConfig.params.pid);

        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;
    }
    
    $scope.doneAction = function () {
        $scope.confirmCallback($scope.webcamconfig.base64string);
    }
    
}

webcamModalController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();