(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('InventoryAttachmentListController', InventoryAttachmentListController);

function InventoryAttachmentListController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
    var vm = this;

    $scope.attachmentconfig = {
        objecttypeid : 1 //Patient
    };

     $scope.cancelCallback = $uibModalInstance.dismiss;

    $scope.currentcontext =  {
        ismodal : modalConfig && modalConfig.params ? true : false
    };

    if (modalConfig && modalConfig.params) {
        $scope.attachmentconfig.itemid = modalConfig.params.gid ? parseInt(modalConfig.params.gid) : 0;

        if(modalConfig.params.objecttypeid) {
            $scope.attachmentconfig.objecttypeid = parseInt(modalConfig.params.objecttypeid);
        }

        if(modalConfig.params.screenname) {
            $scope.attachmentconfig.screenname = (modalConfig.params.screenname);
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

InventoryAttachmentListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();