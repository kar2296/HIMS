(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('dynamicFormModalController', dynamicFormModalController);

    function dynamicFormModalController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.modeldata = {};
        $scope.schema = {};
        $scope.defaultData = {};

        if (modalConfig) {
            $scope.defaultData = JSON.parse(JSON.stringify(modalConfig.defaultdata));

            $scope.schema = modalConfig.schema;
            if (utl.Common.isEmptyJSONObject(modalConfig.modeldata)) {
                $scope.modeldata = JSON.parse(JSON.stringify(modalConfig.defaultdata));
            } else {
                $scope.modeldata = JSON.parse(JSON.stringify(modalConfig.modeldata));
            }

            $scope.handleDynamicFormEvents = modalConfig.handleDynamicFormEvents;
            $scope.confirmCallback = $uibModalInstance.close;
            $scope.cancelCallback = $uibModalInstance.dismiss;
        }

        $scope.actionClick = function (actionType) {

            if (actionType == 'reset') {
                $scope.modeldata = JSON.parse(JSON.stringify($scope.defaultData));;
            }

            $scope.confirmCallback();
            $scope.handleDynamicFormEvents(actionType, $scope.modeldata);
        }
    }

    dynamicFormModalController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

})();