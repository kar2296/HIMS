(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('patientAttachmentListController', patientAttachmentListController);

function patientAttachmentListController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
    var vm = this;

    $scope.attachmentconfig = {
        objecttypeid : 1 //Patient
    };

     $scope.cancelCallback = $uibModalInstance.dismiss;

    $scope.currentcontext =  {
        ismodal : modalConfig && modalConfig.params ? true : false
    };

    if (modalConfig && modalConfig.params) {
        $scope.attachmentconfig.patientid = parseInt(modalConfig.params.pid);
        $scope.attachmentconfig.itemid = modalConfig.params.itemid ? parseInt(modalConfig.params.itemid) : 0;

        if(modalConfig.params.objecttypeid) {
            $scope.attachmentconfig.objecttypeid = parseInt(modalConfig.params.objecttypeid);
        }

        if(modalConfig.params.encounterid) {
            $scope.attachmentconfig.encounterid = parseInt(modalConfig.params.encounterid);
        }


        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;
    }

    $scope.backToList = function () {
        if($scope.currentcontext.ismodal) {
            $scope.confirmCallback();
        }
    }
}

patientAttachmentListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();