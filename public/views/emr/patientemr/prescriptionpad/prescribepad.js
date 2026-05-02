(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('PrescribePadController', PrescribePadController);

function PrescribePadController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
    var vm = this;
    
    $scope.currentcontext =  {
        ismodal : modalConfig && modalConfig.params ? true : false
    };
    
    if (modalConfig && modalConfig.params) {

        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;
    }
    
    $scope.doneAction = function () {
        var signature = $scope.accept();
        if (signature.isEmpty) {
            $scope.cancelCallback();
        } else {
            $scope.confirmCallback(signature.dataUrl);
        }
    }
}

PrescribePadController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();