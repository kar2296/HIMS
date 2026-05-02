(function() {
    'use strict';

    angular
        .module('app.pages')
        .controller('EditDischargeDateController', EditDischargeDateController);

    function EditDischargeDateController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;
        $scope.item = {};
        $scope.currentcontext = {
            ismodal: modalConfig && modalConfig.params ? true : false
        };
        $scope.currentcontext.eid = parseInt(modalConfig.params.eid);
        $scope.item.DischargeDate = modalConfig.params.discdate;
        $scope.confirmCallback = $uibModalInstance.close;
        $scope.cancelCallback = $uibModalInstance.dismiss;
        $scope.item.Id = $scope.currentcontext.eid;

        $scope.saveItemCallback = function(scope, data, options, hasError) {
            utl.Alert.showSuccessMsg($translate.instant('common.successmsg.lbl'));
            $scope.confirmCallback();
        };

        $scope.saveDate = function() {
            var options = {
                action: 'Visit/Visit/UpdateEncounter',
                data: {
                    Data: $scope.item,
                },
                type: 'post',
                onComplete: $scope.saveItemCallback
            };
            utl.Http.doAction(options);
        }
    }

    EditDischargeDateController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();