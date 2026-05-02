(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('CancelRemarksController', CancelRemarksController);

    function CancelRemarksController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {
            Name: ''
        };
        $scope.ordertat = [];
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };
        // $scope.currentcontext.pid = parseInt(modalConfig.params.pid);
        // $scope.currentcontext.eid = parseInt(modalConfig.params.eid);
        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;



        // $scope.saveItemCallback = function (scope, data, options, hasError) {
        //     utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
        //     $scope.confirmCallback();
        // };

        $scope.saveItem = function () {
            if(!$scope.item.CancelReason) return;
            $scope.confirmCallback($scope.item.CancelReason);
        }

        // $scope.lookupCallback = function (scope, data, options, hasError) {
        //     $scope.lookup = hasError ? {} : data;
        //     $scope.getItem();
        // }

        // $scope.initLookup = function () {
        //     var inputData = [{
        //         "Key": "BillingStatus"
        //     }, ]
        //     var options = {
        //         action: 'General/Options/getoptions',
        //         data: inputData,
        //         type: 'post',
        //         onComplete: $scope.lookupCallback
        //     };
        //     utl.Http.doAction(options);
        // }
        // $scope.initLookup();
    }

    CancelRemarksController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();