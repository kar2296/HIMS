(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('workOrderAttachmentListController', workOrderAttachmentListController);

function workOrderAttachmentListController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
    var vm = this;

    $scope.attachmentconfig = {

    };

    $scope.currentcontext =  {
        ismodal : modalConfig && modalConfig.params ? true : false
    };

    if (modalConfig && modalConfig.params) {
        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;

        var attConfig = {};
        attConfig.patientid = parseInt(modalConfig.params.pid);
        attConfig.workorderid = parseInt(modalConfig.params.woid);

        if(modalConfig.params.wodid) {
            attConfig.workorderdetailid = parseInt(modalConfig.params.wodid);
        }
        attConfig.readonly = modalConfig.params.readonly || false;
        $scope.attachmentconfig = attConfig;


    }

    $scope.backToList = function () {
        if($scope.currentcontext.ismodal) {
            $scope.confirmCallback();
        }
    }
}

workOrderAttachmentListController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();