(function () {
    'use strict';

    angular
        .module('app.pages')
        .controller('housekeeprequestprintController', housekeeprequestprintController);

    function housekeeprequestprintController($scope, $stateParams, $state, $translate, utl, $uibModalInstance, modalConfig) {
        var vm = this;

        $scope.item = {};

        $scope.currentcontext = {};

        $scope.cancelCallback = $uibModalInstance.dismiss;

        housekeeprequestprintController.$inject = ['$scope', '$stateParams', '$state', '$translate', 'utl', '$uibModalInstance', 'modalConfig'];

    }
})();