(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('admissionprintController', admissionprintController);

    function admissionprintController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {};

        $scope.currentcontext = {};

        $scope.cancelCallback = $uibModalInstance.dismiss;

        admissionprintController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

    }
})();